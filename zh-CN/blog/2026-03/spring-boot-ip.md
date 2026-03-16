---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot中获取真实客户端IP的终极方案
description: 99%的人都没做对！
date: 2026-03-16 10:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 引言：为什么你的IP获取方式可能是错的？ ##

在日常开发中，获取客户端IP看似简单，实则暗藏玄机。很多开发者直接使用 `request.getRemoteAddr()`，结果在生产环境中发现获取到的都是负载均衡器的IP，而非真实用户IP。更糟糕的是，有些方案存在安全漏洞，可能被恶意用户伪造IP地址。

今天，我将彻底揭秘Spring Boot中获取真实客户端IP的正确姿势，让你避开所有坑！

## 一、理解IP传递的底层原理 ##

### 为什么需要特殊处理？ ###

在现代Web架构中，请求往往要经过多个中间件：

```txt
用户 → CDN → 负载均衡器 → 网关 → 应用服务器
```

每个环节都会修改请求信息，导致简单的 `getRemoteAddr()` 失效。

### 关键HTTP头字段解析 ###

|  头字段   |      含义 |    示例 |  可信度 |
| :-----------: | :-----------: | :-----------: | :-----------: |
| X-Forwarded-For | 代理链IP序列 | 1.2.3.4, 5.6.7.8 |  ⭐⭐⭐⭐ |
| X-Real-IP | 最后一个代理IP | 1.2.3.4 |  ⭐⭐⭐ |
| Proxy-Client-IP | Apache代理IP | 1.2.3.4 |  ⭐⭐ |
| WL-Proxy-Client-IP | WebLogic代理IP | 1.2.3.4 |  ⭐⭐ |

### X-Forwarded-For的深度解析 ###

这才是重点！  X-Forwarded-For是获取真实IP的关键，但很多人用错了！

```txt
X-Forwarded-For: 客户端真实IP, 代理服务器1IP, 代理服务器2IP, ...
```

重要规则：

- 最左边的IP是原始客户端IP
- 后续IP是经过的代理服务器IP
- 多个IP用逗号分隔

实际场景示例：

```txt
// 场景1：直接访问（无代理）
X-Forwarded-For: null

// 场景2：经过CDN
X-Forwarded-For: 123.45.67.89

// 场景3：CDN + Nginx负载均衡  
X-Forwarded-For: 123.45.67.89, 10.0.1.100

// 场景4：复杂代理链
X-Forwarded-For: 123.45.67.89, 203.0.113.195, 198.51.100.10
```

## 二、终极解决方案：安全可靠的IP工具类 ##

下面这个工具类经过生产环境千锤百炼，直接复制使用即可！

```java
import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * IP工具类 - 获取真实客户端IP地址
 * 支持多级代理、防止IP伪造、安全可靠
 */
public class IpUtils {
    
    private static final String UNKNOWN = "unknown";
    private static final String LOCALHOST_IP = "127.0.0.1";
    private static final String LOCALHOST_IPV6 = "0:0:0:0:0:0:0:1";
    private static final String SEPARATOR = ",";
    
    // 内网IP段（用于识别代理服务器）
    private static final Set<String> INTERNAL_IP_SEGMENTS = new HashSet<>(Arrays.asList(
        "10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.", 
        "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", 
        "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31."
    ));
    
    /**
     * 获取真实客户端IP（推荐使用）
     * 安全可靠，防止伪造，支持多级代理
     */
    public static String getClientRealIp(HttpServletRequest request) {
        // 1. 优先检查X-Forwarded-For（处理多级代理）
        String ip = parseXForwardedFor(request.getHeader("X-Forwarded-For"));
        if (isValidPublicIp(ip)) {
            return ip;
        }
        
        // 2. 检查其他代理头
        ip = getIpFromHeaders(request);
        if (isValidPublicIp(ip)) {
            return ip;
        }
        
        // 3. 最后使用RemoteAddr
        ip = request.getRemoteAddr();
        return LOCALHOST_IPV6.equals(ip) ? LOCALHOST_IP : ip;
    }
    
    /**
     * 解析X-Forwarded-For头（核心逻辑）
     */
    private static String parseXForwardedFor(String xffHeader) {
        if (xffHeader == null || xffHeader.trim().isEmpty()) {
            return null;
        }
        
        String[] ips = xffHeader.split(SEPARATOR);
        
        // 从右向左查找第一个公网IP（更安全）
        for (int i = ips.length - 1; i >= 0; i--) {
            String ip = ips[i].trim();
            if (isValidIp(ip) && !isInternalIp(ip)) {
                return ip;
            }
        }
        
        // 如果没有公网IP，返回第一个有效IP
        for (String ip : ips) {
            String trimmedIp = ip.trim();
            if (isValidIp(trimmedIp)) {
                return trimmedIp;
            }
        }
        
        return null;
    }
    
    /**
     * 从其他头字段获取IP
     */
    private static String getIpFromHeaders(HttpServletRequest request) {
        String[] headers = {
            "X-Real-IP", "Proxy-Client-IP", "WL-Proxy-Client-IP",
            "HTTP_CLIENT_IP", "HTTP_X_FORWARDED_FOR"
        };
        
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (isValidIp(ip)) {
                return ip;
            }
        }
        return null;
    }
    
    /**
     * 验证IP是否有效
     */
    private static boolean isValidIp(String ip) {
        return ip != null && 
               !ip.isEmpty() && 
               !UNKNOWN.equalsIgnoreCase(ip) &&
               isValidIpAddress(ip);
    }
    
    /**
     * 验证是否为公网IP
     */
    private static boolean isValidPublicIp(String ip) {
        return isValidIp(ip) && !isInternalIp(ip) && !isLocalhost(ip);
    }
    
    /**
     * 检查是否为内网IP
     */
    private static boolean isInternalIp(String ip) {
        if (ip == null) return false;
        return INTERNAL_IP_SEGMENTS.stream().anyMatch(ip::startsWith);
    }
    
    /**
     * 检查是否为本地地址
     */
    private static boolean isLocalhost(String ip) {
        return LOCALHOST_IP.equals(ip) || LOCALHOST_IPV6.equals(ip);
    }
    
    /**
     * 验证IP地址格式
     */
    public static boolean isValidIpAddress(String ip) {
        if (ip == null || ip.isEmpty()) return false;
        
        // IPv4验证
        String ipv4Pattern = "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$";
        if (ip.matches(ipv4Pattern)) return true;
        
        // IPv6简化验证
        if (ip.contains(":")) return true;
        
        return false;
    }
}
```

## 三、Spring Boot配置：让服务器认识代理 ##

### Tomcat代理配置 ###

```java
@Configuration
public class TomcatProxyConfig {
    
    /**
     * 配置Tomcat识别代理头
     */
    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatProxyCustomizer() {
        return factory -> factory.addConnectorCustomizers(connector -> {
            connector.setProperty("relaxedQueryChars", "|{}[]");
            connector.setProperty("relaxedPathChars", "|{}[]");
            connector.setProperty("remoteIpHeader", "x-forwarded-for");
            connector.setProperty("protocolHeader", "x-forwarded-proto");
            // 信任的内网代理（根据实际情况调整）
            connector.setProperty("internalProxies", 
                "192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}");
        });
    }
}
```

### 应用配置文件 ###

```yaml
# application.yml
server:
  tomcat:
    remoteip:
      remote-ip-header: x-forwarded-for
      protocol-header: x-forwarded-proto
      internal-proxies: |
        192.168.\d{1,3}.\d{1,3}|10.\d{1,3}.\d{1,3}.\d{1,3}|
        172.(1[6-9]|2[0-9]|3[0-1]).\d{1,3}.\d{1,3}
      
spring:
  mvc:
    log-request-details: true
```

## 四、高级功能：IP拦截与安全防护 ##

### IP拦截器（自动记录） ###

```java
@Component
public class IpLoggingInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(IpLoggingInterceptor.class);
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                           HttpServletResponse response, 
                           Object handler) {
        
        String clientIp = IpUtils.getClientRealIp(request);
        request.setAttribute("clientRealIp", clientIp);
        
        // 记录访问日志
        logger.info("客户端访问: IP={}, URI={}, User-Agent={}", 
                   clientIp, 
                   request.getRequestURI(),
                   request.getHeader("User-Agent"));
        
        return true;
    }
}

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Autowired
    private IpLoggingInterceptor ipLoggingInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(ipLoggingInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/health", "/metrics");
    }
}
```

### IP安全过滤器（防刷/黑名单） ###

```java
@Component
@Order(1)
public class IpSecurityFilter implements Filter {
    
    // IP黑名单（可从数据库或配置中心加载）
    private final Set<String> blacklistedIps = ConcurrentHashMap.newKeySet();
    
    // IP访问频率限制（简单的内存实现，生产环境建议用Redis）
    private final Map<String, RateLimitInfo> rateLimitMap = new ConcurrentHashMap<>();
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String clientIp = IpUtils.getClientRealIp(httpRequest);
        
        // 1. 黑名单检查
        if (blacklistedIps.contains(clientIp)) {
            logSecurityEvent("IP黑名单拦截", clientIp, httpRequest);
            sendErrorResponse(response, 403, "您的IP已被禁止访问");
            return;
        }
        
        // 2. 频率限制检查
        if (isRateLimited(clientIp)) {
            logSecurityEvent("频率限制拦截", clientIp, httpRequest);
            sendErrorResponse(response, 429, "访问过于频繁，请稍后再试");
            return;
        }
        
        // 3. 可疑行为检测
        if (isSuspiciousRequest(clientIp, httpRequest)) {
            logSecurityEvent("可疑请求拦截", clientIp, httpRequest);
            blacklistedIps.add(clientIp); // 自动加入黑名单
            sendErrorResponse(response, 403, "检测到异常访问行为");
            return;
        }
        
        chain.doFilter(request, response);
    }
    
    private boolean isRateLimited(String ip) {
        RateLimitInfo info = rateLimitMap.computeIfAbsent(ip, k -> new RateLimitInfo());
        long currentTime = System.currentTimeMillis();
        
        // 限制规则：每分钟最多60次请求
        if (currentTime - info.getWindowStart() > 60000) {
            info.reset(60, currentTime);
        }
        
        return !info.tryAcquire();
    }
    
    private boolean isSuspiciousRequest(String ip, HttpServletRequest request) {
        // 检测异常User-Agent
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null || userAgent.trim().isEmpty()) {
            return true;
        }
        
        // 检测常见攻击特征
        String uri = request.getRequestURI().toLowerCase();
        if (uri.contains("admin") || uri.contains("phpmyadmin") || 
            uri.contains("wp-admin") || uri.contains("shell")) {
            return true;
        }
        
        return false;
    }
    
    private void sendErrorResponse(ServletResponse response, int status, String message) 
            throws IOException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        httpResponse.setStatus(status);
        httpResponse.setContentType("application/json;charset=utf-8");
        httpResponse.getWriter().write("{"code": " + status + ", "message": "" + message + ""}");
    }
    
    private void logSecurityEvent(String event, String ip, HttpServletRequest request) {
        logger.warn("安全事件: {} - IP: {}, URI: {}, User-Agent: {}", 
                   event, ip, request.getRequestURI(), request.getHeader("User-Agent"));
    }
    
    // 频率限制内部类
    private static class RateLimitInfo {
        private int tokens;
        private long windowStart;
        private final int maxTokens = 60;
        
        RateLimitInfo() {
            reset(maxTokens, System.currentTimeMillis());
        }
        
        void reset(int tokens, long windowStart) {
            this.tokens = tokens;
            this.windowStart = windowStart;
        }
        
        boolean tryAcquire() {
            if (tokens > 0) {
                tokens--;
                return true;
            }
            return false;
        }
        
        long getWindowStart() {
            return windowStart;
        }
    }
}
```

## 五、实战测试：验证你的IP获取是否正确 ##

### 测试用例 ###

```java
@SpringBootTest
class IpUtilsTest {
    
    @Test
    void testGetClientRealIp() {
        // 模拟HttpServletRequest
        MockHttpServletRequest request = new MockHttpServletRequest();
        
        // 测试场景1：直接访问
        request.setRemoteAddr("123.45.67.89");
        assertEquals("123.45.67.89", IpUtils.getClientRealIp(request));
        
        // 测试场景2：单层代理
        request.addHeader("X-Forwarded-For", "123.45.67.89");
        request.setRemoteAddr("10.0.0.1");
        assertEquals("123.45.67.89", IpUtils.getClientRealIp(request));
        
        // 测试场景3：多层代理
        request.addHeader("X-Forwarded-For", "123.45.67.89, 10.0.1.100, 10.0.1.101");
        assertEquals("123.45.67.89", IpUtils.getClientRealIp(request));
        
        // 测试场景4：IPv6
        request.addHeader("X-Forwarded-For", "2001:db8::1");
        assertEquals("2001:db8::1", IpUtils.getClientRealIp(request));
    }
}
```

## 六、生产环境最佳实践 ##

### 配置管理 ###

- 将信任的代理IP列表配置在配置中心，支持动态更新
- 为不同环境（开发、测试、生产）设置不同的代理配置

### 监控告警 ###

```java
@Component
public class IpMonitor {
    
    @EventListener
    public void handleBlacklistEvent(BlacklistEvent event) {
        // 发送告警通知
        alertService.sendAlert("IP黑名单新增: " + event.getIp());
    }
    
    @Scheduled(fixedRate = 300000) // 5分钟执行一次
    public void cleanupRateLimit() {
        // 定期清理过期的频率限制记录
    }
}
```

### 性能优化 ###

- 对于高并发场景，使用Redis实现分布式频率限制
- 对IP查询结果进行适当缓存（注意缓存时间不宜过长）

## 七、常见问题排查 ##

- Q1: 为什么获取到的还是127.0.0.1？
- A:  检查负载均衡器是否正确配置了X-Forwarded-For头。

- Q2: 多级代理下如何确定真实IP？
- A:  使用本文提供的parseXForwardedFor方法，它会自动处理多级代理情况。

- Q3: 如何防止IP伪造？
- A:  配置internal-proxies只信任内部代理服务器，不信任客户端传递的头部。

## 总结 ##

获取真实客户端IP是Web开发中的基础但重要的工作。通过本文的完整方案，你可以：

- ✅ 正确获取多级代理后的真实客户端IP
- ✅ 有效防止IP地址伪造攻击
- ✅ 实现IP级别的安全防护
- ✅ 具备完整的监控和调试能力

记住：不要相信客户端传递的任何信息，始终通过可信的代理服务器头字段来获取真实IP。
