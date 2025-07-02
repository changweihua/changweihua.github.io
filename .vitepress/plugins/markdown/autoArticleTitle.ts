import type MarkdownIt from "markdown-it";

function hasH1Header(content) {
  if (typeof content !== "string" || content.trim().length === 0) {
    return false;
  }

  // 标准化处理：统一换行符并分割为行数组
  const lines = content.replace(/\r\n/g, "\n").split("\n");

  // 检测 h1 # 语法标题
  const h1Pattern = /^#\s+(?!#).+$/; // 排除连续的 ##
  // 检测 h2 ## 语法标题
  const h2Pattern = /^##\s+(?!#).+$/;
  const h2Idx = lines.findIndex((line) => h2Pattern.test(line));
  // 只检测 h2 标题前的部分
  const beforeH2Lines = lines.slice(0, h2Idx);

  let isCodeScope = false;
  for (let line of beforeH2Lines) {
    line = line.trim();

    if (line.startsWith("```")) {
      if (isCodeScope) {
        isCodeScope = false;
      } else {
        isCodeScope = true;
      }
    }

    if (isCodeScope) continue;

    if (h1Pattern.test(line)) {
      return true;
    }
  }

  return false;
}

export const autoArticleTitlePlugin = (md: MarkdownIt, options: {
  relativePaths: string[]
}) => {
  md.core.ruler.before("normalize", "title-to-h1", (state) => {
    try {
      // 1. 获取 frontmatter.title
      const frontmatter = state.env.frontmatter || {};
      if (options.relativePaths.find((_) => state.env["relativePath"] && state.env["relativePath"].includes(_))) {
        const title = frontmatter.title?.trim();

        // 2. 判断原文是否有一级标题
        const content = state.env?.content;
        const hasHeader = hasH1Header(content);

        // 3. 插入标题
        if (title && !hasHeader) {
          state.env.content = `\n# ${title}\n${content}`;
          state.src = `\n# ${title}\n${state.src}`;
        }
      }
    } catch (e) {
      console.error("[auto-article-plugin] 插件执行错误:", e);
    }
  });
};
