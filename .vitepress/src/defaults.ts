import { DefaultTheme, UserConfig } from "vitepress";
import { markdown } from "./markdown";

const defaultConfig: UserConfig<DefaultTheme.Config> = {
  title: "CMONO.NET",
  description: "个人在线",
  appearance: true,
  head: [
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
    [
      "meta",
      { name: "keywords", content: "react react-admin ant 后台管理系统" },
    ],
    [
      "meta",
      {
        name: "description",
        content:
          "此框架使用与二次开发，前端框架使用react，UI框架使用ant-design，全局数据状态管理使用redux，ajax使用库为axios。用于快速搭建中后台页面。",
      },
    ],
  ],
  markdown,
  ignoreDeadLinks: [
    // ignore exact url "/playground"
    "/playground",
    // ignore all localhost links
    /^https?:\/\/localhost/,
    // ignore all links include "/repl/""
    /\/repl\//,
    // custom function, ignore all links include "ignore"
    (url) => {
      return url.toLowerCase().includes("ignore");
    },
  ],
};

export { defaultConfig };
