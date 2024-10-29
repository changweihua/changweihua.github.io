---
lastUpdated: true
commentabled: true
recommended: false
title: 小妙招——dispatchEvent自定义事件
description: 小妙招——dispatchEvent自定义事件
date: 2024-01
---


# 小妙招——dispatchEvent自定义事件 #


`dispatchEvent`大家可能接触过，同步派发一个事件，在异步事件之后进行执行。

此处以一个代码片段为例，简单说明一下使用。

```js
<button id="btn">按下按钮</button>
const myBtn = document.querySelector('#btn');
myBtn & myBtn.addEventListener('click', function(){
    document.dispatchEvent(new CustomEvent('clickAfter', {
        detail: {
            more: 'more-info',
            anyKey: 'any key info'
        }
    }))
})
document.addEventListener('clickAfter', (event) => {
    console.log('event', event)
})
```

**点击之后的截图如下**

![alt text](/images/cmono-20241029090538.png)

之前在做一个功能（Vue3）的时候，产品忽然想要加一个点击上报。但是因为功能比较复杂，当时拆了好几个组件进行嵌套，关系如下，组件有些数据传递是爷孙之间互传。

![alt text](/images/cmono-20241029090458.png)

## 实现组件A和组件C之间的通信 ##

### 多次emit() ###

通过emit一层层传递，A先emit()到B，再emit()到C。

**组件A- componentA**

```vue
<template>
<button @click="onClickAfter">按下点击</button>
</template>
<script lang="ts" setup>
const emit = defineEmits(['onClickAfter'])
const onClickAfter = () => {
 emit('onClickAfter', 12, {p1:12, p2:'click'})
}
</script>
```

**组件B-componentB**

```vue
<template>
<ComponentA @on-click-after="continueTransfer"></ComponentA>
</template>
<script lang="ts" setup>
const emit = defineEmits(['onToNext'])
const continueTransfer = (firstParams, other) => {
 emit('onToNext', firstParams, other)
}
</script>
```

**组件C-componentC**

```vue
<template>
<ComponentB @on-to-next="finalReport"></ComponentB>
</template>
<script lang="ts" setup>
const finalReport = (firstParams, other) => {
 console.log('report', firstParams, other)
}
</script>
```

### dispatchEvent ###

在A中进行一个`dispatchEvent`，自定一个事件（`new CustomEvent`）,然后在C中进行监听刚刚自定义的事件即可。

**组件A- componentA**

```vue
<template>
<button @click="onClickAfter">按下点击</button>
</template>
<script lang="ts" setup>
const onClickAfter = () => {
    document.dispatchEvent(new CustomEvent('clickAfter', {
        detail: {
            activiyId: 12,
            params: {p1:12, p2:'click'}
        }
    }))
}
</script>
```

**组件C- componentC**

```vue
<script lang="ts" setup>
onMounted(()=>{
    document.addEventListener('clickAfter', (event) => {
        console.log('event', event)
    })
})
</script>
```

> 如果是一个简单的事件，其实完全可以直接使用dispatchEvent，避免了一层层父子通信的麻烦～～～
