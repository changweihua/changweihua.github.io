---
lastUpdated: true
commentabled: true
recommended: true
title: 如何在UnoCSS中使用动态生成的className名称
description: 如何在UnoCSS中使用动态生成的className名称
date: 2024-08-01 13:18:00
pageClass: blog-page-class
---

# 如何在UnoCSS中使用动态生成的className名称 #

在使用UnoCSS时，如果您有动态生成的类名（例如，通过JavaScript生成的类名），可以通过以下几种方法来处理：

## 使用安全列表（Safelist） ##

`UnoCSS`允许您通过配置`uno.config.ts`文件中的`safelist`选项，提前声明那些动态生成的类名，以确保它们在最终的CSS中被包含。

```typescript
import { defineConfig } from 'unocss'

export default defineConfig({
  safelist: [
    'text-red-500',
    'bg-blue-300',
    // 添加所有可能的动态类名
  ],
})
```

## 使用动态类名构建函数 ##

如果类名是通过某种模式动态生成的，可以使用函数生成所有可能的类名，并添加到安全列表中。例如，如果有一组颜色和尺寸的组合：

```typescript
import { defineConfig } from 'unocss'

const colors = ['red', 'blue', 'green']
const sizes = ['100', '200', '300']

const dynamicClasses = colors.flatMap(color => sizes.map(size => `bg-${color}-${size}`))

export default defineConfig({
  safelist: [
    ...dynamicClasses,
    // 其他类名
  ],
})
```

## 使用`apply`指令 ##

在使用动态类名时，也可以通过UnoCSS的@apply指令来处理。在CSS中：

```css
.custom-button {
  @apply bg-blue-500 text-white p-2;
}
```

这样，您可以将动态生成的类名集中管理在CSS文件中，而不是直接在HTML或JS文件中动态生成。

## 条件渲染和模板字符串 ##

如果在React、Vue等框架中，可以使用模板字符串和条件渲染来生成类名：

```react
const color = 'red'
const size = '500'

return (
  <div className={`bg-${color}-${size} p-4`}>
    动态类名示例
  </div>
)
```

```vue
<template>
  <div :class="`bg-${color}-${size} p-4`">
    动态类名示例
  </div>
</template>

<script>
export default {
  data() {
    return {
      color: 'blue',
      size: '300'
    }
  }
}
</script>
```

## 使用插件支持动态类名 ##

一些UnoCSS的插件可能提供更高级的动态类名处理功能，您可以根据具体需求查阅UnoCSS插件文档，寻找适合的解决方案。

> 通过上述方法，您可以有效地处理动态生成的类名，并确保这些类名在最终的CSS中被正确应用。根据项目的复杂程度和具体需求，可以选择最适合的方式进行配置和处理。
