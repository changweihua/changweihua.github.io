---
lastUpdated: true
commentabled: true
recommended: true
title: 理解 devDependencies：它们真的不会被打包进生产代码吗？
description: 理解 devDependencies：它们真的不会被打包进生产代码吗？
date: 2025-07-24 13:05:00 
pageClass: blog-page-class
cover: /covers/npm.svg
---

在前端开发中，很多开发者都有一个常见误解：`package.json` 中的 `devDependencies` 是**开发时依赖**，因此不会被打包到最终的生产环境代码中。这个理解在一定条件下成立，但在真实项目中，**打包工具（如 Vite、Webpack 等）并不会根据 devDependencies 或 dependencies 的位置来决定是否将依赖打包到最终的 bundle 中，而是完全俗义于代码中是否引用了这些模块**。

本文将通过一个实际例子来说明这个问题，并提出一些实践建议来避免误用。

## dependencies vs devDependencies 回顾 ##

在 `package.json` 中，我们通常会看到两个依赖字段：

```json:package.json
{
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

- `dependencies`：运行时依赖，通常用于项目在生产环境中运行所需的库。
- `devDependencies`：开发时依赖，通常用于构建、测试、打包等过程，比如 `Babel`、`ESLint`、`Vite` 等。

很多人认为把某个库放到 `devDependencies` 中就意味着它不会被打包进最终代码，但这**只是约定俗成**，并非构建工具的实际行为。

## 一个实际例子：`lodash` 被错误地放入 `devDependencies` ##

我们以一个使用 Vite 构建的库包为例：

### 目录结构 ###

```text
my-lib/
├── src/
│   └── index.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### src/index.ts ###

```ts:src/index.ts
import _ from 'lodash';

export function capitalizeName(name: string) {
  return _.capitalize(name);
}
```

### 错误的 `package.json` ###

```json:package.json
{
  "name": "my-lib",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "vite build"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "lodash": "^4.17.21",
    "typescript": "^5.4.0"
  }
}
```

注意：`lodash` 被放到了 `devDependencies` 中，而不是 `dependencies` 中。

### 构建后结果 ###

执行 `npm run build` 后，你会发现 `lodash` 的代码被打包进了最终输出的 `bundle` 中，尽管它被标记为 `devDependencies`。

```txt
dist/
├── index.js         ← 包含 lodash 的代码
├── index.mjs
└── index.d.ts
```

## 为什么会发生这种情况？ ##

构建工具（如 `Vite`、`Webpack`）在处理打包时，并不会关心某个依赖是 `dependencies` 还是 `devDependencies`。

它只会扫描你的代码：

1. 如果你 `import` 了某个模块（如 `lodash` ），构建工具会把它包含进 `bundle` 中，除非你通过 `external` 配置显式告诉它不要打包进来。
2. 你放在 `devDependencies` 中只是告诉 `npm install`：这个依赖只在开发阶段需要，`npm install --production` 时不会安装它。

换句话说，**打包行为取决于代码，而不是依赖声明**。

## 修复方式：将运行时依赖移到 `dependencies` ##

为了正确构建一个可以发布的库包，应该：

```json
{
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.4.0"
  }
}
```

这样使用你库的开发者才能在安装你的包时自动获取 lodash。

## 如何防止此类问题？ ##

### 使用 peerDependencies（推荐给库开发者） ###

如果你希望使用者自带 lodash，而不是你来打包它，可以这样配置：

```json
{
  "peerDependencies": {
    "lodash": "^4.17.21"
  }
}
```

同时在 Vite 配置中加上：

```ts:vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MyLib'
    },
    rollupOptions: {
      external: ['lodash'], // 不打包 lodash
    }
  }
})
```

这样打包出来的 bundle 中就不会再包含 lodash 的代码。

### 使用构建工具的 external 配置 ###

像上面这样将 `lodash` 标为 `external` 可以避免误打包。

### 静态分析工具检测 ###

使用像 `depcheck` 或 `eslint-plugin-import` 等工具，可以帮你发现未声明或声明错误的依赖。

## 总结 ##


| 依赖位置   |   作用说明     |   备注 |
| :----------: | :----------: | :---------:  |
| dependencies | 生产环境运行时必须使用的库  | &nbsp; |
| devDependencies | 开发、构建过程所需的工具库 | &nbsp; |
| peerDependencies | 你的库需要，但由使用者提供的依赖（库开发推荐） | &nbsp; |

- 所有运行时依赖都放在 `dependencies` 或 `peerDependencies`；
- 构建工具正确配置 `external`，避免不必要地打包外部依赖；
- 使用工具检查依赖定义的一致性。
