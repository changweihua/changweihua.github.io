// .vitepress/src/sidebars/zh.ts
var sidebar = {
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
var zh_default = sidebar;

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
  sidebar: zh_default
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

// .vitepress/src/markdown.ts
import {
  containerPreview,
  componentPreview
} from "file:///D:/Github/changweihua.github.io/node_modules/@vitepress-demo-preview/plugin/dist/index.mjs";
import mdItCustomAttrs from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-custom-attrs/index.js";
import timeline from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-markdown-timeline/dist/cjs/index.cjs.js";
import container from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-container/index.js";
import { renderSandbox } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-plugin-sandpack/dist/esm/index.mjs";
import footnote from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-footnote/index.mjs";
import mathjax3 from "file:///D:/Github/changweihua.github.io/node_modules/markdown-it-mathjax3/index.js";
var markdown = {
  lineNumbers: true,
  theme: { light: "github-light", dark: "github-dark" },
  config: (md) => {
    md.use(footnote);
    md.use(mathjax3);
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
  // ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  [
    "link",
    {
      rel: "stylesheet",
      href: "/font.css"
    }
  ],
  ["meta", { name: "referrer", content: "no-referrer" }],
  [
    "script",
    {
      src: "/clarity.js"
    }
  ],
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

// .vitepress/src/navs/zh.ts
var nav = [
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

// .vitepress/config.ts
import { RssPlugin } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-plugin-rss/dist/index.mjs";

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
import { withMermaid } from "file:///D:/Github/changweihua.github.io/node_modules/vitepress-plugin-mermaid/dist/vitepress-plugin-mermaid.es.mjs";

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
  return twitterHead;
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
var links = [];
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
var config_default = withMermaid({
  mermaid: {
    //mermaidConfig !theme here works for ligth mode since dark theme is forced in dark mode
  },
  vite: {
    // ↓↓↓↓↓
    plugins: [
      RssPlugin(RSS),
      GitRevisionInfoPlugin()
      // {
      //   ...AutoIndex({}),
      //   enforce: 'pre'
      // },
      // detypeVitePlugin(),
      // detypeMarkdownPlugin(),
      // require("./plugins/frontmatter")
    ]
    // ↑↑↑↑↑
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag)
      }
    }
  },
  ...defaultConfig,
  /* 标头配置 */
  head,
  /* 主题配置 */
  themeConfig,
  /* 语言配置 */
  locales: {
    root: { label: "\u7B80\u4F53\u4E2D\u6587", lang: "zh-CN", link: "/", ...zhConfig }
    // en: { label: "English", lang: "en-US", link: "/en/", ...enConfig },
  },
  lastUpdated: false,
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
  },
  ignoreDeadLinks: true,
  markdown,
  async buildEnd() {
    console.log("buildEnd");
  },
  async transformHead(context) {
    const head2 = handleHeadMeta(context);
    return head2;
  }
  // buildEnd: genFeed
  // markdown: {
  //   // ...
  //   config: (md) => {
  //     md.use(timeline);
  //     md.use(footnote);
  //     md.use(mathjax3);
  //   },
  // },
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
  // optionally, you can pass MermaidConfig
  // mermaid: {
  //   // refer https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults for options
  // },
  // optionally set additional config for plugin itself with MermaidPluginConfig
  // mermaidPlugin: {
  //   class: "mermaid my-class", // set additional css classes for parent container
  // },
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9zcmMvc2lkZWJhcnMvemgudHMiLCAiLnZpdGVwcmVzcy9zcmMvdGhlbWUudHMiLCAiLnZpdGVwcmVzcy9zcmMvbWFya2Rvd24udHMiLCAiLnZpdGVwcmVzcy9zcmMvZGVmYXVsdHMudHMiLCAiLnZpdGVwcmVzcy9zcmMvaGVhZC50cyIsICIudml0ZXByZXNzL3NyYy9uYXZzL3poLnRzIiwgIi52aXRlcHJlc3Mvc3JjL2NvbmZpZ3MvemgudHMiLCAiLnZpdGVwcmVzcy9jb25maWcudHMiLCAiLnZpdGVwcmVzcy9zcmMvcnNzLnRzIiwgIi52aXRlcHJlc3MvdXRpbHMvaGFuZGxlSGVhZE1ldGEudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXHNpZGViYXJzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXHNpZGViYXJzXFxcXHpoLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL3NpZGViYXJzL3poLnRzXCI7aW1wb3J0IHsgRGVmYXVsdFRoZW1lIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG5cclxuY29uc3Qgc2lkZWJhcjogRGVmYXVsdFRoZW1lLlNpZGViYXIgfCB1bmRlZmluZWQgPSB7XHJcbiAgYXJ0aWNsZXM6IFtcclxuICAgIHtcclxuICAgICAgdGV4dDogXCJFeGFtcGxlc1wiLFxyXG4gICAgICBpdGVtczogW1xyXG4gICAgICAgIHsgdGV4dDogXCJNYXJrZG93biBFeGFtcGxlc1wiLCBsaW5rOiBcIi9tYXJrZG93bi1leGFtcGxlc1wiIH0sXHJcbiAgICAgICAgeyB0ZXh0OiBcIlJ1bnRpbWUgQVBJIEV4YW1wbGVzXCIsIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbiAgJy9jb3Vyc2UvdHlwZXNjcmlwdC8nOiBbXHJcbiAgICB7XHJcbiAgICAgIHRleHQ6IFwiVHlwZVNjcmlwdFwiLFxyXG4gICAgICBpdGVtczogW1xyXG4gICAgICAgIHsgdGV4dDogXCJUeXBlU2NyaXB0XHU1MTg1XHU3RjZFXHU3QzdCXHU1NzhCXCIsIGxpbms6IFwiL2NvdXJzZS90eXBlc2NyaXB0L3ByZXNldF90eXBlXCIgfSxcclxuICAgICAgICB7IHRleHQ6IFwiVHlwZVNjcmlwdFx1NjJEM1x1NUM1NVwiLCBsaW5rOiBcIi9jb3Vyc2UvdHlwZXNjcmlwdC9leHRlbnNpb25fdHlwZVwiIH0sXHJcbiAgICAgICAgeyB0ZXh0OiBcIlx1OUVEOFx1OEJBNCB0c2NvbmZpZy5qc29uXCIsIGxpbms6IFwiL2NvdXJzZS90eXBlc2NyaXB0L2RlZmF1bHRfdHNjb25maWdcIiB9LFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICBdLFxyXG4gICcvY291cnNlL2FsZ29yaXRobS8nOiBbXHJcbiAgICB7XHJcbiAgICAgIHRleHQ6IFwiYWxnb3JpdGhtXCIsXHJcbiAgICAgIGl0ZW1zOiBbXHJcbiAgICAgIF0sXHJcbiAgICB9LFxyXG4gIF0sXHJcbiAgLy8gZ2FsbGVyeTogW1xyXG4gIC8vICAge1xyXG4gIC8vICAgICB0ZXh0OiBcIlx1OTg3OVx1NzZFRVx1Njg0OFx1NEY4QlwiLFxyXG4gIC8vICAgICBpdGVtczogW1xyXG4gIC8vICAgICAgIHsgdGV4dDogXCJcdTY1RTBcdTk1MjFcdTc4NTVcdTY1M0VcdTY3M0FcdTU3M0FcdTk2MzNcdTUxNDlcdTY3MERcdTUyQTFcdTVFNzNcdTUzRjBcIiwgbGluazogXCIvZ2FsbGVyeS9zdW5ueS1sYW5kXCIgfSxcclxuICAvLyAgICAgICB7IHRleHQ6IFwiXHU2MjZDXHU2Q0YwXHU2NzNBXHU1NzNBXHU2NjdBXHU2MTY3XHU1MUZBXHU4ODRDXHU1RkFFXHU0RkUxXHU1QzBGXHU3QTBCXHU1RThGXCIsIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiIH0sXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJcdTRFMEFcdTZENzdcdTZDMTFcdTgyMkFcdTUzNEVcdTRFMUNcdTUxRUZcdTRFOUFcdTZDNUZcdTgyQ0ZcdTUyMDZcdTUxNkNcdTUzRjhcdTc1QUJcdTYwQzVcdTk2MzJcdTYzQTdcdTVFNzNcdTUzRjBcIixcclxuICAvLyAgICAgICAgIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgICAgeyB0ZXh0OiBcIlx1NjVFMFx1OTUyMVx1Nzg1NVx1NjUzRVx1NjczQVx1NTczQVx1NUI4OVx1NjhDMFx1NjU0OFx1ODBGRFx1NTIwNlx1Njc5MFx1N0NGQlx1N0VERlwiLCBsaW5rOiBcIi9hcGktZXhhbXBsZXNcIiB9LFxyXG4gIC8vICAgICAgIHtcclxuICAvLyAgICAgICAgIHRleHQ6IFwiXHU2NUUwXHU5NTIxXHU3ODU1XHU2NTNFXHU2NzNBXHU1NzNBXHU4RkRCXHU1MUZBXHU2RTJGL1x1NjVFMFx1N0VCOFx1NTMxNlx1N0NGQlx1N0VERlwiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYXBpLWV4YW1wbGVzXCIsXHJcbiAgLy8gICAgICAgfSxcclxuICAvLyAgICAgICB7IHRleHQ6IFwiXHU2MjZDXHU2Q0YwXHU2NzNBXHU1NzNBXHU1QkEyXHU2RTkwXHU1NzMwXHU1MjA2XHU2NzkwXHU3Q0ZCXHU3RURGXCIsIGxpbms6IFwiL2FwaS1leGFtcGxlc1wiIH0sXHJcbiAgLy8gICAgIF0sXHJcbiAgLy8gICB9LFxyXG4gIC8vIF0sXHJcbiAgLy8gYmxvZzogW1xyXG4gIC8vICAge1xyXG4gIC8vICAgICB0ZXh0OiBcIjIwMjMtMDZcIixcclxuICAvLyAgICAgaXRlbXM6IFtcclxuICAvLyAgICAgICB7XHJcbiAgLy8gICAgICAgICB0ZXh0OiBcIlAtVG91Y2ggUDkwMCBcdTYyNTNcdTUzNzBcdTY3M0FcdTRGN0ZcdTc1MjhcIixcclxuICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMy0wNi9QLVRvdWNoIFA5MDAgXHU2MjUzXHU1MzcwXHU2NzNBXHU0RjdGXHU3NTI4XCIsXHJcbiAgLy8gICAgICAgfSxcclxuICAvLyAgICAgICB7IHRleHQ6IFwiVml0ZXN0IFx1NEY3Rlx1NzUyOFwiLCBsaW5rOiBcIi9ibG9nLzIwMjMtMDYvMTVcIiB9LFxyXG4gIC8vICAgICBdLFxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdGV4dDogXCIyMDIzLTA1XCIsXHJcbiAgLy8gICAgIGl0ZW1zOiBbXHJcbiAgLy8gICAgICAgeyB0ZXh0OiBcIlx1NjQyRFx1NUVGQSBHaXRodWIgXHU0RTJBXHU0RUJBXHU0RTNCXHU5ODc1XCIsIGxpbms6IFwiL2Jsb2cvMjAyMy0wNS8xNVwiIH0sXHJcbiAgLy8gICAgICAge1xyXG4gIC8vICAgICAgICAgdGV4dDogXCJcdTRGN0ZcdTc1MjggU2tpYVNoYXJwIFx1NUI5RVx1NzNCMFx1NTZGRVx1NzI0N1x1NkMzNFx1NTM3MFwiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIzLTA1L3NraWFzaGFwX3dhdGVybWFyay5tZFwiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgIF0sXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0ZXh0OiBcIjIwMjJcIixcclxuICAvLyAgICAgaXRlbXM6IFtcclxuICAvLyAgICAgICB7XHJcbiAgLy8gICAgICAgICB0ZXh0OiBcIlx1NEVDRSBEb2NrZXIgXHU1Qjg5XHU4OEM1IEdpdGVhXCIsXHJcbiAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU0RUNFIERvY2tlciBcdTVCODlcdTg4QzUgR2l0ZWEubWRcIixcclxuICAvLyAgICAgICB9LFxyXG4gIC8vICAgICAgIHtcclxuICAvLyAgICAgICAgIHRleHQ6IFwiXHU2NTRGXHU2Mzc3XHU1RjAwXHU1M0QxXHU1QjY2XHU0RTYwXHU3QjE0XHU4QkIwXCIsXHJcbiAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU2NTRGXHU2Mzc3XHU1RjAwXHU1M0QxXHU1QjY2XHU0RTYwXHU3QjE0XHU4QkIwLm1kXCIsXHJcbiAgLy8gICAgICAgfSxcclxuICAvLyAgICAgICB7XHJcbiAgLy8gICAgICAgICB0ZXh0OiBcIlx1NzlDMVx1NjcwOW51Z2V0XHU2NzBEXHU1MkExXHU1NjY4XHU5MEU4XHU3RjcyXCIsXHJcbiAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU3OUMxXHU2NzA5bnVnZXRcdTY3MERcdTUyQTFcdTU2NjhcdTkwRThcdTdGNzIubWRcIixcclxuICAvLyAgICAgICB9LFxyXG5cclxuICAvLyAgICAgICB7XHJcbiAgLy8gICAgICAgICB0ZXh0OiBcIlx1NEUzQWRvY2tlclx1OTE0RFx1N0Y2RUhUVFBcdTRFRTNcdTc0MDZcdTY3MERcdTUyQTFcdTU2NjhcIixcclxuICAvLyAgICAgICAgIGxpbms6IFwiL2Jsb2cvMjAyMi9cdTRFM0Fkb2NrZXJcdTkxNERcdTdGNkVIVFRQXHU0RUUzXHU3NDA2XHU2NzBEXHU1MkExXHU1NjY4Lm1kXCIsXHJcbiAgLy8gICAgICAgfSxcclxuICAvLyAgICAgICB7XHJcbiAgLy8gICAgICAgICB0ZXh0OiBcIlx1NzlDMVx1NjcwOW51Z2V0XHU2NzBEXHU1MkExXHU1NjY4XHU5MEU4XHU3RjcyXCIsXHJcbiAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU3OUMxXHU2NzA5bnVnZXRcdTY3MERcdTUyQTFcdTU2NjhcdTkwRThcdTdGNzIubWRcIixcclxuICAvLyAgICAgICB9LFxyXG4gIC8vICAgICAgIHtcclxuICAvLyAgICAgICAgIHRleHQ6IFwiXHU2QjYzXHU1NDExXHU0RUUzXHU3NDA2XHU1NDhDXHU1M0NEXHU1NDExXHU0RUUzXHU3NDA2XCIsXHJcbiAgLy8gICAgICAgICBsaW5rOiBcIi9ibG9nLzIwMjIvXHU2QjYzXHU1NDExXHU0RUUzXHU3NDA2XHU1NDhDXHU1M0NEXHU1NDExXHU0RUUzXHU3NDA2Lm1kXCIsXHJcbiAgLy8gICAgICAgfSxcclxuICAvLyAgICAgICB7XHJcbiAgLy8gICAgICAgICB0ZXh0OiBcIlx1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNlx1OEJFNlx1ODlFM1wiLFxyXG4gIC8vICAgICAgICAgbGluazogXCIvYmxvZy8yMDIyL1x1NkI2M1x1NTQxMVx1NEVFM1x1NzQwNlx1NTQ4Q1x1NTNDRFx1NTQxMVx1NEVFM1x1NzQwNlx1OEJFNlx1ODlFMy5tZFwiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgIF0sXHJcbiAgLy8gICB9LFxyXG4gIC8vIF0sXHJcbn07XHJcblxyXG5leHBvcnQge1xyXG4gIHNpZGViYXJcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgc2lkZWJhcjtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXHRoZW1lLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL3RoZW1lLnRzXCI7aW1wb3J0IHR5cGUgeyBEZWZhdWx0VGhlbWUgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcbmltcG9ydCBuYXYgZnJvbSBcIi4vbmF2cy96aFwiO1xyXG5pbXBvcnQgc2lkZWJhciBmcm9tIFwiLi9zaWRlYmFycy96aFwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IHRoZW1lQ29uZmlnOiBEZWZhdWx0VGhlbWUuQ29uZmlnID0ge1xyXG4gIC8vIGVkaXRMaW5rOiB7XHJcbiAgLy8gICBwYXR0ZXJuOiAnaHR0cHM6Ly9naXRodWIuY29tL2NoYW5nd2VpaHVhL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby9lZGl0L21hc3Rlci8vOnBhdGgnLFxyXG4gIC8vICAgdGV4dDogJ0VkaXQgdGhpcyBwYWdlIG9uIEdpdEh1YidcclxuICAvLyB9LFxyXG4gIGxvZ286IFwiL2xvZ28ucG5nXCIsXHJcbiAgc29jaWFsTGlua3M6IFtcclxuICAgIHtcclxuICAgICAgaWNvbjoge1xyXG4gICAgICAgIHN2ZzogJzxzdmcgdD1cIjE2OTI1ODEwOTAxOTlcIiBjbGFzcz1cImljb25cIiB2aWV3Qm94PVwiMCAwIDEwMjQgMTAyNFwiIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgcC1pZD1cIjc0NzFcIiB3aWR0aD1cIjEyOFwiIGhlaWdodD1cIjEyOFwiPjxwYXRoIGQ9XCJNNTEyIDEyLjYzNjE2Yy0yODIuNzQ2ODggMC01MTIgMjI5LjIxMjE2LTUxMiA1MTIgMCAyMjYuMjIyMDggMTQ2LjY5ODI0IDQxOC4xNDAxNiAzNTAuMTI2MDggNDg1LjgyNjU2IDI1LjU3OTUyIDQuNzMwODggMzUuMDAwMzItMTEuMTAwMTYgMzUuMDAwMzItMjQuNjM3NDQgMC0xMi4yMDYwOC0wLjQ3MTA0LTUyLjU1MTY4LTAuNjk2MzItOTUuMzEzOTItMTQyLjQzODQgMzAuOTY1NzYtMTcyLjUwMzA0LTYwLjQxNi0xNzIuNTAzMDQtNjAuNDE2LTIzLjI4NTc2LTU5LjE2NjcyLTU2Ljg1MjQ4LTc0LjkxNTg0LTU2Ljg1MjQ4LTc0LjkxNTg0LTQ2LjQ0ODY0LTMxLjc4NDk2IDMuNTAyMDgtMzEuMTI5NiAzLjUwMjA4LTMxLjEyOTYgNTEuNDA0OCAzLjYwNDQ4IDc4LjQ3OTM2IDUyLjc1NjQ4IDc4LjQ3OTM2IDUyLjc1NjQ4IDQ1LjY3MDQgNzguMjc0NTYgMTE5Ljc2NzA0IDU1LjY0NDE2IDE0OS4wMTI0OCA0Mi41NTc0NCA0LjU4NzUyLTMzLjA5NTY4IDE3Ljg1ODU2LTU1LjY4NTEyIDMyLjUwMTc2LTY4LjQ2NDY0LTExMy43MjU0NC0xMi45NDMzNi0yMzMuMjY3Mi01Ni44NTI0OC0yMzMuMjY3Mi0yNTMuMDMwNCAwLTU1Ljg4OTkyIDIwLjAwODk2LTEwMS41ODA4IDUyLjc1NjQ4LTEzNy40MjA4LTUuMzI0OC0xMi45MDI0LTIyLjg1NTY4LTY0Ljk2MjU2IDQuOTU2MTYtMTM1LjQ5NTY4IDAgMCA0My4wMDgtMTMuNzQyMDggMTQwLjg0MDk2IDUyLjQ5MDI0IDQwLjgzNzEyLTExLjM0NTkyIDg0LjY0Mzg0LTE3LjAzOTM2IDEyOC4xNjM4NC0xNy4yNDQxNiA0My40OTk1MiAwLjIwNDggODcuMzI2NzIgNS44Nzc3NiAxMjguMjQ1NzYgMTcuMjQ0MTYgOTcuNzMwNTYtNjYuMjUyOCAxNDAuNjU2NjQtNTIuNDkwMjQgMTQwLjY1NjY0LTUyLjQ5MDI0IDI3Ljg3MzI4IDcwLjUzMzEyIDEwLjM0MjQgMTIyLjU5MzI4IDUuMDM4MDggMTM1LjQ5NTY4IDMyLjgyOTQ0IDM1Ljg2MDQ4IDUyLjY5NTA0IDgxLjUzMDg4IDUyLjY5NTA0IDEzNy40MjA4IDAgMTk2LjY0ODk2LTExOS43ODc1MiAyMzkuOTQzNjgtMjMzLjc5OTY4IDI1Mi42MjA4IDE4LjM3MDU2IDE1Ljg5MjQ4IDM0LjczNDA4IDQ3LjA0MjU2IDM0LjczNDA4IDk0LjgwMTkyIDAgNjguNTA1Ni0wLjU5MzkyIDEyMy42Mzc3Ni0wLjU5MzkyIDE0MC41MTMyOCAwIDEzLjYxOTIgOS4yMTYgMjkuNTkzNiAzNS4xNjQxNiAyNC41NzYgMjAzLjMyNTQ0LTY3Ljc2ODMyIDM0OS44MzkzNi0yNTkuNjI0OTYgMzQ5LjgzOTM2LTQ4NS43NjUxMiAwLTI4Mi43ODc4NC0yMjkuMjMyNjQtNTEyLTUxMi01MTJ6XCIgZmlsbD1cIiM0NDQ0NDRcIiBwLWlkPVwiNzQ3MlwiPjwvcGF0aD48L3N2Zz4nLFxyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9jaGFuZ3dlaWh1YVwiLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgaWNvbjoge1xyXG4gICAgICAgIHN2ZzogJzxzdmcgdD1cIjE2OTEwMzcwNDg2MDBcIiBjbGFzcz1cImljb25cIiB2aWV3Qm94PVwiMCAwIDEwMjQgMTAyNFwiIHZlcnNpb249XCIxLjFcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgcC1pZD1cIjI1ODRcIiB3aWR0aD1cIjEyOFwiIGhlaWdodD1cIjEyOFwiPjxwYXRoIGQ9XCJNMjI4LjcgNjQzLjljLTAuMSAwLjEtMC4yIDAuMy0wLjMgMC40IDMuOS00LjQgOC05IDEyLTEzLjUtNy41IDguNC0xMS43IDEzLjEtMTEuNyAxMy4xelwiIGZpbGw9XCIjMTU5MEU5XCIgcC1pZD1cIjI1ODVcIj48L3BhdGg+PHBhdGggZD1cIk04OTQgMjk4LjFsMjUuNi0xNS4xYzEwLjQtNi4xIDkuMS0yMS41LTIuMS0yNS45bC0xMi4zLTQuOGMtMTgtNy4xLTM0LjItMTguMi00Ni43LTMzLTE1LjctMTguNS00NC43LTQ1LjEtOTAuOS02MC44LTUyLjctMTgtMTQyLjktMTQuNC0xOTMuMi0xMC41LTE1LjkgMS4yLTI1IDE4LjQtMTcuNCAzMi41IDQyLjYgNzguNiAxNi43IDExNC4zLTUuNyAxNDAuNy0zNC4zIDQwLjQtOTcuNCAxMTIuMi0xNjAuNyAxODMuNiAyMS45LTI0LjUgNDEuOC00Ni44IDU4LjEtNjUuMSAzNi40LTQwLjggOTEuMy02MS41IDE0NS4xLTUxLjcgMTcxLjUgMzEuMyAxOTEgMjUzLjQtOS4yIDM4NS42IDI2LjEtMS40IDUyLjYtMy4zIDc5LjItNiAyNTIuNi0yNiAyNzIuNi0yMzIuMSAyMTgtMzMzLjktMTkuNC0zNi4xLTIyLjItNjAuNS0yMC4xLTgzLjkgMi0yMS41IDEzLjgtNDAuOCAzMi4zLTUxLjd6XCIgZmlsbD1cIiM5OUMyMzZcIiBwLWlkPVwiMjU4NlwiPjwvcGF0aD48cGF0aCBkPVwiTTIxMi44IDcwNC41QzI0MS4xIDY3Mi45IDMxNiA1ODkgMzkwLjcgNTA0LjdjLTU0LjYgNjEuMi0xMjEuOCAxMzYuNy0xNzcuOSAxOTkuOHpcIiBmaWxsPVwiIzE1OTBFOVwiIHAtaWQ9XCIyNTg3XCI+PC9wYXRoPjxwYXRoIGQ9XCJNMjE2LjMgNzU4LjZjLTE5LjUtMi41LTI4LjItMjUuNi0xNS41LTQwLjYtNTEuNyA1OC4zLTkxLjcgMTAzLjUtOTkuMSAxMTIuNi0yNC4xIDI5LjUgMjQ3LjcgOTcuOSA0ODIuNi01Ni44IDAuMS0wLjEgMC4zLTAuMiAwLjQtMC4zLTE1Ni41IDguMi0yOTguNS01LjktMzY4LjQtMTQuOXpcIiBmaWxsPVwiI0NBQzEzNFwiIHAtaWQ9XCIyNTg4XCI+PC9wYXRoPjxwYXRoIGQ9XCJNNTkzLjkgMzg3LjljLTUzLjgtOS44LTEwOC43IDEwLjktMTQ1LjEgNTEuNy0xNi4zIDE4LjItMzYuMiA0MC41LTU4LjEgNjUuMUMzMTYgNTg5IDI0MS4xIDY3Mi45IDIxMi44IDcwNC41Yy00LjEgNC42LTguMSA5LjEtMTIgMTMuNS0xMi43IDE0LjktNCAzOCAxNS41IDQwLjYgNjkuOSA5IDIxMS45IDIzLjEgMzY4LjMgMTUgMjAwLjItMTMyLjMgMTgwLjgtMzU0LjQgOS4zLTM4NS43elwiIGZpbGw9XCIjMDI5RjQwXCIgcC1pZD1cIjI1ODlcIj48L3BhdGg+PC9zdmc+JyxcclxuICAgICAgfSxcclxuICAgICAgbGluazogXCJodHRwczovL3d3dy55dXF1ZS5jb20vY2hhbmd3ZWlodWFcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGljb246IHtcclxuICAgICAgICBzdmc6ICc8c3ZnIHQ9XCIxNjkxMDM3MzU4NzQ0XCIgY2xhc3M9XCJpY29uXCIgdmlld0JveD1cIjAgMCAxMDI0IDEwMjRcIiB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHAtaWQ9XCI3NjQwXCIgd2lkdGg9XCIxMjhcIiBoZWlnaHQ9XCIxMjhcIj48cGF0aCBkPVwiTTExNy4xNDk3MzcgOTA2Ljg1MDI2M1YxMTcuMTYwMDgxaDc4OS42OTAxODJ2Nzg5LjY5MDE4MnogbTE0OC41MjEzNzQtNjQxLjcwNjY2N3Y0OTIuNTMzNjU3aDI0OC44NzMzNzRWMzY3Ljg0MzU1NmgxNDUuMDI1MjkzdjM4OS45MDYxMDFoOTguNzM1MzIxVjI2NS4xNDM1OTZ6XCIgZmlsbD1cIiNDQjM4MzdcIiBwLWlkPVwiNzY0MVwiPjwvcGF0aD48L3N2Zz4nLFxyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBcImh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9+Y2hhbmd3ZWlodWFcIixcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGljb246IHtcclxuICAgICAgICBzdmc6ICc8c3ZnIHQ9XCIxNjkyNTgwOTkwODMzXCIgY2xhc3M9XCJpY29uXCIgdmlld0JveD1cIjAgMCAxMTI5IDEwMjRcIiB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHAtaWQ9XCI0NDU4XCIgd2lkdGg9XCIxMjhcIiBoZWlnaHQ9XCIxMjhcIj48cGF0aCBkPVwiTTIzNC45MDkgOS42NTZhODAuNDY4IDgwLjQ2OCAwIDAgMSA2OC4zOTggMCAxNjcuMzc0IDE2Ny4zNzQgMCAwIDEgNDEuODQzIDMwLjU3OGwxNjAuOTM3IDE0MC44MmgxMTUuMDdsMTYwLjkzNi0xNDAuODJhMTY4Ljk4MyAxNjguOTgzIDAgMCAxIDQxLjg0My0zMC41NzhBODAuNDY4IDgwLjQ2OCAwIDAgMSA5MzAuOTYgNzYuNDQ1YTgwLjQ2OCA4MC40NjggMCAwIDEtMTcuNzAzIDUzLjkxNCA0NDkuODE4IDQ0OS44MTggMCAwIDEtMzUuNDA2IDMyLjE4NyAyMzIuNTUzIDIzMi41NTMgMCAwIDEtMjIuNTMxIDE4LjUwOGgxMDAuNTg1YTE3MC41OTMgMTcwLjU5MyAwIDAgMSAxMTguMjg5IDUzLjEwOSAxNzEuMzk3IDE3MS4zOTcgMCAwIDEgNTMuOTE0IDExOC4yODh2NDYyLjY5M2EzMjUuODk3IDMyNS44OTcgMCAwIDEtNC4wMjQgNzAuMDA3IDE3OC42NCAxNzguNjQgMCAwIDEtODAuNDY4IDExMi42NTYgMTczLjAwNyAxNzMuMDA3IDAgMCAxLTkyLjUzOSAyNS43NWgtNzM4LjdhMzQxLjE4NiAzNDEuMTg2IDAgMCAxLTcyLjQyMS00LjAyNEExNzcuODM1IDE3Ny44MzUgMCAwIDEgMjguOTEgOTM5LjA2NWExNzIuMjAyIDE3Mi4yMDIgMCAwIDEtMjcuMzYtOTIuNTM5VjM4OC42NjJhMzYwLjQ5OCAzNjAuNDk4IDAgMCAxIDAtNjYuNzg5QTE3Ny4wMyAxNzcuMDMgMCAwIDEgMTYyLjQ4NyAxNzguNjRoMTA1LjQxNGMtMTYuODk5LTEyLjA3LTMxLjM4My0yNi41NTUtNDYuNjcyLTM5LjQzYTgwLjQ2OCA4MC40NjggMCAwIDEtMjUuNzUtNjUuOTg0IDgwLjQ2OCA4MC40NjggMCAwIDEgMzkuNDMtNjMuNTdNMjE2LjQgMzIxLjg3M2E4MC40NjggODAuNDY4IDAgMCAwLTYzLjU3IDU3LjkzNyAxMDguNjMyIDEwOC42MzIgMCAwIDAgMCAzMC41Nzh2MzgwLjYxNWE4MC40NjggODAuNDY4IDAgMCAwIDU1LjUyMyA4MC40NjkgMTA2LjIxOCAxMDYuMjE4IDAgMCAwIDM0LjYwMSA1LjYzMmg2NTQuMjA4YTgwLjQ2OCA4MC40NjggMCAwIDAgNzYuNDQ0LTQ3LjQ3NiAxMTIuNjU2IDExMi42NTYgMCAwIDAgOC4wNDctNTMuMTA5di0zNTQuMDZhMTM1LjE4NyAxMzUuMTg3IDAgMCAwIDAtMzguNjI1IDgwLjQ2OCA4MC40NjggMCAwIDAtNTIuMzA0LTU0LjcxOSAxMjkuNTU0IDEyOS41NTQgMCAwIDAtNDkuODktNy4yNDJIMjU0LjIyYTI2OC43NjQgMjY4Ljc2NCAwIDAgMC0zNy44MiAweiBtMCAwXCIgZmlsbD1cIiMyMEIwRTNcIiBwLWlkPVwiNDQ1OVwiPjwvcGF0aD48cGF0aCBkPVwiTTM0OC4zNjkgNDQ3LjQwNGE4MC40NjggODAuNDY4IDAgMCAxIDU1LjUyMyAxOC41MDcgODAuNDY4IDgwLjQ2OCAwIDAgMSAyOC4xNjQgNTkuNTQ3djgwLjQ2OGE4MC40NjggODAuNDY4IDAgMCAxLTE2LjA5NCA1MS41IDgwLjQ2OCA4MC40NjggMCAwIDEtMTMxLjk2OC05LjY1NiAxMDQuNjA5IDEwNC42MDkgMCAwIDEtMTAuNDYtNTQuNzE5di04MC40NjhhODAuNDY4IDgwLjQ2OCAwIDAgMSA3MC4wMDctNjcuNTkzeiBtNDE2LjAyIDBhODAuNDY4IDgwLjQ2OCAwIDAgMSA4Ni4xMDIgNzUuNjR2ODAuNDY4YTk0LjE0OCA5NC4xNDggMCAwIDEtMTIuMDcgNTMuMTEgODAuNDY4IDgwLjQ2OCAwIDAgMS0xMzIuNzczIDAgOTUuNzU3IDk1Ljc1NyAwIDAgMS0xMi44NzUtNTcuMTMzVjUxOS4wMmE4MC40NjggODAuNDY4IDAgMCAxIDcwLjAwNy03MC44MTJ6IG0wIDBcIiBmaWxsPVwiIzIwQjBFM1wiIHAtaWQ9XCI0NDYwXCI+PC9wYXRoPjwvc3ZnPicsXHJcbiAgICAgIH0sXHJcbiAgICAgIGxpbms6IFwiaHR0cHM6Ly9zcGFjZS5iaWxpYmlsaS5jb20vNTQ0MTE2NTAwXCIsXHJcbiAgICB9LFxyXG4gIF0sXHJcbiAgLy8gaTE4blx1OERFRlx1NzUzMVxyXG4gIGkxOG5Sb3V0aW5nOiBmYWxzZSxcclxuICBzaWRlYmFyLFxyXG4gIC8vIGFsZ29saWE6IHtcclxuICAvLyAgIGFwcElkOiBcIklJODBHNEVMVEFcIiwgLy8gXHU5NzAwXHU4OTgxXHU2NkZGXHU2MzYyXHJcbiAgLy8gICBhcGlLZXk6IFwiOTZhZTliNjhmMDlmZDA3Y2JmNThjYmRmMzliOTljYmFcIiwgLy8gXHU5NzAwXHU4OTgxXHU2NkZGXHU2MzYyXHJcbiAgLy8gICBpbmRleE5hbWU6IFwiY21vbm9fbmV0XCIsIC8vIFx1OTcwMFx1ODk4MVx1NjZGRlx1NjM2MlxyXG4gIC8vICAgcGxhY2Vob2xkZXI6IFwiXHU4QkY3XHU4RjkzXHU1MTY1XHU1MTczXHU5NTJFXHU4QkNEXCIsXHJcbiAgLy8gICAvLyBzZWFyY2hQYXJhbWV0ZXJzPzogU2VhcmNoT3B0aW9uc1xyXG4gIC8vICAgLy8gZGlzYWJsZVVzZXJQZXJzb25hbGl6YXRpb24/OiBib29sZWFuXHJcbiAgLy8gICAvLyBpbml0aWFsUXVlcnk/OiBzdHJpbmdcclxuICAvLyAgIGxvY2FsZXM6IHtcclxuICAvLyAgICAgemg6IHtcclxuICAvLyAgICAgICB0cmFuc2xhdGlvbnM6IHtcclxuICAvLyAgICAgICAgIGJ1dHRvbjoge1xyXG4gIC8vICAgICAgICAgICBidXR0b25UZXh0OiBcIlx1NjQxQ1x1N0QyMlwiLFxyXG4gIC8vICAgICAgICAgfSxcclxuICAvLyAgICAgICB9LFxyXG4gIC8vICAgICB9LFxyXG4gIC8vICAgfSxcclxuICAvLyAgIC8vIFx1NjQxQ1x1N0QyMlx1OTE0RFx1N0Y2RVx1RkYwOFx1NEU4Q1x1OTAwOVx1NEUwMFx1RkYwOVxyXG4gIC8vICAgLy8gc2VhcmNoOiB7XHJcbiAgLy8gICAvLyAgIC8vIFx1NjcyQ1x1NTczMFx1NzlCQlx1N0VCRlx1NjQxQ1x1N0QyMlxyXG4gIC8vICAgLy8gICBwcm92aWRlcjogXCJsb2NhbFwiLFxyXG4gIC8vICAgLy8gICAvLyBcdTU5MUFcdThCRURcdThBMDBcdTY0MUNcdTdEMjJcdTkxNERcdTdGNkVcclxuICAvLyAgIC8vICAgb3B0aW9uczoge1xyXG4gIC8vICAgLy8gICAgIGxvY2FsZXM6IHtcclxuICAvLyAgIC8vICAgICAgIC8qIFx1OUVEOFx1OEJBNFx1OEJFRFx1OEEwMCAqL1xyXG4gIC8vICAgLy8gICAgICAgemg6IHtcclxuICAvLyAgIC8vICAgICAgICAgdHJhbnNsYXRpb25zOiB7XHJcbiAgLy8gICAvLyAgICAgICAgICAgYnV0dG9uOiB7XHJcbiAgLy8gICAvLyAgICAgICAgICAgICBidXR0b25UZXh0OiBcIlx1NjQxQ1x1N0QyMlwiLFxyXG4gIC8vICAgLy8gICAgICAgICAgICAgYnV0dG9uQXJpYUxhYmVsOiBcIlx1NjQxQ1x1N0QyMlx1NjU4N1x1Njg2M1wiLFxyXG4gIC8vICAgLy8gICAgICAgICAgIH0sXHJcbiAgLy8gICAvLyAgICAgICAgICAgbW9kYWw6IHtcclxuICAvLyAgIC8vICAgICAgICAgICAgIG5vUmVzdWx0c1RleHQ6IFwiXHU2NUUwXHU2Q0Q1XHU2MjdFXHU1MjMwXHU3NkY4XHU1MTczXHU3RUQzXHU2NzlDXCIsXHJcbiAgLy8gICAvLyAgICAgICAgICAgICByZXNldEJ1dHRvblRpdGxlOiBcIlx1NkUwNVx1OTY2NFx1NjdFNVx1OEJFMlx1N0VEM1x1Njc5Q1wiLFxyXG4gIC8vICAgLy8gICAgICAgICAgICAgZm9vdGVyOiB7XHJcbiAgLy8gICAvLyAgICAgICAgICAgICAgIHNlbGVjdFRleHQ6IFwiXHU5MDA5XHU2MkU5XCIsXHJcbiAgLy8gICAvLyAgICAgICAgICAgICAgIG5hdmlnYXRlVGV4dDogXCJcdTUyMDdcdTYzNjJcIixcclxuICAvLyAgIC8vICAgICAgICAgICAgIH0sXHJcbiAgLy8gICAvLyAgICAgICAgICAgfSxcclxuICAvLyAgIC8vICAgICAgICAgfSxcclxuICAvLyAgIC8vICAgICAgIH0sXHJcbiAgLy8gICAvLyAgICAgICBlbjoge1xyXG4gIC8vICAgLy8gICAgICAgICB0cmFuc2xhdGlvbnM6IHtcclxuICAvLyAgIC8vICAgICAgICAgICBidXR0b246IHtcclxuICAvLyAgIC8vICAgICAgICAgICAgIGJ1dHRvblRleHQ6IFwiU2VhcmNoXCIsXHJcbiAgLy8gICAvLyAgICAgICAgICAgICBidXR0b25BcmlhTGFiZWw6IFwiU2VhcmNoIGZvciBEb2N1bWVudHNcIixcclxuICAvLyAgIC8vICAgICAgICAgICB9LFxyXG4gIC8vICAgLy8gICAgICAgICAgIG1vZGFsOiB7XHJcbiAgLy8gICAvLyAgICAgICAgICAgICBub1Jlc3VsdHNUZXh0OiBcIlVuYWJsZSB0byBmaW5kIHJlbGV2YW50IHJlc3VsdHNcIixcclxuICAvLyAgIC8vICAgICAgICAgICAgIHJlc2V0QnV0dG9uVGl0bGU6IFwiQ2xlYXIgUXVlcnkgUmVzdWx0c1wiLFxyXG4gIC8vICAgLy8gICAgICAgICAgICAgZm9vdGVyOiB7XHJcbiAgLy8gICAvLyAgICAgICAgICAgICAgIHNlbGVjdFRleHQ6IFwic2VsZWN0XCIsXHJcbiAgLy8gICAvLyAgICAgICAgICAgICAgIG5hdmlnYXRlVGV4dDogXCJzd2l0Y2hcIixcclxuICAvLyAgIC8vICAgICAgICAgICAgIH0sXHJcbiAgLy8gICAvLyAgICAgICAgICAgfSxcclxuICAvLyAgIC8vICAgICAgICAgfSxcclxuICAvLyAgIC8vICAgICAgIH0sXHJcbiAgLy8gICAvLyAgICAgfSxcclxuICAvLyAgIC8vICAgfSxcclxuICAvLyB9LFxyXG4gIC8vIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjI2OVx1NUM1NTogXHU2NTg3XHU3QUUwXHU3MjQ4XHU2NzQzXHU5MTREXHU3RjZFXHJcbiAgLy8gY29weXJpZ2h0Q29uZmlnOiB7XHJcbiAgLy8gICBsaWNlbnNlOiAnXHU3RjcyXHU1NDBELVx1NzZGOFx1NTQwQ1x1NjVCOVx1NUYwRlx1NTE3MVx1NEVBQiA0LjAgXHU1NkZEXHU5NjQ1IChDQyBCWS1TQSA0LjApJyxcclxuICAvLyAgIGxpY2Vuc2VMaW5rOiAnaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnktc2EvNC4wLydcclxuICAvLyB9LFxyXG4gIC8vIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1NjI2OVx1NUM1NTogXHU5ODc1XHU4MTFBXHU5MTREXHU3RjZFXHJcbiAgLy8gZm9vdGVyQ29uZmlnOiB7XHJcbiAgLy8gICBzaG93Rm9vdGVyOiB0cnVlLCAvLyBcdTY2MkZcdTU0MjZcdTY2M0VcdTc5M0FcdTk4NzVcdTgxMUFcclxuICAvLyAgIGljcFJlY29yZENvZGU6ICdcdTZEMjVJQ1BcdTU5MDcyMDIyMDA1ODY0XHU1M0Y3LTInLCAvLyBJQ1BcdTU5MDdcdTY4NDhcdTUzRjdcclxuICAvLyAgIHB1YmxpY1NlY3VyaXR5UmVjb3JkQ29kZTogJ1x1NkQyNVx1NTE2Q1x1N0Y1MVx1NUI4OVx1NTkwNzEyMDExMjAyMDAwNjc3XHU1M0Y3JywgLy8gXHU4MDU0XHU3RjUxXHU1OTA3XHU2ODQ4XHU1M0Y3XHJcbiAgLy8gICBjb3B5cmlnaHQ6IGBDb3B5cmlnaHQgXHUwMEE5IDIwMTktJHtuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCl9IENoYXJsZXM3Y2AgLy8gXHU3MjQ4XHU2NzQzXHU0RkUxXHU2MDZGXHJcbiAgLy8gfVxyXG59O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcbWFya2Rvd24udHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvbWFya2Rvd24udHNcIjtpbXBvcnQge1xyXG4gIGNvbnRhaW5lclByZXZpZXcsXHJcbiAgY29tcG9uZW50UHJldmlldyxcclxufSBmcm9tIFwiQHZpdGVwcmVzcy1kZW1vLXByZXZpZXcvcGx1Z2luXCI7XHJcbmltcG9ydCB7IE1hcmtkb3duT3B0aW9ucyB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuaW1wb3J0IG1kSXRDdXN0b21BdHRycyBmcm9tIFwibWFya2Rvd24taXQtY3VzdG9tLWF0dHJzXCI7XHJcbmltcG9ydCB0aW1lbGluZSBmcm9tIFwidml0ZXByZXNzLW1hcmtkb3duLXRpbWVsaW5lXCI7XHJcbmltcG9ydCBjb250YWluZXIgZnJvbSAnbWFya2Rvd24taXQtY29udGFpbmVyJztcclxuaW1wb3J0IHsgcmVuZGVyU2FuZGJveCB9IGZyb20gJ3ZpdGVwcmVzcy1wbHVnaW4tc2FuZHBhY2snXHJcbmltcG9ydCBmb290bm90ZSBmcm9tICdtYXJrZG93bi1pdC1mb290bm90ZSc7XHJcbmltcG9ydCBtYXRoamF4MyBmcm9tICdtYXJrZG93bi1pdC1tYXRoamF4Myc7XHJcbi8vIGltcG9ydCB7IHRhYnNNYXJrZG93blBsdWdpbiB9IGZyb20gXCJ2aXRlcHJlc3MtcGx1Z2luLXRhYnNcIjtcclxuLy8gaW1wb3J0IHsgbnBtQ29tbWFuZHNNYXJrZG93blBsdWdpbiB9IGZyb20gJ3ZpdGVwcmVzcy1wbHVnaW4tbnBtLWNvbW1hbmRzJ1xyXG4vLyBpbXBvcnQgeyBjcmVhdGVEZXR5cGVQbHVnaW4gfSBmcm9tICd2aXRlcHJlc3MtcGx1Z2luLWRldHlwZSdcclxuLy8gY29uc3QgeyBkZXR5cGVNYXJrZG93blBsdWdpbiB9ID0gY3JlYXRlRGV0eXBlUGx1Z2luKClcclxuXHJcbmNvbnN0IG1hcmtkb3duOiBNYXJrZG93bk9wdGlvbnMgfCB1bmRlZmluZWQgPSB7XHJcbiAgbGluZU51bWJlcnM6IHRydWUsXHJcbiAgdGhlbWU6IHsgbGlnaHQ6ICdnaXRodWItbGlnaHQnLCBkYXJrOiAnZ2l0aHViLWRhcmsnIH0sXHJcbiAgY29uZmlnOiAobWQpID0+IHtcclxuICAgIG1kLnVzZShmb290bm90ZSk7XHJcbiAgICBtZC51c2UobWF0aGpheDMpO1xyXG4gICAgbWQudXNlKGNvbnRhaW5lclByZXZpZXcpO1xyXG4gICAgbWQudXNlKGNvbXBvbmVudFByZXZpZXcpO1xyXG4gICAgLy8gbWQudXNlKHRhYnNNYXJrZG93blBsdWdpbik7XHJcbiAgICAvLyBtZC51c2UobnBtQ29tbWFuZHNNYXJrZG93blBsdWdpbik7XHJcbiAgICAvLyBtZC51c2UoZGV0eXBlTWFya2Rvd25QbHVnaW4pO1xyXG4gICAgLy8gdXNlIG1vcmUgbWFya2Rvd24taXQgcGx1Z2lucyFcclxuICAgIG1kLnVzZShtZEl0Q3VzdG9tQXR0cnMsIFwiaW1hZ2VcIiwge1xyXG4gICAgICBcImRhdGEtZmFuY3lib3hcIjogXCJnYWxsZXJ5XCIsXHJcbiAgICB9KTtcclxuICAgIG1kLnVzZSh0aW1lbGluZSk7XHJcbiAgICBtZFxyXG4gICAgICAvLyB0aGUgc2Vjb25kIHBhcmFtZXRlciBpcyBodG1sIHRhZyBuYW1lXHJcbiAgICAgIC51c2UoY29udGFpbmVyLCAnc2FuZGJveCcsIHtcclxuICAgICAgICByZW5kZXIgKHRva2VuczogYW55LCBpZHg6IGFueSkge1xyXG4gICAgICAgICAgcmV0dXJuIHJlbmRlclNhbmRib3godG9rZW5zLCBpZHgsICdzYW5kYm94Jyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgLy8gXHU1NzI4XHU2MjQwXHU2NzA5XHU2NTg3XHU2ODYzXHU3Njg0PGgxPlx1NjgwN1x1N0I3RVx1NTQwRVx1NkRGQlx1NTJBMDxBcnRpY2xlTWV0YWRhdGEvPlx1N0VDNFx1NEVGNlxyXG4gICAgbWQucmVuZGVyZXIucnVsZXMuaGVhZGluZ19jbG9zZSA9ICh0b2tlbnMsIGlkeCwgb3B0aW9ucywgZW52LCBzbGYpID0+IHtcclxuICAgICAgbGV0IGh0bWxSZXN1bHQgPSBzbGYucmVuZGVyVG9rZW4odG9rZW5zLCBpZHgsIG9wdGlvbnMpO1xyXG4gICAgICBpZiAodG9rZW5zW2lkeF0udGFnID09PSAnaDEnKSB7XHJcbiAgICAgICAgaHRtbFJlc3VsdCArPSBgXFxuPENsaWVudE9ubHk+PEFydGljbGVNZXRhZGF0YSA6ZnJvbnRtYXR0ZXI9XCIkZnJvbnRtYXR0ZXJcIi8+PC9DbGllbnRPbmx5PmBcclxuICAgICAgfVxyXG4gICAgICAvLyBpZiAodG9rZW5zW2lkeF0udGFnID09PSAnaDEnKSBodG1sUmVzdWx0ICs9IGBcXG48Q2xpZW50T25seT48QXJ0aWNsZU1ldGFkYXRhIHYtaWY9XCIoJGZyb250bWF0dGVyPy5hc2lkZSA/PyB0cnVlKSAmJiAoJGZyb250bWF0dGVyPy5zaG93QXJ0aWNsZU1ldGFkYXRhID8/IHRydWUpXCIgOmFydGljbGU9XCIkZnJvbnRtYXR0ZXJcIiAvPjwvQ2xpZW50T25seT5gO1xyXG4gICAgICByZXR1cm4gaHRtbFJlc3VsdDtcclxuICAgIH1cclxuICB9LFxyXG59XHJcblxyXG5leHBvcnQge1xyXG4gIG1hcmtkb3duXHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXGRlZmF1bHRzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL2RlZmF1bHRzLnRzXCI7aW1wb3J0IHsgRGVmYXVsdFRoZW1lLCBVc2VyQ29uZmlnIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG5pbXBvcnQgeyBtYXJrZG93biB9IGZyb20gXCIuL21hcmtkb3duXCI7XHJcblxyXG5jb25zdCBkZWZhdWx0Q29uZmlnOiBVc2VyQ29uZmlnPERlZmF1bHRUaGVtZS5Db25maWc+ID0ge1xyXG4gIHRpdGxlOiBcIkNNT05PLk5FVFwiLFxyXG4gIGRlc2NyaXB0aW9uOiBcIlx1NEUyQVx1NEVCQVx1NTcyOFx1N0VCRlwiLFxyXG4gIGFwcGVhcmFuY2U6IGZhbHNlLFxyXG4gIGhlYWQ6IFtcclxuICAgIFtcImxpbmtcIiwgeyByZWw6IFwiaWNvblwiLCB0eXBlOiBcImltYWdlL3N2Zyt4bWxcIiwgaHJlZjogXCIvZmF2aWNvbi5zdmdcIiB9XSxcclxuICAgIFtcImxpbmtcIiwgeyByZWw6IFwiaWNvblwiLCB0eXBlOiBcImltYWdlL3gtaWNvblwiLCBocmVmOiBcIi9mYXZpY29uLmljb1wiIH1dLFxyXG4gICAgW1xyXG4gICAgICBcImxpbmtcIixcclxuICAgICAge1xyXG4gICAgICAgIHJlbDogXCJzdHlsZXNoZWV0XCIsXHJcbiAgICAgICAgaHJlZjogXCIvZmFuY3lib3guY3NzXCIsXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG4gICAgW1xyXG4gICAgICBcInNjcmlwdFwiLFxyXG4gICAgICB7XHJcbiAgICAgICAgc3JjOiBcIi9mYW5jeWJveC51bWQuanNcIixcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgICAvLyBcdThCQkVcdTdGNkUgXHU2M0NGXHU4RkYwIFx1NTQ4QyBcdTUxNzNcdTk1MkVcdThCQ0RcclxuICAgIFtcclxuICAgICAgXCJtZXRhXCIsXHJcbiAgICAgIHsgbmFtZTogXCJrZXl3b3Jkc1wiLCBjb250ZW50OiBcInJlYWN0IHJlYWN0LWFkbWluIGFudCBcdTU0MEVcdTUzRjBcdTdCQTFcdTc0MDZcdTdDRkJcdTdFREZcIiB9LFxyXG4gICAgXSxcclxuICAgIFtcclxuICAgICAgXCJtZXRhXCIsXHJcbiAgICAgIHtcclxuICAgICAgICBuYW1lOiBcImRlc2NyaXB0aW9uXCIsXHJcbiAgICAgICAgY29udGVudDpcclxuICAgICAgICAgIFwiXHU2QjY0XHU2ODQ2XHU2N0I2XHU0RjdGXHU3NTI4XHU0RTBFXHU0RThDXHU2QjIxXHU1RjAwXHU1M0QxXHVGRjBDXHU1MjREXHU3QUVGXHU2ODQ2XHU2N0I2XHU0RjdGXHU3NTI4cmVhY3RcdUZGMENVSVx1Njg0Nlx1NjdCNlx1NEY3Rlx1NzUyOGFudC1kZXNpZ25cdUZGMENcdTUxNjhcdTVDNDBcdTY1NzBcdTYzNkVcdTcyQjZcdTYwMDFcdTdCQTFcdTc0MDZcdTRGN0ZcdTc1MjhyZWR1eFx1RkYwQ2FqYXhcdTRGN0ZcdTc1MjhcdTVFOTNcdTRFM0FheGlvc1x1MzAwMlx1NzUyOFx1NEU4RVx1NUZFQlx1OTAxRlx1NjQyRFx1NUVGQVx1NEUyRFx1NTQwRVx1NTNGMFx1OTg3NVx1OTc2Mlx1MzAwMlwiLFxyXG4gICAgICB9LFxyXG4gICAgXSxcclxuICBdLFxyXG4gIG1hcmtkb3duLFxyXG4gIGlnbm9yZURlYWRMaW5rczogW1xyXG4gICAgLy8gaWdub3JlIGV4YWN0IHVybCBcIi9wbGF5Z3JvdW5kXCJcclxuICAgIFwiL3BsYXlncm91bmRcIixcclxuICAgIC8vIGlnbm9yZSBhbGwgbG9jYWxob3N0IGxpbmtzXHJcbiAgICAvXmh0dHBzPzpcXC9cXC9sb2NhbGhvc3QvLFxyXG4gICAgLy8gaWdub3JlIGFsbCBsaW5rcyBpbmNsdWRlIFwiL3JlcGwvXCJcIlxyXG4gICAgL1xcL3JlcGxcXC8vLFxyXG4gICAgLy8gY3VzdG9tIGZ1bmN0aW9uLCBpZ25vcmUgYWxsIGxpbmtzIGluY2x1ZGUgXCJpZ25vcmVcIlxyXG4gICAgKHVybCkgPT4ge1xyXG4gICAgICByZXR1cm4gdXJsLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoXCJpZ25vcmVcIik7XHJcbiAgICB9LFxyXG4gIF0sXHJcbn07XHJcblxyXG5leHBvcnQgeyBkZWZhdWx0Q29uZmlnIH07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxoZWFkLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL2hlYWQudHNcIjtpbXBvcnQgdHlwZSB7IEhlYWRDb25maWcgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgaGVhZDogSGVhZENvbmZpZ1tdID0gW1xyXG4gIC8vIFtcImxpbmtcIiwgeyByZWw6IFwiaWNvblwiLCB0eXBlOiBcImltYWdlL3N2Zyt4bWxcIiwgaHJlZjogXCIvZmF2aWNvbi5zdmdcIiB9XSxcclxuICBbXCJsaW5rXCIsIHsgcmVsOiBcImljb25cIiwgdHlwZTogXCJpbWFnZS94LWljb25cIiwgaHJlZjogXCIvZmF2aWNvbi5pY29cIiB9XSxcclxuICBbXHJcbiAgICBcImxpbmtcIixcclxuICAgIHtcclxuICAgICAgcmVsOiBcInN0eWxlc2hlZXRcIixcclxuICAgICAgaHJlZjogXCIvZm9udC5jc3NcIixcclxuICAgIH0sXHJcbiAgXSxcclxuICBbXCJtZXRhXCIsIHsgbmFtZTogXCJyZWZlcnJlclwiLCBjb250ZW50OiBcIm5vLXJlZmVycmVyXCIgfV0sXHJcbiAgW1xyXG4gICAgXCJzY3JpcHRcIixcclxuICAgIHtcclxuICAgICAgc3JjOiBcIi9jbGFyaXR5LmpzXCIsXHJcbiAgICB9LFxyXG4gIF0sXHJcbiAgW1xyXG4gICAgXCJzY3JpcHRcIixcclxuICAgIHtcclxuICAgICAgc3JjOiBcIi9jdXJzb3IuanNcIixcclxuICAgICAgXCJkYXRhLXNpdGVcIjogXCJodHRwczovL2NoYW5nd2VpaHVhLmdpdGh1Yi5pb1wiLFxyXG4gICAgICBcImRhdGEtc3BhXCI6IFwiYXV0b1wiLFxyXG4gICAgICBkZWZlcjogXCJcIixcclxuICAgIH0sXHJcbiAgXSxcclxuICAvLyBcdThCQkVcdTdGNkUgXHU2M0NGXHU4RkYwIFx1NTQ4QyBcdTUxNzNcdTk1MkVcdThCQ0RcclxuICBbXHJcbiAgICBcIm1ldGFcIixcclxuICAgIHtcclxuICAgICAgbmFtZTogXCJrZXl3b3Jkc1wiLFxyXG4gICAgICBjb250ZW50OlxyXG4gICAgICAgIFwiY2hhbmd3ZWlodWEgXHU1RTM4XHU0RjFGXHU1MzRFIHZpdGVwcmVzcyBjbW9uby5uZXQgY2hhbmd3ZWlodWEuZ2l0aHViLmlvIFx1NEUyQVx1NEVCQVx1N0Y1MVx1N0FEOVwiLFxyXG4gICAgfSxcclxuICBdLFxyXG4gIFtcclxuICAgIFwibWV0YVwiLFxyXG4gICAge1xyXG4gICAgICBuYW1lOiBcImRlc2NyaXB0aW9uXCIsXHJcbiAgICAgIGNvbnRlbnQ6XHJcbiAgICAgICAgXCJcdTZCNjRcdTdDRkJcdTdFREZcdTU3RkFcdTRFOEV2aXRlcHJlc3NcdTRFOENcdTZCMjFcdTVGMDBcdTUzRDFcdUZGMENcdTUyNERcdTdBRUZcdTY4NDZcdTY3QjZcdTRGN0ZcdTc1Mjh2dWVqc1x1RkYwQ1VJXHU2ODQ2XHU2N0I2XHU0RjdGXHU3NTI4YW50LWRlc2lnblx1RkYwQ1x1NTE2OFx1NUM0MFx1NjU3MFx1NjM2RVx1NzJCNlx1NjAwMVx1N0JBMVx1NzQwNlx1NEY3Rlx1NzUyOHBhaW5hXHVGRjBDYWpheFx1NEY3Rlx1NzUyOFx1NUU5M1x1NEUzQWZldGNoXHUzMDAyXHU3NTI4XHU0RThFXHU1RkVCXHU5MDFGXHU2NDJEXHU1RUZBXHU0RTJBXHU0RUJBXHU3RjUxXHU3QUQ5XHU1NDhDXHU1MTg1XHU1QkI5XHU3QkExXHU3NDA2XHU1RTczXHU1M0YwXHUzMDAyXCIsXHJcbiAgICB9LFxyXG4gIF0sXHJcbl07XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxuYXZzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcc3JjXFxcXG5hdnNcXFxcemgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvbmF2cy96aC50c1wiO2ltcG9ydCB7IERlZmF1bHRUaGVtZSB9IGZyb20gXCJ2aXRlcHJlc3NcIjtcclxuLy8gYWN0aXZlTWF0Y2g6IFwiXi9ndWlkZS9cIixcclxuY29uc3QgbmF2OiBEZWZhdWx0VGhlbWUuTmF2SXRlbVtdIHwgdW5kZWZpbmVkID0gW1xyXG4gIHsgdGV4dDogXCJcdTk5OTZcdTk4NzVcIiwgbGluazogXCIvXCIsIGFjdGl2ZU1hdGNoOiBcIl4vJHxeL2luZGV4L1wiIH0sXHJcbiAge1xyXG4gICAgdGV4dDogXCJcdTUzNUFcdTVCQTJcIixcclxuICAgIGxpbms6IFwiL2Jsb2cvXCIsXHJcbiAgICBhY3RpdmVNYXRjaDogXCJeL2Jsb2cvXCIsXHJcbiAgfSxcclxuICB7XHJcbiAgICB0ZXh0OiBcIlx1OEJGRVx1N0EwQlwiLFxyXG4gICAgbGluazogXCIvY291cnNlL1wiLFxyXG4gICAgYWN0aXZlTWF0Y2g6IFwiXi9jb3Vyc2UvXCIsXHJcbiAgfSxcclxuICB7XHJcbiAgICB0ZXh0OiBcIlx1NTE3M1x1NEU4RVwiLFxyXG4gICAgbGluazogXCIvYWJvdXQvaW5kZXgubWRcIixcclxuICAgIGFjdGl2ZU1hdGNoOiBcIl4vYWJvdXQvXCIsXHJcbiAgfSxcclxuICB7XHJcbiAgICB0ZXh0OiBcIlx1NjU4N1x1N0FFMFx1NTIwNlx1N0M3QlwiLFxyXG4gICAgaXRlbXM6IFtcclxuICAgICAge1xyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7IHRleHQ6IFwiM0QgXHU1RjAwXHU1M0QxXCIsIGxpbms6IFwiL2NhdGVnb3J5L3RocmVlM2QubWRcIiB9LFxyXG4gICAgICAgICAgeyB0ZXh0OiBcIlx1NURFNVx1NTE3NyZcdTVFNzNcdTUzRjBcIiwgbGluazogXCIvY2F0ZWdvcnkvdG9vbC5tZFwiIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7IHRleHQ6IFwiRmx1dHRlclwiLCBsaW5rOiBcIi9jYXRlZ29yeS9mbHV0dGVyLm1kXCIgfSxcclxuICAgICAgICAgIHsgdGV4dDogXCJcdTVGQUVcdTRGRTFcdTVDMEZcdTdBMEJcdTVFOEZcIiwgbGluazogXCIvY2F0ZWdvcnkvd2VjaGF0Lm1kXCIgfSxcclxuICAgICAgICAgIHsgdGV4dDogXCJEb3RORVRcIiwgbGluazogXCIvY2F0ZWdvcnkvZG90bmV0Lm1kXCIgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgIHsgdGV4dDogXCJWdWVKU1wiLCBsaW5rOiBcIi9jYXRlZ29yeS92dWUubWRcIiB9LFxyXG4gICAgICAgICAgeyB0ZXh0OiBcIlR5cGVTY3JpcHRcIiwgbGluazogXCIvY2F0ZWdvcnkvdHlwZXNjcmlwdC5tZFwiIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIF0sXHJcbiAgfSxcclxuXTtcclxuXHJcbmV4cG9ydCB7IG5hdiB9O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgbmF2O1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxzcmNcXFxcY29uZmlnc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxjb25maWdzXFxcXHpoLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9HaXRodWIvY2hhbmd3ZWlodWEuZ2l0aHViLmlvLy52aXRlcHJlc3Mvc3JjL2NvbmZpZ3MvemgudHNcIjtpbXBvcnQgdHlwZSB7IERlZmF1bHRUaGVtZSwgTG9jYWxlU3BlY2lmaWNDb25maWcgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcblxyXG4vL1x1NUYxNVx1NTE2NVx1NEVFNVx1NEUwQVx1OTE0RFx1N0Y2RSBcdTY2MkZcdTgyRjFcdTY1ODdcdTc1NENcdTk3NjJcdTk3MDBcdTg5ODFcdTRGRUVcdTY1Mzl6aFx1NEUzQWVuXHJcbmltcG9ydCB7bmF2fSBmcm9tIFwiLi4vbmF2cy96aFwiO1xyXG5pbXBvcnQgeyBzaWRlYmFyIH0gZnJvbSBcIi4uL3NpZGViYXJzL3poXCI7XHJcblxyXG5leHBvcnQgY29uc3QgemhDb25maWc6IExvY2FsZVNwZWNpZmljQ29uZmlnPERlZmF1bHRUaGVtZS5Db25maWc+ID0ge1xyXG4gIHRoZW1lQ29uZmlnOiB7XHJcbiAgICBsb2dvOiBcIi9sb2dvLnBuZ1wiLFxyXG4gICAgbGFzdFVwZGF0ZWRUZXh0OiBcIlx1NEUwQVx1NkIyMVx1NjZGNFx1NjVCMFwiLFxyXG4gICAgcmV0dXJuVG9Ub3BMYWJlbDogXCJcdThGRDRcdTU2REVcdTk4NzZcdTkwRThcIixcclxuICAgIC8vIFx1NjU4N1x1Njg2M1x1OTg3NVx1ODExQVx1NjU4N1x1NjcyQ1x1OTE0RFx1N0Y2RVxyXG4gICAgZG9jRm9vdGVyOiB7XHJcbiAgICAgIHByZXY6IFwiXHU0RTBBXHU0RTAwXHU5ODc1XCIsXHJcbiAgICAgIG5leHQ6IFwiXHU0RTBCXHU0RTAwXHU5ODc1XCIsXHJcbiAgICB9LFxyXG4gICAgZm9vdGVyOiB7XHJcbiAgICAgIG1lc3NhZ2U6IFwiTUlUIExpY2Vuc2VkXCIsXHJcbiAgICAgIGNvcHlyaWdodDogXCJDb3B5cmlnaHQgXHUwMEE5IDIwMDktMjAyMyBDTU9OTy5ORVRcIixcclxuICAgIH0sXHJcbiAgICAvLyAgIGVkaXRMaW5rOiB7XHJcbiAgICAvLyAgICAgcGF0dGVybjogJ1x1OERFRlx1NUY4NFx1NTczMFx1NTc0MCcsXHJcbiAgICAvLyAgICAgdGV4dDogJ1x1NUJGOVx1NjcyQ1x1OTg3NVx1NjNEMFx1NTFGQVx1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRScsXHJcbiAgICAvLyAgIH0sXHJcbiAgICBuYXY6IG5hdixcclxuICAgIHNpZGViYXIsXHJcbiAgICBvdXRsaW5lOiB7XHJcbiAgICAgIGxldmVsOiBcImRlZXBcIiwgLy8gXHU1M0YzXHU0RkE3XHU1OTI3XHU3RUIyXHU2ODA3XHU5ODk4XHU1QzQyXHU3RUE3XHJcbiAgICAgIGxhYmVsOiBcIlx1NzZFRVx1NUY1NVwiLCAvLyBcdTUzRjNcdTRGQTdcdTU5MjdcdTdFQjJcdTY4MDdcdTk4OThcdTY1ODdcdTY3MkNcdTkxNERcdTdGNkVcclxuICAgIH0sXHJcbiAgfSxcclxufTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFxjb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9jb25maWcudHNcIjtpbXBvcnQgeyB0aGVtZUNvbmZpZyB9IGZyb20gXCIuL3NyYy90aGVtZVwiO1xyXG5pbXBvcnQgeyBkZWZhdWx0Q29uZmlnIH0gZnJvbSBcIi4vc3JjL2RlZmF1bHRzXCI7XHJcbmltcG9ydCB7IGhlYWQgfSBmcm9tIFwiLi9zcmMvaGVhZFwiO1xyXG4vL1x1OTE0RFx1N0Y2RVx1NzY4NFx1NEUyRFx1NjU4N1x1NjU4N1x1Njg2M1x1OEJCRVx1N0Y2RVxyXG5pbXBvcnQgeyB6aENvbmZpZyB9IGZyb20gXCIuL3NyYy9jb25maWdzL3poXCI7XHJcbmltcG9ydCB7IFJzc1BsdWdpbiB9IGZyb20gXCJ2aXRlcHJlc3MtcGx1Z2luLXJzc1wiO1xyXG5pbXBvcnQgeyBSU1MgfSBmcm9tIFwiLi9zcmMvcnNzXCI7XHJcbmltcG9ydCB7IG1hcmtkb3duIH0gZnJvbSBcIi4vc3JjL21hcmtkb3duXCI7XHJcbmltcG9ydCB7IHdpdGhNZXJtYWlkIH0gZnJvbSBcInZpdGVwcmVzcy1wbHVnaW4tbWVybWFpZFwiO1xyXG5pbXBvcnQgeyBIZWFkQ29uZmlnIH0gZnJvbSBcInZpdGVwcmVzc1wiO1xyXG5pbXBvcnQgeyBoYW5kbGVIZWFkTWV0YSB9IGZyb20gXCIuL3V0aWxzL2hhbmRsZUhlYWRNZXRhXCI7XHJcbmltcG9ydCBHaXRSZXZpc2lvbkluZm9QbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tZ2l0LXJldmlzaW9uLWluZm8nO1xyXG5cclxuLy8gaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gXCJ2aXRlcHJlc3MtcGx1Z2luLWNvbXByZXNzaW9uXCI7XHJcbi8vIGltcG9ydCBBdXRvSW5kZXggZnJvbSAndml0ZS1wbHVnaW4tdml0ZXByZXNzLWF1dG8taW5kZXgnO1xyXG5cclxuLy8gaW1wb3J0IHsgY3JlYXRlRGV0eXBlUGx1Z2luIH0gZnJvbSAndml0ZXByZXNzLXBsdWdpbi1kZXR5cGUnXHJcbi8vIGNvbnN0IHsgZGV0eXBlVml0ZVBsdWdpbiB9ID0gY3JlYXRlRGV0eXBlUGx1Z2luKClcclxuXHJcbmNvbnN0IGxpbmtzOiBhbnlbXSA9IFtdO1xyXG5jb25zdCBjdXN0b21FbGVtZW50cyA9IFtcclxuICBcIm1qeC1jb250YWluZXJcIixcclxuICBcIm1qeC1hc3Npc3RpdmUtbW1sXCIsXHJcbiAgXCJtYXRoXCIsXHJcbiAgXCJtYWN0aW9uXCIsXHJcbiAgXCJtYWxpZ25ncm91cFwiLFxyXG4gIFwibWFsaWdubWFya1wiLFxyXG4gIFwibWVuY2xvc2VcIixcclxuICBcIm1lcnJvclwiLFxyXG4gIFwibWZlbmNlZFwiLFxyXG4gIFwibWZyYWNcIixcclxuICBcIm1pXCIsXHJcbiAgXCJtbG9uZ2RpdlwiLFxyXG4gIFwibW11bHRpc2NyaXB0c1wiLFxyXG4gIFwibW5cIixcclxuICBcIm1vXCIsXHJcbiAgXCJtb3ZlclwiLFxyXG4gIFwibXBhZGRlZFwiLFxyXG4gIFwibXBoYW50b21cIixcclxuICBcIm1yb290XCIsXHJcbiAgXCJtcm93XCIsXHJcbiAgXCJtc1wiLFxyXG4gIFwibXNjYXJyaWVzXCIsXHJcbiAgXCJtc2NhcnJ5XCIsXHJcbiAgXCJtc2NhcnJpZXNcIixcclxuICBcIm1zZ3JvdXBcIixcclxuICBcIm1zdGFja1wiLFxyXG4gIFwibWxvbmdkaXZcIixcclxuICBcIm1zbGluZVwiLFxyXG4gIFwibXN0YWNrXCIsXHJcbiAgXCJtc3BhY2VcIixcclxuICBcIm1zcXJ0XCIsXHJcbiAgXCJtc3Jvd1wiLFxyXG4gIFwibXN0YWNrXCIsXHJcbiAgXCJtc3RhY2tcIixcclxuICBcIm1zdHlsZVwiLFxyXG4gIFwibXN1YlwiLFxyXG4gIFwibXN1cFwiLFxyXG4gIFwibXN1YnN1cFwiLFxyXG4gIFwibXRhYmxlXCIsXHJcbiAgXCJtdGRcIixcclxuICBcIm10ZXh0XCIsXHJcbiAgXCJtdHJcIixcclxuICBcIm11bmRlclwiLFxyXG4gIFwibXVuZGVyb3ZlclwiLFxyXG4gIFwic2VtYW50aWNzXCIsXHJcbiAgXCJtYXRoXCIsXHJcbiAgXCJtaVwiLFxyXG4gIFwibW5cIixcclxuICBcIm1vXCIsXHJcbiAgXCJtc1wiLFxyXG4gIFwibXNwYWNlXCIsXHJcbiAgXCJtdGV4dFwiLFxyXG4gIFwibWVuY2xvc2VcIixcclxuICBcIm1lcnJvclwiLFxyXG4gIFwibWZlbmNlZFwiLFxyXG4gIFwibWZyYWNcIixcclxuICBcIm1wYWRkZWRcIixcclxuICBcIm1waGFudG9tXCIsXHJcbiAgXCJtcm9vdFwiLFxyXG4gIFwibXJvd1wiLFxyXG4gIFwibXNxcnRcIixcclxuICBcIm1zdHlsZVwiLFxyXG4gIFwibW11bHRpc2NyaXB0c1wiLFxyXG4gIFwibW92ZXJcIixcclxuICBcIm1wcmVzY3JpcHRzXCIsXHJcbiAgXCJtc3ViXCIsXHJcbiAgXCJtc3Vic3VwXCIsXHJcbiAgXCJtc3VwXCIsXHJcbiAgXCJtdW5kZXJcIixcclxuICBcIm11bmRlcm92ZXJcIixcclxuICBcIm5vbmVcIixcclxuICBcIm1hbGlnbmdyb3VwXCIsXHJcbiAgXCJtYWxpZ25tYXJrXCIsXHJcbiAgXCJtdGFibGVcIixcclxuICBcIm10ZFwiLFxyXG4gIFwibXRyXCIsXHJcbiAgXCJtbG9uZ2RpdlwiLFxyXG4gIFwibXNjYXJyaWVzXCIsXHJcbiAgXCJtc2NhcnJ5XCIsXHJcbiAgXCJtc2dyb3VwXCIsXHJcbiAgXCJtc2xpbmVcIixcclxuICBcIm1zcm93XCIsXHJcbiAgXCJtc3RhY2tcIixcclxuICBcIm1hY3Rpb25cIixcclxuICBcInNlbWFudGljc1wiLFxyXG4gIFwiYW5ub3RhdGlvblwiLFxyXG4gIFwiYW5ub3RhdGlvbi14bWxcIixcclxuXTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHdpdGhNZXJtYWlkKHtcclxuICBtZXJtYWlkOiB7XHJcbiAgICAvL21lcm1haWRDb25maWcgIXRoZW1lIGhlcmUgd29ya3MgZm9yIGxpZ3RoIG1vZGUgc2luY2UgZGFyayB0aGVtZSBpcyBmb3JjZWQgaW4gZGFyayBtb2RlXHJcbiAgfSxcclxuICB2aXRlOiB7XHJcbiAgICAvLyBcdTIxOTNcdTIxOTNcdTIxOTNcdTIxOTNcdTIxOTNcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgUnNzUGx1Z2luKFJTUyksXHJcbiAgICAgIEdpdFJldmlzaW9uSW5mb1BsdWdpbigpXHJcbiAgICAgIC8vIHtcclxuICAgICAgLy8gICAuLi5BdXRvSW5kZXgoe30pLFxyXG4gICAgICAvLyAgIGVuZm9yY2U6ICdwcmUnXHJcbiAgICAgIC8vIH0sXHJcbiAgICAgIC8vIGRldHlwZVZpdGVQbHVnaW4oKSxcclxuICAgICAgLy8gZGV0eXBlTWFya2Rvd25QbHVnaW4oKSxcclxuICAgICAgLy8gcmVxdWlyZShcIi4vcGx1Z2lucy9mcm9udG1hdHRlclwiKVxyXG4gICAgXSxcclxuICAgIC8vIFx1MjE5MVx1MjE5MVx1MjE5MVx1MjE5MVx1MjE5MVxyXG4gIH0sXHJcbiAgdnVlOiB7XHJcbiAgICB0ZW1wbGF0ZToge1xyXG4gICAgICBjb21waWxlck9wdGlvbnM6IHtcclxuICAgICAgICBpc0N1c3RvbUVsZW1lbnQ6ICh0YWcpID0+IGN1c3RvbUVsZW1lbnRzLmluY2x1ZGVzKHRhZyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgLi4uZGVmYXVsdENvbmZpZyxcclxuICAvKiBcdTY4MDdcdTU5MzRcdTkxNERcdTdGNkUgKi9cclxuICBoZWFkLFxyXG4gIC8qIFx1NEUzQlx1OTg5OFx1OTE0RFx1N0Y2RSAqL1xyXG4gIHRoZW1lQ29uZmlnLFxyXG4gIC8qIFx1OEJFRFx1OEEwMFx1OTE0RFx1N0Y2RSAqL1xyXG4gIGxvY2FsZXM6IHtcclxuICAgIHJvb3Q6IHsgbGFiZWw6IFwiXHU3QjgwXHU0RjUzXHU0RTJEXHU2NTg3XCIsIGxhbmc6IFwiemgtQ05cIiwgbGluazogXCIvXCIsIC4uLnpoQ29uZmlnIH0sXHJcbiAgICAvLyBlbjogeyBsYWJlbDogXCJFbmdsaXNoXCIsIGxhbmc6IFwiZW4tVVNcIiwgbGluazogXCIvZW4vXCIsIC4uLmVuQ29uZmlnIH0sXHJcbiAgfSxcclxuICBsYXN0VXBkYXRlZDogZmFsc2UsXHJcbiAgLy8gdGl0bGVUZW1wbGF0ZTogJzp0aXRsZSAtIEN1c3RvbSBTdWZmaXgnLFxyXG4gIHNpdGVtYXA6IHtcclxuICAgIGhvc3RuYW1lOiBcImh0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvXCIsXHJcbiAgICBsYXN0bW9kRGF0ZU9ubHk6IGZhbHNlLFxyXG4gICAgdHJhbnNmb3JtSXRlbXM6IChpdGVtcykgPT4ge1xyXG4gICAgICAvLyBhZGQgbmV3IGl0ZW1zIG9yIG1vZGlmeS9maWx0ZXIgZXhpc3RpbmcgaXRlbXNcclxuICAgICAgaXRlbXMucHVzaCh7XHJcbiAgICAgICAgdXJsOiBcIi9leHRyYS1wYWdlXCIsXHJcbiAgICAgICAgY2hhbmdlZnJlcTogXCJtb250aGx5XCIsXHJcbiAgICAgICAgcHJpb3JpdHk6IDAuOCxcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBpdGVtcztcclxuICAgIH0sXHJcbiAgfSxcclxuICB0cmFuc2Zvcm1IdG1sOiAoXywgaWQsIHsgcGFnZURhdGEgfSkgPT4ge1xyXG4gICAgaWYgKCEvW1xcXFwvXTQwNFxcLmh0bWwkLy50ZXN0KGlkKSkge1xyXG4gICAgICBsaW5rcy5wdXNoKHtcclxuICAgICAgICB1cmw6IHBhZ2VEYXRhLnJlbGF0aXZlUGF0aFxyXG4gICAgICAgICAgLnJlcGxhY2UoL1xcL2luZGV4XFwubWQkLywgXCIvXCIpXHJcbiAgICAgICAgICAucmVwbGFjZSgvXFwubWQkLywgXCIuaHRtbFwiKSxcclxuICAgICAgICBsYXN0bW9kOiBwYWdlRGF0YS5sYXN0VXBkYXRlZCxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuICBpZ25vcmVEZWFkTGlua3M6IHRydWUsXHJcbiAgbWFya2Rvd24sXHJcbiAgYXN5bmMgYnVpbGRFbmQoKSB7XHJcbiAgICBjb25zb2xlLmxvZygnYnVpbGRFbmQnKVxyXG4gICAgLy8gY29tcHJlc3Npb24oKTtcclxuICB9LFxyXG4gIGFzeW5jIHRyYW5zZm9ybUhlYWQoY29udGV4dCk6IFByb21pc2U8SGVhZENvbmZpZ1tdPiB7XHJcblxyXG4gICAgY29uc3QgaGVhZCA9IGhhbmRsZUhlYWRNZXRhKGNvbnRleHQpXHJcblxyXG4gICAgcmV0dXJuIGhlYWRcclxuICB9LFxyXG4gIC8vIGJ1aWxkRW5kOiBnZW5GZWVkXHJcbiAgLy8gbWFya2Rvd246IHtcclxuICAvLyAgIC8vIC4uLlxyXG4gIC8vICAgY29uZmlnOiAobWQpID0+IHtcclxuICAvLyAgICAgbWQudXNlKHRpbWVsaW5lKTtcclxuICAvLyAgICAgbWQudXNlKGZvb3Rub3RlKTtcclxuICAvLyAgICAgbWQudXNlKG1hdGhqYXgzKTtcclxuICAvLyAgIH0sXHJcbiAgLy8gfSxcclxuICAvLyB0cmFuc2Zvcm1IdG1sOiAoXywgaWQsIHsgcGFnZURhdGEgfSkgPT4ge1xyXG4gIC8vICAgaWYgKCEvW1xcXFwvXTQwNFxcLmh0bWwkLy50ZXN0KGlkKSlcclxuICAvLyAgICAgbGlua3MucHVzaCh7XHJcbiAgLy8gICAgICAgLy8geW91IG1pZ2h0IG5lZWQgdG8gY2hhbmdlIHRoaXMgaWYgbm90IHVzaW5nIGNsZWFuIHVybHMgbW9kZVxyXG4gIC8vICAgICAgIHVybDogcGFnZURhdGEucmVsYXRpdmVQYXRoLnJlcGxhY2UoLygoXnxcXC8paW5kZXgpP1xcLm1kJC8sIFwiJDJcIiksXHJcbiAgLy8gICAgICAgbGFzdG1vZDogcGFnZURhdGEubGFzdFVwZGF0ZWQsXHJcbiAgLy8gICAgIH0pO1xyXG4gIC8vIH0sXHJcbiAgLy8gYnVpbGRFbmQ6IGFzeW5jICh7IG91dERpciB9KSA9PiB7XHJcbiAgLy8gICBjb25zdCBzaXRlbWFwID0gbmV3IFNpdGVtYXBTdHJlYW0oe1xyXG4gIC8vICAgICBob3N0bmFtZTogXCJodHRwczovL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby9cIixcclxuICAvLyAgIH0pO1xyXG4gIC8vICAgY29uc3Qgd3JpdGVTdHJlYW0gPSBjcmVhdGVXcml0ZVN0cmVhbShyZXNvbHZlKG91dERpciwgXCJzaXRlbWFwLnhtbFwiKSk7XHJcbiAgLy8gICBzaXRlbWFwLnBpcGUod3JpdGVTdHJlYW0pO1xyXG4gIC8vICAgbGlua3MuZm9yRWFjaCgobGluaykgPT4gc2l0ZW1hcC53cml0ZShsaW5rKSk7XHJcbiAgLy8gICBzaXRlbWFwLmVuZCgpO1xyXG4gIC8vICAgYXdhaXQgbmV3IFByb21pc2UoKHIpID0+IHdyaXRlU3RyZWFtLm9uKFwiZmluaXNoXCIsIHIpKTtcclxuICAvLyB9LFxyXG4gIC8vIG9wdGlvbmFsbHksIHlvdSBjYW4gcGFzcyBNZXJtYWlkQ29uZmlnXHJcbiAgLy8gbWVybWFpZDoge1xyXG4gIC8vICAgLy8gcmVmZXIgaHR0cHM6Ly9tZXJtYWlkLmpzLm9yZy9jb25maWcvc2V0dXAvbW9kdWxlcy9tZXJtYWlkQVBJLmh0bWwjbWVybWFpZGFwaS1jb25maWd1cmF0aW9uLWRlZmF1bHRzIGZvciBvcHRpb25zXHJcbiAgLy8gfSxcclxuICAvLyBvcHRpb25hbGx5IHNldCBhZGRpdGlvbmFsIGNvbmZpZyBmb3IgcGx1Z2luIGl0c2VsZiB3aXRoIE1lcm1haWRQbHVnaW5Db25maWdcclxuICAvLyBtZXJtYWlkUGx1Z2luOiB7XHJcbiAgLy8gICBjbGFzczogXCJtZXJtYWlkIG15LWNsYXNzXCIsIC8vIHNldCBhZGRpdGlvbmFsIGNzcyBjbGFzc2VzIGZvciBwYXJlbnQgY29udGFpbmVyXHJcbiAgLy8gfSxcclxufSk7XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0aHViXFxcXGNoYW5nd2VpaHVhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXFxcXHNyY1xcXFxyc3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdGh1Yi9jaGFuZ3dlaWh1YS5naXRodWIuaW8vLnZpdGVwcmVzcy9zcmMvcnNzLnRzXCI7aW1wb3J0IHsgUlNTT3B0aW9ucyB9IGZyb20gJ3ZpdGVwcmVzcy1wbHVnaW4tcnNzJ1xyXG4vLyBjb25zdCBiYXNlVXJsID0gJ2h0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvJ1xyXG5jb25zdCBSU1M6IFJTU09wdGlvbnMgPSB7XHJcbiAgLy8gbmVjZXNzYXJ5XHVGRjA4XHU1RkM1XHU5MDA5XHU1M0MyXHU2NTcwXHVGRjA5XHJcbiAgdGl0bGU6ICdDTU9OTy5ORVQnLFxyXG4gIGJhc2VVcmw6ICcuJyxcclxuICBpY29uOiAnPHN2ZyB0PVwiMTY5MjY3MDYwNzQ0N1wiIGNsYXNzPVwiaWNvblwiIHZpZXdCb3g9XCIwIDAgMTAyNCAxMDI0XCIgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBwLWlkPVwiNjUzMlwiIHdpZHRoPVwiMTI4XCIgaGVpZ2h0PVwiMTI4XCI+PHBhdGggZD1cIk0yNjUuMjE2IDc1OC43ODRjMjIuNTI4IDIyLjUyOCAzNC44MTYgNTEuMiAzNC44MTYgODMuOTY4IDAgMzIuNzY4LTEzLjMxMiA2Mi40NjQtMzQuODE2IDgzLjk2OC0yMi41MjggMjIuNTI4LTUzLjI0OCAzNC44MTYtODMuOTY4IDM0LjgxNi0zMi43NjggMC02Mi40NjQtMTMuMzEyLTgzLjk2OC0zNC44MTZDNzMuNzI4IDkwNS4yMTYgNjEuNDQgODc0LjQ5NiA2MS40NCA4NDMuNzc2YzAtMzIuNzY4IDEzLjMxMi02Mi40NjQgMzQuODE2LTgzLjk2OCAyMi41MjgtMjIuNTI4IDUxLjItMzQuODE2IDgzLjk2OC0zNC44MTYgMzMuNzkyLTEuMDI0IDYyLjQ2NCAxMi4yODggODQuOTkyIDMzLjc5MnpNNjEuNDQgMzY3LjYxNnYxNzIuMDMyYzExMS42MTYgMCAyMTguMTEyIDQ0LjAzMiAyOTYuOTYgMTIyLjg4UzQ4MS4yOCA4NDguODk2IDQ4MS4yOCA5NjIuNTZoMTcyLjAzMmMwLTE2My44NC02Ni41Ni0zMTIuMzItMTc0LjA4LTQxOS44NEMzNzMuNzYgNDM2LjIyNCAyMjUuMjggMzY5LjY2NCA2MS40NCAzNjcuNjE2ek02MS40NCA2MS40NHYxNzIuMDMyYzQwMi40MzIgMCA3MjkuMDg4IDMyNi42NTYgNzI5LjA4OCA3MjkuMDg4SDk2Mi41NmMwLTI0Ny44MDgtMTAxLjM3Ni00NzMuMDg4LTI2NC4xOTItNjM2LjkyOEM1MzYuNTc2IDE2My44NCAzMTEuMjk2IDYzLjQ4OCA2MS40NCA2MS40NHpcIiBmaWxsPVwiI0VCQTMzQVwiIHAtaWQ9XCI2NTMzXCI+PC9wYXRoPjwvc3ZnPicsXHJcbiAgY29weXJpZ2h0OiAnQ29weXJpZ2h0IChjKSAyMDEzLXByZXNlbnQsIENNT05PLk5FVCcsXHJcblxyXG4gIC8vIG9wdGlvbmFsXHVGRjA4XHU1M0VGXHU5MDA5XHU1M0MyXHU2NTcwXHVGRjA5XHJcbiAgbGFuZ3VhZ2U6ICd6aC1jbicsXHJcbiAgYXV0aG9yOiB7XHJcbiAgICBuYW1lOiAnXHU1RTM4XHU0RjFGXHU1MzRFJyxcclxuICAgIGVtYWlsOiAnY2hhbmd3ZWlodWFAb3V0bG9vay5jb20nLFxyXG4gICAgbGluazogJ2h0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvJ1xyXG4gIH0sXHJcbiAgYXV0aG9yczpbXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdcdTVFMzhcdTRGMUZcdTUzNEUnLFxyXG4gICAgICBlbWFpbDogJ2NoYW5nd2VpaHVhQG91dGxvb2suY29tJyxcclxuICAgICAgbGluazogJ2h0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvJ1xyXG4gICAgfVxyXG4gIF0sXHJcbiAgZmlsZW5hbWU6ICdmZWVkLnJzcycsXHJcbiAgbG9nOiB0cnVlLFxyXG4gIGlnbm9yZUhvbWU6IHRydWUsXHJcbn1cclxuXHJcbmV4cG9ydCB7XHJcbiAgUlNTXHJcbn1cclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxHaXRodWJcXFxcY2hhbmd3ZWlodWEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcdXRpbHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdGh1YlxcXFxjaGFuZ3dlaWh1YS5naXRodWIuaW9cXFxcLnZpdGVwcmVzc1xcXFx1dGlsc1xcXFxoYW5kbGVIZWFkTWV0YS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovR2l0aHViL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby8udml0ZXByZXNzL3V0aWxzL2hhbmRsZUhlYWRNZXRhLnRzXCI7aW1wb3J0IHsgdHlwZSBIZWFkQ29uZmlnLCB0eXBlIFRyYW5zZm9ybUNvbnRleHQgfSBmcm9tIFwidml0ZXByZXNzXCI7XHJcblxyXG4vLyBcdTU5MDRcdTc0MDZcdTZCQ0ZcdTRFMkFcdTk4NzVcdTk3NjJcdTc2ODRcdTUxNDNcdTY1NzBcdTYzNkVcclxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZUhlYWRNZXRhKGNvbnRleHQ6IFRyYW5zZm9ybUNvbnRleHQpIHtcclxuICBjb25zdCB7IGRlc2NyaXB0aW9uLCB0aXRsZSwgcmVsYXRpdmVQYXRoIH0gPSBjb250ZXh0LnBhZ2VEYXRhO1xyXG4gIC8vIFx1NTg5RVx1NTJBMFR3aXR0ZXJcdTUzNjFcdTcyNDdcclxuICBjb25zdCBvZ1VybDogSGVhZENvbmZpZyA9IFtcIm1ldGFcIiwgeyBwcm9wZXJ0eTogXCJvZzp1cmxcIiwgY29udGVudDogYWRkQmFzZShyZWxhdGl2ZVBhdGguc2xpY2UoMCwgLTMpKSArICcuaHRtbCcgfV1cclxuICBjb25zdCBvZ1RpdGxlOiBIZWFkQ29uZmlnID0gW1wibWV0YVwiLCB7IHByb3BlcnR5OiBcIm9nOnRpdGxlXCIsIGNvbnRlbnQ6IHRpdGxlIH1dXHJcbiAgY29uc3Qgb2dEZXNjcmlwdGlvbjogSGVhZENvbmZpZyA9IFtcIm1ldGFcIiwgeyBwcm9wZXJ0eTogXCJvZzpkZXNjcmlwdGlvblwiLCBjb250ZW50OiBkZXNjcmlwdGlvbiB8fCBjb250ZXh0LmRlc2NyaXB0aW9uIH1dXHJcbiAgY29uc3Qgb2dJbWFnZTogSGVhZENvbmZpZyA9IFtcIm1ldGFcIiwgeyBwcm9wZXJ0eTogXCJvZzppbWFnZVwiLCBjb250ZW50OiBcImh0dHBzOi8vY2hhbmd3ZWlodWEuZ2l0aHViLmlvL2F1dGhvci5qcGdcIiB9XVxyXG4gIGNvbnN0IHR3aXR0ZXJDYXJkOiBIZWFkQ29uZmlnID0gW1wibWV0YVwiLCB7IG5hbWU6IFwidHdpdHRlcjpjYXJkXCIsIGNvbnRlbnQ6IFwic3VtbWFyeVwiIH1dXHJcbiAgY29uc3QgdHdpdHRlckltYWdlOiBIZWFkQ29uZmlnID0gW1wibWV0YVwiLCB7IG5hbWU6IFwidHdpdHRlcjppbWFnZTpzcmNcIiwgY29udGVudDogXCJodHRwczovL2NoYW5nd2VpaHVhLmdpdGh1Yi5pby9hdXRob3IuanBnXCIgfV1cclxuICBjb25zdCB0d2l0dGVyRGVzY3JpcHRpb246IEhlYWRDb25maWcgPSBbXCJtZXRhXCIsIHsgbmFtZTogXCJ0d2l0dGVyOmRlc2NyaXB0aW9uXCIsIGNvbnRlbnQ6IGRlc2NyaXB0aW9uIHx8IGNvbnRleHQuZGVzY3JpcHRpb24gfV1cclxuXHJcbiAgY29uc3QgdHdpdHRlckhlYWQ6IEhlYWRDb25maWdbXSA9IFtcclxuICAgIG9nVXJsLCBvZ1RpdGxlLCBvZ0Rlc2NyaXB0aW9uLCBvZ0ltYWdlLFxyXG4gICAgdHdpdHRlckNhcmQsIHR3aXR0ZXJEZXNjcmlwdGlvbiwgdHdpdHRlckltYWdlLFxyXG4gIF1cclxuXHJcbiAgcmV0dXJuIHR3aXR0ZXJIZWFkXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRCYXNlKHJlbGF0aXZlUGF0aDogc3RyaW5nKSB7XHJcbiAgY29uc3QgaG9zdCA9ICdodHRwczovL2NoYW5nd2VpaHVhLmdpdGh1Yi5pbydcclxuICBpZiAocmVsYXRpdmVQYXRoLnN0YXJ0c1dpdGgoJy8nKSkge1xyXG4gICAgcmV0dXJuIGhvc3QgKyByZWxhdGl2ZVBhdGhcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGhvc3QgKyAnLycgKyByZWxhdGl2ZVBhdGhcclxuICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLElBQU0sVUFBNEM7QUFBQSxFQUNoRCxVQUFVO0FBQUEsSUFDUjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsRUFBRSxNQUFNLHFCQUFxQixNQUFNLHFCQUFxQjtBQUFBLFFBQ3hELEVBQUUsTUFBTSx3QkFBd0IsTUFBTSxnQkFBZ0I7QUFBQSxNQUN4RDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSx1QkFBdUI7QUFBQSxJQUNyQjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsRUFBRSxN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
