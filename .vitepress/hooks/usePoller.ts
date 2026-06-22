import { onScopeDispose, ref } from 'vue'

/**
 * 请求函数类型定义
 * @template T 响应数据类型
 * @template P 请求参数类型
 */
export type RequestFunction<T, P> = (params?: P) => Promise<T>

/**
 * 回调函数类型定义，用于处理成功的响应
 * @template T 响应数据类型
 */
type CallbackFunction<T> = (response: T) => void

/**
 * 错误回调函数类型定义
 * 返回 true 表示继续重试，false 表示停止轮询
 */
type ErrorCallbackFunction = (error: any) => boolean | Promise<boolean>

/**
 * 停止回调函数类型定义
 * @param reason 停止原因：'error'(错误)、'manual'(手动)、'max_retries'(达到最大重试次数)、'component_unmounted'(组件卸载)
 * @param error 当停止原因为错误时，提供错误对象
 */
type StopCallbackFunction = (reason: 'error' | 'manual' | 'max_retries' | 'component_unmounted', error?: any) => void

/**
 * usePoller - 一个用于处理轮询请求的Vue组合式函数
 *
 * 功能：
 * - 定时发送请求并处理响应
 * - 支持错误重试机制，包括指数退避策略
 * - 支持自定义错误处理
 * - 提供轮询状态监控
 * - 组件卸载时自动清理
 *
 * @template T 响应数据类型
 * @template P 请求参数类型，默认为void
 *
 * @returns {Object} 包含poll和stop方法以及isPolling状态的对象
 *
 * @example
 * // 基本使用
 * const { poll, stop } = usePoller<ApiResponse, ApiParams>()
 *
 * poll(
 *   fetchData,           // 请求函数
 *   5000,                // 轮询间隔(毫秒)
 *   handleResponse,      // 响应处理回调
 *   { id: '12345' },     // 请求参数
 *   {
 *     immediate: true,   // 是否立即执行第一次请求
 *     maxRetries: 3,     // 最大重试次数
 *     onError: (error) => {
 *       // 根据错误类型决定是否继续重试
 *       return error.status === 503 // 只有服务暂时不可用时才重试
 *     },
 *     onStop: (reason, error) => {
 *       // 处理轮询停止事件
 *       console.log(`轮询已停止，原因: ${reason}`, error)
 *     }
 *   }
 * )
 *
 * // 手动停止轮询
 * stop()
 */
export function usePoller<T, P = void>() {
  const interval = ref<number>(1000)
  const timer = ref<ReturnType<typeof setInterval> | null>(null)
  const callback = ref<CallbackFunction<T> | null>(null)
  const errorCallback = ref<ErrorCallbackFunction | null>(null)
  const stopCallback = ref<StopCallbackFunction | null>(null)
  const request = ref<RequestFunction<T, P> | null>(null)
  const doImmediate = ref<boolean>(false)
  const maxRetries = ref<number>(3)
  const isPolling = ref<boolean>(false) // 轮询状态标志
  let retryCount = 0
  let requestParams: P | undefined
  let lastError: any = null

  /**
   * 停止轮询
   * @param reason 停止原因
   */
  const stopPolling = (reason: 'error' | 'manual' | 'max_retries' | 'component_unmounted' = 'manual'): void => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }

    const wasPolling = isPolling.value
    isPolling.value = false // 设置轮询状态为停止
    retryCount = 0

    // 只有在之前正在轮询的情况下才触发回调
    if (wasPolling && stopCallback.value) {
      stopCallback.value(reason, reason === 'error' ? lastError : undefined)
    }
  }

  /**
   * 重试函数，处理请求失败的情况
   * @param error 错误对象
   * @returns 是否继续轮询
   */
  const retry = async (error: any): Promise<boolean> => {
    // 保存最后一次错误
    lastError = error

    // 检查轮询是否已停止
    if (!isPolling.value) {
      return false
    }

    // 如果有错误回调，让用户决定是否继续重试
    if (errorCallback.value) {
      const shouldRetry = await errorCallback.value(error)
      if (!shouldRetry) {
        return false // 不再重试，外部会处理停止轮询
      }
    }

    if (retryCount < maxRetries.value) {
      retryCount++
      // 改进的指数退避策略: 2^retryCount * 500ms 并添加随机抖动
      const backoffTime = Math.min(1000 * Math.pow(2, retryCount - 1) + Math.random() * 1000, 30000)
      await new Promise(resolve => setTimeout(resolve, backoffTime))

      // 再次检查轮询是否已停止（可能在等待期间被停止）
      if (!isPolling.value) {
        return false
      }

      if (request.value && callback.value) {
        try {
          const response = await request.value(requestParams)
          callback.value(response)
          return true
        } catch (error) {
          console.error('Error during retry:', error)
          return retry(error)
        }
      }
    } else {
      console.error('Max retry attempts reached')
      // 达到最大重试次数，通知外部
      stopPolling('max_retries')
      // 如果没有错误回调，则在达到最大重试次数后抛出错误
      if (!errorCallback.value) {
        throw error
      }
      return false // 达到最大重试次数，外部会处理停止轮询
    }
    return false
  }

  /**
   * 启动轮询
   */
  const start = async (): Promise<void> => {
    stopPolling() // 先停止之前的轮询
    isPolling.value = true // 设置轮询状态为启动
    lastError = null // 重置错误

    // 如果设置了立即执行，则立即发送第一次请求
    if (doImmediate.value && request.value && callback.value) {
      try {
        // 检查轮询是否已停止
        if (!isPolling.value) {
          return
        }

        const response = await request.value(requestParams)
        callback.value(response)
      } catch (error) {
        console.error(error)
        const shouldContinue = await retry(error)
        if (!shouldContinue) {
          stopPolling('error') // 如果不应继续重试，停止轮询
          return // 直接返回，不启动定时器
        }
      }
      doImmediate.value = false
    }

    // 再次检查轮询是否已停止（可能在immediate执行期间被停止）
    if (!isPolling.value) {
      return
    }

    // 设置定时器，开始轮询
    timer.value = setInterval(async () => {
      // 检查轮询是否已停止
      if (!isPolling.value) {
        stopPolling() // 确保定时器被清除
        return
      }

      if (request.value && callback.value) {
        try {
          const response = await request.value(requestParams)
          callback.value(response)
          // 成功后重置重试计数
          retryCount = 0
        } catch (error) {
          console.error(error)
          const shouldContinue = await retry(error)
          // 如果 retry 返回 false，表示不应继续重试，此时需要停止轮询
          if (!shouldContinue) {
            stopPolling('error')
          }
        }
      }
    }, interval.value)
  }

  /**
   * 开始轮询
   * @param req 请求函数
   * @param delay 轮询间隔(毫秒)
   * @param cb 响应处理回调
   * @param params 请求参数
   * @param options 配置选项
   * @param options.immediate 是否立即执行第一次请求
   * @param options.maxRetries 最大重试次数
   * @param options.onError 错误处理回调
   * @param options.onStop 停止轮询回调
   */
  const poll = (
    req: RequestFunction<T, P>,
    delay: number,
    cb: CallbackFunction<T>,
    params?: P,
    options: {
      immediate?: boolean
      maxRetries?: number
      onError?: ErrorCallbackFunction
      onStop?: StopCallbackFunction
    } = {},
  ): void => {
    const { immediate = false, onError, onStop, maxRetries: retries } = options

    request.value = req
    interval.value = delay
    callback.value = cb
    doImmediate.value = immediate
    requestParams = params

    if (retries !== undefined) {
      maxRetries.value = retries
    }

    if (onError) {
      errorCallback.value = onError
    }

    if (onStop) {
      stopCallback.value = onStop
    }

    start()
  }

  /**
   * 手动停止轮询
   */
  const stop = (): void => {
    stopPolling('manual')
  }

  // 组件卸载时自动清理
  onScopeDispose(() => {
    stopPolling('component_unmounted')
  })

  return {
    poll,
    stop,
    isPolling, // 暴露轮询状态，方便外部检查
  }
}

export default usePoller

