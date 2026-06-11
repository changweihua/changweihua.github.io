---
lastUpdated: true
commentabled: true
recommended: true
title: Pinia Store 平滑迁移
description: 用代理模式实现零风险重构
date: 2026-01-04 09:30:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

> 重构遗留代码最怕什么？改一处崩十处。这篇文章分享一个我在实际项目中用过的方案：用代理模式实现 Pinia Store 的平滑迁移，让几十处旧代码无感升级。

## 背景：为什么要迁移 ##

项目里有个 `useUserStore`，最早是用 `Options API` 写的，随着业务迭代，问题越来越多：

- 类型定义不完整，到处是 `any`
- 命名不规范，`setUserInfoAction`、`loginOut` 这种命名看着难受
- 状态结构和后端返回不一致，前端加了很多 `hack`
- 没有按业务域组织，所有 `Store` 都堆在根目录

想重构成 `Setup` 风格，顺便理清类型和命名。但问题来了：*这个 `Store` 被几十个文件引用，直接改导入路径？风险太大*。

## 方案：代理模式 + 渐进式迁移 ##

核心思路很简单：*不动旧路径，让旧文件变成代理*。

```txt
旧导入路径                        新 Store
src/store/user.ts  ───代理───►  src/store/core/user.ts
       ▲                               │
       │                               │
   几十处业务代码                     唯一数据源
```

这样做的好处：

- ✅ 旧代码一行不改，继续用 `~/store/user` 导入
- ✅ 新代码直接用 `~/store/core` 导入
- ✅ 数据源唯一，不会出现状态不同步
- ✅ 可以慢慢把旧代码迁移到新路径

## 实现步骤 ##

### Step 1：先写新的 Store ###

在 `src/store/core/user.ts` 创建新的 Setup 风格 Store：

```typescript
// src/store/core/user.ts
export const useUserStore = defineStore('user', () => {
  // ==================== State ====================
  const userInfo = ref<UserInfo>(getDefaultUserInfo())
  const permissions = ref<Permission[]>([])
  const locale = ref<SupportedLanguage>('zh')
  const isRouterInitialized = ref(false)

  // ==================== Getters ====================
  const isLoggedIn = computed(() => !!userInfo.value.id)
  const nickname = computed(() => userInfo.value.realName || '')

  // ==================== Actions ====================
  async function loadUserInfo(): Promise<void> {
    const res = await userApi.getPermissionsInfo()
    if (res.data) {
      userInfo.value = { ...getDefaultUserInfo(), ...res.data.user }
      permissions.value = res.data.permissions || []
    }
  }

  async function logout(): Promise<void> {
    userInfo.value = getDefaultUserInfo()
    permissions.value = []
    // ... 清理逻辑
  }

  return {
    userInfo, permissions, locale, isRouterInitialized,
    isLoggedIn, nickname,
    loadUserInfo, logout,
  }
})
```

类型清晰，命名规范，舒服。

### Step 2：把旧文件改成代理 ###

重点来了。把原来的 `src/store/user.ts` 改成代理层：

```typescript
// src/store/user.ts - 变成代理层
import type { Pinia } from 'pinia'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useUserStore as useCoreUserStore } from './core/user'

/**
 * @deprecated 建议迁移到 useUserStore from '~/store/core'
 */
export function useUserStore(_pinia?: Pinia) {
  // 转发到新 Store
  const coreStore = useCoreUserStore()

  const { userInfo, permissions, locale, isRouterInitialized } = storeToRefs(coreStore)

  // 兼容旧的 getter 命名
  const getLocale = computed(() => locale.value)
  const getPermissions = computed(() => permissions.value)

  // 兼容旧的 action 命名
  async function setUserInfoAction() {
    await coreStore.loadUserInfo()  // 转发
  }

  async function loginOut() {
    await coreStore.logout()  // 转发
  }

  // 兼容 userStore.user.xxx 的直接访问方式
  const userProxy = {
    get user() { return userInfo.value }
  }

  return {
    userInfo, permissions, locale,
    ...userProxy,  // 支持 store.user.readAll 这种访问
    // 旧命名（兼容）
    getLocale, getPermissions,
    setUserInfoAction, loginOut,
    // 新命名（推荐）
    loadUserInfo: coreStore.loadUserInfo,
    logout: coreStore.logout,
  }
}
```

几个关键点：

#### 接受可选的 pinia 参数 ####

旧代码可能写成 `useUserStore(store)`，新的代理层要兼容这种写法，虽然参数实际不用。

#### 用 getter 代理 user 属性 ####

旧代码直接 `userStore.user.readAll` 访问，不是 `userStore.user.value.readAll`。用 `getter` 可以实现这种"直接访问"的效果：

```typescript
const userProxy = {
  get user() { return userInfo.value }
}
return { ...userProxy }
```

#### 新旧命名都暴露 ####

让业务代码可以渐进式迁移，`setUserInfoAction` 和 `loadUserInfo` 同时可用。

### Step 3：加上 `@deprecated` 标记 ###

给代理层加上 `JSDoc` 的 `@deprecated` 标记，IDE 会给出提示，方便后续清理：

```typescript
/** @deprecated 使用 coreStore.loadUserInfo 代替 */
async function setUserInfoAction() {
  await coreStore.loadUserInfo()
}
```

## 测试验证 ##

迁移最怕的是"看起来没问题，上线才出事"。这里给一套验证方案。

### 快速冒烟测试 ###

在浏览器控制台跑一下：

```typescript
// 旧路径
import { useUserStore } from '~/store/user'
// 新路径
import { useUserStore as useCoreUserStore } from '~/store/core'

const oldStore = useUserStore()
const newStore = useCoreUserStore()

// 验证数据源唯一
console.log('引用相同:', oldStore.userInfo === newStore.userInfo)  // true

// 验证状态同步
newStore.setLocale('en')
console.log('状态同步:', oldStore.locale.value === 'en')  // true
```


### 关键路径验证 ###

| **场景**        |      **操作**      |     **预期**      |
| :------------- | :-----------: |     :-----------:      |
|    登录     |      正常登录      |      用户名正确显示      |
|    权限     |      访问受限页面      |      权限判断正常      |
|    语言     |      切换中英文      |      全局切换，刷新后保持      |
|    登出     |      点击登出      |      状态清除，跳转登录页      |
|    刷新     |      F5 刷新页面      |      状态正确恢复      |


### 单元测试 ###

写一个兼容性测试，确保新旧 API 行为一致：

```typescript
describe('User Store 兼容性', () => {
  it('新旧 Store 应指向同一数据源', () => {
    const oldStore = useUserStore()
    const coreStore = useCoreUserStore()
    expect(oldStore.userInfo).toBe(coreStore.userInfo)
  })

  it('setUserInfoAction 应等价于 loadUserInfo', async () => {
    const store = useUserStore()
    await store.setUserInfoAction()
    expect(store.userInfo.value.id).toBeTruthy()
  })
})
```

## 渐进式迁移 ##

代理层搞定后，业务代码可以慢慢迁移：

```typescript
// ============ 旧写法（继续可用） ============
import { useUserStore } from '~/store/user'

const store = useUserStore(pinia)
console.log(store.user.readAll)
await store.setUserInfoAction()

// ============ 新写法（推荐） ============
import { useUserStore } from '~/store/core'

const store = useUserStore()
console.log(store.userInfo.readAll)
await store.loadUserInfo()
```

没有 `deadline` 压力的话，可以每次改业务功能的时候顺手把导入路径改掉，几个月后旧路径的引用自然就清零了。

## 兼容点速查表 ##

| **旧用法**        |      **兼容方式**      |
| :------------- | :-----------: |
|    `useUserStore(store)`     |      接受可选参数 `_pinia?: Pinia`      |
|    `userStore.user.readAll`     |      使用 `getter` 代理直接访问      |
|    `userStore.setUserInfoAction()`     |      转发到 `loadUserInfo()`      |
|    `userStore.loginOut()`     |      转发到 `logout()`      |
|    `userStore.isSetRouters`     |      别名到 `isRouterInitialized`      |
|    `userStore.getLocalecomputed`     |      包装 `locale.value`      |

## 总结 ##

这套方案的核心就三点：

- **数据源唯一**：新旧路径最终都指向同一个 `Store` 实例
- **API 兼容**：代理层转发所有旧的方法调用
- **渐进迁移**：新旧写法并存，没有硬性切换时间点

**适用场景**：

- `Store` 被大量文件引用，不敢直接改路径
- 想重构但又怕出问题
- 团队习惯渐进式改进，不喜欢大爆炸式重构

**不适用场景**：

- `Store` 只有几处引用，直接全局替换更快
- 重构涉及 `Store ID` 变更（会影响持久化）
