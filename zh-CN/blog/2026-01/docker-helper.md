---
lastUpdated: true
commentabled: true
recommended: true
title: Docker 容器优化与安全
description: 从细节入手，面试必看，减少潜在的安全隐患和性能瓶颈
date: 2026-01-30 09:20:00
pageClass: blog-page-class
cover: /covers/docker.svg
---

如果你正在准备 Docker 面试，或者正打算提升自己的 Docker 技巧，那么你来对地方了！今天，我们将通过一些最佳实践，聊聊 Docker 容器优化与安全，让你不仅在面试中能够给面试官留下深刻印象，还能在实际工作中避免一些常见的坑。准备好了吗？
Let's go！

## 避免在包管理中使用 `dist-upgrade` ##

面试官有时喜欢问你如何确保 Docker 容器的稳定性。如果你不小心使用了 `dist-upgrade`，就可能让你的容器“变脸”。这就像你在面试时不小心爆出了不该说的秘密——小心，危险！

**问题**：

```dockerfile
FROM ubuntu:20.04
RUN apt-get dist-upgrade
```

**修复**：

```dockerfile
FROM ubuntu:20.04
RUN apt-get update && apt-get install -y --no-install-recommends build-essential
```

## 优化 Docker 镜像：使用多阶段构建 ##

多阶段构建就像是做一道美味的蛋糕，先将所有的原料准备好，最后再组合起来。这个过程既减少了不必要的文件，也让你在面试时显得非常精通 Docker！

**问题**：

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**修复**：

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist
USER nobody
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## 避免不必要的缓存 ##

缓存有时候就像那些面试时多余的自我介绍：“我可以做这个，我也能做那个”。但是，如果它真的没有帮助，还是让它走开吧！

**问题**：

```dockerfile
FROM fedora:version
RUN dnf install -y httpd
```

**修复**：

```dockerfile
FROM fedora:version
RUN dnf install -y httpd && dnf clean all && rm -rf /var/cache/dnf
```

## 合并 RUN 指令 ##

每次运行 `RUN` 都会增加一个新的镜像层。就像面试中每当你重复说“我很优秀”，面试官都会觉得有点烦。一个 `RUN`，搞定一切！

**问题**：

```dockerfile
FROM ubuntu:20.04
RUN apt-get -y --no-install-recommends install netcat
RUN apt-get clean
```

**修复**：

```dockerfile
FROM ubuntu:20.04
RUN apt-get -y --no-install-recommends install netcat && apt-get clean
```

## 清理不需要的文件：使用 `.dockerignore` ##

当你构建 Docker 镜像时，往往会有一些“额外的行李”——比如 `.git` 文件夹，或者 `.log` 文件。这些就像你面试时带着一大堆不相关的资料，最后它们只会让你看起来很乱。

**问题**：

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["node", "dist/index.js"]
```

**修复**：

```dockerfile
# 在项目根目录添加 `.dockerignore` 文件：
.dockerignore
.git
*.log
node_modules

# 更新 Dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
CMD ["node", "dist/index.js"]
```

## 避免使用 ADD，使用 COPY ##

ADD 功能多到让你以为自己得到了一张全能卡。可实际上，通常我们只需要简单的 COPY 来完成任务，正如面试时你不需要过度展示自己的“全能技能”，只需展示你的核心优势！

**问题**：

```dockerfile
FROM ubuntu:20.04
ADD ./app /app
```

**修复**：

```dockerfile
FROM ubuntu:20.04
COPY ./app /app
```

## 避免在指令中硬编码敏感信息 ##

如果你把敏感信息（比如密码）直接写在 Dockerfile 里，那就像是把密码贴在公司的大门上。别人随便一看就能知道，这种做法必须杜绝！

**问题**：

```dockerfile
FROM ubuntu:20.04
ENV PASSWORD=supersecret123
```

**修复**：

```dockerfile
# 用更安全的方法传递敏感信息，不要硬编码在 Dockerfile 中
```

## 避免默认用户为 root ##

在 Docker 中使用 root 用户等于为黑客提供了一个打开容器的大门。记住，你要给容器设置一个专门的非 root 用户，就像面试时，你不会随便让别人看你钱包里的所有东西一样。

**问题**：

```dockerfile
FROM ubuntu:20.04
USER root
RUN whoami
```

**修复**：

```dockerfile
FROM ubuntu:20.04
RUN groupadd --system app && useradd --system --create-home --gid app app
USER app
RUN whoami
```

## 避免暴露不必要的端口 ##

你不可能在面试时随便给人透露公司的机密密码，那么也不要在 Dockerfile 中暴露不必要的端口。确保只有需要的端口才能暴露出去，别让黑客有可乘之机。

**问题**：

```dockerfile
FROM ubuntu:20.04
EXPOSE 22
```

**修复**：

```dockerfile
FROM ubuntu:20.04
# EXPOSE 22 removed to prevent unauthorized SSH access.
```

## 避免使用 curl | bash 方式 ##

`curl` | `bash` 这种做法就像面试时信任不可靠的推荐信一样，让你在没有验证的情况下直接执行命令。这绝对不是一个好习惯，避免它！

**问题**：

```dockerfile
FROM ubuntu:20.04
RUN curl -sSL http://example.com/script.sh | sh
```

**修复**：

```dockerfile
FROM ubuntu:20.04
RUN curl -sSL http://example.com/script.sh -o script.sh
# 在执行前进行脚本验证
```

## 避免暴露过多的健康检查 ##

健康检查是好的，但过多的健康检查就像面试时一直被问同一个问题一样——多余而且累人。确保只有必要的健康检查才存在，保持简洁明了。

**问题**：

```dockerfile
FROM ubuntu:20.04
HEALTHCHECK --interval=30s CMD curl -f http://localhost/ || exit 1
HEALTHCHECK --interval=30s CMD wget -q -O- http://localhost/ || exit 1
```

**修复**：

```dockerfile
FROM ubuntu:20.04
HEALTHCHECK --interval=30s CMD curl -f http://localhost/ || exit 1
```

总结一下，Docker 的优化不仅关乎容器的大小和性能，也关系到安全性和可维护性。每个细节都不能忽视，尤其是当面试官问你 Docker 容器的优化和安全性时，这些点能让你在面试中大放异彩。所以下次你在构建 Docker 容器时，记得做个小小的安全检查，避免这些常见的错误哦！
