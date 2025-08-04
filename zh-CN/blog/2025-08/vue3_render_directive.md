---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 项目在render函数中使用自定义指令
description: Vue3 项目在render函数中使用自定义指令
date: 2025-08-04 10:05:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 一、定义自定义指令 ##

```ts:directives/inputQuantity.ts
const inputQuantity = {
  mounted(el, binding) {
    el.addEventListener('input', (e) => {
      // 验证输入值
      const value = e.target.value
      const min = binding.value?.min || 0
      const max = binding.value?.max || Infinity
      
      if (/^\d*$/.test(value)) {
        let numValue = parseInt(value) || min
        
        // 限制范围
        if (numValue < min) numValue = min
        if (numValue > max) numValue = max
        
        // 更新模型值
        binding.instance[numValue] = numValue
        el.value = numValue
      } else {
        el.value = binding.value?.lastValid || min
      }
      
      binding.value.lastValid = el.value
    })
  }
}

export default inputQuantity
```

## 二、注册指令 ##

### 全局注册（`main.ts`）###

```ts
import { createApp } from 'vue'
import inputQuantity from './directives/inputQuantity'

const app = createApp(App)
app.directive('input-quantity', inputQuantity)
```

### 组件内注册 ###

```ts
import inputQuantity from './directives/inputQuantity'

export default {
  directives: {
    'input-quantity': inputQuantity
  },
  // ...
}
```

## 三、在 render 函数中使用自定义指令 ##

在 render 函数中使用指令需要用到vue的两个内部函数 `resolveDirective` 和 `withDirectives`;

- `resolveDirective` 用于解析指令；
- `withDirectives` 函数把指令注册对应的VNode对象上

```ts
import { h, withDirectives, resolveDirective } from 'vue'

export default {
  render() {
    // 解析自定义指令
    const vInputQuantity = resolveDirective('input-quantity')
    
    // 创建基础 input 节点
    const inputNode = h('input', {
      type: 'number',
      value: this.quantity,
      class: 'quantity-input'
    })
    
    // 应用自定义指令
    return withDirectives(inputNode, [
      [
        vInputQuantity, 
        { 
          min: 1, 
          max: 100,
          lastValid: 1
        }
      ],
      // 可同时添加其他指令
      ```
      [resolveDirective('focus'), { autoFocus: true }]
    ])
  }
}
```
