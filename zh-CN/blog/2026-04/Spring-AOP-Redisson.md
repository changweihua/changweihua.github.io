---
lastUpdated: true
commentabled: true
recommended: true
title: 基于 AOP 与 Redisson 的分布式锁实现
description: 自动加锁、解锁与 SpEL 参数解析
date: 2026-04-09 10:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、前言 ##

在分布式系统中，为了保证多个服务实例间的数据一致性，分布式锁是常见的技术手段。本文将介绍如何使用 *Spring AOP*、*Redisson* 和 *SpEL* 表达式，实现一套声明式的分布式锁方案：通过注解标注方法，自动完成加锁、解锁，并支持从方法参数中灵活解析锁的 Key。

核心特性：

- 注解驱动，无需在业务代码中手写加锁逻辑
- 支持 Redisson 分布式锁，基于 Redis 实现
- 支持 SpEL 表达式解析，从方法参数动态构建锁 Key
- 支持“立即失败”与“等待重试”两种加锁策略

## 二、注解设计 ##

### `@Key` 注解：参数级 SpEL 解析 ###

```java
@Documented
@Retention(RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.PARAMETER})
public @interface Key {

    String expr() default "";

}
```

作用： 标注在方法参数上，表示该参数参与锁 `Key` 的生成。通过 `expr` 可指定 SpEL 表达式，从参数对象中提取字段值；若 `expr` 为空，则直接使用参数的 `toString()`。

### `@Lock` 注解：方法级加锁配置 ###

```java
@Documented
@Retention(RUNTIME)
@Target(METHOD)
public @interface Lock {

    String prefix();                              // 锁 Key 前缀，用于业务区分
    boolean isWait() default false;               // 是否等待获取锁
    long waitTime() default 3L;                   // 等待时长（秒），仅 isWait=true 时有效
    ErrorCodeEnum failCode() default ErrorCodeEnum.OK;  // 获取锁失败时抛出的错误码

}
```

参数说明：

|  参数   |      说明 |
| :-----------: | :-----------: |
| `prefix` | 锁 Key 的固定前缀，便于按业务分类和排查 |
| `isWait` | false：获取不到锁立即失败；true：等待重试 |
| `waitTime` | 等待秒数，仅在 `isWait=true` 时生效 |
| `failCode` | 加锁失败时抛出的业务错误码  |

## 三、切面实现：LockAspect ##

```java
package com.trendinguse.cwcopen.novel.core.aspect;

import com.trendinguse.cwcopen.novel.core.annotation.Key;
import com.trendinguse.cwcopen.novel.core.annotation.Lock;
import com.trendinguse.cwcopen.novel.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.common.TemplateParserContext;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.concurrent.TimeUnit;

@Aspect
@Component
@RequiredArgsConstructor
public class LockAspect {

    private final RedissonClient redissonClient;

    private static final String KEY_PREFIX = "Lock";

    private static final String KEY_SEPARATOR = "::";

    @Around(value = "@annotation(com.trendinguse.cwcopen.novel.core.annotation.Lock)")
    @SneakyThrows
    public Object doAround(ProceedingJoinPoint joinPoint) {
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
        Method targetMethod = methodSignature.getMethod();
        Lock lock = targetMethod.getAnnotation(Lock.class);
        String lockKey = KEY_PREFIX + buildLockKey(lock.prefix(), targetMethod,
            joinPoint.getArgs());
        RLock rLock = redissonClient.getLock(lockKey);
        if (lock.isWait() ? rLock.tryLock(lock.waitTime(), TimeUnit.SECONDS) : rLock.tryLock()) {
            try {
                return joinPoint.proceed();
            } finally {
                rLock.unlock();
            }
        }
        throw new BusinessException(lock.failCode());
    }

    private String buildLockKey(String prefix, Method method, Object[] args) {
        StringBuilder builder = new StringBuilder();
        if (StringUtils.hasText(prefix)) {
            builder.append(KEY_SEPARATOR).append(prefix);
        }
        Parameter[] parameters = method.getParameters();
        for (int i = 0; i < parameters.length; i++) {

            if (parameters[i].isAnnotationPresent(Key.class)) {
                builder.append(KEY_SEPARATOR);                
                Key key = parameters[i].getAnnotation(Key.class);
                builder.append(parseKeyExpr(key.expr(), args[i]));
            }
        }
        return builder.toString();
    }

    private String parseKeyExpr(String expr, Object arg) {
        if (!StringUtils.hasText(expr)) {
            return arg.toString();
        }
        ExpressionParser parser = new SpelExpressionParser();
        Expression expression = parser.parseExpression(expr, new TemplateParserContext());
        return expression.getValue(arg, String.class);
    }

}
```

### 执行流程 ###

- 拦截：`@Around` 拦截所有带 `@Lock` 的方法
- 构建锁 Key：`buildLockKey` 根据 `prefix` 及带 `@Key` 的参数生成唯一 Key
- 加锁：根据 `isWait` 选择 `tryLock()` 或 `tryLock(waitTime, SECONDS)`
- 执行业务：加锁成功后执行 `proceed()`
- 解锁：在 `finally` 中调用 `unlock()`，确保异常时也会释放锁
- 失败处理：加锁失败时抛出 `BusinessException`，使用 `failCode`

### 锁 Key 规则 ###

最终格式：`Lock::prefix::param1::param2::...`。例如：

- `prefix = "order"`
- 参数 1：`@Key Long orderId → 123`
- 参数 2：`@Key(expr = "#{userId}") User user` → `10086`

则锁 Key 为：`Lock::order::123::10086`。

### SpEL 解析说明 ###

使用 `TemplateParserContext` 时，表达式需使用 `#{...}` 形式，例如：

- `@Key(expr = "#{id}")`：从参数对象中取 id 字段
- `@Key(expr = "#{userId}")`：取 userId 字段
- `expr` 为空：直接使用 `arg.toString()`

### 参数遍历与锁 Key 构建 ###

`buildLockKey` 负责遍历方法参数，将带 `@Key` 的参数值拼接成锁 `Key` 的一部分。核心代码如下：

```java
Parameter[] parameters = method.getParameters();
for (int i = 0; i < parameters.length; i++) {
    
    if (parameters[i].isAnnotationPresent(Key.class)) {
        builder.append(KEY_SEPARATOR);
        Key key = parameters[i].getAnnotation(Key.class);
        builder.append(parseKeyExpr(key.expr(), args[i]));
    }
}
return builder.toString();
```

流程解析：

- 获取参数元数据：`method.getParameters()` 返回 `Parameter[]`，与 `args[]` 下标一一对应，即 `parameters[i]` 对应 `args[i]`。

- 注解判断：`parameters[i].isAnnotationPresent(Key.class)` 判断第 `i` 个参数是否标注了 `@Key`，只有带 `@Key` 的参数才参与锁 Key 的生成。

- 逐参数处理：遍历每个参数，先追加 `KEY_SEPARATOR（::）`，保证各段之间用分隔符连接。

- 读取表达式：`parameters[i].getAnnotation(Key.class)` 获取 `@Key` 实例，通过 `key.expr()` 得到 SpEL 表达式（可能为空）。

- 解析并追加：`parseKeyExpr(key.expr(), args[i])` 以当前参数值 `args[i]` 为根对象，根据 `expr` 求值得到字符串，并追加到 `builder`。

- 返回值：最终 `builder` 形如 `::prefix::val1::val2`，与 `KEY_PREFIX` 拼接后得到完整锁 Key。

为何必须用 `parameters` 而非 `args` 判断注解？ 注解是编译期元数据，依附在方法参数的声明上，保存在字节码中；`args[]` 是运行时的实际参数值（普通 Java 对象）。运行时对象本身没有“参数声明”信息，无法通过 `args[i]` 得知它对应的是哪个参数、是否被标注了 `@Key`。只有通过反射获取的 Parameter 对象（`method.getParameters()`）才带有参数声明的元数据，因此必须用 `parameters[i].isAnnotationPresent(Key.class)` 来判断该参数是否使用了 `@Key`，而用 `args[i]` 仅作为求值时的根对象传给 `parseKeyExpr`。

### SpEL 解析流程 ###

`parseKeyExpr` 中 SpEL 的解析逻辑如下：

```java
private String parseKeyExpr(String expr, Object arg) {
    if (!StringUtils.hasText(expr)) {
        return arg.toString();
    }
    ExpressionParser parser = new SpelExpressionParser();
    Expression expression = parser.parseExpression(expr, new TemplateParserContext());
    return expression.getValue(arg, String.class);
}
```

- 空表达式：若 `expr` 为空，直接返回 `arg.toString()`，适用于简单类型（如 Long、String）。

- `TemplateParserContext` 作用：`TemplateParserContext` 默认以 `#{ 为前缀、}` 为后缀，会从 `expr` 中提取 `#{ 与 }` 之间的内容作为真正的 SpEL 表达式。例如 `expr = "#{userId}"` 时，实际参与解析的是 userId，而不是整个字符串。

- 解析阶段：`parseExpression(expr, new TemplateParserContext())` 会：

  - 识别 `#{ 和 }` 的边界；
  - 将中间部分 userId 解析为 SpEL 表达式；
  - 返回可复用的 Expression 对象。

- 求值阶段：`expression.getValue(arg, String.class)` 以 `arg` 为根对象`（root object）` 执行表达式：

  - `#{userId}` → 等价于 `arg.getUserId()` 或 `arg["userId"]`；
  - `#{id}` → 等价于 `arg.getId()`；
  - 支持链式访问，如 `#{order.userId}` 表示 `arg.getOrder().getUserId()`。

- 类型转换：`getValue(arg, String.class)` 的第二个参数表示期望的返回类型，SpEL 会将求值结果转为 String，便于拼接进锁 Key。

## 四、使用示例 ##

### 基于简单参数 ###

```java
@Lock(prefix = "book", failCode = ErrorCodeEnum.BOOK_ALREADY_BORROWED)
public void borrowBook(@Key Long bookId, @Key Long userId) {
    // 业务逻辑：借书
}
```

锁 Key：`Lock::book::123::10086`

### 基于对象与 SpEL ###

```java
public class OrderReq {
    private Long orderId;
    private Long userId;
    // getters / setters
}

@Lock(prefix = "order", isWait = true, waitTime = 5)
public void createOrder(@Key(expr = "#{orderId}") OrderReq req) {
    // 业务逻辑：创建订单
}
```

锁 Key：`Lock::order::10001`（从 `req.getOrderId()` 解析）

### 立即失败 ###

```java
@Lock(prefix = "inventory", failCode = ErrorCodeEnum.SYSTEM_BUSY)
public void deductStock(@Key Long productId) {
    // 获取不到锁立即抛出 BusinessException
}
```

## 五、依赖配置 ##

```xml
<!-- Redisson -->
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.17.7</version>
</dependency>

<!-- Spring AOP（通常已有） -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

## 六、注意事项 ##

- 锁粒度：尽量只对必要的业务范围加锁，避免锁 Key 过宽导致并发下降
- 异常与解锁：`finally` 中 `unlock()` 会保证方法结束时释放锁，异常也不会导致死锁
- 空值参数：带 `@Key` 的参数为 `null` 时，`arg.toString()` 会抛 NPE，建议对关键参数做非空校验
- SpEL 语法：使用 `TemplateParserContext` 时，`expr` 必须为 `#{...}` 形式
