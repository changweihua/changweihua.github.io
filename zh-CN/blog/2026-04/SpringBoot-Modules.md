---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot模块化开发的5种组织方式
description: SpringBoot模块化开发的5种组织方式
date: 2026-04-21 13:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在企业级应用开发中，随着业务复杂度的不断提升，单体应用往往变得臃肿难以维护。

模块化开发作为解决复杂性的关键策略，能够有效提升代码的可维护性、可扩展性和团队协作效率。

SpringBoot作为Java领域流行的应用开发框架，提供了多种模块化组织方式，以适应不同的业务场景和团队需求。

本文将介绍SpringBoot模块化开发的5种组织方式。

## 一、Maven/Gradle多模块项目 ##

### 核心理念 ###

Maven/Gradle多模块项目是最基础、最常用的模块化方式，通过将应用拆分为多个子模块，每个模块负责特定的功能，共同构成一个完整的应用。这种方式保持了单体应用的部署简便性，同时获得了代码组织的清晰度。

### 实现方式 ###

#### 项目结构 ####

```txt
my-app/
├── pom.xml (父POM)
├── my-app-core/
│   ├── pom.xml
│   └── src/
├── my-app-service/
│   ├── pom.xml
│   └── src/
├── my-app-web/
│   ├── pom.xml
│   └── src/
└── my-app-api/
    ├── pom.xml
    └── src/
```

#### 父POM配置 ####

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>
    
    <modules>
        <module>my-app-core</module>
        <module>my-app-service</module>
        <module>my-app-web</module>
        <module>my-app-api</module>
    </modules>
    
    <properties>
        <java.version>11</java.version>
        <spring-boot.version>2.6.3</spring-boot.version>
    </properties>
    
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

#### 子模块POM示例（my-app-web） ####

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.example</groupId>
        <artifactId>my-app</artifactId>
        <version>1.0.0</version>
    </parent>
    
    <artifactId>my-app-web</artifactId>
    
    <dependencies>
        <!-- 依赖其他内部模块 -->
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>my-app-service</artifactId>
            <version>${project.version}</version>
        </dependency>
        
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

#### 模块之间的依赖关系 ####

- my-app-core: 包含通用工具类、基础配置等
- my-app-service: 包含业务服务实现，依赖core模块
- my-app-api: 包含API定义，可能被其他项目引用
- my-app-web: 包含Web控制器，依赖service模块

### 优缺点分析 ###

优点:

- 结构清晰，各模块职责明确
- 支持模块间代码复用
- 构建、测试和发布过程统一管理
- 保持了单体应用的简单部署方式
- IDE支持良好

缺点:

- 所有模块仍然是一个整体部署单元
- 模块间边界不够严格，容易产生依赖混乱
- 随着项目增长，构建时间可能变长

### 适用场景 ###

- 中小型应用，代码量适中
- 团队规模不大，沟通成本较低
- 需要清晰的代码组织但又不希望引入分布式复杂性
- 作为向微服务架构演进的过渡阶段

## 二、基于Spring Profiles的功能模块化 ##

### 核心理念 ###

利用 Spring 的 `Profiles` 机制，在同一代码库中定义不同的功能模块，并通过配置文件激活或禁用特定功能。

这种方式不需要物理拆分代码，而是通过逻辑分组和条件加载实现功能模块化。

### 实现方式 ###

#### 定义不同功能模块的配置类 ####

```java
@Configuration
@Profile("payment")
public class PaymentConfig {
    
    @Bean
    public PaymentService paymentService() {
        return new PaymentServiceImpl();
    }
    
    @Bean
    public PaymentRepository paymentRepository() {
        return new PaymentRepositoryImpl();
    }
}
```

```java
@Configuration
@Profile("notification")
public class NotificationConfig {
    
    @Bean
    public NotificationService notificationService() {
        return new EmailNotificationService();
    }
    
    @Bean
    public NotificationTemplate notificationTemplate() {
        return new StandardNotificationTemplate();
    }
}
```

#### 在应用属性中激活特定模块 ####

```ini
# application.properties
spring.profiles.active=core,payment,notification
```

或者通过环境变量:

```bash
java -jar app.jar --spring.profiles.active=core,payment
```

#### 在代码中使用条件注解 ####

```java
@Service
@Profile("payment")
public class PaymentServiceImpl implements PaymentService {
    // 实现代码
}

@Controller
@Profile("admin")
@RequestMapping("/admin")
public class AdminController {
    // 管理员功能
}
```

#### 环境特定配置 ####

```ini
# application-payment.properties
payment.gateway.url=https://payment.example.com
payment.timeout=30
```

```ini
# application-notification.properties
notification.email.host=smtp.example.com
notification.sms.enabled=true
```

### 优缺点分析 ###

优点:

- 无需物理拆分代码，实现简单
- 可根据部署环境灵活启用/禁用功能
- 共享基础设施代码
- 便于实现功能的A/B测试或灰度发布

缺点:

- 模块边界不够清晰，容易导致耦合
- 随着功能增多，单个代码库仍会变得庞大
- 所有功能模块仍在同一个部署单元中
- 不便于不同团队并行开发

### 适用场景 ###

- 需要根据客户需求定制功能的产品
- 同一应用需要部署到不同环境且功能略有差异
- 需要进行功能试验或灰度发布
- 功能相对独立但又不希望创建多个项目

## 三、基于Spring Boot Starter的模块化 ##

### 核心理念 ###

Spring Boot Starter是Spring生态系统的一个核心特性，它通过自动配置和依赖管理简化了模块集成。

通过创建自定义Starter，可以将功能封装为独立模块，实现可插拔的组件化架构。

### 实现方式 ###

#### 创建自定义Starter的项目结构 ####

```txt
my-feature-spring-boot-starter/
├── pom.xml
└── src/main/java/
    └── com/example/feature/
        ├── FeatureAutoConfiguration.java
        ├── FeatureProperties.java
        ├── service/
        │   └── FeatureService.java
        └── META-INF/
            └── spring.factories
```

#### Starter的POM文件 ####

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-feature-spring-boot-starter</artifactId>
    <version>1.0.0</version>
    
    <properties>
        <java.version>11</java.version>
        <spring-boot.version>2.6.3</spring-boot.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
    
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

#### 自动配置类 ####

```java
@Configuration
@ConditionalOnClass(FeatureService.class)
@EnableConfigurationProperties(FeatureProperties.class)
public class FeatureAutoConfiguration {
    
    private final FeatureProperties properties;
    
    public FeatureAutoConfiguration(FeatureProperties properties) {
        this.properties = properties;
    }
    
    @Bean
    @ConditionalOnMissingBean
    public FeatureService featureService() {
        return new FeatureService(properties.getApiKey(), properties.isEnabled());
    }
    
    @Bean
    @ConditionalOnProperty(prefix = "feature", name = "advanced-mode", havingValue = "true")
    public AdvancedFeatureService advancedFeatureService() {
        return new AdvancedFeatureService();
    }
}
```

#### 配置属性类 ####

```java
@ConfigurationProperties(prefix = "feature")
public class FeatureProperties {
    
    /**
     * API密钥用于访问特性服务
     */
    private String apiKey;
    
    /**
     * 是否启用该特性
     */
    private boolean enabled = true;
    
    /**
     * 是否开启高级模式
     */
    private boolean advancedMode = false;
    
    // getter和setter方法
}
```

#### 注册自动配置（spring.factories文件） ####

```ini
# 自动配置类
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.feature.FeatureAutoConfiguration
```

#### 在应用中使用自定义Starter ####

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>my-feature-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

```ini
# 在应用配置文件中
feature.api-key=your-api-key
feature.enabled=true
feature.advanced-mode=false
```

```java
@Service
public class MyService {
    
    private final FeatureService featureService;
    
    @Autowired
    public MyService(FeatureService featureService) {
        this.featureService = featureService;
    }
    
    public void doSomething() {
        featureService.processFeature();
    }
}
```

### 优缺点分析 ###

优点:

- 实现真正的"按需装配"，组件可插拔
- 模块有明确的边界和API
- 便于共享和复用
- 支持条件化配置
- 符合Spring Boot的设计理念

缺点:

- 创建Starter的初始成本较高
- 版本管理较为复杂
- 需要考虑向后兼容性
- 调试相对困难

### 适用场景 ###

- 需要在多个项目中复用的通用功能
- 提供给第三方使用的功能模块
- 企业内部的共享基础设施
- 需要高度可配置性的功能

## 四、基于DDD的模块化架构 ##

### 核心理念 ###

领域驱动设计(DDD)是一种软件开发方法论，强调将业务领域概念直接映射到软件设计中。基于DDD的模块化将系统按业务领域边界（Bounded Context）划分为多个模块，每个模块都有自己的领域模型和业务规则。

### 实现方式 ###

#### 项目结构 ####

```txt
my-app/
├── pom.xml
├── common/
│   ├── pom.xml
│   └── src/
├── order/
│   ├── pom.xml
│   ├── src/main/java/com/example/order/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── interfaces/
│   └── src/test/
├── payment/
│   ├── pom.xml
│   ├── src/main/java/com/example/payment/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── interfaces/
│   └── src/test/
└── user/
    ├── pom.xml
    └── src/...
```

#### 领域模块内部结构 ####

每个领域模块遵循分层架构：

- domain: 包含实体、值对象、领域服务和领域事件
- application: 包含应用服务、命令和查询处理器
- infrastructure: 包含持久化实现、外部服务集成
- interfaces: 包含API控制器、DTO和转换器

#### 领域模型示例(Order模块) ####

```java
// domain层
package com.example.order.domain.model;

@Entity
public class Order {
    @Id
    private OrderId id;
    private CustomerId customerId;
    private Money totalAmount;
    private OrderStatus status;
    private Set<OrderItem> items;
    
    public Order(CustomerId customerId, Set<OrderItem> items) {
        this.id = new OrderId(UUID.randomUUID());
        this.customerId = customerId;
        this.items = items;
        this.status = OrderStatus.CREATED;
        this.totalAmount = calculateTotalAmount();
    }
    
    public void confirm() {
        if (status != OrderStatus.CREATED) {
            throw new InvalidOrderStateException("Cannot confirm order in state: " + status);
        }
        status = OrderStatus.CONFIRMED;
        // 发布领域事件
        DomainEventPublisher.publish(new OrderConfirmedEvent(this.id));
    }
    
    private Money calculateTotalAmount() {
        return items.stream()
                .map(item -> item.getPrice().multiply(item.getQuantity()))
                .reduce(Money.ZERO, Money::add);
    }
    
    // 其他业务方法...
}
```

#### 应用服务示例 ####

```java
// application层
package com.example.order.application.service;

@Service
@Transactional
public class OrderApplicationService {
    
    private final OrderRepository orderRepository;
    private final CustomerService customerService;
    
    @Autowired
    public OrderApplicationService(
            OrderRepository orderRepository,
            CustomerService customerService) {
        this.orderRepository = orderRepository;
        this.customerService = customerService;
    }
    
    public OrderId createOrder(CreateOrderCommand command) {
        // 验证客户
        CustomerId customerId = new CustomerId(command.getCustomerId());
        if (!customerService.exists(customerId)) {
            throw new CustomerNotFoundException(customerId);
        }
        
        // 创建订单项
        Set<OrderItem> items = command.getItems().stream()
                .map(this::toOrderItem)
                .collect(Collectors.toSet());
        
        // 创建订单
        Order order = new Order(customerId, items);
        
        // 保存订单
        orderRepository.save(order);
        
        return order.getId();
    }
    
    public void confirmOrder(ConfirmOrderCommand command) {
        OrderId orderId = new OrderId(command.getOrderId());
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        order.confirm();
        orderRepository.save(order);
    }
    
    private OrderItem toOrderItem(OrderItemDto dto) {
        return new OrderItem(
                new ProductId(dto.getProductId()),
                dto.getQuantity(),
                new Money(dto.getPrice())
        );
    }
}
```

#### 模块间通信 ####

```java
// 在支付模块中集成订单模块
package com.example.payment.application.service;

@Service
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient; // 防腐层
    
    @Autowired
    public PaymentService(
            PaymentRepository paymentRepository,
            OrderClient orderClient) {
        this.paymentRepository = paymentRepository;
        this.orderClient = orderClient;
    }
    
    public PaymentId processPayment(ProcessPaymentCommand command) {
        // 从订单模块获取订单
        Order order = orderClient.getOrder(command.getOrderId());
        
        // 验证订单状态
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new InvalidOrderStateException("Cannot process payment for order: " + order.getId());
        }
        
        // 创建支付
        Payment payment = new Payment(
                new OrderId(order.getId()),
                order.getTotalAmount(),
                command.getPaymentMethod()
        );
        
        // 处理支付逻辑...
        paymentGateway.process(payment);
        
        // 保存支付记录
        paymentRepository.save(payment);
        
        return payment.getId();
    }
}
```

### 优缺点分析 ###

优点:

- 模块边界基于业务领域，更符合业务现实
- 高内聚、低耦合，维护性好
- 适合大型复杂系统
- 支持团队自治
- 领域模型表达力强，便于与业务人员沟通

缺点:

- 学习曲线陡峭
- 初期设计成本高
- 可能导致代码重复(每个领域有自己的模型)
- 需要精心设计模块间通信

### 适用场景 ###

- 业务复杂度高的企业应用
- 长期维护的核心系统
- 大型团队协作开发
- 有明确领域边界的系统

## 五、基于微服务的模块化 ##

### 核心理念 ###

微服务架构将应用拆分为多个独立部署的服务，每个服务负责特定的业务功能，并通过轻量级通信机制(如HTTP API)或者其他RPC框架（如Dubbo）进行交互。这种方式使得服务可以独立开发、测试、部署和扩展。

### 实现方式 ###

#### 服务划分 ####

将系统按业务能力划分为多个独立服务：

```txt
电商系统/
├── 用户服务 (user-service)
├── 商品服务 (product-service)
├── 订单服务 (order-service)
├── 支付服务 (payment-service)
├── 库存服务 (inventory-service)
└── API网关 (api-gateway)
```

#### 单个微服务的项目结构 ####

```txt
order-service/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/orderservice/
│   │   │       ├── OrderServiceApplication.java
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       ├── model/
│   │   │       └── client/
│   │   └── resources/
│   │       └── application.yml
│   └── test/
└── Dockerfile
```

#### 服务间通信(REST API) ####

```java
// 在订单服务中调用产品服务
@Service
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    
    @Autowired
    public OrderService(
            OrderRepository orderRepository,
            ProductClient productClient) {
        this.orderRepository = orderRepository;
        this.productClient = productClient;
    }
    
    public Order createOrder(OrderRequest request) {
        // 验证产品是否存在且有库存
        for (OrderItemRequest item : request.getItems()) {
            ProductResponse product = productClient.getProduct(item.getProductId());
            if (product == null) {
                throw new ProductNotFoundException(item.getProductId());
            }
        }
        
        // 创建订单
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setItems(mapToOrderItems(request.getItems()));
        order.setStatus(OrderStatus.CREATED);
        
        return orderRepository.save(order);
    }
}
```

#### Feign客户端定义 ####

```java
@FeignClient(name = "product-service")
public interface ProductClient {
    
    @GetMapping("/api/products/{productId}")
    ProductResponse getProduct(@PathVariable("productId") String productId);
    
    @GetMapping("/api/products")
    List<ProductResponse> getAllProducts();
    
    @PostMapping("/api/products/{productId}/reserve")
    void reserveProduct(@PathVariable("productId") String productId, @RequestBody ReserveRequest request);
}
```

#### 服务注册与发现(Eureka) ####

```yaml
# application.yml
spring:
  application:
    name: order-service
    
eureka:
  client:
    serviceUrl:
      defaultZone: http://eureka-server:8761/eureka/
  instance:
    preferIpAddress: true
```

#### API网关配置(Spring Cloud Gateway) ####

```yaml
# gateway application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
        - id: product-service
          uri: lb://product-service
          predicates:
            - Path=/api/products/**
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
```

### 优缺点分析 ###

优点:

- 服务独立部署和扩展
- 技术栈可以多样化
- 故障隔离
- 适合大型团队并行开发
- 支持按需扩展高负载服务

缺点:

- 分布式系统复杂性
- 运维挑战
- 跨服务调试困难
- 数据一致性难保证
- 网络延迟和故障处理

### 适用场景 ###

- 大型复杂系统
- 需要高可扩展性的场景
- 多团队协作开发
- 对不同组件有不同扩展需求

## 六、方案对比 ##

| 模块化方式 | 复杂度 | 团队协作 | 部署独立性 | 开发效率 | 适合规模 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Maven多模块 | 低 | 中 | 低 | 高 | 小到中型 |
| Profiles功能模块 | 低 | 低 | 低 | 高 | 小型 |
| Spring Boot Starter | 中 | 中 | 中 | 中 | 中型 |
| DDD模块化 | 高 | 高 | 中 | 中 | 中到大型 |
| 微服务 | 高 | 高 | 高 | 低 | 大型 |

## 七、总结 ##

SpringBoot模块化开发提供了多种组织方式，每种方式都有其适用场景和优缺点。

选择合适的模块化策略应考虑项目规模、团队结构、业务复杂度和未来演进方向。

最重要的是，模块化应该是渐进式的过程，随着项目的发展不断调整和优化模块结构，以适应不断变化的业务需求和技术环境。

无论选择哪种模块化方式，清晰的模块边界、良好的接口设计和适当的耦合度控制都是成功的关键因素。

通过合理的模块化，我们可以构建出更加灵活、可维护且适应未来变化的应用。
