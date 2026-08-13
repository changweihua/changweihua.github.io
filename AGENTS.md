# AGENTS.md — changweihua.github.io

个人技术博客 / 作品集网站（CMONO.NET · 常伟华），托管于 GitHub Pages（master 分支，GitHub Actions 自动部署）。

## Project

- 技术栈：**VitePress 2.0.0-alpha.19 + Vite 8 + TypeScript 7 + Vue 3**，包管理器 **npm**（`packageManager: npm@12.0.2`）
- 入口配置：`.vitepress/config.ts`（合并 `src/` 下各配置模块）
- 多语言：`zh-CN`（默认，`zh-CN/` 目录）+ `en-US`（仅 locale 配置，无内容目录）
- 内容：`zh-CN/blog/YYYY-MM/*.md`（技术博客）、`gallery/`（作品集）、`manual/`（手册）、`course/`（课程）
- 构建产物含 ECharts 地图、Mermaid、markmap、mathjax、Pagefind 搜索、RSS

## Commands（Windows 11，PowerShell）

```powershell
npm run docs:dev      # 本地开发（vitepress --mode development --host）
npm run docs:build    # 生产构建（vitepress build，CI 用）
npm run docs:preview  # 预览构建产物
npm run docs:vbuild   # vmark && vitepress build
npm test              # vitest 测试（vp test）
npm run oxc:lint      # oxlint 检查
npm run oxc:lint:fix  # oxlint 自动修复
npm run oxc:format    # oxfmt 格式化（--write）
npm run deploy        # 部署脚本
npm run check         # 检查 npm 包更新
```

- PowerShell 注意：管道 `|`、重定向 `>`、`$null` 语义与 bash 不同；多行命令用反引号续行。
- `npm install` 需完整参数（`--no-audit --no-fund` 可加速）；若遇 peer 冲突，先检查 package.json 是否残留了未使用的 markdown-it 生态包（详见 Conventions）。

## Architecture

- `.vitepress/config.ts` — 主配置：vite（build/css/ssr/alias）、插件注册、`manualChunks` chunk 拆分、sitemap
- `.vitepress/src/` — 配置模块：`docs.ts`（根配置）、`theme.ts`（主题）、`markdown.ts`（markdown 插件）、`head.ts`、`rss.ts`、`configs/{zh-CN,en-US}.config.ts`（locale 主题）
- `.vitepress/plugins/` — 自定义插件：`markdown/` 下 `echarts-markdown.ts`、`markdownMarkmap.ts`、`codeBarPlugin.ts`、`markdown-it-picture.ts`、`pathHashWrapper.ts`
- `.vitepress/*.data.ts` — VitePress 数据加载器：`post.data.ts`（全量文章/归档/标签）、`blog.data.ts`（当月最新）、`posts.data.ts`（带封面文章）、`manual.data.ts`
- `.vitepress/components/` — Vue 组件（`BlogIndex.vue`、`HomeIndex.vue`、`Date.vue`、`ArticleMetadata` 等）
- `src/` — Vue 组件源码（`src/components/ArchiveList.vue` 等，经 `@vp` 别名映射到 `.vitepress`）

## Conventions

- **markdown fence 处理必须走集中式 dispatcher**：`.vitepress/src/markdown.ts` 中的 `md.renderer.rules.fence` 统一分发（markmap / echarts / codeBar / languageLabel）。禁止在 `plugins/markdown/` 的新插件里直接覆写 `fence`（会破坏链式调用）。
- **博客 frontmatter 必须有 `date`**（东八区），格式支持 `YYYY-MM-DD HH:mm:ss`、`YYYY-MM-DD`、`YYYY-MM`（小时可补零也可不补）。日期解析在 `post.data.ts` / `blog.data.ts` 的 `parseEast8Date`，两处需同步修改。
- **表格单元格内反引号必须成对**：vitepress 2.0.0-alpha.19 的表格 transform 会因奇数反引号崩溃（`Cannot read properties of undefined (reading '0')`），写作时注意 `` `AbortController` `` 之类不要错位。
- vitepress 2.0.0-alpha.19 markdown 配置项名：`image.lazyLoad`、`codeCopyButton.tooltipText`（旧名 `lazyLoading`/`codeCopyButtonTitle` 已移除）；主题用 `lastUpdated.text`（旧 `lastUpdatedText` 已移除）。
- **不要安装与 vitepress 内置能力重复的 markdown-it 插件**（footnote、tasklist 等已内置）；安装 markdown-it 生态包时注意 peer 依赖需兼容 `markdown-it@15`（`markdown-it-image-size` 等要求 `<15` 的包会引发 npm eresolve 冲突）。
- 类型包（`@types/*`）放 `devDependencies`，不要放 `dependencies`。
- 提交规范：commitizen + conventional commits（gitmoji 前缀，如 `:sparkles: feat:`）；lint-staged 会跑 eslint。
- 代码规范：oxlint 检查、oxfmt 格式化；不用 prettier（已被 oxfmt 取代，虽在 devDependencies 但非主力）。
- 目录约定：忽略 `node_modules/`、`public/`、`fonts/`、`fonts-spider/`、`.github/`（分析代码时跳过这些）。
- 路径注意：Windows 文件路径用反斜杠，但 VitePress URL / `manualChunks` 的 `id` 匹配统一用正斜杠 `/`。

## Notes

- （预留：后续补充已知坑点、调试技巧等）
