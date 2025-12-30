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
    <div class="flex p-6 justify-center items-center">
      <CursorShineCards :categories="categories" />
    </div>
</ClientOnly>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { delay } from "lodash-es";
import LinkListView from '@/components/LinkListView.vue';
import CursorShineCards from '@/components/CursorShineCards.vue';
import BlogIndex from "@vp/components/BlogIndex.vue"
import { useData } from 'vitepress'
import { data } from '@vp/blog.data'
import { getDateTime } from  "@vp/hooks/useDayjs";

const { lang } = useData()
console.log('data',data)
console.log('lang', `${lang.value}`)
console.log('data[lang]',data[lang.value])

const spinning = ref(false);
watch(
  () => spinning.value,
  (v) => {
    if (!v) return;
    const timer = setTimeout(() => {
      spinning.value = false;
      clearTimeout(timer);
    }, 6000);
  },
);

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
