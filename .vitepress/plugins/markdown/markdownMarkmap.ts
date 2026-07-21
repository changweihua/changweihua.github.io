import type MarkdownIt from 'markdown-it'

export function markmapPlugin(md: MarkdownIt): void {
  // 保存原始的 fence 渲染规则
  const fence = md.renderer.rules.fence!.bind(md.renderer.rules)

  // 重写 fence 规则
  md.renderer.rules.fence = (
    tokens: any[], // 使用 any 避免类型问题
    idx: number,
    options: any,
    env: any,
    self: any
  ): string => {
    const token = tokens[idx]
    if (token.info.trim() === 'markmap') {
      const content = encodeURIComponent(token.content)
      // 生成一个占位 div，后续由 Vue 组件渲染
      return `<div class="markmap-container" data-content="${content}"></div>`
    }
    // 其他代码块走原始渲染
    return fence(tokens, idx, options, env, self)
  }
}
