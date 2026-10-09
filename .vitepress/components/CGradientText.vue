<template>
  <span class="c-gradient-text" :class="[typeClass, sizeClass]" :style="gradientStyle">
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface GradientTextProps {
  text?: string
  type?: 'success' | 'info' | 'warning' | 'error' | 'primary'
  size?: 'small' | 'medium' | 'large'
  gradient?: string
}

const props = withDefaults(defineProps<GradientTextProps>(), {
  text: '',
  type: 'primary',
  size: 'medium',
  gradient: ''
})

const typeClass = computed(() => `c-gradient-text--${props.type}`)
const sizeClass = computed(() => `c-gradient-text--${props.size}`)

const gradientStyle = computed(() => {
  if (props.gradient) {
    return {
      background: props.gradient,
      '-webkit-background-clip': 'text',
      'background-clip': 'text',
      '-webkit-text-fill-color': 'transparent'
    }
  }
  return {}
})
</script>

<style scoped>
.c-gradient-text {
  display: inline-block;
  font-weight: 500;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.c-gradient-text--primary {
  background-image: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.c-gradient-text--success {
  background-image: linear-gradient(90deg, #10b981, #059669);
}

.c-gradient-text--info {
  background-image: linear-gradient(90deg, #06b6d4, #0891b2);
}

.c-gradient-text--warning {
  background-image: linear-gradient(90deg, #f59e0b, #d97706);
}

.c-gradient-text--error {
  background-image: linear-gradient(90deg, #ef4444, #dc2626);
}

.c-gradient-text--small {
  font-size: 12px;
}

.c-gradient-text--medium {
  font-size: 14px;
}

.c-gradient-text--large {
  font-size: 16px;
}
</style>
