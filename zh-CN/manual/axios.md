---
outline: false
aside: false
layout: doc
date: 2025-08
title: 最优雅的 Axios
description: 最优雅的 Axios
category: 文档
pageClass: manual-page-class
---

> 经过一上午的反复打磨，终于写出了这个让我满意的 HTTP 客户端封装。当我把代码发给朋友时，他竟然挑出了一堆问题！还好我都一一解决了。

:::tabs key:ab
== tab a
a content
== tab b
b content
:::

:::tabs key:ab
== tab a
a content 2
== tab b
b content 2
:::

## 🎯 为什么要重新封装 Axios？ ##

我们都知道 Axios 是 JavaScript 世界里最受欢迎的 HTTP 客户端，但在实际项目中，我们总是需要：

- **🔄 统一的错误处理** - 不想在每个请求里写重复的 try-catch
- **🚫 请求取消机制** - 用户快速切换页面时取消无用请求
- **🔁 自动重试功能** - 网络不稳定时自动重试
- **🎨 TypeScript 完美支持** - 类型安全，IDE 智能提示
- **🏗️ 多实例管理** - 不同 API 服务需要不同配置

市面上的封装要么太简单，要么太复杂。所以我决定写一个**既优雅又实用**的版本。

## 🎨 设计理念 ##

这个封装的设计遵循几个核心原则：

- **🎯 渐进式增强** - 可以像原生 Axios 一样简单使用，也可以启用高级功能
- **🔒 类型安全** - 完整的 TypeScript 支持，编译时发现问题
- **🧩 灵活扩展** - 支持多实例、自定义拦截器、业务定制
- **⚡ 性能优先** - 自动去重、智能重试、内存管理
- **📖 文档友好** - 丰富的示例和注释，上手即用

## 📜 完整源码 ##

```typescript
import Axios, { type AxiosInstance, type AxiosRequestConfig, type CustomParamsSerializer, type AxiosResponse, type InternalAxiosRequestConfig, type Method, type AxiosError } from "axios";
import { stringify } from "qs";

// 基础配置
const defaultConfig: AxiosRequestConfig = {
  timeout: 6000,
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  },
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

// 响应数据基础结构
export interface BaseResponse {
  code: number;
  message?: string;
}

// 去除与BaseResponse冲突的字段
type OmitBaseResponse<T> = Omit<T, keyof BaseResponse>;

// 响应数据类型定义 - 避免属性冲突，确保BaseResponse优先级
export type ResponseData<T = any> = BaseResponse & OmitBaseResponse<T>;

// 响应数据验证函数类型
export type ResponseValidator<T = any> = (data: ResponseData<T>) => boolean;

// 重试配置
export interface RetryConfig {
  retries?: number; // 重试次数
  retryDelay?: number; // 重试延迟（毫秒）
  retryCondition?: (error: AxiosError) => boolean; // 重试条件
}

// 拦截器配置类型
interface InterceptorsConfig {
  requestInterceptor?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
  requestErrorInterceptor?: (error: AxiosError) => Promise<any>;
  responseInterceptor?: (response: AxiosResponse<ResponseData<any>>) => any;
  responseErrorInterceptor?: (error: AxiosError) => Promise<any>;
}

// 请求唯一键
type RequestKey = string | symbol;

/**
 * 增强型 HTTP 客户端，基于 Axios 封装
 * 支持拦截器配置、请求取消、多实例管理等功能
 */
class HttpClient {
  private instance: AxiosInstance;
  private requestInterceptorId?: number;
  private responseInterceptorId?: number;
  private abortControllers: Map<RequestKey, AbortController> = new Map();

  /**
   * 创建 HTTP 客户端实例
   * @param customConfig 自定义 Axios 配置
   * @param interceptors 自定义拦截器配置
   */
  constructor(customConfig?: AxiosRequestConfig, interceptors?: InterceptorsConfig) {
    this.instance = Axios.create({ ...defaultConfig, ...customConfig });
    this.initInterceptors(interceptors);
  }

  /** 初始化拦截器 */
  private initInterceptors(interceptors?: InterceptorsConfig): void {
    this.initRequestInterceptor(interceptors?.requestInterceptor, interceptors?.requestErrorInterceptor);
    this.initResponseInterceptor(interceptors?.responseInterceptor, interceptors?.responseErrorInterceptor);
  }

  /** 初始化请求拦截器 */
  private initRequestInterceptor(customInterceptor?: InterceptorsConfig["requestInterceptor"], customErrorInterceptor?: InterceptorsConfig["requestErrorInterceptor"]): void {
    // 默认请求拦截器
    const defaultInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      /* 在这里写请求拦截器的默认业务逻辑 */
      // 示例: 添加token
      // const token = localStorage.getItem('token');
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }

      // 示例: 添加时间戳防止缓存
      // if (config.method?.toUpperCase() === 'GET') {
      //   config.params = { ...config.params, _t: Date.now() };
      // }

      return config;
    };

    // 默认请求错误拦截器
    const defaultErrorInterceptor = (error: AxiosError): Promise<any> => {
      /* 在这里写请求错误拦截器的默认业务逻辑 */
      // 示例: 处理请求前的错误
      // console.error('请求配置错误:', error);

      return Promise.reject(error);
    };

    // 优先使用自定义拦截器，否则使用默认拦截器
    this.requestInterceptorId = this.instance.interceptors.request.use(customInterceptor || defaultInterceptor, customErrorInterceptor || defaultErrorInterceptor);
  }

  /** 初始化响应拦截器 */
  private initResponseInterceptor(customInterceptor?: InterceptorsConfig["responseInterceptor"], customErrorInterceptor?: InterceptorsConfig["responseErrorInterceptor"]): void {
    // 默认响应拦截器
    const defaultInterceptor = (response: AxiosResponse<ResponseData<any>>) => {
      const requestKey = this.getRequestKey(response.config);
      if (requestKey) this.abortControllers.delete(requestKey);

      /* 在这里写响应拦截器的默认业务逻辑 */
      // 示例: 处理不同的响应码
      // const { code, message } = response.data;
      // switch(code) {
      //   case 200:
      //     return response.data;
      //   case 401:
      //     // 未授权处理
      //     break;
      //   case 403:
      //     // 权限不足处理
      //     break;
      //   default:
      //     // 其他错误处理
      //     console.error('请求错误:', message);
      // }

      return response.data;
    };

    // 默认响应错误拦截器
    const defaultErrorInterceptor = (error: AxiosError): Promise<any> => {
      if (error.config) {
        const requestKey = this.getRequestKey(error.config);
        if (requestKey) this.abortControllers.delete(requestKey);
      }

      // 处理请求被取消的情况
      if (Axios.isCancel(error)) {
        console.warn("请求已被取消:", error.message);
        return Promise.reject(new Error("请求已被取消"));
      }

      // 网络错误处理
      if (!(error as AxiosError).response) {
        if ((error as any).code === "ECONNABORTED" || (error as AxiosError).message?.includes("timeout")) {
          return Promise.reject(new Error("请求超时，请稍后重试"));
        }
        return Promise.reject(new Error("网络错误，请检查网络连接"));
      }

      // HTTP状态码错误处理
      const status = (error as AxiosError).response?.status;
      const commonErrors: Record<number, string> = {
        400: "请求参数错误",
        401: "未授权，请重新登录",
        403: "权限不足",
        404: "请求的资源不存在",
        408: "请求超时",
        500: "服务器内部错误",
        502: "网关错误",
        503: "服务暂不可用",
        504: "网关超时"
      };

      const message = commonErrors[status] || `请求失败（状态码：${status}）`;
      return Promise.reject(new Error(message));
    };

    // 优先使用自定义拦截器，否则使用默认拦截器
    this.responseInterceptorId = this.instance.interceptors.response.use(customInterceptor || defaultInterceptor, customErrorInterceptor || defaultErrorInterceptor);
  }

  /** 生成请求唯一标识 */
  private getRequestKey(config: AxiosRequestConfig): RequestKey | undefined {
    if (!config.url) return undefined;
    return `${config.method?.toUpperCase()}-${config.url}`;
  }

  /** 设置取消控制器 - 用于取消重复请求或主动取消请求 */
  private setupCancelController(config: AxiosRequestConfig, requestKey?: RequestKey): AxiosRequestConfig {
    const key = requestKey || this.getRequestKey(config);
    if (!key) return config;

    // 如果已有相同key的请求，先取消它
    this.cancelRequest(key);

    const controller = new AbortController();
    this.abortControllers.set(key, controller);

    return {
      ...config,
      signal: controller.signal
    };
  }

  /** 移除请求拦截器 */
  public removeRequestInterceptor(): void {
    if (this.requestInterceptorId !== undefined) {
      this.instance.interceptors.request.eject(this.requestInterceptorId);
      this.requestInterceptorId = undefined; // 重置ID，避免重复移除
    }
  }

  /** 移除响应拦截器 */
  public removeResponseInterceptor(): void {
    if (this.responseInterceptorId !== undefined) {
      this.instance.interceptors.response.eject(this.responseInterceptorId);
      this.responseInterceptorId = undefined; // 重置ID，避免重复移除
    }
  }

  /** 动态设置请求拦截器 */
  public setRequestInterceptor(customInterceptor?: InterceptorsConfig["requestInterceptor"], customErrorInterceptor?: InterceptorsConfig["requestErrorInterceptor"]): void {
    this.removeRequestInterceptor();
    this.initRequestInterceptor(customInterceptor, customErrorInterceptor);
  }

  /** 动态设置响应拦截器 */
  public setResponseInterceptor(customInterceptor?: InterceptorsConfig["responseInterceptor"], customErrorInterceptor?: InterceptorsConfig["responseErrorInterceptor"]): void {
    this.removeResponseInterceptor();
    this.initResponseInterceptor(customInterceptor, customErrorInterceptor);
  }

  /** 获取 Axios 实例 */
  public getInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * 取消某个请求
   * @param key 请求唯一标识
   * @param message 取消原因
   * @returns 是否成功取消
   */
  public cancelRequest(key: RequestKey, message?: string): boolean {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort(message || `取消请求: ${String(key)}`);
      this.abortControllers.delete(key);
      return true;
    }
    return false;
  }

  /**
   * 取消所有请求
   * @param message 取消原因
   */
  public cancelAllRequests(message?: string): void {
    this.abortControllers.forEach((controller, key) => {
      controller.abort(message || `取消所有请求: ${String(key)}`);
    });
    this.abortControllers.clear();
  }

  /**
   * 判断是否为取消错误
   * @param error 错误对象
   * @returns 是否为取消错误
   */
  public static isCancel(error: unknown): boolean {
    return Axios.isCancel(error);
  }

  /**
   * 睡眠函数
   * @param ms 毫秒数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 通用请求方法
   * @param method 请求方法
   * @param url 请求地址
   * @param config 请求配置
   * @returns 响应数据
   */
  public async request<T = any>(method: Method, url: string, config?: AxiosRequestConfig & { requestKey?: RequestKey; retry?: RetryConfig }): Promise<ResponseData<T>> {
    const { requestKey, retry, ...restConfig } = config || {};

    // 设置合理的默认重试条件
    const defaultRetryCondition = (error: AxiosError) => {
      // 默认只重试网络错误或5xx服务器错误
      return !error.response || (error.response.status >= 500 && error.response.status < 600);
    };

    const retryConfig = {
      retries: 0,
      retryDelay: 1000,
      retryCondition: defaultRetryCondition,
      ...retry
    };

    let lastError: any;
    const key = requestKey || this.getRequestKey({ ...restConfig, method, url });

    for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
      try {
        // 重试前清除旧的AbortController（避免重试请求被误取消）
        if (attempt > 0 && key) {
          this.abortControllers.delete(key);
        }

        const requestConfig = this.setupCancelController({ ...restConfig, method, url }, requestKey);

        /* 在这里写通用请求前的业务逻辑 */
        // 示例: 记录请求日志
        // console.log(`[${method.toUpperCase()}] ${url}:`, restConfig);

        const response = await this.instance.request<ResponseData<T>>(requestConfig);

        /* 在这里写通用请求后的业务逻辑 */
        // 示例: 记录响应日志
        // console.log(`[${method.toUpperCase()}] ${url} 响应:`, response.data);

        return response.data;
      } catch (error) {
        lastError = error;

        // 如果是最后一次尝试或不满足重试条件或请求被取消，直接抛出错误
        if (attempt === retryConfig.retries || !retryConfig.retryCondition(error as AxiosError) || HttpClient.isCancel(error)) {
          break;
        }

        // 延迟后重试
        if (retryConfig.retryDelay > 0) {
          await this.sleep(retryConfig.retryDelay);
        }
      }
    }

    /* 在这里写请求异常的通用处理逻辑 */
    // 示例: 统一错误提示
    // if (lastError instanceof Error) {
    //   console.error('请求失败:', lastError.message);
    // }

    return Promise.reject(lastError);
  }

  /**
   * GET 请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns 响应数据
   */
  public get<T = any>(url: string, config?: AxiosRequestConfig & { requestKey?: RequestKey; retry?: RetryConfig }): Promise<ResponseData<T>> {
    return this.request<T>("get", url, config);
  }

  /**
   * POST 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig & { requestKey?: RequestKey; retry?: RetryConfig }): Promise<ResponseData<T>> {
    return this.request<T>("post", url, { ...config, data });
  }

  /**
   * PUT 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig & { requestKey?: RequestKey; retry?: RetryConfig }): Promise<ResponseData<T>> {
    return this.request<T>("put", url, { ...config, data });
  }

  /**
   * DELETE 请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns 响应数据
   */
  public delete<T = any>(url: string, config?: AxiosRequestConfig & { requestKey?: RequestKey; retry?: RetryConfig }): Promise<ResponseData<T>> {
    return this.request<T>("delete", url, config);
  }

  /**
   * PATCH 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig & { requestKey?: RequestKey; retry?: RetryConfig }): Promise<ResponseData<T>> {
    return this.request<T>("patch", url, { ...config, data });
  }
}

// 默认导出实例 - 可直接使用
export const http = new HttpClient();

export default HttpClient;
```

## 🛠️ 使用指南 ##

### 基础请求操作：GET/POST 等常用方法 ###

任何 HTTP 客户端最核心的功能都是处理基础请求，HttpClient 对常用的 HTTP 方法进行了友好封装，同时提供了完整的 TypeScript 类型支持。

#### 定义我们需要用到的数据类型 ####

```typescript
// 用户信息接口
interface User {
  id: number;
  name: string;
  email: string;
}

// 分页响应通用接口
interface PageResponse<T> {
  list: T[];       // 数据列表
  total: number;   // 总条数
  page: number;    // 当前页码
  size: number;    // 每页条数
}
```

#### 基础请求操作示例 ####

```typescript
async function basicRequests() {
  try {
    // 1. GET 请求（带查询参数）
    const userPage = await http.get<PageResponse<User>>('/api/users', {
      params: { page: 1, size: 10 }
    });
    console.log(`第${userPage.page}页，共${userPage.total}个用户:`, userPage.list);

    // 2. POST 请求（提交数据）
    const newUser = await http.post<{ id: number }>('/api/users', {
      name: '张三',
      email: 'zhangsan@example.com'
    });
    console.log('新增用户ID:', newUser.id);

    // 3. PUT 请求（更新数据）
    const updatedUser = await http.put<User>('/api/users/1', {
      id: 1,
      name: '张三三',
      email: 'zhangsansan@example.com'
    });

    // 4. DELETE 请求
    const deleteRes = await http.delete<{ success: boolean; message?: string }>('/api/users/1');
    console.log('删除结果:', deleteRes.success);
  } catch (error) {
    // 统一错误处理
    console.error('请求失败:', error instanceof Error ? error.message : error);
  }
}
```

关键特性：

- 泛型参数直接指定响应数据类型，获得完整的类型提示
- 统一的错误处理机制，无需在每个请求中重复编写 try-catch
- 自动处理请求参数序列化和响应数据解析

### 多实例管理：为不同 API 服务创建专属客户端 ###

在复杂项目中，我们常常需要与多个 API 服务交互，每个服务可能有不同的基础路径、超时设置或认证方式。HttpClient 支持创建多个独立实例，完美解决这个问题。

```typescript
// 定义商品数据接口
interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
}

// 1. 创建用户服务专用实例
const userApi = new HttpClient({
  baseURL: 'https://api.example.com/user',  // 用户服务基础路径
  timeout: 10000                           // 超时设置为10秒
});

// 2. 创建商品服务专用实例（带特殊请求头）
const productApi = new HttpClient({
  baseURL: 'https://api.example.com/product',  // 商品服务基础路径
  headers: { 'X-Product-Token': 'special-token' }  // 商品服务需要的特殊头部
});

// 使用多实例处理不同服务的请求
async function useMultiInstances() {
  // 调用用户服务API
  const userPage = await userApi.get<PageResponse<User>>('/list');
  
  // 调用商品服务API
  const productPage = await productApi.get<PageResponse<Product>>('/list');
  
  // 两个实例的配置完全隔离，不会相互影响
}
```

适用场景：

- 前后端分离项目中对接多个微服务
typescript同时需要访问内部API和第三方API
typescript不同接口有不同的超时需求（如普通接口5秒，文件上传60秒）

### 自定义拦截器：业务逻辑与请求处理的解耦 ###

拦截器是处理请求/响应公共逻辑的最佳方式，HttpClient 允许在初始化时配置自定义拦截器，将认证、日志等横切关注点与业务逻辑分离。

最常见的场景是处理认证逻辑：

```typescript
// 创建带权限验证的HTTP客户端实例
const authHttp = new HttpClient(
  { baseURL: 'https://api.example.com/auth' },  // 基础配置
  {
    // 请求拦截器：添加认证Token
    requestInterceptor: (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    
    // 响应拦截器：处理认证失败
    responseInterceptor: (response) => {
      // 未授权，自动跳转到登录页
      if (response.code === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return response;
    }
  }
);
```

拦截器的典型用途：

- 添加全局认证信息（Token、API Key等）
- 统一处理错误码（如401未授权、403权限不足）
- 实现请求/响应日志记录
- 添加请求时间戳防止缓存

### 动态修改拦截器：运行时灵活调整请求行为 ###

有时候我们需要在运行时根据业务场景动态改变请求/响应处理逻辑，HttpClient 提供了动态修改拦截器的能力。

```typescript
// 定义日志数据接口
interface LogData {
  id: number;
  timestamp: string;
  content: string;
}

async function dynamicInterceptors() {
  // 场景1：临时添加日志拦截器
  const logInterceptor = (response: AxiosResponse<ResponseData<PageResponse<LogData>>>) => {
    console.log(`请求[${response.config.url}]返回${response.data.total}条日志`);
    return response;
  };

  // 设置新的响应拦截器
  http.setResponseInterceptor(logInterceptor);
  
  // 发送请求时会执行新的拦截器
  await http.get<PageResponse<LogData>>('/api/logs');

  // 场景2：完成日志收集后，恢复默认拦截器
  http.setResponseInterceptor();

  // 场景3：动态更新认证信息（如Token刷新后）
  const newToken = 'new-auth-token';
  http.setRequestInterceptor((config) => {
    config.headers.Authorization = `Bearer ${newToken}`;
    return config;
  });
}
```

实用场景：

- 临时开启调试日志
- Token过期后动态更新认证信息
- 特定页面需要特殊的请求头
- A/B测试时切换不同的API处理逻辑

### 请求取消：优化用户体验的关键技巧 ###

在用户快速操作或页面切换时，取消无用的请求可以显著提升性能和用户体验。HttpClient 提供了多种灵活的请求取消方式。

#### 主动取消单个请求 ####

```typescript
async function cancelSingleRequest() {
  const requestKey = 'user-list';  // 定义唯一标识

  try {
    // 发起请求时指定requestKey
    const promise = http.get<PageResponse<User>>('/api/users', { requestKey });

    // 模拟：200ms后取消请求（例如用户快速切换了页面）
    setTimeout(() => {
      http.cancelRequest(requestKey, '数据已过时');
    }, 200);

    const result = await promise;
  } catch (error) {
    // 判断是否为取消错误
    if (HttpClient.isCancel(error)) {
      console.log('请求已取消:', error.message);
    }
  }
}
```

#### 自动取消重复请求 ####

```typescript
async function cancelDuplicate() {
  // 连续发起相同参数的请求
  http.get<PageResponse<User>>('/api/users', { params: { page: 1 } }); // 被取消
  http.get<PageResponse<User>>('/api/users', { params: { page: 1 } }); // 被取消
  const latestData = await http.get<PageResponse<User>>('/api/users', { params: { page: 1 } }); // 最终生效
}
```

#### 页面卸载时取消所有请求 ####

```typescript
// 在React/Vue等框架的组件卸载钩子中调用
function onPageUnmount() {
  http.cancelAllRequests('页面已关闭');
}

// 或者监听页面关闭事件
window.addEventListener('beforeunload', () => {
  http.cancelAllRequests('用户离开页面');
});
```

带来的好处：

- 减少不必要的网络请求和服务器负载
- 避免过时数据覆盖最新数据
- 防止页面跳转后仍弹出错误提示
- 减少内存占用和潜在的内存泄漏

### 文件上传：大文件处理的最佳实践 ###

文件上传是前端开发中的常见需求，尤其需要注意超时设置和数据格式。HttpClient 可以轻松配置适合文件上传的参数。

```typescript
// 定义上传结果接口
interface UploadResult {
  url: string;      // 上传后的文件URL
  filename: string; // 文件名
  size: number;     // 文件大小
}

// 处理文件上传
async function uploadFile(file: File) {
  // 创建FormData对象
  const formData = new FormData();
  formData.append('file', file);
  
  // 可选：添加其他表单字段
  formData.append('category', 'document');
  formData.append('description', '用户上传的文档');

  // 创建上传专用实例（配置更长的超时）
  const uploadHttp = new HttpClient({
    timeout: 60000,  // 上传超时设为60秒
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  try {
    const result = await uploadHttp.post<UploadResult>('/api/upload', formData);
    console.log('文件上传成功，访问地址:', result.url);
    return result.url;
  } catch (error) {
    console.error('文件上传失败:', error);
    throw error;
  }
}
```

上传优化建议：

- 大文件上传使用专门的实例，设置较长超时
- 配合进度条展示上传进度（可通过 Axios 的 onUploadProgress 实现）
- 考虑分片上传大文件（超过100MB的文件）
- 重要文件上传可配置重试机制

### 并发请求处理：高效获取多源数据 ###

实际开发中经常需要同时请求多个接口，然后汇总处理数据。HttpClient 结合 Promise API 可以优雅地处理并发请求。

```typescript
// 使用Promise.all处理并发请求
async function handleConcurrentRequests() {
  try {
    // 同时发起多个请求
    const [userRes, productRes] = await Promise.all([
      http.get<User>('/api/users/1'),                // 获取用户详情
      http.get<PageResponse<Product>>('/api/products') // 获取商品列表
    ]);

    // 所有请求成功后处理数据
    console.log('用户详情:', userRes);
    console.log('商品列表:', productRes.list);
    
    // 可以在这里进行数据整合
    return {
      user: userRes,
      products: productRes.list
    };
  } catch (error) {
    // 任何一个请求失败都会进入这里
    console.error('并发请求失败:', error);
    throw error;
  }
}
```

并发处理技巧：

- 使用 `Promise.all` 处理相互依赖的并发请求（一失败全失败）
- 使用 `Promise.allSettled` 处理可以独立失败的请求
- 对大量并发请求进行分批处理，避免浏览器限制
- 结合请求取消机制，在某个关键请求失败时取消其他请求

### 请求重试：提升网络不稳定场景的可靠性 ###

网络波动是前端请求失败的常见原因，HttpClient 内置的重试机制可以自动处理这类问题，提升用户体验。

#### 基础重试配置（使用默认策略） ####

```typescript
// 使用默认重试条件
async function basicRetryWithDefaults() {
  try {
    const result = await http.get<User>('/api/users/1', {
      retry: {
        retries: 3,       // 最多重试3次
        retryDelay: 1000  // 每次重试间隔1秒
        // 默认策略：只重试网络错误或5xx服务器错误
      }
    });
    return result;
  } catch (error) {
    console.error('所有重试都失败了:', error);
    throw error;
  }
}
```

#### 自定义重试条件 ####

```typescript
// 自定义重试逻辑
async function customRetryCondition(userData: User) {
  try {
    const result = await http.post<User>('/api/users', userData, {
      retry: {
        retries: 2,       // 重试2次
        retryDelay: 500,  // 重试间隔500ms
        retryCondition: (error) => {
          // 自定义条件：网络错误、超时或5xx错误才重试
          return !error.response || 
                 error.response.status === 408 || 
                 (error.response.status >= 500 && error.response.status < 600);
        }
      }
    });
    return result;
  } catch (error) {
    console.error('重试失败:', error);
    throw error;
  }
}
```

重试策略建议：

- 读操作（GET）适合重试，写操作（POST/PUT）需谨慎
- 重试次数不宜过多（通常2-3次），避免加重服务器负担
- 使用指数退避策略（retryDelay 逐渐增加）
- 对明确的客户端错误（如400、401、403）不重试

### 访问原始 Axios 实例：兼容特殊需求 ###

虽然 HttpClient 封装了常用功能，但某些特殊场景可能需要直接使用 Axios 原生 API。HttpClient 提供了获取原始实例的方法。

```typescript
// 获取原始Axios实例
function getOriginalAxiosInstance() {
  const axiosInstance = http.getInstance();
  
  // 示例1：使用Axios的cancelToken（旧版取消方式）
  const CancelToken = Axios.CancelToken;
  const source = CancelToken.source();
  
  axiosInstance.get('/api/special', {
    cancelToken: source.token
  });
  
  // 取消请求
  source.cancel('Operation canceled by the user.');
  
  // 示例2：使用Axios的拦截器API
  const myInterceptor = axiosInstance.interceptors.response.use(
    response => response,
    error => Promise.reject(error)
  );
  
  // 移除拦截器
  axiosInstance.interceptors.response.eject(myInterceptor);
}
```

适用场景：

- 使用一些 HttpClient 未封装的 Axios 特性
- 集成依赖原始 Axios 实例的第三方库
- 处理极特殊的请求场景
- 平滑迁移现有基于 Axios 的代码

## 🤔 插曲：朋友的无情嘲笑 ##

在我们完成本次封装前，还有一个小插曲：我得意洋洋地把这个"史上最优雅"的封装发给朋友炫耀，心想着他肯定会夸我两句。结果他发来了一大段文字...

### 第一轮攻击：类型定义问题 ###

朋友: "你这代码有点问题啊 😏 你这个 `ResponseData` 类型扩展性不足："

```typescript
// 你的问题代码
export type ResponseData<T = any> = BaseResponse & T;

// 当 T 中包含 code 或 message 字段时会冲突
interface UserWithCode {
  code: string; // 与BaseResponse冲突
  name: string;
}
type TestType = ResponseData<UserWithCode>; // code字段变成never类型！
```

我: "不可能！绝对不可能！"

然后我测试了一下，果然报错了... 😅

解决方案：

```typescript
// 修复后的版本
type OmitBaseResponse<T> = Omit<T, keyof BaseResponse>;
export type ResponseData<T = any> = BaseResponse & OmitBaseResponse<T>;
```

### 第二轮攻击：请求取消逻辑缺陷 ###

朋友: "还有你这个 `setupCancelController` 未处理自定义 `requestKey` 冲突，当用户传入自定义 `requestKey` 时，若与内部生成的键重复，会导致取消逻辑混乱。"

我: "这... 这应该不会吧？"

朋友: "你看，你的代码是这样的：

```typescript
private setupCancelController(config: AxiosRequestConfig, requestKey?: RequestKey) {
  const key = requestKey || this.getRequestKey(config);
  // 直接取消，但没有冲突警告
  this.cancelRequest(key);
}
```

如果有重复key怎么办？建议加个警告。"

我: "但是我这里直接取消重复请求不是挺好的吗？这是防重复机制啊！"

朋友: "嗯...这个倒是有道理。那算了，这个问题不大。"

### 第三轮攻击：重试机制边界问题 ###

朋友: "但是你这个重试逻辑有问题！重试时未重置 `AbortController`："

```typescript
// 你的问题代码
for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
  // 每次都会调用setupCancelController，创建新的controller
  // 但旧的还在Map中，可能导致重试请求被误取消
  const requestConfig = this.setupCancelController({...restConfig, method, url}, requestKey);
}
```

我: "这... 这是边缘情况！"

朋友: "边缘情况也是情况啊！还有你的 retryCondition 默认值缺失，当用户未配置时，会默认重试所有错误（包括400等客户端错误），不符合预期。"

我: "好吧好吧，我改还不行吗... 😤"

解决方案：

```typescript
// 修复后的版本
const defaultRetryCondition = (error: AxiosError) => {
  // 默认只重试网络错误或5xx服务器错误
  return !error.response || (error.response.status >= 500 && error.response.status < 600);
};

for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
  // 重试前清除旧控制器
  if (attempt > 0 && key) {
    this.abortControllers.delete(key);
  }
  const requestConfig = this.setupCancelController({...restConfig, method, url}, requestKey);
}
```

### 第四轮攻击：拦截器管理问题 ###

朋友: "还有你的拦截器移除逻辑不严谨，只通过 `interceptorId` 移除，但未重置 `interceptorId`，可能导致后续重复移除无效："

```typescript
// 你的问题代码
public removeRequestInterceptor(): void {
  if (this.requestInterceptorId) {
    this.instance.interceptors.request.eject(this.requestInterceptorId);
    // 没有重置ID！
  }
}
```

我: "这... 好吧，确实应该重置一下。"

解决方案：

```typescript
// 修复后的版本
public removeRequestInterceptor(): void {
  if (this.requestInterceptorId !== undefined) {
    this.instance.interceptors.request.eject(this.requestInterceptorId);
    this.requestInterceptorId = undefined; // 重置ID
  }
}
```

### 第五轮攻击：其他细节问题 ###

朋友: "哈哈，别急。不过你还有几个问题：

- **`Content-Type` 硬编码问题** - 默认强制设置为 `application/json`，但上传文件时需要 `multipart/form-data`，需手动覆盖，不够灵活。
- **错误信息处理冗余** - 响应错误拦截器中对错误信息的包装会丢失原始错误的详细信息，不利于调试。
- **`requestKey` 类型声明不明确** - 定义为 `string | symbol`，但用户传入 `symbol` 时，调试信息显示不友好。"

我: "停停停！你这是在 code review 还是在找茬？！"

朋友: "当然是 code review 啦，不过后面这几个确实比较鸡蛋里挑骨头，前面几个确实需要修复。"

### 我的反击与分析 ###

经过一番"友好"的讨论（主要是我被教育），我冷静分析了一下：

#### 确实有价值的问题（必须修复） ####

- **✅ ResponseData 类型冲突** - 很重要！确实会导致 never 类型问题
- **✅ 重试机制的默认条件缺失** - 重要！应该有合理的默认重试条件
- **✅ 拦截器ID重置问题** - 中等重要，确实应该重置ID
- **✅ 重试时AbortController重置** - 中等重要，理论上存在问题

#### 过于苛刻或设计选择问题 ####

- **❌ requestKey冲突警告** - 当前设计已经通过取消旧请求处理了，警告是多余的
- **❌ Content-Type硬编码** - 这是常见的默认设置，Axios会自动覆盖FormData
- **❌ 错误信息包装** - 保留原始错误是好的，但当前设计也合理
- **❌ 拦截器组合模式** - 当前的覆盖模式是主流设计，组合模式会增加复杂性

#### 主观性问题 ####

- **🤔 requestKey类型限制** - `symbol` 支持是特性，不是缺陷

最终我不得不承认：*朋友的技术功底是不错的，提出了一些确实存在的边缘问题。但有些建议过于"完美主义"，可能会让代码变得过于复杂*。

修复了前4个重要问题后，朋友终于点头说："现在看起来像个正经的封装了！不过你得承认，好的代码不仅要能跑，还要经得起同行的审视。" 😂

## 🚀 写在最后 ##

经过这一上午的"激情"编码 + 朋友的"无情"嘲笑 + 我的"不服气"修复，这个 HTTP 客户端封装终于变得更加健壮了。

从最初的自我感觉良好，到被朋友无情打脸，再到最后的虚心修复，这个过程让我深刻体会到：

- **没有完美的代码** - 总有你想不到的边缘情况
- **Code Review 很重要** - 别人的视角能发现你的盲点
- **保持开放心态** - 被指出问题是好事，不是坏事
- **朋友很重要** - 能"嘲笑"你代码的朋友才是真朋友 😄

现在这个封装不仅解决了日常开发中的痛点，还具备了企业级项目的稳定性。

**核心优势**：

- **🎯 开箱即用** - 无需复杂配置，默认就很好用
- **🔧 高度可定制** - 支持各种业务场景的定制需求
- **🛡️ 类型安全** - TypeScript 完美支持，减少运行时错误
- **⚡ 性能出色** - 智能去重、重试、取消机制
- **📚 文档完善** - 详细的示例和注释

如果你也在为 HTTP 请求封装而苦恼，不妨试试这个方案。记住，好的代码是改出来的，不是写出来的！
