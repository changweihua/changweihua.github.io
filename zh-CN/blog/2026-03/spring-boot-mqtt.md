---
lastUpdated: true
commentabled: true
recommended: true
title: Springboot对接mqtt
description: Springboot对接mqtt
date: 2026-03-19 15:15:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在Spring Boot中对接MQTT协议，可以使用Eclipse Paho客户端和Spring Integration MQTT模块。

以下是详细实现步骤：

## 添加依赖 ##

```xml
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
    
    <!-- Spring Integration MQTT -->
    <dependency>
        <groupId>org.springframework.integration</groupId>
        <artifactId>spring-integration-mqtt</artifactId>
    </dependency>
    
    <!-- Eclipse Paho MQTT Client -->
    <dependency>
        <groupId>org.eclipse.paho</groupId>
        <artifactId>org.eclipse.paho.client.mqttv3</artifactId>
        <version>1.2.5</version>
    </dependency>
</dependencies>
```

## 配置MQTT连接参数 ##

```yaml
# application.yml
mqtt:
  broker-url: tcp://localhost:1883
  username: admin
  password: password
  client-id: spring-boot-client
  default-topic: test/topic
  timeout: 30
  keepalive: 60
  completion-timeout: 30000
```

## MQTT配置类 ##

```java
@Configuration
@EnableConfigurationProperties(MqttProperties.class)
public class MqttConfig {

    @Autowired
    private MqttProperties mqttProperties;

    // MQTT连接配置
    @Bean
    public MqttConnectOptions mqttConnectOptions() {
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[]{mqttProperties.getBrokerUrl()});
        options.setUserName(mqttProperties.getUsername());
        options.setPassword(mqttProperties.getPassword().toCharArray());
        options.setConnectionTimeout(mqttProperties.getTimeout());
        options.setKeepAliveInterval(mqttProperties.getKeepalive());
        options.setAutomaticReconnect(true);
        options.setCleanSession(true);
        return options;
    }

    // MQTT客户端工厂
    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        factory.setConnectionOptions(mqttConnectOptions());
        return factory;
    }

    // 出站消息通道（用于发送消息）
    @Bean
    @ServiceActivator(inputChannel = "mqttOutboundChannel")
    public MessageHandler mqttOutbound() {
        MqttPahoMessageHandler messageHandler = 
            new MqttPahoMessageHandler(mqttProperties.getClientId() + "-producer", mqttClientFactory());
        messageHandler.setAsync(true);
        messageHandler.setDefaultTopic(mqttProperties.getDefaultTopic());
        return messageHandler;
    }

    // 出站通道
    @Bean
    public MessageChannel mqttOutboundChannel() {
        return new DirectChannel();
    }

    // 入站消息适配器（用于接收消息）
    @Bean
    public MessageProducer inbound() {
        MqttPahoMessageDrivenChannelAdapter adapter = 
            new MqttPahoMessageDrivenChannelAdapter(mqttProperties.getClientId() + "-consumer", 
                                                   mqttClientFactory(), mqttProperties.getDefaultTopic());
        adapter.setCompletionTimeout(mqttProperties.getCompletionTimeout());
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1);
        adapter.setOutputChannel(mqttInboundChannel());
        return adapter;
    }

    // 入站通道
    @Bean
    public MessageChannel mqttInboundChannel() {
        return new DirectChannel();
    }

    // 入站消息处理器
    @Bean
    @ServiceActivator(inputChannel = "mqttInboundChannel")
    public MessageHandler handler() {
        return new MessageHandler() {
            @Override
            public void handleMessage(Message<?> message) throws MessagingException {
                String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
                String payload = (String) message.getPayload();
                System.out.println("Received message from topic: " + topic + ", payload: " + payload);
                // 处理接收到的消息
                processMessage(topic, payload);
            }
        };
    }
}
```

## 配置属性类 ##

```java
@ConfigurationProperties(prefix = "mqtt")
@Component
@Data
public class MqttProperties {
    private String brokerUrl;
    private String username;
    private String password;
    private String clientId;
    private String defaultTopic;
    private int timeout;
    private int keepalive;
    private int completionTimeout;
}
```

## MQTT服务类 ##

```java
@Service
public class MqttService {

    @Autowired
    private MessageChannel mqttOutboundChannel;

    // 发送消息到指定主题
    public void sendMessage(String topic, String message) {
        mqttOutboundChannel.send(MessageBuilder.withPayload(message)
                .setHeader("mqtt_topic", topic)
                .build());
    }

    // 发送消息到默认主题
    public void sendMessage(String message) {
        mqttOutboundChannel.send(MessageBuilder.withPayload(message).build());
    }

    // 发送带QoS的消息
    public void sendMessage(String topic, String message, int qos) {
        mqttOutboundChannel.send(MessageBuilder.withPayload(message)
                .setHeader("mqtt_topic", topic)
                .setHeader("mqtt_qos", qos)
                .build());
    }
}
```

## 消息处理器 ##

```java
@Component
public class MqttMessageProcessor {

    private static final Logger logger = LoggerFactory.getLogger(MqttMessageProcessor.class);

    public void processMessage(String topic, String payload) {
        logger.info("Processing MQTT message - Topic: {}, Payload: {}", topic, payload);
        
        // 根据不同的主题进行不同的处理
        switch (topic) {
            case "test/topic":
                handleTestTopic(payload);
                break;
            case "sensor/data":
                handleSensorData(payload);
                break;
            default:
                handleDefaultMessage(topic, payload);
        }
    }

    private void handleTestTopic(String payload) {
        logger.info("处理测试主题消息: {}", payload);
        // 具体的业务逻辑
    }

    private void handleSensorData(String payload) {
        logger.info("处理传感器数据: {}", payload);
        try {
            // 解析JSON数据等操作
            // ObjectMapper mapper = new ObjectMapper();
            // SensorData data = mapper.readValue(payload, SensorData.class);
        } catch (Exception e) {
            logger.error("解析传感器数据失败", e);
        }
    }

    private void handleDefaultMessage(String topic, String payload) {
        logger.info("处理默认消息 - Topic: {}, Payload: {}", topic, payload);
    }
}
```

## 控制器示例 ##

```java
@RestController
@RequestMapping("/mqtt")
public class MqttController {

    @Autowired
    private MqttService mqttService;

    @PostMapping("/publish")
    public ResponseEntity<String> publishMessage(@RequestParam String topic, 
                                               @RequestParam String message) {
        try {
            mqttService.sendMessage(topic, message);
            return ResponseEntity.ok("Message published successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to publish message: " + e.getMessage());
        }
    }

    @PostMapping("/publish/default")
    public ResponseEntity<String> publishToDefaultTopic(@RequestParam String message) {
        try {
            mqttService.sendMessage(message);
            return ResponseEntity.ok("Message published to default topic");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to publish message: " + e.getMessage());
        }
    }
}
```

## 主应用类 ##

```java
@SpringBootApplication
@EnableConfigurationProperties
public class MqttApplication {
    public static void main(String[] args) {
        SpringApplication.run(MqttApplication.class, args);
    }
}
```

## 测试MQTT服务 ##

可以使用MQTT.fx或其他MQTT客户端工具进行测试：

- 启动Spring Boot应用
- 使用MQTT客户端订阅主题 test/topic
- 调用API发送消息：

```bash
curl -X POST "http://localhost:8080/mqtt/publish?topic=test/topic&message=Hello MQTT"
```

## 主要特性 ##

- 自动重连: 配置了自动重连机制
- QoS支持: 支持不同的服务质量等级
- 多主题订阅: 可以订阅多个主题
- 异步处理: 消息发送支持异步模式
- 配置灵活: 通过配置文件管理连接参数

这样你就实现了一个完整的Spring Boot MQTT集成方案，可以方便地进行消息的发布和订阅。
