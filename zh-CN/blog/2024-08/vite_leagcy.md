---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 + Vite 项目构建兼容低版本浏览器
description: Vue3 + Vite 项目构建兼容低版本浏览器
date: 2024-08-15 12:18:00
pageClass: blog-page-class
---

# Vue3 + Vite 项目构建兼容低版本浏览器 #

Vite项目如何配置构建项 来支持低版本浏览器兼容性，vite官方提供@vitejs/plugin-legac插件来为打包后的文件提供传统浏览器兼容性支持。该项目因为使用 Ant Design for Vue 4+组件库，该版本组件库默认不支持低版本浏览器，但提供兼容样式的配置项。项目中css也需要做向下兼容低版本浏览器，vite提供对应的css配置项，内联了PostCSS配置。

> 重点在于 Vite 的构建选项、使用 @vitejs/plugin-legacy 插件（需要安装 terser 插件），以及 Ant Design Vue 4 的样式配置。

## Vite配置-兼容ts ##

在 `vite.config.ts` 文件中，配置构建选项，并添加 `@vitejs/plugin-legacy` 插件。

### 安装 @vitejs/plugin-legacy 及相关依赖 ###

首先，确保已经安装 `@vitejs/plugin-legacy` 插件和 `terser` 插件

```bash
npm install @vitejs/plugin-legacy terser --save-dev
```

### 更新 vite.config.ts 文件 ###

在 `vite.config.ts` 文件中，添加对 `@vitejs/plugin-legacy` 插件的配置

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'Chrome >= 64'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      polyfills: [
        'es.symbol',
        'es.array.filter',
        'es.promise',
        'es.promise.finally',
        'es.object.assign',
        'es.map',
        'es.set',
        'es.array.for-each',
        'es.object.define-properties',
        'es.object.define-property',
        'es.object.get-own-property-descriptor',
        'es.object.get-own-property-descriptors',
        'es.object.keys',
        'es.object.to-string',
        'web.dom-collections.for-each',
        'esnext.global-this',
        'esnext.string.match-all',
        'es.array.iterator',
        'es.string.includes',
        'es.string.starts-with',
        'es.object.values',
      ],
    })
  ],
  build: {
    minify: 'terser', // 使用 terser 进行压缩
    chunkSizeWarningLimit: 4096,
    terserOptions: {
      compress: {
        drop_console: true, // 可选：移除 console.log 语句
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
          antd: ['ant-design-vue', '@ant-design/icons-vue'],
        },
      },
    },
    target: ['es2015', 'chrome64'], // 兼容到低版本浏览器，大于等于 chrome64
  },
})
```

### 构建选项说明 ###

- legacy 插件配置：
  - targets: 指定需要支持的浏览器版本。
  - additionalLegacyPolyfills: 额外的 polyfill。
  - renderLegacyChunks: 是否生成传统版本的 chunk。
  - polyfills: 具体的 polyfill 列表。
- build 配置：
  - minify: 使用 terser 进行压缩。
  - chunkSizeWarningLimit: 设置 chunk 大小警告阈值。
  - terserOptions: terser 压缩选项。
  - rollupOptions.output.manualChunks: 自定义 chunk 分割策略。
  - target: 指定构建目标，确保生成的代码兼容低版本浏览器。


## Vite配置-兼容css ##

现代浏览器中有一些更简洁的语法正在广泛应用中，如margin-block、flex: end等。这些写法在低版本浏览器无法得到支持，导致页面错乱，最简单的做法就是替换掉这些css，但是无法保证每一个都替换掉，也无法保证后续不会写新css语法，所以需要对项目中所有的css进行兼容。恰巧vite中内联了postcss。我可以通过postcss-preset-env插件将现代 CSS 转换为大多数浏览器可以理解的语法。

### 安装 ###

```bash
npm i postcss-preset-env --save-dev
```

### 配置css.postcss ###

```js
import poscssPresetEnv from 'postcss-preset-env';

export default defineConfig({
  
  // ... 省略
    
   css: {
      postcss: {
        plugins: [
          poscssPresetEnv(),
        ],
      },
    },
});
```

## Ant Design Vue 4 的样式兼容 ##

为了确保 Ant Design Vue 4 的样式在低版本浏览器中正常显示，我们需要进行一些额外的配置。

### 引入 Ant Design Vue 样式 ###

在项目的 `main.ts` 文件中，引入 Ant Design Vue 样式：

```ts
import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)
app.use(Antd)
app.mount('#app')
```

### 样式兼容 ###

根据 Ant Design Vue 的兼容性文档，在 Vue 组件中使用 StyleProvider 取消默认的降权操作

```vue
<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { legacyLogicalPropertiesTransformer } from 'ant-design-vue'

dayjs.locale('zh-cn')

const locale = zhCN

const appStore = useAppStore()
</script>

<template>
  <a-config-provider
    :theme="appStore.theme"
    :locale="locale"
  >
    <a-style-provider hash-priority="high" :transformers="[legacyLogicalPropertiesTransformer]">
      <RouterView />
    </a-style-provider>
  </a-config-provider>
</template>
```
