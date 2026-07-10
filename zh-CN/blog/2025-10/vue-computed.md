---
lastUpdated: true
commentabled: true
recommended: true
title: 深入浅出 Vue 的 `computed`
description: 不仅仅是“计算属性”那么简单！
date: 2025-10-14 10:40:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

> 在 Vue 的世界里，响应式是它的灵魂。而 computed（计算属性）正是这个响应系统中一颗闪耀的明星。它不仅能提升代码的可读性和性能，还能优雅地处理复杂逻辑。本篇文章将带你系统掌握 computed 的用法与底层原理，彻底理解它与 watch、methods 的区别与适用场景。

## 一、什么是 computed？ ##

在 Vue 中，`computed` 是 *基于响应式依赖进行缓存的计算属性*。

你可以把它想象成模板里的“智能变量”——只要依赖的数据没变，它就不会重新计算，性能非常好。

**✅ 官方定义**：

> 计算属性是基于它们的响应式依赖进行缓存的，只有在相关依赖发生变化时它们才会重新求值。

## 二、为什么不用 methods 或 watch 替代 computed？ ##

|  对比项   |   computed  |   methods  |   watch  |
| :-----------: | :-----------: | :-----------: | :-----------: |
| 是否有缓存 | ✅ 有缓存，依赖不变不重新计算 | ❌ 每次调用都重新计算 | ❌ 不涉及计算返回值 |
| 适用场景 | 表达式逻辑较重、需要缓存结果 | 简单计算或不频繁调用 | 监听值变化并触发副作用 |
| 调用方式 | 模板中当变量使用 | 模板中当函数调用 | 只能在 JS 中使用 |

## 三、computed 的基本用法 ##

```vue
<template>
  <div>
    <p>姓名：{{ fullName }}</p>
    <input v-model="firstName" placeholder="姓">
    <input v-model="lastName" placeholder="名">
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const firstName = ref('张')
const lastName = ref('三')

// computed 会根据依赖的 firstName 和 lastName 自动更新
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
</script>
```

**✅ 说明**：

- 只要 firstName 或 lastName 任意一个变化，fullName 就会自动重新计算。
- 若两者都没变，fullName 不会重复计算，性能更优。

## 四、使用 getter 和 setter 实现双向绑定 ##

有时候我们希望通过 computed 实现读写双向能力，比如：

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('李')
const lastName = ref('雷')

const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (val) => {
    const parts = val.split(' ')
    firstName.value = parts[0] || ''
    lastName.value = parts[1] || ''
  }
})
</script>

<template>
  <input v-model="fullName" />
</template>
```

**✅ 说明**：

- 用户修改 fullName 时，会通过 set 方法反向拆分出 firstName 和 lastName。
- 这在表单处理和数据映射中非常实用。

## 五、和 watch 的典型区别场景 ##

```vue
<script setup>
import { ref, computed, watch } from 'vue'

const price = ref(100)
const quantity = ref(2)

// 计算总价
const total = computed(() => price.value * quantity.value)

// watch 监听价格变化，并打印日志（副作用）
watch(price, (newVal, oldVal) => {
  console.log(`价格从 ${oldVal} 变为 ${newVal}`)
})
</script>
```

**✅ 区别说明**：

- computed 用来返回一个值（总价）。
- watch 是为了“做点事情”（比如打印日志、发请求）——这就是“副作用”。

## 六、多个 computed 嵌套组合使用 ##

有时候我们会有多个计算属性依赖彼此：

```vue
<script setup>
import { ref, computed } from 'vue'

const salary = ref(8000)

const tax = computed(() => salary.value * 0.1)
const incomeAfterTax = computed(() => salary.value - tax.value)
</script>

<template>
  <p>工资：{{ salary }}</p>
  <p>税：{{ tax }}</p>
  <p>税后收入：{{ incomeAfterTax }}</p>
</template>
```

Vue 会自动追踪依赖关系，无需担心顺序或重复计算的问题。

## 七、computed 的调试技巧 ##

有时候你可能发现 computed 没有更新？建议你检查：

- 依赖的响应式数据是否写错？
- 是否使用了 `.value`？
- 是否用了 `reactive` 而你直接解构了对象？

```js
// 错误示范
const person = reactive({ age: 30 })
const age = computed(() => person.age) // 如果你解构了 person.age，computed 就无法感知变化
```

解决方式：要么别解构，要么使用 `toRefs` 保持响应性。

## 八、总结：什么时候使用 computed？ ##

|  使用时机   |      推荐方式  |
| :-----------: | :-----------: |
| 需要显示一个*依赖多个值计算的变量* | 用 computed |
| 需要在变量变化时执行*异步操作、副作用* | 用 watch |
| 模板中临时调用简单函数，无需缓存 | 用 methods |

## 九、写在最后 ##

`computed` 不仅仅是“计算属性”，它代表的是 Vue 响应系统中智能、高效的表达方式。
使用得当，可以让你的模板更简洁、逻辑更清晰、性能更优秀。
