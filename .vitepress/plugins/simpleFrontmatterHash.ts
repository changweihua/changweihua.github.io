// .vitepress/plugins/simpleFrontmatterHash.ts
import type { Plugin } from 'vite'
import { createHash } from 'crypto'

export default function simpleFrontmatterHashPlugin(): Plugin {
  return {
    name: 'vitepress-simple-frontmatter-hash',

    // 处理 markdown 文件
    transform(code: string, id: string) {
      if (!id.endsWith('.md')) {
        return null
      }

      try {
        // 直接使用传入的 code 计算 hash（适用于大多数情况）
        const hash = createHash('md5').update(code).digest('hex').slice(0, 8)

        // 检查是否已有 frontmatter
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
        const match = code.match(frontmatterRegex)

        if (match) {
          // 已有 frontmatter，添加或更新 fileHash
          const frontmatterContent = match[1]
          const hashLineRegex = /^fileHash:\s*.+$/m

          if (hashLineRegex.test(frontmatterContent)) {
            // 替换现有的 fileHash
            const updatedContent = frontmatterContent.replace(hashLineRegex, `fileHash: ${hash}`)
            return code.replace(frontmatterContent, updatedContent)
          } else {
            // 添加新的 fileHash
            const updatedFrontmatter = `${frontmatterContent}\nfileHash: ${hash}`
            return code.replace(frontmatterContent, updatedFrontmatter)
          }
        } else {
          // 没有 frontmatter，创建一个
          return `---\nfileHash: ${hash}\n---\n\n${code}`
        }
      } catch (error) {
        console.warn(`Failed to add hash to ${id}:`, error)
        return code
      }
    },
  }
}
