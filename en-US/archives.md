---
layout: page
sidebar: false
title: changweihua.github.io 最新文章 CMONO.NET
---
​
<script lang="ts" setup>
import { ref, unref, computed, onMounted } from 'vue'
import  { data }  from '@vp/post.data'
import date from "@vp/hooks/useDayjs";
import { useData } from 'vitepress'

const { lang } = useData()

const { yearMap, postMap, localeMap } = data
console.log('localeMap', localeMap[lang])
const yearList = Object.keys(localeMap[lang] ?? []).sort((a, b) => b - a); // 按年份降序排序
const computedYearMap = computed(()=> {
  let result = {}
  for(let key in yearMap) {
    result[key] = yearMap[key].map(url => postMap[url])
  }
  return result
})

</script>

<div class="w-full px-6 py-8 mx-auto">
  <div v-if="yearList && yearList.length > 0" v-for="year in yearList" :key="year">
    <div v-text="year" class="pt-3 pb-2 text-xl"></div>
    <div v-for="(article, index) in computedYearMap[year]" :key="article.url" class="flex justify-between items-center py-1 pl-6">
      <a v-text="article.title" :href="article.url" class="post-dot overflow-hidden whitespace-nowrap text-ellipsis"></a>
      <t-tooltip>
        <template #title>{{date.tz(article.date.time).format('YYYY-MM-DD hh:mm')}}</template>
        <div v-text="date.tz(article.date.time).fromNow()" class="pl-4 whitespace-nowrap"></div>
      </t-tooltip>
    </div>
  </div>
  <div class="flex items-center justify-center" v-else>
    <a-empty></a-empty>
  </div>
</div>
