import axios from "axios";

declare module "axios" {
  interface CreateAxiosDefaults {
    duplicateEnabled: boolean;
  }


    interface InternalAxiosRequestConfig {
      requestId?: string;
      duplicateEnabled?: boolean
    }


  // interface AxiosRequestConfig {
  //   "axios-retry"?: IAxiosRetryConfigExtended;
  // }

  // interface AxiosRequestConfig {
  //   jsonp?: JsonpConfig// 支持jsonp的配置
  //   requestKey?: number | string | symbol//请求唯一key，用于获取被捕获的错误信息
  //   ignoreCancelToken?: boolean// 支持取消清除重复请求
  // }

  // interface IAxios<D = null> {
  //   code: string;
  //   message: string;
  //   extra: D;
  // }

  // export interface AxiosResponse<T = any> extends IAxios<D> {}
}
