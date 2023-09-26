---
layout: page
sidebar: false
layoutClass: m-nav-layout
pageClass: blog-index-page

head:
  - - meta
    - name: keywords
      content: changweihua.github.io 最新文章 CMONO.NET
---
<!-- <BlogIndex /> -->
<a-spin :spinning="spinning" size="large" :delay="delayTime">
  <div class="flex p-6 justify-center items-center">
    <ListView :categories="categories" />
  </div>
</a-spin>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { delay } from "lodash-es";
import ListView from '@/components/ListView.vue';
import BlogIndex from "@vp/components/BlogIndex.vue"

const spinning = ref<boolean>(true);
const delayTime = 200;

let categories: ref<Array<{
    title: string;
    link: string;
    description?: string;
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
    }).finally(() => {
      delay(() => {
        spinning.value = false;
      }, 1500)
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
