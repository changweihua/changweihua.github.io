---
lastUpdated: true
commentabled: true
recommended: true
title: 基于 Microsoft Agent Framework 集成 DeepSeek 大模型的实践
description: 基于 Microsoft Agent Framework 集成 DeepSeek 大模型的实践
date: 2026-01-07 11:29:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 一、前言 ##

Microsoft Agent Framework（简称 Agent Framework）发布已有一段时间。在“观望”（摸鱼）一阵后，在老板的“鼓励”下，我们果断将多个 AI 微服务从 *Semantic Kernel（SK）* 迁移至 *Agent Framework*。

本文记录迁移过程中总结的工程化用法与实践经验，供同行参考。

## 二、Agent Framework 是什么？ ##

Agent Framework 是微软在 Semantic Kernel 之后推出的 *新一代智能体（Agent）开发框架*，可视为 SK 的“进化版”：

- 核心理念相似，但 API 更直观、更现代化；

- 原生支持 多智能体协作（Multi-Agent）；

- 更契合当前 LLM 应用向“智能体系统”演进的趋势。

> 💡 如果你曾被 SK 的 `Kernel`/`Skill`/`Function`/`Context` 嵌套结构折磨过，Agent Framework 会让你眼前一亮。

## 三、与 Semantic Kernel 的关键对比 ##

| **维度**        |      **Semantic Kernel**      |     **Agent Framework**      |
| :------------- | :-----------: | :-----------: |
|  结构设计  | 抽象层级多（Skill/Function），复用困难  | 直接定义 `Agent` 类，职责清晰  |
|  `Prompt` 管理  | 依赖 YAML/JSON 模板 + Template Function  | 直接传入 instructions，逻辑与提示分离自然  |
|  多 Agent 协作  | 需手动实现消息传递  | 内置线程（Thread）机制，天然支持多 Agent 通信  |
|  工具集成  | 手动注册函数为插件  | 支持 MCP 工具、自定义 AITool，开箱即用  |

## 四、工程化使用姿势 ##

### 单一职责：每个任务一个 Agent ###

摒弃 SK 中“一个 Kernel 打天下”的模式，采用 *一个任务对应一个 Agent* 的设计：

- 职责单一，便于测试与维护；

- 通过 IOC 容器注册，像普通服务一样注入使用。

#### 示例：公司名称抽取 Agent ####

```csharp
public class CompanyExtractionAgent : BaseAgentFunction, ICompanyExtractionAgent
{
    private readonly AIAgent _agent;

    public CompanyExtractionAgent(IOptions<LLMConfiguration> config)
    {
        var client = new OpenAIClient(...);
        var chatClient = client.GetChatClient(config.Value.Model);
        _agent = chatClient.CreateAIAgent(instructions: 
            "你是一个信息抽取助手，请从文本中提取所有公司名称，必须返回合法 JSON 数组...");
    }

    public async Task<List<string>> ExtractCompanyNamesAsync(string filePath)
    {
        // 分块处理文档 → 调用 Agent → 解析 JSON → 合并结果
    }
}
```

### 给 Agent 装上“手和眼”：集成 MCP 工具 ###

#### 注册 MCP 客户端（如 Playwright 浏览器） ####

```csharp
public static async Task AddMcpClientAsync(this IServiceCollection services, bool headless)
{
    var transport = new StdioClientTransport(new StdioClientTransportOptions
    {
        Name = "PlaywrightMCP",
        Command = "npx",
        Arguments = new List<string> { "@playwright/mcp", "--headless", ... }
    });
    var mcpClient = await McpClient.CreateAsync(transport);
    services.AddSingleton(mcpClient);
}
```

#### 使用 MCP 工具的 Agent ####

```csharp
public class CompanyInfoQueryAgent : BaseAgentFunction, ICompanyInfoQueryAgent
{
    public CompanyInfoQueryAgent(IOptions<LLMConfiguration> config, McpClient mcpClient)
    {
        var tools = (await mcpClient.ListToolsAsync()).Cast<AITool>().ToList();
        _agent = chatClient.CreateAIAgent(
            instructions: "你拥有网络访问能力，请使用 MCP 工具查询公司公开信息...",
            tools: tools
        );
    }

    public async Task<CompanyInfo?> QueryCompanyInfoAsync(string companyName) { ... }
}
```

### 自定义函数工具（Function Tool） ###

#### 编写工具类 ####

```csharp
public class CompanyInfoTool : AITool
{
    public async Task<string> QueryCompanyInfoAsync(string companyName)
    {
        return await _httpClient.GetStringAsync($"https://api.example.com/company/{companyName}");
    }
}
```

#### 注册到 Agent ####

```csharp
_agent = chatClient.CreateAIAgent(
    instructions: "请使用工具查询公司信息",
    tools: new List<AITool> { _companyInfoTool }
);
```

### 记忆功能（Memory / Thread） ###

Agent Framework 通过 Thread 实现对话记忆：

```csharp
// 保存对话状态
var serialized = thread.Serialize(JsonSerializerOptions.Web).GetRawText();
await File.WriteAllTextAsync("thread.json", serialized);

// 恢复对话
var json = await File.ReadAllTextAsync("thread.json");
var restoredThread = _agent.DeserializeThread(JsonSerializer.Deserialize<JsonElement>(json));
var response = await _agent.RunAsync("继续...", restoredThread);
```

✅ 支持持久化到数据库、Redis 等，实现跨会话记忆。

## 五、踩坑与注意事项 ##

### Endpoint 配置差异 ###

| **框架**        |      **正确 Endpoint 格式**      |
| :------------- | :-----------: |
|  Semantic Kernel  | `https://api.deepseek.com/v1`  |
|  Agent Framework  | `https://api.deepseek.com` （无 /v1）  |

> ⚠️ 多数国产模型 API（如 DeepSeek、Moonshot）在 Agent Framework 中需去掉路径后缀。

### 结构化输出（Structured Output） ###

推荐使用 `ChatResponseFormat.ForJsonSchema` 强制模型输出合规 JSON：

```csharp
var schema = AIJsonUtilities.CreateJsonSchema(typeof(CompanyInfo));
var chatOptions = new ChatOptions
{
    ResponseFormat = ChatResponseFormat.ForJsonSchema(schema, "CompanyInfo", "结构化公司信息"),
    Tools = tools
};

_agent = chatClient.CreateAIAgent(new ChatClientAgentOptions
{
    Instructions = "...",
    ChatOptions = chatOptions
});
```

> ❗ 注意：部分国产模型（如 DeepSeek）虽文档声称支持 `response_format: { "type": "json_object" }`，但实际调用可能报错。建议先验证模型兼容性。

## 六、总结 ##

Agent Framework 相比 Semantic Kernel：

- 结构更清晰：Agent 即服务，天然契合微服务架构；

- 开发更高效：减少模板代码，Prompt 与逻辑解耦；

- 扩展更灵活：MCP、自定义工具、记忆、多 Agent 协作一应俱全。

尽管在国产模型适配上仍有小坑，但整体体验显著优于 SK，*强烈推荐新项目直接采用 Agent Framework*。

### 最佳实践 ###

- 一个任务 = 一个 Agent

- 工具解耦、通过 DI 注入

- 利用 Thread 实现上下文记忆

- 优先使用结构化输出保障数据可靠性
