---
lastUpdated: true
commentabled: true
recommended: true
title: 🍐 Vue3 优雅的二次封装组件！
description: 🍐 Vue3 优雅的二次封装组件！
date: 2025-10-31 13:40:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 背景 ##

在实际开发中，我们常常基于成熟的 UI 组件库（如 Ant Design Vue）进行二次封装，以统一交互风格、增强复用性或加入业务逻辑。本文将通过具体示例，逐步演示如何封装一个带有插槽的输入框组件，并介绍两种常见的插槽处理方式。

## 直接使用组件库的组件 ##

我们先从最基础的使用方式开始，假设我们已经封装了一个 `ElInput` 组件，模拟了 Ant Design Vue 的 Input 功能，并使用了 `v-model` 与命名插槽。

### 创建 ElInput 组件 ###

```vue:ElInput.vue
<!-- ElInput.vue -->
<script setup lang="ts">
const model = defineModel();
</script>

<template>
  <slot name="prefix" msg="hello"></slot>
  <div><input v-model="model" /></div>
  <slot name="suffix" msg="world"></slot>
</template>
```

这个组件暴露了两个插槽：`prefix` 和 `suffix`，并将一些数据（如 `msg`）通过 `slot props` 传递给外部。

### 使用该组件 ###

:::preview ElInput.vue

demo-preview=@demo/App0.vue

:::

> 插槽（slot）是 Vue 中用于内容分发的重要机制。推荐阅读 [Vue 插槽官方文档](https://cn.vuejs.org/guide/components/slots.html)以深入了解。

## 二次封装组件的两种方式 ##

如果我们希望在中间再封装一层组件（例如 `ElInputWrap.vue`），并将插槽“透传”到内部组件，我们可以通过以下两种方式实现：

### 方法一：通过遍历 `$slots` 实现插槽透传 ###

此时 `App0.vue` 不再直接使用 `ElInput`，而是通过中间组件 `ElInputWrap` 进行调用。我们注意到，先前使用时存在两个具名插槽 `prefix` 和 `suffix`，目标是在 `ElInputWrap` 中通过遍历 `$slots`，动态地将这些插槽渲染出来，并通过 `<slot>` 标签完成内容透传。

```vue:ElInputWrap.vue
<!-- ElInputWrap.vue -->
<template>
  <div>
    <h1>我是二次封装的组件</h1>
    <ElInput>
      <template v-for="(_, slotName) in $slots" #[slotName]="props">
        <slot :name="slotName" v-bind="props" />
      </template>
    </ElInput>
  </div>
</template>

<script setup lang="ts">
import ElInput from "./ElInput.vue";

// 提取插槽类型以获得更好的 TS 支持
type ElInputSlots = InstanceType<typeof ElInput>["$slots"];
defineSlots<ElInputSlots>();
</script>
```

这种方式通过遍历 `$slots` 动态渲染命名插槽，实现了插槽的“透传”。它简单直观，适合大多数场景。

:::preview App.vue || 方法一

demo-preview=@demo/App1.vue

:::

### 方法二：使用 `component` 和 `h` 函数组合动态渲染 ###

`h` 函数会创建一个虚拟 DOM 节点（VNode），而 `<component :is="...">` 可以接收这个 VNode，进而动态渲染对应的组件。

这是因为 Vue 3 中的 `<component>` 实际上会解析 `is` 属性传入的值，无论是组件构造、字符串标签，还是 VNode，都能动态处理并正确挂载。这样做的好处是，你可以通过 `h()` 动态组合组件的类型、props 和插槽，然后统一交给 `<component>` 渲染，实现更灵活的组件封装方式。

```vue:ElInputWrap.vue
<!-- ElInputWrap.vue -->
<template>
  <div>
    <h1>我是二次封装的组件</h1>
    <component :is="h(ElInput, $attrs, $slots)"></component>
  </div>
</template>

<script setup lang="ts">
import { h } from "vue";
import ElInput from "./ElInput.vue";

// 从 ElInput 的类型中提取插槽类型
type ElInputSlots = InstanceType<typeof ElInput>["$slots"];

// 定义 ElInputWrap 的插槽类型与 ElInput 一致
defineSlots<ElInputSlots>();
</script>
```

:::preview App.vue || 方法二

demo-preview=@demo/App2.vue

:::

**为什么要这样做？**

- `h` 函数可以让你动态构造组件的 VNode，并手动注入 `props`、`attrs` 和 `slots`
- `<component :is="...">` 支持动态组件加载
- 当你需要进一步“控制渲染逻辑”或做更底层的封装（例如和渲染函数结合）时，这种方式更具灵活性。

## 总结 ##

本文介绍了如何通过两种方式对组件库中的组件进行二次封装，重点解决了“插槽透传”的问题：

- **遍历 `$slots`**： 简单直观，适用于大多数命名插槽场景；
- **使用 `h + component`：**适用于更灵活、更底层的封装需求。

在实际项目中，我们建议优先使用第一种方式，清晰、易维护；在遇到复杂需求或需要动态渲染组件时，可考虑第二种方式。
