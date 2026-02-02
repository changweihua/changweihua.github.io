import type { HeadConfig } from 'vitepress'

export const head: HeadConfig[] = [
  [
    'meta',
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
    },
  ],
  ['meta', { name: 'mobile-web-app-capable', content: 'yes' }],
  ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
  ['meta', { name: 'application-name', content: 'CMONO.NET' }],
  ['meta', { name: 'apple-touch-icon-precomposed', content: '/favicon.svg' }],
  ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: 'any' }],
  ['link', { rel: 'apple-touch-icon', href: '/favicon.svg', sizes: '180x180' }],
  [
    'link',
    {
      rel: 'stylesheet',
      href: '/Mermaid.css',
    },
  ],
  // MathJax 配置应该在 <script> 标签中，不是在插件里
  // [
  //   'script',
  //   {},
  //   `
  //     window.MathJax = {
  //       tex: {
  //         inlineMath: [['$', '$'], ['\\(', '\\)']],
  //         displayMath: [['$$', '$$'], ['\\[', '\\]']],
  //         processEscapes: true,
  //         packages: ['base', 'ams', 'noerrors', 'noundefined']
  //       },
  //       options: {
  //         skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
  //       }
  //     };
  //   `,
  // ],
  // [
  //   'script',
  //   {
  //     src: '/mathjax/tex-chtml.js',
  //     async: 'true',
  //     defer: 'true',
  //   },
  // ],
  [
    'script',
    {
      src: 'https://cdn.jsdmirror.com/npm/mathjax@4/tex-mml-chtml.js',
      async: 'true',
    },
  ],
  // 一些自定义样式
  [
    'style',
    {},
    `
      /* 数学公式样式 */
      .math {
        overflow-x: auto;
        overflow-y: hidden;
      }

      mjx-container {
        outline: none;
      }

      /* 确保公式在移动设备上可滚动 */
      @media (max-width: 768px) {
        mjx-container[jax="CHTML"] {
          overflow-x: auto;
          overflow-y: hidden;
          max-width: 100%;
        }
      }
    `,
  ],
  ['meta', { name: 'referrer', content: 'no-referrer' }],
  [
    'meta',
    {
      name: 'keywords',
      content: 'CMONO.NET,changweihua,常伟华,Lance,changweihua.github.io,Vite,VitePress,AntDesign',
    },
  ],
  [
    'meta',
    {
      name: 'description',
      content: 'CMONO.NET 官方站点，主要记录平时工作总结及项目经历',
    },
  ],
  [
    'meta',
    {
      name: 'color-scheme',
      content: 'light dark',
    },
  ],
  [
    'meta',
    {
      name: 'theme-color',
      content: '#ffffff',
      media: '(prefers-color-scheme: light)',
    },
  ],
  [
    'meta',
    {
      name: 'theme-color',
      content: '#1e1e1e',
      media: '(prefers-color-scheme: dark)',
    },
  ],
  [
    'meta',
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'default',
      media: '(prefers-color-scheme: light)',
    },
  ],
  [
    'meta',
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
      media: '(prefers-color-scheme: dark)',
    },
  ],
  // [
  //   "script",
  //   {
  //     src: "/cursor.js",
  //     "data-site": "https://changweihua.github.io",
  //     "data-spa": "auto",
  //     defer: "true",
  //   },
  // ],
  // [
  //   "script",
  //   {
  //     src: "/liquid-glass.js",
  //     defer: "true",
  //   },
  // ],
  // [
  //   "script",
  //   {
  //     src: "/gradient.js",
  //     "data-site": "https://changweihua.github.io",
  //     "data-spa": "auto",
  //     defer: "true",
  //   },
  // ],
  [
    'script',
    {
      src: 'https://hm.baidu.com/hm.js?9bdcf6f2112634d13223ef73de6fe9fa',
      'data-site': 'https://changweihua.github.io',
      'data-spa': 'auto',
      defer: 'true',
    },
  ],
  // [
  //   'script',
  //   {

  //   },
  //   `
  //     window._hmt = window._hmt || [];
  //     (function() {
  //       var hm = document.createElement("script");
  //       hm.src = "https://hm.baidu.com/hm.js?9bdcf6f2112634d13223ef73de6fe9fa";
  //       // hm.script.async = true;
  //       var s = document.getElementsByTagName("script")[0];
  //       s.parentNode.insertBefore(hm, s);
  //     })();
  //     `,
  // ],
  // 设置 描述 和 关键词
  ['meta', { name: 'author', content: 'Lance Chang' }],
  [
    'meta',
    {
      name: 'keywords',
      content: 'changweihua 常伟华 vitepress cmono.net changweihua.github.io 个人网站',
    },
  ],
  [
    'meta',
    {
      name: 'description',
      content:
        '此系统基于vitepress二次开发，前端框架使用vuejs，UI框架使用ant-design，全局数据状态管理使用paina，ajax使用库为fetch。用于快速搭建个人网站和内容管理平台。',
    },
  ],
]
