<template>
  <div class="flex gap-3 flex-row items-center justify-center pb-6">
    V{{ version }} |
    <GitIcon />
    <ViteIcon />
    <GithubIcon />
    <AntdesignIcon />
    <LatexIcon />
    <MarkdownIcon />
    <!-- <p class="version-tag w-20 text-center flex flex-row">
      {{ version }}
    </p> -->
  </div>
  <!-- - package name: {{ params?.pkg }} - version: {{ params?.version }} -->
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchVersion } from "../utils/fetchVersion";
import {
  AntdesignIcon,
  GithubIcon,
  GitIcon,
  MarkdownIcon,
  LatexIcon,
  ViteIcon,
} from "vue3-simple-icons";
const version = ref("N/A");
import { useData } from "vitepress";
const { params } = useData();
console.log(params.value);
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
