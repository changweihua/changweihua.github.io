---
lastUpdated: true
commentabled: true
recommended: true
title: Docker Swarm 完全指南
description: 从原理到实战
date: 2025-09-24 15:30:00 
pageClass: blog-page-class
cover: /covers/docker.svg
---

## 前言 ##

在现代应用部署中，单机容器化已经无法满足大规模应用的需求。Docker Swarm 作为 Docker 原生的集群管理和编排工具，提供了一个简单 yet 强大的方式来部署和管理跨多主机的容器化应用。本文将深入探讨 Docker Swarm 的各个方面，从核心概念到实战部署，帮助你掌握生产级的容器编排技术。

## 一、Docker Swarm 是什么？ ##

### 核心定义 ###

Docker Swarm 是 Docker 原生的集群管理和编排工具，它允许用户将多个 Docker 主机聚合成一个虚拟的单一系统，提供高可用性、负载均衡和弹性扩展能力。

### Swarm 模式 vs 单机 Docker ###

|  特性   |  单机 Docker  |  Docker Swarm  | 
| :-----------: | :-----------: | :-----------: |
| 主机数量 | 单台 | 多台（集群） |
| 高可用性 | 无 | 内置支持 |
| 服务发现 | 手动配置 | 自动服务发现 |
| 负载均衡 | 需要外部工具 | 内置负载均衡 |
| 扩展性 | 手动扩展 | 一键扩展 |
| 滚动更新 | 手动操作 | 自动滚动更新 |

### Swarm 在容器编排生态中的位置 ###

- **Docker Swarm**：轻量级、易上手、Docker 原生
- **Kubernetes**：功能强大、生态丰富、学习曲线陡峭
- **Nomad**：灵活、多云支持、相对简单

## 二、Docker Swarm 架构与工作原理 ##

### 集群架构 ###

```text
┌─────────────────────────────────────────────────┐
│                   Swarm Cluster                 │
│                                                 │
│  ┌─────────────┐    ┌─────────────┐             │
│  │  Manager    │    │  Manager    │             │
│  │   Node      │    │   Node      │             │
│  │ (Leader)    │    │ (Replica)   │             │
│  └─────────────┘    └─────────────┘             │
│          │               │                      │
│          ├───────────────┤                      │
│          ▼               ▼                      │
│  ┌─────────────┐    ┌─────────────┐             │
│  │  Worker     │    │  Worker     │             │
│  │   Node      │    │   Node      │             │
│  └─────────────┘    └─────────────┘             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 核心组件 ###

**Raft 一致性算法**

- 用于 Manager 节点间的状态一致性
- 需要多数节点在线才能进行集群管理操作
- 推荐使用 3 或 5 个 Manager 节点实现高可用

**Dispatcher**

- 负责将任务分配给合适的节点
- 监控任务状态并处理故障

**Scheduler**

- 根据策略决定任务在哪个节点运行
- 支持多种调度策略

**Node**

- 每个节点都有唯一的 ID 和角色
- 节点间通过 TLS 进行安全通信

### 工作流程 ###

- **服务创建**：用户通过 Manager 节点创建服务
- **调度决策**：Scheduler 根据策略选择运行节点
- **任务分配**：Dispatcher 将任务分配给 Worker 节点
- **状态同步**：所有节点通过 gossip 协议同步状态
- **健康检查**：Manager 监控节点和服务状态

## 三、核心概念详解 ##

### 节点（Nodes） ###

**Manager 节点**

- 负责集群管理任务
- 维护集群状态
- 调度服务
- 提供 API 端点

**Worker 节点**

- 执行容器任务
- 接收 Manager 节点的指令
- 报告任务状态

```bash
# 查看节点信息
docker node ls

# 查看节点详情
docker node inspect <node-name>

# 提升节点角色
docker node promote <node-name>

# 降级节点角色
docker node demote <node-name>
```

### 服务（Services） ###

服务是 Swarm 的核心概念，定义了要运行的任务：

```bash
# 创建服务
docker service create --name web --replicas 3 nginx:latest

# 查看服务
docker service ls

# 查看服务详情
docker service ps web

# 扩展服务
docker service scale web=5

# 更新服务
docker service update --image nginx:1.23 web
```

### 任务（Tasks） ###

任务是调度的最小单元，对应一个运行的容器：

```bash
# 查看任务列表
docker service ps <service-name>

# 任务状态包括：New, Pending, Assigned, Preparing, Running, Complete, Failed, Shutdown, Rejected, Orphaned
```

### 集群（Cluster） ###

集群是一组节点的集合：

```bash
# 初始化集群
docker swarm init --advertise-addr <MANAGER-IP>

# 加入集群
docker swarm join --token <TOKEN> <MANAGER-IP>:2377

# 查看集群信息
docker info
```

## 四、调度策略与模式 ##

### 内置调度策略 ###

**Spread 策略（默认）**

- 将任务均匀分布 across 所有节点
- 避免单节点过载
- 最大化可用性

```bash
# 使用spread策略（默认）
docker service create --name web --replicas 5 nginx:latest
```

**BinPack 策略**

- 尽可能将任务打包到少数节点
- 节省资源，提高利用率
- 可能降低可用性

```bash
# 使用binpack策略
docker service create --name web --replicas 5 --placement-pref spread=node.labels.zone nginx:latest
```

**Random 策略**

- 随机选择节点
- 主要用于测试

### 高级调度约束 ###

**节点标签约束**

```bash
# 给节点添加标签
docker node update --label-add zone=east node1
docker node update --label-add zone=west node2

# 使用标签约束
docker service create \
  --name web \
  --replicas 3 \
  --constraint 'node.labels.zone == east' \
  nginx:latest
```

**资源约束**

```bash
# 基于节点角色
docker service create \
  --name web \
  --constraint 'node.role == manager' \
  nginx:latest

# 基于主机名
docker service create \
  --name web \
  --constraint 'node.hostname != node3' \
  nginx:latest
```

### 放置偏好（Placement Preferences） ###

```bash
# 多个放置偏好
docker service create \
  --name web \
  --replicas 6 \
  --placement-pref 'spread=node.labels.datacenter' \
  --placement-pref 'spread=node.labels.rack' \
  nginx:latest
```

## 五、Docker Swarm 核心特性 ##

### 高可用性 ###

**服务副本**：

```bash
# 创建高可用服务
docker service create \
  --name database \
  --replicas 3 \
  --update-parallelism 1 \
  --update-delay 10s \
  postgres:13
```

**节点故障转移**：

- 自动检测节点故障
- 在健康节点上重新调度任务
- 保持期望的副本数量

### 滚动更新 ###

```bash
# 配置滚动更新策略
docker service create \
  --name web \
  --replicas 5 \
  --update-parallelism 2 \
  --update-delay 10s \
  --update-failure-action rollback \
  nginx:1.20

# 触发滚动更新
docker service update \
  --image nginx:1.21 \
  --update-parallelism 1 \
  --update-delay 30s \
  web
```

### 服务回滚 ###

```bash
# 自动回滚配置
docker service create \
  --name web \
  --replicas 5 \
  --rollback-parallelism 1 \
  --rollback-delay 10s \
  --rollback-max-failure-ratio 0.2 \
  nginx:latest

# 手动回滚
docker service rollback web
```

### 配置和密钥管理 ###

```bash
# 创建配置
echo "database_url: postgresql://user:pass@db:5432/app" | docker config create app-config -

# 创建密钥
echo "secret-password" | docker secret create db-password -

# 使用配置和密钥
docker service create \
  --name app \
  --config source=app-config,target=/app/config.yaml \
  --secret source=db-password,target=/run/secrets/db-password \
  my-app:latest
```

## 六、Swarm 网络管理 ##

### 网络架构 ###

**Overlay 网络**：

```bash
# 创建overlay网络
docker network create \
  --driver overlay \
  --subnet 10.0.0.0/24 \
  --attachable \
  my-overlay-net
```

**Ingress 网络**：

- 默认的 overlay 网络
- 处理入站流量
- 提供负载均衡

**docker_gwbridge 网络**：

- 连接 overlay 网络和物理网络
- 处理出站流量

### 服务发现和负载均衡 ###

**内部负载均衡**：

```bash
# 服务间通过服务名自动发现和负载均衡
docker service create \
  --name web \
  --network my-overlay-net \
  --replicas 3 \
  nginx:latest

# 在另一个服务中可以通过"web"主机名访问
docker service create \
  --name app \
  --network my-overlay-net \
  my-app:latest  # 可以在代码中访问 http://web:80
```

**外部负载均衡**：

```bash
# 发布端口到外部
docker service create \
  --name web \
  --publish published=8080,target=80 \
  --replicas 3 \
  nginx:latest
```

### 网络隔离和安全 ###

```bash
# 创建内部网络（不对外暴露）
docker network create \
  --driver overlay \
  --internal \
  internal-net

# 网络加密
docker network create \
  --driver overlay \
  --opt encrypted \
  secure-net
```

## 七、安装和部署实战 ##

### 环境准备 ###

准备 3 台 Linux 主机（1 Manager + 2 Workers）：

- Manager: 192.168.1.10
- Worker1: 192.168.1.11
- Worker2: 192.168.1.12

### 初始化 Swarm 集群 ###

**在 Manager 节点上**：

```bash
# 初始化Swarm
docker swarm init --advertise-addr 192.168.1.10

# 输出示例：
Swarm initialized: current node (xyz) is now a manager.

To add a worker to this swarm, run the following command:

    docker swarm join --token SWMTKN-1-0xxx 192.168.1.10:2377

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
```

**获取加入令牌**：

```bash
# 获取worker加入令牌
docker swarm join-token worker

# 获取manager加入令牌
docker swarm join-token manager
```

**在 Worker 节点上**：

```bash
# 加入Swarm集群
docker swarm join --token SWMTKN-1-0xxx 192.168.1.10:2377
```

### 验证集群状态 ###

```bash
# 在Manager节点查看集群状态
docker node ls

# 输出示例：
ID                            HOSTNAME   STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
x1y2z3 *   manager1   Ready     Active         Leader           20.10.7
a2b3c4      worker1    Ready     Active                          20.10.7
d4e5f6      worker2    Ready     Active                          20.10.7
```

## 八、实战案例：部署高可用 Web 应用 ##

### 部署架构 ###

```text
┌─────────────────────────────────────────────────┐
│                 Swarm Cluster                   │
│                                                 │
│  ┌─────────────┐    ┌─────────────┐             │
│  │  Manager    │    │   Worker    │             │
│  │   Node      │    │   Node      │             │
│  │             │    │             │             │
│  │  ▢ Web     │    │  ▢ Web      │            │
│  │  ▢ Redis    │    │  ▢ Web      │            │
│  │  ▢ Nginx    │    │             │            │
│  └─────────────┘    └─────────────┘            │
│          │               │                     │
│          └───────────────┘                     │
│                  │                             │
│  ┌─────────────┐ │                             │
│  │   Worker    │ │                             │
│  │   Node      │ │                             │
│  │             │ │                             │
│  │  ▢ Web      │ │                             │
│  │  ▢ Redis    │ │                             │
│  └─────────────┘ │                             │
│                  ▼                             │
│            Load Balancer                       │
│                 │                              │
│                 ▼                              │
│            External Users                      │
└─────────────────────────────────────────────────┘
```

### 创建 Overlay 网络 ###

```bash
# 创建用于应用通信的overlay网络
docker network create \
  --driver overlay \
  --subnet 10.0.1.0/24 \
  --attachable \
  app-network
```

### 部署 Redis 服务 ###

```bash
# 创建Redis服务
docker service create \
  --name redis \
  --network app-network \
  --replicas 2 \
  --update-parallelism 1 \
  --update-delay 10s \
  --restart-condition any \
  --health-cmd "redis-cli ping" \
  --health-interval 5s \
  --health-timeout 3s \
  --health-retries 3 \
  redis:6-alpine
```

### 部署 Web 应用服务 ###

```bash
# 创建Web应用服务
docker service create \
  --name webapp \
  --network app-network \
  --replicas 4 \
  --update-parallelism 2 \
  --update-delay 15s \
  --restart-condition any \
  --env REDIS_HOST=redis \
  --env NODE_ENV=production \
  --limit-memory 512M \
  --reserve-memory 256M \
  my-webapp:latest
```

### 部署 Nginx 负载均衡器 ###

```bash
# 创建Nginx配置
docker config create nginx-config ./nginx.conf

# 创建Nginx服务
docker service create \
  --name nginx \
  --network app-network \
  --publish published=80,target=80,mode=host \
  --publish published=443,target=443,mode=host \
  --config source=nginx-config,target=/etc/nginx/nginx.conf \
  --mode global \
  nginx:alpine
```

### 监控和运维 ###

```bash
# 查看服务状态
docker service ls

# 查看详细任务状态
docker service ps webapp

# 扩展Web服务
docker service scale webapp=6

# 滚动更新Web服务
docker service update \
  --image my-webapp:2.0 \
  --update-parallelism 1 \
  --update-delay 30s \
  webapp

# 查看服务日志
docker service logs -f webapp

# 监控节点资源
docker node ps $(docker node ls -q)
```

## 九、高级部署模式 ##

### 全局服务（Global Services） ###

```bash
# 在每个节点上运行监控代理
docker service create \
  --name node-exporter \
  --mode global \
  --mount type=bind,source=/proc,target=/host/proc \
  --mount type=bind,source=/sys,target=/host/sys \
  prom/node-exporter:latest
```

### 多架构部署 ###

```bash
# 部署多架构服务
docker service create \
  --name multi-arch-app \
  --placement-pref 'spread=node.labels.arch' \
  --constraint 'node.labels.arch == x86_64' \
  --constraint 'node.labels.arch == arm64' \
  multi-arch-app:latest
```

### 金丝雀发布 ###

```bash
# 第一步：部署新版本的部分实例
docker service create \
  --name webapp-canary \
  --network app-network \
  --replicas 2 \
  my-webapp:2.0

# 第二步：验证金丝雀版本
# 第三步：逐步替换旧版本
docker service update \
  --image my-webapp:2.0 \
  --update-parallelism 1 \
  --update-delay 30s \
  webapp
```

## 十、故障排查和维护 ##

### 常见问题排查 ###

```bash
# 查看集群健康状态
docker node ls

# 检查服务状态
docker service ls
docker service ps <service-name>

# 查看节点资源使用情况
docker node ps --format pretty $(docker node ls -q)

# 检查网络连接
docker network inspect app-network

# 查看容器日志
docker service logs <service-name>
```

###  集群维护 ###

```bash
# 排空节点（准备维护）
docker node update --availability drain node1

# 恢复节点
docker node update --availability active node1

# 备份Swarm状态
docker swarm init --force-new-cluster

# 安全离开集群
docker swarm leave --force
```

### 安全最佳实践 ###

```bash
# 轮换加入令牌
docker swarm join-token --rotate worker
docker swarm join-token --rotate manager

# 使用TLS加密
docker swarm init --advertise-addr <ip> --tlsverify

# 限制管理节点访问
iptables -A DOCKER-USER -p tcp --dport 2377 -j DROP
iptables -A DOCKER-USER -s <trusted-ip> -p tcp --dport 2377 -j ACCEPT
```

## 总结 ##

Docker Swarm 提供了一个强大 yet 简单的容器编排解决方案，特别适合中小型企业和刚刚开始容器化旅程的团队。通过本文的深入学习，你应该能够：

- 理解 Swarm 的核心架构和工作原理
- 掌握关键概念：节点、服务、任务、集群
- 配置高级调度策略和放置约束
- 部署生产级应用 with 高可用性和滚动更新
- 管理 Swarm 网络和安全配置
- 进行故障排查和日常维护

Swarm 的优势在于其与 Docker 生态系统的无缝集成和较低的学习曲线，让你能够快速构建和管理生产级的容器化应用。

记住，选择编排工具时应该基于团队的技术水平、应用规模和业务需求。对于大多数场景，Docker Swarm 提供了一个完美的平衡点 between 功能复杂性和易用性。
