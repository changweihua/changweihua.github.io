<template>
  <!-- 根据是否有错误，决定显示默认内容还是备用内容 -->
  <slot v-if="!hasError" />
  <slot v-else name="fallback" />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

// 一个标志位，记录当前边界内是否发生了错误
const hasError = ref(false)

onErrorCaptured((error) => {
  console.warn('错误边界捕获到错误:', error.message)

  // 标记错误状态，这会触发模板切换，显示 fallback 插槽
  hasError.value = true

  // 返回 false，阻止错误继续向上冒泡到更外层的组件或全局处理器
  // 这样，一条动态的错误就不会影响整个Feed组件
  return false
})

// 可以提供一个重置错误状态的方法
const reset = () => {
  hasError.value = false
}

// 如果需要，可以将 reset 方法暴露给父组件
defineExpose({ reset })
</script>
