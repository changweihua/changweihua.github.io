---
lastUpdated: true
commentabled: true
recommended: true
title: 实现 503 自动重试与 Retry-After 支持
description: Axios 封装
date: 2025-10-11 10:00:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## 代码分析要点 ##

**核心功能**: 该代码的核心目标是创建一个 Axios 实例，该实例能够自动处理 `HTTP 503 (Service Unavailable)` 错误，并在满足条件时进行重试。

**重试策略**:

- *触发条件*: 仅当响应状态码为 `503` 且当前重试次数未达到最大限制 (`MAX_RETRIES`) 时触发。
- *延迟机制*: 采用混合策略：
  - *优先遵循 Retry-After 响应头*: 尝试解析服务器建议的等待时间（支持秒数和 HTTP 日期格式）。
  - *后备指数退避 (Exponential Backoff)*: 如果没有有效 `Retry-After`，则使用 `INITIAL_RETRY_DELAY_MS * (2 ** (retryCount - 1))` 计算延迟，并设置了最大延迟上限 (`MAX_RETRY_DELAY_MS`)。
- *重试执行*: 使用 `setTimeout` 实现异步延迟，然后使用同一个 Axios 实例 (apiClient) 重新发起请求，并将新的 Promise 返回，使得调用链可以继续。

**状态管理**:

- 通过在请求配置对象 `config` 上附加 `_retryCount` 属性来跟踪每个请求的重试次数。
- 请求拦截器确保了 `_retryCount` 在首次请求时被初始化（或存在）。


**简洁性与专注性**: 代码专注于 503 重试逻辑，没有耦合其他功能（如全局 Loading、Token 认证、特定业务错误处理等），使其更易于理解和集成到不同的项目中。

**错误处理**: 对于非 503 错误、网络错误或达到最大重试次数的情况，代码直接将错误 `Promise.reject(error)` 出去，交由最终的调用者处理。包含了对重试耗尽情况的特定日志记录。

**可配置性**: 重试次数、初始延迟、最大延迟都通过常量定义，易于调整。

**依赖**: 仅依赖 `axios`。

## 完整代码 ##

```js
import axios from 'axios';

// --- 重试配置常量 ---
const MAX_RETRIES = 3; // 最大重试次数
const INITIAL_RETRY_DELAY_MS = 1000; // 初始重试延迟（毫秒），用于指数退避
const MAX_RETRY_DELAY_MS = 10000; // 最大重试延迟（毫秒），例如 10 秒

/**
 * 创建一个延迟指定毫秒数的 Promise
 * @param {number} ms - 延迟的毫秒数
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 计算重试延迟时间 (毫秒)
 * 优先使用 Retry-After 头，否则使用指数退避
 * @param {number} retryCount - 当前是第几次重试 (从 1 开始)
 * @param {object | null | undefined} responseHeaders - Axios 响应头对象 (通常是小写 key)
 * @returns {number} - 计算出的延迟毫秒数
 */
const calculateRetryDelay = (retryCount, responseHeaders) => {
  let delayMs = 0;
  const retryAfterHeader = responseHeaders?.['retry-after']; // Axios header keys are often lowercase

  if (retryAfterHeader) {
    // 尝试解析秒数
    const retryAfterSeconds = parseInt(retryAfterHeader, 10);
    if (!isNaN(retryAfterSeconds)) {
      delayMs = retryAfterSeconds * 1000;
      console.log(`[Axios Retry] Using Retry-After header (seconds): ${retryAfterSeconds}s`);
    } else {
      // 尝试解析 HTTP 日期格式
      try {
        const retryDate = new Date(retryAfterHeader);
        if (!isNaN(retryDate.getTime())) {
          const waitTime = retryDate.getTime() - Date.now();
          delayMs = Math.max(0, waitTime); // 确保非负
          console.log(`[Axios Retry] Using Retry-After header (date): ${retryAfterHeader}. Wait ${delayMs}ms`);
        }
      } catch (e) {
        console.warn('[Axios Retry] Could not parse Retry-After header date format:', retryAfterHeader);
      }
    }
  }

  // 如果没有有效的 Retry-After，或者计算出的延迟为 0 或负数，则使用指数退避
  if (delayMs <= 0) {
    // prettier-ignore
    delayMs = Math.min(
      INITIAL_RETRY_DELAY_MS * (2 ** (retryCount - 1)), // 指数增长
      MAX_RETRY_DELAY_MS // 不超过最大延迟
    );
    console.log(`[Axios Retry] Using Exponential Backoff. Wait ${delayMs}ms`);
  }

  // 再次确保不超过最大延迟
  return Math.min(delayMs, MAX_RETRY_DELAY_MS);
};

// --- 创建并配置 Axios 实例 ---
const apiClient = axios.create({
  baseURL: '/api', // 设置你的 API 基础 URL
  timeout: 15000,  // 设置合理的请求超时
  headers: {
    'Content-Type': 'application/json',
    // 你可以在这里添加其他全局默认请求头, 如 'Accept': 'application/json'
  }
});

// --- 请求拦截器：初始化重试计数 ---
// （如果不需要与其他拦截器交互，这个拦截器也可以省略，
//  然后在响应拦截器错误处理中检查 config._retryCount 是否存在并初始化）
//  但保留它更清晰地表明我们依赖这个属性。
apiClient.interceptors.request.use(
  (config) => {
    // 只在原始请求时初始化重试计数 (如果不存在)
    if (config._retryCount === undefined) {
      config._retryCount = 0;
    }
    return config;
  },
  (error) => {
    console.error('[Axios Request Setup Error]', error);
    return Promise.reject(error);
  }
);

// --- 响应拦截器：处理 503 和重试逻辑 ---
apiClient.interceptors.response.use(
  (response) => {
    // 对于成功的响应 (2xx)，直接返回
    return response;
  },
  async (error) => { // 错误处理函数改为 async
    const { config, response } = error;

    // 1. 检查是否满足重试条件
    //    - config 存在 (请求配置正常)
    //    - response 存在 (收到了服务器响应)
    //    - 响应状态码是 503
    //    - 当前重试次数小于最大值
    config._retryCount = config._retryCount || 0; // 确保计数器存在

    // 对 503 和 429 都能自动重试且支持 Retry-After 控制
    if (config && [503, 429].includes(response?.status) && config._retryCount < MAX_RETRIES) {
      // --- 执行重试 ---
      config._retryCount += 1; // 增加重试计数

      // 计算延迟
      const delayMs = calculateRetryDelay(config._retryCount, response.headers);

      console.log(`[Axios Retry] Attempt ${config._retryCount}/${MAX_RETRIES} for ${config.url} after ${delayMs}ms delay due to 503.`);

      // 等待
      await delay(delayMs);

      // 重新发起请求
      console.log(`[Axios Retry] Retrying request: ${config.url}`);
      // 使用同一个 apiClient 实例重新请求，传递更新后的 config
      return apiClient(config);
    }

    // 2. 如果不满足重试条件，则拒绝 Promise
    if (response?.status === 503) { // 如果是因为重试次数耗尽而失败
        console.error(`[Axios Retry] Max retries (${MAX_RETRIES}) reached for 503 on ${config?.url}. Rejecting.`, error);
    } else { // 其他错误 (非 503, 网络错误等)
        // console.error('[Axios Response Interceptor Error]', error.message);
    }

    // 将原始错误或最后一次重试的错误传递下去
    return Promise.reject(error);
  }
);

// --- 导出配置好的纯净版 Axios 实例 ---
export default apiClient;
```

## 使用示例 ##

```js
// --- 使用示例 (与之前相同) ---
import apiClient from './pureApiClient'; // 导入这个纯净版实例

async function fetchData() {
  try {
    const response = await apiClient.get('/your/endpoint');
    console.log('Data fetched successfully:', response.data);
  } catch (error) {
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data || error.message);
      if (error.response.status === 503) {
          alert('服务器暂时不可用，请稍后再试 (已自动重试).');
      } else {
          // 处理其他需要展示给用户的错误
          alert(`请求失败: ${error.response.statusText || error.message}`);
      }
    } else {
      console.error('Network or other error:', error.message);
      alert('网络错误或请求未能发出。');
    }
  }
}

fetchData();
```

## 总结 ##

这是一段良好、健壮且专注的 Axios 封装代码，用于实现带 `Retry-After` 支持和指数退避的 503 自动重试功能。它逻辑清晰，考虑了关键的重试策略要素，并且保持了代码的简洁性，适合作为处理此类网络问题的通用模块。
