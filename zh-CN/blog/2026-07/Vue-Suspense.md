---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 3 中 `<script setup>` 顶层 await与 `<Suspense>`的结合使用
description: Vue 3 中 `<script setup>` 顶层 await与 `<Suspense>`的结合使用
date: 2026-07-14 11:05:00
pageClass: blog-page-class
cover: /covers/vue.svg
---

Vue 3 的 `<script setup>` 支持顶层 await，这意味着你可以在组件的 `setup` 阶段直接 await 异步操作。此时，该组件会隐式成为一个异步组件，必须被 `<Suspense>` 组件包裹才能正确渲染。`<Suspense>` 用于协调这些异步依赖，在等待期间显示 fallback 内容，待所有异步组件准备就绪后统一渲染。

## 基本用法

### 定义一个带顶层 await 的组件 AsyncComponent.vue

```vue
<!-- AsyncComponent.vue -->
<script setup lang="ts">
  // 顶层 await – 组件会等待这个 Promise 完成再渲染
  const data = await fetch('/api/data').then((res) => res.json())
  const message = ref(`Data loaded: ${data.text}`)
</script>

<template>
  <div class="async-component">
    <h2>{{ message }}</h2>
  </div>
</template>
```

### 在父组件中使用 `<Suspense>` 包裹

```vue
<!-- Parent.vue -->
<script setup lang="ts">
  import AsyncComponent from './AsyncComponent.vue'
</script>

<template>
  <Suspense>
    <!-- 异步组件最终会渲染到这里 -->
    <AsyncComponent />

    <!-- 加载中时显示的占位内容 -->
    <template #fallback>
      <div>Loading async component...</div>
    </template>
  </Suspense>
</template>
```

当 `AsyncComponent` 内部的顶层 `await` 未完成时，`<Suspense>` 会显示 fallback 插槽的内容；一旦异步操作结束，组件渲染完成，fallback 会自动替换为真实组件。

## 多个异步组件/嵌套 await 的场景

`<Suspense>` 会等待其默认插槽中所有异步依赖（包括多个顶层 await 的组件、嵌套的异步组件）全部准备就绪，然后一次性渲染。

```vue
<template>
  <Suspense>
    <div>
      <AsyncComponentA />
      <AsyncComponentB />
      <AsyncComponentC />
      <!-- 三个组件都会等待 -->
    </div>
    <template #fallback>
      <Spinner />
    </template>
  </Suspense>
</template>
```

只有所有子异步组件都完成，才会显示默认插槽的内容。如果其中一个失败（Promise reject），需配合 onErrorCaptured 或错误边界处理。

## 错误处理

`<Suspense>` 自身不提供错误捕获，需要结合 Vue 的 `errorCaptured` 生命周期钩子或单独的 `ErrorBoundary` 组件。

### 使用 `onErrorCaptured` 捕获异步错误

```vue
<script setup>
  import { onErrorCaptured } from 'vue'

  onErrorCaptured((err, instance, info) => {
    console.error('Suspense error:', err)
    // 返回 false 阻止错误继续传播
    return false
  })
</script>

<template>
  <Suspense>
    <AsyncComponent />
    <template #fallback>Loading...</template>
  </Suspense>
</template>
```

### 封装一个错误边界组件

```vue
<!-- ErrorBoundary.vue -->
<script setup>
  import { onErrorCaptured, ref } from 'vue'

  const error = ref(null)
  onErrorCaptured((err) => {
    error.value = err
    return false // 阻止向上传播
  })
</script>

<template>
  <div
    v-if="error"
    class="error"
  >
    Something went wrong: {{ error.message }}
  </div>
  <slot v-else />
</template>
```

使用：

```vue
<ErrorBoundary>
  <Suspense>
    <AsyncComponent />
    <template #fallback>Loading...</template>
  </Suspense>
</ErrorBoundary>
```

## 原理简述

- 顶层 `await` 会被 Vue 编译器转换为 `async setup()` 函数。该函数返回一个 Promise，表示组件尚未准备就绪。
- `<Suspense>` 内部维护一个异步队列，它会检查默认插槽中所有组件的 setup 函数返回的 Promise（或组件是否标记为异步）。当所有异步依赖完成后，Suspense 才会触发渲染并将 fallback 替换为实际内容。
- 若某个异步组件出错，Suspense 会向上抛出错误，需由父组件的 errorCaptured 处理。

## 注意事项与最佳实践

### `<Suspense>` 目前仍为实验性特性

虽然 Vue 3 已稳定，但 Suspense 的 API 未来可能发生不兼容变更（尤其是错误处理和嵌套 Suspense 的行为）。生产环境使用需谨慎评估。

### 顶层 await 只存在于 `<script setup>`

如果你使用传统 `export default { async setup() {} }`，同样需要配合 Suspense，但 `<script setup>` 的顶层 await 语法更简洁。

### 不要忘记 `#fallback` 插槽

若省略 fallback，在等待期间会没有任何显示，可能导致界面闪烁或空白。

### 避免在顶层 await 中执行副作用过大的操作

因为组件渲染会被阻塞直到异步操作完成。考虑在 `onMounted` 中执行非关键数据请求，或使用骨架屏优化体验。

### `<Suspense>` 可与路由结合

Vue Router 支持动态导入组件，配合 `defineAsyncComponent` 也能触发 Suspense，但顶层 await 更自然。

```ts
// 路由异步组件配合 Suspense
const routes = [
  {
    path: '/dashboard',
    component: () => import('./Dashboard.vue') // 若该组件内部有顶层 await，也需要 Suspense
  }
]
```

### 组合式函数中的异步

如果你在 composable 中返回 Promise，不会自动触发 Suspense。只有 setup 顶层的 await 才有效。

```ts
// ❌ 不会阻塞 Suspense
const useData = () => {
  const data = ref(null)
  fetch('/api').then((r) => (data.value = r))
  return data
}

// ✅ 会阻塞 Suspense
const useDataAsync = async () => {
  const data = await fetch('/api').then((r) => r.json())
  return { data }
}
// 在 setup 顶层：const { data } = await useDataAsync()
```

测试：测试异步组件时，需要等待 `flushPromises` 或使用 `@vue/test-utils` 的 `findComponent` 配合 `Suspense` 的特殊行为。

## 完整示例：带加载和错误处理的用户资料组件

```vue
<!-- UserProfile.vue -->
<script setup lang="ts">
  // 顶层 await，模拟请求用户数据
  const user = await fetch('https://api.example.com/user/1').then((res) => {
    if (!res.ok) throw new Error('Failed to fetch user')
    return res.json()
  })
</script>

<template>
  <div>
    <h1>{{ user.name }}</h1>
    <p>Email: {{ user.email }}</p>
  </div>
</template>
```

父组件：

```vue
<template>
  <ErrorBoundary>
    <Suspense>
      <UserProfile />
      <template #fallback>
        <div class="spinner">Loading user profile...</div>
      </template>
    </Suspense>
  </ErrorBoundary>
</template>
```

## 总结

| 概念         | 说明                                                                      |
| :----------- | :------------------------------------------------------------------------ |
| 顶层 await   | 在 `<script setup>` 中直接 `await`，组件变为异步组件，需配合 `<Suspense>` |
| `<Suspense>` | 内置组件，提供 `default` 和 `fallback` 插槽，等待所有异步子组件完成渲染   |
| 错误处理     | 使用 `onErrorCaptured` 或自定义错误边界组件                               |
| 实验性       | Suspense API 尚未完全稳定，注意版本兼容性                                 |

通过合理搭配顶层 `await` 和 `<Suspense>`，可以优雅地管理页面或组件的异步加载状态，提升用户体验。但在使用前建议仔细评估项目对实验性 API 的接受程度，并做好错误兜底。
