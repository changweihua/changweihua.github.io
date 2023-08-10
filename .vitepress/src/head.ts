import type { HeadConfig } from "vitepress";

export const head: HeadConfig[] = [
  ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  [
    "link",
    {
      rel: "stylesheet",
      href: "/fancybox.css",
    },
  ],
  [
    "script",
    {
      src: "/fancybox.umd.js",
    },
  ],
  // 设置 描述 和 关键词
  ["meta", { name: "keywords", content: "react react-admin ant 后台管理系统" }],
  [
    "meta",
    {
      name: "description",
      content:
        "此框架使用与二次开发，前端框架使用react，UI框架使用ant-design，全局数据状态管理使用redux，ajax使用库为axios。用于快速搭建中后台页面。",
    },
  ],
];
