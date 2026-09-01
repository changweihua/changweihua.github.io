---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot 实现许可证控制
description: SpringBoot 实现许可证控制
date: 2026-04-10 10:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 背景与需求 ##

在软件开发和商业化过程中，许可证控制是一个不可避免的技术需求。无论是企业级管理系统、桌面应用软件，还是SaaS服务，都需要对软件的使用范围、功能权限和时间限制进行有效管控。

许可证系统的核心价值在于：

- 保护知识产权：防止软件被非法复制和分发
- 商业模式支撑：支持按功能、按时间的差异化定价
- 用户管理：精确控制授权用户和使用范围
- 合规要求：满足企业对软件资产管理的需求

本文将介绍一个基于Spring Boot 4 + RSA2048非对称加密的许可证控制系统实现方案，具备硬件绑定、功能权限控制等。

## 设计思路 ##

### 技术设计 ###

许可证系统采用非对称加密的设计思路：厂商使用私钥对许可证信息进行数字签名，客户端使用对应的公钥验证签名的真实性。这种架构的优势在于：

1. 安全性高：私钥由厂商严格保管，公钥可以随软件分发，即使公钥泄露也无法伪造许可证
2. 部署简单：无需额外的许可证服务器，支持离线验证
3. 扩展性强：可以灵活添加各种验证规则和权限控制

### 技术选型 ###

#### 后端技术栈 ####

- Spring Boot 4.x：提供完整的Web服务框架和依赖注入
- Java Security API：利用JDK内置的RSA加密算法实现
- Jackson：处理JSON序列化和反序列化

#### 前端技术栈 ####

- 原生JavaScript：无框架依赖，保持轻量级
- TailwindCSS：快速构建现代化UI界面
- RESTful API：标准化的前后端交互

#### 加密算法 ####

- RSA2048：足够安全的非对称加密强度
- SHA256withRSA：数字签名算法
- Base64：签名结果编码格式

## 核心功能实现 ##

### 硬件指纹获取 ###

硬件绑定是许可证系统的重要安全特性，通过获取主板序列号实现设备唯一性识别。

```java
@Component
public class HardwareUtil {

    private static final Logger logger = LoggerFactory.getLogger(HardwareUtil.class);

    /**
     * 获取主板序列号，支持Windows和Linux系统
     */
    public String getMotherboardSerial() {
        String os = System.getProperty("os.name").toLowerCase();

        try {
            if (os.contains("windows")) {
                return getWindowsMotherboardSerial();
            } else if (os.contains("linux")) {
                return getLinuxMotherboardSerial();
            } else {
                logger.warn("不支持的操作系统: {}", os);
                return "UNKNOWN";
            }
        } catch (Exception e) {
            logger.error("获取主板序列号失败", e);
            return "UNKNOWN";
        }
    }

    /**
     * Windows系统通过WMI命令获取主板序列号
     */
    private String getWindowsMotherboardSerial() throws Exception {
        Process process = Runtime.getRuntime().exec("wmic baseboard get serialnumber");
        BufferedReader reader = new BufferedReader(
            new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8)
        );

        String line;
        while ((line = reader.readLine()) != null) {
            line = line.trim();
            if (!line.isEmpty() && !line.equals("SerialNumber")) {
                logger.debug("Windows主板序列号: {}", line);
                return line;
            }
        }

        reader.close();
        process.waitFor();
        return "UNKNOWN";
    }

    /**
     * Linux系统通过dmidecode命令获取主板序列号
     */
    private String getLinuxMotherboardSerial() throws Exception {
        try {
            // 优先使用dmidecode命令
            Process process = Runtime.getRuntime().exec("sudo dmidecode -s baseboard-serial-number");
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8)
            );

            String line = reader.readLine();
            reader.close();
            process.waitFor();

            if (line != null && !line.trim().isEmpty() && !line.contains("Not Specified")) {
                logger.debug("Linux主板序列号: {}", line.trim());
                return line.trim();
            }

            // 备选方案：读取系统文件
            return getLinuxMotherboardFromSys();

        } catch (Exception e) {
            logger.error("dmidecode命令执行失败", e);
            return getLinuxMotherboardFromSys();
        }
    }

    /**
     * 从/sys/class/dmi/id/board_serial文件读取主板序列号
     */
    private String getLinuxMotherboardFromSys() {
        try {
            Process process = Runtime.getRuntime().exec("cat /sys/class/dmi/id/board_serial");
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8)
            );

            String line = reader.readLine();
            reader.close();
            process.waitFor();

            if (line != null && !line.trim().isEmpty()) {
                logger.debug("Linux主板序列号(从sys读取): {}", line.trim());
                return line.trim();
            }

        } catch (Exception e) {
            logger.warn("从/sys文件读取失败", e);
        }

        return "UNKNOWN";
    }

    /**
     * 获取系统信息摘要，用于调试和展示
     */
    public String getSystemInfo() {
        return String.format("操作系统: %s %s, 架构: %s, 主板序列号: %s",
            System.getProperty("os.name"),
            System.getProperty("os.version"),
            System.getProperty("os.arch"),
            getMotherboardSerial()
        );
    }
}
```

这个实现的关键点

- 异常处理：获取失败时返回"UNKNOWN"而不是抛出异常，保证程序稳定性
- 多重备选：Linux下优先使用dmidecode，失败时尝试读取sys文件
- 编码处理：统一使用UTF-8编码避免乱码问题
- 日志记录：详细记录获取过程，便于问题排查

### RSA加密工具类 ###

RSA加密是整个系统的安全基石，需要提供密钥生成、签名、验签等完整功能。

```java
@Component
public class RSAUtil {

    private static final Logger logger = LoggerFactory.getLogger(RSAUtil.class);
    private static final String ALGORITHM = "RSA";
    private static final String SIGNATURE_ALGORITHM = "SHA256withRSA";
    private static final int KEY_SIZE = 2048;

    /**
     * 生成RSA密钥对
     */
    public KeyPair generateKeyPair() throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance(ALGORITHM);
        keyGen.initialize(KEY_SIZE);
        KeyPair keyPair = keyGen.generateKeyPair();
        logger.info("RSA密钥对生成成功，密钥长度: {} bits", KEY_SIZE);
        return keyPair;
    }

    /**
     * 使用私钥对数据进行数字签名
     */
    public String sign(String data, PrivateKey privateKey) throws Exception {
        Signature signature = Signature.getInstance(SIGNATURE_ALGORITHM);
        signature.initSign(privateKey);
        signature.update(data.getBytes(StandardCharsets.UTF_8));
        byte[] signedBytes = signature.sign();
        String result = Base64.getEncoder().encodeToString(signedBytes);
        logger.debug("数据签名完成，原始数据长度: {}, 签名长度: {}", data.length(), result.length());
        return result;
    }

    /**
     * 使用公钥验证数字签名
     */
    public boolean verify(String data, String signatureBase64, PublicKey publicKey) throws Exception {
        Signature signature = Signature.getInstance(SIGNATURE_ALGORITHM);
        signature.initVerify(publicKey);
        signature.update(data.getBytes(StandardCharsets.UTF_8));
        byte[] signatureBytes = Base64.getDecoder().decode(signatureBase64);
        boolean isValid = signature.verify(signatureBytes);
        logger.debug("签名验证结果: {}", isValid ? "通过" : "失败");
        return isValid;
    }

    /**
     * 将私钥转换为PEM格式字符串
     */
    public String privateKeyToPem(PrivateKey privateKey) {
        String encoded = Base64.getEncoder().encodeToString(privateKey.getEncoded());
        return "-----BEGIN PRIVATE KEY-----\n" +
                formatBase64String(encoded) +
                "\n-----END PRIVATE KEY-----";
    }

    /**
     * 将公钥转换为PEM格式字符串
     */
    public String publicKeyToPem(PublicKey publicKey) {
        String encoded = Base64.getEncoder().encodeToString(publicKey.getEncoded());
        return "-----BEGIN PUBLIC KEY-----\n" +
                formatBase64String(encoded) +
                "\n-----END PUBLIC KEY-----";
    }

    /**
     * 从PEM格式字符串加载私钥
     */
    public PrivateKey loadPrivateKeyFromPem(String pemContent) throws Exception {
        String privateKeyPEM = pemContent
                .replaceAll("-----\\w+ PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        byte[] decoded = Base64.getDecoder().decode(privateKeyPEM);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);
        KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);
        return keyFactory.generatePrivate(spec);
    }

    /**
     * 从PEM格式字符串加载公钥
     */
    public PublicKey loadPublicKeyFromPem(String pemContent) throws Exception {
        String publicKeyPEM = pemContent
                .replaceAll("-----\\w+ PUBLIC KEY-----", "")
                .replaceAll("\\s", "");

        byte[] decoded = Base64.getDecoder().decode(publicKeyPEM);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
        KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);
        return keyFactory.generatePublic(spec);
    }

    /**
     * 格式化Base64字符串，每64个字符换行
     */
    private String formatBase64String(String base64) {
        StringBuilder formatted = new StringBuilder();
        for (int i = 0; i < base64.length(); i += 64) {
            formatted.append(base64, i, Math.min(i + 64, base64.length())).append("\n");
        }
        return formatted.toString().trim();
    }
}
```

### 许可证数据模型 ###

许可证实体类定义了许可证包含的所有信息字段，使用Jackson注解控制JSON序列化顺序。

```java
@JsonPropertyOrder({"subject", "issuedTo", "hardwareId", "expireAt", "features"})
public class License {

    private String subject;        // 软件产品名称
    private String issuedTo;       // 许可证授权对象
    private String hardwareId;     // 绑定的硬件指纹

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expireAt;    // 许可证到期时间

    private List<String> features; // 授权的功能模块列表
    private String signature;      // 数字签名（序列化时排除）

    public License() {}

    public License(String subject, String issuedTo, String hardwareId,
                   LocalDate expireAt, List<String> features) {
        this.subject = subject;
        this.issuedTo = issuedTo;
        this.hardwareId = hardwareId;
        this.expireAt = expireAt;
        this.features = features;
    }

    // 完整的getter和setter方法
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getIssuedTo() { return issuedTo; }
    public void setIssuedTo(String issuedTo) { this.issuedTo = issuedTo; }

    public String getHardwareId() { return hardwareId; }
    public void setHardwareId(String hardwareId) { this.hardwareId = hardwareId; }

    public LocalDate getExpireAt() { return expireAt; }
    public void setExpireAt(LocalDate expireAt) { this.expireAt = expireAt; }

    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }

    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }

    @Override
    public String toString() {
        return "License{" +
                "subject='" + subject + '\'' +
                ", issuedTo='" + issuedTo + '\'' +
                ", hardwareId='" + hardwareId + '\'' +
                ", expireAt=" + expireAt +
                ", features=" + features +
                '}';
    }
}
```

### 许可证服务核心逻辑 ###

许可证服务是整个系统的业务核心，负责许可证的生成和验证逻辑。

```java
@Service
public class LicenseService {

    private static final Logger logger = LoggerFactory.getLogger(LicenseService.class);

    @Autowired
    private RSAUtil rsaUtil;

    @Autowired
    private HardwareUtil hardwareUtil;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * 生成许可证文件
     */
    public String generateLicense(License license, PrivateKey privateKey) throws Exception {
        // 自动填充硬件指纹
        if (license.getHardwareId() == null || license.getHardwareId().isEmpty()) {
            String hardwareId = hardwareUtil.getMotherboardSerial();
            license.setHardwareId(hardwareId);
            logger.info("自动获取硬件指纹: {}", hardwareId);
        }

        // 创建标准化的JSON数据用于签名
        String licenseData = createStandardizedLicenseJson(license);
        logger.debug("待签名的许可证数据: {}", licenseData);

        // 使用私钥对许可证数据进行签名
        String signature = rsaUtil.sign(licenseData, privateKey);

        // 创建包含签名的完整许可证
        JsonNode jsonNode = objectMapper.readTree(licenseData);
        ((ObjectNode) jsonNode).put("signature", signature);

        String result = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonNode);
        logger.info("许可证生成成功，授权给: {}, 到期时间: {}",
                   license.getIssuedTo(), license.getExpireAt());
        return result;
    }

    /**
     * 验证许可证的有效性
     */
    public LicenseVerifyResult verifyLicense(String licenseJson, PublicKey publicKey) {
        try {
            JsonNode jsonNode = objectMapper.readTree(licenseJson);

            // 检查是否包含签名字段
            if (!jsonNode.has("signature")) {
                return new LicenseVerifyResult(false, "许可证缺少数字签名");
            }
            String signature = jsonNode.get("signature").asText();

            // 移除签名字段，重构原始许可证数据
            ((ObjectNode) jsonNode).remove("signature");
            License license = objectMapper.readValue(jsonNode.toString(), License.class);

            // 重新生成标准化的JSON数据用于验证
            String licenseData = createStandardizedLicenseJson(license);
            logger.debug("验证用许可证数据: {}", licenseData);

            // 验证数字签名
            boolean signatureValid = rsaUtil.verify(licenseData, signature, publicKey);
            if (!signatureValid) {
                logger.warn("许可证数字签名验证失败");
                return new LicenseVerifyResult(false, "许可证数字签名无效");
            }

            // 验证硬件指纹
            String currentHardwareId = hardwareUtil.getMotherboardSerial();
            if (!currentHardwareId.equals(license.getHardwareId())) {
                logger.warn("硬件指纹不匹配 - 期望: {}, 实际: {}",
                           license.getHardwareId(), currentHardwareId);
                return new LicenseVerifyResult(false,
                    String.format("硬件指纹不匹配。许可证绑定设备: %s, 当前设备: %s",
                        license.getHardwareId(), currentHardwareId));
            }

            // 验证许可证有效期
            if (license.getExpireAt().isBefore(LocalDate.now())) {
                logger.warn("许可证已过期 - 到期时间: {}, 当前时间: {}",
                           license.getExpireAt(), LocalDate.now());
                return new LicenseVerifyResult(false,
                    String.format("许可证已过期。到期时间: %s, 当前时间: %s",
                        license.getExpireAt(), LocalDate.now()));
            }

            logger.info("许可证验证通过 - 授权对象: {}, 功能权限: {}",
                       license.getIssuedTo(), license.getFeatures());
            return new LicenseVerifyResult(true, "许可证验证成功", license);

        } catch (Exception e) {
            logger.error("许可证验证过程发生异常", e);
            return new LicenseVerifyResult(false, "许可证格式错误: " + e.getMessage());
        }
    }

    /**
     * 创建标准化的许可证JSON数据
     * 手动构建JSON确保字段顺序一致，这是签名验证成功的关键
     */
    private String createStandardizedLicenseJson(License license) throws Exception {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"subject\":\"").append(escapeJson(license.getSubject())).append("\",");
        json.append("\"issuedTo\":\"").append(escapeJson(license.getIssuedTo())).append("\",");
        json.append("\"hardwareId\":\"").append(escapeJson(license.getHardwareId())).append("\",");
        json.append("\"expireAt\":\"").append(license.getExpireAt().toString()).append("\",");
        json.append("\"features\":[");

        if (license.getFeatures() != null && !license.getFeatures().isEmpty()) {
            for (int i = 0; i < license.getFeatures().size(); i++) {
                if (i > 0) json.append(",");
                json.append("\"").append(escapeJson(license.getFeatures().get(i))).append("\"");
            }
        }

        json.append("]}");
        return json.toString();
    }

    /**
     * 转义JSON字符串中的特殊字符
     */
    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }

    /**
     * 许可证验证结果封装类
     */
    public static class LicenseVerifyResult {
        private final boolean valid;
        private final String message;
        private final License license;

        public LicenseVerifyResult(boolean valid, String message) {
            this(valid, message, null);
        }

        public LicenseVerifyResult(boolean valid, String message, License license) {
            this.valid = valid;
            this.message = message;
            this.license = license;
        }

        public boolean isValid() { return valid; }
        public String getMessage() { return message; }
        public License getLicense() { return license; }
    }
}
```

这个服务类的关键设计点

- 标准化JSON序列化：手动构建JSON确保字段顺序固定，解决Jackson序列化顺序不一致的问题
- 全面的验证逻辑：签名、硬件、时间三重验证确保安全性
- 详细的日志记录：记录关键操作和异常，便于问题诊断
- 异常处理：将所有异常转换为业务结果，保证系统稳定性

## REST API接口设计 ##

为了提供完整的许可证管理功能，设计了一套 RESTful API 接口。

```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LicenseController {

    private static final Logger logger = LoggerFactory.getLogger(LicenseController.class);

    @Autowired
    private LicenseService licenseService;

    @Autowired
    private KeyManagementService keyManagementService;

    @Autowired
    private HardwareUtil hardwareUtil;

    /**
     * 生成新的RSA密钥对
     */
    @PostMapping("/keys/generate")
    public ResponseEntity<Map<String, Object>> generateKeys() {
        try {
            Map<String, String> keys = keyManagementService.generateKeyPair();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", keys);
            response.put("message", "密钥对生成成功");

            logger.info("新的RSA密钥对生成成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("密钥生成失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "密钥生成失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 加载RSA密钥
     */
    @PostMapping("/keys/load")
    public ResponseEntity<Map<String, Object>> loadKeys(@RequestBody Map<String, String> request) {
        try {
            String privateKey = request.get("privateKey");
            String publicKey = request.get("publicKey");

            if (privateKey != null && !privateKey.trim().isEmpty()) {
                keyManagementService.loadPrivateKey(privateKey);
                logger.info("私钥加载成功");
            }

            if (publicKey != null && !publicKey.trim().isEmpty()) {
                keyManagementService.loadPublicKey(publicKey);
                logger.info("公钥加载成功");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "密钥加载成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("密钥加载失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "密钥加载失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 生成许可证
     */
    @PostMapping("/license/generate")
    public ResponseEntity<Map<String, Object>> generateLicense(@RequestBody License license) {
        try {
            if (!keyManagementService.isKeysLoaded()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "请先生成或加载RSA密钥");
                return ResponseEntity.badRequest().body(response);
            }

            String licenseJson = licenseService.generateLicense(
                license, keyManagementService.getCachedPrivateKey());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", licenseJson);
            response.put("message", "许可证生成成功");

            logger.info("为 {} 生成许可证成功", license.getIssuedTo());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("许可证生成失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "许可证生成失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 验证许可证
     */
    @PostMapping("/license/verify")
    public ResponseEntity<Map<String, Object>> verifyLicense(@RequestBody Map<String, String> request) {
        try {
            String licenseJson = request.get("licenseJson");

            if (licenseJson == null || licenseJson.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "许可证内容不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            if (!keyManagementService.isKeysLoaded()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "请先加载公钥");
                return ResponseEntity.badRequest().body(response);
            }

            LicenseService.LicenseVerifyResult result = licenseService.verifyLicense(
                licenseJson, keyManagementService.getCachedPublicKey());

            Map<String, Object> response = new HashMap<>();
            response.put("success", result.isValid());
            response.put("message", result.getMessage());
            if (result.getLicense() != null) {
                response.put("license", result.getLicense());
            }

            logger.info("许可证验证完成，结果: {}", result.isValid() ? "通过" : "失败");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("许可证验证过程异常", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "许可证验证失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 获取当前硬件信息
     */
    @GetMapping("/hardware/info")
    public ResponseEntity<Map<String, Object>> getHardwareInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);

        Map<String, String> hardwareInfo = new HashMap<>();
        hardwareInfo.put("motherboardSerial", hardwareUtil.getMotherboardSerial());
        hardwareInfo.put("systemInfo", hardwareUtil.getSystemInfo());
        hardwareInfo.put("osName", System.getProperty("os.name"));
        hardwareInfo.put("osVersion", System.getProperty("os.version"));
        hardwareInfo.put("osArch", System.getProperty("os.arch"));

        response.put("data", hardwareInfo);
        logger.debug("硬件信息查询完成");
        return ResponseEntity.ok(response);
    }

    /**
     * 检查密钥加载状态
     */
    @GetMapping("/keys/status")
    public ResponseEntity<Map<String, Object>> getKeysStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("keysLoaded", keyManagementService.isKeysLoaded());
        response.put("hasPrivateKey", keyManagementService.getCachedPrivateKey() != null);
        response.put("hasPublicKey", keyManagementService.getCachedPublicKey() != null);
        return ResponseEntity.ok(response);
    }
}
```

## 应用场景与集成 ##

### 许可证文件格式 ###

生成的许可证是一个标准的JSON文件，包含所有必要的授权信息和数字签名：

```json
{
  "subject": "企业管理系统",
  "issuedTo": "北京某某科技有限公司",
  "hardwareId": "BFEBFBFF000906E9",
  "expireAt": "2025-12-31",
  "features": ["USER_MANAGEMENT", "REPORT_EXPORT", "DATA_ANALYSIS"],
  "signature": "MEUCIQDxxx...完整的Base64签名"
}
```

### 字段说明 ###

- subject：软件产品的名称或标识
- issuedTo：许可证的授权对象（通常是公司名称）
- hardwareId：绑定的硬件指纹（主板序列号）
- expireAt：许可证的到期日期
- features：授权使用的功能模块列表
- signature：使用私钥生成的数字签名

### 功能权限控制 ###

基于许可证的功能权限控制可以通过AOP切面和自定义注解实现

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireFeature {
    /**
     * 需要的功能权限
     */
    String value();

    /**
     * 权限不足时的提示信息
     */
    String message() default "功能未授权";
}

@Component
@Aspect
@Order(1)
public class LicenseFeatureAspect {

    private static final Logger logger = LoggerFactory.getLogger(LicenseFeatureAspect.class);

    @Around("@annotation(requireFeature)")
    public Object checkFeaturePermission(ProceedingJoinPoint joinPoint, RequireFeature requireFeature) throws Throwable {

        // 获取当前许可证信息
        License currentLicense = LicenseContext.getCurrentLicense();

        if (currentLicense == null) {
            logger.warn("访问需要授权的功能，但未找到有效许可证: {}", requireFeature.value());
            throw new LicenseException("系统未找到有效许可证，请联系管理员");
        }

        // 检查功能权限
        if (currentLicense.getFeatures() == null ||
            !currentLicense.getFeatures().contains(requireFeature.value())) {

            logger.warn("功能权限不足 - 用户: {}, 需要权限: {}, 拥有权限: {}",
                       currentLicense.getIssuedTo(),
                       requireFeature.value(),
                       currentLicense.getFeatures());

            throw new LicenseException(requireFeature.message() + ": " + requireFeature.value());
        }

        logger.debug("功能权限验证通过: {}", requireFeature.value());
        return joinPoint.proceed();
    }
}

// 使用示例
@RestController
@RequestMapping("/api/report")
public class ReportController {

    @GetMapping("/export")
    @RequireFeature("REPORT_EXPORT")
    public ResponseEntity<byte[]> exportReport(@RequestParam String format) {
        // 报表导出功能实现
        byte[] reportData = generateReport(format);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=report." + format);

        return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
    }

    @PostMapping("/schedule")
    @RequireFeature("REPORT_SCHEDULE")
    public ResponseEntity<String> scheduleReport(@RequestBody ScheduleRequest request) {
        // 定时报表功能实现
        scheduleReportJob(request);
        return ResponseEntity.ok("定时报表创建成功");
    }
}
```

### Web管理界面 ###

本DEMO提供了一个完整的Web管理界面，具备以下功能：

- 硬件信息展示：实时显示当前设备的硬件指纹和系统信息
- 密钥管理：生成新的RSA密钥对，或加载现有密钥
- 许可证生成：创建包含各种权限的许可证文件
- 许可证验证：验证许可证的有效性和权限范围

主要的前端交互逻辑：

```javascript
// API基础配置
const API_BASE = 'http://localhost:8080/api';

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    loadHardwareInfo();
    checkKeyStatus();
    setDefaultExpireDate();
});

// 生成许可证
async function generateLicense() {
    try {
        // 收集表单数据
        const licenseData = {
            subject: document.getElementById('subject').value.trim(),
            issuedTo: document.getElementById('issuedTo').value.trim(),
            expireAt: document.getElementById('expireAt').value,
            features: document.getElementById('features').value.trim()
                .split(',').map(f => f.trim()).filter(f => f)
        };

        // 数据验证
        if (!licenseData.subject || !licenseData.issuedTo || !licenseData.expireAt) {
            showToast('警告', '请填写所有必填字段', 'warning');
            return;
        }

        showToast('处理中', '正在生成许可证...', 'info');

        // 调用API生成许可证
        const response = await fetch(`${API_BASE}/license/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(licenseData)
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('generatedLicense').value = result.data;
            showToast('成功', '许可证生成成功', 'success');
        } else {
            showToast('错误', result.message, 'error');
        }
    } catch (error) {
        console.error('生成许可证失败:', error);
        showToast('错误', '网络连接失败', 'error');
    }
}

// 验证许可证
async function verifyLicense() {
    try {
        const licenseJson = document.getElementById('licenseToVerify').value.trim();

        if (!licenseJson) {
            showToast('警告', '请输入许可证内容', 'warning');
            return;
        }

        showToast('处理中', '正在验证许可证...', 'info');

        const response = await fetch(`${API_BASE}/license/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseJson })
        });

        const result = await response.json();
        displayVerificationResult(result);

    } catch (error) {
        console.error('验证许可证失败:', error);
        showToast('错误', '验证过程出错', 'error');
    }
}
```

## 总结 ##

本文介绍了一套基于Spring Boot 4 + RSA2048的许可证控制系统实现方案，包含硬件指纹获取、数字签名验证、功能权限控制等核心功能，支持跨平台部署，提供完整的Web示例界面，适用于企业软件的商业化授权控制。
