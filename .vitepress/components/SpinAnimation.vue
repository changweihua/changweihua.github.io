<template>
  <!-- default -->
  <div
    v-if="type === 'default'"
    class="spin-default relative w-full h-full"
  >
    <div
      v-for="n in 12"
      :key="n"
      class="spin-default-item absolute top-0 left-1/2 w-[8%] h-[25%] rounded-full origin-center"
      :style="{
        background: color,
        transform: `rotate(${(n - 1) * 30}deg) translateY(-180%)`,
        animationDelay: `${(n - 1) * 0.083}s`,
        opacity: 1 - (n - 1) * 0.08
      }"
    />
  </div>

  <!-- orbit -->
  <div
    v-else-if="type === 'orbit'"
    class="spin-orbit relative w-full h-full"
  >
    <div
      class="spin-orbit-core absolute inset-0 rounded-full border-2 border-opacity-20"
      :style="{ borderColor: color }"
    />
    <div
      class="spin-orbit-track absolute inset-0 rounded-full border-2 border-transparent border-t-current"
      :style="{ borderTopColor: color }"
    />
    <div
      class="spin-orbit-satellite absolute top-0 left-1/2 w-1/4 h-1/4 rounded-full -translate-x-1/2"
      :style="{ background: color }"
    />
  </div>

  <!-- pulse -->
  <div
    v-else-if="type === 'pulse'"
    class="spin-pulse relative w-full h-full"
  >
    <div
      class="spin-pulse-core absolute inset-0 rounded-full"
      :style="{ background: color }"
    />
    <div
      v-for="n in 3"
      :key="n"
      class="spin-pulse-wave absolute inset-0 rounded-full border-2 border-current"
      :style="{
        borderColor: color,
        animationDelay: `${(n - 1) * 0.5}s`
      }"
    />
  </div>

  <!-- flip -->
  <div
    v-else-if="type === 'flip'"
    class="spin-flip relative w-full h-full"
  >
    <div class="spin-flip-cube w-full h-full">
      <div
        v-for="face in ['front', 'back', 'left', 'right', 'top', 'bottom']"
        :key="face"
        class="spin-flip-face absolute inset-0 rounded-lg"
        :class="`spin-flip-${face}`"
        :style="{ background: color }"
      />
    </div>
  </div>

  <!-- bounce -->
  <div
    v-else-if="type === 'bounce'"
    class="spin-bounce flex items-end justify-center w-full h-full"
  >
    <div
      v-for="n in 3"
      :key="n"
      class="spin-bounce-dot w-1/4 h-1/4 rounded-full mx-0.5"
      :style="{
        background: color,
        animationDelay: `${(n - 1) * 0.15}s`
      }"
    />
  </div>

  <!-- neural -->
  <div
    v-else-if="type === 'neural'"
    class="spin-neural relative w-full h-full"
  >
    <div
      class="spin-neural-core absolute inset-0 rounded-full"
      :style="{ background: color }"
    />
    <div
      v-for="n in 6"
      :key="n"
      class="spin-neural-node absolute w-1/4 h-1/4 rounded-full"
      :style="{
        background: color,
        top: `${50 + 40 * Math.sin(((n - 1) * 60 * Math.PI) / 180)}%`,
        left: `${50 + 40 * Math.cos(((n - 1) * 60 * Math.PI) / 180)}%`,
        animationDelay: `${(n - 1) * 0.2}s`
      }"
    />
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    type: 'default' | 'orbit' | 'pulse' | 'flip' | 'bounce' | 'neural'
    color: string
  }>()
</script>

<style scoped>
  /* ===== 所有动画关键帧和样式 ===== */

  /* --- default --- */
  .spin-default {
    animation: spin-default-rotate 1.2s linear infinite;
  }
  @keyframes spin-default-rotate {
    to {
      transform: rotate(360deg);
    }
  }
  .spin-default-item {
    animation: spin-default-item 1.2s linear infinite;
  }
  @keyframes spin-default-item {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.2;
    }
  }

  /* --- orbit --- */
  .spin-orbit-track {
    animation: spin-orbit-track-spin 2s linear infinite;
  }
  @keyframes spin-orbit-track-spin {
    to {
      transform: rotate(360deg);
    }
  }
  .spin-orbit-satellite {
    animation: spin-orbit-satellite-spin 2s linear infinite;
  }
  @keyframes spin-orbit-satellite-spin {
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

  /* --- pulse --- */
  .spin-pulse-wave {
    animation: spin-pulse-wave-expand 1.5s ease-out infinite;
  }
  @keyframes spin-pulse-wave-expand {
    0% {
      transform: scale(0.5);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.8);
      opacity: 0;
    }
  }

  /* --- flip --- */
  .spin-flip-cube {
    transform-style: preserve-3d;
    animation: spin-flip-rotate 3s ease-in-out infinite;
  }
  @keyframes spin-flip-rotate {
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

  /* --- bounce --- */
  .spin-bounce-dot {
    animation: spin-bounce-bounce 1.4s ease-in-out infinite;
  }
  @keyframes spin-bounce-bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  /* --- neural --- */
  .spin-neural-core {
    animation: spin-neural-pulse 2s ease-in-out infinite;
  }
  @keyframes spin-neural-pulse {
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
  .spin-neural-node {
    animation: spin-neural-node-pulse 2s ease-in-out infinite;
  }
  @keyframes spin-neural-node-pulse {
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
