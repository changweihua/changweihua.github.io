---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

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
      link: /resume
    - theme: alt
      text: 项目案例
      link: /api-examples

features:

  - title: 阳光服务平台解决方案
    icon:
      src: /air_wux.png
      alt: 网页的logo图标
    details: 依托微信小程序，为苏南硕放国际机场量身打造阳光服务平台
    link: /sunny-land
    linkText: 更多详情
  - title: 扬泰机场智慧出行小程序
    icon:
      src: /yty_logo.png
      alt: 网页的logo图标
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
    link: /api-examples
  - title: 疫情防控平台
    icon:
      src: /favicon.svg
      alt: 网页的logo图标
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
    link: /api-examples
---

<script setup>
import { VPTeamPage,  VPTeamPageTitle,  VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: '/logo.png',
    name: '常伟华',
    title: '负责人'
  }
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      开发人员
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