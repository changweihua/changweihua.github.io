---
lastUpdated: true
commentabled: true
recommended: true
title:  __dirname is not defined in ES module scope
description: VitePress Vite 3.*
poster: /images/cmono-4c0cf778e497ab206289099ce51db5f.png
date: 2023-08-24
---

# 报错: __dirname is not defined in ES module scope #

在给 `vite+vue3.0` 设置别名的时候,直接使用了 `__dirname` 这个内置变量报错 `__dirname is not defined in ES module scope`

报错原因:

__dirname是commonjs规范的内置变量。如果使用了esm，是不会注入这个变量的。

在commonjs中，注入了__dirname，__filename, module, exports, require五个内置变量用于实现导入导出的能力。而在esm中，因为规范已经完全不一样，故实现方式也是不一样的。

在esm中，显然模块的导入导出使用export/import，自然不会再用exports /require，同理__dirname，__filename也有对应的规范写法。

## 前言 ##

新版 NodeJS 支持通过 ESM 方式导入模块，代码如：

```bash

// CommonJS 规范（旧）
const { readFileSync, writeFileSync } = require('fs')
const path = require('path')
// ESModule 规范（新）
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
// ESModule 规范（最新）
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

```

在最新 ESModule 规范中，CommonJS 规范的全局方法和全局变量均无法使用：

```bash

require()  // ❌ ESM 规范报错，未定义不能使用
module.exports    // ❌报错，不能使用
exports   // ❌报错，不能使用
__dirname  // ❌报错，不能使用
__filename  // ❌报错，不能使用

```

## 报错：ReferenceError: __dirname is not defined in ES module scope ##

:::info
报错原因：现在是 ESM 规范，没有全局变量 __dirname ，在 ESM 规范中需要自己定义变量才能使用。
:::

```bash

// 最新 node 核心包的导入写法
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
// 获取 __filename 的 ESM 写法
const __filename = fileURLToPath(import.meta.url)
// 获取 __dirname 的 ESM 写法
const __dirname = dirname(fileURLToPath(import.meta.url))
```

## 报错：ReferenceError: require is not defined in ES module scope, you can use import instead ##

:::info
require 在 ESM 规范中未定义，使用 ESM 规范的 import 代替。
:::

```bash

// ESModule 规范（新）
import fs from 'fs'
// CommonJS 规范（旧）
const fs = require('fs')

```

## 报错：ReferenceError: exports is not defined in ES module scope ##

:::info
exports 在 ESM 规范中未定义，可使用 ESM 规范的 export 导出代替。
:::

```bash

// ESModule 规范（新）
export const name = 'Megasu'
export const age = 18
// CommonJS 规范（旧）
exports.name = 'Megasu'
exports.age = 18
```

## 报错：ReferenceError: module is not defined in ES module scope ##

:::info
module 在 ESM 规范中未定义，可使用 ESM 规范的 export default 默认导出代替。
:::

```bash

// ESModule 规范（新）
export default {
  name: 'Megasu',
  age: 18
}
// CommonJS 规范（旧）
module.exports = {
  name: 'Megasu',
  age: 18
}

```
