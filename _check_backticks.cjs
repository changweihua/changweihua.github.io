const fs = require('fs');
const content = fs.readFileSync('zh-CN/blog/2026-06/ai-sse.md', 'utf-8');
const lines = content.split('\n');
// 找出表格行中的反引号数量
lines.forEach((line, i) => {
  if (line.trim().startsWith('|')) {
    const backticks = (line.match(/`/g) || []).length;
    if (backticks % 2 !== 0) {
      console.log('奇数反引号表格行 L' + (i + 1) + ':', JSON.stringify(line));
    }
  }
});
console.log('=== 检查完成 ===');
