---
lastUpdated: true
commentabled: true
recommended: true
title: 防盗链技术详解与SpringBoot实现方案
description: 防盗链技术详解与SpringBoot实现方案
date: 2026-03-10 08:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

防盗链技术是保护网站资源不被非法盗用的重要手段，尤其在当今互联网环境中，图片、视频等多媒体资源容易被其他站点直接引用，导致带宽消耗、版权侵犯等问题。本文将全面解析防盗链技术原理，并详细介绍如何在SpringBoot项目中实现防盗链过滤器。

## 一、防盗链技术概述 ##

### 什么是防盗链 ###

防盗链是一种防止未授权网站通过链接直接访问本网站资源（如图片、视频、文件等）的技术手段。盗链行为是指其他网站在其页面中嵌入指向我们网站资源的链接，让用户在其网站上看似正常访问这些资源，实则消耗的是我们网站的带宽和服务器资源。

### 盗链的危害 ###

盗链行为会带来多方面的问题：

- ​流量损失​：盗链消耗服务器带宽，增加流量费用
- ​成本增加​：CDN和服务器费用可能因非法使用而飙升
- ​版权侵犯​：原创内容被非法使用和传播
- ​SEO影响​：搜索引擎排名可能因资源被滥用而下降

### 防盗链的基本原理 ###

防盗链技术主要通过验证请求来源的合法性来保护资源，常见方法包括：

- ​Referer验证​：检查HTTP请求头中的Referer字段，判断请求是否来自合法来源
- ​Token验证​：为每个请求生成唯一令牌，验证其有效性
- ​时间戳验证​：将时间戳作为参数，只允许有效期内的请求
- ​IP地址验证​：限制只允许特定IP地址访问资源
- ​用户认证​：要求用户登录后才能访问资源

## 二、防盗链技术实现方案 ##

### Referer验证方案 ###

#### 原理 ####

Referer是HTTP协议请求头中的一个字段，记录了请求来源的页面地址。服务器通过检查这个字段来判断请求是否来自信任的域名。

#### 优缺点 ####

- ​优点​：实现简单，无需客户端配合
- ​缺点​：Referer字段可能被伪造，且浏览器直接输入地址时Referer为空

#### 实现方式 ####

服务器端配置或编写脚本检查Referer头信息，非授权来源返回403错误或替代内容。

### Token验证方案 ###

#### 原理 ####

服务器生成一个签名(通常加密字符串)作为请求参数传递给客户端，客户端请求资源时必须提供该签名，服务器验证其正确性。

#### 优缺点 ####

- ​优点​：安全性高，可设置过期时间
- ​缺点​：实现较复杂，需要服务器和客户端配合

#### 实现方式 ####

- 前端计算签名：用密钥对资源路径+时间戳做HMAC/MD5计算
- 拼接URL：`/资源路径?ts=时间戳&sign=签名`
- 后端验证签名和时间有效性

### 动态资源方案 ###

#### 原理 ####

服务器动态生成资源内容，防止资源被直接链接。

#### 优缺点 ####

- ​优点​：有效防止直接链接
- ​缺点​：增加服务器负担和页面加载时间

## 三、SpringBoot实现防盗链过滤器 ##

在SpringBoot项目中，可以通过过滤器(Filter)或拦截器(Interceptor)实现防盗链功能。下面介绍两种常见实现方式。

### 基于Referer的防盗链过滤器 ###

实现步骤

​创建过滤器类​：实现jakarta.servlet.Filter接口

```java
import jakarta.servlet.*;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class AntiLeechFilter implements Filter {
    private List<String> allowedDomains;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 从配置文件中获取允许的域名列表
        String allowedDomainsStr = filterConfig.getInitParameter("allowedDomains");
        allowedDomains = Arrays.asList(allowedDomainsStr.split(","));
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String referer = request.getHeader("Referer");

        if (referer == null) {
            // 没有Referer，可能是直接在浏览器地址栏输入，视为非法请求
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
            return;
        }

        boolean isValidReferer = false;
        for (String domain : allowedDomains) {
            if (referer.startsWith(domain)) {
                isValidReferer = true;
                break;
            }
        }

        if (!isValidReferer) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // 清理资源
    }
}
```

​配置过滤器​：注册Filter并设置参数

```java
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {
    @Bean
    public FilterRegistrationBean<AntiLeechFilter> antiLeechFilterRegistrationBean() {
        FilterRegistrationBean<AntiLeechFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new AntiLeechFilter());
        registrationBean.addUrlPatterns("/resources/*"); // 对需要保护的资源路径进行过滤
        registrationBean.addInitParameter("allowedDomains", "http://yourdomain.com,https://yourdomain.com");
        return registrationBean;
    }
}
```

优化建议

- 可以结合异常页面处理，当检测到盗链时返回特定图片或提示页面
- 支持动态更新允许的域名列表，无需重启服务

### 基于Token的防盗链实现 ###

#### Token生成工具类 ####

```java
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

public class TokenGeneratorUtils {
    private static final String SECRET_KEY = "your-secret-key";
    
    /**
     * 生成用于防盗链的令牌(Token)
     */
    public static String generateToken(String resourcePath, long expirationTime) {
        String data = resourcePath + expirationTime + SECRET_KEY;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
    
    public static boolean verifyToken(String resourcePath, String token, long expirationTime) {
        if (new Date().getTime() > expirationTime) {
            return false; // 令牌过期
        }
        String generatedToken = generateToken(resourcePath, expirationTime);
        return generatedToken.equals(token);
    }
}
```

#### 拦截器实现 ####

```java
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.DigestUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.concurrent.TimeUnit;

@Component
public class ImageAuthInterceptor implements HandlerInterceptor {
    private static final long EXPIRE_MILLIS = TimeUnit.MINUTES.toMillis(5); // 5分钟有效期
    private static final String IMAGE_PATH_PREFIX = "/images/";

    @Value("${app.image.auth.secret}")
    private String secretKey;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {

        // 1. 参数验证
        String tsParam = request.getParameter("ts");
        String signParam = request.getParameter("sign");
        String uri = request.getRequestURI();

        if (tsParam == null || tsParam.isBlank() || signParam == null || signParam.isBlank()) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "缺少必要的签名参数");
            return false;
        }

        // 2. 时间戳验证
        long timestamp;
        try {
            timestamp = Long.parseLong(tsParam);
        } catch (NumberFormatException e) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "无效的时间戳格式");
            return false;
        }

        long now = System.currentTimeMillis();
        if (Math.abs(now - timestamp) > EXPIRE_MILLIS) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "请求已过期");
            return false;
        }

        // 3. URI路径验证
        if (!uri.startsWith(IMAGE_PATH_PREFIX)) {
            sendError(response, HttpServletResponse.SC_NOT_FOUND, "资源路径无效");
            return false;
        }

        // 4. 提取相对路径
        String relativePath = uri.substring(IMAGE_PATH_PREFIX.length());
        if (relativePath.isBlank()) {
            sendError(response, HttpServletResponse.SC_BAD_REQUEST, "无效的资源路径");
            return false;
        }

        // 5. 生成服务器端签名
        String serverSign = generateSignature(relativePath, tsParam);

        // 6. 签名比对（使用恒定时间比较防止时序攻击）
        if (!isEqualSignatures(serverSign, signParam)) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "签名验证失败");
            return false;
        }

        return true;
    }

    /**
     * 生成签名
     * 推荐使用 SHA-256 替代 MD5
     */
    private String generateSignature(String path, String timestamp) {
        String raw = String.format("%s|%s|%s", path, timestamp, secretKey);

        // 使用 SHA-256（推荐）
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception e) {
            // 如果 SHA-256 失败，回退到 Spring 的 MD5（向后兼容）
            return DigestUtils.md5DigestAsHex(raw.getBytes(StandardCharsets.UTF_8));
        }
    }

    /**
     * 恒定时间签名比较，防止时序攻击
     */
    private boolean isEqualSignatures(String signature1, String signature2) {
        if (signature1.length() != signature2.length()) {
            return false;
        }

        int result = 0;
        for (int i = 0; i < signature1.length(); i++) {
            result |= signature1.charAt(i) ^ signature2.charAt(i);
        }
        return result == 0;
    }

    /**
     * 字节数组转十六进制字符串
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    /**
     * 发送错误响应
     */
    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String jsonResponse = String.format(
                "{\"status\":%d,\"message\":\"%s\",\"timestamp\":%d}",
                status, message, System.currentTimeMillis()
        );

        response.getWriter().write(jsonResponse);
    }
}
```

#### 注册拦截器 ####

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired
    private ImageAuthInterceptor imageAuthInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(imageAuthInterceptor)
                .addPathPatterns("/images/**");
    }
}
```

#### 前端生成签名URL示例 ####

```html
<script>
// 约定的密钥（不能泄露到公网）
const SECRET_KEY = 'MySuperSecretKey';

// 生成签名URL
function generateSignedUrl(filename) {
    const ts = Date.now();
    // 签名内容：filename + ts + SECRET_KEY
    const raw = `${filename}${ts}${SECRET_KEY}`;
    const sign = md5(raw);
    return `/images/${filename}?ts=${ts}&sign=${sign}`;
}

// 使用示例
document.getElementById('productImg').src = generateSignedUrl('sample.jpg');
</script>
```

## 四、高级防护策略 ##

除了基本的Referer和Token验证外，还可以采用以下高级策略增强防盗链效果：

### 动态水印技术 ###

为图片资源添加动态水印，即使被盗链也能追踪来源：

```java
public void addWatermark(InputStream imageStream, OutputStream output, String text) throws IOException {
    BufferedImage image = ImageIO.read(imageStream);
    Graphics2D g = image.createGraphics();
    
    // 设置水印透明度
    g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.3f));
    g.setColor(Color.BLACK);
    g.setFont(new Font("Arial", Font.BOLD, 30));
    
    // 计算水印位置
    FontMetrics metrics = g.getFontMetrics();
    int x = (image.getWidth() - metrics.stringWidth(text)) / 2;
    int y = image.getHeight() - 50;
    
    // 添加文字水印
    g.drawString(text, x, y);
    g.dispose();
    ImageIO.write(image, "jpg", output);
}
```

### 智能行为分析 ###

通过分析请求行为识别盗链或爬虫：

```java
@Component
public class ImageRequestAnalyzer {
    private final Map<String, RequestCounter> ipCounters = new ConcurrentHashMap<>();
    
    @Scheduled(fixedRate = 60000) // 每分钟清理
    public void cleanCounters() {
        ipCounters.entrySet().removeIf(entry -> 
            entry.getValue().isExpired());
    }
    
    public boolean isSuspiciousRequest(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String path = request.getRequestURI();
        RequestCounter counter = ipCounters.computeIfAbsent(ip + path, k -> new RequestCounter());
        counter.increment();
        
        // 规则1: 10秒内超过20次请求
        if (counter.getCount(10) > 20) return true;
        
        // 规则2: 1分钟内超过100次请求
        if (counter.getCount(60) > 100) return true;
        
        // 规则3: 异常User-Agent
        String ua = request.getHeader("User-Agent");
        if (ua == null || ua.contains("Python") || ua.contains("curl")) {
            return true;
        }
        
        return false;
    }
    
    static class RequestCounter {
        private final List<Long> timestamps = new ArrayList<>();
        
        public synchronized void increment() {
            timestamps.add(System.currentTimeMillis());
        }
        
        public synchronized int getCount(int seconds) {
            long cutoff = System.currentTimeMillis() - seconds * 1000L;
            timestamps.removeIf(t -> t < cutoff);
            return timestamps.size();
        }
        
        public boolean isExpired() {
            return timestamps.isEmpty() || 
                   System.currentTimeMillis() - timestamps.get(0) > 3600000;
        }
    }
}
```

## 五、方案比较与选择建议 ##

|  方案   |      安全性  |    实现复杂度  |    适用场景  |    可伪造性  |
| :-----------: | :-----------: | :-----------: | :-----------: | :-----------: |
| Referer验证 | 中 | 低 | 简单防护，对内网应用 | 较高 |
| Token验证 | 高 | 中 | 对外公开的重要资源 | 低 |
| 动态水印 | 中 | 高 | 图片版权保护 | 中 |
| 行为分析 | 高 | 高 | 防爬虫和批量盗链 | 低 |

​选择建议​：

- 对于一般防护需求，Referer验证足够且实现简单
- 对于重要资源，建议采用Token验证方案
- 对于图片类资源，可结合动态水印技术
- 对于高价值内容，建议组合多种方案提高安全性

## 六、总结 ##

防盗链技术是保护网站资源的重要手段，SpringBoot提供了灵活的方式实现防盗链功能。基于Referer的过滤器实现简单但安全性较低，适合一般防护需求；基于Token的方案安全性更高但实现稍复杂，适合重要资源保护。在实际应用中，可以根据业务需求选择合适方案，或组合多种技术提高防护效果。同时，动态水印、智能行为分析等高级策略可以进一步增强防盗链能力，保护网站资源不被非法盗用。
