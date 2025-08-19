import { MarkdownOptions } from "vitepress";
import timeline from "vitepress-markdown-timeline";
import footnote from "markdown-it-footnote";
import anchor from "markdown-it-anchor";
import markdownSup from "markdown-it-sup";
import markdownSub from "markdown-it-sub";
// import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
// import { npmCommandsMarkdownPlugin } from 'vitepress-plugin-npm-commands'
import frontmatter from "markdown-it-front-matter";
import { wordless, chineseAndJapanese, Options } from "markdown-it-wordless";
import MarkdownItCollapsible from "markdown-it-collapsible";
import lazy_loading from "markdown-it-image-lazy-loading";
import namedCode from "markdown-it-named-code-blocks";
import strikethrough from "markdown-it-strikethrough-alt";
import hashmention from "markdown-it-hashmention";
import readerMarkdownPlugin from "../plugins/markdown/reader-markdown";
import circleMarkdownPlugin from "../plugins/markdown/circle-markdown";
import echartsMarkdownPlugin from "../plugins/markdown/echarts-markdown";
import markmapMarkdownPlugin from "../plugins/markdown/markmap-markdown";
import markupPlugin from "../plugins/markdown/markup";
import useDefinePlugin from "vitepress-plugin-markdown-define";
import { groupIconMdPlugin } from "vitepress-plugin-group-icons";
import { demoPreviewPlugin } from "@vitepress-code-preview/plugin";
// import { mdVueDemoPlugin } from 'vitepress-vue-demo'
import { fileURLToPath, URL } from "node:url";
import path from "path";
import Expl3 from "../assets/latexs/LaTeX-Expl3.tmLanguage.json";
// import { vitepressDemoPlugin } from "vitepress-demo-plugin";
import { copyOrDownloadAsMarkdownButtons } from "vitepress-plugin-llms";
import { configureDiagramsPlugin } from "vitepress-plugin-diagrams";
import glossary from "../glossary.json";
import { fmTitlePlugin } from "vitepress-plugin-frontmatter";
import { autoArticleTitlePlugin } from "../plugins/markdown/autoArticleTitle";
import { vitepressPluginLegend } from "vitepress-plugin-legend";
import MarkdownItGitHubAlerts from "markdown-it-github-alerts";
import markdownItRegex from "markdown-it-regex";
import markdownItReplaceLink from "markdown-it-replace-link";
import multipleChoicePlugin from "markdown-it-multiple-choice";
import markdownItTableExt from "markdown-it-multimd-table-ext";
import markdownItCjkFriendly from "markdown-it-cjk-friendly";

const CONSTS = {
  __custom_variable__: "your value",
};

const markdown: MarkdownOptions | undefined = {
  lineNumbers: true,
  // 直接启用 GitHub 风格列表
  breaks: true,
  // 允许 HTML 渲染
  html: true,
  linkify: true,
  math: true,
  // 标记组件为行内
  component: {
    inlineTags: [],
  },
  mermaid: true,
  image: {
    lazyLoading: true
  },
  // anchor: {
  //   permalink: anchor.permalink.ariaHidden({
  //     // you can use other variants too, refer - https://github.com/valeriangalliat/markdown-it-anchor#permalinks
  //     symbol: `🔗`,
  //     placement: "before",
  //   }),
  // },
  // @ts-ignore
  languages: [Expl3],
  lazyLoading: true,
  theme: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
  frontmatter: {
    grayMatterOptions: {
      excerpt: true,
      excerpt_separator: "<!-- 更多 -->",
    },
    renderExcerpt: false,
  },
  preConfig: async (md) => {},
  config: (md) => {
    useDefinePlugin(md, CONSTS);

    md.use(markdownItCjkFriendly);
    md.use(footnote);
    md.use(frontmatter);
    md.use(markdownSup);
    md.use(markdownSub);
    md.use(hashmention);
    md.use(circleMarkdownPlugin);
    md.use(readerMarkdownPlugin);
    // md.use(tabsMarkdownPlugin);
    // md.use(npmCommandsMarkdownPlugin);
    md.use<Options>(wordless, { supportWordless: [chineseAndJapanese] });
    // md.use(copyOrDownloadAsMarkdownButtons);
    // configureDiagramsPlugin(md, {
    //   diagramsDir: "public/diagrams", // Optional: custom directory for SVG files
    //   publicPath: "/diagrams", // Optional: custom public path for images
    // });
    // markdownLinks(md, {
    //   externalClassName: "custom-external-link",
    //   internalClassName: "custom-internal-link",
    //   internalDomains: ["https://changweihua.github.io"],
    // });
    // md.use(fmTitlePlugin);
    // roughMermaidPlugin(md);
    strikethrough(md);
    md.use(namedCode, { isEnableInlineCss: true });
    md.use(lazy_loading);
    md.use(timeline);
    md.use(groupIconMdPlugin);
    md.use(echartsMarkdownPlugin);
    md.use(markmapMarkdownPlugin);
    // md.use(markupPlugin);
    md.use(MarkdownItCollapsible);
    md.use(MarkdownItGitHubAlerts, {
      /* Options */
      markers: "*",
    });
    // md.use(markdownItRegex, {
    //   name: "emoji",
    //   regex: /(:(?:heart|panda_face|car):)/,
    //   replace: (match) => {
    //     return `<i class="e1a-${match.slice(1, -1)}"></i>`;
    //   },
    // });
    // md.use(markdownItTableExt, {
    //   multiline: true,
    //   rowspan: false,
    //   headerless: true,
    //   multibody: true,
    //   autolabel: true,
    // });
    const docRoot = fileURLToPath(new URL("../../", import.meta.url));
    md.use(demoPreviewPlugin, {
      docRoot,
    });

    // md.use(mdVueDemoPlugin);

    // md.use(multipleChoicePlugin);

    // md.use(vitepressDemoPlugin, {
    //   demoDir: path.resolve(__dirname, "../../src/demos"),
    //   lightTheme: "catppuccin-latte",
    //   darkTheme: "catppuccin-frappe",
    //   tabs: {
    //     order: "html,vue,react",
    //     select: "vue",
    //   },
    //   stackblitz: {
    //     show: true,
    //   },
    //   codesandbox: {
    //     show: true,
    //   },
    // });
    md.use(autoArticleTitlePlugin, {
      relativePaths: ["/blog/"],
    });

    md.use(markdownItReplaceLink, {
      processHTML: false, // defaults to false for backwards compatibility
      replaceLink: function (link, env, token, htmlToken) {
        return link + "?c=" + Date.now();
      },
    });

    // // @ts-ignore
    // vitepressPluginLegend(md, {
    //   markmap: { showToolbar: true }, // 显示脑图工具栏
    //   mermaid: true, // 启用 Mermaid
    // });

    // 修改表格的 HTML 结构
    md.renderer.rules.table_open = () =>
      `<div class="vp-table-container"><table class="vp-table striped ">`;
    md.renderer.rules.table_close = () => "</table></div>";

    // 修改表头单元格样式
    // md.renderer.rules.th_open = () =>
    //   '<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">';
    // md.renderer.rules.td_open = () =>
    //   '<td style="border: 1px solid #ddd; padding: 8px;">';

    // 自定义加粗文本的渲染
    md.renderer.rules.strong_open = () => '<strong class="font-bold">';
    md.renderer.rules.strong_close = () => "</strong>";

    // 自定义斜体文本的渲染
    md.renderer.rules.em_open = () => '<em class="italic">';
    md.renderer.rules.em_close = () => "</em>";

    // 在所有文档的<h1>标签后添加<ArticleMetadata/>组件
    md.renderer.rules.heading_close = (tokens, idx, options, env, render) => {
      let htmlResult = render.renderToken(tokens, idx, options);
      if (
        env["relativePath"] &&
        env["relativePath"].includes("/blog/") &&
        tokens[idx].tag === "h1"
      ) {
        console.log(env["relativePath"], env["frontmatter"]["layout"]);
        htmlResult += `\n<ClientOnly><ArticleMetadata :frontmatter="$frontmatter"/></ClientOnly>`;
      }
      // if (tokens[idx].tag === 'h1') htmlResult += `\n<ClientOnly><ArticleMetadata v-if="($frontmatter?.aside ?? true) && ($frontmatter?.showArticleMetadata ?? true)" :article="$frontmatter" /></ClientOnly>`;
      return htmlResult;
    };
  },
};

export { markdown };
