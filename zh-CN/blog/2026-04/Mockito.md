---
lastUpdated: true
commentabled: true
recommended: true
title: Mockito 单元测试框架实战
description: Mockito 单元测试框架实战
date: 2026-04-02 09:34:00 
pageClass: blog-page-class
cover: /covers/java.svg
---

## 一、Mockito 简介 ##

Mockito 是 Java 生态中最流行的 Mock 框架，被广泛应用于单元测试中。它提供了简洁优雅的 API，帮助开发者轻松创建和配置 Mock 对象，从而实现对依赖项的隔离测试。

### 为什么需要 Mock？ ###

在实际开发中，我们常常遇到以下场景：

- 依赖的外部服务（数据库、HTTP API）难以在测试环境搭建
- 某些依赖执行缓慢，影响测试效率
- 需要模拟各种异常情况进行测试
- 希望独立测试某个模块，不受其他模块影响

Mockito 正是为解决这些问题而生，它可以创建虚拟对象替代真实依赖，让测试变得简单高效。

### Mockito 的核心优势 ###

- 简洁的 API：使用流畅的链式调用，代码可读性强
- 强大的验证功能：可以验证方法调用次数、参数等
- 灵活的参数匹配：支持精确匹配、类型匹配、自定义匹配
- 注解支持：通过注解简化 Mock 对象的创建
- 与主流框架集成：完美支持 JUnit、Spring Boot 等

## 二、Mockito 核心架构 ##

Mockito 的架构分为四个主要层次：

- 测试代码层：我们编写的测试代码
- Mockito API：提供 mock()、when()、verify() 等核心方法
- Mock 对象代理：动态创建的代理对象
- 字节码增强：底层使用 ByteBuddy 进行字节码操作

## 三、快速开始 ##

### 添加依赖 ###

在项目中添加 Mockito 依赖：

```xml
<!-- Maven -->
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>5.8.0</version>
    <scope>test</scope>
</dependency>

<!-- 如果使用 JUnit 5 -->
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>5.8.0</version>
    <scope>test</scope>
</dependency>
```

```gradle
// Gradle
testImplementation 'org.mockito:mockito-core:5.8.0'
testImplementation 'org.mockito:mockito-junit-jupiter:5.8.0'
```

### 基本用法三步曲 ###

Mockito 的基本使用可以归纳为三个步骤：

#### 步骤 1：创建 Mock 对象 ####

```java
import static org.mockito.Mockito.*;

// 方式一：使用 mock() 方法
List<String> mockList = mock(List.class);

// 方式二：使用 @Mock 注解
@Mock
private UserRepository userRepository;
```

#### 步骤 2：定义 Mock 行为 ####

```java
// 定义返回值
when(mockList.get(0)).thenReturn("first");
when(mockList.size()).thenReturn(10);

// 定义异常
when(mockList.get(1)).thenThrow(new RuntimeException("出错了"));

// 链式调用
when(mockList.isEmpty())
    .thenReturn(false)
    .thenReturn(true);  // 第二次调用返回 true
```

#### 步骤 3：验证方法调用 ####

```java
// 验证方法被调用
verify(mockList).add("item");

// 验证调用次数
verify(mockList, times(2)).add(anyString());

// 验证从未调用
verify(mockList, never()).clear();
```

## 四、验证方法详解 ##

Mockito 提供了丰富的验证方法来检查 Mock 对象的交互：

### 调用次数验证 ###

```java
import static org.mockito.Mockito.*;

@Test
public void testVerification() {
    List<String> mockList = mock(List.class);

    mockList.add("once");
    mockList.add("twice");
    mockList.add("twice");

    // 验证调用 1 次（默认）
    verify(mockList).add("once");

    // 验证调用 2 次
    verify(mockList, times(2)).add("twice");

    // 验证从未调用
    verify(mockList, never()).clear();

    // 验证至少调用 1 次
    verify(mockList, atLeastOnce()).add(anyString());

    // 验证至少调用 2 次
    verify(mockList, atLeast(2)).add("twice");

    // 验证最多调用 5 次
    verify(mockList, atMost(5)).add(anyString());
}
```

### 调用顺序验证 ###

```java
@Test
public void testInOrder() {
    List<String> firstMock = mock(List.class);
    List<String> secondMock = mock(List.class);

    firstMock.add("first");
    secondMock.add("second");
    firstMock.add("third");

    // 验证调用顺序
    InOrder inOrder = inOrder(firstMock, secondMock);
    inOrder.verify(firstMock).add("first");
    inOrder.verify(secondMock).add("second");
    inOrder.verify(firstMock).add("third");
}
```

### 超时验证 ###

```java
@Test
public void testTimeout() {
    List<String> mockList = mock(List.class);

    // 异步调用
    new Thread(() -> {
        try {
            Thread.sleep(100);
            mockList.add("async");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }).start();

    // 验证在 200ms 内被调用
    verify(mockList, timeout(200)).add("async");
}
```

## 五、参数匹配器 ##

参数匹配器（ArgumentMatchers）让我们可以灵活地匹配方法参数。

### 常用匹配器 ###

```java
import static org.mockito.ArgumentMatchers.*;

@Test
public void testMatchers() {
    Map<String, String> mockMap = mock(Map.class);

    // any() - 匹配任何对象
    when(mockMap.get(any())).thenReturn("value");

    // anyString() - 匹配任何字符串
    when(mockMap.put(anyString(), anyString())).thenReturn("old");

    // anyInt() - 匹配任何整数
    when(mockMap.remove(anyInt())).thenReturn("removed");

    // eq() - 精确匹配
    when(mockMap.get(eq("key"))).thenReturn("specific");

    // isNull() - 匹配 null
    when(mockMap.get(isNull())).thenReturn("null-value");

    // isNotNull() - 匹配非 null
    when(mockMap.containsKey(isNotNull())).thenReturn(true);
}
```

### 自定义匹配器 ###

```java
@Test
public void testCustomMatcher() {
    List<String> mockList = mock(List.class);

    // 使用 argThat 自定义匹配逻辑
    when(mockList.add(argThat(s -> s.length() > 5)))
        .thenReturn(true);

    assertTrue(mockList.add("long string"));  // true
    assertFalse(mockList.add("short"));       // false
}
```

### 混合使用注意事项 ###

```java
// ❌ 错误：不能混用匹配器和具体值
when(mockMap.put(anyString(), "value")).thenReturn("old");

// ✅ 正确：全部使用匹配器
when(mockMap.put(anyString(), eq("value"))).thenReturn("old");
```

## 六、高级特性 ##

### 使用注解简化代码 ###

Mockito 提供了多个注解来简化 Mock 对象的创建和注入：

```java
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    // @Mock 创建 Mock 对象
    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    // @InjectMocks 自动注入 Mock 依赖
    @InjectMocks
    private UserService userService;

    @Test
    public void testCreateUser() {
        User user = new User("张三", "zhang@example.com");
        when(userRepository.save(any(User.class))).thenReturn(user);

        User created = userService.createUser(user);

        verify(userRepository).save(user);
        verify(emailService).sendWelcomeEmail(user.getEmail());
        assertEquals("张三", created.getName());
    }
}
```

### Spy - 部分 Mock ###

Spy 允许我们监视真实对象，只 Mock 部分方法：

```java
@Test
public void testSpy() {
    List<String> realList = new ArrayList<>();
    List<String> spyList = spy(realList);

    // 真实方法会被调用
    spyList.add("one");
    spyList.add("two");

    // Mock 特定方法
    when(spyList.size()).thenReturn(100);

    assertEquals(100, spyList.size());  // Mock 的行为
    assertEquals("one", spyList.get(0));  // 真实的行为
}
```

实际应用场景：

```java
public class OrderService {

    public double calculateTotal(Order order) {
        double subtotal = calculateSubtotal(order);
        double tax = calculateTax(subtotal);
        return subtotal + tax;
    }

    protected double calculateSubtotal(Order order) {
        // 复杂的计算逻辑
        return order.getItems().stream()
            .mapToDouble(Item::getPrice)
            .sum();
    }

    protected double calculateTax(double amount) {
        return amount * 0.1;
    }
}

@Test
public void testCalculateTotal() {
    OrderService orderService = spy(new OrderService());

    // 只 Mock calculateTax 方法
    doReturn(50.0).when(orderService).calculateTax(anyDouble());

    Order order = new Order();
    order.addItem(new Item("商品", 100.0));

    double total = orderService.calculateTotal(order);

    assertEquals(150.0, total);  // 100 + 50
}
```

### Answer - 自定义返回逻辑 ###

Answer 接口允许我们实现复杂的返回逻辑：

```java
@Test
public void testAnswer() {
    List<String> mockList = mock(List.class);

    // 根据参数动态返回结果
    when(mockList.get(anyInt())).thenAnswer(invocation -> {
        Integer index = invocation.getArgument(0);
        return "element-" + index;
    });

    assertEquals("element-0", mockList.get(0));
    assertEquals("element-5", mockList.get(5));
}
```

实际应用场景 - 模拟异步回调：

```java
public interface AsyncService {
    void executeAsync(String task, Callback callback);
}

@Test
public void testAsyncCallback() {
    AsyncService asyncService = mock(AsyncService.class);

    doAnswer(invocation -> {
        String task = invocation.getArgument(0);
        Callback callback = invocation.getArgument(1);

        // 模拟异步执行后调用回调
        callback.onSuccess("完成: " + task);
        return null;
    }).when(asyncService).executeAsync(anyString(), any(Callback.class));

    Callback mockCallback = mock(Callback.class);
    asyncService.executeAsync("任务1", mockCallback);

    verify(mockCallback).onSuccess("完成: 任务1");
}
```

### ArgumentCaptor - 捕获参数 ###

ArgumentCaptor 用于捕获传递给 Mock 方法的参数，便于后续断言：

```java
@Test
public void testArgumentCaptor() {
    List<String> mockList = mock(List.class);

    mockList.add("John");
    mockList.add("Jane");

    // 创建 ArgumentCaptor
    ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);

    // 捕获所有调用的参数
    verify(mockList, times(2)).add(captor.capture());

    List<String> capturedValues = captor.getAllValues();
    assertEquals(Arrays.asList("John", "Jane"), capturedValues);
}
```

实际应用场景 - 验证复杂对象：

```java
@Test
public void testCaptureComplexObject() {
    UserRepository userRepository = mock(UserRepository.class);
    UserService userService = new UserService(userRepository);

    userService.registerUser("张三", "zhang@example.com", 25);

    // 捕获传递给 save 方法的 User 对象
    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    verify(userRepository).save(userCaptor.capture());

    User capturedUser = userCaptor.getValue();
    assertEquals("张三", capturedUser.getName());
    assertEquals("zhang@example.com", capturedUser.getEmail());
    assertEquals(25, capturedUser.getAge());
    assertNotNull(capturedUser.getCreatedAt());
}
```

## 七、Spring Boot 集成实战 ##

在实际项目中，Mockito 最常见的应用场景是测试 Spring Boot 应用。

### 依赖配置 ###

Spring Boot 项目通常已经包含 Mockito，但建议显式添加：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

### Service 层测试 ###

被测试的 Service：

```java
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                       InventoryService inventoryService,
                       PaymentService paymentService,
                       NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.inventoryService = inventoryService;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
    }

    public Order createOrder(OrderRequest request) {
        // 1. 检查库存
        if (!inventoryService.checkStock(request.getProductId(), request.getQuantity())) {
            throw new InsufficientStockException("库存不足");
        }

        // 2. 创建订单
        Order order = new Order();
        order.setProductId(request.getProductId());
        order.setQuantity(request.getQuantity());
        order.setUserId(request.getUserId());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // 3. 扣减库存
        inventoryService.decreaseStock(request.getProductId(), request.getQuantity());

        // 4. 处理支付
        PaymentResult paymentResult = paymentService.processPayment(
            savedOrder.getId(),
            request.getPaymentMethod(),
            calculateAmount(request)
        );

        if (paymentResult.isSuccess()) {
            savedOrder.setStatus(OrderStatus.PAID);
            orderRepository.save(savedOrder);

            // 5. 发送通知
            notificationService.sendOrderConfirmation(savedOrder);
        } else {
            // 回滚库存
            inventoryService.increaseStock(request.getProductId(), request.getQuantity());
            savedOrder.setStatus(OrderStatus.FAILED);
        }

        return savedOrder;
    }

    private BigDecimal calculateAmount(OrderRequest request) {
        // 计算金额逻辑
        return BigDecimal.valueOf(request.getQuantity() * 100);
    }
}
```

测试类：

```java
@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private PaymentService paymentService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderService orderService;

    private OrderRequest orderRequest;

    @BeforeEach
    void setUp() {
        orderRequest = new OrderRequest();
        orderRequest.setProductId(1L);
        orderRequest.setQuantity(2);
        orderRequest.setUserId(100L);
        orderRequest.setPaymentMethod("CREDIT_CARD");
    }

    @Test
    @DisplayName("成功创建订单")
    void testCreateOrder_Success() {
        // Given
        when(inventoryService.checkStock(1L, 2)).thenReturn(true);

        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setStatus(OrderStatus.PENDING);
        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);

        PaymentResult paymentResult = new PaymentResult(true, "SUCCESS");
        when(paymentService.processPayment(anyLong(), anyString(), any(BigDecimal.class)))
            .thenReturn(paymentResult);

        // When
        Order result = orderService.createOrder(orderRequest);

        // Then
        assertNotNull(result);
        assertEquals(OrderStatus.PAID, result.getStatus());

        // 验证交互
        verify(inventoryService).checkStock(1L, 2);
        verify(inventoryService).decreaseStock(1L, 2);
        verify(orderRepository, times(2)).save(any(Order.class));
        verify(paymentService).processPayment(eq(1L), eq("CREDIT_CARD"), any(BigDecimal.class));
        verify(notificationService).sendOrderConfirmation(result);
    }

    @Test
    @DisplayName("库存不足时抛出异常")
    void testCreateOrder_InsufficientStock() {
        // Given
        when(inventoryService.checkStock(1L, 2)).thenReturn(false);

        // When & Then
        assertThrows(InsufficientStockException.class, () -> {
            orderService.createOrder(orderRequest);
        });

        // 验证不会调用后续方法
        verify(inventoryService).checkStock(1L, 2);
        verify(inventoryService, never()).decreaseStock(anyLong(), anyInt());
        verify(orderRepository, never()).save(any(Order.class));
        verify(paymentService, never()).processPayment(anyLong(), anyString(), any(BigDecimal.class));
    }

    @Test
    @DisplayName("支付失败时回滚库存")
    void testCreateOrder_PaymentFailed() {
        // Given
        when(inventoryService.checkStock(1L, 2)).thenReturn(true);

        Order mockOrder = new Order();
        mockOrder.setId(1L);
        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);

        PaymentResult paymentResult = new PaymentResult(false, "INSUFFICIENT_FUNDS");
        when(paymentService.processPayment(anyLong(), anyString(), any(BigDecimal.class)))
            .thenReturn(paymentResult);

        // When
        Order result = orderService.createOrder(orderRequest);

        // Then
        assertEquals(OrderStatus.FAILED, result.getStatus());

        // 验证回滚库存
        verify(inventoryService).decreaseStock(1L, 2);
        verify(inventoryService).increaseStock(1L, 2);
        verify(notificationService, never()).sendOrderConfirmation(any(Order.class));
    }
}
```

### Controller 层测试 ###

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest request) {
        Order order = orderService.createOrder(request);
        return ResponseEntity.ok(new OrderResponse(order));
    }
}

// 测试类
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Test
    @DisplayName("POST /api/orders - 成功创建订单")
    void testCreateOrder() throws Exception {
        // Given
        OrderRequest request = new OrderRequest();
        request.setProductId(1L);
        request.setQuantity(2);

        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setStatus(OrderStatus.PAID);

        when(orderService.createOrder(any(OrderRequest.class))).thenReturn(mockOrder);

        // When & Then
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productId\":1,\"quantity\":2}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.status").value("PAID"));

        verify(orderService).createOrder(any(OrderRequest.class));
    }
}
```

## 八、最佳实践 ##

### 优先 Mock 接口而非具体类 ###

```java
// ✅ 推荐：Mock 接口
UserRepository userRepository = mock(UserRepository.class);

// ❌ 不推荐：Mock 具体类（可能遇到 final 方法问题）
UserRepositoryImpl userRepository = mock(UserRepositoryImpl.class);
```

### 避免过度 Mock ###

```java
// ❌ 过度 Mock - 测试变得脆弱
@Test
void badTest() {
    when(dependency1.method1()).thenReturn("value1");
    when(dependency2.method2()).thenReturn("value2");
    when(dependency3.method3()).thenReturn("value3");
    // ... 大量的 Mock 设置

    // 实际业务逻辑被淹没
    service.doSomething();

    // 验证大量细节
    verify(dependency1, times(2)).method1();
    verify(dependency2).method2();
    // ...
}

// ✅ 适度 Mock - 只关注核心交互
@Test
void goodTest() {
    // 只 Mock 必要的依赖
    when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

    User result = userService.getUser(1L);

    assertEquals("张三", result.getName());
    verify(userRepository).findById(1L);
}
```

### 使用 @InjectMocks 自动注入 ###

```java
// ✅ 推荐：使用注解自动注入
@Mock
private UserRepository userRepository;

@InjectMocks
private UserService userService;

// ❌ 不推荐：手动创建（容易出错且繁琐）
UserService userService = new UserService(userRepository, emailService, ...);
```

### 合理使用 ArgumentCaptor ###

```java
// ✅ 推荐：验证复杂对象的属性
ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
verify(userRepository).save(captor.capture());
assertEquals("张三", captor.getValue().getName());

// ❌ 不推荐：简单参数使用 Captor（直接匹配即可）
ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
verify(service).process(captor.capture());
assertEquals("value", captor.getValue());  // 直接用 eq("value") 更简洁
```

### 验证重要交互，忽略次要细节 ###

```java
// ✅ 推荐：只验证核心业务逻辑
@Test
void testUserRegistration() {
    userService.register(user);

    verify(userRepository).save(user);  // 核心：保存用户
    verify(emailService).sendWelcome(user.getEmail());  // 核心：发送邮件
    // 不验证日志记录等次要操作
}

// ❌ 不推荐：验证过多细节
verify(logger).info("开始注册用户");
verify(validator).validate(user);
verify(logger).debug("用户验证通过");
// ... 测试变得脆弱
```

### 使用有意义的测试数据 ###

```java
// ✅ 推荐：清晰的测试数据
User testUser = new User("张三", "zhang@example.com", 25);

// ❌ 不推荐：无意义的数据
User testUser = new User("test", "test@test.com", 0);
```

### 一个测试方法只测一个场景 ###

```java
// ✅ 推荐：分离测试场景
@Test
void testCreateUser_Success() {
    // 测试成功场景
}

@Test
void testCreateUser_DuplicateEmail() {
    // 测试邮箱重复场景
}

@Test
void testCreateUser_InvalidInput() {
    // 测试无效输入场景
}

// ❌ 不推荐：在一个测试中测试多个场景
@Test
void testCreateUser() {
    // 成功场景
    // 失败场景
    // 异常场景
    // ... 难以定位问题
}
```

## 九、总结 ##

Mockito 是 Java 单元测试的利器，掌握它可以显著提升测试质量和开发效率。

希望这篇文章能帮助你更好地使用 Mockito，写出高质量的单元测试！
