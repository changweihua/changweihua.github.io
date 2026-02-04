import { createHash } from 'crypto'
import type { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function contentHashPlugin(): Plugin {
  const fileHashMap = new Map()

  return {
    name: 'content-hash-plugin',

    // 构建时处理
    async transform(code, id) {
      if (id.endsWith('.md')) {
        // 读取文件原始内容
        const filePath = id
        const content = fs.readFileSync(filePath, 'utf-8')

        // 计算 MD5 hash
        const hash = createHash('md5').update(content).digest('hex').substring(0, 8)

        fileHashMap.set(id, hash)

        // 在 frontmatter 中注入 hash
        const frontmatterMatch = code.match(/^---\n([\s\S]*?)\n---/)
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1]
          if (!frontmatter.includes('contentHash')) {
            const updatedFrontmatter = `${frontmatter}\ncontentHash: ${hash}`
            code = code.replace(frontmatter, updatedFrontmatter)
          }
        } else {
          // 如果没有 frontmatter，添加一个
          code = `---\ncontentHash: ${hash}\n---\n${code}`
        }

        return code
      }
    },

    // // 获取 hash 映射表
    // getFileHashMap() {
    //   return fileHashMap
    // },
  }
}
