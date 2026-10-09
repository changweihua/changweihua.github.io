---
lastUpdated: true
commentabled: true
recommended: true
title: 逃离 Docker Hub 限速！
description: 国内镜像 + 完整 Docker Compose 部署 Node 与 MySQL 服务
date: 2026-01-30 10:00:00
pageClass: blog-page-class
cover: /covers/nginx.svg
---

> 🎯 Docker Compose容器化 NodeJS、Mysql 最佳实践

## Docker 和 Docker Compose ##

在之前使用 Docker 前，在 Docker Hub 里拉取镜像非常丝滑，但是近期在试的时候发现了很多问题，尤其是镜像的拉取，成了不小的灾难，后来找了一款国内镜像（轩辕镜像）的一款产品，解决了我的燃眉之急，不得不说现在没有人民币基本玩不下去，他们官网的一键安装脚本非常方便，这不得不夸赞 Lnmp架构，开源且无限续航。

Docker 的优点就是解决部署服务的痛点，搞后端服务的懂，各种环境的版本和生态是真烦人。

```bash
bash <(wget -qO- https://xuanyuan.cloud/docker.sh)

# 设置开机启动
sudo systemctl enable docker

# 验证是否安装成功
docker --version

#将当前用户加入docker组
sudo usermod -aG docker $USER
# 重新登录或执行以下命令使组更改生效
newgrp docker
```

Docker 、Docker Compose 安装成功：

```txt
[root@bogon ~]# docker -v
Docker version 20.10.24, build 297e128
[root@bogon ~]# docker-compose version
Docker Compose version v5.0.1
```

### 清理容器的命令 ###

```bash
docker system prune -a
```

### `docker-compose` 启动构建服务命令 ###

```bash
docker-compose build   # 构建镜像
docker-compose up -d # 启动服务
docker-compose down # 停止服务
docker-compose logs -f # 查看日志
```

## Node ##

开始设计这套程序的初心是在 centos7.9 上安装一个多版本的 nvm 进行管理，但是因为 Centos7.9 需要升级才能支持 22.12.0 的版本，有兼容问题所以索性就大改一下这里的服务，使用 `Dockerfile` 、`docker-compose.yml` 。

目录结构如下：

`dist` 是打包的文件夹 ，位置不能搞错，不然 Docker compose 在构建的时候会报错，`server.js` 是代理服务的脚本，要解决的问题是 把本地运行好的 Vue 前端项目，打包上传到镜像的映射目录里进行访问，使用 `Node http-proxy-middleware` 进行代理。

```txt
[root@localhost node]# tree
.
├── dist
├── docker-compose.yml
├── Dockerfile
├── package.json
└── server.js
```

### `Dockerfile` 文件 ###

```Dockerfile
# 使用官方Node.js基础镜像（基于Debian）
FROM node:22.12.0-bullseye-slim

# 设置环境变量避免交互式提示
ENV DEBIAN_FRONTEND=noninteractive \
    NVM_DIR=/usr/local/nvm \
    NODE_VERSION=22.12.0

# 1. 更换为阿里云镜像源并安装基础工具
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        wget \
        git \
        ca-certificates \
        bash \
    && rm -rf /var/lib/apt/lists/*

# 2. 安装nvm并设置Node.js版本
RUN mkdir -p $NVM_DIR && \
    curl -o /tmp/install_nvm.sh -fsSL https://gitee.com/mirrors/nvm/raw/v0.39.5/install.sh || \
    wget -O /tmp/install_nvm.sh https://gitee.com/mirrors/nvm/raw/v0.39.5/install.sh && \
    PROFILE=/dev/null bash /tmp/install_nvm.sh && \
    rm -f /tmp/install_nvm.sh

# 3. 加载nvm并安装指定版本的Node.js
RUN . $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    nvm use default

# 4. 将nvm和Node.js路径添加到环境变量
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$NVM_DIR:$PATH

# 5. 安装serve静态服务器
RUN npm install -g serve@latest

# 6. 验证安装
RUN node --version && npm --version

WORKDIR /app

# 6. 复制package.json和代理服务器文件
COPY package*.json ./
COPY server.js ./

# 7. 安装依赖（包括express和http-proxy-middleware）
RUN npm install express http-proxy-middleware

# 8. 暴露端口
EXPOSE 3000

# 9. 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# 10. 启动自定义服务器
CMD ["node", "server.js"]
```

### `docker-compose.yml` 文件 ###

```yml
services:
  node-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nvm-node-app
    ports:
      - "3000:3000"
    volumes:
      # 将本地dist目录映射到容器的/app/dist目录
      - ./dist:/app/dist:ro  # ro表示只读，提高安全性
    environment:
      # 设置Node.js相关环境变量
      - NODE_ENV=production
      - NVM_DIR=/usr/local/nvm
    # 可以直接使用CMD，因为Dockerfile中已经指定了serve命令
    # 如果需要启动bash，可以取消下面的注释
    # command: bash -c "source $NVM_DIR/nvm.sh && bash"
    working_dir: /app
    restart: unless-stopped
    networks:
      - app-network
    # 添加资源限制
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

networks:
  app-network:
    driver: bridge
```

Node 反向代理的 `server.js`，把 `node.example.com` 更换你自己的后端API地址

```javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const host = 'http://node.example.com'; // 更换你自己的后端API地址

// 静态文件服务（指向dist目录）
app.use(express.static(path.join(__dirname, 'dist')));

// API代理配置
app.use('/api', createProxyMiddleware({
  target: host,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // 去掉/api前缀
  },
  onProxyReq: (proxyReq, req, res) => {
    // 可以在这里添加请求头等
    console.log(`Proxying request: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  }
}));

// 处理SPA路由（所有未匹配的请求返回index.html）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API requests are proxied to: `+ host);
});
```

## Mysql ##

构建 mysql 的实例容器步骤如下，先看下文件目录，心里大概有个概念，在开始Mysql5.7 的构建，Mysql5.7构建成功，如果你想更换其他版本也是一样的，我提前下载好了mysql:5.7.44的官方镜像。

```txt
mysql57/
├── docker-compose.yml
├── Dockerfile          
├── conf/
│   └── my.cnf
├── logs/
├── data/
└── init/
    └── init.sql
```

先创建目录，放置对应的 `Dockerfile` 文件、`docker-compose.yml` 文件

```bash
mkdir -p mysql57/{conf,logs,data,init}
```

**`Dockerfile` 文件**

```Dockerfile
# Dockerfile
FROM mysql:5.7.44

# 设置环境变量
ENV MYSQL_ROOT_PASSWORD=123456

# 创建MySQL配置目录
RUN mkdir -p /etc/mysql/conf.d

# 创建日志和数据目录
RUN mkdir -p /logs /var/lib/mysql

# 复制自定义配置文件（如果有）
# COPY conf/my.cnf /etc/mysql/conf.d/

# 暴露端口
EXPOSE 3306

# 使用MySQL的默认启动命令
CMD ["mysqld"]
```

**`docker-compose.yml` 文件**

```yml
services:
  mysql57:
    image: mysql:5.7.44
    container_name: mysql57
    ports:
      - "3306:3306"
    volumes:
      - ./conf:/etc/mysql/conf.d
      - ./logs:/logs
      - ./data:/var/lib/mysql
      - ./init:/docker-entrypoint-initdb.d  # 添加这一行
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: test  # 可选：创建默认数据库
    restart: unless-stopped
```

编写初始化脚本，主要创建 `dev` 用户，创建 `test` 数据库

```sql:init.sql
-- init/init.sql
-- 创建test数据库
CREATE DATABASE IF NOT EXISTS test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建dev用户并授予权限
CREATE USER IF NOT EXISTS 'dev'@'%' IDENTIFIED BY 'dev_password';

-- 授予dev用户对所有数据库的权限（包括test数据库）
GRANT ALL PRIVILEGES ON *.* TO 'dev'@'%' WITH GRANT OPTION;

-- 特别授予对test数据库的权限（确保权限生效）
GRANT ALL PRIVILEGES ON test.* TO 'dev'@'%';

-- 刷新权限
FLUSH PRIVILEGES;
```

确保MySQL允许远程连接，编写配置文件

```ini
[mysqld]
bind-address = 0.0.0.0
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

[client]
default-character-set = utf8mb4
```

使用 `dev/123456` 构建和启动就可以了

## Docker 环境 ##

```txt
[root@localhost node]# docker ps
CONTAINER ID   IMAGE           COMMAND                  CREATED          STATUS                            PORTS                                                  NAMES
e5278552bf17   node-node-app   "docker-entrypoint.s…"   0.0.0.0:3000->3000/tcp, :::3000->3000/tcp              node22
e30ea98d20a4   mysql:5.7.44    "docker-entrypoint.s…"   0.0.0.0:3306->3306/tcp, :::3306->3306/tcp, 33060/tcp   mysql57
```
