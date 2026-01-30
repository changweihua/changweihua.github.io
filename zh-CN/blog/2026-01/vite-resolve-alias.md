---
lastUpdated: true
commentabled: true
recommended: true
title: Vite中resolve.alias原理
description: Vite中resolve.alias原理
date: 2026-01-07 08:30:00 
pageClass: blog-page-class
cover: /covers/vite.svg
---

Vite 的 `resolve.alias` 是现代前端项目中几乎必备的配置，它让我们可以用简洁的路径别名（如 `@/components/Button.vue`）取代繁琐的相对路径（如 `../../../components/Button.vue`）。

## 配置方式 ##

### 对象形式（最常用） ###

```ts:vite.config.ts
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
})
```

### 数组形式（支持正则，更灵活） ###

```ts
resolve: { 
    alias: [ 
        { find: '@', replacement: path.resolve(__dirname, './src') }, 
        { find: /^~/, replacement: path.resolve(__dirname, './public') }
    ]
}
```

配置完成后，导入路径变得非常清晰：

```ts
import Button from '@/components/Button.vue'
import helper from '@/utils/helper.ts'
```

## 手写alias ##

`alias` 的本质就是遍历配置规则，匹配路径后进行字符串替换

```JavaScript
function resolveAlias(importPath, aliasConfig = {}) {
  // 将对象转为数组并逆序遍历，确保具体别名优先匹配
  const entries = Object.entries(aliasConfig).reverse();

  for (const [alias, replacement] of entries) {
    const prefix = alias + '/';
    // 匹配 alias/ 开头的路径（如 '@/xxx'）
    if (importPath.startsWith(prefix)) {
      return importPath.replace(alias, replacement);
    }
    // 匹配纯别名（如 '@'）
    if (importPath === alias) {
      return replacement;
    }
  }

  // 未匹配，返回原路径
  return importPath;
}

// 使用示例
const config = {
  '@': '/Users/project/src',
  '@components': '/Users/project/src/components',
};

console.log(resolveAlias('@/utils/tool.js'));         
// → /Users/project/src/utils/tool.js

console.log(resolveAlias('@components/Header.vue'));  
// → /Users/project/src/components/Header.vue
```

## 底层实现：`@rollup/plugin-alias` ##

Vite 没有自己实现 `alias` 功能，而是直接将配置传递给 `Rollup` 的官方插件 `@rollup/plugin-alias`。

- 开发阶段（vite dev）：通过 Rollup 插件钩子调用 alias 插件。
- 构建阶段（vite build）：完全交给 Rollup 处理。

核心发生在 Rollup 的 resolveId 插件钩子中：

```JavaScript
// @rollup/plugin-alias 简化伪代码
plugin() {
  return {
    name: 'alias',
    // source（import 语句中的原始路径字符串，import Button from '@/components/Button.vue'）
    // importer（相对路径）
    resolveId(source, importer) {
      // 遍历用户在 vite.config.js 中配置的所有 alias 规则
      // find（@）, replacement（/Users/你的项目/src）（alias: { '@': '/Users/你的项目/src' }）
      for (const { find, replacement } of this.options.entries) {
        // 情况 1：find 是普通字符串（如 '@'）
        if (typeof find === 'string') {
          // 常见匹配模式：路径以 "别名/" 开头（如 '@/xxx'） 
          // 或者路径完全等于别名（如 import '@'，虽然很少见）
          if (source.startsWith(find + '/') || source === find) {
            // 直接进行字符串替换，返回新的绝对路径 
            // 例如：'@/utils/tool.js' → '/project/src/utils/tool.js'
            return source.replace(find, replacement);
          }
        // 情况 2：find 是正则表达式（如 /^~\/(.*)/）
        } else if (find instanceof RegExp && find.test(source)) {
          // 正则匹配成功后，同样使用 replace 进行替换 
          // replacement 中可以使用 $1、$2 等捕获组 
          // 例如：'~/images/logo.png' → '/project/public/images/logo.png'
          return source.replace(find, replacement);
        }
        // 如果当前规则不匹配，继续尝试下一条规则
      }
      // 所有 alias 规则都未匹配，返回 null 
      // 表示本插件不处理此路径，让 Rollup 继续使用默认的文件系统解析或其它插件
      return null; 
    }
  };
}
```

核心在 Rollup 的 `resolveId` 钩子（插件最关键的钩子）：

1. 当遇到 `import '@/xxx'` 时，Rollup 调用所有插件的 resolveId(source, importer)。
2. `@rollup/plugin-alias` 遍历你的 `alias entries`。
3. 如果 `source` 匹配 find（字符串或正则），返回替换后的 `replacement` 作为新 ID。
4. Rollup 继续用新 ID 查找文件。
