---
lastUpdated: true
commentabled: true
recommended: true
title: Spring Boot 实现密码安全存储的5种方式
description: Spring Boot 实现密码安全存储的5种方式
date: 2026-03-18 11:35:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

项目开发中，密码安全存储是非常关键的一环。作为开发者，我们需要确保用户的密码在存储时被安全地加密，避免因数据泄露而造成严重后果。

## 为什么不能明文存储密码？ ##

首先，我们需要明确一点：*密码永远不能以明文形式存储在数据库中*。

原因如下：

- 数据泄露风险：如果数据库被攻击，所有用户的密码将直接暴露。
- 用户隐私保护：许多用户可能在多个平台使用相同的密码，明文存储会增加其他账户被攻破的风险。
- 法律与合规要求：许多安全标准（如 GDPR、OWASP 等）都明确禁止明文存储密码。

因此，密码在存储前必须进行加密或哈希处理，在 Spring Boot 中，以下是几种常见的密码安全存储方式。

## 使用 BCrypt 进行哈希 ##

### 什么是 BCrypt？ ###

BCrypt 是一种基于 Blowfish 加密算法的哈希函数，专为密码存储设计，具有以下特点：

- 内置加盐机制，避免彩虹表攻击。
- 支持设置计算复杂度，可增强哈希强度。
- 哈希结果固定为 60 个字符，方便存储。

### 如何使用 ###

引入依赖：如果未使用 Spring Security，需要单独引入 `spring-security-crypto`

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>
```

密码加密与验证：使用 BCryptPasswordEncoder 对密码进行加密与验证：

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordUtils {
    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // 加密密码
    public static String encode(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    // 验证密码
    public static boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}
```

使用示例

```java
public static void main(String[] args) {
    String rawPassword = "mypassword";
    String encodedPassword = PasswordUtils.encode(rawPassword);

    System.out.println("加密后的密码：" + encodedPassword);

    boolean isMatch = PasswordUtils.matches(rawPassword, encodedPassword);
    System.out.println("密码匹配结果：" + isMatch);
}
```

### 优缺点 ###

优点

- 安全性高，内置加盐机制。
- 使用简单，Spring Security 原生支持。

缺点

- 相较于其他哈希算法，性能略低。

## 使用 PBKDF2 进行哈希 ##

### 什么是 PBKDF2？ ###

PBKDF2（Password-Based Key Derivation Function 2）是一种基于密码的密钥派生函数，支持多次迭代计算，进一步增强安全性。

### 如何使用 ###

引入依赖：如果未使用 Spring Security，需要单独引入 `spring-security-crypto`

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>
```

实现密码加密与验证：

```java
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;

public class PasswordUtils {
    private static final Pbkdf2PasswordEncoder encoder = new Pbkdf2PasswordEncoder();

    // 加密密码
    public static String encode(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    // 验证密码
    public static boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}
```

使用示例：

```java
public static void main(String[] args) {
    String rawPassword = "mypassword";
    String encodedPassword = PasswordUtils.encode(rawPassword);

    System.out.println("加密后的密码：" + encodedPassword);

    boolean isMatch = PasswordUtils.matches(rawPassword, encodedPassword);
    System.out.println("密码匹配结果：" + isMatch);
}
```

### 优缺点 ###

优点

- 安全性高，可调节迭代次数。
- 广泛支持，兼容性好。

缺点

- 相较 BCrypt，使用稍显复杂。

## 使用 Argon2 进行哈希 ##

### 什么是 Argon2？ ###

Argon2 是一种密码哈希算法，2015 年获得密码哈希竞赛（Password Hashing Competition）冠军。它目前被认为是最安全的密码哈希算法之一。

### 如何使用 ###

引入依赖：如果未使用 Spring Security，需要引入 `spring-security-crypto`：

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>
```

### 实现密码加密与验证 ###

```java
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

public class PasswordUtils {
    private static final Argon2PasswordEncoder encoder = new Argon2PasswordEncoder();

    // 加密密码
    public static String encode(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    // 验证密码
    public static boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}
```

### 使用示例 ###

```java
public static void main(String[] args) {
    String rawPassword = "mypassword";
    String encodedPassword = PasswordUtils.encode(rawPassword);

    System.out.println("加密后的密码：" + encodedPassword);

    boolean isMatch = PasswordUtils.matches(rawPassword, encodedPassword);
    System.out.println("密码匹配结果：" + isMatch);
}
```

### 优缺点 ###

优点

- 安全性极高，专为现代硬件设计。
- 防御 GPU 加速的暴力破解。

缺点

- 算法较新，部分老旧系统可能不支持。

## SCrypt ##

### 什么是 SCrypt？ ###

SCrypt 是一种基于密码的密钥派生函数，尤其适用于限制硬件加速的攻击（如 GPU 加速的暴力破解）。它通过增加内存使用量，显著提高了破解成本。

### SCrypt 的特点 ###

- 高安全性：通过增加内存占用，防止大规模硬件加速的攻击。
- 参数可调：可以调整计算强度和内存使用量，适应不同的性能需求。

### 如何使用 ###

Spring Security 提供了对 SCrypt 的支持，可以直接使用 SCryptPasswordEncoder。

### 实现代码 ###

```java
import org.springframework.security.crypto.scrypt.SCryptPasswordEncoder;

public class PasswordUtils {
    private static final SCryptPasswordEncoder encoder = new SCryptPasswordEncoder();

    // 加密密码
    public static String encode(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    // 验证密码
    public static boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}
```

### 使用示例 ###

```java
public static void main(String[] args) {
    String rawPassword = "mypassword";
    String encodedPassword = PasswordUtils.encode(rawPassword);

    System.out.println("加密后的密码：" + encodedPassword);

    boolean isMatch = PasswordUtils.matches(rawPassword, encodedPassword);
    System.out.println("密码匹配结果：" + isMatch);
}
```

### 优缺点 ###

优点：

- 抗 GPU 攻击能力强。
- 参数可调，灵活性高。

缺点

- 性能较低，适合对安全性要求较高的场景。

## SHA-256 + Salt ##

### 什么是 SHA-256？ ###

SHA-256 是一种广泛使用的哈希算法，属于 SHA-2 家族。它生成固定长度的 256 位哈希值，计算速度快且实现简单。单独使用 SHA-256 不安全，因为它无法抵抗彩虹表攻击。因此，通常需要搭配 Salt（随机盐值） 使用。

### 实现原理 ###

- 加盐：为每个密码生成一个随机盐值，增加哈希结果的随机性。
- 迭代：多次循环计算，增加破解难度。

### 如何使用 ###

需要手动实现加盐和迭代逻辑，可以使用 Java 的 MessageDigest 类。

### 实现代码 ###

```java
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public class PasswordUtils {

    // 生成随机盐值
    public static String generateSalt() {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    // 使用 SHA-256 进行加密
    public static String hashPassword(String password, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String saltedPassword = salt + password;
            byte[] hash = digest.digest(saltedPassword.getBytes());
            for (int i = 0; i < 1000; i++) {  // 多次迭代
                hash = digest.digest(hash);
            }
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("加密失败", e);
        }
    }

    // 验证密码
    public static boolean matches(String rawPassword, String salt, String hashedPassword) {
        return hashPassword(rawPassword, salt).equals(hashedPassword);
    }
}
```

### 使用示例 ###

```java
public static void main(String[] args) {
    String rawPassword = "mypassword";
    String salt = PasswordUtils.generateSalt();
    String hashedPassword = PasswordUtils.hashPassword(rawPassword, salt);

    System.out.println("随机盐值：" + salt);
    System.out.println("加密后的密码：" + hashedPassword);

    boolean isMatch = PasswordUtils.matches(rawPassword, salt, hashedPassword);
    System.out.println("密码匹配结果：" + isMatch);
}
```

### 优缺点 ###

优点

- 实现简单，速度快。
- 可用于与旧系统兼容的场景。

缺点

- 安全性相对较低，需谨慎处理盐值。

## 总结 ##


|  加密方式   |    安全性  |   性能  |  适用场景  |
| :-----------: | :-----------: | :-----------: | :-----------: |
| BCrypt | 高 | 中等 |  通用场景，兼容性好  |
| PBKDF2 | 高 | 中等 |  高强度密码存储  |
| Argon2 | 极高 | 较低 |  对安全性要求极高的场景  |
| SCrypt | 极高 | 较低 |  防硬件加速攻击的场景  |
| SHA-256 + Salt | 中等 | 高 |  安全性不敏感的项目，如内部项目  |

### 推荐选择 ###

- 通用场景：推荐使用 BCrypt，它在性能和安全性之间达到了良好平衡。
- 高安全性需求：建议使用 Argon2 或 SCrypt。
- 安全性不敏感的系统：可以考虑 SHA-256 + Salt。
