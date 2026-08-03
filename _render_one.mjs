import { createMarkdownRenderer } from 'vitepress'
import { readFileSync } from 'fs'
import { join } from 'path'
import { pathToFileURL, fileURLToPath } from 'url'

globalThis.__dirname = fileURLToPath(new URL('.', import.meta.url))

const configSrc = join(process.cwd(), '.vitepress/src/markdown.ts')
const mdConfig = (await import(pathToFileURL(configSrc).href)).default

const md = await createMarkdownRenderer(
  process.cwd(),
  mdConfig,
  '/',
  { theme: {} }
)

// 只渲染 ai-sse.md
const f = 'zh-CN/blog/2026-06/ai-sse.md'
const src = readFileSync(f, 'utf-8')
try {
  await md.render(src, { relativePath: f })
  console.log('✅ ai-sse.md 渲染成功')
} catch (e) {
  console.log('❌ ai-sse.md 仍失败:', e.message)
}
