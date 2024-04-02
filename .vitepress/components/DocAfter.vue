<template>
  <div v-if="frontmatter['commentabled']" style="width: 100%; min-height: 300px; margin: 0 auto"
    class="justify-center items-center flex">
    <!-- <lottie-panel :animation-data="party"></lottie-panel> -->
    <UtterancesComment />
  </div>
  <div v-if="frontmatter['tags'] && frontmatter['tags'].length > 0" style="width: 200px; height: 100px; margin: 0 auto"
    class="justify-center items-center flex">
    <!-- <Tag v-for="tag in frontmatter['tags']" :key="tag">{{ tag }}</Tag> -->
  </div>
</template>

<script setup lang="ts">
import party from "@/lotties/waitingmore.json";
import { useData } from "vitepress";
import UtterancesComment from "@vp/components/UtterancesComment.vue"

// 获取 frontmatter
const { frontmatter } = useData();
</script>

<style lang="less">
lottie-panel {
  width: 200px;
  height: 100px;
}
</style>
