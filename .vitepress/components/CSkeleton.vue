<template>
  <div class="c-skeleton" :class="[sizeClass, { 'c-skeleton--round': round, 'c-skeleton--circle': circle }]">
    <div 
      v-if="circle" 
      class="c-skeleton-element c-skeleton-circle"
      :style="circleStyle"
    />
    <div 
      v-else 
      class="c-skeleton-element c-skeleton-rect"
      :style="rectStyle"
    />
    <div v-if="loading" class="c-skeleton-animation" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  round?: boolean
  circle?: boolean
  loading?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<SkeletonProps>(), {
  width: '100%',
  height: '16px',
  round: false,
  circle: false,
  loading: true,
  animated: true
})

const sizeClass = computed(() => {
  if (props.circle) return 'c-skeleton--circle'
  return ''
})

const rectStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  borderRadius: props.round ? '999px' : undefined
}))

const circleStyle = computed(() => {
  const size = typeof props.width === 'number' ? props.width : parseInt(props.width) || 32
  return {
    width: `${size}px`,
    height: `${size}px`
  }
})
</script>

<style scoped>
.c-skeleton {
  position: relative;
  overflow: hidden;
}

.c-skeleton-element {
  background: #f0f0f0;
}

.c-skeleton-rect {
  border-radius: 4px;
}

.c-skeleton-circle {
  border-radius: 50%;
}

.c-skeleton--round .c-skeleton-rect {
  border-radius: 999px;
}

.c-skeleton--circle .c-skeleton-circle {
  border-radius: 50%;
}

.c-skeleton-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.6),
    transparent
  );
  animation: c-skeleton-loading 1.4s ease infinite;
}

@keyframes c-skeleton-loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
