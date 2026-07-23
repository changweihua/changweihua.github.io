---
lastUpdated: true
commentabled: true
recommended: true
title: 拒绝写重复代码，试试这套开源的 SpringBoot 组件，效率翻倍~
description: 拒绝写重复代码，试试这套开源的 SpringBoot 组件，效率翻倍~
date: 2026-03-09 09:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 简介 ##

Graceful Response 是一个 Spring Boot 技术栈下的优雅响应处理器，提供*一站式统一返回值封装、全局异常处理、自定义异常错误码* 等功能，使用 Graceful Response 进行 web 接口开发不仅可以节省大量的时间，还可以提高代码质量，使代码逻辑更清晰。

强烈推荐你花 3 分钟学会它！

## 快速入门 ##

### Spring Boot 接口开发现状 ###

目前，业界使用 Spring Boot 进行接口开发时，往往存在效率底下、重复劳动、可读性差等问题。以下伪代码相信大家非常熟悉，我们大部分项目的 Controller 接口都是这样的。

```java
@Controller  
public class Controller {  

    @GetMapping("/query")  
    @ResponseBody  
    public Response query(Map<String, Object> paramMap) {  
        Response res = new Response();  
        try {  
            //1.校验params参数合法性，包括非空校验、长度校验等  
            if (illegal(paramMap)) {  
                res.setCode(1);  
                res.setMsg("error");  
                return res;  
            }  
            //2.调用Service的一系列操作，得到查询结果  
            Object data = service.query(params);  
            //3.将操作结果设置到res对象中  
            res.setData(data);  
            res.setCode(0);  
            res.setMsg("ok");  
            return res;  
        } catch (Exception e) {  
            //4.异常处理：一堆丑陋的try...catch，如果有错误码的，还需要手工填充错误码  
            res.setCode(1);  
            res.setMsg("error");  
            return res;  
        }  
    }  
}
```

这段伪代码存在什么样的问题呢？

*第一个问题，效率低下。*  Controller 层的代码应该尽量简洁，上面的伪代码其实只是为了将数据查询的结果进行封装，使其以统一的格式进行返回。例如以下格式的响应体：

```json
{  
  "code": 0,  
  "msg": "ok",  
  "data": {  
    "id": 1,  
    "name": "username"  
  }  
}
```

查询过程中如果发生异常，需要在 Controller 进行手工捕获，根据捕获的异常人工地设置错误码，当然，也用同样的格式封装错误码进行返回。
可以看到，除了调用 service 层的 query 方法这一行，其他大部分的代码都执行进行结果的封装，大量的冗余、低价值的代码导致我们的开发活动效率很低。

*第二个问题，重复劳动。*  以上捕获异常、封装执行结果的操作，每个接口都会进行一次，因此造成大量重复劳动。

*第三个问题，可读性低。*  上面的核心代码被淹没在许多冗余代码中，很难阅读，如同大海捞针。

我们可以通过 Graceful Response 这个组件解决这样的问题。

### 快速入门 ###

#### 引入 Graceful Response 组件 ####

Graceful Response 已发布至 maven 中央仓库，我们可以直接引入到项目中。

maven 依赖如下：

```xml
<dependency>  
    <groupId>com.feiniaojin</groupId>  
    <artifactId>graceful-response</artifactId>  
    <version>{latest.version}</version>  
</dependency>
```

#### 启用 Graceful Response ####

在启动类中引入 `@EnableGracefulResponse` 注解，即可启用 Graceful Response 组件。

```java
@EnableGracefulResponse  
@SpringBootApplication  
public class ExampleApplication {  
    public static void main(String[] args) {  
        SpringApplication.run(ExampleApplication.class, args);  
    }  
}
```

#### Controller 层 ####

引入 Graceful Response 后，我们不需要再手工进行查询结果的封装，直接返回实际结果即可，Graceful Response 会自动完成封装的操作。
Controller 层示例如下。

```java
@Controller  
public class Controller {  
    @RequestMapping("/get")  
    @ResponseBody  
    public UserInfoView get(Long id) {  
        log.info("id={}", id);  
        return UserInfoView.builder().id(id).name("name" + id).build();  
    }  
}
```

在示例代码中，Controller 层的方法直接返回了 UserInfoView 对象，没有进行封装的操作，但经过 Graceful Response 处理后，我们还是得到了以下的响应结果。

```java
{  
  "status": {  
    "code": "0",  
    "msg": "ok"  
  },  
  "payload": {  
    "id": 1,  
    "name": "name1"  
  }  
}
```

而对于命令操作（Command）尽量不返回数据，因此 command 操作的方法的返回值应该是 void，Graceful Response 对于对于返回值类型 void 的方法，也会自动进行封装。

```java
public class Controller {  
    @RequestMapping("/command")  
    @ResponseBody  
    public void command() {  
        //业务操作  
    }  
}
```

成功调用该接口，将得到：

```json
{  
  "status": {  
    "code": "200",  
    "msg": "success"  
  },  
  "payload": {}  
}
```

#### Service 层 ####

在引入 Graceful Response 前，有的开发者在定义 Service 层的方法时，为了在接口中返回异常码，干脆直接将 Service 层方法定义为 Response，淹没了方法的正常返回值。

Response 的代码如下。

```java
//lombok注解  
@Data  
public class Response {  
    private String code;  
    private String msg;  
    private Object data;  
}
```

直接返回 Response 的 Service 层方法：

```java
/**  
 * 直接返回Reponse的Service  
 * 不规范  
 */  
public interface Service {  
    public Reponse commandMethod(Command command);  
}
```

Graceful Response 引入 `@ExceptionMapper` 注解，通过该注解将异常和错误码关联起来，这样 Service 方法就不需要再维护 Response 的响应码了，直接抛出业务异常，由 Graceful Response 进行异常和响应码的关联。

@ExceptionMapper 的用法如下。

```java
/**  
 * NotFoundException的定义，使用@ExceptionMapper注解修饰  
 * code:代表接口的异常码  
 * msg:代表接口的异常提示  
 */  
@ExceptionMapper(code = "1404", msg = "找不到对象")  
public class NotFoundException extends RuntimeException {  
  
}
```

Service 接口定义：

```java
public interface QueryService {  
    UserInfoView queryOne(Query query);  
}
```

Service 接口实现：

```java
public class QueryServiceImpl implements QueryService {  
    @Resource  
    private UserInfoMapper mapper;  
  
    public UserInfoView queryOne(Query query) {  
        UserInfo userInfo = mapper.findOne(query.getId());  
        if (Objects.isNull(userInfo)) {  
            //这里直接抛自定义异常  
            throw new NotFoundException();  
        }  
        //……后续业务操作  
    }  
}
```

当 Service 层的 queryOne 方法抛出 NotFoundException 时，Graceful Response 会进行异常捕获，并将 NotFoundException 对应的异常码和异常信息封装到统一的响应对象中，最终接口返回以下 JSON。

```json
{  
  "status": {  
    "code": "1404",  
    "msg": "找不到对象"  
  },  
  "payload": {}  
}
```

#### 参数校验 ####

Graceful Response 对 JSR-303 数据校验规范和 Hibernate Validator 进行了增强，Graceful Response 自身不提供参数校验的功能，但是用户使用了 Hibernate Validator 后，Graceful Response 可以通过 @ValidationStatusCode 注解为参数校验结果提供响应码，并将其统一封装返回。

例如以下的 UserInfoQuery。

```java
@Data  
public class UserInfoQuery {  
    @NotNull(message = "userName is null !")  
    @Length(min = 6, max = 12)  
    @ValidationStatusCode(code = "520")  
    private String userName;  
}
```

UserInfoQuery 对象中定义了 `@NotNull` 和 `@Length` 两个校验规则，在未引入 Graceful Response 的情况下，会直接抛出异常；

在引入 Graceful Response 但是没有加入 `@ValidationStatusCode` 注解的情况下，会以默认的错误码进行返回；

在上面的 UserInfoQuery 中由于使用了 `@ValidationStatusCode` 注解，并指定异常码为 520，则当 userName 字段任意校验不通过时，都会使用异常码 520 进行返回，如下。

```json
{  
  "status": {  
    "code": "520",  
    "msg": "userName is null !"  
  },  
  "payload": {}  
}
```

而对于 Controller 层直接校验方法入参的场景，Graceful Response 也进行了增强，如以下 Controller。

```java
public class Controller {  
  
    @RequestMapping("/validateMethodParam")  
    @ResponseBody  
    @ValidationStatusCode(code = "1314")  
    public void validateMethodParam(  
            @NotNull(message = "userId不能为空") Long userId,  
            @NotNull(message = "userName不能为空") Long userName) {  
        //省略业务逻辑  
    }  
}
```

如果该方法入参校验触发了 userId 和 userName 的校验异常，将以错误码 1314 进行返回，如下。

```json
{  
  "status": {  
    "code": "1314",  
    "msg": "userId不能为空"  
  },  
  "payload": {}  
}
```

#### 自定义 Response 格式 ####

Graceful Response 内置了两种风格的响应格式，并通过 graceful-response.response-style 进行配置。

graceful-response.response-style=0，或者不配置（默认情况），将以以下的格式进行返回：

```json
{  
  "status": {  
    "code": 1007,  
    "msg": "有内鬼，终止交易"  
  },  
  "payload": {  
  }  
}
```

graceful-response.response-style=1，将以以下的格式进行返回：

```json
{  
  "code": "1404",  
  "msg": "not found",  
  "data": {  
  }  
}
```

如果这两种格式均不满足业务需要，Graceful Response 也支持用户自定义响应体，关于自定义响应体的技术实现，请到自定义 Response 格式进行了解。
