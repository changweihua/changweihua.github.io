import { defineConfig } from "vitepress";
import navConfig from "./configs/nav";
import { getSideBar } from 'vitepress-plugin-autobar';

import {
  containerPreview,
  componentPreview,
} from "@vitepress-demo-preview/plugin";

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
  appearance: false, // 默认 true，设为 false 则无法切换dark/light主题，可选 'dark' true false
  themeConfig: {
    logo: "/logo.png",
    // https://vitepress.dev/reference/default-theme-config
    nav: navConfig,

    lastUpdatedText: "更新时间",
    siteTitle: "CMONO.NET",
    outline: "deep",
    outlineTitle: "大纲",

    sidebar: {
      articles: [
        {
          text: "Examples",
          items: [
            { text: "Markdown Examples", link: "/markdown-examples" },
            { text: "Runtime API Examples", link: "/api-examples" },
          ],
        },
      ],
      cases: [
        {
          text: "项目案例",
          items: [
            { text: "苏南硕放国际机场阳光服务平台", link: "/cases/sunny-land" },
            { text: "扬泰机场智慧出行微信小程序", link: "/api-examples" },
            {
              text: "上海民航华东凯亚江苏分公司疫情防控平台",
              link: "/api-examples",
            },
            { text: "苏南硕放国际机场安检效能分析系统", link: "/api-examples" },
            {
              text: "苏南硕放国际机场进出港/无纸化系统",
              link: "/api-examples",
            },
            { text: "扬泰机场客源地分析系统", link: "/api-examples" },
          ],
        },
      ],
      // blog: getSideBar("./blog"),
      blog: [
        {
          text: "2023-06",
          items: [
            { text: "VitePress & Github 个人主页", link: "/blog/2023-06/16" },
            { text: "VitePress & Github 个人主页3", link: "/blog/2023-06/16" },
          ],
        },
        {
          text: "2023-05",
          items: [
            { text: "VitePress & Github 个人主页2", link: "/blog/2023-06/16" },
          ],
        },
        {
          text: "2022",
          items: [
            { text: "从 Docker 安装 Gitea", link: "/blog/2022/从 Docker 安装 Gitea.md" },
            { text: "敏捷开发学习笔记", link: "/blog/2022/敏捷开发学习笔记.md" },
            { text: "私有nuget服务器部署", link: "/blog/2022/私有nuget服务器部署.md" },

            { text: "为docker配置HTTP代理服务器", link: "/blog/2022/为docker配置HTTP代理服务器.md" },
            { text: "私有nuget服务器部署", link: "/blog/2022/私有nuget服务器部署.md" },
            { text: "正向代理和反向代理", link: "/blog/2022/正向代理和反向代理.md" },
            { text: "正向代理和反向代理详解", link: "/blog/2022/正向代理和反向代理详解.md" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/changweihua" },
      {
        icon: {
          svg: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1686883985076" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1904" xmlns:xlink="http://www.w3.org/1999/xlink" width="128" height="128"><path d="M853.333333 128a42.666667 42.666667 0 0 1 42.666667 42.666667v682.666666a42.666667 42.666667 0 0 1-42.666667 42.666667H170.666667a42.666667 42.666667 0 0 1-42.666667-42.666667V170.666667a42.666667 42.666667 0 0 1 42.666667-42.666667h682.666666z m-42.666666 85.333333H213.333333v597.333334h597.333334V213.333333z m-85.333334 85.333334v426.666666h-106.666666V405.333333H512V725.333333H298.666667V298.666667h426.666666z" p-id="1905"></path></svg>',
        },
        link: "https://www.npmjs.com/~changweihua",
      },
    ],

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    search: {
      // vitepress 内置 search
      provider: "local",
    },

    // algolia: { // algolia 搜索服务 与 内置 search 可二选一
    //   appId: 'LPTNA0E8HM',
    //   apiKey: '8f1b68dfab6b0320adef728a1c3a77cc',
    //   indexName: 'themusecatcher_front-end'
    // },

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

  // plugins: [
  //   "@vuepress/active-header-links", // 页面滚动时自动激活侧边栏链接的插件
  //   "@vuepress/back-to-top", // 返回顶部插件
  //   "@vuepress/medium-zoom", // 图片预览插件
  //   "@vuepress/nprogress", //页面顶部进度条
  // ],

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
    ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
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

  markdown: {
    config: (md) => {
      md.use(containerPreview);
      md.use(componentPreview);

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
    },
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
