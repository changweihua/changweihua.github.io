---
lastUpdated: true
commentabled: true
recommended: true
title: HMAC signature通常是用来干什么的
description: HMAC signature通常是用来干什么的
date: 2025-10-31 09:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

在数字化世界中，数据传输安全是企业和开发者必须面对的核心问题。当我们在使用API接口、进行支付交易或处理敏感数据时，如何确保数据未被篡改，且发送方身份真实可靠？HMAC（基于哈希的消息认证码）技术正是解决这些问题的有效工具，它像一把“数字锁”，为数据安全保驾护航。

## 一、什么是HMAC？核心作用是什么？ ##

简单来说，HMAC是一种结合了“共享密钥”和“哈希算法”的签名技术。想象一把只有双方知道的“密码锁”：发送方用这把锁对数据“加签”，接收方用同一把锁对数据“验签”，从而确认数据未被修改且发送者身份合法。

**核心功能有三个**：

- 防篡改：比如你通过App向服务器发送转账信息，服务器通过HMAC确认参数（金额、卡号等）是否被黑客恶意修改。
- 防伪造：只有持有“共享密钥”的合法者才能生成正确的签名，非法者因不知道密钥，无法伪造有效请求。
- 防重放：在签名中加入时间戳或随机数，避免黑客重复发送旧请求（如重复扣款）。

## 二、HMAC如何工作？三步流程解析 ##

HMAC的使用分为“生成签名”和“验证签名”两个核心步骤，需要双方提前约定三个关键信息：

- 哈希算法：如SHA-256（推荐，安全性高）、MD5（不推荐，已不安全）；
- 共享密钥：双方私下约定的“密码”，需严格保密（如平台分配的“App Secret”）；
- 签名规则：明确哪些数据参与签名、如何排序（如按字段名升序排列）、编码格式（如UTF-8）。

**具体流程**（以“客户端调用API”为例）：

- 客户端生成签名：按规则拼接请求参数（如method、timestamp、业务参数），用共享密钥和哈希算法计算出签名；
- 传输数据：将原始参数和签名一起发送给服务器；
- 服务器验证签名：按相同规则重新拼接参数，计算签名并与客户端发送的签名对比，一致则通过，否则拒绝。

## 三、实战：用Python实现HMAC签名与验证 ##

以API接口请求为例，通过简单代码就能理解HMAC的实现逻辑：

**生成签名（客户端）**：

```python
import hmac
import hashlib
import time
import uuid

def generate_signature(secret_key):
    # 1. 准备参数：时间戳（防过期）、随机串（防重放）、业务参数
    timestamp = str(int(time.time()))  # 秒级时间戳
    nonce = str(uuid.uuid4())          # 随机唯一串
    params = {"user_id": "123456", "amount": "100"}  # 业务参数
    
    # 2. 按规则拼接所有参与签名的字段（升序排列字段名）
    sign_str = "&".join([f"{k}={v}" for k, v in sorted({
        "method": "POST",
        "url": "/api/pay",
        "timestamp": timestamp,
        "nonce": nonce,** params
    }.items())])
    
    # 3. 用密钥和SHA-256生成签名（核心步骤）
    sign = hmac.new(
        key=secret_key.encode(),
        msg=sign_str.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()
    
    return {"timestamp": timestamp, "nonce": nonce, "sign": sign, **params}
```

**验证签名（服务器）**：

```python
def verify_signature(secret_key, request_data):
    # 1. 检查必要参数是否存在
    required = ["method", "url", "timestamp", "nonce", "user_id", "amount"]
    if not all(k in request_data for k in required):
        return False
    
    # 2. 防重放：检查时间戳是否在有效期内（如60秒内）
    if abs(int(time.time()) - int(request_data["timestamp"])) > 60:
        return False
    
    # 3. 按相同规则重新生成签名并对比
    sign_str = "&".join([f"{k}={v}" for k, v in sorted({
        "method": request_data["method"],
        "url": request_data["url"],
        "timestamp": request_data["timestamp"],
        "nonce": request_data["nonce"],
        "user_id": request_data["user_id"],
        "amount": request_data["amount"]
    }.items())])
    
    server_sign = hmac.new(secret_key.encode(), sign_str.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(server_sign, request_data["sign"])  # 用恒定时长比较防攻击
```

## 四、关键注意事项：避免安全漏洞 ##

- 密钥必须保密：密钥是HMAC的核心，泄露则所有签名失效。建议通过环境变量或配置中心存储，避免硬编码。
- 规则完全一致：客户端与服务器的参数范围、排序方式、算法必须相同，否则签名无法匹配。
- 防重放不可少：时间戳+随机串组合，确保每个请求唯一且在有效期内。
- 用 `hmac.compare_digest` 对比签名：普通字符串比较（`==`）可能被“时序攻击”破解，`compare_digest` 是安全的恒定时间比较。

## 五、应用价值：从技术到业务 ##

HMAC看似是底层技术，实则在实际业务中应用广泛：

- API接口安全：云服务（如阿里云、腾讯云）的API认证大多采用HMAC；
- 支付交易防护：支付平台通过HMAC验证回调请求，防止伪造交易；
- 数据传输加密：在微服务、跨系统通信中，HMAC是身份认证和数据完整性的“标配”。

简单来说，HMAC用一把“共享密钥”和“哈希算法”，为数据传输构建了一道简单却坚固的安全屏障，让开发者能更放心地处理复杂的数字化场景。

## 阅后请思考 ##

- HMAC是否会增加数据传输量？
- 不同哈希算法对HMAC安全性影响？
- 密钥泄露后HMAC如何应对？
