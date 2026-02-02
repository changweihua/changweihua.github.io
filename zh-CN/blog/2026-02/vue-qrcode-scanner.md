---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 3 超强二维码识别
description: 多区域/多尺度扫描 + 高级图像处理
date: 2026-02-01 09:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

在前端项目里做二维码识别，经常会遇到“背景复杂识别难”“二维码很小识别率低”“识别慢”的痛点。本文给大家介绍一个基于 Vue 3 的二维码识别工具库 —— `vue-qrcode-scanner`，主打“识别稳、速度快、接入简单”。

- 支持多区域/多尺度扫描，优先命中高概率区域，提升首识别速度
- 内置多种图像预处理：OTSU、自适应阈值、锐化、对比度拉伸，复杂背景也能顶住
- 提供 Vue Composable API + 工具函数两套用法
- TypeScript 全量类型，开发体验友好

## ✨ 功能亮点 ##

- Vue 3 Composable：使用 Composition API，接入成本低
- 多区域扫描：优先常见位置（如右下角）+ 滑动窗口策略
- 多尺度扫描：自动在不同缩放级别尝试识别
- 自动定位：返回二维码位置坐标，可视化标记更方便
- 高级图像处理：OTSU、自适应阈值、锐化、对比度拉伸
- 零依赖：除 Vue 以外无额外依赖（二维码识别算法使用 jsQR）
- TypeScript 支持：完整类型定义，二次开发舒适

## 📦 安装 ##

```bash
npm install vue-qrcode-scanner
# 或
yarn add vue-qrcode-scanner
# 或
pnpm add vue-qrcode-scanner
```

识别二维码需要 `jsQR` 算法库，请一并安装：

```bash
npm install jsqr
```

## 🚀 快速开始（Composable 用法） ##

最简集成方式：直接在组件里调用 useQRCodeScanner。

:::demo

```vue
<template>
  <div>
    <input type="file" @change="handleFileSelect" accept="image/*" />
    <button @click="parseQRCode" :disabled="isLoading">
      {{ isLoading ? "解析中..." : "解析二维码" }}
    </button>

    <!-- 可选：Canvas 用于预览/辅助处理 -->
    <canvas ref="canvas" style="display: none"></canvas>

    <div v-if="resultMessage" :class="resultClass">
      <div v-html="resultMessage"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useQRCodeScanner } from "vue-qrcode-scanner/composables";

const selectedFile = ref(null);

const {
  resultMessage,
  isLoading,
  qrCode,
  canvas,
  resultClass,
  parseQRFromFile,
  clearResult,
} = useQRCodeScanner();

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0];
};

const parseQRCode = async () => {
  if (selectedFile.value) {
    await parseQRFromFile(selectedFile.value);
  }
};
</script>
```

:::

## 🌐 从 URL 解析 ##

```ts
import { useQRCodeScanner } from "vue-qrcode-scanner/composables";

const { parseQRFromUrl } = useQRCodeScanner();

const code = await parseQRFromUrl("https://example.com/qrcode.png");
if (code) {
  console.log("二维码内容:", code.data);
}
```

## 🧩 高级用法（直接使用工具函数） ##

你也可以跳过 Composable，直接使用底层的图像处理与扫描工具：

```ts
import { imageProcessors, qrScanner } from "vue-qrcode-scanner";

// 1) 图像预处理（灰度化、OTSU、自适应阈值、锐化、对比度拉伸等）
const imageData = ctx.getImageData(0, 0, width, height);
const processed = imageProcessors.preprocessImage(imageData);

// 2) 多区域/多尺度扫描
const code = qrScanner.scanRegions(ctx, width, height);
if (code) {
  console.log("二维码内容:", code.data);
  console.log("位置:", code.location);
}
```

## 🛠 API 摘要 ##

### Composable: `useQRCodeScanner()` ###

- 响应式状态：`resultMessage`、`isLoading`、`qrCode`、`canvas``、resultClass`

- 方法：

  - `parseQRFromFile(file: File): Promise<QRCode | null>`
  - `parseQRFromUrl(url: string): Promise<QRCode | null>`
  - `clearResult(): void`
  - `showCanvasPreview(): void`
  - `hideCanvasPreview(): void`

### 工具函数: `imageProcessors` ###

- `grayscale(imageData: ImageData): GrayData`
- `otsuThreshold(grayData: Uint8ClampedArray): number`
- `adaptiveThreshold(grayData, width, height, blockSize?, C?): Uint8ClampedArray`
- `sharpen(grayData, width, height): Uint8ClampedArray`
- `contrastStretch(grayData, minPercent?, maxPercent?): Uint8ClampedArray`
- `preprocessImage(imageData: ImageData): ProcessedImage[]`

### 工具函数: `qrScanner` ###

- `tryDecodeQR(imageData: ImageData): QRCode | null`
- `scanRegions(ctx, imgWidth, imgHeight): QRCode | null`
- `scanMultiScale(ctx, canvasElement, imgWidth, imgHeight): QRCode | null`
- `adjustCodeLocation(code, offsetX, offsetY): QRCode`
- `cropImageRegion(ctx, x, y, width, height): ImageData`

### 类型定义（节选） ###

```ts
interface QRCode {
  data: string;
  format?: string;
  location?: QRCodeLocation;
  regionName?: string;
  preprocessMethod?: string;
  scale?: number;
}

interface QRCodeLocation {
  topLeftCorner: { x: number; y: number };
  topRightCorner: { x: number; y: number };
  bottomLeftCorner: { x: number; y: number };
  bottomRightCorner: { x: number; y: number };
}
```

## ⚠️ 注意事项 & 实战经验 ##

- `jsQR` 为解析核心库，请确保已安装并正确引入
- 浏览器需支持 Canvas API；跨域图片请确保 CORS 允许，否则无法读取像素
- 大尺寸图片建议先等比压缩到合适尺寸（如最长边不超过 2000px）以提升速度
- 复杂背景下建议多尝试预处理组合（库内已内置多策略自动尝试）
- 如果需要在 UI 中高亮二维码位置，可结合返回的 `location` 四点坐标绘制
