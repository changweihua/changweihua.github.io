<!-- ElInputWrap1.vue -->
<template>
  <div>
    <h1>我是二次封装的组件</h1>
    <ElInput>
      <template v-for="(_, slotName) in $slots" #[slotName]="props">
        <slot :name="slotName" v-bind="props" />
      </template>
    </ElInput>
  </div>
</template>

<script setup lang="ts">
import ElInput from "./ElInput.vue";
defineOptions({
  inheritAttrs: false,
})
// 这种方式通过遍历 $slots 动态渲染命名插槽，实现了插槽的“透传”。它简单直观，适合大多数场景。

// 提取插槽类型以获得更好的 TS 支持
type ElInputSlots = InstanceType<typeof ElInput>["$slots"];
defineSlots<ElInputSlots>();
</script>
