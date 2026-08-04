import type MarkdownIt from 'markdown-it'

/**
 * 检查 token 是否为 echarts 代码块，是则返回渲染后的 HTML，否则返回 null
 */
export function renderEchartsBlock(tokens: any[], idx: number): string | null {
  const token = tokens[idx]
  const language = token.info.trim()
  if (language.startsWith('echarts')) {
    return `
        <Suspense>
          <template #default>
            <ClientOnly>
              <MarkdownEChart id="echart-${idx}" code="${encodeURIComponent(token.content)}"></MarkdownEChart>
            </ClientOnly>
          </template>
          <!-- loading state via #fallback slot -->
          <template #fallback>
            Loading...
          </template>
        </Suspense>`
  }
  return null
}

/**
 * markdown-it 插件（不覆写 fence，由集中式 dispatcher 调用 renderEchartsBlock）
 * 保留以兼容 md.use() 调用，但 fence 处理改为推荐方式
 */
export default function echartsMarkdownPlugin(md: MarkdownIt): void {
  // fence 处理已迁移至 markdown.ts 的集中式 dispatcher
  // 此插件保留为占位符，供未来可能需要的 md 扩展使用
}
