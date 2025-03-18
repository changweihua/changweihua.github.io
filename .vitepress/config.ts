import { themeConfig } from "./src/theme";
import { docsConfig } from "./src/docs";
import { head } from "./src/head";
import { markdown } from "./src/markdown";
import { RssPlugin } from "vitepress-plugin-rss";
import { RSS } from "./src/rss";
import { withMermaid } from "vitepress-plugin-panzoom-mermaid";
import { defineConfig, HeadConfig } from "vitepress";
import { handleHeadMeta } from "./utils/handleHeadMeta";
import GitRevisionInfoPlugin from "vite-plugin-git-revision-info";
import { getChangelogAndContributors } from "vitepress-plugin-changelog";
import vitepressProtectPlugin from "vitepress-protect-plugin";
import { groupIconVitePlugin } from "vitepress-plugin-group-icons";
import { viteDemoPreviewPlugin } from "@vitepress-code-preview/plugin";
import vueJsx from "@vitejs/plugin-vue-jsx";
// import config from '@sakitam-gis/vitepress-playground/config';
import { AnnouncementPlugin } from "vitepress-plugin-announcement";

const customElements = [
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
  "annotation-xml",
];

export default withMermaid({
  // extends: config,
  mermaid: {
    look: "handDrawn",
    handDrawnSeed: 2,
    // 'theme': 'base',
    // 'themeVariables': {
    //   'primaryColor': '#506bee',
    //   // 'primaryTextColor': '#fff',
    //   // 'primaryBorderColor': '#7C0000',
    //   // 'lineColor': '#F8B229',
    //   // 'secondaryColor': '#006100',
    //   // 'tertiaryColor': '#fff'
    // },
    fontFamily: "JetBrainsMapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
    altFontFamily: "JetBrainsMapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
    startOnLoad: false,
    //mermaidConfig !theme here works for ligth mode since dark theme is forced in dark mode
  },
  // 可选地使用MermaidPluginConfig为插件本身设置额外的配置
  mermaidPlugin: {
    class: "mermaid rough-mermaid", // 为父容器设置额外的CSS类
  },
  // srcDir: '.',
  vite: {
    logLevel: "info",
    // optimizeDeps: { include: ["@braintree/sanitize-url"] },
    // resolve: {
    //   alias: {
    //     dayjs: "dayjs/",
    //   },
    // },
    plugins: [
      GitRevisionInfoPlugin(),
      groupIconVitePlugin({
        customIcon: {
          ae: "logos:adobe-after-effects",
          ai: "logos:adobe-illustrator",
          ps: "logos:adobe-photoshop",
          // rspack: localIconLoader(import.meta.url, '../assets/rspack.svg'),
          // farm: localIconLoader(import.meta.url, '../assets/farm.svg'),
        },
      }),
      RssPlugin(RSS),
      vitepressProtectPlugin({
        disableF12: true,
        disableCopy: true,
        disableSelect: true,
      }),
      viteDemoPreviewPlugin(),
      vueJsx(),
      // AnnouncementPlugin({
      //   title: '欢迎来到CMONO.NET',
      //   clientOnly: true,
      //   duration: -1,
      //   mobileMinify: true,
      //   icon: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1729473692503" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11855" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><path d="M882.5 426.8C879.7 225 714 63.6 512.1 66c-201.8-2.5-367.6 159-370.4 360.8 0.3 104.9 46.7 204.3 126.9 271.9v227.7c0.2 9.1 4.6 17.6 12 22.9 7.6 5.2 17.1 6.6 25.8 3.9L512 885.6l205.6 67.7c2.9 1.1 6 1.7 9.2 1.7 5.9 0.1 11.7-1.6 16.6-4.9 7.5-5.2 12-13.8 12-23V699.3c80.3-67.9 126.7-167.5 127.1-272.5z m-680.5 0c2.5-168.7 141-303.5 309.7-301.6 168.6-1.9 307 132.9 309.6 301.6-2.5 168.6-140.9 303.5-309.6 301.6-168.6 1.9-307-133-309.5-301.6h-0.2z m495.5 461.1l-176.9-58.2c-5.9-2.2-12.4-2.2-18.4 0l-176.7 58.2V739c115.5 64.9 256.6 64.9 372.1 0v148.8l-0.1 0.1zM569 363c0-7.6-2.2-15-6.3-21.3-4.1-6.2-10.2-11-17.2-13.4-13.4-3.7-27.4-5.3-41.3-4.5h-55.7v79.5h53.8c12.2 0.3 24.4-1 36.2-4 8.6-1.7 16.5-6.1 22.6-12.4 5.5-6.6 8.4-15.2 7.9-23.9z m-57.4-172.8c-132.3-1.5-240.9 104.3-242.9 236.6 2 132.3 110.6 238.1 242.9 236.7 132.3 1.5 240.9-104.4 242.9-236.7-1.8-132.4-110.5-238.3-242.9-236.6z m119.5 371c-2.5 4-6.1 7.1-10.3 8.9-4.6 2.3-9.7 3.5-14.8 3.4-6 0.1-12-1.4-17.2-4.5-4.7-3.2-8.8-7.2-12-11.8-4.8-6.6-9.2-13.5-13.2-20.7l-24.1-39.2c-6.5-11.6-14.2-22.5-23-32.4-5.6-6.6-12.7-11.8-20.7-15.1-8.5-2.9-17.4-4.3-26.4-4h-20.8v92.9c0.8 9.6-2.1 19.2-8 26.8-5.8 5.7-13.7 8.7-21.8 8.4-8.5 0.6-16.7-2.7-22.4-8.9-5.7-7.5-8.5-16.8-8-26.3V316c-1-9.9 2.1-19.8 8.6-27.4 7.9-6.4 18-9.4 28.1-8.4h97.6c11.5-0.1 23.1 0.5 34.6 1.7 8.9 0.9 17.6 3.2 25.8 6.7 9.1 4 17.4 9.5 24.7 16.2 7 7 12.5 15.4 16.1 24.7 3.6 9.5 5.5 19.5 5.7 29.6 0.9 19-6 37.6-19 51.5-15.9 14.4-35.6 24-56.8 27.5 11.7 6.2 22 14.6 30.5 24.7 9.6 10.6 18.2 22 25.8 34.1 6.8 10.5 12.7 21.6 17.8 33 3.2 6.3 5.3 13.1 6.3 20.1 1.1 4 0 8.2-2.9 11.2h-0.2z" fill="#EC6C00" p-id="11856"></path></svg>',
      //   closeIcon: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1729473777752" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18003" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><path d="M759.594667 195.2l90.538666 90.538667L307.072 828.8l-90.538667-90.538667z" fill="#5363D0" p-id="18004"></path><path d="M307.072 195.2L216.533333 285.738667l543.061334 543.061333 90.538666-90.538667z" fill="#5363D0" p-id="18005"></path></svg>',
      //   onRouteChanged: function (route, showRef) {
      //     console.log(route, showRef)
      //   },
      //   body: [
      //     { type: 'text', content: '👇瞅瞅他👇' },
      //     {
      //       type: 'image',
      //       src: 'https://changweihua.github.io/author.jpg'
      //     }
      //   ],
      //   footer: [
      //     {
      //       type: 'button',
      //       content: '啥都不是呢',
      //       link: 'https://changweihua.github.io'
      //     },
      //   ],
      // })
    ],
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag),
        whitespace: "preserve", // [!code ++] 重点:设置whitespace: 'preserve'是为了保留Markdown中的空格，以便LiteTree可以正确解析lite格式的树数据。
      },
    },
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
      // add new items or modify/filter existing items
      items.push({
        url: "/extra-page",
        changefreq: "monthly",
        priority: 0.8,
      });
      return items;
    },
  },
  rewrites: {
    "^/index.md": "/zh-CN/index.md",
  },
  ignoreDeadLinks: true,
  async transformHead(context): Promise<HeadConfig[]> {
    // const { assets }= context
    const head = handleHeadMeta(context);

    return head;
  },
  async transformPageData(pageData) {
    const { isNotFound, relativePath } = pageData;
    const { contributors, changelog } =
      await getChangelogAndContributors(relativePath);
    const CustomAvatars = {
      changweihua: "2877201",
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
        commitURL:
          "https://github.com/changweihua/changweihua.github.io/commit/",
        title: "Changelog",
      },
    };
  },
});
