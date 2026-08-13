---
lastUpdated: true
commentabled: true
recommended: true
title: ACE-GCM加解密微信小程序
description: ACE-GCM加解密微信小程序
date: 2026-07-10 13:30:00
pageClass: blog-page-class
cover: /covers/miniprogram.svg
---

## 📋 背景

在开发微信小程序时,需要对敏感数据(如密码)进行 AES-GCM 加密后传输到后端。由于小程序环境的特殊性,许多 Node.js 加密库无法直接使用,需要经过多次尝试才找到最佳方案。

## 🔍 遇到的问题

### crypto-js 不支持 GCM 模式

```javascript
// ❌ 失败方案
import CryptoJS from 'crypto-js'
// crypto-js 在小程序中不支持 GCM 模式
```

问题: crypto-js 库在小程序环境中无法使用 GCM 加密模式,会报错 `Cannot read property 'createEncryptor' of undefined`。

### @noble/ciphers 导入路径问题

```javascript
// ❌ 失败方案
import { gcm } from '@noble/ciphers/gcm' // 路径不存在
import { aes } from '@noble/ciphers/aes'
```

问题: @noble/ciphers v2.x 不再通过 ./gcm 路径导出 GCM 模式,其 exports 中仅包含 `./aes.js` 和基于 WebCrypto 的 `./webcrypto.js`。

### aes-js 不支持 GCM 模式

```javascript
// ❌ 失败方案
import aesjs from 'aes-js'
const aesGcm = new aesjs.ModeOfOperation.gcm(key, iv) // gcm 是 undefined
```

问题: aes-js v3.x 版本只支持 ECB、CBC、CFB 等模式,不支持 GCM 模式。

### asmcrypto.js buffer 属性为 null

```javascript
// ❌ 失败方案 - 直接使用 Uint8Array.buffer
const keyBytes = new Uint8Array(keyStr.length)
// asmcrypto.js 内部访问 key.buffer 时会报错
```

问题: 在小程序环境中,某些情况下 `Uint8Array` 的 `buffer` 属性可能为 `null`,导致 `TypeError: Cannot read property 'length' of null`。

### 小程序环境限制

- ❌ 不支持 `atob()` / `btoa()` - 需要使用 `wx.base64ToArrayBuffer()` / `wx.arrayBufferToBase64()`
  ❌ 不支持 `TextDecoder` / `TextEncoder` - 需要手动实现 UTF-8 编解码
  ❌ 不支持 Node.js `crypto` 模块
  ❌ 部分库的 `require()` 无法正确解析 npm 模块

## ✅ 最终解决方案

### 技术选型

使用 `asmcrypto.js` - 一个纯 JavaScript 实现的加密库,完全兼容小程序环境。

```bash
pnpm add asmcrypto.js
```

### 核心代码实现

#### 创建加密工具文件 src/utils/crypto.js

```javascript
// asmcrypto.js 是纯 JavaScript 实现,兼容小程序环境
import * as AsmCrypto from 'asmcrypto.js/asmcrypto.all.es8.js'

// ⚠️ 必须与后端 KEY 完全一致
const KEY_STR = 'XXXXXXXXXXXXXX' // 替换为您的实际密钥
const IV_LENGTH = 12 // GCM 标准 IV 长度
const TAG_LENGTH = 16 // GCM 标签长度

/**
 * 生成安全的随机字节(小程序环境兼容)
 */
function generateRandomBytes(length) {
  const array = new Uint8Array(length)

  // 尝试使用 wx.getRandomValues
  if (typeof wx !== 'undefined' && typeof wx.getRandomValues === 'function') {
    try {
      const result = wx.getRandomValues(array)
      if (result && result instanceof Uint8Array && result.length === length) {
        return result
      }
    } catch (e) {
      console.warn('wx.getRandomValues failed, using fallback:', e)
    }
  }

  // 降级方案:使用 Math.random()
  for (let i = 0; i < length; i++) {
    array[i] = Math.floor(Math.random() * 256)
  }
  return array
}

/**
 * 将字符串转换为 Uint8Array (UTF-8)
 */
function stringToUtf8Bytes(str) {
  const utf8 = []
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i)
    if (charcode < 0x80) {
      utf8.push(charcode)
    } else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f))
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f))
    } else {
      // 处理代理对
      i++
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      )
    }
  }
  return new Uint8Array(utf8)
}

/**
 * Uint8Array 转 UTF-8 字符串(小程序兼容,不使用 TextDecoder)
 */
function utf8BytesToString(bytes) {
  let str = ''
  let i = 0
  while (i < bytes.length) {
    const b1 = bytes[i++]
    if (b1 < 0x80) {
      str += String.fromCharCode(b1)
    } else if (b1 < 0xe0) {
      const b2 = bytes[i++]
      str += String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f))
    } else if (b1 < 0xf0) {
      const b2 = bytes[i++]
      const b3 = bytes[i++]
      str += String.fromCharCode(((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f))
    } else {
      const b2 = bytes[i++]
      const b3 = bytes[i++]
      const b4 = bytes[i++]
      let codepoint = ((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f)
      codepoint -= 0x10000
      str += String.fromCharCode(0xd800 + (codepoint >> 10), 0xdc00 + (codepoint & 0x3ff))
    }
  }
  return str
}

/**
 * Uint8Array 转 Base64(小程序兼容,不使用 btoa)
 */
function bytesToBase64(bytes) {
  if (typeof wx !== 'undefined' && wx.arrayBufferToBase64) {
    return wx.arrayBufferToBase64(bytes.buffer)
  }

  // 降级方案
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Base64 转 Uint8Array(小程序兼容,不使用 atob)
 */
function base64ToBytes(base64) {
  if (typeof wx !== 'undefined' && wx.base64ToArrayBuffer) {
    const arrayBuffer = wx.base64ToArrayBuffer(base64)
    return new Uint8Array(arrayBuffer)
  }

  // 降级方案
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * AES-GCM 加密
 * @param {string} plaintext - 明文
 * @returns {string} Base64 编码的密文 (IV + Ciphertext + Tag)
 */
export function encrypt(plaintext) {
  if (!plaintext) return null

  try {
    // 将密钥和明文转换为字节数组
    const keyBytes = stringToUtf8Bytes(KEY_STR)
    const plaintextBytes = stringToUtf8Bytes(plaintext)

    // 生成随机 IV
    const iv = generateRandomBytes(IV_LENGTH)

    // 使用 asmcrypto.js 进行 AES-GCM 加密
    // 返回的是 Ciphertext + Tag 的组合
    const encryptedWithTag = AsmCrypto.AES_GCM.encrypt(plaintextBytes, keyBytes, iv)

    // 组合: IV + (Ciphertext + Tag)
    const combined = new Uint8Array(IV_LENGTH + encryptedWithTag.length)
    combined.set(iv, 0)
    combined.set(encryptedWithTag, IV_LENGTH)

    // 转换为 Base64
    return bytesToBase64(combined)
  } catch (error) {
    console.error('AES-GCM encryption error:', error)
    return plaintext
  }
}

/**
 * AES-GCM 解密
 * @param {string} base64Ciphertext - Base64 编码的密文
 * @returns {string} 解密后的明文
 */
export function decrypt(base64Ciphertext) {
  if (!base64Ciphertext) return null

  try {
    // 从 Base64 解码
    const combined = base64ToBytes(base64Ciphertext)

    // 拆分: IV (12字节) + (Ciphertext + Tag)
    const iv = combined.slice(0, IV_LENGTH)
    const encryptedWithTag = combined.slice(IV_LENGTH)

    // 将密钥转换为字节数组
    const keyBytes = stringToUtf8Bytes(KEY_STR)

    // 使用 asmcrypto.js 进行 AES-GCM 解密
    const decryptedBytes = AsmCrypto.AES_GCM.decrypt(encryptedWithTag, keyBytes, iv)

    // 转换为 UTF-8 字符串
    return utf8BytesToString(decryptedBytes)
  } catch (error) {
    console.error('AES-GCM decryption error:', error)
    return base64Ciphertext
  }
}

export default { encrypt, decrypt }
```

#### 创建统一入口 src/utils/cryptoUtil.js

```javascript
// #ifndef MP-WEIXIN
import forge from 'node-forge'
// #endif

// #ifdef MP-WEIXIN
// 微信小程序环境使用 asmcrypto.js 实现 AES-GCM
import { encrypt, decrypt } from './crypto'
// #endif

const IV_LEN = 12
const TAG_BIT = 128

// ⚠️ 必须与后端 KEY 完全一致
const getKEY = () => {
  return 'XXXXXXXXXXXXXX' // 替换为您的实际密钥
}

const CryptoUtil = {
  encrypt(content) {
    if (!content) return null

    // #ifdef MP-WEIXIN
    // 微信小程序环境:使用 asmcrypto.js
    try {
      return encrypt(content)
    } catch (error) {
      console.error('AES-GCM encryption error in mini program:', error)
      return content
    }
    // #endif

    // #ifndef MP-WEIXIN
    // H5/其他平台:使用 node-forge
    const keyBuf = forge.util.encodeUtf8(getKEY())
    const iv = forge.random.getBytesSync(IV_LEN)
    const cipher = forge.cipher.createCipher('AES-GCM', forge.util.createBuffer(keyBuf))
    cipher.start({ iv: iv, tagLength: TAG_BIT })
    cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(content)))
    cipher.finish()
    const allBin = iv + cipher.output.getBytes() + cipher.mode.tag.getBytes()
    return forge.util.encode64(allBin)
    // #endif
  },

  decrypt(base64Str) {
    if (!base64Str) return null

    // #ifdef MP-WEIXIN
    // 微信小程序环境:使用 asmcrypto.js
    try {
      return decrypt(base64Str)
    } catch (error) {
      console.error('AES-GCM decryption error in mini program:', error)
      return base64Str
    }
    // #endif

    // #ifndef MP-WEIXIN
    // H5/其他平台:使用 node-forge
    const fullBin = forge.util.decode64(base64Str)
    const tagBytes = TAG_BIT / 8
    const iv = fullBin.substring(0, IV_LEN)
    const tag = fullBin.substring(fullBin.length - tagBytes)
    const cipherText = fullBin.substring(IV_LEN, fullBin.length - tagBytes)
    const keyBuf = forge.util.encodeUtf8(getKEY())
    const decipher = forge.cipher.createDecipher('AES-GCM', forge.util.createBuffer(keyBuf))
    decipher.start({ iv: iv, tagLength: TAG_BIT, tag: forge.util.createBuffer(tag) })
    decipher.update(forge.util.createBuffer(cipherText))
    decipher.finish()
    return forge.util.decodeUtf8(decipher.output.getBytes())
    // #endif
  }
}

export default CryptoUtil
```

#### 在 API 调用中使用

```javascript
import cryptoUtil from '@/utils/cryptoUtil'

// 加密密码
let encryptedPassword = data.password
try {
  encryptedPassword = cryptoUtil.encrypt(data.password) || data.password
} catch (error) {
  console.warn('Failed to encrypt password:', error)
}

// 发送请求
return request({
  url: '/auth/login',
  method: 'post',
  data: {
    username: data.username,
    password: encryptedPassword // 使用加密后的密码
  }
})
```

## 🎯 关键要点

### 数据格式

加密后的数据格式必须与后端保持一致:

```js
Base64(IV[12字节] + Ciphertext + Tag[16字节])
```

### 小程序兼容性处理

| 功能        | 浏览器/H5              | 小程序                                    |
| :---------- | :--------------------- | :---------------------------------------- |
| Base64 编码 | `btoa()`               | `wx.arrayBufferToBase64()`                |
| Base64 解码 | `atob() `              | `wx.base64ToArrayBuffer()`                |
| UTF-8 编码  | TextEncoder            | 手动实现                                  |
| UTF-8 解码  | TextDecoder            | 手动实现                                  |
| 随机数生成  | `crypto.randomBytes()` | `wx.getRandomValues()` 或 `Math.random()` |

### 条件编译

使用 uni-app 的条件编译区分不同平台:

```javascript
// #ifdef MP-WEIXIN
// 小程序专用代码
// #endif

// #ifndef MP-WEIXIN
// 其他平台代码
// #endif
```

### 错误处理

添加完善的错误处理,确保加密失败时不阻断业务流程:

```javascript
try {
  encryptedPassword = cryptoUtil.encrypt(data.password) || data.password
} catch (error) {
  console.warn('Failed to encrypt password:', error)
  // 降级:使用原始密码
}
```

## 📊 方案对比

| 方案           | 优点            | 缺点                         | 结果          |
| :------------- | :-------------- | :--------------------------- | :------------ |
| crypto-js      | 流行度高        | 不支持 GCM                   | ❌            |
| @noble/ciphers | 现代化设计      | 导入路径复杂，依赖 WebCrypto | ❌            |
| aes-js         | 纯 JS 实现      | 不支持 GCM 模式              | ❌            |
| 微信原生 API   | 性能好          | 需要基础库 ≥ 2.21.2          | ⚠️ 兼容性问题 |
| asmcrepo.js    | 纯 JS，完全兼容 | 包体积稍大                   | ✅            |

## 🔐 安全性说明

- 密钥管理: 密钥应妥善保管,不要硬编码在代码中,建议使用环境变量
- IV 生成: 每次加密都应生成新的随机 IV,确保安全性
- 降级策略: 如果加密失败,应有合理的降级方案,但生产环境应避免降级

## 💡 总结

经过多次尝试,最终选择 asmcrypto.js 作为微信小程序的 AES-GCM 加密方案,主要优势:

- ✅ 纯 JavaScript 实现,不依赖任何原生 API
- ✅ 完全兼容小程序环境
- ✅ 支持完整的 AES-GCM 功能
- ✅ 与后端 Java AES-GCM 完全兼容
- ✅ 有完善的错误处理和降级机制

这个方案已经在实际项目中稳定运行,希望能帮助到遇到同样问题的开发者!
