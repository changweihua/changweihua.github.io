---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot中OncePerRequestFilter原理
description: 与Filter单次调用控制全解析
date: 2026-03-09 08:35:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在Spring Boot/Web应用中，`OncePerRequestFilter` 是解决「Filter被多次调用」问题的核心组件。要理解其原理，需先搞清楚Filter为何会被多次执行，再拆解 `OncePerRequestFilter` 的“防重复”设计，最后掌握控制Filter单次调用的通用方法。

## 一、先搞懂：普通Filter为什么会被多次调用？ ##

Filter是Servlet规范的核心组件，其调用次数并非由Spring决定，而是由Servlet容器（Tomcat/Jetty）的请求分发机制 决定。普通Filter（直接实现javax.servlet.Filter）被多次调用的核心场景有3类：

### 核心触发场景（Servlet规范定义） ###

| **场景**        |      **触发原因**      |    **示例**      |
| :------------- | :-----------: | :-----------: |
|   请求转发（forward）  | `request.getRequestDispatcher().forward(req, resp)` 会重新执行Filter  | 链控制器转发到JSP页面、内部接口转发  |
|   请求包含（include）  | `request.getRequestDispatcher().include(req, resp)` 会嵌套执行Filter链  | 页面包含公共组件（如header.jsp）  |
|   异步请求（async）  | 异步处理时（如`request.startAsync()`），异步分发阶段会再次触发Filter链  | Spring MVC的异步控制器（`Callable`）  |
|   错误页面（error）  | 异常触发错误页面（如`web.xml`配置`<error-page>`），会重新执行Filter链  | 404/500错误跳转自定义页面  |

### 实战示例：普通Filter被多次调用 ###

```java
// 普通Filter：实现javax.servlet.Filter，无防重复逻辑
@Component
public class NormalFilter implements Filter {
    private static final Logger log = LoggerFactory.getLogger(NormalFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        log.info("NormalFilter执行，请求路径：{}，分发类型：{}", 
                 req.getRequestURI(), 
                 req.getDispatcherType()); // 打印分发类型
        chain.doFilter(request, response);
    }
}

// 控制器：触发forward转发
@Controller
public class TestController {
    @GetMapping("/test")
    public String test() {
        // 转发到/inner，会重新触发Filter链
        return "forward:/inner"; 
    }

    @GetMapping("/inner")
    @ResponseBody
    public String inner() {
        return "inner";
    }
}
```

执行结果：

```txt
NormalFilter执行，请求路径：/test，分发类型：REQUEST
NormalFilter执行，请求路径：/inner，分发类型：FORWARD
```

可见，一次HTTP请求触发了Filter两次执行（REQUEST+FORWARD），这是普通Filter的“天然问题”。

## 二、OncePerRequestFilter的核心原理：保证单次执行 ##

OncePerRequestFilter是Spring提供的Filter抽象类，核心目标是让*Filter在「一次完整的HTTP请求周期」内仅执行一次*，无论经历多少次forward/include/异步分发。

### 核心设计思路 ###

通过「请求属性标记」+「分发类型过滤」双重机制，确保Filter逻辑仅执行一次：

- 标记机制：执行Filter前，检查请求（HttpServletRequest）中是否存在“已执行”的标记属性；若存在则跳过，不存在则执行并设置标记；
- 分发类型控制：可配置仅在指定分发类型（如REQUEST）下执行，忽略FORWARD/INCLUDE/ERROR等场景。

### 源码级拆解（Spring 6.x/Spring Boot 3.x适配版） ###

OncePerRequestFilter的核心逻辑在doFilter方法中，简化后关键代码如下：

```java
public abstract class OncePerRequestFilter implements Filter {
    // 核心doFilter方法：控制单次执行
    @Override
    public final void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 1. 校验是否为HttpServletRequest（非HTTP请求直接放行）
        if (!(request instanceof HttpServletRequest) || !(response instanceof HttpServletResponse)) {
            filterChain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // 2. 生成唯一标记名：避免不同Filter的标记冲突
        String alreadyFilteredAttributeName = getAlreadyFilteredAttributeName();
        // 3. 检查是否已执行过：存在标记则跳过
        if (request.getAttribute(alreadyFilteredAttributeName) != null) {
            filterChain.doFilter(request, response);
            return;
        }

        // 4. 检查是否需要跳过当前分发类型（如FORWARD/ERROR）
        if (shouldNotFilter(httpRequest)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 5. 设置“已执行”标记：防止重复执行
        request.setAttribute(alreadyFilteredAttributeName, Boolean.TRUE);
        try {
            // 6. 执行子类重写的核心过滤逻辑（仅执行一次）
            doFilterInternal(httpRequest, httpResponse, filterChain);
        } finally {
            // 7. 移除标记（异步场景下可能需要保留，Spring做了特殊处理）
            request.removeAttribute(alreadyFilteredAttributeName);
        }
    }

    // 子类必须实现的核心方法：真正的过滤逻辑
    protected abstract void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException;

    // 生成唯一标记名：默认是Filter类名 + ".FILTERED"
    protected String getAlreadyFilteredAttributeName() {
        return getClass().getName() + ".FILTERED";
    }

    // 是否跳过过滤：默认返回false，子类可重写
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        return false;
    }

    // 异步分发时是否跳过（默认true：异步分发不执行）
    protected boolean shouldNotFilterAsyncDispatch() {
        return true;
    }

    // 错误分发时是否跳过（默认true：错误页面跳转不执行）
    protected boolean shouldNotFilterErrorDispatch() {
        return true;
    }
}
```

### 关键机制解析 ###

| **核心方法/属性**        |      **作用**      |
| :------------- | :-----------: |
|   `getAlreadyFilteredAttributeName`  | 生成唯一标记名（如`com.xxx.MyFilter.FILTERED`），避免多Filter标记冲突  |
|   `shouldNotFilter`  | 全局控制是否跳过过滤（子类可重写，如根据URL跳过）  |
|   `shouldNotFilterAsyncDispatch`  | 异步分发时是否跳过（默认true，避免异步场景重复执行）  |
|   `shouldNotFilterErrorDispatch`  | 错误页面分发时是否跳过（默认true，避免错误跳转重复执行）  |
|   `doFilterInternal`  | 子类重写的核心逻辑，仅在首次执行时调用  |

### 实战验证：OncePerRequestFilter仅执行一次 ###

```java
// 继承OncePerRequestFilter，保证单次执行
@Component
public class OncePerRequestDemoFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(OncePerRequestDemoFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        log.info("OncePerRequestFilter执行，请求路径：{}，分发类型：{}", 
                 request.getRequestURI(), 
                 request.getDispatcherType());
        filterChain.doFilter(request, response);
    }
}
```

执行结果：

```txt
OncePerRequestFilter执行，请求路径：/test，分发类型：REQUEST
```

即使触发forward转发，Filter仅在REQUEST分发类型下执行一次，完美解决重复调用问题。

## 三、如何控制Filter只被调用一次？（两种核心方案） ##

### 方案1：推荐——继承OncePerRequestFilter（Spring官方方案） ###

这是最简单、最稳定的方式，Spring已封装所有细节，只需重写doFilterInternal：

```java
// 步骤1：继承OncePerRequestFilter
@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // 控制Filter执行顺序
public class MySingleFilter extends OncePerRequestFilter {

    // 步骤2：重写doFilterInternal，实现核心逻辑
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 你的过滤逻辑：如token校验、日志记录、参数解析等
        String token = request.getHeader("token");
        if (token == null) {
            response.setStatus(401);
            response.getWriter().write("token为空");
            return;
        }

        // 放行请求
        filterChain.doFilter(request, response);
    }

    // 可选：重写shouldNotFilter，指定跳过的URL
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // 跳过静态资源和登录接口
        return path.startsWith("/static/") || path.equals("/login");
    }
}
```

### 方案2：手动实现——普通Filter+请求标记（无Spring依赖） ###

若不想依赖Spring（如纯Servlet项目），可手动实现“标记机制”，核心逻辑与OncePerRequestFilter一致：

```java
@Component
public class ManualSingleFilter implements Filter {
    // 步骤1：定义唯一标记名
    private static final String FILTERED_MARK = "ManualSingleFilter.FILTERED";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        // 步骤2：检查标记，存在则跳过
        if (req.getAttribute(FILTERED_MARK) != null) {
            chain.doFilter(request, response);
            return;
        }

        // 步骤3：过滤分发类型（仅处理REQUEST）
        if (!req.getDispatcherType().equals(DispatcherType.REQUEST)) {
            chain.doFilter(request, response);
            return;
        }

        try {
            // 步骤4：设置标记
            req.setAttribute(FILTERED_MARK, Boolean.TRUE);
            // 步骤5：核心过滤逻辑
            String token = req.getHeader("token");
            if (token == null) {
                resp.setStatus(401);
                resp.getWriter().write("token为空");
                return;
            }
            // 放行
            chain.doFilter(request, response);
        } finally {
            // 步骤6：移除标记（可选，请求结束后会自动销毁）
            req.removeAttribute(FILTERED_MARK);
        }
    }
}
```

### 方案3：进阶——配置Filter的DispatcherType（Servlet 3.0+） ###

通过`@WebFilter`或配置类指定Filter仅在REQUEST分发类型下执行，忽略FORWARD/INCLUDE/ERROR/ASYNC：

```java
// 方式1：注解配置
@WebFilter(urlPatterns = "/*", dispatcherTypes = DispatcherType.REQUEST)
public class DispatcherFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        // 仅在REQUEST分发类型下执行，避免forward/include重复调用
        chain.doFilter(request, response);
    }
}

// 方式2：Spring Boot配置类（推荐，更灵活）
@Configuration
public class FilterConfig {
    @Bean
    public FilterRegistrationBean<DispatcherFilter> dispatcherFilter() {
        FilterRegistrationBean<DispatcherFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new DispatcherFilter());
        registration.addUrlPatterns("/*");
        // 指定仅处理REQUEST类型
        registration.setDispatcherTypes(DispatcherType.REQUEST);
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
}
```

## 四、关键注意事项（避坑指南） ##

### 异步请求的特殊处理 ###

若Filter需要处理异步请求（如Spring MVC的`@Async`控制器），需重写`shouldNotFilterAsyncDispatch`返回false，并确保标记在异步上下文保留：

```java
@Override

protected boolean shouldNotFilterAsyncDispatch() {
    // 异步分发时也执行（默认true是跳过）
    return false;
}
```

### Filter执行顺序控制 ###

多个Filter时，通过`@Order`或`FilterRegistrationBean.setOrder()`指定顺序，OncePerRequestFilter不影响执行顺序，仅控制单次执行。

### 避免标记名冲突 ###

手动实现标记时，标记名必须唯一（建议用“类名+FILTERED”），否则多个Filter会互相干扰。

### 跨域Filter的特殊处理 ###

跨域（CORS）Filter必须是第一个执行的Filter，且需继承OncePerRequestFilter，否则OPTIONS预检请求可能被重复处理：

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        // 其他跨域头配置...
        filterChain.doFilter(request, response);
    }
}
```

## 五、总结 ##

### 核心原理 ###

- 普通Filter多次调用的根源：Servlet容器的forward/include/异步/错误分发会重新触发Filter链；
- OncePerRequestFilter的核心：通过「请求属性标记」+「分发类型过滤」，保证一次HTTP请求周期内仅执行一次；
- 关键方法：doFilterInternal（核心逻辑）、shouldNotFilter（跳过规则）、getAlreadyFilteredAttributeName（唯一标记）。

### 最佳实践 ###

| **场景**        |      **推荐方案**      |
| :------------- | :-----------: |
|   Spring Boot项目   | 继承OncePerRequestFilter（最简单）  |
|   纯Servlet项目   | 手动实现“标记机制”+ 分发类型过滤  |
|   仅需处理直接请求   | 配置DispatcherType.REQUEST（最轻量化）  |

### 避坑核心 ###

- 异步请求需重写`shouldNotFilterAsyncDispatch`；
- 标记名必须唯一；
- 跨域Filter需优先执行且继承OncePerRequestFilter。

通过以上方式，可彻底解决Filter重复调用的问题，保证过滤逻辑的准确性和性能。
