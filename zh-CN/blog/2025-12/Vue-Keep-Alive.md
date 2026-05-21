---
lastUpdated: true
commentabled: true
recommended: true
title: Vue 3 Keep-Alive 深度实践
description: 从原理到最佳实践
date: 2025-12-26 15:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 前言 ##

初入职场，我被安排用 Vue3 制作公司官网，有 5-6 个静态页面。开发完成后，领导在测试时提出一个问题：“为什么页面滑动后再切换到其它页面，返回时没有回到顶部？”调试后发现，是因为使用了 `<keep-alive>` 组件缓存页面导致的。这引发了我对 Vue 3 Keep-Alive 的浓厚兴趣。Keep-Alive 能帮助我们在页面间切换时保留组件的状态，使用户体验更加流畅。特别是在带有筛选和滚动列表的页面中，使用 Keep-Alive 可以在返回时保留用户之前的筛选条件和滚动位置，无需重新加载或初始化。

在本文中，我将结合实例，从基础到深入地解析 Vue 3 中的 Keep-Alive 组件原理、常见问题及最佳实践，帮助大家全面掌握这一功能。

## 一、了解 Keep-Alive：什么是组件缓存？ ##

### Keep-Alive 的本质 ###

`<keep-alive>` 是 Vue 的内置组件，用于缓存组件实例，避免在切换时重复创建和销毁组件实例。换言之，当组件被包裹在 `<keep-alive>` 中离开视图时，它不会被销毁，而是进入缓存；再次访问时，该组件实例会被重新激活，状态依然保留。

示例场景：用户从列表页进入详情页后再返回列表页。

没有 Keep-Alive 的情况：

- 用户操作：首页 → 探索页 → 文章详情 → 探索页

- 组件生命周期：

  - 首页：创建 → 挂载 → 销毁
  - 探索页：创建 → 挂载 → 销毁 → 重新创建 → 重新挂载
  - 文章详情：创建 → 挂载 → 销毁
  - 探索页（再次）：重新创建 → 重新挂载（状态丢失）

- 有 Keep-Alive 的情况：

- 用户操作：首页 → 探索页 → 文章详情 → 探索页

- 组件生命周期：

  - 首页：创建 → 挂载 → 停用（缓存）
  - 探索页：创建 → 挂载 → 停用（缓存）
  - 文章详情：创建 → 挂载 → 销毁
  - 探索页（再次）：激活（从缓存恢复，状态保持）

使用 `<keep-alive>` 包裹的组件，在离开时不会销毁，而是进入「停用（deactivated）」状态；再次访问时触发「激活（activated）」状态，原先所有的响应式数据都仍然保留。这意味着，探索页中的筛选条件和滚动位置都还能保留在页面返回时显示，提高了用户体验。

### Keep-Alive 的工作原理 ###

`Keep-Alive` 通过以下机制来实现组件缓存：

- 缓存机制：当组件从视图中被移除时，如果包裹在 `<keep-alive>` 中，组件实例不会被销毁，而是存放在内存中。下次访问该组件时，直接复用之前缓存的实例。
- 生命周期钩子：被缓存组件在进入和离开时，会触发两个特殊的钩子 —— `onActivated` / `onDeactivated` 或 `activated` / `deactivated`。可以在这些钩子中执行恢复或清理操作，例如刷新数据或保存状态。
- 组件匹配：`<keep-alive>` 默认会缓存所有包裹其中的组件实例。但如果需要精确控制，就会用到 `include`、`exclude` 属性，匹配组件的 `name` 选项来决定是否缓存。注意，这里的匹配依赖于组件的 `name` 属性，与路由配置无关。

### 核心属性 ###

- `include`：字符串、正则或数组，只有 `name` 匹配的组件才会被缓存。
- `exclude`：字符串、正则或数组，`name` 匹配的组件将不会被缓存。
- `max`：数字，指定最多缓存多少个组件实例，超过限制时会删除最近最少使用的实例。

注意：`include`/`exclude` 匹配的是组件的 `name` 选项。在 Vue 3.2.34 及以后，如果使用了 `<script setup>`，组件会自动根据文件名推断出 name，无需手动声明。

## 二、使用 Keep-Alive：基础到进阶 ##

### 基础使用 ###

最简单的使用方式是将动态组件放在 `<keep-alive>` 里面：

```vue
<template>
  <keep-alive>
    <component :is="currentComponent" />
  </keep-alive>
</template>
```

这样每次切换 `currentComponent` 时，之前的组件实例会被缓存，状态不会丢失。

### 在 Vue Router 中使用 ###

在 Vue Router 配置中，为了让路由页面支持缓存，需要将 `<keep-alive>` 放在 `<router-view>` 的插槽中：

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

这样 `<keep-alive>` 缓存的是路由对应的组件，而非 `<router-view>` 自身。不要包裹整个 `<router-view>`，而是通过插槽嵌套其渲染的组件。

### 使用 include 精确控制 ###

如果只想缓存特定组件，可利用 `include` 属性：

```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive include="Home,Explore">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
```

`include` 中的名称必须与组件的 `name` 完全一致，否则不起作用。

### 滑动位置缓存示例 ###

以“探索”列表页为例：用户在该页设置筛选条件并滚动列表后，跳转到文章详情页，再返回“探索”页。如果没有使用 `Keep-Alive`，列表页组件会被重新创建，筛选条件和滚动位置会重置。

使用 `<keep-alive>` 缓存“探索”页后，返回时组件从缓存中激活，之前的 `ref` 值和 `DOM` 滚动位置依然保留。这保证了用户回到列表页时，能够看到原先浏览到的内容和筛选状态。

可以在组件中配合路由导航守卫保存和恢复滚动条位置：

- 在 `onBeforeRouteLeave` 钩子中记录 `scrollTop`。
- 在 `onActivated` 钩子中恢复滚动条位置。

## 三、使用中的问题：Name 匹配的陷阱 ##

### 问题场景 ###

我们经常希望缓存某些页面状态，同时让某些页面不被缓存，例如：

- “探索”列表页：需要缓存。
- 登录/注册页：不需要缓存。
- 文章详情页：通常不缓存。

### 第一次尝试：手动定义 Name ###

```vue
<script setup>
defineOptions({ name: 'Explore' })
</script>
```

然后在主组件中使用 `include` 指定名称：

```vue
<router-view v-slot="{ Component }">
  <keep-alive include="Home,Explore,UserCenter">
    <component :is="Component" />
  </keep-alive>
</router-view>
```

理论上只缓存 `Home`、`Explore`、`UserCenter`。

### 问题出现：为什么 Include 不生效？ ###

- 组件名称不匹配：`include`/`exclude` 匹配的是组件自身的 `name` 属性，而非路由配置中的 `name`。
- 自动生成的 Name：`Vue 3.2.34+` 使用 `<script setup>` 会自动根据文件路径生成组件名，手动写的 `name` 可能与自动生成冲突。
- 路由包装机制：Vue Router 渲染组件时可能进行包装，导致组件实际名称与原始组件不同。

依赖组件名匹配容易出错，需要更灵活的方法。

## 四、解决方式：深入理解底层逻辑 ##

### 理解组件 Name 的生成机制 ###

Vue 3.2.34+ 使用 `<script setup>` 的单文件组件会自动根据文件名推断组件的 `name`。

- `src/pages/Explore/index.vue` → 组件名 `Explore`
- `src/pages/User/Profile.vue` → 组件名 `Profile`

无需手动定义 `name`，避免与自动推断冲突。

### 问题根源分析 ###

- 自动 Name 与路由名不一致。
- Router 的组件包装可能导致 `<keep-alive>` 无法捕获组件原始 `name`。

### 解决方案：路由 Meta 控制缓存 ###

#### 移除手动定义的 Name ####

```vue
<script setup lang="ts">
// Vue 会自动根据路径生成 name
</script>
```

#### 在路由配置中设置 Meta ####

```ts
const routes = [
  {
    path: '/explore',
    name: 'Explore',
    component: () => import('@/pages/Explore/index.vue'),
    meta: { title: '探索', keepAlive: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Auth/index.vue'),
    meta: { title: '登录', keepAlive: false }
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('@/pages/ArticleDetail/index.vue'),
    meta: { title: '文章详情', keepAlive: false }
  }
]
```

#### 在 App.vue 中根据 Meta 控制 ####

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const shouldCache = computed(() => route.meta?.keepAlive !== false)
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive v-if="shouldCache">
      <component :is="Component" />
    </keep-alive>
    <component v-else :is="Component" />
  </router-view>
</template>
```

默认缓存所有页面，只有 `meta.keepAlive` 明确为 `false` 时才不缓存。

### 方案优势 ###

- 灵活性强：缓存策略直接写在路由配置中。
- 可维护性好：缓存策略集中管理。
- 避免匹配失败：不依赖手动 name。
- 默认友好：设置默认缓存，仅对不需要缓存页面标记即可。

## 五、最佳实践总结 ##

### 缓存策略建议 ###

|       页面类型      |   是否缓存  |   缓存原因  |
|  --------  |  ---------  |  ---------  |
|   首页（静态）   |   ❌ 不缓存   |  内容简单，一般无需缓存  |
|   列表/浏览页   |   ✅ 缓存   |  保持筛选条件、分页状态、滚动位置等  |
|   详情页   |   ❌ 不缓存   |  每次展示不同内容，应重新加载  |
|   表单页   |   ❌ 不缓存   |  避免表单数据残留  |
|   登录/注册页   |   ❌ 不缓存   |  用户身份相关，每次重新初始化  |
|   个人中心/控制台   |   ✅ 缓存   |  保留子页面状态，提升体验  |

### 代码规范 ###

- 不要手动定义 `Name`，在 Vue 3.2.34+ 中自动推断。

```vue
<script setup>
// Vue 会自动推断 name
</script>
```

- 使用路由 `Meta` 控制缓存。
- 统一在 `App.vue` 中处理缓存逻辑。

### 生命周期钩子的使用 ###

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  console.log('组件被激活（从缓存恢复）')
})

onDeactivated(() => {
  console.log('组件被停用（进入缓存）')
})
</script>
```

### 性能考虑 ###

- 内存占用：不要无限制缓存过多页面，可使用 `max` 限制。
- 数据刷新：在 `onActivated` 中进行必要更新。
- 缓存清理：登出或不常用页面可手动清除缓存。
- 动画与过渡：确保 `<keep-alive>` 和 `<transition>` 嵌套顺序正确。

## 六、总结 ##

### 关键要点 ###

- `<keep-alive>` 缓存组件实例，通过停用保留状态。
- include/exclude 功能依赖组件 `name`。
- 推荐使用路由 `meta.keepAlive` 控制缓存。
- 缓存组件支持 `onActivated` / `onDeactivated` 钩子。
- 默认缓存大部分页面，只对需刷新页面明确禁用。

### 技术演进 ###

手动定义 Name → 自动 Name → Meta 控制

- 冗长易错 → 简化代码 → 灵活可靠

### 最终方案 ###

- 利用自动生成的组件名取消手动命名。
- 通过路由 `meta.keepAlive` 控制缓存。
- 在根组件统一处理缓存逻辑。
- 默认缓存，明确例外。

这样既保持了代码简洁，又实现了灵活可控的缓存策略，确保用户在页面切换时能获得更好的体验。

## 遇到的 window 滚动问题与实践 ##

### 项目中的困扰 ###

公司项目的前端开发，页面主要包括首页（Home）和探索页（Explore）。在项目中，这两个页面都使用 window 作为滚动容器。测试时发现一个问题：

```javascript
首页和探索页都使用 window 作为滚动容器
↓
它们共享同一个 window.scrollY（全局变量）
↓
用户在探索页滚动到 500px
↓
window.scrollY = 500（全局状态）
↓
切换到首页（首页组件被缓存，状态保留）
↓
但 window.scrollY 仍然是 500（全局共享）
↓
首页显示时，看起来也在 500px 的位置 ❌
```

这个问题的原因在于：

- `<keep-alive>` 只缓存组件实例和 DOM，不管理滚动状态。
- `window.scrollY` 是全局浏览器状态，不会随组件缓存自动恢复。
- 结果就是组件被缓存后，滚动位置被错误共享，导致用户体验不佳。

### 思路：滚动位置管理工具 ###

为了在自己的项目中解决类似问题，我考虑了手动管理滚动位置的方案：

```javascript
/**
 * 滚动位置管理工具
 * 用于在 keep-alive 缓存页面时，为每个路由独立保存和恢复滚动位置
 */
const scrollPositions = new Map()

export function saveScrollPosition(routePath) {
  const y = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop
  scrollPositions.set(routePath, y)
}

export function restoreScrollPosition(routePath, defaultY = 0) {
  const saved = scrollPositions.get(routePath) ?? defaultY
  requestAnimationFrame(() => {
    window.scrollTo(0, saved)
    document.documentElement.scrollTop = saved
    document.body.scrollTop = saved
  })
}
```

在组件中配合 Vue 生命周期钩子使用：

```javascript
import { onActivated, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { saveScrollPosition, restoreScrollPosition } from './scrollManager'

export default {
  setup() {
    const route = useRoute()

    // 组件激活时恢复滚动
    onActivated(() => {
      restoreScrollPosition(route.path, 0)
    })

    // 组件离开前保存滚动
    onBeforeUnmount(() => {
      saveScrollPosition(route.path)
    })
  }
}
```

### 公司项目的简化处理 ###

在公司项目中，由于页面结构简单，不需要为每个路由保存独立滚动位置，因此我采用了统一重置滚动到顶部的方式：

```javascript
// 路由切换后重置滚动位置
router.afterEach((to, from) => {
  if (to.path !== from.path) {
    setTimeout(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }, 0)
  }
})
```

这样可以保证：

- 切换页面时始终从顶部开始。
- 简单易维护，符合公司项目需求。
- 避免了 Keep-Alive 缓存滚动穿透的问题。

### 总结 ###

- `<keep-alive>` 缓存组件实例，但不管理 window 滚动状态，导致全局滚动共享问题。
- 自己项目中，可以通过*滚动位置管理工具*为每个路由独立保存和恢复滚动。
- 公司项目中，为简化处理，只需在路由切换后*重置滚动到顶部*即可。
- 总体经验：滚动管理要根据项目复杂度和需求选择方案，既保证用户体验，又保证可维护性。
