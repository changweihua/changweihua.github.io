---
layout: home
layoutClass: m-nav-layout
pageClass: index-page-class
title: CMONO.NET
titleTemplate: Home Page

description: CMONO.NET Official Page Site


hero:
  name: "Lance Chang"
  text: "DOTNET Developer"
  tagline: Hahaha
  image:
    src: /cwh.svg
    alt: 网页的logo图标
  actions:
    - theme: brand
      text: Resume
      link: /en-US/resume
    - theme: alt
      text: About
      link: /en-US/about
    # - theme: alt
    #   text: Github
    #   link: https://github.com/changweihua

features:
  - title: YTY AI Robot
    icon:
      src: /ai_robot.svg
      alt: 扬泰机场智能机器人
    details: 扬泰机场智能机器人，用于旅客自助查询航班等相关出行信息
    link: /zh-CN/gallery/robot
  - title: Luggage Measurement
    icon:
      src: /baggage.svg
      alt: 随身携带行李限额自助查询
    details: 随身携带行李限额自助查询，用于旅客自助核验随身行李是否为三超行李
    link: /zh-CN/gallery/baggage_measurer
  - title: Sunny Service Platform
    icon:
      src: /sunnyland.svg
      alt: 阳光服务平台
    details: 依托微信小程序，为无锡硕放机场量身打造阳光服务平台
    link: /zh-CN/gallery/sunny-land
    linkText: 更多详情
  - title: WUX Passenger Service Platform
    icon:
      src: /air_wux.png
      alt: 无锡硕放机场旅客服务平台
    details: 为机场提供了数字化赋能，解决了服务能力与旅客需求难匹配的运营痛点，助力旅客便捷出行。
    link: /zh-CN/gallery/airwux
  - title: Maui Hybird
    icon:
      src: /microapp.svg
      alt: Maui Hybird 架构
    details: Hybird based on Maui。
    link: /zh-CN/gallery/web_app
  - title: CI/DI on K8S
    icon:
      src: /giteaops.png
      alt: 基于K8S平台的持续交付平台
    details: 研发技改产物，促进开发流程规范化及自动化运维。通过Docker统一开发、测试和生产的环境，同时完成系统版本自动发布，提升自动化。
    link: /zh-CN/gallery/giteaops
  - title: Wise Platform
    icon:
      src: /H5.svg
      alt: H5微应用平台
    details: H5微应用平台。
    link: /zh-CN/gallery/maui
  - title: Electron 桌面跨平台
    icon:
      src: /icon_electron.svg
      alt: Electron Desktop App
    details: Electron 桌面跨平台
    link: /zh-CN/gallery/electron_app
  - title: microAPP based on iframe
    icon:
      src: /iframe2.svg
      alt: iframe微前端
    details: iframe微前端。
    link: /zh-CN/gallery/iframe_microapp
  - title: maui-jsbridge
    details: iframe communication support
    link: https://www.npmjs.com/package/maui-jsbridge
  - title: wx-navigation-bar
    details: custom background narbar for wechat miniprogram
    link: /zh-CN/gallery/wx-navigation-bar
  - title: wx-lifecycle-interceptor
    details: support to manage wechat miniprogram lifecycle
    link: https://www.npmjs.com/package/wx-lifecycle-interceptor

head:
  - - meta
    - name: keywords
      content: changweihua.github.io 首页 CMONO.NET

importMap: {
  "plotty": "https://esm.sh/plotty",
  "geotiff": "https://esm.sh/geotiff@2.1.3",
}
---
