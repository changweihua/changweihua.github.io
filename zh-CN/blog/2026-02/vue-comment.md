---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 模板中保留 HTML 注释的完整指南
description: Vue 模板中保留 HTML 注释的完整指南
date: 2026-02-14 13:45:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 前言：注释的艺术 ##

在 Vue 开发中，我们经常需要在模板中添加注释。这些注释可能是：

- 📝 开发者备注：解释复杂逻辑
- 🏷️ 代码标记：TODO、FIXME 等
- 🔧 模板占位符：为后续开发留位置
- 📄 文档生成：自动生成 API 文档
- 🎨 设计系统标注：设计意图说明

但是，你可能会发现 Vue 默认会*移除*模板中的所有 HTML 注释！今天我们就来深入探讨如何在 Vue 中保留这些有价值的注释。

## 一、Vue 默认行为：为什么移除注释？ ##

### 源码视角 ###

```javascript
// 简化版 Vue 编译器处理
function compile(template) {
  // 默认情况下，注释节点会被移除
  const ast = parse(template, {
    comments: false // 默认不保留注释
  })
  
  // 生产环境优化：移除所有注释
  if (process.env.NODE_ENV === 'production') {
    removeComments(ast)
  }
}
```

Vue 移除注释的原因：

- 性能优化：减少 DOM 节点数量
- 安全性：避免潜在的信息泄露
- 代码精简：减少最终文件体积
- 标准做法：与主流框架保持一致

### 默认行为演示 ###

```vue
<template>
  <div>
    <!-- 这个注释在最终渲染中会被移除 -->
    <h1>Hello World</h1>
    
    <!-- 
      多行注释
      也会被移除
    -->
    
    <!-- TODO: 这里需要添加用户头像 -->
    <div class="user-info">
      {{ userName }}
    </div>
  </div>
</template>
```

编译结果：

```html
<div>
  <h1>Hello World</h1>
  <div class="user-info">
    John Doe
  </div>
</div>
```

所有注释都不见了！

## 二、配置 Vue 保留注释的 4 种方法 ##

### Vue 编译器配置（全局） ###

Vue 2 配置

```javascript:vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        return {
          ...options,
          compilerOptions: {
            comments: true // 保留注释
          }
        }
      })
  }
}
```

```js:webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            comments: true
          }
        }
      }
    ]
  }
}
```

Vue 3 配置

```javascript:vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          comments: true // 保留注释
        }
      }
    })
  ]
})
```

```js:vue.config.js
// (Vue CLI)
module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: [
            {
              loader: 'vue-loader',
              options: {
                compilerOptions: {
                  comments: true
                }
              }
            }
          ]
        }
      ]
    }
  }
}
```

### 单文件组件配置（Vue 3 特有） ###

```vue
<template>
  <!-- 这个注释会被保留 -->
  <div>
    <!-- 组件说明：用户信息展示 -->
    <UserProfile />
  </div>
</template>

<script>
export default {
  // Vue 3 可以在组件级别配置
  compilerOptions: {
    comments: true
  }
}
</script>
```

### 运行时编译（仅开发环境） ###

```javascript
// 使用完整版 Vue（包含编译器）
import Vue from 'vue/dist/vue.esm.js'

new Vue({
  el: '#app',
  template: `
    <div>
      <!-- 运行时编译会保留注释 -->
      <h1>Hello</h1>
    </div>
  `,
  compilerOptions: {
    comments: true
  }
})
```

### 使用 `<script type="text/x-template">` ###

```html
<!DOCTYPE html>
<html>
<body>
  <div id="app"></div>
  
  <!-- 模板定义，注释会被保留 -->
  <script type="text/x-template" id="my-template">
    <div>
      <!-- 用户信息区域 -->
      <div class="user-info">
        {{ userName }}
      </div>
      
      <!-- TODO: 添加用户权限展示 -->
    </div>
  </script>
  
  <script>
  new Vue({
    el: '#app',
    template: '#my-template',
    data: {
      userName: 'John'
    },
    // 可能需要额外配置
    compilerOptions: {
      comments: true
    }
  })
  </script>
</body>
</html>
```

## 三、注释的最佳实践与用例 ##

### 组件文档生成 ###

```vue
<template>
  <!-- 
    UserCard 组件
    @prop {Object} user - 用户对象
    @prop {Boolean} showDetails - 是否显示详情
    @slot default - 自定义内容
    @slot avatar - 自定义头像
    @event click - 点击事件
  -->
  <div class="user-card" @click="$emit('click', user)">
    <!-- 用户头像 -->
    <div class="avatar">
      <slot name="avatar">
        <img :src="user.avatar" alt="头像">
      </slot>
    </div>
    
    <!-- 用户基本信息 -->
    <div class="info">
      <h3>{{ user.name }}</h3>
      <p v-if="showDetails">{{ user.bio }}</p>
      
      <!-- 自定义内容区域 -->
      <slot />
    </div>
    
    <!-- FIXME: 这里应该显示用户标签 -->
  </div>
</template>

<script>
export default {
  name: 'UserCard',
  props: {
    user: {
      type: Object,
      required: true
    },
    showDetails: {
      type: Boolean,
      default: false
    }
  }
}
</script>
```

### 设计系统标注 ###

```vue
<template>
  <!-- 
    Design System: Button Component
    Type: Primary Button
    Color: Primary Blue (#1890ff)
    Spacing: 8px vertical, 16px horizontal
    Border Radius: 4px
    States: Default, Hover, Active, Disabled
  -->
  <button 
    class="btn btn-primary"
    :disabled="disabled"
    @click="handleClick"
  >
    <!-- 
      Button Content Guidelines:
      1. 使用动词开头
      2. 不超过4个汉字
      3. 保持简洁明了
    -->
    <slot>{{ label }}</slot>
  </button>
  
  <!-- 
    Design Tokens Reference:
    --color-primary: #1890ff;
    --spacing-md: 8px;
    --radius-sm: 4px;
  -->
</template>
```

### 协作开发标记 ###

```vue
<template>
  <div class="checkout-page">
    <!-- TODO: @前端小王 - 添加优惠券选择功能 -->
    <div class="coupon-section">
      优惠券功能开发中...
    </div>
    
    <!-- FIXME: @前端小李 - 修复移动端支付按钮布局 -->
    <div class="payment-section">
      <button class="pay-btn">立即支付</button>
    </div>
    
    <!-- OPTIMIZE: @性能优化小组 - 图片懒加载优化 -->
    <div class="recommendations">
      <img 
        v-for="img in productImages" 
        :key="img.id"
        :src="img.thumbnail"
        :data-src="img.fullSize"
        class="lazy-image"
      >
    </div>
    
    <!-- HACK: @前端小张 - 临时解决Safari兼容性问题 -->
    <div v-if="isSafari" class="safari-fix">
      <!-- Safari specific fixes -->
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    isSafari() {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    }
  }
}
</script>
```

## 四、环境差异化配置 ##

### 开发环境 vs 生产环境 ###

```javascript:vue.config.js
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        const compilerOptions = {
          ...options.compilerOptions
        }
        
        // 只在开发环境保留注释
        if (process.env.NODE_ENV === 'development') {
          compilerOptions.comments = true
        } else {
          compilerOptions.comments = false
        }
        
        return {
          ...options,
          compilerOptions
        }
      })
  }
}
```

### 按需保留特定类型注释 ###

```javascript
// 自定义注释处理器
const commentPreserver = {
  // 只保留特定前缀的注释
  shouldPreserveComment(comment) {
    const preservedPrefixes = [
      'TODO:',
      'FIXME:', 
      'HACK:',
      'OPTIMIZE:',
      '@design-system',
      '@api'
    ]
    
    return preservedPrefixes.some(prefix => 
      comment.trim().startsWith(prefix)
    )
  }
}

// 在配置中使用
module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        return {
          ...options,
          compilerOptions: {
            whitespace: 'preserve',
            // 自定义注释处理
            comments: (comment) => commentPreserver.shouldPreserveComment(comment)
          }
        }
      })
  }
}
```

## 五、高级用法：注释数据处理 ##

### 自动提取 API 文档 ###

```vue
<template>
  <!-- 
    @component UserProfile
    @description 用户个人资料展示组件
    @version 1.2.0
    @author 开发团队
    @prop {String} userId - 用户ID
    @prop {Boolean} editable - 是否可编辑
    @event save - 保存事件
    @event cancel - 取消事件
  -->
  <div class="user-profile">
    <!-- @section 基本信息 -->
    <div class="basic-info">
      {{ user.name }}
    </div>
    
    <!-- @section 联系信息 -->
    <div class="contact-info">
      {{ user.email }}
    </div>
  </div>
</template>
```

```javascript
// 注释提取脚本
const fs = require('fs')
const path = require('path')
const parser = require('@vue/compiler-sfc')

function extractCommentsFromVue(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const { descriptor } = parser.parse(content)
  
  const comments = []
  const template = descriptor.template
  
  if (template) {
    // 解析模板中的注释
    const ast = parser.compile(template.content, {
      comments: true
    }).ast
    
    traverseAST(ast, (node) => {
      if (node.type === 3 && node.isComment) {
        comments.push({
          content: node.content,
          line: node.loc.start.line,
          file: path.basename(filePath)
        })
      }
    })
  }
  
  return comments
}

// 生成文档
const componentComments = extractCommentsFromVue('./UserProfile.vue')
console.log(JSON.stringify(componentComments, null, 2))
```

### 代码质量检查 ###

```javascript
// eslint-plugin-vue-comments
module.exports = {
  rules: {
    'require-todo-comment': {
      create(context) {
        return {
          'VElement'(node) {
            const comments = context.getSourceCode()
              .getAllComments()
              .filter(comment => comment.type === 'HTML')
            
            // 检查是否有 TODO 注释
            const hasTodo = comments.some(comment => 
              comment.value.includes('TODO:')
            )
            
            if (!hasTodo && node.rawName === 'div') {
              context.report({
                node,
                message: '复杂 div 元素需要添加 TODO 注释说明'
              })
            }
          }
        }
      }
    }
  }
}
```

## 六、与 JSX/渲染函数的对比 ##

### Vue 模板 vs JSX ###

```javascript
// Vue 模板（支持 HTML 注释）
const template = `
  <div>
    <!-- 这个注释会被处理 -->
    <h1>Title</h1>
  </div>
`

// JSX（使用 JS 注释）
const jsx = (
  <div>
    {/* JSX 中的注释 */}
    <h1>Title</h1>
    {
      // 也可以使用单行注释
    }
  </div>
)

// Vue 渲染函数
export default {
  render(h) {
    // 渲染函数中无法添加 HTML 注释
    // 只能使用 JS 注释，但不会出现在 DOM 中
    return h('div', [
      // 这是一个 JS 注释，不会出现在 DOM 中
      h('h1', 'Title')
    ])
  }
}
```

### 在 JSX 中模拟 HTML 注释 ###

```jsx
// 自定义注释组件
const Comment = ({ text }) => (
  <div 
    style={{ display: 'none' }}
    data-comment={text}
    aria-hidden="true"
  />
)

// 使用
const Component = () => (
  <div>
    <Comment text="TODO: 这里需要优化" />
    <h1>内容</h1>
  </div>
)
```

## 七、注意事项与常见问题 ##

### 性能影响 ###

```javascript
// 保留大量注释的性能测试
const testData = {
  withComments: `
    <div>
      ${Array(1000).fill().map((_, i) => 
        `<!-- 注释 ${i} -->\n<div>Item ${i}</div>`
      ).join('\n')}
    </div>
  `,
  withoutComments: `
    <div>
      ${Array(1000).fill().map((_, i) => 
        `<div>Item ${i}</div>`
      ).join('\n')}
    </div>
  `
}

// 测试结果
// 有注释：虚拟DOM节点数 2000
// 无注释：虚拟DOM节点数 1000
// 内存占用增加约 30-50%
```

建议：只在开发环境保留注释，生产环境移除。

### 安全性考虑 ###

```vue
<template>
  <!-- 危险：可能泄露敏感信息 -->
  <!-- API密钥：sk_test_1234567890 -->
  <!-- 数据库连接：mysql://user:pass@localhost -->
  <!-- 内部接口：https://internal-api.company.com -->
  
  <!-- 安全：使用占位符 -->
  <!-- 使用环境变量：{{ apiEndpoint }} -->
</template>
```

### SSR（服务端渲染）兼容性 ###

```javascript:server.js
const Vue = require('vue')
const renderer = require('@vue/server-renderer')

const app = new Vue({
  template: `
    <div>
      <!-- SSR注释 -->
      <h1>服务端渲染</h1>
    </div>
  `
})

// SSR 渲染
const html = await renderer.renderToString(app, {
  // 需要显式启用注释
  template: {
    compilerOptions: {
      comments: true
    }
  }
})

console.log(html)
// 输出：<div><!-- SSR注释 --><h1>服务端渲染</h1></div>
```

## 八、最佳实践总结 ##

### 配置文件模板 ###

```javascript:vue.config.js
module.exports = {
  chainWebpack: config => {
    // Vue 文件处理
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        const isDevelopment = process.env.NODE_ENV === 'development'
        const isProduction = process.env.NODE_ENV === 'production'
        
        return {
          ...options,
          compilerOptions: {
            // 开发环境：保留所有注释
            // 生产环境：移除注释，或只保留特定注释
            comments: isDevelopment ? true : (comment) => {
              const importantPrefixes = [
                'TODO:',
                'FIXME:',
                '@design-system',
                '@api-docs'
              ]
              
              return importantPrefixes.some(prefix => 
                comment.trim().startsWith(prefix)
              )
            },
            
            // 其他编译选项
            whitespace: isProduction ? 'condense' : 'preserve',
            delimiters: ['{{', '}}']
          }
        }
      })
  }
}
```

### 注释编写规范 ###

```vue
<template>
  <!-- 
    良好的注释规范：
    1. 使用清晰的标题
    2. 使用标准标记（TODO, FIXME等）
    3. @作者 和 @日期
    4. 保持注释简洁
  -->
  
  <!-- 
    SECTION: 用户信息展示
    TODO: 添加用户角色徽章 - @前端小李 - 2024-01
    FIXME: 移动端头像大小需要调整 - @UI设计师 - 2024-01
    @design-system: 使用 DS-Button 组件
    @api: 用户数据来自 /api/user/:id
  -->
  <div class="user-profile">
    <!-- 基本信息区域 -->
    <div class="basic-info">
      <!-- 用户头像 -->
      <img :src="user.avatar" alt="头像">
    </div>
  </div>
</template>
```

### 各场景推荐方案 ###

| 场景   |   推荐方案     |   配置方式 |  备注 |
| :----------: | :----------: | :---------:  | :---------:  |
| 开发调试 | 保留所有注释 | `comments: true` | 便于调试 |
| 生产环境 | 移除所有注释 | `comments: false` | 性能优化 |
| 文档生成 | 保留特定注释 | 自定义过滤函数 | 提取 API 文档 |
| 设计系统 | 保留设计注释 | `comments: /@design-system/` | 设计标注 |
| 团队协作 | 保留 TODO/FIXME | 正则匹配保留 | 任务跟踪 |

## 总结 ##

在 Vue 中保留 HTML 注释需要明确的配置，但这对于*开发效率、团队协作、文档维护*都大有裨益。关键点：

- 理解默认行为：Vue 为性能优化默认移除注释
- 按需配置：根据环境选择是否保留注释
- 规范注释：制定团队统一的注释规范
- 考虑性能：生产环境谨慎保留注释
- 探索高级用法：注释可以用于文档生成、代码分析等

> 记住：好的注释是代码的路标，而不仅仅是装饰。合理配置和使用注释，能让你的 Vue 项目更加可维护、可协作。
