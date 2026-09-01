---
lastUpdated: true
commentabled: true
recommended: true
title: 微信小程序使用 Orval + OpenAPI 自动生成接口
description: Axios 兼容踩坑记录
date: 2026-09-01 10:15:00
pageClass: blog-page-class
cover: /covers/miniprogram.svg
---

最近在做微信小程序时，希望尽量减少手写接口代码。后端本身已经提供了 OpenAPI 文档，所以第一反应就是直接使用 Orval 根据 OpenAPI 自动生成 TypeScript 类型和请求代码。

Orval 本身确实很好用，问题出在它生成的 Axios 请求代码无法直接运行在微信小程序环境里。最后通过 `axios-miniprogram` 加一层 Axios API 兼容层解决了这个问题。

## 安装 Orval 和 Axios ##

先安装 Orval 和 Axios：

```bash
npm install axios

npm install -D orval
```

Orval 可以直接根据 OpenAPI Schema 生成 TypeScript 类型以及接口请求代码。官方也支持 Axios Client。

## 配置 Orval ##

项目根目录创建： `orval.config.ts`

配置如下：

```ts
import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: './openapi.json',
    },

    output: {
      target: './miniprogram/api/generated/api.ts',
      schemas: './miniprogram/api/generated/models',
      client: 'axios',
      httpClient: 'axios',
    },
  },
});
```

## 生成 API 代码 ##

直接执行：

```bash
npx orval
```

运行 Orval 后，会生成类似这样的目录：

```txt
miniprogram/
└── api/
    └── generated/
        ├── api.ts
        └── models/
            ├── user.ts
            ├── loginRequest.ts
            └── ...
```

到这里一切都很正常。

接口方法、请求参数、返回值类型全部可以直接根据后端 OpenAPI 自动生成。

这样后端接口发生变化以后，只需要重新获取：`openapi.json`

然后重新：

```bash
npm run api
```

即可同步客户端代码，不再需要手动维护大量 Interface 和请求函数。

## 第一个坑：Axios 无法直接运行在微信小程序 ##

真正的问题是在微信开发者工具中编译运行。

Orval 生成的代码依赖：

```ts
import axios from 'axios';
```

但标准 Axios 面向的是浏览器和 Node.js 环境。

微信小程序并不是标准浏览器环境，也没有浏览器中的完整 XMLHttpRequest 等运行环境，请求最终需要走：

```ts
wx.request()
```

所以直接把标准 Axios 放进微信小程序里并不能正常工作。

这就导致一个问题：

```txt
OpenAPI
   ↓
Orval
   ↓
Axios
   ↓
微信小程序
   ✕
Orval 自动生成代码这条路本身没有问题，但是默认 Axios Transport 和微信小程序运行环境对不上。
```

## 找到 axios-miniprogram ##

继续查小程序生态以后，找到了：`axios-miniprogram`

这个库就是专门面向小程序平台实现的 Promise HTTP 请求库，官方 README 明确列出了微信小程序支持，同时也支持 TypeScript、拦截器、中间件、扩展实例等功能。

安装：

```bash
npm install axios-miniprogram
```

然后就可以创建自己的请求实例，例如：

```ts
import axios from 'axios-miniprogram';

export const axiosInstance = axios.create({
  baseURL: 'https://example.com',
});
```

这样底层网络请求的问题解决了：

```txt
微信小程序
   ↓
axios-miniprogram
   ↓
wx.request
```

但很快又遇到了第二个问题。

## 第二个坑：axios-miniprogram 和 Axios 的方法参数不一致 ##

`axios-miniprogram` 虽然 API 命名和 Axios 很像，但它的方法参数设计并不完全一致，这正是 Orval 生成代码无法直接使用它的原因。

以 `GET` 请求为例。

标准 Axios 的调用方式是：

```ts
axios.get(url, config)
```

查询参数放在 `config.params` 中：

```ts
axios.get('/users', {
  params: {
    page: 1,
    size: 20,
  },
})
```

而 `axios-miniprogram` 的调用方式是：

```ts
axios.get(url, params, options)
```

也就是说，它把查询参数单独作为第二个参数：

```ts
axios.get(
  '/users',
  {
    page: 1,
    size: 20,
  },
  {
    timeout: 10000,
  },
)
```

两者的方法签名实际上是：

```ts
// Axios
get(url, config)

// axios-miniprogram
get(url, params, options)
```

而 Orval 在配置：

```ts
client: 'axios',
httpClient: 'axios',
```

之后，生成的是标准 Axios 风格代码，例如：

```ts
axiosInstance.get('/users', {
  params: {
    page: 1,
  },
})
```

如果直接把这里的 axiosInstance 替换成 axios-miniprogram，那么：

```json
{
  params: {
    page: 1,
  },
}
```

会被 axios-miniprogram 当成第二个参数 params，而不是 Axios 中的 config。

于是原本应该发送：`?page=1` 的数据结构就变了，配置项、查询参数等也无法按照 Orval 生成代码的预期工作。

## 实现 Axios 兼容层 ##

最终还是需要增加一层兼容层，把 Orval 生成的标准 Axios 调用转换成 axios-miniprogram 能够正确处理的请求格式。

这些方法，那么最简单的办法就是自己实现一层 Adapter，把标准 Axios API 转换成 axios-miniprogram 的：

```ts
axiosInstance.request()
```

最终实现如下：

```ts
import type {
  AxiosRequestConfig,
  AxiosRequestData,
  AxiosResponse,
  AxiosResponseData,
} from 'axios-miniprogram';

import { axiosInstance } from './request';

type StandardRequestMethod =
  | 'GET'
  | 'DELETE'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'PATCH';

const requestWithConfig = <TData extends AxiosResponseData>(
  method: StandardRequestMethod,
  url: string,
  config?: AxiosRequestConfig,
  data?: AxiosRequestData,
): Promise<AxiosResponse<TData>> => {
  const requestConfig: AxiosRequestConfig = {
    ...config,
    url,
    method,
  };

  if (data !== undefined) {
    requestConfig.data = data;
  }

  return axiosInstance.request<TData>(requestConfig);
};

const compatibleAxiosInstance = axiosInstance.extend({});

compatibleAxiosInstance.get = <TData extends AxiosResponseData>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<TData>> =>
  requestWithConfig<TData>('GET', url, config);

compatibleAxiosInstance.delete = <TData extends AxiosResponseData>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<TData>> =>
  requestWithConfig<TData>('DELETE', url, config);

compatibleAxiosInstance.head = <TData extends AxiosResponseData>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<TData>> =>
  requestWithConfig<TData>('HEAD', url, config);

compatibleAxiosInstance.post = <TData extends AxiosResponseData>(
  url: string,
  data?: AxiosRequestData,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<TData>> =>
  requestWithConfig<TData>('POST', url, config, data);

compatibleAxiosInstance.put = <TData extends AxiosResponseData>(
  url: string,
  data?: AxiosRequestData,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<TData>> =>
  requestWithConfig<TData>('PUT', url, config, data);

compatibleAxiosInstance.patch = <TData extends AxiosResponseData>(
  url: string,
  data?: AxiosRequestData,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<TData>> =>
  requestWithConfig<TData>('PATCH', url, config, data);

export { compatibleAxiosInstance };
```

## 最终编译成功 ##

增加兼容层以后重新编译微信小程序，Orval 自动生成的接口终于可以正常调用。

请求也能够正常发送。
