---
lastUpdated: true
commentabled: true
recommended: true
title: 多端单点登录（SSO）实战
description: 多端单点登录（SSO）实战
date: 2025-10-16 10:00:00 
pageClass: blog-page-class
cover: /covers/platform.svg
---

> 前端视角下的单点登录（SSO）从原理到实战

## 引言：一次认证，全网通行的前端实现之道 ##

在多系统架构中，用户频繁登录不同子系统的体验割裂问题，催生了单点登录（SSO）技术 —— 通过统一认证中心实现 "一次登录，多系统访问"。对前端工程师而言，SSO 不仅是跳转逻辑的实现，更是安全与体验的平衡艺术。本文将从前端视角拆解 SSO 的核心原理、实战方案与安全边界，助你掌握从认证流程到跨域同步的完整实现。

## 一、SSO 的核心价值与前端核心职责 ##

### 为什么需要 SSO？ ###

数据显示，普通员工每年因重复登录浪费超 44 小时，而 SSO 可减少 63% 的 IT 支持工单，同时通过集中权限管理降低 87% 的密码泄露风险。其核心价值在于：

- 体验优化：消除重复登录，提升跨系统操作流畅度
- 安全强化：集中管控认证逻辑，降低密码管理风险
- 效率提升：简化多系统权限配置，减少开发冗余

### 前端在 SSO 中的角色边界 ###

前端不负责核心认证逻辑，而是承担 "流程衔接者" 与 "安全守护者" 的角色，核心职责包括：

- 认证引导：检测本地令牌状态，触发跳转至认证中心
- 参数传递：安全传递授权码（`code`）、`PKCE` 等临时凭证
- 令牌存储：根据安全策略管理令牌（`access_token`/`refresh_token`）
- 跨域同步：通过 `iframe`/`postMessage` 等实现多系统状态同步
- 安全隔离：严格规避敏感操作（如令牌兑换），防止密钥泄露

## 二、SSO 核心流程：前端视角的四阶段拆解 ##

### 阶段 1：触发认证 —— 从应用到认证中心 ###

当用户访问受保护资源（如 App A 的首页）时，前端需先检查本地令牌有效性：

**核心动作**：

- 初始化时检测 `sessionStorage`/`localStorage` 中是否存在有效`access_token`
- 若令牌缺失 / 过期，生成 `PKCE` 参数（防授权码劫持），重定向至认证中心

**关键代码**：

```javascript
// 生成PKCE参数（安全增强）
const generatePKCE = () => {
  // 生成随机code_verifier（43-128字符）
  const codeVerifier = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => String.fromCharCode(b % 62 + (b % 62 < 10 ? 48 : b % 62 < 36 ? 55 : 61)))
    .join('');
  // 计算code_challenge（SHA-256哈希+Base64URL编码）
  const codeChallenge = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  return { codeVerifier, codeChallenge: await codeChallenge(codeVerifier) };
};

// 触发认证跳转
const initSSO = async () => {
  const { codeVerifier, codeChallenge } = await generatePKCE();
  // 存储verifier（后续兑换令牌需使用）
  sessionStorage.setItem('code_verifier', codeVerifier);
  // 构建认证中心URL
  const authParams = new URLSearchParams({
    response_type: 'code',
    client_id: 'APP_A_CLIENT_ID', // 应用唯一标识
    redirect_uri: 'https://app-a.com/sso-callback', // 回调地址（预注册）
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });
  window.location.href = `https://sso-server.com/auth?${authParams.toString()}`;
};
```

### 阶段 2：捕获授权码 —— 认证中心回调处理 ###

用户在认证中心完成登录后，会被重定向回应用的回调页面（如 `/sso-callback`），URL 中携带授权码（`code`）。

**核心动作**：

- 从 URL 参数中提取 `code`（授权码）
- 调用后端接口，传递 `code` 与之前存储的 `code_verifier`，由后端兑换令牌

**关键代码**：

```javascript
// 回调页面处理
const handleSSOCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) {
    // 处理认证失败（如用户拒绝授权）
    alert(`认证失败：${error}`);
    return;
  }

  // 从存储中获取code_verifier
  const codeVerifier = sessionStorage.getItem('code_verifier');
  if (!authCode || !codeVerifier) {
    alert('认证参数缺失');
    return;
  }

  // 调用后端接口兑换令牌（前端不直接请求认证中心）
  try {
    const res = await fetch('/api/exchange-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: authCode, code_verifier: codeVerifier })
    });
    const { access_token, refresh_token, expires_in } = await res.json();
    
    // 存储令牌（根据安全策略选择存储方式）
    sessionStorage.setItem('access_token', access_token);
    // 跳转至原目标页面
    window.location.href = sessionStorage.getItem('target_url') || '/';
  } catch (err) {
    console.error('令牌兑换失败', err);
  }
};
```

> 安全红线：前端绝不可直接向认证中心发送兑换请求（需携带客户端密钥，会导致泄露），必须通过自身后端中转。

### 阶段 3：令牌使用与刷新 ###

获取令牌后，前端需在请求中携带令牌以访问受保护接口，并处理令牌过期问题。
核心动作：

- 封装请求拦截器，自动添加 `Authorization` 头
- 监听 401 错误，使用 `refresh_token` 刷新令牌
- 刷新失败时，重定向至认证中心重新认证

**关键代码**：

```javascript
// 请求拦截器（以Axios为例）
axios.interceptors.request.use(config => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器处理令牌过期
axios.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    // 若401且未重试过
    if (err.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // 调用后端刷新令牌接口（refresh_token通常存在HttpOnly Cookie中）
        const { access_token } = await axios.post('/api/refresh-token');
        sessionStorage.setItem('access_token', access_token);
        // 重试原请求
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (refreshErr) {
        // 刷新失败，重新触发SSO
        sessionStorage.removeItem('access_token');
        window.location.href = '/sso-redirect';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);
```

### 阶段 4：退出登录 —— 全系统状态清除 ###

退出登录需同步清除所有子系统的令牌，避免单点退出后其他系统仍保持登录状态。

**核心动作**：

- 清除本地令牌（`access_token`/`sessionStorage`等）
- 调用认证中心注销接口， invalidate 全局会话
- 通知其他子系统同步退出（跨域场景）

**关键代码**：

```javascript
const logout = async () => {
  // 1. 清除本地存储
  sessionStorage.removeItem('access_token');
  // 2. 清除同域Cookie（若有）
  document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  
  // 3. 调用认证中心注销接口（ invalidate 全局会话 ）
  const logoutUrl = new URL('https://sso-server.com/logout');
  logoutUrl.searchParams.set('client_id', 'APP_A_CLIENT_ID');
  logoutUrl.searchParams.set('redirect_uri', 'https://app-a.com/logout-callback');
  
  // 4. 跨域通知其他系统（通过iframe触发）
  const systems = [
    'https://app-b.com/sync-logout',
    'https://app-c.com/sync-logout'
  ];
  systems.forEach(url => {
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    // 移除iframe避免内存泄漏
    setTimeout(() => iframe.remove(), 1000);
  });
  
  // 5. 跳转至认证中心完成注销
  window.location.href = logoutUrl.toString();
};
```

## 三、跨域场景：SSO 状态同步方案对比 ##

多系统通常分布在不同域名下，如何同步登录状态是 SSO 的核心挑战。以下是主流跨域方案的对比与实现：

|  方案   |   适用场景 |  实现原理 |  安全级别 |  局限性 |
| :-----------: | :-----------: |  :-----------: |  :-----------: |  :-----------: |
| 同顶级域名 Cookie | 子系统域名统一（如 `a.example.com`, `b.example.com`） | 通过 `domain.example.com` 共享 Cookie | 中（须配合 HttpOnly、SameSite） | 无法跨主域（如 `example.com` 与 `example.net`） |
| iframe & postMessage | 跨主域场景 | 认证中心部署 sync.html，子系统通过 iframe 接收令牌 | 高（需校验 origin） | 部分浏览器对第三方 Cookie 限制严格 |
| URL 参数传递 | 临时授权场景 | 加密令牌通过 URL 啊承诺书传递（如 `sso_token=xxx`） | 低（易泄露） | 仅适合短期一次性授权 |

### 同顶级域名方案（最简单） ###

当所有子系统共享顶级域名（如 `*.example.com`），可通过共享 Cookie 同步状态：

- 认证中心登录后，设置 `Domain=.example.com`的 Cookie 存储 `refresh_token`

- 子系统通过读取该 Cookie，调用后端接口兑换 `access_token`

```http
// 认证中心设置Cookie（后端操作）
Set-Cookie: refresh_token=xxx; 
  Domain=.example.com;  // 共享给所有子域名
  Path=/; 
  HttpOnly;  // 防止前端JS读取，降低XSS风险
  Secure;    // 仅HTTPS传输
  SameSite=Strict;  // 防止CSRF攻击
```

### 跨主域方案（iframe + postMessage） ###

当子系统分布在不同主域（如 `app-a.com` 与 `app-b.com`），需通过 `iframe` 跨域通信：

认证中心部署 `sync.html`：

```html [sync.html]
<!-- https://sso-server.com/sync.html -->
<script>
// 监听子系统的令牌请求
window.addEventListener('message', (event) => {
  // 校验请求来源（仅允许可信子系统）
  const trustedOrigins = [
    'https://app-a.com', 
    'https://app-b.com'
  ];
  if (!trustedOrigins.includes(event.origin)) return;

  // 从Cookie中获取当前登录状态（需后端配合写入）
  const token = getCookie('sso_token'); // 伪代码：读取认证中心的令牌Cookie
  if (token) {
    // 向子系统发送令牌
    event.source.postMessage({ token }, event.origin);
  }
});

function getCookie(name) {
  // 简化的Cookie读取逻辑
  return document.cookie.split('; ')
    .find(row => row.startsWith(`${name}=`))?.split('=')[1];
}
</script>
```

子系统监听令牌同步：

```javascript
// 子系统初始化时触发同步
const syncSSOState = () => {
  // 创建隐藏iframe加载认证中心的sync.html
  const iframe = document.createElement('iframe');
  iframe.src = 'https://sso-server.com/sync.html';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // 监听iframe发送的令牌
  window.addEventListener('message', (event) => {
    // 严格校验来源，防止恶意网站伪造消息
    if (event.origin !== 'https://sso-server.com') return;
    
    // 存储令牌并更新UI
    if (event.data.token) {
      sessionStorage.setItem('access_token', event.data.token);
      renderUserInfo(); // 触发页面刷新
    }
  });
};

// 页面加载时同步状态
syncSSOState();
```

## 四、Vue 框架实战：SSO 集成最佳实践 ##

以 Vue 3 为例，结合路由守卫、状态管理与请求拦截器，实现端到端 SSO 集成：

### 状态管理（Pinia） ###

```javascript
// stores/auth.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: sessionStorage.getItem('access_token') || null,
    userInfo: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    // 存储令牌
    setToken(token) {
      this.token = token;
      sessionStorage.setItem('access_token', token);
    },
    // 清除令牌
    clearToken() {
      this.token = null;
      sessionStorage.removeItem('access_token');
    },
    // 初始化时检查令牌有效性
    async checkToken() {
      if (!this.token) return false;
      try {
        // 调用后端接口校验令牌
        const res = await axios.get('/api/verify-token');
        this.userInfo = res.data.user;
        return true;
      } catch (err) {
        this.clearToken();
        return false;
      }
    }
  }
});
```

### 路由守卫（控制访问权限） ###

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true } // 标记需要认证的路由
  },
  {
    path: '/sso-callback',
    name: 'SSOCallback',
    component: () => import('@/views/SSOCallback.vue') // 处理认证回调
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth) {
    // 检查令牌有效性
    const isTokenValid = await authStore.checkToken();
    if (isTokenValid) {
      next(); // 令牌有效，允许访问
    } else {
      // 令牌无效，记录目标地址后跳转至SSO
      sessionStorage.setItem('target_url', to.fullPath);
      next('/sso-redirect'); // 触发SSO认证
    }
  } else {
    next(); // 无需认证的路由直接放行
  }
});

export default router;
```

### SSO 认证组件（触发跳转与回调） ###

```vue [SSORedirect.vue]
<!-- views/SSORedirect.vue -->
<script setup>
import { onMounted } from 'vue';
import { generatePKCE } from '@/utils/sso';

onMounted(async () => {
  // 生成PKCE参数并跳转至认证中心
  const { codeVerifier, codeChallenge } = await generatePKCE();
  sessionStorage.setItem('code_verifier', codeVerifier);
  
  const authParams = new URLSearchParams({
    response_type: 'code',
    client_id: 'VUE_APP_CLIENT_ID',
    redirect_uri: `${window.location.origin}/sso-callback`,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });
  
  window.location.href = `https://sso-server.com/auth?${authParams.toString()}`;
});
</script>

<template>
  <div>正在跳转至统一认证中心...</div>
</template>
```

## 五、面试高频考点：SSO 核心问题应答策略 ##

### 如何防止授权码被劫持？ ###

应答要点：

- 采用授权码 + PKCE 模式：前端生成 `code_verifier` 和 `code_challenge`，认证中心用 `code_challenge` 校验 `code_verifie`r，防止恶意第三方拦截授权码
- 限制 `redirect_uri` 为预注册地址，避免跳转至恶意网站

### 前端为什么不能直接处理令牌兑换？ ###

应答要点：

- 令牌兑换需携带 `client_secret`（客户端密钥），前端存储密钥会导致泄露（通过 JS 即可获取）
- 正确流程：前端将 `code` 传递给自身后端，由后端携带 `client_secret` 向认证中心兑换令牌，再返回 `access_token` 给前端

### 如何实现多系统同时退出登录？ ###

应答要点：

- 分两步：清除本地状态+同步全局会话
- 本地：清除 `access_token`、`refresh_token` 及用户信息
- 全局：调用认证中心注销接口（ invalidate 全局会话 ），并通过 iframe/postMessage 通知其他子系统同步清除状态

### Token 存储方案如何选择？ ###

应答要点：

- `access_token`：存储在 `sessionStorage`（会话级，关闭标签页失效，降低 XSS 泄露风险）
- `refresh_token`：存储在 `HttpOnly Cookie`（禁止前端 JS 读取，防 XSS；配合 `SameSite=Strict` 防 CSRF）
- 禁止使用 `localStorage` 存储敏感令牌（持久化存储，XSS 攻击易导致长期泄露）

## 结语：前端在 SSO 中的安全底线 ##

单点登录的前端实现，本质是在 "用户体验" 与 "系统安全" 之间寻找平衡。核心原则始终不变：

- 不碰敏感信息：客户端密钥、令牌兑换逻辑必须由后端处理

- 严格校验来源：跨域通信（如 `postMessage`）必须验证 `origin`

- 遵循最小权限：令牌仅包含必要权限，且设置合理有效期

随着浏览器对第三方 Cookie 的限制加强（如 Chrome 的 Privacy Sandbox），无 Cookie 的 SSO 方案（如 OAuth 2.0 Device Flow）正逐步兴起，但前端的角色始终是 "流程衔接者"—— 安全永远是不可逾越的底线。

> 单点登录（SSO）在多端应用中的设计与实现

在现代 Web 应用架构中，用户往往需要同时使用多个关联的业务系统（如电商平台的商品页、购物车、支付中心）。单点登录（SSO）技术通过 “*一次登录，多系统通行*” 的特性，彻底解决了用户在多系统间重复登录的痛点。本文基于简单的实际项目案例，详细介绍 **SSO** 在多端应用中的设计思路与实现方案，包含*整页重定向与弹窗通信*两种核心模式，并结合 client1、client2、client3 的具体代码实现进行说明。

## 一、总体架构设计 ##

这个项目我采用 “三端两模式” 架构(*多终端协同 + 认证 - 业务分离*)，通过统一的登录中心串联多个业务应用，实现跨应用的身份共享。

### 核心角色划分 ###

- 业务应用（Client） ：client1、client3（基于 Vite + Vue Router 构建的前端应用），提供具体业务功能，需依赖登录状态访问受保护资源。两者代码结构基本相同，都通过路由守卫和请求拦截器处理登录相关逻辑。

- 登录中心（Auth Server） ：client2（独立前端应用），负责统一身份认证、token 发放与登录状态管理，是整个 SSO 体系的信任源。

- 后端服务（Backend） ：提供 API 接口的后端服务（运行在 `localhost:5000`），通过校验 token 合法性控制资源访问，当检测到未授权请求（401 错误）时触发登录流程。

### 两种交互模式 ###

SSO 的核心是解决 “登录状态跨应用传递” 的问题，本项目实现了两种典型交互模式：

- 整页重定向模式：业务应用通过页面跳转将用户引导至登录中心，登录成功后携带 token 重定向回原应用，适用于简单场景或弹窗被拦截时的降级方案。

- 弹窗 + postMessage 模式：业务应用通过 `window.open` 弹出登录中心，登录成功后利用 `postMessage` API 将 `token` 安全传递回主应用，保留用户操作上下文，是本项目的推荐方案。

## 二、核心登录流程（弹窗 + postMessage 模式） ##

弹窗模式通过 “主应用 - 弹窗 - 主应用” 的通信闭环实现登录状态传递，既保证安全性又优化用户体验，核心流程分为三个阶段：

### 触发登录：业务应用检测未登录状态 ###

当用户访问业务应用的受保护资源时，系统通过两种方式判断未登录状态：

- 请求拦截：API 请求返回 401 错误（后端检测 `token` 无效或缺失）。

- 路由守卫：路由跳转时，前端路由守卫检测到本地无有效 `token`。

此时，业务应用通过 `window.open` 打开登录中心，并携带自身 `origin`（如 `http://localhost:5173`）作为 `resource` 参数，用于登录成功后的回调定位。

以 client1 的响应拦截器代码为例：

```js [request.js]
// client1的request.js响应拦截器
request.interceptors.response.use((res) => {
    if (res.data.status === 401) {
        // 打开登录中心弹窗，携带当前应用origin
        window.open(`http://localhost:5174/login?resource=${window.location.origin}`);
    }
    return res;
})
```

### 监听回调：业务应用准备接收 token ###

业务应用在初始化时注册 `message` 事件监听，专门接收登录中心通过 `postMessage` 传递的 `token` 信息。为防止恶意网站伪造消息，需严格校验发送方的 `origin`。

client1 在 main.js 中注册监听：

```js [main.js]
// client1的main.js
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
const app = createApp(App)
window.addEventListener("message",(event) => {
    const token = event.data.token;
    // 存储接收到的token
    localStorage.setItem("token",token);
    // 刷新页面使token生效
    window.location.reload()
})
app.use(router).mount('#app')
```

### 回传 token：登录中心完成认证并响应 ###

登录中心加载时解析 `resource` 参数（业务应用的 `origin`），用户完成登录后，通过 `postMessage` 将 `token` 定向回传至业务应用。为保证安全性，需处理 `opener` 丢失（如弹窗被刷新）的边缘情况。

client1 中处理登录成功回传 token 的相关代码：

```js
// client1中登录相关逻辑
import request from "../server/request";
import { useRoute } from "vue-router";
import { watch, ref } from "vue";
const route = useRoute();
const resource = ref("");
const token = localStorage.getItem("token");
function postMessage(token, resource){
    window.opener.postMessage({
        token:token
    },resource.value)
}
watch(
  () => route.query.resource,
  (val) => {
    resource.value = val ? decodeURIComponent(val) : "";
    if (token) {
      postMessage(token,resource.value)
    }
  },
  { immediate: true }
);
function login() {
  request.get("/login").then((res) => {
    const apitoken = res.data.data;
    localStorage.setItem("token", apitoken);
    // 向打开登录页的业务应用回传token
    window.opener.postMessage({token:apitoken},resource.value)
    // 方案之一：整页重定向
    window.location.href = `${resource.value}?token=${token}`;
    // 关闭登录弹窗
    window.close()
  });
}
```

## 三、路由与令牌接入方案 ##

业务应用需通过路由守卫和请求拦截器实现 `token` 的自动管理，确保登录状态在路由跳转和 API 请求中无缝生效。

### 路由守卫：控制页面访问权限 ###

路由守卫负责在页面跳转时校验登录状态，对未登录用户拦截并触发登录流程，同时处理整页重定向模式下的?token=参数。

client1 的路由守卫代码：

```js
// client1的router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import AboutPage from '../pages/AboutPage.vue'
const routes = [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage },
]
const router = createRouter({
    history: createWebHistory(),
    routes,
})
router.beforeEach((to, from, next) => {
    // 处理整页重定向带回的token
    const token = to.query.token;
    if (token) {
        localStorage.setItem("token", token);
    }
    next();
})
export default router
```

### 请求拦截器：自动携带与刷新 token ###

通过 Axios 拦截器实现 token 的自动携带，以及 401 错误的统一处理，确保 API 请求的安全性。

client1 的请求拦截器代码：

```js
// client1的request.js请求拦截器
request.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    config.headers = config.headers || {}
    if (token) config.headers.token = token
    return config
})
```

## 四、各端代码说明 ##

### client1 代码特点 ###

client1 作为主要的业务应用，实现了完整的 SSO 逻辑：

- 请求拦截器自动携带 token

- 响应拦截器在 401 时打开登录中心弹窗

- 路由守卫处理整页重定向带来的 token

- 注册 message 事件监听接收登录中心回传的 token

- 实现了通过 postMessage 向业务应用回传 token 的功能

### client2（登录中心）代码特点 ###

client2 作为登录中心，提供登录页面和登录功能：主要是为了获取 token

```vue
<template>
  <div>
    <div>账号名:<input /></div>
    <div>密码:<input /></div>
    <div>
      <button
        @click="() => login()"
      >
        登录
      </button>
    </div>
  </div>
</template>
```

其请求拦截器与 client1 类似，但登录页一般不做 401 重定向，避免循环跳转：

```js
// client2的request.js
request.interceptors.response.use((res) => {
    if (res.data.status === 401) {
        window.open(`http://localhost:5174/login?resource=${window.location.origin}`)
    }
    return res;
})
```

### client3 代码特点 ###

client3 与 client1 代码结构基本相同，作为另一个业务应用，验证 SSO 的跨应用登录效果：

```vue
<script setup>
import request from '../server/request'
// 触发一次请求，用于检测登录状态
request.get('/api1').catch(() => {})
</script>
<template>
  <main>
    <h1>Client3 首页（SSO 演示）</h1>
    <p>如果已在其他项目登录，这里将直接显示；否则会被重定向到登录页。</p>
    <router-link to="/">Home</router-link>
    <router-view></router-view>
  </main>
</template>
```

## 五、关键细节与避坑指南 ##

单点登录的实现涉及多端交互和安全校验，以下细节直接影响方案的稳定性和安全性：

- postMessage 的 targetOrigin 校验

必须使用业务应用的 origin（如 `http://localhost:5173`）作为 targetOrigin，禁止使用 `*`（允许任意域名接收），否则可能导致 token 被恶意网站窃取。

- window.opener 的可用性处理

仅当登录中心通过window.open打开时，opener才指向业务应用窗口；若用户刷新登录弹窗，opener会变为null，需降级为整页重定向，如 client1 的 login 函数中同时实现了 postMessage 和整页重定向。

- resource 参数的编解码

业务应用传递origin时需用 encodeURIComponent 编码（处理特殊字符），登录中心接收后用 decodeURIComponent 解码，避免 URL 解析错误，如 client1 中 watch 监听 resource 参数时进行了解码处理。

- 路由守卫必须调用 `next()`

无论是否允许路由跳转，beforeEach 守卫都必须调用 `next()`，否则会导致页面卡死（不渲染），client1 的路由守卫中正确实现了这一点。

- 弹窗被浏览器拦截的兼容

若浏览器因 “非用户主动触发” 拦截弹窗（如自动执行的window.open），需捕获错误并降级为整页重定向。

## 六、两种模式的选用场景 ##

|  模式   |  优势  |  劣势  |  适用场景  |
| :-----------: | :-----------: | :-----------: | :-----------: |
| 弹窗 + postMessage | 不刷新页面，保留用户操作上下文；体验流畅 | 需处理弹窗拦截、opener丢失等边缘情况 | 主流场景：用户主动触发的登录（如点击 “我的” 按钮） |
| 整页重定向 | 实现简单，无浏览器兼容性问题 | 刷新页面，丢失当前操作状态 | 降级方案：弹窗被拦截时；简单应用或旧浏览器 |

> 推荐实现 “智能兼容” 逻辑：登录中心优先尝试 postMessage 回传，检测到 opener 无效时自动切换为整页重定向，确保所有场景下的可用性，client1 的登录函数已实现此逻辑。

## 七、总结 ##

单点登录（SSO）的核心是通过 “统一认证 + 跨域通信” 实现多应用的身份共享。本项目通过 “弹窗 + postMessage” 模式优化用户体验，同时以整页重定向作为兜底，兼顾了安全性与兼容性。

关键成功要素包括：

- 严格的origin校验，防止 token 跨域泄露；

- 完善的边缘情况处理（如opener丢失、弹窗拦截）；

- 统一的 token 管理机制（路由守卫 + 请求拦截器）。

通过这套示例，业务应用（client1、client3）无需关心登录逻辑，只需专注自身业务；登录中心（client2）统一处理身份认证，实现 “一次登录，全平台通行” 的目标，为用户提供无缝的跨应用体验。实际应用中，可根据具体业务场景对这套代码进行扩展和优化，如增加 token 过期刷新机制、完善错误处理等。
