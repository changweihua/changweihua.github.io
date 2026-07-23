---
lastUpdated: true
commentabled: true
recommended: true
title: Nginx 搭建支持多版本和前端路由的静态网站
description: Nginx 搭建支持多版本和前端路由的静态网站
date: 2025-09-19 10:00:00 
pageClass: blog-page-class
cover: /covers/nginx.svg
---

在你的场景下，`history/` 目录是上一个版本，`main/` 目录是当前版本。你希望通过 Nginx 反向代理，并利用 `try_files` 机制，使页面刷新时仍能正常访问（避免 404），同时支持 SPA 前端路由，并且能够切换不同版本的资源。

## 一、Nginx 解决方案 ##

你可以使用 `try_files` 结合 `main/` 和 `history/` 目录，实现：

- 默认加载 `main/` 版本
- 如果 `main/` 目录找不到资源，就回退到 `history/`
- 支持前端 SPA 刷新

### Nginx 配置 ###

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /main/index.html;
    }

    # 代理 main 版本
    location /main/ {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /main/index.html;
    }

    # 代理 history 版本（如果 main 目录找不到文件，则回退到 history 版本）
    location /history/ {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /history/index.html;
    }

    # 处理前端路由刷新 404 问题
    location /app/ {
        root /var/www/html;
        index index.html;
        try_files $uri /main/index.html;
    }

    error_page 404 /main/index.html;
}
```

## 二、关键点解析 ##

**`try_files $uri $uri/ /main/index.html`**

先尝试访问请求的静态文件 ( `$uri` )，如果找不到，再尝试访问目录 ( `$uri/` )，最后回退到 `main/index.html` 处理 SPA 路由。

**支持 `main/` 和 `history/` 目录**

- `/main/` 目录是当前版本，默认使用它。
- `/history/` 目录是上一个版本，如果 `main/` 目录中找不到资源，就会尝试从 `history/` 目录加载。

**`error_page 404 /main/index.html`**

- 避免用户直接刷新时 404，Nginx 会回退到 `main/index.html` 让前端框架处理路由。

## 三、前端如何切换版本？ ##

### 通过 URL 参数控制 ###

你可以在前端代码中检测 URL 参数，如 `?version=history`，然后动态切换资源：

```ts
const version = new URLSearchParams(window.location.search).get("version") || "main";
document.write(`<script src="/${version}/app.js"></script>`);
```

### Nginx 变量控制 ###

如果你希望动态切换版本，可以使用 Nginx 变量：

```nginx
set $version main; # 默认版本
if ($arg_version = history) {
    set $version history;
}
location / {
    try_files $uri /$version/index.html;
}
```

这样，你可以通过 `site-domain.com?version=history` 访问历史版本。

## 三、总结 ##

其中 `try_files` 机制适用于 SPA 应用的版本切换，切换新旧版本简单，不影响前端代码，需要正确配置 Nginx

这个方案可以完美解决前端发版导致的页面刷新问题，同时支持新旧版本共存！
