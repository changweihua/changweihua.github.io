import { ref, onUnmounted } from 'vue'

export function useSmartPoller() {
  const isPolling = ref(false)
  const timer = ref(0)
  const retryCount = ref(0)
  const maxRetries = ref(3)

  // 计算退避时间（核心算法）
  const calculateBackoff = () => {
    const baseDelay = 1000 // 基础延迟1秒
    const maxDelay = 30000 // 最大延迟30秒
    const jitter = Math.random() * 1000 // 随机抖动，防止同步请求

    // 指数退避公式：基础延迟 * 2^重试次数 + 随机抖动
    return Math.min(
      baseDelay * Math.pow(2, retryCount.value) + jitter,
      maxDelay
    )
  }

  // 停止轮询
  const stop = (reason = 'manual') => {
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = 0
    }
    isPolling.value = false
    retryCount.value = 0

    return { reason }
  }

  // 开始轮询
  const start = (options) => {
    const {
      requestFn, // 请求函数
      interval = 5000, // 默认间隔
      onSuccess, // 成功回调
      onError, // 错误回调
      onStop, // 停止回调
      immediate = true, // 是否立即执行
      retries = 3, // 最大重试次数
      params // 请求参数
    } = options

    // 停止之前的轮询
    stop()

    // 更新配置
    maxRetries.value = retries
    isPolling.value = true

    // 轮询执行函数
    const execute = async () => {
      if (!isPolling.value) return

      try {
        // 执行请求
        const result = await requestFn(params)

        // 成功后重置重试计数
        retryCount.value = 0

        // 调用成功回调
        if (onSuccess) onSuccess(result)

        // 设置下一次轮询
        if (isPolling.value) {
          timer.value = window.setTimeout(execute, interval)
        }
      } catch (error) {
        // 错误处理
        const shouldRetry = onError ? await onError(error) : true

        if (shouldRetry && retryCount.value < maxRetries.value) {
          // 增加重试计数
          retryCount.value++

          // 使用指数退避策略设置下一次重试
          const backoffTime = calculateBackoff()
          console.log(`轮询失败，${backoffTime/1000}秒后重试(${retryCount.value}/${maxRetries.value})`)

          timer.value = window.setTimeout(execute, backoffTime)
        } else {
          // 达到最大重试次数或用户决定不再重试
          const stopResult = stop('error')
          if (onStop) onStop(stopResult.reason, error)
        }
      }
    }

    // 是否立即执行
    if (immediate) {
      execute()
    } else {
      timer.value = window.setTimeout(execute, interval)
    }

    return { stop }
  }

  // 组件卸载时自动清理
  onUnmounted(() => stop('unmounted'))

  return {
    start,
    stop,
    isPolling
  }
}


// <script setup>
// import { ref } from 'vue'
// import { useSmartPoller } from './useSmartPoller'

// const dashboardData = ref({})
// const { start, stop, isPolling } = useSmartPoller()

// // 开始轮询获取仪表盘数据
// start({
//   requestFn: () => fetch('/api/dashboard').then(r => r.json()),
//   interval: 10000, // 10秒更新一次
//   onSuccess: (data) => {
//     dashboardData.value = data
//   },
//   onError: (error) => {
//     console.error('获取仪表盘数据失败', error)
//     return true // 继续重试
//   }
// })
// </script>

// <template>
//   <div class="dashboard">
//     <div class="status">
//       状态: {{ isPolling ? '实时更新中' : '已停止' }}
//     </div>
//     <button @click="isPolling ? stop() : start()">
//       {{ isPolling ? '停止更新' : '开始更新' }}
//     </button>

//     <!-- 仪表盘内容 -->
//     <div v-if="dashboardData.metrics">
//       <div v-for="metric in dashboardData.metrics" :key="metric.id">
//         {{ metric.name }}: {{ metric.value }}
//       </div>
//     </div>
//   </div>
// </template>
