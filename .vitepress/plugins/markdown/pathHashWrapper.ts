// .vitepress/plugins/pathHashWrapper.ts
import type MarkdownIt from 'markdown-it'
import { createHash } from 'crypto'

/**
 * 基于相对路径生成 hash 的 markdown-it 插件
 * 只为 blog, manual, gallery 文件夹的 markdown 添加包裹
 */
export function pathHashWrapperPlugin(md: MarkdownIt) {
  // 在渲染时处理
  const originalRender = md.renderer.render
  
  md.renderer.render = function(tokens, options, env) {
    const filePath = env?.relativePath || ''
    const html = originalRender.call(this, tokens, options, env)
    
    // 只处理目标文件夹
    if (!filePath || !isTargetFolder(filePath)) {
      return html
    }
    
    // 计算路径 hash（使用 crypto 模块）
    const hash = computePathHash(filePath)

    // 保存 hash 到 frontmatter
    if (!env.frontmatter) {
      env.frontmatter = {}
    }
    env.frontmatter.fileHash = hash

    // 返回包裹后的 HTML，使用 ClientOnly 包裹自定义组件
    return `<ClientOnly>
  <HeroWrapper hash="${hash}" file-path="${filePath}">
${html}
  </HeroWrapper>
</ClientOnly>`
  }
}

/**
 * 检查是否为 target 文件夹
 */
function isTargetFolder(filePath: string): boolean {
  if (!filePath) return false
  
  // 统一路径格式，确保以 / 开头
  const normalizedPath = ensureLeadingSlash(filePath).replace(/\\/g, '/')
  
  return normalizedPath.includes('/blog/2026') || 
         normalizedPath.includes('/manual/') || 
         normalizedPath.includes('/gallery/')
}

/**
 * 确保路径以 / 开头
 */
function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * 使用 crypto 模块计算路径 hash
 */
function computePathHash(path: string): string {
  // 确保路径以 / 开头
  const normalizedPath = ensureLeadingSlash(path)
  const normalized = normalizedPath.replace(/\\/g, '/')
  
  // 使用 crypto 模块的 createHash 函数
  const hash = createHash('md5')
    .update(normalized)
    .digest('hex')
    .slice(0, 8) // 取前8位作为短哈希
  
  return hash
}
