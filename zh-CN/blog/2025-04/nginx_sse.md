---
lastUpdated: true
commentabled: true
recommended: true
title: nginx 反向代理后SSE连接无效的问题
description: nginx 反向代理后SSE连接无效的问题
date: 2025-04-09 10:00:00
pageClass: blog-page-class
cover: /covers/nginx.svg
---

# nginx 反向代理后SSE连接无效的问题 #

## 增加配置 ##

```nginx
proxy_buffering off;
```

> 在使用 Nginx 作为反向代理时，如果未配置 proxy_buffering off;，可能会导致 Server-Sent Events (SSE) 连接没有响应。这是因为 Nginx 默认启用了缓冲机制，这会导致 SSE 事件被缓冲，而不是立即传递给客户端。以下是详细解释和解决方案：

## 问题分析 ##

### Nginx 缓冲机制 ###

- **默认行为**：Nginx 默认会缓冲代理请求和响应数据。这意味着 SSE 事件会被缓存，直到缓冲区满或达到一定时间间隔，然后一次性发送给客户端。
- **影响 SSE**：SSE 依赖于实时推送事件，如果事件被缓冲，客户端将无法及时收到这些事件，导致连接看起来没有响应。

### proxy_buffering 指令 ###

- **作用**：控制 Nginx 是否对代理请求和响应进行缓冲。
- **默认值**：on（开启缓冲）。

```nginx
location /api/ {
        proxy_pass http://api.com/;

        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, DELETE, PATCH, PUT' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization,DNT,User-Agent,Keep-Alive,Content-Type,accept,origin,X-Requested-With' always;
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' $http_origin always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, DELETE, PATCH, PUT' always;
            add_header 'Access-Control-Max-Age' 1728000;

            add_header 'Content-Type' 'application/json;charset=UTF-8';
            add_header 'Access-Control-Allow-Headers' 'Authorization,DNT,User-Agent,Keep-Alive,Content-Type,accept,origin,X-Requested-With' always;
            add_header 'Content-Length' 0;
            return 204;
        }
        proxy_redirect default;
        proxy_cookie_path ~*^/.* /;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header REMOTE-HOST $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 8192m;

        proxy_buffering off;
        # proxy_cache off;
        # keepalive_timeout 3600s;
        # proxy_connect_timeout 18000;
        # proxy_send_timeout 18000;
        # proxy_read_timeout 18000;
    }

    location /im-ws {
        proxy_pass http://api.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_connect_timeout 3600s;
    }
```
