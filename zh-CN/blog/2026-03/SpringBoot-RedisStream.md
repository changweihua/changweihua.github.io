---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot + Redis Stream + 消费组
description: 替代 Kafka 轻量级消息队列，低延迟高吞吐
date: 2026-03-23 10:55:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 引言 ##

最近项目中遇到一个有趣的选择：原本打算用Kafka做消息队列，但考虑到部署复杂度和资源消耗，最终选择了Redis Stream。结果发现这个组合不仅轻量，性能还超出预期。

很多同学一提到消息队列就想到Kafka、RabbitMQ这些重量级选手，但其实Redis 5.0引入的Stream特性，配合SpringBoot使用，完全可以胜任大部分业务场景的消息队列需求。

## 为什么选择Redis Stream？ ##

### 传统消息队列的痛点 ###

Kafka的问题：

- 部署复杂，需要Zookeeper集群
- 资源消耗大，至少需要几个G内存
- 学习成本高，配置参数众多
- 对于小项目来说杀鸡用牛刀

Redis Stream的优势：

- 天然集成，已有Redis就可使用
- 轻量级，几乎零额外成本
- API简单，学习曲线平缓
- 性能优秀，支持高并发

## 核心概念解析 ##

### Redis Stream vs 传统List ###

很多人问：既然Redis有List，为什么还要Stream？

```bash
# List方式（简单但功能有限）
LPUSH order_queue "order_id:123"
BRPOP order_queue 30

# Stream方式（功能强大）
XADD order_stream * order_id 123 user_id 456 amount 99.99
XREADGROUP GROUP order_group consumer1 COUNT 1 BLOCK 0 STREAMS order_stream >
```

Stream相比List的核心优势：

- 消息确认机制：处理完消息可以ACK确认
- 消费组支持：多个消费者可以组成组，负载均衡
- 消息追溯：可以查询历史消息，支持消息重放
- 持久化保证：消息不会因为消费者断开而丢失

### 消费组工作机制 ###

消费组是Redis Stream最强大的特性：

```txt
生产者 → Stream → 消费组 → 消费者A
                    ↓
                  消费者B
                    ↓
                  消费者C
```

每个消费者组维护自己的消费进度，组内消费者共享消息负载。

## 整体架构设计 ##

我们的Redis Stream消息队列架构：

```java
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   消息生产者     │───▶│   Redis Stream   │───▶│   消费组管理     │
│  (SpringBoot)   │    │     (存储)       │    │  (进度跟踪)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  消费者A     │      │  消费者B     │      │  消费者C     │
│ (订单处理)   │      │ (库存处理)   │      │ (通知处理)   │
└─────────────┘      └─────────────┘      └─────────────┘
```

## 核心设计要点 ##

### 消息模型设计 ###

```java
// 统一的消息包装类
@Data
public class StreamMessage<T> {
    private String messageId;    // 消息ID
    private String streamName;   // 流名称
    private String eventType;    // 事件类型
    private T payload;          // 消息内容
    private Map<String, Object> headers; // 消息头
    private Instant timestamp;   // 时间戳
}
```

### 消费组配置管理 ###

```yaml
redis:
  stream:
    # 订单处理流配置
    order-stream:
      name: order_events
      consumer-group: order_processor_group
      consumers: 
        - order_handler_1
        - order_handler_2
      read-count: 10
      block-timeout: 5000
      
    # 库存处理流配置
    inventory-stream:
      name: inventory_events
      consumer-group: inventory_processor_group
      consumers:
        - inventory_handler_1
      read-count: 5
      block-timeout: 3000
```

### 消息生命周期管理 ###

```java
public enum MessageStatus {
    PENDING,    // 待处理
    PROCESSING, // 处理中
    SUCCESS,    // 处理成功
    FAILED,     // 处理失败
    RETRYING    // 重试中
}
```

## 关键实现细节 ##

### 生产者实现 ###

```java
@Service
@RequiredArgsConstructor
public class StreamMessageProducer {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    public String sendOrderEvent(OrderEvent event) {
        Map<String, Object> messageBody = new HashMap<>();
        messageBody.put("eventType", event.getEventType());
        messageBody.put("orderId", event.getOrderId());
        messageBody.put("userId", event.getUserId());
        messageBody.put("amount", event.getAmount());
        messageBody.put("timestamp", System.currentTimeMillis());
        
        // 发送到订单事件流
        RecordId recordId = redisTemplate.opsForStream()
            .add("order_events", messageBody);
            
        log.info("订单事件已发送: orderId={}, recordId={}", 
                event.getOrderId(), recordId);
        return recordId.getValue();
    }
}
```

### 消费组管理 ###

```java
@Component
@RequiredArgsConstructor
public class ConsumerGroupManager {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    @PostConstruct
    public void initializeConsumerGroups() {
        StreamOperations<String, Object, Object> streamOps = 
            redisTemplate.opsForStream();
            
        // 初始化订单处理消费组
        try {
            streamOps.createGroup("order_events", 
                ReadOffset.from("0"), "order_processor_group");
            log.info("订单处理消费组初始化成功");
        } catch (Exception e) {
            log.info("订单处理消费组已存在");
        }
        
        // 初始化库存处理消费组
        try {
            streamOps.createGroup("inventory_events", 
                ReadOffset.from("0"), "inventory_processor_group");
            log.info("库存处理消费组初始化成功");
        } catch (Exception e) {
            log.info("库存处理消费组已存在");
        }
    }
}
```

### 消费者监听器 ###

```java
@Component
@Slf4j
public class OrderEventListener implements StreamListener<String, MapRecord<String, String, String>> {
    
    private final OrderService orderService;
    
    @Override
    public void onMessage(MapRecord<String, String, String> message) {
        try {
            String stream = message.getStream();
            String messageId = message.getId().getValue();
            Map<String, String> messageBody = message.getValue();
            
            log.info("收到订单事件: stream={}, messageId={}, body={}", 
                    stream, messageId, messageBody);
            
            // 解析消息内容
            String eventType = messageBody.get("eventType");
            String orderId = messageBody.get("orderId");
            
            // 根据事件类型处理
            switch (eventType) {
                case "ORDER_CREATED":
                    orderService.processOrderCreated(orderId, messageBody);
                    break;
                case "ORDER_PAID":
                    orderService.processOrderPaid(orderId, messageBody);
                    break;
                case "ORDER_CANCELLED":
                    orderService.processOrderCancelled(orderId, messageBody);
                    break;
                default:
                    log.warn("未知的订单事件类型: {}", eventType);
            }
            
            // 确认消息处理完成
            acknowledgeMessage(stream, "order_processor_group", messageId);
            
        } catch (Exception e) {
            log.error("处理订单事件失败: messageId={}", message.getId(), e);
            // 可以选择重新入队或者发送到死信队列
        }
    }
    
    private void acknowledgeMessage(String stream, String group, String messageId) {
        redisTemplate.opsForStream().acknowledge(stream, group, messageId);
        log.debug("消息确认完成: stream={}, group={}, messageId={}", stream, group, messageId);
    }
}
```

### 消息监听容器配置 ###

```java
@Configuration
@EnableConfigurationProperties(RedisStreamProperties.class)
public class StreamMessageListenerConfig {
    
    @Bean
    public StreamMessageListenerContainer<String, MapRecord<String, String, String>> 
    streamMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            OrderEventListener orderEventListener,
            InventoryEventListener inventoryEventListener,
            RedisStreamProperties properties) {
        
        // 配置监听容器选项
        StreamMessageListenerContainer.StreamMessageListenerContainerOptions<String, MapRecord<String, String, String>> options =
            StreamMessageListenerContainer.StreamMessageListenerContainerOptions.builder()
                .pollTimeout(Duration.ofMillis(1000))
                .targetType(MapRecord.class)
                .build();
        
        StreamMessageListenerContainer<String, MapRecord<String, String, String>> container =
            StreamMessageListenerContainer.create(connectionFactory, options);
        
        // 配置订单事件监听
        RedisStreamProperties.StreamConfig orderConfig = properties.getOrderStream();
        container.receive(
            Consumer.from(orderConfig.getConsumerGroup(), "order_handler_1"),
            StreamOffset.create(orderConfig.getName(), ReadOffset.lastConsumed()),
            orderEventListener
        );
        
        // 配置库存事件监听
        RedisStreamProperties.StreamConfig inventoryConfig = properties.getInventoryStream();
        container.receive(
            Consumer.from(inventoryConfig.getConsumerGroup(), "inventory_handler_1"),
            StreamOffset.create(inventoryConfig.getName(), ReadOffset.lastConsumed()),
            inventoryEventListener
        );
        
        container.start();
        return container;
    }
}
```

## 业务场景应用 ##

### 订单处理流程 ###

```java
// 订单创建事件
public class OrderCreatedEvent {
    private String orderId;
    private String userId;
    private BigDecimal amount;
    private List<OrderItem> items;
}

// 订单支付事件
public class OrderPaidEvent {
    private String orderId;
    private String paymentId;
    private BigDecimal amount;
    private String paymentMethod;
}
```

### 库存管理场景 ###

```java
// 库存扣减事件
public class InventoryDeductedEvent {
    private String productId;
    private Integer quantity;
    private String orderId;
    private String warehouseId;
}

// 库存预警事件
public class InventoryWarningEvent {
    private String productId;
    private Integer currentStock;
    private Integer threshold;
}
```

### 用户通知场景 ###

```java
// 短信通知事件
public class SmsNotificationEvent {
    private String phoneNumber;
    private String templateCode;
    private Map<String, String> params;
}

// 邮件通知事件
public class EmailNotificationEvent {
    private String email;
    private String subject;
    private String content;
}
```

## 最佳实践建议 ##

### 性能优化配置 ###

```java
@Configuration
public class RedisStreamOptimizationConfig {
    
    @Bean
    public LettuceClientConfigurationBuilderCustomizer clientConfigCustomizer() {
        return clientConfigurationBuilder -> {
            // 增加连接超时时间
            clientConfigurationBuilder.commandTimeout(Duration.ofSeconds(10));
            // 启用连接池
            clientConfigurationBuilder.usePooling();
        };
    }
    
    // 配置合理的流长度，避免内存溢出
    @EventListener
    public void trimStreams(ApplicationReadyEvent event) {
        redisTemplate.opsForStream().trim("order_events", 100000);
        redisTemplate.opsForStream().trim("inventory_events", 50000);
    }
}
```

### 监控告警 ###

```java
@Component
@RequiredArgsConstructor
public class StreamMonitoringService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final MeterRegistry meterRegistry;
    
    @Scheduled(fixedRate = 30000) // 每30秒检查一次
    public void monitorStreamHealth() {
        // 监控待处理消息数量
        Long pendingCount = getPendingMessageCount("order_events", "order_processor_group");
        meterRegistry.gauge("redis.stream.pending.count", 
            Tags.of("stream", "order_events"), pendingCount);
            
        // 监控消费延迟
        Long consumerLag = getConsumerLag("order_events", "order_processor_group");
        meterRegistry.gauge("redis.stream.consumer.lag", 
            Tags.of("stream", "order_events"), consumerLag);
    }
    
    private Long getPendingMessageCount(String stream, String group) {
        // 实现获取待处理消息数量的逻辑
        PendingMessagesSummary pendingSummary = redisTemplate.opsForStream()
            .pending(stream, group);
        return pendingSummary != null ? pendingSummary.getTotalPendingMessages() : 0L;
    }
}
```

### 异常处理策略 ###

```java
@Component
@Slf4j
public class StreamErrorHandler {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    public void handleProcessingError(String stream, String group, String messageId, Exception error) {
        try {
            // 记录错误日志
            log.error("消息处理失败: stream={}, messageId={}", stream, messageId, error);
            
            // 将消息发送到死信队列
            moveToDeadLetterQueue(stream, messageId, error.getMessage());
            
            // 确认原消息（避免重复消费）
            redisTemplate.opsForStream().acknowledge(stream, group, messageId);
            
        } catch (Exception e) {
            log.error("处理消息错误时发生异常", e);
        }
    }
    
    private void moveToDeadLetterQueue(String stream, String messageId, String errorMessage) {
        Map<String, Object> deadLetterMessage = new HashMap<>();
        deadLetterMessage.put("originalStream", stream);
        deadLetterMessage.put("originalMessageId", messageId);
        deadLetterMessage.put("errorMessage", errorMessage);
        deadLetterMessage.put("timestamp", System.currentTimeMillis());
        
        redisTemplate.opsForStream().add("dead_letter_queue", deadLetterMessage);
    }
}
```

## 预期效果 ##

通过Redis Stream消息队列方案，我们可以实现：

- 低延迟：毫秒级消息处理延迟
- 高吞吐：支持每秒数万条消息处理
- 高可用：Redis主从复制保证数据安全
- 易维护：相比Kafka部署和维护成本大幅降低
- 成本优化：充分利用现有Redis资源，无需额外投入

这套方案特别适合中小型项目或者对消息队列要求不是特别严苛的场景，既满足了业务需求，又控制了技术复杂度和成本。
