<template>
  <div class="w-full">
      <div v-for="year in yearList" :key="year">
        <div class="pt-3 pb-2">
          <h1 v-text="year" class="text-xl"></h1>
        </div>
        <div
          v-for="(article) in computedYearMap[year]"
          :key="article.url"
          class="flex justify-between items-center py-1"
        >
          <a
            v-text="article.title"
            :href="article.url"
            class="post-dot overflow-hidden whitespace-nowrap text-ellipsis"
          ></a>
          <a-tooltip>
            <template #title>{{
              dayjs.tz(article.date.time).format("YYYY-MM-DD hh:mm")
            }}</template>
            <span
              v-text="dayjs.tz(article.date.time).fromNow()"
              class="pl-4 whitespace-nowrap"
            ></span>
          </a-tooltip>
        </div>
      </div>
    </div>
</template>
<script lang="ts" setup>
import { computed } from "vue";
// @ts-ignore
import { data } from "@vp/post.data";
import dayjs from "dayjs";

const { yearMap, postMap } = data;
const yearList = Object.keys(yearMap).sort((a, b) => parseInt(b) - parseInt(a)); // 按年份降序排序
const computedYearMap = computed(() => {
  let result = {};
  for (let key in yearMap) {
    result[key] = yearMap[key].map((url) => postMap[url]);
  }
  return result;
});
</script>

<style lang="less" scoped>
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
</style>
