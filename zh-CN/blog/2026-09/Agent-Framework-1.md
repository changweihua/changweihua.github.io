---
lastUpdated: true
commentabled: true
recommended: true
title: 会聊天的模型不值钱
description: 微软用 7 步，把 LLM 从嘴替做成能上岗的 Agent
date: 2026-09-07 10:15:00
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

> 先别写代码：这套东西到底是什么

Agent Framework 是一套开源开发工具，用来做 AI agent 和 multi-agent workflow，语言主场是 .NET 和 Python。Go 有端口，但官方写明仍是 public preview；声明式 agent、RAG、CodeAct、函数式工作流在 Go 上还没有。

它不是从零发明的新宗教。同一批人把 AutoGen 那套「agent 抽象简单、能协作」和 Semantic Kernel 那套「会话、类型安全、中间件、遥测、企业集成」并到一起，又补上图工作流。官方的原话是：这是两者往后的统一底座。

模型后端不绑死一家。Overview 里点名的有 Microsoft Foundry、Anthropic、Azure OpenAI、OpenAI、Ollama。入门教程默认走 Foundry，只是因为示例用 AIProjectClient / FoundryChatClient 最省事，不是框架边界。

还有一句比任何 API 都值钱的话，写在 Overview 的选择表下面：

> If you can write a function to handle the task, do that instead of using an AI agent.

能写成普通函数的事，别上 agent。后面 Workflow 和 Harness 都是在这个判断之上往上加，不是往下替代。

安装也很直：

- .NET：`dotnet add package Microsoft.Agents.AI.Foundry --prerelease`，外加 `Azure.AI.Projects、Azure.Identity`
- Python：`pip install agent-framework`（入门示例常再加 `azure-identity`）
- Go：`go get github.com/microsoft/agent-framework-go`

官方把「用 agent」和「用 workflow」分得很干脆：

| 用 agent 的时候 | 用 workflow 的时候 |
| :--- | :--- |
| 任务开放、偏对话 | 过程步骤已经写清楚 |
| 需要模型自己决定调不调工具、怎么规划 | 你要亲自控制执行顺序 |
| 一次 LLM 调用（加上工具）就够 | 多个 agent 或函数必须协同 |

## 框架的最小单元：连上模型的 Agent ##

框架里的 agent，首先是「带说明书的模型客户端」。C# 里常写成 `AIProjectClient.AsAIAgent(...)`。Python 是 `FoundryChatClient` 加 `Agent(...)`，Go 是 `foundryprovider.NewAgent`。三种写法都在构造同一件事：哪颗模型、用什么证件、开口前读哪段 instructions、这个对象叫什么名字。

```C#
using Azure.AI.Projects;
using Azure.Identity;
using Microsoft.Agents.AI;

var endpoint = Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT")
    ?? throw new InvalidOperationException("Set AZURE_OPENAI_ENDPOINT");
var deploymentName = Environment.GetEnvironmentVariable("AZURE_OPENAI_DEPLOYMENT_NAME") ?? "gpt-4o-mini";

AIAgent agent = new AIProjectClient(new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(
        model: deploymentName,
        instructions: "You are a friendly assistant. Keep your answers brief.",
        name: "HelloAgent");

Console.WriteLine(await agent.RunAsync("What is the largest city in France?"));
```

`AIProjectClient` 是连接。`instructions` 是每次调用都会带上的系统说明。name 在这一层只是标识，托管之后会变成路由里的名字。`RunAsync` 把这一句用户输入送进去，等到完整回答。默认不带上一轮对话，也没有工具。所以这一层能做问答，不能办事，也不能连续聊。

同一层还有流式出口。长任务和 Harness 都靠它把中间过程打出来。

```C#
await foreach (var update in agent.RunStreamingAsync("Tell me a one-sentence fun fact."))
{
    Console.Write(update);
}
```

证件示例用 `DefaultAzureCredential`。文档写明生产要换成明确的托管身份，避免探测延迟和拿到错误身份。后面所有工具、session、Harness、Hosting，操作的都还是这个 AIAgent。

## 框架怎样让 Agent 调用你的代码 ##

第二层是工具。框架不自己决定「该不该查天气」。它把你的函数登记成模型能看见的 schema，模型点名之后，运行时再执行。和自己解析 Chat Completions 的 tool call 不同，函数调用被收进 agent 对象里，一次 `RunAsync` 会把选择、执行、回填做完。

```C#
using System.ComponentModel;
using Microsoft.Extensions.AI;

[Description("Get the weather for a given location.")]
static string GetWeather(
    [Description("The location to get the weather for.")] string location)
    => $"The weather in {location} is cloudy with a high of 15°C.";

AIAgent agent = new AIProjectClient(new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(
        model: deploymentName,
        instructions: "You are a helpful weather agent. Use the GetWeather tool to answer questions.",
        name: "WeatherAgent",
        tools: [AIFunctionFactory.Create(GetWeather)]);

Console.WriteLine(await agent.RunAsync("What is the weather like in Amsterdam?"));
```

一次 `RunAsync` 在这一层变成四步：`AIFunctionFactory.Create` 生成工具说明 → 模型选择是否调用 → 运行时执行函数 → 结果回到模型，再生成给用户的句子。`[Description]` 是给模型看的，写含糊了，模型可能不调。入门示例没有把批准打开；生产要对着敏感工具走批准，而不是让函数直接跑。

也可以只在这一次 `run` 上附加工具。基类 `AgentRunOptions` 几乎没有公共旋钮，要传类型专用的 ChatClientAgentRunOptions，里面的 `ChatOptions` 会和 `agent` 级配置合并后再交给 `IChatClient`：

```C#
var chatOptions = new ChatOptions { Tools = [AIFunctionFactory.Create(GetWeather)] };
Console.WriteLine(await agent.RunAsync(
    "What is the weather like in Amsterdam?",
    options: new ChatClientAgentRunOptions(chatOptions)));
```

MCP 也走同一层思路，入门七章还没展开。这一层补的是「行动」。还没有「同一场对话」。

## 框架怎样保存一场对话 ##

第三层是 `AgentSession`。框架把多轮状态做成显式对象，而不是在每次 `RunAsync` 里让你自己拼 messages。

```C#
AgentSession session = await agent.CreateSessionAsync();

Console.WriteLine(await agent.RunAsync("My name is Alice and I love hiking.", session));
Console.WriteLine(await agent.RunAsync("What do you remember about me?", session));
```

同一条 `session` 传入第二次 `RunAsync` 时，第一次的问答会作为历史一起送走。换一条，就是一次新的独立调用。

在框架的划分里，session 管的是这场对话还在不在。文档没说默认 session 能活过进程重启，也没说它等于长期记忆。历史变长后会被截断。所以框架又拆出下一层：不把「每次开口都必须成立的事实」只放在聊天记录里。

## 框架怎样做记忆：历史和上下文是两条路 ##

第四层最容易和 `session` 缠在一起。三者管的不是同一种数据。

Session 是这场对话的容器。没有它，每次 `RunAsync` 都是孤立请求；有了它，历史和会话状态才有地方放。它本身不规定「记什么」。C# 的 `AgentSession` 上有 `StateBag`，跨 `run` 的自定义数据放这里。

History provider 记的是消息：谁说了哪一句。服务若不自己托管对话，框架默认把完整历史放在 `session` 的内存里，也可以换成自定义 `ChatHistoryProvider`。它回答的问题是：下一轮模型还能不能看见刚才的原话。窗口满了，这些原话可以被截掉。

Context provider 记的是抽出来的事实，以及这些事实怎么改写下一次的 instructions。C# 扩展点是 `AIContextProvider`。调用前走 `InvokingAsync`，调用后走 `InvokedAsync`。框架只给这两个时机，不负责理解「我是 Alice」。

所以同一句「我叫 Alice」会进三个地方，待遇不同。`Session` 让它属于这场对话。`History` 可能整句留着当上文。`Context provider` 认出后把名字留下，并在之后每一次 `InvokingAsync` 里把「请用 Alice 称呼」写进返回的 `AIContext.Instructions`——即使历史已经被截断。

```C#
using System.Text;
using Microsoft.Agents.AI;
using Microsoft.Extensions.AI;

internal sealed class UserInfo
{
    public string? UserName { get; set; }
}

internal sealed class UserMemoryProvider : AIContextProvider
{
    public UserInfo UserInfo { get; set; } = new();

    public override ValueTask<AIContext> InvokingAsync(
        InvokingContext context,
        CancellationToken cancellationToken = default)
    {
        var instructions = UserInfo.UserName is null
            ? "You don't know the user's name yet. Ask for it politely."
            : $"The user's name is {UserInfo.UserName}. Always address them by name.";

        return new ValueTask<AIContext>(new AIContext { Instructions = instructions });
    }

    public override ValueTask InvokedAsync(
        InvokedContext context,
        CancellationToken cancellationToken = default)
    {
        if (UserInfo.UserName is not null)
        {
            return default;
        }

        foreach (var message in context.RequestMessages)
        {
            if (message.Role != ChatRole.User)
            {
                continue;
            }

            var text = message.Text ?? "";
            const string Marker = "my name is";
            var index = text.IndexOf(Marker, StringComparison.OrdinalIgnoreCase);
            if (index < 0)
            {
                continue;
            }

            var rest = text[(index + Marker.Length)..].Trim();
            var name = rest.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
            if (!string.IsNullOrEmpty(name))
            {
                UserInfo.UserName = char.ToUpperInvariant(name[0]) + name[1..].ToLowerInvariant();
            }
        }

        return default;
    }
}
```

挂到 agent 上走 `ChatClientAgentOptions.AIContextProviders`：

```C#
AIAgent agent = new AIProjectClient(new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(new ChatClientAgentOptions
    {
        Name = "MemoryAgent",
        ChatOptions = new ChatOptions
        {
            Instructions = "You are a friendly assistant."
        },
        AIContextProviders = [new UserMemoryProvider()]
    });

AgentSession session = await agent.CreateSessionAsync();
Console.WriteLine(await agent.RunAsync("Hello! What's the square root of 9?", session));
Console.WriteLine(await agent.RunAsync("My name is Alice", session));
Console.WriteLine(await agent.RunAsync("What is 2 + 2?", session));
```

`InvokingAsync` 返回的 `AIContext.Instructions` 是追加，不是覆盖构造时的 instructions。模型实际看到的是原始说明书加上各 provider 注进去的段落。

三轮调用的时间顺序比类名重要。

第一轮 `InvokingAsync`：`UserName` 是空的，追加「你还不知道名字，礼貌地问」。用户问的是 9 的平方根。

第二轮用户说 `My name is Alice`。`InvokingAsync` 仍然先跑，此时 `InvokedAsync` 还没写过名字，追加的仍是「去问名字」。调用结束后 `InvokedAsync` 扫 `RequestMessages`，用很笨的字符串匹配找到 `my name is`，把 `Alice` 写进 UserInfo。这一轮模型未必会用 Alice 称呼人：名字在开口之后才入库。匹配本身也不理解「我是」「叫我」这类变体。框架没有提供自然语言抽取。教程里还有另一种写法：在 `InvokedAsync` 里另调一次聊天客户端，按 schema 抽出名字和年龄。上面这段只对应入门那种字符串钩子。

第三轮问 2+2。`InvokingAsync` 读到名字，追加「用户叫 Alice，请用名字称呼」。回答里带上名字，是因为你把事实钉回每次都会送进模型的那一层。

少传 `session`，`provider` 没有稳定的会话可挂。只传 `session`、不挂 `context provider`，模型仍可能靠历史接上「你还记得我什么」；一旦历史被截断或压缩，名字作为普通句子消失，说明书却不会自动补上。

多个 provider 可以同时挂在 `AIContextProviders` 里。历史那条线在 C# 上是 `ChatHistoryProvider` / `ChatHistoryProviderFactory`，例如内存历史加裁剪：

```C#
AIAgent agent = new AIProjectClient(new Uri(endpoint), new DefaultAzureCredential())
    .AsAIAgent(new ChatClientAgentOptions
    {
        Name = "MemoryAgent",
        ChatOptions = new ChatOptions { Instructions = "You are a friendly assistant." },
        ChatHistoryProviderFactory = (ctx, ct) => new ValueTask<ChatHistoryProvider>(
            new InMemoryChatHistoryProvider(
                new MessageCountingChatReducer(2),
                ctx.SerializedState,
                ctx.JsonSerializerOptions,
                InMemoryChatHistoryProvider.ChatReducerTriggerEvent.AfterMessageAdded)),
        AIContextProviders = [new UserMemoryProvider()]
    });
```

向量检索那类历史增强用 `ChatHistoryMemoryProvider`，按 `UserId` / `SessionId` 控制存和搜的范围。Mem0 那套组合出现在 Python 入门里；C# 侧对应的是 `AIContextProviders` 列表加你选的 history provider，不要把 Python 的 `before_run` 参数名搬过来。

到这一层，单 agent 该有的四件事齐了：连接模型、调用函数、连续对话、把关键事实从历史里单独保存并写回说明书。再往下是分叉。步骤顺序已经确定，用 workflow。任务仍然开放、但会跨很多步，用 Harness。

## 框架的另一条轴：Workflow ##

Workflow 不是「更强的 agent」。它是框架里用来钉死顺序的那条轴。节点叫 Executor，边规定数据怎么走。模型在这张图里没有改道权。选用标准和 Overview 里那张表相同。

```C#
using Microsoft.Agents.AI.Workflows;

Func<string, string> uppercaseFunc = s => s.ToUpperInvariant();
var uppercase = uppercaseFunc.BindAsExecutor("UppercaseExecutor");

sealed class ReverseTextExecutor() : Executor<string, string>("ReverseTextExecutor")
{
    public override ValueTask<string> HandleAsync(
        string message,
        IWorkflowContext context,
        CancellationToken cancellationToken = default)
        => ValueTask.FromResult(string.Concat(message.Reverse()));
}

var reverse = new ReverseTextExecutor();
var builder = new WorkflowBuilder(uppercase);
builder.AddEdge(uppercase, reverse).WithOutputFrom(reverse);
var workflow = builder.Build();

await using Run run = await InProcessExecution.RunAsync(workflow, "Hello, World!");
foreach (WorkflowEvent evt in run.NewEvents)
{
    if (evt is ExecutorCompletedEvent completed)
    {
        Console.WriteLine($"{completed.ExecutorId}: {completed.Data}");
    }
}
```

入门例子只做两步字符串处理：先变大写，再反转，用来看节点和边怎么接。`BindAsExecutor` 把函数登记成节点。`AddEdge` 连线，`WithOutputFrom` 指定从哪个节点取最终结果。少写后一句，图可能跑完了，你拿不到预期输出。`InProcessExecution.RunAsync` 在当前进程执行。进度看 `ExecutorCompletedEvent`：哪个节点完成、当时手里是什么数据。

Python 仓库里还有函数式工作流。C# 主路径是 Graph API。托管时整张图可以 `.AddAsAIAgent()`，对外仍是一个 agent。框架对内承认图和 agent 不同，对外希望协议只认一种对象。

## 框架给长任务的默认装配：Harness ##

Harness 仍是 agent，不是第三种运行时。概念页把它写成现有积木的组合：chat client、负责函数调用和压缩的 pipeline、todo / 模式 / 记忆等 context provider、批准和观测的 middleware。C# 类型是 `HarnessAgent`，由 `IChatClient.AsHarnessAgent()` 得到。

默认带上的东西，就是长任务里反复要手写的那些：规划与执行模式、todo、上下文压缩、会话级文件记忆、可选文件访问、「不要再问了」的批准。概念页默认开 OpenTelemetry，客户端支持则挂 hosted web search。窗口和输出上限在示例里出现过 `128_000` 和 `16_384`。

```C#
AIAgent agent = chatClient.AsHarnessAgent();
AgentSession session = await agent.CreateSessionAsync();

while (true)
{
    Console.Write("> ");
    string? input = Console.ReadLine();
    if (string.IsNullOrWhiteSpace(input) ||
        input.Equals("exit", StringComparison.OrdinalIgnoreCase))
    {
        break;
    }

    await foreach (var update in agent.RunStreamingAsync(input, session))
    {
        Console.Write(update);
    }

    Console.WriteLine();
}
```

Harness 的状态（计划、待办、历史）放在 `session` 上，所以典型用法是循环加同一条 `session`，而不是单次 `RunAsync`。角色说明和操作说明是两层：

```C#
AIAgent agent = chatClient.AsHarnessAgent(new HarnessAgentOptions
{
    Name = "research-agent",
    HarnessInstructions = "Use tools deliberately and report verified results.",
    ChatOptions = new ChatOptions
    {
        Instructions = "You are a research assistant focused on academic sources.",
    },
    MaxContextWindowTokens = 128_000,
    MaxOutputTokens = 16_384,
});
```

`ChatOptions.Instructions` 管它是谁。`HarnessInstructions` 管长任务怎么执行。可以关 `DisableTodoProvider`、`DisableToolAutoApproval`、`DisableCompaction`、`DisableWebSearch`，也可以加 `FileAccessStore`、后台子 `agent`、`LoopEvaluators`。Go 的 `Harness` 还是 `coming soon`。样例在 `dotnet/samples/02-agents/Harness`。

## 框架怎样把 Agent 送出进程：Hosting ##

最后一层是托管。内部抽象不变，还是 `AIAgent`。`Microsoft.Agents.AI.Hosting` 从 DI 里取出这个对象，按协议翻译请求和响应。官方四条路：

A2A，给多 agent 互叫。

OpenAI 兼容端点，给已经会说 Chat Completions / Responses 的客户端。

Durable Extension，让 C# / Python 的 agent 和 workflow 在 Azure Functions 或自托管上可持久。
AG-UI，给网页。

```C#
var pirateAgent = builder.AddAIAgent(
        "pirate",
        instructions: "You are a pirate. Speak like a pirate",
        description: "An agent that speaks like a pirate.",
        chatClientServiceKey: "chat-model")
    .WithAITool(new MyTool())
    .WithInMemorySessionStore();
```

登记名 "pirate" 是钥匙。`chatClientServiceKey` 指向已经注册过的 `IChatClient`。`WithAITool` 把工具挂在这份登记上。`WithInMemorySessionStore` 把对话放在内存里——进程退出即消失，多实例不共享。文档写明生产要自己提供 AgentSessionStore。

工作流目前没有自己的 A2A / OpenAI 集成，对外先 `.AddAsAIAgent()`。然后：

```C#
builder.Services.AddA2AServer();
var app = builder.Build();
app.MapA2AServer();
app.Run();
```

## 一条请求从进门到出门 ##

已经托管的话，入口可能是 A2A、OpenAI 兼容端点或 AG-UI。Hosting 把外部输入译成 `RunAsync(...)`。译完之后，和控制台里自己调用是同一条代码路径。

带了 `session`，就先取出这条会话上的消息历史，以及 `provider` 写在会话状态里的数据。没带，两样都空：模型看不见上一句，也看不见存过的名字。

然后执行各 `AIContextProvider.InvokingAsync`。名字已经在 `UserInfo` 里的话，这里会往 `AIContext.Instructions` 里追加「请用这个名字称呼」。`Harness` 若开着，todo、模式、文件记忆也在这里注入。模型还没调用。它即将读到的是：构造 `agent` 时的 `instructions`，加上刚刚追加的段落。

这之后才到模型。已登记的工具和 MCP 会作为函数说明送进去，模型选择回答或点名。需要批准的工具在执行前停住。中间件可以插在这条链上；`Harness` 默认把工具批准和 OpenTelemetry 放在这里。

模型返回后跑 `InvokedAsync`。`UserMemoryProvider` 从本轮 `RequestMessages` 里找 `my name is`。`History provider` 把本轮消息存进历史。`Harness` 会把计划和待办写回同一条 `session`，所以循环里下一次 `RunAsync` 改的是这份计划。

开了流式，`AgentResponseUpdate` 往外推，`Hosting` 再写成协议响应。不开就等 `AgentResponse` 一次性返回。返回值里不只有答案：同一份响应可以带 `FunctionCallContent`、`FunctionResultContent`、推理文本。`response.Text` 只是把所有 `TextContent` 拼起来。

`Workflow` 不经过「模型选择下一步」。`InProcessExecution.RunAsync` 按边把结果交给下一个 `Executor`。进度看 `ExecutorCompletedEvent`。外部协议要喊到这张图，需要先 `.AddAsAIAgent()`，否则按 `AIAgent` 在容器里取会取空。

调用顺序可以写成：

协议 → `RunAsync` → 读 `session` → `InvokingAsync` → 模型（工具 / 中间件）→ `InvokedAsync` → 写回 `session` → 协议

session 没传，后面的 provider 和 Harness 状态都没有落点。

## 按缺口去装配 ##

做一个能查天气、能记住名字、最后能被协议喊到的 C# agent，不必一次打开七层。哪一层缺了再补哪一层。

- `AIProjectClient.AsAIAgent` 能 `RunAsync`、能 `RunStreamingAsync`，连接就通了。
- 天气是编的，再把函数交给 `AIFunctionFactory.Create`，`[Description]` 写明白。
- 第二句对不上第一句，同一条 `AgentSession` 传进 `RunAsync`。
- 对话一长名字就没了，用 `AIContextProvider` 在 `InvokingAsync` 里把名字写回 `AIContext.Instructions`。
- 必须先核验再发信这种顺序，单独建 `WorkflowBuilder`，不要写进 `instructions`。
- 一单跨很多步、中途要改计划，用 `AsHarnessAgent`，循环里复用 `session`。
- 只有本机能调，再 `AddAIAgent`。生产环境把 `DefaultAzureCredential` 和内存 `session store` 换掉。
C# 对应链：`AsAIAgent`、`AIFunctionFactory.Create`、`CreateSessionAsync`、`AIContextProviders`、`WorkflowBuilder`、`AsHarnessAgent`、`Microsoft.Agents.AI.Hosting`。

C# 和 Python 可以从最小 agent 走到托管。Go 能做连接、工具、session、一部分 workflow 和 A2A；Harness、函数式工作流、声明式 agent、RAG、CodeAct 还没有。内容过滤和第三方模型合规不在入门范围里。框架提供批准、middleware、telemetry。MCP、CodeAct、后台子 agent 在 Concepts / Integrations，加进来之后通常还是一个 `AIAgent`，托管不用另起一套。
