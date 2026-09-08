---
lastUpdated: true
commentabled: true
recommended: true
title: 用 NVIDIA Nemotron 3 Super + .NET 构建有记忆的多轮对话
description: 用 NVIDIA Nemotron 3 Super + .NET 构建有记忆的多轮对话
date: 2026-09-08 10:55:00
pageClass: blog-page-class
cover: /covers/dotnet.svg
---


## 序言 ##

英伟达免费的大模型 Nemotron 最大的优点就是免费，可商用以及支持单卡部署，极大降低了大模型私有化的难度，鉴于此，咱们就来尝尝鲜吧。由于我手头没有显卡支持，只好退而求其次，使用英伟达免费的线上模型尝试了...

## 为什么选择 Nemotron 3 Super ##

2025 年 12 月，NVIDIA 发布 Nemotron 3 开放模型家族，覆盖 Nano、Super 和 Ultra，目标直指 Agent、工具调用和多智能体工作流。2026 年 3 月上线的 Nemotron 3 Super 120B-A12B 共有 120B 参数，但每个 token 只激活约 12B 参数；它采用 Mamba-2、Attention、Latent MoE 和多 token 预测的混合架构，在效率与能力之间做了很有意思的平衡。

根据 NVIDIA 模型介绍，Super 支持中文、代码、工具调用和长上下文，最高可扩展到 100 万 token，尤其适合聊天机器人、RAG 和 Agent 场景。对 .NET 开发者更实用的一点是：NVIDIA 托管接口兼容 OpenAI API，因此现有 OpenAIClient 和 Microsoft Agent Framework 基本不需要更换编程模型。

## 开英伟达账号 ##

直接导航到英伟达开发社区，点它即可。

## 项目搭建 ##

先输入ai配置，如下：

```json
{
  "OpenApi": {
    "UseModel": "Nemotron3",
    "Nemotron3": {
      "BaseUrl": "https://integrate.api.nvidia.com/v1",
      "Model": "nvidia/nemotron-3-super-120b-a12b",
      "ApiKey": "<NVIDIA_API_KEY>",
      "Temperature": 1.0,
      "TopP": 0.95,
      "Timeout": 300
    }
  }
}
```

### 建立OppenAI的兼容客户端 ###

NVIDIA 模型并不是 OpenAI 模型，但接口协议兼容，因此只需替换端点、密钥和模型名：

```cs
OpenAIClient client = new(
    new ApiKeyCredential(currentAi.ApiKey),
    new OpenAIClientOptions
    {
        Endpoint = new Uri(currentAi.BaseUrl),
        NetworkTimeout = TimeSpan.FromSeconds(currentAi.Timeout)
    });

var chatClient = client.GetChatClient(currentAi.Model);

AIAgent agent = chatClient.AsAIAgent(
    instructions: "你是个非常友善的小助手，每次回答问题都很简洁。",
    name: "对话小助手");
```

这也是参考文章中接入第三方模型的关键思路：让兼容接口负责推理，让 Agent Framework 负责会话、上下文和后续工具编排。

### 同一个 Session，就是多轮对话的关键 ###

微软的MAF采用Session管理多次会话，模型接口本身不会凭空记住上一次独立请求。真正让第二轮理解“我是谁”的，是两次调用复用了同一个 AgentSession：

```cs
AgentSession session = await agent.CreateSessionAsync();

await foreach (var update in agent.RunStreamingAsync(
    "我叫嘟嘟，我热爱大象", session))
{
    Console.Write(update);
}

Console.WriteLine();

await foreach (var update in agent.RunStreamingAsync(
    "你知道我是谁吗？", session))
{
    Console.Write(update);
}
```

第一轮把“名字是嘟嘟、喜欢大象”写入会话历史；第二轮虽然没有重复这些信息，但 Framework 会把相关历史随请求交给 Nemotron。因此，正常效果应是模型回答“你叫嘟嘟”，并可能补充“你喜欢大象”。如果第二轮新建了另一个 session，这段上下文就不会自动存在。

`RunStreamingAsync` 还会把生成内容分片写到控制台。它不会改变最终答案，却显著缩短用户感知到的首字等待时间，适合客服和聊天窗口。

### 演示到生产 ###

当前示例验证的是进程内短期记忆。项目还提供了 `VectorChatHistoryProvider`：它按 `SessionId` 保存请求与响应，调用前取回最近 10 条记录。这为跨请求、跨进程的持久化留下了接口，但生产环境还应继续处理：

- 用真正的向量数据库或持久化存储替代临时实现，并设置历史裁剪策略；
- 不记录 API Key、完整请求头和敏感对话，生产环境关闭消息级 Debug 日志；
- 对 429、超时和网络错误增加退避重试与取消令牌；
- 用固定问题集评估中文一致性、上下文召回率、首 token 延迟和单轮成本；
- 长上下文容量不是无限记忆的替代品，历史越长，延迟和费用通常也越高。

## 结论 ##

这次接入最有价值的地方，不是写了多少适配代码，而是边界非常清晰：Nemotron 3 Super 提供推理与对话能力，OpenAI 兼容层降低 SDK 迁移成本，Microsoft Agent Framework 用 AgentSession 管理多轮上下文。只要复用 session，我们就从一次性问答迈进了真正连贯的 Agent 对话；再接入持久化历史、工具和 RAG，就能逐步扩展为生产级应用。
