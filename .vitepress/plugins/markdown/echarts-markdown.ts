import type MarkdownIt from 'markdown-it'

export default function echartsMarkdownPlugin(md: MarkdownIt): void {
  // 保存原有的 fence 函数
  const fence = md.renderer.rules.fence?.bind(md.renderer.rules)
  // 定义我们自己的 fence 函数
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    // 通过token上的 info 获取代码块的语言
    const token = tokens[idx];
    const language = token.info.trim();
    // 此处判断是否为 echarts 代码块
    if (language.startsWith("echarts")) {
      // eChartOption.value = JSON.parse(tokens[idx].content); //此处表示将内容存起来，存到当前页面的变量去
      // 将代码块渲染成 html，这里替换成我们自己定义的vue组件
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
        </Suspense>`;
    }

    // 对不是我们需要的代码块的直接调用原有的函数
    return fence!(tokens, idx, options, env, self)
  }
}
