---
lastUpdated: true
commentabled: true
recommended: true
title: Java AES-GCM 加解密入门
description: 理解原理与字符串实战
date: 2026-11-24 10:15:00
pageClass: blog-page-class
cover: /covers/java.svg
---

加密将原始内容转换为密文，解密则让持有正确密钥的人恢复原文。本文使用 JDK 自带 API，先解释基本概念，再提供字符串加解密的完整实例，不依赖框架或外部服务。

示例要求 Java 17 及以上版本，其中 HexFormat 用于在字节数组和十六进制文本之间转换。文中的完整示例可独立运行；短代码片段用于解释步骤，不需要分别创建文件。

## AES、密钥和 Cipher 是什么关系？ ##

AES 是对称加密算法：加密和解密使用同一把密钥。算法规定怎样运算，密钥决定使用哪把“钥匙”，Cipher 是 Java 中实际执行运算的工具。

```text
明文 + 密钥 → 加密 → 密文
密文 + 密钥 → 解密 → 明文
```

这里的加号表示参与运算，不是拼接字符串。AES 内部通过多轮字节替换、位置变换和轮密钥相关运算处理数据，开发时由密码学实现完成这些步骤，不需要自己手写算法。

AES 的分组大小固定为 128 位（16 字节），密钥支持以下长度；分组大小与密钥长度不是同一个概念。

| 密钥长度 | 字节数 | 轮数 |
| :--- | :---: | :---: |
| 128 位 | 16 | 10 |
| 192 位 | 24 | 12 |
| 256 位 | 32 | 14 |

SecretKey 是 Java 中表示对称密钥的接口；KeyGenerator 是生成密钥的工具。以下片段展示随机密钥的生成方式，完整导入见第四节：

```java
KeyGenerator generator = KeyGenerator.getInstance("AES");
generator.init(256);
SecretKey key = generator.generateKey();
```

已有合法密钥字节时，可以用 `new SecretKeySpec(keyBytes, "AES")` 包装。SecretKeySpec 不生成随机性，也不负责从普通密码派生安全密钥。不要简单截取密码前 16 个字节。若密钥来自用户输入的密码，应使用成熟的密码派生方案，例如 PBKDF2；其中盐是每次派生所用的随机辅助值，通常与派生参数一起保存。派生计算能提高猜测成本，但不会凭空增加原密码的随机性。本文直接生成随机密钥，不展开密码派生。

## 为什么使用 AES-GCM？ ##

```java
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
```

| 部分 | 含义 |
| :--- | :--- |
| AES | 对称加密算法 |
| GCM | 提供加密及完整性校验的工作模式 |
| NoPadding | GCM 不需要把原文补齐到 AES 分组长度；不代表没有认证标签 |

不建议只写 `Cipher.getInstance("AES")`，省略部分会依赖密码提供者的默认行为。

GCM 加密会产生“密文 + 认证标签”。解密时不仅恢复数据，也验证标签；错误密钥或被修改的数据应导致失败，不能将失败结果当成原文。

GCM 还需要 nonce，可以理解为每次加密使用的新参数（Java API 中常称 IV）。本例使用 12 字节安全随机 nonce。同一把密钥下不能重复使用相同 nonce；随机生成也不是无限次调用的安全保证，实际使用还需管理调用量和密钥生命周期。nonce 不需要保密，可以随密文保存。

```java
// 128 是认证标签的位数，等于 16 字节，不是 AES 密钥长度。
GCMParameterSpec parameters = new GCMParameterSpec(128, nonce);
```

本文使用 AES-256：密钥 32 字节、nonce 12 字节、标签 16 字节。Java GCM 加密时附加标签、解密时验证标签，见 Cipher 官方文档。

## 基本使用方式 ##

```java
// 选择算法、模式和填充方式。
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");

// 指定加密操作、密钥、标签长度和本次 nonce。
cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, nonce));

// 明确使用 UTF-8，避免不同平台默认编码不同。
byte[] encrypted = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));

// 解密使用同一把密钥及加密时的 nonce。
cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, nonce));
String restored = new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
```

`Cipher.init` 决定当前操作是加密还是解密；doFinal 完成运算。上面的片段省略了 key、nonce、plain 的准备，下面给出完整代码。每次操作使用独立 Cipher，不要跨线程共享一个正在运算的实例。

## 完整实例：加密与解密字符串 ##

保存为 `AesGcmExample.java`。代码中的 `throws GeneralSecurityException` 表示把算法不可用、密钥无效、认证失败等加解密异常交给调用方处理；示例的 `main` 直接继续向外抛出：

```java
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.HexFormat;

public class AesGcmExample {
    private static final byte FORMAT_VERSION = 1;
    private static final int NONCE_BYTES = 12;
    private static final int TAG_BITS = 128;
    // 版本 1 字节 + nonce 12 字节 + 标签 16 字节，转 Hex 后至少 58 字符。
    private static final int MIN_HEX_LENGTH = (1 + NONCE_BYTES + TAG_BITS / 8) * 2;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final HexFormat HEX = HexFormat.of();

    public static SecretKey generateKey() throws GeneralSecurityException {
        KeyGenerator generator = KeyGenerator.getInstance("AES");
        generator.init(256);
        return generator.generateKey();
    }

    public static String encrypt(String plain, SecretKey key)
            throws GeneralSecurityException {
        byte[] nonce = new byte[NONCE_BYTES];
        // 使用适合密码学的随机数，每次加密重新生成 nonce。
        RANDOM.nextBytes(nonce);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, nonce));
        byte[] encrypted = cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));

        // 按“版本号 + nonce + 密文及标签”存储；密钥不在其中。
        byte[] stored = ByteBuffer.allocate(1 + NONCE_BYTES + encrypted.length)
                .put(FORMAT_VERSION) // 写入 1 字节版本号，位置到 1。
                .put(nonce)         // 写入 12 字节 nonce，位置到 13。
                .put(encrypted)     // 写入密文及标签，位置到末尾。
                .array();           // 取得底层数组，不执行编码或加密。
        return HEX.formatHex(stored);
    }

    public static String decrypt(String storedHex, SecretKey key)
            throws GeneralSecurityException {
        if (storedHex.length() < MIN_HEX_LENGTH) {
            throw new IllegalArgumentException("密文长度不足");
        }

        // 每两个 Hex 字符还原为一个字节；Buffer 初始读取位置为 0。
        ByteBuffer buffer = ByteBuffer.wrap(HEX.parseHex(storedHex));
        // get() 读取 1 字节，位置从 0 到 1，不删除原数据。
        if (buffer.get() != FORMAT_VERSION) {
            throw new IllegalArgumentException("不支持的格式版本");
        }
        byte[] nonce = new byte[NONCE_BYTES];
        // 按数组长度读取 12 字节，位置从 1 到 13。
        buffer.get(nonce);
        // remaining() 返回剩余长度，不移动位置。
        byte[] ciphertextAndTag = new byte[buffer.remaining()];
        // 读取剩余密文及标签，位置到末尾，remaining() 变为 0。
        buffer.get(ciphertextAndTag);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, nonce));
        // doFinal 验证标签；失败会抛异常，不应继续使用解密结果。
        return new String(cipher.doFinal(ciphertextAndTag), StandardCharsets.UTF_8);
    }

    public static void main(String[] args) throws GeneralSecurityException {
        SecretKey key = generateKey();
        String plain = "Hello，Java 加解密！";
        String first = encrypt(plain, key);
        String second = encrypt(plain, key);
        if (!plain.equals(decrypt(first, key))) {
            throw new IllegalStateException("还原结果不一致");
        }
        // 下面输出的是虚构演示文本；实际应用不要随意打印敏感原文。
        System.out.println("原文：" + plain);
        System.out.println("还原：" + decrypt(first, key));
        System.out.println("第一次密文：" + first);
        System.out.println("第二次密文：" + second);
        System.out.println("两次密文是否相同：" + first.equals(second));
        System.out.println("解密还原验证通过");
    }
}
```

```bash
javac -encoding UTF-8 AesGcmExample.java
java AesGcmExample
```

可以看到原文与还原结果相同，两次密文通常不同。每次运行都会生成新密钥，因此这个示例只演示同一进程内的往返；关闭程序后不能指望用下次生成的密钥解开旧密文。示例没有为 `null` 定义特殊含义，空字符串可以处理，null 则会失败。

## 密文格式与长度 ##

下面是本文自定义的存储格式，不是 AES 强制要求的统一文件或文本格式。不同程序只有约定一致时才能互相读取。

```text
版本号 1 字节 + nonce 12 字节 + 密文 n 字节 + 标签 16 字节
```

拼接只用于组织存储，真正加密已经由 Cipher 完成。Hex 和 Base64 是编码，不是第二次加密，任何人都能还原它们所表示的字节。

Hex 字符数为 `2 × (1 + 12 + 原文 UTF-8 字节数 + 16)`：

| 原文 | UTF-8 字节数 | Hex 字符数 |
| :--- | :---: | :---: |
| 空字符串 | 0 | 58 |
| Hello | 5 | 68 |
| 11 位数字 | 11 | 80 |

必须区分位、字节、字符；128 位标签等于 16 字节，中文字符数也不能直接代替 UTF-8 字节数。当前版本号仅识别格式，不表示已完成密钥轮换。

## 错误密钥和篡改必须失败 ##

下面片段可放入同目录另一 Java 类的 `main` 方法，或放入测试方法；该方法需要声明 `throws GeneralSecurityException`，并导入 `javax.crypto.SecretKey`、`java.security.GeneralSecurityException` 和 `java.util.HexFormat`：

```java
SecretKey key = AesGcmExample.generateKey();
String encrypted = AesGcmExample.encrypt("示例文本", key);
SecretKey wrongKey = AesGcmExample.generateKey();
try {
    AesGcmExample.decrypt(encrypted, wrongKey);
    throw new IllegalStateException("错误密钥不应解密成功");
} catch (javax.crypto.AEADBadTagException expected) {
    System.out.println("错误密钥已被拒绝");
}

// 第 0 字节是版本，第 1～12 字节是 nonce，第 13 字节起是密文。
byte[] bytes = HexFormat.of().parseHex(encrypted);
// ^= 1 将这个字节的最低位翻转，模拟密文被改动。
bytes[13] ^= 1;
try {
    AesGcmExample.decrypt(HexFormat.of().formatHex(bytes), key);
    throw new IllegalStateException("被修改的密文不应解密成功");
} catch (javax.crypto.AEADBadTagException expected) {
    System.out.println("密文篡改已被发现");
}
```

还应测试空串、中文、无效 Hex、截断、未知版本、标签和 nonce 篡改，以及固定密钥和固定测试 nonce 的已知向量。固定 nonce 仅用于测试，不能用于正常加密。不要捕获认证失败后返回空串、原密文或默认文本。

## Mac 和 Cipher 的区别 ##

Cipher 用于加解密；Mac 用于计算带密钥的消息认证码。可以把认证码理解为依赖密钥的校验值：持有同一密钥的一方重新计算，再核对结果。HMAC-SHA256 是其中一种方案，结果不能解密还原原文。Mac 是 Java 类名，MAC 是消息认证码的缩写。

将下面完整示例保存为 HmacExample.java：

```java
import javax.crypto.KeyGenerator;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.HexFormat;

public class HmacExample {
    public static String hash(String value, SecretKey key)
            throws GeneralSecurityException {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(key);
        return HexFormat.of().formatHex(
                mac.doFinal(value.getBytes(StandardCharsets.UTF_8))
        );
    }

    public static void main(String[] args) throws GeneralSecurityException {
        KeyGenerator generator = KeyGenerator.getInstance("HmacSHA256");
        generator.init(256);
        SecretKey key = generator.generateKey();
        // 这里只演示结果是否稳定，不是外部认证码的安全校验示例。
        System.out.println("相同输入的结果是否一致："
                + hash("示例文本", key).equals(hash("示例文本", key)));
    }
}
```

| 对比 | AES-GCM | HMAC-SHA256 |
| :--- | :--- | :--- |
| 工具 | Cipher | Mac |
| 作用 | 加密、解密及完整性校验 | 带密钥的认证码 |
| 能否还原 | 可以 | 不可以 |
| 相同输入 | 新 nonce 下密文通常不同 | 相同密钥下结果相同 |

验证外部认证码时，应先按约定将结果还原为字节，再使用 `MessageDigest.isEqual` 等适合的比较方式；上面的 `String.equals` 仅演示两次计算结果相同。
HMAC 可用于消息认证，也可作为确定性匹配标记，即用相同密钥为相同内容生成相同标记；它会暴露重复关系，不等于匿名化。AES-GCM 已自带标签，不需要仅为检测密文修改再机械叠加 HMAC。登录密码需要专门的密码哈希方案，不能用可逆 AES 或快速 HMAC 直接代替。参见 Mac 官方文档。

## 密钥可以从哪里取得？ ##

示例在 main 中生成随机密钥，只为独立演示。真实系统可能通过受控配置注入、受保护的密钥库、外部密钥服务，或解开加密保护后的密钥来取得密钥。

算法方法只接收 SecretKey，不绑定某个具体来源。这里的“外部提供”是外部来源提供密钥，不代表每次加密都要远程请求；是否在内存中保留、何时更新，应根据具体方案决定。关键是以后读取旧密文时，仍能取得对应密钥；不能每次加密都重新生成却不保存。环境变量和编码包装不自动提供保密性，也不要将真实密钥放进源代码、日志或异常消息。
