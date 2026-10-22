---
lastUpdated: true
commentabled: true
recommended: true
title: ASP.NET Core 后台任务
description: 从生命周期到“不会重入”的周期执行
date: 2026-10-19 09:55:00
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

在 ASP.NET Core 中，后台任务通常以托管服务（hosted service）实现：它由宿主启动和停止，而不是由控制器或某个 HTTP 请求直接拥有。这个边界决定了实现细节：启动阶段不能做长时间阻塞工作；关闭时必须响应取消；需要 scoped 依赖时要自行创建作用域；周期执行还要明确是否允许上一次尚未结束时再次触发。

## 先分清两个生命周期入口 ##

`IHostedService` 定义了 `StartAsync(CancellationToken)` 与 `StopAsync(CancellationToken)`。官方文档指出，默认情况下托管服务按注册顺序启动；在 `StartAsync` 返回前，后续服务不会启动。因此 `StartAsync` 适合快速完成初始化和启动后台循环，不适合直接做耗时的数据同步或全量扫描。

`BackgroundService` 是实现长时间运行 `IHostedService` 的基类。它的 `ExecuteAsync(CancellationToken)` 返回的 `Task` 表示整个后台服务的生命周期；宿主在停止阶段会等待它完成。实现中应把传入的 `stoppingToken` 传给可取消的异步 API，并在收到取消后尽快结束。

## 一个顺序执行的周期任务 ##

对于“上一次完成后再等待一个周期”的任务，`PeriodicTimer` 很适合表达这种语义：循环体是 `await` 串行执行的，下一次等待发生在本次工作结束之后。

下面示例中的 `RefreshAsync` 只是待接入的业务逻辑，示例本身未经运行验证。

```cs
public sealed class CatalogRefreshWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<CatalogRefreshWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // 先让 ExecuteAsync 异步让出，避免阻塞其他托管服务的启动。
        await Task.Yield();

        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var refresher = scope.ServiceProvider
                    .GetRequiredService<ICatalogRefresher>();

                await refresher.RefreshAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // 关闭流程请求取消：跳出循环，让宿主继续停止。
                break;
            }
            catch (Exception ex)
            {
                // 单次失败不应悄悄终止整个后台服务。
                logger.LogError(ex, "Catalog refresh failed.");
            }
        }
    }
}
```

注册保持简单：

```cs
builder.Services.AddScoped<ICatalogRefresher, CatalogRefresher>();
builder.Services.AddHostedService<CatalogRefreshWorker>();
```

## 为什么这里要创建 scope ##

托管服务以 `singleton` 方式注册，不能把 `scoped` 服务（例如常见的 `DbContext`）直接通过构造函数注入后长期持有。官方示例的做法是在每次工作时创建 `scope`，再从该 `scope` 解析 `scoped` 服务。这样依赖的生命周期与这一次处理绑定，处理结束即可释放。

示例使用 `CreateAsyncScope()`，并以 `await using` 管理作用域；如果你的依赖只需要同步释放，也可以使用 `CreateScope()` 与 `using`。关键不是选哪一个方法，而是不要把一次处理的 `scoped` 对象缓存到后台服务实例字段中。

## Timer 方案的一个容易遗漏的边界 ##

官方的 `System.Threading.Timer` 示例明确提醒：它不会等待上一次 `DoWork` 完成。也就是说，执行耗时超过周期时，回调可能并发重入。若任务可以安全并发，需自行保护共享状态；若任务必须串行，更应选择像上例这样将工作 `await` 在循环中的写法，或明确使用队列/互斥策略。

这也解释了为什么“把异步方法塞进 Timer 回调”常常不够：真正需要确认的是重叠执行、异常观察和关闭取消，而不只是能否按时触发。

## 关闭阶段要按取消信号收尾 ##

在正常的优雅关闭中，宿主会调用 `StopAsync` 并传入取消令牌。文档说明默认关闭超时为 30 秒；取消被请求后，剩余后台操作应停止，`StopAsync` 调用的方法应尽快返回。不过，调用方仍会等待任务完成。进程异常退出时 `StopAsync` 可能根本不会执行，因此不能把唯一的数据一致性保障只放在这里。

实际业务中，把每次处理设计为可重试、幂等，并在工作入口就检查取消，通常比在关闭钩子里补救更可靠。

## 落地检查清单 ##

- `StartAsync` 是否只做快速启动，而非同步执行完整任务？
- `ExecuteAsync` 是否尽早异步让出，并把 `stoppingToken` 传给等待与 I/O？
- 每次任务是否新建 `scope`，而非持有 `scoped` 依赖？
- 周期任务是否明确允许重入；如果不允许，是否采用顺序循环或其他串行化机制？
- 单次异常是否被记录，并且不会无声地让服务整体退出？

> 别把 BackgroundService 当成“无限循环”：.NET Worker 中作用域与停止信号的落地方式

不少 .NET 后台任务最初只有一段 `while (true)`：拉取队列、扫表、定时同步都往里面塞。代码能跑，但一旦要停止进程、使用 scoped 依赖，或者排查一次循环究竟做了什么，问题就会集中出现。

.NET 的 Worker Service 并不是单独的一套运行时模型。官方文档说明，`BackgroundService` 是 `IHostedService` 的一个实现；在 Generic Host 中运行的托管服务天然接入日志、配置和依赖注入。`Worker` 模板通过 `AddHostedService<Worker>()` 注册服务，再构建并运行 `IHost`。

## 先明确：循环的退出条件属于业务代码 ##

模板中的 Worker 重写 `ExecuteAsync(CancellationToken stoppingToken)`，并在 `stoppingToken.IsCancellationRequested` 为 `false` 时循环。重点不在“每秒打印一次日志”，而在于宿主把停止信号通过这个令牌交给执行代码。

```cs
public sealed class PollingWorker(ILogger<PollingWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            logger.LogInformation("开始一次轮询：{Time}", DateTimeOffset.UtcNow);

            await PollOnceAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }

    private static Task PollOnceAsync(CancellationToken cancellationToken)
    {
        // 将 cancellationToken 继续传给实际 I/O 或计算操作。
        return Task.CompletedTask;
    }
}
```

这里有两个容易被忽略的细节：

- `Task.Delay` 也应接收同一个令牌。否则停止请求来到后，服务可能仍在等待整个间隔。
- 不要只在循环条件里检查令牌。一次轮询内部如果调用数据库、HTTP 或队列客户端，也应优先使用其接受 `CancellationToken` 的重载。

这不意味着所有操作都会立刻中断；具体行为取决于被调用 API 是否响应取消。但把令牌沿调用链传下去，至少让宿主的停止意图有机会抵达真正耗时的操作。

## 为什么不能在构造函数里直接注入 `scoped` 服务 ##

官方的 scoped-service 指南明确指出：用 `AddHostedService` 注册的 `IHostedService` 是 `singleton`；而 hosted service 默认不会自动创建作用域。因此，如果一次处理需要 scoped 生命周期的组件，例如依赖 `DbContext` 的处理器，应该在每次工作单元中显式创建作用域，而不是把它长期保存在 Worker 字段里。

一个实用的分层方式是：Worker 只负责调度、停止和日志边界；真正的业务处理交给 scoped service。

```cs
public interface IOrderSyncJob
{
    Task RunOnceAsync(CancellationToken cancellationToken);
}

public sealed class OrderSyncWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<OrderSyncWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await using AsyncServiceScope scope = scopeFactory.CreateAsyncScope();

            IOrderSyncJob job = scope.ServiceProvider
                .GetRequiredService<IOrderSyncJob>();

            await job.RunOnceAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    public override async Task StopAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("OrderSyncWorker 正在停止");
        await base.StopAsync(stoppingToken);
    }
}
```

这段结构与官方示例一致：通过 `IServiceScopeFactory.CreateAsyncScope()` 建立异步作用域，从作用域的服务提供程序解析 `scoped` 处理器，然后把停止令牌传给处理方法与延迟操作。`await using` 让异步可释放依赖在本轮结束时得到释放。

## 把“一次工作”做成可观察、可恢复的单元 ##

在生产代码里，`RunOnceAsync` 不宜变成另一段没有边界的大方法。可以把一次处理的开始、处理数量、失败分类和耗时记录下来；同时避免把所有异常吞掉后继续下一轮。对于可预期的短暂故障，可在明确的重试策略中处理；对于配置错误、数据契约变化等不可恢复问题，应记录足以定位的上下文，并根据系统约定决定是否终止服务。

另一个常见选择是把“下一次执行时间”作为业务规则，而不是把固定 Delay 散落在多个分支里。例如，轮询成功、没有数据、上游限流时，可能需要不同的等待时间。无论采用哪种规则，延迟调用仍应携带 `stoppingToken`。

## 不要把性能开关当作模板默认项 ##

Worker 文档还提到，Worker 模板默认不会启用 Server GC，并建议长时间运行的服务结合自身场景评估。这个结论不等于“Worker 都应该打开 Server GC”：内存、CPU、延迟目标和部署环境都会影响选择。把运行时配置写进项目文件前，应先用自身工作负载验证，而不是因模板类型直接套用。

## 检查清单 ##

- **停止：**循环条件、延迟和主要 I/O 是否都接收同一个取消令牌？
- **生命周期：**是否把 scoped 依赖放进了 singleton Worker？每轮工作是否需要独立作用域？
- **边界：**一次工作是否有明确输入、日志和失败处理，而不是无限增长的循环体？
- **配置：**GC、间隔、并发与重试是否基于真实负载验证？

把 Worker 写成“宿主控制的循环 + 可独立测试的一次工作”，通常比堆砌更多后台框架更重要。停止信号、作用域和可观察性这三件事先处理好，后续接入队列、数据库或定时策略时，代码边界会清晰得多。
