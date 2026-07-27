---
lastUpdated: true
commentabled: true
recommended: true
title: C#.NET CancellationToken 深入与实战
description: C#.NET CancellationToken 深入与实战
date: 2025-10-13 09:00:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介 ##

在 C# 异步编程中，“取消模式”是处理长时间运行任务中断的核心机制，主要通过 `CancellationTokenSource` 和 `CancellationToken` 协作实现。

## 基础取消模式 ##

### 核心组件 ###

- `CancellationTokenSource`：创建和管理取消令牌。
- `CancellationToken`：传递给任务，用于检查取消请求。
- `OperationCanceledException`：取消时抛出的异常。

### 基本用法 ###

```csharp
var cts = new CancellationTokenSource();
var token = cts.Token;

// 启动任务
var task = Task.Run(() => LongRunningOperation(token), token);

// 稍后取消
cts.Cancel();
```

### 任务内检查取消 ###

```csharp
public void LongRunningOperation(CancellationToken token)
{
    while (!token.IsCancellationRequested)
    {
        // 执行工作
        token.ThrowIfCancellationRequested(); // 检查并抛出异常
        Thread.Sleep(100);
    }
}
```

## 取消模式的变体 ##

### 带超时的取消 ###

```csharp
// 方法1：创建时设置超时
var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(30));

// 方法2：单独设置超时
var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromMinutes(5));

// 组合使用
var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromMinutes(5)); // 5分钟超时

// 处理超时异常
try
{
    await LongOperationAsync(cts.Token);
}
catch (OperationCanceledException) when (cts.IsCancellationRequested)
{
    Console.WriteLine("操作超时");
}
```

### 组合多个取消令牌 ###

```csharp
var cts1 = new CancellationTokenSource();
var cts2 = new CancellationTokenSource();

// 组合两个令牌，任一取消则触发
var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(
    cts1.Token, 
    cts2.Token
);

await Task.Run(() => WorkAsync(linkedCts.Token), linkedCts.Token);

// 触发任一令牌都会取消任务
cts1.Cancel(); 
```

### 分阶段取消模式 ###

```csharp
public async Task MultiStageProcessAsync(CancellationToken ct)
{
    // 阶段1：准备（不可取消）
    var data = LoadInitialData();
    
    // 阶段2：处理（可取消）
    using var stage2Cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
    await ProcessStageAsync(data, stage2Cts.Token);
    
    // 阶段3：保存（部分可取消）
    await SaveResultsAsync(data, ct); // 保存操作可取消
}
```

### 取消回调注册模式 ###

```csharp
public async Task DownloadWithCleanupAsync(string url, CancellationToken ct)
{
    var tempFile = Path.GetTempFileName();
    
    try
    {
        // 注册取消时的清理操作
        using (ct.Register(() => 
        {
            if (File.Exists(tempFile))
                File.Delete(tempFile);
        }))
        {
            await DownloadToFileAsync(url, tempFile, ct);
            await ProcessFileAsync(tempFile, ct);
        }
    }
    finally
    {
        // 最终清理（无论是否取消）
        if (File.Exists(tempFile))
            File.Delete(tempFile);
    }
}
```

### 协作式取消模式 ###

```csharp
public async Task CooperativeProcessingAsync(
    IProgress<int> progress, 
    CancellationToken ct)
{
    var items = GetItemsToProcess();
    int processed = 0;
    
    foreach (var item in items)
    {
        ct.ThrowIfCancellationRequested();
        
        await ProcessItemAsync(item, ct);
        processed++;
        
        progress?.Report(processed * 100 / items.Count);
    }
}
```

### 取消令牌传播模式 ###

```csharp
// 服务层方法
public async Task<Report> GenerateReportAsync(
    ReportParameters parameters,
    CancellationToken ct)
{
    // 验证参数（快速操作，不检查取消）
    ValidateParameters(parameters);
    
    // 将取消令牌传播到所有子操作
    var data = await _dataService.FetchDataAsync(parameters, ct);
    var analysis = await _analysisService.AnalyzeAsync(data, ct);
    
    return await _reportService.CreateReportAsync(analysis, ct);
}

// 控制器调用
[HttpPost("reports")]
public async Task<IActionResult> GenerateReport(ReportRequest request)
{
    var cts = new CancellationTokenSource(TimeSpan.FromMinutes(10));
    
    try
    {
        var report = await _reportService.GenerateReportAsync(
            request.ToParameters(), 
            cts.Token);
            
        return Ok(report);
    }
    catch (OperationCanceledException)
    {
        return StatusCode(499, "报告生成超时");
    }
}
```

### 取消异步流（IAsyncEnumerable） ###

```csharp
public async IAsyncEnumerable<int> GenerateItemsAsync(
    [EnumeratorCancellation] CancellationToken token = default)
{
    for (int i = 0; i < 100; i++)
    {
        token.ThrowIfCancellationRequested();
        await Task.Delay(100, token);
        yield return i;
    }
}

// 消费时传递取消令牌
await foreach (var item in GenerateItemsAsync(token).WithCancellation(token))
{
    Console.WriteLine(item);
}
```

### 自定义扩展模式（如 WithCancellation） ###

- 机制：扩展方法为不支持 `CancellationToken` 的 `API` 添加取消能力。

- 适用场景：整合旧代码或第三方库到异步流程。

```csharp
public static async Task WithCancellation(this Task task, CancellationToken ct) {
    var tcs = new TaskCompletionSource();
    using (ct.Register(() => tcs.TrySetCanceled())) {
        if (task != await Task.WhenAny(task, tcs.Task)) {
            throw new OperationCanceledException(ct);
        }
        await task; // 确保任务异常正常传播
    }
}

// 使用示例
await SomeLegacyMethod().WithCancellation(ct);
```

### Parallel.ForEachAsync 取消 ###

- 机制：`.NET 6+` 的 `Parallel.ForEachAsync` 原生支持取消令牌。

- 适用场景：并行处理集合且需统一取消所有子任务。

```csharp
await Parallel.ForEachAsync(data, new ParallelOptions { 
    CancellationToken = ct 
}, async (item, ct) => {
    await ProcessItemAsync(item, ct);
});
```

取消时终止所有并行任务，资源释放更高效

### Task.Run 中的取消 ###

```csharp
// 正确示例：CPU 密集型任务 + 取消
public async Task<int> CalculateAsync(CancellationToken ct) {
    return await Task.Run(() => {
        ct.ThrowIfCancellationRequested();
        return ComputeResult(); // 模拟计算
    }, ct);
}
```

### 与第三方 API 集成 ###

```csharp
using var httpClient = new HttpClient();
var cts = new CancellationTokenSource(5000); // 5秒超时

try
{
    var response = await httpClient.GetAsync("https://example.com", cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("请求超时");
}
```

## 资源清理与取消 ##

### 使用 CancellationToken.Register ###

注册回调在取消时执行清理：

```csharp
var cts = new CancellationTokenSource();
var token = cts.Token;

// 注册清理回调
using var registration = token.Register(() =>
{
    Console.WriteLine("执行资源清理...");
});

await Task.Run(() => WorkAsync(token), token);
```

### 在 using 语句中使用可取消资源 ###

```csharp
public async Task WorkWithResourceAsync(CancellationToken token)
{
    using var resource = new MyDisposableResource();
    
    while (!token.IsCancellationRequested)
    {
        await resource.ProcessAsync(token);
    }
}
```

## 取消模式的最佳实践 ##

### 传播取消令牌 ###

- 方法签名：始终将 `CancellationToken` 作为参数传递。

- 默认值：使用 `default` 作为默认值，保持 `API` 灵活性。

```csharp
public async Task MyMethodAsync(CancellationToken token = default)
{
    await SomeOperationAsync(token); // 传递令牌
}
```

### 避免阻塞取消检查 ###

使用 `await Task.Delay(..., token)` 而非 `Thread.Sleep`：

```csharp
// 错误：阻塞线程，无法及时响应取消
while (!token.IsCancellationRequested)
{
    Thread.Sleep(1000); // 无法在睡眠期间响应取消
}

// 正确：可取消的延迟
while (!token.IsCancellationRequested)
{
    await Task.Delay(1000, token); // 支持取消
}
```

### 循环处理中的取消检查 ###

```csharp
public async Task BatchProcessAsync(CancellationToken ct)
{
    var batch = GetNextBatch();
    
    while (batch != null && !ct.IsCancellationRequested)
    {
        await ProcessBatchAsync(batch, ct);
        
        // 在批处理间隙检查取消
        if (ct.IsCancellationRequested) break;
        
        batch = GetNextBatch();
    }
    
    ct.ThrowIfCancellationRequested();
}
```

### 优雅处理部分完成的操作 ###

取消时可能需要回滚已完成的部分操作：

```csharp
public async Task ProcessTransactionAsync(CancellationToken token)
{
    try
    {
        await Step1Async(token);
        await Step2Async(token);
    }
    catch (OperationCanceledException)
    {
        await RollbackStep1Async(); // 回滚已完成的步骤
        throw;
    }
}
```

## 常见问题与解决方案 ##

### 任务取消后仍在运行 ###

- 原因：任务内部未正确检查取消令牌。

- 解决方案：确保在循环和关键操作中调用 `ThrowIfCancellationRequested()`。

### 取消请求被忽略 ###

- 原因：使用了不支持取消的 `API`（如同步方法）。

- 解决方案：使用异步版本的 `API`，或在 `Task.Run` 中执行同步操作并传递令牌。

### 资源泄漏 ###

- 原因：取消时未释放资源。

- 解决方案：使用 `using` 语句、`CancellationToken.Register` 或实现 `IDisposable`。

## 高级技巧 ##

### 实现可取消的重试逻辑 ###

```csharp
public async Task RetryWithCancellationAsync(CancellationToken token)
{
    int retries = 3;
    while (retries > 0)
    {
        token.ThrowIfCancellationRequested();
        try
        {
            await OperationAsync(token);
            break;
        }
        catch (Exception) when (retries > 0)
        {
            retries--;
            await Task.Delay(1000, token); // 退避策略
        }
    }
}
```

### 取消令牌与并行处理 ###

```csharp
public async Task ParallelProcessingAsync(CancellationToken ct)
{
    var items = GetItems();
    var tasks = new List<Task>();
    
    foreach (var item in items)
    {
        // 为每个任务创建链接令牌
        var itemCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        
        tasks.Add(ProcessItemAsync(item, itemCts.Token));
    }
    
    try
    {
        await Task.WhenAll(tasks);
    }
    catch (OperationCanceledException)
    {
        // 处理部分取消
        foreach (var task in tasks)
        {
            if (task.IsCanceled)
                LogCanceledItem(task);
        }
        
        throw;
    }
}
```

### 自定义取消条件 ###

```csharp
public async Task ProcessUntilAsync(
    Func<bool> completionCondition,
    Func<bool> cancellationCondition,
    CancellationToken externalCt = default)
{
    using var cts = CancellationTokenSource.CreateLinkedTokenSource(externalCt);
    
    // 自定义取消条件
    var timer = new System.Timers.Timer(1000);
    timer.Elapsed += (s, e) => 
    {
        if (cancellationCondition())
            cts.Cancel();
    };
    timer.Start();
    
    try
    {
        while (!completionCondition() && !cts.Token.IsCancellationRequested)
        {
            await ProcessNextItemAsync(cts.Token);
        }
    }
    finally
    {
        timer.Stop();
        timer.Dispose();
    }
}
```

### 取消状态检查 ###

```csharp
var task = operationWithTimeoutAsync(cts.Token);

try
{
    await task;
}
catch (OperationCanceledException)
{
    if (task.IsCanceled)
    {
        Console.WriteLine("任务被取消");
    }
    else if (task.IsFaulted)
    {
        Console.WriteLine($"任务失败: {task.Exception?.Message}");
    }
}
```

### 轻量级取消检查 ###

```csharp
// 高频循环中的优化检查
public void ProcessItems(List<Item> items, CancellationToken ct)
{
    // 每100次迭代检查一次取消
    for (int i = 0; i < items.Count; i++)
    {
        // 优化：避免每次迭代都检查
        if (i % 100 == 0) ct.ThrowIfCancellationRequested();
        
        ProcessItem(items[i]);
    }
}
```

## IsCancellationRequested VS ThrowIfCancellationRequested ##

### 核心区别 ###

|  特性   |      IsCancellationRequested  |   ThrowIfCancellationRequested  |
| :-----------: | :-----------: | :-----------: |
| 返回值 | bool（是否请求取消） | void（无返回值，直接抛异常） |
| 异常处理 | 不会抛出异常 | 若请求取消，则抛出 OperationCanceledException |
| 使用方式 | 需要手动检查并处理取消逻辑 | 自动触发取消逻辑，简化代码 |
| 适用场景 | 需要自定义取消处理逻辑（如部分回滚） | 简单场景，快速终止任务 |

### 详细对比与示例 ###

#### 使用 IsCancellationRequested ####

- 场景：需要在取消时执行自定义逻辑（如资源释放、部分结果保存）。

```csharp
public async Task CustomHandlingAsync(CancellationToken token)
{
    while (!token.IsCancellationRequested)
    {
        // 执行部分工作
        await Step1Async();

        // 手动检查取消
        if (token.IsCancellationRequested)
        {
            await RollbackStep1Async(); // 自定义回滚逻辑
            token.ThrowIfCancellationRequested(); // 可选：抛出标准异常
        }

        await Step2Async();
    }
}
```

#### 使用 ThrowIfCancellationRequested ####

- 场景：快速响应取消请求，无需自定义中间逻辑。

```csharp
public async Task SimpleTaskAsync(CancellationToken token)
{
    for (int i = 0; i < 1000; i++)
    {
        token.ThrowIfCancellationRequested(); // 检查并抛异常
        await ProcessItemAsync(i);
    }
}
```

### 适用场景建议 ###

#### 优先使用 ThrowIfCancellationRequested 的场景 ###

**简单循环任务**：

```csharp
while (!token.IsCancellationRequested) // 繁琐
{
    // ...
}

// 简化为：
while (true)
{
    token.ThrowIfCancellationRequested(); // 简洁
    // ...
}
```

**调用第三方 API 时传递令牌**：

```csharp
await HttpClient.GetAsync(url, token); // API内部会调用ThrowIfCancellationRequested
```

**快速失败的场景**：

```csharp
public async Task ProcessFileAsync(string path, CancellationToken token)
{
    token.ThrowIfCancellationRequested(); // 提前检查
    await using var stream = File.OpenRead(path);
    // ...
}
```

### 必须使用 IsCancellationRequested 的场景 ###

**需要分步处理取消**：

```csharp
public async Task ComplexOperationAsync(CancellationToken token)
{
    var state = await LoadStateAsync();
    
    while (!token.IsCancellationRequested)
    {
        if (state.NeedsSave && token.IsCancellationRequested)
        {
            await SaveStateAsync(state); // 保存部分进度
            break;
        }
        
        // 继续处理
    }
}
```

**实现自定义取消逻辑**：

```csharp
public async Task RetryWithCancellationAsync(CancellationToken token)
{
    int retries = 3;
    while (retries > 0 && !token.IsCancellationRequested)
    {
        try
        {
            await OperationAsync(token);
            break;
        }
        catch (Exception) when (retries-- > 0)
        {
            // 重试逻辑
        }
    }
}
```

### 组合使用示例 ###

```csharp
public async Task ProcessItemsAsync(IEnumerable<Item> items, CancellationToken token)
{
    // 在方法入口统一抛出
    token.ThrowIfCancellationRequested();

    foreach (var item in items)
    {
        // 在循环中，只检查一次
        if (token.IsCancellationRequested)
        {
            await CleanUpAsync();
            return;
        }

        // 真正的异步工作
        await ProcessItemAsync(item, token);

        // 也可以在此再次抛出
        token.ThrowIfCancellationRequested();
    }
}
```

- 入口：用 `ThrowIfCancellationRequested` 保证一进来就能根据需要取消。
- 循环中：先做 `IsCancellationRequested` 来决定是否清理再退出。
- 关键点：在每个“可取消点”使用其中一种方法，保证及时响应。

### 总结 ###

- `IsCancellationRequested`：
  - 只读检查，不 抛异常。
  - 柔性退出，适合先清理或报告再退出。

- `ThrowIfCancellationRequested()`：
  - 抛出 `OperationCanceledException`。
  - 立即跳出，适合简洁地在任意位置统一响应取消。

**结论指南**

|  需求   |      推荐方法  |
| :-----------: | :-----------: |
| 循环退出条件 | IsCancellationRequested |
| 任务/方法边界检查 | ThrowIfCancellationRequested |
| 取消时需自定义清理 | IsCancellationRequested |
| 取消时应中断任务状态 | ThrowIfCancellationRequested |
| 高频调用点（>1000次/秒） | IsCancellationRequested |
| 关键操作检查点 | ThrowIfCancellationRequested |
