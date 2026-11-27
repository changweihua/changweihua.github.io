---
lastUpdated: true
commentabled: true
recommended: true
title: Nacos 注册与配置中心实战笔记
description: Nacos 注册与配置中心实战笔记
date: 2026-11-27 10:35:00
pageClass: blog-page-class
cover: /covers/android.svg
---

## Nacos 是什么？ ##

Nacos（Naming and Configuration Service）是阿里巴巴开源的*动态服务发现、配置管理和服务管理平台*，在 Spring Cloud Alibaba 体系中承担两大核心角色：

| 能力 | 作用 |
| --- | --- |
| 注册中心 | 服务注册（监控上下线）+ 服务发现（远程调用前找到目标地址） |
| 配置中心 | 统一管理配置文件 + 推送配置变更 |


## 安装与启动 ##

1. 下载 Nacos Server（建议 2.x 版本，如 2.4.3）
2. 解压后进入 bin 目录
3. 单机模式启动：

```bash
# Windows
startup.cmd -m standalone

# Linux / macOS
sh startup.sh -m standalone
```

4. 访问控制台：`http://localhost:8848/nacos`
5. 默认账号密码均为 `nacos`

## 注册中心 ##

### 引入依赖 ###

在 `services` 父模块或各微服务模块中引入：

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

### 服务注册 ###

以 `service-order`（端口 8000）和 `service-product`（端口 9000）为例：

service-order — application.properties

```ini
server.port=8000
spring.application.name=service-order
spring.cloud.nacos.server-addr=127.0.0.1:8848
```

service-product — application.properties

```ini
server.port=9000
spring.application.name=service-product
spring.cloud.nacos.server-addr=127.0.0.1:8848
```

启动两个服务后，在 Nacos 控制台的「服务管理 → 服务列表」中即可看到注册成功的实例。

集群示例：

- `service-order` 启动 2 个实例：8000、8001
- `service-product` 启动 3 个实例：9000、9001、9002

同一服务名下会显示多个实例，为后续负载均衡做准备。

### 服务发现 ###

启动类添加 `@EnableDiscoveryClient`：

```java
@EnableDiscoveryClient
@SpringBootApplication
public class ProductMainApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductMainApplication.class, args);
    }
}
```

通过 `DiscoveryClient` 或 `NacosDiscoveryClient` 获取所有服务及实例：

```java
@SpringBootTest
public class ProductApplicationTest {

    @Autowired
    DiscoveryClient discoveryClient;

    @Test
    public void discoveryClientTest() {
        for (String service : discoveryClient.getServices()) {
            System.out.println("service = " + service);
            for (ServiceInstance instance : discoveryClient.getInstances(service)) {
                System.out.println("host = " + instance.getHost());
                System.out.println("port = " + instance.getPort());
            }
        }
    }
}
```

## 远程调用 ##

### 注册 RestTemplate ###

```java
@Configuration
public class OrderConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

### 手动发现 + 远程调用 ###

```java
@Service
@Slf4j
public class OrderServiceImpl implements OrderService {

    @Autowired
    DiscoveryClient discoveryClient;
    @Autowired
    RestTemplate restTemplate;

    public Product getProductFromRemote(Long productId) {
        // 1. 从 Nacos 获取 service-product 的所有实例
        List<ServiceInstance> instances = discoveryClient.getInstances("service-product");
        ServiceInstance instance = instances.get(0);

        // 2. 拼接 URL 并发起远程请求
        String url = "http://" + instance.getHost() + ":" + instance.getPort()
                     + "/productId/" + productId;
        log.info("远程请求：{}", url);
        return restTemplate.getForObject(url, Product.class);
    }
}
```

测试：`http://localhost:8000/create?userId=2&productId=23`

## 负载均衡 ##

引入 LoadBalancer 依赖：

```java
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

### 方案一：LoadBalancerClient ###

```java
@Autowired
LoadBalancerClient loadBalancerClient;

public Product getProductFromRemoteWithLoadBalance(Long productId) {
    ServiceInstance choose = loadBalancerClient.choose("service-product");
    String url = "http://" + choose.getHost() + ":" + choose.getPort()
                 + "/productId/" + productId;
    return restTemplate.getForObject(url, Product.class);
}
```

### 方案二：@LoadBalanced 注解（推荐） ###

```java
@Configuration
public class OrderConfig {
    @LoadBalanced
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

远程调用时直接使用*服务名*代替 IP + 端口：

```java
public Product getProductFromRemoteWithLoadBalanceAnnotation(Long productId) {
    // service-product 会被 LoadBalancer 动态解析为某个实例
    String url = "http://service-product/productId/" + productId;
    return restTemplate.getForObject(url, Product.class);
}
```

多次请求会在多个实例间轮询分发。

### 思考：Nacos 宕机后，远程调用还能成功吗？ ###

| 场景 | 结果 |
| --- | --- |
| 从未发起过远程调用，Nacos 宕机 | ❌ 失败，拿不到服务地址 |
| 已成功调用过，Nacos 再宕机 | ✅ 仍可调用（地址已缓存） |
| 缓存中的目标实例宕机 | ❌ 失败 |


*原理*：

1. *第一次*远程调用：从 Nacos 拉取地址列表 → 选一个实例发请求
2. *第二次及以后*：直接使用本地缓存的地址列表，跳过 Nacos 查询

## 配置中心 ##

### 引入依赖 ###

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

### 客户端配置 ###

service-order — application.properties

```ini
server.port=8000
spring.application.name=service-order
spring.cloud.nacos.server-addr=127.0.0.1:8848
spring.config.import=nacos:service-order.properties
spring.cloud.nacos.config.import-check.enabled=false
```

> `import-check.enabled=false`：暂未使用配置中心时可关闭检查，避免启动报错。

### Nacos 控制台创建配置 ###

在 Nacos 控制台「配置管理 → 配置列表」新建：

- Data ID：`service-order.properties`
- Group：`DEFAULT_GROUP`
- 配置内容：


```ini
order.timeout=30
order.auto-confirm=true
```

### 代码读取配置 ###

```java
@RestController
public class OrderController {

    @Value("${order.timeout}")
    String orderTimeout;

    @Value("${order.auto-confirm}")
    String orderAutoConfirm;

    @GetMapping("/config")
    public String getConfig() {
        return orderTimeout + " : " + orderAutoConfirm;
    }
}
```

访问 `http://localhost:8000/config` 即可看到 Nacos 中的配置值。

### 配置优先级 ###

Nacos 配置中心 > 本地 `application.properties`

若两边存在相同配置项，以 Nacos 为准。

## 配置动态刷新 ##

修改 Nacos 配置后，不重启服务如何实时生效？

### 方案一：`@RefreshScope` + `@Value` ###

```java
@RefreshScope
@RestController
public class OrderController {
    @Value("${order.timeout}")
    String orderTimeout;
    // ...
}
```

### 方案二：`@ConfigurationProperties`（推荐，无感刷新） ###

```java
@Component
@ConfigurationProperties(prefix = "order")
@Data
public class OrderProperties {
    private String timeout;
    private String autoConfirm;
}
@RestController
public class OrderController {

    @Autowired
    OrderProperties orderProperties;

    @GetMapping("/config")
    public String getConfig() {
        return orderProperties.getTimeout() + " : " + orderProperties.getAutoConfirm();
    }
}
```

使用 `@ConfigurationProperties` 绑定 Nacos 配置时，无需 `@RefreshScope` 即可自动刷新。

### 方案三：NacosConfigManager 监听变化 ###

适合配置变更后执行业务逻辑（如发邮件通知）：

```java
@SpringBootApplication
public class OrderMainApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderMainApplication.class, args);
    }

    @Bean
    ApplicationRunner applicationRunner(NacosConfigManager nacosConfigManager) {
        return args -> {
            ConfigService configService = nacosConfigManager.getConfigService();
            configService.addListener("service-order.properties", "DEFAULT_GROUP", new Listener() {
                @Override
                public Executor getExecutor() {
                    return Executors.newFixedThreadPool(4);
                }

                @Override
                public void receiveConfigInfo(String configInfo) {
                    System.out.println("配置已变更：" + configInfo);
                    // 可在此发送邮件、刷新缓存等
                }
            });
        };
    }
}
```

## 数据隔离（Namespace / Group） ##

Nacos 通过三层结构管理配置：

| 层级 | 用途 | 示例 |
| --- | --- | --- |
| Namespace | 环境隔离 | dev、test、prod |
| Group | 服务/业务隔离 | order、product |
| Data ID | 具体配置文件 | common.properties |


application.yml 多环境示例：

```yml
server:
  port: 8000

spring:
  profiles:
    active: prod
  application:
    name: service-order
  cloud:
    nacos:
      server-addr: 127.0.0.1:8848
      config:
        import-check:
          enabled: false
        namespace: ${spring.profiles.active:public}

---
spring:
  config:
    import:
      - nacos:common.properties?group=order
      - nacos:database.properties?group=order
    activate:
      on-profile: dev

---
spring:
  config:
    import:
      - nacos:common.properties?group=order
      - nacos:database.properties?group=order
      - nacos:haha.properties?group=order
    activate:
      on-profile: test

---
spring:
  config:
    import:
      - nacos:common.properties?group=order
      - nacos:database.properties?group=order
      - nacos:hehe.properties?group=order
    activate:
      on-profile: prod
```

切换 `spring.profiles.active` 即可加载对应 Namespace 和配置文件组合。

## 快速上手清单 ##

### 注册中心 ###

1. 引入 `nacos-discovery` 依赖
2. 配置 `spring.cloud.nacos.server-addr`
3. 启动 Nacos Server
4. 启动微服务，在控制台确认注册
5. 启动类加 `@EnableDiscoveryClient`
6. 引入 loadbalancer，用 `@LoadBalanced RestTemplate` 实现负载均衡远程调用

### 配置中心 ###

1. 引入 `nacos-config` 依赖
2. 配置 `spring.config.import=nacos:xxx.properties`
3. 在 Nacos 控制台创建对应配置
4. 用 `@Value` + `@RefreshScope` 或 `@ConfigurationProperties` 读取
5. 多环境用 Namespace，多服务用 Group，多文件用不同 Data ID

## 小结 ##

Nacos 是 Spring Cloud Alibaba 微服务体系的基础设施，核心价值在于：

- 注册中心：让服务自动注册、自动发现，配合 LoadBalancer 实现负载均衡调用
- 配置中心：集中管理配置、动态推送变更，支持 Namespace / Group 多维度隔离
- 本地缓存：首次调用后缓存服务列表，Nacos 短暂宕机不影响已有调用链路

掌握 Nacos 的注册发现与配置管理能力，是后续学习 OpenFeign、Sentinel、Gateway 等组件的前提。

