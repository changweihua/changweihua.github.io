<template>
  <teleport v-if="fullscreen && isVisible" to="body">
    <div
      class="fixed inset-0 flex flex-col items-center justify-center z-9999 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm transition-opacity duration-300 spin-holder"
      :class="{ 'opacity-0': !spinning }"
    >
      <div
        class="relative"
        :class="
          size === 'small'
            ? 'w-12 h-12'
            : size === 'large'
              ? 'w-20 h-20'
              : 'w-16 h-16'
        "
        :style="{
          '--spin-color': color || 'var(--primary-color, #3b82f6)',
          '--spin-size':
            size === 'small' ? '1.5rem' : size === 'large' ? '3rem' : '2.25rem',
        }"
      >
        <SpinAnimation :type="type" />
      </div>

      <div
        v-if="tip"
        class="mt-4 text-base font-medium text-gray-700 dark:text-gray-200"
      >
        <Ticker
          :value="value"
          :duration="800"
          easing="easeOutCubic"
          :charWidth="1.2"
          direction="ANY"
          :characterLists="[Presets.ALPHANUMERIC]"
          autoScale
          fadingEdge
        />
      </div>
    </div>
  </teleport>

  <div v-else class="relative spin-holder" :class="wrapperClass">
    <div :class="{ 'opacity-50 pointer-events-none': spinning && !fullscreen }">
      <slot />
    </div>

    <div
      v-if="spinning && !fullscreen"
      class="absolute inset-0 flex flex-col items-center justify-center z-10 transition-all duration-300"
      :class="[
        'bg-white/80 dark:bg-gray-900/80',
        showMask ? 'backdrop-blur-sm' : '',
      ]"
    >
      <div
        class="relative"
        :class="sizeClasses"
        :style="{
          '--spin-color': color || 'var(--primary-color, #3b82f6)',
          '--spin-size':
            size === 'small' ? '1.5rem' : size === 'large' ? '3rem' : '2.25rem',
        }"
      >
        <SpinAnimation :type="type" />
      </div>

      <div
        v-if="tip"
        class="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300"
        :class="
          size === 'small'
            ? 'text-xs'
            : size === 'large'
              ? 'text-base'
              : 'text-sm'
        "
      >
        {{ tip }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  h,
  defineComponent,
  PropType,
  onMounted,
  onUnmounted,
} from "vue";
import { Ticker, Presets } from "@tombcato/smart-ticker/vue";
import "@tombcato/smart-ticker/style.css";

// 定义组件属性
interface SpinProps {
  /** 是否显示加载状态 */
  spinning?: boolean;
  /** 加载动画类型 */
  type?: "default" | "orbit" | "pulse" | "flip" | "bounce" | "neural";
  /** 尺寸 */
  size?: "small" | "default" | "large";
  /** 自定义颜色 */
  color?: string;
  /** 提示文字 */
  tip?: string;
  /** 全屏模式 */
  fullscreen?: boolean;
  /** 是否显示遮罩模糊效果 */
  showMask?: boolean;
  /** 延迟显示时间（毫秒） */
  delay?: number;
  /** 自定义容器类名 */
  wrapperClass?: string;
}

// 设置默认属性
const props = withDefaults(defineProps<SpinProps>(), {
  spinning: false,
  type: "default",
  size: "default",
  fullscreen: false,
  showMask: true,
  delay: 0,
  wrapperClass: "spin-holder",
});
const value = ref(props.tip || "加载中");

// const randomize = () => {
//   value.value = Math.random().toString(36).substring(7)
// }

let timer: any;

function startTimer() {
  // 精心设计的 Diff 演示序列
  const words = [
    "Smart Ticker",
    "Small Diff",
    "CMONO.NET Dif@#$",
  ];
  let idx = 0;
  value.value = words[0];
  timer = setInterval(() => {
    idx = (idx + 1) % words.length;
    value.value = words[idx];
  }, 1200);
}

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  clearInterval(timer);
});

// 动画组件 - 用于复用
const SpinAnimation = defineComponent({
  props: {
    type: {
      type: String as PropType<
        "default" | "orbit" | "pulse" | "flip" | "bounce" | "neural"
      >,
      default: "default",
    },
  },
  setup(props) {
    return () => {
      switch (props.type) {
        case "orbit":
          return h("div", { class: "spin-orbit relative w-full h-full" }, [
            h("div", {
              class:
                "spin-orbit-core absolute inset-0 rounded-full border-2 border-[var(--spin-color)] border-opacity-20",
            }),
            h("div", {
              class:
                "spin-orbit-track absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--spin-color)]",
            }),
            h("div", {
              class:
                "spin-orbit-satellite absolute top-0 left-1/2 w-1/4 h-1/4 rounded-full bg-[var(--spin-color)] -translate-x-1/2",
            }),
          ]);
        case "pulse":
          return h("div", { class: "spin-pulse relative w-full h-full" }, [
            h("div", {
              class:
                "spin-pulse-core absolute inset-0 rounded-full bg-[var(--spin-color)]",
            }),
            ...Array.from({ length: 3 }).map((_, n) =>
              h("div", {
                class:
                  "spin-pulse-wave absolute inset-0 rounded-full border-2 border-[var(--spin-color)]",
                style: { animationDelay: `${n * 0.5}s` },
              }),
            ),
          ]);
        case "flip":
          return h("div", { class: "spin-flip relative w-full h-full" }, [
            h("div", { class: "spin-flip-cube w-full h-full" }, [
              h("div", {
                class:
                  "spin-flip-face spin-flip-front absolute inset-0 rounded-lg bg-[var(--spin-color)]",
              }),
              h("div", {
                class:
                  "spin-flip-face spin-flip-back absolute inset-0 rounded-lg bg-[var(--spin-color)]",
              }),
              h("div", {
                class:
                  "spin-flip-face spin-flip-left absolute inset-0 rounded-lg bg-[var(--spin-color)]",
              }),
              h("div", {
                class:
                  "spin-flip-face spin-flip-right absolute inset-0 rounded-lg bg-[var(--spin-color)]",
              }),
              h("div", {
                class:
                  "spin-flip-face spin-flip-top absolute inset-0 rounded-lg bg-[var(--spin-color)]",
              }),
              h("div", {
                class:
                  "spin-flip-face spin-flip-bottom absolute inset-0 rounded-lg bg-[var(--spin-color)]",
              }),
            ]),
          ]);
        case "bounce":
          return h(
            "div",
            {
              class: "spin-bounce flex items-end justify-center w-full h-full",
            },
            Array.from({ length: 3 }).map((_, n) =>
              h("div", {
                class:
                  "spin-bounce-dot w-1/4 h-1/4 rounded-full bg-[var(--spin-color)] mx-0.5",
                style: { animationDelay: `${n * 0.15}s` },
              }),
            ),
          );
        case "neural":
          return h("div", { class: "spin-neural relative w-full h-full" }, [
            h("div", {
              class:
                "spin-neural-core absolute inset-0 rounded-full bg-[var(--spin-color)]",
            }),
            ...Array.from({ length: 6 }).map((_, n) => {
              const angle = (n * 60 * Math.PI) / 180;
              return h("div", {
                class:
                  "spin-neural-node absolute w-1/4 h-1/4 rounded-full bg-[var(--spin-color)]",
                style: {
                  top: `${50 + 40 * Math.sin(angle)}%`,
                  left: `${50 + 40 * Math.cos(angle)}%`,
                  animationDelay: `${n * 0.2}s`,
                },
              });
            }),
          ]);
        default: // 'default'
          return h(
            "div",
            { class: "spin-default relative w-full h-full" },
            Array.from({ length: 12 }).map((_, n) =>
              h("div", {
                class:
                  "spin-default-item absolute top-0 left-1/2 w-[8%] h-[25%] rounded-full bg-[var(--spin-color)] origin-center",
                style: {
                  transform: `rotate(${n * 30}deg) translateY(-180%)`,
                  animationDelay: `${n * 0.083}s`,
                  opacity: 1 - n * 0.08,
                },
              }),
            ),
          );
      }
    };
  },
});

// 计算尺寸类
const sizeClasses = computed(() => {
  return {
    small: "w-6 h-6",
    default: "w-9 h-9",
    large: "w-12 h-12",
  }[props.size];
});

// 控制全屏模式可见性
const isVisible = ref(false);

watch(
  () => props.spinning,
  (newVal) => {
    if (props.fullscreen) {
      if (newVal) {
        // 显示全屏加载
        isVisible.value = true;
      } else {
        // 延迟隐藏以实现淡出效果
        setTimeout(() => {
          isVisible.value = false;
        }, 300);
      }
    }
  },
  { immediate: true },
);
</script>

<style>
/* 默认动画：旋转圆点 */
@keyframes spin-default {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0.25;
  }
}

/* In global styles or component styles */
:deep(.ticker) {
  font-family: var(--vp-font-family-base) !important;
}

.spin-default {
  animation: spin 1.2s linear infinite;
}

.spin-default-item {
  animation: spin-default 1.2s linear infinite;
}

/* 轨道动画 */
@keyframes spin-orbit-track {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes spin-orbit-satellite {
  0% {
    transform: translateX(-50%) rotate(0deg) translateY(-180%);
  }

  100% {
    transform: translateX(-50%) rotate(360deg) translateY(-180%);
  }
}

.spin-orbit-track {
  animation: spin-orbit-track 2s linear infinite;
}

.spin-orbit-satellite {
  animation: spin-orbit-satellite 2s linear infinite;
}

/* 脉冲动画 */
@keyframes spin-pulse-wave {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.spin-pulse-wave {
  animation: spin-pulse-wave 1.5s ease-out infinite;
}

/* 翻转动画 */
@keyframes spin-flip {
  0% {
    transform: rotateX(0) rotateY(0) rotateZ(0);
  }

  25% {
    transform: rotateX(90deg) rotateY(90deg) rotateZ(90deg);
  }

  50% {
    transform: rotateX(180deg) rotateY(180deg) rotateZ(180deg);
  }

  75% {
    transform: rotateX(270deg) rotateY(270deg) rotateZ(270deg);
  }

  100% {
    transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
  }
}

.spin-flip-cube {
  transform-style: preserve-3d;
  animation: spin-flip 3s ease-in-out infinite;
}

.spin-flip-face {
  opacity: 0.8;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.3);
}

.spin-flip-front {
  transform: translateZ(calc(var(--spin-size) * 0.5));
}

.spin-flip-back {
  transform: translateZ(calc(var(--spin-size) * -0.5)) rotateY(180deg);
}

.spin-flip-left {
  transform: translateX(calc(var(--spin-size) * -0.5)) rotateY(-90deg);
}

.spin-flip-right {
  transform: translateX(calc(var(--spin-size) * 0.5)) rotateY(90deg);
}

.spin-flip-top {
  transform: translateY(calc(var(--spin-size) * -0.5)) rotateX(90deg);
}

.spin-flip-bottom {
  transform: translateY(calc(var(--spin-size) * 0.5)) rotateX(-90deg);
}

/* 弹跳动画 */
@keyframes spin-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-100%);
  }
}

.spin-bounce-dot {
  animation: spin-bounce 1.4s ease-in-out infinite;
}

/* 神经动画 */
@keyframes spin-neural-core {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }
}

@keyframes spin-neural-node {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }

  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

.spin-neural-core {
  animation: spin-neural-core 2s ease-in-out infinite;
}

.spin-neural-node {
  animation: spin-neural-node 2s ease-in-out infinite;
}

/* 通用旋转动画 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 高 z-index 确保全屏模式在最上层 */
.z-9999 {
  z-index: 9999;
}
</style>
