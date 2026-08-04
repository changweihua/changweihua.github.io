---
lastUpdated: true
commentabled: true
recommended: true
title: 在 Spring Boot 中平衡“纯粹性”与“开发效率”的落地实践
description: 在 Spring Boot 中平衡“纯粹性”与“开发效率”的落地实践
date: 2026-04-20 14:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 引言：理想很丰满，现实很骨感 ##

教科书式的“纯粹 DDD”要求领域层完全无框架依赖：

- 实体是纯 POJO
- 仓储仅定义接口
- 持久化模型与领域模型严格分离

这种设计确实解耦极致，但在中大型 Spring Boot 项目中，往往带来沉重的代价：

- 大量转换代码：JPA Entity ↔ Domain Entity 的双向 Mapper
- 运行时开销：对象拷贝带来的 CPU 与 GC 压力
- 维护噩梦：字段变更需多处同步，极易出错

本文提出一种务实 DDD（Pragmatic DDD）方案：在保证领域边界清晰、可测试的前提下，允许领域模型直接承载 JPA 注解，大幅降低样板代码与性能损耗。这不是对 DDD 的妥协，而是对实际生产力的理性选择。

## 一、核心思路：领域模型与持久化模型合二为一 ##

### 为什么选择“混合模式”？ ###

传统严格分层带来三套模型：

- Domain Entity（纯业务，无注解）
- Persistence Entity（带 JPA 注解，无业务逻辑）
- Converter / Mapper（双向转换）

在 80% 的企业业务中，数据结构与业务规则高度耦合，强行拆分两套模型往往变成“为架构而架构”，代码量激增，业务价值却没有提升。
务实方案：

- 聚合根直接作为 JPA Entity
- 在领域类上使用 `@Entity`、`@OneToMany`、`@Embedded` 等注解
- 仓储接口直接继承 `JpaRepository` 或遵循 Spring Data 方法命名规范

### 推荐目录结构 ###

```txt
com.example.order
├── domain
│   ├── model          # 聚合根（@Entity）
│   ├── valueobject    # 值对象（@Embeddable）
│   ├── service        # 跨聚合的领域服务
│   ├── repository     # 仓储接口（继承 JpaRepository）
│   └── exception      # 领域异常
├── application
│   ├── service        # 应用服务（事务边界、流程编排）
│   ├── dto            # 输入输出 DTO
│   └── mapper         # Domain ↔ DTO 转换
├── infrastructure
│   ├── config         # JPA、审计、命名策略等
│   ├── listener       # 领域事件处理器
│   └── external       # 外部服务调用适配
└── web
    ├── controller
    └── advice
```

## 二、关键落地细节与代码示例 ##

### 聚合根：业务逻辑与 JPA 注解共存 ###

```java
package com.example.order.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Embedded
    private OrderStatus status;

    @Embedded
    private Money totalAmount;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    private LocalDateTime createdAt;

    protected Order() {}  // JPA 要求

    // 工厂方法
    public static Order create(Long userId, List<OrderItemDto> itemDtos) {
        Order order = new Order();
        order.createdAt = LocalDateTime.now();
        order.status = OrderStatus.CREATED;
        order.addItems(itemDtos);
        return order;
    }

    // 核心领域行为
    public void cancel() {
        if (status != OrderStatus.CREATED && status != OrderStatus.PAID) {
            throw new IllegalStateException("只有创建或已支付状态的订单可以取消");
        }
        this.status = OrderStatus.CANCELLED;
        // 可发布领域事件：DomainEvents.publish(new OrderCancelledEvent(id));
    }

    private void addItems(List<OrderItemDto> dtos) {
        for (OrderItemDto dto : dtos) {
            OrderItem item = new OrderItem(this, dto.getProductId(), dto.getQuantity(), dto.getPrice());
            items.add(item);
            totalAmount = totalAmount.add(item.getSubTotal());
        }
    }
}
```

核心原则：所有业务规则尽量写在实体方法中，`setter` 保持 `private/protected`，强制通过行为方法变更状态。

### 仓储接口：直接复用 Spring Data ###

```java
package com.example.order.domain.repository;

import com.example.order.domain.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdAndStatus(Long userId, OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.totalAmount.value > :minAmount")
    List<Order> findHighValueOrders(OrderStatus status, BigDecimal minAmount);
}
```

关键点：依赖的是接口契约，而非具体实现。未来替换 ORM 框架时，只需在基础设施层提供新实现即可。

### 应用层：专注流程 + DTO 转换 ###

```java
@Mapper(componentModel = "spring")
public interface OrderMapper {
    OrderDto toDto(Order order);
    CreateOrderCommand toCommand(CreateOrderRequest request);
}
```

应用服务只负责：

- 接收 DTO / Command
- 调用领域行为
- 开启事务
- 返回 DTO

## 三、这种模式真正解决了哪些痛点？ ##

- 告别贫血模型：业务逻辑天然回归实体内部
- 样板代码减少 30%–50%：无须维护两套模型 + 转换器
- 性能显著提升：避免每次查询后的深拷贝
- 架构边界依然清晰：Web 层只见 DTO，Application 层只见领域行为

## 四、风险与应对策略 ##

|  风险点   | 描述  |   规避措施  |
| :-----------: | :-----------: | :-----------: |
|  框架耦合  |   Domain 依赖 JPA 包，单元测试受限  |   使用 `@DataJpaTest` 做集成测试；纯单元测试用 Mockito 模拟 Repository  |
|  泄露实体给前端  |   误将 `Entity` 直接返回给 `Controller`  |   强制 Controller 返回 DTO；借助 MapStruct + Code Review 约束  |
|  JPA 特性滥用  |   过度使用 EAGER 加载、复杂拦截器  |  默认 LAZY 加载，必要时用 `@EntityGraph`；避免在实体中写复杂持久化逻辑  |
|  未来迁移困难  |   想彻底去掉 JPA 时成本高  |   仓储接口已抽象良好，只需替换实现类，领域逻辑无需改动  |

## 五、总结与建议 ##

DDD 的本质是控制业务复杂度，而不是追求架构的宗教式纯洁。

在 Spring Boot 生态下，“领域模型直接依赖 JPA”已被大量中大型项目验证为高性价比方案。它让：

- JPA 成为领域模型的“元数据”而非主宰
- 业务逻辑真正内聚在实体中
- 开发效率与运行性能得到兼顾

三条底线建议：

- 拒绝教条主义：别为了“无依赖”写成吨的转换代码
- 拥抱务实主义：让框架为业务服务，而不是反过来
- 坚守 DDD 核心：无论用不用注解，业务规则必须封装在领域对象内部，对外一律通过 DTO 交互

用最小的架构代价，换取最大的业务表达力与开发体验，这才是真正的“务实 DDD”。
