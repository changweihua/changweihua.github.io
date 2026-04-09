<template>
  <a
    v-show="showCorner"
    :href="repoUrl"
    class="github-corner"
    aria-label="View source on GitHub"
    target="_blank"
    rel="noopener noreferrer"
  >
    <svg
      :width="svgSize"
      :height="svgSize"
      viewBox="0 0 250 250"
      style="fill:#151513; color:#fff; position: fixed; top: 0; border: 0; right: 0; z-index: 1000;"
      aria-hidden="true"
    >
      <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
      <path
        d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
        fill="currentColor"
        style="transform-origin: 130px 106px;"
        class="octo-arm"
      />
      <path
        d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
        fill="currentColor"
        class="octo-body"
      />
    </svg>
  </a>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineOptions({ name: 'GitHubCorner' })

const props = defineProps<{
  repoUrl: string
}>()

const svgSize = ref(64)       // 默认值，避免 SSR 闪烁
const showCorner = ref(true)  // 默认显示，客户端会立即修正

let mediaQuery: MediaQueryList | null = null
let resizeTimer: number | null = null

// 更新角标尺寸（仅在 PC 端调用）
function updateSize() {
  // 只有显示角标时才去获取高度，提升性能
  if (!showCorner.value) return
  const navBar = document.querySelector('.VPNavBar') as HTMLElement | null
  if (navBar) {
    const height = navBar.getBoundingClientRect().height
    // 防止高度为 0 或异常值
    svgSize.value = height > 20 ? height : 64
  } else {
    svgSize.value = 64
  }
}

// 处理移动端/PC 切换
function handleMediaChange(e: MediaQueryListEvent | MediaQueryList) {
  const isMobile = e.matches
  showCorner.value = !isMobile
  if (!isMobile) {
    // 切换到 PC 端，重新获取导航栏高度
    updateSize()
  }
}

// 防抖处理 resize 事件，避免频繁调用
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    // 只有在 PC 端且角标可见时才更新尺寸
    if (showCorner.value) {
      updateSize()
    }
  }, 100)
}

onMounted(() => {
  // 使用 VitePress 默认断点 960px，兼容性好
  mediaQuery = window.matchMedia('(max-width: 960px)')
  // 初始状态
  const isMobile = mediaQuery.matches
  showCorner.value = !isMobile
  if (!isMobile) {
    updateSize()
  }
  // 监听媒体变化
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleMediaChange)
  } else {
    // 兼容旧版 Safari/Chrome（addListener 已废弃但仍可用）
    mediaQuery.addListener(handleMediaChange)
  }
  // 监听窗口 resize
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  if (mediaQuery) {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleMediaChange)
    } else {
      mediaQuery.removeListener(handleMediaChange)
    }
  }
  window.removeEventListener('resize', onResize)
  if (resizeTimer) clearTimeout(resizeTimer)
})
</script>

<style scoped>
/* 后备 CSS：保证移动端绝对隐藏（即使 JS 未执行） */
@media (max-width: 960px) {
  .github-corner {
    display: none !important;
  }
}

/* PC 端悬浮动画 */
.github-corner:hover .octo-arm {
  animation: octocat-wave 560ms ease-in-out;
}

@keyframes octocat-wave {
  0%, 100% { transform: rotate(0); }
  20%, 60% { transform: rotate(-25deg); }
  40%, 80% { transform: rotate(10deg); }
}
</style>
