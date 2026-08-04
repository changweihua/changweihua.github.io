<template>
  <!-- 全屏模式 -->
  <teleport
    v-if="fullscreen && isVisible"
    to="body"
  >
    <div
      class="fixed inset-0 flex flex-col items-center justify-center z-9999 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm transition-opacity duration-300"
      :class="{ 'opacity-0': !spinning }"
    >
      <CubeLoader
        :size="size"
        :color="color"
      />

      <div
        v-if="tip"
        class="mt-4 text-base font-medium text-gray-700 dark:text-gray-200"
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
    <!-- 内容插槽 -->
    <div :class="{ 'opacity-50 pointer-events-none': spinning && !fullscreen }">
      <slot />
    </div>

    <!-- 加载遮罩 -->
    <div
      v-if="spinning && !fullscreen"
      class="absolute inset-0 flex flex-col items-center justify-center z-10 transition-all duration-300"
      :class="['bg-white/80 dark:bg-gray-900/80', showMask ? 'backdrop-blur-sm' : '']"
    >
      <CubeLoader
        :size="size"
        :color="color"
      />

      <div
        v-if="tip"
        class="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300"
        :class="size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'"
      >
        {{ tip }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import CubeLoader from './CubeSpinLoader.vue' // 请根据实际路径调整

  // 属性接口（与原先完全一致）
  interface SpinProps {
    spinning?: boolean
    type?: string // 保留但不再使用，始终显示正方体
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

  // 全屏可见性控制
  const isVisible = ref(false)

  watch(
    () => props.spinning,
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
    },
    { immediate: true }
  )
</script>

<style scoped>
  /* 高 z-index 确保全屏模式在最上层 */
  .z-9999 {
    z-index: 9999;
  }

  /* 保留原 spin-holder 样式（如有需要） */
  .spin-holder {
    /* 可保留原有样式，或留空 */
  }
</style>
