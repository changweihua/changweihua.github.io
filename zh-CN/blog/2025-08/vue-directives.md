---
lastUpdated: true
commentabled: true
recommended: true
title: 总结7个实用的Vue自定义指令
description: 总结7个实用的Vue自定义指令
date: 2025-08-04 13:45:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 一、前言 ##

- Vue自定义指令有全局注册和局部注册两种方式。
- 本篇局部自定义指令不做叙述

### 全局自定义指令批量定义注册调用 ###

注册全局指令的方式，通过 `Vue.directive( id, [definition] )` 方式注册全局指令。然后在入口文件中进行 `Vue.use()` 调用。


### 定义全局自定义指令 ###

通过输入内容，逻辑控制dom背景色变动

定义自定义指令文件 `highlight.js`

```js
//highlight.js
export default {
  updated(el, binding) {
   if(!binding.value) {
    el.style.backgroundColor = '#fff';
   }
   else {
    if(binding.value < 10) {
     el.style.backgroundColor = 'aqua';
    }
    else if(binding.value > 10 && binding.value < 21) {
     el.style.backgroundColor = 'pink';
    }
    else {
     el.style.backgroundColor = 'greenyellow';
    }
   }
  }
};
```

### 注册全局自定义指令 ###

新建 `directives/index.js` 文件，批量注册自定义指令

```js
// directives/index.js
import Highlight from './directive-muster/highlight'  //导入自定义指令
const directives = {  //汇总自定义指令
  // 此处可进行多个指令
  Highlight//文本高亮指令
}
export default {  //导出自定义指令
  install(app) {// 以安装的方式插到app中
   Object.keys(directives).forEach((key) => {    // 遍历directives对象的key
    app.directive(key, directives[key])  // 将每个directive注册到app中
   })
  }
}
```

### 引入并调用全局自定义指令 ###

在 `main.js` 引入并调用

```js
import { createApp } from 'vue';
import App from './App.vue';
import Directives from '@/utils/directives/index';
const app = createApp(App);
app.use(Directives).mount('#app');
```

### 使用自定义指令 ###

```vue
<template>
  <input type="number" v-model="inpValue">
  <div v-Highlight="inpValue">https://juejin.cn/user/84036866547575</div>
</template>
<script setup>
import { ref } from 'vue';
const inpValue = ref(0);
// window.location.href = 'https://juejin.cn/user/84036866547575';
</script>
```

## 二、自定义指令钩子函数及参数 ##

### 钩子函数相关 ###

```ts
// 在绑定元素的 attribute 前或事件监听器应用前调用
  created(el, binding, vnode) {},
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode) {},
  // 在绑定元素的父组件及他自己的所有子节点都挂载完成后调用
  mounted(el, binding, vnode) {},
  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件及他自己的所有子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode) {},
  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode) {}
```

### 钩子函数参数相关 ###

- **bind**: 只调用一次，*指令第一次绑定到元素时调用*，可以定义一个在绑定时执行一次的初始化动作。
- **inserted**: *被绑定元素插入父节点时调用*（父节点存在即可调用，不必存在于 document 中）。
- **update**: *被绑定元素所在的模板更新时调用*，而不论绑定值是否变化。通过比较更新前后的绑定值。
- **componentUpdated**: *被绑定元素所在模板完成一次更新周期时调用*。
- **unbind**: 只调用一次， *指令与元素解绑时调用*。

## 三、7个实用的Vue自定义指令 ##

### 总结目录如下 ###

- 复制粘贴指令 `v-copy`
- 长按指令 `v-longpress`
- 输入框防抖指令 `v-debounce`
- 图片懒加载 `v-LazyLoad`
- 权限校验指令 `v-premission`
- 实现页面水印 `v-waterMarker`
- 拖拽指令 `v-draggable`

### v-copy（复制粘贴） ###

#### v-copy实现方式 ####

- 实现一键复制文本内容，用于鼠标右键粘贴。
- 动态创建 `textarea` 标签，并设置 `readOnly` 属性及移出可视区域
- 将要复制的值赋给 `textarea` 标签的 `value` 属性，并插入到 `body`
- 将 `body` 中插入的 `textarea` 移除
- 在第一次调用时绑定事件，在解绑时移除事件

```ts
const copy = {
  bind(el, { value }) {
    el.$value = value
    el.handler = () => {
      if (!el.$value) {
        // 值为空的时候，给出提示。可根据项目UI仔细设计
        console.log('无复制内容')
        return
      }
      // 动态创建 textarea 标签
      const textarea = document.createElement('textarea')
      // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
      textarea.readOnly = 'readonly'
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      // 将要 copy 的值赋给 textarea 标签的 value 属性
      textarea.value = el.$value
      // 将 textarea 插入到 body 中
      document.body.appendChild(textarea)
      // 选中值并复制
      textarea.select()
      const result = document.execCommand('Copy')
      if (result) {
        console.log('复制成功') // 可根据项目UI仔细设计
      }
      document.body.removeChild(textarea)
    }
    // 绑定点击事件，就是所谓的一键 copy 啦
    el.addEventListener('click', el.handler)
  },
  // 当传进来的值更新的时候触发
  componentUpdated(el, { value }) {
    el.$value = value
  },
  // 指令与元素解绑的时候，移除事件绑定
  unbind(el) {
    el.removeEventListener('click', el.handler)
  },
}
 
export default copy
```

#### v-copy使用方法 ####

- 给 `DOM` 加上 `v-copy` 及复制的文本即可

```vue
<template>
  <button v-copy="copyText">复制</button>
</template>
 
<script> 
export default {
    data() {
      return {
        copyText: 'a copy directives',
      }
    },
  } 
</script>
```

### v-longpress（长按事件） ###

#### v-longpress实现方式 ####

- 实现长按，用户需要按下并按住按钮几秒钟，触发相应的事件
- 创建一个计时器， 2 秒后执行函数
- 当用户按下按钮时触发 `mousedown` 事件，启动计时器；用户松开按钮时调用 `mouseout` 事件。
- 如果 `mouseup` 事件 2 秒内被触发，就清除计时器，当作一个普通的点击事件
- 如果计时器没有在 2 秒内清除，则判定为一次长按，可以执行关联的函数。
- 在移动端要考虑 `touchstart`，`touchend` 事件

```ts
const longpress = {
  bind: function (el, binding, vNode) {
    if (typeof binding.value !== 'function') {
      throw 'callback must be a function'
    }
    // 定义变量
    let pressTimer = null
    // 创建计时器（ 2秒后执行函数 ）
    let start = (e) => {
      if (e.type === 'click' && e.button !== 0) {
        return
      }
      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          handler()
        }, 2000)
      }
    }
    // 取消计时器
    let cancel = (e) => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer)
        pressTimer = null
      }
    }
    // 运行函数
    const handler = (e) => {
      binding.value(e)
    }
    // 添加事件监听器
    el.addEventListener('mousedown', start)
    el.addEventListener('touchstart', start)
    // 取消计时器
    el.addEventListener('click', cancel)
    el.addEventListener('mouseout', cancel)
    el.addEventListener('touchend', cancel)
    el.addEventListener('touchcancel', cancel)
  },
  // 当传进来的值更新的时候触发
  componentUpdated(el, { value }) {
    el.$value = value
  },
  // 指令与元素解绑的时候，移除事件绑定
  unbind(el) {
    el.removeEventListener('click', el.handler)
  },
}
 
export default longpress
```

#### v-longpress使用方式 ####

给 `DOM` 加上 `v-longpress` 及回调函数即可

```vue
<template>
  <button v-longpress="longpress">长按</button>
</template>
 
<script> 
export default {
  methods: {
    longpress () {
      alert('长按指令生效')
    }
  }
}
</script>
```

### v-debounce（防抖） ###

#### v-debounce实现方式 ####

- 防止按钮在短时间内被多次点击，使用防抖函数限制规定时间内只能点击一次。
- 定义一个延迟执行的方法，如果在延迟时间内再调用该方法，则重新计算执行时间。
- 将时间绑定在 click 方法上。

```ts
const debounce = {
  inserted: function (el, binding) {
    let timer
    el.addEventListener('keyup', () => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        binding.value()
      }, 1000)
    })
  },
}
 
export default debounce
```

#### v-debounce使用方法 ####

- 给 `DOM` 加上 `v-debounce` 及回调函数即可

```vue
<template>
  <button v-debounce="debounceClick">防抖</button>
</template>
 
<script>
export default {
  methods: {
    debounceClick () {
      console.log('只触发一次')
    }
  }
}
</script>
```

### v-LazyLoad（懒加载） ###

#### v-LazyLoad实现方式 ####

- 实现一个图片懒加载指令，只加载浏览器可见区域的图片。
- 图片懒加载的原理主要是判断当前图片是否到了可视区域这一核心逻辑实现的
- 拿到所有的图片 DOM ，遍历每个图片判断当前图片是否到了可视区范围内
- 如果到了就设置图片的 `src` 属性，否则显示默认图片

图片懒加载有两种方式可以实现，一是绑定 `srcoll` 事件进行监听，二是使用 `IntersectionObserver` 判断图片是否到了可视区域，但是有浏览器兼容性问题。

下面封装一个懒加载指令兼容两种方法，判断浏览器是否支持 `IntersectionObserver` API，如果支持就使用 `IntersectionObserver` 实现懒加载，否则则使用 `srcoll` 事件监听 + 节流的方法实现。

```ts
const LazyLoad = {
  // install方法
  install(Vue, options) {
    const defaultSrc = options.default
    Vue.directive('lazy', {
      bind(el, binding) {
        LazyLoad.init(el, binding.value, defaultSrc)
      },
      inserted(el) {
        if (IntersectionObserver) {
          LazyLoad.observe(el)
        } else {
          LazyLoad.listenerScroll(el)
        }
      },
    })
  },
  // 初始化
  init(el, val, def) {
    el.setAttribute('data-src', val)
    el.setAttribute('src', def)
  },
  // 利用IntersectionObserver监听el
  observe(el) {
    var io = new IntersectionObserver((entries) => {
      const realSrc = el.dataset.src
      if (entries[0].isIntersecting) {
        if (realSrc) {
          el.src = realSrc
          el.removeAttribute('data-src')
        }
      }
    })
    io.observe(el)
  },
  // 监听scroll事件
  listenerScroll(el) {
    const handler = LazyLoad.throttle(LazyLoad.load, 300)
    LazyLoad.load(el)
    window.addEventListener('scroll', () => {
      handler(el)
    })
  },
  // 加载真实图片
  load(el) {
    const windowHeight = document.documentElement.clientHeight
    const elTop = el.getBoundingClientRect().top
    const elBtm = el.getBoundingClientRect().bottom
    const realSrc = el.dataset.src
    if (elTop - windowHeight < 0 && elBtm > 0) {
      if (realSrc) {
        el.src = realSrc
        el.removeAttribute('data-src')
      }
    }
  },
  // 节流
  throttle(fn, delay) {
    let timer
    let prevTime
    return function (...args) {
      const currTime = Date.now()
      const context = this
      if (!prevTime) prevTime = currTime
      clearTimeout(timer)
 
      if (currTime - prevTime > delay) {
        prevTime = currTime
        fn.apply(context, args)
        clearTimeout(timer)
        return
      }
 
      timer = setTimeout(function () {
        prevTime = Date.now()
        timer = null
        fn.apply(context, args)
      }, delay)
    }
  },
}
 
export default LazyLoad
```

#### v-LazyLoad使用方法 ####

- 将组件内标签的 `src` 换成 `v-LazyLoad`

```vue
<img v-LazyLoad="xxx.jpg" />
```

### v-permission（权限） ###

#### v-permission实现方式 ####

- 自定义一个权限指令，对需要权限判断的 Dom 进行显示隐藏。
- 自定义一个权限数组
- 判断用户的权限是否在这个数组内，如果是则显示，否则则移除 Dom

```ts
function checkArray(key) {
  let arr = ['1', '2', '3', '4']
  let index = arr.indexOf(key)
  if (index > -1) {
    return true // 有权限
  } else {
    return false // 无权限
  }
}
 
const permission = {
  inserted: function (el, binding) {
    let permission = binding.value // 获取到 v-permission的值
    if (permission) {
      let hasPermission = checkArray(permission)
      if (!hasPermission) {
        // 没有权限 移除Dom元素
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  },
}
 
export default permission
```

#### v-permission使用方法 ####

- 给 `v-permission` 赋值判断即可

```vue
<div class="btns">
  <!-- 显示 -->
  <button v-permission="'1'">权限按钮1</button>
  <!-- 不显示 -->
  <button v-permission="'10'">权限按钮2</button>
</div>
```

### vue-waterMarker（水印） ###

#### vue-waterMarker实现方式 ####

- 使用 `canvas` 特性生成 `base64` 格式的图片文件，设置其字体大小，颜色等。
- 将其设置为背景图片，从而实现页面或组件水印效果

```ts
function addWaterMarker(str, parentNode, font, textColor) {
  // 水印文字，父元素，字体，文字颜色
  var can = document.createElement('canvas')
  parentNode.appendChild(can)
  can.width = 200
  can.height = 150
  can.style.display = 'none'
  var cans = can.getContext('2d')
  cans.rotate((-20 * Math.PI) / 180)
  cans.font = font || '16px Microsoft JhengHei'
  cans.fillStyle = textColor || 'rgba(180, 180, 180, 0.3)'
  cans.textAlign = 'left'
  cans.textBaseline = 'Middle'
  cans.fillText(str, can.width / 10, can.height / 2)
  parentNode.style.backgroundImage = 'url(' + can.toDataURL('image/png') + ')'
}
 
const waterMarker = {
  bind: function (el, binding) {
    addWaterMarker(binding.value.text, el, binding.value.font, binding.value.textColor)
  },
}
 
export default waterMarker
```

#### vue-waterMarker使用方法 ####

- 设置水印文案，颜色，字体大小即可

```vue
<template>
  <div v-waterMarker="{text:'lzg版权所有',textColor:'rgba(180, 180, 180, 0.4)'}"></div>
</template>
```

### v-draggable（拖拽） ###

#### v-draggable实现方式 ####

- 设置需要拖拽的元素为相对定位，其父元素为绝对定位。
- 鼠标按下(`onmousedown`)时记录目标元素当前的 `left` 和 `top` 值。
- 鼠标移动(`onmousemove`)时计算每次移动的横向距离和纵向距离的变化值，并改变元素的 `left` 和 `top` 值
- 鼠标松开(`onmouseup`)时完成一次拖拽

```ts
const draggable = {
  inserted: function (el) {
    el.style.cursor = 'move'
    el.onmousedown = function (e) {
      let disx = e.pageX - el.offsetLeft
      let disy = e.pageY - el.offsetTop
      document.onmousemove = function (e) {
        let x = e.pageX - disx
        let y = e.pageY - disy
        let maxX = document.body.clientWidth - parseInt(window.getComputedStyle(el).width)
        let maxY = document.body.clientHeight - parseInt(window.getComputedStyle(el).height)
        if (x < 0) {
          x = 0
        } else if (x > maxX) {
          x = maxX
        }
 
        if (y < 0) {
          y = 0
        } else if (y > maxY) {
          y = maxY
        }
 
        el.style.left = x + 'px'
        el.style.top = y + 'px'
      }
      document.onmouseup = function () {
        document.onmousemove = document.onmouseup = null
      }
    }
  },
}
export default draggable
```

#### v-draggable使用方法 ####

- 在 Dom 上加上 `v-draggable` 即可

```vue
<template>
  <div class="el-dialog" v-draggable></div>
</template>
```
