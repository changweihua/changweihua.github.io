<template>
  {{ title }}
  <ul class="task-list">
    <li v-for="(task, index) in tasks" :key="index">
      <input type="checkbox" v-model="task.checked" />
      <span :class="{ checked: task.checked }">{{ task.text }}</span>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
const props = defineProps({ content: String, title: String });
const tasks = ref<Array<{ checked: boolean; text: string }>>([]);
// 匹配所有任务项（含状态）
const pattern = /^\s*-\s+$$([ x])$$\s+(.+)$/gm;
onMounted(() => {
  if (props.content) {
    tasks.value = decodeURIComponent(props.content)
      .split("\n")
      .filter((line) => line && line.trim().match(pattern))
      .map((line) => ({
        checked: line.includes("[x]"),
        text: line.replace(pattern, "").trim(),
      }));
  }
});
</script>

<style scoped>
.task-list-item input[type="checkbox"] {
  transition: all 0.3s ease;
  accent-color: var(--vp-c-brand); /* 使用主题色 */
}

.task-list-item.checked {
  opacity: 0.6;
  text-decoration: line-through;
}
</style>
