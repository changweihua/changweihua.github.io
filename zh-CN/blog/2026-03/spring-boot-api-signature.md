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
