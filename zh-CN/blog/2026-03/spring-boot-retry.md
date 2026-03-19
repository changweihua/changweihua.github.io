---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot中的4种重试机制实现方案
description: SpringBoot中的4种重试机制实现方案
date: 2026-03-19 12:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在分布式系统和微服务架构中，服务调用失败是不可避免的现象。网络不稳定、服务过载、临时故障等因素都可能导致调用失败。重试机制作为一种处理临时性故障的解决方案，能够有效提高系统的可用性。

## 一、Spring Retry ##

### 基本原理 ###

Spring Retry是Spring官方提供的重试框架，作为Spring生态系统的一部分，它通过AOP（面向切面编程）实现了对方法调用的重试能力。当方法调用失败时，Spring Retry会根据配置的策略自动重新执行该方法，直到成功或达到最大重试次数。

Spring Retry的核心组件包括：

- RetryOperations：定义重试操作的接口
- RetryTemplate：RetryOperations的默认实现
- RetryPolicy：定义何时进行重试（如最大次数、重试的异常类型等）
- BackOffPolicy：定义重试间隔策略（如固定间隔、指数退避等）
- RecoveryCallback：定义最终失败后的恢复策略

### 集成配置 ###

在SpringBoot项目中集成Spring Retry：

```xml
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aspects</artifactId>
</dependency>
```

然后在启动类上启用重试功能：

```java
@SpringBootApplication
@EnableRetry
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 使用方法 ###

Spring Retry提供了注解方式和编程方式两种使用方法。

#### 注解方式 ####

```java
@Service
public class RemoteServiceClient {
    
    private static final Logger logger = LoggerFactory.getLogger(RemoteServiceClient.class);
    
    @Retryable(value = {ServiceException.class}, 
               maxAttempts = 3, 
               backoff = @Backoff(delay = 1000, multiplier = 2))
    public String callRemoteService(String param) {
        logger.info("调用远程服务，参数: {}", param);
        // 模拟调用失败
        if (Math.random() > 0.7) {
            logger.error("服务调用失败");
            throw new ServiceException("远程服务暂时不可用");
        }
        return "调用成功: " + param;
    }
    
    @Recover
    public String recover(ServiceException e, String param) {
        logger.warn("重试失败，执行恢复方法, 参数: {}", param);
        return "降级响应: " + param;
    }
}
```

在上面的例子中：

- @Retryable 注解定义了需要重试的方法，包括触发重试的异常类型、最大重试次数和退避策略
- backoff 属性设置初始延迟1秒，且每次延迟时间翻倍（指数退避）
- @Recover 注解定义了重试失败后的恢复方法

#### 编程方式 ####

```java
@Service
public class RemoteServiceClient {
    
    private final RetryTemplate retryTemplate;
    
    @Autowired
    public RemoteServiceClient(RetryTemplate retryTemplate) {
        this.retryTemplate = retryTemplate;
    }
    
    public String callWithRetry(String param) {
        return retryTemplate.execute(context -> {
            // 重试的业务逻辑
            if (Math.random() > 0.7) {
                throw new ServiceException("服务暂时不可用");
            }
            return "调用成功: " + param;
        }, context -> {
            // 重试失败后的恢复逻辑
            return "降级响应: " + param;
        });
    }
    
    @Bean
    public RetryTemplate retryTemplate() {
        RetryTemplate template = new RetryTemplate();
        
        // 设置重试策略
        SimpleRetryPolicy policy = new SimpleRetryPolicy();
        policy.setMaxAttempts(3);
        
        // 设置退避策略
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(1000);
        backOffPolicy.setMultiplier(2.0);
        
        template.setRetryPolicy(policy);
        template.setBackOffPolicy(backOffPolicy);
        
        return template;
    }
}
```

### 优缺点 ###

#### 优点 ####

- 与Spring生态系统完美集成
- 提供了丰富的重试策略和配置选项
- 支持注解和编程两种方式，使用灵活
- 可以精确控制重试的异常类型
- 支持声明式事务回滚和提交

#### 缺点 ####

- 依赖Spring框架
- 代码侵入性相对较强
- 在复杂场景下配置略显复杂
- 与其他容错机制集成需要额外工作

### 适用场景 ###

- Spring生态系统的项目
- 需要精细控制重试条件和策略的场景
- 与Spring事务结合的业务场景
- 方法级别的重试需求

## 二、Resilience4j Retry ##

### 基本原理 ###

Resilience4j是受Netflix Hystrix启发而创建的轻量级容错库，其中Resilience4j Retry模块提供了强大的重试功能。与Spring Retry不同，Resilience4j采用函数式编程风格，使用装饰器模式实现重试功能。

Resilience4j Retry的特点：

- 基于函数式接口
- 无外部依赖，轻量级设计
- 可与其他容错机制（如断路器、限流器）无缝集成
- 提供丰富的监控指标

### 集成配置 ###

在SpringBoot项目中集成Resilience4j Retry：

```xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot2</artifactId>
    <version>1.7.0</version>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

配置application.yml：

```yaml
resilience4j.retry:
  instances:
    backendService:
      maxAttempts: 3
      waitDuration: 1s
      enableExponentialBackoff: true
      exponentialBackoffMultiplier: 2
      retryExceptions:
        - java.io.IOException
        - java.util.concurrent.TimeoutException
```

### 使用方法 ###

Resilience4j同样支持注解方式和编程方式。

#### 注解方式 ####

```java
@Service
public class BackendService {
    
    private static final Logger logger = LoggerFactory.getLogger(BackendService.class);
    
    @Retry(name = "backendService", fallbackMethod = "fallbackCall")
    public String callBackendService(String param) {
        logger.info("调用后端服务，参数: {}", param);
        
        if (Math.random() > 0.7) {
            logger.error("服务调用失败");
            throw new IOException("服务连接失败");
        }
        
        return "后端服务响应: " + param;
    }
    
    public String fallbackCall(String param, Exception ex) {
        logger.warn("所有重试失败，执行降级方法，参数: {}", param);
        return "降级响应: " + param;
    }
}
```

#### 编程方式 ####

```java
@Service
public class BackendService {
    
    private final RetryRegistry retryRegistry;
    private final Logger logger = LoggerFactory.getLogger(BackendService.class);
    
    @Autowired
    public BackendService(RetryRegistry retryRegistry) {
        this.retryRegistry = retryRegistry;
    }
    
    public String executeWithRetry(String param) {
        // 获取已配置的重试实例
        Retry retry = retryRegistry.retry("backendService");
        
        // 创建一个可重试的函数
        CheckedFunction0<String> retryableFunction = Retry.decorateCheckedSupplier(
            retry, () -> callBackendService(param));
        
        try {
            // 执行重试函数
            return retryableFunction.apply();
        } catch (Throwable throwable) {
            logger.error("重试失败: {}", throwable.getMessage());
            return "降级响应: " + param;
        }
    }
    
    private String callBackendService(String param) throws IOException {
        logger.info("调用后端服务，参数: {}", param);
        
        if (Math.random() > 0.7) {
            throw new IOException("服务连接失败");
        }
        
        return "后端服务响应: " + param;
    }
}
```

### 优缺点 ###

#### 优点 ####

- 轻量级设计，无外部依赖
- 函数式编程风格，代码简洁
- 提供丰富的监控和统计指标
- 可与断路器、限流器等容错机制无缝集成
- 支持多种高级重试策略

#### 缺点 ####

- 学习曲线相对陡峭，尤其是函数式概念
- 对于不熟悉函数式编程的开发者可能不够直观
- 某些高级功能需要额外配置

### 适用场景 ###

- 需要与其他容错机制结合的复杂场景
- 微服务架构中的服务间调用
- 需要详细监控指标的系统

## 三、Guava Retrying ##

### 基本原理 ###

Guava Retrying是Google Guava库提供的重试机制，它提供了一个简单灵活的API来实现重试功能。

Guava Retrying通过构建器模式提供了灵活的重试配置，可以自定义重试条件、停止策略、等待策略等。

### 集成配置 ###

在SpringBoot项目中集成Guava Retrying：

```xml
<dependency>
    <groupId>com.github.rholder</groupId>
    <artifactId>guava-retrying</artifactId>
    <version>2.0.0</version>
</dependency>
```

### 使用方法 ###

Guava Retrying主要采用编程方式使用：

```java
@Service
public class ExternalServiceClient {
    
    private static final Logger logger = LoggerFactory.getLogger(ExternalServiceClient.class);
    
    public String callExternalService(String param) {
        Retryer<String> retryer = RetryerBuilder.<String>newBuilder()
            .retryIfException() // 发生任何异常时重试
            .retryIfResult(result -> result == null) // 结果为null时重试
            .withWaitStrategy(WaitStrategies.exponentialWait(1000, 10000, TimeUnit.MILLISECONDS)) // 指数退避
            .withStopStrategy(StopStrategies.stopAfterAttempt(3)) // 最多重试3次
            .withRetryListener(new RetryListener() {
                @Override
                public <V> void onRetry(Attempt<V> attempt) {
                    logger.info("第{}次重试", attempt.getAttemptNumber());
                    if (attempt.hasException()) {
                        logger.error("异常: {}", attempt.getExceptionCause().getMessage());
                    }
                }
            })
            .build();
        
        try {
            return retryer.call(() -> {
                logger.info("调用外部服务，参数: {}", param);
                
                // 模拟服务调用
                if (Math.random() > 0.7) {
                    throw new RuntimeException("服务暂时不可用");
                }
                
                return "外部服务响应: " + param;
            });
        } catch (RetryException | ExecutionException e) {
            logger.error("重试失败: {}", e.getMessage());
            return "降级响应: " + param;
        }
    }
}
```

在SpringBoot中创建可复用的Retryer bean：

```java
@Configuration
public class RetryConfig {
    
    @Bean
    public <T> Retryer<T> defaultRetryer() {
        return RetryerBuilder.<T>newBuilder()
            .retryIfException()
            .retryIfResult(Predicates.isNull())
            .withWaitStrategy(WaitStrategies.exponentialWait(100, 1000, TimeUnit.MILLISECONDS))
            .withStopStrategy(StopStrategies.stopAfterAttempt(3))
            .build();
    }
}

@Service
public class ServiceWithRetry {
    
    private final Retryer<String> retryer;
    
    @Autowired
    public ServiceWithRetry(Retryer<String> retryer) {
        this.retryer = retryer;
    }
    
    public String executeWithRetry(String input) throws ExecutionException, RetryException {
        return retryer.call(() -> {
            // 业务逻辑
            return processInput(input);
        });
    }
}
```

### 高级特性 ###

Guava Retrying提供了丰富的定制选项：

```java
Retryer<String> complexRetryer = RetryerBuilder.<String>newBuilder()
    // 定制重试条件
    .retryIfExceptionOfType(IOException.class)
    .retryIfException(e -> e instanceof TimeoutException)
    .retryIfResult(result -> result != null && result.contains("error"))
    
    // 定制等待策略
    .withWaitStrategy(WaitStrategies.join(
        WaitStrategies.fixedWait(1000, TimeUnit.MILLISECONDS),
        WaitStrategies.randomWait(1000, TimeUnit.MILLISECONDS, 2000, TimeUnit.MILLISECONDS)
    ))
    
    // 定制停止策略
    .withStopStrategy(StopStrategies.stopAfterDelay(30, TimeUnit.SECONDS))
    
    // 定制阻塞策略
    .withBlockStrategy(BlockStrategies.threadSleepStrategy())
    
    .build();
```

### 优缺点 ###

#### 优点 ####

- API简单直观，容易上手
- 高度可定制的重试条件、等待策略和停止策略
- 不依赖Spring框架，可在任何Java项目中使用

#### 缺点 ####

- 没有注解支持，只能通过编程方式使用
- 缺乏与Spring生态系统的深度集成
- 没有内置的监控和统计功能
- 已停止更新

### 适用场景 ###

- 简单的重试需求
- 非Spring项目或对Spring依赖较少的项目
- 需要高度自定义重试逻辑的场景

## 四、Failsafe ##

### 基本原理 ###

failsafe是一个相对较新的Java重试库，专注于高性能和低延迟场景。它的设计目标是提供一个简单、高效的重试机制，同时保持API的简洁性和使用的便捷性。failsafe支持同步和异步重试，具有灵活的重试策略和最小的依赖。

### 集成配置 ###

在SpringBoot项目中集成failsafe

```xml
<dependency>
    <groupId>dev.failsafe</groupId>
    <artifactId>failsafe</artifactId>
    <version>3.3.2</version>
</dependency>
```

failsafe通常通过`dev.failsafe:failsafe`库来使用，这是一个现代化的重试和容错库。

### 使用方法 ###

failsafe主要采用编程方式使用，具有流式API设计

```java
@Service
public class FailsafeService {
    
    private static final Logger logger = LoggerFactory.getLogger(FailsafeService.class);
    
    public String executeWithRetry(String param) {
        return Failsafe.with(
            // 配置重试策略
            RetryPolicy.<String>builder()
                .handle(IOException.class, TimeoutException.class)
                .withMaxRetries(3)
                .withDelay(Duration.ofSeconds(1))
                .withMaxDuration(Duration.ofSeconds(10))
                .withBackoff(Duration.ofMillis(100), Duration.ofSeconds(2))
                .onRetry(event -> logger.info("第{}次重试，上次异常: {}", 
                                         event.getAttemptCount(), 
                                         event.getLastException().getMessage()))
                .onFailure(event -> logger.error("重试失败，尝试次数: {}, 总耗时: {}ms", 
                                            event.getAttemptCount(),
                                            event.getElapsedTime().toMillis()))
                .build()
        )
        .get(() -> {
            logger.info("执行操作，参数: {}", param);
            
            // 模拟操作
            if (Math.random() > 0.7) {
                throw new IOException("操作暂时失败");
            }
            
            return "操作成功: " + param;
        });
    }
    
    // 异步重试示例
    public CompletableFuture<String> executeWithRetryAsync(String param) {
        return Failsafe.with(
            RetryPolicy.<String>builder()
                .handle(IOException.class)
                .withMaxRetries(3)
                .withBackoff(Duration.ofMillis(100), Duration.ofSeconds(1))
                .build()
        )
        .getAsync(() -> {
            logger.info("异步执行操作，参数: {}", param);
            
            // 模拟异步操作
            if (Math.random() > 0.7) {
                throw new IOException("异步操作暂时失败");
            }
            
            return "异步操作成功: " + param;
        });
    }
    
    // 带降级的重试示例
    public String executeWithFallback(String param) {
        return Failsafe.with(
            RetryPolicy.<String>builder()
                .handle(IOException.class)
                .withMaxRetries(3)
                .build(),
            // 降级策略
            Fallback.of(e -> "降级响应: " + param)
        )
        .get(() -> {
            // 业务逻辑
            if (Math.random() > 0.7) {
                throw new IOException("操作失败");
            }
            return "操作成功: " + param;
        });
    }
}
```

在SpringBoot中创建可复用的RetryPolicy bean

```java
@Configuration
public class FailsafeConfig {
    
    @Bean
    public RetryPolicy<Object> defaultRetryPolicy() {
        return RetryPolicy.builder()
            .handle(Exception.class)
            .withMaxRetries(3)
            .withBackoff(Duration.ofMillis(100), Duration.ofSeconds(1), 2.0)
            .build();
    }
    
    @Bean
    public Fallback<Object> defaultFallback() {
        return Fallback.of(e -> {
            if (e instanceof ServiceException) {
                return "服务异常降级";
            }
            return "通用降级响应";
        });
    }
}

@Service
public class ServiceWithFailsafeRetry {
    
    private final RetryPolicy<Object> defaultRetryPolicy;
    private final Fallback<Object> defaultFallback;
    
    @Autowired
    public ServiceWithFailsafeRetry(RetryPolicy<Object> defaultRetryPolicy, 
                               Fallback<Object> defaultFallback) {
        this.defaultRetryPolicy = defaultRetryPolicy;
        this.defaultFallback = defaultFallback;
    }
    
    public String executeWithRetry(String input) {
        return Failsafe.with(defaultRetryPolicy, defaultFallback)
            .get(() -> {
                // 业务逻辑
                return processInput(input);
            });
    }
}
```

### 优缺点 ###

#### 优点 ####

- 极高的性能，适合高频调用场景
- 支持同步和异步重试
- 轻量级，依赖少
- 与CompletableFuture良好集成
- 内置丰富的监听器机制

#### 缺点 ####

没有注解支持，只能通过编程方式使用
与Spring框架集成度不高
近几年更新也不活跃

### 适用场景 ###

- 高性能、低延迟要求的应用
- 需要异步重试能力的场景
- 需要细粒度控制重试行为的场景

## 五、四种重试机制的对比 ##

|  特性   |    Spring Retry  |   Resilience4j Retry  |  Guava Retrying  |  Failsafe  |
| :-----------: | :-----------: | :-----------: | :-----------: | :-----------: |
| 编程模型 |   AOP + 命令式  |  函数式  |  命令式  |  流式  |
| 注解支持 |   支持  |  支持  |  不支持  |  不支持  |
| 依赖 |   Spring  |  无外部依赖  |  Guava  |  最小依赖  |
| 性能开销 |   中等  |  低  |  中等  |  极低  |
| 异步支持 |   有限  |  良好  |  有限  |  优秀  |
| 监控集成 |   有限  |  丰富  |  无  |  基本  |
| 配置方式 |   注解/编程  |  配置文件/注解/编程  |  编程  |  编程  |
| 与其他容错机制集成 |   有限  |  原生支持  |  无  |  良好  |
| 学习曲线 |   高  |  高  |  高  |  高  |
| 适用场景 |   Spring项目  |  微服务/云原生应用  |  简单场景/非Spring项目  |  高性能场景  |

## 六、最佳实践与注意事项 ##

### 通用最佳实践 ###

- 确保幂等性：重试机制最适合用于幂等操作，即多次执行产生相同结果的操作。对于非幂等操作，需要特别小心。
- 设置合理的超时和重试次数：避免无限重试或重试时间过长，通常3-5次足够处理大多数临时故障。
- 使用指数退避策略：随着重试次数增加，逐渐增加重试间隔，避免对目标服务造成过大压力。
- 区分临时故障和永久故障：只对可能自行恢复的临时故障进行重试，对于永久性错误不应重试。
- 添加监控和日志：记录重试次数、成功率等指标，便于问题排查和性能优化。

### 避免常见陷阱 ###

- 重试风暴：当多个客户端同时对一个故障服务进行重试时，可能导致服务负载激增。
- 资源泄漏：重试过程中要确保资源（如数据库连接、HTTP连接）正确释放。
- 过度重试：过度重试可能导致性能下降，应设置合理的最大重试次数和总超时时间。
- 重试成本：某些操作重试成本高昂（如涉及第三方付费API），需谨慎设计重试策略。

## 七、总结 ##

选择合适的重试机制应基于项目的技术栈、复杂度和需求。无论选择哪种机制，都应遵循重试的最佳实践，避免常见陷阱，确保系统的稳定性和可靠性。
