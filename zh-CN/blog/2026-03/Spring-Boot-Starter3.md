---
lastUpdated: true
commentabled: true
recommended: true
title: 如何发布自定义 Spring Boot Starter
description: 一篇学会 Spring Boot Starter 封装
date: 2026-03-20 09:35:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 引言 ##

最近在工作中遇到了 API 限流的需求，市面上虽然有一些现成的解决方案，但总觉得不够灵活，要么功能太重，要么配置复杂。于是萌生了一个想法：为什么不自己开发一个轻量级的限流器Starter呢？既能满足自己的需求，又能学习Spring Boot Starter的开发和发布流程。

这篇文章就来分享一下我是如何从零开始开发一个自定义限流器Spring Boot Starter，并最终成功发布到Maven Central的经历。希望能给有类似需求的同学一些参考。

## 为什么需要自定义Spring Boot Starter？ ##

在开始之前，我们先来聊聊Spring Boot Starter到底是什么，以及为什么要使用它。

简单来说，Spring Boot Starter是一种特殊的依赖项，它封装了一组相关的依赖和配置，让我们能够快速集成某个功能模块。比如我们常用的 spring-boot-starter-web、spring-boot-starter-data-jpa等，它们内部已经帮我们整合了多个相关的依赖，并提供了合理的默认配置。

那么，Spring Boot Starter相比传统的JAR包有什么优势呢？

- 自动配置：Starter可以根据类路径下的依赖自动配置相应的组件，大大减少了手动配置的工作量。
- 依赖聚合：一个Starter可以聚合多个相关的依赖，避免了手动管理复杂的依赖关系。
- 约定优于配置：提供了合理的默认配置，开箱即用。
- 条件化配置：通过 @ConditionalOnProperty、@ConditionalOnClass等注解，可以根据条件决定是否加载某些配置。

举个例子，如果我们直接使用Redis进行限流，需要引入 spring-boot-starter-data-redis，然后手动配置RedisTemplate，再编写限流逻辑。而有了限流器Starter后，只需要引入一个依赖，配置几个参数，就可以通过注解的方式实现限流，整个过程变得非常简单。

它背后也是 “行为和数据分离” 的软件设计理念的实际运用。

## 我的限流器 Starter 设计思路 ##

### 功能需求 ###

我的限流器Starter需要支持以下功能：

- 多种限流算法：令牌桶、漏桶、固定窗口、滑动窗口计数器和滑动窗口日志五种算法
- 注解驱动：通过简单的注解就能实现接口限流
- Redis存储：支持分布式环境下的限流一致性
- 灵活配置：支持全局配置和局部配置
- AOP无侵入：基于Spring AOP实现，对业务代码无侵入

### 核心架构 ###

整个Starter的核心架构如下：

```txt
┌─────────────────────────────────────┐
│        RateLimiterAutoConfiguration │
│        ──────────────────────────────│
│        • 配置各种限流算法的Bean      │
│        • 条件化加载                  │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│              限流注解               │
│        ──────────────────────────────│
│        • @FixedWindowRateLimiter    │
│        • @TokenBucketRateLimiter    │
│        • @LeakyBucketRateLimiter    │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│              限流切面               │
│        ──────────────────────────────│
│        • 基于AOP拦截方法调用        │
│        • 实现具体的限流逻辑         │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│              存储层                 │
│        ──────────────────────────────│
│        • Redis存储                  │
│        • Lua脚本保证原子性          │
└─────────────────────────────────────┘
```

### 关键代码实现 ###

#### 自动配置类 ####

首先，我们需要一个自动配置类，它会在Spring容器启动时自动配置我们的限流器组件：

```java
@Configuration
@ConditionalOnProperty(prefix = "rate-limiter", name = "enabled", havingValue = "true", matchIfMissing = true)
@EnableConfigurationProperties(RateLimiterProperties.class)
@ComponentScan(basePackages = "cn.springboot.starter.ratelimiter")
public class RateLimiterAutoConfiguration {

    @Bean
    public FixedWindowCounterScriptFactory fixedWindowCounterScriptFactory() {
        return new FixedWindowCounterScriptFactory();
    }

    @Bean
    public EnhancedTokenBucketScriptFactory tokenBucketScriptFactory() {
        return new EnhancedTokenBucketScriptFactory();
    }

    // ... 其他算法的ScriptFactory
}
```

这里有一个关键点需要注意：`@ComponentScan(basePackages = "cn.springboot.starter.ratelimiter")`注解的作用是让Spring能够扫描到我们Starter中定义的所有组件（包括切面、异常处理器等），这样它们才能被自动注册到Spring容器中。如果没有这个注解，消费端的Spring Boot应用在引入我们的Starter后将无法自动发现和加载这些组件。

这里有几个关键点：

- @ConditionalOnProperty：只有在配置了 rate-limiter.enabled=true时才加载配置
- @EnableConfigurationProperties：启用配置属性绑定
- @ComponentScan：扫描限流器相关的组件

#### 配置属性类 ####

为了让用户能够灵活配置限流参数，我们需要定义配置属性类：

```java
@Data
@ConfigurationProperties(prefix = "rate-limiter")
public class RateLimiterProperties {
    private boolean enabled = true;
    private long defaultLimit = 10;
    private long defaultWindowSize = 60;
    private String defaultMessage = "请求过于频繁，请稍后再试";
    private int maxKeyLength = 255;
}
```

这样用户就可以在 application.yml中配置：

```yaml
rate-limiter:
  enabled: true
  default-limit: 20
  default-window-size: 120
  default-message: "访问频率过高，请稍后再试"
```

#### 限流注解 ####

为了方便使用，我定义了多个限流注解，每种算法对应一个：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface FixedWindowRateLimiter {
    String key() default "";
    long limit() default 10;
    long windowSize() default 60;
    int permits() default 1;
    String message() default "请求过于频繁，请稍后再试";
}
```

#### AOP切面 ####

这是实现限流逻辑的核心部分，通过AOP拦截带有限流注解的方法：

```java
@Aspect
@Component
@Slf4j
@ConditionalOnProperty(name = "rate-limiter.enabled", havingValue = "true", matchIfMissing = true)
public class FixedWindowRateLimiterAspect extends AbstractRateLimiterAspect {
  
    private final RedisScript<Long> fixedWindowScript;

    public FixedWindowRateLimiterAspect(@Autowired(required = false) StringRedisTemplate redisTemplate,
                                        RateLimiterProperties properties,
                                        @Autowired(required = false) FixedWindowCounterScriptFactory scriptFactory) {
        super(redisTemplate, properties, null);
        this.fixedWindowScript = scriptFactory != null ? scriptFactory.createRateLimitScript() : null;
    }

    @Around("@annotation(rateLimiter)")
    public Object around(ProceedingJoinPoint point, FixedWindowRateLimiter rateLimiter) throws Throwable {
        Method method = getMethod(point);
        String key = generateKey(method, point.getArgs(), rateLimiter.key());

        long startTime = System.nanoTime();
        boolean allowed = checkFixedWindowRateLimit(key, rateLimiter);
        long executionTime = System.nanoTime() - startTime;

        if (!allowed) {
            log.warn("固定窗口限流超出配额，键值: {}", key);
            throw new RateLimitException(rateLimiter.message());
        }

        return point.proceed();
    }

    private boolean checkFixedWindowRateLimit(String key, FixedWindowRateLimiter rateLimiter) {
        if (!checkRedisAndScriptAvailability(key, fixedWindowScript)) {
            return false;
        }

        RedisRateLimitStorage fixedWindowRedisStorage = new RedisRateLimitStorage(redisTemplate, fixedWindowScript);
        return fixedWindowRedisStorage.isAllowed(key, rateLimiter.limit(), rateLimiter.windowSize(), rateLimiter.permits());
    }
}
```

#### Redis 存储与 Lua 脚本 ####

为了保证限流操作的原子性，我使用了Redis的Lua脚本来实现各种限流算法。以令牌桶算法为例：

```java
private static String getTokenBucketScript() {
    return """
        -- 令牌桶限流脚本
        -- KEYS[1] = 限流器的键
        -- ARGV[1] = 桶容量（最大令牌数）
        -- ARGV[2] = 填充速率（每秒令牌数）
        -- ARGV[3] = 需要获取的许可数

        local key = KEYS[1]
        local capacity = tonumber(ARGV[1])
        local refill_rate = tonumber(ARGV[2])  -- 每秒令牌数
        local permits = tonumber(ARGV[3])

        -- 从Redis获取当前桶状态（令牌数，上次填充时间）
        local bucket_state = redis.call('HMGET', key, 'tokens', 'last_refill_time')

        local current_tokens, last_refill_time

        if bucket_state[1] and bucket_state[2] then
            current_tokens = tonumber(bucket_state[1])
            last_refill_time = tonumber(bucket_state[2])
        else
            -- 如果桶不存在则初始化
            current_tokens = capacity
            last_refill_time = tonumber(redis.call('TIME')[1])
            redis.call('HMSET', key, 'tokens', current_tokens, 'last_refill_time', last_refill_time)
        end

        -- 获取当前时间
        local current_time = tonumber(redis.call('TIME')[1])

        -- 根据经过的时间计算要添加的令牌数
        local time_elapsed = current_time - last_refill_time
        local tokens_to_add = math.floor(time_elapsed * refill_rate)

        -- 更新令牌数，但不超过容量
        local new_tokens = math.min(capacity, current_tokens + tokens_to_add)

        -- 检查是否有足够的令牌用于请求
        if new_tokens >= permits then
            -- 扣除令牌并更新上次填充时间
            redis.call('HMSET', key, 'tokens', new_tokens - permits, 'last_refill_time', current_time)
            return 1  -- 请求允许
        else
            -- 即使请求被拒绝也要更新上次填充时间（防止滥用）
            redis.call('HMSET', key, 'tokens', new_tokens, 'last_refill_time', current_time)
            return 0  -- 请求拒绝
        end
        """;
}
```

## 实现限流器 Spring Boot Starter ##

### 项目结构 ###

Spring Boot Starter的项目结构如下：

```txt
src/
├── main/
│   ├── java/
│   │   └── cn/springboot/starter/ratelimiter/
│   │       ├── config/           # 配置相关类
│   │       ├── core/             # 核心功能类
│   │       │   ├── exception/    # 异常处理
│   │       │   ├── metrics/      # 指标监控（预留目录，目前为空）
│   │       │   └── storage/      # 存储相关（含Redis和Lua脚本）
│   │       │       └── script/   # Lua脚本实现
│   │       └── demo/             # 示例代码
│   └── resources/
│       └── META-INF/
│           └── additional-spring-configuration-metadata.json  # 配置元数据（手动补充的描述信息）
└── target/classes/META-INF/  # 编译后生成
    ├── spring-configuration-metadata.json  # 自动生成的配置元数据
    └── additional-spring-configuration-metadata.json  # 手动补充的配置元数据
└── test/
```

其中，core包是整个限流器的核心，包含了：

- exception：限流相关的异常定义
- metrics：性能指标收集（预留目录，目前为空）
- storage：存储层实现，包含Redis存储和Lua脚本
- storage/script：各种限流算法的Lua脚本实现
- Aspect：各个限流算法对应的AOP切面（如FixedWindowRateLimiterAspect等，位于core根目录）
- RateLimiter：各个限流算法对应的注解（如FixedWindowRateLimiter等，位于core根目录）

### 关键配置文件 ###

#### 配置元数据文件 ####

Spring Boot提供了配置元数据功能，可以让IDE提供配置提示。配置元数据文件的工作机制如下：

- 自动元数据生成：spring-boot-configuration-processor在编译时自动扫描 @ConfigurationProperties注解的类，生成 `spring-configuration-metadata.json` 文件，包含基本的配置属性信息，会自动将属性的注释信息作为元数据的 description。
- 手动补充元数据：在 `src/main/resources/META-INF/additional-spring-configuration-metadata.json` 中可以手动编写补充文件，添加更详细的描述信息，或补充处理器无法自动生成的配置属性，这个是可选的。
- 元数据合并：编译时，手动编写的 `additional-spring-configuration-metadata.json` 文件会与自动生成的元数据合并，最终形成完整的配置元数据。

additional-spring-configuration-metadata.json元数据文件：

```json
{
  "groups": [
    {
      "name": "rate-limiter",
      "type": "cn.springboot.starter.ratelimiter.config.RateLimiterProperties",
      "sourceType": "cn.springboot.starter.ratelimiter.config.RateLimiterProperties"
    }
  ],
  "properties": [
    {
      "name": "rate-limiter.enabled",
      "type": "java.lang.Boolean",
      "description": "是否启用限流",
      "defaultValue": true
    },
    {
      "name": "rate-limiter.default-limit",
      "type": "java.lang.Long",
      "description": "默认限制次数",
      "defaultValue": 10
    }
  ]
}
```

#### 注册自动配置类 ####

Spring Boot 3.x，在 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 文件写入：

```txt
cn.springboot.starter.ratelimiter.config.RateLimiterAutoConfiguration
```

Spring Boot 2.7及以前版本，在 `META-INF/spring.factories` 文件中注册自动配置类：

```ini
org.springframework.boot.autoconfigure.AutoConfiguration.imports=cn.springboot.starter.ratelimiter.config.RateLimiterAutoConfiguration
```

### 依赖管理 ###

在 pom.xml中，我们需要合理管理依赖：

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-aop</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-configuration-processor</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

注意将 `spring-boot-configuration-processor` 设置为 `optional=true`，这样它不会传递给使用Starter的项目。

## 发布到 Maven Central ##

发布到Maven Central是一个相对复杂的过程，需要遵循严格的规范。以下是我在实践中总结的完整流程：

### 准备工作 ###

#### 注册Sonatype账号 ####

首先需要在Sonatype Central Portal注册账号，这是发布到Maven Central的入口。

#### 申请Namespace权限 ####

登录后需要申请命名空间权限。我申请的是 io.github.changweihua，这通常对应你的GitHub用户名或组织名。申请时需要提供项目URL和SCM URL。

> 重要提醒：这里的命名空间名称需要与你在项目pom.xml中配置的groupId保持一致，因为Sonatype会验证你是否有权在这个命名空间下发布构件。

###  GPG签名设置 ###

发布到 Maven Central 必须使用 GPG签名来保证构件的完整性和真实性。

#### 安装GPG ####

```bash
# macOS
brew install gpg

# Ubuntu/Debian
sudo apt-get install gnupg

生成GPG密钥对
bash 体验AI代码助手 代码解读复制代码gpg --gen-key
```

按照提示填写信息，建议设置一个强密码。

#### 上传公钥到密钥服务器 ####

```bash
# 推荐使用 keys.openpgp.org
gpg --keyserver keys.openpgp.org --send-keys YOUR_KEY_ID

# 备用服务器
gpg --keyserver keyserver.ubuntu.com --send-keys YOUR_KEY_ID
gpg --keyserver pgp.mit.edu --send-keys YOUR_KEY_ID
```

### Maven配置 ###

在 `~/.m2/settings.xml` 中配置Sonatype认证信息：

```xml
<settings>
  <servers>
    <server>
      <id>central</id>
      <username>YOUR_SONATYPE_USERNAME</username>
      <password>YOUR_SONATYPE_PASSWORD</password>
    </server>
  </servers>
</settings>
```

注意：Sonatype现在使用User Token进行认证，需要在Central Portal中生成用户令牌。

### 项目POM配置 ###

在项目的 pom.xml中添加必要的插件和配置：

```xml
<build>
    <plugins>
        <!-- 编译插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <source>17</source>
                <target>17</target>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>
        <!-- 源码插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-source-plugin</artifactId>
            <version>3.3.0</version>
            <executions>
                <execution>
                    <id>attach-sources</id>
                    <goals>
                        <goal>jar-no-fork</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        <!-- JavaDoc插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-javadoc-plugin</artifactId>
            <version>3.6.3</version>
            <executions>
                <execution>
                    <id>attach-javadocs</id>
                    <goals>
                        <goal>jar</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        <!-- GPG签名插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-gpg-plugin</artifactId>
            <version>3.2.4</version>
            <executions>
                <execution>
                    <id>sign-artifacts</id>
                    <phase>verify</phase>
                    <goals>
                        <goal>sign</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        <!-- Central Publishing插件 -->
        <plugin>
            <groupId>org.sonatype.central</groupId>
            <artifactId>central-publishing-maven-plugin</artifactId>
            <version>0.9.0</version>
            <extensions>true</extensions>
            <configuration>
                <publishingServerId>central</publishingServerId>
            </configuration>
        </plugin>
    </plugins>
</build>
<!-- 发布管理 -->
<distributionManagement>
    <snapshotRepository>
        <id>central</id>
        <url>https://central.sonatype.com/content/repositories/snapshots</url>
    </snapshotRepository>
    <repository>
        <id>central</id>
        <url>https://central.sonatype.com/service/local/staging/deploy/maven2/</url>
    </repository>
</distributionManagement>
```

### 发布流程 ###

#### 验证构建 ####

```bash
./mvnw clean verify
```

确保所有测试通过，且生成了必需的构件（JAR、Sources、Javadoc）。

#### 执行发布 ####

```bash
export GPG_TTY=$(tty)
./mvnw clean deploy -DskipTests
```

> 注意设置 GPG_TTY环境变量，这可以解决在某些终端环境下GPG无法获取密码的问题。

### 在Central Portal中确认发布 ###

发布完成后，登录Sonatype Central Portal，在"Upload" -> "Components"页面找到刚上传的组件，点击"Publish"按钮完成发布。

## 发布过程中的踩坑经验 ##

### GPG签名问题 ###

最常见的问题是GPG签名失败。我遇到过以下几种情况：

- "gpg: signing failed: Inappropriate ioctl for device"：这是最常见的一种错误，解决方案是设置 GPG_TTY=$(tty)
- "Invalid signature"：通常是因为公钥没有正确上传到PGP服务器，需要等待服务器同步
- GPG agent问题：有时GPG agent没有正确运行，需要重启

### 构件验证失败 ###

Maven Central对发布的构件有严格的要求：

- 必须包含sources和javadoc
- 所有构件都必须签名
- POM文件必须包含完整的元数据（许可证、开发者信息、SCM信息等）
- JavaDoc不能有警告

### 版本管理 ###

- 一旦发布到 Maven Central，无法删除或修改已发布的版本
- 确保版本号唯一且有意义
- 发布正式版本时，不要使用 `-SNAPSHOT` 后缀

## 消费端如何使用 ##

发布成功后，用户就可以通过简单的依赖引入来使用我们的限流器：

```xml
<dependency>
    <groupId>io.github.yuanshenjian-cn</groupId>
    <artifactId>api-rate-limiter-spring-boot-starter</artifactId>
    <version>1.0.7</version>
</dependency>
```

然后在代码中使用：

```java
@RestController
public class ApiController {

    // 使用令牌桶算法
    @TokenBucketRateLimiter(
        key = "'api:user:' + #id",         // 限流键，支持 SpEL 表达式
        capacity = 5,                      // 桶容量
        refillRate = 1,                    // 每秒填充1个令牌
        message = "访问频率过高，请稍后再试"
    )
    @GetMapping("/api/user/{id}")
    public String getUser(@PathVariable String id) {
        return "User: " + id;
    }

    // 使用固定窗口算法
    @FixedWindowRateLimiter(
        key = "'api:order:' + #orderId",   // 限流键
        limit = 10,                        // 限制次数
        windowSize = 60,                   // 时间窗口（秒）
        message = "访问频率过高，请稍后再试"
    )
    @PostMapping("/api/order/{orderId}")
    public String createOrder(@PathVariable String orderId) {
        return "Order created: " + orderId;
    }

    // 使用漏桶算法
    @LeakyBucketRateLimiter(
        key = "'api:upload:' + #userId",   // 限流键
        capacity = 5,                      // 桶容量
        leakRate = 2,                      // 每秒处理2个请求
        message = "访问频率过高，请稍后再试"
    )
    @PostMapping("/api/upload")
    public String uploadFile() {
        return "File uploaded successfully";
    }
}
```

## 总结 ##

这次发布一个 Spring Boot Starter 是一个很好的学习过程，让我深入了解了 Spring Boot 的自动配置机制、AOP编程、Redis应用以及Maven发布流程。

这个项目从构思到发布，经历了需求分析、架构设计、编码实现、测试验证、发布上线等多个阶段。每一个环节都有值得学习的地方，特别是发布到Maven Central的过程，让我对开源软件的发布标准有了更深的认识。

> 一篇学会 Spring Boot Starter 封装，实战案例

## 一、为什么要封装Starter？ ##

在企业级开发中，我们经常需要将通用能力（如鉴权、日志、分布式锁等）抽象为可复用的组件。Spring Boot Starter 的封装能带来三大核心优势：

- ​配置统一管理​ - 通过 `application.properties` 实现“开箱即用”，避免重复配置
- ​依赖自动装配​ - 按需加载Bean，解决传统组件依赖复杂的问题
- ​版本统一控制​ - 在父POM中管理依赖版本，规避兼容性风险

​举个实际痛点​：

传统JWT工具类需要每个项目手动配置密钥、过期时间等参数，而通过Starter封装后，只需引入依赖即可直接注入预配置的Bean。

## 二、手把手实现JWT Starter ##

### 创建模块 & 初始化依赖 ###

按Spring官方规范命名模块：jwt-spring-boot-starter

```xml
<!-- 核心依赖 -->
<dependencies>
    <!-- JJWT 相关 -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    
    <!-- 配置元数据生成 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-configuration-processor</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

### 创建配置文件 & Properties类 ###

创建 `resources/config/jwt-default.properties`

此文件用于在Starter导入其他模块下，其他模块下没有配置jwt属性时，使用Starter内部的配置文件属性。

```ini
jwt.key=default_secret_key
jwt.access_token_ttl=300000
jwt.refresh_token_ttl=604800000
```

创建 JwtProperties 类：

```java
@Data
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String key;
    private long accessTokenTtl;
    private long refreshTokenTtl;
}
```

### 实现自动配置类 ###

```java
@Configuration
@EnableConfigurationProperties(JwtProperties.class)
@PropertySource("classpath:/config/jwt-default.properties")
@ConditionalOnClass(Jwts.class) // 当JJWT存在时生效
@ConditionalOnProperty(prefix = "jwt", name = "enabled", matchIfMissing = true)
public class JwtAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean // 用户未自定义时生效
    public JwtUtil jwtUtil(JwtProperties properties) {
        return new JwtUtil(properties);
    }
}
```

### 编写JWT核心工具类 ###

```java
public class JwtUtil {
    private final JwtProperties properties;

    public JwtUtil(JwtProperties properties) {
        this.properties = properties;
    }

    // 生成AccessToken（示例代码）
    public String createAccessToken(ClaimDTO claims) {
        return Jwts.builder()
                .setClaims(convertToMap(claims))
                .setExpiration(new Date(System.currentTimeMillis() + properties.getAccessTokenTtl()))
                .signWith(Keys.hmacShaKeyFor(properties.getKey().getBytes()))
                .compact();
    }

    // Token校验（返回枚举更规范）
    public TokenStatus validateToken(String token) {
        try {
            parseToken(token);
            return TokenStatus.VALID;
        } catch (ExpiredJwtException e) {
            return TokenStatus.EXPIRED;
        } 
        // ... 其他异常处理
    }
}
```

### 注册自动配置 ###

在 `resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 中写入：

```txt
net.cmono.jwtspringbootstarter.config.JwtAutoConfiguration
```

> 注意： 此注册自动配置为Spring Boot 3.x 版本。

## 三、在项目中集成Starter ##

### 引入依赖 ###

```xml
<dependency>
    <groupId>io.github.changweihua</groupId>
    <artifactId>jwt-spring-boot-starter</artifactId>
    <version>0.0.1</version>
</dependency>
```

### 自定义配置（可选） ###

在 application.yml 中覆盖默认值：

```yaml
jwt:
  key: your_secure_key_here
  access-token-ttl: 3600000 # 1小时
```

### 直接注入使用 ###

```java
@RestController
public class AuthController {

    private final JwtUtil jwtUtil;

    // 构造器注入
    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        // ... 验证逻辑
        return jwtUtil.createAccessToken(user);
    }
}
```

### 注意事项 ###

对于Starter导入其他模块时，其他模块下的配置文件没有配置Starter所需的配置时，Starter的默认配置丢失，解决方案:

- 在 `jwtProperties` 类中直接设置默认值

```java
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    // 直接设置字段默认值
    private String secretKey = "default-secret";
    private long expiration = 3600L; 
}
```

- 使用 `@PropertySource` 从而确保使用Starter内部配置文件

因为Spring Boot配置加载优先级的原因：

- Spring Boot的配置加载遵循特定优先级，后加载的配置会覆盖先加载的。
- 如果其他模块的配置文件中定义了同名属性，会覆盖Starter的默认配置。
- 若模块未显式配置属性，但Starter的默认值未生效，需检查Starter的默认值设置方式：
- 出现此问题就需要使用到 @PropertySource 注解，就如上示例使用方法一致。

## 四、配置加载优先级解密 ##

当自定义配置与Starter默认配置冲突时，Spring Boot按以下优先级处理（从高到低）：

### ​命令行参数​ ###

```bash
java -jar app.jar --jwt.key=cli_key
```

### ​应用配置文件​ ###

```txt
application.properties > application.yml
```

### ​Starter默认配置​ ###

jwt-default.properties

### ​代码默认值​ ###

JwtProperties 类中的字段初始值

## 五、封装经验总结 ##

### ​避免过度设计​ ###

首版只需实现核心功能，迭代中逐步添加如Redis令牌黑名单等高级特性

### ​防御性编程​ ###

- 对密钥进行非空校验：Assert.hasText(properties.getKey(), "JWT密钥不能为空")
- Token解析增加空值判断

> 现在已经可以举一反三学会封装其他的啦！

## 六、踩坑警示录 ##

### ​典型问题1​：Bean注入冲突 ###

👉 ​现象​：启动报 No qualifying bean of type 'JwtUtil'

✅ ​解决方案​：检查是否误加了 @Component 注解，应通过自动配置类创建Bean

### ​典型问题2​：配置未生效 ###

👉 ​现象​：修改 application.yml 后仍使用默认值

✅ ​排查步骤​：

- 检查配置项命名是否符合kebab-case（如access-token-ttl）
- 确认配置路径是否被更高优先级的源覆盖
