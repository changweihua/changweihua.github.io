<!-- ElInputWrap2.vue -->
<template>
  <div>
    <h1>我是二次的二次封装的组件</h1>
    <component :is="h(ElInput, $attrs, $slots)"></component>
  </div>
</template>

<script setup lang="ts">
import { h } from "vue";
import ElInput from "./ElInput.vue";
defineOptions({
  inheritAttrs: false,
})
// 使用h + component：**适用于更灵活、更底层的封装需求。

// 从 ElInput 的类型中提取插槽类型
type ElInputSlots = InstanceType<typeof ElInput>["$slots"];

// 定义 ElInputWrap 的插槽类型与 ElInput 一致
defineSlots<ElInputSlots>();
</script>
