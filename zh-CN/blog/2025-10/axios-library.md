---
lastUpdated: true
commentabled: true
recommended: true
title: Axios 统一封装的思路
description: Axios 统一封装的思路
date: 2025-10-11 09:45:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## axios 统一封装的整体结构设计及优势 ##

## 核心结构与模块职责 ##

axios 封装通常采用 “分层解耦” 设计，核心模块及职责如下：

- **基础配置模块**：定义全局默认配置，如 `baseURL`（区分环境）、`timeout`（默认 5000ms）、`responseType: 'json'`，以及请求头默认值（如 `Content-Type: application/json`），通过 `axios.create()` 创建实例，避免污染全局 axios 对象。

- **拦截器模块**：包含请求拦截器和响应拦截器，集中处理通用逻辑（如参数添加、错误捕获），独立于业务请求，便于统一维护。

- **工具函数模块**：封装辅助方法，如 `getToken()`（从 `localStorage/cookie` 获取 token）、`formatParams()`（处理 GET 请求参数拼接、POST 请求参数序列化）、`handleBlob()`（文件流处理），避免重复代码。

- **请求方法封装模块**：对外暴露 `get`、`post`、`download`等方法，接收 “业务参数 + 自定义配置”，内部整合基础配置与拦截器，简化业务方调用。

- **错误处理模块**：统一管理请求错误（网络错误、超时、后端错误码），提供错误提示、重试、跳转等标准化处理方案。

### 结构优势 ###

- **扩展性**：新增功能（如请求缓存）时，只需在对应模块（如工具函数 / 拦截器）添加逻辑，无需修改所有业务请求；切换环境（如测试→生产）时，仅需修改基础配置的baseURL。

- **维护性**：通用逻辑（如 token 携带）集中在拦截器，若后端调整参数名（如 `token→authToken`），仅需修改拦截器中 1 处代码，无需逐个修改业务接口。

- **易用性**：业务方调用时无需关注 `baseURL`、拦截器等细节，只需传入 “接口路径 + 参数”，降低使用成本（如 `request.get('/user/list', { page: 1 })`）。

## 两类公用参数的实现方式及特殊场景处理 ##

### 固定公用参数（如appId、token）：请求拦截器全局添加 ###

**实现逻辑**：在请求拦截器中，对所有请求的 `params`（GET）或 `data`（POST）添加固定参数，同时处理 `token` 过期的特殊情况（如 `token` 不存在时跳转登录）。

```javascript
// 请求拦截器示例
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken(); // 自定义工具函数：从localStorage获取token
    // 1. 处理GET参数（params）
    config.params = {
      appId: 'com.xxx.frontend', // 固定参数
      token: token || '', // token存在则携带，否则传空
      ...config.params, // 业务参数覆盖默认（若有同名参数）
    };
    // 2. 处理POST参数（data）
    if (config.method === 'post' && config.data) {
      config.data = {
        appId: 'com.xxx.frontend',
        token: token || '',
        ...config.data,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

适用场景：所有接口必须携带的参数，且参数值相对固定（如appId固定，token仅随用户登录状态变化）。

### 动态公用参数（如分页pageSize）：请求方法默认值 + 业务方可选覆盖 ###

**实现逻辑**：在封装的 `get`/`post` 方法中，为参数设置默认值，业务方若需修改可手动传入，无需全局强制添加。

```ts
// 封装get方法示例
export const get = (url, params = {}, config = {}) => {
  // 动态公用参数：分页默认pageSize=10，page=1
  const defaultPageParams = {
    pageSize: 10,
    page: 1,
  };
  // 合并默认分页参数与业务参数（业务参数优先级更高）
  const finalParams = { ...defaultPageParams, ...params };
  return axiosInstance.get(url, {
    params: finalParams,
    ...config, // 自定义配置（如禁用loading）
  });
};
```
适用场景：部分接口（如列表查询）需要的通用参数，且参数值可能随业务场景变化（如 A 列表 `pageSize=20`，B 列表 `pageSize=10`）。

### 排除特定公用参数的处理：自定义配置标记 + 拦截器过滤 ###

业务方在请求时通过 config 传入 excludeParams（需排除的参数名数组），拦截器中根据该标记过滤参数：

```javascript
// 业务方调用示例（排除token参数）
get('/user/info', { id: 123 }, { excludeParams: ['token'] });
// 拦截器中添加过滤逻辑
axiosInstance.interceptors.request.use(
  (config) => {
    const { excludeParams = [] } = config;
    // 过滤GET参数
    config.params = Object.fromEntries(
      Object.entries({
        appId: 'com.xxx.frontend',
        token: getToken() || '',
        ...config.params,
      }).filter(([key]) => !excludeParams.includes(key))
    );
    // 过滤POST参数逻辑类似...
    return config;
  },
  (error) => Promise.reject(error)
);
```

## 请求 / 响应拦截器的常见逻辑与实现 ##

### 请求拦截器：除公用参数外的核心逻辑 ###

**请求头设置**：根据请求类型（如文件上传）动态修改 `Content-Type`，避免手动配置错误。

```ts
if (config.headers['Content-Type'] === 'multipart/form-data') {
  // 文件上传：无需序列化，axios自动处理FormData
  delete config.headers['Content-Type']; // 清除默认json头，避免冲突
} else if (config.method === 'post' && !config.headers['Content-Type']) {
  // 默认POST请求：设置json头
  config.headers['Content-Type'] = 'application/json';
}
```

**token 过期前刷新**：通过 `tokenExpireTime`（登录时后端返回）判断 token 剩余时间，若 `< 5 分钟` 则发起刷新请求，避免请求因 token 过期失败。

```ts
const tokenExpireTime = localStorage.getItem('tokenExpireTime');
const now = Date.now();
// 若token存在且即将过期，且无正在进行的刷新请求
if (token && tokenExpireTime - now < 5 * 60 * 1000 && !isRefreshing) {
  isRefreshing = true;
  // 发起刷新token请求
  refreshToken().then((newToken) => {
    localStorage.setItem('token', newToken);
    isRefreshing = false;
  }).catch(() => {
    // 刷新失败：跳转登录
    router.push('/login');
    isRefreshing = false;
  });
}
```

**请求参数格式转换**：处理 GET 请求数组参数（如 `ids=[1,2]→ids=1&ids=2`），避免后端解析错误。

```javascript
// 工具函数：格式化GET数组参数
const formatGetParams = (params) => {
  return Object.fromEntries(
    Object.entries(params).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((v) => [key, v]); // 数组参数拆分为多个key-value
      }
      return [[key, value]];
    })
  );
};
// 拦截器中调用
config.params = formatGetParams(config.params);
```

### 响应拦截器：统一处理响应结果与错误 ###

**正常响应处理**：提取后端返回的 `data`（通常后端响应格式为 `{ code: 200, data: {}, message: '' }`），直接返回 data 给业务方，简化调用。

```javascript
axiosInstance.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data;
    // 后端自定义成功码（如200）
    if (code === 200) {
      return data; // 业务方直接获取data，无需处理外层结构
    } else {
      // 非成功码：触发错误处理（如提示“参数错误”）
      ElMessage.error(message || '请求失败');
      return Promise.reject(new Error(message || '响应错误'));
    }
  },
  (error) => {
    // 网络错误/超时处理
    if (!error.response) {
      if (error.message.includes('timeout')) {
        ElMessage.error('请求超时，请稍后重试');
      } else {
        ElMessage.error('网络异常，请检查网络连接');
      }
      return Promise.reject(error);
    }
    // 后端返回错误码处理
    const { status, data } = error.response;
    switch (status) {
      case 401:
        // 未授权：清除token并跳转登录
        localStorage.removeItem('token');
        router.push('/login?redirect=' + window.location.pathname);
        ElMessage.error(data.message || '登录已过期，请重新登录');
        break;
      case 403:
        // 权限不足：提示并返回上一页
        ElMessage.error('您无此操作权限');
        router.go(-1);
        break;
      case 500:
        // 服务器错误：提示并上报错误日志
        ElMessage.error('服务器内部错误，请联系管理员');
        reportError(error); // 自定义日志上报函数
        break;
      default:
        ElMessage.error(data.message || `请求错误（${status}）`);
    }
    return Promise.reject(error);
  }
);
```

## 全局 loading 自动化配置逻辑 ##

### 判断请求状态：计数器 + 请求状态管理 ###

通过 “请求计数器” 记录当前活跃请求数，计数器 `> 0` 时显示 `loading`，`=0` 时隐藏 `loading`，避免单个请求的 `loading` 闪烁：

```ts
let requestCount = 0; // 请求计数器
const showLoading = () => {
  if (requestCount === 0) {
    // 使用Element Plus的Loading组件，全局遮罩
    ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.5)',
    });
  }
  requestCount++;
};
const hideLoading = () => {
  requestCount--;
  if (requestCount === 0) {
    // 关闭loading（需确保获取到Loading实例）
    const loadingInstance = ElLoading.service();
    loadingInstance.close();
  }
};
```

**调用时机**：请求拦截器中调用 `showLoading()`，响应拦截器（成功 / 失败）中调用 `hideLoading()`，确保每个请求对应 “显示→隐藏” 的完整流程。

### 单个请求禁用 loading：自定义配置标记 ###

封装请求方法时，允许业务方通过 `config` 传入 `showLoading: false`，拦截器中根据该标记决定是否执行 `loading` 逻辑：

```javascript
// 1. 请求拦截器中添加判断
axiosInstance.interceptors.request.use(
  (config) => {
    // 若未禁用loading，则显示
    if (config.showLoading !== false) {
      showLoading();
    }
    // ...其他逻辑
    return config;
  },
  (error) => {
    // 请求发送失败时，若未禁用loading，需隐藏
    if (error.config?.showLoading !== false) {
      hideLoading();
    }
    return Promise.reject(error);
  }
);
// 2. 业务方调用示例（下拉刷新请求禁用loading）
get('/user/list', { page: 2 }, { showLoading: false });
```

### 多请求同步 loading：依赖计数器机制 ###

由于使用 `requestCount` 计数器，多个请求同时发起时，每个请求会使计数器 + 1，只有所有请求完成（计数器归 0）才会隐藏 loading，天然避免 “先隐藏再显示”：

**例**：`同时发起 A、B 两个请求→requestCount从 0→1→2（显示 loading）→A 完成→1→B 完成→0（隐藏 loading）`。

## 统一文件下载处理（文件流 + 不同类型文件） ##

### axios 请求配置：确保正确接收文件流 ###

- 设置 `responseType: 'blob'`：告知 axios 将响应数据解析为 Blob 对象（文件流），而非默认的 JSON，避免文件流被错误解析导致乱码。
- 设置 `responseEncoding: 'utf-8'`（可选）：确保中文文件名正常解析。

```javascript
// 封装文件下载方法
export const download = (url, params = {}, config = {}) => {
  return axiosInstance.get(url, {
    params,
    responseType: 'blob', // 核心配置：接收文件流
    responseEncoding: 'utf-8',
    ...config,
  }).then((response) => {
    handleDownloadResponse(response); // 处理文件流
  });
};
```

### 文件流处理：区分下载与预览 ###

- 核心逻辑：从响应头 `content-disposition` 中提取文件名，通过 `URL.createObjectURL(blob)` 创建临时 `URL`，结合 `a` 标签（下载）或 `iframe`（预览）实现功能。
- 处理中文文件名乱码：通过 `decodeURIComponent()` 解码头信息中的文件名（后端需将文件名编码为 `UTF-8`）。

```javascript
// 处理下载响应（通用方法）
const handleDownloadResponse = (response) => {
  const blob = response.data;
  const headers = response.headers;
  // 1. 提取文件名（从content-disposition头）
  const disposition = headers['content-disposition'] || '';
  const filenameMatch = disposition.match(/filename=([^;]+)/i);
  // 解码中文文件名（避免乱码）
  const filename = filenameMatch 
    ? decodeURIComponent(filenameMatch[1].replace(/"/g, '')) 
    : 'default_file';
  // 2. 判断文件类型：预览（PDF）或下载（Excel/Word等）
  const blobType = blob.type;
  const url = URL.createObjectURL(blob); // 创建临时URL
  if (blobType.includes('pdf')) {
    // PDF预览：使用iframe
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '800px';
    iframe.style.border = 'none';
    // 替换页面中预览容器的内容
    const previewContainer = document.getElementById('pdf-preview');
    if (previewContainer) {
      previewContainer.innerHTML = '';
      previewContainer.appendChild(iframe);
    }
  } else {
    // 其他文件：下载（a标签）
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // 设置下载文件名
    // 触发点击（解决部分浏览器不支持直接点击）
    document.body.appendChild(a);
    a.click();
    // 清理临时资源
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // 释放URL对象，避免内存泄漏
  }
};
```

## 统一错误处理与业务方自定义错误逻辑 ##

### 请求过程中的常见错误类型及统一处理 ###

| 错误类型  | 触发场景  |  统一处理逻辑  |
| :-------: | :-------: | :---------: |
| 网络错误 | 断网、服务器宕机 | 提示 “网络异常，请检查连接”，不上报日志（用户环境问题） |
| 请求超时 | `timeout` 时间内未收到响应（如默认 5000ms） | 提示 “请求超时，请稍后重试”，可配置重试 1 次（偶发网络波动） |
| 401 未授权 | token 过期、未登录 | `清除 token→跳转登录页（带当前页面地址，登录后返回）→提示 “登录已过期”` |
| 403 权限不足 | 无接口访问权限（如普通用户调用管理员接口） | 提示 “无操作权限”→返回上一页，不上报日志（业务权限问题） |
| 404 接口不存在 | 接口路径错误、环境配置错误 | 提示 “请求资源不存在”→上报日志（开发配置问题） |
| 500/504 服务器错误 | 后端代码异常、网关超时 | 提示 “服务器内部错误，请联系管理员”→上报详细日志（后端问题） |
| 后端自定义错误（如 400） | 参数错误、业务逻辑错误（如 “手机号已存在”） | 提示后端返回的 message（如 “手机号已存在”），不上报日志（业务场景错误） |

**统一处理代码**：参考 “响应拦截器” 部分的错误处理逻辑，通过 `switch (status)` 和 `code`

### 业务方自定义错误处理逻辑：支持catch捕获与配置回调 ###

全局错误处理覆盖通用场景，但部分业务需自定义逻辑（如登录失败后不跳转，而是显示验证码），可通过两种方式实现：

#### 方式 1：业务方在请求 catch 中重写处理 ####

由于拦截器中已将错误 `Promise.reject`，业务方可直接在 `catch` 中捕获错误，覆盖全局逻辑：

```typescript
// 业务方调用示例：自定义401错误处理（不跳转登录，显示弹窗）
login({ username: 'test', pwd: '123' })
  .then((res) => { /* 成功逻辑 */ })
  .catch((error) => {
    const status = error.response?.status;
    if (status === 401) {
      // 自定义处理：显示验证码弹窗，而非跳转登录
      showVerifyCodeModal();
    } else {
      // 非401错误：沿用全局处理（如提示网络错误）
      ElMessage.error(error.message || '请求失败');
    }
  });
```

#### 方式 2：封装时提供 errorCallback 配置 ####

在请求方法中增加 `errorCallback` 参数，允许业务方传入自定义回调，拦截器中优先执行回调：

```typescript
// 1. 封装post方法：增加errorCallback参数
export const post = (url, data = {}, config = {}) => {
  const { errorCallback, ...restConfig } = config;
  return axiosInstance.post(url, data, restConfig)
    .catch((error) => {
      // 若业务方传入回调，优先执行
      if (typeof errorCallback === 'function') {
        return errorCallback(error);
      }
      // 无回调：沿用全局错误处理
      return Promise.reject(error);
    });
};
// 2. 业务方调用：传入errorCallback
post(
  '/login',
  { username: 'test', pwd: '123' },
  {
    errorCallback: (error) => {
      if (error.response?.status === 401) {
        showVerifyCodeModal(); // 自定义处理
      }
    }
  }
);
```

## 多环境baseURL动态切换与代理配置 ##

### baseURL动态切换方案：环境变量 + 配置文件 ###

通过 “环境变量区分环境”+“配置文件存储baseURL” 实现切换，避免硬编码修改，常见方案如下：

#### 步骤 1：创建环境配置文件 ####

在项目 `src/config` 目录下创建多环境配置文件，存储不同环境的 `baseURL`：

```js
// src/config/env.js
export default {
  // 开发环境（本地）
  development: {
    baseURL: '/api' // 配合代理，避免跨域
  },
  // 测试环境（测试服）
  test: {
    baseURL: 'https://test.xxx.com/api'
  },
  // 生产环境（正式服）
  production: {
    baseURL: 'https://prod.xxx.com/api'
  }
};
```

#### 步骤 2：通过环境变量判断当前环境 ####

利用构建工具（如 Vite、Webpack）的环境变量，自动识别当前环境（如 `NODE_ENV`）：

```javascript
// src/utils/request.js（axios封装文件）
import envConfig from '@/config/env';
// 1. 获取当前环境（Vite中用import.meta.env.MODE，Webpack中用process.env.NODE_ENV）
const currentEnv = import.meta.env.MODE || 'development';
// 2. 创建axios实例：动态设置baseURL
const axiosInstance = axios.create({
  baseURL: envConfig[currentEnv].baseURL,
  timeout: 5000
});
```

#### 步骤 3：手动切换环境（可选） ####

若需支持用户手动切换环境（如测试人员切换测试 / 预发布环境），可通过 “本地存储 + 重新初始化实例” 实现：

```js
// 1. 手动切换环境的函数
export const switchEnv = (targetEnv) => {
  // 存储环境到localStorage
  localStorage.setItem('currentEnv', targetEnv);
  // 重新初始化axios实例：更新baseURL
  axiosInstance.defaults.baseURL = envConfig[targetEnv].baseURL;
};
// 2. 初始化时优先读取localStorage中的环境
const initAxios = () => {
  const savedEnv = localStorage.getItem('currentEnv') || currentEnv;
  axiosInstance.defaults.baseURL = envConfig[savedEnv].baseURL;
};
initAxios(); // 项目启动时初始化
```

### 开发环境代理配置：避免跨域 ###

开发环境中，`baseURL` 设为 `/api`，通过构建工具配置代理，将 `/api` 前缀的请求转发到真实后端地址，解决跨域问题：

#### Vite 代理配置（vite.config.js） ####

```javascript
export default defineConfig({
  server: {
    proxy: {
      // 匹配所有以/api开头的请求
      '/api': {
        target: 'https://dev.xxx.com', // 后端开发环境地址
        changeOrigin: true, // 开启跨域（修改请求头中的Origin）
        rewrite: (path) => path.replace(/^/api/, '') // 移除/api前缀（若后端无该前缀）
      }
    }
  }
});
```

#### Webpack 代理配置（vue.config.js，Vue2 项目） ####

```js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://dev.xxx.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
};
```

### 代理配置注意事项 ###

- **changeOrigin: true 必须开启**：若不开启，后端会收到 `Origin: localhost:3000`（前端地址），可能因跨域策略拒绝请求；开启后，`Origin` 会改为 `target` 地址（如 `dev.xxx.com`）。

- **rewrite/pathRewrite 适配后端前缀**：若后端接口无 `/api` 前缀（如真实接口是 `/login` ，而非 `/api/login`），需通过 `rewrite` 移除前缀，避免 404。

- **避免代理冲突**：若项目中存在本地 Mock 服务（如 `/mock` 前缀），需确保代理规则不覆盖 Mock 请求（如仅代理 `/api` 前缀）。

## 请求取消功能实现（CancelToken/AbortController） ##

axios 支持两种取消请求方式：`CancelToken`（旧版，axios < 0.22.0）和 `AbortController`（新版，axios ≥ 0.22.0），以下以新版 `AbortController` 为例，实现请求取消与管理。

### 核心实现：封装取消令牌管理 ###

通过 “Map 存储取消控制器”+“请求标识关联控制器”，实现单个 / 批量取消请求：

#### 步骤 1：创建取消令牌管理工具 ####

```js
// src/utils/requestCancel.js
// 存储取消控制器：key=请求标识（如url+method），value=AbortController实例
const controllerMap = new Map();
// 1. 创建取消控制器并存储
export const createCancelController = (requestKey) => {
  // 若已有相同请求的控制器，先取消旧请求（避免重复请求）
  if (controllerMap.has(requestKey)) {
    cancelRequest(requestKey);
  }
  const controller = new AbortController();
  controllerMap.set(requestKey, controller);
  return controller.signal; // 返回signal，传入axios请求配置
};
// 2. 取消指定请求
export const cancelRequest = (requestKey) => {
  const controller = controllerMap.get(requestKey);
  if (controller) {
    controller.abort(); // 触发取消
    controllerMap.delete(requestKey); // 移除控制器
  }
};
// 3. 取消所有未完成的请求（如页面跳转时）
export const cancelAllRequests = () => {
  controllerMap.forEach((controller) => controller.abort());
  controllerMap.clear();
};
```

#### 步骤 2：集成到 axios 封装中 ####

在请求方法中生成 `requestKey`（如 `url+method`），创建 `signal` 并传入 axios 配置：

```javascript
// src/utils/request.js
import { createCancelController, cancelRequest } from './requestCancel';
export const get = (url, params = {}, config = {}) => {
  // 生成请求标识：url + 'GET'（避免GET/POST同url冲突）
  const requestKey = `${url}-GET`;
  // 创建signal，传入axios配置
  const signal = createCancelController(requestKey);
  // 合并配置：添加signal
  const finalConfig = { signal, ...config };
  return axiosInstance.get(url, { params, ...finalConfig })
    .finally(() => {
      // 请求完成（成功/失败）：移除控制器
      cancelRequest(requestKey);
    });
};
```

### 业务方触发取消请求 ###

#### 场景 1：取消单个请求（如快速点击按钮） ####

业务方需存储 `requestKey`，调用 `cancelRequest` 取消：

```js
// 业务组件中：取消“获取用户列表”请求
const cancelUserListRequest = () => {
  const requestKey = '/user/list-GET'; // 与封装时的requestKey一致
  cancelRequest(requestKey);
};
// 点击“取消”按钮触发
<button @click="cancelUserListRequest">取消加载</button>
```

#### 场景 2：页面跳转时取消所有请求 ####

在路由守卫中调用 `cancelAllRequests`，避免页面跳转后请求仍占用资源：

```javascript
// src/router/index.js
import { cancelAllRequests } from '@/utils/requestCancel';
router.beforeEach((to, from, next) => {
  // 离开当前页面时，取消所有未完成的请求
  cancelAllRequests();
  next();
});
```

### 注意事项 ###

- **AbortController 兼容性**：axios ≥ 0.22.0 才支持，若项目使用旧版 axios，需改用 CancelToken（逻辑类似，替换为 `CancelToken.source()`）。

- **避免重复取消**：请求完成后需调用 `cancelRequest` 移除控制器，避免重复调用 `abort()` 导致错误。

- **错误捕获**：取消请求会触发 `Cancel` 错误，需在拦截器中过滤，避免错误提示：

```javascript
// 响应拦截器中过滤取消错误
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    // 取消请求的错误：不提示，直接返回
    if (axios.isCancel(error)) {
      console.log('请求已取消', error.message);
      return Promise.reject(new Error('请求已取消'));
    }
    // 其他错误：正常处理
    return Promise.reject(error);
  }
);
```

## 请求函数参数设计与配置优先级 ##

### 参数设计：兼顾易用性与灵活性 ###

封装的请求函数（`get`/`post`/`download`）需支持 “基础参数 + 自定义配置”，参数结构设计如下（以 `post` 为例）：

```typescript
/**
 * POST请求封装
 * @param {string} url - 接口路径（如'/login'）
 * @param {Object} data - 请求体参数（POST/PUT等）
 * @param {Object} config - 自定义配置（覆盖全局配置）
 * @param {number} config.timeout - 超时时间（覆盖全局5000ms）
 * @param {Object} config.headers - 请求头（覆盖全局headers）
 * @param {boolean} config.showLoading - 是否显示loading（默认true）
 * @param {Function} config.errorCallback - 自定义错误回调
 * @returns {Promise} - 请求结果Promise
 */
export const post = (url, data = {}, config = {}) => {
  // 解构自定义配置，默认值与全局配置对齐
  const {
    timeout = axiosInstance.defaults.timeout, // 全局默认超时5000ms
    headers = {},
    showLoading = true,
    errorCallback,
    ...restConfig
  } = config;
  // 合并配置：自定义配置覆盖全局
  const finalConfig = {
    timeout,
    headers: { ...axiosInstance.defaults.headers, ...headers }, //  headers合并
    showLoading,
    errorCallback,
    ...restConfig
  };
  return axiosInstance.post(url, data, finalConfig)
    .catch((error) => {
      if (errorCallback) return errorCallback(error);
      return Promise.reject(error);
    });
};
```

### 配置优先级：业务自定义 > 全局默认 ###

配置优先级从高到低为：业务方传入的自定义配置 → 全局默认配置 → axios 默认配置，具体规则如下：

- `timeout`：业务方传入 `config.timeout=10000` → 覆盖全局 `timeout=5000` → 覆盖 axios 默认 `timeout=0`（无超时）。

- `headers`：采用 “浅合并”，业务方传入的 `headers`字段覆盖全局，未传入字段沿用全局：

```js
// 全局headers：{ 'Content-Type': 'application/json', 'appId': '123' }
// 业务方headers：{ 'Content-Type': 'multipart/form-data' }
// 合并后：{ 'Content-Type': 'multipart/form-data', 'appId': '123' }
```

- `showLoading`：业务方传入 `showLoading=false` → 覆盖全局默认true，不显示 loading。

- `responseType`：文件下载时传入 `responseType: 'blob'` → 覆盖全局 `responseType: 'json'`。

### 业务方调用示例：灵活配置 ###

```js
// 示例1：自定义超时+禁用loading
post(
  '/upload/file',
  formData, // FormData格式（文件上传）
  {
    timeout: 30000, // 上传文件超时30s
    showLoading: false, // 禁用loading
    headers: { 'Content-Type': 'multipart/form-data' } // 覆盖Content-Type
  }
);
// 示例2：自定义错误回调+修改baseURL
get(
  '/user/info',
  { id: 123 },
  {
    baseURL: 'https://special.xxx.com/api', // 临时使用特殊baseURL
    errorCallback: (error) => {
      if (error.response?.status === 404) {
        ElMessage.error('用户不存在');
      }
    }
  }
);
```

## 性能优化与用户体验增强功能（以 “请求重试” 为例） ##

### 优化点选择：请求重试机制 ###

针对 “偶发网络波动导致的请求失败”（如 502 网关错误、超时），自动重试 1-2 次，避免用户手动刷新，提升体验。

### 实现思路 ###

**核心逻辑**：在响应拦截器中判断错误类型（仅重试偶发错误），记录重试次数，达到最大次数后停止重试，返回错误。

**关键配置**：全局设置 “最大重试次数（如 2 次）” 和 “重试间隔（如 1000ms，避免频繁重试压垮服务器）”。

### 核心代码实现 ###

```javascript
// src/utils/request.js
// 全局重试配置
const retryConfig = {
  maxRetryCount: 2, // 最大重试次数
  retryDelay: 1000, // 重试间隔（ms）
};
// 封装重试函数
const retryRequest = async (config, retryCount = 0) => {
  try {
    // 克隆请求配置：避免修改原配置
    const cloneConfig = { ...config };
    // 增加重试次数标识
    cloneConfig._retryCount = retryCount;
    // 发起重试请求
    return await axiosInstance(cloneConfig);
  } catch (error) {
    // 重试次数达到上限：返回错误
    if (retryCount >= retryConfig.maxRetryCount) {
      return Promise.reject(error);
    }
    // 未达上限：延迟后重试（递归调用）
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(retryRequest(config, retryCount + 1));
      }, retryConfig.retryDelay);
    });
  }
};
// 响应拦截器中集成重试逻辑
axiosInstance.interceptors.response.use ((response) => response,
  async (error) => {
    // 1. 过滤无需重试的错误（取消请求、401 未授权、403 权限不足等）
    const shouldRetry = !axios.isCancel (error) &&
    error.response?.status !== 401 &&
    error.response?.status !== 403 &&
    error.response?.status !== 404 &&
    (error.response?.status >= 500 || error.message.includes ('timeout'));
    // 2. 若无需重试：直接返回错误
    if (!shouldRetry) {
      return Promise.reject (error);
    }
    // 3. 若需重试：获取原请求配置，调用重试函数
    const originalConfig = error.config;
    // 避免重复添加_retryCount（首次重试时无该字段）
    const currentRetryCount = originalConfig._retryCount || 0;
    // 4. 判断是否达到最大重试次数
    if (currentRetryCount>= retryConfig.maxRetryCount) {
      ElMessage.error (请求失败（已重试${currentRetryCount}次），请稍后再试);
      return Promise.reject(error);
    }
    // 5. 发起重试
    console.log (请求重试中（第${currentRetryCount + 1}次）：${originalConfig.url});
    return retryRequest(originalConfig, currentRetryCount);​
  });
```

### 请求重试的收益与注意事项 ###

**核心收益**：

- 提升用户体验：偶发的502网关错误、网络波动导致的超时，无需用户手动刷新页面，自动重试即可恢复，减少用户操作成本。

- 降低错误率：针对非业务性错误（如服务器临时过载），重试机制可有效降低最终的请求失败率，提升系统稳定性。

**注意事项**：

- 明确重试范围：仅对“服务器端偶发错误”（500+状态码、超时）重试，避免对“客户端错误”（401/403/404）重试，否则会无效请求浪费资源。

- 设置重试间隔：通过 `retryDelay=1000ms` 避免短时间内频繁重试，防止加重服务器负担（如服务器过载时，频繁重试会加剧问题）。

- 避免幂等性问题：对“非幂等请求”（如POST提交表单、创建订单），需谨慎使用重试，避免重复创建数据（可通过后端接口幂等设计解决，如添加唯一请求ID）。

- 业务方自定义控制：可在请求配置中增加 `enableRetry: false`，允许业务方禁用特定请求的重试（如支付接口，避免重复扣款）：

```javascript
// 业务方调用：禁用重试（支付接口）
post('/order/pay', { orderId: 123 }, { enableRetry: false });
// 响应拦截器中增加判断：若disableRetry则不重试
const shouldRetry = !originalConfig.enableRetry === false && ...;
```