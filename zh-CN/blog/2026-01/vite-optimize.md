---
lastUpdated: true
commentabled: true
recommended: true
title: Vite 性能优化实战
description: 从 0 到 1 打造极速开发体验
date: 2026-01-29 14:30:00 
pageClass: blog-page-class
cover: /covers/vite.svg
---

## 前言 ##

在现代前端开发中，构建工具的性能直接影响开发效率和用户体验。Vite 凭借其原生 ESM 和 esbuild 的优势，已经成为众多开发者的首选。但默认配置往往无法满足大型项目的需求，本文将从*预构建优化、智能分包策略、插件体系搭建、开发体验提升*四个维度，分享一套经过生产验证的 Vite 优化方案。

## 一、项目结构设计 ##

良好的配置结构是可维护性的基础。我们将 Vite 配置拆分为独立模块：

```text
├── build/
│   ├── config/
│   │   ├── define.ts      # 全局定义 & 分包策略
│   │   ├── optimize.ts    # 预构建配置
│   │   └── time.ts        # 构建时间工具
│   └── plugins/
│       ├── index.ts       # 插件入口
│       ├── unplugin.ts    # 自动导入插件
│       ├── unocss.ts      # 原子化 CSS
│       └── html.ts        # HTML 注入插件
└── vite.config.ts         # 主配置文件
```

## 二、预构建优化（optimizeDeps） ##

### 核心原理 ###

Vite 的预构建会将 CommonJS / UMD 依赖转换为 ESM，并将多个内部模块合并为单个模块，减少 HTTP 请求数量。

### 完整配置 ###

```typescript:build/config/optimize.ts

/**
 * https://vitejs.cn/vite3-cn/config/dep-optimization-options.html#optimizedeps-include
 * 强制预构建链接的包
 */
const include = [
  "vue",
  "sass",
  "mitt",
  "axios",
  "pinia",
  "dayjs",
  "unocss",
  "vue-router",
  "vue-i18n",
  "lodash-es",
  "@vueuse/core",
  "@wangeditor/editor",
  "@wangeditor/editor-for-vue",
  "@microsoft/fetch-event-source",
  "markdown-it",
  "highlight.js",
  "element-plus",
]

/**
 * https://vitejs.cn/vite3-cn/config/dep-optimization-options.html#optimizedeps-exclude
 * 在预构建中强制排除的依赖项
 */
const exclude = ["@iconify/json", "@purechat/ui"]

const entries = []

export { include, exclude, entries }
```

### 优化要点 ###

|  **配置项**  |   **作用**   | **适用场景**  |
| :--------: | :------: |:--------: |
|  `include`  | 强制预构建  |  深层导入的依赖、动态导入的依赖  |
|  `exclude`  | 排除预构建  |  本地包、需要特殊处理的包  |
|  `entries`  | 自定义入口  |  非 HTML 入口的项目  |

> 💡 Tips: `lodash-es`、`@vueuse/core` 这类包含大量小模块的库，强制预构建可显著减少请求数

## 三、智能分包策略（manualChunks） ##

### 为什么需要手动分包？ ###

默认情况下，Vite/Rollup 会将所有第三方依赖打包到一个 `vendor.js` 中，这会导致：

- 首屏加载巨大的 JS 文件
- 任意依赖更新都会使整个 vendor 缓存失效

### 分包配置实现 ###

```typescript:build/config/define.ts

import dayjs from "dayjs"
import utc from "dayjs/plugin/utc.js"
import timezone from "dayjs/plugin/timezone.js"

import {
  engines,
  dependencies,
  devDependencies,
  repository,
  name,
  homepage,
  bugs,
  version,
  docs,
} from "../../package.json"

// 获取构建时间
export function getBuildTime() {
  dayjs.extend(utc)
  dayjs.extend(timezone)
  return dayjs.tz(Date.now(), "Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss")
}

/** 平台的名称、版本、运行所需的 node 版本、依赖、最后构建时间 */
export const __APP_INFO__ = {
  pkg: {
    docs,
    giteeHomepage: "https://gitee.com/H260788/PureChat",
    bugs,
    name,
    version,
    engines,
    homepage,
    repository,
    dependencies,
    devDependencies,
  },
  lastBuildTime: getBuildTime(),
}

export const viteDefine = (env: Env.ImportMeta) => {
  return {
    // 应用信息
    __APP_INFO__: JSON.stringify(__APP_INFO__),
    // 判断是否为本地模式
    __LOCAL_MODE__: env?.VITE_LOCAL_MODE === "Y",
    // 判断是否为 Electron 环境
    __IS_ELECTRON__: env?.VITE_APP_ENV === "electron",
  }
}

// 定义模块与 chunk 名称的映射关系
const chunkMap = {
  // 核心框架
  vue: "vue-vendor",
  "vue-router": "vue-router-vendor",
  pinia: "pinia-vendor",
  // UI 库
  "@element-plus/icons-vue": "element-icons-vendor",
  "element-plus": "element-plus-vendor",
  "ant-design-vue": "ant-vendor",
  // 编辑器相关
  "@wangeditor": "wangeditor-vendor",
  "monaco-editor": "monaco-editor-vendor",
  // AI 相关
  ollama: "ollama-vendor",
  // IM SDK
  "@tencentcloud/chat": "tencent-im-vendor",
  // 工具库
  "lodash-es": "lodash-vendor",
  "@vueuse": "vueuse-vendor",
  dayjs: "dayjs-vendor",
  axios: "axios-vendor",
  // 其他
  "emoji-mart": "emoji-mart-vendor",
  highlight: "highlight-vendor",
  "pinyin-pro": "pinyin-pro-vendor",
  "vue-i18n": "vue-i18n-vendor",
  iconify: "iconify-vendor",
}

export const manualChunks = (id: string) => {
  if (!id.includes("node_modules")) return

  for (const [key, chunkName] of Object.entries(chunkMap)) {
    if (id.includes(key)) {
      return chunkName
    }
  }

  return "vendor"
}
```

> 🎯 收益: 按需加载、精准缓存、首屏加载时间降低 40%+

## 四、插件体系搭建 ##

### 插件入口配置 ###

```typescript:build/plugins/index.ts

import process from "node:process"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import progress from "vite-plugin-progress"
import removeConsole from "vite-plugin-remove-console"
import vueDevtools from "vite-plugin-vue-devtools"
import type { PluginOption } from "vite"
import { visualizer } from "rollup-plugin-visualizer"
import { setupUnplugin } from "./unplugin"
import { setupHtmlPlugin } from "./html"
import { viteBuildInfo } from "./info"
import { setupUnocss } from "./unocss"
import { cdn } from "./cdn"

/**
 * vite 插件配置
 * @param viteEnv - 环境变量配置
 */
export function setupVitePlugins(viteEnv: Env.ImportMeta) {
  const customElement = ["webview"]

  const plugins: PluginOption = [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => customElement.includes(tag),
        },
      },
    }),
    vueJsx(),
    // 打包进度条
    progress(),
    setupUnocss(viteEnv),
    setupHtmlPlugin(),
    viteBuildInfo(),
    ...setupUnplugin(viteEnv),
  ]

  // 生产环境移除 console
  if (viteEnv.VITE_REMOVE_CONSOLE === "Y") {
    plugins.push(removeConsole())
  }

  // 开发工具
  if (viteEnv.VITE_DEV_TOOLS === "Y") {
    plugins.push(
      vueDevtools({
        launchEditor: viteEnv.VITE_DEVTOOLS_LAUNCH_EDITOR || "code",
      })
    )
  }

  // 打包分析（npm run analyze 时启用）
  if (process.env.npm_lifecycle_event === "analyze") {
    plugins.push(visualizer({ open: true, brotliSize: true, filename: "report.html" }))
  }

  // CDN 加速
  if (viteEnv.VITE_CDN === "Y") {
    plugins.push(cdn())
  }

  return plugins
}

/**
 * 配置 Vite 外部依赖
 */
export function setupViteExternal(viteEnv: Env.ImportMeta): (RegExp | string)[] {
  const localExternals = [
    /^@tencentcloud\/chat/,
    /^tim-upload-plugin/,
    /^pinyin-pro/,
  ]
  const commonExternals = [/^@purechat\/ui$/]

  if (viteEnv.VITE_LOCAL_MODE === "Y") {
    return [...localExternals, ...commonExternals]
  }

  return [...commonExternals]
}
```

### 自动导入配置（unplugin） ###

告别繁琐的 import 语句！

```typescript:build/plugins/unplugin.ts

import process from "node:process"
import path from "node:path"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import type { PluginOption } from "vite"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"
import { ElementPlusResolver, AntDesignVueResolver } from "unplugin-vue-components/resolvers"

export function setupUnplugin(viteEnv: Env.ImportMeta) {
  const { VITE_AUTO_COMPONENT, VITE_ICON_LOCAL_PREFIX, VITE_AUTO_IMPORT } = viteEnv

  const plugins: PluginOption = [
    // SVG 图标雪碧图
    createSvgIconsPlugin({
      iconDirs: [path.join(process.cwd(), "src/assets/svg-icon")],
      symbolId: `${VITE_ICON_LOCAL_PREFIX}-[dir]-[name]`,
      inject: "body-last",
      customDomId: "__SVG_ICON_LOCAL__",
    }),
  ]

  // 组件自动注册
  if (VITE_AUTO_COMPONENT === "Y") {
    plugins.push(
      Components({
        dts: "src/typings/components.d.ts",
        types: [{ from: "vue-router", names: ["RouterLink", "RouterView"] }],
        resolvers: [
          ElementPlusResolver(),
          AntDesignVueResolver({
            importStyle: "css",
          }),
        ],
        include: [/\.vue$/, /\.tsx$/, /\.ts$/],
      })
    )
  }

  // API 自动导入
  if (VITE_AUTO_IMPORT === "Y") {
    plugins.push(
      AutoImport({
        resolvers: [],
        imports: ["vue", "vue-router", "pinia"],
        dts: "src/typings/auto-imports.d.ts",
        include: [/\.vue$/, /\.ts$/],
        eslintrc: {
          enabled: true,
          filepath: "./.eslintrc-auto-import.json",
          globalsPropValue: true,
        },
      })
    )
  }

  return plugins
}
```

### UnoCSS 图标方案 ###

基于文件系统的本地图标加载：

```typescript:build/plugins/unocss.ts

import process from "node:process"
import path from "node:path"
import unocss from "@unocss/vite"
import presetIcons from "@unocss/preset-icons"
import { FileSystemIconLoader } from "@iconify/utils/lib/loader/node-loaders"

export function setupUnocss(viteEnv: Env.ImportMeta) {
  const { VITE_ICON_PREFIX, VITE_ICON_LOCAL_PREFIX } = viteEnv

  const localIconPath = path.join(process.cwd(), "src/assets/svg-icon")
  const collectionName = VITE_ICON_LOCAL_PREFIX.replace(`${VITE_ICON_PREFIX}-`, "")

  return unocss({
    presets: [
      presetIcons({
        prefix: `${VITE_ICON_PREFIX}-`,
        scale: 1,
        extraProperties: {
          display: "inline-block",
        },
        collections: {
          [collectionName]: FileSystemIconLoader(localIconPath, (svg) =>
            svg.replace(/^<svg\s/, '<svg width="1em" height="1em" ')
          ),
        },
        warn: true,
      }),
    ],
  })
}
```

使用方式：

```html
<!-- 使用 Iconify 图标 -->
<i class="i-mdi-home"></i>

<!-- 使用本地 SVG 图标 -->
<i class="i-local-logo"></i>
```

### HTML 注入插件 ###

自动注入构建时间，方便版本追踪：

```typescript:build/plugins/html.ts

import type { Plugin } from "vite"
import { getBuildTime } from "../config/time"

export function setupHtmlPlugin() {
  const buildTime = getBuildTime()
  
  const plugin: Plugin = {
    name: "html-plugin",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace(
        "<head>", 
        `<head>\n    <meta name="buildTime" content="${buildTime}">`
      )
    },
  }

  return plugin
}
```

```typescript:build/config/time.ts

import dayjs from "dayjs"
import utc from "dayjs/plugin/utc.js"
import timezone from "dayjs/plugin/timezone.js"

export function getBuildTime() {
  dayjs.extend(utc)
  dayjs.extend(timezone)
  return dayjs.tz(Date.now(), "Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss")
}
```

## 五、主配置文件整合 ##

```typescript:vite.config.ts

import process from "node:process"
import { fileURLToPath, URL } from "node:url"
import { defineConfig, loadEnv } from "vite"
import { manualChunks, viteDefine } from "./build/config/define"
import { exclude, include } from "./build/config/optimize"
import { setupViteExternal, setupVitePlugins } from "./build/plugins"

export default defineConfig((configEnv) => {
  const viteEnv = loadEnv(configEnv.mode, process.cwd()) as unknown as Env.ImportMeta

  return {
    base: viteEnv.VITE_BASE_URL,
    define: viteDefine(viteEnv),
    resolve: {
      alias: {
        "~": fileURLToPath(new URL("./", import.meta.url)),
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@shared": fileURLToPath(new URL("./packages/shared", import.meta.url)),
        "@database": fileURLToPath(new URL("./packages/database", import.meta.url)),
      },
      extensions: [".js", ".ts", ".json"],
    },
    server: {
      port: viteEnv.VITE_PORT,
      open: true,
      host: "0.0.0.0",
      proxy: {},
      // 🔥 预热常用文件，加速首次加载
      warmup: {
        clientFiles: ["./index.html", "./src/{views,components}/*"],
      },
    },
    plugins: setupVitePlugins(viteEnv),
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
    optimizeDeps: {
      include,
      exclude,
    },
    worker: {
      format: "es",
    },
    build: {
      sourcemap: viteEnv.VITE_SOURCE_MAP === "Y",
      chunkSizeWarningLimit: 1024,
      reportCompressedSize: false,
      rollupOptions: {
        external: setupViteExternal(viteEnv),
        input: {
          index: fileURLToPath(new URL("./index.html", import.meta.url)),
        },
        output: {
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]",
          manualChunks,
        },
      },
    },
  }
})
```

## 六、最佳实践清单 ##

- ✅ 将大型依赖加入 `optimizeDeps.include`
- ✅ 使用 `manualChunks` 按库拆分 `vendor`
- ✅ 开启 `server.warmup` 预热常用文件
- ✅ 生产环境移除 `console` 和 `sourcemap`
- ✅ 使用 `unplugin-auto-import` 减少样板代码
- ✅ 通过环境变量控制插件启用状态
- ✅ 定期使用 `rollup-plugin-visualizer` 分析包体积

## 结语 ##

性能优化是一个持续的过程，本文提供的配置方案已在多个生产项目中验证，希望能为你的项目带来实质性的提升。如有问题欢迎在评论区交流！
