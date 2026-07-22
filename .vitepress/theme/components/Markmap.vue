<!-- .vitepress/theme/components/Markmap.vue -->
<template>
  <div
    class="markmap-container"
    ref="containerRef"
  ></div>
</template>

<script setup lang="ts">
  import { onMounted, watch, nextTick } from 'vue'
  import { useTemplateRef } from 'vue'
  import { Markmap } from 'markmap-view'
  import { Transformer } from 'markmap-lib'

  const props = defineProps<{
    content: string
  }>()

  const containerRef = useTemplateRef<HTMLElement>('containerRef')
  let mm: any = null
  const transformer = new Transformer()

  const render = () => {
    if (!containerRef.value) return
    const decoded = decodeURIComponent(props.content)
    const data = transformer.transform(decoded)
    if (mm) {
      mm.setData(data)
    } else {
      mm = Markmap.create(containerRef.value, data)
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
