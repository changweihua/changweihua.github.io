---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3弹窗交互进阶：五种优雅返回结果方案解析
description: Vue3弹窗交互进阶：五种优雅返回结果方案解析
date: 2025-06-27 15:35:00 
pageClass: blog-page-class
---

# Vue3弹窗交互进阶：五种优雅返回结果方案解析 #

在Vue的组件化世界里却需要重新理解状态流。经过多个中后台项目的迭代验证，我总结出5种方案：

- **官方事件流**：最朴素的Vue式解法
- **回调注入**：解耦父子组件的过渡方案
- **Promise**：符合异步编程直觉的改造
- **usePromisify**：可复用的TypeScript工程化实践
- **事件中枢**：复杂场景的终极解法

接下来我将结合代码实现逐一介绍。

以下为展示代码所使用的技术栈：

```json
{
  "dependencies": {
    "element-plus": "^2.9.7",
    "mitt": "^3.0.1",
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "@vue/tsconfig": "^0.7.0",
    "typescript": "~5.7.2",
    "vite": "^6.2.0",
    "vue-tsc": "^2.2.4"
  }
}
```

展示代码内的弹窗组件都命名为 `Child.vue`，以下将称为子组件。负责引用的父组件命名为 `Parent.vue`。

## 官方事件流 ##

这应该是我初学前端时使用最频繁的一种方法。也是vue的标准做法。

子组件内使用 `emits` 触发事件。

```vue
<template>
	<el-dialog
		v-model="visible"
		title="操作窗口"
		append-to-body
		:close-on-click-modal="false"
		@close="handleClose"
	>
        <div>...</div>
        
		<template #footer>
			<el-button @click="handleClose">
				取消
			</el-button>
			<el-button  type="primary" @click="handleConfirm">
				确认
			</el-button>
		</template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)

const emits = defineEmits<{
    close: [],
    confirm: [string]
}>()

/**
 * 关闭
 */
function handleClose() {
    visible.value = false
    emits('close')
}

/**
 * 确认
 */
function handleConfirm() {
    visible.value = false
    emits('confirm', 'confirm result')
}

defineExpose({
    open: () => {
        visible.value = true
    }
})
</script>
```

父组件调用子组件 `defineExpose` 出来的 `open` 方法打开子组件弹窗，然后通过监听 `confirm` 事件接收弹窗结果

```vue:Parent.vue
<template>
    <div>
        <el-button  type="primary" @click="handleOpenDialog">
            打开操作弹窗
        </el-button>
        <Child ref="ChildRef" @close="handleDialogClose" @confirm="handleDialogConfirm" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'

const ChildRef = ref<InstanceType<typeof Child>>()

/**
 * 打开弹窗
 */
function handleOpenDialog() {
    ChildRef.value?.open()
}

/**
 * 弹窗关闭回调事件
 */
function handleDialogClose() {
    console.log('弹窗关闭回调事件')
}

/**
 * 弹窗确认回调事件
 */
function handleDialogConfirm(result: string) {
    console.log('弹窗确认回调事件')
    console.log(result)
}
</script>
```

## 回调注入 ##

子组件会在 `defineExpose` 的 `open` 方法内多接收两个回调函数。然后用包裹函数进行一层封装，在关闭或确认时执行对应的回调函数。

```vue
<template>
	<el-dialog
		v-model="visible"
		title="操作窗口"
		append-to-body
		:close-on-click-modal="false"
		@close="handleClose"
	>
        <div>...</div>
        
		<template #footer>
			<el-button @click="handleClose">
				取消
			</el-button>
			<el-button  type="primary" @click="handleConfirm">
				确认
			</el-button>
		</template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)

type Callbacks = {
    confirm?: (result: string) => void
    close?: () => void
}
const callbacks = ref<Callbacks>({})

/**
 * 关闭
 */
function handleClose() {
    callbacks.value.close?.()
}

/**
 * 确认
 */
function handleConfirm() {
    callbacks.value.confirm?.('confirm result')
}

/**
 * 包裹回调，执行完后清空回调
 */
function wrapCallback<T extends ((...args: any[]) => void) | undefined>(
    callback: T
): T {
    if (!callback) return undefined as T

    return ((...args: Parameters<Extract<T, Function>>) => {
        callback(...args)
        callbacks.value = {}
        visible.value = false
    }) as T
}

defineExpose({
    open: (
		confirmCallback?: Callbacks['confirm'],
		closeCallback?: Callbacks['close']
	) => {
    visible.value = true
    callbacks.value = {
            confirm: wrapCallback(confirmCallback),
            close: wrapCallback(closeCallback),
    }
  }
})
</script>
```

父组件需要在调用 `open` 方法时将回调函数传入子组件，而不是用监听事件了。

```vue
<template>
    <div>
        <el-button  type="primary" @click="handleOpenDialog">
            打开操作弹窗
        </el-button>
        <Child ref="ChildRef" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'

const ChildRef = ref<InstanceType<typeof Child>>()

/**
 * 打开弹窗
 */
function handleOpenDialog() {
    ChildRef.value?.open(handleDialogConfirm, handleDialogClose)
}

/**
 * 弹窗关闭回调事件
 */
function handleDialogClose() {
    console.log('弹窗关闭回调')
}

/**
 * 弹窗确认回调事件
 */
function handleDialogConfirm(result: string) {
    console.log('弹窗确认回调')
    console.log(result)
}
</script>
```

这种方案不论是父组件还是子组件维护性都略差，唯一优点就是兼容性略好，只适合需要兼容旧浏览器的项目。

## Promise ##

子组件在 `open` 方法调用时返回一个 `Promise` 实例，并且将 `resolve` 和 `reject` 保存到 `promiseController` 变量，再用
`controlPromise` 函数控制执行。

```vue
<template>
	<el-dialog
		v-model="visible"
		title="操作窗口"
		append-to-body
		:close-on-click-modal="false"
		@close="handleClose"
	>
        <div>...</div>
        
		<template #footer>
			<el-button @click="handleClose">
				取消
			</el-button>
			<el-button  type="primary" @click="handleConfirm">
				确认
			</el-button>
		</template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)

type PromiseController = { 
    resolve?: (value?: string | PromiseLike<string>) => void,
    reject?: (reason?: any) => void,
}
// promise 控制器
let promiseController: PromiseController = {}

// 控制 promise 状态
function controlPromise(key: keyof PromiseController, value?: string) {
    promiseController[key]?.(value)
    promiseController = {}
    visible.value = false
}

/**
 * 关闭
 */
function handleClose() {
    controlPromise('reject')
}

/**
 * 确认
 */
function handleConfirm() {
    controlPromise('resolve', 'confirm result')
}

defineExpose({
    open: () => {
  		return new Promise<string | undefined>((resolve, reject) => {
  			visible.value = true
  			promiseController = { resolve, reject }
  		})
    }
})
</script>
```

父组件只需要在调用子组件 `open` 方法时进行 `await` ，就能在弹窗确认时拿到结果并且进行操作。如果需要在关闭时进行操作，就需要使用 `try...catch` 包裹进行捕获。

或者调用 `.then` 方法注册成功回调和失败回调。

```vue
<template>
    <div>
        <el-button  type="primary" @click="handleOpenDialog">
            打开操作弹窗
        </el-button>
        <Child ref="ChildRef" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'

const ChildRef = ref<InstanceType<typeof Child>>()

/**
 * 打开弹窗
 */
async function handleOpenDialog() {
    try {
        const result = await ChildRef.value?.open()

        console.log('弹窗确认回调事件')
        console.log(result)
    } catch (e) {
        console.error(e)
        console.log('弹窗关闭或错误回调事件')
    }
}
</script>
```

可以看到这个方法使用起来最简便，只是子组件需要维护 `promiseController` 和 `controlPromise` ，代码并不雅观。

如果子组件 `defineExpose` 导出多个操作函数，比如add和edit有时可能在同一个弹窗内进行操作，那么需要维护的 `promiseController` 和 `controlPromise` 可能就会随之增多。

所以我们需要将这些操作进行封装。

## usePromisify ##

`usePromisify` 会将业务操作函数包装成 `Promise` 函数，通过返回的 `controlPromise` 函数操作结果。

```ts
type PromiseController<R> = {
    resolve?: (value: R) => void;
    reject?: (reason?: any) => void;
};

type ControlPromise<R> = {
    (type: "resolve", res: R): void;
    (type: "reject", reason?: any): void;
}

function usePromisify<R, T extends (...args: any[]) => void>(
    callback: T
): [
    ControlPromise<R>,
    (...args: Parameters<T>) => Promise<R>
] {
    let promiseController: PromiseController<R> = {};

    // 控制 Promise 状态的核心函数
    const controlPromise: ControlPromise<R> = (type: 'resolve' | 'reject', res: R) => {
        // 获取对应的 resolve/reject 方法
        const handler = promiseController[type];
        if (handler) {
            handler(res);        // 执行状态变更
            promiseController = {}; // 清空控制器避免重复调用
        }
    };

    // 包装后的 Promise 函数
    const wrappedFunction = (...args: Parameters<T>): Promise<R> => {
        return new Promise<R>((resolve, reject) => {
            // 暂存 resolve/reject 方法供外部调用
            promiseController.resolve = resolve;
            promiseController.reject = reject;
            // 触发原始回调函数
            callback(...args);
        });
    };

    return [controlPromise, wrappedFunction];
}

export default usePromisify;
```

如果你的项目不用ts，那么这里也有加了jsdoc的js版。

```js
/**
 * @template R 返回值类型
 * @template {Function} T 函数类型，接受任意参数且无返回值
 * @param {T} callback 要包装的回调函数
 * @returns {[
 *   (type: 'resolve' | 'reject', res: R) => void, // 控制 Promise 的操作函数
 *   (...args: Parameters<T>) => Promise<R>       // 包装后的函数，返回 Promise
 * ]} 返回操作函数和包装后的 Promise 函数
 */
function usePromisify(callback) {
	/** @type {Partial<Record<'resolve' | 'reject', (value: R) => void>>} */
	let promiseController = {}

	/**
	 * 控制 Promise 的状态
	 * @param {'resolve' | 'reject'} type 操作类型
	 * @param {R} res Promise 的结果
	 */
	const controlPromise = (type, res) => {
		if (promiseController[type] && typeof promiseController[type] === 'function') {
			[type](res)
			promiseController = {}
		}
	}

	/**
	 * 包装后的函数
	 * @param {...Parameters<T>} args 回调函数的参数
	 * @returns {Promise<R>} 包装后的 Promise
	 */
	const wrappedFunction = (...args) => {
		return new Promise((resolve, reject) => {
			promiseController.resolve = resolve
			promiseController.reject = reject
			callback(...args)
		})
	}

	return [controlPromise, wrappedFunction]
}

export default usePromisify
```

使用 `usePromisify` 之后子组件的代码少了很多，可以更加专注业务代码了。

```vue
<template>
	<el-dialog
		v-model="visible"
		title="操作窗口"
		append-to-body
		:close-on-click-modal="false"
		@close="handleClose"
	>
        <div>...</div>
        
		<template #footer>
			<el-button @click="handleClose">
				取消
			</el-button>
			<el-button  type="primary" @click="handleConfirm">
				确认
			</el-button>
		</template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import usePromisify from './usePromisify'

const visible = ref(false)

const [openControl, open] = usePromisify<string, () => void>(() => {
	visible.value = true
})

/**
 * 关闭
 */
function handleClose() {
    // 关闭弹窗
    visible.value = false
    // 返回结果
    openControl('reject')
}

/**
 * 确认
 */
function handleConfirm() {
    // 关闭弹窗
    visible.value = false
    // 返回结果
    openControl('resolve', 'confirm result')
}

defineExpose({
    open: open
})
</script>
```

父组件的使用没有变化，还是用 `await` 或者 `.then` 就可以了。

```vue
<template>
    <div>
        <el-button  type="primary" @click="handleOpenDialog">
            打开操作弹窗
        </el-button>
        <Child ref="ChildRef" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'

const ChildRef = ref<InstanceType<typeof Child>>()

/**
 * 打开弹窗
 */
async function handleOpenDialog() {
    try {
        const result = await ChildRef.value?.open()

        console.log('弹窗确认回调事件')
        console.log(result)
    } catch (e) {
        console.error(e)
        console.log('弹窗关闭或错误回调事件')
    }
}
</script>
```

这个方案目前是我使用下来最好用的方法，推荐大家使用该方案。

## 事件中枢 ##

还有一种特殊情况，弹窗组件和需要监听弹窗结果的组件不一定是父子关系。或者有多处地方需要监听一个弹窗的结果。

这时候就需要有一个 `eventbus` 事件中心，通过发布订阅模式来串联多方。

先用 `mitt` 创建一个弹窗的事件中心。注意 `CLOSE` 和 `CONFIRM` 是字符串常量，不是类型，用于区分组件触发的事件类型。

```ts
import mitt from 'mitt'

export const CLOSE = 'close'
export const CONFIRM = 'confirm'

export type ModalResult = typeof CLOSE | typeof CONFIRM

export type ModalEventOptions = { type: ModalResult, data?: any }


export const emitter =  mitt<{
    [k: string]: ModalEventOptions
}>()
```

弹窗组件用 `defineOptions.customOptions` 向外开放一个 `mittKey` 事件键，这样需要监听的组件可以通过导入这个组件的静态属性用于监听了。

如果担心事件键重复，可以使用 `symbol` 类型。

需要注意一次窗口不要 `emit` 多次事件。

```vue
<template>
	<el-dialog
		v-model="visible"
		title="操作窗口"
		append-to-body
		:close-on-click-modal="false"
		@close="handleClose"
	>
        <div>...</div>
        
		<template #footer>
			<el-button @click="handleClose">
				取消
			</el-button>
			<el-button  type="primary" @click="handleConfirm">
				确认
			</el-button>
		</template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { emitter, CLOSE, CONFIRM } from '@/eventbus/modal'

const visible = ref(false)

const mittKey = 'MyMittKey'
defineOptions({
	customOptions: {
		mittKey: mittKey
	}
})

/**
 * 关闭
 */
function handleClose() {
	// 避免重复调用关闭事件
    if (visible.value) emitter.emit(mittKey, { type: CLOSE })
  	visible.value = false
}

/**
 * 确认
 */
function handleConfirm() {
    emitter.emit(mittKey, { type: CONFIRM, data: 'confirm result' })
  	visible.value = false
}

defineExpose({
    open: () => {
  		visible.value = true
  	}
})
</script>
```

需要监听的内容组件如下，通过取弹窗组件的 `customOptions.mittKey` 来精准监听该组件的回调。

```vue
<template>
    <div>
        content
    </div>
</template>

<script setup lang="ts">
import { onUnmounted, onMounted } from 'vue'
import OperateModal from '@/components/OperateModal.vue'
import { emitter, CLOSE, CONFIRM, type ModalEventOptions } from '@/eventbus/modal'

/**
 * 弹窗关闭回调事件
 */
function handleDialogClose() {
    console.log('弹窗关闭回调事件')
}

/**
 * 弹窗确认回调事件
 */
function handleDialogConfirm(result: string) {
    console.log('弹窗确认回调事件')
    console.log(result)
}

function handleEmitter(e: ModalEventOptions) {
    // 执行对应操作函数
    if (e.type === CLOSE) {
        handleDialogClose()
    } else if (e.type === CONFIRM) {
        handleDialogConfirm(e.data)
    }
}

onMounted(() => {
    // 监听弹窗组件的事件
    emitter.on(
        OperateModal.customOptions.mittKey,
        handleEmitter
    )
})

// 组件销毁时，移除事件监听
onUnmounted(() => {
    emitter.off(
        OperateModal.customOptions.mittKey,
        handleEmitter
    )
})
</script>
```

这样就可以不用关心两个组件的层级问题了，多个组件同时监听弹窗结果也没问题。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import content from '@/views/content.vue'
import OperateModal from '@/components/OperateModal.vue'


const OperateModalRef = ref<InstanceType<typeof OperateModal>>()
/**
 * 打开弹窗
 */
function handleOpenDialog() {
  OperateModalRef.value?.open()
}
</script>

<template>
  <div>
    <el-button  type="primary" @click="handleOpenDialog">
        打开操作弹窗
    </el-button>

    <content />
    <OperateModal ref="OperateModalRef" />
  </div>
</template>
```
