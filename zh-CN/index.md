---
# https://vitepress.dev/reference/default-theme-home-page
layout: home
layoutClass: m-nav-layout
pageClass: index-page-class
title: CMONO.NET
titleTemplate: 首页

description: CMONO.NET Official Page Site

hero:
  name: "常伟华"
  text: "DOTNET Developer"
  tagline: 阳光大男孩
  image:
    src: /cwh.svg
    alt: 网页的logo图标
  actions:
    - theme: brand
      text: 作者简历
      link: /zh-CN/resume
    - theme: alt
      text: 我的2025
      link: /zh-CN/me.2025
    # - theme: alt
    #   text: Github
    #   link: https://github.com/changweihua

features:
  - title: 扬泰机场智能机器人
    icon:
      src: /ai_robot.svg
      alt: 扬泰机场智能机器人
    details: 扬泰机场智能机器人，用于旅客自助查询航班等相关出现信息
    link: /zh-CN/gallery/robot
  - title: 随身携带行李限额自助查询
    icon:
      src: /baggage.svg
      alt: 随身携带行李限额自助查询
    details: 随身携带行李限额自助查询，用于旅客自助核验随身行李是否为三超行李
    link: /zh-CN/gallery/baggage_measurer
  - title: 阳光服务平台
    icon:
      src: /sunnyland.svg
      alt: 阳光服务平台
    details: 依托微信小程序，为无锡硕放机场量身打造阳光服务平台
    link: /zh-CN/gallery/sunny-land
    # linkText: 更多详情
  - title: 无锡硕放机场旅客服务平台
    icon:
      src: /air_wux.png
      alt: 无锡硕放机场旅客服务平台
    details: 为机场提供了数字化赋能，解决了服务能力与旅客需求难匹配的运营痛点，助力旅客便捷出行。
    link: /zh-CN/gallery/airwux
  # - title: 基于Yolo的对象检测、识别与研究
  #   icon:
  #     src: /yolo.svg
  #     alt: Yolo
  #   details: 支持Yolo8、9、10三大版本
  #   link: /zh-CN/gallery/yolo_object_dection
    # linkText: 更多详情
  # - title: Yuppie 平台
  #   icon:
  #     src: /yuppie.svg
  #     alt: Yuppie 平台，包含 WEB、MOBILE 双端应用及管理程序
  #   details: 项目积累，实现即开箱即投产的标准化平台
  #   link: /zh-CN/gallery/yuppie
  - title: Maui Hybird
    icon:
      src: /microapp.svg
      alt: Maui Hybird 架构
    details: 基于 Maui 的 Hybird 框架。
    link: /zh-CN/gallery/web_app
  - title: 基于K8S平台的持续交付平台
    icon:
      src: /giteaops.png
      alt: 基于K8S平台的持续交付平台
    details: 研发技改产物，促进开发流程规范化及自动化运维。通过Docker统一开发、测试和生产的环境，同时完成系统版本自动发布，提升自动化。
    link: /zh-CN/gallery/giteaops
  - title: 新生产统计APP
    icon:
      src: /H5.svg
      alt: H5微应用平台
    details: H5微应用平台。
    link: /zh-CN/gallery/maui
  - title: Electron 桌面跨平台
    icon:
      src: /icon_electron.svg
      alt: Electron 桌面跨平台
    details: Electron 桌面跨平台
    link: /zh-CN/gallery/electron_app
  - title: iframe微前端
    icon:
      src: /iframe2.svg
      alt: iframe微前端
    details: iframe微前端。
    link: /zh-CN/gallery/iframe_microapp
  - title: maui-jsbridge
    details: 页面iFrame嵌套通信。
    link: https://www.npmjs.com/package/maui-jsbridge
  - title: wx-navigation-bar
    details: 小程序自定义导航栏NPM包。以此实现顶部图片背景效果。
    link: /zh-CN/gallery/wx-navigation-bar
  - title: wx-lifecycle-interceptor
    details: 小程序生命周期方法拦截器NPM包。Fork 后适配最新版微信组件生命周期。
    link: https://www.npmjs.com/package/wx-lifecycle-interceptor
  # - title: antdv-plus-table
  #   details: Ant Design Vue Table 扩展NPM包。
  #   link: https://www.npmjs.com/package/@changweihua/antdv-plus-table
  # - title: 3D孪生数字机场
  #   icon:
  #     src: /images/airport.png
  #     alt: 3D孪生数字机场
  #   details: 3D孪生数字机场简易演示版
  #   link: /gallery/digital_airport
  # - title: 疫情防控平台
  #   details: 疫情期间，为满足公司疫情防控需求，开发上线本系统。特色功能包含基于百度Paddle实现健康码和行程码信息自动提取和预警，支持人脸识别登录。
  #   link: /gallery/epcp
  # - title: 无锡硕放机场安检效能分析系统
  #   details: 通过数字化大屏，图形化报表，动态化效果，助力安检数据展示及效能分析。
  #   link: /zh-CN/gallery/SCPEA
  # - title: 进出港旅客查询和无纸化系统项目
  #   details: 为安检部门提供今日的所有起降航班乘机人数。
  # - title: 扬州泰州国际机场智慧出行小程序
  #   details: 扬州泰州国际机场智慧出行小程序
  #  link: /zh-CN/gallery/airyty
  # - title: 无锡硕放机场生产统计系统
  #   details: 整个机场运行生产统计数据。

head:
  - - meta
    - name: keywords
      content: changweihua.github.io 首页 CMONO.NET
---

- [ ] 未完成任务
- [x] 已完成任务

<GalleryCard title="标题" />

<CubesLoader  />


<!-- <Confetti /> -->

::: raw
Wraps in a <span class="vp-raw"></span>
:::
<!-- <Guidance :steps="[{element: '.VPHomeHero'}]" /> -->
