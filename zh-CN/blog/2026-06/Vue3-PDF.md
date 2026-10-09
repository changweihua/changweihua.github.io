---
lastUpdated: true
commentabled: true
recommended: true
title: 移动端 Vue3 高清 PDF 预览组件开发
description: 支持手势缩放 + 按钮缩放 + 加载进度
date: 2026-06-05 13:35:00
pageClass: blog-page-class
cover: /covers/vue.svg
---


> 在移动端 H5 业务中，PDF 预览是高频需求（培训文档、合同、试卷、资料预览等）。原生浏览器 PDF 预览体验差、无法自定义、不支持手势缩放，因此基于 Vue3 + PDF.js 封装了一套生产可用、高性能、高清渲染的移动端 PDF 预览组件。

本文完整实现：

- ✅ 高清渲染（适配移动端高分屏）
- ✅ 双指手势缩放
- ✅ 按钮缩放 + 重置
- ✅ 加载进度条展示
- ✅ 错误处理 + 重新加载
- ✅ 内存安全释放
- ✅ 样式美观，直接用于生产


## 一、核心技术栈 ##

- Vue3 + `<script setup>`
- PDF.js（Mozilla 官方 PDF 解析库）
- Vant（加载、空状态、按钮）
- Axios（文件流下载 + 进度监听）

## 二、核心设计思路（重点） ##

为了保证清晰度 + 流畅缩放 + 低性能消耗，本组件采用分离设计：

- **渲染缩放（固定高清）**使用设备像素比 DPR 做高清渲染，保证文字不模糊，只渲染一次。
- **视觉缩放（CSS transform）**缩放不重新渲染，仅用 CSS scale 变换，极致流畅。
- 双指手势计算监听两指距离变化，动态计算缩放比例。
- 状态管理加载中 / 加载失败 / 渲染完成 三状态控制。

## 三、完整代码实现（可直接复制使用） ##

### Template 视图结构 ###

```vue
<template>
  <!-- PDF预览外层容器 -->
  <div class="pdf-preview-box">
    <!-- 加载中状态：显示加载动画和进度 -->
    <div v-if="loading" class="loading-wrapper">
      <van-loading type="spinner" size="32px">加载中... ({{ progress }}%)</van-loading>
    </div>

    <!-- 加载失败状态：显示错误提示和重试按钮 -->
    <div v-else-if="error" class="error-wrapper">
      <van-empty :description="errorMessage" />
      <van-button type="primary" size="small" @click="retry">
        重新加载
      </van-button>
    </div>

    <!-- PDF内容滚动容器：绑定手势 -->
    <div 
      v-show="!loading && !error" 
      class="pdf-scroll-wrapper" 
      :style="scrollWrapperStyle"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- PDF渲染容器 -->
      <div 
        class="pdf-container" 
        ref="containerRef"
        :style="containerStyle"
      />
    </div>

    <!-- 缩放控制面板 -->
    <div v-if="!loading && !error" class="zoom-controls">
      <div class="zoom-btn" @click="zoomOut">
        <van-icon name="minus" />
      </div>
      <div class="zoom-info">{{ Math.round(visualScale * 100) }}%</div>
      <div class="zoom-btn" @click="zoomIn">
        <van-icon name="plus" />
      </div>
      <div class="zoom-btn reset-btn" @click="resetZoom">
        重置
      </div>
    </div>
  </div>
</template>
```

### Script Setup 核心逻辑 ###

```vue
<script setup>
import { ref, shallowRef, defineProps, watch, onMounted, onUnmounted, computed } from 'vue';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { commonProps } from './commonProps';
import request from '@/utils/request';

// 配置 Worker
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const props = defineProps(commonProps());

// 状态
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('加载失败');
const progress = ref(0);
const containerRef = ref(null);
const pdfDoc = shallowRef(null);

// 高清渲染倍率
const renderScale = computed(() => {
  const dpr = window.devicePixelRatio || 1;
  return Math.min(Math.max(dpr, 2.5), 4.0);
});

const contentWidth = ref(0);
const contentHeight = ref(0);

// 手势缩放状态
const touchState = ref({
  startDistance: 0,
  isZooming: false,
  baseScale: 1.0,
});

// 视觉缩放系数（CSS scale）
const visualScale = ref(1.0);

// 滚动容器样式（动态计算缩放后宽高）
const scrollWrapperStyle = computed(() => ({
  width: contentWidth.value ? `${contentWidth.value * visualScale.value}px` : '100%',
  height: contentHeight.value ? `${contentHeight.value * visualScale.value}px` : 'auto',
  minWidth: '100%',
  minHeight: '100%',
  position: 'relative',
  overflow: 'hidden',
}));

// PDF 容器样式（缩放变换）
const containerStyle = computed(() => ({
  transform: `scale(${visualScale.value})`,
  transformOrigin: '0 0',
  transition: touchState.value.isZooming ? 'none' : 'transform 0.2s ease',
  position: 'absolute',
  top: 0,
  left: 0,
  width: contentWidth.value ? `${contentWidth.value}px` : '100%',
  height: contentHeight.value ? `${contentHeight.value}px` : 'auto',
}));

// 计算双指距离
const getDistance = (touches) => {
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  );
};

// 触摸开始
const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    touchState.value.isZooming = true;
    touchState.value.startDistance = getDistance(e.touches);
    touchState.value.baseScale = visualScale.value;
  }
};

// 触摸移动（双指缩放）
const handleTouchMove = (e) => {
  if (e.touches.length === 2 && touchState.value.isZooming) {
    e.preventDefault();
    const currentDistance = getDistance(e.touches);
    const ratio = currentDistance / touchState.value.startDistance;
    let newScale = touchState.value.baseScale * ratio;
    newScale = Math.min(Math.max(newScale, 0.5), 4.0);
    visualScale.value = newScale;
  }
};

// 触摸结束
const handleTouchEnd = () => {
  touchState.value.isZooming = false;
};

// 渲染单页 PDF
const renderPage = async (num) => {
  if (!pdfDoc.value || !containerRef.value) return;
  try {
    const page = await pdfDoc.value.getPage(num);
    const screenWidth = window.innerWidth;
    const originalViewport = page.getViewport({ scale: 1 });
    const baseScale = screenWidth / originalViewport.width;
    const finalScale = baseScale * renderScale.value;
    const viewport = page.getViewport({ scale: finalScale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    canvas.style.width = `${screenWidth}px`;
    canvas.style.height = 'auto';
    canvas.style.marginBottom = '10px';
    canvas.style.display = 'block';

    await page.render({ canvasContext: ctx, viewport }).promise;
    containerRef.value.appendChild(canvas);
  } catch (err) {
    console.error(`第 ${num} 页渲染失败`, err);
  }
};

// 放大
const zoomIn = () => {
  if (visualScale.value >= 4) return;
  visualScale.value = parseFloat((visualScale.value + 0.2).toFixed(1));
};

// 缩小
const zoomOut = () => {
  if (visualScale.value <= 0.5) return;
  visualScale.value = parseFloat((visualScale.value - 0.2).toFixed(1));
};

// 重置缩放
const resetZoom = () => {
  visualScale.value = 1.0;
};

// 加载 PDF 主逻辑
const loadPdf = async () => {
  if (!props.url) return;
  loading.value = true;
  error.value = false;
  visualScale.value = 1.0;
  containerRef.value?.innerHTML = '';

  try {
    let url = props.url;
    if (url.startsWith(window.location.origin)) url = url.replace(window.location.origin, '');

    const res = await request({
      url,
      method: 'get',
      responseType: 'arraybuffer',
      onDownloadProgress: (e) => {
        if (e.total) progress.value = Math.floor((e.loaded / e.total) * 100);
      },
      loading: false,
    });

    const data = res.data;
    if (!data || !data.byteLength) throw new Error('文件内容为空');

    const loadingTask = pdfjsLib.getDocument({
      data,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/cmaps/',
      cMapPacked: true,
    });

    pdfDoc.value = await loadingTask.promise;
    for (let i = 1; i <= pdfDoc.value.numPages; i++) await renderPage(i);

    setTimeout(() => {
      contentWidth.value = containerRef.value.scrollWidth || window.innerWidth;
      contentHeight.value = containerRef.value.scrollHeight;
    }, 300);

    loading.value = false;
    props.onLoad?.();
  } catch (err) {
    loading.value = false;
    error.value = true;
    if (err.message === '文件内容为空') {
      errorMessage.value = '文件为空，无法预览';
    } else if (err.name === 'InvalidPDFException') {
      errorMessage.value = 'PDF 格式损坏或无效';
    } else {
      errorMessage.value = '预览失败，请重试';
    }
  }
};

// 重试
const retry = () => loadPdf();

watch(() => props.url, loadPdf);
onMounted(loadPdf);
onUnmounted(() => pdfDoc.value?.destroy());
</script>
```

### Style 样式（移动端友好） ###

```vue
<style scoped>
.pdf-preview-box {
  width: 100%;
  height: calc(100vh - 100px);
  overflow: auto;
  background: #f5f5f5;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.error-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
}

.pdf-container {
  display: flex;
  flex-direction: column;
  will-change: transform;
}

.zoom-controls {
  position: fixed;
  bottom: 80px;
  right: 20px;
  background: rgba(255,255,255,0.92);
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  padding: 10px 6px;
  z-index: 100;
}

.zoom-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
}

.zoom-info {
  font-size: 12px;
  color: #666;
  text-align: center;
  margin: 4px 0;
}

.reset-btn {
  font-size: 12px;
  border-top: 1px solid #eee;
  padding-top: 6px;
}

:deep(canvas) {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  max-width: none !important;
}
</style>

<script>
export default { name: 'PdfPreview' }
</script>
```

## 四、核心亮点技术解析 ##

### 高清渲染机制 ###

```js
const renderScale = computed(() => {
  const dpr = window.devicePixelRatio || 1;
  return Math.min(Math.max(dpr, 2.5), 4.0);
});
```

- 自动适配手机像素比
- 最低 2.5 倍清晰度，解决移动端文字模糊
- 上限 4 倍，避免内存占用过大

### 高性能缩放（不重渲染） ###

```js
transform: `scale(${visualScale.value})`
```

- 纯 CSS 缩放，流畅不卡顿
- 手势 / 按钮双控制
- 缩放区间 0.5 ~ 4.0 倍

### 双指手势实现 ###

- 监听 `touchstart` 记录两指初始距离
- `touchmove` 计算比例动态缩放
- `e.preventDefault()` 防止浏览器默认行为冲突

### 完整异常处理 ###

- 文件为空
- PDF 格式损坏
- 网络请求失败
- 支持重新加载

## 五、组件使用方式 ##

```html
<PdfPreview
  url="/api/file/xxx.pdf或二进制流"
  @load="handleLoad"
/>
```

## 六、总结 ##

这套 Vue3 移动端 PDF 预览组件已经在生产环境稳定运行，具备：

- 高清渲染不模糊
- 手势 / 按钮缩放流畅
- 加载进度、错误、重试齐全
- 内存安全，无泄漏
- 样式美观，开箱即用

非常适合：

- 培训文档预览
- 合同 / 协议预览
- 学习资料预览
- 考试试卷预览
