---
layout: doc
# 开启推荐
recommended: true
pageClass: gallery-page-class
title: 无锡硕放机场个性化登机牌
---

## 项目背景 

应机场和部分航司要求，希望可以在登机牌上给旅客输出相关个性化内容。

## 项目方案

结合现场环境(同时兼容 Windows 7、10、11 操作系统)，采用基于 .NET Framework 4.8 和 Windows Service 的项目架构。

基于 Pack 流配置的特殊性

## 数据流程

### 原始流程

```mermaid
graph LR
    A[航信] --> B[登机牌打印程序]
    B --> C[COM1]
    C --> D[打印机]
```

### 新版流程

```mermaid
graph LR
    A[航信] --> B[登机牌打印程序]
    B --> C[COM4]
    subgraph 本程序
        C --> G[VPSD]
        G --> D[COM5]
    end
    D --> E[COM1]
    E --> F[打印机]
```

### 流程变化

```mermaid
graph TB
    subgraph original [原始流程]
        direction LR
        A[航信] --> B[登机牌打印程序] --> C[COM1] --> D[打印机]
    end

    subgraph modified [修改后流程]
        direction LR
        A1[航信] --> B1[登机牌打印程序]
        subgraph highlight [COM4-COM5 重点区域]
            direction LR
            C1[COM4] --> D1[数据流修改] --> E1[COM1]
        end
        B1 --> C1
        E1 --> F1[COM1] --> G1[打印机]
    end

    original ~~~ modified

    %% 节点样式分类
    classDef orig fill:#E0F7FA,stroke:#006064,color:#000
    classDef mod fill:#FFF9C4,stroke:#F57F17,color:#000
    classDef hl fill:#FFCC80,stroke:#E65100,stroke-width:2px,color:#000

    class A,B,C,D orig
    class A1,B1,F1,G1 mod
    class C1,D1,E1 hl

    %% 虚线框样式
    style highlight stroke-dasharray: 5 5,stroke:#D32F2F,stroke-width:2px,fill:none,color:#D32F2F
```

### 业务时序图

```mermaid
sequenceDiagram
    actor 航信
    participant 登机牌打印程序
    participant COM4
    participant 登机牌个性化程序
    participant COM5
    participant COM1
    participant 打印机

    航信->>登机牌打印程序: 发送票务数据
    activate 登机牌打印程序
    登机牌打印程序->>COM4: 转发至 COM4
    activate COM4

    COM4->>登机牌个性化程序: 数据流修改
    activate 登机牌个性化程序
    登机牌个性化程序-->>COM4: 返回修改后数据
    deactivate 登机牌个性化程序

    COM4->>COM5: 传递至 COM5
    deactivate COM4
    activate COM5

    COM5->>COM1: 输出到 COM1
    activate COM1
    deactivate COM5

    COM1->>打印机: 发送打印指令
    activate 打印机
    打印机-->>COM1: 返回打印结果
    deactivate 打印机

    COM1->>登机牌个性化程序: 打印结果
    activate 登机牌个性化程序
    deactivate COM1

    alt 打印成功
        登机牌个性化程序-->>登机牌打印程序: 打印成功
    else 打印失败
        登机牌个性化程序->>登机牌打印程序: 打印失败通知
    end

    deactivate 登机牌个性化程序
    deactivate 登机牌打印程序
```

## 系统架构

```mermaid
graph TD
    %% 颜色定义
    classDef monitor fill:#E1F5FE,stroke:#0288D1,stroke-width:2px,color:#01579B
    classDef service fill:#FFF3E0,stroke:#F57C00,stroke-width:2px,color:#E65100
    classDef vserial fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#4A148C
    classDef physical fill:#E8F5E9,stroke:#388E3C,stroke-width:2px,color:#1B5E20
    classDef modify fill:#FFECB3,stroke:#FF6F00,stroke-width:2px,color:#BF360C
    classDef printer fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238
    classDef note fill:#FFF9C4,stroke:#FBC02D,stroke-dasharray: 5 5,color:#827717

    subgraph 监控层
        Monitor[监控程序]
    end
    class Monitor monitor

    subgraph 核心服务层
        WinSvc[Windows Service]
        subgraph VSerialBox[虚拟串口软件：模拟一对串联串口]
            COM4[虚拟串口 COM4]
            COM5[虚拟串口 COM5]
            COM4 ---|串联直通| COM5
        end
        Modify[串口数据修改<br/>登机牌个性化程序]
        Printer[打印机]

        WinSvc -->|调用/配置| VSerialBox
        COM4 --> Modify
        Modify --> COM5
    end
    class WinSvc service
    class COM4,COM5 vserial
    class Modify modify
    class Printer printer

    subgraph 物理驱动层
        TravelSky[登机牌打印程序<br/>航信数据入口]
        COM1[物理串口 COM1<br/>连接打印机]
    end
    class TravelSky,COM1 physical

    %% 连接
    Monitor -->|监控控制| WinSvc
    TravelSky -->|原始数据| COM4
    COM4 -->|修改后数据| COM1
    COM1 -->|物理线缆| Printer
```

- [测试用例](/zh-CN/gallery/bpp_test)
