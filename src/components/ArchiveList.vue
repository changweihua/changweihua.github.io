<template>
  <SpinHolder
    :spinning="spinning"
    type="orbit"
    :fullscreen="spinning"
    tip="正在处理..."
  >
    <div class="archive-container w-full p-6 animate__animated animate__fadeInUp">
      <div
        v-for="year in yearList"
        :key="year"
        class="year-archive mb-10"
      >
        <div class="pt-3 pb-2 animate__animated animate__zoomIn transform-gpu">
          <h1
            v-text="year"
            class="text-xl"
          ></h1>
        </div>
        <div
          class="animate__animated animate__slideInLeft grid grid-cols-1 md:grid-cols-2 md:gap-x-20 lg:grid-cols-3 lg:gap-x-20"
        >
          <div
            v-for="article in computedYearMap[year]"
            :key="article.url"
            class="archive-article flex justify-between items-center py-1 relative after:absolute after:right-[-0.5rem] after:top-0 after:h-full after:w-px after:bg-gray-200"
          >
            <a
              v-html="DOMPurify.sanitize(`${marked.parseInline(article.title || '')}`)"
              :href="article.url"
              class="block overflow-hidden whitespace-nowrap text-ellipsis"
            ></a>
            <n-tooltip trigger="hover">
              <template #trigger>
                <span
                  v-text="fromNow(article.date.time)"
                  class="pl-4 whitespace-nowrap"
                ></span>
              </template>
              {{ formatDateTime(article.date.time) }}
            </n-tooltip>
          </div>
        </div>
      </div>
    </div>
  </SpinHolder>
</template>

<script lang="ts" setup>
  import { computed, ref, onMounted } from 'vue'
  import { data } from '@vp/post.data'
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'
  import { delay } from 'lodash-es'

  // ============ 原生日期工具（替代 dayjs） ============

  /**
   * 格式化时间戳为 "YYYY-MM-DD HH:mm"（Asia/Shanghai 时区）
   */
  function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp)
    const formatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Shanghai'
    })
    const parts = formatter.formatToParts(date)
    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]))
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
    } else if (absSec < 2592000) {
      // 30天
      unit = 'day'
      value = Math.round(diffSec / 86400)
    } else if (absSec < 31536000) {
      // 365天
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

  const spinning = ref(true)

  const yearList = ref<Array<string>>([])

  const computedYearMap = computed(() => {
    const { yearMap, postMap } = data
    const result: Record<string, any[]> = {}
    for (const key in yearMap) {
      result[key] = yearMap[key].map((url: string) => postMap[url])
    }
    return result
  })

  onMounted(() => {
    const { yearMap } = data
    yearList.value = Object.keys(yearMap).sort((a, b) => parseInt(b) - parseInt(a))

    delay(() => {
      spinning.value = false
    }, 3000)
  })
</script>

<style scoped>
  /* 样式保持不变 */
  .reader-content {
    display: inline-block;
    margin: 0 !important;
    :deep(.anticon) {
      font-size: 14px;
      margin: 0 !important;
      svg {
        margin: 0 !important;
      }
    }
  }
  .read-text-icon:hover {
    color: #2396ef;
  }
  .cursor-pointer {
    cursor: pointer;
  }

  .archive-container {
    [data-animate] {
      --stagger: 0;
      --delay: 120ms;
      --start: 0ms;
    }

    @media (prefers-reduced-motion: no-preference) {
      [data-animate] {
        animation: enter 0.6s both;
        animation-delay: calc(var(--stagger) * var(--delay) + var(--start));
      }
    }

    .year-archive .archive-article {
      --stagger: calc((sibling-index() - 1) * 0.1s);
      transition:
        opacity 1s var(--ease-4) var(--stagger),
        translate 1s var(--ease-spring-2) var(--stagger);

      @starting-style {
        opacity: 0;
        translate: -100px 0;
      }
    }
  }
</style>