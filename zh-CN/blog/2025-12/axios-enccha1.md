---
lastUpdated: true
commentabled: true
recommended: true
title: 全局重复接口取消&重复提示
description: 全局重复接口取消&重复提示
date: 2025-12-30 10:15:00 
pageClass: blog-page-class
cover: /covers/typescript.svg
---

## 重复接口取消 ##

### 思路 ###

我们创建了一个 `pendingMap` 对象，它用于存储每个请求的标识（请求路径、请求方式、请求参数3个维度唯一标识）和取消函数。当请求被发出时，我们将其添加到 `pendingMap` 中。再次调用 `pendingMap` 存在此请求，则取消请求，另外再此接口返回时，同样取消请求。

### 实现 ###

1、创建 `AxiosCanceler` 类，定义了 `addPending`、`removeAllPending` 和 `removePending` 三个方法。`addPending` 方法用于将请求添加到 `pendingMap` 中。`removeAllPending` 方法可以用于取消所有请求，而 `removePending` 方法可以用于取消单个请求。

```ts
import type { AxiosRequestConfig } from 'axios'
import { generateRequestCode } from './index'

// 用于存储每个请求的标识和取消函数
const pendingMap = new Map<string, AbortController>()

export class AxiosCanceler {
  /**
   * 添加请求
   * @param config 请求配置
   */
  public addPending(config: AxiosRequestConfig): void {
    // 立刻移除重复请求
    this.removePending(config)
    // 请求唯一标识code
    const requestCode = generateRequestCode(config)
    // 取消请求对象
    const controller = new AbortController()
    config.signal = controller.signal
    if (!pendingMap.has(requestCode)) {
      // 如果当前请求不在等待中，将其添加到等待中
      pendingMap.set(requestCode, controller)
    }
  }

  /**
   * 清除所有等待中的请求
   */
  public removeAllPending(): void {
    pendingMap.forEach((abortController) => {
      if (abortController) {
        abortController.abort()
      }
    })
    this.reset()
  }

  /**
   * 移除请求
   * @param config 请求配置
   */
  public removePending(config: AxiosRequestConfig): void {
    const requestCode = generateRequestCode(config)
    if (pendingMap.has(requestCode)) {
      // 如果当前请求在等待中，取消它并将其从等待中移除
      const abortController = pendingMap.get(requestCode)
      if (abortController) {
        abortController.abort(requestCode)
      }
      pendingMap.delete(requestCode)
    }
  }

  /**
   * 重置
   */
  public reset(): void {
    pendingMap.clear()
  }
}
```

2、创建获取唯一标识请求 `code` 的方法 `generateRequestCode`，通过 `url`、`method`、`data`、`params` 来唯一标识

```typescript
import type { AxiosRequestConfig } from 'axios'

/**
 * 标准化参数对象
 * @param {Record<string, any> | null | undefined} params - 需要标准化的参数
 * @returns {Record<string, any>} - 标准化后的参数对象
 */
function normalizeParams(params?: Record<string, any> | null | undefined): Record<string, any> {
  // 处理undefined和未传参的情况
  if (arguments.length === 0 || params === undefined) {
    return {}
  }

  // 处理null和其他空值情况
  if (params === null) {
    return {}
  }

  // 如果是字符串，尝试解析为JSON对象
  if (typeof params === 'string') {
    try {
      const parsed = JSON.parse(params)
      if (typeof parsed === 'object' && parsed !== null) {
        return sortObjectDeep(parsed)
      }
    } catch (e) {
      // 解析失败，返回空对象
    }
    return {}
  }

  // 如果不是对象类型，返回空对象
  if (typeof params !== 'object') {
    return {}
  }

  // 如果是数组，返回空对象
  if (Array.isArray(params)) {
    return {}
  }

  // 检查是否为空对象
  if (Object.keys(params).length === 0) {
    return {}
  }

  // 对非空对象进行深度排序
  return sortObjectDeep(params)
}

/**
 * 深度排序对象
 * @template T - 输入对象类型
 * @param {T} obj - 需要排序的对象
 * @returns {T} - 排序后的对象
 */
function sortObjectDeep<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectDeep).sort() as T
  }

  return Object.keys(obj as Record<string, any>)
    .sort()
    .reduce((result: Record<string, any>, key: string) => {
      result[key] = sortObjectDeep((obj as Record<string, any>)[key])
      return result
    }, {}) as T
}

/**
 * 生成请求唯一编码
 * @param {AxiosRequestConfig} config - Axios请求配置
 * @returns {string} - 唯一编码
 */
export function generateRequestCode(
  config: AxiosRequestConfig,
): string {
  // 确保config存在
  if (!config) {
    throw new Error('请求配置为必填参数')
  }

  // 确保url和method存在
  if (!config.url || !config.method) {
    throw new Error('URL和method为必填参数')
  }

  // 处理params的特殊情况
  const normalizedParams = normalizeParams(config.params)

  const normalizedData = normalizeParams(config.data)
  // 拼接字符串
  const stringToHash = `${config.url.toLowerCase()}|${config.method.toUpperCase()}|${JSON.stringify(normalizedParams)}|${JSON.stringify(normalizedData)}`
  
  return stringToHash
}
```

3、修改请求拦截器

```javascript
instance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    ... 
    axiosCanceler.addPending(config)
    return config
  },
  (error) => {
    return Promise.reject(error.data.error.message)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  function(response) {
    ....
    // 移除请求
    axiosCanceler.removePending(response.config)
    return Promise.resolve(response)
  },
  function(error) {
    // 请求被取消时，返回错误提示
    if (isCancel(error)) {
      return Promise.reject('重复请求，已取消')
    }
    // 移除请求
    const { response } = error
    if (response && response.config) {
      axiosCanceler.removePending(response.config)
    } else if (error.config) {
      // 处理请求被取消的情况
      axiosCanceler.removePending(error.config)
    }
    if (response) {
      return Promise.reject(response)
    } else {
      /*
       * 处理断网的情况
       * eg:请求超时或断网时，更新state的network状态
       * network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
       * 后续增加断网情况下做的一些操作
       */
      // 断网情况下，清除所有请求
      axiosCanceler.removeAllPending()
    }
  },
)
// 只需要考虑单一职责，这块只封装axios
export default instance
```

## 重复提示 ##

这里是通过直接二次封装 `Element UI` 的消息提示方法，我这里采用的是 vue3，统一入口方式去做的，如果是vue2，可以在main.js将$message挂载到this之前做一下重写

### 代码 ###

```typescript
import { ElMessage, MessageHandler } from 'element-plus'

// 防止重复弹窗
let messageInstance: MessageHandler | null = null

interface MessageOptions {
  message: string
  type?: 'success' | 'warning' | 'info' | 'error'
  [key: string]: any
}

const mainMessage = (options: MessageOptions | string): MessageHandler => {
  // 如果弹窗已存在先关闭
  if (messageInstance) {
    messageInstance.close()
  }

  const messageOptions = typeof options === 'string'
    ? { message: options }
    : options

  messageInstance = ElMessage(messageOptions)
  return messageInstance
}


const extendedMainMessage: any = mainMessage

const arr: Array<'success' | 'warning' | 'info' | 'error'> = ['success', 'warning', 'info', 'error']
arr.forEach((type) => {
  extendedMainMessage[type] = (options: MessageOptions | string) => {
    const messageOptions = typeof options === 'string'
      ? { message: options }
      : { ...options }

    messageOptions.type = type
    return mainMessage(messageOptions)
  }
})

// message消息提示
export const $success = (msg: string) => {
  mainMessage({
    message: msg || '操作成功',
    type: 'success',
  })
}
export const $warning = (msg: string) => {
  mainMessage({
    message: msg || '操作失败',
    type: 'warning',
  })
}
export const $error = (msg: string) => {
  mainMessage({
    message: msg || '操作失败',
    type: 'error',
  })
}

export const $info = (msg: string) => {
  mainMessage({
    message: msg,
    type: 'info',
  })
}
```

### 使用 ###

此时连续调用始终只会有一个消息体出现（ `success`、`error`、`warning`、`info` 均共用同一个消息体）

```ts
import { $error, $success } from '@/hooks/index'

$error('错误提示1')
$error('错误提示2')
```
