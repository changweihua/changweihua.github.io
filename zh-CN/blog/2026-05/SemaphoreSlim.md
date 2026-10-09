---
lastUpdated: true
commentabled: true
recommended: true
title: 异步并发的“流量警察”
description: 在C#中使用SemaphoreSlim进行并发控制的最佳实践
date: 2026-05-28 14:35:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

在现代异步编程中，高效处理I/O密集型操作是提升应用性能的关键。然而，不加控制的并发往往会导致灾难性后果——下游服务过载、数据库连接池耗尽、内存暴涨。本文将深入探讨C#中控制异步并发的标准解决方案：`SemaphoreSlim`，并提供生产级别的使用模式。

## 一、为什么需要控制异步并发？ ##

假设我们需要处理1000个订单，每个订单需要调用一个外部支付接口：

```csharp
// 危险的反模式：瞬间发起1000个HTTP请求
public async Task ProcessOrdersDangerously(List<Order> orders)
{
    var tasks = orders.Select(order => CallPaymentApiAsync(order));
    await Task.WhenAll(tasks); // 瞬间并发过高！
}
```

这种方式会同时发起1000个HTTP请求，可能导致：

- 目标API服务器拒绝服务
- 本地网络连接池耗尽
- 内存使用量激增
- 整体性能反而下降

## 二、错误解决方案辨析 ##

在探索解决方案时，开发者常走入以下误区：

### 误用 `Parallel.ForEach` ###

```C#
// 错误：Parallel.ForEach用于CPU密集型同步操作
Parallel.ForEach(orders, async order => 
{
    await CallPaymentApiAsync(order); // 实际上同步执行
});
```

`Parallel.ForEach` 设计用于同步CPU密集型操作，将其用于异步I/O操作不仅无法有效控制并发，还会造成线程池的浪费。

### 分批处理的问题 ###

```cs
// 次优方案：虽能限制并发，但效率低下
for (int i = 0; i < orders.Count; i += 10)
{
    var batch = orders.Skip(i).Take(10);
    await Task.WhenAll(batch.Select(CallPaymentApiAsync));
    await Task.Delay(100); // 人工延迟降低效率
}
```

这种方法虽然限制了并发数，但批次间的等待会导致总体处理时间延长，无法充分利用资源。

## 三、SemaphoreSlim：异步并发的标准解决方案 ##

SemaphoreSlim 是.NET Framework 4.5引入的轻量级信号量，专为 `async`/`await` 设计，是控制异步并发的事实标准。

### 核心工作机制 ###

```csharp
public class AsyncConcurrencyController
{
    // 初始化信号量，设置最大并发数为5
    private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(5, 5);
    
    public async Task ProcessWithConcurrencyControl(List<Item> items)
    {
        var tasks = items.Select(async item =>
        {
            // 关键：异步等待信号量，不阻塞线程
            await _semaphore.WaitAsync();
            try
            {
                // 执行受保护的异步操作
                await ProcessItemAsync(item);
            }
            finally
            {
                // 关键：必须释放信号量
                _semaphore.Release();
            }
        });
        
        await Task.WhenAll(tasks);
    }
}
```

### 工作原理可视化 ###

```txt
初始状态: [√][√][√][√][√] [ ][ ][ ][ ][ ] ... (20个任务)
          ↑ 5个并发槽可用

执行过程:
1. 任务1-5立即获取信号量并执行
2. 任务6-20在WaitAsync()处等待
3. 任务1完成后释放信号量
4. 任务6立即获取释放的信号量并开始执行
5. 如此循环，始终保持最多5个并发
```

## 四、生产环境最佳实践 ##

### 基础封装模式 ###

```csharp
public class ConcurrentExecutor
{
    private readonly SemaphoreSlim _semaphore;
    
    public ConcurrentExecutor(int maxConcurrency)
    {
        _semaphore = new SemaphoreSlim(maxConcurrency, maxConcurrency);
    }
    
    public async Task<TResult> ExecuteAsync<TResult>(
        Func<Task<TResult>> operation, 
        CancellationToken cancellationToken = default)
    {
        await _semaphore.WaitAsync(cancellationToken);
        try
        {
            return await operation();
        }
        finally
        {
            _semaphore.Release();
        }
    }
}
```

### 带超时控制的增强版本 ###

```csharp
public async Task<T> ExecuteWithTimeoutAsync<T>(
    Func<Task<T>> operation,
    TimeSpan timeout,
    CancellationToken cancellationToken = default)
{
    // 尝试在指定时间内获取信号量
    bool acquired = await _semaphore.WaitAsync(timeout, cancellationToken);
    
    if (!acquired)
        throw new TimeoutException($"无法在{timeout.TotalSeconds}秒内获取执行许可");
    
    try
    {
        return await operation();
    }
    finally
    {
        _semaphore.Release();
    }
}
```

### 批量处理与进度报告 ###

```c#
public async Task ProcessBatchWithProgressAsync<T>(
    IEnumerable<T> items,
    Func<T, Task> processor,
    int maxConcurrency,
    IProgress<int> progress = null,
    CancellationToken cancellationToken = default)
{
    var semaphore = new SemaphoreSlim(maxConcurrency, maxConcurrency);
    int total = items.Count();
    int completed = 0;
    
    var tasks = items.Select(async item =>
    {
        await semaphore.WaitAsync(cancellationToken);
        try
        {
            await processor(item);
        }
        finally
        {
            semaphore.Release();
            Interlocked.Increment(ref completed);
            progress?.Report((completed * 100) / total);
        }
    });
    
    await Task.WhenAll(tasks);
}
```

## 五、高级应用场景 ##

### 分层并发控制 ###

```csharp
// 场景：每个用户最多5个并发，全局最多50个并发
public class TieredConcurrencyController
{
    private readonly SemaphoreSlim _globalSemaphore = new(50, 50);
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _userSemaphores = new();
    
    public async Task ExecuteForUserAsync(string userId, Func<Task> operation)
    {
        // 获取用户级信号量（每个用户独立）
        var userSemaphore = _userSemaphores.GetOrAdd(userId, _ => new SemaphoreSlim(5, 5));
        
        // 先获取全局许可
        await _globalSemaphore.WaitAsync();
        await userSemaphore.WaitAsync();
        
        try
        {
            await operation();
        }
        finally
        {
            userSemaphore.Release();
            _globalSemaphore.Release();
        }
    }
}
```

### 与Polly结合实现弹性并发 ###

```csharp
public class ResilientConcurrentExecutor
{
    private readonly SemaphoreSlim _semaphore;
    private readonly AsyncPolicy _retryPolicy;
    
    public async Task<T> ExecuteWithRetryAsync<T>(
        Func<Task<T>> operation, 
        int maxConcurrency)
    {
        _semaphore = new SemaphoreSlim(maxConcurrency, maxConcurrency);
        _retryPolicy = Policy
            .Handle<HttpRequestException>()
            .WaitAndRetryAsync(3, retryAttempt => 
                TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
        
        await _semaphore.WaitAsync();
        try
        {
            return await _retryPolicy.ExecuteAsync(operation);
        }
        finally
        {
            _semaphore.Release();
        }
    }
}
```

## 六、性能调优与监控 ##

### 动态调整并发数 ###

```csharp
public class AdaptiveConcurrencyController
{
    private SemaphoreSlim _semaphore;
    private readonly int _initialConcurrency;
    private readonly object _lock = new object();
    
    public void AdjustConcurrencyBasedOnMetrics(
        double successRate, 
        double avgLatency, 
        int errorCount)
    {
        lock (_lock)
        {
            int newLimit = CalculateOptimalConcurrency(
                successRate, avgLatency, errorCount);
            
            if (newLimit != _semaphore.CurrentCount)
            {
                var oldSemaphore = _semaphore;
                _semaphore = new SemaphoreSlim(newLimit, newLimit);
                
                // 迁移正在等待的任务到新信号量
                MigrateWaiters(oldSemaphore, _semaphore);
            }
        }
    }
}
```

### 监控信号量状态 ###

```csharp
public class MonitoredSemaphoreSlim : SemaphoreSlim
{
    public int CurrentWaitCount { get; private set; }
    public TimeSpan AverageWaitTime { get; private set; }
    
    public new async Task WaitAsync(CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
        CurrentWaitCount++;
        
        try
        {
            await base.WaitAsync(cancellationToken);
        }
        finally
        {
            stopwatch.Stop();
            CurrentWaitCount--;
            UpdateAverageWaitTime(stopwatch.Elapsed);
        }
    }
}
```

## 七、注意事项与常见陷阱 ##

- 避免信号量泄漏：务必在 `finally` 块中调用 `Release()`，确保异常情况下也能释放

- 不要过度限制：根据目标服务的实际能力设置合理的并发数

- 区分资源类型：

  - CPU密集型：使用 `Parallel.ForEach` 或 `TPL Dataflow`
  - I/O密集型：使用 `SemaphoreSlim` + `async/await`

- 考虑取消支持：始终传递 `CancellationToken` 到 `WaitAsync()`

## 八、总结 ##

SemaphoreSlim 是C#异步编程中控制并发度的标准工具，它提供了轻量级、非阻塞的并发控制机制。通过正确使用WaitAsync()和Release()方法，配合try...finally确保资源释放，可以构建出高效、稳定的异步处理系统。

*核心建议*：

- 对于HTTP API调用、数据库访问等I/O操作，优先使用 `SemaphoreSlim`
- 设置并发数时，考虑目标服务的承受能力和网络状况
- 配合 `CancellationToken` 实现优雅的取消操作
- 在生产环境中添加适当的监控和日志记录

正确控制异步并发不仅能提升应用性能，更是构建稳定、可扩展分布式系统的基石。SemaphoreSlim以其简洁的API和可靠的行为，成为每个.NET开发者工具箱中不可或缺的工具。
