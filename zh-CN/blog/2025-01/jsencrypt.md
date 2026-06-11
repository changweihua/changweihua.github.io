---
lastUpdated: true
commentabled: true
recommended: true
title: 前端接口加密
description: 前端接口加密：用Crypto-JS和JSEncrypt
date: 2025-01-14 09:18:00
pageClass: blog-page-class
---

# 前端接口加密：用Crypto-JS和JSEncrypt #

很多时候需要对接口进行加密处理，防止明文传输，特别是在以下几种场景中：

- **用户登录**：在用户登录时，对用户名和密码进行加密，防止明文信息在网络传输中被截获。
- **敏感信息传输**：如用户的个人信息、银行账户信息等，在传输前进行加密处理。
- **防止数据泄露**：对涉及商业机密或者个人隐私的数据进行加密，避免数据泄露造成的损失。
- **防止篡改**：通过加密确保数据在传输过程中不被篡改，保证数据的完整性。
- **防止接口被恶意调用**：通过加密签名，确保只有合法的客户端能调用接口。
- **防御CSRF攻击**：通过加密技术，使请求带有唯一性标识，防止跨站请求伪造。

这时候，如果你直接把数据“裸奔”到服务器，黑客们可能会像饿狼一样扑上来，把你的数据撕得粉碎。为了避免这种惨剧，我们需要给数据穿上“防弹衣”——也就是加密。

我敢说只要不是玩具项目，基本所有的项目都要进行接口的加密。

今天把前端的接口加密给你讲得明明白白。

## 原理 ##

加密的原理其实很简单：把明文（原始数据）通过某种算法变成密文（加密后的数据），只有拥有密钥的人才能解密。

### Crypto-JS和JSEncrypt ###

他们都是对数据进行加密，只是他们应对的场景不一样：

- **Crypto-JS**：这个库支持多种加密算法，比如AES、DES、SHA-1等。你可以用它来对称加密（加密和解密用同一个密钥）或哈希（不可逆的加密）
- **JSEncrypt**：这个库专门用于RSA加密，一种非对称加密算法。它有两个密钥：公钥和私钥。公钥用来加密，私钥用来解密。你可以把公钥放在前端，私钥放在服务器，这样即使黑客拿到公钥，也无法解密数据。

这是它们最核心的区别，也是决定你用谁的关键。

### Crypto-JS ###

Crypto-JS 是一个对称加密库，支持 AES、DES、SHA 等算法。对称加密的特点是：加密和解密用同一个密钥。

- **优点**：速度快，适合加密大量数据（比如整个 JSON 对象）。
- **缺点**：密钥管理是个大问题。如果密钥泄露，数据就完蛋了。

### JSEncrypt ###

JSEncrypt 是一个非对称加密库，专门用于 RSA 加密。非对称加密的特点是：加密和解密用不同的密钥（公钥和私钥）。

- **优点**：安全性更高，公钥可以公开，私钥保密。
- **缺点**：速度慢，适合加密小量数据（比如一个密钥或短字符串）。

### 举个栗子 ###

如果你要加密用户的信用卡信息，Crypto-JS 可以轻松搞定整个 JSON 对象，甚至对10M的文件加密而只需要几秒钟；而 JSEncrypt 更适合加密信用卡号这种短字符串，而对大数据量的场景会把你页面卡成幻灯片。

就如文章标题一样，他们不是死党，他们反而可以成为好基友，你可以把它们结合起来，发挥各自的优势！比如：

1. 用 JSEncrypt 加密一个随机生成的对称密钥。
2. 用 Crypto-JS 和这个密钥加密大量数据。
3. 把加密后的数据和加密后的密钥一起发送到服务器。

这样，你既能享受对称加密的速度，又能拥有非对称加密的安全性，简直是“鱼与熊掌兼得”！

## 两者结合进行接口加密 ##

### 步骤1 ###

前端先安装这两个库

```bash
pnpm add jsencrypt crypto-js
```

### 步骤2 ###

在你的`src/utils`下新建`jsencrypt.ts`文件

```js
import JSEncrypt from 'jsencrypt';
// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = import.meta.env.VITE_APP_RSA_PUBLIC_KEY;

// 前端不建议存放私钥 不建议解密数据 因为都是透明的意义不大
const privateKey = import.meta.env.VITE_APP_RSA_PRIVATE_KEY;

// 加密
export const encrypt = (txt: string) => {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey); // 设置公钥
  return encryptor.encrypt(txt); // 对数据进行加密
};

// 解密
export const decrypt = (txt: string) => {
  const encryptor = new JSEncrypt();
  encryptor.setPrivateKey(privateKey); // 设置私钥
  return encryptor.decrypt(txt); // 对数据进行解密
};
```

- **密钥对生成**：可以使用上面的网站快捷的生成公钥和私钥，分别保存到服务端和客户端。这个公钥和私钥其实可以通过openssl来生成，志哥也有一篇文章关于如何安装openssl的点这里。如果你有开发环境（localhost）需要https起开发服务器的场景可以参考。
- **密钥保存**：publickkey和privateKey可以保存到.env里

  ```js
  # 接口加密传输 RSA 公钥与后端解密私钥对应 如更换需前后端一同更换
  VITE_APP_RSA_PUBLIC_KEY = 'MFwwDQYJKoZIhvcNAQEBBQADSwMCAwEAAQ=='
  # 接口响应解密 RSA 私钥与后端加密公钥对应 如更换需前后端一同更换
  VITE_APP_RSA_PRIVATE_KEY = 'MIIBVAdwND1olF8vlKsJUGK3BcdtM8w4Xq7BpSBwsloE='
  ```


> 私钥其实不建议保存到前端，因为前端都是不安全的，正常的流程应该是前端使用公钥加密需要传输的数据，后端通过私钥进行解密，如果前端需要进行展示（如银行卡号），最好的方式是网站使用HTTPS。通过使用SSL/TLS协议，HTTPS加密了客户端和服务器之间的通信。这意味着即使数据在传输过程中被拦截，攻击者也无法读取数据内容。我这里进行演示，所以将私钥进行前端写死了。

### 步骤3 ###

在你的`src/utils`下新建crypto.ts文件

```js
import CryptoJS from 'crypto-js';

/**
 * 随机生成32位的字符串
 * @returns {string}
 */
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * 随机生成aes 密钥
 * @returns {string}
 */
export const generateAesKey = () => {
  return CryptoJS.enc.Utf8.parse(generateRandomString());
};

/**
 * 加密base64
 * @returns {string}
 */
export const encryptBase64 = (str: CryptoJS.lib.WordArray) => {
  return CryptoJS.enc.Base64.stringify(str);
};

/**
 * 解密base64
 */
export const decryptBase64 = (str: string) => {
  return CryptoJS.enc.Base64.parse(str);
};

/**
 * 使用密钥对数据进行加密
 * @param message
 * @param aesKey
 * @returns {string}
 */
export const encryptWithAes = (message: string, aesKey: CryptoJS.lib.WordArray) => {
  const encrypted = CryptoJS.AES.encrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
};

/**
 * 使用密钥对数据进行解密
 * @param message
 * @param aesKey
 * @returns {string}
 */
export const decryptWithAes = (message: string, aesKey: CryptoJS.lib.WordArray) => {
  const decrypted = CryptoJS.AES.decrypt(message, aesKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
};
```

使用encrypt的Aes算法进行加密和解密，其他算法可以自行探索

### 步骤4 ###

#### 请求前对数据进行加密 ####

```js
import { encryptBase64, encryptWithAes, generateAesKey, decryptWithAes, decryptBase64 } from '@/utils/crypto';
import { encrypt, decrypt } from '@/utils/jsencrypt';

  // 是否需要加密
  const isEncrypt = options.header?.isEncrypt == 'true';
  if (isEncrypt && (options.method === 'POST' || options.method === 'PUT')) {
    // 生成一个 AES 密钥
    const aesKey = generateAesKey();
    options.header[encryptHeader] = encrypt(encryptBase64(aesKey));
    options.data = typeof options.data === 'object' ? encryptWithAes(JSON.stringify(options.data), aesKey) : encryptWithAes(options.data, aesKey);
  }
```

- 前端目前的请求封装都是基于axios，他提供了请求拦截和响应拦截，上面的代码放在请求拦截的封装代码里
- 不可能所有的接口都要加密，所以通过isEncrypt区分
- 只对POST和PUT请求进行加密
- encryptBase64函数用于将AES密钥转换为Base64编码的字符串，然后encrypt函数（可能是RSA加密）用于加密这个Base64字符串。加密后的密钥被存储在请求的头部中，encryptHeader是头部字段的名称。
- 最后一段代码是处理请求数据的加密。首先检查options.data是否是一个对象，如果是，则使用JSON.stringify将其转换为JSON字符串。然后，无论options.data是字符串还是其他类型，都使用encryptWithAes函数和之前生成的AES密钥来加密数据。加密后的数据将替换原始的options.data

#### 响应对数据进行解密 ####

```js
// 假设res是后端返回的原始数据
// 加密后的 AES 秘钥
const keyStr = res.header[encryptHeader];
// 加密
if (keyStr != null && keyStr != '') {
  const data: any = res.data;
  // 请求体 AES 解密
  const base64Str = decrypt(keyStr);
  // base64 解码 得到请求头的 AES 秘钥
  const aesKey = decryptBase64(base64Str.toString());
  // aesKey 解码 data
  const decryptData = decryptWithAes(data, aesKey);
  // 将结果 (得到的是 JSON 字符串) 转为 JSON
  res.data = JSON.parse(decryptData);
}
```

- 上面的这段代码放在响应拦截器里
- 加密过程的反过来就是解密过程
