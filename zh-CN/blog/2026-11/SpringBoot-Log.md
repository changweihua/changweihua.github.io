---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 日志最佳实践
description: 接入、分级、异常记录与滚动拆分
date: 2026-11-04 08:35:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

日志不是“程序运行时打印出来的文字”，而是定位故障、观察系统状态和审计业务行为的重要数据。一个合理的日志体系至少需要解决以下问题：

- 项目如何接入并统一记录日志？
- DEBUG、INFO、WARN、ERROR 应该如何选择？
- 系统异常和业务错误应该如何记录？
- 如何记录 HTTP 请求接入日志？
- 如何按业务、日期和文件大小拆分日志？
- 如何保留当日日志，并自动归档历史日志？
- 如何避免日志泄露密码、令牌等敏感信息？

本文以 Spring Boot 默认使用的 SLF4J + Logback 为例，给出一套适用于生产环境的实践方案。

## Spring Boot 如何接入日志 ##

Spring Boot Web 项目通常已经通过 `spring-boot-starter` 或 `spring-boot-starter-web` 间接引入日志组件，因此一般不需要再手动添加 Logback。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

Spring Boot 默认的日志组合是：

- SLF4J：日志门面，业务代码面向它编程。
- Logback：默认日志实现，负责日志输出、文件拆分和滚动归档。

代码中不要直接依赖 Logback 的具体类，而应该使用 SLF4J：

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private static final Logger log =
            LoggerFactory.getLogger(OrderService.class);

    public void createOrder(Long userId) {
        log.info("开始创建订单, userId={}", userId);
    }
}
```

如果项目使用 Lombok，也可以通过 `@Slf4j` 简化代码：

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class OrderService {

    public void createOrder(Long userId) {
        log.info("开始创建订单, userId={}", userId);
    }
}
```

建议业务代码始终使用参数占位符：

```java
log.info("订单创建成功, orderId={}, userId={}", orderId, userId);
```

不要使用字符串拼接：

```java
// 不推荐
log.info("订单创建成功, orderId=" + orderId + ", userId=" + userId);
```

占位符可以避免不必要的字符串构造，并能保持日志格式统一。

## 日志级别应该如何选择 ##

常见日志级别从低到高依次为：

```txt
TRACE < DEBUG < INFO < WARN < ERROR
```

生产环境通常以 `INFO` 为默认级别，只针对必要的模块临时开启 `DEBUG`。

### TRACE ###

`TRACE` 用于非常细粒度的执行过程，例如循环内部状态、协议字段解析过程等。

它产生的日志量很大，在普通业务系统中很少使用，也不应该在生产环境长期打开。

```java
log.trace("解析协议字段, index={}, value={}", index, value);
```

### DEBUG ###

`DEBUG` 用于开发和问题排查，记录对理解程序执行过程有帮助的内部信息。

```java
log.debug("订单优惠计算完成, orderId={}, originalAmount={}, discount={}",
        orderId, originalAmount, discount);
```

适合记录：

- 方法的重要输入。
- 条件分支结果。
- 中间计算结果。
- 外部接口响应摘要。
- 缓存是否命中。

不要把每一步代码执行都打印成 `DEBUG`，否则真正有价值的信息会被大量噪声淹没。

对于计算成本较高的日志参数，可以先判断级别：

```java
if (log.isDebugEnabled()) {
    log.debug("订单完整快照: {}", buildOrderSnapshot(order));
}
```

普通占位符参数一般不需要额外判断。

### INFO ###

`INFO` 用于记录正常且具有业务或运维价值的重要事件。

```java
log.info("订单创建成功, orderId={}, userId={}, amount={}",
        orderId, userId, amount);
```

适合记录：

- 应用启动和关闭。
- 重要配置加载结果。
- 业务流程开始或完成。
- 订单创建、支付成功、退款完成等关键状态变化。
- 定时任务的开始、结束和处理统计。
- 外部服务调用结果摘要。

`INFO` 不应该记录每一次普通方法调用，否则生产日志会迅速膨胀。

### WARN ###

`WARN` 表示系统出现了异常情况，但当前请求仍然可以继续，或者系统已经完成降级、重试和兜底。

```java
log.warn("查询商品缓存失败，降级查询数据库, productId={}", productId);
```

适合记录：

- 参数不符合预期，但可以使用默认值。
- 第三方服务调用失败后成功降级。
- 重试中的前几次失败。
- 数据状态异常但没有中断业务。
- 资源使用率接近阈值。
- 非关键配置缺失。

`WARN` 应该具有可操作性。如果一个警告长期存在且任何人都不需要处理，它很可能不应该是 WARN。

### ERROR ###

`ERROR` 表示当前操作失败，通常需要开发或运维人员关注。

```java
log.error("订单支付处理失败, orderId={}, paymentNo={}",
        orderId, paymentNo, exception);
```

适合记录：

- 未预期的程序异常。
- 数据库操作失败。
- 核心外部服务不可用。
- 数据损坏或状态严重不一致。
- 请求无法继续完成。
- 补偿、降级和重试全部失败。

`ERROR` 并不等于“代码进入了 catch”。只有真正影响系统或请求结果、需要关注的异常才应记录为 `ERROR`。

## 系统异常和业务错误不能混为一谈 ##

实际项目中最常见的问题，是把所有异常都记录为 ERROR。这会造成监控系统持续报警，却很难找到真正的系统故障。

### 什么是系统异常 ###

系统异常通常不是用户正常操作导致的，例如：

- 数据库连接中断。
- Redis 不可用。
- 空指针异常。
- 数据转换异常。
- 第三方服务超时。
- 文件读写失败。
- 代码状态不一致。

这类错误通常应该记录为 ERROR，并保留完整异常栈：

```java
try {
    paymentClient.pay(request);
} catch (Exception exception) {
    log.error("调用支付服务失败, orderId={}, paymentNo={}",
            orderId, paymentNo, exception);
    throw exception;
}
```

注意，异常对象应该作为日志方法的最后一个参数传入。

```java
// 正确：会输出完整异常栈
log.error("支付失败, orderId={}", orderId, exception);
```

以下写法通常只能记录异常描述，无法保留完整调用栈：

```java
// 不推荐
log.error("支付失败: {}", exception.getMessage());

// 不推荐
log.error("支付失败: " + exception);
```

异常栈包含异常类型、发生位置和调用链，是定位系统故障最重要的信息之一。

### 什么是业务错误 ###

业务错误是系统正常运行时可以预期的拒绝结果，例如：

- 登录密码错误。
- 商品库存不足。
- 优惠券已过期。
- 订单状态不允许取消。
- 用户余额不足。
- 请求的数据不存在。
- 用户没有操作权限。

这些通常不属于系统故障，不应该全部记录为 ERROR。

```java
if (stock < quantity) {
    log.info("库存不足，订单创建被拒绝, productId={}, requested={}, available={}",
            productId, quantity, stock);
    throw new BusinessException("库存不足");
}
```

业务错误应该使用什么级别，需要根据它的价值判断：

- 正常且常见的业务拒绝：通常使用 `INFO`，也可以不记录。
- 值得观察的异常业务状态：使用 `WARN`。
- 业务状态已经严重不一致，需要人工处理：使用 `ERROR`。

例如，用户输入错误密码是正常业务结果，不应记录为 `ERROR`：

```java
log.info("用户登录失败, username={}, reason=INVALID_PASSWORD", username);
```

但同一账号短时间内连续失败很多次，可能涉及安全风险，可以聚合后记录为 WARN：

```java
log.warn("账号短时间内多次登录失败, userId={}, failureCount={}",
        userId, failureCount);
```

如果订单显示支付成功，但支付流水不存在，这虽然表现为业务数据问题，却需要立即处理，可以记录为 ERROR：

```java
log.error("订单支付状态不一致, orderId={}, orderStatus={}, paymentRecord={}",
        orderId, orderStatus, paymentRecord);
```

因此，日志级别不应该简单根据“是不是业务异常”决定，而应该根据影响范围和是否需要处理决定。

## 避免同一个异常被重复记录 ##

下面是一种常见但错误的写法：

```java
public void createOrder() {
    try {
        inventoryService.deduct();
    } catch (Exception exception) {
        log.error("扣减库存失败", exception);
        throw exception;
    }
}
```

上层又记录一次：

```java
try {
    orderService.createOrder();
} catch (Exception exception) {
    log.error("创建订单失败", exception);
    throw exception;
}
```

全局异常处理器再记录一次：

```java
@ExceptionHandler(Exception.class)
public Result<?> handle(Exception exception) {
    log.error("系统异常", exception);
    return Result.fail("系统繁忙");
}
```


一次异常由此产生三份几乎相同的异常栈，不仅浪费存储，也会干扰告警统计。

推荐遵循一个原则：

> 异常只在能够最终处理它，或者能够补充关键上下文的位置记录一次。

如果当前方法只是继续向上抛出异常，而且不能增加有价值的信息，可以不记录：

```java
public void createOrder() {
    inventoryService.deduct();
}
```

最后在全局异常处理器中统一记录：

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException exception) {
        log.info("业务请求未完成, code={}, message={}",
                exception.getCode(), exception.getMessage());

        return Result.fail(exception.getCode(), exception.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleSystemException(Exception exception) {
        log.error("未处理的系统异常", exception);
        return Result.fail("SYSTEM_ERROR", "系统繁忙，请稍后重试");
    }
}
```

如果底层必须记录，例如异常即将被转换、吞掉或降级，则应补充调用对象、关键参数和降级结果：

```java
try {
    return recommendationClient.query(userId);
} catch (Exception exception) {
    log.warn("推荐服务调用失败，返回默认推荐列表, userId={}", userId, exception);
    return defaultRecommendations();
}
```

## 日志内容应该包含什么 ##

一条有效日志通常需要回答几个问题：

- 发生了什么？
- 在哪个请求中发生？
- 涉及哪个用户或业务对象？
- 执行结果是什么？
- 失败原因是什么？
- 是否执行了重试、降级或补偿？

推荐采用“固定事件描述 + 结构化字段”的形式：

```java
log.info("订单创建成功, traceId={}, orderId={}, userId={}, amount={}",
        traceId, orderId, userId, amount);
```

重要字段可以包括：

- traceId：一次请求的链路标识。
- userId：用户标识。
- orderId：订单等业务实体标识。
- requestId：请求标识。
- clientIp：客户端地址。
- costMs：执行耗时。
- result：处理结果。
- errorCode：标准错误码。
- retryCount：重试次数。

不推荐只打印模糊描述：

```java
log.error("执行失败");
log.warn("数据不正确");
log.info("进入方法");
```

这种日志无法帮助定位具体请求和业务数据。

同时，也不要简单序列化整个对象：

```java
// 可能包含密码、Token、身份证号或大字段
log.info("注册请求: {}", request);
```

应该只记录定位问题所需的安全字段：

```java
log.info("收到注册请求, username={}, channel={}",
        request.getUsername(), request.getChannel());
```

## 使用 MDC 记录 Trace ID ##

如果每条日志都手动传递 traceId，代码会非常繁琐。可以使用 SLF4J 的 MDC 保存当前请求的上下文信息。

```java
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class TraceIdFilter implements Filter {

    private static final String TRACE_ID = "traceId";

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        String traceId = httpRequest.getHeader("X-Trace-Id");
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString().replace("-", "");
        }

        try {
            MDC.put(TRACE_ID, traceId);
            chain.doFilter(request, response);
        } finally {
            // Web 容器通常会复用线程，必须清理 MDC。
            MDC.remove(TRACE_ID);
        }
    }
}
```

之后在 Logback 输出格式中加入 `%X{traceId}`：

```xml
<pattern>
    %d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level
    [%X{traceId:-NO_TRACE}] %logger{50} - %msg%n
</pattern>
```

日志效果如下：

```txt
2026-08-27 10:21:32.318 [http-nio-8080-exec-2] INFO
[84b830c095be45e7a284fac4580895d0] com.example.OrderService -
订单创建成功, orderId=10001, userId=20001
```

这样便可以通过 `traceId` 检索一次请求产生的全部日志。

如果使用线程池或异步任务，需要额外传递和清理 MDC。普通 `ThreadLocal` 上下文不会自动传播到另一个线程。

## 记录 HTTP 接入日志 ##

业务日志和 HTTP 接入日志的职责不同。

业务日志描述系统做了什么；接入日志描述哪个客户端在什么时间访问了哪个接口，以及请求最终返回了什么结果。

一条接入日志通常包括：

- 请求方法。
- 请求路径。
- HTTP 状态码。
- 客户端 IP。
- User-Agent。
- Trace ID。
- 请求耗时。
- 用户标识。
- 响应大小。

可以使用过滤器统一记录：

```java
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Slf4j(topic = "ACCESS_LOG")
@Component
public class AccessLogFilter implements Filter {

    @Override
    public void doFilter(
            ServletRequest request,
            ServletResponse response,
            FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        long start = System.nanoTime();

        try {
            chain.doFilter(request, response);
        } finally {
            long costMs = TimeUnit.NANOSECONDS.toMillis(
                    System.nanoTime() - start);

            log.info(
                    "method={}, path={}, status={}, clientIp={}, costMs={}, userAgent={}",
                    httpRequest.getMethod(),
                    httpRequest.getRequestURI(),
                    httpResponse.getStatus(),
                    getClientIp(httpRequest),
                    costMs,
                    httpRequest.getHeader("User-Agent")
            );
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }
}
```

这里通过单独的 Logger 名称 `ACCESS_LOG` 输出接入日志，后续可以在 Logback 中将它写入独立文件。

需要注意：只有当请求确实经过可信的反向代理，并且代理正确覆盖 `X-Forwarded-For` 时，才能信任这个请求头。否则客户端可以伪造它。

接入日志一般不要打印完整请求体和响应体，原因包括：

- 可能包含密码、Token 和个人隐私。
- 文件上传或大响应会造成日志急剧膨胀。
- 流式请求和响应不适合直接读取。
- 重复读取请求体可能影响业务处理。
- 高频序列化会增加接口耗时。

确实需要记录时，应设置白名单、大小限制和脱敏规则。

## Logback 生产环境配置 ##

在 Spring Boot 项目的 `src/main/resources` 下创建：`logback-spring.xml`

之所以推荐使用 `logback-spring.xml`，是因为它能够使用 Spring Boot 提供的扩展能力，例如读取 Spring 属性和按 Profile 配置日志。

下面是一套基础生产配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <springProperty
            scope="context"
            name="APP_NAME"
            source="spring.application.name"
            defaultValue="spring-app"/>

    <springProperty
            scope="context"
            name="LOG_PATH"
            source="logging.file.path"
            defaultValue="./logs"/>

    <property name="LOG_PATTERN"
              value="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId:-NO_TRACE}] %logger{50} - %msg%n"/>

    <!-- 控制台输出 -->
    <appender name="CONSOLE"
              class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 应用综合日志 -->
    <appender name="APP_FILE"
              class="ch.qos.logback.core.rolling.RollingFileAppender">

        <!-- 始终表示正在写入的当日日志 -->
        <file>${LOG_PATH}/${APP_NAME}.log</file>

        <rollingPolicy
                class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <!-- 日期变化或文件达到 100MB 时归档 -->
            <fileNamePattern>
                ${LOG_PATH}/archive/${APP_NAME}.%d{yyyy-MM-dd}.%i.log.gz
            </fileNamePattern>

            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
            <cleanHistoryOnStart>true</cleanHistoryOnStart>
        </rollingPolicy>

        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- ERROR 独立日志 -->
    <appender name="ERROR_FILE"
              class="ch.qos.logback.core.rolling.RollingFileAppender">

        <file>${LOG_PATH}/${APP_NAME}-error.log</file>

        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>

        <rollingPolicy
                class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <fileNamePattern>
                ${LOG_PATH}/archive/${APP_NAME}-error.%d{yyyy-MM-dd}.%i.log.gz
            </fileNamePattern>

            <maxFileSize>100MB</maxFileSize>
            <maxHistory>90</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
        </rollingPolicy>

        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- HTTP 接入日志 -->
    <appender name="ACCESS_FILE"
              class="ch.qos.logback.core.rolling.RollingFileAppender">

        <file>${LOG_PATH}/${APP_NAME}-access.log</file>

        <rollingPolicy
                class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <fileNamePattern>
                ${LOG_PATH}/archive/${APP_NAME}-access.%d{yyyy-MM-dd}.%i.log.gz
            </fileNamePattern>

            <maxFileSize>200MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>20GB</totalSizeCap>
        </rollingPolicy>

        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- ACCESS_LOG 只写接入日志文件，不重复传递到 root -->
    <logger name="ACCESS_LOG"
            level="INFO"
            additivity="false">
        <appender-ref ref="ACCESS_FILE"/>
    </logger>

    <!-- 根据项目实际情况调整第三方组件级别 -->
    <logger name="org.springframework" level="INFO"/>
    <logger name="org.hibernate" level="WARN"/>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="APP_FILE"/>
        <appender-ref ref="ERROR_FILE"/>
    </root>

</configuration>
```

在 `application.yml` 中配置应用名和日志路径：

```yml
spring:
  application:
    name: order-service

logging:
  file:
    path: ./logs
```

生产环境也可以通过启动参数覆盖日志路径：

```bash
--logging.file.path=/data/logs/order-service
```

运行后目录大致如下：

```txt
logs/
├── order-service.log
├── order-service-error.log
├── order-service-access.log
└── archive/
    ├── order-service.2026-08-26.0.log.gz
    ├── order-service.2026-08-26.1.log.gz
    ├── order-service-error.2026-08-26.0.log.gz
    └── order-service-access.2026-08-26.0.log.gz
```

## 当日日志和历史日志如何滚动 ##

配置中的核心是：

```xml
<file>${LOG_PATH}/${APP_NAME}.log</file>
以及：

<fileNamePattern>
    ${LOG_PATH}/archive/${APP_NAME}.%d{yyyy-MM-dd}.%i.log.gz
</fileNamePattern>
```

两者配合后的行为是：

- 当前正在写入的日志始终叫 `order-service.log`。
- 日期变化时，旧文件会被归档到 `archive` 目录。
- 同一天文件超过 `maxFileSize` 后，会按照序号继续拆分。
- 历史文件使用 `.gz` 压缩，减少磁盘占用。

例如，某一天日志量超过 100 MB 后可能生成：

```txt
order-service.2026-08-27.0.log.gz
order-service.2026-08-27.1.log.gz
order-service.2026-08-27.2.log.gz
```

这里的 `%d{yyyy-MM-dd}` 负责按日期滚动，`%i` 负责同一天按大小编号。

只配置日期滚动而不限制单文件大小，可能在流量异常时生成数 GB 的单个日志文件。因此生产环境更推荐同时按日期和大小滚动。

几个关键配置的含义如下：

```xml
<maxFileSize>100MB</maxFileSize>
```

单个归档文件最大 100 MB。

```xml
<maxHistory>30</maxHistory>
```

最多保留 30 天的历史归档。

```xml
<totalSizeCap>10GB</totalSizeCap>
```

所有历史归档总大小不超过 10 GB。即使还没有达到 30 天，超过容量限制时也可能清理旧文件。

```xml
<cleanHistoryOnStart>true</cleanHistoryOnStart>
```

应用启动时检查并清理超过保留策略的旧日志。

不要只配置 `maxHistory` 而忽略 `totalSizeCap`。某一天发生日志风暴时，即使只保留几天，也可能耗尽磁盘。

> 下面这部分可直接替换原文的“按日志级别拆分文件”章节。该方案不修改 Java 代码，仅修改 `logback-spring.xml`，即可将 INFO、WARN、ERROR 精确拆分到不同文件。

## 仅修改配置文件实现日志级别分离 ##

如果项目已经统一使用 SLF4J 记录日志，那么不需要修改任何业务代码，只需调整 `logback-spring.xml`，就可以按照日志级别生成独立文件：

```txt
logs/
├── order-service.log
├── order-service-info.log
├── order-service-warn.log
├── order-service-error.log
└── archive/
    ├── order-service-info.2026-08-27.0.log.gz
    ├── order-service-warn.2026-08-27.0.log.gz
    └── order-service-error.2026-08-27.0.log.gz
```

推荐保留一份包含全部日志的综合文件，同时生成精确级别文件：

- order-service.log：包含 INFO、WARN、ERROR 等全部有效日志。
- order-service-info.log：只包含 INFO。
- order-service-warn.log：只包含 WARN。
- order-service-error.log：只包含 ERROR。

这样既可以通过综合日志还原完整请求过程，也可以快速查看警告和错误。

### LevelFilter 和 ThresholdFilter 的区别 ###

实现日志分离时，需要特别注意两种过滤器的区别。

`LevelFilter` 表示精确匹配某个级别：

```xml
<filter class="ch.qos.logback.classic.filter.LevelFilter">
    <level>INFO</level>
    <onMatch>ACCEPT</onMatch>
    <onMismatch>DENY</onMismatch>
</filter>
```

该过滤器只接受 INFO，不会接受 WARN 和 ERROR，因此适合日志级别拆分。

`ThresholdFilter` 表示接受指定级别及其以上的所有日志：

```xml
<filter class="ch.qos.logback.classic.filter.ThresholdFilter">
    <level>WARN</level>
</filter>
```

它会同时接受：

```txt
WARN
ERROR
```

因此，如果目标是让 warn.log 只包含 WARN，就不能使用 `ThresholdFilter`，而应该使用 `LevelFilter`。

### 完整配置示例 ###

下面的配置仅依赖 Logback，不需要修改 Controller、Service 或其他 Java 代码。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <!-- 从 Spring Boot 配置中读取应用名称 -->
    <springProperty
            scope="context"
            name="APP_NAME"
            source="spring.application.name"
            defaultValue="spring-app"/>

    <!-- 从 Spring Boot 配置中读取日志目录 -->
    <springProperty
            scope="context"
            name="LOG_PATH"
            source="logging.file.path"
            defaultValue="./logs"/>

    <!-- 统一日志格式 -->
    <property
            name="LOG_PATTERN"
            value="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{traceId:-NO_TRACE}] %logger{50} - %msg%n"/>

    <!-- 控制台日志 -->
    <appender name="CONSOLE"
              class="ch.qos.logback.core.ConsoleAppender">

        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 综合日志：包含 INFO、WARN、ERROR 等全部有效级别 -->
    <appender name="ALL_FILE"
              class="ch.qos.logback.core.rolling.RollingFileAppender">

        <!-- 当前正在写入的日志文件 -->
        <file>${LOG_PATH}/${APP_NAME}.log</file>

        <rollingPolicy
                class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <!-- 按日期和文件大小滚动 -->
            <fileNamePattern>
                ${LOG_PATH}/archive/${APP_NAME}.%d{yyyy-MM-dd}.%i.log.gz
            </fileNamePattern>

            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
            <cleanHistoryOnStart>true</cleanHistoryOnStart>
        </rollingPolicy>

        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- INFO 日志：只接收 INFO -->
    <appender name="INFO_FILE"
              class="ch.qos.logback.core.rolling.RollingFileAppender">

        <file>${LOG_PATH}/${APP_NAME}-info.log</file>

        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>INFO</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>

        <rollingPolicy
                class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <fileNamePattern>
                ${LOG_PATH}/archive/${APP_NAME}-info.%d{yyyy-MM-dd}.%i.log.gz
            </fileNamePattern>

            <maxFileSize>100MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
            <cleanHistoryOnStart>true</cleanHistoryOnStart>
        </rollingPolicy>

        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- WARN 日志：只接收 WARN -->
    <appender name="WARN_FILE"
              class="ch.qos.logback.core.rolling.RollingFileAppender">

        <file>${LOG_PATH}/${APP_NAME}-warn.log</file>

        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>WARN</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>

        <rollingPolicy
                class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <fileNamePattern>
                ${LOG_PATH}/archive/${APP_NAME}-warn.%d{yyyy-MM-dd}.%i.log.gz
            </fileNamePattern>

            <maxFileSize>100MB</maxFileSize>
            <maxHistory>60</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
            <cleanHistoryOnStart>true</cleanHistoryOnStart>
        </rollingPolicy>

        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- ERROR 日志：只接收 ERROR -->
    <appender name="ERROR_FILE"
              class="ch.qos.logback.core.rolling.RollingFileAppender">

        <file>${LOG_PATH}/${APP_NAME}-error.log</file>

        <filter class="ch.qos.logback.classic.filter.LevelFilter">
            <level>ERROR</level>
            <onMatch>ACCEPT</onMatch>
            <onMismatch>DENY</onMismatch>
        </filter>

        <rollingPolicy
                class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

            <fileNamePattern>
                ${LOG_PATH}/archive/${APP_NAME}-error.%d{yyyy-MM-dd}.%i.log.gz
            </fileNamePattern>

            <maxFileSize>100MB</maxFileSize>
            <maxHistory>90</maxHistory>
            <totalSizeCap>10GB</totalSizeCap>
            <cleanHistoryOnStart>true</cleanHistoryOnStart>
        </rollingPolicy>

        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 降低第三方组件的日志噪声 -->
    <logger name="org.springframework" level="INFO"/>
    <logger name="org.hibernate" level="WARN"/>

    <!--
        root 只决定允许产生的最低日志级别。
        日志具体写入哪个文件，由各 Appender 的过滤器决定。
    -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="ALL_FILE"/>
        <appender-ref ref="INFO_FILE"/>
        <appender-ref ref="WARN_FILE"/>
        <appender-ref ref="ERROR_FILE"/>
    </root>

</configuration>
```

对应的 `application.yml` 配置如下：

```yml
spring:
  application:
    name: order-service

logging:
  file:
    path: ./logs
```

应用重新启动后，日志将自动按照级别写入不同文件，不需要修改原有的日志代码：

```java
log.info("订单创建成功, orderId={}", orderId);
log.warn("库存即将不足, productId={}", productId);
log.error("订单创建失败, orderId={}", orderId, exception);
```

对应关系为：

| 日志代码 | 综合日志 | INFO 文件 | WARN 文件 | ERROR 文件 |
| :--- | :--- | :--- | :--- | :--- |
| `log.info(...)` | 写入 | 写入 | 不写入 | 不写入 |
| `log.warn(...)` | 写入 | 不写入 | 写入 | 不写入 |
| `log.error(...)` | 写入 | 不写入 | 不写入 | 写入 |


### 为什么 Root Logger 要配置多个 Appender ###

一条日志产生后，会被发送给 Root Logger 引用的所有 Appender。每个 Appender 再通过自己的过滤器判断是否接收。

例如，一条 `WARN` 日志的处理过程如下：

```txt
WARN 日志
    ├── CONSOLE：接收并输出到控制台
    ├── ALL_FILE：接收并写入综合日志
    ├── INFO_FILE：级别不匹配，拒绝
    ├── WARN_FILE：级别匹配，接收
    └── ERROR_FILE：级别不匹配，拒绝
```

因此，业务代码不需要选择日志文件。代码只负责使用正确的日志级别，日志配置负责决定最终写入位置。

### 如果不需要综合日志 ###

如果希望不同级别完全独立，不需要 `${APP_NAME}.log` 综合文件，可以从 Root Logger 中删除：

```xml
<appender-ref ref="ALL_FILE"/>
```

修改后：

```xml
<root level="INFO">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="INFO_FILE"/>
    <appender-ref ref="WARN_FILE"/>
    <appender-ref ref="ERROR_FILE"/>
</root>
```

此时每条日志只会出现在对应的级别文件中。

不过，生产环境通常建议保留综合日志。排查一次请求时，往往需要按照时间顺序同时查看 INFO、WARN 和 ERROR。如果日志完全分散在不同文件中，还原完整调用过程会更加困难。

### 如果需要拆分 DEBUG 日志 ###

开发或测试环境可能需要单独保存 DEBUG 日志，可以增加：

```xml
<appender name="DEBUG_FILE"
          class="ch.qos.logback.core.rolling.RollingFileAppender">

    <file>${LOG_PATH}/${APP_NAME}-debug.log</file>

    <filter class="ch.qos.logback.classic.filter.LevelFilter">
        <level>DEBUG</level>
        <onMatch>ACCEPT</onMatch>
        <onMismatch>DENY</onMismatch>
    </filter>

    <rollingPolicy
            class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

        <fileNamePattern>
            ${LOG_PATH}/archive/${APP_NAME}-debug.%d{yyyy-MM-dd}.%i.log.gz
        </fileNamePattern>

        <maxFileSize>100MB</maxFileSize>
        <maxHistory>7</maxHistory>
        <totalSizeCap>5GB</totalSizeCap>
    </rollingPolicy>

    <encoder>
        <pattern>${LOG_PATTERN}</pattern>
        <charset>UTF-8</charset>
    </encoder>
</appender>
```

同时需要将 Root Logger 的最低级别调整为 DEBUG，并引用该 Appender：

```xml
<root level="DEBUG">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="ALL_FILE"/>
    <appender-ref ref="DEBUG_FILE"/>
    <appender-ref ref="INFO_FILE"/>
    <appender-ref ref="WARN_FILE"/>
    <appender-ref ref="ERROR_FILE"/>
</root>
```

需要注意：只有代码中原本存在 `log.debug(...)`，并且 Logger 允许 DEBUG 级别时，才能产生 DEBUG 日志。配置文件可以决定已有日志是否输出、输出到哪里，但不能把代码中的 `log.info(...)` 自动变成 DEBUG。

生产环境不建议长期将 Root Logger 设置为 `DEBUG`，否则 Spring、数据库驱动及其他依赖可能产生大量日志。更安全的方式是只为项目业务包开启：

```xml
<root level="INFO">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="ALL_FILE"/>
    <appender-ref ref="INFO_FILE"/>
    <appender-ref ref="WARN_FILE"/>
    <appender-ref ref="ERROR_FILE"/>
</root>

<logger name="com.example.order"
        level="DEBUG"
        additivity="true">
    <appender-ref ref="DEBUG_FILE"/>
</logger>
```

这里的 `com.example.order` 应替换为项目实际的业务包名。

### 仅通过配置还可以按包拆分日志 ###

除了按级别分离，如果项目的 Controller、Service、Mapper 位于不同包中，也可以在不修改代码的情况下按包输出日志。

例如，将 Mapper 日志写入独立文件：

```xml
<logger name="com.example.order.mapper"
        level="DEBUG"
        additivity="false">
    <appender-ref ref="MAPPER_FILE"/>
</logger>
```

其中，`MAPPER_FILE` 的定义方式与其他滚动文件 `Appender` 相同。

需要注意：

- 按包拆分不需要修改 Java 代码。
- 前提是现有代码的包结构能够区分不同模块。
- 如果多个业务模块混合在同一个包中，仅靠配置无法准确识别日志属于订单、支付还是库存。
- 如果希望按照任意业务类型拆分，通常需要代码使用不同的 Logger 名称或 Marker。

因此，“按日志级别拆分”和“按现有包名拆分”可以完全通过配置实现；“按照代码中不存在的业务标签拆分”则无法仅依靠配置凭空完成。

### 配置时的注意事项 ###

#### 不要让同一个文件被多个 Appender 写入 ####

每个滚动文件应该只由一个 Appender 负责写入。多个 Appender 同时操作同一路径，可能造成日志丢失、滚动失败或文件竞争。

#### 不要混淆 Logger 级别和 Appender 过滤器 ####

Logger 级别决定日志事件是否能够产生：

```xml
<root level="INFO">
```

这表示 TRACE 和 DEBUG 会在进入 Appender 前被丢弃。

Appender 过滤器决定已经产生的事件写入哪个文件：

```xml
<level>ERROR</level>
```

因此，如果 Root Logger 是 INFO，即使配置了 DEBUG_FILE，也不会收到 Root Logger 拦截掉的 DEBUG 日志。

#### 精确分级必须使用 LevelFilter ####

如果希望文件之间不存在级别交叉，应统一使用：

```xml
<filter class="ch.qos.logback.classic.filter.LevelFilter">
```

不要用 `ThresholdFilter` 实现精确级别分离。

#### ERROR 文件可以保留更长时间 ####

不同级别可以设置不同的保留策略，例如：

- INFO：保留 30 天
- WARN：保留 60 天
- ERROR：保留 90 天
- DEBUG：保留 7 天

但仍应为每类日志设置 `totalSizeCap`，防止某个级别突然暴增并耗尽磁盘。

### 验证日志分离是否正确 ###

配置完成并重启应用后，可以通过现有接口触发不同日志，或者使用项目中已有的日志调用进行验证。

重点检查：

- INFO 是否只进入综合日志和 INFO 文件。
- WARN 是否只进入综合日志和 WARN 文件。
- ERROR 是否只进入综合日志和 ERROR 文件。
- 日期变化后是否生成历史归档文件。
- 单文件达到 `maxFileSize` 后是否继续按照 %i 拆分。
- 历史日志是否成功压缩为 `.gz`。
- 超过保留天数或总容量后是否清理旧文件。
- 启动过程中是否出现 Logback 配置错误。

如果同一条日志在同一个文件中出现两次，应重点检查：

- Logger 是否同时引用了 Appender。
- Root Logger 是否也引用了同一个 Appender。
- 子 Logger 的 `additivity` 是否设置正确。

对于自定义 Logger，如果不希望日志继续传递到 Root Logger，应配置：

```xml
additivity="false"
```

### 小结 ###

Spring Boot 项目已经使用 SLF4J 和 Logback 时，日志级别分离完全可以通过修改 `logback-spring.xml` 实现，不需要改动业务代码。

核心做法是：

- 为 INFO、WARN、ERROR 分别创建一个 `RollingFileAppender`。
- 每个 Appender 使用 `LevelFilter` 精确匹配日志级别。
- Root Logger 同时引用这些 Appender。
- 使用 `SizeAndTimeBasedRollingPolicy` 实现按日期和大小滚动。
- 同时设置保留天数和总容量上限。
- 根据排查需要决定是否保留一份综合日志。

配置负责日志的输出位置，代码负责选择正确的日志级别。两者职责分离后，既能做到不侵入业务代码，也能获得清晰、可维护的生产日志目录。

## 按业务拆分日志 ##

对于支付、审计、消息消费等重要场景，可以建立独立 Logger。

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PaymentLog {

    public static final Logger LOGGER =
            LoggerFactory.getLogger("PAYMENT_LOG");

    private PaymentLog() {
    }
}
```

业务代码中使用：

```java
PaymentLog.LOGGER.info(
        "支付状态变更, orderId={}, paymentNo={}, from={}, to={}",
        orderId, paymentNo, oldStatus, newStatus);
```

Logback 中增加对应的 Appender 和 Logger：

```xml
<appender name="PAYMENT_FILE"
          class="ch.qos.logback.core.rolling.RollingFileAppender">

    <file>${LOG_PATH}/${APP_NAME}-payment.log</file>

    <rollingPolicy
            class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">

        <fileNamePattern>
            ${LOG_PATH}/archive/${APP_NAME}-payment.%d{yyyy-MM-dd}.%i.log.gz
        </fileNamePattern>

        <maxFileSize>100MB</maxFileSize>
        <maxHistory>180</maxHistory>
        <totalSizeCap>20GB</totalSizeCap>
    </rollingPolicy>

    <encoder>
        <pattern>${LOG_PATTERN}</pattern>
        <charset>UTF-8</charset>
    </encoder>
</appender>

<logger name="PAYMENT_LOG"
        level="INFO"
        additivity="false">
    <appender-ref ref="PAYMENT_FILE"/>
</logger>
```

`additivity="false"` 非常重要。它表示这条日志不会继续传递给父 Logger，否则同一条支付日志可能同时出现在支付日志和应用综合日志中。

不过，业务日志文件不应该代替数据库中的业务记录。日志适合检索、排错和审计辅助，不适合作为唯一的交易事实来源。

## 开发和生产环境使用不同配置 ##

开发环境通常希望：

- 输出到控制台。
- 可以临时开启 DEBUG。
- 日志格式便于阅读。

生产环境通常希望：

- 默认使用 INFO。
- 输出到文件或标准输出采集系统。
- 控制第三方框架的日志量。
- 启用滚动、压缩和清理策略。

可以在 `logback-spring.xml` 中使用 Spring Profile：

```xml
<springProfile name="dev">
    <logger name="com.example" level="DEBUG"/>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
    </root>
</springProfile>

<springProfile name="prod">
    <logger name="com.example" level="INFO"/>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="APP_FILE"/>
        <appender-ref ref="ERROR_FILE"/>
    </root>
</springProfile>
```

也可以在不同的配置文件中设置级别：

```yml
# application-dev.yml
logging:
  level:
    com.example: DEBUG
# application-prod.yml
logging:
  level:
    root: INFO
    com.example: INFO
    org.springframework: INFO
    org.hibernate: WARN
```

## 是否应该使用异步日志 ##

同步写日志会占用请求线程。在日志量较大的系统中，可以通过 `AsyncAppender` 降低文件写入对业务线程的影响：

```xml
<appender name="ASYNC_APP_FILE"
          class="ch.qos.logback.classic.AsyncAppender">

    <queueSize>8192</queueSize>
    <discardingThreshold>0</discardingThreshold>
    <neverBlock>false</neverBlock>

    <appender-ref ref="APP_FILE"/>
</appender>
```

然后让 Root Logger 引用异步 Appender：

```xml
<root level="INFO">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="ASYNC_APP_FILE"/>
    <appender-ref ref="ERROR_FILE"/>
</root>
```

异步日志并非没有代价：

- 应用异常退出时，队列中尚未写出的日志可能丢失。
- 队列过小时，高峰期可能阻塞或丢弃日志。
- 队列过大会占用更多内存。
- 如果同一个实际文件被多个 Appender 同时写入，可能产生冲突。

对于错误日志、审计日志和支付关键日志，应根据可靠性要求谨慎决定是否异步写入。日志不能替代可靠消息、数据库流水或审计存储。

## 日志脱敏与安全 ##
日志经常被开发、测试、运维或外部日志平台访问，因此不能默认它是安全的。

以下信息不应该直接写入日志：

- 密码和支付密码。
- Access Token、Refresh Token。
- Cookie、Session ID。
- Authorization 请求头。
- 银行卡号和安全码。
- 身份证号。
- 手机号、邮箱和家庭地址等个人信息。
- 加密私钥和数据库密码。
- 完整请求体或第三方原始响应中的敏感字段。

错误示例：

```java
log.info("用户登录, username={}, password={}",
        request.getUsername(), request.getPassword());

log.debug("请求头 Authorization={}",
        request.getHeader("Authorization"));
```

正确做法是完全不记录秘密信息，并对必要的个人信息脱敏：

```java
log.info("用户登录请求, username={}, mobile={}",
        request.getUsername(), maskMobile(request.getMobile()));
```

同时需要防止日志注入。来自用户的文本可能包含换行符，导致伪造多行日志。应对自由文本进行清理、限制长度，或者使用成熟的结构化日志方案。

## 常见错误实践 ##

### 所有异常都记录为 ERROR ###

业务校验失败并不代表系统故障。大量无意义的 `ERROR` 会让真正的故障告警失去价值。

### 只记录异常消息 ###

```java
log.error("处理失败: {}", exception.getMessage());
```

这会丢失异常类型、代码位置和完整调用链。系统异常应传入异常对象。

### 同一异常层层打印 ###

异常在 DAO、Service、Controller 和全局异常处理器中重复记录，会造成日志污染和告警重复。

### 打印完整请求和响应 ###

这容易泄露敏感数据，也可能导致磁盘、网络和 CPU 压力。

### 生产环境长期打开 DEBUG ###

高流量系统开启 `DEBUG` 后可能迅速耗尽磁盘，并影响应用性能。

### 日志没有业务标识 ###

只写“订单处理失败”远远不够，至少应该包含 orderId、userId、traceId 和错误原因。

### 没有设置容量上限 ###

只有按天滚动，没有单文件限制和总容量限制，仍然可能因为日志风暴耗尽磁盘。

### 使用日志代替业务数据 ###

日志可能清理、丢失或重复，不能作为订单、支付、余额等关键数据的唯一来源。

## 推荐的日志决策方式 ##

写日志之前，可以依次判断：

- 这条信息对排错、监控、审计或业务分析是否有价值？
- 它是正常事件、可恢复异常，还是操作失败？
- 是否已经在其他层记录过？
- 是否包含足够的请求和业务上下文？
- 是否包含敏感信息？
- 在生产流量下，这条日志会产生多大规模？
- 看到这条 WARN 或 ERROR 后，是否有人能够采取行动？

可以采用以下级别参考：

| 场景 | 建议级别 |
| :--- | :--- |
| 订单创建成功 | INFO |
| 用户输入错误密码 | INFO 或不记录 |
| 库存不足 | INFO |
| 非关键服务失败，已成功降级 | WARN |
| 外部服务第一次重试失败 | WARN |
| 核心服务重试全部失败 | ERROR |
| 未预期的空指针异常 | ERROR |
| 数据库连接失败 | ERROR |
| 支付状态严重不一致 | ERROR |
| 方法内部中间计算结果 | DEBUG |
| 高频循环内的执行细节 | TRACE 或不记录 |

这张表不是绝对规则。最终级别取决于业务影响、发生频率和是否需要人工关注。

## 生产环境落地清单 ##

一套可用的 Spring Boot 日志体系，建议至少完成以下配置：

- 业务代码统一使用 SLF4J。
- 生产环境默认日志级别为 INFO。
- 使用占位符输出参数，避免字符串拼接。
- 接入 Trace ID，并在请求结束时清理 MDC。
- HTTP 接入日志与普通业务日志分离。
- 应用综合日志和 ERROR 日志分离。
- 重要支付或审计业务使用独立 Logger。
- 按日期和文件大小同时滚动。
- 历史日志启用压缩。
- 同时设置 maxHistory 和 totalSizeCap。
- 系统异常记录完整异常栈。
- 正常业务错误不滥用 ERROR。
- 避免同一个异常被重复记录。
- 对密码、Token 和个人信息执行隐藏或脱敏。
- 对日志目录配置磁盘空间监控。
- 对 ERROR 数量、接口失败率和高耗时请求建立告警。
- 定期检查日志是否仍然具有定位价值。

## 总结 ##

优秀的日志体系并不是记录得越多越好，而是在正确的位置，以正确的级别，记录足够且安全的上下文。

正常业务流程使用 INFO，开发排查信息使用 DEBUG，已经降级或值得关注的异常使用 WARN，真正导致操作失败、需要处理的系统故障使用 ERROR。系统异常应记录完整异常栈，普通业务拒绝则不应制造无意义的错误告警。

配合 Trace ID、HTTP 接入日志、业务日志拆分，以及按日期和大小滚动的 Logback 配置，才能让日志在生产故障发生时真正发挥作用，而不是变成占满磁盘却无法检索的文本。
