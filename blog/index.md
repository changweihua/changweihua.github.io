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
  <ListView :categories="categories" />
</div>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import ListView from '@/components/ListView.vue';

let categories: ref<Array<{
    title: string;
    link: string;
    decription?: string;
    icon: string;
    poster?: string
    posterAlt?: string
  }>> = ref([]);


onMounted(() => {
  fetch(`/jsons/lastest_blogs.json`)
    .then((res) => res.json())
    .then((json) => {
      categories.value = json.map((c) => {
        return {
          title: c["blogName"],
          link: c["filePath"],
          description: c["blogDescription"],
          poster: c["blogPoster"],
          // icon: "VueJS",
        };
      });
    });
});


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
