---
lastUpdated: true
commentabled: true
recommended: true
title: 解锁 TypeScript 的元编程魔法
description: 从 `extends` 到 `infer` 的条件类型之旅
date: 2025-10-29 10:05:00 
pageClass: blog-page-class
cover: /covers/typescript.svg
---

在 Vue 3 + Vite + TypeScript 项目中，我们经常需要在多个文件中使用相同的类型定义。通常的做法是：

```typescript
// user.ts
export interface User {
  id: number;
  name: string;
}
```

然后在其他文件中使用时导入：

```ts
import type { User } from '@/types/user';
```

这没有问题，但在一个大型项目中，频繁 import/export 类型会显得繁琐、重复。而 TypeScript 实际上支持「全局类型声明」，允许你在项目中任何地方使用类型而不需要显式导入。

下面分析如何使用 `types` 或 `typings` 文件夹，在 Vue 3 + Vite + TypeScript 项目中配置全局类型定义。

## 创建全局类型定义目录 ##

你可以在项目根目录下创建一个 `types` 或 `typings` 文件夹：

```txt
your-project/
├─ src/
├─ types/          <-- 这里放全局类型定义
│  ├─ global.d.ts  <-- 推荐用 .d.ts 扩展名
│  ├─ user.d.ts
│  └─ api.d.ts
├─ vite.config.ts
├─ tsconfig.json
```

### 示例：`types/user.d.ts` ###

```typescript
// types/user.d.ts

interface User {
  id: number;
  name: string;
  email?: string;
}
```

> ⚠️ 注意：不要使用 `export` 或 `import`，TypeScript 会自动将这类 `.d.ts` 文件中的类型提升为全局。

## 配置 `tsconfig.json` ##

为了让 TypeScript 自动识别 `types` 目录中的类型定义，你需要在 `tsconfig.json` 中添加 `typeRoots` 或直接包含它：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "typeRoots": ["./types", "./node_modules/@types"]
  },
  "include": ["src", "types"]
}
```

**解释**：

- `typeRoots`: 告诉 TypeScript 在 `types` 目录下查找类型定义。
- `include`: 包含 `types` 文件夹，确保类型文件被编译器扫描。

> 注意： typeRoots如果没有配置，会隐式的指定 `"./node_modules/@types"`，但这里我们显式的指定了，就必须显式的指定一次 `"./node_modules/@types"`

## 全局使用类型定义 ##

完成以上配置后，你可以在任意 TS/JS/Vue 文件中直接使用类型：

```ts
const user: User = {
  id: 1,
  name: 'Alice'
};
```

不需要再 `import { User } from '@/types/user'` 了。

## 与第三方类型文件区别 ##

你可能注意到 `node_modules/@types` 中也有很多 `.d.ts` 文件（比如 `@types/lodash`）。这是 TypeScript 默认的全局类型路径之一。

通过上面的配置，我们也把 `types/` 当作了一个“自定义的全局类型包”，原理是一样的。

## 命名建议 ##

建议将全局类型文件命名为：

- `global.d.ts`：统一存放项目中杂项的全局类型定义
- `xxx.d.ts`：按功能模块拆分，如 `user.d.ts`、`api.d.ts`、`env.d.ts`


## ⚠注意事项 ##

| 项  | 注意 |
| :-------: | :-------: |
| 不要使用 `export`/`import` | 否则类型就不再是全局，会失效 |
| 文件名需以 `.d.ts` 结尾 | `.ts` 默认不当作类型声明文件处理 |
| 编辑器需重启 | 修改 `tsconfig.json` 后，需重启 VS Code或重启ts服务 才生效 |
| 不适合共享 npm 包 | 如果你想封装为库分发，请用 `export` 模块化方式 |

## 使用 `declare module` 声明模块类型 ##

有时候，我们会使用一些 *非 TypeScript 编写的模块* 或自定义的虚拟模块（如 Vite 插件注入的模块），这些模块没有类型定义。如果我们还想在不引入第三方 `.d.ts` 的前提下为它们添加类型，可以用 `declare module` 来手动声明。

### 为自定义模块添加类型 ###

假设你在 Vite 中使用了一个虚拟模块：`virtual:config`，但这个模块没有类型提示。

你可以在 `types/modules.d.ts` 中添加如下内容：

```typescript
// types/modules.d.ts

declare module 'virtual:config' {
  interface AppConfig {
    baseUrl: string;
    enableMock: boolean;
  }

  const config: AppConfig;
  export default config;
}
```

这样你就可以在项目中直接这样使用：

```ts
import config from 'virtual:config';

console.log(config.baseUrl);
```

### 增强已有模块的类型（模块补充） ###

有时我们需要为已有模块（如 `axios`）增强类型，比如为默认实例添加一些自定义字段或方法。

```typescript
// types/axios.d.ts

import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    authToken?: string; // 自定义字段
  }
}
```

这个用法叫做“模块补充”，它不会创建新的模块，而是 *向现有模块补充类型定义*，常用于增强第三方库的接口。

### 为非 TS 文件声明模块 ###

如果你导入了 `.svg`、`.png`、`.json` 这类资源文件，TypeScript 默认是无法识别这些文件的类型的，需要我们手动声明，但脚手架一般都已经添加了支持，除非你在使用刀耕火种的方式自己搭建脚手架，才需要手动自己去配置：

```typescript
// types/assets.d.ts

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.json' {
  const value: any;
  export default value;
}
```

这样就可以正常导入图片或 JSON 文件：

```javascript
import logo from './assets/logo.svg';
import config from './config.json';
```

## 补充：`declare global` 用于增强全局类型 ##

有时候还可能需要往全局作用域中注入变量或接口，例如：

```typescript
// types/global.d.ts
declare global {
  interface Window {
    $t: typeof import('vue-i18n').useI18n;
    appVersion: string;
  }
}
```

这种写法用于补充全局变量（例如 `window.appVersion`），或者为 Node.js 的全局环境（如 `process.env`）添加类型支持。

## vite的ts智能提示 ##

`vite` 在使用 `env` 的时候，它单独提供了一个 `vite-env.d.ts` 用来处理这种情况

```ts
interface ViteTypeOptions {
  // 添加这行代码，你就可以将 ImportMetaEnv 的类型设为严格模式，
  // 这样就不允许有未知的键值了。
  // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## 小结：`declare` 的三种常见用法 ##

| 用法  | 场景 |
| :-------: |  :---------: |
| `declare module` | 声明外部模块、虚拟模块、资源模块等 |
| 模块补充（`merge`） | 向已存在模块（如 `axios`）追加字段/方法 |
| `declare global` | 向全局作用域注入变量、接口、类型定义 |

## 建议的结构组织方式 ##

可以这样组织你的 `types/` 目录：

```txt
types/
├─ global.d.ts          # 全局类型接口/变量声明
├─ user.d.ts            # 业务类型拆分模块
├─ env.d.ts             # 环境变量声明
├─ modules.d.ts         # 自定义 module 声明
├─ assets.d.ts          # 资源文件模块（如 .svg/.png）
├─ axios.d.ts           # 补充第三方库模块定义
```

所有文件都应以 `.d.ts` 结尾，以确保 TypeScript 把它们当作 *声明文件* 而不是普通模块处理。

## 为什么要使用 declare 关键字？ ##

- 无需导入第三方 `.d.ts` 文件时，自定义模块声明。
- 向已存在模块扩展功能时（模块合并）。
- 为资源文件提供类型提示。
- 向 `window` 或全局对象注入类型。
- 在无需导入的前提下，让项目的类型系统更加完整、可靠。

## 总结 ##

通过使用全局类型定义，可以：

- 减少冗余的 `import`/`export` 操作
- 简化类型引用，提高开发效率
- 按模块拆分维护更清晰

**只需**：

- 在项目根目录添加 `types/` 文件夹，写入 `.d.ts` 类型声明
- 配置 `tsconfig.json` 的 `typeRoots` 和 `include`
- 直接使用类型，无需导入！

只要是typescript项目就可以按这种方法使用。
