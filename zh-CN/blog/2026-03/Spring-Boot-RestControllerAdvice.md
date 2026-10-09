---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot @RestControllerAdvice
description: 统一异常处理的利器
date: 2026-03-23 10:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

`@RestControllerAdvice` 是 Spring Boot 专为 RESTful 接口设计的全局增强注解，它是 `@ControllerAdvice` + `@ResponseBody` 的组合注解，核心作用是全局统一处理 Controller 层的异常、全局绑定数据、全局预处理请求参数，是企业级项目中统一接口响应、统一异常处理的标准方案。

## 一、核心作用（3大场景） ##

- 全局统一异常处理（最常用，90%的使用场景）
- 全局数据绑定（所有接口共享公共参数）
- 全局请求参数预处理（参数格式化、去空格、类型转换）

## 二、环境依赖 ##

只需引入 Spring Web 依赖（Spring Boot 项目默认已包含）：

```xml
<!-- Maven -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

## 三、最常用：全局统一异常处理（实战必用） ##

### 步骤1：定义统一响应体 ###

REST 接口需要固定返回格式，先封装通用结果类：

```java
import lombok.Data;

/**
 * 统一API响应结果
 */
@Data
public class Result<T> {
    private int code;    // 响应码
    private String msg;  // 响应消息
    private T data;      // 响应数据

    // 成功响应
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMsg("操作成功");
        result.setData(data);
        return result;
    }

    // 失败响应
    public static <T> Result<T> fail(int code, String msg) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMsg(msg);
        return result;
    }
}
```

### 步骤2：创建全局异常处理器 ###

使用 `@RestControllerAdvice` + `@ExceptionHandler` 捕获所有接口异常：

```java
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * 全局异常处理器（所有REST接口生效）
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ====================== 1. 捕获自定义业务异常 ======================
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        return Result.fail(e.getCode(), e.getMessage());
    }

    // ====================== 2. 捕获参数校验异常（@Valid） ======================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidException(MethodArgumentNotValidException e) {
        // 获取第一个校验错误信息
        String message = e.getBindingResult().getFieldError().getDefaultMessage();
        return Result.fail(400, message);
    }

    // ====================== 3. 捕获404资源不存在异常 ======================
    @ExceptionHandler(NoResourceFoundException.class)
    public Result<Void> handle404Exception() {
        return Result.fail(404, "请求资源不存在");
    }

    // ====================== 4. 捕获空指针异常 ======================
    @ExceptionHandler(NullPointerException.class)
    public Result<Void> handleNullPointerException() {
        return Result.fail(500, "系统异常：空指针错误");
    }

    // ====================== 5. 捕获所有未匹配的异常（兜底） ======================
    @ExceptionHandler(Exception.class)
    public Result<Void> handleGlobalException(Exception e) {
        e.printStackTrace(); // 打印日志
        return Result.fail(500, "服务器内部错误");
    }
}
```

### 步骤3：自定义业务异常（可选） ###

```java
import lombok.Data;

/**
 * 自定义业务异常
 */
@Data
public class BusinessException extends RuntimeException {
    private int code;
    private String msg;

    public BusinessException(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }
}
```

### 步骤4：测试接口 ###

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    // 测试业务异常
    @GetMapping("/test")
    public Result<String> test() {
        throw new BusinessException(401, "用户未登录");
    }

    // 测试空指针
    @GetMapping("/null")
    public Result<String> testNull() {
        String str = null;
        str.length();
        return Result.success("");
    }
}
```

### 效果 ###

所有接口的异常都会被统一捕获，返回*标准JSON格式*，前端无需处理各种混乱的异常响应。

## 四、精准控制生效范围（进阶） ##

默认 `@RestControllerAdvice` 对所有Controller生效，可通过属性指定生效包/类：

```java
// 1. 只对指定包下的Controller生效（推荐）
@RestControllerAdvice(basePackages = "com.example.project.controller")

// 2. 只对指定类生效
@RestControllerAdvice(assignableTypes = {UserController.class, OrderController.class})

// 3. 按类所在包生效
@RestControllerAdvice(basePackageClasses = UserController.class)
```

## 五、其他扩展用法 ##

### 全局数据绑定（所有接口共享公共数据） ###

使用 `@ModelAttribute`，所有接口都能获取到绑定的数据：

```java
@RestControllerAdvice
public class GlobalDataConfig {
    // 所有接口都能获取到 appName 字段
    @ModelAttribute("appName")
    public String appName() {
        return "SpringBoot 项目";
    }
}
```

### 全局参数预处理（格式化参数） ###

使用 `@InitBinder`，统一处理请求参数（如去空格、日期格式化）：

```java
@RestControllerAdvice
public class GlobalParamHandler {
    @InitBinder
    public void initBinder(WebDataBinder binder) {
        // 字符串参数自动去空格
        binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
    }
}
```

## 六、关键注意事项 ##

- 匹配优先级：`@ExceptionHandler` 会优先匹配精确异常，再匹配父类异常（兜底用 `Exception.class`）。

- 扫描生效：全局异常处理器必须被 Spring 扫描到（放在主启动类同级/子包下）。

- 与 `@ControllerAdvice` 区别：

  - `@RestControllerAdvice`：返回 JSON 数据（REST接口专用）；
  - `@ControllerAdvice`：返回 页面/视图（传统Web项目用）。

- 无侵入性：无需修改原有Controller代码，全局统一处理。

## 总结 ##

- `@RestControllerAdvice` 是 Spring Boot REST 接口全局增强神器，核心用于统一异常处理；
- 搭配 `@ExceptionHandler` 可捕获所有接口异常，返回标准化响应；
- 支持精准控制生效范围，无侵入、易维护，是企业级项目必备配置。


> Spring Boot异常处理：别被 `@RestControllerAdvice` “坑”了！

## 事故引入：支付异常却显示成功 ##

我正在工位上悠哉悠哉地喝着咖啡，享受着片刻的宁静。突然，手机铃声大作，打破了这份惬意。电话那头传来财务小姐姐焦急的声音：“不好啦！有用户反馈支付成功了，但钱却没到账，已经有好几个用户都这么说了！” 我心里 “咯噔” 一下，暗叫不好，赶紧打开后台日志查看。

经过一番排查，很快定位到了问题所在。原来是支付回调接口出了岔子，代码是这样写的：

```java
@PostMapping("/pay/callback")
public String handlePayCallback(@RequestBody PayRequest request) {
    payService.process(request); // 这里抛了异常！
    return "success"; // 但前端收到这个！
}
```

从代码里可以看出，`payService.process(request)` 这行代码抛出了异常，可由于使用了  `@RestControllerAdvice` 全局捕获异常，返回给前端的竟然是 “success”，支付平台也以为支付成功了，结果用户被扣了钱，订单却没生成。这可真是个大乌龙！这次事故给公司带来了不小的损失，也让我深刻认识到 Spring Boot 异常处理可不能掉以轻心。今天，我就把自己总结的 3 个 Spring Boot 异常处理的隐藏陷阱分享给大家，希望能帮助大家在开发中少踩坑。

## 陷阱 1：@RestControllerAdvice 一锅端，协议不兼容 ##

### 错误示范 ###

在 Spring Boot 开发中，很多人习惯使用@RestControllerAdvice进行全局异常处理，代码类似这样：

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.error("系统繁忙");
    }
}
```

看起来很完美，所有异常都被统一处理了。但问题在于，这种 “一锅端” 的方式没有考虑到不同接口协议的特殊性。比如，支付回调接口要求失败时返回特定字符串，像支付宝回调失败需返回fail字符串；微信支付失败要返回 XML 格式，如 `<return_code>FAIL</return_code>`；邮件 Webhook 失败则需返回 HTTP 5xx 状态码 。而上述全局异常处理器统一返回 JSON 格式数据和 HTTP 200 状态码，完全不符合第三方平台要求。

### 产生后果 ###

在实际业务中，这种错误处理方式会引发严重问题。就拿开篇提到的支付回调事故来说，由于异常被全局处理器捕获后返回了 HTTP 200 和错误 JSON，支付平台误判支付成功，用户被扣钱但订单却未生成，给公司造成直接经济损失。再比如短信回调接口，如果因为异常处理不当返回错误信息，可能导致验证码失效，影响用户正常注册登录 。Webhook 接口若返回错误格式，也会导致数据传输异常，影响业务流程的正常运转。

### 解决方案 ###

为了避免这种情况，我们需要采用按路径 / 协议分治的生产级方案。针对不同类型接口，创建不同的异常处理器：

```java
// 1. 普通API异常处理器（返回JSON）
@RestControllerAdvice(basePackages = "com.example.api")
public class ApiExceptionHandler {
    @ExceptionHandler(ServiceException.class)
    public Result<?> handleServiceException(ServiceException e) {
        return Result.error(e.getCode(), e.getMessage());
    }
}

// 2. 支付回调专用处理器（返回字符串）
@RestControllerAdvice(assignableTypes = PayCallbackController.class)
public class PayCallbackExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handlePayException(Exception e) {
        log.error("支付回调异常", e);
        // 支付宝/微信要求：失败返回"fail"
        return ResponseEntity.status(200).body("fail");
    }
}

// 3. Webhook专用处理器（返回5xx）
@RestControllerAdvice(assignableTypes = WebhookController.class)
public class WebhookExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Void> handleWebhookException() {
        // 明确返回500，触发第三方重试
        return ResponseEntity.status(500).build();
    }
}
```

这里用到两个关键注解：`basePackages` 按包路径隔离，适用于对某一路径下的接口进行统一异常处理；`assignableTypes` 按 Controller 类隔离，更加精准地针对特定 Controller 处理异常 。验证时，可以用 Postman 调支付回调接口，故意传错参数，检查是否返回fail而非 JSON，以此确保异常处理器按预期工作。

## 陷阱 2：吞掉异常不记录，排查困难 ##

### 错误示范 ###

再来看第二个陷阱，捕获异常后不记录日志。很多人在处理异常时，只想着返回给前端一个友好的错误提示，却忽略了记录日志的重要性。比如这样的代码：

```java
@ExceptionHandler(BusinessException.class)
public Result<?> handleBusiness(BusinessException e) {
    // 只返回错误，不记日志！
    return Result.error(e.getMessage());
}
```

这段代码捕获了业务异常 `BusinessException`，然后直接返回错误信息给前端，没有记录任何日志。看似简单方便，实则隐藏着巨大的隐患。

### 产生后果 ###

在实际业务中，这种做法会让排查问题变得异常困难。想象一下，用户反馈 “下单失败”，但运维去查看日志时，却发现没有任何相关记录，CPU、内存、DB 全正常。最后只能靠用户截图才发现是库存不足异常。这时候老板就会灵魂拷问：“为什么没告警？为什么没日志？” 你只能哑口无言，因为异常被 “静默” 处理了。没有日志，就像在黑暗中摸索，根本不知道问题出在哪里，更别说快速解决问题了。

### 解决方案 ###

为了解决这个问题，我们需要采用分级日志 + 关键字段脱敏的生产级方案。具体代码如下：

```java
@ExceptionHandler(BusinessException.class)
public Result<?> handleBusiness(BusinessException e, HttpServletRequest request) {
    //1. 记录WARN日志（业务异常需关注）
    log.warn("业务异常 | URI:{} | User:{} | Error:{}",
            request.getRequestURI(),
            getCurrentUserId(), // 从Token解析
            e.getMessage());
    return Result.error(e.getCode(), e.getMessage());
}

@ExceptionHandler(Exception.class)
public Result<?> handleSystem(Exception e, HttpServletRequest request) {
    //2. 记录ERROR日志（系统异常需告警）
    String traceId = MDC.get("TRACE_ID"); // 链路ID
    log.error("系统异常 | TraceId:{} | URI:{} | Params:{}",
            traceId,
            request.getRequestURI(),
            maskSensitiveParams(request.getParameterMap()) // 脱敏！
            , e);
    //3. 触发告警（可选）
    alertService.send("系统异常", e.getMessage());
    return Result.error("系统繁忙，请稍后重试");
}

// 敏感参数脱敏工具
private String maskSensitiveParams(Map<String, String[]> params) {
    Map<String, String> safeParams = new HashMap<>();
    for (String key : params.keySet()) {
        if (key.contains("password") || key.contains("card")) {
            safeParams.put(key, "******");
        } else {
            safeParams.put(key, String.join(",", params.get(key)));
        }
    }
    return JsonUtil.toJson(safeParams);
}
```

这里对业务异常和系统异常进行了分级处理：业务异常记录 WARN 日志，因为业务异常通常是可预期的，如库存不足、参数错误等，只需要关注即可；系统异常记录 ERROR 日志，并触发告警，因为系统异常往往是严重的问题，如数据库连接失败、空指针异常等，需要及时处理 。同时，记录了关键信息，如用户 ID（从 Token 解析获取，用于快速定位问题用户）、链路 ID（通过 MDC 获取，用于全链路追踪），并对敏感参数进行了脱敏处理，防止密码、银行卡号等敏感信息泄露 。在实际应用中，一定要注意日志的配置，确保日志能够正确记录并保存，同时要定期清理日志，防止日志文件过大影响系统性能。

## 陷阱 3：返回码混乱，前端痛苦 ##

### 错误示范 ###

在处理异常返回码时，很多开发者没有统一的规范，导致返回码混乱不堪。比如下面这段代码：

```java
@ExceptionHandler(NotFoundException.class)
public Result<?> handleNotFound() {
    return Result.error(404, "资源未找到");
}

@ExceptionHandler(BusinessException.class)
public Result<?> handleBusiness(BusinessException e) {
    // 这里业务异常也返回404？
    return Result.error(404, e.getMessage());
}

@ExceptionHandler(AnotherException.class)
public Result<?> handleAnother() {
    // 又返回个无规则的1001
    return Result.error(1001, "其他错误");
}
```

在这个例子中，`NotFoundException` 和 `BusinessException` 都返回了 404 错误码，这显然是不合理的。而且 `AnotherException` 返回的 1001 错误码毫无规律，让人摸不着头脑。

### 产生后果 ###

返回码混乱会给前端开发带来极大的困扰。前端需要根据返回码来进行不同的处理，比如显示不同的错误提示、进行页面跳转等 。但如果返回码没有规律，前端就难以统一处理错误，增加了开发和维护的成本。更严重的是，这会影响用户体验，导致用户在使用产品时遇到问题却得不到准确的提示，降低用户对产品的信任度。

### 解决方案 ###

为了解决这个问题，我们需要制定统一的错误码规范。可以参考 HTTP 状态码的设计思路，对错误码进行分段，比如：

- 1XX：信息，一般用于临时响应，在 Web 开发中较少使用自定义此范围错误码。

- 2XX：成功，200 表示成功，这是大家最熟悉的。

- 3XX：重定向，如 301 永久重定向、302 临时重定向 ，在微服务内部调用中不常用来自定义错误码。

- 4XX：客户端错误，400 表示参数错误，401 表示未认证，403 表示禁止访问，404 表示资源未找到 。

- 5XX：服务器错误，500 表示服务器内部错误，502 表示网关错误，503 表示服务不可用 。

同时，针对业务异常，可以在 HTTP 状态码的基础上进行扩展，比如 `10001` 表示用户模块的用户不存在，`20001` 表示订单模块的订单不存在等 。

后端在返回错误时，严格按照这个规范来返回，前端就可以根据返回码进行针对性的处理。例如：

```java
// 统一错误码定义
public interface ErrorCode {
    int SUCCESS = 200;
    int BAD_REQUEST = 400;
    int UNAUTHORIZED = 401;
    int FORBIDDEN = 403;
    int NOT_FOUND = 404;
    int INTERNAL_SERVER_ERROR = 500;
    // 业务异常扩展
    int USER_NOT_FOUND = 10001;
    int ORDER_NOT_FOUND = 20001;
}

@ExceptionHandler(NotFoundException.class)
public Result<?> handleNotFound() {
    return Result.error(ErrorCode.NOT_FOUND, "资源未找到");
}

@ExceptionHandler(BusinessException.class)
public Result<?> handleBusiness(BusinessException e) {
    // 根据业务异常类型返回对应的错误码
    if (e instanceof UserNotFoundException) {
        return Result.error(ErrorCode.USER_NOT_FOUND, "用户不存在");
    } else if (e instanceof OrderNotFoundException) {
        return Result.error(ErrorCode.ORDER_NOT_FOUND, "订单不存在");
    }
    return Result.error(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage());
}
```

这样，前端只需要根据返回的错误码，就可以知道是哪类错误，从而进行相应的处理，大大提高了开发效率和用户体验。

## 总结 ##

在 Spring Boot 开发中，异常处理是保障系统稳定运行的关键环节。本文通过支付回调异常的实际案例，深入剖析了使用@RestControllerAdvice进行全局异常处理时可能遇到的 3 个隐藏陷阱：协议不兼容、吞掉异常不记录、返回码混乱 。这些陷阱看似微小，却可能引发严重的生产事故，给公司带来经济损失，影响用户体验 。

针对这些陷阱，我们提出了相应的生产级解决方案：按路径 / 协议分治处理异常，确保不同接口协议得到正确处理；采用分级日志 + 关键字段脱敏，准确记录异常信息，便于排查问题；制定统一的错误码规范，避免返回码混乱，降低前端开发难度 。
