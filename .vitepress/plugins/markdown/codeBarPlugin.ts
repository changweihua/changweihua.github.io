import { Token } from 'markdown-exit'
import type MarkdownIt from 'markdown-it'

interface CodeBarOptions {
  enabled?: boolean
  barClass?: string
  minHeadingLevel?: number
  maxHeadingLevel?: number
}

export default function codeBarPlugin(md: MarkdownIt, options: CodeBarOptions = {}): void {
  const {
    enabled = true,
    barClass = 'code-bar',
    minHeadingLevel = 1,
    maxHeadingLevel = 6
  } = options

  if (!enabled) return

  const originalFence = md.renderer.rules.fence

  md.renderer.rules.fence = function(tokens: Token[], idx: number, options: any, env: any, self: any) {
    const original = originalFence
      ? originalFence(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options)

    // 检查代码块后面是否有符合条件的标题
    if (hasHeadingAfter(tokens, idx, minHeadingLevel, maxHeadingLevel)) {
      return `${original}<div class="${barClass}"></div>`
    }

    return original
  }

  // 辅助函数：检查代码块后面是否有标题
  function hasHeadingAfter(tokens: Token[], idx: number, minLevel: number, maxLevel: number): boolean {
    let i = idx + 1

    while (i < tokens.length) {
      const token = tokens[i]

      // 如果是标题开始标签
      if (token.type === 'heading_open') {
        const match = token.tag.match(/^h([1-6])$/)
        if (match) {
          const level = parseInt(match[1])
          // 检查标题级别是否符合要求
          return level >= minLevel && level <= maxLevel
        }
      }

      // 如果遇到其他块级元素，停止搜索
      if (isBlockElement(token)) {
        break
      }

      i++
    }

    return false
  }

  // 辅助函数：判断是否为块级元素
  function isBlockElement(token: Token): boolean {
    const blockTypes = [
      'heading_open',
      'paragraph_open',
      'blockquote_open',
      'list_item_open',
      'bullet_list_open',
      'ordered_list_open',
      'hr',
      'table_open',
      'fence'
    ]

    return blockTypes.includes(token.type)
  }
}
