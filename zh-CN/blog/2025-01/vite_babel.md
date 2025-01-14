---
lastUpdated: true
commentabled: true
recommended: true
title: vite 使用plugin-legacy兼容低版本浏览器仍出现的问题
description: vite 使用plugin-legacy兼容低版本浏览器仍出现的问题
date: 2025-01-14 10:18:00
pageClass: blog-page-class
---

# vite 使用plugin-legacy兼容低版本浏览器仍出现的问题 #

> 项目使用了vite+vue3+ts的方案，采用plugin-legacy+babel适配低版本浏览器

## 背景 ##

在开发工作中，项目使用了vite+vue3+ts的方案，但是需要适配低版本浏览器。

首先使用了`@vitejs/plugin-legacy`插件，配置完成后发现并不能解决问题，出现‘SyntaxError: Unexpected token .’的报错。

刚开始下意识认为是低版本浏览器不兼容，便使用`@vitejs/plugin-legacy`进行降级处理。

但是打完包之后，第一次打开页面可以正常运行，但是在页面刷新后，却报错提示‘globalThis is not defined’，所以意识到可能哪里出现了问题。便对浏览器进行了是否支持es6进行检查,发现都可以支持。

### 检查浏览器是否支持 ES6 模块 ###

```js
function isES6ModuleSupported() {
  try {
    // 尝试通过动态 import 检测模块支持
    new Function('import("")');
    return true;
  } catch (e) {
    return false;
  }
}

if (isES6ModuleSupported()) {
  console.log("浏览器支持 ES6 模块，应该能够运行 Vite 项目");
} else {
  console.log("浏览器不支持 ES6 模块，可能不支持 Vite");
}
```

### 检查浏览器是否支持现代 JavaScript 特性 ###

```js
function checkModernJavaScriptSupport() {
  try {
    // 测试 `let` 和箭头函数支持
    let test = () => {};
    test();
    return true;
  } catch (e) {
    return false;
  }
}

if (checkModernJavaScriptSupport()) {
  console.log("浏览器支持现代 JavaScript 语法，应该支持 Vite");
} else {
  console.log("浏览器不支持现代 JavaScript 语法，可能不支持 Vite");
}
```

### 检查 WebSocket 支持 ###

```js
function isWebSocketSupported() {
  return 'WebSocket' in window;
}

if (isWebSocketSupported()) {
  console.log("浏览器支持 WebSocket，应该能够支持 Vite 热更新");
} else {
  console.log("浏览器不支持 WebSocket，Vite 热更新可能无法正常工作");
}
```

所以重新看待SyntaxError: Unexpected token .这个报错，可以想到可选链操作符 (?.),所以在同样在index.html页面添加如下代码发现，出现报错。

```js
const obj = { prop: { nestedProp: "Hello" } };
console.log(obj.prop?.nestedProp); // 可选链操作符（Optional chaining）
```

## 解决方案 ##

但是已经用了`@vitejs/plugin-legacy`进行降级，所以怀疑可能某些地方可能并没有降级，所以采用babel进行针对性的降级，对`@vitejs/plugin-legacy`进行补充。

### 安装 Babel 相关插件 ###

- **@vitejs/plugin-legacy**：为旧版浏览器生成 ES5 兼容代码。
- **@babel/preset-env**：根据目标浏览器转译代码。
- **@babel/plugin-proposal-optional-chaining**：转译可选链操作符。
- **core-js**：提供必要的 Polyfill，确保老旧浏览器支持最新 JavaScript 特性。

```bash
npm install --save-dev @vitejs/plugin-legacy @babel/core @babel/preset-env @babel/plugin-proposal-optional-chaining core-js
```

### 配置 Babel ###

在根目录新增babel.config.cjs文件

- 让 Babel 专注于处理一些 `@vitejs/plugin-legacy` 无法覆盖的语法（如特殊插件或实验性语法）。
- 避免在 Babel 中启用 `@babel/preset-env` 的 `useBuiltIns: 'usage'`，以避免重复引入 Polyfill。

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: false, // 不指定目标浏览器，由 plugin-legacy 管理
        useBuiltIns: false, // 不处理 Polyfill，由 plugin-legacy 管理
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining', // 支持可选链操作符
  ],
}
```

### 在入口文件中导入 Polyfill ###

你需要在项目的入口文件（如 `main.ts` 或 `index.ts`）中引入 `core-js` 和 `regenerator-runtime`，这样才能确保旧浏览器支持最新的 JavaScript 特性。

在 `main.ts` 或 `index.ts` 文件顶部添加

```js
import 'core-js/stable';
import 'regenerator-runtime/runtime'; // 如果你的代码使用了生成器（Generator），你也需要这个 Polyfill
```

### 配置 Vite 使用 `@vitejs/plugin-legacy` ###

通常 core-js 会在 @babel/preset-env 中自动处理，但是你也可以手动导入 Polyfill，确保代码在旧浏览器中能够正确执行。

在你的项目入口文件（如 `main.ts` 或 `index.ts` ）中加入

```js
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
    plugins: [
        legacy({
          targets: ['> 0.2%', 'not dead'],
          additionalLegacyPolyfills: [
            'core-js/stable',
            'regenerator-runtime/runtime',
          ], // 兼容 async/await
          }),
     ]
  }),
```

好了,大功告成，打包测试一下就OK
