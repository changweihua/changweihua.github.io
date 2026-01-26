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
              v-html="DOMPurify.sanitize(`${marked.parseInline(article.title)}`)"
              :href="article.url"
              class="block overflow-hidden whitespace-nowrap text-ellipsis"
            ></a>
            <n-tooltip trigger="hover">
              <template #trigger>
                <span
                  v-text="date(article.date.time).fromNow()"
                  class="pl-4 whitespace-nowrap"
                ></span
              ></template>
              {{ date(article.date.time).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm') }}
            </n-tooltip>
          </div>
        </div>
      </div>
    </div>
  </SpinHolder>
</template>
<script lang="ts" setup>
  import { computed, ref, onMounted } from 'vue'
  // @ts-ignore
  import { data } from '@vp/post.data'
  import date from '@vp/hooks/useDayjs'
  import { marked } from 'marked'
  import DOMPurify from 'dompurify'
  import { delay } from 'lodash-es'

  const spinning = ref(true)

  const yearList = ref<Array<string>>([])
  const computedYearMap = computed(() => {
    const { yearMap, postMap } = data
    let result = {}
    for (let key in yearMap) {
      result[key] = yearMap[key].map((url) => postMap[url])
    }
    return result
  })

  onMounted(() => {
    const { yearMap } = data
    yearList.value = Object.keys(yearMap).sort((a, b) => parseInt(b) - parseInt(a)) // 按年份降序排序

    delay(function () {
      spinning.value = false
    }, 3000)
  })
</script>

<style scoped>
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

      /* enter from stage left */
      @starting-style {
        opacity: 0;
        translate: -100px 0;
      }
    }
  }
</style>
