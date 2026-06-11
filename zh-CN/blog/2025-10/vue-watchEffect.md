---
lastUpdated: true
commentabled: true
recommended: true
title: 用好了 watchEffect 才算会用 Vue3
description: 那些让人误解的响应式陷阱
date: 2025-10-21 09:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

很多 Vue 3 用户都知道有 `watchEffect()`，也偶尔用用，但真正*理解它运行机制和使用场景*的开发者，其实并不多。

它被认为是“比 `watch` 更方便的响应式侦听”，但用不好，它也能成为*项目中最隐蔽的性能杀手*。

这篇文章，我们就来一次彻底的深潜 —— *你以为你会用 watchEffect，其实你只是在用它“运气好”*。

## 一、`watchEffect()` 到底是个什么东西？ ##

**一句话概括**：

> `watchEffect()` 会*立即运行传入的函数*，并自动追踪其中用到的响应式依赖，一旦依赖变了，就重新运行这个函数。

**来看个例子**：

```ts
const count = ref(0)

watchEffect(() => {
  console.log('count 的值是', count.value)
})
```

**这段代码会**：

- 马上执行一次，打印出 `0`；
- 每次 `count.value` 改变时，都会再次执行并打印。

你甚至*不需要手动指定 count 是依赖*，Vue 会自动“收集依赖”。

## 二、和 watch() 有啥区别？ ##

这也是 80% 的 Vue 用户最常犯的概念混淆：

|  特性   |      `watchEffect`  |    `watch`  |
| :-----------: | :-----------: | :-----------: |
| 是否立即执行？ | 是 | 否（除非 `immediate: true`） |
| 是否自动收集依赖？ | 是 | 否（你要手动指定依赖） |
| 是否可获取旧值？ | 否 | 是（`(newVal, oldVal) => {}`） |
| 更适合哪种场景？ | 响应式副作用（如：操作 DOM、console.log、发请求） | 监听特定变量的变化，并对比旧新值 |

**结论**：

- ✅ `watchEffect` 是 *“立即执行 + 自动依赖追踪”*
- ✅ `watch` 是 *“精准监听 + 需要手动指定依赖 + 能拿旧值”*

## 三、用 watchEffect 容易踩的 5 个坑 ##

### 副作用代码“无限循环” ###

```ts
const count = ref(0)

watchEffect(() => {
  count.value++  // ❌ 修改了自身依赖，会死循环！
})
```

*死循环*就这么来了。

✅ 正确写法是：*只读取响应式数据，不要在 watchEffect 里直接修改它们*。

### 错误依赖：隐式变量没收集到 ###

```ts
let localCount = 0

watchEffect(() => {
  console.log(localCount) // ❌ localCount 不是响应式的，watchEffect 不追踪它
})
```

要注意：*非响应式变量不会被追踪*，就算你用到了也不会触发重新运行。

### 嵌套条件分支导致依赖不完整 ###

```ts
const a = ref(1)
const b = ref(2)

watchEffect(() => {
  if (a.value > 0) {
    console.log(b.value)  // ❗ 只有在 a > 0 时才会追踪 b
  }
})
```

当 `a <= 0` 时，`b` 根本没被追踪。下次即使 `b` 变了，也不会重新执行 `watchEffect`。这很容易导致 *逻辑错乱或“触发不了”的问题*。

✅ 解决方案：*让依赖收集“稳定”，避免在分支中读取响应式变量*。

### 你以为收集了依赖，其实没有 ###

```ts
const user = ref({ name: '张三' })

watchEffect(() => {
  console.log(user) // ❌ 打印的是 ref 对象本身，没有触发 getter，Vue 无法追踪
})
```

访问的是 ref 对象本身，而不是它的 .value，Vue 不会收集依赖。

✅ 改为 `console.log(user.value.name)`，才能触发依赖收集。

### 你没清理副作用，留下了“内存幽灵” ###

```ts
watchEffect(() => {
  const el = document.getElementById('app')
  el?.addEventListener('click', handleClick)
})
```

每次依赖变化就会重新运行，但你*没有移除旧的事件监听器*。这就产生了堆积副作用。

✅ 正确写法是使用 `onInvalidate()` 来做清理：

```ts
watchEffect((onInvalidate) => {
  const el = document.getElementById('app')
  el?.addEventListener('click', handleClick)

  onInvalidate(() => {
    el?.removeEventListener('click', handleClick)
  })
})
```

## 四、什么时候该用 watchEffect，什么时候该用 watch？ ##

**watchEffect 的适用场景**：

- 自动追踪依赖的副作用逻辑，比如：
  - 页面标题：`document.title = xxx`
  - 打日志：`console.log()`
  - 响应式触发 API 调用（但要小心节流）
- 生命周期中自动执行的响应式行为

**watch 的适用场景**：

- 明确指定监听哪个值
- 需要对比旧值和新值
- 监听嵌套数据（用 `deep: true`）
- 不想立即执行，只在变化时触发

## 五、一些高级技巧：让 watchEffect 更丝滑 ##

### ✅ 和 async/await 一起用 ###

```ts
watchEffect(async () => {
  const res = await fetchUser()
  data.value = res
})
```

注意：不要在里面直接用非响应式的中间变量，会丢依赖。

### ✅ 搭配组件卸载自动清理 ###

在 Vue 3 里，`watchEffect` 会自动在组件卸载时停止执行，无需手动停止。这一点比 Vue 2 的 `watch` 更方便。

### ✅ 你真的会用 watchEffect 吗？ ###

很多人只是用它“凑合”，但真正用好了，你能获得：

- 更清晰的副作用组织逻辑
- 更少的手动依赖指定
- 更丝滑的组件行为

而不是无限循环、依赖不生效、内存泄漏、控制不住副作用。
