---
lastUpdated: true
commentabled: true
recommended: true
title: 可取消的异步任务与 AbortController
description: 可取消的异步任务与 AbortController
date: 2026-07-17 09:15:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

## AbortController 底层原理

- `AbortController` 是Web API标准（whatwg），在浏览器和Node.js 15+都可用。
- 内部维护一个 AbortSignal 实例，该实例有一个标志 aborted 和一个回调列表（监听abort事件）。
- 调用 `controller.abort()` 时，将 `signal.aborted` 设为 true，并通过触发所有通过 `signal.addEventListener("abort")` 注册的回调。
- 支持自定义异步任务取消：在异步操作内监听 `signal.abort` 事件，主动中断操作（例如清理定时器、拒绝Promise）。

## 广泛使用场景

- Fetch请求取消：避免过期请求返回后，覆盖最新数据。
- 事件 监听器 清理：使用 `signal` 一次性移除多个监听事件。
- 防抖/节流增强：可取消延迟执行。
- 异步队列任务：取消未开始的批量任务。
- React 组件卸载时：取消所有进行中的请求。

## 深度代码示例

### 示例：取消fetch请求

```ts
const controller = new AbortController()
const { signal } = controller

fetch('/api/data', { signal })
  .then((res) => res.json())
  .catch((err) => {
    if (err.name === 'AbortError') console.log('请求已取消')
  })

// 延迟100ms后取消
setTimeout(() => controller.abort(), 100)
```

### 示例2：同时取消多个异步任务（使用同一个signal）

```javascript
function cancellableDelay(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      })
    }
  })
}

const controller = new AbortController()
cancellableDelay(1000, controller.signal).catch((e) => console.log(e.name))
setTimeout(() => controller.abort(), 500) // 500ms后取消
```

### 示例3：封装支持取消的异步迭代器（生成器）

```javascript
async function* cancellableGenerator(iterable, signal) {
  for (const item of iterable) {
    if (signal.aborted) throw new Error('Generator aborted')
    // 模拟异步处理
    await new Promise((resolve) => setTimeout(resolve, 100))
    yield item
  }
}

const controller = new AbortController()
const gen = cancellableGenerator([1, 2, 3, 4, 5], controller.signal)
;(async () => {
  for await (const val of gen) {
    console.log(val)
    if (val === 3) {
      controller.abort()
    }
  }
})()
```

## 项目实战：实现一个支持取消、超时、重试的通用请求函数

需求：封装 fetchWithRetry，支持取消（AbortController）、超时自动取消、失败重试（指数退避）。

```javascript
async function fetchWithRetry(url, options = {}) {
  const { timeout = 5000, maxRetries = 3, retryDelay = 1000, ...fetchOptions } = options
  let lastError
  const outerController = new AbortController()

  // 超时定时器
  const timeoutId = setTimeout(() => outerController.abort(), timeout)

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const signal = controller.signal
    // 父级取消时，子请求也取消
    outerController.signal.addEventListener('abort', () => controller.abort())

    try {
      const response = await fetch(url, { ...fetchOptions, signal })
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response
    } catch (err) {
      lastError = err
      if (err.name === 'AbortError') {
        // 超时或主动取消不再重试
        throw new Error('Request aborted or timeout')
      }
      if (attempt === maxRetries) break
      // 指数退避延迟
      const delay = retryDelay * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw lastError
}

// 使用
const controller = new AbortController()
fetchWithRetry('https://api.example.com/data', { timeout: 2000 })
  .then((res) => res.json())
  .catch((e) => console.error(e))
// 可手动取消
// controller.abort();
```

## 大厂面试官追问

### Q1: AbortController 能否取消正在执行的Promise链？例如已经then注册的回调？

不能直接取消已经开始执行的Promise链（因为Promise一旦创建就无法撤销）。但是可以在每个then回调中检查 `signal.aborted` 并提前返回或throw。

更优雅的方式是使用 `Promise.race` 配合reject信号。

### Q2: 如何实现一个可取消的 setTimeout 但不用 clearTimeout，而是用Promise？

利用 `Promise.race`

```javascript
function cancellableDelay(ms, signal) {
  const delayPromise = new Promise((resolve) => setTimeout(resolve, ms))
  const abortPromise = new Promise((_, reject) => {
    if (signal) signal.addEventListener('abort', () => reject(new Error('aborted')))
  })
  return Promise.race([delayPromise, abortPromise])
}
```

### Q3: AbortSignal 可以实现超时自动触发吗？Node.js 中的 AbortSignal.timeout() 是什么？

可以！Node.js 17.3+ 支持 `AbortSignal.timeout(ms)`，返回一个在指定毫秒后自动 abort 的 signal。浏览器中可使用 `AbortSignal.timeout` （较新版本）。

手动实现：`new AbortController()` + `setTimeout(() => controller.abort(), ms)`。

### Q4: 如何使用 AbortController 取消一个正在进行的WebSocket连接？

标准的 WebSocket API 没有原生支持 AbortController，但是可以包装：在abort事件中调用 `ws.close()` 并reject。或者使用ws库（Node.js）支持signal选项。

## API跨环境适用性总结

| API                     | 浏览器 | Node.js | 通用 | 实际使用场景                                                                        |
| :---------------------- | :----- | :------ | :--- | :---------------------------------------------------------------------------------- |
| `queueMicrotask`        | ✅     | ✅      | ✅   | 安全地将任务放入微任务队列，避免 Promise 开销。适用于库中需要异步但优先级高的操作。 |
| `MessageChannel`        | ✅     | ✅      | ✅   | 跨线程/跨 iframe/跨 Worker 通信。在微前端或复杂 Web Worker 通信中非常有用。         |
| `requestIdleCallback`   | ✅     | ✅      | ✅   | 浏览器中执行低优先级后台任务（如数据预加载、埋点上报），避免影响动画。              |
| `requestAnimationFrame` | ✅     | ❌      | ✅   | 浏览器动画、批量 DOM 更新、帧率控制。                                               |
| `setTimeout`            | ❌     | ✅      | ✅   | Node.js 中在当前事件循环的 `check` 阶段立即执行，比 `setTimeout(fn, 0)` 快。        |
| `process.nextTick`      | ❌     | ✅      | ✅   | Node.js 中在同一阶段内优先执行的任务，用于错误处理或继续执行。                      |
| `AbortController`       | ✅     | ✅      | ✅   | 取消 fetch、自定义异步任务、事件监听器批量移除。                                    |

### 实际应用案例

- `queueMicrotask`：在Vue或者React的nextTick类似实现中，用于在DOM更新后执行回调。
- `MessageChannel`：React调度器（Scheduler）中使用MessageChannel产生宏任务，以不延迟的方法实现高优先级更新。
- `requestIdleCallback`：Google Analytics在空闲时发送数据；React的fiber并发模式曾经依赖他（现用MessageChannel）。
- `requestAnimationFrame`：滚动视差动画、Canvas游戏循环、高性能拖拽。
- `setImmediate`（Node.js）：在递归调用中替代 `setTimeout(fn,0)` 避免延迟钳制。
- `process.nextTick`：用于确保事件循环继续之前执行某些操作，例如 EventEmitter 的错误处理。
