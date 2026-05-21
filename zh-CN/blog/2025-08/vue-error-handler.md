---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 3 错误处理与异常监控完全指南
description: Vue 3 错误处理与异常监控完全指南
date: 2025-08-04 15:35:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 错误处理架构 ##

### 错误类型定义 ###

```typescript:types/error.ts
export enum ErrorType {
  NETWORK = 'NETWORK',
  BUSINESS = 'BUSINESS',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError extends Error {
  type: ErrorType
  code?: string
  data?: any
  originalError?: any
}

export class BusinessError extends Error implements AppError {
  type = ErrorType.BUSINESS
  constructor(
    message: string,
    public code?: string,
    public data?: any
  ) {
    super(message)
    this.name = 'BusinessError'
  }
}

export class NetworkError extends Error implements AppError {
  type = ErrorType.NETWORK
  constructor(
    message: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}
```

### 全局错误处理器 ###

```typescript:utils/errorHandler.ts
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorListeners: Array<(error: AppError) => void> = []
  
  static getInstance() {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }
  
  // 添加错误监听器
  public addListener(listener: (error: AppError) => void) {
    this.errorListeners.push(listener)
  }
  
  // 移除错误监听器
  public removeListener(listener: (error: AppError) => void) {
    const index = this.errorListeners.indexOf(listener)
    if (index > -1) {
      this.errorListeners.splice(index, 1)
    }
  }
  
  // 处理错误
  public handleError(error: any) {
    const appError = this.normalizeError(error)
    this.notifyListeners(appError)
    this.logError(appError)
    
    if (this.shouldReportError(appError)) {
      this.reportError(appError)
    }
  }
  
  // 标准化错误
  private normalizeError(error: any): AppError {
    if (error instanceof BusinessError || error instanceof NetworkError) {
      return error
    }
    
    if (error.response) {
      return new NetworkError(
        error.response.data?.message || 'Network Error',
        error
      )
    }
    
    return {
      name: 'UnknownError',
      message: error.message || 'Unknown Error',
      type: ErrorType.UNKNOWN,
      originalError: error
    }
  }
  
  // 通知监听器
  private notifyListeners(error: AppError) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error)
      } catch (err) {
        console.error('Error in error listener:', err)
      }
    })
  }
  
  // 记录错误
  private logError(error: AppError) {
    console.error('[App Error]:', {
      type: error.type,
      name: error.name,
      message: error.message,
      code: error.code,
      data: error.data,
      stack: error.stack
    })
  }
  
  // 判断是否需要上报错误
  private shouldReportError(error: AppError): boolean {
    // 忽略某些类型的错误
    const ignoredTypes = [ErrorType.VALIDATION]
    return !ignoredTypes.includes(error.type)
  }
  
  // 上报错误
  private reportError(error: AppError) {
    // 可以集成第三方监控服务
    // 如 Sentry, LogRocket 等
  }
}
```

## 错误监控集成 ##

### Vue 应用集成 ###

```typescript:plugins/error.ts
import { App } from 'vue'
import { ErrorHandler } from '@/utils/errorHandler'

export function setupErrorHandling(app: App) {
  const errorHandler = ErrorHandler.getInstance()
  
  // 全局错误处理
  app.config.errorHandler = (err, vm, info) => {
    errorHandler.handleError({
      ...err,
      vm,
      info
    })
  }
  
  // 全局 Promise 错误处理
  window.addEventListener('unhandledrejection', event => {
    errorHandler.handleError(event.reason)
  })
  
  // 全局 JS 错误处理
  window.addEventListener('error', event => {
    errorHandler.handleError(event.error)
  })
}
```

### 请求错误处理 ###

```typescript:utils/request.ts
import axios, { AxiosInstance, AxiosError } from 'axios'
import { ErrorHandler } from './errorHandler'

export class HttpClient {
  private axios: AxiosInstance
  private errorHandler: ErrorHandler
  
  constructor() {
    this.errorHandler = ErrorHandler.getInstance()
    this.axios = axios.create({
      baseURL: '/api',
      timeout: 10000
    })
    
    this.setupInterceptors()
  }
  
  private setupInterceptors() {
    // 响应拦截器
    this.axios.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        this.handleRequestError(error)
        return Promise.reject(error)
      }
    )
  }
  
  private handleRequestError(error: AxiosError) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          this.errorHandler.handleError(
            new BusinessError('Unauthorized', 'AUTH_ERROR')
          )
          break
        case 403:
          this.errorHandler.handleError(
            new BusinessError('Forbidden', 'PERMISSION_ERROR')
          )
          break
        case 404:
          this.errorHandler.handleError(
            new BusinessError('Resource not found', 'NOT_FOUND')
          )
          break
        default:
          this.errorHandler.handleError(
            new NetworkError(error.message, error)
          )
      }
    } else if (error.request) {
      this.errorHandler.handleError(
        new NetworkError('Network Error', error)
      )
    } else {
      this.errorHandler.handleError(
        new NetworkError('Request Config Error', error)
      )
    }
  }
  
  // API 方法
  public async get<T>(url: string, config = {}) {
    try {
      const response = await this.axios.get<T>(url, config)
      return response.data
    } catch (error) {
      throw error
    }
  }
  
  // 其他请求方法...
}
```

## 错误展示组件 ##

### 错误提示组件 ###

```vue
<!-- components/ErrorMessage.vue -->
<template>
  <div class="error-message" v-if="visible">
    <div class="error-content" :class="type">
      <icon-component :name="iconName" />
      <div class="error-text">
        <h4>{{ title }}</h4>
        <p>{{ message }}</p>
      </div>
      <button v-if="retryable" @click="handleRetry">
        重试
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppError } from '@/types/error'

const props = defineProps<{
  error: AppError
  visible: boolean
  retryable?: boolean
}>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const type = computed(() => props.error.type.toLowerCase())

const title = computed(() => {
  switch (props.error.type) {
    case ErrorType.NETWORK:
      return '网络错误'
    case ErrorType.BUSINESS:
      return '业务错误'
    case ErrorType.VALIDATION:
      return '验证错误'
    default:
      return '系统错误'
  }
})

const iconName = computed(() => {
  switch (props.error.type) {
    case ErrorType.NETWORK:
      return 'wifi-off'
    case ErrorType.BUSINESS:
      return 'alert-circle'
    case ErrorType.VALIDATION:
      return 'alert-triangle'
    default:
      return 'x-circle'
  }
})

const handleRetry = () => {
  emit('retry')
}
</script>
```

### 错误边界组件 ###

```vue
<!-- components/ErrorBoundary.vue -->
<template>
  <div class="error-boundary">
    <template v-if="error">
      <slot name="error" :error="error" :reset="reset">
        <error-message
          :error="error"
          :visible="true"
          :retryable="true"
          @retry="reset"
        />
      </slot>
    </template>
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import type { AppError } from '@/types/error'
import ErrorMessage from './ErrorMessage.vue'

const error = ref<AppError | null>(null)

const reset = () => {
  error.value = null
}

onErrorCaptured((err: any) => {
  error.value = err as AppError
  return false // 阻止错误继续传播
})
</script>
```

## 错误处理 Hooks ##

### 基础错误处理 Hook ###

```typescript:hooks/useError.ts
import { ref } from 'vue'
import type { AppError } from '@/types/error'

export function useError() {
  const error = ref<AppError | null>(null)
  const loading = ref(false)
  
  const executeWithError = async <T>(
    promise: Promise<T>
  ): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      return await promise
    } catch (err) {
      error.value = err as AppError
      return null
    } finally {
      loading.value = false
    }
  }
  
  const clearError = () => {
    error.value = null
  }
  
  return {
    error,
    loading,
    executeWithError,
    clearError
  }
}
```

### 请求错误处理 Hook ###

```typescript:hooks/useRequest.ts
import { useError } from './useError'
import { HttpClient } from '@/utils/request'

export function useRequest() {
  const { error, loading, executeWithError } = useError()
  const http = new HttpClient()
  
  const get = async <T>(url: string, config = {}) => {
    return await executeWithError(http.get<T>(url, config))
  }
  
  const post = async <T>(url: string, data: any, config = {}) => {
    return await executeWithError(http.post<T>(url, data, config))
  }
  
  return {
    error,
    loading,
    get,
    post
  }
}
```

## 监控与分析 ##

### 性能监控 ###

```typescript:utils/performance.ts
export class PerformanceMonitor {
  private metrics: {
    [key: string]: {
      count: number
      totalTime: number
    }
  } = {}
  
  // 记录操作时间
  public recordOperation(name: string, startTime: number) {
    const duration = performance.now() - startTime
    
    if (!this.metrics[name]) {
      this.metrics[name] = { count: 0, totalTime: 0 }
    }
    
    this.metrics[name].count++
    this.metrics[name].totalTime += duration
  }
  
  // 获取性能报告
  public getReport() {
    const report: {
      [key: string]: {
        avgTime: number
        count: number
      }
    } = {}
    
    Object.entries(this.metrics).forEach(([name, data]) => {
      report[name] = {
        avgTime: data.totalTime / data.count,
        count: data.count
      }
    })
    
    return report
  }
}
```

### 错误统计 ###

```typescript:utils/analytics.ts
export class ErrorAnalytics {
  private errorStats: {
    [key in ErrorType]: {
      count: number
      lastOccurrence: Date
      samples: AppError[]
    }
  } = {
    [ErrorType.NETWORK]: { count: 0, lastOccurrence: new Date(), samples: [] },
    [ErrorType.BUSINESS]: { count: 0, lastOccurrence: new Date(), samples: [] },
    [ErrorType.VALIDATION]: { count: 0, lastOccurrence: new Date(), samples: [] },
    [ErrorType.AUTH]: { count: 0, lastOccurrence: new Date(), samples: [] },
    [ErrorType.UNKNOWN]: { count: 0, lastOccurrence: new Date(), samples: [] }
  }
  
  public recordError(error: AppError) {
    const stats = this.errorStats[error.type]
    stats.count++
    stats.lastOccurrence = new Date()
    
    // 保留最近的错误样本
    if (stats.samples.length >= 10) {
      stats.samples.shift()
    }
    stats.samples.push(error)
  }
  
  public getStatistics() {
    return this.errorStats
  }
}
```

## 最佳实践 ##

### 错误分类 ###

- 清晰的错误类型定义
- 合理的错误层级
- 统一的错误格式

### 错误处理策略 ###

- 全局统一处理
- 局部精细控制
- 优雅降级方案

### 用户体验 ###

- 友好的错误提示
- 合适的重试机制
- 错误恢复方案

### 监控与预警 ###

- 错误数据收集
- 性能指标监控
- 及时报警机制

## 总结 ##

### 本指南涵盖 ###

- 错误处理架构设计
- 错误监控系统实现
- 错误展示组件开发
- 错误处理 Hooks 封装
- 监控与分析系统

### 关键点 ###

- 统一的错误处理
- 友好的用户体验
- 完整的监控体系
- 可扩展的架构设计
