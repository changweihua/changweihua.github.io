// .vitepress/plugins/pathHashWrapper.ts
import type MarkdownIt from 'markdown-it'

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
    
    // 计算路径 hash
    const hash = computePathHash(filePath)
    
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
  const path = filePath.replace(/\\/g, '/')
  return path.includes('/blog/') || 
         path.includes('/manual/') || 
         path.includes('/gallery/')
}

/**
 * 计算路径 hash（SSR 安全）
 */
function computePathHash(path: string): string {
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const str = normalizedPath.replace(/\\/g, '/')
  
  // 简单的字符串 hash 函数
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  
  return Math.abs(hash).toString(36).slice(0, 8)
}
