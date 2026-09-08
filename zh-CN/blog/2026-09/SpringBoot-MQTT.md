---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot + MQTT
description: 如何实现取货就走的智能售货柜系统
date: 2026-09-08 12:55:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---


昨天在办公楼底下，我用了一下那种开门拿货，关门自动扣费的智能售货柜，真挺方便的。

其实这种售货柜并不少见，很多无人售货店、地铁站和景区都能经常看懂。

那这种流程是怎么实现的呢？下面我们来分析一下整个实现的流程。

*场景*：

1. 你用微信扫描售货柜上的二维码
2. 柜门咔嚓一声自动打开
3. 你拿出想要的商品，同时可以随意更换
4. 关上柜门，然后手机自动收到扣款通知
5. 整个过程中无需任何额外操作

## 核心技术栈（Spingboot） ##

| 技术组件 | 作用 |
| :--- | :--- |
| Spring Boot | 后端主框架 |
| Redis | 高速缓存 |
| MQTT | 物联网通信协议 |
| MySQL | 关系型数据库 |
| 消息队列 | 异步任务处理 |
| 计算机视觉 | 拍摄商品识别 |

## 完整技术流程详解 ##

### 第一阶段：扫码开门（身份验证与初始化） ###

*用户动作*：微信扫码 → 授权 → 柜门打开

*后台流程*：

1. 身份认证：验证微信账号的合法性
2. 设备状态检查：确认售货柜是否可用
3. 创建会话：在Redis中建立临时购物车
4. 数据采集：拍摄货架初始照片，记录传感器数据
5. 开门指令：通过MQTT协议发送开门命令

*技术要点*：

- 使用Redis存储临时会话，读写速度达到微秒级
- MQTT协议专为物联网设计，低功耗、高可靠
- 初始快照为后续对比提供基准数据

### 第二阶段：自由选购（实时事件追踪） ###

*用户动作*：拿取商品 → 可能更换 → 继续选购

*系统监控*：

1. 视觉追踪：摄像头实时识别手部动作和商品变化
2. 重量感应：每个货道的传感器监测重量变化
3. 事件上报：实时将"拿取/放回"动作发送到后台
4. 实时记录：在Redis中更新购物车状态

*技术难点突破*：

- 实时视频流处理，延迟控制在100ms以内
- 多传感器数据融合，提高识别准确率
- 高并发事件处理，支持多用户同时购物

## 第三阶段：关门结算（异步清算流程） ##

*用户动作*：关闭柜门 → 自动触发结算

*核心清算流程*：

```txt
关门信号 → 启动异步任务 → 数据收集 → 三重校验 → 支付扣款 → 状态更新
```

*详细步骤*：

1. 触发结算：门磁传感器检测到关门动作
2. 异步处理：避免用户等待，另起线程处理复杂计算
3. 数据收集：获取关门快照和最终传感器数据
4. 三重校验：
   - 视觉对比：开门vs关门图片差异分析
   - 重量分析：各货道重量变化计算
   - 事件复核：核对实时记录的事件序列
5. 冲突解决：当三种方式结果不一致时的智能决策
6. 支付执行：调用支付接口完成扣款
7. 状态更新：标记订单完成，清理缓存

## 示例代码实现 ##

### 核心数据模型 ###

```java
// 订单实体
@Entity
@Table(name = "vending_orders")
@Data
public class VendingOrder {
    @Id
    private String orderId;
    private String userId;          // 用户ID
    private String deviceId;        // 设备ID
    private String status;          // 状态: OPEN/CLOSED/PAID/FAILED
    private BigDecimal amount;      // 订单金额
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}

// Redis缓存中的设备会话
@Data
public class DeviceSession {
    private String sessionId;
    private String deviceId;
    private String orderId;
    private String userId;
    private String status;          // 会话状态
    private LocalDateTime startTime;
    private List<DeviceEvent> events; // 购物事件记录
}

// 设备事件
@Data
public class DeviceEvent {
    private String eventId;
    private String deviceId;
    private String orderId;
    private String type;            // PICK/PUT_BACK
    private String productId;
    private LocalDateTime eventTime;
    private String position;        // 货道位置
}
```

### 控制器层 - 处理HTTP请求 ###

```java
@RestController
@RequestMapping("/api/vending")
@Slf4j
public class VendingController {

    @Autowired
    private VendingService vendingService;

    @Autowired
    private SettlementService settlementService;

    /**
     * 扫码开门接口
     */
    @PostMapping("/open")
    public ResponseEntity<ApiResponse> openDevice(
            @RequestParam String deviceId,
            @RequestParam String authToken) {

        log.info("收到开门请求: deviceId={}", deviceId);

        try {
            OpenResult result = vendingService.processOpenDevice(deviceId, authToken);
            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (BusinessException e) {
            log.warn("开门业务异常: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 查询订单状态
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse> getOrderStatus(@PathVariable String orderId) {
        VendingOrder order = vendingService.getOrderById(orderId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
}

// 统一API响应格式
@Data
class ApiResponse {
    private boolean success;
    private String message;
    private Object data;

    public static ApiResponse success(Object data) {
        ApiResponse response = new ApiResponse();
        response.setSuccess(true);
        response.setData(data);
        return response;
    }

    public static ApiResponse error(String message) {
        ApiResponse response = new ApiResponse();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }
}
```

### 核心服务层 - 开门处理 ###

```java
@Service
@Slf4j
public class VendingService {

    @Autowired
    private UserAuthService authService;

    @Autowired
    private DeviceService deviceService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private MqttService mqttService;

    /**
     * 处理开门请求的核心逻辑
     */
    public OpenResult processOpenDevice(String deviceId, String authToken) {
        // 1. 用户身份验证
        String userId = authService.verifyWechatToken(authToken);
        if (userId == null) {
            throw new BusinessException("用户身份验证失败");
        }

        // 2. 检查设备状态
        DeviceStatus deviceStatus = deviceService.getDeviceStatus(deviceId);
        if (!deviceStatus.isAvailable()) {
            throw new BusinessException("设备暂不可用: " + deviceStatus.getStatus());
        }

        // 3. 创建订单
        VendingOrder order = orderService.createOrder(userId, deviceId);
        log.info("创建订单成功: orderId={}, userId={}, deviceId={}",
                order.getOrderId(), userId, deviceId);

        // 4. 创建设备会话并缓存
        DeviceSession session = createDeviceSession(deviceId, order);
        cacheDeviceSession(session);

        // 5. 锁定设备，避免重复开门
        deviceService.lockDevice(deviceId, order.getOrderId());

        // 6. 发送开门指令
        mqttService.sendOpenCommand(deviceId);

        // 7. 请求设备上报初始状态
        mqttService.requestInitialSnapshot(deviceId);

        return new OpenResult(order.getOrderId(), deviceId, "开门指令已发送");
    }

    private DeviceSession createDeviceSession(String deviceId, VendingOrder order) {
        DeviceSession session = new DeviceSession();
        session.setSessionId(UUID.randomUUID().toString());
        session.setDeviceId(deviceId);
        session.setOrderId(order.getOrderId());
        session.setUserId(order.getUserId());
        session.setStatus("OPEN");
        session.setStartTime(LocalDateTime.now());
        session.setEvents(new ArrayList<>());
        return session;
    }

    private void cacheDeviceSession(DeviceSession session) {
        String key = buildSessionKey(session.getDeviceId());
        redisTemplate.opsForValue().set(key, session, Duration.ofMinutes(10));
        log.debug("设备会话已缓存: key={}", key);
    }

    private String buildSessionKey(String deviceId) {
        return "vending:session:" + deviceId;
    }
}
```

### MQTT消息处理 - 设备通信 ###

```java
@Component
@Slf4j
public class MqttMessageHandler {

    @Autowired
    private VendingService vendingService;

    @Autowired
    private SettlementService settlementService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 处理关门事件 - 触发结算流程
     */
    @MqttListener(topics = "device/${spring.application.env}/+/event/door_close")
    public void handleDoorClose(String message) {
        try {
            DoorCloseEvent event = JSON.parseObject(message, DoorCloseEvent.class);
            log.info("收到关门事件: deviceId={}", event.getDeviceId());

            // 异步处理结算，不阻塞MQTT线程
            CompletableFuture.runAsync(() -> {
                settlementService.startSettlementProcess(event.getDeviceId());
            });

        } catch (Exception e) {
            log.error("处理关门事件失败: message={}", message, e);
        }
    }

    /**
     * 处理商品拿取/放回事件
     */
    @MqttListener(topics = "device/${spring.application.env}/+/event/product")
    public void handleProductEvent(String message) {
        try {
            ProductEvent event = JSON.parseObject(message, ProductEvent.class);
            log.debug("处理商品事件: deviceId={}, type={}, product={}",
                     event.getDeviceId(), event.getEventType(), event.getProductId());

            // 记录到Redis缓存
            recordProductEvent(event);

        } catch (Exception e) {
            log.error("处理商品事件失败: message={}", message, e);
        }
    }

    /**
     * 处理设备上报的初始/最终快照
     */
    @MqttListener(topics = "device/${spring.application.env}/+/snapshot")
    public void handleSnapshot(String message) {
        try {
            DeviceSnapshot snapshot = JSON.parseObject(message, DeviceSnapshot.class);
            log.info("处理设备快照: deviceId={}, type={}",
                    snapshot.getDeviceId(), snapshot.getSnapshotType());

            // 存储快照数据，用于后续对比分析
            storeDeviceSnapshot(snapshot);

        } catch (Exception e) {
            log.error("处理快照失败: message={}", message, e);
        }
    }

    private void recordProductEvent(ProductEvent event) {
        String sessionKey = "vending:session:" + event.getDeviceId();
        DeviceSession session = (DeviceSession) redisTemplate.opsForValue().get(sessionKey);

        if (session != null) {
            DeviceEvent deviceEvent = convertToDeviceEvent(event, session.getOrderId());
            session.getEvents().add(deviceEvent);
            redisTemplate.opsForValue().set(sessionKey, session, Duration.ofMinutes(10));
        }
    }
}
```

### 结算服务 - 核心业务逻辑 ###

```java
@Service
@Slf4j
public class SettlementService {

    @Autowired
    private OrderService orderService;

    @Autowired
    private DeviceService deviceService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private NotificationService notificationService;

    /**
     * 启动结算流程
     */
    @Async("settlementExecutor")
    public void startSettlementProcess(String deviceId) {
        log.info("开始结算流程: deviceId={}", deviceId);

        try {
            // 1. 获取设备会话
            DeviceSession session = getDeviceSession(deviceId);
            if (session == null) {
                log.error("设备会话不存在: deviceId={}", deviceId);
                return;
            }

            // 2. 更新订单状态为结算中
            orderService.updateOrderStatus(session.getOrderId(), "SETTLING");

            // 3. 获取设备上报的最终数据
            SettlementData settlementData = collectSettlementData(deviceId);

            // 4. 执行结算计算
            SettlementResult result = calculateSettlement(settlementData);

            // 5. 处理支付
            boolean paymentSuccess = processPayment(session, result);

            // 6. 更新订单状态
            updateOrderAfterSettlement(session, result, paymentSuccess);

            // 7. 清理资源
            cleanupAfterSettlement(deviceId, session.getOrderId());

            log.info("结算流程完成: deviceId={}, orderId={}, success={}",
                    deviceId, session.getOrderId(), paymentSuccess);

        } catch (Exception e) {
            log.error("结算流程异常: deviceId={}", deviceId, e);
            handleSettlementFailure(deviceId, e);
        }
    }

    /**
     * 收集结算所需的所有数据
     */
    private SettlementData collectSettlementData(String deviceId) {
        SettlementData data = new SettlementData();

        // 获取初始和最终快照
        data.setInitialSnapshot(deviceService.getInitialSnapshot(deviceId));
        data.setFinalSnapshot(deviceService.getFinalSnapshot(deviceId));

        // 获取重量传感器数据
        data.setWeightData(deviceService.getWeightSensorData(deviceId));

        // 获取购物事件记录
        data.setProductEvents(getRecordedEvents(deviceId));

        return data;
    }

    /**
     * 核心结算算法 - 三重校验
     */
    private SettlementResult calculateSettlement(SettlementData data) {
        // 1. 视觉对比分析
        List<Product> visualProducts = analyzeVisualChanges(
            data.getInitialSnapshot(),
            data.getFinalSnapshot()
        );

        // 2. 重量变化分析
        List<Product> weightProducts = analyzeWeightChanges(data.getWeightData());

        // 3. 事件记录分析
        List<Product> eventProducts = analyzeEventSequence(data.getProductEvents());

        // 4. 冲突解决和结果融合
        return resolveProductConflicts(visualProducts, weightProducts, eventProducts);
    }

    /**
     * 冲突解决策略
     */
    private SettlementResult resolveProductConflicts(List<Product> visualProducts,
                                                    List<Product> weightProducts,
                                                    List<Product> eventProducts) {
        SettlementResult result = new SettlementResult();

        // 策略1: 视觉识别优先（最直接证据）
        Map<String, Product> productMap = new HashMap<>();

        // 首先信任视觉识别结果
        for (Product product : visualProducts) {
            productMap.put(product.getPosition(), product);
        }

        // 用重量数据验证和补充
        for (Product weightProduct : weightProducts) {
            Product visualProduct = productMap.get(weightProduct.getPosition());
            if (visualProduct == null) {
                // 视觉没识别到但重量有变化，信任重量数据
                productMap.put(weightProduct.getPosition(), weightProduct);
            }
        }

        // 用事件记录进行最终校验
        result.setFinalProducts(new ArrayList<>(productMap.values()));
        result.setConflictResolved(true);

        log.debug("冲突解决完成: 视觉识别{}个, 重量变化{}个, 最终确认{}个",
                 visualProducts.size(), weightProducts.size(), result.getFinalProducts().size());

        return result;
    }
}
```

### 支付服务 ###

```java
@Service
@Slf4j
public class PaymentService {

    @Autowired
    private WechatPayService wechatPayService;

    @Autowired
    private OrderService orderService;

    /**
     * 执行支付
     */
    public boolean processPayment(DeviceSession session, SettlementResult result) {
        try {
            PaymentRequest request = new PaymentRequest();
            request.setUserId(session.getUserId());
            request.setOrderId(session.getOrderId());
            request.setAmount(calculateTotalAmount(result.getFinalProducts()));
            request.setDescription("智能售货柜购物");

            PaymentResponse response = wechatPayService.unifiedOrder(request);

            if ("SUCCESS".equals(response.getResultCode())) {
                log.info("支付成功: orderId={}, amount={}",
                        session.getOrderId(), request.getAmount());
                return true;
            } else {
                log.warn("支付失败: orderId={}, error={}",
                        session.getOrderId(), response.getErrMsg());
                return false;
            }

        } catch (Exception e) {
            log.error("支付处理异常: orderId={}", session.getOrderId(), e);
            return false;
        }
    }

    private BigDecimal calculateTotalAmount(List<Product> products) {
        return products.stream()
                .map(Product::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
```

### 配置类 ###

```java
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {

    @Bean("settlementExecutor")
    public TaskExecutor settlementTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("settlement-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

## 总结 ##

1. 异步处理：结算流程异步化，用户无需等待
2. 三重校验：视觉+重量+事件记录，确保准确率 3.
3. 实时通信：MQTT保证设备与后台实时通信 4.
4. 缓存优化：Redis提升系统响应速度 5.
5. 异常容错：完善的异常处理机制

这种系统完美融合了物联网、云计算、移动支付等前沿技术，为用户提供了拿了就走的无感购物体验，代表了零售行业数字化转型的最新成果。
