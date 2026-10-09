// // fetchSuper.ts
// const isTypeList = (method) => {
//   method = (method || '').toLowerCase()
//   if (paramsList.includes(method)) {
//     return 'params'
//   } else if (dataList.includes(method)) {
//     return 'data'
//   }
// }
// // 用来判断取消请求的标识
// const REPEAT_REQUEST_TEXT = 'repeatRequest'

// /**
//  * 包装实际请求动作
//  * @param {Axios.config} config - 最终合并后的参数
//  * @param {string} requestId - 请求的唯一值
//  * @param {Promise.resolve} resolve
//  * @param {Promise.reject} reject
//  */
// const defaultAdapterRequest = (config, requestId, resolve, reject) => {
//   service(config)
//     .then((response) => {
//       // 请求成功时，删除缓存，并返回到最上层
//       delete pending[requestId]
//       resolve && resolve(response)
//     })
//     .catch((error) => {
//       if (!(axios.isCancel(error) && error.message === REPEAT_REQUEST_TEXT)) {
//         delete pending[requestId]
//         reject && reject(error)
//       }
//     })
// }

// /**
//  * 包装实际请求动作
//  * @param {Axios.config} config - 最终合并后的参数
//  * @param {string} requestId - 请求的唯一值
//  * @param {Promise.resolve} resolve
//  * @param {Promise.reject} reject
//  */
// const defaultAdapterRequest = (config, requestId, resolve, reject) => {
//   service(config)
//     .then((response) => {
//       // 请求成功时，删除缓存，并返回到最上层
//       delete pending[requestId]
//       resolve && resolve(response)
//     })
//     .catch((error) => {
//       if (!(axios.isCancel(error) && error.message === REPEAT_REQUEST_TEXT)) {
//         delete pending[requestId]
//         reject && reject(error)
//       }
//     })
// }

// /**
//  * 包装请求方法
//  * @param {Axios.config} config
//  * @returns
//  */
// const packService = (config) => {
//   // 这里为什么不用 webpack.merge 进行深度合并，是因为太消耗性能且一般用不上，普通合并即可
//   const mergeConfig = Object.assign({}, service.defaults, config)
//   const requestId = getRequestIdentify(mergeConfig)
//   mergeConfig.requestId = requestId
//   if (!mergeConfig.cancelToken) {
//     const source = CancelToken.source()
//     source.token.cancel = source.cancel
//     mergeConfig.cancelToken = source.token
//   }

//   // 上传文件或者主动不要重复，则直接请求
//   if (
//     !mergeConfig.isRepeatRequest ||
//     mergeConfig.headers?.['Content-Type'] === 'multipart/form-data;charset=UTF-8'
//   ) {
//     return service(mergeConfig)
//   }

//   // 关键就在这里，如果第一次进来
//   if (!pending[requestId]) {
//     pending[requestId] = {}
//     // 包装多一层Promise，并往缓存存入 cancelToken、resolve、reject、promiseFn
//     const promiseFn = new Promise((resolve, reject) => {
//       pending[requestId] = {
//         cancelToken: mergeConfig.cancelToken,
//         resolve,
//         reject
//       }
//       defaultAdapterRequest(mergeConfig, requestId, resolve, reject)
//     })
//     pending[requestId].promiseFn = promiseFn
//     return promiseFn
//   }

//   // 非第一次进来，则直接取消上一次的请求，并且替换缓存的cancelToken为当前的，否则下一次进来不能正确取消一次的请求
//   const { cancelToken, resolve, reject, promiseFn } = pending[requestId]
//   cancelToken.cancel(REPEAT_REQUEST_TEXT)
//   pending[requestId].cancelToken = mergeConfig.cancelToken
//   defaultAdapterRequest(mergeConfig, requestId, resolve, reject)
//   return promiseFn
// }

// // 最后暴露出去的方法，则改为用packService进行包装

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
//   return packService({
//     url: url,
//     method: 'GET',
//     params,
//     ...(other || {})
//   })
// }

// /**
//  * post请求方法
//  * @export axios
//  * @param {string} url - 请求地址
//  * @param {object} data - 请求参数
//  * @param {object|undefined|Null} 其他参数
//  * @returns
//  */
// export const POST = (url, data = {}, other) => {
//   return packService({
//     url,
//     method: 'POST',
//     params: { t: Date.now() },
//     data,
//     ...(other || {})
//   })
// }
