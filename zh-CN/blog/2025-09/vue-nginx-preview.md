---
lastUpdated: true
commentabled: true
recommended: true
title: 用 Nginx 搭建前端本地预览环境
description: 用 Nginx 搭建前端本地预览环境
date: 2025-09-30 11:00:00 
pageClass: blog-page-class
cover: /covers/nginx.svg
---

很多前端同学平时只接触 `npm run dev` 的开发模式。但在一些场景下，我们需要用 Nginx 来本地模拟部署环境，比如：

- 验证 *打包后的静态资源能否正常运行*。
- 处理 *单页面应用（SPA）路由刷新 404 问题*。
- 本地做 *缓存策略测试*（比如静态资源 30 天缓存）。
- 和后端或移动端联调时，模拟 *接近生产的访问方式*。

下面我们来一步步看怎么在本地用 Nginx 来托管前端项目。

## 📂 项目目录结构 ##

```txt
.
├── logs              # 存放 Nginx 访问日志和错误日志
│   ├── access.log
│   └── error.log
├── nginx.conf        # Nginx 配置文件
├── nginx.sh          # Nginx 启动/停止/重载脚本
├── package.json      # npm 脚本配置
└── utils.sh          # （可选）工具脚本
```

> 这样整理后，前端项目和本地 Nginx 部署逻辑绑定在一起，不需要频繁写长命令。

## ⚙️ 核心配置文件：`nginx.conf` ##

```nginx
worker_processes 1;       # 启动的 worker 数量

events {
    worker_connections 1024;  # 每个 worker 最大连接数
}

http {
    include /opt/homebrew/etc/nginx/mime.types;   # 识别常见文件类型
    default_type application/octet-stream;

    sendfile on;              # 高效传输文件
    keepalive_timeout 65;     # 长连接超时时间

    # 日志文件路径
    access_log /Users/luoluqi/Desktop/ngnix-server/logs/access.log;
    error_log  /Users/luoluqi/Desktop/ngnix-server/logs/error.log warn;

    server {
        listen 8080;                               # 监听端口
        server_name localhost;                     # 本地访问域名

        root /Users/luoluqi/Desktop/blockify-ui/docs-dist; # 前端打包目录
        index index.html;

        # 单页面应用路由处理
        location / {
            try_files $uri $uri/ /index.html;
        }

        # 静态资源缓存
        location ~* .(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public";
        }

        # 禁止访问隐藏文件
        location ~ /. {
            deny all;
        }
    }
}
```

**🔑 配置要点**：

- root：指定前端打包产物目录。
- try_files：保证 SPA 项目在刷新时不会 404，而是回退到 `index.html`。
- 静态资源缓存：让 JS/CSS 等资源缓存 30 天，更接近生产环境。
- 隐藏文件保护：禁止访问 `.git`、`.env` 等敏感文件。

## 🛠️ 脚本化操作：nginx.sh ##

```bash
#!/bin/bash
BASE_DIR=$(cd "$(dirname "$0")"; pwd)
NGINX_CONF="$BASE_DIR/nginx.conf"

case "$1" in
  start)
    echo "Starting Nginx..."
    nginx -c "$NGINX_CONF"
    ;;
  reload)
    echo "Reloading Nginx configuration..."
    nginx -s reload
    ;;
  stop)
    echo "Stopping Nginx..."
    nginx -s stop
    ;;
  *)
    echo "Usage: ./nginx.sh {start|reload|stop}"
    exit 1
    ;;
esac
```

> 这样就不用每次手动敲 `nginx -c` 或 `nginx -s reload`，直接 `./nginx.sh start` 即可。

## 📦 npm 脚本集成 ##

在 `package.json` 里增加：

```json
"scripts": {
  "nginx:start": "./nginx.sh start",
  "nginx:reload": "./nginx.sh reload",
  "nginx:stop": "./nginx.sh stop"
}
```

这样就可以用熟悉的 npm 命令来操作：

```bash
npm run nginx:start
npm run nginx:reload
npm run nginx:stop
```

## ✅ 总结：对前端的意义 ##

- **快速验证打包产物**：不用每次都等后端部署。
- **模拟生产环境**：测试缓存策略、路由、错误日志。
- **更专业的本地调试**：和移动端、后端联调时避免跨域或开发环境差异。
- **一键化操作**：脚本化 + npm 集成，让前端工程师也能轻松用上 Nginx。

> 👉 建议：在团队中可以把这套配置放到前端仓库里（例如 `nginx/` 文件夹），大家拉代码后就能直接启动，减少环境差异。
