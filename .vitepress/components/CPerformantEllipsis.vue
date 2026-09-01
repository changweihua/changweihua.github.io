<template>
  <div class="c-performant-ellipsis" :class="sizeClass" :style="ellipsisStyle">
    <slot>{{ text }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PerformantEllipsisProps {
  text?: string
  line?: number
  tooltip?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<PerformantEllipsisProps>(), {
  text: '',
  line: 1,
  tooltip: true,
  size: 'medium'
})

const sizeClass = computed(() => `c-performant-ellipsis--${props.size}`)

const ellipsisStyle = computed(() => ({
  display: '-webkit-box',
  '-webkit-line-clamp': props.line,
  '-webkit-box-orient': 'vertical',
  overflow: 'hidden',
  'text-overflow': 'ellipsis',
  'word-break': 'break-all'
}))
</script>

<style scoped>
.c-performant-ellipsis {
  line-height: 1.5;
}

.c-performant-ellipsis--small {
  font-size: 12px;
}

.c-performant-ellipsis--medium {
  font-size: 14px;
}

.c-performant-ellipsis--large {
  font-size: 16px;
}
</style>
