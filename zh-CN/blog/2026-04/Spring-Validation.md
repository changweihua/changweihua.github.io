---
lastUpdated: true
commentabled: true
recommended: true
title: Spring 数据校验
description: Validated 与 Valid 注解全面对比与应用
date: 2026-04-28 09:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在 Java 开发中，数据校验是我们绕不开的话题。每天接触无数请求参数，你是否遇到过因缺少校验而导致的线上故障？深夜被叫醒排查问题的经历，让我明白了参数校验的重要性。Spring 框架提供的 `@Validated` 和 `@Valid` 两个注解，你真的用对了吗？

## 一、两个注解的基本介绍 ##

### `@Valid` 注解 ###

`@Valid` 注解来源于 JSR-303 规范(Bean Validation)，位于 `javax.validation.Valid` 包下，是 Java 标准的一部分。它主要用于验证 Bean 对象的属性是否符合约束条件。

```java
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @PostMapping("/users")
    public String createUser(@Valid @RequestBody User user) {
        // 业务逻辑
        return "用户创建成功";
    }
}

class User {
    @NotNull(message = "用户名不能为空")
    private String username;

    // 无参构造函数
    public User() {}

    // getter和setter
}
```

### `@Validated` 注解 ###

`@Validated` 注解是 Spring Framework 提供的，位于 `org.springframework.validation.annotation` 包下，是 Spring 对 JSR-303 规范的扩展，提供了分组验证、类级验证等增强功能。

```java
import org.springframework.validation.annotation.Validated;
import javax.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated // 类级别的验证
public class ProductController {

    @PostMapping("/products")
    public String createProduct(@Validated @RequestBody Product product) {
        // 业务逻辑
        return "产品创建成功";
    }
}

class Product {
    @NotNull(message = "产品名称不能为空")
    private String name;

    // 无参构造函数
    public Product() {}

    // getter和setter
}
```

## 二、两者的核心区别 ##

```mermaid
graph TB
    A[Bean Validation] --&gt; B[&quot;@Valid&quot;]
    C[Spring Framework] --&gt; D[&quot;@Validated&quot;]

    subgraph 功能对比
    B --&gt; E[原生不支持分组验证]
    B --&gt; F[支持嵌套验证]
    B --&gt; G[用于字段/方法参数/返回值]

    D --&gt; H[支持分组验证]
    D --&gt; I[&quot;需结合@Valid实现嵌套验证&quot;]
    D --&gt; J[用于类/方法参数/方法]
    end
```

### 规范来源不同 ###

- `@Valid`: JSR-303(Bean Validation)规范的产物，是 Java EE 标准的一部分
- `@Validated`: Spring 自家的产物，对 JSR-303 的扩展实现

### 分组验证能力 ###

`@Valid` 属于 JSR-303 规范，其关联的约束注解支持 `groups` 参数，但 JSR-303 原生未提供类级分组验证的声明方式。而 `@Validated` 作为 Spring 扩展，允许在类或方法上统一指定分组，简化分组验证的使用。

在实际开发中，同一个对象在不同的业务场景下可能有不同的验证规则。比如，创建用户时密码必填，而更新用户信息时密码可以为空。

下面是一个使用 `@Validated` 实现分组验证的例子：

```java
// 定义分组接口
public interface Create {}
public interface Update {}
// 分组继承示例
public interface SuperAdmin extends Create, Update {} // 超级管理员继承创建和更新权限

// 实体类
public class User {
    private Long id;

    @NotBlank(groups = {Create.class, Update.class}, message = "用户名不能为空")
    private String username;

    @NotBlank(groups = Create.class, message = "创建时密码不能为空")
    @Size(min = 6, max = 20, groups = Create.class, message = "密码长度必须在6-20之间")
    private String password;

    // 无参构造函数
    public User() {}

    // getter和setter
}

// 控制器
@RestController
public class UserController {

    @PostMapping("/users")
    public String createUser(@Validated(Create.class) @RequestBody User user) {
        // 创建用户逻辑
        return "用户创建成功";
    }

    @PutMapping("/users/{id}")
    public String updateUser(@PathVariable Long id,
                            @Validated(Update.class) @RequestBody User user) {
        // 更新用户逻辑
        return "用户更新成功";
    }

    @PutMapping("/users/admin/{id}")
    public String adminUpdateUser(@PathVariable Long id,
                                 @Validated(SuperAdmin.class) @RequestBody User user) {
        // SuperAdmin组会触发Create和Update组的所有验证
        return "管理员更新用户成功";
    }
}
```

### 使用位置的区别 ###

- `@Valid`:

  - 可用在方法参数、字段、构造函数参数、方法返回值上
  - 主要用于对象属性的验证

- `@Validated`:

  - 可用在类型、方法参数、方法上，不能用在字段上
  - 可用在类上为整个类的所有方法开启验证功能
  - 支持对方法参数和返回值的验证，并允许在类或方法上声明分组规则

### 嵌套验证的支持 ###

无论是 `@Valid` 还是 `@Validated`，嵌套对象的验证必须通过在父对象的字段上添加 `@Valid` 注解（JSR-303 规范要求）。`@Validated` 本身不影响嵌套验证，只是它作为 Spring 扩展，需依赖 JSR-303 的 `@Valid` 来触发级联验证。

多层嵌套验证示例：

```java
public class Order {
    @NotNull(message = "订单号不能为空")
    private String orderNo;

    @Valid // 第一层嵌套验证
    @NotNull(message = "用户信息不能为空")
    private User user;

    @Valid // 第一层嵌套验证
    private List<OrderItem> items;

    // 无参构造函数
    public Order() {}

    // getter和setter
}

public class User {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @Valid // 第二层嵌套验证
    private Address address;

    // 无参构造函数
    public User() {}

    // getter和setter
}

public class Address {
    @NotBlank(message = "省份不能为空")
    private String province;

    @NotBlank(message = "城市不能为空")
    private String city;

    // 无参构造函数
    public Address() {}

    // getter和setter
}

public class OrderItem {
    @NotBlank(message = "商品名称不能为空")
    private String productName;

    @Min(value = 1, message = "商品数量必须大于0")
    private Integer quantity;

    // 无参构造函数
    public OrderItem() {}

    // getter和setter
}

@RestController
public class OrderController {
    @PostMapping("/orders")
    public String createOrder(@Validated @RequestBody Order order) {
        // 所有嵌套对象都会被验证，包括：
        // 1. Order->User->Address（多层嵌套）
        // 2. Order->List<OrderItem>（集合嵌套）
        return "订单创建成功";
    }
}
```

## 三、原理剖析 ##

### 实现机制差异 ###

`@Valid` 的实现原理：

  - 依赖 JSR-303 的 `ValidatorFactory` 和 `Validator` 接口
  - 实际验证由 Hibernate Validator 等第三方实现提供
  - 在 Spring MVC 中，通过 `LocalValidatorFactoryBean` 集成到请求处理流程

- `@Validated` 的实现原理：

  - 是 Spring 的 `@AspectJ` 切面实现
  - 通过 `MethodValidationInterceptor` 拦截方法调用
  - 继承了 `@Valid` 的验证能力，并添加了分组验证的支持
  - 用于控制器时，行为与 `@Valid` 类似；用于 Service 层时，通过 `AOP` 拦截实现验证

### 异常处理差异 ###

不同验证方式触发的异常类型：

- `@Valid` 结合 Spring MVC：参数验证失败会抛出 `MethodArgumentNotValidException`
- 直接使用 `Validator` 工具类：验证对象时，抛出 `ConstraintViolationException`
- `@Validated` 在 Service 层：方法参数验证失败抛出 `ConstraintViolationException`
- `@Validated` 在控制器参数：与 `@Valid` 行为一致，抛出 `MethodArgumentNotValidException`

### 验证框架配置定制 ###

Spring Boot 默认使用 Hibernate Validator 作为 JSR-303 实现。如果你使用的是普通的 Spring 项目，需要添加以下依赖：

```xml
<!-- Maven依赖 -->
<dependency>
    <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>6.2.0.Final</version>
</dependency>
```

自定义验证器配置示例：

```java
@Configuration
public class ValidationConfig {

    @Bean
    public LocalValidatorFactoryBean validator() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        // 自定义消息源，用于国际化
        validator.setValidationMessageSource(messageSource());
        // 自定义参数
        validator.getValidationPropertyMap().put("hibernate.validator.fail_fast", "true");
        return validator;
    }

    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource =
            new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:messages");
        messageSource.setDefaultEncoding("UTF-8");
        return messageSource;
    }
}
```

## 四、请求处理与验证流程 ##

下面的图展示了 Spring MVC 中请求处理和验证的流程：

```mermaid
sequenceDiagram
    Client-&gt;&gt;Controller: 发送请求
    Controller-&gt;&gt;Validator: @Valid/@Validated标记的参数
    Validator-&gt;&gt;Controller: 验证结果
    alt 验证通过
        Controller-&gt;&gt;Service: 处理业务逻辑
        Service-&gt;&gt;Controller: 返回结果
        Controller-&gt;&gt;Client: 返回成功响应
    else 验证失败
        Controller-&gt;&gt;ExceptionHandler: 抛出验证异常
        ExceptionHandler-&gt;&gt;Client: 返回验证错误信息(400 Bad Request)
    end
```

## 五、实战案例：分组验证详解 ##

分组验证是 `@Validated` 的强大功能，让我们看一个完整的例子，展示如何在不同场景下应用不同的验证规则：

```java
// 分组接口定义
public interface Insert {}
public interface Update {}
public interface Query {}

// 分组顺序定义示例
@GroupSequence({Insert.class, Default.class})
public interface OrderedInsert {} // 先验证Insert组，再验证Default组

// 实体类
public class Product {
    @Null(groups = Insert.class, message = "新增产品时ID必须为空")
    @NotNull(groups = {Update.class, Query.class}, message = "ID不能为空")
    private Long id;

    @NotBlank(groups = {Insert.class, Update.class}, message = "产品名称不能为空")
    private String name;

    @NotNull(groups = {Insert.class, Update.class}, message = "价格不能为空")
    @DecimalMin(value = "0.01", groups = {Insert.class, Update.class}, message = "价格必须大于0")
    private BigDecimal price;

    @NotBlank(groups = Insert.class, message = "新增时必须指定分类")
    private String category;

    // 无参构造函数
    public Product() {}

    // getter和setter
}

// 控制器
@RestController
@RequestMapping("/products")
public class ProductController {

    @PostMapping
    public String createProduct(@Validated(Insert.class) @RequestBody Product product) {
        // 创建产品逻辑
        return "产品创建成功";
    }

    @PostMapping("/ordered")
    public String createProductWithOrder(@Validated(OrderedInsert.class) @RequestBody Product product) {
        // 按顺序验证：先Insert组再Default组
        return "产品创建成功";
    }

    @PutMapping("/{id}")
    public String updateProduct(@PathVariable Long id,
                              @Validated(Update.class) @RequestBody Product product) {
        if (!id.equals(product.getId())) {
            throw new IllegalArgumentException("路径ID与请求体ID不匹配");
        }
        // 更新产品逻辑
        return "产品更新成功";
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable @Validated(Query.class) Long id) {
        // 路径参数验证需显式使用@Validated，@Valid对路径参数支持较弱
        // 查询产品逻辑
        return new Product(); // 示例返回
    }
}
```

分组验证的流程如下：

```mermaid
graph LR
    A[请求] --&gt; B{验证分组?}
    B --&gt;|未指定分组| N[仅验证Default组]
    B --&gt;|Insert组| C[验证创建相关字段]
    B --&gt;|Update组| D[验证更新相关字段]
    B --&gt;|Query组| E[验证查询相关字段]
    B --&gt;|SuperAdmin组| M[验证Create+Update组的所有约束]
    B --&gt;|OrderedInsert组| O[按顺序验证Insert组再验证Default组]
    N --&gt; F[处理业务逻辑]
    C --&gt; F
    D --&gt; F
    E --&gt; F
    M --&gt; F
    O --&gt; F
    F --&gt; G[返回结果]
```

## 六、实战案例：嵌套验证和方法级验证 ##

### 嵌套验证 ###

```java
public class Department {
    @NotBlank(message = "部门名称不能为空")
    private String name;

    @Valid // 注意这里必须使用@Valid，与外层是否使用@Validated无关
    @NotEmpty(message = "部门必须至少有一名员工")
    private List<Employee> employees;

    // 无参构造函数
    public Department() {}

    // getter和setter
}

public class Employee {
    @NotBlank(message = "员工姓名不能为空")
    private String name;

    @NotNull(message = "员工年龄不能为空")
    @Min(value = 18, message = "员工年龄必须大于等于18岁")
    private Integer age;

    // 无参构造函数
    public Employee() {}

    // getter和setter
}

@RestController
public class DepartmentController {

    @PostMapping("/departments")
    public String createDepartment(@Validated @RequestBody Department department) {
        // 即使使用@Validated，嵌套的List<Employee>验证也会生效，因为Department类中使用了@Valid
        return "部门创建成功";
    }
}
```

### 方法级验证 ###

方法级验证需要在类上添加 `@Validated` 注解，并在配置类中启用方法验证：

```java
// 配置类启用方法级验证
@Configuration
@EnableMethodValidation // 开启方法级验证
@EnableAspectJAutoProxy(exposeProxy = true) // 关键：暴露AOP代理对象，解决自我调用问题
public class AppConfig {}

// Service类使用验证
@Service
@Validated
public class UserService {

    public User findById(@NotNull(message = "ID不能为空") Long id) {
        // 查询用户逻辑
        return new User();
    }

    public void updateUsername(
            @NotNull(message = "用户ID不能为空") Long userId,
            @NotBlank(message = "用户名不能为空") String username) {
        // 更新用户名逻辑
    }

    @NotNull(message = "返回结果不能为空")
    public List<User> findAll() {
        // 返回值验证由Hibernate Validator等JSR-303实现支持
        // Spring通过AOP拦截方法调用，检查返回值
        return new ArrayList<>();
    }

    // 注意：以下情况AOP验证会失效
    public void processUser(Long userId) {
        // ⚠️ 自我调用问题：此处直接调用同类方法，AOP不会拦截
        updateUsername(userId, "newName"); // 验证会被跳过！

        // ✅ 正确方式：通过代理对象调用
        ((UserService) AopContext.currentProxy()).updateUsername(userId, "newName");
    }
}
```

## 七、常见问题与解决方案 ##

### 验证失败如何优雅处理？ ###

使用全局异常处理器捕获验证异常并返回友好信息，始终使用 HTTP 400 状态码表示客户端请求问题：

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        // 统一返回400状态码，表示客户端请求有误
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraintViolation(
            ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String propertyPath = violation.getPropertyPath().toString();
            String message = violation.getMessage();
            errors.put(propertyPath, message);
        });
        // 统一返回400状态码
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}
```

### 分组验证与默认组 ###

当使用 `@Valid` 时，验证会包含所有分组（包括 Default 组）。而使用 `@Validated` 时，需注意：

- 使用 `@Validated` 但不指定分组：等价于 `@Validated(Default.class)`，只验证 `Default` 组的约束
- 使用 `@Validated` 并指定分组：仅验证指定分组及其父分组的约束，默认不包含 `Default` 组

```java
public class User {
    // 属于Default分组，不指定分组时会被验证
    @NotBlank(message = "用户名不能为空")
    private String username;

    // 同时属于Default分组和Create分组
    @NotBlank(message = "密码不能为空", groups = {Default.class, Create.class})
    private String password;

    // 只属于Update分组，不指定分组时不会被验证
    @NotNull(message = "更新时ID不能为空", groups = Update.class)
    private Long id;

    // 无参构造函数
    public User() {}
}

@RestController
@Validated // 类上标注@Validated，等价于@Validated(Default.class)
public class UserController {
    // 验证所有属于Default组的约束
}
```

### 自定义校验注解 ###

有时内置的验证注解不能满足业务需求，我们可以自定义验证注解，并通过 `ConstraintValidatorContext` 自定义错误信息：

```java
// 自定义手机号码验证注解
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MobileValidator.class)
public @interface Mobile {
    String message() default "手机号码格式不正确";
    Class<?>[] groups() default {};
    // payload参数用于附加验证元数据，通常默认即可
    Class<? extends Payload>[] payload() default {};
    String region() default "CN"; // 支持不同国家/地区手机格式
}

// 实现验证逻辑
public class MobileValidator implements ConstraintValidator<Mobile, String> {

    private String region;
    private Map<String, Pattern> PATTERNS = new HashMap<>();

    {
        // 中国手机号规则
        PATTERNS.put("CN", Pattern.compile("^1[3-9]\\d{9}$"));
        // 美国手机号规则（简化）
        PATTERNS.put("US", Pattern.compile("^\\d{10}$"));
    }

    @Override
    public void initialize(Mobile annotation) {
        this.region = annotation.region();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // 空值校验由其他注解处理，如需非空校验，需结合@NotBlank/@NotNull使用
        if (value == null || value.isEmpty()) {
            return true;
        }

        Pattern pattern = PATTERNS.getOrDefault(region, PATTERNS.get("CN"));
        boolean isValid = pattern.matcher(value).matches();

        if (!isValid) {
            // 禁用默认消息
            context.disableDefaultConstraintViolation();
            // 自定义错误消息，包含更多信息
            context.buildConstraintViolationWithTemplate(
                String.format("手机号[%s]格式不符合%s地区规范", value, region))
                .addConstraintViolation();
        }

        return isValid;
    }
}

// 使用自定义注解
public class User {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "手机号不能为空")
    @Mobile(message = "手机号码格式不正确", region = "CN") // 指定区域验证规则
    private String mobile;

    // getter和setter
}
```

## 八、最佳实践 ##

根据不同场景选择合适的验证方式：

### 控制器参数校验 ###

- 简单场景：使用 `@Valid` 标注参数即可
- 需要分组验证：使用 `@Validated` 并指定分组，如 `@Validated(Create.class)`
- 接收多个参数时：在控制器类上添加 `@Validated`，并在每个参数上添加约束注解
- 路径参数验证：优先使用 `@Validated`，对 `@PathVariable` 参数的支持更好

### 嵌套对象验证 ###

- 无论外层使用 `@Valid` 还是 `@Validated`，嵌套字段必须添加 `@Valid` 注解
- 复杂嵌套（多层嵌套或集合嵌套）中，每一层的嵌套字段都需要添加 `@Valid`

### Service 层验证 ###

- 在 Service 类上添加 `@Validated` 注解
- 在方法参数上直接添加验证约束，如 `@NotNull`、`@Size`等
- 在配置类中启用方法验证：`@EnableMethodValidation`
- 使用 `@Validated(Group.class)` 在方法上指定验证分组
- 避免方法内部自我调用（会导致 AOP 验证失效），必须通过 `@EnableAspectJAutoProxy(exposeProxy = true)` 配置并使用 `AopContext.currentProxy()` 获取代理对象

### 典型应用场景对比 ###

| 场景 | `@Valid` | `@Validated` |
| :--- | :--- | :--- |
| 简单参数校验 | 推荐（直接标注在参数上） | 也可使用，但略冗余 |
| 分组验证（如增删改不同规则） | 需手动在每个参数的约束中指定分组 | 推荐（类/方法级分组声明更简洁） |
| 嵌套对象校验 | 必须在嵌套字段加@Valid | 同样依赖@Valid触发嵌套 |
| Service 层方法参数校验 | 不支持类级声明 | 推荐（类上`@Validated`+方法参数约束） |
| 路径参数（`@PathVariable`）校验 | 支持较弱 | 推荐（支持更完善） |

## 九、总结 ##

下表总结了 `@Valid` 和 `@Validated` 的主要区别：

| 特性 | `@Valid` | `@Validated` |
| :--- | :--- | :--- |
| 来源 | JSR-303 Bean Validation | Spring Framework |
| 分组验证 | 原生不支持类级分组声明 | 支持类级/方法级分组声明 |
| 分组顺序 | 不支持顺序控制 | 支持 `@GroupSequence` 控制验证顺序 |
| 使用位置 | 方法参数、字段、构造函数参数、返回值 | 类、方法参数、方法 |
| 嵌套验证 | 原生支持（字段上添加`@Valid`） | 需结合 `@Valid` 使用 |
| 方法级验证 | 支持参数和返回值验证（JSR-303） | 支持类级验证、分组验证（Spring 扩展） |
| 默认组处理 | 验证所有约束，包括 Default 组 | 不指定分组时仅验证 Default 组 |
| 路径参数校验 | 支持有限 | 支持更完善 |
| 类级分组声明 | 不支持 | 支持 |
| 适用场景 | 简单参数验证、嵌套对象验证 | 分组验证、方法级验证、复杂业务场景 |
