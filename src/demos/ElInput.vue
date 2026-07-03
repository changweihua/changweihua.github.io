<!-- ElInput.vue -->
<script setup lang="ts">
const model = defineModel();

defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <div>
    <slot name="prefix" msg="hello"></slot>
    <div><input v-model="model" /></div>
    <slot name="suffix" msg="world"></slot>
  </div>
</template>
