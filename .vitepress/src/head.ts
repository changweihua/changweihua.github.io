import type { HeadConfig } from "vitepress";

export const head: HeadConfig[] = [
  ['meta', { name: 'theme-color', content: '#ffffff' }],
  // ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico", sizes: 'any' }],
  // ['link', { rel: 'mask-icon', href: '/favicon.svg', color: '#ffffff' }],
  // ['link', { rel: 'apple-touch-icon', href: '/favicon.svg', sizes: '180x180' }],
  [
    "link",
    {
      rel: "stylesheet",
      href: "/font.css",
    },
  ],
  ["meta", { name: "referrer", content: "no-referrer" }],
  [
    "script",
    {
      src: "/clarity.js",
    },
  ],
  [
    "script",
    {
      src: "/cursor.js",
      "data-site": "https://changweihua.github.io",
      "data-spa": "auto",
      defer: "",
    },
  ],
  [
    'script',
    {},
    `
      window._hmt = window._hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?9bdcf6f2112634d13223ef73de6fe9fa";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();
      `,
  ],
  // 设置 描述 和 关键词
  ['meta', { name: 'author', content: 'Lance Chang' }],
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
