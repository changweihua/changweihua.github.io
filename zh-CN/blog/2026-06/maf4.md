---
lastUpdated: true
commentabled: true
recommended: true
title: 使用 MAF Middleware 中间件
description: 使用 MAF Middleware 中间件
date: 2026-06-04 14:35:00
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 一、为什么需要 Middleware？ ##

前面几篇，我们学会了：

- 让 Agent 对话（RunAsync）
- 让 Agent 调工具（tools:）
- 让 Agent 记历史（AgentSession）

一旦要上生产，你还会反复遇到这些需求：

| 需求 | 若写在业务里 | 问题 |
| :--- | :--- | :--- |
| 每次 Run 打日志、记耗时 | 每个 `RunAsync` 前后 copy 一遍 | 重复、易漏 |
| 敏感词拦截 | 在 Controller 里 if 判断 | 和 Agent 逻辑缠在一起 |
| 统一异常转友好文案 | try/catch 包每个调用点 | 维护成本高 |

这些叫 横切关注点（Cross-Cutting Concerns）：跟「这一轮对话的业务」无关，但每一轮 Run 都要做。

Middleware（中间件） 是 MAF 提供的标准插槽：在 Agent 执行前后（或更底层的模型 HTTP 调用前后）插入逻辑，不改核心 Agent 代码，就能叠加日志、治理、鉴权等能力。

## 二、MAF 的三层 Middleware ##

Microsoft Agent Framework 把扩展点分成三层（本文实现第 1、2 层，顺带介绍第 3 层）：

| 层级 | 拦截什么 | 注册方式 |
| :--- | :--- | :--- |
| Agent Run | 每次 `IAgent.RunAsync` / `RunStreamingAsync` | `agent.AsBuilder().Use(runFunc:, runStreamingFunc:)` |
| Function 调用 | `GetWeather` / `GetProductInfo` 等工具执行前后 | `agent.AsBuilder().Use(functionCallback)` |
| IChatClient | 发往推理服务的请求 | `chatClient.AsBuilder().Use(getResponseFunc:, ...)` |

调用链示意：

```mermaid
graph TD
    A["agent.RunAsync(\"你好\")"] --> B["Agent Run Middleware<br/>(业务层)<br/>日志、敏感词、异常包装"]
    B --> C["ChatClientAgent / 工具循环等"]
    C --> D["IChatClient Middleware<br/>(传输层)<br/>HTTP 耗时、原始请求"]
    D --> E["百炼 / OpenAI API"]
```

- Agent Run 层适合业务语义：审计、限流、敏感词、统一异常文案。
- IChatClient 层适合传输语义：HTTP 耗时、重试、链路 ID、请求体大小。

两层日志可以同时开：Agent 层看「一次 Run 业务」；IChatClient 层看「一次 GetResponseAsync 网络调用」。

## 三、Agent Run Middleware：实现 ##

### 注册入口：`AIAgentBuilder.Use` ###

在已有 AIAgent 上通过 Builder 挂中间件，再 `Build()` 得到带管道的 Agent：

```csharp
var agent = coreAgent
    .AsBuilder()
    .Use(runFunc: YourMiddleware, runStreamingFunc: null)
    .Build();
```

runFunc 是一个委托方法：

```csharp
static async Task<AgentResponse> YourMiddleware(
    IEnumerable<ChatMessage> messages,
    AgentSession? session,
    AgentRunOptions? options,
    AIAgent innerAgent,
    CancellationToken cancellationToken)
{
    var response = await innerAgent.RunAsync(messages, session, options, cancellationToken);
    return response;
}
```

| 参数 | 含义 |
| :--- | :--- |
| `messages` | 本轮传入的消息（含历史，取决于你怎么调 `RunAsync`） |
| `session` | 会话对象；有 `AgentSession` 时可从 `session` 区分多用户 |
| `options` | 本轮 `AgentRunOptions` |
| `innerAgent` | 管道下一环：下一个 Middleware，或最内层的核心 Agent |
| 返回值 | 可原样返回，也可替换为新的 `AgentResponse` |

执行模型可以记成两句话：

- 继续管道 → 调用 `await innerAgent.RunAsync(...)`
- 短路（不调大模型）→ 直接 `return new AgentResponse(...)`，不要调 innerAgent

### 链式多个 `.Use()` ###

多个中间件通过连续 `.Use()` 组成管道：

```csharp
return core.AsBuilder()
    .Use(runFunc: AgentRunMiddleware.FaultInjection, runStreamingFunc: null)
    .Use(runFunc: AgentRunMiddleware.ContentGovernance, runStreamingFunc: null)
    .Use(runFunc: AgentRunMiddleware.ExceptionHandling, runStreamingFunc: null)
    .Use(runFunc: AgentRunMiddleware.RequestLogging, runStreamingFunc: null)
    .Build();
```

顺序（与 ASP.NET Core 中间件类似）：

- 先 `.Use()` → 内层（离核心 Agent 近）
- 后 `.Use()` → 外层（你的 RunAsync 先进入这一层）

请求从外往里，响应从内往外返回。

### 流式说明 ###

`Use` 还可传入 `runStreamingFunc` 处理 `RunStreamingAsync`。Demo 为聚焦非流式场景，统一写 `runStreamingFunc: null`。  
生产若要用流式，应为流式单独实现一版，或使用文档中的 `Use(sharedFunc:)`（适合只改输入、不改输出的场景）。


## 四、四个 Middleware 实现详解 ##

文件：`Middleware/AgentRunMiddleware.cs`。

四个 **静态方法**，方法名即职责，签名与上一节相同。

### RequestLogging — 请求/响应可观测 ###

在调用 `innerAgent` 前后打日志：会话标识、消息条数、粗算输入 Token、用户预览、耗时、`Usage`。

```csharp
public static async Task<AgentResponse> RequestLogging(
    IEnumerable<ChatMessage> messages,
    AgentSession? session,
    AgentRunOptions? options,
    AIAgent innerAgent,
    CancellationToken cancellationToken)
{
    var sw = Stopwatch.StartNew();
    string sessionHint = session?.GetHashCode().ToString("X") ?? "none";
    int estimatedTokens = AgentMiddlewareHelpers.EstimateInputTokens(messages);
    string userPreview = GetLastUserText(messages);

    Console.WriteLine(
        $"[MAF.RequestLog] ▶ 请求 | session={sessionHint} | msgs={messages.Count()} " +
        $"| estTokens≈{estimatedTokens} | user=\"{AgentMiddlewareHelpers.Truncate(userPreview, 40)}\"");

    AgentResponse response = await innerAgent.RunAsync(messages, session, options, cancellationToken);

    sw.Stop();
    Console.WriteLine(
        $"[MAF.RequestLog] ◀ 响应 | {sw.ElapsedMilliseconds}ms | replyLen={response.Text?.Length ?? 0} " +
        $"| usage={AgentMiddlewareHelpers.FormatUsage(response.Usage)}");

    return response;
}
```

`AgentMiddlewareHelpers.EstimateInputTokens` 用「字符数 / 2」粗算 Token，适合 Demo；生产可换成 tiktoken 等库。

FormatUsage 输出 InputTokenCount / OutputTokenCount，便于和账单对照。

### ContentGovernance — 敏感词短路 ###

默认拦截关键词：密码、身份证号、apikey、sk-。命中后不调用 innerAgent，直接返回助手消息，不产生模型 Token 费用。

```csharp
public static async Task<AgentResponse> ContentGovernance(
    IEnumerable<ChatMessage> messages,
    AgentSession? session,
    AgentRunOptions? options,
    AIAgent innerAgent,
    CancellationToken cancellationToken)
{
    string? hit = FindBlockedKeyword(messages);
    if (hit is not null)
    {
        Console.WriteLine($"[MAF.Governance] ⛔ 拦截 | keyword=\"{hit}\"");
        return new AgentResponse(new ChatMessage(
            ChatRole.Assistant,
            $"【治理拦截】检测到敏感内容（{hit}），请求未发送到大模型。"));
    }

    return await innerAgent.RunAsync(messages, session, options, cancellationToken);
}
```

只扫描 `ChatRole.User` 的消息文本。扩展关键词改 `BlockedKeywords` 数组即可。

### ExceptionHandling — 异常包装 ###

内层 Middleware 或核心 Agent 抛错时，转为 AgentResponse，调用方仍走正常的 `await agent.RunAsync(...)` 流程。OperationCanceledException 继续向上抛，不吞掉取消。

```csharp
public static async Task<AgentResponse> ExceptionHandling(
    IEnumerable<ChatMessage> messages,
    AgentSession? session,
    AgentRunOptions? options,
    AIAgent innerAgent,
    CancellationToken cancellationToken)
{
    try
    {
        return await innerAgent.RunAsync(messages, session, options, cancellationToken);
    }
    catch (OperationCanceledException)
    {
        throw;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[MAF.Exception] ✖ {ex.GetType().Name}: {ex.Message}");
        return new AgentResponse(new ChatMessage(
            ChatRole.Assistant,
            $"【系统异常】请求处理失败，请稍后重试。（{ex.GetType().Name}）"));
    }
}
```

### FaultInjection — 异常场景演示 ###

用户输入包含「模拟异常」时抛出 InvalidOperationException，用于验证 ExceptionHandling 是否生效。仅 Demo 使用，生产环境不要保留。

```csharp
public static async Task<AgentResponse> FaultInjection(
    IEnumerable<ChatMessage> messages,
    AgentSession? session,
    AgentRunOptions? options,
    AIAgent innerAgent,
    CancellationToken cancellationToken)
{
    if (GetLastUserText(messages).Contains("模拟异常", StringComparison.Ordinal))
    {
        throw new InvalidOperationException("FaultInjection：模拟 Middleware 管道内异常");
    }

    return await innerAgent.RunAsync(messages, session, options, cancellationToken);
}
```

## 五、Function 调用 Middleware ##

### 何时生效？ ###

Agent 通过 `AsAIAgent(..., tools: tools)` 注册工具后，MAF 会在内部使用 FunctionInvokingChatClient 跑 Tool Calling 循环。此时可对每一次工具执行再挂 Middleware。

注册方式（与 Agent Run 的 runFunc 不同，是另一个 Use 重载）：

```csharp
core.AsBuilder()
    .Use(runFunc: AgentRunMiddleware.RequestLogging, runStreamingFunc: null)
    // … 其他 Agent Run 中间件 …
    .Use(FunctionInvocationMiddleware.UnknownProductGuard)
    .Use(FunctionInvocationMiddleware.InvocationLogging)
    .Build();
```

方法签名：

```csharp
static async ValueTask<object?> YourFunctionMiddleware(
    AIAgent agent,
    FunctionInvocationContext context,
    Func<FunctionInvocationContext, CancellationToken, ValueTask<object?>> next,
    CancellationToken cancellationToken)
{
    object? result = await next(context, cancellationToken);
    return result;
}
```

| 参数 | 含义 |
| :--- | :--- |
| `context.Function` | 当前被调用的 AIFunction（如 GetWeather） |
| `context.Arguments` | 模型填写的参数 |
| `context.Iteration` | 第几轮工具调用循环 |
| `next` | 继续执行下一环（最终落到你的 C# 方法） |
| 返回值 | 可原样返回，也可短路直接 `return "..."` 而不调 `next` |

### 例子：InvocationLogging — 工具调用日志 ###

Middleware/FunctionInvocationMiddleware.cs：

```csharp
public static async ValueTask<object?> InvocationLogging(
    AIAgent agent,
    FunctionInvocationContext context,
    Func<FunctionInvocationContext, CancellationToken, ValueTask<object?>> next,
    CancellationToken cancellationToken)
{
    Console.WriteLine($"[MAF.Function] ▶ {context.Function.Name}(...) | iter={context.Iteration}");

    object? result = await next(context, cancellationToken);

    Console.WriteLine($"[MAF.Function] ◀ {context.Function.Name} => ...");
    return result;
}
```

### 例子：UnknownProductGuard 不在调用模型 ###

对 GetProductInfo，若 productId 以 X 开头，不调用 next，直接返回拦截文案（模型会基于该结果组织回复）：

```csharp
if (IsGetProductInfo(context.Function.Name)
    && TryGetArgument(context.Arguments, "productId", out string? productId)
    && productId.StartsWith('X'))
{
    return $"【工具拦截】产品编号 {productId} 不允许查询，请使用 P001 / P002 / P003。";
}
return await next(context, cancellationToken);
```

### 与 Agent Run 层的关系 ###

```text
agent.RunAsync("查 P002")
  → Agent Run Middleware（RequestLog / Governance …）
    → 核心 Agent + Tool 循环
         → 模型返回 tool_call: GetProductInfo
         → Function Middleware（InvocationLogging → UnknownProductGuard → AgentTools.GetProductInfo）
         → 模型根据工具结果生成最终回复
  ← AgentResponse
```

两层正交：Agent Run 包「整次对话」；Function 包「每一次工具执行」。

## 六、中间件链式注册、调用 ##

CreateWithMiddlewarePipeline 根据是否传入 tools 决定是否注册 Function 层：

```csharp
public static IList<AITool> CreateDemoTools() =>
[
    AIFunctionFactory.Create(AgentTools.GetWeather),
    AIFunctionFactory.Create(AgentTools.GetProductInfo),
];

AIAgent core = tools is null
    ? client.AsAIAgent(instructions: instructions, name: name)
    : client.AsAIAgent(instructions: instructions, name: name, tools: tools);

AIAgentBuilder builder = core.AsBuilder()
    .Use(runFunc: AgentRunMiddleware.FaultInjection, runStreamingFunc: null)
    .Use(runFunc: AgentRunMiddleware.ContentGovernance, runStreamingFunc: null)
    .Use(runFunc: AgentRunMiddleware.ExceptionHandling, runStreamingFunc: null)
    .Use(runFunc: AgentRunMiddleware.RequestLogging, runStreamingFunc: null);

if (tools is not null)
{
    builder = builder
        .Use(FunctionInvocationMiddleware.UnknownProductGuard)
        .Use(FunctionInvocationMiddleware.InvocationLogging);
}

return builder.Build();
```

无工具时只走 Agent Run 管道；有工具时两层一起启用。

## 七、IChatClient 层 Middleware（可选） ##

Middleware/ChatClientLoggingMiddleware.cs 在 模型 HTTP 调用 前后记日志：

```csharp
public static ChatClientBuilder UseRequestLogging(this ChatClientBuilder builder, string tag = "MAF.ChatClient")
{
    return builder.Use(
        getResponseFunc: async (messages, options, innerClient, cancellationToken) =>
        {
            var sw = Stopwatch.StartNew();
            Console.WriteLine($"[{tag}] ▶ GetResponseAsync | msgs={messages.Count()}");

            ChatResponse response = await innerClient.GetResponseAsync(messages, options, cancellationToken);

            sw.Stop();
            Console.WriteLine($"[{tag}] ◀ GetResponseAsync {sw.ElapsedMilliseconds}ms");

            return response;
        },
        getStreamingResponseFunc: null);
}
```

与 Agent Run 层的对比：

| | Agent Run (RequestLogging) | IChatClient (UseRequestLogging) |
| :--- | :--- | :--- |
| **拦截点** | 一次 `agent.RunAsync` | 一次 `GetResponseAsync` |
| **典型用途** | 业务审计、敏感词、异常文案 | HTTP 耗时、重试、链路追踪 |
| **工具调用时** | 一次 Run 可能触发多轮模型调用 | 每一轮 HTTP 都会经过 |

## 八、小结 ##

前几篇让 Agent 能说、能做、能记；本篇 `AsBuilder().Use(...)` 在 对话入口 和 工具入口 两处叠加横切逻辑，让 Agent 更易观测、更易管控，更适合往生产环境推进。


