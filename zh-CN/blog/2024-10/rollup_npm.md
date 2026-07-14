---
lastUpdated: true
commentabled: true
recommended: true
title:  Rollup+Typescript5+Babel7+Eslint9+Prettier3
description: Rollup+Typescript5+Babel7+Eslint9+Prettier3
date: 2024-10-17 13:18:00
pageClass: blog-page-class
---

# Rollup+Typescript5+Babel7+Eslint9+Prettier3 #

## 前言 ##

项目需要开发一个JS库，打包工具选择了`Rollup`,本人比较爱折腾，于是乎从0-1手动搭建配置项目工程，`typescript`、`Babel`、`Eslint`、`Prettier`全部使用了最新版本。

### 初始化项目目录 ###

**新建文件目录**

```bash
mkdir rollup-ts
```

**项目初始化**

```bash
npm init
```

### Rollup 安装配置 ###

**安装Rollup**

```bash
yarn add rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs rollup-plugin-clear --dev
```

- @rollup/plugin-node-resolve：可以帮助 Rollup解析非ESModule模块化的 CommonJS 模块
- @rollup/plugin-commonjs：可以将Commonjs模块转换为ES模块
- rollup-plugin-clear: 在每次构建时候删除上次输出dist目录


**配置rollup**

在项目根目录下创建rollup.config.js

```js:rollup.config.js
// rollup.config.js
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require("@rollup/plugin-commonjs");
const clear = require('rollup-plugin-clear');


module.exports = {
  input: './src/index.ts',
  output: [
    {
      format: 'cjs',
      file: './dist/index.cjs.js',
      sourcemap: true
    },
    {
      format: 'umd',
      // 全局变量命名
      name: 'rollup',
      exports: 'named',
      file: './dist/index.umd.js',
      globals: {},
      sourcemap: true
    },
    {
      format: 'es',
      file: './dist/index.esm.js',
      sourcemap: true
    }
  ],
  plugins: [
    clear({
      targets: ['./dist/*'],
      watch: true
    }),
    nodeResolve(),
    commonjs({extensions: ['.js', '.ts']})
  ]
}
```

## 配置Typescript ##

### 安装依赖 ###

```bash
yarn add @rollup/plugin-typescript typescript --dev
```

- @rollup/plugin-typescript: typescript插件
- typescript: typescript核心包


### rollup.config.js添加typescript配置 ###

```js:rollup.config.js
const typescript = require('@rollup/plugin-typescript');
、、、
、、、
plugins: [
  、、、
  、、、
  typescript({
    tsconfig: './tsconfig.json',
    include: ['src/**/*.ts'],
    exclude: ['node_modules/**/*']
  }),
]
```

### 新建tsconfig.json ###

```json:tsconfig.json
{
  "compilerOptions": {
    "module": "esnext", // 编译过程中使用的模块系统，none commonjs umd esnext
    "rootDir": ".", // 源代码根目录，告诉TypeScript 编译器从哪个目录开始查找和处理源代码文件
    "baseUrl": "./", // 用于指定模块解析的基础路径
    "declaration": true, // 生成声明文件
    "emitDeclarationOnly": false, // 是否只生成声明文件
    "outDir": "./dist", // 类型声明输出目录
    "declarationDir": "./dist/types", // 声明文件输出目录
    "target": "es6", // 编译的目标版本
    "lib": ["es6", "dom"], // 指定编译目标环境所支持的特性集合
    "allowJs": true, // 允许ts检查js文件
    "skipLibCheck": true, // 跳过默认的类型检查
    "esModuleInterop": true, // 允许使用export=语法
    "allowSyntheticDefaultImports": true, // 允许在没有default导出的模块中使用import x from ''语法
    "strict": true,
    "forceConsistentCasingInFileNames": true, // 启用全局严格大小写检查
    "moduleResolution": "node", // 启用模块解析器
    "sourceMap": true, // 生成sourcemap
    "noEmit": false, // 需要要输出文件
    "isolatedModules": true, // 每个文件都是一个模块，与编译器有关
    "noFallthroughCasesInSwitch": true // // 检查switch中的所有case是否都有break语句
  }
}
```

## 配置babel ##

### 安装依赖 ###

```bash
yarn add @rollup/plugin-babel @babel/core @babel/preset-env @babel/plugin-transform-runtime core-js --dev
```

- @rollup/plugin-babel: rollup babel插件
- @babel/core babel核心插件
- @babel/preset-env：babel的一个预设，允许开发者使用较新的js语法
- @babel/plugin-transform-runtime：babel插件，通过替换 Babel 生成的辅助函数减少代码体积并提高性能
- core-js: 提供polyfills


### rollup.config.js中添加babel相关配置 ###

```js:rollup.config.js
const babel = require('@rollup/plugin-babel');
、、、
、、、
plugins:[
    babel({ 
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      include: ['src/**/*.js', 'src/**/*.ts'],
      exclude: 'node_modules/**'
    }),
]
```

### 项目根目录添加babel.config.json ###

```json:babel.config.json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        // 编译目标告诉 Babel 要为哪些环境或浏览器版本生成兼容的 JavaScript 代码
        "targets": {
          "edge": "80",
          "firefox": "60",
          "chrome": "67",
          "ie": "11"
        },
        // 选项告诉 Babel 如何处理那些在目标环境中不支持的新特性
        "useBuiltIns": "usage", // 按需引入
        // 指定使用core-js库的版本
        "corejs": "3"
      }
    ]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime"
    ]
  ]
}
```

## 配置eslint ##

### 安装依赖 ###

```bash
yarn add @rollup/plugin-eslint eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin @eslint/eslintrc --dev
```

- @rollup/plugin-eslint: rollup eslint 插件
- eslint: eslint核心包
- @typescript-eslint/parser: eslint的typescript解析器，eslint默认只能解析js
- @typescript-eslint/eslint-plugin：eslint的typescript插件
- @eslint/eslintrc：ESLint 的一个默认配置文件，它提供了一套基本的规则集。


### rollup.config.js添加配置 ###

```js:rollup.config.js
const eslint = require('@rollup/plugin-eslint');
、、、
、、、
plugins:[
    eslint({
      include: ['src/**/*.ts', 'src/**/*.js'],
      // 启用修复
      fix: true,
      throwOnError: true,
      exclude: ['node_modules/**', 'dist/**']
    }),
]
```

### 项目根目录添加.eslintrc.js配置文件 ###

这里特别说明：

- eslint9中不在支持项目根目录配置.eslintignore文件，可以在eslint.config.js配置文件的ignores属性
- eslint9中要求配置文件使用eslint.config.js,但是在rollup中，使用@rollup/plugin-eslint插件，仍需要使用.eslintrc.js配置文件，如果使用eslint.config.js会导致eslint报错，@rollup/plugin-eslint找不到配置文件。

```js:.eslintrc.js
module.exports = {
  // 顶级配置文件
  root: true,
  // 指定 ESLint 应该支持的环境变量
  env: {
    browser: true,
    es6: true,
  },
  // 指定解析器
  parser: '@typescript-eslint/parser',
  // 解析项配置
  parserOptions: {
    project: './tsconfig.json',
    // 指定 ESLint 解析代码时应遵循的 ECMAScript（JavaScript）版本
    ecmaVersion: 'latest',
    // 指定源代码的类型。这个选项告诉 ESLint 代码是作为哪种类型的模块来解析的
    sourceType: 'module',
    extraFileExtensions: ['.ts'],
    ecmaFeatures: {
      jsx: false,
      module: true,
      experimentalObjectRestSpread: false,
      classes: true,
      arrowFunctions: true,
      globalReturn: true,
    }
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint/eslint-plugin'],
  rules: {
    'no-console': 'warn',
    'semi': 'warn'
  }
}
```

## 配置prettier ##

### 安装依赖 ###

```bash
yarn add prettier rollup-plugin-prettier eslint-config-prettier eslint-plugin-prettier --dev
```

- rollup-plugin-prettier 是rollup和prettier的插件，可以在打包时自动格式化代码
- prettier 核心包
- eslint-config-prettier 一个 ESLint 配置集合，禁用与 Prettier 冲突的规则
- eslint-plugin-prettier 一个 ESLint 插件，提供了一些与 Prettier 相关的规则


### rollup.config.js添加配置 ###

```js:rollup.config.js
const prettier = require('rollup-plugin-prettier');
、、、
、、、
plugins:[
    、、、
    、、、
    prettier({
      include: ['src/**/*.ts', 'src/**/*.js'],
      exclude: 'node_modules/**',
      tabWidth: 2,
      printWidth: 160,
      semi: true,
      singleQuote: true,
      trailingComma: 'none',
      arrowParens: 'always',
      bracketSpacing: true,
      useTabs: false,
      proseWrap: 'preserve',
      endOfLine: 'lf',
      parser: 'typescript',
      computeDiff: true,
    })
]
```

### .eslintrc.js文件中配置prettier规则 ###

```js:.eslintrc.js
、、、
、、、
 extends: [、、、 'plugin:prettier/recommended', 'prettier'],
 plugins: [、、、 'prettier'],
```

## 部分配置文件汇总 ##

### .eslintrc.js ###

```js:.eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.ts'],
    ecmaFeatures: {
      jsx: false,
      module: true,
      experimentalObjectRestSpread: false,
      classes: true,
      arrowFunctions: true,
      globalReturn: true,
    }
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'prettier'],
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
  rules: {
    'no-console': 'warn',
    'semi': 'warn'
  }
}
```

### package.json依赖 ###

```json:package.json
"devDependencies": {
    "@babel/core": "^7.25.2",
    "@babel/plugin-transform-runtime": "^7.25.4",
    "@babel/preset-env": "^7.25.4",
    "@eslint/eslintrc": "^3.1.0",
    "@rollup/plugin-babel": "^6.0.4",
    "@rollup/plugin-commonjs": "^26.0.1",
    "@rollup/plugin-eslint": "^9.0.5",
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-typescript": "^11.1.6",
    "@typescript-eslint/eslint-plugin": "^8.6.0",
    "@typescript-eslint/parser": "^8.6.0",
    "core-js": "^3.38.1",
    "eslint": "^9.11.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.2.1",
    "prettier": "^3.3.3",
    "rollup": "^4.22.0",
    "rollup-plugin-clear": "^2.0.7",
    "rollup-plugin-prettier": "^4.1.1",
    "tslib": "^2.7.0",
    "typescript": "^5.6.2"
  }
```

### rollup.config.js ###

```js:rollup.config.js
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require("@rollup/plugin-commonjs");
const clear = require('rollup-plugin-clear');
const babel = require('@rollup/plugin-babel');
const typescript = require('@rollup/plugin-typescript');
const eslint = require('@rollup/plugin-eslint');
const prettier = require('rollup-plugin-prettier');


module.exports = {
  input: './src/index.ts',
  output: [
    {
      format: 'cjs',
      file: './dist/index.cjs.js',
      sourcemap: true
    },
    {
      format: 'umd',
      // 全局变量命名
      name: 'super',
      exports: 'named',
      file: './dist/index.umd.js',
      globals: {},
      sourcemap: true
    },
    {
      format: 'es',
      file: './dist/index.esm.js',
      sourcemap: true
    }
  ],
  plugins: [
    clear({
      targets: ['./dist/*'],
      watch: true
    }),
    nodeResolve(),
    commonjs({extensions: ['.js', '.ts']}),
    eslint({
      include: ['src/**/*.ts', 'src/**/*.js'],
      fix: true,
      throwOnError: true,
      exclude: ['node_modules/**', 'dist/**']
    }),
    typescript({
      tsconfig: './tsconfig.json',
      include: ['src/**/*.ts'],
      exclude: ['node_modules/**/*']
    }),
    babel({ 
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      include: ['src/**/*.js', 'src/**/*.ts'],
      exclude: 'node_modules/**'
    }),
    prettier({
      include: ['src/**/*.ts', 'src/**/*.js'],
      exclude: 'node_modules/**',
      tabWidth: 2,
      printWidth: 160,
      semi: true,
      singleQuote: true,
      trailingComma: 'none',
      arrowParens: 'always',
      bracketSpacing: true,
      useTabs: false,
      proseWrap: 'preserve',
      endOfLine: 'lf',
      parser: 'typescript',
      computeDiff: true,
    })
  ]
}
```

## 结尾 ##

上面是整体关于rollup及typascript、babel、eslint、prettier的集成配置，如果您在参考学习过程中有遇到问题，可以评论区交流～
