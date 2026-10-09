---
lastUpdated: true
commentabled: true
recommended: true
title: 线程池拒绝策略场景分析
description: 线程池拒绝策略场景分析
date: 2026-04-21 10:34:00 
pageClass: blog-page-class
cover: /covers/java.svg
---

不同的业务场景对任务丢失的容忍度、响应延迟的要求、系统保护的需求各不相同。下面通过 6 个典型场景，分析如何选择合适的拒绝策略，并给出代码示例和注意事项。

## 场景1：电商订单支付（核心交易链路） ##

业务特点：

- 每一笔支付请求都必须处理，不能丢失。
- 支付操作涉及数据库更新、第三方网关调用、消息发送等。
- 要求高一致性，失败需要明确感知并触发重试或补偿。

压力情况：大促时瞬间流量激增，线程池可能饱和。

选择策略：`AbortPolicy` + 上层统一捕获异常，进行异步重试或放入死信队列。

理由：

- 支付任务绝对不能静默丢弃（`DiscardPolicy` 不可用）。
- 不能让调用者线程执行支付任务（`CallerRunsPolicy` 会阻塞 Tomcat 线程，导致整个服务响应变慢）。
- 抛出异常是最明确的失败信号，由调用方（通常是 `Controller` 或 `Service`）捕获后，可以将任务转储到消息队列或数据库，稍后重试。

代码示例：

```java
// 线程池配置
@Bean("paymentExecutor")
public Executor paymentExecutor() {
    ThreadPoolExecutor executor = new ThreadPoolExecutor(
        20, 50, 60L, TimeUnit.SECONDS,
        new ArrayBlockingQueue<>(200),
        new NamedThreadFactory("payment"),
        new ThreadPoolExecutor.AbortPolicy()  // 显式抛出异常
    );
    return executor;
}

// 业务调用处
@Service
public class PaymentService {
    @Autowired
    private ThreadPoolExecutor paymentExecutor;
    
    public void processPayment(PaymentRequest request) {
        try {
            paymentExecutor.execute(() -> doPayment(request));
        } catch (RejectedExecutionException e) {
            // 线程池饱和，将任务写入重试队列（如 RocketMQ、Redis 等）
            saveToRetryQueue(request);
            log.warn("Payment task rejected, saved to retry queue. requestId={}", request.getId());
            // 可选：向调用方返回“系统繁忙，稍后重试”的提示
        }
    }
}
```

监控指标：拒绝次数必须为 0，一旦出现立即告警并扩容。

## 场景2：秒杀扣库存（瞬时高并发，允许快速失败） ##

业务特点：

- 请求量瞬间爆炸，但真正能成功秒杀到的用户只有一小部分。
- 要求极低的响应延迟，不能排队等待。
- 超出处理能力的请求应该被快速拒绝，返回“已售罄”或“系统繁忙”。

压力情况：QPS 从几百瞬间飙升到几十万。

选择策略：`AbortPolicy` 或 `DiscardPolicy` + 前端友好提示。

理由：

- 使用 `SynchronousQueue` + 有限最大线程数（如 200），任何超出并发能力的请求立即触发拒绝。
- 用 `AbortPolicy` 抛异常，或者用 `DiscardPolicy` 静默丢弃，但都需要在业务层捕获并返回统一的失败响应。
- 不能使用 `CallerRunsPolicy`，因为调用者（Tomcat 工作线程）执行秒杀任务会严重拖垮整个 Web 容器。

代码示例：

```java
// 秒杀专用线程池
int maxConcurrency = 200; // 根据压测得出系统能承受的最大并发扣库存操作
ExecutorService seckillExecutor = new ThreadPoolExecutor(
    0, maxConcurrency, 30L, TimeUnit.SECONDS,
    new SynchronousQueue<>(),
    new NamedThreadFactory("seckill"),
    new ThreadPoolExecutor.AbortPolicy()
);

// 秒杀接口
@PostMapping("/seckill")
public Result seckill(Long goodsId, Long userId) {
    try {
        seckillExecutor.execute(() -> {
            // 扣库存、创建订单等核心操作
            inventoryService.decr(goodsId);
            orderService.create(userId, goodsId);
        });
        return Result.success("抢购中，请稍后查看订单");
    } catch (RejectedExecutionException e) {
        // 线程池满，直接返回失败
        return Result.error("很遗憾，您没抢到，下次加油");
    }
}
```

优化点：可以在拒绝策略中直接记录指标，但无需重试，因为秒杀失败就是最终结果。

## 场景3：异步发送短信/邮件（非关键通知，允许少量丢失） ##

业务特点：

- 用户注册、下单后发送确认短信/邮件。
- 即使少量消息发送失败，也不影响核心业务（用户可以通过其他渠道重试）。
- 不希望因消息发送阻塞主流程。

压力情况：业务高峰时消息量较大，但系统可以接受一定程度的丢弃。

选择策略：`DiscardOldestPolicy` 或 `DiscardPolicy` + 日志记录。

理由：

- 消息堆积过久反而不如丢弃旧消息，保证新消息能及时发出（`DiscardOldestPolicy`）。
- 如果消息完全可丢弃（如运营推广短信），直接用 `DiscardPolicy`。
- 不能使用 `CallerRunsPolicy`，因为主线程（如订单完成后的异步通知）不应被阻塞。

代码示例：

```java
// 通知线程池
ThreadPoolExecutor notifyExecutor = new ThreadPoolExecutor(
    5, 20, 60L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(500),
    new NamedThreadFactory("notify"),
    new ThreadPoolExecutor.DiscardOldestPolicy()
);

// 发送短信
public void sendSms(String phone, String content) {
    notifyExecutor.execute(() -> {
        try {
            smsClient.send(phone, content);
        } catch (Exception e) {
            log.error("Send sms failed, phone={}", phone, e);
            // 可选：记录失败到数据库，由定时任务补偿
        }
    });
}
```

监控：可以统计丢弃数量，如果丢弃率过高（如 `>1%`），考虑扩容或优化短信通道。

## 场景4：日志/审计记录（海量低价值，可丢弃） ##

业务特点：

- 每条请求都需要记录访问日志、用户行为日志。
- 数据量极大（每秒数万条），对实时性要求低。
- 偶尔丢失几条日志对业务无影响。

压力情况：持续高吞吐，磁盘或网络可能成为瓶颈。

选择策略：`DiscardPolicy`（静默丢弃）。

理由：

- 日志系统不应该拖垮主业务。如果线程池满了，说明下游（如日志服务器、ES）已经处理不过来，再排队只会加剧问题。
- 直接丢弃是最简单有效的自我保护。
- 也可以自定义策略，将丢弃的日志采样记录（用于分析丢失率）。

代码示例：

```java
ThreadPoolExecutor logExecutor = new ThreadPoolExecutor(
    2, 10, 10L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(1000),
    new NamedThreadFactory("access-log"),
    new ThreadPoolExecutor.DiscardPolicy()
);

// 记录访问日志
public void logAccess(HttpServletRequest request) {
    logExecutor.execute(() -> {
        // 构建日志对象，发送到 Kafka 或写入本地文件
        accessLogService.save(parseLog(request));
    });
}
```

进阶：可以结合采样，在丢弃时随机记录 `1%` 的丢弃事件用于监控。

## 场景5：批量数据导入（任务重，不允许丢失，可接受延迟） ##

业务特点：

- 从文件、数据库批量导入数据，每个任务执行时间较长（秒级到分钟级）。
- 任务数量固定，不允许丢失。
- 可以接受导入速度变慢，但不能失败。

压力情况：任务提交可能短时间集中，但总任务量可控。

选择策略：`CallerRunsPolicy`。

理由：

- 当线程池饱和时，由调用者线程（例如主线程或定时任务线程）直接执行导入任务，这样不会丢失任务，同时会自然降低新任务的提交速度。
- 因为导入任务本身是重量级操作，调用者执行虽然会阻塞，但总比丢弃好。
- 配合有界队列，防止内存溢出。

代码示例：

```java
ThreadPoolExecutor importExecutor = new ThreadPoolExecutor(
    4, 8, 5L, TimeUnit.MINUTES,
    new ArrayBlockingQueue<>(10),  // 小队列，让拒绝策略尽快生效
    new NamedThreadFactory("data-import"),
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 批量提交导入任务
public void importLargeFiles(List<File> files) {
    for (File file : files) {
        importExecutor.execute(() -> importOneFile(file));
    }
    importExecutor.shutdown();
    importExecutor.awaitTermination(1, TimeUnit.HOURS);
}
```

注意：`CallerRunsPolicy` 可能会导致调用者线程长时间阻塞，如果调用者是定时任务线程，可能影响其他定时任务。可以将调用者线程池也设置得足够健壮。

## 场景6：与消息队列结合（最终一致性，高可靠性） ##

业务特点：

- 任务必须处理，但不能阻塞当前线程。
- 希望削峰填谷，利用消息队列的持久化能力。

选择策略：自定义拒绝策略，将任务转发到 RocketMQ、Kafka 等。

理由：

- 线程池只处理实时部分，当线程池饱和时，将任务写入消息队列，由消费者异步处理。
- 这样既保护了系统，又保证了任务不丢失。

代码示例：

```java
public class MQBackedRejectedHandler implements RejectedExecutionHandler {
    private final RocketMQTemplate mqTemplate;
    private final String topic;
    
    public MQBackedRejectedHandler(RocketMQTemplate mqTemplate, String topic) {
        this.mqTemplate = mqTemplate;
        this.topic = topic;
    }
    
    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        if (executor.isShutdown()) {
            return;
        }
        // 将任务序列化后发送到 MQ
        if (r instanceof SerializableTask) {
            mqTemplate.syncSend(topic, ((SerializableTask) r).getPayload());
        } else {
            // 兜底：记录到数据库
            saveToDatabase(r);
        }
    }
}

// 线程池配置
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10, 50, 60L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),
    new NamedThreadFactory("worker"),
    new MQBackedRejectedHandler(mqTemplate, "rejected-task-topic")
);
```

注意：发送 MQ 本身也可能失败，需要做好重试和监控。

## 场景总结表 ##

| 业务场景 | 推荐拒绝策略 | 理由 | 风险提示 |
| :--- | :--- | :--- | :--- |
| 支付/下单（核心交易） | `AbortPolicy` + 上层重试 | 必须明确失败，不能静默丢弃 | 调用方需处理异常 |
| 秒杀/抢购（快速失败） | `WorkAbortPolicy` / `DiscardPolicyflow` | 追求低延迟，超出直接拒绝 | 丢弃率可能较高，前端需友好提示 |
| 异步通知（短信/邮件） | `DiscardOldestPolicy` | 保证新消息优先，可少量丢失 | 旧消息可能丢失 |
| 日志/审计 | `DiscardPolicy` | 海量数据，可丢失 | 监控丢弃率，避免过高的丢失 |
| 批量导入（不允许丢） | `CallerRunsPolicy` | 由调用者执行，不丢失 | 调用者可能阻塞 |
| 高可靠异步任务 | 自定义（转 MQ/DB） | 削峰填谷，保证最终执行 | 增加系统复杂度 |

## 最佳实践建议 ##

- 默认不要使用 `AbortPolicy` 而毫无处理：至少要在业务代码中捕获 `RejectedExecutionException`，记录日志或触发降级。
- 非核心业务优先使用 `DiscardPolicy` 并记录丢弃次数：用于容量规划。
- 所有拒绝策略都应该有监控：通过 `Micrometer`、`Prometheus` 暴露 `rejected.count` 指标。
- `CallerRunsPolicy` 要谨慎评估调用者线程：如果调用者是 `Web` 请求线程，可能导致请求超时堆积。
- 自定义拒绝策略时不要执行过于耗时的操作（如写数据库、发 MQ），否则会加剧线程池的阻塞。

通过结合具体业务场景选择合适的拒绝策略，可以平衡系统稳定性、任务可靠性和响应延迟三者之间的关系，构建高可用的并发系统。
