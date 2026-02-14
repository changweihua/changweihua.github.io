import antfu from '@antfu/eslint-config'
import oxlint from 'eslint-plugin-oxlint';

export default [
  antfu({
    vue: {
      'vue/block-order': [
        'error',
        {
          // 块顺序
          order: ['script', 'template', 'style']
        }
      ]
    },
    typescript: true,
    stylistic: {
      indent: 2, // 缩进
      semi: false, // 语句分号
      quotes: 'single' // 单引号
    },
    rules: {
      'new-cap': ['off', { newIsCap: true, capIsNew: false }],
      'no-console': 'off' // 忽略console
    },
    ignores: ['dist/**', 'node_modules/**', '**/types/**','**/**.md', 'public/**', 'vite.config.ts', 'eslint.config.js']
  }),
  ...oxlint.configs['flat/recommended'], // oxlint should be the last one
  // ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json'),
]

