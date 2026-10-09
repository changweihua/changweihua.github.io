---
lastUpdated: true
commentabled: true
recommended: true
title: 深入理解 Parallel.ForEachAsync
description: C#.NET 并行调度模型揭秘
date: 2026-01-04 09:29:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介 ##

```txt
┌──────────────┐
│ 数据源枚举器 │  IEnumerable / IAsyncEnumerable
└──────┬───────┘
       ↓
┌────────────────────┐
│ 并发调度器（Pump） │  ← 控制最多 N 个任务
└──────┬─────────────┘
       ↓
┌────────────────────┐
│ async Body(item)   │  ← 异步逻辑
└──────┬─────────────┘
       ↓
┌────────────────────┐
│ 完成 / 异常 / 取消 │
└────────────────────┘
```

- 不是一次性启动所有任务

- 是一个 “边消费、边执行、边补位” 的模型

## 核心设计目标 ##

> 在异步场景下，维持固定并发度，持续消耗数据源，直到完成

| **痛点**        |      **ForEachAsync 的解法**      |
| :------------- | :-----------: |
|    Task.WhenAll 不限流     |      MaxDegreeOfParallelism      |
|   SemaphoreSlim 模板繁琐      |      内建      |
|     async foreach 调度复杂    |      自动处理      |

## 调度模型核心：滑动窗口（Sliding Window） ##

### 并发度不是“一次性分配” ###

假设：

```csharp
MaxDegreeOfParallelism = 3
items = [A, B, C, D, E, F]
```

执行顺序是这样的：

```txt
      A  B  C   （占满 3 个槽位）
      │  │  │
      │  │  └─ C 完成 → 启动 D
      │  └──── B 完成 → 启动 E
      └─────── A 完成 → 启动 F
```
这就是滑动窗口

任何时刻：

- 运行中的任务 ≤ `MaxDegreeOfParallelism`

- 永远“有空位就补”

## 内部不是 Parallel.For，而是 Task 泵 ##

关键认知

> Parallel.ForEachAsync 并没有复用 Parallel.For 的线程切分模型

原因很简单：

- `Parallel.For` → 同步代码 + 线程

- `ForEachAsync` → 异步代码 + `continuation`

内部本质是一个 `Task Pump`（任务泵）

**伪代码级理解（高度简化）**

```csharp
async Task RunAsync()
{
    using var enumerator = source.GetEnumerator();
    var runningTasks = new List<Task>();

    while (true)
    {
        while (runningTasks.Count < maxDegree && enumerator.MoveNext())
        {
            var item = enumerator.Current;
            runningTasks.Add(ProcessAsync(item));
        }

        if (runningTasks.Count == 0)
            break;

        var finished = await Task.WhenAny(runningTasks);
        runningTasks.Remove(finished);
    }
}
```

真实实现更复杂（异常、取消、`ValueTask`、`ExecutionContext`），

## 为什么它天然适合 async，而 Parallel.For 不行？ ##

对比一下两者的“调度单位”

| **API**        |      **调度单位**      |
| :------------- | :-----------: |
|    Parallel.For     |      线程 + 同步委托      |
|    ForEachAsync     |      Task / ValueTask      |

`async` 的关键特性：

- `await` 会 释放线程

- 继续执行靠 `Continuation`

- 不绑定固定线程

所以 `ForEachAsync`：

- 不关心“用哪个线程”

- 只关心“同时有多少个未完成任务”

## 枚举器访问是串行的 ##

> 数据源的枚举（MoveNext）是串行的

也就是说：

```csharp
items.GetEnumerator().MoveNext()
```

只会在 一个调度上下文 中执行，不会并发访问枚举器。

为什么？

- `IEnumerable<T>` 默认 不是线程安全的

- 并发枚举会直接炸

所以 `ForEachAsync` 的并行点在：

- `Body` 执行

- 不是枚举阶段

## 异常与取消的调度策略 ##

### 异常模型 ###

- 任意一个 `Body` 抛异常

- 会：

  - 请求取消

  - 等待已启动任务结束

  - 最终聚合抛出异常

行为类似：

```csharp
await Task.WhenAll(...)
```

### CancellationToken 不是“硬中断” ###

`Token` 被取消后：

- 不再启动新任务

- 已启动任务 需要自己响应 `ct`

```csharp
await Parallel.ForEachAsync(items, async (item, ct) =>
{
    ct.ThrowIfCancellationRequested();
    await DoAsync(item, ct);
});
```

## 为什么返回 ValueTask 而不是 Task？ ##

原因只有一个：性能

- Body 很可能：

  - 同步完成

  - 快速失败

- `ValueTask`：

  - 避免不必要的 `Task` 分配

  - 降低 `GC` 压力

## 和 SemaphoreSlim 手写模型的本质对比 ##

### 手写版本 ###

```csharp
var sem = new SemaphoreSlim(5);

var tasks = items.Select(async item =>
{
    await sem.WaitAsync();
    try
    {
        await ProcessAsync(item);
    }
    finally
    {
        sem.Release();
    }
});

await Task.WhenAll(tasks);
```

`ForEachAsync` 内部其实就是：

- `SemaphoreSlim` + `Task.WhenAny`

- 加上：

  - 枚举安全

  - 异常聚合

  - 取消传播

    - `ExecutionContext` 管理

## 什么时候不该用 Parallel.ForEachAsync？ ##

- 强顺序依赖

- 需要复杂生产者-消费者关系

- 需要背压、缓冲区

- 多阶段流水线

**这些场景用**：

- Channel

- TPL Dataflow

## 总结 ##

> `Parallel.ForEachAsync` = 一个为 async 设计的、滑动窗口式的并发任务调度器

它不是魔法，也不是线程并行，而是：

- 控并发

- 自动补位

- 资源友好

- 工程可控
