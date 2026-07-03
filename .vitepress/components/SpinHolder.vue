<template>
  <!-- 全屏模式 -->
  <teleport
    v-if="fullscreen && isVisible"
    to="body"
  >
    <div
      class="fixed inset-0 flex flex-col items-center justify-center z-9999 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm transition-opacity duration-300"
      :class="{ 'opacity-0': !displaySpinning }"
    >
      <div
        class="relative"
        :class="containerSizeClass"
        :style="containerStyle"
      >
        <SpinAnimation
          :type="type"
          :color="computedColor"
        />
      </div>

      <div
        v-if="tip"
        class="mt-4 text-base font-medium text-gray-700 dark:text-gray-200"
      >
        <Ticker
          :value="tickerValue"
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
      class="absolute inset-0 flex flex-col items-center justify-center z-10 transition-all duration-300"
      :class="['bg-white/80 dark:bg-gray-900/80', showMask ? 'backdrop-blur-sm' : '']"
    >
      <div
        class="relative"
        :class="sizeClasses"
        :style="containerStyle"
      >
        <SpinAnimation
          :type="type"
          :color="computedColor"
        />
      </div>

      <div
        v-if="tip"
        class="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300"
        :class="tipSizeClass"
      >
        {{ tip }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, onUnmounted, watchEffect } from 'vue'
  import { Ticker, Presets } from '@tombcato/smart-ticker/vue'
  import '@tombcato/smart-ticker/style.css'
  import SpinAnimation from './SpinAnimation.vue'

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

  // ---------- 响应式 ----------
  const displaySpinning = ref(props.spinning)
  const isVisible = ref(false)
  const tickerValue = ref(props.tip || '加载中')

  let delayTimer: ReturnType<typeof setTimeout> | null = null
  let tickerTimer: ReturnType<typeof setInterval> | null = null

  // ---------- 延迟逻辑 ----------
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

  // ---------- 全屏可见性 ----------
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

  // ---------- Ticker 文本轮换 ----------
  function startTickerTimer() {
    if (tickerTimer) clearInterval(tickerTimer)
    if (!props.tip) {
      tickerValue.value = ''
      return
    }
    const words = ['Smart Ticker', 'Small Diff', 'CMONO.NET Dif@#$']
    let idx = 0
    tickerValue.value = words[0]
    tickerTimer = setInterval(() => {
      idx = (idx + 1) % words.length
      tickerValue.value = words[idx]
    }, 1200)
  }

  watchEffect(() => {
    startTickerTimer()
  })

  // ---------- 计算属性 ----------
  const computedColor = computed(() => props.color || '#3b82f6')

  const containerSizeClass = computed(() => {
    const map = { small: 'w-12 h-12', default: 'w-16 h-16', large: 'w-20 h-20' }
    return map[props.size]
  })

  const sizeClasses = computed(() => {
    const map = { small: 'w-6 h-6', default: 'w-9 h-9', large: 'w-12 h-12' }
    return map[props.size]
  })

  const tipSizeClass = computed(() => {
    const map = { small: 'text-xs', default: 'text-sm', large: 'text-base' }
    return map[props.size]
  })

  const containerStyle = computed(() => ({
    '--spin-size': props.size === 'small' ? '1.5rem' : props.size === 'large' ? '3rem' : '2.25rem'
  }))

  // ---------- 清理 ----------
  onUnmounted(() => {
    if (delayTimer) clearTimeout(delayTimer)
    if (tickerTimer) clearInterval(tickerTimer)
  })
</script>

<style scoped>
  .z-9999 {
    z-index: 9999;
  }
</style>
