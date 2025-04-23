<template>
  <!-- <div class="w-full p-6 md:w-1/2 lg:w-1/3"> -->
  <div class="w-full p-6">
    <div v-for="year in yearList" :key="year" class="mb-10">
      <div class="pt-3 pb-2">
        <h1 v-text="year" class="text-xl"></h1>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
        <div
          v-for="article in computedYearMap[year]"
          :key="article.url"
          class="flex justify-between items-center py-1 relative after:absolute after:right-[-0.5rem] after:top-0 after:h-full after:w-px after:bg-gray-200"
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
