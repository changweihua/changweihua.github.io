<script setup lang="ts">
import ElInputWrap from "./ElInputWrap1.vue";

defineOptions({
  inheritAttrs: false,
})

</script>

<template>
  <div>
    <ElInputWrap>
      <template #prefix="props">前缀: {{ props.msg }}</template>
      <template #suffix="props">后缀: {{ props.msg }}</template>
    </ElInputWrap>
  </div>
</template>