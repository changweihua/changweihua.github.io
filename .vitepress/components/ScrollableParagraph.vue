<template>
  <div class="progress"></div>
  <div class="scroll-color" ref="scrollColor">
    豫章故郡，洪都新府。星分翼轸，地接衡庐。襟三江而带五湖，控蛮荆而引瓯越.....此处省略
    n 字
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from "vue";

const scrollColorRef = useTemplateRef<HTMLDivElement>("scrollColor");

function handleScroll(e: any) {
  const rate =
    e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
  document.documentElement.style.setProperty("--scroll-progress", `${-rate}s`);
}

onMounted(() => {
  if (scrollColorRef.value) {
    scrollColorRef.value.addEventListener("scroll", handleScroll)
  }
});

onBeforeUnmount(() => {
  if (scrollColorRef.value) {
    scrollColorRef.value.removeEventListener("scroll", handleScroll)
  }
})
</script>
<style scoped>
body {
  timeline-scope: --progress-scroller;
}
.progress {
  width: 500px;
  height: 10px;
  background-color: red;
  transform-origin: 0 0;
  margin: 50px auto 0;
  animation: scale linear forwards;
  animation-timeline: --progress-scroller;
}
.progress2 {
  animation: scale 1s linear forwards paused;
  animation-delay: var(--scroll-progress);
}
.scroll-color {
  margin: 0 auto;
  width: 500px;
  height: 200px;
  overflow-y: auto;
  scroll-timeline-name: --progress-scroller;
  animation: color linear forwards;
  animation-timeline: --progress-scroller;
}
</style>

