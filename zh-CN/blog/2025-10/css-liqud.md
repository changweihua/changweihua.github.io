---
lastUpdated: true
commentabled: true
recommended: true
title: CSS液态动画深度进阶
description: 变量驱动与关键帧创意实践（10个实战案例）
date: 2025-10-28 10:00:00 
pageClass: blog-page-class
cover: /covers/css.svg
---

> 从CSS变量的进阶应用逻辑到液态动画关键帧（@keyframes）的设计方法论


## 一、核心技术精讲：让液态动画“可控且自然” ##

在进入案例前，需先掌握两大核心技术的深度应用——这是实现10个案例的“底层逻辑”，而非单纯复制代码。

### CSS变量：液态动画的“参数化引擎” ###

CSS变量（`--*`）不仅是“统一赋值”的工具，更是实现“动态可控、场景适配、批量修改”的核心。进阶用法包括：

- 变量嵌套与计算：通过 `calc()` 实现变量依赖（如“液态元素大小=基础尺寸+动态偏移”），减少硬编码；

- 动态修改渠道：

    - JS控制：通过 `element.style.setProperty('--var-name', value)` 实时调整动画参数（如点击时放大波纹半径）；
    - 媒体查询：不同屏幕尺寸下自动切换变量（如移动端减小模糊度、缩短动画时长）；
    - 伪类联动：通过 `:hover`/`:active`/`:focus`动态覆盖变量（如 `hover` 时加深液态颜色）；

- 兼容性与降级：通过 `var(--var-name, fallback-value)` 设置默认值（如旧浏览器用纯色替代渐变）。

#### 示例：进阶变量定义 ####

```css
:root {
  /* 基础参数 */
  --liquid-base-size: 100px;
  --liquid-color-primary: #4a90e2;
  --liquid-animation-duration: 2s;
  
  /* 嵌套计算：波纹半径=基础尺寸的1.5倍 */
  --liquid-ripple-radius: calc(var(--liquid-base-size) * 1.5);
  
  /* 动态参数（可被JS/伪类覆盖） */
  --liquid-opacity: 0.8;
  --liquid-blur: 8px;
}

/* 媒体查询适配：移动端缩短动画时长 */
@media (max-width: 768px) {
  :root {
    --liquid-animation-duration: 1.2s;
    --liquid-blur: 5px;
  }
}

/* hover时修改变量 */
.liquid-element:hover {
  --liquid-opacity: 1;
  --liquid-color-primary: #357abd;
}
```

### `@keyframes`：液态动画的“形态导演” ###

液态动画的核心是“模拟水流的随机性与流动性”，而 `@keyframes` 的设计关键在于*打破“对称”与“匀速”*，通过“多关键帧+非线性 timing-function”实现自然效果。常见设计思路：

- **形态变化（`border-radius`）**：定义3-5个关键帧，每个关键帧设置不同的“水平/垂直圆角占比”（如 `40% 60% 70% 30%` / `50% 30% 60% 40%`），避免重复；
- **位置流动（`transform: translate`）**：结合细微的X/Y轴偏移（如 `translate(5px, -3px`)），模拟水流“无规则浮动”；
- **光泽动态（`linear-gradient/background-position`）**：关键帧中调整渐变角度（如 `135deg`→`180deg`→`225deg`）或背景位置，模拟光线在水面的反射变化；
- **层级叠加（多元素不同关键帧）**：多个液态元素使用相同动画但不同 `animation-delay`，制造“错落流动”的层次感（如气泡浮动、波纹扩散）；
- **`timing-function` 选择**：优先用`ease-in-out`（自然过渡）、`cubic-bezier(0.2, 0.8, 0.2, 1)`（模拟水的弹性），避免`linear`（生硬）。

#### 示例：液态形态关键帧设计 ####

```css
/* 模拟水流不规则变形 */
@keyframes liquid-shape {
  0% {
    border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
    background: linear-gradient(135deg, var(--liquid-color-primary), var(--liquid-color-secondary));
  }
  25% {
    border-radius: 38% 62% 50% 50% / 60% 30% 70% 40%;
    background: linear-gradient(160deg, var(--liquid-color-primary), var(--liquid-color-secondary));
  }
  50% {
    border-radius: 55% 45% 35% 65% / 55% 60% 40% 45%;
    background: linear-gradient(190deg, var(--liquid-color-primary), var(--liquid-color-secondary));
  }
  75% {
    border-radius: 60% 40% 70% 30% / 40% 55% 45% 60%;
    background: linear-gradient(220deg, var(--liquid-color-primary), var(--liquid-color-secondary));
  }
  100% {
    border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
    background: linear-gradient(135deg, var(--liquid-color-primary), var(--liquid-color-secondary));
  }
}
```

## 二、10个深度实战案例（附完整代码与解析） ##

以下案例覆盖“基础液态动效→实用UI组件→创意交互”，每个案例均采用“CSS变量驱动+@keyframes关键帧”，代码可直接运行，且标注“个性化修改点”方便拓展。

### 案例1：液态水波纹扩散（基础入门） ###

#### 效果描述 ####

点击元素后，从中心向外扩散多层半透明水波纹，模拟“水滴落入水面”的涟漪效果，波纹逐渐放大、变淡直至消失，支持多次点击叠加波纹。

#### 完整代码 ####

:::demo

```vue
<template>
  <div class="liqud-container1" ref="container">
    <div class="ripple-container1" ref="rippleContainer"></div>
  </div>
</template>
<script lang="ts" setup>
import { useTemplateRef, onMounted } from 'vue'

const rippleContainer = useTemplateRef<HTMLDivElement>('rippleContainer')
const container = useTemplateRef<HTMLDivElement>('container')

onMounted(() => {
  rippleContainer.value.addEventListener('click', (e) => {
    // 创建波纹元素
    const ripple = document.createElement('div');
    ripple.classList.add('ripple1');

    // 添加到容器
    rippleContainer.value.appendChild(ripple);

    // 动画结束后移除波纹（避免DOM堆积）
    setTimeout(() => {
      ripple.remove();
    }, parseFloat(getComputedStyle(container.value).getPropertyValue('--ripple-duration')) * 1000);
  });

})
</script>
<style>
.liqud-container1 {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f7ff;

  --ripple-color: #6dd5ed;
  /* 波纹颜色 */
  --ripple-duration: 1.5s;
  /* 波纹动画时长 */
  --ripple-base-size: 40px;
  /* 初始波纹大小 */
  --ripple-max-size: 200px;
  /* 最大波纹大小 */
  --ripple-opacity: 0.7;
  /* 初始透明度 */
}

/* 波纹容器（相对定位，承载绝对定位的波纹层） */
.ripple-container1 {
  position: relative;
  width: var(--ripple-base-size);
  height: var(--ripple-base-size);
  border-radius: 50%;
  background: var(--ripple-color);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(109, 213, 237, 0.3);
}

/* 波纹层（绝对定位，初始隐藏） */
.ripple1 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border: 2px solid var(--ripple-color);
  border-radius: 50%;
  opacity: 0;
  animation: ripple-expand var(--ripple-duration) ease-out forwards;
}

/* 波纹扩散关键帧 */
@keyframes ripple-expand {
  0% {
    width: var(--ripple-base-size);
    height: var(--ripple-base-size);
    opacity: var(--ripple-opacity);
    border-width: 2px;
  }

  100% {
    width: var(--ripple-max-size);
    height: var(--ripple-max-size);
    opacity: 0;
    border-width: 1px;
    /* 波纹扩大时变细 */
  }
}
</style>

```

:::

#### 核心解析 ####

- **多层波纹实现**：通过JS动态创建 `ripple` 元素，每次点击生成新波纹层，叠加形成“多圈涟漪”；
- **关键帧设计**：`ripple-expand` 关键帧控制“大小（`width`/`height`）+透明度（`opacity`）+边框宽度”，模拟波纹扩散时“变浅、变细”的物理特性；
- **性能优化**：动画结束后通过 `setTimeout` 移除波纹元素，避免DOM节点堆积；仅用 `transform` 和 `opacity`（硬件加速属性），无layout抖动。
- **个性化修改**：调整 `--ripple-color` 换波纹色，`--ripple-duration` 改扩散速度，`--ripple-max-size` 控制波纹范围。

### 案例2：液态进度条（实用组件） ###

#### 效果描述 ####

进度条填充过程中，填充部分呈现液态流动形态（`border-radius`动态变化），同时伴随细微的光泽移动，模拟“水流逐渐填满容器”的效果，支持通过JS动态设置进度值。

#### 完整代码 ####

:::demo

```vue
<template>
  <div class="liqud-container2" ref="container">
    <div class="progress-container">
      <div class="liquid-progress" id="liquidProgress"></div>
    </div>
    <div class="control-group">
      <button class="control-btn" data-progress="30">30%</button>
      <button class="control-btn" data-progress="65">65%</button>
      <button class="control-btn" data-progress="100">100%</button>
      <button class="control-btn" data-progress="0">重置</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useTemplateRef, onMounted, nextTick } from 'vue'

const container = useTemplateRef<HTMLDivElement>('container')

onMounted(() => {
  nextTick(() => {

    const liquidProgress = document.getElementById('liquidProgress');
    const controlBtns = document.querySelectorAll('.control-btn');

    // 点击按钮设置进度
    controlBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const progress = btn.getAttribute('data-progress');
        liquidProgress.style.width = `${progress}%`;
      });
    });
  })


})
</script>
<style>
.liqud-container2 {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  background: #f8fafc;
  padding: 2rem;

  --progress-bg: #e0e8f0;
  /* 进度条背景色 */
  --liquid-progress-color: #2193b0;
  /* 液态进度色 */
  --liquid-progress-secondary: #6dd5ed;
  /* 液态进度辅助色（渐变） */
  --progress-height: 24px;
  /* 进度条高度 */
  --progress-radius: 12px;
  /* 进度条容器圆角 */
  --liquid-animation-duration: 1.2s;
  /* 液态形态动画时长 */
  --progress-padding: 2px;
  /* 进度条内边距（避免液态溢出） */
}

/* 进度条容器 */
.progress-container {
  width: 100%;
  max-width: 600px;
  height: var(--progress-height);
  background: var(--progress-bg);
  border-radius: var(--progress-radius);
  padding: var(--progress-padding);
  overflow: hidden;
  /* 隐藏液态超出部分 */
}

/* 液态进度填充层 */
.liquid-progress {
  height: 100%;
  width: 0%;
  /* 初始进度0%，JS动态修改 */
  border-radius: calc(var(--progress-radius) - var(--progress-padding));
  background: linear-gradient(90deg, var(--liquid-progress-color), var(--liquid-progress-secondary));
  animation: liquid-shape var(--liquid-animation-duration) ease-in-out infinite alternate;
  transition: width 0.8s ease;
  /* 进度变化平滑过渡 */
  will-change: width, border-radius;
  /* 硬件加速 */
}

/* 液态形态关键帧 */
@keyframes liquid-shape {
  0% {
    border-radius: 45% 55% 60% 40% / 50% 45% 55% 50%;
    background-position: 0% 50%;
  }

  100% {
    border-radius: 55% 45% 40% 60% / 55% 50% 45% 50%;
    background-position: 100% 50%;
  }
}

/* 控制按钮 */
.control-btn {
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--liquid-progress-color);
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  margin: 0 0.5rem;
  transition: background 0.3s;
}

.control-btn:hover {
  background: #1a7b96;
}
</style>
```

:::

#### 核心解析 ####

- 进度与液态结合：`liquid-progress` 的 `width` 通过JS控制（进度变化），`border-radius` 通过 `liquid-shape` 关键帧控制（液态形态），两者独立又协同；
- 光泽动态：渐变背景用 `background-position` 在关键帧中移动，模拟“水流表面光泽流动”；
- 边界处理：容器 `padding`+液态层 `border-radius` 计算（`calc(var(--progress-radius) - var(--progress-padding))`），避免液态填充时溢出容器圆角；
- 个性化修改：`--progress-height` 调整进度条粗细，`--liquid-progress-color`换填充色，`--liquid-animation-duration`改形态变化速度。


### 案例3：水纹触发按钮（交互增强） ###

#### 效果描述 ####

按钮默认是简洁圆角矩形，`hover` 时边缘呈现液态波动，点击时从点击位置向外扩散水纹（跟随鼠标位置），松开后水纹消失，液态波动恢复，适合强调交互反馈的按钮（如提交、确认）。

#### 完整代码 ####

:::demo

```vue
<template>
  <div class="liqud-container3" id="liqud-container3">
    <button class="liquid-btn" id="waterRippleBtn">点击触发水纹</button>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, nextTick } from 'vue'

onMounted(() => {
  nextTick(() => {

    const waterRippleBtn = document.getElementById('waterRippleBtn');

    // 点击时创建水纹（跟随鼠标位置）
    waterRippleBtn.addEventListener('click', (e) => {
      // 获取按钮位置信息
      const btnRect = waterRippleBtn.getBoundingClientRect();
      // 计算鼠标在按钮内的相对位置
      const x = e.clientX - btnRect.left;
      const y = e.clientY - btnRect.top;

      // 创建水纹元素
      const ripple = document.createElement('div');
      ripple.classList.add('btn-ripple');
      // 定位水纹到点击位置
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      // 添加到按钮
      waterRippleBtn.appendChild(ripple);

      // 动画结束后移除水纹
      setTimeout(() => {
        ripple.remove();
      }, parseFloat(getComputedStyle(document.getElementById('liqud-container3')).getPropertyValue('--ripple-duration')) * 1000);
    });
  })


})
</script>
<style>
.liqud-container3 {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f5ff;

  --btn-bg: #74b9ff;
  /* 按钮背景色 */
  --btn-bg-hover: #5ba0ff;
  /* hover背景色 */
  --ripple-color: rgba(255, 255, 255, 0.6);
  /* 水纹颜色（半透明白） */
  --btn-padding: 1rem 2.5rem;
  /* 按钮内边距 */
  --btn-radius: 12px;
  /* 按钮圆角 */
  --liquid-wave-duration: 2s;
  /* 边缘液态波动时长 */
  --ripple-duration: 0.8s;
  /* 水纹扩散时长 */
  --btn-bg: #74b9ff;
  /* 按钮背景色 */
  --btn-bg-hover: #5ba0ff;
  /* hover背景色 */
  --ripple-color: rgba(255, 255, 255, 0.6);
  /* 水纹颜色（半透明白） */
  --btn-padding: 1rem 2.5rem;
  /* 按钮内边距 */
  --btn-radius: 12px;
  /* 按钮圆角 */
  --liquid-wave-duration: 2s;
  /* 边缘液态波动时长 */
  --ripple-duration: 0.8s;
  /* 水纹扩散时长 */
}

/* 按钮容器（相对定位，承载水纹） */
.liqud-container3 .liquid-btn {
  position: relative;
  padding: var(--btn-padding);
  background: var(--btn-bg);
  color: #fff;
  border: none;
  border-radius: var(--btn-radius);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  /* 隐藏水纹溢出 */
  transition: background 0.3s;
  animation: btn-wave var(--liquid-wave-duration) ease-in-out infinite alternate;
}

.liquid-btn:hover {
  background: var(--btn-bg-hover);
}

/* 按钮边缘液态波动关键帧 */
@keyframes btn-wave {
  0% {
    border-radius: var(--btn-radius) calc(var(--btn-radius) * 1.2) var(--btn-radius) calc(var(--btn-radius) * 0.8);
  }

  100% {
    border-radius: calc(var(--btn-radius) * 0.8) var(--btn-radius) calc(var(--btn-radius) * 1.2) var(--btn-radius);
  }
}

/* 水纹元素（绝对定位，跟随点击位置） */
.btn-ripple {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--ripple-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: btn-ripple-expand var(--ripple-duration) ease-out forwards;
}

/* 水纹扩散关键帧 */
@keyframes btn-ripple-expand {
  0% {
    width: 10px;
    height: 10px;
    opacity: 1;
  }

  100% {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}
</style>
```

:::

#### 核心解析 ####

- 双层交互反馈：`btn-wave` 关键帧控制按钮边缘液态波动（hover持续），`btn-ripple-expand` 控制点击水纹（单次触发），覆盖“hover→点击”全交互链路；
- 鼠标位置跟随：通过 `getBoundingClientRect()` 计算鼠标在按钮内的相对位置，让水纹从点击点生成，增强“精准交互”的真实感；
溢出控制：按钮 `overflow: hidden` 确保水纹不超出按钮边界，避免视觉混乱；
- 个性化修改：`--ripple-color` 换水纹色（如改为淡蓝色），`--btn-radius` 调整按钮圆角，`--liquid-wave-duration` 改边缘波动速度。

### 案例4：液态气泡浮动（创意装饰） ###

#### 效果描述 ####

多个大小、透明度不同的液态气泡在容器内无规则浮动，气泡形态随浮动过程动态变化，模拟“水中气泡上升”的效果，可作为页面背景装饰（如登录页、产品介绍页）。

#### 完整代码 ####

:::demo

```vue
<template>
  <div class="bubble-container" ref="bubbleContainer"></div>
</template>
<script lang="ts" setup>
import { onMounted, nextTick, useTemplateRef } from 'vue'

const bubbleContainer = useTemplateRef<HTMLDivElement>('bubbleContainer')
const bubbleCount = 15; // 气泡数量

// 随机生成气泡
function createBubbles() {
  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('liquid-bubble');

    // 1. 随机尺寸（min ~ max）
    const size = Math.random() * (parseFloat(getComputedStyle(bubbleContainer.value).getPropertyValue('--bubble-max-size')) - parseFloat(getComputedStyle(bubbleContainer.value).getPropertyValue('--bubble-min-size'))) + parseFloat(getComputedStyle(bubbleContainer.value).getPropertyValue('--bubble-min-size'));
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    // 2. 随机初始X位置（容器宽度内）
    const startX = Math.random() * (bubbleContainer.value.clientWidth - size);
    bubble.style.left = `${startX}px`;

    // 3. 随机浮动时长（min ~ max）
    const floatDuration = Math.random() * (parseFloat(getComputedStyle(bubbleContainer.value).getPropertyValue('--float-duration-max')) - parseFloat(getComputedStyle(bubbleContainer.value).getPropertyValue('--float-duration-min'))) + parseFloat(getComputedStyle(bubbleContainer.value).getPropertyValue('--float-duration-min'));
    bubble.style.setProperty('--float-duration', `${floatDuration}s`);

    // 4. 随机左右偏移量（模拟无规则浮动）
    const xOffset = Math.random() * 100 - 50; // -50px ~ 50px
    bubble.style.setProperty('--x-offset', `${xOffset}px`);

    // 5. 随机动画延迟（避免气泡同步）
    bubble.style.animationDelay = `${Math.random() * 5}s`;

    // 添加到容器
    bubbleContainer.value.appendChild(bubble);
  }
}

// 窗口 resize 时重新生成气泡（避免适配问题）
window.addEventListener('resize', () => {
  bubbleContainer.value.innerHTML = '';
  createBubbles();
});

onMounted(() => {
  nextTick(() => {
    // 页面加载时生成气泡
    createBubbles()
  })

})
</script>
<style>
/* 气泡容器（全屏背景） */
.bubble-container {
  width: 100%;
  height: 300px;
  background: var(--bubble-container-bg);
  position: relative;
  overflow: hidden;
  /* 隐藏超出容器的气泡 */

  --bubble-color-primary: rgba(116, 185, 255, 0.7);
  /* 主气泡色 */
  --bubble-color-secondary: rgba(109, 213, 237, 0.5);
  /* 次气泡色 */
  --bubble-container-bg: #f0f7ff;
  /* 容器背景色 */
  --bubble-min-size: 20px;
  /* 气泡最小尺寸 */
  --bubble-max-size: 80px;
  /* 气泡最大尺寸 */
  --float-duration-min: 8s;
  /* 浮动最短时长 */
  --float-duration-max: 15s;
  /* 浮动最长时长 */
}

/* 液态气泡通用样式 */
.liquid-bubble {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--bubble-color-primary), var(--bubble-color-secondary));
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.4);
  /* 气泡内反光 */
  animation:
    bubble-float var(--float-duration, 10s) linear infinite,
    /* 浮动动画 */
    bubble-shape 4s ease-in-out infinite alternate;
  /* 形态变化动画 */
  will-change: transform, border-radius;
}

/* 气泡浮动关键帧（上升+左右偏移） */
@keyframes bubble-float {
  0% {
    transform: translate(0, 100vh) scale(0.8);
    /* 初始位置：底部，缩小 */
    opacity: 0.4;
  }

  50% {
    opacity: 0.8;
    /* 中间位置：透明度最高 */
  }

  100% {
    transform: translate(calc(var(--x-offset, 50px)), -10vh) scale(1.2);
    /* 结束位置：顶部，放大 */
    opacity: 0;
    /* 顶部消失 */
  }
}

/* 气泡形态变化关键帧 */
@keyframes bubble-shape {
  0% {
    border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
  }

  100% {
    border-radius: 58% 42% 30% 70% / 55% 55% 45% 45%;
  }
}
</style>

```

:::

#### 核心解析 ####

- 随机化设计：通过JS随机生成气泡的尺寸、初始位置、浮动时长、偏移量、动画延迟，避免“机械同步”，模拟真实气泡的随机性；
双动画叠加：`bubble-float`（上升+透明度变化）与 `bubble-shape`（形态变化）叠加，实现“浮动中变形”的自然效果；
响应式适配：窗口 `resize` 时重新生成气泡，确保在不同屏幕尺寸下气泡始终在容器内浮动；
个性化修改：`--bubble-count`（需在JS中调整）改气泡数量，`--bubble-color-primary` 换水色，`--float-duration-max`改气泡上升速度。

### 案例5：水波纹加载动画（反馈组件） ###

#### 效果描述 ####

加载过程中，中心圆形持续向外扩散多层水波纹，波纹的大小、透明度、形态随时间动态变化，同时中心圆形呈现液态波动，适合作为页面加载、数据请求的反馈动画。

#### 完整代码 ####

:::demo

```vue
<template>
  <div class="liqud-container5" id="liqud-container5">
    <div class="liquid-loader" id="liquidLoader">
      <div class="loader-core"></div>
      <!-- 波纹层通过JS动态生成 -->
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, nextTick } from 'vue'

onMounted(() => {
  nextTick(() => {

    const liquidLoader = document.getElementById('liquidLoader');
    const liquidContainer = document.getElementById('liqud-container5');
    const rippleLayerCount = parseInt(getComputedStyle(liquidContainer).getPropertyValue('--ripple-layer-count'));

    // 生成波纹层
    function createRipples() {
      for (let i = 0; i < rippleLayerCount; i++) {
        const ripple = document.createElement('div');
        ripple.classList.add('loader-ripple');
        // 插入到中心圆之后
        liquidLoader.insertBefore(ripple, liquidLoader.firstChild.nextSibling);
      }
    }

    // 页面加载时生成波纹
    createRipples();
  })


})
</script>
<style>
.liqud-container5 {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8fafc;


  --loader-color: #4a90e2;
  /* 加载波纹颜色 */
  --loader-size: 80px;
  /* 中心圆大小 */
  --ripple-layer-count: 3;
  /* 波纹层数（需与JS同步） */
  --ripple-duration: 2.5s;
  /* 单波纹动画时长 */
  --ripple-opacity: 0.8;
  /* 波纹初始透明度 */
}

/* 加载器容器（相对定位，承载波纹层） */
.liquid-loader {
  position: relative;
  width: var(--loader-size);
  height: var(--loader-size);
}

/* 中心液态圆 */
.loader-core {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--loader-color), rgba(74, 144, 226, 0.6));
  animation: core-shape var(--ripple-duration) ease-in-out infinite alternate;
  z-index: 2;
  position: relative;
}

/* 中心圆形态变化关键帧 */
@keyframes core-shape {
  0% {
    border-radius: 45% 55% 60% 40% / 50% 45% 55% 50%;
    transform: scale(1);
  }

  100% {
    border-radius: 55% 45% 40% 60% / 55% 50% 45% 50%;
    transform: scale(1.05);
  }
}

/* 波纹层通用样式 */
.loader-ripple {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid var(--loader-color);
  border-radius: 50%;
  opacity: 0;
  animation: ripple-pulse var(--ripple-duration) ease-out infinite;
  z-index: 1;
}

/* 波纹脉冲关键帧 */
@keyframes ripple-pulse {
  0% {
    transform: scale(1);
    opacity: var(--ripple-opacity);
    border-width: 2px;
  }

  100% {
    transform: scale(3);
    opacity: 0;
    border-width: 1px;
  }
}

/* 为不同波纹层设置延迟（通过JS动态添加） */
.loader-ripple:nth-child(2) {
  animation-delay: 0s;
}

.loader-ripple:nth-child(3) {
  animation-delay: 0.8s;
}

.loader-ripple:nth-child(4) {
  animation-delay: 1.6s;
}
</style>
```

:::

#### 核心解析 ####

- 多层波纹同步：通过固定 `animation-delay`（0s、0.8s、1.6s）让3层波纹依次扩散，形成“持续脉冲”的加载效果；
- 中心与波纹协同：中心圆 `core-shape` 动画与波纹 `ripple-pulse` 动画时长一致，确保加载动画整体协调；
- 可配置层数：通过 `--ripple-layer-count` 变量控制波纹层数（需JS同步生成对应数量的波纹层），层数越多加载效果越丰富；
- 个性化修改：`--loader-color` 换加载色（如绿色表示成功中加载），`--ripple-duration` 改波纹脉冲速度，`--loader-size` 调整加载器整体大小。

### 案例6：液态文字填充（创意文字效果） ###

#### 效果描述 ####

文字从左到右被液态背景逐渐填充，填充过程中液态背景呈现流动形态，同时文字边缘有细微光泽，适合作为标题、活动标语的强调动画（如 landing 页主标题）。

#### 完整代码 ####

:::demo

```vue
<template>
  <div class="liqud-container6">
    <div class="liquid-text">
      LIQUID TEXT
      <div class="text-fill">LIQUID TEXT</div>
    </div>
    <button class="reset-btn" id="resetBtn">重置动画</button>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, nextTick } from 'vue'

onMounted(() => {
  nextTick(() => {

    const textFill = document.querySelector('.text-fill');
    const resetBtn = document.getElementById('resetBtn');

    // 重置动画
    resetBtn.addEventListener('click', () => {
      // 移除动画类，触发重绘
      textFill.style.animation = 'none';
      textFill.offsetHeight; // 强制重绘
      // 重新添加动画
      textFill.style.animation = `text-fill-expand var(--fill-duration) ease-out forwards, liquid-shape 2s ease-in-out infinite alternate`;
    });
  })


})
</script>
<style>
.liqud-container6 {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8fafc;
  padding: 2rem;

  --text-fill-color: #0984e3;
  /* 液态填充色 */
  --text-fill-secondary: #74b9ff;
  /* 填充辅助色（渐变） */
  --text-empty-color: #e0e0e0;
  /* 未填充文字色 */
  --text-size: 4rem;
  /* 文字大小 */
  --fill-duration: 3s;
  /* 填充动画时长 */
  --text-weight: 700;
  /* 文字粗细 */
}

/* 液态文字容器 */
.liquid-text {
  position: relative;
  font-size: var(--text-size);
  font-weight: var(--text-weight);
  color: var(--text-empty-color);
  /* 未填充时的文字色 */
  overflow: hidden;
  /* 隐藏液态溢出 */
}

/* 液态填充层（绝对定位，覆盖文字） */
.text-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  /* 初始填充0% */
  height: 100%;
  /* 用clip-path: text裁剪液态背景为文字形状 */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  /* 文字色透明，显示背景 */
  background: linear-gradient(90deg, var(--text-fill-color), var(--text-fill-secondary));
  animation:
    text-fill-expand var(--fill-duration) ease-out forwards,
    /* 填充动画 */
    liquid-shape 2s ease-in-out infinite alternate;
  /* 液态形态动画 */
  will-change: width, border-radius;
}

/* 文字填充关键帧（控制宽度） */
@keyframes text-fill-expand {
  0% {
    width: 0%;
  }

  100% {
    width: 100%;
  }
}

/* 液态形态关键帧（控制背景渐变角度和位置） */
@keyframes liquid-shape {
  0% {
    background: linear-gradient(90deg, var(--text-fill-color), var(--text-fill-secondary));
    background-position: 0% 50%;
  }

  100% {
    background: linear-gradient(110deg, var(--text-fill-color), var(--text-fill-secondary));
    background-position: 100% 50%;
  }
}

/* 重置按钮 */
.reset-btn {
  position: absolute;
  bottom: 2rem;
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--text-fill-color);
  color: #fff;
  cursor: pointer;
  transition: background 0.3s;
}

.reset-btn:hover {
  background: #086ec8;
}
</style>

```

:::

#### 核心解析 ####

- 文字填充原理：通过 `background-clip: text`（裁剪背景为文字形状）+ `color: transparent`（文字透明），让液态背景显示为文字颜色，再通过 `text-fill-expand` 关键帧控制 `width` 实现“填充”效果；
- 液态流动感：`liquid-shape` 关键帧调整渐变角度和 `background-position`，让填充的文字背景呈现“流动光泽”；
- 重置动画技巧：通过“移除动画→强制重绘（`offsetHeight`）→重新添加动画”实现动画重置，避免直接重启动画无效；
- 个性化修改：`--text-size` 调整文字大小，`--text-fill-color` 换填充色，`--fill-duration` 改填充速度，修改 `.liquid-text` 内的文字内容可适配任意文本。

### 案例7：液态卡片hover展开（UI组件） ###

#### 效果描述 ####

卡片默认是紧凑的液态形态，`hover` 时卡片向四周展开（宽度、高度增加），同时形态从不规则液态过渡到柔和圆角矩形，内部内容（文字、图标）伴随淡入效果，适合卡片式布局（如产品列表、新闻卡片）。

#### 完整代码 ####


:::demo

```vue
<template>
  <div class="liqud-container7">
    <div class="liquid-card">
      <div class="card-glow"></div>
      <div class="card-content">
        <h3>液态卡片</h3>
        <p>hover时卡片将展开，同时呈现液态光泽流动效果。适合展示产品信息、新闻摘要等内容，增强界面交互感。</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, nextTick } from 'vue'

onMounted(() => {
  nextTick(() => {
  })
})
</script>
<style>
.liqud-container7 {
  width: 100%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f5ff;
  padding: 2rem;

  --card-bg: #fff;
  /* 卡片背景色 */
  --card-liquid-color: #74b9ff;
  /* 液态边框/光泽色 */
  --card-shadow: 0 4px 12px rgba(116, 185, 255, 0.2);
  /* 卡片阴影 */
  --card-shadow-hover: 0 8px 24px rgba(116, 185, 255, 0.3);
  /* hover阴影 */
  --card-init-width: 280px;
  /* 初始宽度 */
  --card-init-height: 180px;
  /* 初始高度 */
  --card-hover-width: 320px;
  /* hover宽度 */
  --card-hover-height: 240px;
  /* hover高度 */
  --card-init-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
  /* 初始液态圆角 */
  --card-hover-radius: 20px;
  /* hover圆角 */
  --transition-duration: 0.6s;
  /* 过渡时长 */
  --content-opacity-init: 0.6;
  /* 内容初始透明度 */
  --content-opacity-hover: 1;
  /* 内容hover透明度 */
}

/* 液态卡片容器 */
.liquid-card {
  position: relative;
  width: var(--card-init-width);
  height: var(--card-init-height);
  background: var(--card-bg);
  border-radius: var(--card-init-radius);
  border: 2px solid var(--card-liquid-color);
  padding: 1.5rem;
  transition:
    width var(--transition-duration) ease,
    height var(--transition-duration) ease,
    border-radius var(--transition-duration) ease,
    box-shadow var(--transition-duration) ease;
  cursor: pointer;
  overflow: hidden;
}

.liquid-card:hover {
  width: var(--card-hover-width);
  height: var(--card-hover-height);
  border-radius: var(--card-hover-radius);
  box-shadow: var(--card-shadow-hover);
}

/* 卡片液态光泽层（绝对定位，hover时移动） */
.card-glow {
  position: absolute;
  top: 0;
  left: -50%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, rgba(116, 185, 255, 0.2), rgba(116, 185, 255, 0));
  animation: glow-flow 3s ease-in-out infinite;
  transition: opacity var(--transition-duration) ease;
}

.liquid-card:hover .card-glow {
  opacity: 1;
}

/* 光泽流动关键帧 */
@keyframes glow-flow {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(300%);
  }
}

/* 卡片内容 */
.card-content h3 {
  color: #2d3436;
  margin-bottom: 1rem;
  transition: color var(--transition-duration) ease;
}

.card-content p {
  color: #636e72;
  line-height: 1.5;
  transition:
    color var(--transition-duration) ease,
    opacity var(--transition-duration) ease;
  opacity: var(--content-opacity-init);
}

.liquid-card:hover .card-content p {
  opacity: var(--content-opacity-hover);
  color: #2d3436;
}

.liquid-card:hover .card-content h3 {
  color: var(--card-liquid-color);
}
</style>
```

:::

#### 核心解析 ####

- 形态与尺寸协同过渡：卡片 `hover` 时，`width`/`height`（展开）与 `border-radius`（从液态到矩形）同步过渡，避免视觉断层；
- 光泽增强交互：`card-glow` 层通过 `glow-flow` 关键帧实现“横向流动光泽”，`hover` 时显示，强化“液态”属性；
- 内容渐进显示：文字内容的 `opacity` 和 `color` 随 `hover` 过渡，让内容与卡片形态变化协调，提升整体精致感；
- 个性化修改：`--card-init-radius` 调整初始液态形态，`--card-hover-width` 改展开后宽度，`--card-liquid-color` 换卡片边框/光泽色。

### 案例8：液态模态框过渡（交互组件） ###

#### 效果描述 ####

点击按钮弹出模态框，模态框从中心小尺寸液态形态逐渐放大为正常大小，同时背景呈现毛玻璃模糊+渐暗过渡；关闭模态框时，模态框收缩回液态形态并消失，适合需要强调的弹窗（如确认弹窗、详情弹窗）。

#### 完整代码 ####


:::demo

```vue
<template>
  <div class="liqud-container8">
    <button class="open-modal-btn" id="openModalBtn">打开液态模态框</button>
  </div>

  <!-- 遮罩层 -->
  <div class="modal-overlay" id="modalOverlay"></div>

  <!-- 液态模态框 -->
  <div class="liquid-modal" id="liquidModal">
    <div class="modal-glow"></div>
    <div class="modal-content">
      <h3>液态模态框</h3>
      <p>这是一个带有液态过渡效果的模态框，打开时从中心液态形态放大，关闭时收缩回液态形态。结合毛玻璃遮罩，提升界面层次感与交互体验。</p>
      <button class="close-modal-btn" id="closeModalBtn">关闭</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, nextTick } from 'vue'

onMounted(() => {
  nextTick(() => {
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const liquidModal = document.getElementById('liquidModal');

    // 打开模态框
    openModalBtn.addEventListener('click', () => {
      modalOverlay.classList.add('active');
      liquidModal.classList.add('active');
    });

    // 关闭模态框
    function closeModal() {
      modalOverlay.classList.remove('active');
      liquidModal.classList.remove('active');
    }

    closeModalBtn.addEventListener('click', closeModal);
    // 点击遮罩层关闭模态框
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  })
})
</script>
<style>
.liqud-container8 {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url("https://picsum.photos/id/1019/1920/1080") center/cover fixed;

  --modal-bg: rgba(255, 255, 255, 0.95);
  /* 模态框背景色 */
  --modal-liquid-color: #0984e3;
  /* 液态边框色 */
  --modal-overlay-bg: rgba(0, 0, 0, 0.5);
  /* 遮罩背景色 */
  --modal-overlay-blur: 8px;
  /* 遮罩毛玻璃模糊度 */
  --modal-init-size: 40px;
  /* 初始液态大小 */
  --modal-final-width: 500px;
  /* 最终宽度 */
  --modal-final-height: 300px;
  /* 最终高度 */
  --modal-init-radius: 50%;
  /* 初始液态圆角 */
  --modal-final-radius: 16px;
  /* 最终圆角 */
  --transition-duration: 0.5s;
  /* 过渡时长 */
  --modal-shadow: 0 8px 24px rgba(9, 132, 227, 0.2);
  /* 模态框阴影 */
}

/* 打开模态框按钮 */
.open-modal-btn {
  padding: 1rem 2.5rem;
  background: var(--modal-liquid-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  z-index: 1;
}

.open-modal-btn:hover {
  background: #086ec8;
}

/* 遮罩层（毛玻璃+渐暗） */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: var(--modal-overlay-bg);
  backdrop-filter: blur(var(--modal-overlay-blur));
  -webkit-backdrop-filter: blur(var(--modal-overlay-blur));
  opacity: 0;
  visibility: hidden;
  /* 初始隐藏 */
  transition:
    opacity var(--transition-duration) ease,
    visibility var(--transition-duration) ease;
  z-index: 10;
}

/* 模态框容器（绝对定位，中心对齐） */
.liquid-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.2);
  /* 初始缩小+居中 */
  width: var(--modal-init-size);
  height: var(--modal-init-size);
  background: var(--modal-bg);
  border: 2px solid var(--modal-liquid-color);
  border-radius: var(--modal-init-radius);
  padding: 2rem;
  opacity: 0;
  visibility: hidden;
  /* 初始隐藏 */
  transition:
    width var(--transition-duration) ease,
    height var(--transition-duration) ease,
    border-radius var(--transition-duration) ease,
    transform var(--transition-duration) ease,
    opacity var(--transition-duration) ease,
    visibility var(--transition-duration) ease,
    box-shadow var(--transition-duration) ease;
  z-index: 20;
  overflow: hidden;
}

/* 模态框液态光泽层 */
.modal-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(9, 132, 227, 0.1), rgba(9, 132, 227, 0));
  animation: modal-glow-flow 4s ease-in-out infinite;
}

@keyframes modal-glow-flow {
  0% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(-100%);
  }
}

/* 模态框内容 */
.modal-content {
  position: relative;
  z-index: 21;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.modal-content h3 {
  color: #2d3436;
  margin-bottom: 1rem;
}

.modal-content p {
  color: #636e72;
  line-height: 1.6;
  flex: 1;
  /* 占满剩余高度，避免内容溢出 */
}

/* 关闭按钮 */
.close-modal-btn {
  align-self: flex-end;
  padding: 0.5rem 1rem;
  background: var(--modal-liquid-color);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 1rem;
}

.close-modal-btn:hover {
  background: #086ec8;
}

/* 模态框显示状态（通过JS添加active类） */
.modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

.liquid-modal.active {
  width: var(--modal-final-width);
  height: var(--modal-final-height);
  border-radius: var(--modal-final-radius);
  transform: translate(-50%, -50%) scale(1);
  /* 居中+正常大小 */
  opacity: 1;
  visibility: visible;
  box-shadow: var(--modal-shadow);
}
</style>

```

:::

#### 核心解析 ####

- 过渡状态管理：通过 `active` 类控制模态框和遮罩层的“显示/隐藏”状态，所有过渡属性（尺寸、形态、透明度、位置）集中在active类中，逻辑清晰；
- 毛玻璃与液态结合：遮罩层用 `backdrop-filter: blur` 实现毛玻璃，模态框用液态过渡，两者同步显示/隐藏，提升整体质感；
- 交互细节：支持“关闭按钮”和“点击遮罩”两种关闭方式，符合用户习惯；模态框内容用 `flex` 布局确保在不同尺寸下正常显示；
- 个性化修改：`--modal-final-width`/`--modal-final-height` 改模态框大小，`--modal-overlay-blur` 调整遮罩模糊度，`--modal-liquid-color` 换模态框边框色。

### 案例9：液态导航指示器（导航组件） ###

#### 效果描述 ####

导航菜单下方有一个液态指示器，当鼠标hover到不同菜单项时，指示器平滑过渡到对应位置，同时形态呈现液态波动；点击菜单项后，指示器颜色加深，确认当前选中状态，适合顶部导航、侧边栏导航。

#### 完整代码 ####


:::demo

```vue
<template>
  <nav class="liquid-nav">
    <div class="nav-container">
      <ul class="nav-menu" id="navMenu">
        <li class="nav-item active" data-index="0">
          <a href="#" class="nav-link">首页</a>
        </li>
        <li class="nav-item" data-index="1">
          <a href="#" class="nav-link">产品</a>
        </li>
        <li class="nav-item" data-index="2">
          <a href="#" class="nav-link">案例</a>
        </li>
        <li class="nav-item" data-index="3">
          <a href="#" class="nav-link">关于</a>
        </li>
        <li class="nav-item" data-index="4">
          <a href="#" class="nav-link">联系</a>
        </li>
        <div class="nav-indicator" id="navIndicator"></div>
      </ul>
    </div>
  </nav>
</template>
<script lang="ts" setup>
import { onMounted, nextTick } from 'vue'

onMounted(() => {
  nextTick(() => {
    const navMenu = document.getElementById('navMenu');
    const navItems = document.querySelectorAll('.nav-item');
    const navIndicator = document.getElementById('navIndicator');
    const menuGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--menu-gap'));
    const linkWidth = navItems[0].querySelector('.nav-link').offsetWidth;
    const indicatorInitWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--indicator-init-width'));
    const indicatorHoverWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--indicator-hover-width'));

    // 初始化指示器位置（第一个菜单项下方）
    function initIndicator() {
      const firstItem = navItems[0];
      const firstItemLeft = firstItem.offsetLeft;
      // 居中对齐：菜单项左偏移 + (菜单项宽度 - 指示器宽度)/2
      navIndicator.style.left = `${firstItemLeft + (linkWidth - indicatorInitWidth) / 2}px`;
    }

    // 更新指示器位置和大小
    function updateIndicator(item) {
      const itemLeft = item.offsetLeft;
      // hover时宽度变大，居中对齐
      navIndicator.style.width = `${indicatorHoverWidth}px`;
      navIndicator.style.left = `${itemLeft + (linkWidth - indicatorHoverWidth) / 2}px`;
    }

    // 重置指示器（无hover时）
    function resetIndicator() {
      const activeItem = document.querySelector('.nav-item.active');
      const activeItemLeft = activeItem.offsetLeft;
      navIndicator.style.width = `${indicatorInitWidth}px`;
      navIndicator.style.left = `${activeItemLeft + (linkWidth - indicatorInitWidth) / 2}px`;
    }

    // 绑定hover事件
    navItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        updateIndicator(item);
      });

      item.addEventListener('mouseleave', () => {
        resetIndicator();
      });

      // 点击菜单项设置为选中状态
      item.addEventListener('click', (e) => {
        e.preventDefault();
        // 移除其他菜单项的active类
        navItems.forEach(i => i.classList.remove('active'));
        // 给当前菜单项添加active类
        item.classList.add('active');
        // 激活指示器选中色
        navIndicator.classList.add('active');
        // 重置指示器到选中项
        resetIndicator();
      });
    });

    // 页面加载和resize时初始化
    window.addEventListener('load', initIndicator);
    window.addEventListener('resize', initIndicator);
  })
})
</script>
<style>
body {
  background: #f8fafc;
  min-height: 100vh;
}

/* 导航容器 */
.liquid-nav {
  background: var(--nav-bg);
  padding: var(--nav-padding);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;


  --nav-bg: #fff;
  /* 导航背景色 */
  --nav-text-color: #636e72;
  /* 导航文字色 */
  --nav-text-hover: #0984e3;
  /* 导航文字hover色 */
  --indicator-color: #74b9ff;
  /* 指示器默认色 */
  --indicator-active-color: #0984e3;
  /* 指示器选中色 */
  --indicator-height: 4px;
  /* 指示器高度 */
  --indicator-init-width: 20px;
  /* 指示器初始宽度 */
  --indicator-hover-width: 60px;
  /* 指示器hover宽度 */
  --transition-duration: 0.4s;
  /* 过渡时长 */
  --nav-padding: 1.5rem 0;
  /* 导航内边距 */
  --menu-gap: 2.5rem;
  /* 菜单项间距 */
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

/* 导航菜单 */
.nav-menu {
  display: flex;
  gap: var(--menu-gap);
  list-style: none;
  position: relative;
}

.nav-item {
  position: relative;
}

.nav-link {
  text-decoration: none;
  color: var(--nav-text-color);
  font-weight: 500;
  font-size: 1.1rem;
  padding: 0.5rem 0;
  display: inline-block;
  transition: color var(--transition-duration) ease;
}

.nav-link:hover {
  color: var(--nav-text-hover);
}

/* 液态指示器 */
.nav-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: var(--indicator-height);
  width: var(--indicator-init-width);
  background: var(--indicator-color);
  border-radius: 2px;
  transition:
    left var(--transition-duration) ease,
    width var(--transition-duration) ease,
    background var(--transition-duration) ease;
  animation: indicator-shape 2s ease-in-out infinite alternate;
}

/* 指示器形态变化关键帧 */
@keyframes indicator-shape {
  0% {
    border-radius: 40% 60% 50% 50% / 50% 40% 60% 50%;
  }

  100% {
    border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%;
  }
}

/* 选中状态（通过JS添加active类） */
.nav-item.active .nav-link {
  color: var(--indicator-active-color);
}

.nav-indicator.active {
  background: var(--indicator-active-color);
}
</style>

```

:::

#### 核心解析 ####

- 指示器定位逻辑：通过 `offsetLeft` 获取菜单项的左偏移量，结合菜单项宽度和指示器宽度计算“居中对齐”的 `left` 值，确保指示器始终在菜单项下方居中；
- `hover`与选中状态区分：`hover` 时指示器宽度变大（`indicatorHoverWidth`），离开后恢复初始宽度（`indicatorInitWidth`）；点击菜单项后，指示器颜色加深（`active` 类），明确选中状态；
- 响应式适配：窗口 `resize` 时重新计算指示器位置，避免导航布局变化导致指示器偏移；
- 个性化修改：`--menu-gap` 调整菜单项间距，`--indicator-height` 改指示器厚度，`--indicator-active-color` 换选中色。

### 案例10：液态背景流动（全屏背景） ###

#### 效果描述 ####

页面背景由3层半透明液态层叠加组成，每层以不同速度、方向缓慢流动并动态变化形态，模拟“大面积水流自然涌动”的视觉效果——底层流动最慢、形态变化平缓，顶层流动稍快、形态变化更灵活，整体呈现出富有层次的“动态肌理”。背景半透明特性确保前景内容（如文字、按钮）清晰可读，适合作为登录页、品牌landing页、产品介绍页的全屏背景，无需依赖图片即可打造高级视觉质感。

#### 完整代码 ####


:::demo

```vue
<template>
  <div class="liquid-bg-container">
    <!-- 3层液态背景层（顺序：底→中→顶） -->
    <div class="liquid-layer"></div>
    <div class="liquid-layer"></div>
    <div class="liquid-layer"></div>

    <!-- 前景内容（文字+按钮） -->
    <div class="foreground-content">
      <h1>液态流动背景</h1>
      <p>由3层独立液态层叠加而成，每层以不同速度流动与变形，无需图片即可打造自然的动态肌理，适配各类全屏场景。</p>
      <button class="foreground-btn">开始探索</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, nextTick } from 'vue'

onMounted(() => {
  nextTick(() => {
  })
})
</script>
<style scoped>
/* 背景容器（全屏+相对定位，承载液态层） */
.liquid-bg-container {
  width: 100%;
  height: 100vh;
  background: #f8fafc;
  /* 基础背景色（液态层叠加其上） */
  position: relative;
  overflow: hidden;
  /* 隐藏液态层超出容器的部分 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;


  /* 液态背景核心变量 */
  --liquid-bg-primary: #0984e3;
  /* 主液态色（底层） */
  --liquid-bg-secondary: #74b9ff;
  /* 次液态色（中层） */
  --liquid-bg-tertiary: #b2dfff;
  /* 浅液态色（顶层） */
  --bg-opacity: 0.15;
  /* 所有液态层透明度（确保前景可读） */
  --layer-size: 800px;
  /* 液态层基础大小（大于屏幕，确保流动范围） */

  /* 各层动画参数（不同时长/延迟避免同步） */
  --layer1-duration: 18s;
  /* 底层动画时长（最慢） */
  --layer1-delay: 0s;
  --layer2-duration: 14s;
  /* 中层动画时长（中等） */
  --layer2-delay: 2s;
  --layer3-duration: 10s;
  /* 顶层动画时长（最快） */
  --layer3-delay: 4s;

  /* 前景内容样式 */
  --foreground-text-color: #2d3436;
  --foreground-btn-bg: #0984e3;
}

/* 液态层通用样式（绝对定位+圆形初始形态） */
.liquid-layer {

  position: absolute;
  width: var(--layer-size);
  height: var(--layer-size);
  border-radius: 50%;
  opacity: var(--bg-opacity);
  filter: blur(40px);
  /* 模糊处理，增强“流动肌理”感 */
  will-change: transform, border-radius;
  /* 触发硬件加速，避免卡顿 */
  animation:
    liquid-flow linear infinite,
    /* 位置流动动画 */
    liquid-shape ease-in-out infinite alternate;
  /* 形态变化动画 */
}

/* 底层液态层（主色+最慢流动） */
.liquid-layer:nth-child(1) {
  background: var(--liquid-bg-primary);
  top: calc(50% - var(--layer-size)/2 - 100px);
  /* 垂直偏移，避免重叠 */
  left: calc(50% - var(--layer-size)/2 - 150px);
  /* 水平偏移 */
  animation-duration: var(--layer1-duration), 6s;
  /* 位置时长+形态时长 */
  animation-delay: var(--layer1-delay), 0s;
}

/* 中层液态层（次色+中等流动） */
.liquid-layer:nth-child(2) {
  background: var(--liquid-bg-secondary);
  top: calc(50% - var(--layer-size)/2 + 50px);
  left: calc(50% - var(--layer-size)/2 + 100px);
  animation-duration: var(--layer2-duration), 5s;
  animation-delay: var(--layer2-delay), 1s;
}

/* 顶层液态层（浅色+最快流动） */
.liquid-layer:nth-child(3) {
  background: var(--liquid-bg-tertiary);
  top: calc(50% - var(--layer-size)/2 - 50px);
  left: calc(50% - var(--layer-size)/2 + 50px);
  animation-duration: var(--layer3-duration), 4s;
  animation-delay: var(--layer3-delay), 2s;
}

/* 液态层位置流动关键帧（无规则XY轴移动） */
@keyframes liquid-flow {
  0% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(40px, -30px);
  }

  50% {
    transform: translate(-20px, 50px);
  }

  75% {
    transform: translate(50px, 20px);
  }

  100% {
    transform: translate(0, 0);
  }
}

/* 液态层形态变化关键帧（不规则圆角） */
@keyframes liquid-shape {
  0% {
    border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
  }

  25% {
    border-radius: 38% 62% 50% 50% / 60% 30% 70% 40%;
  }

  50% {
    border-radius: 55% 45% 35% 65% / 55% 60% 40% 45%;
  }

  75% {
    border-radius: 60% 40% 70% 30% / 40% 55% 45% 60%;
  }

  100% {
    border-radius: 48% 52% 65% 35% / 50% 40% 60% 50%;
  }
}

/* 前景内容（确保在液态背景之上） */
.foreground-content {
  position: relative;
  /* 提升层级，避免被液态层遮挡 */
  text-align: center;
  z-index: 10;
}

.foreground-content h1 {
  font-size: 3rem;
  color: var(--foreground-text-color);
  margin-bottom: 1.5rem;
}

.foreground-content p {
  font-size: 1.2rem;
  color: #636e72;
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.6;
}

.foreground-btn {
  padding: 1rem 2.5rem;
  background: var(--foreground-btn-bg);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.foreground-btn:hover {
  background: #086ec8;
}
</style>

```

:::

#### 核心解析 ####

**多层叠加逻辑：避免“机械同步”**

3个液态层通过不同的 `animation-duration`（18s/14s/10s）和 `animation-delay`（0s/2s/4s）设置，确保流动节奏和形态变化不同步——底层最慢（营造“深层水流”的稳定感），顶层最快（模拟“表层水纹”的灵活感），最终呈现出自然的层次流动效果。

**形态与位置协同：模拟真实水流**

- 位置流动：通过 `liquid-flow` 关键帧定义“0%→25%→50%→75%→100%”的XY轴偏移（如 `translate(40px, -30px)`），避免直线移动，还原水流“无规则涌动”的特性；
- 形态变化：`liquid-shape` 关键帧中设计5组不同的 `border-radius`双向百分比（如 `42% 58% 70% 30%` / `45% 45% 55% 55%`），让液态层在流动中持续变形，增强“液态”属性。

**视觉优化：平衡质感与可读性**

- 模糊处理：`filter: blur(40px)` 让液态层边缘柔和，避免生硬轮廓，同时增强“流动肌理”的朦胧感；
- 半透明控制：`--bg-opacity: 0.15` 确保液态背景不遮挡前景内容，同时叠加后形成局部深浅变化（多层重叠处颜色更深），提升背景层次感；
- 层级管理：前景内容通过 `position: relative+z-index: 10` 置顶，避免被绝对定位的液态层遮挡。

**性能保障：避免卡顿**

- 硬件加速：`will-change: transform`, `border-radius` 提前告知浏览器需优化的属性，减少重绘重排；
- 简化计算：液态层使用固定大小（`--layer-size: 800px`），避免动态尺寸计算；动画仅依赖 `transform` 和 `border-radius`（无`width`/`height`等触发layout的属性）。
