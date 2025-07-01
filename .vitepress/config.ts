import { themeConfig } from "./src/theme";
import { docsConfig } from "./src/docs";
import { head } from "./src/head";
import { markdown } from "./src/markdown";
import { withMermaid } from "vitepress-plugin-panzoom-mermaid";
import { HeadConfig, defineConfig } from "vitepress";
import { handleHeadMeta } from "./utils/handleHeadMeta";
import GitRevisionInfoPlugin from "vite-plugin-git-revision-info";
import { getChangelogAndContributors } from "vitepress-plugin-changelog";
import vitepressProtectPlugin from "vitepress-protect-plugin";
import { groupIconVitePlugin } from "vitepress-plugin-group-icons";
import { viteDemoPreviewPlugin } from "@vitepress-code-preview/plugin";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { withI18n } from "vitepress-i18n";
import { type UserConfig } from "vitepress";
import { VitePressI18nOptions } from "vitepress-i18n/types";
import { La51Plugin } from "vitepress-plugin-51la";
import MdH1 from "vitepress-plugin-md-h1";
// import DocAnalysis from "vitepress-plugin-doc-analysis";

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

const vitePressOptions : UserConfig = {
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
  // 配置路由选项
  router: {
    // linkActiveClass: 'active-parent', // 自定义一级路由高亮类名
    // linkExactActiveClass: 'active-exact' // 精确匹配类名（可选）
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
    const { contributors, changelog } = await getChangelogAndContributors(
      relativePath
    );
    const CustomAvatars = {
      changweihua: "2877201",
    };
    const CustomContributors = contributors.map((contributor) => {
      contributor.avatar = `https://avatars.githubusercontent.com/u/${
        CustomAvatars[contributor.name]
      }?v=4`;
      return contributor;
    });

    if (isNotFound) {
      pageData.title = "Not Found";
    }

    if (pageData.relativePath.includes("blog")) {
      pageData.titleTemplate = ":title | Blog";
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
};

const vitePressI18nOptions: Partial<VitePressI18nOptions> = {
  locales: [
    { path: "en-US", locale: "en" },
    { path: "zh-CN", locale: "zhHans" },
  ],
  rootLocale: "zhHans",
  description: {
    en: "Hello",
    zhHans: "你好",
  },
};

export default withMermaid({
  // extends: config,
  mermaid: {
    look: "handDrawn",
    handDrawnSeed: 2,
    fontFamily: "MapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
    altFontFamily: "MapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
    startOnLoad: true,
    //mermaidConfig !theme here works for ligth mode since dark theme is forced in dark mode
  },
  // 可选地使用MermaidPluginConfig为插件本身设置额外的配置
  mermaidPlugin: {
    class: "mermaid styled-mermaid", // 为父容器设置额外的CSS类
  },
  vite: {
    // css: {
    //   // transformer: "postcss",
    //   // postcss: {
    //   //   minify: false,
    //   //   plugins: [
    //   //     autoprefixer({
    //   //       grid: true,
    //   //     }),
    //   //     cssnano({
    //   //       preset: [
    //   //         "advanced",
    //   //         {
    //   //           autoprefixer: false,
    //   //           zindex: false, // 禁用 z-index 优化
    //   //           discardUnused: {
    //   //             fontFace: false, // 关键：禁止移除未使用的 @font-face
    //   //           },
    //   //           discardComments: { removeAll: true }, // 移除所有注释
    //   //         },
    //   //       ],
    //   //     }),
    //   //   ],
    //   // },
    //   lightningcss: {
    //     // 禁用特定优化
    //     minify: false,
    //     drafts: {
    //       nesting: true, // 启用嵌套语法
    //       customMedia: true, // 启用媒体查询变量
    //       keyframes: true, // 启用实验性关键帧支持
    //     },
    //   },
    // },
    resolve: {
      alias: {
        vite: "rolldown-vite",
      },
    },
    logLevel: "info",
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
      La51Plugin({
        id: "3070906",
        ck: "3MfPCMKHJ65JsmJH",
        importMode: "async",
      }),
      MdH1(),
      // DocAnalysis(/* options */),
      vitepressProtectPlugin({
        disableF12: true,
        disableCopy: true,
        disableSelect: true,
      }),
      viteDemoPreviewPlugin(),
      vueJsx(),
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
  ...vitePressOptions,
  // ...withI18n(vitePressOptions, vitePressI18nOptions)
});
