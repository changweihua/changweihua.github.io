<template>
  <div v-if="frontmatter['commentabled']"  style="width: 200px; height: 100px; margin: 0 auto;display: none;"
    class="comment-container justify-center items-center flex">
    <!-- <lottie-panel :animation-data="party"></lottie-panel> -->
  </div>
</template>

<script setup lang="ts">
// import party from "@/lotties/waitingmore.json";
import { useData } from "vitepress";

// 获取 frontmatter
const { frontmatter } = useData();
</script>

<style scoped>
lottie-panel {
  width: 200px;
  height: 100px;
}
</style>
