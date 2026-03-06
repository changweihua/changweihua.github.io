---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot多模块项目
description: Parent、BOM、Starter的分工大揭秘
date: 2026-03-06 08:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 从混乱到有序：多模块项目的依赖困境 ##

在 Spring Boot 多模块项目开发的奇妙旅程中，随着业务功能的不断拓展，我们会引入越来越多的依赖。这些依赖就像是搭建高楼大厦的各种材料，种类繁多且各有其用，但也很容易引发一系列让人头疼的问题。

比如，在一个电商项目中，订单模块、商品模块和用户模块各自独立开发，每个模块都有自己的依赖。订单模块依赖于数据库连接池、JSON 处理库等，商品模块可能依赖于图片处理库、搜索服务客户端，而用户模块又依赖于认证授权框架、短信发送 SDK。当这些模块整合到一起时，很容易出现依赖版本冲突。曾经就有开发小伙伴遇到这样的情况，订单模块和商品模块依赖了不同版本的 JSON 处理库，在项目启动时就抛出了 `NoSuchMethodError` 异常，因为不同版本的库中方法签名和实现存在差异，导致程序在运行时找不到预期的方法，这使得项目无法正常启动，开发进度被迫中断。

再比如，依赖管理的混乱还会导致开发效率低下。想象一下，每次新加入一个功能，都需要花费大量时间去排查和解决依赖冲突，就像在一个杂乱无章的仓库里寻找特定的工具，不仅耗费精力，还严重影响开发的流畅性。而且，当项目进行版本升级时，由于没有统一规范的依赖管理，很可能牵一发而动全身，一个小的依赖版本变更就引发整个项目的不稳定。

这些依赖困境严重制约着项目的开发效率和稳定性，而解决这些问题的关键之一，就在于正确理解和运用 Spring Boot 多模块项目中的 Parent、BOM 和 Starter ，明确它们的分工，让依赖管理变得有条不紊。

## Parent：项目的 “规则制定者” ##

在 Spring Boot 多模块项目的 “大舞台” 上，Parent 就像是一位经验丰富、权威十足的 “规则制定者”，掌控着项目的整体构建和依赖管理的 “大方向”，确保各个模块在统一的规范下协同工作。

### （一）Parent 的核心职责 ####

Parent 的核心职责主要体现在三个关键方面：统一依赖版本策略、统一插件配置和统一构建规范 。

在统一依赖版本策略方面，Parent 通过 `dependencyManagement` 标签来集中管理项目中所有依赖的版本。就好比一个大型交响乐团，每个乐器组（依赖）都有各自的演奏者（版本），而 Parent 就像是乐团的指挥，确保所有乐器组都按照统一的乐谱（版本）进行演奏，避免出现不和谐的音符（版本冲突）。例如，在一个电商项目中，可能有商品模块、订单模块、支付模块等多个模块，每个模块都依赖于 Spring 框架、数据库连接池、JSON 处理库等。如果没有统一的版本管理，商品模块使用 Spring 5.3.10 版本，订单模块使用 Spring 5.3.15 版本，很可能在项目整合时出现各种兼容性问题。而 Parent 可以在 `dependencyManagement` 中定义 Spring 的版本为 5.3.15，这样所有子模块在引入 Spring 依赖时，都会使用这个统一的版本，从根源上避免了版本冲突的隐患 。

统一插件配置也是 Parent 的重要职责之一。在项目构建过程中，需要使用各种 Maven 插件，如编译插件、打包插件、测试插件等。Parent 可以预先配置好这些插件的版本和参数，让所有子模块继承这些配置。比如，Parent 可以配置`maven-compiler-plugin`插件的版本为 3.8.1，并且设置编译的 Java 版本为 17，这样子模块在编译时就会自动使用这个版本的插件和指定的 Java 版本，保证了整个项目编译环境的一致性 。再比如`spring-boot-maven-plugin`插件，Parent 可以配置它的版本以及一些打包相关的参数，确保所有子模块打包出来的结果都是符合项目整体要求的 。

统一构建规范方面，Parent 会定义项目的一些基础规范，如 Java 版本、编码格式、资源过滤规则、Profile 配置等。以 Java 版本为例，Parent 可以指定项目统一使用 Java 17，这样所有子模块都必须基于 Java 17 进行开发和编译，避免了因不同模块使用不同 Java 版本而导致的兼容性问题。在编码格式上，通常会统一设置为 UTF-8，确保项目在不同环境下的字符处理一致性。资源过滤规则则可以规定哪些文件或目录需要被包含或排除在项目构建过程中，Profile 配置可以让项目在不同的环境（开发、测试、生产）下使用不同的配置文件，而 Parent 可以统一管理这些 Profile 的配置方式，使得项目在不同环境下的部署和运行更加顺畅 。

### （二）与引入依赖的区别 ###

需要特别强调的是，Parent 并不是直接引入依赖，而是为依赖管理制定规则 。

我们通过一个具体的代码示例来深入理解一下。在 Maven 的 `pom.xml` 文件中，Parent 的依赖管理配置通常如下：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>multi-module-parent</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>
    <properties>
        <java.version>17</java.version>
        <spring.boot.version>3.1.5</spring.boot.version>
    </properties>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring.boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <dependency>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>1.18.30</version>
                <scope>provided</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

在这个配置中，`dependencyManagement` 标签下的依赖只是定义了版本信息，并不会真正将这些依赖引入到项目中。例如，对于`spring-boot-dependencies`这个依赖，它只是引入了 Spring Boot 相关依赖的版本清单（BOM），并不会引入任何具体的 JAR 包，也不会启用任何 Spring Boot 功能 。

真正引入依赖的操作是在子模块中进行的。以一个子模块的 `pom.xml` 为例：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.example</groupId>
        <artifactId>multi-module-parent</artifactId>
        <version>1.0.0</version>
        <relativePath>../pom.xml</relativePath>
    </parent>
    <artifactId>web-module</artifactId>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
</project>
```

在这个子模块中，当引入 `spring-boot-starter-web` 依赖时，由于父模块已经在 `dependencyManagement` 中定义了 Spring Boot 相关依赖的版本，所以这里不需要再指定版本号，子模块会自动继承父模块定义的版本。此时，`spring-boot-starter-web`依赖才会真正被引入到子模块中，并且会根据其自身的依赖传递关系，引入一系列相关的 JAR 包，从而为子模块提供 Web 开发所需的功能 。

这种配置方式的好处在于，它实现了依赖版本管理和依赖引入的分离。Parent 专注于定义依赖的版本规则，而子模块则根据自身的功能需求，灵活地引入需要的依赖，使得项目的依赖管理更加清晰、可控，也提高了项目的可维护性和可扩展性 。

## BOM：依赖版本的 “幕后管家” ##

在 Spring Boot 多模块项目中，BOM 就像是一位默默付出、却至关重要的 “幕后管家”，精心管理着项目中各种依赖的版本，确保整个项目的依赖生态和谐稳定。

### （一）BOM 的概念与作用 ###

BOM，即 Bill of Materials（物料清单） ，在 Maven 项目中，它是一种特殊的 POM（Project Object Model）文件，主要用于统一管理依赖版本 。简单来说，BOM 就像是一份详细的材料清单，列出了项目所需的各种依赖以及它们的推荐版本 。

以 Spring Boot 的 BOM 文件为例，Spring Boot 的核心 BOM 文件`spring-boot-dependencies.pom`定义了 Spring Boot 生态中各种组件的版本，包括 Spring Framework、Spring Data、Spring Cloud 等。当项目引入这个 BOM 文件后，在声明依赖时就无需显式指定版本号，Maven 会自动从 BOM 文件中获取对应的版本 。比如，在一个 Spring Boot 多模块项目中，有用户模块、订单模块等多个模块，这些模块都可能依赖 Spring 框架。如果没有 BOM，每个模块在引入 Spring 依赖时都需要手动指定版本号，这不仅繁琐，还容易出现版本不一致的问题。而有了 BOM 后，只需要在项目的 `pom.xml` 文件中引入 Spring Boot 的 BOM 文件，各个模块在引入 Spring 依赖时，Maven 会自动从 BOM 中获取版本信息，确保所有模块使用的 Spring 版本一致，避免了版本冲突，大大简化了依赖管理的工作 。

### （二）与普通 POM 的区别 ###

普通 POM 文件主要用于描述项目自身的信息，如项目名称、版本、依赖等，并且会参与项目的构建过程 。而 BOM 文件虽然也是 POM 文件的一种，但它有着独特的定位和用途 。

在依赖管理方面，普通 POM 文件中的 `<dependencies>` 标签用于声明项目实际需要引入的依赖，每个依赖都需要明确指定版本号 。例如：

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>6.1.2</version>
    </dependency>
</dependencies>
```

而 BOM 文件的 `<dependencyManagement>` 标签只是定义依赖的版本信息，并不真正引入依赖 。例如：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>6.1.2</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

项目在引入 BOM 文件后，通过 `<dependencies>` 标签声明依赖时，只需指定 groupId 和 artifactId，无需指定 version，Maven 会自动从 BOM 文件中查找匹配的版本 。这种设计使得项目依赖版本的管理更加集中和统一，降低了因版本不一致导致的依赖冲突风险 。

### （三）在多模块项目中的应用 ###

在多模块的 Spring Boot 项目中，BOM 文件可以作为统一的版本管理中心 。所有模块都引入同一个 BOM 文件，保证了整个项目依赖版本的一致性，避免了不同模块使用不同版本依赖导致的冲突 。

假设我们有一个电商多模块项目，包含商品模块、订单模块、支付模块等 。在项目的父 `pom.xml` 文件中引入 Spring Boot 的 BOM 文件：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.1.5</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

然后，各个子模块在引入依赖时，就不需要指定版本号了 。以商品模块为例：

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

这里的`spring-boot-starter-data-jpa`和`spring-boot-starter-web`依赖会自动从 Spring Boot 的 BOM 文件中获取版本信息，确保了整个项目中这些依赖版本的一致性 。如果后续需要升级 Spring Boot 的版本，只需要在父`pom.xml`文件中修改 BOM 文件的版本号，所有子模块的相关依赖都会自动升级到对应的版本，大大提高了项目的可维护性和可扩展性 。

## Starter：功能引入的 “魔法钥匙” ##

在 Spring Boot 多模块项目的 “宝藏库” 中，Starter 就像是一把神奇的 “魔法钥匙”，轻轻一挥，就能快速引入各种强大的功能，让项目的开发变得轻松又高效 。

### （一）Starter 的工作原理 ###

Starter 的工作原理主要基于三个关键机制：依赖聚合、统一版本管理和自动配置 。

依赖聚合方面，Starter 就像是一个精心整理的 “工具包”，将实现特定功能所需的一系列依赖项整合在一起 。以`spring-boot-starter-web`为例，它内部聚合了 Spring MVC 框架、嵌入式 Tomcat 服务器、JSON 处理库（如 Jackson）等依赖 。当我们在项目中引入`spring-boot-starter-web`时，Maven 会自动根据其依赖关系，将这些相关的依赖项都下载并添加到项目中，无需我们手动一个个去引入这些底层依赖 ，大大简化了依赖管理的工作 。

在统一版本管理上，Spring Boot 提供了`spring-boot-dependencies`这个依赖管理模块，它定义了所有 Spring Boot 相关依赖的版本号 。Starter 在引入依赖时，会遵循这个统一的版本管理，我们在使用 Starter 时，无需手动指定依赖的版本号，这就保证了整个项目中依赖版本的一致性，有效避免了因版本冲突而引发的各种问题 。比如，`spring-boot-starter-web`中依赖的 Spring MVC、Tomcat 等组件的版本，都是由`spring-boot-dependencies`来统一管理的，无论在哪个模块中引入`spring-boot-starter-web`，这些依赖的版本都是一致的 。

自动配置是 Starter 的一大 “魔法” 所在 。Spring Boot 的自动配置机制基于`@EnableAutoConfiguration`注解 。当 Spring Boot 应用程序启动时，它会扫描所有可能的自动配置类，这些自动配置类通过`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`文件声明 。Spring Boot 会根据当前的项目环境（如类路径下存在的类、配置文件中的属性等），通过`@Conditional`系列条件注解来判断哪些自动配置类应该生效 。例如，`WebMvcAutoConfiguration`是`spring-boot-starter-web`中的一个自动配置类，它上面使用了`@ConditionalOnClass({Servlet.class, DispatcherServlet.class})`注解，这表示只有当类路径中存在`Servlet`和`DispatcherServlet`这两个类时，这个自动配置类才会生效，才会为项目自动配置 Spring MVC 相关的组件，如`RequestMappingHandlerMapping`、`DispatcherServlet`等 ，极大地减少了我们手动配置的工作量 。

### （二）常用 Starter 介绍 ###

在 Spring Boot 的世界里，有许多常用的 Starter，它们就像是各种专业的 “工具”，适用于不同的开发场景 。

`spring-boot-starter-test`是专门为测试 Spring Boot 应用程序而设计的 。它聚合了 JUnit（Java 语言的单元测试框架）、Hamcrest（用于编写更灵活的断言）、Mockito（用于创建和管理模拟对象）等依赖 ，为我们提供了一套完整的测试工具集 。在项目的测试模块中引入这个 Starter 后，我们可以方便地编写单元测试、集成测试等，确保项目的各个功能模块都能正常工作 。比如，在一个电商项目中，我们可以使用`spring-boot-starter-test`来测试商品模块的添加商品、查询商品等功能，保证这些功能的正确性 。

`spring-boot-starter-data-jpa`则是用于 JPA（Java Persistence API）数据访问的 Starter 。它集成了 Hibernate（一个强大的 ORM 框架，用于实现对象关系映射）、Spring Data JPA（简化 JPA 开发的框架）等依赖 ，使得我们可以方便地使用 JPA 技术来进行数据库操作 。在开发需要与关系型数据库进行交互的项目时，这个 Starter 非常有用 。例如，在一个用户管理系统中，我们可以通过`spring-boot-starter-data-jpa`来实现用户信息的存储、查询、更新等操作，它会帮我们自动处理数据库连接、事务管理等繁琐的工作 。

还有`spring-boot-starter-data-redis`，它是用于集成 Redis（一种高性能的内存数据库）的 Starter 。它包含了 Redis 客户端以及RedisTemplate等依赖 ，让我们可以轻松地在 Spring Boot 项目中使用 Redis 进行缓存、分布式锁、消息队列等功能的开发 。比如，在一个高并发的电商项目中，我们可以使用`spring-boot-starter-data-redis`将热门商品信息缓存到 Redis 中，减少数据库的压力，提高系统的响应速度 。

### （三）自定义 Starter 的场景与实现 ###

在实际的企业开发中，有时候官方提供的 Starter 并不能完全满足我们的业务需求 ，这时候就需要我们自定义 Starter 。

比如，在一个大型企业的微服务架构中，各个服务之间需要进行统一的权限认证 。虽然 Spring Security 可以实现权限认证功能，但官方的`spring-boot-starter-security`可能无法满足企业特定的认证规则和业务流程 。这时候，我们就可以自定义一个包含企业特定权限认证逻辑的 Starter ，将认证相关的依赖、配置和业务逻辑封装在一起，供各个微服务模块使用 ，实现一次开发，多处复用 ，提高开发效率和代码的可维护性 。
再比如，企业内部有一套自定义的日志采集和分析系统，为了方便在各个项目中集成这套系统，我们可以将与日志采集相关的依赖、配置以及初始化逻辑封装成一个自定义的 Starter ，这样在新的项目中，只需要引入这个 Starter，就能快速实现日志采集和分析的功能 。

自定义 Starter 的实现步骤一般如下：

首先，创建一个 Maven 项目，项目的命名一般遵循`xxx-spring-boot-starter`的格式，以便与官方 Starter 区分开来 。

然后，在项目的pom.xml文件中添加必要的依赖，通常需要依赖`spring-boot-autoconfigure`和`spring-boot-starter` 。

`spring-boot-autoconfigure`提供了自动配置的基础功能，`spring-boot-starter`则是 Spring Boot Starter 的核心依赖 。

接着，创建自动配置类 。在自动配置类中，使用`@Configuration`注解标记该类为配置类，通过`@Bean`方法定义需要注入到 Spring 容器中的 Bean 。为了使配置更加灵活，可以使用`@Conditional`系列条件注解来控制 Bean 的创建条件 。例如，`@ConditionalOnClass`表示当类路径中存在指定的类时才创建 Bean，`@ConditionalOnMissingBean`表示当容器中不存在指定的 Bean 时才创建 Bean 。还可以通过`@EnableConfigurationProperties`注解启用配置属性类，将配置文件中的属性绑定到 Java 对象上，实现从配置文件中读取参数来定制化 Starter 的功能 。

最后，在`src/main/resources/META-INF/spring.factories`文件中注册自动配置类 。在这个文件中，添加`org.springframework.boot.autoconfigure.EnableAutoConfiguration=com.example.xxxAutoConfiguration`，其中`com.example.xxxAutoConfiguration`是我们自定义的自动配置类的全限定名 ，这样 Spring Boot 在启动时就能找到并加载我们的自动配置类 。

## 多模块项目中三者的协同工作 ##

### （一）项目结构示例 ###

为了更直观地理解 Parent、BOM 和 Starter 在 Spring Boot 多模块项目中的协同工作，我们来看一个完整的项目结构示例。假设我们有一个电商多模块项目，其项目结构如下：

```txt
e-commerce-parent
├── pom.xml
├── e-commerce-common
│   ├── src
│   │   ├── main
│   │   │   ├── java
│   │   │   │   └── com
│   │   │   │       └── example
│   │   │   │           └── ecomm
│   │   │   │               └── common
│   │   │   │                   ├── config
│   │   │   │                   │   └── CommonConfig.java
│   │   │   │                   └── util
│   │   │   │                       └── StringUtil.java
│   │   │   └── resources
│   │   └── test
│   │       ├── java
│   │       │   └── com
│   │       │       └── example
│   │       │           └── ecomm
│   │       │               └── common
│   │       │                   └── util
│   │       │                       └── StringUtilTest.java
│   │       └── resources
│   └── pom.xml
├── e-commerce-order
│   ├── src
│   │   ├── main
│   │   │   ├── java
│   │   │   │   └── com
│   │   │   │       └── example
│   │   │   │           └── ecomm
│   │   │   │               └── order
│   │   │   │                   ├── controller
│   │   │   │                   │   └── OrderController.java
│   │   │   │                   ├── service
│   │   │   │                   │   ├── OrderService.java
│   │   │   │                   │   └── OrderServiceImpl.java
│   │   │   │                   └── repository
│   │   │   │                       └── OrderRepository.java
│   │   │   └── resources
│   │   │       └── application.yml
│   │   └── test
│   │       ├── java
│   │       │   └── com
│   │       │       └── example
│   │       │           └── ecomm
│   │       │               └── order
│   │       │                   ├── service
│   │       │                   │   └── OrderServiceTest.java
│   │       │                   └── repository
│   │       │                       └── OrderRepositoryTest.java
│   │       └── resources
│   └── pom.xml
└── e-commerce-product
    ├── src
    │   ├── main
    │   │   ├── java
    │   │   │   └── com
    │   │   │       └── example
    │   │   │           └── ecomm
    │   │   │               └── product
    │   │   │                   ├── controller
    │   │   │                   │   └── ProductController.java
    │   │   │                   ├── service
    │   │   │                   │   ├── ProductService.java
    │   │   │                   │   └── ProductServiceImpl.java
    │   │   │                   └── repository
    │   │   │                       └── ProductRepository.java
    │   │   └── resources
    │   │       └── application.yml
    │   └── test
    │       ├── java
    │       │   └── com
    │       │       └── example
    │       │           └── ecomm
    │       │               └── product
    │       │                   ├── service
    │       │                   │   └── ProductServiceTest.java
    │       │                   └── repository
    │       │                       └── ProductRepositoryTest.java
    │       └── resources
    └── pom.xml
```

在这个项目结构中，`e-commerce-parent`是父模块，它的`pom.xml`文件定义了整个项目的依赖管理、插件配置和构建规范 。其中，通过`dependencyManagement`引入了 Spring Boot 的 BOM 文件：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.1.5</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

`e-commerce-common`是公共模块，提供一些通用的工具类和配置，它继承自父模块`e-commerce-parent` 。`e-commerce-order`和`e-commerce-product`是业务模块，分别负责订单管理和商品管理功能，它们也都继承自父模块 。这两个业务模块在各自的`pom.xml`文件中引入了所需的 Starter，比如`e-commerce-order`模块引入了`spring-boot-starter-web`和`spring-boot-starter-data-jpa`：

```xml
<dependencies>
    <dependency>
        <groupId>com.example.ecomm</groupId>
        <artifactId>e-commerce-common</artifactId>
        <version>${project.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
</dependencies>
```

这样，通过父模块`e-commerce-parent`统一管理依赖版本，借助 BOM 文件确保依赖版本的一致性，各个子模块通过引入 Starter 来启用所需的功能，从而实现了整个项目的协同工作 。

### （二）依赖管理流程 ###

在项目开发过程中，依赖管理流程大致如下：

首先，在父 POM 文件中引入 BOM 文件，定义项目中所有依赖的版本 。例如，在上述电商项目的父`pom.xml`中引入 Spring Boot 的 BOM 文件，就确定了 Spring Boot 生态中各种组件的版本 。

然后，子模块继承父 POM 。子模块在自己的`pom.xml`文件中通过`<parent>`标签指定父模块的信息，从而继承父模块的依赖管理和插件配置 。比如`e-commerce-order`模块的pom.xml中：

```xml
<parent>
    <groupId>com.example.ecomm</groupId>
    <artifactId>e-commerce-parent</artifactId>
    <version>1.0.0</version>
    <relativePath>../pom.xml</relativePath>
</parent>
```

最后，子模块根据自身功能需求依赖 Starter 。子模块在`<dependencies>`标签中引入所需的 Starter，由于父模块已经通过 BOM 文件管理了依赖版本，所以子模块在引入 Starter 时无需指定版本号，Maven 会自动从 BOM 文件中获取对应的版本 。例如`e-commerce-product`模块引入`spring-boot-starter-web`和`spring-boot-starter-data-jpa`时，就不需要指定版本，Maven 会根据 BOM 文件中的版本信息来下载相应的依赖 。

### （三）实际开发中的注意事项 ###

在实际开发中使用 Parent、BOM 和 Starter 时，有一些需要注意的问题 。

在插件配置的继承方面，虽然子模块会继承父模块的插件配置，但有时候可能需要在子模块中对某些插件进行个性化配置 。比如，父模块配置了`maven-compiler-plugin`插件的通用参数，但子模块可能需要针对自身的编译需求，调整`source`和`target`参数 。在这种情况下，子模块可以在自己的pom.xml文件中重新配置该插件，覆盖父模块的部分配置 。但要注意，重新配置时需要确保与父模块的整体配置不冲突，并且要清楚了解每个参数的作用，避免因错误配置导致编译失败 。

版本兼容性也是一个关键问题 。虽然 BOM 文件能够帮助我们统一管理依赖版本，但不同的 Spring Boot 版本、Starter 版本以及其他第三方依赖之间可能存在兼容性问题 。例如，在升级 Spring Boot 版本时，某些 Starter 可能需要相应的升级才能正常工作，否则可能会出现类找不到、方法签名不匹配等异常 。因此，在进行版本升级时，一定要仔细阅读官方文档，了解各个版本之间的变化和兼容性要求，最好在测试环境中进行充分的测试，确保项目的稳定性 。

另外，在自定义 Starter 时，要注意命名规范和包结构的合理性 。自定义 Starter 的命名一般遵循`xxx-spring-boot-starter`的格式，以便与官方 Starter 区分开来 。包结构的设计要符合项目的整体架构，确保自动配置类和相关资源文件能够被正确加载 。同时，在注册自动配置类时，要确保`META-INF/spring.factories`文件中的配置正确无误，否则自动配置功能可能无法生效 。

## 总结：构建高效的 Spring Boot 多模块项目 ##

在 Spring Boot 多模块项目的开发之旅中，Parent、BOM 和 Starter 各自扮演着不可或缺的重要角色，它们相互协作，共同构建起一个高效、稳定的项目架构 。

Parent 作为项目的 “规则制定者”，通过统一依赖版本策略、插件配置和构建规范，为整个项目奠定了坚实的基础 。它就像是项目的 “指挥官”，确保各个模块在统一的规范下协同作战，避免了因版本不一致、配置混乱等问题导致的项目风险 。通过`dependencyManagement`标签，Parent 集中管理依赖版本，使得项目中的依赖版本冲突问题大大减少，提高了项目的稳定性 。同时，统一的插件配置和构建规范，让项目的构建过程更加标准化、自动化，提高了开发效率 。

BOM 则是依赖版本的 “幕后管家”，通过定义项目中各种依赖的版本，确保了整个项目依赖生态的和谐稳定 。它就像是一份精确的 “材料清单”，为项目提供了统一的依赖版本管理，避免了因手动指定依赖版本而引发的版本冲突问题 。在多模块项目中，所有模块引入同一个 BOM 文件，使得各个模块使用的依赖版本一致，这对于项目的可维护性和可扩展性至关重要 。当需要升级依赖版本时，只需在 BOM 文件中进行统一修改，所有模块的依赖版本都会自动更新，大大简化了版本管理的工作 。

Starter 作为功能引入的 “魔法钥匙”，通过依赖聚合、统一版本管理和自动配置，让我们能够快速引入各种强大的功能 。它就像是一个便捷的 “工具包”，将实现特定功能所需的一系列依赖和自动配置整合在一起，使得我们在开发过程中无需手动引入大量底层依赖和进行繁琐的配置 。以`spring-boot-starter-web`为例，只需引入这个 Starter，就能快速搭建起一个 Web 应用，包括 Spring MVC 框架、嵌入式 Tomcat 服务器等相关依赖和自动配置，极大地提高了开发效率 。同时，Starter 遵循统一的版本管理，避免了因依赖版本不一致而导致的问题 。
正确理解和使用 Parent、BOM 和 Starter，对于提高 Spring Boot 多模块项目的开发效率、保证项目的稳定性和可维护性具有重要意义 。在实际开发中，我们要根据项目的具体需求，合理运用这三者，让它们发挥出最大的价值 。希望本文能帮助大家在 Spring Boot 多模块项目开发中，更加得心应手地运用 Parent、BOM 和 Starter，打造出更加优秀的项目 。
