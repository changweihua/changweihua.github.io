---
lastUpdated: true
commentabled: true
recommended: true
title: Tailwind CSS 4 与 UnoCSS 最新配置全攻略
description: 一把跑通不踩坑
date: 2026-01-16 10:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 前言 ##

在日常开发中，给样式命名这件事总是既琐碎又费时间。虽然重要，但大多数时候，它并不是最有创造力的部分。直到我接触到 **Tailwind CSS** —— 这个框架彻底改变了我写样式的方式。它的类名设计极具复用性，写起来简洁、直观，搭配好之后几乎不用再定义额外的样式，整个过程就像在“拼积木”，丝滑又高效。

## 一、Tailwind CSS 4 配置实战 ##

我最先接入 Tailwind CSS 4 的是一个 React 项目。之前看到过一篇文章提到 Tailwind CSS 4 的渲染性能已经超过 UnoCSS，于是我优先选择了它。下面是完整且可直接使用的配置流程。

### 安装依赖 ###

需要安装的依赖有三项：

- tailwindcss：核心库，用来解析模板文件（HTML、Vue、React 等），提取类名并生成对应的样式。  它提供了 `@tailwind base`、`@tailwind components`、`@tailwind utilities` 等指令，用于加载基础、组件和工具类样式。
- `@tailwindcss/postcss`：用于将 Tailwind 运行在 PostCSS 环境中。
- postcss：CSS 转译工具平台，相当于 Babel 之于 JavaScript。它本身不生成样式，而是通过插件来“转换” CSS 代码。

**安装命令如下**：

```bash
pnpm add -D tailwindcss @tailwindcss/postcss postcss
```

### 配置 postcss.config.js ###

在 v3 及之前，你可能写过这样的配置：

```js:postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

而在 Tailwind CSS 4 中，只需这样写即可：

```js:postcss.config.js
// ESM 写法
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

```js:postcss.config.js
// CJS 写法
module.exports = {
  plugins: [require('@tailwindcss/postcss')],
};
```

是不是清爽多了？

### 配置 tailwind.config.mjs ###

Tailwind 4 中这个文件不是必须的，但如果你需要自定义扫描路径或扩展主题，可以添加：

```js:tailwind.config.mjs
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 导入全局样式 ###

最后一步，在全局样式文件（如 `index.css`）中加入：

```css
@import "tailwindcss";
```

到这里，Tailwind CSS 4 已经可以愉快使用了

## 二、UnoCSS 配置实战 ##

在 Tailwind CSS 4 之前，UnoCSS 一直被认为是性能更优的原子化样式框架。

**主要原因有三点**：

- 它直接作为 *Vite/Rollup 插件* 在内存中运行，无需 PostCSS，少了一层解析开销。
- UnoCSS 的规则集是 *模块化按需加载* 的，而 Tailwind 核心包含所有默认规则与主题，哪怕你只用到一小部分，也必须加载整个核心引擎。
- UnoCSS 支持 *类名哈希化（Hashing）* ，例如 `text-[rgb(255,0,0)]` 会被转换成 `u-1e0s`，进一步减小 HTML 体积。

我之所以重新选择 UnoCSS，不是出于性能方面的考虑，而是因为 Tailwind CSS 4 在 `uni-app` 项目 中兼容性还不理想。

下面是经过实测可行的 UnoCSS 配置流程。

### 安装依赖 ###

```bash
pnpm add -D unocss @unocss/vite @unocss/preset-wind3
```

每个包的用途是:

|    包名     |     作用       |
| :------------- | :-----------: | :-----------: |
|   unocss   |    UnoCSS 的核心引擎，解析类名并生成原子化 CSS。    |
|  @unocss/vite   |  将 UnoCSS 集成进 Vite 构建流程，支持 HMR。  |x
| @unocss/preset-wind4  | 提供类似 Tailwind v4 的默认原子类规则集。  |

### 创建 uno.config.ts ###

一开始我为了兼容小程序端加了很多规则，但发现像 `text-[#ccc]` 这类即时值样式更新不及时，必须重启项目。

后来基于项目实际,仅考虑 H5 端,简化配置后，热更新立刻恢复正常。

```js:uno.config.ts
import { defineConfig } from 'unocss';
import presetWind4 from '@unocss/preset-wind4';

export default defineConfig({
  presets: [presetWind4()],
  content: {
    pipeline: {
      include: [/.(vue|js|ts|jsx|tsx|html)($|?)/],
    },
  },
});
```

### 修改 vite.config.ts ###

如果直接写 `import UnoCSS from '@unocss/vite'`，编译时会报错：

> `"@unocss/vite" resolved to an ESM file. ESM file cannot be loaded by require.`

并且只有这一个通过import导入的包才会报错，其它的导入包都不报错。原因是：`@unocss/vite` 是 纯 ESM 包，而 uni-app 构建链仍带有部分 CommonJS 加载逻辑，其它的导入包提供了*CommonJS的兼容层*，允许它们被 `require()` 加载。

解决办法：强制使用ESM模式加载,使用 *动态导入*，动态导入总是返回一个 Promise，且强制使用 ESM 模式加载。

```js
export default defineConfig(async () => {
  const { default: UnoCSS } = await import('@unocss/vite');
  return {
    plugins: [
      uni(),
      UnoCSS(),
    ],
  };
});
```

### 在入口文件中导入 UnoCSS ###

在 `src/main.ts` 中加入：

```ts:main.ts
import 'uno.css';
```

这行不是导入文件，而是告诉构建工具在此位置插入 UnoCSS 动态生成的样式内容。

### 测试是否成功 ###

```html
<div class="h-[200px] text-[#0000ff]">测试</div>
```

运行项目后，如果蓝色文字和高度样式立即生效，说明配置成功！

## 结语 ##

本文介绍了 Tailwind CSS 4 和 UnoCSS 的最新实战配置方法，避开了许多旧教程中的坑，比如命令失效、HMR 不更新、CJS/ESM 冲突等问题。

如果你刚开始接触原子化样式框架，那么恭喜你——这篇文章可以让你跳过绝大多数踩坑环节，直接获得一个可用、稳定的开发环境。

现在，是时候将注意力完全集中到你的业务逻辑和创意实现了。希望这些可靠的基础配置能为你省下宝贵的调试时间，让你能够更自信、更快速地投入到项目的开发中。

## 后记 ##

@umijs/max项目配置 `tailwindcss` 的方法更简单，一键配置指令为

```bash
npx max g tailwindcss
# 或者
pnpm exec max g tailwindcss
```

这个命令会做以下4件事情:

- 安装 `tailwindcss-V4` 版本
- 修改 `config/config.ts`, 开启 `tailwindcss` 功能
- 创建 `tailwind.config.js` 配置文件
- 创建 `tailwind.css` 文件

安装之后，如果启动报错，需要补充安装依赖

```bash
pnpm add -D postcss autoprefixer
```
