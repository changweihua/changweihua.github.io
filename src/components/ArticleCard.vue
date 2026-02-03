<template>
  <article class="card" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave" ref="articleCard"
    @click="handleMouseClick">
    <div class="card__info-hover flex justify-between">
      <m-icon class="item" icon="svg-spinners:blocks-wave" :width="20" :height="20" />
      <m-icon class="item" icon="svg-spinners:clock" :width="20" :height="20" />
    </div>
    <div class="card__img"></div>
    <a :href="item.link" class="card_link">
      <div class="card__img--hover"></div>
    </a>
    <div class="card__info">
      <span class="card__category">{{ item.category }}</span>
      <h3 class="card__title">{{ item.title }}</h3>
      <span class="card__by">by
        <a href="javascript:void(0);" class="card__author" title="author">常伟华</a></span>
    </div>
    <div class="ripple-container" ref="rippleContainer"></div>
  </article>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

export interface CardListItem {
  title: string
  link: string
  icon: string
  category?: string
  description?: string
  cover?: string
  coverAlt?: string
}

withDefaults(
  defineProps<{
    item: CardListItem
  }>(),
  {}
)

let hoverRipple: HTMLDivElement | null = null
let isHovering = false

// 用于 requestAnimationFrame 的变量
let rafId: number | null = null
let lastMouseX = 0
let lastMouseY = 0
let animationFramePending = false

const rippleContainer = ref<HTMLDivElement>()
const articleCard = ref<HTMLDivElement>()

// 使用 requestAnimationFrame 的节流函数
function throttleWithRAF(callback: (x: number, y: number) => void) {
  return (x: number, y: number) => {
    lastMouseX = x
    lastMouseY = y

    if (!animationFramePending) {
      animationFramePending = true
      rafId = requestAnimationFrame(() => {
        callback(lastMouseX, lastMouseY)
        animationFramePending = false
      })
    }
  }
}

// 安全移除元素的函数
function safeRemoveElement(element: HTMLElement | null, container: HTMLElement | undefined) {
  if (!element || !container) return false

  try {
    if (element.parentNode === container) {
      container.removeChild(element)
      return true
    }
    return false
  } catch (error) {
    console.warn('Failed to remove element:', error)
    return false
  }
}

// 创建鼠标移动的节流函数
const throttledMouseMove = throttleWithRAF((x, y) => {
  if (!rippleContainer.value) return

  if (!isHovering) {
    isHovering = true
    hoverRipple = document.createElement('div') as HTMLDivElement
    hoverRipple.className = 'hover-ripple'
    rippleContainer.value.appendChild(hoverRipple)
  }

  // 更新悬停水纹位置
  if (hoverRipple) {
    hoverRipple.style.left = `${x}px`
    hoverRipple.style.top = `${y}px`
    hoverRipple.style.opacity = '1'
    hoverRipple.style.transform = `translate(-50%, -50%) scale(1)`
  }
})

function handleMouseMove(e: MouseEvent) {
  if (articleCard.value) {
    const rect = articleCard.value!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    throttledMouseMove(x, y)
  }
}

function handleMouseLeave() {
  // 取消未执行的动画帧
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
    animationFramePending = false
  }

  if (hoverRipple) {
    hoverRipple.style.opacity = '0'
    hoverRipple.style.transform = `translate(-50%, -50%) scale(0)`

    // 使用安全移除
    setTimeout(() => {
      safeRemoveElement(hoverRipple, rippleContainer.value || undefined)
      hoverRipple = null
      isHovering = false
    }, 500)
  }
}

// 点击效果也可以使用节流（防抖）来防止连续快速点击
let clickTimeout: number | null = null
let lastClickTime = 0
const CLICK_THROTTLE_TIME = 500 // 500ms内只能点击一次

function handleMouseClick(e: MouseEvent) {
  const now = Date.now()

  // 节流：500ms内只允许触发一次
  if (now - lastClickTime < CLICK_THROTTLE_TIME) {
    return
  }
  lastClickTime = now

  if (articleCard.value && rippleContainer.value) {
    const rect = articleCard.value!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const widthDif = Math.max(rect.width - x, x)
    const heightDif = Math.max(rect.height - y, y)
    const radius = Math.max(widthDif, heightDif)

    const createWaterPatterns = () => {
      const ripple = document.createElement('div')
      ripple.className = 'click-ripple'
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      ripple.style.width = `${radius * 2 + 20}px`
      ripple.style.height = `${radius * 2 + 20}px`
      rippleContainer.value!.appendChild(ripple)

      setTimeout(() => {
        ripple.style.transform = `translate(-50%, -50%) scale(1)`
      }, 100)

      // 动画结束后移除元素
      setTimeout(() => {
        safeRemoveElement(ripple, rippleContainer.value || undefined)
      }, 1800)
    }
    createWaterPatterns()
  }
}

// 组件卸载时清理
onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
  }
  if (clickTimeout !== null) {
    clearTimeout(clickTimeout)
  }

  // 清理所有水波纹元素
  if (rippleContainer.value) {
    const ripples = rippleContainer.value.querySelectorAll('.hover-ripple, .click-ripple')
    ripples.forEach(ripple => {
      if (ripple.parentNode === rippleContainer.value) {
        rippleContainer.value.removeChild(ripple)
      }
    })
  }
})
</script>

<style>
.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.hover-ripple,
.click-ripple {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--vp-c-brand-light) 0%, var(--vp-c-brand-soft) 70%);
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%) scale(0);
  opacity: 0.4;
  transition:
    transform 1800ms ease-out,
    opacity 1800ms ease-out;
}

.hover-ripple {
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, var(--vp-c-brand-light) 0%, var(--vp-c-brand-soft) 70%);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  transition:
    transform 500ms ease-out,
    opacity 500ms ease-out;
}
</style>
