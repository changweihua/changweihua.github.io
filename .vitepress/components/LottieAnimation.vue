<template>
  <div
    ref="containerRef"
    class="lottie-container"
    :style="{ width, height }"
  >
    <DotLottieVue
      v-if="hasValidSource"
      ref="dotLottieRef"
      :src="src"
      :data="data"
      :autoplay="autoplay"
      :loop="loop"
      :speed="speed"
      :renderer="compatibleRenderer"
      @complete="handleComplete"
      @loop="handleLoop"
      @load="handleLoad"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
  import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
  import type { DotLottie } from '@dotlottie/web'

  // ---------- Props 定义（与原来完全一致） ----------
  const props = defineProps({
    animationData: {
      type: Object,
      default: null
    },
    path: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '300px'
    },
    height: {
      type: String,
      default: '300px'
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    loop: {
      type: Boolean,
      default: true
    },
    speed: {
      type: Number,
      default: 1
    },
    // 原来的 renderer 支持 'svg' / 'canvas' / 'html'
    // 但 dotlottie-vue 仅支持 'canvas' 和 'webgl'
    renderer: {
      type: String as PropType<'svg' | 'canvas' | 'html' | 'webgl'>,
      default: 'canvas',
      validator: (val: string) => ['svg', 'canvas', 'html', 'webgl'].includes(val)
    }
  })

  // ---------- Emits（与原来一致） ----------
  const emit = defineEmits(['complete', 'loopComplete', 'enterFrame'])

  // ---------- 模板引用 ----------
  const containerRef = ref<HTMLDivElement | null>(null)
  const dotLottieRef = ref<InstanceType<typeof DotLottieVue> | null>(null)

  // ---------- 底层 DotLottie 实例（用于高级控制） ----------
  let dotLottieInstance: DotLottie | null = null

  // ---------- 计算有效数据源 ----------
  const hasValidSource = computed(() => !!(props.animationData || props.path))

  // 将 animationData / path 映射为 dotlottie-vue 的 data / src
  const data = computed(() => props.animationData || undefined)
  const src = computed(() => props.path || undefined)

  // 处理 renderer：如果传入 'svg' 或 'html'，降级为 'canvas' 并给出警告
  const compatibleRenderer = computed(() => {
    const r = props.renderer
    if (r === 'svg' || r === 'html') {
      console.warn(`[Lottie] renderer "${r}" 不被 @lottiefiles/dotlottie-vue 支持，已自动降级为 "canvas"。`)
      return 'canvas'
    }
    return r as 'canvas' | 'webgl'
  })

  // ---------- 事件转发 ----------
  const handleComplete = () => {
    emit('complete')
  }

  const handleLoop = () => {
    emit('loopComplete')
  }

  // 当底层实例加载完成后，监听 'frame' 事件并转发
  const handleLoad = () => {
    const instance = dotLottieRef.value?.getDotLottieInstance?.()
    if (instance) {
      dotLottieInstance = instance
      // 移除旧的监听器（防止重复）
      instance.removeEventListener('frame', handleFrame)
      instance.addEventListener('frame', handleFrame)
      // 额外暴露实例，供外部通过 ref 访问
    }
  }

  const handleFrame = (e: any) => {
    emit('enterFrame', e)
  }

  // ---------- 外部通过 ref 访问实例 ----------
  // 保留 lottieInstance 属性，但注意它现在是 DotLottie 类型
  defineExpose({
    lottieInstance: dotLottieInstance,
    // 同时也暴露一些常用控制方法，方便外部直接调用
    play: () => dotLottieInstance?.play(),
    pause: () => dotLottieInstance?.pause(),
    stop: () => dotLottieInstance?.stop(),
    destroy: () => dotLottieInstance?.destroy()
  })

  // ---------- 生命周期清理 ----------
  onUnmounted(() => {
    if (dotLottieInstance) {
      dotLottieInstance.removeEventListener('frame', handleFrame)
      dotLottieInstance.destroy()
      dotLottieInstance = null
    }
  })

  // ---------- 响应式更新：源变化时重新加载（由组件内部处理） ----------
  // 我们不需要手动 watch 了，因为 DotLottieVue 会自动响应 src/data 变化
  // 但为了强制重新加载（如 renderer 变化），可以通过 key 或重新创建，但组件自身会处理
</script>

<style scoped>
  .lottie-container {
    display: inline-block;
    overflow: hidden;
  }
  .lottie-container :deep(dotlottie-vue) {
    width: 100%;
    height: 100%;
  }
</style>
