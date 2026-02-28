<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import { data } from '../../posts.data'
import { type Post } from '../../posts.data'

const allPosts = data as unknown as Post[]
const { page } = useData()

// 将当前页面的 URL 标准化（与数据中的 url 格式一致）
const currentUrl = computed(() => {
  return `/${page.value.relativePath.replace(/\.md$/, '')}.html`
})

// 按日期降序排序（最新在前）
const sortedPosts = computed<Post[]>(() => {
  return [...allPosts].sort((a, b) => {
    // 日期字符串转时间戳，如果无效则排到最后
    const timeA = a.date ? new Date(a.date).getTime() : 0
    const timeB = b.date ? new Date(b.date).getTime() : 0
    return timeB - timeA   // 降序（新 -> 旧）
  })
})

// 找到当前文章在排序列表中的索引
const currentIndex = computed(() => {
  return sortedPosts.value.findIndex(post => post.url === currentUrl.value)
})

// 上一篇（日期更旧，即索引更大的那一个）
const prevPost = computed<Post | null>(() => {
  const idx = currentIndex.value
  if (idx === -1 || idx === sortedPosts.value.length - 1) return null
  return sortedPosts.value[idx + 1]
})

// 下一篇（日期更新，即索引更小的那一个）
const nextPost = computed<Post | null>(() => {
  const idx = currentIndex.value
  if (idx === -1 || idx === 0) return null
  return sortedPosts.value[idx - 1]
})
</script>

<template>
  <nav v-if="prevPost || nextPost" class="prev-next">
    <div class="pager">
      <span v-if="prevPost" class="pager-item prev">
        <a :href="prevPost.url" class="pager-link">
          <span class="desc">上一篇</span>
          <span class="title">{{ prevPost.title }}</span>
        </a>
      </span>
      <span v-else class="pager-item prev disabled">
        <span class="desc">上一篇</span>
        <span class="title">没有了</span>
      </span>

      <span v-if="nextPost" class="pager-item next">
        <a :href="nextPost.url" class="pager-link">
          <span class="desc">下一篇</span>
          <span class="title">{{ nextPost.title }}</span>
        </a>
      </span>
      <span v-else class="pager-item next disabled">
        <span class="desc">下一篇</span>
        <span class="title">没有了</span>
      </span>
    </div>
  </nav>
</template>

<style scoped>
.prev-next {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-divider);
}

.pager {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.pager-item {
  flex: 1;
  max-width: 48%;
}

.pager-link {
  display: block;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  transition: background-color 0.2s;
}

.pager-link:hover {
  background-color: var(--vp-c-bg-mute);
}

.desc {
  display: block;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.25rem;
}

.title {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  word-break: break-word;
}

.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.disabled .title {
  color: var(--vp-c-text-3);
}
</style>
