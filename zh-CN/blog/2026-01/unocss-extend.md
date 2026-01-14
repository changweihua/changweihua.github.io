---
lastUpdated: true
commentabled: true
recommended: true
title: UnoCSS 自定义规则进阶
description: UnoCSS的5种扩展方式
date: 2026-01-14 11:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 前言 ##

在电商中台项目中，我们通过扩展 `UnoCSS` 实现了商品卡片样式动态化、营销组件快速迭代等需求。今天我们将结合真实业务场景，演示5种扩展方式的最佳实践。

## 一、动态规则生成器（Dynamic Rules） ##

### 场景案例：商品价格标签组件 ###

**业务需求**：根据促销类型动态生成边框样式（常规/秒杀/预售）

```typescript:unocss.config.ts
const dynamicPriceTagRules: DynamicRule[] = [
  [/^price-tag-(normal|flash|presale)$/, ([, type]) => ({
    'border-width': '2px',
    'border-style': type === 'flash' ? 'dashed' : 'solid',
    'border-color': `var(--color-${type})`,
    'background': `linear-gradient(to bottom, var(--color-${type}-bg) 0%, #fff 100%)`
  })]
]
```

### 商品卡片组件使用示例 ###

:::demo

```vue
<template>
  <div 
    class="price-tag-presale" 
    v-if="product.saleType === 'PRESALE'"
  >
    ¥ {{ product.price }}
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'

const product = reactive({
  saleType: 'PRESALE',
  price: 100
})
</script>
```

:::

**实现逻辑**：

- 正则匹配促销类型关键字
- 根据类型返回对应渐变背景和边框样式
- 与业务组件状态联动，避免硬编码样式

## 二、静态规则扩展（Static Rules） ##

### 场景案例：统一表单控件样式 ###

**业务需求**：保持历史样式同时过渡到新设计系统

```typescript
// 旧版表单样式迁移
const legacyFormRules = {
  'old-input': 'border-1 border-gray-300 rounded-sm px-2 py-1',
  'old-select': 'bg-gray-50 border-1 border-gray-300 rounded-sm'
} as const

// 新版表单样式扩展
export default defineConfig({
  rules: [
    ['modern-input', {
      '@apply': 'border-2 border-primary rounded-md px-3 py-2',
      'transition': 'all 0.2s ease-in'
    }],
    ...Object.entries(legacyFormRules).map(([key, value]) => [key, { '@apply': value }])
  ]
})
```

### 渐进式迁移使用示例 ###

:::demo

```vue
<template>
  <!-- 旧版页面保持原有class -->
  <input class="old-input" v-if="isLegacyPage">
  
  <!-- 新版使用现代样式 -->
  <input class="modern-input" v-else>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const isLegacyPage = ref(true)
</script>
```

:::

**优势对比**：

- 旧规则：使用固定颜色和细边框
- 新规则：采用主色系和过渡动画，符合现代设计趋势

## 三、Shortcuts智能组合 ##

### 场景案例：通用按钮组件库 ###

**业务需求**：统一管理6种按钮状态和3种尺寸样式

```typescript
// 按钮快捷组合
const buttonShortcuts: Shortcut[] = [
  ['btn-base', 'font-sans transition-colors duration-150 focus:outline-none'],
  ['btn', 'btn-base inline-flex items-center justify-center'],
  ['btn-sm', 'btn px-3 py-1.5 text-sm rounded-md'],
  ['btn-md', 'btn px-4 py-2 text-base rounded-lg'],
  ['btn-primary', 'bg-blue-600 hover:bg-blue-700 text-white']
]
```

### 营销按钮使用示例 ###

:::demo

```vue
<template>
  <button class="btn-md btn-primary">
    <slot>立即抢购</slot>
  </button>
</template>
```

:::

**组合逻辑**：

- `btn-base` 定义基础交互样式
- `btn` 添加布局特性
- 尺寸和颜色通过组合实现正交性

## 四、自定义Transformers ##

### 场景案例：迁移BEM样式遗产代码 ###

**业务需求**：将旧项目的BEM样式转换为原子类

```typescript
// BEM转换器配置
export const bemTransformer: Transformer = {
  name: 'bem',
  enforce: 'pre',
  transform(code) {
    return code.replace(/(block)--(modifier)/g, 'block-modifier_$2')
              .replace(/(block)__(element)/g, 'block_$2')
  }
}
```

### 转换前后对比 ###

```html
<!-- 原BEM写法 -->
<div class="product-card--discount">
  <div class="product-card__price"></div>
</div>

<!-- 转换后Unocss可识别的原子类 -->
<div class="product-card-discount">
  <div class="product-card_price"></div>
</div>
```

**适配策略**：

- 将 `--modifier` 转换为 `-modifier_` 前缀
- 将 `__element` 转换为 `_element` 格式
- 配合预设规则匹配转换后的类名

## 五、Preset混合扩展 ##

### 场景案例：跨项目复用数据大屏主题 ###

**业务需求**：在3个数据可视化项目中共享大屏专用样式

```typescript:data-screen.preset.ts
export const dataScreenPreset: Preset = {
  rules: [
    [/^ds-text-(\d+)$/, ([, size]) => ({ 
      'font-size': `${size}px`,
      'line-height': `${Number(size)*1.2}px` 
    })],
    ['ds-gradient-bg', {
      'background': 'linear-gradient(135deg, var(--ds-primary) 0%, #1a237e 100%)'
    }]
  ],
  shortcuts: {
    'ds-card': 'ds-gradient-bg rounded-xl p-6 backdrop-blur-lg'
  }
}
```


### 大屏项目统一配置 ###

```ts:unocss.config.ts
export default defineConfig({
  presets: [
    dataScreenPreset,
    presetAttributify()
  ]
})
```

### 大屏卡片组件应用 ###

:::demo

```vue
<template>
  <div class="ds-card ds-text-24">
    <h3>实时访问量</h3>
    <div class="ds-text-48">1,234</div>
  </div>
</template>
```

:::

## 踩坑记录及解决方案 ##

### 问题1：动态规则生成冗余CSS ###

**现象**：促销活动结束后，未使用的动态样式仍存在于CSS中

**解决方案**：配置 safelist 强制保留关键规则

```typescript:unocss.config.ts
export default defineConfig({
  safelist: [
    ...['normal', 'flash', 'presale']
      .map(type => `price-tag-${type}`)
  ]
})
```

### 问题2：Shortcuts循环引用 ###

**错误示例**：

```typescript
// 错误配置导致构建失败
shortcuts: [
  ['btn', 'btn-primary'], // 循环引用
  ['btn-primary', 'btn']
]
```

**正确方案**：建立单向依赖层级

```typescript
shortcuts: [
  ['btn-base', 'px-4 py-2 rounded'], // 基础层
  ['btn-primary', 'btn-base bg-blue-600'], // 主题层
  ['btn-large', 'btn-primary px-6 py-3'] // 扩展层
]
```

## 结语 ##

在数据可视化平台项目中，通过合理应用这5种扩展方式：

- 减少样式开发时间约35%
- 使CSS文件体积下降42%（从218KB降至126KB）
- 实现跨5个子系统的样式统一管理

> 响应式布局与暗黑模式深度实现

## 写在前面：当传统CSS遇上现代需求 ##

"为什么我的页面在手机端显示错位？"、"用户深夜使用刺眼怎么办？"——这些前端开发高频痛点，本质上都是*动态样式控制*的命题。传统CSS面对响应式布局需要编写大量媒体查询，处理暗黑模式需要维护多套主题变量，而UnoCSS通过原子化思维和运行时动态生成能力，让这些需求变得像搭积木般简单。

今天咱们就手把手实现这两个高频场景，看看如何用UnoCSS让样式代码既优雅又高效。

## 一、响应式布局的原子化革命 ##

### 断点系统的本质解构 ###

传统方案需要手动编写媒体查询：

```css
/* 旧时代写法 */
@media (min-width: 768px) {
  .container { padding: 2rem; }
}
```

在UnoCSS生态中，只需通过预设的断点前缀即可实现：

```vue
<!-- 现代原子化方案 -->
<template>
  <div class="p-4 md:p-8 xl:p-12">
    <!-- 移动端4单位padding，中屏8，大屏12 -->
  </div>
</template>
```

```css
/* 编译后的CSS */
.p-4 { padding: 1rem; }
@media (min-width: 768px) {
  .md\:p-8 { padding: 2rem; }
}
@media (min-width: 1280px) {
  .xl\:p-12 { padding: 3rem; }
}
```

**技术原理**：UnoCSS内置 `sm|md|lg|xl|2xl` 五级断点系统（对应640|768|1024|1280|1536px），编译时自动生成带媒体查询的样式规则。

### 动态类名组合技巧 ###

结合Vue3的响应式数据实现动态布局：

```typescript
// 响应式栅格系统示例
const gridColumns = ref(1) // 默认1列

watch(() => window.innerWidth, (width) => {
  gridColumns.value = width >= 1024 ? 3 : width >= 768 ? 2 : 1
})
```

```vue
<template>
  <div :class="`grid grid-cols-${gridColumns} gap-4`">
    <div v-for="n in 6" class="h-32 bg-blue-200 rounded-lg" />
  </div>
</template>
```

```css
/* 编译后的CSS */
.grid { display: grid; }
.gap-4 { gap: 1rem; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.h-32 { height: 8rem; }
.bg-blue-200 { background-color: #bfdbfe; }
.rounded-lg { border-radius: 0.5rem; }
```

**安全列表配置**：

```typescript:uno.config.ts
export default defineConfig({
  safelist: [
    /^grid-cols-(1|2|3)$/, // 精确匹配动态生成的类名
  ]
})
```

## 二、暗黑模式的工程化实现 ##

### 基础模式切换方案 ###

通过Vue3的组合式API管理主题状态：

```typescript:useDark.ts
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html', // 作用在根元素
  attribute: 'theme',
  valueDark: 'dark',
  valueLight: 'light'
})
const toggleDark = useToggle(isDark)
```

```vue:ThemeSwitch.vue
<template>
  <button 
    @click="toggleDark()"
    class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
  >
    {{ isDark ? '🌙' : '☀️' }}
  </button>
</template>
```

```css
/* 编译后的CSS */
.p-2 { padding: 0.5rem; }
.rounded-lg { border-radius: 0.5rem; }
.bg-gray-200 { background-color: #e5e7eb; }
.dark .dark\:bg-gray-700 { background-color: #374151; }
```

**实现效果**：点击按钮时自动切换 `<html theme="dark">` 属性，触发UnoCSS的暗黑模式类名。

### 深度定制暗黑主题 ###

在 `uno.config.ts` 中扩展自定义暗色方案：

```typescript:uno.config.ts
export default defineConfig({
  theme: {
    colors: {
      primary: {
        dark: '#5eead4', // 暗色系青绿色
        DEFAULT: '#06b6d4'
      }
    }
  },
  darkMode: 'class' // 基于CSS类名切换
})
```

组件中使用语义化颜色类：

```vue
<template>
  <div class="text-primary dark:text-primary-dark">
    根据主题切换的文字颜色
  </div>
</template>
```

```css
/* 编译后的CSS */
.text-primary { color: #06b6d4; }
.dark .dark\:text-primary-dark { color: #5eead4; }
```

## 三、性能优化实践 ##

### 按需生成验证与构建分析 ###

通过构建分析查看输出结果：

```bash
npx unocss @src --out-file dist/uno.css
```

观察生成的CSS文件是否仅包含实际使用的样式规则，确保没有冗余代码。

推荐在vite配置中添加构建监听：

```typescript:vite.config.ts
export default defineConfig({
  build: {
    watch: {
      include: ['src/**/*.vue', 'src/**/*.ts']
    }
  }
})
```

### 服务端渲染(SSR)适配增强 ###

在Nuxt3中配置SSR兼容：

```typescript:nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@unocss/nuxt'],
  unocss: {
    preflight: true, // 注入默认样式
    ssr: true, // 启用SSR支持
    // 生产环境优化配置
    mode: 'global',
    combine: process.env.NODE_ENV === 'production'
  }
})
```

### 图层管理与样式隔离 ###

通过图层管理实现样式优先级控制：

```typescript:uno.config.ts
export default defineConfig({
  layers: {
    components: 10,
    utilities: 20,
    mylayer: 30
  },
  shortcuts: [
    ['btn', 'layer-mylayer px-4 py-2 rounded', { layer: 'mylayer' }]
  ]
})
```

### PurgeCSS 深度集成 ###

配置PurgeCSS实现二次清理：

```typescript:uno.config.ts
export default defineConfig({
  postcss: {
    plugins: {
      '@unocss/postcss': {},
      'postcss-purgecss': {
        content: ['./src/**/*.vue'],
        safelist: [/^grid-cols-\d+$/]
      }
    }
  }
})
```

### 检查器工具使用 ###

开发阶段启用检查器：

```typescript:vite.config.ts
export default defineConfig({
  plugins: [
    UnoCSS({
      mode: 'global',
      inspector: true // 启用浏览器检查器
    })
  ]
})
```

访问 `localhost:5173/__unocss` 可实时查看生成的样式规则

## 最后：让样式回归工程本质 ##

通过本次分享实践可以看到，UnoCSS 将响应式布局从媒体查询地狱简化为类名组合游戏，把暗黑模式从多套变量维护转化为语义化类名切换。这种原子化思维不仅提升了开发效率，更通过严格的按需生成机制保障了性能底线。

下次当你面对复杂样式需求时，不妨先思考：这个效果能否通过 UnoCSS 的原子类组合实现？
