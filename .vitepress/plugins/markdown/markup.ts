import type MarkdownIt from 'markdown-it'

export default function markupPlugin(md: MarkdownIt): void {
  // 保存原有的 fence 函数
  const fence = md.renderer.rules.fence?.bind(md.renderer.rules)
  // 定义我们自己的 fence 函数
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    // 通过token上的 info 获取代码块的语言
    const token = tokens[idx]
    const language = token.info.trim()

    if (language.startsWith('markup')) {
      // 将代码块渲染成 html，这里替换成我们自己定义的vue组件
      return `<ClientOnly><MarkupView id="markup-${idx}" code="${encodeURIComponent(token.content)}"></MarkupView></ClientOnly>`
    }
    // 对不是我们需要的代码块的直接调用原有的函数
    return fence!(tokens, idx, options, env, self)
  }
}
