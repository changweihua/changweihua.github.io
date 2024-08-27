<template>
  <div class="flex gap-3 flex-row items-center justify-center pb-6">
    V{{ version }} |
    <GitIcon />
    <ViteIcon />
    <GitHubIcon />
    <AntDesignIcon />
    <LaTeXIcon />
    <MarkdownIcon />
    <!-- <p class="version-tag w-20 text-center flex flex-row">
      {{ version }}
    </p> -->
  </div>
  <!-- <div id="circle" class="circle bg-red-500"></div> -->
  <VisitsPanel /> <!-- - package name: {{ params?.pkg }} - version: {{ params?.version }} -->
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchVersion } from "../utils/fetchVersion";
import {
  AntDesignIcon,
  GitHubIcon,
  GitIcon,
  MarkdownIcon,
  LaTeXIcon,
  ViteIcon,
} from "vue3-simple-icons";
import VisitsPanel from './VisitsPanel.vue'

const version = ref("N/A");
// import { useData } from "vitepress";
// const { params } = useData();

onMounted(() => {
  const docsVersionSpan = document.querySelector(
    "footer.VPFooter > .container > p.version-tag"
  );
  if (!docsVersionSpan) {
    fetchVersion().then((v) => {
      version.value = v;
    });
  }
});
</script>
