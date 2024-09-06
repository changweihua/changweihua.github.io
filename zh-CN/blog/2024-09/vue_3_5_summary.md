---
lastUpdated: true
commentabled: true
recommended: true
title:  Vue 3.5发布，新增几个新用法
description: Vue 3.5发布，新增几个新用法
date: 2024-09-04 10:18:00
pageClass: blog-page-class
---

# Vue 3.5发布，新增几个新用法 #

## 响应式 Props 解构 ##

Reactive Props Destruction 已在 3.5 中稳定下来。现在默认启用该功能，从 `<script setup>` 中的 defineProps 调用解构的变量现在是响应性的。值得注意的是，此功能通过利用 JavaScript 的原生默认值语法，显着简化了使用默认值声明 props 的过程。

### vue3.5前响应式解构props用法 ###

:::demo
```vue
<template>
  <div>count is {{props.count}}</div>
  <a-button @click="print">Print</a-button>
</template>
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    count?: number
    msg?: string
  }>(),
  {
    count: 10,
    msg: 'hello'
  }
);

const print = () => {
  console.log(props.count)
}
</script>
```
:::


### vue3.5响应式解构props方法 ###

对解构变量（例如count）的访问会由编译器自动编译到 props.count 中，因此在访问时会跟踪它们。与props.count 类似，观察解构的 prop 变量或将其传递到可组合项同时保留反应性需要将其包装在 getter 中。

:::demo

```vue
<template>
  <div>count is {{count}}</div>
  <a-button @click="print">Print</a-button>
</template>
<script setup lang="ts">
const { count = 10, msg = 'hello' } = defineProps<{
  count?: number
  message?: string
}>()

const print = () => {
  console.log(count)
}
</script>
```

:::

```vue
watch(count /* ... */)
//    ^ results in compile-time error

watch(() => count /* ... */)
//    ^ wrap in a getter, works as expected

// composables should normalize the input with `toValue()`
useDynamicCount(() => count)
```

## useId() ##

`useId()` 是一个 API，可用于生成每个应用程序唯一的 ID，并保证在服务器和客户端渲染中保持稳定。它们可用于生成表单元素和可访问性属性的 ID，并可在 SSR 应用程序中使用，而不会导致水合作用不匹配。

结合 `app.config.idPrefix` 前缀，使开发者可以更轻松地管理应用中的 ID，尤其是在多应用场景下能够避免 ID 冲突。

```vue
<script setup>
import { useId } from 'vue'

const id = useId()
</script>

<template>
  <form>
    <label :for="id">Name:</label>
    <input :id="id" type="text" />
  </form>
</template>
```

## 自定义元素改进 ##

3.5 修复了许多与defineCustomElement() API 相关的长期存在的问题，并添加了许多使用 Vue 创作自定义元素的新功能：

- 通过 `configureApp` 选项支持自定义元素的应用程序配置。
- 添加 `useHost()` 、 `useShadowRoot()` 和 `this.$host` API 用于访问自定义元素的宿主元素和影子根。
- 通过传递 `shadowRoot: false` 支持在没有 Shadow DOM 的情况下挂载自定义元素。
- 支持提供 nonce 选项，该选项将附加到自定义元素注入的 `<style>` 标签。

这些新的仅自定义元素选项可以通过第二个参数传递给 defineCustomElement ：

```vue

import MyElement from './MyElement.ce.vue'

defineCustomElements(MyElement, {
  shadowRoot: false,
  nonce: 'xxx',
  configureApp(app) {
    app.config.errorHandler = function() {
      
    }
  }
})

```

## useTemplateRef() ##

3.5 引入了一种通过 useTemplateRef() API 获取模板引用的新方法：

```vue
<script setup>
import { useTemplateRef } from 'vue'

const inputRef = useTemplateRef('input')
const divRef = useTemplateRef<HTMLDivElement>('div')
</script>

<template>
  <input ref="input">
  <div ref="div">a</div>
</template>
```

在 3.5 之前，我们建议使用纯引用，其变量名称与静态 ref 属性匹配。旧方法要求编译器可以分析 ref 属性，因此仅限于静态 ref 属性。相比之下， useTemplateRef() 通过运行时字符串 ID 匹配引用，因此支持动态引用绑定到更改的 ID。

`@vue/language-tools 2.1` 还实现了对新语法的特殊支持，因此在使用 `useTemplateRef()` 时，您将根据模板中是否存在 ref 属性获得自动完成和警告：

## 延迟传送(Deferred Teleport) ##

内置 `<Teleport>` 组件的一个已知约束是其目标元素在安装传送组件时必须存在。这可以防止用户在传送后将内容传送到 Vue 渲染的其他元素。
在 3.5 中，我们为`<Teleport>`引入了defer属性，它会在当前渲染周期之后安装它，因此现在可以使用：

```vue
<Teleport defer target="#container">...</Teleport>
<div id="container"></div>
```

> 此行为需要defer属性，因为默认行为需要向后兼容。

## onWatcherCleanup() ##

3.5 引入了全局导入的 API `onWatcherCleanup()` ，用于在观察者中注册清理回调：

```vue
import { watch, onWatcherCleanup } from 'vue'

watch(id, (newId) => {
  const controller = new AbortController()

  fetch(`/api/${newId}`, { signal: controller.signal }).then(() => {
    // callback logic
  })

  onWatcherCleanup(() => {
    // abort stale request
    controller.abort()
  })
})
```

```vue
import { watch, onWatcherCleanup } from 'vue'
​
watch(id, (newId) => {
  const { response, cancel } = doAsyncWork(newId)
  // 如果之前的请求还没有完成的话
  onWatcherCleanup(cancel)
})
```


## Lazy Hydration ##

异步组件现在可以通过 `defineAsyncComponent()` API 的 hydrate 选项指定策略来控制何时应进行 `Hydrated`。例如，仅在组件可见时对其进行水合：

```vue
import { defineAsyncComponent, hydrateOnVisible } from 'vue'

const AsyncComp = defineAsyncComponent({
  loader: () => import('./Comp.vue'),
  hydrate: hydrateOnVisible()
})
```

核心 API 有意设置为较低级别，Nuxt 团队已经在此功能的基础上构建了更高级别的语法糖。

## watch的暂停和恢复 ##

```vue
const { stop, pause, resume } = watchEffect(() => {})
​
// 暂时暂停观察者
pause()
​
// 恢复观察者
resume()
​
// 停止观察
stop()
```
