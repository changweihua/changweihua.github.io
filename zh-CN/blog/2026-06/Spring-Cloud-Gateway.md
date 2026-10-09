---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Cloud Gateway 微服务网关
description: 路由、断言、过滤器
date: 2026-06-30 12:35:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、网关核心定位：微服务统一流量入口

在微服务架构中，后端会拆分出订单、支付、用户等多个独立服务，前端无法维护海量服务 IP 与端口，Spring Cloud Gateway 应运而生，作为整个业务集群的唯一访问入口。

官方推荐基于 WebFlux 响应式 Server，而非传统 SpringMVC，依托非阻塞异步模型，网关拥有更高并发承载能力，核心职责如下：

- 统一入口：前端仅对接网关地址，屏蔽后端集群部署细节；
- 路由转发：根据匹配规则将请求分发至对应微服务；
- 负载均衡：搭配 Spring Cloud LoadBalancer 实现服务集群负载；
- 通用能力收敛：统一处理跨域、请求校验、响应封装、身份令牌等通用逻辑；
- 流量管控：可扩展实现限流、鉴权、黑白名单、监控告警。

### 负载均衡依赖说明

新版 Spring Cloud 已移除内置 Ribbon，负载均衡能力独立为 `spring-cloud-loadbalancer`，必须手动引入 Maven 依赖才能使用 `lb://` 负载均衡协议：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

### 重要开发规范

使用 OpenFeign 远程调用时， `@FeignClient` 修饰的接口不能添加类级别 `@RequestMapping`，路径注解仅允许写在接口方法上，否则会出现路径拼接错乱、404 等异常。

### 微服务调用链路区分

- 默认场景：服务之间通过注册中心直连调用，不经过网关，性能更高；

- 强制走网关：修改 `@FeignClient` 的 value 为网关服务名，同步调整接口请求路径，适用于需要网关统一鉴权的场景。

## 二、路由：网关转发的基础规则

路由是网关最基础的组件，由唯一 ID、目标服务地址、匹配断言、过滤器四部分组成，配置存放于 `application-route.yml`。

```yml
spring:
  cloud:
    gateway:
      routes:
        - id: order-route # 路由唯一标识，不可重复
          uri: lb://service-order # lb代表负载均衡，指向注册中心订单服务
          predicates: # 路由匹配断言
            - Path=/order/**
          order: 0
```

路由匹配优先级规则：配置未手动指定 `order` 数值时，自上而下依次匹配，请求命中第一条符合断言的路由即转发。
配置 `order` 字段优先级按照从小到大以此降低，0优先级最高。

## 三、路由断言：精准匹配请求的判断器

断言（Predicate）本质是一套请求匹配规则，只有请求满足当前路由全部断言条件，才会转发至对应服务，底层统一由 `RoutePredicateFactory` 工厂生成。

### 官方内置常用断言

### 自定义断言工厂实战

内置断言无法满足业务时，可自定义断言工厂，命名规范为 `XXXRoutePredicateFactory`，继承 `AbstractRoutePredicateFactory`。文中 `VipRoutePredicateFactory` 实现自定义参数匹配断言：校验请求携带指定参数且值完全匹配，仅 VIP 用户可访问对应路由。核心实现要点：

- 内部静态 Config 类承载配置参数，配合 `@NotEmpty` 做参数校验；
- `shortcutFieldOrder` 定义 yml 短配置参数顺序；
- `apply` 方法编写匹配逻辑，从请求中读取参数完成比对。

```java
package cn.ecut.gateway.predicate;

import jakarta.validation.constraints.NotEmpty;
import org.springframework.cloud.gateway.handler.predicate.AbstractRoutePredicateFactory;
import org.springframework.cloud.gateway.handler.predicate.GatewayPredicate;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.server.ServerWebExchange;

import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;

@Component
public class VipRoutePredicateFactory extends AbstractRoutePredicateFactory<VipRoutePredicateFactory.Config> {

    public VipRoutePredicateFactory() {
        super(Config.class);
    }

    @Override
    public List<String> shortcutFieldOrder() {
        return Arrays.asList("param","value");
    }

    @Override
    public Predicate<ServerWebExchange> apply(Config config) {
        return new GatewayPredicate() {

            @Override
            public boolean test(ServerWebExchange exchange) {
                //localhost/search?q=haha&user=liu
                ServerHttpRequest request = exchange.getRequest();
                String first= request.getQueryParams().getFirst(config.param);
                return StringUtils.hasText(first)&& first.equals(config.value);
            }
         };
    }
    /**
     * 可以配置的参数
     */
    @Validated
    public static class Config {
        @NotEmpty
        private  String param;
        @NotEmpty
        private String value;

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public String getParam() {
            return param;
        }

        public void setParam(String param) {
            this.param = param;
        }

    }
}
```

## 四、过滤器：请求与响应的统一处理器

过滤器负责对转发前后的请求、响应做加工处理，分为全局默认过滤器（所有请求执行）和路由自定义过滤器（仅当前路由生效）。自定义过滤器需继承对应过滤器工厂父类，类名与 yml 配置名称保持一致。

### 父类区分

- AbstractGatewayFilterFactory：通用自定义过滤器，支持多参数自定义配置；
- AbstractNameValueGatewayFilterFactory：键值对专用过滤器，简化name=value格式配置。

### 实战：一次性令牌过滤器 OnceTokenGatewayFilterFactory

基于 `AbstractNameValueGatewayFilterFactory` 开发，依托 WebFlux 响应式异步 API，在请求处理完成后，给响应头自动注入一次性令牌：

- 后置逻辑放在 `chain.filter(exchange).then()` 中，保证响应生成后修改 Header；
- 支持两种令牌模式：uuid 随机串、固定 jwt 标识；
- yml 配置格式：`OnceToken=自定义头名称,令牌类型`。

完整核心代码：

```java
package cn.ecut.gateway.filter;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.factory.AbstractNameValueGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import java.util.UUID;
/**
 * 响应式api都是异步的
 */
@Component
public class OnceTokenGatewayFilterFactory extends AbstractNameValueGatewayFilterFactory {
    @Override
    public GatewayFilter apply(NameValueConfig config) {
        return new GatewayFilter() {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
                //每次打开，添加一个一次性令牌，支持uuid，jwt等各种格式
                return chain.filter(exchange).then(
                        Mono.fromRunnable(() -> {
                            ServerHttpResponse response = exchange.getResponse();
                            HttpHeaders headers = response.getHeaders();
                            String value = config.getValue();
                            if("uuid".equalsIgnoreCase(config.getValue())){ //不分大小写
                                value= UUID.randomUUID().toString();
                            }
                            if("jwt".equalsIgnoreCase(config.getValue())){
                                value="jwt";
                            }
                            headers.add(config.getName(), value);
                        })
                );
            }
        };
    }
}
```

## 五、网关全局跨域 CORS 配置

单体项目可在 Controller 添加 `@CrossOrigin` 解决跨域，微服务架构推荐统一在网关配置全局跨域，避免每个服务重复开发。基础配置示例：

```yml
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]': # 全局所有路径生效
            allowedOrigins: '*' # 允许所有前端域名（生产环境建议指定域名）
            allowedMethods: '*' # 放行全部请求方式
```

> 生产优化提示：`allowedOrigins: *`存在安全风险，应填写前端固定域名；开启allowCredentials携带 Cookie 时，禁止使用通配符域名。

## 六、整体总结与落地思路

Spring Cloud Gateway 是微服务架构的流量枢纽，整套体系由路由、断言、过滤器三大核心组件构成：

- 路由：定义转发目标，实现流量分发；
- 断言：精细化控制哪些请求可以走当前路由；
- 过滤器：统一拦截改造请求、响应，实现跨域、令牌下发、日志、鉴权等通用逻辑。

依托响应式非阻塞架构，网关具备高性能优势，同时提供标准化扩展接口，支持自定义断言、过滤器灵活拓展业务能力。开发过程中需要遵循负载均衡依赖、Feign 注解、响应式后置处理等规范，规避常见 404、响应头失效、参数匹配异常等问题。

在实际项目中，可基于本文自定义组件拓展能力：结合令牌过滤器实现网关统一鉴权、自定义 IP 断言实现访问黑白名单、全局过滤器统一打印请求日志，将所有与业务无关的流量处理逻辑收敛至网关，大幅简化后端微服务开发成本。
