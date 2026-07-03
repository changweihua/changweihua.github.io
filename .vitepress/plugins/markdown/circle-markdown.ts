import type MarkdownIt from "markdown-it";

export default function circlePlugin(md: MarkdownIt): void {
  md.renderer.rules.text = (tokens, idx) => {
    const text = tokens[idx].content;
    const transformedText = text.replace(
       /o(.*?)o/g,
      (_match, p1) => `<span class="char-circle">${p1}</span>`,
    );
    return transformedText;
  };
}
