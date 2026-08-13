---
lastUpdated: true
commentabled: true
recommended: true
title: 多轮对话进阶
description: 清除历史、注入 System、截断策略
date: 2026-06-04 13:35:00
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 写在前面 ##

（3 上）我们让 Agent 会记住——多轮里能答出「你叫小明」「你喜欢 C#」。

但真实产品里，光有记忆还不够，还要会 忘、会 改规矩、会 省 Token：

| 需求 | MAF 能力 |
| :--- | :--- |
| 清除历史 | `SetMessages` / `SetInMemoryChatHistory` |
| 注入 System | `MessageInjectingChatClient.EnqueueMessages` |
| 截断策略 | `IChatReducer` + `MessageCountingChatReducer` |

这三件事，就是本篇的全部内容。

## 一、清除会话历史——「一键新开聊天」 ##

### 为什么需要清除？ ###

多轮记忆是双刃剑。用户点了 「新对话」，你还把上一轮「记住数字 42」带进上下文，既浪费 Token，也可能答非所问。

*清除历史 ≠ 销毁 AgentSession*。

Session 还在（同一会话 ID、同一块 StateBag），只是 消息列表被清空——像微信里「清空聊天记录」，窗口没关。

### 实现步骤 ###

步骤 1：照旧创建带 InMemoryChatHistoryProvider 的 Agent 和 Session。

步骤 2：先聊两轮，验证「记得住」：

```csharp
await agent.RunAsync("记住这个数字：42。", session);
await agent.RunAsync("我刚才让你记住的数字是多少？", session);
// 预期：42
```

步骤 3：清空历史（两种写法等价）：

```csharp
// 写法 A：通过 Provider
historyProvider.SetMessages(session, []);

// 写法 B：通过 Session 扩展方法
session.SetInMemoryChatHistory([]);
```

步骤 4：再问同一个问题：

```csharp
await agent.RunAsync("我刚才让你记住的数字是多少？", session);
// 预期：不知道 / 没有相关信息
```

### Demo 关键代码 ###

```csharp
Console.WriteLine("--- 执行清除历史 ---");
historyProvider.SetMessages(session, []);
PrintHistory("清除后", historyProvider, session);  // 应为 0 条

await RunTurnAsync(agent, session, "我刚才让你记住的数字是多少？", cancellationToken);
```

### 注意点 ###

- 清的是 ChatHistory 消息，不是 Instructions（创建 Agent 时的系统角色仍在）。
- 若只清 Session 却换了一个没挂同一 Provider 的 Agent，行为可能不一致——同一 Agent + 同一 Provider 实例 最稳妥。
- 生产环境还可 新建 Session（`CreateSessionAsync()`）代替清空，效果类似「全新对话窗口」。


## 二、运行时注入 System Message——「对话中途改规矩」 ##

### 和 Instructions 有什么不同？ ###

（3 上）讲过：ChatOptions.Instructions 在 创建 Agent 时 写好，相当于入职手册。

有时要在 聊了一半 才改规则，例如：

- 用户点击「切换英文」
- 运营活动临时加一条「今日禁止讨论价格」
- 工具执行完后插入 hidden system 提示

这时不适合重建 Agent，而是 往当前 Session 里再塞一条 System 消息。

| | Instructions (静态) | 运行时注入 (动态) |
| :--- | :--- | :--- |
| **时机** | `AsAIAgent` / `ChatClientAgentOptions` | 任意一轮 `RunAsync` 之前 |
| **改法** | 换配置或换 Agent | `EnqueueMessages` |
| **历史** | 每轮都有 | 从注入时刻起影响后续轮次 |

### 机制：MessageInjectingChatClient ###

MAF 在管道里加一层 MessageInjectingChatClient：

```text
RunAsync 触发
    → 从 Session.StateBag 取出「待注入消息队列」
    → 合并进本次发给模型的 messages
    → 调用大模型
```

要启用它，创建 Agent 时必须：

```csharp
var options = new ChatClientAgentOptions
{
    Name = "InjectSystemAgent",
    ChatOptions = new ChatOptions { Instructions = BaseInstructions },
    ChatHistoryProvider = historyProvider,
    EnableMessageInjection = true,   // 关键开关
};
```

### 实现步骤 ###

步骤 1：`enableMessageInjection: true` 创建 Agent，并 `CreateSessionAsync()`。

步骤 2：第一轮正常聊（中文）：

```csharp
await agent.RunAsync("用一句话介绍你自己。", session);
```

步骤 3：拿到注入器并排队 System 消息：

```csharp
MessageInjectingChatClient? injector = agent.GetService<MessageInjectingChatClient>();
if (injector is null)
{
    // 说明 EnableMessageInjection 未生效
    return;
}

injector.EnqueueMessages(session,
[
    new ChatMessage(ChatRole.System, "From now on, reply only in brief English.")
]);
```

步骤 4：第二轮提问，观察是否变英文：

```csharp
await agent.RunAsync("用一句话介绍 MAF。", session);
```

### 形象理解 ###

把对话想成开会：

- Instructions：会议开始前发的议程（一直有效）
- EnqueueMessages(System)：会中主席突然补充：「接下来请用英文发言」

之前的发言记录还在（History 没清），但 后续 模型会多看到一条 System，从而改变风格。

### 注意点 ###

- 必须 `EnableMessageInjection = true`，否则 `GetService<MessageInjectingChatClient>()` 为 null。
- 注入的是 下一轮（或同轮 pipeline 内下一次模型调用）才生效，不是改已经发出去的历史。
- 模型不一定 100% 遵守新 System，和写静态 Instructions 一样要靠 prompt 与评测。


## 三、截断策略——「聊天记录太长就裁剪」 ##

### 为什么需要截断？ ###

（3 上）历史会一直 append。聊 50 轮后：

- Token 爆掉 —— 超 context window，API 报错或截断
- 变慢变贵 —— 每次带全长历史
- 干扰答案 —— 早期无关内容稀释注意力

所以要在 发给模型之前，对历史做 Reduce（缩减）。MAF 通过 IChatReducer 挂在 InMemoryChatHistoryProvider 上实现。

### 存储 vs 发给模型：两个数量 ###

Demo 【5】里有一个容易混淆的点：

| 概念 | 含义 |
| :--- | :--- |
| 存储条数 | `GetMessages(session).Count` —— StateBag 里完整保存的轮次 |
| 发给模型的条数 | 经 `ChatReducer` 裁剪之后 再拼进 API 的 messages |

截断默认在 BeforeMessagesRetrieval（取历史给模型 之前）触发：

```csharp
new InMemoryChatHistoryProviderOptions
{
    ChatReducer = new MessageCountingChatReducer(maxMessages),
    ReducerTriggerEvent = InMemoryChatHistoryProviderOptions
        .ChatReducerTriggerEvent.BeforeMessagesRetrieval,
}
```

因此可能出现：存储 12 条，实际只把最近 4 条非 System 消息发给模型。

### MessageCountingChatReducer 做什么？ ###

```csharp
ChatReducer = new MessageCountingChatReducer(4)  // 最多保留 4 条「非 System」消息
```

行为（简化理解）：

- 保留 第一条 System（若有）
- 保留 最近 4 条 user / assistant 消息
- 丢掉 更早的 user / assistant
- 含 *工具调用* 的消息通常 不参与 计数/会被排除（避免 tool 链断裂）

### Demo 设计：水果游戏 ###

连续 6 轮让用户只说水果名，第 6 轮问「按顺序列出你记得的水果」：

```csharp
string[] prompts =
[
    "第1轮：说「苹果」。",
    "第2轮：说「香蕉」。",
    "第3轮：说「橙子」。",
    "第4轮：说「葡萄」。",
    "第5轮：说「西瓜」。",
    "第6轮：请按顺序列出你记得我说过哪些水果（只列水果名）。",
];
```

若 不截断，模型可能列出 6 个；

若 只保留 4 条，模型往往只能稳定记住 后 4 个（香蕉、橙子、葡萄、西瓜），苹果 可能被裁掉。

每轮打印存储条数，你会看到存储持续增长，但模型「记忆」受 reducer 限制——这就是截断策略的直观实验。

### 方法代码 ###

AgentFactory.CreateWithTruncation 把配置收成一行：

```csharp
public static AIAgent CreateWithTruncation(
    IChatClient chatClient,
    string instructions,
    string name,
    int maxNonSystemMessages)
{
    var historyProvider = new InMemoryChatHistoryProvider(new InMemoryChatHistoryProviderOptions
    {
        ChatReducer = new MessageCountingChatReducer(maxNonSystemMessages),
        ReducerTriggerEvent = InMemoryChatHistoryProviderOptions
            .ChatReducerTriggerEvent.BeforeMessagesRetrieval,
    });

    return CreateWithSessionHistory(chatClient, instructions, name, historyProvider);
}
```

### 注意点 ###

- maxMessages 过小会「失忆」过早内容；过大则失去截断意义，需按模型 context 与业务调参。
- 有 Function Tool 的多轮对话要谨慎截断，避免裁断 tool call / tool result 配对。
- 还有 SummarizingChatReducer（把旧对话摘要成一条）等，适合要「保留语义」而不是「硬砍条数」的场景——可后续单独开一篇。
- ReducerTriggerEvent.AfterMessageAdded 会在 写入后 就缩减存储；BeforeMessagesRetrieval 只影响 读出，存储仍完整——Demo 用的是后者，便于观察「存得多、读得少」。


## 四、三种能力一张表 ##

| 能力 | 核心 API | 是否清空 Session | 典型场景 |
| :--- | :--- | :--- | :--- |
| 清除历史 | `SetMessages(session, [])` | 否，只清消息 | 新对话、隐私、换话题 |
| 注入 System | `EnqueueMessages(session, [System...])` | 否，追加规则 | 切换语言、临时策略 |
| 截断 | `ChatReducer` on Provider | 否，裁剪读出 | 长对话、控 Token |

```text
         AgentSession（会话身份不变）
              │
              ├── 清除历史     → 消息列表 = []
              ├── 注入 System  → 队列里多一条 System，下轮生效
              └── 截断         → 存储可很长，读出时变短
```

## 五、拓展知识 ##

### 清除 vs 新建 Session ###

| 做法 | 优点 | 缺点 |
| :--- | :--- | :--- |
| `SetMessages([], ...)` | 同一 sessionId，前端不用换 | StateBag 里其它状态还在 |
| `CreateSessionAsync()` 新的 | 彻底隔离 | 要管理更多 session 对象 |

按产品需求选；很多 App 的「新对话」其实是 新 Session。

### 注入消息还能干什么？ ###

EnqueueMessages 不限 System，也可注入 User / Assistant（例如模拟用户确认、插入 RAG 检索结果）。

System 注入最常见，因为 改行为而不冒充用户原话。

### Reducer 生态（Microsoft.Extensions.AI） ###

| Reducer | 策略 |
| :--- | :--- |
| `MessageCountingChatReducer` | 按条数保留最近 N 条 |
| `SummarizingChatReducer` | 旧消息用大模型摘要成一条 |

MAF 的 Compaction 命名空间还有更复杂的压缩管线，适合超长 Agent 任务。

### 和（3 上）手动 History 的关系 ###

手动 `List<ChatMessage>` 时：

- 清除：`history.Clear()`
- 注入：`history.Insert(0, new ChatMessage(System, …))` 自己控制位置
- 截断：`history = (await reducer.ReduceAsync(history)).ToList()`

MAF Provider + Reducer 是把这套 标准化、可插拔；理解手动版有助于 debug。

### 生产 checklist ###

- 长会话必须配 截断或摘要，并监控 Token。
- 「新对话」要 清历史或新 Session，避免串话。
- 动态规则用 注入，静态角色用 Instructions，不要混为一谈。
- 预览 API（MessageInjectingChatClient 等）关注 MAF 版本升级说明。


## 六、系列小结（3 上 + 3 下） ##

```text
（3 上）Agent 会「记住」
    AgentSession + InMemoryChatHistoryProvider
    手动 List<ChatMessage>

（3 下）Agent 会「管记忆」
    清除历史  → SetMessages / SetInMemoryChatHistory
    注入 System → EnableMessageInjection + EnqueueMessages
    截断策略  → MessageCountingChatReducer + BeforeMessagesRetrieval
```

配合系列前两篇：

```text
（1）会「说」  → RunAsync / RunStreamingAsync
（2）会「做」  → AIFunctionFactory + tools
（3）会「记」  → Session + ChatHistory
（3 下）会「管」→ 清除 / 注入 / 截断
```
