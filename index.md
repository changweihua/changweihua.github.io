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
    # - theme: alt
    #   text: 项目案例
    #   link: /gallery/

features:
  - title: 阳光服务平台解决方案
    icon:
      src: /air_wux.png
      alt: 网页的logo图标
    details: 依托微信小程序，为苏南硕放国际机场量身打造阳光服务平台
    link: /gallery/sunny-land
    linkText: 更多详情
  - title: 扬泰机场智慧出行小程序
    icon:
      src: /yty_logo.png
      alt: 网页的logo图标
    details: 为扬泰机场旅客提供航班动态查询、在线值机、停车场收费标准等自助服务
    link: /gallery/airyty
  - title: 疫情防控平台
    icon:
      src: /favicon.svg
      alt: 网页的logo图标
    details: 疫情期间，为满足公司疫情防控需求，应运而生。
    link: /gallery/epcp
  - title: 苏南硕放国际机场微信小程序
    details: 苏南硕放国际机场旅客服务平台前端载体。
    link: /gallery/airwux
  - title: 基于K8S平台的持续交付平台
    details: 研发技改产物，促进开发流程规范化及自动化运维。
    link: /gallery/giteaops
  - title: 苏南硕放国际机场安检效能分析系统
    details: 助力安检效能分析
    link: /gallery/SCPEA
  - title: 进出港旅客查询和无纸化系统项目
    details: Pre-configured Rollup build with multi-page and library mode support.
  - title: 扬州泰州国际机场客源地分析系统
    details: Rollup-superset plugin interface shared between dev and build.
  - title: 苏南硕放国际机场生产统计系统
    details: Flexible programmatic APIs with full TypeScript typing.

head:
  - - meta
    - name: description
      content: hello
  - - meta
    - name: keywords
      content: super duper SEO

---

<!-- <img :src="$withBase('/logo.png')" alt="logo" /> -->

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
