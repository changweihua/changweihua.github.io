---
lastUpdated: true
commentabled: true
recommended: true
title: JWT：你真懂HSA和RSA么？谈谈对称加密和非对称加密
description: JWT：你真懂HSA和RSA么？谈谈对称加密和非对称加密
date: 2025-03-07 12:00:00
pageClass: blog-page-class
---

# JWT：你真懂HSA和RSA么？谈谈对称加密和非对称加密 #


大家好，今天我们来聊聊如何在 Spring Boot 中集成 JWT（JSON Web Token）。我会从最基础的配置讲起，一步步带你理解 JWT 的加密方法、生成过程和验证方式。我们会从一个简单的实现开始，发现其中的问题，然后逐步优化，逼近如今最主流的方案。废话不多说，直接开整！

## Spring Boot 集成 JWT 需要的 POM 依赖 ##

要在 Spring Boot 项目中使用 JWT，我们得先把必要的依赖加到 pom.xml 里。JWT 是个用来安全传输信息的标准，特别适合做身份验证。下面是需要的依赖：

```xml
<!-- JWT 核心 API -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<!-- JWT 实现 -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<!-- JSON 处理 -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

这些依赖是干嘛的？

- jjwt-api：提供 JWT 的核心接口，比如生成和解析 token。
- jjwt-impl：具体的实现逻辑，runtime 作用域表示运行时才需要。
- jjwt-jackson：处理 JSON，因为 JWT 的数据部分是 JSON 格式的，靠它来序列化和反序列化。

有了这些依赖，我们就可以开始玩转 JWT 了！

## JWT 的加密方法：有哪些？怎么选？ ##

JWT 的安全性主要靠签名，签名用到的加密方法直接决定了 token 的可靠程度。常见的加密方法有这么几种：

### 常见的加密方法 ###

#### HS256（HMAC with SHA-256） ####

- 类型：对称加密
- 特点：用同一个密钥签名和验证，简单高效。
- 适用场景：单服务系统，密钥管理不复杂。

#### RS256（RSA with SHA-256） ####

- 类型：非对称加密
- 特点：私钥签名，公钥验证，安全性高。
- 适用场景：分布式系统，公钥可以公开分享。

#### ES256（ECDSA with SHA-256） ####

- 类型：非对称加密
- 特点：用椭圆曲线算法，密钥短，签名快。
- 适用场景：移动设备或资源受限的场景。

### 比较一下它们的异同 ###

| 算法 | 类型 | 密钥管理 | 安全性 | 性能 | 适用场景 |
| :---: | :----: | :---: | :---: | :----: | :---: |
| HS256 | 对称 | 一个密钥搞定 | 中等 | 快 | 单服务、小项目 |
| RS256 | 非对称 | 私钥签，公钥验 | 高 | 中等 | 分布式、公开API |
| ES256 | 非对称 | 私钥签，公钥验 | 高 | 快 | 移动端、IoT设备 |

### 举个例子帮你记住 ###

想象你是个店老板，要给顾客发“VIP凭证”：

- **HS256**：你用一个秘密口令写凭证，顾客拿回来你再用这个口令验。简单，但口令得藏好，不能泄露。
- **RS256**：你用私人印章盖凭证，顾客拿回来你给个公开的“印章模板”就能验。印章丢不了，别人还能帮你验。
- **ES256**：类似 RS256，但你的印章更小巧，盖章更快，适合给手机用户发凭证。


## 生成 JWT：结构和代码 ##

JWT 长啥样？它由三部分组成，用点号分隔：

```text
Header.Payload.Signature
```

### JWT 的通用结构 ###

**Header**：描述 token 的类型和加密算法，比如：

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**：放实际数据（声明），比如用户信息：

```json
{
  "sub": "10086",
  "name": "小明",
  "iat": 1698765432
}
```

**Signature**：用密钥对 Header 和 Payload 签名，确保不被篡改。

这三部分会分别被 Base64 编码，然后用点连起来，最后加上签名。

### 生成 JWT 的代码（用 HS256） ###

下面用 Java 代码生成一个 token：

```java
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;

public class JwtDemo {
    public static void main(String[] args) {
        // 生成一个 HS256 的密钥
        Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

        // 生成 JWT
        String jwt = Jwts.builder()
            .setHeaderParam("typ", "JWT") // Header
            .setSubject("10086")          // Payload: 用户ID
            .setClaim("name", "小明")     // Payload: 自定义声明
            .setIssuedAt(new Date())      // Payload: 发行时间
            .signWith(key)                // Signature: 用密钥签名
            .compact();                   // 合成 token

        System.out.println("生成的 JWT: " + jwt);
    }
}
```
运行后，你会得到一个长字符串，比如：

```txt
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMDA4NiIsIm5hbWUiOiLlsbPniYgiLCJpYXQiOjE2OTg3NjU0MzJ9.一串签名
```

## 验证 JWT：怎么解密和检查？ ##

验证 JWT 其实不涉及“解密”，而是检查签名和声明。签名对了，token 就是真的；声明没问题（比如没过期），就能用。

### 验证步骤 ###

- **解析 Header**：看看用的是啥算法。
- **检查签名**：用密钥验证签名是否匹配。
- **检查 Payload**：确认声明，比如时间是否过期。

### 验证代码（用 HS256） ###

接着上面的例子，验证一下：

```java
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

public class JwtDemo {
    public static void main(String[] args) {
        Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        String jwt = "刚刚生成的那个 token";

        try {
            Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)        // 设置密钥
                .build()
                .parseClaimsJws(jwt)       // 解析 token
                .getBody();                // 拿到 Payload
            System.out.println("用户ID: " + claims.getSubject());
            System.out.println("用户名: " + claims.get("name"));
        } catch (Exception e) {
            System.out.println("token 不合法！");
        }
    }
}
```

用到的核心 API 是 `Jwts.parserBuilder()` 和 `parseClaimsJws()`，它们帮你把 token 拆开并验证签名。

## 从简单到复杂：优化 JWT 的使用 ##

### 朴素方案：HS256 单密钥 ###

我们先从最简单的 HS256 开始：

1. 服务器用一个密钥生成 token。
2. 客户端拿着 token 访问，服务器用同一个密钥验证。

#### 问题来了 ####

- 密钥咋管？ 单服务还好说，但如果有多个服务，得把密钥传过去，容易泄露。
- 安全性咋办？ 密钥丢了，别人就能伪造 token。

#### 优化方向 ####

- 换非对称加密：用 RS256，私钥签名，公钥验证，公钥随便发，不怕泄露。
- 分布式友好：多个服务都能用公钥验 token，不用共享私钥。

### 主流方案：RS256 非对称加密 ###

#### 改用 RS256 ####

- 服务器用私钥生成 token。
- 客户端访问时，服务器或其他服务用公钥验证。

#### 好处 ####

- 安全性提升，私钥只留服务器。
- 分布式系统里，公钥随便分发，验证方便。

#### 代码调整 ####

生成 token 时用 RSA 密钥对：

```java
import java.security.KeyPair;
import io.jsonwebtoken.security.Keys;

KeyPair keyPair = Keys.keyPairFor(SignatureAlgorithm.RS256);
String jwt = Jwts.builder()
    .setSubject("10086")
    .signWith(keyPair.getPrivate())
    .compact();
```

验证时用公钥：

```java
Claims claims = Jwts.parserBuilder()
    .setSigningKey(keyPair.getPublic())
    .build()
    .parseClaimsJws(jwt)
    .getBody();
```

### 再进一步：解决 token 不可撤销 ###

RS256 虽然安全，但 JWT 一旦发出，除非过期，否则没法主动废掉。如果 token 被偷了，麻烦就大了。

#### 优化方案 ####

- 短命 access token + 长命 refresh token：access token 设个短过期时间（比如 15 分钟），过期后用 refresh token 换新的。
- 黑名单机制：用户退出或 token 被盗时，把 refresh token 加到黑名单。

#### 主流做法 ####

- access token：有效期短，负责日常认证。
- refresh token：有效期长，负责续命。
- 黑名单：用 Redis 存被废掉的 token，验证时查一下。

## 总结 ##

在 Spring Boot 里集成 JWT，核心是加好依赖（jjwt-api 等），选对加密方法（HS256、RS256、ES256），然后用代码生成和验证 token。从最简单的 HS256 开始，我们发现密钥管理的问题，进化到 RS256 的非对称加密，适应了分布式需求。再加上 refresh token 和黑名单，就成了现在最靠谱的方案。
