---
lastUpdated: true
commentabled: true
recommended: true
title: Nginx从入门到实践
description: 安装、配置与应用
date: 2025-10-24 10:00:00 
pageClass: blog-page-class
cover: /covers/Nginx.svg
---

在现代Web架构中，Nginx无疑是绕不开的核心组件。无论是作为高性能Web服务器、反向代理，还是负载均衡器，它都以轻量、高效、稳定的特性占据着重要地位。对于运维工程师和开发人员来说，掌握Nginx的安装、配置与核心功能，不仅是日常工作的基础，更是提升架构设计能力的关键。

本文素材来源于笔者在Nginx的日常使用中的笔记整理，主要包括安装部署、配置文件解析、核心功能实现等方面。希望能帮助到有需要的读者，也欢迎大家分享自己的使用经验。

## 一、Nginx 基础认知 ##

### 什么是Nginx？ ###

Nginx是一款高性能、轻量级的开源Web服务器软件，同时兼具反向代理、负载均衡、HTTP缓存等多重功能。它的核心优势在于*事件驱动的异步架构*——这使得它能高效处理数万并发连接，且资源消耗极低，尤其擅长处理静态资源和作为后端服务的前端代理。

如今，Nginx已成为Apache的重要替代者，广泛应用于各类Web架构中，从个人博客到大型企业系统都能看到它的身影。

### Nginx 核心功能速览 ###

Nginx的功能丰富且强大，以下是其核心能力分类：

|  功能类别   |      关键能力  |
| :-----------: | :-----------: |
| Web服务器 | 静态资源托管、索引目录、Gzip压缩等 |
| 反向代理 | 隐藏后端服务、URL重写、请求头增删等 |
| 负载均衡 | 支持轮询、IP-hash、最少连接、权重分配等策略，自带健康检查 |
| HTTP缓存 | 代理缓存、FastCGI缓存、微缓存等，提升访问速度 |
| SSL终端 | 支持SNI、HTTP/2、OCSP Stapling、TLS 1.3等安全特性 |
| 限流&防护 | 基于漏桶/令牌桶的限流、黑白名单、WAF规则集成等 |
| 灰度发布 | 基于Cookie、Header、权重的流量分流，便于版本迭代 |
| 日志&监控 | 详细的访问日志（access_log）、错误日志（error_log），支持Prometheus监控 |

### 面试高频题：为什么选择Nginx？ ###

很多人会说“因为它性能高”，但不止如此。从运维架构角度看，真正让Nginx流行的是它带来的*运维便利性*：

- 不停机更新：传统Web服务器（如Tomcat）更新需重启，会导致用户访问中断；而Nginx可通过负载均衡切换服务器池，先加入新节点，再移除旧节点，实现无缝更新。
- 应对流量高峰：通过 `upstream` 配置扩容服务器节点，轻松分摊流量压力。
- 域名与证书管理：支持多域名共存，旧域名可自动跳转新域名；证书更新无需停服，直接重载配置即可。
- 灵活的访问控制：快速配置爬虫限制、IP黑白名单，或临时跳转至维护页面。

这些特性让Nginx成为架构中的“万能胶水”，极大降低了运维复杂度。

## 二、Nginx 安装部署 ##

### 方式1：包管理器安装（适合快速上手） ###

通过 `apt`（Debian/Ubuntu）或 `yum`（CentOS）一键安装，适合新手快速体验，但默认配置文件分散，自定义能力较弱。

```bash
# Debian/Ubuntu系统
sudo apt install nginx

# CentOS系统
sudo yum install nginx

# 验证安装
nginx -v # 查看版本
nginx -V # 查看详细安装信息
```

**默认路径说明**：

- 主配置文件：/etc/nginx/nginx.conf
- 二进制文件：/usr/sbin/nginx
- 网站根目录：/var/www/html/
- 日志文件：/var/log/nginx/（access.log和error.log）

### 方式2：源码编译安装（适合自定义需求） ###

源码编译可按需添加模块（如SSL、缓存等），配置更灵活，适合生产环境。

**获取源码**

从Nginx官网下载稳定版源码（如 `nginx-1.24.0.tar.gz`），解压至目标目录：

```bash
# 假设下载到/root目录，解压至/usr/local/nginx/
tar zxvf /root/nginx-1.24.0.tar.gz -C /usr/local/nginx/
cd /usr/local/nginx/nginx-1.24.0 # 进入源码目录
```

**安装依赖**

编译需依赖以下工具和库：

```bash
# Debian/Ubuntu
sudo apt install gcc g++ make libpcre3-dev zlib1g-dev libssl-dev

# CentOS
sudo yum install gcc gcc-c++ make pcre-devel zlib-devel openssl-devel
```

**配置编译参数**

根据需求添加模块（示例包含常用模块）：

```bash
./configure \
    --prefix=/usr/local/nginx      # 安装目录
    --with-http_ssl_module         # 启用SSL模块（支持HTTPS）
    --with-http_gzip_static_module # 启用Gzip静态压缩
    --with-http_stub_status_module # 启用状态监控模块
```

**编译并安装**

```bash
make               # 编译
sudo make install  # 安装
```

**验证安装**

```bash
/usr/local/nginx/sbin/nginx -v  # 查看版本
```

### Nginx 服务管理（systemctl） ###

无论哪种安装方式，都可通过 `systemctl` 管理服务（源码安装需手动配置服务文件，此处以包管理器安装为例）：

```bash
# 启动Nginx
sudo systemctl start nginx

# 停止Nginx
sudo systemctl stop nginx

# 重启Nginx
sudo systemctl restart nginx

# 重载配置（配置文件修改后推荐用，不中断服务）
sudo systemctl reload nginx

# 查看服务状态
sudo systemctl status nginx

# 设置开机自启
sudo systemctl enable nginx
```

## 三、Nginx 使用核心 ##

Nginx的所有功能都通过配置文件实现，理解配置结构是关键。主配置文件通常为 `nginx.conf`，其结构清晰，主要包含以下层级：

### 基础配置结构 ###

一个最基础的Nginx配置，需要一个events块才可以运行；如果需要接收http请求、提供web服务，就需要http块才能够生效。

http块中的server块用于配置虚拟主机，每个server块就是一个虚拟主机，多个虚拟主机可以监听不同的端口或域名，提供独立的服务。

```nginx
events {
    worker_connections 1024;        # 每个工作进程最大连接数
}

http {                              # HTTP服务配置
    server {                        # 虚拟主机配置
        listen 80;                  # 监听端口
        server_name example.com;    # 绑定域名/IP
        
        root /var/www/example;      # 网站根目录
    }
}
```

除此以外，我们可以通过添加location块，来配置不同的请求路径，对应不同的处理方式（如前后端分离）

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/example;
        index index.html; # 配置默认索引文件
    }
        
    location /api/ {
        proxy_pass http://backend_server; # 反向代理到后端服务
    }
}
```

以下是一个常用的单站点Nginx配置文件示例（也是我最常使用的），包含了基本的配置项以及常用的模块，可以修改example相关的字段后直接复制使用。

```nginx
user www-data;
worker_processes auto; 
pid /run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    include /etc/nginx/mime.types; # 文件类型映射
    default_type application/octet-stream;

    sendfile on; # 开启高效文件传输
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    server {
        listen 80;
        server_name localhost;
        location / {
            root /var/www/example;
            index index.html index.htm;
        }
        error_page 404 /404.html;
        location = /404.html {
            root /var/www/example/errors;
        }
    }

    gzip on;
    gzip_min_length 1000;
    gzip_comp_level 5;
    gzip_types 
        text/plain 
        text/css 
        text/javascript
        text/xml 
        application/json 
        application/javascript 
        application/xml+rss;
}
```

### 多站点配置 ###

Nginx支持配置多个虚拟主机（站点），每个站点可以监听不同的端口或域名，提供独立的服务。

如下示例，可以使用 `include` 指令，将多个站点的配置分离到不同的文件中，最后在主配置中按需引用，以此提高维护性和可读性。

```nginx
# /etc/nginx/sites-available/site1.conf
server {
    listen 80;
    server_name site1.example.com;
    root /var/www/site1;
    index index.html;
}
# /etc/nginx/sites-available/site2.conf
server {
    listen 80;
    server_name site2.example.com;
    root /var/www/site2;
    index index.html;
}
```

### 配置文件常用命令 ###

修改配置后，需先验证正确性，再重载生效：

```bash
nginx -t
nginx -T  # 详细输出
```

创建新配置后，建议保留原有历史配置，回滚时将配置文件一同回滚

```bash
cp nginx.conf nginx.conf.$(date +%s)
```

重载配置建议使用reload，而不是restart，防止正在运行的服务、请求瞬间中断，影响用户体验

```bash
sudo systemctl reload nginx
sudo systemctl restart nginx
```

## 四、常用使用场景 ##

> 以下是nginx常用的使用场景，每个场景都有对应的配置示例，帮助你快速实现所需功能。其中部分是笔者在工作中常用的场景，部分是从互联网上收集到的大佬配置，如果存在错误或不完整的地方，欢迎指正！

### 静态Web服务器 ###

静态资源托管是nginx最基础且常用的核心功能，适用于企业官网、营销网站、文档站点、个人博客和静态资源CDN等场景，尤其适合访问量大、对性能要求高的环境。通过高效处理大量并发的静态资源请求，结合缓存策略和压缩技术，nginx能显著减少网络传输量和服务器负载，降低成本并提升用户体验。

#### 基本配置示例 ####

```nginx
server {
    listen 80;
    server_name example.com;
    
    # 网站根目录设置
    root /var/www/html;
    
    # 默认索引文件
    index index.html index.htm;
    
    # 静态资源优化配置
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;  # 设置30天浏览器缓存
        add_header Cache-Control "public, max-age=2592000";
        access_log off;  # 关闭静态资源访问日志以减少I/O
    }
}
```

#### 性能优化关键参数 ####

- `sendfile on`：启用零拷贝技术，显著减少CPU开销和内存复制操作
- `gzip` 压缩：合理配置压缩策略，有效减少传输数据量
- 缓存策略：为不同类型的静态资源设置合适的缓存时间，减轻服务器压力
- TCP参数调优：优化 `tcp_nopush`、`tcp_nodelay` 等参数提升网络传输效率

### 文件下载服务器 ###

Nginx可高效构建文件下载服务，适用于软件下载站、企业内部文档分享平台、大文件传输服务和在线教育资源下载等需要稳定可靠文件传输的场景。它能高效处理大文件传输并支持断点续传，同时通过带宽限制保护服务器资源，确保多用户下载时的公平性，提供安全的文件访问控制和可监控的传输管理。

#### 基本配置示例 ####

```nginx
server {
    listen 80;
    server_name example.com;
    
    # 下载文件根目录
    root /var/www/example;
    
    # 启用目录自动索引功能
    location / {
        autoindex on;
        autoindex_exact_size off;
        autoindex_localtime on;
        charset utf-8;  # 支持中文文件名
    }
    
    # 限制大文件下载带宽
    location ~* \.(zip|rar|iso|img|tar\.gz)$ {
        limit_rate 500k;  # 限制下载速度为500KB/s
        limit_rate_after 10m;  # 已下载超过10MB后开始限速
        add_header Content-Disposition 'attachment';
        add_header Accept-Ranges bytes;  # 允许断点续传
    }
    
    # 记录下载日志
    location ~* \.(zip|rar|iso|img|tar\.gz)$ {
        access_log /var/log/nginx/downloads.log download_format;
    }
    
    # 自定义下载日志格式
    log_format download_format '$remote_addr - $remote_user [$time_local] '  
                              '"$request" $status $body_bytes_sent '  
                              '"$http_referer" "$http_user_agent" '  
                              '$request_time $sent_http_content_length';
}
```

#### 安全增强配置示例 ####

nginx提供了对文件下载服务的安全增强，包括限制单个IP的并发连接数、仅允许特定IP访问私有目录等。通过合理配置，能有效防止DDoS攻击、资源耗尽和未经授权的访问，确保下载服务的稳定性和安全性。

```nginx
# 限制单个IP的并发连接数
limit_conn_zone $binary_remote_addr zone=download_conn:10m;

server {
    # ... 其他配置 ...
    
    # 应用连接数限制
    location / {
        limit_conn download_conn 5;  # 每个IP最多5个并发连接
        # ... 其他配置 ...
    }
    
    # 限制访问特定目录
    location ~ /private/ {
        # 仅允许特定IP访问
        allow 192.168.1.0/24;
        deny all;
    }
}
```

### 反向代理与负载均衡 ###

反向代理是nginx的核心功能之一，适用于高流量网站、企业级应用、微服务架构和云原生应用等需要高可用性和可扩展性的场景。通过将客户端请求转发至后端服务器集群，结合负载均衡算法实现流量智能分配，nginx能有效解决单点故障问题，提高系统可用性并优化资源利用率。

#### 反向代理基础配置 ####

```nginx
server {
    listen 80;
    server_name api.example.com;
    
    location / {
        # 后端服务器地址
        proxy_pass http://backend_server;
        
        # 透传客户端信息
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 代理缓冲区优化
        proxy_buffers 16 16k;
        proxy_buffer_size 32k;
        proxy_busy_buffers_size 64k;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

#### 高级负载均衡配置 ####

nginx提供了多种负载均衡策略，包括轮询、加权轮询、IP哈希和最少连接数等。根据实际场景和需求，合理配置负载均衡策略能有效提升系统性能和可用性。

```nginx
http {
    # 定义上游服务器组
    upstream backend_servers {
        # 加权轮询 - 根据服务器性能分配请求
        server 192.168.1.101:8080 weight=3 max_fails=3 fail_timeout=30s;
        server 192.168.1.102:8080 weight=1 max_fails=3 fail_timeout=30s;
        
        # IP哈希 - 确保同一客户端总是访问同一服务器
        # ip_hash;
        
        # 最少连接数 - 智能分配负载
        # least_conn;
    }

    server {
        listen 80;
        server_name www.example.com;
        
        location / {
            proxy_pass http://backend_servers;
            # 透传客户端信息及缓冲区配置
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            
            # 启用上游响应超时重试（最多尝试2次）
            proxy_next_upstream error timeout http_500 http_502 http_503 http_504;
            proxy_next_upstream_tries 2;
        }
    }
}
```

#### 负载均衡策略详解 ####

- 轮询（Round Robin）：默认策略，请求依次分配到各服务器，适用于服务器性能相近的场景
- 加权轮询（Weighted Round Robin）：根据权重分配请求，权重值越高接收请求越多，适用于服务器性能不均的场景
- IP哈希（IP Hash）：基于客户端IP的哈希值分配请求，确保同一客户端总是访问同一服务器，实现会话保持
- 最少连接数（Least Connections）：请求优先分配给当前活跃连接数最少的服务器，适用于请求处理时间差异较大的场景

### HTTPS 安全配置 ###

HTTPS已成为现代网站的标准配置，适用于所有需要保护用户数据传输安全的网站和应用，特别是涉及用户登录、支付和个人信息处理的场景。nginx提供完善的SSL/TLS支持，可有效加密传输数据，防止窃听和篡改，同时验证网站身份，防止钓鱼网站和中间人攻击。不仅保护用户隐私，还能提升SEO排名并满足数据保护法规要求。

#### HTTPS配置示例 ####

```nginx
server {
    listen 443 ssl http2;  # 启用HTTP/2提升性能
    server_name secure.example.com;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/example.com.crt;        # 公钥证书
    ssl_certificate_key /etc/nginx/ssl/example.com.key;    # 私钥文件
    
    # SSL/TLS安全优化
    ssl_protocols TLSv1.2 TLSv1.3;  # 仅启用安全的TLS协议版本
    ssl_prefer_server_ciphers on;   # 优先使用服务器端密码套件
    
    # SSL密码套件
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    
    # 增加会话缓存大小和超时时间，提高TLS握手效率
    ssl_session_cache shared:SSL:20m;  # 会话缓存配置
    ssl_session_timeout 1d;           # 会话超时时间
    
    # 启用TLS会话票证，进一步提高性能
    ssl_session_tickets on;
    
    # OCSP Stapling配置（提升TLS握手速度）
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4;
    
    # HTTP严格传输安全（HSTS）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 网站内容配置
    root /var/www/secure;
    index index.html;
}

# HTTP请求强制重定向到HTTPS
server {
    listen 80;
    server_name secure.example.com;
    return 301 https://$server_name$request_uri;
}
```

### 前端单页应用（SPA）托管 ###

单页应用部署是nginx的重要应用场景，特别适合使用React、Vue、Angular等现代前端框架开发的前后端分离项目。nginx通过特殊配置可正确处理前端路由，确保SPA应用的路由功能正常工作，同时优化静态资源缓存策略，平衡性能和更新及时性。能有效实现前后端解耦，提高开发效率，并提供类似原生应用的流畅用户体验。

#### SPA优化配置示例 ####

```nginx
server {
    listen 80;
    server_name spa.example.com;
    root /var/www/spa/dist;
    index index.html;
    
    # 核心配置：处理前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://backend_api_server;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        access_log off;
    }
    
    # HTML不缓存
    location ~* \.html$ {
        expires -1;
    }
}
```

#### 关键技术要点 ####

- 路由重写：`try_files $uri $uri/ /index.html;` 是SPA配置的核心，确保所有URL都能正确解析到前端应用
- 缓存策略分离：为静态资源和HTML文件设置不同的缓存策略，平衡性能和更新及时性
- API代理：将API请求转发到后端服务，实现前后端分离架构
- 错误处理：将404错误指向index.html，确保前端路由能够处理所有路径

### 接口跨域与缓存加速 ###

接口跨域与缓存加速是前后端分离架构中的常见需求，nginx通过简单配置即可同时解决这两个问题，成为理想的API网关。它能有效实现跨域资源共享（CORS），解决前后端分离架构中的跨域限制，同时通过API响应缓存显著提升API响应速度，减少后端压力。适用于前端应用与后端API部署在不同域名的企业应用、第三方开发者接入的开放平台、高并发移动应用后端服务和数据分析系统等场景，能提高响应速度、降低服务器负载并简化前端开发。

#### 跨域配置示例（CORS） ####

```nginx
server {
    listen 80;
    server_name api.example.com;
    
    location / {
        # 核心CORS配置
        add_header 'Access-Control-Allow-Origin' 'https://example.com';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Credentials' 'true';
        
        # 处理预检请求
        if ($request_method = 'OPTIONS') {
            return 204;
        }
        
        # 代理配置
        proxy_pass http://backend_api_server;
    }
}
```

#### API响应缓存配置示例 ####

对于频繁访问的静态资源或高并发场景，nginx能将API响应缓存到内存中，减少对后端服务的请求次数。通过设置缓存有效期，能有效平衡系统负载和响应速度。

```nginx
http {
    # 定义缓存区域
    proxy_cache_path /var/cache/nginx/api_cache 
                    levels=1:2 
                    keys_zone=api_cache:10m 
                    max_size=1g 
                    inactive=60m;
    
    server {
        listen 80;
        server_name api.example.com;
        
        # 启用缓存的API路径
        location /api/cacheable {
            proxy_cache api_cache;
            proxy_cache_valid 200 5m;
            proxy_cache_valid 404 1m;
            add_header X-Cache-Status $upstream_cache_status;
            proxy_pass http://backend_api_server;
        }
        
        # 不缓存的API路径
        location /api/uncacheable {
            proxy_pass http://backend_api_server;
        }
    }
}
```

### 灰度发布与A/B测试 ###

灰度发布是现代DevOps实践的重要组成部分，nginx提供多种灵活的流量分配方式，支持灰度发布和A/B测试场景。适用于敏捷开发、持续交付的现代软件发布流程。通过将新版本逐步推送给部分用户，可有效降低发布风险，提前发现并解决潜在问题，同时实现精细化的流量控制。

#### 基于Cookie的灰度发布的配置示例 ####

基于Cookie的灰度发布通过检测客户端Cookie中的版本标识，将用户请求路由到不同的服务版本。这种方案适用于需要精准控制特定用户群体访问新版本的场景。

```nginx
server {
    listen 80;
    server_name app.example.com;
    
    location / {
        if ($http_cookie ~* "version=v2") {
            proxy_pass http://app_v2;
        }
        proxy_pass http://app_v1;
    }
}

# 定义后端服务器组
upstream app_v1 {
    server 127.0.0.1:8080;
}

upstream app_v2 {
    server 127.0.0.1:8081;
}
```

#### 基于百分比的流量分配的配置示例 ####

基于百分比的流量分配将流量按比例分配到不同版本的场景。nginx的split_clients模块，能根据用户特征（如IP、User-Agent等）将请求随机分配到不同的服务版本，实现精细化的流量控制。

```nginx
http {
    split_clients "${remote_addr}${http_user_agent}" $version {
        10%     v2;
        *       v1;
    }
    
    server {
        listen 80;
        server_name app.example.com;
        
        location / {
            proxy_pass http://${version}_servers;
            add_header X-App-Version $version;
        }
    }
}
```

#### 基于Header或IP的灰度控制的配置示例 ####

基于Header或IP的灰度控制能根据用户特征（如自定义Header、IP地址等）将请求路由到不同的服务版本，实现精细化的流量分配。

```nginx
server {
    listen 80;
    server_name app.example.com;
    
    location / {
        # 基于自定义Header分流
        if ($http_x_app_version = "v2") {
            proxy_pass http://v2_servers;
        }
        # 基于内部IP分流
        if ($remote_addr ~* "192\.168\.1\.(100|101|102)") {
            proxy_pass http://v2_servers;
        }
        # 默认路由
        proxy_pass http://v1_servers;
    }
}
```

### 安全防护：限流、黑白名单与WAF集成 ###

nginx提供多层次的安全防护机制，适用于所有需要抵御网络攻击、保护系统安全的Web服务，特别是面向公网的高价值系统和敏感业务应用。通过请求限流可防止系统过载和DoS攻击，使用IP黑白名单能精确控制访问权限，集成WAF可抵御SQL注入、XSS等常见Web攻击，构建纵深防御体系。

#### 请求限流配置示例 ####

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=per_ip_conn:10m;
    
    server {
        listen 80;
        server_name api.example.com;
        
        # 登录接口保护
        location /api/login {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://backend_api;
        }
        
        # 下载接口保护
        location /api/download {
            limit_conn per_ip_conn 10;
            proxy_pass http://backend_api;
        }
    }
}
```

#### IP黑白名单配置示例 ####

```nginx
http {
    # IP地址组配置
    geo $blocked_ip {
        default 0;
        1.2.3.4 1;
        5.6.7.0/24 1;
    }
    
    geo $trusted_ip {
        default 0;
        127.0.0.1 1;
        192.168.1.0/24 1;
    }
    
    server {
        listen 80;
        server_name secure.example.com;
        
        # 全局黑名单过滤
        if ($blocked_ip = 1) {
            return 403;
        }
        
        location / {
            root /var/www/html;
            index index.html;
        }
        
        # 管理后台访问控制
        location /admin {
            if ($trusted_ip != 1) {
                return 403;
            }
            proxy_pass http://backend_admin;
        }
    }
}
```

#### ModSecurity WAF集成配置示例 ####

ModSecurity是一个开源的Web应用防火墙(WAF)，可以集成到nginx中，用于保护Web应用免受各类攻击，如SQL注入、XSS跨站脚本、CSRF跨站请求伪造等常见Web攻击。

```nginx
http {
    # 全局WAF配置
    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsecurity/main.conf;
    
    server {
        listen 80;
        server_name app.example.com;
        
        location / {
            modsecurity_rules 'SecRuleEngine On';
            
            proxy_pass http://backend_app;
        }
    }
}
```

### 日志管理与监控 ###

日志管理与监控是保障服务稳定运行的关键，适用于所有需要保障服务稳定性、进行性能优化和问题排查的生产环境。nginx提供灵活的日志配置和丰富的监控集成能力，通过日志分析可快速定位和解决系统问题，同时实时监控系统性能指标，提前发现潜在风险。

#### 高级日志配置示例 ####

```nginx
http {
    # 基本日志配置
    access_log /var/log/nginx/access.log combined;
    error_log /var/log/nginx/error.log warn;
    
    # 自定义日志格式
    log_format detailed '$remote_addr - $remote_user [$time_local] ' \
                       '"$request" $status $body_bytes_sent ' \
                       '$request_time $upstream_response_time';
    
    log_format performance '$remote_addr - $request_time - $upstream_response_time - "$request" $status';
    
    server {
        listen 80;
        server_name app.example.com;
        
        access_log /var/log/nginx/app_access.log detailed;
        
        # 性能监控
        location /api/performance-critical {
            access_log /var/log/nginx/performance.log performance;
            proxy_pass http://backend_api;
        }
        
        # 静态资源优化
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            access_log off;
            expires 30d;
        }
    }
}
```

#### Prometheus监控集成示例 ####

```nginx
# 确保已安装nginx-module-vts模块
http {
    # 启用虚拟主机流量状态监控
    vhost_traffic_status_zone;
    
    # 监控模块全局配置
    vhost_traffic_status_filter_by_host on; # 按虚拟主机过滤
    
    server {
        listen 80;
        server_name monitor.example.com;
        
        # 监控数据访问端点 - HTML格式
        location /status {
            vhost_traffic_status_display;
            vhost_traffic_status_display_format html;
            
            # 严格限制访问来源
            allow 127.0.0.1;
            allow 192.168.1.0/24;
            deny all;
        }
        
        # Prometheus指标采集端点
        location /status/format/prometheus {
            vhost_traffic_status_display;
            vhost_traffic_status_display_format prometheus;
            
            # 严格限制访问来源
            allow 192.168.1.5; # Prometheus服务器IP
            deny all;
        }
    }
}
```

## 结语 ##

nginx凭借其高性能、多功能、低资源占用和强大的社区支持，成为现代Web架构中的关键基础设施。但真正的“高可用”不仅靠软件，更靠背后持续迭代的运维老哥。愿你们在每一次reload之后，都能收获0中断的成就感；也欢迎在评论区留下你的踩坑故事，让这份笔记成为更多人脚下的稳固石板。
