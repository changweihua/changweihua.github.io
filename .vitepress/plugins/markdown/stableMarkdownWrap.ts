// .vitepress/plugins/stableMarkdownWrap.ts
import type MarkdownIt from 'markdown-it'
import { createHash } from 'crypto'

export interface WrapOptions {
  targetFolders?: string[]
  wrapperClass?: string
  hashLength?: number
}

/**
 * 更稳定的版本，通过修改 token 而不是渲染器
 */
export function stableMarkdownWrap(md: MarkdownIt, options: WrapOptions = {}) {
  const {
    targetFolders = ['blog', 'manual', 'gallery'],
    wrapperClass = 'markdown-content',
    hashLength = 8,
  } = options

  // 保存当前文件信息
  const fileInfo = new WeakMap<any, { hash: string; isTarget: boolean }>()

  // 前置处理器：计算 hash 并判断是否为目标文件
  md.core.ruler.before('normalize', 'wrap-hash-prepare', (state) => {
    const filePath = state.env?.path || ''
    const isTarget =
      filePath &&
      targetFolders.some((folder) => filePath.replace(/\\/g, '/').includes(`/${folder}/`))

    let hash = ''
    if (isTarget) {
      hash = createHash('md5').update(state.src).digest('hex').slice(0, hashLength)

      // 保存到 frontmatter
      if (!state.env.frontmatter) {
        state.env.frontmatter = {}
      }
      state.env.frontmatter.fileHash = hash
    }

    fileInfo.set(state.env, { hash, isTarget })
    return false
  })

  // 后置处理器：为目标文件添加包裹 token
  md.core.ruler.after('inline', 'wrap-hash-apply', (state) => {
    const info = fileInfo.get(state.env)

    if (info?.isTarget && info.hash) {
      // 创建开始 token
      const openToken = new state.Token('html_block', '', 0)
      openToken.content = `<div id="md-${info.hash}" data-file-hash="${info.hash}" class="${wrapperClass}">`

      // 创建结束 token
      const closeToken = new state.Token('html_block', '', 0)
      closeToken.content = '</div>'

      // 在 tokens 数组的开头和结尾插入
      state.tokens.unshift(openToken)
      state.tokens.push(closeToken)
    }

    return false
  })
}
