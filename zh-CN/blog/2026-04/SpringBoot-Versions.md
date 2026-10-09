---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot多版本API共存
description: 通过注解路由新旧版本接口实现灰度发布
date: 2026-04-20 10:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、引言 ##

在快速迭代的产品开发中，API接口的更新迭代是常态。然而，旧版本接口往往已经有大量用户依赖，无法立即停用。

那么如何在不影响现有用户的前提下平滑引入新版本API，并逐步实现版本迁移 ?

本文将介绍如何通过Spring Boot注解机制实现API多版本共存，并基于此实现灰度发布，达到更优雅地处理API版本管理问题的目的。

## 二、背景与问题 ##

### API版本管理的挑战 ###

在实际开发过程中，我们常常面临以下API版本管理的挑战：

- 兼容性问题：新版API可能引入不兼容的变更，直接替换会导致客户端崩溃
- 用户体验：强制用户立即升级会带来负面用户体验
- 风险管控：新版API可能存在未知问题，需要逐步推广以控制风险
- 平滑过渡：需要提供平滑的过渡期，让用户有足够时间适应新版本

### 传统API版本管理方案及不足 ###

传统的API版本管理方案主要有以下几种：

#### URL路径版本：如 `/v1/users`、`/v2/users` ####

- 优点：简单直观，客户端易于理解
- 缺点：不便于根据规则在后端进行动态控制

#### 请求参数版本：如`/users?version=1` ####

- 优点：不改变资源标识
- 缺点：可能与业务参数混淆

#### HTTP头版本：如`Accept: application/vnd.company.app-v1+json` ####

- 优点：符合HTTP规范，不污染URL
- 缺点：对客户端不友好，调试不便

## 三、基于注解的API版本路由方案 ##

### 设计思路 ###

我们的核心设计思路是：通过自定义注解标记不同版本的API实现，结合SpringMVC的RequestMappingHandlerMapping扩展机制与条件选择机制，根据请求中的版本信息动态路由到对应版本的处理方法。

同时，我们引入用户分组和灰度规则，使系统能够根据用户特征智能地选择合适的API版本，实现精细化的灰度发布。

### 核心组件 ###

- `@ApiVersion`注解：标记API方法的版本信息
- `@GrayRelease`注解：定义灰度发布规则
- `ApiVersionRequestMappingHandlerMapping`：扩展Spring的请求映射处理器，支持版本路由
- `ApiVersionRequestCondition`：版本路由条件选择器

## 四、方案实现 ##

### 版本注解定义 ###

首先，定义API版本注解：

```java
package com.example.version;

import java.lang.annotation.*;

/**
 * API版本注解，用于标记接口的版本
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ApiVersion {
    /**
     * 版本号，默认为1.0
     */
    String value() default "1.0";
    
    /**
     * 版本描述
     */
    String description() default "";
    
    /**
     * 是否废弃
     */
    boolean deprecated() default false;
    
    /**
     * 废弃说明，建议使用的新版本等信息
     */
    String deprecatedDesc() default "";
}
```

灰度发布注解：

```java
package com.example.version;

import java.lang.annotation.*;

/**
 * 灰度发布注解，用于定义灰度发布规则
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface GrayRelease {
    /**
     * 开始时间，格式：yyyy-MM-dd HH:mm:ss
     */
    String startTime() default "";
    
    /**
     * 结束时间，格式：yyyy-MM-dd HH:mm:ss
     */
    String endTime() default "";
    
    /**
     * 用户ID白名单，多个ID用逗号分隔
     */
    String userIds() default "";
    
    /**
     * 用户比例，0-100之间的整数，表示百分比
     */
    int percentage() default 0;
    
    /**
     * 指定的用户组
     */
    String[] userGroups() default {};
    
    /**
     * 地区限制，支持国家、省份、城市，如：CN,US,Beijing
     */
    String[] regions() default {};
}
```

### 版本请求映射处理器 ###

扩展Spring的RequestMappingHandlerMapping，支持版本路由：

```java
package com.example.version;

import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.condition.RequestCondition;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.lang.reflect.Method;

public class ApiVersionRequestMappingHandlerMapping extends RequestMappingHandlerMapping {
    
    @Override
    protected RequestCondition<?> getCustomTypeCondition(Class<?> handlerType) {
        ApiVersion annotation = AnnotationUtils.findAnnotation(handlerType, ApiVersion.class);
        return (annotation != null) ? 
            new ApiVersionRequestCondition(annotation.value(), (HandlerMethod) null) : null;
    }

    @Override
    protected RequestCondition<?> getCustomMethodCondition(Method method) {
        ApiVersion annotation = AnnotationUtils.findAnnotation(method, ApiVersion.class);
        if (annotation != null) {
            // 需要获取实际的HandlerMethod
            return new ApiVersionRequestCondition(annotation.value(), 
                new HandlerMethod(new Object(), method)); // 需要实际handler实例
        }
        return null;
    }
}
```

### 实现版本匹配条件 ###

```java
package com.example.version;

import cn.hutool.core.date.DateUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.condition.RequestCondition;

import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.Random;


/**
 * API版本请求条件
 */
public class ApiVersionRequestCondition implements RequestCondition<ApiVersionRequestCondition> {
    
    private final String apiVersion;

    private final HandlerMethod handlerMethod;

    private static final Random RANDOM = new SecureRandom();

    public ApiVersionRequestCondition(String apiVersion, HandlerMethod handlerMethod) {
        this.apiVersion = apiVersion;
        this.handlerMethod = handlerMethod;
    }


    @Override
    public ApiVersionRequestCondition combine(ApiVersionRequestCondition other) {
        // 采用方法上的版本号优先于类上的版本号
        return new ApiVersionRequestCondition(other.getApiVersion(),null);
    }
    
    @Override
    public ApiVersionRequestCondition getMatchingCondition(HttpServletRequest request) {
        //String requestVersion = VersionContextHolder.getVersion();
        String requestVersion = getVersion(request);
        
        // 版本比较逻辑，这里简化处理，只做字符串比较
        // 实际应用中可能需要更复杂的版本比较算法
        if (requestVersion.equals(this.apiVersion)) {
            return this;
        }
        
        return null;
    }
    
    @Override
    public int compareTo(ApiVersionRequestCondition other, HttpServletRequest request) {
        // 版本号越大优先级越高
        return other.getApiVersion().compareTo(this.apiVersion);
    }
    
    public String getApiVersion() {
        return apiVersion;
    }

    private String getVersion(HttpServletRequest request){
        // 获取客户端请求的版本
        String clientVersion = request.getHeader("Api-Version");
        if (clientVersion == null || clientVersion.isEmpty()) {
            // 如果客户端未指定版本，也可以从请求参数中获取
            clientVersion = request.getParameter("version");
        }

        // 如果客户端仍未指定版本，则应用灰度规则
        if (clientVersion == null || clientVersion.isEmpty()) {
            // 从请求中提取用户信息
            UserInfo userInfo = extractUserInfo(request);

            // 获取方法或类上的灰度发布注解
            GrayRelease grayRelease = handlerMethod.getMethodAnnotation(GrayRelease.class);
            if (grayRelease == null) {
                grayRelease = handlerMethod.getBeanType().getAnnotation(GrayRelease.class);
            }

            if (grayRelease != null) {
                // 应用灰度规则决定使用哪个版本
                clientVersion = applyGrayReleaseRules(grayRelease, userInfo);
            } else {
                // 默认使用最新版本
                ApiVersion apiVersion = handlerMethod.getMethodAnnotation(ApiVersion.class);
                if (apiVersion == null) {
                    apiVersion = handlerMethod.getBeanType().getAnnotation(ApiVersion.class);
                }

                clientVersion = apiVersion != null ? apiVersion.value() : "1.0";
            }
        }

        return clientVersion;
    }

    private UserInfo extractUserInfo(HttpServletRequest request) {
        UserInfo userInfo = new UserInfo();

        // 实际应用中这里可能从请求头、Cookie或JWT Token中提取用户信息
        // 这里仅作示例
        String userId = request.getHeader("User-Id");
        userInfo.setUserId(userId);

        String groups = request.getHeader("User-Groups");
        if (groups != null && !groups.isEmpty()) {
            userInfo.setGroups(groups.split(","));
        }

        String region = request.getHeader("User-Region");
        userInfo.setRegion(region);

        return userInfo;
    }

    /**
     * 应用灰度规则
     */
    private String applyGrayReleaseRules(GrayRelease grayRelease, UserInfo userInfo) {
        // 检查时间范围
        if (!grayRelease.startTime().isEmpty() && !grayRelease.endTime().isEmpty()) {
            try {
                Date now = new Date();
                Date startTime = DateUtil.parse(grayRelease.startTime());
                Date endTime = DateUtil.parse(grayRelease.endTime());

                if (now.before(startTime) || now.after(endTime)) {
                    return "1.0"; // 不在灰度时间范围内，使用旧版本
                }
            } catch (Exception e) {
                // 解析日期出错，忽略时间规则
            }
        }

        // 检查用户ID白名单
        if (!grayRelease.userIds().isEmpty() && userInfo.getUserId() != null) {
            String[] whitelistIds = grayRelease.userIds().split(",");
            if (Arrays.asList(whitelistIds).contains(userInfo.getUserId())) {
                return "2.0"; // 用户在白名单中，使用新版本
            }
        }

        // 检查用户组
        if (grayRelease.userGroups().length > 0 && userInfo.getGroups() != null) {
            for (String requiredGroup : grayRelease.userGroups()) {
                for (String userGroup : userInfo.getGroups()) {
                    if (requiredGroup.equals(userGroup)) {
                        return "2.0"; // 用户在指定组中，使用新版本
                    }
                }
            }
        }

        // 检查地区
        if (grayRelease.regions().length > 0 && userInfo.getRegion() != null) {
            for (String region : grayRelease.regions()) {
                if (region.equals(userInfo.getRegion())) {
                    return "2.0"; // 用户在指定地区，使用新版本
                }
            }
        }

        // 应用百分比规则
        if (grayRelease.percentage() > 0) {
            int randomValue = RANDOM.nextInt(100) + 1; // 1-100的随机数
            if (randomValue <= grayRelease.percentage()) {
                return "2.0"; // 随机命中百分比，使用新版本
            }
        }

        // 默认使用旧版本
        return "1.0";
    }

}
```

### 配置类 ###

将上述组件注册到Spring容器中：

```java
package com.example.config;

import com.example.version.ApiVersionRequestMappingHandlerMapping;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcRegistrations;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer, WebMvcRegistrations {
    
    @Override
    public RequestMappingHandlerMapping getRequestMappingHandlerMapping() {
        return new ApiVersionRequestMappingHandlerMapping();
    }

}
```

## 五、实际应用示例 ##

下面是一个用户服务API的多版本实现示例：

```java
package com.example.controller;

import com.example.model.User;
import com.example.version.ApiVersion;
import com.example.version.GrayRelease;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    // 模拟数据库
    private final List<User> userDatabase = new ArrayList<>();
    
    public UserController() {
        // 初始化一些测试数据
        userDatabase.add(new User(
            1L, "john_doe", "John Doe", "john@example.com",
            LocalDateTime.now().minusDays(100), LocalDateTime.now().minusDays(10),
            true,"1234567890","https://example.com/avatars/john.jpg")
        );

        userDatabase.add(new User(
                2L, "john_doe2", "John Doe2", "john2@example.com",
                LocalDateTime.now().minusDays(102), LocalDateTime.now().minusDays(12),
                true,"9876543210","https://example.com/avatars/john.jpg")
        );
    }
    
    /**
     * 获取用户列表 - 版本1.0
     * 只返回基本用户信息
     */
    @GetMapping
    @ApiVersion("1.0")
    public List<User> getUsersV1() {
        return userDatabase.stream()
            .map(user -> {
                User simpleUser = new User();
                simpleUser.setId(user.getId());
                simpleUser.setUsername(user.getUsername());
                simpleUser.setName(user.getName());
                simpleUser.setEmail(user.getEmail());
                simpleUser.setActive(user.getActive());
                return simpleUser;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * 获取用户列表 - 版本2.0（包含更多用户信息）
     * 返回完整的用户信息
     */
    @GetMapping
    @ApiVersion("2.0")
    @GrayRelease(
        startTime = "2023-01-01 00:00:00",
        //endTime = "2023-12-31 23:59:59",
        endTime = "2025-12-31 23:59:59",
        userGroups = {"vip", "beta-tester"},
        percentage = 20
    )
    public List<User> getUsersV2() {
        return userDatabase;
    }
    
    /**
     * 获取单个用户 - 版本1.0
     * 只返回基本用户信息
     */
    @GetMapping("/{id}")
    @ApiVersion("1.0")
    public User getUserV1(@PathVariable Long id) {
        User user = findUserById(id);
        if (user == null) {
            return null;
        }
        
        User simpleUser = new User();
        simpleUser.setId(user.getId());
        simpleUser.setUsername(user.getUsername());
        simpleUser.setName(user.getName());
        simpleUser.setEmail(user.getEmail());
        simpleUser.setActive(user.getActive());
        return simpleUser;
    }
    
    /**
     * 获取单个用户 - 版本2.0（包含更多用户信息）
     * 返回完整的用户信息
     */
    @GetMapping("/{id}")
    @ApiVersion("2.0")
    @GrayRelease(
        userIds = "100,101,102",
        regions = {"CN-BJ", "CN-SH"}
    )
    public User getUserV2(@PathVariable Long id) {
        return findUserById(id);
    }
    
    /**
     * 创建用户 - 版本1.0
     * 只需要基本用户信息
     */
    @PostMapping
    @ApiVersion("1.0")
    public User createUserV1(@RequestBody User user) {
        // 设置ID和时间戳
        user.setId((long) (userDatabase.size() + 1));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setActive(true);
        
        // 存储用户（实际项目中会保存到数据库）
        userDatabase.add(user);
        
        // 返回简化版本的用户信息
        User simpleUser = new User();
        simpleUser.setId(user.getId());
        simpleUser.setUsername(user.getUsername());
        simpleUser.setName(user.getName());
        simpleUser.setEmail(user.getEmail());
        simpleUser.setPhone(user.getPhone());
        simpleUser.setActive(user.getActive());
        return simpleUser;
    }
    
    /**
     * 创建用户 - 版本2.0（增加了参数验证和更丰富的返回信息）
     */
    @PostMapping
    @ApiVersion("2.0")
    @GrayRelease(percentage = 50)
    public User createUserV2(@RequestBody User user) {
        // 参数验证
        if (user.getName() == null || user.getName().isEmpty()) {
            throw new IllegalArgumentException("User name cannot be empty");
        }
        
        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            throw new IllegalArgumentException("Invalid email format");
        }
        
        // 设置ID和时间戳
        user.setId((long) (userDatabase.size() + 1));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setActive(true);

        // 存储用户
        userDatabase.add(user);
        
        // 返回完整的用户信息
        return user;
    }
    
    /**
     * 更新用户 - 版本1.0
     */
    @PutMapping("/{id}")
    @ApiVersion("1.0")
    public User updateUserV1(@PathVariable Long id, @RequestBody User userUpdate) {
        User existingUser = findUserById(id);
        if (existingUser == null) {
            return null;
        }
        
        // 更新基本字段
        if (userUpdate.getUsername() != null) existingUser.setUsername(userUpdate.getUsername());
        if (userUpdate.getName() != null) existingUser.setName(userUpdate.getName());
        if (userUpdate.getEmail() != null) existingUser.setEmail(userUpdate.getEmail());
        if (userUpdate.getActive() != null) existingUser.setActive(userUpdate.getActive());
        
        existingUser.setUpdatedAt(LocalDateTime.now());
        
        // 返回简化版本
        User simpleUser = new User();
        simpleUser.setId(existingUser.getId());
        simpleUser.setUsername(existingUser.getUsername());
        simpleUser.setName(existingUser.getName());
        simpleUser.setEmail(existingUser.getEmail());
        simpleUser.setPhone(existingUser.getPhone());
        simpleUser.setActive(existingUser.getActive());
        return simpleUser;
    }
    
    /**
     * 更新用户 - 版本2.0（支持更新更多字段）
     */
    @PutMapping("/{id}")
    @ApiVersion("2.0")
    @GrayRelease(
        userGroups = {"vip", "admin"},
        percentage = 30
    )
    public User updateUserV2(@PathVariable Long id, @RequestBody User userUpdate) {
        User existingUser = findUserById(id);
        if (existingUser == null) {
            return null;
        }
        
        // 更新基本字段
        if (userUpdate.getUsername() != null) existingUser.setUsername(userUpdate.getUsername());
        if (userUpdate.getName() != null) existingUser.setName(userUpdate.getName());
        if (userUpdate.getEmail() != null) existingUser.setEmail(userUpdate.getEmail());
        if (userUpdate.getActive() != null) existingUser.setActive(userUpdate.getActive());

        // 更新扩展字段
        if (userUpdate.getPhone() != null) existingUser.setPhone(userUpdate.getPhone());
        if (userUpdate.getAvatar() != null) existingUser.setAvatar(userUpdate.getAvatar());

        existingUser.setUpdatedAt(LocalDateTime.now());
        
        // 返回完整的用户信息
        return existingUser;
    }
    
    /**
     * 删除用户 - 版本1.0
     */
    @DeleteMapping("/{id}")
    @ApiVersion("1.0")
    public void deleteUserV1(@PathVariable Long id) {
        userDatabase.removeIf(user -> user.getId().equals(id));
    }
    
    /**
     * 删除用户 - 版本2.0（带有软删除功能）
     */
    @DeleteMapping("/{id}")
    @ApiVersion("2.0")
    @GrayRelease(
        userGroups = {"admin"},
        percentage = 10
    )
    public User deleteUserV2(@PathVariable Long id) {
        User existingUser = findUserById(id);
        if (existingUser == null) {
            return null;
        }
        
        // 软删除，而不是物理删除
        existingUser.setActive(false);
        existingUser.setUpdatedAt(LocalDateTime.now());
        
        return existingUser;
    }
    
    /**
     * 查找用户的辅助方法
     */
    private User findUserById(Long id) {
        return userDatabase.stream()
                .filter(user -> user.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
}
```

## 六、最佳实践和注意事项 ##

### API版本设计原则 ###

- 向后兼容为先：尽量设计向后兼容的API，减少版本增加的频率
- 明确变更范围：只有不兼容的变更才需要新版本，小型改进可以在现有版本中实现
- 妥善处理默认版本：为未指定版本的请求提供合理的默认版本
- 版本过渡期：为老版本设置合理的过渡期，并提供明确的废弃通知

### 注意事项 ###

- 性能考量：版本路由逻辑会带来一定的性能开销
- 缓存策略：不同版本的API可能需要不同的缓存策略
- 测试覆盖：确保所有版本的API都有完善的测试覆盖

## 七、总结 ##

本文介绍了如何通过注解路由机制实现API多版本共存和灰度发布。

通过自定义的`@ApiVersion`和`@GrayRelease`注解，结合Spring MVC的扩展点，我们实现了一个灵活、可配置的API版本管理方案。
