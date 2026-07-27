---
lastUpdated: true
commentabled: true
recommended: true
title: .NET + AI 实战
description: 使用 Microsoft Agent Framework 集成自定义 Skills，打造可扩展的智能 AI Agent
date: 2026-02-01 08:29:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

随着生成式 AI（Generative AI）技术的迅猛发展，AI Agent（智能代理）正成为构建下一代智能应用的核心范式。在 .NET 生态中，微软推出的 *Microsoft Agent Framework（MAF*） 为开发者提供了一套结构清晰、模块化且与 .NET 深度集成的框架，用于构建具备规划、记忆、工具调用和多技能协同能力的 AI Agent。

本文将手把手带你基于 .NET 8，使用 Microsoft Agent Framework 创建一个具备“天气查询”和“数学计算”能力的 AI Agent，并深入讲解如何通过 *Skills（技能）* 扩展其智能边界。

## 一、什么是 Microsoft Agent Framework？ ##

Microsoft Agent Framework 是微软在 Semantic Kernel 基础上进一步抽象出的高级 Agent 构建框架，旨在简化复杂 AI 应用的开发。它提供以下核心能力：

- **Agent 容器**：托管多个 Skill，管理生命周期。
- **Skill 模型**：以插件形式封装具体功能（如调用 API、执行代码）。
- **Planner（规划器）** ：自动分析用户意图，选择并编排合适的 Skill。
- **Memory 与 Context**：支持短期/长期记忆，维持对话状态。
- **.NET 原生支持**：强类型、依赖注入、异步编程模型无缝集成。

> 💡 注意：截至 2026 年初，Microsoft Agent Framework 仍处于预览阶段，但已可通过 GitHub 和 NuGet 获取实验性版本。


## 二、准备工作：创建 .NET 项目并引入依赖 ##

```bash
dotnet new console -n DotNetAgentDemo
cd DotNetAgentDemo
dotnet add package Microsoft.Agent --prerelease
dotnet add package Microsoft.SemanticKernel --prerelease
```

你还需要一个 OpenAI 或 Azure OpenAI 的 API Key（用于 LLM 推理）。

在 `appsettings.json` 中配置：

```json:appsettings.json
{
  "OpenAI": {
    "ApiKey": "your-api-key",
    "ModelId": "gpt-4o"
  }
}
```

## 三、定义第一个 Skill：数学计算器 ##

Skill 在 MAF 中是一个带有 `[Skill]` 特性的类，其方法通过 `[Function]` 标记为可被 Agent 调用。

```csharp
// Skills/MathSkill.cs
using Microsoft.Agent.Abstractions;

[Skill("Math")]
public class MathSkill
{
    [Function("Add two numbers")]
    public double Add(double a, double b) => a + b;

    [Function("Multiply two numbers")]
    public double Multiply(double a, double b) => a * b;
}
```

每个 `[Function]` 的描述文本将被 LLM 用于理解该函数的用途。

## 四、定义第二个 Skill：天气查询（模拟） ##

实际项目中可调用天气 API（如 OpenWeatherMap），此处简化为模拟：

```csharp
// Skills/WeatherSkill.cs
using Microsoft.Agent.Abstractions;

[Skill("Weather")]
public class WeatherSkill
{
    [Function("Get current weather for a city")]
    public string GetWeather(string city)
    {
        return city.ToLowerInvariant() switch
        {
            "beijing" => "Sunny, 22°C",
            "shanghai" => "Cloudy, 18°C",
            _ => "Unknown city"
        };
    }
}
```

## 五、构建并运行 AI Agent ##

在 `Program.cs` 中组装 Agent：

```cs
// Program.cs
using Microsoft.Agent;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.SemanticKernel;

var config = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .Build();

var services = new ServiceCollection();
services.AddAgentFramework(); // 注册 MAF 核心服务

// 配置 Semantic Kernel（作为 LLM 后端）
services.AddKernel()
    .AddOpenAIChatCompletion(
        modelId: config["OpenAI:ModelId"]!,
        apiKey: config["OpenAI:ApiKey"]!);

// 注册自定义 Skills
services.AddSingleton<MathSkill>();
services.AddSingleton<WeatherSkill>();

var serviceProvider = services.BuildServiceProvider();
var agentHost = serviceProvider.GetRequiredService<IAgentHost>();

// 创建 Agent 实例
var agent = await agentHost.CreateAgentAsync(new AgentOptions
{
    Name = "SmartAssistant",
    Description = "A helpful assistant that can do math and check weather.",
    Skills = { typeof(MathSkill), typeof(WeatherSkill) }
});

// 用户交互循环
while (true)
{
    Console.Write("\nYou: ");
    var input = Console.ReadLine();
    if (string.IsNullOrEmpty(input)) break;

    var response = await agent.InvokeAsync(input);
    Console.WriteLine($"Agent: {response}");
}
```

## 六、测试你的智能 Agent ##

运行程序后，尝试以下对话：

```txt
You: What's 15 times 6?
Agent: The result is 90.

You: What's the weather in Beijing?
Agent: Sunny, 22°C.

You: If I add 10 to Beijing's temperature, what do I get?
Agent: Beijing's temperature is 22°C. Adding 10 gives 32.
```

> ✅ Agent 成功跨 Skill 协同：先调用 `WeatherSkill` 获取温度，再调用 `MathSkill` 进行加法！

这背后是 MAF 内置的 AutoPlanner 在起作用——它利用 LLM 分析用户请求，生成执行计划（Plan），并按需调用多个 Skill。

## 七、进阶：添加记忆与上下文 ##

MAF 支持会话级记忆。通过 `agent.SetContext("user", "Alice")` 可注入上下文，后续对话中 LLM 可引用：

```csharp
await agent.SetContextAsync("user_name", "Alice");
var reply = await agent.InvokeAsync("Hello!");
// LLM 可能回复："Hello, Alice!"
```

你还可以集成向量数据库实现长期记忆（需结合 Semantic Kernel 的 MemoryStore）。

## 八、最佳实践建议 ##

- **Skill 设计原则**：单一职责、幂等、带清晰描述。
- **输入验证**：在 Skill 方法中校验参数，避免无效调用。
- **错误处理**：抛出异常会被 Agent 捕获并转为自然语言反馈。
- **性能监控**：记录每个 Skill 调用耗时，便于优化。
- **安全沙箱**：对敏感操作（如文件删除）添加权限控制层。

## 结语 ##

Microsoft Agent Framework 将复杂的 AI Agent 架构封装为 .NET 开发者熟悉的依赖注入、接口和属性模型，极大降低了构建智能应用的门槛。通过组合不同的 Skill，你可以快速搭建客服机器人、运维助手、数据分析代理等场景化 AI 应用。

未来，随着框架的成熟和与 .NET Aspire、Orleans 等云原生技术的深度集成，基于 .NET 的 AI Agent 将成为企业智能化转型的重要基石。

> 🚀 现在就动手，用 C# 编写你的第一个 AI Agent 吧！代码即智能，.NET 正在拥抱 AI 新时代。
