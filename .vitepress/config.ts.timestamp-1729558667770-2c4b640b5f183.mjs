// .vitepress/src/theme.ts
var themeConfig = {
  editLink: {
    pattern: "https://github.com/changweihua/changweihua.github.io/edit/master//:path",
    text: "Edit this page on GitHub"
  },
  // 自定义上次更新的文本和日期格式
  lastUpdated: {
    text: "\u4E0A\u6B21\u66F4\u65B0\uFF1A",
    formatOptions: {
      dateStyle: "full",
      timeStyle: "medium"
    }
  },
  // titleTemplate: ':title - Custom Suffix',
  logo: "/logo.png",
  darkModeSwitchLabel: "\u5207\u6362\u4E3B\u9898",
  lightModeSwitchTitle: "\u6D45\u8272",
  darkModeSwitchTitle: "\u6DF1\u8272",
  returnToTopLabel: "\u8FD4\u56DE\u9876\u90E8",
  langMenuLabel: "\u9009\u62E9\u8BED\u8A00",
  externalLinkIcon: true,
  socialLinks: [
    {
      icon: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="0.99em" height="1em" viewBox="0 0 256 259.3"><path fill="#9edcf2" d="M200.9 199.8c0 13.9-32.2 25.1-71.9 25.1s-71.9-11.3-71.9-25.1c0-13.9 32.2-25.1 71.9-25.1s71.9 11.2 71.9 25.1m0 0"/><defs><path id="logosGithubOctocat0" d="M98.1 244.8c1.6 7.5 5.5 11.9 9.4 14.5h41.1c5-3.4 10.1-9.8 10.1-21.8v-31s.6-7.7 7.7-10.2c0 0 4.1-2.9-.3-4.5c0 0-19.5-1.6-19.5 14.4v23.6s.8 8.7-3.8 12.3v-29.2s.3-9.3 5.1-12.8c0 0 3.2-5.7-3.8-4.2c0 0-13.4 1.9-14 17.6l-.3 30h-3.2l-.3-30c-.6-15.6-14-17.6-14-17.6c-7-1.6-3.8 4.2-3.8 4.2c4.8 3.5 5.1 12.8 5.1 12.8v29.5c-4.6-3.3-3.8-12.6-3.8-12.6v-23.6c0-16-19.5-14.4-19.5-14.4c-4.5 1.6-.3 4.5-.3 4.5c7 2.6 7.7 10.2 7.7 10.2v21.7z"/></defs><clipPath id="logosGithubOctocat1"><use href="#logosGithubOctocat0"/></clipPath><path fill="#7dbce7" d="M200.9 199.8c0 13.9-32.2 25.1-71.9 25.1s-71.9-11.3-71.9-25.1c0-13.9 32.2-25.1 71.9-25.1s71.9 11.2 71.9 25.1m0 0" clip-path="url(#logosGithubOctocat1)"/><path fill="#9edcf2" d="m46.9 125.9l-2.1 7.2s-.5 2.6 1.9 3.1c2.6-.1 2.4-2.5 2.2-3.2zm0 0"/><path fill="#010101" d="m255.8 95.6l.2-.9c-21.1-4.2-42.7-4.3-55.8-3.7c2.1-7.7 2.8-16.7 2.8-26.6c0-14.3-5.4-25.7-14-34.3c1.5-4.9 3.5-15.8-2-29.7c0 0-9.8-3.1-32.1 11.8c-8.7-2.2-18-3.3-27.3-3.3c-10.2 0-20.5 1.3-30.2 3.9C74.4-2.9 64.3.3 64.3.3c-6.6 16.5-2.5 28.8-1.3 31.8c-7.8 8.4-12.5 19.1-12.5 32.2c0 9.9 1.1 18.8 3.9 26.5c-13.2-.5-34-.3-54.4 3.8l.2.9c20.4-4.1 41.4-4.2 54.5-3.7c.6 1.6 1.3 3.2 2 4.7c-13 .4-35.1 2.1-56.3 8.1l.3.9c21.4-6 43.7-7.6 56.6-8c7.8 14.4 23 23.8 50.2 26.7c-3.9 2.6-7.8 7-9.4 14.5c-5.3 2.5-21.9 8.7-31.9-8.5c0 0-5.6-10.2-16.3-11c0 0-10.4-.2-.7 6.5c0 0 6.9 3.3 11.7 15.6c0 0 6.3 21 36.4 14.2V177s-.6 7.7-7.7 10.2c0 0-4.2 2.9.3 4.5c0 0 19.5 1.6 19.5-14.4v-23.6s-.8-9.4 3.8-12.6v38.8s-.3 9.3-5.1 12.8c0 0-3.2 5.7 3.8 4.2c0 0 13.4-1.9 14-17.6l.3-39.3h3.2l.3 39.3c.6 15.6 14 17.6 14 17.6c7 1.6 3.8-4.2 3.8-4.2c-4.8-3.5-5.1-12.8-5.1-12.8v-38.5c4.6 3.6 3.8 12.3 3.8 12.3v23.6c0 16 19.5 14.4 19.5 14.4c4.5-1.6.3-4.5.3-4.5c-7-2.6-7.7-10.2-7.7-10.2v-31c0-12.1-5.1-18.5-10.1-21.8c29-2.9 42.9-12.2 49.3-26.8c12.7.3 35.6 1.9 57.4 8.1l.3-.9c-21.7-6.1-44.4-7.7-57.3-8.1c.6-1.5 1.1-3 1.6-4.6c13.4-.5 35.1-.5 56.3 3.7m0 0"/><path fill="#f5ccb3" d="M174.6 63.7c6.2 5.7 9.9 12.5 9.9 19.8c0 34.4-25.6 35.3-57.2 35.3S70.1 114 70.1 83.5c0-7.3 3.6-14.1 9.8-19.7c10.3-9.4 27.7-4.4 47.4-4.4s37-5.1 47.3 4.3m0 0"/><path fill="#fff" d="M108.3 85.3c0 9.5-5.3 17.1-11.9 17.1s-11.9-7.7-11.9-17.1c0-9.5 5.3-17.1 11.9-17.1c6.6-.1 11.9 7.6 11.9 17.1m0 0"/><path fill="#af5c51" d="M104.5 85.5c0 6.3-3.6 11.4-7.9 11.4c-4.4 0-7.9-5.1-7.9-11.4s3.6-11.4 7.9-11.4s7.9 5.1 7.9 11.4m0 0"/><path fill="#fff" d="M172.2 85.3c0 9.5-5.3 17.1-11.9 17.1s-11.9-7.7-11.9-17.1c0-9.5 5.3-17.1 11.9-17.1c6.5-.1 11.9 7.6 11.9 17.1m0 0"/><path fill="#af5c51" d="M168.3 85.5c0 6.3-3.6 11.4-7.9 11.4c-4.4 0-7.9-5.1-7.9-11.4s3.6-11.4 7.9-11.4c4.4 0 7.9 5.1 7.9 11.4m-37.8 15c0 1.6-1.3 3-3 3c-1.6 0-3-1.3-3-3s1.3-3 3-3c1.6 0 3 1.3 3 3m-9.9 7.5c-.2-.5.1-1 .6-1.2s1 .1 1.2.6c.8 2.2 2.8 3.6 5.1 3.6s4.3-1.5 5.1-3.6c.2-.5.7-.8 1.2-.6s.8.7.6 1.2c-1 2.9-3.8 4.9-6.9 4.9s-5.9-2-6.9-4.9m0 0"/><path fill="#c4e5d9" d="M54.5 121.6c0 .8-.9 1.4-2.1 1.4c-1.1 0-2.1-.6-2.1-1.4s.9-1.4 2.1-1.4s2.1.6 2.1 1.4m5.8 3.2c0 .8-.9 1.4-2.1 1.4c-1.1 0-2.1-.6-2.1-1.4s.9-1.4 2.1-1.4s2.1.6 2.1 1.4m3.5 4.2c0 .8-.9 1.4-2.1 1.4c-1.1 0-2.1-.6-2.1-1.4s.9-1.4 2.1-1.4c1.2-.1 2.1.6 2.1 1.4m3.2 4.8c0 .8-.9 1.4-2.1 1.4c-1.1 0-2.1-.6-2.1-1.4s.9-1.4 2.1-1.4c1.2-.1 2.1.6 2.1 1.4m3.5 4.4c0 .8-.9 1.4-2.1 1.4c-1.1 0-2.1-.6-2.1-1.4s.9-1.4 2.1-1.4s2.1.6 2.1 1.4m4.8 3.9c0 .8-.9 1.4-2.1 1.4c-1.1 0-2.1-.6-2.1-1.4s.9-1.4 2.1-1.4c1.2-.1 2.1.6 2.1 1.4m6.7 2.5c0 .8-.9 1.4-2.1 1.4c-1.1 0-2.1-.6-2.1-1.4s.9-1.4 2.1-1.4s2.1.6 2.1 1.4m6.7 0c0 .8-.9 1.4-2.1 1.4c-1.1 0-2.1-.6-2.1-1.4s.9-1.4 2.1-1.4s2.1.6 2.1 1.4m6.8-1.1c0 .8-.9 1.4-2.1 1.4c-1.1 0-2.1-.6-2.1-1.4s.9-1.4 2.1-1.4c1.1 0 2.1.6 2.1 1.4m0 0"/></svg>'
      },
      link: "https://github.com/changweihua"
    },
    {
      icon: {
        svg: '<svg t="1691037048600" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2584" width="128" height="128"><path d="M228.7 643.9c-0.1 0.1-0.2 0.3-0.3 0.4 3.9-4.4 8-9 12-13.5-7.5 8.4-11.7 13.1-11.7 13.1z" fill="#1590E9" p-id="2585"></path><path d="M894 298.1l25.6-15.1c10.4-6.1 9.1-21.5-2.1-25.9l-12.3-4.8c-18-7.1-34.2-18.2-46.7-33-15.7-18.5-44.7-45.1-90.9-60.8-52.7-18-142.9-14.4-193.2-10.5-15.9 1.2-25 18.4-17.4 32.5 42.6 78.6 16.7 114.3-5.7 140.7-34.3 40.4-97.4 112.2-160.7 183.6 21.9-24.5 41.8-46.8 58.1-65.1 36.4-40.8 91.3-61.5 145.1-51.7 171.5 31.3 191 253.4-9.2 385.6 26.1-1.4 52.6-3.3 79.2-6 252.6-26 272.6-232.1 218-333.9-19.4-36.1-22.2-60.5-20.1-83.9 2-21.5 13.8-40.8 32.3-51.7z" fill="#99C236" p-id="2586"></path><path d="M212.8 704.5C241.1 672.9 316 589 390.7 504.7c-54.6 61.2-121.8 136.7-177.9 199.8z" fill="#1590E9" p-id="2587"></path><path d="M216.3 758.6c-19.5-2.5-28.2-25.6-15.5-40.6-51.7 58.3-91.7 103.5-99.1 112.6-24.1 29.5 247.7 97.9 482.6-56.8 0.1-0.1 0.3-0.2 0.4-0.3-156.5 8.2-298.5-5.9-368.4-14.9z" fill="#CAC134" p-id="2588"></path><path d="M593.9 387.9c-53.8-9.8-108.7 10.9-145.1 51.7-16.3 18.2-36.2 40.5-58.1 65.1C316 589 241.1 672.9 212.8 704.5c-4.1 4.6-8.1 9.1-12 13.5-12.7 14.9-4 38 15.5 40.6 69.9 9 211.9 23.1 368.3 15 200.2-132.3 180.8-354.4 9.3-385.7z" fill="#029F40" p-id="2589"></path></svg>'
      },
      link: "https://www.yuque.com/changweihua"
    },
    {
      icon: {
        svg: '<svg t="1691037358744" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7640" width="128" height="128"><path d="M117.149737 906.850263V117.160081h789.690182v789.690182z m148.521374-641.706667v492.533657h248.873374V367.843556h145.025293v389.906101h98.735321V265.143596z" fill="#CB3837" p-id="7641"></path></svg>'
      },
      link: "https://www.npmjs.com/~changweihua"
    },
    {
      icon: {
        svg: '<svg t="1692580990833" class="icon" viewBox="0 0 1129 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4458" width="128" height="128"><path d="M234.909 9.656a80.468 80.468 0 0 1 68.398 0 167.374 167.374 0 0 1 41.843 30.578l160.937 140.82h115.07l160.936-140.82a168.983 168.983 0 0 1 41.843-30.578A80.468 80.468 0 0 1 930.96 76.445a80.468 80.468 0 0 1-17.703 53.914 449.818 449.818 0 0 1-35.406 32.187 232.553 232.553 0 0 1-22.531 18.508h100.585a170.593 170.593 0 0 1 118.289 53.109 171.397 171.397 0 0 1 53.914 118.288v462.693a325.897 325.897 0 0 1-4.024 70.007 178.64 178.64 0 0 1-80.468 112.656 173.007 173.007 0 0 1-92.539 25.75h-738.7a341.186 341.186 0 0 1-72.421-4.024A177.835 177.835 0 0 1 28.91 939.065a172.202 172.202 0 0 1-27.36-92.539V388.662a360.498 360.498 0 0 1 0-66.789A177.03 177.03 0 0 1 162.487 178.64h105.414c-16.899-12.07-31.383-26.555-46.672-39.43a80.468 80.468 0 0 1-25.75-65.984 80.468 80.468 0 0 1 39.43-63.57M216.4 321.873a80.468 80.468 0 0 0-63.57 57.937 108.632 108.632 0 0 0 0 30.578v380.615a80.468 80.468 0 0 0 55.523 80.469 106.218 106.218 0 0 0 34.601 5.632h654.208a80.468 80.468 0 0 0 76.444-47.476 112.656 112.656 0 0 0 8.047-53.109v-354.06a135.187 135.187 0 0 0 0-38.625 80.468 80.468 0 0 0-52.304-54.719 129.554 129.554 0 0 0-49.89-7.242H254.22a268.764 268.764 0 0 0-37.82 0z m0 0" fill="#20B0E3" p-id="4459"></path><path d="M348.369 447.404a80.468 80.468 0 0 1 55.523 18.507 80.468 80.468 0 0 1 28.164 59.547v80.468a80.468 80.468 0 0 1-16.094 51.5 80.468 80.468 0 0 1-131.968-9.656 104.609 104.609 0 0 1-10.46-54.719v-80.468a80.468 80.468 0 0 1 70.007-67.593z m416.02 0a80.468 80.468 0 0 1 86.102 75.64v80.468a94.148 94.148 0 0 1-12.07 53.11 80.468 80.468 0 0 1-132.773 0 95.757 95.757 0 0 1-12.875-57.133V519.02a80.468 80.468 0 0 1 70.007-70.812z m0 0" fill="#20B0E3" p-id="4460"></path></svg>'
      },
      link: "https://space.bilibili.com/544116500"
    }
  ],
  // i18n路由
  i18nRouting: true,
  search: {
    provider: "local",
    options: {
      locales: {
        "zh-CN": {
          translations: {
            button: {
              buttonText: "\u641C\u7D22\u6587\u6863",
              buttonAriaLabel: "\u641C\u7D22\u6587\u6863"
            },
            modal: {
              noResultsText: "\u65E0\u6CD5\u627E\u5230\u76F8\u5173\u7ED3\u679C",
              displayDetails: "\u663E\u793A\u8BE6\u7EC6\u4FE1\u606F",
              resetButtonTitle: "\u6E05\u9664\u67E5\u8BE2\u6761\u4EF6",
              backButtonTitle: "\u8FD4\u56DE",
              footer: {
                selectText: "\u9009\u62E9",
                selectKeyAriaLabel: "enter",
                navigateText: "\u5207\u6362",
                navigateUpKeyAriaLabel: "up arrow",
                navigateDownKeyAriaLabel: "down arrow",
                closeText: "\u5173\u95ED",
                closeKeyAriaLabel: "escape"
              }
            }
          }
        }
      }
      // _render(src, env, md) {
      //   const html = md.render(src, env);
      //   if (env.frontmatter?.search === false) return "";
      //   // 从搜索中排除页面
      //   if (env.relativePath.startsWith("some/path")) return "";
      //   // 转换内容——添加锚点
      //   if (env.frontmatter?.title)
      //     return md.render(`# ${env.frontmatter.title}`) + html;
      //   return html;
      // },
      // // 搜索配置
      // miniSearch: {
      //   /**
      //    * @type {Pick<import('minisearch').Options, 'extractField' | 'tokenize' | 'processTerm'>}
      //    */
      //   options: {
      //     /* ... */
      //   },
      //   /**
      //    * @type {import('minisearch').SearchOptions}
      //    * @default
      //    * { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 2, titles: 1 } }
      //    */
      //   searchOptions: {
      //     /* ... */
      //   },
      // },
    }
  }
  // sidebar,
  // algolia: {
  //   appId: "II80G4ELTA", // 需要替换
  //   apiKey: "96ae9b68f09fd07cbf58cbdf39b99cba", // 需要替换
  //   indexName: "cmono_net", // 需要替换
  //   placeholder: "请输入关键词",
  //   // searchParameters?: SearchOptions
  //   // disableUserPersonalization?: boolean
  //   // initialQuery?: string
  //   locales: {
  //     zh: {
  //       translations: {
  //         button: {
  //           buttonText: "搜索",
  //         },
  //       },
  //     },
  //   },
  //   // 搜索配置（二选一）
  //   // search: {
  //   //   // 本地离线搜索
  //   //   provider: "local",
  //   //   // 多语言搜索配置
  //   //   options: {
  //   //     locales: {
  //   //       /* 默认语言 */
  //   //       zh: {
  //   //         translations: {
  //   //           button: {
  //   //             buttonText: "搜索",
  //   //             buttonAriaLabel: "搜索文档",
  //   //           },
  //   //           modal: {
  //   //             noResultsText: "无法找到相关结果",
  //   //             resetButtonTitle: "清除查询结果",
  //   //             footer: {
  //   //               selectText: "选择",
  //   //               navigateText: "切换",
  //   //             },
  //   //           },
  //   //         },
  //   //       },
  //   //       en: {
  //   //         translations: {
  //   //           button: {
  //   //             buttonText: "Search",
  //   //             buttonAriaLabel: "Search for Documents",
  //   //           },
  //   //           modal: {
  //   //             noResultsText: "Unable to find relevant results",
  //   //             resetButtonTitle: "Clear Query Results",
  //   //             footer: {
  //   //               selectText: "select",
  //   //               navigateText: "switch",
  //   //             },
  //   //           },
  //   //         },
  //   //       },
  //   //     },
  //   //   },
  // },
  // // 自定义扩展: 文章版权配置
  // copyrightConfig: {
  //   license: '署名-相同方式共享 4.0 国际 (CC BY-SA 4.0)',
  //   licenseLink: 'http://creativecommons.org/licenses/by-sa/4.0/'
  // },
  // // 自定义扩展: 页脚配置
  // footerConfig: {
  //   showFooter: true, // 是否显示页脚
  //   icpRecordCode: '津ICP备2022005864号-2', // ICP备案号
  //   publicSecurityRecordCode: '津公网安备12011202000677号', // 联网备案号
  //   copyright: `Copyright © 2019-${new Date().getFullYear()} Charles7c` // 版权信息
  // }
};

// .vitepress/src/navs/zh-CN.nav.ts
var getZhCNNav = () => {
  return [
    { text: "\u9996\u9875", link: "/zh-CN/" },
    {
      text: "\u535A\u5BA2",
      link: "/zh-CN/blog/"
    },
    {
      text: "\u5F52\u6863",
      link: "/zh-CN/archives.md"
    },
    {
      text: "\u6807\u7B7E",
      link: "/zh-CN/tags.md"
    }
    // {
    //   text: "分类",
    //   link: "/tags.md",
    //   activeMatch: "^/tags",
    // },
    // {
    //   text: "课程",
    //   link: "/course/",
    //   activeMatch: "^/course/",
    // },
    // {
    //   text: "关于",
    //   link: "/about/index.md",
    //   activeMatch: "^/about/",
    // },
    // {
    //   text: "文章分类",
    //   items: [
    //     {
    //       items: [
    //         { text: "3D 开发", link: "/category/three3d.md" },
    //         { text: "工具&平台", link: "/category/tool.md" },
    //       ],
    //     },
    //     {
    //       items: [
    //         { text: "Flutter", link: "/category/flutter.md" },
    //         { text: "微信小程序", link: "/category/wechat.md" },
    //         { text: "DotNET", link: "/category/dotnet.md" },
    //       ],
    //     },
    //     {
    //       items: [
    //         { text: "VueJS", link: "/category/vue.md" },
    //         { text: "TypeScript", link: "/category/typescript.md" },
    //       ],
    //     },
    //   ],
    // },
  ];
};

// .vitepress/src/navs/en-US.nav.ts
var getEnUSNav = () => {
  return [
    { text: "Home", link: "/en-US/" },
    {
      text: "Blog",
      link: "/en-US/blog/"
    },
    {
      text: "Archive",
      link: "/en-US/archives.md"
    }
  ];
};

// .vitepress/src/sidebars/zh-CN.sidebar.ts
var getZhCNSidebar = () => {
  return {
    articles: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" }
        ]
      }
    ],
    "/course/typescript/": [
      {
        text: "TypeScript",
        items: [
          { text: "TypeScript\u5185\u7F6E\u7C7B\u578B", link: "/course/typescript/preset_type" },
          { text: "TypeScript\u62D3\u5C55", link: "/course/typescript/extension_type" },
          { text: "\u9ED8\u8BA4 tsconfig.json", link: "/course/typescript/default_tsconfig" }
        ]
      }
    ],
    "/course/algorithm/": [
      {
        text: "algorithm",
        items: []
      }
    ]
    // gallery: [
    //   {
    //     text: "项目案例",
    //     items: [
    //       { text: "无锡硕放机场阳光服务平台", link: "/gallery/sunny-land" },
    //       { text: "扬泰机场智慧出行微信小程序", link: "/api-examples" },
    //       {
    //         text: "上海民航华东凯亚江苏分公司疫情防控平台",
    //         link: "/api-examples",
    //       },
    //       { text: "无锡硕放机场安检效能分析系统", link: "/api-examples" },
    //       {
    //         text: "无锡硕放机场进出港/无纸化系统",
    //         link: "/api-examples",
    //       },
    //       { text: "扬泰机场客源地分析系统", link: "/api-examples" },
    //     ],
    //   },
    // ],
    // blog: [
    //   {
    //     text: "2023-06",
    //     items: [
    //       {
    //         text: "P-Touch P900 打印机使用",
    //         link: "/blog/2023-06/P-Touch P900 打印机使用",
    //       },
    //       { text: "Vitest 使用", link: "/blog/2023-06/15" },
    //     ],
    //   },
    //   {
    //     text: "2023-05",
    //     items: [
    //       { text: "搭建 Github 个人主页", link: "/blog/2023-05/15" },
    //       {
    //         text: "使用 SkiaSharp 实现图片水印",
    //         link: "/blog/2023-05/skiashap_watermark.md",
    //       },
    //     ],
    //   },
    //   {
    //     text: "2022",
    //     items: [
    //       {
    //         text: "从 Docker 安装 Gitea",
    //         link: "/blog/2022/从 Docker 安装 Gitea.md",
    //       },
    //       {
    //         text: "敏捷开发学习笔记",
    //         link: "/blog/2022/敏捷开发学习笔记.md",
    //       },
    //       {
    //         text: "私有nuget服务器部署",
    //         link: "/blog/2022/私有nuget服务器部署.md",
    //       },
    //       {
    //         text: "为docker配置HTTP代理服务器",
    //         link: "/blog/2022/为docker配置HTTP代理服务器.md",
    //       },
    //       {
    //         text: "私有nuget服务器部署",
    //         link: "/blog/2022/私有nuget服务器部署.md",
    //       },
    //       {
    //         text: "正向代理和反向代理",
    //         link: "/blog/2022/正向代理和反向代理.md",
    //       },
    //       {
    //         text: "正向代理和反向代理详解",
    //         link: "/blog/2022/正向代理和反向代理详解.md",
    //       },
    //     ],
    //   },
    // ],
  };
};

// .vitepress/src/sidebars/en-US.sidebar.ts
var getEnUSSidebar = () => {
  return {
    articles: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" }
        ]
      }
    ],
    courses: [
      {
        text: "\u9884\u5B9A\u4E49\u7C7B\u578B",
        items: [
          { text: "Markdown Examples", link: "/course/typescript/preset_type" },
          { text: "Runtime API Examples", link: "/course/typescript/extension_type" }
        ]
      }
    ]
    // gallery: [
    //   {
    //     text: "项目案例",
    //     items: [
    //       { text: "无锡硕放机场阳光服务平台", link: "/gallery/sunny-land" },
    //       { text: "扬泰机场智慧出行微信小程序", link: "/api-examples" },
    //       {
    //         text: "上海民航华东凯亚江苏分公司疫情防控平台",
    //         link: "/api-examples",
    //       },
    //       { text: "无锡硕放机场安检效能分析系统", link: "/api-examples" },
    //       {
    //         text: "无锡硕放机场进出港/无纸化系统",
    //         link: "/api-examples",
    //       },
    //       { text: "扬泰机场客源地分析系统", link: "/api-examples" },
    //     ],
    //   },
    // ],
    // blog: [
    //   {
    //     text: "2023-06",
    //     items: [
    //       {
    //         text: "P-Touch P900 打印机使用",
    //         link: "/blog/2023-06/P-Touch P900 打印机使用",
    //       },
    //       { text: "Vitest 使用", link: "/blog/2023-06/15" },
    //     ],
    //   },
    //   {
    //     text: "2023-05",
    //     items: [
    //       { text: "搭建 Github 个人主页", link: "/blog/2023-05/15" },
    //       {
    //         text: "使用 SkiaSharp 实现图片水印",
    //         link: "/blog/2023-05/skiashap_watermark.md",
    //       },
    //     ],
    //   },
    //   {
    //     text: "2022",
    //     items: [
    //       {
    //         text: "从 Docker 安装 Gitea",
    //         link: "/blog/2022/从 Docker 安装 Gitea.md",
    //       },
    //       {
    //         text: "敏捷开发学习笔记",
    //         link: "/blog/2022/敏捷开发学习笔记.md",
    //       },
    //       {
    //         text: "私有nuget服务器部署",
    //         link: "/blog/2022/私有nuget服务器部署.md",
    //       },
    //       {
    //         text: "为docker配置HTTP代理服务器",
    //         link: "/blog/2022/为docker配置HTTP代理服务器.md",
    //       },
    //       {
    //         text: "私有nuget服务器部署",
    //         link: "/blog/2022/私有nuget服务器部署.md",
    //       },
    //       {
    //         text: "正向代理和反向代理",
    //         link: "/blog/2022/正向代理和反向代理.md",
    //       },
    //       {
    //         text: "正向代理和反向代理详解",
    //         link: "/blog/2022/正向代理和反向代理详解.md",
    //       },
    //     ],
    //   },
    // ],
  };
};

// .vitepress/src/configs/zh-CN.config.ts
import dayjs from "file:///D:/Github/changweihua.github.io/node_modules/dayjs/dayjs.min.js";
var zhConfig = {
  description: "CMONO.NET \u4E4B\u5BB6",
  title: "CMONO.NET",
  lang: "zh-CN",
  themeConfig: {
    logo: "/logo.png",
    lastUpdatedText: "\u4E0A\u6B21\u66F4\u65B0",
    returnToTopLabel: "\u8FD4\u56DE\u9876\u90E8",
    // 文档页脚文本配置
    docFooter: {
      prev: "\u4E0A\u4E00\u9875",
      next: "\u4E0B\u4E00\u9875"
    },
    footer: {
      message: "MIT Licensed",
      copyright: `Copyright \xA9 2009-${dayjs().year()} CMONO.NET`
    },
    //   editLink: {
    //     pattern: '路径地址',
    //     text: '对本页提出修改建议',
    //   },
    nav: getZhCNNav(),
    sidebar: getZhCNSidebar(),
    outline: {
      level: "deep",
      // 右侧大纲标题层级
      label: "\u76EE\u5F55"
      // 右侧大纲标题文本配置
    }
  }
};

// .vitepress/src/configs/en-US.config.ts
import dayjs2 from "file:///D:/Github/changweihua.github.io/node_modules/dayjs/dayjs.min.js";
var enConfig = {
  description: "CMONO.NET HomePage",
  title: "CMONO.NET",
  lang: "en-US",
  themeConfig: {
    logo: "/logo.png",
    lastUpdatedText: "Last Updated",
    returnToTopLabel: "TOP",
    // 文档页脚文本配置
    docFooter: {
      prev: "Prev",
      next: "Next"
    },
    footer: {
      message: "MIT Licensed",
      copyright: `Copyright \xA9 2009-${dayjs2().year()} CMONO.NET`
    },
    //   editLink: {
    //     pattern: '路径地址',
    //     text: '对本页提出修改建议',
    //   },
    nav: getEnUSNav(),
    sidebar: getEnUSSidebar(),
    outline: {
      level: "deep",
      // 右侧大纲标题层级
      label: "\u76EE\u5F55"
      // 右侧大纲标题文本配置
    }
  }
};

// .vitepress/src/docs.ts
var docsConfig = {
  base: "/",
  title: "CMONO.NET",
  description: "\u4E2A\u4EBA\u5728\u7EBF",
  appearance: true,
  lang: "zh-CN",
  head: [
    // ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    // 设置 描述 和 关键词
    [
      "meta",
      { name: "keywords", content: "react react-admin ant \u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF" }
    ],
    [
      "meta",
      {
        name: "description",
        content: "\u6B64\u6846\u67B6\u4F7F\u7528\u4E0E\u4E8C\u6B21\u5F00\u53D1\uFF0C\u524D\u7AEF\u6846\u67B6\u4F7F\u7528react\uFF0CUI\u6846\u67B6\u4F7F\u7528ant-design\uFF0C\u5168\u5C40\u6570\u636E\u72B6\u6001\u7BA1\u7406\u4F7F\u7528redux\uFF0Cajax\u4F7F\u7528\u5E93\u4E3Aaxios\u3002\u7528\u4E8E\u5FEB\u901F\u642D\u5EFA\u4E2D\u540E\u53F0\u9875\u9762\u3002"
      }
    ]
  ],
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
    }
  ],
  locales: {
    // 若果配置了root，则双击title的时候不会返回/路径下了，只会返回在link路径下
    // root: { label: "简体中文", lang: "zh-CN", link: "/zh-CN/",  ...zhConfig },
    "zh-CN": { label: "\u7B80\u4F53\u4E2D\u6587", lang: "zh-CN", link: "/zh-CN/", ...zhConfig },
    "en-US": { label: "English", lang: "en-US", link: "/en-US/", ...enConfig }
  }
};

// .vitepress/src/head.ts
var head = [
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
  ["meta", { name: "theme-color", content: "#ffffff" }],
  ["meta", { name: "mobile-web-app-capable", content: "yes" }],
  ["meta", { name: "apple-mobile-web-app-status-bar-style", content: "default" }],
  ["meta", { name: "application-name", content: "CMONO.NET" }],
  ["meta", { name: "apple-touch-icon-precomposed", content: "/favicon.svg" }],
  // ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  [
    "link",
    { rel: "icon", type: "image/x-icon", href: "/favicon.ico", sizes: "any" }
  ],
  // ['link', { rel: 'mask-icon', href: '/favicon.svg', color: '#ffffff' }],
  // ['link', { rel: 'apple-touch-icon', href: '/favicon.svg', sizes: '180x180' }],
  [
    "link",
    {
      rel: "stylesheet",
      href: "/font.css"
    }
  ],
  ["meta", { name: "referrer", content: "no-referrer" }],
  // [
  //   "script",
  //   {
  //     src: "/clarity.js",
  //   },
  // ],
  [
    "meta",
    {
      name: "keywords",
      content: "CMONO.NET,changweihua,\u5E38\u4F1F\u534E,Lance,changweihua.github.io,Vite,VitePress,AntDesign"
    }
  ],
  [
    "meta",
    {
      name: "description",
      content: "CMONO.NET \u5B98\u65B9\u7AD9\u70B9\uFF0C\u4E3B\u8981\u8BB0\u5F55\u5E73\u65F6\u5DE5\u4F5C\u603B\u7ED3\u53CA\u9879\u76EE\u7ECF\u5386"
    }
  ],
  [
    "meta",
    {
      name: "theme-color",
      content: "#1972F8",
      "media": "(prefers-color-scheme: light)"
    }
  ],
  [
    "meta",
    {
      name: "theme-color",
      content: "#1C4D98",
      "media": "(prefers-color-scheme: dark)"
    }
  ],
  [
    "script",
    {
      src: "/cursor.js",
      "data-site": "https://changweihua.github.io",
      "data-spa": "auto",
      defer: "true"
    }
  ],
  [
    "script",
    {
      src: "https://hm.baidu.com/hm.js?9bdcf6f2112634d13223ef73de6fe9fa",
      "data-site": "https://changweihua.github.io",
      "data-spa": "auto",
      defer: "true"
    }
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
  ["meta", { name: "author", content: "Lance Chang" }],
  [
    "meta",
    {
      name: "keywords",
      content: "changweihua \u5E38\u4F1F\u534E vitepress cmono.net changweihua.github.io \u4E2A\u4EBA\u7F51\u7AD9"
    }
  ],
  [
    "meta",
    {
      name: "description",
      content: "\u6B64\u7CFB\u7EDF\u57FA\u4E8Evitepress\u4E8C\u6B21\u5F00\u53D1\uFF0C\u524D\u7AEF\u6846\u67B6\u4F7F\u7528vuejs\uFF0CUI\u6846\u67B6\u4F7F\u7528ant-design\uFF0C\u5168\u5C40\u6570\u636E\u72B6\u6001\u7BA1\u7406\u4F7F\u7528paina\uFF0Cajax\u4F7F\u7528\u5E93\u4E3Afetch\u3002\u7528\u4E8E\u5FEB\u901F\u642D\u5EFA\u4E2A\u4EBA\u7F51\u7AD9\u548C\u5185\u5BB9\u7BA1\u7406\u5E73\u53F0\u3002"
    }
  ]
];

// .vitepress/src/markdown.ts
import lightbox from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-plugin-lightbox/dist/index.js";
import timeline from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-markdown-timeline/dist/cjs/index.cjs.js";
import footnote from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-footnote/index.mjs";
import markdownSup from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-sup/index.mjs";
import markdownSub from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-sub/index.mjs";
import markdownItMark from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-mark/index.mjs";
import frontmatter from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-front-matter/index.js";
import { wordless, chineseAndJapanese } from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-wordless/index.js";
import markdownLinks from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-external-links/lib/index.js";
import MarkdownItCollapsible from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-collapsible/dist/esm/index.js";
import lazy_loading from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-image-lazy-loading/index.mjs";
import MarkdownItVariable from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-variable/dist/esm/index.js";
import MarkdownItTodoLists from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-todo-lists/dist/index.mjs";
import namedCode from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-named-code-blocks/dist/index.js";
import strikethrough from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-strikethrough-alt/index.js";
import hashmention from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-hashmention/dist/index.js";
import { tasklist } from "file:///D:/Github/changweihua.github.io/node_modules/@mdit/plugin-tasklist/lib/index.js";
import { ruby } from "file:///D:/Github/changweihua.github.io/node_modules/@mdit/plugin-ruby/lib/index.js";
import { markdownItStepper } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-markdown-it-stepper/dist/index.mjs";

// .vitepress/plugins/markdown/image.ts
function ImagePlugin(md) {
  const imageRender = md.renderer.rules.image;
  md.renderer.rules.image = (...args) => {
    const [tokens, idx] = args;
    if (tokens[idx + 2] && /^<!--.*-->/.test(tokens[idx + 2].content)) {
      const data = tokens[idx + 2].content;
      if (/size=/.test(data)) {
        const size = data.match(/size=(\d+)(x\d+)?/);
        tokens[idx].attrs?.push(
          ["width", size?.[1] || ""],
          ["height", size?.[2]?.substring(1) || size?.[1] || ""]
        );
      }
      tokens[idx].attrs?.push(["loading", "lazy"], ["decoding", "async"]);
      tokens[idx + 2].content = "";
      return imageRender(...args);
    }
    tokens[idx].attrs?.push(["loading", "lazy"], ["decoding", "async"]);
    return imageRender(...args);
  };
}

// .vitepress/plugins/markdown/rough-mermaid.ts
function roughMermaidPlugin(md) {
  const fence = md.renderer.rules.fence?.bind(md.renderer.rules);
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const language = token.info.trim();
    if (language.startsWith("mermaid")) {
      return `
        <Suspense>
          <template #default>
            <ClientOnly>
              <StyledMermaid id="mermaid-${idx}" code="${encodeURIComponent(token.content)}"></StyledMermaid>
            </ClientOnly>
          </template>
          <!-- loading state via #fallback slot -->
          <template #fallback>
            Loading...
          </template>
        </Suspense>`;
    }
    return fence(tokens, idx, options, env, self);
  };
}

// .vitepress/plugins/markdown/markup.ts
function markupPlugin(md) {
  const fence = md.renderer.rules.fence?.bind(md.renderer.rules);
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const language = token.info.trim();
    if (language.startsWith("markup")) {
      return `<ClientOnly><MarkupView id="markup-${idx}" code="${encodeURIComponent(token.content)}"></MarkupView></ClientOnly>`;
    }
    return fence(tokens, idx, options, env, self);
  };
}

// .vitepress/src/markdown.ts
import useDefinePlugin from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-plugin-markdown-define/index.js";
import tabsPlugin from "file:///D:/Github/changweihua.github.io/node_modules/@red-asuka/vitepress-plugin-tabs/dist/index.mjs";
import { groupIconMdPlugin } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-plugin-group-icons/dist/index.mjs";
import { demoPreviewPlugin } from "file:///D:/Github/changweihua.github.io/node_modules/@vitepress-code-preview/plugin/dist/index.js";
import { fileURLToPath, URL } from "node:url";

// .vitepress/assets/latexs/LaTeX-Expl3.tmLanguage.json
var LaTeX_Expl3_tmLanguage_default = {
  name: "LaTeX-Expl3",
  patterns: [
    {
      begin: "(\\$\\$|\\$)",
      beginCaptures: {
        "1": {
          name: "punctuation.section.group.begin.tex"
        }
      },
      end: "(\\1)",
      endCaptures: {
        "1": {
          name: "punctuation.section.group.end.tex"
        }
      },
      name: "support.class.math.tex",
      patterns: [
        {
          match: "\\\\\\$",
          name: "constant.character.escape.tex"
        },
        {
          include: "#latex3"
        },
        {
          include: "text.tex#math"
        },
        {
          include: "$base"
        }
      ]
    },
    {
      begin: "\\\\\\(",
      beginCaptures: {
        "0": {
          name: "punctuation.section.group.begin.tex"
        }
      },
      end: "\\\\\\)",
      endCaptures: {
        "0": {
          name: "punctuation.section.group.end.tex"
        }
      },
      name: "support.class.math.tex",
      patterns: [
        {
          include: "#latex3"
        },
        {
          include: "text.tex#math"
        },
        {
          include: "$base"
        }
      ]
    },
    {
      begin: "\\\\\\[",
      beginCaptures: {
        "0": {
          name: "punctuation.section.group.begin.tex"
        }
      },
      end: "\\\\\\]",
      endCaptures: {
        "0": {
          name: "punctuation.section.group.end.tex"
        }
      },
      name: "support.class.math.tex",
      patterns: [
        {
          include: "#latex3"
        },
        {
          include: "text.tex#math"
        },
        {
          include: "$base"
        }
      ]
    },
    {
      include: "#latex3"
    },
    {
      include: "text.tex.latex"
    }
  ],
  repository: {
    latex3: {
      patterns: [
        {
          captures: {
            "1": {
              name: "punctuation.definition.function.expl.latex"
            }
          },
          match: "(\\\\|\\.)[\\w@]+:\\w*",
          name: "keyword.control.expl.latex"
        },
        {
          captures: {
            "1": {
              name: "punctuation.definition.variable.expl.latex"
            }
          },
          match: "(\\\\)[\\w@]+_[\\w@]+",
          name: "variable.expl.latex"
        }
      ]
    }
  },
  scopeName: "text.tex.latex.expl3"
};

// .vitepress/src/markdown.ts
var __vite_injected_original_import_meta_url = "file:///D:/Github/changweihua.github.io/.vitepress/src/markdown.ts";
var CONSTS = {
  __custom_variable__: "your value"
};
var markdown = {
  lineNumbers: true,
  linkify: true,
  math: true,
  anchor: {
    // permalink: anchor.permalink.ariaHidden({ // you can use other variants too, refer - https://github.com/valeriangalliat/markdown-it-anchor#permalinks
    //   symbol: `🔗`
    // })
  },
  // @ts-ignore
  languages: [LaTeX_Expl3_tmLanguage_default],
  // 默认禁用图片懒加载
  //@ts-ignore
  lazyLoading: true,
  theme: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
  config: (md) => {
    useDefinePlugin(md, CONSTS);
    md.use(footnote);
    md.use(tasklist);
    md.use(ruby);
    md.use(frontmatter);
    md.use(markdownSup);
    md.use(markdownSub);
    md.use(hashmention);
    md.use(MarkdownItTodoLists, {
      enabled: true
    });
    md.use(MarkdownItVariable);
    md.use(wordless, { supportWordless: [chineseAndJapanese] });
    markdownItMark(md);
    markdownLinks(md, {
      externalClassName: "custom-external-link",
      internalClassName: "custom-internal-link",
      internalDomains: ["https://changweihua.github.io"]
    });
    markdownItStepper(md);
    strikethrough(md);
    md.use(lightbox, {});
    md.use(namedCode, { isEnableInlineCss: true });
    md.use(lazy_loading);
    md.use(timeline);
    tabsPlugin(md);
    md.use(groupIconMdPlugin);
    md.use(roughMermaidPlugin);
    md.use(markupPlugin);
    md.use(MarkdownItCollapsible);
    const docRoot = fileURLToPath(new URL("../../", __vite_injected_original_import_meta_url));
    md.use(demoPreviewPlugin, {
      docRoot
    });
    md.use(ImagePlugin);
    md.renderer.rules.heading_close = (tokens, idx, options, env, slf) => {
      let htmlResult = slf.renderToken(tokens, idx, options);
      if (tokens[idx].tag === "h1") {
        htmlResult += `
<ClientOnly><ArticleMetadata :frontmatter="$frontmatter"/></ClientOnly>`;
      }
      return htmlResult;
    };
  }
};

// .vitepress/config.ts
import { RssPlugin } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-plugin-rss/dist/index.mjs";

// .vitepress/src/rss.ts
var rssBaseUrl = process.env.VITE_APP_RSS_BASE_URL || "https://changweihua.github.io";
var RSS = {
  // necessary（必选参数）
  title: "CMONO.NET",
  baseUrl: rssBaseUrl,
  icon: '<svg t="1692670607447" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6532" width="128" height="128"><path d="M265.216 758.784c22.528 22.528 34.816 51.2 34.816 83.968 0 32.768-13.312 62.464-34.816 83.968-22.528 22.528-53.248 34.816-83.968 34.816-32.768 0-62.464-13.312-83.968-34.816C73.728 905.216 61.44 874.496 61.44 843.776c0-32.768 13.312-62.464 34.816-83.968 22.528-22.528 51.2-34.816 83.968-34.816 33.792-1.024 62.464 12.288 84.992 33.792zM61.44 367.616v172.032c111.616 0 218.112 44.032 296.96 122.88S481.28 848.896 481.28 962.56h172.032c0-163.84-66.56-312.32-174.08-419.84C373.76 436.224 225.28 369.664 61.44 367.616zM61.44 61.44v172.032c402.432 0 729.088 326.656 729.088 729.088H962.56c0-247.808-101.376-473.088-264.192-636.928C536.576 163.84 311.296 63.488 61.44 61.44z" fill="#EBA33A" p-id="6533"></path></svg>',
  copyright: "Copyright (c) 2013-present, CMONO.NET",
  // optional（可选参数）
  language: "zh-cn",
  author: {
    name: "\u5E38\u4F1F\u534E",
    email: "changweihua@outlook.com",
    link: "https://changweihua.github.io"
  },
  authors: [
    {
      name: "\u5E38\u4F1F\u534E",
      email: "changweihua@outlook.com",
      link: "https://changweihua.github.io"
    }
  ],
  filename: "feed.rss",
  log: true,
  ignoreHome: true
};

// .vitepress/config.ts
import { defineConfig } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress/dist/node/index.js";

// .vitepress/utils/handleHeadMeta.ts
function handleHeadMeta(context) {
  const { description, title, relativePath } = context.pageData;
  const ogUrl = ["meta", { property: "og:url", content: addBase(relativePath.slice(0, -3)) + ".html" }];
  const ogTitle = ["meta", { property: "og:title", content: title }];
  const ogDescription = ["meta", { property: "og:description", content: description || context.description }];
  const ogImage = ["meta", { property: "og:image", content: "https://changweihua.github.io/author.jpg" }];
  const twitterCard = ["meta", { name: "twitter:card", content: "summary" }];
  const twitterImage = ["meta", { name: "twitter:image:src", content: "https://changweihua.github.io/author.jpg" }];
  const twitterDescription = ["meta", { name: "twitter:description", content: description || context.description }];
  const twitterHead = [
    ogUrl,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    twitterDescription,
    twitterImage
  ];
  return [...head, ...twitterHead];
}
function addBase(relativePath) {
  const host = "https://changweihua.github.io";
  if (relativePath.startsWith("/")) {
    return host + relativePath;
  } else {
    return host + "/" + relativePath;
  }
}

// .vitepress/config.ts
import GitRevisionInfoPlugin from "file:///D:/Github/changweihua.github.io/node_modules/vite-plugin-git-revision-info/dist/index.js";
import { getChangelogAndContributors } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-plugin-changelog/dist/changelog.js";
import vitepressProtectPlugin from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-protect-plugin/dist/index.js";
import { groupIconVitePlugin } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-plugin-group-icons/dist/index.mjs";
import { viteDemoPreviewPlugin } from "file:///D:/Github/changweihua.github.io/node_modules/@vitepress-code-preview/plugin/dist/index.js";
import vueJsx from "file:///D:/Github/changweihua.github.io/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import { AnnouncementPlugin } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-plugin-announcement/dist/index.mjs";
var customElements = [
  "mjx-container",
  "mjx-assistive-mml",
  "math",
  "maction",
  "maligngroup",
  "malignmark",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mi",
  "mlongdiv",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "ms",
  "mscarries",
  "mscarry",
  "mscarries",
  "msgroup",
  "mstack",
  "mlongdiv",
  "msline",
  "mstack",
  "mspace",
  "msqrt",
  "msrow",
  "mstack",
  "mstack",
  "mstyle",
  "msub",
  "msup",
  "msubsup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "semantics",
  "math",
  "mi",
  "mn",
  "mo",
  "ms",
  "mspace",
  "mtext",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mpadded",
  "mphantom",
  "mroot",
  "mrow",
  "msqrt",
  "mstyle",
  "mmultiscripts",
  "mover",
  "mprescripts",
  "msub",
  "msubsup",
  "msup",
  "munder",
  "munderover",
  "none",
  "maligngroup",
  "malignmark",
  "mtable",
  "mtd",
  "mtr",
  "mlongdiv",
  "mscarries",
  "mscarry",
  "msgroup",
  "msline",
  "msrow",
  "mstack",
  "maction",
  "semantics",
  "annotation",
  "annotation-xml"
];
var config_default = defineConfig({
  // mermaid: {
  //   // 'theme': 'base',
  //   // 'themeVariables': {
  //   //   'primaryColor': '#506bee',
  //   //   // 'primaryTextColor': '#fff',
  //   //   // 'primaryBorderColor': '#7C0000',
  //   //   // 'lineColor': '#F8B229',
  //   //   // 'secondaryColor': '#006100',
  //   //   // 'tertiaryColor': '#fff'
  //   // },
  //   fontFamily: "AlibabaPuHuiTi, 阿里巴巴普惠体 3.0",
  //   altFontFamily: "AlibabaPuHuiTi, 阿里巴巴普惠体 3.0",
  //   startOnLoad: false
  //   //mermaidConfig !theme here works for ligth mode since dark theme is forced in dark mode
  // },
  // // 可选地使用MermaidPluginConfig为插件本身设置额外的配置
  // mermaidPlugin: {
  //   class: "mermaid rough-mermaid" // 为父容器设置额外的CSS类
  // },
  // srcDir: '.',
  vite: {
    logLevel: "info",
    plugins: [
      GitRevisionInfoPlugin(),
      groupIconVitePlugin({
        customIcon: {
          ae: "logos:adobe-after-effects",
          ai: "logos:adobe-illustrator",
          ps: "logos:adobe-photoshop"
          // rspack: localIconLoader(import.meta.url, '../assets/rspack.svg'),
          // farm: localIconLoader(import.meta.url, '../assets/farm.svg'),
        }
      }),
      RssPlugin(RSS),
      vitepressProtectPlugin({
        disableF12: true,
        disableCopy: true,
        disableSelect: true
      }),
      viteDemoPreviewPlugin(),
      vueJsx(),
      AnnouncementPlugin({
        title: "\u6B22\u8FCE\u6765\u5230CMONO.NET",
        clientOnly: true,
        duration: -1,
        mobileMinify: true,
        icon: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1729473692503" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11855" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><path d="M882.5 426.8C879.7 225 714 63.6 512.1 66c-201.8-2.5-367.6 159-370.4 360.8 0.3 104.9 46.7 204.3 126.9 271.9v227.7c0.2 9.1 4.6 17.6 12 22.9 7.6 5.2 17.1 6.6 25.8 3.9L512 885.6l205.6 67.7c2.9 1.1 6 1.7 9.2 1.7 5.9 0.1 11.7-1.6 16.6-4.9 7.5-5.2 12-13.8 12-23V699.3c80.3-67.9 126.7-167.5 127.1-272.5z m-680.5 0c2.5-168.7 141-303.5 309.7-301.6 168.6-1.9 307 132.9 309.6 301.6-2.5 168.6-140.9 303.5-309.6 301.6-168.6 1.9-307-133-309.5-301.6h-0.2z m495.5 461.1l-176.9-58.2c-5.9-2.2-12.4-2.2-18.4 0l-176.7 58.2V739c115.5 64.9 256.6 64.9 372.1 0v148.8l-0.1 0.1zM569 363c0-7.6-2.2-15-6.3-21.3-4.1-6.2-10.2-11-17.2-13.4-13.4-3.7-27.4-5.3-41.3-4.5h-55.7v79.5h53.8c12.2 0.3 24.4-1 36.2-4 8.6-1.7 16.5-6.1 22.6-12.4 5.5-6.6 8.4-15.2 7.9-23.9z m-57.4-172.8c-132.3-1.5-240.9 104.3-242.9 236.6 2 132.3 110.6 238.1 242.9 236.7 132.3 1.5 240.9-104.4 242.9-236.7-1.8-132.4-110.5-238.3-242.9-236.6z m119.5 371c-2.5 4-6.1 7.1-10.3 8.9-4.6 2.3-9.7 3.5-14.8 3.4-6 0.1-12-1.4-17.2-4.5-4.7-3.2-8.8-7.2-12-11.8-4.8-6.6-9.2-13.5-13.2-20.7l-24.1-39.2c-6.5-11.6-14.2-22.5-23-32.4-5.6-6.6-12.7-11.8-20.7-15.1-8.5-2.9-17.4-4.3-26.4-4h-20.8v92.9c0.8 9.6-2.1 19.2-8 26.8-5.8 5.7-13.7 8.7-21.8 8.4-8.5 0.6-16.7-2.7-22.4-8.9-5.7-7.5-8.5-16.8-8-26.3V316c-1-9.9 2.1-19.8 8.6-27.4 7.9-6.4 18-9.4 28.1-8.4h97.6c11.5-0.1 23.1 0.5 34.6 1.7 8.9 0.9 17.6 3.2 25.8 6.7 9.1 4 17.4 9.5 24.7 16.2 7 7 12.5 15.4 16.1 24.7 3.6 9.5 5.5 19.5 5.7 29.6 0.9 19-6 37.6-19 51.5-15.9 14.4-35.6 24-56.8 27.5 11.7 6.2 22 14.6 30.5 24.7 9.6 10.6 18.2 22 25.8 34.1 6.8 10.5 12.7 21.6 17.8 33 3.2 6.3 5.3 13.1 6.3 20.1 1.1 4 0 8.2-2.9 11.2h-0.2z" fill="#EC6C00" p-id="11856"></path></svg>',
        closeIcon: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1729473777752" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18003" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><path d="M759.594667 195.2l90.538666 90.538667L307.072 828.8l-90.538667-90.538667z" fill="#5363D0" p-id="18004"></path><path d="M307.072 195.2L216.533333 285.738667l543.061334 543.061333 90.538666-90.538667z" fill="#5363D0" p-id="18005"></path></svg>',
        onRouteChanged: function(route, showRef) {
          console.log(route, showRef);
        },
        body: [
          { type: "text", content: "\u{1F447}\u7785\u7785\u4ED6\u{1F447}" },
          {
            type: "image",
            src: "https://changweihua.github.io/author.jpg"
          }
        ],
        footer: [
          {
            type: "button",
            content: "\u5565\u90FD\u4E0D\u662F\u5462",
            link: "https://changweihua.github.io"
          }
        ]
      })
    ]
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag),
        whitespace: "preserve"
        // [!code ++] 重点:设置whitespace: 'preserve'是为了保留Markdown中的空格，以便LiteTree可以正确解析lite格式的树数据。
      }
    }
  },
  /* 文档配置 */
  ...docsConfig,
  /* 标头配置 */
  head,
  /* 主题配置 */
  themeConfig,
  markdown,
  metaChunk: true,
  sitemap: {
    hostname: "https://changweihua.github.io",
    lastmodDateOnly: false,
    transformItems: (items) => {
      items.push({
        url: "/extra-page",
        changefreq: "monthly",
        priority: 0.8
      });
      return items;
    }
  },
  rewrites: {
    "^/index.md": "/zh-CN/index.md"
  },
  ignoreDeadLinks: true,
  async transformHead(context) {
    const head2 = handleHeadMeta(context);
    return head2;
  },
  async transformPageData(pageData) {
    const { isNotFound, relativePath } = pageData;
    const { contributors, changelog } = await getChangelogAndContributors(relativePath);
    const CustomAvatars = {
      "changweihua": "2877201"
    };
    const CustomContributors = contributors.map((contributor) => {
      contributor.avatar = `https://avatars.githubusercontent.com/u/${CustomAvatars[contributor.name]}?v=4`;
      return contributor;
    });
    if (isNotFound) {
      pageData.title = "Not Found";
    }
    return {
      CommitData: {
        contributors: CustomContributors,
        changelog,
        commitURL: "https://github.com/changweihua/changweihua.github.io/commit/",
        title: "Changelog"
      }
    };
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9zcmMvdGhlbWUudHMiLCAiLnZpdGVwcmVzcy9zcmMvbmF2cy96aC1DTi5uYXYudHMiLCAiLnZpdGVwcmVzcy9zcmMvbmF2cy9lbi1VUy5uYXYudHMiLCAiLnZpdGVwcmVzcy9zcmMvc2lkZWJhcnMvemgtQ04uc2lkZWJhci50cyIsICIudml0ZXByZXNzL3NyYy9zaWRlYmFycy9lbi1VUy5zaWRlYmFyLnRzIiwgIi52aXRlcHJlc3Mvc3JjL2NvbmZpZ3MvemgtQ04uY29uZmlnLnRzIiwgIi52aXRlcHJlc3Mvc3JjL2NvbmZpZ3MvZW4tVVMuY29uZmlnLnRzIiwgIi52aXRlcHJlc3Mvc3JjL2RvY3MudHMiLCAiLnZpdGVwcmVzcy9zcmMvaGVhZC50cyIsICIudml0ZXByZXNzL3NyYy9tYXJrZG93bi50cyIsICIudml0ZXByZXNzL3BsdWdpbnMvbWFya2Rvd24vaW1hZ2UudHMiLCAiLnZpdGVwcmVzcy9wbHVnaW5zL21hcmtkb3duL3JvdWdoLW1lcm1haWQudHMiLCAiLnZpdGVwcmVzcy9wbHVnaW5zL21hcmtkb3duL21hcmt1cC50cyIsICIudml0ZXByZXNzL2Fzc2V0cy9sYXRleHMvTGFUZVgtRXhwbDMudG1MYW5ndWFnZS5qc29uIiwgIi52aXRlcHJlc3MvY29uZmlnLnRzIiwgIi52aXRlcHJlc3Mvc3JjL3Jzcy50cyIsICIudml0ZXByZXNzL3V0aWxzL2hhbmRsZUhlYWRNZXRhLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFx0aGVtZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovR2l0aHViL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby8udml0ZXByZXNzL3NyYy90aGVtZS50c1wiO2ltcG9ydCB0eXBlIHsgRGVmYXVsdFRoZW1lIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG4vLyBpbXBvcnQgbmF2IGZyb20gXCIuL25hdnMvemhcIjtcclxuLy8gaW1wb3J0IHNpZGViYXIgZnJvbSBcIi4vc2lkZWJhcnMvemgtQ04uc2lkZWJhclwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IHRoZW1lQ29uZmlnOiBEZWZhdWx0VGhlbWUuQ29uZmlnID0ge1xyXG4gIGVkaXRMaW5rOiB7XHJcbiAgICBwYXR0ZXJuOlxyXG4gICAgICBcImh0dHBzOi8vZ2l0aHViLmNvbS9jaGFuZ3dlaWh1YS9jaGFuZ3dlaWh1YS5naXRodWIuaW8vZWRpdC9tYXN0ZXIvLzpwYXRoXCIsXHJcbiAgICB0ZXh0OiBcIkVkaXQgdGhpcyBwYWdlIG9uIEdpdEh1YlwiLFxyXG4gIH0sIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1NEUwQVx1NkIyMVx1NjZGNFx1NjVCMFx1NzY4NFx1NjU4N1x1NjcyQ1x1NTQ4Q1x1NjVFNVx1NjcxRlx1NjgzQ1x1NUYwRlxyXG4gIGxhc3RVcGRhdGVkOiB7XHJcbiAgICB0ZXh0OiBcIlx1NEUwQVx1NkIyMVx1NjZGNFx1NjVCMFx1RkYxQVwiLFxyXG4gICAgZm9ybWF0T3B0aW9uczoge1xyXG4gICAgICBkYXRlU3R5bGU6IFwiZnVsbFwiLFxyXG4gICAgICB0aW1lU3R5bGU6IFwibWVkaXVtXCIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgLy8gdGl0bGVUZW1wbGF0ZTogJzp0aXRsZSAtIEN1c3RvbSBTdWZmaXgnLFxyXG4gIGxvZ286IFwiL2xvZ28ucG5nXCIsXHJcbiAgZGFya01vZGVTd2l0Y2hMYWJlbDogXCJcdTUyMDdcdTYzNjJcdTRFM0JcdTk4OThcIixcclxuICBsaWdodE1vZGVTd2l0Y2hUaXRsZTogXCJcdTZENDVcdTgyNzJcIixcclxuICBkYXJrTW9kZVN3aXRjaFRpdGxlOiBcIlx1NkRGMVx1ODI3MlwiLFxyXG4gIHJldHVyblRvVG9wTGFiZWw6IFwiXHU4RkQ0XHU1NkRFXHU5ODc2XHU5MEU4XCIsXHJcbiAgbGFuZ01lbnVMYWJlbDogXCJcdTkwMDlcdTYyRTlcdThCRURcdThBMDBcIixcclxuICBleHRlcm5hbExpbmtJY29uOiB0cnVlLFxyXG4gIHNvY2lhbExpbmtzOiBbXHJcbiAgICB7XHJcbiAgICAgIGljb246IHtcclxuICAgICAgICBzdmc6ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjAuOTllbVwiIGhlaWdodD1cIjFlbVwiIHZpZXdCb3g9XCIwIDAgMjU2IDI1OS4zXCI+PHBhdGggZmlsbD1cIiM5ZWRjZjJcIiBkPVwiTTIwMC45IDE5OS44YzAgMTMuOS0zMi4yIDI1LjEtNzEuOSAyNS4xcy03MS45LTExLjMtNzEuOS0yNS4xYzAtMTMuOSAzMi4yLTI1LjEgNzEuOS0yNS4xczcxLjkgMTEuMiA3MS45IDI1LjFtMCAwXCIvPjxkZWZzPjxwYXRoIGlkPVwibG9nb3NHaXRodWJPY3RvY2F0MFwiIGQ9XCJNOTguMSAyNDQuOGMxLjYgNy41IDUuNSAxMS45IDkuNCAxNC41aDQxLjFjNS0zLjQgMTAuMS05LjggMTAuMS0yMS44di0zMXMuNi03LjcgNy43LTEwLjJjMCAwIDQuMS0yLjktLjMtNC41YzAgMC0xOS41LTEuNi0xOS41IDE0LjR2MjMuNnMuOCA4LjctMy44IDEyLjN2LTI5LjJzLjMtOS4zIDUuMS0xMi44YzAgMCAzLjItNS43LTMuOC00LjJjMCAwLTEzLjQgMS45LTE0IDE3LjZsLS4zIDMwaC0zLjJsLS4zLTMwYy0uNi0xNS42LTE0LTE3LjYtMTQtMTcuNmMtNy0xLjYtMy44IDQuMi0zLjggNC4yYzQuOCAzLjUgNS4xIDEyLjggNS4xIDEyLjh2MjkuNWMtNC42LTMuMy0zLjgtMTIuNi0zLjgtMTIuNnYtMjMuNmMwLTE2LTE5LjUtMTQuNC0xOS41LTE0LjRjLTQuNSAxLjYtLjMgNC41LS4zIDQuNWM3IDIuNiA3LjcgMTAuMiA3LjcgMTAuMnYyMS43elwiLz48L2RlZnM+PGNsaXBQYXRoIGlkPVwibG9nb3NHaXRodWJPY3RvY2F0MVwiPjx1c2UgaHJlZj1cIiNsb2dvc0dpdGh1Yk9jdG9jYXQwXCIvPjwvY2xpcFBhdGg+PHBhdGggZmlsbD1cIiM3ZGJjZTdcIiBkPVwiTTIwMC45IDE5OS44YzAgMTMuOS0zMi4yIDI1LjEtNzEuOSAyNS4xcy03MS45LTExLjMtNzEuOS0yNS4xYzAtMTMuOSAzMi4yLTI1LjEgNzEuOS0yNS4xczcxLjkgMTEuMiA3MS45IDI1LjFtMCAwXCIgY2xpcC1wYXRoPVwidXJsKCNsb2dvc0dpdGh1Yk9jdG9jYXQxKVwiLz48cGF0aCBmaWxsPVwiIzllZGNmMlwiIGQ9XCJtNDYuOSAxMjUuOWwtMi4xIDcuMnMtLjUgMi42IDEuOSAzLjFjMi42LS4xIDIuNC0yLjUgMi4yLTMuMnptMCAwXCIvPjxwYXRoIGZpbGw9XCIjMDEwMTAxXCIgZD1cIm0yNTUuOCA5NS42bC4yLS45Yy0yMS4xLTQuMi00Mi43LTQuMy01NS44LTMuN2MyLjEtNy43IDIuOC0xNi43IDIuOC0yNi42YzAtMTQuMy01LjQtMjUuNy0xNC0zNC4zYzEuNS00LjkgMy41LTE1LjgtMi0yOS43YzAgMC05LjgtMy4xLTMyLjEgMTEuOGMtOC43LTIuMi0xOC0zLjMtMjcuMy0zLjNjLTEwLjIgMC0yMC41IDEuMy0zMC4yIDMuOUM3NC40LTIuOSA2NC4zLjMgNjQuMy4zYy02LjYgMTYuNS0yLjUgMjguOC0xLjMgMzEuOGMtNy44IDguNC0xMi41IDE5LjEtMTIuNSAzMi4yYzAgOS45IDEuMSAxOC44IDMuOSAyNi41Yy0xMy4yLS41LTM0LS4zLTU0LjQgMy44bC4yLjljMjAuNC00LjEgNDEuNC00LjIgNTQuNS0zLjdjLjYgMS42IDEuMyAzLjIgMiA0LjdjLTEzIC40LTM1LjEgMi4xLTU2LjMgOC4xbC4zLjljMjEuNC02IDQzLjctNy42IDU2LjYtOGM3LjggMTQuNCAyMyAyMy44IDUwLjIgMjYuN2MtMy45IDIuNi03LjggNy05LjQgMTQuNWMtNS4zIDIuNS0yMS45IDguNy0zMS45LTguNWMwIDAtNS42LTEwLjItMTYuMy0xMWMwIDAtMTAuNC0uMi0uNyA2LjVjMCAwIDYuOSAzLjMgMTEuNyAxNS42YzAgMCA2LjMgMjEgMzYuNCAxNC4yVjE3N3MtLjYgNy43LTcuNyAxMC4yYzAgMC00LjIgMi45LjMgNC41YzAgMCAxOS41IDEuNiAxOS41LTE0LjR2LTIzLjZzLS44LTkuNCAzLjgtMTIuNnYzOC44cy0uMyA5LjMtNS4xIDEyLjhjMCAwLTMuMiA1LjcgMy44IDQuMmMwIDAgMTMuNC0xLjkgMTQtMTcuNmwuMy0zOS4zaDMuMmwuMyAzOS4zYy42IDE1LjYgMTQgMTcuNiAxNCAxNy42YzcgMS42IDMuOC00LjIgMy44LTQuMmMtNC44LTMuNS01LjEtMTIuOC01LjEtMTIuOHYtMzguNWM0LjYgMy42IDMuOCAxMi4zIDMuOCAxMi4zdjIzLjZjMCAxNiAxOS41IDE0LjQgMTkuNSAxNC40YzQuNS0xLjYuMy00LjUuMy00LjVjLTctMi42LTcuNy0xMC4yLTcuNy0xMC4ydi0zMWMwLTEyLjEtNS4xLTE4LjUtMTAuMS0yMS44YzI5LTIuOSA0Mi45LTEyLjIgNDkuMy0yNi44YzEyLjcuMyAzNS42IDEuOSA1Ny40IDguMWwuMy0uOWMtMjEuNy02LjEtNDQuNC03LjctNTcuMy04LjFjLjYtMS41IDEuMS0zIDEuNi00LjZjMTMuNC0uNSAzNS4xLS41IDU2LjMgMy43bTAgMFwiLz48cGF0aCBmaWxsPVwiI2Y1Y2NiM1wiIGQ9XCJNMTc0LjYgNjMuN2M2LjIgNS43IDkuOSAxMi41IDkuOSAxOS44YzAgMzQuNC0yNS42IDM1LjMtNTcuMiAzNS4zUzcwLjEgMTE0IDcwLjEgODMuNWMwLTcuMyAzLjYtMTQuMSA5LjgtMTkuN2MxMC4zLTkuNCAyNy43LTQuNCA0Ny40LTQuNHMzNy01LjEgNDcuMyA0LjNtMCAwXCIvPjxwYXRoIGZpbGw9XCIjZmZmXCIgZD1cIk0xMDguMyA4NS4zYzAgOS41LTUuMyAxNy4xLTExLjkgMTcuMXMtMTEuOS03LjctMTEuOS0xNy4xYzAtOS41IDUuMy0xNy4xIDExLjktMTcuMWM2LjYtLjEgMTEuOSA3LjYgMTEuOSAxNy4xbTAgMFwiLz48cGF0aCBmaWxsPVwiI2FmNWM1MVwiIGQ9XCJNMTA0LjUgODUuNWMwIDYuMy0zLjYgMTEuNC03LjkgMTEuNGMtNC40IDAtNy45LTUuMS03LjktMTEuNHMzLjYtMTEuNCA3LjktMTEuNHM3LjkgNS4xIDcuOSAxMS40bTAgMFwiLz48cGF0aCBmaWxsPVwiI2ZmZlwiIGQ9XCJNMTcyLjIgODUuM2MwIDkuNS01LjMgMTcuMS0xMS45IDE3LjFzLTExLjktNy43LTExLjktMTcuMWMwLTkuNSA1LjMtMTcuMSAxMS45LTE3LjFjNi41LS4xIDExLjkgNy42IDExLjkgMTcuMW0wIDBcIi8+PHBhdGggZmlsbD1cIiNhZjVjNTFcIiBkPVwiTTE2OC4zIDg1LjVjMCA2LjMtMy42IDExLjQtNy45IDExLjRjLTQuNCAwLTcuOS01LjEtNy45LTExLjRzMy42LTExLjQgNy45LTExLjRjNC40IDAgNy45IDUuMSA3LjkgMTEuNG0tMzcuOCAxNWMwIDEuNi0xLjMgMy0zIDNjLTEuNiAwLTMtMS4zLTMtM3MxLjMtMyAzLTNjMS42IDAgMyAxLjMgMyAzbS05LjkgNy41Yy0uMi0uNS4xLTEgLjYtMS4yczEgLjEgMS4yLjZjLjggMi4yIDIuOCAzLjYgNS4xIDMuNnM0LjMtMS41IDUuMS0zLjZjLjItLjUuNy0uOCAxLjItLjZzLjguNy42IDEuMmMtMSAyLjktMy44IDQuOS02LjkgNC45cy01LjktMi02LjktNC45bTAgMFwiLz48cGF0aCBmaWxsPVwiI2M0ZTVkOVwiIGQ9XCJNNTQuNSAxMjEuNmMwIC44LS45IDEuNC0yLjEgMS40Yy0xLjEgMC0yLjEtLjYtMi4xLTEuNHMuOS0xLjQgMi4xLTEuNHMyLjEuNiAyLjEgMS40bTUuOCAzLjJjMCAuOC0uOSAxLjQtMi4xIDEuNGMtMS4xIDAtMi4xLS42LTIuMS0xLjRzLjktMS40IDIuMS0xLjRzMi4xLjYgMi4xIDEuNG0zLjUgNC4yYzAgLjgtLjkgMS40LTIuMSAxLjRjLTEuMSAwLTIuMS0uNi0yLjEtMS40cy45LTEuNCAyLjEtMS40YzEuMi0uMSAyLjEuNiAyLjEgMS40bTMuMiA0LjhjMCAuOC0uOSAxLjQtMi4xIDEuNGMtMS4xIDAtMi4xLS42LTIuMS0xLjRzLjktMS40IDIuMS0xLjRjMS4yLS4xIDIuMS42IDIuMSAxLjRtMy41IDQuNGMwIC44LS45IDEuNC0yLjEgMS40Yy0xLjEgMC0yLjEtLjYtMi4xLTEuNHMuOS0xLjQgMi4xLTEuNHMyLjEuNiAyLjEgMS40bTQuOCAzLjljMCAuOC0uOSAxLjQtMi4xIDEuNGMtMS4xIDAtMi4xLS42LTIuMS0xLjRzLjktMS40IDIuMS0xLjRjMS4yLS4xIDIuMS42IDIuMSAxLjRtNi43IDIuNWMwIC44LS45IDEuNC0yLjEgMS40Yy0xLjEgMC0yLjEtLjYtMi4xLTEuNHMuOS0xLjQgMi4xLTEuNHMyLjEuNiAyLjEgMS40bTYuNyAwYzAgLjgtLjkgMS40LTIuMSAxLjRjLTEuMSAwLTIuMS0uNi0yLjEtMS40cy45LTEuNCAyLjEtMS40czIuMS42IDIuMSAxLjRtNi44LTEuMWMwIC44LS45IDEuNC0yLjEgMS40Yy0xLjEgMC0yLjEtLjYtMi4xLTEuNHMuOS0xLjQgMi4xLTEuNGMxLjEgMCAyLjEuNiAyLjEgMS40bTAgMFwiLz48L3N2Zz4nLFxyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9jaGFuZ3dlaWh1YVwiLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWNvbjoge1xyXG4gICAgICAgIHN2ZzogJzxzdmcgdD1cIjE2OTEwMzcwNDg2MDBcIiBjbGFzcz1cImljb25cIiB2aWV3Qm94PVwiMCAwIDEwMjQgMTAyNFwiIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgcC1pZD1cIjI1ODRcIiB3aWR0aD1cIjEyOFwiIGhlaWdodD1cIjEyOFwiPjxwYXRoIGQ9XCJNMjI4LjcgNjQzLjljLTAuMSAwLjEtMC4yIDAuMy0wLjMgMC40IDMuOS00LjQgOC05IDEyLTEzLjUtNy41IDguNC0xMS43IDEzLjEtMTEuNyAxMy4xelwiIGZpbGw9XCIjMTU5MEU5XCIgcC1pZD1cIjI1ODVcIj48L3BhdGg+PHBhdGggZD1cIk04OTQgMjk4LjFsMjUuNi0xNS4xYzEwLjQtNi4xIDkuMS0yMS41LTIuMS0yNS45bC0xMi4zLTQuOGMtMTgtNy4xLTM0LjItMTguMi00Ni43LTMzLTE1LjctMTguNS00NC43LTQ1LjEtOTAuOS02MC44LTUyLjctMTgtMTQyLjktMTQuNC0xOTMuMi0xMC41LTE1LjkgMS4yLTI1IDE4LjQtMTcuNCAzMi41IDQyLjYgNzguNiAxNi43IDExNC4zLTUuNyAxNDAuNy0zNC4zIDQwLjQtOTcuNCAxMTIuMi0xNjAuNyAxODMuNiAyMS45LTI0LjUgNDEuOC00Ni44IDU4LjEtNjUuMSAzNi40LTQwLjggOTEuMy02MS41IDE0NS4xLTUxLjcgMTcxLjUgMzEuMyAxOTEgMjUzLjQtOS4yIDM4NS42IDI2LjEtMS40IDUyLjYtMy4zIDc5LjItNiAyNTIuNi0yNiAyNzIuNi0yMzIuMSAyMTgtMzMzLjktMTkuNC0zNi4xLTIyLjItNjAuNS0yMC4xLTgzLjkgMi0yMS41IDEzLjgtNDAuOCAzMi4zLTUxLjd6XCIgZmlsbD1cIiM5OUMyMzZcIiBwLWlkPVwiMjU4NlwiPjwvcGF0aD48cGF0aCBkPVwiTTIxMi44IDcwNC41QzI0MS4xIDY3Mi45IDMxNiA1ODkgMzkwLjcgNTA0LjdjLTU0LjYgNjEuMi0xMjEuOCAxMzYuNy0xNzcuOSAxOTkuOHpcIiBmaWxsPVwiIzE1OTBFOVwiIHAtaWQ9XCIyNTg3XCI+PC9wYXRoPjxwYXRoIGQ9XCJNMjE2LjMgNzU4LjZjLTE5LjUtMi41LTI4LjItMjUuNi0xNS41LTQwLjYtNTEuNyA1OC4zLTkxLjcgMTAzLjUtOTkuMSAxMTIuNi0yNC4xIDI5LjUgMjQ3LjcgOTcuOSA0ODIuNi01Ni44IDAuMS0wLjEgMC4zLTAuMiAwLjQtMC4zLTE1Ni41IDguMi0yOTguNS01LjktMzY4LjQtMTQuOXpcIiBmaWxsPVwiI0NBQzEzNFwiIHAtaWQ9XCIyNTg4XCI+PC9wYXRoPjxwYXRoIGQ9XCJNNTkzLjkgMzg3LjljLTUzLjgtOS44LTEwOC43IDEwLjktMTQ1LjEgNTEuNy0xNi4zIDE4LjItMzYuMiA0MC41LTU4LjEgNjUuMUMzMTYgNTg5IDI0MS4xIDY3Mi45IDIxMi44IDcwNC41Yy00LjEgNC42LTguMSA5LjEtMTIgMTMuNS0xMi43IDE0LjktNCAzOCAxNS41IDQwLjYgNjkuOSA5IDIxMS45IDIzLjEgMzY4LjMgMTUgMjAwLjItMTMyLjMgMTgwLjgtMzU0LjQgOS4zLTM4NS43elwiIGZpbGw9XCIjMDI5RjQwXCIgcC1pZD1cIjI1ODlcIj48L3BhdGg+PC9zdmc+JyxcclxuICAgICAgfSxcclxuICAgICAgbGluazogXCJodHRwczovL3d3dy55dXF1ZS5jb20vY2hhbmd3ZWlodWFcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGljb246IHtcclxuICAgICAgICBzdmc6ICc8c3ZnIHQ9XCIxNjkxMDM3MzU4NzQ0XCIgY2xhc3M9XCJpY29uXCIgdmlld0JveD1cIjAgMCAxMDI0IDEwMjRcIiB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHAtaWQ9XCI3NjQwXCIgd2lkdGg9XCIxMjhcIiBoZWlnaHQ9XCIxMjhcIj48cGF0aCBkPVwiTTExNy4xNDk3MzcgOTA2Ljg1MDI2M1YxMTcuMTYwMDgxaDc4OS42OTAxODJ2Nzg5LjY5MDE4MnogbTE0OC41MjEzNzQtNjQxLjcwNjY2N3Y0OTIuNTMzNjU3aDI0OC44NzMzNzRWMzY3Ljg0MzU1NmgxNDUuMDI1MjkzdjM4OS45MDYxMDFoOTguNzM1MzIxVjI2NS4xNDM1OTZ6XCIgZmlsbD1cIiNDQjM4MzdcIiBwLWlkPVwiNzY0MVwiPjwvcGF0aD48L3N2Zz4nLFxyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9+Y2hhbmd3ZWlodWFcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGljb246IHtcclxuICAgICAgICBzdmc6ICc8c3ZnIHQ9XCIxNjkyNTgwOTkwODMzXCIgY2xhc3M9XCJpY29uXCIgdmlld0JveD1cIjAgMCAxMTI5IDEwMjRcIiB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHAtaWQ9XCI0NDU4XCIgd2lkdGg9XCIxMjhcIiBoZWlnaHQ9XCIxMjhcIj48cGF0aCBkPVwiTTIzNC45MDkgOS42NTZhODAuNDY4IDgwLjQ2OCAwIDAgMSA2OC4zOTggMCAxNjcuMzc0IDE2Ny4zNzQgMCAwIDEgNDEuODQzIDMwLjU3OGwxNjAuOTM3IDE0MC44MmgxMTUuMDdsMTYwLjkzNi0xNDAuODJhMTY4Ljk4MyAxNjguOTgzIDAgMCAxIDQxLjg0My0zMC41NzhBODAuNDY4IDgwLjQ2OCAwIDAgMSA5MzAuOTYgNzYuNDQ1YTgwLjQ2OCA4MC40NjggMCAwIDEtMTcuNzAzIDUzLjkxNCA0NDkuODE4IDQ0OS44MTggMCAwIDEtMzUuNDA2IDMyLjE4NyAyMzIuNTUzIDIzMi41NTMgMCAwIDEtMjIuNTMxIDE4LjUwOGgxMDAuNTg1YTE3MC41OTMgMTcwLjU5MyAwIDAgMSAxMTguMjg5IDUzLjEwOSAxNzEuMzk3IDE3MS4zOTcgMCAwIDEgNTMuOTE0IDExOC4yODh2NDYyLjY5M2EzMjUuODk3IDMyNS44OTcgMCAwIDEtNC4wMjQgNzAuMDA3IDE3OC42NCAxNzguNjQgMCAwIDEtODAuNDY4IDExMi42NTYgMTczLjAwNyAxNzMuMDA3IDAgMCAxLTkyLjUzOSAyNS43NWgtNzM4LjdhMzQxLjE4NiAzNDEuMTg2IDAgMCAxLTcyLjQyMS00LjAyNEExNzcuODM1IDE3Ny44MzUgMCAwIDEgMjguOTEgOTM5LjA2NWExNzIuMjAyIDE3Mi4yMDIgMCAwIDEtMjcuMzYtOTIuNTM5VjM4OC42NjJhMzYwLjQ5OCAzNjAuNDk4IDAgMCAxIDAtNjYuNzg5QTE3Ny4wMyAxNzcuMDMgMCAwIDEgMTYyLjQ4NyAxNzguNjRoMTA1LjQxNGMtMTYuODk5LTEyLjA3LTMxLjM4My0yNi41NTUtNDYuNjcyLTM5LjQzYTgwLjQ2OCA4MC40NjggMCAwIDEtMjUuNzUtNjUuOTg0IDgwLjQ2OCA4MC40NjggMCAwIDEgMzkuNDMtNjMuNTdNMjE2LjQgMzIxLjg3M2E4MC40NjggODAuNDY4IDAgMCAwLTYzLjU3IDU3LjkzNyAxMDguNjMyIDEwOC42MzIgMCAwIDAgMCAzMC41Nzh2MzgwLjYxNWE4MC40NjggODAuNDY4IDAgMCAwIDU1LjUyMyA4MC40NjkgMTA2LjIxOCAxMDYuMjE4IDAgMCAwIDM0LjYwMSA1LjYzMmg2NTQuMjA4YTgwLjQ2OCA4MC40NjggMCAwIDAgNzYuNDQ0LTQ3LjQ3NiAxMTIuNjU2IDExMi42NTYgMCAwIDAgOC4wNDctNTMuMTA5di0zNTQuMDZhMTM1LjE4NyAxMzUuMTg3IDAgMCAwIDAtMzguNjI1IDgwLjQ2OCA4MC40NjggMCAwIDAtNTIuMzA0LTU0LjcxOSAxMjkuNTU0IDEyOS41NTQgMCAwIDAtNDkuODktNy4yNDJIMjU0LjIyYTI2OC43NjQgMjY4Ljc2NCAwIDAgMC0zNy44MiAweiBtMCAwXCIgZmlsbD1cIiMyMEIwRTNcIiBwLWlkPVwiNDQ1OVwiPjwvcGF0aD48cGF0aCBkPVwiTTM0OC4zNjkgNDQ3LjQwNGE4MC40NjggODAuNDY4IDAgMCAxIDU1LjUyMyAxOC41MDcgODAuNDY4IDgwLjQ2OCAwIDAgMSAyOC4xNjQgNTkuNTQ3djgwLjQ2OGE4MC40NjggODAuNDY4IDAgMCAxLTE2LjA5NCA1MS41IDgwLjQ2OCA4MC40NjggMCAwIDEtMTMxLjk2OC05LjY1NiAxMDQuNjA5IDEwNC42MDkgMCAwIDEtMTAuNDYtNTQuNzE5di04MC40NjhhODAuNDY4IDgwLjQ2OCAwIDAgMSA3MC4wMDctNjcuNTkzeiBtNDE2LjAyIDBhODAuNDY4IDgwLjQ2OCAwIDAgMSA4Ni4xMDIgNzUuNjR2ODAuNDY4YTk0LjE0OCA5NC4xNDggMCAwIDEtMTIuMDcgNTMuMTEgODAuNDY4IDgwLjQ2OCAwIDAgMS0xMzIuNzczIDAgOTUuNzU3IDk1Ljc1NyAwIDAgMS0xMi44NzUtNTcuMTMzVjUxOS4wMmE4MC40NjggODAuNDY4IDAgMCAxIDcwLjAwNy03MC44MTJ6IG0wIDBcIiBmaWxsPVwiIzIwQjBFM1wiIHAtaWQ9XCI0NDYwXCI+PC9wYXRoPjwvc3ZnPicsXHJcbiAgICAgIH0sXHJcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly9zcGFjZS5iaWxpYmlsaS5jb20vNTQ0MTE2NTAwXCIsXHJcbiAgICB9LFxyXG4gIF0sXHJcbiAgLy8gaTE4blx1OERFRlx1NzUzMVxyXG4gIGkxOG5Sb3V0aW5nOiB0cnVlLFxyXG4gIHNlYXJjaDoge1xyXG4gICAgcHJvdmlkZXI6IFwibG9jYWxcIixcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgbG9jYWxlczoge1xyXG4gICAgICAgIFwiemgtQ05cIjoge1xyXG4gICAgICAgICAgdHJhbnNsYXRpb25zOiB7XHJcbiAgICAgICAgICAgIGJ1dHRvbjoge1xyXG4gICAgICAgICAgICAgIGJ1dHRvblRleHQ6IFwiXHU2NDFDXHU3RDIyXHU2NTg3XHU2ODYzXCIsXHJcbiAgICAgICAgICAgICAgYnV0dG9uQXJpYUxhYmVsOiBcIlx1NjQxQ1x1N0QyMlx1NjU4N1x1Njg2M1wiLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb2RhbDoge1xyXG4gICAgICAgICAgICAgIG5vUmVzdWx0c1RleHQ6IFwiXHU2NUUwXHU2Q0Q1XHU2MjdFXHU1MjMwXHU3NkY4XHU1MTczXHU3RUQzXHU2NzlDXCIsXHJcbiAgICAgICAgICAgICAgZGlzcGxheURldGFpbHM6IFwiXHU2NjNFXHU3OTNBXHU4QkU2XHU3RUM2XHU0RkUxXHU2MDZGXCIsXHJcbiAgICAgICAgICAgICAgcmVzZXRCdXR0b25UaXRsZTogXCJcdTZFMDVcdTk2NjRcdTY3RTVcdThCRTJcdTY3NjFcdTRFRjZcIixcclxuICAgICAgICAgICAgICBiYWNrQnV0dG9uVGl0bGU6IFwiXHU4RkQ0XHU1NkRFXCIsXHJcbiAgICAgICAgICAgICAgZm9vdGVyOiB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RUZXh0OiBcIlx1OTAwOVx1NjJFOVwiLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0S2V5QXJpYUxhYmVsOiBcImVudGVyXCIsXHJcbiAgICAgICAgICAgICAgICBuYXZpZ2F0ZVRleHQ6IFwiXHU1MjA3XHU2MzYyXCIsXHJcbiAgICAgICAgICAgICAgICBuYXZpZ2F0ZVVwS2V5QXJpYUxhYmVsOiBcInVwIGFycm93XCIsXHJcbiAgICAgICAgICAgICAgICBuYXZpZ2F0ZURvd25LZXlBcmlhTGFiZWw6IFwiZG93biBhcnJvd1wiLFxyXG4gICAgICAgICAgICAgICAgY2xvc2VUZXh0OiBcIlx1NTE3M1x1OTVFRFwiLFxyXG4gICAgICAgICAgICAgICAgY2xvc2VLZXlBcmlhTGFiZWw6IFwiZXNjYXBlXCIsXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgLy8gX3JlbmRlcihzcmMsIGVudiwgbWQpIHtcclxuICAgICAgLy8gICBjb25zdCBodG1sID0gbWQucmVuZGVyKHNyYywgZW52KTtcclxuICAgICAgLy8gICBpZiAoZW52LmZyb250bWF0dGVyPy5zZWFyY2ggPT09IGZhbHNlKSByZXR1cm4gXCJcIjtcclxuICAgICAgLy8gICAvLyBcdTRFQ0VcdTY0MUNcdTdEMjJcdTRFMkRcdTYzOTJcdTk2NjRcdTk4NzVcdTk3NjJcclxuICAgICAgLy8gICBpZiAoZW52LnJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKFwic29tZS9wYXRoXCIpKSByZXR1cm4gXCJcIjtcclxuICAgICAgLy8gICAvLyBcdThGNkNcdTYzNjJcdTUxODVcdTVCQjlcdTIwMTRcdTIwMTRcdTZERkJcdTUyQTBcdTk1MUFcdTcwQjlcclxuICAgICAgLy8gICBpZiAoZW52LmZyb250bWF0dGVyPy50aXRsZSlcclxuICAgICAgLy8gICAgIHJldHVybiBtZC5yZW5kZXIoYCMgJHtlbnYuZnJvbnRtYXR0ZXIudGl0bGV9YCkgKyBodG1sO1xyXG4gICAgICAvLyAgIHJldHVybiBodG1sO1xyXG4gICAgICAvLyB9LFxyXG4gICAgICAvLyAvLyBcdTY0MUNcdTdEMjJcdTkxNERcdTdGNkVcclxuICAgICAgLy8gbWluaVNlYXJjaDoge1xyXG4gICAgICAvLyAgIC8qKlxyXG4gICAgICAvLyAgICAqIEB0eXBlIHtQaWNrPGltcG9ydCgnbWluaXNlYXJjaCcpLk9wdGlvbnMsICdleHRyYWN0RmllbGQnIHwgJ3Rva2VuaXplJyB8ICdwcm9jZXNzVGVybSc+fVxyXG4gICAgICAvLyAgICAqL1xyXG4gICAgICAvLyAgIG9wdGlvbnM6IHtcclxuICAgICAgLy8gICAgIC8qIC4uLiAqL1xyXG4gICAgICAvLyAgIH0sXHJcbiAgICAgIC8vICAgLyoqXHJcbiAgICAgIC8vICAgICogQHR5cGUge2ltcG9ydCgnbWluaXNlYXJjaCcpLlNlYXJjaE9wdGlvbnN9XHJcbiAgICAgIC8vICAgICogQGRlZmF1bHRcclxuICAgICAgLy8gICAgKiB7IGZ1enp5OiAwLjIsIHByZWZpeDogdHJ1ZSwgYm9vc3Q6IHsgdGl0bGU6IDQsIHRleHQ6IDIsIHRpdGxlczogMSB9IH1cclxuICAgICAgLy8gICAgKi9cclxuICAgICAgLy8gICBzZWFyY2hPcHRpb25zOiB7XHJcbiAgICAgIC8vICAgICAvKiAuLi4gKi9cclxuICAgICAgLy8gICB9LFxyXG4gICAgICAvLyB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIC8vIHNpZGViYXIsXHJcbiAgLy8gYWxnb2xpYToge1xyXG4gIC8vICAgYXBwSWQ6IFwiSUk4MEc0RUxUQVwiLCAvLyBcdTk3MDBcdTg5ODFcdTY2RkZcdTYzNjJcclxuICAvLyAgIGFwaUtleTogXCI5NmFlOWI2OGYwOWZkMDdjYmY1OGNiZGYzOWI5OWNiYVwiLCAvLyBcdTk3MDBcdTg5ODFcdTY2RkZcdTYzNjJcclxuICAvLyAgIGluZGV4TmFtZTogXCJjbW9ub19uZXRcIiwgLy8gXHU5NzAwXHU4OTgxXHU2NkZGXHU2MzYyXHJcbiAgLy8gICBwbGFjZWhvbGRlcjogXCJcdThCRjdcdThGOTNcdTUxNjVcdTUxNzNcdTk1MkVcdThCQ0RcIixcclxuICAvLyAgIC8vIHNlYXJjaFBhcmFtZXRlcnM/OiBTZWFyY2hPcHRpb25zXHJcbiAgLy8gICAvLyBkaXNhYmxlVXNlclBlcnNvbmFsaXphdGlvbj86IGJvb2xlYW5cclxuICAvLyAgIC8vIGluaXRpYWxRdWVyeT86IHN0cmluZ1xyXG4gIC8vICAgbG9jYWxlczoge1xyXG4gIC8vICAgICB6aDoge1xyXG4gIC8vICAgICAgIHRyYW5zbGF0aW9uczoge1xyXG4gIC8vICAgICAgICAgYnV0dG9uOiB7XHJcbiAgLy8gICAgICAgICAgIGJ1dHRvblRleHQ6IFwiXHU2NDFDXHU3RDIyXCIsXHJcbiAgLy8gICAgICAgICB9LFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgIH0sXHJcbiAgLy8gICB9LFxyXG4gIC8vICAgLy8gXHU2NDFDXHU3RDIyXHU5MTREXHU3RjZFXHVGRjA4XHU0RThDXHU5MDA5XHU0RTAwXHVGRjA5XHJcbiAgLy8gICAvLyBzZWFyY2g6IHtcclxuICAvLyAgIC8vICAgLy8gXHU2NzJDXHU1NzMwXHU3OUJCXHU3RUJGXHU2NDFDXHU3RDIyXHJcbiAgLy8gICAvLyAgIHByb3ZpZGVyOiBcImxvY2FsXCIsXHJcbiAgLy8gICAvLyAgIC8vIFx1NTkxQVx1OEJFRFx1OEEwMFx1NjQxQ1x1N0QyMlx1OTE0RFx1N0Y2RVxyXG4gIC8vICAgLy8gICBvcHRpb25zOiB7XHJcbiAgLy8gICAvLyAgICAgbG9jYWxlczoge1xyXG4gIC8vICAgLy8gICAgICAgLyogXHU5RUQ4XHU4QkE0XHU4QkVEXHU4QTAwICovXHJcbiAgLy8gICAvLyAgICAgICB6aDoge1xyXG4gIC8vICAgLy8gICAgICAgICB0cmFuc2xhdGlvbnM6IHtcclxuICAvLyAgIC8vICAgICAgICAgICBidXR0b246IHtcclxuICAvLyAgIC8vICAgICAgICAgICAgIGJ1dHRvblRleHQ6IFwiXHU2NDFDXHU3RDIyXCIsXHJcbiAgLy8gICAvLyAgICAgICAgICAgICBidXR0b25BcmlhTGFiZWw6IFwiXHU2NDFDXHU3RDIyXHU2NTg3XHU2ODYzXCIsXHJcbiAgLy8gICAvLyAgICAgICAgICAgfSxcclxuICAvLyAgIC8vICAgICAgICAgICBtb2RhbDoge1xyXG4gIC8vICAgLy8gICAgICAgICAgICAgbm9SZXN1bHRzVGV4dDogXCJcdTY1RTBcdTZDRDVcdTYyN0VcdTUyMzBcdTc2RjhcdTUxNzNcdTdFRDNcdTY3OUNcIixcclxuICAvLyAgIC8vICAgICAgICAgICAgIHJlc2V0QnV0dG9uVGl0bGU6IFwiXHU2RTA1XHU5NjY0XHU2N0U1XHU4QkUyXHU3RUQzXHU2NzlDXCIsXHJcbiAgLy8gICAvLyAgICAgICAgICAgICBmb290ZXI6IHtcclxuICAvLyAgIC8vICAgICAgICAgICAgICAgc2VsZWN0VGV4dDogXCJcdTkwMDlcdTYyRTlcIixcclxuICAvLyAgIC8vICAgICAgICAgICAgICAgbmF2aWdhdGVUZXh0OiBcIlx1NTIwN1x1NjM2MlwiLFxyXG4gIC8vICAgLy8gICAgICAgICAgICAgfSxcclxuICAvLyAgIC8vICAgICAgICAgICB9LFxyXG4gIC8vICAgLy8gICAgICAgICB9LFxyXG4gIC8vICAgLy8gICAgICAgfSxcclxuICAvLyAgIC8vICAgICAgIGVuOiB7XHJcbiAgLy8gICAvLyAgICAgICAgIHRyYW5zbGF0aW9uczoge1xyXG4gIC8vICAgLy8gICAgICAgICAgIGJ1dHRvbjoge1xyXG4gIC8vICAgLy8gICAgICAgICAgICAgYnV0dG9uVGV4dDogXCJTZWFyY2hcIixcclxuICAvLyAgIC8vICAgICAgICAgICAgIGJ1dHRvbkFyaWFMYWJlbDogXCJTZWFyY2ggZm9yIERvY3VtZW50c1wiLFxyXG4gIC8vICAgLy8gICAgICAgICAgIH0sXHJcbiAgLy8gICAvLyAgICAgICAgICAgbW9kYWw6IHtcclxuICAvLyAgIC8vICAgICAgICAgICAgIG5vUmVzdWx0c1RleHQ6IFwiVW5hYmxlIHRvIGZpbmQgcmVsZXZhbnQgcmVzdWx0c1wiLFxyXG4gIC8vICAgLy8gICAgICAgICAgICAgcmVzZXRCdXR0b25UaXRsZTogXCJDbGVhciBRdWVyeSBSZXN1bHRzXCIsXHJcbiAgLy8gICAvLyAgICAgICAgICAgICBmb290ZXI6IHtcclxuICAvLyAgIC8vICAgICAgICAgICAgICAgc2VsZWN0VGV4dDogXCJzZWxlY3RcIixcclxuICAvLyAgIC8vICAgICAgICAgICAgICAgbmF2aWdhdGVUZXh0OiBcInN3aXRjaFwiLFxyXG4gIC8vICAgLy8gICAgICAgICAgICAgfSxcclxuICAvLyAgIC8vICAgICAgICAgICB9LFxyXG4gIC8vICAgLy8gICAgICAgICB9LFxyXG4gIC8vICAgLy8gICAgICAgfSxcclxuICAvLyAgIC8vICAgICB9LFxyXG4gIC8vICAgLy8gICB9LFxyXG4gIC8vIH0sXHJcbiAgLy8gLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU2MjY5XHU1QzU1OiBcdTY1ODdcdTdBRTBcdTcyNDhcdTY3NDNcdTkxNERcdTdGNkVcclxuICAvLyBjb3B5cmlnaHRDb25maWc6IHtcclxuICAvLyAgIGxpY2Vuc2U6ICdcdTdGNzJcdTU0MEQtXHU3NkY4XHU1NDBDXHU2NUI5XHU1RjBGXHU1MTcxXHU0RUFCIDQuMCBcdTU2RkRcdTk2NDUgKENDIEJZLVNBIDQuMCknLFxyXG4gIC8vICAgbGljZW5zZUxpbms6ICdodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9saWNlbnNlcy9ieS1zYS80LjAvJ1xyXG4gIC8vIH0sXHJcbiAgLy8gLy8gXHU4MUVBXHU1QjlBXHU0RTQ5XHU2MjY5XHU1QzU1OiBcdTk4NzVcdTgxMUFcdTkxNERcdTdGNkVcclxuICAvLyBmb290ZXJDb25maWc6IHtcclxuICAvLyAgIHNob3dGb290ZXI6IHRydWUsIC8vIFx1NjYyRlx1NTQyNlx1NjYzRVx1NzkzQVx1OTg3NVx1ODExQVxyXG4gIC8vICAgaWNwUmVjb3JkQ29kZTogJ1x1NkQyNUlDUFx1NTkwNzIwMjIwMDU4NjRcdTUzRjctMicsIC8vIElDUFx1NTkwN1x1Njg0OFx1NTNGN1xyXG4gIC8vICAgcHVibGljU2VjdXJpdHlSZWNvcmRDb2RlOiAnXHU2RDI1XHU1MTZDXHU3RjUxXHU1Qjg5XHU1OTA3MTIwMTEyMDIwMDA2NzdcdTUzRjcnLCAvLyBcdTgwNTRcdTdGNTFcdTU5MDdcdTY4NDhcdTUzRjdcclxuICAvLyAgIGNvcHlyaWdodDogYENvcHlyaWdodCBcdTAwQTkgMjAxOS0ke25ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKX0gQ2hhcmxlczdjYCAvLyBcdTcyNDhcdTY3NDNcdTRGRTFcdTYwNkZcclxuICAvLyB9XHJcbn07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxuYXZzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXG5hdnNcXFxcemgtQ04ubmF2LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL25hdnMvemgtQ04ubmF2LnRzXCI7aW1wb3J0IHsgRGVmYXVsdFRoZW1lIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG4vLyAsIGFjdGl2ZU1hdGNoOiBcIl4vJHxeL2luZGV4L1wiXHJcbmV4cG9ydCBjb25zdCBnZXRaaENOTmF2OiAoKSA9PiBEZWZhdWx0VGhlbWUuTmF2SXRlbVtdID0gKCkgPT4ge1xyXG4gIHJldHVybiBbXHJcbiAgICB7IHRleHQ6IFwiXHU5OTk2XHU5ODc1XCIsIGxpbms6IFwiL3poLUNOL1wiIH0sXHJcbiAgICB7XHJcbiAgICAgIHRleHQ6IFwiXHU1MzVBXHU1QkEyXCIsXHJcbiAgICAgIGxpbms6IFwiL3poLUNOL2Jsb2cvXCJcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHRleHQ6IFwiXHU1RjUyXHU2ODYzXCIsXHJcbiAgICAgIGxpbms6IFwiL3poLUNOL2FyY2hpdmVzLm1kXCJcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHRleHQ6IFwiXHU2ODA3XHU3QjdFXCIsXHJcbiAgICAgIGxpbms6IFwiL3poLUNOL3RhZ3MubWRcIlxyXG4gICAgfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgdGV4dDogXCJcdTUyMDZcdTdDN0JcIixcclxuICAgIC8vICAgbGluazogXCIvdGFncy5tZFwiLFxyXG4gICAgLy8gICBhY3RpdmVNYXRjaDogXCJeL3RhZ3NcIixcclxuICAgIC8vIH0sXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgIHRleHQ6IFwiXHU4QkZFXHU3QTBCXCIsXHJcbiAgICAvLyAgIGxpbms6IFwiL2NvdXJzZS9cIixcclxuICAgIC8vICAgYWN0aXZlTWF0Y2g6IFwiXi9jb3Vyc2UvXCIsXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICB0ZXh0OiBcIlx1NTE3M1x1NEU4RVwiLFxyXG4gICAgLy8gICBsaW5rOiBcIi9hYm91dC9pbmRleC5tZFwiLFxyXG4gICAgLy8gICBhY3RpdmVNYXRjaDogXCJeL2Fib3V0L1wiLFxyXG4gICAgLy8gfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgdGV4dDogXCJcdTY1ODdcdTdBRTBcdTUyMDZcdTdDN0JcIixcclxuICAgIC8vICAgaXRlbXM6IFtcclxuICAgIC8vICAgICB7XHJcbiAgICAvLyAgICAgICBpdGVtczogW1xyXG4gICAgLy8gICAgICAgICB7IHRleHQ6IFwiM0QgXHU1RjAwXHU1M0QxXCIsIGxpbms6IFwiL2NhdGVnb3J5L3RocmVlM2QubWRcIiB9LFxyXG4gICAgLy8gICAgICAgICB7IHRleHQ6IFwiXHU1REU1XHU1MTc3Jlx1NUU3M1x1NTNGMFwiLCBsaW5rOiBcIi9jYXRlZ29yeS90b29sLm1kXCIgfSxcclxuICAgIC8vICAgICAgIF0sXHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vICAgICB7XHJcbiAgICAvLyAgICAgICBpdGVtczogW1xyXG4gICAgLy8gICAgICAgICB7IHRleHQ6IFwiRmx1dHRlclwiLCBsaW5rOiBcIi9jYXRlZ29yeS9mbHV0dGVyLm1kXCIgfSxcclxuICAgIC8vICAgICAgICAgeyB0ZXh0OiBcIlx1NUZBRVx1NEZFMVx1NUMwRlx1N0EwQlx1NUU4RlwiLCBsaW5rOiBcIi9jYXRlZ29yeS93ZWNoYXQubWRcIiB9LFxyXG4gICAgLy8gICAgICAgICB7IHRleHQ6IFwiRG90TkVUXCIsIGxpbms6IFwiL2NhdGVnb3J5L2RvdG5ldC5tZFwiIH0sXHJcbiAgICAvLyAgICAgICBdLFxyXG4gICAgLy8gICAgIH0sXHJcbiAgICAvLyAgICAge1xyXG4gICAgLy8gICAgICAgaXRlbXM6IFtcclxuICAgIC8vICAgICAgICAgeyB0ZXh0OiBcIlZ1ZUpTXCIsIGxpbms6IFwiL2NhdGVnb3J5L3Z1ZS5tZFwiIH0sXHJcbiAgICAvLyAgICAgICAgIHsgdGV4dDogXCJUeXBlU2NyaXB0XCIsIGxpbms6IFwiL2NhdGVnb3J5L3R5cGVzY3JpcHQubWRcIiB9LFxyXG4gICAgLy8gICAgICAgXSxcclxuICAgIC8vICAgICB9LFxyXG4gICAgLy8gICBdLFxyXG4gICAgLy8gfSxcclxuICBdXHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXG5hdnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcbmF2c1xcXFxlbi1VUy5uYXYudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvbmF2cy9lbi1VUy5uYXYudHNcIjtpbXBvcnQgeyBEZWZhdWx0VGhlbWUgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcbi8vICwgYWN0aXZlTWF0Y2g6IFwiXi9lbi8kfF4vZW4vaW5kZXgvJFwiXHJcbmV4cG9ydCBjb25zdCBnZXRFblVTTmF2OiAoKSA9PiBEZWZhdWx0VGhlbWUuTmF2SXRlbVtdID0gKCkgPT4ge1xyXG4gIHJldHVybiBbXHJcbiAgICB7IHRleHQ6IFwiSG9tZVwiLCBsaW5rOiBcIi9lbi1VUy9cIiB9LFxyXG4gICAge1xyXG4gICAgICB0ZXh0OiBcIkJsb2dcIixcclxuICAgICAgbGluazogXCIvZW4tVVMvYmxvZy9cIlxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdGV4dDogXCJBcmNoaXZlXCIsXHJcbiAgICAgIGxpbms6IFwiL2VuLVVTL2FyY2hpdmVzLm1kXCJcclxuICAgIH0sXHJcbiAgXVxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxzaWRlYmFyc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxzaWRlYmFyc1xcXFx6aC1DTi5zaWRlYmFyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL3NpZGViYXJzL3poLUNOLnNpZGViYXIudHNcIjtpbXBvcnQgeyBEZWZhdWx0VGhlbWUgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0WmhDTlNpZGViYXI6ICgpID0+IERlZmF1bHRUaGVtZS5TaWRlYmFyID0gKCkgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBhcnRpY2xlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJFeGFtcGxlc1wiLFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7IHRleHQ6IFwiTWFya2Rvd24gRXhhbXBsZXNcIiwgbGluazogXCIvbWFya2Rvd24tZXhhbXBsZXNcIiB9LFxyXG4gICAgICAgICAgeyB0ZXh0OiBcIlJ1bnRpbWUgQVBJIEV4YW1wbGVzXCIsIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICAnL2NvdXJzZS90eXBlc2NyaXB0Lyc6IFtcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiVHlwZVNjcmlwdFwiLFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7IHRleHQ6IFwiVHlwZVNjcmlwdFx1NTE4NVx1N0Y2RVx1N0M3Qlx1NTc4QlwiLCBsaW5rOiBcIi9jb3Vyc2UvdHlwZXNjcmlwdC9wcmVzZXRfdHlwZVwiIH0sXHJcbiAgICAgICAgICB7IHRleHQ6IFwiVHlwZVNjcmlwdFx1NjJEM1x1NUM1NVwiLCBsaW5rOiBcIi9jb3Vyc2UvdHlwZXNjcmlwdC9leHRlbnNpb25fdHlwZVwiIH0sXHJcbiAgICAgICAgICB7IHRleHQ6IFwiXHU5RUQ4XHU4QkE0IHRzY29uZmlnLmpzb25cIiwgbGluazogXCIvY291cnNlL3R5cGVzY3JpcHQvZGVmYXVsdF90c2NvbmZpZ1wiIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICAnL2NvdXJzZS9hbGdvcml0aG0vJzogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJhbGdvcml0aG1cIixcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgLy8gZ2FsbGVyeTogW1xyXG4gICAgLy8gICB7XHJcbiAgICAvLyAgICAgdGV4dDogXCJcdTk4NzlcdTc2RUVcdTY4NDhcdTRGOEJcIixcclxuICAgIC8vICAgICBpdGVtczogW1xyXG4gICAgLy8gICAgICAgeyB0ZXh0OiBcIlx1NjVFMFx1OTUyMVx1Nzg1NVx1NjUzRVx1NjczQVx1NTczQVx1OTYzM1x1NTE0OVx1NjcwRFx1NTJBMVx1NUU3M1x1NTNGMFwiLCBsaW5rOiBcIi9nYWxsZXJ5L3N1bm55LWxhbmRcIiB9LFxyXG4gICAgLy8gICAgICAgeyB0ZXh0OiBcIlx1NjI2Q1x1NkNGMFx1NjczQVx1NTczQVx1NjY3QVx1NjE2N1x1NTFGQVx1ODg0Q1x1NUZBRVx1NEZFMVx1NUMwRlx1N0EwQlx1NUU4RlwiLCBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIiB9LFxyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NEUwQVx1NkQ3N1x1NkMxMVx1ODIyQVx1NTM0RVx1NEUxQ1x1NTFFRlx1NEU5QVx1NkM1Rlx1ODJDRlx1NTIwNlx1NTE2Q1x1NTNGOFx1NzVBQlx1NjBDNVx1OTYzMlx1NjNBN1x1NUU3M1x1NTNGMFwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIixcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7IHRleHQ6IFwiXHU2NUUwXHU5NTIxXHU3ODU1XHU2NTNFXHU2NzNBXHU1NzNBXHU1Qjg5XHU2OEMwXHU2NTQ4XHU4MEZEXHU1MjA2XHU2NzkwXHU3Q0ZCXHU3RURGXCIsIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiXHU2NUUwXHU5NTIxXHU3ODU1XHU2NTNFXHU2NzNBXHU1NzNBXHU4RkRCXHU1MUZBXHU2RTJGL1x1NjVFMFx1N0VCOFx1NTMxNlx1N0NGQlx1N0VERlwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIixcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7IHRleHQ6IFwiXHU2MjZDXHU2Q0YwXHU2NzNBXHU1NzNBXHU1QkEyXHU2RTkwXHU1NzMwXHU1MjA2XHU2NzkwXHU3Q0ZCXHU3RURGXCIsIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiIH0sXHJcbiAgICAvLyAgICAgXSxcclxuICAgIC8vICAgfSxcclxuICAgIC8vIF0sXHJcbiAgICAvLyBibG9nOiBbXHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICB0ZXh0OiBcIjIwMjMtMDZcIixcclxuICAgIC8vICAgICBpdGVtczogW1xyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlAtVG91Y2ggUDkwMCBcdTYyNTNcdTUzNzBcdTY3M0FcdTRGN0ZcdTc1MjhcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIzLTA2L1AtVG91Y2ggUDkwMCBcdTYyNTNcdTUzNzBcdTY3M0FcdTRGN0ZcdTc1MjhcIixcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7IHRleHQ6IFwiVml0ZXN0IFx1NEY3Rlx1NzUyOFwiLCBsaW5rOiBcIi9ibG9nLzIwMjMtMDYvMTVcIiB9LFxyXG4gICAgLy8gICAgIF0sXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICB0ZXh0OiBcIjIwMjMtMDVcIixcclxuICAgIC8vICAgICBpdGVtczogW1xyXG4gICAgLy8gICAgICAgeyB0ZXh0OiBcIlx1NjQyRFx1NUVGQSBHaXRodWIgXHU0RTJBXHU0RUJBXHU0RTNCXHU5ODc1XCIsIGxpbms6IFwiL2Jsb2cvMjAyMy0wNS8xNVwiIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiXHU0RjdGXHU3NTI4IFNraWFTaGFycCBcdTVCOUVcdTczQjBcdTU2RkVcdTcyNDdcdTZDMzRcdTUzNzBcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIzLTA1L3NraWFzaGFwX3dhdGVybWFyay5tZFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICBdLFxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gICB7XHJcbiAgICAvLyAgICAgdGV4dDogXCIyMDIyXCIsXHJcbiAgICAvLyAgICAgaXRlbXM6IFtcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTRFQ0UgRG9ja2VyIFx1NUI4OVx1ODhDNSBHaXRlYVwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU0RUNFIERvY2tlciBcdTVCODlcdTg4QzUgR2l0ZWEubWRcIixcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiXHU2NTRGXHU2Mzc3XHU1RjAwXHU1M0QxXHU1QjY2XHU0RTYwXHU3QjE0XHU4QkIwXCIsXHJcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMi9cdTY1NEZcdTYzNzdcdTVGMDBcdTUzRDFcdTVCNjZcdTRFNjBcdTdCMTRcdThCQjAubWRcIixcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiXHU3OUMxXHU2NzA5bnVnZXRcdTY3MERcdTUyQTFcdTU2NjhcdTkwRThcdTdGNzJcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NzlDMVx1NjcwOW51Z2V0XHU2NzBEXHU1MkExXHU1NjY4XHU5MEU4XHU3RjcyLm1kXCIsXHJcbiAgICAvLyAgICAgICB9LFxyXG5cclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTRFM0Fkb2NrZXJcdTkxNERcdTdGNkVIVFRQXHU0RUUzXHU3NDA2XHU2NzBEXHU1MkExXHU1NjY4XCIsXHJcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMi9cdTRFM0Fkb2NrZXJcdTkxNERcdTdGNkVIVFRQXHU0RUUzXHU3NDA2XHU2NzBEXHU1MkExXHU1NjY4Lm1kXCIsXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NzlDMVx1NjcwOW51Z2V0XHU2NzBEXHU1MkExXHU1NjY4XHU5MEU4XHU3RjcyXCIsXHJcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMi9cdTc5QzFcdTY3MDludWdldFx1NjcwRFx1NTJBMVx1NTY2OFx1OTBFOFx1N0Y3Mi5tZFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTZCNjNcdTU0MTFcdTRFRTNcdTc0MDZcdTU0OENcdTUzQ0RcdTU0MTFcdTRFRTNcdTc0MDZcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNi5tZFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTZCNjNcdTU0MTFcdTRFRTNcdTc0MDZcdTU0OENcdTUzQ0RcdTU0MTFcdTRFRTNcdTc0MDZcdThCRTZcdTg5RTNcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNlx1OEJFNlx1ODlFMy5tZFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICBdLFxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gXSxcclxuICB9O1xyXG5cclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcc2lkZWJhcnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcc2lkZWJhcnNcXFxcZW4tVVMuc2lkZWJhci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovR2l0aHViL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby8udml0ZXByZXNzL3NyYy9zaWRlYmFycy9lbi1VUy5zaWRlYmFyLnRzXCI7aW1wb3J0IHsgRGVmYXVsdFRoZW1lIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG5cclxuLy8gY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XHJcbi8vIGNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcclxuXHJcbi8vIGZ1bmN0aW9uIGdlbmVyYXRlU2lkZWJhckNvbmZpZyhkb2NzUGF0aCwgbGluayA9IFwiXCIsIGluZGV4ID0gMCkge1xyXG4vLyAgIGNvbnN0IHNpZGViYXJDb25maWc6IERlZmF1bHRUaGVtZS5TaWRlYmFyID0ge307XHJcbi8vICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhkb2NzUGF0aCk7XHJcblxyXG4vLyAgIGZpbGVzLmZvckVhY2goKGZpbGVuYW1lKSA9PiB7XHJcbi8vICAgICBpZiAoZmlsZW5hbWUuc3RhcnRzV2l0aChcIi5cIikpIHJldHVybjtcclxuLy8gICAgIGNvbnN0IGZpbGVwYXRoID0gcGF0aC5qb2luKGRvY3NQYXRoLCBmaWxlbmFtZSk7XHJcbi8vICAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoZmlsZXBhdGgpO1xyXG4vLyAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NjJGXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjBDXHU1MjE5XHU5MDEyXHU1RjUyXHU3NTFGXHU2MjEwXHU1QjUwXHU3RUE3IHNpZGViYXIgXHU5MTREXHU3RjZFXHJcbi8vICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7XHJcbi8vICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4vLyAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdlbmVyYXRlU2lkZWJhckNvbmZpZyhcclxuLy8gICAgICAgICAgIGZpbGVwYXRoLFxyXG4vLyAgICAgICAgICAgYC8ke2ZpbGVuYW1lfS9gLFxyXG4vLyAgICAgICAgICAgaW5kZXggKyAxXHJcbi8vICAgICAgICAgKTtcclxuLy8gICAgICAgICBpZiAoIXNpZGViYXJDb25maWdbYC8ke2ZpbGVuYW1lfS9gXSkge1xyXG4vLyAgICAgICAgICAgc2lkZWJhckNvbmZpZ1tgLyR7ZmlsZW5hbWV9L2BdID0gW2NvbmZpZ107XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgICB9IGVsc2Uge1xyXG4vLyAgICAgICAgIGlmICghc2lkZWJhckNvbmZpZy5pdGVtcykge1xyXG4vLyAgICAgICAgICAgc2lkZWJhckNvbmZpZy5pdGVtcyA9IFtdO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgICAgICBzaWRlYmFyQ29uZmlnLml0ZW1zLnB1c2goXHJcbi8vICAgICAgICAgICBnZW5lcmF0ZVNpZGViYXJDb25maWcoZmlsZXBhdGgsIGAke2xpbmt9JHtmaWxlbmFtZX0vYCwgaW5kZXggKyAxKVxyXG4vLyAgICAgICAgICk7XHJcbi8vICAgICAgIH1cclxuLy8gICAgIH0gZWxzZSB7XHJcbi8vICAgICAgIGNvbnN0IGV4dG5hbWUgPSBwYXRoLmV4dG5hbWUoZmlsZXBhdGgpO1xyXG4vLyAgICAgICBjb25zdCBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZXBhdGgsIGV4dG5hbWUpO1xyXG4vLyAgICAgICBpZiAoZmlsZW5hbWUgPT09IFwiaW5kZXgubWRcIiAmJiBpbmRleCA+IDApIHtcclxuLy8gICAgICAgICBjb25zdCBtZW51UGF0aCA9IHBhdGguZGlybmFtZShmaWxlcGF0aCk7XHJcbi8vICAgICAgICAgY29uc3QgbWVudU5hbWUgPSBwYXRoLmJhc2VuYW1lKG1lbnVQYXRoKTtcclxuLy8gICAgICAgICBzaWRlYmFyQ29uZmlnLnRleHQgPSBtZW51TmFtZTtcclxuLy8gICAgICAgICBzaWRlYmFyQ29uZmlnLmxpbmsgPSBbe1xyXG4vLyAgICAgICAgICAgbGluazogbGlua1xyXG4vLyAgICAgICAgIH1dO1xyXG4vLyAgICAgICB9XHJcbi8vICAgICAgIGlmIChleHRuYW1lID09PSBcIi5tZFwiICYmIGZpbGVuYW1lICE9PSBcImluZGV4Lm1kXCIpIHtcclxuLy8gICAgICAgICBpZiAoIXNpZGViYXJDb25maWcuaXRlbXMpIHtcclxuLy8gICAgICAgICAgIHNpZGViYXJDb25maWcuaXRlbXMgPSBbXTtcclxuLy8gICAgICAgICB9XHJcbi8vICAgICAgICAgc2lkZWJhckNvbmZpZy5pdGVtcy5wdXNoKHtcclxuLy8gICAgICAgICAgIHRleHQ6IGJhc2VuYW1lLFxyXG4vLyAgICAgICAgICAgbGluazogYCR7bGlua30ke2Jhc2VuYW1lfWAsXHJcbi8vICAgICAgICAgfSk7XHJcbi8vICAgICAgIH1cclxuLy8gICAgIH1cclxuLy8gICB9KTtcclxuXHJcbi8vICAgcmV0dXJuIHNpZGViYXJDb25maWc7XHJcbi8vIH1cclxuXHJcbi8vIGNvbnN0IGRvY3NQYXRoID0gcGF0aC5kaXJuYW1lKF9fZGlybmFtZSk7IC8vIGRvY3MgXHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHJcbi8vIGNvbnN0IGR5bmFtaWNTaWRlYmFyQ29uZmlnID0gZ2VuZXJhdGVTaWRlYmFyQ29uZmlnKGRvY3NQYXRoKTtcclxuLy8gY29uc29sZS5sb2coZG9jc1BhdGgpO1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldEVuVVNTaWRlYmFyOiAoKSA9PiBEZWZhdWx0VGhlbWUuU2lkZWJhciA9ICgpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgYXJ0aWNsZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiRXhhbXBsZXNcIixcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgeyB0ZXh0OiBcIk1hcmtkb3duIEV4YW1wbGVzXCIsIGxpbms6IFwiL21hcmtkb3duLWV4YW1wbGVzXCIgfSxcclxuICAgICAgICAgIHsgdGV4dDogXCJSdW50aW1lIEFQSSBFeGFtcGxlc1wiLCBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIiB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgY291cnNlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJcdTk4ODRcdTVCOUFcdTRFNDlcdTdDN0JcdTU3OEJcIixcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgeyB0ZXh0OiBcIk1hcmtkb3duIEV4YW1wbGVzXCIsIGxpbms6IFwiL2NvdXJzZS90eXBlc2NyaXB0L3ByZXNldF90eXBlXCIgfSxcclxuICAgICAgICAgIHsgdGV4dDogXCJSdW50aW1lIEFQSSBFeGFtcGxlc1wiLCBsaW5rOiBcIi9jb3Vyc2UvdHlwZXNjcmlwdC9leHRlbnNpb25fdHlwZVwiIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICAvLyBnYWxsZXJ5OiBbXHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICB0ZXh0OiBcIlx1OTg3OVx1NzZFRVx1Njg0OFx1NEY4QlwiLFxyXG4gICAgLy8gICAgIGl0ZW1zOiBbXHJcbiAgICAvLyAgICAgICB7IHRleHQ6IFwiXHU2NUUwXHU5NTIxXHU3ODU1XHU2NTNFXHU2NzNBXHU1NzNBXHU5NjMzXHU1MTQ5XHU2NzBEXHU1MkExXHU1RTczXHU1M0YwXCIsIGxpbms6IFwiL2dhbGxlcnkvc3VubnktbGFuZFwiIH0sXHJcbiAgICAvLyAgICAgICB7IHRleHQ6IFwiXHU2MjZDXHU2Q0YwXHU2NzNBXHU1NzNBXHU2NjdBXHU2MTY3XHU1MUZBXHU4ODRDXHU1RkFFXHU0RkUxXHU1QzBGXHU3QTBCXHU1RThGXCIsIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiXHU0RTBBXHU2RDc3XHU2QzExXHU4MjJBXHU1MzRFXHU0RTFDXHU1MUVGXHU0RTlBXHU2QzVGXHU4MkNGXHU1MjA2XHU1MTZDXHU1M0Y4XHU3NUFCXHU2MEM1XHU5NjMyXHU2M0E3XHU1RTczXHU1M0YwXCIsXHJcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHsgdGV4dDogXCJcdTY1RTBcdTk1MjFcdTc4NTVcdTY1M0VcdTY3M0FcdTU3M0FcdTVCODlcdTY4QzBcdTY1NDhcdTgwRkRcdTUyMDZcdTY3OTBcdTdDRkJcdTdFREZcIiwgbGluazogXCIvYXBpLWV4YW1wbGVzXCIgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTY1RTBcdTk1MjFcdTc4NTVcdTY1M0VcdTY3M0FcdTU3M0FcdThGREJcdTUxRkFcdTZFMkYvXHU2NUUwXHU3RUI4XHU1MzE2XHU3Q0ZCXHU3RURGXCIsXHJcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHsgdGV4dDogXCJcdTYyNkNcdTZDRjBcdTY3M0FcdTU3M0FcdTVCQTJcdTZFOTBcdTU3MzBcdTUyMDZcdTY3OTBcdTdDRkJcdTdFREZcIiwgbGluazogXCIvYXBpLWV4YW1wbGVzXCIgfSxcclxuICAgIC8vICAgICBdLFxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gXSxcclxuICAgIC8vIGJsb2c6IFtcclxuICAgIC8vICAge1xyXG4gICAgLy8gICAgIHRleHQ6IFwiMjAyMy0wNlwiLFxyXG4gICAgLy8gICAgIGl0ZW1zOiBbXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiUC1Ub3VjaCBQOTAwIFx1NjI1M1x1NTM3MFx1NjczQVx1NEY3Rlx1NzUyOFwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjMtMDYvUC1Ub3VjaCBQOTAwIFx1NjI1M1x1NTM3MFx1NjczQVx1NEY3Rlx1NzUyOFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHsgdGV4dDogXCJWaXRlc3QgXHU0RjdGXHU3NTI4XCIsIGxpbms6IFwiL2Jsb2cvMjAyMy0wNi8xNVwiIH0sXHJcbiAgICAvLyAgICAgXSxcclxuICAgIC8vICAgfSxcclxuICAgIC8vICAge1xyXG4gICAgLy8gICAgIHRleHQ6IFwiMjAyMy0wNVwiLFxyXG4gICAgLy8gICAgIGl0ZW1zOiBbXHJcbiAgICAvLyAgICAgICB7IHRleHQ6IFwiXHU2NDJEXHU1RUZBIEdpdGh1YiBcdTRFMkFcdTRFQkFcdTRFM0JcdTk4NzVcIiwgbGluazogXCIvYmxvZy8yMDIzLTA1LzE1XCIgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTRGN0ZcdTc1MjggU2tpYVNoYXJwIFx1NUI5RVx1NzNCMFx1NTZGRVx1NzI0N1x1NkMzNFx1NTM3MFwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjMtMDUvc2tpYXNoYXBfd2F0ZXJtYXJrLm1kXCIsXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgIF0sXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICB0ZXh0OiBcIjIwMjJcIixcclxuICAgIC8vICAgICBpdGVtczogW1xyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NEVDRSBEb2NrZXIgXHU1Qjg5XHU4OEM1IEdpdGVhXCIsXHJcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMi9cdTRFQ0UgRG9ja2VyIFx1NUI4OVx1ODhDNSBHaXRlYS5tZFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTY1NEZcdTYzNzdcdTVGMDBcdTUzRDFcdTVCNjZcdTRFNjBcdTdCMTRcdThCQjBcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NjU0Rlx1NjM3N1x1NUYwMFx1NTNEMVx1NUI2Nlx1NEU2MFx1N0IxNFx1OEJCMC5tZFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTc5QzFcdTY3MDludWdldFx1NjcwRFx1NTJBMVx1NTY2OFx1OTBFOFx1N0Y3MlwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU3OUMxXHU2NzA5bnVnZXRcdTY3MERcdTUyQTFcdTU2NjhcdTkwRThcdTdGNzIubWRcIixcclxuICAgIC8vICAgICAgIH0sXHJcblxyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NEUzQWRvY2tlclx1OTE0RFx1N0Y2RUhUVFBcdTRFRTNcdTc0MDZcdTY3MERcdTUyQTFcdTU2NjhcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NEUzQWRvY2tlclx1OTE0RFx1N0Y2RUhUVFBcdTRFRTNcdTc0MDZcdTY3MERcdTUyQTFcdTU2NjgubWRcIixcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiXHU3OUMxXHU2NzA5bnVnZXRcdTY3MERcdTUyQTFcdTU2NjhcdTkwRThcdTdGNzJcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NzlDMVx1NjcwOW51Z2V0XHU2NzBEXHU1MkExXHU1NjY4XHU5MEU4XHU3RjcyLm1kXCIsXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNlwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU2QjYzXHU1NDExXHU0RUUzXHU3NDA2XHU1NDhDXHU1M0NEXHU1NDExXHU0RUUzXHU3NDA2Lm1kXCIsXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNlx1OEJFNlx1ODlFM1wiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU2QjYzXHU1NDExXHU0RUUzXHU3NDA2XHU1NDhDXHU1M0NEXHU1NDExXHU0RUUzXHU3NDA2XHU4QkU2XHU4OUUzLm1kXCIsXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgIF0sXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyBdLFxyXG4gIH07XHJcblxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXGNvbmZpZ3NcXFxcemgtQ04uY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL2NvbmZpZ3MvemgtQ04uY29uZmlnLnRzXCI7aW1wb3J0IHR5cGUgeyBEZWZhdWx0VGhlbWUsIExvY2FsZVNwZWNpZmljQ29uZmlnIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG5cclxuLy9cdTVGMTVcdTUxNjVcdTRFRTVcdTRFMEFcdTkxNERcdTdGNkUgXHU2NjJGXHU4MkYxXHU2NTg3XHU3NTRDXHU5NzYyXHU5NzAwXHU4OTgxXHU0RkVFXHU2NTM5emhcdTRFM0FlblxyXG5pbXBvcnQgeyBnZXRaaENOTmF2IH0gZnJvbSBcIi4uL25hdnNcIjtcclxuaW1wb3J0IHsgZ2V0WmhDTlNpZGViYXIgfSBmcm9tIFwiLi4vc2lkZWJhcnNcIjtcclxuXHJcbmltcG9ydCBkYXlqcyBmcm9tICdkYXlqcydcclxuXHJcbmV4cG9ydCBjb25zdCB6aENvbmZpZzogTG9jYWxlU3BlY2lmaWNDb25maWc8RGVmYXVsdFRoZW1lLkNvbmZpZz4gPSB7XHJcbiAgZGVzY3JpcHRpb246IFwiQ01PTk8uTkVUIFx1NEU0Qlx1NUJCNlwiLFxyXG4gIHRpdGxlOiBcIkNNT05PLk5FVFwiLFxyXG4gIGxhbmc6IFwiemgtQ05cIixcclxuICB0aGVtZUNvbmZpZzoge1xyXG4gICAgbG9nbzogXCIvbG9nby5wbmdcIixcclxuICAgIGxhc3RVcGRhdGVkVGV4dDogXCJcdTRFMEFcdTZCMjFcdTY2RjRcdTY1QjBcIixcclxuICAgIHJldHVyblRvVG9wTGFiZWw6IFwiXHU4RkQ0XHU1NkRFXHU5ODc2XHU5MEU4XCIsXHJcbiAgICAvLyBcdTY1ODdcdTY4NjNcdTk4NzVcdTgxMUFcdTY1ODdcdTY3MkNcdTkxNERcdTdGNkVcclxuICAgIGRvY0Zvb3Rlcjoge1xyXG4gICAgICBwcmV2OiBcIlx1NEUwQVx1NEUwMFx1OTg3NVwiLFxyXG4gICAgICBuZXh0OiBcIlx1NEUwQlx1NEUwMFx1OTg3NVwiLFxyXG4gICAgfSxcclxuICAgIGZvb3Rlcjoge1xyXG4gICAgICBtZXNzYWdlOiBcIk1JVCBMaWNlbnNlZFwiLFxyXG4gICAgICBjb3B5cmlnaHQ6IGBDb3B5cmlnaHQgXHUwMEE5IDIwMDktJHtkYXlqcygpLnllYXIoKX0gQ01PTk8uTkVUYCxcclxuICAgIH0sXHJcbiAgICAvLyAgIGVkaXRMaW5rOiB7XHJcbiAgICAvLyAgICAgcGF0dGVybjogJ1x1OERFRlx1NUY4NFx1NTczMFx1NTc0MCcsXHJcbiAgICAvLyAgICAgdGV4dDogJ1x1NUJGOVx1NjcyQ1x1OTg3NVx1NjNEMFx1NTFGQVx1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRScsXHJcbiAgICAvLyAgIH0sXHJcbiAgICBuYXY6IGdldFpoQ05OYXYoKSxcclxuICAgIHNpZGViYXI6IGdldFpoQ05TaWRlYmFyKCksXHJcbiAgICBvdXRsaW5lOiB7XHJcbiAgICAgIGxldmVsOiBcImRlZXBcIiwgLy8gXHU1M0YzXHU0RkE3XHU1OTI3XHU3RUIyXHU2ODA3XHU5ODk4XHU1QzQyXHU3RUE3XHJcbiAgICAgIGxhYmVsOiBcIlx1NzZFRVx1NUY1NVwiLCAvLyBcdTUzRjNcdTRGQTdcdTU5MjdcdTdFQjJcdTY4MDdcdTk4OThcdTY1ODdcdTY3MkNcdTkxNERcdTdGNkVcclxuICAgIH0sXHJcbiAgfSxcclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcY29uZmlnc1xcXFxlbi1VUy5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvY29uZmlncy9lbi1VUy5jb25maWcudHNcIjtpbXBvcnQgdHlwZSB7IERlZmF1bHRUaGVtZSwgTG9jYWxlU3BlY2lmaWNDb25maWcgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcblxyXG4vL1x1NUYxNVx1NTE2NVx1NEVFNVx1NEUwQVx1OTE0RFx1N0Y2RSBcdTY2MkZcdTgyRjFcdTY1ODdcdTc1NENcdTk3NjJcdTk3MDBcdTg5ODFcdTRGRUVcdTY1Mzl6aFx1NEUzQWVuXHJcbmltcG9ydCB7IGdldEVuVVNOYXYgfSBmcm9tIFwiLi4vbmF2c1wiO1xyXG5pbXBvcnQgeyBnZXRFblVTU2lkZWJhciB9IGZyb20gXCIuLi9zaWRlYmFyc1wiO1xyXG5cclxuaW1wb3J0IGRheWpzIGZyb20gJ2RheWpzJ1xyXG5cclxuZXhwb3J0IGNvbnN0IGVuQ29uZmlnOiBMb2NhbGVTcGVjaWZpY0NvbmZpZzxEZWZhdWx0VGhlbWUuQ29uZmlnPiA9IHtcclxuICBkZXNjcmlwdGlvbjogXCJDTU9OTy5ORVQgSG9tZVBhZ2VcIixcclxuICB0aXRsZTogXCJDTU9OTy5ORVRcIixcclxuICBsYW5nOiBcImVuLVVTXCIsXHJcbiAgdGhlbWVDb25maWc6IHtcclxuICAgIGxvZ286IFwiL2xvZ28ucG5nXCIsXHJcbiAgICBsYXN0VXBkYXRlZFRleHQ6IFwiTGFzdCBVcGRhdGVkXCIsXHJcbiAgICByZXR1cm5Ub1RvcExhYmVsOiBcIlRPUFwiLFxyXG4gICAgLy8gXHU2NTg3XHU2ODYzXHU5ODc1XHU4MTFBXHU2NTg3XHU2NzJDXHU5MTREXHU3RjZFXHJcbiAgICBkb2NGb290ZXI6IHtcclxuICAgICAgcHJldjogXCJQcmV2XCIsXHJcbiAgICAgIG5leHQ6IFwiTmV4dFwiLFxyXG4gICAgfSxcclxuICAgIGZvb3Rlcjoge1xyXG4gICAgICBtZXNzYWdlOiBcIk1JVCBMaWNlbnNlZFwiLFxyXG4gICAgICBjb3B5cmlnaHQ6IGBDb3B5cmlnaHQgXHUwMEE5IDIwMDktJHtkYXlqcygpLnllYXIoKX0gQ01PTk8uTkVUYCxcclxuICAgIH0sXHJcbiAgICAvLyAgIGVkaXRMaW5rOiB7XHJcbiAgICAvLyAgICAgcGF0dGVybjogJ1x1OERFRlx1NUY4NFx1NTczMFx1NTc0MCcsXHJcbiAgICAvLyAgICAgdGV4dDogJ1x1NUJGOVx1NjcyQ1x1OTg3NVx1NjNEMFx1NTFGQVx1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRScsXHJcbiAgICAvLyAgIH0sXHJcbiAgICBuYXY6IGdldEVuVVNOYXYoKSxcclxuICAgIHNpZGViYXI6IGdldEVuVVNTaWRlYmFyKCksXHJcbiAgICBvdXRsaW5lOiB7XHJcbiAgICAgIGxldmVsOiBcImRlZXBcIiwgLy8gXHU1M0YzXHU0RkE3XHU1OTI3XHU3RUIyXHU2ODA3XHU5ODk4XHU1QzQyXHU3RUE3XHJcbiAgICAgIGxhYmVsOiBcIlx1NzZFRVx1NUY1NVwiLCAvLyBcdTUzRjNcdTRGQTdcdTU5MjdcdTdFQjJcdTY4MDdcdTk4OThcdTY1ODdcdTY3MkNcdTkxNERcdTdGNkVcclxuICAgIH0sXHJcbiAgfSxcclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXGRvY3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvZG9jcy50c1wiO2ltcG9ydCB7IERlZmF1bHRUaGVtZSwgVXNlckNvbmZpZyB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuaW1wb3J0IHsgZW5Db25maWcsIHpoQ29uZmlnIH0gZnJvbSBcIi4vY29uZmlnc1wiO1xyXG5cclxuY29uc3QgZG9jc0NvbmZpZzogVXNlckNvbmZpZzxEZWZhdWx0VGhlbWUuQ29uZmlnPiA9IHtcclxuICBiYXNlOiBcIi9cIixcclxuICB0aXRsZTogXCJDTU9OTy5ORVRcIixcclxuICBkZXNjcmlwdGlvbjogXCJcdTRFMkFcdTRFQkFcdTU3MjhcdTdFQkZcIixcclxuICBhcHBlYXJhbmNlOiB0cnVlLFxyXG4gIGxhbmc6IFwiemgtQ05cIixcclxuICBoZWFkOiBbXHJcbiAgICAvLyBbXCJsaW5rXCIsIHsgcmVsOiBcImljb25cIiwgdHlwZTogXCJpbWFnZS9zdmcreG1sXCIsIGhyZWY6IFwiL2Zhdmljb24uc3ZnXCIgfV0sXHJcbiAgICBbXCJsaW5rXCIsIHsgcmVsOiBcImljb25cIiwgdHlwZTogXCJpbWFnZS94LWljb25cIiwgaHJlZjogXCIvZmF2aWNvbi5pY29cIiB9XSxcclxuICAgIC8vIFx1OEJCRVx1N0Y2RSBcdTYzQ0ZcdThGRjAgXHU1NDhDIFx1NTE3M1x1OTUyRVx1OEJDRFxyXG4gICAgW1xyXG4gICAgICBcIm1ldGFcIixcclxuICAgICAgeyBuYW1lOiBcImtleXdvcmRzXCIsIGNvbnRlbnQ6IFwicmVhY3QgcmVhY3QtYWRtaW4gYW50IFx1NTQwRVx1NTNGMFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERlwiIH0sXHJcbiAgICBdLFxyXG4gICAgW1xyXG4gICAgICBcIm1ldGFcIixcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6IFwiZGVzY3JpcHRpb25cIixcclxuICAgICAgICBjb250ZW50OlxyXG4gICAgICAgICAgXCJcdTZCNjRcdTY4NDZcdTY3QjZcdTRGN0ZcdTc1MjhcdTRFMEVcdTRFOENcdTZCMjFcdTVGMDBcdTUzRDFcdUZGMENcdTUyNERcdTdBRUZcdTY4NDZcdTY3QjZcdTRGN0ZcdTc1MjhyZWFjdFx1RkYwQ1VJXHU2ODQ2XHU2N0I2XHU0RjdGXHU3NTI4YW50LWRlc2lnblx1RkYwQ1x1NTE2OFx1NUM0MFx1NjU3MFx1NjM2RVx1NzJCNlx1NjAwMVx1N0JBMVx1NzQwNlx1NEY3Rlx1NzUyOHJlZHV4XHVGRjBDYWpheFx1NEY3Rlx1NzUyOFx1NUU5M1x1NEUzQWF4aW9zXHUzMDAyXHU3NTI4XHU0RThFXHU1RkVCXHU5MDFGXHU2NDJEXHU1RUZBXHU0RTJEXHU1NDBFXHU1M0YwXHU5ODc1XHU5NzYyXHUzMDAyXCIsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIF0sXHJcbiAgaWdub3JlRGVhZExpbmtzOiBbXHJcbiAgICAvLyBpZ25vcmUgZXhhY3QgdXJsIFwiL3BsYXlncm91bmRcIlxyXG4gICAgXCIvcGxheWdyb3VuZFwiLFxyXG4gICAgLy8gaWdub3JlIGFsbCBsb2NhbGhvc3QgbGlua3NcclxuICAgIC9eaHR0cHM/OlxcL1xcL2xvY2FsaG9zdC8sXHJcbiAgICAvLyBpZ25vcmUgYWxsIGxpbmtzIGluY2x1ZGUgXCIvcmVwbC9cIlwiXHJcbiAgICAvXFwvcmVwbFxcLy8sXHJcbiAgICAvLyBjdXN0b20gZnVuY3Rpb24sIGlnbm9yZSBhbGwgbGlua3MgaW5jbHVkZSBcImlnbm9yZVwiXHJcbiAgICAodXJsKSA9PiB7XHJcbiAgICAgIHJldHVybiB1cmwudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhcImlnbm9yZVwiKTtcclxuICAgIH0sXHJcbiAgXSxcclxuICBsb2NhbGVzOiB7XHJcbiAgICAvLyBcdTgyRTVcdTY3OUNcdTkxNERcdTdGNkVcdTRFODZyb290XHVGRjBDXHU1MjE5XHU1M0NDXHU1MUZCdGl0bGVcdTc2ODRcdTY1RjZcdTUwMTlcdTRFMERcdTRGMUFcdThGRDRcdTU2REUvXHU4REVGXHU1Rjg0XHU0RTBCXHU0RTg2XHVGRjBDXHU1M0VBXHU0RjFBXHU4RkQ0XHU1NkRFXHU1NzI4bGlua1x1OERFRlx1NUY4NFx1NEUwQlxyXG4gICAgLy8gcm9vdDogeyBsYWJlbDogXCJcdTdCODBcdTRGNTNcdTRFMkRcdTY1ODdcIiwgbGFuZzogXCJ6aC1DTlwiLCBsaW5rOiBcIi96aC1DTi9cIiwgIC4uLnpoQ29uZmlnIH0sXHJcbiAgICAnemgtQ04nOiB7IGxhYmVsOiBcIlx1N0I4MFx1NEY1M1x1NEUyRFx1NjU4N1wiLCBsYW5nOiBcInpoLUNOXCIsIGxpbms6IFwiL3poLUNOL1wiLCAuLi56aENvbmZpZyB9LFxyXG4gICAgJ2VuLVVTJzogeyBsYWJlbDogXCJFbmdsaXNoXCIsIGxhbmc6IFwiZW4tVVNcIiwgbGluazogXCIvZW4tVVMvXCIsIC4uLmVuQ29uZmlnIH0sXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCB7IGRvY3NDb25maWcgfTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXGhlYWQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvaGVhZC50c1wiO2ltcG9ydCB0eXBlIHsgSGVhZENvbmZpZyB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBoZWFkOiBIZWFkQ29uZmlnW10gPSBbXHJcbiAgLy8gW1xyXG4gIC8vICAgICAnbGluaycsXHJcbiAgLy8gICAgIHsgcmVsOiAncHJlY29ubmVjdCcsIGhyZWY6ICdodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tJywgY3Jvc3NvcmlnaW46ICcnIH1cclxuICAvLyAgICAgLy8gd291bGQgcmVuZGVyOlxyXG4gIC8vICAgICAvL1xyXG4gIC8vICAgICAvLyA8bGluayByZWw9XCJwcmVjb25uZWN0XCIgaHJlZj1cImh0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb21cIiBjcm9zc29yaWdpbiAvPlxyXG4gIC8vICAgXSxcclxuXHJcbiAgLy8gICBbXHJcbiAgLy8gICAgICdzY3JpcHQnLFxyXG4gIC8vICAgICB7IGlkOiAncmVnaXN0ZXItc3cnIH0sXHJcbiAgLy8gICAgIGA7KCgpID0+IHtcclxuICAvLyAgICAgICBpZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xyXG4gIC8vICAgICAgICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy9zdy5qcycpXHJcbiAgLy8gICAgICAgfVxyXG4gIC8vICAgICB9KSgpYFxyXG4gIC8vICAgICAvLyB3b3VsZCByZW5kZXI6XHJcbiAgLy8gICAgIC8vXHJcbiAgLy8gICAgIC8vIDxzY3JpcHQgaWQ9XCJyZWdpc3Rlci1zd1wiPlxyXG4gIC8vICAgICAvLyA7KCgpID0+IHtcclxuICAvLyAgICAgLy8gICBpZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xyXG4gIC8vICAgICAvLyAgICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy9zdy5qcycpXHJcbiAgLy8gICAgIC8vICAgfVxyXG4gIC8vICAgICAvLyB9KSgpXHJcbiAgLy8gICAgIC8vIDwvc2NyaXB0PlxyXG4gIC8vICAgXVxyXG4gIFtcIm1ldGFcIiwgeyBuYW1lOiBcInRoZW1lLWNvbG9yXCIsIGNvbnRlbnQ6IFwiI2ZmZmZmZlwiIH1dLFxyXG4gIFtcIm1ldGFcIiwgeyBuYW1lOiBcIm1vYmlsZS13ZWItYXBwLWNhcGFibGVcIiwgY29udGVudDogXCJ5ZXNcIiB9XSxcclxuICBbXCJtZXRhXCIsIHsgbmFtZTogXCJhcHBsZS1tb2JpbGUtd2ViLWFwcC1zdGF0dXMtYmFyLXN0eWxlXCIsIGNvbnRlbnQ6IFwiZGVmYXVsdFwiIH1dLFxyXG4gIFtcIm1ldGFcIiwgeyBuYW1lOiBcImFwcGxpY2F0aW9uLW5hbWVcIiwgY29udGVudDogXCJDTU9OTy5ORVRcIiB9XSxcclxuICBbXCJtZXRhXCIsIHsgbmFtZTogXCJhcHBsZS10b3VjaC1pY29uLXByZWNvbXBvc2VkXCIsIGNvbnRlbnQ6IFwiL2Zhdmljb24uc3ZnXCIgfV0sXHJcbiAgLy8gW1wibGlua1wiLCB7IHJlbDogXCJpY29uXCIsIHR5cGU6IFwiaW1hZ2Uvc3ZnK3htbFwiLCBocmVmOiBcIi9mYXZpY29uLnN2Z1wiIH1dLFxyXG4gIFtcclxuICAgIFwibGlua1wiLFxyXG4gICAgeyByZWw6IFwiaWNvblwiLCB0eXBlOiBcImltYWdlL3gtaWNvblwiLCBocmVmOiBcIi9mYXZpY29uLmljb1wiLCBzaXplczogXCJhbnlcIiB9LFxyXG4gIF0sXHJcbiAgLy8gWydsaW5rJywgeyByZWw6ICdtYXNrLWljb24nLCBocmVmOiAnL2Zhdmljb24uc3ZnJywgY29sb3I6ICcjZmZmZmZmJyB9XSxcclxuICAvLyBbJ2xpbmsnLCB7IHJlbDogJ2FwcGxlLXRvdWNoLWljb24nLCBocmVmOiAnL2Zhdmljb24uc3ZnJywgc2l6ZXM6ICcxODB4MTgwJyB9XSxcclxuICBbXHJcbiAgICBcImxpbmtcIixcclxuICAgIHtcclxuICAgICAgcmVsOiBcInN0eWxlc2hlZXRcIixcclxuICAgICAgaHJlZjogXCIvZm9udC5jc3NcIixcclxuICAgIH0sXHJcbiAgXSxcclxuICBbXCJtZXRhXCIsIHsgbmFtZTogXCJyZWZlcnJlclwiLCBjb250ZW50OiBcIm5vLXJlZmVycmVyXCIgfV0sXHJcbiAgLy8gW1xyXG4gIC8vICAgXCJzY3JpcHRcIixcclxuICAvLyAgIHtcclxuICAvLyAgICAgc3JjOiBcIi9jbGFyaXR5LmpzXCIsXHJcbiAgLy8gICB9LFxyXG4gIC8vIF0sXHJcbiAgW1xyXG4gICAgXCJtZXRhXCIsXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6IFwia2V5d29yZHNcIixcclxuICAgICAgY29udGVudDpcclxuICAgICAgICBcIkNNT05PLk5FVCxjaGFuZ3dlaWh1YSxcdTVFMzhcdTRGMUZcdTUzNEUsTGFuY2UsY2hhbmd3ZWlodWEuZ2l0aHViLmlvLFZpdGUsVml0ZVByZXNzLEFudERlc2lnblwiLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIFtcclxuICAgIFwibWV0YVwiLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiBcImRlc2NyaXB0aW9uXCIsXHJcbiAgICAgIGNvbnRlbnQ6IFwiQ01PTk8uTkVUIFx1NUI5OFx1NjVCOVx1N0FEOVx1NzBCOVx1RkYwQ1x1NEUzQlx1ODk4MVx1OEJCMFx1NUY1NVx1NUU3M1x1NjVGNlx1NURFNVx1NEY1Q1x1NjAzQlx1N0VEM1x1NTNDQVx1OTg3OVx1NzZFRVx1N0VDRlx1NTM4NlwiLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIFtcclxuICAgIFwibWV0YVwiLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiBcInRoZW1lLWNvbG9yXCIsXHJcbiAgICAgIGNvbnRlbnQ6IFwiIzE5NzJGOFwiLFxyXG4gICAgICAnbWVkaWEnOiAnKHByZWZlcnMtY29sb3Itc2NoZW1lOiBsaWdodCknXHJcbiAgICB9LFxyXG4gIF0sXHJcbiAgW1xyXG4gICAgXCJtZXRhXCIsXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6IFwidGhlbWUtY29sb3JcIixcclxuICAgICAgY29udGVudDogXCIjMUM0RDk4XCIsXHJcbiAgICAgICdtZWRpYSc6ICcocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspJ1xyXG4gICAgfSxcclxuICBdLFxyXG4gIFtcclxuICAgIFwic2NyaXB0XCIsXHJcbiAgICB7XHJcbiAgICAgIHNyYzogXCIvY3Vyc29yLmpzXCIsXHJcbiAgICAgIFwiZGF0YS1zaXRlXCI6IFwiaHR0cHM6Ly9jaGFuZ3dlaWh1YS5naXRodWIuaW9cIixcclxuICAgICAgXCJkYXRhLXNwYVwiOiBcImF1dG9cIixcclxuICAgICAgZGVmZXI6IFwidHJ1ZVwiLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIFtcclxuICAgIFwic2NyaXB0XCIsXHJcbiAgICB7XHJcbiAgICAgIHNyYzogXCJodHRwczovL2htLmJhaWR1LmNvbS9obS5qcz85YmRjZjZmMjExMjYzNGQxMzIyM2VmNzNkZTZmZTlmYVwiLFxyXG4gICAgICBcImRhdGEtc2l0ZVwiOiBcImh0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvXCIsXHJcbiAgICAgIFwiZGF0YS1zcGFcIjogXCJhdXRvXCIsXHJcbiAgICAgIGRlZmVyOiBcInRydWVcIixcclxuICAgIH0sXHJcbiAgXSxcclxuICAvLyBbXHJcbiAgLy8gICAnc2NyaXB0JyxcclxuICAvLyAgIHtcclxuXHJcbiAgLy8gICB9LFxyXG4gIC8vICAgYFxyXG4gIC8vICAgICB3aW5kb3cuX2htdCA9IHdpbmRvdy5faG10IHx8IFtdO1xyXG4gIC8vICAgICAoZnVuY3Rpb24oKSB7XHJcbiAgLy8gICAgICAgdmFyIGhtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcclxuICAvLyAgICAgICBobS5zcmMgPSBcImh0dHBzOi8vaG0uYmFpZHUuY29tL2htLmpzPzliZGNmNmYyMTEyNjM0ZDEzMjIzZWY3M2RlNmZlOWZhXCI7XHJcbiAgLy8gICAgICAgLy8gaG0uc2NyaXB0LmFzeW5jID0gdHJ1ZTtcclxuICAvLyAgICAgICB2YXIgcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpWzBdO1xyXG4gIC8vICAgICAgIHMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoaG0sIHMpO1xyXG4gIC8vICAgICB9KSgpO1xyXG4gIC8vICAgICBgLFxyXG4gIC8vIF0sXHJcbiAgLy8gXHU4QkJFXHU3RjZFIFx1NjNDRlx1OEZGMCBcdTU0OEMgXHU1MTczXHU5NTJFXHU4QkNEXHJcbiAgW1wibWV0YVwiLCB7IG5hbWU6IFwiYXV0aG9yXCIsIGNvbnRlbnQ6IFwiTGFuY2UgQ2hhbmdcIiB9XSxcclxuICBbXHJcbiAgICBcIm1ldGFcIixcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJrZXl3b3Jkc1wiLFxyXG4gICAgICBjb250ZW50OlxyXG4gICAgICAgIFwiY2hhbmd3ZWlodWEgXHU1RTM4XHU0RjFGXHU1MzRFIHZpdGVwcmVzcyBjbW9uby5uZXQgY2hhbmd3ZWlodWEuZ2l0aHViLmlvIFx1NEUyQVx1NEVCQVx1N0Y1MVx1N0FEOVwiLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIFtcclxuICAgIFwibWV0YVwiLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiBcImRlc2NyaXB0aW9uXCIsXHJcbiAgICAgIGNvbnRlbnQ6XHJcbiAgICAgICAgXCJcdTZCNjRcdTdDRkJcdTdFREZcdTU3RkFcdTRFOEV2aXRlcHJlc3NcdTRFOENcdTZCMjFcdTVGMDBcdTUzRDFcdUZGMENcdTUyNERcdTdBRUZcdTY4NDZcdTY3QjZcdTRGN0ZcdTc1Mjh2dWVqc1x1RkYwQ1VJXHU2ODQ2XHU2N0I2XHU0RjdGXHU3NTI4YW50LWRlc2lnblx1RkYwQ1x1NTE2OFx1NUM0MFx1NjU3MFx1NjM2RVx1NzJCNlx1NjAwMVx1N0JBMVx1NzQwNlx1NEY3Rlx1NzUyOHBhaW5hXHVGRjBDYWpheFx1NEY3Rlx1NzUyOFx1NUU5M1x1NEUzQWZldGNoXHUzMDAyXHU3NTI4XHU0RThFXHU1RkVCXHU5MDFGXHU2NDJEXHU1RUZBXHU0RTJBXHU0RUJBXHU3RjUxXHU3QUQ5XHU1NDhDXHU1MTg1XHU1QkI5XHU3QkExXHU3NDA2XHU1RTczXHU1M0YwXHUzMDAyXCIsXHJcbiAgICB9LFxyXG4gIF0sXHJcbl07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxtYXJrZG93bi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovR2l0aHViL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby8udml0ZXByZXNzL3NyYy9tYXJrZG93bi50c1wiO2ltcG9ydCBsaWdodGJveCBmcm9tIFwidml0ZXByZXNzLXBsdWdpbi1saWdodGJveFwiXHJcbmltcG9ydCB7IE1hcmtkb3duT3B0aW9ucyB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuaW1wb3J0IHRpbWVsaW5lIGZyb20gXCJ2aXRlcHJlc3MtbWFya2Rvd24tdGltZWxpbmVcIjtcclxuaW1wb3J0IGZvb3Rub3RlIGZyb20gJ21hcmtkb3duLWl0LWZvb3Rub3RlJztcclxuaW1wb3J0IG1hcmtkb3duU3VwIGZyb20gJ21hcmtkb3duLWl0LXN1cCdcclxuaW1wb3J0IG1hcmtkb3duU3ViIGZyb20gJ21hcmtkb3duLWl0LXN1YidcclxuaW1wb3J0IG1hcmtkb3duSXRNYXJrIGZyb20gJ21hcmtkb3duLWl0LW1hcmsnXHJcbmltcG9ydCBmcm9udG1hdHRlciBmcm9tICdtYXJrZG93bi1pdC1mcm9udC1tYXR0ZXInXHJcbmltcG9ydCB7IHdvcmRsZXNzLCBjaGluZXNlQW5kSmFwYW5lc2UsIE9wdGlvbnMgfSBmcm9tIFwibWFya2Rvd24taXQtd29yZGxlc3NcIlxyXG5pbXBvcnQgbWFya2Rvd25MaW5rcyBmcm9tICdtYXJrZG93bi1pdC1leHRlcm5hbC1saW5rcydcclxuaW1wb3J0IE1hcmtkb3duSXRDb2xsYXBzaWJsZSBmcm9tIFwibWFya2Rvd24taXQtY29sbGFwc2libGVcIjtcclxuaW1wb3J0IGxhenlfbG9hZGluZyBmcm9tICdtYXJrZG93bi1pdC1pbWFnZS1sYXp5LWxvYWRpbmcnO1xyXG5pbXBvcnQgTWFya2Rvd25JdFZhcmlhYmxlIGZyb20gXCJtYXJrZG93bi1pdC12YXJpYWJsZVwiO1xyXG5pbXBvcnQgTWFya2Rvd25JdFRvZG9MaXN0cyBmcm9tICdtYXJrZG93bi1pdC10b2RvLWxpc3RzJ1xyXG5pbXBvcnQgbmFtZWRDb2RlIGZyb20gJ21hcmtkb3duLWl0LW5hbWVkLWNvZGUtYmxvY2tzJ1xyXG5pbXBvcnQgc3RyaWtldGhyb3VnaCBmcm9tICdtYXJrZG93bi1pdC1zdHJpa2V0aHJvdWdoLWFsdCdcclxuaW1wb3J0IGhhc2htZW50aW9uIGZyb20gJ21hcmtkb3duLWl0LWhhc2htZW50aW9uJ1xyXG5pbXBvcnQgeyB0YXNrbGlzdCB9IGZyb20gXCJAbWRpdC9wbHVnaW4tdGFza2xpc3RcIjtcclxuaW1wb3J0IHsgcnVieSB9IGZyb20gXCJAbWRpdC9wbHVnaW4tcnVieVwiO1xyXG5pbXBvcnQgbWFya2Rvd25DamtCcmVha3MgZnJvbSAnbWFya2Rvd24taXQtY2prLWJyZWFrcydcclxuaW1wb3J0IHsgbWFya2Rvd25JdFN0ZXBwZXIgfSBmcm9tICd2aXRlcHJlc3MtbWFya2Rvd24taXQtc3RlcHBlcidcclxuaW1wb3J0IHsgSW1hZ2VQbHVnaW4gfSBmcm9tICcuLi9wbHVnaW5zL21hcmtkb3duL2ltYWdlJ1xyXG5pbXBvcnQgbWVybWFpZFBsdWdpbiBmcm9tICcuLi9wbHVnaW5zL21hcmtkb3duL3JvdWdoLW1lcm1haWQnXHJcbmltcG9ydCBtYXJrdXBQbHVnaW4gZnJvbSAnLi4vcGx1Z2lucy9tYXJrZG93bi9tYXJrdXAnXHJcbmltcG9ydCB1c2VEZWZpbmVQbHVnaW4gZnJvbSAndml0ZXByZXNzLXBsdWdpbi1tYXJrZG93bi1kZWZpbmUnXHJcbmltcG9ydCB0YWJzUGx1Z2luIGZyb20gJ0ByZWQtYXN1a2Evdml0ZXByZXNzLXBsdWdpbi10YWJzJ1xyXG5pbXBvcnQgeyBncm91cEljb25NZFBsdWdpbiB9IGZyb20gJ3ZpdGVwcmVzcy1wbHVnaW4tZ3JvdXAtaWNvbnMnXHJcbmltcG9ydCB7IGRlbW9QcmV2aWV3UGx1Z2luIH0gZnJvbSAnQHZpdGVwcmVzcy1jb2RlLXByZXZpZXcvcGx1Z2luJ1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcclxuaW1wb3J0IGFuY2hvciBmcm9tICdtYXJrZG93bi1pdC1hbmNob3InXHJcbmltcG9ydCBFeHBsMyBmcm9tICcuLi9hc3NldHMvbGF0ZXhzL0xhVGVYLUV4cGwzLnRtTGFuZ3VhZ2UuanNvbic7XHJcblxyXG5jb25zdCBDT05TVFMgPSB7XHJcbiAgX19jdXN0b21fdmFyaWFibGVfXzogJ3lvdXIgdmFsdWUnXHJcbn1cclxuXHJcbmNvbnN0IG1hcmtkb3duOiBNYXJrZG93bk9wdGlvbnMgfCB1bmRlZmluZWQgPSB7XHJcbiAgbGluZU51bWJlcnM6IHRydWUsXHJcbiAgbGlua2lmeTogdHJ1ZSxcclxuICBtYXRoOiB0cnVlLFxyXG4gIGFuY2hvcjoge1xyXG4gICAgLy8gcGVybWFsaW5rOiBhbmNob3IucGVybWFsaW5rLmFyaWFIaWRkZW4oeyAvLyB5b3UgY2FuIHVzZSBvdGhlciB2YXJpYW50cyB0b28sIHJlZmVyIC0gaHR0cHM6Ly9naXRodWIuY29tL3ZhbGVyaWFuZ2FsbGlhdC9tYXJrZG93bi1pdC1hbmNob3IjcGVybWFsaW5rc1xyXG4gICAgLy8gICBzeW1ib2w6IGBcdUQ4M0RcdUREMTdgXHJcbiAgICAvLyB9KVxyXG4gIH0sXHJcbiAgLy8gQHRzLWlnbm9yZVxyXG4gIGxhbmd1YWdlczogW0V4cGwzXSxcclxuICAvLyBcdTlFRDhcdThCQTRcdTc5ODFcdTc1MjhcdTU2RkVcdTcyNDdcdTYxRDJcdTUyQTBcdThGN0RcclxuICAvL0B0cy1pZ25vcmVcclxuICBsYXp5TG9hZGluZzogdHJ1ZSxcclxuICB0aGVtZTogeyBsaWdodDogJ2NhdHBwdWNjaW4tbGF0dGUnLCBkYXJrOiAnY2F0cHB1Y2Npbi1tb2NoYScgfSxcclxuICBjb25maWc6IChtZCkgPT4ge1xyXG4gICAgdXNlRGVmaW5lUGx1Z2luKG1kLCBDT05TVFMpXHJcblxyXG4gICAgbWQudXNlKGZvb3Rub3RlKTtcclxuICAgIG1kLnVzZSh0YXNrbGlzdCk7XHJcbiAgICBtZC51c2UocnVieSk7XHJcbiAgICBtZC51c2UoZnJvbnRtYXR0ZXIpO1xyXG4gICAgbWQudXNlKG1hcmtkb3duU3VwKTtcclxuICAgIG1kLnVzZShtYXJrZG93blN1Yik7XHJcbiAgICBtZC51c2UoaGFzaG1lbnRpb24pXHJcbiAgICBtZC51c2UoTWFya2Rvd25JdFRvZG9MaXN0cywge1xyXG4gICAgICBlbmFibGVkOiB0cnVlXHJcbiAgICB9KVxyXG4gICAgbWQudXNlKE1hcmtkb3duSXRWYXJpYWJsZSlcclxuICAgIG1kLnVzZTxPcHRpb25zPih3b3JkbGVzcywge3N1cHBvcnRXb3JkbGVzczogW2NoaW5lc2VBbmRKYXBhbmVzZV19KVxyXG4gICAgbWFya2Rvd25JdE1hcmsobWQpXHJcbiAgICBtYXJrZG93bkxpbmtzKG1kLCB7XHJcbiAgICAgIGV4dGVybmFsQ2xhc3NOYW1lOiBcImN1c3RvbS1leHRlcm5hbC1saW5rXCIsXHJcbiAgICAgIGludGVybmFsQ2xhc3NOYW1lOiBcImN1c3RvbS1pbnRlcm5hbC1saW5rXCIsXHJcbiAgICAgIGludGVybmFsRG9tYWluczogWyBcImh0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvXCIgXVxyXG4gICAgfSlcclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIG1hcmtkb3duSXRTdGVwcGVyKG1kKVxyXG4gICAgLy8gbWQudXNlKGZpdG1lZGlhLCB7XHJcbiAgICAvLyAgIC8vZGVmYXVsdCBvcHRpb25zLCB5b3UgY2FuIG9taXQgdGhlc2VcclxuICAgIC8vICAgaW1nRGlyOiBcIlwiLFxyXG4gICAgLy8gICBpbWdMYXp5TG9hZDogdHJ1ZSxcclxuICAgIC8vICAgaW1nRGVjb2Rpbmc6IFwiYXV0b1wiLFxyXG4gICAgLy8gICBmaXRFbGVtZW50czogW1wiaWZyYW1lXCIsIFwidmlkZW9cIl0sXHJcbiAgICAvLyB9KVxyXG4gICAgc3RyaWtldGhyb3VnaChtZClcclxuICAgIG1kLnVzZShsaWdodGJveCwge30pO1xyXG4gICAgbWQudXNlKG5hbWVkQ29kZSwge2lzRW5hYmxlSW5saW5lQ3NzOiB0cnVlfSk7XHJcbiAgICBtZC51c2UobGF6eV9sb2FkaW5nKTtcclxuICAgIG1kLnVzZSh0aW1lbGluZSk7XHJcbiAgICB0YWJzUGx1Z2luKG1kKVxyXG4gICAgbWQudXNlKGdyb3VwSWNvbk1kUGx1Z2luKVxyXG4gICAgbWQudXNlKG1lcm1haWRQbHVnaW4pXHJcbiAgICBtZC51c2UobWFya3VwUGx1Z2luKVxyXG4gICAgbWQudXNlKE1hcmtkb3duSXRDb2xsYXBzaWJsZSk7XHJcblxyXG4gICAgY29uc3QgZG9jUm9vdCA9IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi4vLi4vJywgaW1wb3J0Lm1ldGEudXJsKSlcclxuICAgIG1kLnVzZShkZW1vUHJldmlld1BsdWdpbiwge1xyXG4gICAgICBkb2NSb290XHJcbiAgICB9KVxyXG5cclxuICAgIG1kLnVzZShJbWFnZVBsdWdpbilcclxuXHJcbiAgICAvLyBcdTU3MjhcdTYyNDBcdTY3MDlcdTY1ODdcdTY4NjNcdTc2ODQ8aDE+XHU2ODA3XHU3QjdFXHU1NDBFXHU2REZCXHU1MkEwPEFydGljbGVNZXRhZGF0YS8+XHU3RUM0XHU0RUY2XHJcbiAgICBtZC5yZW5kZXJlci5ydWxlcy5oZWFkaW5nX2Nsb3NlID0gKHRva2VucywgaWR4LCBvcHRpb25zLCBlbnYsIHNsZikgPT4ge1xyXG4gICAgICBsZXQgaHRtbFJlc3VsdCA9IHNsZi5yZW5kZXJUb2tlbih0b2tlbnMsIGlkeCwgb3B0aW9ucyk7XHJcbiAgICAgIGlmICh0b2tlbnNbaWR4XS50YWcgPT09ICdoMScpIHtcclxuICAgICAgICBodG1sUmVzdWx0ICs9IGBcXG48Q2xpZW50T25seT48QXJ0aWNsZU1ldGFkYXRhIDpmcm9udG1hdHRlcj1cIiRmcm9udG1hdHRlclwiLz48L0NsaWVudE9ubHk+YFxyXG4gICAgICB9XHJcbiAgICAgIC8vIGlmICh0b2tlbnNbaWR4XS50YWcgPT09ICdoMScpIGh0bWxSZXN1bHQgKz0gYFxcbjxDbGllbnRPbmx5PjxBcnRpY2xlTWV0YWRhdGEgdi1pZj1cIigkZnJvbnRtYXR0ZXI/LmFzaWRlID8/IHRydWUpICYmICgkZnJvbnRtYXR0ZXI/LnNob3dBcnRpY2xlTWV0YWRhdGEgPz8gdHJ1ZSlcIiA6YXJ0aWNsZT1cIiRmcm9udG1hdHRlclwiIC8+PC9DbGllbnRPbmx5PmA7XHJcbiAgICAgIHJldHVybiBodG1sUmVzdWx0O1xyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuXHJcbmV4cG9ydCB7XHJcbiAgbWFya2Rvd25cclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxwbHVnaW5zXFxcXG1hcmtkb3duXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxccGx1Z2luc1xcXFxtYXJrZG93blxcXFxpbWFnZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovR2l0aHViL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby8udml0ZXByZXNzL3BsdWdpbnMvbWFya2Rvd24vaW1hZ2UudHNcIjtpbXBvcnQgdHlwZSBNYXJrZG93bkl0IGZyb20gJ21hcmtkb3duLWl0J1xyXG5leHBvcnQgZnVuY3Rpb24gSW1hZ2VQbHVnaW4obWQ6IE1hcmtkb3duSXQpIHtcclxuICBjb25zdCBpbWFnZVJlbmRlciA9IG1kLnJlbmRlcmVyLnJ1bGVzLmltYWdlISAvLyBcdTVDM0VcdTkwRThcdTc2ODRcdThGRDlcdTRFMkFcdTYxMUZcdTUzRjlcdTUzRjdcdTc2ODRcdTYxMEZcdTYwMURcdTY2MkZcdTY1QURcdThBMDBcdTZCNjRcdTUzRDhcdTkxQ0ZcdTgwQUZcdTVCOUFcdTY3MDlcdTUwM0NcclxuICBtZC5yZW5kZXJlci5ydWxlcy5pbWFnZSA9ICguLi5hcmdzKSA9PiB7XHJcbiAgICBjb25zdCBbdG9rZW5zLCBpZHhdID0gYXJnc1xyXG4gICAgaWYgKHRva2Vuc1tpZHggKyAyXSAmJiAvXjwhLS0uKi0tPi8udGVzdCh0b2tlbnNbaWR4ICsgMl0uY29udGVudCkpIHtcclxuICAgICAgY29uc3QgZGF0YSA9IHRva2Vuc1tpZHggKyAyXS5jb250ZW50XHJcbiAgICAgIGlmICgvc2l6ZT0vLnRlc3QoZGF0YSkpIHtcclxuICAgICAgICBjb25zdCBzaXplID0gZGF0YS5tYXRjaCgvc2l6ZT0oXFxkKykoeFxcZCspPy8pXHJcbiAgICAgICAgdG9rZW5zW2lkeF0uYXR0cnM/LnB1c2goXHJcbiAgICAgICAgICBbJ3dpZHRoJywgc2l6ZT8uWzFdIHx8ICcnXSxcclxuICAgICAgICAgIFsnaGVpZ2h0Jywgc2l6ZT8uWzJdPy5zdWJzdHJpbmcoMSkgfHwgc2l6ZT8uWzFdIHx8ICcnXVxyXG4gICAgICAgIClcclxuICAgICAgfVxyXG5cclxuICAgICAgdG9rZW5zW2lkeF0uYXR0cnM/LnB1c2goWydsb2FkaW5nJywgJ2xhenknXSwgWydkZWNvZGluZycsICdhc3luYyddKVxyXG4gICAgICB0b2tlbnNbaWR4ICsgMl0uY29udGVudCA9ICcnXHJcbiAgICAgIHJldHVybiBpbWFnZVJlbmRlciguLi5hcmdzKVxyXG4gICAgfVxyXG4gICAgdG9rZW5zW2lkeF0uYXR0cnM/LnB1c2goWydsb2FkaW5nJywgJ2xhenknXSwgWydkZWNvZGluZycsICdhc3luYyddKVxyXG4gICAgcmV0dXJuIGltYWdlUmVuZGVyKC4uLmFyZ3MpXHJcbiAgfVxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHBsdWdpbnNcXFxcbWFya2Rvd25cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxwbHVnaW5zXFxcXG1hcmtkb3duXFxcXHJvdWdoLW1lcm1haWQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9wbHVnaW5zL21hcmtkb3duL3JvdWdoLW1lcm1haWQudHNcIjtpbXBvcnQgdHlwZSBNYXJrZG93bkl0IGZyb20gJ21hcmtkb3duLWl0J1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcm91Z2hNZXJtYWlkUGx1Z2luKG1kOiBNYXJrZG93bkl0KTogdm9pZCB7XHJcbiAgLy8gXHU0RkREXHU1QjU4XHU1MzlGXHU2NzA5XHU3Njg0IGZlbmNlIFx1NTFGRFx1NjU3MFxyXG4gIGNvbnN0IGZlbmNlID0gbWQucmVuZGVyZXIucnVsZXMuZmVuY2U/LmJpbmQobWQucmVuZGVyZXIucnVsZXMpXHJcbiAgLy8gXHU1QjlBXHU0RTQ5XHU2MjExXHU0RUVDXHU4MUVBXHU1REYxXHU3Njg0IGZlbmNlIFx1NTFGRFx1NjU3MFxyXG4gIG1kLnJlbmRlcmVyLnJ1bGVzLmZlbmNlID0gKHRva2VucywgaWR4LCBvcHRpb25zLCBlbnYsIHNlbGYpID0+IHtcclxuICAgIC8vIFx1OTAxQVx1OEZDN3Rva2VuXHU0RTBBXHU3Njg0IGluZm8gXHU4M0I3XHU1M0Q2XHU0RUUzXHU3ODAxXHU1NzU3XHU3Njg0XHU4QkVEXHU4QTAwXHJcbiAgICBjb25zdCB0b2tlbiA9IHRva2Vuc1tpZHhdXHJcbiAgICBjb25zdCBsYW5ndWFnZSA9IHRva2VuLmluZm8udHJpbSgpXHJcblxyXG4gICAgaWYgKGxhbmd1YWdlLnN0YXJ0c1dpdGgoJ21lcm1haWQnKSkge1xyXG4gICAgICAvLyBcdTVDMDZcdTRFRTNcdTc4MDFcdTU3NTdcdTZFMzJcdTY3RDNcdTYyMTAgaHRtbFx1RkYwQ1x1OEZEOVx1OTFDQ1x1NjZGRlx1NjM2Mlx1NjIxMFx1NjIxMVx1NEVFQ1x1ODFFQVx1NURGMVx1NUI5QVx1NEU0OVx1NzY4NHZ1ZVx1N0VDNFx1NEVGNlxyXG4gICAgICByZXR1cm4gYFxyXG4gICAgICAgIDxTdXNwZW5zZT5cclxuICAgICAgICAgIDx0ZW1wbGF0ZSAjZGVmYXVsdD5cclxuICAgICAgICAgICAgPENsaWVudE9ubHk+XHJcbiAgICAgICAgICAgICAgPFN0eWxlZE1lcm1haWQgaWQ9XCJtZXJtYWlkLSR7aWR4fVwiIGNvZGU9XCIke2VuY29kZVVSSUNvbXBvbmVudCh0b2tlbi5jb250ZW50KX1cIj48L1N0eWxlZE1lcm1haWQ+XHJcbiAgICAgICAgICAgIDwvQ2xpZW50T25seT5cclxuICAgICAgICAgIDwvdGVtcGxhdGU+XHJcbiAgICAgICAgICA8IS0tIGxvYWRpbmcgc3RhdGUgdmlhICNmYWxsYmFjayBzbG90IC0tPlxyXG4gICAgICAgICAgPHRlbXBsYXRlICNmYWxsYmFjaz5cclxuICAgICAgICAgICAgTG9hZGluZy4uLlxyXG4gICAgICAgICAgPC90ZW1wbGF0ZT5cclxuICAgICAgICA8L1N1c3BlbnNlPmA7XHJcbiAgICB9XHJcbiAgICAvLyBcdTVCRjlcdTRFMERcdTY2MkZcdTYyMTFcdTRFRUNcdTk3MDBcdTg5ODFcdTc2ODRcdTRFRTNcdTc4MDFcdTU3NTdcdTc2ODRcdTc2RjRcdTYzQTVcdThDMDNcdTc1MjhcdTUzOUZcdTY3MDlcdTc2ODRcdTUxRkRcdTY1NzBcclxuICAgIHJldHVybiBmZW5jZSEodG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiwgc2VsZilcclxuICB9XHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxccGx1Z2luc1xcXFxtYXJrZG93blwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHBsdWdpbnNcXFxcbWFya2Rvd25cXFxcbWFya3VwLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3MvcGx1Z2lucy9tYXJrZG93bi9tYXJrdXAudHNcIjtpbXBvcnQgdHlwZSBNYXJrZG93bkl0IGZyb20gJ21hcmtkb3duLWl0J1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbWFya3VwUGx1Z2luKG1kOiBNYXJrZG93bkl0KTogdm9pZCB7XHJcbiAgLy8gXHU0RkREXHU1QjU4XHU1MzlGXHU2NzA5XHU3Njg0IGZlbmNlIFx1NTFGRFx1NjU3MFxyXG4gIGNvbnN0IGZlbmNlID0gbWQucmVuZGVyZXIucnVsZXMuZmVuY2U/LmJpbmQobWQucmVuZGVyZXIucnVsZXMpXHJcbiAgLy8gXHU1QjlBXHU0RTQ5XHU2MjExXHU0RUVDXHU4MUVBXHU1REYxXHU3Njg0IGZlbmNlIFx1NTFGRFx1NjU3MFxyXG4gIG1kLnJlbmRlcmVyLnJ1bGVzLmZlbmNlID0gKHRva2VucywgaWR4LCBvcHRpb25zLCBlbnYsIHNlbGYpID0+IHtcclxuICAgIC8vIFx1OTAxQVx1OEZDN3Rva2VuXHU0RTBBXHU3Njg0IGluZm8gXHU4M0I3XHU1M0Q2XHU0RUUzXHU3ODAxXHU1NzU3XHU3Njg0XHU4QkVEXHU4QTAwXHJcbiAgICBjb25zdCB0b2tlbiA9IHRva2Vuc1tpZHhdXHJcbiAgICBjb25zdCBsYW5ndWFnZSA9IHRva2VuLmluZm8udHJpbSgpXHJcblxyXG4gICAgaWYgKGxhbmd1YWdlLnN0YXJ0c1dpdGgoJ21hcmt1cCcpKSB7XHJcbiAgICAgIC8vIFx1NUMwNlx1NEVFM1x1NzgwMVx1NTc1N1x1NkUzMlx1NjdEM1x1NjIxMCBodG1sXHVGRjBDXHU4RkQ5XHU5MUNDXHU2NkZGXHU2MzYyXHU2MjEwXHU2MjExXHU0RUVDXHU4MUVBXHU1REYxXHU1QjlBXHU0RTQ5XHU3Njg0dnVlXHU3RUM0XHU0RUY2XHJcbiAgICAgIHJldHVybiBgPENsaWVudE9ubHk+PE1hcmt1cFZpZXcgaWQ9XCJtYXJrdXAtJHtpZHh9XCIgY29kZT1cIiR7ZW5jb2RlVVJJQ29tcG9uZW50KHRva2VuLmNvbnRlbnQpfVwiPjwvTWFya3VwVmlldz48L0NsaWVudE9ubHk+YFxyXG4gICAgfVxyXG4gICAgLy8gXHU1QkY5XHU0RTBEXHU2NjJGXHU2MjExXHU0RUVDXHU5NzAwXHU4OTgxXHU3Njg0XHU0RUUzXHU3ODAxXHU1NzU3XHU3Njg0XHU3NkY0XHU2M0E1XHU4QzAzXHU3NTI4XHU1MzlGXHU2NzA5XHU3Njg0XHU1MUZEXHU2NTcwXHJcbiAgICByZXR1cm4gZmVuY2UhKHRva2VucywgaWR4LCBvcHRpb25zLCBlbnYsIHNlbGYpXHJcbiAgfVxyXG59XHJcbiIsICJ7XHJcbiAgXCJuYW1lXCI6IFwiTGFUZVgtRXhwbDNcIixcclxuICBcInBhdHRlcm5zXCI6IFtcclxuICAgIHtcclxuICAgICAgXCJiZWdpblwiOiBcIihcXFxcJFxcXFwkfFxcXFwkKVwiLFxyXG4gICAgICBcImJlZ2luQ2FwdHVyZXNcIjoge1xyXG4gICAgICAgIFwiMVwiOiB7XHJcbiAgICAgICAgICBcIm5hbWVcIjogXCJwdW5jdHVhdGlvbi5zZWN0aW9uLmdyb3VwLmJlZ2luLnRleFwiXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBcImVuZFwiOiBcIihcXFxcMSlcIixcclxuICAgICAgXCJlbmRDYXB0dXJlc1wiOiB7XHJcbiAgICAgICAgXCIxXCI6IHtcclxuICAgICAgICAgIFwibmFtZVwiOiBcInB1bmN0dWF0aW9uLnNlY3Rpb24uZ3JvdXAuZW5kLnRleFwiXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBcIm5hbWVcIjogXCJzdXBwb3J0LmNsYXNzLm1hdGgudGV4XCIsXHJcbiAgICAgIFwicGF0dGVybnNcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwibWF0Y2hcIjogXCJcXFxcXFxcXFxcXFwkXCIsXHJcbiAgICAgICAgICBcIm5hbWVcIjogXCJjb25zdGFudC5jaGFyYWN0ZXIuZXNjYXBlLnRleFwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcImluY2x1ZGVcIjogXCIjbGF0ZXgzXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwiaW5jbHVkZVwiOiBcInRleHQudGV4I21hdGhcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJpbmNsdWRlXCI6IFwiJGJhc2VcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgXCJiZWdpblwiOiBcIlxcXFxcXFxcXFxcXChcIixcclxuICAgICAgXCJiZWdpbkNhcHR1cmVzXCI6IHtcclxuICAgICAgICBcIjBcIjoge1xyXG4gICAgICAgICAgXCJuYW1lXCI6IFwicHVuY3R1YXRpb24uc2VjdGlvbi5ncm91cC5iZWdpbi50ZXhcIlxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgXCJlbmRcIjogXCJcXFxcXFxcXFxcXFwpXCIsXHJcbiAgICAgIFwiZW5kQ2FwdHVyZXNcIjoge1xyXG4gICAgICAgIFwiMFwiOiB7XHJcbiAgICAgICAgICBcIm5hbWVcIjogXCJwdW5jdHVhdGlvbi5zZWN0aW9uLmdyb3VwLmVuZC50ZXhcIlxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgXCJuYW1lXCI6IFwic3VwcG9ydC5jbGFzcy5tYXRoLnRleFwiLFxyXG4gICAgICBcInBhdHRlcm5zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcImluY2x1ZGVcIjogXCIjbGF0ZXgzXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwiaW5jbHVkZVwiOiBcInRleHQudGV4I21hdGhcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJpbmNsdWRlXCI6IFwiJGJhc2VcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgXCJiZWdpblwiOiBcIlxcXFxcXFxcXFxcXFtcIixcclxuICAgICAgXCJiZWdpbkNhcHR1cmVzXCI6IHtcclxuICAgICAgICBcIjBcIjoge1xyXG4gICAgICAgICAgXCJuYW1lXCI6IFwicHVuY3R1YXRpb24uc2VjdGlvbi5ncm91cC5iZWdpbi50ZXhcIlxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgXCJlbmRcIjogXCJcXFxcXFxcXFxcXFxdXCIsXHJcbiAgICAgIFwiZW5kQ2FwdHVyZXNcIjoge1xyXG4gICAgICAgIFwiMFwiOiB7XHJcbiAgICAgICAgICBcIm5hbWVcIjogXCJwdW5jdHVhdGlvbi5zZWN0aW9uLmdyb3VwLmVuZC50ZXhcIlxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgXCJuYW1lXCI6IFwic3VwcG9ydC5jbGFzcy5tYXRoLnRleFwiLFxyXG4gICAgICBcInBhdHRlcm5zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcImluY2x1ZGVcIjogXCIjbGF0ZXgzXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwiaW5jbHVkZVwiOiBcInRleHQudGV4I21hdGhcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJpbmNsdWRlXCI6IFwiJGJhc2VcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgXCJpbmNsdWRlXCI6IFwiI2xhdGV4M1wiXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBcImluY2x1ZGVcIjogXCJ0ZXh0LnRleC5sYXRleFwiXHJcbiAgICB9XHJcbiAgXSxcclxuICBcInJlcG9zaXRvcnlcIjoge1xyXG4gICAgXCJsYXRleDNcIjoge1xyXG4gICAgICBcInBhdHRlcm5zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcImNhcHR1cmVzXCI6IHtcclxuICAgICAgICAgICAgXCIxXCI6IHtcclxuICAgICAgICAgICAgICBcIm5hbWVcIjogXCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLmZ1bmN0aW9uLmV4cGwubGF0ZXhcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgXCJtYXRjaFwiOiBcIihcXFxcXFxcXHxcXFxcLilbXFxcXHdAXSs6XFxcXHcqXCIsXHJcbiAgICAgICAgICBcIm5hbWVcIjogXCJrZXl3b3JkLmNvbnRyb2wuZXhwbC5sYXRleFwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcImNhcHR1cmVzXCI6IHtcclxuICAgICAgICAgICAgXCIxXCI6IHtcclxuICAgICAgICAgICAgICBcIm5hbWVcIjogXCJwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnZhcmlhYmxlLmV4cGwubGF0ZXhcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgXCJtYXRjaFwiOiBcIihcXFxcXFxcXClbXFxcXHdAXStfW1xcXFx3QF0rXCIsXHJcbiAgICAgICAgICBcIm5hbWVcIjogXCJ2YXJpYWJsZS5leHBsLmxhdGV4XCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH1cclxuICB9LFxyXG4gIFwic2NvcGVOYW1lXCI6IFwidGV4dC50ZXgubGF0ZXguZXhwbDNcIlxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3MvY29uZmlnLnRzXCI7aW1wb3J0IHsgdGhlbWVDb25maWcgfSBmcm9tIFwiLi9zcmMvdGhlbWVcIjtcclxuaW1wb3J0IHsgZG9jc0NvbmZpZyB9IGZyb20gXCIuL3NyYy9kb2NzXCI7XHJcbmltcG9ydCB7IGhlYWQgfSBmcm9tIFwiLi9zcmMvaGVhZFwiO1xyXG5pbXBvcnQgeyBtYXJrZG93biB9IGZyb20gXCIuL3NyYy9tYXJrZG93blwiO1xyXG5pbXBvcnQgeyBSc3NQbHVnaW4gfSBmcm9tIFwidml0ZXByZXNzLXBsdWdpbi1yc3NcIjtcclxuaW1wb3J0IHsgUlNTIH0gZnJvbSBcIi4vc3JjL3Jzc1wiO1xyXG4vLyBpbXBvcnQgeyB3aXRoTWVybWFpZCB9IGZyb20gXCJ2aXRlcHJlc3MtcGx1Z2luLW1lcm1haWRcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBIZWFkQ29uZmlnIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG5pbXBvcnQgeyBoYW5kbGVIZWFkTWV0YSB9IGZyb20gXCIuL3V0aWxzL2hhbmRsZUhlYWRNZXRhXCI7XHJcbmltcG9ydCBHaXRSZXZpc2lvbkluZm9QbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tZ2l0LXJldmlzaW9uLWluZm8nO1xyXG5pbXBvcnQgeyBnZXRDaGFuZ2Vsb2dBbmRDb250cmlidXRvcnMgfSBmcm9tICd2aXRlcHJlc3MtcGx1Z2luLWNoYW5nZWxvZydcclxuaW1wb3J0IHZpdGVwcmVzc1Byb3RlY3RQbHVnaW4gZnJvbSBcInZpdGVwcmVzcy1wcm90ZWN0LXBsdWdpblwiXHJcbmltcG9ydCB7IGdyb3VwSWNvblZpdGVQbHVnaW4gfSBmcm9tICd2aXRlcHJlc3MtcGx1Z2luLWdyb3VwLWljb25zJ1xyXG5pbXBvcnQgeyB2aXRlRGVtb1ByZXZpZXdQbHVnaW4gfSBmcm9tICdAdml0ZXByZXNzLWNvZGUtcHJldmlldy9wbHVnaW4nXHJcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCdcclxuaW1wb3J0IHsgQW5ub3VuY2VtZW50UGx1Z2luIH0gZnJvbSAndml0ZXByZXNzLXBsdWdpbi1hbm5vdW5jZW1lbnQnXHJcblxyXG5jb25zdCBjdXN0b21FbGVtZW50cyA9IFtcclxuICBcIm1qeC1jb250YWluZXJcIixcclxuICBcIm1qeC1hc3Npc3RpdmUtbW1sXCIsXHJcbiAgXCJtYXRoXCIsXHJcbiAgXCJtYWN0aW9uXCIsXHJcbiAgXCJtYWxpZ25ncm91cFwiLFxyXG4gIFwibWFsaWdubWFya1wiLFxyXG4gIFwibWVuY2xvc2VcIixcclxuICBcIm1lcnJvclwiLFxyXG4gIFwibWZlbmNlZFwiLFxyXG4gIFwibWZyYWNcIixcclxuICBcIm1pXCIsXHJcbiAgXCJtbG9uZ2RpdlwiLFxyXG4gIFwibW11bHRpc2NyaXB0c1wiLFxyXG4gIFwibW5cIixcclxuICBcIm1vXCIsXHJcbiAgXCJtb3ZlclwiLFxyXG4gIFwibXBhZGRlZFwiLFxyXG4gIFwibXBoYW50b21cIixcclxuICBcIm1yb290XCIsXHJcbiAgXCJtcm93XCIsXHJcbiAgXCJtc1wiLFxyXG4gIFwibXNjYXJyaWVzXCIsXHJcbiAgXCJtc2NhcnJ5XCIsXHJcbiAgXCJtc2NhcnJpZXNcIixcclxuICBcIm1zZ3JvdXBcIixcclxuICBcIm1zdGFja1wiLFxyXG4gIFwibWxvbmdkaXZcIixcclxuICBcIm1zbGluZVwiLFxyXG4gIFwibXN0YWNrXCIsXHJcbiAgXCJtc3BhY2VcIixcclxuICBcIm1zcXJ0XCIsXHJcbiAgXCJtc3Jvd1wiLFxyXG4gIFwibXN0YWNrXCIsXHJcbiAgXCJtc3RhY2tcIixcclxuICBcIm1zdHlsZVwiLFxyXG4gIFwibXN1YlwiLFxyXG4gIFwibXN1cFwiLFxyXG4gIFwibXN1YnN1cFwiLFxyXG4gIFwibXRhYmxlXCIsXHJcbiAgXCJtdGRcIixcclxuICBcIm10ZXh0XCIsXHJcbiAgXCJtdHJcIixcclxuICBcIm11bmRlclwiLFxyXG4gIFwibXVuZGVyb3ZlclwiLFxyXG4gIFwic2VtYW50aWNzXCIsXHJcbiAgXCJtYXRoXCIsXHJcbiAgXCJtaVwiLFxyXG4gIFwibW5cIixcclxuICBcIm1vXCIsXHJcbiAgXCJtc1wiLFxyXG4gIFwibXNwYWNlXCIsXHJcbiAgXCJtdGV4dFwiLFxyXG4gIFwibWVuY2xvc2VcIixcclxuICBcIm1lcnJvclwiLFxyXG4gIFwibWZlbmNlZFwiLFxyXG4gIFwibWZyYWNcIixcclxuICBcIm1wYWRkZWRcIixcclxuICBcIm1waGFudG9tXCIsXHJcbiAgXCJtcm9vdFwiLFxyXG4gIFwibXJvd1wiLFxyXG4gIFwibXNxcnRcIixcclxuICBcIm1zdHlsZVwiLFxyXG4gIFwibW11bHRpc2NyaXB0c1wiLFxyXG4gIFwibW92ZXJcIixcclxuICBcIm1wcmVzY3JpcHRzXCIsXHJcbiAgXCJtc3ViXCIsXHJcbiAgXCJtc3Vic3VwXCIsXHJcbiAgXCJtc3VwXCIsXHJcbiAgXCJtdW5kZXJcIixcclxuICBcIm11bmRlcm92ZXJcIixcclxuICBcIm5vbmVcIixcclxuICBcIm1hbGlnbmdyb3VwXCIsXHJcbiAgXCJtYWxpZ25tYXJrXCIsXHJcbiAgXCJtdGFibGVcIixcclxuICBcIm10ZFwiLFxyXG4gIFwibXRyXCIsXHJcbiAgXCJtbG9uZ2RpdlwiLFxyXG4gIFwibXNjYXJyaWVzXCIsXHJcbiAgXCJtc2NhcnJ5XCIsXHJcbiAgXCJtc2dyb3VwXCIsXHJcbiAgXCJtc2xpbmVcIixcclxuICBcIm1zcm93XCIsXHJcbiAgXCJtc3RhY2tcIixcclxuICBcIm1hY3Rpb25cIixcclxuICBcInNlbWFudGljc1wiLFxyXG4gIFwiYW5ub3RhdGlvblwiLFxyXG4gIFwiYW5ub3RhdGlvbi14bWxcIixcclxuXTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgLy8gbWVybWFpZDoge1xyXG4gIC8vICAgLy8gJ3RoZW1lJzogJ2Jhc2UnLFxyXG4gIC8vICAgLy8gJ3RoZW1lVmFyaWFibGVzJzoge1xyXG4gIC8vICAgLy8gICAncHJpbWFyeUNvbG9yJzogJyM1MDZiZWUnLFxyXG4gIC8vICAgLy8gICAvLyAncHJpbWFyeVRleHRDb2xvcic6ICcjZmZmJyxcclxuICAvLyAgIC8vICAgLy8gJ3ByaW1hcnlCb3JkZXJDb2xvcic6ICcjN0MwMDAwJyxcclxuICAvLyAgIC8vICAgLy8gJ2xpbmVDb2xvcic6ICcjRjhCMjI5JyxcclxuICAvLyAgIC8vICAgLy8gJ3NlY29uZGFyeUNvbG9yJzogJyMwMDYxMDAnLFxyXG4gIC8vICAgLy8gICAvLyAndGVydGlhcnlDb2xvcic6ICcjZmZmJ1xyXG4gIC8vICAgLy8gfSxcclxuICAvLyAgIGZvbnRGYW1pbHk6IFwiQWxpYmFiYVB1SHVpVGksIFx1OTYzRlx1OTFDQ1x1NURGNFx1NURGNFx1NjY2RVx1NjBFMFx1NEY1MyAzLjBcIixcclxuICAvLyAgIGFsdEZvbnRGYW1pbHk6IFwiQWxpYmFiYVB1SHVpVGksIFx1OTYzRlx1OTFDQ1x1NURGNFx1NURGNFx1NjY2RVx1NjBFMFx1NEY1MyAzLjBcIixcclxuICAvLyAgIHN0YXJ0T25Mb2FkOiBmYWxzZVxyXG4gIC8vICAgLy9tZXJtYWlkQ29uZmlnICF0aGVtZSBoZXJlIHdvcmtzIGZvciBsaWd0aCBtb2RlIHNpbmNlIGRhcmsgdGhlbWUgaXMgZm9yY2VkIGluIGRhcmsgbW9kZVxyXG4gIC8vIH0sXHJcbiAgLy8gLy8gXHU1M0VGXHU5MDA5XHU1NzMwXHU0RjdGXHU3NTI4TWVybWFpZFBsdWdpbkNvbmZpZ1x1NEUzQVx1NjNEMlx1NEVGNlx1NjcyQ1x1OEVBQlx1OEJCRVx1N0Y2RVx1OTg5RFx1NTkxNlx1NzY4NFx1OTE0RFx1N0Y2RVxyXG4gIC8vIG1lcm1haWRQbHVnaW46IHtcclxuICAvLyAgIGNsYXNzOiBcIm1lcm1haWQgcm91Z2gtbWVybWFpZFwiIC8vIFx1NEUzQVx1NzIzNlx1NUJCOVx1NTY2OFx1OEJCRVx1N0Y2RVx1OTg5RFx1NTkxNlx1NzY4NENTU1x1N0M3QlxyXG4gIC8vIH0sXHJcbiAgLy8gc3JjRGlyOiAnLicsXHJcbiAgdml0ZToge1xyXG4gICAgbG9nTGV2ZWw6ICdpbmZvJyxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgR2l0UmV2aXNpb25JbmZvUGx1Z2luKCksXHJcbiAgICAgIGdyb3VwSWNvblZpdGVQbHVnaW4oe1xyXG4gICAgICAgIGN1c3RvbUljb246IHtcclxuICAgICAgICAgIGFlOiAnbG9nb3M6YWRvYmUtYWZ0ZXItZWZmZWN0cycsXHJcbiAgICAgICAgICBhaTogJ2xvZ29zOmFkb2JlLWlsbHVzdHJhdG9yJyxcclxuICAgICAgICAgIHBzOiAnbG9nb3M6YWRvYmUtcGhvdG9zaG9wJyxcclxuICAgICAgICAgIC8vIHJzcGFjazogbG9jYWxJY29uTG9hZGVyKGltcG9ydC5tZXRhLnVybCwgJy4uL2Fzc2V0cy9yc3BhY2suc3ZnJyksXHJcbiAgICAgICAgICAvLyBmYXJtOiBsb2NhbEljb25Mb2FkZXIoaW1wb3J0Lm1ldGEudXJsLCAnLi4vYXNzZXRzL2Zhcm0uc3ZnJyksXHJcbiAgICAgICAgfSxcclxuICAgICAgfSksXHJcbiAgICAgIFJzc1BsdWdpbihSU1MpLFxyXG4gICAgICB2aXRlcHJlc3NQcm90ZWN0UGx1Z2luKHtcclxuICAgICAgICBkaXNhYmxlRjEyOiB0cnVlLFxyXG4gICAgICAgIGRpc2FibGVDb3B5OiB0cnVlLFxyXG4gICAgICAgIGRpc2FibGVTZWxlY3Q6IHRydWUsXHJcbiAgICAgIH0pLFxyXG4gICAgICB2aXRlRGVtb1ByZXZpZXdQbHVnaW4oKSxcclxuICAgICAgdnVlSnN4KCksXHJcbiAgICAgIEFubm91bmNlbWVudFBsdWdpbih7XHJcbiAgICAgICAgdGl0bGU6ICdcdTZCMjJcdThGQ0VcdTY3NjVcdTUyMzBDTU9OTy5ORVQnLFxyXG4gICAgICAgIGNsaWVudE9ubHk6IHRydWUsXHJcbiAgICAgICAgZHVyYXRpb246IC0xLFxyXG4gICAgICAgIG1vYmlsZU1pbmlmeTogdHJ1ZSxcclxuICAgICAgICBpY29uOiAnPD94bWwgdmVyc2lvbj1cIjEuMFwiIHN0YW5kYWxvbmU9XCJub1wiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyBcIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOXCIgXCJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGRcIj48c3ZnIHQ9XCIxNzI5NDczNjkyNTAzXCIgY2xhc3M9XCJpY29uXCIgdmlld0JveD1cIjAgMCAxMDI0IDEwMjRcIiB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHAtaWQ9XCIxMTg1NVwiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCI+PHBhdGggZD1cIk04ODIuNSA0MjYuOEM4NzkuNyAyMjUgNzE0IDYzLjYgNTEyLjEgNjZjLTIwMS44LTIuNS0zNjcuNiAxNTktMzcwLjQgMzYwLjggMC4zIDEwNC45IDQ2LjcgMjA0LjMgMTI2LjkgMjcxLjl2MjI3LjdjMC4yIDkuMSA0LjYgMTcuNiAxMiAyMi45IDcuNiA1LjIgMTcuMSA2LjYgMjUuOCAzLjlMNTEyIDg4NS42bDIwNS42IDY3LjdjMi45IDEuMSA2IDEuNyA5LjIgMS43IDUuOSAwLjEgMTEuNy0xLjYgMTYuNi00LjkgNy41LTUuMiAxMi0xMy44IDEyLTIzVjY5OS4zYzgwLjMtNjcuOSAxMjYuNy0xNjcuNSAxMjcuMS0yNzIuNXogbS02ODAuNSAwYzIuNS0xNjguNyAxNDEtMzAzLjUgMzA5LjctMzAxLjYgMTY4LjYtMS45IDMwNyAxMzIuOSAzMDkuNiAzMDEuNi0yLjUgMTY4LjYtMTQwLjkgMzAzLjUtMzA5LjYgMzAxLjYtMTY4LjYgMS45LTMwNy0xMzMtMzA5LjUtMzAxLjZoLTAuMnogbTQ5NS41IDQ2MS4xbC0xNzYuOS01OC4yYy01LjktMi4yLTEyLjQtMi4yLTE4LjQgMGwtMTc2LjcgNTguMlY3MzljMTE1LjUgNjQuOSAyNTYuNiA2NC45IDM3Mi4xIDB2MTQ4LjhsLTAuMSAwLjF6TTU2OSAzNjNjMC03LjYtMi4yLTE1LTYuMy0yMS4zLTQuMS02LjItMTAuMi0xMS0xNy4yLTEzLjQtMTMuNC0zLjctMjcuNC01LjMtNDEuMy00LjVoLTU1Ljd2NzkuNWg1My44YzEyLjIgMC4zIDI0LjQtMSAzNi4yLTQgOC42LTEuNyAxNi41LTYuMSAyMi42LTEyLjQgNS41LTYuNiA4LjQtMTUuMiA3LjktMjMuOXogbS01Ny40LTE3Mi44Yy0xMzIuMy0xLjUtMjQwLjkgMTA0LjMtMjQyLjkgMjM2LjYgMiAxMzIuMyAxMTAuNiAyMzguMSAyNDIuOSAyMzYuNyAxMzIuMyAxLjUgMjQwLjktMTA0LjQgMjQyLjktMjM2LjctMS44LTEzMi40LTExMC41LTIzOC4zLTI0Mi45LTIzNi42eiBtMTE5LjUgMzcxYy0yLjUgNC02LjEgNy4xLTEwLjMgOC45LTQuNiAyLjMtOS43IDMuNS0xNC44IDMuNC02IDAuMS0xMi0xLjQtMTcuMi00LjUtNC43LTMuMi04LjgtNy4yLTEyLTExLjgtNC44LTYuNi05LjItMTMuNS0xMy4yLTIwLjdsLTI0LjEtMzkuMmMtNi41LTExLjYtMTQuMi0yMi41LTIzLTMyLjQtNS42LTYuNi0xMi43LTExLjgtMjAuNy0xNS4xLTguNS0yLjktMTcuNC00LjMtMjYuNC00aC0yMC44djkyLjljMC44IDkuNi0yLjEgMTkuMi04IDI2LjgtNS44IDUuNy0xMy43IDguNy0yMS44IDguNC04LjUgMC42LTE2LjctMi43LTIyLjQtOC45LTUuNy03LjUtOC41LTE2LjgtOC0yNi4zVjMxNmMtMS05LjkgMi4xLTE5LjggOC42LTI3LjQgNy45LTYuNCAxOC05LjQgMjguMS04LjRoOTcuNmMxMS41LTAuMSAyMy4xIDAuNSAzNC42IDEuNyA4LjkgMC45IDE3LjYgMy4yIDI1LjggNi43IDkuMSA0IDE3LjQgOS41IDI0LjcgMTYuMiA3IDcgMTIuNSAxNS40IDE2LjEgMjQuNyAzLjYgOS41IDUuNSAxOS41IDUuNyAyOS42IDAuOSAxOS02IDM3LjYtMTkgNTEuNS0xNS45IDE0LjQtMzUuNiAyNC01Ni44IDI3LjUgMTEuNyA2LjIgMjIgMTQuNiAzMC41IDI0LjcgOS42IDEwLjYgMTguMiAyMiAyNS44IDM0LjEgNi44IDEwLjUgMTIuNyAyMS42IDE3LjggMzMgMy4yIDYuMyA1LjMgMTMuMSA2LjMgMjAuMSAxLjEgNCAwIDguMi0yLjkgMTEuMmgtMC4yelwiIGZpbGw9XCIjRUM2QzAwXCIgcC1pZD1cIjExODU2XCI+PC9wYXRoPjwvc3ZnPicsXHJcbiAgICAgICAgY2xvc2VJY29uOiAnPD94bWwgdmVyc2lvbj1cIjEuMFwiIHN0YW5kYWxvbmU9XCJub1wiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyBcIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOXCIgXCJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGRcIj48c3ZnIHQ9XCIxNzI5NDczNzc3NzUyXCIgY2xhc3M9XCJpY29uXCIgdmlld0JveD1cIjAgMCAxMDI0IDEwMjRcIiB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHAtaWQ9XCIxODAwM1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHdpZHRoPVwiMjAwXCIgaGVpZ2h0PVwiMjAwXCI+PHBhdGggZD1cIk03NTkuNTk0NjY3IDE5NS4ybDkwLjUzODY2NiA5MC41Mzg2NjdMMzA3LjA3MiA4MjguOGwtOTAuNTM4NjY3LTkwLjUzODY2N3pcIiBmaWxsPVwiIzUzNjNEMFwiIHAtaWQ9XCIxODAwNFwiPjwvcGF0aD48cGF0aCBkPVwiTTMwNy4wNzIgMTk1LjJMMjE2LjUzMzMzMyAyODUuNzM4NjY3bDU0My4wNjEzMzQgNTQzLjA2MTMzMyA5MC41Mzg2NjYtOTAuNTM4NjY3elwiIGZpbGw9XCIjNTM2M0QwXCIgcC1pZD1cIjE4MDA1XCI+PC9wYXRoPjwvc3ZnPicsXHJcbiAgICAgICAgb25Sb3V0ZUNoYW5nZWQ6IGZ1bmN0aW9uIChyb3V0ZSwgc2hvd1JlZikge1xyXG4gICAgICAgICAgY29uc29sZS5sb2cocm91dGUsIHNob3dSZWYpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBbXHJcbiAgICAgICAgICB7IHR5cGU6ICd0ZXh0JywgY29udGVudDogJ1x1RDgzRFx1REM0N1x1Nzc4NVx1Nzc4NVx1NEVENlx1RDgzRFx1REM0NycgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlJyxcclxuICAgICAgICAgICAgc3JjOiAnaHR0cHM6Ly9jaGFuZ3dlaWh1YS5naXRodWIuaW8vYXV0aG9yLmpwZydcclxuICAgICAgICAgIH1cclxuICAgICAgICBdLFxyXG4gICAgICAgIGZvb3RlcjogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0eXBlOiAnYnV0dG9uJyxcclxuICAgICAgICAgICAgY29udGVudDogJ1x1NTU2NVx1OTBGRFx1NEUwRFx1NjYyRlx1NTQ2MicsXHJcbiAgICAgICAgICAgIGxpbms6ICdodHRwczovL2NoYW5nd2VpaHVhLmdpdGh1Yi5pbydcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSlcclxuICAgIF0sXHJcbiAgfSxcclxuICB2dWU6IHtcclxuICAgIHRlbXBsYXRlOiB7XHJcbiAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xyXG4gICAgICAgIGlzQ3VzdG9tRWxlbWVudDogKHRhZykgPT4gY3VzdG9tRWxlbWVudHMuaW5jbHVkZXModGFnKSxcclxuICAgICAgICB3aGl0ZXNwYWNlOiAncHJlc2VydmUnICAgICAgLy8gWyFjb2RlICsrXSBcdTkxQ0RcdTcwQjk6XHU4QkJFXHU3RjZFd2hpdGVzcGFjZTogJ3ByZXNlcnZlJ1x1NjYyRlx1NEUzQVx1NEU4Nlx1NEZERFx1NzU1OU1hcmtkb3duXHU0RTJEXHU3Njg0XHU3QTdBXHU2ODNDXHVGRjBDXHU0RUU1XHU0RkJGTGl0ZVRyZWVcdTUzRUZcdTRFRTVcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTBsaXRlXHU2ODNDXHU1RjBGXHU3Njg0XHU2ODExXHU2NTcwXHU2MzZFXHUzMDAyXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgLyogXHU2NTg3XHU2ODYzXHU5MTREXHU3RjZFICovXHJcbiAgLi4uZG9jc0NvbmZpZyxcclxuICAvKiBcdTY4MDdcdTU5MzRcdTkxNERcdTdGNkUgKi9cclxuICBoZWFkLFxyXG4gIC8qIFx1NEUzQlx1OTg5OFx1OTE0RFx1N0Y2RSAqL1xyXG4gIHRoZW1lQ29uZmlnLFxyXG4gIG1hcmtkb3duLFxyXG4gIG1ldGFDaHVuazogdHJ1ZSxcclxuICBzaXRlbWFwOiB7XHJcbiAgICBob3N0bmFtZTogXCJodHRwczovL2NoYW5nd2VpaHVhLmdpdGh1Yi5pb1wiLFxyXG4gICAgbGFzdG1vZERhdGVPbmx5OiBmYWxzZSxcclxuICAgIHRyYW5zZm9ybUl0ZW1zOiAoaXRlbXMpID0+IHtcclxuICAgICAgLy8gYWRkIG5ldyBpdGVtcyBvciBtb2RpZnkvZmlsdGVyIGV4aXN0aW5nIGl0ZW1zXHJcbiAgICAgIGl0ZW1zLnB1c2goe1xyXG4gICAgICAgIHVybDogXCIvZXh0cmEtcGFnZVwiLFxyXG4gICAgICAgIGNoYW5nZWZyZXE6IFwibW9udGhseVwiLFxyXG4gICAgICAgIHByaW9yaXR5OiAwLjgsXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gaXRlbXM7XHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcmV3cml0ZXM6IHtcclxuICAgICdeL2luZGV4Lm1kJzogJy96aC1DTi9pbmRleC5tZCcsXHJcbiAgfSxcclxuICBpZ25vcmVEZWFkTGlua3M6IHRydWUsXHJcbiAgYXN5bmMgdHJhbnNmb3JtSGVhZChjb250ZXh0KTogUHJvbWlzZTxIZWFkQ29uZmlnW10+IHtcclxuICAgIC8vIGNvbnN0IHsgYXNzZXRzIH09IGNvbnRleHRcclxuICAgIGNvbnN0IGhlYWQgPSBoYW5kbGVIZWFkTWV0YShjb250ZXh0KVxyXG5cclxuICAgIHJldHVybiBoZWFkXHJcbiAgfSxcclxuICBhc3luYyB0cmFuc2Zvcm1QYWdlRGF0YShwYWdlRGF0YSkge1xyXG4gICAgY29uc3QgeyBpc05vdEZvdW5kLCByZWxhdGl2ZVBhdGggfSA9IHBhZ2VEYXRhXHJcbiAgICBjb25zdCB7IGNvbnRyaWJ1dG9ycywgY2hhbmdlbG9nIH0gPSBhd2FpdCBnZXRDaGFuZ2Vsb2dBbmRDb250cmlidXRvcnMocmVsYXRpdmVQYXRoKVxyXG4gICAgY29uc3QgQ3VzdG9tQXZhdGFycyA9IHtcclxuICAgICAgJ2NoYW5nd2VpaHVhJzogJzI4NzcyMDEnXHJcbiAgICB9XHJcbiAgICBjb25zdCBDdXN0b21Db250cmlidXRvcnMgPSBjb250cmlidXRvcnMubWFwKGNvbnRyaWJ1dG9yID0+IHtcclxuICAgICAgY29udHJpYnV0b3IuYXZhdGFyID0gYGh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8ke0N1c3RvbUF2YXRhcnNbY29udHJpYnV0b3IubmFtZV19P3Y9NGBcclxuICAgICAgcmV0dXJuIGNvbnRyaWJ1dG9yXHJcbiAgICB9KVxyXG5cclxuICAgIGlmIChpc05vdEZvdW5kKSB7XHJcbiAgICAgIHBhZ2VEYXRhLnRpdGxlID0gJ05vdCBGb3VuZCdcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBDb21taXREYXRhOiB7XHJcbiAgICAgICAgY29udHJpYnV0b3JzOiBDdXN0b21Db250cmlidXRvcnMsXHJcbiAgICAgICAgY2hhbmdlbG9nLFxyXG4gICAgICAgIGNvbW1pdFVSTDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9jaGFuZ3dlaWh1YS9jaGFuZ3dlaWh1YS5naXRodWIuaW8vY29tbWl0LycsXHJcbiAgICAgICAgdGl0bGU6ICdDaGFuZ2Vsb2cnXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxccnNzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL3Jzcy50c1wiO2ltcG9ydCB7IFJTU09wdGlvbnMgfSBmcm9tICd2aXRlcHJlc3MtcGx1Z2luLXJzcydcclxuXHJcbmNvbnN0IHJzc0Jhc2VVcmwgPSBwcm9jZXNzLmVudi5WSVRFX0FQUF9SU1NfQkFTRV9VUkwgfHwgJ2h0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvJyAvL2ltcG9ydC5tZXRhLmVudi5WSVRFX0FQUF9SU1NfQkFTRV9VUkw7XHJcblxyXG5jb25zdCBSU1M6IFJTU09wdGlvbnMgPSB7XHJcbiAgLy8gbmVjZXNzYXJ5XHVGRjA4XHU1RkM1XHU5MDA5XHU1M0MyXHU2NTcwXHVGRjA5XHJcbiAgdGl0bGU6ICdDTU9OTy5ORVQnLFxyXG4gIGJhc2VVcmw6IHJzc0Jhc2VVcmwsXHJcbiAgaWNvbjogJzxzdmcgdD1cIjE2OTI2NzA2MDc0NDdcIiBjbGFzcz1cImljb25cIiB2aWV3Qm94PVwiMCAwIDEwMjQgMTAyNFwiIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgcC1pZD1cIjY1MzJcIiB3aWR0aD1cIjEyOFwiIGhlaWdodD1cIjEyOFwiPjxwYXRoIGQ9XCJNMjY1LjIxNiA3NTguNzg0YzIyLjUyOCAyMi41MjggMzQuODE2IDUxLjIgMzQuODE2IDgzLjk2OCAwIDMyLjc2OC0xMy4zMTIgNjIuNDY0LTM0LjgxNiA4My45NjgtMjIuNTI4IDIyLjUyOC01My4yNDggMzQuODE2LTgzLjk2OCAzNC44MTYtMzIuNzY4IDAtNjIuNDY0LTEzLjMxMi04My45NjgtMzQuODE2QzczLjcyOCA5MDUuMjE2IDYxLjQ0IDg3NC40OTYgNjEuNDQgODQzLjc3NmMwLTMyLjc2OCAxMy4zMTItNjIuNDY0IDM0LjgxNi04My45NjggMjIuNTI4LTIyLjUyOCA1MS4yLTM0LjgxNiA4My45NjgtMzQuODE2IDMzLjc5Mi0xLjAyNCA2Mi40NjQgMTIuMjg4IDg0Ljk5MiAzMy43OTJ6TTYxLjQ0IDM2Ny42MTZ2MTcyLjAzMmMxMTEuNjE2IDAgMjE4LjExMiA0NC4wMzIgMjk2Ljk2IDEyMi44OFM0ODEuMjggODQ4Ljg5NiA0ODEuMjggOTYyLjU2aDE3Mi4wMzJjMC0xNjMuODQtNjYuNTYtMzEyLjMyLTE3NC4wOC00MTkuODRDMzczLjc2IDQzNi4yMjQgMjI1LjI4IDM2OS42NjQgNjEuNDQgMzY3LjYxNnpNNjEuNDQgNjEuNDR2MTcyLjAzMmM0MDIuNDMyIDAgNzI5LjA4OCAzMjYuNjU2IDcyOS4wODggNzI5LjA4OEg5NjIuNTZjMC0yNDcuODA4LTEwMS4zNzYtNDczLjA4OC0yNjQuMTkyLTYzNi45MjhDNTM2LjU3NiAxNjMuODQgMzExLjI5NiA2My40ODggNjEuNDQgNjEuNDR6XCIgZmlsbD1cIiNFQkEzM0FcIiBwLWlkPVwiNjUzM1wiPjwvcGF0aD48L3N2Zz4nLFxyXG4gIGNvcHlyaWdodDogJ0NvcHlyaWdodCAoYykgMjAxMy1wcmVzZW50LCBDTU9OTy5ORVQnLFxyXG5cclxuICAvLyBvcHRpb25hbFx1RkYwOFx1NTNFRlx1OTAwOVx1NTNDMlx1NjU3MFx1RkYwOVxyXG4gIGxhbmd1YWdlOiAnemgtY24nLFxyXG4gIGF1dGhvcjoge1xyXG4gICAgbmFtZTogJ1x1NUUzOFx1NEYxRlx1NTM0RScsXHJcbiAgICBlbWFpbDogJ2NoYW5nd2VpaHVhQG91dGxvb2suY29tJyxcclxuICAgIGxpbms6ICdodHRwczovL2NoYW5nd2VpaHVhLmdpdGh1Yi5pbydcclxuICB9LFxyXG4gIGF1dGhvcnM6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogJ1x1NUUzOFx1NEYxRlx1NTM0RScsXHJcbiAgICAgIGVtYWlsOiAnY2hhbmd3ZWlodWFAb3V0bG9vay5jb20nLFxyXG4gICAgICBsaW5rOiAnaHR0cHM6Ly9jaGFuZ3dlaWh1YS5naXRodWIuaW8nXHJcbiAgICB9XHJcbiAgXSxcclxuICBmaWxlbmFtZTogJ2ZlZWQucnNzJyxcclxuICBsb2c6IHRydWUsXHJcbiAgaWdub3JlSG9tZTogdHJ1ZSxcclxufVxyXG5cclxuZXhwb3J0IHtcclxuICBSU1NcclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFx1dGlsc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHV0aWxzXFxcXGhhbmRsZUhlYWRNZXRhLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3MvdXRpbHMvaGFuZGxlSGVhZE1ldGEudHNcIjtpbXBvcnQgeyB0eXBlIEhlYWRDb25maWcsIHR5cGUgVHJhbnNmb3JtQ29udGV4dCB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuXHJcbmltcG9ydCB7IGhlYWQgfSBmcm9tICcuLi9zcmMvaGVhZCdcclxuXHJcbi8vIFx1NTkwNFx1NzQwNlx1NkJDRlx1NEUyQVx1OTg3NVx1OTc2Mlx1NzY4NFx1NTE0M1x1NjU3MFx1NjM2RVxyXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlSGVhZE1ldGEoY29udGV4dDogVHJhbnNmb3JtQ29udGV4dCkge1xyXG4gIGNvbnN0IHsgZGVzY3JpcHRpb24sIHRpdGxlLCByZWxhdGl2ZVBhdGggfSA9IGNvbnRleHQucGFnZURhdGE7XHJcbiAgLy8gXHU1ODlFXHU1MkEwVHdpdHRlclx1NTM2MVx1NzI0N1xyXG4gIGNvbnN0IG9nVXJsOiBIZWFkQ29uZmlnID0gW1wibWV0YVwiLCB7IHByb3BlcnR5OiBcIm9nOnVybFwiLCBjb250ZW50OiBhZGRCYXNlKHJlbGF0aXZlUGF0aC5zbGljZSgwLCAtMykpICsgJy5odG1sJyB9XVxyXG4gIGNvbnN0IG9nVGl0bGU6IEhlYWRDb25maWcgPSBbXCJtZXRhXCIsIHsgcHJvcGVydHk6IFwib2c6dGl0bGVcIiwgY29udGVudDogdGl0bGUgfV1cclxuICBjb25zdCBvZ0Rlc2NyaXB0aW9uOiBIZWFkQ29uZmlnID0gW1wibWV0YVwiLCB7IHByb3BlcnR5OiBcIm9nOmRlc2NyaXB0aW9uXCIsIGNvbnRlbnQ6IGRlc2NyaXB0aW9uIHx8IGNvbnRleHQuZGVzY3JpcHRpb24gfV1cclxuICBjb25zdCBvZ0ltYWdlOiBIZWFkQ29uZmlnID0gW1wibWV0YVwiLCB7IHByb3BlcnR5OiBcIm9nOmltYWdlXCIsIGNvbnRlbnQ6IFwiaHR0cHM6Ly9jaGFuZ3dlaWh1YS5naXRodWIuaW8vYXV0aG9yLmpwZ1wiIH1dXHJcbiAgY29uc3QgdHdpdHRlckNhcmQ6IEhlYWRDb25maWcgPSBbXCJtZXRhXCIsIHsgbmFtZTogXCJ0d2l0dGVyOmNhcmRcIiwgY29udGVudDogXCJzdW1tYXJ5XCIgfV1cclxuICBjb25zdCB0d2l0dGVySW1hZ2U6IEhlYWRDb25maWcgPSBbXCJtZXRhXCIsIHsgbmFtZTogXCJ0d2l0dGVyOmltYWdlOnNyY1wiLCBjb250ZW50OiBcImh0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvL2F1dGhvci5qcGdcIiB9XVxyXG4gIGNvbnN0IHR3aXR0ZXJEZXNjcmlwdGlvbjogSGVhZENvbmZpZyA9IFtcIm1ldGFcIiwgeyBuYW1lOiBcInR3aXR0ZXI6ZGVzY3JpcHRpb25cIiwgY29udGVudDogZGVzY3JpcHRpb24gfHwgY29udGV4dC5kZXNjcmlwdGlvbiB9XVxyXG5cclxuICBjb25zdCB0d2l0dGVySGVhZDogSGVhZENvbmZpZ1tdID0gW1xyXG4gICAgb2dVcmwsIG9nVGl0bGUsIG9nRGVzY3JpcHRpb24sIG9nSW1hZ2UsXHJcbiAgICB0d2l0dGVyQ2FyZCwgdHdpdHRlckRlc2NyaXB0aW9uLCB0d2l0dGVySW1hZ2UsXHJcbiAgXVxyXG5cclxuICAvLyBoZWFkLnB1c2goWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOnRpdGxlJywgY29udGVudDogY29udGV4dC5wYWdlRGF0YS5mcm9udG1hdHRlci50aXRsZSB9XSlcclxuICAvLyBoZWFkLnB1c2goWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOmRlc2NyaXB0aW9uJywgY29udGVudDogY29udGV4dC5wYWdlRGF0YS5mcm9udG1hdHRlci5kZXNjcmlwdGlvbiB9XSlcclxuXHJcbiAgcmV0dXJuIFsuLi5oZWFkLCAuLi50d2l0dGVySGVhZF1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZEJhc2UocmVsYXRpdmVQYXRoOiBzdHJpbmcpIHtcclxuICBjb25zdCBob3N0ID0gJ2h0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvJ1xyXG4gIGlmIChyZWxhdGl2ZVBhdGguc3RhcnRzV2l0aCgnLycpKSB7XHJcbiAgICByZXR1cm4gaG9zdCArIHJlbGF0aXZlUGF0aFxyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gaG9zdCArICcvJyArIHJlbGF0aXZlUGF0aFxyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBSU8sSUFBTSxjQUFtQztBQUFBLEVBQzlDLFVBQVU7QUFBQSxJQUNSLFNBQ0U7QUFBQSxJQUNGLE1BQU07QUFBQSxFQUNSO0FBQUE7QUFBQSxFQUNBLGFBQWE7QUFBQSxJQUNYLE1BQU07QUFBQSxJQUNOLGVBQWU7QUFBQSxNQUNiLFdBQVc7QUFBQSxNQUNYLFdBQVc7QUFBQSxJQUNiO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFFQSxNQUFNO0FBQUEsRUFDTixxQkFBcUI7QUFBQSxFQUNyQixzQkFBc0I7QUFBQSxFQUN0QixxQkFBcUI7QUFBQSxFQUNyQixrQkFBa0I7QUFBQSxFQUNsQixlQUFlO0FBQUEsRUFDZixrQkFBa0I7QUFBQSxFQUNsQixhQUFhO0FBQUEsSUFDWDtBQUFBLE1BQ0UsTUFBTTtBQUFBLFFBQ0osS0FBSztBQUFBLE1BQ1A7QUFBQSxNQUNBLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQTtBQUFBLE1BQ0UsTUFBTTtBQUFBLFFBQ0osS0FBSztBQUFBLE1BQ1A7QUFBQSxNQUNBLE1BQU07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O0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBRUEsSUFBTyxpQkFBUSxhQUFhO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBcUIxQixNQUFNO0FBQUEsSUFDSixVQUFVO0FBQUEsSUFDVixTQUFTO0FBQUEsTUFDUCxzQkFBc0I7QUFBQSxNQUN0QixvQkFBb0I7QUFBQSxRQUNsQixZQUFZO0FBQUEsVUFDVixJQUFJO0FBQUEsVUFDSixJQUFJO0FBQUEsVUFDSixJQUFJO0FBQUE7QUFBQTtBQUFBLFFBR047QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELFVBQVUsR0FBRztBQUFBLE1BQ2IsdUJBQXVCO0FBQUEsUUFDckIsWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsZUFBZTtBQUFBLE1BQ2pCLENBQUM7QUFBQSxNQUNELHNCQUFzQjtBQUFBLE1BQ3RCLE9BQU87QUFBQSxNQUNQLG1CQUFtQjtBQUFBLFFBQ2pCLE9BQU87QUFBQSxRQUNQLFlBQVk7QUFBQSxRQUNaLFVBQVU7QUFBQSxRQUNWLGNBQWM7QUFBQSxRQUNkLE1BQU07QUFBQSxRQUNOLFdBQVc7QUFBQSxRQUNYLGdCQUFnQixTQUFVLE9BQU8sU0FBUztBQUN4QyxrQkFBUSxJQUFJLE9BQU8sT0FBTztBQUFBLFFBQzVCO0FBQUEsUUFDQSxNQUFNO0FBQUEsVUFDSixFQUFFLE1BQU0sUUFBUSxTQUFTLHVDQUFVO0FBQUEsVUFDbkM7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLEtBQUs7QUFBQSxVQUNQO0FBQUEsUUFDRjtBQUFBLFFBQ0EsUUFBUTtBQUFBLFVBQ047QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxZQUNULE1BQU07QUFBQSxVQUNSO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxVQUFVO0FBQUEsTUFDUixpQkFBaUI7QUFBQSxRQUNmLGlCQUFpQixDQUFDLFFBQVEsZUFBZSxTQUFTLEdBQUc7QUFBQSxRQUNyRCxZQUFZO0FBQUE7QUFBQSxNQUNkO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsR0FBRztBQUFBO0FBQUEsRUFFSDtBQUFBO0FBQUEsRUFFQTtBQUFBLEVBQ0E7QUFBQSxFQUNBLFdBQVc7QUFBQSxFQUNYLFNBQVM7QUFBQSxJQUNQLFVBQVU7QUFBQSxJQUNWLGlCQUFpQjtBQUFBLElBQ2pCLGdCQUFnQixDQUFDLFVBQVU7QUFFekIsWUFBTSxLQUFLO0FBQUEsUUFDVCxLQUFLO0FBQUEsUUFDTCxZQUFZO0FBQUEsUUFDWixVQUFVO0FBQUEsTUFDWixDQUFDO0FBQ0QsYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBQUEsRUFDQSxVQUFVO0FBQUEsSUFDUixjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBLGlCQUFpQjtBQUFBLEVBQ2pCLE1BQU0sY0FBYyxTQUFnQztBQUVsRCxVQUFNQyxRQUFPLGVBQWUsT0FBTztBQUVuQyxXQUFPQTtBQUFBLEVBQ1Q7QUFBQSxFQUNBLE1BQU0sa0JBQWtCLFVBQVU7QUFDaEMsVUFBTSxFQUFFLFlBQVksYUFBYSxJQUFJO0FBQ3JDLFVBQU0sRUFBRSxjQUFjLFVBQVUsSUFBSSxNQUFNLDRCQUE0QixZQUFZO0FBQ2xGLFVBQU0sZ0JBQWdCO0FBQUEsTUFDcEIsZUFBZTtBQUFBLElBQ2pCO0FBQ0EsVUFBTSxxQkFBcUIsYUFBYSxJQUFJLGlCQUFlO0FBQ3pELGtCQUFZLFNBQVMsMkNBQTJDLGNBQWMsWUFBWSxJQUFJLENBQUM7QUFDL0YsYUFBTztBQUFBLElBQ1QsQ0FBQztBQUVELFFBQUksWUFBWTtBQUNkLGVBQVMsUUFBUTtBQUFBLElBQ25CO0FBRUEsV0FBTztBQUFBLE1BQ0wsWUFBWTtBQUFBLFFBQ1YsY0FBYztBQUFBLFFBQ2Q7QUFBQSxRQUNBLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJkYXlqcyIsICJkYXlqcyIsICJoZWFkIl0KfQo=
