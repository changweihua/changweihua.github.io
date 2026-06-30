---
lastUpdated: true
commentabled: true
recommended: true
title: Aneiang.Pa 4.0 发布 — 极简 .NET 爬虫库
description: 一行代码抓遍全网 20 个热榜！
date: 2026-06-29 10:35:00
pageClass: blog-page-class
cover: /covers/ai.svg
---

> `var data = await Pa.Source("WeiBo").GetAsync();` — 微博热搜到手。
>
> 抓 20 个平台无需写代码，新增平台只需写一份 YAML。本文带你看完 Aneiang.Pa 4.0 的所有亮点。

## 引子：你写过多少次"重复的爬虫"？

我做这件事是因为 _过去半年，我至少写了 5 次"抓某个热榜然后存数据库"的代码_。

- 一次是给个人博客做"今日热点"侧边栏
- 一次是给客户做内部数据看板
- 一次是为了挖掘话题写公众号
- 一次是测试 LLM 对中文热点的反应
- 最后一次……我已经想不起来了，反正又重写了一遍

每次都长这样：

```cs
var client = new HttpClient();
client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0...");
var html = await client.GetStringAsync("https://s.weibo.com/top/summary");
var doc = new HtmlDocument();
doc.LoadHtml(html);
var nodes = doc.DocumentNode.SelectNodes("//tr");
// ... 然后是 try/catch、重试、缓存、限流、日志...
```

这件事不应该每次都重写。

于是有了 Aneiang.Pa 4.0。

## 一行起步

```cs
using Aneiang.Pa;

var data = await Pa.Source("WeiBo").GetAsync();
foreach (var item in data.Data)
    Console.WriteLine(item["title"]);
```

完事。`Pa.Source(name).GetAsync()` 内部已经处理了：

- ✅ HttpClient 创建和超时控制
- ✅ UA 轮换
- ✅ 3 次指数退避重试
- ✅ 5 分钟内存缓存
- ✅ 连续失败熔断 60 秒
- ✅ 结构化日志
- ✅ Prometheus 指标
- ✅ OpenTelemetry 追踪

全部默认启用，零配置。

## 强类型映射

```cs
public class Repo
{
    public string? Title { get; set; }
    public string? Url { get; set; }
    public string? Lang { get; set; }
}

var repos = await Pa.Source("Github.Trending").GetAsync<Repo>();
foreach (var r in repos.Data)
    Console.WriteLine($"[{r.Lang}] {r.Title}");
```

## 20 个内置平台

| 分类     | 平台                                 |
| :------- | :----------------------------------- |
| 新闻热榜 | 微博、知乎、B站、百度、抖音、头条    |
| 新闻热榜 | 虎扑、腾讯、掘金、澎湃、豆瓣、凤凰网 |
| 新闻热榜 | CSDN、博客园、IT之家、36氪           |
| GitHub   | Github.Trending、Github.Releases     |
| 彩票     | 双色球、大乐透                       |

```cs
foreach (var r in Pa.Sources())
    Console.WriteLine($"{r.Category}/{r.Name}  {r.DisplayName}");
```

输出：

```txt
[News]    BaiDu             百度热榜
[News]    Bilibili          B 站热搜
[News]    DouYin            抖音热搜
[News]    Github.Releases   GitHub Releases (dotnet/runtime)
[News]    Github.Trending   GitHub Trending
[News]    WeiBo             微博热搜
[News]    ZhiHu             知乎热榜
... 共 20 个
```

## 新增一个平台 = 一份 YAML

想抓 Hacker News？写一份 `hackernews.yaml`：

```yml
name: HackerNews
category: News
display_name: Hacker News 头条
fetch:
  url: https://news.ycombinator.com/
parse:
  type: html
  container: 'tr.athing'
  fields:
    title: { selector: 'span.titleline a', trim: true }
    url: { selector: 'span.titleline a', attr: href }
    rank: { selector: 'span.rank' }
```

```cs
Pa.Configure(c => c.UseRecipesFolder("./recipes"));
var hn = await Pa.Source("HackerNews").GetAsync();
```

> 0 行 C# 代码。无需新建项目。无需重新编译框架。

## 四种 Recipe 来源，各有适用

| 方式                   | 适用场景                     |
| :--------------------- | :--------------------------- |
| 内置 YAML              | 框架自带，开箱即用           |
| 外部 YAML 文件夹       | 配置外置，运维可改，社区共享 |
| Builder DSL（C# 内联） | 动态构造、运行时定义         |
| 特性标注               | 强类型、IDE 友好             |

### Builder DSL 示例

```cs
Pa.Define("MyAPI", b => b
.Get("https://api.example.com/items?page={pageNo}")
.Header("Authorization", "Bearer xxx")
.ParseJson(p => p
.Items("$.data")
.Field("id", "id")
.Field("title", "title")));

var data = await Pa.Source("MyAPI").WithPaging(1, 30).GetAsync();
```

### 特性标注示例

```cs
[Recipe("MyTrending", Category = "Tech")]
[Get("https://github.com/trending")]
[Container("article.Box-row")]
public class Repo
{
[Selector("h2 a")] public string? Title { get; set; }
[Selector("h2 a", Attr = "href", Base = "https://github.com")] public string? Url { get; set; }
}

Pa.DiscoverFromLoadedAssemblies();
var data = await Pa.Source("MyTrending").GetAsync<Repo>();
```

## ASP.NET Core 集成 — 5 行变 REST API

```cs
using Aneiang.Pa.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddPa();

var app = builder.Build();
app.MapPaApi();
app.Run();
```

自动暴露端点：

```txt
GET /api/pa/sources — 列出所有源
GET /api/pa/source/WeiBo — 抓微博热搜
GET /api/pa/source/BaiDu — 抓百度热榜
GET /api/pa/source/Lottery.SSQ — 抓双色球
GET /api/pa/health — 健康检查
```

打包成 Docker 镜像，一台服务器就能给你的所有项目提供热榜 API。

## 难搞的抖音怎么办？

抖音热搜接口需要先访问 `login.douyin.com` 拿 Cookie，否则直接 403。

Aneiang.Pa 内置 `DouYinCookieMiddleware`，自动处理：

```cs
var data = await Pa.Source("DouYin").GetAsync();
```

实测输出：

```txt
[DouYinCookie] 已获取 Cookie（114 字节，10 分钟内复用）
成功！共 48 条热搜:

1. 拿捏夏日高能运动穿搭 🔥 11951312
2. 父亲的爱藏在买与不买里 🔥 11907634
3. 假日经济活力迸发 🔥 11989625
   ...
```

类似的特殊站点（小红书、微信公众号等）未来都会有对应的内置中间件。

## 性能与可靠性

- 超时：30 秒硬超时（可配置）
- 重试：3 次指数退避，最长 14 秒（500ms → 2s → 8s）
- 熔断：连续 5 次失败开启 60 秒熔断
- 缓存：默认 5 分钟内存缓存
- 限流：滑动窗口令牌桶（按需启用）
- 代理池：轮询/随机 + 健康跟踪 + 失败自动禁用

## 安装

```bash
# 主包（核心 + 20 内置 Recipe）

dotnet add package Aneiang.Pa

# Web API 集成（可选）

dotnet add package Aneiang.Pa.AspNetCore

# HTTP 客户端 SDK（可选）

dotnet add package Aneiang.Pa.Client
```

单包 18 MB 左右，无重型依赖。

## 实测截图

```txt
# Aneiang.Pa 4.0 — 全能力 Demo

── ① 所有已注册 Recipe ──
[News] WeiBo / BaiDu / Bilibili / ZhiHu / DouYin / TouTiao ...
[News] Github.Trending / Github.Releases
[Lottery] Lottery.SSQ / Lottery.DLT
共 20 个

── ② 基础调用 — 百度热榜 ──
成功 50 条: - 2比2战平乌拉圭！佛得角再造冷门 - 注意防范暴雨、强对流天气 - 洲际导弹：不试则已 一试惊人

── ③ 强类型映射 — Github.Releases ──
[v9.0.17] .NET 9.0.17 by by-msft @ 2026-06-09
[v8.0.28] .NET 8.0.28 by by-msft @ 2026-06-09
[v10.0.9] .NET 10.0.9 by by-msft @ 2026-06-09

── ⑦ 缓存中间件验证 ──
第二次调用 BaiDu（命中缓存）: 0ms
```

## 适合谁

- ✅ 想给自己的项目接热点 Feed 的独立开发者
- ✅ 需要给客户做"数据看板""舆情大屏"的外包工作室
- ✅ 想给 LLM 喂中文实时热点的 AI 应用
- ✅ 对 .NET 爬虫库现状不满，想找一个"现代化"替代品的人

## 开源地址

> Gitee: https://gitee.com/aneiangsoft/Aneiang.Pa
>
> GitHub: https://github.com/AneiangSoft/Aneiang.Pa

欢迎 Star、Issue、PR。

_新增平台不需要写 C# 代码_ —— 提交一份 YAML 文件就能让全世界的 .NET 用户用上你贡献的平台。

```cs
var data = await Pa.Source("YourPlatform").GetAsync();
```
