import { themeConfig } from "./src/theme";
import { docsConfig } from "./src/docs";
import { head } from "./src/head";
import { markdown } from "./src/markdown";
import { HeadConfig, defineConfig } from "vitepress";
import { handleHeadMeta } from "./utils/handleHeadMeta";
import GitRevisionInfoPlugin from "vite-plugin-git-revision-info";
import vitepressProtectPlugin from "vitepress-protect-plugin";
import { groupIconVitePlugin } from "vitepress-plugin-group-icons";
import { viteDemoPreviewPlugin } from "@vitepress-code-preview/plugin";
import vueJsx from "@vitejs/plugin-vue-jsx";
import {
  chineseSearchOptimize,
  pagefindPlugin,
} from "vitepress-plugin-pagefind";
import { type UserConfig } from "vitepress";
import { VitePressI18nOptions } from "vitepress-i18n/types";
import MdH1 from "vitepress-plugin-md-h1";
import AutoFrontmatter, { FileInfo } from "vitepress-plugin-auto-frontmatter";
import { withMermaid } from "vitepress-plugin-mermaid";
import fs from "fs-extra";

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

const vitePressOptions: UserConfig = {
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
   transformPageData(pageData) {
    const { isNotFound, relativePath } = pageData;

    if (isNotFound) {
      pageData.title = "Not Found";
    }

    if (relativePath.includes("blog")) {
      pageData.titleTemplate = ":title | Blog";
    }

    //inject for mathjax script
    const head = (pageData.frontmatter.head ??= []);
    const inject_content = pageData.frontmatter.inject_content;
    if (inject_content && Array.isArray(inject_content)) {
      inject_content.forEach(item => {
        const { type, contribution, content } = item;
        const headEntry = [type, contribution || {}, content || ''].filter(Boolean);
        head.push(headEntry as HeadConfig);
      });
      delete pageData.frontmatter.inject_content;
    }
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

// 转义Markdown中的尖括号，但保留代码块内容
function escapeMarkdownBrackets(markdownContent: string) {
  // 正则表达式模式：匹配代码块
  const codeBlockPattern = /```[\s\S]*?```|`[\s\S]*?`/g;

  // 临时替换代码块为占位符
  const codeBlocks: Array<any> = [];
  const contentWithoutCodeBlocks = markdownContent.replace(
    codeBlockPattern,
    (match) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    }
  );

  // 转义普通文本中的尖括号
  const escapedContent = contentWithoutCodeBlocks
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 恢复代码块内容
  return escapedContent.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
    return codeBlocks[index];
  });
}

/**
 * 创建 permalink 永久链接
 */
const createPermalink = () => {
  return {
    permalink: `/pages/${(Math.random() + Math.random())
      .toString(16)
      .slice(2, 8)}`,
  };
};

/**
 * 创建 categories 分类列表
 *
 * @param fileInfo 文件信息
 */
const createCategory = (fileInfo: FileInfo) => {
  // relativePath 为基于 vp srcDir 的相对路径，默认是基于项目根目录，如 guide/vue/getting.md
  const relativePathArr = fileInfo.relativePath.split("/");

  const categories: string[] = [];
  relativePathArr.forEach((filename, index) => {
    // 忽略文件名
    if (index !== relativePathArr.length - 1) categories.push(filename);
  });

  // [""] 表示添加一个为空的 categories
  return { categories: categories.length ? categories : [""] };
};

// Vite插件：在Markdown文件被处理前转义尖括号
const markdownBracketEscaper = {
  name: "markdown-bracket-escaper",
  enforce: "pre",
  async transform(code:string, id:string) {
    // 只处理Markdown文件
    if (!id.endsWith(".md")) return null;

    try {
      // 读取原始文件内容
      const rawContent = await fs.promises.readFile(id, "utf-8");
      // 转义尖括号
      const escapedContent = escapeMarkdownBrackets(rawContent);
      return escapedContent;
    } catch (err) {
      console.error("Error processing Markdown file:", err);
      return code;
    }
  },
};

export default withMermaid(
  defineConfig({
    // extends: config,
    mermaid: {
      look: "handDrawn",
      handDrawnSeed: 3,
      startOnLoad: false,
      layout: "elk",
      fontFamily:
        "XiaolaiMono, MapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
      altFontFamily:
        "XiaolaiMono, MapleMono, AlibabaPuHuiTi, '阿里巴巴普惠体 3.0'",
      theme: "neutral",
      flowchart: { curve: "basis", defaultRenderer: "elk" },
      class: {
        defaultRenderer: "elk",
      },
      state: {
        defaultRenderer: "elk",
      },
      securityLevel: "loose",
      logLevel: "error",
      suppressErrorRendering: true,
      //mermaidConfig !theme here works for ligth mode since dark theme is forced in dark mode
    },
    // 可选地使用MermaidPluginConfig为插件本身设置额外的配置
    mermaidPlugin: {
      class: "mermaid styled-mermaid", // 为父容器设置额外的CSS类
    },
    vite: {
      optimizeDeps: {
        include: [
          "mermaid",
          "dayjs",
          "debug",
          "@braintree/sanitize-url",
          "cytoscape",
          "cytoscape-cose-bilkent",
        ],
        exclude: ["vitepress"],
      },
      resolve: {
        alias: {
          vite: "rolldown-vite",
          // 强制 VitePress 使用项目安装的 Mermaid
          mermaid: "mermaid",
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
        // La51Plugin({
        //   id: "",
        //   ck: "",
        //   importMode: "async",
        // }),
        // markdownBracketEscaper,
        MdH1({
          ignoreList: ["/gallery/"],
          beforeInject: (frontmatter, id, title) => {
            // // 根据 frontmatter 的某个值判断
            // if (frontmatter.catalogue) return false;

            // 根据文档路径判断
            if (id.includes("/resume")) return false;
            if (id.includes("/me.")) return false;

            //   // 根据即将生成的一级标题判断
            //   if (title === "简介") return false;

            // // 根据 frontmatter 的某个值判断
            // if (frontmatter.archivesPage) return "归档页";

            // // 根据即将生成的一级标题判断
            // 📝  if (title === "简介") return "文档简介";
          },
        }),
        AutoFrontmatter({
          pattern: "**/*.md",
          exclude: { tag: true }, // 排除 tag: true 的 MD 文件，支持多个配置
          include: { tag: true }, // 支持多个配置
          // ✨ 通过 transform 函数来添加一个唯一的永久链接
          transform: (frontmatter, fileInfo) => {
            let transformResult = {};

            // 如果文件本身存在了 permalink，则不生成
            if (!frontmatter.permalink) {
              transformResult = { ...frontmatter, ...createPermalink() };
            }

            // 如果文件本身存在了 categories，则不生成
            if (!frontmatter.categories) {
              transformResult = {
                ...frontmatter,
                ...createCategory(fileInfo),
              };
            }

            // 确保返回值存在，如果返回 {} 将会清空文件本身的 frontmatter，返回 undefined 则告诉插件不使用 transform 返回的数据
            return Object.keys(transformResult).length
              ? transformResult
              : undefined;
          },
        }),
        // DocAnalysis(/* options */),
        vitepressProtectPlugin({
          disableF12: true,
          disableCopy: true,
          disableSelect: true,
        }),
        viteDemoPreviewPlugin(),
        vueJsx(),
        pagefindPlugin({
          // verbose: true, // 启用详细日志
          locales: {
            "en-US": {
              btnPlaceholder: "Search",
              placeholder: "Search Docs...",
              emptyText: "No results",
              heading: "Total: {{searchResult}} search results.",
              // 搜索结果不展示最后修改日期日期
              showDate: false,
            },
            "zh-CN": {
              btnPlaceholder: "搜索",
              placeholder: "搜索文档",
              emptyText: "空空如也",
              heading: "共: {{searchResult}} 条结果",
              toSelect: "选择",
              toNavigate: "切换",
              toClose: "关闭",
              searchBy: "",
            },
          },
          excludeSelector: ["img", "a.header-anchor"],
          customSearchQuery: chineseSearchOptimize,
        }),
        {
          name: 'patch-sidebar',
          enforce: 'pre',
          transform:(code, id)=>{
            if(id.includes('VPSidebarItem.vue')){
              return code.replaceAll(`:is="textTag"`, `is="p"`);
            }
          }
        }
      ],
    },
    vue: {
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('mjx-') || customElements.includes(tag),
          // whitespace: "preserve", // [!code ++] 重点:设置whitespace: 'preserve'是为了保留Markdown中的空格，以便LiteTree可以正确解析lite格式的树数据。
        },
      },
    },
    ...vitePressOptions,
    // ...withI18n(vitePressOptions, vitePressI18nOptions)
  })
);
