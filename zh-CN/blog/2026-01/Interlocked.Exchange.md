---
lastUpdated: true
commentabled: true
recommended: true
title: 你真的理解 Interlocked.Exchange 吗？
description: C#.NET 原子操作详解
date: 2026-01-08 09:29:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 什么是 Interlocked.Exchange？ ##

`Interlocked.Exchange` 是 `System.Threading.Interlocked` 类中的静态方法，用于原子地替换（交换）一个变量的值，并返回该变量的旧值。整个读-改-写过程是不可分割的，在多线程环境中保证线程安全。

- 核心作用：无锁地（`lock-free`）将变量设置为新值，同时获取旧值。

- 常见重载：

```csharp
public static int Exchange(ref int location, int value);
public static long Exchange(ref long location, long value);
public static float Exchange(ref float location, float value);
public static double Exchange(ref double location, double value);
public static T Exchange<T>(ref T location, T value) where T : class;  // 引用类型
public static object? Exchange(ref object? location, object? newValue);
```

- 参数：

  - `location`：要替换的共享变量（必须ref传递，直接操作内存地址）。

  - `value` / `newValue`：要写入的新值。

- 返回值：操作前的旧值。

底层基于 `CPU` 的原子交换指令（如 `x86` 的 `xchg`），性能极高。

## 为什么使用 Interlocked.Exchange？ ##

普通的 “读取值 + 赋值新值” 是两步非原子操作，多线程下会因竞态条件导致逻辑错误

**典型问题**：

```csharp
// 非原子操作：读取旧值和赋值新值之间可能被其他线程打断
private static int _flag = 0;
public static int UnsafeReplace(int newValue)
{
    int oldValue = _flag; // 步骤1：读取旧值
    _flag = newValue;     // 步骤2：赋值新值
    return oldValue;      // 返回旧值
}
```

若两个线程同时执行上述代码，可能出现 “线程 A 读取旧值后，线程 B 已修改值，线程 A 最终返回的旧值与实际赋值前的旧值不一致” 的问题。
`Interlocked.Exchange` 将 “读取旧值 + 设置新值” 合并为不可中断的原子操作，从底层杜绝竞态条件，且无需阻塞线程（无锁）。

**Exchange 的优势**：

- 原子性：读取旧值和写入新值一步完成。

- 高性能：无锁，开销极低。

- 可见性：所有线程立即可见。

- 有序性：写入前的操作不会被重排到之后。

- 无锁：不阻塞线程。

- 适用场景：

  - 线程安全的状态切换（如启用/禁用标志）。

  - 实现懒加载单例（替换 `null` 为实例）。

  - 原子更新引用（如缓存对象）。

  - 实现 `SpinLock` 或自定义同步原语。

## 核心原理：CPU 级原子指令 ##

`Interlocked.Exchange` 的原子性依赖 `CPU` 硬件指令：

- `x86` 架构：使用 `LOCK XCHG` 指令（`LOCK` 前缀独占内存总线，阻止其他 `CPU` 核心修改该内存地址）；

- `ARM` 架构：使用 `SWP`（交换指令）或 `LDXR/STXR`（加载 - 存储独占）指令。

同时，该操作会触发全内存屏障（`Full Memory fence`）：

- 保证操作前后的内存读写不会被 CPU 重排序；

- 确保所有线程能立即看到变量的最新值（避免 CPU 缓存导致的 “脏读”）。

## 基础使用示例 ##

### 最简单的原子替换（返回原始值） ###

```csharp
private static int _counter = 0;

public static void TestExchange()
{
    // 目标：将_counter从0替换为100，获取原始值
    int newValue = 100;
    int originalValue = Interlocked.Exchange(ref _counter, newValue);
    
    Console.WriteLine($"原始值：{originalValue}，新值：{_counter}");
    // 输出：原始值：0，新值：100

    // 再次替换：将_counter从100替换为200
    originalValue = Interlocked.Exchange(ref _counter, 200);
    Console.WriteLine($"原始值：{originalValue}，新值：{_counter}");
    // 输出：原始值：100，新值：200
}
```

### 线程安全标志位 ###

```csharp
private int _isProcessing = 0; // 0=未处理, 1=处理中

public bool StartProcessing()
{
    // 如果当前为0（未处理），则设为1（处理中）并返回true
    return Interlocked.Exchange(ref _isProcessing, 1) == 0;
}

public void EndProcessing()
{
    // 重置为未处理状态
    Interlocked.Exchange(ref _isProcessing, 0);
}
```

### 一次性资源释放（防止重复 Dispose） ###

```csharp
private IDisposable? _resource;

public void Dispose()
{
    var res = Interlocked.Exchange(ref _resource, null);
    res?.Dispose();
}
```

### 无锁发布对象（Safe Publication） ###

```csharp
private object? _instance;

public object GetOrCreate()
{
    if (_instance != null)
        return _instance;

    var newObj = new object();
    Interlocked.Exchange(ref _instance, newObj);
    return newObj;
}
```

### 多线程下的原子状态切换 ###

用 `Exchange` 实现线程安全的 “一次性初始化”（状态从未初始化→已初始化，仅执行一次）：

```csharp
// 状态枚举：0=未初始化，1=初始化中，2=已初始化
private static int _initState = 0;
// 模拟初始化成本高的对象
private static ExpensiveObject? _expensiveObj;

/// <summary>
/// 线程安全的一次性初始化
/// </summary>
public static ExpensiveObject GetExpensiveObject()
{
    // 1. 原子替换：将状态从0（未初始化）改为1（初始化中）
    int originalState = Interlocked.Exchange(ref _initState, 1);
    
    // 2. 只有原始状态是0的线程，执行初始化
    if (originalState == 0)
    {
        Console.WriteLine($"线程{Thread.CurrentThread.ManagedThreadId}：执行初始化...");
        _expensiveObj = new ExpensiveObject(); // 耗时初始化
        // 3. 初始化完成，将状态改为2（已初始化）
        Interlocked.Exchange(ref _initState, 2);
    }
    else
    {
        // 其他线程等待初始化完成
        while (_initState != 2)
        {
            Thread.SpinWait(10); // 自旋等待（轻量级）
        }
        Console.WriteLine($"线程{Thread.CurrentThread.ManagedThreadId}：初始化已完成，直接返回对象");
    }
    
    return _expensiveObj!;
}

// 测试：10个线程同时调用，仅1个线程执行初始化
var tasks = Enumerable.Range(0, 10)
    .Select(_ => Task.Run(() => GetExpensiveObject()))
    .ToList();
Task.WaitAll(tasks.ToArray());

// 模拟创建成本高的对象
public class ExpensiveObject
{
    public ExpensiveObject()
    {
        Thread.Sleep(1000); // 模拟1秒耗时初始化
    }
}
```

**输出结果**

仅 1 个线程执行初始化，其余线程等待后直接返回对象：

```txt
线程3：执行初始化...
线程4：初始化已完成，直接返回对象
线程5：初始化已完成，直接返回对象
...（其余线程均输出此内容）
```

## 高级应用场景 ##

### 单例模式（结合 `Exchange` 实现懒加载） ###

用 `Exchange` 替代 `lock` 实现高性能单例

```csharp
public sealed class LazySingleton
{
    // 单例实例（引用类型）
    private static LazySingleton? _instance;
    // 初始化标记：0=未初始化，1=已初始化
    private static int _initialized = 0;

    private LazySingleton() { } // 私有构造

    public static LazySingleton Instance
    {
        get
        {
            // 原子替换：将_initialized从0改为1，仅第一次调用返回0
            if (Interlocked.Exchange(ref _initialized, 1) == 0)
            {
                _instance = new LazySingleton(); // 仅执行一次初始化
            }
            return _instance!;
        }
    }
}
```

### 取消令牌的原子重置 ###

用 `Exchange` 原子替换 `CancellationTokenSource`，实现 “取消后重置” 的线程安全逻辑：

```csharp
private static CancellationTokenSource? _cts = new CancellationTokenSource();

/// <summary>
/// 原子重置取消令牌（取消旧令牌，创建新令牌）
/// </summary>
public static CancellationToken ResetCts()
{
    // 1. 原子替换旧的Cts为新实例，获取旧实例
    CancellationTokenSource? oldCts = Interlocked.Exchange(ref _cts, new CancellationTokenSource());
    // 2. 取消旧令牌（避免旧任务继续执行）
    if (oldCts != null)
    {
        oldCts.Cancel();
        oldCts.Dispose();
    }
    // 3. 返回新令牌
    return _cts.Token;
}
```

### 引用类型：原子替换对象引用（最常用） ###

```csharp
private ExpensiveObject? _cache = null;

public ExpensiveObject GetOrCreate()
{
    // 如果为 null，原子替换为新实例
    var newInstance = new ExpensiveObject();
    var oldInstance = Interlocked.Exchange(ref _cache, newInstance);

    return oldInstance ?? newInstance;  // 如果旧值为 null，返回新实例
}
```

### 与 Interlocked.CompareExchange 的关系 ###

| **方法**        |      **行为**      |
| :------------- | :-----------: |
|    Exchange     |      无条件替换      |
|   CompareExchange      |      条件替换（CAS）      |

**对比示例**

```csharp
// Exchange：不管原来是什么，都换
Interlocked.Exchange(ref state, 1);

// CompareExchange：只有 state == 0 才换
Interlocked.CompareExchange(ref state, 1, 0);
```

## 总结 ##

> `Interlocked.Exchange` 是 .NET 中最简单、最快、最安全的“原子替换”操作，它是实现一次性执行、无锁状态切换、安全对象发布的基石。
