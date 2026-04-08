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

const svgSize = ref(64)          // 默认高度，避免 SSR 闪烁
const showCorner = ref(true)     // 默认显示，客户端会立刻修正

let resizeObserver: ResizeObserver | null = null

// 检测汉堡菜单是否真正可见（基于 DOM 实际样式）
function isHamburgerVisible(): boolean {
  const hamburger = document.querySelector('.VPNavBarHamburger.hamburger') as HTMLElement | null
  if (!hamburger) return false
  const style = window.getComputedStyle(hamburger)
  return hamburger.offsetParent !== null && style.display !== 'none' && style.visibility !== 'hidden'
}

// 更新角标显示状态和尺寸
function update() {
  const hamburgerVisible = isHamburgerVisible()
  showCorner.value = !hamburgerVisible

  // 只有当角标应该显示时才去获取导航栏高度（性能优化）
  if (!hamburgerVisible) {
    const navBar = document.querySelector('.VPNavBar')
    if (navBar) {
      const height = navBar.getBoundingClientRect().height
      // 避免高度为 0 或过小
      svgSize.value = height > 20 ? height : 64
    } else {
      svgSize.value = 64
    }
  }
}

// 设置监听器：ResizeObserver 捕捉所有可能影响布局的变化（侧边栏展开、字体加载等）
function setupObservers() {
  // 监听 body 尺寸变化，比单纯 resize 更全面
  resizeObserver = new ResizeObserver(() => update())
  resizeObserver.observe(document.body)

  // 同时监听窗口大小变化（作为 fallback 和即时响应）
  window.addEventListener('resize', update)
}

onMounted(() => {
  update()
  setupObservers()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', update)
})
</script>

<style scoped>
.github-corner:hover .octo-arm {
  animation: octocat-wave 560ms ease-in-out;
}

@keyframes octocat-wave {
  0%, 100% { transform: rotate(0); }
  20%, 60% { transform: rotate(-25deg); }
  40%, 80% { transform: rotate(10deg); }
}
</style>
