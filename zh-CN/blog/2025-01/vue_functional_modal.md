---
lastUpdated: true
commentabled: true
recommended: true
title: vue3 函数式弹窗
description: vue3 函数式弹窗
date: 2025-01-15 11:18:00
pageClass: blog-page-class
---

# Vue3 函数式弹窗 #

## 前言 ##

封装一个宇宙最强级别函数式弹窗方法，使用时只需调用即可。

我希望这个方法满足以下条件：

- 支持懒加载（异步加载函数）
- props传参
- 事件绑定
- provide inject 注入数据
- 各种自定义插槽
- 暴露内部方法

接下来让我们一步一步实现它。

## 基本实现 ##

在实际开发中，最基本的弹窗组件需要满足以下几点要求：

- 能够接收父组件传进来的参数
- 能够绑定自定义事件接收子组件的通知

### 弹窗组件 ###

以下是一个基本弹窗组件：

```js
<template>
  <a-modal v-model:open="bindVisible" :title="title" @ok="handleOk">
    <div>父组件传入的 prop：{{ prop }}</div>
  </a-modal>
</template>
<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  visible: boolean
  title: string
  prop: string
}>()

const emit = defineEmits(['update:visible', 'loadList'])
const bindVisible = useVModel(props, 'visible', emit)

const handleOk = () => {
  // 假装请求业务接口...
  bindVisible.value = false
  emit('loadList')
}
</script>
```

### 使用方式 ###

我想要在页面中这样使用它：仅需要通过调用函数的形式让弹窗显示，其他什么都不用写，这样开发时把注意力都聚集在这个函数上，逻辑高度内聚。

```js
<template>
  <div>
    <a-button type="primary" @click="onClick">弹窗按钮</a-button>
  </div>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue'

const onClick = () => {
  showModal({
    modalComponent: () => import('@/pages/home/components/modal.vue'),
    title: '弹窗标题',
    prop: '弹窗组件需要的参数',
    onLoadList: () => message.success('表单已经提交，刷新列表')
  })
}
</script>
```

### showModal 具体实现 ###

确定了 showModal 的使用方式之后，我们着手去实现它：

1. 首先函数必须接收一个弹窗组件，这个组件可以是懒加载的（一个异步加载函数），如果懒加载，我们会用 `defineAsyncComponent` 把它定义为一个异步组件。
2. 可以通过 appendTo 参数指定挂载的位置（默认为 document.body)
3. 拿到传进来的参数、事件。
4. 使用 h 函数创建虚拟节点，并且通过 render 函数把节点渲染到需要挂载的DOM上。

```js
import { defineAsyncComponent, h, nextTick, render } from 'vue'
import type { Component } from 'vue'

interface IModalOptions {
  modalComponent: Component | any
  appendTo?: HTMLElement | string
  [name: string]: unknown
}

const getAppendToElement = (appendTo: IModalOptions['appendTo']): HTMLElement => {
  let appendToEL: HTMLElement | null = document.body
  if (appendTo) {
    if (typeof appendTo === 'string') {
      appendToEL = document.querySelector<HTMLElement>(appendTo)
    }
    if (appendTo instanceof HTMLElement) {
      appendToEL = appendTo
    }
    if (!(appendToEL instanceof HTMLElement)) {
      appendToEL = document.body
    }
  }
  return appendToEL
}

export default function showModal(options: IModalOptions) {
  const container = document.createElement('div')
  const isAsync = typeof options.modalComponent === 'function'

  const modalComponent = isAsync
    ? defineAsyncComponent(options.modalComponent)
    : options.modalComponent

  const props: Record<string, any> = {}
  for (const key in options) {
    if (!['modalComponent', 'appendTo'].includes(key)) props[key] = options[key]
  }

  const vNode = h(modalComponent, {
    visible: true,
    ...props,
    'onUpdate:visible': () => {
      nextTick(() => {
        close()
      })
    }
  })

  render(vNode, container)
  getAppendToElement(options.appendTo).appendChild(container)

  function close() {
    render(null, container)
    container.parentNode?.removeChild(container)
  }
}
```

## 注入数据 ##

在实际开发中，我们很有可能会使用 provide 给下级组件提供数据。从 showModal 函数的实现中我们可以看到弹窗组件默认是挂载到 document.body 下的，这会使弹窗组件脱离原有组件树，内部就无法通过 inject 拿到上级组件 provide 的数据了。所以我们需要改造一下我们的 showModal 函数。

```js
import { defineAsyncComponent, getCurrentInstance, h, nextTick, render, createVNode } from 'vue'
import type { Component } from 'vue'

// 省略部分代码...

// start
function getProvides(instance: any) {
  let provides = instance?.provides || {}
  if (instance.parent) {
    provides = { ...provides, ...getProvides(instance.parent) }
  }
  return provides
}
// end

// 修改后的 useShowModal
export default function useShowModal() {
  // start
  const currentInstance = getCurrentInstance() as any
  const provides = getProvides(currentInstance)
  // end
  
  function showModal(options: IModalOptions) {
    const container = document.createElement('div')
    const isAsync = typeof options.modalComponent === 'function'

    const modalComponent = isAsync
      ? defineAsyncComponent(options.modalComponent)
      : options.modalComponent

    const props: Record<string, any> = {}
    for (const key in options) {
      if (!['modalComponent', 'appendTo'].includes(key)) props[key] = options[key]
    }

    // start
    const vNode = createVNode({
      setup() {
        const instance = getCurrentInstance() as any
        if (instance) {
          instance.provides = { ...instance.provides, ...provides }
        }
      },
      render: () =>
        h(modalComponent, {
          visible: true,
          ...props,
          'onUpdate:visible': () => {
            nextTick(() => {
              close()
            })
          }
        })
    })
    // end

    render(vNode, container)
    getAppendToElement(options.appendTo).appendChild(container)

    function close() {
      render(null, container)
      container.parentNode?.removeChild(container)
    }
  }

  return showModal
}
```

可以看出我们的 showModal 核心实现几乎没有变化。改动的只有两点：

1. 把 showModal 放到了 useShowModal 这个组合式函数里面并且返回给使用者。目的是当使用者在组件内调用 useShowModal 的时候，可以通过 `getCurrentInstance` 获取当前组件实例，并把所有上级组件 provide 的数据全部取出来，添加到弹窗组件的实例上。
2. 使用 `createVNode` 创建虚拟节点，这样可以在 setup 函数中获取到弹窗组件实例，就可以添加上级组件 provide 的数据了。

这样不管是在根组件 App.vue 里 provide 的数据，还是父组件 provide 的数据（只要是上级组件都可以），弹窗内部统统都能拿到，解决了弹窗脱离组件树引起的数据丢失问题。

## 实现插槽 ##

这个很好解决，因为在 vue 中，我们在 template 里写的插槽，最终都会被编译成一个个函数。刚好 h 函数的第三个参数是可以接收插槽函数的。

```js
// 完整参数签名
function h(
  type: string | Component,
  props?: object | null,
  children?: Children | Slot | Slots
): VNode

// 省略 props
function h(type: string | Component, children?: Children | Slot): VNode

type Children = string | number | boolean | VNode | null | Children[]

type Slot = () => Children

type Slots = { [name: string]: Slot }
```

那我们只需要给我们的 showModal 函数再添加一个 slots 参数即可。

```js
import { defineAsyncComponent, getCurrentInstance, h, nextTick, render, createVNode } from 'vue'
import type { Component } from 'vue'

// 新增
type RawSlots = {
  [name: string]: unknown
  $stable?: boolean
}
interface IModalOptions {
  modalComponent: Component | any
  appendTo?: HTMLElement | string
  slots?: RawSlots  // 新增
  [name: string]: unknown
}

export default function useShowModal() {
  // ...
  const vNode = createVNode({
      setup() {
        const instance = getCurrentInstance() as any
        if (instance) {
          instance.provides = { ...instance.provides, ...provides }
        }
      },
      render: () =>
        h(
          modalComponent,
          {
            visible: true,
            ...props,
            'onUpdate:visible': () => {
              nextTick(() => {
                close()
              })
            }
          },
          options.slots // 新增
        )
    })
  // ...
}
```

使用的时候直接传入插槽函数：

```js
<template>
  <a-modal v-model:open="bindVisible" :title="title" @ok="handleOk">
    <div>父组件传入的 prop：{{ prop }}</div>
    <!-- 注入的数据 -->
    <div>父组件 provide 的信息：{{ message }}</div>
    <div>App根组件 provide 的信息：{{ appMessage }}</div>
    <!-- 插槽 -->
    <slot v-bind="{ type: '默认插槽' }"></slot>
    <slot name="footer" v-bind="{ type: '具名插槽' }"></slot>
  </a-modal>
</template>
<script setup lang="ts">
import { inject } from 'vue'
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  visible: boolean
  title: string
  prop: string
}>()

const emit = defineEmits(['update:visible', 'loadList'])
const bindVisible = useVModel(props, 'visible', emit)
const message = inject('message')
const appMessage = inject('appMessage')

const handleOk = () => {
  // 假装请求业务接口...
  bindVisible.value = false
  emit('loadList')
}
</script>
```

```js
// 使用
 showModal2({
    modalComponent: () => import('@/pages/home/components/modal.vue'),
    title: '弹窗标题',
    prop: '弹窗组件需要的参数',
    slots: {
      default: (arg: any) => h('button', arg.type), // 默认插槽
      footer: (arg: any) => h('button', arg.type)  // 具名插槽
    },
    onLoadList: () => message.success('表单已经提交，刷新列表')
  })
```

效果：

## 暴露方法 ##

这里暴露方法的方式其实与平时我们在vue组件中实现原理方式一样，都是给组件绑定 ref，然后通过 ref 拿到组件实例进而操作组件暴露的方法，来看一下具体实现：

```js
// ...
export default function useShowModal() {
  function showModal(options: IModalOptions) {
    // ...
    const isAsync = typeof options.modalComponent === 'function'
    const innerRef = ref()  // 新增

    const vNode = createVNode({
      // ...
      render: () =>
        h(
          modalComponent,
          {
            visible: true,
            ...props,
            ref: innerRef,  // 新增
            'onUpdate:visible': () => {
              nextTick(() => {
                close()
              })
            }
          },
          options.slots
        )
    })

    // 新增
    if (!isAsync) {
      return innerRef.value
    } else {
      return new Promise((resolve) => {
        watch(
          innerRef,
          () => {
            resolve(innerRef.value)
          },
          {
            once: true
          }
        )
      })
    }
  }
  return showModal
}
```

这里我区分了两种情况：

1. 异步组件：h 函数创建虚拟节点时，如果是动态导入的组件，ref 的绑定是异步的（挂载需要时间），没法同步地获取组件实例，所以需要监听 ref 值的变化，当值发生变化时就是代表挂载完毕了，这个时候再 resolve 结果。
2. 同步组件：直接返回组件实例。

使用方式：

- 如果你传入的组件是异步加载函数，请通过 await 去获取异步组件实例。
- 如果同步组件，直接接收组件实例即可。

```js
const Modal = await showModal({
    modalComponent: () => import('@/pages/home/components/modal.vue'),
    title: '弹窗标题',
    prop: '弹窗组件需要的参数',
    slots: {
      default: (arg: any) => h('button', arg.type),
      footer: (arg: any) => h('button', arg.type)
    },
    onLoadList: () => message.success('表单已经提交，刷新列表')
  })
Modal.getInfo()
```

## 总结 ##

最终，我们实现了一个宇宙最强级别函数式弹窗组件的方法，它适应绝大多数使用场景：

- 支持懒加载（异步加载函数）
- props传参
- 事件绑定
- provide inject 注入数据
- 各种自定义插槽
- 暴露内部方法

## 源码 ##

### modal.vue ###

```js
<template>
  <a-modal v-model:open="bindVisible" :title="title" @ok="handleOk">
    <div>父组件传入的 prop：{{ prop }}</div>
    <div>父组件 provide 的信息：{{ message }}</div>
    <div>App根组件 provide 的信息：{{ appMessage }}</div>
    <slot v-bind="{ type: '默认插槽' }"></slot>
    <slot name="footer" v-bind="{ type: '具名插槽' }"></slot>
  </a-modal>
</template>
<script setup lang="ts">
import { inject } from 'vue'
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  visible: boolean
  title: string
  prop: string
}>()

const emit = defineEmits(['update:visible', 'loadList'])
const bindVisible = useVModel(props, 'visible', emit)
const message = inject('message')
const appMessage = inject('appMessage')

const handleOk = () => {
  // 假装请求业务接口...
  bindVisible.value = false
  emit('loadList')
}

defineExpose({
  getInfo() {
    return {
      message,
      appMessage
    }
  }
})
</script>
```

### index.vue ###

```js
<template>
  <div>
    <a-button type="primary" @click="onClick">弹窗</a-button>
  </div>
</template>
<script setup lang="ts">
import { provide, h } from 'vue'
import { message } from 'ant-design-vue'
import useShowModal from '@/utils/useShowModal'

provide('message', '我是父组件home页面')
const showModal = useShowModal()
const onClick = async () => {
  const Modal = await showModal({
    modalComponent: () => import('@/pages/home/components/modal.vue'),
    title: '弹窗标题',
    prop: '弹窗组件需要的参数',
    slots: {
      default: (arg: any) => h('button', arg.type),
      footer: (arg: any) => h('button', arg.type)
    },
    onLoadList: () => message.success('表单已经提交，刷新列表')
  })
  console.log(Modal.getInfo())
}
</script>
```

### useShowModal.ts ###

```js
import {
  defineAsyncComponent,
  getCurrentInstance,
  h,
  nextTick,
  render,
  createVNode,
  ref,
  watch
} from 'vue'
import type { Component } from 'vue'

type RawSlots = {
  [name: string]: unknown
  $stable?: boolean
}
interface IModalOptions {
  modalComponent: Component | any
  appendTo?: HTMLElement | string
  slots?: RawSlots
  [name: string]: unknown
}

const getAppendToElement = (appendTo: IModalOptions['appendTo']): HTMLElement => {
  let appendToEL: HTMLElement | null = document.body
  if (appendTo) {
    if (typeof appendTo === 'string') {
      appendToEL = document.querySelector<HTMLElement>(appendTo)
    }
    if (appendTo instanceof HTMLElement) {
      appendToEL = appendTo
    }
    if (!(appendToEL instanceof HTMLElement)) {
      appendToEL = document.body
    }
  }
  return appendToEL
}

function getProvides(instance: any) {
  let provides = instance?.provides || {}
  if (instance.parent) {
    provides = { ...provides, ...getProvides(instance.parent) }
  }
  return provides
}

export default function useShowModal() {
  const currentInstance = getCurrentInstance() as any
  const provides = getProvides(currentInstance)

  function showModal(options: IModalOptions) {
    const container = document.createElement('div')
    const isAsync = typeof options.modalComponent === 'function'
    const innerRef = ref()

    const modalComponent = isAsync
      ? defineAsyncComponent(options.modalComponent)
      : options.modalComponent

    const props: Record<string, any> = {}
    for (const key in options) {
      if (!['modalComponent', 'appendTo', 'slots'].includes(key)) props[key] = options[key]
    }

    const vNode = createVNode({
      setup() {
        const instance = getCurrentInstance() as any
        if (instance) {
          instance.provides = { ...instance.provides, ...provides }
        }
      },
      render: () =>
        h(
          modalComponent,
          {
            visible: true,
            ...props,
            ref: innerRef,
            'onUpdate:visible': () => {
              nextTick(() => {
                close()
              })
            }
          },
          options.slots
        )
    })

    render(vNode, container)
    getAppendToElement(options.appendTo).appendChild(container)

    function close() {
      render(null, container)
      container.parentNode?.removeChild(container)
    }

    if (!isAsync) {
      return innerRef.value
    } else {
      return new Promise((resolve) => {
        watch(
          innerRef,
          () => {
            resolve(innerRef.value)
          },
          {
            once: true
          }
        )
      })
    }
  }

  return showModal
}
```
