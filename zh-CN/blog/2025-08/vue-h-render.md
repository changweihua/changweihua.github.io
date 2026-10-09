---
lastUpdated: true
commentabled: true
recommended: true
title: 🍓 Vue3 里的 h 函数！
description: 🍓 Vue3 里的 h 函数！
date: 2025-08-27 15:45:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 前言 ##

`h` 函数在 Vue 中是一个非常重要的概念，它对于我们理解 Vue 里的渲染机制很关键。当我们在编写 Vue 的 `template` 模板时，实际上并不是在写 HTML，而是在以一种更直观的方式编写对 `h` 函数的调用。`h` 函数的作用是创建虚拟节点（`VNode`）。

> `h` 函数的作用类似于 React 中的 `createElement`

## Template 如何转换成 h 函数 ##

假设 `main.ts` 代码如下:

```ts:main.ts
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

`App.vue` 代码如下:

```vue:App.vue
<script setup lang="ts">
import Welcome from "./components/Welcome.vue";
</script>

<template>
  <div class="box">
    <p>Title</p>
    <Welcome msg="Hello" :num="999" />
  </div>
</template>
```

那么我们该如何用 `h` 函数来模拟实现 `App.vue` 中的内容呢？

- `h` 函数的第一个参数是 DOM 的节点类型，或者是一个组件；
- 第二个参数是 DOM 的属性，或者组件的 props；
- 第三个参数是子节点。

**示例代码如下**：

```ts
import { createApp, defineComponent, h } from "vue";
import Welcome from "./components/Welcome.vue";

const App = defineComponent({
  render: () => {
    return h("div", { class: "box" }, [
      h("p", "Title"),
      h(Welcome, { msg: "Hello", num: 999 }),
    ]);
  },
});

createApp(App).mount("#app");
```

## `h` 函数的几种用法 ##

### `h` 创建 `VNode` ##

`h` 函数可以创建一个 `VNode` 实例，可以设置样式和绑定事件，再通过 `<component :is="VNode">` 的方式将其动态渲染出来。

```vue:App.vue
<script setup lang="ts">
import { h } from "vue";

const com = h(
  "div",
  {
    style: { color: "red" },
    onClick: () => {
      console.log(1111);
    },
  },
  "Hello World",
);
</script>

<template>
  <component :is="com" />
</template>
```

### 创建函数组件 ###

#### 响应式函数组件 ####

下面定义的 `Com` 是一个组件，而不是一个 `VNode`，它的写法和 React 中的函数式组件非常相似。

```vue:App.vue
<script setup lang="ts">
import { h, ref } from "vue";

const msg = ref("Hello");

const Com = () => h("div", { style: { color: "red" } }, msg.value);

setTimeout(() => {
  msg.value = "1111";
}, 1000);
</script>

<template>
  <component :is="Com" />
</template>
```

这里我们在函数调用时访问了 `msg.value`，而这个函数又是通过 `<component :is="Com" />` 这样的方式动态渲染的，它的调用环境是响应式的。

需要注意的是，`Com` 不能写成下面这种形式：

```ts
const Com =  h("div", { style: { color: "red" } }, msg.value);
```

因为在 `setup` 中它不是一个函数组件，而是一个普通的 `VNode`，直接在模板中使用时不会触发响应式。而变成函数之后，在模板中调用这个函数，就相当于在模板中使用一个响应式组件（即 `effect`）。

#### 接收 props 的函数的组件 ####

由于 `Com` 是一个组件，我们还可以给它传递参数：

```vue:App.vue
<script setup lang="ts">
import { h, type FunctionalComponent } from "vue";

const Com: FunctionalComponent<{ count: number }> = (props) =>
  h("div", null, props.count);
</script>

<template>
  <Com :count="1"></Com>
</template>
```

### `h` 渲染插槽内容 ###

#### 渲染默认插槽 ####

我们可以将 `Com` 理解为一个 `setup` 函数，所以可以从第 2 个参数里获取到 `slots`。

```vue:App.vue
<script setup lang="ts">
import { h, type FunctionalComponent } from "vue";

const Com: FunctionalComponent = (_props, { slots }) =>
  h("div", { style: { color: "red" } }, slots);
</script>

<template>
  <Com>
    <div>Hello World</div>
  </Com>
</template>
```

#### 渲染具名插槽 ####

```vue:App.vue
<script setup lang="ts">
import { h, type FunctionalComponent } from "vue";

const Com: FunctionalComponent = (_props, { slots }) =>
  h("div", { style: { color: "red" } }, [
    slots?.default?.(),
    "Middle Content",
    slots?.header?.(),
  ]);
</script>

<template>
  <Com>
    <div>Hello World</div>
    <template #header>
      <div>header</div>
    </template>
  </Com>
</template>
```

最终渲染结果如下：

```txt
Hello World
Middle Content
header
```

#### 渲染作用域插槽（含插值参数） ####

注意下面的代码中，`<template #header="num">` 不要写成 `<template #header="{ num }">`，因为 `slots.header` 传递的是数字，而不是 `{num: num.value}`。

```ts
<script setup lang="ts">
import { h, ref, type FunctionalComponent } from "vue";

const Com: FunctionalComponent = (_props, { slots }) => {
  const num = ref(9999);
  return h("div", { style: { color: "red" } }, [
    slots?.default?.(),
    "Middle Content",
    slots?.header?.(num.value),
  ]);
};
</script>

<template>
  <Com>
    <div>Hello World</div>
    <template #header="num">
      <div>header{{ num }}</div>
    </template>
  </Com>
</template>
```

### 渲染组件并传递属性和事件 ###

**App.vue 组件**:

```vue:App.vue
<script setup lang="ts">
import { h, type FunctionalComponent } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

const Com: FunctionalComponent = () => {
  return h(HelloWorld, {
    msg: "1111",
    onFoo: (text) => {
      console.log(text);
    },
  });
};
</script>

<template>
  <Com></Com>
</template>
```

**HelloWorld 组件**:

```vue:HelloWorld.vue
<script setup lang="ts">
defineProps<{ msg: string }>();
const emits = defineEmits(["foo"]);

setTimeout(() => {
  emits("foo", "HelloWorld");
}, 1000);
</script>

<template>
  <div>
    {{ msg }}
  </div>
</template>
```

### `h` 渲染组件并传递插槽 ###

我们先来看使用 `h` 渲染组件时，如果不传递任何内容，会是什么效果：

**App.vue 组件**：

```vue
<script setup lang="ts">
import { h, type FunctionalComponent } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

const Com: FunctionalComponent = () => {
  return h(HelloWorld);
};
</script>

<template>
  <Com></Com>
</template>
```

**HelloWorld 组件**:

```vue
<template>
  <div>
    <slot>Hello World</slot>
    <br />
    <slot name="footer" foo="cccc">Footer</slot>
  </div>
</template>
```

最终页面渲染为：

```txt
Hello World
Footer
```

如果我们传入插槽内容，需要注意：此时 `h` 函数的第三个参数不是 `数组`，而是一个 `对象`：

```ts
const Com: FunctionalComponent = () => {
  return h(HelloWorld, null, {
    default: () => h("div", "aaaa"),
    footer: ({ foo }: { foo: string }) => h("div", "bbbb " + foo),
  });
};
```

最终渲染结果：

```txt
aaaa
bbbb cccc
```

当然，我们也可以将 `<Com>` 组件中的插槽内容，传递给 `HelloWorld` 组件。例如这样写：

```vue
<script setup lang="ts">
import { h, type FunctionalComponent } from "vue";
import HelloWorld from "./components/HelloWorld.vue";

const Com: FunctionalComponent = (_props, { slots }) => {
  return h(HelloWorld, null, {
    default: () => slots.default?.(),
    footer: ({ foo }: { foo: string }) => h("div", "bbbb " + foo),
  });
};
</script>

<template>
  <Com>
    <div>Com 组件插槽内容</div>
  </Com>
</template>
```

最终渲染为:

```txt
Com 组件插槽内容
bbbb cccc
```

## `h` 和 `createVNode` 区别 ##

查看 Vue 的源码可以发现，`h` 函数本质上是对 `createVNode` 的封装。它的第二个参数名叫 `propsOrChildren`，意味着这个参数既可以用来传递 `props`，也可以用来传递 `children`。

因此，`h` 函数支持多种调用方式，例如：

```ts
h("div", h("div", "11111"));
// 等价于
h("div", null, h("div", "11111"));
// 也等价于
h("div", null, [h("div", "11111")]);
```

Vue 源码中的实现如下：

```ts
export function h(type: any, propsOrChildren?: any, children?: any): VNode {
  const l = arguments.length
  if (l === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // single vnode without props
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren])
      }
      // props without children
      return createVNode(type, propsOrChildren)
    } else {
      // omit props
      return createVNode(type, null, propsOrChildren)
    }
  } else {
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2)
    } else if (l === 3 && isVNode(children)) {
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }
}
```

## 三种运用场景 ##

### 二次组件的封装 ###

假设我们在 `App.vue` 中调用 `HelloWorld` 组件，并传递了插槽：

```vue:App.vue
<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
</script>

<template>
	<HelloWorld>
		<template #header>
			<div>Header</div>
		</template>
		<div>Main</div>
		<template #footer>
			<div>Footer</div>
		</template>
	</HelloWorld>
</template>
```

HelloWorld.vue 组件如下：

```vue:HelloWorld.vue
<template>
	<div>
		<slot name="header"></slot>
		<slot></slot>
		<slot name="footer"></slot>
	</div>
</template>
```

页面最终渲染内容为：

```txt
Header
Main
Footer
```

现在如果我们想对 `HelloWorld` 进行二次封装，可以创建一个 `Child.vue` 组件：

```vue:Child.vue
<script setup lang="ts">
import HelloWorld from "./HelloWorld.vue";
</script>

<template>
	<div>
		<h1>Child</h1>
		<HelloWorld v-bind="$attrs">
			<template v-for="(_, slot) in $slots" #[slot]="slotProps">
				<slot :name="slot" v-bind="slotProps"></slot>
			</template>
		</HelloWorld>
	</div>
</template>
```

此时我们在 `App.vue` 中改为调用 `Child.vue`：

```vue:App.vue
<script setup lang="ts">
import Child from "./components/Child.vue";
</script>

<template>
	<Child>
		<template #header>
			<div>Header</div>
		</template>
		<div>Main</div>
		<template #footer>
			<div>Footer</div>
		</template>
	</Child>
</template>
```

最终页面渲染：

```txt
Child
Header
Main
Footer
```

这种方式虽然可以实现插槽透传，但写法略显繁琐。我们可以使用 `<component>` 动态组件结合 h 函数简化写法：

```vue:Child.vue
<script setup lang="ts">
import { h } from "vue";
import HelloWorld from "./HelloWorld.vue";
</script>

<template>
	<div>
		<h1>Child</h1>
		<component :is="h(HelloWorld, $attrs, $slots)"></component>
	</div>
</template>
```

### 命令式地显示弹框 ###

假如我们项目中使用了 `ant-design-vue` 组件库，展示弹框通常是这样的：

```vue:App.vue
<template>
	<a-button type="primary" @click="showModal">Open Modal</a-button>
	<a-modal v-model:open="open" title="Basic Modal" @ok="handleOk">
		<p>Some contents...</p>
	</a-modal>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const open = ref(false);

const showModal = () => {
	open.value = true;
};

const handleOk = () => {
	open.value = false;
};
</script>
```

我们可以通过 `h` 函数来命令式地展示弹框：

```vue:App.vue
<template>
	<a-button type="primary" @click="showModal">Open Modal</a-button>
</template>

<script lang="ts" setup>
import { Modal } from "ant-design-vue";
import { createApp, h } from "vue";

const showModal = () => {
	const modal = () =>
		h(
			Modal,
			{
				title: "Basic Modal",
				open: true,
                                afterClose: () => unmount(), // Modal 完全关闭后卸载
			},
			() => h("p", "Some contents...")
		);

	const div = document.createElement("div");
	document.body.appendChild(div);

	const app = createApp(modal);
	app.mount(div);

	const unmount = () => {
		app.unmount();
		document.body.removeChild(div);
	};
};
</script>
```

> ⚠️ 这种方式的小问题是：弹框关闭时不会有动画过渡效果。

### 表格中动态渲染内容 ###

在使用 `ant-design-vue` 渲染表格时，基础代码如下：

```vue
<template>
	<a-table :columns="columns" :data-source="data" bordered></a-table>
</template>

<script lang="ts" setup>
const columns = [
	{
		title: "Name",
		dataIndex: "name",
	},
	{
		title: "Address",
		dataIndex: "address",
	},
];

const data = [
	{ name: "John Brown", address: "New York No. 1 Lake Park" },
	{ name: "Jim Green", address: "London No. 1 Lake Park" },
	{ name: "Joe Black", address: "Sidney No. 1 Lake Park" },
];
</script>
```

如果我们希望为“名字”加上超链接，可以通过插槽实现：

```vue
<template>
	<a-table :columns="columns" :data-source="data" bordered>
		<template #bodyCell="{ column, text }">
			<template v-if="column.dataIndex === 'name'">
				<a href="#">{{ text }}</a>
			</template>
		</template>
	</a-table>
</template>

<script lang="ts" setup>
// columns 和 data 同上
</script>
```

还可以通过 `customRender` 配合 `h` 函数实现更灵活的渲染逻辑：

```vue
<template>
	<a-table :columns="columns" :data-source="data" bordered></a-table>
</template>

<script lang="ts" setup>
import { h } from "vue";

const columns = [
	{
		title: "Name",
		dataIndex: "name",
		customRender: ({ text }: { text: string }) => {
			return h("a", { href: "#" }, text);
		},
	},
	{
		title: "Address",
		dataIndex: "address",
	},
];

// data 同上
</script>
```

如果内容更复杂，也可以使用 `tsx` 写法进一步提升可读性和可维护性。

## 总结 ##

通过这篇文章我们可以看到，`h 函数在 Vue 3 中非常强大，适用于：

- 插槽透传时简化代码；
- 实现命令式弹框；
- 动态渲染表格内容等高级场景。

掌握 `h` 函数的使用，有助于我们编写更灵活、更底层、更可控的 Vue 组件逻辑。
