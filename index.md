---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
pageClass: index-page-class
title: CMONO.NET
titleTemplate: 首页

description: My awesome page description

hero:
  name: "常伟华"
  text: "DOTNET Developer"
  tagline: 阳光大男孩
  image:
    src: /small_logo.png
    alt: 网页的logo图标
  actions:
    - theme: brand
      text: 我的简历
      link: /about/resume
    - theme: alt
      text: Github
      link: https://github.com/changweihua

features:
  - title: 阳光服务平台
    icon:
      src: /sunnyland.svg
      alt: 阳光服务平台
    details: 依托微信小程序，为苏南硕放国际机场量身打造阳光服务平台
    link: /gallery/sunny-land
    # linkText: 更多详情
  - title: 扬泰机场智慧出行小程序
    icon:
      src: /yty_logo.png
      alt: 扬泰机场智慧出行小程序
    details: 为扬泰机场旅客提供航班动态查询、在线值机、停车场收费标准等自助服务
    link: /gallery/airyty
  - title: 苏南硕放国际机场微信小程序
    icon:
      src: /air_wux.png
      alt: 苏南硕放国际机场微信小程序
    details: 苏南硕放国际机场旅客服务平台前端载体。
    link: /gallery/airwux
  - title: wx-navigation-bar
    details: 小程序自定义导航栏NPM包。以此实现顶部图片背景效果。
    link: /gallery/wx-navigation-bar
  - title: wx-lifecycle-interceptor
    details: 小程序生命周期方法拦截器NPM包。Fork 后适配最新版微信组件生命周期。
    link: https://www.npmjs.com/package/wx-lifecycle-interceptor
  # - title: antdv-plus-table
  #   details: Ant Design Vue Table 扩展NPM包。
  #   link: https://www.npmjs.com/package/@changweihua/antdv-plus-table
  - title: Nobilis.Epps
    details: 基于 Epplus 实现 Excel 的快速导入导出 NUGET包。
    link: https://www.nuget.org/packages/Nobilis.Epps
  - title: 疫情防控平台
    details: 疫情期间，为满足公司疫情防控需求，开发上线本系统。特色功能包含基于百度Paddle实现健康码和行程码信息自动提取和预警，支持人脸识别登录。
    link: /gallery/epcp
  - title: 基于K8S平台的持续交付平台
    details: 研发技改产物，促进开发流程规范化及自动化运维。通过Docker统一开发、测试和生产的环境，同时完成系统版本自动发布，提升自动化。
    link: /gallery/giteaops
  - title: 苏南硕放国际机场安检效能分析系统
    details: 通过数字化大屏，图形化报表，动态化效果，助力安检数据展示及效能分析。
    link: /gallery/SCPEA
  - title: 进出港旅客查询和无纸化系统项目
    details: 为安检部门提供今日的所有起降航班乘机人数。
  - title: 扬州泰州国际机场客源地分析系统
    details: 统计所有从扬泰机场出发或到达的旅客来源分布。
  - title: 苏南硕放国际机场生产统计系统
    details: 整个机场运行生产统计数据。

head:
  - - meta
    - name: keywords
      content: changweihua.github.io 首页 CMONO.NET
---

<!-- <a-button>123</a-button>
<a-timeline mode="alternate">
<a-timeline-item>Create a services site 2015-09-01</a-timeline-item>
<a-timeline-item color="green">Solve initial network problems 2015-09-01</a-timeline-item>
<a-timeline-item>
<template #dot><ClockCircleOutlined style="font-size: 16px" /></template>
Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto
beatae vitae dicta sunt explicabo.
</a-timeline-item>
<a-timeline-item color="red">Network problems being solved 2015-09-01</a-timeline-item>
<a-timeline-item>Create a services site 2015-09-01</a-timeline-item>
<a-timeline-item>
<template #dot><ClockCircleOutlined style="font-size: 16px" /></template>
Technical testing 2015-09-01
</a-timeline-item>
</a-timeline> -->

<!-- <div class="grid grid-cols-1 md:grid-cols-3">
<div >
  <img src="https://github-readme-stats.vercel.app/api?username=Changweihua&show_icons=true&theme=transparent" />
</div>
<div >
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=Changweihua&layout=compact&langs_count=6&text_color=000&icon_color=fff&theme=graywhite" />
</div>
<div >
  <img alt="Static Badge" src="https://img.shields.io/badge/Vue-%2342b883?style=flat-square&logo=Vue&logoColor=%23fff">
  <img alt="Static Badge" src="https://img.shields.io/badge/TypeScript-%230072b3?style=flat-square&logo=TypeScript&logoColor=%23fff">
  <img src="https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=white" />
  <img src="https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3" />
  <img alt="Static Badge" src="https://img.shields.io/badge/Webpack-%230072b3?style=flat-square&logo=webpack&logoColor=%23fff">
  <img alt="Static Badge" src="https://img.shields.io/badge/Vite-%239a60fe?style=flat-square&logo=vite&logoColor=%23fff">
  <img alt="Static Badge" src="https://img.shields.io/badge/Sass-%23c66394?style=flat-square&logo=Sass&logoColor=%23fff">
  <img alt="Static Badge" src="https://img.shields.io/badge/Visual_Studio_Code-007ACC?style=flat-square&logo=Visual-Studio-Code&logoColor=white">
  <img alt="Static Badge" src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=Git&logoColor=white">
</div>
</div> -->

<!-- <div id="g-pointer-1"></div>
<div id="g-pointer-2"></div> -->

<script setup lang="ts">
import { onMounted } from 'vue'
import { fetchVersion } from './.vitepress/utils/fetchVersion'
import { VPTeamPage,  VPTeamPageTitle,  VPTeamMembers } from 'vitepress/theme'

import { BeakerIcon } from '@heroicons/vue/24/solid'
// import { siSimpleicons } from 'simple-icons';
import * as icons from 'simple-icons';

onMounted(() => {
  const docsVersionSpan = document.querySelector(
    "div.VPHero.has-image.VPHomeHero > div > div.main > p.tagline > samp.version-tag"
  );
  if(!docsVersionSpan){
    fetchVersion()
  }
})



const members = [
  {
    avatar: '/author.jpg',
    name: '常伟华',
    title: 'Programmer',
    org: 'CMONO.NET',
    orgLink: 'https://changweihua.github.io',
    desc: '伪前端+伪后端+伪需求=真全栈',
    links: [{ icon: {
        svg: '<svg t="1691037473495" class="icon" viewBox="0 0 3786 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15871" width="128" height="128"><path d="M729.176289 438.294072H410.703618c-7.882987 0-14.977675 6.30639-14.977675 14.977675v155.294843c0 7.882987 6.30639 14.977675 14.977675 14.977675h123.762895v193.133179s-27.590454 9.459584-104.843726 9.459584c-90.654349 0-217.570439-33.108545-217.570439-312.166281s132.43418-316.107775 256.197075-316.107775c107.208622 0 153.718245 18.919169 182.885296 28.378752 9.459584 3.153195 18.13087-6.30639 18.13087-14.977675l35.473441-150.56505c0-3.941493-1.576597-8.671286-5.518091-11.82448C687.396459 40.991532 614.872979 0 430.411085 0 217.570439 0 0 90.654349 0 525.006928c0 434.352579 249.102386 498.993072 459.578137 498.993072 174.214011 0 279.846035-74.100077 279.846035-74.100077 4.729792-2.364896 4.729792-8.671286 4.729793-11.036182V453.271747c0-8.671286-7.094688-14.977675-14.977676-14.977675zM2368.837567 52.027714c0-7.882987-6.30639-14.977675-14.977675-14.977676h-178.943803c-7.882987 0-14.977675 6.30639-14.977675 14.977676v346.063125h-279.057737V52.027714c0-7.882987-6.30639-14.977675-14.977675-14.977676H1686.959199c-7.882987 0-14.977675 6.30639-14.977675 14.977676v937.287144c0 7.882987 6.30639 14.977675 14.977675 14.977675h178.943803c7.882987 0 14.977675-7.094688 14.977675-14.977675V588.070824H2159.938414l-0.788299 401.244034c0 7.882987 6.30639 14.977675 14.977676 14.977675h179.732101c7.882987 0 14.977675-7.094688 14.977675-14.977675V52.027714z" fill="#100E0F" p-id="15872"></path><path d="M1067.356428 175.002309c0-64.640493-52.027714-116.668206-115.879908-116.668206s-115.091609 52.027714-115.091609 116.668206c0 64.640493 52.027714 116.668206 115.091609 116.668207 63.852194 0 115.879908-52.027714 115.879908-116.668207zM1054.743649 791.451886V358.675905c0-7.882987-6.30639-14.977675-14.977675-14.977676h-178.943803c-7.882987 0-15.765974 8.671286-15.765974 16.554273v619.602771c0 18.13087 11.036182 23.648961 26.013857 23.648961h160.812933c17.342571 0 22.072363-8.671286 22.072363-23.648961 0.788299-33.108545 0.788299-163.177829 0.788299-188.403387z" fill="#100E0F" p-id="15873"></path><path d="M3049.139338 345.274827h-177.367206c-7.882987 0-14.977675 7.094688-14.977675 14.977675V819.830639s-44.933025 33.108545-109.573518 33.108545c-63.852194 0-81.194765-29.167052-81.194765-92.230947V360.252502c0-7.882987-6.30639-14.977675-14.977675-14.977675h-180.5204c-7.882987 0-14.977675 7.094688-14.977676 14.977675v431.199384c0 186.038491 104.055427 231.759815 246.737491 231.759815 117.456505 0 212.052348-64.640493 212.052348-64.640492s4.729792 33.896844 6.306389 37.838337c2.364896 3.941493 7.094688 7.882987 13.401078 7.882987l115.091609-0.788299c7.882987 0 14.977675-7.094688 14.977675-14.977675V359.464203c0-7.094688-6.30639-14.189376-14.977675-14.189376zM3535.51963 324.779061c-100.902232 0-169.484219 44.933025-169.484218 44.933025V52.027714c0-7.882987-6.30639-14.977675-14.977675-14.977676h-179.732102c-7.882987 0-14.977675 6.30639-14.977675 14.977676v937.287144c0 7.882987 6.30639 14.977675 14.977675 14.977675h124.551193c5.518091 0 10.247883-3.153195 12.612779-7.882987 3.153195-4.729792 7.882987-43.356428 7.882987-43.356428s73.311778 69.370285 212.840647 69.370285c163.177829 0 256.985373-82.771363 256.985373-372.076983-0.788299-288.517321-149.776751-325.56736-250.678984-325.567359z m-70.158583 527.371824c-61.487298-1.576597-103.267129-29.95535-103.267129-29.95535V525.795227s40.991532-25.225558 92.230947-29.95535c63.852194-5.518091 125.339492 13.401078 125.339492 166.331024-0.788299 160.812933-28.378753 193.133179-114.30331 189.979984zM1569.502694 343.698229h-134.010777V166.331024c0-7.094688-3.153195-10.247883-11.036182-10.247883h-182.885296c-7.094688 0-11.036182 3.153195-11.036182 10.247883v183.673595s-91.442648 22.072363-97.749038 23.648961c-6.30639 1.576597-11.036182 7.882987-11.036181 14.189376v115.091609c0 8.671286 6.30639 14.977675 14.977675 14.977675h93.807544v277.48114c0 205.745958 144.258661 226.241724 242.007698 226.241724 44.933025 0 97.749038-14.189376 106.420324-17.342571 5.518091-1.576597 8.671286-7.094688 8.671285-13.401078v-126.916089c0-7.882987-7.094688-14.977675-14.977675-14.977675-7.882987 0-27.590454 3.153195-48.874519 3.153194-66.21709 0-88.289453-30.743649-88.289453-70.158583V518.700539h134.010777c7.882987 0 14.977675-6.30639 14.977676-14.977675V358.675905c-0.788299-7.882987-7.094688-14.977675-14.977676-14.977676z" fill="#100E0F" p-id="15874"></path></svg>'
      }, link: "https://github.com/changweihua" }
    ],
    sponsor: 'sponsor'
  },
  {
    avatar: '/unfix.png',
    name: '@un-fix',
    title: 'Member',
    org: 'un-fix',
    orgLink: 'https://un-fix.github.io',
    desc: '共同改善中文世界的企业组织文化',
    sponsor: 'sponsor',
  }
]
</script>

<!-- <BeakerIcon class="h-6 w-6 text-blue-500" /> -->

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Members
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    size="small"
    :members="members"
  />
</VPTeamPage>

<!-- <a-tag>sss</a-tag> -->

<!-- ### Title <Badge type="info" text="default" />
### Title <Badge type="tip" text="^1.9.0" />
### Title <Badge type="warning" text="beta" />
### Title <Badge type="danger" text="caution" /> -->

