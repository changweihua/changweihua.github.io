---
lastUpdated: true
commentabled: true
recommended: true
title: C#.NET Cronos 实战
description: 优雅解析与执行 Cron 表达式
date: 2025-10-31 14:00:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介 ##

`Cronos` 是一个专为 .NET 设计的轻量级、高性能 cron 表达式解析库，由 `Hangfire` 团队开发。相比其他 cron 库，它专注于提供精确的时区处理和高效的计算算法，特别适合需要跨时区调度的现代应用。

- 在 .NET 应用中需要使用 Cron 表达式驱动定时任务时，系统自带的定时器并不支持直接解析 Cron 语法。

- 虽然有 Quartz.NET 等重量级调度框架，但在只需表达式解析与下一次执行时间计算的场景中，引入整套框架过于臃肿。

- Cronos 是一款专注于 Cron 表达式解析与下次执行时间计算的轻量级库，支持标准与扩展语法、时区、秒级精度，并且性能优越、易于集成。

## 解决的关键痛点 ##

- 精确时区转换：原生支持从任意时区计算触发时间

- 无状态解析：线程安全的表达式解析

- 高效算法：O(1) 时间复杂度的下次触发计算

- 轻量级：无外部依赖，适合 Serverless 环境

## 安装与配置 ##

- NuGet 安装

```shell
Install-Package Cronos
```

- 命名空间引用

```csharp
using Cronos;
```

Cronos 支持 .NET Standard 2.0+，兼容所有现代 .NET 平台（.NET Core/.NET 5+/Mono 等）。

## 核心功能 ##

### 多种表达式格式 ###

- 标准 5 段（分钟、小时、日、月、周）

- 扩展 6 段（秒、分钟、小时、日、月、周）

- 可选年字段（7 段：秒、分、时、日、月、周、年）

### 下次与多次执行时间计算 ###

- `GetNextOccurrence(DateTime baseTime, TimeZoneInfo tz = null)`

- `GetOccurrences(DateTime start, DateTime end, TimeZoneInfo tz = null)`

- 时区支持

  - 可传入 TimeZoneInfo，自动根据时区与夏令时规则计算本地时间

- 异常反馈

  - 对非法表达式抛出 CronExpressionException，内含错误位置提示

- 线程安全

  - CronExpression 实例可在多线程间共享

- 性能

  - 解析与计算采用高效算法，适合高并发环境

## 主要 API 用法 ##

```csharp
// 1. 解析表达式
CronExpression expr = CronExpression.Parse("*/15 8-18 * * MON-FRI", CronFormat.Standard);

// 2. 获取下一次执行时间（本地时区）
DateTime? next = expr.GetNextOccurrence(DateTime.Now);

// 3. 获取下一次执行时间（指定时区）
var tz = TimeZoneInfo.FindSystemTimeZoneById("China Standard Time");
DateTime? nextInCst = expr.GetNextOccurrence(DateTime.UtcNow, tz);

// 4. 枚举一段时间内所有执行时间
DateTime start = DateTime.Now;
DateTime end = start.AddDays(1);
IEnumerable<DateTime> occs = expr.GetOccurrences(start, end);

// 5. 捕获非法表达式异常
try {
    CronExpression.Parse("invalid cron");
} catch (CronFormatException ex) {
    Console.WriteLine($"表达式语法错误：{ex.Message}");
}
```

- `CronExpression.Parse(string, CronFormat)`：显式指定格式（Standard 或 Seconds）。

- `GetNextOccurrence(DateTime, TimeZoneInfo = null)`：如果区间外返回 null。

- `GetOccurrences(DateTime start, DateTime end, TimeZoneInfo = null)`：懒枚举，按需生成。

## 使用示例 ##

### 示例 1：每天下午 6 点执行 ###

```csharp
var expr = CronExpression.Parse("0 18 * * *"); // 标准 5 段
var next = expr.GetNextOccurrence(DateTime.Now);
Console.WriteLine($"下一次：{next}");
```

### 示例 2：工作日上午 9:30、下午 15:30 执行 ###

```csharp
var expr = CronExpression.Parse("30 9,15 * * MON-FRI");
foreach (var dt in expr.GetOccurrences(DateTime.Today, DateTime.Today.AddDays(1))) {
    Console.WriteLine(dt);
}
```

### 示例 3：支持秒级，间隔 10 秒执行 ###

```csharp
var expr = CronExpression.Parse("*/10 * * * * *", CronFormat.IncludeSeconds);
await foreach (var dt in expr.GetOccurrencesAsync(DateTime.UtcNow, DateTime.UtcNow.AddMinutes(1))) {
    Console.WriteLine(dt);
}
```

### 结合 PeriodicTimer ###

结合 PeriodicTimer 实现简单调度器：

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;
using Cronos;

class Program
{
    static async Task Main()
    {
        var expression = CronExpression.Parse("0 */5 * * * *", CronFormat.IncludeSeconds); // 每 5 秒
        var timeZone = TimeZoneInfo.Utc;
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(1)); // 每秒检查
        using var cts = new CancellationTokenSource();

        try
        {
            var next = expression.GetNextOccurrence(DateTimeOffset.UtcNow, timeZone);
            while (await timer.WaitForNextTickAsync(cts.Token))
            {
                var now = DateTimeOffset.UtcNow;
                if (next.HasValue && now >= next.Value)
                {
                    Console.WriteLine($"Task executed at {now:HH:mm:ss}");
                    next = expression.GetNextOccurrence(now, timeZone);
                }
            }
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine("Scheduler stopped");
        }
    }
}
```

### 结合 Quartz.NET ###

结合 Quartz.NET 实现完整调度：

```csharp
using Cronos;
using Quartz;
using Quartz.Impl;
using System;
using System.Threading.Tasks;

public class MyJob : IJob
{
    public Task Execute(IJobExecutionContext context)
    {
        Console.WriteLine($"Job executed at: {DateTimeOffset.Now:HH:mm:ss}");
        return Task.CompletedTask;
    }
}

class Program
{
    static async Task Main()
    {
        var factory = new StdSchedulerFactory();
        var scheduler = await factory.GetScheduler();
        await scheduler.Start();

        var job = JobBuilder.Create<MyJob>()
            .WithIdentity("myJob", "group1")
            .Build();

        var cronExpression = CronExpression.Parse("0 0 8 * * ?");
        var trigger = TriggerBuilder.Create()
            .WithIdentity("myTrigger", "group1")
            .WithCronSchedule(cronExpression.ToString())
            .Build();

        await scheduler.ScheduleJob(job, trigger);
        Console.ReadLine(); // 保持运行
    }
}
```

## 性能优化策略 ##

### 表达式预编译 ###

```csharp
// 静态存储预编译表达式
private static readonly CronExpression _precompiledCron = 
    CronExpression.Parse("0 */15 * * * *", CronFormat.IncludeSeconds);

// 使用时直接调用
DateTime? next = _precompiledCron.GetNextOccurrence(DateTime.UtcNow);
```

### 批处理优化 ###

```csharp
// 批量计算未来100次执行
public List<DateTime> GetNextOccurrencesBatch(
    CronExpression cron, 
    int count, 
    TimeZoneInfo tz)
{
    var results = new List<DateTime>(count);
    DateTime? current = DateTime.UtcNow;
    
    for (int i = 0; i < count; i++)
    {
        current = cron.GetNextOccurrence(current.Value, tz);
        if (!current.HasValue) break;
        results.Add(current.Value);
    }
    
    return results;
}
```

## 常见使用场景 ##

### 轻量级定时任务 ###

在 `Console`、`Worker Service` 中驱动周期性作业，无需完整 Quartz。

### 动态调度配置 ###

从数据库或配置文件加载 Cron 表达式，运行时动态调整执行计划。

### 延迟/重试机制 ###

配合消息队列，实现复杂的重试策略（如间隔指数级、以下午/深夜时段执行等）。

### 报表/统计 ###

定时生成日报、月报，可通过表达式控制「最后一个工作日」等复杂规则。

## 与其他工具的对比 ##

**NCrontab**：

- 广泛用于 Azure Functions 和其他 .NET 应用。

- 支持五字段和六字段表达式，但夏令时处理不如 Cronos 直观。

- 性能略低于 Cronos（解析约 100 ns vs 30 ns）。

- 社区支持更强，文档丰富。

**Cronos**：

- 更现代的 API，支持 DateTimeOffset 和时区。

- 夏令时处理更符合 Vixie Cron。

- 性能更高，适合高频任务。

## 资源和文档 ##

- NuGet 包：[https://www.nuget.org/packages/Cronos](https://www.nuget.org/packages/Cronos)

- Cron 表达式测试工具：[crontab.guru](https://crontab.guru/)

## 总结 ##

Cronos 是现代 .NET 应用中处理 cron 表达式的首选轻量级解决方案，尤其适合：

- 需要精确跨时区调度的全球性应用

- 运行在资源受限环境（如 AWS Lambda）

- 高频触发的定时任务（>1次/秒）

- 与 Hangfire 深度集成的调度系统
