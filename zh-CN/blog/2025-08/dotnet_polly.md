---
lastUpdated: true
commentabled: true
recommended: true
title: .NET 处理瞬态故障 Polly库 详解
description: .NET 处理瞬态故障 Polly库 详解
date: 2025-08-04 14:00:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介 ##

`Polly` 是处理 `.NET` 应用中瞬态故障的强大工具，通过提供丰富的弹性策略，帮助开发者构建更健壮、更具弹性的应用程序。合理使用 `Polly` 可以显著提高应用在面对网络波动、服务临时不可用等问题时的稳定性。

## Polly 核心策略详解 ##

`Polly` 提供七种策略应对不同故障场景，均支持流畅 `API` 链式调用

- 重试 (`Retry`)：短暂故障（如网络抖动）
- 熔断 (`Circuit Breaker`)：持续故障避免系统过载
- 超时 (`Timeout`)：防止长时间阻塞
- 隔板隔离 (`Bulkhead`)：限制并发资源消耗
- 回退 (`Fallback`)：失败时提供降级响应
- 缓存 (`Cache`)：高频数据加速访问
- 策略包装 (`PolicyWrap`)：组合多策略应对复杂故障

### 应用场景 ###

- 调用远程服务（`REST API`、微服务）
- 数据库操作
- 文件系统访问
- 任何可能出现暂时性故障的操作

### 示例 - 熔断+重试组合策略 ###

```csharp
var policy = Policy.Wrap(
    Policy.Handle<HttpRequestException>()
        .CircuitBreaker(5, TimeSpan.FromSeconds(30)),
    Policy.Handle<TimeoutException>()
        .WaitAndRetry(3, attempt => TimeSpan.FromSeconds(attempt))
);
policy.Execute(() => CallExternalService());
```

## Polly 基本使用 ##

### 安装 NuGet 包 ###

```shell
dotnet add package Polly
```

### 基本策略使用模式 ###

```csharp
// 创建策略
var policy = Policy
    .Handle<HttpRequestException>()  // 处理特定异常
    .Retry(3);  // 重试3次

// 执行受策略保护的操作
await policy.ExecuteAsync(async () =>
{
    // 可能会失败的操作（如HTTP请求）
    var response = await httpClient.GetAsync("https://api.example.com/data");
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadAsStringAsync();
});
```

## 核心策略详解 ##

### 重试策略（Retry） ###

```csharp
// 简单重试3次
var retryPolicy = Policy
    .Handle<Exception>()
    .Retry(3);

// 带退避算法的重试（指数退避）
var retryWithBackoffPolicy = Policy
    .Handle<Exception>()
    .WaitAndRetryAsync(
        retryCount: 5,
        sleepDurationProvider: retryAttempt => 
            TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),  // 2, 4, 8, 16, 32秒
        onRetry: (exception, sleepDuration, retryCount, context) =>
        {
            Console.WriteLine($"重试 {retryCount}: 等待 {sleepDuration.TotalSeconds}s 后重试，异常: {exception.Message}");
        });
```

### 断路器策略（Circuit Breaker） ###

```csharp
// 简单断路器：连续3次失败后断开，断开30秒
var circuitBreakerPolicy = Policy
    .Handle<Exception>()
    .CircuitBreaker(
        exceptionsAllowedBeforeBreaking: 3,
        durationOfBreak: TimeSpan.FromSeconds(30),
        onBreak: (ex, breakDelay) => Console.WriteLine($"断路器断开: {ex.Message}"),
        onReset: () => Console.WriteLine("断路器重置"),
        onHalfOpen: () => Console.WriteLine("断路器半开状态")
    );

// 高级断路器：基于失败比例（统计窗口内）
var advancedCircuitBreaker = Policy
    .Handle<Exception>()
    .AdvancedCircuitBreaker(
        failureThreshold: 0.5,  // 50%的请求失败
        samplingDuration: TimeSpan.FromSeconds(30),  // 统计30秒内的请求
        minimumThroughput: 10,  // 至少10次请求才开始统计
        durationOfBreak: TimeSpan.FromSeconds(30)
    );
```

### 超时策略（Timeout） ###

```csharp
// 超时策略：操作超过5秒则终止
var timeoutPolicy = Policy
    .Timeout(TimeSpan.FromSeconds(5), TimeoutStrategy.Pessimistic);

// 使用悲观超时策略并处理超时异常
try
{
    await timeoutPolicy.ExecuteAsync(async () =>
    {
        // 可能耗时较长的操作
        await Task.Delay(10000);
        return "操作完成";
    });
}
catch (TimeoutRejectedException ex)
{
    Console.WriteLine($"操作超时: {ex.Message}");
}
```

### 隔离舱策略（Bulkhead Isolation） ###

```csharp
// 隔离舱：限制并发执行的操作数量
var bulkheadPolicy = Policy
    .Bulkhead(
        maxParallelization: 10,  // 最多10个并发操作
        maxQueuingActions: 5,    // 最多5个操作排队等待
        onBulkheadRejected: context => 
            Console.WriteLine("隔离舱已满，请求被拒绝")
    );

// 使用隔离舱策略
await bulkheadPolicy.ExecuteAsync(async () =>
{
    // 受隔离舱保护的操作
    await DoWorkAsync();
});
```

### 降级策略（Fallback） ###

```csharp
// 降级策略：操作失败时提供备选值
var fallbackPolicy = Policy
    .Handle<Exception>()
    .FallbackAsync(
        fallbackValue: "默认值",
        fallbackAction: async ct => // 降级操作
        {
            return await CacheService.GetLatestDataAsync();
        },
        onFallbackAsync: ex =>
        {
            Console.WriteLine($"执行失败，使用降级策略: {ex.Exception.Message}");
            return Task.CompletedTask;
        }
    );

// 使用降级策略
var result = await fallbackPolicy.ExecuteAsync(async () =>
{
    // 可能失败的操作
    return await GetDataFromServiceAsync();
});
```

### 缓存策略 (Cache) ###

```csharp
// 内存缓存策略
var cachePolicy = Policy.Cache(
    new MemoryCacheProvider(myMemoryCache),
    TimeSpan.FromMinutes(5)); // TTL=5分钟

// 使用示例
var result = cachePolicy.Execute(context => 
    ExpensiveOperation(), new Context("cache_key"));
```

### 策略包装（Policy Wrap） ###

```csharp
var policyWrap = Policy.WrapAsync(fallbackPolicy, retryPolicy, circuitBreakerPolicy, timeoutPolicy);
var result = await policyWrap.ExecuteAsync(ct => _context.Users.FirstOrDefaultAsync(ct), cancellationToken);
```

### 健康检查策略 ###

```csharp
// 定义健康检查策略
var healthPolicy = Policy
    .Handle<Exception>()
    .AdvancedCircuitBreaker(...)
    .WrapAsync(Policy.TimeoutAsync(TimeSpan.FromSeconds(3)));

// 健康检查端点
app.MapGet("/health", async () => 
{
    var healthResult = await healthPolicy.ExecuteAsync(async () => 
    {
        await db.CheckHealthAsync();
        await queue.CheckHealthAsync();
    });
    
    return healthResult.IsHealthy ? 
        Results.Ok() : Results.StatusCode(503);
});
```

## 组合策略 ##

`Polly` 允许将多个策略组合成一个策略链（`Policy Wrap`）：

```csharp
// 组合重试、断路器和超时策略
var policyWrap = Policy.WrapAsync(
    circuitBreakerPolicy,    // 最外层：断路器
    retryWithBackoffPolicy,  // 中间层：带退避的重试
    timeoutPolicy            // 最内层：超时
);

// 使用组合策略执行操作
await policyWrap.ExecuteAsync(async () =>
{
    // 受多重策略保护的操作
    var response = await httpClient.GetAsync("https://api.example.com/data");
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadAsStringAsync();
});
```

## 策略上下文（Context） ##

通过 `Context` 可以在策略执行过程中传递自定义数据：

```csharp
// 创建带上下文的策略
var policy = Policy
    .Handle<Exception>()
    .RetryAsync(3, (ex, retryCount, context) =>
    {
        // 从上下文中获取数据
        if (context.ContainsKey("RequestId"))
        {
            Console.WriteLine($"请求 {context["RequestId"]} 重试 {retryCount}: {ex.Message}");
        }
    });

// 执行策略时传递上下文
await policy.ExecuteAsync(
    async context =>
    {
        // 执行受保护的操作
        return await DoWorkAsync();
    },
    new Context { { "RequestId", Guid.NewGuid().ToString() } }
);
```

## Polly 与 HttpClient 集成 ##

### 使用 Polly 与 HttpClientFactory ###

```csharp
// 注册 HttpClient 并应用 Polly 策略
services.AddHttpClient("ResilientClient")
    .AddPolicyHandler(GetRetryPolicy())
    .AddPolicyHandler(GetCircuitBreakerPolicy());

// 定义重试策略
private IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()  // 处理常见HTTP错误（408, 500-599）
        .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.NotFound)
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
            onRetry: (response, sleepDuration, retryCount, context) =>
            {
                Console.WriteLine($"HTTP请求失败，重试 {retryCount}: {response.Result?.StatusCode}");
            }
        );
}

// 定义断路器策略
private IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .CircuitBreakerAsync(
            exceptionsAllowedBeforeBreaking: 3,
            durationOfBreak: TimeSpan.FromSeconds(30)
        );
}
```

### 在控制器中使用 ###

```csharp
public class MyController : ControllerBase
{
    private readonly HttpClient _httpClient;
    
    public MyController(IHttpClientFactory clientFactory)
    {
        _httpClient = clientFactory.CreateClient("ResilientClient");
    }
    
    [HttpGet]
    public async Task<IActionResult> GetData()
    {
        var response = await _httpClient.GetAsync("https://api.example.com/data");
        response.EnsureSuccessStatusCode();
        return Ok(await response.Content.ReadAsStringAsync());
    }
}
```

## 高级特性 ##

### 策略注册表（Policy Registry） ###

```csharp
// 注册策略到注册表
var policyRegistry = new PolicyRegistry
{
    { "RetryPolicy", Policy.Handle<Exception>().Retry(3) },
    { "CircuitBreakerPolicy", Policy.Handle<Exception>().CircuitBreaker(3, TimeSpan.FromSeconds(30)) }
};

// 从注册表获取策略
var retryPolicy = policyRegistry.Get<IAsyncPolicy>("RetryPolicy");
```

### 自定义策略 ###

```csharp
// 创建自定义策略：记录所有操作
var loggingPolicy = Policy
    .Handle<Exception>()
    .ExecuteAndCaptureAsync(async (ctx, cancellationToken) =>
    {
        Console.WriteLine($"开始执行操作: {ctx.OperationKey}");
        try
        {
            var result = await ctx.CancellationToken.HasValue
                ? ctx.Action(ctx, ctx.CancellationToken.Value)
                : ctx.Action(ctx, CancellationToken.None);
                
            Console.WriteLine($"操作成功: {ctx.OperationKey}");
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"操作失败: {ctx.OperationKey}, 异常: {ex.Message}");
            throw;
        }
    });
```

### 分布式断路器 ###

```csharp
// 使用Redis实现分布式断路器
public class RedisCircuitBreaker : AsyncCircuitBreakerPolicy
{
    private readonly IDistributedCache _cache;
    
    public RedisCircuitBreaker(IDistributedCache cache)
    {
        _cache = cache;
    }
    
    protected override async Task<bool> IsolateCircuitAsync(...)
    {
        var state = new CircuitState(State.Closed);
        await _cache.SetAsync("CircuitState", state);
    }
    
    protected override async Task<CircuitState> GetCircuitStateAsync()
    {
        return await _cache.GetAsync<CircuitState>("CircuitState");
    }
}
```

### 自适应弹性策略 ###

```csharp
// 基于响应时间自动调整超时
var adaptiveTimeout = Policy.TimeoutAsync(() => 
{
    var avgResponseTime = Telemetry.GetAvgResponseTime("ServiceA");
    return avgResponseTime * 1.5; // 平均响应时间的1.5倍
});
```

### gRPC 弹性处理 ###

```csharp
// gRPC 弹性策略
var grpcPolicy = Policy
    .Handle<RpcException>(ex => 
        ex.StatusCode == StatusCode.Unavailable ||
        ex.StatusCode == StatusCode.DeadlineExceeded)
    .WaitAndRetryAsync(3, attempt => 
        TimeSpan.FromSeconds(attempt * 2));

// 使用
var client = new Greeter.GreeterClient(channel);
var response = await grpcPolicy.ExecuteAsync(() => 
    client.SayHelloAsync(new HelloRequest()).ResponseAsync);
```

## 性能优化策略 ##

### 策略重用与缓存 ###

```csharp
// 策略工厂模式（避免重复创建）
public static class PolicyFactory
{
    private static ConcurrentDictionary<string, IAsyncPolicy> _policies = new();
    
    public static IAsyncPolicy GetOrCreatePolicy(string key, Func<IAsyncPolicy> createPolicy)
    {
        return _policies.GetOrAdd(key, _ => createPolicy());
    }
}

// 使用示例
var policy = PolicyFactory.GetOrCreatePolicy("CircuitBreakerPolicy", () => 
    Policy.Handle<Exception>()
          .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30));
```

### 上下文传递与监控 ###

```csharp
// 策略上下文配置
var context = new Context
{
    {"OperationName", "GetUserData"},
    {"RequestId", Guid.NewGuid()}
};

// 策略执行
await policy.ExecuteAsync(async ctx => 
{
    var requestId = ctx["RequestId"];
    Telemetry.StartTracking(requestId);
    // 业务逻辑
}, context);

// 事件钩子
var policyWithEvents = Policy
    .Handle<Exception>()
    .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30),
    onBreak: (ex, breakDelay, ctx) => 
    {
        Telemetry.TrackCircuitBreak(ctx["OperationName"].ToString());
    },
    onReset: ctx => 
    {
        Telemetry.TrackCircuitReset(ctx["OperationName"].ToString());
    });
```

### 错误处理模式 ###

```csharp
try
{
    return await _resilientPolicy.ExecuteAsync(BusinessOperation);
}
catch (BrokenCircuitException)
{
    // 处理开路状态
    return ServiceUnavailable();
}
catch (TimeoutRejectedException)
{
    // 处理超时
    return GatewayTimeout();
}
catch (BulkheadRejectedException)
{
    // 处理限流
    return TooManyRequests();
}
catch (Exception ex)
{
    // 其他异常
    return InternalError(ex);
}
```

### Polly架构黄金法则 ###

```csharp
Policy.WrapAsync(
    FallbackPolicy.ForDegradedService(),    // 降级保护
    TimeoutPolicy.ForSlowServices(),        // 超时控制
    CircuitBreakerPolicy.ForProtection(),   // 短路保护
    BulkheadPolicy.ForConcurrency(),        // 资源保护
    RetryPolicy.ForTransientFaults()        // 重试机制
);
```

## 混沌工程与性能优化 ##

V8 版本引入 混沌工程策略，模拟生产环境故障以验证系统韧性

```csharp
builder.AddResilienceHandler("chaos-pipeline", pipelineBuilder => {
    pipelineBuilder
        .AddRetry(new RetryStrategyOptions { /*...*/ })
        .AddChaosFault(0.02, () => new InvalidOperationException("模拟故障")) // 2% 请求注入异常
        .AddChaosLatency(0.01, TimeSpan.FromSeconds(5)); // 1% 请求增加 5s 延迟
});
```

- **混沌注入类型**：故障(`Fault`)、错误结果(`Outcome`)、延迟(`Latency`)、自定义行为(`Behavior`)
- **动态控制**：通过 `InjectionRate` 和 `EnabledGenerator` 动态调整注入频率


## 集成应用实践 ##

### 与 HttpClient 深度集成 ###

通过 `Microsoft.Extensions.Http.Polly` 包实现声明式策略配置

```csharp
services.AddHttpClient("ResilientClient")
    .AddPolicyHandler(Policy.TimeoutAsync<HttpResponseMessage>(10))
    .AddTransientHttpErrorPolicy(policyBuilder => 
        policyBuilder.WaitAndRetryAsync(3, attempt => TimeSpan.FromSeconds(attempt)));
```

### ASP.NET Core 全局策略注册 ###

```csharp
services.AddSingleton<AsyncRetryPolicy>(Policy
    .Handle<SqlException>()
    .WaitAndRetryAsync(3, attempt => TimeSpan.FromSeconds(2))
);
services.AddMvc().AddPollyPolicies(); // 配合 AOP 框架如 AspectCore 使用
```

## 高级应用场景 ##

### 电商订单系统熔断设计 ###


- 触发条件：支付服务连续 5 次超时或返回 5xx 错误
- 熔断动作：开启 30 秒熔断，快速返回“服务暂不可用”提示
- 半开状态：熔断结束后首个请求成功则闭合，否则再次熔断

### 金融交易系统隔板隔离 ###

- 资源配置：核心交易线程池（10 线程），报表查询线程池（20 线程）
- 效果：交易高负载时，报表查询不受影响，避免级联故障


## 性能优化 ##

- 策略复用：单例模式管理 `Policy` 对象，避免重复创建
- 异步支持：优先使用 `RetryAsync`、`ExecuteAsync` 异步方法
- 上下文传递：利用 `Context` 对象传递参数，支持动态策略调整

## 混沌工程 ##

混沌工程是通过在生产或类生产环境中故意引入故障（如异常、延迟、假结果），测试系统在异常条件下的行为，以增强系统对不可预测故障的弹性（`Resilience`）。它源自 `Netflix` 的 `Simian Army` 项目（如 `Chaos Monkey`），旨在验证系统是否能承受“混乱”场景。其核心目标是：

- 暴露系统脆弱点：模拟生产环境中的非常规故障（如网络抖动、服务不可用）。
- 检验弹性策略有效性：验证重试、熔断等策略是否能正确处理注入的故障。
- 提升系统韧性：通过可控的混沌实验，增强系统抵御真实故障的能力。

### Polly V8 的优势 ###

- 无缝集成：与 `Polly` 的弹性策略（如重试、断路器）结合，测试弹性机制。
- 灵活配置：支持同步/异步操作，统一 `API`（`ChaosStrategyOptions`）
- 生产环境测试：在生产环境中以可控方式注入故障，无需修改核心代码。
- `telemetry` 支持：通过 `Polly` 的遥测（`Telemetry`）系统记录混沌事件。

### 常见混沌实验类型 ###

- 服务响应超时
- 随机抛出异常
- 模拟网络抖动
- 限制资源（CPU、内存）

### 使用场景 ###

- `HTTP` 请求：测试 `API` 调用在网络延迟或失败时的弹性。
- 数据库操作：模拟 `EF Core` 的 `SqlException` 或 `DbUpdateConcurrencyException`。
- 后台任务：结合 `BackgroundService` 和 `ConcurrentQueue<T>` 测试批量任务的容错。
- `CQRS` 架构：在命令/查询处理程序中注入故障，验证业务逻辑的鲁棒性。
- 微服务：模拟服务间通信失败，测试分布式系统的可靠性。

### 核心混沌策略 ###

Polly V8 提供四类策略，支持细粒度故障模拟：

| 策略类型  |  作用  |  典型场景  |   备注 |
| :-------: | :---------: | :--------: | :----------: |
| 故障注入 (Fault) | 抛出自定义异常 | 模拟服务崩溃、依赖失效 |  |
| 结果注入 (Outcome) | 返回错误结果或异常 | 测试客户端对错误响应的处理逻辑 |  |
| 延迟注入 (Latency) | 增加处理延迟 | 模拟网络拥塞或资源竞争 |  |
| 行为注入 (Behavior) | 执行自定义操作（如重启服务） | 验证系统自愈能力 |  |

### 精细化控制参数 ###

| 参数  |  类型  |  默认值  |   作用 |
| :-------: | :---------: | :--------: | :----------: |
| `InjectionRate` | `double (0-1)` | 0.001 | 混沌触发概率（如0.05表示5%的请求受影响） |
| `InjectionRateGenerator` | `Func<double>` | null | 动态生成注入率（支持按请求上下文调整） |
| `EnabledGenerator` | `Func<bool>` | null | 动态启用策略（例如仅在测试环境激活） |

### 核心混沌策略 ###

#### Fault（故障注入） ####

注入异常（如 `TimeoutException`），模拟系统错误。

```csharp
var faultOptions = new ChaosFaultStrategyOptions
{
    FaultGenerator = new FaultGenerator()
        .AddException<TimeoutException>()
        .AddException(() => new InvalidOperationException("Chaos fault")),
    InjectionRate = 0.1, // 10% 概率
    OnFaultInjected = args =>
    {
        Console.WriteLine($"Fault injected: {args.Fault.Message}");
        return default;
    }
};
new ResiliencePipelineBuilder().AddChaosFault(faultOptions);
```

#### Outcome（结果注入） ####

注入假结果或异常，测试应用对不同响应的处理。

```csharp
var outcomeOptions = new ChaosOutcomeStrategyOptions
{
    OutcomeGenerator = args => new ValueTask<Outcome<object>>(new Outcome<object>(42)), // 注入假结果 42
    InjectionRate = 0.1,
    OnOutcomeInjected = args =>
    {
        Console.WriteLine($"Outcome injected: {args.Outcome.Result}");
        return default;
    }
};
new ResiliencePipelineBuilder().AddChaosOutcome(outcomeOptions);
```

#### Latency（延迟注入） ####

在操作前引入延迟，模拟网络或服务瓶颈。

```csharp
var latencyOptions = new ChaosLatencyStrategyOptions
{
    Latency = TimeSpan.FromSeconds(5),
    InjectionRate = 0.05,
    OnLatencyInjected = args =>
    {
        Console.WriteLine($"Latency injected: {args.Latency.TotalSeconds} seconds");
        return default;
    }
};
new ResiliencePipelineBuilder().AddChaosLatency(latencyOptions);
```

#### Behavior（行为注入） ####

在操作前执行自定义行为（如重启 Redis）。

```csharp
var behaviorOptions = new ChaosBehaviorStrategyOptions
{
    BehaviorGenerator = args => RestartRedisAsync(args.Context.CancellationToken),
    InjectionRate = 0.05,
    OnBehaviorInjected = args =>
    {
        Console.WriteLine("Behavior injected");
        return default;
    }
};
new ResiliencePipelineBuilder().AddChaosBehavior(behaviorOptions);

async Task RestartRedisAsync(CancellationToken ct)
{
    // 模拟重启 Redis
    await Task.Delay(100, ct);
}
```

#### 组合混沌策略 ####

```csharp
var pipeline = new ResiliencePipelineBuilder()
    .AddRetry(new RetryStrategyOptions { MaxRetryAttempts = 3, Delay = TimeSpan.FromSeconds(2) })
    .AddChaosFault(new ChaosFaultStrategyOptions { FaultGenerator = new FaultGenerator().AddException<TimeoutException>(), InjectionRate = 0.1 })
    .AddChaosLatency(new ChaosLatencyStrategyOptions { Latency = TimeSpan.FromSeconds(5), InjectionRate = 0.05 })
    .Build();
```

```csharp
// 组合异常注入和延迟注入策略
var chaosPolicy = Policy.WrapAsync(
    faultInjectionPolicy,
    latencyInjectionPolicy
);

// 执行受混沌策略影响的操作
await chaosPolicy.ExecuteAsync(async () =>
{
    // 可能会被注入故障或延迟的操作
    return await FetchDataFromServiceAsync();
});
```

### 混沌实验设计与执行 ###

#### 实验参数配置 ####

```csharp
// 使用配置对象创建混沌策略
var chaosSettings = new ChaosSettings
{
    Enabled = true,
    FaultType = FaultType.Exception,  // 或 Latency
    InjectionRate = 0.1,  // 10%的故障率
    ExceptionType = typeof(TransientFailureException),
    Latency = TimeSpan.FromSeconds(1)
};

var chaosPolicy = Policy
    .HandleResult<string>(_ => true)
    .InjectChaosAsync(chaosSettings);
```

#### 渐进式混沌实验 ####

```csharp
// 随着时间增加故障率
var injectionRateProvider = new InjectionRateSlidingWindow(
    initialInjectionRate: 0.05,  // 初始5%故障率
    maxInjectionRate: 0.2,       // 最大20%故障率
    windowDuration: TimeSpan.FromMinutes(5)  // 每5分钟增加一次
);

var chaosPolicy = Policy
    .HandleResult<int>(_ => true)
    .InjectExceptionAsync(
        injectionRateProvider: () => injectionRateProvider.CurrentInjectionRate,
        faultFactory: () => new TransientFailureException("系统压力测试")
    );
```

### 与弹性策略的管道集成 ###

混沌策略需置于标准弹性策略之后，形成“先防御后攻击”的管道

```csharp
services.AddHttpClient("ResilientClient")
    .AddResilienceHandler("chaos-pipeline", builder => 
    {
        // 标准弹性策略
        builder
            .AddRetry(new RetryStrategyOptions { MaxRetryAttempts = 3 })
            .AddCircuitBreaker(new CircuitBreakerStrategyOptions { FailureRatio = 0.3 })
            .AddTimeout(TimeSpan.FromSeconds(10));
        
        // 混沌策略（置于弹性策略后）
        builder
            .AddChaosLatency(0.05, TimeSpan.FromSeconds(15))
            .AddChaosFault(0.03, () => new HttpRequestException("Chaos fault"));
    });

// 创建弹性策略（重试 + 断路器）
var resiliencePolicy = Policy.WrapAsync(
    Policy.Handle<Exception>().RetryAsync(3),
    Policy.Handle<Exception>().CircuitBreakerAsync(3, TimeSpan.FromSeconds(30))
);

// 创建混沌策略
var chaosPolicy = Policy
    .HandleResult<string>(_ => true)
    .InjectExceptionAsync(0.1, () => new HttpRequestException("模拟网络故障"));

// 组合策略：先应用混沌，再应用弹性
var combinedPolicy = Policy.WrapAsync(resiliencePolicy, chaosPolicy);

// 执行受保护的操作
await combinedPolicy.ExecuteAsync(async () =>
{
    return await httpClient.GetStringAsync("https://api.example.com/data");
});
```

管道执行顺序：`请求 → 重试 → 熔断 → 超时 → 注入延迟/故障 → 目标服务`

### 在测试环境中使用 ###

#### 单元测试示例 ####

```csharp
[Fact]
public async Task GetData_ShouldSucceed_WhenTransientFailureOccurs()
{
    // 安排：创建带有故障注入的策略
    var chaosPolicy = Policy
        .HandleResult<string>(_ => true)
        .InjectExceptionAsync(
            injectionRate: 0.5,  // 50%的故障率
            faultFactory: () => new HttpRequestException("模拟网络故障")
        );
    
    // 安排：创建带有重试策略的服务
    var service = new MyService(
        httpClient: _httpClient,
        resiliencePolicy: Policy.WrapAsync(
            Policy.Handle<HttpRequestException>().RetryAsync(3),
            chaosPolicy
        )
    );
    
    // 执行
    var result = await service.GetDataAsync();
    
    // 断言：尽管有故障注入，服务仍应成功返回数据
    Assert.NotNull(result);
}
```

#### 集成测试配置 ####

```csharp
// 在测试环境中启用混沌工程
public void ConfigureServices(IServiceCollection services)
{
    if (Environment.IsDevelopment() || Environment.IsStaging())
    {
        // 添加混沌策略
        services.AddTransient<MyService>(sp =>
        {
            var httpClient = sp.GetRequiredService<HttpClient>();
            
            // 创建混沌策略
            var chaosPolicy = Policy
                .HandleResult<string>(_ => true)
                .InjectChaosAsync(new ChaosSettings
                {
                    Enabled = true,
                    FaultType = FaultType.Exception,
                    InjectionRate = 0.1,
                    ExceptionType = typeof(HttpRequestException)
                });
                
            // 创建弹性策略
            var resiliencePolicy = Policy.WrapAsync(
                Policy.Handle<Exception>().RetryAsync(3),
                chaosPolicy
            );
            
            return new MyService(httpClient, resiliencePolicy);
        });
    }
    else
    {
        // 在生产环境中不启用混沌
        services.AddTransient<MyService>();
    }
}
```

## ASP.NET Core Web 项目中 Polly 实战 ##

### 基础环境配置 ###

#### 安装 NuGet 包 ####

```shell
dotnet add package Microsoft.Extensions.Http.Polly
dotnet add package Polly
dotnet add package Polly.Contrib.WaitAndRetry # 提供高级重试策略
```

### 入口文件配置 ###

```csharp
// Program.cs
builder.Services.AddHttpClient("ResilientApi")
    .AddTransientHttpErrorPolicy(policyBuilder => 
        policyBuilder.WaitAndRetryAsync(
            Backoff.DecorrelatedJitterBackoffV2(
                medianFirstRetryDelay: TimeSpan.FromSeconds(1), 
                retryCount: 3
            )
        )
    );
```

### 核心应用场景实现 ###

#### 外部 API 调用保护（商品服务） ####

```csharp
// ProductService.cs
public class ProductService
{
    private readonly IHttpClientFactory _httpClientFactory;
    
    public ProductService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }
    
    public async Task<Product> GetProductAsync(int id)
    {
        var client = _httpClientFactory.CreateClient("ResilientApi");
        
        // 带策略的执行
        return await client.GetFromJsonAsync<Product>($"/api/products/{id}");
    }
}

// 策略说明：
// 1. 自动处理5xx错误、408超时和网络故障
// 2. 使用指数退避算法重试3次：0.5s, 1.5s, 4.5s
// 3. 添加Jitter避免同步重试风暴
```

#### 数据库操作保护（EF Core 集成） ####

```csharp
// OrderRepository.cs
public class OrderRepository
{
    private readonly AsyncRetryPolicy _dbPolicy;
    private readonly AppDbContext _context;
    
    public OrderRepository(AppDbContext context)
    {
        _context = context;
        
        // 配置SQL重试策略
        _dbPolicy = Policy
            .Handle<SqlException>(ex => ex.IsTransient) // 捕获瞬态错误
            .Or<TimeoutException>()
            .WaitAndRetryAsync(
                retryCount: 3,
                sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)),
                onRetry: (ex, delay) => 
                    Log.Warning($"数据库操作失败，{delay.TotalSeconds}秒后重试: {ex.Message}")
            );
    }
    
    public async Task SaveOrderAsync(Order order)
    {
        await _dbPolicy.ExecuteAsync(async () => 
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
        });
    }
}
```

#### 添加降级策略 ####

如果外部服务不可用，可以添加降级策略提供默认响应：

```csharp
// 在Program.cs中添加降级策略
var fallbackPolicy = Policy<HttpResponseMessage>
    .Handle<Exception>()
    .FallbackAsync(
        fallbackAction: async (ctx, token) =>
        {
            Console.WriteLine("执行降级策略，返回缓存数据");
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new StringContent("[{\"Temperature\":25,\"Condition\":\"Sunny\"}]");
            return response;
        },
        onFallbackAsync: ex =>
        {
            Console.WriteLine($"请求失败，执行降级: {ex.Exception.Message}");
            return Task.CompletedTask;
        }
    );

// 更新HttpClient注册，添加降级策略
builder.Services.AddHttpClient("ResilientClient")
    .AddPolicyHandler(fallbackPolicy)
    .AddPolicyHandler(retryPolicy)
    .AddPolicyHandler(circuitBreakerPolicy);
```

#### 全局熔断保护（防止服务雪崩） ####

```csharp
// Program.cs
var circuitBreakerPolicy = Policy
    .Handle<HttpRequestException>()
    .Or<TimeoutException>()
    .CircuitBreakerAsync(
        exceptionsAllowedBeforeBreaking: 5,
        durationOfBreak: TimeSpan.FromSeconds(30),
        onBreak: (ex, breakDelay) => 
            Log.Error($"熔断器开启！{breakDelay.TotalSeconds}秒内拒绝请求"),
        onReset: () => Log.Information("熔断器关闭")
    );

builder.Services.AddHttpClient("PaymentService")
    .AddPolicyHandler(circuitBreakerPolicy)
    .AddPolicyHandler(Policy.TimeoutAsync<HttpResponseMessage>(10));
```

### 高级策略组合 ###

#### 完整策略链（重试+熔断+超时） ####

```csharp
// Program.cs
var retryPolicy = Policy<HttpResponseMessage>
    .HandleResult(r => (int)r.StatusCode >= 500)
    .Or<HttpRequestException>()
    .WaitAndRetryAsync(3, attempt => 
        TimeSpan.FromSeconds(0.5 * Math.Pow(2, attempt)));

var circuitBreaker = Policy<HttpResponseMessage>
    .HandleResult(r => (int)r.StatusCode >= 500)
    .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30));

var timeoutPolicy = Policy.TimeoutAsync<HttpResponseMessage>(10);

// 策略组合顺序：超时 → 熔断 → 重试
var policyWrap = Policy.WrapAsync(timeoutPolicy, circuitBreaker, retryPolicy);

builder.Services.AddHttpClient("InventoryService")
    .AddPolicyHandler(policyWrap);
```

#### 环境差异化配置 ####

```csharp
// 开发环境更激进的策略
if (env.IsDevelopment())
{
    services.AddHttpClient("DevService")
        .AddTransientHttpErrorPolicy(builder => 
            builder.WaitAndRetryAsync(5, attempt => TimeSpan.FromSeconds(0.5)));
}
// 生产环境保守策略
else 
{
    services.AddHttpClient("ProdService")
        .AddPolicyHandler(Policy.TimeoutAsync<HttpResponseMessage>(3))
        .AddTransientHttpErrorPolicy(builder => 
            builder.CircuitBreakerAsync(5, TimeSpan.FromSeconds(30)));
}
```

#### 监控与日志集成 ####

```csharp
// Serilog 集成
Log.Logger = new LoggerConfiguration()
    .Enrich.WithProperty("Application", "ECommerce")
    .WriteTo.Console()
    .WriteTo.Seq("http://localhost:5341")
    .CreateLogger();

// Polly 事件记录
policy = policy.WithPolicyLogging(logger, "InventoryPolicy");
```

#### 策略事件追踪 ####

```csharp
var policy = Policy
    .Handle<Exception>()
    .RetryAsync(3, onRetry: (ex, retryCount) => 
    {
        logger.LogWarning("重试 #{RetryCount} 触发: {Exception}", retryCount, ex);
    })
    .WithTelemetry(loggerFactory); // 启用Polly内置遥测
```

#### 模拟故障测试 ####

```csharp
// 测试环境注入故障
if (env.IsEnvironment("Test"))
{
    services.AddHttpClient("MockService")
        .AddPolicyHandler(Policy<HttpResponseMessage>
            .HandleResult(r => true)
            .FallbackAsync(new HttpResponseMessage(HttpStatusCode.ServiceUnavailable)))
        .AddPolicyHandler(new FaultInjectionPolicy(0.1)); // 10%失败率
}
```

### 配置建议 ###

#### 配置驱动策略参数 ####

```json:appsettings.json
"PollyConfig": {
  "HttpRetryCount": 3,
  "HttpCircuitBreakThreshold": 5,
  "HttpCircuitBreakDuration": "00:00:30",
  "HttpTimeout": "00:00:15",
  "DbRetryCount": 3,
  "DbRetryDelayMilliseconds": 200
}
```

```csharp
// 基于配置的策略
static IAsyncPolicy<HttpResponseMessage> GetConfiguredPolicy(IConfiguration config)
{
    var retryCount = config.GetValue<int>("PollyConfig:HttpRetryCount");
    var circuitBreak = config.GetValue<int>("PollyConfig:HttpCircuitBreakThreshold");
    var breakDuration = config.GetValue<TimeSpan>("PollyConfig:HttpCircuitBreakDuration");
    var timeout = config.GetValue<TimeSpan>("PollyConfig:HttpTimeout");
    
    return Policy.WrapAsync(
        Policy.TimeoutAsync<HttpResponseMessage>(timeout),
        HttpPolicyExtensions
            .HandleTransientHttpError()
            .CircuitBreakerAsync(circuitBreak, breakDuration),
        HttpPolicyExtensions
            .HandleTransientHttpError()
            .WaitAndRetryAsync(retryCount, retryAttempt => 
                TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)))
    );
}
```

### Web 项目特定场景处理 ###

#### 控制器动作级保护 ####

```csharp
[HttpGet("products/{id}")]
public async Task<IActionResult> GetProduct(int id)
{
    // 创建请求级策略
    var policy = Policy
        .Handle<Exception>()
        .RetryAsync(2, (ex, retryCount) => 
            Log.Warning($"第{retryCount}次重试: {ex.Message}"));
    
    var product = await policy.ExecuteAsync(
        () => _productService.GetProductAsync(id));
    
    return product != null ? Ok(product) : NotFound();
}
```

#### 自定义响应转换 ####

```csharp
// 处理外部API的429响应
var rateLimitPolicy = Policy<HttpResponseMessage>
    .HandleResult(r => r.StatusCode == HttpStatusCode.TooManyRequests)
    .RetryAsync(1, onRetry: (result, retryCount) =>
    {
        var retryAfter = result.Result.Headers.RetryAfter?.Delta ?? TimeSpan.FromSeconds(5);
        Thread.Sleep(retryAfter.Value);
    });

builder.Services.AddHttpClient("ExternalApi")
    .AddPolicyHandler(rateLimitPolicy);
```

#### 用户请求上下文传递 ####

```csharp
var policy = Policy
    .Handle<Exception>()
    .RetryAsync(1, onRetry: (ex, retryCount, context) => 
    {
        var userId = context["user-id"]?.ToString();
        Log.Warning($"用户{userId}请求重试: {ex.Message}");
    });

// 执行时传递上下文
var response = await policy.ExecuteAsync(ctx => 
    _service.CallApi(userId), 
    new Context { ["user-id"] = userId });
```

#### 下单流程示例 ####

```csharp
// OrderController.cs
[HttpPost("orders")]
public async Task<IActionResult> CreateOrder([FromBody] OrderRequest request)
{
    // 组合策略: 超时5s + 3次重试
    var policy = Policy
        .Handle<TimeoutException>()
        .Or<HttpRequestException>()
        .WaitAndRetryAsync(3, attempt => TimeSpan.FromSeconds(attempt))
        .WrapAsync(Policy.TimeoutAsync(5));
    
    try
    {
        var result = await policy.ExecuteAsync(async () => 
        {
            // 1. 检查库存
            var stockValid = await _inventoryService.CheckStockAsync(request.Items);
            
            // 2. 创建支付
            var payment = await _paymentService.CreatePaymentAsync(request.Payment);
            
            // 3. 保存订单
            var order = await _orderService.CreateOrderAsync(request, payment.Id);
            
            return new { OrderId = order.Id };
        });
        
        return Ok(result);
    }
    catch (TimeoutException)
    {
        return StatusCode(503, "服务响应超时，请稍后重试");
    }
    catch (HttpRequestException)
    {
        return StatusCode(502, "上游服务不可用");
    }
}
```
