---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Retry框架实战指南
description: 优雅处理分布式系统中的瞬时故障
date: 2026-04-09 13:00:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在分布式系统中，网络抖动、服务临时不可用、数据库连接超时等瞬时故障屡见不鲜。为了保证系统可靠性，我们通常需要为这些故障操作添加重试机制。但手动编写重试逻辑不仅繁琐，还容易出现代码冗余、重试策略不统一等问题。而Spring Retry框架恰好解决了这些痛点——它提供了简洁的注解和灵活的API，让我们能以极低的侵入性实现优雅的重试功能。今天，我们就从核心概念、快速上手、高级特性到落地实践，全面掌握Spring Retry的使用。

## 一、为什么选择Spring Retry？手动重试的痛点与框架优势 ##

在没有框架支持时，我们通常会通过`try-catch`+`循环`的方式手动实现重试，比如这样：

```java
public Result callThirdPartyApi() {
    int retryCount = 3;
    while (retryCount > 0) {
        try {
            // 调用第三方接口
            return thirdPartyService.doSomething();
        } catch (NetworkException e) {
            // 捕获瞬时故障异常
            retryCount--;
            if (retryCount == 0) {
                throw new RuntimeException("重试3次失败", e);
            }
            // 固定间隔重试
            try {
                Thread.sleep(1000);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
            }
        }
    }
    return Result.fail("调用失败");
}
```

这种手动实现的方式存在诸多问题：

- 代码冗余：每个需要重试的操作都要编写重复的循环、异常捕获逻辑；
- 策略僵化：重试次数、间隔、退避策略硬编码，修改时需改动业务代码；
- 侵入性强：重试逻辑与核心业务逻辑耦合，可读性差；
- 功能缺失：无法便捷实现熔断、恢复、自定义重试条件等高级特性。

而Spring Retry框架的出现，正是为了优雅解决这些问题，其核心优势如下：

- 低侵入性：通过注解（如`@Retryable`）快速实现重试，无需修改核心业务逻辑；
- 灵活的重试策略：支持固定间隔、指数退避、随机退避等多种重试策略，可灵活配置；
- 丰富的高级特性：支持熔断（Circuit Breaker）、恢复机制（Recover）、自定义重试条件；
- 良好的集成性：无缝集成Spring生态（Spring Boot、Spring Cloud、Spring Transaction）；
- 编程式与声明式兼顾：既支持注解式声明式使用，也支持编程式API调用，适配不同场景。

## 二、Spring Retry核心概念：理解重试的核心组件 ##

在使用Spring Retry前，需先理解其核心组件，这些组件共同构成了重试的完整逻辑：

- 重试触发条件（Retry Condition） ：定义哪些异常或返回结果需要触发重试。默认只对异常触发重试，可自定义对特定异常（如NetworkException）或特定返回值（如Result.isFail()）重试；

- 重试策略（Retry Policy） ：定义重试的终止条件，即“重试多少次后停止”。核心实现类包括：

  - SimpleRetryPolicy：固定最大重试次数（默认3次）；
  - TimeoutRetryPolicy：固定重试超时时间（如30秒内可无限重试）；
  - CompositeRetryPolicy：组合多个重试策略（如同时限制次数和超时）；
  - AlwaysRetryPolicy：无限重试（不推荐生产环境使用）。

- 退避策略（Backoff Policy） ：定义两次重试之间的间隔规则。核心实现类包括：

  - FixedBackOffPolicy：固定间隔（默认1秒）；
  - ExponentialBackOffPolicy：指数退避（间隔随重试次数指数增长，如1秒、2秒、4秒...）；
  - ExponentialRandomBackOffPolicy：指数退避+随机抖动（避免高并发下重试峰值）；
  - UniformRandomBackOffPolicy：随机间隔（如1~3秒内随机）。

- 熔断机制（Circuit Breaker） ：当重试失败次数达到阈值时，触发熔断，暂时停止重试，避免持续冲击故障服务。Spring Retry需结合Spring Cloud Circuit Breaker（如Resilience4j、Sentinel）实现；

- 恢复机制（Recovery） ：当重试完全失败后，执行的兜底逻辑（如返回默认值、触发告警）。

## 三、快速上手：Spring Retry基础使用（Spring Boot环境） ##

下面通过“调用第三方接口重试”的实际场景，演示Spring Retry的基础使用步骤，优先推荐注解式（声明式）使用方式。

### 环境准备：引入依赖 ###

Spring Boot项目中，直接引入spring-retry和spring-aspects依赖（Spring Retry基于AOP实现，需aspects支持）：

```xml
<!-- Spring Retry核心依赖 -->
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
    <version>2.0.3</version> <!-- 兼容Spring Boot 2.x/3.x -->
</dependency>

<!-- AOP依赖，Spring Retry基于AOP实现 -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aspects</artifactId>
</dependency>
```

### 开启重试：添加@EnableRetry注解 ###

在Spring Boot主类或配置类上添加 `@EnableRetry` 注解，开启重试功能：

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableRetry // 开启Spring Retry功能
public class RetryDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(RetryDemoApplication.class, args);
    }
}
```

### 声明式重试：使用 `@Retryable` 注解 ###

在需要重试的方法上添加 `@Retryable` 注解，配置重试策略、退避策略、触发条件等：

```java
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

@Service
public class ThirdPartyService {

    /**
     * 调用第三方接口，添加重试机制
     * @Retryable：声明该方法需要重试
     * value：仅对指定异常触发重试（这里是网络异常和超时异常）
     * maxAttempts：最大重试次数（包括首次调用，默认3次，这里设为4次：1次首次+3次重试）
     * backoff：退避策略（指数退避，初始间隔1秒，最大间隔10秒）
     */
    @Retryable(
        value = {NetworkException.class, TimeoutException.class},
        maxAttempts = 4,
        backoff = @Backoff(delay = 1000, multiplier = 2, maxDelay = 10000)
    )
    public Result doSomething(String param) {
        // 模拟调用第三方接口（核心业务逻辑）
        System.out.println("调用第三方接口，参数：" + param + "，时间：" + System.currentTimeMillis());
        // 模拟瞬时故障（随机抛出网络异常）
        if (Math.random() > 0.3) {
            throw new NetworkException("网络抖动，调用失败");
        }
        return Result.success("调用成功", "返回数据：" + param);
    }
}

// 自定义异常：网络异常
class NetworkException extends RuntimeException {
    public NetworkException(String message) {
        super(message);
    }
}

// 自定义异常：超时异常
class TimeoutException extends RuntimeException {
    public TimeoutException(String message) {
        super(message);
    }
}
```

`@Retryable` 核心属性说明：

- value：需要触发重试的异常类型数组（必选，默认对所有RuntimeException重试）；

- include：与value功能一致，优先级高于value；

- exclude：不需要触发重试的异常类型数组；

- maxAttempts：最大重试次数（默认3次，即1次首次调用+2次重试）；

- backoff：退避策略配置，@Backoff属性说明：

  - delay：初始间隔时间（单位：毫秒，默认1000毫秒）；
  - multiplier：指数退避乘数（如2表示每次间隔翻倍）；
  - maxDelay：最大间隔时间（避免间隔过大导致业务延迟，默认无限制）；
  - random：是否随机间隔（默认false，设为true则为随机退避）。

- recover：指定恢复方法名（当重试失败后执行的兜底方法）。

### 恢复机制：使用 `@Recover` 注解 ###

当重试达到最大次数仍失败时，通过 `@Recover` 注解声明兜底方法，执行恢复逻辑（如返回默认值、记录日志、触发告警）：

```java
import org.springframework.retry.annotation.Recover;
import org.springframework.stereotype.Service;

@Service
public class ThirdPartyService {
    // 省略@Retryable注解的doSomething方法...

    /**
     * 恢复方法：重试完全失败后执行
     * @Recover：声明该方法是恢复方法
     * 注意：
     * 1. 方法参数必须包含@Retryable方法的所有参数，最后添加一个重试触发的异常参数（必选）
     * 2. 方法返回值必须与@Retryable方法的返回值一致
     * 3. 恢复方法必须与@Retryable方法在同一个类中
     */
    @Recover
    public Result doSomethingRecover(NetworkException e, String param) {
        // 兜底逻辑：记录错误日志、触发告警、返回默认值
        System.out.println("重试完全失败，参数：" + param + "，异常：" + e.getMessage());
        // 触发告警（实际中可调用告警服务）
        // alarmService.sendAlarm("第三方接口调用失败，参数：" + param + "，异常：" + e.getMessage());
        return Result.success("服务暂时不稳定，已记录问题，返回默认数据", "默认数据：" + param);
    }

    // 可为不同异常定义不同的恢复方法（如超时异常的单独恢复逻辑）
    @Recover
    public Result doSomethingRecover(TimeoutException e, String param) {
        System.out.println("超时异常重试失败，参数：" + param + "，异常：" + e.getMessage());
        return Result.success("请求超时，返回默认数据", "默认数据：" + param);
    }
}
```

### 测试验证 ###

编写控制器或测试类，调用带重试的方法，验证重试逻辑：

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RetryDemoController {

    @Autowired
    private ThirdPartyService thirdPartyService;

    @GetMapping("/call")
    public Result callThirdParty(@RequestParam String param) {
        return thirdPartyService.doSomething(param);
    }
}
```

启动项目，访问 `http://localhost:8080/call?param=test`，观察控制台输出：

```txt
调用第三方接口，参数：test，时间：1699999999000
调用第三方接口，参数：test，时间：1699999999001（首次调用失败，1秒后重试）
调用第三方接口，参数：test，时间：1699999999002（第二次失败，2秒后重试）
调用第三方接口，参数：test，时间：1699999999004（第三次失败，4秒后重试）
重试完全失败，参数：test，异常：网络抖动，调用失败
```

从输出可以看出：重试逻辑已生效，每次失败后按指数退避策略等待间隔（1秒→2秒→4秒），达到最大重试次数（4次）后执行恢复方法。

## 四、高级特性：编程式重试与自定义策略 ##

除了注解式声明式使用，Spring Retry还支持编程式API调用，适合需要动态调整重试策略的场景。同时，也支持自定义重试策略和退避策略，满足复杂业务需求。

### 编程式重试：使用RetryTemplate ###

通过RetryTemplate手动构建重试模板，灵活配置重试策略、退避策略，适合动态调整参数的场景（如根据业务参数动态设置重试次数）：

```java
import org.springframework.retry.backoff.ExponentialBackOffPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Service;

@Service
public class ProgrammaticRetryService {

    // 编程式重试：使用RetryTemplate
    public Result doSomethingWithProgrammaticRetry(String param, int maxRetryTimes) {
        // 1. 构建重试策略（简单重试策略，最大重试次数由参数动态传入）
        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(maxRetryTimes); // 动态设置最大重试次数

        // 2. 构建退避策略（指数退避，初始间隔1秒，翻倍增长，最大间隔10秒）
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(1000); // 初始间隔1秒
        backOffPolicy.setMultiplier(2); // 乘数2
        backOffPolicy.setMaxInterval(10000); // 最大间隔10秒

        // 3. 构建RetryTemplate，配置重试策略和退避策略
        RetryTemplate retryTemplate = new RetryTemplate();
        retryTemplate.setRetryPolicy(retryPolicy);
        retryTemplate.setBackOffPolicy(backOffPolicy);

        // 4. 执行重试逻辑（通过execute方法，传入RetryCallback）
        return retryTemplate.execute(
            // RetryCallback：需要重试的核心业务逻辑
            retryContext -> {
                System.out.println("编程式重试：调用第三方接口，参数：" + param + "，重试次数：" + retryContext.getRetryCount());
                // 模拟瞬时故障
                if (Math.random() > 0.3) {
                    throw new NetworkException("网络抖动，调用失败");
                }
                return Result.success("编程式重试调用成功", "返回数据：" + param);
            },
            // RecoveryCallback：重试失败后的恢复逻辑（可选）
            retryContext -> {
                Exception exception = (Exception) retryContext.getLastThrowable();
                System.out.println("编程式重试失败，参数：" + param + "，异常：" + exception.getMessage());
                return Result.success("编程式重试失败，返回默认数据", "默认数据：" + param);
            }
        );
    }
}
```

测试编程式重试：

```java
@GetMapping("/call/programmatic")
public Result callProgrammatic(@RequestParam String param, @RequestParam(defaultValue = "4") int maxRetryTimes) {
    return programmaticRetryService.doSomethingWithProgrammaticRetry(param, maxRetryTimes);
}
```

编程式重试的优势是灵活性高，可动态调整重试策略参数；缺点是需要手动构建RetryTemplate，代码量比注解式多，适合参数动态变化的场景。

### 自定义重试策略 ###

当内置重试策略无法满足需求时（如根据业务状态动态决定是否重试），可通过实现RetryPolicy接口自定义重试策略：

```java
import org.springframework.retry.RetryContext;
import org.springframework.retry.RetryPolicy;

// 自定义重试策略：根据业务状态和重试次数决定是否重试
class CustomRetryPolicy implements RetryPolicy {

    // 最大重试次数
    private final int maxAttempts;

    public CustomRetryPolicy(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    // 初始化重试上下文（每次重试前调用）
    @Override
    public RetryContext open(RetryContext parent) {
        return new DefaultRetryContext(parent);
    }

    // 判断是否可以重试（核心方法）
    @Override
    public boolean canRetry(RetryContext context) {
        // 1. 获取重试次数
        int retryCount = context.getRetryCount();
        // 2. 获取上次失败的异常
        Throwable lastThrowable = context.getLastThrowable();
        // 3. 自定义重试条件：重试次数<最大次数，且异常是NetworkException，且业务状态允许重试
        if (retryCount < maxAttempts && lastThrowable instanceof NetworkException) {
            // 模拟业务状态校验（如查询服务健康状态）
            boolean serviceHealthy = checkServiceHealthy();
            return serviceHealthy;
        }
        return false;
    }

    // 注册重试失败（每次重试失败后调用）
    @Override
    public void registerThrowable(RetryContext context, Throwable throwable) {
        context.setAttribute("throwable", throwable);
    }

    // 关闭重试上下文
    @Override
    public void close(RetryContext context) {
    }

    // 模拟检查服务健康状态
    private boolean checkServiceHealthy() {
        // 实际中可调用服务健康检查接口
        return Math.random() > 0.2;
    }
}

// 使用自定义重试策略（编程式）
@Service
public class CustomRetryService {
    public Result doSomethingWithCustomPolicy(String param) {
        RetryTemplate retryTemplate = new RetryTemplate();
        // 设置自定义重试策略（最大重试次数4次）
        retryTemplate.setRetryPolicy(new CustomRetryPolicy(4));
        // 设置退避策略
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(1000);
        retryTemplate.setBackOffPolicy(backOffPolicy);

        return retryTemplate.execute(retryContext -> {
            System.out.println("自定义重试策略：调用第三方接口，参数：" + param + "，重试次数：" + retryContext.getRetryCount());
            if (Math.random() > 0.3) {
                throw new NetworkException("网络抖动，调用失败");
            }
            return Result.success("自定义重试策略调用成功", "返回数据：" + param);
        });
    }
}
```

### 自定义退避策略 ###

类似地，可通过实现BackOffPolicy接口自定义退避策略（如根据重试次数和异常类型动态调整间隔）：

```java
import org.springframework.retry.backoff.BackOffContext;
import org.springframework.retry.backoff.BackOffPolicy;

// 自定义退避策略：网络异常间隔翻倍，超时异常间隔固定3秒
class CustomBackOffPolicy implements BackOffPolicy {

    @Override
    public BackOffContext start(RetryContext context) {
        return new DefaultBackOffContext();
    }

    @Override
    public void backOff(BackOffContext context) throws InterruptedException {
        // 获取上次失败的异常
        Throwable lastThrowable = ((RetryContext) context).getLastThrowable();
        long delay;
        if (lastThrowable instanceof NetworkException) {
            // 网络异常：指数退避（1秒、2秒、4秒...）
            int retryCount = ((RetryContext) context).getRetryCount();
            delay = (long) (1000 * Math.pow(2, retryCount));
        } else if (lastThrowable instanceof TimeoutException) {
            // 超时异常：固定间隔3秒
            delay = 3000;
        } else {
            // 其他异常：默认间隔1秒
            delay = 1000;
        }
        System.out.println("自定义退避策略：等待" + delay + "毫秒后重试");
        Thread.sleep(delay);
    }
}

// 使用自定义退避策略
@Service
public class CustomBackOffService {
    public Result doSomethingWithCustomBackOff(String param) {
        RetryTemplate retryTemplate = new RetryTemplate();
        retryTemplate.setRetryPolicy(new SimpleRetryPolicy(4));
        // 设置自定义退避策略
        retryTemplate.setBackOffPolicy(new CustomBackOffPolicy());

        return retryTemplate.execute(retryContext -> {
            System.out.println("自定义退避策略：调用第三方接口，参数：" + param);
            // 随机抛出网络异常或超时异常
            if (Math.random() > 0.5) {
                throw new NetworkException("网络抖动");
            } else {
                throw new TimeoutException("请求超时");
            }
        });
    }
}
```

## 五、Spring Retry与其他组件的集成 ##

Spring Retry作为Spring生态的一部分，可无缝集成Spring Transaction、Spring Cloud等组件，提升系统的可靠性。

### 与Spring Transaction集成 ###

当重试方法包含事务时，需注意@Retryable与@Transactional的注解顺序：重试逻辑应在事务之外，避免重试时重复提交事务。正确的做法是：将重试方法和事务方法分离，重试方法调用事务方法：

```java
@Service
public class RetryWithTransactionService {

    @Autowired
    private TransactionalService transactionalService;

    // 重试方法（无事务，在事务之外）
    @Retryable(value = {RuntimeException.class}, maxAttempts = 3)
    public Result retryWithTransaction(String param) {
        // 调用事务方法
        return transactionalService.doTransactionalOperation(param);
    }

    // 恢复方法
    @Recover
    public Result retryWithTransactionRecover(RuntimeException e, String param) {
        System.out.println("重试失败，事务操作回滚，参数：" + param);
        return Result.fail("重试失败，已回滚事务");
    }
}

@Service
public class TransactionalService {

    // 事务方法（有事务，重试时失败会回滚）
    @Transactional(rollbackFor = Exception.class)
    public Result doTransactionalOperation(String param) {
        // 模拟数据库操作（如插入数据）
        System.out.println("执行事务操作，参数：" + param);
        // 模拟故障
        if (Math.random() > 0.3) {
            throw new RuntimeException("事务操作失败");
        }
        return Result.success("事务操作成功");
    }
}
```

注意：若将@Retryable和@Transactional放在同一个方法上，会导致每次重试都开启新事务，失败后回滚当前事务，重试时重新开启事务，这可能导致数据不一致（如前几次重试的中间状态残留）。

### 与Spring Cloud Circuit Breaker集成（熔断+重试） ###

Spring Retry的重试机制可与熔断机制结合，避免对已崩溃的服务持续重试。Spring Cloud Circuit Breaker支持Resilience4j、Sentinel等实现，这里以Resilience4j为例：

```xml
<!-- 引入Resilience4j依赖 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>
```

```java
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

@Service
public class RetryWithCircuitBreakerService {

    /**
     * 重试+熔断：先重试，重试失败后触发熔断
     * @Retryable：重试逻辑（对网络异常重试4次）
     * @CircuitBreaker：熔断逻辑（当失败率达到50%，触发熔断，30秒后尝试半开）
     */
    @Retryable(value = {NetworkException.class}, maxAttempts = 4)
    @CircuitBreaker(name = "thirdPartyService", fallbackMethod = "circuitBreakerFallback")
    public Result doSomethingWithCircuitBreaker(String param) {
        System.out.println("重试+熔断：调用第三方接口，参数：" + param);
        if (Math.random() > 0.3) {
            throw new NetworkException("网络抖动，调用失败");
        }
        return Result.success("调用成功");
    }

    // 熔断兜底方法
    public Result circuitBreakerFallback(String param, Exception e) {
        System.out.println("熔断触发，参数：" + param + "，异常：" + e.getMessage());
        return Result.success("服务暂时不可用，返回默认数据");
    }
}
```

集成后，当重试多次失败导致服务失败率达到阈值时，熔断会触发，暂时停止对该服务的调用，避免持续冲击，30秒后进入半开状态，允许少量请求重试，若成功则关闭熔断，否则继续熔断。

## 六、Spring Retry落地注意事项与最佳实践 ##

使用Spring Retry时，若不注意细节，可能导致数据异常、性能问题等，以下是核心注意事项：

### 必须保证重试操作的幂等性 ###

这是使用重试机制的前提！重试的本质是重复执行同一操作，若操作不具备幂等性（如重复扣减余额、重复创建订单），会导致严重的数据异常。确保幂等性的方案可参考之前的幂等性博客：如使用唯一标识、业务状态校验、乐观锁等。

### 合理配置重试策略，避免过度重试 ###

- maxAttempts：根据业务场景设置，核心高频接口建议34次（1次首次+23次重试），低频后台接口可设5~6次；
- backoff：优先使用“指数退避+随机抖动”（ExponentialRandomBackOffPolicy），避免高并发下重试峰值；设置maxDelay限制最大间隔，避免业务延迟过高；
- 避免无限重试：绝对不要使用AlwaysRetryPolicy，否则会导致服务资源耗尽。

### 明确重试触发条件，避免无效重试 ###

通过value/exclude属性精准控制触发重试的异常类型，仅对“可恢复的瞬时故障”重试（如网络抖动、服务临时不可用），对“不可恢复故障”（如参数错误、业务逻辑失败、权限不足）不重试，避免无效重试浪费资源。

### 避免重试长耗时操作 ###

重试长耗时操作（如大文件上传、复杂数据库查询）会导致服务线程阻塞，影响吞吐量。建议将长耗时操作拆分为短耗时操作，或采用异步重试（如结合Spring Async）。

### 添加重试监控与告警 ###

生产环境中，需监控重试次数、成功率、失败原因，及时发现服务异常：

- 通过RetryContext获取重试信息（如retryContext.getRetryCount()、retryContext.getLastThrowable()）；
- 结合Spring Boot Actuator暴露重试 metrics，通过Prometheus+Grafana监控；
- 对重试失败的场景触发告警（如短信、邮件），确保人工及时介入处理。

### 注解式与编程式的选择 ###

- 优先使用注解式（@Retryable）：代码简洁、侵入性低，适合重试策略固定的场景；
- 使用编程式（RetryTemplate）：适合重试策略参数动态变化、需要灵活控制重试逻辑的场景。

## 七、总结：Spring Retry 的核心价值与适用场景 ##

Spring Retry框架的核心价值是“以极低的侵入性，优雅解决分布式系统中的瞬时故障问题”——它将重试逻辑与核心业务逻辑解耦，提供了灵活的重试策略和丰富的高级特性，让我们无需关注重试的细节，专注于核心业务开发。

Spring Retry的适用场景：

- 跨服务调用、第三方接口调用（如支付、物流、短信接口）；
- 数据库操作（如临时连接超时、死锁重试）；
- 消息队列消费（如消费失败重试）；
- 任何存在“可恢复瞬时故障”的场景。

最后，记住：重试是“容错手段”，不是“解决方案”。Spring Retry只能解决“瞬时故障”，无法解决服务本身的稳定性问题。提升服务可靠性的根本，还是要优化服务架构（如集群部署、熔断限流、降级兜底），减少故障发生。
