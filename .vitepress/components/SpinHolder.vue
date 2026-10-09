<template>
  <!-- 全屏模式 -->
  <teleport
    v-if="fullscreen && isVisible"
    to="body"
  >
    <div
      class="spin-overlay"
      :class="{ 'spin-overlay-hidden': !displaySpinning }"
    >
      <div
        class="spin-container"
        :class="sizeClass"
        :style="containerStyle"
      >
        <div
          class="spin-animation"
          :class="`spin-${type}`"
        >
          <!-- 不同动画类型 -->
          <template v-if="type === 'default'">
            <div
              v-for="n in 12"
              :key="n"
              class="spin-default-item"
              :style="{
                transform: `rotate(${(n - 1) * 30}deg) translateY(-180%)`,
                animationDelay: `${(n - 1) * 0.083}s`,
                opacity: 1 - (n - 1) * 0.08,
                background: color
              }"
            ></div>
          </template>
          <template v-else-if="type === 'orbit'">
            <div
              class="orbit-core"
              :style="{ borderColor: color }"
            ></div>
            <div
              class="orbit-track"
              :style="{ borderTopColor: color }"
            ></div>
            <div
              class="orbit-satellite"
              :style="{ background: color }"
            ></div>
          </template>
          <template v-else-if="type === 'pulse'">
            <div
              class="pulse-core"
              :style="{ background: color }"
            ></div>
            <div
              v-for="n in 3"
              :key="n"
              class="pulse-wave"
              :style="{ borderColor: color, animationDelay: `${(n - 1) * 0.5}s` }"
            ></div>
          </template>
          <template v-else-if="type === 'flip'">
            <div class="flip-cube">
              <div
                v-for="face in ['front', 'back', 'left', 'right', 'top', 'bottom']"
                :key="face"
                class="flip-face"
                :class="`flip-${face}`"
                :style="{ background: color }"
              ></div>
            </div>
          </template>
          <template v-else-if="type === 'bounce'">
            <div
              v-for="n in 3"
              :key="n"
              class="bounce-dot"
              :style="{ background: color, animationDelay: `${(n - 1) * 0.15}s` }"
            ></div>
          </template>
          <template v-else-if="type === 'neural'">
            <div
              class="neural-core"
              :style="{ background: color }"
            ></div>
            <div
              v-for="n in 6"
              :key="n"
              class="neural-node"
              :style="{
                background: color,
                top: `${50 + 40 * Math.sin(((n - 1) * 60 * Math.PI) / 180)}%`,
                left: `${50 + 40 * Math.cos(((n - 1) * 60 * Math.PI) / 180)}%`,
                animationDelay: `${(n - 1) * 0.2}s`
              }"
            ></div>
          </template>
        </div>
      </div>

      <div
        v-if="tip"
        class="spin-tip"
      >
        {{ tip }}
      </div>
    </div>
  </teleport>

  <!-- 非全屏模式 -->
  <div
    v-else
    class="relative spin-holder"
    :class="wrapperClass"
  >
    <div :class="{ 'opacity-50 pointer-events-none': displaySpinning && !fullscreen }">
      <slot />
    </div>

    <div
      v-if="displaySpinning && !fullscreen"
      class="spin-mask"
      :class="showMask ? 'backdrop-blur-sm' : ''"
    >
      <div
        class="spin-container"
        :class="sizeClass"
        :style="containerStyle"
      >
        <div
          class="spin-animation"
          :class="`spin-${type}`"
        >
          <!-- 同上，复用动画内容 -->
          <template v-if="type === 'default'">
            <div
              v-for="n in 12"
              :key="n"
              class="spin-default-item"
              :style="{
                transform: `rotate(${(n - 1) * 30}deg) translateY(-180%)`,
                animationDelay: `${(n - 1) * 0.083}s`,
                opacity: 1 - (n - 1) * 0.08,
                background: color
              }"
            ></div>
          </template>
          <template v-else-if="type === 'orbit'">
            <div
              class="orbit-core"
              :style="{ borderColor: color }"
            ></div>
            <div
              class="orbit-track"
              :style="{ borderTopColor: color }"
            ></div>
            <div
              class="orbit-satellite"
              :style="{ background: color }"
            ></div>
          </template>
          <template v-else-if="type === 'pulse'">
            <div
              class="pulse-core"
              :style="{ background: color }"
            ></div>
            <div
              v-for="n in 3"
              :key="n"
              class="pulse-wave"
              :style="{ borderColor: color, animationDelay: `${(n - 1) * 0.5}s` }"
            ></div>
          </template>
          <template v-else-if="type === 'flip'">
            <div class="flip-cube">
              <div
                v-for="face in ['front', 'back', 'left', 'right', 'top', 'bottom']"
                :key="face"
                class="flip-face"
                :class="`flip-${face}`"
                :style="{ background: color }"
              ></div>
            </div>
          </template>
          <template v-else-if="type === 'bounce'">
            <div
              v-for="n in 3"
              :key="n"
              class="bounce-dot"
              :style="{ background: color, animationDelay: `${(n - 1) * 0.15}s` }"
            ></div>
          </template>
          <template v-else-if="type === 'neural'">
            <div
              class="neural-core"
              :style="{ background: color }"
            ></div>
            <div
              v-for="n in 6"
              :key="n"
              class="neural-node"
              :style="{
                background: color,
                top: `${50 + 40 * Math.sin(((n - 1) * 60 * Math.PI) / 180)}%`,
                left: `${50 + 40 * Math.cos(((n - 1) * 60 * Math.PI) / 180)}%`,
                animationDelay: `${(n - 1) * 0.2}s`
              }"
            ></div>
          </template>
        </div>
      </div>

      <div
        v-if="tip"
        class="spin-tip"
        :class="tipSizeClass"
      >
        {{ tip }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, onUnmounted } from 'vue'

  interface SpinProps {
    spinning?: boolean
    type?: 'default' | 'orbit' | 'pulse' | 'flip' | 'bounce' | 'neural'
    size?: 'small' | 'default' | 'large'
    color?: string
    tip?: string
    fullscreen?: boolean
    showMask?: boolean
    delay?: number
    wrapperClass?: string
  }

  const props = withDefaults(defineProps<SpinProps>(), {
    spinning: false,
    type: 'default',
    size: 'default',
    fullscreen: false,
    showMask: true,
    delay: 0,
    wrapperClass: 'spin-holder'
  })

  const displaySpinning = ref(props.spinning)
  const isVisible = ref(false)
  let delayTimer: ReturnType<typeof setTimeout> | null = null

  // 延迟逻辑
  watch(
    () => props.spinning,
    (newVal) => {
      if (delayTimer) {
        clearTimeout(delayTimer)
        delayTimer = null
      }
      if (props.delay > 0 && newVal) {
        delayTimer = setTimeout(() => {
          displaySpinning.value = true
          delayTimer = null
        }, props.delay)
      } else {
        displaySpinning.value = newVal
      }
    },
    { immediate: true }
  )

  // 全屏可见性（淡出）
  watch(
    () => displaySpinning.value,
    (newVal) => {
      if (props.fullscreen) {
        if (newVal) {
          isVisible.value = true
        } else {
          setTimeout(() => {
            isVisible.value = false
          }, 300)
        }
      }
    }
  )

  onUnmounted(() => {
    if (delayTimer) clearTimeout(delayTimer)
  })

  const color = computed(() => props.color || '#3b82f6')
  const sizeClass = computed(() => {
    const map = { small: 'spin-size-small', default: 'spin-size-default', large: 'spin-size-large' }
    return map[props.size]
  })
  const tipSizeClass = computed(() => {
    const map = { small: 'text-xs', default: 'text-sm', large: 'text-base' }
    return map[props.size]
  })
  const containerStyle = computed(() => ({
    '--spin-size': props.size === 'small' ? '1.5rem' : props.size === 'large' ? '3rem' : '2.25rem'
  }))
</script>

<style scoped>
  /* ===== 全局遮罩 ===== */
  .spin-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
    z-index: 9999;
    transition: opacity 0.3s;
  }
  .spin-overlay-hidden {
    opacity: 0;
  }
  .spin-mask {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    z-index: 10;
  }
  .spin-tip {
    margin-top: 1rem;
    font-weight: 500;
    color: #4b5563;
  }
  .spin-holder {
    position: relative;
  }

  /* ===== 容器尺寸 ===== */
  .spin-size-small .spin-container {
    width: 3rem;
    height: 3rem;
  }
  .spin-size-default .spin-container {
    width: 4rem;
    height: 4rem;
  }
  .spin-size-large .spin-container {
    width: 5rem;
    height: 5rem;
  }
  .spin-container {
    position: relative;
    flex-shrink: 0;
  }
  .spin-animation {
    position: relative;
    width: 100%;
    height: 100%;
  }

  /* ===== 通用样式 ===== */
  .spin-default-item,
  .orbit-core,
  .orbit-track,
  .orbit-satellite,
  .pulse-core,
  .pulse-wave,
  .flip-face,
  .bounce-dot,
  .neural-core,
  .neural-node {
    position: absolute;
    border-radius: 9999px;
  }

  /* ===== default ===== */
  .spin-default {
    animation: spin-rotate 1.2s linear infinite;
  }
  @keyframes spin-rotate {
    to {
      transform: rotate(360deg);
    }
  }
  .spin-default-item {
    top: 0;
    left: 50%;
    width: 8%;
    height: 25%;
    transform-origin: center bottom;
    animation: spin-fade 1.2s linear infinite;
  }
  @keyframes spin-fade {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.2;
    }
  }

  /* ===== orbit ===== */
  .orbit-core {
    inset: 0;
    border: 2px solid;
    opacity: 0.2;
  }
  .orbit-track {
    inset: 0;
    border: 2px solid transparent;
    border-top-color: currentColor;
    animation: orbit-spin 2s linear infinite;
  }
  @keyframes orbit-spin {
    to {
      transform: rotate(360deg);
    }
  }
  .orbit-satellite {
    top: 0;
    left: 50%;
    width: 25%;
    height: 25%;
    transform: translateX(-50%);
    animation: orbit-bob 2s linear infinite;
  }
  @keyframes orbit-bob {
    0% {
      transform: translateX(-50%) translateY(0) scale(1);
    }
    50% {
      transform: translateX(-50%) translateY(-50%) scale(1.3);
    }
    100% {
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  /* ===== pulse ===== */
  .pulse-core {
    inset: 0;
  }
  .pulse-wave {
    inset: 0;
    border: 2px solid;
    animation: pulse-expand 1.5s ease-out infinite;
  }
  @keyframes pulse-expand {
    0% {
      transform: scale(0.5);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.8);
      opacity: 0;
    }
  }

  /* ===== flip ===== */
  .flip-cube {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    animation: flip-rotate 3s ease-in-out infinite;
  }
  @keyframes flip-rotate {
    0% {
      transform: rotateX(0) rotateY(0);
    }
    25% {
      transform: rotateX(90deg) rotateY(0);
    }
    50% {
      transform: rotateX(90deg) rotateY(90deg);
    }
    75% {
      transform: rotateX(180deg) rotateY(90deg);
    }
    100% {
      transform: rotateX(180deg) rotateY(180deg);
    }
  }
  .flip-face {
    inset: 0;
    border-radius: 0.5rem;
    opacity: 0.8;
    box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.3);
  }
  .flip-front {
    transform: translateZ(calc(var(--spin-size) * 0.5));
  }
  .flip-back {
    transform: translateZ(calc(var(--spin-size) * -0.5)) rotateY(180deg);
  }
  .flip-left {
    transform: translateX(calc(var(--spin-size) * -0.5)) rotateY(-90deg);
  }
  .flip-right {
    transform: translateX(calc(var(--spin-size) * 0.5)) rotateY(90deg);
  }
  .flip-top {
    transform: translateY(calc(var(--spin-size) * -0.5)) rotateX(90deg);
  }
  .flip-bottom {
    transform: translateY(calc(var(--spin-size) * 0.5)) rotateX(-90deg);
  }

  /* ===== bounce ===== */
  .spin-bounce {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 0.125rem;
  }
  .bounce-dot {
    width: 25%;
    height: 25%;
    border-radius: 9999px;
    animation: bounce 1.4s ease-in-out infinite;
  }
  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  /* ===== neural ===== */
  .neural-core {
    inset: 0;
    animation: neural-pulse 2s ease-in-out infinite;
  }
  @keyframes neural-pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.4);
      opacity: 0.3;
    }
  }
  .neural-node {
    width: 25%;
    height: 25%;
    border-radius: 9999px;
    animation: neural-node-pulse 2s ease-in-out infinite;
  }
  @keyframes neural-node-pulse {
    0%,
    100% {
      transform: scale(0.8);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
</style>
