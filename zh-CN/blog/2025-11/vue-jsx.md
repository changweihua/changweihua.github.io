---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 中的 JSX
description: 让组件渲染更灵活的正确方式
date: 2025-11-06 09:20:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

在日常 Vue 项目中，你可能已经非常熟悉 `template` 写法：结构清晰、语义明确、直观易读。但当业务进入更复杂的阶段，你会发现：

- 模板语法存在一定限制
- 某些 UI 渲染逻辑十分动态
- 条件/循环/组件嵌套变得越来越难写
- `h` 函数（`createVNode`）看得懂，但自己写非常痛苦

这时，你可能会想：*有没有一种方式既能保持 DOM 结构的直观性，又能充分利用 JavaScript 的灵活表达？*

答案是：**JSX**。

你可能会问：JSX 不是 React 的东西吗？

是，但 vVue 同样支持 JSX*，并且在组件库、动态 UI 控件、高度抽象组件中大量使用。

本文将从三个核心问题带你理解 Vue 中的 JSX：

1. JSX 的本质是什么？
2. 为什么需要 JSX，它能解决什么问题？
3. 在 Vue 中如何优雅地使用 JSX？

## `h` 函数：理解 JSX 的前置知识 ##

Vue 组件的 `template` 最终会被编译为一个 *render 函数*，render 函数会返回 *虚拟 DOM（VNode）* 。

也就是说，下面这段模板：

```vue
<h3>你好</h3>
```

最终会变成类似这样的 JavaScript：

```js
h('h3', null, '你好')
```

也就是说：

> h 函数 = 手写虚拟 DOM 的入口
> JSX = h 函数的语法糖

## 为什么需要 JSX？来看一个真实例子 ##

假设我们做一个动态标题组件 `<Heading />`，它根据 `level` 动态渲染 `<h1> ~ <h6>`：

如果使用 `template`，你可能写成这样：

```vue
<h1 v-if="level === 1"><slot /></h1>
<h2 v-else-if="level === 2"><slot /></h2>
...
<h6 v-else-if="level === 6"><slot /></h6>
```

非常冗余、难拓展、维护成本高。

使用 h 函数可以简化为：

```javascript
import { h, defineComponent } from 'vue'

export default defineComponent({
  props: { level: Number },
  setup(props, { slots }) {
    return () => h('h' + props.level, {}, slots.default())
  }
})
```

但写 h 函数并不优雅，标签、属性、事件都要自己构造。

这时 JSX 就来了。

## 在 Vue 中使用 JSX ##

### 安装 JSX 插件（Vite 项目） ###

```bash
npm install @vitejs/plugin-vue-jsx -D
```

### 在 vite.config.ts 中启用 ###

```javascript
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default {
  plugins: [vue(), vueJsx()]
}
```

### 使用 JSX 改写 Heading 组件 ###

```javascript
import { defineComponent } from 'vue'

export default defineComponent({
  props: { level: Number },
  setup(props, { slots }) {
    const Tag = 'h' + props.level
    return () => <Tag>{slots.default()}</Tag>
  }
})
```

是不是比手写 h 爽太多了？

> 结构依然直观，但不受 template 语法局限。

## JSX 的核心能力：灵活、动态、纯 JavaScript ##

举个再明显的例子：Todo 列表

```javascript
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const title = ref('')
    const todos = ref([])

    const addTodo = () => {
      if (title.value.trim()) {
        todos.value.push({ title: title.value })
        title.value = ''
      }
    }

    return () => (
      <div>
        <input vModel={title.value} />
        <button onClick={addTodo}>添加</button>
        <ul>
          {todos.value.length
            ? todos.value.map(t => <li>{t.title}</li>)
            : <li>暂无数据</li>}
        </ul>
      </div>
    )
  }
})
```

可以看到：

|  模板语法   |      JSX 对应写法  |
| :-----------: | :-----------: |
| `v-model` | `vModel={value}` |
| `@click` | `onClick={fn}` |
| `v-for` | `array.map()` |
| `v-if` | `三元 / if 表达式` |

> 本质是 JavaScript，可以随意写逻辑。

## JSX vs Template：应该如何选择？ ##

|  对比点   |    template  |   JSX  |
| :-----------: | :-----------: | :-----------: |
| 可读性 | 强，结构清晰 | 视业务复杂度而定 |
| 动态表达能力 | 较弱（语法受限） | 非常强（JS 语法全支持） |
| 编译优化 | 优秀，可静态提升 | 不如 template 友好 |
| 适用场景 | 普通业务 UI | 高动态逻辑、组件库、渲染函数场景 |

**一句话总结选择策略**：

> 业务组件优先 template，
> 高动态组件或组件库优先 JSX。

JSX 并不是来替代 template 的，而是：

> 当 template 无法优雅表达渲染逻辑时，JSX 给你打开了一扇窗。

- 它让组件变得更灵活
- 它让写 render 函数变得不再痛苦
- 它让 Vue 在复杂组件抽象层面更加强大

掌握 JSX，是从“会写 Vue”向“会设计 Vue 组件”的关键一步。
