import { defineConfig } from "vitepress";
import navConfig from "./configs/nav";

import { containerPreview, componentPreview } from '@vitepress-demo-preview/plugin'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CMONO.NET",
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
    nav: navConfig,

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/changweihua" }],

    footer: {
      message: "MIT Licensed",
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
      label: "中文",
      lang: "zh-CN",
      themeConfig: {},
    },
    en: {
      label: "英文",
      lang: "en-US", // optional, will be added  as `lang` attribute on `html` tag
      link: "/en/", // default /fr/ -- shows on navbar translations menu, can be external
      themeConfig: {
        siteTitle: "Lance Chang",
        nav: [
          { text: "Home", link: "/" },
          { text: "Gallary", link: "/markdown-examples" },
        ],
      },

      // other locale specific properties...
    },
  },

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  ],

  markdown: {
    config: (md) => {
      md.use(containerPreview)
      md.use(componentPreview)

      // md.use(demoBlockPlugin, {
      //   cssPreprocessor: 'less',
      //   customStyleTagName: 'style lang="less"', // style标签会解析为<style lang="less"><style>
      //   scriptImports: ["import * as Antd from 'ant-design-vue'"],
      //   scriptReplaces: [
      //     { searchValue: /const ({ defineComponent as _defineComponent }) = Vue/g,
      //       replaceValue: 'const { defineComponent: _defineComponent } = Vue'
      //     },
      //     { searchValue: /import ({.*}) from 'ant-design-vue'/g,
      //       replaceValue: (s, s1) => `const ${s1} = Antd`
      //     }
      //   ]
      // })
    }
  },

  // markdown: {
  //   anchor: { permalink: false },
  //   toc: { includeLevel: [1, 2] },
  //   config: (md) => {
  //     const { demoBlockPlugin } = require('vitepress-theme-demoblock')
  //     md.use(demoBlockPlugin);
  //   }
  // }
});
