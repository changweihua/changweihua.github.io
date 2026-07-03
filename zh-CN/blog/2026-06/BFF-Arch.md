---
lastUpdated: true
commentabled: true
recommended: true
title: BFF 架构浅析
description: 再也不用求后端改接口了
date: 2026-06-12 09:35:00
pageClass: blog-page-class
cover: /covers/platform.svg
---

BFF（Backend For Frontend）在项目架构中充当的是一个“承上启下”的粘合层（或适配层）。它打破了传统“前端通用后端”的两层结构，演变为“前端 → BFF 层 → 微服务/区块链”的三层结构。

为了让你清晰地理解，我们从整体架构图、内部职责分层以及部署拓扑三个维度来剖析 BFF 的项目架构。

## 整体演进架构 ##

在架构设计中，BFF 的引入改变了数据的流向。

### 传统微服务架构 ###

前端（Web/App）需要直接面对繁多的底层微服务。由于终端设备的屏幕大小、网络带宽、甚至安全要求不同，前端需要处理大量的接口聚合和数据裁剪逻辑，导致客户端代码臃肿。

### BFF 架构 ###

在前端与后端微服务之间引入了 BFF 层。

- 面向前端：BFF 为特定的客户端（如 iOS、Android、小程序）提供定制化的极简接口。
- 面向后端：BFF 充当微服务客户端，负责高并发地调用底层各种微服务（或区块链 RPC），将结果组装后返回。

## BFF 项目的内部核心架构 ##

一个标准、健壮的 BFF 项目（例如基于 Node.js/TypeScript 或 Go 编写）内部通常分为以下几层：

```mermaid
flowchart TD
    subgraph ClientLayer [Client (前端应用)]
        A[Web / App / 小程序]
    end

    subgraph BFF [BFF 项目内部架构]
        direction TB
        
        subgraph Layer1 [1. 路由与接入层]
            R1[Controller]
            R2[路由中间件]
            R3[参数校验]
        end

        subgraph Layer2 [2. 业务适配层]
            B1[并发聚合<br/>Promise.all / Goroutine]
            B2[数据裁剪 Filter]
            B3[数据格式化 Format]
        end

        subgraph Layer3 [3. 缓存与公共服务层]
            C1[(Redis 缓存)]
            C2[JWT 鉴权]
            C3[限流 Rate Limit]
            C4[日志 Logger]
        end

        subgraph Layer4 [4. 外部调用客户端]
            D1[HTTP Client]
            D2[gRPC / Dubbo Client]
            D3[Web3 RPC Provider]
        end
    end

    subgraph Backend [底层微服务 / 数据库 / 区块链]
        S1[微服务 A]
        S2[核心后端 B]
        S3[(数据库)]
        S4[区块链节点]
    end

    %% 连接关系
    A -->|HTTP / GraphQL / WS| R1
    R1 --> B1
    B1 --> B2 --> B3
    B3 --> C1
    B3 --> C2
    B3 --> D1
    B3 --> D2
    B3 --> D3
    
    D1 --> S1
    D2 --> S2
    D3 --> S4
    C1 -.-> S3

    %% 样式定义
    classDef client fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef bff_layer fill:#fff3e0,stroke:#ff6f00,stroke-width:2px;
    classDef service fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    
    class A client;
    class R1,R2,R3,B1,B2,B3,C1,C2,C3,C4,D1,D2,D3 bff_layer;
    class S1,S2,S3,S4 service;
```

*核心分层职责*：

- 路由与接入层：定义暴露给前端的 API。如果是复杂系统，现在很流行使用 GraphQL 代替 RESTful API，让前端自己决定要什么字段，BFF 动态解析。
- 业务适配层（最核心） ：这里不做深度的数据库写操作或复杂的领域业务逻辑（那些属于底层微服务）。它只做编排（Orchestration） 。比如：同时调用用户服务和订单服务，把两个结果拼成一个大 JSON。
- 外部调用客户端：BFF 经常需要和底层微服务通信。为了追求极致的性能，BFF 与底层微服务之间通常不走慢速的 HTTP/REST，而是走内部高吞吐的 gRPC 或 RPC 框架。

## 多端 BFF 架构形态 ##

BFF 架构最忌讳演变成一个“大一统”的、把所有端逻辑写在一起的“新单体后端”。标准的 BFF 架构是按端自治的：

- Web BFF：专门服务于 PC 端浏览器，由于屏幕大，可能需要返回大量列表数据和复杂的嵌套结构。
- Mobile BFF：专门服务于 iOS/Android App，注重数据裁剪、省流量、合并请求，并且可能需要适配弱网环境。
- Open API BFF：专门服务于第三方开放平台，注重安全、签名校验、和频率限制。

各个 BFF 项目之间互不干扰，分别由对应的前端团队或全栈团队独立开发、独立部署。

## BFF 架构带来的典型痛点与解决（架构师视角） ##

虽然 BFF 架构很美妙，但引入它也会引入新的架构挑战：

| 挑战 | 导致后果 | 架构解决手段 |
| :--- | :--- | :--- |
| **链路变长（多一层网络）** | 增加了请求的延迟（Latency） | 1. BFF 与底层微服务采用 **gRPC** 进行高速内网通信。<br>2. 强依赖 **Promise.all** 或协程进行异步并发调用，禁止串行阻塞。 |
| **单点故障（SPOF）** | BFF 如果挂了，整个前端界面直接瘫痪 | 1. BFF 必须做到 **无状态（Stateless）**，方便利用 K8s 动态横向扩容。<br>2. 引入 **熔断、降级** 机制（如底层某个微服务挂了，BFF 裁剪掉该模块，依然返回页面的其他部分）。 |
| **职责边界模糊** | 底层后端偷懒，把本该属于核心业务的逻辑甩锅给 BFF 写 | 严格制定规范：**涉及数据一致性、数据库事务、核心领域逻辑**的，必须写在底层后端。BFF 只做数据的“搬运、组装和清洗”。 |

总的来说，BFF 项目架构的本质是“用服务端的算力和内网带宽，去换取客户端的极致体验和开发团队的敏捷迭代”。对于业务频繁变动、多端并存的现代互联网或 Web3 项目，它是非常标准且高效的架构选择。
