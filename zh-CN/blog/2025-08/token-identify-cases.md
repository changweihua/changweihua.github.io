---
lastUpdated: true
commentabled: true
recommended: true
title: Token鉴权的 N 种方案
description: Token鉴权的 N 种方案 
date: 2025-08-11 10:55:00 
pageClass: blog-page-class
cover: /covers/platform.svg
---

## 前言 ##

最近有球友问我：微服务中Token鉴权除了使用 `JWT` 之外，还有什么其他的方案？

今天这篇文章跟大家一起聊聊微服务Token鉴权的 `N` 种方案，希望对会有所帮助。

## 为什么必须做Token鉴权？ ##

### 传统Session的致命缺陷 ###

```mermaid
flowchart TB
用户--> ServiceA[服务A Session]
ServiceA --> ServiceB[服务B无法共享Session]
ServiceB --> 重复认证 --> 系统性能下降
```

- 多个服务无法共享Session。
- 重复认证，导致系统性能严重下降。

#### 2023年某电商平台发送安全事故 ###

```txt
GET /api/users/balance HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.Gfx6VO9tcxwk6xqx9yYzSfebbeKDTHkQKh0xhu4nJE0
```

黑客通过XSS攻击窃取此Token后，在2小时内盗取5万用户余额，暴露三大漏洞：

- Token未绑定IP/设备指纹
- 敏感操作未二次认证
- 无异常行为检测机制

## 常见的Token鉴权方案 ##

### 方案1：基础JWT+Redis方案 ###

该方案适合初创系统。

#### 核心架构 ####

```mermaid
flowchart LR
Client[客户端]-->|登录请求|认证服务-->|生成JWT|Redis[Redis从存储]
Client-->|携带Token|业务服务-->|验证Token|Redis
Redis-->|返回Token|Client
```

#### 致命陷阱 ####

```java
// 错误示例：未校验Token有效性
public Claims parseJwt(String token) {
    return Jwts.parser() 
        .setSigningKey(SECRET_KEY)
        .parseClaimsJws(token)
        .getBody(); // 若Token被注销仍能解析通过！
}
```

#### 正确实现 ####

```java
// 结合Redis校验Token状态
public boolean validateToken(String token, UserDetails details) {
    String username = extractUsername(token);
    String redisToken = redisTemplate.opsForValue().get("token:"+username);
    
    // 双重验证：签名有效且未注销
    return (username.equals(details.getUsername()) 
        && !isTokenExpired(token) 
        && token.equals(redisToken);
}
```

**适用场景**：用户量 `<100万` 的中小型系统

### 方案2：OAuth2.0授权框架 ###

该方案是第三方接入的首选。

#### OAuth2.0包含了4种授权模式 ####

```mermaid
flowchart TB
OAuth(OAuth2.0)-->授权码模式
OAuth(OAuth2.0)-->密码模式
OAuth(OAuth2.0)-->客户端模式
OAuth(OAuth2.0)-->刷新模式
```

**授权码模式流程**

```mermaid
sequenceDiagram
    participant User as 用户
    participant Client as 客户端
    participant IDP as 认证服务器
    participant RDS as 资源服务器

    User->>Client: 访问资源
    Client-->>User: 重定向至认证中心
    User-)IDP: 登录授权
    IDP->>User: 返回授权码
    User->>Client: 携带授权码
    Client->>IDP: 换取 AccessToken
    IDP->>Client: 返回 Token
    Client->>RDS: 携带Token访问
    RDS->>IDP: 验证 Token
    IDP->>RDS: 返回验证结果
    IDP->>Client: 返回资源或结果
```

`Spring Boot` 配置示例：

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_SECRET}
            scope: user:email,read:user
        provider:
          github:
            token-uri: https://github.com/login/oauth/access_token
            user-info-uri: https://api.github.com/user
```

> 关键点：*必须使用PKCE扩展*防止授权码截持攻击

### 方案3：Sa-Token轻量级框架 ###

该方案是的国产Token鉴权方案的精品。

#### 三大核心优势 ####

**一行代码实现登录鉴权**

```java
// 登录
StpUtil.login(10001); 

// 鉴权
@SaCheckPermission("user:delete")
public void deleteUser(Long id) {
  // 业务代码
}
```

**内置会话管理**

```java
// 查询所有会话
List<String> sessionList = StpUtil.searchSessionId("user:*", 0, 10);
```

**踢人下线机制**

```java
// 根据账号ID踢人
StpUtil.kickout(10001);

// 根据Token值踢人
StpUtil.kickoutByTokenValue("xxxx");
```

#### 网关集成方案 ####

```java
@Bean
public SaReactorFilter saReactorFilter() {
    return new SaReactorFilter()
        .addInclude("/**")
        .setAuth(obj -> {
            SaRouter.match("/user/**").check(r -> StpUtil.checkPermission("USER"));
            SaRouter.match("/admin/**").check(r -> StpUtil.checkPermission("ADMIN"));
        });
}
```

> 性能实测：QPS 12,000（Redis集群模式）

### 方案4：API网关统一鉴权 ###

该方案是微服务的标配。

#### 架构设计 ####

```mermaid
flowchart LR
客户端-->API网关-->鉴权--通过-->路由到微服务
路由到微服务-->服务A
路由到微服务-->服务B
鉴权--拒绝-->返回401
```

#### 响应式鉴权过滤器 ####

```java
public class AuthFilter implements GlobalFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 1. 提取Token
        String token = extractToken(exchange.getRequest());
        
        // 2. 响应式鉴权调用
        return reactiveAuthService.validateToken(token)
                .flatMap(valid -> {
                    if (!valid) {
                        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                        return exchange.getResponse().setComplete();
                    }
                    return chain.filter(exchange);
                });
    }
}
```

#### 性能优化技巧 ####

- 本地缓存：使用Caffeine缓存验证结果
- 批量验证：聚合10ms内请求统一鉴权
- 热点Token特殊处理

### 方案5：Token中继模式 ###

该方案适合服务链调用。

**核心问题**：服务A调用服务B时Token如何传递。

#### 解决方案 ####

```mermaid
sequenceDiagram
    participant A as 客户端
    participant B as 服务 A
    participant C as 服务 B
    participant D as 认证服务
    A->>B: 携带Token请求
    B->>C: 原样传递Token
    C->>D: 验证Token
    D->>C: 返回用户信息
    C->>B: 返回业务数据
    B->>A: 返回最终结果
```

**Feign中继实现**

```java
@FeignClient(name = "service-b")
public interface ServiceBClient {
    
    @GetMapping("/data")
    Data getData(@RequestHeader("Authorization") String token);
}

// 调用方
public Data getData(String token) {
    // 原样传递Token
    return serviceBClient.getData("Bearer " + token); 
}
```

> 安全加固：使用JWT嵌套加密防止内部Token泄露

### 方案6：JWE加密令牌 ###

该方案能保证金融级安全。

#### 与JWT的核心区别 ####

```mermaid
flowchart LR

JWT--仅签名-->数据透明

JWE--加密-->数据保密
```

#### Java生成示例 ####

```java
public String createJwe(User user) throws JOSEException {
    // 1. 组装Header
    JWEHeader header = new JWEHeader.Builder(JWEAlgorithm.A256GCMKW, 
            EncryptionMethod.A256GCM).build();
    
    // 2. 创建Payload
    Payload payload = new Payload(new JSONObject()
        .put("sub", user.getId())
        .put("ssn", encrypt(user.getSsn()))); // 敏感信息加密
    
    // 3. 加密Token
    JWEObject jwe = new JWEObject(header, payload);
    jwe.encrypt(new AESEncrypter(SECRET_KEY.getBytes()));
    
    return jwe.serialize();
}
```

#### 适用场景 ####

- 支付凭证
- 身份证号传输
- 医疗健康数据

### 方案7：双向TLS认证 ###

该方案是零信任架构。

#### 工作流程 ####

```mermaid
sequenceDiagram
    participant A as 客户端
    participant B as 服务端
    A->>B: ClientHello ＋ 客户端证书
    B->>A: ServerHello ＋ 服务端证书
    A->>B: 验证服务端证书
    B->>A: 验证客户端证书
    Note over A,B: 双向验证通过
    A->>B: 加密通信
```

**Spring Boot配置**

```yaml
server:
  ssl:
    key-store: classpath:server-keystore.p12
    key-store-password: changeit
    key-alias: server
    client-auth: need # 关键配置
    trust-store: classpath:client-truststore.p12
    trust-store-password: changeit
```

**适用场景**

- 服务网格内部通信
- 行核心系统
- 政府机密数据交换

### 方案8：AK/SK 加密认证 ###

`ak/sk` 是一种身份认证方式，常用于系统间接口调用时的身份验证，其中 `ak` 为 `Access Key ID` ，`sk` 为 `Secret Access Key`。客户端和服务端两者会协商保存一份相同的 `sk`，其中 `sk` 必须保密。

客户端在调用的服务端接口时候，会带上 `ak` 以及 `signature`（使用sk对内容进行加密后得出的签名）进行请求，在服务端接收到这个请求的时候，首先会根据ak去数据库里面去找到对应的sk，然后使用sk对请求内容进行加密得到一个签名，然后对比客户端传过来的签名和服务端计算的出来的签名是否一致，如果一致则代表身份认证通过，反之则不通过。

```mermaid
sequenceDiagram
    participant A as 客户端
    participant B as 服务端
    participant C as 数据库
    activate A
    A->>+A: 生成签名
    A->>+B: /students?platform_type&time&sign

    activate B
    B->>+C: 根据platform_type查询对应sk

    activate C
    C-->>-B: 返回
    deactivate C
    
    B->>+B: 判断time是否有效，并使用sk对其进行签名
    B->>+B: 用计算出的签名和请求中的sign进行对比
    B->>+B: 通过身份校验，执行接口逻辑
    
    deactivate B
    
    B-->>-A: 返回调用结果
    
    deactivate A
```

AK/SK（Access Key/Secert Key） 是一组用于鉴权的密钥对，类比常见的账号密码体系，AK 相当于账号，SK 相当于密码，只不过 AK/SK 一般是给开放平台使用的鉴权手段，一个用户可以设置多个 AK/SK，并且可以精细控制每一组 Key 的权限范围。

#### 为什么需要 AK/SK？ ####

当我们的平台需要对外提供 API 服务时，就需要对调用者进行鉴权处理。要如何识别是哪个用户进行的操作，一种是token，用户授权后生成一个唯一标识，后续调用服务时根据这个token识别用户，但是这种方案风险性较高，其他人通过请求抓包可以拦截到token进行调用；另一种安全性较高的手段就是通过 AK/SK 的形式，AK 标识用户或者应用，SK 作为密钥将 timestamp、nonce 等信息计算出签名，客户端和服务端通过相同的 SK 计算得到的签名是一致的，如果请求被拦截，nonce 已经被使用过可以避免请求重放，timestamp 可以保证签名的有效期。因为签名由 SK 生成，所以只要 SK 不泄漏，就可以保证服务的安全。

#### 流程 ####

1. 首先在平台生成 AK/SK，客户端将 AK/SK 保存起来。后续每次调用平台服务之前，通过 SK 将当前的时间戳 timestamp 和 请求唯一标识 nonce 进行加密计算得到签名 signature，并将三者一起发送到服务端。
2. 服务端接收到调用请求后，从请求中拿出这些参数进行校验。
3. 首先是时效性校验，判断时间戳是否在有效时间内，以及 nonce 是否已经生效过。
4. 然后从数据库中查询 AK/SK 是否存在。
5. 最后用查询到的 SK 在对时间戳和请求标识进行加密计算，把结果与客户端的签名进行比对。

```mermaid
flowchart LR

start([客户端携带签名访问])-->judge1{时间、nonce是否有效}
judge1--是-->judge2{AS/SK是否存在}
judge2--是-->judge3{签名验证}
judge3--是-->result[调用成功]

result-->ends([结束])

judge1--否-->invalid[调用失败]
judge2--否-->invalid[调用失败]
judge3--否-->invalid[调用失败]

invalid-->ends([结束])
```


**为什么要将时间戳和唯一标识进行加密？**

它们各自解决了不同的安全问题，同时使用两者可以提供更全面的安全保障。

- Timestamp: 主要用于防止请求过期。通过在请求中包含一个时间戳，服务端可以验证请求是否在允许的时间窗口内发出。这有助于避免重放攻击（replay attack）。
- Nonce: Nonce 是“数字仅一次使用”的缩写，它确保了每个请求的唯一性。即使两个请求发生在同一秒内并且其他参数完全相同，由于 nonce 的不同，它们仍然会被视为独立的请求。Nonce 通常是一个随机生成的字符串或者递增的计数器值，在一段时间内必须是唯一的。

#### 整个 AK/SK 鉴权的交互过程 ####


```mermaid
sequenceDiagram
    autonumber

    participant A as 客户端<br/>(SDK)
    participant B as 服务端<br/>(Platform)
    participant C as 数据库
    activate A
    A->>+A: 生成签名
    A->>+B: 调用服务

    activate B

    B->>+B: 有效期校验
    B->>+C: 查询SK

    activate C
    C-->>-B: 返回结果
    deactivate C
    
    B->>+B: 生成签名<br/>校验一致性
    B->>+B: 执行接口逻辑

    B-->>+C: 记录nonce

    activate C
    C-->>-B: 返回结果
    deactivate C

    deactivate B
    
    B-->>-A: 返回调用结果
    
    deactivate A
```

#### AK/SK认证例子 ####

设计ak/sk的请求参数

- platform_type：标明请求方是谁，即该例子中的ak
- time：请求时间，时间戳，将会被对应的sk配合加密算法进行加密，得到一个signature签名
- sign：签名，使用sk配合对应的加密算法后进行加密得到的签名。

当发送请求时，我们会带上这几个参数去请求接口，如请求 `https:///xxx.com/students?platform_type=school&time=1640494526&sign=54acba6857b284a8a481ed5913edd34d994721cc584305ff02c81bb3ced17212`

#### 实战 ####

实战阶段我们直接通过 MidwayJS 来完成，首先来🧠脑暴一下我们的AKSK实现思路，首先我们需要在数据库层面存储AKSK相关的数据记录；然后我们要有对这部数据增删改查的能力；其次需要实现我们上面两小节提到的签名校验能力，这部分可以通过中间件的形式实现。

最终，我们需要实现的整体代码架构如下

```mermaid
block
  columns 2

  block
    columns 2
    PassportMiddleware AKSKMiddleware
    Middleware:2
  end

  space

   block
    columns 2
    AKSKController  OtherController
    Controller:2
  end

space

  block
    columns 3
    UserService  AKSKService OtherService
    Service:3
  end

space

  block
    columns 3
    UserEntity  AKSKEntity OtherEntity
    Entity:3
  end

  style Middleware fill:transparent,stroke:transparent
  style Service fill:transparent,stroke:transparent
  style Controller fill:transparent,stroke:transparent
  style Entity fill:transparent,stroke:transparent
```

#### AKSK鉴权的中间件 ####

```ts
import { Middleware, IMiddleware, Logger, ILogger } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { AKSKService } from '../service/aksk.service';
import * as crypto from 'crypto';
 
const nonceList: Array<string> = [];
 
@Middleware()
export class AKSKMiddleware implements IMiddleware<Context, NextFunction> {
  @Logger()
  logger: ILogger;
 
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const akskService = await ctx.requestContext.getAsync<AKSKService>(
        AKSKService
      );
      const ak = ctx.get('x-ak');
      const nonce = ctx.get('x-nonce');
      const timestamp = ctx.get('x-timestamp');
      const signature = ctx.get('x-signature');
 
      if (!ak || !nonce || !timestamp || !signature) {
        this.logger.warn('缺少认证信息');
        ctx.status = 401;
        return { success: false, message: '无效请求' };
      }
 
      // 验证时间戳是否在有效期内（例如5分钟）
      const timestampNum = parseInt(timestamp);
      const now = Date.now();
      if (isNaN(timestampNum) || Math.abs(now - timestampNum) > 5 * 60 * 1000) {
        this.logger.warn('%s 请求过期, timestamp -> %s', ak, timestamp);
        ctx.status = 401;
        return { success: false, message: '无效请求' };
      }
 
      // TODO: 在实际生产环境中，这里应该使用Redis等存储nonce，防止重放攻击
      if (nonceList.includes(nonce)) {
        this.logger.warn('%s nonce已使用, nonce -> %s', ak, nonce);
        ctx.status = 401;
        return { success: false, message: '无效请求' };
      }
 
      // 保存nonce
      nonceList.push(nonce);
 
      const aksk = await akskService.getAKSKByAK(ak);
      // 使用sk对nonce和timestamp进行签名
      const hmac = crypto.createHmac('sha256', aksk.sk);
      hmac.update(nonce + timestamp);
      const calculatedSignature = hmac.digest('hex');
 
      // 验证签名
      const isValid = calculatedSignature === signature;
      if (!isValid) {
        ctx.status = 401;
        this.logger.warn('%s 签名验证失败', ak);
        return { success: false, message: '无效请求' };
      }
 
      return await next();
    };
  }
 
  static getName(): string {
    return 'aksk';
  }
}
```

这里我们按照上面的介绍的AKSK鉴权流程对timestamp、nonce和signature进行校验，其中nonce应该使用Redis等手段来存储，这里我们为了简化环境直接使用了数据保存。

为了验证我们的逻辑，我们编写一个测试文件来进行单元测试。

```ts
import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { Application, Framework } from '@midwayjs/koa';
import * as crypto from 'crypto';
 
describe('test/controller/api.test.ts', () => {
  let app: Application;
 
  const nonce = '1111123',
    timestamp = Date.now(),
    ak = '8527d2683fab2da4ac2a02d8be6c07d4',
    sk = 'd4a38df5a6e1b19d5c2853818cd7ac597fa5b87a8da8a1a0d6be54f2dc016724'
  const hmac = crypto.createHmac('sha256', sk);
  hmac.update(nonce + timestamp);
  const calculatedSignature = hmac.digest('hex');
 
  beforeAll(async () => {
    // 只创建一次 app，可以复用
    app = await createApp<Framework>();
  });
 
  afterAll(async () => {
    // close app
    await close(app);
  });
 
  it('normal get /api/get_user', async () => {
    // make request
    const result = await createHttpRequest(app)
      .get('/api/get_user')
      .set('x-ak', ak)
      .set('x-nonce', nonce)
      .set('x-timestamp', timestamp)
      .set('x-signature', calculatedSignature)
      .query({ uid: 1 });
 
    // use expect by jest
    expect(result.status).toBe(200);
    expect(result.body.message).toBe('OK');
  });
 
  it('replace get /api/get_user', async () => {
    // make request
    const result = await createHttpRequest(app)
      .get('/api/get_user')
      .set('x-ak', ak)
      .set('x-nonce', nonce)
      .set('x-timestamp', timestamp)
      .set('x-signature', calculatedSignature)
      .query({ uid: 1 });
 
    // use expect by jest
    expect(result.status).toBe(401);
    expect(result.body.message).toBe('无效请求');
  });
  
  it('time over get /api/get_user', async () => {
    // make request
    const result = await createHttpRequest(app)
      .get('/api/get_user')
      .set('x-ak', ak)
      .set('x-nonce', nonce)
      .set('x-timestamp', String(1737452047255))
      .set('x-signature', calculatedSignature)
      .query({ uid: 1 });
 
    // use expect by jest
    expect(result.status).toBe(401);
    expect(result.body.message).toBe('无效请求');
  });
});
```

## 性能压测对比 ##

| 方案  |  平均延时  |  CPU消耗  |   安全等级 |  适用场景 |
| :-------: | :---------: | :--------: | :----------: | :----------: |
| 基础JWT | 3ms | 15% | ★★☆ | 内部微服务 |
| OAuth2.0 | 35ms | 40% | ★★★☆ | 第三方开放平台 |
| Sa-Token | 5ms | 18% | ★★★ | 快速开发项目 |
| 网关统一鉴权 | 8ms | 25% | ★★★☆ | 多语言混合架构 |
| Token中继 | 12ms | 30% | ★★★ | 服务链调用 |
| JWE加密 | 45ms | 60% | ★★★★☆ | 金融敏感数据 |
| mTLS | 20ms | 50% | ★★★★★ | 零信任网络 |

> 测试环境：AWS c5.4xlarge 16核32GB × 3节点

## 安全攻防 ##

### 四大攻击手段及防御 ###

| 攻击类型  |  防御方案  |  代码实现  |
| :-------: | :---------: | :--------: |
| Token窃取 | 绑定设备指纹 | `StpUtil.getToken().setExtra("deviceId", fingerprint)` |
| 重放攻击 | Nonce校验+时间戳 | `redis.opsForValue().setIfAbsent(nonce, "used", 5, TimeUnit.SECONDS)` |
| 越权访问 | 动态权限校验 | `@SaCheckPermission("#user.id")` |
| Token破解 | 定期轮换签名密钥 | `Jwts.parserBuilder().setSigningKeyResolver(new KeyRotationResolver())` |

### 审计日志必备字段 ###

为了保证系统的操作安全，我们需要增加审计日志表。

审计日志必备字段如下：

```java
public class AuditLog {
    private String tokenId;      // Token唯一标识
    private String userId;       // 用户ID
    private String operation;    // 操作类型
    private String resource;     // 访问资源
    private String clientIp;     // 客户端IP
    private String deviceInfo;   // 设备信息
    private LocalDateTime time;  // 操作时间
}
```

## 5.方案如何选型？ ##

```mermaid
flowchart

需求-->安全级别
安全级别--极高-->双向TLS
安全级别--高-->JWE1[JWE加密]
安全级别--中-->网关统一鉴权

需求-->业务场景
业务场景--第三方登录-->OAuth2.0
业务场景--服务间调用-->Token中继
业务场景--快速开发-->Sa-Token

需求-->性能需求
性能需求-->|大于10万QPS|JWT&缓存
性能需求-->|小于10万QPS|JWE2[JWE加密]
```

## 总结 ##

- **初创期**：基础JWT+Redis方案
- **发展期**：OAuth2.0+网关鉴权
- **成熟期**：JWE加密+双向TLS
- **高级期**：零信任架构+AI风控

> 微服务安全如同城堡防御——单一的护城河无法阻挡所有入侵，需要城墙、箭塔、卫兵的多层防护。
> 
> 没有绝对安全的系统，只有不断提高的攻击成本。
