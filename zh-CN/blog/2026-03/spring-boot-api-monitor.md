---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 监控 API 请求耗时解决方案
description: Spring Boot 监控 API 请求耗时解决方案
date: 2026-03-19 10:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 简介 ##

在微服务架构与高并发场景下，API接口的响应速度直接影响用户体验与系统稳定性。随着业务复杂度提升，接口性能问题逐渐成为系统瓶颈，例如数据库查询延迟、第三方服务调用超时等场景，均可能导致接口耗时激增。传统的手动埋点统计方式（如在每个接口方法中记录开始与结束时间）存在代码侵入性强、维护成本高的问题，难以满足大规模接口的监控需求。

本篇文章将介绍 Spring Boot 中记录 API 请求耗时的 6 种实用方案，涵盖从基础到进阶的多种实现方式，帮助开发者根据业务场景选择最适合的监控手段。

> 以下是实战案例

## 手动记录 ##

我们可以通过Spring内置的StopWatch工具进行记录方法执行耗时情况：

```java
@GetMapping("/query")
public ResponseEntity<?> query() throws Exception {
  StopWatch stopWatch = new StopWatch();
  stopWatch.start();
  // 业务逻辑
  TimeUnit.MILLISECONDS.sleep(new Random().nextLong(2000)) ;
  stopWatch.stop();
  System.out.printf("方法耗时：%dms%n", stopWatch.getTotalTimeMillis()) ;
  return ResponseEntity.ok("api query...") ;
}
```

### 运行结果 ###

```txt
方法耗时：1096ms
```

针对手动记录这里总结2点缺点：

- 代码侵入性强：每次需要记录请求耗时的时候都需要在具体的业务逻辑中插入相应的计时代码（如使用System.currentTimeMillis()或StopWatch）。这种方式会增加代码的复杂度，并且使得业务逻辑与性能监控代码耦合在一起，降低了代码的可读性和维护性。
- 重复工作：如果多个地方都需要进行类似的耗时统计，则可能需要在每个地方都添加相同的代码，这导致了代码的重复。违反了DRY（Don't Repeat Yourself）原则。

## 自定义AOP记录 ##

通过自定义注解结合Spring AOP切面编程，可实现无侵入式的方法执行耗时统计与记录。

```java
@Aspect
@Component
public class PerformanceAspect {


  private static final Logger logger = LoggerFactory.getLogger("api.timed") ;
  @Around("@annotation(org.springframework.web.bind.annotation.RequestMapping) || "
      + "@annotation(org.springframework.web.bind.annotation.GetMapping) || "
      + "@annotation(org.springframework.web.bind.annotation.PostMapping) || "
      + "@annotation(org.springframework.web.bind.annotation.PutMapping) || "
      + "@annotation(org.springframework.web.bind.annotation.DeleteMapping) || "
      + "@annotation(org.springframework.web.bind.annotation.PatchMapping)")
  public Object recordExecutionTime(ProceedingJoinPoint pjp) throws Throwable {
    StopWatch sw = new StopWatch();
    sw.start();
    Object result = pjp.proceed();
    sw.stop();
    logger.info("方法【{}】耗时: {}ms", pjp.getSignature(), sw.getTotalTimeMillis()) ;
    return result;
  }
}
```

在该示例，我们并没有自定义注解，而是直接拦截了定义Controller接口使用的注解。

### 运行结果 ###

```txt
Line:29 - 方法【ResponseEntity ApiController.query()】耗时: 487ms
```

总结：AOP实现耗时记录非侵入、统一管理、减少重复代码，适合全局监控。对非Spring管理的方法无效，增加切面复杂度，可能影响性能。

## 拦截器技术 ##

通过拦截器不用修改任何业务代码就能非常方便的记录方法执行耗时情况。

```java
public class TimedInterceptor implements HandlerInterceptor {
  @Override
  public boolean preHandle(HttpServletRequest request, 
      HttpServletResponse response, Object handler) {
    request.setAttribute("startTime", System.currentTimeMillis());
    return true;
  }
  @Override
  public void afterCompletion(HttpServletRequest request, 
      HttpServletResponse response, Object handler, Exception ex) {
    long startTime = (long) request.getAttribute("startTime");
    long cost = System.currentTimeMillis() - startTime;
    System.out.printf("请求【%s】耗时: %dms%n", request.getRequestURI(), cost) ;
  }
}
```

### 注册拦截器 ###

```java
@Component
public class InterceptorConfig implements WebMvcConfigurer {
  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new TimedInterceptor())
      .addPathPatterns("/api/**") ;
  }
}
```

### 运行结果 ###

```txt
请求【/api/query】耗时: 47ms
```

总结：拦截器可集中管理请求耗时记录，减少代码侵入性，适用于Controller层统一监控。仅对Web请求（Controller）生效，无法捕获非HTTP接口或内部方法调用耗时，粒度较粗。

## 使用Filter ##

Filter 是 Servlet 规范中的过滤器，用于在请求到达目标资源前后进行拦截处理，可用于日志记录、权限校验等通用逻辑。

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // 确保最先执行
public class RequestTimingFilter implements Filter {
  private static final PathPatternParser parser = new PathPatternParser();


  private static final Logger logger = LoggerFactory.getLogger(RequestTimingFilter.class);
  // 从配置文件中读取排除路径
  @Value("${timing.filter.exclude-paths}")
  private String[] excludePaths;
  // 路径匹配器缓存
  private List<PathPattern> excludedPatterns = Collections.emptyList();
  @Override
  public void init(FilterConfig filterConfig) {
    // 初始化时编译排除路径的正则表达式
    excludedPatterns = Arrays.stream(excludePaths).map(path -> parser.parse(path)).toList() ;
    logger.info("记录请求耗时,不记录的URI: {}", Arrays.toString(excludePaths));
  }
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest httpRequest = (HttpServletRequest) request;
    String requestURI = httpRequest.getRequestURI();
    // 检查是否在排除路径中
    if (shouldExclude(requestURI)) {
      chain.doFilter(request, response);
      return;
    }
    long startTime = System.nanoTime();
    try {
      // 执行后续过滤器链和实际请求处理
      chain.doFilter(request, response);
    } finally {
      long endTime = System.nanoTime();
      long durationNanos = endTime - startTime;
      long durationMillis = TimeUnit.NANOSECONDS.toMillis(durationNanos);
      // 记录日志（包含请求方法和状态码）
      if (response instanceof HttpServletResponse httpResponse) {
        int status = httpResponse.getStatus();
        logger.info("[{}] {} - {}ms (Status: {})", httpRequest.getMethod(), requestURI, durationMillis, status);
      } else {
        logger.info("[{}] {} - {}ms", httpRequest.getMethod(), requestURI, durationMillis);
      }
    }
  }
  private boolean shouldExclude(String requestURI) {
    return excludedPatterns.stream()
        .anyMatch(pattern -> pattern.matches(PathContainer.parsePath(requestURI))) ;
  }
}
```

### 运行结果 ###

```txt
RequestTimingFilter Line:77  - [GET] /api/query - 379ms (Status: 200)
```

总结：Filter 实现耗时记录非侵入，适用于全局请求监控，配置简单；仅能记录整个请求的处理时间，无法精确到具体方法或业务逻辑，粒度较粗。

## 通过事件监听 ##

在Spring MVC底层内部，当一个请求处理完成以后会发布ServletRequestHandledEvent 事件，通过监听该事件就能获取请求的详细信息。

```java
@Component
public class TimedListener {
  @EventListener(ServletRequestHandledEvent.class)
  public void recordTimed(ServletRequestHandledEvent event) {
    System.err.println(event) ;
  }
}
```

### 运行结果 ###

```txt
ServletRequestHandledEvent: url=[/api/query]; 
  client=[0:0:0:0:0:0:0:1]; method=[GET]; status=[200]; 
  servlet=[dispatcherServlet]; session=[null]; user=[null]; 
  time=[696ms]
```

详细的输出了当前请求的信息。

总结：非侵入式获取请求处理耗时，适用于全局监控且无需修改业务代码；仅能获取整个请求的耗时信息，无法定位具体方法或模块性能问题，粒度较粗。

## Micrometer + Prometheus ##

Micrometer 是一个指标度量工具，支持多种监控系统，如 Prometheus。通过 @Timed 注解可轻松记录方法耗时；Prometheus 是开源监控系统，擅长拉取和聚合指标，常与 Micrometer 集成实现可视化监控。两者结合适合微服务性能观测。

```java
@Timed(value = "api.query", description = "查询业务接口")
@GetMapping("/query")
public ResponseEntity<?> query() throws Exception {
  TimeUnit.MILLISECONDS.sleep(new Random().nextLong(2000)) ;
  return ResponseEntity.ok("api query...") ;
}
```

在需要监控的接口上添加 @Timed 注解，同时你还需要进行如下的配置：

```yaml
management:
  observations:
    annotations:
      enabled: true
```

要结合Prometheus，那么我们还需要引入如下依赖

```xml
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

配置actuator暴露Prometheus端点

```yaml
management:
  endpoints:
    web:
      exposure:
        include: '*'
      base-path: /ac
```

最后，我们还需要在Prometheus中进行配置

```yaml
- job_name: "testtag"
  metrics_path: "/ac/prometheus"
  static_configs:
    - targets: ["localhost:8080"]
```

总结：非侵入、集成简单，支持细粒度方法级监控，与Spring Boot天然兼容，数据可持久化并可视化；需引入监控组件，增加系统复杂度。

## 使用Arthas ##

Arthas 是一款线上监控诊断产品，通过全局视角实时查看应用 load、内存、gc、线程的状态信息，并能在不修改应用代码的情况下，对业务问题进行诊断，包括查看方法调用的出入参、异常，监测方法执行耗时，类加载信息等，大大提升线上问题排查效率。

首先，在如下地址下载最新的  [Arthas](https://github.com/alibaba/arthas/releases)

接下来，通过如下命令启动Arthas

```bash
java -jar arthas-boot.jar
```

通过前面的数字选择哪个进程。

连接到具体的进程后，我们可以通过如下的命令来跟踪记录方法执行耗时情况

```bash
trace com.pack.timed.controller.ApiController query
```

## 使用SkyWalking ##

SkyWalking 是一个开源的 APM（应用性能监控）系统，支持分布式链路追踪、服务网格观测、度量聚合与可视化，适用于微服务、云原生和 Service Mesh 架构，帮助开发者实现全栈性能监控与故障诊断。

我们无需在代码中写任何代码或是引入依赖，因为SkyWalking将使用agent技术进行跟踪系统。

首先，我们需要在如下地址下载SkyWalking已经java对应的agent。

[SkyWalking](https://skywalking.apache.org/downloads/)

Web UI 运行在8080端口

最后，我们在运行程序时，需要加入如下JVM参数。

```bash
-javaagent:D:\all\opensource\skywalking\skywalking-agent\skywalking-agent.jar 
-Dskywalking.agent.service_name=pack-api
```


总结：SkyWalking 自动完成链路追踪与耗时监控，支持分布式系统，无需修改代码，可视化强，性能影响小。在分布式系统中非常推荐。
