<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vitepress'

interface Props {
  hash?: string
  filePath?: string
  folder?: 'blog' | 'manual' | 'gallery'
  heroEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hash: '',
  filePath: '',
  folder: 'blog',
  heroEnabled: true
})

const route = useRoute()
const wrapperRef = ref<HTMLElement | null>(null)
const isMounted = ref(false)

// 计算元素 ID
const elementId = computed(() => {
  return props.hash ? `md-${props.hash}` : ''
})

// 文件夹特定的样式类
const folderClass = computed(() => {
  switch (props.folder) {
    case 'blog': return 'hero-folder-blog'
    case 'manual': return 'hero-folder-manual'
    case 'gallery': return 'hero-folder-gallery'
    default: return ''
  }
})

// Hero 动画状态
const heroState = ref<'idle' | 'animating' | 'completed'>('idle')

// 执行 Hero 动画
function executeHeroAnimation() {
  if (!props.heroEnabled || !wrapperRef.value) return

  heroState.value = 'animating'

  // 添加动画类
  wrapperRef.value.classList.add('hero-mount-animation')

  // 动画完成
  setTimeout(() => {
    heroState.value = 'completed'
    wrapperRef.value?.classList.remove('hero-mount-animation')
    wrapperRef.value?.classList.add('hero-animated')

    // 触发自定义事件
    wrapperRef.value?.dispatchEvent(new CustomEvent('hero-mounted', {
      detail: {
        id: props.hash,
        element: wrapperRef.value,
        filePath: props.filePath
      }
    }))
  }, 600)
}

// 初始挂载
onMounted(() => {
  isMounted.value = true

  // 延迟执行动画，确保 DOM 已完全渲染
  setTimeout(() => {
    executeHeroAnimation()
  }, 50)
})

// 路由变化时重新触发动画
watch(() => route.path, () => {
  if (wrapperRef.value) {
    wrapperRef.value.classList.remove('hero-animated')
    heroState.value = 'idle'

    setTimeout(() => {
      executeHeroAnimation()
    }, 100)
  }
})
</script>

<template>
  <div ref="wrapperRef" :id="`md-${hash}`" class="hero-wrapper" v-hero="{ id: hash }"
    :class="[folderClass, { 'hero-animating': heroState === 'animating' }]" :data-hero-hash="hash"
    :data-hero-folder="folder" :data-file-path="filePath" :data-hero-state="heroState">
    <div class="hero-content-wrapper">
      <slot />
    </div>

    <!-- Hero 装饰元素 -->
    <div v-if="isMounted && heroEnabled" class="hero-decoration">
      <div class="hero-decoration-bar"></div>
      <div class="hero-decoration-glow"></div>
    </div>
  </div>
</template>

<style scoped>
.hero-wrapper {
  position: relative;
  transition: all 0.3s ease;
  min-height: 100px;
}

.hero-content-wrapper {
  position: relative;
  z-index: 1;
}

.hero-mount-animation {
  animation: hero-fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.hero-animating {
  /* 动画进行中的样式 */
}

.hero-animated {
  /* 动画完成后的样式 */
}

.hero-folder-blog {
  border-left: 4px solid #3fb950;
  background: linear-gradient(90deg, rgba(63, 185, 80, 0.05), transparent);
}

.hero-folder-manual {
  border-left: 4px solid #1f6feb;
  background: linear-gradient(90deg, rgba(31, 111, 235, 0.05), transparent);
}

.hero-folder-gallery {
  border-left: 4px solid #a371f7;
  background: linear-gradient(90deg, rgba(163, 113, 247, 0.05), transparent);
}

.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.hero-decoration-bar {
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: currentColor;
  opacity: 0.8;
  transform: translateY(-100%);
  transition: transform 0.8s ease;
}

.hero-wrapper:hover .hero-decoration-bar {
  transform: translateY(0);
}

.hero-decoration-glow {
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: currentColor;
  filter: blur(2px);
  opacity: 0.3;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-wrapper {
    border-left-width: 3px;
  }

  .hero-folder-blog,
  .hero-folder-manual,
  .hero-folder-gallery {
    background: transparent;
  }
}

/* 打印时隐藏装饰 */
@media print {

  .hero-decoration,
  .hero-decoration-bar,
  .hero-decoration-glow {
    display: none !important;
  }

  .hero-wrapper {
    border: none !important;
    background: none !important;
  }
}

@keyframes hero-fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }

  50% {
    opacity: 0.5;
    transform: translateY(5px) scale(0.99);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
