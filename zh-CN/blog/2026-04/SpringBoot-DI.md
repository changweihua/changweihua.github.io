---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 中Servlet、Filter、Listener 四种注册方式全解析
description: Spring Boot 中Servlet、Filter、Listener 四种注册方式全解析
date: 2026-04-20 09:35:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在Spring Boot项目里，Servlet、Filter、Listener是Java Web的核心组件，和传统Java Web项目比起来，它们的注册方式简单了不少～ Spring Boot提供了四种便捷注册方式，各自适配不同场景，下面给大家详细说说每种方式的实现、特点和注意点。

## 方式一：通过Spring Bean自动注册（简单也简陋） ##

这是Spring Boot里最省事的注册方式：Spring Boot启动时，会自动扫描容器里所有属于Servlet、Filter、Listener的Spring Bean，直接把它们注册到嵌入式Servlet容器（比如Tomcat、Jetty）里。

实现示例：

```java
// 1. 注册Servlet（作为Spring Bean）
@Component
public class MyServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().write("MyServlet Auto Registered");
    }
}

// 2. 注册Filter（作为Spring Bean）
@Component
public class MyFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        System.out.println("MyFilter Auto Filtering");
        chain.doFilter(request, response);
    }
}

// 3. 注册Listener（作为Spring Bean）
@Component
public class MyListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("ServletContext Initialized (Auto Registered)");
    }
}
```

小问题：默认路径的局限及优化办法

- Servlet：如果只有一个servlet，默认映射路径是/，否则为 `/bean` 名称（就是类名首字母小写，比如上面的MyServlet，对应路径就是`/myServlet`）；
- Filter：默认映射路径是 `/*`，意思是会拦截所有请求；
- Listener：不用手动配路径，它会自动监听Servlet上下文的相关事件（比如启动、销毁）。

> 优化小技巧：如果想改默认路径，要么结合方式二的RegistrationBean补充配置，要么直接用方式二、三、四，轻松实现自定义路径～

## 方式二：通过RegistrationBean手动注册（自定义首选） ##

如果想对Servlet、Filter、Listener做更细致的控制——比如自定义映射路径、设置初始化参数、指定加载顺序，甚至排除某些不需要拦截的路径，方式一就无能为力了。好在Spring Boot提供的RegistrationBean系列类，能让我们实现完全自定义配置，想怎么配就怎么配。

先说下核心类：

- ServletRegistrationBean：专门注册Servlet，映射路径、初始化参数、加载顺序都能配；
- FilterRegistrationBean：注册Filter专用，除了路径，还能配拦截规则、关联指定Servlet等；
- ServletListenerRegistrationBean：注册Listener，能设置Listener实例和启动顺序。

拿Filter举个例子（其他两种组件用法类似）：

```java
@Configuration
public class WebConfig {
    // 注册Filter，自定义路径和初始化参数
    @Bean
    public FilterRegistrationBean<MyFilter> myFilterRegistrationBean() {
        FilterRegistrationBean<MyFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new MyFilter()); // 设置Filter实例
        registrationBean.addUrlPatterns("/api/*"); // 自定义映射路径（仅拦截/api下的请求）
        registrationBean.setInitParameter("filterName", "myFilter"); // 初始化参数
        registrationBean.setOrder(1); // 设置加载顺序（值越小，加载越早）
        return registrationBean;
    }

    // 注册Servlet，自定义路径和初始化参数
    @Bean
    public ServletRegistrationBean<MyServlet> myServletRegistrationBean() {
        ServletRegistrationBean<MyServlet> registrationBean = new ServletRegistrationBean<>();
        registrationBean.setServlet(new MyServlet());
        registrationBean.addUrlMappings("/myServlet/custom"); // 自定义映射路径
        registrationBean.setInitParameter("servletName", "myServlet");
        registrationBean.setLoadOnStartup(1); // 启动时加载
        return registrationBean;
    }

    // 注册Listener
    @Bean
    public ServletListenerRegistrationBean<MyListener> myListenerRegistrationBean() {
        ServletListenerRegistrationBean<MyListener> registrationBean = new ServletListenerRegistrationBean<>();
        registrationBean.setListener(new MyListener());
        return registrationBean;
    }
}
```

## 方式三：使用 `@ServletRegistration` 和 `@FilterRegistration` 注解注册 ##

这是方式二（RegistrationBean手动注册）的注解替代方案，直接用Spring Boot提供的`@ServletRegistration`和`@FilterRegistration`两个注解，标注在Servlet和Filter类上，就能完成路径、初始化参数等自定义配置，适配喜欢注解式开发的场景。

核心说明：

- `@ServletRegistration`：专门用于注册Servlet，可配置映射路径、启动加载顺序、初始化参数等，功能与ServletRegistrationBean一致；
- `@FilterRegistration`：专门用于注册Filter，可配置映射路径、拦截规则、初始化参数等，功能与FilterRegistrationBean一致；
- 局限性：仅支持Servlet和Filter，Listener无法用这两个注解注册，需要 `spring-boot 3.5.x` 及以上版本。

实现示例：

```java
// 用@ServletRegistration注册Servlet，替代ServletRegistrationBean
@ServletRegistration(urlPatterns = "/myServlet/annotation", loadOnStartup = 1)
@Component
public class MyServlet extends HttpServlet {
    // 实现逻辑...
}

// 用@FilterRegistration注册Filter，替代FilterRegistrationBean
@FilterRegistration(urlPatterns = "/api/*", initParams = {@InitParam(name = "filterName", value = "myFilter")})
@Component
public class MyFilter implements Filter {
    // 实现逻辑...
}
```

## 方式四：使用Servlet3.0注解配合`@ServletComponentScan` ##

Servlet3.0规范本身就提供了三个注解——`@WebServlet`、`@WebFilter`、`@WebListener`，直接标注在组件类上，就能指定路径、名称这些配置。不过在Spring Boot项目里，得在启动类上加个`@ServletComponentScan`注解，开启对这三个注解的扫描，组件才能被自动注册上。

示例如下：

```java
// 1. 启动类添加@ServletComponentScan，指定扫描包（可选，默认扫描当前包及子包）
@SpringBootApplication
@ServletComponentScan(basePackages = "com.example.web.component")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// 2. 用@WebServlet注册Servlet
@WebServlet(urlPatterns = "/webServlet", name = "WebServletDemo", loadOnStartup = 1)
public class WebServletDemo extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().write("WebServlet Annotated Registered");
    }
}

// 3. 用@WebFilter注册Filter
@WebFilter(urlPatterns = "/web/*", filterName = "WebFilterDemo")
public class WebFilterDemo implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        System.out.println("WebFilter Annotated Filtering");
        chain.doFilter(request, response);
    }
}

// 4. 用@WebListener注册Listener
@WebListener
public class WebListenerDemo implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("ServletContext Initialized (WebListener Annotated)");
    }
}
```

### 注意事项 ###

- `@ServletComponentScan`一定要加在Spring Boot启动类上，不然扫描不到这三个注解标注的组件；
- 这种方式和方式一不冲突，如果一个组件既加了`@Component`，又加了`@WebServlet`（等）注解，Spring Boot会优先用`@WebServlet`里的配置（比如路径）；
- 需要Servlet3.0及以上版本的嵌入式容器，不过Spring Boot默认集成的Tomcat等容器都支持。

## 四种方式对比及适用场景 ##

|  注册方式   | 优点  |   局限  |   适用场景  |
| :-----------: | :-----------: | :-----------: | :-----------: |
|  Spring Bean自动注册   |  配置最简单，不用写额外代码，省时间  |   路径等配置固定，不能自定义  |   快速开发、不需要自定义配置的简单场景  |
|  RegistrationBean手动注册   |  配置超灵活，能完全控制组件的所有参数  |   需要写配置类，代码量稍微多一点  |   需要自定义路径、初始化参数、加载顺序的复杂场景  |
|  `@ServletRegistration`和`@FilterRegistration`注解   |  注解式配置，无需写配置类，比RegistrationBean更简洁  |   仅支持Servlet和Filter，不支持Listener；需要spring-boot 3.5.x及以上版本  |   偏好注解开发、仅需注册Servlet和Filter的场景  |
|  Servlet3.0注解+`@ServletComponentScan`   |  注解式配置，代码简洁，符合Servlet规范  |   需要加扫描注解，Listener的配置比较有限  |   习惯用Servlet规范注解、需要简单自定义配置的场景  |
