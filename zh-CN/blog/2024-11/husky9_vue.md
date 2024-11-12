---
lastUpdated: true
commentabled: true
recommended: true
title: Husky(husky9.x版本适配) + Lint-staged + Commitlint + Commitizen + cz-git 配置 Git 提交规范
description: Husky(husky9.x版本适配) + Lint-staged + Commitlint + Commitizen + cz-git 配置 Git 提交规范
date: 2024-11-12 10:18:00
pageClass: blog-page-class
---

# Husky(husky9.x版本适配) + Lint-staged + Commitlint + Commitizen + cz-git 配置 Git 提交规范 #

## Husky ##

`Husky` 是 `Git` 钩子工具，可以设置在 `git` 各个阶段（`pre-commit`、`commit-msg` 等）触发。 

官方网站：[https://typicode.github.io/husky](https://typicode.github.io/husky)

### Husky 安装方式 ###

**安装命令**

```bash
npm install --save-dev husky
npx husky init
```
自动生成的 `.husky` 目录和指令：

![alt text](/images/cmono-QQ图片20241112095144.png)

## Lint-staged ##

lint-staged 是一个在 git add 到暂存区的文件运行 linters (ESLint/Prettier/StyleLint) 的工具，避免在 git commit 提交时在整个项目执行。lint-staged 可以让你当前的代码检查 只检查本次修改更新的代码，并在出现错误的时候，自动修复并且推送

官方网站：[https://github.com/okonet/lint-staged](https://github.com/okonet/lint-staged)

### Lint-staged 安装 ###

```bash
npm install --save-dev lint-staged 
```

### Lint-staged 配置 ###

**检测/格式化配置**

`package.json` 中添加不同文件在 git 提交执行的 lint 检测配置

```json
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.{cjs,json}": [
      "prettier --write"
    ],
    "*.{vue,html}": [
      "eslint --fix",
      "prettier --write",
      "stylelint --fix"
    ],
    "*.{scss,css}": [
      "stylelint --fix",
      "prettier --write"
    ],
    "*.md": [
      "prettier --write"
    ]
  }
```

**添加 lint-staged 指令**

`package.json` 的 scripts 添加 lint-staged 指令:

```json
  "scripts": {
    "lint:lint-staged": "lint-staged"
  }
```

**修改提交前钩子命令**

根目录 `.husky` 目录下 `pre-commit` 文件中的 `npm test` 修改为 

```bash
npm run lint:lint-staged
```

![alt text](/images/cmono-QQ图片20241112095633.png)

**Git 提交代码检测**

```bash
git commit -m "test husky lint-staged"
```

![alt text](/images/cmono-QQ图片20241112095812.png)

## Commitlint ##

Commitlint 检查您的提交消息是否符合 Conventional commit format。-- 

### Commitlint 安装 ###

参考 [官方安装文档](https://commitlint.js.org/#/?id=getting-started)

```bash
npm install --save-dev @commitlint/config-conventional @commitlint/cli
```
 
### Commitlint 配置 ###

根目录下创建 `commitlint.config.js` 配置文件，注意：确保保存为 `UTF-8` 的编码格式，否则可能会出现错误。

```bash
echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js
```

### 增加配置项 ###

```ts
export default {
  // 继承的规则
  extends: ['@commitlint/config-conventional'],
   // @see: https://commitlint.js.org/#/reference-rules
  rules: {
    'subject-case': [0], // subject大小写不做校验
 
    // 类型枚举，git提交type必须是以下类型
    'type-enum': [
      // 当前验证的错误级别
      2,
      // 在什么情况下进行验证，always表示一直进行验证
      'always',
      [
        'feat', // 新增功能
        'fix', // 修复缺陷
        'docs', // 文档变更
        'style', // 代码格式（不影响功能，例如空格、分号等格式修正）
        'refactor', // 代码重构（不包括 bug 修复、功能新增）
        'perf', // 性能优化
        'test', // 添加疏漏测试或已有测试改动
        'build', // 构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）
        'ci', // 修改 CI 配置、脚本
        'revert', // 回滚 commit
        'chore' // 对构建过程或辅助工具和库的更改（不影响源文件、测试用例）
      ]
    ]
  }
}
```

### 添加提交信息校验钩子 ###

执行下面命令生成 `commint-msg` 钩子用于 git 提交信息校验，`husky9.x`版本适配

```bash
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

![alt text](/images/cmono-QQ图片20241112100253.png)

> husky9.x版本下此命令生成的 `commint-msg` 配置（编码格式为`UTF-16LE`）：

`git  commit -m "不规范的提交"`。测试错误如下：

```text
.husky/commit-msg: .husky/commit-msg: cannot execute binary file
husky - commit-msg script failed (code 126)
```

> 解决办法：更改 `.husky`s 目录下 `pre-commit` 文件的编码格式为  `UTF-8` 的编码格式

### Commitlint 验证 ###

正确的提交格式：`<type>(<scope>): <subject>` ，type 和 subject 默认必填

## Commitizen & cz-git ##

- commitizen: 基于Node.js的 git commit 命令行工具，辅助生成标准化规范化的 commit message。–官方文档
- cz-git: 一款工程性更强，轻量级，高度自定义，标准输出格式的 commitizen 适配器。-官方文档
Commitizen 安装

### 全局安装Commitizen ###

```bash
npm install -g commitizen
```

### cz-git 安装 ###

**步骤 1: 下载依赖**

```bash
npm install -D cz-git
```

**步骤 2: 修改 package.json 添加 config 指定使用的适配器**

```json
{
  "scripts": {
 
  },
  "config": {
    "commitizen": {
      "path": "node_modules/cz-git"
    }
  }
}
```

cz-git 与 commitlint 进行联动给予校验信息，所以可以编写于 commitlint 配置文件(commitlint.config.js)之中

```js
export default {
  // 继承的规则
  extends: ['@commitlint/config-conventional'],
  // 自定义规则
  rules: {
    // @see https://commitlint.js.org/#/reference-rules

    // 提交类型枚举，git提交type必须是以下类型
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新增功能
        'fix', // 修复缺陷
        'docs', // 文档变更
        'style', // 代码格式（不影响功能，例如空格、分号等格式修正）
        'refactor', // 代码重构（不包括 bug 修复、功能新增）
        'perf', // 性能优化
        'test', // 添加疏漏测试或已有测试改动
        'build', // 构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）
        'ci', // 修改 CI 配置、脚本
        'revert', // 回滚 commit
        'chore' // 对构建过程或辅助工具和库的更改（不影响源文件、测试用例）
      ]
    ],
    'subject-case': [0] // subject大小写不做校验
  },

  prompt: {
    messages: {
      type: '选择你要提交的类型 :',
      scope: '选择一个提交范围（可选）:',
      customScope: '请输入自定义的提交范围 :',
      subject: '填写简短精炼的变更描述 :\n',
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footerPrefixesSelect: '选择关联issue前缀（可选）:',
      customFooterPrefix: '输入自定义issue前缀 :',
      footer: '列举关联issue (可选) 例如: #31, #I3244 :\n',
      generatingByAI: '正在通过 AI 生成你的提交简短描述...',
      generatedSelectByAI: '选择一个 AI 生成的简短描述:',
      confirmCommit: '是否提交或修改commit ?'
    },
    // prettier-ignore
    types: [
      { value: "feat", name: "特性:     ✨  新增功能", emoji: ":sparkles:" },
      { value: "fix", name: "修复:     🐛  修复缺陷", emoji: ":bug:" },
      { value: "docs", name: "文档:     📝  文档变更", emoji: ":memo:" },
      { value: "style", name: "格式:     🌈  代码格式（不影响功能，例如空格、分号等格式修正）", emoji: ":lipstick:" },
      { value: "refactor", name: "重构:     🔄  代码重构（不包括 bug 修复、功能新增）", emoji: ":recycle:" },
      { value: "perf", name: "性能:     🚀  性能优化", emoji: ":zap:" },
      { value: "test", name: "测试:     🧪  添加疏漏测试或已有测试改动", emoji: ":white_check_mark:" },
      { value: "build", name: "构建:     📦️  构建流程、外部依赖变更（如升级 npm 包、修改 vite 配置等）", emoji: ":package:" },
      { value: "ci", name: "集成:     ⚙️  修改 CI 配置、脚本", emoji: ":ferris_wheel:" },
      { value: "revert", name: "回退:     ↩️  回滚 commit", emoji: ":rewind:" },
      { value: "chore", name: "其他:     🛠️  对构建过程或辅助工具和库的更改（不影响源文件、测试用例）", emoji: ":hammer:" },
    ],
    useEmoji: true,
    emojiAlign: 'center',
    useAI: false,
    aiNumber: 1,
    themeColorCode: '',
    scopes: [],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: [],
    issuePrefixes: [{ value: 'closed', name: 'closed:   ISSUES has been processed' }],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    customIssuePrefixAlias: 'custom',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: Infinity,
    maxSubjectLength: Infinity,
    minSubjectLength: 0,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: ''
  }
}
```

### cz-git 验证 ###

执行 `git cz` 指令进行代码提交流程，执行前需将改动的文件通过 `git add` 添加到暂存区

执行命令之后会出现询问交互，根据提示一步步的完善 `commit msg` 信息。

![alt text](/images/cmono-QQ图片20241112100735.png)


 