import { Token } from 'markdown-exit'

interface CodeBarOptions {
  enabled?: boolean
  barClass?: string
  minHeadingLevel?: number
  maxHeadingLevel?: number
}

/**
 * 检查代码块后面是否有标题
 */
export function hasHeadingAfter(
  tokens: Token[],
  idx: number,
  minLevel: number = 1,
  maxLevel: number = 6
): boolean {
  let i = idx + 1

  while (i < tokens.length) {
    const token = tokens[i]

    if (token.type === 'heading_open') {
      const match = token.tag.match(/^h([1-6])$/)
      if (match) {
        const level = parseInt(match[1])
        return level >= minLevel && level <= maxLevel
      }
    }

    if (isBlockElement(token)) {
      break
    }

    i++
  }

  return false
}

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

/**
 * 已在 markdown.ts 集中式 fence dispatcher 中内联处理，
 * 此插件保留为空壳以兼容已有 md.use() 调用
 */
export default function codeBarPlugin(md: any, options: CodeBarOptions = {}): void {
  // fence 处理已迁移至 markdown.ts 的集中式 dispatcher
}
