---
lastUpdated: true
commentabled: true
recommended: false
title: 深入解析权限之钥RBAC模型
description: 深入解析权限之钥RBAC模型
date: 2024-03-22
---


# 深入解析权限之钥RBAC模型 #

---

在2B系统中设计中，角色基于访问控制（RBAC，Role-Based Access Control）是最常见的权限管理模型之一。它将权限分配给角色而非个别用户，简化了权限管理的过程。接下来我们一起了解下几种常见的RBAC模型。

## 标准 RBAC（RBAC0） ##

标准 RBAC 模型包含最基本的三个元素：用户（User）、角色（Role）和权限（Permission）。在这个模型中，用户被分配到一个或多个角色，并且角色被赋予一系列的权限。用户通过角色间接拥有这些权限。

![深入解析权限之钥RBAC模型](/images/rbac0.webp){data-zoomable}

## 角色分层 RBAC（RBAC1） ##

角色分层 RBAC 在标准 RBAC 的基础上增加了角色之间的继承关系，一个角色可以继承一个或多个其他角色的权限。这种模型允许创建更精细化的角色层级结构。

![深入解析权限之钥RBAC模型](/images/rbac1.webp){data-zoomable}

## 受限 RBAC（RBAC2） ##

受限 RBAC 在标准 RBAC 的基础上增加了对角色分配的限制。DSD（Dynamic Separation of Duties，动态职责分离）和SSD（Static Separation of Duties，静态职责分离）是两种关键的概念，用于增强系统的安全性和确保操作的合规性。

![深入解析权限之钥RBAC模型](/images/rbac2.webp){data-zoomable}

### 静态职责分离 (SSD) ###

静态职责分离指的是在角色分配阶段就确定的职责分离规则。在这个规则下，某些角色不可被同一个用户同时拥有，因为这些角色执行的任务可能存在潜在的利益冲突或安全风险。
例如，一个用户不能同时被赋予"银行出纳"和"审计员"的角色，因为这样会给个人掌握过多的权限，可能导致欺诈或误操作。

### 动态职责分离 (DSD) ###

动态职责分离则是指在用户会话期间动态执行的职责分离规则。在DSD中，即使用户被分配了多个角色，也可能因为当前的操作上下文而被限制同时激活这些角色。
例如，一个用户可能同时拥有"系统管理员"和"普通用户"的角色，但在特定的会话中，系统可能只允许该用户激活其中一个角色，以此来减少安全风险。

## 会话 RBAC（RBAC3） ##

RBAC3=RBAC1+RBAC2，既引入了角色间的继承关系，又引入了角色限制关系。会话 RBAC 集成了角色分层及受限RBAC的特点允许用户在同一会话中切换一组角色，从而在需要时切换他们的权限集。这种模型更加动态，适用于需要根据上下文切换权限的场景。

![深入解析权限之钥RBAC模型](/images/rbac3.webp){data-zoomable}

## 总结 ##

下面我们通过一个图片可以直观地理解不同 RBAC 模型的结构和它们之间的关系。RBAC 为复杂的权限管理提供了一种清晰、高效的解决方案。在实际应用中，可以根据系统的具体需求选择合适的 RBAC 模型。

![深入解析权限之钥RBAC模型](/images/rbac4.webp){data-zoomable}