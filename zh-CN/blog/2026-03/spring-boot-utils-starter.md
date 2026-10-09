---
lastUpdated: true
commentabled: true
recommended: true
title: 打造一个 Spring Boot Starter
description: 实现工具库并探讨其价值
date: 2026-03-19 14:15:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

Spring Boot 的 Starter 机制是其生态系统中强大的一部分，允许开发者创建可重用的模块，简化依赖管理和配置。本文将通过一个实际案例，详细讲解如何创建一个 Spring Boot Starter，用于提供字符串操作工具。

我们将实现一个 `spring-boot-utils-starter`，并探讨一个常见问题：为什么需要 Starter，而不仅仅是一个简单的 JAR 包？通过对比两者的优劣，我们将揭示 Starter 的真正价值。

## 项目背景与目标 ##

我们将创建一个名为 `spring-boot-utils-starter` 的 Spring Boot Starter，提供以下字符串操作功能：

- 反转字符串 (reverse)
- 转换为大写 (toUpperCase)
- 转换为小写 (toLowerCase)
- 拼接字符串 (concatenate)

这个 Starter 将通过 Spring Boot 的自动配置机制，让用户在引入依赖后无需额外配置即可使用这些功能。同时，我们将回答以下问题：

- `spring.factories` 可以指定多个文件吗？
- 每个文件必须是 `@Configuration` 吗？
- 为什么需要 Starter，而不仅仅是一个简单的 JAR 包？

## 项目结构 ##

项目的目录结构如下：

```txt
spring-boot-utils-starter/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── business/
│   │   │           └── springbootstringutilsstarter/
│   │   │               ├── StringUtilsService.java
│   │   │               └── StringUtilsAutoConfiguration.java
│   │   └── resources/
│   │       └── META-INF/
│   │           └── spring.factories
│   └── test/
└── target/
```

- `pom.xml`：Maven 配置文件，定义依赖和构建规则。
- `StringUtilsService.java`：核心服务类，包含字符串操作方法。
- `StringUtilsAutoConfiguration`.java：自动配置类，负责将服务类注入 Spring 容器。
- `spring.factories`：Spring Boot 自动配置的入口文件，位于 `src/main/resources/META-INF/`。

## 实现步骤 ##

### 创建 Maven 项目 ###

首先，我们需要一个 Maven 项目，pom.xml 文件如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="<http://maven.apache.org/POM/4.0.0>" xmlns:xsi="<http://www.w3.org/2001/XMLSchema-instance>"
    xsi:schemaLocation="<http://maven.apache.org/POM/4.0.0> <https://maven.apache.org/xsd/maven-4.0.0.xsd>">

    <modelVersion>4.0.0</modelVersion>
    <groupId>com.business</groupId>
    <artifactId>spring-boot-string-utils-starter</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>spring-boot-string-utils-starter</name>
    <description>spring-boot-string-utils-starter</description>
    <packaging>jar</packaging>

    <properties>
        <java.version>1.8</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <spring-boot.version>2.6.13</spring-boot.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
                <configuration>
                    <skip>true</skip>
                </configuration>
                <executions>
                    <execution>
                        <id>repackage</id>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

关键点：

- Spring Boot 版本：使用 2.6.13，确保兼容 Java 8。
- 依赖：引入 `spring-boot-starter `作为基础依赖，提供 Spring Boot 的核心功能。
- 构建插件：配置 `spring-boot-maven-plugin`，但设置 `skip=true`，因为 Starter 不需要生成可执行 JAR（Starter 只是依赖库，不是可运行应用）。
- 编码：确保项目使用 `UTF-8` 编码，防止编码问题。

### 实现字符串工具服务 ###

创建 StringUtilsService.java，包含核心字符串操作方法：

```java
package com.business.springbootstringutilsstarter;

public class StringUtilsService {

    public String reverse(String input) {
        if (input == null) {
            return null;
        }
        return new StringBuilder(input).reverse().toString();
    }

    public String toUpperCase(String input) {
        if (input == null) {
            return null;
        }
        return input.toUpperCase();
    }

    public String toLowerCase(String input) {
        if (input == null) {
            return null;
        }
        return input.toLowerCase();
    }

    public String concatenate(String str1, String str2) {
        if (str1 == null || str2 == null) {
            return null;
        }
        return str1 + str2;
    }
}
```

关键点：

- 空值检查：每个方法都包含对输入参数的空值检查，增强健壮性。
- 方法设计：提供基础的字符串操作，满足常见需求。


### 创建自动配置类 ###

创建 StringUtilsAutoConfiguration.java，将 StringUtilsService 注入 Spring 容器：

```java
package com.business.springbootstringutilsstarter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StringUtilsAutoConfiguration {

    @Bean
    public StringUtilsService stringUtilsService() {
        return new StringUtilsService();
    }
}
```

关键点：

- 注解：

  - `@Configuration`：标记这是一个 Spring 配置类。
  - `@Bean`：定义一个 Bean，Spring Boot 会自动将其注入容器。

- 作用：StringUtilsService 会被 Spring 管理，用户可以通过 `@Autowired` 直接使用。

### 配置 spring.factories ###

在 `src/main/resources/META-INF/spring.factories` 中，指定自动配置类：

```ini
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\\
com.business.springbootstringutilsstarter.StringUtilsAutoConfiguration
```

关键点：

- 路径：`META-INF/spring.factories` 是 Spring Boot 的标准路径，用于声明自动配置类。

- 键值对：

- 键 `org.springframework.boot.autoconfigure.EnableAutoConfiguration` 是 Spring Boot 自动配置的入口。
- 值是配置类的全限定名，支持指定多个类（用逗号分隔）。

## 解答问题：spring.factories 的使用 ##

在开发过程中，可能会遇到以下问题：

### `spring.factories` 可以指定多个文件吗？

是的，`spring.factories` 支持指定多个类。它的格式是一个键值对，值可以用逗号分隔指定多个类名。

#### 示例：添加另一个配置类 ####

创建一个新配置类 AnotherConfiguration.java：

```java
package com.business.springbootstringutilsstarter;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;

@Configuration
public class AnotherConfiguration {

    @Bean
    public String helloBean() {
        return "Hello from AnotherConfiguration!";
    }
}
```

更新 `spring.factories`：

```ini
org.springframework.boot.autoconfigure.EnableAutoConfiguration=com.business.springbootstringutilsstarter.StringUtilsAutoConfiguration,com.business.springbootstringutilsstarter.AnotherConfiguration
```

工作原理：

- Spring Boot 在启动时会读取 `spring.factories` 文件。
- 对于 EnableAutoConfiguration 键，Spring Boot 会加载所有列出的类（StringUtilsAutoConfiguration 和 AnotherConfiguration）。
- 结果是 StringUtilsService 和 helloBean 都会注入到 Spring 容器中。

价值：

- 支持模块化设计，允许 Starter 包含多个配置类，满足复杂需求。

### 每个文件必须是 @Configuration 吗？ ###

不一定，是否需要 `@Configuration` 取决于 `spring.factories` 中使用的键。

#### 情况 1：使用 EnableAutoConfiguration ####

- 如果键是 `org.springframework.boot.autoconfigure.EnableAutoConfiguration`，列出的类通常应该使用 @Configuration。
原- 因是 Spring Boot 期望这些类定义 Bean 或执行配置逻辑。如果没有 @Configuration，Spring 不会将其视为配置类，方法也不会被识别为 @Bean 定义。

#### 情况 2：其他键 ####

spring.factories 支持其他键，例如：

- org.springframework.context.ApplicationListener：指定事件监听器。
- org.springframework.beans.factory.config.BeanPostProcessor：指定 Bean 后置处理器。

对于这些键，类不需要是 @Configuration，只需要实现对应的接口即可。

示例：添加一个监听器

创建一个监听器 MyListener.java：

```java
package com.business.springbootstringutilsstarter;

import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;

public class MyListener implements ApplicationListener<ContextRefreshedEvent> {
    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        System.out.println("Context refreshed!");
    }
}
```

更新 spring.factories：

```ini
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\\
com.business.springbootstringutilsstarter.StringUtilsAutoConfiguration

org.springframework.context.ApplicationListener=\\
com.business.springbootstringutilsstarter.MyListener
```

分析：

- MyListener 不需要 @Configuration，因为它是一个事件监听器，只需实现 ApplicationListener 接口。
- Spring Boot 会自动注册 MyListener 为事件监听器，在容器刷新时触发 onApplicationEvent 方法。

价值：

- 提供灵活性，允许 Starter 注册不同类型的组件（如配置类、监听器、后置处理器等）。

## 使用 Starter ##

### 构建和发布 ###

运行以下命令构建项目：

```bash
mvn clean install
```

这会生成 spring-boot-string-utils-starter-0.0.1-SNAPSHOT.jar，可以发布到 Maven 仓库或本地使用。

构建后的 JAR 包结构如下：

```txt
spring-boot-string-utils-starter-0.0.1-SNAPSHOT.jar
├── META-INF/
│   └── spring.factories
├── com/
│   └── business/
│       └── springbootstringutilsstarter/
│           ├── StringUtilsService.class
│           └── StringUtilsAutoConfiguration.class
```


### 在其他项目中使用 ###

在另一个 Spring Boot 项目中引入依赖：

```xml
<dependency>
    <groupId>com.business</groupId>
    <artifactId>spring-boot-string-utils-starter</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

使用示例：

```java
package com.example.demo;

import com.business.springbootstringutilsstarter.StringUtilsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class MyService {

    private final StringUtilsService stringUtilsService;

    @Autowired
    public MyService(StringUtilsService stringUtilsService) {
        this.stringUtilsService = stringUtilsService;
    }

    public void processString(String input) {
        System.out.println("Reversed: " + stringUtilsService.reverse(input));
        System.out.println("Upper: " + stringUtilsService.toUpperCase(input));
        System.out.println("Lower: " + stringUtilsService.toLowerCase(input));
        System.out.println("Concatenated: " + stringUtilsService.concatenate(input, " World"));
    }
}
```

### 测试代码 ###

创建一个简单的 Spring Boot 应用：

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(DemoApplication.class, args);
        MyService myService = context.getBean(MyService.class);
        myService.processString("Hello");
    }
}
```

输出：

```txt
Reversed: olleH
Upper: HELLO
Lower: hello
Concatenated: Hello World
```

关键点：

- 自动注入：StringUtilsService 由 Spring 容器管理，用户通过 @Autowired 直接使用。
- 零配置：用户无需手动定义 Bean，Starter 自动完成配置。

## 探讨问题：为什么需要 Starter，而不仅仅是一个简单的 JAR 包？ ##

一个常见的疑问是：既然可以创建一个简单的 JAR 包（包含 StringUtilsService），直接引入并使用，为什么还需要 Spring Boot Starter？以下通过对比两者的实现和优劣，详细分析 Starter 的价值。

### 简单 JAR 包的实现 ###

假设我们创建一个简单的 JAR 包，包含 StringUtilsService：

```java
package com.example.utils;

public class StringUtilsService {
    public String reverse(String input) {
        return input == null ? null : new StringBuilder(input).reverse().toString();
    }

    public String toUpperCase(String input) {
        return input == null ? null : input.toUpperCase();
    }
}
```

*构建*：将这个类打包成 JAR（string-utils.jar）。

*使用*：在另一个项目中引入依赖，然后手动实例化：

```java
StringUtilsService utils = new StringUtilsService();
String result = utils.reverse("hello");
```

*替代方案*：如果想在 Spring 环境中使用，可以手动定义为 Bean：

```java
@Configuration
public class AppConfig {
    @Bean
    public StringUtilsService stringUtilsService() {
        return new StringUtilsService();
    }
}
```

### Spring Boot Starter 的实现 ###

我们的 spring-boot-utils-starter 包含：

- StringUtilsService：工具类。
- StringUtilsAutoConfiguration：自动配置类。
- spring.factories：自动配置入口。

使用时，只需引入依赖，Spring Boot 自动注入 StringUtilsService：

```java
@Autowired
private StringUtilsService stringUtilsService;
```

### 对比分析：Starter 的核心优势 ###

#### 自动配置（Zero Configuration） ####

- 简单 JAR 包：需要用户手动实例化（`new StringUtilsService()`）或手动定义为 Spring Bean。
- Spring Boot Starter：通过 `spring.factories` 和 @Configuration，Spring Boot 在启动时自动将 StringUtilsService 注入容器，用户无需任何配置即可通过 @Autowired 使用。

*价值*：

- 减少样板代码，符合 Spring Boot 的“约定优于配置”理念。
- 提升开发效率，用户无需关心 Bean 的创建和管理。

#### 条件加载（Conditional Loading） ####

- 简单 JAR 包：一旦引入，工具类总是可用，无法根据环境动态加载或禁用。
- Spring Boot Starter：支持条件注解（如 `@ConditionalOnProperty`、`@ConditionalOnClass`），可以根据配置或环境动态加载 Bean。

*示例*： 在 StringUtilsAutoConfiguration 中添加条件：

```java
@Configuration
@ConditionalOnProperty(prefix = "string.utils", name = "enabled", havingValue = "true", matchIfMissing = true)
public class StringUtilsAutoConfiguration {
    @Bean
    public StringUtilsService stringUtilsService() {
        return new StringUtilsService();
    }
}
```

用户可以通过 `application.properties` 控制：

```ini
string.utils.enabled=false
```

如果 `enabled=false`，StringUtilsService 不会加载。

*价值*：

- 提供灵活性，适合复杂场景（比如只在特定环境下启用功能）。
- 避免不必要的 Bean 加载，优化性能。

#### 与 Spring 生态的深度整合 ####

- 简单 JAR 包：只是一个独立的工具库，无法直接利用 Spring 的功能（如依赖注入、事件监听、AOP 等）。

- Spring Boot Starter：深度整合 Spring 生态，可以：

  - 使用依赖注入（注入其他 Bean）。
  - 发布和监听 Spring 事件。
  - 利用 Spring Boot 的配置机制（@ConfigurationProperties）。

*示例*： 假设 StringUtilsService 需要依赖另一个 Bean：

```java
@Configuration
public class StringUtilsAutoConfiguration {
    private final SomeOtherService otherService;

    public StringUtilsAutoConfiguration(SomeOtherService otherService) {
        this.otherService = otherService;
    }

    @Bean
    public StringUtilsService stringUtilsService() {
        return new StringUtilsService(otherService);
    }
}
```

Starter 可以轻松注入其他 Bean，而简单 JAR 包需要用户手动管理依赖。

*价值*：

充分利用 Spring 的 IoC 容器和生态系统，提升开发效率。
支持复杂业务逻辑，适合企业级应用。

#### 配置属性支持 ####

- 简单 JAR 包：无法直接支持通过 `application.properties` 自定义行为。
- Spring Boot Starter：可以使用 `@ConfigurationProperties` 提供可配置的属性。

*示例*： 添加一个配置类：

```java
@ConfigurationProperties(prefix = "string.utils")
public class StringUtilsProperties {
    private String defaultPrefix = "";

    public String getDefaultPrefix() {
        return defaultPrefix;
    }

    public void setDefaultPrefix(String defaultPrefix) {
        this.defaultPrefix = defaultPrefix;
    }
}
```

在 StringUtilsService 中使用：

```java
public class StringUtilsService {
    private final String defaultPrefix;

    public StringUtilsService(StringUtilsProperties properties) {
        this.defaultPrefix = properties.getDefaultPrefix();
    }

    public String concatenateWithPrefix(String input) {
        return defaultPrefix + input;
    }
}
```

在 StringUtilsAutoConfiguration 中启用：

```java
@Configuration
@EnableConfigurationProperties(StringUtilsProperties.class)
public class StringUtilsAutoConfiguration {
    private final StringUtilsProperties properties;

    public StringUtilsAutoConfiguration(StringUtilsProperties properties) {
        this.properties = properties;
    }

    @Bean
    public StringUtilsService stringUtilsService() {
        return new StringUtilsService(properties);
    }
}
```

用户可以在 `application.properties` 中配置：

```ini
string.utils.default-prefix=Hello_
```

调用 `stringUtilsService.concatenateWithPrefix("World")` 将返回 `Hello_World`。

*价值*：

- 提供用户友好的配置方式，增强 Starter 的灵活性和可扩展性。
- 支持动态调整行为，满足不同场景的需求。

#### 模块化与生态一致性 ####

- 简单 JAR 包：只是一个独立的库，可能不符合 Spring Boot 的使用习惯。
- Spring Boot Starter：遵循 Spring Boot 的 Starter 命名和设计规范（spring-boot-starter-*），与其他 Starter 无缝协作。

*价值*：

- 提供一致的开发体验，降低学习成本。
- 便于在 Spring Boot 生态中共享和复用。

#### 生命周期管理 ####

- 简单 JAR 包：工具类的生命周期完全由用户管理，可能导致资源泄漏或不必要的实例化。
- Spring Boot Starter：Bean 的生命周期由 Spring 容器管理，支持单例、原型等作用域，还可以利用 `@PostConstruct` 和 `@PreDestroy` 进行初始化和销毁。

*示例*：

```java
public class StringUtilsService {
    @PostConstruct
    public void init() {
        System.out.println("StringUtilsService initialized");
    }

    @PreDestroy
    public void destroy() {
        System.out.println("StringUtilsService destroyed");
    }
}
```

Spring 容器会自动调用 `init` 和 `destroy` 方法。

*价值*：

- 提供更安全和可控的资源管理。
- 避免手动管理带来的潜在问题。

### 适用场景对比 ###

#### 使用简单 JAR 包的场景 ####

- 功能非常简单：比如一个纯静态工具类（StringUtils），不需要依赖注入或配置。
- 不依赖 Spring 生态：工具类完全独立，不需要 Spring 的功能。
- 轻量级需求：项目规模小，不需要复杂的配置或条件加载。

*示例*： Apache Commons Lang 的 `StringUtils` 是一个典型的简单 JAR 包，提供静态方法（如 `StringUtils.isBlank()`），无需 Spring 环境即可使用。

#### 使用 Spring Boot Starter 的场景 ####

- 需要自动配置：希望用户引入依赖后无需手动配置即可使用。
- 需要条件加载：根据环境或配置动态启用/禁用功能。
- 需要 Spring 生态支持：依赖注入、事件监听、配置属性等。
- 模块化设计：为 Spring Boot 项目提供可复用的模块。

*示例*： `spring-boot-starter-web` 是一个典型的 Starter，它自动配置了 Web 相关的 Bean（如 DispatcherServlet），并支持条件加载和配置属性。

### 回到本案例 ###

在 `spring-boot-utils-starter` 中，虽然功能简单，但通过 Starter 实现有以下好处：

- 自动注入：用户无需手动创建 StringUtilsService 实例，直接通过 @Autowired 使用。
- 可扩展性：未来可以添加条件加载、配置属性等功能。
- Spring 生态整合：可以轻松与其他 Spring Bean 协作。
- 一致性：遵循 Spring Boot 的开发习惯，提供更好的用户体验。

*如果使用简单 JAR 包*：

- 用户需要手动实例化 StringUtilsService 或自己定义为 Bean。
- 无法支持配置属性或条件加载。
- 无法利用 Spring 的生命周期管理。

*结论*：

- 如果你的目标是创建一个轻量级、独立的工具库，且不依赖 Spring 生态，简单 JAR 包是一个更轻量级的选择。
- 如果目标是为 Spring Boot 项目提供可复用的模块，支持自动配置、条件加载和 Spring 生态整合，Starter 是更好的选择。

## 总结 ##

通过这个案例，我们创建了一个简单的 Spring Boot Starter，实现了字符串操作功能，并回答了三个关键问题：

### spring.factories 可以指定多个文件吗？ ###

可以，使用逗号分隔多个类名，支持模块化设计。

### 每个文件必须是 @Configuration 吗？ ###

不一定，取决于键的用途。对于 EnableAutoConfiguration，建议使用 @Configuration；对于其他用途（如监听器），则不需要。

### 为什么需要 Starter，而不仅仅是一个简单的 JAR 包？ ###

Starter 提供了自动配置、条件加载、Spring 生态整合、配置属性支持、模块化设计和生命周期管理等优势，适合需要深度整合 Spring Boot 生态的场景。

这个 Starter 是一个基础实现，你可以根据需求扩展：

- 添加更多字符串操作方法。
- 使用 @ConfigurationProperties 支持自定义配置。
- 添加条件注解（如 @ConditionalOnProperty）控制 Bean 的加载。
