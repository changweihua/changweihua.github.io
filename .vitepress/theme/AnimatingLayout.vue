<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import { useData, useRouter } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { nextTick, provide, useSlots, onMounted } from "vue";
import mediumZoom from "medium-zoom";
import randomColor from "randomcolor";
import {
  styleImage,
  styleImageContainer,
} from "#.vitepress/utils/fillImage.ts";
// import { MyButton, Panel } from 'yuppie-ui'
// import Kinet from 'kinet';

const { isDark } = useData();
const slots = Object.keys(useSlots());
const enableTransitions = () =>
  "startViewTransition" in document &&
  window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

provide("toggle-appearance", async ({ clientX: x, clientY: y }: MouseEvent) => {
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

watch(
  () => route.path,
  () => {
    console.log("页面动画");
    isTransitioning.value = true;
    // 动画结束后重置状态
    setTimeout(() => {
      isTransitioning.value = false;
    }, 1500); // 500ms 要和 CSS 动画时间匹配
  },
);

// Setup medium zoom with the desired options
const setupMediumZoom = () => {
  mediumZoom("[data-zoomable]", {
    background: "transparent",
    container: document.body,
  });
};

/*
 * 在我们创建MutationObserver对象的时候可以传入一个函数，
 *
 */
let observer: MutationObserver;

onMounted(() => {
  setupMediumZoom();
  // observer = new MutationObserver((mutations) => {
  //   console.log(mutations);
  //   // => 返回一个我们监听到的MutationRecord对象
  //   // MutationRecord对象 是我们每修改一个就会在数组里面追加一个
  // });
  // observer.observe(document.documentElement, { attributes: true });
});

// onUnmounted(() => observer?.disconnect());

const router = useRouter();
// Subscribe to route changes to re-apply medium zoom effect
router.onAfterPageLoad = function () {
  setupMediumZoom();

  /*
  const images = document.querySelectorAll(".vp-doc img");
  images.forEach((image) => {
    image && styleImage(image as HTMLElement);
  });
  */
};

console.log(
  randomColor({
    hue: "yellow",
    luminosity: "dark",
    count: 10,
    seed: "test", //不传值就是随机
    format: "hex",
    alpha: 0.5,
  }),
);

// v-slot:default="slotProps"
</script>

<template>
  <transition
    class="animate__tada"
    enter-active-class="animate__animated animate__tada"
    leave-active-class="animate__animated animate__bounce"
  >
    <div>
      <DefaultTheme.Layout>
        <template #doc-top>
          <div class="shade" :class="{ 'shade-active': isTransitioning }">
            &nbsp;
          </div>
        </template>
        <template
          v-for="(slotKey, slotIndex) in slots"
          :key="slotIndex"
          v-slot:[slotKey]
        >
          <slot :name="slotKey"></slot>
        </template>
        <!-- <template #doc-after>
      <DocAfter />
    </template>
<template #doc-bottom>
      <Recommend />
    </template>
<template #not-found>
      <NotFound />
    </template>
<template #layout-bottom>
      <PageFooter />
    </template>
<template #home-hero-info>
      <AnimationTitle name="CMONO.NET" text="知识汪洋只此一瓢" tagline="伪前端+伪后端+伪需求=真全栈" />
    </template>
<template #home-hero-image>
      <div
        style="position: relative;width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;">
        <img src="/cwh.svg" class="VPImage image-src">
      </div>
    </template> -->
      </DefaultTheme.Layout>
      <!-- <my-button></my-button>
      <Panel :user="'changeweihua'" :age="10" /> -->
      <!-- <a class="back" href="#"></a> -->
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

.button-wrapper {
  position: relative;
}

.button {
  z-index: 1;
  position: relative;
  text-decoration: none;
  text-align: center;
  appearance: none;
  display: inline-block;
}

.button::before {
  content: "";
  box-shadow: 0px 0px 24px 0px #ffeb3b;
  mix-blend-mode: screen;
  transition: opacity 0.3s;

  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  border-radius: 999px;
  opacity: 0;
}

.button::after {
  content: "";
  box-shadow:
    0px 0px 23px 0px #fdfca9 inset,
    0px 0px 8px 0px #ffffff42;
  transition: opacity 0.3s;

  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  border-radius: 999px;
  opacity: 0;
}

.button-wrapper:hover {
  .button::before,
  .button::after {
    opacity: 1;
  }

  .dot {
    transform: translate(0, 0) rotate(var(--rotatation));
  }

  .dot::after {
    animation-play-state: running;
  }
}

.dot {
  display: block;
  position: absolute;
  transition: transform calc(var(--speed) / 12) ease;
  width: var(--size);
  height: var(--size);
  transform: translate(var(--starting-x), var(--starting-y))
    rotate(var(--rotatation));
}

.dot::after {
  content: "";
  animation:
    hoverFirefly var(--speed) infinite,
    dimFirefly calc(var(--speed) / 2) infinite calc(var(--speed) / 3);
  animation-play-state: paused;
  display: block;
  border-radius: 100%;
  background: yellow;
  width: 100%;
  height: 100%;
  box-shadow:
    0px 0px 6px 0px #ffeb3b,
    0px 0px 4px 0px #fdfca9 inset,
    0px 0px 2px 1px #ffffff42;
}

.dot-1 {
  --rotatation: 0deg;
  --speed: 14s;
  --size: 6px;
  --starting-x: 30px;
  --starting-y: 20px;
  top: 2px;
  left: -16px;
  opacity: 0.7;
}

.dot-2 {
  --rotatation: 122deg;
  --speed: 16s;
  --size: 3px;
  --starting-x: 40px;
  --starting-y: 10px;
  top: 1px;
  left: 0px;
  opacity: 0.7;
}

.dot-3 {
  --rotatation: 39deg;
  --speed: 20s;
  --size: 4px;
  --starting-x: -10px;
  --starting-y: 20px;
  top: -8px;
  right: 14px;
}

.dot-4 {
  --rotatation: 220deg;
  --speed: 18s;
  --size: 2px;
  --starting-x: -30px;
  --starting-y: -5px;
  bottom: 4px;
  right: -14px;
  opacity: 0.9;
}

.dot-5 {
  --rotatation: 190deg;
  --speed: 22s;
  --size: 5px;
  --starting-x: -40px;
  --starting-y: -20px;
  bottom: -6px;
  right: -3px;
}

.dot-6 {
  --rotatation: 20deg;
  --speed: 15s;
  --size: 4px;
  --starting-x: 12px;
  --starting-y: -18px;
  bottom: -12px;
  left: 30px;
  opacity: 0.7;
}

.dot-7 {
  --rotatation: 300deg;
  --speed: 19s;
  --size: 3px;
  --starting-x: 6px;
  --starting-y: -20px;
  bottom: -16px;
  left: 44px;
}

@keyframes dimFirefly {
  0% {
    opacity: 1;
  }

  25% {
    opacity: 0.4;
  }

  50% {
    opacity: 0.8;
  }

  75% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

@keyframes hoverFirefly {
  0% {
    transform: translate(0, 0);
  }

  12% {
    transform: translate(3px, 1px);
  }

  24% {
    transform: translate(-2px, 3px);
  }

  37% {
    transform: translate(2px, -2px);
  }

  55% {
    transform: translate(-1px, 0);
  }

  74% {
    transform: translate(0, 2px);
  }

  88% {
    transform: translate(-3px, -1px);
  }

  100% {
    transform: translate(0, 0);
  }
}

/* @property --scroll-position {
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

@keyframes adjust-pos {
  to {
    --scroll-position: 100;
    --scroll-position-delayed: 100;
  }
}

:root {
  animation: adjust-pos 3s linear both;
  animation-timeline: scroll();
}

body {
  margin: 0;
  transition: --scroll-position-delayed 0.15s linear;
  --scroll-velocity: calc(var(--scroll-position) - var(--scroll-position-delayed));
  --scroll-dynamic: calc(var(--scroll-velocity) / var(--scroll-velocity));
  --scroll-speed: max(var(--scroll-velocity), -1 * var(--scroll-velocity));
  --scroll-direction: calc(var(--scroll-velocity) / var(--scroll-speed));
} */

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

@keyframes adjust-pos {
  to {
    --scroll-position: 100;
    --scroll-position-delayed: 100;
  }
}

:root {
  animation: adjust-pos 3s linear both;
  animation-timeline: scroll();
}

body {
  margin: 0;
  transition: --scroll-position-delayed 0.15s linear;
  --scroll-velocity: calc(
    var(--scroll-position) - var(--scroll-position-delayed)
  );
  --scroll-dynamic: calc(var(--scroll-velocity) / var(--scroll-velocity));
}

.back {
  position: fixed;
  right: 10px;
  bottom: 10px;
  z-index: 999;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E %3Cpath fill='%23fff' d='M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z'%3E%3C/path%3E %3C/svg%3E")
    center/ 20px no-repeat royalblue;
  border-radius: 8px;
  width: 60px;
  height: 60px;
  transform: scaleY(var(--scroll-direction));
  /* animation: back-progress 1s linear forwards;
    animation-timeline: scroll();
    animation-range:entry 0 100px; */
}

.shade2s {
  position: fixed;
  width: 100%;
  height: 100vh;
  background-color: var(--vp-c-bg);
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  transition: transform 1.5s ease-in-out;
}

.shade-active {
  opacity: 0;
  animation: shadeAnimation 1.5s ease-in-out;
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
</style>
