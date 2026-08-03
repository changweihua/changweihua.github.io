import { createMarkdownRenderer } from 'vitepress'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, relative } from 'path'
import { pathToFileURL, fileURLToPath } from 'url'
import { glob } from 'glob'

// polyfill CJS __dirname（markdown.ts 使用）
globalThis.__dirname = fileURLToPath(new URL('.', import.meta.url))

// 加载项目的 markdown 配置
const configSrc = join(process.cwd(), '.vitepress/src/markdown.ts')
const mdConfig = (await import(pathToFileURL(configSrc).href)).default

const md = await createMarkdownRenderer(
  process.cwd(),
  mdConfig,
  '/',
  { theme: {} }
)

const files = glob.sync('zh-CN/blog/**/!(index|README).md')
const failed = []

for (const f of files) {
  const src = readFileSync(f, 'utf-8')
  try {
    await md.render(src, { relativePath: relative(process.cwd(), f) })
  } catch (e) {
    failed.push({ file: f, error: e.message })
  }
}

console.log('共渲染:', files.length, '失败:', failed.length)
failed.forEach(f => console.log('  ❌', f.file, '→', f.error))
