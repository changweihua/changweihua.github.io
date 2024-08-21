import {
  containerPreview,
  componentPreview,
} from "@vitepress-demo-preview/plugin";
import lightbox from "vitepress-plugin-lightbox"
import { MarkdownOptions } from "vitepress";
// import mdItCustomAttrs from "markdown-it-custom-attrs";
import timeline from "vitepress-markdown-timeline";
import container from 'markdown-it-container';
import { renderSandbox } from 'vitepress-plugin-sandpack'
import footnote from 'markdown-it-footnote';
import mathjax3 from 'markdown-it-mathjax3';
import { ImagePlugin } from '../plugins/markdown/image'
import mermaidPlugin from '../plugins/markdown/rough-mermaid'
import useDefinePlugin from 'vitepress-plugin-markdown-define'
import { default as replPlugin } from 'vitepress-markdown-it-repl';
import tabsPlugin from '@red-asuka/vitepress-plugin-tabs'
import { groupIconMdPlugin } from 'vitepress-plugin-group-icons'
import { demoPreviewPlugin } from '@vitepress-code-preview/plugin'
import { fileURLToPath, URL } from 'node:url'
// import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";
// import { npmCommandsMarkdownPlugin } from 'vitepress-plugin-npm-commands'
// import { createDetypePlugin } from 'vitepress-plugin-detype'
// const { detypeMarkdownPlugin } = createDetypePlugin()

const CONSTS = {
  __custom_variable__: 'your value'
}

const markdown: MarkdownOptions | undefined = {
  lineNumbers: true,
  theme: { light: 'github-light', dark: 'github-dark' },
  config: (md) => {

    useDefinePlugin(md, CONSTS)

    md.use(footnote);
    md.use(mathjax3);
    md.use(containerPreview);
    md.use(componentPreview);
    md.use(lightbox, {});
    // md.use(tabsMarkdownPlugin);
    // md.use(npmCommandsMarkdownPlugin);
    // md.use(detypeMarkdownPlugin);
    // use more markdown-it plugins!
    // md.use(mdItCustomAttrs, "image", {
    //   "data-fancybox": "gallery",
    // });
    md.use(timeline);
    tabsPlugin(md)
    // groupIconMdPlugin(md)
    md.use(groupIconMdPlugin)
    md.use(mermaidPlugin)
    md
      // the second parameter is html tag name
      .use(container, 'sandbox', {
        render(tokens: any, idx: any) {
          return renderSandbox(tokens, idx, 'sandbox');
        },
      });

    const docRoot = fileURLToPath(new URL('../../', import.meta.url))
    md.use(demoPreviewPlugin, { docRoot })

    md.use(ImagePlugin)
    // set globalEnabledLineNumbers's value same as lineNumbers above.
    //@ts-ignore
    md.use(replPlugin, { globalEnabledLineNumbers: true })
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
