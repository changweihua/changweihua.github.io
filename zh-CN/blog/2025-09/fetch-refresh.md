---
lastUpdated: true
commentabled: true
recommended: true
title: 封装fetch请求 带401请求重试
description: 封装fetch请求 带401请求重试
date: 2025-09-28 15:20:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

```js
import { getReToken, getToken, setReToken, setToken, removeReToken, removeToken } from '@/utils/auth';
import useEnterStore from '@/store/modules/enterprise';
import { refreshToken } from '@/api/login';

// --- 状态和配置  ---
let isRefreshing = ref(false);
let failedQueue = [];

// --- 队列处理器 ---
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- 核心 fetch 封装 ---
async function fetchWithAuth(url, options = {}) {
  const enterStore = useEnterStore();
  // 1. 获取 token 并添加到请求头
  const headers = new Headers(options.headers || {});
  if (getToken()) {
    headers.set('Authorization', `Bearer ${getToken()}`);
  }
  options.headers = headers;
  // 2. 发起原始请求
  const response = await fetch(url, options);
  // 3. 检查是否是 token 过期错误 (401)
  if (response.status === 401) {
    if (isRefreshing.value) {
      // 如果已经在刷新 token，则将当前请求加入队列等待
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        // 等待刷新成功后，用新 token 重试
        headers.set('Authorization', `Bearer ${newToken}`);
        options.headers = headers;
        return fetch(url, options);
      });
    }
    isRefreshing.value = true;
    try {
      if (!getReToken()) {
        // 换取新token失败，跳转到登出页面
        location.href = '/app/mobile/logout';
        return Promise.reject(new Error('Session expired. No refresh token.'));
      }
      // 4. 发起刷新 token 的请求
      let res = await refreshToken(enterStore.enterInfo.authAddress, enterStore.enterInfo.id, enterStore.enterInfo.clientId);
      const { access_token, expires_in, refresh_token, refresh_expires_in } = res;
      // 5. 更新 token 并处理等待队列
      setToken(access_token, expires_in);
      setReToken(refresh_token, refresh_expires_in);
      processQueue(null, access_token);
      // 6. 用新 token 重试原始请求
      headers.set('Authorization', `Bearer ${access_token}`);
      options.headers = headers;
      return fetch(url, options);
    } catch (error) {
      // 刷新失败，登出并拒绝所有等待的请求
      processQueue(error, null);
      location.href = '/app/mobile/logout';
      return Promise.reject(error);
    } finally {
      isRefreshing.value = false;
    }
  }
  // 如果不是 401 错误，直接返回响应
  return response;
}

// --- 导出的 Composable 函数 ---

export function useApi() {
  // 返回一个可以直接使用的 fetch 实例
  return {
    apiFetch: fetchWithAuth,
  };
}
```

## 关键代码块详解 ##

### 状态和队列 ( `isRefreshing`, `failedQueue`) ###

```js
// --- 状态和配置  ---
let isRefreshing = ref(false);
let failedQueue = [];
```

- `isRefreshing`: 这是一个“锁”或“标志位”。它的作用是告诉整个应用：“当前是否已经有请求正在刷新 token？”。`ref(false)` 意味着它是一个响应式变量，虽然在这里主要用于逻辑判断。
- `failedQueue`: 这是一个“等待队列”。当 `isRefreshing` 为 `true` 时，所有后续失败的请求都会被暂时存放到这个队列里，等待被“唤醒”。

### 队列处理器 (`processQueue`) ###

```javascript
// --- 队列处理器 ---
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error); // 如果刷新失败，就通知所有等待的请求：你们也失败了
    } else {
      prom.resolve(token); // 如果刷新成功，就用新 token “唤醒”所有等待的请求
    }
  });
  failedQueue = []; // 处理完后清空队列
};
```

这个函数是 `failedQueue` 的配套工具。它的职责是在 `token` 刷新操作结束后（无论成功或失败），去处理所有在队列中等待的请求。

### 核心请求函数 (`fetchWithAuth`) ###

#### 步骤 1 & 2: 正常请求 ####

```javascript
const headers = new Headers(options.headers || {});
if (getToken()) {
  headers.set('Authorization', `Bearer ${getToken()}`);
}
// ...
const response = await fetch(url, options);
```

这部分很简单：为请求附加 `Authorization` 头，然后正常发送。

#### 步骤 3: 拦截 401 错误 ####

```js
if (response.status === 401) {
  // ...
}
```

这是整个逻辑的触发点。

#### 并发处理逻辑 ####

```javascript
if (isRefreshing.value) {
  // 如果已经在刷新 token，则将当前请求加入队列等待
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  }).then((newToken) => {
    // ...用新 token 重试
  });
}
isRefreshing.value = true; // 第一个失败的请求，加锁！
```

- 当一个请求收到 `401` 时，它首先检查 `isRefreshing`。
- 如果为 `true`，说明“有人已经在路上去拿新钥匙了”，于是它就通过 `new Promise` 把自己挂起，并将 `resolve` 和 `reject` 函数存入  `failedQueue`，然后安静地等待。
- 如果为 `false`，说明它是第一个发现问题的请求。它会立刻把 `isRefreshing` 设为 `true`，相当于“锁门”，防止其他人重复去拿钥匙。然后它继续往下执行刷新 `token` 的逻辑。

#### 步骤 4: 刷新 Token ####


```js
try {
  // ...
  let res = await refreshToken(...);
  // ...
} catch (error) {
  // ...
} finally {
  isRefreshing.value = false; // 无论成功失败，最后都要“开锁”
}
```

- 这个 `try...catch...finally` 结构非常健壮。
- 它调用 `refreshToken` API。如果成功，就继续往下走。
- 如果 `refreshToken` 本身也失败了（例如 `refresh token` 也过期了），`catch` 块会执行，处理所有等待的请求（通知它们失败），然后强制用户登出。
- `finally` 确保了在所有操作结束后，`isRefreshing` 这个“锁”一定会被重置为 `false`，以便下次能正常工作。

#### 步骤 5 & 6: 更新与重试 ####


```js
// 5. 更新 token 并处理等待队列
setToken(access_token, expires_in);
setReToken(refresh_token, refresh_expires_in);
processQueue(null, access_token); // "唤醒"所有等待的请求

// 6. 用新 token 重试原始请求
headers.set('Authorization', `Bearer ${access_token}`);
return fetch(url, options);
```

- 刷新成功后，它会用新的 `token` 更新本地存储。
- 调用 `processQueue`，把新的 `access_token` 传递给所有在队列里等待的 `Promise`，触发它们的 `.then((newToken) => ...)` 逻辑，让它们也用新 `token` 重新发起请求。
- 最后，这个“领头”的请求自己也用新 `token` 重新发起了一次它最初失败的请求。
