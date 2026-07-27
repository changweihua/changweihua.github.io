---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 深度选择器（:deep）完全指北
description: 从“能用”到“用好”
date: 2025-09-22 12:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 一句话先上车 ##

> 只要你在 `<style scoped>` 里写过 `.a >>> .b`、 `/deep/ .b` 或者 `::v-deep .b`，今天这篇文章都能帮你把它们一次性捋成 *Vue 3 官方推荐*的 `:deep()`，并学会“什么时候必须穿透、什么时候最好忍住”。

## 为什么会有“深度选择器”？ ##

Vue 的 `scoped CSS` 通过给节点打 `data-v-hash` 属性实现样式隔离。

### 编译前 ###

```vue
<style scoped>
.title { color: red; }
</style>
```

### 编译后（近似） ###

```css
.title[data-v-7ba5bd90] { color: red; }
```

子组件内部的 DOM *不会* 带这个属性，于是父组件的样式天然“够不到”子组件内部。

> *深度选择器就是告诉编译器：“这一段别给我加属性限制，我要穿墙！”*

## 语法全家福（Vue 2 → Vue 3 演进） ##

|  版本   |  官方推荐  |  旧写法/别名  |  备注  |
| :-----------: | :-----------: | :-----------: | :-----------: |
| Vue 2.6+ | `::v-deep` | `/deep/`、`>>>` | `/deep/` 在 css-loader 4+ 已废弃；`>>>` 原生 CSS 语法，但 sass 会报错 |
| Vue 3.x | `:deep(<inner-selector>)` | `::v-deep` 仍向下兼容 | 函数式写法，与 W3C 草案对齐，未来最安全 |

本文后续统一用 Vue 3 写法演示，记住这一个就够：

```css
.a :deep(.b) { /* 样式 */ }
```

## 最小可运行示例 ##

```vue
<template>
  <!-- 第三方组件 -->
  <el-button class="my-btn">默认按钮</el-button>
</template>

<style scoped>
/* 把 el-button 内部原生 span 的字号改成 20px */
.my-btn :deep(span) {
  font-size: 20px;
}
</style>
```

**编译后（近似）**

```css
.my-btn[data-v-7ba5bd90] span {
  font-size: 20px;
}
```

属性值只加在 `.my-btn` 上，不再限制 `span`，于是成功“穿墙”。

## 预处理器避坑速查 ##

|  预处理器   |  `>>>`  |  `/deep/`  |  `::v-deep`  |  `:deep()`  |
| :-----------: | :-----------: | :-----------: | :-----------: | :-----------: |
| sass/scss | ❌ 直接报错 | ❌ 被废弃| ✅ | ✅（最推荐） |
| less | ⚠️ 警告 | ✅ | ✅ | ✅ |
| stylus | ✅ | ✅ | ✅ | ✅ |

> 结论：无论团队用哪种预处理器，直接写 `:deep()` 永远不会踩坑。

## 进阶 5 连问 ##

### 能写多个层级吗？ ###

```css
.a :deep(.b .c) { color: red; }
```

可以，编译后只会给 `.a` 加属性，`.b` `.c` 保持原样。

### 伪类、伪元素行不行？ ###

```css
.a :deep(.b:hover) { }
.a :deep(.b::before) { }
```

行，放心写。

### 可以动态拼接吗？ ###

```css
.a :deep(.${dynamicClass}) { }
```

不行！ 编译阶段静态分析，只能写死。

### 想同时改自身 + 内部？ ###

```css
.a,
.a :deep(.b) {
  color: red;
}
```

完全 OK，选择器列表里每一项独立处理。

### 深度选择器会降低性能吗？ ###

编译后只是多了一条属性选择器，*运行期无差异*。

真正影响的是“滥用”导致样式耦合、可维护性下降。

## 实战：3 个最容易想起“深度选择器”的场景 ##

|  场景   |  思路  |  示例  |
| :-----------: | :-----------: | :-----------: |
| 覆盖第三方组件 | 直接 deep | `.my-dialog :deep(.el-dialog__header) { background: #409eff; }` |
| 递归树/菜单 | 统一改第 N 级 | `.tree :deep(.tree-node-3) { font-weight: bold; }` |
| teleport 到 body 的弹层 | 父组件 `scoped` 够不到 | `.trigger-wrapper :deep(.dropdown) { z-index: 3000; }` |

## 设计原则：先忍住，再穿透 ##

**能用 `props/class/插槽` 就别 `deep`**

子组件自己暴露 header-class、body-style 是最安全的契约。

**deep 只改“视觉”不改“结构”**

只动颜色、间距、字体；别碰定位、布局，防止组件升级 DOM 结构后炸掉。

**统一文件或统一前缀**

团队约定所有 deep 样式集中放在 `xxx.overrides.vue` 或统一加 `.override--` 前缀，方便全局搜索、后续剔除。

## 一键替换老代码的正则小技巧 ##

**VSCode 全局替换**

搜索：`/deep/\s+`

替换：`:deep(`

再手动补右括号 `)`，即可把 Vue 2 老项目批量升级成 Vue 3 语法。

## 总结口诀 ##

> scoped 想穿墙，
> Vue 3 用 `:deep()` 一行；
> 伪类伪元素都接得住，
> 动态拼接会泡汤；
> 先 props 后 deep，
> 维护起来不迷茫。
