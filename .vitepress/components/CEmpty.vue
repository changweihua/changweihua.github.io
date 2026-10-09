<template>
  <div class="c-empty" :class="sizeClass">
    <div class="c-empty-image" v-if="!$slots.default">
      <svg class="c-empty-svg" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <ellipse class="c-empty-ellipse" cx="32" cy="33" rx="32" ry="7" />
          <g class="c-empty-g" transform="rotate(90 28 30.5)">
            <rect class="c-empty-rect" x="14" y="21" width="28" height="3" rx="1.5" />
            <rect class="c-empty-rect-small" x="18" y="26" width="20" height="3" rx="1.5" />
          </g>
        </g>
      </svg>
    </div>
    <slot v-else />
    <div class="c-empty-description" v-if="description || $slots.description">
      <slot name="description">{{ description }}</slot>
    </div>
    <div class="c-empty-footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface EmptyProps {
  description?: string
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<EmptyProps>(), {
  description: '暂无数据',
  size: 'medium'
})

const sizeClass = computed(() => `c-empty--${props.size}`)
</script>

<style scoped>
.c-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  text-align: center;
}

.c-empty-image {
  margin-bottom: 8px;
}

.c-empty-svg {
  width: 64px;
  height: 41px;
}

.c-empty--small .c-empty-svg {
  width: 48px;
  height: 31px;
}

.c-empty--large .c-empty-svg {
  width: 96px;
  height: 61px;
}

.c-empty-ellipse {
  fill: #f5f5f5;
}

.c-empty-g {
  fill: #d9d9d9;
}

.c-empty-rect,
.c-empty-rect-small {
  fill: #fafafa;
}

.c-empty-description {
  color: #999;
  font-size: 14px;
  margin-top: 8px;
}

.c-empty--small .c-empty-description {
  font-size: 12px;
}

.c-empty--large .c-empty-description {
  font-size: 16px;
}

.c-empty-footer {
  margin-top: 16px;
}
</style>
