---
lastUpdated: true
commentabled: true
recommended: true
title: 全面理解vue3 浅层响应式API
description: 全面理解vue3 浅层响应式API shallowRef, shallowReactive, shallowReadonly
date: 2025-03-25 10:00:00
pageClass: blog-page-class
---

# 全面理解vue3 浅层响应式API #

## 前言 ##

vue3中ref, reactive,readonly创建响应式数据的API, 以及常用的计算属性computed, 侦听器watch,watchEffect的使用都很常见。

其中reactive, ref, readonly创建的响应式数据都是深层响应.

而本章主要给大家讲解以上三个API 对应的创建浅层响应式数据的 API, 即 **shallowRef**, **shallowReactive**, **shallowReadonly**。

## shallowRef ##

shallowRef 是ref 浅层作用形式。其实就是浅层响应式

shalloRef的使用方式和ref()完全相同, 不同的只是vue对数据响应式处理的不同:

- ref创建的数据, 如果有深层, 比如参数是一个对象, 对象的属性就是深层, 参数对象会被vue通过reactive处理为深层响应
- 而shallowRef创建数据, 只有顶层的value属性具有响应性, 深层的数据不具有响应性, 会原因返回, 即vue不会递归的将深层数据通过reactive处理, 而是原样存储和暴露.

### 类型 ###

我们先看一下shallowRefAPI 的类型签名, 其签名如下:

```ts
function shallowRef<T>(value: T): ShallowRef<T>

interface ShallowRef<T> {
  value: T
}
```

通过签名可以简单的看出, shallowRefAPI 接收一个参数, 返回一个具有value属性的对象, 且value属性的类型和参数类型相同.

### ref 和shallowRef 处理原始数据类型 ###

接下会通过示例带大家看一下ref和shallowRef 在处理原始数据类型的有什么不同.

示例代码:

```vue
<template>
  <div>
    <h3>shallowRef</h3>
    <div>{{ count }}</div>
    <div>{{ count2 }}</div>
    <button @click="change">修改数据源</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)
    const count2 = shallowRef(0)

    // 控制台输出 ref, shallowRef 创建的数据
    consollog("count", count);
    console.log("count2", count2);

    // 修改数据
    const change = () => {
      // count.value++
      count2.value++
    }
    return { count, count2, change }
  }
})
</script>
```

通过代码的运行结果, 你可以看出,在参数为基本数据类型的情况下, ref和shallowRef创建的响应式数据在使用上完全一样, value属性都具有响应性。

通过控制台输出结果, 你会发现ref和shallowRef创建的ref对象极度相似,如果你阅读过源码, 你就会明白, ref, shallowRef返回对象是通过同一个类实例化的对象.因此两个实例对象具有相同的属性. 但是有一个属性__v_isShallow属性值不同, 因为vue通过这个属性来区分是ref还是shallowRef创建的对象。


### ref 和shallowRef 处理深层对象 ###

ref 和 shallowRef 在处理深层对象就会有所不同:

- ref函数在处理深层对象时, 深层对象会被vue自动调用reactive包裹成响应式数据,
- shallowRef函数在处理深层对象时, vue不同将深层对象包裹为响应式对象, 也就是说shallowRef只有.value属性值才具有响应性, 深层对象不具有响应性

示例:

```vue
<template>
  <div>
    <h3>shallowRef</h3>
    <div>{{ count }}</div>
    <div>{{ count2 }}</div>
    <button @click="change">修改数据源</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef } from 'vue'

export default defineComponent({
  setup() {
    const count = ref({ count: 0 })
    const count2 = shallowRef({ count: 0 })

    // 控制输出 ref, shallowRef 对于参数为对象时创建的ref 对象
    console.log('count', count)
    console.log('count2', count2)

    // 修改数据
    const change = () => {
      // count.value.count++

      // 不会触发响应式
      // count2.value.count++

      // count2 是shallowRef数据
      // shallowRef 数据只有通过.value 整体修改时才会触发响应式
      count2.value = { count: 3 }
    }
    return { count, count2, change }
  }
})
</script>
```

通过控制台输出ref, shallowRef 创建的响应数据, 以及示例的运行结果, 会发现:

- shallowRef在参数为深层对象时, 创建的ref数据, value值就是参数原对象, 不具有响应性
- 但ref 的value属性值, 是vue调用reactive函数包裹成的Proxy代理对象, 即响应式数据
- 因此, 你可以理解shallowRef 是ref 浅层响应式的API, 只有通过.value修改数据才会触发响应式, 深层对象没有通过reactive包裹, 因此深层操作数据不具有响应式

shallowRef() 常常用于对大型数据结构的性能优化或是与外部的状态管理系统集成。

## shallowReactive ##

和shallowRef与ref关系相似, shallowReactive 是reactive浅层作用形式。就是创建具有浅层响应性的数据。


### shallowReactive 类型 ###

首先,我们先看一下shallowReactive类型签名, 签名如下:

```ts
function shallowReactive<T extends object>(target: T): T
```

通过签名可以看出, shallowReactive函数接收一个对象作为参数, 返回类型与参数类型相同

### shallowReactive 浅层响应式 ###

和 reactive() 不同，shallowReactive创建响应对象没有深层级的转换：一个浅层响应式对象里只有根级别的属性是响应式的, 深层对象不会被vue自动包装为响应对象.

示例:

```vue
<template>
  <div>
    <h3>shallowReactive</h3>
    <div>{{ user }}</div>
    <div>{{ user2 }}</div>
    <button @click="change">修改数据源</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, shallowReactive } from 'vue'

export default defineComponent({
  setup() {
    const user = reactive({ name: '张三', age: 18, friend: { name: '李四' } })
    const user2 = shallowReactive({ name: '张三', age: 18, friend: { name: '李四' } })

    // 控制台输出reactive, shallowReactive 创建的深层对象
    console.log("reactive friend", user.friend);
    console.log("shallowReactive friend", user2.friend);

    
    // 修改数据
    const change = () => {
      // 1. reactive, shallowReactive 在处理第一层对象属性时
      // 都会触发响应式
      // user.name = "王五"  // 修改 reactive
      // user2.name = "王五"  // 修改 shallowReactive

      // 2. 操作深度属性,shallowReactive 不会触发响应性
      // user.friend.name = '王五'  // 修改 reactive
      user2.friend.name = '王五'  // 修改 shallowReactive  不触发响应式

    }
    return { user, user2, change }
  }
})
</script>
```

通过控制台输出结果, 你应该已经看出:

- reactive创建的响应数据(代理对象) 深层对象也会自动的调用reactive函数, 创建为响应数据
- shallowReactive创建浅层响应数据, 其深层对象就是原样的不同对象, 不具有响应性.
- 运行结果也可以看出, 修改shallowReactive深层对象的数据, 页面是不会有任何变化的.因为不具有响应性.

### shallowReactive 深层ref 数据不会自动解包 ###

shallowReactive()函数创建一个浅层响应式对象里只有根级别的属性是响应式的。

也可以说shallowReactive()函数创建的数据是非深度监听, 只会包装第一个对象, 这也就意味着深层的ref数据不会被自动解包。

因为shallowReactive 深层数据的存储是原样存储, 不会包裹为深度响应式。

示例:

```vue
<template>
  <div>
    <h3>shallowReactive</h3>
    <div>{{ user }}</div>
    <div>{{ user2 }}</div>
    <button @click="change">修改数据源</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, shallowReactive } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(10)
    const user = reactive({ name: '张三', age: 18, count })
    const count2 = ref(20)
    const user2 = shallowReactive({ name: '张三', age: 18, count: count2 })

    // 修改数据
    const change = () => {
      // 1. reactive 操作深层ref 数据时,自动解包
      // 此时修改user.count 数据时不用添加.value
      // user.count = 20  // 修改 reactive

      // 2. shallowReactive 操作深层ref 数据时,不会自动解包
      // 此时修改user2.count 数据时必须使用.value
      user2.count.value = 40  // 修改 shallowReactive


    }
    return { user, user2, change }
  }
})
</script>
```

### shallowReactive与shallowRef 使用比较 ###

- 一般情况下使用ref和reactive即可
- 如果有一个对象数据, 结构比较深, 但只有一层对象的属性变化会触发响应, 使用shallowReactive
- 如果有一个对象数据, 后面会产生新的对象来整体替换触发响应式, 使用shallowRef

## shallowReadonly ##

shallowReadonly 是readonly浅层作用形式。只有第一层是只读的,深层不是只读属性,也可以这么理解, 只有第一层的对象属性不能修改值, 但深层的数据是可以修改的, 是非深层只读。

### shallowReadonly 浅层只读 ###

shallowReadonly在使用上与readonly完全相同, 区域在于:

- readonly() 创建只读代理, 如果有深层对象, 深层对象也会自动调用readonly处理为只读代理
- shallowReadonly 创建的是浅层只读代理, 也就是深层对象不会自动调用readonly包裹, 所以深层对象是非只读的, 即可以修改的. 也就意味着只有根层级的属性变为了只读。

示例:

```vue
<template>
  <div>
    <h3>shallowReadonly</h3>
    <div>{{ user }}</div>
    <div>{{ user2 }}</div>
    <button @click="change">修改数据源</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, readonly, ref, shallowReadonly } from 'vue'

export default defineComponent({
  setup() {
    const user = readonly({ name: '张三', age: 18, friend: { name: '李四' } })
    const user2 = shallowReadonly({ name: '张三', age: 18, friend: { name: '李四' } })

    // 修改数据
    const change = () => {
      // readonly 为深层只读, 修改任何一层属性值都是不合法
      // user.name = '王五'
      // user.friend.name = '王五'


      // shallowReadonly 只有第一层会被转为只读, 深层属性会原样存储,不是只读的
      // user2.name = '王五'  // shallowReadonly 第一层修改报错,因为是只读的
     
      // shallowReadonly 修改生成不会报错,
      // 但也不会触发响应性, 因为原样存储就是一个普通对象
      user2.friend.name = '王五'


    }
    return { user, user2, change }
  }
})
</script>
```

### shallowReadonly 处理深层ref不会自动解包 ###

因为shallowReadonly 深层数据的存储是原样存储, 不会自动调用shallowReadonly转为只读, 因此对于深层的ref 的数据不会被自动解包了。

示例:

```vue
<template>
  <div>
    <h3>shallowReadonly</h3>
    <div>{{ user }}</div>
    <div>{{ user2 }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, readonly, ref, shallowReadonly } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(10)
    const user = readonly({ name: '张三', age: 18, count })
    const count2 = ref(20)
    const user2 = shallowReadonly({ name: '张三', age: 18, count: count2 })

    // readonly 处理深层数据为ref 数据时, 会自动解包,不用添加.value
    console.log('user.count', user.count)

    // shallowReadonly 获取深层ref 数据时必须添加.value, 因为不会自动解包
    console.log('user2.count', user2.count.value)

   
    return { user, user2 }
  }
})
</script>
```

## 结语 ##

至此, 就把shallowRef, shallowReactive,shallowReadonly给大家讲解完了, 这三个API使用上还是相对较少. 大家要理解这些API的使用原理, 工作中根据情况选择不同的API。

