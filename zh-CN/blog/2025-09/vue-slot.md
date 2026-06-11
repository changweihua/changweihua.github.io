---
lastUpdated: true
commentabled: true
recommended: true
title: 插槽：Vue里的‘占位符’，让组件更灵活！
description: 插槽：Vue里的‘占位符’，让组件更灵活！
date: 2025-09-24 15:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 一、插槽是啥？ ##

简单来说，插槽就是组件里的“占位符” ，它允许我们在使用组件时，往里面“塞”自定义的内容。

举个现实中的例子：

- 你买了一个手机壳（组件），壳上预留了一个洞（插槽），你可以自己决定往洞里塞什么——可能是耳机孔、摄像头，甚至是个小风扇。
- Vue的插槽也是一样，它让组件变得更灵活，可以动态插入内容。

## 二、基本用法 ##

### 默认插槽 ###

假设我写了一个 `MyButton` 组件，但希望按钮的文本可以自定义：

```vue:MyButton.vue
<template>
  <button class="my-btn">
    <slot></slot>  <!-- 这里是插槽，用来放自定义内容 -->
  </button>
</template>
```

使用的时候：

```html
<MyButton>点我！</MyButton>
<MyButton>提交</MyButton>
```

渲染结果：

```html
<button class="my-btn">点我！</button>
<button class="my-btn">提交</button>
```

`<slot></slot>` 就是*默认插槽*，它会自动替换成组件标签里的内容。

### 后备内容（默认值） ###

如果使用组件时没传内容，插槽可以设置默认值：

```vue:MyButton.vue
<template>
  <button class="my-btn">
    <slot>默认按钮</slot>  <!-- 如果不传内容，就显示“默认按钮” -->
  </button>
</template>
```

使用：

```html
<MyButton></MyButton>  <!-- 渲染：<button class="my-btn">默认按钮</button> -->
<MyButton>确定</MyButton>  <!-- 渲染：<button class="my-btn">确定</button> -->
```

## 三、具名插槽（多个插槽） ##

有时候，我们想在一个组件里定义多个插槽，比如一个卡片组件，有标题、内容、底部三部分：

```vue:MyCard.vue
<template>
  <div class="card">
    <header>
      <slot name="header"></slot>  <!-- 具名插槽 -->
    </header>
    <div class="content">
      <slot></slot>  <!-- 默认插槽 -->
    </div>
    <footer>
      <slot name="footer"></slot>  <!-- 具名插槽 -->
    </footer>
  </div>
</template>
```

使用时，用 `v-slot` 指定插槽名：

```vue
<template>
  <MyCard>
    <template v-slot:header>
      <h2>我的卡片标题</h2>
    </template>
    
    <p>这里是卡片内容...</p>  <!-- 默认插槽，不用写v-slot -->
    
    <template v-slot:footer>
      <button>确定</button>
    </template>
  </MyCard>
</template>
```

`v-slot:header` 表示这个内容要放到 `name="header"` 的插槽里。

### 简写：`#` 代替 `v-slot` ###

Vue允许用 `#` 缩写：

```vue
<template #header>
  <h2>我的卡片标题</h2>
</template>
```

## 四、作用域插槽（让插槽访问子组件数据） ##

有时候，我们希望插槽内容能访问子组件内部的数据。比如，我写了一个List组件，但希望外部能自定义渲染方式：

```vue:List.vue
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot :item="item"></slot>  <!-- 把item传给插槽 -->
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: '苹果' },
        { id: 2, name: '香蕉' },
      ]
    }
  }
}
</script>
```

使用时，用 `v-slot` 接收数据：

```vue
<template>
  <List>
    <template v-slot:default="slotProps">  <!-- 接收作用域数据 -->
      <span>{{ slotProps.item.name }}</span>
    </template>
  </List>
</template>
```

`slotProps` 可以随便命名，它包含了子组件传给插槽的数据。

### 解构写法（更简洁） ###

```vue
<template>
  <List>
    <template v-slot:default="{ item }">  <!-- 直接解构 -->
      <span>{{ item.name }}</span>
    </template>
  </List>
</template>
```

## 五、插槽的常见使用场景 ##

- **布局组件**（比如卡片、弹窗、表格）
- **列表渲染**（允许自定义每一项的UI）
- **高阶组件**（比如封装一个可复用的逻辑，但UI由外部决定）

## 六、总结 ##

插槽的核心作用：**让组件更灵活，允许外部自定义内容**。

|  插槽类型   |  作用  |  示例  | 
| :-----------: | :-----------: | :-----------: |
| 默认插槽 | 基本占位 | `<slot></slot>` |
| 具名插槽 | 多个插槽 | `<slot name="header"></slot>` |
| 作用域插槽 | 子传数据给插槽 | `<slot :item="item"></slot>` |

**记住**

- **默认插槽**：`<slot></slot>`
- **具名插槽**：`<slot name="xxx">` + `v-slot:xxx`
- **作用域插槽**：`<slot :data="data">` + `v-slot="props"`
