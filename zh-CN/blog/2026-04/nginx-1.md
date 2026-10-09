---
lastUpdated: true
commentabled: true
recommended: true
title: Nginx 生产环境配置完全指南
description: 从安全加固到性能调优
date: 2026-04-30 09:20:00 
pageClass: blog-page-class
cover: /covers/nginx.svg
---

> 本文系统梳理 Nginx 在生产环境中常用的配置项，每个配置都附带解决的问题和实际应用场景，帮助你构建健壮、安全、高性能的 Web 服务。

## 一、基础安全配置 ##

### 隐藏 Nginx 版本信息 ###

```nginx
http {
    server_tokens off;
}
```

解决的问题：防止攻击者通过版本号查找已知漏洞（如 `nginx/1.18.0` 暴露后可直接搜索该版本的 CVE）。

验证：

```bash
curl -I http://your-site.com
# 没有 server_tokens 时：Server: nginx/1.18.0
# 开启后：Server: nginx
```

### 限制请求方法与大小 ###

```nginx
server {
    # 只允许常见 HTTP 方法
    if ($request_method !~ ^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)$) {
        return 405;
    }
    
    # 限制请求体大小（防止恶意上传超大文件耗尽内存）
    client_max_body_size 10M;
    client_body_buffer_size 128k;
    
    # 限制请求头大小（防止 Slowloris 攻击）
    large_client_header_buffers 4 16k;
}
```


|  配置   |   解决的问题 |
| :-----------: | :-----------: |
|    `client_max_body_size` |   防止恶意上传超大文件导致内存耗尽   |
|    `client_body_buffer_size` |  控制请求体缓冲区，超出部分写入临时文件  |
|    `large_client_header_buffers` |   防止通过超长请求头进行的 DoS 攻击  |

### 禁用不安全的 HTTP 方法 ###

```nginx
location / {
    # 显式拒绝 TRACE 和 TRACK 方法（可能用于 XST 攻击）
    if ($request_method ~ ^(TRACE|TRACK)$) {
        return 405;
    }
}
```

## 二、HTTPS / SSL 安全配置 ##

### 强制 HTTPS 跳转 ###

```nginx
server {
    listen 80;
    server_name example.com;
    # 301 永久重定向到 HTTPS
    return 301 https://$host$request_uri;
}
```

解决的问题：确保所有流量走加密通道，防止中间人窃听。

### 现代 TLS 配置 ###

```nginx
server {
    listen 443 ssl http2;
    
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # 只启用安全的 TLS 版本
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # 强加密套件，优先使用 ECDHE 实现前向保密
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    
    ssl_prefer_server_ciphers on;
    
    # 会话复用，减少 TLS 握手开销
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    # OCSP Stapling，加速证书验证
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 1.1.1.1 8.8.8.8 valid=300s;
}
```

|  配置   |   解决的问题  |
| :-----------: | :-----------: |
|    `ssl_protocols TLSv1.2 TLSv1.3` |  禁用存在漏洞的 SSLv2/3 和 TLSv1.0/1.1  |
|    `ssl_ciphers` |   只使用强加密算法，防止降级攻击 |
|    `ssl_session_cache` |   复用 TLS 会话，减少握手延迟  |
|    `ssl_stapling` |   服务器主动提供证书吊销状态，避免客户端额外查询  |

### HSTS（HTTP Strict Transport Security） ###

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

解决的问题：告诉浏览器永远用 HTTPS 访问该域名（包括子域名），防止 SSL 剥离攻击。

> ⚠️ 注意：确保 HTTPS 完全配置好再开启，否则会导致网站无法通过 HTTP 访问。

## 三、安全响应头（Security Headers） ##

### 完整的 Security Headers 配置 ###

```nginx
# 防止点击劫持
add_header X-Frame-Options "SAMEORIGIN" always;

# 防止 MIME 类型嗅探（如把 .jpg 当脚本执行）
add_header X-Content-Type-Options "nosniff" always;

# 启用 XSS 过滤器（现代浏览器已废弃，但仍建议保留兼容）
add_header X-XSS-Protection "1; mode=block" always;

# 控制 Referer 信息泄露
add_header Referrer-Policy "no-referrer-when-downgrade" always;

# 内容安全策略（CSP），限制资源加载来源
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'self';" always;

# 限制浏览器功能权限
add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;
```

|  响应头   |   解决的问题  |
| :-----------: | :-----------: |
|    `X-Frame-Options` |  点击劫持（Clickjacking）  |
|    `X-Content-Type-Options` |  MIME 嗅探攻击  |
|    `X-XSS-Protection` |  反射型 XSS（浏览器层面）  |
|    `Referrer-Policy` |  Referer 信息泄露（如从含 token 的 URL 跳转）  |
|    `Content-Security-Policy` |  XSS、数据注入、恶意资源加载  |
|    `Permissions-Policy` |  限制不必要的浏览器 API 权限  |

### CSP frame-ancestors 替代 X-Frame-Options ###

```nginx
# 更灵活的方案：允许指定域名嵌入
add_header Content-Security-Policy "frame-ancestors 'self' https://partner.example.com;" always;
```

解决的问题：`X-Frame-Options` 只能设 `DENY` 或 `SAMEORIGIN`，无法指定具体域名。frame-ancestors 可以精确控制哪些网站可以嵌入你的页面。

## 四、防盗链与访问控制 ##

### 图片/资源防盗链 ###

```nginx
location ~* \.(gif|jpg|jpeg|png|bmp|swf|flv|mp4|ico)$ {
    # 允许空 Referer 和本域名
    valid_referers none blocked server_names *.example.com;
    
    if ($invalid_referer) {
        # 返回 403 或重定向到警告图
        return 403;
        # 或：rewrite ^/ https://example.com/forbidden.png break;
    }
}
```

解决的问题：防止其他网站直接引用你的图片/视频资源，消耗你的带宽和流量。

### IP 黑名单/白名单 ###

```nginx
# 黑名单：拒绝特定 IP
location /admin {
    deny 192.168.1.100;
    deny 10.0.0.0/24;
    allow all;
}

# 白名单：只允许特定 IP 访问
location /api/internal {
    allow 192.168.1.0/24;
    allow 10.0.0.5;
    deny all;
}
```

### 目录遍历防护 ###

```nginx
location ~ /\. {
    # 拒绝访问隐藏文件（.git, .env, .htaccess 等）
    deny all;
    access_log off;
    log_not_found off;
}

location ~* \.(git|svn|htaccess|env)$ {
    deny all;
}
```

解决的问题：防止攻击者访问 `.git` 目录、`.env` 文件等敏感文件泄露源代码或密钥。

## 五、限流与防攻击 ##

### 请求速率限制（Rate Limiting） ###

```nginx
http {
    # 定义限流区域：按 IP 限制，10MB 内存存储状态，每秒 10 个请求
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    
    # 针对登录接口更严格
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # 按 IP 限制并发连接数
    limit_conn_zone $binary_remote_addr zone=addr:10m;
}

server {
    location / {
        # 突发 20 个请求，不延迟处理（超出直接 503）
        limit_req zone=general burst=20 nodelay;
        
        # 限制单个 IP 最多 10 个并发连接
        limit_conn addr 10;
    }
    
    location /api/login {
        # 登录接口更严格：每秒 1 次
        limit_req zone=login burst=5 nodelay;
    }
}
```

|  配置   |   解决的问题  |
| :-----------: | :-----------: |
|    `limit_req` |  防止接口被暴力刷、爬虫过度抓取  |
|    `limit_conn` |  防止单个 IP 占用过多连接资源  |
|    `burst` |  允许短时间突发请求，平滑处理  |
|    `nodelay` |  不排队，超出直接拒绝（降低延迟）  |

### 防 Slowloris / Slow POST 攻击 ###

```nginx
http {
    # 读取客户端请求头的超时时间
    client_header_timeout 10s;
    
    # 读取客户端请求体的超时时间
    client_body_timeout 10s;
    
    # 发送响应的超时时间
    send_timeout 10s;
}
```

解决的问题：Slowloris 攻击通过缓慢发送请求头/体占用连接，导致正常用户无法连接。

## 六、性能优化配置 ##

### Gzip / Brotli 压缩 ###

```nginx
http {
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml;
    
    # Brotli 压缩（需要编译 ngx_brotli 模块，压缩率比 gzip 高 15-25%）
    # brotli on;
    # brotli_comp_level 5;
    # brotli_types text/plain text/css application/javascript application/json;
}
```

解决的问题：减少传输体积，提升页面加载速度。文本类资源通常可压缩 60-80%。

### 静态资源缓存 ###

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|otf)$ {
    # 强缓存：30 天
    expires 30d;
    add_header Cache-Control "public, immutable";
    
    # 禁用日志减少 I/O
    access_log off;
}

location ~* \.(html|htm)$ {
    # HTML 不缓存或短时间缓存
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```


|  配置   |   解决的问题  |
| :-----------: | :-----------: |
|    `expires 30d` |  强缓存，浏览器 30 天内不再请求  |
|    `immutable` |  声明资源永不改变，连条件请求（304）都跳过  |
|    `access_log off` |  静态资源访问不记录日志，减少磁盘 I/O  |

### 高效文件传输 ###

```nginx
http {
    # 内核态直接传输文件，零拷贝
    sendfile on;
    
    # 累积到一定大小再发送（配合 sendfile）
    tcp_nopush on;
    
    # 立即发送小数据包（降低延迟）
    tcp_nodelay on;
}
```

解决的问题：

- `sendfile`：避免数据在用户态和内核态之间拷贝，大幅提升静态文件传输性能
- `tcp_nopush` + `tcp_nodelay`：平衡吞吐量和延迟

### 长连接优化 ###

```nginx
http {
    # 长连接保持时间
    keepalive_timeout 30s;
    
    # 单个长连接最大请求数
    keepalive_requests 1000;
    
    # 与后端服务保持长连接（反向代理场景）
    upstream backend {
        server 127.0.0.1:8080;
        keepalive 32;  # 保持 32 个空闲连接
    }
}
```

解决的问题：减少 TCP 握手开销，提升高并发下的性能。

## 七、反向代理配置 ##

### 完整的反向代理配置 ###

```nginx
upstream backend {
    server 127.0.0.1:3000 weight=5;
    server 127.0.0.1:3001 weight=5;
    server 127.0.0.1:3002 backup;  # 备用节点
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;
    
    location / {
        proxy_pass http://backend;
        
        # 传递真实客户端 IP
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 代理相关优化
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # 超时配置
        proxy_connect_timeout 5s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
        
        # 缓冲区
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
}
```

|  配置   |   解决的问题  |
| :-----------: | :-----------: |
|    `X-Forwarded-For` |  后端服务获取真实客户端 IP（而非 Nginx IP）  |
|    `X-Forwarded-Proto` |  后端服务知道原始请求是 HTTP 还是 HTTPS  |
|    `proxy_buffering` |  缓冲后端响应，优化传输效率  |
|    `keepalive` |  与后端保持长连接，减少 TCP 建立开销  |

## 八、日志配置 ##

### 结构化日志与性能监控 ###

```nginx
http {
    # 自定义日志格式（含性能指标）
    log_format performance '$remote_addr - $remote_user [$time_local] '
                           '"$request" $status $body_bytes_sent '
                           'rt=$request_time '
                           'uct="$upstream_connect_time" '
                           'uht="$upstream_header_time" '
                           'urt="$upstream_response_time"';
    
    # JSON 格式（便于 ELK / Grafana 解析）
    log_format json_combined escape=json '{'
        '"time":"$time_iso8601",'
        '"remote_addr":"$remote_addr",'
        '"request":"$request",'
        '"status":$status,'
        '"request_time":$request_time,'
        '"upstream_response_time":"$upstream_response_time",'
        '"body_bytes_sent":$body_bytes_sent,'
        '"http_referer":"$http_referer",'
        '"http_user_agent":"$http_user_agent"'
    '}';
    
    # 主日志
    access_log /var/log/nginx/access.log performance buffer=32k flush=5s;
    
    # API 专用 JSON 日志
    access_log /var/log/nginx/api.log json_combined;
}
```

解决的问题：便于排查慢请求、监控后端服务健康状态、对接日志分析系统。

## 九、完整配置模板 ##

```nginx
# /etc/nginx/nginx.conf

user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;
pid /run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # 基础设置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 30;
    keepalive_requests 1000;
    types_hash_max_size 2048;
    server_tokens off;
    
    # 缓冲区
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    
    # 超时
    client_header_timeout 10s;
    client_body_timeout 10s;
    send_timeout 10s;
    
    # 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types text/plain text/css text/javascript application/javascript application/json application/xml image/svg+xml;
    
    # MIME 类型
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 日志
    log_format performance '$remote_addr - $remote_user [$time_local] '
                           '"$request" $status $body_bytes_sent '
                           'rt=$request_time uct="$upstream_connect_time" '
                           'uht="$upstream_header_time" urt="$upstream_response_time"';
    access_log /var/log/nginx/access.log performance buffer=32k flush=5s;
    error_log /var/log/nginx/error.log warn;
    
    # 限流
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    
    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # 引入站点配置
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

## 总结速查表 ##


|  类别   |   配置  |  解决的核心问题  |
| :-----------: | :-----------: |:-----------: |
|    信息隐藏 |  `server_tokens off`  |  版本信息泄露  |
|    传输安全 |  `ssl_protocols TLSv1.2 TLSv1.3`  |  中间人攻击、协议降级  |
|    劫持防护 |  `X-Frame-Options` / `frame-ancestors`  |  点击劫持  |
|    注入防护 |  `X-Content-Type-Options` / CSP  |  XSS、MIME 嗅探  |
|    资源盗用 |  `valid_referers`  |  带宽被盗  |
|    暴力破解 |  `limit_req` / `limit_conn`  |  接口被刷、DDoS  |
|    连接耗尽 |  各种 `timeout`  |  Slowloris 攻击  |
|    传输优化 |  `gzip` / `sendfile` / `keepalive`  |  加载慢、高延迟  |
|    缓存策略 |  `expires` / `Cache-Control`  |  重复请求、带宽浪费  |

> 💡 建议：配置修改后务必执行 `nginx -t` 检查语法，再用 `nginx -s reload` 平滑重载，避免服务中断。
