---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 生产环境该怎么守护？
description: 别再用 nohup java -jar 了
date: 2026-08-04 09:15:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在开发环境，我们习惯了随手敲下一行：

```bash
nohup java -jar my-app.jar &
```

这确实能跑。但在生产环境，这种做法就像是在高压线上走钢丝。

## `nohup &` 为什么不行？ ##

`nohup` 加 `&` 只是把进程放到后台运行、忽略挂断信号而已，它根本*不是一个进程管理方案*。生产环境用这套，你会频繁踩到这些坑：

- 进程管理混乱：想重启？先 `ps` 找 `PID` 再 `kill`，手一抖可能误杀其他服务
- 开机无法自启：服务器因故障重启，服务不会自动恢复，半夜被报警电话叫醒是常态
- 权限失控：为了省事直接用 `root` 跑，安全风险极高
- 日志管理混乱：日志文件无人轮转，磁盘被写满是迟早的事

> “Linux部署 SpringBoot 项目”这八个字背后，其实是一条横跨开发、运维、安全、性能四个维度的实战链条。你得会用 systemd 做服务守护，而不是靠 `nohup &` 硬扛。

下面介绍三种生产级的解决方案，按推荐程度排序。

## 方案一：Systemd（最推荐） ##

systemd 是现代 Linux 发行版（CentOS 7+、Ubuntu 16.04+）的标准服务管理器。用它管理 Spring Boot 应用，无需安装任何额外软件，功能却比 `nohup` 强大得多。

### 第一步：创建专用账户（安全第一） ###

绝对不要用 `root` 用户运行业务代码：

```bash
# 创建一个没有登录权限的用户
sudo useradd -r -s /bin/false app_user
# 确保该用户对 JAR 包有读写权限
sudo chown app_user:app_user /opt/myapp/app.jar
```

### 第二步：编写 Service 文件 ###

在 `/etc/systemd/system/myapp.service` 创建服务配置文件：

```ini
[Unit]
Description=My Spring Boot Application
After=syslog.target network.target

[Service]
# 指定运行用户，实现权限隔离
User=app_user
Group=app_user

# 核心启动命令（建议指定完整 Java 路径和 JVM 参数）
ExecStart=/usr/bin/java -Xms512m -Xmx512m -XX:+UseG1GC \
    -jar /opt/myapp/app.jar \
    --spring.profiles.active=prod

# Spring Boot 优雅关闭：143 代表 SIGTERM 信号正常退出
SuccessExitStatus=143

# 崩溃自动重启
Restart=always
RestartSec=10

# 日志由 systemd 接管，用 journalctl 查看
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=myapp

[Install]
WantedBy=multi-user.target
```

### 第三步：激活与管理 ###

```bash
# 重载配置
sudo systemctl daemon-reload

# 设置开机自启（从此告别重启焦虑）
sudo systemctl enable myapp

# 启动服务
sudo systemctl start myapp

# 查看状态
sudo systemctl status myapp

# 查看日志
sudo journalctl -u myapp -f
```

### 无 Root 权限怎么办？ ###

很多银行、国企的内网环境只有普通账号，没有 `sudo` 权限。这时可以用 `systemd` 的用户模式（User Mode） ：

```bash
# 创建用户级服务文件
mkdir -p ~/.config/systemd/user/
# 把 .service 文件放到这个目录，内容同上但去掉 User/Group 字段

# 启用并启动
systemctl --user enable myapp
systemctl --user start myapp

# 关键：开启 linger 让用户退出后服务继续运行
# 这需要管理员执行一次：
sudo loginctl enable-linger <username>
```

## 方案二：Supervisor ##

如果你的系统还在用旧版 CentOS 6，或者需要一个轻量级、跨语言的进程管理工具，Supervisor 是很好的选择。

### 安装与配置 ###

```bash
# Ubuntu/Debian
sudo apt install supervisor

# CentOS
sudo yum install supervisor
```

在 `/etc/supervisor/conf.d/myapp.conf` 创建配置：

```ini
[program:myapp]
command=/usr/bin/java -Xms512m -Xmx512m -jar /opt/myapp/app.jar --spring.profiles.active=prod
directory=/opt/myapp
user=app_user
autostart=true
autorestart=true
startsecs=10
stopasgroup=true
killasgroup=true
stopwaitsecs=30
redirect_stderr=true
stdout_logfile=/var/log/myapp/out.log
stdout_logfile_maxbytes=50MB
stdout_logfile_backups=10
environment=JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
```

几个关键配置必须注意：

- `command`**必须用绝对路径**写 Java 命令，Supervisor 不继承系统的 $PATH
- `autorestart=true` + `startsecs=10`：告诉 Supervisor 这是长运行服务，别因为启动慢就杀掉
- `stopasgroup=true` + `killasgroup=true`：确保能杀死整个进程组，否则线程池、Netty 的子线程可能残留

### 常用管理命令 ###

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start myapp
sudo supervisorctl status
```

注意：CentOS 7+ 上 systemd 已成为标准，Supervisor 在部分发行版中已逐步被弃用。新项目优先选 systemd。

## 方案三：Docker + Kubernetes（云原生时代的选择） ##

如果你的团队已经走上容器化之路，Docker + K8s 是更现代化的方案。

### Dockerfile 示例 ###

```bash
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/myapp.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xms512m", "-Xmx512m", "-jar", "app.jar"]
```

Spring Boot 3.x 对容器化提供了良好的支持，容器化部署非常简单。

### Kubernetes 的优势 ###

K8s 本身就是一个生产级的进程守护系统：

- 自动重启：Pod 挂了自动重建
- 滚动更新：零停机发布
- 健康检查：liveness probe + readiness probe
- 水平伸缩：根据负载自动扩缩容

> Docker 解决环境一致性，K8s 搞定自动化运维。

### 生产环境 Checklist ###

不管你选哪种方案，下面这些事一定要做：

| 检查项 | 说明 |
| :--- | :--- |
| 专用运行用户 | 绝对不要用 `root` 跑应用 |
| JVM 参数调优 | 指定 `-Xms`、`-Xmx`、GC 策略，别用默认值 |
| 指定配置文件 | 用 `--spring.config.location` 外挂配置，不要打包进 JAR |
| 优雅关闭 | SuccessExitStatus=143 让 Spring Boot 能正常执行 `@PreDestroy` |
| 日志管理 | 配置日志轮转（Logback 的 RollingPolicy），防止磁盘占满 |
| 开机自启 | `systemctl enable` 或 `autostart=true` |
| 防火墙 | 确认安全组和系统防火墙放行了应用端口 |
| Java 版本匹配 | Spring Boot 2.7.x 用 JDK 8/17，3.x 强制 JDK 17+ |

## 总结 ##

| 方案 | 适用场景 | 优点 | 缺点 |
| :--- | :--- | :--- | :--- |
| Systemd | 绝大多数 Linux 生产环境 | 原生集成、功能强大、无需安装 | 仅限 Linux |
| Supervisor | 旧系统、跨语言场景 | 轻量、配置灵活 | CentOS 7+ 逐步弃用 |
| Docker + K8s | 云原生、微服务架构 | 环境一致、自动化运维 | 学习成本高、基础设施要求高 |

一句话建议：如果你的服务器是 CentOS 7+ 或 Ubuntu 16.04+，直接用 systemd；如果公司已经上了容器，走 Docker + K8s；只有特殊情况才考虑 Supervisor。

别再让 `nohup java -jar` 这种开发期玩具跑在生产环境了。生产环境需要的不是“能跑”，而是  “稳如磐石地跑满 365 天” 。
