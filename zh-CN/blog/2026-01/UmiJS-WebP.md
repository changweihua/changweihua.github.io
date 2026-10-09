---
lastUpdated: true
commentabled: true
recommended: true
title: 在 UmiJS + Vue3 项目中实现 WebP 图片自动转换和优化
description: 在 UmiJS + Vue3 项目中实现 WebP 图片自动转换和优化
date: 2026-01-28 08:30:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## 前言 ##

WebP 是一种现代图片格式，相比传统的 JPG/PNG 格式，通常可以减少 25-35% 的文件大小，某些图片甚至可以减少 80% 以上。

本文将介绍如何在 UmiJS + Vue 3 项目中实现 WebP 图片的自动转换和智能加载。

## 功能特性 ##

- **✅ 构建时自动转换**：构建时自动将 JPG/PNG 转换为 WebP
- **✅ 智能格式选择**：自动检测浏览器支持，优先使用 WebP
- **✅ 自动回退**：不支持的浏览器自动使用原始格式
- **✅ 性能优化**：使用缓存避免重复检测和重复加载
- **✅ 零配置使用**：组件化封装，使用简单

## 实现步骤 ##

### 安装依赖 ###

```bash
pnpm add -D imagemin imagemin-webp
```

### 创建图片转换脚本 ###

创建 `scripts/convert-images.mjs`：

```javascript:convert-images.mjs
import imagemin from "imagemin"
import imageminWebp from "imagemin-webp"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 图片转 WebP 脚本
 * 将 src/assets 目录下的 jpg/jpeg/png 图片转换为 webp 格式
 */
async function convertImages() {
  const assetsDir = path.join(__dirname, "../src/assets")

  // 检查目录是否存在
  if (!fs.existsSync(assetsDir)) {
    console.log("⚠️  assets 目录不存在，跳过图片转换")
    return
  }

  console.log("🖼️  开始转换图片为 WebP 格式...")

  try {
    const files = await imagemin([`${assetsDir}/*.{jpg,jpeg,png}`], {
      destination: assetsDir,
      plugins: [
        imageminWebp({
          quality: 80, // 质量 0-100，80 是质量和文件大小的良好平衡
          method: 6, // 压缩方法 0-6，6 是最慢但压缩率最高
        }),
      ],
    })

    if (files.length === 0) {
      console.log("ℹ️  没有找到需要转换的图片")
    } else {
      console.log(`✅ 成功转换 ${files.length} 张图片为 WebP 格式:`)
      files.forEach((file) => {
        const fileName = path.basename(file.destinationPath)
        const originalSize = fs.statSync(
          file.sourcePath.replace(/\.webp$/, path.extname(file.sourcePath))
        ).size
        const webpSize = fs.statSync(file.destinationPath).size
        const reduction = ((1 - webpSize / originalSize) * 100).toFixed(1)
        console.log(`   - ${fileName} (减少 ${reduction}%)`)
      })
    }
  } catch (error) {
    console.error("❌ 图片转换失败:", error.message)
    process.exit(1)
  }
}

// 执行转换
convertImages()
```

### 创建图片工具函数 ###

创建 `src/utils/image.ts`：

```typescript:image.ts
/**
 * 图片工具函数 - 支持 WebP 格式
 */

const WEBP_SUPPORT_CACHE_KEY = "__webp_support__"

/**
 * 检测浏览器是否支持 WebP 格式（带缓存）
 * 使用 localStorage 缓存检测结果，避免重复检测
 */
export function checkWebPSupport(): Promise<boolean> {
  // 先检查缓存
  if (typeof window !== "undefined" && window.localStorage) {
    const cached = window.localStorage.getItem(WEBP_SUPPORT_CACHE_KEY)
    if (cached !== null) {
      return Promise.resolve(cached === "true")
    }
  }

  // 如果没有缓存，进行检测
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      const supported = webP.height === 2
      // 缓存结果
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(WEBP_SUPPORT_CACHE_KEY, String(supported))
      }
      resolve(supported)
    }
    webP.src =
      "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
  })
}

/**
 * 同步获取 WebP 支持状态（从缓存）
 * 如果缓存不存在，默认返回 true（现代浏览器都支持）
 * 这样可以避免初始加载非 WebP 资源
 */
export function getWebPSupportSync(): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    // SSR 环境，默认返回 true
    return true
  }

  const cached = window.localStorage.getItem(WEBP_SUPPORT_CACHE_KEY)
  if (cached !== null) {
    return cached === "true"
  }

  // 没有缓存时，默认假设支持（现代浏览器都支持 WebP）
  // 如果实际不支持，后续检测会更新缓存，下次就会使用正确的值
  return true
}

/**
 * 将图片 URL 转换为 WebP 格式
 * 支持多种转换方式：
 * 1. 内置图片：直接替换扩展名
 * 2. 在线图片：使用图片代理服务或 CDN 转换
 *
 * @param url 原始图片 URL
 * @param options 转换选项
 * @returns WebP 格式的 URL
 */
export function convertToWebP(
  url: string,
  options: {
    // 是否强制使用 WebP（即使浏览器不支持）
    force?: boolean
    // 图片代理服务 URL（用于在线图片转换）
    proxyUrl?: string
    // CDN 转换参数（如腾讯云、阿里云等）
    cdnParams?: string
  } = {}
): string {
  const { force = false, proxyUrl, cdnParams } = options

  // 如果是 data URL，直接返回
  if (url.startsWith("data:")) {
    return url
  }

  // 如果是内置图片（相对路径或 umi 处理后的路径），替换扩展名
  // 支持 umi 处理后的路径格式：/static/yay.7d162f31.jpg -> /static/yay.7d162f31.webp
  if (
    url.startsWith("./") ||
    url.startsWith("../") ||
    (!url.startsWith("http") && !url.startsWith("data:"))
  ) {
    // 匹配 .jpg, .jpeg, .png 扩展名（可能包含 hash）
    return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, ".webp$2")
  }

  // 在线图片处理
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // 方式1: 使用图片代理服务
    if (proxyUrl) {
      return `${proxyUrl}?url=${encodeURIComponent(url)}&format=webp`
    }

    // 方式2: 使用 CDN 参数转换（如腾讯云、阿里云等）
    if (cdnParams) {
      const separator = url.includes("?") ? "&" : "?"
      return `${url}${separator}${cdnParams}`
    }

    // 方式3: 使用在线图片转换服务（如 Cloudinary、ImageKit 等）
    // 这里提供一个示例，实际使用时需要根据服务商调整
    // return `https://your-image-service.com/convert?url=${encodeURIComponent(url)}&format=webp`;

    // 方式4: 简单替换扩展名（如果服务器支持）
    return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, ".webp$2")
  }

  return url
}

/**
 * 获取图片的最佳格式 URL
 * 如果浏览器支持 WebP，返回 WebP 格式；否则返回原始格式
 *
 * @param originalUrl 原始图片 URL
 * @param webpUrl WebP 格式的 URL（可选，如果不提供则自动生成）
 * @param webpSupported 浏览器是否支持 WebP（可选，如果不提供则自动检测）
 * @returns 最佳格式的 URL
 */
export async function getBestImageUrl(
  originalUrl: string,
  webpUrl?: string,
  webpSupported?: boolean
): Promise<string> {
  const isSupported =
    webpSupported !== undefined ? webpSupported : await checkWebPSupport()

  if (isSupported) {
    return webpUrl || convertToWebP(originalUrl)
  }

  return originalUrl
}

/**
 * 预加载图片
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}
```

### 创建 WebP 图片组件 ###

创建 `src/components/WebPImage.vue`：

```vue:WebPImage.vue
<template>
  <picture>
    <!-- 如果支持 WebP，优先使用 WebP -->
    <source
      v-if="webpSupported && webpSrc"
      :srcset="webpSrc"
      type="image/webp"
    />
    <!-- 回退到原始格式 -->
    <img
      :src="fallbackSrc"
      :alt="alt"
      :width="width"
      :height="height"
      :class="imgClass"
      :style="imgStyle"
      :loading="loading"
      @load="handleLoad"
      @error="handleError"
    />
  </picture>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import {
  checkWebPSupport,
  getWebPSupportSync,
  convertToWebP,
} from "../utils/image"

interface Props {
  // 原始图片 URL（必需）
  src: string
  // WebP 格式的 URL（可选，如果不提供则自动生成）
  webpSrc?: string
  // 图片描述
  alt?: string
  // 图片宽度
  width?: string | number
  // 图片高度
  height?: string | number
  // CSS 类名
  imgClass?: string
  // 内联样式
  imgStyle?: string | Record<string, any>
  // 懒加载
  loading?: "lazy" | "eager"
  // 图片代理服务 URL（用于在线图片转换）
  proxyUrl?: string
  // CDN 转换参数
  cdnParams?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: "",
  loading: "lazy",
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
}>()

// 使用同步方法获取初始值，避免初始加载非 WebP 资源
// 如果缓存不存在，默认假设支持（现代浏览器都支持）
// 后续异步检测会更新这个值
const webpSupported = ref(getWebPSupportSync())

// 计算 WebP 格式的 URL
const webpSrc = computed(() => {
  // 如果明确提供了 webpSrc，直接使用
  if (props.webpSrc) {
    return props.webpSrc
  }

  // 对于在线图片，只有在提供了转换方式时才生成 WebP URL
  const isOnlineImage =
    props.src.startsWith("http://") || props.src.startsWith("https://")
  if (isOnlineImage) {
    if (!props.proxyUrl && !props.cdnParams) {
      // 如果没有提供转换方式，返回空字符串，使用原始格式
      return ""
    }
    // 有转换方式，生成 WebP URL
    return convertToWebP(props.src, {
      proxyUrl: props.proxyUrl,
      cdnParams: props.cdnParams,
    })
  }

  // 对于内置图片（通过 import 导入的），自动尝试使用 WebP 版本
  // 构建脚本会在同目录下生成 .webp 文件，通过替换扩展名来引用
  // 如果 webp 文件不存在，浏览器会自动回退到原始图片
  return convertToWebP(props.src, {})
})

// 回退到原始格式
const fallbackSrc = computed(() => props.src)

// 在后台异步检测 WebP 支持（如果缓存不存在）
// 这样可以更新缓存，但不影响初始渲染
onMounted(async () => {
  // 如果已经有缓存，就不需要再次检测
  if (typeof window !== "undefined" && window.localStorage) {
    const cached = window.localStorage.getItem("__webp_support__")
    if (cached === null) {
      // 没有缓存，进行检测并更新
      const supported = await checkWebPSupport()
      // 如果检测结果与初始假设不同，更新状态
      // 但此时图片可能已经加载，浏览器会使用 <picture> 标签自动选择
      if (supported !== webpSupported.value) {
        webpSupported.value = supported
      }
    }
  } else {
    // 没有 localStorage，直接检测
    webpSupported.value = await checkWebPSupport()
  }
})

const handleLoad = (event: Event) => {
  emit("load", event)
}

const handleError = (event: Event) => {
  emit("error", event)
}
</script>
```

### 配置 TypeScript 类型声明 ###

创建 `src/types/images.d.ts`：

```typescript:images.d.ts
/**
 * 图片文件类型声明
 */
declare module "*.jpg" {
  const content: string
  export default content
}

declare module "*.jpeg" {
  const content: string
  export default content
}

declare module "*.png" {
  const content: string
  export default content
}

declare module "*.gif" {
  const content: string
  export default content
}

declare module "*.webp" {
  const content: string
  export default content
}

declare module "*.svg" {
  const content: string
  export default content
}

declare module "*.ico" {
  const content: string
  export default content
}

declare module "*.bmp" {
  const content: string
  export default content
}
```

### 配置 UmiJS ###

更新 `.umirc.ts`，添加 WebP 文件支持：

```typescript:.umirc.ts
import { defineConfig } from "umi"
import { routes } from "./src/router/index"

const isPrd = process.env.NODE_ENV === "production"

export default defineConfig({
  npmClient: "pnpm",
  presets: [require.resolve("@umijs/preset-vue")],
  manifest: {
    fileName: "manifest.json",
  },
  // 开发环境 vite ，线上环境 webpack 打包
  vite: isPrd ? false : {},
  chainWebpack: function (config, { webpack }) {
    // 配置 webp 文件支持（与 jpg/png 一样处理）
    // umi 默认已经处理图片，但可能不包含 webp，这里确保 webp 被正确处理
    // 使用 asset/resource 类型，让 webpack 将 webp 文件作为静态资源处理
    if (!config.module.rules.has("webp")) {
      config.module
        .rule("webp")
        .test(/\.webp$/)
        .type("asset/resource")
        .generator({
          filename: "static/[name].[hash:8][ext]",
        })
    }

    config.optimization.runtimeChunk(true)
    return config
  },
  codeSplitting: {
    jsStrategy: "depPerChunk",
  },
  hash: true,
  history: { type: "hash" },
  routes,
})
```

### 更新 `package.json` ###

在 `package.json` 中添加构建脚本：

```json:package.json
{
  "scripts": {
    "dev": "umi dev",
    "build": "pnpm build:images && umi build",
    "build:prd": "pnpm build:images && UMI_ENV=prd umi build",
    "build:images": "node scripts/convert-images.mjs",
    "postinstall": "umi setup",
    "start": "npm run dev",
    "preview": "umi preview",
    "analyze": "ANALYZE=1 umi build"
  }
}
```

## 使用方法 ##

### 基本使用 ###

```vue
<script setup lang="ts">
import WebPImage from "../components/WebPImage.vue"
import yayImage from "../assets/yay.jpg"
import yayWebpImage from "../assets/yay.webp"
</script>

<template>
  <div>
    <!-- 方式1: 自动检测并使用 WebP -->
    <WebPImage :src="yayImage" width="388" alt="图片" />

    <!-- 方式2: 手动指定 WebP 文件 -->
    <WebPImage
      :src="yayImage"
      :webp-src="yayWebpImage"
      width="388"
      alt="图片"
    />
  </div>
</template>
```

### 在线图片（使用 CDN 转换） ###

```vue
<template>
  <!-- 阿里云 OSS -->
  <WebPImage
    src="https://your-bucket.oss-cn-hangzhou.aliyuncs.com/image.jpg"
    cdn-params="x-oss-process=image/format,webp"
    width="500"
    alt="CDN 图片"
  />

  <!-- 腾讯云 COS -->
  <WebPImage
    src="https://your-bucket.cos.ap-shanghai.myqcloud.com/image.jpg"
    cdn-params="imageMogr2/format/webp"
    width="500"
    alt="CDN 图片"
  />
</template>
```

### 在线图片（使用代理服务） ###

```vue
<script setup lang="ts">
const proxyUrl = "https://your-image-proxy.com/convert"
</script>

<template>
  <WebPImage
    src="https://example.com/image.jpg"
    :proxy-url="proxyUrl"
    width="500"
    alt="在线图片"
  />
</template>
```

## 工作原理 ##

### 构建时转换 ###

- 运行 `pnpm build` 时，会先执行 `build:images` 脚本
- 脚本扫描 `src/assets` 目录下的所有 JPG/PNG 图片
- 使用 `imagemin-webp` 转换为 WebP 格式
- 转换后的文件保存在同一目录

### 运行时加载 ###

- 组件初始化时，使用 `getWebPSupportSync()` 同步获取 WebP 支持状态
- 如果缓存不存在，默认假设支持（避免重复加载）
- 使用 `<picture>` 标签，浏览器自动选择最佳格式
- 后台异步检测，更新缓存供下次使用

### 性能优化 ###

- 缓存机制：使用 `localStorage` 缓存检测结果
- 避免重复加载：初始值使用同步方法获取，避免先加载原始图片再加载 WebP
- 智能回退：使用 `<picture>` 标签，浏览器自动处理回退

## 效果对比 ##

测试结果显示，`yay.jpg` (177KB) 转换为 `yay.webp` (23KB) 后，文件大小减少了 *87.0%！*

## 注意事项 ##

- 开发环境：开发时不会自动转换，需要手动运行 `pnpm build:images`
- Git 管理：建议将 `.webp` 文件添加到 `.gitignore`，因为它们可以通过构建脚本自动生成
- 质量调整：可在 `scripts/convert-images.mjs` 中调整质量参数（默认 80）
- 浏览器兼容性：现代浏览器都支持 WebP，组件会自动检测并回退

## 总结 ##

通过以上配置，我们实现了：

- ✅ 构建时自动转换图片为 WebP
- ✅ 智能格式选择和自动回退
- ✅ 性能优化，避免重复加载
- ✅ 组件化封装，使用简单

这套方案可以显著提升页面加载速度，特别是在图片较多的场景下效果明显。希望这篇文章对你有帮助！
