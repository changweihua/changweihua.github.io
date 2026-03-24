---
lastUpdated: true
commentabled: true
recommended: true
title: 🍃Spring Boot 多模块项目中 Parent / BOM / Starter 的正确分工
description: 🍃Spring Boot 多模块项目中 Parent / BOM / Starter 的正确分工
date: 2026-03-24 11:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 🎯 结论先行（只记这三条） ##

- ✅ Parent：继承规则（构建规范、插件、依赖管理）
- ✅ BOM（dependencyManagement）：只管版本，不引包
- ✅ Starter（dependency）：真正引入功能

## 🧱 1️⃣ Parent 是干什么的？ ##

📌 Parent ≠ 引入依赖

Parent 的职责只有这些：

- 🧩 统一依赖版本策略（通过 dependencyManagement）
- 🔧 统一插件配置（compiler / surefire / boot plugin）
- 📐 统一构建规范（Java 版本、编码、profile）

> 👉 Parent 是“规则继承”，不是“功能引入”。

## 📘 2️⃣ dependencyManagement 是不是“引入依赖”？ ##

❌ 不是

```xml
<dependencyManagement>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-dependencies</artifactId>
    <version>4.0.1</version>
    <type>pom</type>
    <scope>import</scope>
  </dependency>
</dependencyManagement>
```

这段配置的真实含义是：

> 🧾 引入 Spring Boot 4.0.1 的“版本清单（BOM）”

它只做：

- ✅ 管理 Spring Boot 相关依赖的版本

它不会：

- ❌ 引入任何 jar
- ❌ 启用任何 Spring Boot 功能

> 👉 只管版本，不进 classpath。

## 📦 3️⃣ 那 Spring Boot 功能是怎么来的？ ##

来自 Starter 👇

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

效果：

- 🌐 Spring MVC
- 🚀 内嵌 Web Server（Tomcat / Jetty）
- 🔁 自动配置

> 👉 Starter 才是真正“引包 + 启功能”的地方。

## 🏗 4️⃣ 多模块项目的正确结构 ##

### 父 POM（A） ###

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-dependencies</artifactId>
      <version>4.0.1</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

作用：

- 🔒 锁定 Spring Boot 版本
- 📏 统一所有子模块的依赖版本


### 子模块（A1 / A2 / A3） ###

```xml
<parent>
  <groupId>com.mycompany</groupId>
  <artifactId>A</artifactId>
  <version>1.0.0</version>
</parent>

<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
</dependencies>
```

效果：

- ✅ 自动使用 Spring Boot 4.0.1 的版本组合
- ✅ Web 服务可直接启动
- ❌ 不需要继承 spring-boot-starter-parent

## 🧠 5️⃣ 一句话总结（工程版） ##

> 父 POM 用 BOM 定版本，子模块用 Starter 启功能。

或者：

> dependencyManagement 管“用哪个版本”，dependency 管“用不用这个功能”。

## 🧩 6️⃣ build / plugin 是否需要在子模块再写？ ##

这是多模块项目里第二容易踩坑的问题。

### 🎯 先给结论 ###

父 POM 里的插件配置，子模块一定会继承；是否需要再写一遍，取决于插件写在 plugins 还是 pluginManagement。

### 🟢 情况一：父 POM 写在 pluginManagement（✅ 推荐） ###

```xml
<build>
  <pluginManagement>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
        <version>4.0.1</version>
      </plugin>
    </plugins>
  </pluginManagement>
</build>
```

含义：

- 🧩 只定义 插件版本和规则
- ❌ 不会自动执行插件
- ✅ 子模块 需要用时再声明（不用写 version）

子模块写法：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
  </plugins>
</build>
```

👉 这是最安全、最可控、最推荐的方式。

### 🔴 情况二：父 POM 写在 plugins（⚠️ 谨慎） ###

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-maven-plugin</artifactId>
      <version>4.0.1</version>
    </plugin>
  </plugins>
</build>
```

含义：

- ⚠️ 插件会 自动作用到所有子模块
- ❌ 包括不该打包成 Boot 应用的模块（common / api / model）

> 👉 容易导致“全家一起 repackage”的事故。

### 📊 一眼对照表 ###

|  父 POM 放置位置   |   子模块是否继承配置  |   子模块是否要再写  |  是否推荐  |
| :-----------: | :-----------: | :-----------: | :-----------: |
| pluginManagement |  ✅ 是  | ✅ 要（不写 version） |  ⭐⭐⭐⭐⭐  |
| plugins | ✅ 是  | ❌ 不用 |  ⚠️  |

## 🧠 7️⃣ 最终总结（全篇核心） ##

- dependencyManagement 决定“版本用哪个”，
- dependency 决定“功能要不要”，
- pluginManagement 决定“插件怎么用”，
- plugins 决定“插件是否执行”。

## 📌 最终结论 ##

- ✅ 父 POM import Spring Boot BOM —— 只做版本管理
- ✅ 子模块继承父 POM —— 自动获得版本与插件规则
- ✅ 子模块依赖 starter —— Spring Boot 功能生效
- ✅ 插件推荐放在 pluginManagement —— 子模块按需启用
- ❌ 不需要、也不应该再继承 Spring Boot parent

🟢 这是 Spring Boot 3 / 4 + Maven 多模块项目的推荐实践。
