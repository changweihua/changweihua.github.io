---
lastUpdated: true
commentabled: true
recommended: true
title: 深入理解 Token 无感刷新
description: 从并发雪崩到单例锁 + 请求队列的完整实现
date: 2026-07-14 12:05:00
pageClass: blog-page-class
cover: /covers/platform.svg
---

## 前言

最近在项目中遇到一个线上问题：用户反馈"使用过程中突然被踢到登录页"。排查后发现，页面加载时同时发出了多个 API 请求，恰逢 Access Token 过期，导致刷新逻辑被重复触发，Refresh Token 被提前消耗。

这个问题并不罕见，但网上的方案大多存在隐患。今天就来系统梳理一下 Token 无感刷新的完整实现思路。

## Token 刷新的三个常见陷阱

现代 Web 应用普遍采用 JWT 双 Token 机制：

- Access Token —— 短期有效（15~30 分钟）
- Refresh Token —— 长期有效（7 天左右）

理想状态：Access Token 过期后，前端自动刷新并重试原请求，用户全程无感知。但实际实现中容易踩三个坑。

### 陷阱 1：并发雪崩

页面加载时 10 个接口同时发出，Token 恰好过期，10 个请求全部返回 401。如果拦截器直接刷新：

```typescript
// 每个请求都触发一次刷新
axios.interceptors.response.use(null, async (error) => {
  if (error.response.status === 401) {
    const newToken = await refreshToken()
    error.config.headers['Authorization'] = `Bearer ${newToken}`
    return axios(error.config)
  }
})
```

10 个 401 → 10 次 `refreshToken()` → 后端收到 10 个刷新请求。

轻则后端拒绝重复刷新，重则 Refresh Token 被提前消耗，用户反而被踢下线。

### 陷阱 2：无限循环

如果 `refreshToken()` 本身也返回 401（Refresh Token 过期），拦截器会再次触发 → 刷新 → 又 401 → 再重试……浏览器直接卡死。

### 陷阱 3：到处复制粘贴

就算写对了，每个新项目都得重复那一套 `isRefreshing` + `failedQueue` + `processQueue` 的逻辑，容易漏细节。

## 正确方案：单例锁 + 请求队列 + 重试标记

核心思路可以概括为三个字：_锁、排、重_。

```txt
请求 A ──→ 401 ──→ 加锁，发起刷新 ──→ 成功 ──→ 重试 A ──→ 200 ✅
请求 B ──→ 401 ──→ 已加锁，加入队列 ──┘
请求 C ──→ 401 ──→ 已加锁，加入队列 ──┘
                                       └──→ 拿到新 Token，重试 B、C ──→ 200 ✅
```

- 锁（isRefreshing）：第一个 401 负责刷新，后续 401 全部排队
- 排（failedQueue）：将等待中的请求存入队列，刷新完成后统一处理
- 重（_retry 标记）：已重试的请求不再进入刷新逻辑，防止死循环

## 完整实现

### 状态与队列定义

```typescript
let isRefreshing = false // 单例锁
const failedQueue: QueueItem[] = [] // 请求队列
```

只需要两个变量，一个锁一个队列。

### 队列处理函数

```typescript
const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!)
  })
  failedQueue.length = 0 // 清空队列
}
```

刷新成功时统一 `resolve(token)`，失败时统一 `reject(error)`，然后清空队列。

### 响应拦截器

这是核心部分：

```typescript
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config

    // 1. 非 401 或已重试过 → 直接拒绝
    if (!shouldRefresh(status) || retryCount >= maxRetryCount) {
      return Promise.reject(error)
    }

    // 2. 已经在刷新中 → 加入队列等待
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalConfig })
      }).then((token) => {
        setAuthHeader(originalConfig, token)
        return axios(originalConfig) // 拿到新 Token 后重试
      })
    }

    // 3. 首次触发 → 加锁、刷新
    originalConfig._retry = true
    isRefreshing = true

    try {
      const response = await refreshApiCall()
      const newToken = extractToken(response)

      processQueue(null, newToken) // 通知队列中所有等待的请求
      setAuthHeader(originalConfig, newToken)
      return axios(originalConfig) // 重试当前请求
    } catch (refreshError) {
      processQueue(refreshError, null) // 刷新失败，通知所有排队请求
      clearAuth()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false // 无论成败，释放锁
    }
  }
)
```

几个关键细节：

- 队列中的请求通过 `Promise` 挂起 —— 调用方拿到的是一个未 resolved 的 Promise，刷新成功时统一 resolve，调用方的 `.then()` 自然触发重试
- `finally` 释放锁 —— 即使刷新异常也不会死锁
- `_retry` 标记 —— 重试后的请求不会再次进入刷新流程，切断死循环

## 封装成通用方案的思路

上面的代码和业务耦合在一起（硬编码了刷新接口、Token 提取方式、失败跳转等）。要封装成通用方案，需要把这些行为全部抽成参数。

### 参数设计

经过梳理，真正需要外部传入的只有以下几项：

```typescript
interface TokenRefreshOptions {
  /** 必填：刷新 Token 的 API 请求函数 */
  refreshApiCall: () => Promise<AxiosResponse>

  /** 必填：从刷新响应中提取新的 Access Token */
  extractToken: (response: AxiosResponse) => string

  /** 可选：自定义设置请求头，默认 Bearer */
  setAuthHeader?: (config: AxiosRequestConfig, token: string) => void

  /** 可选：触发刷新的状态码，默认 [401] */
  statusCodes?: number[]

  /** 可选：最大重试次数，默认 1 */
  maxRetryCount?: number

  /** 可选：刷新成功回调 */
  onRefreshSuccess?: (token: string, response: AxiosResponse) => void

  /** 可选：刷新失败回调 */
  onRefreshFailure?: (error: any) => void
}
```

### 为什么这么设计？

`refreshApiCall` 为什么是函数而不是 URL 字符串？

因为刷新请求的发起方式千差万别：有的需要额外 Header，有的需要加签名，有的要走独立的 Axios 实例。给一个函数，调用方完全掌控怎么发请求。

`extractToken` 为什么是函数而不是字段名？
后端返回格式不统一：有的 `res.data.token`，有的 `res.data.access_token`，有的嵌套在 `res.data.data.accessToken`。直接给 response，怎么取由调用方决定。

`onRefreshSuccess` / `onRefreshFailure` 为什么是回调？

Token 存在哪、刷新失败跳哪个页面，这些和业务强绑定。通用的方案不应该替调用方做这些决定，而是在正确的时机回调出去。

### 最终 API

```typescript
import { createTokenRefreshInterceptor } from 'token-refresh-lock'
import axios from 'axios'

const instance = axios.create({ baseURL: '/api' })

const controller = createTokenRefreshInterceptor(instance, {
  refreshApiCall: () => instance.post('/auth/refresh'),
  extractToken: (res) => res.data.accessToken,
  onRefreshSuccess: (token) => {
    sessionStorage.setItem('access_token', token)
  },
  onRefreshFailure: () => {
    sessionStorage.removeItem('access_token')
    window.location.href = '/login'
  }
})

// 登出时可以手动卸载拦截器
controller.eject()
```

## 效果验证

用 Mock 数据模拟了三个典型场景：

### 场景 1：单个请求 Token 过期

```txt
请求 /api/user → 401 → 自动刷新 → 重试 → 200 ✅
刷新调用次数：1
```

### 场景 2：5 个并发请求同时 401

```txt
请求 1~5 全部 401 → 只刷新 1 次 → 全部重试成功 ✅
刷新调用次数：1（不是 5）
```

这是单例锁最核心的价值 —— 无论多少个请求同时 401，刷新接口永远只被调用一次。

### 场景 3：Refresh Token 也过期

```bash
请求 /api/user → 401 → 尝试刷新 → 刷新也失败 → onRefreshFailure 被调用 ✅
```

正常时无感刷新，异常时优雅降级。这才是生产环境需要的行为。

## 在不同框架中的集成方式

### Vue 3 + Pinia

```typescript:stores/auth.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { createTokenRefreshInterceptor } from 'token-refresh-lock';

const api = axios.create({ baseURL: '/api' });

export const useAuthStore = defineStore('auth', () => {
  const token = ref('');

  createTokenRefreshInterceptor(api, {
    refreshApiCall: () => api.post('/auth/refresh'),
    extractToken: (res) => res.data.accessToken,
    onRefreshSuccess: (newToken) => { token.value = newToken; },
    onRefreshFailure: () => {
      token.value = '';
      router.push('/login');
    },
  });

  return { token };
});
```

### React

```typescript:lib/request.ts
import axios from 'axios';
import { createTokenRefreshInterceptor } from 'token-refresh-lock';

const api = axios.create({ baseURL: '/api' });

createTokenRefreshInterceptor(api, {
  refreshApiCall: () => api.post('/auth/refresh'),
  extractToken: (res) => res.data.accessToken,
  onRefreshSuccess: (token) => {
    sessionStorage.setItem('access_token', token);
  },
  onRefreshFailure: () => {
    sessionStorage.removeItem('access_token');
    window.location.href = '/login';
  },
});

export default api;
```

### 小程序（uni-app + axios 适配）

```typescript
import axios from 'axios'
import { createTokenRefreshInterceptor } from 'token-refresh-lock'

const api = axios.create({ baseURL: 'https://your-api.com' })

createTokenRefreshInterceptor(api, {
  refreshApiCall: () => api.post('/auth/refresh'),
  extractToken: (res) => res.data.accessToken,
  onRefreshFailure: () => {
    uni.clearStorageSync()
    uni.reLaunch({ url: '/pages/login/index' })
  }
})
```

## 需要后端配合：HttpOnly Cookie 是推荐但非必须

前面的方案只讲了前端怎么做，但无感刷新的安全运行，强烈推荐后端将 Refresh Token 存储在 HttpOnly Cookie 中。

需要说明的是：本方案对后端 Refresh Token 的传递方式没有硬性要求。无论你的后端是 HttpOnly Cookie、请求体传递、还是自定义 Header，都可以通过 `refreshApiCall` 参数自行控制。下面先讲推荐方案，再给出替代写法。

### 为什么必须是 HttpOnly Cookie？

HttpOnly 是一个 Cookie 属性，设置后 JavaScript 无法通过 `document.cookie` 读取该 Cookie，但浏览器会在后续匹配的请求中自动携带。

```javascript
// 后端登录成功后下发
Set-Cookie: refreshToken=abc123; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh
```

这带来一个关键特性：前端永远获取不到 Refresh Token 的值。

- XSS 攻击注入了恶意脚本 → 读不到 `refreshToken` Cookie → 无法窃取
- 前端代码里根本不存在 Refresh Token 的变量 → 从源头消除了泄露风险
- 浏览器调用 `/auth/refresh` 时自动携带 → 前端不需要手动传递

### 如果不用 HttpOnly 会怎样？

很多项目图方便，把 Refresh Token 存在 localStorage 里，前端手动读取后拼到请求体中发送。这样做有一个致命隐患：

| 存储方式        | JS 可读 | XSS 可窃取 | 后果                                          |
| :-------------- | :------ | :--------- | :-------------------------------------------- |
| localStorage    | ✅      | ✅         | 攻击者拿到 Refresh Token → 7 天内随意冒充用户 |
| sessionStorage  | ✅      | ✅         | 同上，仅关闭标签页后失效                      |
| JS 内存变量     | ✅      | ✅         | 同上，刷新页面后失效                          |
| HttpOnly Cookie | ❌      | ❌         | 攻击者读不到，从根本上杜绝窃取                |

Refresh Token 有效期通常 7 天，一旦被 XSS 窃取，攻击者可以在 7 天内随意刷新 Access Token，等同于长期盗用账号。这不是理论风险，是真实发生过的事故。

### 替代方案：请求体传递 Refresh Token

如果你的后端暂时无法使用 HttpOnly Cookie（如跨域场景、老项目改造等），也可以在 refreshApiCall 中手动传递：

```typescript
createTokenRefreshInterceptor(instance, {
  // 手动从存储中读取 Refresh Token 并放入请求体
  refreshApiCall: () => {
    const refreshToken = sessionStorage.getItem('refresh_token')
    return instance.post('/auth/refresh', { refreshToken })
  },
  extractToken: (res) => res.data.accessToken
})
```

这种方式能正常工作，但 Refresh Token 暴露给了 JavaScript，存在 XSS 窃取风险。仅建议作为过渡方案，长期仍应迁移到 HttpOnly Cookie。

### 前后端协作流程（HttpOnly Cookie 方案）

整个无感刷新需要前后端配合完成，流程如下：

```txt
1. 用户登录
   前端 → POST /auth/login { username, password }
   后端 → Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict
   后端 → 响应体: { "accessToken": "eyJhbG..." }
   前端 → 将 accessToken 存入内存或 sessionStorage

2. 正常业务请求
   前端 → Authorization: Bearer <accessToken>    （手动设置请求头）
   前端 → Cookie: refreshToken=xxx               （浏览器自动携带）

3. Access Token 过期（返回 401）
   前端 → POST /auth/refresh                     （SDK 自动调用）
   浏览器 → 自动携带 HttpOnly Cookie 中的 refreshToken（前端无感知）
   后端 → 校验 refreshToken，签发新的 accessToken
   后端 → 响应体: { "accessToken": "new_eyJhbG..." }
   前端 → SDK 用新 accessToken 重试原请求         （用户无感知）

4. Refresh Token 也过期
   前端 → POST /auth/refresh
   后端 → 401 Unauthorized
   前端 → onRefreshFailure 回调，跳转登录页
```

注意第 3 步：前端调用 `/auth/refresh` 时，不需要也不可能在请求体中传递 Refresh Token —— 它由浏览器通过 Cookie 自动携带，这就是 HttpOnly 的意义。

### 后端需要做什么？

后端的配合非常简单，只需要两件事：

1. 登录接口下发 HttpOnly Cookie：

```bash
POST /auth/login
→ 200 OK
  Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh
  Body: { "accessToken": "eyJhbG..." }
```

2. 提供刷新接口：

```bash
POST /auth/refresh
Cookie: refreshToken=xxx  （浏览器自动携带）

→ 成功: { "accessToken": "new_eyJhbG..." }
→ 失败: 401 Unauthorized（Refresh Token 也过期或无效）
```

刷新接口从 Cookie 中读取 Refresh Token 并校验，合法则签发新的 Access Token 返回，非法则返回 401。前端不需要关心 Refresh Token 怎么传递的，refreshApiCall 只需发起一个 POST 请求即可。

### Access Token 存储建议

| Token 类型    | 推荐存储方式                | 不推荐           | 原因                     |
| :------------ | :-------------------------- | :--------------- | :----------------------- |
| Access Token  | 内存变量 / sessionStorage   | localStorage     | 短期有效，避免持久化泄露 |
| Refresh Token | HttpOnly Cookie（后端设置） | 任何前端可读位置 | 前端不可读，防 XSS 窃取  |

> 切勿将任何 Token 存入 localStorage，这是 XSS 攻击的高价值目标。

## 总结

Token 无感刷新看似简单，实则暗藏并发雪崩、无限循环、安全存储三大陷阱。本文梳理了一套经过验证的方案：

- 单例锁 —— 同一时间只允许一次刷新请求，杜绝并发雪崩
- 请求队列 —— 利用 Promise 机制将等待中的请求挂起，刷新成功后批量重试
- 重试标记 —— 防止重试请求再次进入刷新流程，切断死循环

这个方案不复杂，但需要每个细节都考虑到位。把核心逻辑理解清楚后，无论是手写还是基于现有封装，都能避免常见的那些坑。
