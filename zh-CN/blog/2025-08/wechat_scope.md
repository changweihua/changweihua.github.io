---
lastUpdated: true
commentabled: true
recommended: true
title: 小程序鉴权机制分析
description: 小程序鉴权机制分析
date: 2025-08-05 13:35:00 
pageClass: blog-page-class
cover: /covers/miniprogram.svg
---

## 开发者视角 ##

### 微信小程序授权机制 ###

微信的授权机制围绕“作用域（scope）”构建，开发者需针对不同权限向用户请求。

#### 关键权限与API ####

| 权限Scope ID  |  描述  |  核心API/组件  |   备注 |
| :-------: | :---------: | :--------: | :----------: |
| `scope.userLocation` | 地理位置 | `wx.getLocation`, `wx.chooseLocation` |  |
| `scope.camera` | 摄像头 | `<camera>` 组件 |  |
| `scope.record` | 麦克风录音 | `wx.getRecorderManager` |  |
| `scope.writePhotosAlbum` | 保存到相册 | `wx.saveImageToPhotosAlbum` |  |
| `scope.userInfo` | 用户信息 | `wx.getUserProfile`, `<button open-type="getUserInfo">` |  |
| `scope.address` | 通信地址 | wx.chooseAddress |  |

#### 核心API ####

- **wx.getSetting()**: 获取用户已做出的授权选择（同意、拒绝或未请求）。
- **wx.authorize()**: 主动发起授权请求，若用户已拒绝则直接失败，不重复弹窗。
- **wx.openSetting()**: 处理拒绝场景的关键。此API必须由用户点击触发，能直接打开小程序的授权设置界面，让用户手动重新开启权限。

**拒绝授权后的处理流程**：微信平台为处理“用户拒绝授权”提供了成熟的闭环方案：

1. 调用敏感API（如 `wx.getLocation`）失败后，进入 `fail` 回调。
2. 在回调中调用 `wx.getSetting()` 确认权限状态为 `false`（用户主动拒绝）。
3. 弹出一个自定义模态框（`wx.showModal`），向用户解释权限用途，并提供一个按钮。
4. 用户点击按钮后，调用 `wx.openSetting()`，引导用户去设置页手动开启。

### 抖音小程序授权机制 ###

抖音的授权机制是一种**被动触发**模式，其核心在于“先声明，后使用时触发”。

#### 核心授权流程 ####

- **在 `app.json` 中声明**: 开发者必须在 `app.json` 文件中使用 `requiredPrivateInfos` 字段声明需要用到的私有权限。这是一个字符串数组。

```json:app.json
       {
         "requiredPrivateInfos": [
           "scope.userLocation"
         ]
       }
```

- **调用功能API触发授权**: 当代码**首次**调用需要特定权限的功能性API时（如 `tt.chooseLocation`），系统会自动弹出授权对话框。授权请求并非由一个独立的 `tt.authorize` API 触发。

- **检查与引导**:

  - `tt.getSetting()`: 用于检查用户当前的授权状态（`true` 表示已授权，`false` 表示曾拒绝，`undefined` 表示从未请求）。
  - `tt.openSetting()`: 如果 `tt.getSetting` 返回的状态为 `false`，则需要引导用户通过点击按钮来调用此API，打开设置页手动开启权限。

> 拒绝授权后的处理流程处理逻辑与微信相似，同样依赖 `tt.openSetting`。

1. 功能API（如 `tt.chooseLocation`）调用失败。
2. 调用 `tt.getSetting` 确认 `authSetting['scope.userLocation']` 为 `false`。
3. 在UI上提供一个按钮（如“去开启定位”），解释原因。
4. 用户点击按钮，触发 `tt.openSetting` 事件，打开设置页。

## 核心差异对比 ##

| 对比维度  |  微信小程序  |  抖音小程序  |   备注 |
| :-------: | :---------: | :--------: | :----------: |
| 核心设计 | 显式授权：API驱动，程序化控制 | 被动授权：功能调用时隐式触发 |  |
| 权限声明 | `app.json` 中配置 `permission` 对象，用于说明用途 | 必须在 `app.json` 的 `requiredPrivateInfos` 数组中预先声明 |  |
| 授权触发 | 调用 `wx.authorize API` | 首次调用具体功能API（如 `tt.chooseLocation`） |  |
| 拒绝后重授权 | 提供清晰的 `wx.openSetting` 闭环方案 | 同样提供 `tt.openSetting`，逻辑一致 |  |
| 地理位置缓存 | 授权一次后，持续有效 | 授权一次后，持续有效 |  |

## 最佳实践建议 ##

- **遵循“需要时再申请”原则**: 避免在小程序启动时一次性请求所有权限。在用户真正需要使用特定功能（如扫码、定位）时再触发授权请求，可以显著提升授权成功率。
- **提供备选方案（兜底方案）**: 必须为用户拒绝授权的场景设计替代方案。例如，用户拒绝位置授权时，应提供手动选择城市的功能，而不是简单地中断流程或显示错误。

## 开发者注意事项与陷阱 ##

- **`openSetting`的调用限制**: 无论是微信还是抖音，`openSetting` 都必须由用户的主动点击行为（如 `<button>` 的点击事件）触发，不能在代码中直接调用。否则将调用失败。
- **抖音权限的强制声明**: 在抖音小程序中，如果忘记在 `app.json` 的 `requiredPrivateInfos` 数组中声明某个权限，相关的API将完全无法被调用，甚至不会弹出授权提示。这是最常见的错误之一。
- **授权状态缓存**: 两大平台都会缓存用户的授权结果。一旦用户拒绝某项权限，在他们手动开启或小程序被删除重装之前，直接调用授权API会一直触发 `fail` 回调，不会再次弹出系统授权框。开发者必须依赖 `getSetting` 来判断此状态，并转而引导用户进入设置页。
