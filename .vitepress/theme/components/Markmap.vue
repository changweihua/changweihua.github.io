<template>
  <div class="markmap-container" ref="containerRef"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import { useTemplateRef } from 'vue'
// ✅ 正确：导入 Markmap 类（大写 M）
import { Markmap } from 'markmap-view'
// ✅ 正确：transform 来自 markmap-lib
import { transform } from 'markmap-lib'

const props = defineProps<{
  content: string
}>()

const containerRef = useTemplateRef<HTMLElement>('containerRef')
let mm: any = null

const render = (): void => {
  if (!containerRef.value) return
  const decoded = decodeURIComponent(props.content)
  // transform 将 Markdown 转换为数据
  const data = transform(decoded)
  
  if (mm) {
    mm.setData(data)
  } else {
    // Markmap.create 渲染思维导图[reference:4]
    mm = Markmap.create(containerRef.value, data)
  }
}

onMounted(render)
watch(() => props.content, () => nextTick(render))
</script>

<style scoped>
.markmap-container {
  width: 100%;
  height: 500px;
}
</style>
