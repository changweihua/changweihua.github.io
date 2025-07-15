<script setup lang="ts">
import { ref, watch } from "vue";
import { inBrowser, useData, useRouter } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { nextTick, provide, useSlots, onMounted } from "vue";
import mediumZoom from "medium-zoom";

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
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )}px at ${x}px ${y}px)`,
  ];

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value;
    await nextTick();
  }).ready;

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: "ease-in",
      pseudoElement: `::view-transition-${isDark.value ? "old" : "new"}(root)`,
    },
  );
});

const { route } = useRouter();
const isTransitioning = ref(false);
const currentPage = ref("home");
watch(
  () => route.path,
  () => {
    nextTick(() => setupMediumZoom())
    // isTransitioning.value = true;
    // // 检查浏览器支持
    // if (document.startViewTransition) {
    //   // 使用 View Transitions API
    //   const transition = document.startViewTransition(() => {
    //     currentPage.value = route.path;
    //   });

    //   transition.finished.finally(() => {
    //     isTransitioning.value = false;
    //   });
    // } else {
    //   // 回退方案：使用 Vue 过渡
    //   setTimeout(() => {
    //     currentPage.value = route.path;
    //     setTimeout(() => {
    //       isTransitioning.value = false;
    //     }, 400);
    //   }, 50);
    // }
  },
);

// Setup medium zoom with the desired options
const setupMediumZoom = () => {
  mediumZoom("[data-zoomable]", {
    background: "var(--vp-c-bg)",
    container: document.body,
  });
};

onMounted(() => {
  nextTick(function () {
    setupMediumZoom();
  });
});

const router = useRouter();

// Subscribe to route changes to re-apply medium zoom effect
router.onAfterPageLoad = function () {
  nextTick(function () {
    setupMediumZoom();
  });
};
const transitionType = ref("vt");
</script>

<template>
  <transition :name="transitionType" mode="out-in">
    <div :key="currentPage" class="page-content view-transition-container">
      <DefaultTheme.Layout>
        <!-- <template #doc-top>
          <div class="shade" :class="{ 'shade-active': isTransitioning }">
            &nbsp;
          </div>
        </template> -->
        <template
          v-for="(slotKey, slotIndex) in slots"
          :key="slotIndex"
          v-slot:[slotKey]
        >
          <slot :name="slotKey"></slot>
        </template>
      </DefaultTheme.Layout>
    </div>
  </transition>
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}
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

@keyframes shadeAnimation {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(100vh);
  }
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
