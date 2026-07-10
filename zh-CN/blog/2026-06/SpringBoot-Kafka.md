---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot整合Kafka，实现高可用消息队列集群
description: SpringBoot整合Kafka，实现高可用消息队列集群
date: 2026-06-30 10:35:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、Kafka简介

### 什么是Kafka

Apache Kafka是一个分布式流处理平台，具有以下核心特性：

- 高吞吐量：支持每秒百万级消息处理
- 可扩展性：支持水平扩展，可动态添加节点
- 持久化存储：消息可持久化到磁盘，支持数据保留策略
- 高可用性：通过副本机制保证数据不丢失
- 分布式架构：支持多生产者和消费者

### Kafka核心概念

- Broker：Kafka集群中的单个节点
- Topic：消息的分类主题
- Partition：Topic的分区，实现并行处理
- Replica：分区副本，保证高可用
- Producer：消息生产者
- Consumer：消息消费者
- Consumer Group：消费者组

## 二、搭建Kafka高可用集群

### 集群架构规划

建议至少3个节点的Kafka集群 + 3个节点的Zookeeper集群：

```txt
Zookeeper集群：zk1:2181, zk2:2181, zk3:2181
Kafka集群：kafka1:9092, kafka2:9092, kafka3:9092
```

## 三、SpringBoot整合Kafka详细步骤

### 创建SpringBoot项目

使用Spring Initializr创建项目，添加依赖：

```xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.kafka</groupId>
        <artifactId>spring-kafka</artifactId>
    </dependency>

    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

### 配置文件

```yaml
# application.yml
spring:
  kafka:
    # Kafka集群配置（高可用）
    bootstrap-servers: kafka1:9092,kafka2:9092,kafka3:9092

    # 生产者配置
    producer:
      retries: 3 # 发送失败重试次数
      acks: all # 所有副本确认才认为发送成功
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      properties:
        compression.type: snappy # 压缩类型
        linger.ms: 5 # 等待时间，批量发送提高吞吐量

    # 消费者配置
    consumer:
      group-id: ${spring.application.name}-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: 'com.example.kafka.dto'
        max.poll.records: 500 # 一次拉取最大记录数
        session.timeout.ms: 10000 # 会话超时时间
        heartbeat.interval.ms: 3000 # 心跳间隔

    # 监听器配置
    listener:
      concurrency: 3 # 并发消费者数量
      ack-mode: batch # 批量确认
      missing-topics-fatal: false # 主题不存在时不报错

    # 高可用配置
    properties:
      # 分区副本配置
      replication.factor: 3
      min.insync.replicas: 2
      # 生产者的高可用配置
      enable.idempotence: true # 幂等性
      max.in.flight.requests.per.connection: 5

# 自定义配置
kafka:
  topics:
    order-topic: order-topic
    payment-topic: payment-topic
    retry-topic: retry-topic
  retry:
    max-attempts: 3
    backoff-interval: 1000
```

### 配置类

```java:KafkaConfig.java
@Configuration
@EnableKafka
@Slf4j
public class KafkaConfig {

    @Value("${kafka.topics.order-topic}")
    private String orderTopic;

    @Value("${kafka.topics.payment-topic}")
    private String paymentTopic;

    @Value("${kafka.topics.retry-topic}")
    private String retryTopic;

    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG,
                   "kafka1:9092,kafka2:9092,kafka3:9092");
        return new KafkaAdmin(configs);
    }

    @Bean
    public NewTopic orderTopic() {
        // 创建Topic：3个分区，3个副本
        return new NewTopic(orderTopic, 3, (short) 3);
    }

    @Bean
    public NewTopic paymentTopic() {
        return new NewTopic(paymentTopic, 2, (short) 3);
    }

    @Bean
    public NewTopic retryTopic() {
        return new NewTopic(retryTopic, 1, (short) 3);
    }

    // 死信队列配置
    @Bean
    public DeadLetterPublishingRecoverer dlqRecoverer(KafkaTemplate<String, Object> template) {
        return new DeadLetterPublishingRecoverer(template,
            (record, ex) -> {
                log.error("消息处理失败，发送到死信队列: {}", record.value(), ex);
                return new TopicPartition("dlq-topic", record.partition());
            });
    }

    @Bean
    public DefaultErrorHandler errorHandler(DeadLetterPublishingRecoverer dlqRecoverer) {
        // 重试3次后进入死信队列
        DefaultErrorHandler handler = new DefaultErrorHandler(dlqRecoverer,
            new FixedBackOff(1000L, 3));
        handler.addNotRetryableExceptions(IllegalArgumentException.class);
        return handler;
    }

    // 生产者工厂增强配置
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,
                       "kafka1:9092,kafka2:9092,kafka3:9092");
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
                       StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                       JsonSerializer.class);
        configProps.put(ProducerConfig.ACKS_CONFIG, "all");  // 所有副本确认
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3);    // 重试次数
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);  // 幂等性
        configProps.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
        return new DefaultKafkaProducerFactory<>(configProps);
    }
}
```

### 消息实体类

```java:OrderMessage.java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderMessage implements Serializable {
    private String orderId;
    private String userId;
    private BigDecimal amount;
    private String productName;
    private Integer quantity;
    private LocalDateTime createTime;
    private MessageStatus status;

    public enum MessageStatus {
        PENDING, PROCESSING, SUCCESS, FAILED
    }
}

// PaymentMessage.java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMessage {
    private String paymentId;
    private String orderId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private LocalDateTime paymentTime;

    public enum PaymentMethod {
        ALIPAY, WECHAT, CREDIT_CARD
    }

    public enum PaymentStatus {
        INIT, PROCESSING, SUCCESS, FAILED
    }
}
```

### 生产者服务

```java:KafkaProducerService.java
@Service
@Slf4j
public class KafkaProducerService {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topics.order-topic}")
    private String orderTopic;

    @Value("${kafka.topics.payment-topic}")
    private String paymentTopic;

    /**
     * 发送订单消息（同步）
     */
    public SendResult<String, Object> sendOrderSync(OrderMessage orderMessage) {
        try {
            // 设置消息头
            MessageHeaders headers = new MessageHeaders(Map.of(
                "message-id", UUID.randomUUID().toString(),
                "message-time", String.valueOf(System.currentTimeMillis())
            ));

            Message<OrderMessage> message = MessageBuilder
                .withPayload(orderMessage)
                .copyHeaders(headers)
                .build();

            // 同步发送，等待确认
            ListenableFuture<SendResult<String, Object>> future =
                kafkaTemplate.send(orderTopic, orderMessage.getOrderId(), message);

            // 等待发送结果
            SendResult<String, Object> result = future.get(5, TimeUnit.SECONDS);
            log.info("订单消息发送成功: topic={}, partition={}, offset={}",
                    result.getRecordMetadata().topic(),
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
            return result;

        } catch (Exception e) {
            log.error("订单消息发送失败: {}", orderMessage, e);
            throw new RuntimeException("消息发送失败", e);
        }
    }

    /**
     * 发送订单消息（异步）
     */
    public void sendOrderAsync(OrderMessage orderMessage) {
        kafkaTemplate.send(orderTopic, orderMessage.getOrderId(), orderMessage)
            .addCallback(new ListenableFutureCallback<SendResult<String, Object>>() {
                @Override
                public void onSuccess(SendResult<String, Object> result) {
                    log.info("异步发送成功: topic={}, offset={}",
                            result.getRecordMetadata().topic(),
                            result.getRecordMetadata().offset());
                }

                @Override
                public void onFailure(Throwable ex) {
                    log.error("异步发送失败: {}", orderMessage, ex);
                    // 可以添加重试逻辑或写入本地文件
                }
            });
    }

    /**
     * 批量发送消息
     */
    public void batchSendOrders(List<OrderMessage> orderMessages) {
        orderMessages.forEach(message -> {
            kafkaTemplate.send(orderTopic, message.getOrderId(), message);
        });
        kafkaTemplate.flush(); // 确保所有消息都发送
    }

    /**
     * 发送到指定分区
     */
    public void sendToPartition(OrderMessage orderMessage, int partition) {
        kafkaTemplate.send(orderTopic, partition,
                          orderMessage.getOrderId(), orderMessage);
    }

    /**
     * 事务消息发送
     */
    @Transactional(transactionManager = "kafkaTransactionManager")
    public void sendTransactionalMessage(OrderMessage orderMessage) {
        // 数据库操作
        // orderRepository.save(order);

        // Kafka消息发送（与数据库操作在同一个事务中）
        kafkaTemplate.send(orderTopic, orderMessage.getOrderId(), orderMessage);

        // 其他业务操作
    }
}
```

### 消费者服务

```java:KafkaConsumerService.java
@Service
@Slf4j
public class KafkaConsumerService {

    private static final String ORDER_CONTAINER_FACTORY = "orderContainerFactory";
    private static final String PAYMENT_CONTAINER_FACTORY = "paymentContainerFactory";

    /**
     * 订单消息消费者 - 批量消费
     */
    @KafkaListener(
        topics = "${kafka.topics.order-topic}",
        containerFactory = ORDER_CONTAINER_FACTORY,
        groupId = "order-consumer-group"
    )
    public void consumeOrderMessages(List<OrderMessage> messages) {
        log.info("收到批量订单消息，数量: {}", messages.size());

        for (OrderMessage message : messages) {
            try {
                processOrderMessage(message);
            } catch (Exception e) {
                log.error("订单处理失败: {}", message.getOrderId(), e);
                // 记录失败消息，可以发送到重试队列
            }
        }
    }

    /**
     * 单个订单消息消费
     */
    @KafkaListener(
        topics = "${kafka.topics.order-topic}",
        groupId = "order-single-consumer-group"
    )
    public void consumeSingleOrderMessage(
            @Payload OrderMessage message,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.info("收到单个订单消息: topic={}, partition={}, offset={}, orderId={}",
                topic, partition, offset, message.getOrderId());

        try {
            // 业务处理逻辑
            processOrderMessage(message);

            // 处理成功后，可以发送确认消息到下游
            sendPaymentMessage(message);

        } catch (Exception e) {
            log.error("订单处理失败: {}", message.getOrderId(), e);
            throw e; // 抛出异常会触发重试机制
        }
    }

    /**
     * 支付消息消费者
     */
    @KafkaListener(
        topics = "${kafka.topics.payment-topic}",
        containerFactory = PAYMENT_CONTAINER_FACTORY,
        groupId = "payment-consumer-group"
    )
    public void consumePaymentMessage(PaymentMessage message) {
        log.info("收到支付消息: {}", message.getPaymentId());

        // 支付处理逻辑
        try {
            processPayment(message);
        } catch (Exception e) {
            log.error("支付处理失败: {}", message.getPaymentId(), e);
        }
    }

    private void processOrderMessage(OrderMessage message) {
        // 模拟业务处理
        log.info("处理订单: {}，金额: {}", message.getOrderId(), message.getAmount());

        // 业务逻辑，如：
        // 1. 验证订单
        // 2. 扣减库存
        // 3. 记录日志
        // 4. 更新订单状态

        // 模拟处理时间
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void sendPaymentMessage(OrderMessage orderMessage) {
        PaymentMessage paymentMessage = PaymentMessage.builder()
            .paymentId(UUID.randomUUID().toString())
            .orderId(orderMessage.getOrderId())
            .amount(orderMessage.getAmount())
            .paymentMethod(PaymentMessage.PaymentMethod.ALIPAY)
            .status(PaymentMessage.PaymentStatus.INIT)
            .paymentTime(LocalDateTime.now())
            .build();

        // 这里可以使用KafkaTemplate发送支付消息
    }

    private void processPayment(PaymentMessage message) {
        // 支付处理逻辑
        log.info("处理支付: {}，订单: {}", message.getPaymentId(), message.getOrderId());
    }
}
```

### 消费者容器工厂配置

```java:ConsumerConfig.java
@Configuration
public class ConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    // 订单消费者容器工厂（批量消费）
    @Bean(ORDER_CONTAINER_FACTORY)
    public ConcurrentKafkaListenerContainerFactory<String, OrderMessage>
            orderContainerFactory() {

        ConcurrentKafkaListenerContainerFactory<String, OrderMessage> factory =
            new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(orderConsumerFactory());
        factory.setConcurrency(3); // 并发消费者数量
        factory.getContainerProperties().setPollTimeout(3000);
        factory.setBatchListener(true); // 启用批量消费
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.BATCH);

        // 设置批量消费参数
        factory.getContainerProperties().setIdleBetweenPolls(1000);

        return factory;
    }

    @Bean
    public ConsumerFactory<String, OrderMessage> orderConsumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "order-consumer-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "com.example.kafka.dto");
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500); // 批量拉取数量
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        // 高可用配置
        props.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 10000);
        props.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 3000);

        return new DefaultKafkaConsumerFactory<>(props);
    }
}
```

### 监控和管理端点

```java:KafkaMonitorController.java
@RestController
@RequestMapping("/api/kafka")
@Slf4j
public class KafkaMonitorController {

    @Autowired
    private KafkaAdmin kafkaAdmin;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * 获取Topic列表
     */
    @GetMapping("/topics")
    public ResponseEntity<List<String>> getTopics() throws Exception {
        try (AdminClient adminClient = AdminClient.create(kafkaAdmin.getConfigurationProperties())) {
            ListTopicsResult topicsResult = adminClient.listTopics();
            Set<String> topicNames = topicsResult.names().get();
            return ResponseEntity.ok(new ArrayList<>(topicNames));
        }
    }

    /**
     * 获取Topic详情
     */
    @GetMapping("/topics/{topic}/details")
    public ResponseEntity<Map<Integer, List<Integer>>> getTopicDetails(
            @PathVariable String topic) throws Exception {

        try (AdminClient adminClient = AdminClient.create(kafkaAdmin.getConfigurationProperties())) {
            DescribeTopicsResult describeResult = adminClient.describeTopics(Collections.singleton(topic));
            TopicDescription topicDescription = describeResult.values().get(topic).get();

            Map<Integer, List<Integer>> partitionInfo = new HashMap<>();
            for (TopicPartitionInfo partition : topicDescription.partitions()) {
                List<Integer> replicas = partition.replicas().stream()
                    .map(Node::id)
                    .collect(Collectors.toList());
                partitionInfo.put(partition.partition(), replicas);
            }

            return ResponseEntity.ok(partitionInfo);
        }
    }

    /**
     * 发送测试消息
     */
    @PostMapping("/send-test")
    public ResponseEntity<String> sendTestMessage(@RequestParam String topic) {
        OrderMessage testMessage = OrderMessage.builder()
            .orderId("TEST-" + System.currentTimeMillis())
            .userId("test-user")
            .amount(new BigDecimal("100.00"))
            .productName("测试商品")
            .quantity(1)
            .createTime(LocalDateTime.now())
            .status(OrderMessage.MessageStatus.PENDING)
            .build();

        kafkaTemplate.send(topic, testMessage.getOrderId(), testMessage);
        return ResponseEntity.ok("测试消息发送成功");
    }

    /**
     * 获取消费者组信息
     */
    @GetMapping("/consumer-groups")
    public ResponseEntity<Map<String, Object>> getConsumerGroups() throws Exception {
        try (AdminClient adminClient = AdminClient.create(kafkaAdmin.getConfigurationProperties())) {
            ListConsumerGroupsResult groupsResult = adminClient.listConsumerGroups();
            Collection<ConsumerGroupListing> groups = groupsResult.all().get();

            Map<String, Object> result = new HashMap<>();
            result.put("consumerGroups", groups);
            result.put("count", groups.size());

            return ResponseEntity.ok(result);
        }
    }
}
```

### 异常处理和重试机制

```java:KafkaExceptionHandler.java
@Component
@Slf4j
public class KafkaExceptionHandler {

    /**
     * 全局Kafka监听器异常处理
     */
    @EventListener
    public void handleException(ListenerContainerConsumerFailedEvent event) {
        log.error("Kafka消费者异常: {}", event.getContainer().getListenerId(), event.getException());

        // 记录异常信息
        // 发送告警
        // 写入错误日志
    }

    /**
     * 自定义重试策略
     */
    @Bean
    public RetryTemplate kafkaRetryTemplate() {
        RetryTemplate retryTemplate = new RetryTemplate();

        // 重试策略：最多重试3次，每次间隔1秒
        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy();
        retryPolicy.setMaxAttempts(3);

        // 退避策略
        FixedBackOffPolicy backOffPolicy = new FixedBackOffPolicy();
        backOffPolicy.setBackOffPeriod(1000L);

        retryTemplate.setRetryPolicy(retryPolicy);
        retryTemplate.setBackOffPolicy(backOffPolicy);

        return retryTemplate;
    }
}
```

### 健康检查

```java:KafkaHealthIndicator.java
@Component
public class KafkaHealthIndicator implements HealthIndicator {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    public Health health() {
        try {
            // 尝试发送一个测试消息来检查Kafka连接
            kafkaTemplate.send("health-check-topic", "health-check", "ping")
                .get(5, TimeUnit.SECONDS);

            return Health.up()
                .withDetail("status", "Kafka集群连接正常")
                .withDetail("timestamp", LocalDateTime.now())
                .build();

        } catch (Exception e) {
            return Health.down()
                .withDetail("status", "Kafka集群连接异常")
                .withDetail("error", e.getMessage())
                .withDetail("timestamp", LocalDateTime.now())
                .build();
        }
    }
}
```

## 四、高可用性保障措施

### 集群配置建议

```ini
# kafka-server.properties 关键配置
broker.id=1
listeners=PLAINTEXT://:9092
advertised.listeners=PLAINTEXT://kafka1:9092
num.network.threads=3
num.io.threads=8
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600

# 日志配置
log.dirs=/data/kafka-logs
num.partitions=3
num.recovery.threads.per.data.dir=1

# 副本和ISR配置
offsets.topic.replication.factor=3
transaction.state.log.replication.factor=3
transaction.state.log.min.isr=2
default.replication.factor=3
min.insync.replicas=2

# 日志保留
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000

# Zookeeper配置
zookeeper.connect=zk1:2181,zk2:2181,zk3:2181
zookeeper.connection.timeout.ms=6000
```

### 生产环境部署建议

_硬件配置_：

- 至少3个Kafka节点 + 3个Zookeeper节点
- SSD磁盘提高IO性能
- 充足的内存和CPU资源

_网络配置_：

- 使用专用网络
- 配置合理的防火墙规则

_监控告警_：

- 使用Kafka Manager或Confluent Control Center
- 监控指标：吞吐量、延迟、副本同步状态

## 五、测试示例

```java:KafkaIntegrationTest.java
@SpringBootTest
@Slf4j
class KafkaIntegrationTest {

    @Autowired
    private KafkaProducerService producerService;

    @Test
    void testSendAndReceiveMessage() throws InterruptedException {
        // 创建测试消息
        OrderMessage orderMessage = OrderMessage.builder()
            .orderId("TEST-" + UUID.randomUUID())
            .userId("user-001")
            .amount(new BigDecimal("199.99"))
            .productName("测试商品")
            .quantity(2)
            .createTime(LocalDateTime.now())
            .status(OrderMessage.MessageStatus.PENDING)
            .build();

        // 发送消息
        SendResult<String, Object> result = producerService.sendOrderSync(orderMessage);

        assertNotNull(result);
        assertNotNull(result.getRecordMetadata());

        log.info("消息发送成功，分区: {}, offset: {}",
                result.getRecordMetadata().partition(),
                result.getRecordMetadata().offset());

        // 等待消费者处理
        Thread.sleep(2000);
    }

    @Test
    void testBatchSend() {
        List<OrderMessage> messages = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            OrderMessage message = OrderMessage.builder()
                .orderId("BATCH-" + i)
                .userId("user-" + i)
                .amount(new BigDecimal(i * 10))
                .productName("商品" + i)
                .quantity(1)
                .createTime(LocalDateTime.now())
                .status(OrderMessage.MessageStatus.PENDING)
                .build();
            messages.add(message);
        }

        producerService.batchSendOrders(messages);
    }
}
```

## 六、总结

### 实现的高可用特性

- 数据冗余：通过副本机制（Replication Factor=3）保证数据安全
- 故障转移：Leader选举机制确保节点故障时自动切换
- 负载均衡：分区机制实现水平扩展和负载均衡
- 容错处理：死信队列和重试机制保障消息不丢失
- 监控告警：完善的健康检查和监控体系

### 最佳实践建议

- 合理规划分区：根据业务吞吐量和消费者数量设置分区数
- 监控副本同步：确保ISR（In-Sync Replicas）数量足够
- 配置重试机制：针对网络波动和临时故障进行重试
- 实施消息幂等：避免重复消费问题
- 定期清理数据：设置合理的消息保留策略

### 性能优化建议

- 批量操作：使用批量发送和批量消费提高吞吐量
- 压缩传输：启用消息压缩减少网络带宽消耗
- 合理批大小：根据业务场景调整批量大小
- 异步确认：非关键业务使用异步发送提高响应速度

通过以上方案，SpringBoot整合Kafka实现了高可用的消息队列集群，具备生产级的可靠性、可扩展性和容错能力，能够满足企业级应用的需求。
