---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot敏感配置项加密与解密实战
description: SpringBoot敏感配置项加密与解密实战
date: 2026-04-02 09:15:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

## 一、为什么要加密配置？ ##

先说说SpringBoot的配置加载机制。我们知道，SpringBoot支持多种配置加载方式，优先级从高到低大概是：

- 命令行参数
- 环境变量
- application-{profile}.yml
- application.yml
- @ConfigurationProperties注解

不管用哪种方式，敏感信息（比如数据库密码、Redis密码、第三方API密钥）如果明文存储，都会有泄露风险：

- 开发环境：本地配置文件可能被传到Git
- 测试环境：测试服务器可能被非授权访问
- 生产环境：配置文件权限管理不当，被运维人员误看

更重要的是，《网络安全法》明确要求对敏感信息进行加密存储。去年某银行就因为数据库密码明文存储被罚款200万。

所以，给配置文件加密不是选择题，是必答题。

## 二、方案一：Jasypt集成（推荐） ##

Jasypt是SpringBoot生态中相对成熟的配置加密工具，开箱即用，配置简单。

### 添加依赖 ###

添加Jasypt依赖

```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.5</version>
</dependency>
```

### 配置加密密钥 ###

在application.yml中添加Jasypt配置：

```yaml
jasypt:
  encryptor:
    password: ${ENCRYPT_KEY}  # 密钥从环境变量获取
    algorithm: PBEWithHMACSHA512ANDAES_256  # 推荐使用强加密算法
    iv-generator-classname: org.jasypt.iv.RandomIvGenerator
```

划重点：密钥千万不要写在配置文件里！这里用环境变量 `${ENCRYPT_KEY}`，Docker部署时通过 `-e ENCRYPT_KEY=xxx` 传入。

### 加密敏感配置 ###

用Jasypt提供的命令行工具加密明文密码：

```bash
# 下载jasypt-cli包
wget https://github.com/jasypt/jasypt/releases/download/jasypt-1.9.3/jasypt-1.9.3-dist.zip
unzip jasypt-1.9.3-dist.zip

# 执行加密命令（密钥用你的实际密钥替换）
java -cp jasypt-1.9.3/lib/jasypt-1.9.3.jar org.jasypt.intf.cli.JasyptPBEStringEncryptionCLI input="你的明文密码" password=你的密钥(32字节) algorithm=PBEWithHMACSHA512ANDAES_256 ivGeneratorClassName=org.jasypt.iv.RandomIvGenerator
```

执行后会输出加密后的密文，类似这样：

```txt
----ENVIRONMENT-----------------
Runtime: OpenJDK 64-Bit Server VM 11.0.18+10

----ARGUMENTS-------------------
input: 你的明文密码
password: 你的密钥
algorithm: PBEWithHMACSHA512ANDAES_256

----OUTPUT----------------------
加密后的密文
```

### 在配置文件中使用密文 ###

把加密后的密文用 `ENC()` 包裹，放到配置文件里：

```yaml 体验AI代码助手 代码解读复制代码spring:
  datasource:
    url: jdbc:mysql://prod-db:3306/order_db
    username: root
    password: ENC(加密后的密文)  # 用ENC()包裹
```

### 启动应用 ###

启动时传入密钥：

```bash
java -jar app.jar -Djasypt.encryptor.password=你的密钥
# 或者用环境变量
ENCRYPT_KEY=你的密钥 
java -jar app.jar
```

## 三、方案二：自定义加密解密（适合有特殊需求） ##

如果Jasypt满足不了你的需求（比如要对接企业内部的密钥管理系统），可以自己实现加密解密逻辑。

比如，某些时候项目需要用国密算法SM4，Jasypt不支持，就需要自定义个解密处理器。

### 实现思路 ###

SpringBoot启动时会加载配置文件，我们可以通过自定义PropertySource，在配置被读取前进行解密。

### 代码实现 ###

#### 第一步：创建加密工具类 ####

```java
package com.example.config.encrypt;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.security.Security;
import java.util.Base64;

/**
 * 国密SM4加密工具类
 * 依赖bcprov-jdk15on
 */
public class SM4Utils {
    static {
        Security.addProvider(new BouncyCastleProvider());
    }
    
    private static final String ALGORITHM_NAME = "SM4";
    private static final String ALGORITHM_NAME_ECB_PADDING = "SM4/ECB/PKCS7Padding";
    private SecretKeySpec secretKeySpec;
    private Cipher cipher;

    public SM4Utils(String key) {
        try {
            secretKeySpec = new SecretKeySpec(key.getBytes(), ALGORITHM_NAME);
            cipher = Cipher.getInstance(ALGORITHM_NAME_ECB_PADDING, "BC");
        } catch (Exception e) {
            throw new RuntimeException("初始化SM4加密工具失败", e);
        }
    }

    // 加密
    public String encrypt(String plainText) {
        try {
            cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
            byte[] encrypted = cipher.doFinal(plainText.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("SM4加密失败", e);
        }
    }

    // 解密
    public String decrypt(String cipherText) {
        try {
            cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(cipherText));
            return new String(decrypted);
        } catch (Exception e) {
            throw new RuntimeException("SM4解密失败", e);
        }
    }
}
```

#### 第二步：创建自定义PropertySource ####

```java
package com.example.config.encrypt;

import org.springframework.core.env.PropertySource;

/**
 * 自定义加密配置源
 * 解密以"sm4:"开头的配置项
 */
public class Sm4EncryptedPropertySource extends PropertySource<Object> {
    private final PropertySource<?> source;
    private final SM4Utils sm4Utils;

    public Sm4EncryptedPropertySource(String name, PropertySource<?> source, String key) {
        super(name);
        this.source = source;
        this.sm4Utils = new SM4Utils(key);
    }

    @Override
    public Object getProperty(String name) {
        Object value = source.getProperty(name);
        if (value instanceof String) {
            String strValue = (String) value;
            // 解密以"sm4:"开头的配置
            if (strValue.startsWith("sm4:")) {
                String cipherText = strValue.substring(4);
                return sm4Utils.decrypt(cipherText);
            }
        }
        return value;
    }
}
```

#### 第三步：注册PropertySource ####

```java
package com.example.config.encrypt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.PropertySource;

/**
 * 环境后置处理器，注册自定义PropertySource
 */
public class EncryptedEnvironmentPostProcessor implements EnvironmentPostProcessor {
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        MutablePropertySources propertySources = environment.getPropertySources();
        
        // 从环境变量获取SM4密钥
        String sm4Key = environment.getProperty("SM4_KEY");
        if (sm4Key == null) {
            throw new RuntimeException("环境变量SM4_KEY未配置");
        }
        
        // 遍历所有PropertySource，包装需要解密的配置
        for (PropertySource<?> source : propertySources) {
            if (source.getName().contains("application.yaml")) {
                propertySources.replace(source.getName(), 
                    new Sm4EncryptedPropertySource(source.getName(), source, sm4Key));
            }
        }
    }
}
```

#### 第四步：配置spring.factories ####

在 `src/main/resources/META-INF/spring.factories` 中注册后置处理器：

```ini
org.springframework.boot.env.EnvironmentPostProcessor=com.example.config.encrypt.EncryptedEnvironmentPostProcessor
```

### 使用方式 ###

在配置文件中用sm4:前缀标识需要加密的配置：

```yaml
spring:
  datasource:
    password: sm4:加密后的密文  # 用SM4加密
```

启动时传入密钥：

```bash
SM4_KEY=你的密钥 
java -jar app.jar
```

### SpringBoot 4 ###

```java
package net.cmono.xiyue.encrypt;

import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.PropertySource;
import org.springframework.stereotype.Component;

/**
 * 环境事件监听器，在 Environment 准备完成后注册自定义 PropertySource
 * 替代 Spring Boot 2.x 中的 EnvironmentPostProcessor
 */
@Component
public class EncryptedConfigListener implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {

    @Override
    public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
        ConfigurableEnvironment environment = event.getEnvironment();
        MutablePropertySources propertySources = environment.getPropertySources();

        // 从环境变量获取 SM4 密钥
        String sm4Key = environment.getProperty("SM4_KEY");
        if (sm4Key == null) {
            throw new RuntimeException("环境变量 SM4_KEY 未配置");
        }

        // 遍历所有 PropertySource，包装需要解密的配置
        for (PropertySource<?> source : propertySources) {
            // 可根据需要指定要包装的源名称，如 application.yaml
            if (source.getName().contains("application.yaml")) {
                propertySources.replace(source.getName(),
                        new Sm4EncryptedPropertySource(source.getName(), source, sm4Key));
            }
        }
    }
}
```

### 适用场景 ###

- 需要更灵活的自定义敏感数据加解密逻辑
- 需要对接企业内部密钥管理系统（如从数据库/接口获取密钥）
- 需要更细粒度的解密控制（如按配置项类型解密）

## 四、从开发到生产的完整流程 ##

### 开发环境 ###

- 用Jasypt加密，密钥存在本地环境变量
- IDEA配置Run Configuration，自动注入密钥
- Gitignore过滤所有包含密钥的配置文件

### 测试环境 ###

- Jenkins Pipeline从凭据管理获取密钥
- 构建时自动加密配置文件
- 部署时通过环境变量注入密钥

### 生产环境 ###

- 密钥可以存储在阿里云KMS
- 应用启动时通过IAM角色获取密钥
- 配置文件通过Ansible或其他方式统一分发

### 验证方法 ###

部署后一定要验证配置是否解密成功，可以写个简单的接口：

```java
@RestController
public class ConfigTestController {
    @Value("${spring.datasource.password}")
    private String dbPassword;

    @GetMapping("/test/config")
    public String testConfig() {
        // 打印脱敏后的密码（只显示前3位和后3位）
        if (dbPassword.length() > 6) {
            return "密码解密成功：" + dbPassword.substring(0, 3) + "******" + dbPassword.substring(dbPassword.length() - 3);
        }
        return "密码解密成功";
    }
}
```

## 五、总结 ##

- 密钥管理：密钥必须与配置文件分离，优先用环境变量或专用密钥管理服务（如阿里云KMS）
- 算法选择：优先使用强加密算法（如AES-256、SM4），避免MD5、DES等弱算法
- 多环境隔离：开发/测试/生产环境使用不同密钥，定期轮换
- 权限控制：配置文件权限设为600，仅应用进程可读写
- 审计日志：记录配置解密操作，方便追溯

> 最后提醒一句：配置加密不是银弹，还需要配合代码审计、服务器安全加固等措施，才能真正保障系统安全。
