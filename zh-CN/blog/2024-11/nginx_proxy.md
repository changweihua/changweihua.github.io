---
lastUpdated: true
commentabled: true
recommended: true
title: 使用 Nginx 作为反向代理服务器详细配置指引
description: 使用 Nginx 作为反向代理服务器详细配置指引
date: 2024-11-29 12:18:00
pageClass: blog-page-class
cover: /covers/nginx.svg
---

# 使用 Nginx 作为反向代理服务器详细配置指引使用 #

## 背景 ##

**反向代理**是现代 Web 服务架构中的重要组成部分，用于提升服务性能、分担流量压力，并提供额外的安全层。Nginx 凭借其高效的事件驱动架构，在反向代理领域表现尤为卓越。

> *反向代理*，指的是浏览器/客户端并不知道自己要访问具体哪台目标服务器，只知道去访问代理服务器 ，代理服务器再通过反向代理 +负载均衡实现请求分发到应用服务器的一种代理服务。

反向代理服务的特点是代理服务器 代理的对象是应用服务器，也就是对于浏览器/客户端 来说应用服务器是隐藏的。

- 传统架构的不足

在单一服务器架构下，所有流量都指向同一个服务器：

> 资源利用率低，负载能力有限。
> 服务可用性差，单点故障容易导致整个系统瘫痪。
> 缺乏对客户端请求的灵活分配和优化。

- 反向代理的引入

反向代理是一种服务部署模式，客户端请求首先到达代理服务器，由代理服务器决定如何分发请求，常见功能包括：

> 流量转发：根据路径或请求头分发流量。
> 负载均衡：在多台后端服务器之间分配流量。
> 安全增强：隐藏真实服务器 IP，防止直接攻击。

- Nginx 在反向代理中的发展与应用

| 时间节点      | 事件    |
| :---:        |    :----:    |
|  2004  |  Nginx 发布，主打高并发和轻量级反向代理功能。  |
|  2010  |  在大型互联网企业（如 Netflix）广泛应用于流量分发。  |
|  2020  |  成为微服务架构中流量网关和 API 网关的重要组件。  |
|  2023  |  广泛用于 Kubernetes 环境中的 Ingress 控制器。  |

Nginx 的反向代理能力，不仅解决了传统架构的瓶颈问题，还为复杂的分布式系统提供了高效的流量管理解决方案。

## Nginx 的反向代理核心特性 ##

![示例图](/images/nginx_proxy_1.png){class="flex items-center justify-center"}

| 特性      | 描述    |
| :---:        |    :----:    |
| 流量转发      | 按规则转发请求到后端服务器，可基于 URL、头信息等分发。    |
| 负载均衡      | 内置多种负载均衡算法（轮询、最少连接等）。    |
| 缓存      | 缓存后端服务器响应，加速用户访问速度。    |
| SSL/TLS 加密      | 提供 HTTPS 支持，保护通信安全。    |
| 热加载配置      | 无需重启即可动态加载新配置，确保服务连续性。    |
| 特性      | 描述    |

## Nginx 反向代理的安装与基础配置 ##

### 安装 Nginx ###

在 `Ubuntu` 上安装

1. 更新系统包管理器：

```bash
sudo apt update
```

2. 安装 Nginx：

```bash
sudo apt install nginx
```

3.检查服务状态：

```bash
sudo systemctl status nginx
```

### Nginx 配置文件结构 ###

Nginx 的主要配置文件位于 `/etc/nginx/nginx.conf`，它分为以下模块：

- 全局块：定义用户权限、日志路径等全局属性。
- 事件块：定义网络连接的处理方式。
- HTTP 块：包含多个 server 块，用于处理 HTTP 请求。
- Server 块：每个 server 表示一个站点的配置。
- Location 块：定义路径规则与处理方式。

**配置示例**

```nginx
worker_processes 1;

events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;
        }
    }
}
```

## Nginx 反向代理的核心配置与实例 ##

<img src="/images/nginx_proxy_2.png" class="flex items-center justify-center"  data-zoomable  />

### 配置基本反向代理 ###

假设有两个后端服务器：

- 192.168.1.101：处理动态请求。
- 192.168.1.102：存储静态资源。

客户端通过 `http://proxyserver` 访问，由 Nginx 转发到不同后端服务器。

1. 创建 /etc/nginx/sites-available/reverse-proxy：

```nginx
server {
    listen 80;
    server_name proxyserver;

    # 动态请求转发到后端1
    location /dynamic/ {
        proxy_pass http://192.168.1.101;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源转发到后端2
    location /static/ {
        proxy_pass http://192.168.1.102;
        proxy_set_header Host $host;
    }
}
```

2.创建符号链接并重载配置：

```bash
sudo ln -s /etc/nginx/sites-available/reverse-proxy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 负载均衡配置 ###

使用两台后端服务器 (192.168.1.101 和 192.168.1.102) 提供相同的动态内容，通过负载均衡分摊流量。

1. 定义后端池和负载均衡算法：

```nginx
upstream backend {
    server 192.168.1.101;
    server 192.168.1.102;
}

server {
    listen 80;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

2. 支持更多算法：

| 算法      | 描述    |
| :---:        |    :----:    |
| 轮询      | 默认算法，轮流将请求分配到后端服务器。    |
| 最少连接      | 优先分配给当前连接数最少的服务器。    |
| 权重分配      | 根据服务器性能设置权重，高性能服务器分配更多请求。    |


```nginx
upstream backend {
    server 192.168.1.101 weight=2;
    server 192.168.1.102 weight=1;
}
```

### 使用缓存优化性能 ###

通过缓存后端服务器响应，减少重复请求对服务器的压力。

1. 启用缓存功能：

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m inactive=60m;
server {
    location / {
        proxy_cache my_cache;
        proxy_pass http://backend;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

2. 检查缓存状态： 在 HTTP 响应头中查看 `X-Cache-Status`，状态包括：

- MISS：首次请求，未命中缓存。
- HIT：缓存命中，返回缓存内容。

### HTTPS 支持 ###

1. 使用 Let's Encrypt 配置 HTTPS：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d proxyserver
```

2. 验证配置文件并重启：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Nginx 的性能优化与监控 ##

优化 Nginx 的性能和监控运行状态是确保其高效、稳定运行的核心任务。本部分将详细探讨提升 Nginx 性能的技术建议以及常用的监控工具和方法。

### 性能优化建议 ###

![示例图](/images/nginx_proxy_3.png){class="flex items-center justify-center"}

Nginx 的高性能不仅源自其轻量级架构，还得益于灵活的配置能力。以下是优化 Nginx 性能的具体措施及相关配置示例。

**连接数优化**

Nginx 的并发处理能力与其配置的工作进程数 (`worker_processes`) 和每个进程允许的最大连接数 (`worker_connections`) 直接相关。

- worker_processes 表示工作进程数量，通常设置为服务器 CPU 核心数。
- worker_connections 决定每个工作进程能够同时处理的连接数，影响并发处理能力。

**优化配置**： 根据硬件和预期流量优化连接设置：

```nginx
worker_processes auto;          # 自动设置为 CPU 核心数
events {
    worker_connections 2048;    # 每个进程最大连接数
}
```

**注意事项**

- 适当增大 `worker_connections`，但需确保服务器资源（CPU、内存）充足。
- 使用 `ulimit -n` 检查系统允许的最大文件描述符数，确保 worker_connections 不超过此值。

**启用 Gzip 压缩**

通过压缩静态资源（如 HTML、CSS、JavaScript 等），可以有效减少传输数据量，提高加载速度。

- 原理说明： Gzip 是一种无损压缩技术，可在服务器端压缩资源文件后发送给客户端，由客户端解压缩后使用。
- 配置示例： 在 http 块中添加以下配置：

```nginx
gzip on;                           # 开启 gzip 压缩
gzip_min_length 1k;                # 压缩的最小文件大小
gzip_comp_level 5;                 # 压缩级别，范围 1-9（建议 4-6）
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_vary on;                      # 在响应头中添加 "Vary: Accept-Encoding"
```
- 优点：
  - 减少传输带宽。
  - 加快客户端加载速度，特别是在移动网络下效果明显。
- 注意事项：
  - 不要压缩图片、视频等已压缩文件，避免增加解压缩开销。
  - 可通过浏览器开发者工具检查 Gzip 是否启用，查看响应头中的 `Content-Encoding: gzip`。

### 启用 HTTP/2 支持 ###

HTTP/2 是 HTTP 协议的改进版本，支持多路复用、头部压缩等特性，大幅提高传输效率。

![示例图](/images/nginx_proxy_4.png){class="flex items-center justify-center"}

- 原理说明：
  - 多路复用：单个 TCP 连接可同时传输多个请求和响应，减少连接建立的开销。
  - 头部压缩：通过 HPACK 算法压缩 HTTP 头部数据，降低传输数据量。
- 配置示例： 启用 HTTP/2 需要服务器支持 SSL/TLS：

```nginx
server {
    listen 443 ssl http2;                # 启用 HTTP/2
    server_name example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        root /var/www/html;
    }
}
```

- 优点：
  - 减少延迟，提高资源加载速度。
  - 更适合高并发场景。
- 注意事项：
  - HTTP/2 仅支持 HTTPS 连接。
  - 确保浏览器和客户端支持 HTTP/2。

## Nginx 的监控工具与方法 ##

监控 Nginx 的运行状态和性能是运维的核心任务。以下是常见的监控方法和工具。

### 启用 Nginx Status 模块 ###

![示例图](/images/nginx_proxy_5.png){class="flex items-center justify-center"}

Nginx 提供了一个内置模块 `ngx_http_stub_status_module`，可以实时监控请求处理状态。

**功能**

- Active connections：当前活跃连接数。
- Reading：Nginx 从客户端读取请求头的连接数。
- Writing：Nginx 向客户端返回响应的连接数。
- Waiting：空闲连接数。

**启用模块**

- 检查 Nginx 是否启用了 stub_status 模块：

```bash
nginx -V 2>&1 | grep -o with-http_stub_status_module
```

- 在配置文件中添加 status 页面：

```nginx
server {
    listen 80;
    server_name status.example.com;

    location /nginx_status {
        stub_status;
        allow 127.0.0.1;    # 仅允许本机访问
        deny all;
    }
}
```

- 重载配置并访问：

```bash
sudo nginx -s reload
curl http://127.0.0.1/nginx_status
```

**输出示例**

```bash
Active connections: 291
server accepts handled requests
10098 10098 20003
Reading: 12 Writing: 17 Waiting: 262
```

### 外部监控工具 ###

Nginx 的日志数据可以与外部监控工具集成，提供更丰富的可视化监控。

| 工具      | 描述    |
| :---:        |    :----:    |
| Prometheus      | 收集 Nginx 的性能指标，可通过 Exporter 将数据导入 Prometheus。    |
| Grafana      | 配合 Prometheus 提供丰富的可视化仪表盘，监控流量和错误率。    |
| ELK 堆栈      | 使用 Elasticsearch、Logstash 和 Kibana 分析 Nginx 日志数据    |

**使用 Prometheus 和 Grafana**

![示例图](/images/nginx_proxy_6.png){class="flex items-center justify-center"}

- 安装 nginx-vts-exporter 插件，采集 Nginx 指标：

```bash
docker run -d -p 9913:9913 \
    --link nginx \
    nginx/nginx-prometheus-exporter:latest
```

- 将 Prometheus 配置为抓取 Nginx 指标：

```yaml
复制x
scrape_configs:
- job_name: 'nginx'
    static_configs:
    - targets: ['localhost:9913']
```

- 在 Grafana 中添加 Prometheus 数据源，导入 Nginx 仪表盘模板。

**优点**

- 提供实时的流量和性能数据。
- 可定制警报规则，检测异常流量。

> Nginx 在反向代理领域的应用极为广泛，它不仅能优化流量分发，还能通过负载均衡、缓存等功能提升系统的稳定性和响应速度。通过本文的详细讲解，您应该能够配置和优化一个高效的反向代理服务器。
