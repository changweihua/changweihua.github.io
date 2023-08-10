<template>
  <div v-if="frontmatter['commentabled']" style="width: 200px; height: 100px;margin: 0 auto;" class="justify-center items-center flex">
    <lottie-panel :animation-data="party"></lottie-panel>
  </div>
  <div v-if="frontmatter['tags'] && frontmatter['tags'].length > 0" style="width: 200px; height: 100px;margin: 0 auto;" class="justify-center items-center flex">
    <a-tag v-for="tag in frontmatter['tags']" :key="tag">{{ tag }}</a-tag>
  </div>
</template>

<script setup lang="ts">
import party from "../../public/lotties/waitingmore.json";
import { useData } from 'vitepress'

 // 获取 frontmatter
 const { frontmatter } = useData()
 console.log(frontmatter)

</script>

<style lang="less">
lottie-panel {
  width: 200px;
  height: 100px;
}
</style>
