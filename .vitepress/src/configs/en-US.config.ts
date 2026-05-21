import type { DefaultTheme, LocaleSpecificConfig } from "vitepress";

//引入以上配置 是英文界面需要修改zh为en
import { getEnUSNav } from "../navs";
import { getEnUSSidebar } from "../sidebars";

import dayjs from '../../hooks/useDayjs'

export const enConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  description: "CMONO.NET HomePage",
  title: "CMONO.NET",
  lang: "en-US",
  themeConfig: {
    // 导航上的logo
    logo: "/logo.png",
    // 隐藏logo右边的标题
    siteTitle: false,
    lastUpdatedText: "Last Updated",
    returnToTopLabel: "TOP",
    // 文档页脚文本配置
    docFooter: {
      prev: "Prev",
      next: "Next",
    },
    footer: {
      message: "MIT Licensed",
      copyright: `Copyright © 2009-${dayjs().year()} CMONO.NET`,
    },
    //   editLink: {
    //     pattern: '路径地址',
    //     text: '对本页提出修改建议',
    //   },
    nav: getEnUSNav(),
    sidebar: getEnUSSidebar(),
    outline: {
      level: "deep", // 右侧大纲标题层级
      label: "目录", // 右侧大纲标题文本配置
    },
  },
};
