<script setup>
import { useData } from 'vitepress'
import { onMounted, ref } from 'vue'

const { frontmatter } = useData()               // 当前页面的 frontmatter
const currentTags = ref(frontmatter.value.tags || [])
const relatedPosts = ref([])

// 获取所有页面的数据（仅客户端执行）
onMounted(async () => {
  // 利用 Vite 的 import.meta.glob 获取所有 .md 文件的路径
  const modules = import.meta.glob('../../**/*.md', { eager: true })

  const allPages = Object.entries(modules).map(([path, mod]) => {
    // 提取 frontmatter 和链接
    const fm = mod.frontmatter || {}
    const link = path
      .replace(/^\.\.\/\.\./, '')        // 移除相对路径前缀
      .replace(/\/index\.md$/, '/')      // index.md 转为目录形式
      .replace(/\.md$/, '')               // 去掉 .md 后缀
    return { ...fm, link }
  })

  // 根据当前页面的标签过滤
  const currentPath = window.location.pathname
  relatedPosts.value = allPages.filter(page => {
    // 排除当前页面
    if (page.link === currentPath) return false
    // 检查是否有相同标签（交集不为空）
    if (!page.tags || !currentTags.value.length) return false
    return page.tags.some(tag => currentTags.value.includes(tag))
  }).slice(0, 5)   // 最多显示5条
})
</script>

<template>
  <div v-if="relatedPosts.length" class="related-posts">
    <h3>相关推荐</h3>
    <ul>
      <li v-for="post in relatedPosts" :key="post.link">
        <a :href="post.link">{{ post.title }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.related-posts {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-divider);
}
.related-posts h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}
.related-posts ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.related-posts li {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 0.5rem 1rem;
}
</style>
