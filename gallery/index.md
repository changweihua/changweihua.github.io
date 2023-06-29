---
layout: page
sidebar: false
---

<div class="flex p-6 justify-center items-center">
	<category :categories="categories" />
</div>

<script setup lang="ts">
import category from '../components/category.vue';

const categories: Array<{
    title: string;
    link: string;
    decription?: string;
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
	  title: 'P-Touch P900 打印机使用',
    link: '/blog/2023-06/P-Touch P900 打印机使用.html',
    decription: '基于 VueJS + .NET + 微信小程序 开发，实现旅客服务二维码打印',
    icon: 'VueJS',
    cover: '/images/cmono-20230620145254.jpg'
  },{
	  title: '使用 SkiaSharp 实现图片水印',
    link: '/blog/2023-05/skiashap_watermark.html',
    description: '使用 SkiaSharp 实现图片水印',
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