---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 使用 Signature Pad 实现电子签名（签名位置偏差问题解决）
description: Vue3 使用 Signature Pad 实现电子签名（签名位置偏差问题解决）
date: 2025-08-05 10:35:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## Signature Pad 基础用法 ##

### 安装与引入 ###

首先需要安装 `signature_pad` 库：

```bash
npm install signature_pad
```

然后在Vue组件中引入：

```ts
import SignaturePad from "signature_pad";
```

### 基本实现 ###

```vue
<template>
  <div>
    <div class="signature-pad-container">
      <canvas ref="signaturePad"></canvas>
    </div>
    <button @click="clear">清除</button>
    <button @click="save">保存</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SignaturePad from 'signature_pad'

const signaturePad = ref(null)
let signaturePadInstance = null

onMounted(() => {
  signaturePadInstance = new SignaturePad(signaturePad.value)
})

const clear = () => {
  signaturePadInstance.clear()
}

const save = () => {
  const dataURL = signaturePadInstance.toDataURL()
  console.log(dataURL) // 输出签名图片的Base64编码
}
</script>
```

## 解决签名位置偏差问题 ##

### 问题根源分析 ###

签名位置偏差通常由以下原因导致：

- **Canvas尺寸与显示尺寸不匹配**：`Canvas` 有 `width` / `height` 属性和CSS的 `width` / `height` 样式，两者需要一致。
- **设备像素比(DPR)问题**：在高分辨率屏幕上，`CSS` 像素与设备像素不一致。
- **坐标系未校正**：未考虑设备像素比导致的事件坐标转换错误。

### 解决方案 ###

1. **获取设备像素比(DPR)**：设备像素比(Device Pixel Ratio)表示一个CSS像素对应多少个设备物理像素。

```ts
const dpr = window.devicePixelRatio || 1;
```

2. **正确设置Canvas尺寸**：确保了 Canvas 内部绘制缓冲区的大小与屏幕显示大小成正确比例。

```ts
const rect = canvas.getBoundingClientRect();
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
canvas.style.width = `${rect.width}px`;
canvas.style.height = `${rect.height}px`;
```

3. **初始化签名板并调整笔迹粗细**：根据 DPI 调整笔迹粗细，确保在高分辨率设备上线条不会显得过细。

```ts
const baseWidth = 2;
signaturePadInstance = new SignaturePad(canvas, {
  minWidth: baseWidth * dpr,
  maxWidth: baseWidth * dpr * 2,
  // 其他配置...
});
```

4. **坐标系校正**：（关键）使事件坐标与实际绘制位置匹配。

```ts
const ctx = canvas.getContext("2d");
ctx.scale(dpr, dpr);
```

5. **触摸设备支持**：禁用触摸设备的默认滚动行为，确保签名体验流畅。

```ts
canvas.addEventListener("touchstart", preventScroll, { passive: false });
canvas.addEventListener("touchmove", preventScroll, { passive: false });

const preventScroll = (e) => {
  e.preventDefault();
};
```

6. **响应式处理**：监听窗口大小变化并重新初始化签名板，确保在响应式布局中正常工作。

```ts
const handleResize = () => {
  if (signaturePadInstance) {
    initSignaturePad(); // 重新初始化以适应新尺寸
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
```

### 代码 ###

```ts
const initSignaturePad = () => {
  nextTick(() => {
    const canvas = signaturePad.value;
    if (canvas) {
      // 1. 获取设备像素比
      const dpr = window.devicePixelRatio || 1;
      
      // 2. 获取Canvas的实际显示尺寸
      const rect = canvas.getBoundingClientRect();
      
      // 3. 设置Canvas的实际绘制尺寸(考虑DPI)
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // 4. 设置Canvas的CSS显示尺寸(保持与容器一致)
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      // 5. 根据DPI调整笔迹粗细
      const baseWidth = 2;
      
      // 6. 初始化签名板
      signaturePadInstance = new SignaturePad(canvas, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "rgb(0, 0, 0)",
        minWidth: baseWidth * dpr,
        maxWidth: baseWidth * dpr * 2,
        throttle: 16 // 节流控制提高性能
      });
      
      // 7. 调整坐标系以匹配高DPI
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      
      // 8. 添加触摸设备支持
      canvas.addEventListener("touchstart", preventScroll, { passive: false });
      canvas.addEventListener("touchmove", preventScroll, { passive: false });
    }
  });
};
```

## 完整代码 ##

```vue
<template>
  <div class="signature-container">
    <h2>电子签名</h2>
    <div class="signature-pad-container">
      <canvas ref="signaturePad" class="signature-pad"></canvas>
    </div>
    <div class="signature-actions">
      <el-button @click="clearSignature">清除</el-button>
      <el-button type="primary" @click="saveSignature">保存签名</el-button>
    </div>
    <div v-if="signatureUrl" class="signature-preview">
      <el-image v-if="signatureUrl" :src="signatureUrl"></el-image>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import SignaturePad from "signature_pad";

const signaturePad = ref(null);
let signaturePadInstance = null;
const signatureUrl = ref("");

const initSignaturePad = () => {
  nextTick(() => {
    const canvas = signaturePad.value;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    const baseWidth = 2;
    
    signaturePadInstance = new SignaturePad(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      penColor: "rgb(0, 0, 0)",
      minWidth: baseWidth * dpr,
      maxWidth: baseWidth * dpr * 2,
      throttle: 16,
      velocityFilterWeight: 0.7,
      minDistance: 5
    });
    
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    
    // 触摸支持
    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });
  });
};

const preventScroll = (e) => {
  e.preventDefault();
};

const clearSignature = () => {
  if (signaturePadInstance) {
    signaturePadInstance.clear();
    signatureUrl.value = "";
  }
};

const saveSignature = () => {
  if (!signaturePadInstance || signaturePadInstance.isEmpty()) {
    ElMessage.warning("请先签名");
    return;
  }
  
  // 保存高质量PNG
  signatureUrl.value = signaturePadInstance.toDataURL('image/png', 1.0);
  ElMessage.success("签名保存成功");
};

const handleResize = () => {
  if (signaturePadInstance) {
    initSignaturePad();
  }
};

onMounted(() => {
  initSignaturePad();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.signature-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.signature-pad-container {
  position: relative;
  width: 100%;
  height: 400px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin: 20px 0;
}

.signature-pad {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  touch-action: none;
}

.signature-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 20px;
}

.signature-preview {
  margin-top: 20px;
  text-align: center;
}
</style>
```
