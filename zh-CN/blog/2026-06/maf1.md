---
lastUpdated: true
commentabled: true
recommended: true
title: 用 Microsoft Agent Framework 构建你的第一个 AI Agent（.NET）
description: 用 Microsoft Agent Framework 构建你的第一个 AI Agent（.NET）
date: 2026-06-04 09:35:00
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

> 技术栈：.NET 10、Microsoft Agent Framework (MAF)、Microsoft.Extensions.AI、阿里百炼（OpenAI 兼容接口）

## 写在前面 ##

一直以来对于.net开发者来说Agent开发一直都不友好，.net环境下AI的支持一直落后，现在微软正在迎头赶上推出了Microsoft Agent Framework（MAF），.net开发者的春天来了！

Microsoft Agent Framework（MAF） 是微软在 Semantic Kernel、AutoGen 之后推出的新一代 Agent 运行时。

对 .NET 开发者来说，最值得先掌握的一条链路是：

```mermaid
graph TD
    A[任意 IChatClient 实现] -->|AsAIAgent()| B(AIAgent)
    B --> C[RunAsync]
    B --> D[RunStreamingAsync]
```

只要底层大模型能提供 `IChatClient`（官方 OpenAI SDK、Azure OpenAI、或百炼等兼容端点），上层 Agent 代码可以保持不变。

本文基于一个可运行的 Demo，分步骤说明：如何连接百炼、如何创建 Agent、如何用 System Instruction 定角色、如何分别做非流式与流式调用。

文末汇总了踩坑时的注意点。

| 概念 | 类型 | 作用 |
| :--- | :--- | :--- |
| `IChatClient` | `Microsoft.Extensions.AI` | 与大模型对话的统一抽象 |
| `AIAgent` | `Microsoft.Agents.AI` | Agent 运行时入口 |
| `AsAIAgent()` | 扩展方法 | 把 `IChatClient` 包装成 `AIAgent` |
| `instructions` | 字符串 | System Instruction，定义角色与行为 |
| `RunAsync` | 方法 | 非流式，一次返回完整 `AgentResponse` |
| `RunStreamingAsync` | 方法 | 流式，返回 `IAsyncEnumerable<AgentResponseUpdate>` |

## 步骤 1：创建项目并安装 NuGet 包 ##

```bash
dotnet add package Microsoft.Agents.AI.OpenAI
dotnet add package OpenAI
dotnet add package Microsoft.Extensions.Configuration.Json
dotnet add package Microsoft.Extensions.Configuration.EnvironmentVariables
dotnet add package Microsoft.Extensions.Configuration.Binder
```

| 包名 | 用途 |
| :--- | :--- |
| `Microsoft.Agents.AI.OpenAI` | MAF 与 OpenAI 系客户端的集成（含 `AsAIAgent`） |
| `OpenAI` | 官方 OpenAI .NET SDK，支持自定义 `Endpoint` |
| `Microsoft.Extensions.Configuration.*` | 读取 `appsettings.json`、环境变量 |

> 注意
>
> MAF 仍在快速迭代，版本号以你安装时 NuGet 为准（示例使用 Microsoft.Agents.AI.OpenAI 1.7.x）。
> 若对接 Azure OpenAI，还需 Azure.AI.OpenAI、Azure.Identity，并在工厂类中单独实现分支。

## 步骤 2：配置模型连接（appsettings） ##

定义配置类 LlmSettings，与 JSON 中的 Llm 节点对应：

```csharp
public sealed class LlmSettings
{
    public const string SectionName = "Llm";

    public string Provider { get; set; } = "Bailian";
    public string ApiKey { get; set; } = "";
    public string Model { get; set; } = "qwen-plus";
    public string? Endpoint { get; set; }
}
```

`appsettings.json` 示例（不要把 ApiKey 提交到 Git）：

```json
{
  "Llm": {
    "Provider": "Bailian",
    "Model": "qwen-plus",
    "Endpoint": "https://dashscope.aliyuncs.com/compatible-mode/v1",
    "ApiKey": "sk-你的百炼密钥"
  }
}
```

在 Program.cs 中构建配置：

```csharp
var configuration = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables()
    .Build();
```

并在 `.csproj` 中确保配置文件复制到输出目录：

```xml
<None Update="appsettings.json">
  <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
</None>
<None Update="appsettings.Development.json">
  <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
</None>
```

## 步骤 3：用 OpenAI 兼容协议连接百炼 ##

百炼提供 OpenAI 兼容接口，只需改 BASE_URL 和 model，无需改 MAF 上层代码。

ChatClientFactory 核心逻辑：

```csharp
private static IChatClient CreateOpenAiCompatibleClient(LlmSettings settings, string endpoint)
{
    var options = new OpenAIClientOptions
    {
        Endpoint = new Uri(endpoint.TrimEnd('/') + "/")
    };

    var openAiClient = new OpenAIClient(new ApiKeyCredential(settings.ApiKey), options);
    return openAiClient.GetChatClient(settings.Model).AsIChatClient();
}
```

按 Provider 切换端点：

| Provider | Endpoint 示例 |
| :--- | :--- |
| Baichuan / DashScope | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| OpenAI | `https://api.openai.com/v1` |

## 步骤 4：创建 IChatClient ##

在业务代码中读取配置并创建客户端：

```csharp
var llm = configuration.GetSection(LlmSettings.SectionName).Get<LlmSettings>()
    ?? throw new InvalidOperationException("缺少配置节 Llm");

if (string.IsNullOrWhiteSpace(llm.ApiKey))
{
    Console.WriteLine("请配置 ApiKey");
    return;
}

IChatClient chatClient = ChatClientFactory.Create(llm);
```

IChatClient 来自 Microsoft.Extensions.AI，是 .NET 生态里「调大模型」的统一接口。MAF  deliberately 不绑定某一家云厂商，而是建立在这一层之上。

## 步骤 5：AsAIAgent() — 从 ChatClient 到 Agent ##

一行扩展方法即可创建 Agent，并设置 System Instruction（系统指令 / 角色）：

```csharp
private const string SystemInstructions =
    """
    你是一位 MAF（Microsoft Agent Framework）学习助手。
    请用简洁、友好的中文回答，每次回复控制在 3 句话以内。
    """;

AIAgent agent = chatClient.AsAIAgent(
    instructions: SystemInstructions,
    name: "MafLearningAssistant");
```

| 参数 | 含义 |
| :--- | :--- |
| `instructions` | 每次调用时作为 system 消息注入，相当于「角色设定」 |
| `name` | Agent 名称，便于日志、多 Agent 场景区分 |

> 注意
> 
> - instructions 是 Agent 级 的，不需要在每次 RunAsync 里重复传 system prompt。
> - 若需要更复杂的选项（温度、工具列表等），可使用 ChatClientAgentOptions 重载。
> - `AsAIAgent()` 在 Microsoft.Agents.AI 命名空间，需引用 Microsoft.Agents.AI.OpenAI。


## 步骤 6：非流式调用 RunAsync ##

适合：后台任务、需要完整 JSON、或不需要「打字机效果」的场景。

```csharp
const string userPrompt = "用一句话介绍 MAF 里 AIAgent 和 IChatClient 的关系。";

AgentResponse response = await agent.RunAsync(userPrompt, cancellationToken);

Console.WriteLine(response.Text);
// 可选：查看 Token 用量
// Console.WriteLine(response.Usage);

AgentResponse 包含完整文本 Text，以及可选的 Usage 等元数据。
```

> 注意
>
> - 调用会 阻塞直到模型生成完毕，长回答时用户感知延迟明显。
> - 默认每次 `RunAsync` 是 单轮 输入；多轮对话需配合 AgentSession（后续可单独展开）。


## 步骤 7：流式调用 `RunStreamingAsync` ##

适合：控制台、Web SSE、聊天 UI 等需要「边生成边显示」的场景。

```csharp
await foreach (AgentResponseUpdate update in agent.RunStreamingAsync(streamPrompt, cancellationToken))
{
    if (!string.IsNullOrEmpty(update.Text))
    {
        Console.Write(update.Text);  // 不换行，模拟打字效果
    }
}
Console.WriteLine();
```

每个 update 是一小段增量文本；循环结束后表示本轮流式结束。

> 注意
> 
> - 流式片段可能很碎，Web 端通常再节流渲染（如每 50ms 刷新一次 UI）。
> - 部分 update 的 Text 可能为空（工具调用、元数据等），需判空。
> - 示例里两次调用（RunAsync 与 RunStreamingAsync）未共享会话，模型不会记住上一轮；要上下文需 AgentSession。
