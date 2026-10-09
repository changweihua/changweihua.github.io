---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot中6种拦截器使用场景
description: SpringBoot中6种拦截器使用场景
date: 2026-03-09 09:00:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在构建企业级Web应用时，我们经常需要在请求处理的不同阶段执行一些通用逻辑，如权限验证、日志记录、性能监控等。Spring MVC的拦截器(Interceptor)机制提供了一种优雅的方式来实现这些横切关注点，而不必在每个控制器中重复编写相同的代码。

本文将介绍SpringBoot中6种常见的拦截器使用场景及其实现方式。

## 拦截器基础 ##

### 什么是拦截器？ ###

拦截器是Spring MVC框架提供的一种机制，用于在控制器(Controller)处理请求前后执行特定的逻辑。

### 拦截器与过滤器的区别 ###

- 归属不同：过滤器(Filter)属于Servlet规范，拦截器属于Spring框架。
- 拦截范围：过滤器能拦截所有请求，拦截器只能拦截Spring MVC的请求。
- 执行顺序：请求首先经过过滤器，然后才会被拦截器处理。

### 拦截器的生命周期方法 ###

拦截器通过实现 `HandlerInterceptor`接口来定义，该接口包含三个核心方法：

- preHandle() ：在控制器方法执行前调用，返回true表示继续执行，返回false表示中断请求。
- postHandle() ：在控制器方法执行后、视图渲染前调用。
- afterCompletion() ：在整个请求完成后调用，无论是否有异常发生。

## 场景一：用户认证拦截器 ##

### 使用场景 ###

用户认证拦截器主要用于:

- 验证用户是否已登录
- 检查用户是否有权限访问特定资源
- 实现无状态API的JWT token验证

### 实现代码 ###

```java
@Component
public class AuthenticationInterceptor implements HandlerInterceptor {
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private UserService userService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        
        // 跳过非控制器方法的处理
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        
        // 检查是否有@PermitAll注解，有则跳过认证
        PermitAll permitAll = handlerMethod.getMethodAnnotation(PermitAll.class);
        if (permitAll != null) {
            return true;
        }
        
        // 从请求头中获取token
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{"error": "未授权，请先登录"}");
            return false;
        }
        
        token = token.substring(7); // 去掉"Bearer "前缀
        
        try {
            // 验证token
            if (!jwtTokenProvider.validateToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{"error": "Token已失效，请重新登录"}");
                return false;
            }
            
            // 从token中获取用户信息并设置到请求属性中
            String username = jwtTokenProvider.getUsernameFromToken(token);
            User user = userService.findByUsername(username);
            
            if (user == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{"error": "用户不存在"}");
                return false;
            }
            
            // 检查方法是否有@RequireRole注解
            RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
            if (requireRole != null) {
                // 检查用户是否有所需角色
                String[] roles = requireRole.value();
                boolean hasRole = false;
                for (String role : roles) {
                    if (user.hasRole(role)) {
                        hasRole = true;
                        break;
                    }
                }
                
                if (!hasRole) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{"error": "权限不足"}");
                    return false;
                }
            }
            
            // 将用户信息放入请求属性
            request.setAttribute("currentUser", user);
            
            return true;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{"error": "Token验证失败"}");
            return false;
        }
    }
}
```

### 配置注册 ###

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Autowired
    private AuthenticationInterceptor authenticationInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authenticationInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login", "/api/auth/register");
    }
}
```

### 自定义注解 ###

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface PermitAll {
}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRole {
    String[] value();
}
```

### 最佳实践 ###

- 使用注解来标记需要认证或特定权限的接口
- 将拦截器中的业务逻辑抽取到专门的服务类中
- 为不同安全级别的API设计不同的路径前缀
- 添加详细的日志记录，便于问题排查

## 场景二：日志记录拦截器 ##

### 使用场景 ###

日志记录拦截器主要用于：

- 记录API请求和响应内容
- 跟踪用户行为
- 收集系统使用统计数据
- 辅助问题排查

### 实现代码 ###

```java
@Component
@Slf4j
public class LoggingInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        
        // 记录请求开始时间
        long startTime = System.currentTimeMillis();
        request.setAttribute("startTime", startTime);
        
        // 记录请求信息
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        String remoteAddr = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        
        // 获取当前用户（如果已通过认证拦截器）
        Object currentUser = request.getAttribute("currentUser");
        String username = currentUser != null ? ((User) currentUser).getUsername() : "anonymous";
        
        // 记录请求参数
        Map<String, String[]> paramMap = request.getParameterMap();
        StringBuilder params = new StringBuilder();
        
        if (!paramMap.isEmpty()) {
            for (Map.Entry<String, String[]> entry : paramMap.entrySet()) {
                params.append(entry.getKey())
                      .append("=")
                      .append(String.join(",", entry.getValue()))
                      .append("&");
            }
            
            if (params.length() > 0) {
                params.deleteCharAt(params.length() - 1);
            }
        }
        
        // 记录请求体（仅POST/PUT/PATCH请求）
        String requestBody = "";
        if (HttpMethod.POST.matches(method) || 
            HttpMethod.PUT.matches(method) || 
            HttpMethod.PATCH.matches(method)) {
            
            // 使用包装请求对象来多次读取请求体
            ContentCachingRequestWrapper wrappedRequest = 
                    new ContentCachingRequestWrapper(request);
            
            // 为了触发内容缓存，我们需要获取一次输入流
            if (wrappedRequest.getContentLength() > 0) {
                wrappedRequest.getInputStream().read();
                requestBody = new String(wrappedRequest.getContentAsByteArray(), 
                        wrappedRequest.getCharacterEncoding());
            }
        }
        
        log.info(
            "REQUEST: {} {} from={} user={} userAgent={} params={} body={}",
            method,
            requestURI,
            remoteAddr,
            username,
            userAgent,
            params,
            requestBody
        );
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                                Object handler, Exception ex) throws Exception {
        
        // 计算请求处理时间
        long startTime = (Long) request.getAttribute("startTime");
        long endTime = System.currentTimeMillis();
        long processingTime = endTime - startTime;
        
        // 记录响应状态和处理时间
        int status = response.getStatus();
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        
        if (ex != null) {
            log.error(
                "RESPONSE: {} {} status={} time={}ms error={}",
                method,
                requestURI,
                status,
                processingTime,
                ex.getMessage()
            );
        } else {
            log.info(
                "RESPONSE: {} {} status={} time={}ms",
                method,
                requestURI,
                status,
                processingTime
            );
        }
    }
}
```

### 配置与使用 ###

```java
@Bean
public FilterRegistrationBean<ContentCachingFilter> contentCachingFilter() {
    FilterRegistrationBean<ContentCachingFilter> registrationBean = new FilterRegistrationBean<>();
    registrationBean.setFilter(new ContentCachingFilter());
    registrationBean.addUrlPatterns("/api/*");
    return registrationBean;
}

@Override
public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(loggingInterceptor)
            .addPathPatterns("/**");
}
```

### 自定义内容缓存过滤器 ###

```java
public class ContentCachingFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);
        
        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            wrappedResponse.copyBodyToResponse();
        }
    }
}
```

### 最佳实践 ###

- 对敏感信息（如密码、信用卡号等）进行脱敏处理
- 设置合理的日志级别和轮转策略
- 针对大型请求/响应体，考虑只记录部分内容或摘要
- 使用MDC(Mapped Diagnostic Context)记录请求ID，便于跟踪完整请求链路

## 场景三：性能监控拦截器 ##

### 使用场景 ###

性能监控拦截器主要用于：

- 监控API响应时间
- 识别性能瓶颈
- 统计慢查询
- 提供性能指标用于系统优化

### 实现代码 ###

```java
@Component
@Slf4j
public class PerformanceMonitorInterceptor implements HandlerInterceptor {
    
    // 慢请求阈值，单位毫秒
    @Value("${app.performance.slow-request-threshold:500}")
    private long slowRequestThreshold;
    
    @Autowired
    private MetricsService metricsService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            String controllerName = handlerMethod.getBeanType().getSimpleName();
            String methodName = handlerMethod.getMethod().getName();
            
            request.setAttribute("controllerName", controllerName);
            request.setAttribute("methodName", methodName);
            request.setAttribute("startTime", System.currentTimeMillis());
        }
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                                Object handler, Exception ex) throws Exception {
        
        Long startTime = (Long) request.getAttribute("startTime");
        
        if (startTime != null) {
            long processingTime = System.currentTimeMillis() - startTime;
            
            String controllerName = (String) request.getAttribute("controllerName");
            String methodName = (String) request.getAttribute("methodName");
            String uri = request.getRequestURI();
            
            // 记录性能数据
            metricsService.recordApiPerformance(controllerName, methodName, uri, processingTime);
            
            // 记录慢请求
            if (processingTime > slowRequestThreshold) {
                log.warn("Slow API detected: {} {}.{} - {}ms (threshold: {}ms)",
                        uri, controllerName, methodName, processingTime, slowRequestThreshold);
                
                // 记录慢请求到专门的监控系统
                metricsService.recordSlowRequest(controllerName, methodName, uri, processingTime);
            }
        }
    }
}
```

### 指标服务实现 ###

```java
@Service
@Slf4j
public class MetricsServiceImpl implements MetricsService {
    
    // 使用滑动窗口记录最近的性能数据
    private final ConcurrentMap<String, SlidingWindowMetric> apiMetrics = new ConcurrentHashMap<>();
    
    // 慢请求记录队列
    private final Queue<SlowRequestRecord> slowRequests = new ConcurrentLinkedQueue<>();
    
    // 保留最近1000条慢请求记录
    private static final int MAX_SLOW_REQUESTS = 1000;
    
    @Override
    public void recordApiPerformance(String controller, String method, String uri, long processingTime) {
        String apiKey = controller + "." + method;
        
        apiMetrics.computeIfAbsent(apiKey, k -> new SlidingWindowMetric())
                  .addSample(processingTime);
        
        // 可以在这里添加Prometheus或其他监控系统的指标记录
    }
    
    @Override
    public void recordSlowRequest(String controller, String method, String uri, long processingTime) {
        SlowRequestRecord record = new SlowRequestRecord(
            controller, method, uri, processingTime, LocalDateTime.now()
        );
        
        slowRequests.add(record);
        
        // 如果队列超过最大容量，移除最早的记录
        while (slowRequests.size() > MAX_SLOW_REQUESTS) {
            slowRequests.poll();
        }
    }
    
    @Override
    public List<ApiPerformanceMetric> getApiPerformanceMetrics() {
        List<ApiPerformanceMetric> metrics = new ArrayList<>();
        
        for (Map.Entry<String, SlidingWindowMetric> entry : apiMetrics.entrySet()) {
            String[] parts = entry.getKey().split("\.");
            String controller = parts[0];
            String method = parts.length > 1 ? parts[1] : "";
            
            SlidingWindowMetric metric = entry.getValue();
            
            metrics.add(new ApiPerformanceMetric(
                controller,
                method,
                metric.getAvg(),
                metric.getMin(),
                metric.getMax(),
                metric.getCount()
            ));
        }
        
        return metrics;
    }
    
    @Override
    public List<SlowRequestRecord> getSlowRequests() {
        return new ArrayList<>(slowRequests);
    }
    
    // 滑动窗口指标类
    private static class SlidingWindowMetric {
        private final LongAdder count = new LongAdder();
        private final LongAdder sum = new LongAdder();
        private final AtomicLong min = new AtomicLong(Long.MAX_VALUE);
        private final AtomicLong max = new AtomicLong(0);
        
        public void addSample(long value) {
            count.increment();
            sum.add(value);
            
            // 更新最小值
            while (true) {
                long currentMin = min.get();
                if (value >= currentMin || min.compareAndSet(currentMin, value)) {
                    break;
                }
            }
            
            // 更新最大值
            while (true) {
                long currentMax = max.get();
                if (value <= currentMax || max.compareAndSet(currentMax, value)) {
                    break;
                }
            }
        }
        
        public long getCount() {
            return count.sum();
        }
        
        public double getAvg() {
            long countValue = count.sum();
            return countValue > 0 ? (double) sum.sum() / countValue : 0;
        }
        
        public long getMin() {
            return min.get() == Long.MAX_VALUE ? 0 : min.get();
        }
        
        public long getMax() {
            return max.get();
        }
    }
}
```

### 实体类定义 ###

```java
@Data
@AllArgsConstructor
public class ApiPerformanceMetric {
    private String controllerName;
    private String methodName;
    private double avgProcessingTime;
    private long minProcessingTime;
    private long maxProcessingTime;
    private long requestCount;
}

@Data
@AllArgsConstructor
public class SlowRequestRecord {
    private String controllerName;
    private String methodName;
    private String uri;
    private long processingTime;
    private LocalDateTime timestamp;
}
```

### 指标服务接口 ###

```java
public interface MetricsService {
    void recordApiPerformance(String controller, String method, String uri, long processingTime);
    
    void recordSlowRequest(String controller, String method, String uri, long processingTime);
    
    List<ApiPerformanceMetric> getApiPerformanceMetrics();
    
    List<SlowRequestRecord> getSlowRequests();
}
```

### 性能监控控制器 ###

```java
@RestController
@RequestMapping("/admin/metrics")
public class MetricsController {
    
    @Autowired
    private MetricsService metricsService;
    
    @GetMapping("/api-performance")
    public List<ApiPerformanceMetric> getApiPerformanceMetrics() {
        return metricsService.getApiPerformanceMetrics();
    }
    
    @GetMapping("/slow-requests")
    public List<SlowRequestRecord> getSlowRequests() {
        return metricsService.getSlowRequests();
    }
}
```

### 最佳实践 ###

- 使用滑动窗口统计，避免内存无限增长
- 为不同API设置不同的性能阈值
- 将性能数据导出到专业监控系统(如Prometheus)
- 设置告警机制，及时发现性能问题
- 只对重要接口进行详细监控，避免过度监控带来的性能开销

## 场景四：接口限流拦截器 ##

### 使用场景 ###

接口限流拦截器主要用于：

- 防止接口被恶意频繁调用
- 保护系统资源，避免过载
- 实现API访问量控制
- 防止DoS攻击

### 实现代码 ###

```java
@Component
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Value("${app.rate-limit.enabled:true}")
    private boolean enabled;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        
        if (!enabled) {
            return true;
        }
        
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        
        // 获取限流注解
        RateLimit rateLimit = handlerMethod.getMethodAnnotation(RateLimit.class);
        if (rateLimit == null) {
            // 没有配置限流注解，不进行限流
            return true;
        }
        
        // 获取限流类型
        RateLimitType limitType = rateLimit.type();
        
        // 根据限流类型获取限流键
        String limitKey = getLimitKey(request, limitType);
        
        // 获取限流配置
        int limit = rateLimit.limit();
        int period = rateLimit.period();
        
        // 执行限流检查
        boolean allowed = checkRateLimit(limitKey, limit, period);
        
        if (!allowed) {
            // 超过限流，返回429状态码
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{"error":"Too many requests","message":"请求频率超过限制，请稍后再试"}");
            return false;
        }
        
        return true;
    }
    
    private String getLimitKey(HttpServletRequest request, RateLimitType limitType) {
        String key = "rate_limit:";
        
        switch (limitType) {
            case IP:
                key += "ip:" + getClientIp(request);
                break;
            case USER:
                // 从认证信息获取用户ID
                Object currentUser = request.getAttribute("currentUser");
                String userId = currentUser != null ? 
                        String.valueOf(((User) currentUser).getId()) : "anonymous";
                key += "user:" + userId;
                break;
            case API:
                key += "api:" + request.getRequestURI();
                break;
            case IP_API:
                key += "ip_api:" + getClientIp(request) + ":" + request.getRequestURI();
                break;
            case USER_API:
                Object user = request.getAttribute("currentUser");
                String id = user != null ? 
                        String.valueOf(((User) user).getId()) : "anonymous";
                key += "user_api:" + id + ":" + request.getRequestURI();
                break;
            default:
                key += "global";
        }
        
        return key;
    }
    
    private boolean checkRateLimit(String key, int limit, int period) {
        // 使用Redis的原子操作进行限流检查
        Long count = redisTemplate.execute(connection -> {
            // 递增计数器
            Long currentCount = connection.stringCommands().incr(key.getBytes());
            
            // 如果是第一次递增，设置过期时间
            if (currentCount != null && currentCount == 1) {
                connection.keyCommands().expire(key.getBytes(), period);
            }
            
            return currentCount;
        }, true);
        
        return count != null && count <= limit;
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
            if ("127.0.0.1".equals(ipAddress) || "0:0:0:0:0:0:0:1".equals(ipAddress)) {
                // 根据网卡取本机配置的IP
                try {
                    InetAddress inet = InetAddress.getLocalHost();
                    ipAddress = inet.getHostAddress();
                } catch (UnknownHostException e) {
                    log.error("获取本机IP失败", e);
                }
            }
        }
        
        // 对于多个代理的情况，第一个IP为客户端真实IP
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.substring(0, ipAddress.indexOf(","));
        }
        
        return ipAddress;
    }
}
```

### 限流注解 ###

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    
    /**
     * 限流类型
     */
    RateLimitType type() default RateLimitType.IP;
    
    /**
     * 限制次数
     */
    int limit() default 100;
    
    /**
     * 时间周期(秒)
     */
    int period() default 60;
}

public enum RateLimitType {
    /**
     * 按IP地址限流
     */
    IP,
    
    /**
     * 按用户限流
     */
    USER,
    
    /**
     * 按接口限流
     */
    API,
    
    /**
     * 按IP和接口组合限流
     */
    IP_API,
    
    /**
     * 按用户和接口组合限流
     */
    USER_API,
    
    /**
     * 全局限流
     */
    GLOBAL
}
```

### 使用示例 ###

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping
    @RateLimit(type = RateLimitType.IP, limit = 100, period = 60)
    public List<Product> getProducts() {
        return productService.findAll();
    }
    
    @GetMapping("/{id}")
    @RateLimit(type = RateLimitType.IP, limit = 200, period = 60)
    public Product getProduct(@PathVariable Long id) {
        return productService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }
    
    @PostMapping
    @RequireRole("ADMIN")
    @RateLimit(type = RateLimitType.USER, limit = 10, period = 60)
    public Product createProduct(@RequestBody @Valid ProductRequest productRequest) {
        return productService.save(productRequest);
    }
}
```

### 最佳实践 ###

- 根据接口重要性和资源消耗设置不同的限流规则
- 使用分布式限流解决方案，如Redis+Lua脚本
- 为特定用户群体设置不同的限流策略
- 在限流响应中提供合理的重试建议
- 监控限流情况，及时调整限流阈值

## 场景五：请求参数验证拦截器 ##

### 使用场景 ###

请求参数验证拦截器主要用于：

- 统一处理参数验证逻辑
- 提供友好的错误信息
- 防止非法参数导致的安全问题
- 减少控制器中的重复代码

### 实现代码 ###

```java
@Component
@Slf4j
public class RequestValidationInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        
        // 检查方法参数是否需要验证
        Parameter[] parameters = handlerMethod.getMethod().getParameters();
        
        for (Parameter parameter : parameters) {
            // 检查是否有@RequestBody注解
            if (parameter.isAnnotationPresent(RequestBody.class) && 
                parameter.isAnnotationPresent(Valid.class)) {
                
                // 该参数需要验证，在控制器方法中会自动验证
                // 这里只需确保我们能处理验证失败的情况
                // 通过全局异常处理器处理MethodArgumentNotValidException
                
                // 记录验证将要发生
                log.debug("将对 {}.{} 的请求体参数 {} 进行验证", 
                        handlerMethod.getBeanType().getSimpleName(),
                        handlerMethod.getMethod().getName(),
                        parameter.getName());
            }
            
            // 检查是否有@RequestParam注解
            RequestParam requestParam = parameter.getAnnotation(RequestParam.class);
            if (requestParam != null) {
                String paramName = requestParam.value().isEmpty() ? 
                        parameter.getName() : requestParam.value();
                        
                String paramValue = request.getParameter(paramName);
                
                // 检查必填参数
                if (requestParam.required() && (paramValue == null || paramValue.isEmpty())) {
                    response.setStatus(HttpStatus.BAD_REQUEST.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write(
                            "{"error":"参数错误","message":"缺少必填参数: " + paramName + ""}");
                    return false;
                }
                
                // 检查参数格式（如果有注解）
                if (parameter.isAnnotationPresent(Pattern.class) && paramValue != null) {
                    Pattern pattern = parameter.getAnnotation(Pattern.class);
                    if (!paramValue.matches(pattern.regexp())) {
                        response.setStatus(HttpStatus.BAD_REQUEST.value());
                        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                        response.getWriter().write(
                                "{"error":"参数错误","message":"参数 " + 
                                paramName + " 格式不正确: " + pattern.message() + ""}");
                        return false;
                    }
                }
            }
            
            // 检查是否有@PathVariable注解
            PathVariable pathVariable = parameter.getAnnotation(PathVariable.class);
            if (pathVariable != null) {
                // 对于PathVariable的验证主要依赖RequestMappingHandlerMapping的正则匹配
                // 这里可以添加额外的验证逻辑，如数值范围检查等
            }
        }
        
        return true;
    }
}
```

### 全局异常处理 ###

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    /**
     * 处理请求体参数验证失败的异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        Map<String, Object> body = new HashMap<>();
        body.put("error", "参数验证失败");
        body.put("details", errors);
        
        return ResponseEntity.badRequest().body(body);
    }
    
    /**
     * 处理请求参数绑定失败的异常
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParams(
            MissingServletRequestParameterException ex) {
        
        Map<String, Object> body = new HashMap<>();
        body.put("error", "参数错误");
        body.put("message", "缺少必填参数: " + ex.getParameterName());
        
        return ResponseEntity.badRequest().body(body);
    }
    
    /**
     * 处理路径参数类型不匹配的异常
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {
        
        Map<String, Object> body = new HashMap<>();
        body.put("error", "参数类型错误");
        body.put("message", "参数 " + ex.getName() + " 应为 " + 
                ex.getRequiredType().getSimpleName() + " 类型");
        
        return ResponseEntity.badRequest().body(body);
    }
}
```

### 使用示例 ###

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public List<User> getUsers(
            @RequestParam(required = false) 
            @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "只能包含字母和数字") 
            String keyword,
            
            @RequestParam(defaultValue = "0") 
            @Min(value = 0, message = "页码不能小于0") 
            Integer page,
            
            @RequestParam(defaultValue = "10") 
            @Min(value = 1, message = "每页条数不能小于1") 
            @Max(value = 100, message = "每页条数不能大于100")
            Integer size) {
        
        return userService.findUsers(keyword, page, size);
    }
    
    @PostMapping
    public User createUser(@RequestBody @Valid UserCreateRequest request) {
        return userService.createUser(request);
    }
    
    @GetMapping("/{id}")
    public User getUser(@PathVariable @Positive(message = "用户ID必须为正整数") Long id) {
        return userService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
```

### 自定义验证请求类 ###

```java
@Data
public class UserCreateRequest {
    
    @NotBlank(message = "用户名不能为空")
    @Size(min = 4, max = 20, message = "用户名长度必须在4-20之间")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "用户名只能包含字母、数字和下划线")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度必须在6-20之间")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", 
             message = "密码必须包含大小写字母和数字")
    private String password;
    
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\d{9}$", message = "手机号格式不正确")
    private String phone;
    
    @NotNull(message = "年龄不能为空")
    @Min(value = 18, message = "年龄必须大于或等于18岁")
    @Max(value = 120, message = "年龄必须小于或等于120岁")
    private Integer age;
    
    @NotEmpty(message = "角色不能为空")
    private List<String> roles;
    
    @Valid
    private Address address;
}

@Data
public class Address {
    
    @NotBlank(message = "省份不能为空")
    private String province;
    
    @NotBlank(message = "城市不能为空")
    private String city;
    
    @NotBlank(message = "详细地址不能为空")
    private String detail;
    
    @Pattern(regexp = "^\d{6}$", message = "邮编必须为6位数字")
    private String zipCode;
}
```

### 最佳实践 ###

- 结合Spring Validation框架进行深度验证
- 为常用验证规则创建自定义注解
- 提供清晰、具体的错误信息
- 记录验证失败的情况，发现潜在的问题
- 对敏感API进行更严格的参数验证

## 场景六：国际化处理拦截器 ##

### 使用场景 ###

国际化处理拦截器主要用于：

- 根据请求头或用户设置确定语言
- 切换应用的本地化资源
- 提供多语言支持
- 增强用户体验

### 实现代码 ###

```java
@Component
public class LocaleChangeInterceptor implements HandlerInterceptor {
    
    @Autowired
    private MessageSource messageSource;
    
    private final List<Locale> supportedLocales = Arrays.asList(
            Locale.ENGLISH,           // en
            Locale.SIMPLIFIED_CHINESE, // zh_CN
            Locale.TRADITIONAL_CHINESE, // zh_TW
            Locale.JAPANESE,          // ja
            Locale.KOREAN             // ko
    );
    
    // 默认语言
    private final Locale defaultLocale = Locale.ENGLISH;
    
    // 语言参数名
    private String paramName = "lang";
    
    // 用于检测语言的HTTP头
    private List<String> localeHeaders = Arrays.asList(
            "Accept-Language",
            "X-Locale"
    );
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        
        // 尝试从请求参数中获取语言设置
        String localeParam = request.getParameter(paramName);
        Locale locale = null;
        
        if (localeParam != null && !localeParam.isEmpty()) {
            locale = parseLocale(localeParam);
        }
        
        // 如果请求参数中没有有效的语言设置，尝试从HTTP头中获取
        if (locale == null) {
            for (String header : localeHeaders) {
                String localeHeader = request.getHeader(header);
                if (localeHeader != null && !localeHeader.isEmpty()) {
                    locale = parseLocaleFromHeader(localeHeader);
                    if (locale != null) {
                        break;
                    }
                }
            }
        }
        
        // 如果无法确定语言，使用默认语言
        if (locale == null) {
            locale = defaultLocale;
        }
        
        // 将解析出的语言设置到LocaleContextHolder中
        LocaleContextHolder.setLocale(locale);
        
        // 将语言信息放入请求属性中，便于在视图中使用
        request.setAttribute("currentLocale", locale);
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                                Object handler, Exception ex) throws Exception {
        // 请求结束后清除语言设置
        LocaleContextHolder.resetLocaleContext();
    }
    
    /**
     * 解析语言参数
     */
    private Locale parseLocale(String localeParam) {
        Locale requestedLocale = Locale.forLanguageTag(localeParam.replace('_', '-'));
        
        // 检查请求的语言是否在支持的语言列表中
        for (Locale supportedLocale : supportedLocales) {
            if (supportedLocale.getLanguage().equals(requestedLocale.getLanguage())) {
                // 如果语言匹配，但国家可能不同，使用完整的支持语言
                return supportedLocale;
            }
        }
        
        return null;
    }
    
    /**
     * 从Accept-Language头解析语言
     */
    private Locale parseLocaleFromHeader(String headerValue) {
        // 解析Accept-Language头，格式如: "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7"
        String[] parts = headerValue.split(",");
        
        for (String part : parts) {
            String[] subParts = part.split(";");
            String localeValue = subParts[0].trim();
            
            Locale locale = Locale.forLanguageTag(localeValue.replace('_', '-'));
            
            // 检查是否是支持的语言
            for (Locale supportedLocale : supportedLocales) {
                if (supportedLocale.getLanguage().equals(locale.getLanguage())) {
                    return supportedLocale;
                }
            }
        }
        
        return null;
    }
}
```

### 国际化配置 ###

```java
@Configuration
public class LocaleConfig {
    
    @Bean
    public LocaleResolver localeResolver() {
        SessionLocaleResolver resolver = new SessionLocaleResolver();
        resolver.setDefaultLocale(Locale.ENGLISH);
        return resolver;
    }
    
    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = 
                new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:i18n/messages");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setCacheSeconds(3600); // 刷新缓存的周期（秒）
        return messageSource;
    }
}
```

### 国际化工具类 ###

```java
@Component
public class I18nUtil {
    
    @Autowired
    private MessageSource messageSource;
    
    /**
     * 获取国际化消息
     *
     * @param code 消息代码
     * @return 本地化后的消息
     */
    public String getMessage(String code) {
        return getMessage(code, null);
    }
    
    /**
     * 获取国际化消息
     *
     * @param code 消息代码
     * @param args 消息参数
     * @return 本地化后的消息
     */
    public String getMessage(String code, Object[] args) {
        Locale locale = LocaleContextHolder.getLocale();
        try {
            return messageSource.getMessage(code, args, locale);
        } catch (NoSuchMessageException e) {
            return code;
        }
    }
}
```

### 资源文件示例 ###

```ini
# src/main/resources/i18n/messages_en.properties
greeting=Hello, {0}!
login.success=Login successful
login.failure=Login failed: {0}
validation.username.notEmpty=Username cannot be empty
validation.password.weak=Password is too weak, must be at least 8 characters

# src/main/resources/i18n/messages_zh_CN.properties
greeting=你好，{0}！
login.success=登录成功
login.failure=登录失败：{0}
validation.username.notEmpty=用户名不能为空
validation.password.weak=密码强度不够，至少需要8个字符
```

### 在控制器中使用 ###

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private I18nUtil i18nUtil;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.getUsername(), request.getPassword());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("message", i18nUtil.getMessage("login.success"));
            
            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("error", i18nUtil.getMessage("login.failure", new Object[]{e.getMessage()}));
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    @GetMapping("/greeting")
    public Map<String, String> greeting(@RequestParam String name) {
        Map<String, String> response = new HashMap<>();
        response.put("message", i18nUtil.getMessage("greeting", new Object[]{name}));
        return response;
    }
}
```

### 在前端获取当前语言 ###

```java
@RestController
@RequestMapping("/api/locale")
public class LocaleController {
    
    @GetMapping("/current")
    public Map<String, Object> getCurrentLocale(HttpServletRequest request) {
        Locale currentLocale = (Locale) request.getAttribute("currentLocale");
        
        if (currentLocale == null) {
            currentLocale = LocaleContextHolder.getLocale();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("locale", currentLocale.toString());
        response.put("language", currentLocale.getLanguage());
        response.put("country", currentLocale.getCountry());
        
        return response;
    }
    
    @GetMapping("/supported")
    public List<Map<String, String>> getSupportedLocales() {
        List<Map<String, String>> locales = new ArrayList<>();
        
        locales.add(createLocaleMap(Locale.ENGLISH, "English"));
        locales.add(createLocaleMap(Locale.SIMPLIFIED_CHINESE, "简体中文"));
        locales.add(createLocaleMap(Locale.TRADITIONAL_CHINESE, "繁體中文"));
        locales.add(createLocaleMap(Locale.JAPANESE, "日本語"));
        locales.add(createLocaleMap(Locale.KOREAN, "한국어"));
        
        return locales;
    }
    
    private Map<String, String> createLocaleMap(Locale locale, String displayName) {
        Map<String, String> map = new HashMap<>();
        map.put("code", locale.toString());
        map.put("language", locale.getLanguage());
        map.put("displayName", displayName);
        return map;
    }
}
```

### 最佳实践 ###

- 使用标准的国际化资源文件组织方式
- 缓存消息资源，避免频繁加载资源文件
- 为所有用户可见的字符串提供国际化支持
- 允许用户在界面中切换语言
- 在会话中保存用户语言偏好
- 使用参数化消息，避免字符串拼接

## 拦截器的最佳实践 ##

### 拦截器注册顺序 ###

拦截器的执行顺序非常重要，通常应该遵循：

- 认证/授权拦截器优先执行
- 日志拦截器尽量靠前，记录完整信息
- 性能监控拦截器包裹整个请求处理过程

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Autowired
    private AuthenticationInterceptor authInterceptor;
    
    @Autowired
    private LoggingInterceptor loggingInterceptor;
    
    @Autowired
    private PerformanceMonitorInterceptor performanceInterceptor;
    
    @Autowired
    private RateLimitInterceptor rateLimitInterceptor;
    
    @Autowired
    private RequestValidationInterceptor validationInterceptor;
    
    @Autowired
    private LocaleChangeInterceptor localeInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 1. 国际化拦截器
        registry.addInterceptor(localeInterceptor)
                .addPathPatterns("/**");
        
        // 2. 日志拦截器
        registry.addInterceptor(loggingInterceptor)
                .addPathPatterns("/**");
        
        // 3. 性能监控拦截器
        registry.addInterceptor(performanceInterceptor)
                .addPathPatterns("/api/**");
        
        // 4. 限流拦截器
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/**");
        
        // 5. 参数验证拦截器
        registry.addInterceptor(validationInterceptor)
                .addPathPatterns("/api/**");
        
        // 6. 认证拦截器
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login", "/api/auth/register");
    }
}
```

### 避免拦截器中的重量级操作 ###

- 将复杂逻辑抽取到专门的服务类中
- 使用异步方式处理日志记录等非关键路径操作
- 缓存频繁使用的数据
- 避免在拦截器中进行数据库操作

### 异常处理 ###

- 拦截器中的异常可能导致整个请求处理链中断
- 总是使用try-catch捕获并正确处理异常
- 关键拦截器（如认证）中的异常应返回适当的HTTP状态码和错误信息

### 路径模式配置 ###

- 精确指定需要拦截的路径，避免不必要的性能开销
- 合理使用excludePathPatterns排除不需要拦截的路径
- 对静态资源路径通常应该排除

### 拦截器的组合使用 ###

- 设计独立、职责单一的拦截器
- 通过组合使用实现复杂功能
- 避免在一个拦截器中实现多种不相关的功能

## 总结 ##

通过合理使用这些拦截器，可以极大地提高代码复用性，减少重复代码，使应用架构更加清晰和模块化。

在实际应用中，可以根据具体需求选择或组合使用这些拦截器，甚至扩展出更多类型的拦截器来满足特定业务场景。
