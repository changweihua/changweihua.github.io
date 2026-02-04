// .vitepress/plugins/frontmatterHash.ts
import type { Plugin } from 'vite'
import { createHash } from 'crypto'
import fs from 'fs'

export interface FrontmatterHashOptions {
  /** Hash 算法，默认 'md5' */
  algorithm?: string
  /** Hash 长度，默认 8 */
  length?: number
  /** 添加到 frontmatter 的字段名，默认 'fileHash' */
  fieldName?: string
}

/**
 * 简化的前端向 frontmatter 添加 hash 的插件
 */
export default function frontmatterHashPlugin(options: FrontmatterHashOptions = {}): Plugin {
  const { algorithm = 'md5', length = 8, fieldName = 'fileHash' } = options

  return {
    name: 'vitepress-frontmatter-hash',

    // 处理 markdown 文件
    transform(code: string, id: string) {
      if (!id.endsWith('.md')) {
        return null
      }

      try {
        // 读取文件原始内容（确保一致性）
        const fileContent = fs.readFileSync(id, 'utf-8')

        // 计算文件内容的 hash
        const hash = createHash(algorithm).update(fileContent).digest('hex').slice(0, length)

        // 检查是否已有 frontmatter
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
        const match = code.match(frontmatterRegex)

        if (match) {
          // 已有 frontmatter，检查是否已有 hash 字段
          const frontmatterContent = match[1]
          const hashLineRegex = new RegExp(`^${fieldName}:\\s*.+$`, 'm')

          if (hashLineRegex.test(frontmatterContent)) {
            // 已存在 hash 字段，替换它
            const updatedContent = frontmatterContent.replace(
              hashLineRegex,
              `${fieldName}: ${hash}`
            )
            return code.replace(frontmatterContent, updatedContent)
          } else {
            // 不存在 hash 字段，添加到 frontmatter 末尾
            const updatedFrontmatter = `${frontmatterContent}\n${fieldName}: ${hash}`
            return code.replace(frontmatterContent, updatedFrontmatter)
          }
        } else {
          // 没有 frontmatter，创建一个
          return `---\n${fieldName}: ${hash}\n---\n\n${code}`
        }
      } catch (error) {
        console.warn(`Failed to add hash to ${id}:`, error)
        return code
      }
    },
  }
}
