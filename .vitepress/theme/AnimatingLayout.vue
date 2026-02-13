<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { inBrowser, useData, useRouter } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { nextTick, provide, useSlots, onMounted } from "vue";
import mediumZoom from "medium-zoom";
import { MediumZoom } from "vitepress-component-medium-zoom";
import "vitepress-component-medium-zoom/style.css";
import DocWithHash from './components/DocWithHash.vue'

import { generateFingerprint } from '../src/sdk/fingerprint-sdk.ts';

const { isDark } = useData();
const slots = Object.keys(useSlots());
const enableTransitions = () =>
  "startViewTransition" in document &&
  window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

provide("toggle-appearance", async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!inBrowser) {
    return;
  }

  if (!enableTransitions()) {
    isDark.value = !isDark.value;
    return;
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )}px at ${x}px ${y}px)`,
  ];

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value;
    await nextTick();
  }).ready;

  const parallelAnimations = [
    document.documentElement.animate(
      { clipPath: isDark.value ? clipPath.reverse() : clipPath },
      {
        duration: 300,
        // easing: "ease-in-out",
        // easing: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
        easing: "cubic-bezier(.76,.32,.29,.99)",
        fill: "both",
        pseudoElement: `::view-transition-${
          isDark.value ? "old" : "new"
        }(root)`,
      },
    ),
  ];

  // 监听所有动画完成
  Promise.all(parallelAnimations.map((anim) => anim.finished)).then(() => {
    console.log("所有并行动画完成");
  });
});

const { route } = useRouter();
watch(
  () => route.path,
  () => {
    nextTick(() => setupMediumZoom());
  },
);

// Setup medium zoom with the desired options
const setupMediumZoom = () => {
  mediumZoom("[data-zoomable]", {
    background: "var(--vp-c-bg)",
    container: document.body,
  });
};

onMounted(async() => {
  nextTick(function () {
    setupMediumZoom();
  });

  // 生成指纹
  const result = await generateFingerprint({
    canvas: true,   // 启用 Canvas 指纹
    audio: true,    // 启用 Audio 指纹
    webgl: true,    // 启用 WebGL 指纹 (新增)
    fonts: true,    // 启用字体检测 (新增)
    hardware: true, // 启用硬件特征
  });

  console.log(`${result.deviceId}`);
});

const router = useRouter();

// Subscribe to route changes to re-apply medium zoom effect
router.onAfterPageLoad = function () {
  nextTick(function () {
    setupMediumZoom();
  });
};

// 提供内容 hash 给所有组件
const { frontmatter } = useData()
// 访问文件的 hash
console.log('文件 Hash:', frontmatter.value.fileHash)
</script>

<template>
  <div class="page-content view-transition-container">
    <DefaultTheme.Layout>
      <template
        v-for="(slotKey, slotIndex) in slots"
        :key="slotIndex"
        v-slot:[slotKey]
      >
        <slot :name="slotKey"></slot>
      </template>
    </DefaultTheme.Layout>
    <MediumZoom />
  </div>
</template>

<style lang="scss" scoped>
.page-content {
  --r: clamp(3, (var(--num) - 99) * 999 + 29, 250);
  --g: clamp(6, (var(--num) - 100) * -999 + 67, 125);
  --b: clamp(12, (var(--num) - 100) * -999 + 54, 250);

  :deep(.markdown-copy-buttons) button:hover {
    color: rgb(var(--r) var(--g) var(--b));
  }

  :deep(.markdown-copy-buttons) {
    justify-content: center;
  }

  :deep(.markdown-copy-buttons-inner) {
    flex: 1;
    justify-content: space-around;

    button {
      font-size: 0;
    }

    button.copy::after {
      content: "复制";
      font-size: 16px;
    }

    button.download::after {
      content: "下载";
      font-size: 16px;
    }
  }
}
</style>

<style>
/* 视图过渡动画 */
.vt-enter-active,
.vt-leave-active {
  transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.vt-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.vt-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.vt-enter-to,
.vt-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* View Transitions API 样式 */
.view-transition-container {
  view-transition-name: page-container;
}

::view-transition-old(page-container),
::view-transition-new(page-container) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
}

::view-transition-old(layout),
::view-transition-new(layout) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(layout),
.dark::view-transition-new(layout) {
  animation: fade-out 0.3s ease;
}

::view-transition-new(layout),
.dark::view-transition-old(layout) {
  animation: fade-in 0.3s ease;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

.shade {
  position: fixed;
  width: 100%;
  height: 100vh;
  background-color: var(--vp-c-bg);
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  transition: transform 0.5s ease-in-out;
  display: none;
}

.shade-active {
  display: block;
  opacity: 0;
  animation: shadeAnimation 0.5s ease-in-out;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}

.circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  margin: -4px 0 0 -4px;
  pointer-events: none;
  mix-blend-mode: screen;
  z-index: 10;
  background-color: var(--vp-c-brand);
  box-shadow:
    0px 0px 8px 0px #fdfca9 inset,
    0px 0px 24px 0px #ffeb3b,
    0px 0px 8px 0px #ffffff42;
}

@property --scroll-position {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}

@property --scroll-position-delayed {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}

@property --scroll-velocity {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}

:root {
  animation: adjust-pos 3s linear both;
  animation-timeline: scroll();
}
</style>
<style scoped>
.custom-tips {
  position: absolute;
  width: 1em;
  height: 1em;
  margin-left: -0.5em;
  margin-top: -0.5em;
  left: 0;
  top: 0;
  transform: translate(var(--left, 50%), var(--top, 50%));
}
.custom-tips-dot {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  /* outline: 1px solid yellowgreen; */
  animation: custom-x 1s var(--d, 0s) linear forwards;
}
.custom-tips-dot::before {
  content: attr(emoji, "🎉");
  animation: custom-y 1s var(--d, 0s) cubic-bezier(0.56, -1.35, 0.85, 0.36)
    forwards;
}
.custom-num {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  width: 2em;
  height: 2em;
  font-size: 2em;
  color: var(--vp-c-brand-3, #fff);
  justify-content: center;
  align-items: center;
  margin-left: -1em;
  margin-top: -2em;
  font-weight: bold;
  text-shadow: 4px 4px 0 var(--vp-c-brand-1, rgba(255, 0, 0));
  transform: translate(var(--left), var(--top));
}
.custom-num::before {
  content: "+" attr(num);
  opacity: 0;
  animation: count-shark 1s var(--d, 0s);
}
</style>
