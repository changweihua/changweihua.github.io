---
lastUpdated: true
commentabled: true
recommended: true
title: UnoCSS Group
description: 像搭积木一样管理你的原子化样式
date: 2026-01-29 13:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 写在前面：当原子化样式遇上"收纳盒" ##

在原子化 CSS 的世界里，每个样式类如同散落的乐高积木，虽然灵活却容易堆积成山。

UnoCSS 的 **Group** 功能就像一个智能收纳盒，通过 *()括号魔法* 将关联样式模块化封装，既保留原子化的灵活性，又赋予代码结构化美感。

今天我们将通过真实场景解析这项革命性特性。

## 一、核心机制解析 ##

### 语法解析原理 ###

Group 本质上是通过 *括号语法* 将多个原子类关联到同一状态或场景：

:::demo

```vue
<template>
<!-- 传统写法 -->
<div class="hover:bg-gray-400 hover:font-medium hover:text-red-500"></div>

<!-- Group 写法 -->
<div class="hover:(bg-gray-400 font-medium text-red-500)"></div>
</template>
```

:::

编译后自动展开为多个独立类，相当于给多个样式元素添加统一的状态前缀。

### 与 Attributify 的化学反应 ###

结合属性化预设，实现 *双重结构化*：

:::demo

```vue
<template>
<!-- 原始原子化写法 -->
<button class="text-sm font-mono p-y-2 p-x-4 hover:bg-blue-500 hover:text-white"></button>

<!-- Group + Attributify 融合写法 -->
<button 
  text="sm mono"
  p="y-2 x-4"
  hover="bg-blue-500 text-white"
></button>
</template>
```

:::

通过属性分组显著提升语义化表达。

## 二、实战应用场景 ##

### 场景 1：复杂交互按钮 ###

**需求**：实现按钮的悬浮/聚焦/禁用多状态联动

:::demo

```vue
<template>
<button
    class="group transition-all duration-300
           hover:(scale-105 shadow-lg)
           focus:(outline-none ring-2 ring-blue-500)
           disabled:(opacity-50 cursor-not-allowed)"
  >
    <span class="group-hover:text-cyan-500">点击触发魔法</span>
  </button>
</template>
```

:::

**效果说明**：

- `group-()` 创建作用域，内部元素共享状态
- `hover/focus` 状态触发缩放与阴影
- `disabled` 状态降低透明度
- 嵌套元素使用 `group-hover:` 继承状态

### 场景 2：响应式表单布局 ###

**需求**：移动端折叠/PC 端平铺的弹性布局

:::demo

```vue
<template>
<div class="flex flex-col gap-2 md:(flex-row items-center)">
  <input class="w-full md:(w-auto flex-1) border">
  <button class="md:(ml-2)">提交</button>
</div>
</template>
```

:::

编译结果：

```css
@media (min-width: 768px) {
  .md\:flex-row { flex-direction: row; }
  .md\:items-center { align-items: center; }
  .md\:w-auto { width: auto; }
  /* ...其他响应式规则 */
}
```

### 场景 3：动态主题切换 ###

结合自定义规则实现主题系统：

```ts:uno.config.ts
rules: [
  
[
    /^theme-([a-z]+)-([a-z]+)$/, // 限制匹配格式
    ([, mode, color]) => ({
      'background-color': `rgb(var(--theme-${mode}-bg-${color}))`,
      'color': `rgb(var(--theme-${mode}-text-${color}))`
    }),
    { autocomplete: 'theme-(dark|light)-(primary|secondary)' } // 增强 IDE 提示
  ]

]
```

:::demo

```vue
<template>
<div class="theme-dark-primary theme-light-secondary">自适应主题</div>
</template>
```

:::

## 三、工程化配置指南 ##

### 启用必要插件 ###

```ts:uno.config.ts
import { defineConfig, transformerVariantGroup } from 'unocss'

export default defineConfig({
  transformers: [
    transformerVariantGroup(), // 启用 Group 转换器
  ],
  presets: [
    // 建议搭配 Attributify 使用
    presetAttributify({ /* 参数配置 */ })
  ]
})
```

注意事项：

- Vite 项目直接引入插件即可
- Webpack 项目需额外配置 PostCSS 插件

### 解决 TS 类型报错 ###

创建类型声明文件：

```ts:shims.d.ts
declare module '@unocss/core' {
  interface VariantHandler {
    selector?: string
  }
}
```

### 性能优化建议 ###

通过作用域隔离避免过度嵌套：

:::demo

```vue
<template>
<!-- 反例：过度嵌套影响可读性 -->
<div class="lg:(hover:(dark:(bg-black text-white)))"></div>

<!-- 正例：分层管理 -->
<div 
  class="lg:hover:dark:bg-black 
        lg:hover:dark:text-white">
</div>
</template>
```

:::

## 四、创新应用扩展 ##

### 动画序列编排 ###

:::demo

```vue
<template>
<div class="animate-(ping delay-300 duration-1000)"></div>
</template>
```

:::

等效于：

```css
.animate-ping { animation: ping 1s linear; }
.animate-delay-300 { animation-delay: 300ms; }
.duration-1000 { animation-duration: 1000ms; }
```

### 图标状态联动 ###

结合 Iconify 实现动态图标：

:::demo

```vue
<template>
<button class="i-mdi:heart hover:(i-mdi:heart-outline text-red-500)">
</button>
</template>
```

:::

### 深色模式快捷切换 ###

:::demo

```vue
<template>
<div class="dark:(bg-gray-800 border-gray-700) transition-colors">
  <p class="dark:text-gray-300">夜间模式文本</p>
</div>
</template>
```

:::

## 五、最佳实践总结 ##

- 作用域控制：用 `group-*` 限定影响范围
- 响应式优先：将断点修饰符放在括号外 `md:(...)`
- 语义化命名：配合自定义 Shortcuts 创建业务语义类
- 状态隔离：避免在 Group 内混用不同状态前缀
- 性能监控：定期检查生成的 CSS 文件体积

避坑指南：

> 嵌套超过 3 层时考虑重构
> 避免在 Group 内使用 `!important`
> 动态类名需用方括号转义：`hover:([bg-#123456])`

通过 Group 功能，我们实现了从 "*样式碎片*" 到 "*模块化样式单元*" 的进化。正如乐高大师用分类盒管理零件，UnoCSS Group 让原子化开发既保持灵活度，又拥有工程化的秩序之美。
