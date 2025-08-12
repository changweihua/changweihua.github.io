---
layout: page
sidebar: false
layoutClass: m-nav-layout
pageClass: blog-index-page
title: 最新文章列表

head:
  - - meta
    - name: keywords
      content: changweihua.github.io 最新文章 CMONO.NET
---

<ClientOnly>
  <a-spin :spinning="spinning" size="large" :delay="delayTime">
    <div class="flex p-6 justify-center items-center">
      <CursorShineCards :categories="categories" />
    </div>
  </a-spin>
</ClientOnly>
<!-- 
<demo html="anime-1.html" title="混合语法 DEMO"
  description="这是一个混合 demo 的示例，你可以使用 title 和 description 来指定 demo 的标题和描述" /> -->

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { delay } from "lodash-es";
import LinkListView from '@/components/LinkListView.vue';
import CursorShineCards from '@/components/CursorShineCards.vue';
import BlogIndex from "@vp/components/BlogIndex.vue"
import { useData } from 'vitepress'
import { data } from '@vp/blog.data'
import { getDateTime } from '@vp/utils/date'

const { lang } = useData()
console.log('data',data)
console.log('lang', `${lang.value}`)
console.log('data[lang]',data[lang.value])

const spinning = ref<boolean>(false);
const delayTime = 200;

let categories: ref<Array<{
    title: string;
    link: string;
    description?: string;
    icon: string;
    cover?: string
    coverAlt?: string
  }>> = ref([]);

onMounted(() => {
  categories.value = (data[lang.value] ?? []).sort((a, b) => b.date.time - a.date.time)
      .slice(0, 30).map((p) => {
    return {
      link: p.url,
      title: p.title ,
      description: p.date.string,// p.excerpt,
      // poster: '/images/cmono-4c0cf778e497ab206289099ce51db5f.png"',
      cover: p.cover
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
