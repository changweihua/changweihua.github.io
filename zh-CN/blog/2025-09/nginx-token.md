---
lastUpdated: true
commentabled: true
recommended: true
title: iframe 的 src 链接里带了参数（比如 token 或签名），想在 Nginx 层做鉴权
description: iframe 的 src 链接里带了参数（比如 token 或签名），想在 Nginx 层做鉴权
date: 2025-09-28 16:00:00 
pageClass: blog-page-class
cover: /covers/Nginx.svg
---

> 这类需求常见于：父页面给子 iframe 一个「临时授权链接」，Nginx 校验合法性后才允许访问。

## 基础思路 ##

1. 前端 iframe 带参数

```html
<iframe src="https://example.com/app?token=abc123"></iframe>
```

2. Nginx 拦截请求，读取 URL 参数（`token`）

3. 校验 `token` 是否合法：

  - 简单场景：和预设值比对
  - 复杂场景：交给后端鉴权服务检查

4. 如果合法 → 继续代理目标内容
5. 如果非法 → 返回 403/重定向到错误页

## Nginx 配置示例 ##

### 简单校验固定 token ###

```nginx
server {
    listen 80;
    server_name example.com;

    location /app {
        # 提取 token 参数
        if ($arg_token != "abc123") {
            return 403;   # token 不对，禁止访问
        }

        root /var/www/html;  # 或者 proxy_pass 到后端
        index index.html;
    }
}
```

这里 `$arg_token` 表示 URL 里的 `?token=xxx` 参数。

### 使用子请求交给后端鉴权 ###

如果 `token` 是动态的，需要和数据库/Redis 校验，可以让 `Nginx` 请求一个鉴权接口：

```nginx
server {
    listen 80;
    server_name example.com;

    location /app {
        auth_request /auth;   # 鉴权子请求
        proxy_pass http://backend/app;  # 通过鉴权才继续访问
    }

    # 鉴权子请求
    location = /auth {
        internal;
        proxy_pass http://auth-service/check?token=$arg_token;

        # 如果 auth-service 返回 2xx → 允许
        # 如果返回 401/403 → 拦截
    }
}
```

这里用到了 `auth_request` 模块，Nginx 会先访问 `/auth`，拿返回码作为是否放行的依据。

### 更安全的做法 ###

直接把 token 放 URL 参数有几个风险：

- 会出现在浏览器历史、日志、Referer
- 有被泄露的可能

👉 更安全的方式：

- *短期有效的签名 URL*（类似阿里云 OSS / AWS S3 的 presigned URL）
- 或者在前端设置 Cookie，再让 Nginx 校验 Cookie

## 总结 ##

用 `$arg_token` 可以直接在 Nginx 层校验参数
更复杂的逻辑用 `auth_request` 转发到后端校验
如果安全要求高，建议用 *短期签名 URL* 或 *Cookie* 代替 query 参数
