import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type Method,
  type AxiosError,
} from "axios";
import { stringify } from "qs";

// 基础配置
const defaultConfig: AxiosRequestConfig = {
  timeout: 6000,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer,
  },
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
  requestInterceptor?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig;
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
  constructor(
    customConfig?: AxiosRequestConfig,
    interceptors?: InterceptorsConfig
  ) {
    this.instance = Axios.create({ ...defaultConfig, ...customConfig });
    this.initInterceptors(interceptors);
  }

  /** 初始化拦截器 */
  private initInterceptors(interceptors?: InterceptorsConfig): void {
    this.initRequestInterceptor(
      interceptors?.requestInterceptor,
      interceptors?.requestErrorInterceptor
    );
    this.initResponseInterceptor(
      interceptors?.responseInterceptor,
      interceptors?.responseErrorInterceptor
    );
  }

  /** 初始化请求拦截器 */
  private initRequestInterceptor(
    customInterceptor?: InterceptorsConfig["requestInterceptor"],
    customErrorInterceptor?: InterceptorsConfig["requestErrorInterceptor"]
  ): void {
    // 默认请求拦截器
    const defaultInterceptor = (
      config: InternalAxiosRequestConfig
    ): InternalAxiosRequestConfig => {
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
    this.requestInterceptorId = this.instance.interceptors.request.use(
      customInterceptor || defaultInterceptor,
      customErrorInterceptor || defaultErrorInterceptor
    );
  }

  /** 初始化响应拦截器 */
  private initResponseInterceptor(
    customInterceptor?: InterceptorsConfig["responseInterceptor"],
    customErrorInterceptor?: InterceptorsConfig["responseErrorInterceptor"]
  ): void {
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
        if (
          (error as any).code === "ECONNABORTED" ||
          (error as AxiosError).message?.includes("timeout")
        ) {
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
        504: "网关超时",
      };

      const message = commonErrors[status!] || `请求失败（状态码：${status}）`;
      return Promise.reject(new Error(message));
    };

    // 优先使用自定义拦截器，否则使用默认拦截器
    this.responseInterceptorId = this.instance.interceptors.response.use(
      customInterceptor || defaultInterceptor,
      customErrorInterceptor || defaultErrorInterceptor
    );
  }

  /** 生成请求唯一标识 */
  private getRequestKey(config: AxiosRequestConfig): RequestKey | undefined {
    if (!config.url) return undefined;
    return `${config.method?.toUpperCase()}-${config.url}`;
  }

  /** 设置取消控制器 - 用于取消重复请求或主动取消请求 */
  private setupCancelController(
    config: AxiosRequestConfig,
    requestKey?: RequestKey
  ): AxiosRequestConfig {
    const key = requestKey || this.getRequestKey(config);
    if (!key) return config;

    // 如果已有相同key的请求，先取消它
    this.cancelRequest(key);

    const controller = new AbortController();
    this.abortControllers.set(key, controller);

    return {
      ...config,
      signal: controller.signal,
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
  public setRequestInterceptor(
    customInterceptor?: InterceptorsConfig["requestInterceptor"],
    customErrorInterceptor?: InterceptorsConfig["requestErrorInterceptor"]
  ): void {
    this.removeRequestInterceptor();
    this.initRequestInterceptor(customInterceptor, customErrorInterceptor);
  }

  /** 动态设置响应拦截器 */
  public setResponseInterceptor(
    customInterceptor?: InterceptorsConfig["responseInterceptor"],
    customErrorInterceptor?: InterceptorsConfig["responseErrorInterceptor"]
  ): void {
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
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 通用请求方法
   * @param method 请求方法
   * @param url 请求地址
   * @param config 请求配置
   * @returns 响应数据
   */
  public async request<T = any>(
    method: Method,
    url: string,
    config?: AxiosRequestConfig & {
      requestKey?: RequestKey;
      retry?: RetryConfig;
    }
  ): Promise<ResponseData<T>> {
    const { requestKey, retry, ...restConfig } = config || {};

    // 设置合理的默认重试条件
    const defaultRetryCondition = (error: AxiosError) => {
      // 默认只重试网络错误或5xx服务器错误
      return (
        !error.response ||
        (error.response.status >= 500 && error.response.status < 600)
      );
    };

    const retryConfig = {
      retries: 0,
      retryDelay: 1000,
      retryCondition: defaultRetryCondition,
      ...retry,
    };

    let lastError: any;
    const key =
      requestKey || this.getRequestKey({ ...restConfig, method, url });

    for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
      try {
        // 重试前清除旧的AbortController（避免重试请求被误取消）
        if (attempt > 0 && key) {
          this.abortControllers.delete(key);
        }

        const requestConfig = this.setupCancelController(
          { ...restConfig, method, url },
          requestKey
        );

        /* 在这里写通用请求前的业务逻辑 */
        // 示例: 记录请求日志
        // console.log(`[${method.toUpperCase()}] ${url}:`, restConfig);

        const response = await this.instance.request<ResponseData<T>>(
          requestConfig
        );

        /* 在这里写通用请求后的业务逻辑 */
        // 示例: 记录响应日志
        // console.log(`[${method.toUpperCase()}] ${url} 响应:`, response.data);

        return response.data;
      } catch (error) {
        lastError = error;

        // 如果是最后一次尝试或不满足重试条件或请求被取消，直接抛出错误
        if (
          attempt === retryConfig.retries ||
          !retryConfig.retryCondition(error as AxiosError) ||
          HttpClient.isCancel(error)
        ) {
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
  public get<T = any>(
    url: string,
    config?: AxiosRequestConfig & {
      requestKey?: RequestKey;
      retry?: RetryConfig;
    }
  ): Promise<ResponseData<T>> {
    return this.request<T>("get", url, config);
  }

  /**
   * POST 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & {
      requestKey?: RequestKey;
      retry?: RetryConfig;
    }
  ): Promise<ResponseData<T>> {
    return this.request<T>("post", url, { ...config, data });
  }

  /**
   * PUT 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & {
      requestKey?: RequestKey;
      retry?: RetryConfig;
    }
  ): Promise<ResponseData<T>> {
    return this.request<T>("put", url, { ...config, data });
  }

  /**
   * DELETE 请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns 响应数据
   */
  public delete<T = any>(
    url: string,
    config?: AxiosRequestConfig & {
      requestKey?: RequestKey;
      retry?: RetryConfig;
    }
  ): Promise<ResponseData<T>> {
    return this.request<T>("delete", url, config);
  }

  /**
   * PATCH 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  public patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & {
      requestKey?: RequestKey;
      retry?: RetryConfig;
    }
  ): Promise<ResponseData<T>> {
    return this.request<T>("patch", url, { ...config, data });
  }
}

// 默认导出实例 - 可直接使用
export const http = new HttpClient();

export default HttpClient;
