---
lastUpdated: true
commentabled: true
recommended: true
title: 一篇搞定CJS,AMD,CMD,ESM
description: 一篇搞定CJS,AMD,CMD,ESM
date: 2025-03-18 15:00:00
pageClass: blog-page-class
---

# 一篇搞定CJS,AMD,CMD,ESM #

以下是各模块化规范的对比分析，一张表直接理解：


| 特性 | ​**CommonJS** | ​**AMD (RequireJS)** | ​**CMD (Sea.js)** | ​**ES6 Modules** |
| :---: | :----: | :---: | :----: | :---: |
| 加载方式 | 同步加载（服务器端） | 异步加载（浏览器端） | 异步加载（浏览器端） | 静态加载（编译时确定依赖） |
| 语法 | `require / module.exports` | `define / require` | `define / require` | `import / export` |
| 依赖声明时机 | 动态依赖（运行时解析） | 依赖前置（提前声明） | 依赖就近（按需声明） | 静态依赖（编译时解析） |
| 模块执行时机 | 加载时执行 | 提前执行（依赖前置） | 延迟执行（按需执行） | 编译时加载，只执行一次 |
| 输出类型 | 值的拷贝（原始类型不受影响） | 值的拷贝 | 值的拷贝 | 值的引用（实时绑定） |
| 循环依赖处理 | 支持但可能导致部分加载 | 支持但需谨慎管理 | 支持但需谨慎管理 | 静态分析支持更好 |
| 适用环境 | Node.js | 浏览器端 | 浏览器端 | 浏览器 + Node.js（现代环境） |
| 优缺点 | ✅ 简单易用<br />❌ 同步加载不适用浏览器 | ✅ 异步加载优化性能<br />❌ 依赖前置不够灵活 | ✅ 依赖就近更灵活<br />❌ 社区生态较小 | ✅ 语言标准、静态优化<br />❌ 旧环境需转译 |

## 详细解释及代码示例 ##

### CommonJS ###

**场景**：Node.js 的默认模块系统。

**特点**：
  - 同步加载模块，模块在首次 `require` 时加载并执行。
  - 输出的是值的拷贝（原始类型为拷贝，对象为引用）。

```javascript
// math.js
let counter = 0;
const add = () => counter++;
module.exports = { counter, add };

// main.js
const { counter, add } = require('./math');
add();
console.log(counter); // 输出 0（counter 是拷贝值）
```


### AMD (Asynchronous Module Definition) ###

**场景**：浏览器端异步加载（如 RequireJS）。
**特点**：
  - 依赖前置，模块加载后立即执行。

```javascript
// 定义模块
define(['dep1', 'dep2'], function(dep1, dep2) {
  return { method: () => dep1.doSomething() };
});

// 使用模块
require(['moduleA'], function(moduleA) {
  moduleA.method();
});
```

### CMD (Common Module Definition) ###

**场景**：浏览器端（如 Sea.js），强调按需加载。
**特点**：
  - 依赖就近，模块使用时才加载。

```javascript
define(function(require, exports, module) {
  const dep1 = require('dep1'); // 按需加载
  exports.method = () => dep1.doSomething();
});
```

### ES6 Modules ###

**场景**：现代浏览器和 Node.js（需配置）。
**特点**：
  - 静态分析，编译时确定依赖。
  - 输出值的引用（实时绑定）。

```javascript
// math.js
export let counter = 0;
export const add = () => counter++;

// main.js
import { counter, add } from './math.js';
add();
console.log(counter); // 输出 1（counter 是引用）
```

## 再废话一次，核心区别总结 ##

### 加载机制 ###

- CommonJS 同步加载，适合服务器。
- AMD/CMD 异步加载，适合浏览器。
- ES6 静态加载，通用且支持优化。

### 模块定义与依赖管理 ###

- CommonJS/AMD/CMD 动态依赖，ES6 静态依赖。
- AMD 依赖前置，CMD 依赖就近，ES6 依赖声明在顶部。

### 值的传递 ###

- CommonJS/AMD/CMD 输出值拷贝，ES6 输出实时引用。

### 生态与未来 ###

- ES6 是语言标准，支持 Tree-shaking 等优化。
- CommonJS 主导 Node.js 生态，AMD/CMD 逐渐被替代。

## 在实际应用中建议大家 ##

- 现代项目：优先使用 ES6 Modules，结合 Webpack/Rollup 打包兼容旧环境。
- Node.js 开发：CommonJS 为主，逐步迁移到 ES6。
- 遗留浏览器项目：AMD 或 CMD 过渡，最终转向 ES6 + 打包工具。
