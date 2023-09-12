---
layout: page
sidebar: false
pageClass: blog-index-page

head:
  - - meta
    - name: keywords
      content: changweihua.github.io 最新文章 CMONO.NET
---

  <div class="flex p-6 justify-center items-center">
    <category :categories="categories" />
  </div>

<script setup lang="ts">
import category from '@/components/category.vue';

let categories: Array<{
    title: string;
    link: string;
    decription?: string;
    icon: string;
    poster?: string
    posterAlt?: string
  }> = [];

</script>

<!-- ---
layout: doc
sidebar: false
---

# 项目进度 #

<hr />

::: timeline 2023-06-20
- **打印机**
:::

::: timeline 2023-06-12
:tada: 开始试运行 :tada:
:::

::: timeline 2023-06-09
:tada: 项目重新起航 :tada:
::: -->
