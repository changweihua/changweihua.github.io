// .vitepress/src/theme.ts
var themeConfig = {
  // editLink: {
  //   pattern: 'https://github.com/changweihua/changweihua.github.io/edit/master//:path',
  //   text: 'Edit this page on GitHub'
  // },
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
        svg: '<svg t="1692581090199" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7471" width="128" height="128"><path d="M512 12.63616c-282.74688 0-512 229.21216-512 512 0 226.22208 146.69824 418.14016 350.12608 485.82656 25.57952 4.73088 35.00032-11.10016 35.00032-24.63744 0-12.20608-0.47104-52.55168-0.69632-95.31392-142.4384 30.96576-172.50304-60.416-172.50304-60.416-23.28576-59.16672-56.85248-74.91584-56.85248-74.91584-46.44864-31.78496 3.50208-31.1296 3.50208-31.1296 51.4048 3.60448 78.47936 52.75648 78.47936 52.75648 45.6704 78.27456 119.76704 55.64416 149.01248 42.55744 4.58752-33.09568 17.85856-55.68512 32.50176-68.46464-113.72544-12.94336-233.2672-56.85248-233.2672-253.0304 0-55.88992 20.00896-101.5808 52.75648-137.4208-5.3248-12.9024-22.85568-64.96256 4.95616-135.49568 0 0 43.008-13.74208 140.84096 52.49024 40.83712-11.34592 84.64384-17.03936 128.16384-17.24416 43.49952 0.2048 87.32672 5.87776 128.24576 17.24416 97.73056-66.2528 140.65664-52.49024 140.65664-52.49024 27.87328 70.53312 10.3424 122.59328 5.03808 135.49568 32.82944 35.86048 52.69504 81.53088 52.69504 137.4208 0 196.64896-119.78752 239.94368-233.79968 252.6208 18.37056 15.89248 34.73408 47.04256 34.73408 94.80192 0 68.5056-0.59392 123.63776-0.59392 140.51328 0 13.6192 9.216 29.5936 35.16416 24.576 203.32544-67.76832 349.83936-259.62496 349.83936-485.76512 0-282.78784-229.23264-512-512-512z" fill="#444444" p-id="7472"></path></svg>'
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
              resetButtonTitle: "\u6E05\u9664\u67E5\u8BE2\u6761\u4EF6",
              backButtonTitle: "\u8FD4\u56DE",
              footer: {
                selectText: "\u9009\u62E9",
                navigateText: "\u5207\u6362",
                closeText: "\u5173\u95ED"
              }
            }
          }
        }
      }
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
    { text: "Home", link: "/en-US/" }
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
  lastUpdated: true,
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
  ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
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
import mathjax3 from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-mathjax3/index.js";

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
      return `<StyledMermaid id="mermaid-${idx}" code="${encodeURIComponent(token.content)}"></StyledMermaid>`;
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
var __vite_injected_original_import_meta_url = "file:///D:/Github/changweihua.github.io/.vitepress/src/markdown.ts";
var CONSTS = {
  __custom_variable__: "your value"
};
var markdown = {
  lineNumbers: true,
  theme: { light: "github-light", dark: "github-dark" },
  config: (md) => {
    useDefinePlugin(md, CONSTS);
    md.use(footnote);
    md.use(mathjax3);
    md.use(lightbox, {});
    md.use(timeline);
    tabsPlugin(md);
    md.use(groupIconMdPlugin);
    md.use(roughMermaidPlugin);
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
import { defineConfig } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress/dist/node/index.js";
import { viteDemoPreviewPlugin } from "file:///D:/Github/changweihua.github.io/node_modules/@vitepress-code-preview/plugin/dist/index.js";
import vueJsx from "file:///D:/Github/changweihua.github.io/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
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
  vite: {
    logLevel: "info",
    plugins: [
      // GitRevisionInfoPlugin(),
      // groupIconVitePlugin({
      //   customIcon: {
      //     ae: 'logos:adobe-after-effects',
      //     ai: 'logos:adobe-illustrator',
      //     ps: 'logos:adobe-photoshop',
      //     // rspack: localIconLoader(import.meta.url, '../assets/rspack.svg'),
      //     // farm: localIconLoader(import.meta.url, '../assets/farm.svg'),
      //   },
      // }),
      // RssPlugin(RSS),
      // vitepressProtectPlugin({
      //   disableF12: true,
      //   disableCopy: true,
      //   disableSelect: true,
      // }),
      viteDemoPreviewPlugin(),
      vueJsx()
    ]
  },
  // vue: {
  //   template: {
  //     compilerOptions: {
  //       isCustomElement: (tag) => customElements.includes(tag),
  //       whitespace: 'preserve'      // [!code ++] 重点:设置whitespace: 'preserve'是为了保留Markdown中的空格，以便LiteTree可以正确解析lite格式的树数据。
  //     },
  //   },
  // },
  /* 文档配置 */
  ...docsConfig,
  /* 标头配置 */
  head,
  /* 主题配置 */
  themeConfig,
  markdown,
  lastUpdated: false,
  // sitemap: {
  //   hostname: "https://changweihua.github.io",
  //   lastmodDateOnly: false,
  //   transformItems: (items) => {
  //     // add new items or modify/filter existing items
  //     items.push({
  //       url: "/extra-page",
  //       changefreq: "monthly",
  //       priority: 0.8,
  //     });
  //     return items;
  //   },
  // },
  rewrites: {
    "/index.md": "/zh-CN/index.md"
  },
  ignoreDeadLinks: true
  // async transformHead(context): Promise<HeadConfig[]> {
  //   // const { assets }= context
  //   const head = handleHeadMeta(context)
  //   return head
  // },
  // async transformPageData(pageData) {
  //   const { isNotFound, relativePath } = pageData
  //   const { contributors, changelog } = await getChangelogAndContributors(relativePath)
  //   const CustomAvatars = {
  //     'changweihua': '2877201'
  //   }
  //   const CustomContributors = contributors.map(contributor => {
  //     contributor.avatar = `https://avatars.githubusercontent.com/u/${CustomAvatars[contributor.name]}?v=4`
  //     return contributor
  //   })
  //   if (isNotFound) {
  //     pageData.title = 'Not Found'
  //   }
  //   return {
  //     CommitData: {
  //       contributors: CustomContributors,
  //       changelog,
  //       commitURL: 'https://github.com/changweihua/changweihua.github.io/commit/',
  //       title: 'Changelog'
  //     }
  //   }
  // }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9zcmMvdGhlbWUudHMiLCAiLnZpdGVwcmVzcy9zcmMvbmF2cy96aC1DTi5uYXYudHMiLCAiLnZpdGVwcmVzcy9zcmMvbmF2cy9lbi1VUy5uYXYudHMiLCAiLnZpdGVwcmVzcy9zcmMvc2lkZWJhcnMvemgtQ04uc2lkZWJhci50cyIsICIudml0ZXByZXNzL3NyYy9zaWRlYmFycy9lbi1VUy5zaWRlYmFyLnRzIiwgIi52aXRlcHJlc3Mvc3JjL2NvbmZpZ3MvemgtQ04uY29uZmlnLnRzIiwgIi52aXRlcHJlc3Mvc3JjL2NvbmZpZ3MvZW4tVVMuY29uZmlnLnRzIiwgIi52aXRlcHJlc3Mvc3JjL2RvY3MudHMiLCAiLnZpdGVwcmVzcy9zcmMvaGVhZC50cyIsICIudml0ZXByZXNzL3NyYy9tYXJrZG93bi50cyIsICIudml0ZXByZXNzL3BsdWdpbnMvbWFya2Rvd24vaW1hZ2UudHMiLCAiLnZpdGVwcmVzcy9wbHVnaW5zL21hcmtkb3duL3JvdWdoLW1lcm1haWQudHMiLCAiLnZpdGVwcmVzcy9jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXHRoZW1lLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL3RoZW1lLnRzXCI7aW1wb3J0IHR5cGUgeyBEZWZhdWx0VGhlbWUgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcbi8vIGltcG9ydCBuYXYgZnJvbSBcIi4vbmF2cy96aFwiO1xyXG4vLyBpbXBvcnQgc2lkZWJhciBmcm9tIFwiLi9zaWRlYmFycy96aC1DTi5zaWRlYmFyXCI7XHJcblxyXG5leHBvcnQgY29uc3QgdGhlbWVDb25maWc6IERlZmF1bHRUaGVtZS5Db25maWcgPSB7XHJcbiAgLy8gZWRpdExpbms6IHtcclxuICAvLyAgIHBhdHRlcm46ICdodHRwczovL2dpdGh1Yi5jb20vY2hhbmd3ZWlodWEvY2hhbmd3ZWlodWEuZ2l0aHViLmlvL2VkaXQvbWFzdGVyLy86cGF0aCcsXHJcbiAgLy8gICB0ZXh0OiAnRWRpdCB0aGlzIHBhZ2Ugb24gR2l0SHViJ1xyXG4gIC8vIH0sXHJcbiAgLy8gdGl0bGVUZW1wbGF0ZTogJzp0aXRsZSAtIEN1c3RvbSBTdWZmaXgnLFxyXG4gIGxvZ286IFwiL2xvZ28ucG5nXCIsXHJcbiAgZGFya01vZGVTd2l0Y2hMYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NEUzQlx1OTg5OCcsXHJcbiAgbGlnaHRNb2RlU3dpdGNoVGl0bGU6ICdcdTZENDVcdTgyNzInLFxyXG4gIGRhcmtNb2RlU3dpdGNoVGl0bGU6J1x1NkRGMVx1ODI3MicsXHJcbiAgcmV0dXJuVG9Ub3BMYWJlbDogJ1x1OEZENFx1NTZERVx1OTg3Nlx1OTBFOCcsXHJcbiAgbGFuZ01lbnVMYWJlbDonXHU5MDA5XHU2MkU5XHU4QkVEXHU4QTAwJyxcclxuICBleHRlcm5hbExpbmtJY29uOiB0cnVlLFxyXG4gIHNvY2lhbExpbmtzOiBbXHJcbiAgICB7XHJcbiAgICAgIGljb246IHtcclxuICAgICAgICBzdmc6ICc8c3ZnIHQ9XCIxNjkyNTgxMDkwMTk5XCIgY2xhc3M9XCJpY29uXCIgdmlld0JveD1cIjAgMCAxMDI0IDEwMjRcIiB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHAtaWQ9XCI3NDcxXCIgd2lkdGg9XCIxMjhcIiBoZWlnaHQ9XCIxMjhcIj48cGF0aCBkPVwiTTUxMiAxMi42MzYxNmMtMjgyLjc0Njg4IDAtNTEyIDIyOS4yMTIxNi01MTIgNTEyIDAgMjI2LjIyMjA4IDE0Ni42OTgyNCA0MTguMTQwMTYgMzUwLjEyNjA4IDQ4NS44MjY1NiAyNS41Nzk1MiA0LjczMDg4IDM1LjAwMDMyLTExLjEwMDE2IDM1LjAwMDMyLTI0LjYzNzQ0IDAtMTIuMjA2MDgtMC40NzEwNC01Mi41NTE2OC0wLjY5NjMyLTk1LjMxMzkyLTE0Mi40Mzg0IDMwLjk2NTc2LTE3Mi41MDMwNC02MC40MTYtMTcyLjUwMzA0LTYwLjQxNi0yMy4yODU3Ni01OS4xNjY3Mi01Ni44NTI0OC03NC45MTU4NC01Ni44NTI0OC03NC45MTU4NC00Ni40NDg2NC0zMS43ODQ5NiAzLjUwMjA4LTMxLjEyOTYgMy41MDIwOC0zMS4xMjk2IDUxLjQwNDggMy42MDQ0OCA3OC40NzkzNiA1Mi43NTY0OCA3OC40NzkzNiA1Mi43NTY0OCA0NS42NzA0IDc4LjI3NDU2IDExOS43NjcwNCA1NS42NDQxNiAxNDkuMDEyNDggNDIuNTU3NDQgNC41ODc1Mi0zMy4wOTU2OCAxNy44NTg1Ni01NS42ODUxMiAzMi41MDE3Ni02OC40NjQ2NC0xMTMuNzI1NDQtMTIuOTQzMzYtMjMzLjI2NzItNTYuODUyNDgtMjMzLjI2NzItMjUzLjAzMDQgMC01NS44ODk5MiAyMC4wMDg5Ni0xMDEuNTgwOCA1Mi43NTY0OC0xMzcuNDIwOC01LjMyNDgtMTIuOTAyNC0yMi44NTU2OC02NC45NjI1NiA0Ljk1NjE2LTEzNS40OTU2OCAwIDAgNDMuMDA4LTEzLjc0MjA4IDE0MC44NDA5NiA1Mi40OTAyNCA0MC44MzcxMi0xMS4zNDU5MiA4NC42NDM4NC0xNy4wMzkzNiAxMjguMTYzODQtMTcuMjQ0MTYgNDMuNDk5NTIgMC4yMDQ4IDg3LjMyNjcyIDUuODc3NzYgMTI4LjI0NTc2IDE3LjI0NDE2IDk3LjczMDU2LTY2LjI1MjggMTQwLjY1NjY0LTUyLjQ5MDI0IDE0MC42NTY2NC01Mi40OTAyNCAyNy44NzMyOCA3MC41MzMxMiAxMC4zNDI0IDEyMi41OTMyOCA1LjAzODA4IDEzNS40OTU2OCAzMi44Mjk0NCAzNS44NjA0OCA1Mi42OTUwNCA4MS41MzA4OCA1Mi42OTUwNCAxMzcuNDIwOCAwIDE5Ni42NDg5Ni0xMTkuNzg3NTIgMjM5Ljk0MzY4LTIzMy43OTk2OCAyNTIuNjIwOCAxOC4zNzA1NiAxNS44OTI0OCAzNC43MzQwOCA0Ny4wNDI1NiAzNC43MzQwOCA5NC44MDE5MiAwIDY4LjUwNTYtMC41OTM5MiAxMjMuNjM3NzYtMC41OTM5MiAxNDAuNTEzMjggMCAxMy42MTkyIDkuMjE2IDI5LjU5MzYgMzUuMTY0MTYgMjQuNTc2IDIwMy4zMjU0NC02Ny43NjgzMiAzNDkuODM5MzYtMjU5LjYyNDk2IDM0OS44MzkzNi00ODUuNzY1MTIgMC0yODIuNzg3ODQtMjI5LjIzMjY0LTUxMi01MTItNTEyelwiIGZpbGw9XCIjNDQ0NDQ0XCIgcC1pZD1cIjc0NzJcIj48L3BhdGg+PC9zdmc+JyxcclxuICAgICAgfSxcclxuICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vY2hhbmd3ZWlodWFcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGljb246IHtcclxuICAgICAgICBzdmc6ICc8c3ZnIHQ9XCIxNjkxMDM3MDQ4NjAwXCIgY2xhc3M9XCJpY29uXCIgdmlld0JveD1cIjAgMCAxMDI0IDEwMjRcIiB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHAtaWQ9XCIyNTg0XCIgd2lkdGg9XCIxMjhcIiBoZWlnaHQ9XCIxMjhcIj48cGF0aCBkPVwiTTIyOC43IDY0My45Yy0wLjEgMC4xLTAuMiAwLjMtMC4zIDAuNCAzLjktNC40IDgtOSAxMi0xMy41LTcuNSA4LjQtMTEuNyAxMy4xLTExLjcgMTMuMXpcIiBmaWxsPVwiIzE1OTBFOVwiIHAtaWQ9XCIyNTg1XCI+PC9wYXRoPjxwYXRoIGQ9XCJNODk0IDI5OC4xbDI1LjYtMTUuMWMxMC40LTYuMSA5LjEtMjEuNS0yLjEtMjUuOWwtMTIuMy00LjhjLTE4LTcuMS0zNC4yLTE4LjItNDYuNy0zMy0xNS43LTE4LjUtNDQuNy00NS4xLTkwLjktNjAuOC01Mi43LTE4LTE0Mi45LTE0LjQtMTkzLjItMTAuNS0xNS45IDEuMi0yNSAxOC40LTE3LjQgMzIuNSA0Mi42IDc4LjYgMTYuNyAxMTQuMy01LjcgMTQwLjctMzQuMyA0MC40LTk3LjQgMTEyLjItMTYwLjcgMTgzLjYgMjEuOS0yNC41IDQxLjgtNDYuOCA1OC4xLTY1LjEgMzYuNC00MC44IDkxLjMtNjEuNSAxNDUuMS01MS43IDE3MS41IDMxLjMgMTkxIDI1My40LTkuMiAzODUuNiAyNi4xLTEuNCA1Mi42LTMuMyA3OS4yLTYgMjUyLjYtMjYgMjcyLjYtMjMyLjEgMjE4LTMzMy45LTE5LjQtMzYuMS0yMi4yLTYwLjUtMjAuMS04My45IDItMjEuNSAxMy44LTQwLjggMzIuMy01MS43elwiIGZpbGw9XCIjOTlDMjM2XCIgcC1pZD1cIjI1ODZcIj48L3BhdGg+PHBhdGggZD1cIk0yMTIuOCA3MDQuNUMyNDEuMSA2NzIuOSAzMTYgNTg5IDM5MC43IDUwNC43Yy01NC42IDYxLjItMTIxLjggMTM2LjctMTc3LjkgMTk5Ljh6XCIgZmlsbD1cIiMxNTkwRTlcIiBwLWlkPVwiMjU4N1wiPjwvcGF0aD48cGF0aCBkPVwiTTIxNi4zIDc1OC42Yy0xOS41LTIuNS0yOC4yLTI1LjYtMTUuNS00MC42LTUxLjcgNTguMy05MS43IDEwMy41LTk5LjEgMTEyLjYtMjQuMSAyOS41IDI0Ny43IDk3LjkgNDgyLjYtNTYuOCAwLjEtMC4xIDAuMy0wLjIgMC40LTAuMy0xNTYuNSA4LjItMjk4LjUtNS45LTM2OC40LTE0Ljl6XCIgZmlsbD1cIiNDQUMxMzRcIiBwLWlkPVwiMjU4OFwiPjwvcGF0aD48cGF0aCBkPVwiTTU5My45IDM4Ny45Yy01My44LTkuOC0xMDguNyAxMC45LTE0NS4xIDUxLjctMTYuMyAxOC4yLTM2LjIgNDAuNS01OC4xIDY1LjFDMzE2IDU4OSAyNDEuMSA2NzIuOSAyMTIuOCA3MDQuNWMtNC4xIDQuNi04LjEgOS4xLTEyIDEzLjUtMTIuNyAxNC45LTQgMzggMTUuNSA0MC42IDY5LjkgOSAyMTEuOSAyMy4xIDM2OC4zIDE1IDIwMC4yLTEzMi4zIDE4MC44LTM1NC40IDkuMy0zODUuN3pcIiBmaWxsPVwiIzAyOUY0MFwiIHAtaWQ9XCIyNTg5XCI+PC9wYXRoPjwvc3ZnPicsXHJcbiAgICAgIH0sXHJcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly93d3cueXVxdWUuY29tL2NoYW5nd2VpaHVhXCIsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpY29uOiB7XHJcbiAgICAgICAgc3ZnOiAnPHN2ZyB0PVwiMTY5MTAzNzM1ODc0NFwiIGNsYXNzPVwiaWNvblwiIHZpZXdCb3g9XCIwIDAgMTAyNCAxMDI0XCIgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBwLWlkPVwiNzY0MFwiIHdpZHRoPVwiMTI4XCIgaGVpZ2h0PVwiMTI4XCI+PHBhdGggZD1cIk0xMTcuMTQ5NzM3IDkwNi44NTAyNjNWMTE3LjE2MDA4MWg3ODkuNjkwMTgydjc4OS42OTAxODJ6IG0xNDguNTIxMzc0LTY0MS43MDY2Njd2NDkyLjUzMzY1N2gyNDguODczMzc0VjM2Ny44NDM1NTZoMTQ1LjAyNTI5M3YzODkuOTA2MTAxaDk4LjczNTMyMVYyNjUuMTQzNTk2elwiIGZpbGw9XCIjQ0IzODM3XCIgcC1pZD1cIjc2NDFcIj48L3BhdGg+PC9zdmc+JyxcclxuICAgICAgfSxcclxuICAgICAgbGluazogXCJodHRwczovL3d3dy5ucG1qcy5jb20vfmNoYW5nd2VpaHVhXCIsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpY29uOiB7XHJcbiAgICAgICAgc3ZnOiAnPHN2ZyB0PVwiMTY5MjU4MDk5MDgzM1wiIGNsYXNzPVwiaWNvblwiIHZpZXdCb3g9XCIwIDAgMTEyOSAxMDI0XCIgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBwLWlkPVwiNDQ1OFwiIHdpZHRoPVwiMTI4XCIgaGVpZ2h0PVwiMTI4XCI+PHBhdGggZD1cIk0yMzQuOTA5IDkuNjU2YTgwLjQ2OCA4MC40NjggMCAwIDEgNjguMzk4IDAgMTY3LjM3NCAxNjcuMzc0IDAgMCAxIDQxLjg0MyAzMC41NzhsMTYwLjkzNyAxNDAuODJoMTE1LjA3bDE2MC45MzYtMTQwLjgyYTE2OC45ODMgMTY4Ljk4MyAwIDAgMSA0MS44NDMtMzAuNTc4QTgwLjQ2OCA4MC40NjggMCAwIDEgOTMwLjk2IDc2LjQ0NWE4MC40NjggODAuNDY4IDAgMCAxLTE3LjcwMyA1My45MTQgNDQ5LjgxOCA0NDkuODE4IDAgMCAxLTM1LjQwNiAzMi4xODcgMjMyLjU1MyAyMzIuNTUzIDAgMCAxLTIyLjUzMSAxOC41MDhoMTAwLjU4NWExNzAuNTkzIDE3MC41OTMgMCAwIDEgMTE4LjI4OSA1My4xMDkgMTcxLjM5NyAxNzEuMzk3IDAgMCAxIDUzLjkxNCAxMTguMjg4djQ2Mi42OTNhMzI1Ljg5NyAzMjUuODk3IDAgMCAxLTQuMDI0IDcwLjAwNyAxNzguNjQgMTc4LjY0IDAgMCAxLTgwLjQ2OCAxMTIuNjU2IDE3My4wMDcgMTczLjAwNyAwIDAgMS05Mi41MzkgMjUuNzVoLTczOC43YTM0MS4xODYgMzQxLjE4NiAwIDAgMS03Mi40MjEtNC4wMjRBMTc3LjgzNSAxNzcuODM1IDAgMCAxIDI4LjkxIDkzOS4wNjVhMTcyLjIwMiAxNzIuMjAyIDAgMCAxLTI3LjM2LTkyLjUzOVYzODguNjYyYTM2MC40OTggMzYwLjQ5OCAwIDAgMSAwLTY2Ljc4OUExNzcuMDMgMTc3LjAzIDAgMCAxIDE2Mi40ODcgMTc4LjY0aDEwNS40MTRjLTE2Ljg5OS0xMi4wNy0zMS4zODMtMjYuNTU1LTQ2LjY3Mi0zOS40M2E4MC40NjggODAuNDY4IDAgMCAxLTI1Ljc1LTY1Ljk4NCA4MC40NjggODAuNDY4IDAgMCAxIDM5LjQzLTYzLjU3TTIxNi40IDMyMS44NzNhODAuNDY4IDgwLjQ2OCAwIDAgMC02My41NyA1Ny45MzcgMTA4LjYzMiAxMDguNjMyIDAgMCAwIDAgMzAuNTc4djM4MC42MTVhODAuNDY4IDgwLjQ2OCAwIDAgMCA1NS41MjMgODAuNDY5IDEwNi4yMTggMTA2LjIxOCAwIDAgMCAzNC42MDEgNS42MzJoNjU0LjIwOGE4MC40NjggODAuNDY4IDAgMCAwIDc2LjQ0NC00Ny40NzYgMTEyLjY1NiAxMTIuNjU2IDAgMCAwIDguMDQ3LTUzLjEwOXYtMzU0LjA2YTEzNS4xODcgMTM1LjE4NyAwIDAgMCAwLTM4LjYyNSA4MC40NjggODAuNDY4IDAgMCAwLTUyLjMwNC01NC43MTkgMTI5LjU1NCAxMjkuNTU0IDAgMCAwLTQ5Ljg5LTcuMjQySDI1NC4yMmEyNjguNzY0IDI2OC43NjQgMCAwIDAtMzcuODIgMHogbTAgMFwiIGZpbGw9XCIjMjBCMEUzXCIgcC1pZD1cIjQ0NTlcIj48L3BhdGg+PHBhdGggZD1cIk0zNDguMzY5IDQ0Ny40MDRhODAuNDY4IDgwLjQ2OCAwIDAgMSA1NS41MjMgMTguNTA3IDgwLjQ2OCA4MC40NjggMCAwIDEgMjguMTY0IDU5LjU0N3Y4MC40NjhhODAuNDY4IDgwLjQ2OCAwIDAgMS0xNi4wOTQgNTEuNSA4MC40NjggODAuNDY4IDAgMCAxLTEzMS45NjgtOS42NTYgMTA0LjYwOSAxMDQuNjA5IDAgMCAxLTEwLjQ2LTU0LjcxOXYtODAuNDY4YTgwLjQ2OCA4MC40NjggMCAwIDEgNzAuMDA3LTY3LjU5M3ogbTQxNi4wMiAwYTgwLjQ2OCA4MC40NjggMCAwIDEgODYuMTAyIDc1LjY0djgwLjQ2OGE5NC4xNDggOTQuMTQ4IDAgMCAxLTEyLjA3IDUzLjExIDgwLjQ2OCA4MC40NjggMCAwIDEtMTMyLjc3MyAwIDk1Ljc1NyA5NS43NTcgMCAwIDEtMTIuODc1LTU3LjEzM1Y1MTkuMDJhODAuNDY4IDgwLjQ2OCAwIDAgMSA3MC4wMDctNzAuODEyeiBtMCAwXCIgZmlsbD1cIiMyMEIwRTNcIiBwLWlkPVwiNDQ2MFwiPjwvcGF0aD48L3N2Zz4nLFxyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBcImh0dHBzOi8vc3BhY2UuYmlsaWJpbGkuY29tLzU0NDExNjUwMFwiLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIC8vIGkxOG5cdThERUZcdTc1MzFcclxuICBpMThuUm91dGluZzogdHJ1ZSxcclxuICBzZWFyY2g6IHtcclxuICAgICAgcHJvdmlkZXI6ICdsb2NhbCcsXHJcbiAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICBsb2NhbGVzOiB7XHJcbiAgICAgICAgICAnemgtQ04nOiB7XHJcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uczoge1xyXG4gICAgICAgICAgICAgIGJ1dHRvbjoge1xyXG4gICAgICAgICAgICAgICAgYnV0dG9uVGV4dDogJ1x1NjQxQ1x1N0QyMlx1NjU4N1x1Njg2MycsXHJcbiAgICAgICAgICAgICAgICBidXR0b25BcmlhTGFiZWw6ICdcdTY0MUNcdTdEMjJcdTY1ODdcdTY4NjMnLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgbW9kYWw6IHtcclxuICAgICAgICAgICAgICAgIG5vUmVzdWx0c1RleHQ6ICdcdTY1RTBcdTZDRDVcdTYyN0VcdTUyMzBcdTc2RjhcdTUxNzNcdTdFRDNcdTY3OUMnLFxyXG4gICAgICAgICAgICAgICAgcmVzZXRCdXR0b25UaXRsZTogJ1x1NkUwNVx1OTY2NFx1NjdFNVx1OEJFMlx1Njc2MVx1NEVGNicsXHJcbiAgICAgICAgICAgICAgICBiYWNrQnV0dG9uVGl0bGU6ICdcdThGRDRcdTU2REUnLFxyXG4gICAgICAgICAgICAgICAgZm9vdGVyOiB7XHJcbiAgICAgICAgICAgICAgICAgIHNlbGVjdFRleHQ6ICdcdTkwMDlcdTYyRTknLFxyXG4gICAgICAgICAgICAgICAgICBuYXZpZ2F0ZVRleHQ6ICdcdTUyMDdcdTYzNjInLFxyXG4gICAgICAgICAgICAgICAgICBjbG9zZVRleHQ6J1x1NTE3M1x1OTVFRCdcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgLy8gc2lkZWJhcixcclxuICAvLyBhbGdvbGlhOiB7XHJcbiAgLy8gICBhcHBJZDogXCJJSTgwRzRFTFRBXCIsIC8vIFx1OTcwMFx1ODk4MVx1NjZGRlx1NjM2MlxyXG4gIC8vICAgYXBpS2V5OiBcIjk2YWU5YjY4ZjA5ZmQwN2NiZjU4Y2JkZjM5Yjk5Y2JhXCIsIC8vIFx1OTcwMFx1ODk4MVx1NjZGRlx1NjM2MlxyXG4gIC8vICAgaW5kZXhOYW1lOiBcImNtb25vX25ldFwiLCAvLyBcdTk3MDBcdTg5ODFcdTY2RkZcdTYzNjJcclxuICAvLyAgIHBsYWNlaG9sZGVyOiBcIlx1OEJGN1x1OEY5M1x1NTE2NVx1NTE3M1x1OTUyRVx1OEJDRFwiLFxyXG4gIC8vICAgLy8gc2VhcmNoUGFyYW1ldGVycz86IFNlYXJjaE9wdGlvbnNcclxuICAvLyAgIC8vIGRpc2FibGVVc2VyUGVyc29uYWxpemF0aW9uPzogYm9vbGVhblxyXG4gIC8vICAgLy8gaW5pdGlhbFF1ZXJ5Pzogc3RyaW5nXHJcbiAgLy8gICBsb2NhbGVzOiB7XHJcbiAgLy8gICAgIHpoOiB7XHJcbiAgLy8gICAgICAgdHJhbnNsYXRpb25zOiB7XHJcbiAgLy8gICAgICAgICBidXR0b246IHtcclxuICAvLyAgICAgICAgICAgYnV0dG9uVGV4dDogXCJcdTY0MUNcdTdEMjJcIixcclxuICAvLyAgICAgICAgIH0sXHJcbiAgLy8gICAgICAgfSxcclxuICAvLyAgICAgfSxcclxuICAvLyAgIH0sXHJcbiAgLy8gICAvLyBcdTY0MUNcdTdEMjJcdTkxNERcdTdGNkVcdUZGMDhcdTRFOENcdTkwMDlcdTRFMDBcdUZGMDlcclxuICAvLyAgIC8vIHNlYXJjaDoge1xyXG4gIC8vICAgLy8gICAvLyBcdTY3MkNcdTU3MzBcdTc5QkJcdTdFQkZcdTY0MUNcdTdEMjJcclxuICAvLyAgIC8vICAgcHJvdmlkZXI6IFwibG9jYWxcIixcclxuICAvLyAgIC8vICAgLy8gXHU1OTFBXHU4QkVEXHU4QTAwXHU2NDFDXHU3RDIyXHU5MTREXHU3RjZFXHJcbiAgLy8gICAvLyAgIG9wdGlvbnM6IHtcclxuICAvLyAgIC8vICAgICBsb2NhbGVzOiB7XHJcbiAgLy8gICAvLyAgICAgICAvKiBcdTlFRDhcdThCQTRcdThCRURcdThBMDAgKi9cclxuICAvLyAgIC8vICAgICAgIHpoOiB7XHJcbiAgLy8gICAvLyAgICAgICAgIHRyYW5zbGF0aW9uczoge1xyXG4gIC8vICAgLy8gICAgICAgICAgIGJ1dHRvbjoge1xyXG4gIC8vICAgLy8gICAgICAgICAgICAgYnV0dG9uVGV4dDogXCJcdTY0MUNcdTdEMjJcIixcclxuICAvLyAgIC8vICAgICAgICAgICAgIGJ1dHRvbkFyaWFMYWJlbDogXCJcdTY0MUNcdTdEMjJcdTY1ODdcdTY4NjNcIixcclxuICAvLyAgIC8vICAgICAgICAgICB9LFxyXG4gIC8vICAgLy8gICAgICAgICAgIG1vZGFsOiB7XHJcbiAgLy8gICAvLyAgICAgICAgICAgICBub1Jlc3VsdHNUZXh0OiBcIlx1NjVFMFx1NkNENVx1NjI3RVx1NTIzMFx1NzZGOFx1NTE3M1x1N0VEM1x1Njc5Q1wiLFxyXG4gIC8vICAgLy8gICAgICAgICAgICAgcmVzZXRCdXR0b25UaXRsZTogXCJcdTZFMDVcdTk2NjRcdTY3RTVcdThCRTJcdTdFRDNcdTY3OUNcIixcclxuICAvLyAgIC8vICAgICAgICAgICAgIGZvb3Rlcjoge1xyXG4gIC8vICAgLy8gICAgICAgICAgICAgICBzZWxlY3RUZXh0OiBcIlx1OTAwOVx1NjJFOVwiLFxyXG4gIC8vICAgLy8gICAgICAgICAgICAgICBuYXZpZ2F0ZVRleHQ6IFwiXHU1MjA3XHU2MzYyXCIsXHJcbiAgLy8gICAvLyAgICAgICAgICAgICB9LFxyXG4gIC8vICAgLy8gICAgICAgICAgIH0sXHJcbiAgLy8gICAvLyAgICAgICAgIH0sXHJcbiAgLy8gICAvLyAgICAgICB9LFxyXG4gIC8vICAgLy8gICAgICAgZW46IHtcclxuICAvLyAgIC8vICAgICAgICAgdHJhbnNsYXRpb25zOiB7XHJcbiAgLy8gICAvLyAgICAgICAgICAgYnV0dG9uOiB7XHJcbiAgLy8gICAvLyAgICAgICAgICAgICBidXR0b25UZXh0OiBcIlNlYXJjaFwiLFxyXG4gIC8vICAgLy8gICAgICAgICAgICAgYnV0dG9uQXJpYUxhYmVsOiBcIlNlYXJjaCBmb3IgRG9jdW1lbnRzXCIsXHJcbiAgLy8gICAvLyAgICAgICAgICAgfSxcclxuICAvLyAgIC8vICAgICAgICAgICBtb2RhbDoge1xyXG4gIC8vICAgLy8gICAgICAgICAgICAgbm9SZXN1bHRzVGV4dDogXCJVbmFibGUgdG8gZmluZCByZWxldmFudCByZXN1bHRzXCIsXHJcbiAgLy8gICAvLyAgICAgICAgICAgICByZXNldEJ1dHRvblRpdGxlOiBcIkNsZWFyIFF1ZXJ5IFJlc3VsdHNcIixcclxuICAvLyAgIC8vICAgICAgICAgICAgIGZvb3Rlcjoge1xyXG4gIC8vICAgLy8gICAgICAgICAgICAgICBzZWxlY3RUZXh0OiBcInNlbGVjdFwiLFxyXG4gIC8vICAgLy8gICAgICAgICAgICAgICBuYXZpZ2F0ZVRleHQ6IFwic3dpdGNoXCIsXHJcbiAgLy8gICAvLyAgICAgICAgICAgICB9LFxyXG4gIC8vICAgLy8gICAgICAgICAgIH0sXHJcbiAgLy8gICAvLyAgICAgICAgIH0sXHJcbiAgLy8gICAvLyAgICAgICB9LFxyXG4gIC8vICAgLy8gICAgIH0sXHJcbiAgLy8gICAvLyAgIH0sXHJcbiAgLy8gfSxcclxuICAvLyAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTYyNjlcdTVDNTU6IFx1NjU4N1x1N0FFMFx1NzI0OFx1Njc0M1x1OTE0RFx1N0Y2RVxyXG4gIC8vIGNvcHlyaWdodENvbmZpZzoge1xyXG4gIC8vICAgbGljZW5zZTogJ1x1N0Y3Mlx1NTQwRC1cdTc2RjhcdTU0MENcdTY1QjlcdTVGMEZcdTUxNzFcdTRFQUIgNC4wIFx1NTZGRFx1OTY0NSAoQ0MgQlktU0EgNC4wKScsXHJcbiAgLy8gICBsaWNlbnNlTGluazogJ2h0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LXNhLzQuMC8nXHJcbiAgLy8gfSxcclxuICAvLyAvLyBcdTgxRUFcdTVCOUFcdTRFNDlcdTYyNjlcdTVDNTU6IFx1OTg3NVx1ODExQVx1OTE0RFx1N0Y2RVxyXG4gIC8vIGZvb3RlckNvbmZpZzoge1xyXG4gIC8vICAgc2hvd0Zvb3RlcjogdHJ1ZSwgLy8gXHU2NjJGXHU1NDI2XHU2NjNFXHU3OTNBXHU5ODc1XHU4MTFBXHJcbiAgLy8gICBpY3BSZWNvcmRDb2RlOiAnXHU2RDI1SUNQXHU1OTA3MjAyMjAwNTg2NFx1NTNGNy0yJywgLy8gSUNQXHU1OTA3XHU2ODQ4XHU1M0Y3XHJcbiAgLy8gICBwdWJsaWNTZWN1cml0eVJlY29yZENvZGU6ICdcdTZEMjVcdTUxNkNcdTdGNTFcdTVCODlcdTU5MDcxMjAxMTIwMjAwMDY3N1x1NTNGNycsIC8vIFx1ODA1NFx1N0Y1MVx1NTkwN1x1Njg0OFx1NTNGN1xyXG4gIC8vICAgY29weXJpZ2h0OiBgQ29weXJpZ2h0IFx1MDBBOSAyMDE5LSR7bmV3IERhdGUoKS5nZXRGdWxsWWVhcigpfSBDaGFybGVzN2NgIC8vIFx1NzI0OFx1Njc0M1x1NEZFMVx1NjA2RlxyXG4gIC8vIH1cclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXG5hdnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcbmF2c1xcXFx6aC1DTi5uYXYudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvbmF2cy96aC1DTi5uYXYudHNcIjtpbXBvcnQgeyBEZWZhdWx0VGhlbWUgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcbi8vICwgYWN0aXZlTWF0Y2g6IFwiXi8kfF4vaW5kZXgvXCJcclxuZXhwb3J0IGNvbnN0IGdldFpoQ05OYXY6ICgpID0+IERlZmF1bHRUaGVtZS5OYXZJdGVtW10gPSAoKSA9PiB7XHJcbiAgcmV0dXJuIFtcclxuICAgIHsgdGV4dDogXCJcdTk5OTZcdTk4NzVcIiwgbGluazogXCIvemgtQ04vXCIgfSxcclxuICAgIHtcclxuICAgICAgdGV4dDogXCJcdTUzNUFcdTVCQTJcIixcclxuICAgICAgbGluazogXCIvemgtQ04vYmxvZy9cIlxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdGV4dDogXCJcdTVGNTJcdTY4NjNcIixcclxuICAgICAgbGluazogXCIvemgtQ04vYXJjaGl2ZXMubWRcIlxyXG4gICAgfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgdGV4dDogXCJcdTUyMDZcdTdDN0JcIixcclxuICAgIC8vICAgbGluazogXCIvdGFncy5tZFwiLFxyXG4gICAgLy8gICBhY3RpdmVNYXRjaDogXCJeL3RhZ3NcIixcclxuICAgIC8vIH0sXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgIHRleHQ6IFwiXHU4QkZFXHU3QTBCXCIsXHJcbiAgICAvLyAgIGxpbms6IFwiL2NvdXJzZS9cIixcclxuICAgIC8vICAgYWN0aXZlTWF0Y2g6IFwiXi9jb3Vyc2UvXCIsXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICB0ZXh0OiBcIlx1NTE3M1x1NEU4RVwiLFxyXG4gICAgLy8gICBsaW5rOiBcIi9hYm91dC9pbmRleC5tZFwiLFxyXG4gICAgLy8gICBhY3RpdmVNYXRjaDogXCJeL2Fib3V0L1wiLFxyXG4gICAgLy8gfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgdGV4dDogXCJcdTY1ODdcdTdBRTBcdTUyMDZcdTdDN0JcIixcclxuICAgIC8vICAgaXRlbXM6IFtcclxuICAgIC8vICAgICB7XHJcbiAgICAvLyAgICAgICBpdGVtczogW1xyXG4gICAgLy8gICAgICAgICB7IHRleHQ6IFwiM0QgXHU1RjAwXHU1M0QxXCIsIGxpbms6IFwiL2NhdGVnb3J5L3RocmVlM2QubWRcIiB9LFxyXG4gICAgLy8gICAgICAgICB7IHRleHQ6IFwiXHU1REU1XHU1MTc3Jlx1NUU3M1x1NTNGMFwiLCBsaW5rOiBcIi9jYXRlZ29yeS90b29sLm1kXCIgfSxcclxuICAgIC8vICAgICAgIF0sXHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vICAgICB7XHJcbiAgICAvLyAgICAgICBpdGVtczogW1xyXG4gICAgLy8gICAgICAgICB7IHRleHQ6IFwiRmx1dHRlclwiLCBsaW5rOiBcIi9jYXRlZ29yeS9mbHV0dGVyLm1kXCIgfSxcclxuICAgIC8vICAgICAgICAgeyB0ZXh0OiBcIlx1NUZBRVx1NEZFMVx1NUMwRlx1N0EwQlx1NUU4RlwiLCBsaW5rOiBcIi9jYXRlZ29yeS93ZWNoYXQubWRcIiB9LFxyXG4gICAgLy8gICAgICAgICB7IHRleHQ6IFwiRG90TkVUXCIsIGxpbms6IFwiL2NhdGVnb3J5L2RvdG5ldC5tZFwiIH0sXHJcbiAgICAvLyAgICAgICBdLFxyXG4gICAgLy8gICAgIH0sXHJcbiAgICAvLyAgICAge1xyXG4gICAgLy8gICAgICAgaXRlbXM6IFtcclxuICAgIC8vICAgICAgICAgeyB0ZXh0OiBcIlZ1ZUpTXCIsIGxpbms6IFwiL2NhdGVnb3J5L3Z1ZS5tZFwiIH0sXHJcbiAgICAvLyAgICAgICAgIHsgdGV4dDogXCJUeXBlU2NyaXB0XCIsIGxpbms6IFwiL2NhdGVnb3J5L3R5cGVzY3JpcHQubWRcIiB9LFxyXG4gICAgLy8gICAgICAgXSxcclxuICAgIC8vICAgICB9LFxyXG4gICAgLy8gICBdLFxyXG4gICAgLy8gfSxcclxuICBdXHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXG5hdnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcbmF2c1xcXFxlbi1VUy5uYXYudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvbmF2cy9lbi1VUy5uYXYudHNcIjtpbXBvcnQgeyBEZWZhdWx0VGhlbWUgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcbi8vICwgYWN0aXZlTWF0Y2g6IFwiXi9lbi8kfF4vZW4vaW5kZXgvJFwiXHJcbmV4cG9ydCBjb25zdCBnZXRFblVTTmF2OiAoKSA9PiBEZWZhdWx0VGhlbWUuTmF2SXRlbVtdID0gKCkgPT4ge1xyXG4gIHJldHVybiBbXHJcbiAgICB7IHRleHQ6IFwiSG9tZVwiLCBsaW5rOiBcIi9lbi1VUy9cIiB9XHJcbiAgXVxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxzaWRlYmFyc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxzaWRlYmFyc1xcXFx6aC1DTi5zaWRlYmFyLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL3NpZGViYXJzL3poLUNOLnNpZGViYXIudHNcIjtpbXBvcnQgeyBEZWZhdWx0VGhlbWUgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0WmhDTlNpZGViYXI6ICgpID0+IERlZmF1bHRUaGVtZS5TaWRlYmFyID0gKCkgPT4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBhcnRpY2xlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJFeGFtcGxlc1wiLFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7IHRleHQ6IFwiTWFya2Rvd24gRXhhbXBsZXNcIiwgbGluazogXCIvbWFya2Rvd24tZXhhbXBsZXNcIiB9LFxyXG4gICAgICAgICAgeyB0ZXh0OiBcIlJ1bnRpbWUgQVBJIEV4YW1wbGVzXCIsIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICAnL2NvdXJzZS90eXBlc2NyaXB0Lyc6IFtcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiVHlwZVNjcmlwdFwiLFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7IHRleHQ6IFwiVHlwZVNjcmlwdFx1NTE4NVx1N0Y2RVx1N0M3Qlx1NTc4QlwiLCBsaW5rOiBcIi9jb3Vyc2UvdHlwZXNjcmlwdC9wcmVzZXRfdHlwZVwiIH0sXHJcbiAgICAgICAgICB7IHRleHQ6IFwiVHlwZVNjcmlwdFx1NjJEM1x1NUM1NVwiLCBsaW5rOiBcIi9jb3Vyc2UvdHlwZXNjcmlwdC9leHRlbnNpb25fdHlwZVwiIH0sXHJcbiAgICAgICAgICB7IHRleHQ6IFwiXHU5RUQ4XHU4QkE0IHRzY29uZmlnLmpzb25cIiwgbGluazogXCIvY291cnNlL3R5cGVzY3JpcHQvZGVmYXVsdF90c2NvbmZpZ1wiIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICAnL2NvdXJzZS9hbGdvcml0aG0vJzogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJhbGdvcml0aG1cIixcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgLy8gZ2FsbGVyeTogW1xyXG4gICAgLy8gICB7XHJcbiAgICAvLyAgICAgdGV4dDogXCJcdTk4NzlcdTc2RUVcdTY4NDhcdTRGOEJcIixcclxuICAgIC8vICAgICBpdGVtczogW1xyXG4gICAgLy8gICAgICAgeyB0ZXh0OiBcIlx1NjVFMFx1OTUyMVx1Nzg1NVx1NjUzRVx1NjczQVx1NTczQVx1OTYzM1x1NTE0OVx1NjcwRFx1NTJBMVx1NUU3M1x1NTNGMFwiLCBsaW5rOiBcIi9nYWxsZXJ5L3N1bm55LWxhbmRcIiB9LFxyXG4gICAgLy8gICAgICAgeyB0ZXh0OiBcIlx1NjI2Q1x1NkNGMFx1NjczQVx1NTczQVx1NjY3QVx1NjE2N1x1NTFGQVx1ODg0Q1x1NUZBRVx1NEZFMVx1NUMwRlx1N0EwQlx1NUU4RlwiLCBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIiB9LFxyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NEUwQVx1NkQ3N1x1NkMxMVx1ODIyQVx1NTM0RVx1NEUxQ1x1NTFFRlx1NEU5QVx1NkM1Rlx1ODJDRlx1NTIwNlx1NTE2Q1x1NTNGOFx1NzVBQlx1NjBDNVx1OTYzMlx1NjNBN1x1NUU3M1x1NTNGMFwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIixcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7IHRleHQ6IFwiXHU2NUUwXHU5NTIxXHU3ODU1XHU2NTNFXHU2NzNBXHU1NzNBXHU1Qjg5XHU2OEMwXHU2NTQ4XHU4MEZEXHU1MjA2XHU2NzkwXHU3Q0ZCXHU3RURGXCIsIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiXHU2NUUwXHU5NTIxXHU3ODU1XHU2NTNFXHU2NzNBXHU1NzNBXHU4RkRCXHU1MUZBXHU2RTJGL1x1NjVFMFx1N0VCOFx1NTMxNlx1N0NGQlx1N0VERlwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIixcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7IHRleHQ6IFwiXHU2MjZDXHU2Q0YwXHU2NzNBXHU1NzNBXHU1QkEyXHU2RTkwXHU1NzMwXHU1MjA2XHU2NzkwXHU3Q0ZCXHU3RURGXCIsIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiIH0sXHJcbiAgICAvLyAgICAgXSxcclxuICAgIC8vICAgfSxcclxuICAgIC8vIF0sXHJcbiAgICAvLyBibG9nOiBbXHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICB0ZXh0OiBcIjIwMjMtMDZcIixcclxuICAgIC8vICAgICBpdGVtczogW1xyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlAtVG91Y2ggUDkwMCBcdTYyNTNcdTUzNzBcdTY3M0FcdTRGN0ZcdTc1MjhcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIzLTA2L1AtVG91Y2ggUDkwMCBcdTYyNTNcdTUzNzBcdTY3M0FcdTRGN0ZcdTc1MjhcIixcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7IHRleHQ6IFwiVml0ZXN0IFx1NEY3Rlx1NzUyOFwiLCBsaW5rOiBcIi9ibG9nLzIwMjMtMDYvMTVcIiB9LFxyXG4gICAgLy8gICAgIF0sXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICB0ZXh0OiBcIjIwMjMtMDVcIixcclxuICAgIC8vICAgICBpdGVtczogW1xyXG4gICAgLy8gICAgICAgeyB0ZXh0OiBcIlx1NjQyRFx1NUVGQSBHaXRodWIgXHU0RTJBXHU0RUJBXHU0RTNCXHU5ODc1XCIsIGxpbms6IFwiL2Jsb2cvMjAyMy0wNS8xNVwiIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiXHU0RjdGXHU3NTI4IFNraWFTaGFycCBcdTVCOUVcdTczQjBcdTU2RkVcdTcyNDdcdTZDMzRcdTUzNzBcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIzLTA1L3NraWFzaGFwX3dhdGVybWFyay5tZFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICBdLFxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gICB7XHJcbiAgICAvLyAgICAgdGV4dDogXCIyMDIyXCIsXHJcbiAgICAvLyAgICAgaXRlbXM6IFtcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTRFQ0UgRG9ja2VyIFx1NUI4OVx1ODhDNSBHaXRlYVwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU0RUNFIERvY2tlciBcdTVCODlcdTg4QzUgR2l0ZWEubWRcIixcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiXHU2NTRGXHU2Mzc3XHU1RjAwXHU1M0QxXHU1QjY2XHU0RTYwXHU3QjE0XHU4QkIwXCIsXHJcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMi9cdTY1NEZcdTYzNzdcdTVGMDBcdTUzRDFcdTVCNjZcdTRFNjBcdTdCMTRcdThCQjAubWRcIixcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiXHU3OUMxXHU2NzA5bnVnZXRcdTY3MERcdTUyQTFcdTU2NjhcdTkwRThcdTdGNzJcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NzlDMVx1NjcwOW51Z2V0XHU2NzBEXHU1MkExXHU1NjY4XHU5MEU4XHU3RjcyLm1kXCIsXHJcbiAgICAvLyAgICAgICB9LFxyXG5cclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTRFM0Fkb2NrZXJcdTkxNERcdTdGNkVIVFRQXHU0RUUzXHU3NDA2XHU2NzBEXHU1MkExXHU1NjY4XCIsXHJcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMi9cdTRFM0Fkb2NrZXJcdTkxNERcdTdGNkVIVFRQXHU0RUUzXHU3NDA2XHU2NzBEXHU1MkExXHU1NjY4Lm1kXCIsXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NzlDMVx1NjcwOW51Z2V0XHU2NzBEXHU1MkExXHU1NjY4XHU5MEU4XHU3RjcyXCIsXHJcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMi9cdTc5QzFcdTY3MDludWdldFx1NjcwRFx1NTJBMVx1NTY2OFx1OTBFOFx1N0Y3Mi5tZFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTZCNjNcdTU0MTFcdTRFRTNcdTc0MDZcdTU0OENcdTUzQ0RcdTU0MTFcdTRFRTNcdTc0MDZcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNi5tZFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTZCNjNcdTU0MTFcdTRFRTNcdTc0MDZcdTU0OENcdTUzQ0RcdTU0MTFcdTRFRTNcdTc0MDZcdThCRTZcdTg5RTNcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNlx1OEJFNlx1ODlFMy5tZFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICBdLFxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gXSxcclxuICB9O1xyXG5cclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcc2lkZWJhcnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcc2lkZWJhcnNcXFxcZW4tVVMuc2lkZWJhci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovR2l0aHViL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby8udml0ZXByZXNzL3NyYy9zaWRlYmFycy9lbi1VUy5zaWRlYmFyLnRzXCI7aW1wb3J0IHsgRGVmYXVsdFRoZW1lIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG5cclxuLy8gY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XHJcbi8vIGNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcclxuXHJcbi8vIGZ1bmN0aW9uIGdlbmVyYXRlU2lkZWJhckNvbmZpZyhkb2NzUGF0aCwgbGluayA9IFwiXCIsIGluZGV4ID0gMCkge1xyXG4vLyAgIGNvbnN0IHNpZGViYXJDb25maWc6IERlZmF1bHRUaGVtZS5TaWRlYmFyID0ge307XHJcbi8vICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhkb2NzUGF0aCk7XHJcblxyXG4vLyAgIGZpbGVzLmZvckVhY2goKGZpbGVuYW1lKSA9PiB7XHJcbi8vICAgICBpZiAoZmlsZW5hbWUuc3RhcnRzV2l0aChcIi5cIikpIHJldHVybjtcclxuLy8gICAgIGNvbnN0IGZpbGVwYXRoID0gcGF0aC5qb2luKGRvY3NQYXRoLCBmaWxlbmFtZSk7XHJcbi8vICAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoZmlsZXBhdGgpO1xyXG4vLyAgICAgLy8gXHU1OTgyXHU2NzlDXHU2NjJGXHU2NTg3XHU0RUY2XHU1OTM5XHVGRjBDXHU1MjE5XHU5MDEyXHU1RjUyXHU3NTFGXHU2MjEwXHU1QjUwXHU3RUE3IHNpZGViYXIgXHU5MTREXHU3RjZFXHJcbi8vICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSB7XHJcbi8vICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xyXG4vLyAgICAgICAgIGNvbnN0IGNvbmZpZyA9IGdlbmVyYXRlU2lkZWJhckNvbmZpZyhcclxuLy8gICAgICAgICAgIGZpbGVwYXRoLFxyXG4vLyAgICAgICAgICAgYC8ke2ZpbGVuYW1lfS9gLFxyXG4vLyAgICAgICAgICAgaW5kZXggKyAxXHJcbi8vICAgICAgICAgKTtcclxuLy8gICAgICAgICBpZiAoIXNpZGViYXJDb25maWdbYC8ke2ZpbGVuYW1lfS9gXSkge1xyXG4vLyAgICAgICAgICAgc2lkZWJhckNvbmZpZ1tgLyR7ZmlsZW5hbWV9L2BdID0gW2NvbmZpZ107XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgICB9IGVsc2Uge1xyXG4vLyAgICAgICAgIGlmICghc2lkZWJhckNvbmZpZy5pdGVtcykge1xyXG4vLyAgICAgICAgICAgc2lkZWJhckNvbmZpZy5pdGVtcyA9IFtdO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgICAgICBzaWRlYmFyQ29uZmlnLml0ZW1zLnB1c2goXHJcbi8vICAgICAgICAgICBnZW5lcmF0ZVNpZGViYXJDb25maWcoZmlsZXBhdGgsIGAke2xpbmt9JHtmaWxlbmFtZX0vYCwgaW5kZXggKyAxKVxyXG4vLyAgICAgICAgICk7XHJcbi8vICAgICAgIH1cclxuLy8gICAgIH0gZWxzZSB7XHJcbi8vICAgICAgIGNvbnN0IGV4dG5hbWUgPSBwYXRoLmV4dG5hbWUoZmlsZXBhdGgpO1xyXG4vLyAgICAgICBjb25zdCBiYXNlbmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZXBhdGgsIGV4dG5hbWUpO1xyXG4vLyAgICAgICBpZiAoZmlsZW5hbWUgPT09IFwiaW5kZXgubWRcIiAmJiBpbmRleCA+IDApIHtcclxuLy8gICAgICAgICBjb25zdCBtZW51UGF0aCA9IHBhdGguZGlybmFtZShmaWxlcGF0aCk7XHJcbi8vICAgICAgICAgY29uc3QgbWVudU5hbWUgPSBwYXRoLmJhc2VuYW1lKG1lbnVQYXRoKTtcclxuLy8gICAgICAgICBzaWRlYmFyQ29uZmlnLnRleHQgPSBtZW51TmFtZTtcclxuLy8gICAgICAgICBzaWRlYmFyQ29uZmlnLmxpbmsgPSBbe1xyXG4vLyAgICAgICAgICAgbGluazogbGlua1xyXG4vLyAgICAgICAgIH1dO1xyXG4vLyAgICAgICB9XHJcbi8vICAgICAgIGlmIChleHRuYW1lID09PSBcIi5tZFwiICYmIGZpbGVuYW1lICE9PSBcImluZGV4Lm1kXCIpIHtcclxuLy8gICAgICAgICBpZiAoIXNpZGViYXJDb25maWcuaXRlbXMpIHtcclxuLy8gICAgICAgICAgIHNpZGViYXJDb25maWcuaXRlbXMgPSBbXTtcclxuLy8gICAgICAgICB9XHJcbi8vICAgICAgICAgc2lkZWJhckNvbmZpZy5pdGVtcy5wdXNoKHtcclxuLy8gICAgICAgICAgIHRleHQ6IGJhc2VuYW1lLFxyXG4vLyAgICAgICAgICAgbGluazogYCR7bGlua30ke2Jhc2VuYW1lfWAsXHJcbi8vICAgICAgICAgfSk7XHJcbi8vICAgICAgIH1cclxuLy8gICAgIH1cclxuLy8gICB9KTtcclxuXHJcbi8vICAgcmV0dXJuIHNpZGViYXJDb25maWc7XHJcbi8vIH1cclxuXHJcbi8vIGNvbnN0IGRvY3NQYXRoID0gcGF0aC5kaXJuYW1lKF9fZGlybmFtZSk7IC8vIGRvY3MgXHU3NkVFXHU1RjU1XHU4REVGXHU1Rjg0XHJcbi8vIGNvbnN0IGR5bmFtaWNTaWRlYmFyQ29uZmlnID0gZ2VuZXJhdGVTaWRlYmFyQ29uZmlnKGRvY3NQYXRoKTtcclxuLy8gY29uc29sZS5sb2coZG9jc1BhdGgpO1xyXG5cclxuZXhwb3J0IGNvbnN0IGdldEVuVVNTaWRlYmFyOiAoKSA9PiBEZWZhdWx0VGhlbWUuU2lkZWJhciA9ICgpID0+IHtcclxuICByZXR1cm4ge1xyXG4gICAgYXJ0aWNsZXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiRXhhbXBsZXNcIixcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgeyB0ZXh0OiBcIk1hcmtkb3duIEV4YW1wbGVzXCIsIGxpbms6IFwiL21hcmtkb3duLWV4YW1wbGVzXCIgfSxcclxuICAgICAgICAgIHsgdGV4dDogXCJSdW50aW1lIEFQSSBFeGFtcGxlc1wiLCBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIiB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgY291cnNlczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJcdTk4ODRcdTVCOUFcdTRFNDlcdTdDN0JcdTU3OEJcIixcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgeyB0ZXh0OiBcIk1hcmtkb3duIEV4YW1wbGVzXCIsIGxpbms6IFwiL2NvdXJzZS90eXBlc2NyaXB0L3ByZXNldF90eXBlXCIgfSxcclxuICAgICAgICAgIHsgdGV4dDogXCJSdW50aW1lIEFQSSBFeGFtcGxlc1wiLCBsaW5rOiBcIi9jb3Vyc2UvdHlwZXNjcmlwdC9leHRlbnNpb25fdHlwZVwiIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICAvLyBnYWxsZXJ5OiBbXHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICB0ZXh0OiBcIlx1OTg3OVx1NzZFRVx1Njg0OFx1NEY4QlwiLFxyXG4gICAgLy8gICAgIGl0ZW1zOiBbXHJcbiAgICAvLyAgICAgICB7IHRleHQ6IFwiXHU2NUUwXHU5NTIxXHU3ODU1XHU2NTNFXHU2NzNBXHU1NzNBXHU5NjMzXHU1MTQ5XHU2NzBEXHU1MkExXHU1RTczXHU1M0YwXCIsIGxpbms6IFwiL2dhbGxlcnkvc3VubnktbGFuZFwiIH0sXHJcbiAgICAvLyAgICAgICB7IHRleHQ6IFwiXHU2MjZDXHU2Q0YwXHU2NzNBXHU1NzNBXHU2NjdBXHU2MTY3XHU1MUZBXHU4ODRDXHU1RkFFXHU0RkUxXHU1QzBGXHU3QTBCXHU1RThGXCIsIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiXHU0RTBBXHU2RDc3XHU2QzExXHU4MjJBXHU1MzRFXHU0RTFDXHU1MUVGXHU0RTlBXHU2QzVGXHU4MkNGXHU1MjA2XHU1MTZDXHU1M0Y4XHU3NUFCXHU2MEM1XHU5NjMyXHU2M0E3XHU1RTczXHU1M0YwXCIsXHJcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHsgdGV4dDogXCJcdTY1RTBcdTk1MjFcdTc4NTVcdTY1M0VcdTY3M0FcdTU3M0FcdTVCODlcdTY4QzBcdTY1NDhcdTgwRkRcdTUyMDZcdTY3OTBcdTdDRkJcdTdFREZcIiwgbGluazogXCIvYXBpLWV4YW1wbGVzXCIgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTY1RTBcdTk1MjFcdTc4NTVcdTY1M0VcdTY3M0FcdTU3M0FcdThGREJcdTUxRkFcdTZFMkYvXHU2NUUwXHU3RUI4XHU1MzE2XHU3Q0ZCXHU3RURGXCIsXHJcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHsgdGV4dDogXCJcdTYyNkNcdTZDRjBcdTY3M0FcdTU3M0FcdTVCQTJcdTZFOTBcdTU3MzBcdTUyMDZcdTY3OTBcdTdDRkJcdTdFREZcIiwgbGluazogXCIvYXBpLWV4YW1wbGVzXCIgfSxcclxuICAgIC8vICAgICBdLFxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gXSxcclxuICAgIC8vIGJsb2c6IFtcclxuICAgIC8vICAge1xyXG4gICAgLy8gICAgIHRleHQ6IFwiMjAyMy0wNlwiLFxyXG4gICAgLy8gICAgIGl0ZW1zOiBbXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiUC1Ub3VjaCBQOTAwIFx1NjI1M1x1NTM3MFx1NjczQVx1NEY3Rlx1NzUyOFwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjMtMDYvUC1Ub3VjaCBQOTAwIFx1NjI1M1x1NTM3MFx1NjczQVx1NEY3Rlx1NzUyOFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHsgdGV4dDogXCJWaXRlc3QgXHU0RjdGXHU3NTI4XCIsIGxpbms6IFwiL2Jsb2cvMjAyMy0wNi8xNVwiIH0sXHJcbiAgICAvLyAgICAgXSxcclxuICAgIC8vICAgfSxcclxuICAgIC8vICAge1xyXG4gICAgLy8gICAgIHRleHQ6IFwiMjAyMy0wNVwiLFxyXG4gICAgLy8gICAgIGl0ZW1zOiBbXHJcbiAgICAvLyAgICAgICB7IHRleHQ6IFwiXHU2NDJEXHU1RUZBIEdpdGh1YiBcdTRFMkFcdTRFQkFcdTRFM0JcdTk4NzVcIiwgbGluazogXCIvYmxvZy8yMDIzLTA1LzE1XCIgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTRGN0ZcdTc1MjggU2tpYVNoYXJwIFx1NUI5RVx1NzNCMFx1NTZGRVx1NzI0N1x1NkMzNFx1NTM3MFwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjMtMDUvc2tpYXNoYXBfd2F0ZXJtYXJrLm1kXCIsXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgIF0sXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyAgIHtcclxuICAgIC8vICAgICB0ZXh0OiBcIjIwMjJcIixcclxuICAgIC8vICAgICBpdGVtczogW1xyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NEVDRSBEb2NrZXIgXHU1Qjg5XHU4OEM1IEdpdGVhXCIsXHJcbiAgICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMi9cdTRFQ0UgRG9ja2VyIFx1NUI4OVx1ODhDNSBHaXRlYS5tZFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTY1NEZcdTYzNzdcdTVGMDBcdTUzRDFcdTVCNjZcdTRFNjBcdTdCMTRcdThCQjBcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NjU0Rlx1NjM3N1x1NUYwMFx1NTNEMVx1NUI2Nlx1NEU2MFx1N0IxNFx1OEJCMC5tZFwiLFxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdGV4dDogXCJcdTc5QzFcdTY3MDludWdldFx1NjcwRFx1NTJBMVx1NTY2OFx1OTBFOFx1N0Y3MlwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU3OUMxXHU2NzA5bnVnZXRcdTY3MERcdTUyQTFcdTU2NjhcdTkwRThcdTdGNzIubWRcIixcclxuICAgIC8vICAgICAgIH0sXHJcblxyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NEUzQWRvY2tlclx1OTE0RFx1N0Y2RUhUVFBcdTRFRTNcdTc0MDZcdTY3MERcdTUyQTFcdTU2NjhcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NEUzQWRvY2tlclx1OTE0RFx1N0Y2RUhUVFBcdTRFRTNcdTc0MDZcdTY3MERcdTUyQTFcdTU2NjgubWRcIixcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHRleHQ6IFwiXHU3OUMxXHU2NzA5bnVnZXRcdTY3MERcdTUyQTFcdTU2NjhcdTkwRThcdTdGNzJcIixcclxuICAgIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NzlDMVx1NjcwOW51Z2V0XHU2NzBEXHU1MkExXHU1NjY4XHU5MEU4XHU3RjcyLm1kXCIsXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNlwiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU2QjYzXHU1NDExXHU0RUUzXHU3NDA2XHU1NDhDXHU1M0NEXHU1NDExXHU0RUUzXHU3NDA2Lm1kXCIsXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICB0ZXh0OiBcIlx1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNlx1OEJFNlx1ODlFM1wiLFxyXG4gICAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU2QjYzXHU1NDExXHU0RUUzXHU3NDA2XHU1NDhDXHU1M0NEXHU1NDExXHU0RUUzXHU3NDA2XHU4QkU2XHU4OUUzLm1kXCIsXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgIF0sXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyBdLFxyXG4gIH07XHJcblxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXGNvbmZpZ3NcXFxcemgtQ04uY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL2NvbmZpZ3MvemgtQ04uY29uZmlnLnRzXCI7aW1wb3J0IHR5cGUgeyBEZWZhdWx0VGhlbWUsIExvY2FsZVNwZWNpZmljQ29uZmlnIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG5cclxuLy9cdTVGMTVcdTUxNjVcdTRFRTVcdTRFMEFcdTkxNERcdTdGNkUgXHU2NjJGXHU4MkYxXHU2NTg3XHU3NTRDXHU5NzYyXHU5NzAwXHU4OTgxXHU0RkVFXHU2NTM5emhcdTRFM0FlblxyXG5pbXBvcnQgeyBnZXRaaENOTmF2IH0gZnJvbSBcIi4uL25hdnNcIjtcclxuaW1wb3J0IHsgZ2V0WmhDTlNpZGViYXIgfSBmcm9tIFwiLi4vc2lkZWJhcnNcIjtcclxuXHJcbmltcG9ydCBkYXlqcyBmcm9tICdkYXlqcydcclxuXHJcbmV4cG9ydCBjb25zdCB6aENvbmZpZzogTG9jYWxlU3BlY2lmaWNDb25maWc8RGVmYXVsdFRoZW1lLkNvbmZpZz4gPSB7XHJcbiAgZGVzY3JpcHRpb246IFwiQ01PTk8uTkVUIFx1NEU0Qlx1NUJCNlwiLFxyXG4gIHRpdGxlOiBcIkNNT05PLk5FVFwiLFxyXG4gIGxhbmc6IFwiemgtQ05cIixcclxuICB0aGVtZUNvbmZpZzoge1xyXG4gICAgbG9nbzogXCIvbG9nby5wbmdcIixcclxuICAgIGxhc3RVcGRhdGVkVGV4dDogXCJcdTRFMEFcdTZCMjFcdTY2RjRcdTY1QjBcIixcclxuICAgIHJldHVyblRvVG9wTGFiZWw6IFwiXHU4RkQ0XHU1NkRFXHU5ODc2XHU5MEU4XCIsXHJcbiAgICAvLyBcdTY1ODdcdTY4NjNcdTk4NzVcdTgxMUFcdTY1ODdcdTY3MkNcdTkxNERcdTdGNkVcclxuICAgIGRvY0Zvb3Rlcjoge1xyXG4gICAgICBwcmV2OiBcIlx1NEUwQVx1NEUwMFx1OTg3NVwiLFxyXG4gICAgICBuZXh0OiBcIlx1NEUwQlx1NEUwMFx1OTg3NVwiLFxyXG4gICAgfSxcclxuICAgIGZvb3Rlcjoge1xyXG4gICAgICBtZXNzYWdlOiBcIk1JVCBMaWNlbnNlZFwiLFxyXG4gICAgICBjb3B5cmlnaHQ6IGBDb3B5cmlnaHQgXHUwMEE5IDIwMDktJHtkYXlqcygpLnllYXIoKX0gQ01PTk8uTkVUYCxcclxuICAgIH0sXHJcbiAgICAvLyAgIGVkaXRMaW5rOiB7XHJcbiAgICAvLyAgICAgcGF0dGVybjogJ1x1OERFRlx1NUY4NFx1NTczMFx1NTc0MCcsXHJcbiAgICAvLyAgICAgdGV4dDogJ1x1NUJGOVx1NjcyQ1x1OTg3NVx1NjNEMFx1NTFGQVx1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRScsXHJcbiAgICAvLyAgIH0sXHJcbiAgICBuYXY6IGdldFpoQ05OYXYoKSxcclxuICAgIHNpZGViYXI6IGdldFpoQ05TaWRlYmFyKCksXHJcbiAgICBvdXRsaW5lOiB7XHJcbiAgICAgIGxldmVsOiBcImRlZXBcIiwgLy8gXHU1M0YzXHU0RkE3XHU1OTI3XHU3RUIyXHU2ODA3XHU5ODk4XHU1QzQyXHU3RUE3XHJcbiAgICAgIGxhYmVsOiBcIlx1NzZFRVx1NUY1NVwiLCAvLyBcdTUzRjNcdTRGQTdcdTU5MjdcdTdFQjJcdTY4MDdcdTk4OThcdTY1ODdcdTY3MkNcdTkxNERcdTdGNkVcclxuICAgIH0sXHJcbiAgfSxcclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXGNvbmZpZ3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcY29uZmlnc1xcXFxlbi1VUy5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvY29uZmlncy9lbi1VUy5jb25maWcudHNcIjtpbXBvcnQgdHlwZSB7IERlZmF1bHRUaGVtZSwgTG9jYWxlU3BlY2lmaWNDb25maWcgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcblxyXG4vL1x1NUYxNVx1NTE2NVx1NEVFNVx1NEUwQVx1OTE0RFx1N0Y2RSBcdTY2MkZcdTgyRjFcdTY1ODdcdTc1NENcdTk3NjJcdTk3MDBcdTg5ODFcdTRGRUVcdTY1Mzl6aFx1NEUzQWVuXHJcbmltcG9ydCB7IGdldEVuVVNOYXYgfSBmcm9tIFwiLi4vbmF2c1wiO1xyXG5pbXBvcnQgeyBnZXRFblVTU2lkZWJhciB9IGZyb20gXCIuLi9zaWRlYmFyc1wiO1xyXG5cclxuaW1wb3J0IGRheWpzIGZyb20gJ2RheWpzJ1xyXG5cclxuZXhwb3J0IGNvbnN0IGVuQ29uZmlnOiBMb2NhbGVTcGVjaWZpY0NvbmZpZzxEZWZhdWx0VGhlbWUuQ29uZmlnPiA9IHtcclxuICBkZXNjcmlwdGlvbjogXCJDTU9OTy5ORVQgSG9tZVBhZ2VcIixcclxuICB0aXRsZTogXCJDTU9OTy5ORVRcIixcclxuICBsYW5nOiBcImVuLVVTXCIsXHJcbiAgdGhlbWVDb25maWc6IHtcclxuICAgIGxvZ286IFwiL2xvZ28ucG5nXCIsXHJcbiAgICBsYXN0VXBkYXRlZFRleHQ6IFwiTGFzdCBVcGRhdGVkXCIsXHJcbiAgICByZXR1cm5Ub1RvcExhYmVsOiBcIlRPUFwiLFxyXG4gICAgLy8gXHU2NTg3XHU2ODYzXHU5ODc1XHU4MTFBXHU2NTg3XHU2NzJDXHU5MTREXHU3RjZFXHJcbiAgICBkb2NGb290ZXI6IHtcclxuICAgICAgcHJldjogXCJQcmV2XCIsXHJcbiAgICAgIG5leHQ6IFwiTmV4dFwiLFxyXG4gICAgfSxcclxuICAgIGZvb3Rlcjoge1xyXG4gICAgICBtZXNzYWdlOiBcIk1JVCBMaWNlbnNlZFwiLFxyXG4gICAgICBjb3B5cmlnaHQ6IGBDb3B5cmlnaHQgXHUwMEE5IDIwMDktJHtkYXlqcygpLnllYXIoKX0gQ01PTk8uTkVUYCxcclxuICAgIH0sXHJcbiAgICAvLyAgIGVkaXRMaW5rOiB7XHJcbiAgICAvLyAgICAgcGF0dGVybjogJ1x1OERFRlx1NUY4NFx1NTczMFx1NTc0MCcsXHJcbiAgICAvLyAgICAgdGV4dDogJ1x1NUJGOVx1NjcyQ1x1OTg3NVx1NjNEMFx1NTFGQVx1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRScsXHJcbiAgICAvLyAgIH0sXHJcbiAgICBuYXY6IGdldEVuVVNOYXYoKSxcclxuICAgIHNpZGViYXI6IGdldEVuVVNTaWRlYmFyKCksXHJcbiAgICBvdXRsaW5lOiB7XHJcbiAgICAgIGxldmVsOiBcImRlZXBcIiwgLy8gXHU1M0YzXHU0RkE3XHU1OTI3XHU3RUIyXHU2ODA3XHU5ODk4XHU1QzQyXHU3RUE3XHJcbiAgICAgIGxhYmVsOiBcIlx1NzZFRVx1NUY1NVwiLCAvLyBcdTUzRjNcdTRGQTdcdTU5MjdcdTdFQjJcdTY4MDdcdTk4OThcdTY1ODdcdTY3MkNcdTkxNERcdTdGNkVcclxuICAgIH0sXHJcbiAgfSxcclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXGRvY3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvZG9jcy50c1wiO2ltcG9ydCB7IERlZmF1bHRUaGVtZSwgVXNlckNvbmZpZyB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuaW1wb3J0IHsgZW5Db25maWcsIHpoQ29uZmlnIH0gZnJvbSBcIi4vY29uZmlnc1wiO1xyXG5cclxuY29uc3QgZG9jc0NvbmZpZzogVXNlckNvbmZpZzxEZWZhdWx0VGhlbWUuQ29uZmlnPiA9IHtcclxuICBiYXNlOiBcIi9cIixcclxuICB0aXRsZTogXCJDTU9OTy5ORVRcIixcclxuICBkZXNjcmlwdGlvbjogXCJcdTRFMkFcdTRFQkFcdTU3MjhcdTdFQkZcIixcclxuICBhcHBlYXJhbmNlOiB0cnVlLFxyXG4gIGxhbmc6IFwiemgtQ05cIixcclxuICBsYXN0VXBkYXRlZDogdHJ1ZSxcclxuICBoZWFkOiBbXHJcbiAgICAvLyBbXCJsaW5rXCIsIHsgcmVsOiBcImljb25cIiwgdHlwZTogXCJpbWFnZS9zdmcreG1sXCIsIGhyZWY6IFwiL2Zhdmljb24uc3ZnXCIgfV0sXHJcbiAgICBbXCJsaW5rXCIsIHsgcmVsOiBcImljb25cIiwgdHlwZTogXCJpbWFnZS94LWljb25cIiwgaHJlZjogXCIvZmF2aWNvbi5pY29cIiB9XSxcclxuICAgIC8vIFx1OEJCRVx1N0Y2RSBcdTYzQ0ZcdThGRjAgXHU1NDhDIFx1NTE3M1x1OTUyRVx1OEJDRFxyXG4gICAgW1xyXG4gICAgICBcIm1ldGFcIixcclxuICAgICAgeyBuYW1lOiBcImtleXdvcmRzXCIsIGNvbnRlbnQ6IFwicmVhY3QgcmVhY3QtYWRtaW4gYW50IFx1NTQwRVx1NTNGMFx1N0JBMVx1NzQwNlx1N0NGQlx1N0VERlwiIH0sXHJcbiAgICBdLFxyXG4gICAgW1xyXG4gICAgICBcIm1ldGFcIixcclxuICAgICAge1xyXG4gICAgICAgIG5hbWU6IFwiZGVzY3JpcHRpb25cIixcclxuICAgICAgICBjb250ZW50OlxyXG4gICAgICAgICAgXCJcdTZCNjRcdTY4NDZcdTY3QjZcdTRGN0ZcdTc1MjhcdTRFMEVcdTRFOENcdTZCMjFcdTVGMDBcdTUzRDFcdUZGMENcdTUyNERcdTdBRUZcdTY4NDZcdTY3QjZcdTRGN0ZcdTc1MjhyZWFjdFx1RkYwQ1VJXHU2ODQ2XHU2N0I2XHU0RjdGXHU3NTI4YW50LWRlc2lnblx1RkYwQ1x1NTE2OFx1NUM0MFx1NjU3MFx1NjM2RVx1NzJCNlx1NjAwMVx1N0JBMVx1NzQwNlx1NEY3Rlx1NzUyOHJlZHV4XHVGRjBDYWpheFx1NEY3Rlx1NzUyOFx1NUU5M1x1NEUzQWF4aW9zXHUzMDAyXHU3NTI4XHU0RThFXHU1RkVCXHU5MDFGXHU2NDJEXHU1RUZBXHU0RTJEXHU1NDBFXHU1M0YwXHU5ODc1XHU5NzYyXHUzMDAyXCIsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gIF0sXHJcbiAgaWdub3JlRGVhZExpbmtzOiBbXHJcbiAgICAvLyBpZ25vcmUgZXhhY3QgdXJsIFwiL3BsYXlncm91bmRcIlxyXG4gICAgXCIvcGxheWdyb3VuZFwiLFxyXG4gICAgLy8gaWdub3JlIGFsbCBsb2NhbGhvc3QgbGlua3NcclxuICAgIC9eaHR0cHM/OlxcL1xcL2xvY2FsaG9zdC8sXHJcbiAgICAvLyBpZ25vcmUgYWxsIGxpbmtzIGluY2x1ZGUgXCIvcmVwbC9cIlwiXHJcbiAgICAvXFwvcmVwbFxcLy8sXHJcbiAgICAvLyBjdXN0b20gZnVuY3Rpb24sIGlnbm9yZSBhbGwgbGlua3MgaW5jbHVkZSBcImlnbm9yZVwiXHJcbiAgICAodXJsKSA9PiB7XHJcbiAgICAgIHJldHVybiB1cmwudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhcImlnbm9yZVwiKTtcclxuICAgIH0sXHJcbiAgXSxcclxuICBsb2NhbGVzOiB7XHJcbiAgICAvLyBcdTgyRTVcdTY3OUNcdTkxNERcdTdGNkVcdTRFODZyb290XHVGRjBDXHU1MjE5XHU1M0NDXHU1MUZCdGl0bGVcdTc2ODRcdTY1RjZcdTUwMTlcdTRFMERcdTRGMUFcdThGRDRcdTU2REUvXHU4REVGXHU1Rjg0XHU0RTBCXHU0RTg2XHVGRjBDXHU1M0VBXHU0RjFBXHU4RkQ0XHU1NkRFXHU1NzI4bGlua1x1OERFRlx1NUY4NFx1NEUwQlxyXG4gICAgLy8gcm9vdDogeyBsYWJlbDogXCJcdTdCODBcdTRGNTNcdTRFMkRcdTY1ODdcIiwgbGFuZzogXCJ6aC1DTlwiLCBsaW5rOiBcIi96aC1DTi9cIiwgIC4uLnpoQ29uZmlnIH0sXHJcbiAgICAnemgtQ04nOiB7IGxhYmVsOiBcIlx1N0I4MFx1NEY1M1x1NEUyRFx1NjU4N1wiLCBsYW5nOiBcInpoLUNOXCIsIGxpbms6IFwiL3poLUNOL1wiLCAuLi56aENvbmZpZyB9LFxyXG4gICAgJ2VuLVVTJzogeyBsYWJlbDogXCJFbmdsaXNoXCIsIGxhbmc6IFwiZW4tVVNcIiwgbGluazogXCIvZW4tVVMvXCIsIC4uLmVuQ29uZmlnIH0sXHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCB7IGRvY3NDb25maWcgfTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXGhlYWQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvaGVhZC50c1wiO2ltcG9ydCB0eXBlIHsgSGVhZENvbmZpZyB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBoZWFkOiBIZWFkQ29uZmlnW10gPSBbXHJcbiAgLy8gW1xyXG4gIC8vICAgICAnbGluaycsXHJcbiAgLy8gICAgIHsgcmVsOiAncHJlY29ubmVjdCcsIGhyZWY6ICdodHRwczovL2ZvbnRzLmdzdGF0aWMuY29tJywgY3Jvc3NvcmlnaW46ICcnIH1cclxuICAvLyAgICAgLy8gd291bGQgcmVuZGVyOlxyXG4gIC8vICAgICAvL1xyXG4gIC8vICAgICAvLyA8bGluayByZWw9XCJwcmVjb25uZWN0XCIgaHJlZj1cImh0dHBzOi8vZm9udHMuZ3N0YXRpYy5jb21cIiBjcm9zc29yaWdpbiAvPlxyXG4gIC8vICAgXSxcclxuXHJcbiAgLy8gICBbXHJcbiAgLy8gICAgICdzY3JpcHQnLFxyXG4gIC8vICAgICB7IGlkOiAncmVnaXN0ZXItc3cnIH0sXHJcbiAgLy8gICAgIGA7KCgpID0+IHtcclxuICAvLyAgICAgICBpZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xyXG4gIC8vICAgICAgICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy9zdy5qcycpXHJcbiAgLy8gICAgICAgfVxyXG4gIC8vICAgICB9KSgpYFxyXG4gIC8vICAgICAvLyB3b3VsZCByZW5kZXI6XHJcbiAgLy8gICAgIC8vXHJcbiAgLy8gICAgIC8vIDxzY3JpcHQgaWQ9XCJyZWdpc3Rlci1zd1wiPlxyXG4gIC8vICAgICAvLyA7KCgpID0+IHtcclxuICAvLyAgICAgLy8gICBpZiAoJ3NlcnZpY2VXb3JrZXInIGluIG5hdmlnYXRvcikge1xyXG4gIC8vICAgICAvLyAgICAgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy9zdy5qcycpXHJcbiAgLy8gICAgIC8vICAgfVxyXG4gIC8vICAgICAvLyB9KSgpXHJcbiAgLy8gICAgIC8vIDwvc2NyaXB0PlxyXG4gIC8vICAgXVxyXG4gIFtcIm1ldGFcIiwgeyBuYW1lOiBcInRoZW1lLWNvbG9yXCIsIGNvbnRlbnQ6IFwiI2ZmZmZmZlwiIH1dLFxyXG4gIFtcIm1ldGFcIiwgeyBuYW1lOiBcImFwcGxlLW1vYmlsZS13ZWItYXBwLWNhcGFibGVcIiwgY29udGVudDogXCJ5ZXNcIiB9XSxcclxuICBbXCJtZXRhXCIsIHsgbmFtZTogXCJhcHBsZS1tb2JpbGUtd2ViLWFwcC1zdGF0dXMtYmFyLXN0eWxlXCIsIGNvbnRlbnQ6IFwiZGVmYXVsdFwiIH1dLFxyXG4gIFtcIm1ldGFcIiwgeyBuYW1lOiBcImFwcGxpY2F0aW9uLW5hbWVcIiwgY29udGVudDogXCJDTU9OTy5ORVRcIiB9XSxcclxuICBbXCJtZXRhXCIsIHsgbmFtZTogXCJhcHBsZS10b3VjaC1pY29uLXByZWNvbXBvc2VkXCIsIGNvbnRlbnQ6IFwiL2Zhdmljb24uc3ZnXCIgfV0sXHJcbiAgLy8gW1wibGlua1wiLCB7IHJlbDogXCJpY29uXCIsIHR5cGU6IFwiaW1hZ2Uvc3ZnK3htbFwiLCBocmVmOiBcIi9mYXZpY29uLnN2Z1wiIH1dLFxyXG4gIFtcclxuICAgIFwibGlua1wiLFxyXG4gICAgeyByZWw6IFwiaWNvblwiLCB0eXBlOiBcImltYWdlL3gtaWNvblwiLCBocmVmOiBcIi9mYXZpY29uLmljb1wiLCBzaXplczogXCJhbnlcIiB9LFxyXG4gIF0sXHJcbiAgLy8gWydsaW5rJywgeyByZWw6ICdtYXNrLWljb24nLCBocmVmOiAnL2Zhdmljb24uc3ZnJywgY29sb3I6ICcjZmZmZmZmJyB9XSxcclxuICAvLyBbJ2xpbmsnLCB7IHJlbDogJ2FwcGxlLXRvdWNoLWljb24nLCBocmVmOiAnL2Zhdmljb24uc3ZnJywgc2l6ZXM6ICcxODB4MTgwJyB9XSxcclxuICBbXHJcbiAgICBcImxpbmtcIixcclxuICAgIHtcclxuICAgICAgcmVsOiBcInN0eWxlc2hlZXRcIixcclxuICAgICAgaHJlZjogXCIvZm9udC5jc3NcIixcclxuICAgIH0sXHJcbiAgXSxcclxuICBbXCJtZXRhXCIsIHsgbmFtZTogXCJyZWZlcnJlclwiLCBjb250ZW50OiBcIm5vLXJlZmVycmVyXCIgfV0sXHJcbiAgLy8gW1xyXG4gIC8vICAgXCJzY3JpcHRcIixcclxuICAvLyAgIHtcclxuICAvLyAgICAgc3JjOiBcIi9jbGFyaXR5LmpzXCIsXHJcbiAgLy8gICB9LFxyXG4gIC8vIF0sXHJcbiAgW1xyXG4gICAgXCJtZXRhXCIsXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6IFwia2V5d29yZHNcIixcclxuICAgICAgY29udGVudDpcclxuICAgICAgICBcIkNNT05PLk5FVCxjaGFuZ3dlaWh1YSxcdTVFMzhcdTRGMUZcdTUzNEUsTGFuY2UsY2hhbmd3ZWlodWEuZ2l0aHViLmlvLFZpdGUsVml0ZVByZXNzLEFudERlc2lnblwiLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIFtcclxuICAgIFwibWV0YVwiLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiBcImRlc2NyaXB0aW9uXCIsXHJcbiAgICAgIGNvbnRlbnQ6IFwiQ01PTk8uTkVUIFx1NUI5OFx1NjVCOVx1N0FEOVx1NzBCOVx1RkYwQ1x1NEUzQlx1ODk4MVx1OEJCMFx1NUY1NVx1NUU3M1x1NjVGNlx1NURFNVx1NEY1Q1x1NjAzQlx1N0VEM1x1NTNDQVx1OTg3OVx1NzZFRVx1N0VDRlx1NTM4NlwiLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIFtcclxuICAgIFwibWV0YVwiLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiBcInRoZW1lLWNvbG9yXCIsXHJcbiAgICAgIGNvbnRlbnQ6IFwiIzE5NzJGOFwiLFxyXG4gICAgICAnbWVkaWEnOiAnKHByZWZlcnMtY29sb3Itc2NoZW1lOiBsaWdodCknXHJcbiAgICB9LFxyXG4gIF0sXHJcbiAgW1xyXG4gICAgXCJtZXRhXCIsXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6IFwidGhlbWUtY29sb3JcIixcclxuICAgICAgY29udGVudDogXCIjMUM0RDk4XCIsXHJcbiAgICAgICdtZWRpYSc6ICcocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspJ1xyXG4gICAgfSxcclxuICBdLFxyXG4gIFtcclxuICAgIFwic2NyaXB0XCIsXHJcbiAgICB7XHJcbiAgICAgIHNyYzogXCIvY3Vyc29yLmpzXCIsXHJcbiAgICAgIFwiZGF0YS1zaXRlXCI6IFwiaHR0cHM6Ly9jaGFuZ3dlaWh1YS5naXRodWIuaW9cIixcclxuICAgICAgXCJkYXRhLXNwYVwiOiBcImF1dG9cIixcclxuICAgICAgZGVmZXI6IFwidHJ1ZVwiLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIFtcclxuICAgIFwic2NyaXB0XCIsXHJcbiAgICB7XHJcbiAgICAgIHNyYzogXCJodHRwczovL2htLmJhaWR1LmNvbS9obS5qcz85YmRjZjZmMjExMjYzNGQxMzIyM2VmNzNkZTZmZTlmYVwiLFxyXG4gICAgICBcImRhdGEtc2l0ZVwiOiBcImh0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvXCIsXHJcbiAgICAgIFwiZGF0YS1zcGFcIjogXCJhdXRvXCIsXHJcbiAgICAgIGRlZmVyOiBcInRydWVcIixcclxuICAgIH0sXHJcbiAgXSxcclxuICAvLyBbXHJcbiAgLy8gICAnc2NyaXB0JyxcclxuICAvLyAgIHtcclxuXHJcbiAgLy8gICB9LFxyXG4gIC8vICAgYFxyXG4gIC8vICAgICB3aW5kb3cuX2htdCA9IHdpbmRvdy5faG10IHx8IFtdO1xyXG4gIC8vICAgICAoZnVuY3Rpb24oKSB7XHJcbiAgLy8gICAgICAgdmFyIGhtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcclxuICAvLyAgICAgICBobS5zcmMgPSBcImh0dHBzOi8vaG0uYmFpZHUuY29tL2htLmpzPzliZGNmNmYyMTEyNjM0ZDEzMjIzZWY3M2RlNmZlOWZhXCI7XHJcbiAgLy8gICAgICAgLy8gaG0uc2NyaXB0LmFzeW5jID0gdHJ1ZTtcclxuICAvLyAgICAgICB2YXIgcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpWzBdO1xyXG4gIC8vICAgICAgIHMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoaG0sIHMpO1xyXG4gIC8vICAgICB9KSgpO1xyXG4gIC8vICAgICBgLFxyXG4gIC8vIF0sXHJcbiAgLy8gXHU4QkJFXHU3RjZFIFx1NjNDRlx1OEZGMCBcdTU0OEMgXHU1MTczXHU5NTJFXHU4QkNEXHJcbiAgW1wibWV0YVwiLCB7IG5hbWU6IFwiYXV0aG9yXCIsIGNvbnRlbnQ6IFwiTGFuY2UgQ2hhbmdcIiB9XSxcclxuICBbXHJcbiAgICBcIm1ldGFcIixcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJrZXl3b3Jkc1wiLFxyXG4gICAgICBjb250ZW50OlxyXG4gICAgICAgIFwiY2hhbmd3ZWlodWEgXHU1RTM4XHU0RjFGXHU1MzRFIHZpdGVwcmVzcyBjbW9uby5uZXQgY2hhbmd3ZWlodWEuZ2l0aHViLmlvIFx1NEUyQVx1NEVCQVx1N0Y1MVx1N0FEOVwiLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIFtcclxuICAgIFwibWV0YVwiLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiBcImRlc2NyaXB0aW9uXCIsXHJcbiAgICAgIGNvbnRlbnQ6XHJcbiAgICAgICAgXCJcdTZCNjRcdTdDRkJcdTdFREZcdTU3RkFcdTRFOEV2aXRlcHJlc3NcdTRFOENcdTZCMjFcdTVGMDBcdTUzRDFcdUZGMENcdTUyNERcdTdBRUZcdTY4NDZcdTY3QjZcdTRGN0ZcdTc1Mjh2dWVqc1x1RkYwQ1VJXHU2ODQ2XHU2N0I2XHU0RjdGXHU3NTI4YW50LWRlc2lnblx1RkYwQ1x1NTE2OFx1NUM0MFx1NjU3MFx1NjM2RVx1NzJCNlx1NjAwMVx1N0JBMVx1NzQwNlx1NEY3Rlx1NzUyOHBhaW5hXHVGRjBDYWpheFx1NEY3Rlx1NzUyOFx1NUU5M1x1NEUzQWZldGNoXHUzMDAyXHU3NTI4XHU0RThFXHU1RkVCXHU5MDFGXHU2NDJEXHU1RUZBXHU0RTJBXHU0RUJBXHU3RjUxXHU3QUQ5XHU1NDhDXHU1MTg1XHU1QkI5XHU3QkExXHU3NDA2XHU1RTczXHU1M0YwXHUzMDAyXCIsXHJcbiAgICB9LFxyXG4gIF0sXHJcbl07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxtYXJrZG93bi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovR2l0aHViL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby8udml0ZXByZXNzL3NyYy9tYXJrZG93bi50c1wiO2ltcG9ydCBsaWdodGJveCBmcm9tIFwidml0ZXByZXNzLXBsdWdpbi1saWdodGJveFwiXHJcbmltcG9ydCB7IE1hcmtkb3duT3B0aW9ucyB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuaW1wb3J0IHRpbWVsaW5lIGZyb20gXCJ2aXRlcHJlc3MtbWFya2Rvd24tdGltZWxpbmVcIjtcclxuaW1wb3J0IGZvb3Rub3RlIGZyb20gJ21hcmtkb3duLWl0LWZvb3Rub3RlJztcclxuaW1wb3J0IG1hdGhqYXgzIGZyb20gJ21hcmtkb3duLWl0LW1hdGhqYXgzJztcclxuaW1wb3J0IHsgSW1hZ2VQbHVnaW4gfSBmcm9tICcuLi9wbHVnaW5zL21hcmtkb3duL2ltYWdlJ1xyXG5pbXBvcnQgbWVybWFpZFBsdWdpbiBmcm9tICcuLi9wbHVnaW5zL21hcmtkb3duL3JvdWdoLW1lcm1haWQnXHJcbmltcG9ydCB1c2VEZWZpbmVQbHVnaW4gZnJvbSAndml0ZXByZXNzLXBsdWdpbi1tYXJrZG93bi1kZWZpbmUnXHJcbmltcG9ydCB0YWJzUGx1Z2luIGZyb20gJ0ByZWQtYXN1a2Evdml0ZXByZXNzLXBsdWdpbi10YWJzJ1xyXG5pbXBvcnQgeyBncm91cEljb25NZFBsdWdpbiB9IGZyb20gJ3ZpdGVwcmVzcy1wbHVnaW4tZ3JvdXAtaWNvbnMnXHJcbmltcG9ydCB7IGRlbW9QcmV2aWV3UGx1Z2luIH0gZnJvbSAnQHZpdGVwcmVzcy1jb2RlLXByZXZpZXcvcGx1Z2luJ1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcclxuXHJcbmNvbnN0IENPTlNUUyA9IHtcclxuICBfX2N1c3RvbV92YXJpYWJsZV9fOiAneW91ciB2YWx1ZSdcclxufVxyXG5cclxuY29uc3QgbWFya2Rvd246IE1hcmtkb3duT3B0aW9ucyB8IHVuZGVmaW5lZCA9IHtcclxuICBsaW5lTnVtYmVyczogdHJ1ZSxcclxuICB0aGVtZTogeyBsaWdodDogJ2dpdGh1Yi1saWdodCcsIGRhcms6ICdnaXRodWItZGFyaycgfSxcclxuICBjb25maWc6IChtZCkgPT4ge1xyXG4gICAgdXNlRGVmaW5lUGx1Z2luKG1kLCBDT05TVFMpXHJcblxyXG4gICAgbWQudXNlKGZvb3Rub3RlKTtcclxuICAgIG1kLnVzZShtYXRoamF4Myk7XHJcbiAgICBtZC51c2UobGlnaHRib3gsIHt9KTtcclxuXHJcbiAgICBtZC51c2UodGltZWxpbmUpO1xyXG4gICAgdGFic1BsdWdpbihtZClcclxuICAgIG1kLnVzZShncm91cEljb25NZFBsdWdpbilcclxuICAgIG1kLnVzZShtZXJtYWlkUGx1Z2luKVxyXG5cclxuICAgIGNvbnN0IGRvY1Jvb3QgPSBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4uLy4uLycsIGltcG9ydC5tZXRhLnVybCkpXHJcbiAgICBtZC51c2UoZGVtb1ByZXZpZXdQbHVnaW4sIHtcclxuICAgICAgZG9jUm9vdFxyXG4gICAgfSlcclxuXHJcbiAgICBtZC51c2UoSW1hZ2VQbHVnaW4pXHJcblxyXG4gICAgLy8gXHU1NzI4XHU2MjQwXHU2NzA5XHU2NTg3XHU2ODYzXHU3Njg0PGgxPlx1NjgwN1x1N0I3RVx1NTQwRVx1NkRGQlx1NTJBMDxBcnRpY2xlTWV0YWRhdGEvPlx1N0VDNFx1NEVGNlxyXG4gICAgbWQucmVuZGVyZXIucnVsZXMuaGVhZGluZ19jbG9zZSA9ICh0b2tlbnMsIGlkeCwgb3B0aW9ucywgZW52LCBzbGYpID0+IHtcclxuICAgICAgbGV0IGh0bWxSZXN1bHQgPSBzbGYucmVuZGVyVG9rZW4odG9rZW5zLCBpZHgsIG9wdGlvbnMpO1xyXG4gICAgICBpZiAodG9rZW5zW2lkeF0udGFnID09PSAnaDEnKSB7XHJcbiAgICAgICAgaHRtbFJlc3VsdCArPSBgXFxuPENsaWVudE9ubHk+PEFydGljbGVNZXRhZGF0YSA6ZnJvbnRtYXR0ZXI9XCIkZnJvbnRtYXR0ZXJcIi8+PC9DbGllbnRPbmx5PmBcclxuICAgICAgfVxyXG4gICAgICAvLyBpZiAodG9rZW5zW2lkeF0udGFnID09PSAnaDEnKSBodG1sUmVzdWx0ICs9IGBcXG48Q2xpZW50T25seT48QXJ0aWNsZU1ldGFkYXRhIHYtaWY9XCIoJGZyb250bWF0dGVyPy5hc2lkZSA/PyB0cnVlKSAmJiAoJGZyb250bWF0dGVyPy5zaG93QXJ0aWNsZU1ldGFkYXRhID8/IHRydWUpXCIgOmFydGljbGU9XCIkZnJvbnRtYXR0ZXJcIiAvPjwvQ2xpZW50T25seT5gO1xyXG4gICAgICByZXR1cm4gaHRtbFJlc3VsdDtcclxuICAgIH1cclxuICB9LFxyXG59XHJcblxyXG5leHBvcnQge1xyXG4gIG1hcmtkb3duXHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxccGx1Z2luc1xcXFxtYXJrZG93blwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHBsdWdpbnNcXFxcbWFya2Rvd25cXFxcaW1hZ2UudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9wbHVnaW5zL21hcmtkb3duL2ltYWdlLnRzXCI7aW1wb3J0IHR5cGUgTWFya2Rvd25JdCBmcm9tICdtYXJrZG93bi1pdCdcclxuZXhwb3J0IGZ1bmN0aW9uIEltYWdlUGx1Z2luKG1kOiBNYXJrZG93bkl0KSB7XHJcbiAgY29uc3QgaW1hZ2VSZW5kZXIgPSBtZC5yZW5kZXJlci5ydWxlcy5pbWFnZSEgLy8gXHU1QzNFXHU5MEU4XHU3Njg0XHU4RkQ5XHU0RTJBXHU2MTFGXHU1M0Y5XHU1M0Y3XHU3Njg0XHU2MTBGXHU2MDFEXHU2NjJGXHU2NUFEXHU4QTAwXHU2QjY0XHU1M0Q4XHU5MUNGXHU4MEFGXHU1QjlBXHU2NzA5XHU1MDNDXHJcbiAgbWQucmVuZGVyZXIucnVsZXMuaW1hZ2UgPSAoLi4uYXJncykgPT4ge1xyXG4gICAgY29uc3QgW3Rva2VucywgaWR4XSA9IGFyZ3NcclxuICAgIGlmICh0b2tlbnNbaWR4ICsgMl0gJiYgL148IS0tLiotLT4vLnRlc3QodG9rZW5zW2lkeCArIDJdLmNvbnRlbnQpKSB7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSB0b2tlbnNbaWR4ICsgMl0uY29udGVudFxyXG4gICAgICBpZiAoL3NpemU9Ly50ZXN0KGRhdGEpKSB7XHJcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGRhdGEubWF0Y2goL3NpemU9KFxcZCspKHhcXGQrKT8vKVxyXG4gICAgICAgIHRva2Vuc1tpZHhdLmF0dHJzPy5wdXNoKFxyXG4gICAgICAgICAgWyd3aWR0aCcsIHNpemU/LlsxXSB8fCAnJ10sXHJcbiAgICAgICAgICBbJ2hlaWdodCcsIHNpemU/LlsyXT8uc3Vic3RyaW5nKDEpIHx8IHNpemU/LlsxXSB8fCAnJ11cclxuICAgICAgICApXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRva2Vuc1tpZHhdLmF0dHJzPy5wdXNoKFsnbG9hZGluZycsICdsYXp5J10sIFsnZGVjb2RpbmcnLCAnYXN5bmMnXSlcclxuICAgICAgdG9rZW5zW2lkeCArIDJdLmNvbnRlbnQgPSAnJ1xyXG4gICAgICByZXR1cm4gaW1hZ2VSZW5kZXIoLi4uYXJncylcclxuICAgIH1cclxuICAgIHRva2Vuc1tpZHhdLmF0dHJzPy5wdXNoKFsnbG9hZGluZycsICdsYXp5J10sIFsnZGVjb2RpbmcnLCAnYXN5bmMnXSlcclxuICAgIHJldHVybiBpbWFnZVJlbmRlciguLi5hcmdzKVxyXG4gIH1cclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxwbHVnaW5zXFxcXG1hcmtkb3duXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxccGx1Z2luc1xcXFxtYXJrZG93blxcXFxyb3VnaC1tZXJtYWlkLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3MvcGx1Z2lucy9tYXJrZG93bi9yb3VnaC1tZXJtYWlkLnRzXCI7aW1wb3J0IHR5cGUgTWFya2Rvd25JdCBmcm9tICdtYXJrZG93bi1pdCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJvdWdoTWVybWFpZFBsdWdpbihtZDogTWFya2Rvd25JdCk6IHZvaWQge1xyXG4gIC8vIFx1NEZERFx1NUI1OFx1NTM5Rlx1NjcwOVx1NzY4NCBmZW5jZSBcdTUxRkRcdTY1NzBcclxuICBjb25zdCBmZW5jZSA9IG1kLnJlbmRlcmVyLnJ1bGVzLmZlbmNlPy5iaW5kKG1kLnJlbmRlcmVyLnJ1bGVzKVxyXG4gIC8vIFx1NUI5QVx1NEU0OVx1NjIxMVx1NEVFQ1x1ODFFQVx1NURGMVx1NzY4NCBmZW5jZSBcdTUxRkRcdTY1NzBcclxuICBtZC5yZW5kZXJlci5ydWxlcy5mZW5jZSA9ICh0b2tlbnMsIGlkeCwgb3B0aW9ucywgZW52LCBzZWxmKSA9PiB7XHJcbiAgICAvLyBcdTkwMUFcdThGQzd0b2NrZW5cdTRFMEFcdTc2ODQgaW5mbyBcdTgzQjdcdTUzRDZcdTRFRTNcdTc4MDFcdTU3NTdcdTc2ODRcdThCRURcdThBMDBcclxuICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2lkeF1cclxuICAgIGNvbnN0IGxhbmd1YWdlID0gdG9rZW4uaW5mby50cmltKClcclxuXHJcbiAgICBpZiAobGFuZ3VhZ2Uuc3RhcnRzV2l0aCgnbWVybWFpZCcpKSB7XHJcbiAgICAgIC8vIFx1NUMwNlx1NEVFM1x1NzgwMVx1NTc1N1x1NkUzMlx1NjdEM1x1NjIxMCBodG1sXHVGRjBDXHU4RkQ5XHU5MUNDXHU2NkZGXHU2MzYyXHU2MjEwXHU2MjExXHU0RUVDXHU4MUVBXHU1REYxXHU1QjlBXHU0RTQ5XHU3Njg0dnVlXHU3RUM0XHU0RUY2XHJcbiAgICAgIHJldHVybiBgPFN0eWxlZE1lcm1haWQgaWQ9XCJtZXJtYWlkLSR7aWR4fVwiIGNvZGU9XCIke2VuY29kZVVSSUNvbXBvbmVudCh0b2tlbi5jb250ZW50KX1cIj48L1N0eWxlZE1lcm1haWQ+YFxyXG4gICAgfVxyXG4gICAgLy8gXHU1QkY5XHU0RTBEXHU2NjJGXHU2MjExXHU0RUVDXHU5NzAwXHU4OTgxXHU3Njg0XHU0RUUzXHU3ODAxXHU1NzU3XHU3Njg0XHU3NkY0XHU2M0E1XHU4QzAzXHU3NTI4XHU1MzlGXHU2NzA5XHU3Njg0XHU1MUZEXHU2NTcwXHJcbiAgICByZXR1cm4gZmVuY2UhKHRva2VucywgaWR4LCBvcHRpb25zLCBlbnYsIHNlbGYpXHJcbiAgfVxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3MvY29uZmlnLnRzXCI7aW1wb3J0IHsgdGhlbWVDb25maWcgfSBmcm9tIFwiLi9zcmMvdGhlbWVcIjtcclxuaW1wb3J0IHsgZG9jc0NvbmZpZyB9IGZyb20gXCIuL3NyYy9kb2NzXCI7XHJcbmltcG9ydCB7IGhlYWQgfSBmcm9tIFwiLi9zcmMvaGVhZFwiO1xyXG5pbXBvcnQgeyBtYXJrZG93biB9IGZyb20gXCIuL3NyYy9tYXJrZG93blwiO1xyXG5pbXBvcnQgeyBSc3NQbHVnaW4gfSBmcm9tIFwidml0ZXByZXNzLXBsdWdpbi1yc3NcIjtcclxuaW1wb3J0IHsgUlNTIH0gZnJvbSBcIi4vc3JjL3Jzc1wiO1xyXG4vLyBpbXBvcnQgeyB3aXRoTWVybWFpZCB9IGZyb20gXCJ2aXRlcHJlc3MtcGx1Z2luLW1lcm1haWRcIjtcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBIZWFkQ29uZmlnIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG5pbXBvcnQgeyBoYW5kbGVIZWFkTWV0YSB9IGZyb20gXCIuL3V0aWxzL2hhbmRsZUhlYWRNZXRhXCI7XHJcbmltcG9ydCBHaXRSZXZpc2lvbkluZm9QbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tZ2l0LXJldmlzaW9uLWluZm8nO1xyXG5pbXBvcnQgeyBnZXRDaGFuZ2Vsb2dBbmRDb250cmlidXRvcnMgfSBmcm9tICd2aXRlcHJlc3MtcGx1Z2luLWNoYW5nZWxvZydcclxuaW1wb3J0IHZpdGVwcmVzc1Byb3RlY3RQbHVnaW4gZnJvbSBcInZpdGVwcmVzcy1wcm90ZWN0LXBsdWdpblwiXHJcbmltcG9ydCB7IGdyb3VwSWNvblZpdGVQbHVnaW4gfSBmcm9tICd2aXRlcHJlc3MtcGx1Z2luLWdyb3VwLWljb25zJ1xyXG5pbXBvcnQgeyB2aXRlRGVtb1ByZXZpZXdQbHVnaW4gfSBmcm9tICdAdml0ZXByZXNzLWNvZGUtcHJldmlldy9wbHVnaW4nXHJcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCdcclxuXHJcbmNvbnN0IGN1c3RvbUVsZW1lbnRzID0gW1xyXG4gIFwibWp4LWNvbnRhaW5lclwiLFxyXG4gIFwibWp4LWFzc2lzdGl2ZS1tbWxcIixcclxuICBcIm1hdGhcIixcclxuICBcIm1hY3Rpb25cIixcclxuICBcIm1hbGlnbmdyb3VwXCIsXHJcbiAgXCJtYWxpZ25tYXJrXCIsXHJcbiAgXCJtZW5jbG9zZVwiLFxyXG4gIFwibWVycm9yXCIsXHJcbiAgXCJtZmVuY2VkXCIsXHJcbiAgXCJtZnJhY1wiLFxyXG4gIFwibWlcIixcclxuICBcIm1sb25nZGl2XCIsXHJcbiAgXCJtbXVsdGlzY3JpcHRzXCIsXHJcbiAgXCJtblwiLFxyXG4gIFwibW9cIixcclxuICBcIm1vdmVyXCIsXHJcbiAgXCJtcGFkZGVkXCIsXHJcbiAgXCJtcGhhbnRvbVwiLFxyXG4gIFwibXJvb3RcIixcclxuICBcIm1yb3dcIixcclxuICBcIm1zXCIsXHJcbiAgXCJtc2NhcnJpZXNcIixcclxuICBcIm1zY2FycnlcIixcclxuICBcIm1zY2Fycmllc1wiLFxyXG4gIFwibXNncm91cFwiLFxyXG4gIFwibXN0YWNrXCIsXHJcbiAgXCJtbG9uZ2RpdlwiLFxyXG4gIFwibXNsaW5lXCIsXHJcbiAgXCJtc3RhY2tcIixcclxuICBcIm1zcGFjZVwiLFxyXG4gIFwibXNxcnRcIixcclxuICBcIm1zcm93XCIsXHJcbiAgXCJtc3RhY2tcIixcclxuICBcIm1zdGFja1wiLFxyXG4gIFwibXN0eWxlXCIsXHJcbiAgXCJtc3ViXCIsXHJcbiAgXCJtc3VwXCIsXHJcbiAgXCJtc3Vic3VwXCIsXHJcbiAgXCJtdGFibGVcIixcclxuICBcIm10ZFwiLFxyXG4gIFwibXRleHRcIixcclxuICBcIm10clwiLFxyXG4gIFwibXVuZGVyXCIsXHJcbiAgXCJtdW5kZXJvdmVyXCIsXHJcbiAgXCJzZW1hbnRpY3NcIixcclxuICBcIm1hdGhcIixcclxuICBcIm1pXCIsXHJcbiAgXCJtblwiLFxyXG4gIFwibW9cIixcclxuICBcIm1zXCIsXHJcbiAgXCJtc3BhY2VcIixcclxuICBcIm10ZXh0XCIsXHJcbiAgXCJtZW5jbG9zZVwiLFxyXG4gIFwibWVycm9yXCIsXHJcbiAgXCJtZmVuY2VkXCIsXHJcbiAgXCJtZnJhY1wiLFxyXG4gIFwibXBhZGRlZFwiLFxyXG4gIFwibXBoYW50b21cIixcclxuICBcIm1yb290XCIsXHJcbiAgXCJtcm93XCIsXHJcbiAgXCJtc3FydFwiLFxyXG4gIFwibXN0eWxlXCIsXHJcbiAgXCJtbXVsdGlzY3JpcHRzXCIsXHJcbiAgXCJtb3ZlclwiLFxyXG4gIFwibXByZXNjcmlwdHNcIixcclxuICBcIm1zdWJcIixcclxuICBcIm1zdWJzdXBcIixcclxuICBcIm1zdXBcIixcclxuICBcIm11bmRlclwiLFxyXG4gIFwibXVuZGVyb3ZlclwiLFxyXG4gIFwibm9uZVwiLFxyXG4gIFwibWFsaWduZ3JvdXBcIixcclxuICBcIm1hbGlnbm1hcmtcIixcclxuICBcIm10YWJsZVwiLFxyXG4gIFwibXRkXCIsXHJcbiAgXCJtdHJcIixcclxuICBcIm1sb25nZGl2XCIsXHJcbiAgXCJtc2NhcnJpZXNcIixcclxuICBcIm1zY2FycnlcIixcclxuICBcIm1zZ3JvdXBcIixcclxuICBcIm1zbGluZVwiLFxyXG4gIFwibXNyb3dcIixcclxuICBcIm1zdGFja1wiLFxyXG4gIFwibWFjdGlvblwiLFxyXG4gIFwic2VtYW50aWNzXCIsXHJcbiAgXCJhbm5vdGF0aW9uXCIsXHJcbiAgXCJhbm5vdGF0aW9uLXhtbFwiLFxyXG5dO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAvLyBtZXJtYWlkOiB7XHJcbiAgLy8gICAvLyAndGhlbWUnOiAnYmFzZScsXHJcbiAgLy8gICAvLyAndGhlbWVWYXJpYWJsZXMnOiB7XHJcbiAgLy8gICAvLyAgICdwcmltYXJ5Q29sb3InOiAnIzUwNmJlZScsXHJcbiAgLy8gICAvLyAgIC8vICdwcmltYXJ5VGV4dENvbG9yJzogJyNmZmYnLFxyXG4gIC8vICAgLy8gICAvLyAncHJpbWFyeUJvcmRlckNvbG9yJzogJyM3QzAwMDAnLFxyXG4gIC8vICAgLy8gICAvLyAnbGluZUNvbG9yJzogJyNGOEIyMjknLFxyXG4gIC8vICAgLy8gICAvLyAnc2Vjb25kYXJ5Q29sb3InOiAnIzAwNjEwMCcsXHJcbiAgLy8gICAvLyAgIC8vICd0ZXJ0aWFyeUNvbG9yJzogJyNmZmYnXHJcbiAgLy8gICAvLyB9LFxyXG4gIC8vICAgZm9udEZhbWlseTogXCJBbGliYWJhUHVIdWlUaSwgXHU5NjNGXHU5MUNDXHU1REY0XHU1REY0XHU2NjZFXHU2MEUwXHU0RjUzIDMuMFwiLFxyXG4gIC8vICAgYWx0Rm9udEZhbWlseTogXCJBbGliYWJhUHVIdWlUaSwgXHU5NjNGXHU5MUNDXHU1REY0XHU1REY0XHU2NjZFXHU2MEUwXHU0RjUzIDMuMFwiLFxyXG4gIC8vICAgc3RhcnRPbkxvYWQ6IGZhbHNlXHJcbiAgLy8gICAvL21lcm1haWRDb25maWcgIXRoZW1lIGhlcmUgd29ya3MgZm9yIGxpZ3RoIG1vZGUgc2luY2UgZGFyayB0aGVtZSBpcyBmb3JjZWQgaW4gZGFyayBtb2RlXHJcbiAgLy8gfSxcclxuICAvLyAvLyBcdTUzRUZcdTkwMDlcdTU3MzBcdTRGN0ZcdTc1MjhNZXJtYWlkUGx1Z2luQ29uZmlnXHU0RTNBXHU2M0QyXHU0RUY2XHU2NzJDXHU4RUFCXHU4QkJFXHU3RjZFXHU5ODlEXHU1OTE2XHU3Njg0XHU5MTREXHU3RjZFXHJcbiAgLy8gbWVybWFpZFBsdWdpbjoge1xyXG4gIC8vICAgY2xhc3M6IFwibWVybWFpZCByb3VnaC1tZXJtYWlkXCIgLy8gXHU0RTNBXHU3MjM2XHU1QkI5XHU1NjY4XHU4QkJFXHU3RjZFXHU5ODlEXHU1OTE2XHU3Njg0Q1NTXHU3QzdCXHJcbiAgLy8gfSxcclxuICB2aXRlOiB7XHJcbiAgICBsb2dMZXZlbDogJ2luZm8nLFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICAvLyBHaXRSZXZpc2lvbkluZm9QbHVnaW4oKSxcclxuICAgICAgLy8gZ3JvdXBJY29uVml0ZVBsdWdpbih7XHJcbiAgICAgIC8vICAgY3VzdG9tSWNvbjoge1xyXG4gICAgICAvLyAgICAgYWU6ICdsb2dvczphZG9iZS1hZnRlci1lZmZlY3RzJyxcclxuICAgICAgLy8gICAgIGFpOiAnbG9nb3M6YWRvYmUtaWxsdXN0cmF0b3InLFxyXG4gICAgICAvLyAgICAgcHM6ICdsb2dvczphZG9iZS1waG90b3Nob3AnLFxyXG4gICAgICAvLyAgICAgLy8gcnNwYWNrOiBsb2NhbEljb25Mb2FkZXIoaW1wb3J0Lm1ldGEudXJsLCAnLi4vYXNzZXRzL3JzcGFjay5zdmcnKSxcclxuICAgICAgLy8gICAgIC8vIGZhcm06IGxvY2FsSWNvbkxvYWRlcihpbXBvcnQubWV0YS51cmwsICcuLi9hc3NldHMvZmFybS5zdmcnKSxcclxuICAgICAgLy8gICB9LFxyXG4gICAgICAvLyB9KSxcclxuICAgICAgLy8gUnNzUGx1Z2luKFJTUyksXHJcbiAgICAgIC8vIHZpdGVwcmVzc1Byb3RlY3RQbHVnaW4oe1xyXG4gICAgICAvLyAgIGRpc2FibGVGMTI6IHRydWUsXHJcbiAgICAgIC8vICAgZGlzYWJsZUNvcHk6IHRydWUsXHJcbiAgICAgIC8vICAgZGlzYWJsZVNlbGVjdDogdHJ1ZSxcclxuICAgICAgLy8gfSksXHJcbiAgICAgIHZpdGVEZW1vUHJldmlld1BsdWdpbigpLFxyXG4gICAgICB2dWVKc3goKSxcclxuICAgIF0sXHJcbiAgfSxcclxuICAvLyB2dWU6IHtcclxuICAvLyAgIHRlbXBsYXRlOiB7XHJcbiAgLy8gICAgIGNvbXBpbGVyT3B0aW9uczoge1xyXG4gIC8vICAgICAgIGlzQ3VzdG9tRWxlbWVudDogKHRhZykgPT4gY3VzdG9tRWxlbWVudHMuaW5jbHVkZXModGFnKSxcclxuICAvLyAgICAgICB3aGl0ZXNwYWNlOiAncHJlc2VydmUnICAgICAgLy8gWyFjb2RlICsrXSBcdTkxQ0RcdTcwQjk6XHU4QkJFXHU3RjZFd2hpdGVzcGFjZTogJ3ByZXNlcnZlJ1x1NjYyRlx1NEUzQVx1NEU4Nlx1NEZERFx1NzU1OU1hcmtkb3duXHU0RTJEXHU3Njg0XHU3QTdBXHU2ODNDXHVGRjBDXHU0RUU1XHU0RkJGTGl0ZVRyZWVcdTUzRUZcdTRFRTVcdTZCNjNcdTc4NkVcdTg5RTNcdTY3OTBsaXRlXHU2ODNDXHU1RjBGXHU3Njg0XHU2ODExXHU2NTcwXHU2MzZFXHUzMDAyXHJcbiAgLy8gICAgIH0sXHJcbiAgLy8gICB9LFxyXG4gIC8vIH0sXHJcbiAgLyogXHU2NTg3XHU2ODYzXHU5MTREXHU3RjZFICovXHJcbiAgLi4uZG9jc0NvbmZpZyxcclxuICAvKiBcdTY4MDdcdTU5MzRcdTkxNERcdTdGNkUgKi9cclxuICBoZWFkLFxyXG4gIC8qIFx1NEUzQlx1OTg5OFx1OTE0RFx1N0Y2RSAqL1xyXG4gIHRoZW1lQ29uZmlnLFxyXG4gIG1hcmtkb3duLFxyXG4gIGxhc3RVcGRhdGVkOiBmYWxzZSxcclxuICAvLyBzaXRlbWFwOiB7XHJcbiAgLy8gICBob3N0bmFtZTogXCJodHRwczovL2NoYW5nd2VpaHVhLmdpdGh1Yi5pb1wiLFxyXG4gIC8vICAgbGFzdG1vZERhdGVPbmx5OiBmYWxzZSxcclxuICAvLyAgIHRyYW5zZm9ybUl0ZW1zOiAoaXRlbXMpID0+IHtcclxuICAvLyAgICAgLy8gYWRkIG5ldyBpdGVtcyBvciBtb2RpZnkvZmlsdGVyIGV4aXN0aW5nIGl0ZW1zXHJcbiAgLy8gICAgIGl0ZW1zLnB1c2goe1xyXG4gIC8vICAgICAgIHVybDogXCIvZXh0cmEtcGFnZVwiLFxyXG4gIC8vICAgICAgIGNoYW5nZWZyZXE6IFwibW9udGhseVwiLFxyXG4gIC8vICAgICAgIHByaW9yaXR5OiAwLjgsXHJcbiAgLy8gICAgIH0pO1xyXG4gIC8vICAgICByZXR1cm4gaXRlbXM7XHJcbiAgLy8gICB9LFxyXG4gIC8vIH0sXHJcbiAgcmV3cml0ZXM6IHtcclxuICAgICcvaW5kZXgubWQnOiAnL3poLUNOL2luZGV4Lm1kJyxcclxuICB9LFxyXG4gIGlnbm9yZURlYWRMaW5rczogdHJ1ZSxcclxuICAvLyBhc3luYyB0cmFuc2Zvcm1IZWFkKGNvbnRleHQpOiBQcm9taXNlPEhlYWRDb25maWdbXT4ge1xyXG4gIC8vICAgLy8gY29uc3QgeyBhc3NldHMgfT0gY29udGV4dFxyXG4gIC8vICAgY29uc3QgaGVhZCA9IGhhbmRsZUhlYWRNZXRhKGNvbnRleHQpXHJcblxyXG4gIC8vICAgcmV0dXJuIGhlYWRcclxuICAvLyB9LFxyXG4gIC8vIGFzeW5jIHRyYW5zZm9ybVBhZ2VEYXRhKHBhZ2VEYXRhKSB7XHJcbiAgLy8gICBjb25zdCB7IGlzTm90Rm91bmQsIHJlbGF0aXZlUGF0aCB9ID0gcGFnZURhdGFcclxuICAvLyAgIGNvbnN0IHsgY29udHJpYnV0b3JzLCBjaGFuZ2Vsb2cgfSA9IGF3YWl0IGdldENoYW5nZWxvZ0FuZENvbnRyaWJ1dG9ycyhyZWxhdGl2ZVBhdGgpXHJcbiAgLy8gICBjb25zdCBDdXN0b21BdmF0YXJzID0ge1xyXG4gIC8vICAgICAnY2hhbmd3ZWlodWEnOiAnMjg3NzIwMSdcclxuICAvLyAgIH1cclxuICAvLyAgIGNvbnN0IEN1c3RvbUNvbnRyaWJ1dG9ycyA9IGNvbnRyaWJ1dG9ycy5tYXAoY29udHJpYnV0b3IgPT4ge1xyXG4gIC8vICAgICBjb250cmlidXRvci5hdmF0YXIgPSBgaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LyR7Q3VzdG9tQXZhdGFyc1tjb250cmlidXRvci5uYW1lXX0/dj00YFxyXG4gIC8vICAgICByZXR1cm4gY29udHJpYnV0b3JcclxuICAvLyAgIH0pXHJcblxyXG4gIC8vICAgaWYgKGlzTm90Rm91bmQpIHtcclxuICAvLyAgICAgcGFnZURhdGEudGl0bGUgPSAnTm90IEZvdW5kJ1xyXG4gIC8vICAgfVxyXG5cclxuICAvLyAgIHJldHVybiB7XHJcbiAgLy8gICAgIENvbW1pdERhdGE6IHtcclxuICAvLyAgICAgICBjb250cmlidXRvcnM6IEN1c3RvbUNvbnRyaWJ1dG9ycyxcclxuICAvLyAgICAgICBjaGFuZ2Vsb2csXHJcbiAgLy8gICAgICAgY29tbWl0VVJMOiAnaHR0cHM6Ly9naXRodWIuY29tL2NoYW5nd2VpaHVhL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby9jb21taXQvJyxcclxuICAvLyAgICAgICB0aXRsZTogJ0NoYW5nZWxvZydcclxuICAvLyAgICAgfVxyXG4gIC8vICAgfVxyXG4gIC8vIH1cclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFJTyxJQUFNLGNBQW1DO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTTlDLE1BQU07QUFBQSxFQUNOLHFCQUFxQjtBQUFBLEVB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
