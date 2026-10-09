---
lastUpdated: true
commentabled: true
recommended: true
title: Semaphore 与 RateLimiter
description: 并发控制双雄详解
date: 2026-09-30 09:35:00
pageClass: blog-page-class
cover: /covers/java.svg
---

> 面向生产实践的并发控制知识总结。核心结论：*Semaphore 管"同时有多少个"（并发数），RateLimiter 管"每秒有多少次"（速率）*。两者不是竞争关系，而是互补关系。

## Semaphore 与 RateLimiter 的区别 ##

### 一句话理解 ###

*Semaphore（信号量）*：停车场模型。10 个车位，第 11 辆车在门口等，直到有车出来。车在里面停多久都不影响"10 个并发"这个约束。
*RateLimiter（限流器，Guava）*：地铁闸机模型。每秒只放 10 个人进去，不管里面现在有多少人。人进去之后干什么它不管。

### 核心对比 ###

| 维度 | `java.util.concurrent.Semaphore` | `com.google.common.util.concurrent.RateLimiter` |
| :--- | :--- | :--- |
| 控制对象 | 并发数（同一时刻允许多少个线程同时执行） | 速率（单位时间内允许多少次操作） |
| 计量单位 | 许可数量（permits），无量纲 | QPS / permits per second |
| 时间因素 | 与时间无关，任务执行多久都行，只要没超过并发数 | 强时间相关，令牌按速率持续发放 |
| 算法本质 | 计数器（基于 AQS 实现，`acquire`/`release` 增减） | 令牌桶（Token Bucket）：SmoothBursty / SmoothWarmingUp |
| 许可归还 | 必须手动 `release()`，否则许可泄漏 | 不需要归还，令牌随时间自动恢复 |
| 阻塞行为 | 许可不足时阻塞（支持中断 / 超时 / 非阻塞尝试） | 超过速率时阻塞等待（或 `tryAcquire(timeout)`） |
| 突发处理 | 有多少空闲许可就能瞬间放多少 | SmoothBursty 允许攒令牌突发，SmoothWarmingUp 预热缓升 |
| 作用范围 | 单 JVM（分布式需分布式信号量） | 单 JVM（分布式需 Redis/Sentinel 等） |

### 一个关键差异场景 ###

假设每个任务执行 1 秒：

- `Semaphore(10)`：稳态吞吐"恰好"是 10 QPS，但这只是结果不是约束——任务一旦变快，吞吐立刻升高。
- `RateLimiter.create(10)`：不管任务快慢，强制不超过 10 QPS。

```java
// Semaphore：控制"同时有 10 个请求在飞"
Semaphore semaphore = new Semaphore(10);
semaphore.acquire();
try {
    callDownstream();      // 执行 1 秒还是 1 分钟都可以
} finally {
    semaphore.release();   // 必须归还
}

// RateLimiter：控制"每秒最多发出 10 个请求"
RateLimiter limiter = RateLimiter.create(10.0);
limiter.acquire();         // 可能阻塞等待令牌，无需归还
callDownstream();
```

### 使用场景选型 ###

*用 Semaphore（保护资源容量）*：

- 限制对有限资源的并发访问：数据库连接、外部服务在途请求数、文件句柄
- 约束耗时任务的并发度：批量任务"最多同时跑 N 个"，防止打满下游
- 轻量级资源池（无需真正持有资源实体）

*用 RateLimiter（保护速率配额）*：

- 对接有 QPS 限制的外部接口：第三方开放平台限流 100 QPS，本地提前削峰，避免被拒绝
- 平滑突发流量：定时任务瞬间产生上万请求，匀速发出
- 日志/采样输出：限制错误日志每秒最多打 N 条

*组合使用（生产常见）*：

```java
RateLimiter limiter = RateLimiter.create(50);   // 对下游限速 50 QPS
Semaphore semaphore = new Semaphore(20);         // 本地最多 20 个在途请求

limiter.acquire();        // 先过速率关
semaphore.acquire();      // 再过并发关
try {
    return client.call(request);
} finally {
    semaphore.release();
}
```

## Semaphore 的实现原理 ##

### 整体结构 ###

JDK 的 `java.util.concurrent.Semaphore` 完全构建在 AQS（AbstractQueuedSynchronizer） 之上：

```txt
Semaphore
 └── Sync extends AbstractQueuedSynchronizer   // 核心：state 表示剩余许可数
      ├── NonfairSync                          // 非公平（默认）
      └── FairSync                             // 公平
```

- `state` 字段：AQS 中的 int state 被复用为"当前剩余许可数量"。
- `acquire()`：尝试通过 CAS 扣减 state；失败则进入 CLH 等待队列（`doAcquireSharedInterruptibly`），以共享模式挂起（`LockSupport.park`）。
- `release()`：CAS 增加 `state`，成功后唤醒队列头部的等待节点（`unparkSuccessor`）。
- 共享模式：一个线程释放许可后，可以唤醒多个等待者（如果许可足够），这与独占锁不同。

### 核心流程（简化源码） ###

```java
// 获取许可（共享模式）
protected int tryAcquireShared(int acquires) {
    for (;;) {
        int available = getState();
        int remaining = available - acquires;
        // remaining < 0 表示许可不足，返回负数 → 进入排队流程
        if (remaining < 0 || compareAndSetState(available, remaining))
            return remaining;
    }
}

// 释放许可
protected boolean tryReleaseShared(int releases) {
    for (;;) {
        int current = getState();
        int next = current + releases;
        if (compareAndSetState(current, next))
            return true;
    }
}
```

### 公平与非公平 ###

| 模式 | 获取策略 | 特点 |
| :--- | :--- | :--- |
| 非公平（默认） | 直接 CAS 抢占，失败才排队 | 吞吐高，但可能“饿死”排队久的线程 |
| 公平 | 先检查 `hasQueuedPredecessors()`，有人排队就不插队 | 严格 FIFO，吞吐略低 |

```java
new Semaphore(10);          // 非公平
new Semaphore(10, true);    // 公平
```

### 常用 API ###

| API | 说明 |
| :--- | :--- |
| `acquire()` / `acquire(n)` | 阻塞获取，可响应中断 |
| `acquireUninterruptibly()` | 阻塞获取，不响应中断 |
| `tryAcquire()` | 立即返回，拿不到不阻塞 |
| `tryAcquire(timeout, unit)` | 限时等待 |
| `release()` / `release(n)` | 归还许可（可以归还比获取更多的数量，许可可被“制造”） |
| `availablePermits()` | 当前剩余许可 |
| `getQueueLength()` | 排队等待的线程数（监控用） |
| `drainPermits()` | 一次性拿走所有剩余许可 |

## Semaphore 的作用与优势 ##

### 作用 ###

- 并发度控制：限制同时访问某资源的线程数（最核心用途）。
- 资源池化：作为轻量信号量版的"资源池"，不必真正持有资源实体。
- 背压（Backpressure）：在"生产快、消费慢"的链路中，让上游主动降速等待，而不是无限堆积任务。

### 优势 ###

- 轻量：仅一个 int 计数器 + 等待队列，无需创建/管理真实资源对象。
- 灵活：公平/非公平、可中断、可超时、批量获取释放（`acquire(n)`）一应俱全。
- 解耦：资源使用方与资源实体解耦——许可数甚至可以设置得与实际资源数不同（如适度超卖，或纯做并发闸门而无对应实体）。
- 可观测：`availablePermits()`、`getQueueLength()` 天然支持运行状态监控。

### 与 synchronized / Lock 的定位差异 ###

| 工具 | 语义 |
| :--- | :--- |
| `synchronized` / `ReentrantLock` | 互斥：最多 1 个线程进入 |
| `Semaphore` | 计数：最多 N 个线程进入 |
| `RateLimiter` | 速率：每秒最多 N 次 |

Semaphore 是互斥锁的泛化（permits = 1 时退化为互斥锁，但通常不用它做互斥）。

## 实际代码开发中的应用案例 ##

### 案例 1：通用对象池（Semaphore + 无锁队列） ###

经典模式：Semaphore 负责"准入计数"，队列负责"实体存取"，两者配合构成一个线程安全的资源池。

```java
public class ObjectPool<T> {
    private final Semaphore semaphore;
    private final ConcurrentLinkedQueue<T> pool = new ConcurrentLinkedQueue<>();

    public ObjectPool(List<T> resources) {
        pool.addAll(resources);
        // 许可数 = 资源数，保证"拿到许可必有资源"
        this.semaphore = new Semaphore(resources.size());
    }

    public T borrow(long timeout, TimeUnit unit) throws InterruptedException {
        if (!semaphore.tryAcquire(timeout, unit)) {
            throw new TimeoutException("借用资源超时");
        }
        return pool.poll();   // 拿到许可则必然非空
    }

    public void giveBack(T resource) {
        pool.offer(resource);
        semaphore.release();
    }
}
```

### 案例 2：批处理工具的并发闸门（生产实践） ###

背景：一个通用批处理工具把大列表切分成批次并发执行（如 10 万工号按 500/批拆成 200 个 `IN` 查询）。原始实现每次调用新建线程池，多请求并发时线程数与数据库连接占用按"请求数 × 线程池大小"放大，存在打爆连接池的风险。

改造方案：共享线程池收敛线程总数 + Semaphore 作为全局并发闸门，将在飞批次数钳制在连接池预算之内。

```java
public class BatchProcessUtil {

    /** 全 JVM 同时执行的最大批次数，须小于数据库连接池容量的一部分 */
    private static final int MAX_CONCURRENT_BATCHES = 8;

    /** 全局并发闸门：限制所有调用方合计的在飞批次数 */
    private static final Semaphore BATCH_CONCURRENCY_GATE =
            new Semaphore(MAX_CONCURRENT_BATCHES);

    /** JVM 级共享线程池，杜绝每次调用建池/销池 */
    private static final ExecutorService SHARED_EXECUTOR = new ThreadPoolExecutor(
            MAX_CONCURRENT_BATCHES, MAX_CONCURRENT_BATCHES * 2,
            60L, TimeUnit.SECONDS, new ArrayBlockingQueue<>(512),
            new ThreadPoolExecutor.CallerRunsPolicy());

    private static <T, R> List<R> runWithGate(List<T> batch,
                                              Function<List<T>, List<R>> processor) {
        try {
            BATCH_CONCURRENCY_GATE.acquire();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("等待并发许可时被中断", e);
        }
        try {
            return processor.apply(batch);   // 一个批次 ≈ 占用一个数据库连接
        } finally {
            BATCH_CONCURRENCY_GATE.release(); // 必须归还
        }
    }

    public static <T, R> List<R> batchProcess(List<T> dataList, int batchSize,
                                              Function<List<T>, List<R>> processor) {
        List<List<T>> batches = Lists.partition(dataList, batchSize);
        List<CompletableFuture<List<R>>> futures = batches.stream()
                .map(batch -> CompletableFuture.supplyAsync(
                        () -> runWithGate(batch, processor), SHARED_EXECUTOR))
                .collect(Collectors.toList());
        return futures.stream()
                .map(CompletableFuture::join)
                .flatMap(List::stream)
                .collect(Collectors.toList());
    }
}
```

#### 为什么线程池还不够、还要加 Semaphore？ ####

- 线程池只约束"本池的线程数"，若存在多个池（或多处各自建池），总量失控；
- Semaphore 是跨池、跨调用方的全局闸门，其许可数可以直接对齐下游资源容量（如连接池大小），语义更贴近"要保护的东西"；
- 线程可以比许可多：拿不到许可的线程只是阻塞等待，不占用数据库连接。

### 案例 3：爬虫 / 批量任务的并发度约束 ###

任务提交端不关心速率，只关心"同时最多 5 个任务在跑"：

```java
Semaphore concurrency = new Semaphore(5);
ExecutorService executor = Executors.newFixedThreadPool(5);

for (String url : urls) {
    executor.submit(() -> {
        try {
            concurrency.acquire();
            crawl(url);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            concurrency.release();
        }
    });
}
```

### 案例 4：页面聚合查询（并行调用多个下游） ###

商品详情页需要同时查库存、价格、物流，限制对下游服务总体的在途请求数：

```java
private static final Semaphore DOWNSTREAM_GATE = new Semaphore(32);

CompletableFuture<Stock> stock = supplyWithGate(() -> stockService.query(skuId));
CompletableFuture<Price> price = supplyWithGate(() -> priceService.query(skuId));
CompletableFuture<Logistics> logistics = supplyWithGate(() -> logisticsService.query(skuId));
CompletableFuture.allOf(stock, price, logistics).get(3, TimeUnit.SECONDS);

private static <T> CompletableFuture<T> supplyWithGate(Supplier<T> supplier) {
    return CompletableFuture.supplyAsync(() -> {
        DOWNSTREAM_GATE.acquireUninterruptibly();
        try {
            return supplier.get();
        } finally {
            DOWNSTREAM_GATE.release();
        }
    }, bizExecutor);
}
```

### 案例 5：用 Semaphore 模拟限流（了解边界） ###

配合定时任务"补许可"，Semaphore 也可以实现粗粒度限速：

```java
Semaphore quota = new Semaphore(0);
scheduler.scheduleAtFixedRate(() -> {
    int missing = 100 - quota.availablePermits();
    if (missing > 0) quota.release(missing);   // 每秒补到 100
}, 0, 1, TimeUnit.SECONDS);

quota.acquire();   // 用完本秒配额则阻塞到下一秒
doRequest();       // 无需归还（配额由定时任务回收）
```

> 注意：这只是演示原理。真正的平滑限流请使用 Guava RateLimiter（令牌桶、平滑突发、预热支持），上述写法存在突发不均匀的问题。

## 最佳实践与常见陷阱 ##

- `release()` 必须放在 `finally`：异常路径漏归还 = 许可永久泄漏，系统会越跑越慢，最终全部线程阻塞。
- 许可数要对齐下游资源容量：若 Semaphore 保护的是数据库连接，许可数应 ≤ 连接池容量（建议取其 1/3～1/2，给其他业务留余量）。许可数 > 连接数时，线程会拿到许可却在"等连接"处阻塞，闸门形同虚设。
- 正确响应中断：`acquire()` 抛 InterruptedException 后，要么继续抛出，要么 `Thread.currentThread().interrupt()` 恢复中断标志，不要静默吞掉。
- 警惕嵌套获取导致死锁：持有许可 A 的过程中再去获取许可 B，若全局获取顺序不一致，可能死锁；尽量保持"获取—使用—归还"的短生命周期。
- 单机限制：Semaphore 与 Guava RateLimiter 都只在单 JVM 内生效。分布式场景需要 Redis + Lua、Sentinel 或分布式信号量方案。
- 监控建议：把 `availablePermits()` 和 `getQueueLength()` 暴露到监控面板，排队长度持续上涨是容量不足的先行指标。

## 总结 ##

| 问题 | 选型 |
| :--- | :--- |
| 怕同时挤的人太多把资源压垮 | Semaphore（管并发） |
| 怕单位时间请求太频繁触发限流/配额 | RateLimiter（管速率） |
| 既要控速率又要控在途数 | 两者组合：先限流、再限并发 |

Semaphore 的本质是 AQS 共享模式上的一个*可中断、可超时、可公平排队的计数器*。它不创造资源，只回答一个问题："现在还能进去几个？"——把这个问题的答案对准你最想保护的资源容量，就是它最好的用法。
