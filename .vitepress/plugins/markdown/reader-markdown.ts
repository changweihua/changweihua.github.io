import type MarkdownIt from 'markdown-it'

export default function readerPlugin(md: MarkdownIt): void {
  md.renderer.rules.text = (tokens, idx) => {
    const transformedText = tokens[idx].content;
    // ...
    const transformedReadText = transformedText.replace(/read(.*?)read/g, (_match, p1) => `<m-read-text>${p1}</m-read-text>`);

    return transformedReadText;
  };
}
