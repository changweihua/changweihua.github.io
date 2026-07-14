---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot中6种API版本控制策略
description: SpringBoot中6种API版本控制策略
date: 2026-03-06 14:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

API版本控制是确保系统平稳演进的关键策略。当API发生变化时，合理的版本控制机制能让旧版客户端继续正常工作，同时允许新版客户端使用新功能。

## 一、URL路径版本控制 ##

这是最直观、应用最广泛的版本控制方式，通过在URL路径中直接包含版本号。

### 实现方式 ###

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserControllerV1 {
    
    @GetMapping("/{id}")
    public UserV1DTO getUser(@PathVariable Long id) {
        // 返回v1版本的用户信息
        return userService.getUserV1(id);
    }
}

@RestController
@RequestMapping("/api/v2/users")
public class UserControllerV2 {
    
    @GetMapping("/{id}")
    public UserV2DTO getUser(@PathVariable Long id) {
        // 返回v2版本的用户信息，可能包含更多字段
        return userService.getUserV2(id);
    }
}
```

### 优缺点 ###

**优点**

- 简单直观，客户端调用明确
- 完全隔离不同版本的API
- 便于API网关路由和文档管理

**缺点**

- 可能导致代码重复
- 维护多个版本的控制器类

## 二、请求参数版本控制 ##

通过在请求参数中指定版本号，保持URL路径不变。

### 实现方式 ###

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping("/{id}")
    public Object getUser(@PathVariable Long id, @RequestParam(defaultValue = "1") int version) {
        switch (version) {
            case 1:
                return userService.getUserV1(id);
            case 2:
                return userService.getUserV2(id);
            default:
                throw new IllegalArgumentException("Unsupported API version: " + version);
        }
    }
}
```

或者使用SpringMVC的条件映射：

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping(value = "/{id}", params = "version=1")
    public UserV1DTO getUserV1(@PathVariable Long id) {
        return userService.getUserV1(id);
    }
    
    @GetMapping(value = "/{id}", params = "version=2")
    public UserV2DTO getUserV2(@PathVariable Long id) {
        return userService.getUserV2(id);
    }
}
```

### 优缺点 ###

**优点**

- 保持URL资源定位的语义性
- 实现相对简单
- 客户端可以通过查询参数轻松切换版本

**缺点**

- 可能与业务查询参数混淆
- 不便于缓存（相同URL不同版本）
- 不如URL路径版本那样明显

## 三、HTTP Header版本控制 ##

通过自定义HTTP头来指定API版本，这是一种更符合RESTful理念的方式。

### 实现方式 ###

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping(value = "/{id}", headers = "X-API-Version=1")
    public UserV1DTO getUserV1(@PathVariable Long id) {
        return userService.getUserV1(id);
    }
    
    @GetMapping(value = "/{id}", headers = "X-API-Version=2")
    public UserV2DTO getUserV2(@PathVariable Long id) {
        return userService.getUserV2(id);
    }
}
```

### 优缺点 ###

**优点**

- URL保持干净，符合RESTful理念
- 版本信息与业务参数完全分离
- 可以携带更丰富的版本信息

**缺点**

- 不易于在浏览器中测试
- 对API文档要求更高
- 客户端需要特殊处理头信息

## 四、Accept Header版本控制（媒体类型版本控制） ##

使用HTTP协议的内容协商机制，通过Accept头指定媒体类型及其版本。

### 实现方式 ###

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping(value = "/{id}", produces = "application/vnd.company.app-v1+json")
    public UserV1DTO getUserV1(@PathVariable Long id) {
        return userService.getUserV1(id);
    }
    
    @GetMapping(value = "/{id}", produces = "application/vnd.company.app-v2+json")
    public UserV2DTO getUserV2(@PathVariable Long id) {
        return userService.getUserV2(id);
    }
}
```

客户端请求时需要设置Accept头：

```bash
Accept: application/vnd.company.app-v2+json
```

### 优缺点 ###

**优点**

- 最符合HTTP规范
- 利用了内容协商的既有机制
- URL保持干净和语义化

**缺点**

- 客户端使用门槛较高
- 不直观，调试不便
- 可能需要自定义MediaType解析

## 五、自定义注解版本控制 ##

通过自定义注解和拦截器/过滤器实现更灵活的版本控制。

### 实现方式 ###

首先定义版本注解：

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiVersion {
    int value() default 1;
}
```

创建版本匹配的请求映射处理器：

```java
@Component
public class ApiVersionRequestMappingHandlerMapping extends RequestMappingHandlerMapping {

    @Override
    protected RequestCondition<?> getCustomTypeCondition(Class<?> handlerType) {
        ApiVersion apiVersion = handlerType.getAnnotation(ApiVersion.class);
        return createCondition(apiVersion);
    }

    @Override
    protected RequestCondition<?> getCustomMethodCondition(Method method) {
        ApiVersion apiVersion = method.getAnnotation(ApiVersion.class);
        return createCondition(apiVersion);
    }

    private ApiVersionCondition createCondition(ApiVersion apiVersion) {
        return apiVersion == null ? new ApiVersionCondition(1) : new ApiVersionCondition(apiVersion.value());
    }
}

public class ApiVersionCondition implements RequestCondition<ApiVersionCondition> {

    private final int apiVersion;

    public ApiVersionCondition(int apiVersion) {
        this.apiVersion = apiVersion;
    }

    @Override
    public ApiVersionCondition combine(ApiVersionCondition other) {
        // 采用最高版本
        return new ApiVersionCondition(Math.max(this.apiVersion, other.apiVersion));
    }

    @Override
    public ApiVersionCondition getMatchingCondition(HttpServletRequest request) {
        String version = request.getHeader("X-API-Version");
        if (version == null) {
            version = request.getParameter("version");
        }
        
        int requestedVersion = version == null ? 1 : Integer.parseInt(version);
        return requestedVersion >= apiVersion ? this : null;
    }

    @Override
    public int compareTo(ApiVersionCondition other, HttpServletRequest request) {
        // 优先匹配高版本
        return other.apiVersion - this.apiVersion;
    }
}
```

配置WebMvc使用自定义的映射处理器：

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public RequestMappingHandlerMapping requestMappingHandlerMapping() {
        return new ApiVersionRequestMappingHandlerMapping();
    }
}
```

使用自定义注解：

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @ApiVersion(1)
    @GetMapping("/{id}")
    public UserV1DTO getUserV1(@PathVariable Long id) {
        return userService.getUserV1(id);
    }
    
    @ApiVersion(2)
    @GetMapping("/{id}")
    public UserV2DTO getUserV2(@PathVariable Long id) {
        return userService.getUserV2(id);
    }
}
```

### 优缺点 ###

**优点**

- 高度灵活和可定制
- 可以结合多种版本控制策略
- 代码组织更清晰

**缺点**

- 实现较为复杂
- 需要自定义Spring组件

## 六、面向接口的API版本控制 ##

通过接口继承和策略模式实现版本控制，核心思想是提供相同接口的不同版本实现类。

### 实现方式 ###

首先定义API接口：

```java
public interface UserApi {
    Object getUser(Long id);
}

@Service
@Primary
public class UserApiV2Impl implements UserApi {
    // 最新版本实现
    @Override
    public UserV2DTO getUser(Long id) {
        // 返回V2版本数据
        return new UserV2DTO();
    }
}

@Service
@Qualifier("v1")
public class UserApiV1Impl implements UserApi {
    // 旧版本实现
    @Override
    public UserV1DTO getUser(Long id) {
        // 返回V1版本数据
        return new UserV1DTO();
    }
}
```

控制器层根据版本动态选择实现：

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final Map<Integer, UserApi> apiVersions;
    
    // 通过构造注入收集所有实现
    public UserController(List<UserApi> apis) {
        // 简化示例，实际应通过某种方式标记每个实现的版本
        this.apiVersions = Map.of(
            1, apis.stream().filter(api -> api instanceof UserApiV1Impl).findFirst().orElseThrow(),
            2, apis.stream().filter(api -> api instanceof UserApiV2Impl).findFirst().orElseThrow()
        );
    }
    
    @GetMapping("/{id}")
    public Object getUser(@PathVariable Long id, @RequestParam(defaultValue = "2") int version) {
        UserApi api = apiVersions.getOrDefault(version, apiVersions.get(2)); // 默认使用最新版本
        return api.getUser(id);
    }
}
```

可以自己实现一个版本委托器来简化版本选择：

```java
// 自定义API版本委托器
public class ApiVersionDelegator<T> {
    
    private final Class<T> apiInterface;
    private final Map<String, T> versionedImpls = new HashMap<>();
    private final Function<HttpServletRequest, String> versionExtractor;
    private final String defaultVersion;
    
    public ApiVersionDelegator(Class<T> apiInterface, 
                          Function<HttpServletRequest, String> versionExtractor,
                          String defaultVersion,
                          ApplicationContext context) {
        this.apiInterface = apiInterface;
        this.versionExtractor = versionExtractor;
        this.defaultVersion = defaultVersion;
        
        // 从Spring上下文中查找所有实现了该接口的bean
        Map<String, T> impls = context.getBeansOfType(apiInterface);
        for (Map.Entry<String, T> entry : impls.entrySet()) {
            ApiVersion apiVersion = entry.getValue().getClass().getAnnotation(ApiVersion.class);
            if (apiVersion != null) {
                versionedImpls.put(String.valueOf(apiVersion.value()), entry.getValue());
            }
        }
    }
    
    public T getApi(HttpServletRequest request) {
        String version = versionExtractor.apply(request);
        return versionedImpls.getOrDefault(version, versionedImpls.get(defaultVersion));
    }
    
    // 构建器模式简化创建过程
    public static <T> Builder<T> builder() {
        return new Builder<>();
    }
    
    public static class Builder<T> {
        private Class<T> apiInterface;
        private Function<HttpServletRequest, String> versionExtractor;
        private String defaultVersion;
        private ApplicationContext applicationContext;
        
        public Builder<T> apiInterface(Class<T> apiInterface) {
            this.apiInterface = apiInterface;
            return this;
        }
        
        public Builder<T> versionExtractor(Function<HttpServletRequest, String> versionExtractor) {
            this.versionExtractor = versionExtractor;
            return this;
        }
        
        public Builder<T> defaultVersion(String defaultVersion) {
            this.defaultVersion = defaultVersion;
            return this;
        }
        
        public Builder<T> applicationContext(ApplicationContext applicationContext) {
            this.applicationContext = applicationContext;
            return this;
        }
        
        public ApiVersionDelegator<T> build() {
            return new ApiVersionDelegator<>(apiInterface, versionExtractor, defaultVersion, applicationContext);
        }
    }
}
```

配置和使用委托器：

```java
@Configuration
public class ApiConfiguration {
    
    @Bean
    public ApiVersionDelegator<UserApi> userApiDelegator(ApplicationContext context) {
        return ApiVersionDelegator.<UserApi>builder()
            .apiInterface(UserApi.class)
            .versionExtractor(request -> {
                String version = request.getHeader("X-API-Version");
                return version == null ? "2" : version;
            })
            .defaultVersion("2")
            .applicationContext(context)
            .build();
    }
}

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final ApiVersionDelegator<UserApi> apiDelegator;
    
    public UserController(ApiVersionDelegator<UserApi> apiDelegator) {
        this.apiDelegator = apiDelegator;
    }
    
    @GetMapping("/{id}")
    public Object getUser(@PathVariable Long id, HttpServletRequest request) {
        UserApi api = apiDelegator.getApi(request);
        return api.getUser(id);
    }
}
```

### 优缺点 ###

**优点**

- 实现真正的关注点分离
- 遵循开闭原则，新版本只需添加新实现
- 业务逻辑与版本控制解耦

**缺点**

- 需要设计良好的接口层次
- 可能需要额外的适配层处理返回类型差异
- 初始设置较复杂

## 七、总结 ##

以上6种API版本控制方式各有优劣，选择时应考虑以下因素

- 项目规模和团队情况：小型项目可选择简单的URL路径版本控制，大型项目可考虑自定义注解或面向接口的方式
- 客户端类型：面向浏览器的API可能更适合URL路径或查询参数版本控制，而面向移动应用或其他服务的API可考虑HTTP头或媒体类型版本控制
- 版本演进策略：是否需要向后兼容，版本更新频率如何
- API网关与文档：考虑版本控制方式是否便于API网关路由和文档生成

最后，版本控制只是手段，不是目的。关键是要构建可演进的API架构，让系统能够持续满足业务需求的变化。选择合适的版本控制策略，能够在保证系统稳定性的同时，实现API的平滑演进。
