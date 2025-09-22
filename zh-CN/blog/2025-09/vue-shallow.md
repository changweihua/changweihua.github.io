---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 响应式进阶
description: shallowRef与shallowReactive深度解析及10个实战案例
date: 2025-09-22 13:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

在Vue3响应式系统中，`shallowRef` 与 `shallowReactive` 是 *浅层响应式API*，它们仅对数据的“顶层属性”建立响应式关联，不处理深层嵌套数据的代理。这种特性使其在性能优化场景（如大数据列表、复杂嵌套对象）中发挥关键作用，但也需注意与 `ref`/`reactive` 的差异，避免响应式失效。本文将从原理切入，结合10个进阶案例，带你掌握这两个API的实战技巧。

## 一、核心概念与原理辨析 ##

### shallowReactive：浅层对象响应式 ###

- **定义**：仅对引用类型（Object/Array）的*顶层属性*创建响应式代理，深层属性仍为原始值（不触发Proxy代理）。
- **原理**：基于 `Proxy` 实现，但仅拦截顶层属性的 `get`/`set` 操作，深层属性访问时直接返回原始值，不递归创建代理。
- **关键特性**：
  - 修改*顶层属性*（如 `obj.key = 1`）触发响应式更新；
  - 修改*深层属性*（如 `obj.nested.key = 1`）不触发更新（无代理）；
  - 不支持基本类型（与 `reactive` 一致，传入基本类型静默失效）。

### shallowRef：浅层值类型响应式 ###

- **定义**：仅对 `value` 属性的*顶层引用*建立响应式，若 `value` 是引用类型，其深层属性不触发响应式。
- **原理**：通过 `Object.defineProperty` 监听 `value` 的顶层赋值，若 `value` 为引用类型，不将其转换为 `reactive` 代理（与 `ref` 核心区别）。
- **关键特性**：
  - 修改`value`的*顶层引用*（如 `ref.value = newObj`）触发更新；
  - 修改`value`的*深层属性*（如 `ref.value.nested.key = 1`）不触发更新；
  - 支持基本类型（与 `ref` 一致），且对基本类型的修改逻辑与 `ref` 完全相同（因基本类型无深层属性）。

### 进阶API与基础API对比表 ###

|  对比维度   |  shallowReactive  |  reactive  |  shallowRef  |  ref  |
| :-----------: | :-----------: | :-----------: | :-----------: | :-----------: |
| 响应式层级 | 仅顶层 | 深层（递归代理） | 仅 `value` 顶层引用 |深层（`value` 为引用时转 `reactive`） |
| 引用类型深层修改 | 不触发更新 | 触发更新 | 不触发更新 |触发更新 |
| 基本类型支持 | 不支持 | 不支持 | 支持（与 `ref` 一致） |支持 |
| 适用场景 | 大数据对象、仅改顶层 | 复杂嵌套对象、需深层响应 | 大数据引用、仅换顶层 |普通值类型、需深层响应 |
| 手动触发更新 | 无（需替换顶层） | 无需 | 需 `triggerRef` |无需 |

## 二、10个进阶实战案例解析 ##

以下案例均基于 `<script setup>` 语法，聚焦 `shallowRef`/`shallowReactive` 的核心场景（性能优化、明确层级控制），并标注关键差异点。

### 案例1：shallowReactive基础用法（仅顶层属性响应） ###

需求：处理简单用户信息，仅修改顶层属性（姓名/年龄），不涉及深层修改。

```vue
<template>
  <div>姓名：{{ user.name }}</div>
  <div>年龄：{{ user.age }}</div>
  <button @click="updateTopLevel">修改姓名（顶层）</button>
  <button @click="updateDeep">修改地址（深层）</button>
</template>

<script setup>
import { shallowReactive } from 'vue'

// 创建浅层响应式对象（顶层name/age代理，深层address不代理）
const user = shallowReactive({
  name: '张三',
  age: 24,
  address: { city: '北京', district: '朝阳' } // 深层属性无代理
})

// 1. 修改顶层属性：触发响应式更新
const updateTopLevel = () => {
  user.name = '李四' // 顶层属性，视图同步更新
}

// 2. 修改深层属性：不触发响应式（无代理）
const updateDeep = () => {
  user.address.city = '上海' // 深层属性，视图无变化（需手动刷新才显）
}
</script>
```

解析：`shallowReactive` 仅代理 `user.name`/`user.age`，`address`是原始对象，修改其属性不触发 `Proxy` 拦截，需避免“误以为深层生效”的坑。

### 案例2：shallowRef处理基本类型（与ref无差异） ###

需求：用 `shallowRef` 管理计数器（基本类型），验证其与 `ref` 的一致性。

```vue
<template>
  <div>计数：{{ count }}</div>
  <button @click="increment">+1</button>
</template>

<script setup>
import { shallowRef } from 'vue'

// shallowRef处理基本类型（与ref逻辑完全一致）
const count = shallowRef(0)

const increment = () => {
  count.value += 1 // 基本类型无深层，修改.value触发更新
}
</script>
```

解析：`shallowRef` 对基本类型的处理与 `ref` 完全相同，因基本类型无“深层属性”，仅需监听 `value` 的赋值，适合需统一API风格的场景。

### 案例3：shallowRef vs ref（引用类型深层差异） ###

需求：对比 `shallowRef` 与 `ref` 包裹对象时，深层修改的响应式差异。

```vue
<template>
  <div>ref商品：{{ refGoods.price }}</div>
  <div>shallowRef商品：{{ shallowGoods.price }}</div>
  <button @click="updateDeepPrice">修改两者深层价格</button>
</template>

<script setup>
import { ref, shallowRef } from 'vue'

// 1. ref包裹对象：内部转为reactive，深层修改生效
const refGoods = ref({ name: '手机', price: 5999 })

// 2. shallowRef包裹对象：仅顶层.value代理，深层price无代理
const shallowGoods = shallowRef({ name: '电脑', price: 8999 })

const updateDeepPrice = () => {
  refGoods.value.price -= 1000 // ref深层修改：视图更新（5999→4999）
  shallowGoods.value.price -= 1000 // shallowRef深层修改：视图无变化（仍8999）
}
</script>
```

核心差异：`ref` 会将包裹的对象转为 `reactive`（深层代理），而 `shallowRef` 仅保留对象的原始引用，深层修改不触发更新。

### 案例4：shallowReactive处理大数据列表（性能优化） ###

需求：渲染1000条商品数据，仅需修改商品的“选中状态”（顶层属性），避免深层代理开销。

```vue
<template>
  <div class="goods-list">
    <div v-for="(item, idx) in goodsList" :key="idx">
      {{ item.name }} - {{ item.price }}元
      <input 
        type="checkbox" 
        v-model="item.checked" 
        @change="handleCheck(idx)"
      >
    </div>
  </div>
</template>

<script setup>
import { shallowReactive } from 'vue'

// 模拟1000条大数据（仅顶层checked/name/price代理，深层属性无代理）
const generateBigList = () => {
  return Array(1000).fill(0).map((_, i) => ({
    id: i,
    name: `商品${i+1}`,
    price: 100 + i,
    checked: false, // 仅需修改的顶层属性
    details: { // 深层属性（无需代理，减少性能开销）
      brand: '品牌',
      specs: '规格'
    }
  }))
}

// 用shallowReactive：仅代理顶层属性，性能优于reactive（避免1000*N层代理）
const goodsList = shallowReactive(generateBigList())

const handleCheck = (idx) => {
  // 修改顶层checked属性：触发响应式，性能高效
  goodsList[idx].checked = !goodsList[idx].checked
}
</script>
```

性能优势：`reactive` 会递归代理每条商品的 `details`（1000个深层对象），而 `shallowReactive` 仅代理顶层，内存占用减少50%+，渲染速度提升明显。

### 案例5：shallowRef+triggerRef（手动触发深层更新） ###

需求：用 `shallowRef` 包裹复杂表单对象，需修改深层属性后手动触发更新（避免频繁代理）。

```vue
<template>
  <div>表单值：{{ form.username }} - {{ form.password }}</div>
  <button @click="updateDeepForm">修改深层表单值</button>
</template>

<script setup>
import { shallowRef, triggerRef } from 'vue'

// shallowRef包裹表单对象（深层属性无代理）
const form = shallowRef({
  username: 'admin',
  password: '123456'
})

const updateDeepForm = () => {
  // 1. 修改深层属性（无代理，不触发更新）
  form.value.username = 'newAdmin'
  form.value.password = '654321'

  // 2. 手动触发响应式更新（关键：shallowRef深层修改后需调用）
  triggerRef(form) // 强制视图更新，显示新值
}
</script>
```

关键API：`triggerRef` 是 `shallowRef` 的“配套工具”，用于手动触发响应式更新，适合“批量修改深层属性后统一刷新”的场景。

### 案例6：shallowReactive避免深层代理（嵌套数组优化） ###

需求：处理包含嵌套数组的订单列表，仅修改订单的“状态”（顶层），不修改数组内商品的深层属性。

```vue
<template>
  <div v-for="order in orderList" :key="order.id">
    订单{{ order.id }}：{{ order.status }}
    <button @click="updateOrderStatus(order.id)">改为已完成</button>
  </div>
</template>

<script setup>
import { shallowReactive } from 'vue'

// 嵌套数组场景：shallowReactive仅代理顶层order对象，不代理items数组
const orderList = shallowReactive([
  {
    id: 1,
    status: '待付款',
    items: [{ name: '商品A', num: 2 }] // 深层数组无代理
  },
  {
    id: 2,
    status: '待发货',
    items: [{ name: '商品B', num: 1 }]
  }
])

// 修改顶层status：触发响应式，无需代理items（减少开销）
const updateOrderStatus = (id) => {
  const order = orderList.find(o => o.id === id)
  if (order) order.status = '已完成' // 顶层属性，视图更新
}
</script>
```

解析：若用 `reactive`，会递归代理每个 `items` 数组的元素，而 `shallowReactive` 仅代理顶层 `order` 对象，适合“列表仅改顶层状态，深层数据只读”的场景。

### 案例7：shallowRef替换顶层引用（高效更新大数据） ###

需求：用 `shallowRef` 管理 `10000` 条表格数据，需整体替换数据（而非修改深层），提升更新性能。

```vue
<template>
  <table>
    <tr v-for="(item, idx) in tableData" :key="idx">
      <td>{{ item.id }}</td>
      <td>{{ item.content }}</td>
    </tr>
  </table>
  <button @click="replaceAllData">替换所有表格数据</button>
</template>

<script setup>
import { shallowRef } from 'vue'

// 模拟10000条大数据（shallowRef仅保存顶层引用）
const generateData = (size) => {
  return Array(size).fill(0).map((_, i) => ({
    id: i + 1,
    content: `数据${i + 1}`
  }))
}

const tableData = shallowRef(generateData(10000))

// 替换顶层引用：高效更新（仅修改.value，无需处理深层）
const replaceAllData = () => {
  // 直接替换.value的引用，触发响应式（比修改深层高效）
  tableData.value = generateData(10000) 
}
</script>
```

性能对比：若用 `ref`，替换 `value` 时会将新数组转为 `reactive`（10000个元素代理），而 `shallowRef` 直接保留原始数组引用，替换速度提升10倍以上。

### 案例8：shallowReactive与toRaw结合（获取原始对象） ###

需求：用 `shallowReactive` 管理配置对象，需临时修改深层属性（不触发更新），再基于原始对象重置。

```vue
<template>
  <div>主题：{{ config.theme }}</div>
  <div>字体大小：{{ config.font.size }}</div>
  <button @click="tempModifyDeep">临时修改字体大小（不更新）</button>
  <button @click="resetConfig">重置配置</button>
</template>

<script setup>
import { shallowReactive, toRaw } from 'vue'

// 1. 创建浅层响应式配置
const config = shallowReactive({
  theme: 'light',
  font: { size: 16, family: 'sans-serif' }
})

// 2. 获取原始对象（toRaw：跳过shallowReactive代理）
const rawConfig = toRaw(config)
const originalFontSize = rawConfig.font.size // 保存原始值

// 临时修改深层属性（操作原始对象，不触发更新）
const tempModifyDeep = () => {
  rawConfig.font.size = 20 // 操作原始对象，视图无变化
}

// 重置为原始值（基于原始对象，避免响应式干扰）
const resetConfig = () => {
  config.font.size = originalFontSize // 虽改深层，但重置后可通过顶层修改触发更新
  // 若需确保更新，可替换顶层：config.font = { ...config.font, size: originalFontSize }
}
</script>
```

关键API：`toRaw` 可获取 `shallowReactive` 的原始对象，适合“临时修改不触发更新”的场景，避免响应式代理干扰。

### 案例9：shallowRef处理DOM元素（避免深层代理） ###

需求：用 `shallowRef` 获取DOM元素（引用类型），仅需访问元素本身，无需代理其深层属性（如 `style`）。

```vue
<template>
  <div ref="container" class="box">我是容器</div>
  <button @click="changeStyle">修改背景色</button>
</template>

<script setup>
import { shallowRef, onMounted } from 'vue'

// 用shallowRef获取DOM元素（仅保存元素引用，不代理深层属性）
const container = shallowRef(null)

onMounted(() => {
  console.log(container.value) // <div class="box">...</div>（原始DOM元素）
})

const changeStyle = () => {
  // 修改DOM深层属性（style）：不触发响应式（无需，因DOM操作本身可见）
  container.value.style.backgroundColor = '#f0f0f0'
}
</script>
```

最佳实践：获取DOM/第三方实例（如Echarts、地图）时，优先用 `shallowRef`，因仅需保存引用，无需代理其深层属性（如 `DOM.style`、`echarts._option`），减少不必要的代理开销。

### 案例10：shallow与深层API混合使用（灵活控制层级） ###

需求：复杂表单场景，顶层用 `shallowReactive`（性能优化），深层嵌套的“用户信息”用 `ref`（需深层响应）。


```vue
<template>
  <div>表单类型：{{ form.type }}</div>
  <div>用户姓名：{{ form.user.name }}</div>
  <div>用户年龄：{{ form.user.age }}</div>
  <button @click="updateFormType">修改表单类型（顶层）</button>
  <button @click="updateUserAge">修改用户年龄（深层）</button>
</template>

<script setup>
import { shallowReactive, ref } from 'vue'

// 顶层用shallowReactive（仅代理type/user），深层user用ref（需深层响应）
const form = shallowReactive({
  type: '注册表单',
  // 深层用户信息用ref：确保name/age的深层修改生效
  user: ref({ name: '王五', age: 28 })
})

// 1. 修改shallowReactive顶层属性：触发更新
const updateFormType = () => {
  form.type = '登录表单' // 顶层属性，视图更新
}

// 2. 修改ref深层属性：触发更新（因user是ref，内部转reactive）
const updateUserAge = () => {
  form.user.value.age += 1 // 深层修改：视图更新（28→29）
}
</script>
```

解析：混合使用时，`shallowReactive` 负责顶层性能优化，`ref` 负责深层数据的响应式需求，兼顾性能与功能，适合复杂数据结构的精细化控制。

## 三、进阶API最佳实践总结 ##

### 优先使用 `shallow` 系列的场景 ###

- **大数据场景**：列表/表格数据（1000+条）、复杂嵌套对象（3层以上），仅需修改顶层属性或整体替换；
- **引用类型只读/少改**：数据以展示为主，深层属性极少修改（如接口返回的详情数据）；
- **非Vue管理的引用**：DOM元素、第三方库实例（`Echarts`、`Three.js`）、原生对象（如 `Date`、`Map`）；
- **性能瓶颈优化**：用 `reactive` 导致页面卡顿（如递归代理大量数据），替换为 `shallowReactive` 后可显著提升。

### 避免滥用 `shallow` 系列的坑 ###

- **坑1**：误以为深层修改生效：`shallowReactive`/`shallowRef` 的深层修改不触发更新，需明确“仅顶层响应”的特性；
- **坑2**：遗漏 `triggerRef`：`shallowRef` 修改深层属性后，必须调用 `triggerRef` 才会更新视图；
- **坑3**：混合使用时层级混乱：若 `shallowReactive` 内嵌套 `ref`，需注意 `ref` 的 `.value` 访问（如案例10中的 `form.user.value.age`）；
- **坑4**：基本类型用 `shallowReactive`：`shallowReactive` 不支持基本类型，传入后会静默失效（需用 `shallowRef`）。

### 配套API的使用时机 ###

- **triggerRef**：`shallowRef` 修改深层属性后，需手动触发更新时使用；
- **toRaw**：需获取 `shallowReactive`/`shallowRef` 的原始对象（避免响应式干扰）时使用；
- **isShallow**：判断数据是否为浅层响应式（如 `isShallow(form) → true` ），用于工具函数或调试；
- **markRaw**：若 `shallow` 系列数据中包含“绝对不希望代理”的对象（如复杂第三方实例），可用 `markRaw` 标记，避免意外代理。

## 四、结语 ##

`shallowRef` 与 `shallowReactive` 是Vue3响应式系统的“性能利器”，其核心价值在于“按需代理”——仅对需要响应的层级建立代理，避免过度代理导致的性能损耗。实际开发中，需先明确数据的“修改层级”：若仅改顶层或整体替换，优先用 `shallow` 系列；若需深层修改，仍用 `ref`/`reactive`。

掌握浅层响应式的关键，在于“放弃‘一刀切’的响应式，根据业务场景精细化控制”——这既是性能优化的需要，也是编写清晰、高效Vue3代码的核心思路。
