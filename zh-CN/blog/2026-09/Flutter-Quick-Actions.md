---
lastUpdated: true
commentabled: true
recommended: true
title: 为你的 App 增加桌面快捷方式
description: Flutter 实战：为你的 App 增加桌面快捷方式 (Quick Actions)
date: 2026-09-08 15:25:00
pageClass: blog-page-class
cover: /covers/flutter.svg
---

## 痛点 ##

最近在折腾一个 Flutter 项目时，我发现一个很有意思的现象：用户其实很少在 Home Screen（主页）停留。

大部分用户打开我的 App，目的性极强。他们不是为了看首页的资讯，而是想直接查看个人资料、检查订单状态，或者联系客服。但目前的流程是：打开 App -> 等待 Splash Screen -> 进入主页 -> 在菜单里找功能 -> 进入目标页面。

这中间的跳转步骤实在太多了。

我想到 微信、高德地图 或者 支付宝，这些主流 App 都有个很爽的功能：长按桌面图标，直接弹出几个快捷方式（Shortcuts），点一下就能直达特定功能。这虽然是个很小的细节，但对于高频使用的功能来说，能让 App 的质感瞬间提升一个档次。

我当时就在想，能不能给我的 Flutter 项目也加上这种“瞬移”功能？

## 实战 ##

经过研究，我决定使用 `quick_actions` 这个 Package。它的逻辑其实很简单，就是把原生系统的 Quick Actions 能力包装给了 Flutter。

### 引入依赖 ###

首先，在 `pubspec.yaml` 里把依赖加上：

```yml
dependencies:
  quick_actions: ^1.1.0
```

然后跑一下命令：

```bash
flutter pub get
```

### 初始化与路由跳转 ###

要在 App 启动时捕获用户的长按行为，我们需要在初始化时设置一个回调函数。

这里有个细节：因为用户长按图标启动时，App 的 `Navigator` 可能还没完全准备好，所以建议使用一个全局的 `navigatorKey` 来进行跳转，这样最稳妥。

```dart
// 假设你已经配置好了全局的 navigatorKey
final QuickActions quickActions = const QuickActions();

quickActions.initialize((shortcutType) {
  // 当用户点击快捷方式进入时，会回调这个方法，并返回定义的 type
  switch (shortcutType) {
    case 'dashboard':
      navigatorKey.currentState?.pushNamed('/dashboard');
      break;
    case 'profile':
      navigatorKey.currentState?.pushNamed('/profile');
      break;
    case 'support':
      navigatorKey.currentState?.pushNamed('/support');
      break;
  }
});
```

### 配置快捷入口 ###

接下来，我们需要定义到底要在桌面上显示哪几个快捷项。

```dart
await quickActions.setShortcutItems(<ShortcutItem>[
  const ShortcutItem(
    type: 'dashboard',
    localizedTitle: '控制面板',
    icon: 'ic_dashboard', // 注意：这里的 icon 名字要和原生资源文件对应
  ),
  const ShortcutItem(
    type: 'profile',
    localizedTitle: '个人资料',
    icon: 'ic_profile',
  ),
  const ShortcutItem(
    type: 'support',
    localizedTitle: '联系客服',
    icon: 'ic_support',
  ),
]);
```

### 适配原生图标 ###

这是最容易踩坑的地方。Quick Actions 的图标不是直接放 `assets` 文件夹里的，你需要把图标放入原生平台的资源目录中。

| 平台 | 资源存放路径 | 注意事项 |
| :--- | :--- | :--- |
| Android | `android/app/src/main/res/drawable` | 名字必须与 `ShortcutItem` 中的 `icon` 字段完全一致 |
| iOS | `Runner/Assets.xcassets` | 放在 `Asset Catalog` 中，直接引用名称即可 |

例如在 Android 端，你需要把 `ic_dashboard.png` 等文件放到 `drawable` 目录下。

## 进阶：动态快捷方式 ##

我发现 `quick_actions` 有个非常爽的功能：快捷方式不是死板的，它们是可以根据 App 的状态动态调整的。

比如我的 App 有登录状态：

- 未登录状态下：快捷方式显示 “登录”、“注册”。

- 已登录状态下：快捷方式变成 “我的订单”、“我的收藏”、“个人中心”。

这种做法能确保用户长按图标时，看到的永远是最相关的功能。

## 最后 ##

虽然增加 Quick Actions 不属于那种大动干戈的功能开发，但它对 用户体验 的提升是非常直观的。对于那些有高频入口需求的 App（比如金融、外卖、社交类），这几乎是标配。

*这里提醒大家注意几个点*：

- Android 需要 7.1 (API 25) 及以上版本才支持。

- 标题 `localizedTitle` 尽量短一点，不然在长按菜单里显示不全。

- 记得在 Android 发布构建时，确保 `drawable` 里的图标没有被 `resource shrinking` 混淆掉。

这种小功能的实现成本极低，但做完之后，你会发现 App 确实更像一个“原生”应用了。
