---
lastUpdated: true
commentabled: true
recommended: true
title: 内网服务器如何“优雅”地搬运 Docker 镜像？
description: 除了 docker save，你该试试这几招
date: 2026-05-15 10:55:00 
pageClass: blog-page-class
cover: /covers/docker.svg
---

## 前言 ##

做运维或者后端开发的兄弟们，多少都经历过这种绝望时刻：

甲方爸爸的服务器是在纯内网环境（Air-gapped），完全不通外网。

或者，由于最近众所周知的网络原因，在服务器上直接 docker pull 就像在用 2G 网冲浪，进度条卡在 99% 不动了。

这时候，如何把镜像“搬”进去，就成了必须要掌握的生存技能。大多数人只会用最基础的 docker save，但这在很多场景下其实并不优雅。今天分享三种不同维度的离线下载方案，从“常规操作”到“降维打击”，总有一款适合你。

## 方案一：老实人必会 —— 标准的 Save & Load ##

适用场景： 你的手边正好有一台装了 Docker 的能联网的机器（比如你的开发机 MacBook 或 Windows Laptop）。

这是最经典的“U 盘拷贝法”，原理简单粗暴：在有网的机器上拉取，打包成 tar，传到内网，解压。

### 打包（Export） ###

在能联网的机器上执行：

```bash
# 1. 先把镜像拉下来
docker pull nginx:alpine

# 2. 打包成 tar 文件（推荐使用 -o 参数指定输出文件名）
docker save -o nginx_alpine.tar nginx:alpine

# 也可以同时打包多个镜像，方便批量迁移
docker save -o infrastructure.tar nginx:alpine redis:alpine mysql:5.7
```

### 传输与导入（Import） ###

通过 SCP、SFTP 或者物理 U 盘将 `tar` 包上传到内网服务器，然后执行：

```bash
# 加载镜像
docker load -i nginx_alpine.tar
```

❌ 痛点：

- 依赖重： 你必须在下载端也安装完整的 Docker Desktop/Engine。
- 速度慢： `docker save` 导出的包通常未经压缩，体积较大，传输费劲（虽然可以用 `gzip` 管道压缩，但操作繁琐）。

## 方案二：降维打击 —— Skopeo（强推！） ##

适用场景： CI/CD 流水线、Linux 跳板机、不想安装 Docker 守护进程的轻量级环境。

如果说 Docker 是重型卡车，那 Skopeo 就是瑞士军刀。这是 Red Hat 出品的工具，它最大的优势在于：不需要启动 Docker Daemon 就可以操作镜像。

这意味着，你可以在一台没有任何容器运行时的 Linux 机器上，直接把远程仓库的镜像“扣”下来变成文件。

### 安装 Skopeo ###

CentOS/RHEL 系：

```bash
yum install skopeo
```

MacOS:

```bash
brew install skopeo
```

### 直接从远程仓库 Copy 到本地文件 ###

注意看，这里不需要 docker pull，直接一步到位：

```bash
# 格式：skopeo copy docker://<镜像名> docker-archive:<本地文件名>

skopeo copy docker://alpine:latest docker-archive:alpine-offline.tar
```

✅ 优势：

- 轻量级： 不需要 root 权限，不需要 Docker 守护进程。
- 支持多架构： 可以通过 `--override-arch` 参数下载 ARM 架构的镜像（哪怕你用的是 x86 的机器），这对于给国产化服务器（鲲鹏、飞腾）准备镜像简直是神技。

```bash
# 在 x86 机器上下载 ARM64 架构的镜像
skopeo copy --override-arch arm64 docker://nginx:latest docker-archive:nginx-arm64.tar
```

## 方案三：极客玩法 —— 无环境纯脚本下载 ##

适用场景： 手头只有一台 Windows 办公机，不想装 Docker Desktop，不想装虚拟机，只想搞个文件下来。

这时候我们可以利用 Docker Registry V2 的 API 原理，通过 Python 或 Shell 脚本直接模拟 HTTP 请求把层（Layers）拉下来并拼装。

这里推荐一个开源项目：`docker-drag`（或者类似的 Shell 脚本变种）。

### 获取工具 ###

GitHub 上有很多类似的脚本，比如 `moby/moby` 官方库里的 `download-frozen-image-v2.sh`，或者社区的 docker-drag。

以一个简化的 Python 脚本为例（假设工具名为 docker_pull.py）：

### 执行下载 ###

```bash
# 不需要 Docker 环境，只要有 Python 即可
python docker_pull.py nginx:latest
```

它会自动分析 Manifest，并发下载所有的 Layers，最后生成一个标准的 Docker Tarball。

✅ 优势：

- 零依赖： 有 Python 或者 Bash 就能跑。
- 救急专用： 在极端受限的跳板机上，连 Skopeo 都没法装的时候，拷贝一个脚本进去就能干活。

## 总结：该怎么选？ ##

|   **方案**   |      **工具**      |  **核心特点**    |   **推荐指数**   |  **适用场景**   |
| :------------- | :-----------: | :-----------: | :-----------: | :-----------: |
|  方案一  |  Docker CLI  |  稳健、普适  |  ⭐⭐⭐  |  个人电脑已装 Docker，偶尔传一两个镜像  |
|  方案二  |  Skopeo  |  专业、灵活  |  ⭐⭐⭐⭐⭐  |  运维大批量操作、CI/CD 流水线、跨架构下载  |
|  方案三  |  脚本/API  |  极致轻量  |  ⭐⭐⭐  |  临时救急、无权限安装软件的跳板机  |

💡 最后的建议：

如果你是负责维护基础设施的（比如我），强烈建议在你的工具箱里备好 Skopeo。当你需要给内网的 Kubernetes 集群搬运几百个镜像，或者需要精准控制镜像架构（amd64/arm64）时，你会回来感谢我的。
