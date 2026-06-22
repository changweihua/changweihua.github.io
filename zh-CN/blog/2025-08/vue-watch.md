---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 侦听器（watch）详解：监听数据的变化
description: Vue 侦听器（watch）详解：监听数据的变化
date: 2025-08-05 10:15:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

在 Vue 3 中，watch() 是组合式 API 的重要成员，用于**响应式地监听数据变化并触发副作用**。虽然我们大多数人都用过它，但你是否真正了解它的高阶用法？是否遇到过这些问题：

- 为什么 watch 的回调会在组件挂载时就触发？
- 如何深度监听一个嵌套对象的变化？
- 如何同时监听多个数据源？
- 如何控制监听回调的时机？
- 如何手动停止监听？


这篇文章将带你**由浅入深**地掌握 `watch()` 的高级用法，彻底告别“用得了但搞不清”。

## 🧩 基础回顾：watch 是干嘛的？ ##

`watch` 就是用来**侦听响应式数据的变化**，当被监听的值变化时，执行副作用逻辑。

```ts
import { ref, watch } from 'vue'

const count = ref(0)

watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} → ${newVal}`)
})
```

当你运行 `count.value++` 时，会触发 `watch` 的回调函数。

## 📘 一、监听多个数据源（数组监听） ##

有时你需要同时监听多个变量，使用数组即可：

```ts
const a = ref(1)
const b = ref(2)

watch([a, b], ([newA, newB], [oldA, oldB]) => {
  console.log(`a: ${oldA} → ${newA}`)
  console.log(`b: ${oldB} → ${newB}`)
})
```

注意：监听数组时，**参数是数组结构的 [newValArray, oldValArray]** ，不是单个值。

## 🔍 二、深度监听对象（deep watch） ##

当监听对象或数组时，默认是**浅监听**，只监听引用变化：

```ts
const obj = ref({ name: 'Vue', age: 3 })

watch(obj, (newVal) => {
  console.log('对象整体变了')
})
```

如果只是 `obj.value.age++`，不会触发 `watch`。解决办法是开启 `deep: true`：

```ts
watch(obj, (newVal) => {
  console.log('深度监听：属性变了', newVal)
}, { deep: true })
```

> 注意：监听响应式对象 **最好不要监听 ref(obj) 而是监听 obj.value 内部字段或使用 reactive() 结合 deep**。

## 🕹 三、控制监听回调触发时机（immediate） ##

默认情况下，`watch` 只在依赖变化时触发。使用 `immediate: true` 可以在**初次监听时就执行一次回调**：

```ts
watch(count, (newVal, oldVal) => {
  console.log('首次立即执行', newVal)
}, { immediate: true })
```

常用于：

- 初始化时拉取接口数据；
- 初始化日志打印；
- 需要拿到默认值执行逻辑。

## ⏰ 四、监听对象某个字段变化（函数监听） ##

你可以监听一个 `getter` 函数，**精准指定你要监听的响应式属性**：

```ts
const user = ref({ name: 'Alice', age: 25 })

watch(() => user.value.age, (newAge) => {
  console.log('年龄变了', newAge)
})
```

这样可以避免 deep 带来的性能消耗，非常推荐在实际开发中使用。

## 🔄 五、监听 reactive 对象的任意字段变化 ##

如果你用的是 `reactive()`，无法直接 `watch` 某个属性。你有两种选择：

### ✅ 方法一：使用 getter ###

```ts
const user = reactive({ name: 'Bob', age: 30 })

watch(() => user.age, (newVal) => {
  console.log('age 改变了', newVal)
})
```

### ✅ 方法二：直接 deep 监听整个对象 ###

```ts
watch(user, (newVal) => {
  console.log('任意字段变了', newVal)
}, { deep: true })
```

但注意：**deep 有性能开销，尽量精确监听具体字段**。

## 🧼 六、watch 的清理函数（副作用释放） ##

当你在 watch 内部使用异步操作或副作用逻辑，比如定时器或网络请求，需要在下次触发之前清理：

```ts
watch(count, (newVal, oldVal, onCleanup) => {
  const timer = setTimeout(() => {
    console.log('模拟异步请求完成')
  }, 1000)

  onCleanup(() => {
    clearTimeout(timer)
    console.log('上一次副作用被清除')
  })
})
```

这可以防止旧请求/副作用残留，避免竞态条件、内存泄漏等问题。

## ❌ 七、如何停止监听？ ##

`watch` 会返回一个**停止监听的函数**，你可以在某些条件下主动调用：

```ts
const stop = watch(count, (val) => {
  console.log('监听中', val)
  if (val > 5) {
    stop()
    console.log('监听已停止')
  }
})
```

## 🧠 八、最佳实践建议 ##

- ✅ 精准监听字段（使用 `getter`）而非整个对象；
- ✅ `deep: true` 慎用，有性能开销；
- ✅ 需要初始化调用就加 `immediate: true`；
- ✅ 有异步副作用时配合 `onCleanup` 清理；
- ✅ 大多数时候优先使用 `computed`，`watch` 用于“有副作用”的场景。

## 🧪 九、实战演练：用户表单自动保存 ##

```ts
const form = reactive({
  name: '',
  email: ''
})

watch(
  () => ({ ...form }), // 简单实现浅层结构监听
  (val) => {
    console.log('自动保存', val)
    saveToLocalStorage(val)
  },
  { deep: true, immediate: true }
)

function saveToLocalStorage(data) {
  localStorage.setItem('form-data', JSON.stringify(data))
}
```

## 🎯 总结 ##

| 场景        |      推荐做法      |  备注 |
| :-----------: | :-----------: | :----: |
| 监听单个 `ref` | 直接传变量 |  |
| 监听多个数据源 | 传数组 |  |
| 监听某个字段 | 传函数 |  |
| 初始即执行 | `{ immediate: true }` |  |
| 对象内部变动 | `{ deep: true }` 或监听字段 |  |
| 清理副作用 | 使用 `onCleanup` |  |
| 手动停止 | 调用 `stop()` |  |

## 🪄 最后 ##

`watch()` 是 `Vue` 响应式系统中不可或缺的一部分，很多场景都离不开它，比如接口请求、缓存逻辑、UI 控制等。希望这篇文章能帮你彻底掌握 `watch` 的各种高阶用法，**写出更健壮、更高效的 Vue 组件**。
