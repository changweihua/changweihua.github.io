// .vitepress/config.ts
import { defineConfig } from "file:///E:/GitHub/changweihua.github.io/node_modules/vitepress/dist/node/index.js";

// .vitepress/src/theme.ts
var themeConfig = {
  // editLink: {
  //   pattern: 'https://github.com/changweihua/changweihua.github.io/edit/master//:path',
  //   text: 'Edit this page on GitHub'
  // },
  logo: "/logo.png",
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
  i18nRouting: false,
  algolia: {
    appId: "II80G4ELTA",
    // 需要替换
    apiKey: "96ae9b68f09fd07cbf58cbdf39b99cba",
    // 需要替换
    indexName: "cmono_net",
    // 需要替换
    placeholder: "\u8BF7\u8F93\u5165\u5173\u952E\u8BCD",
    // searchParameters?: SearchOptions
    // disableUserPersonalization?: boolean
    // initialQuery?: string
    locales: {
      zh: {
        translations: {
          button: {
            buttonText: "\u641C\u7D22"
          }
        }
      }
    }
    // 搜索配置（二选一）
    // search: {
    //   // 本地离线搜索
    //   provider: "local",
    //   // 多语言搜索配置
    //   options: {
    //     locales: {
    //       /* 默认语言 */
    //       zh: {
    //         translations: {
    //           button: {
    //             buttonText: "搜索",
    //             buttonAriaLabel: "搜索文档",
    //           },
    //           modal: {
    //             noResultsText: "无法找到相关结果",
    //             resetButtonTitle: "清除查询结果",
    //             footer: {
    //               selectText: "选择",
    //               navigateText: "切换",
    //             },
    //           },
    //         },
    //       },
    //       en: {
    //         translations: {
    //           button: {
    //             buttonText: "Search",
    //             buttonAriaLabel: "Search for Documents",
    //           },
    //           modal: {
    //             noResultsText: "Unable to find relevant results",
    //             resetButtonTitle: "Clear Query Results",
    //             footer: {
    //               selectText: "select",
    //               navigateText: "switch",
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
  }
};

// .vitepress/src/markdown.ts
import {
  containerPreview,
  componentPreview
} from "file:///E:/GitHub/changweihua.github.io/node_modules/@vitepress-demo-preview/plugin/dist/index.mjs";
import mdItCustomAttrs from "file:///E:/GitHub/changweihua.github.io/node_modules/markdown-it-custom-attrs/index.js";
import timeline from "file:///E:/GitHub/changweihua.github.io/node_modules/vitepress-markdown-timeline/dist/cjs/index.cjs.js";
import container from "file:///E:/GitHub/changweihua.github.io/node_modules/markdown-it-container/index.js";
import { renderSandbox } from "file:///E:/GitHub/changweihua.github.io/node_modules/vitepress-plugin-sandpack/dist/esm/index.mjs";
var markdown = {
  lineNumbers: true,
  theme: { light: "github-light", dark: "github-dark" },
  config: (md) => {
    md.use(containerPreview);
    md.use(componentPreview);
    md.use(mdItCustomAttrs, "image", {
      "data-fancybox": "gallery"
    });
    md.use(timeline);
    md.use(container, "sandbox", {
      render(tokens, idx) {
        return renderSandbox(tokens, idx, "sandbox");
      }
    });
  }
};

// .vitepress/src/defaults.ts
var defaultConfig = {
  title: "CMONO.NET",
  description: "\u4E2A\u4EBA\u5728\u7EBF",
  appearance: false,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "/fancybox.css"
      }
    ],
    [
      "script",
      {
        src: "/fancybox.umd.js"
      }
    ],
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
    }
  ]
};

// .vitepress/src/head.ts
var head = [
  ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  // [
  //   "link",
  //   {
  //     rel: "stylesheet",
  //     href: "/fancybox.css",
  //   },
  // ],
  // [
  //   "script",
  //   {
  //     src: "/fancybox.umd.js",
  //   },
  // ],
  [
    "script",
    {
      src: "/cursor.js",
      "data-site": "https://changweihua.github.io",
      "data-spa": "auto",
      defer: ""
    }
  ],
  // 设置 描述 和 关键词
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

// .vitepress/src/navs/en.ts
var nav = [
  { text: "Home", link: "/en/", activeMatch: "^/en/$|^/en/index/$" },
  {
    text: "Articles",
    link: "/en/blog/",
    activeMatch: "^/en/blog/"
  },
  {
    text: "Courses",
    link: "/en/course/",
    activeMatch: "^/en/course/"
  },
  {
    text: "About",
    link: "/en/about/index.md",
    activeMatch: "^/en/about/"
  },
  {
    text: "Categories",
    items: [
      {
        items: [
          { text: "Three3D", link: "/en/category/three3d.md" },
          { text: "Tools", link: "/en/category/tool.md" }
        ]
      },
      {
        items: [
          { text: "Flutter", link: "/en/category/flutter.md" },
          { text: "MiniProgram", link: "/en/category/wechat.md" },
          { text: "DotNET", link: "/en/category/dotnet.md" }
        ]
      },
      {
        items: [
          { text: "VueJS", link: "/en/category/vue.md" },
          { text: "TypeScript", link: "/en/category/typescript.md" }
        ]
      }
    ]
  }
];

// .vitepress/src/sidebars/en.ts
var sidebar = {
  articles: [
    {
      text: "Examples",
      items: [
        { text: "Markdown Examples", link: "/markdown-examples" },
        { text: "Runtime API Examples", link: "/api-examples" }
      ]
    }
  ]
  // gallery: [
  //   {
  //     text: "项目案例",
  //     items: [
  //       { text: "苏南硕放国际机场阳光服务平台", link: "/gallery/sunny-land" },
  //       { text: "扬泰机场智慧出行微信小程序", link: "/api-examples" },
  //       {
  //         text: "上海民航华东凯亚江苏分公司疫情防控平台",
  //         link: "/api-examples",
  //       },
  //       { text: "苏南硕放国际机场安检效能分析系统", link: "/api-examples" },
  //       {
  //         text: "苏南硕放国际机场进出港/无纸化系统",
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

// .vitepress/src/configs/en.ts
var enConfig = {
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
      copyright: "Copyright \xA9 2009-2023 CMONO.NET"
    },
    //   editLink: {
    //     pattern: '路径地址',
    //     text: '对本页提出修改建议',
    //   },
    nav,
    sidebar,
    outline: {
      level: "deep",
      // 右侧大纲标题层级
      label: "\u76EE\u5F55"
      // 右侧大纲标题文本配置
    }
  }
};

// .vitepress/src/navs/zh.ts
var nav2 = [
  { text: "\u9996\u9875", link: "/", activeMatch: "^/$|^/index/" },
  {
    text: "\u535A\u5BA2",
    link: "/blog/",
    activeMatch: "^/blog/"
  },
  {
    text: "\u8BFE\u7A0B",
    link: "/course/",
    activeMatch: "^/course/"
  },
  {
    text: "\u5173\u4E8E",
    link: "/about/index.md",
    activeMatch: "^/about/"
  },
  {
    text: "\u6587\u7AE0\u5206\u7C7B",
    items: [
      {
        items: [
          { text: "3D \u5F00\u53D1", link: "/category/three3d.md" },
          { text: "\u5DE5\u5177&\u5E73\u53F0", link: "/category/tool.md" }
        ]
      },
      {
        items: [
          { text: "Flutter", link: "/category/flutter.md" },
          { text: "\u5FAE\u4FE1\u5C0F\u7A0B\u5E8F", link: "/category/wechat.md" },
          { text: "DotNET", link: "/category/dotnet.md" }
        ]
      },
      {
        items: [
          { text: "VueJS", link: "/category/vue.md" },
          { text: "TypeScript", link: "/category/typescript.md" }
        ]
      }
    ]
  }
];

// .vitepress/src/sidebars/zh.ts
var sidebar2 = {
  articles: [
    {
      text: "Examples",
      items: [
        { text: "Markdown Examples", link: "/markdown-examples" },
        { text: "Runtime API Examples", link: "/api-examples" }
      ]
    }
  ]
  // gallery: [
  //   {
  //     text: "项目案例",
  //     items: [
  //       { text: "苏南硕放国际机场阳光服务平台", link: "/gallery/sunny-land" },
  //       { text: "扬泰机场智慧出行微信小程序", link: "/api-examples" },
  //       {
  //         text: "上海民航华东凯亚江苏分公司疫情防控平台",
  //         link: "/api-examples",
  //       },
  //       { text: "苏南硕放国际机场安检效能分析系统", link: "/api-examples" },
  //       {
  //         text: "苏南硕放国际机场进出港/无纸化系统",
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

// .vitepress/src/configs/zh.ts
var zhConfig = {
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
      copyright: "Copyright \xA9 2009-2023 CMONO.NET"
    },
    //   editLink: {
    //     pattern: '路径地址',
    //     text: '对本页提出修改建议',
    //   },
    nav: nav2,
    sidebar: sidebar2,
    outline: {
      level: "deep",
      // 右侧大纲标题层级
      label: "\u76EE\u5F55"
      // 右侧大纲标题文本配置
    }
  }
};

// .vitepress/config.ts
import { RssPlugin } from "file:///E:/GitHub/changweihua.github.io/node_modules/vitepress-plugin-rss/dist/index.mjs";

// .vitepress/src/rss.ts
var RSS = {
  // necessary（必选参数）
  title: "CMONO.NET",
  baseUrl: ".",
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
var links = [];
var config_default = defineConfig({
  vite: {
    // ↓↓↓↓↓
    plugins: [RssPlugin(RSS)]
    // ↑↑↑↑↑
  },
  ...defaultConfig,
  /* 标头配置 */
  head,
  /* 主题配置 */
  themeConfig,
  /* 语言配置 */
  locales: {
    root: { label: "\u7B80\u4F53\u4E2D\u6587", lang: "zh-CN", link: "/", ...zhConfig },
    en: { label: "English", lang: "en-US", link: "/en/", ...enConfig }
  },
  lastUpdated: true,
  // titleTemplate: ':title - Custom Suffix',
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
  transformHtml: (_, id, { pageData }) => {
    if (!/[\\/]404\.html$/.test(id)) {
      links.push({
        url: pageData.relativePath.replace(/\/index\.md$/, "/").replace(/\.md$/, ".html"),
        lastmod: pageData.lastUpdated
      });
    }
  }
  // transformHtml: (_, id, { pageData }) => {
  //   if (!/[\\/]404\.html$/.test(id))
  //     links.push({
  //       // you might need to change this if not using clean urls mode
  //       url: pageData.relativePath.replace(/((^|\/)index)?\.md$/, "$2"),
  //       lastmod: pageData.lastUpdated,
  //     });
  // },
  // buildEnd: async ({ outDir }) => {
  //   const sitemap = new SitemapStream({
  //     hostname: "https://changweihua.github.io/",
  //   });
  //   const writeStream = createWriteStream(resolve(outDir, "sitemap.xml"));
  //   sitemap.pipe(writeStream);
  //   links.forEach((link) => sitemap.write(link));
  //   sitemap.end();
  //   await new Promise((r) => writeStream.on("finish", r));
  // },
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9jb25maWcudHMiLCAiLnZpdGVwcmVzcy9zcmMvdGhlbWUudHMiLCAiLnZpdGVwcmVzcy9zcmMvbWFya2Rvd24udHMiLCAiLnZpdGVwcmVzcy9zcmMvZGVmYXVsdHMudHMiLCAiLnZpdGVwcmVzcy9zcmMvaGVhZC50cyIsICIudml0ZXByZXNzL3NyYy9uYXZzL2VuLnRzIiwgIi52aXRlcHJlc3Mvc3JjL3NpZGViYXJzL2VuLnRzIiwgIi52aXRlcHJlc3Mvc3JjL2NvbmZpZ3MvZW4udHMiLCAiLnZpdGVwcmVzcy9zcmMvbmF2cy96aC50cyIsICIudml0ZXByZXNzL3NyYy9zaWRlYmFycy96aC50cyIsICIudml0ZXByZXNzL3NyYy9jb25maWdzL3poLnRzIiwgIi52aXRlcHJlc3Mvc3JjL3Jzcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXEdpdEh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcR2l0SHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXGNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovR2l0SHViL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby8udml0ZXByZXNzL2NvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuaW1wb3J0IHsgdGhlbWVDb25maWcgfSBmcm9tIFwiLi9zcmMvdGhlbWVcIjtcclxuaW1wb3J0IHsgZGVmYXVsdENvbmZpZyB9IGZyb20gXCIuL3NyYy9kZWZhdWx0c1wiO1xyXG5pbXBvcnQgeyBoZWFkIH0gZnJvbSBcIi4vc3JjL2hlYWRcIjtcclxuXHJcbi8vXHU5MTREXHU3RjZFXHU3Njg0XHU4MkYxXHU2NTg3XHU2NTg3XHU2ODYzXHU4QkJFXHU3RjZFXHJcbmltcG9ydCB7IGVuQ29uZmlnIH0gZnJvbSBcIi4vc3JjL2NvbmZpZ3MvZW5cIjtcclxuXHJcbi8vXHU5MTREXHU3RjZFXHU3Njg0XHU0RTJEXHU2NTg3XHU2NTg3XHU2ODYzXHU4QkJFXHU3RjZFXHJcbmltcG9ydCB7IHpoQ29uZmlnIH0gZnJvbSBcIi4vc3JjL2NvbmZpZ3MvemhcIjtcclxuaW1wb3J0IHsgU2l0ZW1hcFN0cmVhbSB9IGZyb20gXCJzaXRlbWFwXCI7XHJcbmltcG9ydCB7IGNyZWF0ZVdyaXRlU3RyZWFtIH0gZnJvbSBcIm5vZGU6ZnNcIjtcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJub2RlOnBhdGhcIjtcclxuaW1wb3J0IHsgUnNzUGx1Z2luIH0gZnJvbSBcInZpdGVwcmVzcy1wbHVnaW4tcnNzXCI7XHJcblxyXG5pbXBvcnQge1JTU30gZnJvbSBcIi4vc3JjL3Jzc1wiXHJcblxyXG5jb25zdCBsaW5rczogYW55W10gPSBbXTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgdml0ZToge1xyXG4gICAgLy8gXHUyMTkzXHUyMTkzXHUyMTkzXHUyMTkzXHUyMTkzXHJcbiAgICBwbHVnaW5zOiBbUnNzUGx1Z2luKFJTUyldXHJcbiAgICAvLyBcdTIxOTFcdTIxOTFcdTIxOTFcdTIxOTFcdTIxOTFcclxuICB9LFxyXG4gIC4uLmRlZmF1bHRDb25maWcsXHJcbiAgLyogXHU2ODA3XHU1OTM0XHU5MTREXHU3RjZFICovXHJcbiAgaGVhZCxcclxuICAvKiBcdTRFM0JcdTk4OThcdTkxNERcdTdGNkUgKi9cclxuICB0aGVtZUNvbmZpZyxcclxuICAvKiBcdThCRURcdThBMDBcdTkxNERcdTdGNkUgKi9cclxuICBsb2NhbGVzOiB7XHJcbiAgICByb290OiB7IGxhYmVsOiBcIlx1N0I4MFx1NEY1M1x1NEUyRFx1NjU4N1wiLCBsYW5nOiBcInpoLUNOXCIsIGxpbms6IFwiL1wiLCAuLi56aENvbmZpZyB9LFxyXG4gICAgZW46IHsgbGFiZWw6IFwiRW5nbGlzaFwiLCBsYW5nOiBcImVuLVVTXCIsIGxpbms6IFwiL2VuL1wiLCAuLi5lbkNvbmZpZyB9LFxyXG4gIH0sXHJcbiAgbGFzdFVwZGF0ZWQ6IHRydWUsXHJcbiAgLy8gdGl0bGVUZW1wbGF0ZTogJzp0aXRsZSAtIEN1c3RvbSBTdWZmaXgnLFxyXG4gIHNpdGVtYXA6IHtcclxuICAgIGhvc3RuYW1lOiBcImh0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvXCIsXHJcbiAgICBsYXN0bW9kRGF0ZU9ubHk6IGZhbHNlLFxyXG4gICAgdHJhbnNmb3JtSXRlbXM6IChpdGVtcykgPT4ge1xyXG4gICAgICAvLyBhZGQgbmV3IGl0ZW1zIG9yIG1vZGlmeS9maWx0ZXIgZXhpc3RpbmcgaXRlbXNcclxuICAgICAgaXRlbXMucHVzaCh7XHJcbiAgICAgICAgdXJsOiBcIi9leHRyYS1wYWdlXCIsXHJcbiAgICAgICAgY2hhbmdlZnJlcTogXCJtb250aGx5XCIsXHJcbiAgICAgICAgcHJpb3JpdHk6IDAuOCxcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBpdGVtcztcclxuICAgIH0sXHJcbiAgfSxcclxuICB0cmFuc2Zvcm1IdG1sOiAoXywgaWQsIHsgcGFnZURhdGEgfSkgPT4ge1xyXG4gICAgaWYgKCEvW1xcXFwvXTQwNFxcLmh0bWwkLy50ZXN0KGlkKSkge1xyXG4gICAgICBsaW5rcy5wdXNoKHtcclxuICAgICAgICB1cmw6IHBhZ2VEYXRhLnJlbGF0aXZlUGF0aC5yZXBsYWNlKC9cXC9pbmRleFxcLm1kJC8sICcvJykucmVwbGFjZSgvXFwubWQkLywgJy5odG1sJyksXHJcbiAgICAgICAgbGFzdG1vZDogcGFnZURhdGEubGFzdFVwZGF0ZWQsXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfSxcclxuICAvLyB0cmFuc2Zvcm1IdG1sOiAoXywgaWQsIHsgcGFnZURhdGEgfSkgPT4ge1xyXG4gIC8vICAgaWYgKCEvW1xcXFwvXTQwNFxcLmh0bWwkLy50ZXN0KGlkKSlcclxuICAvLyAgICAgbGlua3MucHVzaCh7XHJcbiAgLy8gICAgICAgLy8geW91IG1pZ2h0IG5lZWQgdG8gY2hhbmdlIHRoaXMgaWYgbm90IHVzaW5nIGNsZWFuIHVybHMgbW9kZVxyXG4gIC8vICAgICAgIHVybDogcGFnZURhdGEucmVsYXRpdmVQYXRoLnJlcGxhY2UoLygoXnxcXC8paW5kZXgpP1xcLm1kJC8sIFwiJDJcIiksXHJcbiAgLy8gICAgICAgbGFzdG1vZDogcGFnZURhdGEubGFzdFVwZGF0ZWQsXHJcbiAgLy8gICAgIH0pO1xyXG4gIC8vIH0sXHJcbiAgLy8gYnVpbGRFbmQ6IGFzeW5jICh7IG91dERpciB9KSA9PiB7XHJcbiAgLy8gICBjb25zdCBzaXRlbWFwID0gbmV3IFNpdGVtYXBTdHJlYW0oe1xyXG4gIC8vICAgICBob3N0bmFtZTogXCJodHRwczovL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby9cIixcclxuICAvLyAgIH0pO1xyXG4gIC8vICAgY29uc3Qgd3JpdGVTdHJlYW0gPSBjcmVhdGVXcml0ZVN0cmVhbShyZXNvbHZlKG91dERpciwgXCJzaXRlbWFwLnhtbFwiKSk7XHJcbiAgLy8gICBzaXRlbWFwLnBpcGUod3JpdGVTdHJlYW0pO1xyXG4gIC8vICAgbGlua3MuZm9yRWFjaCgobGluaykgPT4gc2l0ZW1hcC53cml0ZShsaW5rKSk7XHJcbiAgLy8gICBzaXRlbWFwLmVuZCgpO1xyXG4gIC8vICAgYXdhaXQgbmV3IFByb21pc2UoKHIpID0+IHdyaXRlU3RyZWFtLm9uKFwiZmluaXNoXCIsIHIpKTtcclxuICAvLyB9LFxyXG59KTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxHaXRIdWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxHaXRIdWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXHRoZW1lLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9HaXRIdWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL3RoZW1lLnRzXCI7aW1wb3J0IHR5cGUgeyBEZWZhdWx0VGhlbWUgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgdGhlbWVDb25maWc6IERlZmF1bHRUaGVtZS5Db25maWcgPSB7XHJcbiAgLy8gZWRpdExpbms6IHtcclxuICAvLyAgIHBhdHRlcm46ICdodHRwczovL2dpdGh1Yi5jb20vY2hhbmd3ZWlodWEvY2hhbmd3ZWlodWEuZ2l0aHViLmlvL2VkaXQvbWFzdGVyLy86cGF0aCcsXHJcbiAgLy8gICB0ZXh0OiAnRWRpdCB0aGlzIHBhZ2Ugb24gR2l0SHViJ1xyXG4gIC8vIH0sXHJcbiAgbG9nbzogXCIvbG9nby5wbmdcIixcclxuICBzb2NpYWxMaW5rczogW1xyXG4gICAge1xyXG4gICAgICBpY29uOiB7XHJcbiAgICAgICAgc3ZnOiAnPHN2ZyB0PVwiMTY5MjU4MTA5MDE5OVwiIGNsYXNzPVwiaWNvblwiIHZpZXdCb3g9XCIwIDAgMTAyNCAxMDI0XCIgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBwLWlkPVwiNzQ3MVwiIHdpZHRoPVwiMTI4XCIgaGVpZ2h0PVwiMTI4XCI+PHBhdGggZD1cIk01MTIgMTIuNjM2MTZjLTI4Mi43NDY4OCAwLTUxMiAyMjkuMjEyMTYtNTEyIDUxMiAwIDIyNi4yMjIwOCAxNDYuNjk4MjQgNDE4LjE0MDE2IDM1MC4xMjYwOCA0ODUuODI2NTYgMjUuNTc5NTIgNC43MzA4OCAzNS4wMDAzMi0xMS4xMDAxNiAzNS4wMDAzMi0yNC42Mzc0NCAwLTEyLjIwNjA4LTAuNDcxMDQtNTIuNTUxNjgtMC42OTYzMi05NS4zMTM5Mi0xNDIuNDM4NCAzMC45NjU3Ni0xNzIuNTAzMDQtNjAuNDE2LTE3Mi41MDMwNC02MC40MTYtMjMuMjg1NzYtNTkuMTY2NzItNTYuODUyNDgtNzQuOTE1ODQtNTYuODUyNDgtNzQuOTE1ODQtNDYuNDQ4NjQtMzEuNzg0OTYgMy41MDIwOC0zMS4xMjk2IDMuNTAyMDgtMzEuMTI5NiA1MS40MDQ4IDMuNjA0NDggNzguNDc5MzYgNTIuNzU2NDggNzguNDc5MzYgNTIuNzU2NDggNDUuNjcwNCA3OC4yNzQ1NiAxMTkuNzY3MDQgNTUuNjQ0MTYgMTQ5LjAxMjQ4IDQyLjU1NzQ0IDQuNTg3NTItMzMuMDk1NjggMTcuODU4NTYtNTUuNjg1MTIgMzIuNTAxNzYtNjguNDY0NjQtMTEzLjcyNTQ0LTEyLjk0MzM2LTIzMy4yNjcyLTU2Ljg1MjQ4LTIzMy4yNjcyLTI1My4wMzA0IDAtNTUuODg5OTIgMjAuMDA4OTYtMTAxLjU4MDggNTIuNzU2NDgtMTM3LjQyMDgtNS4zMjQ4LTEyLjkwMjQtMjIuODU1NjgtNjQuOTYyNTYgNC45NTYxNi0xMzUuNDk1NjggMCAwIDQzLjAwOC0xMy43NDIwOCAxNDAuODQwOTYgNTIuNDkwMjQgNDAuODM3MTItMTEuMzQ1OTIgODQuNjQzODQtMTcuMDM5MzYgMTI4LjE2Mzg0LTE3LjI0NDE2IDQzLjQ5OTUyIDAuMjA0OCA4Ny4zMjY3MiA1Ljg3Nzc2IDEyOC4yNDU3NiAxNy4yNDQxNiA5Ny43MzA1Ni02Ni4yNTI4IDE0MC42NTY2NC01Mi40OTAyNCAxNDAuNjU2NjQtNTIuNDkwMjQgMjcuODczMjggNzAuNTMzMTIgMTAuMzQyNCAxMjIuNTkzMjggNS4wMzgwOCAxMzUuNDk1NjggMzIuODI5NDQgMzUuODYwNDggNTIuNjk1MDQgODEuNTMwODggNTIuNjk1MDQgMTM3LjQyMDggMCAxOTYuNjQ4OTYtMTE5Ljc4NzUyIDIzOS45NDM2OC0yMzMuNzk5NjggMjUyLjYyMDggMTguMzcwNTYgMTUuODkyNDggMzQuNzM0MDggNDcuMDQyNTYgMzQuNzM0MDggOTQuODAxOTIgMCA2OC41MDU2LTAuNTkzOTIgMTIzLjYzNzc2LTAuNTkzOTIgMTQwLjUxMzI4IDAgMTMuNjE5MiA5LjIxNiAyOS41OTM2IDM1LjE2NDE2IDI0LjU3NiAyMDMuMzI1NDQtNjcuNzY4MzIgMzQ5LjgzOTM2LTI1OS42MjQ5NiAzNDkuODM5MzYtNDg1Ljc2NTEyIDAtMjgyLjc4Nzg0LTIyOS4yMzI2NC01MTItNTEyLTUxMnpcIiBmaWxsPVwiIzQ0NDQ0NFwiIHAtaWQ9XCI3NDcyXCI+PC9wYXRoPjwvc3ZnPicsXHJcbiAgICAgIH0sXHJcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2NoYW5nd2VpaHVhXCIsXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBpY29uOiB7XHJcbiAgICAgICAgc3ZnOiAnPHN2ZyB0PVwiMTY5MTAzNzA0ODYwMFwiIGNsYXNzPVwiaWNvblwiIHZpZXdCb3g9XCIwIDAgMTAyNCAxMDI0XCIgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBwLWlkPVwiMjU4NFwiIHdpZHRoPVwiMTI4XCIgaGVpZ2h0PVwiMTI4XCI+PHBhdGggZD1cIk0yMjguNyA2NDMuOWMtMC4xIDAuMS0wLjIgMC4zLTAuMyAwLjQgMy45LTQuNCA4LTkgMTItMTMuNS03LjUgOC40LTExLjcgMTMuMS0xMS43IDEzLjF6XCIgZmlsbD1cIiMxNTkwRTlcIiBwLWlkPVwiMjU4NVwiPjwvcGF0aD48cGF0aCBkPVwiTTg5NCAyOTguMWwyNS42LTE1LjFjMTAuNC02LjEgOS4xLTIxLjUtMi4xLTI1LjlsLTEyLjMtNC44Yy0xOC03LjEtMzQuMi0xOC4yLTQ2LjctMzMtMTUuNy0xOC41LTQ0LjctNDUuMS05MC45LTYwLjgtNTIuNy0xOC0xNDIuOS0xNC40LTE5My4yLTEwLjUtMTUuOSAxLjItMjUgMTguNC0xNy40IDMyLjUgNDIuNiA3OC42IDE2LjcgMTE0LjMtNS43IDE0MC43LTM0LjMgNDAuNC05Ny40IDExMi4yLTE2MC43IDE4My42IDIxLjktMjQuNSA0MS44LTQ2LjggNTguMS02NS4xIDM2LjQtNDAuOCA5MS4zLTYxLjUgMTQ1LjEtNTEuNyAxNzEuNSAzMS4zIDE5MSAyNTMuNC05LjIgMzg1LjYgMjYuMS0xLjQgNTIuNi0zLjMgNzkuMi02IDI1Mi42LTI2IDI3Mi42LTIzMi4xIDIxOC0zMzMuOS0xOS40LTM2LjEtMjIuMi02MC41LTIwLjEtODMuOSAyLTIxLjUgMTMuOC00MC44IDMyLjMtNTEuN3pcIiBmaWxsPVwiIzk5QzIzNlwiIHAtaWQ9XCIyNTg2XCI+PC9wYXRoPjxwYXRoIGQ9XCJNMjEyLjggNzA0LjVDMjQxLjEgNjcyLjkgMzE2IDU4OSAzOTAuNyA1MDQuN2MtNTQuNiA2MS4yLTEyMS44IDEzNi43LTE3Ny45IDE5OS44elwiIGZpbGw9XCIjMTU5MEU5XCIgcC1pZD1cIjI1ODdcIj48L3BhdGg+PHBhdGggZD1cIk0yMTYuMyA3NTguNmMtMTkuNS0yLjUtMjguMi0yNS42LTE1LjUtNDAuNi01MS43IDU4LjMtOTEuNyAxMDMuNS05OS4xIDExMi42LTI0LjEgMjkuNSAyNDcuNyA5Ny45IDQ4Mi42LTU2LjggMC4xLTAuMSAwLjMtMC4yIDAuNC0wLjMtMTU2LjUgOC4yLTI5OC41LTUuOS0zNjguNC0xNC45elwiIGZpbGw9XCIjQ0FDMTM0XCIgcC1pZD1cIjI1ODhcIj48L3BhdGg+PHBhdGggZD1cIk01OTMuOSAzODcuOWMtNTMuOC05LjgtMTA4LjcgMTAuOS0xNDUuMSA1MS43LTE2LjMgMTguMi0zNi4yIDQwLjUtNTguMSA2NS4xQzMxNiA1ODkgMjQxLjEgNjcyLjkgMjEyLjggNzA0LjVjLTQuMSA0LjYtOC4xIDkuMS0xMiAxMy41LTEyLjcgMTQuOS00IDM4IDE1LjUgNDAuNiA2OS45IDkgMjExLjkgMjMuMSAzNjguMyAxNSAyMDAuMi0xMzIuMyAxODAuOC0zNTQuNCA5LjMtMzg1Ljd6XCIgZmlsbD1cIiMwMjlGNDBcIiBwLWlkPVwiMjU4OVwiPjwvcGF0aD48L3N2Zz4nLFxyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBcImh0dHBzOi8vd3d3Lnl1cXVlLmNvbS9jaGFuZ3dlaWh1YVwiLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWNvbjoge1xyXG4gICAgICAgIHN2ZzogJzxzdmcgdD1cIjE2OTEwMzczNTg3NDRcIiBjbGFzcz1cImljb25cIiB2aWV3Qm94PVwiMCAwIDEwMjQgMTAyNFwiIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgcC1pZD1cIjc2NDBcIiB3aWR0aD1cIjEyOFwiIGhlaWdodD1cIjEyOFwiPjxwYXRoIGQ9XCJNMTE3LjE0OTczNyA5MDYuODUwMjYzVjExNy4xNjAwODFoNzg5LjY5MDE4MnY3ODkuNjkwMTgyeiBtMTQ4LjUyMTM3NC02NDEuNzA2NjY3djQ5Mi41MzM2NTdoMjQ4Ljg3MzM3NFYzNjcuODQzNTU2aDE0NS4wMjUyOTN2Mzg5LjkwNjEwMWg5OC43MzUzMjFWMjY1LjE0MzU5NnpcIiBmaWxsPVwiI0NCMzgzN1wiIHAtaWQ9XCI3NjQxXCI+PC9wYXRoPjwvc3ZnPicsXHJcbiAgICAgIH0sXHJcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly93d3cubnBtanMuY29tL35jaGFuZ3dlaWh1YVwiLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWNvbjoge1xyXG4gICAgICAgIHN2ZzogJzxzdmcgdD1cIjE2OTI1ODA5OTA4MzNcIiBjbGFzcz1cImljb25cIiB2aWV3Qm94PVwiMCAwIDExMjkgMTAyNFwiIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgcC1pZD1cIjQ0NThcIiB3aWR0aD1cIjEyOFwiIGhlaWdodD1cIjEyOFwiPjxwYXRoIGQ9XCJNMjM0LjkwOSA5LjY1NmE4MC40NjggODAuNDY4IDAgMCAxIDY4LjM5OCAwIDE2Ny4zNzQgMTY3LjM3NCAwIDAgMSA0MS44NDMgMzAuNTc4bDE2MC45MzcgMTQwLjgyaDExNS4wN2wxNjAuOTM2LTE0MC44MmExNjguOTgzIDE2OC45ODMgMCAwIDEgNDEuODQzLTMwLjU3OEE4MC40NjggODAuNDY4IDAgMCAxIDkzMC45NiA3Ni40NDVhODAuNDY4IDgwLjQ2OCAwIDAgMS0xNy43MDMgNTMuOTE0IDQ0OS44MTggNDQ5LjgxOCAwIDAgMS0zNS40MDYgMzIuMTg3IDIzMi41NTMgMjMyLjU1MyAwIDAgMS0yMi41MzEgMTguNTA4aDEwMC41ODVhMTcwLjU5MyAxNzAuNTkzIDAgMCAxIDExOC4yODkgNTMuMTA5IDE3MS4zOTcgMTcxLjM5NyAwIDAgMSA1My45MTQgMTE4LjI4OHY0NjIuNjkzYTMyNS44OTcgMzI1Ljg5NyAwIDAgMS00LjAyNCA3MC4wMDcgMTc4LjY0IDE3OC42NCAwIDAgMS04MC40NjggMTEyLjY1NiAxNzMuMDA3IDE3My4wMDcgMCAwIDEtOTIuNTM5IDI1Ljc1aC03MzguN2EzNDEuMTg2IDM0MS4xODYgMCAwIDEtNzIuNDIxLTQuMDI0QTE3Ny44MzUgMTc3LjgzNSAwIDAgMSAyOC45MSA5MzkuMDY1YTE3Mi4yMDIgMTcyLjIwMiAwIDAgMS0yNy4zNi05Mi41MzlWMzg4LjY2MmEzNjAuNDk4IDM2MC40OTggMCAwIDEgMC02Ni43ODlBMTc3LjAzIDE3Ny4wMyAwIDAgMSAxNjIuNDg3IDE3OC42NGgxMDUuNDE0Yy0xNi44OTktMTIuMDctMzEuMzgzLTI2LjU1NS00Ni42NzItMzkuNDNhODAuNDY4IDgwLjQ2OCAwIDAgMS0yNS43NS02NS45ODQgODAuNDY4IDgwLjQ2OCAwIDAgMSAzOS40My02My41N00yMTYuNCAzMjEuODczYTgwLjQ2OCA4MC40NjggMCAwIDAtNjMuNTcgNTcuOTM3IDEwOC42MzIgMTA4LjYzMiAwIDAgMCAwIDMwLjU3OHYzODAuNjE1YTgwLjQ2OCA4MC40NjggMCAwIDAgNTUuNTIzIDgwLjQ2OSAxMDYuMjE4IDEwNi4yMTggMCAwIDAgMzQuNjAxIDUuNjMyaDY1NC4yMDhhODAuNDY4IDgwLjQ2OCAwIDAgMCA3Ni40NDQtNDcuNDc2IDExMi42NTYgMTEyLjY1NiAwIDAgMCA4LjA0Ny01My4xMDl2LTM1NC4wNmExMzUuMTg3IDEzNS4xODcgMCAwIDAgMC0zOC42MjUgODAuNDY4IDgwLjQ2OCAwIDAgMC01Mi4zMDQtNTQuNzE5IDEyOS41NTQgMTI5LjU1NCAwIDAgMC00OS44OS03LjI0MkgyNTQuMjJhMjY4Ljc2NCAyNjguNzY0IDAgMCAwLTM3LjgyIDB6IG0wIDBcIiBmaWxsPVwiIzIwQjBFM1wiIHAtaWQ9XCI0NDU5XCI+PC9wYXRoPjxwYXRoIGQ9XCJNMzQ4LjM2OSA0NDcuNDA0YTgwLjQ2OCA4MC40NjggMCAwIDEgNTUuNTIzIDE4LjUwNyA4MC40NjggODAuNDY4IDAgMCAxIDI4LjE2NCA1OS41NDd2ODAuNDY4YTgwLjQ2OCA4MC40NjggMCAwIDEtMTYuMDk0IDUxLjUgODAuNDY4IDgwLjQ2OCAwIDAgMS0xMzEuOTY4LTkuNjU2IDEwNC42MDkgMTA0LjYwOSAwIDAgMS0xMC40Ni01NC43MTl2LTgwLjQ2OGE4MC40NjggODAuNDY4IDAgMCAxIDcwLjAwNy02Ny41OTN6IG00MTYuMDIgMGE4MC40NjggODAuNDY4IDAgMCAxIDg2LjEwMiA3NS42NHY4MC40NjhhOTQuMTQ4IDk0LjE0OCAwIDAgMS0xMi4wNyA1My4xMSA4MC40NjggODAuNDY4IDAgMCAxLTEzMi43NzMgMCA5NS43NTcgOTUuNzU3IDAgMCAxLTEyLjg3NS01Ny4xMzNWNTE5LjAyYTgwLjQ2OCA4MC40NjggMCAwIDEgNzAuMDA3LTcwLjgxMnogbTAgMFwiIGZpbGw9XCIjMjBCMEUzXCIgcC1pZD1cIjQ0NjBcIj48L3BhdGg+PC9zdmc+JyxcclxuICAgICAgfSxcclxuICAgICAgbGluazogXCJodHRwczovL3NwYWNlLmJpbGliaWxpLmNvbS81NDQxMTY1MDBcIixcclxuICAgIH0sXHJcbiAgXSxcclxuICAvLyBpMThuXHU4REVGXHU3NTMxXHJcbiAgaTE4blJvdXRpbmc6IGZhbHNlLFxyXG4gIGFsZ29saWE6IHtcclxuICAgIGFwcElkOiBcIklJODBHNEVMVEFcIiwgLy8gXHU5NzAwXHU4OTgxXHU2NkZGXHU2MzYyXHJcbiAgICBhcGlLZXk6IFwiOTZhZTliNjhmMDlmZDA3Y2JmNThjYmRmMzliOTljYmFcIiwgLy8gXHU5NzAwXHU4OTgxXHU2NkZGXHU2MzYyXHJcbiAgICBpbmRleE5hbWU6IFwiY21vbm9fbmV0XCIsIC8vIFx1OTcwMFx1ODk4MVx1NjZGRlx1NjM2MlxyXG4gICAgcGxhY2Vob2xkZXI6IFwiXHU4QkY3XHU4RjkzXHU1MTY1XHU1MTczXHU5NTJFXHU4QkNEXCIsXHJcbiAgICAvLyBzZWFyY2hQYXJhbWV0ZXJzPzogU2VhcmNoT3B0aW9uc1xyXG4gICAgLy8gZGlzYWJsZVVzZXJQZXJzb25hbGl6YXRpb24/OiBib29sZWFuXHJcbiAgICAvLyBpbml0aWFsUXVlcnk/OiBzdHJpbmdcclxuICAgIGxvY2FsZXM6IHtcclxuICAgICAgemg6IHtcclxuICAgICAgICB0cmFuc2xhdGlvbnM6IHtcclxuICAgICAgICAgIGJ1dHRvbjoge1xyXG4gICAgICAgICAgICBidXR0b25UZXh0OiBcIlx1NjQxQ1x1N0QyMlwiLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIC8vIFx1NjQxQ1x1N0QyMlx1OTE0RFx1N0Y2RVx1RkYwOFx1NEU4Q1x1OTAwOVx1NEUwMFx1RkYwOVxyXG4gICAgLy8gc2VhcmNoOiB7XHJcbiAgICAvLyAgIC8vIFx1NjcyQ1x1NTczMFx1NzlCQlx1N0VCRlx1NjQxQ1x1N0QyMlxyXG4gICAgLy8gICBwcm92aWRlcjogXCJsb2NhbFwiLFxyXG4gICAgLy8gICAvLyBcdTU5MUFcdThCRURcdThBMDBcdTY0MUNcdTdEMjJcdTkxNERcdTdGNkVcclxuICAgIC8vICAgb3B0aW9uczoge1xyXG4gICAgLy8gICAgIGxvY2FsZXM6IHtcclxuICAgIC8vICAgICAgIC8qIFx1OUVEOFx1OEJBNFx1OEJFRFx1OEEwMCAqL1xyXG4gICAgLy8gICAgICAgemg6IHtcclxuICAgIC8vICAgICAgICAgdHJhbnNsYXRpb25zOiB7XHJcbiAgICAvLyAgICAgICAgICAgYnV0dG9uOiB7XHJcbiAgICAvLyAgICAgICAgICAgICBidXR0b25UZXh0OiBcIlx1NjQxQ1x1N0QyMlwiLFxyXG4gICAgLy8gICAgICAgICAgICAgYnV0dG9uQXJpYUxhYmVsOiBcIlx1NjQxQ1x1N0QyMlx1NjU4N1x1Njg2M1wiLFxyXG4gICAgLy8gICAgICAgICAgIH0sXHJcbiAgICAvLyAgICAgICAgICAgbW9kYWw6IHtcclxuICAgIC8vICAgICAgICAgICAgIG5vUmVzdWx0c1RleHQ6IFwiXHU2NUUwXHU2Q0Q1XHU2MjdFXHU1MjMwXHU3NkY4XHU1MTczXHU3RUQzXHU2NzlDXCIsXHJcbiAgICAvLyAgICAgICAgICAgICByZXNldEJ1dHRvblRpdGxlOiBcIlx1NkUwNVx1OTY2NFx1NjdFNVx1OEJFMlx1N0VEM1x1Njc5Q1wiLFxyXG4gICAgLy8gICAgICAgICAgICAgZm9vdGVyOiB7XHJcbiAgICAvLyAgICAgICAgICAgICAgIHNlbGVjdFRleHQ6IFwiXHU5MDA5XHU2MkU5XCIsXHJcbiAgICAvLyAgICAgICAgICAgICAgIG5hdmlnYXRlVGV4dDogXCJcdTUyMDdcdTYzNjJcIixcclxuICAgIC8vICAgICAgICAgICAgIH0sXHJcbiAgICAvLyAgICAgICAgICAgfSxcclxuICAgIC8vICAgICAgICAgfSxcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICBlbjoge1xyXG4gICAgLy8gICAgICAgICB0cmFuc2xhdGlvbnM6IHtcclxuICAgIC8vICAgICAgICAgICBidXR0b246IHtcclxuICAgIC8vICAgICAgICAgICAgIGJ1dHRvblRleHQ6IFwiU2VhcmNoXCIsXHJcbiAgICAvLyAgICAgICAgICAgICBidXR0b25BcmlhTGFiZWw6IFwiU2VhcmNoIGZvciBEb2N1bWVudHNcIixcclxuICAgIC8vICAgICAgICAgICB9LFxyXG4gICAgLy8gICAgICAgICAgIG1vZGFsOiB7XHJcbiAgICAvLyAgICAgICAgICAgICBub1Jlc3VsdHNUZXh0OiBcIlVuYWJsZSB0byBmaW5kIHJlbGV2YW50IHJlc3VsdHNcIixcclxuICAgIC8vICAgICAgICAgICAgIHJlc2V0QnV0dG9uVGl0bGU6IFwiQ2xlYXIgUXVlcnkgUmVzdWx0c1wiLFxyXG4gICAgLy8gICAgICAgICAgICAgZm9vdGVyOiB7XHJcbiAgICAvLyAgICAgICAgICAgICAgIHNlbGVjdFRleHQ6IFwic2VsZWN0XCIsXHJcbiAgICAvLyAgICAgICAgICAgICAgIG5hdmlnYXRlVGV4dDogXCJzd2l0Y2hcIixcclxuICAgIC8vICAgICAgICAgICAgIH0sXHJcbiAgICAvLyAgICAgICAgICAgfSxcclxuICAgIC8vICAgICAgICAgfSxcclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgfSxcclxuICAgIC8vICAgfSxcclxuICB9LFxyXG59O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXEdpdEh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXEdpdEh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcbWFya2Rvd24udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L0dpdEh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvbWFya2Rvd24udHNcIjtpbXBvcnQge1xyXG4gIGNvbnRhaW5lclByZXZpZXcsXHJcbiAgY29tcG9uZW50UHJldmlldyxcclxufSBmcm9tIFwiQHZpdGVwcmVzcy1kZW1vLXByZXZpZXcvcGx1Z2luXCI7XHJcbmltcG9ydCB7IE1hcmtkb3duT3B0aW9ucyB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuaW1wb3J0IG1kSXRDdXN0b21BdHRycyBmcm9tIFwibWFya2Rvd24taXQtY3VzdG9tLWF0dHJzXCI7XHJcbmltcG9ydCB0aW1lbGluZSBmcm9tIFwidml0ZXByZXNzLW1hcmtkb3duLXRpbWVsaW5lXCI7XHJcbmltcG9ydCBjb250YWluZXIgZnJvbSAnbWFya2Rvd24taXQtY29udGFpbmVyJztcclxuaW1wb3J0IHsgcmVuZGVyU2FuZGJveCB9IGZyb20gJ3ZpdGVwcmVzcy1wbHVnaW4tc2FuZHBhY2snXHJcblxyXG5cclxuY29uc3QgbWFya2Rvd246IE1hcmtkb3duT3B0aW9ucyB8IHVuZGVmaW5lZCA9IHtcclxuICBsaW5lTnVtYmVyczogdHJ1ZSxcclxuICB0aGVtZTogeyBsaWdodDogJ2dpdGh1Yi1saWdodCcsIGRhcms6ICdnaXRodWItZGFyaycgfSxcclxuICBjb25maWc6IChtZCkgPT4ge1xyXG4gICAgbWQudXNlKGNvbnRhaW5lclByZXZpZXcpO1xyXG4gICAgbWQudXNlKGNvbXBvbmVudFByZXZpZXcpO1xyXG4gICAgLy8gdXNlIG1vcmUgbWFya2Rvd24taXQgcGx1Z2lucyFcclxuICAgIG1kLnVzZShtZEl0Q3VzdG9tQXR0cnMsIFwiaW1hZ2VcIiwge1xyXG4gICAgICBcImRhdGEtZmFuY3lib3hcIjogXCJnYWxsZXJ5XCIsXHJcbiAgICB9KTtcclxuICAgIG1kLnVzZSh0aW1lbGluZSk7XHJcbiAgICBtZFxyXG4gICAgICAvLyB0aGUgc2Vjb25kIHBhcmFtZXRlciBpcyBodG1sIHRhZyBuYW1lXHJcbiAgICAgIC51c2UoY29udGFpbmVyLCAnc2FuZGJveCcsIHtcclxuICAgICAgICByZW5kZXIgKHRva2VucywgaWR4KSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVuZGVyU2FuZGJveCh0b2tlbnMsIGlkeCwgJ3NhbmRib3gnKTtcclxuICAgICAgICB9LFxyXG4gICAgICB9KTtcclxuICB9LFxyXG59XHJcblxyXG5leHBvcnQge1xyXG4gIG1hcmtkb3duXHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxHaXRIdWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxHaXRIdWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXGRlZmF1bHRzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9HaXRIdWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL2RlZmF1bHRzLnRzXCI7aW1wb3J0IHsgRGVmYXVsdFRoZW1lLCBVc2VyQ29uZmlnIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG5pbXBvcnQgeyBtYXJrZG93biB9IGZyb20gXCIuL21hcmtkb3duXCI7XHJcblxyXG5jb25zdCBkZWZhdWx0Q29uZmlnOiBVc2VyQ29uZmlnPERlZmF1bHRUaGVtZS5Db25maWc+ID0ge1xyXG4gIHRpdGxlOiBcIkNNT05PLk5FVFwiLFxyXG4gIGRlc2NyaXB0aW9uOiBcIlx1NEUyQVx1NEVCQVx1NTcyOFx1N0VCRlwiLFxyXG4gIGFwcGVhcmFuY2U6IGZhbHNlLFxyXG4gIGhlYWQ6IFtcclxuICAgIFtcImxpbmtcIiwgeyByZWw6IFwiaWNvblwiLCB0eXBlOiBcImltYWdlL3N2Zyt4bWxcIiwgaHJlZjogXCIvZmF2aWNvbi5zdmdcIiB9XSxcclxuICAgIFtcImxpbmtcIiwgeyByZWw6IFwiaWNvblwiLCB0eXBlOiBcImltYWdlL3gtaWNvblwiLCBocmVmOiBcIi9mYXZpY29uLmljb1wiIH1dLFxyXG4gICAgW1xyXG4gICAgICBcImxpbmtcIixcclxuICAgICAge1xyXG4gICAgICAgIHJlbDogXCJzdHlsZXNoZWV0XCIsXHJcbiAgICAgICAgaHJlZjogXCIvZmFuY3lib3guY3NzXCIsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgW1xyXG4gICAgICBcInNjcmlwdFwiLFxyXG4gICAgICB7XHJcbiAgICAgICAgc3JjOiBcIi9mYW5jeWJveC51bWQuanNcIixcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICAvLyBcdThCQkVcdTdGNkUgXHU2M0NGXHU4RkYwIFx1NTQ4QyBcdTUxNzNcdTk1MkVcdThCQ0RcclxuICAgIFtcclxuICAgICAgXCJtZXRhXCIsXHJcbiAgICAgIHsgbmFtZTogXCJrZXl3b3Jkc1wiLCBjb250ZW50OiBcInJlYWN0IHJlYWN0LWFkbWluIGFudCBcdTU0MEVcdTUzRjBcdTdCQTFcdTc0MDZcdTdDRkJcdTdFREZcIiB9LFxyXG4gICAgXSxcclxuICAgIFtcclxuICAgICAgXCJtZXRhXCIsXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiBcImRlc2NyaXB0aW9uXCIsXHJcbiAgICAgICAgY29udGVudDpcclxuICAgICAgICAgIFwiXHU2QjY0XHU2ODQ2XHU2N0I2XHU0RjdGXHU3NTI4XHU0RTBFXHU0RThDXHU2QjIxXHU1RjAwXHU1M0QxXHVGRjBDXHU1MjREXHU3QUVGXHU2ODQ2XHU2N0I2XHU0RjdGXHU3NTI4cmVhY3RcdUZGMENVSVx1Njg0Nlx1NjdCNlx1NEY3Rlx1NzUyOGFudC1kZXNpZ25cdUZGMENcdTUxNjhcdTVDNDBcdTY1NzBcdTYzNkVcdTcyQjZcdTYwMDFcdTdCQTFcdTc0MDZcdTRGN0ZcdTc1MjhyZWR1eFx1RkYwQ2FqYXhcdTRGN0ZcdTc1MjhcdTVFOTNcdTRFM0FheGlvc1x1MzAwMlx1NzUyOFx1NEU4RVx1NUZFQlx1OTAxRlx1NjQyRFx1NUVGQVx1NEUyRFx1NTQwRVx1NTNGMFx1OTg3NVx1OTc2Mlx1MzAwMlwiLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICBdLFxyXG4gIG1hcmtkb3duLFxyXG4gIGlnbm9yZURlYWRMaW5rczogW1xyXG4gICAgLy8gaWdub3JlIGV4YWN0IHVybCBcIi9wbGF5Z3JvdW5kXCJcclxuICAgIFwiL3BsYXlncm91bmRcIixcclxuICAgIC8vIGlnbm9yZSBhbGwgbG9jYWxob3N0IGxpbmtzXHJcbiAgICAvXmh0dHBzPzpcXC9cXC9sb2NhbGhvc3QvLFxyXG4gICAgLy8gaWdub3JlIGFsbCBsaW5rcyBpbmNsdWRlIFwiL3JlcGwvXCJcIlxyXG4gICAgL1xcL3JlcGxcXC8vLFxyXG4gICAgLy8gY3VzdG9tIGZ1bmN0aW9uLCBpZ25vcmUgYWxsIGxpbmtzIGluY2x1ZGUgXCJpZ25vcmVcIlxyXG4gICAgKHVybCkgPT4ge1xyXG4gICAgICByZXR1cm4gdXJsLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoXCJpZ25vcmVcIik7XHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgeyBkZWZhdWx0Q29uZmlnIH07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0SHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcR2l0SHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxoZWFkLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9HaXRIdWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL2hlYWQudHNcIjtpbXBvcnQgdHlwZSB7IEhlYWRDb25maWcgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgaGVhZDogSGVhZENvbmZpZ1tdID0gW1xyXG4gIFtcImxpbmtcIiwgeyByZWw6IFwiaWNvblwiLCB0eXBlOiBcImltYWdlL3N2Zyt4bWxcIiwgaHJlZjogXCIvZmF2aWNvbi5zdmdcIiB9XSxcclxuICBbXCJsaW5rXCIsIHsgcmVsOiBcImljb25cIiwgdHlwZTogXCJpbWFnZS94LWljb25cIiwgaHJlZjogXCIvZmF2aWNvbi5pY29cIiB9XSxcclxuICAvLyBbXHJcbiAgLy8gICBcImxpbmtcIixcclxuICAvLyAgIHtcclxuICAvLyAgICAgcmVsOiBcInN0eWxlc2hlZXRcIixcclxuICAvLyAgICAgaHJlZjogXCIvZmFuY3lib3guY3NzXCIsXHJcbiAgLy8gICB9LFxyXG4gIC8vIF0sXHJcbiAgLy8gW1xyXG4gIC8vICAgXCJzY3JpcHRcIixcclxuICAvLyAgIHtcclxuICAvLyAgICAgc3JjOiBcIi9mYW5jeWJveC51bWQuanNcIixcclxuICAvLyAgIH0sXHJcbiAgLy8gXSxcclxuICBbXHJcbiAgICBcInNjcmlwdFwiLFxyXG4gICAge1xyXG4gICAgICBzcmM6IFwiL2N1cnNvci5qc1wiLFxyXG4gICAgICBcImRhdGEtc2l0ZVwiOiBcImh0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvXCIsXHJcbiAgICAgIFwiZGF0YS1zcGFcIjogXCJhdXRvXCIsXHJcbiAgICAgIGRlZmVyOiBcIlwiLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIC8vIFx1OEJCRVx1N0Y2RSBcdTYzQ0ZcdThGRjAgXHU1NDhDIFx1NTE3M1x1OTUyRVx1OEJDRFxyXG4gIFtcclxuICAgIFwibWV0YVwiLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiBcImtleXdvcmRzXCIsXHJcbiAgICAgIGNvbnRlbnQ6XHJcbiAgICAgICAgXCJjaGFuZ3dlaWh1YSBcdTVFMzhcdTRGMUZcdTUzNEUgdml0ZXByZXNzIGNtb25vLm5ldCBjaGFuZ3dlaWh1YS5naXRodWIuaW8gXHU0RTJBXHU0RUJBXHU3RjUxXHU3QUQ5XCIsXHJcbiAgICB9LFxyXG4gIF0sXHJcbiAgW1xyXG4gICAgXCJtZXRhXCIsXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6IFwiZGVzY3JpcHRpb25cIixcclxuICAgICAgY29udGVudDpcclxuICAgICAgICBcIlx1NkI2NFx1N0NGQlx1N0VERlx1NTdGQVx1NEU4RXZpdGVwcmVzc1x1NEU4Q1x1NkIyMVx1NUYwMFx1NTNEMVx1RkYwQ1x1NTI0RFx1N0FFRlx1Njg0Nlx1NjdCNlx1NEY3Rlx1NzUyOHZ1ZWpzXHVGRjBDVUlcdTY4NDZcdTY3QjZcdTRGN0ZcdTc1MjhhbnQtZGVzaWduXHVGRjBDXHU1MTY4XHU1QzQwXHU2NTcwXHU2MzZFXHU3MkI2XHU2MDAxXHU3QkExXHU3NDA2XHU0RjdGXHU3NTI4cGFpbmFcdUZGMENhamF4XHU0RjdGXHU3NTI4XHU1RTkzXHU0RTNBZmV0Y2hcdTMwMDJcdTc1MjhcdTRFOEVcdTVGRUJcdTkwMUZcdTY0MkRcdTVFRkFcdTRFMkFcdTRFQkFcdTdGNTFcdTdBRDlcdTU0OENcdTUxODVcdTVCQjlcdTdCQTFcdTc0MDZcdTVFNzNcdTUzRjBcdTMwMDJcIixcclxuICAgIH0sXHJcbiAgXSxcclxuXTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxHaXRIdWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXG5hdnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXEdpdEh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcbmF2c1xcXFxlbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovR2l0SHViL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby8udml0ZXByZXNzL3NyYy9uYXZzL2VuLnRzXCI7aW1wb3J0IHsgRGVmYXVsdFRoZW1lIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG4vLyBhY3RpdmVNYXRjaDogXCJeL2d1aWRlL1wiLFxyXG5jb25zdCBuYXY6IERlZmF1bHRUaGVtZS5OYXZJdGVtW10gfCB1bmRlZmluZWQgPSBbXHJcbiAgeyB0ZXh0OiBcIkhvbWVcIiwgbGluazogXCIvZW4vXCIsIGFjdGl2ZU1hdGNoOiBcIl4vZW4vJHxeL2VuL2luZGV4LyRcIiB9LFxyXG4gIHtcclxuICAgIHRleHQ6IFwiQXJ0aWNsZXNcIixcclxuICAgIGxpbms6IFwiL2VuL2Jsb2cvXCIsXHJcbiAgICBhY3RpdmVNYXRjaDogXCJeL2VuL2Jsb2cvXCIsXHJcbiAgfSxcclxuICB7XHJcbiAgICB0ZXh0OiBcIkNvdXJzZXNcIixcclxuICAgIGxpbms6IFwiL2VuL2NvdXJzZS9cIixcclxuICAgIGFjdGl2ZU1hdGNoOiBcIl4vZW4vY291cnNlL1wiLFxyXG4gIH0sXHJcbiAge1xyXG4gICAgdGV4dDogXCJBYm91dFwiLFxyXG4gICAgbGluazogXCIvZW4vYWJvdXQvaW5kZXgubWRcIixcclxuICAgIGFjdGl2ZU1hdGNoOiBcIl4vZW4vYWJvdXQvXCIsXHJcbiAgfSxcclxuICB7XHJcbiAgICB0ZXh0OiBcIkNhdGVnb3JpZXNcIixcclxuICAgIGl0ZW1zOiBbXHJcbiAgICAgIHtcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgeyB0ZXh0OiBcIlRocmVlM0RcIiwgbGluazogXCIvZW4vY2F0ZWdvcnkvdGhyZWUzZC5tZFwiIH0sXHJcbiAgICAgICAgICB7IHRleHQ6IFwiVG9vbHNcIiwgbGluazogXCIvZW4vY2F0ZWdvcnkvdG9vbC5tZFwiIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7IHRleHQ6IFwiRmx1dHRlclwiLCBsaW5rOiBcIi9lbi9jYXRlZ29yeS9mbHV0dGVyLm1kXCIgfSxcclxuICAgICAgICAgIHsgdGV4dDogXCJNaW5pUHJvZ3JhbVwiLCBsaW5rOiBcIi9lbi9jYXRlZ29yeS93ZWNoYXQubWRcIiB9LFxyXG4gICAgICAgICAgeyB0ZXh0OiBcIkRvdE5FVFwiLCBsaW5rOiBcIi9lbi9jYXRlZ29yeS9kb3RuZXQubWRcIiB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgeyB0ZXh0OiBcIlZ1ZUpTXCIsIGxpbms6IFwiL2VuL2NhdGVnb3J5L3Z1ZS5tZFwiIH0sXHJcbiAgICAgICAgICB7IHRleHQ6IFwiVHlwZVNjcmlwdFwiLCBsaW5rOiBcIi9lbi9jYXRlZ29yeS90eXBlc2NyaXB0Lm1kXCIgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICB9LFxyXG5dO1xyXG5cclxuZXhwb3J0IHsgbmF2IH07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBuYXY7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0SHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxzaWRlYmFyc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcR2l0SHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxzaWRlYmFyc1xcXFxlbi50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovR2l0SHViL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby8udml0ZXByZXNzL3NyYy9zaWRlYmFycy9lbi50c1wiO2ltcG9ydCB7IERlZmF1bHRUaGVtZSB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuXHJcbi8vIGNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpO1xyXG4vLyBjb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XHJcblxyXG4vLyBmdW5jdGlvbiBnZW5lcmF0ZVNpZGViYXJDb25maWcoZG9jc1BhdGgsIGxpbmsgPSBcIlwiLCBpbmRleCA9IDApIHtcclxuLy8gICBjb25zdCBzaWRlYmFyQ29uZmlnOiBEZWZhdWx0VGhlbWUuU2lkZWJhciA9IHt9O1xyXG4vLyAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZG9jc1BhdGgpO1xyXG5cclxuLy8gICBmaWxlcy5mb3JFYWNoKChmaWxlbmFtZSkgPT4ge1xyXG4vLyAgICAgaWYgKGZpbGVuYW1lLnN0YXJ0c1dpdGgoXCIuXCIpKSByZXR1cm47XHJcbi8vICAgICBjb25zdCBmaWxlcGF0aCA9IHBhdGguam9pbihkb2NzUGF0aCwgZmlsZW5hbWUpO1xyXG4vLyAgICAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbGVwYXRoKTtcclxuLy8gICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjYyRlx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwQ1x1NTIxOVx1OTAxMlx1NUY1Mlx1NzUxRlx1NjIxMFx1NUI1MFx1N0VBNyBzaWRlYmFyIFx1OTE0RFx1N0Y2RVxyXG4vLyAgICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xyXG4vLyAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuLy8gICAgICAgICBjb25zdCBjb25maWcgPSBnZW5lcmF0ZVNpZGViYXJDb25maWcoXHJcbi8vICAgICAgICAgICBmaWxlcGF0aCxcclxuLy8gICAgICAgICAgIGAvJHtmaWxlbmFtZX0vYCxcclxuLy8gICAgICAgICAgIGluZGV4ICsgMVxyXG4vLyAgICAgICAgICk7XHJcbi8vICAgICAgICAgaWYgKCFzaWRlYmFyQ29uZmlnW2AvJHtmaWxlbmFtZX0vYF0pIHtcclxuLy8gICAgICAgICAgIHNpZGViYXJDb25maWdbYC8ke2ZpbGVuYW1lfS9gXSA9IFtjb25maWddO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgICAgfSBlbHNlIHtcclxuLy8gICAgICAgICBpZiAoIXNpZGViYXJDb25maWcuaXRlbXMpIHtcclxuLy8gICAgICAgICAgIHNpZGViYXJDb25maWcuaXRlbXMgPSBbXTtcclxuLy8gICAgICAgICB9XHJcbi8vICAgICAgICAgc2lkZWJhckNvbmZpZy5pdGVtcy5wdXNoKFxyXG4vLyAgICAgICAgICAgZ2VuZXJhdGVTaWRlYmFyQ29uZmlnKGZpbGVwYXRoLCBgJHtsaW5rfSR7ZmlsZW5hbWV9L2AsIGluZGV4ICsgMSlcclxuLy8gICAgICAgICApO1xyXG4vLyAgICAgICB9XHJcbi8vICAgICB9IGVsc2Uge1xyXG4vLyAgICAgICBjb25zdCBleHRuYW1lID0gcGF0aC5leHRuYW1lKGZpbGVwYXRoKTtcclxuLy8gICAgICAgY29uc3QgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVwYXRoLCBleHRuYW1lKTtcclxuLy8gICAgICAgaWYgKGZpbGVuYW1lID09PSBcImluZGV4Lm1kXCIgJiYgaW5kZXggPiAwKSB7XHJcbi8vICAgICAgICAgY29uc3QgbWVudVBhdGggPSBwYXRoLmRpcm5hbWUoZmlsZXBhdGgpO1xyXG4vLyAgICAgICAgIGNvbnN0IG1lbnVOYW1lID0gcGF0aC5iYXNlbmFtZShtZW51UGF0aCk7XHJcbi8vICAgICAgICAgc2lkZWJhckNvbmZpZy50ZXh0ID0gbWVudU5hbWU7XHJcbi8vICAgICAgICAgc2lkZWJhckNvbmZpZy5saW5rID0gW3tcclxuLy8gICAgICAgICAgIGxpbms6IGxpbmtcclxuLy8gICAgICAgICB9XTtcclxuLy8gICAgICAgfVxyXG4vLyAgICAgICBpZiAoZXh0bmFtZSA9PT0gXCIubWRcIiAmJiBmaWxlbmFtZSAhPT0gXCJpbmRleC5tZFwiKSB7XHJcbi8vICAgICAgICAgaWYgKCFzaWRlYmFyQ29uZmlnLml0ZW1zKSB7XHJcbi8vICAgICAgICAgICBzaWRlYmFyQ29uZmlnLml0ZW1zID0gW107XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgICAgIHNpZGViYXJDb25maWcuaXRlbXMucHVzaCh7XHJcbi8vICAgICAgICAgICB0ZXh0OiBiYXNlbmFtZSxcclxuLy8gICAgICAgICAgIGxpbms6IGAke2xpbmt9JHtiYXNlbmFtZX1gLFxyXG4vLyAgICAgICAgIH0pO1xyXG4vLyAgICAgICB9XHJcbi8vICAgICB9XHJcbi8vICAgfSk7XHJcblxyXG4vLyAgIHJldHVybiBzaWRlYmFyQ29uZmlnO1xyXG4vLyB9XHJcblxyXG4vLyBjb25zdCBkb2NzUGF0aCA9IHBhdGguZGlybmFtZShfX2Rpcm5hbWUpOyAvLyBkb2NzIFx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxyXG4vLyBjb25zdCBkeW5hbWljU2lkZWJhckNvbmZpZyA9IGdlbmVyYXRlU2lkZWJhckNvbmZpZyhkb2NzUGF0aCk7XHJcbi8vIGNvbnNvbGUubG9nKGRvY3NQYXRoKTtcclxuXHJcbmNvbnN0IHNpZGViYXI6IERlZmF1bHRUaGVtZS5TaWRlYmFyIHwgdW5kZWZpbmVkID0ge1xyXG4gIGFydGljbGVzOiBbXHJcbiAgICB7XHJcbiAgICAgIHRleHQ6IFwiRXhhbXBsZXNcIixcclxuICAgICAgaXRlbXM6IFtcclxuICAgICAgICB7IHRleHQ6IFwiTWFya2Rvd24gRXhhbXBsZXNcIiwgbGluazogXCIvbWFya2Rvd24tZXhhbXBsZXNcIiB9LFxyXG4gICAgICAgIHsgdGV4dDogXCJSdW50aW1lIEFQSSBFeGFtcGxlc1wiLCBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIiB9LFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIC8vIGdhbGxlcnk6IFtcclxuICAvLyAgIHtcclxuICAvLyAgICAgdGV4dDogXCJcdTk4NzlcdTc2RUVcdTY4NDhcdTRGOEJcIixcclxuICAvLyAgICAgaXRlbXM6IFtcclxuICAvLyAgICAgICB7IHRleHQ6IFwiXHU4MkNGXHU1MzU3XHU3ODU1XHU2NTNFXHU1NkZEXHU5NjQ1XHU2NzNBXHU1NzNBXHU5NjMzXHU1MTQ5XHU2NzBEXHU1MkExXHU1RTczXHU1M0YwXCIsIGxpbms6IFwiL2dhbGxlcnkvc3VubnktbGFuZFwiIH0sXHJcbiAgLy8gICAgICAgeyB0ZXh0OiBcIlx1NjI2Q1x1NkNGMFx1NjczQVx1NTczQVx1NjY3QVx1NjE2N1x1NTFGQVx1ODg0Q1x1NUZBRVx1NEZFMVx1NUMwRlx1N0EwQlx1NUU4RlwiLCBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIiB9LFxyXG4gIC8vICAgICAgIHtcclxuICAvLyAgICAgICAgIHRleHQ6IFwiXHU0RTBBXHU2RDc3XHU2QzExXHU4MjJBXHU1MzRFXHU0RTFDXHU1MUVGXHU0RTlBXHU2QzVGXHU4MkNGXHU1MjA2XHU1MTZDXHU1M0Y4XHU3NUFCXHU2MEM1XHU5NjMyXHU2M0E3XHU1RTczXHU1M0YwXCIsXHJcbiAgLy8gICAgICAgICBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIixcclxuICAvLyAgICAgICB9LFxyXG4gIC8vICAgICAgIHsgdGV4dDogXCJcdTgyQ0ZcdTUzNTdcdTc4NTVcdTY1M0VcdTU2RkRcdTk2NDVcdTY3M0FcdTU3M0FcdTVCODlcdTY4QzBcdTY1NDhcdTgwRkRcdTUyMDZcdTY3OTBcdTdDRkJcdTdFREZcIiwgbGluazogXCIvYXBpLWV4YW1wbGVzXCIgfSxcclxuICAvLyAgICAgICB7XHJcbiAgLy8gICAgICAgICB0ZXh0OiBcIlx1ODJDRlx1NTM1N1x1Nzg1NVx1NjUzRVx1NTZGRFx1OTY0NVx1NjczQVx1NTczQVx1OEZEQlx1NTFGQVx1NkUyRi9cdTY1RTBcdTdFQjhcdTUzMTZcdTdDRkJcdTdFREZcIixcclxuICAvLyAgICAgICAgIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgICAgeyB0ZXh0OiBcIlx1NjI2Q1x1NkNGMFx1NjczQVx1NTczQVx1NUJBMlx1NkU5MFx1NTczMFx1NTIwNlx1Njc5MFx1N0NGQlx1N0VERlwiLCBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIiB9LFxyXG4gIC8vICAgICBdLFxyXG4gIC8vICAgfSxcclxuICAvLyBdLFxyXG4gIC8vIGJsb2c6IFtcclxuICAvLyAgIHtcclxuICAvLyAgICAgdGV4dDogXCIyMDIzLTA2XCIsXHJcbiAgLy8gICAgIGl0ZW1zOiBbXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJQLVRvdWNoIFA5MDAgXHU2MjUzXHU1MzcwXHU2NzNBXHU0RjdGXHU3NTI4XCIsXHJcbiAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjMtMDYvUC1Ub3VjaCBQOTAwIFx1NjI1M1x1NTM3MFx1NjczQVx1NEY3Rlx1NzUyOFwiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgICAgeyB0ZXh0OiBcIlZpdGVzdCBcdTRGN0ZcdTc1MjhcIiwgbGluazogXCIvYmxvZy8yMDIzLTA2LzE1XCIgfSxcclxuICAvLyAgICAgXSxcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHRleHQ6IFwiMjAyMy0wNVwiLFxyXG4gIC8vICAgICBpdGVtczogW1xyXG4gIC8vICAgICAgIHsgdGV4dDogXCJcdTY0MkRcdTVFRkEgR2l0aHViIFx1NEUyQVx1NEVCQVx1NEUzQlx1OTg3NVwiLCBsaW5rOiBcIi9ibG9nLzIwMjMtMDUvMTVcIiB9LFxyXG4gIC8vICAgICAgIHtcclxuICAvLyAgICAgICAgIHRleHQ6IFwiXHU0RjdGXHU3NTI4IFNraWFTaGFycCBcdTVCOUVcdTczQjBcdTU2RkVcdTcyNDdcdTZDMzRcdTUzNzBcIixcclxuICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMy0wNS9za2lhc2hhcF93YXRlcm1hcmsubWRcIixcclxuICAvLyAgICAgICB9LFxyXG4gIC8vICAgICBdLFxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdGV4dDogXCIyMDIyXCIsXHJcbiAgLy8gICAgIGl0ZW1zOiBbXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJcdTRFQ0UgRG9ja2VyIFx1NUI4OVx1ODhDNSBHaXRlYVwiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NEVDRSBEb2NrZXIgXHU1Qjg5XHU4OEM1IEdpdGVhLm1kXCIsXHJcbiAgLy8gICAgICAgfSxcclxuICAvLyAgICAgICB7XHJcbiAgLy8gICAgICAgICB0ZXh0OiBcIlx1NjU0Rlx1NjM3N1x1NUYwMFx1NTNEMVx1NUI2Nlx1NEU2MFx1N0IxNFx1OEJCMFwiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NjU0Rlx1NjM3N1x1NUYwMFx1NTNEMVx1NUI2Nlx1NEU2MFx1N0IxNFx1OEJCMC5tZFwiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJcdTc5QzFcdTY3MDludWdldFx1NjcwRFx1NTJBMVx1NTY2OFx1OTBFOFx1N0Y3MlwiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NzlDMVx1NjcwOW51Z2V0XHU2NzBEXHU1MkExXHU1NjY4XHU5MEU4XHU3RjcyLm1kXCIsXHJcbiAgLy8gICAgICAgfSxcclxuXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJcdTRFM0Fkb2NrZXJcdTkxNERcdTdGNkVIVFRQXHU0RUUzXHU3NDA2XHU2NzBEXHU1MkExXHU1NjY4XCIsXHJcbiAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU0RTNBZG9ja2VyXHU5MTREXHU3RjZFSFRUUFx1NEVFM1x1NzQwNlx1NjcwRFx1NTJBMVx1NTY2OC5tZFwiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJcdTc5QzFcdTY3MDludWdldFx1NjcwRFx1NTJBMVx1NTY2OFx1OTBFOFx1N0Y3MlwiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NzlDMVx1NjcwOW51Z2V0XHU2NzBEXHU1MkExXHU1NjY4XHU5MEU4XHU3RjcyLm1kXCIsXHJcbiAgLy8gICAgICAgfSxcclxuICAvLyAgICAgICB7XHJcbiAgLy8gICAgICAgICB0ZXh0OiBcIlx1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNlwiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNi5tZFwiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJcdTZCNjNcdTU0MTFcdTRFRTNcdTc0MDZcdTU0OENcdTUzQ0RcdTU0MTFcdTRFRTNcdTc0MDZcdThCRTZcdTg5RTNcIixcclxuICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMi9cdTZCNjNcdTU0MTFcdTRFRTNcdTc0MDZcdTU0OENcdTUzQ0RcdTU0MTFcdTRFRTNcdTc0MDZcdThCRTZcdTg5RTMubWRcIixcclxuICAvLyAgICAgICB9LFxyXG4gIC8vICAgICBdLFxyXG4gIC8vICAgfSxcclxuICAvLyBdLFxyXG59O1xyXG5cclxuZXhwb3J0IHtcclxuICBzaWRlYmFyXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHNpZGViYXI7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0SHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxHaXRIdWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXGNvbmZpZ3NcXFxcZW4udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L0dpdEh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvY29uZmlncy9lbi50c1wiO2ltcG9ydCB0eXBlIHsgRGVmYXVsdFRoZW1lLCBMb2NhbGVTcGVjaWZpY0NvbmZpZyB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuXHJcbi8vXHU1RjE1XHU1MTY1XHU0RUU1XHU0RTBBXHU5MTREXHU3RjZFIFx1NjYyRlx1ODJGMVx1NjU4N1x1NzU0Q1x1OTc2Mlx1OTcwMFx1ODk4MVx1NEZFRVx1NjUzOXpoXHU0RTNBZW5cclxuaW1wb3J0IHsgbmF2IH0gZnJvbSBcIi4uL25hdnMvZW5cIjtcclxuaW1wb3J0IHsgc2lkZWJhciB9IGZyb20gXCIuLi9zaWRlYmFycy9lblwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IGVuQ29uZmlnOiBMb2NhbGVTcGVjaWZpY0NvbmZpZzxEZWZhdWx0VGhlbWUuQ29uZmlnPiA9IHtcclxuICB0aGVtZUNvbmZpZzoge1xyXG4gICAgbG9nbzogXCIvbG9nby5wbmdcIixcclxuICAgIGxhc3RVcGRhdGVkVGV4dDogXCJMYXN0IFVwZGF0ZWRcIixcclxuICAgIHJldHVyblRvVG9wTGFiZWw6IFwiVE9QXCIsXHJcbiAgICAvLyBcdTY1ODdcdTY4NjNcdTk4NzVcdTgxMUFcdTY1ODdcdTY3MkNcdTkxNERcdTdGNkVcclxuICAgIGRvY0Zvb3Rlcjoge1xyXG4gICAgICBwcmV2OiBcIlByZXZcIixcclxuICAgICAgbmV4dDogXCJOZXh0XCIsXHJcbiAgICB9LFxyXG4gICAgZm9vdGVyOiB7XHJcbiAgICAgIG1lc3NhZ2U6IFwiTUlUIExpY2Vuc2VkXCIsXHJcbiAgICAgIGNvcHlyaWdodDogXCJDb3B5cmlnaHQgXHUwMEE5IDIwMDktMjAyMyBDTU9OTy5ORVRcIixcclxuICAgIH0sXHJcbiAgICAvLyAgIGVkaXRMaW5rOiB7XHJcbiAgICAvLyAgICAgcGF0dGVybjogJ1x1OERFRlx1NUY4NFx1NTczMFx1NTc0MCcsXHJcbiAgICAvLyAgICAgdGV4dDogJ1x1NUJGOVx1NjcyQ1x1OTg3NVx1NjNEMFx1NTFGQVx1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRScsXHJcbiAgICAvLyAgIH0sXHJcbiAgICBuYXY6IG5hdixcclxuICAgIHNpZGViYXIsXHJcbiAgICBvdXRsaW5lOiB7XHJcbiAgICAgIGxldmVsOiBcImRlZXBcIiwgLy8gXHU1M0YzXHU0RkE3XHU1OTI3XHU3RUIyXHU2ODA3XHU5ODk4XHU1QzQyXHU3RUE3XHJcbiAgICAgIGxhYmVsOiBcIlx1NzZFRVx1NUY1NVwiLCAvLyBcdTUzRjNcdTRGQTdcdTU5MjdcdTdFQjJcdTY4MDdcdTk4OThcdTY1ODdcdTY3MkNcdTkxNERcdTdGNkVcclxuICAgIH0sXHJcbiAgfSxcclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxHaXRIdWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXG5hdnNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXEdpdEh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcbmF2c1xcXFx6aC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovR2l0SHViL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby8udml0ZXByZXNzL3NyYy9uYXZzL3poLnRzXCI7aW1wb3J0IHsgRGVmYXVsdFRoZW1lIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG4vLyBhY3RpdmVNYXRjaDogXCJeL2d1aWRlL1wiLFxyXG5jb25zdCBuYXY6IERlZmF1bHRUaGVtZS5OYXZJdGVtW10gfCB1bmRlZmluZWQgPSBbXHJcbiAgeyB0ZXh0OiBcIlx1OTk5Nlx1OTg3NVwiLCBsaW5rOiBcIi9cIiwgYWN0aXZlTWF0Y2g6IFwiXi8kfF4vaW5kZXgvXCIgfSxcclxuICB7XHJcbiAgICB0ZXh0OiBcIlx1NTM1QVx1NUJBMlwiLFxyXG4gICAgbGluazogXCIvYmxvZy9cIixcclxuICAgIGFjdGl2ZU1hdGNoOiBcIl4vYmxvZy9cIixcclxuICB9LFxyXG4gIHtcclxuICAgIHRleHQ6IFwiXHU4QkZFXHU3QTBCXCIsXHJcbiAgICBsaW5rOiBcIi9jb3Vyc2UvXCIsXHJcbiAgICBhY3RpdmVNYXRjaDogXCJeL2NvdXJzZS9cIixcclxuICB9LFxyXG4gIHtcclxuICAgIHRleHQ6IFwiXHU1MTczXHU0RThFXCIsXHJcbiAgICBsaW5rOiBcIi9hYm91dC9pbmRleC5tZFwiLFxyXG4gICAgYWN0aXZlTWF0Y2g6IFwiXi9hYm91dC9cIixcclxuICB9LFxyXG4gIHtcclxuICAgIHRleHQ6IFwiXHU2NTg3XHU3QUUwXHU1MjA2XHU3QzdCXCIsXHJcbiAgICBpdGVtczogW1xyXG4gICAgICB7XHJcbiAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgIHsgdGV4dDogXCIzRCBcdTVGMDBcdTUzRDFcIiwgbGluazogXCIvY2F0ZWdvcnkvdGhyZWUzZC5tZFwiIH0sXHJcbiAgICAgICAgICB7IHRleHQ6IFwiXHU1REU1XHU1MTc3Jlx1NUU3M1x1NTNGMFwiLCBsaW5rOiBcIi9jYXRlZ29yeS90b29sLm1kXCIgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgIHsgdGV4dDogXCJGbHV0dGVyXCIsIGxpbms6IFwiL2NhdGVnb3J5L2ZsdXR0ZXIubWRcIiB9LFxyXG4gICAgICAgICAgeyB0ZXh0OiBcIlx1NUZBRVx1NEZFMVx1NUMwRlx1N0EwQlx1NUU4RlwiLCBsaW5rOiBcIi9jYXRlZ29yeS93ZWNoYXQubWRcIiB9LFxyXG4gICAgICAgICAgeyB0ZXh0OiBcIkRvdE5FVFwiLCBsaW5rOiBcIi9jYXRlZ29yeS9kb3RuZXQubWRcIiB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgeyB0ZXh0OiBcIlZ1ZUpTXCIsIGxpbms6IFwiL2NhdGVnb3J5L3Z1ZS5tZFwiIH0sXHJcbiAgICAgICAgICB7IHRleHQ6IFwiVHlwZVNjcmlwdFwiLCBsaW5rOiBcIi9jYXRlZ29yeS90eXBlc2NyaXB0Lm1kXCIgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICB9LFxyXG5dO1xyXG5cclxuZXhwb3J0IHsgbmF2IH07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBuYXY7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0SHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxzaWRlYmFyc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcR2l0SHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxzaWRlYmFyc1xcXFx6aC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovR2l0SHViL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby8udml0ZXByZXNzL3NyYy9zaWRlYmFycy96aC50c1wiO2ltcG9ydCB7IERlZmF1bHRUaGVtZSB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuXHJcbi8vIGNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpO1xyXG4vLyBjb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XHJcblxyXG4vLyBmdW5jdGlvbiBnZW5lcmF0ZVNpZGViYXJDb25maWcoZG9jc1BhdGgsIGxpbmsgPSBcIlwiLCBpbmRleCA9IDApIHtcclxuLy8gICBjb25zdCBzaWRlYmFyQ29uZmlnOiBEZWZhdWx0VGhlbWUuU2lkZWJhciA9IHt9O1xyXG4vLyAgIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZG9jc1BhdGgpO1xyXG5cclxuLy8gICBmaWxlcy5mb3JFYWNoKChmaWxlbmFtZSkgPT4ge1xyXG4vLyAgICAgaWYgKGZpbGVuYW1lLnN0YXJ0c1dpdGgoXCIuXCIpKSByZXR1cm47XHJcbi8vICAgICBjb25zdCBmaWxlcGF0aCA9IHBhdGguam9pbihkb2NzUGF0aCwgZmlsZW5hbWUpO1xyXG4vLyAgICAgY29uc3Qgc3RhdCA9IGZzLnN0YXRTeW5jKGZpbGVwYXRoKTtcclxuLy8gICAgIC8vIFx1NTk4Mlx1Njc5Q1x1NjYyRlx1NjU4N1x1NEVGNlx1NTkzOVx1RkYwQ1x1NTIxOVx1OTAxMlx1NUY1Mlx1NzUxRlx1NjIxMFx1NUI1MFx1N0VBNyBzaWRlYmFyIFx1OTE0RFx1N0Y2RVxyXG4vLyAgICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xyXG4vLyAgICAgICBpZiAoaW5kZXggPT09IDApIHtcclxuLy8gICAgICAgICBjb25zdCBjb25maWcgPSBnZW5lcmF0ZVNpZGViYXJDb25maWcoXHJcbi8vICAgICAgICAgICBmaWxlcGF0aCxcclxuLy8gICAgICAgICAgIGAvJHtmaWxlbmFtZX0vYCxcclxuLy8gICAgICAgICAgIGluZGV4ICsgMVxyXG4vLyAgICAgICAgICk7XHJcbi8vICAgICAgICAgaWYgKCFzaWRlYmFyQ29uZmlnW2AvJHtmaWxlbmFtZX0vYF0pIHtcclxuLy8gICAgICAgICAgIHNpZGViYXJDb25maWdbYC8ke2ZpbGVuYW1lfS9gXSA9IFtjb25maWddO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgICAgfSBlbHNlIHtcclxuLy8gICAgICAgICBpZiAoIXNpZGViYXJDb25maWcuaXRlbXMpIHtcclxuLy8gICAgICAgICAgIHNpZGViYXJDb25maWcuaXRlbXMgPSBbXTtcclxuLy8gICAgICAgICB9XHJcbi8vICAgICAgICAgc2lkZWJhckNvbmZpZy5pdGVtcy5wdXNoKFxyXG4vLyAgICAgICAgICAgZ2VuZXJhdGVTaWRlYmFyQ29uZmlnKGZpbGVwYXRoLCBgJHtsaW5rfSR7ZmlsZW5hbWV9L2AsIGluZGV4ICsgMSlcclxuLy8gICAgICAgICApO1xyXG4vLyAgICAgICB9XHJcbi8vICAgICB9IGVsc2Uge1xyXG4vLyAgICAgICBjb25zdCBleHRuYW1lID0gcGF0aC5leHRuYW1lKGZpbGVwYXRoKTtcclxuLy8gICAgICAgY29uc3QgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVwYXRoLCBleHRuYW1lKTtcclxuLy8gICAgICAgaWYgKGZpbGVuYW1lID09PSBcImluZGV4Lm1kXCIgJiYgaW5kZXggPiAwKSB7XHJcbi8vICAgICAgICAgY29uc3QgbWVudVBhdGggPSBwYXRoLmRpcm5hbWUoZmlsZXBhdGgpO1xyXG4vLyAgICAgICAgIGNvbnN0IG1lbnVOYW1lID0gcGF0aC5iYXNlbmFtZShtZW51UGF0aCk7XHJcbi8vICAgICAgICAgc2lkZWJhckNvbmZpZy50ZXh0ID0gbWVudU5hbWU7XHJcbi8vICAgICAgICAgc2lkZWJhckNvbmZpZy5saW5rID0gW3tcclxuLy8gICAgICAgICAgIGxpbms6IGxpbmtcclxuLy8gICAgICAgICB9XTtcclxuLy8gICAgICAgfVxyXG4vLyAgICAgICBpZiAoZXh0bmFtZSA9PT0gXCIubWRcIiAmJiBmaWxlbmFtZSAhPT0gXCJpbmRleC5tZFwiKSB7XHJcbi8vICAgICAgICAgaWYgKCFzaWRlYmFyQ29uZmlnLml0ZW1zKSB7XHJcbi8vICAgICAgICAgICBzaWRlYmFyQ29uZmlnLml0ZW1zID0gW107XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgICAgIHNpZGViYXJDb25maWcuaXRlbXMucHVzaCh7XHJcbi8vICAgICAgICAgICB0ZXh0OiBiYXNlbmFtZSxcclxuLy8gICAgICAgICAgIGxpbms6IGAke2xpbmt9JHtiYXNlbmFtZX1gLFxyXG4vLyAgICAgICAgIH0pO1xyXG4vLyAgICAgICB9XHJcbi8vICAgICB9XHJcbi8vICAgfSk7XHJcblxyXG4vLyAgIHJldHVybiBzaWRlYmFyQ29uZmlnO1xyXG4vLyB9XHJcblxyXG4vLyBjb25zdCBkb2NzUGF0aCA9IHBhdGguZGlybmFtZShfX2Rpcm5hbWUpOyAvLyBkb2NzIFx1NzZFRVx1NUY1NVx1OERFRlx1NUY4NFxyXG4vLyBjb25zdCBkeW5hbWljU2lkZWJhckNvbmZpZyA9IGdlbmVyYXRlU2lkZWJhckNvbmZpZyhkb2NzUGF0aCk7XHJcbi8vIGNvbnNvbGUubG9nKGRvY3NQYXRoKTtcclxuXHJcbmNvbnN0IHNpZGViYXI6IERlZmF1bHRUaGVtZS5TaWRlYmFyIHwgdW5kZWZpbmVkID0ge1xyXG4gIGFydGljbGVzOiBbXHJcbiAgICB7XHJcbiAgICAgIHRleHQ6IFwiRXhhbXBsZXNcIixcclxuICAgICAgaXRlbXM6IFtcclxuICAgICAgICB7IHRleHQ6IFwiTWFya2Rvd24gRXhhbXBsZXNcIiwgbGluazogXCIvbWFya2Rvd24tZXhhbXBsZXNcIiB9LFxyXG4gICAgICAgIHsgdGV4dDogXCJSdW50aW1lIEFQSSBFeGFtcGxlc1wiLCBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIiB9LFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIC8vIGdhbGxlcnk6IFtcclxuICAvLyAgIHtcclxuICAvLyAgICAgdGV4dDogXCJcdTk4NzlcdTc2RUVcdTY4NDhcdTRGOEJcIixcclxuICAvLyAgICAgaXRlbXM6IFtcclxuICAvLyAgICAgICB7IHRleHQ6IFwiXHU4MkNGXHU1MzU3XHU3ODU1XHU2NTNFXHU1NkZEXHU5NjQ1XHU2NzNBXHU1NzNBXHU5NjMzXHU1MTQ5XHU2NzBEXHU1MkExXHU1RTczXHU1M0YwXCIsIGxpbms6IFwiL2dhbGxlcnkvc3VubnktbGFuZFwiIH0sXHJcbiAgLy8gICAgICAgeyB0ZXh0OiBcIlx1NjI2Q1x1NkNGMFx1NjczQVx1NTczQVx1NjY3QVx1NjE2N1x1NTFGQVx1ODg0Q1x1NUZBRVx1NEZFMVx1NUMwRlx1N0EwQlx1NUU4RlwiLCBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIiB9LFxyXG4gIC8vICAgICAgIHtcclxuICAvLyAgICAgICAgIHRleHQ6IFwiXHU0RTBBXHU2RDc3XHU2QzExXHU4MjJBXHU1MzRFXHU0RTFDXHU1MUVGXHU0RTlBXHU2QzVGXHU4MkNGXHU1MjA2XHU1MTZDXHU1M0Y4XHU3NUFCXHU2MEM1XHU5NjMyXHU2M0E3XHU1RTczXHU1M0YwXCIsXHJcbiAgLy8gICAgICAgICBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIixcclxuICAvLyAgICAgICB9LFxyXG4gIC8vICAgICAgIHsgdGV4dDogXCJcdTgyQ0ZcdTUzNTdcdTc4NTVcdTY1M0VcdTU2RkRcdTk2NDVcdTY3M0FcdTU3M0FcdTVCODlcdTY4QzBcdTY1NDhcdTgwRkRcdTUyMDZcdTY3OTBcdTdDRkJcdTdFREZcIiwgbGluazogXCIvYXBpLWV4YW1wbGVzXCIgfSxcclxuICAvLyAgICAgICB7XHJcbiAgLy8gICAgICAgICB0ZXh0OiBcIlx1ODJDRlx1NTM1N1x1Nzg1NVx1NjUzRVx1NTZGRFx1OTY0NVx1NjczQVx1NTczQVx1OEZEQlx1NTFGQVx1NkUyRi9cdTY1RTBcdTdFQjhcdTUzMTZcdTdDRkJcdTdFREZcIixcclxuICAvLyAgICAgICAgIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgICAgeyB0ZXh0OiBcIlx1NjI2Q1x1NkNGMFx1NjczQVx1NTczQVx1NUJBMlx1NkU5MFx1NTczMFx1NTIwNlx1Njc5MFx1N0NGQlx1N0VERlwiLCBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIiB9LFxyXG4gIC8vICAgICBdLFxyXG4gIC8vICAgfSxcclxuICAvLyBdLFxyXG4gIC8vIGJsb2c6IFtcclxuICAvLyAgIHtcclxuICAvLyAgICAgdGV4dDogXCIyMDIzLTA2XCIsXHJcbiAgLy8gICAgIGl0ZW1zOiBbXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJQLVRvdWNoIFA5MDAgXHU2MjUzXHU1MzcwXHU2NzNBXHU0RjdGXHU3NTI4XCIsXHJcbiAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjMtMDYvUC1Ub3VjaCBQOTAwIFx1NjI1M1x1NTM3MFx1NjczQVx1NEY3Rlx1NzUyOFwiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgICAgeyB0ZXh0OiBcIlZpdGVzdCBcdTRGN0ZcdTc1MjhcIiwgbGluazogXCIvYmxvZy8yMDIzLTA2LzE1XCIgfSxcclxuICAvLyAgICAgXSxcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHRleHQ6IFwiMjAyMy0wNVwiLFxyXG4gIC8vICAgICBpdGVtczogW1xyXG4gIC8vICAgICAgIHsgdGV4dDogXCJcdTY0MkRcdTVFRkEgR2l0aHViIFx1NEUyQVx1NEVCQVx1NEUzQlx1OTg3NVwiLCBsaW5rOiBcIi9ibG9nLzIwMjMtMDUvMTVcIiB9LFxyXG4gIC8vICAgICAgIHtcclxuICAvLyAgICAgICAgIHRleHQ6IFwiXHU0RjdGXHU3NTI4IFNraWFTaGFycCBcdTVCOUVcdTczQjBcdTU2RkVcdTcyNDdcdTZDMzRcdTUzNzBcIixcclxuICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMy0wNS9za2lhc2hhcF93YXRlcm1hcmsubWRcIixcclxuICAvLyAgICAgICB9LFxyXG4gIC8vICAgICBdLFxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdGV4dDogXCIyMDIyXCIsXHJcbiAgLy8gICAgIGl0ZW1zOiBbXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJcdTRFQ0UgRG9ja2VyIFx1NUI4OVx1ODhDNSBHaXRlYVwiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NEVDRSBEb2NrZXIgXHU1Qjg5XHU4OEM1IEdpdGVhLm1kXCIsXHJcbiAgLy8gICAgICAgfSxcclxuICAvLyAgICAgICB7XHJcbiAgLy8gICAgICAgICB0ZXh0OiBcIlx1NjU0Rlx1NjM3N1x1NUYwMFx1NTNEMVx1NUI2Nlx1NEU2MFx1N0IxNFx1OEJCMFwiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NjU0Rlx1NjM3N1x1NUYwMFx1NTNEMVx1NUI2Nlx1NEU2MFx1N0IxNFx1OEJCMC5tZFwiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJcdTc5QzFcdTY3MDludWdldFx1NjcwRFx1NTJBMVx1NTY2OFx1OTBFOFx1N0Y3MlwiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NzlDMVx1NjcwOW51Z2V0XHU2NzBEXHU1MkExXHU1NjY4XHU5MEU4XHU3RjcyLm1kXCIsXHJcbiAgLy8gICAgICAgfSxcclxuXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJcdTRFM0Fkb2NrZXJcdTkxNERcdTdGNkVIVFRQXHU0RUUzXHU3NDA2XHU2NzBEXHU1MkExXHU1NjY4XCIsXHJcbiAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU0RTNBZG9ja2VyXHU5MTREXHU3RjZFSFRUUFx1NEVFM1x1NzQwNlx1NjcwRFx1NTJBMVx1NTY2OC5tZFwiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJcdTc5QzFcdTY3MDludWdldFx1NjcwRFx1NTJBMVx1NTY2OFx1OTBFOFx1N0Y3MlwiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NzlDMVx1NjcwOW51Z2V0XHU2NzBEXHU1MkExXHU1NjY4XHU5MEU4XHU3RjcyLm1kXCIsXHJcbiAgLy8gICAgICAgfSxcclxuICAvLyAgICAgICB7XHJcbiAgLy8gICAgICAgICB0ZXh0OiBcIlx1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNlwiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNi5tZFwiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJcdTZCNjNcdTU0MTFcdTRFRTNcdTc0MDZcdTU0OENcdTUzQ0RcdTU0MTFcdTRFRTNcdTc0MDZcdThCRTZcdTg5RTNcIixcclxuICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMi9cdTZCNjNcdTU0MTFcdTRFRTNcdTc0MDZcdTU0OENcdTUzQ0RcdTU0MTFcdTRFRTNcdTc0MDZcdThCRTZcdTg5RTMubWRcIixcclxuICAvLyAgICAgICB9LFxyXG4gIC8vICAgICBdLFxyXG4gIC8vICAgfSxcclxuICAvLyBdLFxyXG59O1xyXG5cclxuZXhwb3J0IHtcclxuICBzaWRlYmFyXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHNpZGViYXI7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcR2l0SHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxjb25maWdzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxHaXRIdWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXGNvbmZpZ3NcXFxcemgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L0dpdEh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvY29uZmlncy96aC50c1wiO2ltcG9ydCB0eXBlIHsgRGVmYXVsdFRoZW1lLCBMb2NhbGVTcGVjaWZpY0NvbmZpZyB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuXHJcbi8vXHU1RjE1XHU1MTY1XHU0RUU1XHU0RTBBXHU5MTREXHU3RjZFIFx1NjYyRlx1ODJGMVx1NjU4N1x1NzU0Q1x1OTc2Mlx1OTcwMFx1ODk4MVx1NEZFRVx1NjUzOXpoXHU0RTNBZW5cclxuaW1wb3J0IHtuYXZ9IGZyb20gXCIuLi9uYXZzL3poXCI7XHJcbmltcG9ydCB7IHNpZGViYXIgfSBmcm9tIFwiLi4vc2lkZWJhcnMvemhcIjtcclxuXHJcbmV4cG9ydCBjb25zdCB6aENvbmZpZzogTG9jYWxlU3BlY2lmaWNDb25maWc8RGVmYXVsdFRoZW1lLkNvbmZpZz4gPSB7XHJcbiAgdGhlbWVDb25maWc6IHtcclxuICAgIGxvZ286IFwiL2xvZ28ucG5nXCIsXHJcbiAgICBsYXN0VXBkYXRlZFRleHQ6IFwiXHU0RTBBXHU2QjIxXHU2NkY0XHU2NUIwXCIsXHJcbiAgICByZXR1cm5Ub1RvcExhYmVsOiBcIlx1OEZENFx1NTZERVx1OTg3Nlx1OTBFOFwiLFxyXG4gICAgLy8gXHU2NTg3XHU2ODYzXHU5ODc1XHU4MTFBXHU2NTg3XHU2NzJDXHU5MTREXHU3RjZFXHJcbiAgICBkb2NGb290ZXI6IHtcclxuICAgICAgcHJldjogXCJcdTRFMEFcdTRFMDBcdTk4NzVcIixcclxuICAgICAgbmV4dDogXCJcdTRFMEJcdTRFMDBcdTk4NzVcIixcclxuICAgIH0sXHJcbiAgICBmb290ZXI6IHtcclxuICAgICAgbWVzc2FnZTogXCJNSVQgTGljZW5zZWRcIixcclxuICAgICAgY29weXJpZ2h0OiBcIkNvcHlyaWdodCBcdTAwQTkgMjAwOS0yMDIzIENNT05PLk5FVFwiLFxyXG4gICAgfSxcclxuICAgIC8vICAgZWRpdExpbms6IHtcclxuICAgIC8vICAgICBwYXR0ZXJuOiAnXHU4REVGXHU1Rjg0XHU1NzMwXHU1NzQwJyxcclxuICAgIC8vICAgICB0ZXh0OiAnXHU1QkY5XHU2NzJDXHU5ODc1XHU2M0QwXHU1MUZBXHU0RkVFXHU2NTM5XHU1RUZBXHU4QkFFJyxcclxuICAgIC8vICAgfSxcclxuICAgIG5hdjogbmF2LFxyXG4gICAgc2lkZWJhcixcclxuICAgIG91dGxpbmU6IHtcclxuICAgICAgbGV2ZWw6IFwiZGVlcFwiLCAvLyBcdTUzRjNcdTRGQTdcdTU5MjdcdTdFQjJcdTY4MDdcdTk4OThcdTVDNDJcdTdFQTdcclxuICAgICAgbGFiZWw6IFwiXHU3NkVFXHU1RjU1XCIsIC8vIFx1NTNGM1x1NEZBN1x1NTkyN1x1N0VCMlx1NjgwN1x1OTg5OFx1NjU4N1x1NjcyQ1x1OTE0RFx1N0Y2RVxyXG4gICAgfSxcclxuICB9LFxyXG59O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXEdpdEh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXEdpdEh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxccnNzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9HaXRIdWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL3Jzcy50c1wiO2ltcG9ydCB7IFJTU09wdGlvbnMgfSBmcm9tICd2aXRlcHJlc3MtcGx1Z2luLXJzcydcclxuLy8gY29uc3QgYmFzZVVybCA9ICdodHRwczovL2NoYW5nd2VpaHVhLmdpdGh1Yi5pbydcclxuY29uc3QgUlNTOiBSU1NPcHRpb25zID0ge1xyXG4gIC8vIG5lY2Vzc2FyeVx1RkYwOFx1NUZDNVx1OTAwOVx1NTNDMlx1NjU3MFx1RkYwOVxyXG4gIHRpdGxlOiAnQ01PTk8uTkVUJyxcclxuICBiYXNlVXJsOiAnLicsXHJcbiAgaWNvbjogJzxzdmcgdD1cIjE2OTI2NzA2MDc0NDdcIiBjbGFzcz1cImljb25cIiB2aWV3Qm94PVwiMCAwIDEwMjQgMTAyNFwiIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgcC1pZD1cIjY1MzJcIiB3aWR0aD1cIjEyOFwiIGhlaWdodD1cIjEyOFwiPjxwYXRoIGQ9XCJNMjY1LjIxNiA3NTguNzg0YzIyLjUyOCAyMi41MjggMzQuODE2IDUxLjIgMzQuODE2IDgzLjk2OCAwIDMyLjc2OC0xMy4zMTIgNjIuNDY0LTM0LjgxNiA4My45NjgtMjIuNTI4IDIyLjUyOC01My4yNDggMzQuODE2LTgzLjk2OCAzNC44MTYtMzIuNzY4IDAtNjIuNDY0LTEzLjMxMi04My45NjgtMzQuODE2QzczLjcyOCA5MDUuMjE2IDYxLjQ0IDg3NC40OTYgNjEuNDQgODQzLjc3NmMwLTMyLjc2OCAxMy4zMTItNjIuNDY0IDM0LjgxNi04My45NjggMjIuNTI4LTIyLjUyOCA1MS4yLTM0LjgxNiA4My45NjgtMzQuODE2IDMzLjc5Mi0xLjAyNCA2Mi40NjQgMTIuMjg4IDg0Ljk5MiAzMy43OTJ6TTYxLjQ0IDM2Ny42MTZ2MTcyLjAzMmMxMTEuNjE2IDAgMjE4LjExMiA0NC4wMzIgMjk2Ljk2IDEyMi44OFM0ODEuMjggODQ4Ljg5NiA0ODEuMjggOTYyLjU2aDE3Mi4wMzJjMC0xNjMuODQtNjYuNTYtMzEyLjMyLTE3NC4wOC00MTkuODRDMzczLjc2IDQzNi4yMjQgMjI1LjI4IDM2OS42NjQgNjEuNDQgMzY3LjYxNnpNNjEuNDQgNjEuNDR2MTcyLjAzMmM0MDIuNDMyIDAgNzI5LjA4OCAzMjYuNjU2IDcyOS4wODggNzI5LjA4OEg5NjIuNTZjMC0yNDcuODA4LTEwMS4zNzYtNDczLjA4OC0yNjQuMTkyLTYzNi45MjhDNTM2LjU3NiAxNjMuODQgMzExLjI5NiA2My40ODggNjEuNDQgNjEuNDR6XCIgZmlsbD1cIiNFQkEzM0FcIiBwLWlkPVwiNjUzM1wiPjwvcGF0aD48L3N2Zz4nLFxyXG4gIGNvcHlyaWdodDogJ0NvcHlyaWdodCAoYykgMjAxMy1wcmVzZW50LCBDTU9OTy5ORVQnLFxyXG5cclxuICAvLyBvcHRpb25hbFx1RkYwOFx1NTNFRlx1OTAwOVx1NTNDMlx1NjU3MFx1RkYwOVxyXG4gIGxhbmd1YWdlOiAnemgtY24nLFxyXG4gIGF1dGhvcjoge1xyXG4gICAgbmFtZTogJ1x1NUUzOFx1NEYxRlx1NTM0RScsXHJcbiAgICBlbWFpbDogJ2NoYW5nd2VpaHVhQG91dGxvb2suY29tJyxcclxuICAgIGxpbms6ICdodHRwczovL2NoYW5nd2VpaHVhLmdpdGh1Yi5pbydcclxuICB9LFxyXG4gIGF1dGhvcnM6W1xyXG4gICAge1xyXG4gICAgICBuYW1lOiAnXHU1RTM4XHU0RjFGXHU1MzRFJyxcclxuICAgICAgZW1haWw6ICdjaGFuZ3dlaWh1YUBvdXRsb29rLmNvbScsXHJcbiAgICAgIGxpbms6ICdodHRwczovL2NoYW5nd2VpaHVhLmdpdGh1Yi5pbydcclxuICAgIH1cclxuICBdLFxyXG4gIGZpbGVuYW1lOiAnZmVlZC5yc3MnLFxyXG4gIGxvZzogdHJ1ZSxcclxuICBpZ25vcmVIb21lOiB0cnVlLFxyXG59XHJcblxyXG5leHBvcnQge1xyXG4gIFJTU1xyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7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
