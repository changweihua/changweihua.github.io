<template>
  <div v-if="frontmatter['commentabled']" style="width: 100%; min-height: 300px; margin: 0 auto"
    class="justify-center items-center flex">
    <UtterancesComment />
  </div>
  <div v-if="frontmatter['tags'] && frontmatter['tags'].length > 0" style="width: 200px; height: 100px; margin: 0 auto"
    class="justify-center items-center flex">
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
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
