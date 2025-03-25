---
lastUpdated: true
commentabled: true
recommended: true
title: 前端动态导入（import.meta.glob）
description: 前端动态导入（import.meta.glob）
date: 2025-03-25 13:00:00
pageClass: blog-page-class
---

# 前端动态导入（import.meta.glob） #

## import.meta.glob 简介 ##

这是 Vite 提供的一个特殊导入函数，用于批量导入模块文件。它支持使用 glob 模式匹配文件，非常适合需要动态导入多个模块的场景。
 
### 参数说明 ###

```typescript
import.meta.glob(pattern, {
  as?: 'url' | 'raw' | 'string',    // 导入格式
  eager?: boolean,                   // 是否同步导入
  import?: string | string[],        // 指定导入的内容
  query?: Record<string, string | number | boolean> // 查询参数
})
```

## 详细使用示例 ##

### 基本异步导入 ###

```typescript
// 导入所有 .vue 组件
const modules = import.meta.glob('./components/*.vue')

// 使用方式
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(path, mod)
  })
}
```

### 同步导入 ###

```typescript
// 立即导入所有组件
const modules = import.meta.glob('./components/*.vue', { eager: true })

// 可以直接使用
console.log(modules['/components/Button.vue'].default)
```

### 导入特定内容 ###

```typescript
// 只导入组件中的 setup 函数
const modules = import.meta.glob('./components/*.vue', {
  import: 'setup',
  eager: true
})

// 导入多个导出内容
const modules = import.meta.glob('./components/*.vue', {
  import: ['setup', 'data'],
  eager: true
})
```

### 不同格式导入 ###

```typescript
// URL 格式导入
const imageUrls = import.meta.glob('./assets/*.png', {
  as: 'url'
})

// 原始文本导入
const textContents = import.meta.glob('./files/*.txt', {
  as: 'raw'
})

// 字符串导入
const strings = import.meta.glob('./locales/*.json', {
  as: 'string'
})
```

### 复杂匹配模式 ###

```typescript
// 多模式匹配
const modules = import.meta.glob([
  './components/**/*.vue',  // 所有子目录的 vue 文件
  './layouts/*.vue',        // layouts 目录下的 vue 文件
  '!./components/test/*'    // 排除 test 目录
])
```

## 实际应用场景 ##

### 自动注册 Vue 组件 ###

```typescript
// 自动注册全局组件
const components = import.meta.glob('./components/*.vue', { eager: true })

export function registerComponents(app) {
  Object.entries(components).forEach(([path, module]) => {
    const name = path.match(/\.\/components\/(.*)\.vue$/)?.[1]
    if (name) {
      app.component(name, module.default)
    }
  })
}
```

### 动态路由配置 ###

```typescript
// 自动生成路由配置
const pages = import.meta.glob('./pages/**/*.vue')

const routes = Object.entries(pages).map(([path, component]) => ({
  path: path
    .replace('./pages', '')
    .replace('.vue', '')
    .replace(/\/index$/, '/'),
  component: component
}))
```

### 多语言文件管理 ###

```typescript
// 导入所有语言文件
const locales = import.meta.glob('./locales/*.json', {
  eager: true,
  as: 'string'
})

// 处理语言文件
const messages = Object.entries(locales).reduce((acc, [path, content]) => {
  const lang = path.match(/\.\/locales\/(.*)\.json$/)?.[1]
  if (lang) {
    acc[lang] = JSON.parse(content)
  }
  return acc
}, {})
```

## 使用注意事项 ##

### 路径规则 ###

- 必须使用字符串字面量
- 支持相对路径（./）和绝对路径（/）
- 不支持动态变量拼接

### 性能考虑 ###

```typescript
// 异步导入（推荐）- 实现代码分割
const modules = import.meta.glob('./modules/*.ts')

// 同步导入 - 所有模块打包到主包
const modules = import.meta.glob('./modules/*.ts', { eager: true })
```

### 通配符说明 ###

```typescript
* // 匹配任意字符（不含路径分隔符）
** // 匹配任意字符（包含路径分隔符）
? // 匹配单个字符
[abc] // 匹配方括号中的任意字符
{a,b} // 匹配花括号中的任意模式
```

### 类型支持 ###

```typescript
// 类型声明
interface GlobModule {
  [path: string]: () => Promise<any>
}

const modules: GlobModule = import.meta.glob('./modules/*.ts')
```
