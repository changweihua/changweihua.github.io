---
layout: page
sidebar: false
title: changweihua.github.io 最新文章 CMONO.NET
---

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { data } from '@vp/post.data'
import { useData } from 'vitepress'

// ============ 原生日期工具函数（替代 dayjs） ============

/**
 * 格式化时间戳为 "YYYY-MM-DD HH:mm"（Asia/Shanghai 时区，24小时制）
 * 与原 dayjs.tz(time).format('YYYY-MM-DD HH:mm') 一致
 */
function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24小时制
    timeZone: 'Asia/Shanghai',
  })
  const parts = formatter.formatToParts(date)
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]))
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}`
}

/**
 * 计算相对时间（中文），例如 "3天前"、"2小时后"
 * 与 dayjs().fromNow() 行为一致
 */
function fromNow(timestamp: number): string {
  const now = Date.now()
  const diffMs = timestamp - now
  const diffSec = Math.round(diffMs / 1000)
  const absSec = Math.abs(diffSec)

  let unit: Intl.RelativeTimeFormatUnit
  let value: number

  if (absSec < 60) {
    unit = 'second'
    value = diffSec
  } else if (absSec < 3600) {
    unit = 'minute'
    value = Math.round(diffSec / 60)
  } else if (absSec < 86400) {
    unit = 'hour'
    value = Math.round(diffSec / 3600)
  } else if (absSec < 2592000) { // 30天
    unit = 'day'
    value = Math.round(diffSec / 86400)
  } else if (absSec < 31536000) { // 365天
    unit = 'month'
    value = Math.round(diffSec / 2592000)
  } else {
    unit = 'year'
    value = Math.round(diffSec / 31536000)
  }

  const rtf = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })
  return rtf.format(value, unit)
}

// ============ 组件逻辑 ============

const { lang } = useData()
const { yearMap, postMap, localeMap } = data

// 按语言获取年份列表（降序）
const yearList = Object.keys(localeMap[lang] ?? {}).sort((a, b) => b - a)

// 计算各年份的文章列表
const computedYearMap = computed(() => {
  const result: Record<string, any[]> = {}
  for (const key in yearMap) {
    result[key] = yearMap[key].map((url: string) => postMap[url])
  }
  return result
})
</script>

<template>
  <div class="w-full px-6 py-8 mx-auto">
    <div v-if="yearList && yearList.length > 0">
      <div v-for="year in yearList" :key="year">
        <div class="pt-3 pb-2 text-xl">{{ year }}</div>
        <div
          v-for="article in computedYearMap[year]"
          :key="article.url"
          class="flex justify-between items-center py-1 pl-6"
        >
          <a
            :href="article.url"
            class="post-dot overflow-hidden whitespace-nowrap text-ellipsis"
          >
            {{ article.title }}
          </a>
          <t-tooltip>
            <template #title>
              {{ formatDateTime(article.date.time) }}
            </template>
            <div class="pl-4 whitespace-nowrap">
              {{ fromNow(article.date.time) }}
            </div>
          </t-tooltip>
        </div>
      </div>
    </div>
    <div v-else class="flex items-center justify-center">
      <n-empty />
    </div>
  </div>
</template>