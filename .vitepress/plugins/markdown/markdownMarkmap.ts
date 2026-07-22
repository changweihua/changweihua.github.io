// .vitepress/plugins/markdown/markdownMarkmap.ts
import type MarkdownIt from 'markdown-it'

export function markdownMarkmap(md: MarkdownIt): void {
  const fence = md.renderer.rules.fence!.bind(md.renderer.rules)

  md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, self: any): string => {
    const token = tokens[idx]
    if (token.info.trim() === 'markmap') {
      const content = encodeURIComponent(token.content)
      // 直接生成 Vue 组件标签，并包裹在 ClientOnly 中
      return `<ClientOnly><Markmap :content="'${content}'" /></ClientOnly>`
    }
    return fence(tokens, idx, options, env, self)
  }
}
