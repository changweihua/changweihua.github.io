---
lastUpdated: true
commentabled: true
recommended: true
title: Compose 时代的 MVI 架构
description: 如何用单向数据流驱动复杂 UI？
date: 2026-08-20 11:25:00
pageClass: blog-page-class
cover: /covers/electron.svg
---

## 前言 ##

作为一名 Android 老兵，你一定对 *MVVM* 烂熟于心。但在 Compose 这种声明式 UI 环境下，随着业务逻辑的复杂度增加，MVVM 往往会暴露出一些痛点：多个 LiveData/Flow 散落在 ViewModel 中，UI 状态难以追踪，甚至出现“状态碎片化”。

为了解决这些问题，*MVI (Model-View-Intent)* 架构逐渐成为了 Compose 开发者的首选。它不仅是响应式编程的终极体现，更是与 Compose 的单向数据流（UDF）天生一对。

今天，我们就来实战拆解如何构建一套工业级的 MVI 架构。

## MVI 的三根支柱 ##

MVI 的核心思想是将 UI 的所有交互抽象为一个闭环的单向流动：

- ViewState (State)：UI 的唯一真实来源。它是一个包含页面所有数据的不可变对象（Data Class）。
- Intent (Action/Event)：用户的每一个动作。比如：点击刷新、输入搜索词。
- Side Effect (Effect)：一次性事件。比如：弹出 SnackBar、页面跳转、播放提示音。

## 核心实现：Flow 与 ViewModel 的联姻 ##

在 Kotlin 协程时代，我们利用 `StateFlow` 和 `SharedFlow` 来实现 MVI 的闭环。

### 定义状态与意图 ###

```java
// 页面状态
data class UserViewState(
    val isLoading: Boolean = false,
    val users: List<User> = emptyList(),
    val error: String? = null
)

// 用户动作
sealed class UserIntent {
    object LoadUsers : UserIntent()
    data class OnUserClick(val userId: String) : UserIntent()
}

// 一次性效果
sealed class UserEffect {
    data class ShowToast(val message: String) : UserEffect()
}
```

### 构建 ViewModel 的大脑 ###

```java
class UserViewModel : ViewModel() {
    // 唯一状态暴露源
    private val _viewState = MutableStateFlow(UserViewState())
    val viewState = _viewState.asStateFlow()

    // 一次性事件通道
    private val _effect = Channel<UserEffect>()
    val effect = _effect.receiveAsFlow()

    // 处理意图
    fun onIntent(intent: UserIntent) {
        when (intent) {
            is UserIntent.LoadUsers -> loadData()
            is UserIntent.OnUserClick -> { /* 处理点击 */ }
        }
    }

    private fun loadData() {
        viewModelScope.launch {
            _viewState.update { it.copy(isLoading = true) }
            // 执行网络请求...
            _viewState.update { it.copy(isLoading = false, users = result) }
        }
    }
}
```

## UI 端的消费：状态提升 (State Hoisting) 的极致 ##

在 Compose 页面中，消费逻辑变得极其整洁：

```java
@Composable
fun UserScreen(viewModel: UserViewModel) {
    // 1. 将 Flow 转换为 Compose State
    val state by viewModel.viewState.collectAsStateWithLifecycle()

    // 2. 处理一次性 Effect
    LaunchedEffect(Unit) {
        viewModel.effect.collect { effect ->
            when (effect) {
                is UserEffect.ShowToast -> { /* 显示弹窗 */ }
            }
        }
    }

    // 3. 渲染 UI
    UserContent(
        state = state,
        onIntent = { viewModel.onIntent(it) } // 所有的回调都聚合为一个出口
    )
}
```

## MVI 带来的架构红利 ##

*状态可回溯*：由于整个页面的状态都缩减在一个 `ViewState` 对象中，你可以轻松地打印出状态变化日志，甚至实现“时光倒流（Time Travel）”式的调试。

*UI 纯净化*：UI 组件不再需要感知复杂的业务判断，它只需要读取 `state` 里的值。这极大地提升了 Compose 组件的可测试性和在 Preview 里的表现。

*并发安全*：利用协程的 `update` 原子操作，可以完美避开多线程修改 UI 状态导致的竞态条件（Race Condition）。

## 给开发者的架构建议 ##

*不要过度抽象*：如果一个简单的页面只有一个开关按钮，强行上 MVI 反而会增加样板代码。MVI 适合业务逻辑复杂、状态繁多的核心页面。

*ViewState 的粒度控制*：如果页面巨大，建议将状态拆分为多个子状态，避免因为一个无关紧要的小状态改变（比如倒计时）导致整个页面的 Composable 函数重组。

*结合 KMP 使用*：MVI 的 Model (State) 和 Intent 逻辑完全可以下沉到 KMP 的 `commonMain`。这意味着你的 Android 和 iOS 可以共享完全相同的业务状态机。

## 结语 ##

MVI 不是为了复杂而复杂，它是为了在大规模应用中保持逻辑的清晰与确定。掌握了 MVI，你就掌握了声明式 UI 架构的精髓，真正实现了“数据驱动开发”。
