---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot yml 配置敏感信息加密
description: 专为 Spring Boot 设计的 Elasticsearch 日志收集 Starter
date: 2026-03-19 08:55:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

在 Spring Boot 项目里运用 Jasypt 实现配置文件的加密。

## 第一步：添加依赖 ##

要在pom.xml文件中添加 Jasypt 的依赖。

```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>4.0.4</version>
</dependency>
```

## 第二步：配置加密密钥 ##

有两种方式可以配置加密密钥，分别是通过环境变量和命令行参数。

### 环境变量方式 ###

在application.properties或者application.yml中设置如下内容：

```ini
jasypt.encryptor.password=${JASYPT_ENCRYPTOR_PASSWORD}
```

### 命令行参数方式 ###

启动应用程序时，使用以下命令添加参数：

```bash
java -Djasypt.encryptor.password=your-secret-key -jar your-application.jar
```

## 第三步：生成加密值 ##

下面是一个工具类，可用于生成加密值：

```java
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.EnvironmentPBEConfig;

public class JasyptUtils {
    public static void main(String[] args) {
        // 加密密钥，实际使用时可通过环境变量或其他安全方式获取
        String password = "your-secret-key"; 
        String plainText = "需要加密的内容";

        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        EnvironmentPBEConfig config = new EnvironmentPBEConfig();
        
        config.setAlgorithm("PBEWithMD5AndDES");
        config.setPassword(password);
        encryptor.setConfig(config);
        
        String encryptedText = encryptor.encrypt(plainText);
        String decryptedText = encryptor.decrypt(encryptedText);
        
        System.out.println("原始文本: " + plainText);
        System.out.println("加密后: ENC(" + encryptedText + ")");
        System.out.println("解密后: " + decryptedText);
    }
}
```

## 第四步：在配置文件中使用加密值 ##

在配置文件里按照如下格式使用加密值：

```ini
# 数据库配置示例
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=ENC(加密后的用户名)
spring.datasource.password=ENC(加密后的密码)
```

## 第五步：验证配置 ##

启动应用程序时，要确保已经正确设置了加密密钥。Jasypt 会在应用启动时自动对加密值进行解密。

## 注意事项 ##

- 加密密钥属于敏感信息，不能硬编码在代码或者配置文件中。建议通过环境变量、CI/CD 工具或者 Kubernetes Secret 等安全方式来管理。

- 可以根据实际需求调整加密算法，例如使用更安全`PBEWITHHMACSHA512ANDAES_256`。

- 要妥善保管好加密密钥，一旦丢失，将无法对已加密的内容进行解密。

通过上述步骤，你就能在 Spring Boot 项目中安全地使用 Jasypt 对配置信息进行加密了。
