---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 中实现 LLM 流式响应的两种最佳实践
description: Spring Boot 中实现 LLM 流式响应的两种最佳实践
date: 2026-04-24 09:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 前言 ##

在开发大语言模型（LLM）应用时，流式响应是一个常见需求。LLM SDK 通常提供回调式的监听器接口（如 `onChunk`），而前端需要实时接收数据。

如何在 Spring Boot 中将这两种模式优雅地衔接起来？

本文将介绍两种主流方案：*响应式 WebFlux + Flux 和 传统 MVC + SseEmitter*。

## 背景问题 ##

假设我们有一个 LLM SDK 提供的监听器接口：

```java
public interface LLMStreamListener {
    void onChunk(String chunk);      // 每收到一个数据块时调用
    void onComplete();               // 流结束时调用
    void onError(Throwable error);   // 发生错误时调用
}

// 使用方式
llmClient.stream("Hello", new LLMStreamListener() {
    @Override
    public void onChunk(String chunk) {
        // 如何处理并推送给前端？
    }
    // ...
});
```

核心挑战：将*回调驱动*的异步数据流，转换为 *HTTP 流式响应*。

## 方案一：WebFlux + Flux.create（响应式栈） ##

适用场景：项目已使用 Spring WebFlux，需要完全响应式支持、背压控制。

### 依赖配置 ###

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

### Service 层实现 ###

```java
@Service
@Slf4j
public class LLMStreamService {
    
    @Autowired
    private LLMClient llmClient;
    
    /**
     * 将监听器模式转换为 Flux 流
     */
    public Flux<String> streamLLM(String prompt) {
        return Flux.create(sink -> {
            // 创建监听器，将回调转换为 sink 操作
            LLMStreamListener listener = new LLMStreamListener() {
                @Override
                public void onChunk(String chunk) {
                    // 确保连接未断开
                    if (!sink.isCancelled()) {
                        sink.next(chunk);
                    }
                }
                
                @Override
                public void onComplete() {
                    if (!sink.isCancelled()) {
                        sink.complete();
                    }
                }
                
                @Override
                public void onError(Throwable error) {
                    if (!sink.isCancelled()) {
                        sink.error(error);
                    }
                }
            };
            
            // 启动流式请求
            String streamId = llmClient.startStreaming(prompt, listener);
            
            // 客户端断开连接时的清理工作
            sink.onCancel(() -> {
                log.info("Client cancelled stream: {}", streamId);
                llmClient.stopStreaming(streamId);
            });
            
            sink.onDispose(() -> {
                log.info("Stream disposed: {}", streamId);
            });
            
        }, FluxSink.OverflowStrategy.BUFFER);  // 背压策略：缓冲
    }
    
    /**
     * 带超时和重试的增强版本
     */
    public Flux<String> streamLLMWithRetry(String prompt) {
        return streamLLM(prompt)
            .timeout(Duration.ofSeconds(30))
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                .doBeforeRetry(rs -> log.warn("Retrying stream, attempt: {}", rs.totalRetries())))
            .doOnError(error -> log.error("Stream error", error));
    }
}
```

### Controller 层实现 ###

```java
@RestController
@RequestMapping("/api/llm")
@Slf4j
public class LLMStreamController {
    
    @Autowired
    private LLMStreamService streamService;
    
    /**
     * SSE 格式流式响应
     */
    @GetMapping(value = "/stream/{prompt}", 
                produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamSSE(@PathVariable String prompt) {
        return streamService.streamLLM(prompt)
            .map(chunk -> ServerSentEvent.<String>builder()
                .data(chunk)
                .id(String.valueOf(System.currentTimeMillis()))
                .event("message")
                .build())
            .concatWith(Flux.just(ServerSentEvent.<String>builder()
                .event("complete")
                .data("DONE")
                .build()))
            .doOnSubscribe(sub -> log.info("Client subscribed for prompt: {}", prompt))
            .doOnCancel(() -> log.info("Client cancelled subscription"));
    }
    
    /**
     * 纯文本流（每行一个 chunk）
     */
    @GetMapping(value = "/stream/text/{prompt}", 
                produces = MediaType.TEXT_PLAIN_VALUE)
    public Flux<String> streamText(@PathVariable String prompt) {
        return streamService.streamLLM(prompt)
            .map(chunk -> chunk + "\n");
    }
    
    /**
     * JSON 流格式（NDJSON）
     */
    @GetMapping(value = "/stream/json/{prompt}", 
                produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<Map<String, Object>> streamJson(@PathVariable String prompt) {
        return streamService.streamLLM(prompt)
            .map(chunk -> {
                Map<String, Object> data = new HashMap<>();
                data.put("chunk", chunk);
                data.put("timestamp", System.currentTimeMillis());
                return data;
            });
    }
}
```

### 配置建议 ###

```java
@Configuration
public class WebFluxConfig {
    
    /**
     * 配置全局背压策略和线程模型
     */
    @Bean
    public WebClient webClient() {
        return WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(
                HttpClient.create()
                    .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
                    .doOnConnected(conn -> 
                        conn.addHandlerLast(new ReadTimeoutHandler(30))
                            .addHandlerLast(new WriteTimeoutHandler(30)))
            ))
            .build();
    }
}
```

### 前端调用示例 ###

```javascript
// EventSource API
const eventSource = new EventSource('/api/llm/stream/Hello%20World');
eventSource.addEventListener('message', (e) => {
    console.log('Chunk:', e.data);
});
eventSource.addEventListener('complete', () => {
    console.log('Stream completed');
    eventSource.close();
});

// Fetch API + ReadableStream
async function fetchStream() {
    const response = await fetch('/api/llm/stream/text/Hello');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        console.log(decoder.decode(value));
    }
}
```

## 方案二：Spring MVC + SseEmitter（传统栈） ##

适用场景：项目使用传统 Spring MVC，不想引入 WebFlux 依赖。

### 依赖配置 ###

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### Service 层实现 ###

```java
@Service
@Slf4j
public class LLMStreamService {
    
    @Autowired
    private LLMClient llmClient;
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(50);
    
    /**
     * 创建 SseEmitter 并绑定监听器
     */
    public SseEmitter createStreamEmitter(String prompt, long timeoutMs) {
        SseEmitter emitter = new SseEmitter(timeoutMs);
        
        // 提交到线程池异步执行，避免阻塞 Tomcat 线程
        executorService.submit(() -> {
            LLMStreamListener listener = null;
            try {
                listener = new LLMStreamListener() {
                    @Override
                    public void onChunk(String chunk) {
                        try {
                            emitter.send(SseEmitter.event()
                                .id(String.valueOf(System.currentTimeMillis()))
                                .name("message")
                                .data(chunk));
                        } catch (IOException e) {
                            log.error("Failed to send chunk", e);
                            throw new RuntimeException(e);
                        }
                    }
                    
                    @Override
                    public void onComplete() {
                        try {
                            emitter.send(SseEmitter.event()
                                .name("complete")
                                .data("DONE"));
                            emitter.complete();
                        } catch (IOException e) {
                            log.error("Failed to send completion", e);
                            emitter.completeWithError(e);
                        }
                    }
                    
                    @Override
                    public void onError(Throwable error) {
                        try {
                            emitter.send(SseEmitter.event()
                                .name("error")
                                .data(error.getMessage()));
                            emitter.completeWithError(error);
                        } catch (IOException e) {
                            log.error("Failed to send error", e);
                            emitter.completeWithError(e);
                        }
                    }
                };
                
                // 启动流式请求
                String streamId = llmClient.startStreaming(prompt, listener);
                
                // 设置超时和断开回调
                emitter.onTimeout(() -> {
                    log.warn("SSE timeout for stream: {}", streamId);
                    llmClient.stopStreaming(streamId);
                    emitter.complete();
                });
                
                emitter.onCompletion(() -> {
                    log.info("SSE completed for stream: {}", streamId);
                    llmClient.stopStreaming(streamId);
                });
                
                emitter.onError((ex) -> {
                    log.error("SSE error for stream: {}", streamId, ex);
                    llmClient.stopStreaming(streamId);
                });
                
            } catch (Exception e) {
                log.error("Failed to start stream", e);
                if (listener != null) {
                    listener.onError(e);
                }
                emitter.completeWithError(e);
            }
        });
        
        return emitter;
    }
    
    @PreDestroy
    public void cleanup() {
        executorService.shutdown();
    }
}
```

### Controller 层实现 ###

```java
@RestController
@RequestMapping("/api/llm")
@Slf4j
public class LLMStreamController {
    
    @Autowired
    private LLMStreamService streamService;
    
    /**
     * SSE 流式接口
     */
    @GetMapping(value = "/stream/{prompt}", 
                produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLLM(@PathVariable String prompt) {
        log.info("Received SSE request for prompt: {}", prompt);
        return streamService.createStreamEmitter(prompt, 5 * 60 * 1000L);
    }
    
    /**
     * 支持自定义超时时间
     */
    @GetMapping(value = "/stream/{prompt}/{timeout}")
    public SseEmitter streamLLMWithTimeout(
            @PathVariable String prompt,
            @PathVariable long timeout) {
        return streamService.createStreamEmitter(prompt, timeout * 1000L);
    }
}
```

### 配置优化 ###

```java
@Configuration
public class AsyncConfig implements AsyncConfigurer {
    
    /**
     * 配置 MVC 异步请求的线程池
     */
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("mvc-async-");
        executor.initialize();
        return executor;
    }
    
    /**
     * 配置全局异步超时
     */
    @Bean
    public WebMvcConfigurer webMvcConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
                configurer.setDefaultTimeout(5 * 60 * 1000L);
                configurer.setTaskExecutor(getAsyncExecutor());
            }
        };
    }
}
```

## 两种方案对比 ##

| 维度 | WebFlux + Flux.create | MVC + SseEmitter |
| :--- | :--- | :--- |
| 技术栈 |  响应式（Reactor）  | 传统 Servlet |
| 背压支持 |  ✅ 原生支持  | ❌ 不支持 |
| 资源消耗 |  低（非阻塞）  | 中（每个请求占用线程） |
| 学习曲线 |  陡峭  | 平缓 |
| 吞吐量 |  高（适合长连接）  | 中（受线程池限制） |
| 调试难度 |  较难  | 简单 |
| 兼容性 |  需要 WebFlux 环境  | 所有 Spring Boot 项目 |
| 代码复杂度 |  中  | 低 |

## 选型建议 ##

选择 WebFlux + Flux.create 的场景：

- 项目已经是响应式技术栈
- 需要处理超高并发长连接
- 需要背压控制防止消费者过载
- 团队熟悉 Reactor 编程模型

选择 MVC + SseEmitter 的场景：

- 传统 Spring MVC 项目
- 团队不熟悉响应式编程
- 并发量适中（数百到数千连接）
- 希望快速实现，降低复杂度

## 最佳实践总结 ##

### 顺序保证 ###

无论使用哪种方案，`onChunk` 的调用顺序都会被保持。但要确保 LLM SDK 的回调本身是顺序的。

### 资源清理 ###

```java
// 务必在客户端断开时清理资源
sink.onCancel(() -> cleanup());
emitter.onCompletion(() -> cleanup());
```

### 错误处理 ###

```java
// 完善的错误处理
.doOnError(error -> log.error("Stream error", error))
.exceptionally(throwable -> {
    emitter.completeWithError(throwable);
    return null;
});
```

### 线程管理 ###

- WebFlux：利用 Reactor 的调度器
- MVC：使用独立的线程池，避免耗尽 Tomcat 线程

### 监控和日志 ###

```java
.doOnSubscribe(s -> log.info("Stream started"))
.doOnCancel(() -> log.info("Stream cancelled"))
.doFinally(signal -> log.info("Stream finished: {}", signal));
```

## 完整示例代码 ##

完整的可运行示例已包含以上所有代码片段。根据项目情况选择合适的方案，两种方案都能完美解决回调到 HTTP 流式响应的问题。
