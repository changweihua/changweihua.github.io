---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 的单文件组件、选项式 API、组合式 API 到底是啥？
description: Vue 的单文件组件、选项式 API、组合式 API 到底是啥？
date: 2025-10-14 12:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 🌟 一、什么是单文件组件（Single File Component, SFC） ##

单文件组件，顾名思义就是把 HTML、JS、CSS 都写在一个 .vue 文件中。这种组织方式非常直观，利于维护。

下面是一个最简单的单文件组件示例（`HelloCounter.vue`）：

```vue [HelloCounter.vue]
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">Count is: {{ count }}</button>
</template>

<style scoped>
button {
  font-weight: bold;
}
</style>
```

这段代码分为三部分：

**`<script setup>`**

- Vue 3 的组合式 API 新语法。
- `ref(0)` 声明一个响应式变量 count，初始值为 0。
- `count++` 表示点击按钮后变量加 1。

**`<template>`**

- 页面结构部分。
- `@click="count++"` 监听点击事件，点击时 count 增加。
- `{{ count }}` 是模板插值，展示当前的值。

**`<style scoped>`**

- `scoped` 表示这个样式只作用于当前组件。
- 这里让按钮加粗。

:::tip

Vue 的构建工具会自动处理这三部分，让你可以在一个文件中集中写好一个组件的功能。

:::

## 🧩 二、选项式 API（Options API） ##

选项式 API 是 Vue 2 和 Vue 3 都支持的写法，*通过配置对象来组织组件逻辑*，更符合面向对象的思维方式。

下面是用选项式 API 实现的计数器：

```vue
<script>
export default {
  // data 函数返回组件的响应式数据
  data() {
    return {
      count: 0 // 初始化计数器
    }
  },

  // methods 是一组可以被模板调用的函数
  methods: {
    increment() {
      this.count++ // 修改响应式数据
    }
  },

  // mounted 是生命周期钩子之一
  mounted() {
    console.log(`组件已挂载，初始值是 ${this.count}`)
  }
}
</script>

<template>
  <button @click="increment">Count is: {{ count }}</button>
</template>
```

**✅ 逐行解释**

|  行号   |      代码  |    解释  |
| :-----------: | :-----------: | :-----------: |
| 1 | `<script>` | JS 逻辑部分开始 |
| 2 | `export default { ` | 导出一个 Vue 组件对象 |
| 3~6 | `data() { return { count: 0 }}` | 定义响应式数据 count，初始值为 0 |
| 8~11 | `methods: { increment() { ... }}` | 定义方法 increment，当按钮点击时调用 |
| 13~15 | `mounted() { ... }` | 生命周期钩子：组件挂载后触发 |
| 18 | `<template>` | HTML 模板开始 |
| 19 | `<button @click="increment">...</button>` | 绑定点击事件，调用 increment 方法 |
| 20 | `</template>` | 模板结束 |

**✨ 特点**

- 更适合初学者，逻辑清晰。
- 所有状态、方法、生命周期钩子集中在一个对象里

## 🧬 三、组合式 API（Composition API） ##

组合式 API 是 Vue 3 推出的新特性，*用函数来组合逻辑，更灵活、更适合大型项目*。

来看一段用组合式 API 改写的同样功能：

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 定义响应式变量
const count = ref(0)

// 定义事件处理函数
function increment() {
  count.value++ // 注意：ref 类型需要 .value 才能取值
}

// 生命周期钩子：组件挂载时触发
onMounted(() => {
  console.log(`组件已挂载，初始 count 是：${count.value}`)
})
</script>

<template>
  <button @click="increment">Count is: {{ count }}</button>
</template>
```

**✅ 每行拆解解释**

|  行号   |      代码  |    说明  |
| :-----------: | :-----------: | :-----------: |
| 1 | `<script setup>` | 使用组合式语法糖，简洁高效 |
| 2 | `import { ref, onMounted } from 'vue'` | 引入响应式和生命周期 API |
| 4 | `const count = ref(0)` | 创建一个响应式变量 count，初始为 0 |
| 7 | `function increment() { ... }` | 定义点击按钮时执行的函数 |
| 8 | `count.value++` | 修改响应式变量值，必须使用 `.value` |
| 11 | `onMounted(() => { ... })` | 注册组件挂载后的钩子函数 |
| 12 | `console.log(...)` | 输出当前值，验证逻辑是否生效 |
| 16~18 | `<template>...</template>` | 渲染 HTML 模板，按钮展示 count 值并绑定事件 |

## 💡 Options API vs Composition API 的区别 ##

|  比较点   |      选项式 API  |    组合式 API  |
| :-----------: | :-----------: | :-----------: |
| 组织方式 | 通过对象的形式（data/methods） | 通过函数逻辑组合 |
| 学习曲线 | 更低，适合入门 | 更灵活，适合大型项目 |
| 可读性 | 小型组件清晰 | 多逻辑时需手动分组 |
| 逻辑复用 | 依赖 mixins，易冲突 | 可以通过 hooks 重用，逻辑更清晰 |
| 调试体验 | this 不易追踪 | 变量作用域明确，调试友好 |

:::tip

Vue 官方推荐：小项目/渐进式使用 => Options API；构建大型 SPA 应用 => Composition API。

:::
