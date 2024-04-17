---
layout: page
sidebar: false
title: changweihua.github.io 最新文章 CMONO.NET
---
​
<script lang="ts" setup>
import { ref, unref, computed, onMounted } from 'vue'
import  { data }  from '@vp/post.data'

console.log('data', data)

const { yearMap, postMap } = data
const yearList = Object.keys(yearMap).sort((a, b) => b - a); // 按年份降序排序
const computedYearMap = computed(()=> {
  let result = {}
  for(let key in yearMap) {
    result[key] = yearMap[key].map(url => postMap[url])
  }
  return result
})

</script>

<div class="w-full px-6 py-8 mx-auto">
  <div v-for="year in yearList" :key="year">
    <div v-text="year" class="pt-3 pb-2 text-xl font-serif"></div>
    <div v-for="(article, index) in computedYearMap[year]" :key="article.url" class="flex justify-between items-center py-1 pl-6">
      <a v-text="article.title" :href="article.url" class="post-dot overflow-hidden whitespace-nowrap text-ellipsis"></a>
      <div v-text="article.date.string" class="pl-4 font-serif whitespace-nowrap"></div>
    </div>
  </div>
</div>
