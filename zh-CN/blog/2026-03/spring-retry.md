---
lastUpdated: true
commentabled: true
recommended: true
title: 试试Spring官方重试框架Spring-Retry
description: 接口调用总失败？
date: 2026-03-18 11:35:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 引言 ##

在现代分布式系统和微服务架构中，服务间的网络调用变得无比频繁。然而，网络是不可靠的，它可能因为瞬时故障（如网络抖动、服务短暂过载、资源临时不可用等）导致调用失败。简单地一失败就放弃，会严重降低系统的健壮性和用户体验尤其调用第三方接口时表现最明显。

因此，重试机制成为了构建 resilient（弹性）系统不可或缺的一环。Spring Retry 作为 Spring 生态系统中的一员，提供了一种声明式、注解驱动的高效重试解决方案，能让你的代码在应对短暂故障时变得更加健壮和优雅。

## 简介 ##

Spring Retry 的核心思想是 AOP（面向切面编程）。它通过代理（Proxy）机制，在目标方法的外部包裹一层重试逻辑。

当你调用一个被 `@Retryable` 注解的方法时，实际上是在调用一个由 Spring 生成的代理对象，这个代理对象负责在方法执行失败时，根据你配置的策略进行重试。

## 最佳实践 ##

因为Spring Retry的核心思想是AOP，所以声明式重试需要依赖AOP。

### Maven依赖 ###

Spring Boot项目依赖：

```xml
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

如果是传统的Spring项目，则需要如下依赖：

```xml
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
    <version>2.0.5</version> <!-- 请使用最新版本 -->
</dependency>
<!-- Spring AOP 依赖 (Spring Boot项目一般已包含) -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aop</artifactId>
</dependency>
<!-- 如果你使用@Recover，还需要AspectJ的依赖 -->
<dependency>
    <groupId>org.aspectj</groupId>
    <artifactId>aspectjweaver</artifactId>
</dependency>
```

### 启用重试功能 ###

> @EnableRetry

在项目的配置类或者主启动类上添加 `@EnableRetry` 注解，以启用 Spring Retry 的自动代理功能。

```java
@SpringBootApplication
@EnableRetry
public class RetryApplication {

    public static void main(String[] args) {
        SpringApplication.run(RetryApplication.class, args);
    }
}
```

### 方法添加@Retryable ###

@Retryable是最核心的注解，用于标注哪些方法在发生异常时需要重试。

基本参数说明：

- value / include: 指定需要重试的异常类型数组。默认为空（重试所有异常）。
- maxAttempts: 最大重试次数（包括第一次调用）。例如设置为 3，意味着最多会调用 3 次方法（1次初始调用 + 2次重试）。
- backoff: 设置重试退避策略，通常与 @Backoff 注解联用。
- recover: 服务降级的方法。

### 案例代码 ###

我们通过传递参数status来控制异常，重试参数：

- `retryFor = RuntimeException.class`：只针对RuntimeException重试。
- `maxAttempts = 4`：包含第一次请求总共请求4次
- `delay = 1000`：延迟1s重试
- `multiplier = 2.0`：延迟时间的乘数（用于指数退避），步长，延迟序列为：1s, 2s, 4s...

```java
@Service
public class RetryServiceImpl implements RetryService{

    @Override
    @Retryable(retryFor = RuntimeException.class,
                maxAttempts = 4,
                backoff = @Backoff(delay = 1000,
                        multiplier = 2.0
                )
    )
    public String invokeMethod(Integer status) {
        System.out.println("invokeMethod 调用时间："
                + LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-dd-MM HH:mm:ss")));
        // 模拟异常
        if (status != null) {
            throw new RuntimeException("服务中断了......");
        }
        return "SUCCESS";
    }
}
```


### 服务降级 ###

如果重试完成之后还是响应失败，那么就可以服务降级，返回指定的数据。

这是需要一个注解 `@Recover` 来指定降级的方法。

这里的方法名可以随意取，默认会被 `@Retryable` 识别，也可以通过 `recover` 参数指定方法。

`@Recover` 方法不被执行的原因：

- 未加 `@Recover`注解

- `recover` 参数指定错误

- `@Recover` 修改的方法参数必须是 `retryFor` 的异常以及原方法的参数。

如：

```java
@Retryable(retryFor = RuntimeException.class)
public String test(Integer status) {
    // ...  
}

@Recover
public String testRecover(RuntimeException e, Integer status) {
  	// ...
}
```

## 编程式重试 ##

编程式重试的核心是RetryTemplate，使用更加灵活，不受AOP限制。

```java
@Test
void test() throws Throwable {
    RetryTemplate retryTemplate = RetryTemplate.builder()
            .maxAttempts(4)
            .exponentialBackoff(1000, 2, 10000)
            .retryOn(RuntimeException.class)
            .build();


    String execute = retryTemplate.execute(
            (RetryCallback<String, Throwable>) context -> {
        RetryService retryService = new RetryServiceImpl();
        return retryService.invokeMethod(1);
    }, context -> "服务降级了！");

    System.out.println(execute);
}
```

## 小结 ##

Spring Retry 提供了 声明式 和 编程式 两种风格来满足不同场景的需求：

- 无脑上注解：对于大多数通用的重试场景，使用 `@Retryable` + `@Backoff` + `@Recover` 是最高效、最清晰的选择。
- 动手写代码：当你需要极致灵活和动态控制时，RetryTemplate 配合各种 RetryPolicy 和 BackOffPolicy 是你的不二之选。
