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
    <category :categories="categories" />
  </div>

<script setup lang="ts">
import category from '../components/category.vue';

let categories: Array<{
    title: string;
    link: string;
    decription?: string;
    icon: string;
    poster?: string
    posterAlt?: string
  }> = [{
	  title: '参与 Github 开源项目，提交 PR',
    link: '/blog/2023-08/cooperation_with_repository.html',
    decription: '学习如何为开源项目贡献自己的力量',
    icon: 'VueJS'
  },{
	  title: '快速搭建微信小程序原生开发框架',
    link: '/blog/2023-07/wechat_quickstart.html',
    poster: '/logos/logo_wechat.png'
  },{
	  title: '如何为小程序配置不同的运行环境',
    link: '/blog/2023-07/wechat_multienv.html',
    poster: '/logos/logo_wechat.png'
  },{
	  title: '我常用的 Visual Code 插件，助力开发起飞',
    link: '搭建基于 Vite4 + Ant Design Vue 3.0 管理系统',
    icon: 'VueJS'
  },{
	  title: 'P-Touch P900 打印机使用',
    link: '/blog/2023-06/P-Touch P900 打印机使用.html',
    decription: '基于 VueJS + .NET + 微信小程序 开发，实现旅客服务二维码打印',
    icon: 'VueJS',
    poster: '/images/cmono-20230620145254.jpg'
  },{
	  title: '使用 SkiaSharp 实现图片水印',
    link: '/blog/2023-05/skiashap_watermark.html',
    description: '使用 SkiaSharp 实现图片水印',
    icon: 'VueJS'
  },{
	  title: '给小程序添加一个评分分值分布雷达图，完善评价体系',
    link: '/blog/2023-07/weapp_canvas_radar.html',
    icon: 'VueJS',
    poster: '/images/cmono-%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20230717155014.jpg'
  },{
	  title: '过于单调的小程序页面，靠 Lottie 动画拯救',
    link: '/blog/2023-07/lottie_in_weapp.html',
    icon: 'VueJS',
    poster: '/images/cmono-%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20230719092233.jpg'
  },{
	  title: '如何为小程序添加一个启动页',
    link: '/blog/2023-07/weapp_splash.html',
    icon: 'VueJS'
  }];

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
