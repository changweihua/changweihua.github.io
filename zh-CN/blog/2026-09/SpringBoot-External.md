---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 外部化配置详解
description: Spring Boot 外部化配置详解
date: 2026-09-08 13:25:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 什么是外部化配置？ ##

外部化配置是指将应用配置（如数据库连接、端口、日志级别等）从代码中分离出来，放在应用外部（如配置文件、环境变量、命令行参数等），以便在不修改代码的情况下改变应用行为。

Spring Boot 支持多种外部配置来源，按优先级从高到低排列，高优先级的配置会覆盖低优先级的配置。

## 配置来源与优先级 ##

Spring Boot 的配置加载顺序如下（从高到低）：

| 优先级 | 配置来源 | 示例 |
| :--- | :--- | :--- |
| 1 | 命令行参数 | `--server.port=8081` |
| 2 | 操作系统环境变量 | `SERVER_PORT=8081` |
| 3 | JVM 系统属性 | `-Dserver.port=8081` |
| 4 | application.{profile}.properties.yml | `application-prod.yml` |
| 5 | application.properties.yml | 默认配置文件 |
| 6 | `@PropertySource` 注解 | 加载自定义配置文件 |
| 7 | 默认值 | 代码中的 `@Value` 默认值 |


理解这个优先级顺序是排查配置不生效问题的前提。

```bash
# 命令行参数最高优先级
java -jar myapp.jar --server.port=8081

# 环境变量（将 . 替换为 _，转为大写）
export SERVER_PORT=8081
java -jar myapp.jar

# JVM 系统属性
java -Dserver.port=8081 -jar myapp.jar
```

## Profile 多环境配置 ##

Profile 是 Spring Boot 多环境管理的基础机制。通过激活不同的 Profile，应用会加载对应的配置文件。

### 多文件方式 ###

```txt
application.yml           # 通用配置
application-dev.yml       # 开发环境
application-test.yml      # 测试环境
application-prod.yml      # 生产环境
```

### 单文件多文档块方式 ###

```yml
# 默认配置
spring:
  profiles:
    active: dev

---
# 开发环境
spring:
  config:
    activate:
      on-profile: dev
server:
  port: 8080

---
# 生产环境
spring:
  config:
    activate:
      on-profile: prod
server:
  port: 80
```

### 激活 Profile 的方式 ###

```bash
# 命令行激活
java -jar myapp.jar --spring.profiles.active=prod

# 环境变量激活
export SPRING_PROFILES_ACTIVE=prod

# JVM 系统属性激活
java -Dspring.profiles.active=prod -jar myapp.jar
```

## `@Value` 与 `@ConfigurationProperties` ##

### `@Value` 注入单个配置值 ###

```java
@Service
public class AppConfig {
    @Value("${app.name:default-app}")
    private String appName;

    @Value("${app.timeout:30}")
    private int timeout;

    @Value("${app.features.enabled:false}")
    private boolean featureEnabled;
}
```

`@Value` 支持 `SpEL` 表达式，但只能注入简单类型。它会在 Spring 容器初始化时处理，如果配置缺失且没有默认值，启动时会抛出异常。

```java
@Value("#{${app.ports} ?: '{8080,8081}'}")
private int[] ports;
```

### `@ConfigurationProperties` 批量绑定 ###

```java
@Component
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {
    private String name;
    private int timeout;
    private List<String> servers;
    private Map<String, String> features;
    private Security security = new Security();

    @Data
    public static class Security {
        private boolean enabled;
        private String secret;
    }
}
```

*对应的配置*：

```yml
app:
  name: my-app
  timeout: 30
  servers:
    - server1.example.com
    - server2.example.com
  features:
    cache: true
    logging: false
  security:
    enabled: true
    secret: xyz123
```

`@ConfigurationProperties` 适合绑定一组相关配置，支持复杂类型（List、Map、嵌套对象），适合批量管理配置项。`@Value` 适合绑定单个配置值，适合只在少数地方使用的配置。

### 验证配置 ###

配合 `@Validated` 进行配置校验：

```java
@Component
@ConfigurationProperties(prefix = "app")
@Validated
@Data
public class AppProperties {
    @NotBlank
    private String name;

    @Min(1)
    @Max(60)
    private int timeout;
}
```

## 配置文件的位置 ##

Spring Boot 会按以下顺序查找 `application.yml` 或 `application.properties`：

1. 项目根目录下的 `config` 子目录（`/config/`）
2. 项目根目录
3. `classpath` 下的 `config` 包（`classpath:/config/`）
4. `classpath` 根目录

外置配置文件优先级更高，适合生产环境覆盖配置。

```txt
# 外置配置文件
/opt/app/config/application.yml

# 默认 classpath 配置文件
src/main/resources/application.yml
```

可以显式指定配置文件位置：

```bash
java -jar myapp.jar --spring.config.location=/opt/config/application.yml
spring.config.location 会覆盖默认路径，spring.config.additional-location 会在默认路径基础上添加额外路径。
```

## 随机值生成 ##

Spring Boot 支持使用 `RandomValuePropertySource` 生成随机值：

```yml
app:
  secret: ${random.value}
  uuid: ${random.uuid}
  number: ${random.int(100)}
  range: ${random.int(10,20)}
  long: ${random.long}
@Value("${app.secret}")
private String secret;

@Value("${app.uuid}")
private String uuid;
```

## 自定义配置文件 ##

### `@PropertySource` ###

加载自定义配置文件：

```java
@Configuration
@PropertySource("classpath:custom.properties")
@PropertySource("file:/opt/config/custom.properties")
public class CustomConfig {
    @Value("${custom.value}")
    private String customValue;
}
```

### 自定义 `PropertySource` ###

在代码中添加配置来源：

```java
@Component
public class CustomPropertySourceConfig {
    @Bean
    public PropertySource<?> customPropertySource() {
        Map<String, Object> map = new HashMap<>();
        map.put("custom.key", "custom-value");
        return new MapPropertySource("custom", map);
    }
}
```

## 类型安全配置提示 ##

为自定义配置类添加元数据，让 IDE 提供自动补全提示：

```java
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

编译后会生成 `META-INF/spring-configuration-metadata.json`，IDE 会识别并提供配置提示。

```java
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    /**
     * Application name
     */
    private String name;

    /**
     * Connection timeout in seconds
     */
    private int timeout = 30;
}
```

## 敏感信息处理 ##

生产环境中，数据库密码等敏感信息不应硬编码在配置文件中。

### 使用环境变量 ###

```yml
spring:
  datasource:
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

启动时通过环境变量传入：

```bash
export DB_USERNAME=root
export DB_PASSWORD=secret
java -jar myapp.jar
```

### 使用加密配置 ###

配合 Spring Cloud Config 或 Jasypt 进行配置加密。

Jasypt 示例：

```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.5</version>
</dependency>
```

```yml
spring:
  datasource:
    password: ENC(encrypted-password-value)
```

## 常见问题排查 ##

### 配置不生效 ###

检查配置来源的优先级顺序，高优先级的配置会覆盖低优先级。命令行参数 > 环境变量 > JVM 系统属性 > 外部配置文件 > 内部配置文件 > 默认值。

### 加载顺序确认 ###

在启动类中添加日志打印：

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(Application.class, args);
        ConfigurableEnvironment environment = context.getEnvironment();
        // 打印所有配置属性
        System.out.println(environment.getProperty("app.name"));
    }
}
```

### 属性来源查看 ###

启用 debug 模式查看配置加载详情：

```yml
debug: true
```

或启动时添加 `--debug` 参数，Spring Boot 会输出条件评估报告，显示每个自动配置类是否生效以及原因。

## 总结 ##

外部化配置是 Spring Boot 支持多环境部署的基础能力。掌握配置的优先级顺序、Profile 机制和配置绑定方式，就能灵活管理不同环境的配置，保证应用在不同部署环境中正确运行。生产环境中结合环境变量和加密方案管理敏感信息，避免将敏感信息泄露到代码仓库中。
