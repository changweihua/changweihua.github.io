// // xfetch.ts
// import axios from 'axios';

// const service = axios.create({
//   baseURL: "/api",
//   // validateStatus: (status) => status <= 500, // 拦截状态码大于或等于500
//   headers: {
//     common: { Accept: "application/json; charset=UTF-8" },
//     patch: { "Content-Type": "application/json; charset=UTF-8" },
//     post: { "Content-Type": "application/json; charset=UTF-8" },
//     put: { "Content-Type": "application/json; charset=UTF-8" },
//   },
//   transformRequest: (data) => JSON.stringify(data),
//   timeout: 30000, // 请求超时时间
//   duplicateEnabled: false, // 是否开启重复请求拦截
// });
// const pending = {}
// const CancelToken = axios.CancelToken

// const paramsList = ['get', 'delete', 'patch']
// const dataList = ['post', 'put']
// const isTypeList = (method: string) => {
//   if (paramsList.includes(method)) {
//     return 'params'
//   } else if (dataList.includes(method)) {
//     return 'data'
//   }
// }

// /**
//  * 获取请求的key
//  * @param {object} config
//  * @param {boolean} isSplice - 是否拼接请求头，请求前需要拼接，请求后不需要拼接
//  * @returns
//  */
// const getRequestIdentify = (config, isSplice = false) => {
//   let url = config.url
//   if (isSplice) {
//     url = config.baseURL + config.url
//   }
//   const params = { ...(config[isTypeList(config.method!)] || {}) }
//   // t 是随机数，不参与计算唯一值
//   delete params.t
//   return encodeURIComponent(url + JSON.stringify(params))
// }

// /**
//  * 取消重复
//  * @param {string} key - 请求唯一url
//  * @param {boolean} isRequest - 是否执行取消请求
//  */
// const removePending = (key, isRequest = false) => {
//   if (pending[key] && isRequest) {
//     pending[key].cancel('取消重复请求')
//   }
//   delete pending[key]
// }


// service.interceptors.request.use((config) => {
//   const requestId = getRequestIdentify(config, true)
//   config.requestId = requestId

//   // 根据配置是否移除重复请求
//   config.isRepeatRequest && removePending(requestId, true)

//   if (!config.cancelToken) {
//     const source = CancelToken.source()
//     source.token.cancel = source.cancel
//     config.cancelToken = source.token
//   }
//   // 缓存该请求的取消重复的方法
//   pending[requestId] = config.cancelToken



//   return config
// })

// service.interceptors.response.use((response) => {
//   // 请求完成，移除缓存
//   response.config.isRepeatRequest && removePending(response.config.requestId, false)

//   return response.data
// }, (error) => {
//   if (axios.isCancel(error)) return Promise.reject(error)

//   // 请求完成，移除缓存
//   error.config?.isRepeatRequest && removePending(response.config.requestId, false)

//   return Promise.reject(error)
// })

// /**
//  * get请求方法
//  * @export axios
//  * @param {string} url - 请求地址
//  * @param {object} params - 请求参数
//  * @param {object|undefined|Null} 其他参数
//  * @returns
//  */
// export const GET = (url, params, other) => {
//   params = params || {}
//   params.t = Date.now()
//   return service({
//     url: url,
//     method: 'GET',
//     params,
//     ...(other || {})
//   })
// }
