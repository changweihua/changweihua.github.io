---
lastUpdated: true
commentabled: true
recommended: true
title: Docker + Nginx 零基础部署前端
description: Docker + Nginx 零基础部署前端
date: 2025-04-09 11:00:00
pageClass: blog-page-class
cover: /covers/nginx.svg
---

# Docker + Nginx 零基础部署前端 #

## 写给读者的话 ##

如果你是一个前端新人，可能遇到过这样的场景：

- 写了一个炫酷的网页，本地运行完美，但不知道怎么放到服务器让别人访问。
- 听说要用 Nginx、Docker 这些工具，但完全不懂它们是什么，甚至分不清哪个是哪个。
- 尝试照着教程部署，结果遇到一堆报错，最终放弃。

> 别担心！这篇文章会用最通俗的语言，带你理解 Docker、Nginx 的核心概念，并手把手教你完成一次前端部署。无需任何部署经验，跟着做就能成功！

## 先搞懂这些“黑话”是什么 ##

### Docker：你的“应用打包神器” ###

- **是什么？** 一个工具，能把你的应用（比如前端代码）和它需要的环境（比如 Node.js、Nginx）打包成一个箱子（容器），保证在任何电脑上都能运行。
- **为什么需要？** 解决“我电脑能跑，别人电脑跑不了”的玄学问题。
- **核心概念**：
  - **镜像（Image）**：像“菜谱”，记录如何打包应用（比如“先装 Node.js，再复制代码”）。
  - **容器（Container）**：像“做好的菜”，根据镜像运行的一个实例（比如你的前端应用在运行）。


### Nginx：你的“智能服务员” ###

- **是什么？** 一个高性能的 Web 服务器，主要做两件事：
  - **托管静态文件**：把 HTML/CSS/JS 文件发给用户的浏览器。
  - **反向代理**：把用户请求转发给后端服务（比如 Node.js 接口）。
- **为什么需要？** 直接双击打开 HTML 文件虽然能看，但无法通过网址访问，Nginx 帮你实现这一点。

### 部署流程全景图 ###

```plain
代码 → 打包成静态文件 → 用 Docker 塞进容器 → Nginx 托管 → 用户通过网址访问
```

## Docker + Nginx 部署原理 ##

### Docker 如何工作？ ###

- **镜像从哪里来？** 从 Docker Hub（一个“应用商店”）下载现成的镜像，比如直接下载装好 Nginx 的镜像。
- **容器如何运行？** 基于镜像启动一个隔离的环境，你的代码在这个环境里运行，不污染本地电脑。

### Nginx 在部署中的作用 ###

- **托管静态文件**：将你的 index.html 和 JS/CSS 文件通过 HTTP 协议暴露给外界。
- **解决前端路由问题**：配置 try_files 让 Vue/React 的单页应用路由生效。

### 端口映射：让外界访问容器 ###

- 容器默认是封闭的，通过 **端口映射** 将容器的端口（比如 80）映射到宿主机的端口（比如 8080）。
- 用户访问 `http://服务器IP:8080` → 请求转发到容器的 80 端口 → Nginx 处理请求。


## 手把手部署：从代码到上线 ##

### 步骤 1：本地开发与打包 ###

写一个简单的 HTML 文件（或使用 Vue/React 项目）：

```html
<!DOCTYPE html>
<html>
<head>
    <title>我的第一个页面</title>
</head>
<body>
    <h1>Hello Docker + Nginx!</h1>
</body>
</html>
```

如果是 Vue/React 项目，运行 `npm run build`，生成 dist 文件夹。

### 步骤 2：准备 Docker 和 Nginx 配置 ###

创建 **Dockerfile**（文件名必须为 Dockerfile，无后缀）：

```dockerfile
# 使用 Nginx 官方镜像作为基础
FROM nginx:alpine

# 删除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义配置
COPY nginx.conf /etc/nginx/conf.d/

# 将静态文件复制到 Nginx 的目录
COPY dist/ /usr/share/nginx/html  # 如果是 HTML 文件，直接替换 dist/ 为你的目录
```

创建 `nginx.conf`（Nginx 配置文件）：

```nginx
server {
    listen 80;                 # 监听 80 端口
    server_name localhost;      # 服务器名称（本地测试无需修改）

    location / {
        root /usr/share/nginx/html;  # 静态文件目录
        index index.html;            # 默认首页
        try_files $uri $uri/ /index.html;  # 支持前端路由（如 Vue Router）
    }
}
```

### 步骤 3：构建镜像并运行 ###

打开终端，进入项目目录，执行以下命令：

```bash
# 构建镜像（-t 给镜像起名，末尾的 . 表示当前目录）
docker build -t my-frontend .

# 运行容器（-d 后台运行，-p 端口映射，--name 容器名）
docker run -d -p 8080:80 --name my-app my-frontend
```

访问 `http://localhost:8080`，看到你的页面！

## 四、常见问题与解决 ##

### 访问页面显示 403 或空白 ###

- 检查 dist 目录是否复制正确，或 HTML 文件是否在 /usr/share/nginx/html 下。
- 查看容器日志：docker logs my-app。

### 端口被占用 ###

- 修改 -p 参数，比如 -p 3000:80，然后访问 http://localhost:3000。

### 修改代码后如何更新？ ###

- 重新构建镜像：docker build -t my-frontend .
- 删除旧容器：docker rm -f my-app
- 重新运行：docker run -d -p 8080:80 --name my-app my-frontend

## 五、总结 ##

- Docker 让部署不再依赖环境，真正做到“一次打包，到处运行”。
- Nginx 作为 Web 服务器，帮你托管文件并处理网络请求。
- 核心流程：代码 → 打包 → 塞进 Docker 容器 → Nginx 对外暴露。

> 现在，你可以大声说：我知道怎么部署前端了！
