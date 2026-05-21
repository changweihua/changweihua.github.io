---
lastUpdated: true
commentabled: true
recommended: true
title: 使用Sentinel作为Spring Boot应用限流组件
description: 使用Sentinel作为Spring Boot应用限流组件
date: 2026-03-09 08:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

> Web 服务的短信接口遭遇了恶意刷量，导致阿里云账户余额直接被扣至欠费。当初实现该功能时，由于心存侥幸，觉得如此小规模的项目不至于被黑客盯上，因此仅对同一手机号的重复请求做了简单限制，并未在前端接入验证码流程，也未在后端实施 IP 限流。过年回来后，痛定思痛，赶紧把这个技术债给还上……

## 一、 前言 ##

对于一些核心且无需鉴权的对外接口，做好限流措施是不可或缺的防线。虽然限流无法 100% 杜绝恶意攻击，但至少能大幅提高恶意刷接口的成本。
对于 Spring Boot/Cloud 框架开发的 Web 服务，实际上有很多限流组件库可供选择，例如：

- Resilience4j (Spring Cloud 官方推荐)
- Bucket4j (基于令牌桶算法的 Java 限流库)
- Guava RateLimiter (单机限流)
- Hystrix (经典)
- Sentinel
- ......

综合考虑后，我选择了 *Sentinel*。它不仅具备上述优秀组件的特点，还自带一个直观的 Dashboard 且极易上手。对于日常开发来说，这种配置简单、开箱即用的工具无疑是最佳选择。

## 二、 Spring Boot应用集成Sentinel ##

相关链接:

- [Sentinel的Github仓库](https://github.com/alibaba/Sentinel.git)

### 引入依赖 ###

这里使用 `Maven` 作为依赖管理工具, 在 `pom.xml` 中加入以下依赖

```xml
<!--  Sentinel  -->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
    <version>2023.0.3.4</version>
</dependency>
```

注意： 如果按照官方网站的指导来做，可能并非直接引入该依赖，这对于刚接触的人来说比较困惑。这并不是官方文档描述有误或者过时了，而是因为我们使用了 Spring Boot 作为框架，Spring Cloud 开发组对其做了深度适配，引入上述依赖实际上就会自动引入 Sentinel 的核心与常用依赖。

### 配置Sentinel ###


通过在Spring Boot的应用配置文件中进行最终配置

```yaml
spring:
  cloud:
    # Sentinel配置
    sentinel:
      transport:
        port: 8719  # 会在本地开启Http服务用于控制Sentinel
        dashboard: localhost:8080  # 如果不需要看板可以注释掉
      eager: true   # 是否提前触发 Sentinel 初始化, 建议开启, 随应用启动而初始化
```

### 启动应用 ###

只需完成以上两步，即可成功集成 Sentinel。它会自动将所有的 HTTP 接口注册为 Sentinel 的资源 (Resource)。启动应用以验证结果，若控制台打印如下日志且无任何报错，即说明集成成功：

```txt
INFO: Sentinel log output type is: file
INFO: Sentinel log charset is: utf-8
INFO: Sentinel log base directory is: C:\Users\23111\logs\csp\
INFO: Sentinel log name use pid is: false
INFO: Sentinel log level is: INFO
```

### 使用Sentinel Dashboard (可选) ###


下载Sentinel Dashboard的jar包, 从官方Github的Release中下载. 运行以下命令即可实现Dashboard的启动:

```bash
# 如果8080端口被占用可以换成别端口, 相应地, 需要在Spring Boot应用的配置中更改过来
java -Dserver.port=8080 -Dcsp.sentinel.dashboard.server=localhost:8080 -Dproject.name=sentinel-dashboard -jar sentinel-dashboard.jar
```

访问 `http://localhost:<设置的端口号>` 后即可进入 Sentinel 的 Web 界面，默认账号密码是：`admin`/`admin`。登录成功后进入首页，如果左侧的菜单栏中，除了当前 Dashboard 节点菜单外，还有 Spring Boot 应用的名称，那就说明对接成功。至于如何操作 Dashboard 此文章不做过多解释。

## 三、使用Sentinel基于请求源IP对接口进行限流 ##

### 选择限流的实现方案 ###

Sentinel 提供了多种限流规则。官方文档中提到，若需基于 IP 限流，可采用基于调用关系的流量控制。然而，该方案主要适用于微服务之间已知且有限的 IP 限制。在面对公网环境下海量不可控的源 IP 时，这种方式往往无法满足需求（参考官方 FAQ 说明）：

> - Q: 怎么针对特定调用端限流？比如我想针对某个 IP 或者来源应用进行限流？规则里面 limitApp（流控应用）的作用？
>
> - A: Sentinel 支持按来源限流，可以参考 基于调用关系的限流。注意 origin 数量不能太多，否则会导致内存暴涨，并且目前不支持模式匹配。

因此，我们需要另辟蹊径。最终我决定采用 *热点参数限流*。Sentinel 的热点参数限流底层基于 LRU 机制实现，对于拦截公网高频恶意 IP 访问的场景非常契合，且不会误伤正常用户的访问。

### 实现思路 ###

Sentinel 原生的热点参数限流要求开发者手动传入参数值作为计数 Key，框架本身并不会自动提取 HTTP 请求的源 IP 并注入规则中。因此，我们需要自行串联起“从请求中获取源 IP”、“将 IP 设为限流参数”、“设定限流规则”以及“触发限流逻辑”的完整流程。

如果在每个需要限流的业务接口中硬编码提取 IP 和限流逻辑，会对业务代码造成严重的侵入。为了保持代码的整洁与高内聚，我采用了 自定义注解 + AOP (面向切面编程) 的方式来实现，既保证了高度的灵活性，又实现了与业务逻辑的解耦。

### 代码参考 ###

#### 注解定义 ####

```java
import java.lang.annotation.*;
​
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimitByIp {
​
    /**
     * 资源名称，如果不填默认使用 "类名.方法名"
     */
    String value() default "";
​
    /**
     * 【新增】单机 QPS 阈值，默认 10
     */
    int count() default 10;
​
    /**
     * 【新增】统计窗口时长（秒），默认 1 秒
     */
    int duration() default 1;
​
    /**
     * 限流后的提示信息
     */
    String message() default "Too busy";
}
```

#### 限流逻辑的AOP实现 ####

```java
import com.alibaba.csp.sentinel.slots.block.flow.param.ParamFlowRule;
import com.alibaba.csp.sentinel.slots.block.flow.param.ParamFlowRuleManager;
import com.xxx.xxx.annotation.RateLimitByIp;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
​
import com.alibaba.csp.sentinel.Entry;
import com.alibaba.csp.sentinel.EntryType;
import com.alibaba.csp.sentinel.SphU;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
​
import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
​
@Slf4j
@Aspect
@Component
public class IpRateLimitAspect {
​
    // 用来记录已经初始化过规则的资源，避免重复加载
    private static final Map<String, Boolean> ruleInitMap = new ConcurrentHashMap<>();
​
    @Around("@annotation(rateLimitByIp)")
    public Object handleRateLimit(ProceedingJoinPoint point, RateLimitByIp rateLimitByIp) throws Throwable {
        // 1. 获取资源名称 (如果注解没写，就用 类名.方法名)
        String resourceName = rateLimitByIp.value();
        if (resourceName == null || resourceName.isEmpty()) {
            MethodSignature signature = (MethodSignature) point.getSignature();
            Method method = signature.getMethod();
            resourceName = method.getDeclaringClass().getName() + "." + method.getName();
        }
​
        // 2. 【关键优化】自动初始化规则
        // 只有第一次访问该接口时，才会执行规则加载逻辑
        if (!ruleInitMap.containsKey(resourceName)) {
            initHotParamFlowRule(resourceName, rateLimitByIp.count(), rateLimitByIp.duration());
        }
​
        // 3. 获取 IP
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return point.proceed();
        }
        HttpServletRequest request = attributes.getRequest();
        String ip = getIpAddress(request);
​
        // 4. Sentinel 埋点
        Entry entry = null;
        try {
            // 参数索引 0 是 IP
            entry = SphU.entry(resourceName, EntryType.IN, 1, ip);
            return point.proceed();
        } catch (BlockException ex) {
            log.error("IP访问限流: ip={}, 访问次数上限={}, 资源={}", ip, rateLimitByIp.count(), resourceName);
            throw new RuntimeException(rateLimitByIp.message());
        } finally {
            if (entry != null) {
                entry.exit(1, ip);
            }
        }
    }
​
    /**
     * 动态加载热点参数规则
     */
    private synchronized void initHotParamFlowRule(String resourceName, int count, int duration) {
        // 防止并发重复初始化
        if (ruleInitMap.containsKey(resourceName)) return;
​
        // 1. 创建新规则
        ParamFlowRule rule = new ParamFlowRule(resourceName)
                .setParamIdx(0) // 我们的 Aspect 总是把 IP 放在第一个参数
                .setCount(count)
                .setDurationInSec(duration);
​
        // 2. 获取当前已有的所有规则
        List<ParamFlowRule> rules = new ArrayList<>(ParamFlowRuleManager.getRules());
​
        // 3. 移除旧规则 (如果存在同名的)，避免重复添加
        rules.removeIf(r -> r.getResource().equals(resourceName));
​
        // 4. 添加新规则
        rules.add(rule);
​
        // 5. 重新加载
        ParamFlowRuleManager.loadRules(rules);
        
        ruleInitMap.put(resourceName, true);
​
        log.info(">>> [Sentinel] 自动加载 IP 限流规则: 资源={}, QPS={}", resourceName, count);
    }
​
    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("x-forwarded-for");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 多个代理的情况，第一个IP为客户端真实IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
```

#### 使用注解 ####

```java
@GetMapping("/sms/code")
@ResponseBody
@RateLimitByIp(count = 3, duration = 60)    // 60s内最多允许3次请求
public AjaxResult sendPhoneSms(String phone) {
    ......
}
```

## 四、结尾寄语 ##

本文分享的方案在实际应用中仍有优化空间，例如：通过 HTTP Header 获取源 IP 的算法在经过多层复杂反向代理时可能不够准确；缺少全局的流量分析面板；基于 AOP 的限流由于切面执行时机无法完全复用 Spring MVC 适配的默认接口资源名等。这也是为了快速修补安全漏洞而采取的应急方案，不足之处还望海涵。

另外发几句牢骚，对于起步阶段的小型项目，过度设计限流机制有时显得性价比不高。在项目生死未卜的阶段，将大量精力投入到“防御性编程”中，倒不如早点下班享受生活……然而，总有一些“神人”闲来无事，专挑小公司的小项目进行所谓的“技术演练”。只能说，有这身手何不去打击那些真正的灰黑产诈骗网站呢。

> 后续计划： Sentinel 默认的 Dashboard 指标数据是保存在内存中的，重启就会丢失，且不适合用于长期的流量分析。后续我计划直接修改 Sentinel Dashboard 的源码，将这些监控指标数据持久化到时序数据库（如 InfluxDB 或 TDengine）中，以此来搭建一个完善的流量监控面板，届时再整理成文章分享出来。
