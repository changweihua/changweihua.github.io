import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "常伟华",
  // 国际化相关
  // locales:{
  //   '/zh-CN/': {
  //     lang: 'zh-CN',
  //     title: 'Vuetom 主题',
  //     description: '为 Vitepress 提供的一款主题'
  //   },
  //   '/en-US/': {
  //     lang: 'en-US',
  //     title: 'Vuetom Theme',
  //     description: 'Theme For Vitepress'
  //   }
  // },
  description: "个人在线",
  themeConfig: {
    logo: "/logo.png",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "首页", link: "/" },
      { text: "案例", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/changweihua" },
    ],

    footer: {
      message: "CMONO.ENT",
      copyright: "Copyright © 2009-2023 CMONO.NET",
    },

    // lastUpdated: 'Last Updated', // string | boolean

    // locales: {
    //   '/': {
    //     selectText: 'Languages',
    //     label: 'English',
    //     ariaLabel: 'Languages',
    //     editLinkText: 'Edit this page on GitHub',
    //     serviceWorker: {
    //       updatePopup: {
    //         message: "New content is available.",
    //         buttonText: "Refresh"
    //       }
    //     },
    //     algolia: {},
    //     nav: [
    //       { text: 'Nested', link: '/nested/', ariaLabel: 'Nested' }
    //     ],
    //     sidebar: {
    //       '/': [/* ... */],
    //       '/nested/': [/* ... */]
    //     }
    //   },
    //   '/zh/': {
    //     // 多语言下拉菜单的标题
    //     selectText: '选择语言',
    //     // 该语言在下拉菜单中的标签
    //     label: '简体中文',
    //     // 编辑链接文字
    //     editLinkText: '在 GitHub 上编辑此页',
    //     // Service Worker 的配置
    //     serviceWorker: {
    //       updatePopup: {
    //         message: "发现新内容可用.",
    //         buttonText: "刷新"
    //       }
    //     },
    //     // 当前 locale 的 algolia docsearch 选项
    //     algolia: {},
    //     nav: [
    //       { text: '嵌套', link: '/zh/nested/' }
    //     ],
    //     sidebar: {
    //       '/zh/': [/* ... */],
    //       '/zh/nested/': [/* ... */]
    //     }
    //   }
    // }
  },

  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig:{
      }
    },
    en: {
      label: '英文',
      lang: 'en-US', // optional, will be added  as `lang` attribute on `html` tag
      link: '/en/', // default /fr/ -- shows on navbar translations menu, can be external
      themeConfig:{
        siteTitle:'Lance Chang',
        nav: [
          { text: "Home", link: "/" },
          { text: "Gallary", link: "/markdown-examples" },
        ],
      }

      // other locale specific properties...
    }
  },

  head: [["link", { rel: "icon", href: "/favicon.svg" }]],
});
