// .vitepress/plugins/componentHeroWrap.ts
import type MarkdownIt from 'markdown-it'

export interface ComponentHeroWrapOptions {
  /** 需要处理的文件夹列表 */
  targetFolders?: string[]
  /** 是否启用 Hero 动画 */
  enableHero?: boolean
  /** 是否包含文件路径信息 */
  includeFilePath?: boolean
}

/**
 * 使用 Vue 组件方案的 markdown-it 插件
 * 为指定文件夹的 markdown 文件插入 HeroWrapper 组件
 */
export function componentHeroWrapPlugin(
  md: MarkdownIt,
  options: ComponentHeroWrapOptions = {}
): void {
  const {
    targetFolders = ['blog', 'manual', 'gallery'],
    enableHero = true,
    includeFilePath = true,
  } = options

  // 判断文件是否在目标文件夹中
  function isTargetFile(filePath: string): boolean {
    if (!filePath) return false
    const normalized = filePath.replace(/\\/g, '/')
    return targetFolders.some((folder) => normalized.includes(`/${folder}/`))
  }

  // 从文件路径中提取文件夹类型
  function getFolderType(filePath: string): 'blog' | 'manual' | 'gallery' | '' {
    const normalized = filePath.replace(/\\/g, '/')
    if (normalized.includes('/blog/')) return 'blog'
    if (normalized.includes('/manual/')) return 'manual'
    if (normalized.includes('/gallery/')) return 'gallery'
    return ''
  }

  // SSR 安全的路径哈希函数
  function computePathHash(filePath: string): string {
    let hash = 0
    const str = filePath.replace(/\\/g, '/')
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36).slice(0, 8)
  }

  // 在 markdown 解析阶段插入组件
  md.core.ruler.push('component-hero-wrap', (state) => {
    const filePath = state.env?.relativePath || state.env?.path || ''

    // 检查是否为目标文件
    const folder = getFolderType(filePath)
    if (!folder || !targetFolders.includes(folder)) {
      return false
    }

    // 计算路径哈希
    const hash = computePathHash(filePath)

    // 保存到 frontmatter
    if (!state.env.frontmatter) state.env.frontmatter = {}
    state.env.frontmatter.fileHash = hash
    state.env.frontmatter.filePath = filePath
    state.env.frontmatter.folder = folder

    // 构建 HeroWrapper 组件的属性
    const attrs = [`hash="${hash}"`, `folder="${folder}"`, `:hero-enabled="${enableHero}"`]

    if (includeFilePath) {
      attrs.push(`file-path="${filePath}"`)
    }

    // 创建 HeroWrapper 组件的开始和结束标记
    const openToken = new state.Token('html_block', '', 0)
    openToken.content = `<HeroWrapper ${attrs.join(' ')}>`

    const closeToken = new state.Token('html_block', '', 0)
    closeToken.content = '</HeroWrapper>'

    // 插入到 tokens 数组的开头和结尾
    state.tokens.unshift(openToken)
    state.tokens.push(closeToken)

    // 可选：添加调试信息（只在开发环境）
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🎯 插入 HeroWrapper 组件:`, {
        filePath,
        hash,
        folder,
        tokensCount: state.tokens.length,
      })
    }

    return false
  })
}
