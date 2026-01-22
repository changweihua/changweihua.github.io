---
layout: page
sidebar: false
layoutClass: m-nav-layout
pageClass: manual-index-page
title: 手册列表
---

<n-spin :loading="spinning" size="large" :delay="delayTime">
  <div class="flex p-6 justify-center items-center">
    <CardListView :items="categories" />
  </div>
</n-spin>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { delay } from "lodash-es";
import CardListView from '@/components/CardListView.vue';
import { useData } from 'vitepress'
import { data } from '@vp/manual.data'

const { lang } = useData()
console.log('data',data)
console.log('lang', `${lang.value}`)
console.log('data[lang]',data[lang.value])

const spinning = ref<boolean>(false);
const delayTime = 200;

let categories: ref<Array<{
    title: string;
    link: string;
    category: string;
    description?: string;
    icon: string;
    cover?: string
    coverAlt?: string
  }>> = ref([]);

onMounted(() => {
  categories.value = (data[lang.value] ?? []).sort((a, b) => b.date.time - a.date.time).map((p) => {
    return {
      link: p.url,
      title: p.title,
      category: p.category,
      description: p.date.string,// p.excerpt,
      // poster: '/images/cmono-4c0cf778e497ab206289099ce51db5f.png"',
      cover: p.cover
      // icon: "VueJS",
    };
  });
});


</script>
