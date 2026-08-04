---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot中13种设计模式应用案例
description: SpringBoot中13种设计模式应用案例
date: 2026-04-03 08:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

设计模式是软件开发中解决特定问题的经验总结。在SpringBoot框架中，设计模式被巧妙地融入各个环节，不仅提高了框架的灵活性和扩展性，还为开发者提供了优雅的解决方案。
本文将介绍13种设计模式在SpringBoot中的实际应用，每个模式都配有具体的代码实现和应用场景。

## 单例模式 (Singleton Pattern) ##
 
### 模式概述 ###

单例模式确保一个类只有一个实例，并提供一个全局访问点。

### SpringBoot应用 ###

SpringBoot中的Bean默认都是单例的，由Spring容器负责创建和管理，保证全局唯一性。

### 实现示例 ###

```java
@Service
public class UserService {
    
    // 构造方法私有化防止外部直接创建实例
    private UserService() {
        System.out.println("UserService实例被创建");
    }
    
    // Bean的作用域默认为singleton
    @Autowired
    private UserRepository userRepository;
    
    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}

@RestController
public class UserController {
    
    // 注入的是同一个UserService实例
    @Autowired
    private UserService userService;
    
    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
}
```

### 应用优势 ###

- 减少内存占用，避免重复创建对象
- 便于管理共享资源
- 简化对象跟踪和引用

## 工厂方法模式 (Factory Method Pattern) ##

### 模式概述 ###

工厂方法模式定义一个用于创建对象的接口，让子类决定实例化哪一个类。

### SpringBoot应用 ###

SpringBoot中的BeanFactory就是典型的工厂方法模式应用，它负责创建和管理Bean实例。

### 实现示例 ###

```java
// 支付处理器接口
public interface PaymentProcessor {
    void processPayment(double amount);
}

// 具体实现 - 信用卡支付
@Component("creditCard")
public class CreditCardProcessor implements PaymentProcessor {
    @Override
    public void processPayment(double amount) {
        System.out.println("Processing credit card payment of $" + amount);
    }
}

// 具体实现 - PayPal支付
@Component("paypal")
public class PayPalProcessor implements PaymentProcessor {
    @Override
    public void processPayment(double amount) {
        System.out.println("Processing PayPal payment of $" + amount);
    }
}

// 支付处理器工厂
@Component
public class PaymentProcessorFactory {
    
    @Autowired
    private Map<String, PaymentProcessor> processors;
    
    public PaymentProcessor getProcessor(String type) {
        PaymentProcessor processor = processors.get(type);
        if (processor == null) {
            throw new IllegalArgumentException("No payment processor found for type: " + type);
        }
        return processor;
    }
}

// 使用工厂
@Service
public class OrderService {
    
    @Autowired
    private PaymentProcessorFactory processorFactory;
    
    public void placeOrder(String paymentType, double amount) {
        PaymentProcessor processor = processorFactory.getProcessor(paymentType);
        processor.processPayment(amount);
        // 处理订单其余部分...
    }
}
```

### 应用优势 ###

- 松耦合，客户端与具体实现分离
- 符合开闭原则，可以方便地添加新的支付方式
- 封装对象创建逻辑，统一管理

## 抽象工厂模式 (Abstract Factory Pattern) ##

### 模式概述 ###

抽象工厂模式提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们具体的类。

### SpringBoot应用 ###

SpringBoot中的多环境配置和数据源创建就是抽象工厂模式的应用。

### 实现示例 ###

```java
// 抽象产品 - 连接
public interface Connection {
    void connect();
    void executeQuery(String query);
    void close();
}

// 抽象产品 - 事务
public interface Transaction {
    void begin();
    void commit();
    void rollback();
}

// 抽象工厂
public interface DatabaseFactory {
    Connection createConnection();
    Transaction createTransaction();
}

// 具体工厂 - MySQL
@Component("mysqlFactory")
@ConditionalOnProperty(name = "db.type", havingValue = "mysql")
public class MySQLDatabaseFactory implements DatabaseFactory {
    @Override
    public Connection createConnection() {
        return new MySQLConnection();
    }
    
    @Override
    public Transaction createTransaction() {
        return new MySQLTransaction();
    }
}

// 具体工厂 - PostgreSQL
@Component("postgresFactory")
@ConditionalOnProperty(name = "db.type", havingValue = "postgres")
public class PostgresDatabaseFactory implements DatabaseFactory {
    @Override
    public Connection createConnection() {
        return new PostgresConnection();
    }
    
    @Override
    public Transaction createTransaction() {
        return new PostgresTransaction();
    }
}

// 具体产品实现 - MySQL连接
public class MySQLConnection implements Connection {
    @Override
    public void connect() {
        System.out.println("Connecting to MySQL database");
    }
    
    @Override
    public void executeQuery(String query) {
        System.out.println("Executing query on MySQL: " + query);
    }
    
    @Override
    public void close() {
        System.out.println("Closing MySQL connection");
    }
}

// 使用抽象工厂
@Service
public class QueryService {
    
    private final DatabaseFactory databaseFactory;
    
    @Autowired
    public QueryService(@Qualifier("mysqlFactory") DatabaseFactory databaseFactory) {
        this.databaseFactory = databaseFactory;
    }
    
    public void executeQuery(String query) {
        Connection connection = databaseFactory.createConnection();
        Transaction transaction = databaseFactory.createTransaction();
        
        try {
            connection.connect();
            transaction.begin();
            connection.executeQuery(query);
            transaction.commit();
        } catch (Exception e) {
            transaction.rollback();
        } finally {
            connection.close();
        }
    }
}
```

### 应用优势 ###

- 提供一组相关对象而非单个对象
- 确保创建的产品相互匹配
- 便于环境切换（如开发、测试、生产环境）

## 建造者模式 (Builder Pattern) ##

### 模式概述 ###

建造者模式将一个复杂对象的构建与它的表示分离，使得同样的构建过程可以创建不同的表示。

### SpringBoot应用 ###

SpringBoot中的配置类和链式API设计中大量使用了建造者模式。

### 实现示例 ###

```java
// 产品类
@Data
public class EmailMessage {
    private String from;
    private List<String> to;
    private List<String> cc;
    private String subject;
    private String body;
    private boolean html;
    private List<String> attachments;
    private LocalDateTime scheduledTime;
    
    // 私有构造器，只能通过Builder创建
    private EmailMessage() {}
    
    // 建造者类
    public static class Builder {
        private EmailMessage message;
        
        public Builder() {
            message = new EmailMessage();
            message.to = new ArrayList<>();
            message.cc = new ArrayList<>();
            message.attachments = new ArrayList<>();
        }
        
        public Builder from(String from) {
            message.from = from;
            return this;
        }
        
        public Builder to(String to) {
            message.to.add(to);
            return this;
        }
        
        public Builder cc(String cc) {
            message.cc.add(cc);
            return this;
        }
        
        public Builder subject(String subject) {
            message.subject = subject;
            return this;
        }
        
        public Builder body(String body) {
            message.body = body;
            return this;
        }
        
        public Builder html(boolean html) {
            message.html = html;
            return this;
        }
        
        public Builder attachment(String attachment) {
            message.attachments.add(attachment);
            return this;
        }
        
        public Builder scheduledTime(LocalDateTime scheduledTime) {
            message.scheduledTime = scheduledTime;
            return this;
        }
        
        public EmailMessage build() {
            if (message.from == null || message.to.isEmpty() || message.subject == null) {
                throw new IllegalStateException("From, To and Subject are required");
            }
            return message;
        }
    }
}

// 服务使用建造者模式
@Service
public class EmailService {
    
    // 使用建造者构造复杂对象
    public void sendWelcomeEmail(User user) {
        EmailMessage message = new EmailMessage.Builder()
                .from("noreply@example.com")
                .to(user.getEmail())
                .subject("Welcome to Our Platform")
                .body("<h1>Welcome, " + user.getName() + "!</h1><p>Thanks for joining us.</p>")
                .html(true)
                .build();
        
        sendEmail(message);
    }
    
    private void sendEmail(EmailMessage message) {
        // 发送邮件逻辑
        System.out.println("Sending email: " + message);
    }
}
```

### 应用优势 ###

- 参数可控制性强，可以逐步构建对象
- 良好的可读性，类似自然语言描述
- 支持多种配置组合，而不需要大量重载的构造函数

## 原型模式 (Prototype Pattern) ##

### 模式概述 ###

原型模式通过复制现有对象而非创建新实例来创建对象，用于创建成本高昂的对象。

### SpringBoot应用 ###

SpringBoot中的bean作用域prototype就是原型模式的应用，每次获取都会创建新的实例。

### 实现示例 ###

```java
// 支持克隆的配置类
@Component
@Scope("prototype")
public class ReportConfiguration implements Cloneable {
    private String reportType;
    private List<String> columns;
    private String sortBy;
    private boolean ascending;
    private String dateRange;
    
    // 默认构造器设置基础配置
    public ReportConfiguration() {
        this.reportType = "summary";
        this.columns = new ArrayList<>(Arrays.asList("id", "name", "date"));
        this.sortBy = "date";
        this.ascending = false;
        this.dateRange = "last7days";
    }
    
    @Override
    public ReportConfiguration clone() {
        try {
            ReportConfiguration clone = (ReportConfiguration) super.clone();
            // 深复制列表
            clone.columns = new ArrayList<>(this.columns);
            return clone;
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }
    
    // getter和setter方法
    // ...
}

// 报表工厂使用原型模式
@Service
public class ReportFactory {
    
    // 注入原型bean
    @Autowired
    private ReportConfiguration defaultConfig;
    
    // 存储预定义的模板
    private Map<String, ReportConfiguration> templates = new HashMap<>();
    
    @PostConstruct
    public void initTemplates() {
        // 创建财务报表模板
        ReportConfiguration financialTemplate = defaultConfig.clone();
        financialTemplate.setReportType("financial");
        financialTemplate.setColumns(Arrays.asList("id", "amount", "transaction_date", "category"));
        financialTemplate.setSortBy("amount");
        templates.put("financial", financialTemplate);
        
        // 创建用户活动报表模板
        ReportConfiguration activityTemplate = defaultConfig.clone();
        activityTemplate.setReportType("activity");
        activityTemplate.setColumns(Arrays.asList("user_id", "action", "timestamp", "ip_address"));
        activityTemplate.setSortBy("timestamp");
        templates.put("activity", activityTemplate);
    }
    
    // 基于已有模板创建新配置
    public ReportConfiguration createFromTemplate(String templateName) {
        ReportConfiguration template = templates.get(templateName);
        if (template == null) {
            throw new IllegalArgumentException("Template not found: " + templateName);
        }
        return template.clone();
    }
    
    // 基于默认配置创建新配置
    public ReportConfiguration createDefault() {
        return defaultConfig.clone();
    }
}

// 使用原型模式
@RestController
@RequestMapping("/reports")
public class ReportController {
    
    @Autowired
    private ReportFactory reportFactory;
    
    @GetMapping("/financial")
    public String generateFinancialReport(@RequestParam Map<String, String> params) {
        // 获取财务报表模板并自定义
        ReportConfiguration config = reportFactory.createFromTemplate("financial");
        
        // 根据请求参数自定义报表配置
        if (params.containsKey("dateRange")) {
            config.setDateRange(params.get("dateRange"));
        }
        
        // 使用配置生成报表...
        return "Financial report generated with config: " + config;
    }
}
```

### 应用优势 ###

- 避免反复执行初始化代码
- 提供配置模板，方便创建预定义对象
- 减少子类数量，通过复制实现对象变异

## 适配器模式 (Adapter Pattern) ##

### 模式概述 ###

适配器模式将一个类的接口转换成客户希望的另外一个接口，使得原本由于接口不兼容而不能一起工作的类可以一起工作。

### SpringBoot应用 ###

SpringBoot中的各种适配器广泛应用于MVC框架和第三方集成中。

### 实现示例 ###

```java
// 旧的支付服务接口
public interface LegacyPaymentService {
    boolean processPayment(String accountNumber, double amount, String currency);
    String getTransactionStatus(String transactionId);
}

// 旧的支付服务实现
@Service("legacyPaymentService")
public class LegacyPaymentServiceImpl implements LegacyPaymentService {
    @Override
    public boolean processPayment(String accountNumber, double amount, String currency) {
        System.out.println("Processing payment using legacy system");
        // 旧系统的支付处理逻辑
        return true;
    }
    
    @Override
    public String getTransactionStatus(String transactionId) {
        // 旧系统获取交易状态的逻辑
        return "COMPLETED";
    }
}

// 新的支付接口
public interface ModernPaymentGateway {
    PaymentResponse pay(PaymentRequest request);
    TransactionStatus checkStatus(String reference);
}

// 支付请求和响应模型
@Data
public class PaymentRequest {
    private String customerId;
    private BigDecimal amount;
    private String currencyCode;
    private String paymentMethod;
    private Map<String, String> metadata;
}

@Data
public class PaymentResponse {
    private String referenceId;
    private boolean successful;
    private String message;
}

public enum TransactionStatus {
    PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED
}

// 适配器：将旧接口适配到新接口
@Component
public class LegacyPaymentAdapter implements ModernPaymentGateway {
    
    private final LegacyPaymentService legacyService;
    
    @Autowired
    public LegacyPaymentAdapter(LegacyPaymentService legacyService) {
        this.legacyService = legacyService;
    }
    
    @Override
    public PaymentResponse pay(PaymentRequest request) {
        // 将新的请求模型转换为旧接口参数
        boolean result = legacyService.processPayment(
                request.getCustomerId(),
                request.getAmount().doubleValue(),
                request.getCurrencyCode()
        );
        
        // 将旧接口结果转换为新的响应模型
        PaymentResponse response = new PaymentResponse();
        response.setSuccessful(result);
        response.setReferenceId(UUID.randomUUID().toString());
        response.setMessage(result ? "Payment processed successfully" : "Payment failed");
        
        return response;
    }
    
    @Override
    public TransactionStatus checkStatus(String reference) {
        // 将旧接口的状态映射为新接口的枚举
        String status = legacyService.getTransactionStatus(reference);
        
        switch (status) {
            case "COMPLETED":
                return TransactionStatus.COMPLETED;
            case "FAILED":
                return TransactionStatus.FAILED;
            case "IN_PROGRESS":
                return TransactionStatus.PROCESSING;
            default:
                return TransactionStatus.PENDING;
        }
    }
}

// 使用新接口
@Service
public class CheckoutService {
    
    private final ModernPaymentGateway paymentGateway;
    
    @Autowired
    public CheckoutService(ModernPaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }
    
    public void processCheckout(Cart cart, String customerId) {
        // 创建支付请求
        PaymentRequest request = new PaymentRequest();
        request.setCustomerId(customerId);
        request.setAmount(cart.getTotal());
        request.setCurrencyCode("USD");
        
        // 使用适配后的接口处理支付
        PaymentResponse response = paymentGateway.pay(request);
        
        if (response.isSuccessful()) {
            // 处理成功逻辑
        } else {
            // 处理失败逻辑
        }
    }
}
```

### 应用优势 ###

- 复用现有代码，避免重写
- 平滑过渡，新旧系统并行运行
- 分离客户代码和接口实现

## 装饰器模式 (Decorator Pattern) ##

### 模式概述 ###

装饰器模式动态地给一个对象添加一些额外的职责，相比生成子类更为灵活。

### SpringBoot应用 ###

SpringBoot中的@Cacheable等注解就是装饰器模式的应用，对原有方法进行增强。

### 实现示例 ###

```java
// 基础接口
public interface NotificationService {
    void send(String message, String recipient);
}

// 基础实现
@Service
@Primary
public class EmailNotificationService implements NotificationService {
    @Override
    public void send(String message, String recipient) {
        System.out.println("Sending email to " + recipient + ": " + message);
        // 实际发送邮件的逻辑
    }
}

// 装饰器基类
public abstract class NotificationDecorator implements NotificationService {
    protected NotificationService wrapped;
    
    public NotificationDecorator(NotificationService wrapped) {
        this.wrapped = wrapped;
    }
}

// 日志装饰器
@Component
public class LoggingNotificationDecorator extends NotificationDecorator {
    
    private final Logger logger = LoggerFactory.getLogger(LoggingNotificationDecorator.class);
    
    public LoggingNotificationDecorator(NotificationService wrapped) {
        super(wrapped);
    }
    
    @Override
    public void send(String message, String recipient) {
        logger.info("Sending notification to: {}", recipient);
        long startTime = System.currentTimeMillis();
        
        wrapped.send(message, recipient);
        
        long endTime = System.currentTimeMillis();
        logger.info("Notification sent in {}ms", (endTime - startTime));
    }
}

// 重试装饰器
@Component
public class RetryNotificationDecorator extends NotificationDecorator {
    
    private final Logger logger = LoggerFactory.getLogger(RetryNotificationDecorator.class);
    private final int maxRetries;
    
    public RetryNotificationDecorator(
            @Qualifier("loggingNotificationDecorator") NotificationService wrapped, 
            @Value("${notification.max-retries:3}") int maxRetries) {
        super(wrapped);
        this.maxRetries = maxRetries;
    }
    
    @Override
    public void send(String message, String recipient) {
        int attempts = 0;
        boolean sent = false;
        
        while (!sent && attempts < maxRetries) {
            try {
                attempts++;
                wrapped.send(message, recipient);
                sent = true;
            } catch (Exception e) {
                logger.warn("Failed to send notification (attempt {}): {}", 
                        attempts, e.getMessage());
                
                if (attempts >= maxRetries) {
                    logger.error("Max retries reached, giving up");
                    throw e;
                }
                
                try {
                    // 指数退避
                    Thread.sleep((long) Math.pow(2, attempts) * 100);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }
}

// 加密装饰器
@Component
public class EncryptionNotificationDecorator extends NotificationDecorator {
    
    public EncryptionNotificationDecorator(
            @Qualifier("retryNotificationDecorator") NotificationService wrapped) {
        super(wrapped);
    }
    
    @Override
    public void send(String message, String recipient) {
        String encryptedMessage = encrypt(message);
        wrapped.send(encryptedMessage, recipient);
    }
    
    private String encrypt(String message) {
        // 加密逻辑
        return "ENCRYPTED[" + message + "]";
    }
}

// 装饰器配置
@Configuration
public class NotificationConfig {
    
    @Bean
    public NotificationService loggingNotificationDecorator(
            @Qualifier("emailNotificationService") NotificationService emailService) {
        return new LoggingNotificationDecorator(emailService);
    }
    
    @Bean
    public NotificationService retryNotificationDecorator(
            @Qualifier("loggingNotificationDecorator") NotificationService loggingDecorator,
            @Value("${notification.max-retries:3}") int maxRetries) {
        return new RetryNotificationDecorator(loggingDecorator, maxRetries);
    }
    
    @Bean
    public NotificationService encryptionNotificationDecorator(
            @Qualifier("retryNotificationDecorator") NotificationService retryDecorator) {
        return new EncryptionNotificationDecorator(retryDecorator);
    }
    
    @Bean
    @Primary
    public NotificationService notificationService(
            @Qualifier("encryptionNotificationDecorator") NotificationService encryptionDecorator) {
        return encryptionDecorator;
    }
}

// 使用装饰后的服务
@Service
public class UserService {
    
    private final NotificationService notificationService;
    
    @Autowired
    public UserService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    public void notifyUser(User user, String message) {
        // 这里使用的是经过多层装饰的服务：加密->重试->日志->邮件
        notificationService.send(message, user.getEmail());
    }
}
```

### 应用优势 ###

- 动态添加功能，保持接口一致
- 符合开闭原则，无需修改原有代码
- 可按需组合多种增强能力

## 观察者模式 (Observer Pattern) ##

### 模式概述 ###

观察者模式定义了对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都会得到通知并自动更新。

### SpringBoot应用 ###

SpringBoot中的事件机制是观察者模式的典型应用，如ApplicationEvent和ApplicationListener。

### 实现示例 ###

```java
// 自定义事件
public class UserRegisteredEvent extends ApplicationEvent {
    
    private final User user;
    
    public UserRegisteredEvent(Object source, User user) {
        super(source);
        this.user = user;
    }
    
    public User getUser() {
        return user;
    }
}

// 事件发布者
@Service
public class UserRegistrationService {
    
    private final ApplicationEventPublisher eventPublisher;
    private final UserRepository userRepository;
    
    @Autowired
    public UserRegistrationService(
            ApplicationEventPublisher eventPublisher,
            UserRepository userRepository) {
        this.eventPublisher = eventPublisher;
        this.userRepository = userRepository;
    }
    
    @Transactional
    public User registerUser(UserRegistrationDto registrationDto) {
        // 创建并保存用户
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        user.setPassword(encodePassword(registrationDto.getPassword()));
        user.setRegistrationDate(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        // 发布用户注册事件
        eventPublisher.publishEvent(new UserRegisteredEvent(this, savedUser));
        
        return savedUser;
    }
    
    private String encodePassword(String password) {
        // 密码加密逻辑
        return "{bcrypt}" + password;
    }
}

// 事件监听器 - 发送欢迎邮件
@Component
public class WelcomeEmailListener implements ApplicationListener<UserRegisteredEvent> {
    
    private final EmailService emailService;
    
    @Autowired
    public WelcomeEmailListener(EmailService emailService) {
        this.emailService = emailService;
    }
    
    @Override
    public void onApplicationEvent(UserRegisteredEvent event) {
        User user = event.getUser();
        
        // 发送欢迎邮件
        emailService.sendWelcomeEmail(user);
    }
}

// 事件监听器 - 创建用户资料
@Component
public class UserProfileInitializer implements ApplicationListener<UserRegisteredEvent> {
    
    private final ProfileService profileService;
    
    @Autowired
    public UserProfileInitializer(ProfileService profileService) {
        this.profileService = profileService;
    }
    
    @Override
    public void onApplicationEvent(UserRegisteredEvent event) {
        User user = event.getUser();
        
        // 创建用户资料
        profileService.createInitialProfile(user);
    }
}

// 使用注解方式的事件监听器
@Component
public class MarketingSubscriptionHandler {
    
    private final MarketingService marketingService;
    
    @Autowired
    public MarketingSubscriptionHandler(MarketingService marketingService) {
        this.marketingService = marketingService;
    }
    
    @EventListener
    @Async
    public void handleUserRegistered(UserRegisteredEvent event) {
        User user = event.getUser();
        
        // 添加到营销列表
        marketingService.addUserToDefaultNewsletters(user);
    }
}

// 异步事件配置
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("EventHandler-");
        executor.initialize();
        return executor;
    }
}
```

### 应用优势 ###

- 松耦合，事件发布者无需知道谁在监听
- 支持一对多通知
- 可实现异步处理和事件分发
- 便于扩展新的监听者

## 策略模式 (Strategy Pattern) ##

### 模式概述 ###

策略模式定义了一系列算法，并将每一个算法封装起来，使它们可以相互替换，让算法的变化独立于使用它的客户。

### SpringBoot应用 ###

策略模式广泛用于SpringBoot中的各种可配置策略，如缓存策略、认证策略等。

### 实现示例 ###

```java
// 折扣策略接口
public interface DiscountStrategy {
    BigDecimal applyDiscount(BigDecimal amount, User user);
    boolean isApplicable(User user, ShoppingCart cart);
}

// 新用户折扣策略
@Component
public class NewUserDiscountStrategy implements DiscountStrategy {
    
    @Value("${discount.new-user.percentage:10}")
    private int discountPercentage;
    
    @Override
    public BigDecimal applyDiscount(BigDecimal amount, User user) {
        BigDecimal discountFactor = BigDecimal.valueOf(discountPercentage)
                .divide(BigDecimal.valueOf(100));
        BigDecimal discount = amount.multiply(discountFactor);
        return amount.subtract(discount);
    }
    
    @Override
    public boolean isApplicable(User user, ShoppingCart cart) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return user.getRegistrationDate().isAfter(thirtyDaysAgo);
    }
}

// 会员折扣策略
@Component
public class PremiumMemberDiscountStrategy implements DiscountStrategy {
    
    @Value("${discount.premium-member.percentage:15}")
    private int discountPercentage;
    
    @Override
    public BigDecimal applyDiscount(BigDecimal amount, User user) {
        BigDecimal discountFactor = BigDecimal.valueOf(discountPercentage)
                .divide(BigDecimal.valueOf(100));
        BigDecimal discount = amount.multiply(discountFactor);
        return amount.subtract(discount);
    }
    
    @Override
    public boolean isApplicable(User user, ShoppingCart cart) {
        return "PREMIUM".equals(user.getMembershipLevel());
    }
}

// 大订单折扣策略
@Component
public class LargeOrderDiscountStrategy implements DiscountStrategy {
    
    @Value("${discount.large-order.threshold:1000}")
    private BigDecimal threshold;
    
    @Value("${discount.large-order.percentage:5}")
    private int discountPercentage;
    
    @Override
    public BigDecimal applyDiscount(BigDecimal amount, User user) {
        BigDecimal discountFactor = BigDecimal.valueOf(discountPercentage)
                .divide(BigDecimal.valueOf(100));
        BigDecimal discount = amount.multiply(discountFactor);
        return amount.subtract(discount);
    }
    
    @Override
    public boolean isApplicable(User user, ShoppingCart cart) {
        return cart.getTotalAmount().compareTo(threshold) >= 0;
    }
}

// 策略上下文
@Service
public class DiscountService {
    
    private final List<DiscountStrategy> discountStrategies;
    
    @Autowired
    public DiscountService(List<DiscountStrategy> discountStrategies) {
        this.discountStrategies = discountStrategies;
    }
    
    public BigDecimal calculateDiscountedAmount(BigDecimal originalAmount, User user, ShoppingCart cart) {
        // 查找最佳折扣策略
        DiscountStrategy bestStrategy = findBestDiscountStrategy(user, cart);
        
        if (bestStrategy != null) {
            return bestStrategy.applyDiscount(originalAmount, user);
        }
        
        // 无可用折扣
        return originalAmount;
    }
    
    private DiscountStrategy findBestDiscountStrategy(User user, ShoppingCart cart) {
        BigDecimal originalAmount = cart.getTotalAmount();
        BigDecimal bestDiscount = BigDecimal.ZERO;
        DiscountStrategy bestStrategy = null;
        
        for (DiscountStrategy strategy : discountStrategies) {
            if (strategy.isApplicable(user, cart)) {
                BigDecimal discountedAmount = strategy.applyDiscount(originalAmount, user);
                BigDecimal discount = originalAmount.subtract(discountedAmount);
                
                if (discount.compareTo(bestDiscount) > 0) {
                    bestDiscount = discount;
                    bestStrategy = strategy;
                }
            }
        }
        
        return bestStrategy;
    }
}
```

### 应用优势 ###

- 算法可以独立于使用它的客户而变化
- 消除条件判断语句
- 易于扩展新的策略
- 提高代码复用性

## 模板方法模式 (Template Method Pattern) ##

### 模式概述 ###

模板方法模式定义了一个算法的骨架，将一些步骤延迟到子类中实现，使子类可以不改变算法结构的情况下重定义算法的某些步骤。

### SpringBoot应用 ###

SpringBoot中的JdbcTemplate、RestTemplate等都是模板方法模式的应用。

### 实现示例 ###

```java
// 抽象导出处理器
@Component
public abstract class AbstractReportExporter {
    
    // 模板方法定义了算法的骨架
    public final void exportReport(ReportRequest request, OutputStream output) {
        try {
            // 1. 验证请求
            validateRequest(request);
            
            // 2. 获取数据
            ReportData data = fetchData(request);
            
            // 3. 处理数据
            ReportData processedData = processData(data);
            
            // 4. 格式化数据（由子类实现）
            byte[] formattedData = formatData(processedData);
            
            // 5. 写入输出流
            output.write(formattedData);
            output.flush();
            
            // 6. 记录导出操作
            logExport(request, processedData);
            
        } catch (Exception e) {
            handleExportError(e, request);
        }
    }
    
    // 默认实现的方法
    protected void validateRequest(ReportRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Report request cannot be null");
        }
        
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
    }
    
    // 抽象方法，必须由子类实现
    protected abstract ReportData fetchData(ReportRequest request);
    
    // 钩子方法，子类可以选择性覆盖
    protected ReportData processData(ReportData data) {
        // 默认实现：不做任何处理
        return data;
    }
    
    // 抽象方法，必须由子类实现
    protected abstract byte[] formatData(ReportData data) throws IOException;
    
    // 默认实现的方法
    protected void logExport(ReportRequest request, ReportData data) {
        System.out.println("Report exported for period: " + 
                request.getStartDate() + " to " + request.getEndDate() + 
                ", records: " + data.getRecords().size());
    }
    
    // 默认实现的方法
    protected void handleExportError(Exception e, ReportRequest request) {
        System.err.println("Error exporting report: " + e.getMessage());
        throw new ReportExportException("Failed to export report", e);
    }
}

// PDF导出器实现
@Component("pdfExporter")
public class PdfReportExporter extends AbstractReportExporter {
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Override
    protected ReportData fetchData(ReportRequest request) {
        // 从数据库获取报表数据
        List<ReportRecord> records = reportRepository.findByDateRange(
                request.getStartDate(), request.getEndDate());
        
        return new ReportData(records, request.getStartDate(), request.getEndDate());
    }
    
    @Override
    protected ReportData processData(ReportData data) {
        // 处理数据，如排序、分组、计算统计值等
        List<ReportRecord> processedRecords = data.getRecords().stream()
                .sorted(Comparator.comparing(ReportRecord::getDate))
                .collect(Collectors.toList());
        
        return new ReportData(processedRecords, data.getStartDate(), data.getEndDate());
    }
    
    @Override
    protected byte[] formatData(ReportData data) throws IOException {
        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        try {
            PdfWriter.getInstance(document, baos);
            document.open();
            
            // 添加标题
            document.add(new Paragraph("Report from " + 
                    data.getStartDate() + " to " + data.getEndDate()));
            
            // 创建表格
            PdfPTable table = new PdfPTable(3);
            table.addCell("Date");
            table.addCell("Description");
            table.addCell("Amount");
            
            // 添加数据行
            for (ReportRecord record : data.getRecords()) {
                table.addCell(record.getDate().toString());
                table.addCell(record.getDescription());
                table.addCell(record.getAmount().toString());
            }
            
            document.add(table);
            
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }
        
        return baos.toByteArray();
    }
}

// Excel导出器实现
@Component("excelExporter")
public class ExcelReportExporter extends AbstractReportExporter {
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Override
    protected ReportData fetchData(ReportRequest request) {
        // 从数据库获取报表数据
        List<ReportRecord> records = reportRepository.findByDateRange(
                request.getStartDate(), request.getEndDate());
        
        return new ReportData(records, request.getStartDate(), request.getEndDate());
    }
    
    @Override
    protected byte[] formatData(ReportData data) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        try {
            Sheet sheet = workbook.createSheet("Report");
            
            // 创建标题行
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Date");
            headerRow.createCell(1).setCellValue("Description");
            headerRow.createCell(2).setCellValue("Amount");
            
            // 添加数据行
            int rowNum = 1;
            for (ReportRecord record : data.getRecords()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(record.getDate().toString());
                row.createCell(1).setCellValue(record.getDescription());
                row.createCell(2).setCellValue(record.getAmount().doubleValue());
            }
            
            // 调整列宽
            for (int i = 0; i < 3; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(baos);
            
        } finally {
            workbook.close();
        }
        
        return baos.toByteArray();
    }
}

// 使用模板方法模式
@RestController
@RequestMapping("/reports")
public class ReportController {
    
    @Autowired
    @Qualifier("pdfExporter")
    private AbstractReportExporter pdfExporter;
    
    @Autowired
    @Qualifier("excelExporter")
    private AbstractReportExporter excelExporter;
    
    @GetMapping(value = "/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public void exportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletResponse response) throws IOException {
        
        response.setHeader("Content-Disposition", "attachment; filename=report.pdf");
        
        ReportRequest request = new ReportRequest();
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        
        pdfExporter.exportReport(request, response.getOutputStream());
    }
    
    @GetMapping(value = "/export/excel", 
            produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public void exportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletResponse response) throws IOException {
        
        response.setHeader("Content-Disposition", "attachment; filename=report.xlsx");
        
        ReportRequest request = new ReportRequest();
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        
        excelExporter.exportReport(request, response.getOutputStream());
    }
}
```

### 应用优势 ###

- 封装不变部分，扩展可变部分
- 提取公共代码，减少重复
- 控制子类扩展点
- 遵循好莱坞原则："别调用我们，我们会调用你"

## 责任链模式 (Chain of Responsibility Pattern) ##

### 模式概述 ###

责任链模式为请求创建了一个接收者对象的链，请求会沿着这条链传递，直到有一个对象处理它为止。

### SpringBoot应用 ###

SpringBoot中的Filter链就是责任链模式的应用，多个Filter依次处理请求。

### 实现示例 ###

```java
// 抽象处理器
public abstract class PaymentHandler {
    
    protected PaymentHandler nextHandler;
    
    public void setNext(PaymentHandler handler) {
        this.nextHandler = handler;
    }
    
    public abstract PaymentResponse handle(PaymentRequest request);
}

// 验证处理器
@Component
public class ValidationHandler extends PaymentHandler {
    
    @Override
    public PaymentResponse handle(PaymentRequest request) {
        // 验证支付请求
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return new PaymentResponse(false, "Payment amount must be greater than zero");
        }
        
        if (request.getCardNumber() == null || request.getCardNumber().isEmpty()) {
            return new PaymentResponse(false, "Card number is required");
        }
        
        if (request.getCardNumber().length() < 13 || request.getCardNumber().length() > 19) {
            return new PaymentResponse(false, "Invalid card number length");
        }
        
        if (request.getExpiryDate() == null) {
            return new PaymentResponse(false, "Expiry date is required");
        }
        
        if (request.getExpiryDate().isBefore(YearMonth.now())) {
            return new PaymentResponse(false, "Card has expired");
        }
        
        // 验证通过，继续下一个处理器
        if (nextHandler != null) {
            return nextHandler.handle(request);
        }
        
        return new PaymentResponse(true, "Validation successful");
    }
}

// 欺诈检测处理器
@Component
public class FraudDetectionHandler extends PaymentHandler {
    
    @Autowired
    private FraudDetectionService fraudService;
    
    @Override
    public PaymentResponse handle(PaymentRequest request) {
        // 检查是否存在欺诈风险
        FraudCheckResult checkResult = fraudService.checkForFraud(
                request.getCardNumber(), 
                request.getAmount(),
                request.getIpAddress());
        
        if (checkResult.isFraudulent()) {
            return new PaymentResponse(false, "Transaction flagged as potentially fraudulent: " + 
                    checkResult.getReason());
        }
        
        // 欺诈检查通过，继续下一个处理器
        if (nextHandler != null) {
            return nextHandler.handle(request);
        }
        
        return new PaymentResponse(true, "Fraud check passed");
    }
}

// 支付处理器
@Component
public class PaymentProcessingHandler extends PaymentHandler {
    
    @Autowired
    private PaymentGateway paymentGateway;
    
    @Override
    public PaymentResponse handle(PaymentRequest request) {
        // 实际执行支付
        PaymentGatewayResponse gatewayResponse = paymentGateway.processPayment(
                request.getCardNumber(),
                request.getExpiryDate(),
                request.getCvv(),
                request.getAmount());
        
        if (!gatewayResponse.isSuccessful()) {
            return new PaymentResponse(false, "Payment failed: " + gatewayResponse.getMessage());
        }
        
        // 支付成功，继续下一个处理器
        if (nextHandler != null) {
            PaymentResponse nextResponse = nextHandler.handle(request);
            
            // 如果下一环节失败，需要进行退款
            if (!nextResponse.isSuccess()) {
                paymentGateway.refund(gatewayResponse.getTransactionId(), request.getAmount());
                return nextResponse;
            }
            
            // 添加交易ID到响应
            nextResponse.setTransactionId(gatewayResponse.getTransactionId());
            return nextResponse;
        }
        
        return new PaymentResponse(true, "Payment processed successfully", 
                gatewayResponse.getTransactionId());
    }
}

// 通知处理器
@Component
public class NotificationHandler extends PaymentHandler {
    
    @Autowired
    private NotificationService notificationService;
    
    @Override
    public PaymentResponse handle(PaymentRequest request) {
        // 发送支付成功通知
        notificationService.sendPaymentConfirmation(
                request.getEmail(),
                request.getAmount(),
                LocalDateTime.now());
        
        // 继续下一个处理器
        if (nextHandler != null) {
            return nextHandler.handle(request);
        }
        
        return new PaymentResponse(true, "Payment completed and notification sent");
    }
}

// 责任链配置
@Configuration
public class PaymentHandlerConfig {
    
    @Bean
    public PaymentHandler paymentHandlerChain(
            ValidationHandler validationHandler,
            FraudDetectionHandler fraudDetectionHandler,
            PaymentProcessingHandler paymentProcessingHandler,
            NotificationHandler notificationHandler) {
        
        // 构建处理链
        validationHandler.setNext(fraudDetectionHandler);
        fraudDetectionHandler.setNext(paymentProcessingHandler);
        paymentProcessingHandler.setNext(notificationHandler);
        
        // 返回链的第一个处理器
        return validationHandler;
    }
}

// 支付服务
@Service
public class PaymentService {
    
    private final PaymentHandler paymentHandlerChain;
    
    @Autowired
    public PaymentService(PaymentHandler paymentHandlerChain) {
        this.paymentHandlerChain = paymentHandlerChain;
    }
    
    public PaymentResponse processPayment(PaymentRequest request) {
        // 启动责任链处理
        return paymentHandlerChain.handle(request);
    }
}
```

### 应用优势 ###

- 降低耦合度，请求发送者和接收者解耦
- 动态组合处理器，灵活调整处理流程
- 符合单一职责原则，每个处理器专注于一项任务
- 易于添加新的处理器，扩展性好

## 命令模式 (Command Pattern) ##

### 模式概述 ###

命令模式将请求封装成对象，使发出请求的责任和执行请求的责任分割开，支持请求排队、回退等功能。

### SpringBoot应用 ###

在SpringBoot应用的事件处理、任务调度中经常使用命令模式。

### 实现示例 ###

```java
// 命令接口
public interface Command {
    void execute();
    void undo();
    String getDescription();
}

// 具体命令 - 创建订单
@Component
public class CreateOrderCommand implements Command {
    
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    
    private Order createdOrder;
    private final Order orderToCreate;
    
    public CreateOrderCommand(
            OrderService orderService,
            OrderRepository orderRepository,
            Order orderToCreate) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.orderToCreate = orderToCreate;
    }
    
    @Override
    public void execute() {
        createdOrder = orderService.createOrder(orderToCreate);
    }
    
    @Override
    public void undo() {
        if (createdOrder != null) {
            orderRepository.delete(createdOrder);
            createdOrder = null;
        }
    }
    
    @Override
    public String getDescription() {
        return "Create order for customer: " + orderToCreate.getCustomerId();
    }
}

// 具体命令 - 扣减库存
@Component
public class DeductInventoryCommand implements Command {
    
    private final InventoryService inventoryService;
    
    private final Long productId;
    private final int quantity;
    private boolean executed = false;
    
    public DeductInventoryCommand(
            InventoryService inventoryService,
            Long productId,
            int quantity) {
        this.inventoryService = inventoryService;
        this.productId = productId;
        this.quantity = quantity;
    }
    
    @Override
    public void execute() {
        inventoryService.deductStock(productId, quantity);
        executed = true;
    }
    
    @Override
    public void undo() {
        if (executed) {
            inventoryService.addStock(productId, quantity);
            executed = false;
        }
    }
    
    @Override
    public String getDescription() {
        return "Deduct " + quantity + " units from product: " + productId;
    }
}

// 具体命令 - 处理支付
@Component
public class ProcessPaymentCommand implements Command {
    
    private final PaymentService paymentService;
    
    private final PaymentRequest paymentRequest;
    private String transactionId;
    
    public ProcessPaymentCommand(
            PaymentService paymentService,
            PaymentRequest paymentRequest) {
        this.paymentService = paymentService;
        this.paymentRequest = paymentRequest;
    }
    
    @Override
    public void execute() {
        PaymentResponse response = paymentService.processPayment(paymentRequest);
        
        if (!response.isSuccess()) {
            throw new PaymentFailedException(response.getMessage());
        }
        
        this.transactionId = response.getTransactionId();
    }
    
    @Override
    public void undo() {
        if (transactionId != null) {
            paymentService.refundPayment(transactionId);
            transactionId = null;
        }
    }
    
    @Override
    public String getDescription() {
        return "Process payment of " + paymentRequest.getAmount() + 
                " for order: " + paymentRequest.getOrderId();
    }
}

// 命令历史记录
@Component
public class CommandHistory {
    
    private final Deque<Command> history = new ArrayDeque<>();
    
    public void push(Command command) {
        history.push(command);
    }
    
    public Command pop() {
        return history.isEmpty() ? null : history.pop();
    }
    
    public boolean isEmpty() {
        return history.isEmpty();
    }
    
    public List<Command> getExecutedCommands() {
        return new ArrayList<>(history);
    }
}

// 命令执行器
@Service
public class CommandInvoker {
    
    private final CommandHistory history;
    private final TransactionTemplate transactionTemplate;
    
    @Autowired
    public CommandInvoker(
            CommandHistory history,
            PlatformTransactionManager transactionManager) {
        this.history = history;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }
    
    public void executeCommand(Command command) {
        transactionTemplate.execute(status -> {
            try {
                command.execute();
                history.push(command);
                return null;
            } catch (Exception e) {
                status.setRollbackOnly();
                throw e;
            }
        });
    }
    
    public void executeCommands(List<Command> commands) {
        transactionTemplate.execute(status -> {
            List<Command> executedCommands = new ArrayList<>();
            
            try {
                for (Command command : commands) {
                    command.execute();
                    executedCommands.add(command);
                }
                
                // 所有命令执行成功后添加到历史记录
                for (Command command : executedCommands) {
                    history.push(command);
                }
                
                return null;
            } catch (Exception e) {
                // 出现异常，回滚已执行的命令
                for (int i = executedCommands.size() - 1; i >= 0; i--) {
                    executedCommands.get(i).undo();
                }
                
                status.setRollbackOnly();
                throw e;
            }
        });
    }
    
    public void undoLastCommand() {
        Command command = history.pop();
        
        if (command != null) {
            transactionTemplate.execute(status -> {
                try {
                    command.undo();
                    return null;
                } catch (Exception e) {
                    status.setRollbackOnly();
                    // 撤销失败，将命令重新放回历史
                    history.push(command);
                    throw e;
                }
            });
        }
    }
}

// 订单处理服务
@Service
public class OrderProcessingService {
    
    private final CommandInvoker commandInvoker;
    private final OrderService orderService;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;
    
    @Autowired
    public OrderProcessingService(
            CommandInvoker commandInvoker,
            OrderService orderService,
            InventoryService inventoryService,
            PaymentService paymentService) {
        this.commandInvoker = commandInvoker;
        this.orderService = orderService;
        this.inventoryService = inventoryService;
        this.paymentService = paymentService;
    }
    
    public Order placeOrder(OrderRequest orderRequest) {
        // 准备订单数据
        Order order = new Order();
        order.setCustomerId(orderRequest.getCustomerId());
        order.setItems(orderRequest.getItems());
        order.setTotalAmount(calculateTotal(orderRequest.getItems()));
        
        // 创建支付请求
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setAmount(order.getTotalAmount());
        paymentRequest.setCardNumber(orderRequest.getPaymentDetails().getCardNumber());
        paymentRequest.setExpiryDate(orderRequest.getPaymentDetails().getExpiryDate());
        paymentRequest.setCvv(orderRequest.getPaymentDetails().getCvv());
        
        // 创建命令列表
        List<Command> commands = new ArrayList<>();
        
        // 1. 创建订单命令
        Command createOrderCommand = new CreateOrderCommand(orderService, orderService.getRepository(), order);
        commands.add(createOrderCommand);
        
        // 2. 扣减库存命令
        for (OrderItem item : order.getItems()) {
            Command deductInventoryCommand = new DeductInventoryCommand(
                    inventoryService, 
                    item.getProductId(), 
                    item.getQuantity());
            commands.add(deductInventoryCommand);
        }
        
        // 3. 处理支付命令
        Command processPaymentCommand = new ProcessPaymentCommand(paymentService, paymentRequest);
        commands.add(processPaymentCommand);
        
        // 执行命令序列
        commandInvoker.executeCommands(commands);
        
        return order;
    }
    
    private BigDecimal calculateTotal(List<OrderItem> items) {
        return items.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
```

### 应用优势 ###

- 请求发送者和接收者解耦
- 支持撤销操作
- 可以组合命令实现复杂操作
- 便于实现事务和日志

## 状态模式 (State Pattern) ##

### 模式概述 ###

状态模式允许对象在内部状态改变时改变它的行为，对象看起来好像修改了它的类。

### SpringBoot应用 ###

在业务流程处理、订单状态管理等场景常用状态模式。

### 实现示例 ###

```java
// 订单状态接口
public interface OrderState {
    OrderState confirm(Order order);
    OrderState pay(Order order);
    OrderState ship(Order order);
    OrderState deliver(Order order);
    OrderState cancel(Order order);
    OrderState refund(Order order);
    String getStatus();
}

// 具体状态 - 新建
@Component
public class NewOrderState implements OrderState {
    
    @Autowired
    private ConfirmedOrderState confirmedOrderState;
    
    @Autowired
    private CancelledOrderState cancelledOrderState;
    
    @Override
    public OrderState confirm(Order order) {
        // 执行确认逻辑
        order.setConfirmedAt(LocalDateTime.now());
        return confirmedOrderState;
    }
    
    @Override
    public OrderState pay(Order order) {
        throw new IllegalStateException("Cannot pay for an order that has not been confirmed");
    }
    
    @Override
    public OrderState ship(Order order) {
        throw new IllegalStateException("Cannot ship an order that has not been confirmed and paid");
    }
    
    @Override
    public OrderState deliver(Order order) {
        throw new IllegalStateException("Cannot deliver an order that has not been shipped");
    }
    
    @Override
    public OrderState cancel(Order order) {
        // 执行取消逻辑
        order.setCancelledAt(LocalDateTime.now());
        order.setCancellationReason("Cancelled by customer before confirmation");
        return cancelledOrderState;
    }
    
    @Override
    public OrderState refund(Order order) {
        throw new IllegalStateException("Cannot refund an order that has not been paid");
    }
    
    @Override
    public String getStatus() {
        return "NEW";
    }
}

// 具体状态 - 已确认
@Component
public class ConfirmedOrderState implements OrderState {
    
    @Autowired
    private PaidOrderState paidOrderState;
    
    @Autowired
    private CancelledOrderState cancelledOrderState;
    
    @Override
    public OrderState confirm(Order order) {
        throw new IllegalStateException("Order is already confirmed");
    }
    
    @Override
    public OrderState pay(Order order) {
        // 执行支付逻辑
        order.setPaidAt(LocalDateTime.now());
        return paidOrderState;
    }
    
    @Override
    public OrderState ship(Order order) {
        throw new IllegalStateException("Cannot ship an order that has not been paid");
    }
    
    @Override
    public OrderState deliver(Order order) {
        throw new IllegalStateException("Cannot deliver an order that has not been shipped");
    }
    
    @Override
    public OrderState cancel(Order order) {
        // 执行取消逻辑
        order.setCancelledAt(LocalDateTime.now());
        order.setCancellationReason("Cancelled by customer after confirmation");
        return cancelledOrderState;
    }
    
    @Override
    public OrderState refund(Order order) {
        throw new IllegalStateException("Cannot refund an order that has not been paid");
    }
    
    @Override
    public String getStatus() {
        return "CONFIRMED";
    }
}

// 具体状态 - 已支付
@Component
public class PaidOrderState implements OrderState {
    
    @Autowired
    private ShippedOrderState shippedOrderState;
    
    @Autowired
    private RefundedOrderState refundedOrderState;
    
    @Override
    public OrderState confirm(Order order) {
        throw new IllegalStateException("Order is already confirmed");
    }
    
    @Override
    public OrderState pay(Order order) {
        throw new IllegalStateException("Order is already paid");
    }
    
    @Override
    public OrderState ship(Order order) {
        // 执行发货逻辑
        order.setShippedAt(LocalDateTime.now());
        return shippedOrderState;
    }
    
    @Override
    public OrderState deliver(Order order) {
        throw new IllegalStateException("Cannot deliver an order that has not been shipped");
    }
    
    @Override
    public OrderState cancel(Order order) {
        throw new IllegalStateException("Cannot cancel an order that has been paid, please request a refund");
    }
    
    @Override
    public OrderState refund(Order order) {
        // 执行退款逻辑
        order.setRefundedAt(LocalDateTime.now());
        return refundedOrderState;
    }
    
    @Override
    public String getStatus() {
        return "PAID";
    }
}

// 更多状态类实现...

// 订单状态上下文类
@Entity
@Table(name = "orders")
@Data
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long customerId;
    
    @OneToMany(cascade = CascadeType.ALL)
    private List<OrderItem> items;
    
    private BigDecimal totalAmount;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime confirmedAt;
    
    private LocalDateTime paidAt;
    
    private LocalDateTime shippedAt;
    
    private LocalDateTime deliveredAt;
    
    private LocalDateTime cancelledAt;
    
    private String cancellationReason;
    
    private LocalDateTime refundedAt;
    
    @Transient
    private OrderState currentState;
    
    @Column(name = "status")
    private String status = "NEW";
    
    @PostLoad
    private void onLoad() {
        initState();
    }
    
    private void initState() {
        if (status == null) {
            status = "NEW";
        }
        
        switch (status) {
            case "NEW":
                currentState = SpringContextHolder.getBean(NewOrderState.class);
                break;
            case "CONFIRMED":
                currentState = SpringContextHolder.getBean(ConfirmedOrderState.class);
                break;
            case "PAID":
                currentState = SpringContextHolder.getBean(PaidOrderState.class);
                break;
            case "SHIPPED":
                currentState = SpringContextHolder.getBean(ShippedOrderState.class);
                break;
            case "DELIVERED":
                currentState = SpringContextHolder.getBean(DeliveredOrderState.class);
                break;
            case "CANCELLED":
                currentState = SpringContextHolder.getBean(CancelledOrderState.class);
                break;
            case "REFUNDED":
                currentState = SpringContextHolder.getBean(RefundedOrderState.class);
                break;
            default:
                throw new IllegalStateException("Unknown order status: " + status);
        }
    }
    
    // 状态转换方法
    public void confirm() {
        currentState = currentState.confirm(this);
        status = currentState.getStatus();
    }
    
    public void pay() {
        currentState = currentState.pay(this);
        status = currentState.getStatus();
    }
    
    public void ship() {
        currentState = currentState.ship(this);
        status = currentState.getStatus();
    }
    
    public void deliver() {
        currentState = currentState.deliver(this);
        status = currentState.getStatus();
    }
    
    public void cancel() {
        currentState = currentState.cancel(this);
        status = currentState.getStatus();
    }
    
    public void refund() {
        currentState = currentState.refund(this);
        status = currentState.getStatus();
    }
}

// 订单服务
@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private NewOrderState initialState;
    
    @Transactional
    public Order createOrder(Long customerId, List<OrderItem> items, BigDecimal totalAmount) {
        Order order = new Order();
        order.setCustomerId(customerId);
        order.setItems(items);
        order.setTotalAmount(totalAmount);
        order.setCurrentState(initialState);
        
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order confirmOrder(Long orderId) {
        Order order = findOrderById(orderId);
        order.confirm();
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order payOrder(Long orderId) {
        Order order = findOrderById(orderId);
        order.pay();
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order shipOrder(Long orderId) {
        Order order = findOrderById(orderId);
        order.ship();
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order deliverOrder(Long orderId) {
        Order order = findOrderById(orderId);
        order.deliver();
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = findOrderById(orderId);
        order.cancel();
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order refundOrder(Long orderId) {
        Order order = findOrderById(orderId);
        order.refund();
        return orderRepository.save(order);
    }
    
    private Order findOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found: " + orderId));
    }
}
```

### SpringContext持有类（用于在实体中获取Bean） ###

```java
@Component
public class SpringContextHolder implements ApplicationContextAware {
    
    private static ApplicationContext context;
    
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        context = applicationContext;
    }
    
    public static <T> T getBean(Class<T> clazz) {
        return context.getBean(clazz);
    }
    
    public static Object getBean(String name) {
        return context.getBean(name);
    }
}
```

### 应用优势 ###

- 封装状态相关行为，使代码更加清晰
- 新增状态只需要添加新类，不需要修改现有代码
- 消除条件判断语句
- 显式地表达状态转换规则

## 总结 ##

在实际开发中，这些设计模式往往不是孤立使用的，而是相互配合，共同解决复杂的业务问题。掌握这些设计模式及其应用场景，能够帮助开发者设计出更加灵活、可维护、可扩展的应用。

最后，设计模式是工具而非目的，应根据实际问题选择合适的模式，避免过度设计。合理运用设计模式，才能真正提升代码质量和开发效率。
