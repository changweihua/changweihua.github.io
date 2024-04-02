// docs.vitepress\theme\Layout.vue
<script setup lang="ts">
import { unref, computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Comment from './components/Comment.vue';

const { page } = useData()
const { Layout } = DefaultTheme
const isHome = computed(() => unref(page)?.filePath === 'index.md')
</script>

<template>
  <Layout>
    <template #doc-after>
      <!-- 首页 Layout 使用的是 doc 所以需要判断，如果是 page 不会使用插槽 -->
      <Comment v-if="!isHome" :key="page.filePath"></Comment>
    </template>
  </Layout>
</template>
