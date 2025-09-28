---
lastUpdated: true
commentabled: true
recommended: true
title: Dockerfile 指令指南
description: 从基础到高阶实践
date: 2025-09-28 13:00:00 
pageClass: blog-page-class
cover: /covers/docker.svg
---

## 前言 ##

Dockerfile 是构建 Docker 镜像的核心配置文件，它定义了镜像的构建过程和最终内容。掌握 Dockerfile 的每个指令对于创建高效、安全的容器镜像至关重要。本文将详细解析每个 Dockerfile 指令，并提供实际应用场景和最佳实践。

## 一、基础指令详解 ##

### FROM - 指定基础镜像 ###

**作用**：定义构建过程的基础镜像，必须是 Dockerfile 的第一个非注释指令。

**语法**：

```dockerfile
FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]
```

**详细说明**：

- `<image>`：可以是官方镜像（如 `ubuntu`）、私有仓库镜像（如 `my-registry.com/app`）或中间镜像（在多阶段构建中）
- `:<tag>`：指定镜像版本，强烈建议始终明确指定版本而非使用默认的 `latest`
- `AS <name>`：在多阶段构建中为构建阶段命名
- `--platform`：指定目标平台，如 `linux/amd64`, `linux/arm64`

**最佳实践**：

```dockerfile
# 推荐：使用特定版本的基础镜像
FROM node:18.20.1-alpine3.19 AS builder

# 多阶段构建示例
FROM golang:1.22.4-alpine3.19 AS build-stage
FROM alpine:3.19.1 AS production-stage

# 指定平台
FROM --platform=linux/amd64 amazoncorretto:21.0.3-al2023
```

### LABEL - 添加元数据 ###

**作用**：为镜像添加元数据标签，用于提供镜像相关信息。

**语法**：

```dockerfile
LABEL <key>=<value> <key>=<value> <key>=<value> ...
```

**详细说明**：

- 标签是键值对形式，用于记录维护者、版本、描述等信息
- 一个 LABEL 指令可以设置多个标签，推荐这样做以减少镜像层数
- 标签会继承自基础镜像，可以被覆盖

**最佳实践**：

```dockerfile
# 单指令多标签（推荐）
LABEL maintainer="team@example.com" \
      version="1.2.3" \
      description="Production API service" \
      org.opencontainers.image.authors="Dev Team <dev@example.com>" \
      org.opencontainers.image.version="v1.2.3" \
      org.opencontainers.image.licenses="MIT"

# 符合 Open Containers Initiative 标准的标签
LABEL org.opencontainers.image.title="My Application" \
      org.opencontainers.image.description="A custom application" \
      org.opencontainers.image.url="https://example.com" \
      org.opencontainers.image.source="https://github.com/example/repo" \
      org.opencontainers.image.vendor="Example Inc."
```

### WORKDIR - 设置工作目录 ###

**作用**：设置后续指令的工作目录，如果目录不存在会自动创建。

**语法**：

```dockerfile
WORKDIR /path/to/workdir
```

**详细说明**：

- 相当于在容器内执行 `mkdir -p /path` 和 `cd /path`
- 后续的 `RUN`, `CMD`, `ENTRYPOINT`, `COPY`, `ADD` 指令都会在此目录下执行
- 可以使用相对路径，相对的是前一个 `WORKDIR` 指令设置的路径
- 可以多次使用，每次都会改变当前工作目录

**最佳实践**：

```dockerfile
WORKDIR /app

# 使用相对路径
WORKDIR src
WORKDIR ./api
# 当前工作目录为 /app/src/api

# 清晰的工作目录结构
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
```

### RUN - 执行命令 ###

**作用**：在构建过程中执行命令并创建新的镜像层。

**语法**：

```dockerfile
# Shell 格式（默认使用 /bin/sh -c）
RUN <command>

# Exec 格式（推荐）
RUN ["executable", "param1", "param2"]
```

**详细说明**：

- Shell 格式：使用默认 `shell` 执行命令，支持变量替换和通配符
- Exec 格式：直接执行命令，不通过 `shell`，需要提供可执行文件的完整路径
- 每个 `RUN` 指令都会创建一个新的镜像层，应尽量减少层数

**最佳实践**：

```dockerfile
# 不良实践：多个RUN指令创建多层镜像
RUN apt-get update
RUN apt-get install -y package1
RUN apt-get install -y package2
RUN rm -rf /var/lib/apt/lists/*

# 最佳实践：合并指令，清理缓存
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        package1 \
        package2 \
        package3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 使用exec格式避免shell处理问题
RUN ["/bin/bash", "-c", "echo $HOME"]

# 复杂的多行命令
RUN set -eux; \
    export DEBIAN_FRONTEND=noninteractive; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl; \
    rm -rf /var/lib/apt/lists/*; \
    curl -fsSL https://package-url -o package.tar.gz; \
    tar -xzf package.tar.gz -C /usr/local/bin; \
    rm package.tar.gz
```

### CMD - 容器默认命令 ###

**作用**：指定容器启动时的默认执行命令，可以被 `docker run` 后面的参数覆盖。

**语法**：

```dockerfile
# Shell 格式
CMD command param1 param2

# Exec 格式（推荐）
CMD ["executable","param1","param2"]

# 作为ENTRYPOINT的参数
CMD ["param1","param2"]
```

**详细说明**：

- 一个 Dockerfile 中只能有一个 `CMD` 指令，如果有多个，只有最后一个生效
- 主要目的是为容器提供默认的执行命令
- 如果 Dockerfile 中有 `ENTRYPOINT`，则 `CMD` 作为其参数
- 启动容器时在命令行指定的参数会覆盖 `CMD` 的内容

**最佳实践**：

```dockerfile
# Exec格式，避免shell处理，支持信号传递
CMD ["nginx", "-g", "daemon off;"]

# 为ENTRYPOINT提供默认参数
ENTRYPOINT ["java", "-jar"]
CMD ["app.jar"]

# 使用shell格式的情况（需要环境变量扩展时）
CMD echo "The current user is $USER"
```

### ENTRYPOINT - 入口点 ###

**作用**：配置容器启动时运行的命令，不容易被 `docker run` 的参数覆盖。

**语法**：

```dockerfile
# Shell 格式
ENTRYPOINT command param1 param2

# Exec 格式（推荐）
ENTRYPOINT ["executable", "param1", "param2"]
```

**详细说明**：

- Shell 格式：命令会在 `/bin/sh -c` 中执行，不支持信号传递，`CMD` 参数会被忽略
- Exec 格式：直接执行命令，支持信号传递，`CMD` 的内容会作为参数传递给 `ENTRYPOINT`
- 使用 `--entrypoint` 标志可以覆盖 `ENTRYPOINT`

**最佳实践**：

```dockerfile
# 包装脚本模式
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# 与CMD配合使用
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar"]
CMD ["app.jar"]

# 可执行文件直接作为入口点
ENTRYPOINT ["/app/bin/my-app"]
```

### COPY - 复制文件 ###

**作用**：将构建上下文中的文件或目录复制到镜像中。

**语法**：

```dockerfile
COPY [--chown=<user>:<group>] [--chmod=<perms>] <src>... <dest>
COPY [--chown=<user>:<group>] [--chmod=<perms>] ["<src>",... "<dest>"]
```

**详细说明**：

- `<src>`：源文件或目录，相对于构建上下文
- `<dest>`：目标路径，可以是绝对路径或相对于 `WORKDIR` 的相对路径
- `--chown`：设置复制文件的所有权和组
- `--chmod`：设置复制文件的权限
- 支持通配符匹配多个文件

**最佳实践**：

```dockerfile
# 复制单个文件
COPY package.json ./

# 复制目录
COPY src ./src

# 设置所有权和权限
COPY --chown=node:node --chmod=644 app.js /app/
COPY --chown=1000:1000 data/ /app/data/

# 使用通配符
COPY *.txt /app/texts/
COPY config/*.conf /etc/app/

# 分阶段复制，利用Docker缓存
COPY package.json package-lock.json ./
RUN npm install
COPY . .
```

### ADD - 高级复制 ###

**作用**：比 `COPY` 功能更丰富的复制指令，支持自动解压和 URL 下载。

**语法**：

```dockerfile
ADD [--chown=<user>:<group>] [--chmod=<perms>] <src>... <dest>
ADD [--chown=<user>:<group>] [--chmod=<perms>] ["<src>",... "<dest>"]
```

**详细说明**：

- 具备 `COPY` 的所有功能
- 如果 `<src>` 是本地压缩文件（tar, gzip, bzip2, xz等），会自动解压到 `<dest>`
- 支持从 URL 下载文件（但不推荐，因为无法清理下载的临时文件）

**最佳实践**：

```dockerfile
# 自动解压tar包（ADD的主要优势）
ADD application.tar.gz /app/

# 从URL下载（不推荐，因为无法删除下载缓存）
ADD https://example.com/file.tar.gz /tmp/ # 尽量避免

# 设置权限
ADD --chown=app:app --chmod=755 bin/app /usr/local/bin/

# 一般情况下优先使用COPY
COPY file.txt /app/  # 推荐
ADD file.txt /app/   # 不推荐，功能过于复杂
```

## 二、高级指令详解 ##

### ENV - 环境变量 ###

**作用**：设置环境变量，在构建阶段和容器运行时都可用。

**语法**：

```dockerfile
ENV <key>=<value> ...
```

**详细说明**：

- 设置的环境变量在构建过程中和容器运行时都可以使用
- 可以使用 `${VARIABLE}` 或 `$VARIABLE` 语法引用已定义的环境变量
- 支持一次设置多个环境变量

**最佳实践**：

```dockerfile
# 一次设置多个变量
ENV APP_HOME=/app \
    NODE_ENV=production \
    PORT=3000

# 引用已定义的变量
ENV PATH=$APP_HOME/bin:$PATH

# 应用程序配置
ENV DB_HOST=database \
    DB_PORT=5432 \
    REDIS_URL=redis://cache:6379

# 版本信息
ENV APP_VERSION=1.2.3 \
    BUILD_DATE=2024-05-20
```

### ARG - 构建参数 ###

**作用**：定义在构建过程中使用的变量，只在构建阶段有效。

**语法**：

```dockerfile
ARG <name>[=<default value>]
```

**详细说明**：

- 只在构建阶段有效，容器运行时不可用
- 可以通过 `--build-arg <varname>=<value>` 在构建时传递参数
- 可以有默认值，如果没有默认值且构建时未提供，则值为空
- `ARG` 指令有作用域，只在定义之后的有效

**最佳实践**：

```dockerfile
# 定义构建参数
ARG APP_VERSION=latest
ARG BUILD_NUMBER=1
ARG NPM_TOKEN

# 使用构建参数
LABEL version=$APP_VERSION \
      build=$BUILD_NUMBER

# 在RUN指令中使用
RUN echo "Building version $APP_VERSION" && \
    npm install

# 多阶段构建中传递参数
FROM alpine AS final
ARG APP_VERSION
COPY --from=build /app /app
```

### EXPOSE - 声明端口 ###

**作用**：声明容器运行时监听的网络端口，是一种文档化手段。

**语法**：

```dockerfile
EXPOSE <port> [<port>/<protocol>...]
```

**详细说明**：

- 只是声明容器会使用哪些端口，并不实际发布端口
- 默认协议是 TCP，可以明确指定 TCP 或 UDP
- 实际端口映射需要在 `docker run` 时使用 `-p` 参数指定
- 有助于镜像使用者了解需要映射哪些端口

**最佳实践**：

```dockerfile
# 声明单个端口
EXPOSE 80

# 声明多个端口
EXPOSE 80 443

# 指定协议
EXPOSE 53/udp 53/tcp

# Web应用典型配置
EXPOSE 3000

# 数据库应用
EXPOSE 5432

# 微服务应用
EXPOSE 8080 8443
```

### VOLUME - 定义卷 ###

**作用**：创建挂载点，用于持久化数据和共享数据。

**语法**：

```dockerfile
VOLUME ["/path/to/dir"]
VOLUME /path/to/dir
```

**详细说明**：

- 创建匿名卷，用于存储需要持久化的数据
- 在容器运行时自动创建并挂载匿名卷
- 主要用于数据库文件、日志文件等需要持久化的数据
- 可以在 `docker run` 时使用 `-v` 覆盖

**最佳实践**：

```dockerfile
# 数据库数据目录
VOLUME /var/lib/mysql

# 应用程序日志
VOLUME /var/log/app

# 多个卷
VOLUME ["/data", "/config"]

# 避免在VOLUME目录后进行写操作
RUN mkdir -p /data && chown app:app /data
VOLUME /data
```

### USER - 设置用户 ###

**作用**：指定运行后续指令的用户身份，以及容器运行时的默认用户。

**语法**：

```dockerfile
USER <user>[:<group>]
USER <UID>[:<GID>]
```

**详细说明**：

- 切换后续指令的执行用户身份
- 影响 `RUN`, `CMD`, `ENTRYPOINT` 指令的执行身份
- 建议使用非 `root` 用户运行应用程序以提高安全性
- 用户和组必须已存在，可以在之前用 `RUN` 指令创建

**最佳实践**：

```dockerfile
# 创建应用程序用户
RUN addgroup -g 1000 app && \
    adduser -u 1000 -G app -D app

# 切换用户
USER app

# 使用UID/GID（更可靠）
USER 1000:1000

# 多阶段构建中切换用户
FROM node:18-alpine AS build
RUN adduser -D app
USER app
WORKDIR /home/app
COPY --chown=app:app . .
```

### HEALTHCHECK - 健康检查 ###

**作用**：定义容器健康检查命令，用于检测容器是否正常工作。

**语法**：

```dockerfile
HEALTHCHECK [OPTIONS] CMD command
HEALTHCHECK NONE
```

**选项说明**：

- `--interval`：检查间隔（默认 30s）
- `--timeout`：命令超时时间（默认 30s）
- `--start-period`：容器启动阶段的初始化时间（默认 0s）
- `--retries`：连续失败次数后标记为不健康（默认 3）

**最佳实践**：

```dockerfile
# HTTP服务健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# 命令检查
HEALTHCHECK --interval=1m --timeout=10s \
    CMD pg_isready -U postgres -d mydb || exit 1

# 脚本检查
HEALTHCHECK CMD /healthcheck.sh

# 禁用健康检查
HEALTHCHECK NONE
```

## 三、特殊用途指令 ##

### SHELL - 更改默认 shell ###

**作用**：覆盖默认的 shell 程序，用于改变 `RUN`、`CMD`、`ENTRYPOINT` 的 `shell` 格式使用的 shell。

**语法**：

```dockerfile
SHELL ["executable", "parameters"]
```

**最佳实践**：

```dockerfile
# 使用PowerShell（Windows容器）
SHELL ["powershell", "-Command"]

# 使用bash替代sh
SHELL ["/bin/bash", "-c"]

# 使用更安全的shell选项
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
```

### STOPSIGNAL - 停止信号 ###

**作用**：设置容器停止时发送的系统调用信号。

**语法**：

```dockerfile
STOPSIGNAL signal
```

**最佳实践**：

```dockerfile
# 使用SIGTERM（默认）
STOPSIGNAL SIGTERM

# 使用SIGINT
STOPSIGNAL SIGINT

# 使用特定信号值
STOPSIGNAL 15
```

### ONBUILD - 延迟执行 ###

**作用**：添加延迟执行的指令，当当前镜像被作为基础镜像时，这些指令会在子镜像的构建过程中执行。

**语法**：

```dockerfile
ONBUILD <INSTRUCTION>
```

**最佳实践**：

```dockerfile
# 基础镜像中的ONBUILD指令
ONBUILD COPY package.json ./
ONBUILD RUN npm install
ONBUILD COPY . .

# 应用特定的ONBUILD
ONBUILD ADD https://example.com/scripts/setup.sh /tmp/
ONBUILD RUN chmod +x /tmp/setup.sh && /tmp/setup.sh
```

## 四、综合示例与实践建议 ##

### 完整示例：Node.js 应用 Dockerfile ###

```dockerfile
# 多阶段构建：构建阶段
FROM node:18.20.1-alpine3.19 AS builder

# 设置构建参数
ARG APP_VERSION=1.0.0
ARG NPM_TOKEN

# 设置环境变量
ENV NODE_ENV=production \
    CI=true

# 创建应用程序用户
RUN addgroup -g 1001 app && \
    adduser -u 1001 -G app -D app

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./

# 设置npm认证（注意安全！）
RUN if [ -n "$NPM_TOKEN" ]; then \
        echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc; \
    fi

# 安装依赖
RUN npm ci --only=production && \
    if [ -f .npmrc ]; then rm .npmrc; fi

# 复制源代码
COPY --chown=app:app . .

# 构建应用
RUN npm run build

# 多阶段构建：生产阶段
FROM node:18.20.1-alpine3.19 AS production

# 添加元数据
LABEL maintainer="dev@example.com" \
      version="$APP_VERSION" \
      description="Node.js application"

# 创建非root用户
RUN addgroup -g 1001 app && \
    adduser -u 1001 -G app -D app

# 设置工作目录
WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache tini

# 复制构建产物
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/package.json ./

# 创建数据卷
VOLUME /app/logs
VOLUME /app/uploads

# 声明端口
EXPOSE 3000

# 设置健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# 使用非root用户
USER app

# 设置入口点
ENTRYPOINT ["/sbin/tini", "--"]

# 设置启动命令
CMD ["node", "dist/index.js"]
```

### 通用最佳实践总结 ###

- **使用多阶段构建**：减少最终镜像大小，提高安全性
- **选择合适的基础镜像**：使用官方、轻量级、特定版本的基础镜像
- **优化层缓存**：将不经常变化的指令放在前面，经常变化的放在后面
- **使用非 root 用户**：提高容器运行时的安全性
- **清理不必要的文件**：在同一个 RUN 指令中安装软件和清理缓存
- **使用 .dockerignore**：排除不必要的文件，减少构建上下文大小
- **明确标签和版本**：为镜像提供清晰的元数据和版本信息
- **健康检查**：为长时间运行的服务添加健康检查机制
- **信号处理**：确保应用正确处理停止信号，实现优雅关闭
- **安全扫描**：定期对镜像进行安全漏洞扫描

通过深入理解和正确使用这些 Dockerfile 指令，你可以创建出高效、安全、可维护的 Docker 镜像，为容器化部署奠定坚实基础。
