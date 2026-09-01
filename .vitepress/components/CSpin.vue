<template>
  <div class="c-spin-wrapper" :class="{ 'c-spin-wrapper--loading': spinning }">
    <div v-if="$slots.default" class="c-spin-content" :class="contentClass" :style="contentStyle">
      <slot />
    </div>
    
    <Transition name="c-spin-fade">
      <div v-if="spinning" class="c-spin" :class="[sizeClass, { 'c-spin--fullscreen': fullscreen }]">
        <div class="c-spin-body">
          <slot v-if="$slots.icon" name="icon" />
          <div v-else class="c-spin-icon" :class="sizeClass">
            <svg class="c-spin-svg" viewBox="0 0 50 50" :style="svgStyle">
              <circle
                class="c-spin-circle"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                :stroke="stroke"
                :stroke-width="strokeWidth"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <div v-if="description || $slots.description" class="c-spin-description">
            <slot name="description">{{ description }}</slot>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'

export interface SpinProps {
  spinning?: boolean
  size?: 'small' | 'medium' | 'large' | number
  stroke?: string
  strokeWidth?: number
  description?: string
  delay?: number
  show?: boolean
  contentClass?: string
  contentStyle?: Record<string, string> | string
  fullscreen?: boolean
}

const props = withDefaults(defineProps<SpinProps>(), {
  spinning: false,
  size: 'medium',
  stroke: '#3b82f6',
  strokeWidth: 4,
  delay: 0,
  show: true,
  fullscreen: false
})

const spinning = ref(props.spinning)
let delayTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.spinning,
  (newVal) => {
    if (delayTimer) {
      clearTimeout(delayTimer)
      delayTimer = null
    }
    if (props.delay > 0 && newVal) {
      delayTimer = setTimeout(() => {
        spinning.value = true
        delayTimer = null
      }, props.delay)
    } else {
      spinning.value = newVal
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (delayTimer) clearTimeout(delayTimer)
})

const sizeClass = computed(() => {
  if (typeof props.size === 'number') return ''
  return `c-spin--${props.size}`
})

const svgStyle = computed(() => {
  if (typeof props.size === 'number') {
    return {
      width: `${props.size}px`,
      height: `${props.size}px`
    }
  }
  return {}
})
</script>

<style scoped>
.c-spin-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.c-spin-wrapper--loading .c-spin-content {
  pointer-events: none;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.c-spin-content {
  transition: opacity 0.3s;
}

.c-spin {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
}

.c-spin--fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
}

.c-spin-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.c-spin-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.c-spin--small .c-spin-icon {
  width: 20px;
  height: 20px;
}

.c-spin--medium .c-spin-icon {
  width: 32px;
  height: 32px;
}

.c-spin--large .c-spin-icon {
  width: 48px;
  height: 48px;
}

.c-spin-svg {
  width: 100%;
  height: 100%;
  animation: c-spin-rotate 1.2s linear infinite;
}

.c-spin-circle {
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: c-spin-dash 1.2s ease-in-out infinite;
}

.c-spin-description {
  font-size: 14px;
  color: #666;
  text-align: center;
}

.c-spin--small .c-spin-description {
  font-size: 12px;
}

.c-spin--large .c-spin-description {
  font-size: 16px;
}

@keyframes c-spin-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes c-spin-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.c-spin-fade-enter-active,
.c-spin-fade-leave-active {
  transition: opacity 0.3s;
}

.c-spin-fade-enter-from,
.c-spin-fade-leave-to {
  opacity: 0;
}
</style>
