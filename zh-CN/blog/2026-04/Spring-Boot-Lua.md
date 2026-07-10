---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 集成 Redis 并调用 Lua 脚本详解
description: Spring Boot 集成 Redis 并调用 Lua 脚本详解
date: 2026-04-01 12:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 前言 ##

Redis 是一个高性能的内存数据库，广泛用于缓存、计数器、分布式锁等场景。在某些业务中，我们需要对多个 Redis 操作进行原子性处理，以保证数据一致性，这时就可以使用 Redis 提供的 Lua 脚本功能。

Spring Boot 通过 `RedisTemplate` 对 Redis 进行了良好的封装，也支持我们方便地调用 Lua 脚本。本文将带你一步步实现 Spring Boot 中如何：

- 加载 Lua 脚本
- 调用 Lua 脚本
- 实现一个实际业务逻辑：获取 key，若不存在则设置默认值并返回

## 一、项目准备 ##

### 创建 Spring Boot 项目 ###

你可以使用 Spring Initializr 创建一个新项目，选择以下依赖：

- Spring Web
- Spring Data Redis
- Lettuce（Redis 客户端）

或者手动创建 Maven 项目后添加如下依赖：

```xml
<!-- Spring Boot Starter -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>

<!-- Web 支持 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Redis 支持 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- Lettuce 客户端 -->
<dependency>
    <groupId>io.lettuce.core</groupId>
    <artifactId>lettuce-core</artifactId>
    <version>6.2.4</version>
</dependency>
```

## 二、编写 Lua 脚本文件 ##

我们将创建一个简单的 Lua 脚本：如果 key 不存在，则设置默认值；存在则直接返回当前值。

脚本内容：`get_or_set_default.lua`

路径建议为：`src/main/resources/lua/get_or_set_default.lua`

```lua
-- get_or_set_default.lua
local key = KEYS[1]
local defaultVal = ARGV[1]

local value = redis.call('GET', key)
if not value then
    redis.call('SET', key, defaultVal)
    value = defaultVal
end
return value
```

## 三、加载 Lua 脚本到 Redis ##

我们可以利用 Spring 的生命周期回调（如 `@PostConstruct`）来加载 Lua 脚本，并保存其 SHA1 校验码，后续通过 EVALSHA 来调用。

创建脚本加载类：

```java:LuaScriptLoader.java
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;

@Service
public class LuaScriptLoader {

    private final RedisTemplate<String, Object> redisTemplate;

    // 存储脚本的 SHA1 值
    public static String GET_OR_SET_DEFAULT_SHA;

    public LuaScriptLoader(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @PostConstruct
    public void loadScripts() throws IOException {
        Path scriptPath = Paths.get("src/main/resources/lua/get_or_set_default.lua");
        String scriptContent = Files.readString(scriptPath);

        DefaultRedisScript<String> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(scriptContent);
        redisScript.setResultType(String.class);

        // 执行 SCRIPT LOAD 命令加载脚本
        GET_OR_SET_DEFAULT_SHA = redisTemplate.execute(
                redisScript,
                Collections.singletonList("dummyKey"),
                "defaultValue"
        );

        System.out.println("Lua Script SHA1: " + GET_OR_SET_DEFAULT_SHA);
    }
}
```

注意：

- 我们使用了一个 dummyKey 和 dummyValue 来执行一次脚本，只是为了触发脚本加载。
- 实际调用时使用的是 EVALSHA 命令。

## 四、封装 Lua 脚本调用服务 ##

我们创建一个服务类来封装 Lua 脚本的调用逻辑。

创建服务类：

```java:RedisLuaService.java
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class RedisLuaService {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisLuaService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * 调用 Lua 脚本：根据 key 获取值，若不存在则设置默认值并返回
     */
    public String getOrSetDefault(String key, String defaultValue) {
        return (String) redisTemplate.execute(
                LuaScriptLoader.GET_OR_SET_DEFAULT_SHA,
                Collections.singletonList(key),
                defaultValue
        );
    }
}
```

## 五、创建 REST 接口进行测试 ##

为了方便测试，我们创建一个简单的接口。

创建控制器类：

```java:RedisLuaController.java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/redis")
public class RedisLuaController {

    private final RedisLuaService redisLuaService;

    public RedisLuaController(RedisLuaService redisLuaService) {
        this.redisLuaService = redisLuaService;
    }

    @GetMapping("/get-or-set")
    public String getOrDefault(
            @RequestParam String key,
            @RequestParam(required = false, defaultValue = "default_value") String defaultValue) {
        return redisLuaService.getOrSetDefault(key, defaultValue);
    }
}
```

## 六、运行测试 ##

### 启动 Redis 服务 ###

确保你本地或服务器上已经启动了 Redis：

```bash
redis-server
```

### 启动 Spring Boot 应用 ###

使用 IDE 或命令行启动 Spring Boot 项目：

```bash
mvn spring-boot:run
```

### 测试访问 ###

访问如下 URL：

```txt
http://localhost:8080/redis/get-or-set?key=test_lua&defaultValue=hello_redis
```

第一次请求：

Redis 中没有 test_lua 键，会自动设置为 hello_redis，并返回该值。

第二次请求：

即使不传 defaultValue，也会返回 hello_redis，因为键已存在。

## 七、注意事项 ##

|  项目   |      说明 |
| :-----------: | :-----------: |
|  脚本缓存  |  Redis 会缓存加载过的 Lua 脚本，但重启后失效，需重新加载  |
|  调试困难  |  Lua 脚本不能输出日志，建议先在 Redis CLI 中测试后再集成  |
|  性能考量  |  Lua 脚本是单线程执行的，避免复杂运算  |
|  异常处理  |  在 Java 层应对脚本执行失败做容错处理  |
|  参数传递  |  KEYS 是数组，ARGV 是参数数组，顺序要对应  |

## 八、进阶建议 ##

- 将所有 Lua 脚本统一管理，使用配置中心或数据库存储
- 结合 AOP 或拦截器，实现 Lua 脚本调用的自动重试机制
- 使用 Redisson 等高级库简化 Lua 脚本操作
- 使用 Spring Cache 抽象层结合 Lua 脚本实现更复杂的缓存策略

## 示例结构图 ##

```txt
src/
├── main/
│   ├── java/
│   │   └── com.example.demo/
│   │       ├── DemoApplication.java
│   │       ├── service/
│   │       │   ├── RedisLuaService.java
│   │       │   └── LuaScriptLoader.java
│   │       └── controller/
│   │           └── RedisLuaController.java
│   └── resources/
│       └── lua/
│           └── get_or_set_default.lua
└── pom.xml
```

## 总结 ##

本文详细介绍了如何在 Spring Boot 中调用 Redis 的 Lua 脚本，包括：

- 添加必要的依赖
- 编写 Lua 脚本
- 使用 RedisTemplate 加载和调用脚本
- 构建完整的调用流程与接口测试

Lua 脚本非常适合用来实现一些需要原子性的 Redis 操作，是构建高并发系统的重要工具之一。
