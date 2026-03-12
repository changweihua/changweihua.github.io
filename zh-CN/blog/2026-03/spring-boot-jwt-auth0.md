---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot 实现 JWT 认证完整方案
description: SpringBoot 实现 JWT 认证完整方案
date: 2026-03-11 09:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

JWT（JSON Web Token）是一种用于在网络应用间安全传递信息的开放标准，特别适合分布式系统的身份验证。下面我将详细介绍如何在SpringBoot项目中实现JWT认证。

## 一、JWT 基础概念 ##

JWT由三部分组成，用.连接：

- Header（头部）：包含令牌类型和使用的加密算法
- Payload（载荷）：包含用户信息和声明
- Signature（签名）：使用密钥对前两部分进行签名，确保信息不被篡改

## 二、项目准备 ##

### 添加依赖 ###

在pom.xml中添加JWT相关依赖：

```xml
<!-- JWT依赖 -->
<dependency>
    <groupId>com.auth0</groupId>
    <artifactId>java-jwt</artifactId>
    <version>3.19.2</version>
</dependency>
<!-- Spring Web -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<!-- Lombok（可选，用于简化代码） -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

### 配置文件 ###

在application.yml中添加JWT相关配置：

```yaml
spring:
  application:
    name: springboot-jwt-demo

jwt:
  # 密钥
  secret: your-secret-key-change-in-production
  # 过期时间（毫秒）
  expire-time: 86400000
  # 请求头中Token的名称
  header: Authorization
  # Token前缀
  token-prefix: Bearer
```

## 三、核心代码实现 ##

### JWT工具类 ###

```java
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Calendar;
import java.util.Map;

@Component
public class JWTUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expire-time}")
    private long expireTime;
    
    /**
     * 生成Token
     * @param claims 要存储在Token中的信息
     * @return 生成的Token字符串
     */
    public String generateToken(Map<String, String> claims) {
        // 设置过期时间
        Calendar instance = Calendar.getInstance();
        instance.add(Calendar.MILLISECOND, (int) expireTime);
        
        // 创建JWT Builder
        JWTCreator.Builder builder = JWT.create();
        
        // 添加载荷
        claims.forEach(builder::withClaim);
        
        // 设置签名和过期时间，生成Token
        return builder.withExpiresAt(instance.getTime())
                .sign(Algorithm.HMAC256(secret));
    }
    
    /**
     * 验证Token
     * @param token 要验证的Token
     * @return 验证后的DecodedJWT对象
     * @throws JWTVerificationException 验证失败时抛出异常
     */
    public DecodedJWT verifyToken(String token) {
        return JWT.require(Algorithm.HMAC256(secret))
                .build()
                .verify(token);
    }
    
    /**
     * 解析Token
     * @param token 要解析的Token
     * @return 解析后的DecodedJWT对象
     */
    public DecodedJWT parseToken(String token) {
        return JWT.decode(token);
    }
    
    /**
     * 从Token中获取指定的Claim
     * @param token Token字符串
     * @param claimName Claim名称
     * @return Claim值
     */
    public String getClaim(String token, String claimName) {
        DecodedJWT decodedJWT = parseToken(token);
        return decodedJWT.getClaim(claimName).asString();
    }
}
```

### JWT拦截器 ###

```java
import com.auth0.jwt.exceptions.JWTVerificationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

@Component
@Slf4j
public class JWTInterceptor implements HandlerInterceptor {
    
    @Autowired
    private JWTUtil jwtUtil;
    
    @Value("${jwt.header}")
    private String jwtHeader;
    
    @Value("${jwt.token-prefix}")
    private String tokenPrefix;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String token = request.getHeader(jwtHeader);
        
        // 检查请求头中是否包含Token
        if (token == null || "".equals(token.trim())) {
            response401(response, "Token不存在");
            return false;
        }
        
        // 移除Token前缀
        if (token.startsWith(tokenPrefix)) {
            token = token.replace(tokenPrefix, "").trim();
        } else {
            response401(response, "Token格式错误");
            return false;
        }
        
        try {
            // 验证Token
            jwtUtil.verifyToken(token);
            log.info("Token验证成功");
            return true;
        } catch (JWTVerificationException e) {
            log.error("Token验证失败: {}", e.getMessage());
            response401(response, "Token无效或已过期");
            return false;
        }
    }
    
    /**
     * 返回401错误响应
     */
    private void response401(HttpServletResponse response, String message) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=utf-8");
        
        try (PrintWriter out = response.getWriter()) {
            out.append("{\"code\": 401, \"message\": \"").append(message).append("\"}");
        } catch (Exception e) {
            log.error("响应错误: {}", e.getMessage());
        }
    }
}
```

### 拦截器配置 ###

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class InterceptorConfig implements WebMvcConfigurer {
    
    @Autowired
    private JWTInterceptor jwtInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 添加拦截器，拦截需要认证的路径
        registry.addInterceptor(jwtInterceptor)
                // 需要拦截的路径
                .addPathPatterns("/api/**")
                // 排除不需要拦截的路径
                .excludePathPatterns("/api/login", "/api/register", "/error");
    }
}
```

### 实体类 ###

```java
import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}

@Data
public class LoginResponse {
    private String token;
    private String username;
    private String message;
}
```

### 用户服务接口 ###

```java
public interface UserService {
    boolean login(String username, String password);
    boolean register(String username, String password);
}
```

### 用户服务实现 ###

```java
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {
    
    // 模拟数据库，实际项目中应使用数据库存储
    private final Map<String, String> userMap = new HashMap<>();
    
    public UserServiceImpl() {
        // 初始化测试用户
        userMap.put("admin", "123456");
    }
    
    @Override
    public boolean login(String username, String password) {
        return userMap.containsKey(username) && userMap.get(username).equals(password);
    }
    
    @Override
    public boolean register(String username, String password) {
        if (userMap.containsKey(username)) {
            return false; // 用户名已存在
        }
        userMap.put(username, password);
        return true;
    }
}
```

### 登录控制器 ###

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JWTUtil jwtUtil;
    
    @Value("${jwt.token-prefix}")
    private String tokenPrefix;
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (userService.login(request.getUsername(), request.getPassword())) {
            // 构建Token中的载荷信息
            Map<String, String> claims = new HashMap<>();
            claims.put("username", request.getUsername());
            
            // 生成Token
            String token = jwtUtil.generateToken(claims);
            
            // 构建响应
            LoginResponse response = new LoginResponse();
            response.setToken(tokenPrefix + " " + token);
            response.setUsername(request.getUsername());
            response.setMessage("登录成功");
            
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body("用户名或密码错误");
    }
    
    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody LoginRequest request) {
        if (userService.register(request.getUsername(), request.getPassword())) {
            return ResponseEntity.ok("注册成功");
        }
        return ResponseEntity.badRequest().body("用户名已存在");
    }
    
    /**
     * 测试接口，需要验证Token
     */
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("访问成功，Token有效");
    }
}
```

## 四、安全性考虑 ##

- 密钥安全：密钥必须保密，生产环境应使用强密钥
- Token过期时间：设置合理的过期时间，避免永久有效
- HTTPS传输：在生产环境中使用HTTPS传输Token
- 防XSS攻击：Token存储在localStorage时可能被XSS攻击窃取
- Token刷新机制：实现Token刷新机制，避免频繁登录
- 黑名单机制：对于已注销的Token，添加到黑名单中

## 五、优化建议 ##

- 使用Redis存储Token：可以更灵活地管理Token生命周期
- 实现Refresh Token：提供长期的Refresh Token用于获取新的Access Token
- 增加角色权限：在Token中添加用户角色信息，实现更细粒度的权限控制
- 使用非对称加密：生产环境可考虑使用RSA等非对称加密算法
- 添加IP绑定：在Token中绑定用户IP，增加安全性
- 添加日志记录：记录Token的生成、验证和使用情况

## 六、测试方法 ##

- 启动SpringBoot应用
- 使用Postman或其他工具测试登录接口：`POST http://localhost:8080/api/login`
- 在请求体中添加用户名和密码
- 成功后将返回的Token添加到请求头
- 访问需要认证的接口：GET `http://localhost:8080/api/test`

这个实现提供了SpringBoot中JWT认证的完整流程，包括Token生成、验证和拦截器实现。您可以根据实际需求进行调整和扩展。
