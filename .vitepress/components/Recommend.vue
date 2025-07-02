<template>
  <div v-if="frontmatter['recommended']" style="width: 200px; height: 100px;margin: 0 auto;display: none;"
    class="recommended-container justify-center items-center flex">
    <!-- <lottie-panel :animation-data="party"></lottie-panel> -->
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'

// 获取 frontmatter
const { frontmatter } = useData()

</script>

<style scoped>
lottie-panel {
  width: 200px;
  height: 100px;
}
</style>
