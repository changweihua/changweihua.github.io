---
lastUpdated: true
commentabled: true
recommended: true
title: C#.NET AsyncLock 完全解析
description: async/await 下的并发控制方案
date: 2026-01-20 10:00:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介 ##

`AsyncLock` 是一种自定义的异步互斥锁（Mutex Lock），专为异步编程场景设计，用于在 `async/await` 方法中实现线程安全的互斥访问。它弥补了 .NET 中传统 `lock` 语句（基于 `Monitor`）的不足，因为 `lock` 是同步阻塞的，在异步环境中会阻塞线程池线程，导致性能下降或死锁风险。

- 核心原理：`AsyncLock` 通常基于 `SemaphoreSlim(1, 1)` 实现，允许异步等待锁的获取，而不阻塞当前线程。等待的任务会被挂起（suspend），释放线程池资源，支持 `CancellationToken` 取消操作。

- 来源：.NET 标准库中没有内置 `AsyncLock`，通常通过 NuGet 包 `Nito.AsyncEx`（由 `Stephen Cleary` 维护）使用。该库提供了生产就绪的实现。

**使用方式**：

```csharp
private readonly AsyncLock _mutex = new AsyncLock();

public async Task DoWorkAsync()
{
    using (await _mutex.LockAsync())
    {
        await Task.Delay(100);
    }
}
```

## 为什么需要 AsyncLock？ ##

在异步编程中，共享资源（如文件、数据库或 UI 更新）需要互斥访问：

- 传统 `lock` 的问题：`lock` 会阻塞调用线程，如果在 `async` 方法中使用，会导致线程池耗尽，尤其在高并发场景（如 Web API 或 TCP 处理）中。

- `AsyncLock` 的优势：非阻塞等待，使用 `await` 挂起任务，适合 I/O 密集型操作（如网络请求、文件读写）。

- 适用场景：

  - 异步方法中保护共享状态（如缓存更新）。

  - UI 线程与后台任务的同步。

  - 避免死锁的并发控制。

### 普通 lock 的问题 ###

在同步代码中，我们通常用 `lock` 来保护临界区：

```csharp
private readonly object _syncRoot = new object();

public void Increment()
{
    lock (_syncRoot)
    {
        _count++;
    }
}
```

但是在异步代码中：

```csharp
public async Task IncrementAsync()
{
    lock (_syncRoot)
    {
        await SomeAsyncOperation(); // ❌ 编译错误
    }
}
```

`lock` 不能与 `await` 一起使用，因为：

- `await` 会让出线程控制权；

- 离开 `lock` 作用域时会立即释放锁；

- 这会破坏线程安全。

## AsyncLock 的基本思想 ##

核心目标是实现 异步安全的锁，使得：

- 异步任务按顺序进入临界区；

- 释放时能唤醒下一个等待者；

- 不阻塞线程（不像 `lock` 会阻塞）。

### 基本原理 ###

可以用 `SemaphoreSlim`（轻量信号量）实现：

```csharp
public sealed class AsyncLock
{
    private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);
    private readonly Task<IDisposable> _releaser;

    public AsyncLock()
    {
        _releaser = Task.FromResult((IDisposable)new Releaser(this));
    }

    public Task<IDisposable> LockAsync()
    {
        var wait = _semaphore.WaitAsync();
        return wait.IsCompleted
            ? _releaser
            : wait.ContinueWith((_, state) => (IDisposable)state,
                                _releaser.Result, CancellationToken.None,
                                TaskContinuationOptions.ExecuteSynchronously,
                                TaskScheduler.Default);
    }

    private sealed class Releaser : IDisposable
    {
        private readonly AsyncLock _toRelease;

        internal Releaser(AsyncLock toRelease) => _toRelease = toRelease;

        public void Dispose()
        {
            _toRelease._semaphore.Release();
        }
    }
}
```

### 使用示例 ###

```csharp
private readonly AsyncLock _lock = new AsyncLock();
private int _count = 0;

public async Task IncrementAsync()
{
    using (await _lock.LockAsync())
    {
        _count++;
        await Task.Delay(100); // 模拟异步操作
        Console.WriteLine($"Count: {_count}");
    }
}
```

**调用示例**

```csharp
var tasks = Enumerable.Range(0, 5).Select(_ => IncrementAsync());
await Task.WhenAll(tasks);
```

输出将是：

```txt
Count: 1
Count: 2
Count: 3
Count: 4
Count: 5
```

所有操作顺序执行，没有并发问题。

## 与 SemaphoreSlim 的区别 ##

|  特性  |  SemaphoreSlim  |   AsyncLock  |
| :-----------: | :----: | :----: |
| 可同时进入的任务数 |  可指定 (n)  |  永远只允许 1 |
|  使用方式  |  `WaitAsync`/`Release`  |  `using(await LockAsync())`  |
|  使用便捷性  |  稍复杂  |  简洁且自动释放  |
|  推荐场景  |  控制并发数量  |  异步临界区互斥  |

## 改进版：支持 CancellationToken ##

**可以进一步增强**：

```csharp
public async Task<IDisposable> LockAsync(CancellationToken cancellationToken)
{
    await _semaphore.WaitAsync(cancellationToken).ConfigureAwait(false);
    return new Releaser(_semaphore);
}
```

## 异步文件写入 ##

```csharp
public class AsyncFileWriter
{
    private readonly AsyncLock _lock = new AsyncLock();
    private readonly string _filePath;

    public AsyncFileWriter(string path) => _filePath = path;

    public async Task WriteAsync(string message)
    {
        using (await _lock.LockAsync())
        {
            await File.AppendAllTextAsync(_filePath, message + Environment.NewLine);
        }
    }
}
```

多个异步任务并发写同一个文件时，也不会出现内容交错。

## 高级用法 ##

### 带超时控制的 AsyncLock ###

```csharp
public class AsyncLockWithTimeout
{
    private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);
    
    public async Task<LockResult> TryLockAsync(TimeSpan timeout, CancellationToken cancellationToken = default)
    {
        if (await _semaphore.WaitAsync(timeout, cancellationToken))
        {
            return new LockResult(this, true);
        }
        return new LockResult(this, false);
    }
    
    public class LockResult : IDisposable
    {
        private readonly AsyncLockWithTimeout _lock;
        private readonly bool _acquired;
        
        public bool Acquired => _acquired;
        
        public LockResult(AsyncLockWithTimeout asyncLock, bool acquired)
        {
            _lock = asyncLock;
            _acquired = acquired;
        }
        
        public void Dispose()
        {
            if (_acquired)
            {
                _lock._semaphore.Release();
            }
        }
    }
}

// 使用示例
public async Task<bool> TryProcessWithTimeoutAsync()
{
    using var lockResult = await _lock.TryLockAsync(TimeSpan.FromSeconds(5));
    
    if (lockResult.Acquired)
    {
        // 成功获取锁
        await ProcessDataAsync();
        return true;
    }
    else
    {
        // 获取锁超时
        return false;
    }
}
```

## 性能与注意事项 ##

### 优点 ###

- 异步友好，不会阻塞线程；

- 简洁易用；

- 线程安全。

### 注意 ###

- 不适合高频率、极短临界区操作（`SemaphoreSlim` 有开销）；

- 不要长时间持有锁；

- 推荐作用于需要保护的异步资源（如数据库、文件、共享状态）。

## 对比总结 ##

|  场景  |  推荐锁类型  |
| :-----------: | :----: |
|  同步代码块  |  `lock` |
|  异步方法  |  `AsyncLock`  |
|  控制并发数  |  `SemaphoreSlim`  |
|  跨进程或跨机器  |  分布式锁（Redis、SQL、Zookeeper 等）  |
