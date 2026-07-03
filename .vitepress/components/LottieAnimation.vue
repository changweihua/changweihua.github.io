<template>
  <!-- 动画容器，需指定宽高 -->
  <div
    ref="lottieContainer"
    class="lottie-container"
    :style="{ width, height }"
  ></div>
</template>

<script lang="ts" setup>
  import { onUnmounted, onMounted, watch, useTemplateRef } from 'vue'
  import lottie, { RendererType } from 'lottie-web'

  // 定义 Props
  const props = defineProps({
    // 动画 JSON 文件路径
    animationData: {
      type: Object,
      required: false,
      default: null,
    },
    path: {
      type: String,
      required: false,
      default: '',
    },
    // 动画宽高
    width: {
      type: String,
      default: '300px',
    },
    height: {
      type: String,
      default: '300px',
    },
    // 是否自动播放
    autoplay: {
      type: Boolean,
      default: true,
    },
    // 是否循环播放
    loop: {
      type: Boolean,
      default: true,
    },
    // 动画速度（1 为正常速度）
    speed: {
      type: Number,
      default: 1,
    },
    // 渲染方式（svg/canvas/html），优先 svg（矢量）
    renderer: {
      type: String as PropType<RendererType>,
      default: 'svg',
      validator: (val: string) => ['svg', 'canvas', 'html'].includes(val),
    },
  })

  // 定义 Emits：暴露动画状态事件
  const emit = defineEmits(['complete', 'loopComplete', 'enterFrame'])

  // 动画容器 Ref
  const lottieContainer = useTemplateRef<HTMLDivElement>('lottieContainer')
  // Lottie 实例
  let lottieInstance: any = null

  defineExpose({
    lottieInstance,
  })

  // 初始化动画
  const initLottie = () => {
    if (!lottieContainer.value) return
    console.log('initLottie')
    // 销毁旧实例（避免重复渲染）
    if (lottieInstance) {
      lottieInstance.destroy()
    }

    // 创建 Lottie 实例
    lottieInstance = lottie.loadAnimation({
      container: lottieContainer.value, // 动画容器
      animationData: props.animationData, // 动画 JSON 数据（本地导入）
      path: props.path, // 动画 JSON 文件路径（远程/ public 目录）
      renderer: props.renderer, // 渲染方式
      loop: props.loop, // 循环播放
      autoplay: props.autoplay, // 自动播放
      name: 'lottie-animation', // 动画名称（可选）
    })

    // 设置动画速度
    lottieInstance.setSpeed(props.speed)

    // 监听动画事件
    lottieInstance.addEventListener('complete', () => {
      emit('complete') // 动画播放完成
    })
    lottieInstance.addEventListener('loopComplete', () => {
      emit('loopComplete') // 动画循环完成
    })
    lottieInstance.addEventListener('enterFrame', (e) => {
      emit('enterFrame', e) // 动画每一帧
    })
  }

  // 监听 Props 变化，重新初始化
  watch(
    [() => props.path, () => props.animationData, () => props.loop, () => props.speed],
    () => {
      initLottie()
    },
    { immediate: true }
  )

  onMounted(() => {
    initLottie()
  })

  // 组件卸载时销毁实例
  onUnmounted(() => {
    if (lottieInstance) {
      lottieInstance.destroy()
      lottieInstance = null
    }
  })
</script>

<style scoped>
  .lottie-container {
    display: inline-block;
    overflow: hidden;
  }
</style>
