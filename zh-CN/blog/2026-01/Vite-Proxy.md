---
lastUpdated: true
commentabled: true
recommended: true
title: Vite Proxy到底是咋个工作嘞？
description: Vite Proxy到底是咋个工作嘞？
date: 2026-01-04 10:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

> `proxy` 要不要写、`rewrite` 要不要写、`axios` 的请求路径该怎么写？我好乱啊！！！

你是不是也经常遇到类似的问题，搞不清路径到底该咋个写，今天就让你学个明明白白的。

## 一、先用一句话说清 Proxy 在干嘛 ##

> Vite Proxy = 本地开发时的“请求中转站”

它做的事情只有一件：

> 把浏览器发给本地的请求，偷偷转发到真正的后端服务器

### 为什么需要它？ ###

因为浏览器有**跨域限制**：

```txt
前端：http://localhost:5173
后端：http://192.168.110.220:8888
```

> err:直接请求会被浏览器拦掉

Proxy 的作用就是：

*浏览器只跟 Vite 说话，Vite 去跟后端说话，通俗来讲，就是vite中封装的Proxy是个媒婆，你跟后端是相亲的，你的话需要通过媒婆来传递给后端。*

## 二、Proxy 的工作流程（一定要理解） ##

假设你在浏览器里请求：

```txt
http://localhost:5173/api/csr/generate
```

Vite Proxy 做的事是：

```txt
浏览器
  ↓
Vite 开发服务器（localhost:5173）
  ↓（匹配 /api 规则）
代理转发
  ↓
真正后端（192.168.110.220:8888）
```

**⚠️ 重点**：*Proxy 只在「开发环境」生效，生产环境完全无效*

## 三、Proxy 配置里最重要的 3 个东西 ##

```json
proxy: {
  '/api': {
    target: 'http://192.168.110.220:8888',
    changeOrigin: true,
    rewrite: ...
  },
}
```

我们一个一个讲。

### `/api` ——「拦谁」 ###

```txt
'/api'
```

意思是：

> 只要请求路径是以 `/api` 开头的，才走代理

例如：

|    请求路径     |     是否走代理       |
| :------------- | :-----------: |
|    `/api/csr/generate`     |      ✅      |
|    `/api/user/login`     |      ✅      |
|    `/csr/generate`     |      ❌      |
|    `/login`     |      ❌      |

### target ——「转给谁」 ###

```txt
target: 'http://192.168.110.220:8888'
```

意思是：

> 最终请求会发给哪个后端服务器

### rewrite ——「要不要改路径」 ###

这是最容易迷糊的地方，但其实逻辑非常简单。

## 四、rewrite 的本质（一句话） ##

> rewrite = 把“前端请求路径”改成“后端能识别的路径”

如果前端路径和后端路径**一模一样**：

> ❌ 不需要 rewrite

如果不一样：

> ✅ 才需要 rewrite

## 五、最重要的前提：先搞清“后端真实接口长什么样” ##

我们用你真实的接口来讲：

```txt
后端真实接口：
http://192.168.110.220:8888/api/csr/generate
```

👉 注意：

`/api` 是后端接口的一部分

## 六、场景一（最推荐）：`/api` 只是前端代理前缀 ##

### 场景描述 ###

```txt
后端接口：/csr/generate
前端想统一写：/api/xxx
```

### 正确配置 ###

**vite.config.ts**

```json
proxy: {
  '/api': {
    target: 'http://192.168.110.220:8888',
    changeOrigin: true,
    rewrite: path => path.replace(/^/api/, ''),
  },
},
```

**axios**

```txt
// baseURL
'/api'

// 请求
api.post('/csr/generate')
```

### 实际发生的事 ###

```txt
/api/csr/generate
↓ rewrite
/csr/generate
↓
192.168.110.220:8888/csr/generate
```

> ✅ rewrite 有意义

## 七、场景二（⭐你现在的真实场景）：`/api` 是后端真实路径 ##

### 场景描述 ###

```txt
后端接口：/api/csr/generate
前端请求：/api/csr/generate
```

> 👉 前后端路径完全一致

### 正确配置（最简单、最不容易出错） ###

**vite.config.ts**

```json
proxy: {
  '/api': {
    target: 'http://192.168.110.220:8888',
    changeOrigin: true,
    // ❌ 不写 rewrite
  },
},
```

**axios**

```txt
// baseURL
'/api'

// 请求
api.post('/csr/generate')
```

### 实际请求路径 ###

```txt
localhost:5173/api/csr/generate
↓
192.168.110.220:8888/api/csr/generate
```

- ✅ 完全正确
- ✅ 不多、不少
- ✅ 不 404

## 八、为什么 `rewrite: replace(/^/api/, '/api')` 没意义？ ##

我们来算一遍：

```javascript
'/api/csr/generate'.replace(/^/api/, '/api')
```

结果还是：

`/api/csr/generate`

> 👉 路径根本没变

所以：

- ✔️ 写了不报错
- ❌ 但等于没写
- ❌ 还容易误导别人

## 九、axios 和 proxy 配合的“黄金规则” ##

### 一句话口诀（非常重要） ###

baseURL 里有 `/api`，请求路径里就不要再写 `/api`

### 正确示例 ###

```txt
baseURL: '/api'
api.post('/csr/generate')
```

### 错误示例（最常见 404 来源） ###

```txt
baseURL: '/api'
api.post('/api/csr/generate') // ❌
```

实际请求变成：

```txt
/api/api/csr/generate
```

## 十、不同配置组合对照表（建议收藏） ##

|    baseURL     |      axios      |      请求实际请求     |
| :------------- | :-----------: | :-----------: |
|    `/api`     |      `/csr/generate`      |     `/api/csr/generate` ✅      |
|    `/api`     |     `/api/csr/generate`       |      `/api/api/csr/generate` ❌      |
|    `/`     |      `/api/csr/generate`      |      `/api/csr/generate` ✅      |

## 十一、完整推荐模板（开发 + 生产） ##

### `.env.development` ###

```ini
VITE_API_BASE_URL=/api
```

### `.env.production` ###

```ini
VITE_API_BASE_URL=http://192.168.110.220:8888
```

### axios 封装 ###

```javascript
import axios from 'axios'

export default axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})
```

## 十二、最后用一句大白话收尾 ##

> Proxy 不神秘，它只是帮你“改地址”；
> axios 不复杂，它只是“拼路径”；
> 你只要分清：
> 👉 `/api` 是不是后端真实路径，
> 👉 `rewrite` 就永远不会再写错。

## 前端开发中的跨域问题：Vite 开发环境配置指南 ##

### 前言 ###

在前端开发过程中，跨域问题是一个经常遇到的挑战。当你的前端应用运行在 `http://localhost:5173`，而后端 API 运行在 `http://2.x.x.x:28xxx` 时，浏览器会阻止这种跨域请求。本文将详细介绍如何使用 Vite 的代理功能来解决开发环境中的跨域问题。

### 什么是跨域？ ###

跨域（Cross-Origin Resource Sharing，CORS）是浏览器的同源策略限制。当以下三个要素中任意一个不同时，就会产生跨域：

- 协议（Protocol）：如 `http` 和 `https`
- 域名（Domain）：如 `localhost` 和 `2.x.x.x`
- 端口（Port）：如 `5173` 和 `28xxx`

当浏览器检测到跨域请求时，会抛出类似以下的错误：

```txt
Access to XMLHttpRequest at 'http://2.x.x.x:28xxx/login' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 解决方案对比 ###

#### 后端配置 CORS（生产环境推荐） ####

在后端服务器设置响应头，允许指定的源访问：

```javascript
// 后端示例（Node.js/Express）
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

- 优点：符合生产环境最佳实践
- 缺点：需要后端配合，开发环境可能无法修改后端

#### 浏览器插件（不推荐） ####

使用 Chrome 插件禁用 CORS 检查。

- 优点：快速
- 缺点：仅适用于开发，不安全，不推荐

### Vite 代理（开发环境推荐）⭐ ###

利用 Vite 开发服务器的代理功能，将请求转发到后端服务器。

优点：

- 无需修改后端代码
- 开发环境专用，不影响生产环境
- 配置简单，功能强大
- 可以处理路径重写、请求头修改等

### Vite 代理配置详解 ###

#### 基础配置 ####

在 `vite.config.ts` 中配置 `server.proxy`：

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    // 端口号
    port: 5173,
    // 允许外部访问（局域网访问）
    host: "0.0.0.0",
    // 代理配置
    proxy: {
      // 代理所有以 /api 开头的请求
      "/api": {
        // 目标服务器地址
        target: "http://后端地址",
        // 改变请求头中的 origin，确保后端能正确识别来源
        changeOrigin: true,
        // 路径重写：去掉 /api 前缀
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
})
```

#### 配置项说明 ####

**target**

- 类型：`string`
- 说明：`后端服务器的实际地址`
- 示例：`"http://后端地址"`

**changeOrigin**

- 类型：`boolean`
- 默认值：`false`
- 说明：是否改变请求头中的 `origin` 字段
- 作用：当设置为 `true` 时，请求头中的 `origin` 会被设置为 `target` 的值，这样可以避免后端因 `origin` 不匹配而拒绝请求
- 注意：此时更改 `http` 中的 `baseURL` 为 `'/api'`

**rewrite**

- 类型：`(path: string) => string`
- 说明：路径重写函数
- 作用：可以修改请求路径，例如去掉前缀、添加前缀等

示例：

```typescript
rewrite: (path) => path.replace(/^\/api/, "")
// 请求 /api/login → 实际请求 http://后端地址/login
```

#### 完整配置示例 ####

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  
  return {
    server: {
      port: Number(env.VITE_PORT) || 5173,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "后端地址",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          // 可选：配置 WebSocket 代理
          ws: true,
          // 可选：自定义请求头
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // 可以在这里修改请求头
              console.log('代理请求:', req.url)
            })
          }
        }
      },
      // CORS 配置（可选，通常不需要）
      cors: {
        origin: "*",
        credentials: true
      }
    }
  }
})
```

### 前端 HTTP 客户端配置 ###

配置好代理后，需要在前端 HTTP 客户端中设置正确的 baseURL：

#### Axios 配置示例 ####

```typescript
// src/utils/http/index.ts
import Axios, { type AxiosRequestConfig } from 'axios'

const defaultConfig: AxiosRequestConfig = {
  timeout: 20000,
  // 使用相对路径，Vite 会自动代理到后端
  baseURL: "/api",
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  }
}

const axiosInstance = Axios.create(defaultConfig)

// 使用示例
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    return axiosInstance.get<T>(url, config)
  },
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return axiosInstance.post<T>(url, data, config)
  }
}
```

#### 请求流程 ####

**前端发起请求**：

```typescript
http.post("/login", { username: "admin", password: "123456" })
```

**实际请求路径**：

`http://localhost:5173/api/login`

**Vite 代理转发**：

`http://后端地址/login`  (去掉了 `/api` 前缀)

**后端响应**：

`响应原路返回 → Vite 代理 → 前端`

### 高级配置场景 ###

#### 多个代理规则 ####

当需要代理多个不同的后端服务时：

```json
proxy: {
  "/api": {
    target: "http://api.example.com",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, "")
  },
  "/upload": {
    target: "http://upload.example.com",
    changeOrigin: true
  }
}
```

#### 使用正则表达式匹配 ####

```json
proxy: {
  // 匹配所有以 /api 或 /v1 开头的请求
  "^/api|^/v1": {
    target: "http://2.2.50.2:28082",
    changeOrigin: true
  }
}
```

#### 代理 WebSocket ####

```json
proxy: {
  "/api": {
    target: "ws://后端地址",
    ws: true,  // 启用 WebSocket 代理
    changeOrigin: true
  }
}
```

#### 自定义请求头 ####

```json
proxy: {
  "/api": {
    target: "http://后端地址",
    changeOrigin: true,
    configure: (proxy, options) => {
      proxy.on('proxyReq', (proxyReq, req, res) => {
        // 添加自定义请求头
        proxyReq.setHeader('X-Custom-Header', 'custom-value')
      })
    }
  }
}
```

### 常见问题排查 ###

#### 代理不生效 ####

检查项：

- ✅ 确认 vite.config.ts 配置正确
- ✅ 重启 Vite 开发服务器
- ✅ 检查 baseURL 是否以 /api 开头
- ✅ 查看浏览器 Network 面板，确认请求是否发送到正确的地址

#### 请求 404 ####

可能原因：

- rewrite 配置不正确，路径被错误重写
- target 地址不正确
- 后端路由不存在

解决方案：

```typescript
// 添加日志查看实际请求路径
configure: (proxy, options) => {
  proxy.on('proxyReq', (proxyReq, req, res) => {
    console.log('代理请求路径:', proxyReq.path)
  })
}
```

#### Cookie 丢失 ####

原因：跨域请求默认不携带 Cookie

解决方案：

```json
proxy: {
  "/api": {
    target: "http://2.2.50.2:28082",
    changeOrigin: true,
    // 确保 Cookie 被正确传递
    cookieDomainRewrite: "",
    cookiePathRewrite: ""
  }
}
```

#### 生产环境配置 ####

重要：Vite 的代理功能仅在开发环境生效，生产环境需要：

**使用 Nginx 反向代理**：

```nginx
location /api {
    proxy_pass http://2.2.50.2:28082;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

**或后端配置 CORS**：

```javascript
// 允许所有源（生产环境建议指定具体域名）
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}))
```

### 最佳实践 ###

#### 使用环境变量 ####

```ini:.env.development
VITE_API_BASE_URL=http://后端地址
VITE_PORT=5173
```

```ts:vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  
  return {
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "")
        }
      }
    }
  }
})
```

#### 类型安全 ####

```typescript
// 定义 API 响应类型
export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

// 使用示例
const response = await http.post<ApiResponse<UserInfo>>("/login", {
  username: "admin",
  password: "123456"
})
```

#### 错误处理 ####

```typescript
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // 服务器返回错误
      console.error('服务器错误:', error.response.status)
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误:', error.request)
    } else {
      // 请求配置错误
      console.error('请求错误:', error.message)
    }
    return Promise.reject(error)
  }
)
```

### 总结 ###

Vite 的代理功能是解决开发环境跨域问题的最佳方案：

- ✅ 无需修改后端代码
- ✅ 配置简单，功能强大
- ✅ 仅影响开发环境，不影响生产环境
- ✅ 支持路径重写、请求头修改等高级功能

通过合理配置 Vite 代理，可以大大提升前端开发效率，避免跨域问题带来的困扰。
