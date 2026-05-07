---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 内置功能
description: 别再重复造轮子，这些内置功能香麻了
date: 2026-05-06 09:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、开场：开发困境引出主题 ##

身为开发者的我们，在日常开发中，想必都遭遇过重复造轮子的无奈吧？就拿搭建一个简单的 Web 应用来说，从配置服务器、引入依赖，到处理各种请求响应，每一个环节都得亲力亲为。一旦某个依赖版本出现冲突，那排查问题的过程，简直让人头疼不已。

比如在日志记录方面，为了记录请求的详细信息，我们可能需要编写大量繁琐的代码，从获取请求参数、记录请求体，到打印日志，稍有不慎就容易出错。又或者在处理定时任务时，我们得自己去实现一套定时调度的逻辑，从线程管理到任务执行，过程复杂且容易出现漏洞。

但今天，我要给大家介绍的 Spring Boot，就像是一位贴心的开发伙伴，它提供了一系列强大的内置功能，能轻松解决这些让人头疼的问题，让我们的开发效率大幅提升。

## 二、全流程请求日志追踪：CommonsRequestLoggingFilter ##

在开发 Web 应用时，我们常常需要了解每个请求的详细信息，比如请求参数、客户端 IP、请求头信息等 ，这些信息对于调试、性能分析和安全审计都非常重要。Spring Boot 提供的 CommonsRequestLoggingFilter，就像是一个贴心的小助手，能帮我们轻松记录这些关键信息。

### 功能作用 ###

想象一下，你正在开发一个电商系统，用户下单时，你需要知道用户的 IP 地址、下单的商品信息（也就是请求参数），以及用户设备传递过来的一些特殊请求头信息，以便进行后续的数据分析和问题排查。CommonsRequestLoggingFilter 就能完美胜任这个任务，它可以在请求到达控制器之前，拦截并记录这些详细信息，让你对请求的来龙去脉一目了然。

### 配置示例 ###

下面，我们来看看如何配置这个神奇的过滤器。在 Spring Boot 中，配置非常简单，只需要在配置类中定义一个 `CommonsRequestLoggingFilter` 的 `Bean` 即可：

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

@Configuration
public class RequestLoggingConfig {

    @Bean
    public CommonsRequestLoggingFilter logFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
        // 设置是否包含请求的查询字符串
        filter.setIncludeQueryString(true);
        // 设置是否包含请求体
        filter.setIncludePayload(true);
        // 设置请求体的最大长度，超过此长度的请求体将被截断
        filter.setMaxPayloadLength(10000); 
        // 设置是否包含请求头
        filter.setIncludeHeaders(true); 
        // 设置日志消息的前缀，方便识别
        filter.setAfterMessagePrefix("REQUEST DATA : "); 
        return filter;
    }
}
```

在上述配置中，我们通过一系列的 set 方法，对过滤器的行为进行了详细的设置。比如，`setIncludeQueryString (true)` 表示要记录请求 URL 中的查询参数；`setIncludePayload (true)` 表示要记录请求体；`setMaxPayloadLength (10000)` 则限制了记录请求体的最大长度为 10000 字节，这可以防止日志文件过大；`setIncludeHeaders (true)` 表示要记录请求头信息；`setAfterMessagePrefix ("REQUEST DATA :")` 则为日志消息添加了一个前缀，方便我们在日志中快速定位请求数据。

### 日志效果展示 ###

配置完成后，当有请求进入我们的应用时，日志中就会记录下详细的请求信息。例如，当用户发送一个 `POST` 请求来创建一个新用户时，日志可能会输出如下内容：

```txt
DEBUG o.s.w.f.CommonsRequestLoggingFilter - REQUEST DATA : uri=/api/users;client=192.168.1.100;method=POST;queryString=null;payload={"username":"testuser","email":"test@example.com"};headers=[Content-Type:"application/json", Accept:"*/*"]
```

从这条日志中，我们可以清晰地看到请求的 URI（`/api/users`）、客户端 IP（`[192.168.1.100](192.168.1.100)`）、请求方法（`POST`）、查询字符串（`null`，因为这个请求没有查询参数）、请求体（`{"username":"testuser","email":"test@example.com"}`）以及请求头信息（`Content-Type` 和 `Accept`）。有了这些详细的日志信息，无论是调试接口，还是分析用户行为，都变得轻松多了。

## 三、请求体 / 响应体可重复读取：ContentCaching 系列 ##

在 Servlet 规范中，`HttpServletRequest` 和 `HttpServletResponse` 的输入输出流存在一个限制：它们仅支持单次读取 。这就好比你有一个快递包裹（请求体或响应体），只能打开一次查看里面的东西（读取流），一旦关上，就无法再次打开查看了。

想象一下，你正在开发一个文件上传接口，在过滤器中，你需要读取请求体中的文件信息来记录日志，之后，控制器还需要读取这个请求体来处理文件上传。但由于 Servlet 流只能读取一次，当过滤器读取后，控制器再读取时，就会发现请求体为空，这显然不是我们想要的结果。

为了解决这个问题，Spring 提供了 `ContentCachingRequestWrapper` 和 `ContentCachingResponseWrapper` 。这两个类就像是给请求体和响应体分别加了一个 “缓存袋”，可以将请求体和响应体的数据缓存起来，从而实现多次读取。

### 解决的问题 ###

以一个电商系统为例，在处理订单支付请求时，我们可能需要在过滤器中读取请求体中的支付信息（如订单号、支付金额、支付方式等），用于记录日志和安全校验之后，支付处理的控制器也需要读取这些信息来完成支付流程。ContentCachingRequestWrapper 就能保证在过滤器读取后，控制器依然可以正常读取请求体中的支付信息，确保支付流程的顺利进行。

### 使用方法 ###

下面是使用 `ContentCachingRequestWrapper` 和 `ContentCachingResponseWrapper` 的示例代码：

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

@Component
public class RequestResponseLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestResponseLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 包装请求，以便多次读取请求体
        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        // 包装响应，以便多次读取响应体
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        try {
            // 执行过滤器链
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            // 记录请求信息
            logRequest(requestWrapper);
            // 记录响应信息
            logResponse(responseWrapper);
            // 将缓存的响应体内容写入原始响应，确保客户端能接收到正确的响应
            responseWrapper.copyBodyToResponse();
        }
    }

    private void logRequest(ContentCachingRequestWrapper requestWrapper) throws UnsupportedEncodingException {
        String requestUri = requestWrapper.getRequestURI();
        String method = requestWrapper.getMethod();
        String queryString = requestWrapper.getQueryString();
        String fullUrl = requestUri + (queryString != null ? "?" + queryString : "");

        StringBuilder requestLog = new StringBuilder();
        requestLog.append("\n--- HTTP Request ---\n");
        requestLog.append("URL: ").append(method).append(" ").append(fullUrl).append("\n");
        requestLog.append("Client IP: ").append(requestWrapper.getRemoteAddr()).append("\n");

        byte[] requestBody = requestWrapper.getContentAsByteArray();
        if (requestBody.length > 0) {
            String bodyContent = new String(requestBody, requestWrapper.getCharacterEncoding());
            requestLog.append("Body: ").append(bodyContent.length() > 2000 ? bodyContent.substring(0, 2000) + "..." : bodyContent).append("\n");
        }

        log.info(requestLog.toString());
    }

    private void logResponse(ContentCachingResponseWrapper responseWrapper) throws UnsupportedEncodingException {
        String requestUri = responseWrapper.getRequestURI();
        String method = responseWrapper.getMethod();
        String queryString = responseWrapper.getQueryString();
        String fullUrl = requestUri + (queryString != null ? "?" + queryString : "");

        StringBuilder responseLog = new StringBuilder();
        responseLog.append("\n--- HTTP Response ---\n");
        responseLog.append("URL: ").append(method).append(" ").append(fullUrl).append("\n");
        responseLog.append("Status: ").append(responseWrapper.getStatus()).append("\n");

        byte[] responseBody = responseWrapper.getContentAsByteArray();
        if (responseBody.length > 0) {
            String bodyContent = new String(responseBody, responseWrapper.getCharacterEncoding());
            responseLog.append("Body: ").append(bodyContent.length() > 2000 ? bodyContent.substring(0, 2000) + "..." : bodyContent).append("\n");
        }

        log.info(responseLog.toString());
    }
}
```

在上述代码中，我们定义了一个过滤器 RequestResponseLoggingFilter，它继承自 OncePerRequestFilter，确保在每个请求生命周期内只执行一次。在 `doFilterInternal` 方法中，我们首先创建了 `ContentCachingRequestWrapper` 和 `ContentCachingResponseWrapper` 对象，分别对请求和响应进行包装。然后，通过 `filterChain.doFilter` 方法执行过滤器链，处理请求。在请求处理完成后，我们调用 `logRequest` 和 `logResponse` 方法，分别记录请求和响应的详细信息。最后，通过 `responseWrapper.copyBodyToResponse ()` 方法，将缓存的响应体内容写入原始响应，确保客户端能接收到正确的响应。

## 四、防止过滤器重复执行：OncePerRequestFilter 基类 ##

在开发 Web 应用时，我们常常会遇到这样的问题：由于请求转发（forward）、请求包含（include）或异步请求（async）等操作，同一个过滤器可能会被多次执行 。这就好比你去超市买东西，本来只需要付一次钱（执行一次过滤器逻辑），但因为超市系统的问题，你被重复收费了（过滤器被多次执行），这显然是不合理的。

为了解决这个问题，Spring 提供了 `OncePerRequestFilter` 基类 。它就像是一个严格的 “收银员”，会确保在一次完整的 HTTP 请求生命周期内，过滤器逻辑只执行一次 ，无论请求在服务器内部经过了多少次转发或包含多个资源请求。

### 原理剖析 ###

`OncePerRequestFilter` 的实现原理并不复杂。它主要通过内部机制跟踪当前请求是否已经被处理过 。具体来说，它使用 HttpServletRequest 的 `getAttribute` 和 `setAttribute` 方法结合 `ThreadLocal` 变量来标记请求状态 。当一个请求首次到达时，OncePerRequestFilter 会执行过滤器逻辑，并设置一个标记，表示该请求已经被处理过 。后续如果同一个请求再次进入该过滤器，它会检查这个标记，如果发现请求已经被处理过，就会直接跳过过滤逻辑，从而避免了重复执行。

### 适用场景 ###

OncePerRequestFilter 在很多场景下都非常有用，比如：

- 日志埋点：在记录请求日志时，我们希望每个请求只记录一次日志，避免因为请求转发等操作导致日志重复记录，影响日志分析的准确性。

- 安全校验：在进行身份认证、权限验证等安全相关的操作时，确保每个请求只进行一次校验，避免重复校验带来的性能开销和潜在的安全风险。例如，在使用 JWT 进行身份认证时，使用 `OncePerRequestFilter` 可以保证每个请求只验证一次 `JWT` 令牌的有效性。

- 性能计量：在统计请求处理时间、计算接口响应速率等性能指标时，保证每个请求只被计量一次，得到准确的性能数据。

## 五、AOP 三大工具类 ##

在 Spring AOP 编程中，有三个非常实用的工具类，它们就像是三把锋利的宝剑，能帮助我们轻松解决各种复杂的 AOP 问题。

### AopContext.currentProxy ###

在实际开发中，我们可能会遇到这样的场景：在一个被代理的类中，一个方法调用另一个被代理的方法，此时，Spring AOP 的代理上下文会丢失，导致一些注解（如 `@Transactional`）失效 。这就好比你在一个城堡（被代理类）里，从一个房间（方法 A）走到另一个房间（方法 B），但在这个过程中，你突然失去了城堡主人（代理上下文）赋予你的特殊权限（注解功能）。

`AopContext.currentProxy ()` 方法就是解决这个问题的关键。它可以获取当前执行方法的代理对象 ，让我们在同一个类的方法调用中，也能保持代理的上下文，确保注解正常生效 。比如，在一个电商的订单服务类中，方法 A 负责创建订单，方法 B 负责更新订单状态，并且方法 B 上有 `@Transactional` 注解，当方法 A 调用方法 B 时，如果不使用 `AopContext.currentProxy ()` 获取代理对象，方法 B 的事务可能不会生效，导致数据一致性问题。但通过 `AopContext.currentProxy ()`，我们可以确保方法 B 的事务正常工作，保证订单创建和状态更新的原子性。

不过，使用这个方法时要注意，它只能在同一个线程中使用 ，并且需要在配置类中开启 `@EnableAspectJAutoProxy (exposeProxy = true)`，以暴露代理对象 。

### AopUtils.isXxxProxy () ###

在调试和优化 AOP 代码时，我们常常需要知道当前的代理对象是基于 JDK 动态代理还是 CGLIB 代理 。这就好比你有两个不同品牌的手机（JDK 代理和 CGLIB 代理），你需要知道你正在使用的是哪一款，以便更好地了解它的功能和性能特点。

`AopUtils.isJdkDynamicProxy ()` 和 `AopUtils.isCglibProxy ()` 方法就能帮助我们实现这一点。它们分别用于判断一个对象是否是 JDK 动态代理对象和 CGLIB 代理对象 。例如，在一个性能优化的场景中，我们发现某个代理对象的方法调用效率较低，通过 `AopUtils.isXxxProxy ()` 方法判断出它是 CGLIB 代理对象，我们就可以进一步检查 CGLIB 代理的配置和使用是否合理，比如是否存在不必要的代理层级，是否可以通过优化 CGLIB 的配置参数来提高性能。

### ReflectionUtils ###

在某些情况下，我们可能需要访问和操作类的私有字段或方法 ，这在测试、数据迁移等场景中尤为常见。就像你有一个神秘的宝箱（私有字段或方法），虽然它被上了锁，但你有一把万能钥匙（ReflectionUtils），可以打开它并查看里面的宝物（访问和操作数据）。

Spring 的 ReflectionUtils 类提供了一系列方便的方法，用于执行私有字段和方法的反射访问 。比如，`ReflectionUtils.findField ()` 方法可以根据字段名查找类中的字段，`ReflectionUtils.makeAccessible ()` 方法可以将私有字段或方法设置为可访问，`ReflectionUtils.getField ()` 方法可以获取字段的值，`ReflectionUtils.invokeMethod ()` 方法可以调用私有方法 。在一个数据迁移的项目中，我们需要将旧系统中的数据迁移到新系统中，而旧系统中的一些数据存储在私有字段中，这时就可以使用 ReflectionUtils 来访问这些私有字段，获取数据并进行迁移。

## 六、Starter 架构统一依赖配置 ##

在 Spring Boot 的众多强大功能中，Starter 架构无疑是一颗璀璨的明星，它为我们带来了高效、便捷的依赖管理体验。

### Starter 简化依赖管理 ###

Spring Boot Starter 就像是一个精心整理的 “工具包”，它将开发特定功能所需的一系列依赖和配置进行了整合。以引入 `spring-boot-starter-web` 为例，当我们在项目中添加这个依赖时，就如同打开了一个装满 Web 开发工具的百宝箱。它会自动帮我们引入 Spring MVC、嵌入式 Tomcat 服务器、JSON 处理库（如 Jackson）等一系列开发 Web 应用必不可少的依赖，而且这些依赖的版本都是经过 Spring Boot 团队严格测试和筛选的，确保了它们之间的兼容性 。

比如，在一个传统的 Spring Web 项目中，我们可能需要手动在 `pom.xml` 文件中添加如下依赖：

```xml:pom.xml
<dependencies>
    <!-- Spring MVC依赖 -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>5.3.23</version>
    </dependency>
    <!-- JSON处理库Jackson依赖 -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.13.4</version>
    </dependency>
    <!-- 嵌入式Tomcat服务器依赖 -->
    <dependency>
        <groupId>org.apache.tomcat.embed</groupId>
        <artifactId>tomcat-embed-core</artifactId>
        <version>9.0.65</version>
    </dependency>
    <!-- 其他可能的依赖 -->
</dependencies>
```

不仅要关注每个依赖的版本，还要确保它们之间不会出现版本冲突。而使用 Spring Boot Starter 后，我们只需要在 `pom.xml` 中添加一行依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

Spring Boot 会自动帮我们处理好所有的依赖关系，让我们可以专注于业务逻辑的开发。

### 自定义 Starter 的基本步骤 ###

有时候，官方提供的 Starter 可能无法满足我们的特殊需求，这时候就需要自定义 Starter 了。下面是自定义 Starter 的基本步骤：

- 创建项目结构：首先，创建一个新的 Maven 项目，项目名称建议遵循 `{name}-spring-boot-starter` 的格式，比如 `my-custom-starter`。在这个项目中，通常包含两个主要模块：自动配置模块（`{name}-spring-boot-autoconfigure`）和 Starter 模块（`{name}-spring-boot-starter`） 。自动配置模块负责定义自动配置的逻辑和相关的 Bean，而 Starter 模块则主要用于聚合依赖。

- 定义配置属性类：在自动配置模块中，创建一个配置属性类，用于绑定配置文件中的属性。例如，我们创建一个 `MyCustomProperties` 类：

```java
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "my.custom")
public class MyCustomProperties {
    private String customProperty;

    public String getCustomProperty() {
        return customProperty;
    }

    public void setCustomProperty(String customProperty) {
        this.customProperty = customProperty;
    }
}
```

这个类会绑定 `application.properties` 或 `application.yml` 中以 `my.custom` 为前缀的属性。

- 编写自动配置类：接着，编写自动配置类，使用 `@Configuration` 注解标记为配置类，并通过 `@Conditional` 系列注解来控制配置的生效条件。比如：

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnClass(MyCustomService.class)
@EnableConfigurationProperties(MyCustomProperties.class)
public class MyCustomAutoConfiguration {

    @Autowired
    private MyCustomProperties myCustomProperties;

    @Bean
    @ConditionalOnMissingBean
    public MyCustomService myCustomService() {
        return new MyCustomServiceImpl(myCustomProperties.getCustomProperty());
    }
}
```

在这个例子中，只有当类路径中存在 `MyCustomService` 类，并且容器中不存在 `MyCustomService` 的 `Bean` 时，才会创建 `MyCustomServiceImpl` 的实例，并将配置属性传递给它。

- 注册自动配置类：在自动配置模块的 `resources/META-INF` 目录下，创建一个 `spring.factories` 文件（Spring Boot 2.7+ 也可使用 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 文件 ），并在其中注册自动配置类：

```ini
org.springframework.boot.autoconfigure.EnableAutoConfiguration=com.example.mycustomstarter.autoconfigure.MyCustomAutoConfiguration
```

- 创建 Starter 模块：在 Starter 模块的 pom.xml 文件中，声明对自动配置模块的依赖，以及其他可能需要的依赖：

```xml
<dependencies>
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>my-custom-spring-boot-autoconfigure</artifactId>
        <version>1.0.0</version>
    </dependency>
    <!-- 其他依赖 -->
</dependencies>
```

完成以上步骤后，我们的自定义 Starter 就开发完成了。其他项目只需引入这个 Starter，就可以使用我们定义的功能和配置 。

## 七、自动配置与配置绑定 ##

在 Spring Boot 开发中，我们经常需要读取配置文件中的属性值，以适应不同的环境（如开发、测试、生产）。Spring Boot 提供的自动配置和配置绑定功能，让这一过程变得轻松又高效，彻底告别了硬编码的烦恼。

### @ConfigurationProperties 注解实现配置绑定 ###

假设我们正在开发一个电商系统，系统中涉及到商品的相关配置，如商品图片的存储路径、商品价格的显示精度等。我们可以通过 `@ConfigurationProperties` 注解，轻松地将配置文件中的属性绑定到 Java 类中。

首先，在 application.yml 配置文件中添加如下配置：

```yaml
goods:
  image:
    storage-path: /data/images/goods
  price:
    precision: 2
```

然后，创建一个配置属性类 GoodsConfig：

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "goods")
public class GoodsConfig {

    private GoodsImage image;
    private GoodsPrice price;

    // 省略getter和setter方法

    public static class GoodsImage {
        private String storagePath;

        public String getStoragePath() {
            return storagePath;
        }

        public void setStoragePath(String storagePath) {
            this.storagePath = storagePath;
        }
    }

    public static class GoodsPrice {
        private int precision;

        public int getPrecision() {
            return precision;
        }

        public void setPrecision(int precision) {
            this.precision = precision;
        }
    }
}
```

在上述代码中，我们使用 `@ConfigurationProperties` 注解，并指定 prefix 为 “goods”，表示绑定以 “goods” 开头的配置属性。通过这种方式，配置文件中的属性会自动映射到 GoodsConfig 类的相应字段中，实现了配置的结构化管理。

### 使用占位符读取配置属性 ###

除了 `@ConfigurationProperties` 注解，Spring Boot 还支持使用占位符来读取配置属性，这在一些简单的配置场景中非常方便。比如，我们在配置文件中定义了数据库的连接地址：

```yaml
database:
  url: jdbc:mysql://localhost:3306/your_database
```

在 Java 代码中，我们可以使用 `@Value` 注解结合占位符来获取这个配置值：

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class DatabaseService {

    @Value("${database.url}")
    private String databaseUrl;

    // 使用databaseUrl进行数据库操作
}
```

通过这种方式，我们可以灵活地在代码中使用配置文件中的属性值，并且在需要修改配置时，只需要在配置文件中进行修改，而无需修改代码，大大提高了代码的可维护性和可扩展性。

## 八、简单上手的异步与定时执行 ##

在 Spring Boot 开发中，异步调用和定时任务是非常常见的需求，它们能有效提升系统的性能和自动化程度 。Spring Boot 通过 `@Async` 和 `@Scheduled` 注解，让我们可以轻松实现这两个强大的功能 。

### @Async 实现异步调用 ###

在一个电商系统中，当用户完成订单支付后，我们可能需要进行一系列的后续操作，如发送支付成功通知、更新用户积分、记录支付日志等 。这些操作如果都在主线程中同步执行，会导致用户等待时间过长，影响用户体验 。这时，我们就可以使用 1 注解将这些操作异步化，让它们在后台线程中执行，从而提高系统的响应速度 。

- 开启异步功能：在 Spring Boot 应用中，首先需要在配置类或主启动类上添加 `@EnableAsync` 注解，开启异步功能 。例如：

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EcommerceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
    }
}
```

- 定义异步方法：在需要异步执行的方法上添加 `@Async` 注解 。比如，在订单服务类中，我们定义一个发送支付成功通知的方法：

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    @Async
    public void sendPaymentSuccessNotification(String userId, String orderId) {
        // 模拟发送通知的耗时操作，比如调用短信接口或邮件接口
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        logger.info("Payment success notification sent to user: {}, for order: {}", userId, orderId);
    }
}
```

在上述代码中，`sendPaymentSuccessNotification` 方法被 `@Async` 注解标记，当该方法被调用时，它会在一个新的线程中执行，而不会阻塞主线程 。

### `@Scheduled` 实现定时任务 ###

在电商系统中，我们可能需要定时执行一些任务，如每天凌晨更新商品库存、每周生成销售报表、每月清理过期的订单数据等 。Spring Boot 的 `@Scheduled` 注解为我们实现这些定时任务提供了极大的便利 。

- 开启定时任务功能：在配置类或主启动类上添加 `@EnableScheduling` 注解，开启定时任务功能 。例如：

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EcommerceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EcommerceApplication.class, args);
    }
}
```

- 定义定时任务方法：在需要定时执行的方法上添加 `@Scheduled` 注解，并指定执行的时间规则 。`@Scheduled` 注解支持多种时间表达式，如 fixedRate、fixedDelay、cron 等 。

  - fixedRate：表示按固定速率执行任务，即上一次任务开始执行的时间点后，间隔指定的时间再次执行 。例如，每 5 秒执行一次任务：

  ```java
  import org.slf4j.Logger;
  import org.slf4j.LoggerFactory;
  import org.springframework.scheduling.annotation.Scheduled;
  import org.springframework.stereotype.Component;

  @Component
  public class ScheduledTasks {

      private static final Logger logger = LoggerFactory.getLogger(ScheduledTasks.class);

      @Scheduled(fixedRate = 5000)
      public void updateProductStock() {
          // 模拟更新商品库存的操作
          logger.info("Product stock updated at: {}", System.currentTimeMillis());
      }
  }
  ```

  - fixedDelay：表示按固定延迟执行任务，即上一次任务执行结束的时间点后，间隔指定的时间再次执行 。例如，每次任务执行结束后，延迟 3 秒执行下一次任务：

  ```java
  import org.slf4j.Logger;
  import org.slf4j.LoggerFactory;
  import org.springframework.scheduling.annotation.Scheduled;
  import org.springframework.stereotype.Component;

  @Component
  public class ScheduledTasks {

      private static final Logger logger = LoggerFactory.getLogger(ScheduledTasks.class);

      @Scheduled(fixedDelay = 3000)
      public void generateSalesReport() {
          // 模拟生成销售报表的操作
          logger.info("Sales report generated at: {}", System.currentTimeMillis());
      }
  }
  ```

  - cron：使用 Cron 表达式来指定任务的执行时间，这是最灵活的方式，可以实现各种复杂的时间调度 。例如，每天凌晨 2 点执行任务：

  ```java
  import org.slf4j.Logger;
  import org.slf4j.LoggerFactory;
  import org.springframework.scheduling.annotation.Scheduled;
  import org.springframework.stereotype.Component;

  @Component
  public class ScheduledTasks {

      private static final Logger logger = LoggerFactory.getLogger(ScheduledTasks.class);

      @Scheduled(cron = "0 0 2 * * ?")
      public void cleanExpiredOrders() {
          // 模拟清理过期订单数据的操作
          logger.info("Expired orders cleaned at: {}", System.currentTimeMillis());
      }
  }
  ```

Cron 表达式是一个由 6 或 7 个字段组成的字符串，每个字段代表不同的时间单位，依次为秒、分、时、日、月、周、年（年可选） 。通过合理组合这些字段，可以实现非常精确的时间调度 。例如，`0 0 12 * * ?` 表示每天中午 12 点执行任务；`0 30 9 * * 1-5` 表示每周一至周五的上午 9 点 30 分执行任务 。

## 九、内建运维支持：Spring Boot Actuator ##

在当今的软件开发领域，随着应用系统的规模和复杂度不断攀升，对应用运行状态的监控与管理变得至关重要。Spring Boot Actuator 就像是一位默默守护的运维卫士，为 Spring Boot 应用提供了强大的生产级监控和管理功能，让我们能够实时洞察应用的内部运行情况，及时发现并解决潜在的问题 。

### Actuator 端点监控 ###

Actuator 通过一系列以 `/actuator/*` 开头的端点，为我们展示了应用丰富的运行时信息 。比如，`/actuator/health` 端点用于检查应用的健康状况，它就像是给应用做了一次全面的体检，会检查应用依赖的各个组件（如数据库连接、缓存服务等）是否正常工作 。在一个电商系统中，如果数据库连接出现问题，`/actuator/health` 端点就会及时反馈，显示应用处于不健康状态，让我们能够迅速定位到问题所在 。

`/actuator/metrics` 端点则提供了应用各种性能指标的统计信息 ，如 CPU 使用率、内存占用、HTTP 请求的响应时间等 。这些指标就像是应用的 “生命体征”，通过它们，我们可以深入了解应用的运行性能，判断是否存在性能瓶颈 。例如，通过监控 HTTP 请求的响应时间，我们可以发现哪些接口响应缓慢，进而针对性地进行优化 。

### 自定义指标 ###

除了内置的监控指标，Spring Boot Actuator 还支持我们添加自定义指标，以满足特定的业务监控需求 。比如，在一个在线教育平台中，我们可能需要监控用户的课程观看时长、课程完成率等指标 。我们可以利用 Micrometer（Spring Boot Actuator 默认的度量指标采集框架）来实现这一功能 。首先，引入相关依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-core</artifactId>
</dependency>
```

然后，在代码中定义并记录自定义指标 。例如，记录用户的课程观看时长：

```java
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

@Service
public class CourseMetricsService {

    private final Counter courseViewTimeCounter;

    public CourseMetricsService(MeterRegistry registry) {
        this.courseViewTimeCounter = Counter.builder("course.view.time.total")
               .description("Total time users have spent watching courses")
               .register(registry);
    }

    public void recordCourseViewTime(long viewTime) {
        courseViewTimeCounter.increment(viewTime);
    }
}
```

在上述代码中，我们通过 MeterRegistry 创建了一个名为 `course.view.time.total` 的计数器，并在用户观看课程时，调用 `recordCourseViewTime` 方法记录观看时长 。之后，我们就可以通过 `/actuator/metrics` 端点查看这个自定义指标的数据 ，为业务分析和优化提供有力支持 。

## 十、SpEL 表达式语言 ##

Spring 表达式语言（SpEL）是 Spring 框架提供的一种强大的表达式语言，它允许我们在运行时查询和操作对象图 ，就像是一把万能钥匙，能打开各种动态配置和逻辑处理的大门 。

### SpEL 的应用场景 ###

在实际开发中，SpEL 有着广泛的应用。比如在动态计算场景中，我们可以使用 SpEL 进行复杂的数学运算 。假设我们正在开发一个金融系统，需要根据不同的利率和期限计算利息，使用 SpEL 就可以轻松实现：

```java
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;

public class InterestCalculator {
    public static void main(String[] args) {
        ExpressionParser parser = new SpelExpressionParser();
        // 假设本金为10000，年利率为0.05，期限为2年
        Expression exp = parser.parseExpression("10000 * 0.05 * 2");
        double interest = (Double) exp.getValue();
        System.out.println("计算出的利息为：" + interest);
    }
}
```

在上述代码中，我们通过 `SpelExpressionParser` 创建了一个表达式解析器，然后使用它解析了一个计算利息的表达式 “10000 * 0.05 * 2”，最后通过 `exp.getValue ()` 方法获取计算结果，得到利息为 1000.0。

在条件注解场景中，SpEL 也大显身手。比如，我们可以使用 `@ConditionalOnExpression` 注解结合 SpEL 表达式来动态决定是否创建某个 Bean 。在一个分布式系统中，我们可能需要根据不同的环境配置来决定是否创建 Redis 缓存的相关 Bean 。假设我们在 application.yml 配置文件中有如下配置：

```yaml
redis:
  enable: true
```

然后，在配置类中可以这样使用 SpEL：

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.ConditionalOnExpression;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;

@Configuration
public class RedisConfig {

    @Bean
    @ConditionalOnExpression("#{environment.getProperty('redis.enable') == 'true'}")
    public RedisTemplate<String, Object> redisTemplate() {
        // 配置RedisTemplate的逻辑
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        // 省略其他配置
        return template;
    }
}
```

在这个例子中，只有当配置文件中的 `redis.enable` 属性值为 `“true”` 时，才会创建 `redisTemplate` 这个 Bean 。

在配置注入场景中，SpEL 同样不可或缺。通过 `@Value` 注解结合 SpEL，我们可以动态注入配置值、系统属性、运算结果等 。例如，我们在 application.yml 配置文件中定义了一个配置项：

```yaml
user:
  name: 张三
  age: 25
```

在 Java 类中，可以使用 `@Value` 注解和 `SpEL` 来获取并处理这些配置值：

```java
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class UserConfig {

    @Value("#{${user.name}}")
    private String name;

    @Value("#{${user.age} + 5}")
    private int futureAge;

    // 省略getter和setter方法
}
```

在上述代码中，`@Value("#{${user.name}}")` 会从配置文件中获取 `user.name` 的值并注入到 `name`字段中，而 `@Value("#{${user.age} + 5}")` 则会从配置文件中获取 `user.age` 的值，然后加上 `5`，将结果注入到 `futureAge` 字段中 。

## 十一、配置驱动开发理念 ##

从上面的内容我们不难看出，Spring Boot 倡导的配置驱动开发理念，即配置即代码，为开发者带来了诸多便利 。通过简洁的配置文件和注解，我们可以轻松实现按需加载、环境隔离和属性映射 。无论是数据库连接、消息队列配置，还是缓存策略和 HTTP 请求处理，Spring Boot 都能通过配置文件或注解的方式，将这些底层细节交由框架处理 。

比如，在配置数据库连接时，我们只需要在 application.yml 文件中添加几行配置，就能完成数据源的配置 ，无需手动编写复杂的连接代码 。在处理不同环境（开发、测试、生产）的配置时，Spring Boot 通过 Profile 机制，让我们可以轻松切换不同环境的配置文件，实现环境隔离 。

这种配置驱动的开发方式，让我们可以更加专注于业务核心逻辑的开发 ，提高开发效率的同时，也增强了应用的可维护性和可扩展性 。所以，在日常开发中，充分利用 Spring Boot 的这些内置功能和配置驱动理念，让我们的开发工作更加高效、便捷 。

## 十二、结尾：强调优势，鼓励使用 ##

Spring Boot 的这些内置功能，每一个都蕴含着强大的能量，从请求的全流程追踪，到复杂依赖的管理；从异步任务的高效执行，到系统运行状态的实时监控 ，它们贯穿了我们开发的每一个环节，为我们打造了一个高效、便捷的开发环境 。

在实际项目中使用这些功能，不仅能大幅提高开发效率，减少重复劳动，还能让我们的代码更加健壮、易维护 。所以，别再自己苦苦摸索、重复造轮子了，充分利用 Spring Boot 的内置功能吧，让它成为你开发路上的得力助手 ，助力你在编程的世界里一路驰骋 。
