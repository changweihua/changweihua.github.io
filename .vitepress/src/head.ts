import type { HeadConfig } from "vitepress";

export const head: HeadConfig[] = [
  ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  // [
  //   "link",
  //   {
  //     rel: "stylesheet",
  //     href: "/fancybox.css",
  //   },
  // ],
  // [
  //   "script",
  //   {
  //     src: "/fancybox.umd.js",
  //   },
  // ],
  [
    "script",
    {
      src: "/cursor.js",
      "data-site": "https://changweihua.github.io",
      "data-spa": "auto",
      defer: "",
    },
  ],
  // 设置 描述 和 关键词
  [
    "meta",
    {
      name: "keywords",
      content:
        "changweihua 常伟华 vitepress cmono.net changweihua.github.io 个人网站",
    },
  ],
  [
    "meta",
    {
      name: "description",
      content:
        "此系统基于vitepress二次开发，前端框架使用vuejs，UI框架使用ant-design，全局数据状态管理使用paina，ajax使用库为fetch。用于快速搭建个人网站和内容管理平台。",
    },
  ],
];