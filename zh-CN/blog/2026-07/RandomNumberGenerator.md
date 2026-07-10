---
lastUpdated: true
commentabled: true
recommended: true
title: 深入 .NET 的 RandomNumberGenerator
description: 安全随机数与 Token 生成的正确姿势
date: 2026-07-09 08:55:00
pageClass: blog-page-class
cover: /covers/vue.svg
---

几乎所有的密码学安全机制，最终都建立在一个看似简单的东西之上——_不可预测的随机数_。密钥要随机，会话 token 要随机，盐（salt）、初始化向量（IV）、一次性随机数（nonce）都要随机。一旦这个地基出了问题，上层再精妙的算法也会瞬间崩塌。

历史上不乏这样的教训：某些系统因为用错了随机数生成器，导致本该有 128 位强度的密钥实际只有寥寥几十位有效熵，攻击者在普通电脑上几秒钟就能穷举出来。问题往往不在算法本身，而在于"随机数根本不够随机"。

在 .NET 中，承担"生产安全随机数"这一职责的核心类型就是 `System.Security.Cryptography.RandomNumberGenerator`。本文将从原理到实战，系统地讲清楚它是什么、为什么可靠、怎么正确使用，以及围绕它最容易踩的那些坑。

## 先看反面教材：System.Random 为什么不能用于安全场景

要理解 `RandomNumberGenerator` 的价值，最好的方式是先看看它要替代的东西。

`System.Random` 是 .NET 里最常见的随机数类，写游戏、做模拟、随机打乱列表时用它完全没问题。但它有一个在安全场景中致命的特性：_可预测_。

它的本质是一个*确定性算法加一个种子（seed）*。给定相同的种子，它每次都会吐出完全相同的序列。这意味着：

- 如果攻击者知道或猜到了种子，就能完整复现你生成的所有"随机"值；
- 即使不知道种子，通过观察足够多的连续输出，也可以反推出内部状态，进而预测后续输出。

早期版本的 `Random` 在不指定种子时默认用系统时间做种子，而时间是高度可猜测的——如果知道 token 大致在哪一秒生成的，可能的种子空间就小到可以暴力枚举。

一句话：`System.Random` 追求的是"看起来随机"和"快"，而不是"猜不到"。它压根没打算防御一个有意破解的对手。

```csharp
// 反面教材：绝对不要用这种方式生成 token、密钥、密码
var random = new Random();
var insecureToken = random.Next().ToString(); // 可预测，危险！
```

## CSPRNG：让随机真正"不可预测"

安全场景需要的是 _CSPRNG_（Cryptographically Secure Pseudo-Random Number Generator，密码学安全伪随机数生成器）。它在普通随机数生成器"统计上均匀分布"的基础上，额外满足两条密码学要求。

### 下一位不可预测（Next-bit unpredictability）

即使攻击者掌握了到目前为止产生的*所有*输出，也无法以显著高于随机猜测（50%）的概率，预测下一个比特是 0 还是 1。

### 状态不可回溯（Backward secrecy）

即使攻击者在某一刻*攻破并获取了生成器的内部状态*，也无法据此反推出此前已经产生过的历史输出。

这两条要求普通 PRNG 完全无法满足，而它们恰恰是安全随机数的命门。

### CSPRNG 是怎么做到的

_第一，种子来自高质量熵源，而非可猜的值。_ CSPRNG 的种子不是"当前时间"这种低熵、可预测的数据，而是操作系统从多种物理噪声中收集的高质量熵：

- 硬件层面的电子噪声、CPU 时序抖动；
- 硬件中断的到达时间、磁盘/网络 I/O 的微观时序；
- 专用硬件随机指令（如 Intel/AMD 的 `RDRAND` / `RDSEED`）；
- 操作系统维护的熵池会持续从这些来源"搅拌"补充。

_第二，用密码学原语扩展熵。_ 收集到的熵通过分组密码、哈希函数等密码学构件进行扩展和混淆，保证即使输出海量数据，序列依然保持不可预测。

### 各语言里的 CSPRNG

CSPRNG 是通用概念，每种语言/平台都有对应实现：

| 平台 / 语言    | CSPRNG 接口                    |
| :------------- | :----------------------------- |
| Linux 系统调用 | `getrandom()` / `/dev/urandom` |
| Windows 系统   | `BCryptGenRandom` (CNG)        |
| .NET           | `RandomNumberGenerator`        |
| Java           | `SecureRandom`                 |
| Node.js        | `crypto.randomBytes`           |
| Python         | `secrets` 模块                 |
| Go             | `crypto/rand`                  |

> 核心原则：凡是涉及安全的随机值（密钥、token、盐、IV、nonce），一律用 CSPRNG，绝不用普通随机数。

## RandomNumberGenerator 详解

`System.Security.Cryptography.RandomNumberGenerator` 就是 .NET 官方提供的 CSPRNG，也是当前所有安全随机数需求的推荐入口。

### 底层实现：它其实是操作系统的"门面"

`RandomNumberGenerator` 自己并不发明随机算法，而是*直接委托给操作系统的密码学随机源*，因此其安全性与操作系统级别的 CSPRNG 保持一致：

- 在 Windows 上，调用 CNG 的 `BCryptGenRandom`；
- 在 Linux / macOS 上，调用 `getrandom()` / `/dev/urandom` 一类接口。

这种设计的好处是：随机质量由经过广泛审计的操作系统实现来保证，.NET 只做一层安全的封装。

### 常用 API

#### 静态便捷方法（.NET 6+，推荐）

从 .NET 6 起，`RandomNumberGenerator` 提供了一批静态方法，无需创建实例、线程安全、用起来最简洁：

```csharp
// 生成指定数量的随机字节
byte[] bytes = RandomNumberGenerator.GetBytes(32);

// 生成一个 [0, max) 范围内、无模偏差(modulo bias)的安全随机整数
int value = RandomNumberGenerator.GetInt32(0, 100);
```

其中 `GetInt32` 特别值得一提：它内部做了*无偏采样*处理，避免了"直接对随机数取模"会引入的分布偏差（modulo bias），这是手写随机整数时极易忽略的细节。

#### 实例方法（需要填充已有缓冲区时）

```csharp
using var rng = RandomNumberGenerator.Create();
byte[] buffer = new byte[32];
rng.GetBytes(buffer);            // 用随机字节填满 buffer
// rng.GetNonZeroBytes(buffer);  // 填充非零随机字节
```

### 已过时的旧写法：RNGCryptoServiceProvider

在老代码里你可能会见到 `RNGCryptoServiceProvider`：

```csharp
// 旧写法：自 .NET 6 起已被标记为过时(obsolete, SYSLIB0023)
using var rng = new RNGCryptoServiceProvider();
```

它从 .NET 6 开始已被标记为 obsolete，官方建议统一迁移到 `RandomNumberGenerator` 的静态方法或 `RandomNumberGenerator.Create()`。新代码不应再使用它。

## 实战：生成一个 URL 安全的 Token

把前面的知识串起来，我们回到一个非常典型的需求——生成可以安全放进 URL 的随机 token。下面这段代码是业界的标准做法：

```csharp
var bytes = RandomNumberGenerator.GetBytes(32);
return Convert.ToBase64String(bytes)
    .TrimEnd('=')
    .Replace('+', '-')
    .Replace('/', '_');
```

逐步拆解它做了什么：

### 第 1 步：生成 256 位密码学随机字节

```csharp
var bytes = RandomNumberGenerator.GetBytes(32);
```

用 CSPRNG 生成 32 字节 = _256 位熵_。一般认为 128 位就足以抵御任何现实中的暴力破解，256 位则留有充裕余量。关键在于——用的是 `RandomNumberGenerator` 而非 `System.Random`，方向正确。

### 第 2 步：Base64 编码

```csharp
Convert.ToBase64String(bytes)
```

把 32 个字节编码成标准 Base64 字符串（约 44 个字符，含填充符）。

### 第 3 步：转成 URL 安全格式（Base64URL）

标准 Base64 的字符集里有三个字符在 URL 中会惹麻烦，需要处理：

- `.TrimEnd('=')`：去掉末尾的 `=` 填充符。填充在 URL 场景里没有必要，去掉更干净。
- `.Replace('+', '-')`：`+` 在 URL 里会被解释成空格，替换成 `-`。
- `.Replace('/', '_')`：`/` 在 URL 里是路径分隔符，替换成 `_`。

这套 `+/=` → `-_` 去填充的转换，正是 _RFC 4648 定义的 Base64URL_ 编码。

最终产物：一个约 43 字符、只含 `A–Z a–z 0–9 - _` 的随机字符串，可安全嵌入 URL、查询参数、Cookie、HTTP 头等位置。典型用途包括 API key、会话 token、密码重置链接 token、CSRF token、邮箱验证链接等。

> ⚠️ 重要认知：这段代码*只是编码，不是加密*。任何人拿到字符串都能解码回原始字节。它的安全性 _100% 来自"字节本身不可预测_"——也就是完全依赖 `RandomNumberGenerator` 的质量。这正是为什么第 1 步选对生成器至关重要。

如需反向解码，记得先把 `-_` 换回 `+/`，再补齐 `=` 填充，然后做 Base64 解码。

## 常见误区与最佳实践

用对了类，不代表就一定安全。下面这些坑同样常见。

### 误区 1：`用 System.Random` 冒充安全随机

这是最高频的安全事故来源。Random 可预测，*绝不能*用于 token、密钥、密码、盐等任何安全敏感值。心里要有一条硬性红线：安全相关 → RandomNumberGenerator；非安全相关 → Random 才可以。

### 误区 2：还在用过时的 RNGCryptoServiceProvider

见到就迁移。新代码统一走 `RandomNumberGenerator.GetBytes(...)` / `GetInt32(...)`。

### 误区 3：白白浪费熵

即使用了强生成器，如果后续处理不当，有效熵也会大幅缩水，例如：

- 生成了 32 字节，却只截取其中一小段来用；
- 把随机数取模映射到一个很小的范围（还会引入 modulo bias）；
- 映射到过小的字符集。

前面那段 token 代码的优点之一，就是把全部 32 字节都完整编码进最终字符串，没有任何熵损失。需要范围内随机整数时，优先用 `GetInt32`，它已帮你处理好无偏问题。

### 误区 4：以为"生成对了"就万事大吉

token 的安全是一条完整的生命周期，生成只是第一环。

## Token 的完整生命周期

一个真正安全的 token，除了"生成得够随机"，还要照顾好后续环节：

_生成_ 用 CSPRNG，保证足够熵（≥128 位，256 位更稳妥）。✅ 本文重点。

_存储_ 数据库里最好存 token 的*哈希值*而非明文。这样即使数据库泄露，攻击者也拿不到可直接使用的原始 token。

_传输_ 只通过 HTTPS 传输；放进 Cookie 时按需设置 `HttpOnly`、`Secure`、`SameSite` 等属性。

_校验_ 比对 token 时使用*恒定时间*比较，防止时序攻击（timing attack）。.NET 提供了现成方法：

```csharp
using System.Security.Cryptography;

bool valid = CryptographicOperations.FixedTimeEquals(
    Encoding.UTF8.GetBytes(providedToken),
    Encoding.UTF8.GetBytes(storedToken));
```

普通的字符串 `==` 比较会在遇到第一个不同字符时提前返回，攻击者可以通过测量响应时间逐字节猜出正确值。`FixedTimeEquals` 的耗时与内容无关，从而封堵这一侧信道。

_过期与吊销_ 设置合理的有效期，并在必要时（如用户登出、密码修改、疑似泄露）能够主动吊销。

## 总结

回到最初的问题——`RandomNumberGenerator` 符合 token 的安全要求吗？答案是明确的：完全符合，且它正是为此而生。

把本文的关键结论收束成几条要点：

- 随机是安全的地基，用错随机数会让整套安全体系形同虚设。
- CSPRNG 在统计随机性之上，额外保证"下一位不可预测"和"状态不可回溯"，靠的是高质量熵源加密码学算法。
- RandomNumberGenerator 是 .NET 的 CSPRNG，底层委托给经过审计的操作系统随机源，跨平台可靠。
- 新代码用静态方法 `GetBytes` / `GetInt32`；告别过时的 RNGCryptoServiceProvider；坚决不用 `System.Random` 做安全用途。
- 生成阶段做对（正确的生成器 + 足够的熵 + 不浪费熵）只是第一步，存储、传输、恒定时间比较、过期吊销同样不可或缺。

选对生成器，是安全的起点；照顾好整个生命周期，才是安全的终点。
