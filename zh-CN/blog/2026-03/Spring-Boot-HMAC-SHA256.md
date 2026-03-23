---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 遇上 HMAC-SHA256
description: API 安全大升级！
date: 2026-03-23 11:30:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 开篇引入 ##

在当今数字化浪潮汹涌澎湃的时代，网络安全已然成为企业和开发者无法回避的核心议题。随着 API 在各类系统交互中扮演着愈发关键的角色，其安全问题也日益凸显。想象一下，你的应用程序精心构建的 API 接口，就像一座繁忙都市中敞开大门的仓库，源源不断地与外界进行着数据的 “货物” 交换。但如果没有坚固的 “安保系统”，不法分子就可能趁虚而入，窃取珍贵的数据 “货物”，篡改交易记录，甚至让整个 “仓库” 陷入混乱。

近年来，API 攻击事件呈爆发式增长，从数据泄露到恶意篡改，给企业带来了巨大的损失和声誉风险。面对这些严峻的挑战，如何为 API 筑牢安全防线，确保数据在传输与交互过程中的安全性、完整性和真实性，成为了每一位开发者必须深入思考的问题。

今天，我们就来深入探讨一种在 Spring Boot 框架下，结合拦截器与 HMAC-SHA256 算法实现 API 安全验证的高效解决方案，为你的 API 打造坚不可摧的安全护盾。

## 基础知识科普 ##

在深入探讨具体的实现方案之前，我们先来夯实一下基础知识，了解 Spring Boot 拦截器和 HMAC-SHA256 算法各自的神奇之处。

### Spring Boot 拦截器 ###

Spring Boot 拦截器就像是 Spring MVC 框架中的 “交通警察”，站在请求进入 Controller 的必经之路上，对请求进行一系列的管控和引导 。它允许我们在请求处理的不同阶段，巧妙地插入自定义逻辑，实现诸如登录验证、权限控制、日志记录等重要功能。

当一个 HTTP 请求发送到 Spring Boot 应用时，它首先会经过一系列的过滤器，这些过滤器像是大楼门口的保安，负责进行一些通用的安全检查和初步处理。接着，请求就会来到拦截器的 “管辖范围”。拦截器主要作用于 Controller 层，它有三个核心方法，如同三把神奇的钥匙，分别掌控着不同阶段的 “秘密通道” ：

- `preHandle`：这个方法在 Controller 方法执行前被调用，是我们进行请求预处理的绝佳时机。比如，我们可以在这里验证用户的登录状态、检查请求参数的合法性等。如果返回 true，就像是给请求发放了一张 “通行证”，允许它继续前往 Controller；如果返回 false，则意味着拦截请求，请求的旅程就此终止，无法进入 Controller 层。就好比保安检查访客的证件，证件无误就放行，否则就拒绝进入。

- `postHandle`：当 Controller 方法执行完毕，但还未进行视图渲染时，postHandle 方法就会登场。在这个阶段，我们可以对 Controller 返回的 ModelAndView 对象进行一些定制化操作，比如添加额外的视图数据、修改视图名称等。不过在实际开发中，这个方法的使用频率相对较低，就像是一个隐藏的彩蛋，在特定的场景下才会发挥出独特的作用。

- `afterCompletion`：当整个请求处理完成，包括视图渲染也结束后，afterCompletion 方法便会被触发。它主要用于资源清理工作，比如关闭数据库连接、释放线程资源等，确保系统在请求处理结束后能够保持良好的 “状态”，不会留下任何 “垃圾”。

### HMAC-SHA256 算法 ###

HMAC-SHA256 算法，全称为 “Hash - based Message Authentication Code with SHA-256”，是一种基于哈希函数和密钥的消息认证码算法。它就像是一个精密的 “数据保镖”，能够同时为数据提供完整性保护和身份验证服务 。

从原理上讲，HMAC-SHA256 算法结合了哈希函数（这里使用的是 SHA - 256）和一个共享密钥。SHA-256 是一种安全的哈希算法，它能够将任意长度的数据转换为固定长度（256 位）的哈希值，这个哈希值就像是数据的 “指纹”，具有唯一性和不可逆性。哪怕原始数据只发生了一丁点的变化，生成的哈希值也会截然不同 。

HMAC-SHA256 算法的独特之处在于，它在哈希计算过程中引入了密钥。发送方使用共享密钥和原始数据一起计算出一个 HMAC 值，然后将这个 HMAC 值与数据一同发送给接收方。接收方在收到数据后，使用相同的密钥对接收到的数据进行同样的 HMAC 计算。如果计算得到的 HMAC 值与接收到的 HMAC 值完全一致，就说明数据在传输过程中没有被篡改，并且确实来自持有相同密钥的发送方，从而实现了数据的完整性验证和身份认证 。

HMAC-SHA256 算法在众多安全协议和应用场景中都有着广泛的应用。比如在 API 通信中，它常被用于对请求进行签名，防止请求被恶意篡改或伪造；在 TLS（传输层安全性）协议中，也依靠 HMAC-SHA256 来保障通信数据的安全。

## 为什么两者结合 ##

在了解了 Spring Boot 拦截器和 HMAC - SHA256 算法各自的特点后，你可能会好奇，为什么要将它们结合起来呢？让我们先来剖析一下传统 API 验证方式存在的痛点 。

传统的 API 验证方式，如基于 Session 或 Token 的认证，在一些场景下显得力不从心。以 Session 认证为例，它依赖于服务器端存储用户的会话信息，这在分布式系统中会带来诸多问题，比如 Session 共享的复杂性、服务器负载均衡时的会话一致性问题等 。而 Token 认证，虽然解决了 Session 的一些弊端，但如果 Token 在传输过程中被窃取，攻击者就可以利用它进行非法访问，因为 Token 本身并没有对请求内容进行完整性验证 。

再来看重放攻击的问题，传统验证方式往往难以有效防范。想象一下，攻击者截获了一个合法的 API 请求，然后不断重放这个请求，就可能导致重复的业务操作，比如重复下单、重复支付等，给企业和用户带来巨大的损失 。

Spring Boot 拦截器与 HMAC-SHA256 算法的结合，就像是为这些问题找到了一把 “万能钥匙” 。拦截器提供了一个统一的请求拦截和处理的入口，让我们可以在请求到达 Controller 之前，对请求进行全面的安全检查。而 HMAC-SHA256 算法则凭借其强大的身份验证和数据完整性保护能力，为请求的安全性提供了坚实的保障 。

通过将两者结合，我们可以实现以下关键目标：

- 身份验证：HMAC-SHA256 算法基于共享密钥生成签名，只有持有正确密钥的客户端才能生成有效的签名，从而验证请求的来源是否合法，确保只有授权的客户端能够访问 API 。

- 数据完整性保护：在请求传输过程中，任何对请求参数的篡改都会导致 HMAC-SHA256 签名的不一致。服务器在接收到请求后，通过重新计算签名并与客户端发送的签名进行比对，就可以轻松发现数据是否被篡改，保证数据的完整性 。

- 防止重放攻击：结合时间戳机制，我们可以在 HMAC-SHA256 签名中加入时间戳信息。服务器在验证签名时，不仅验证签名的正确性，还会检查时间戳是否在合理的时间范围内。如果请求的时间戳超出了允许的时间窗口，就说明这个请求可能是被重放的，服务器将拒绝处理该请求 。

在一个电商平台的 API 中，当用户进行下单操作时，请求中包含订单信息、用户 ID 等参数。如果没有安全验证，攻击者可能会截获这个下单请求，修改订单金额、收货地址等关键信息，然后重新发送给服务器。但如果我们采用了 Spring Boot 拦截器结合 HMAC-SHA256 算法的安全验证机制，攻击者的这些恶意行为将无处遁形。客户端在发送请求前，使用 HMAC-SHA256 算法对请求参数和时间戳进行签名，服务器接收到请求后，拦截器首先验证签名的有效性和时间戳的合理性，只有通过验证的请求才会被处理，从而确保了下单操作的安全性和准确性 。

## 实现步骤详解 ##

### 项目搭建 ###

首先，我们使用 Spring Initializr 来创建一个 Spring Boot 项目。在创建项目时，记得勾选 Spring Web 依赖，因为我们的 API 是基于 Web 的服务 。如果你使用 Maven 来管理项目依赖，在pom.xml文件中，你会看到类似这样的依赖配置：

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

如果使用 Gradle，则在 `build.gradle`文件中添加以下依赖：

```groovy
implementation 'org.springframework.boot:spring-boot-starter-web'
```

这些依赖将为我们的项目提供 Spring Web 开发所需的基本组件，包括 Spring MVC 框架、Tomcat 服务器等 。

### 编写签名工具类 ###

接下来，我们要编写一个签名工具类，用于生成签名和验证签名。在这个工具类中，我们会使用 HMAC-SHA256 算法来进行签名计算 。以下是一个签名工具类的示例代码：

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.TreeMap;

public class SignUtil {
    // 这里的SECRET_KEY需要和客户端约定好，并且妥善保管
    private static final String SECRET_KEY = "your_secret_key"; 
    private static final String HMAC_SHA256 = "HmacSHA256";

    /**
     * 生成签名
     * @param params 请求参数
     * @return 签名
     */
    public static String generateSign(Map<String, String> params) {
        try {
            // 使用TreeMap来确保参数按字典序排序
            Map<String, String> sortedParams = new TreeMap<>(params); 
            StringBuilder paramStr = new StringBuilder();
            for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
                paramStr.append(entry.getKey()).append(entry.getValue());
            }
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            byte[] signBytes = mac.doFinal(paramStr.toString().getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(signBytes);
        } catch (Exception e) {
            throw new RuntimeException("签名生成失败", e);
        }
    }

    /**
     * 验证时间戳有效性
     * @param timestamp 时间戳
     * @param tolerance 时间容忍度，单位为秒
     * @return 是否有效
     */
    public static boolean validateTimestamp(String timestamp, long tolerance) {
        try {
            long currentTime = System.currentTimeMillis() / 1000;
            long requestTime = Long.parseLong(timestamp);
            return Math.abs(currentTime - requestTime) <= tolerance;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
```

在这段代码中，`generateSign` 方法首先将请求参数按字典序排序，然后将排序后的参数拼接成一个字符串。接着，使用 HMAC-SHA256 算法对拼接后的字符串进行加密，并将生成的签名进行 Base64 编码后返回 。`validateTimestamp` 方法则用于验证时间戳的有效性，它会检查当前时间与请求中的时间戳之差是否在允许的时间容忍度范围内 。

### 创建拦截器 ###

有了签名工具类后，我们来创建一个拦截器，用于在请求到达 Controller 之前对请求进行签名验证和时间戳验证 。以下是拦截器的实现代码：

```java
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Component
public class SignInterceptor implements HandlerInterceptor {

    private static final String SIGN_HEADER = "sign";
    private static final String TIMESTAMP_HEADER = "timestamp";
    // 时间容忍度设置为60秒，可根据实际需求调整
    private static final long TIMESTAMP_TOLERANCE = 60; 

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 获取请求参数
        Map<String, String> params = new HashMap<>();
        Enumeration<String> paramNames = request.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            params.put(paramName, request.getParameter(paramName));
        }

        // 获取请求头中的签名和时间戳
        String sign = request.getHeader(SIGN_HEADER);
        String timestamp = request.getHeader(TIMESTAMP_HEADER);

        // 验证时间戳
        if (!SignUtil.validateTimestamp(timestamp, TIMESTAMP_TOLERANCE)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return false;
        }

        // 验证签名
        String generatedSign = SignUtil.generateSign(params);
        if (!generatedSign.equals(sign)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        // 验证通过，放行请求
        return true;
    }
}
```

在这个拦截器中，`preHandle` 方法首先获取请求中的所有参数，并将其存储在一个Map中 。然后，从请求头中获取签名和时间戳。接着，调用签名工具类中的 `validateTimestamp` 方法验证时间戳的有效性，调用 `generateSign` 方法生成签名，并与请求头中的签名进行比对 。如果时间戳无效或签名不一致，拦截器将返回`false`，阻止请求继续前进，并设置相应的 HTTP 状态码；如果验证通过，则返回`true`，允许请求到达 Controller 。

### 注册拦截器 ###

最后，我们需要在 Spring 的配置类中注册这个拦截器，并设置拦截路径和排除路径 。以下是配置类的代码示例：

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final SignInterceptor signInterceptor;

    public WebMvcConfig(SignInterceptor signInterceptor) {
        this.signInterceptor = signInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(signInterceptor)
               .addPathPatterns("/api/**") // 拦截所有以/api开头的请求
               .excludePathPatterns("/api/public/**"); // 排除/api/public开头的请求
    }
}
```

在这个配置类中，我们通过实现 `WebMvcConfigurer` 接口的 `addInterceptors` 方法来注册拦截器 。`addPathPatterns` 方法用于指定拦截器要拦截的路径，这里我们设置为 `/api/**`，表示拦截所有以 `/api`开头的请求； `excludePathPatterns` 方法用于指定不需要拦截的路径，这里我们排除了 `/api/public/**` 路径，即 `/api/public` 开头的请求不需要进行签名验证 。这样，我们就完成了 Spring Boot 拦截器结合 HMAC-SHA256 实现 API 安全验证的全部配置 。

### 客户端调用示例 ###

在完成服务端的配置后，客户端在调用 API 时，需要按照一定的规则准备请求参数、生成签名，并将签名和时间戳添加到请求头中 。下面是一个使用 Java 和 OkHttp 进行客户端调用的示例代码：

```java
import okhttp3.*;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class ApiClient {
    private static final String API_URL = "http://localhost:8080/api/your-endpoint";
    private static final String SECRET_KEY = "your_secret_key";
    private static final OkHttpClient client = new OkHttpClient();

    public static void main(String[] args) throws IOException {
        // 1. 准备请求参数
        Map<String, String> params = new HashMap<>();
        params.put("param1", "value1");
        params.put("param2", "value2");

        // 2. 生成时间戳
        String timestamp = String.valueOf(System.currentTimeMillis() / 1000);

        // 3. 生成签名
        params.put("timestamp", timestamp);
        String sign = SignUtil.generateSign(params);

        // 4. 设置请求头
        Request request = new Request.Builder()
               .url(API_URL)
               .addHeader("sign", sign)
               .addHeader("timestamp", timestamp)
               .build();

        // 5. 发送请求
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) throw new IOException("Unexpected code " + response);

            // 处理响应
            System.out.println(response.body().string());
        }
    }
}
```

在这段代码中，首先创建了一个包含请求参数的Map 。然后，获取当前时间戳并将其添加到参数中，接着调用之前编写的 `SignUtil.generateSign` 方法生成签名 。最后，使用 OkHttp 构建一个请求，将签名和时间戳添加到请求头中，并发送请求 。这样，客户端就可以与服务端进行安全的 API 交互了 。

## 注意事项与优化 ##

### 密钥管理 ###

密钥是 HMAC-SHA256 算法的核心，它的安全性直接关系到整个 API 安全验证体系的可靠性。一旦密钥泄露，攻击者就可以轻易地伪造签名，绕过安全验证，对 API 进行非法访问和恶意操作 。因此，必须高度重视密钥的安全存储和管理 。

- 避免硬编码：绝对不要在代码中硬编码密钥，因为硬编码的密钥很容易被发现和窃取。例如，将密钥直接写在代码文件中，一旦代码仓库泄露，密钥也就随之暴露 。

- 使用安全的存储方式：可以将密钥存储在环境变量中，在应用程序启动时读取环境变量获取密钥。在 Linux 系统中，可以通过export命令设置环境变量；在 Windows 系统中，可以在系统属性的环境变量设置中添加密钥 。也可以使用配置中心来管理密钥，如 Apollo、Nacos 等。这些配置中心提供了安全的密钥存储和管理功能，支持动态更新密钥，并且可以对不同的环境（开发、测试、生产）进行不同的配置 。

- 定期更换密钥：为了降低密钥泄露带来的风险，建议定期更换密钥。可以制定一个密钥更换计划，比如每季度或每半年更换一次密钥 。在更换密钥时，需要确保客户端和服务端都能及时更新密钥，并且要保证在密钥更换过程中 API 的正常运行 。

### 时间戳容忍度 ###

时间戳容忍度是指服务器允许请求时间戳与当前时间之间的最大时间差。合理设置时间戳容忍度对于防止重放攻击和确保系统的正常运行至关重要 。

- 容忍度设置过小的问题：如果时间戳容忍度设置得过小，比如只有几秒钟，那么由于网络延迟等原因，一些正常的请求可能会因为时间戳超出容忍范围而被误判为无效请求，导致用户体验变差 。在网络状况不佳的情况下，请求从客户端发送到服务器可能需要几十秒的时间，如果容忍度只有 5 秒，那么很多正常请求都会被拒绝 。

- 容忍度设置过大的问题：相反，如果时间戳容忍度设置得过大，比如几分钟甚至更长时间，那么攻击者就有更多的时间来重放请求，增加了系统遭受重放攻击的风险 。如果容忍度设置为 5 分钟，攻击者在这 5 分钟内都可以重放截获的请求，这对系统的安全性是一个巨大的威胁 。

- 根据业务场景调整：在实际应用中，需要根据业务场景的特点来合理调整时间戳容忍度。对于一些对安全性要求极高的业务，如金融交易类 API，可以将时间戳容忍度设置得相对较小，比如 30 秒到 1 分钟，以最大限度地降低重放攻击的风险 。而对于一些对实时性要求不是特别高的普通业务，如新闻资讯类 API，可以适当放宽时间戳容忍度，设置为 1 - 2 分钟，以减少因网络延迟等原因导致的正常请求被拒的情况 。

### 性能优化 ###

在实现 API 安全验证的过程中，性能也是一个需要重点关注的因素。以下是一些从算法效率、缓存机制等方面提出的性能优化建议 ：

- 算法效率优化：虽然 HMAC-SHA256 算法已经是一种比较高效的安全算法，但在高并发场景下，大量的签名计算和验证操作可能会对系统性能产生一定的影响 。可以考虑使用更高效的硬件或服务器来运行应用程序，充分利用硬件的多核处理器和高速内存，提高算法的执行效率 。另外，还可以对算法的实现进行优化，避免不必要的计算和内存开销。在签名工具类中，尽量减少字符串拼接的次数，因为字符串拼接在 Java 中会产生新的字符串对象，消耗内存和 CPU 资源 。

- 缓存机制：引入缓存机制可以减少重复的签名验证操作，提高系统的响应速度 。可以使用本地缓存（如 Guava Cache）或分布式缓存（如 Redis）来缓存已经验证过的签名和请求信息 。当有新的请求到达时，首先检查缓存中是否已经存在该请求的验证结果，如果存在，则直接返回验证结果，无需再次进行签名验证 。这样可以大大减少签名验证的次数，提高系统的性能 。不过，在使用缓存时，需要注意缓存的过期时间和一致性问题，确保缓存中的数据始终是最新和正确的 。

作者：小码哥_常
链接：https://juejin.cn/post/7619514074444824585
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
