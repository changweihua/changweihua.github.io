---
lastUpdated: true
commentabled: true
recommended: true
title: Docker Compose + Nginx 实现零停机蓝绿部署
description: 从入门到生产级实践
date: 2026-01-26 09:00:00
pageClass: blog-page-class
cover: /covers/nginx.svg
---

在单机 Docker 环境下，如何实现像 Kubernetes 那样的“滚动更新”或“蓝绿部署”？很多开发者习惯于直接 `docker compose restart`，但这会导致服务在重启期间出现短暂的 502 错误。

本文将总结一套基于 **Shell 脚本 + Docker Compose + Nginx** 的轻量级蓝绿部署方案。该方案重点解决了两个核心问题：**如何准确判断新服务已就绪**，以及**如何优雅地处理旧服务的剩余流量**。

## 架构设计 ##

我们使用 **蓝绿部署 (Blue/Green Deployment)** 策略。

- **状态文件 (`AorB`)** ：记录当前在线的是 A 环境还是 B 环境。
- **双容器槽位**：`backend` (Blue) 和 `backend1` (Green)。
- **Nginx 负载均衡**：通过切换 `upstream` 配置文件并重载 (`reload`)，将流量瞬间切换到新容器。

## 核心挑战与解决方案 ##

在脚本演进过程中，我们解决了以下三个生产级痛点：

### 痛点一：服务“假启动”导致 502 ###

#### 旧方案：通过 `grep "Worker ready"` 检查日志。 ####

**问题**：容器启动且打印了日志，并不代表 Web Server 已经绑定端口并准备好接收 TCP 连接。且日志缓冲会导致判断延迟。

#### 新方案：主动 HTTP 探测 (Active Probing) ####

我们在脚本中引入了 `wait_for_health` 函数，通过 `curl` 持续请求应用的 /`api/user/me `接口。

- **判定逻辑**：只要返回 HTTP 200 或 401 Unauthorized，即视为服务可用。
- **为什么接受 401？** ：`/api/user/me` 需要登录。如果我们收到 401 错误，说明 Nginx/Gunicorn/Spring Boot 等*应用层已经完全启动并拦截了请求*，这正是我们需要的“健康”信号。

### 痛点二：暴力停机切断用户连接 ###

#### 旧方案：`Nginx reload` 后立即 `docker stop` 旧容器。 ####

**问题**：Nginx 的 `reload` 是异步的，且旧容器上可能还有正在处理的长连接（如下载、WebSocket）。直接停止会导致用户端连接重置。

#### 新方案：连接耗尽 (Connection Draining) ####

- **Nginx 层面**：设置 `worker_shutdown_timeout 60s;`，给旧 Worker 进程 60 秒时间处理剩余请求。
- **脚本层面**：引入 `wait_for_draining` 函数。使用 Linux 原生命令 `ss` (Socket Statistics) 监控指向旧容器 IP 的 TCP 连接。只有当连接数归零或超时，才执行停机。

### 痛点三：Nginx 配置指令作用域错误 ###

**问题**：`worker_shutdown_timeout` 被错误放置在 `http` 块中。

**修正**：该指令属于全局配置，必须放在 `nginx.conf` 的最外层 (Main Context) 。

## 最终实施方案 ##

### Nginx 全局配置 (nginx.conf) ###

```nginx:nginx.conf
user  nginx;
worker_processes  auto;

# 【关键配置】放在最外层，控制旧进程最长存活时间
worker_shutdown_timeout 60s;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    include       /etc/nginx/conf.d/*.conf;
    # 你的 upstream 配置文件被包含在这里
    include       /etc/nginx/upstream.conf; 
}
```

### 自动化部署脚本 (deploy.sh) ###

这是整合了所有优化逻辑的完整脚本：

```bash:deploy.sh
#!/usr/bin/env bash

# === 配置区 ===
ABFILE=nginx/AorB
CONTAINER_PORT=8000           # 容器内部应用端口
HEALTH_PATH="/api/user/me"    # 健康检查接口
MAX_RETRIES=30                # 健康检查最大重试次数
DRAIN_TIMEOUT=60              # 流量耗尽最大等待秒数
# =============

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 初始化状态文件
if [ ! -f "$ABFILE" ]; then echo "A" > "$ABFILE"; fi
AorB=$(cat ${ABFILE})

# 获取容器内部 IP
get_container_ip() {
  local id=$(docker compose ps -q $1 2>/dev/null)
  if [ -n "$id" ]; then
    docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $id
  fi
}

# 1. 健康检查：等待 API 返回有效响应 (包括 401)
wait_for_health() {
  local service=$1
  local count=0
  echo -e "${YELLOW}🔍 Checking health for $service...${NC}"

  while [ $count -lt $MAX_RETRIES ]; do
    local ip=$(get_container_ip $service)
    if [ -n "$ip" ]; then
      # 获取响应内容
      local resp=$(curl -s --max-time 2 "http://${ip}:${CONTAINER_PORT}${HEALTH_PATH}")
      # 只要包含 Unauthorized，说明服务活着
      if echo "$resp" | grep -q "Unauthorized"; then
        echo -e "${GREEN}✅ $service is READY!${NC}"
        return 0
      fi
    fi
    sleep 2
    count=$((count + 1))
  done
  echo -e "${RED}❌ Health check failed for $service${NC}"; return 1
}

# 2. 流量耗尽：等待旧连接断开
wait_for_draining() {
  local service=$1
  local count=0
  local ip=$(get_container_ip $service)

  [ -z "$ip" ] && return 0
  echo -e "${YELLOW}🛑 Draining connections for $service ($ip)...${NC}"

  while [ $count -lt $DRAIN_TIMEOUT ]; do
    # 检查目标为旧容器 IP 的 ESTABLISHED 连接
    local conn=$(ss -tn state established dst $ip | grep -v Recv-Q | wc -l)
    if [ "$conn" -eq "0" ]; then
      echo -e "${GREEN}✅ No active connections. Safe to stop.${NC}"
      return 0
    fi
    echo "   Active connections: $conn. Waiting..."
    sleep 1
    count=$((count + 1))
  done
  echo -e "${RED}⚠️ Timeout! Force stopping.${NC}"
}

# 3. 启动并切换
deploy() {
  local new=$1
  local old=$2
  local env=$3

  echo "=== Deploying $new (Replace $old) ==="
  cp envs/prod-common.env "$env"
  
  # A. 启动新容器
  docker compose build $new
  docker compose up -d $new
  
  # B. 健康检查
  wait_for_health $new || exit 1
  
  # C. Nginx 切换流量
  cp nginx/$new.conf.tmpl nginx/upstream.conf
  sudo nginx -t && sudo nginx -s reload
  echo -e "${GREEN}🚀 Traffic switched to $new${NC}"

  # D. 旧节点处理 (流量耗尽 -> 停止)
  wait_for_draining $old
  docker compose stop $old
}

# 主流程
if [ "$AorB" == "A" ]; then
  deploy "backend" "backend1" "envs/prod.env"
  echo B > ${ABFILE}
else
  deploy "backend1" "backend" "envs/prod1.env"
  echo A > ${ABFILE}
fi
```

## 总结 ##

这套脚本实现了一个闭环的自动化发布流程：

- **Start**: 启动新容器。
- **Verify**: 通过 HTTP 语义（401 Unauthorized）确认业务逻辑已加载。
- **Switch**: Nginx 热加载，流量切换。
- **Drain**: 监控 TCP 连接，等待旧请求处理完毕。
- **Stop**: 安全关闭旧容器。

这种方案不需要复杂的 Kubernetes 运维知识，非常适合中小规模的 Docker Compose 部署场景，能显著提升发布的稳定性和用户体验。

> 线上Nginx频繁502，排查3小时发现是这个配置的问题
> 
> 监控告警：Nginx 502错误率飙升到5%。
> 看了眼后端服务，运行正常，没有报错。重启Nginx，好了一会又开始502。
> 排查了3个小时，最后发现是upstream配置的问题。记录一下排查过程。

## 问题现象 ##

**监控数据**：

- 502错误率：从0.1% → 5%
- 后端服务：正常运行，无报错
- CPU/内存：正常
- 发生时间：流量高峰期

**特点**：

- 不是全部请求都502，大部分正常
- 重启Nginx后短暂恢复，然后又出现
- 后端服务日志没有异常

## 排查过程 ##

### Step 1：看Nginx错误日志 ###

```bash
tail -f /var/log/nginx/error.log
```

**发现大量这样的错误**：

```txt
upstream timed out (110: Connection timed out) while connecting to upstream
upstream prematurely closed connection while reading response header
```

**关键信息**：是 `upstream` 连接的问题，不是后端服务本身的问题。

### Step 2：检查后端服务状态 ###

```bash
# 查看后端服务进程
ps aux | grep java

# 查看端口监听
ss -tlnp | grep 8080

# 直接测试后端
curl -I http://127.0.0.1:8080/health
```

后端服务正常，直接访问返回200。

### Step 3：检查连接数 ###

```bash
# 查看Nginx到后端的连接数
ss -ant | grep 8080 | wc -l

# 查看连接状态分布
ss -ant | grep 8080 | awk '{print $1}' | sort | uniq -c
```

**发现问题了**：

```txt
850 ESTABLISHED
   120 TIME_WAIT
    50 SYN_SENT
```

有50个连接卡在 `SYN_SENT` 状态，说明Nginx到后端的新连接建立不上。

### Step 4：检查后端连接队列 ###

```bash
# 查看后端服务的accept队列
ss -lnt | grep 8080
```

**输出**：

```txt
State    Recv-Q   Send-Q   Local Address:Port
LISTEN   129      128      0.0.0.0:8080
```

**问题找到了！**  `Recv-Q` 是129，`Send-Q` 是128。

这说明accept队列满了（128是默认值），新连接无法被接受。

## 根因分析 ##

### 什么是accept队列 ###

```txt
客户端 → SYN → 服务端（半连接队列）
服务端 → SYN+ACK → 客户端
客户端 → ACK → 服务端（全连接队列/accept队列）
应用程序 accept() → 取出连接
```

当accept队列满了，新的完成三次握手的连接无法进入队列，客户端会收到超时或RST。

### 为什么队列满了 ###

后端是Spring Boot应用，默认配置：

```yaml
server:
  tomcat:
    accept-count: 100  # Tomcat的accept队列
```

而系统层面的限制是 `net.core.somaxconn = 128`，取两者较小值，所以实际accept队列只有128。

**流量高峰时**：

- 请求量大，新连接多
- accept队列128不够用
- 新连接被拒绝
- Nginx收到超时，返回502

## 解决方案 ##

### 方案一：调大系统参数 ###

```bash
# 查看当前值
sysctl net.core.somaxconn

# 临时修改
sysctl -w net.core.somaxconn=65535

# 永久修改
echo "net.core.somaxconn = 65535" >> /etc/sysctl.conf
sysctl -p
```

### 方案二：调整Tomcat配置 ###

```yaml
server:
  tomcat:
    accept-count: 1000      # accept队列大小
    max-connections: 10000  # 最大连接数
    threads:
      max: 500              # 最大工作线程数
```

### 方案三：Nginx upstream优化 ###

```nginx
upstream backend {
    server 127.0.0.1:8080 max_fails=3 fail_timeout=30s;
    
    keepalive 100;  # 保持连接数，减少新建连接
}

server {
    location / {
        proxy_pass http://backend;
        
        proxy_connect_timeout 5s;      # 连接超时
        proxy_read_timeout 60s;        # 读取超时
        proxy_send_timeout 60s;        # 发送超时
        
        proxy_http_version 1.1;        # 使用HTTP/1.1
        proxy_set_header Connection ""; # 配合keepalive
    }
}
```

### 方案四：多实例负载均衡 ###

如果单实例撑不住，可以部署多实例：

```nginx
upstream backend {
    least_conn;  # 最少连接数策略
    
    server 127.0.0.1:8080 weight=1;
    server 127.0.0.1:8081 weight=1;
    server 127.0.0.1:8082 weight=1;
    
    keepalive 100;
}
```

## 最终配置 ##

**系统参数（/etc/sysctl.conf）**：

```txt
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.core.netdev_max_backlog = 65535
```

**Spring Boot配置**：

```yaml
server:
  tomcat:
    accept-count: 2000
    max-connections: 20000
    threads:
      max: 500
      min-spare: 50
```

**Nginx配置**：

```nginx
upstream backend {
    server 127.0.0.1:8080;
    keepalive 200;
}

server {
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }
}
```

## 优化效果 ##

| **指标**        |      **优化前**      |   **优化后**      |
| :------------- | :-----------: | :-----------: |
|    502错误率     |      5%      |  0.01%      |
|   accept队列溢出      |      频繁      |  无      |
|     连接建立时间    |      不稳定      |  稳定<5ms      |

## 排查命令汇总 ##

```bash
# 查看Nginx错误日志
tail -f /var/log/nginx/error.log

# 查看连接状态
ss -ant | grep <端口>

# 查看监听队列
ss -lnt | grep <端口>

# 查看队列溢出统计
netstat -s | grep -i listen

# 查看系统参数
sysctl net.core.somaxconn

# 实时监控连接数
watch -n 1 'ss -ant | grep <端口> | wc -l'
```

## 经验总结 ##

| **502原因**        |      **排查方向**      |
| :------------- | :-----------: |
|    upstream timed out     |      后端处理慢或连接队列满      |
|   connection refused      |      后端服务没启动      |
|    no live upstreams    |      所有后端都不可用      |
|    prematurely closed    |      后端主动断开连接      |

**这次的坑**：后端服务看起来正常，但accept队列满了，新连接进不来。

**教训**：

- 系统默认的 `somaxconn=128` 太小，生产环境必须调大
- Nginx配置 `keepalive` 可以减少新建连接，降低队列压力
- 监控要加上连接队列指标

> Nginx 灰度发布、容错与限流配置最佳实践

在生产环境中，Web 服务需要应对版本迭代、服务器故障、高并发请求等复杂情况。Nginx 作为轻量级高性能的反向代理和负载均衡服务器，在这些场景中发挥着关键作用。本文将结合实际案例，介绍如何使用 Nginx 实现：

- 灰度发布（流量按比例分配）
- 容错保护（自动剔除故障节点）
- 限流控制（防止恶意请求打爆接口）
- HTTPS 支持（保证传输安全）

## 灰度发布：按比例分流 ##

灰度发布的核心思想是：**新版本上线时，先让部分流量进入新版本，观察稳定性，再逐步放量**。

### 配置示例 ###

```nginx
upstream backend {
    server 192.168.0.101 weight=8;   # 老版本服务器，80% 流量
    server 192.168.0.102 weight=2;   # 新版本服务器，20% 流量
}
```

**🔎 说明**：

- `weight=8` 和 `weight=2` 代表流量分配比例（约 80% : 20%）。
- 随着新版本稳定，可以逐步提高其权重。

## 容错保护：自动剔除异常节点 ##

在分布式系统中，不可避免会遇到某台服务器挂掉或响应超时的情况。Nginx 提供了 健康检查机制：

### 配置示例 ###

```nginx
upstream backend {
    server 192.168.0.101 weight=8 max_fails=3 fail_timeout=30s;
    server 192.168.0.102 weight=2 max_fails=3 fail_timeout=30s;
}
```

**🔎 说明**：

- `max_fails=3`：30 秒内失败 3 次即认为该节点不可用。
- `fail_timeout=30s`：在 30 秒内暂停向该节点转发请求。
- 到期后 Nginx 会重新尝试，节点恢复后自动重新加入。

## 限流控制：防止接口被打爆 ##

在高并发场景中，如果没有流量控制，可能出现接口雪崩。Nginx 提供了 **基于漏桶算法的限流**。

### 配置示例 ###

```nginx
http {
    # 定义限流区域，大小 10MB
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    upstream backend {
        server 192.168.0.101 weight=8 max_fails=3 fail_timeout=30s;
        server 192.168.0.102 weight=2 max_fails=3 fail_timeout=30s;
    }

    server {
        listen 443 ssl;
        server_name example.com;

        # SSL 证书配置
        ssl_certificate     /etc/nginx/ssl/example.crt;
        ssl_certificate_key /etc/nginx/ssl/example.key;

        location / {
            # 限流策略：每个 IP 每秒最多 10 个请求，突发最多 20 个
            limit_req zone=api_limit burst=20 nodelay;

            proxy_pass http://backend;
        }
    }
}
```

**🔎 说明**：

- `limit_req_zone $binary_remote_addr ...` → 按客户端 IP 做限流。
- `rate=10r/s` → 每秒允许 10 个请求。
- `burst=20` → 突发请求上限 20。
- `nodelay` → 超过速率但未超过突发时立即处理，否则排队。

## HTTPS 配置：保证传输安全 ##

生产环境中必须开启 HTTPS 来保障传输安全，配置如下：

```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate     /etc/nginx/ssl/example.crt;
    ssl_certificate_key /etc/nginx/ssl/example.key;

    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://backend;
    }
}
```

**🔎 说明**：

- 使用 TLS1.2 和 TLS1.3，避免老旧协议漏洞。
- 强制使用高强度加密套件。

## 最佳实践流程 ##

### 上线新版本 ###

- 初始分流 10% → `weight=1`
- 逐步增加至 50% → 最后替换旧版本

### 应对故障 ###

- 节点异常时，自动切换到健康节点
- 防止单点故障拖垮整个服务

### 防止被打爆 ###

- 每个 IP 限制 QPS
- 配合 Redis/MQ 等后端削峰处理

### 配置更新 ###

**修改配置后执行**：

```bash
nginx -t   # 检查配置是否正确
nginx -s reload   # 平滑加载，无中断更新
```

## 完整配置模板（推荐） ##

```nginx
http {
    # 定义限流策略
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    upstream backend {
        server 192.168.0.101 weight=8 max_fails=3 fail_timeout=30s;
        server 192.168.0.102 weight=2 max_fails=3 fail_timeout=30s;
    }

    server {
        listen 443 ssl;
        server_name example.com;

        # SSL 配置
        ssl_certificate     /etc/nginx/ssl/example.crt;
        ssl_certificate_key /etc/nginx/ssl/example.key;
        ssl_protocols       TLSv1.2 TLSv1.3;
        ssl_ciphers         HIGH:!aNULL:!MD5;

        location / {
            # 每个 IP 每秒最多 10 个请求，突发最多 20
            limit_req zone=api_limit burst=20 nodelay;

            proxy_pass http://backend;
        }
    }
}
```

## 结论 ##

通过合理的 Nginx 配置，我们可以同时实现：

- **灰度发布**：按流量比例平滑上线新版本
- **容错保护**：自动剔除异常节点，保证高可用
- **限流防护**：防止恶意请求或流量洪峰压垮服务
- **HTTPS 支持**：保障传输安全，符合安全合规

这套配置在实际生产环境中已被广泛验证，适合电商、金融、视频点播等高并发场景。
