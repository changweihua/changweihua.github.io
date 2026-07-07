// .vitepress/plugins/simpleMarkdownWrap.ts
import type MarkdownIt from 'markdown-it'
import { createHash } from 'crypto'

/**
 * 简化版插件，专注于核心功能
 */
export function simpleMarkdownWrap(md: MarkdownIt) {
  const targetFolders = ['blog', 'manual', 'gallery']

  md.core.ruler.before('normalize', 'simple-wrap-hash', (state) => {
    const filePath = state.env?.path || ''

    // 检查是否是目标文件
    const isTarget =
      filePath &&
      targetFolders.some((folder) => filePath.replace(/\\/g, '/').includes(`/${folder}/`))

    if (isTarget) {
      // 计算 hash
      const hash = createHash('md5').update(state.src).digest('hex').slice(0, 8)

      // 保存到 frontmatter
      if (!state.env.frontmatter) {
        state.env.frontmatter = {}
      }
      state.env.frontmatter.fileHash = hash

      // 修改渲染器
      const originalRender = md.renderer.render
      md.renderer.render = function (tokens, options, env) {
        const html = originalRender.call(this, tokens, options, env)
        return `<div id="md-${hash}" data-file-hash="${hash}" class="markdown-content">\n${html}\n</div>`
      }
    }

    return false
  })
}
