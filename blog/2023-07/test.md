# CodeGroup 自定义全局组件

## 测试 JS + TS

<code-group>

<div title="ts" active>

```ts{2}
// 注释
const add = (a: number, b: number): number => {
	return a + b
}
console.log(add(1, 2))
```

</div>

<div title="js">

```js{2}
// 注释
const add = (a, b) => {
	return a + b
}
console.log(add(1, 2))
```

</div>
</code-group>

## 测试 yarn + npm + pnpm

<code-group>
<div title="yarn" active>

```sh
# install in your project
yarn add -D vitePress
```

</div>
<div title="npm">

```sh
# install in your project
npm install -D vitePress
```

</div>
<div title="pnpm">

```sh
# install in your project
pnpm install -D vitePress
```

</div>
</code-group>
