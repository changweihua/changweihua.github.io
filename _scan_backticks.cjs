const fs = require('fs');
const glob = require('glob');

const files = glob.sync('**/*.md', {
  ignore: ['node_modules/**', '.vitepress/**', 'public/**', 'fonts/**', '.github/**', 'dist/**', 'fonts-spider/**']
});

let issues = [];
files.forEach(f => {
  const lines = fs.readFileSync(f, 'utf-8').split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith('|')) {
      const backticks = (line.match(/`/g) || []).length;
      if (backticks % 2 !== 0) {
        issues.push({ file: f, line: i + 1, text: line.trim().substring(0, 120) });
      }
    }
  });
});

console.log('表格行反引号奇数问题总数:', issues.length);
issues.forEach(iss => console.log('  ', iss.file + ' L' + iss.line + ':', iss.text));
