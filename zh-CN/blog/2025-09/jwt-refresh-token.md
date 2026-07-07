---
lastUpdated: true
commentabled: true
recommended: true
title: Token已过期，我是如何实现无感刷新Token的？
description: Token已过期，我是如何实现无感刷新Token的？
date: 2025-09-30 13:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

我们来想象一个场景：你正在一个电商网站上，精心挑选了半小时的商品，填好了复杂的收货地址，满心欢喜地点击提交订单 Button。

突然，页面 ~Duang~ 🎈地一下，跳转到了登录页，并提示你：“登录状态已过期，请重新登录”。

那一刻，你的内心是什么感受？我想大概率是崩溃的，并且想把这个网站拉进黑名单。

这就是一个典型的、因为 `Token` 过期处理不当，而导致的灾难级用户体验。作为一个负责任的开发者，这是我们绝对不能接受的。

今天就聊聊，我们团队是如何通过**请求拦截**和**队列控制**，来实现无感刷新 `Token` 的。让用户即使在 `Token` 过期的情况下，也能无缝地继续操作，就好像什么都没发生过一样。

## 基础知识 ##

### 为什么需要两个Token？ ###

要实现无感刷新，我们首先需要后端同学的配合，采用*双Token*的认证机制。

- `accessToken`: 这是我们每次请求业务接口时，都需要在请求头里带上的令牌。它的特点是*生命周期短*（比如1小时），因为暴露的风险更高。
- `refreshToken`: 它的唯一作用，就是用来获取一个新的 `accessToken`。它的特点是*生命周期长*（比如7天），并且需要被安全地存储（比如HttpOnly的Cookie里）。

**流程是这样的**：用户登录成功后，后端会同时返回 `accessToken` 和 `refreshToken`。前端将 `accessToken` 存在内存（或LocalStorage）里，然后在后续的请求中，通过 `refreshToken` 来刷新。



## 解决思路，利用axios的请求拦截器 ##

我们整个方案的核心，是利用 `axios`（或其他HTTP请求库）提供的*请求拦截器（Interceptor）* 。它就像一个哨兵，可以在请求发送前和响应返回后，对请求进行拦截和改造。

**我们的目标是**：

- 在*响应拦截器*里，捕获到后端返回的 `accessToken` 已过期的错误（通常是 `401` 状态码）。
- 当捕获到这个错误时，*暂停*所有后续的API请求。
- 使用 `refreshToken`，悄悄地在后台发起一个获取新 `accessToken` 的请求。
- 拿到新的 `accessToken` 后，更新我们本地存储的 `Token`。
- 最后，把之前*失败的请求*和被*暂停的请求*，用新的 `Token` 重新发送出去。

这个过程对用户来说，是完全透明的。他们最多只会感觉到某一次API请求，比平时慢了一点点。

## 具体怎么实现？ ##

下面是我们团队在项目中，实际使用的 `axios` 拦截器伪代码。

```JavaScript
import axios from 'axios';

// 创建一个新的axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// ------------------- 请求拦截器 -------------------
api.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});


// ------------------- 响应拦截器 -------------------

// 用于标记是否正在刷新token
let isRefreshing = false;
// 用于存储因为token过期而被挂起的请求
let requestsQueue = [];

api.interceptors.response.use(
  response => {
    return response;
  }, 
  async error => {
    const { config, response } = error;
    
    // 如果返回的HTTP状态码是401，说明access_token过期了
    if (response && response.status === 401) {
      
      // 如果当前没有在刷新token，那么我们就去刷新token
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // 调用刷新token的接口
          const { data } = await axios.post('/refresh-token', {
            refreshToken: localStorage.getItem('refreshToken') 
          });
          
          const newAccessToken = data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);

          // token刷新成功后，重新执行所有被挂起的请求
          requestsQueue.forEach(cb => cb(newAccessToken));
          // 清空队列
          requestsQueue = [];

          // 把本次失败的请求也重新执行一次
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(config);

        } catch (refreshError) {
          // 如果刷新token也失败了，说明refreshToken也过期了
          // 此时只能清空本地存储，跳转到登录页
          console.error('Refresh token failed:', refreshError);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // 如果当前正在刷新token，就把这次失败的请求，存储到队列里
        // 返回一个pending的Promise，等token刷新后再去执行
        return new Promise((resolve) => {
          requestsQueue.push((newAccessToken) => {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(api(config));
          });
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

这段代码的关键点，也是面试时最能体现你思考深度的地方：

**`isRefreshing` 状态锁**：

这是为了解决并发问题。想象一下，如果一个页面同时发起了3个API请求，而 `accessToken` 刚好过期，这3个请求会同时收到401。如果没有 `isRefreshing` 这个锁，它们会同时去调用 `/refresh-token` 接口，发起3次刷新请求，这是完全没有必要的浪费，甚至可能因为并发问题导致后端逻辑出错。

有了这个锁，只有第一个收到 `401` 的请求，会真正去执行刷新逻辑。

**`requestsQueue` 请求队列**：

当第一个请求正在刷新Token时（`isRefreshing = true`），后面那2个收到401的请求怎么办？我们不能直接抛弃它们。正确的做法，是把它们的resolve函数推进一个队列（`requestsQueue`）里，暂时挂起。

等第一个请求成功拿到新的accessToken后，再遍历这个队列，把所有被挂起的请求，用新的Token重新执行一遍。

无感刷新Token这个功能，用户成功的时候，是感知不到它的存在的。

但恰恰是这种无感的细节，区分出了一个能用的应用和一个好用的应用。

因为一个资深的开发者，他不仅关心功能的实现，更应该关心用户体验和整个系统的健壮性。

希望这一套解决思路，能对你有所帮助🤞😁。

## 增强 ##

```ts
function tryRefreshToken(config: AxiosRequestConfig) {
  if (!refreshPromise) {
    refreshPromise = axios
    .post('/api/v1/user/token/refresh')
    .then((res) => {
      if (res.status !== 200 || res.data.code !== 200) {
        redirectToLogin()
        throw new Error('Failed to refresh token')
      }
      const newToken = Cookies.get('access_token')!

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

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

**处理登录失效**

```ts
if (error.response.status === 401) {
  return tryRefreshToken(config as AxiosRequestConfig)
}
```
