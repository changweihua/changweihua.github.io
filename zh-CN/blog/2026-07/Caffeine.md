---
lastUpdated: true
commentabled: true
recommended: true
title: 彻底搞懂本地缓存之王-Caffeine
description: 彻底搞懂本地缓存之王-Caffeine
date: 2026-07-09 12:15:00
pageClass: blog-page-class
cover: /covers/java.svg
---

本文基于 Caffeine 3.2.0 讨论。

Maven 依赖：

```xml
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
    <version>3.2.0</version>
</dependency>
```

## 先给结论

Caffeine 里最容易混淆的三个时间配置是：

- `expireAfterWrite`
- `expireAfterAccess`
- `refreshAfterWrite`

它们都和时间有关，但语义不是一回事。

- `expireAfterWrite` = 写入后多久过期，读不会续命
- `expireAfterAccess` = 访问后多久过期，读写都会续命
- `refreshAfterWrite` = 写入后多久允许刷新，不等于过期

如果再加上 `AsyncLoadingCache`，可以这样理解：

- `LoadingCache` = 缓存 `miss` 时当前线程同步加载
- `AsyncLoadingCache` = 缓存 `miss` 时立即返回 `CompletableFuture`，异步加载

一个非常重要的区别是：

- `expire` 会让旧值不可见
- `refresh` 会让旧值继续可用，同时后台刷新

也就是说，`expireAfterWrite` 和 `expireAfterAccess` 是“过期策略”，而 `refreshAfterWrite` 是“刷新策略”。

## 几个基础概念

### 过期不等于立刻物理删除

Caffeine 的 `entry` 到期后，会对读操作不可见。但它不一定在到期那一刻立刻从内部结构中物理移除。

所以不要只用：

```java
cache.estimatedSize();
```

来判断一个 `key` 是否已经过期。更准确的是看：

```java
cache.getIfPresent(key);
```

或者 `LoadingCache.get(key)` 是否触发重新加载。

### `LoadingCache` 的第一次加载是同步的

例如：

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .expireAfterWrite(30, TimeUnit.MINUTES)
        .build(this::getFromRedis);

String value = cache.get("A");
```

如果本地没有 `A`，当前线程会同步调用 `getFromRedis("A")`，并等待它返回。

### refreshAfterWrite 的刷新是异步的

例如：

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .refreshAfterWrite(30, TimeUnit.MINUTES)
        .build(this::getFromRedis);
```

当 `A` 已经有值，并且超过 `30` 分钟后再次访问：

1. 先返回旧值
2. 再异步调用 loader 刷新
3. 刷新成功后，新值替换旧值

注意：`refreshAfterWrite` 不是定时任务。不是 30 分钟一到就自动刷新，而是 30 分钟后“具备刷新资格”，下一次访问才触发刷新。

## 本文的调试工具

为了不用真的等待 30 分钟，可以用 Caffeine 的 `Ticker` 手动推进时间。

下面这个工具类可以在后面的示例里复用：

```java
import com.github.benmanes.caffeine.cache.Ticker;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

public final class ManualTicker implements Ticker {
    private final AtomicLong nanos = new AtomicLong();

    @Override
    public long read() {
        return nanos.get();
    }

    public void advance(long time, TimeUnit unit) {
        nanos.addAndGet(unit.toNanos(time));
    }
}
```

再准备一个模拟 Redis 的 loader：

```java
import java.util.concurrent.atomic.AtomicInteger;

public final class LoaderSupport {
    private final AtomicInteger count = new AtomicInteger();

    public String load(String key) {
        int version = count.incrementAndGet();
        System.out.println(Thread.currentThread().getName()
                + " load " + key + " -> v" + version);
        return "v" + version;
    }

    public String slowLoad(String key) {
        sleep(1500);
        return load(key);
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

## 只有 expireAfterWrite

_配置_：

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .expireAfterWrite(5, TimeUnit.MINUTES)
        .build(loader::load);
```

_语义_：

- 从写入成功开始计时。
- 超过 5 分钟后过期。
- 读操作不会续命。

_验证代码_：

```java
ManualTicker ticker = new ManualTicker();
LoaderSupport loader = new LoaderSupport();

LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .expireAfterWrite(5, TimeUnit.MINUTES)
        .build(loader::load);

System.out.println(cache.get("A")); // 第一次 miss，同步加载 v1

ticker.advance(4, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 未过期，还是 v1

ticker.advance(2, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 距离写入已 6 分钟，过期，同步加载 v2
```

_预期输出类似_：

```text
main load A -> v1
v1
v1
main load A -> v2
v2
```

_结论_：

- `expireAfterWrite` 是固定 TTL。
- 读不会续命。
- 到期后旧值不可见。
- `LoadingCache.get` 会同步重新加载。

_适合场景_：

- 商品价格缓存 5 分钟
- 业务配置缓存 1 分钟
- 权限规则缓存 10 分钟

只要你想表达“这个值最多只能旧这么久”，就适合用 `expireAfterWrite`。

## 只有 expireAfterAccess

_配置_：

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .expireAfterAccess(5, TimeUnit.MINUTES)
        .build(loader::load);
```

_语义_：

- 从最近一次读或写开始计时。
- 超过 5 分钟没有访问，才会过期。
- 每次读取都会续命。

_验证代码_：

```java
ManualTicker ticker = new ManualTicker();
LoaderSupport loader = new LoaderSupport();

LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .expireAfterAccess(5, TimeUnit.MINUTES)
        .build(loader::load);

System.out.println(cache.get("A")); // v1

ticker.advance(4, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // v1，这次读取会续命

ticker.advance(4, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 仍然是 v1，因为距离上次访问才 4 分钟

ticker.advance(6, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 超过 5 分钟未访问，同步加载 v2
```

_预期输出类似_：

```text
main load A -> v1
v1
v1
v1
main load A -> v2
v2
```

_结论_：

- expireAfterAccess 是空闲 TTL。
- 只要一直被访问，就可以一直续命。
- 热点 key 可能长期存在。

_适合场景_：

- 用户会话
- 临时上下文
- 低频数据自动释放

如果你的诉求是“没人用就清掉”，优先考虑 `expireAfterAccess`。

## 只有 refreshAfterWrite

_配置_：

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .executor(refreshExecutor)
        .refreshAfterWrite(5, TimeUnit.MINUTES)
        .build(loader::slowLoad);
```

_语义_：

- 从写入成功开始计时。
- 超过 5 分钟后，不是过期，而是具备刷新资格。
- 下一次访问时，先返回旧值，再异步刷新。

_验证代码_：

```java
ManualTicker ticker = new ManualTicker();
LoaderSupport loader = new LoaderSupport();

ExecutorService refreshExecutor = Executors.newSingleThreadExecutor(r -> {
    Thread thread = new Thread(r);
    thread.setName("caffeine-refresh");
    return thread;
});

LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .executor(refreshExecutor)
        .refreshAfterWrite(5, TimeUnit.MINUTES)
        .build(loader::slowLoad);

long firstStart = System.currentTimeMillis();
System.out.println(cache.get("A"));
System.out.println("first cost = " + (System.currentTimeMillis() - firstStart) + " ms");

ticker.advance(6, TimeUnit.MINUTES);

long refreshStart = System.currentTimeMillis();
System.out.println(cache.get("A"));
System.out.println("refresh trigger cost = " + (System.currentTimeMillis() - refreshStart) + " ms");

Thread.sleep(2000);
System.out.println(cache.get("A"));

refreshExecutor.shutdown();
```

_预期输出类似_：

```text
main load A -> v1
v1
first cost = 1505 ms

v1
refresh trigger cost = 2 ms
caffeine-refresh load A -> v2

v2
```

_结论_：

- 第一次 miss：同步加载。
- 已有旧值且超过 refresh 时间：立即返回旧值，后台异步刷新。
- refreshAfterWrite 本身不会让值因为时间到了而消失。

只有 `refreshAfterWrite` 时，一个 key 第一次成功加载后，通常会长期存在，除非发生下面这些情况：

- 达到 maximumSize 后被淘汰
- 手动 invalidate
- JVM 重启
- loader/reload 返回 null
- 弱引用/软引用导致回收

## refreshAfterWrite 下 loader 返回 null 或抛异常会怎样

这是很多业务缓存容易忽略的点。

### refresh 抛异常

刷新异常时，Caffeine 会保留旧值。

示例：

```java
ManualTicker ticker = new ManualTicker();

LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .refreshAfterWrite(1, TimeUnit.MINUTES)
        .build(new CacheLoader<String, String>() {
            @Override
            public String load(String key) {
                return "v1";
            }

            @Override
            public String reload(String key, String oldValue) {
                throw new RuntimeException("redis timeout");
            }
        });

System.out.println(cache.get("A")); // v1

ticker.advance(2, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 先返回旧值 v1，并触发刷新

Thread.sleep(500);
System.out.println(cache.getIfPresent("A")); // 仍然是 v1
```

结论：

- refresh 异常不会让旧值消失。
- 旧值会继续作为兜底值保留。

### refresh 返回 null

如果 reload 返回 null，mapping 可能会被移除。

示例：

```java
ManualTicker ticker = new ManualTicker();

ExecutorService refreshExecutor = Executors.newSingleThreadExecutor();

LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .executor(refreshExecutor)
        .refreshAfterWrite(1, TimeUnit.MINUTES)
        .build(new CacheLoader<String, String>() {
            @Override
            public String load(String key) {
                return "v1";
            }

            @Override
            public String reload(String key, String oldValue) {
                return null;
            }
        });

System.out.println(cache.get("A")); // v1

ticker.advance(2, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 先返回旧值 v1，后台刷新返回 null

Thread.sleep(500);
System.out.println(cache.getIfPresent("A")); // null

refreshExecutor.shutdown();
```

结论：

- 如果你希望 Redis 查不到时继续保留本地旧值，不要让 reload 返回 null。
- 可以在 reload 中返回 oldValue 作为兜底。

更稳妥的写法：

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .refreshAfterWrite(30, TimeUnit.MINUTES)
        .build(new CacheLoader<String, String>() {
            @Override
            public String load(String key) {
                return getFromRedis(key);
            }

            @Override
            public String reload(String key, String oldValue) {
                String newValue = getFromRedis(key);
                return newValue == null ? oldValue : newValue;
            }
        });
```

## expireAfterWrite + expireAfterAccess

配置：

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .expireAfterWrite(10, TimeUnit.MINUTES)
        .expireAfterAccess(3, TimeUnit.MINUTES)
        .build(loader::load);
```

语义：

- 两个过期条件同时生效。
- 谁先到期，谁让旧值不可见。

### 场景 1：因为 access 空闲时间过期

```java
ManualTicker ticker = new ManualTicker();
LoaderSupport loader = new LoaderSupport();

LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .expireAfterWrite(10, TimeUnit.MINUTES)
        .expireAfterAccess(3, TimeUnit.MINUTES)
        .build(loader::load);

System.out.println(cache.get("A")); // v1

ticker.advance(2, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // v1，访问续命

ticker.advance(4, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 距离上次访问 4 分钟，因 access 过期，加载 v2
```

### 场景 2：即使一直访问，也会因为 write 时间过期

```java
ManualTicker ticker = new ManualTicker();
LoaderSupport loader = new LoaderSupport();

LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .expireAfterWrite(10, TimeUnit.MINUTES)
        .expireAfterAccess(3, TimeUnit.MINUTES)
        .build(loader::load);

System.out.println(cache.get("A")); // v1

for (int i = 0; i < 4; i++) {
    ticker.advance(2, TimeUnit.MINUTES);
    System.out.println(cache.get("A")); // 每 2 分钟访问一次，不会触发 access 过期
}

ticker.advance(2, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 距离首次写入已 10 分钟，因 write 过期，加载 v2
```

结论：

- expireAfterAccess 控制“闲置多久清理”。
- expireAfterWrite 控制“最多存活多久”。
- 两个一起用，就是既限制闲置时间，也限制最大存活时间。

## expireAfterWrite + refreshAfterWrite

配置：

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .executor(refreshExecutor)
        .refreshAfterWrite(2, TimeUnit.MINUTES)
        .expireAfterWrite(10, TimeUnit.MINUTES)
        .build(loader::slowLoad);
```

语义：

- 2 分钟后，访问可以触发异步刷新。
- 10 分钟后，如果值还没有被成功替换，旧值过期不可见。

### 场景 1：在过期前访问，触发异步刷新

```java
ManualTicker ticker = new ManualTicker();
LoaderSupport loader = new LoaderSupport();

ExecutorService refreshExecutor = Executors.newSingleThreadExecutor(r -> {
    Thread thread = new Thread(r);
    thread.setName("caffeine-refresh");
    return thread;
});

LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .executor(refreshExecutor)
        .refreshAfterWrite(2, TimeUnit.MINUTES)
        .expireAfterWrite(10, TimeUnit.MINUTES)
        .build(loader::slowLoad);

System.out.println(cache.get("A")); // v1

ticker.advance(3, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 返回旧值 v1，同时异步刷新

Thread.sleep(2000);
System.out.println(cache.get("A")); // v2

refreshExecutor.shutdown();
```

预期行为：

- 3 分钟时，超过 refreshAfterWrite，但没有超过 expireAfterWrite。
- 所以旧值还能返回，刷新在后台执行。

### 场景 2：长时间没人访问，超过 expireAfterWrite

```java
ManualTicker ticker = new ManualTicker();
LoaderSupport loader = new LoaderSupport();

LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .refreshAfterWrite(2, TimeUnit.MINUTES)
        .expireAfterWrite(10, TimeUnit.MINUTES)
        .build(loader::load);

System.out.println(cache.get("A")); // v1

ticker.advance(11, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 旧值已过期，同步加载 v2
```

结论：

- refreshAfterWrite 必须被访问触发。
- 如果访问发生在 refresh 时间之后、expire 时间之前，走异步刷新。
- 如果访问发生在 expire 时间之后，旧值不可见，走同步加载。

更常见的配置是：

```java
.refreshAfterWrite(5, TimeUnit.MINUTES)
.expireAfterWrite(30, TimeUnit.MINUTES)
```

含义是：

- 正常情况下用后台刷新降低延迟。
- 如果长时间没人访问，或者刷新长期失败，最多 30 分钟后旧值过期。

不建议这样配：

```java
.refreshAfterWrite(30, TimeUnit.MINUTES)
.expireAfterWrite(5, TimeUnit.MINUTES)
```

因为 5 分钟就过期了，大概率等不到 30 分钟后的 refresh 发挥作用。

## expireAfterAccess + refreshAfterWrite

配置：

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .executor(refreshExecutor)
        .refreshAfterWrite(2, TimeUnit.MINUTES)
        .expireAfterAccess(5, TimeUnit.MINUTES)
        .build(loader::slowLoad);
```

语义：

- 活跃 key 会被定期异步刷新。
- 超过 5 分钟没人访问的 key 会过期清理。

### 场景 1：活跃访问触发 refresh

```java
ManualTicker ticker = new ManualTicker();
LoaderSupport loader = new LoaderSupport();

ExecutorService refreshExecutor = Executors.newSingleThreadExecutor(r -> {
    Thread thread = new Thread(r);
    thread.setName("caffeine-refresh");
    return thread;
});

LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .executor(refreshExecutor)
        .refreshAfterWrite(2, TimeUnit.MINUTES)
        .expireAfterAccess(5, TimeUnit.MINUTES)
        .build(loader::slowLoad);

System.out.println(cache.get("A")); // v1

ticker.advance(3, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 返回旧值 v1，触发异步刷新，同时 access 续命

Thread.sleep(2000);
System.out.println(cache.get("A")); // v2

refreshExecutor.shutdown();
```

### 场景 2：冷数据因为 access 过期

```java
ManualTicker ticker = new ManualTicker();
LoaderSupport loader = new LoaderSupport();

LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .refreshAfterWrite(2, TimeUnit.MINUTES)
        .expireAfterAccess(5, TimeUnit.MINUTES)
        .build(loader::load);

System.out.println(cache.get("A")); // v1

ticker.advance(6, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 已经 6 分钟没访问，旧值过期，同步加载 v2
```

结论：

- 有人用，就后台刷新，尽量保持新。
- 没人用，就过期清理，释放内存。

这个组合适合：

- 用户维度缓存
- 活动配置缓存
- 业务字典缓存
- 热点数据局部活跃的场景

## expireAfterWrite + expireAfterAccess + refreshAfterWrite

配置：

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .executor(refreshExecutor)
        .refreshAfterWrite(2, TimeUnit.MINUTES)
        .expireAfterAccess(5, TimeUnit.MINUTES)
        .expireAfterWrite(30, TimeUnit.MINUTES)
        .build(loader::slowLoad);
```

三条规则同时存在：

- refreshAfterWrite：值旧了，但还能先用旧值，同时后台刷新。
- expireAfterAccess：值没人用了，就过期清理。
- expireAfterWrite：值不能无限旧，最多只能存活这么久。

验证代码：

```java
ManualTicker ticker = new ManualTicker();
LoaderSupport loader = new LoaderSupport();

ExecutorService refreshExecutor = Executors.newSingleThreadExecutor(r -> {
    Thread thread = new Thread(r);
    thread.setName("caffeine-refresh");
    return thread;
});

LoadingCache<String, String> cache = Caffeine.newBuilder()
        .ticker(ticker)
        .executor(refreshExecutor)
        .refreshAfterWrite(2, TimeUnit.MINUTES)
        .expireAfterAccess(5, TimeUnit.MINUTES)
        .expireAfterWrite(30, TimeUnit.MINUTES)
        .build(loader::slowLoad);

System.out.println(cache.get("A")); // v1

ticker.advance(3, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // v1，触发异步刷新，access 续命

Thread.sleep(2000);
System.out.println(cache.get("A")); // v2

ticker.advance(6, TimeUnit.MINUTES);
System.out.println(cache.get("A")); // 超过 access 空闲时间，加载 v3

refreshExecutor.shutdown();
```

结论：

- 如果 key 很热：
  - 读请求会不断重置 expireAfterAccess。
  - 超过 refreshAfterWrite 后，读请求触发异步刷新。
  - 刷新成功后，写入时间会重置。

- 如果 key 很冷：
  - 没人访问，不会触发 refresh。
  - 超过 expireAfterAccess 后过期。

- 如果 refresh 长期失败：
  - refresh 异常会保留旧值。
  - 但 expireAfterWrite 到期后，旧值最终不可见。

这个组合适合对稳定性要求比较高的本地缓存：

- 平时用 refresh 降低请求延迟。
- 冷数据用 access 过期释放内存。
- 极端情况下用 write 过期限制最大陈旧时间。

## 完整组合表

| 组合      | 行为                                                |
| :-------- | :-------------------------------------------------- |
| 无 W/A/R  | 不按时间过期，只会被 size、手动删除、JVM 重启等影响 |
| 只有 W    | 固定 TTL，写入后到点过期，读不续命                  |
| 只有 A    | 空闲 TTL，读写都会续命，热点 key 可长期存在         |
| 只有 R    | 不过期，只在访问时异步刷新，旧值可长期兜底          |
| W + A     | 两个过期条件同时生效，谁先到期谁淘汰                |
| W + R     | 先异步刷新，超过硬 TTL 后同步重载                   |
| A + R     | 活跃数据异步刷新，闲置数据过期清理                  |
| W + A + R | 活跃时刷新，闲置时清理，最大存活时间受 W 限制       |

其中：

- W = expireAfterWrite
- A = expireAfterAccess
- R = refreshAfterWrite

## 结合 Redis 的业务写法分析

假设你的代码是：

```java
private final LoadingCache<String, String> activityTypeCache = Caffeine
        .newBuilder()
        .maximumSize(200)
        .refreshAfterWrite(30, TimeUnit.MINUTES)
        .build(this::getFromRedis);
```

它的行为是：

- 第一次 miss：同步查 Redis。
- 30 分钟后再次访问：先返回旧值，再异步查 Redis 刷新。
  - Redis 异常：旧值保留。
  - Redis 返回 null：本地 mapping 可能被移除。
- 超过 maximumSize=200：可能被 Caffeine 淘汰。
- 应用重启：本地缓存全部消失。

所以这段代码不是“绝对永远存在”，更准确的描述是：

> 只要没有 size 淘汰、手动删除、JVM 重启、loader 返回 null 等情况，refreshAfterWrite 本身不会让值因为时间到期而消失。

如果你希望 Redis 查询失败或查不到时，本地旧值继续兜底，建议自定义 `CacheLoader.reload`：

```java
private final LoadingCache<String, String> activityTypeCache = Caffeine
        .newBuilder()
        .maximumSize(200)
        .refreshAfterWrite(30, TimeUnit.MINUTES)
        .build(new CacheLoader<String, String>() {
            @Override
            public String load(String key) {
                return getFromRedis(key);
            }

            @Override
            public String reload(String key, String oldValue) {
                try {
                    String newValue = getFromRedis(key);
                    return newValue == null ? oldValue : newValue;
                } catch (Exception e) {
                    return oldValue;
                }
            }
        });
```

## AsyncLoadingCache 到底有什么用

前面说的都是 LoadingCache。现在再看 AsyncLoadingCache。

LoadingCache 的调用方式是：

```java
String value = loadingCache.get("A");
```

如果本地没有值，当前线程会阻塞，直到 loader 加载完成。

AsyncLoadingCache 的调用方式是：

```java
CompletableFuture<String> future = asyncLoadingCache.get("A");
```

如果本地没有值，它不会直接返回 String，而是马上返回一个 `CompletableFuture<String>`。

### 第一次 miss 的区别

LoadingCache：

```java
LoadingCache<String, String> loadingCache = Caffeine.newBuilder()
        .build(loader::slowLoad);

long start = System.currentTimeMillis();
String value = loadingCache.get("A");
System.out.println("value = " + value);
System.out.println("cost = " + (System.currentTimeMillis() - start) + " ms");
```

预期：

- 当前线程等待 slowLoad 执行完成。
- 如果 slowLoad 耗时 1500 ms，这里整体也会耗时 1500 ms 左右。

AsyncLoadingCache：

```java
ExecutorService executor = Executors.newFixedThreadPool(4);

AsyncLoadingCache<String, String> asyncCache = Caffeine.newBuilder()
        .executor(executor)
        .buildAsync(new AsyncCacheLoader<String, String>() {
            @Override
            public CompletableFuture<String> asyncLoad(String key, Executor executor) {
                return CompletableFuture.supplyAsync(() -> loader.slowLoad(key), executor);
            }
        });

long start = System.currentTimeMillis();
CompletableFuture<String> future = asyncCache.get("A");
System.out.println("get cost = " + (System.currentTimeMillis() - start) + " ms");

future.thenAccept(value -> System.out.println("value = " + value));

future.join();
executor.shutdown();
```

预期：

- `asyncCache.get("A")` 很快返回。
- 真正的加载在异步线程中执行。
- value 会在 future 完成后拿到。

所以区别不是：_第一次都是同步_

而是：

- LoadingCache 第一次 miss 是同步阻塞。
- AsyncLoadingCache 第一次 miss 是异步返回 Future。

只有当你这样写时：

```java
String value = asyncCache.get("A").join();
```

调用线程才会被你自己阻塞住。这个时候使用体验会接近 LoadingCache。

### AsyncLoadingCache 可以合并并发加载

假设多个请求同时访问同一个不存在的 key：

```java
ExecutorService executor = Executors.newFixedThreadPool(4);
AtomicInteger loadCount = new AtomicInteger();

AsyncLoadingCache<String, String> asyncCache = Caffeine.newBuilder()
        .executor(executor)
        .buildAsync(new AsyncCacheLoader<String, String>() {
            @Override
            public CompletableFuture<String> asyncLoad(String key, Executor executor) {
                return CompletableFuture.supplyAsync(() -> {
                    int count = loadCount.incrementAndGet();
                    System.out.println("load count = " + count);
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                    return "value";
                }, executor);
            }
        });

CompletableFuture<String> f1 = asyncCache.get("A");
CompletableFuture<String> f2 = asyncCache.get("A");
CompletableFuture<String> f3 = asyncCache.get("A");

CompletableFuture.allOf(f1, f2, f3).join();

System.out.println(f1.join());
System.out.println(f2.join());
System.out.println(f3.join());
System.out.println("loadCount = " + loadCount.get());

executor.shutdown();
```

预期：

```text
load count = 1
value
value
value
loadCount = 1
```

结论：

- 同一个 key 正在加载时，后续请求会复用这次加载结果。
- 这样可以避免并发 miss 时打爆 Redis 或 DB。

### AsyncLoadingCache 和 refreshAfterWrite

AsyncLoadingCache 也可以配 refreshAfterWrite：

```java
AsyncLoadingCache<String, String> asyncCache = Caffeine.newBuilder()
        .ticker(ticker)
        .executor(executor)
        .refreshAfterWrite(5, TimeUnit.MINUTES)
        .buildAsync(new AsyncCacheLoader<String, String>() {
            @Override
            public CompletableFuture<String> asyncLoad(String key, Executor executor) {
                return CompletableFuture.supplyAsync(() -> loader.slowLoad(key), executor);
            }
        });
```

行为是：

- 第一次 miss：立即返回一个未完成的 CompletableFuture。
- 已有值且未达到 refresh 时间：返回已完成的 CompletableFuture。
- 已有值且超过 refresh 时间：先返回旧值对应的 Future，同时后台刷新。

也就是说，在“已有旧值 + refreshAfterWrite”这个场景里：

- LoadingCache 和 AsyncLoadingCache 确实很像，都是先返回旧值，再后台刷新。

但在“第一次 miss”这个场景里：

- LoadingCache 会阻塞当前线程。
- AsyncLoadingCache 会立即返回 CompletableFuture。

这就是两者最大的差别。

### AsyncLoadingCache 第一次 get 会不会是 null

不会直接返回 null。第一次访问时，它返回的是：

```java
CompletableFuture<String> future = asyncCache.get("A");
```

如果 loader 还没执行完，future 只是“尚未完成”，不是 null。

可以这样验证：

```java
CompletableFuture<String> future = asyncCache.get("A");

System.out.println(future == null); // false
System.out.println(future.isDone()); // 大概率是 false，取决于 loader 是否已经完成

String value = future.join(); // 这里才真正等待结果
System.out.println(value);
```

如果异步 loader 最终返回 null：

```java
AsyncLoadingCache<String, String> asyncCache = Caffeine.newBuilder()
        .executor(executor)
        .buildAsync(new AsyncCacheLoader<String, String>() {
            @Override
            public CompletableFuture<String> asyncLoad(String key, Executor executor) {
                return CompletableFuture.supplyAsync(() -> null, executor);
            }
        });

CompletableFuture<String> future = asyncCache.get("A");
System.out.println(future.join()); // null
System.out.println(asyncCache.synchronous().getIfPresent("A")); // null
```

结论：

- `asyncCache.get(key)` 本身不返回 null。
- 它返回 CompletableFuture。
- CompletableFuture 最终的结果可能是 null，但一般不建议 loader 返回 null。
- 如果异步加载失败，future 会异常完成，缓存 entry 通常也不会保留。

## 什么时候用 LoadingCache，什么时候用 AsyncLoadingCache

### 适合 LoadingCache 的情况

- 业务代码本身是同步调用链。
- 方法返回值就是普通对象。
- 接口不支持异步返回。
- 你最终总是马上 join/get。

例如：

```java
public String getActivityType(String activityId) {
    return activityTypeCache.get(activityId);
}
```

这种场景下，用 LoadingCache 更简单。

### 适合 AsyncLoadingCache 的情况

- 数据源本身是异步 Redis、异步 HTTP、异步 RPC。
- 业务链路支持 CompletableFuture。
- 你不想让请求线程阻塞在缓存加载上。
- 希望并发 miss 时复用同一个异步加载结果。

例如：

```java
public CompletableFuture<String> getActivityTypeAsync(String activityId) {
    return activityTypeCache.get(activityId)
            .thenApply(value -> value == null ? "UNKNOWN" : value)
            .exceptionally(ex -> "UNKNOWN");
}
```

如果你这样写：

```java
public String getActivityType(String activityId) {
    return asyncActivityTypeCache.get(activityId).join();
}
```

那它的优势会小很多。不是不能这么用，而是多数情况下不如直接使用 LoadingCache 清晰。

## 推荐配置

### 希望请求尽量不阻塞，允许短暂旧数据

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .maximumSize(200)
        .refreshAfterWrite(5, TimeUnit.MINUTES)
        .expireAfterWrite(30, TimeUnit.MINUTES)
        .build(loader::load);
```

含义：

- 5 分钟后访问触发后台刷新。
- 如果长时间没刷新成功，30 分钟后旧值过期。

### 希望没人用就释放内存

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .maximumSize(200)
        .expireAfterAccess(30, TimeUnit.MINUTES)
        .build(loader::load);
```

含义：

- 30 分钟没人访问就过期。
- 热点 key 会持续保留。

### 希望热点数据后台刷新，冷数据自动清理

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .maximumSize(200)
        .refreshAfterWrite(5, TimeUnit.MINUTES)
        .expireAfterAccess(30, TimeUnit.MINUTES)
        .build(loader::load);
```

含义：

- 有人访问的数据会被刷新。
- 没人访问的数据会被清理。

### 希望同时具备刷新、冷数据清理、最大陈旧时间限制

```java
LoadingCache<String, String> cache = Caffeine.newBuilder()
        .maximumSize(200)
        .refreshAfterWrite(5, TimeUnit.MINUTES)
        .expireAfterAccess(30, TimeUnit.MINUTES)
        .expireAfterWrite(2, TimeUnit.HOURS)
        .build(loader::load);
```

含义：

- 5 分钟后允许刷新。
- 30 分钟没人访问就清理。
- 同一个成功写入的值最多使用 2 小时。
- 刷新成功后，expireAfterWrite 会重新计时。

## 最后总结

可以把 Caffeine 的时间策略记成三句话：

- expireAfterWrite 管最大存活时间，读不会续命。
- expireAfterAccess 管空闲存活时间，读写都会续命。
- refreshAfterWrite 管后台刷新，它不是过期。

再补一句：

LoadingCache 的 miss 是同步加载，AsyncLoadingCache 的 miss 是异步返回 Future。

如果缓存背后是 Redis，常见业务建议是：

```java
Caffeine.newBuilder()
        .maximumSize(200)
        .refreshAfterWrite(5, TimeUnit.MINUTES)
        .expireAfterWrite(30, TimeUnit.MINUTES)
        .build(loader);
```

这样既可以用本地缓存降低 Redis 压力，又可以用后台刷新减少请求阻塞，还能用硬过期时间限制数据最大陈旧程度。
