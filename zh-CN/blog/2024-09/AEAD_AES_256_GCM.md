---
lastUpdated: true
commentabled: true
recommended: true
title:  C# 中 AEAD_AES_256_GCM 加密实践
description: C# 中 AEAD_AES_256_GCM 加密实践
date: 2024-09-23 15:18:00
pageClass: blog-page-class
---

# C# 中 AEAD_AES_256_GCM 加密实践 #

## 前言 ##

网络安全威胁的日益增多，数据加密技术成为了保障信息安全的关键手段之一。

其中，AEAD_AES_256_GCM（Authenticated Encryption with Associated Data using Advanced Encryption Standard with a 256-bit key and Galois/Counter Mode）因其高效的数据加密能力和完整性验证功能而备受青睐。

本文将详细介绍 C# 中如何实现 AEAD_AES_256_GCM 加密算法，并探讨其在实际应用中的优势与挑战。

通过本篇文章将了解到这一加密技术的基本原理以及如何在 C# 开发环境中有效应用它，以增强应用程序的安全性。

## C# 中的 AEAD_AES_256_GCM ##

注意：AEAD_AES_256_GCM Key的长度必须是32位，nonce的长度必须是12位，附加数据有可能为空值。AEAD_AES_128_GCM Key的长度必须是16位，nonce的长度必须是12位，附加数据有可能为空值。

使用中不管`AEAD_AES_256_GCM`还是`AEAD_AES_128_GCM`加密，是根据key的长度来决定的。
size = key.Length * 8
256 = 32 * 8, AEAD_AES_256_GCM的key长度必须是 32 位。
128 = 16 * 8, AEAD_AES_128_GCM的key长度必须是 16 位。

## 使用BouncyCastle类库实现 ##

安装 `Install-Package Portable.BouncyCastle -Version 1.8.9`。

微信支付官方代码中同样使用了 `BouncyCastle`。

```csharp
/// <summary>
/// 使用BouncyCastle进行AEAD_AES_256_GCM 解密
/// </summary>
/// <param name="key">key:32位字符</param>
/// <param name="nonce">随机串12位</param>
/// <param name="cipherData">密文(Base64字符)</param>
/// <param name="associatedData">附加数据可能null</param>
/// <returns></returns>
static string AesGcmDecryptByBouncyCastle(string key, string nonce, string cipherData, string associatedData)
{
    var associatedBytes = associatedData == null ? null : Encoding.UTF8.GetBytes(associatedData);

    var gcmBlockCipher = new GcmBlockCipher(new AesEngine());
    var parameters = new AeadParameters(
        new KeyParameter(Encoding.UTF8.GetBytes(key)),
        128,  //128 = 16 * 8 => (tag size * 8)
        Encoding.UTF8.GetBytes(nonce),
        associatedBytes);
    gcmBlockCipher.Init(false, parameters);

    var data = Convert.FromBase64String(cipherData);
    var plaintext = new byte[gcmBlockCipher.GetOutputSize(data.Length)];
    
    var length = gcmBlockCipher.ProcessBytes(data, 0, data.Length, plaintext, 0);
    gcmBlockCipher.DoFinal(plaintext, length);
    return Encoding.UTF8.GetString(plaintext);
}

/// <summary>
/// 使用BouncyCastle进行AEAD_AES_256_GCM 加密
/// </summary>
/// <param name="key">key32位字符</param>
/// <param name="nonce">随机串12位</param>
/// <param name="plainData">明文</param>
/// <param name="associatedData">附加数据可能null</param>
/// <returns></returns>
static string AesGcmEncryptByBouncyCastle(string key, string nonce, string plainData, string associatedData)
{
    var associatedBytes = associatedData == null ? null : Encoding.UTF8.GetBytes(associatedData);

    var gcmBlockCipher = new GcmBlockCipher(new AesEngine());
    var parameters = new AeadParameters(
        new KeyParameter(Encoding.UTF8.GetBytes(key)),
        128, //128 = 16 * 8 => (tag size * 8)
        Encoding.UTF8.GetBytes(nonce),
        associatedBytes);
    gcmBlockCipher.Init(true, parameters);

    var data = Encoding.UTF8.GetBytes(plainData);
    var cipherData = new byte[gcmBlockCipher.GetOutputSize(data.Length)];

    var length = gcmBlockCipher.ProcessBytes(data, 0, data.Length, cipherData, 0);
    gcmBlockCipher.DoFinal(cipherData, length);
    return Convert.ToBase64String(cipherData);
}
```

## 使用官方AesGcm类 ##

自aspnetcore3.0之后，`System.Security.Cryptography`支持 `AES_GCM`，不支持.net framework。

在加密时，请使用`AesGcmEncryptToBase64_WithTag`方法，这个方法的结果包含了tag (authentication tag)。

加密结果最后面的16位字符就是tag，但是官方的加密方法没有帮我们拼接上。

```c#
/// <summary>
/// 使用 AesGcm 解密
/// </summary>
/// <param name="key">key32位字符</param>
/// <param name="nonce">随机串12位</param>
/// <param name="encryptedData">密文（Base64字符）</param>
/// <param name="associatedData">(可能null)</param>
/// <returns></returns>
static string AesGcmDecryptFromBase64(string key, string nonce, string encryptedData, string associatedData)
{
    var keyBytes = Encoding.UTF8.GetBytes(key);
    var nonceBytes = Encoding.UTF8.GetBytes(nonce);
    var associatedBytes = associatedData == null ? null : Encoding.UTF8.GetBytes(associatedData);
    
    var encryptedBytes = Convert.FromBase64String(encryptedData);
    //tag size is 16
    var cipherBytes = encryptedBytes[..^16];
    var tag = encryptedBytes[^16..];
    var decryptedData = new byte[cipherBytes.Length];
    using var cipher = new AesGcm(keyBytes);
    cipher.Decrypt(nonceBytes, cipherBytes, tag, decryptedData, associatedBytes);
    return Encoding.UTF8.GetString(decryptedData);
}

/// <summary>
/// 使用 AesGcm AEAD_AES_256_GCM 加密，不要在正式环境中使用这个方法。因为在解密时不知道tag，除非额外返回tag。
/// </summary>
/// <param name="key">key32位字符</param>
/// <param name="nonce">随机串12位</param>
/// <param name="plainData">明文</param>
/// <param name="associatedData">附加数据(可能null)</param>
/// <returns>只返回加密数据不包含authentication tag</returns>
static string AesGcmEncryptToBase64(string key, string nonce, string plainData, string associatedData)
{
    var keyBytes = Encoding.UTF8.GetBytes(key);
    var nonceBytes = Encoding.UTF8.GetBytes(nonce);
    var associatedBytes = associatedData == null ? null : Encoding.UTF8.GetBytes(associatedData);

    var plainBytes = Encoding.UTF8.GetBytes(plainData);
    var cipherBytes = new byte[plainBytes.Length];
    using var cipher = new AesGcm(keyBytes);
    //tag size must be is 16 
    var tag = new byte[16];
    cipher.Encrypt(nonceBytes, plainBytes, cipherBytes, tag, associatedBytes);
    
    return Convert.ToBase64String(cipherBytes);
}

/// <summary>
/// 使用 AesGcm进行AEAD_AES_256_GCM加密
/// </summary>
/// <param name="key">key32位字符</param>
/// <param name="nonce">随机串12位</param>
/// <param name="plainData">明文</param>
/// <param name="associatedData">附加数据(可能null)</param>
/// <returns>base64(加密后数据 + authentication tag)</returns>
static string AesGcmEncryptToBase64_WithTag(string key, string nonce, string plainData, string associatedData)
{
    var keyBytes = Encoding.UTF8.GetBytes(key);
    var nonceBytes = Encoding.UTF8.GetBytes(nonce);
    var associatedBytes = associatedData == null ? null : Encoding.UTF8.GetBytes(associatedData);

    var plainBytes = Encoding.UTF8.GetBytes(plainData);
    var cipherBytes = new byte[plainBytes.Length];
    //tag size is 16
    var tag = new byte[16];
    using var cipher = new AesGcm(keyBytes);
    cipher.Encrypt(nonceBytes, plainBytes, cipherBytes, tag, associatedBytes);
    
    var cipherWithTag = new byte[cipherBytes.Length + tag.Length];
    Buffer.BlockCopy(cipherBytes, 0, cipherWithTag, 0, cipherBytes.Length);
    Buffer.BlockCopy(tag, 0, cipherWithTag, cipherBytes.Length, tag.Length);
    
    return Convert.ToBase64String(cipherWithTag);
}
```

## 测试代码 ##

```C#
var text = "{'A':123, count:'10', isOk:false, body:{'Text':'select * from table_A where name=@_p1', result:[{'id':1, 'age':23}]}}";
//KEY 必须是两个32位
var key = "1234567890_1234567890_1234567890";

var nonce = "77d0a5ff3937";//Guid.NewGuid().ToString("N").Substring(0, 12);


var associated = "6df132d42d0b4581"; //Guid.NewGuid().ToString("N").Substring(0, 16);

var pythonResult = "PrTO/594j0CYMi2CQF9IFIp7UNkiTtIiIUbmR+jv1c1iO8Ng/HDFHDjL2t0DYo7xo5Vr0O0fUg9hD3bfCoomP+taVaPrW2kJbPTiFXkohXk3T80lQIdWP5lrl21vJvZO3MbmvshyjU+Oxk7pSnjiE5mw/sPXBs4jzS5wtvLUgHvWGaNxzw==";

Console.WriteLine();

var cipherText = AesGcmEncryptToBase64(key, nonce, text, nonce);

Console.WriteLine($"原始密文Base64  ：\t{cipherText}");

//Console.WriteLine($"密文tag Base64：\t\t{AesGcmEncryptToBase64(keyBytes,  nonceBytes,  text, associatedBytes)}");

Console.WriteLine($"Python GCM密文  ：\t{pythonResult}");

var cryptText1 = AesGcmEncryptByBouncyCastle(key, nonce, text, associated);
Console.WriteLine($"BouncyCastle密文: \t{cryptText1} ");

var cryptText2 = AesGcmEncryptToBase64_WithTag(key, nonce,  text, associated);
Console.WriteLine($"密文+Tag Base64 : \t{cryptText2} ");

Console.WriteLine();
Console.WriteLine();

var t30 = AesGcmDecryptByBouncyCastle(key, nonce, pythonResult, associated);
Console.WriteLine($"BouncyCastle 解密 Python      :{t30} \tisOk:{text == t30}");

var t40 = AesGcmDecryptFromBase64(key, nonce, pythonResult, associated);
Console.WriteLine($"AesGcm       解密 Python      :{t40} \tisOk:{text == t40}");

Console.WriteLine();
Console.WriteLine();

var t31 = AesGcmDecryptByBouncyCastle(key, nonce, cryptText1, associated);
Console.WriteLine($"BouncyCastle 解密 BouncyCastle:{t31} \tisOk:{text == t31}");

var t41 = AesGcmDecryptFromBase64(key, nonce, cryptText1, associated);
Console.WriteLine($"AesGcm       解密 BouncyCastle:{t41} \tisOk:{text == t41}");

Console.WriteLine();
Console.WriteLine();

var t32 = AesGcmDecryptByBouncyCastle(key, nonce, cryptText2, associated);
Console.WriteLine($"BouncyCastle 解密 密文+Tag    :{t32} \tisOk:{text == t32}");

var t42 = AesGcmDecryptFromBase64(key, nonce, cryptText2, associated);
Console.WriteLine($"AesGcm       解密 密文+Tag    :{t42} \tisOk:{text == t42}");
```

## 总结 ##

本文通过详细的讲解和实例演示，探讨了 C# 中 AEAD_AES_256_GCM 加密算法的实现方法及其重要性。

我们了解到，AEAD_AES_256_GCM 不仅能够提供高强度的数据加密，还能确保数据传输过程中的完整性和认证性，从而有效抵御多种网络攻击。

通过本篇文章的学习可以掌握在 C# 应用程序中使用 AEAD_AES_256_GCM 的基本技能，并能够在实际开发中加以应用，进一步提升软件系统的安全性。
