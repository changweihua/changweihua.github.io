---
lastUpdated: true
commentabled: false
recommended: false
tags: ["Threejs与物理引擎"]
title: Threejs与物理引擎
description: Threejs与物理引擎
poster: /images/cmono-Siesta.png
date: 2023-08-28
---

# {{ $frontmatter.title}} #

<script lang="ts" setup>
import ThreeWithBall from "../../components/ThreeWithBall.vue"
console.log(ThreeWithBall)
</script>

<ClientOnly>
  <ThreeWithBall />
</ClientOnly>
