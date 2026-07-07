---
lastUpdated: true
commentabled: true
recommended: true
title: 前端 SSE 流式请求三种实现方案全解析
description: 前端 SSE 流式请求三种实现方案全解析
date: 2026-06-22 10:35:00
pageClass: blog-page-class
cover: /covers/ai.svg
---

> 本文深入对比了前端实现 SSE（Server-Sent Events）流式请求的三种主流方案，包括原理剖析、代码示例、优劣对比和实战踩坑经验，帮助开发者选择最适合的技术方案。

## 一、什么是 SSE？

SSE（Server-Sent Events）是 HTML5 标准的一部分，允许服务器主动向客户端推送数据。与 WebSocket 双向通信不同，SSE 是单向的（服务器 → 客户端），但实现更简单，且基于 HTTP 协议。

### SSE 的典型应用场景

- AI 对话流式输出：ChatGPT、Claude 等 AI 助手的打字机效果
- 实时通知推送：消息提醒、系统通知
- 实时数据更新：股票行情、体育比分
- 进度监控：文件上传进度、任务执行状态

### SSE 协议格式

```txt
data: 消息内容\n\n
```

完整格式包含多个字段：

```txt
event: message\n id: 1\n retry: 3000\n data: 消息内容\n\n
```

- `data`: - 消息内容（必需）
- `event`: - 事件类型（可选，默认为 message）
- `id`: - 消息 ID（可选，用于断线重连）
- `retry`: - 重连间隔（可选，单位毫秒）
- `\n\n` - 事件分隔符（两个换行符）

## 二、三种实现方案对比

### 方案一：原生 EventSource API

#### 基本用法

```javascript
const eventSource = new EventSource('/api/sse')

eventSource.onmessage = (event) => {
  console.log('收到消息:', event.data)
}

eventSource.onerror = (error) => {
  console.error('连接错误:', error)
  eventSource.close()
}

// 手动关闭连接
eventSource.close()
```

#### 完整封装示例

```ts
class SSEClient {
  constructor(url, options = {}) {
    this.url = url
    this.options = options
    this.eventSource = null
    this.isCompleted = false
  }

  connect() {
    this.eventSource = new EventSource(this.url)

    this.eventSource.onmessage = (event) => {
      // 检查结束信号
      if (event.data === '[DONE]') {
        this.close('done')
        return
      }

      // 触发消息回调
      this.options.onMessage?.(event.data)
    }

    this.eventSource.onerror = () => {
      if (!this.isCompleted) {
        this.options.onError?.(new Error('SSE 连接异常'))
      }
      this.close('error')
    }
  }

  close(reason = 'manual') {
    if (this.isCompleted) return

    this.isCompleted = true
    this.eventSource?.close()
    this.options.onComplete?.(reason)
  }
}

// 使用示例
const client = new SSEClient('/api/chat', {
  onMessage: (data) => {
    console.log('收到:', data)
  },
  onComplete: (reason) => {
    console.log('结束:', reason)
  },
  onError: (err) => {
    console.error('错误:', err)
  }
})

client.connect()

// 手动停止
client.close()
```

#### 优势

- ✅ 零依赖：浏览器原生 API，无需引入任何库
- ✅ 自动解析：浏览器自动处理 SSE 协议解析
- ✅ 自动重连：连接断开后自动重连（可配置 retry 时间）
- ✅ 稳定可靠：浏览器原生实现，经过充分测试
- ✅ 代码简洁：核心逻辑仅需 20-30 行代码

#### 劣势

- ❌ 仅支持 GET 请求：无法发送 POST 请求体
- ❌ 无法自定义 Header：除了 Cookie，无法添加其他 Header（如 Authorization）
- ❌ 认证限制：只能通过 URL 参数或 Cookie 传递认证信息

#### 适用场景

- 后端接口支持 GET 请求
- 认证信息通过 Cookie 自动携带
- 追求零依赖和最简实现
- 不需要自定义 Header

#### 常见踩坑

##### 跨域问题

```ts
// 错误：跨域请求会失败
const es = new EventSource('https://other-domain.com/sse')

// 解决方案 1：服务器设置 CORS
// Access-Control-Allow-Origin: *
// Access-Control-Allow-Credentials: true

// 解决方案 2：使用代理
const es = new EventSource('/api/proxy/sse')
```

##### 自动重连导致重复请求

```ts
// 问题：连接断开后会自动重连，可能导致重复请求

// 解决方案：服务器端使用 id 字段去重
// event: message
// id: 123
// data: 消息内容

// 客户端重连时会自动发送 Last-Event-ID header
```

##### 无法传递 POST 数据

```javascript
// 错误：EventSource 不支持 POST
const es = new EventSource('/api/chat', {
  method: 'POST', // 无效！
  body: JSON.stringify({ message: 'Hello' })
})

// 解决方案：先通过 POST 保存数据，再用 GET 建立 SSE 连接
async function sendMessage(message) {
  // 1. POST 保存消息
  const res = await fetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ message })
  })
  const { messageId } = await res.json()

  // 2. GET 建立 SSE 连接
  const es = new EventSource(`/api/sse?messageId=${messageId}`)
}
```

### 方案二：Fetch API + ReadableStream

#### 基本用法

```javascript
async function fetchSSE(url, options = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token'
    },
    body: JSON.stringify({ message: 'Hello' })
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      options.onComplete?.()
      break
    }

    // 解码二进制数据
    buffer += decoder.decode(value, { stream: true })

    // 按行分割（SSE 以 \n\n 分隔事件）
    const lines = buffer.split('\n\n')
    buffer = lines.pop() || '' // 保留不完整的行

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)

        if (data === '[DONE]') {
          options.onComplete?.()
          return
        }

        options.onMessage?.(data)
      }
    }
  }
}

// 使用示例
fetchSSE('/api/chat', {
  onMessage: (data) => {
    console.log('收到:', data)
  },
  onComplete: () => {
    console.log('完成')
  }
})
```

#### 核心原理详解

##### ReadableStream 流式读取

```javascript
const reader = response.body.getReader()

while (true) {
  const { done, value } = await reader.read()

  if (done) break

  // value 是 Uint8Array 类型的二进制数据
  console.log(value)
}
```

##### TextDecoder 解码

```ts
const decoder = new TextDecoder()

// { stream: true } 很重要！
// 处理多字节字符被拆分到不同 chunk 的情况
const text = decoder.decode(value, { stream: true })
```

**为什么需要 `{ stream: true }`？**

```ts
// 假设 "你好" 的 UTF-8 编码被拆分到两个 chunk
// chunk1: [0xE4, 0xBD]  // "你" 的前两个字节
// chunk2: [0xA0, 0xE5, 0xA5, 0xBD]  // "你" 的最后一个字节 + "好"

const decoder = new TextDecoder()

// 不使用 stream: true（错误）
decoder.decode(chunk1) // 乱码或报错
decoder.decode(chunk2) // 乱码或报错

// 使用 stream: true（正确）
decoder.decode(chunk1, { stream: true }) // "" (等待完整字符)
decoder.decode(chunk2, { stream: true }) // "你好"
```

##### Buffer 缓冲区管理

```ts
let buffer = ''

// 收到 chunk1: "data: Hello\n"
buffer += 'data: Hello\n'
const lines = buffer.split('\n\n') // ["data: Hello\n"]
buffer = lines.pop() // buffer = "data: Hello\n"

// 收到 chunk2: "\ndata: World\n\n"
buffer += '\ndata: World\n\n' // "data: Hello\n\ndata: World\n\n"
const lines = buffer.split('\n\n') // ["data: Hello", "data: World", ""]
buffer = lines.pop() // buffer = ""

// 处理完整的事件
for (const line of lines) {
  if (line.startsWith('data: ')) {
    const data = line.slice(6)
    onMessage(data) // "Hello", "World"
  }
}
```

##### 支持中断

```ts
const controller = new AbortController()

fetch(url, {
  signal: controller.signal
})

// 中断请求
controller.abort()
```

#### 完整封装示例

```ts
class FetchSSEClient {
  constructor(url, options = {}) {
    this.url = url
    this.options = options
    this.controller = new AbortController()
  }

  async connect() {
    try {
      const response = await fetch(this.url, {
        method: this.options.method || 'POST',
        headers: this.options.headers || {},
        body: this.options.body,
        signal: this.controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          this.options.onComplete?.('done')
          break
        }

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)

            if (data === '[DONE]') {
              this.options.onComplete?.('done')
              return
            }

            this.options.onMessage?.(data)
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        this.options.onComplete?.('abort')
      } else {
        this.options.onError?.(error)
        this.options.onComplete?.('error')
      }
    }
  }

  abort() {
    this.controller.abort()
  }
}

// 使用示例
const client = new FetchSSEClient('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer token'
  },
  body: JSON.stringify({ message: 'Hello' }),
  onMessage: (data) => {
    console.log('收到:', data)
  },
  onComplete: (reason) => {
    console.log('结束:', reason)
  },
  onError: (err) => {
    console.error('错误:', err)
  }
})

client.connect()

// 手动停止
client.abort()
```

#### 优势

- ✅ 支持 POST 请求：可以发送请求体
- ✅ 自定义 Header：可以添加任意 Header（如 Authorization）
- ✅ 完全控制：可以自定义超时、重试等逻辑
- ✅ 零依赖：浏览器原生 API
- ✅ 支持中断：使用 AbortController 中断请求

#### 劣势

- ❌ 需要手动解析 SSE 协议：需要处理 `data:`、`event:`、`id:` 等字段
- ❌ 需要处理 chunk 边界：一个事件可能被拆分到多个 chunk
- ❌ 需要管理 buffer：手动拼接不完整的数据
- ❌ 代码复杂度高：核心逻辑需要 50+ 行代码
- ❌ 容易出错：边界情况处理不当会导致数据丢失或重复

#### 适用场景

- 需要 POST 请求和自定义 Header
- 需要完全控制请求行为
- 后端返回的不是标准 SSE 格式
- 需要读取响应 Header 或状态码

#### 常见踩坑

##### 忘记使用 `{ stream: true }`

```ts
// 错误：多字节字符会乱码
const text = decoder.decode(value)

// 正确
const text = decoder.decode(value, { stream: true })
```

##### buffer 管理错误

```ts
// 错误：直接 split 会丢失不完整的数据
const lines = buffer.split('\n\n')
for (const line of lines) {
  // 处理...
}
buffer = '' // 错误！最后一个可能不完整

// 正确：保留最后一个元素
const lines = buffer.split('\n\n')
buffer = lines.pop() || '' // 保留不完整的部分
for (const line of lines) {
  // 处理...
}
```

##### 没有处理中断

```javascript
// 错误：没有处理 AbortError
try {
  await fetch(url, { signal })
} catch (error) {
  console.error(error) // AbortError 也会被当作错误
}

// 正确：区分 AbortError
try {
  await fetch(url, { signal })
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('用户取消')
  } else {
    console.error('请求失败:', error)
  }
}
```

##### 代理层缓冲问题

```ts
// 问题：Nginx 等代理可能会缓冲响应，导致消息延迟

// 解决方案：服务器端配置
// Nginx:
// proxy_buffering off;
// proxy_cache off;
// proxy_set_header Connection '';
// proxy_http_version 1.1;
// chunked_transfer_encoding off;

// Node.js:
res.setHeader('Content-Type', 'text/event-stream')
res.setHeader('Cache-Control', 'no-cache')
res.setHeader('Connection', 'keep-alive')
res.flushHeaders() // 立即发送 headers
```

### 方案三：`@microsoft/fetch-event-source`

#### 基本用法

```bash
npm install @microsoft/fetch-event-source
```

```javascript
import { fetchEventSource } from '@microsoft/fetch-event-source'

fetchEventSource('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer token'
  },
  body: JSON.stringify({ message: 'Hello' }),

  onmessage(event) {
    if (event.data === '[DONE]') {
      return
    }
    console.log('收到:', event.data)
  },

  onclose() {
    console.log('连接关闭')
  },

  onerror(err) {
    console.error('错误:', err)
    throw err // 抛出错误会停止重连
  },

  openWhenHidden: true // 页面隐藏时保持连接
})
```

#### 高级用法

```javascript
class MSFetchSSEClient {
  constructor(url, options = {}) {
    this.url = url
    this.options = options
    this.ctrl = new AbortController()
  }

  async connect() {
    await fetchEventSource(this.url, {
      method: this.options.method || 'POST',
      headers: this.options.headers || {},
      body: this.options.body,
      signal: this.ctrl.signal,

      onmessage: (event) => {
        if (event.data === '[DONE]') {
          this.abort()
          return
        }
        this.options.onMessage?.(event.data)
      },

      onclose: () => {
        this.options.onComplete?.('done')
      },

      onerror: (err) => {
        this.options.onError?.(err)
        // 抛出错误会停止重连
        throw err
      },

      openWhenHidden: true
    })
  }

  abort() {
    this.ctrl.abort()
  }
}

// 使用示例
const client = new MSFetchSSEClient('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer token'
  },
  body: JSON.stringify({ message: 'Hello' }),
  onMessage: (data) => {
    console.log('收到:', data)
  },
  onComplete: (reason) => {
    console.log('结束:', reason)
  },
  onError: (err) => {
    console.error('错误:', err)
  }
})

client.connect()

// 手动停止
client.abort()
```

#### 优势

- ✅ 支持 POST 请求：可以发送请求体
- ✅ 自定义 Header：可以添加任意 Header
- ✅ 自动解析 SSE 协议：无需手动处理
- ✅ 内置自动重连：连接断开后自动重连
- ✅ 页面隐藏时保持连接：openWhenHidden 选项
- ✅ 体积小：~2KB gzip
- ✅ TypeScript 支持：完整的类型定义

#### 劣势

- ❌ 需要引入外部依赖：增加打包体积
- ❌ 自动重连可能不符合需求：需要手动控制
- ❌ 错误处理复杂：需要抛出错误才能停止重连
- ❌ 中断机制不直观：需要使用 AbortController

#### 适用场景

- 需要 POST 请求和自定义 Header
- 需要自动重连功能
- 不介意引入外部依赖
- 追求开发效率

#### 常见踩坑

##### 自动重连导致重复请求

```javascript
// 问题：连接断开后会自动重连，可能导致重复请求

// 解决方案 1：抛出错误停止重连
onerror(err) {
  console.error(err);
  throw err;  // 停止重连
}

// 解决方案 2：使用 AbortController
const ctrl = new AbortController();
fetchEventSource(url, {
  signal: ctrl.signal,
  onerror(err) {
    ctrl.abort();  // 停止重连
  },
});
```

##### 无法获取完成状态

```js
// 问题：onclose 回调无法区分正常结束还是错误结束

// 解决方案：自己维护状态
let isCompleted = false

fetchEventSource(url, {
  onmessage(event) {
    if (event.data === '[DONE]') {
      isCompleted = true
      ctrl.abort()
    }
  },
  onclose() {
    if (isCompleted) {
      console.log('正常结束')
    } else {
      console.log('异常结束')
    }
  }
})
```

##### 页面隐藏时连接断开

```js
// 问题：默认情况下，页面隐藏时连接会断开

// 解决方案：设置 openWhenHidden
fetchEventSource(url, {
  openWhenHidden: true // 页面隐藏时保持连接
})
```

## 三、方案对比总结

| 维度          | EventSource       | Fetch + ReadableStream | `@microsoft/fetch-event-source` |
| ------------- | ----------------- | ---------------------- | ------------------------------- |
| 支持 POST     | ✗ 仅 GET          | ✅                     | ✅                              |
| 自定义 Header | ✗ 仅 Cookie       | ✅                     | ✅                              |
| SSE 协议解析  | ✅ 浏览器原生     | ✗ 需手动实现           | ✅ 自动处理                     |
| 自动重连      | ✅ 浏览器原生     | ✗ 需手动实现           | ✅ 内置                         |
| 手动中断      | ✅ `close()`      | ✅ Abort`Controller    | ✅ `AbortController` + `throw`  |
| 代码复杂度    | 低（~30行）       | 高（~50行）            | 中（~10行）                     |
| 外部依赖      | 零依赖            | 零依赖                 | ~2KB                            |
| 浏览器兼容性  | IE 10+            | 现代浏览器             | 现代浏览器                      |
| 学习成本      | 低                | 高                     | 中                              |
| 适用场景      | GET + Cookie 认证 | 完全自定义             | POST + 自动重连                 |

## 四、选型建议

### 选择 EventSource 的情况

- ✅ 后端接口支持 GET 请求
- ✅ 认证信息通过 Cookie 自动携带
- ✅ 追求零依赖和最简实现
- ✅ 不需要自定义 Header

### 选择 Fetch + ReadableStream 的情况

- ✅ 需要完全控制请求行为
- ✅ 后端返回的不是标准 SSE 格式
- ✅ 需要读取响应 Header 或状态码
- ✅ 需要自定义超时、重试逻辑

### 选择 `@microsoft/fetch-event-source` 的情况

- ✅ 需要 POST 请求和自定义 Header
- ✅ 需要自动重连功能
- ✅ 不介意引入外部依赖
- ✅ 追求开发效率

## 五、实战经验总结

### 如何处理认证

#### 方案 A：Cookie（推荐 EventSource）

```ts
// 服务器设置 Cookie
res.cookie('token', 'xxx', { httpOnly: true })

// 客户端自动携带
const es = new EventSource('/api/sse')
```

#### 方案 B：URL 参数（适用 EventSource）

```ts
const token = 'xxx'
const es = new EventSource(`/api/sse?token=${token}`)
```

#### 方案 C：Authorization Header（需要 Fetch）

```javascript
fetch('/api/sse', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

### 如何处理超时

#### EventSource（无法设置超时）

```ts
// 解决方案：手动实现超时
const es = new EventSource('/api/sse')
const timeout = setTimeout(() => {
  es.close()
  console.log('超时')
}, 30000)

es.onmessage = () => {
  clearTimeout(timeout)
}
```

#### Fetch（使用 AbortController）

```ts
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 30000)

fetch('/api/sse', {
  signal: controller.signal
})
```

### 如何处理重连

#### EventSource（自动重连）

```ts
// 服务器端设置重连间隔
res.write('retry: 3000\n\n') // 3 秒后重连

// 客户端无法禁用自动重连
// 只能通过 close() 关闭连接
```

#### Fetch（手动重连）

```javascript
async function connectWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await fetchSSE(url, {
        /* ... */
      })
      break // 成功，退出循环
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error // 最后一次重试失败
      }
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
  }
}
```

### 如何处理代理层缓冲

#### 问题： Nginx 等代理可能会缓冲响应，导致消息延迟

_解决方案_：

```ini
# Nginx 配置
location /api/sse {
    proxy_pass http://backend;
    proxy_buffering off;
    proxy_cache off;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
}
```

```ts
// Node.js 服务器
res.setHeader('Content-Type', 'text/event-stream')
res.setHeader('Cache-Control', 'no-cache')
res.setHeader('Connection', 'keep-alive')
res.setHeader('X-Accel-Buffering', 'no') // 禁用 Nginx 缓冲
res.flushHeaders() // 立即发送 headers
```

### 如何处理跨域

_CORS 配置_：

```ts
// 服务器端
res.setHeader('Access-Control-Allow-Origin', '*')
res.setHeader('Access-Control-Allow-Credentials', 'true')
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
```

_代理方案_：

```js
// 开发环境使用代理
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://backend.com',
        changeOrigin: true
      }
    }
  }
}
```

## 六、总结

SSE 是实现服务器推送的简单而强大的技术，三种实现方案各有优劣：

- EventSource：零依赖、最简单，适合 GET 请求场景
- Fetch + ReadableStream：完全控制、最灵活，适合复杂场景
- `@microsoft/fetch-event-source`：功能完善、开箱即用，适合快速开发

选择哪种方案取决于具体需求，建议优先考虑 EventSource，只有在需要 POST 或自定义 Header 时才使用其他方案。