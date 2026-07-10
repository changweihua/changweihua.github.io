---
lastUpdated: true
commentabled: true
recommended: true
title: 把 .NET 项目从 docker-compose 迁到 k3s
description: 别再手工发版，回滚从 10 分钟降到 1 分钟内
date: 2026-05-18 09:15:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

很多 .NET 项目在早期都会走同一条路:先用 docker-compose 跑起来,上线后靠 SSH + 脚本发布。

这条路能跑,但一旦业务复杂度上来,问题会集中爆发:

- 发布靠手工,容易漏步骤;
- 容器重建后 IP 变化,服务互调不稳定;
- 回滚慢,线上故障窗口长;
- 观测组件和业务组件混在一起,升级互相影响。

我把一套 .NET 服务从 docker-compose 迁到了 k3s。本文只讲实战:怎么迁、踩了哪些坑、迁完收益到底值不值。

## 为什么选 k3s,不是直接上“大而全”k8s ##

我的目标不是堆技术名词,而是解决真实问题:

- 发布和回滚标准化;
- 服务发现不再依赖写死地址;
- 探针和副本机制兜住线上稳定性;
- 可观测性链路统一管理。

k3s 对中小团队很友好:安装快、资源占用小、生态兼容标准 k8s。先把核心流程跑通,再谈多节点和高可用。

## 迁移思路:先做“资源映射”,再做“能力增强” ##

我把 compose 配置按下面方式翻译:

- service -> Deployment / StatefulSet
- env -> ConfigMap / Secret
- depends_on -> Readiness / Liveness Probe
- ports -> Service + Ingress
- volume -> PVC

这一步是迁移成败关键。很多人失败不是不会写 YAML,而是脑子里还停留在单机编排思维。

### 业务服务 Deployment 示例 ###

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-api
  namespace: prod
spec:
  replicas: 2
  selector:
    matchLabels:
      app: app-api
  template:
    metadata:
      labels:
        app: app-api
    spec:
      containers:
      - name: app-api
        image: ghcr.io/your-org/app-api:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: ASPNETCORE_URLS
          value: http://+:8080
        - name: ConnectionStrings__PostgreSQL
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: pg_conn
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 20
          periodSeconds: 10
        resources:
          requests:
            cpu: "200m"
            memory: "256Mi"
          limits:
            cpu: "1000m"
            memory: "1Gi"
```

## 有状态组件怎么放:别一次性把风险拉满 ##

我的策略是:

- PostgreSQL 先保持在已有稳定环境(宿主机或独立实例);
- Redis 放进 k3s,但必须绑定 PVC;
- 所有连接串走 Secret,不写死 IP。

原因很直接:有状态服务上 k8s 当然可以做,但备份、恢复、IO 和故障演练要求更高。中小团队最稳妥的路径是先把无状态服务迁完,快速拿到收益。

## 可观测性迁移:OTel 用 Helm 管起来 ##

如果你已经有 OpenTelemetry,迁 k3s 时建议直接改成 Helm 管理,版本和升级都更可控。

```bash
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm upgrade --install otel-collector open-telemetry/opentelemetry-collector \
  -n observability --create-namespace \
  -f values-otel-collector.yaml
```

values 里我保留了尾采样策略:

- 错误请求 100% 保留
- 慢请求 100% 保留
- 普通请求按比例采样

这样做的效果很明显:关键问题不丢,存储压力可控。

## 发布与回滚:从“上机器改命令”到声明式 ##

迁移后发布流程变成:

- 构建并推送镜像;
- 更新 Deployment 镜像版本;
- 观察 rollout 状态;
- 异常直接 rollback。

常用命令:

```bash
kubectl -n prod set image deploy/app-api app-api=ghcr.io/your-org/app-api:1.0.1
kubectl -n prod rollout status deploy/app-api
kubectl -n prod rollout history deploy/app-api
kubectl -n prod rollout undo deploy/app-api
```

这套流程的价值很现实:回滚不再依赖“谁记得上一个版本怎么发的”。

## 我踩过的 6 个坑(强烈建议先看) ##

### 坑 1:探针路径写错,Pod 无限重启 ###

- 现象: CrashLoopBackOff
- 原因: 接口升级后路径变化,探针还指向旧地址
- 处理: liveness 和 readiness 分开设计,并设置合理延迟

### 坑 2:Service selector 与 Pod label 不一致 ###

- 现象: Ingress 502
- 处理: 先看 endpoints 是否为空,再核对 label

### 坑 3:时区不统一,日志和 Trace 对不上 ###

- 处理: 容器统一时区,并统一 Grafana/Loki 展示时区

### 坑 4:内存 limit 太紧,高峰期 OOMKilled ###

- 处理: 结合运行时指标调高 limit,requests 也别过低

### 坑 5:把 Secret 明文提交到仓库 ###

- 处理: 仓库只存模板,真实值通过 CI/CD 或集群注入

### 坑 6:Ingress 没透传真实 IP ###

- 处理: 转发真实客户端 IP,并在 ASP.NET Core 启用 ForwardedHeaders

## 结语 ##

k3s 不是银弹,但它把“不稳定靠人扛”变成了“稳定靠系统兜底”。对中小规模 .NET 团队来说,这一步非常值。

如果你现在还在用 docker-compose 硬扛生产,可以先做一件事:挑一个无状态服务,按本文流程迁到 k3s。

不用一次到位,但要先跑通正确路径。
