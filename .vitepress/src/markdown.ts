import {
  containerPreview,
  componentPreview,
} from "@vitepress-demo-preview/plugin";
import { MarkdownOptions } from "vitepress";
import mdItCustomAttrs from "markdown-it-custom-attrs";
import timeline from "vitepress-markdown-timeline";
import container from 'markdown-it-container';
import { renderSandbox } from 'vitepress-plugin-sandpack'


const markdown: MarkdownOptions | undefined = {
  lineNumbers: true,
  theme: { light: 'github-light', dark: 'github-dark' },
  config: (md) => {
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
  },
}

export {
  markdown
}
