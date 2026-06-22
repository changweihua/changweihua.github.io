---
lastUpdated: true
commentabled: true
recommended: true
title: HTTP 接口签名（防篡改）
description: HTTP 接口签名（防篡改）
date: 2026-03-16 08:45:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 实现原理 ##

在 Controller 的方法上，添加 `@ApiSignature` 注解，声明它需要签名。然后，通过 AOP 切面，ApiSignatureAspect 对这些方法进行拦截，校验签名是否正确。

```java
@GetMapping("/can-out/{id}")
@ApiSignature
public CommonResult<Boolean> canOut(@PathVariable("id") String customerNumber) {
    return success(customerService.getOutStockStatus(customerNumber));
}
```

## ApiSignatureAspect 拦截 ##

### 注解 ###

```java
/**
 * HTTP API 签名注解
 */
@Inherited
@Documented
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ApiSignature {

    /**
     * 同一个请求多长时间内有效 默认 60 秒
     */
    int timeout() default 60;

    /**
     * 时间单位，默认为 SECONDS 秒
     */
    TimeUnit timeUnit() default TimeUnit.SECONDS;

    // ========================== 签名参数 ==========================

    /**
     * 提示信息，签名失败的提示
     *
     * @see GlobalErrorCodeConstants#BAD_REQUEST
     */
    String message() default "签名不正确"; // 为空时，使用 BAD_REQUEST 错误提示

    /**
     * 签名字段：appId 应用ID
     */
    String appId() default "appId";

    /**
     * 签名字段：timestamp 时间戳
     */
    String timestamp() default "timestamp";

    /**
     * 签名字段：nonce 随机数，10 位以上
     */
    String nonce() default "nonce";

    /**
     * sign 客户端签名
     */
    String sign() default "sign";

}
```

### ApiSignatureAspect ###

```java
/**
 * 拦截声明了 {@link ApiSignature} 注解的方法，实现签名
 */
@Aspect
@Slf4j
@AllArgsConstructor
public class ApiSignatureAspect {

    private final ApiSignatureRedisDAO signatureRedisDAO;

    @Before("@annotation(signature)")
    public void beforePointCut(JoinPoint joinPoint, ApiSignature signature) {
        // 1. 验证通过，直接结束
        if (verifySignature(signature, Objects.requireNonNull(ServletUtils.getRequest()))) {
            return;
        }

        // 2. 验证不通过，抛出异常
        log.error("[beforePointCut][方法{} 参数({}) 签名失败]", joinPoint.getSignature().toString(),
                joinPoint.getArgs());
        throw new ServiceException(BAD_REQUEST.getCode(),
                StrUtil.blankToDefault(signature.message(), BAD_REQUEST.getMsg()));
    }

    public boolean verifySignature(ApiSignature signature, HttpServletRequest request) {
        // 1.1 校验 Header
        if (!verifyHeaders(signature, request)) {
            return false;
        }
        // 1.2 校验 appId 是否能获取到对应的 appSecret
        String appId = request.getHeader(signature.appId());
        String appSecret = signatureRedisDAO.getAppSecret(appId);
        Assert.notNull(appSecret, "[appId({})] 找不到对应的 appSecret", appId);

        // 2. 校验签名【重要！】
        String clientSignature = request.getHeader(signature.sign()); // 客户端签名
        String serverSignatureString = buildSignatureString(signature, request, appSecret); // 服务端签名字符串
        String serverSignature = DigestUtil.sha256Hex(serverSignatureString); // 服务端签名
        if (ObjUtil.notEqual(clientSignature, serverSignature)) {
            return false;
        }

        // 3. 将 nonce 记入缓存，防止重复使用（重点二：此处需要将 ttl 设定为允许 timestamp 时间差的值 x 2 ）
        String nonce = request.getHeader(signature.nonce());
        if (BooleanUtil.isFalse(signatureRedisDAO.setNonce(appId, nonce, signature.timeout() * 2, signature.timeUnit()))) {
            String timestamp = request.getHeader(signature.timestamp());
            log.info("[verifySignature][appId({}) timestamp({}) nonce({}) sign({}) 存在重复请求]", appId, timestamp, nonce, clientSignature);
            throw new ServiceException(GlobalErrorCodeConstants.REPEATED_REQUESTS.getCode(), "存在重复请求");
        }
        return true;
    }

    /**
     * 校验请求头加签参数
     * <p>
     * 1. appId 是否为空
     * 2. timestamp 是否为空，请求是否已经超时，默认 10 分钟
     * 3. nonce 是否为空，随机数是否 10 位以上，是否在规定时间内已经访问过了
     * 4. sign 是否为空
     *
     * @param signature signature
     * @param request   request
     * @return 是否校验 Header 通过
     */
    private boolean verifyHeaders(ApiSignature signature, HttpServletRequest request) {
        // 1. 非空校验
        String appId = request.getHeader(signature.appId());
        if (StrUtil.isBlank(appId)) {
            return false;
        }
        String timestamp = request.getHeader(signature.timestamp());
        if (StrUtil.isBlank(timestamp)) {
            return false;
        }
        String nonce = request.getHeader(signature.nonce());
        if (StrUtil.length(nonce) < 10) {
            return false;
        }
        String sign = request.getHeader(signature.sign());
        if (StrUtil.isBlank(sign)) {
            return false;
        }

        // 2. 检查 timestamp 是否超出允许的范围 （重点一：此处需要取绝对值）
        long expireTime = signature.timeUnit().toMillis(signature.timeout());
        long requestTimestamp = Long.parseLong(timestamp);
        long timestampDisparity = Math.abs(System.currentTimeMillis() - requestTimestamp);
        if (timestampDisparity > expireTime) {
            return false;
        }

        // 3. 检查 nonce 是否存在，有且仅能使用一次
        return signatureRedisDAO.getNonce(appId, nonce) == null;
    }

    /**
     * 构建签名字符串
     * <p>
     * 格式为 = 请求参数 + 请求体 + 请求头 + 密钥
     *
     * @param signature signature
     * @param request   request
     * @param appSecret appSecret
     * @return 签名字符串
     */
    private String buildSignatureString(ApiSignature signature, HttpServletRequest request, String appSecret) {
        SortedMap<String, String> parameterMap = getRequestParameterMap(request); // 请求头
        SortedMap<String, String> headerMap = getRequestHeaderMap(signature, request); // 请求参数
        String requestBody = StrUtil.nullToDefault(ServletUtils.getBody(request), ""); // 请求体
        return MapUtil.join(parameterMap, "&", "=")
                + requestBody
                + MapUtil.join(headerMap, "&", "=")
                + appSecret;
    }

    /**
     * 获取请求头加签参数 Map
     *
     * @param request   请求
     * @param signature 签名注解
     * @return signature params
     */
    private static SortedMap<String, String> getRequestHeaderMap(ApiSignature signature, HttpServletRequest request) {
        SortedMap<String, String> sortedMap = new TreeMap<>();
        sortedMap.put(signature.appId(), request.getHeader(signature.appId()));
        sortedMap.put(signature.timestamp(), request.getHeader(signature.timestamp()));
        sortedMap.put(signature.nonce(), request.getHeader(signature.nonce()));
        return sortedMap;
    }

    /**
     * 获取请求参数 Map
     *
     * @param request 请求
     * @return queryParams
     */
    private static SortedMap<String, String> getRequestParameterMap(HttpServletRequest request) {
        SortedMap<String, String> sortedMap = new TreeMap<>();
        for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
            sortedMap.put(entry.getKey(), entry.getValue()[0]);
        }
        return sortedMap;
    }
```

### ApiSignatureRedisDAO ###

```java
/**
 * HTTP API 签名 Redis DAO
 */
@AllArgsConstructor
public class ApiSignatureRedisDAO {

    private final StringRedisTemplate stringRedisTemplate;

    /**
     * 验签随机数
     * <p>
     * KEY 格式：signature_nonce:%s // 参数为 随机数
     * VALUE 格式：String
     * 过期时间：不固定
     */
    private static final String SIGNATURE_NONCE = "api_signature_nonce:%s:%s";

    /**
     * 签名密钥
     * <p>
     * HASH 结构
     * KEY 格式：%s // 参数为 appid
     * VALUE 格式：String
     * 过期时间：永不过期（预加载到 Redis）
     */
    private static final String SIGNATURE_APPID = "api_signature_app";

    // ========== 验签随机数 ==========

    public String getNonce(String appId, String nonce) {
        return stringRedisTemplate.opsForValue().get(formatNonceKey(appId, nonce));
    }

    public Boolean setNonce(String appId, String nonce, int time, TimeUnit timeUnit) {
        return stringRedisTemplate.opsForValue().setIfAbsent(formatNonceKey(appId, nonce), "", time, timeUnit);
    }

    private static String formatNonceKey(String appId, String nonce) {
        return String.format(SIGNATURE_NONCE, appId, nonce);
    }

    // ========== 签名密钥 ==========

    public String getAppSecret(String appId) {
        return (String) stringRedisTemplate.opsForHash().get(SIGNATURE_APPID, appId);
    }
    public void setAppSecret(String appId, String appSecret) {
        stringRedisTemplate.opsForHash().put(SIGNATURE_APPID, appId, appSecret);
    }
```

## 单元测试 ##

```java
**
 * {@link ApiSignatureTest} 的单元测试
 */
@ExtendWith(MockitoExtension.class)
public class ApiSignatureTest {
    @InjectMocks
    private ApiSignatureAspect apiSignatureAspect;

    @Mock
    private ApiSignatureRedisDAO signatureRedisDAO;

    @Test
    public void testSignatureGet() throws IOException {
        // 设置参数
        Long timestamp = System.currentTimeMillis();
        String nonce = IdUtil.randomUUID();
        String appId = "jdwl";
        String appSecret = "123456";
        // 准备请求参数
        Map<String, String[]> parameterMap = MapUtil.<String, String[]>builder()
                .put("v1", new String[]{"k1"})
                .put("k1", new String[]{"v1"})
                .build();
        // 准备请求体
        String requestBody = "test";
        
        // 模拟 ApiSignature 注解
        ApiSignature apiSignature = mockApiSignature();

        // 模拟 HttpServletRequest
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader(eq("appId"))).thenReturn(appId);
        when(request.getHeader(eq("timestamp"))).thenReturn(String.valueOf(timestamp));
        when(request.getHeader(eq("nonce"))).thenReturn(nonce);
        when(request.getParameterMap()).thenReturn(parameterMap);
        when(request.getContentType()).thenReturn("application/json");
        when(request.getReader()).thenReturn(new BufferedReader(new StringReader(requestBody)));

        // 模拟 RedisDAO
        when(signatureRedisDAO.getAppSecret(eq(appId))).thenReturn(appSecret);
        when(signatureRedisDAO.setNonce(eq(appId), eq(nonce), eq(120), eq(TimeUnit.SECONDS))).thenReturn(true);

        // 按照实际代码的逻辑构建签名
        SortedMap<String, String> parameterMapSorted = new TreeMap<>();
        parameterMap.forEach((key, values) -> parameterMapSorted.put(key, values[0]));

        SortedMap<String, String> headerMap = new TreeMap<>();
        headerMap.put("appId", appId);
        headerMap.put("timestamp", String.valueOf(timestamp));
        headerMap.put("nonce", nonce);

        String serverSignatureString = MapUtil.join(parameterMapSorted, "&", "=")
                + requestBody
                + MapUtil.join(headerMap, "&", "=")
                + appSecret;

        String sign = DigestUtil.sha256Hex(serverSignatureString);
        System.out.println("Generated Signature: " + sign);
        
        // 设置请求头中的签名为正确的值
        when(request.getHeader(eq("sign"))).thenReturn(sign);
        boolean result = apiSignatureAspect.verifySignature(apiSignature, request);
        // 断言结果
        assertTrue(result);
    }
    
    // 模拟 ApiSignature 注解
    private ApiSignature mockApiSignature() {
        ApiSignature apiSignature = mock(ApiSignature.class);
        when(apiSignature.appId()).thenReturn("appId"); // 这里应返回实际的参数名
        when(apiSignature.timestamp()).thenReturn("timestamp");
        when(apiSignature.nonce()).thenReturn("nonce");
        when(apiSignature.sign()).thenReturn("sign");
        when(apiSignature.timeout()).thenReturn(60);
        when(apiSignature.timeUnit()).thenReturn(TimeUnit.SECONDS);
        return apiSignature;
    }
}
```

## HTTP接口示例 ##

```java
  String validAccessToken = oauthAccessTokenRedisDAO.getValidAccessToken();
         long timeMillis = System.currentTimeMillis();
         String uuid = IdUtil.randomUUID();
         String appSecret = "123456";
         // 请求头
         SortedMap<String, String> headerMap = new TreeMap<>();
         headerMap.put("appId", "jdwl");
         headerMap.put("timestamp", String.valueOf(timeMillis));
         headerMap.put("nonce", uuid);
         // 请求参数
         SortedMap<String, String> parameterMap = new TreeMap<>();
         String requestBody ="";
         String serverSignatureString = MapUtil.join(parameterMap, "&", "=")
                 + requestBody
                 + MapUtil.join(headerMap, "&", "=")
                 + appSecret;
         String sign = DigestUtil.sha256Hex(serverSignatureString);
 ​
         CommonResult<BigDecimal> authorization = webClient.get()
                 .uri("/module-api/wms/customer/can-out/".concat("91440300MACP4LRF5K"))
                 .header("Authorization", "Bearer ".concat(validAccessToken))
                 .header("tenant-id", "0")
                 .header("appId", "jdwl")
                 .header("timestamp", String.valueOf(timeMillis))
                 .header("nonce", uuid)
                 .header("sign", sign)
                 .retrieve()
                 .bodyToMono(new ParameterizedTypeReference<CommonResult<BigDecimal>>() {
                 })
                 .block();
```

> Spring Boot拦截器结合HMAC-SHA256实现API安全验证

## 前言 ##

在开放平台和第三方集成的项目中，如何确保 API 调用的安全性和可靠性是一个重要课题。特别是对于没有用户登录场景的系统间调用，传统的session或token认证方式并不适用，数字签名技术就成为了一种理想的选择。

这种验证方式在开放平台、SaaS服务、微服务间调用等场景下特别实用，能够有效验证请求来源的合法性，防止参数被篡改和重放攻击。

本文将详细介绍如何基于 Spring Boot 拦截器和 HMAC-SHA256 算法，构建一套轻量级但足够安全的 API 验签机制。

## 什么是数字签名？ ##

数字签名是一种用于验证数据完整性和真实性的技术手段。在 API 调用中，数字签名通过以下方式保障安全：

1. 身份验证：确认请求方身份的合法性
2. 数据完整性：确保请求参数在传输过程中未被篡改
3. 防止重放攻击：通过时间戳等机制防止请求被重复使用

## 整体设计 ##

### 设计思路 ###

我们的验签机制基于以下核心思想：

- 无侵入性：通过 Spring Boot 拦截器实现，业务代码无需改动
- 算法安全性：采用业界成熟的 HMAC-SHA256 算法
- 配置灵活：支持多客户端、多密钥管理

### 架构流程图 ###

```txt
  客户端请求 → 生成签名 → 发送请求 → 拦截器验证 → 业务处理
     ↓              ↓           ↓           ↓           ↓
  [参数整理]    [HMAC加密]  [携带签名头]  [验签逻辑]  [通过/拒绝]
     ↓              ↓           ↓           ↓           ↓
   参数排序    +时间戳加密   X-API-Key    密钥匹配    正常响应
     ↓              ↓           ↓           ↓           ↓
   拼接参数    Base64编码   X-Timestamp  时间戳验证   或返回401
     ↓              ↓           ↓           ↓
   待签字符串    完整签名     X-Signature  签名对比
```

## HMAC-SHA256 签名原理 ##

HMAC（Hash-based Message Authentication Code，基于哈希的消息认证码）结合了哈希函数和密钥，提供了一种安全高效的消息认证方式。

### 签名生成算法 ###

```txt
签名 = Base64(HMAC-SHA256(时间戳 + 排序后的请求参数, 密钥))
```

### 算法步骤 ###

1. 参数标准化：将所有请求参数按字典序排序
2. 数据拼接：将时间戳和排序后的参数按规则拼接
3. 签名运算：使用密钥对拼接字符串进行 HMAC-SHA256 运输
4. 编码转换：对加密结果进行 Base64 编码生成最终签名

## 核心组件实现 ##

### 签名工具类 ###

签名工具类是整个机制的核心，负责签名的生成和验证逻辑

```java
public class SignatureUtil {

    /**
     * 生成签名
     * 签名算法：Base64(HMAC-SHA256(timestamp + sortedParams, secret))
     */
    public static String generateSignature(Map<String, Object> params,
                                         String timestamp, String secret) {
        // 参数排序并拼接
        String sortedParams = sortParams(params);
        String dataToSign = timestamp + sortedParams;

        // HMAC-SHA256加密并Base64编码
        HMac hmac = new HMac(HmacAlgorithm.HmacSHA256, secret.getBytes(StandardCharsets.UTF_8));
        byte[] digest = hmac.digest(dataToSign);
        return Base64.getEncoder().encodeToString(digest);
    }

    /**
     * 验证时间戳有效性（防重放攻击）
     */
    public static boolean validateTimestamp(String timestamp, long tolerance) {
        long requestTime = Long.parseLong(timestamp);
        long currentTime = System.currentTimeMillis() / 1000;
        return Math.abs(currentTime - requestTime) <= tolerance;
    }
}
```

### 拦截器 ###

拦截器负责对所有受保护接口进行统一的签名验证

```java
@Component
public class SignatureValidationInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 1. 获取签名头信息
        String timestamp = request.getHeader("X-Timestamp");
        String signature = request.getHeader("X-Signature");
        String apiKey = request.getHeader("X-Api-Key");

        // 2. 验证必要参数
        if (!StringUtils.hasText(timestamp) || !StringUtils.hasText(signature) || !StringUtils.hasText(apiKey)) {
            return writeErrorResponse(response, "Missing required signature headers");
        }

        // 3. 验证时间戳（防重放攻击）
        if (!SignatureUtil.validateTimestamp(timestamp, timeTolerance)) {
            return writeErrorResponse(response, "Invalid timestamp");
        }

        // 4. 获取密钥并验证签名
        String secret = securityProperties.getApiSecret(apiKey);
        if (secret == null || !SignatureUtil.verifySignature(extractParams(request), timestamp, secret, signature)) {
            return writeErrorResponse(response, "Invalid signature");
        }

        return true; // 验证通过，继续处理请求
    }
}
```

### 配置类（WebMvcConfig） ###

配置类负责将拦截器集成到 Spring Boot 的请求处理链中：

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(signatureValidationInterceptor)
                .addPathPatterns("/api/**")              // 拦截所有API请求
                .excludePathPatterns("/api/public/**");  // 排除公开接口
    }
}
```

## 客户端调用示例 ##

### 请求头设置 ###

客户端需要在请求头中包含三个必要字段：

- X-Api-Key：客户端标识
- X-Timestamp：当前时间戳（秒级）
- X-Signature：生成的签名

### 完整调用流程 ###

```java
// 1. 准备请求参数
Map<String, Object> params = new HashMap<>();
params.put("userId", "12345");
params.put("type", "profile");

// 2. 生成签名
String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
String signature = SignatureUtil.generateSignature(params, timestamp, "your-secret");

// 3. 设置请求头并发送请求
Headers headers = new Headers();
headers.set("X-Api-Key", "client1");
headers.set("X-Timestamp", timestamp);
headers.set("X-Signature", signature);

// GET /api/protected/data?userId=12345&type=profile
```

## 安全性设计要点 ##

### 防重放攻击 ###

- 时间戳验证：服务端验证时间戳的有效性（默认容忍度5分钟）
- 唯一性保证：相同参数在不同时间戳下生成不同签名
- 配置灵活：可根据业务需求调整容忍时间

### 密钥管理 ###

- 多客户端支持：每个客户端使用独立的 API Key 和密钥
- 配置化管理：通过配置文件或其他存储组件统一管理密钥映射
- 定期轮换：建议定期更换密钥以提升安全性

### 日志审计 ###

- 请求日志：记录验证失败的关键信息（不包含完整签名）
- IP追踪：记录客户端真实IP地址
- 安全预警：异常签名验证触发告警机制

## 安全性增强建议 ##

### 传输层安全 ###

- HTTPS强制：所有API请求必须通过HTTPS传输
- 证书验证：启用双向证书认证增加安全性
- 协议升级：及时更新SSL/TLS协议版本

### 密钥管理优化 ###

```java
// 生成安全密钥（32位随机字符串）
public static String generateSecureKey() {
    String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    SecureRandom random = SecureRandom.getInstanceStrong();
    StringBuilder sb = new StringBuilder();

    for (int i = 0; i < 32; i++) {
        sb.append(chars.charAt(random.nextInt(chars.length())));
    }

    return sb.toString();
}
```

### 请求限流 ###

建议结合 Redis 实现请求限流，防止暴力破解：

```java
// 简限流逻辑示例
String rateLimitKey = "api_limit:" + apiKey;
long count = redisTemplate.opsForValue().increment(rateLimitKey);
if (count > 100) { // 每分钟限制100次请求
    return writeErrorResponse(response, "Too many requests");
}
```

## 测试验证 ##

### 正常流程测试 ###

```bash
# 使用curl测试（需要先根据参数生成签名）
timestamp=$(date +%s)
signature=$(生成签名逻辑)
curl -X GET "http://localhost:8080/api/protected/data?userId=12345" \
  -H "X-Api-Key: client1" \
  -H "X-Timestamp: $timestamp" \
  -H "X-Signature: $signature"
```

### 异常场景测试 ###

- 签名错误：修改参数但不更新签名
- 时间戳过期：使用过期的时间戳
- 密钥错误：使用错误的API Key
- 缺少头信息：缺少必要的请求头

## 总结 ##

通过 Spring Boot 拦截器和 HMAC-SHA256 算法，我们实现了一套完整且实用的 API 签名验证方案。这套机制有效解决了系统间调用的安全问题，而且对现有代码几乎零侵入，直接复用即可。

在实际项目中，你可以根据具体需求调整时间戳容忍度、密钥管理策略等配置，实现灵活的安全控制。
