---
layout: page
sidebar: false
title: 效果图万花筒
---

<ClientOnly>

<ProjectLab></ProjectLab>

</ClientOnly>

<script setup lang="ts">
import { useData } from "vitepress";
import type { DocAnalysis } from "vitepress-plugin-doc-analysis";

const { theme } = useData();
const { fileList, totalFileWords, eachFileWords, lastCommitTime }: DocAnalysis = theme.value;

// 如果处在国际化环境下，vitepress 会将当前语言的 themeConfig 放到 theme 里，与原先的 theme 进行合并
console.log(fileList);
</script>
