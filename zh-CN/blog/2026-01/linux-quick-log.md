---
lastUpdated: true
commentabled: true
recommended: true
title: awk、tail、grep、sed 日志查询组合拳
description: awk、tail、grep、sed 日志查询组合拳
date: 2026-01-19 10:30:00
pageClass: blog-page-class
cover: /covers/platform.svg
---

对后端开发来说，熟练掌握 Linux 的日志分析命令是基本功，整理几一些基于 tail、less、grep、sed、awk 的日志查询场景，希望能帮你快速定位问题。

## tail

很多新手习惯用 `cat`，但对于大文件，`cat` 会导致屏幕刷屏，还容易把终端卡死。`tail` 才是实时监控的神器。

### 真实场景 A：服务发版启动监控

每次发版重启服务时，我们都需要确认 Spring Boot 是否启动成功，或者有没有初始化报错。

```bash
# -f (follow)：实时追加显示文件尾部内容
tail -f logs/application.log
```

### 真实场景 B：配合测试复现 Bug

测试同学说：我现在点一下按钮，你看看后台有没有报错。

此时不需要看历史日志，只需要盯着最新的输出。

```bash
# 只看最后 200 行，并保持实时刷新，避免被历史日志干扰
tail -n 200 -f logs/application.log
```

## less

如果需要查看之前的日志，推荐使用 `less`。不同于 `vim` 会一次性加载整个文件占用大量内存，`less` 是按需加载，打开几个 G 的文件也极其流畅，且支持向后回溯。

### 真实场景：追查某笔客诉订单

运营反馈：刚才 10 点左右，订单号 `ORD12345678` 支付失败了。

你需要从日志末尾开始，往前反向查找这个订单号。

```bash
less logs/application.log
```

**进入界面后的操作流**：

1. `Shift + G` 先跳到日志最末尾（因为报错通常发生在最近）。
2. `?ORD12345678` 输入问号+订单号，向上反向搜索。
3. `n`：如果当前这行不是关键信息，按 `n` 继续向上找上一次出现的位置。
4. `Shift + F` 如果看着看着，日志又更新了，按这个组合键可以让 `less` 进入类似 `tail -f` 的实时滚动模式；按 `Ctrl + C` 退回浏览模式。

## grep

`grep` 是最常用的搜索命令，但在实际业务中，简单的关键词搜索往往不够用。

### 真实场景 A：还原报错现场（重点）

只看到 `NullPointerException` 这一行往往无法定位问题，我们需要知道报错前的请求参数是什么，报错后的堆栈信息是什么。

此时必须配合 `-C` (Context) 参数。

```bash
# 搜索异常关键字，并显示该行 "前后各 20 行"
grep -C 20 "NullPointerException" logs/application.log
```

### 真实场景 B：全链路追踪 TraceId

微服务我们通常会通过 `TraceId` 串联请求。日志文件可能发生了滚动（Rolling），变成了 `app.log`、`app.log.1`、`app.log.2`。

我们需要在所有日志文件中搜索同一个 TraceId。

```bash
# 搜索当前目录下所有以 app.log 开头的文件
grep "TraceId-20251219001" logs/app.log*
```

### 真实场景 C：统计异常频次

老板问：“Redis 超时异常今天到底发生了多少次？是偶发还是大规模？”

不需要数数，直接统计行数。

```bash
# -c (count)：只统计匹配的行数
grep -c "RedisConnectionException" logs/application.log
```

### 真实场景 D：排除干扰噪音

排查问题时，日志里充斥着大量无关的 `INFO` 心跳日志或健康检查日志，严重干扰视线。

```bash
# -v (invert)：显示不包含 "HealthCheck" 的所有行
grep -v "HealthCheck" logs/application.log
```

## sed

有时候日志非常大，例如有 10GB，grep 搜出来的内容依然过多。如果我们明确知道生产事故发生在 *14:00 到 14:05* 之间，该怎么办？

下载整个日志不现实，`sed` 可以帮我们把这段时间的日志单独切出来，保存成一个小文件慢慢分析。

### 真实场景：导出事故时间窗口的日志

```bash
# 语法：sed -n '/开始时间/,/结束时间/p' 源文件 > 目标文件
# 注意：时间格式必须和日志里的格式完全一致
sed -n '/2025-12-19 14:00/,/2025-12-19 14:05/p' logs/application.log > error_segment.log
```

这样你就得到了一个只有几 MB 的 `error_segment.log`，这时候再下载到本地分析，或者发给同事，都非常方便。

## Awk

`awk` 擅长处理列数据，对于格式规范的日志，如 Nginx 访问日志、Apache 日志，它可以直接在服务器上生成简报。

### 真实场景 A：遭到攻击，查找恶意 IP

服务突然报警 CPU 飙升，怀疑遭到 CC 攻击或爬虫抓取，我们需要分析 Nginx 日志，找出访问量最高的 IP。

假设日志格式第一列是 IP：

```bash
# 1. awk '{print $1}'：提取第一列（IP）
# 2. sort：排序，把相同的 IP 排在一起
# 3. uniq -c：去重并统计每个 IP 出现的次数
# 4. sort -nr：按次数(n)倒序(r)排列
# 5. head -n 10：取前 10 名

awk '{print $1}' access.log | sort | uniq -c | sort -nr | head -n 10
```

### 真实场景 B：找出响应最慢的接口

Nginx 日志中通常记录了响应时间，假设在最后一列，我们想把响应时间超过 1 秒的请求找出来。

```bash
# $NF 代表最后一列
# 打印所有响应时间大于 1 秒的 URL（假设 URL 在第 7 列）
awk '$NF > 1.000 {print $7, $NF}' access.log
```

## 总结

举的例子都是我常用的，建议把这几个命令刻在脑子里或者收藏本文，下次遇到生产问题，对着场景直接复制粘贴就ok了。
