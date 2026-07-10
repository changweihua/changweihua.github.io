// @ts-ignore
import type MarkdownItAsync from 'markdown-it-async'

import path from "path";
export function resetImageSize(md: MarkdownItAsync) {
  const maxHeight = 500; /* px */

  const img = md.renderer.rules.image!;
  const { markdownItImageSize } = require("markdown-it-image-size");

  // @ts-ignore
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx];

    const widthAttr = token.attrGet("width");
    const heightAttr = token.attrGet("height");

    let w = widthAttr ? Number.parseInt(widthAttr, 10) : null;
    let h = heightAttr ? Number.parseInt(heightAttr, 10) : null;

    let style = token.attrGet("style") || "";
    if (style && !style.trim().endsWith(";")) style += ";";

    if (w) {
      if (h && h > maxHeight) {
        w = Math.round((w * maxHeight) / h);
        h = maxHeight;
      }
      style += `width: ${w}px;`;
    }

    token.attrSet("style", style);
    return img(tokens, idx, options, env, self);
  };

  markdownItImageSize(md, {
    publicDir: path.resolve(import.meta.dirname, "../public"),
  });
}
