import type { DefaultTheme, LocaleSpecificConfig } from "vitepress";

//引入以上配置 是英文界面需要修改zh为en
import { getZhCNNav } from "../navs";
import { getZhCNSidebar } from "../sidebars";
import { getZhCNFooter } from "../footers"

import dayjs from 'dayjs'

export const zhConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  description: "CMONO.NET 之家",
  title: "CMONO.NET",
  lang: "zh-CN",
  themeConfig: {
    // 导航上的logo
    logo: "/logo.png",
    // 隐藏logo右边的标题
    siteTitle: false,//'CMONO.NET',
    lastUpdatedText: "上次更新",
    returnToTopLabel: "返回顶部",
    skipToContentLabel: "返回正文",
    // 文档页脚文本配置
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    footer: getZhCNFooter(),
    //   editLink: {
    //     pattern: '路径地址',
    //     text: '对本页提出修改建议',
    //   },
    nav: getZhCNNav(),
    sidebar: getZhCNSidebar(),
    outline: {
      level: "deep", // 右侧大纲标题层级
      label: "目录", // 右侧大纲标题文本配置
    },
  },
};
