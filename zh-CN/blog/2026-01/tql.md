---
lastUpdated: true
commentabled: true
recommended: true
title: tql，寥寥几行，实现无队列无感刷新
description: tql，寥寥几行，实现无队列无感刷新
date: 2026-01-13 08:30:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## 前言 ##

可能大家在项目中已经都用上了双 `token`，可能你的 `refresh_token` 至今为止都没派上用场。

你可能已经看过了很多篇讲 `token` 无感刷新的文章了，看完的你可能有三种情况

- 不知所云
- 又臭又长，懒得看
- 管理一个重试队列(queue)

相信聪明又耐心的你们，大多处在第三种情况。

而这篇文章特别短，将在最快的时间内教会你一种 *十分简单且更高效* 的刷新方式。

## 无队列无感刷新 ##

要说无队列无感刷新前，要先了解什么是队列式无感刷新，请看下文

### 队列式 无感刷新机制 ###

定义一个标志位，用于检查是否正在执行刷新行为，再定义一个数组，用来存放 401 的请求，在拦截器中拦截到时去请求刷新，如果标志位为 false，则去请求刷新并将标志位设置为 true、将请求 push 进队列，如果标志位为 true（第二个 401 请求）则直接 push 到队列并返回。等到刷新完成后，遍历重试队列。

它的代码大概长这样：

```ts
let isRefreshing = false
let requestQueue: ((token: string) => void)[] = []

axiosInstance.interceptors.response.use(undefined, async (error) => {
  const { config, response } = error
  if (response?.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        const token = await refreshToken()
        requestQueue.forEach((cb) => cb(token))
        requestQueue = []
      } catch {
        redirectToLogin()
      } finally {
        isRefreshing = false
      }
    }

    return new Promise((resolve) => {
      requestQueue.push((token) => {
        config.headers.Authorization = 'Bearer ' + token
        resolve(axiosInstance(config))
      })
    })
  }
})
```
这是一个可用的最简版本，代码已经来到了 27 行，再加一些业务逻辑，这代码已经很丑了。

### 无队列无感刷新（promise 天然队列） ###

接下来看无队列的无感刷新，直接看代码：

```ts
let refreshPromise: Promise<string> | null = null

async function tryRefreshToken(config) {
  if (!refreshPromise) {
    refreshPromise = axios.post('/api/v1/user/token/refresh')
      .catch(()=>{
        redirectToLogin()
      })
      .finally(() => { refreshPromise = null })
  }
  const token = await refreshPromise
  config.headers.Authorization = 'Bearer ' + token
  return axiosInstance(config)
}
```

哈哈，一共 14 行，实现的功能跟上面是一致的，当请求 401 时，你只需返回这个函数的结果即可，像这样

```ts
if (error.response.status === 401) {
  return tryRefreshToken(config as AxiosRequestConfig)
}
```

在这个逻辑下，当多个请求几乎同时返回 401 时：

- 只会触发 *一次刷新 token*（由 `!refreshPromise` 控制）；

- 其他请求都会 *等待这次刷新完成*，然后复用新 token 重新发起原请求；

- 防止并发多次刷新 token （造成 race condition 竞态条件 和资源浪费）。

> 这就是所谓的：**“Token 刷新单例 + 队列重试” 模式**

只不过这个队列不用我们手动维护，而是使用了 promise 的机制形成的天然队列，请求会自动在 token 刷新后重新请求。

与常见的队列式方式对比一下

| **维度**        |      **隐式 Promise 方案**      | **显式队列方案**        |
| :------------- | :-----------: | :------------- |
| 复杂度  | 低      | 中高  |
| 语义清晰度  | 简洁但隐式      | 明确但冗长  |
| 调试难度  | 容易   |  稍高  |
| 实际效果  | ✅ 等价    | ✅ 等价  |

现在看看你项目里要不要换成这种简单高效的刷新方式？我已经用上了，结合我的业务代码也只有这么几行代码

```ts
// handle 401
async function tryRefreshToken(config: AxiosRequestConfig) {
  if (!refreshPromise) {
    refreshPromise = axios
      .post('/api/v1/user/token/refresh')
      .then((res) => {
        if (res.status !== 200 || res.data.code !== 200) {
          redirectToLogin()
          throw new Error('Failed to refresh token')
        }
        const newToken = Cookies.get('access_token')!
        axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newToken
        return newToken
      })
      .catch((err) => {
        redirectToLogin()
        throw err
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  const token = await refreshPromise
  config.headers!['Authorization'] = 'Bearer ' + token
  eventBus.emit('tokenRefreshed', token)
  return axiosInstance(config)
}
```

## 结语 ##

我们常常为了便于思考用显式的结构去模拟隐式的行为，但是维护起来效果却适得其反，而在 `Promise` 时代，有时候“等待”本身就是最好的队列。
