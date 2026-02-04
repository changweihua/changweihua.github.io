<script lang="ts" setup>
import { useData, useRoute } from 'vitepress'
import { computed, onMounted, toRaw, useTemplateRef } from 'vue'

const { frontmatter } = useData()
const route = useRoute()
const vpDocRef = useTemplateRef<HTMLDivElement>('vpDocRef')

// 获取当前页面的 hash
const contentHash = computed(() => {
  return frontmatter.value.contentHash ||
         route.path.replace(/\//g, '-').slice(1) ||
         'default'
})

// 为 VP-Doc 添加 ID
onMounted(() => {
  console.log(toRaw(vpDocRef.value))
  if (vpDocRef.value) {
    const docElement = vpDocRef.value.querySelector('.vp-doc') ||
                      vpDocRef.value
    if (docElement && !docElement.id) {
      docElement.id = `vp-doc-${contentHash.value}`
    }
  }
})
</script>

<template>
  <div ref="vpDocRef" :data-content-hash="contentHash">
    <slot />
  </div>
</template>
