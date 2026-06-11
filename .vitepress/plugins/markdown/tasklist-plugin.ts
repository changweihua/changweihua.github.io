// tasklist-plugin.ts
import type MarkdownIt from 'markdown-it';
import { StateBlock } from 'markdown-it/index.js';

/**
 * 插件选项
 */
export interface TasklistPluginOptions {
  /** 要忽略的路径片段（包含该片段的文件不解析任务列表） */
  ignorePath?: string | RegExp;
  /** 是否启用调试日志 */
  debug?: boolean;
  /** 自定义复选框的 CSS 类名 */
  checkboxClass?: string;
  /** 自定义列表项的 CSS 类名 */
  listItemClass?: string;
  /** 是否强制禁用内置的任务列表规则（默认 true） */
  disableBuiltin?: boolean;
}

/**
 * 判断字符是否为空格或制表符
 */
function isSpace(code: number): boolean {
  return code === 0x20 || code === 0x09;
}

/**
 * 默认选项
 */
const defaultOptions: TasklistPluginOptions = {
  ignorePath: '/blog/',
  debug: false,
  checkboxClass: 'task-list-item-checkbox',
  listItemClass: 'task-list-item',
  disableBuiltin: true,
};

/**
 * 自定义任务列表插件（直接生成 HTML 块，避免内置规则冲突）
 */
export default function tasklistPlugin(
  md: MarkdownIt,
  userOptions: TasklistPluginOptions = {}
): void {
  const options = { ...defaultOptions, ...userOptions };
  const { ignorePath, debug, checkboxClass, listItemClass, disableBuiltin } = options;

  // 日志辅助函数
  const log = debug ? console.log.bind(console, '[tasklist]') : () => {};

  // ========== 1. 强制禁用常见的内置任务列表规则 ==========
  if (disableBuiltin) {
    const builtinRuleNames = ['task_list', 'tasklist', 'gfm_tasklist'];
    builtinRuleNames.forEach((name) => {
      try {
        md.block.ruler.disable(name);
        log(`已禁用内置规则: ${name}`);
      } catch {
        // 规则不存在，忽略
      }
    });
  }

  // ========== 2. 自定义块级解析规则 ==========
  function tasklistRule(state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean {
    // ---------- 2.1 路径过滤 ----------
    const env = state.env as any;
    const filePath = env.relativePath || env.path || '';
    if (ignorePath) {
      const shouldIgnore =
        typeof ignorePath === 'string'
          ? filePath.includes(ignorePath)
          : ignorePath.test(filePath);
      if (shouldIgnore) {
        log(`路径 ${filePath} 匹配忽略规则，跳过任务列表解析`);
        return false; // 交由其他规则处理（如普通列表）
      }
    }

    // ---------- 2.2 语法检测 ----------
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    // 必须以 "- " 开头
    if (state.src.charCodeAt(pos) !== 0x2D /* - */ || !isSpace(state.src.charCodeAt(pos + 1))) {
      return false;
    }

    // 必须是 "[ ] " 或 "[x] " 格式
    if (
      pos + 2 >= max ||
      state.src.charCodeAt(pos + 2) !== 0x5B /* [ */ ||
      state.src.charCodeAt(pos + 4) !== 0x5D /* ] */ ||
      !isSpace(state.src.charCodeAt(pos + 5))
    ) {
      return false;
    }

    // 静默模式只检测语法，不生成内容
    if (silent) return true;

    // ---------- 2.3 解析复选框状态 ----------
    const checked =
      state.src.charCodeAt(pos + 3) === 0x78 /* x */ ||
      state.src.charCodeAt(pos + 3) === 0x58 /* X */;

    // ---------- 2.4 提取任务标题内容 ----------
    const contentStart = pos + 6; // 跳过 "- [x] " 共 6 个字符
    const content = state.src.slice(contentStart, max).trim();

    log(`行 ${startLine}: 解析任务列表，内容="${content}"，已选中=${checked}`);

    // ---------- 2.5 渲染内联内容（支持粗体、链接等） ----------
    const inlineContent = content ? md.renderInline(content) : '';

    // ---------- 2.6 构建完整的 <li> HTML ----------
    const checkedAttr = checked ? 'checked' : '';
    const html = `<li class="${listItemClass}"><input type="checkbox" ${checkedAttr} class="${checkboxClass}"> ${inlineContent}</li>`;

    // ---------- 2.7 插入为 html_block token ----------
    const token = state.push('html_block', '', 0);
    token.content = html;
    token.map = [startLine, startLine + 1];

    // ---------- 2.8 标记当前行已处理，跳过后续解析 ----------
    state.line = startLine + 1;
    return true;
  }

  // ========== 3. 注册自定义规则（插入到内置 'list' 规则之前） ==========
  md.block.ruler.before('list', 'custom_tasklist', tasklistRule);
  log('自定义任务列表规则已注册');
}
