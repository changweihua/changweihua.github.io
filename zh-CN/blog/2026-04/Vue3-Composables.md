---
lastUpdated: true
commentabled: true
recommended: true
title: 组合式函数 Composables 的设计模式
description: 如何写出可复用的 Vue3 Hooks
date: 2026-04-09 10:30:00 
pageClass: blog-page-class
cover: /covers/typescript.svg
---

## 一个真实的崩溃瞬间 ##

你写了第三个页面，发现又在写 `onMounted` 里请求数据、`ref` 存状态、`watch` 做联动——和前两个页面一模一样，只是接口地址不同。

复制粘贴？行，能跑。但等你第十个页面还在粘贴的时候，产品说"加载状态要统一加个骨架屏"，你就知道什么叫"技术债的复利效应"了。

Vue3 的 Composition API 给了你一把刀，但刀法得自己练。`composable`（组合式函数）不是简单地"把逻辑抽到函数里"，它是一套设计模式——什么该抽、怎么抽、边界在哪，这才是真正值得聊的。

## 本质问题：组合式函数到底在解决什么？ ##

Options API 时代，逻辑按"选项类型"组织——data 归 data，methods 归 methods，computed 归 computed。一个"搜索"功能的代码散落在五个选项里，你得上下反复跳着看。

Composition API 把组织维度从"选项类型"变成了"业务关切"。而 `composable` 就是这个思路的落地单元：*一个业务关切 = 一个函数*。

它的本质是带状态的逻辑复用单元。注意"带状态"三个字——这是它和普通工具函数的根本区别。

```ts
// ❌ 普通工具函数：无状态，纯计算 —— 不需要 use 前缀
function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`
}

// ✅ composable：有状态，有响应式，每次调用生成独立实例
function usePrice(initialPrice: number) {
  const price = ref(initialPrice)
  const formatted = computed(() => `¥${price.value.toFixed(2)}`)

  function update(val: number) {
    price.value = val
  }

  return { price, formatted, update }
}
```

如果你的函数不需要 `ref`、`computed`、`watch`、生命周期钩子中的任何一个，那它就是个工具函数，别硬套 `use` 前缀。

## 模式一：状态封装——最基础也最常用 ##

90% 的 composable 都在做一件事：*把一坨相关的响应式状态和操作打包*。

### useCounter：教科书级示例之外的思考 ###

所有教程都从 `useCounter` 开始，但大部分教程没告诉你设计要点：

```ts
interface UseCounterOptions {
  min?: number
  max?: number
  initialValue?: number
}

function useCounter(options: UseCounterOptions = {}) {
  const { min = -Infinity, max = Infinity, initialValue = 0 } = options

  // 入参校验放在边界处，内部逻辑就可以无脑信任
  const count = ref(clamp(initialValue, min, max))

  function inc(delta = 1) {
    count.value = clamp(count.value + delta, min, max)
  }

  function dec(delta = 1) {
    inc(-delta) // 复用 inc，不重复写 clamp
  }

  function reset() {
    count.value = clamp(initialValue, min, max)
  }

  // readonly 包装 → 外部只能通过方法修改，不能直接 count.value = 999 绕过 clamp
  return { count: readonly(count), inc, dec, reset }
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val))
}
```

三个设计决策：

- 参数用 options 对象而不是位置参数。 当参数超过两个，位置参数就是灾难——`useCounter(0, 10, 100)` 谁记得住哪个是 min 哪个是 max？

- 返回值用 `readonly` 包装。 暴露 `ref` 本身意味着外部可以 `count.value = 999` 绕过 `clamp` 逻辑。单向数据流不是 React 的专利。

- 返回对象而不是数组。 Vue 的 composable 推荐返回具名对象。不像 React hooks 需要自定义命名（`const [count, setCount] = useState(0)`），Vue 的解构天然具名，多返回值也不会混乱。

## 模式二：异步状态管理——真正的高频场景 ##

实际项目里你写得最多的 composable 大概率是"请求数据"。

```ts
function useFetch<T>(url: MaybeRefOrGetter<string>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  async function execute() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch(toValue(url))
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  // url 是响应式的 → url 变了自动重新请求
  watchEffect(() => {
    toValue(url) // 收集依赖
    execute()
  })

  return { data, error, isLoading, execute }
}
```

```ts
// 用法：url 变了自动重新请求，不用手动 watch
const userId = ref(1)
const { data: user, isLoading } = useFetch<User>(
  () => `/api/users/${userId.value}` // getter 写法，最灵活
)

userId.value = 2 // 切换用户 → url 变化 → 自动重新请求
```

### 参数设计的关键：MaybeRefOrGetter ###

`url` 参数的类型是 `MaybeRefOrGetter<string>`——这是 Vue3 composable 的核心范式：*入参同时接受普通值、`ref` 和 `getter` 函数*。

```ts
useFetch('/api/users')                    // 静态字符串
useFetch(urlRef)                          // ref
useFetch(() => `/api/users/${id.value}`)  // getter
// ☝️ 三种传法都行，内部用 toValue() 统一取值
```

调用者不用关心"我传的是 ref 还是普通值"，心智负担少一半。

如果你的 composable 参数未来可能是动态的，就用 `MaybeRefOrGetter`。这条规则能省掉很多后期重构。

## 模式三：副作用管理——最容易写出 bug 的地方 ##

composable 里注册事件监听、定时器、WebSocket 连接，如果不清理，就等着内存泄漏。

```ts
// 基础版：target 固定
function useEventListener<K extends keyof WindowEventMap>(
  target: EventTarget,
  event: K,
  handler: (e: WindowEventMap[K]) => void
) {
  onMounted(() => target.addEventListener(event, handler as EventListener))
  onUnmounted(() => target.removeEventListener(event, handler as EventListener))
}
```

但这个版本有个问题：`target` 是写死的。如果 `target` 是个 `ref` 呢？

```ts
// 进阶版：target 支持响应式，自动解绑/重绑
function useEventListener(
  target: MaybeRefOrGetter<EventTarget | null>,
  event: string,
  handler: EventListener
) {
  let cleanup: (() => void) | undefined

  function bindEvent() {
    cleanup?.() // 先解绑旧的
    const el = toValue(target)
    if (!el) return
    el.addEventListener(event, handler)
    cleanup = () => el.removeEventListener(event, handler)
  }

  // target 变了 → 旧的解绑，新的绑上
  watchEffect(() => {
    bindEvent()
  })

  // 用 onScopeDispose 而不是 onUnmounted
  // → 在 Pinia store / effectScope 里也能正确清理
  onScopeDispose(() => cleanup?.())
}
```

这里用了 `onScopeDispose` 而不是 `onUnmounted`——区别在于：`onScopeDispose` 在当前 `effect scope` 销毁时触发，不仅限于组件。如果这个 `composable` 被用在 `effectScope()` 里（比如 Pinia store），`onUnmounted` 根本不会触发，而 `onScopeDispose` 可以。

> 规则：composable 里的清理用 `onScopeDispose`，别用 `onUnmounted`。

## 模式四：组合式的组合—— `composable` 套 `composable`

composable 最强的能力不是单个函数，而是组合。像乐高一样拼。

```ts
function useMouse() {
  const x = ref(0)
  const y = ref(0)

  // 复用 useEventListener，不用重复处理清理逻辑
  useEventListener(window, 'mousemove', (e: MouseEvent) => {
    x.value = e.clientX
    y.value = e.clientY
  })

  return { x, y }
}

function useMouseInElement(target: MaybeRefOrGetter<HTMLElement | null>) {
  const { x, y } = useMouse() // 继续复用

  const elementX = ref(0)
  const elementY = ref(0)

  watchEffect(() => {
    const el = toValue(target)
    if (!el) return
    const rect = el.getBoundingClientRect()
    elementX.value = x.value - rect.left
    elementY.value = y.value - rect.top
  })

  return { elementX, elementY }
}

// 三层复用：useEventListener → useMouse → useMouseInElement
// 每一层只关心自己那件事，上层不需要知道底层怎么绑事件、怎么清理
```

这就是"组合式"三个字的真正含义——不是把逻辑"提取"出去，而是让逻辑可以搭积木。

## 设计权衡：那些需要做的选择 ##

### 粒度：拆多细算合适？ ###

见过有人把三行代码也封装成 `composable` 的：

```ts
// ❌ 过度封装
function useTitle(title: string) {
  document.title = title
}
```

也见过把整个页面逻辑塞进一个 `composable` 的，写了 500 行，跟以前的 God Component 一个味。

> 经验法则：超过 80 行考虑拆分；不到 10 行且只用一次，别抽。

抽取的判断标准不是"这段代码多长"，而是：

- 它会被复用吗？ 至少两处用到再抽。
- 它在概念上是独立的吗？ "鼠标位置跟踪"是独立的，"按钮文案计算"可能不是。
- 抽完之后原来的代码更好读了吗？ 如果抽完还得跳来跳去看，不如不抽。

### 返回值：ref 还是 reactive？ ###

```ts
// ✅ 方案 A：返回包含 ref 的对象（推荐）
function useMouse() {
  const x = ref(0)
  const y = ref(0)
  return { x, y }
}
const { x, y } = useMouse() // 解构后仍然是响应式

// ❌ 方案 B：返回 reactive 对象
function useMouse() {
  return reactive({ x: 0, y: 0 })
}
const { x, y } = useMouse() // 解构后响应式丢失！
```

Vue 官方文档明确推荐方案 A。原因很简单：`reactive` 对象解构会丢失响应式，而 `ref` 不会。调用方大概率要解构，你不能假设别人记得用 `toRefs`。

### 同步 vs 异步初始化 ###

```ts
const { count } = useCounter()
console.log(count.value) // 0，确定可用 —— 同步，调用完立刻有值

const { data } = useFetch('/api/user')
console.log(data.value) // null，数据还没回来 —— 异步，需要 v-if 或 watch 兜底
```

异步 composable 必须暴露 `isLoading` 和 `error`，不能让调用方猜"数据到了没"。这不是贴心设计，是必需品。

## 边界与踩坑 ##

### 踩坑一：在 composable 外面调用 ###

```ts
// ❌ 模块顶层调用 → onMounted/onUnmounted 找不到当前组件实例
const { data } = useFetch('/api/config') // 💥 报警告或静默失败

export default {
  setup() {
    const { data } = useFetch('/api/config') // ✅ 在 setup 里调用
  }
}
```

composable 如果内部用了生命周期钩子，必须在 `setup()` 或 `<script setup>` 的同步执行期间调用。`await` 之后再调用也不行——await 之后当前实例上下文已经丢了。

### 踩坑二：composable 内部的 watch 没清理 ###

在 composable 里 `watch` 了一个外部传入的 ref，组件卸载时 watch 会自动停止——这没问题。但如果你的 composable 是在 `effectScope` 里手动创建的（比如 Pinia），需要手动调 `scope.stop()`。

### 踩坑三：SSR 中访问浏览器 API ###

```ts
function useLocalStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(defaultValue)

  if (typeof window !== 'undefined') {
    // SSR 环境下没有 localStorage，必须守卫
    const stored = localStorage.getItem(key)
    if (stored) data.value = JSON.parse(stored)

    watch(data, (val) => {
      localStorage.setItem(key, JSON.stringify(val))
    }, { deep: true })
  }

  return data
}
```

任何涉及 `window`、`document`、`localStorage` 的 composable，都要考虑 SSR。不加守卫，Nuxt 项目一上线就炸。

## 当项目越来越大 ##

### 目录组织 ###

```txt
composables/
├── useAuth.ts          # 业务级：认证相关（别发 npm 包）
├── usePermission.ts    # 业务级：权限相关
├── useFetch.ts         # 通用级：请求封装（跨项目可用）
├── useEventListener.ts # 基础级：事件绑定（可以发包）
└── index.ts            # 统一导出
```

分三层：基础级（和业务无关）、通用级（跨项目可用）、业务级（和当前项目绑定）。

### 类型安全 ###

`composable` 的泛型设计很重要。`useFetch<User>` 比 `useFetch` 然后到处 `as User` 优雅太多。花点时间写好类型签名，TypeScript 会在每一个调用处帮你挡住错误。

### 测试 ###

composable 天然好测试——它就是个函数，给入参，拿返回值：

```ts
import { useFetch } from './useFetch'
import { withSetup } from '../test-utils' // 模拟 setup 上下文

test('useFetch loads data', async () => {
  const { data, isLoading } = withSetup(() => useFetch('/api/test'))

  expect(isLoading.value).toBe(true)
  await flushPromises()
  expect(data.value).toEqual({ id: 1 })
  expect(isLoading.value).toBe(false)
})
```

不用挂载组件、不用模拟模板渲染，比测 Options API 的 mixin 舒服一百倍。

## 组合式函数的设计模型 ##

composable 的设计核心就三件事：

- 封装状态 —— 把相关的 `ref`、`computed`、`watch` 圈在一起，对外暴露干净的接口。信息隐藏原则在响应式系统里的具体表现。

- 管理副作用 —— 绑定了什么就要清理什么，`onScopeDispose` 是你的安全网。副作用不清理，就是在给未来的自己埋雷。

- 保持可组合性 —— 小函数组合成大函数，大函数可以继续被组合。入参用 `MaybeRefOrGetter` 保持灵活，返回值用 ref 对象保持可解构。

这三条不只适用于 Vue。React hooks、Svelte 的 runes、SolidJS 的 primitives——底层逻辑一样。*状态封装 + 副作用管理 + 组合能力*，这是所有"带状态的逻辑复用"方案的通用模型。

下次遇到"这段逻辑要不要抽 composable"，问自己三个问题：它有独立的状态吗？会被复用吗？抽完之后代码更清晰了吗？三个"是"就抽，否则别动。过度抽象比不抽象更可怕。
