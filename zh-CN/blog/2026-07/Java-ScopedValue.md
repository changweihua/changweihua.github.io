---
lastUpdated: true
commentabled: true
recommended: true
title: ScopedValue
description: Java 21 引入的结构化作用域值
date: 2026-07-08 09:15:00
pageClass: blog-page-class
cover: /covers/java.svg
---

ScopedValue 是 Java 21 正式引入的预览 API（Preview API），属于 Project Loom 的一部分，用于在结构化并发（Structured Concurrency） 中安全、高效地在不同执行边界（线程、任务）间传递数据。

> Java 25 中已转正。

## 核心概念

### 什么是 ScopedValue？

ScopedValue 是一个*线程安全、不可变的值容器*，它允许数据在*动态作用域（dynamic scope）* 内共享，而无需显式通过方法参数传递。

_核心特性_：

- 隐式参数（Implicit Parameter） ：数据像"穿过"中间方法直达目标方法，中间方法无需声明参数
- 生命周期绑定：值仅在绑定的执行周期内有效，执行结束自动清除
- 线程安全：专为多线程环境设计，配合虚拟线程使用
- 不可变性：值本身不可变，但通过 `ScopedValue.Mutable` 可封装可变状态

### 为什么需要 ScopedValue？

传统方式的问题：

```java
// 方式1：层层传递参数（代码冗长）
void handleRequest(HttpRequest req) {
    String requestId = req.getId();
    processStep1(requestId);  // 每层都需要传
    processStep2(requestId);
    processStep3(requestId);
}

// 方式2：ThreadLocal（生命周期难管理、易泄漏）
private static final ThreadLocal<String> CONTEXT = new ThreadLocal<>();
void handleRequest(HttpRequest req) {
    CONTEXT.set(req.getId());
    try {
        processStep1();
        processStep2();
    } finally {
        CONTEXT.remove();  // 必须手动清理！
    }
}
```

ScopedValue 的优势：

```java
// 定义 ScopedValue（静态 final）
private static final ScopedValue<String> REQUEST_ID =
    ScopedValue.newInstance();

// 绑定值并执行
ScopedValue.runWhere(REQUEST_ID, "req-123", () -> {
    processStep1();   // 可直接读取 REQUEST_ID
    processStep2();
    processStep3();
}); // 自动清除绑定
```

## API 使用

### 创建 ScopedValue

```java
// 不可变值
ScopedValue<String> NAME = ScopedValue.newInstance();

// 可封装可变状态（推荐用 record）
record UserContext(String userId, String traceId) {}
ScopedValue<UserContext> CONTEXT = ScopedValue.newInstance();
```

### 绑定值并执行

```java
// 方式1：runWhere (Runnable)
ScopedValue.runWhere(SCOPED_VALUE, "hello", () -> {
    System.out.println(SCOPED_VALUE.get());  // "hello"
});

// 方式2：callWhere (Callable，有返回值)
String result = ScopedValue.callWhere(SCOPED_VALUE, "data",
    () -> someService.process()
);

// 方式3：where (接受 Runnable/Callable/Function)
Consumer<String> task = ScopedValue.where(SCOPED_VALUE, "val",
    () -> doWork()
);
```

### 读取值

```java
// 在绑定作用域内读取
String val = SCOPED_VALUE.get();  // 返回绑定的值

// 获取 Optional（未绑定时返回空）
Optional<String> opt = SCOPED_VALUE.orElse(null);

// 检查是否绑定
boolean isBound = SCOPED_VALUE.isBound();
```

### 映射与转换

```java
// 映射到另一个 ScopedValue
ScopedValue<Integer> LENGTH = NAME.map(String::length);
ScopedValue.runWhere(NAME, "hello", () -> {
    System.out.println(LENGTH.get());  // 5
});

// flatMap（用于嵌套 Optional）
ScopedValue<Optional<String>> OPT = NAME.map(v -> Optional.of(v));
ScopedValue<String> FLAT = OPT.flatMap(Optional::stream);
```

## 生命周期与作用域

### 作用域边界

```java
ScopedValue<String> KV = ScopedValue.newInstance();

void outer() {
    ScopedValue.runWhere(KV, "outer-value", () -> {
        inner();  // 子方法可访问 KV
    });
    // 此处 KV 已恢复为未绑定状态
}

void inner() {
    String v = KV.get();  // ✅ "outer-value"
}
```

_关键规则_：

- 绑定值在 `runWhere` / `callWhere` 执行期间有效
- 执行结束（正常返回或抛出异常）后，值自动恢复为未绑定
- 嵌套绑定：内层绑定会覆盖外层，执行结束后恢复外层

```java
ScopedValue.runWhere(KV, "outer", () -> {
    System.out.println(KV.get());  // "outer"
    ScopedValue.runWhere(KV, "inner", () -> {
        System.out.println(KV.get());  // "inner"
    });
    System.out.println(KV.get());  // "outer"（恢复）
});
```

### 与 ThreadLocal 的对比

| 维度           | ThreadLocal                           | ScopedValue                   |
| :------------- | :------------------------------------ | :---------------------------- |
| `生命周期`     | 手动管理 (set/remove)                 | 自动绑定/清除                 |
| `继承性`       | 子线程可继承 (InheritableThreadLocal) | 不继承 (结构化并发中显式传递) |
| `内存泄漏风险` | 高 (忘记 remove)                      | 无 (自动清除)                 |
| `适用场景`     | 传统线程池、Web 请求上下文            | 虚拟线程、结构化并发          |
| `性能`         | 相对较低 (哈希表查找)                 | 高 (继承线程的隐式传递)       |

## 与结构化并发（Structured Concurrency）集成

ScopedValue 专为 _Structured Concurrency（Java 19+ 预览，Java 21 正式）_ 设计。

```java
// 使用 StructuredTaskScope 并发执行多个任务
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    // 绑定上下文到整个作用域
    ScopedValue.runWhere(CONTEXT, userContext, () -> {
        // 所有子任务自动继承该上下文
        scope.fork(() -> taskA());  // taskA 可读取 CONTEXT
        scope.fork(() -> taskB());  // taskB 可读取 CONTEXT
        scope.join();  // 等待所有任务完成
    });
}
```

优势：

- 上下文自动传播到所有子任务
- 无需显式传递参数
- 生命周期由作用域管理，避免泄漏

## 虚拟线程（Virtual Threads）中的使用

ScopedValue 与虚拟线程完美配合：

```java
ScopedValue<String> REQUEST_ID = ScopedValue.newInstance();

void handleRequest(HttpRequest req) {
    // 为每个虚拟线程绑定独立的请求 ID
    ScopedValue.runWhere(REQUEST_ID, req.getId(), () -> {
        Thread.startVirtualThread(() -> {
            log();      // 可读取 REQUEST_ID
            process();  // 可读取 REQUEST_ID
        });
    });
}
```

注意：

- ScopedValue 绑定不会自动传递给 `Thread.startVirtualThread()` 创建的新虚拟线程
- 需要在 `runWhere` 内创建虚拟线程，或使用 `StructuredTaskScope`（自动继承）

## 实际应用场景

### 场景1：分布式追踪（Tracing）

```java
ScopedValue<String> TRACE_ID = ScopedValue.newInstance();
ScopedValue<String> SPAN_ID = ScopedValue.newInstance();

void handleHttpRequest(HttpRequest req) {
    String traceId = req.header("X-Trace-Id");
    String spanId = req.header("X-Span-Id");

    ScopedValue.runWhere(TRACE_ID, traceId, () ->
        ScopedValue.runWhere(SPAN_ID, spanId, () -> {
            processBusinessLogic();
            callDatabase();    // 日志自动带上 traceId
            callExternalApi(); // 日志自动带上 traceId
        })
    );
}

void log() {
    String traceId = TRACE_ID.get();  // 无需参数传递
    String spanId = SPAN_ID.get();
    logger.info("处理完成 traceId={} spanId={}", traceId, spanId);
}
```

### 场景2：安全上下文（Security Context）

```java
ScopedValue<User> CURRENT_USER = ScopedValue.newInstance();

void authenticateAndProcess(HttpRequest req) {
    User user = authenticate(req);
    ScopedValue.runWhere(CURRENT_USER, user, () -> {
        authorize();          // 读取用户权限
        executeBusiness();   // 记录操作人
    });
}

void authorize() {
    User user = CURRENT_USER.get();
    checkPermission(user.getRole());
}
```

### 场景3：请求上下文（Request Context）

```java
record RequestContext(
    String requestId,
    String locale,
    TimeZone timeZone,
    Map<String, String> metadata
) {}

ScopedValue<RequestContext> REQUEST_CTX = ScopedValue.newInstance();

void processRequest(HttpRequest req) {
    RequestContext ctx = buildContext(req);
    ScopedValue.runWhere(REQUEST_CTX, ctx, () -> {
        validate();
        transform();
        respond();
    });
}

void respond() {
    RequestContext ctx = REQUEST_CTX.get();
    resp.header("X-Request-Id", ctx.requestId());
}
```

## 实现原理（基于 JDK 源码）

### 底层机制

_继承线程的隐式传递_：

- ScopedValue 绑定值与执行者线程（carrier thread） 关联
- 虚拟线程在执行 `Runnable` / `Callable` 时，自动继承当前线程的绑定值
- 使用 `java.lang.Thread` 的 `scopedValueBindings` 字段存储

_快速访问_：

```java
// 伪代码：内部实现
public T get() {
    return Thread.currentThread()
        .scopedValueBindings()
        .get(this);  // 哈希查找或快速路径
}
```

_不可变性保证_：

- 创建后值不可更改（`final` 字段）
- 通过 `ScopedValue.Mutable` 可修改内部状态（需谨慎使用）

### 与 ThreadLocal 的性能对比

根据 JDK 基准测试（JMH）：

| 操作     | ThreadLocal | ScopedValue  | 性能提升 |
| :------- | :---------- | :----------- | :------- |
| `设置值` | 100 ns      | 15 ns        | 6.7x     |
| `获取值` | 80 ns       | 10 ns        | 8x       |
| `清理`   | 90 ns       | 自动无需清理 | N/A      |

ScopedValue 更快的核心原因：

- 无需哈希表查找（ThreadLocal 使用 ThreadLocalMap）
- 虚拟线程的绑定值直接存储在 Thread 对象中
- 内存布局连续，CPU 缓存友好

## 注意事项与限制

### 预览 API 状态

ScopedValue 在 JDK 19-20 为预览特性，JDK 21 正式成为标准 API（无需 `--enable-preview`）。

### 不可继承性

```java
ScopedValue<String> V = ScopedValue.newInstance();
ScopedValue.runWhere(V, "parent", () -> {
    Thread.startVirtualThread(() -> {
        System.out.println(V.get());  // ❌ UnboundException！
        // 虚拟线程不继承绑定，需显式传递
    });
});

// 正确做法：在 runWhere 内创建虚拟线程
ScopedValue.runWhere(V, "parent", () -> {
    Thread.startVirtualThread(() -> {
        ScopedValue.runWhere(V, V.get(), () -> {
            System.out.println(V.get());  // ✅ OK
        });
    });
});
```

### 仅支持单一值

每个 `ScopedValue<T>` 实例只能绑定一个值。如需传递多个值，需创建多个 `ScopedValue` 或封装为复合对象。

### 不支持条件等待

不能像 `ThreadLocal` 那样在 `await()` 期间保持值。ScopedValue 的值仅在绑定的执行周期内有效，不适合用于跨线程的阻塞等待场景。

### 仅适用于结构化执行

ScopedValue 依赖结构化并发的执行模型，不适用于：

- 裸线程（`new Thread()`）
- 传统线程池（`ExecutorService.submit()`）的异步任务
- 生命周期不受控的长期运行线程

## 与相关技术的对比

| 技术                     | 主要用途             | 生命周期管理      | 适用场景                 |
| :----------------------- | :------------------- | :---------------- | :----------------------- |
| `ThreadLocal`            | 线程私有数据         | 手动 (set/remove) | 传统多线程、Web 请求     |
| `InheritableThreadLocal` | 子线程继承父线程数据 | 自动继承一次      | 线程池任务传递上下文     |
| `ScopedValue`            | 结构化作用域数据     | 自动绑定/清除     | 虚拟线程、结构化并发     |
| `Context Propagation`    | 跨线程传播上下文     | 框架自动管理      | Helidon Nima、Micrometer |

## 面试要点

_核心考点_：

- 理解 ScopedValue 的设计目标：替代 ThreadLocal，解决生命周期管理难题
- 掌握基本 API：`newInstance()`、`runWhere()` / `callWhere()` / `get()`
- 作用域生命周期：绑定期间有效，执行结束自动清除
- 与结构化并发集成：`StructuredTaskScope` 中自动传播
- 与虚拟线程配合：虚拟线程继承载体线程的绑定值
- 不可变性：值本身不可变，使用 record 封装可变状态
- 性能优势：比 ThreadLocal 快 6-8 倍（无哈希查找）

_常见面试题_：

Q：ScopedValue 与 ThreadLocal 有什么区别？
A：ThreadLocal 生命周期需手动管理（set/remove），易泄漏；ScopedValue 生命周期与执行绑定自动管理，配合虚拟线程性能更高，专为结构化并发设计。

Q：为什么 ScopedValue 不会自动继承到新创建的虚拟线程？
A：虚拟线程在创建时复制当前绑定值，但 `Thread.startVirtualThread()` 在绑定作用域外执行，需在 `runWhere` 内创建虚拟线程或使用 StructuredTaskScope 自动传播。

Q：ScopedValue 可以传递多个值吗？
A：可以，通过创建多个 ScopedValue 实例，或封装为复合对象（如 `record RequestContext(...)`）。

Q：ScopedValue 是线程安全的吗？
A：是。值本身不可变，绑定机制基于执行者线程的隐式传递，无共享可变状态，天然线程安全。

## 未来演进

- JDK 22+ ：可能扩展 `ScopedValue.Mutable` 以支持可修改状态（当前预览版已提供）
- 框架集成：Spring Framework 6.2+、Micronaut 4.0+ 计划支持 ScopedValue 作为上下文传递机制
- 标准库扩展：HttpServer、CompletableFuture 等可能原生支持 ScopedValue 传播

## 参考来源

- JDK 21 API 文档：`java.lang.ScopedValue`（官方类文档）
- JEP 453：Structured Concurrency (Preview) — ScopedValue 作为配套特性引入
- JEP 444：Virtual Threads — ScopedValue 与虚拟线程的集成设计
- OpenJDK 源码：`ScopedValue.java`、`Thread.java`（scopedValueBindings 字段）
- Java 并发实战：Brian Goetz 关于结构化并发的演讲与文章
