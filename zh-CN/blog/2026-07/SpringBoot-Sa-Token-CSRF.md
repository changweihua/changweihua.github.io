---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot + Sa-Token 实现 CSRF 令牌校验
description: SpringBoot + Sa-Token 实现 CSRF 令牌校验
date: 2026-07-23 09:25:00
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 前言 ##

在前后端分离项目中，跨域请求与 CSRF 攻击一直是安全防护的重点。很多人只关注 Token 登录态，却忽略了浏览器层面的防护手段。本文将结合 Sa-Token 框架，手把手教你实现 4 种核心防御手段：CSRF 令牌、Referer/Origin 校验、Cookie SameSite/HttpOnly 配置，以及跨域请求拦截。

## 为什么这些配置很重要？ ##

先快速回顾 CSRF 攻击的原理：攻击者通过诱导用户访问恶意网站，利用用户已登录的 Cookie，在目标网站执行未授权操作。防御的核心思路就是：

- 让攻击者无法拿到有效的身份凭证（Cookie/Token）
- 让浏览器拒绝携带凭证发起跨域请求
- 让服务器能识别并拦截非法来源的请求

## 基础配置：Sa-Token 与 Cookie 安全属性 ##

### Sa-Token 核心配置（适配前后端分离） ###

在 `application.yml` 中配置基础登录态规则，这里我们选择用 Header 传递 Token，同时开启 Cookie 安全属性（用于其他场景的防护）：

```yaml
sa-token:
  token-name: Authorization
  timeout: 28800
  activity-timeout: 14400
  is-concurrent: true
  is-share: false
  is-read-header: true
  is-read-cookie: false  # 前后端分离场景，不通过 Cookie 读 Token
  token-prefix: "Bearer"
  jwt-secret-key: system$2023-05CV-982131711
  cookie:
    same-site: Strict   # 跨域请求不携带 Cookie
    http-only: true     # 禁止 JS 读取 Cookie，防 XSS 窃取
    secure: false       # 生产环境 HTTPS 必须设为 true
    path: /
```

### 关键属性解释 ###

| 配置项 | 作用 | 安全意义 |
| :--- | :--- | :--- |
| `SameSite: Strict` | 只有同站请求才会携带 Cookie | 直接阻断跨站请求的 Cookie 携带，从根源防 CSRF |
| `HttpOnly: true` | 浏览器禁止 JS 读取 Cookie | 防止 XSS 攻击窃取会话 Cookie |
| `Secure: true` | 仅在 HTTPS 环境下携带 Cookie | 防止中间人攻击窃取 Cookie |

## 第一道防线：CORS 跨域配置，拒绝非法来源 ##

CORS 是浏览器层面的第一道拦截，配置正确的跨域规则，能让浏览器主动拒绝非白名单的跨域请求。

### 完整配置代码 ###

```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("#{'${system.cors.origin_url:}'.split(',')}")
    private List<String> allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        log.info("[CorsConfig] 当前环境：{}，允许的 Origin：{}", activeProfile, allowedOrigins);

        registry.addMapping("/**")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);

        var config = registry.getCorsConfigurations().get("/**");

        // 测试/预发布/生产环境使用通配（仅内部环境，请勿对外暴露）
        if (Arrays.asList("test", "stg", "prod").contains(activeProfile)) {
            config.addAllowedOriginPattern("*");
        } else {
            // 开发环境严格校验白名单域名
            if (allowedOrigins == null || allowedOrigins.isEmpty()) {
                log.error("[CorsConfig] 开发环境允许的 Origin 为空，所有跨域请求将被拒绝");
                config.setAllowedOrigins(List.of());
            } else {
                allowedOrigins.stream()
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .forEach(config::addAllowedOrigin);
            }
        }
    }
}
```

### 避坑指南 ###

- 不要在生产环境使用 `addAllowedOriginPattern("*")`，会绕过浏览器的 CORS 校验。
- `allowCredentials(true)` 必须配合明确的 `allowedOrigins`，否则浏览器会拒绝携带 Cookie。
- 测试跨域时，工具请求（如 Apifox）默认不带 Origin 头，无法触发 CORS 校验，必须手动添加 Origin 头测试。

## 第二道防线：Sa-Token 拦截器，实现 Origin/Referer 校验 ##

CORS 只能拦截浏览器发起的跨域请求，无法拦截工具请求。我们需要在 Sa-Token 拦截器中，手动校验请求来源，实现双重防护。

### 核心拦截逻辑 ###

```java
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.router.SaRouter;
import cn.dev33.satoken.stp.StpUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Configuration
public class SaTokenSecurityConfig {

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("#{'${system.cors.origin_url:}'.split(',')}")
    private List<String> allowedOrigins;

    @Bean
    public SaInterceptor saInterceptor() {
        return new SaInterceptor(handler -> {
            // 1. 基础登录校验
            StpUtil.checkLogin();

            // 2. 开发环境 Origin/Referer 校验
            if (!Arrays.asList("test", "stg", "prod").contains(activeProfile)) {
                String origin = handler.getRequest().getHeader("Origin");
                String referer = handler.getRequest().getHeader("Referer");
                boolean isAllowed = false;

                if (origin != null) {
                    isAllowed = allowedOrigins.stream().anyMatch(origin::startsWith);
                } else if (referer != null) {
                    isAllowed = allowedOrigins.stream().anyMatch(referer::startsWith);
                }

                if (!isAllowed) {
                    log.warn("[安全拦截] 非法请求来源：Origin={}, Referer={}", origin, referer);
                    throw new RuntimeException("非法请求来源，拒绝访问");
                }
            }
        });
    }
}
```

## 基础防护效果验证 ##

完成以上配置后，你的项目已经具备了基础的浏览器安全防护能力：

- 非白名单域名的跨域请求会被浏览器拦截。
- 工具请求不带 Origin/Referer 头时，会被服务器拦截。
- Cookie 已开启 `HttpOnly` 和 `SameSite`，降低 XSS 和 CSRF 风险。

> 我们将进阶实现 Sa-Token 自带的 CSRF 令牌校验，完成完整的安全防护闭环。

我们通过 CORS 配置和 Origin/Referer 校验，搭建了基础的浏览器安全防护。但这些手段无法防御同源下的 CSRF 攻击，也无法完全避免工具伪造请求。本文将结合 Sa-Token 自带的 `SaCsrfUtil`，实现随机、单次有效的 CSRF 令牌校验，完成安全防护的最后一环。

## CSRF 令牌的核心原理 ##

CSRF 令牌的防御逻辑非常简单：

- 用户登录后，服务器生成一个随机、一次性有效的 CSRF 令牌，返回给前端。
- 前端在发起敏感请求（POST/PUT/DELETE）时，必须携带这个令牌。
- 服务器校验令牌的有效性，校验通过后立即作废，确保令牌无法复用。

## Sa-Token CSRF 令牌的使用 ##

### 生成并返回 CSRF 令牌 ###

在用户登录或页面加载时，生成令牌并返回给前端：

```java
import cn.dev33.satoken.csrf.SaCsrfUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    // 生成一次性 CSRF 令牌
    @GetMapping("/csrf-token")
    public String getCsrfToken() {
        return SaCsrfUtil.createToken();
    }
}
```

### 在 Sa-Token 拦截器中校验令牌 ###

在之前的拦截器中，添加敏感请求的 CSRF 令牌校验逻辑：

```java
@Slf4j
@Configuration
public class SaTokenSecurityConfig {

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("#{'${system.cors.origin_url:}'.split(',')}")
    private List<String> allowedOrigins;

    @Bean
    public SaInterceptor saInterceptor() {
        return new SaInterceptor(handler -> {
            // 1. 基础登录校验
            StpUtil.checkLogin();

            // 2. 开发环境 Origin/Referer 校验
            if (!Arrays.asList("test", "stg", "prod").contains(activeProfile)) {
                // 校验逻辑同上一篇，此处省略
            }

            // 3. 敏感请求 CSRF 令牌校验
            String method = handler.getRequest().getMethod();
            if (Arrays.asList("POST", "PUT", "DELETE").contains(method)) {
                SaCsrfUtil.checkToken();
            }
        });
    }
}
```

## 前端如何携带 CSRF 令牌？ ##

前端在发起敏感请求时，需要将令牌放入请求头中，Sa-Token 默认会从 `X-CSRF-Token` 头中读取令牌：

```javascript
// 1. 页面加载时获取令牌
let csrfToken = "";
fetch("/auth/csrf-token")
  .then(res => res.text())
  .then(token => {
    csrfToken = token;
  });

// 2. 发起敏感请求时携带令牌
fetch("/api/user/update", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${localStorage.getItem('token')}`,
    "X-CSRF-Token": csrfToken,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ name: "新名字" })
});
```

## 完整防护闭环：四种手段协同工作 ##

现在我们已经实现了全部四种浏览器安全防护手段，它们各司其职，形成了完整的防护闭环：

| 防护手段 | 作用 | 防御场景 |
| :--- | :--- | :--- |
| SameSite/HttpOnly/Secure Cookie | 让浏览器不跨站携带 Cookie，且防止 JS 读取 | 跨站 CSRF、XSS 窃取 Cookie |
| CORS 跨域配置 | 让浏览器主动拒绝非白名单跨域请求 | 浏览器发起的跨域请求 |
| Origin/Referer 校验 | 服务器端校验请求来源，拒绝非法域名 | 工具伪造请求、绕过 CORS 的请求 |
| CSRF 令牌校验 | 敏感请求必须携带一次性有效令牌 | 同源 CSRF 攻击、工具重放请求 |

## 生产环境部署注意事项 ##

- 强制 HTTPS：所有环境必须使用 HTTPS，否则 `secure: true` 配置会导致 Cookie 无法携带。
- 令牌过期时间：可根据业务场景调整 CSRF 令牌的有效期，避免影响用户体验。
- 日志监控：对 Origin/Referer 校验失败、CSRF 令牌校验失败的请求，添加日志监控，及时发现异常攻击行为。
- 避免通配符配置：生产环境严禁使用 `*` 作为跨域允许的 Origin，必须配置明确的白名单。

## 结语 ##

浏览器安全防护不是靠某一种手段就能实现的，而是多种手段协同工作的结果。通过 Sa-Token 框架，我们可以快速实现 CORS、Origin/Referer 校验、Cookie 安全属性和 CSRF 令牌校验，为项目搭建起坚固的安全防线。

希望本文能帮你解决跨域与 CSRF 防护的痛点，写出更安全的前后端分离项目代码。
