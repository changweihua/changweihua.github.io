<template>
  <div class="async-component loaded">
    <!-- 这里不需要一个 Spiner 了，因为加载是在根部处理的 -->
    <slot />
  </div>
</template>

<script setup>
const { time } = defineProps({
  time: {
    type: Number,
    required: true
  }
})
// 加入一个延迟，以模拟加载数据
await new Promise(resolve => {
  setTimeout(() => {
    resolve()
  }, time)
})
</script>
