---
lastUpdated: true
commentabled: true
recommended: true
title: Vue3 ref与reactive深度解析
description: 原理、案例与最佳实践
date: 2025-09-22 13:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

在Vue3的Composition API中，`ref` 与 `reactive` 是实现响应式数据的核心API。二者虽均用于构建响应式系统，但适用场景、内部原理与使用方式存在显著差异。本文将从原理层面深度剖析，结合10个实战案例，带你彻底掌握这两个API的用法。

## 一、核心概念与原理 ##

### ref：基本类型与引用类型的“通用响应式容器” ###

- 定义：`ref` 用于创建*响应式基本类型*（如Number、String、Boolean），也可包裹*引用类型*（如Object、Array）。
- 原理：内部通过 `Object.defineProperty` 监听 `value` 属性的 `get`/`set`，当包裹引用类型时，会自动将其转换为 `reactive` 代理对象。
- 关键特性：
  - 需通过 `.value` 访问/修改数据（模板中自动解包，无需 `.value`）；
  - 支持所有数据类型，是Vue3中最灵活的响应式API。

### reactive：引用类型的“代理响应式” ###

- 定义：`reactive` 仅用于创建*引用类型*（Object、Array、Map、Set等）的响应式代理。
- 原理：基于 `ES6` 的 `Proxy` 实现，直接代理整个对象，拦截对象的属性访问、赋值、删除等操作。
- 关键特性：
  - 无需 `.value`，直接访问对象属性；
  - 不支持基本类型（传入基本类型会静默失效）；
  - 不能直接替换整个对象（会丢失代理关系，导致响应式失效）。

### ref与reactive核心区别 ###

|  对比维度   |  ref  |  reactive  |
| :-----------: | :-----------: | :-----------: |
| 支持数据类型 | 所有类型（基本+引用） | 仅引用类型 |
| 访问方式 | 需 `.value`（模板除外） | 直接访问属性 |
| 响应式原理 | Object.defineProperty + Proxy | 纯Proxy |
| 替换对象 | 支持（直接修改`.value`） | 不支持（会丢失响应式） |
| 解构特性 | 解构后仍为响应式（`ref` 类型） | 直接解构会丢失响应式（需 `toRefs` ） |

## 二、10个实战案例解析 ##

以下案例均基于Vue3的 `<script setup>` 语法（主流写法），涵盖基础用法、边界场景与最佳实践。

### 案例1：ref实现基本类型响应式（计数器） ###

需求：实现一个点击按钮递增的计数器。

```vue
<template>
  <div>计数：{{ count }}</div>
  <button @click="increment">+1</button>
</template>

<script setup>
import { ref } from 'vue'

// 1. 创建ref响应式数据（基本类型Number）
const count = ref(0)

// 2. 修改时需通过.value
const increment = () => {
  count.value += 1 // 必须加.value，否则无法触发响应式
}
</script>
```

解析：`ref(0)` 将基本类型 `0` 包装为响应式对象，模板中 `count` 自动解包，无需 `.value`；JS逻辑中必须通过 `.value` 修改，否则无法触发视图更新。

### 案例2：reactive实现对象响应式（用户信息） ###

需求：展示并修改用户的姓名与年龄。

```vue
<template>
  <div>姓名：{{ user.name }}</div>
  <div>年龄：{{ user.age }}</div>
  <button @click="updateUser">更新信息</button>
</template>

<script setup>
import { reactive } from 'vue'

// 1. 创建reactive响应式对象（引用类型Object）
const user = reactive({
  name: '张三',
  age: 24
})

// 2. 直接修改属性，无需.value
const updateUser = () => {
  user.name = '李四' // 直接修改属性，触发响应式
  user.age += 1     // 支持属性的增量修改
}
</script>
```

解析：`reactive` 直接代理 `user` 对象，修改属性时无需额外语法，且深层属性（如 `user.name`）自动具备响应式。

### 案例3：ref包裹引用类型（商品信息） ###

需求：用 `ref`包裹对象，实现商品信息的修改。

```vue
<template>
  <div>商品名：{{ goods.name }}</div>
  <div>价格：{{ goods.price }}</div>
  <button @click="discount">打9折</button>
</template>

<script setup>
import { ref } from 'vue'

// 1. ref包裹引用类型（Object）
const goods = ref({
  name: 'Vue3实战教程',
  price: 99
})

// 2. 修改时需先通过.value访问对象，再修改属性
const discount = () => {
  goods.value.price *= 0.9 // 先.value获取对象，再改属性
}
</script>
```

解析：`ref` 包裹引用类型时，内部会自动将对象转换为 `reactive` 代理，因此修改 `goods.value.price` 等同于修改 `reactive` 对象的属性，响应式依然生效。

### 案例4：reactive嵌套对象（订单信息） ###

需求：处理包含多层嵌套的订单数据，修改深层属性。

```vue
<template>
  <div>订单号：{{ order.id }}</div>
  <div>商品：{{ order.product.name }}</div>
  <div>状态：{{ order.status.text }}</div>
  <button @click="updateStatus">确认收货</button>
</template>

<script setup>
import { reactive } from 'vue'

// 1. reactive嵌套多层对象
const order = reactive({
  id: 'OD20240501',
  product: {
    name: '无线耳机',
    price: 399
  },
  status: {
    code: 1,
    text: '待收货'
  }
})

// 2. 直接修改深层属性，响应式依然生效
const updateStatus = () => {
  order.status.code = 2
  order.status.text = '已完成' // 深层属性修改，视图同步更新
}
</script>
```

解析：`reactive` 的 `Proxy` 代理会递归处理嵌套对象，无论嵌套多少层，修改属性都会触发响应式，无需额外处理。

### 案例5：ref数组（任务列表增删） ###

需求：实现任务列表的添加、删除功能。

```vue
<template>
  <ul>
    <li v-for="(task, index) in tasks" :key="index">
      {{ task }}
      <button @click="deleteTask(index)">删除</button>
    </li>
  </ul>
  <input v-model="newTask" type="text">
  <button @click="addTask">添加任务</button>
</template>

<script setup>
import { ref } from 'vue'

// 1. ref创建数组响应式数据
const tasks = ref(['学习ref', '学习reactive'])
const newTask = ref('') // 绑定输入框的响应式数据

// 2. 添加任务：修改数组引用（替换整个数组）
const addTask = () => {
  if (newTask.value.trim()) {
    // 方式1：用扩展运算符创建新数组（推荐，触发响应式）
    tasks.value = [...tasks.value, newTask.value]
    // 方式2：用数组方法（push/splice等，也支持）
    // tasks.value.push(newTask.value)
    newTask.value = '' // 清空输入框
  }
}

// 3. 删除任务：用splice修改数组
const deleteTask = (index) => {
  tasks.value.splice(index, 1) // 数组方法修改，触发响应式
}
</script>
```

注意：`ref` 数组不推荐直接修改索引（如 `tasks.value[0] = '新任务'` ），可能导致响应式失效；推荐用 `push`/`splice` 或替换整个数组的方式。

### 案例6：reactive数组（商品列表筛选） ###

需求：实现商品列表的关键词筛选功能。

```vue
<template>
  <input v-model="filterText" placeholder="输入关键词筛选">
  <ul>
    <li v-for="item in filteredGoods" :key="item.id">
      {{ item.name }} - {{ item.price }}元
    </li>
  </ul>
</template>

<script setup>
import { reactive, computed } from 'vue'

// 1. reactive创建数组
const goodsList = reactive([
  { id: 1, name: 'Vue3教程', price: 99 },
  { id: 2, name: 'React教程', price: 89 },
  { id: 3, name: 'Vue3组件库', price: 129 }
])

// 2. ref绑定筛选输入框（基本类型用ref更合适）
const filterText = ref('')

// 3. 计算属性筛选数组
const filteredGoods = computed(() => {
  return goodsList.filter(item => 
    item.name.includes(filterText.value)
  )
})
</script>
```

解析：`reactive` 数组支持直接用 `filter`/`map` 等数组方法，返回的新数组仍具备响应式；筛选关键词是基本类型，用 `ref` 更简洁。

### 案例7：ref与reactive转换（toRefs/toRef） ###

需求：将 `reactive` 对象解构为 `ref` ，保持响应式。

```vue
<template>
  <div>姓名：{{ name }}</div>
  <div>年龄：{{ age }}</div>
  <button @click="increaseAge">年龄+1</button>
</template>

<script setup>
import { reactive, toRefs, toRef } from 'vue'

// 1. 创建reactive对象
const user = reactive({
  name: '王五',
  age: 28
})

// 2. 用toRefs解构：所有属性转为ref（推荐批量解构）
const { name, age } = toRefs(user)

// 3. 用toRef单独转换某个属性（适用于单个属性）
// const age = toRef(user, 'age')

// 4. 修改时需通过.value（因解构后是ref类型）
const increaseAge = () => {
  age.value += 1 // 必须加.value，视图同步更新
}
</script>
```

关键：直接解构 `reactive` 对象（如 `const { name } = user` ）会丢失响应式；`toRefs`/`toRef` 会创建与原对象关联的 `ref`，修改后原对象也会同步更新。

### 案例8：与computed结合（计算总价） ###

需求：根据商品列表和数量，计算商品总价。

```vue
<template>
  <div>商品：{{ goods.name }}</div>
  <div>单价：{{ goods.price }}元</div>
  <div>数量：<button @click="decrease">-</button>{{ count }}<button @click="increase">+</button></div>
  <div>总价：{{ totalPrice }}元</div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// 1. reactive存储商品信息
const goods = reactive({
  name: '笔记本电脑',
  price: 5999
})

// 2. ref存储数量（基本类型）
const count = ref(1)

// 3. computed依赖ref和reactive数据
const totalPrice = computed(() => {
  return goods.price * count.value // 自动追踪依赖，缓存结果
})

// 4. 修改数量
const increase = () => count.value < 10 && (count.value += 1)
const decrease = () => count.value > 1 && (count.value -= 1)
</script>
```

解析：`computed` 会自动追踪 `goods.price`（`reactive` 属性）和 `count.value`（`ref` 值）的变化，当任一依赖更新时，`totalPrice` 会重新计算。

### 案例9：生命周期中使用（挂载后初始化数据） ###

需求：组件挂载后，从接口（模拟）加载用户数据并渲染。

```vue
<template>
  <div v-if="loading">加载中...</div>
  <div v-else>
    <div>姓名：{{ user.name }}</div>
    <div>邮箱：{{ user.email }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// 1. ref存储加载状态（布尔值）
const loading = ref(true)

// 2. reactive存储用户数据（对象）
const user = reactive({
  name: '',
  email: ''
})

// 3. 生命周期钩子：挂载后加载数据
onMounted(async () => {
  // 模拟接口请求
  const mockApi = () => new Promise(resolve => {
    setTimeout(() => {
      resolve({ name: '赵六', email: 'zhao6@example.com' })
    }, 1000)
  })

  const data = await mockApi()
  // 赋值给reactive对象
  user.name = data.name
  user.email = data.email
  // 修改ref状态
  loading.value = false // 关闭加载态
})
</script>
```

解析：在 `onMounted` 中，可直接修改 `ref` 的 `.value` 和 `reactive`的属性，触发视图更新；`loading` 用 `ref`（基本类型），`user` 用 `reactive`（对象），符合两者的适用场景。

### 案例10：复杂嵌套场景（reactive含ref属性） ###

需求：处理复杂数据结构（`reactive` 对象中包含 `ref` 属性）。

```vue
<template>
  <div>购物车商品数：{{ cart.count }}</div>
  <div>商品列表：</div>
  <ul>
    <li v-for="(item, index) in cart.items" :key="index">
      {{ item.name }} - {{ item.quantity }}件
      <button @click="addQuantity(index)">+1</button>
    </li>
  </ul>
</template>

<script setup>
import { reactive, ref } from 'vue'

// 1. reactive对象中包含ref属性
const cart = reactive({
  // count是ref类型（需.value修改）
  count: ref(0),
  // items是普通数组（reactive自动代理）
  items: [
    { name: '手机壳', quantity: 2 },
    { name: '充电器', quantity: 1 }
  ]
})

// 2. 修改ref属性（需.cart.count.value）
// 修改reactive数组属性（直接.item.quantity）
const addQuantity = (index) => {
  cart.items[index].quantity += 1 // 直接修改
  cart.count.value += 1 // 需.value（因count是ref）
}
</script>
```

注意：`reactive` 对象中可嵌套 `ref`，但修改时需多一层 `.value`（如`cart.count.value`）；实际开发中建议避免这种混合写法，优先保持数据结构统一。

## 三、最佳实践总结 ##

### 数据类型优先原则 ###

- 基本类型（Number、String、Boolean）：必用 `ref`；
- 引用类型（Object、Array）：优先用 `reactive`，除非需要替换整个对象（此时用 `ref` ）。

### 避免响应式失效的坑 ###

- `reactive` 不直接替换整个对象（如需替换，用 `ref` 包裹）；
- `ref` 数组不直接修改索引（用push/splice或替换数组）；
- `reactive` 解构用 `toRefs`，避免直接解构丢失响应式。

### 复杂场景建议 ###

- 简单数据（如表单输入、计数器）：用 `ref`；
- 复杂对象（如用户信息、订单数据）：用 `reactive`；
- 组件间传参：`ref` 更灵活（支持所有类型），`reactive` 需配合 `toRefs` 传递。

### 性能考量 ###

- `ref` 包裹引用类型时，内部会转为 `reactive`，性能与 `reactive` 无差异；
- 大量列表数据：优先用 `ref` 数组（修改时替换整个数组，性能更优）。

## 四、结语 ##

`ref` 与 `reactive` 是Vue3响应式系统的基石，理解二者的原理差异与适用场景，是写出高质量Vue3代码的关键。实际开发中无需纠结“非此即彼”，而是根据数据类型与业务需求灵活选择——让`ref` 处理简单数据，让 `reactive` 管理复杂对象，再结合 `toRefs`/`computed`等API，即可构建高效、可维护的响应式系统。
