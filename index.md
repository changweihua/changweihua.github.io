---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

title: CMONO.NET
titleTemplate: 首页

hero:
  name: "常伟华"
  text: "DOTNET Developer"
  tagline: 阳光大男孩
  image:
    src: /logo.png
    alt: 网页的logo图标
  actions:
    - theme: brand
      text: 我的简历
      link: /about/resume
    - theme: alt
      text: 项目案例
      link: /api-examples

features:
  - title: 阳光服务平台解决方案
    icon:
      src: /air_wux.png
      alt: 网页的logo图标
    details: 依托微信小程序，为苏南硕放国际机场量身打造阳光服务平台
    link: /cases/sunny-land
    linkText: 更多详情
  - title: 扬泰机场智慧出行小程序
    icon:
      src: /yty_logo.png
      alt: 网页的logo图标
    details: 为扬泰机场旅客提供航班动态查询、在线值机、停车场收费标准等自助服务
    link: /api-examples
  - title: 疫情防控平台
    icon:
      src: /favicon.svg
      alt: 网页的logo图标
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
    link: /api-examples
  - title: 💡 Instant Server Start
    details: On demand file serving over native ESM, no bundling required!
  - title: ⚡️ Lightning Fast HMR
    details: Hot Module Replacement (HMR) that stays fast regardless of app size.
  - title: 🛠️ Rich Features
    details: Out-of-the-box support for TypeScript, JSX, CSS and more.
  - title: 📦 Optimized Build
    details: Pre-configured Rollup build with multi-page and library mode support.
  - title: 🔩 Universal Plugins
    details: Rollup-superset plugin interface shared between dev and build.
  - title: 🔑 Fully Typed APIs
    details: Flexible programmatic APIs with full TypeScript typing.

head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: super duper SEO

footer: MIT Licensed | Copyright © 2019-present Evan You
---

<script setup lang="ts">
import { onMounted } from 'vue'
import { fetchVersion } from './.vitepress/utils/fetchVersion'
import { VPTeamPage,  VPTeamPageTitle,  VPTeamMembers } from 'vitepress/theme'

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
    avatar: '/logo.png',
    name: '常伟华',
    title: 'Owner'
  }
]
</script>
<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Team members
    </template>
    <template #lead>
      Github
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    size="small"
    :members="members"
  />
</VPTeamPage>
