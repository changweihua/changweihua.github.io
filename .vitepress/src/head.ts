import type { HeadConfig } from "vitepress";

export const head: HeadConfig[] = [
  // [
  //     'link',
  //     { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
  //     // would render:
  //     //
  //     // <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  //   ],

  //   [
  //     'script',
  //     { id: 'register-sw' },
  //     `;(() => {
  //       if ('serviceWorker' in navigator) {
  //         navigator.serviceWorker.register('/sw.js')
  //       }
  //     })()`
  //     // would render:
  //     //
  //     // <script id="register-sw">
  //     // ;(() => {
  //     //   if ('serviceWorker' in navigator) {
  //     //     navigator.serviceWorker.register('/sw.js')
  //     //   }
  //     // })()
  //     // </script>
  //   ]
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
    "meta", {
      name: "keywords",
      content: "CMONO.NET,changweihua,常伟华,Lance,changweihua.github.io,Vite,VitePress,AntDesign",
    },],
  ["meta",
    {
      name: "description",
      content: "CMONO.NET 官方站点，主要记录平时工作总结及项目经历",
    },],
    ["meta",
    {
      bar: "custom meta",
    },],
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
