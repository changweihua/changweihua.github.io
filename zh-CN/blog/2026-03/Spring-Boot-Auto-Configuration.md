---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot自动装配原理
description: Spring Boot自动装配原理
date: 2026-03-20 08:55:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、什么是自动装配？ ##

Spring Boot的自动装配（Auto-Configuration）是其最核心的特性之一。简单来说，它能够根据项目中的依赖jar包、已定义的Bean以及各种配置信息，自动为Spring容器配置合适的Bean，从而大大减少了繁琐的XML配置和Java配置代码。

> 自动装配的核心思想：约定优于配置

## 二、从@SpringBootApplication说起 ##

每个Spring Boot应用的启动类上都有 `@SpringBootApplication` 注解，它是自动装配的入口：

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

查看 @SpringBootApplication的源码：

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@ComponentScan(excludeFilters = {
    @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
    @Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class)
})
@EnableAutoConfiguration
public @interface SpringBootApplication {
    // ...
}
```

可以看到，它是一个组合注解，包含三个核心注解：

| **注解**        |      **作用**      |
| :------------- | :-----------: |
|   `@SpringBootConfiguration`   | 表示这是一个配置类，等同于 `@Configuration`  |
|   `@ComponentScan`   | 开启组件扫描，默认扫描主类所在包及其子包  |
|   `@EnableAutoConfiguration`   | 开启自动装配，这是关键！  |

## 三、@EnableAutoConfiguration核心解析 ##

@EnableAutoConfiguration是自动装配的核心注解：

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage
@Import(AutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration {
    String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";
    Class<?>[] exclude() default {};
    String[] excludeName() default {};
}
```

这里有两个关键注解：

### @AutoConfigurationPackage ###

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@Import(AutoConfigurationPackages.Registrar.class)
public @interface AutoConfigurationPackage {
}
```

它的作用是将主配置类所在包及其子包下的所有组件注册到Spring容器中。

### @Import(AutoConfigurationImportSelector.class) ###

这是自动装配的核心！AutoConfigurationImportSelector实现了 DeferredImportSelector接口，负责导入自动配置类。

## 四、AutoConfigurationImportSelector工作原理 ##

查看 AutoConfigurationImportSelector的核心方法：

```java
public class AutoConfigurationImportSelector implements DeferredImportSelector,
        BeanClassLoaderAware, ResourceLoaderAware, BeanFactoryAware, EnvironmentAware, Ordered {
    @Override
    public String[] selectImports(AnnotationMetadata annotationMetadata) {
        if (!isEnabled(annotationMetadata)) {
            return NO_IMPORTS;
        }
        AutoConfigurationEntry autoConfigurationEntry = 
            getAutoConfigurationEntry(annotationMetadata);
        return StringUtils.toStringArray(
            autoConfigurationEntry.getConfigurations());
    }
    protected AutoConfigurationEntry getAutoConfigurationEntry(AnnotationMetadata annotationMetadata) {
        if (!isEnabled(annotationMetadata)) {
            return EMPTY_ENTRY;
        }
        AnnotationAttributes attributes = getAttributes(annotationMetadata);
        List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes);
        configurations = removeDuplicates(configurations);
        Set<String> exclusions = getExclusions(annotationMetadata, attributes);
        checkExcludedClasses(configurations, exclusions);
        configurations.removeAll(exclusions);
        configurations = getConfigurationClassFilter().filter(configurations);
        fireAutoConfigurationImportEvents(configurations, exclusions);
        return new AutoConfigurationEntry(configurations, exclusions);
    }
}
```

核心流程解析：

- getCandidateConfigurations() - 获取候选配置类
- removeDuplicates() - 去重
- getExclusions() - 获取需要排除的配置
- filter() - 根据条件过滤

## 五、自动配置的加载机制 ##

### 传统方式：spring.factories（已废弃） ###

在Spring Boot 2.7之前，自动配置类通过 `META-INF/spring.factories` 文件加载：

```java
protected List<String> getCandidateConfigurations(AnnotationMetadata metadata, 
        AnnotationAttributes attributes) {
    List<String> configurations = SpringFactoriesLoader.loadFactoryNames(
        getSpringFactoriesLoaderFactoryClass(), getBeanClassLoader());
    Assert.notEmpty(configurations, "No auto configuration classes found...");
    return configurations;
}
```

SpringFactoriesLoader会扫描所有jar包下的 `META-INF/spring.factories` 文件：

```ini
# spring-boot-autoconfigure-xxx.jar中的spring.factories（旧方式）
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,\
org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration,\
# ... 更多自动配置类
```

> ⚠️  注意 ：从Spring Boot 2.7开始，`spring.factories`用于自动配置的方式已被标记为废弃，Spring Boot 3.0正式移除了该支持。

### 新方式：AutoConfiguration.imports（推荐） ###

Spring Boot 2.7+ 引入了新的自动配置加载机制，使用 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`文件：

```shell
# 文件路径：META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
# 每行一个全限定类名
org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration
org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration
org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration
```

### 新旧方式对比 ###

| **特性**        |      **spring.factories（旧）**      |   **AutoConfiguration.imports（新）**      |
| :------------- | :-----------: | :-----------: |
|   引入版本   | Spring Boot 1.x  | Spring Boot 2.7  |
|   废弃版本   | Spring Boot 2.7  | -  |
|   移除版本   | Spring Boot 3.0  | -  |
|   文件格式   | Properties键值对  | 每行一个类名  |
|   加载方式   | SpringFactoriesLoader  | ImportCandidates  |
|   性能   | 相对较慢  | 更快（直接读取）  |
|   用途   | 通用SPI机制  | 专用于自动配置  |

### 新方式源码解析 ###

在Spring Boot 2.7+中，AutoConfigurationImportSelector使用 ImportCandidates加载配置：

```java
protected List<String> getCandidateConfigurations(AnnotationMetadata metadata, 
        AnnotationAttributes attributes) {
    List<String> configurations = new ArrayList<>(
        SpringFactoriesLoader.loadFactoryNames(getSpringFactoriesLoaderFactoryClass(), 
            getBeanClassLoader()));
    ImportCandidates.load(AutoConfiguration.class, getBeanClassLoader())
        .forEach(configurations::add);
    Assert.notEmpty(configurations, "No auto configuration classes found...");
    return configurations;
}
```

`ImportCandidates.load()` 方法会读取 `META-INF/spring/` 目录下的 `.imports` 文件：

```java
public static ImportCandidates load(Class<?> annotation, ClassLoader classLoader) {
    Assert.notNull(annotation, "'annotation' must not be null");
    ClassLoader classLoaderToUse = (classLoader != null) ? classLoader : 
        ClassUtils.getDefaultClassLoader();
    String location = String.format("META-INF/spring/%s.imports", annotation.getName());
    Enumeration<URL> urls = loadResources(classLoaderToUse, location);
    // ... 读取并解析文件
}
```

### 版本兼容性建议 ###

| **Spring Boot版本**        |      **建议**      |
| :------------- | :-----------: |
|   2.7之前   | 使用 spring.factories  |
|   2.7.x   | 两种方式都支持，建议迁移到新方式  |
|   3.0+   | 必须使用 AutoConfiguration.imports  |

> 💡  最佳实践 ：如果是新项目或维护Spring Boot 2.7+的项目，建议直接使用新的 `.imports` 文件方式。对于需要兼容旧版本的开源库，可以同时提供两种配置文件。

## 六、条件注解@Conditional ##

并非所有自动配置类都会生效，Spring Boot通过条件注解来控制：

### 常用条件注解 ###

| **注解**        |      **生效条件**      |
| :------------- | :-----------: |
|   `@ConditionalOnClass`   | classpath中存在指定的类  |
|   `@ConditionalOnMissingClass`   | classpath中不存在指定的类  |
|   `@ConditionalOnBean`   | 容器中存在指定的Bean  |
|   `@ConditionalOnMissingBean`   | 容器中不存在指定的Bean  |
|   `@ConditionalOnProperty`   | 配置属性满足指定条件  |
|   `@ConditionalOnWebApplication`   | 是Web应用  |
|   `@ConditionalOnExpression`   | SpEL表达式为true  |

### 实际案例：DataSourceAutoConfiguration ###

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnClass({ DataSource.class, EmbeddedDatabaseType.class })
@ConditionalOnMissingBean(type = "io.r2dbc.spi.ConnectionFactory")
@EnableConfigurationProperties(DataSourceProperties.class)
@Import({ DataSourcePoolMetadataProvidersConfiguration.class,
        DataSourceInitializationConfiguration.class })
public class DataSourceAutoConfiguration {
    @Configuration(proxyBeanMethods = false)
    @Conditional(EmbeddedDatabaseCondition.class)
    @ConditionalOnMissingBean({ DataSource.class, XADataSource.class })
    @Import(EmbeddedDataSourceConfiguration.class)
    protected static class EmbeddedDatabaseConfiguration {
    }
    @Configuration(proxyBeanMethods = false)
    @Conditional(PooledDataSourceCondition.class)
    @ConditionalOnMissingBean({ DataSource.class, XADataSource.class })
    @Import({ HikariConfiguration.class, Tomcat.class, Dbcp2.class,
            OracleUcp.class })
    protected static class PooledDataSourceConfiguration {
    }
}
```

解析：

- `@ConditionalOnClass({ DataSource.class, EmbeddedDatabaseType.class })`：只有当classpath中存在DataSource和EmbeddedDatabaseType类时才生效
- `@ConditionalOnMissingBean({ DataSource.class, XADataSource.class })`：当容器中没有DataSource Bean时才创建

## 七、自动装配完整流程图 ##

```txt
┌─────────────────────────────────────────────────────────────────┐
│                    Spring Boot 启动流程                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  @SpringBootApplication                                         │
│  ├── @SpringBootConfiguration                                  │
│  ├── @ComponentScan                                            │
│  └── @EnableAutoConfiguration                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  @Import(AutoConfigurationImportSelector.class)                │
│                                                                 │
│  AutoConfigurationImportSelector.selectImports()               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  加载自动配置类                                                 │
│                                                                 │
│  Spring Boot 2.7之前:                                          │
│  └── SpringFactoriesLoader.loadFactoryNames()                  │
│      └── 扫描 META-INF/spring.factories                        │
│                                                                 │
│  Spring Boot 2.7+:                                              │
│  └── ImportCandidates.load()                                   │
│      └── 扫描 META-INF/spring/xxx.imports                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  条件过滤 @ConditionalXxx                                       │
│                                                                 │
│  ├── @ConditionalOnClass                                       │
│  ├── @ConditionalOnBean                                        │
│  ├── @ConditionalOnProperty                                    │
│  └── ... 其他条件注解                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  将满足条件的自动配置类注册到 Spring 容器                       │
└─────────────────────────────────────────────────────────────────┘
```

## 八、手写一个自动装配示例 ##

### 创建自动配置类 ###

```java
package com.example.autoconfig;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
@ConditionalOnClass(HelloService.class)
@ConditionalOnProperty(prefix = "hello", name = "enabled", havingValue = "true", matchIfMissing = true)
public class HelloAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    public HelloService helloService() {
        return new HelloService();
    }
}
```

解析：

- `@ConditionalOnClass({ DataSource.class, EmbeddedDatabaseType.class })`：只有当classpath中存在DataSource和EmbeddedDatabaseType类时才生效
- `@ConditionalOnMissingBean({ DataSource.class, XADataSource.class })`：当容器中没有DataSource Bean时才创建

## 七、自动装配完整流程图 ##

```txt
┌─────────────────────────────────────────────────────────────────┐
│                    Spring Boot 启动流程                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  @SpringBootApplication                                         │
│  ├── @SpringBootConfiguration                                  │
│  ├── @ComponentScan                                            │
│  └── @EnableAutoConfiguration                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  @Import(AutoConfigurationImportSelector.class)                │
│                                                                 │
│  AutoConfigurationImportSelector.selectImports()               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  加载自动配置类                                                 │
│                                                                 │
│  Spring Boot 2.7之前:                                          │
│  └── SpringFactoriesLoader.loadFactoryNames()                  │
│      └── 扫描 META-INF/spring.factories                        │
│                                                                 │
│  Spring Boot 2.7+:                                              │
│  └── ImportCandidates.load()                                   │
│      └── 扫描 META-INF/spring/xxx.imports                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  条件过滤 @ConditionalXxx                                       │
│                                                                 │
│  ├── @ConditionalOnClass                                       │
│  ├── @ConditionalOnBean                                        │
│  ├── @ConditionalOnProperty                                    │
│  └── ... 其他条件注解                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  将满足条件的自动配置类注册到 Spring 容器                       │
└─────────────────────────────────────────────────────────────────┘
```

## 八、手写一个自动装配示例 ##

### 创建自动配置类 ###

```java
package com.example.autoconfig;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
@ConditionalOnClass(HelloService.class)
@ConditionalOnProperty(prefix = "hello", name = "enabled", havingValue = "true", matchIfMissing = true)
public class HelloAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public HelloService helloService() {
        return new HelloService();
    }
}
```

> 💡  注意 ：Spring Boot 2.7+引入了 @AutoConfiguration注解，用于标识自动配置类，替代传统的 @Configuration。

### 创建服务类 ###

```java
package com.example.autoconfig;

public class HelloService {
  
    public String sayHello(String name) {
        return "Hello, " + name + "!";
    }
}
```

### 注册自动配置类 ###

#### 方式一：使用.imports文件（推荐，Spring Boot 2.7+） ####

在 `resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 中添加：

```java
com.example.autoconfig.HelloAutoConfiguration
```

#### 方式二：使用spring.factories（兼容旧版本） ####

在 `resources/META-INF/spring.factories` 中添加：

```ini
org.springframework.boot.autoconfigure.EnableAutoConfiguration=com.example.autoconfig.HelloAutoConfiguration
```

#### 方式三：同时提供两种配置（兼容所有版本） ####

```txt
resources/
├── META-INF/
│   ├── spring.factories                    # 兼容 Spring Boot 2.7 之前
│   └── spring/
│       └── org.springframework.boot.autoconfigure.AutoConfiguration.imports  # Spring Boot 2.7+
```

### 使用示例 ###

在其他项目中引入该依赖后，可以直接使用：

```java
@RestController
public class HelloController {
    @Autowired
    private HelloService helloService;
    @GetMapping("/hello")
    public String hello() {
        return helloService.sayHello("World");
    }
}
```

## 九、如何查看自动配置报告 ##

在 `application.properties` 中添加：

```ini
debug=true
```

启动应用后，控制台会输出自动配置报告：

```txt
============================
CONDITIONS EVALUATION REPORT
============================

Positive matches:
-----------------
   DataSourceAutoConfiguration matched:
      - @ConditionalOnClass found required classes 'javax.sql.DataSource', 'org.springframework.jdbc.datasource.EmbeddedDatabaseType' (OnClassCondition)

Negative matches:
-----------------
   ActiveMQAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'javax.jms.ConnectionFactory' (OnClassCondition)
```

## 十、总结 ##

Spring Boot自动装配的核心原理可以概括为：

- @EnableAutoConfiguration 开启自动装配功能
- AutoConfigurationImportSelector 导入自动配置类
- 加载配置类 ：

  - Spring Boot 2.7之前：SpringFactoriesLoader从 spring.factories加载
  - Spring Boot 2.7+：ImportCandidates从 .imports文件加载

- @Conditional条件注解 根据条件决定配置是否生效

这种设计模式体现了Spring Boot的核心思想： 约定优于配置 ，让开发者能够快速搭建应用，同时也保留了灵活配置的能力。
