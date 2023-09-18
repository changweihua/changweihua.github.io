---
layout: page
sidebar: false
pageClass: course-index-page
---

<div class="flex p-6 justify-center items-center">
  <ListView :categories="categories" />
</div>

<script setup lang="ts">
import ListView from '@/components/ListView.vue';

const categories: Array<{
    title: string;
    link: string;
    decription?: string;
    icon: string;
    poster?: string
    posterAlt?: string
  }> = [{
    title: '算法',
    link: '/course/algorithm/index',
    icon: '算法'
  },{
    title: 'TypeScript',
    link: '/course/typescript/preset_type',
    icon: '算法'
  }];

</script>
