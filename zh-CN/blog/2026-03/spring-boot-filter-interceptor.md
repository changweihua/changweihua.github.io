---
lastUpdated: true
commentabled: true
recommended: true
title: Spring 过滤器（Filter）与拦截器（Interceptor）深度对比
description: 原理与实战
date: 2026-03-09 13:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

作为一名摸爬滚打.NET 十八年萌新的 Java 开发，我敢说：90% 的 Spring 开发者都踩过 Filter 和 Interceptor 的坑。上周线上排查一个权限校验失效的故障，最后发现是新人把 “登录态校验” 写在了 Filter 里，却因为 Filter 无法注入 Spring Bean 导致校验逻辑形同虚设 —— 这种因为混淆两者差异引发的问题，在我八年职业生涯里见过太多次。

今天就从 “原理拆解 + 实战落地 + 踩坑避坑” 三个维度，用最接地气的方式把 Filter 和 Interceptor 讲透。不管你是刚入行的新手，还是想夯实基础的资深开发者，读完这篇都能彻底分清什么时候该用哪个，再也不踩配置和选型的坑。

## 一、先搞懂：两者到底是什么？（通俗原理拆解） ##

很多人觉得 Filter 和 Interceptor 都是 “拦截请求” 的，功能差不多 —— 但其实两者的底层逻辑和设计目标完全不同，用两个比喻就能秒懂：

### Filter：Web 容器的 “小区保安” ###

Filter 是Servlet 规范的一部分，属于 Web 容器层面的组件，不依赖 Spring 框架就能独立工作。它就像小区门口的保安，不管你是去住户家（Controller 请求）、去便利店（静态资源）、还是去快递柜（未映射 URL），都必须经过它的检查。

- 核心原理：基于责任链模式，Web 容器（Tomcat）会维护一条 Filter 链，请求必须依次通过所有 `Filter` 才能到达目标资源，响应则反向回流。
- 生命周期：由 Servlet 容器管理，web 应用启动时初始化（`init` 方法执行一次），销毁时调用 `destroy` 方法释放资源，全程与 Spring 容器无关。
- 核心方法：只有 `doFilter` 一个核心方法，同时处理请求前置逻辑和响应后置逻辑，通过 `FilterChain` 控制是否放行。

### Interceptor：Spring 容器的 “公司前台” ###

Interceptor 是Spring MVC 框架的专属组件，依赖 Spring 容器才能工作。它就像公司前台，只负责拦截 “找员工办事”（Controller 请求）的人，对去茶水间（静态资源）、会议室（非 MVC 请求）的人完全不干预。

- 核心原理：基于AOP 思想，拦截的是 Spring MVC 的处理器（Handler）执行流程，只能在 `DispatcherServlet` 分发的请求链路中生效。
- 生命周期：由 Spring 容器管理，支持依赖注入（`@Autowired`），可以直接使用 Service、Mapper 等 Spring Bean。
- 核心方法：三个回调方法覆盖请求全流程，粒度更细：

  - preHandle：Controller 方法执行前触发（返回 true 放行，false 中断）；
  - postHandle：Controller 执行后、视图渲染前触发（可修改 ModelAndView）；
  - afterCompletion：视图渲染完成后触发（无论成功失败都会执行，适合资源清理）。

## 二、核心差异：9 个维度对比（一张表看透） ##

光靠比喻不够，实战中选型需要精准把握差异。下面这张表是我八年开发总结的核心对比维度，覆盖配置、功能、场景等关键信息，建议收藏：

|  对比维度   |    过滤器（Filter）  |   拦截器（Interceptor）  |
| :-----------: | :-----------: | :-----------: |
| 规范归属 | Servlet 规范（Jakarta EE 标准） | Spring MVC 框架机制 |
| 依赖关系 | 不依赖 Spring，由 Servlet 容器管理 | 强依赖 Spring，需 Spring 容器初始化 |
| 拦截范围 | 所有请求（含静态资源、未映射 URL） | 仅拦截 Spring MVC 的 Controller 请求 |
| 可访问对象 | 仅能操作 ServletRequest/Response 原始对象 | 可获取 HandlerMethod、ModelAndView 等 Spring 对象 |
| 依赖注入 | 直接 `@Autowired` 失效（需特殊配置） | 支持正常 `@Autowired` 注入 Spring Bean |
| 执行时机 | `DispatcherServlet` 之前 / 之后执行 | `DispatcherServlet` 内部，Controller 前后执行 |
| 配置粒度 | 支持 URL Pattern 通配符，全局生效 | 为主支持路径包含 / 排除，可精准匹配接口 |
| 异常处理 | 无法参与 Spring 异常处理流程 | 可配合 `@ControllerAdvice` 统一处理异常 |
| 典型场景 | 编码设置、跨域处理、XSS 过滤、全链路追踪 | 权限校验、业务日志、请求参数预处理、响应包装 |

> 💡 关键结论：Filter 管 “全局基础设施”，Interceptor 管 “业务逻辑增强”—— 这是两者最核心的定位差异，也是选型的首要依据。

## 三、实战落地：Spring Boot 3.x 环境下的具体实现 ##

理论讲完，直接上可落地的代码。注意：Spring Boot 3.x 已全面迁移到 Jakarta EE 9+，Filter 的包名从`javax.servlet`改为`jakarta.servlet`，这是很多人踩坑的点，下面代码直接用最新规范。

### 场景 1：用 Filter 实现 XSS 过滤（全局安全防护） ###

XSS 过滤是所有请求都需要的安全防护，适合用 Filter 实现，拦截所有 URL：

#### 实现 Filter 逻辑 ####

```java
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import java.io.IOException;

// 全局XSS过滤器：过滤请求参数中的恶意脚本
@Component
public class XssFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        // 包装请求对象，重写getParameter方法实现XSS过滤
        XssHttpServletRequestWrapper xssRequest = new XssHttpServletRequestWrapper((HttpServletRequest) request);
        // 放行到下一个Filter或目标资源
        chain.doFilter(xssRequest, response);
    }

    // 自定义请求包装类：实现参数过滤逻辑
    static class XssHttpServletRequestWrapper extends jakarta.servlet.http.HttpServletRequestWrapper {
        public XssHttpServletRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getParameter(String name) {
            String value = super.getParameter(name);
            return value == null ? null : cleanXss(value);
        }

        // XSS过滤核心逻辑（简化版，实际可使用成熟工具类）
        private String cleanXss(String value) {
            return value.replaceAll("<", "&lt;")
                       .replaceAll(">", "&gt;")
                       .replaceAll("'", "&#39;")
                       .replaceAll(""", "&quot;");
        }
    }
}
```

#### 注册 Filter（精准控制拦截范围） ####

用 `FilterRegistrationBean` 手动注册，比 `@WebFilter` 更灵活，支持配置拦截路径和执行顺序：

```java
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<XssFilter> xssFilterRegistration(XssFilter xssFilter) {
        FilterRegistrationBean<XssFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(xssFilter);
        registration.addUrlPatterns("/api/*"); // 只拦截API请求
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE); // 最高优先级，先执行XSS过滤
        registration.setName("xssFilter");
        return registration;
    }
}
```

### 场景 2：用 `Interceptor` 实现权限校验（业务相关拦截） ###

权限校验需要结合用户状态、角色信息，依赖 Spring 的 Service 层，适合用 Interceptor 实现：

#### 实现 Interceptor 逻辑 ####

```java
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

// 权限拦截器：校验用户是否登录、是否有操作权限
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final UserService userService; // 直接注入Spring Bean，无需特殊配置

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        // 1. 非Controller请求（如静态资源）直接放行
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        // 2. 有@PermitAll注解的接口直接放行（如登录、注册）
        if (handlerMethod.hasMethodAnnotation(PermitAll.class)) {
            return true;
        }

        // 3. 从请求头获取Token，校验登录状态
        String token = request.getHeader("X-Token");
        if (token == null || !userService.validateToken(token)) {
            response.setStatus(401);
            response.getWriter().write("未登录或Token失效");
            return false;
        }

        // 4. 校验接口权限（如需要ADMIN角色）
        RequiredRole requiredRole = handlerMethod.getMethodAnnotation(RequiredRole.class);
        if (requiredRole != null && !userService.hasRole(token, requiredRole.value())) {
            response.setStatus(403);
            response.getWriter().write("权限不足");
            return false;
        }

        // 5. 校验通过，放行到Controller
        return true;
    }

    // 自定义注解：用于标记无需登录的接口
    public @interface PermitAll {}

    // 自定义注解：用于标记接口所需角色
    public @interface RequiredRole {
        String value();
    }
}
```

#### 注册 Interceptor ####

通过 `WebMvcConfigurer` 注册，支持精准配置拦截路径和排除路径：

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    // 构造函数注入Interceptor（@RequiredArgsConstructor也可）
    public WebMvcConfig(AuthInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**") // 拦截所有API接口
                .excludePathPatterns("/api/login", "/api/register") // 排除登录、注册接口
                .order(1); // 执行顺序（数值越小越先执行）
    }
}
```

## 四、八年踩坑实录：3 个最容易掉的坑及解决方案 ##

理论和代码都很完美，但实际开发中总有各种 “意外”。下面这 3 个坑是我和同事们踩过最多的，每个都附带根治方案：

### 坑 1：Filter 中 `@Autowired` 注入 Bean 失败（报 NullPointerException） ###

*原因*：

Filter 由 Servlet 容器初始化，而 Servlet 容器启动早于 Spring 容器，导致 Spring 无法为 Filter 注入 Bean。

*解决方案（按推荐度排序）*：

- 用 `FilterRegistrationBean` 注册：像上面实战那样，通过 Spring 容器管理 Filter 实例，注入的 Bean 自然有效；
- 构造函数注入：在 `FilterRegistrationBean` 中直接传入依赖的 Bean（`new XssFilter(userService)`）；
- 工具类获取 Bean：通过 `ApplicationContextHolder` 工具类手动获取 Bean（适合老项目改造）。

### 坑 2：Interceptor 的 postHandle 方法不执行 ###

*原因*：

- 要么 `preHandle` 方法返回了 `false`，导致后续流程中断；
- 要么 `Controller` 方法抛出异常，或直接写入响应流（如下载文件），导致视图渲染流程跳过；
- 异步请求（`Callable`/`DeferredResult`）中，`postHandle` 不会执行，需实现 `AsyncHandlerInterceptor`。

*解决方案*：

- 先检查 `preHandle` 返回值，确保为 `true`；
- 异常统一用 `@ControllerAdvice` 处理，避免 `Controller` 直接抛异常；
- 异步请求改用 `AsyncHandlerInterceptor`，重写 `afterConcurrentHandlingStarted` 方法。

### 坑 3：多个 Filter/Interceptor 执行顺序混乱 ###

*原因*：

- Filter 的执行顺序：`FilterRegistrationBean` 的 `setOrder` 数值越小越先执行，`@WebFilter` 按类名字母排序；
- Interceptor 的执行顺序：按 `addInterceptors` 的注册顺序，`preHandle` 正序执行，`postHandle` 和 `afterCompletion` 逆序执行。

*解决方案*：

- Filter 统一用 `FilterRegistrationBean` 注册，通过 `setOrder` 明确顺序（负数用于系统级 Filter，正数用于业务级）；
- Interceptor 按 “先安全后业务” 的顺序注册，比如先注册 `AuthInterceptor`，再注册 `LogInterceptor`。

## 五、选型指南：到底什么时候用哪个？ ##

最后用一张 “决策流程图” 帮你快速选型，记住核心原则：基础设施用 Filter，业务逻辑用 Interceptor：

1. 若需要拦截静态资源、处理编码 / 跨域 / XSS 等与业务无关的全局逻辑 → 用 Filter；
2. 若需要依赖 Spring Bean、做权限校验 / 业务日志 / 参数预处理等业务相关逻辑 → 用 Interceptor；
3. 若需要修改请求体 / 响应体（如解密、压缩） → 用 Filter（支持包装 Request/Response）；
4. 若需要细粒度控制（如只拦截特定注解的接口） → 用 Interceptor（可获取 HandlerMethod）。

简单总结成一句口诀： “全局拦截用 Filter，业务增强用 Interceptor” 。

## 六、总结 ##

八年开发下来，我深刻体会到：框架的核心组件没有 “好坏之分”，只有 “适配之分”。Filter 和 Interceptor 的本质区别，在于它们的设计定位 —— 一个是 Web 容器的 “底层守卫”，一个是 Spring 框架的 “业务助手”。

理解了它们的底层原理和适用场景，就能在实际开发中精准选型，避免踩坑。如果你的项目中还在为 “该用 Filter 还是 Interceptor” 纠结，或者遇到了其他配置问题，欢迎在评论区留言，我会用八年实战经验帮你分析解答～
