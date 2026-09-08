---
lastUpdated: true
commentabled: true
recommended: true
title: Maven 中：作为父项目和作为依赖的本质区别
description: Maven 中：作为父项目和作为依赖的本质区别
date: 2026-09-08 12:15:00
pageClass: blog-page-class
cover: /covers/maven.svg
---

在 Maven 中，“作为父项目”（parent）和“作为依赖”（dependency）是两种完全不同的概念。它们在 Maven 的坐标体系里形式相似（都有 groupId、artifactId、version），但作用机制和语义完全不同。

## 父项目（parent）：继承关系 ##

父项目通过 `<parent>` 标签引入，子项目继承父项目的所有配置。

``xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.18</version>
</parent>
```

*子项目从父项目继承以下内容*：

- `<dependencyManagement>`：版本锁定，子项目不需要写版本号
- `<properties>`：属性定义，如 Java 版本、编码格式
- `<build>` 中的 `<pluginManagement>`：插件版本锁定
- `<build>` 中的 `<plugins>`：直接继承的插件（如 spring-boot-maven-plugin）
- `<repositories>`：仓库地址
- `<distributionManagement>`：发布配置

继承是单向的，一个子项目只有一个父项目（Maven 单继承限制）。Spring Boot 项目使用这种方式的本质是复用一套经过验证的构建策略和依赖版本组合。

*核心影响范围*：父项目的配置影响整个子项目的构建生命周期，从编译到打包再到部署。

## 依赖（dependency）：依赖关系 ##

依赖通过 `<dependency>` 标签引入，当前项目需要使用某个 Jar 包提供的类或资源时，就把这个 Jar 包声明为依赖。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

依赖的作用是让当前项目的代码能引用到这个 Jar 包中的类。它影响的是 classpath 和最终的打包产物，而不是构建流程本身。

*依赖不会传递父项目的构建配置*。比如你引入了一个自定义 Starter，这个 Starter 的父 POM 里配置了某个插件，你的项目不会因此拥有这个插件。

## 两者的本质区别 ##

| 对比维度 | 父项目 (parent) | 依赖 (dependency) |
| :--- | :--- | :--- |
| 关系类型 | 继承 | 聚合/引用 |
| 传递性 | 不传递 | 传递（可控制） |
| 数量限制 | 单继承 | 可多个 |
| 影响范围 | 构建生命周期（插件、属性、仓库等） | classpath（编译、运行时） |
| 典型用途 | 统一版本、插件配置 | 引用业务功能、工具库 |
| pom 类型 | 父项目是 pom 类型 | 依赖通常是 jar 类型 |
| 构建时是否参与打包 | ❌ 不参与 | ✅ 参与 |

## 为什么会出现“pom”类型的依赖？ ##

Maven 中还有一个特殊场景：`<dependency>` 的 `<type>pom</type>`。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-dependencies</artifactId>
    <version>2.7.18</version>
    <type>pom</type>
    <scope>import</scope>
</dependency>
```

这种写法用的是 BOM（Bill of Materials，物料清单）导入，本质上是把另一个 POM 中的 `<dependencyManagement>` 内容导入到当前项目的 `<dependencyManagement>` 中。*它只导入版本锁定信息，不导入父项目中的插件、属性、仓库等配置*。

这种方式解决了 Maven 单继承的限制。如果项目已经继承了公司的公共父 POM，可以通过 BOM 导入获得 Spring Boot 的版本管理能力，而不需要强行改变父 POM。

## 一个具体的例子说明差异 ##

*继承父项目后*：

子 POM 只有 20 行，不需要声明 Java 版本、不需要配置 `spring-boot-maven-plugin`、不需要指定 `<dependency>` 的 `<version>`。执行 `mvn package` 时，repackage 目标自动执行。

*只把 Spring Boot 当作依赖引入（不继承 parent）*：

需要手动在 `<properties>` 中声明 `java.version`，手动配置 `spring-boot-maven-plugin` 并指定 mainClass，手动管理所有依赖的版本号。

```xml
<properties>
    <java.version>17</java.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.7.18</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <mainClass>com.example.Application</mainClass>
            </configuration>
        </plugin>
    </plugins>
</build>
```

两种方式都能让项目正常启动，区别在于配置的复杂度。继承 parent 是把构建配置的细节交给父 POM 管理，依赖方式是把这些细节暴露给开发者自己维护。

## 选择建议 ##

- 没有其他父项目需要继承时，优先使用继承 `spring-boot-starter-parent` 的方式，配置最简洁
- 已经继承了其他父项目时，用 BOM 导入 + 手动配置插件，达到相同的效果
- 公司内部维护自己的父 POM 时，可以在公司父 POM 中引入 `spring-boot-dependencies` BOM，让所有子项目自动获得 Spring Boot 版本管理
- 父项目只适合管理公司级别的统一配置（如代码规范插件、仓库地址），不适合频繁修改。版本升级涉及所有子项目，需要在公司层面统一协调

>  依赖统一管理的好处

依赖统一管理带来的价值，最直接的好处是*消除了版本冲突*。

Maven 的传递依赖机制本身是为了方便开发者——你引入一个依赖，它依赖的其他 Jar 包也会自动被带进来。但传递依赖在带来便利的同时也引入了版本冲突的风险。A 依赖引用了 fastjson 1.2.58，B 依赖引用了 fastjson 1.2.83，两个不同版本同时出现在 `classpath` 中，JVM 只会加载其中一个，具体加载哪个取决于 Maven 的依赖仲裁规则。如果加载的版本不兼容，就会出现莫名其妙的运行时异常：`NoSuchMethodError`、`ClassNotFoundException`。

Spring Boot 的 `spring-boot-dependencie`s BOM 把所有 Spring 相关库以及 Spring 生态中常用的第三方库（Jackson、Tomcat、Hibernate Validator、Logback 等）的版本号锁定了。你引入 `spring-boot-starter-web`，Jackson 的版本已经确定，不会出现你的项目中其他依赖拉来一个不同版本的 Jackson 导致冲突。

统一版本管理带来的其他收益包括：

- *构建可重复性*。 `pom.xml` 中不写版本号，版本号由父 POM 锁定，意味着项目在任何环境、任何时间构建，依赖版本都是一致的。手动管理版本时，不同开发者修改不同模块的 pom 文件，各自升级了某个依赖的版本，最终合并后可能出现版本不一致的情况。统一管理后，版本升级在一个地方完成，所有子模块同步更新。

- *升级成本降低*。 Spring Boot 升级时，父 POM 的版本号一变，所有依赖的版本都跟着更新。Spring Boot 团队已经完成了兼容性测试，你只需要关注自己的业务代码是否需要适配新版本 API。手动管理版本时升级 Spring Boot，每个 starter 和第三方库都要单独改版本号，漏一个就可能引入运行时错误。

- *团队协作的一致性*。 所有模块共享同一套依赖版本，不会出现“A 模块用 2.0 版本，B 模块用 3.0 版本”的情况。代码合并时不会因为 pom 文件的版本号差异产生冲突。

在技术实现上，版本统一管理有两个层次：

`dependencyManagement` 只声明版本，不实际引入依赖。它在父 POM 或 BOM 中定义，子模块按需声明依赖（不写版本号）。Maven 解析依赖时会沿着父子链向上查找 `dependencyManagement` 中的版本定义。

`pluginManagement` 是插件层面的版本统一管理，与 `dependencyManagement` 逻辑类似。它保证了所有模块使用相同版本的 Maven 插件，避免插件版本差异导致构建行为不一致。

`spring-boot-starter-parent` 同时提供了 `dependencyManagement` 和 `pluginManagement`，既管依赖版本，也管插件版本。这也是为什么 Spring Boot 项目继承它后，连 `spring-boot-maven-plugin` 的配置都可以省掉。

在 Spring Boot 中，依赖统一管理的边界通常由 BOM（物料清单）来划定。BOM 中列出的版本已经经过兼容性测试，开发者可以直接沿用。但 BOM 不可能覆盖所有场景，如果项目中用到了 BOM 没有管理的依赖，需要自己管理版本号。

实际开发中的做法通常是：引入一个 BOM 管理核心依赖（如 `spring-boot-dependencies`），自定义的公共组件库也通过 BOM 统一版本，各业务模块引用 BOM 中的版本定义，必要时在子模块中覆盖特定依赖的版本。这样既利用了统一管理的优势，又保留了灵活性。
