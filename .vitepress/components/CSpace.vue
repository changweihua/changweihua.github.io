<template>
  <div class="c-space" :class="[directionClass, sizeClass, { 'c-space--wrap': wrap }]">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface SpaceProps {
  direction?: 'horizontal' | 'vertical'
  size?: 'small' | 'medium' | 'large' | number
  wrap?: boolean
}

const props = withDefaults(defineProps<SpaceProps>(), {
  direction: 'horizontal',
  size: 'medium',
  wrap: false
})

const directionClass = computed(() => `c-space--${props.direction}`)

const sizeClass = computed(() => {
  if (typeof props.size === 'number') {
    return ''
  }
  return `c-space--${props.size}`
})

const gapStyle = computed(() => {
  if (typeof props.size === 'number') {
    return {
      gap: `${props.size}px`
    }
  }
  return {}
})
</script>

<style scoped>
.c-space {
  display: flex;
  align-items: center;
}

.c-space--horizontal {
  flex-direction: row;
}

.c-space--vertical {
  flex-direction: column;
  align-items: flex-start;
}

.c-space--wrap {
  flex-wrap: wrap;
}

.c-space--small {
  gap: 8px;
}

.c-space--medium {
  gap: 12px;
}

.c-space--large {
  gap: 16px;
}

.c-space > :deep(*) {
  margin: 0;
}
</style>
