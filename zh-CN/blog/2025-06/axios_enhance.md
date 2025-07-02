---
lastUpdated: true
commentabled: true
recommended: true
title: 基于axios 二次封装：构建强大的 HTTP 请求层
description: 基于axios 二次封装：构建强大的 HTTP 请求层
date: 2025-06-20 15:55:00 
pageClass: blog-page-class
cover: /covers/axios.svg
---

# 基于axios 二次封装：构建强大的 HTTP 请求层 #

在现代前端开发中，网络请求是应用的核心功能之一。Axios 作为目前最流行的 HTTP 客户端库，以其简洁的 API、Promise 支持和丰富的功能赢得了广大开发者的青睐。然而，在实际企业级项目中，直接使用原生 Axios 往往无法满足复杂业务需求。本文将探讨如何通过二次封装 Axios，构建一个功能完善、易于维护的企业级请求解决方案。

## 为什么需要二次封装 Axios？ ##

原生 Axios 虽然功能强大，但在实际企业应用中存在以下痛点：

- **重复代码问题**：每个请求都需要处理错误、设置超时等
- **缺乏统一管理**：请求分散在各处，难以维护和更新
- **安全防护不足**：需要手动处理 CSRF 防护、重试机制等
- **监控能力有限**：缺乏统一的请求日志和性能监控
- **业务耦合度高**：业务逻辑与请求代码混杂

## 封装核心功能设计 ##

我们先写一个简单的代码在进行 Axios 二次封装时，我们首先需要建立一个基础实例，作为整个请求架构的核心。这一步看似简单，但实际上是整个封装设计的基石，决定了后续功能扩展的灵活性和可维护性。

```ts
import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL, //
  timeout: 10000,
})
export default request
```

这段代码虽然简洁，但包含了几个关键设计要点：

- 实例化隔离：通过 axios.create() 创建独立实例，避免全局配置污染，支持多服务、多环境场景
- 环境变量配置：利用 import.meta.env.VITE_API_URL 读取环境变量，实现开发、测试、生产环境的无缝切换
- 超时保护：设置 timeout 确保请求不会无限期挂起，提高用户体验和系统可靠性
- 模块化设计：通过 export default 导出实例，为后续添加拦截器、错误处理等功能提供了良好的扩展点

### 完整封装演进路线 ###

#### 添加拦截器 ####

**请求拦截器**

请求拦截器是 Axios 二次封装中的关键环节，它允许我们在请求发出前统一处理配置信息。在企业级应用中，请求拦截器通常用于处理身份验证、请求日志、参数转换等场景，有效减少重复代码并保障请求一致性

```ts
request.interceptors.request.use((config) => {
  // 从存储中获取token
  const token = localStorage.getItem('authToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    config.headers['Content-Type'] = 'application/json'
  }

  return config
})
```

上述拦截器实现多核心功能：

- 自动鉴权：无需手动为每个请求添加 token，系统自动从 localStorage 获取并附加到请求头
- 内容类型声明：统一设置 Content-Type，确保服务端正确解析请求体
当然，你也可以在拦截器中做一些其他的操作

**响应拦截器**

响应拦截器用于集中处理服务器返回的数据，是实现统一数据格式化、错误处理和状态码管理的理想位置。特别是在前后端分离架构中，响应拦截器能有效解耦业务逻辑和通信细节。

```ts
request.interceptors.response.use(
  (response) => {
    // 根据后端约定结构处理响应
    if (response.data.code === 0) {
      return response // 返回业务数据
    }
    return Promise.reject(response.data.msg) // 业务错误处理
  },
  (error) => {
    // 统一处理HTTP错误
    const errorMessage = handleHttpError(error)
    return Promise.reject(errorMessage)
  },
)
```

该响应拦截器设计的精髓在于：

- 数据提纯：自动解构后端统一封装格式，让调用方直接获取业务数据，简化使用
- 业务状态判断：根据后端约定的业务状态码(code)区分成功和失败情况
- 错误标准化：将各类网络错误(HTTP错误码、超时、网络中断等)转换为统一的错误格式
- 关注点分离：业务代码只需关注数据处理，无需重复编写错误处理逻辑

### 高级功能拓展 ###

**自动刷新 token 机制**

在现代前端应用中，处理认证 token 过期是一个常见但又棘手的问题。当服务器返回 401 状态码时，往往意味着用户的认证状态已失效，但良好的用户体验要求我们能够无感刷新而非直接退出登录。以下是一个优雅的 token 刷新方案：

```ts
request.interceptors.response.use(
  (response) => {
    // 处理成功的响应
    return response
  },
  async (error) => {
    // 统一处理HTTP错误
    const { response, config } = error

    if (response) {
      // 处理 401 未授权错误 - Token 失效场景
      if (response.status === 401) {
        try {
          // 尝试使用刷新令牌获取新的访问令牌
          const res = await refreshToken()

          if (res.data.code === 0) {
            // 刷新成功，更新存储中的认证信息
            localStorage.setItem('authToken', res.data.token)
            localStorage.setItem('refreshToken', res.data.refreshToken)

            // 使用新获取的 token 重试之前失败的请求
            // 通过修改原始请求配置并重新发送
            return request(error.config)
          } else {
            // Token 刷新失败，需要用户重新登录
            toSignIn()
            return Promise.reject('Authentication failed. Please login again.')
          }
        } catch (e) {
          // 刷新过程发生异常，引导用户重新登录
          clearAuthData()
          toSignIn()
          return Promise.reject('Session expired. Authentication required.')
        }
      }

      // 处理其他类型的HTTP错误
      return Promise.reject(handleHttpError(response))
    }

    // 处理网络错误等没有响应对象的情况
    return Promise.reject('Network error. Please check your connection.')
  },
)
```

此实现的核心优势在于：

- 无感刷新：用户无需手动登录，系统在 token 失效时自动获取新的授权
- 请求恢复：重要的是，原始请求会在获取新 token 后自动重试，保持业务流程连贯性
- 降级策略：当刷新失败时，有明确的降级处理，确保用户体验和系统安全
- 异常防护：完整的异常捕获确保即使在刷新过程中出现意外，也不会造成应用崩溃

在生产环境中，这种模式还需要配合并发请求控制、无限循环防护等机制，以应对高并发场景下的复杂情况。

**完善自动刷新**

上面的自动刷新没有问题， 但是当我们页面上由于 token 失效导致多个请求失败，就会导致调用刷新 token 接口多次
处理多个请求同时遇到 token 失效时，我们需要更精细的控制机制：只进行一次 token 刷新，同时将所有失败的请求排队等待，并在 token 刷新成功后自动重试。

以下是一个完善的实现：

```ts
let isRefreshing = false // 是否正在刷新Token
const pendingRequests: Array<{
  config: any
  resolve: (value: unknown) => void
  reject: (reason?: any) => void
}> = []
```

```ts
request.interceptors.response.use(
  (response) => {
    // 处理成功的响应
    if (response.status === 200 || response.status === 201) {
      return response
    }
    return Promise.reject(new Error('请求失败'))
  },
  async (error) => {
    // 统一处理HTTP错误
    const { response } = error

    if (response) {
      // 处理 401 未授权错误 - Token 失效场景
      if (response.status === 401) {
        // 返回一个新的Promise，用于控制请求的后续处理
        return new Promise(async (resolve, reject) => {
          // 获取当前路由信息，用于登录重定向
          const { pathname, search } = router.state.location

          // 如果当前不在登录页，尝试刷新Token
          if (pathname !== '/signin' && pathname !== '/signup') {
            const token = localStorage.getItem('refreshToken')
            const redirectUrl = `/signin?redirect=${pathname}${search}`

            // 如果没有刷新Token，直接重定向到登录页
            if (!token) {
              toSignIn(redirectUrl)
              return reject('Authentication required. Please sign in.')
            }

            // 将当前失败的请求添加到等待队列
            pendingRequests.push({
              config: error.config,
              resolve,
              reject,
            })

            // 如果已经在刷新Token，则不重复刷新
            if (isRefreshing) return

            // 标记刷新状态，防止并发刷新
            isRefreshing = true

            try {
              // 尝试刷新Token
              const res = await refreshToken()

              if (res.data.code === 0) {
                // 刷新成功，更新存储中的认证信息
                setStorage(TOKEN_KEY, res.data.token)
                setStorage(REFRESH_TOKEN_KEY, res.data.refreshToken)

                // 重试队列中的所有请求
                pendingRequests.forEach((item) => {
                  request(error.config)
                    .then((data) => item.resolve(data))
                    .catch((err) => item.reject(err))
                })
              } else {
                // Token刷新失败，重定向到登录页
                toSignIn(redirectUrl)
                reject('Token refresh failed')
              }
            } catch (e) {
              // 刷新过程发生异常，重定向到登录页
              toSignIn(redirectUrl)
              reject(e)
            } finally {
              // 重置刷新状态和请求队列
              isRefreshing = false
              pendingRequests.length = 0
            }
          }
        })
      }

      // 处理其他HTTP错误
      return Promise.reject(handleHttpError(response))
    }

    // 处理网络错误等没有响应对象的情况
    console.error('Network Error:', error.message)
    return Promise.reject('Network error. Please check your connection.')
  },
)
```

这种并发请求的 token 刷新机制提供了以下关键优势：

- **防止冗余刷新**：无论同时有多少请求失败，只触发一次 token 刷新操作
- **请求队列管理**：所有因 token 过期而失败的请求都会被暂存，等待 token 刷新后自动重试
- **状态同步控制**：使用 isRefreshing 标志确保并发场景下的状态一致性
- **用户体验优化**：记录用户当前位置，登录后能够返回原页面，减少用户操作步骤
- **内存管理**：在处理完成后清空请求队列，避免内存泄漏
- **异常安全处理**：完整的 try-catch-finally 结构确保系统在各种异常情况下仍能正常运行

这种模式特别适合 SPA 应用中多个组件并行请求数据的场景，能够在 token 失效时提供无缝的用户体验。

## TypeScript 增强：优化 Axios 响应类型 ##

在标准 Axios 使用模式下，我们需要通过访问响应对象的 data 属性来获取后端返回的实际数据，这导致代码中出现大量重复的 response.data 访问模式。以下类型声明通过 TypeScript 的模块扩展机制，优化了 Axios 实例的类型定义，使 HTTP 方法直接返回响应数据：

```ts
declare module 'axios' {
  export interface AxiosInstance {
    get<T = unknown>(url: string, config?: unknown): Promise<T>
    post<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>
    delete<T = unknown>(url: string, config?: unknown): Promise<T>
    head<T = unknown>(url: string, config?: unknown): Promise<T>
    options<T = unknown>(url: string, config?: unknown): Promise<T>
    put<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>
    patch<T = unknown>(
      url: string,
      data?: unknown,
      config?: unknown,
    ): Promise<T>
  }
}

request.interceptors.response.use(
  (response) => {
    // 根据后端约定结构处理响应
    if (response.data.code === 0) {
      return response.data // 返回业务数据
    }
    return Promise.reject(response.data.msg) // 业务错误处理
  },
  (error) => {
    // 统一处理HTTP错误
  },
)
```

这种类型扩展带来了以下优势：

- 简化访问模式
- 类型安全：通过泛型  提供强类型支持，实现端到端的类型推断
- 代码简洁：消除了重复的 .data 访问代码，提高代码可读性

### 我们来对比下 ###


```ts
interface Res<T> {
  code: number
  data: T
}
interface User {
  id: string
  username: string
  mail: string
  avatar: string
  age: number
}
const getUser = async (id: number) => {
  return request.get<Res<User>>(`/api/users/${id}`)
}
```

**改造前**

```ts
const res = getUser('xxx')
if (res.data.code === 0) {
  const user = res.data.data
  console.log(user)
}
```

**改造后**

```ts
const res = getUser('xxx')
if (res.code === 0) {
  const user = res.data
  console.log(user)
}
```

这种类型扩展让我们在使用二次封装的 Axios 时能够获得更好的开发体验，减少了样板代码，同时保持了完整的类型安全性。
