// .vitepress/plugins/simpleComponentWrap.ts
import type MarkdownIt from 'markdown-it'

/**
 * 简化的组件包装插件
 */
export function simpleComponentWrapPlugin(md: MarkdownIt) {
  const targetFolders = ['blog', 'manual', 'gallery']

  md.core.ruler.push('simple-component-wrap', (state) => {
    const filePath = state.env?.relativePath || ''

    // 提取文件夹类型
    let folder = ''
    for (const f of targetFolders) {
      if (filePath.includes(`/${f}/`)) {
        folder = f
        break
      }
    }

    if (!folder) return false

    // 简单哈希计算
    let hash = 0
    for (let i = 0; i < filePath.length; i++) {
      const char = filePath.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    const hashStr = Math.abs(hash).toString(36).slice(0, 8)

    // 插入组件
    const openToken = new state.Token('html_block', '', 0)
    openToken.content = `<HeroWrapper hash="${hashStr}" folder="${folder}">`

    const closeToken = new state.Token('html_block', '', 0)
    closeToken.content = '</HeroWrapper>'

    state.tokens.unshift(openToken)
    state.tokens.push(closeToken)

    return false
  })
}
