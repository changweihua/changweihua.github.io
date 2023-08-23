import {
  containerPreview,
  componentPreview,
} from "@vitepress-demo-preview/plugin";
import { MarkdownOptions } from "vitepress";
import mdItCustomAttrs from "markdown-it-custom-attrs";
import timeline from "vitepress-markdown-timeline";
import container from 'markdown-it-container';
import { renderSandbox } from 'vitepress-plugin-sandpack'
import footnote from 'markdown-it-footnote';

const markdown: MarkdownOptions | undefined = {
  lineNumbers: true,
  theme: { light: 'github-light', dark: 'github-dark' },
  config: (md) => {
    md.use(footnote);

    md.use(containerPreview);
    md.use(componentPreview);
    // use more markdown-it plugins!
    md.use(mdItCustomAttrs, "image", {
      "data-fancybox": "gallery",
    });
    md.use(timeline);
    md
      // the second parameter is html tag name
      .use(container, 'sandbox', {
        render (tokens, idx) {
          return renderSandbox(tokens, idx, 'sandbox');
        },
      });

    // 在所有文档的<h1>标签后添加<ArticleMetadata/>组件
    md.renderer.rules.heading_close = (tokens, idx, options, env, slf) => {
      let htmlResult = slf.renderToken(tokens, idx, options);
      if (tokens[idx].tag === 'h1') {
        htmlResult += `\n<ClientOnly><ArticleMetadata :frontmatter="$frontmatter"/></ClientOnly>`
      }
      // if (tokens[idx].tag === 'h1') htmlResult += `\n<ClientOnly><ArticleMetadata v-if="($frontmatter?.aside ?? true) && ($frontmatter?.showArticleMetadata ?? true)" :article="$frontmatter" /></ClientOnly>`;
      return htmlResult;
    }
  },
}

export {
  markdown
}
