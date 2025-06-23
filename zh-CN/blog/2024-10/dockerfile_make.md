---
lastUpdated: true
commentabled: true
recommended: true
title:  Dockerfile最佳实践
description: Dockerfile最佳实践
date: 2025-06-23 11:18:00
pageClass: blog-page-class
---

# Dockerfile最佳实践 #

## Dockerfile 概念与用途 ##

Dockerfile 是用于描述 容器镜像 构建流程的声明式脚本文件，每条指令依次说明"从哪个基础镜像开始 → 复制/下载哪些文件 → 运行哪些命令 → 镜像启动时执行什么"。

### 主要优势 ###

- **可移植**：一次编写，任何支持 OCI 标准的容器运行时（Docker、Podman、containerd、CRI-O 等）都能运行生成的镜像
- **可重复**：构建步骤显式记录，便于在 CI/CD 中自动化执行
- **可追溯**：镜像的每一层都对应一条指令，排错与版本回退更直观

借助 Dockerfile，开发者可以把应用以及依赖（系统库、配置文件、启动命令）封装进不可变镜像，实现"像复制文件一样部署软件"。

## 构建上下文（Build Context） ##

- `docker build <上下文路径>` 中的路径即 构建上下文，其下所有文件都会被打包发送给 Docker Daemon。
- 使用 `.dockerignore` 排除无关文件（如 `node_modules/`、`*.log`、`.git` 等），可显著减少传输体积与构建时间。
也可以通过 `docker buildx build https://github.com/your/repo.git#branch` 直接使用远程 Git 仓库作为上下文。

```bash
# 示例：在独立目录中放置 Dockerfile
mkdir build && cp Dockerfile build/
cd build && docker build -t myimage:latest .
```

## 缓存机制（Build Cache） ##

- Docker 逐行解析 Dockerfile 并为每条指令创建镜像层。若 同一指令文本 + 同一上一层 ID 已构建过，Docker 将复用缓存。COPY/ADD 还会比较源文件校验和；在 BuildKit 模式下，ARG、ENV 等变化同样会触发失效。
- 失效规则：某层失效后，其后的所有层均需重新构建。

### 进阶特性 ###

- Inline cache：`--build-arg BUILDKIT_INLINE_CACHE=1` 让生成的镜像携带缓存元数据，便于在 CI/CD 间共享。
- 缓存挂载：`RUN --mount=type=cache,target=/root/.cargo` 用于依赖缓存，避免写入镜像层。

## 多阶段构建（Multi-Stage Build） ##

通过多阶段构建可显著减小最终镜像体积，并隔离编译依赖。
```dockerfile
FROM golang:1.22 AS builder
WORKDIR /src
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/app

# 轻量级运行时镜像
FROM gcr.io/distroless/base
COPY --from=builder /out/app /usr/bin/app
USER nonroot:nonroot
ENTRYPOINT ["/usr/bin/app"]
```

- 第一阶段包含完整构建链条；第二阶段仅拷贝编译产物。
- `FROM scratch` 适用于极简场景（如静态编译的 Go 程序）。

## 常用指令详解 ##

| 指令        |      关键点      |  示例 |
| :-----------: | :-----------: | :----: |
|  FROM  |  选择安全、体积小的基础镜像，如 `alpine`、`distroless`。可用 `AS` 命名阶段。  |  `FROM alpine:3.20 AS base`  |
|  LABEL  |  添加元数据；支持 label filter。  |  `LABEL maintainer="changweihua@outlook.com"`  |
|  RUN  |  使用 `&&` 链式执行并在末尾清理缓存，减少层大小；失败即终止构建。  |  `RUN apt-get update && apt-get install -y curl \ && rm -rf /var/lib/apt/lists/*`  |
|  COPY  |  仅本地文件；支持 `--chmod` / `--chown`；优先于 ADD。  |  `COPY --chmod=755 app /usr/bin/app`  |
|  ADD  |  额外支持 URL、自动解压，但因不易控制建议慎用。  |  `ADD https://example.com/busybox.tar.gz /`  |
|  ENV  |  设置环境变量；会影响后续缓存。  |  `ENV TZ=Asia/Shanghai`  |
|  EXPOSE  |  声明元数据，不会真正开放端口。  |  `EXPOSE 80 443`  |
|  USER  |  以非 root 身份运行提高安全性。  |  `USER 10001:10001`  |
|  WORKDIR  |  设置工作目录，相当于 `cd`。  |  `WORKDIR /app`  |
|  ENTRYPOINT  |  定义主命令；用 JSON 形式可避免 shell 解析。  |  `ENTRYPOINT ["/usr/bin/app"]`  |
|  CMD  |  默认参数；`docker run` 追加/覆盖。  |  `CMD ["--help"]`  |
|  VOLUME  |  声明匿名卷；声明后对同一路径的修改不再进入镜像层。  |  `VOLUME ["/data"]`  |

### ENTRYPOINT 与 CMD 有何区别？ ###

- **ENTRYPOINT**：定义容器启动后必定执行的"主进程"，一般不会被替换；当使用 JSON 形式时，`docker run` 只能追加参数而不能修改主进程
- **CMD**：为 ENTRYPOINT 提供"默认参数"；如果镜像未定义 ENTRYPOINT，则 CMD 本身可作为要执行的命令。当 `docker run` 明确给出新命令时会覆盖 CMD

### 实践范式 ###

```dockerfile
ENTRYPOINT ["/usr/bin/app"]
CMD ["--port=80"]
```

用户可以通过 `docker run image --port=8080` 覆盖默认参数，但仍然执行 `/usr/bin/app` 这一主进程。

### JSON 形式示例 ###

```dockerfile
# JSON 形式（推荐）- 直接执行，不经过 shell 解析
ENTRYPOINT ["/usr/bin/app", "--config", "/etc/app.conf"]
CMD ["--port", "80", "--debug"]

# Shell 形式 - 会通过 /bin/sh -c 执行
ENTRYPOINT /usr/bin/app --config /etc/app.conf
CMD --port 80 --debug
```

## 编写 Dockerfile 的 10 条最佳实践 ##

- **按变更频率排序**：先 `COPY go.mod` 等少变化文件，再 `COPY` 源码，提高缓存命中。
- **合并 RUN**：将相关命令用 `&&` 合并并清理缓存目录，减少层级。
- **使用 .dockerignore**：排除无关文件。
- **只装必需依赖**：过多包会带来额外漏洞与体积。
- **优先使用 COPY**：仅在需 `URL/` 解压时用 `ADD`。
- **启用 BuildKit**：`DOCKER_BUILDKIT=1` 或 `docker buildx build` 获取新特性与更快速度。
- **多阶段 + distroless**：减小运行时镜像并降低攻击面。
- **非 root 运行**：`USER` 指定普通用户，并确保文件权限正确。
- **健康检查**：为生产镜像添加 `HEALTHCHECK`，便于编排系统检测。
- **CI 中扫描漏洞**：结合 `trivy`、`grype` 等工具发布前扫描镜像。


6. 常见问题排查

| 现象        |      可能原因      |  解决方案 |
| :-----------: | :-----------: | :----: |
| `using cache` 但代码已更新        |      `COPY` 的路径不一致或文件在 `.dockerignore` 中      |  检查 COPY/ADD 路径；确认文件未被忽略。 |
| 镜像过大        |      未清理包缓存 / 未多阶段构建      |  采用多阶段；在 `RUN` 中删除 `/var/lib/apt/lists` 等缓存。 |
| 应用无权限访问文件        |      运行用户非 root      |  调整文件属主或使用 `--chown` `COPY` |

> 建议：在实际项目中先用该指南创建示例 Dockerfile，再依业务需求微调，持续优化镜像安全与构建效率。
