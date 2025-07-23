---
lastUpdated: true
commentabled: true
recommended: true
title: onWatcherCleanup、getCurrentWatcher函数封装请求函数
description: onWatcherCleanup、getCurrentWatcher函数封装请求函数
date: 2025-07-23 14:25:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## AbortController的基本使用 ##

### AbortController的简介 ###

- `AbortController` 是一种用于管理和控制 Web API 中异步操作（如 fetch 请求）的取消操作的机制。它在处理异步操作时提供了一种方法来中止未完成的请求或操作。
- `AbortController` 是一个浏览器原生对象，它允许你创建和控制一个或多个异步操作的取消信号。通过与 `AbortSignal` 结合使用，可以在适当的时机中止这些操作。

### AbortController 的组成部分 ###

- `AbortController`对象：用来创建和控制取消操作。
- `AbortSignal`对象：由 `AbortController` 生成，用来向异步操作传递取消信号。

### 创建AbortController的实例 ###

```ts
const controller = new AbortController()
```

- 在如上代码中，`controller` 是 `AbortController` 的实例。你可以使用它来生成一个信号，传递给支持取消操作的 API（如 fetch），并在适当的时候通过 `abort()` 方法取消这些操作。
- `new AbortController()` ：创建一个新的 `AbortController` 实例。
- `controller`：是创建的 `AbortController` 实例，它包含一个 `signal` 属性和一个 `abort()` 方法。

### AbortController 的基本使用 ###

```js
const controller = new AbortController(); // 创建一个新的 AbortController 实例
const signal = controller.signal; // 获取该实例的 signal

// 发起一个带有信号的 fetch 请求

fetch('https://api.example.com/data', { signal }).then(response => 
    response.json()
).then(data => 
    console.log(data)
).catch(err => { 
    if (err.name === 'AbortError') { 
    console.log('请求已被中止'); 
} else { 
    console.error('请求失败:', err); 
  } 
}); 
// 在某个条件下中止请求 
controller.abort(); // 调用 abort() 方法，中止请求
```

### AbortController 的重要方法和属性 ##

#### controller.signal ####

- 这是一个 AbortSignal 对象，它与异步操作关联，传递给像 fetch 这样的支持中止的 API。
- 你需要将这个 signal 传递给异步操作，以便在后续通过 AbortController 中止该操作。

#### controller.abort() ####

- 通过调用 `abort()` 方法，可以触发与该 signal 关联的异步操作的中止。对于 fetch 请求来说，这意味着请求将被中止，并抛出一个 AbortError。

### 使用场景 ###

- **取消请求**：在用户离开页面、导航到新页面、或在短时间内多次发起请求时，避免处理不必要的响应。
- **超时机制**：如果一个请求持续时间过长，可以设置一个超时机制，在超时后中止请求。

## vue3.5新特性+AbortController(Web Api)封装请求函数 ##

> 使用 Vue 3.5 中新增的 onWatcherCleanup 和 getCurrentWatcher 函数，你可以封装一个可以在 watch 中安全使用的 fetch 函数。 该函数会在执行 watch 的回调函数之前取消之前的请求。

```ts:myFetch.ts
import { onWatcherCleanup, getCurrentWatcher } from 'vue'

export function myFetch(url: string, options: RequestInit) {
    // 创建一个新的 AbortController 实例
    const controller = new AbortController() 
    // 获取该实例的 signal
    const signal = controller.signal
    
    if(getCurrentWatcher()) {
        onWatcherCleanup(() => {
            controller.abort()
        })
    }
    
    return fetch(url, { ...options, signal })
}
```

<br />

```vue:Comp.vue
<script setup>
    watch(id, (newId) => {
        myFetch(`/api/${newId}`).then((response) => {
            // callback logic
        })
    })
</script>
```

> 下面细说 `onWatcherCleanup` 副作用清理API所带来的作用和具体用法。

## 什么场景需要副作用清理？ ##

作为一名用Vue开发的程序员，watch算是必不可少的，但Vue3.5之前其实有缺陷的，特别是处理异步时。

如下所示，有时候我们会在watch中进行接口请求之类的异步操作，但如果userId在请求完成之前发生了更改怎么办？这时会使用已经过期的userId进行接口请求，因为接口请求已经在进行中，从而导致异常。

```vue
<script setup>
  import { watch, onWatcherCleanup } from 'vue';
  watch(id, (userId) => {
    fetch(`/api/user/${userId}`).then(() => {
	  
    })
  })
</script>
```

## 用onWatcherCleanup进行副作用清理 ##

> **作用简述**： onWatcherCleanup就是专门用来解决上述例子或者相似的业务场景，即在userId更改为新值时取消过时的请求。如下所示

```vue
<script setup>
import { watch, onWatcherCleanup } from 'vue'

watch(id, (userId) => {
  const contr = new AbortController()

  fetch(`/api/user/${userId}`, { signal: contr.signal }).then(() => {
    
  })

  onWatcherCleanup(() => {
    contr.abort()
  })
})
</script>
```

**注意**： 留意第五行代码，要尽量放在最前面，一定不能异步函数中的语句之后调用它。但如果你想不受同步异步约束，可以用以下方法。

## 不受同步约束的用法 ##

上面的用法容易有容易有异步问题 ，官方其实有提供更简洁并且能兼顾异步的用法。

如下所示，把 `onCleanup` 函数作为第三个参数传递回调，如下所示

```vue
<script setup>
import { watch } from 'vue'

watch(id, (newId, oldId, onCleanup) => {
   onCleanup(() => {
        // 清理器
   })
  })
</script>
```

但如果使用 `watchEffect` 时单独传入一个 `onCleanup` 即可，如下所示

```vue
<script setup>
import { watchEffect } from 'vue'

watchEffect((onCleanup) => {
      onCleanup(() => {
            // 清理器
      })
  })
</script>
```

由于 `onCleanup` 通过函数传递的参数与观察者实例绑定在一起，所以它不受同步约束，因此更推荐这种用法。
