---
lastUpdated: true
commentabled: true
recommended: true
title: SpringBoot+Vue实现SM4加密传输
description: SpringBoot+Vue实现SM4加密传输
date: 2026-04-20 09:55:00 
pageClass: blog-page-class
cover: /covers/springboot.svg
---

最近项目中因为密保要求，需要对敏感数据加密传输，目前就用SpringBoot+Vue实现SM4加密传输，目前只是一个基础过渡方案，仅供参考使用。

## 一、前置准备 ##

### 后端SpringBoot：引入BouncyCastle依赖 ###

Java这边实现SM4，最常用的就是BouncyCastle这个加密库，直接在pom.xml里加依赖就行，我用的是1.70版本，比较稳定，没什么兼容性问题：

```xml
<dependency>
   <groupId>org.bouncycastle</groupId>
   <artifactId>bcprov-jdk15on</artifactId>
   <version>1.70</version>
</dependency>
```

### 前端Vue：安装sm4js插件 ###

前端这边不用自己造轮子，有现成的sm4js插件可以用，直接npm安装即可，命令很简单：

```bash
npm install sm4js
```
 
## 二、后端核心：SM4工具类实现（SpringBoot） ##

后端的核心就是写一个可复用的SM4工具类，我这里实现了CBC模式（比ECB模式更安全，需要初始化向量IV），同时支持Base64编码（方便网络传输，比Hex更节省空间）。

先给大家贴完整代码，后面再唠关键要点：

```java
import lombok.Getter;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.util.encoders.Hex;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.Security;
import java.util.Base64;

import static java.util.Objects.isNull;

@Slf4j
public class SM4Utils {

    private static final int DEFAULT_KEY_SIZE = 128;
    private static final String ALGORITHM = "SM4";
    private static final String SM4_ECB_ = "SM4/ECB/";
    private static final String SM4_CBC_ = "SM4/CBC/";
    private static final Base64.Encoder BASE64_ENCODER = Base64.getEncoder();
    private static final Base64.Decoder BASE64_DECODER = Base64.getDecoder();
    private static final BouncyCastleProvider PROVIDER = new BouncyCastleProvider();

    // 静态代码块：注册BouncyCastle加密提供者
    static {
        if (isNull(Security.getProvider(BouncyCastleProvider.PROVIDER_NAME))) {
            Security.addProvider(PROVIDER);
        }
    }

    // 填充模式枚举，方便调用，常用PKCS5/PKCS7
    @Getter
    public enum Padding {
        PKCS5("PKCS5Padding"),
        PKCS7("PKCS7Padding"),
        ISO10126("ISO10126Padding");

        private final String name;

        Padding(String name) {
            this.name = name;
        }
    }

    // 生成Base64格式的SM4密钥（128位，SM4默认密钥长度）
    public static String genKeyAsBase64() {
        return genKeyAsBase64(DEFAULT_KEY_SIZE);
    }

    public static String genKeyAsBase64(int keySize) {
        return BASE64_ENCODER.encodeToString(genKey(keySize));
    }

    @SneakyThrows
    private static byte[] genKey(int keySize) {
        KeyGenerator kg = KeyGenerator.getInstance(ALGORITHM, BouncyCastleProvider.PROVIDER_NAME);
        kg.init(keySize, new SecureRandom());
        return kg.generateKey().getEncoded();
    }

    // CBC模式：Base64加密（核心业务方法，敏感数据传输用这个）
    public static String encryptBase64_CBC(String data, String key) {
        // 固定IV（前后端必须一致！），也可以动态生成后和密文一起传输
        String fixedIv = "Wqsdy3M345BV6GRXB";
        return BASE64_ENCODER.encodeToString(encrypt_CBC(
                data.getBytes(StandardCharsets.UTF_8),
                key.getBytes(StandardCharsets.UTF_8),
                fixedIv.getBytes(StandardCharsets.UTF_8),
                Padding.PKCS5
        ));
    }

    // CBC模式：底层字节数组加密实现
    @SneakyThrows
    private static byte[] encrypt_CBC(byte[] data, byte[] key, byte[] iv, Padding padding) {
        Cipher cipher = getCipher_CBC(padding);
        SecretKeySpec secretKeySpec = new SecretKeySpec(key, ALGORITHM);
        IvParameterSpec ivParameterSpec = new IvParameterSpec(iv);
        cipher.init(Cipher.ENCRYPT_MODE, secretKeySpec, ivParameterSpec);
        return cipher.doFinal(data);
    }

    // 获取CBC模式的Cipher实例
    @SneakyThrows
    private static Cipher getCipher_CBC(Padding padding) {
        return Cipher.getInstance(SM4_CBC_ + padding.name, BouncyCastleProvider.PROVIDER_NAME);
    }

    // 测试方法
    public static void main(String[] args) {
        // 测试：密钥（前后端一致，可通过genKeyAsBase64()生成）
        String key = "qwegwfdtwer234";
        // 敏感数据
        String sensitiveData = "11111";
        // 加密结果
        String encryptedData = SM4Utils.encryptBase64_CBC(sensitiveData, key);
        System.out.println("加密后的密文：" + encryptedData);
    }
}
```

### 后端关键要点说明 ##

- 密钥和IV的约定：

- 填充模式：这里用了PKCS5Padding，和前端sm4js的默认填充模式兼容，避免对接时出现填充错误。

- Base64编码：加密后的字节数组转成Base64字符串，方便通过HTTP接口传输，不会出现乱码问题。

## 三、前端核心：Vue实现SM4解密 ##

前端的核心是接收后端返回的Base64密文，通过sm4js插件进行解密，还原出原始的敏感数据。我这里封装了一个工具类，方便在项目的各个组件中复用。

### 可选：全局注册sm4js（方便全局调用） ###

如果项目中很多地方都需要解密，可以在main.js里全局注册，省去每次引入的麻烦：

```javascript
import Sm4js from 'sm4js' 
Vue.prototype.$sm4 = Sm4js
```

### 核心：解密工具类封装 ###

新建一个sm4Utils.js文件，封装解密方法，关键是要和后端的密钥、IV、加密模式、填充模式保持一致，否则解密肯定翻车：

```javascript
import Sm4js from 'sm4js';

let sm4Utils = {};

// 解密方法：参数（后端约定的密钥，后端返回的Base64密文）
sm4Utils.decryptedData = function(key, data){
    // sm4配置项：和后端完全对应！
    let sm4Config = {
        key: key, // 密钥：和后端一致（qwegwfdtwer234）
        iv: 'Wqsdy3M345BV6GRXB', // IV：和后端固定IV一致
        mode: 'cbc', // 加密模式：CBC（和后端一致）
        padding: 'PKCS5Padding' // 填充模式：和后端一致（默认也可以，保险起见显式指定）
    }
    // 实例化sm4对象
    let sm4 = new Sm4js(sm4Config);
    // 关键：后端返回的是Base64密文，先通过atob()解码，再进行sm4解密
    return sm4.decrypt(atob(data));
}

export default sm4Utils;
```

### 组件中使用解密工具类 ###

在需要解密的Vue组件中，引入封装好的工具类，直接调用即可，非常方便：

```vue
<template>
  <div>
    <p>解密后的数据：{{ decryptedResult }}</p>
  </div>
</template>

<script>
// 引入sm4解密工具类
import sm4Utils from '@/utils/sm4Utils.js';

export default {
  data() {
    return {
      decryptedResult: '', // 解密结果
      key: 'qwegwfdtwer234', // 后端约定的密钥
      encryptedData: '' // 后端返回的加密密文（接口请求获取）
    };
  },
  mounted() {
    // 模拟接口返回密文，调用解密方法
    this.encryptedData = SM4Utils.encryptBase64_CBC("11111","qwegwfdtwer234"); // 后端返回的密文
    this.decryptedResult = sm4Utils.decryptedData(this.key, this.encryptedData);
  }
};
</script>
```

## 四、总结 ##

该方案其实对数据安全传输提升不明显，后期有较大的提升空间。该方案只能防止「明文传输被窃听」，避免敏感数据被「零成本获取」，是一种「基础的安全防护」，比明文传输略强，但存在较明显的短板。

### 核心弊端 ###

- 密钥安全隐患：前端需持有密钥，无论硬编码还是接口获取，均可能被提取，泄露后加密失效。
- 对称加密局限：单密钥加解密，一旦密钥泄露，攻击者可解密所有数据、伪造加密信息。
- 前端环境脆弱：浏览器/客户端易被调试、抓包，辅助防护仅增加攻击难度，无法根治泄露风险。
- 适用场景有限：仅能抵御基础窃听，无法满高安全等级项目的保密需求。

### 安全提升方案 ###

- 动态生成短期密钥：为每个用户会话生成临时SM4密钥，绑定会话有效期，过期自动失效，降低密钥泄露影响范围。
- 非对称加密传密钥：用SM2/RSA加密临时SM4密钥，前端仅存公钥（可公开），后端保管私钥，杜绝密钥传输泄露。
- 密钥安全存储与清理：前端密钥不存localStorage，仅驻留内存，会话结束（退出/关页）立即清空，避免残留。
- 增加数据校验机制：后端对加密数据添加SM3哈希校验，前端解密后验证，防止数据被篡改伪造。
- 前端代码加固：开启代码混淆、禁止调试、密钥分片存储，提升攻击者提取密钥和破解逻辑的难度。
- 接口权限与加密结合：对获取密钥/密文的接口做严格权限控制，仅授权用户可访问，多重防护降低风险。
