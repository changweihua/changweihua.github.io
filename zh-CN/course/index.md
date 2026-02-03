---
layout: page
sidebar: false
pageClass: course-index-page
---
<n-spin :show="spinning" size="large" :delay="delayTime">
  <div class="flex p-6 justify-center items-center">
    <ListView :categories="categories" />
  </div>
</n-spin>

<FloatingMenu />

<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import { delay } from "lodash-es";

import ListView from '@/components/ListView.vue';
import FloatingMenu from "#src/components/FloatingMenu.vue"

/*  
const indicator = h(LoadingIcon, {
  style: {
    fontSize: '48px',
  },
  spin: true,
});*/

const spinning = ref<boolean>(true);
const delayTime = 200;

const categories: Array<{
    title: string;
    link: string;
    description?: string;
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
  },{
    title: '.NET',
    link: '/course/dotnet/index',
    icon: '算法',
    description: 'Microsoft .NET'
  },{
    title: '.NET',
    link: '/course/dotnet/index',
    icon: '算法'
  },{
    title: '.NET',
    link: '/course/dotnet/index',
    icon: '算法'
  }];

onMounted(() => {
  delay(() => {
    spinning.value = false;
  }, 1500)
})

</script>

