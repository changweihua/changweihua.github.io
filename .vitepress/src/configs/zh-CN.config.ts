import type { DefaultTheme, LocaleSpecificConfig } from "vitepress";

//引入以上配置 是英文界面需要修改zh为en
import { getZhCNNav } from "../navs";
import { getZhCNSidebar } from "../sidebars";

export const zhConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  description: "CMONO.NET 之家",
  title: "CMONO.NET",
  lang: "zh-CN",
  themeConfig: {
    logo: "/logo.png",
    lastUpdatedText: "上次更新",
    returnToTopLabel: "返回顶部",
    // 文档页脚文本配置
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    footer: {
      message: "MIT Licensed",
      copyright: "Copyright © 2009-2023 CMONO.NET",
    },
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