---
lastUpdated: true
commentabled: true
recommended: true
title: Promise.withResolvers
description: Promise.withResolvers
date: 2025-12-30 13:15:00 
pageClass: blog-page-class
cover: /covers/typescript.svg
---

在 `es` 的异步编程世界中，Promise 已经成为处理异步操作的标准方式。然而，在某些场景下，传统的 Promise 构造函数模式显得不够灵活。`Promise.withResolvers` 是 ES2024（ES14）中引入的一个静态方法，它提供了一种更优雅的方式来创建 Promise，并同时获得其 resolve 和 reject 函数的引用。

## :look: 什么是 Promise.withResolvers ##

`Promise.withResolvers` 是一个静态方法，它返回一个对象，包含三个属性：

- `promise`: 一个 Promise 对象
- `resolve`: 用于解决（fulfill）该 Promise 的函数
- `reject`: 用于拒绝（reject）该 Promise 的函数

### 基本语法 ###

```javascript
const { promise, resolve, reject } = Promise.withResolvers();
```

这个方法的核心优势在于：*你可以在 Promise 外部控制其状态，这在许多场景下非常有用*。

## 为什么 Promise.withResolvers挺实用？ ##

### 先看传统 Promise 的局限性 ###

在 `Promise.withResolvers` 出现之前，如果我们想要在 `Promise` 外部控制其状态，通常需要这样做：

```javascript
let resolvePromise;
let rejectPromise;

const myPromise = new Promise((resolve, reject) => {
  resolvePromise = resolve;
  rejectPromise = reject;
});

// 现在可以在外部使用 resolvePromise 和 rejectPromise
setTimeout(() => {
  resolvePromise('成功！');
}, 1000);
```

这种方法虽然可行，但存在以下问题：

- 代码冗余：每次都需要创建临时变量，会导致一坨地雷
- 作用域污染：需要在外部作用域声明变量
- 不够优雅：代码结构不够清晰
- 容易出错：如果忘记赋值，会导致运行时错误

### Promise.withResolvers解决了啥？ ###

`Promise.withResolvers` 解决了上述所有问题：

```javascript
const { promise, resolve, reject } = Promise.withResolvers();

// 简洁、清晰、安全
setTimeout(() => {
  resolve('成功！');
}, 1000);
```

## 语法和用法 ##

### 基本语法 ###

```javascript
const { promise, resolve, reject } = Promise.withResolvers();
```

### 返回值 ###

`Promise.withResolvers()` 返回一个普通对象，包含：

- promise: 一个处于 `pending` 状态的 `Promise` 对象
- resolve: 一个函数，调用时会将 `promise` 变为 `fulfilled` 状态
- reject: 一个函数，调用时会将 `promise` 变为 `rejected` 状态

### 基本示例 ###

#### 示例 1：简单的延迟解析 ####

```javascript
const { promise, resolve } = Promise.withResolvers();

// 1 秒后解析 Promise
setTimeout(() => {
  resolve('数据加载完成');
}, 1000);

promise.then(value => {
  console.log(value); // 1 秒后输出: "数据加载完成"
});
```

#### 示例 2：处理错误 ####

```javascript
const { promise, resolve, reject } = Promise.withResolvers();

// 模拟异步操作
setTimeout(() => {
  const success = Math.random() > 0.5;
  if (success) {
    resolve('操作成功');
  } else {
    reject(new Error('操作失败'));
  }
}, 1000);

promise
  .then(value => console.log(value))
  .catch(error => console.error(error));
```

#### 示例 3：多次调用 resolve/reject 的行为 ####

```javascript
const { promise, resolve, reject } = Promise.withResolvers();

resolve('第一次');
resolve('第二次'); // 无效，Promise 状态已确定
reject(new Error('错误')); // 无效，Promise 状态已确定

promise.then(value => {
  console.log(value); // 输出: "第一次"
});
```

> 重要提示：一旦 `Promise` 被 `resolve` 或 `reject`，其状态就确定了，后续的 `resolve` 或 `reject` 调用将被忽略。

## 与传统方法的对比 ##

### 场景 1：事件监听器中的 Promise ###

#### 传统方法 ####

```javascript
function waitForClick() {
  let resolveClick;
  let rejectClick;
  
  const promise = new Promise((resolve, reject) => {
    resolveClick = resolve;
    rejectClick = reject;
  });
  
  const button = document.getElementById('myButton');
  const timeout = setTimeout(() => {
    button.removeEventListener('click', onClick);
    rejectClick(new Error('超时'));
  }, 5000);
  
  function onClick(event) {
    clearTimeout(timeout);
    button.removeEventListener('click', onClick);
    resolveClick(event);
  }
  
  button.addEventListener('click', onClick);
  
  return promise;
}
```

#### 使用 `Promise.withResolvers` ####

```javascript
function waitForClick() {
  const { promise, resolve, reject } = Promise.withResolvers();
  
  const button = document.getElementById('myButton');
  const timeout = setTimeout(() => {
    button.removeEventListener('click', onClick);
    reject(new Error('超时'));
  }, 5000);
  
  function onClick(event) {
    clearTimeout(timeout);
    button.removeEventListener('click', onClick);
    resolve(event);
  }
  
  button.addEventListener('click', onClick);
  
  return promise;
}
```

**优势**：

- 代码更简洁
- 不需要在外部作用域声明变量
- 结构更清晰

### 场景 2：流式数据处理 ###

#### 传统方法 ####

```javascript
function createStreamProcessor() {
  let resolveStream;
  let rejectStream;
  
  const promise = new Promise((resolve, reject) => {
    resolveStream = resolve;
    rejectStream = reject;
  });
  
  // 模拟流式处理
  const chunks = [];
  let isComplete = false;
  
  function processChunk(chunk) {
    if (isComplete) return;
    chunks.push(chunk);
    
    if (chunk.isLast) {
      isComplete = true;
      resolveStream(chunks);
    }
  }
  
  function handleError(error) {
    if (isComplete) return;
    isComplete = true;
    rejectStream(error);
  }
  
  return { promise, processChunk, handleError };
}
```

#### 使用 `Promise.withResolvers` ####

```javascript
function createStreamProcessor() {
  const { promise, resolve, reject } = Promise.withResolvers();
  
  const chunks = [];
  let isComplete = false;
  
  function processChunk(chunk) {
    if (isComplete) return;
    chunks.push(chunk);
    
    if (chunk.isLast) {
      isComplete = true;
      resolve(chunks);
    }
  }
  
  function handleError(error) {
    if (isComplete) return;
    isComplete = true;
    reject(error);
  }
  
  return { promise, processChunk, handleError };
}
```

## 实际应用场景 ##

### 场景 1：用户交互等待 ###

```javascript
// 等待用户确认操作
function waitForUserConfirmation(message) {
  const { promise, resolve, reject } = Promise.withResolvers();
  
  const modal = document.createElement('div');
  modal.className = 'confirmation-modal';
  modal.innerHTML = `
    <p>${message}</p>
    <button class="confirm">确认</button>
    <button class="cancel">取消</button>
  `;
  
  modal.querySelector('.confirm').addEventListener('click', () => {
    if (modal.parentNode) {
      document.body.removeChild(modal);
    }
    resolve(true);
  });
  
  modal.querySelector('.cancel').addEventListener('click', () => {
    if (modal.parentNode) {
      document.body.removeChild(modal);
    }
    reject(new Error('用户取消'));
  });
  
  document.body.appendChild(modal);
  
  return promise;
}

// 使用
waitForUserConfirmation('确定要删除这个文件吗？')
  .then(() => console.log('用户确认'))
  .catch(() => console.log('用户取消'));
```

### 场景 2：WebSocket 消息等待 ###

```javascript
class WebSocketManager {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.pendingRequests = new Map();
    this.requestId = 0;
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { requestId, response, error } = data;
      
      const pending = this.pendingRequests.get(requestId);
      if (pending) {
        this.pendingRequests.delete(requestId);
        if (error) {
          pending.reject(new Error(error));
        } else {
          pending.resolve(response);
        }
      }
    };
  }
  
  sendRequest(message) {
    const { promise, resolve, reject } = Promise.withResolvers();
    const requestId = ++this.requestId;
    
    this.pendingRequests.set(requestId, { resolve, reject });
    
    this.ws.send(JSON.stringify({
      requestId,
      message
    }));
    
    // 设置超时
    setTimeout(() => {
      if (this.pendingRequests.has(requestId)) {
        this.pendingRequests.delete(requestId);
        reject(new Error('请求超时'));
      }
    }, 5000);
    
    return promise;
  }
}

// 使用
const wsManager = new WebSocketManager('ws://example.com');
wsManager.sendRequest('获取用户信息')
  .then(data => console.log('收到响应:', data))
  .catch(error => console.error('错误:', error));
```

### 场景 3：文件上传进度 ###

```javascript
function uploadFileWithProgress(file, url) {
  const { promise, resolve, reject } = Promise.withResolvers();
  
  const xhr = new XMLHttpRequest();
  const formData = new FormData();
  formData.append('file', file);
  
  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      console.log(`上传进度: ${percentComplete.toFixed(2)}%`);
    }
  });
  
  xhr.addEventListener('load', () => {
    if (xhr.status === 200) {
      resolve(JSON.parse(xhr.responseText));
    } else {
      reject(new Error(`上传失败: ${xhr.status}`));
    }
  });
  
  xhr.addEventListener('error', () => {
    reject(new Error('网络错误'));
  });
  
  xhr.addEventListener('abort', () => {
    reject(new Error('上传已取消'));
  });
  
  xhr.open('POST', url);
  xhr.send(formData);
  
  // 返回 Promise 和取消函数
  return {
    promise,
    cancel: () => xhr.abort()
  };
}

// 使用
const { promise, cancel } = uploadFileWithProgress(file, '/api/upload');
promise
  .then(result => console.log('上传成功:', result))
  .catch(error => console.error('上传失败:', error));
```

### 场景 4：可取消的异步操作 ###

```javascript
function createCancellableOperation(operation) {
  const { promise, resolve, reject } = Promise.withResolvers();
  let cancelled = false;
  
  operation()
    .then(result => {
      if (!cancelled) {
        resolve(result);
      }
    })
    .catch(error => {
      if (!cancelled) {
        reject(error);
      }
    });
  
  return {
    promise,
    cancel: () => {
      cancelled = true;
      reject(new Error('操作已取消'));
    }
  };
}

// 使用
const { promise, cancel } = createCancellableOperation(
  () => fetch('/api/data').then(r => r.json())
);

// 3 秒后取消
setTimeout(() => cancel(), 3000);

promise
  .then(data => console.log('数据:', data))
  .catch(error => console.error('错误:', error));
```

### 场景 5：队列处理 ###

```javascript
class TaskQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }
  
  add(task) {
    const { promise, resolve, reject } = Promise.withResolvers();
    
    this.queue.push({
      task,
      resolve,
      reject
    });
    
    this.process();
    
    return promise;
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();
      
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    
    this.processing = false;
  }
}

// 使用
const queue = new TaskQueue();

queue.add(() => fetch('/api/task1').then(r => r.json()))
  .then(result => console.log('任务1完成:', result));

queue.add(() => fetch('/api/task2').then(r => r.json()))
  .then(result => console.log('任务2完成:', result));
```

## 深入理解：工作原理 ##

### `Promise.withResolvers` 的实现原理 ###

虽然 `Promise.withResolvers` 是原生 API，但我们可以通过理解其等价实现来加深理解：

```javascript
// Promise.withResolvers 的等价实现
function withResolvers() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
```

### 内存和性能考虑 ###

`Promise.withResolvers` 的实现是高度优化的。它：

- 避免闭包开销：原生实现避免了额外的闭包创建
- 内存效率：直接返回引用，无需额外的变量存储
- 性能优化：浏览器引擎级别的优化

### 与 Promise 构造函数的关系 ###

```javascript
// 这两种方式是等价的（在功能上）
const { promise, resolve, reject } = Promise.withResolvers();

// 等价于
let resolve, reject;
const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});
```

但 `Promise.withResolvers` 提供了：

- 更简洁的语法
- 更好的可读性
- 标准化的 API

## 浏览器兼容性和 Polyfill ##

### 浏览器支持 ###

`Promise.withResolvers` 是 ES2024 的特性，目前（2024年）的支持情况：

- ✅ Chrome 119+
- ✅ Firefox 121+
- ✅ Safari 17.4+
- ✅ Node.js 22.0.0+
- ❌ 旧版本浏览器不支持

### Polyfill 实现 ###

如果需要在不支持的浏览器中使用，可以使用以下 polyfill：

```javascript
if (!Promise.withResolvers) {
  Promise.withResolvers = function() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
```

### 使用 Polyfill 的完整示例 ###

```javascript
// 在项目入口文件添加
(function() {
  if (typeof Promise.withResolvers !== 'function') {
    Promise.withResolvers = function() {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
  }
})();

// 现在可以在任何地方使用
const { promise, resolve, reject } = Promise.withResolvers();
```

### 使用 core-js ###

如果你使用 `core-js`，可以导入相应的 `polyfill`：

```javascript
import 'core-js/actual/promise/with-resolvers';
```

## 最佳实践和注意 ##

### 避免重复调用 resolve/reject ###

```javascript
const { promise, resolve, reject } = Promise.withResolvers();

resolve('第一次');
resolve('第二次'); // 无效，但不会报错

// 最佳实践：添加状态检查
let isResolved = false;
function safeResolve(value) {
  if (!isResolved) {
    isResolved = true;
    resolve(value);
  }
}
```

### 处理错误情况 ###

```javascript
const { promise, resolve, reject } = Promise.withResolvers();

try {
  // 某些可能抛出错误的操作
  const result = riskyOperation();
  resolve(result);
} catch (error) {
  reject(error);
}
```

### 清理资源 ###

```javascript
function createResourceManager() {
  const { promise, resolve: originalResolve, reject: originalReject } = Promise.withResolvers();
  const resources = [];
  
  function cleanup() {
    resources.forEach(resource => resource.cleanup());
  }
  
  // 创建包装函数，确保在 resolve 或 reject 时清理资源
  const resolve = (value) => {
    cleanup();
    originalResolve(value);
  };
  
  const reject = (error) => {
    cleanup();
    originalReject(error);
  };
  
  return { promise, resolve, reject };
}
```

### 类型安全（TypeScript） ###

在 TypeScript 中，`Promise.withResolvers` 的类型定义：

```typescript
interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

// 使用
const { promise, resolve, reject }: PromiseWithResolvers<string> = 
  Promise.withResolvers<string>();
```

### 避免内存泄漏 ###

```javascript
// 不好的做法：持有大量未完成的 Promise，没有清理机制
const pendingPromises = new Map();

function createRequest(id) {
  const { promise, resolve } = Promise.withResolvers();
  pendingPromises.set(id, { promise, resolve });
  return promise;
  // 问题：如果 Promise 永远不会 resolve，会一直占用内存
}

// 好的做法：设置超时和清理机制
const pendingPromises = new Map(); // 在实际应用中，这应该是类或模块级别的变量

function createRequestWithTimeout(id, timeout = 5000) {
  const { promise, resolve, reject } = Promise.withResolvers();
  
  const timeoutId = setTimeout(() => {
    if (pendingPromises.has(id)) {
      pendingPromises.delete(id);
      reject(new Error('请求超时'));
    }
  }, timeout);
  
  pendingPromises.set(id, {
    promise,
    resolve: (value) => {
      clearTimeout(timeoutId);
      pendingPromises.delete(id);
      resolve(value);
    },
    reject: (error) => {
      clearTimeout(timeoutId);
      pendingPromises.delete(id);
      reject(error);
    }
  });
  
  return promise;
}
```

### 与 async/await 结合使用 ###

```javascript
async function processWithResolvers() {
  const { promise, resolve, reject } = Promise.withResolvers();
  
  // 在异步操作中控制 Promise
  setTimeout(() => {
    resolve('完成');
  }, 1000);
  
  try {
    const result = await promise;
    console.log('结果:', result);
  } catch (error) {
    console.error('错误:', error);
  }
}
```

## 总结 ##

`Promise.withResolvers` 是 es 异步编程的一个重要补充，它解决了在 Promise 外部控制其状态的需求。通过本文的详细讲解，我们了解到：

### 核心要点 ###

- 简洁性：提供了更优雅的 API 来创建可外部控制的 Promise
- 实用性：在事件处理、流式处理、WebSocket 等场景中非常有用
- 标准化：作为 ES2024 标准的一部分，提供了统一的解决方案

### 适用场景 ###

- ✅ 需要在 Promise 外部控制其状态
- ✅ 事件驱动的异步操作
- ✅ 流式数据处理
- ✅ 可取消的异步操作
- ✅ 队列和任务管理

### 注意 ###

- ⚠️ 浏览器兼容性（需要 polyfill 或现代浏览器）
- ⚠️ 尤其得避免重复调用 resolve/reject
- ⚠️ 注意资源清理和内存管理
