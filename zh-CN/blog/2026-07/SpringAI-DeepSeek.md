---
lastUpdated: true
commentabled: true
recommended: true
title: Spring AI 集成 DeepSeek 原生供应商
description: 告别 OpenAI 兼容层，获取结构化推理过程
date: 2026-07-10 11:30:00
pageClass: blog-page-class
cover: /covers/ai.svg
---

## 背景

项目中一直用 Spring AI 的 OpenAI 兼容层调用 DeepSeek API（把 `spring.ai.openai.base-url` 指向 `https://api.deepseek.com`）。这种方式能跑，但有几个痛点：

- 拿不到 `reasoning_content`：DeepSeek 的推理过程（CoT）不会以结构化字段返回，只能让模型把思考过程包在 `<think>` 标签里，前端再用状态机做标签解析，极其脆弱
- 缺失 DeepSeek 特有 API：Prefix Completion、DeepSeek 特有的参数等都无法使用
- 配置语义不清晰：写着 `openai`，实际调的却是 DeepSeek，维护成本高

Spring AI 在 1.x 版本已经官方支持了 DeepSeek，本文记录完整的迁移过程。

## 添加依赖

在 `pom.xml` 中添加 DeepSeek Starter（版本由 BOM 1.1.3 统一管理）：

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-deepseek</artifactId>
</dependency>
```

## 配置供应商

在 `application-dev.yml` 中添加 DeepSeek 配置块：

```yaml
spring:
  ai:
    deepseek:
      api-key: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      chat:
        options:
          model: deepseek-v4-flash
          temperature: 1.0
```

API Key 建议通过环境变量注入，避免硬编码。

## 注册 Bean

在 `AiConfig.java` 中注册 DeepSeek 的 ChatModel 和 ChatClient：

```java
import org.springframework.ai.deepseek.DeepSeekChatModel;

@Bean("deepseekChatModel")
public ChatModel deepseekChatModel(DeepSeekChatModel deepSeekChatModel) {
    return deepSeekChatModel;
}

@Bean("deepseekChatClient")
public ChatClient deepseekChatClient(
        @Qualifier("deepseekChatModel") ChatModel deepseekChatModel,
        MessageFormatAdvisor messageFormatAdvisor,
        LifecycleToolCallAdvisor lifecycleToolCallAdvisor,
        TaskProgressAdvisor taskProgressAdvisor,
        RetryAdvisor retryAdvisor) {
    return ChatClient.builder(deepseekChatModel)
            .defaultToolContext(new HashMap<>(Map.of("debug", true)))
            .defaultAdvisors(
                    messageFormatAdvisor,
                    lifecycleToolCallAdvisor,
                    taskProgressAdvisor,
                    retryAdvisor
            )
            .build();
}
```

## Controller 改造 — 原生推理流式输出

改造前：每个 SSE Chunk 拿到的是 `AssistantMessage`，`<think>` 标签可能被切碎在多个 `Chunk` 里，需要维护复杂的状态机做拼接。

改造后：使用 `DeepSeekAssistantMessage`，`reasoningContent` 和 `text` 是两个独立字段：

```java
import org.springframework.ai.deepseek.DeepSeekAssistantMessage;

.concatMap(response -> {
    AssistantMessage output = response.getResult().getOutput();
    List<ServerSentEvent<ChatChunk>> events = new ArrayList<>();

    if (output.getToolCalls() != null && !output.getToolCalls().isEmpty()) {
        // handle tool calls
        return Flux.fromIterable(events);
    }

    if (output instanceof DeepSeekAssistantMessage dsMsg) {
        String reasoning = dsMsg.getReasoningContent();
        if (reasoning != null && !reasoning.isEmpty()) {
            state.accumulateReasoning(reasoning, events);
        }
    }

    String text = output.getText();
    if (text != null && !text.isEmpty()) {
        state.flushReasoning(events);
        events.add(createEvent("message", state.messageId(), text, null));
    }

    return Flux.fromIterable(events);
})
```

## 推理内容缓冲优化

`reasoningContent` 以 Token 粒度到达，每个 SSE Chunk 可能只有一个字，直接推给前端会导致渲染碎片化。需要在服务端按语义边界缓冲：

```java
private static class StreamState {
    private static final int REASONING_FLUSH_THRESHOLD = 50;
    private static final Pattern SENTENCE_BOUNDARY =
            Pattern.compile("[。！？.!?\n]+");
    private final StringBuilder reasoningBuffer = new StringBuilder();

    public void accumulateReasoning(String delta,
            List<ServerSentEvent<ChatChunk>> target) {
        reasoningBuffer.append(delta);
        String buf = reasoningBuffer.toString();
        var matcher = SENTENCE_BOUNDARY.matcher(buf);
        int lastEnd = 0;
        while (matcher.find()) {
            String segment = buf.substring(lastEnd, matcher.end()).trim();
            if (!segment.isEmpty()) {
                target.add(createEvent("thought", "reasoning", segment, null));
            }
            lastEnd = matcher.end();
        }
        reasoningBuffer.delete(0, lastEnd);
        if (reasoningBuffer.length() > REASONING_FLUSH_THRESHOLD) {
            target.add(createEvent("thought", "reasoning",
                reasoningBuffer.toString(), null));
            reasoningBuffer.setLength(0);
        }
    }
}
```

触发策略：

- 遇到句号/问号/感叹号/换行 → 按标点切分，整句发出
- 缓冲区积累超过 50 字符无标点 → 强制整块发出
- 切换到文本输出或工具调用 → 排空缓存

## 效果对比

改造前：前端收到逐个单词的 `thought` 事件：

```json
event: thought  data: {"content":"The","role":"thought"}
event: thought  data: {"content":"user","role":"thought"}
event: thought  data: {"content":"wants","role":"thought"}
```

改造后：前端收到完整的语义段落：

```json
event: thought  data: {"content":"The user wants me to add a new feature.","role":"thought"}
event: thought  data: {"content":"Let me think about the best approach.","role":"thought"}
```

## 总结

Spring AI 官方 DeepSeek Starter 带来的核心收益：

- 结构化推理内容：`DeepSeekAssistantMessage.getReasoningContent()` 直接获取 CoT，无需 `<think>` 标签 hack
- 服务端缓冲：按语义边界批量下发，前端零改动即可获得平滑渲染
- 配置语义化：`spring.ai.deepseek.* `一目了然
- 扩展性：无缝使用 DeepSeek 特有功能（Prefix Completion、Reasoning 多轮对话等）
