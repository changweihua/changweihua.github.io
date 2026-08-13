---
lastUpdated: true
commentabled: true
recommended: true
title: 双Token无感刷新
description: Vue3 + Axios 企业级完整实现
date: 2026-07-09 14:25:00
pageClass: blog-page-class
cover: /covers/vue.svg
---

在前后端分离架构中，基于 Token 的 JWT 鉴权是目前最主流的身份认证方案。但传统单 Token 模式存在明显短板：令牌时效过短会导致用户频繁掉线，时效过长又会极大增加信息泄露风险，严重影响产品体验与系统安全性。*双 Token 无感刷新机制*是业界标准的最优解决方案，能够在用户无感知的前提下静默续期身份凭证，无需弹窗、无需跳转、不中断业务操作。本文将从原理剖析、前端工程化落地、后端 JWT 签发、并发问题优化、企业级安全规范五大维度，提供一套可直接上线的生产级完整方案。

## 为什么需要无感刷新

单 Token 模式无法同时兼顾「安全性」与「用户体验」：若令牌有效期较短，用户正常操作会被强制下线；若有效期过长，一旦令牌被盗，攻击者可长期冒用身份，存在极高安全漏洞。

_无感刷新的核心价值_：通过长短双令牌分离职责，在保证接口安全的前提下，自动静默续期登录状态，实现用户永久在线、全程无感知，彻底解决主动掉线问题。

## 双 Token 机制原理

双 Token 机制的核心设计思想是*职责拆分、长短搭配*，用短期令牌保障接口安全，用长期令牌负责身份续期，从架构层面解决安全与体验的冲突。两枚令牌各司其职、互不干扰：

- _Access Token（业务短期令牌）_ ：有效期建议 15–60 分钟，专门用于业务接口鉴权。短时效设计可以大幅缩小令牌泄露的风险窗口，保障接口访问安全，是用户访问资源的核心凭证。
- _Refresh Token（刷新长期令牌）_ ：有效期建议 7–30 天，_仅用于刷新 Access Token，不参与任何业务请求_。作为身份续期的唯一凭证，用于静默续期登录状态。

整套无感刷新拥有完整闭环逻辑，运行机制清晰、稳定性强，具体流程如下：

1. 用户登录校验成功后，后端同步返回全新的 Access Token 与 Refresh Token
2. 前端本地持久化双令牌，所有业务请求自动携带 Access Token 完成鉴权
3. Access Token 过期失效，接口请求返回 401 未授权状态码
4. 前端拦截 401 错误，自动调用刷新接口，携带 Refresh Token 申请新凭证
5. 刷新成功：更新本地双令牌，自动重试失败的业务请求，用户操作全程无感知
6. 刷新失败：判定长效凭证过期、登录态彻底失效，清空本地缓存，跳转登录页重新授权

## 前端完整实现（Vue3 + Axios）

### 登录逻辑：双令牌获取与本地持久化

```javascript
const login = async () => {
  const userInfo = { username: 'zs', password: '123' }
  const { data } = await userLogin(userInfo)

  // 存储双Token
  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)
  isLogin.value = true
}
```

### 请求拦截器：统一挂载鉴权头部

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 响应拦截器：生产级并发防重刷 + 自动续期 + 请求重试

```javascript
// 核心全局变量：解决多接口并发401重复刷新BUG
// 刷新锁：控制同一时间仅执行一次token刷新
let isRefreshing = false
// 请求队列：存储刷新期间失败的所有业务请求
let requestQueue = []

api.interceptors.response.use(
  // 正常响应直接返回
  (res) => res,
  // 统一处理异常响应
  async (error) => {
    const { response, config } = error || {}
    const status = response?.status
    const isRefreshApi = config.url === '/refresh'

    // 非401错误、刷新接口自身报错，直接抛出异常，不做处理
    if (status !== 401 || isRefreshApi) {
      return Promise.reject(error)
    }

    // 场景一：正在刷新中，将当前失败请求推入队列，等待刷新完成重试
    if (isRefreshing) {
      return new Promise((resolve) => {
        requestQueue.push(() => resolve(api(config)))
      })
    }

    // 场景二：无刷新进行中，开启锁，执行刷新逻辑
    isRefreshing = true

    try {
      // 调用刷新接口，更新双令牌
      await refreshToken()
      // 刷新成功：批量执行队列中所有等待请求
      requestQueue.forEach((cb) => cb())
      // 清空队列，避免脏数据残留
      requestQueue = []
      // 重试当前失败的接口
      return api(config)
    } catch (e) {
      // 刷新失败：refresh_token 彻底失效，重置登录态
      localStorage.clear()
      requestQueue = []
      window.location.href = '/login'
      return Promise.reject(e)
    } finally {
      // 无论成功失败，最终释放刷新锁，允许下次刷新
      isRefreshing = false
    }
  }
)
```

### 刷新函数封装：统一更新本地令牌

```javascript
async function refreshToken() {
  const rt = localStorage.getItem('refresh_token')
  const { data } = await api.get('/refresh', { params: { token: rt } })

  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)
  return data
}
```

## 后端完整实现（Node.js + Express + JWT）

### 登录接口：签发长短双令牌

```javascript
app.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = users.find((u) => u.username === username && u.password === password)

  if (!user) return res.status(401).json({ message: '账号或密码错误' })

  // 生成短时效访问Token + 长时效刷新Token
  const access_token = generateToken(user, '1h')
  const refresh_token = generateToken(user, '7d')

  res.json({ access_token, refresh_token, userInfo: user })
})
```

### 令牌刷新接口：续期新凭证

```javascript
app.get('/refresh', (req, res) => {
  const { token } = req.query
  try {
    const userData = verifyToken(token)
    const access_token = generateToken(userData, '1h')
    const refresh_token = generateToken(userData, '7d')
    res.json({ access_token, refresh_token })
  } catch (err) {
    res.status(401).json({ message: '刷新令牌已失效' })
  }
})
```

### JWT工具类：统一签发与校验

```javascript
const jwt = require('jsonwebtoken')
const secret = 'MY_SECRET_KEY'

function generateToken(user, expiresIn) {
  return jwt.sign({ username: user.username }, secret, { expiresIn })
}

function verifyToken(token) {
  return jwt.verify(token, secret)
}

module.exports = { generateToken, verifyToken }
```

## 整体业务闭环梳理

- 业务请求发起，请求拦截器自动携带有效 Access Token
- AccessToken 过期或无效，后端返回 401 未授权状态码
- 前端拦截 401 鉴权失败状态，静默阻断报错，自动调用令牌刷新接口
- 刷新接口请求成功，更新本地双令牌，自动重试失败的原始请求
- 刷新接口请求失败，判定登录态失效，清空本地凭证，跳转登录页重新授权

## 企业级安全规范与生产避坑指南

- 合理配置 AccessToken 时效：推荐 15–60 分钟短期有效期，缩小令牌泄露风险窗口，保障接口鉴权安全
- 严格管控 RefreshToken 时效：有效期控制在 7–30 天，禁止永久有效，防止长效令牌被盗用造成长期风险
- 生产环境强制开启 HTTPS：全程加密传输，防止中间人抓包劫持令牌，保障传输链路安全
- 优化 RefreshToken 存储方案：生产环境优先使用 HttpOnly + Secure Cookie 存储，规避 LocalStorage 带来的 XSS 窃取漏洞
- 开启令牌轮换机制：每次刷新同步更新 RefreshToken，主动作废旧令牌，避免旧令牌被复用攻击
- 刷新接口增加安全校验：后端需对刷新接口做限流、IP 绑定、设备标识校验，抵御恶意刷令牌攻击
- 敏感业务二次鉴权：支付、权限配置、账号核心操作等接口，不可仅依赖 Token，需增加二次身份校验机制
- 规范 JWT 载荷数据：Payload 仅存储用户ID、账号等非敏感标识，严禁存入密码、密钥、权限核心数据
- 规范前端令牌存储：避免明文令牌长期暴露在可被JS读取的存储中，降低XSS窃取风险
- 解决并发重复刷新致命BUG（生产核心优化） ：多接口同时401会触发多次刷新，造成令牌覆盖、请求报错。本文采用「刷新锁 + 请求队列」机制，全局仅执行一次刷新，其余请求排队重试，彻底解决并发刷新问题，代码已完全落地可直接使用
- 刷新失败强制清空登录态：刷新异常时彻底清除本地令牌缓存，杜绝脏数据导致的循环报错、无限重试问题
