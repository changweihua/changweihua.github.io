---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 小指南
description: Vue3 小指南
date: 2025-01-15 15:18:00
pageClass: blog-page-class
---

# Vue3 小指南 #

这是一份深入的指南，涵盖了 Vue 组合式 API、响应模式以及 Pinia 存储集成等方面，非常适合那些希望提升 Vue.js 技能的开发者。

## Ref 和响应式引用 ##

理解 Vue 响应系统的基础对于构建健壮的应用程序至关重要。本节将通过实际示例和 TypeScript 集成，探讨如何使用 refs 和响应式引用管理响应式状态。

### 什么是 Ref？ ###

ref 是 Vue 使基本值具有响应性的方式。它将值包装在一个带有 .value 属性的响应式对象中。

```ts
import { ref } from 'vue' 
// 在 Pinia 存储内部
export const useMyStore = defineStore('my-store', () => {
  // 创建一个响应式引用
  const count = ref<number>(0)

  // 访问或修改
  function increment() {
    count.value++  // 对于 refs 需要使用.value
  }

  return {
    count,  // 暴露后，组件可以直接使用，无需.value
    increment
  } 
})
```

### 存储中的 Ref 类型 ###

```ts
// 简单 ref
const isLoading = ref<boolean>(false)

// 数组 ref
const messages = ref<Message[]>([])

// 复杂对象 ref
const currentUser = ref<User | null>(null)

// 带有 undefined 的 ref
const selectedId = ref<string | undefined>(undefined)
```

## 侦听器与响应性 ##

掌握 Vue 的侦听功能可以让你有效地响应状态变化，创建动态、响应式的应用程序。学习如何高效地使用侦听器以及处理复杂的响应模式。

### 基本侦听器用法 ###

```typescript
import { watch, ref } from 'vue' 
export const useMyStore = defineStore('my-store', () => {
  const messages = ref<Message[]>([])

  // 简单侦听
  watch(messages, (newMessages, oldMessages) => {
    console.log('Messages changed:', newMessages)
  }) 
})
```

### 侦听器选项 ###

```typescript
// 立即执行
watch(messages, (newMessages) => {
  // 立即执行且在变化时也执行
}, { immediate: true }) 

// 深度侦听
watch(messages, (newMessages) => {
  // 检测深层对象变化
}, { deep: true }) 

// 多个源
watch(
  [messages, selectedId], 
  ([newMessages, newId], [oldMessages, oldId]) => {
    // 任意一个变化时触发
  } 
)
```

## 组合式函数 ##

组合式函数是 Vue 3 中可复用逻辑的核心。本节将展示如何创建强大、可复用的功能，并在整个应用程序中共享，同时保持代码的整洁和有条理。

### 创建自定义组合式函数 ###

组合式函数是遵循 use 前缀约定的可复用有状态逻辑函数。

```typescript
// useCounter.ts
import { ref, computed } from 'vue' 
export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  return {
    count,
    doubleCount,
    increment,
    decrement
  } 
}
```

### 组合式函数生命周期集成 ###

```typescript
// useMousePosition.ts
import { ref, onMounted, onUnmounted } from 'vue' 
export function useMousePosition() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y } 
}
```

### 异步组合式函数 ###

```typescript
// useAsyncData.ts
import { ref, watchEffect } from 'vue' 
export function useAsyncData<T>(asyncGetter: () => Promise<T>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  async function fetch() {
    isLoading.value = true
    error.value = null

    try {
      data.value = await asyncGetter()
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  watchEffect(() => {
    fetch()
  })

  return {
    data,
    error,
    isLoading,
    refresh: fetch
  } 
}
```

### 组合式函数依赖 ###

```typescript
// useUserProfile.ts
import { computed } from 'vue' 
import { useAuth } from './useAuth'
import { useApi } from './useApi'
export function useUserProfile() {
  const { user } = useAuth()
  const { get } = useApi()

  const userProfile = computed(() => {
    if (!user.value) return null
    return get(`/users/${user.value.id}/profile`)
  })

  return {
    userProfile
  } 
}
```

### 可复用表单验证 ###

```typescript
// useFormValidation.ts
import { ref, computed } from 'vue' 
export function useFormValidation<T extends Record<string, any>>(initialState: T) {
  const formData = ref(initialState)
  const errors = ref<Partial<Record<keyof T, string>>>({})

  const isValid = computed(() => Object.keys(errors.value).length === 0)

  function validate(rules: Record<keyof T, (value: any) => string | null>) {
    errors.value = {}

    Object.entries(rules).forEach(([field, validator]) => {
      const error = validator(formData.value[field])
      if (error) {
        errors.value[field as keyof T] = error
      }
    })

    return isValid.value
  }

  return {
    formData,
    errors,
    isValid,
    validate
  } 
}
```

### 在组件中使用组合式函数 ###

```vue
<script setup lang="ts">
import { useCounter } from '@/composables/useCounter'
import { useMousePosition } from '@/composables/useMousePosition'
const { count, increment } = useCounter()
const { x, y } = useMousePosition()
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
    <p>Mouse position: {{ x }}, {{ y }}</p>
  </div>
</template>
```

## Vue 响应性 API ##

深入了解 Vue 强大的响应系统。学习如何利用响应式对象、refs 和计算属性来构建动态、高效的应用程序。
使用响应式对象

`reactive` 方法创建一个对象的响应式代理，使其所有属性都具有深度响应性。

```typescript
// 基本响应式对象
import { reactive } from 'vue'
interface User {
  name: string
  age: number
  settings: {
    theme: string
    notifications: boolean
  }
}
const user = reactive<User>({
  name: 'John',
  age: 30,
  settings: {
    theme: 'dark',
    notifications: true
  }
})
// 直接访问属性（无需.value）
console.log(user.name)
user.age = 31
```

### reactive 与 ref 对比 ###

```typescript
// 比较 reactive 和 ref 的用法
import { reactive, ref } from 'vue'
// 使用 ref
const count = ref(0)
const user = ref({
  name: 'John',
  age: 30
})
// 需要使用.value 来访问和修改
count.value++
user.value.age++

// 使用 reactive
const state = reactive({
  count: 0,
  user: {
    name: 'John',
    age: 30
  }
})
// 直接访问属性进行修改
state.count++
state.user.age++
```

### 限制和类型处理 ###

```typescript
// ❌ reactive 的限制
import { reactive } from 'vue'
// 不要解构响应式对象
const state = reactive({ count: 0 })
const { count } = state // 会失去响应性！

// ✅ 正确做法是使用 computed 或方法
import { reactive, computed } from 'vue'
const state = reactive({ count: 0 })
const doubleCount = computed(() => state.count * 2)

// 或者保留对嵌套对象的引用
const nested = reactive({
  user: {
    profile: {
      name: 'John'
    }
  }
})
// 这样可以保持响应性
const profile = nested.user.profile
```

### 响应式数组和集合 ###

```typescript
import { reactive } from 'vue'
interface TodoItem {
  id: number
  text: string
  completed: boolean
}
const todos = reactive<TodoItem[]>([])

// 方法可以保持响应性
function addTodo(text: string) {
  todos.push({
    id: Date.now(),
    text,
    completed: false
  })
}

// 处理响应式集合
const collection = reactive(new Map<string, number>())
collection.set('key', 1)
```

### 与组合式函数结合 ###

```typescript
// useTaskManager.ts
import { reactive, computed } from 'vue'
interface Task {
  id: number
  title: string
  completed: boolean
}
export function useTaskManager() {
  const state = reactive({
    tasks: [] as Task[],
    filter: 'all' as 'all' | 'active' | 'completed'
  })

  const filteredTasks = computed(() => {
    switch (state.filter) {
      case 'active':
        return state.tasks.filter(task =>!task.completed)
      case 'completed':
        return state.tasks.filter(task => task.completed)
      default:
        return state.tasks
    }
  })

  function addTask(title: string) {
    state.tasks.push({
      id: Date.now(),
      title,
      completed: false
    })
  }

  function toggleTask(id: number) {
    const task = state.tasks.find(t => t.id === id)
    if (task) {
      task.completed =!task.completed
    }
  }

  return {
    state,
    filteredTasks,
    addTask,
    toggleTask
  }
}
```

### 响应式的最佳实践 ###

```typescript
// ✅ 良好实践
import { reactive, toRefs } from 'vue'
// 1. 使用接口保证类型安全
interface State {
  loading: boolean
  error: Error | null
  data: string[]
}
// 2. 初始化所有属性
const state = reactive<State>({
  loading: false,
  error: null,
  data: []
})
// 3. 需要解构时使用 toRefs
function useFeature() {
  const state = reactive({
    foo: 1,
    bar: 2
  })

  // 安全地解构
  return toRefs(state)
}
// 4. 尽可能避免嵌套响应式
// ❌ 不好的做法
const nested = reactive({
  user: reactive({
    profile: reactive({
      name: 'John'
    })
  })
})
// ✅ 好的做法
const state = reactive({
  user: {
    profile: {
      name: 'John'
    }
  }
})
```

### 与 TypeScript 集成 ###

```typescript
// reactive 与 TypeScript 的高级用法
import { reactive } from 'vue'
// 定义复杂类型
interface User {
  id: number
  name: string
  preferences: {
    theme: 'light' | 'dark'
    notifications: boolean
  }
}
interface AppState {
  currentUser: User | null
  isAuthenticated: boolean
  settings: Map<string, any>
}
// 创建类型安全的响应式状态
const state = reactive<AppState>({
  currentUser: null,
  isAuthenticated: false,
  settings: new Map()
})
// 类型安全的方法
function updateUser(user: Partial<User>) {
  if (state.currentUser) {
    Object.assign(state.currentUser, user)
  }
}
// 只读响应式状态
import { readonly } from 'vue'
const readonlyState = readonly(state)
```

## Pinia 存储集成 ##

了解如何有效地将 Pinia 存储与 Vue 的组合式 API 集成。学习状态管理的最佳实践以及如何构建可扩展的存储结构。

### 使用 Refs 的存储结构 ###

```typescript
export const useMyStore = defineStore('my-store', () => {
  // 状态
  const items = ref<Item[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // 计算属性
  const itemCount = computed(() => items.value.length)

  // 动作
  const fetchItems = async () => {
    isLoading.value = true
    try {
      items.value = await api.getItems()
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    isLoading,
    error,
    itemCount,
    fetchItems
  }
})
```

### 组合存储 ###

```typescript
export const useMainStore = defineStore('main-store', () => {
  // 使用另一个存储
  const otherStore = useOtherStore()

  // 侦听另一个存储的状态
  watch(
    () => otherStore.someState,
    (newValue) => {
      // 对另一个存储的变化做出反应
    }
  )
})
```

## 实际示例 ##

展示在 Vue 应用程序中如何实现常见功能和模式的实际示例。这些示例将理论付诸实践。

### 自动刷新实现 ###

```typescript
export const useChatStore = defineStore('chat-store', () => {
  const messages = ref<Message[]>([])
  const refreshInterval = ref<number | null>(null)
  const isRefreshing = ref(false)

  // 侦听自动刷新状态
  watch(isRefreshing, (shouldRefresh) => {
    if (shouldRefresh) {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }
  })

  const startAutoRefresh = () => {
    refreshInterval.value = window.setInterval(() => {
      fetchNewMessages()
    }, 5000)
  }

  const stopAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  return {
    messages,
    isRefreshing,
    startAutoRefresh,
    stopAutoRefresh
  }
})
```

### 加载状态管理 ###

```typescript
export const useDataStore = defineStore('data-store', () => {
  const data = ref<Data[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // 侦听加载状态的副作用
  watch(isLoading, (loading) => {
    if (loading) {
      // 显示加载指示器
    } else {
      // 隐藏加载指示器
    }
  })

  // 侦听错误
  watch(error, (newError) => {
    if (newError) {
      // 处理错误（显示通知等）
    }
  })
})
```

## 常见陷阱 ##

了解这些常见问题及其解决方案，避免犯同样的错误和调试时的头疼问题。

### Ref 初始化 ###

```typescript
// ❌ 不好的做法
const data = ref()  // 类型为 'any'

// ✅ 好的做法
const data = ref<string[]>([])  // 明确指定类型
```

### 侦听器清理 ###

```typescript
// ✅ 好的做法 - 进行清理
watch(source, () => {
  const timer = setInterval(() => {}, 1000)
  return () => clearInterval(timer);  // 清理函数
})
```

### 计算属性与侦听器 ###

```typescript
// ❌ 不好的做法 - 使用侦听器获取派生状态
watch(items, (newItems) => {
  itemCount.value = newItems.length
})

// ✅ 好的做法 - 使用计算属性获取派生状态
const itemCount = computed(() => items.value.length)
```

### 存储组织 ###

```typescript
// ✅ 良好的存储组织
export const useStore = defineStore('store', () => {
  // 状态 refs
  const data = ref<Data[]>([])
  const isLoading = ref(false)

  // 计算属性
  const isEmpty = computed(() => data.value.length === 0)

  // 侦听器
  watch(data, () => {
    // 处理数据变化
  })

  // 动作
  const fetchData = async () => {
    // 实现逻辑
  }

  // 返回公共接口
  return {
    data,
    isLoading,
    isEmpty,
    fetchData
  }
})
```

### 常见错误：忘记 `.value` ###

```typescript
// ❌ 错误做法
const count = ref(0)
count++ // 这样不会起作用

// ✅ 正确做法
count.value++
```

### 侦听器时机 ###

```typescript
// ❌ 不好的做法 - 可能错过初始状态
watch(source, () => {})

// ✅ 好的做法 - 捕获初始状态
watch(source, () => {}, { immediate: true })
```

### 内存泄漏 ###

```typescript
// ❌ 不好的做法 - 没有清理
const store = useStore()
setInterval(() => {
  store.refresh()
}, 1000)

// ✅ 好的做法 - 进行清理
const intervalId = setInterval(() => {
  store.refresh()
}, 1000)
onBeforeUnmount(() => clearInterval(intervalId))
```

## 高级模式 ##

通过高级模式和技术提升 Vue.js 技能，构建复杂且可扩展的应用程序。

### 复杂组件通信 ###

```typescript
// 高级组件通信模式示例
export function useComponentBridge() {
  const events = ref(new Map())

  function emit(event: string, data: any) {
    if (events.value.has(event)) {
      events.value.get(event).forEach((handler: Function) => handler(data))
    }
  }

  function on(event: string, handler: Function) {
    if (!events.value.has(event)) {
      events.value.set(event, new Set())
    }
    events.value.get(event).add(handler)

    return () => events.value.get(event).delete(handler)
  }

  return { emit, on }
}
```

## 测试策略 ##

学习如何使用现代测试实践和工具有效地测试 Vue 组件和存储。

### 测试组合式函数 ###

```typescript
import { renderComposable } from '@testing-library/vue-composables'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  test('should increment counter', () => {
    const { result } = renderComposable(() => useCounter())

    expect(result.current.count.value).toBe(0)
    result.current.increment()
    expect(result.current.count.value).toBe(1)
  })
})
```

## 性能优化 ##

介绍优化 Vue 应用程序性能和用户体验的技术与策略。

### 计算属性优化 ###

```typescript
// 优化计算属性以提升性能
const expensiveComputation = computed(() => {
  return memoize(() => {
    // 进行昂贵的计算
    return result
  })
})
```

在 Vue 应用开发中，深入理解这些概念、遵循最佳实践并避开常见陷阱，能够帮助开发者创建出高效、稳定且易于维护的应用程序。无论是处理响应式数据、管理存储还是优化性能，都需要开发者精心设计和编码。同时，通过合理的测试策略确保应用的正确性，利用高级模式提升应用的复杂度和扩展性，从而满足不同用户场景的需求。
