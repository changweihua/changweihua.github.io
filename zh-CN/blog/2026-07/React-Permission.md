---
lastUpdated: true
commentabled: true
recommended: true
title: 前端权限校验最佳实践
description: 一个健壮的柯里化工具函数
date: 2026-07-09 09:35:00
pageClass: blog-page-class
cover: /covers/vue.svg
---

在业务开发中，权限校验是绕不开的常见场景。无论是管理后台的按钮权限控制，还是金融系统的操作权限验证，都需要在业务逻辑执行前进行权限判断。

然而，权限校验的代码往往散落在各处，重复且难以维护。本文分享一个经过多轮评审和实战检验的权限校验工具函数，从设计思路到最佳实践，帮助你在项目中优雅地处理权限校验。

## 需求背景

### 典型场景

假设我们在开发一个用户管理模块：

```typescript
// 场景1：删除用户 - 需要管理员权限
const handleDelete = async (userId: string) => {
  if (!hasPermission('user:delete')) {
    message.error('无删除权限')
    return
  }
  await deleteUser(userId)
}

// 场景2：编辑用户 - 需要特定角色
const handleEdit = async (user: User) => {
  if (!canEditUser(user)) {
    message.error('无编辑权限')
    return
  }
  await updateUser(user)
}

// 场景3：异步权限校验 - 需要请求后端接口
const handleExport = async () => {
  const hasPerm = await checkPermissionAsync('user:export')
  if (!hasPerm) {
    message.error('无导出权限')
    return
  }
  await exportUsers()
}
```

### 存在的问题

- 代码重复：每个函数都要写相同的校验逻辑
- 参数透传麻烦：`Antd` 等组件的事件处理函数需要传递事件参数
- 错误处理不统一：权限错误和业务错误混在一起
- 难以维护：权限校验逻辑分散，修改需要改动多处

## 设计思路

### 核心目标

- 复用性：一次配置，多处使用
- 参数透传：保持原函数参数不变
- 类型安全：完整的 TypeScript 类型支持
- 错误隔离：权限错误和运行时错误分开处理

### 方案选择

#### 方案1：装饰器模式

```typescript
@checkPermission('user:delete')
async handleDelete(userId: string) {
  await deleteUser(userId);
}
```

优点：语法优雅

缺点：对箭头函数不友好，React Hooks 场景受限

#### 方案2：高阶函数

```typescript
const handleDelete = withPermission(
  () => hasPermission('user:delete'),
  '无删除权限'
)((userId: string) => deleteUser(userId))
```

优点：函数式编程，与 React 兼容

缺点：需要处理参数透传

#### 方案3：柯里化（最终选择）

```typescript
const handleDelete = withPermissionCheck({
  validate: () => hasPermission('user:delete'),
  errorMessage: '无删除权限'
})(async (userId: string) => {
  await deleteUser(userId)
})
```

优点：配置清晰、支持柯里化、参数自动透传

缺点：返回值类型需要处理

> 我们选择柯里化方案，它在灵活性和可读性之间取得了良好平衡。

## 实现详解

### 基础实现

```typescript
export interface PermissionCheckOptions {
  validate: boolean | (() => boolean) | (() => Promise<boolean>)
  errorMessage?: string
  onForbidden?: (message?: string) => boolean | void
  onError?: (error: unknown) => void
  onChecking?: (checking: boolean) => void
  showMessage?: (message: string) => void
}

export function withPermissionCheck<T extends (...args: unknown[]) => unknown>(options: PermissionCheckOptions) {
  return (targetFn: T): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      try {
        // 校验权限
        let hasPermission: boolean
        if (typeof options.validate === 'boolean') {
          hasPermission = options.validate
        } else if (typeof options.validate === 'function') {
          hasPermission = await options.validate()
        } else {
          hasPermission = false
        }

        // 权限失败处理
        if (!hasPermission) {
          const msg = options.errorMessage || '无操作权限'
          const handled = options.onForbidden?.(msg)

          if (handled !== true) {
            const messageHandler = options.showMessage || defaultMessageHandler
            messageHandler(msg)
          }

          throw new PermissionDeniedError(msg, { args, handled })
        }

        // 执行目标函数
        return (await targetFn(...args)) as ReturnType<T>
      } catch (error) {
        if (error instanceof PermissionDeniedError) {
          throw error
        }
        options.onError?.(error)
        throw error
      }
    }) as (...args: Parameters<T>) => Promise<ReturnType<T>>
  }
}
```

### 关键设计点

#### 参数透传保证

使用 TypeScript 泛型和 `Parameters<T>` 实现参数自动透传：

```typescript
// 原函数签名
type TargetFn = (pagination: TablePagination, filters: Record<string, any>, sorter: Sorter) => void

// 包装后
const wrappedFn = withPermissionCheck({
  validate: () => hasPermission('view')
})(targetFn)

// 类型自动推断，参数完整透传
wrappedFn({ current: 1, pageSize: 10 }, {}, {})
```

#### 自定义错误类型

引入 `PermissionDeniedError` 区分权限错误和运行时错误：

```typescript
export class PermissionDeniedError extends Error {
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'PermissionDeniedError'
  }
}
```

使用场景：

```typescript
try {
  await handleDelete('user-123')
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    message.warning(error.message)
    return
  }
  message.error('系统错误')
}
```

#### 解耦 UI 库

通过 `showMessage` 配置项实现 UI 库解耦：

```typescript
// 使用 Ant Design
import { message } from 'antd'
const handleDelete = withPermissionCheck({
  validate: () => hasPermission('delete'),
  showMessage: (msg) => message.error(msg)
})(deleteUser)

// 使用 Naive UI
import { useMessage } from 'naive-ui'
const { error } = useMessage()
const handleDelete = withPermissionCheck({
  validate: () => hasPermission('delete'),
  showMessage: (msg) => error(msg)
})(deleteUser)

// 完全自定义
const handleDelete = withPermissionCheck({
  validate: () => hasPermission('delete'),
  showMessage: (msg) => {
    const div = document.createElement('div')
    div.textContent = msg
    document.body.appendChild(div)
    setTimeout(() => div.remove(), 3000)
  }
})(deleteUser)
```

#### 避免 Loading 闪烁

仅在异步校验时触发 onChecking：

```typescript
// 判断是否为异步校验
const isAsyncValidation =
  typeof options.validate === 'function' && (options.validate as () => Promise<boolean>)().then !== undefined

// 仅异步校验时触发
if (isAsyncValidation) {
  options.onChecking?.(true)
}

// ... 执行逻辑

if (isAsyncValidation) {
  options.onChecking?.(false)
}
```

## 使用指南

### 基础用法

#### 静态权限（boolean）

```typescript
const handleDelete = withPermissionCheck({
  validate: hasPermission('delete'),
  errorMessage: '无删除权限'
})(async (userId: string) => {
  await deleteUser(userId)
})

// 调用
try {
  await handleDelete('user-123')
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    // 权限不足
  }
}
```

#### 同步校验函数

```typescript
const handleClick = withPermissionCheck({
  validate: () => canEdit(),
  errorMessage: '无编辑权限'
})((event: React.MouseEvent) => {
  console.log(event.currentTarget);
});

// 在 React 组件中使用
<Button onClick={handleClick}>编辑</Button>
```

#### 异步校验函数

```typescript
const handleExport = withPermissionCheck({
  validate: async () => {
    const result = await checkPermissionAsync('export')
    return result
  },
  errorMessage: '无导出权限',
  onChecking: (loading) => setLoading(loading)
})(async () => {
  await exportData()
})
```

### 高级用法

#### 自定义错误提示

```typescript
import { Modal } from 'antd'

const handleDelete = withPermissionCheck({
  validate: () => hasPermission('delete'),
  errorMessage: '删除权限不足',
  onForbidden: (msg) => {
    Modal.warning({
      title: '权限提示',
      content: msg
    })
    return true // 已自定义处理，不显示默认提示
  }
})(deleteUser)
```

#### 处理运行时错误

```typescript
const handleAsync = withPermissionCheck({
  validate: () => true,
  errorMessage: '操作失败',
  onError: (error) => {
    console.error('执行出错:', error)
    message.error('操作失败，请重试')
  }
})(async () => {
  await riskyOperation()
})
```

#### Antd 组件集成

```tsx
// Table onChange - 多参数透传
const handleTableChange = withPermissionCheck({
  validate: () => hasPermission('view'),
  errorMessage: '无查看权限'
})((pagination, filters, sorter, extra) => {
  console.log(pagination.current, filters, sorter.field, extra.action);
  fetchData();
});

<Table onChange={handleTableChange} />

// Form onFinish
const handleFormSubmit = withPermissionCheck({
  validate: () => canSubmit(),
  errorMessage: '无提交权限'
})(async (values: FormValues) => {
  await submitForm(values);
});

<Form onFinish={handleFormSubmit}>
```

### 最佳实践

#### UI 层预处理

在按钮或入口处判断权限，避免触发校验：

```tsx
const deleteUser = withPermissionCheck({
  validate: () => hasPermission('delete'),
  errorMessage: '无删除权限'
})(async (userId: string) => {
  await api.delete(userId)
})

// 使用
;<DataTable
  rowActions={(record) => [
    <Button
      key="delete"
      disabled={!hasPermission('delete')}
      danger
      onClick={() => deleteUser(record.id)}
    >
      删除
    </Button>
  ]}
/>
```

#### 错误边界处理

在 React Error Boundary 中统一处理：

```tsx
class PermissionErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    if (error instanceof PermissionDeniedError) {
      return { hasError: false } // 不显示错误边界，由组件自行处理
    }
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    if (!(error instanceof PermissionDeniedError)) {
      // 记录其他错误
      logError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

#### 权限校验与业务逻辑分离

将权限校验逻辑抽离为独立模块：

```typescript:permissions.ts
export const UserPermissions = {
  canDelete: () => hasPermission('user:delete'),
  canEdit: (user: User) => user.id === currentUser.id || hasRole('admin'),
  canExport: async () => {
    const { data } = await api.checkPermission('user:export');
    return data.allowed;
  }
};

// 使用
const handleDelete = withPermissionCheck({
  validate: UserPermissions.canDelete,
  errorMessage: '无删除权限'
})(deleteUser);
```

## 常见问题

### Q1: 为什么权限失败要抛出错误而不是返回 undefined？

答案：类型安全的考虑。

如果返回 `undefined`：

```typescript
const getUserData = withPermissionCheck({
  validate: false
})(async (id: string): Promise<User> => {
  return await fetchUser(id)
})

// 类型推断为 Promise<User>，实际返回 Promise<User | undefined>
const user = await getUserData('123')
user.name // 运行时报错！
```

抛出错误确保类型契约完整：

```typescript
try {
  const user = await getUserData('123') // 类型安全
  user.name
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    // 明确处理权限错误
  }
}
```

### Q2: 为什么包装后的函数总是异步的？

答案：统一行为，减少复杂度。

虽然这会导致同步函数也被包装成异步，但有以下好处：

- API 一致性：所有包装函数的调用方式相同
- 简化类型：不需要复杂的函数重载
- 扩展性：方便后续添加异步权限校验

在文档中明确说明这一点即可。

### Q3: 如何在单元测试中使用？

答案：mock 消息提示函数。

```typescript
import { withPermissionCheck } from '@/utils/permission-check'

describe('权限校验', () => {
  let showMessageMock: jest.Mock

  beforeEach(() => {
    showMessageMock = jest.fn()
  })

  it('应该调用自定义提示函数', async () => {
    const targetFn = jest.fn()
    const wrappedFn = withPermissionCheck({
      validate: false,
      errorMessage: '无权限',
      showMessage: showMessageMock
    })(targetFn)

    await expect(wrappedFn()).rejects.toThrow(PermissionDeniedError)
    expect(showMessageMock).toHaveBeenCalledWith('无权限')
  })
})
```

### Q4: 如何处理高频调用的权限校验？

答案：在 `validate` 函数外部缓存。

```typescript
// 简单缓存
let permissionCache: Map<string, boolean> = new Map()

const getPermission = async (key: string) => {
  if (permissionCache.has(key)) {
    return permissionCache.get(key)
  }

  const result = await api.checkPermission(key)
  permissionCache.set(key, result)
  return result
}

// 使用
const handleDelete = withPermissionCheck({
  validate: async () => await getPermission('user:delete')
})(deleteUser)
```

如果需要更复杂的缓存逻辑（如 TTL），建议使用成熟的缓存库。

## 性能考虑

### 销分析

包装函数的开销主要来自：

- 异步函数调用：Promise 包装的开销很小（< 1ms）
- 类型检查：仅在编译时，无运行时开销
- 条件判断：几个 `if/else` 判断，开销可忽略

### 优化建议

_避免重复创建_：在组件外或 `useMemo` 中创建包装函数

```typescript
// ❌ 每次 render 都创建新函数
function Component() {
  const handleDelete = withPermissionCheck({ ... })(deleteUser);

  return <Button onClick={handleDelete}>删除</Button>;
}

// ✅ 在组件外创建
const handleDelete = withPermissionCheck({ ... })(deleteUser);

function Component() {
  return <Button onClick={handleDelete}>删除</Button>;
}

// ✅ 或使用 useMemo
function Component() {
  const handleDelete = useMemo(() => withPermissionCheck({ ... })(deleteUser), []);

  return <Button onClick={handleDelete}>删除</Button>;
}
```

_异步校验加缓存_：如上文提到的缓存方案

_批量校验_：对于需要多次校验的场景，可以批量获取权限

```typescript
const permissions = await api.batchCheckPermissions(['user:delete', 'user:edit', 'user:export'])

const handleDelete = withPermissionCheck({
  validate: () => permissions['user:delete']
})(deleteUser)
```

## 总结

本文介绍的 `withPermissionCheck` 工具函数，经过多轮实战和评审，在以下方面取得了平衡：

| 维度     | 设计决策                     | 权衡              |
| :------- | :--------------------------- | :---------------- |
| 类型安全 | 抛出 `PermissionDeniedError` | 保持类型契约完整  |
| 参数透传 | 使用 `Parameters`            | 灵活性 > 简洁性   |
| UI 解耦  | `showMessage` 配置项         | 通用性 > 默认行为 |
| 错误处理 | 分离权限错误和运行时错误     | 清晰度 > 统一性   |
| 异步化   | 统一返回 `Promise`           | 一致性 > 适配性   |

核心设计原则：优先保证类型安全和行为可预期，其次考虑灵活性和易用性。
