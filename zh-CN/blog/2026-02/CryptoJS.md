---
lastUpdated: true
commentabled: true
recommended: true
title: CryptoJS 入门指南
description: 加密与解密的基础知识
date: 2026-02-28 09:20:00
pageClass: blog-page-class
cover: /covers/typescript.svg
---

## 什么是CryptoJS ##

CryptoJS 是一个流行的 JavaScript 加密库，用于在前端和后端应用程序中执行加密和解密操作。它支持多种加密算法，包括 AES、DES、Rabbit、RC4、Triple DES 等对称加密，以及 MD5、SHA1、SHA2、SHA3、RIPEMD-160 等哈希函数。

## CryptoJS的常用场景 ##

CryptoJS 主要用于以下场景：

- 数据传输加密：在发送敏感数据到服务器时，使用 CryptoJS 对数据进行加密，以确保数据在传输过程中的安全性
- 用户密码加密：在用户注册或登录时，使用 CryptoJS 对用户密码进行加密，保护密码在网络上传输时的安全性
- 数据存储加密：在后端应用程序中，使用 CryptoJS 对敏感数据进行加密，然后将加密的数据存储在数据库中

## 如何使用CryptoJS ##

### 安装CryptoJS ###

首先，需要通过 `npm` 安装 CryptoJS：

```sh
npm install crypto-js // [!=npm auto]
```

### 引入CryptoJS ###

在 JavaScript 文件中引入 CryptoJS：

```javascript
import CryptoJS from 'crypto-js';
```

或使用 CommonJS 模块：

```javascript
const CryptoJS = require('crypto-js');
```

### AES加密示例 ###

以下是使用 CryptoJS 进行 AES 加密的示例代码：

```javascript
// 定义要加密的数据和密钥
const message = "Hello, World!";
const key = "secret key 12345";

// 使用 AES 加密
const encrypted = CryptoJS.AES.encrypt(message, key);

// 输出加密后的字符串
console.log(encrypted.toString());
```

### AES解密示例 ###

以下是使用 CryptoJS 进行 AES 解密的示例代码：

```javascript
// 定义加密后的数据和密钥
const encryptedMessage = encrypted.toString();
const key = "secret key 12345";

// 使用 AES 解密
const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, key);

// 将解密后的数据转换为 UTF-8 格式
const decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);

console.log("Decrypted Message:", decryptedMessage);
```

## 高级配置 ##

在实际应用中，可能需要配置加密模式（如 CBC、ECB）和填充方式（如 PKCS7）：

```javascript
const key = CryptoJS.enc.Utf8.parse("1234123412341234");
const iv = CryptoJS.enc.Utf8.parse("1234123412341234");

const encrypted = CryptoJS.AES.encrypt(message, key, {
  iv: iv,
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7
});
```

### Base64编码 ###

如果需要将加密结果转化为 Base64 格式，可以使用 `CryptoJS.enc.Base64.stringify()` 方法：

```javascript
const base64Encrypted = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
console.log(base64Encrypted);
```

## 注意事项 ##

- 密钥管理：在实际应用中，密钥的管理和存储非常重要。密钥应该安全地存储，并且不应该在前端暴露。
- 安全性依赖：CryptoJS 的安全性依赖于正确的使用和配置。使用时应确保密钥足够强壮，并且使用正确的加密模式和填充方式。
- 性能考虑：在处理大量数据时，可能需要考虑性能问题。不同的加密算法和配置可能会影响性能。

## 扩展案例 ##

### 使用SHA256进行哈希 ##

除了加密，CryptoJS 还支持各种哈希函数，如 SHA256。以下是使用 SHA256 进行哈希的示例：

```javascript
const message = "Hello, World!";
const hash = CryptoJS.SHA256(message).toString();

console.log("SHA256 Hash:", hash);
```

### 使用HMAC进行消息认证 ###

HMAC（Keyed-Hash Message Authentication Code）用于验证消息的完整性和真实性。以下是使用 HMAC-SHA256 进行消息认证的示例：

```javascript
const message = "Hello, World!";
const key = "secret key";
const hmac = CryptoJS.HmacSHA256(message, key).toString();

console.log("HMAC-SHA256:", hmac);
```

## 完整代码 ##

```ts
import CryptoJS from 'crypto-js'

/**
 * 将 Base64 字符串转换为 CryptoJS 的 WordArray
 */
function base64ToWordArray(base64: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Base64.parse(base64)
}

/**
 * 根据字段名生成固定 16 字节 IV（与后端算法一致）
 * @param fieldName 字段名，如 "IdCard"
 * @returns 16 字节的 WordArray
 */
function getIvFromFieldName(fieldName: string): CryptoJS.lib.WordArray {
  const encoder = new TextEncoder()
  const nameBytes = encoder.encode(fieldName) // Uint8Array
  const ivBytes = new Uint8Array(16) // 16 字节，自动补零
  ivBytes.set(nameBytes.slice(0, 16)) // 复制最多 16 字节
  return CryptoJS.lib.WordArray.create(ivBytes) // 转为 WordArray
}

/**
 * 解密单个加密字段
 * @param ciphertextBase64 密文（Base64 字符串）
 * @param keyBase64 密钥（Base64 字符串，由后端返回）
 * @param fieldName 字段名，用于生成 IV
 * @returns 解密后的明文字符串
 */
export function decryptField(
  ciphertextBase64: string,
  keyBase64: string,
  fieldName: string
): string {
  const key = base64ToWordArray(keyBase64)
  const iv = getIvFromFieldName(fieldName)
  // 输出 IV 十六进制
  console.log(`FieldName: ${fieldName}, IV Hex: ${iv.toString(CryptoJS.enc.Hex)}`)

  const decrypted = CryptoJS.AES.decrypt(ciphertextBase64, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })

  // 调试输出（可删除）
  console.log(`Field: ${fieldName}, IV Hex: ${iv.toString(CryptoJS.enc.Hex)}`)
  console.log(`Decrypted Hex: ${decrypted.toString(CryptoJS.enc.Hex)}`)

  return decrypted.toString(CryptoJS.enc.Utf8)
}

// 将 Base64 字符串转换为 ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

// 解密函数
export async function decryptAesGcm(
  ciphertextB64: string,
  keyB64: string,
  nonceB64: string,
  tagB64: string
): Promise<string> {
  // 导入密钥
  const keyBuffer = base64ToArrayBuffer(keyB64)
  const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-GCM' }, false, [
    'decrypt',
  ])

  // 组合 ciphertext + tag（Web Crypto 要求 tag 附加在密文末尾）
  const ciphertext = base64ToArrayBuffer(ciphertextB64)
  const tag = base64ToArrayBuffer(tagB64)
  const combined = new Uint8Array(ciphertext.byteLength + tag.byteLength)
  combined.set(new Uint8Array(ciphertext), 0)
  combined.set(new Uint8Array(tag), ciphertext.byteLength)

  // 解密
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToArrayBuffer(nonceB64),
      tagLength: 128, // 16 字节 = 128 位
    },
    cryptoKey,
    combined
  )

  // 将 ArrayBuffer 转换为 UTF-8 字符串
  return new TextDecoder().decode(decrypted)
}

// // 使用示例
// const response = await fetch("/api/encrypt", { ... });
// const data = await response.json(); // { ciphertext, tag, key, nonce }

// const plainText = await decryptAesGcm(
//   data.ciphertext,
//   data.key,
//   data.nonce,
//   data.tag
// );
// console.log("解密结果:", plainText);
```
