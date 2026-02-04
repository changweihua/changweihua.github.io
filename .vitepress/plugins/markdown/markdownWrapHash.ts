// .vitepress/plugins/markdownWrapHash.ts
import type MarkdownIt from 'markdown-it'
import { createHash } from 'crypto'

export interface MarkdownWrapHashOptions {
  /** 需要处理的文件夹列表 */
  targetFolders?: string[]
  /** Hash 算法，默认 'md5' */
  algorithm?: string
  /** Hash 长度，默认 8 */
  hashLength?: number
  /** 包裹元素的标签名，默认 'div' */
  wrapperTag?: string
  /** 包裹元素的 class 名 */
  wrapperClass?: string
  /** 是否在开发模式下显示日志 */
  debug?: boolean
}

/**
 * 创建 markdown-it 插件，为指定文件夹的 markdown 文件生成带 hash ID 的 div 包裹
 */
export function markdownWrapHashPlugin(md: MarkdownIt, options: MarkdownWrapHashOptions = {}) {
  const {
    targetFolders = ['blog', 'manual', 'gallery'],
    algorithm = 'md5',
    hashLength = 8,
    wrapperTag = 'div',
    wrapperClass = 'markdown-content',
    debug = process.env.NODE_ENV !== 'production',
  } = options

  // 存储当前文件的信息
  let currentFilePath = ''
  let currentFileHash = ''

  // 获取当前文件路径（从 env 中）
  function getFilePath(env: any): string {
    // console.log(env)
    return env?.relativePath || env?.path || env?.id || env?.filePath || currentFilePath
  }

  // 检查文件是否在目标文件夹中
  function isTargetFile(filePath: string): boolean {
    if (!filePath) return false

    // 转换为统一的正斜杠并标准化
    const normalizedPath = filePath.replace(/\\/g, '/')

    // 检查是否在目标文件夹中
    return targetFolders.some((folder) => {
      // 匹配路径中包含 /folder/ 的文件
      const folderPattern = new RegExp(`/(${folder})/`)
      return folderPattern.test(normalizedPath)
    })
  }

  // 计算文件内容的 hash
  function calculateHash(content: string): string {
    return createHash(algorithm).update(content).digest('hex').slice(0, hashLength)
  }

  // 在解析开始前保存文件路径和计算 hash
  md.core.ruler.before('normalize', 'wrap-hash-start', (state) => {
    const filePath = getFilePath(state.env)
    currentFilePath = filePath

    if (debug && filePath) {
      console.log(`📄 处理文件: ${filePath}`)
      console.log(`🎯 目标文件夹: ${targetFolders.join(', ')}`)
      console.log(`🔍 是否为目标文件: ${isTargetFile(filePath)}`)
    }

    // 如果是目标文件，计算 hash
    if (filePath && isTargetFile(filePath)) {
      // currentFileHash = calculateHash(state.src)
      currentFileHash = calculateHash(`/${filePath}`)

      // 保存 hash 到 frontmatter
      if (!state.env.frontmatter) {
        state.env.frontmatter = {}
      }
      state.env.frontmatter.fileHash = currentFileHash

      if (debug) {
        console.log(`✅ 生成 hash: ${currentFileHash}`)
      }
    } else {
      currentFileHash = ''
    }

    return false
  })

  // 修改渲染器，为目标文件添加包裹 div
  const defaultRender = md.renderer.render

  md.renderer.render = function (tokens, options, env) {
    const filePath = getFilePath(env)
    const isTarget = filePath && isTargetFile(filePath)
    const hash = env?.frontmatter?.fileHash || currentFileHash

    // 调用原始渲染器
    const originalHtml = defaultRender.call(this, tokens, options, env)

    // 如果不是目标文件，返回原始 HTML
    if (!isTarget || !hash) {
      return originalHtml
    }

    // 构建包裹元素
    const wrapperAttrs = [
      `id="md-${hash}"`,
      `v-hero="{ id: 'md-${hash}' }"`,
      `data-file-hash="${hash}"`,
      `data-file-path="${filePath}"`,
    ]

    if (wrapperClass) {
      wrapperAttrs.push(`class="${wrapperClass}"`)
    }

    return `<${wrapperTag} ${wrapperAttrs.join(' ')}>\n${originalHtml}\n</${wrapperTag}>`
  }

  // 清理状态
  md.core.ruler.after('linkify', 'wrap-hash-cleanup', (state) => {
    currentFilePath = ''
    currentFileHash = ''
    return false
  })
}
