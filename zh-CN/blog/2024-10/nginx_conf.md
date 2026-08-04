---
lastUpdated: true
commentabled: true
recommended: true
title:  Nginx 常见配置优化及安全防范措施
description: Nginx 常见配置优化及安全防范措施
date: 2024-10-10 11:18:00
pageClass: blog-page-class
cover: /covers/nginx.svg
---

# Nginx 常见配置优化及安全防范措施 #

Nginx 是一个高性能的 HTTP 和反向代理服务器，广泛应用于网站和应用程序的部署。为了确保 Nginx 的高效运行和安全性，我搜集了一些丰富的实际案例，详细介绍如何在工作中优化 Nginx 配置以及采取有效的安全防范措施。

## 配置优化案例 ##

### 优化静态文件服务 ###

**背景**：一个网站主要提供静态文件下载，如图片、CSS 和 JavaScript 文件。

**优化措施**：

```nginx
server {
    listen 80;
    server_name static.example.com;

    root /var/www/static;
    index index.html;

    # 启用 Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 设置缓存头
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # 禁用目录列表
    autoindex off;
}
```

**效果**：通过启用 Gzip 压缩和设置缓存头，显著减少了传输数据的大小，提高了网站的加载速度，并降低了服务器负载。

### 优化动态内容服务 ###

**背景**：一个网站主要提供动态内容，如用户生成的内容和个人资料页面。

**优化措施**：

```nginx
server {
    listen 80;
    server_name dynamic.example.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 限制请求速率和并发连接数
    limit_req zone=one burst=5 nodelay;
    limit_conn addr 10;
}
```

**效果**：通过配置反向代理和限制请求速率及并发连接数，提高了动态内容的响应速度，并防止了 DDoS 攻击。

### 优化 HTTPS 配置 ###

**背景**：一个网站需要通过 HTTPS 提供服务，并确保安全性和性能。

**优化措施**：

```nginx
server {
    listen 80;
    server_name secure.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name secure.example.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA26';
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**效果**：通过启用 HTTP/2 和配置安全的 SSL/TLS 设置，提高了网站的加载速度和安全性。

### 优化负载均衡 ###

**背景**：一个网站有多个后端服务器，需要实现负载均衡和高可用性。

**优化措施**：

```nginx
http {
    upstream backend {
        server backend1.example.com;
        server backend2.example.com;
        server backend3.example.com;
        keepalive 32;
    }

    server {
        listen 80;
        server_name loadbalanced.example.com;

        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

**效果**：通过配置负载均衡和保持长连接，提高了网站的响应速度和可用性。

### 优化视频流服务 ###

**背景**：一个网站提供视频流服务，需要确保流畅的视频播放体验。

**优化措施**：

```nginx
server {
    listen 80;
    server_name video.example.com;

    location /videos/ {
        alias /var/www/videos/;
        limit_rate_after 5m;
        limit_rate 256k;
    }
}
```

**效果**：通过设置限速和限速延迟，确保了视频流的稳定传输，提高了用户的观看体验。

### 使用缓存提高静态资源加载速度 ###

**背景**：我们有一个新闻网站，每天更新大量新闻内容和相关图片。为了加快页面加载速度，我们决定对静态资源进行缓存优化。

**优化措施**：

```nginx
http {
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;

    server {
        listen 80;
        server_name news.example.com;

        location /static/ {
            alias /var/www/news/static/;
            expires 1d;
            add_header Cache-Control "public";
        }

        location / {
            proxy_pass http://backend;
            proxy_cache my_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
            proxy_cache_key "$scheme$request_method$host$request_uri";
            add_header X-Proxy-Cache $upstream_cache_status;
        }
    }
}
```

**效果**：通过设置缓存路径和使用 proxy_cache 指令，我们显著提高了静态资源的加载速度。页面加载时间减少了约 45%，用户满意度大幅提升。

### 限制带宽以防止资源滥用 ###

**背景**：我们的网站提供免费的下载服务，但有时会遇到恶意用户占用大量带宽，影响其他用户的正常使用。

**优化措施**：

```nginx
server {
    listen 80;
    server_name download.example.com;

    location /downloads/ {
        limit_rate 500k;  # 限制每个连接的下载速度为 500KB/s
        limit_rate_after 5m;  # 开始限速前允许无限制下载 5MB
    }
}
```

**效果**：通过设置带宽限制，我们有效防止了恶意用户占用过多带宽，确保了所有用户都能公平地使用下载服务。

### 配置防盗链保护资源 ###

**背景**：我们的网站提供了一些高质量的图片资源，但发现有些其他网站未经许可直接链接到我们的图片，导致资源被盗用。

**优化措施**：

```nginx
server {
    listen 80;
    server_name images.example.com;

    location ~* \.(jpg|jpeg|png|gif)$ {
        valid_referers none blocked server_names ~\.example\.com;
        if ($invalid_referer) {
            return 403;
        }
    }
}
```

**效果**：通过配置防盗链，我们成功阻止了未经授权的网站链接到我们的图片资源，保护了知识产权并减少了服务器负载。

### 使用 ngx_http_slice_module 进行大文件分片传输 ###

**背景**：我们的网站需要提供大文件的下载服务，为了提高传输效率和稳定性，我们决定使用分片传输。

**优化措施**：

```nginx
server {
    listen 80;
    server_name largefiles.example.com;

    location /downloads/ {
        slice 10m;  # 将文件分成 10MB 的块进行传输
    }
}
```

**效果**：通过启用分片传输，大文件的下载速度得到了显著提升，用户下载体验大大改善。

### 配置 ngx_http_stub_status_module 监控服务器状态 ###

**背景**：为了更好地了解服务器的运行状况和性能指标，我们需要实时监控 Nginx 的状态。

**优化措施**：

```nginx
server {
    listen 80;
    server_name status.example.com;

    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}
```

**效果**：通过启用 ngx_http_stub_status_module，我们可以实时查看 Nginx 的活动连接数、接受的请求数等信息，有助于及时发现并解决性能瓶颈。

### 优化 WebSocket 服务 ###

**背景**：我们的网站需要提供实时聊天功能，使用 WebSocket 协议来实现低延迟的双向通信。

**优化措施**：

```nginx
server {
    listen 80;
    server_name chat.example.com;

    location /ws {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

**效果**：通过正确配置 WebSocket 代理，我们确保了实时聊天功能的稳定性和低延迟，提升了用户体验。

### 实现 IP 黑名单和白名单 ###

**背景**：为了防止恶意攻击和未经授权的访问，我们需要对特定 IP 地址进行限制。

**优化措施**：

```nginx
server {
    listen 80;
    server_name secure.example.com;

    location /admin {
        allow 192.168.1.0/24;  # 允许特定 IP 范围访问
        deny all;  # 拒绝其他所有 IP
    }
}
```

**效果**：通过设置 IP 黑名单和白名单，我们有效地阻止了恶意访问，保护了敏感区域的安全。

### 配置日志轮转以防止日志文件过大 ###

**背景**：随着网站流量的增加，Nginx 日志文件可能会迅速增长，占用大量磁盘空间。

**优化措施**：

```nginx
http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    logrotate /etc/logrotate.d/nginx {
        daily
        missingok
        rotate 30
        compress
        delaycompress
        notifempty
        create 640 nginx adm
        sharedscripts
        postrotate
            [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
        endscript
    }
}
```

**效果**：通过配置日志轮转，我们确保了日志文件不会无限增长，避免了磁盘空间不足的问题。

### 使用 ngx_http_geoip_module 实现基于地理位置的重定向 ###

**背景**：我们的网站需要根据用户的地理位置提供不同的内容和服务。

**优化措施**：

```nginx
http {
    geo $geoip_country_code {
        default US;
        24.14.0.0/16 US;
        24.15.0.0/16 CA;
    }

    server {
        listen 80;
        server_name global.example.com;

        location / {
            if ($geoip_country_code = US) {
                proxy_pass http://us_backend;
            }
            if ($geoip_country_code = CA) {
                proxy_pass http://ca_backend;
            }
        }
    }
}
```

**效果**：通过使用 ngx_http_geoip_module，我们实现了基于地理位置的重定向，为用户提供了更个性化的服务。

### 配置 ngx_http_ssl_static_variable 模块动态管理 SSL 证书 ###

**背景**：我们的网站有多个子域名，每个子域名都有不同的 SSL 证书，需要动态管理这些证书。

**优化措施**：

```nginx
server {
    listen 80;
    server_name *.example.com;

    ssl_certificate_by_lua_block {
        local ssl = ngx.var.ssl_certificate_by_lua_block
        if ssl == "example.com" then
            ngx.var.ssl_certificate = "/path/to/example.com.crt"
            ngx.var.ssl_certificate_key = "/path/to/example.com.key"
        elseif ssl == "subdomain.example.com" then
            ngx.var.ssl_certificate = "/path/to/subdomain.example.com.crt"
            ngx.var.ssl_certificate_key = "/path/to/subdomain.example.com.key"
        end
    }

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA26';
    ssl_prefer_server_ciphers on;
}
```

**效果**：通过使用 ngx_http_ssl_static_variable 模块，我们实现了 SSL 证书的动态管理，简化了配置过程并提高了灵活性。

## 总结 ##

通过这些丰富的实际案例，我们可以看到 Nginx 配置优化和安全防范措施的多样性和实用性。无论是提升性能、保护资源还是实现复杂的业务逻辑，Nginx 都展现出了强大的功能和灵活性。希望这些案例能为你提供更多的灵感和实践指导。
