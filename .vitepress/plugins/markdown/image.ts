import type MarkdownIt from 'markdown-it'
export function ImagePlugin(md: MarkdownIt) {
  const imageRender = md.renderer.rules.image! // 尾部的这个感叹号的意思是断言此变量肯定有值
  md.renderer.rules.image = (...args) => {
    const [tokens, idx] = args
    if (tokens[idx + 2] && /^<!--.*-->/.test(tokens[idx + 2].content)) {
      const data = tokens[idx + 2].content
      if (/size=/.test(data)) {
        const size = data.match(/size=(\d+)(x\d+)?/)
        tokens[idx].attrs?.push(
          ['width', size?.[1] || ''],
          ['height', size?.[2]?.substring(1) || size?.[1] || '']
        )
      }

      tokens[idx].attrs?.push(['loading', 'lazy'], ['decoding', 'async'])
      tokens[idx + 2].content = ''
      return imageRender(...args)
    }
    tokens[idx].attrs?.push(['loading', 'lazy'], ['decoding', 'async'])
    return imageRender(...args)
  }
}
