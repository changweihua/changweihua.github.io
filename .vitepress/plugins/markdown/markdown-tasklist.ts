import { StateBlock } from "markdown-it/index.js";

/**
 * 判断字符编码是否为空格（包括空格和制表符）
 * @param code 字符编码
 * @returns 如果是空格或制表符则返回 true
 */
function isSpace(code: number): boolean {
  return code === 0x20 || code === 0x09; // 空格 ( ) 或制表符 (\t)
}

/**
 * Markdown-it 插件：解析 GitHub 风格的任务列表项
 * @param state 解析器状态
 * @param startLine 起始行
 * @param endLine 结束行
 * @param silent 静默模式标志
 * @returns 是否成功处理
 */
export default function tasklist(
  state: StateBlock,
  startLine: number,
  endLine: number,
  silent: boolean
): boolean {
  // console.log('自定义任务列表插件被调用', startLine)

  let start = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];

  // 检查是否以列表标记 "- " 开头
  if (
    state.src.charCodeAt(start) !== 0x2d || // '-'
    !isSpace(state.src.charCodeAt(start + 1)) // 后续应为空格
  ) {
    return false;
  }

  // 检查任务列表标记 "[ ]" 或 "[x]" 格式
  if (
    start + 2 >= max ||
    state.src.charCodeAt(start + 2) !== 0x5b || // '['
    state.src.charCodeAt(start + 4) !== 0x5d || // ']'
    !isSpace(state.src.charCodeAt(start + 5)) // 后续应为空格
  ) {
    return false;
  }

  // 静默模式只做语法检测，不生成 token
  if (silent) return true;

  // 提取任务状态（是否完成）
  const checked =
    state.src.charCodeAt(start + 3) === 0x78 || // 'x'
    state.src.charCodeAt(start + 3) === 0x58; // 'X'

  // 创建列表项开始标签
  const token = state.push('list_item_open', 'li', 1);
  token.attrSet('class', 'task-list-item');
  token.map = [startLine, state.line];

  // 创建复选框标签
  const checkboxToken = state.push('task_list_item_checkbox', 'input', 0);
  checkboxToken.attrSet('type', 'checkbox');
  checkboxToken.attrSet('class', 'task-list-item-checkbox');
  if (checked) checkboxToken.attrSet('checked', 'checked');

  // 增加缩进以处理嵌套内容（原插件逻辑）
  state.blkIndent += 2;
  state.line = startLine + 1;

  // // 支持嵌套任务列表
  // // 在 state.line = startLine + 1; 之后添加:
  // const nextLine = state.skipEmptyLines(state.line);
  // if (nextLine < endLine && state.sCount[nextLine] > state.blkIndent) {
  //   // 有嵌套内容，继续解析
  //   state.line = nextLine;
  // }
  // // 支持嵌套任务列表

  // 创建列表项结束标签
  state.push('list_item_close', 'li', -1);

  return true;
}
