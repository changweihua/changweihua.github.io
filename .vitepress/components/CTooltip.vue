<template>
  <div class="c-tooltip-wrapper" ref="wrapperRef">
    <div 
      class="c-tooltip-trigger" 
      @mouseenter="showTooltip" 
      @mouseleave="hideTooltip"
      @focus="showTooltip"
      @blur="hideTooltip"
    >
      <slot name="trigger">
        <slot />
      </slot>
    </div>
    <Teleport to="body">
      <Transition name="c-tooltip">
        <div 
          v-if="visible" 
          class="c-tooltip" 
          :class="[placementClass, sizeClass]"
          :style="tooltipStyle"
          ref="tooltipRef"
        >
          <div class="c-tooltip-content">
            <slot>{{ content }}</slot>
          </div>
          <div class="c-tooltip-arrow" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

export interface TooltipProps {
  content?: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'
  trigger?: 'hover' | 'click' | 'focus'
  delay?: number
  disabled?: boolean
  showArrow?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<TooltipProps>(), {
  content: '',
  placement: 'top',
  trigger: 'hover',
  delay: 100,
  disabled: false,
  showArrow: true,
  size: 'medium'
})

const visible = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})

let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

const placementClass = computed(() => `c-tooltip--${props.placement}`)
const sizeClass = computed(() => `c-tooltip--${props.size}`)

function showTooltip() {
  if (props.disabled) return
  
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  
  showTimer = setTimeout(() => {
    visible.value = true
    nextTick(updatePosition)
  }, props.delay)
}

function hideTooltip() {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }
  
  hideTimer = setTimeout(() => {
    visible.value = false
  }, 100)
}

function updatePosition() {
  if (!wrapperRef.value || !tooltipRef.value) return
  
  const triggerRect = wrapperRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  
  let top = 0
  let left = 0
  
  const gap = 8
  
  switch (props.placement) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - gap
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'bottom':
      top = triggerRect.bottom + gap
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.left - tooltipRect.width - gap
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      left = triggerRect.right + gap
      break
    case 'top-start':
      top = triggerRect.top - tooltipRect.height - gap
      left = triggerRect.left
      break
    case 'top-end':
      top = triggerRect.top - tooltipRect.height - gap
      left = triggerRect.right - tooltipRect.width
      break
    case 'bottom-start':
      top = triggerRect.bottom + gap
      left = triggerRect.left
      break
    case 'bottom-end':
      top = triggerRect.bottom + gap
      left = triggerRect.right - tooltipRect.width
      break
    case 'left-start':
      top = triggerRect.top
      left = triggerRect.left - tooltipRect.width - gap
      break
    case 'left-end':
      top = triggerRect.bottom - tooltipRect.height
      left = triggerRect.left - tooltipRect.width - gap
      break
    case 'right-start':
      top = triggerRect.top
      left = triggerRect.right + gap
      break
    case 'right-end':
      top = triggerRect.bottom - tooltipRect.height
      left = triggerRect.right + gap
      break
  }
  
  tooltipStyle.value = {
    top: `${top + window.scrollY}px`,
    left: `${left + window.scrollX}px`
  }
}

function handleClickOutside(event: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    hideTooltip()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (showTimer) clearTimeout(showTimer)
  if (hideTimer) clearTimeout(hideTimer)
})

watch(visible, (newVal) => {
  if (newVal) {
    nextTick(updatePosition)
  }
})
</script>

<style scoped>
.c-tooltip-wrapper {
  display: inline-block;
  position: relative;
}

.c-tooltip-trigger {
  display: inline-block;
}

.c-tooltip {
  position: absolute;
  z-index: 1000;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  white-space: nowrap;
  pointer-events: none;
}

.c-tooltip--small {
  padding: 4px 8px;
  font-size: 12px;
}

.c-tooltip--large {
  padding: 8px 16px;
  font-size: 16px;
}

.c-tooltip-content {
  position: relative;
  z-index: 1;
}

.c-tooltip-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(0, 0, 0, 0.85);
  transform: rotate(45deg);
}

.c-tooltip--top .c-tooltip-arrow {
  bottom: -4px;
  left: 50%;
  margin-left: -4px;
}

.c-tooltip--bottom .c-tooltip-arrow {
  top: -4px;
  left: 50%;
  margin-left: -4px;
}

.c-tooltip--left .c-tooltip-arrow {
  right: -4px;
  top: 50%;
  margin-top: -4px;
}

.c-tooltip--right .c-tooltip-arrow {
  left: -4px;
  top: 50%;
  margin-top: -4px;
}

.c-tooltip--top-start .c-tooltip-arrow {
  bottom: -4px;
  left: 12px;
}

.c-tooltip--top-end .c-tooltip-arrow {
  bottom: -4px;
  right: 12px;
}

.c-tooltip--bottom-start .c-tooltip-arrow {
  top: -4px;
  left: 12px;
}

.c-tooltip--bottom-end .c-tooltip-arrow {
  top: -4px;
  right: 12px;
}

.c-tooltip--left-start .c-tooltip-arrow {
  right: -4px;
  top: 12px;
}

.c-tooltip--left-end .c-tooltip-arrow {
  right: -4px;
  bottom: 12px;
}

.c-tooltip--right-start .c-tooltip-arrow {
  left: -4px;
  top: 12px;
}

.c-tooltip--right-end .c-tooltip-arrow {
  left: -4px;
  bottom: 12px;
}

.c-tooltip-enter-active,
.c-tooltip-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.c-tooltip-enter-from,
.c-tooltip-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.c-tooltip--top {
  transform-origin: center bottom;
}

.c-tooltip--bottom {
  transform-origin: center top;
}

.c-tooltip--left {
  transform-origin: right center;
}

.c-tooltip--right {
  transform-origin: left center;
}
</style>
