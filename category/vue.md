---
layout: page
date: 2019-08-13 09:39:50
---

<div class="flex p-6 justify-center items-center">
	<category :categories="categories" />
</div>

<script setup lang="ts">
import category from '../components/category.vue';

const categories: Array<{
    title: string;
    link: string;
    icon: string;
    cover?: string
    coverAlt?: string
  }> = [{
	title: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    link: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    icon: 'VueJS'
  },{
	title: '搭建基于 VitePress 个人网站',
    link: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    icon: 'VueJS'
  },{
	title: 'Vite 打包优化教程',
    link: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    icon: 'VueJS'
  },{
	title: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    link: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    icon: 'VueJS'
  },{
	title: '搭建基于 VitePress 个人网站',
    link: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    icon: 'VueJS'
  },{
	title: 'Vite 打包优化教程',
    link: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    icon: 'VueJS'
  },{
	title: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    link: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    icon: 'VueJS'
  },{
	title: '搭建基于 VitePress 个人网站',
    link: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    icon: 'VueJS'
  },{
	title: 'Vite 打包优化教程',
    link: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    icon: 'VueJS'
  }];

</script>
