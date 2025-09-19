---
layout: page
sidebar: false
layoutClass: m-nav-layout
pageClass: blog-index-page
title: Index

head:
  - - meta
    - name: keywords
      content: changweihua.github.io 最新文章 CMONO.NET
---

<a-spin :spinning="spinning" size="large" :delay="delayTime">
  <div class="flex p-6 justify-center items-center">
    <LinkListView :categories="categories" />
  </div>
</a-spin>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { delay } from "radashi";
import LinkListView from '@/components/LinkListView.vue';
import BlogIndex from "@vp/components/BlogIndex.vue";
import { useData } from 'vitepress'
import { data } from '@vp/blog.data'

const { lang } = useData()

const spinning = ref<boolean>(false);
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
  categories.value = (data[lang] ?? []).sort((a, b) => b.date.time - a.date.time)
      .slice(0, 12).map((p) => {
    return {
      link: p.url,
      title: p.title ,
      description: p.date.string,// p.excerpt,
      poster: '/images/cmono-4c0cf778e497ab206289099ce51db5f.png"',
      // icon: "VueJS",
    };
  });
  // fetch(`/jsons/lastest_blogs.json`)
  //   .then((res) => res.json())
  //   .then((json) => {
  //     categories.value = json.map((c) => {
  //       return {
  //         title: c["blogName"],
  //         link: c["filePath"],
  //         description: c["blogDescription"],
  //         poster: c["blogPoster"],
  //         // icon: "VueJS",
  //       };
  //     });
  //   }).finally(() => {
  //     delay(() => {
  //       spinning.value = false;
  //     }, 1500)
  //   });
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
