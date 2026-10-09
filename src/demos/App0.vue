<script setup lang="ts">
import { ref } from "vue";
import ElInput from "./ElInput.vue";

defineOptions({
    inheritAttrs: false,
})

const inputText = ref("");
</script>

<template>
    <div>
        <ElInput v-model="inputText">
            <template #prefix="props">前缀: {{ props.msg }}</template>
            <template #suffix="props">后缀: {{ props.msg }}</template>
        </ElInput>
    </div>
</template>