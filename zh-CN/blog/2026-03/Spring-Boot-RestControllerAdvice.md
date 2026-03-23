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
