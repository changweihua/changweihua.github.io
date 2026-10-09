import type MarkdownIt from 'markdown-it'

/**
 * 检查 token 是否为 markmap 代码块，是则返回渲染后的 HTML，否则返回 null
 */
export function renderMarkmapBlock(tokens: any[], idx: number): string | null {
  const token = tokens[idx]
  if (token.info.trim() === 'markmap') {
    const content = encodeURIComponent(token.content)
    return `<ClientOnly><Markmap :content="'${content}'" /></ClientOnly>`
  }
  return null
}

/**
 * markdown-it 插件（不覆写 fence，由集中式 dispatcher 调用 renderMarkmapBlock）
 */
export function markdownMarkmap(md: MarkdownIt): void {
  // fence 处理已迁移至 markdown.ts 的集中式 dispatcher
}
