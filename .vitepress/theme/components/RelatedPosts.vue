<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import { type Post } from '../../posts.data'
import { data } from '../../posts.data'
import { shuffle } from 'lodash-es'

const allPosts = data as unknown as Post[]

const { frontmatter, page } = useData()

// 当前页面的标签（确保为数组）
const currentTags = (frontmatter.value.tags as string[]) || []

// 随机取8条有封面图的文章（排除当前页）
const related = computed<Post[]>(() => {
  const currentUrl = `/${page.value.relativePath.replace(/\.md$/, '')}`

  // 筛选出有封面图且非当前页的文章
  const candidates = allPosts.filter(post => post.cover && post.url !== currentUrl)

  // 使用 lodash 的 shuffle 随机打乱，然后取前8条
  return shuffle(candidates).slice(0, 8)
})
</script>

<template>
  <div v-if="related.length" class="related-posts">
    <h2>随便看看</h2>
    <ul class="post-list">
      <li v-for="post in related" :key="post.url" class="post-item">
        <a :href="post.url"><n-performant-ellipsis><n-gradient-text type="info">{{ post.title
              }}</n-gradient-text></n-performant-ellipsis></a>
      </li>
    </ul>
  </div>
  <n-space v-else vertical>
    <n-skeleton height="40px" width="33%" />
    <n-skeleton height="40px" width="66%" :sharp="false" />
    <n-skeleton height="40px" round />
    <n-skeleton height="40px" circle />
  </n-space>
</template>

<style scoped>
.related-posts {
  margin-bottom: 1rem;
  padding: 0 1rem;
}

.related-posts h2 {
  font-size: 1rem;
  margin: 0.5rem 0;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-item {
  font-size: 0.9rem;
  line-height: 1.4;
}

.post-item a {
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: color 0.2s;
  display: block;
  padding: 0.25rem 0;
}

.post-item a:hover {
  color: var(--vp-c-brand);
}
</style>
