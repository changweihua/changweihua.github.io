<template>
  <div class="markmap-container" ref="containerRef"></div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import { useTemplateRef } from 'vue'
// markmap-view 使用 Markmap 类（大写 M）
import { Markmap } from 'markmap-view'
// markmap-lib 使用 Transformer 类
import { Transformer } from 'markmap-lib'

const props = defineProps<{
  content: string
}>()

const containerRef = useTemplateRef<HTMLElement>('containerRef')
let mm: any = null

// 创建 transformer 实例（只需创建一次）
const transformer = new Transformer()

const render = (): void => {
  if (!containerRef.value) return
  const decoded = decodeURIComponent(props.content)
  // 使用 transformer.transform() 转换
  const data = transformer.transform(decoded)
  
  if (mm) {
    mm.setData(data)
  } else {
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
