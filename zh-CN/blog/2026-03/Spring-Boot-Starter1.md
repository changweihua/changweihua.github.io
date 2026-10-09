---
lastUpdated: true
commentabled: true
recommended: true
title: 自定义 Spring Boot Starter
description: 手搓“轮子”，但要搓出兰博基尼！
date: 2026-03-20 11:35:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

兄弟们，你有没有这样的经历：公司有 10 个项目，每个都要配 Redis、配 MQ、配一堆第三方服务，每次新建项目就像搬家——要把所有家具重新买一遍？累不累？😫

*Spring Boot Starter 就是你的“装修全包服务” 。*你负责说“我要个现代简约风”，装修队（Starter）自动给你装好地板、刷好墙、摆好家具。今天，咱们就聊聊怎么当这个“装修公司老板”——手搓自己的 Starter！💪

## 一、为什么造轮子？—— 从“搬砖工”到“包工头” 🧱➡️👷 ##

### 场景1：公司的“用户中心客户端” ###

每个服务都要：

- 引入用户中心 SDK
- 配 application.yml
- 写 @Bean配置
- 处理异常
- 加监控...

结果：20 个项目，同样代码复制 20 遍。某天 SDK 升级，改 20 遍！🤯

### 场景2：祖传“加密工具包” ###

A 项目用 MD5，B 项目用 AES，C 项目用国密 SM4...

问题：

- 新人不会用
- 算法不一致
- 密钥管理混乱

解决方案：封装成 Starter！

```xml
<!-- 使用前 -->
<dependency>
    <groupId>com.company</groupId>
    <artifactId>crypto-utils</artifactId>
    <version>1.0</version>
</dependency>
<!-- 还要写一堆配置... -->

<!-- 使用后 -->
<dependency>
    <groupId>com.company</groupId>
    <artifactId>crypto-spring-boot-starter</artifactId>
    <version>1.0</version>
</dependency>
<!-- 自动生效！ -->
```

一句话：Starter 让你的代码从“开源库”升级为“企业级解决方案” 。

## 二、Starter 本质：Spring Boot 的“外挂”模块 🎮 ##

### 类比：游戏外挂 ###

- 原版游戏：Spring Boot
- MOD：你的 Starter
- 加载器：spring.factories
- 配置文件：application.yml

### 核心机制 ###

1. 引入你的 Starter
2. Spring Boot 启动，扫描所有 `META-INF/spring.factories`
3. 找到你的自动配置类
4. 按条件（@Conditional）创建 Bean
5. 用户直接 @Autowired 使用

## 三、实战：打造“智能监控 Starter” 📊 ##

### 目标：smart-monitor-starter ###

功能：

- 自动收集应用指标（CPU、内存、请求数）
- 可配置上报到不同平台（控制台、Prometheus、钉钉）
- 提供健康检查端点
- 零配置开箱即用

## 四、手把手搓轮子 🛠️ ##

### 第 1 步：项目结构（双模块最佳实践） ###

```txt
smart-monitor-parent/
├── smart-monitor-spring-boot-autoconfigure/
│   ├── src/main/java/com/example/monitor/
│   │   ├── MonitorProperties.java      # 配置类
│   │   ├── MonitorAutoConfiguration.java # 自动配置
│   │   ├── MonitorService.java         # 核心服务
│   │   ├── health/                     # 健康检查
│   │   ├── metrics/                    # 指标收集
│   │   └── endpoint/                   # 监控端点
│   └── src/main/resources/META-INF/
│       ├── spring.factories           # 注册配置
│       └── additional-spring-configuration-metadata.json # 配置提示
└── smart-monitor-spring-boot-starter/
    └── pom.xml                        # 空模块，只引入autoconfigure
```

为什么分两个模块？

- autoconfigure：包含所有实现
- starter：空壳，只负责引入依赖
- 好处：用户可选只引入 autoconfigure

### 第 2 步：核心配置类 ###

```java
@ConfigurationProperties(prefix = "smart.monitor")
public class MonitorProperties {
    private boolean enabled = true;  // 默认启用
    private ReporterType reporter = ReporterType.CONSOLE;  // 上报方式
    private String webhook;  // 钉钉/webhook地址
    private int interval = 60;  // 上报间隔秒
    
    public enum ReporterType {
        CONSOLE, PROMETHEUS, DINGTALK, CUSTOM
    }
    
    // getters/setters...
}
```

### 第 3 步：自动配置类（核心！） ###

```java
@Configuration
@EnableConfigurationProperties(MonitorProperties.class)  // 启用配置
@ConditionalOnClass(MonitorService.class)  // 有 MonitorService 才生效
@ConditionalOnProperty(prefix = "smart.monitor", 
                      value = "enabled", 
                      havingValue = "true", 
                      matchIfMissing = true)  // 默认启用
@AutoConfigureAfter({MetricsAutoConfiguration.class,  // 在 metrics 之后
                     WebMvcAutoConfiguration.class})  // 在 web 之后
public class MonitorAutoConfiguration {
    
    // 1. 核心服务 Bean
    @Bean
    @ConditionalOnMissingBean  // 用户没定义时才创建
    public MonitorService monitorService(MonitorProperties properties) {
        return new MonitorService(properties);
    }
    
    // 2. 健康指示器
    @Bean
    @ConditionalOnClass(HealthIndicator.class)
    @ConditionalOnEnabledHealthIndicator("monitor")
    public MonitorHealthIndicator monitorHealthIndicator() {
        return new MonitorHealthIndicator();
    }
    
    // 3. 监控端点（Spring Boot Actuator）
    @Bean
    @ConditionalOnClass(Endpoint.class)
    @ConditionalOnEnabledEndpoint(endpoint = MonitorEndpoint.class)
    public MonitorEndpoint monitorEndpoint() {
        return new MonitorEndpoint();
    }
    
    // 4. 指标收集器
    @Bean
    @ConditionalOnBean(MeterRegistry.class)  // 有 MeterRegistry 才创建
    public MonitorMetrics monitorMetrics(MeterRegistry registry) {
        return new MonitorMetrics(registry);
    }
}
```

### 第 4 步：注册自动配置 ###

```ini
# META-INF/spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.monitor.MonitorAutoConfiguration
```

### 第 5 步：配置元数据（IDE 提示） ###

```json:additional-spring-configuration-metadata.json
{
  "properties": [
    {
      "name": "smart.monitor.enabled",
      "type": "java.lang.Boolean",
      "description": "是否启用智能监控",
      "defaultValue": true
    },
    {
      "name": "smart.monitor.reporter",
      "type": "com.example.monitor.MonitorProperties$ReporterType",
      "description": "监控数据上报方式",
      "defaultValue": "CONSOLE"
    },
    {
      "name": "smart.monitor.webhook",
      "type": "java.lang.String",
      "description": "钉钉/webhook地址，reporter为DINGTALK时必填"
    }
  ]
}
```

### 第 6 步：Starter 模块 POM ###

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.example</groupId>
    <artifactId>smart-monitor-spring-boot-starter</artifactId>
    <version>1.0.0</version>
    
    <dependencies>
        <!-- 核心：依赖 autoconfigure 模块 -->
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>smart-monitor-spring-boot-autoconfigure</artifactId>
            <version>1.0.0</version>
        </dependency>
        
        <!-- 可选：传递依赖 -->
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-core</artifactId>
            <optional>true</optional>  <!-- 关键：optional -->
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>
```

注意：依赖用 `<optional>true</optional>`，不强制传递。用户需要时才自己引入。

## 五、高级技巧：让你的 Starter 更专业 🎩 ##

### 技巧 1：条件装配的“三十六计” ###

```java
// 1. 根据类路径
@ConditionalOnClass(name = "com.example.ExternalClass")

// 2. 根据 Bean
@ConditionalOnMissingBean(DataSource.class)

// 3. 根据属性
@ConditionalOnProperty(prefix = "db", name = "type", havingValue = "mysql")

// 4. 根据表达式
@ConditionalOnExpression("#{environment.getProperty('mode') == 'cluster'}")

// 5. 根据资源
@ConditionalOnResource(resources = "classpath:config.properties")

// 6. 根据 Web 环境
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnNotWebApplication
```

### 技巧 2：多环境支持 ###

```java
@Configuration
public class MonitorAutoConfiguration {
    
    @Configuration
    @ConditionalOnCloudPlatform(CloudPlatform.KUBERNETES)  // K8s 环境
    static class K8sConfiguration {
        @Bean
        public K8sMonitorService k8sMonitorService() {
            return new K8sMonitorService();
        }
    }
    
    @Configuration
    @ConditionalOnProperty(name = "spring.profiles.active", 
                          havingValue = "local")
    static class LocalConfiguration {
        @Bean
        public ConsoleMonitorService consoleMonitorService() {
            return new ConsoleMonitorService();
        }
    }
}
```

### 技巧 3：启动器监听器 ###

```java
@Component
public class MonitorApplicationRunner implements ApplicationRunner {
    
    @Override
    public void run(ApplicationArguments args) {
        // 应用启动后执行
        System.out.println("🎉 Smart Monitor Starter 已激活！");
    }
}
```

### 技巧 4：自动配置顺序 ###

```java
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE + 100)  // 优先级
@AutoConfigureBefore(DataSourceAutoConfiguration.class)  // 在数据源之前
@AutoConfigureAfter(JacksonAutoConfiguration.class)      // 在 Jackson 之后
public class MonitorAutoConfiguration {
    // ...
}
```

### 技巧 5：SPI 扩展点 ###

```java
// 1. 定义接口
public interface MonitorReporter {
    void report(Metrics metrics);
}

// 2. 自动发现实现
@Bean
@ConditionalOnMissingBean
public MonitorReporter monitorReporter(
        ObjectProvider<List<MonitorReporter>> reportersProvider) {
    List<MonitorReporter> reporters = reportersProvider.getIfAvailable();
    return new CompositeMonitorReporter(reporters);
}

// 3. 用户可自定义实现
@Component
public class CustomReporter implements MonitorReporter {
    // 自定义上报逻辑
}
```

## 六、测试：Starter 的“体检报告” 🏥 ##

### 单元测试 ###

```java
@SpringBootTest
class MonitorAutoConfigurationTest {
    
    @Autowired(required = false)
    private MonitorService monitorService;
    
    @Test
    void testAutoConfiguration() {
        // 1. 默认应创建 Bean
        assertThat(monitorService).isNotNull();
        
        // 2. 禁用时不创建
        this.contextRunner
            .withPropertyValues("smart.monitor.enabled=false")
            .run(context -> assertThat(context)
                .doesNotHaveBean(MonitorService.class));
    }
}
```

### 集成测试 ###

```java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = TestApplication.class)
@AutoConfigureMockMvc
public class MonitorStarterIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/health/monitor"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.status").value("UP"));
    }
}
```

### 条件测试 ###

```java
@Test
void testConditionalOnClass() {
    // 测试当类路径有特定类时的行为
    this.contextRunner
        .withClassLoader(new FilteredClassLoader(SomeClass.class))
        .run(context -> assertThat(context)
            .doesNotHaveBean(SomeService.class));
}
```

## 七、发布：让你的 Starter 走向世界 🌍 ##

### 版本管理 ###

```xml
<!-- 继承 spring-boot-dependencies 管理版本 -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.7.0</version>
    <relativePath/>
</parent>
```

### 文档（必须！） ###

README.md 包含：

1. 快速开始
2. 配置说明
3. 高级功能
4. 常见问题
5. 版本历史

### 发布到 Maven Central ###

```bash
# 1. 注册 Sonatype 账号
# 2. 配置 settings.xml
# 3. 执行发布
mvn clean deploy -P release
```

## 八、真实案例：分析知名 Starter 设计 ##

### 案例 1：MyBatis-Spring-Boot-Starter ###

```java
// 核心：自动配置 SqlSessionFactory
@Configuration
@ConditionalOnClass({SqlSessionFactory.class, SqlSessionFactoryBean.class})
@ConditionalOnBean(DataSource.class)
@EnableConfigurationProperties(MybatisProperties.class)
@AutoConfigureAfter(DataSourceAutoConfiguration.class)
public class MybatisAutoConfiguration {
    // 自动发现 Mapper 接口
    // 自动配置 SqlSessionTemplate
    // 自动配置事务管理器
}
```

学习点：@AutoConfigureAfter(DataSourceAutoConfiguration.class)确保数据源先配置。

### 案例 2：Spring Cloud Starter Feign ###

```java
@Configuration
@ConditionalOnClass(Feign.class)
@EnableConfigurationProperties(FeignClientProperties.class)
public class FeignAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public Decoder feignDecoder() {
        return new ResponseEntityDecoder(new SpringDecoder(messageConverters));
    }
    
    // 支持多种配置：OkHttp、ApacheHttpClient、Ribbon...
}
```

学习点：提供多种可选实现，让用户灵活选择。

## 九、常见“翻车”现场 🚨 ##

### 翻车 1：Bean 重复定义 ###

```java
// 错误：用户自定义了，Starter 又定义
@Bean
public MonitorService monitorService() {  // 用户已定义同类型Bean
    return new MonitorService();  // 冲突！
}

// 正确：加 @ConditionalOnMissingBean
@Bean
@ConditionalOnMissingBean
public MonitorService monitorService() {  // 用户没定义时才创建
    return new MonitorService();
}
```

### 翻车 2：配置项冲突 ###

```ini
# 错误：用通用前缀
demo.enabled=true  # 可能和其他 Starter 冲突

# 正确：用公司/项目前缀
acme.smart.monitor.enabled=true
```

### 翻车 3：强依赖传递 ###

```xml
<!-- 错误：强制传递所有依赖 -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <!-- 没加 optional，用户被迫引入 -->
</dependency>

<!-- 正确：optional 或 provided -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <optional>true</optional>  <!-- 用户可选 -->
</dependency>
```

### 翻车 4：启动顺序问题 ###

```java
// 错误：A 依赖 B，但 A 先配置
@AutoConfigureBefore(BConfiguration.class)  // 但 A 需要 B 的 Bean
public class AConfiguration { }

// 正确：明确依赖关系
@AutoConfigureAfter(BConfiguration.class)
public class AConfiguration { }
```

## 十、总结：从“轮子”到“豪车”的进化 🏎️ ##

Starter 设计的“三段论”：

- 能用：基本功能，零配置可用
- 好用：配置灵活，文档齐全
- 爱用：性能优异，扩展性强

最后的心法：

“好的 Starter 让用户感受不到它的存在，但离开它又不行。”

就像空气——平时察觉不到，但没有就活不了。你的 Starter 应该如此：安静、可靠、不可或缺。

下次当你又要复制粘贴相同配置时，停下来问自己：“这该不该做成 Starter？”如果是，那就动手吧！把重复劳动变成一次性的创造，这才是工程师的价值所在。✨

记住：不造重复的轮子，要造就造“更好的轮子”——不，是造“变形金刚轮胎”，能适应各种路面！🚗💨
