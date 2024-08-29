<template>
  <div class="flex gap-3 flex-row items-center justify-center pb-6">
    V{{ version }} |
    <!-- <i-icon class="item" icon="logos:git" :width="24" :height="24" />
    <i-icon class="item" icon="logos:vitejs" :width="24" :height="24" />
    <i-icon class="item" icon="logos:github-octocat" :width="24" :height="24" />
    <i-icon class="item" icon="logos:ant-design" :width="24" :height="24" /> -->
    <i-icon class="item" icon="logos:markdown" :width="24" :height="24" />
    <!-- <i-icon class="item" icon="simple-icons:mermaid" :width="24" :height="24" />
    <i-icon class="item" icon="bxl:typescript" :width="24" :height="24" /> -->
    <i-icon class="item" icon="token-branded:rss3" :width="24" :height="24" />
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
