---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 中 Validation 的使用指南
description: Spring Boot 中 Validation 的使用指南
date: 2026-03-06 13:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在 Spring Boot 中使用 Validation 可以轻松实现数据校验功能，确保应用程序接收的数据符合预期格式和业务规则。

## 完整实现方案 ##

### 添加依赖 ###

在 `pom.xml` 中添加必要的依赖：

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Validation Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

### 创建数据模型并添加校验注解 ###

```java
import javax.validation.constraints.*;

public class UserRegistrationRequest {
    
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度必须在3-20个字符之间")
    private String username;
    
    @Email(message = "邮箱格式不正确")
    @NotBlank(message = "邮箱不能为空")
    private String email;
    
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$", 
             message = "密码必须包含大小写字母和数字，且长度至少8位")
    private String password;
    
    @Min(value = 18, message = "年龄必须大于或等于18岁")
    @Max(value = 100, message = "年龄必须小于或等于100岁")
    private Integer age;
    
    @NotNull(message = "出生日期不能为空")
    @Past(message = "出生日期必须是过去的时间")
    private LocalDate birthDate;
    
    @AssertTrue(message = "必须接受条款和条件")
    private Boolean termsAccepted;
    
    // Getters and Setters
}
```

### 创建控制器并添加校验支持 ###

在Controller的方法参数上使用`@Valid`或`@Validated`注解来触发校验：

对于路径变量和请求参数的校验，需要使用`@Validated`注解在类级别

```java
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        // 业务逻辑处理
        return ResponseEntity.ok("用户注册成功");
    }
    // 对于路径变量和请求参数的校验，需要使用@Validated注解在类级别
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable @Min(1) Long id) {
        // 获取用户逻辑
        return ResponseEntity.ok(new User(id, "示例用户"));
    }
}
```

### 处理校验异常 ###

当校验失败时，Spring会抛出

- MethodArgumentNotValidException（对于请求体）
- ConstraintViolationException（对于路径变量/请求参数）。

可以通过`@RestControllerAdvice（ @ControllerAdvice + @ResponseBody）`创建全局异常处理器捕获：

```java
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;


@RestControllerAdvice("com.example.demo.controller")
public class GlobalExceptionHandler {


    /**
     * 处理请求体校验失败
     *
     * @param ex 异常
     * @return Result
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);

        });
        return ResponseEntity.badRequest().body(errors);

    }

    /**
     * 处理路径变量或请求参数校验失败
     *
     * @param ex 异常
     * @return Result
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<?> handleConstraintViolationExceptions(ConstraintViolationException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);

        });

        return ResponseEntity.badRequest().body(errors);

    }


    /**
     * 处理未知异常
     *
     * @param request 请求参数
     * @param e       异常
     * @return Result
     */
    @ExceptionHandler(value = Throwable.class)
    public ResponseEntity<?> unknownExceptionHandler(HttpServletRequest request, Throwable e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

}
```

### 常用校验注解说明 ###

|  注解   |    功能  |   示例  |
| :-----------: | :-----------: | :-----------: |
| `@NotNull` | 值不能为 null | `@NotNull(message = "字段不能为空")` |
| `@NotBlank` | 字符串不能为空且必须包含非空白字符 | `@NotBlank(message = "用户名不能为空")` |
| `@NotEmpty` | 集合/数组不能为空 | `@NotEmpty(message = "列表不能为空")` |
| `@Size` | 检查字符串/集合大小 | `@Size(min=2, max=10, message="长度2-10")` |
| `@Min` | 数字最小值 | `@Min(value=18, message="必须≥18")` |
| `@Max` | 数字最大值 | `@Max(value=100, message="必须≤100")` |
| `@Email` | 邮箱格式验证 | `@Email(message="邮箱格式无效")` |
| `@Pattern` | 正则表达式匹配 | `@Pattern(regexp="[A-Za-z]+", message="仅字母")` |
| `@Past` | 日期必须在过去 | `@Past(message="必须是过去日期")` |
| `@Future` | 日期必须在未来 | @Future(message="必须是未来日期") |
| `@AssertTrue` | 值必须为 true | `@AssertTrue(message="必须接受条款")` |
| `@AssertFalse` | 值必须为 false | `@AssertFalse(message="不能是已注册用户")` |

### 高级用法：分组校验 ###

当同一个Bean在不同场景下需要不同的校验规则时，可以使用分组校验。

定义分组接口：

```java
public interface CreateGroup {}

public interface UpdateGroup {}
```

在Bean上指定分组：

```java
public class UserDTO {

    @Null(groups = CreateGroup.class) // 创建时id必须为null

    @NotNull(groups = UpdateGroup.class) // 更新时id不能为null

    private Long id;

    @NotBlank(groups = {CreateGroup.class, UpdateGroup.class})

    private String name;

}
```

在`Controller`方法中使用`@Validated`指定分组：

```java

@PostMapping
public String createUser(@Validated(CreateGroup.class) @RequestBody UserDTO userDTO) {

// ...

}

@PutMapping
public String updateUser(@Validated(UpdateGroup.class) @RequestBody UserDTO userDTO) {

// ...

}
```

分组校验完整示例代码如下：

```java
// 定义校验分组接口
public interface CreateValidationGroup {}
public interface UpdateValidationGroup {}

public class Product {
    @Null(groups = CreateValidationGroup.class, 
           message = "ID必须为空")
    @NotNull(groups = UpdateValidationGroup.class, 
             message = "ID不能为空")
    private Long id;
    
    @NotBlank(groups = {CreateValidationGroup.class, UpdateValidationGroup.class}, 
              message = "产品名称不能为空")
    private String name;
    
    // getters and setters
}

// 在控制器中使用分组校验
@PostMapping
public ResponseEntity<String> createProduct(
        @Validated(CreateValidationGroup.class) @RequestBody Product product) {
    // 创建产品逻辑
    return ResponseEntity.ok("产品创建成功");
}

@PutMapping("/{id}")
public ResponseEntity<String> updateProduct(
        @PathVariable Long id,
        @Validated(UpdateValidationGroup.class) @RequestBody Product product) {
    // 更新产品逻辑
    return ResponseEntity.ok("产品更新成功");
}
```

### 高级用法：自定义校验器 ###

当内置注解不满足需求时，可以自定义校验注解。

#### 示例：自定义手机号校验 ####

创建自定义注解：

```java
import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PhoneNumberValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPhoneNumber {
    String message() default "无效的手机号码";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

实现校验逻辑

```java
import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {
    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // 允许为空，配合@NotBlank使用
        }
        return PHONE_PATTERN.matcher(value).matches();
    }
}
```

在模型中使用

```java
public class ContactInfo {
    @ValidPhoneNumber(message = "请输入有效的手机号码")
    private String phone;
}
```

### 高级用法：嵌套对象校验 ###

在Spring Boot Validation中，需要使用`@Valid`注解来触发嵌套对象的校验。

假设我们有一个类Order，其中包含一个Customer类型的字段，而Customer对象本身也有需要校验的字段。

以下是具体步骤：

- 定义嵌套对象（例如Customer类）并添加校验注解。

- 在包含嵌套对象的类（例如Order类）中，在嵌套对象字段上添加@Valid注解。

- 在控制器方法中，使用`@Valid`触发校验。

示例代码：

步骤1：定义嵌套对象（Customer）

```java
import javax.validation.constraints.NotBlank;

import javax.validation.constraints.Size;

public class Customer {

    @NotBlank(message = "客户名称不能为空")
    @Size(min = 2, max = 30, message = "客户名称长度必须在2到30之间")
    private String name;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    // 省略getter和setter

}
```

步骤2：定义包含嵌套对象的类（Order）

```java
import javax.validation.Valid;

import javax.validation.constraints.NotNull;

import java.math.BigDecimal;

public class Order {

    @NotNull(message = "订单号不能为空")
    private String orderId;

    @NotNull(message = "订单金额不能为空")
    @DecimalMin(value = "0.01", message = "订单金额必须大于0")
    private BigDecimal amount;

    // 关键：使用@Valid触发嵌套校验
    @Valid
    @NotNull(message = "客户信息不能为空")
    private Customer customer;

    // 省略getter和setter

}
```

步骤3：在控制器中使用

```java
import org.springframework.validation.annotation.Validated;

import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController

public class OrderController {

    @PostMapping("/orders")
    public String createOrder(@Valid @RequestBody Order order) {

        // 处理订单
        return "订单创建成功";

    }

}
```

步骤4：全局异常处理器（处理校验异常）

如果之前已经创建了全局异常处理器，它会自动处理嵌套校验的错误。例如，我们之前定义的GlobalExceptionHandler已经可以处理MethodArgumentNotValidException，它会收集所有层级的错误。

当校验失败时，返回的响应可能如下：

```json
{
    "customer.name": "客户名称不能为空",
    "customer.email": "邮箱格式不正确",
    "amount": "订单金额必须大于0"
}
```

注意：嵌套对象可以多层嵌套，只需要在每一层需要校验的对象字段上加上`@Valid`注解即可。

例如，如果Customer中还有一个Address对象需要校验：

```java
public class Customer {

    // ... 其他字段
    @Valid
    private Address address;

}
```

这样，校验就会递归到Address对象。

### 复杂嵌套场景处理 ###

#### 场景 1：集合中的嵌套对象 ####

```java
public class OrderRequest {
    // ...
    
    @Valid
    @NotEmpty(message = "至少需要一个订单项")
    private List<OrderItem> items;
}

public class OrderItem {
    @NotBlank(message = "商品ID不能为空")
    private String productId;
    
    @Min(value = 1, message = "数量至少为1")
    private Integer quantity;
    
    @DecimalMin(value = "0.01", message = "价格必须大于0")
    private BigDecimal price;
}
```

#### 场景 2：多层嵌套对象 ####

```java
public class CompanyOrder extends OrderRequest {
    @Valid
    @NotNull(message = "发票信息不能为空")
    private Invoice invoice;
}

public class Invoice {
    @NotBlank(message = "发票抬头不能为空")
    private String title;
    
    @Pattern(regexp = "\\d{15}|\\d{18}", message = "税号格式不正确")
    private String taxNumber;
    
    @Valid
    private BankAccount bankAccount;
}

public class BankAccount {
    @NotBlank(message = "开户行不能为空")
    private String bankName;
    
    @Pattern(regexp = "\\d{16,19}", message = "账号格式不正确")
    private String accountNumber;
}
```

#### 场景 3：条件性嵌套校验 ####

使用分组校验实现条件性嵌套校验：

```java
// 定义校验分组
public interface PersonalOrderGroup {}
public interface CompanyOrderGroup {}

public class OrderRequest {
    // ...
    
    @NotNull(message = "订单类型不能为空")
    private OrderType orderType;
    
    @Valid
    @NotNull(groups = PersonalOrderGroup.class, 
             message = "个人客户信息不能为空")
    private Customer personalCustomer;
    
    @Valid
    @NotNull(groups = CompanyOrderGroup.class, 
             message = "企业客户信息不能为空")
    private Company company;
}

// 在控制器中指定分组
@PostMapping("/personal")
public ResponseEntity<String> createPersonalOrder(
        @Validated(PersonalOrderGroup.class) @RequestBody OrderRequest order) {
    // 处理个人订单
}

@PostMapping("/company")
public ResponseEntity<String> createCompanyOrder(
        @Validated(CompanyOrderGroup.class) @RequestBody OrderRequest order) {
    // 处理企业订单
}
```

嵌套校验的关键是在对象字段上使用`@Valid`注解（或`@Validated`，但通常用`@Valid`），这样校验框架就会递归地校验该对象内部的约束。

## Spring Validation使用总结 ##

- 避免过度嵌套：

  - 超过3层嵌套建议重构
  - 复杂校验逻辑移到服务层

- 性能优化：

  - 避免在 `@Pattern` 中使用复杂正则表达式
  - 对于大型对象，优先在服务层进行深度校验
  - 配置Validation发现第一个错误即返回

```java
@Configuration
public class ValidationConfig {
    @Bean
    public Validator validator() {
        return Validation.byProvider(HibernateValidator.class)
                .configure()
                .failFast(true) // 发现第一个错误即返回
                .buildValidatorFactory()
                .getValidator();
    }
}
```

- 结合DTO模式：

  - 为不同API创建专用的请求DTO
  - 避免实体类污染校验注解

- 嵌套校验是Spring Validation的强大功能，合理使用可以：

  - 保持数据结构的清晰性
  - 实现复杂的校验逻辑
  - 提供精细的错误反馈
  - 减少控制器和服务层的校验代码
