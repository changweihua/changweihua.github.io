---
lastUpdated: true
commentabled: true
recommended: true
title: 🔍 当 `<a-menu>` 遇上 `<template>`
description: 一个容易忽视的菜单渲染陷阱
date: 2025-09-19 10:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

在使用 Ant Design Vue（简称 antd-vue）开发后台管理系统或导航菜单时，`<a-menu>` 是一个非常常用的组件。尤其是搭配 `<a-sub-menu>` 实现多级可展开菜单，能够很好地组织页面导航结构。

但在最近的一次开发中，我遇到了一个奇怪的 Bug：*​原本正常的多级菜单，仅仅因为在外层多加了一层 `<template>` 并加上了 `v-for` 和 `key`，就出现了“点击一个父菜单，所有父菜单都展开；收缩一个，所有都收缩” 的异常行为。​​*

经过排查，我发现这个问题的根源，竟然和我们习以为常的 `<template>` 标签使用方式有关。

本文将通过【问题复现】→【原因分析】→【解决方案】→【原理剖析】→【最佳实践】的思路，带你彻底理解这个“看似简单却容易踩坑”的菜单渲染问题。

## 一、问题现象：加了 `<template>`，菜单就“群魔乱舞”了 ##

**菜单结构大致是这样的**

- 有多个“多级菜单”（即 `<a-sub-menu>` ），每个母菜单下有若干子菜单项（ `<a-menu-item>` ）；
- 为了循环渲染这些菜单项，我使用了 `v-for`，并且为了给每个循环项加唯一 `key`，我把 `<a-sub-menu>` 包在了一个 `<template>` 里，像这样：

```vue
<template v-for="item in filteredPanelsInfo" :key="item.key">
  <a-sub-menu :key="item.key" v-if="item.children && item.children.length > 0">
    <template #title>
      <span>
        <component :is="item.icon" />
        {{ item.key }}
      </span>
    </template>
    <a-menu-item v-for="subItem in item.children" :key="subItem.route">
      {{ subItem.label }}
    </a-menu-item>
  </a-sub-menu>
</template>
```

乍一看，代码很“规范”：用了 `v-for`，加了 `:key`，结构清晰。但实际运行时，却出现了非常诡异的现象：

> 🚨 ​点击某一个父级菜单（Sub Menu），所有的父级菜单都展开了；收缩一个，所有都收缩了。​​

而当我把外层的 `<template>` 去掉，让 `<a-sub-menu>` 直接作为 `v-for` 的渲染主体时，菜单行为就完全正常了！​​

## 二、为什么加了 `<template>` 就出 Bug 了？ ##

**初步猜想：是 Vue 的问题？还是 Ant Design Vue 的问题？**

很多人可能会第一时间怀疑：是不是 Vue 的 `<template>` 标签用错了？或者 Ant Design Vue 的 `<a-menu>` 对嵌套结构有特殊要求？

实际上，*​这并不是 Vue 或 a-menu 的“官方 bug”*​，而是我们在使用 `<template>` + `v-for` 时，*​无意中影响了 Ant Design Vue 对菜单结构的解析，导致它误判了哪些是“可展开的子菜单”*​。

## 三、核心问题解析：`<template>` 不是“透明”的！ ##

虽然 `<template>` 标签*不会渲染到真实的 DOM 中*，但它在 Vue 的模板编译和虚拟 DOM Diff 过程中，扮演了重要角色 —— 它是一个*逻辑容器*，用于包裹一组元素，常见于 `v-for` 或 `v-if` 的分组。

**但！对于像 `<a-menu>` 这种组件来说：**

> ​它并不关心你的 DOM 结构长啥样，它关心的是：哪些元素是 `<a-sub-menu>`，哪些是 `<a-menu-item>`，以及它们的嵌套关系是否正确。​​

当你把 `<a-sub-menu>` 包在一个额外的 `<template>` 里时，虽然视觉上、结构上看起来“没问题”，但对 Ant Design Vue 的 Menu 组件来说，它可能：

- 无法正确识别每一个 `<a-sub-menu>` 的唯一性和独立性；
- 误认为多个 `<a-sub-menu>` 是同一层级、共享展开状态的“分组”；
- 最终导致：你点击一个菜单标题，所有菜单都响应；收起一个，所有都收起。

## 四、正确 vs 错误写法对比 ##

**❌ 错误写法（加了外层 `<template>`，导致菜单行为异常）**

```vue
<template v-for="item in filteredPanelsInfo" :key="item.key">
  <a-sub-menu :key="item.key" v-if="item.children && item.children.length > 0">
    <template #title>
      <span>
        <component :is="item.icon" />
        {{ item.key }}
      </span>
    </template>
    <a-menu-item v-for="subItem in item.children" :key="subItem.route">
      {{ subItem.label }}
    </a-menu-item>
  </a-sub-menu>
</template>
```

> ✅ 看起来没问题，`v-for` + `:key` 都有，结构也清晰。
> ❌ 但实际上，外层的 `<template>` 让 Ant Design Vue 误判了子菜单的独立性，导致展开/收起行为“集体化”。

**✅ 正确写法（直接 v-for `<a-sub-menu>`，不加多余 template）**

```vue
<a-sub-menu
  v-for="item in filteredPanelsInfo"
  :key="item.key"
  v-if="item.children && item.children.length > 0"
>
  <template #title>
    <span>
      <component :is="item.icon" />
      {{ item.key }}
    </span>
  </template>
  <a-menu-item v-for="subItem in item.children" :key="subItem.route">
    {{ subItem.label }}
  </a-menu-item>
</a-sub-menu>
```

- ✅ 去掉了外层的 `<template>`，让每一个 `<a-sub-menu>` 都直接作为 `<a-menu>` 的子节点存在。
- ✅ Ant Design Vue 能正确识别每一个子菜单的独立状态，展开/收起互不干扰。

## 五、深入原理：为什么 `<template>` 会影响 Menu 的行为？ ##

Ant Design Vue 的 `<a-menu>` 内部实现了一套菜单状态管理机制，用来控制：

- 哪些 `<a-sub-menu>` 当前是展开的（openKeys）；
- 哪些菜单项是选中的（selectedKeys）；
- 如何渲染嵌套的子菜单结构。

**它的这套逻辑依赖于**：

- **​正确的组件树结构**​：即 `<a-sub-menu>` 必须直接作为 `<a-menu>` 的子节点出现，且每个 `<a-sub-menu>` 都有唯一的 `key`；
- **​稳定的节点标识**​：Vue 在 diff 时，通过 `key` 来识别每一个子菜单项，如果外层套了无意义的 `<template>`，虽然不影响 DOM，但可能干扰 Vue 对“节点身份”的判定；
- **​菜单组件自身的逻辑判断**​：它并不过滤掉 `<template>`，但它会按顺序解析子节点，如果发现“多个子菜单没有明确独立包裹”，可能会错误关联它们的展开状态。

**简而言之**：

> ​Ant Design Vue 的 Menu 组件依赖于你提供清晰的、结构化的子菜单节点。如果你在中间无意义地包裹了一层 `<template>`，就可能让它“看不懂”你的菜单结构，从而导致状态混乱。​​

## 六、最佳实践与建议 ##

### ✅ 推荐做法 ###

- 当你使用 `<a-menu>` + `<a-sub-menu>` + `v-for` 时，​让 `<a-sub-menu>` 直接作为 `v-for` 的渲染对象，不要额外包裹无作用的 `<template>`；
- 如果你一定要用 `<template>`（比如为了在循环里加额外逻辑或插槽），确保它不会破坏 `<a-sub-menu>` 的独立性和语义结构；
- 始终为 `<a-sub-menu>` 提供唯一的 `:key`，并确保 `v-for` 直接作用在菜单组件上；
- 如果遇到菜单展开/收起“集体响应”的诡异现象，优先检查：是否有多余的 `<template>` 包裹了 `<a-sub-menu>`。

### ⚠️ 注意事项 ###

- `<template>` 不会渲染到 DOM，但 Vue 依然会处理它的子节点结构；
- Ant Design Vue 的菜单组件对子节点结构敏感，不要依赖“看起来没问题”的写法；
- 如果你不确定结构是否正确，可以简化代码、逐步排查，或者参考官方示例写法。

## 七、总结 ##

一个小小的 `<template>`，竟然能引发菜单展开/收起行为的“集体异常”，这背后反映的正是我们对“组件结构语义”和“框架内部实现机制”的理解不足。

作为开发者，我们不仅要写出能跑的代码，更要写出 **​框架能正确理解、用户能稳定使用**​ 的代码。在遇到类似“样式没问题、数据没问题，但交互就是诡异”的问题时，不妨回归组件本身的设计意图，检查节点结构、包裹逻辑和 key 的使用方式。
