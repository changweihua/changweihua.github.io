// .vitepress/plugins/pathHashWrapper.ts
import type MarkdownIt from 'markdown-it'

/**
 * 基于相对路径生成 hash 的 markdown-it 插件
 * 只为 blog, manual, gallery 文件夹的 markdown 添加包裹
 */
export function pathHashWrapperPlugin(md: MarkdownIt) {
  // 缓存计算结果，提高性能
  const hashCache = new Map<string, string>()
  
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
    const hash = computePathHash(`/${filePath}`, hashCache)
    
    // 返回包裹后的 HTML，使用自定义组件
    return `<HeroWrapper hash="${hash}" file-path="${filePath}">
${html}
</HeroWrapper>`
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
function computePathHash(path: string, cache: Map<string, string>): string {
  // 检查缓存
  if (cache.has(path)) {
    return cache.get(path)!
  }
  
  // 简单的字符串 hash 函数
  let hash = 0
  const str = path.replace(/\\/g, '/')
  
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  
  const result = Math.abs(hash).toString(36).slice(0, 8)
  cache.set(path, result)
  
  return result
}
