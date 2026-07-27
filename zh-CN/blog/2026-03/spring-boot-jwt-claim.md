---
lastUpdated: true
commentabled: true
recommended: true
title: JWT Claims详解
description: 深入理解 JWT 中 Claims 的设计及其合理性
date: 2026-03-17 10:35:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

JSON Web Token (JWT)中的Claims是其核心组成部分，用于在令牌中携带有关主题(subject)的相关信息声明。Claims是JWT的有效载荷(Payload)部分，包含了用于验证和识别令牌持有者的关键信息。下面我将从多个角度详细解析JWT Claims。

## 一、JWT Claims的基本概念 ##

JWT Claims是JSON对象中的一组声明(claims)，用于在各方之间安全传输信息。每个claim都是一个键值对，代表特定的含义和作用。JWT Claims具有以下特点：

- ​紧凑性​：Claims通过Base64Url编码后形成的字符串很小，适合通过URL、POST参数或HTTP Header传输
- ​自包含性​：Payload中包含了所有用户需要的信息，避免了多次查询数据库
- ​标准化​：JWT定义了一套标准claims，同时也允许自定义claims以满足特定需求

## 二、JWT Claims的分类 ##

根据JWT标准(RFC 7519)，Claims可以分为三种主要类型：

### 保留Claims(Reserved claims) ###

这些是JWT标准预定义的claims，类似于编程语言的保留字，具有特定的含义和作用：

- ​iss (Issuer)​​：令牌的签发者，用于验证令牌是否由可信任的发行方签发
- ​sub (Subject)​​：令牌所代表的主题或用户，用于标识令牌所授权的用户
- ​aud (Audience)​​：令牌的目标接收者，用于限制令牌的使用范围
- ​exp (Expiration Time)​​：令牌的过期时间戳，过期后令牌将无效
- ​nbf (Not Before)​​：令牌生效的时间戳，在此之前令牌不可用
- ​iat (Issued At)​​：令牌的签发时间戳
- ​jti (JWT ID)​​：令牌的唯一标识符，可用于防止JWT重复使用

### 公共Claims(Public claims) ###

这些是可以由使用JWT的各方定义的claims，但为了避免冲突，应在IANA JSON Web Token Registry中注册，或者使用防冲突命名空间。这类claims在实际使用中较少见。

### 私有Claims(Private claims) ###

这是为在同意使用这些claims的各方之间共享信息而创建的自定义claims。例如：

```json
{
  "name": "Tom",
  "admin": true,
  "userId": "123"
}
```

这些claims与标准claims的区别在于：JWT实现库会自动验证标准claims，而私有claims需要明确告知接收方验证规则。

## 三、常用Claims的详细说明 ##

### ​iss (Issuer)​​ ###

标识签发JWT的主体，可以是包含字符串或URI的服务名称。验证方应检查此claim以确保令牌来自预期来源。

### ​sub (Subject)​​ ###

标识JWT的主题，通常是用户ID。这是JWT中最关键的claim之一，用于识别令牌所代表的用户。

### ​aud (Audience)​​ ###

标识JWT的目标接收者。如果接收方不匹配此claim的值，则应拒绝该令牌。可以是单个字符串或字符串数组。

### ​exp (Expiration Time)​​ ###

定义JWT的过期时间，是一个UNIX时间戳。过期后令牌将不再有效。这是安全性的重要保障，防止长期有效的令牌被滥用。

### ​nbf (Not Before)​​ ###

定义JWT开始生效的时间，也是一个UNIX时间戳。在此时间之前，令牌不应被接受。

### ​iat (Issued At)​​ ###

标识JWT的签发时间，可用于确定令牌的年龄。

### ​jti (JWT ID)​​ ###

为JWT提供唯一标识符，特别适用于防止重放攻击。每次生成的JWT应有不同的jti值。

## 四、Claims的使用注意事项 ##

- ​敏感信息​：JWT默认只进行Base64编码而不加密，因此不应在Claims中包含密码等敏感信息。
- ​数据量控制​：虽然JWT可以包含大量信息，但过大的Payload会影响传输效率，应只包含必要信息。
- ​验证规则​：标准Claims由JWT库自动验证，而自定义Claims需要开发者自行实现验证逻辑。
- ​时效性​：exp和nbf等时间相关Claims应仔细设置，平衡安全性与用户体验。
- ​唯一性​：使用jti可以增强安全性，防止令牌重用。

## 五、实际应用示例 ##

在Java中使用jjwt库创建包含Claims的JWT：

```java
Map<String, Object> claims = new HashMap<>();
claims.put(Claims.SUBJECT, "123"); // 标准claim
claims.put("name", "Tom"); // 自定义claim
claims.put("admin", true); // 自定义claim

String token = Jwts.builder()
    .setClaims(claims)
    .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1小时后过期
    .signWith(SignatureAlgorithm.HS256, secretKey)
    .compact();
```

解析和验证JWT Claims：

```java
Claims claims = Jwts.parser()
    .setSigningKey(secretKey)
    .parseClaimsJws(token)
    .getBody();

String userId = claims.getSubject(); // 获取sub claim
String name = (String) claims.get("name"); // 获取自定义claim
Boolean isAdmin = (Boolean) claims.get("admin"); // 获取自定义claim
```

## 六、安全建议 ##

- 始终验证标准Claims，特别是exp和iss
- 为敏感操作添加额外的验证机制，不要仅依赖JWT Claims
- 使用HTTPS传输JWT，防止令牌被截获
- 设置合理的过期时间，避免令牌长期有效
- 考虑实现令牌黑名单机制，特别是对于注销功能

JWT Claims作为令牌的核心内容，合理设计和使用对系统安全性至关重要。开发者应根据实际业务需求，选择适当的Claims组合，并确保其得到正确验证。

## jwt的token令牌实现登录校验功能 ##

Token令牌分为三部分：Header（头部）：放着签名算法和令牌类型（token就是一种令牌类型），payload（负载）：可以放着一些自定义字段，存储的时候会被Base64编码，Signature（签名）：对Header和Payload进行编码的结果，通过指定的签名算法和密钥来进行计算。这三部分由.分割。

### 步骤1：引入jwt相关依赖 ###

```xml
<!--jwt依赖-->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>${jwt}</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>${jwt}</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>${jwt}</version>
    <scope>runtime</scope>
</dependency>
```

### 步骤2：创建Jwt工具类 ###

jwt工具类用于生成jwt的token令牌，解析token令牌，还有判断令牌是否有效。

#### 定义密钥和过期时间 ####

```java
private static final String SECRET="SECRET="eyJ1c2VybmFtZSI6ImRqIiwicGFzc3dvcmQiOjEyMzQ1Nn0=";//定义密钥";
    private static final Long  EXPIRATION = 3600L; //定义过期时间
```

密钥可以去浏览器的base64编码生成器来获得。通过自己指定的数据来进行编码。

#### 生成token令牌的方法 ####

```java
  //生成令牌
    public static String generateToken(Map<String, String> claims) {
        return Jwts.builder()
                .setClaims(claims)//传入自定义数据
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION * 1000))//生成过期时间
                .signWith(SignatureAlgorithm.HS256, SECRET)//签名算法和密钥
                .compact();
    }
```

setClaims用来组成token令牌的Payload，比如接收到前端传过来的用户名和id，可以封装成一个Map集合作为参数传进去，setExpiration用来指定过期时间，多久会失效，这里是当前时间加上刚刚定义的时间，signWith传递的是签名算法和密钥。

#### 解析token令牌的方法 ####

```java
public static Claims parseToken(String token) {
    return Jwts.parser()
            .setSigningKey(SECRET)
            .parseClaimsJws(token)
            .getBody();
}
```

setSigningKey传入生成token令牌的密钥，parseClaimsJws传入获得到的token令牌。这个方法主要用于校验token是否有效，比如结合下面的方法。

#### 校验token令牌 ####

```java
public static boolean validateToken(String token) {
    try {
        parseToken(token);
        return true;
    } catch (Exception e) {
        return false;
    }
}
```

如果报错了，说明令牌有问题，比如过期之类的，执行一些逻辑，比如跳转到登录界面，如果没报错，就证明令牌有效。

### 步骤3：创建一个拦截器 ###

创建一个类实现HandlerInterceptor接口，实现里面的perHandle方法。

```java
@Slf4j
@Component
public class JwtTokenInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            //当前拦截到的不是动态方法，直接放行
            return true;
        }

        // 1. 从请求头获取Token
        String token = request.getHeader("token");
        if (token == null || !token.startsWith("Bearer ")) {
            log.info("token为空：{}",token);
            response.setStatus(401);
            return false;
        }
        token = token.substring(7);
        boolean flag = JwtUtil.validateToken(token);
        if (flag) {
            return true;
        }
        log.info("token无效：{}",token);
        response.setStatus(401);
        return false;
    }
```

主要就是拦截后的逻辑，先从请求头拿到浏览器被前端拿到的token，如果无效就返回401状态码，并且返回一个false。boolean类型的返回值用于告诉拦截器，什么时候放行，什么时候不放。

### 步骤四：注册拦截器 ###

创建了一个拦截器后，肯定是要去配置，启动的，这里创建了一个配置类，并且实现了WebMvcConfigurer接口
重写了addInterceptors这个方法。

```java
@Configuration
@Slf4j
public class WebMvcConfiguration implements WebMvcConfigurer {
    @Autowired
    private JwtTokenInterceptor jwtTokenInterceptor;
    /*@Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtTokenInterceptor)
                .addPathPatterns("/*")   // 拦截路径
                .excludePathPatterns("/admin/login"); // 排除路径
    }*/
```
将刚刚编写的拦截器依赖注入，然后在方法里面开始注册，这里注册的时候指定了拦截的路径，排除拦截的路径，比如登陆时的路径。

> 深入理解 JWT 中 Claims 的设计及其合理性

在使用 JWT（JSON Web Token）时，我们常常需要在 token 中存储一些用户或业务相关的信息，这些信息被称为 claims。从源码的角度来看，JJWT 库设计了一系列方法来设置 claims，它要求传入一个实现了 Map 接口的数据结构。这篇博客将带你从源码出发，详细讲解 JWT Claims 的设计思想、各种实现方式以及它们各自的合理性，并附上实际的代码示例。

## JWT Claims 的设计要求 ##

在 JJWT 库中，构建 JWT 的核心接口是 `JwtBuilder`。在这个接口中，我们看到与 `claims` 相关的方法有两个重载版本：

```java
JwtBuilder setClaims(Claims var1);
JwtBuilder setClaims(Map<String, Object> var1);
```

这意味着你可以传入一个 `Claims` 对象，也可以传入一个普通的 `Map<String, Object>`。实际上，Claims 接口本身就扩展了 `Map<String, Object>`，因此从设计上来说，JWT 库期望所有的 claims 最终都是以键值对的形式存在。这种设计有以下几个优点：

### 灵活性高 ###

不论你使用哪个实现，只要它实现了 Map 接口，JWT 库都能通过遍历来序列化所有的 claims。你可以选择 Java 自带的 HashMap，也可以选择库中提供的 DefaultClaims。

### 高效性能 ###

使用 HashMap 或类似的 Map 实现，其插入和查找操作都非常迅速，这在生成和解析 JWT 时能够提供足够的性能保证。

### 语义清晰 ###

通过使用 Claims 接口，代码语义上更加明确 —— 我们传递的是“声明”而不是普通的 Map，从而增强了代码的可读性。

## 不同方式设置 Claims 的实现 ##

### 方式一：直接使用 HashMap ###

直接创建一个 HashMap 来存放所有你想要添加的声明，再一次性传递给 setClaims 方法。这种方式简单直观，适用于声明较少或简单的场景。

代码示例：

```java
HashMap<String, Object> claims = new HashMap<>();
claims.put("id", "23");
claims.put("username", "大郎");

String token = Jwts.builder()
    .setClaims(claims)
    .signWith(SignatureAlgorithm.HS256, "wolfcode")
    .setExpiration(new Date(System.currentTimeMillis() + 3600 * 1000 * 24))
    .compact();

System.out.println(token);
```

### 方式二：使用 DefaultClaims ###

JJWT 库中提供了 DefaultClaims 类，它实现了 Claims 接口。使用 DefaultClaims 可以让代码语义上更贴近“声明”的概念，同时依然享受 Map 的高效性能。

代码示例：

```java
DefaultClaims claims = new DefaultClaims();
claims.put("id", "23");
claims.put("username", "大郎");

String token = Jwts.builder()
    .setClaims(claims)
    .signWith(SignatureAlgorithm.HS256, "wolfcode")
    .setExpiration(new Date(System.currentTimeMillis() + 3600 * 1000 * 24))
    .compact();

System.out.println(token);
```

### 方式三：逐个添加声明 ###

对于简单的场景，如果你只需要添加几个声明，也可以直接使用 claim(key, value) 方法逐个设置。这种方式省去了创建 Map 的步骤，代码更加简洁。

代码示例：

```java
String token = Jwts.builder()
    .claim("id", "23")
    .claim("username", "大郎")
    .signWith(SignatureAlgorithm.HS256, "wolfcode")
    .setExpiration(new Date(System.currentTimeMillis() + 3600 * 1000 * 24))
    .compact();

System.out.println(token);
```

## 这种设计的合理性 ##

从源码和设计角度来看，这样的设计是非常合理的，原因有以下几点：

### 符合 Map 接口标准 ###

由于 JWT 的 claims 实际上就是一组键值对数据，使用 Map 来存储它们符合直观的编程习惯，也与 JSON 的数据格式天然契合。

### 易于扩展 ###

开发者可以根据需求选择不同的实现方式（例如使用 `HashMap` 或 `DefaultClaims`），也可以灵活地通过 `claim(key, value)` 方法添加单个属性。这种扩展性满足了各种复杂业务场景的需求。

### 解耦合 ###

JWT 库只依赖于 Map 接口，而不关心具体的实现细节。这样无论未来 Map 的实现有何种变化，或者你需要替换成其他自定义实现，代码都可以很容易适配。

### 性能考虑 ###

选择使用 HashMap 或 DefaultClaims 这样的高效数据结构，可以确保 JWT 构建和解析的过程中不会因为数据结构性能问题而成为瓶颈。

## 总结 ##

JJWT 库通过要求传入实现了 Map 接口的数据结构来设置 JWT 中的 claims，实现了灵活、高效且语义明确的设计。开发者既可以选择直接传入 HashMap，也可以使用库中提供的 DefaultClaims，或者直接通过单个声明添加方法设置 claims。这些设计不仅符合 JSON 数据格式的自然属性，也让代码更加易于维护和扩展。
