// .commitlintrc.js

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 核心：只校验纯文本 type，Emoji 由 commit-prettier 负责添加
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
    'scope-enum': [2, 'always'],
    // 关闭无意义的大小写检查
    'subject-case': [0],
    'type-case': [0],
  },
  // 【关键】让 commitlint 忽略 Emoji 前缀，只校验核心内容
  parserPreset: {
    parserOpts: {
      headerPattern: /^(?<emoji>.*\s)?(?<type>\w+)(?:\((?<scope>.+)\))?!?: (?<subject>.+)$/,
      headerCorrespondence: ['emoji', 'type', 'scope', 'subject'],
    },
  },
}
