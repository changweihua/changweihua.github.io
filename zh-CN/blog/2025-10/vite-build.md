---
lastUpdated: true
commentabled: true
recommended: true
title: Vite 构建库与构建应用的差异与最佳实践
description: Vite 构建库与构建应用的差异与最佳实践
date: 2025-10-11 09:00:00 
pageClass: blog-page-class
cover: /covers/vite.svg
---

Vite 是一个基于原生 ES 模块和 Rollup 构建的现代前端构建工具，它在构建应用和构建库时都表现优秀，但两者在使用上的配置和原理存在一定差异。了解这些差异，有助于我们更合理地利用 Vite 来构建高效的应用和可复用的库。

## 一、构建目标的核心差异 ##

| 对比项  | 应用构建 (`vite build`)  |  库构建 (`vite build --lib`)  |
| :-------: | :-------: | :---------: |
| 目标 | 浏览器直接运行的应用 | 被其他项目引入的 JS 库或组件 |
| 打包工具 | 基于 Rollup，带 HTML 入口 | 处理纯 Rollup 打包，无 HTML 入口 |
| 输出内容 | HTML、JS、CSS 等完整资源 | 单个或多个格式的 JS 输出（UMD/ES） |
| polyfill 处理 | 自动引入部分 polyfill（如 dynamic import） | 通常由使用者负责引入 |
| 外部依赖处理 | 默认打包所有依赖通 | 常将依赖标记为 external（外部依赖） |

## 二、构建库的推荐实践 ##

Vite 支持使用 `vite build --lib` 构建可复用的 JavaScript/TypeScript 库，如组件库、工具库等。本节将详细介绍构建方式、参数说明、目录结构、类型文件管理等最佳实践。

### 构建命令详解 ###

```bash
vite build --lib
```

- `--lib` 是可选参数，其作用是启用 *Library 模式*。
- 你也可以在 `vite.config.ts` 中通过 `build.lib` 字段配置构建方式，只运行 `vite build` 即可，*推荐写在配置文件里*，便于统一管理。
- 如果未设置 `build.lib`，则默认走 HTML 应用构建流程。

### 基本配置示例 ###

```ts:vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: './src/index.ts',      // 入口文件，必须是 JS/TS 模块
      name: 'MyLib',                // UMD 构建时的全局变量名
      fileName: (format) => `my-lib.${format}.js`,
      formats: ['es', 'umd'],       // 输出格式：ESM 和 UMD
    },
    sourcemap: true,                // 是否生成 .map 文件，默认 false
    cssCodeSplit: false,           // 样式是否单独提取，视情况决定
    rollupOptions: {
      external: ['vue'],           // 不打包 vue 依赖，让使用者提供
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
```

### 构建结果目录结构 ###

构建后的输出目录默认为 `dist/`，可通过 `build.outDir` 自定义。一个典型的输出结构如下：

```text
dist/
├── my-lib.es.js             # ESM 格式构建产物
├── my-lib.umd.js            # UMD 格式构建产物
├── my-lib.es.js.map         # 源映射（取决于 sourcemap 配置）
├── style.css                # 如果开启 cssCodeSplit
├── index.d.ts               # 类型声明文件（需单独配置）
└── package.json             # 如果使用自定义输出，可包含副本
```

### TypeScript 类型声明文件生成 ###

#### 方式 A：使用 `tsc` ####

```bash
tsc --declaration --emitDeclarationOnly --outDir dist/types
```

```json
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "dist/types",
    "skipLibCheck": true,
    "composite": true
  },
  "include": ["src"]
}
```

#### 方式 B：使用插件 `vite-plugin-dts` ####

```bash
npm install vite-plugin-dts -D
```

```ts
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [vue(), dts({ outDir: 'dist/types' })],
});
```

### 是否包含 `.map` 文件 ###

构建库时，是否包含 `.map` 文件由 `build.sourcemap` 控制：

- 开发阶段建议开启，方便调试；
- 发布到 npm 时可关闭，减小包体积；

### 发布建议 ###

**`package.json` 应配置**：

- `main`: 指向 UMD 或 CommonJS 产物（如 `dist/my-lib.umd.js`）
- `module`: 指向 ESM 产物（如 `dist/my-lib.es.js`）
- `types`: 指向类型声明文件（如 `dist/types/index.d.ts`）

配置 `exports` 字段以支持 Node/浏览器/ESM/CJS 自动兼容

发布前可使用 `np` 等工具辅助检查

### 示例 `package.json` 配置 ###

```json:package.json
{
  "name": "my-lib",
  "main": "dist/my-lib.umd.js",
  "module": "dist/my-lib.es.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/my-lib.es.js",
      "require": "./dist/my-lib.umd.js",
      "types": "./dist/types/index.d.ts"
    }
  },
  "files": [
    "dist"
  ]
}
```

## 三、构建应用的推荐实践 ##

使用 Vite 构建现代 Web 应用（SPA 或 MPA）时，目标是输出可部署的静态资源，包括 HTML、JavaScript、CSS、图片等。

### 构建命令详解 ###

```bash
vite build
```

- 使用 `vite build` 启动构建流程；
- 默认入口为 `index.html`；
- 会根据 `vite.config.ts` 进行优化和打包。

### 基本配置推荐（SPA） ###

```ts:vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/my-app/', // 设置资源路径前缀，部署到非根路径时必填
  build: {
    outDir: 'dist',          // 输出目录
    assetsDir: 'assets',     // 静态资源目录
    sourcemap: true,         // 是否生成 .map 文件，开发建议开启
    target: 'es2015',        // 编译目标，默认 esnext
    minify: 'esbuild',       // 使用 esbuild 压缩
    cssCodeSplit: true,      // 启用 CSS 拆分（默认）
    rollupOptions: {
      input: 'index.html',   // 入口 HTML，可省略
    },
  },
});
```

### 构建结果目录结构 ###

```text
dist/
├── index.html             # 构建后的 HTML
├── assets/                # 所有静态资源：JS、CSS、图片等
│   ├── index-xxxxx.js
│   ├── index-xxxxx.css
│   └── logo-xxxxx.svg
├── manifest.json          # 可选，需开启 build.manifest
└── .map 文件              # 如开启 sourcemap 会生成
```

### 多页面构建（MPA） ###

Vite 也支持多页应用（MPA）构建，可以通过配置多个 HTML 入口实现：

```ts
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        about: resolve(__dirname, 'about.html'),
      },
    },
  },
});
```

构建后将生成多个 HTML 文件，对应各自的入口 JS/CSS，适合构建传统多页应用、管理后台系统等场景。

### HTML 和资源引用规范 ###

- Vite 会自动处理 HTML 中的资源链接（如 `<script type="module" src="main.ts">`），无需手动加 hash；
- 支持使用 `%PUBLIC_URL%` 或 `/` 绝对路径；
- 推荐在资源引用中使用相对路径或以 `import.meta.env.BASE_URL` 动态拼接，增强兼容性。

### 是否生成 `.map` 文件？ ###

- 通过 `build.sourcemap` 控制是否生成源码映射：

    - 开发阶段建议开启；
    - 生产环境可视需求开启（用于错误追踪，如配合 Sentry）；

- 开启后会为每个 JS/CSS 文件生成对应 `.map` 文件。

### 静态资源管理建议 ###

- 推荐将不会变动的公共资源（logo、字体等）放在 `public/` 目录中，不会被哈希处理；
- 可通过 `import` 引入模块资源，也可用 `<img src="/logo.png">` 方式访问 `public` 下的资源。

### 部署建议与常见问题 ###

| 场景  |  配置建议  |
| :-------: | :---------: |
| 应用部署在子路径 `/foo/` | `base: '/foo/'`，否则资源路径将 404 |
| 使用 history 路由模式 | 部署时需配置后端 fallback 到 `index.html` |
| 想禁用 hash 文件名 | 配置 `build.rollupOptions.output.entryFileNames: '[name].js'` |
| CDN 加载资源 | 设置 `base` 为 CDN 根路径，如 `https://cdn.example.com/app/` |

### 示例部署配置（以 nginx 为例） ###

```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/my-app/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```