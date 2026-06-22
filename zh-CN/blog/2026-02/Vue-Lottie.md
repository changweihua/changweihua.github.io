---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 中 Lottie 动画库的使用指南
description: Vue3 中 Lottie 动画库的使用指南
date: 2026-02-01 12:00:00 
pageClass: blog-page-class
cover: /covers/lottie.svg
---

Lottie 是 Airbnb 开源的一款跨平台动画渲染库，能够将 AE（After Effects）制作的动画导出为 JSON 格式，并在 Web、iOS、Android 等平台无缝渲染，完美还原设计师的动画效果。在 Vue3 项目中集成 Lottie，既能提升页面交互体验，又能避免传统 GIF / 视频动画的性能问题和体积冗余。本文将详细讲解 Vue3 中 Lottie 的安装、基础使用、高级配置及实战技巧。

## 一、核心优势 ##

在开始集成前，先了解 Lottie 适配 Vue3 项目的核心价值：

- 轻量化：JSON 动画文件体积远小于 GIF / 视频，且支持按需加载；
- 可交互：可通过代码控制动画播放、暂停、跳转、循环等，支持自定义交互逻辑；
- 矢量渲染：动画基于矢量，适配不同分辨率设备无模糊；
- Vue3 友好：支持组合式 API（Setup），可封装为通用组件，复用性强。

## 二、环境准备与安装 ##

### 依赖安装 ###

Vue3 项目中推荐使用 `lottie-web`（官方 Web 端实现），通过 npm/yarn/pnpm 安装：

```sh
npm install lottie-web // [!=npm auto]
```

### 动画资源准备 ###

Lottie 依赖 AE 导出的 JSON 动画文件，获取方式：

- 设计师使用 AE 制作动画，通过 `Bodymovin` 插件导出 JSON 文件；
- 从 Lottie 官方素材库获取免费动画：LottieFiles。

将下载的 JSON 动画文件放入 Vue3 项目的 `public` 或 `src/assets` 目录（推荐 `public`，避免打包路径问题）。

## 三、基础使用：封装通用 Lottie 组件 ##

为了在项目中复用，我们先封装一个通用的 Lottie 组件（支持 Vue3 组合式 API）。

### 创建 Lottie 通用组件 ###

在 `src/components` 目录下新建 LottieAnimation.vue：

```vue:LottieAnimation.vue
<template>
  <!-- 动画容器，需指定宽高 -->
  <div ref="lottieContainer" class="lottie-container" :style="{ width, height }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import lottie from 'lottie-web';

// 定义 Props
const props = defineProps({
  // 动画 JSON 文件路径
  animationData: {
    type: Object,
    required: false,
    default: null
  },
  path: {
    type: String,
    required: false,
    default: ''
  },
  // 动画宽高
  width: {
    type: String,
    default: '300px'
  },
  height: {
    type: String,
    default: '300px'
  },
  // 是否自动播放
  autoplay: {
    type: Boolean,
    default: true
  },
  // 是否循环播放
  loop: {
    type: Boolean,
    default: true
  },
  // 动画速度（1 为正常速度）
  speed: {
    type: Number,
    default: 1
  },
  // 渲染方式（svg/canvas/html），优先 svg（矢量）
  renderer: {
    type: String,
    default: 'svg',
    validator: (val) => ['svg', 'canvas', 'html'].includes(val)
  }
});

// 定义 Emits：暴露动画状态事件
const emit = defineEmits(['complete', 'loopComplete', 'enterFrame']);

// 动画容器 Ref
const lottieContainer = ref(null);
// Lottie 实例
let lottieInstance = null;

// 初始化动画
const initLottie = () => {
  if (!lottieContainer.value) return;

  // 销毁旧实例（避免重复渲染）
  if (lottieInstance) {
    lottieInstance.destroy();
  }

  // 创建 Lottie 实例
  lottieInstance = lottie.loadAnimation({
    container: lottieContainer.value, // 动画容器
    animationData: props.animationData, // 动画 JSON 数据（本地导入）
    path: props.path, // 动画 JSON 文件路径（远程/ public 目录）
    renderer: props.renderer, // 渲染方式
    loop: props.loop, // 循环播放
    autoplay: props.autoplay, // 自动播放
    name: 'lottie-animation' // 动画名称（可选）
  });

  // 设置动画速度
  lottieInstance.setSpeed(props.speed);

  // 监听动画事件
  lottieInstance.addEventListener('complete', () => {
    emit('complete'); // 动画播放完成
  });
  lottieInstance.addEventListener('loopComplete', () => {
    emit('loopComplete'); // 动画循环完成
  });
  lottieInstance.addEventListener('enterFrame', (e) => {
    emit('enterFrame', e); // 动画每一帧
  });
};

// 监听 Props 变化，重新初始化
watch(
  [() => props.path, () => props.animationData, () => props.loop, () => props.speed],
  () => {
    initLottie();
  },
  { immediate: true }
);

// 组件卸载时销毁实例
onUnmounted(() => {
  if (lottieInstance) {
    lottieInstance.destroy();
    lottieInstance = null;
  }
});
</script>

<style scoped>
.lottie-container {
  display: inline-block;
  overflow: hidden;
}
</style>
```

### 基础使用示例 ###

在页面组件中引入并使用封装好的 `LottieAnimation` 组件，支持两种加载方式：

#### 方式 1：加载 public 目录下的 JSON 文件 ####

将动画文件 `animation.json` 放入 `public/lottie/` 目录，使用 path 传入路径：

:::demo

```vue
<template>
  <div class="flex flex-col gap-6 items-center">
    <h2>Lottie 基础使用示例</h2>
    <LottieAnimation
      path="/lottie/animation1.json"
      width="200px"
      height="200px"
      :speed="1.2"
      @complete="handleAnimationComplete"
    />
  </div>
</template>

<script setup lang="ts">
// 动画播放完成回调
const handleAnimationComplete = () => {
  console.log('动画播放完成！');
};
</script>
```

:::

#### 方式 2：本地导入 JSON 文件（需配置 loader） ####

如果将动画文件放在 `src/assets` 目录，需先导入 JSON 文件（Vue3 + Vite 无需额外配置，Webpack 需确保支持 JSON 导入）：

:::demo

```vue
<template>
  <div class="flex flex-col gap-6 items-center">
    <LottieAnimation
      :animation-data="animationData"
      width="200px"
      height="200px"
      :autoplay="true"
      ref="lottieRef"
    />
    <button @click="playAnimation">播放动画</button>
    <button @click="pauseAnimation">暂停动画</button>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef} from 'vue';
// 导入本地 JSON 动画文件
import animationData from '/src/assets/lottie/animation2.json';

const animationDataRef = ref(animationData);
const lottieRef = ref();

// 播放动画
const playAnimation = () => {
  lottieRef.value && lottieRef.value.lottieInstance.play();
};

// 暂停动画
const pauseAnimation = () => {
  lottieRef.value && lottieRef.value.lottieInstance.pause();
};
</script>
```

:::

## 四、高级配置与交互控制 ##

Lottie 提供了丰富的 API 用于控制动画，以下是常用的交互场景：

### 手动控制播放 / 暂停 / 停止 ###

通过获取 Lottie 实例，调用内置方法：

```ts
// 播放动画
lottieInstance.play();

// 暂停动画
lottieInstance.pause();

// 停止动画（重置到第一帧）
lottieInstance.stop();

// 跳转到指定帧（frameNum 为帧编号）
lottieInstance.goToAndStop(frameNum, true);

// 跳转到指定帧并播放
lottieInstance.goToAndPlay(frameNum, true);
```

### 动态修改动画速度 ###

```javascript
// 设置速度（0.5 为慢放，2 为快放）
lottieInstance.setSpeed(0.5);

// 获取当前速度
const currentSpeed = lottieInstance.playSpeed;
```

### 控制循环模式 ###

```js
// 设置循环次数（0 为无限循环，1 为播放 1 次）
lottieInstance.loop = 0;

// 单独设置循环（立即生效）
lottieInstance.setLoop(true); // 无限循环
lottieInstance.setLoop(3); // 循环 3 次
```

### 监听动画进度 ###

通过 `enterFrame` 事件监听动画进度，实现进度条联动：

:::demo

```vue
<template>
<div class="flex flex-col gap-6 items-center">
  <LottieAnimation
    path="/lottie/animation2.json"
    @enterFrame="handleEnterFrame"
  />
  <input
    type="range"
    min="0"
    max="100"
    v-model="progress"
    @input="handleProgressChange"
  />
</div>
</template>

<script setup>
import { ref } from 'vue';

const progress = ref(0);
let totalFrames = 0;

// 监听每一帧，更新进度
const handleEnterFrame = (e) => {
  totalFrames = e.totalFrames;
  progress.value = Math.floor((e.currentFrame / totalFrames) * 100);
};

// 拖动进度条，跳转动画
const handleProgressChange = () => {
  const targetFrame = (progress.value / 100) * totalFrames;
  lottieInstance.goToAndPlay(targetFrame, true);
};
</script>
```

:::

## 五、性能优化与注意事项 ##

### 性能优化 ###

- 懒加载：非首屏动画使用 `v-if` 或动态导入，按需初始化；
- 销毁实例：组件卸载时务必调用 `destroy()` 销毁实例，避免内存泄漏；
- 选择渲染方式：优先使用 svg 渲染（矢量、轻量），复杂动画可使用 canvas；
- 压缩 JSON 文件：使用 LottieFiles 在线工具压缩动画 JSON，减少体积。

### 常见问题解决 ###

- 动画不显示：检查容器宽高是否设置、JSON 文件路径是否正确（`path` 以 `/` 开头表示 `public` 根目录）；
- 动画卡顿：减少动画层数和复杂路径，避免同时播放多个大型动画；
- 跨域问题：远程加载 JSON 文件需确保服务端开启 CORS；
- Vue3 打包路径问题：`animationData` 导入本地 JSON 时，Vite 需确保 `assetsInclude` 包含 `.json`（默认已支持）。

## 六、总结 ##

Lottie 是 Vue3 项目中实现高品质动画的最佳选择之一，通过封装通用组件可快速集成到项目中，结合其丰富的 API 能实现灵活的交互控制。本文从基础安装、组件封装、高级交互到性能优化，覆盖了 Lottie 在 Vue3 中的核心使用场景。合理使用 Lottie 可显著提升页面交互体验，同时兼顾性能与兼容性。

如果需要更复杂的场景（如动画分段播放、结合 Vuex/Pinia 控制动画状态），可基于本文的通用组件扩展，结合业务需求定制化开发。
