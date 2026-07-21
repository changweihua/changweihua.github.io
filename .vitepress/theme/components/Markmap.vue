<template>
  <div
    class="markmap-container"
    ref="containerRef"
  ></div>
</template>

<script setup lang="ts">
  import { onMounted, watch, nextTick } from 'vue'
  import { useTemplateRef } from 'vue'
  // 改为默认导入
  import markmap from 'markmap-view'
  import { transform } from 'markmap-lib'

  const props = defineProps<{
    content: string
  }>()

  const containerRef = useTemplateRef<HTMLElement>('containerRef')
  let mm: any = null // 由于类型问题，暂时使用 any，或导入类型

  const render = (): void => {
    if (!containerRef.value) return
    const decoded = decodeURIComponent(props.content)
    const data = transform(decoded)
    if (mm) {
      mm.setData(data)
    } else {
      mm = markmap(containerRef.value, data)
    }
  }

  onMounted(render)
  watch(
    () => props.content,
    () => nextTick(render)
  )
</script>

<style scoped>
  .markmap-container {
    width: 100%;
    height: 500px;
  }
</style>
