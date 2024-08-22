---
lastUpdated: true
commentabled: true
recommended: true
title: vue3 jsx/tsx 语法 使用css样式，循环，事件，插槽
description: vue3 jsx/tsx 语法 使用css样式，循环，事件，插槽
date: 2024-08-22 15:18:00
pageClass: blog-page-class
---

# vue3 jsx/tsx 语法 使用css样式，循环，事件，插槽 #

## tsconfig.json ##

当使用 TSX 语法时，确保在 tsconfig.json 中配置了 `"jsx": "preserve"`，这样的 TypeScript 就能保证 Vue JSX 语法转换过程中的完整性。

从 Vue 3.4 开始，Vue 不再隐式注册全局 JSX 命名空间。要指示 TypeScript 使用 Vue 的 JSX 类型定义，请确保在你的 tsconfig.json 中包含以下内容：

```json
{
	"compilerOptions": {
		"jsxImportSource": "vue",
		"jsx": "preserve",
	}
}
```

## 使用 ##

### 函数式组件使用 ###

:::demo

```jsx
export default () => {
	return (
		<>
			<div>test</div>
		</>
	);
};
```

:::

### defineComponent + setup 使用 ###

:::demo

```jsx
import { defineComponent } from "vue";

export default defineComponent({
	setup(props, { slots, emit }) {
		return () => {
			return <div>sample</div>;
		};
	},
});
```

:::

### 使用样式 ###

:::demo src=src/demos/JsxStyleDemo.jsx
:::


### 使用 ref 等变量 ###

::: tip
在 JSX 表达式中，使用大括号来嵌入动态值
在 JSX 表达式中，ref 不能自动解包 需要 .value
:::


:::demo

```jsx
import { ref } from "vue";

const num = ref(1);

export default () => {
	return (
		<>
			<div>num 值:{num.value}</div>
		</>
	);
};
```

:::


### v-on 事件绑定写法 ###

以 on 开头，并跟着大写字母的 props 会被当作事件监听器。比如，onClick 与模板中的 @click 等价。

:::demo

```tsx
import { ref } from "vue";

const num = ref(1);

function handleAdd1() {
	num.value += 2;
}

function handleAdd(n: number, e: MouseEvent) {
	num.value += n;
}
export default () => {
	return (
		<div style="display: flex; flex-direction: column; gap: 10px;">
			<div>num 值:{num.value}</div>
			<a-button
				onClick={() => {
					num.value += 1;
				}}
			>
				修改 num + 1
			</a-button>
			<a-button onClick={handleAdd1}>修改 num + 2</a-button>
			<a-button onClick={(e) => handleAdd(3, e)}>修改 num + 3</a-button>
		</div>
	);
};
```

:::

### 事件修饰符 ###

:::demo

```tsx
import { ref } from "vue";

const flag = ref(true);

const data = [
	{
		name: "张三",
	},
	{
		name: "李四",
	},
];

export default () => {
	return (
		<div style="display: flex; flex-direction: column; gap: 10px;">
			<a-button>修改 num + 1</a-button>
      <div>{flag.value ? <div>真</div> : <p>假</p>}</div>
      <ul>
        {data.map((item) => {
          return <li>{item.name}</li>;
        })}
      </ul>
		</div>
	);
};
```

:::

### 组件 ###

**tsx-children.tsx**

```vue
export default () => {
	return <div>tsx-children</div>;
};
```

**tsx-father.tsx**

::: code-group

```vue [vue]
import TsxChildren from "./tsx-children";

export default () => {
	return (
		<div>
			<TsxChildren />
		</div>
	);
};

```

```vue [vue]
import TsxChildren from "./tsx-children";

export default {
	setup() {
		return () => {
			return (
				<>
					<TsxChildren />
				</>
			);
		};
	},
};

```

:::


### 插槽 slot ###

#### 默认插槽 ####

**tsx-children.tsx**

```vue
export default (props, { slots }) => {
	return (
		<>
			<div class="default">{slots.default?.()}</div>
		</>
	);
};
```

**tsx-father.tsx**

```vue
import TsxChildren from "./tsx-children";

export default () => {
	return (
		<div>
			<TsxChildren>
				{{
					default: () => <p>我是默认插槽的内容</p>,
				}}
			</TsxChildren>
		</div>
	);
};
```

#### 具名插槽 ####

**tsx-children.tsx**

```vue
export default (props, { slots }) => {
	return (
		<>
			<div class="default">{slots.default?.()}</div>
			{/* 传递 msg  */}
			<div class="footer">{slots.footer?.({ msg: "footer 插槽" })}</div>
		</>
	);
};
```

**tsx-father.tsx**

```vue
import TsxChildren from "./tsx-children";

export default () => {
	return (
		<div>
			<TsxChildren>
				{{
					default: () => <p>我是默认插槽的内容</p>,
					// 解构 msg 值，使用
					footer: ({ msg }) => <p>我是-{msg}-的内容</p>,
				}}
			</TsxChildren>
		</div>
	);
};
```
