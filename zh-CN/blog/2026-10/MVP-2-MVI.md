---
lastUpdated: true
commentabled: true
recommended: true
title: 从 MVP 到 MVI，从 Java 到 Kotlin
description: 老项目升级的避坑指南
date: 2026-10-29 09:35:00
pageClass: blog-page-class
cover: /covers/android.svg
---

去年这个时候，我接手了一个祖传 Android 项目。代码量不大，但 `Presenter` 里塞满了 `View` 的空判断，`Activity` 里飘着 `Handler` 和 `AsyncTask` 的幽灵，Java 文件里偶尔冒出几行 Kotlin 代码像补丁一样贴在那里。业务要加新功能，可每次改动都像在雷区里跳舞。

于是我们决定做一次彻底的升级：*架构从 MVP 迁到 MVI，语言从 Java 切到纯 Kotlin*。

一年过去，项目顺利跑在新架构上，崩溃率降了，新同学上手速度也快了。但回头看，踩过的坑一个没少。这篇文章不讲教科书式的 MVI 原理，*只聊真实迁移过程中那些“早知道就好了”的事*。

## 先想清楚：你不是在“换框架”，是在“换思维方式” ##

MVP 和 MVI 最大的区别，不是 `Presenter` 改名叫 `ViewModel`，而是*数据流动的方向变了*。

在 MVP 里，`Presenter` 持有 `View` 接口，用户点击按钮 → Presenter 调 View 的方法显示 Loading → 请求回来 → Presenter 再调 View 的方法刷新列表。这是一个*双向的、命令式的*过程。你的代码里到处都是 `if (view != null)` 和 `view.showLoading()`。

MVI 把这一切倒过来：用户点击按钮 → 发出一个 `Intent` → `ViewModel` 处理意图 → 生成一个新的 `State` → UI 观察到 State 变化 → 重新渲染。*UI 永远是被动的，它只做一件事：根据 State 画界面*。

这意味着，你不能再在 `Activity` 里写 `adapter.addData(newItem)` 这种命令式代码了。所有 UI 变化必须走“发意图 → 改状态 → 观察状态”这条链路。*如果你团队里有人习惯在回调里直接操作 View，迁移到 MVI 后他会非常痛苦*。

所以第一步不是动代码，是*统一认知*。找一个下午，把团队拉到白板前，画清楚旧数据流和新数据流的区别。让大家明白：以后没有 `view.showToast()` 了，toast 要么是一个 `Event`，要么是 `State` 里的一个字段。

## Kotlin 迁移：别信任自动转换，尤其是空安全 ##

从 Java 到 Kotlin，Android Studio 的 `Code → Convert Java File to Kotlin File` 很好用。但它*生成的代码只是“能编译的 Kotlin”，不是“好的 Kotlin”*，更不是“安全的 Kotlin”。

最典型的坑是*平台类型*。Java 的 `String` 到了 Kotlin 里变成 `String!`，编译器不强制你判空。如果你直接把它当非空用，运行时该 NPE 还是 NPE，只是堆栈里变成了一行 Kotlin 代码，反而更难定位。

我们的做法是：*转换后的文件，必须手动过一遍，把每个来自 Java 的返回值显式声明为可空或非空*。宁可多写一个 `?`，也不要让平台类型在代码里裸奔。`@Nullable` / `@NonNull` 注解在 Java 侧补全，Kotlin 转换时才能生成正确的类型。

另一个容易忽略的是*默认参数与 Java 互操作*。Kotlin 的 `fun foo(a: Int, b: String = "x")` 对 Java 调用方不友好，因为 Java 没有默认参数。如果你的旧 Java 代码还要调这些新 Kotlin 方法，记得加 `@JvmOverloads`。

还有静态方法与伴生对象。Java 的 `static` 在 Kotlin 里是 `companion object`，但如果你在 Java 代码里调 `MyClass.INSTANCE.foo()` 会显得很蠢。用 `@JvmStatic` 标注伴生对象的方法，Java 侧就能像调静态方法一样调用它。

*建议的迁移节奏*：先迁*模型类和工具类*（无状态、依赖少、风险低），再迁*Repository*，最后动 *Presenter* / *View* 层。新写的代码一律用 Kotlin，旧代码按模块逐步替换。两边混跑一段时间完全没问题，Gradle 会自动处理混编。

## MVP 的 Presenter 转 MVI 的 ViewModel：最难的是“拆状态” ##

这是整个迁移中最耗时的部分，没有捷径。

一个典型的 MVP Presenter 可能是这样的：`showLoading()`、`hideLoading()`、`showList(list)`、`showError(msg)`、`showEmpty()`。这些方法调用分散在各个回调里，顺序靠人肉保证。

到 MVI 里，你需要把这些*离散的 UI 指令*收敛成一个*单一状态对象*：

```java
data class UserListState(
    val isLoading: Boolean = false,
    val users: List<User> = emptyList(),
    val errorMessage: String? = null,
    val isEmpty: Boolean = false
)
```

难点在于表达“互斥状态” 。旧代码里 `showLoading()` 和 `showError()` 可能被同时调用（因为不同回调没协调好），但在一个 `data class` 里，`isLoading = true` 和 `errorMessage != null` 同时存在就是逻辑 bug。用 `sealed class` 表达互斥状态会更安全：

```java
sealed interface UserListState {
    object Loading : UserListState
    data class Success(val users: List<User>) : UserListState
    data class Error(val message: String) : UserListState
    object Empty : UserListState
}
```

但 `sealed class` 的代价是不能方便地 `copy()` ，而 MVI 的 `StateFlow.update { it.copy(...) }` 非常依赖 `data class`。折中方案是：主 State 用 `data class`，内部用可空字段表达互斥，配合 `require` 或 `check` 在 `init` 里做校验。或者接受 `sealed class`，但把“加载更多”这类附加状态拆成独立的 `StateFlow`。

一个务实的建议：不要追求一步到位。第一版 MVI 可以保留一个 `data class`，字段稍微冗余一点，先跑通单向数据流。等团队熟悉了，再逐步收紧状态约束。

## StateFlow 很好，但别把 Event 也塞进去 ##

MVI 教程通常只讲 `State`，但真实项目里一定会有*一次性事件*：Toast、导航、关闭页面、弹出 Dialog。这些东西的特点是：*消费一次就没了，不应该在屏幕旋转后重放*。

如果你把 `toastMessage` 放在 `State` 里，用户看到 Toast → 旋转屏幕 → `StateFlow` 重放最新值 → Toast 又弹一次。这就是经典的*粘性事件问题*。

解决方案是状态和事件分流：

- *State*：用 `StateFlow`，持久，旋转后应该恢复。
- *Event*：用 `Channel` + `receiveAsFlow()`，消费即销毁，不重放。

```java
private val _events = Channel<UserListEvent>(Channel.BUFFERED)
val events = _events.receiveAsFlow()

// 发事件
viewModelScope.launch {
    _events.send(UserListEvent.ShowToast("保存成功"))
}
```

UI 侧用 `repeatOnLifecycle` 收集事件，确保只在 `STARTED` 以上状态消费：

```java
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.events.collect { event ->
            when (event) {
                is UserListEvent.ShowToast -> Toast.makeText(...).show()
                is UserListEvent.NavigateToDetail -> navigate(...)
            }
        }
    }
}
```

注意：`Channel` 是热流，如果 UI 还没开始收集就发了事件，事件会缓冲但不会丢（`BUFFERED` 模式下）。但如果事件发得太频繁而消费太慢，缓冲满了会挂起 `send`。对于低频事件（导航、Toast），`Channel` 完全够用。高频事件（比如每帧的滚动位置）根本不该用事件，应该归入 `State`。

## 协程：从“能用”到“用好”的距离 ##

Kotlin 协程是 MVI 的天然搭档，但 Java 转过来的同学最容易犯两个错。

*第一个错*：吞掉 `CancellationException`。在 `runCatching` 或 `try-catch` 里捕获了所有异常，包括协程取消时抛出的 `CancellationException`，然后把它当成普通错误显示给用户。结果是用户切走页面，协程被取消，UI 却弹出一个“网络错误”。正确的做法是在 catch 里先判断：`if (e is CancellationException) throw e`。

*第二个错*：不处理请求竞态。用户快速切换筛选条件，请求 A 和请求 B 并发发出，A 后返回覆盖了 B 的结果。MVP 时代这个问题也存在，但 MVI 的 `StateFlow` 让它更隐蔽——因为状态更新是异步的，你很难从 UI 上察觉。解决方案是*取消前一个任务*或用*请求序号标记*：

```java
private var searchJob: Job? = null

fun search(query: String) {
    searchJob?.cancel()
    searchJob = viewModelScope.launch {
        // ...
    }
}
```

如果底层数据源不支持协程取消（比如某些旧网络库），就给每次请求分配一个递增的 `requestId`，更新 State 前检查 `requestId` 是否仍然是最新的。

*第三个错（更隐蔽）* ：在 `viewModelScope` 里启动协程，但 `Repository` 的方法里又用了 `GlobalScope`。结果 `ViewModel` 清了，后台任务还在跑，回来试图更新一个已经销毁的 `State。统一作用域：ViewModel` 层用 `viewModelScope`，需要跨 ViewModel 生命周期的任务（比如写数据库）才下沉到 `Repository` 自己的 `scope`，并且明确谁负责取消。

## 渐进式迁移：让 MVP 和 MVI 在一段时间内共存 ##

老项目不可能一夜之间全改完。我们的策略是：新页面直接用 MVI + Kotlin 写，老页面保持 MVP 不动，中间通过导航和共享的 Repository 衔接。

好处是*风险可控*：新架构在小范围内验证，出问题不影响核心流程。坏处是*心智负担*：同一个人可能上午写 MVI 的 `Intent`，下午改 MVP 的 `Presenter`。我们的缓解办法是在项目根目录放一份 `ARCHITECTURE.md`，用一张图区分“新世界”和“旧世界”的边界，新代码 review 时严格检查是否走了单向数据流。

另一个经验是：*第一个迁移的模块不要选最核心的*。选一个中等复杂度、有明确输入输出的页面（比如“设置页”或“关于页”），用它来跑通 `Intent → State → UI` 的完整链路，确立代码风格和工具类（比如 `StateFlow` 的收集扩展、`Channel` 的事件封装）。等这套“模板”稳定了，再往核心模块推。Passbolt 团队在迁移时也提到，*前两个模块最慢，因为你在定义规则；之后每个模块都会变快*。

## 测试：Presenter 测试要重写，别想着省 ##

MVP 时代你可能写了不少 `PresenterTest`，用 Mockito mock 一个 `View` 接口，验证 `verify(view).showList(...)`。这些测试在 MVI 下全部作废。

MVI 的测试对象变成了 `ViewModel`，验证方式也变了：给 `ViewModel` 发一个 `Intent`，然后断言 `StateFlow` 的当前值符合预期。不需要 `mock View`，因为 `ViewModel` 根本不持有 `View` 的引用。

```java
@Test
fun `加载成功时状态变为 Success`() = runTest {
    val viewModel = UserListViewModel(FakeRepository(users = listOf(user)))
    viewModel.sendIntent(UserListIntent.Load)
    advanceUntilIdle()
    assertEquals(UserListState.Success(listOf(user)), viewModel.state.value)
}
```

这其实*更简单*了，因为不用再模拟 View 的各种回调时序。但代价是*旧的 Presenter 测试全部要重写*，没有自动转换工具。把这部分工时算进迁移计划里，别等到提测前才发现测试覆盖率掉了一大截。

## 最后：什么情况下不该迁 ##

说句实话，不是所有老项目都值得做这件事。

如果项目*已经进入维护期，半年没新功能*，迁移的收益很低。如果团队*只有一两个人熟悉 Kotlin 协程*，强行上 MVI 可能导致代码风格分裂。如果*核心模块深度依赖某个 Java 生态的库*（比如复杂的 JNI 封装），保持 Java 更稳妥。

MVI + Kotlin 确实让我们的代码更干净了：`Presenter` 里那些 `if (view != null)` 消失了，状态逻辑集中在一处，新同学看一个 State 类就能理解页面全貌。但代价是前期迁移的阵痛和团队学习曲线。如果你决定走这条路，先跑通一个页面，再复制经验。第一个页面花两周，第二个页面花三天，后面的就顺了。
