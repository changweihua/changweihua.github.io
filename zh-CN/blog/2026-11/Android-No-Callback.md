---
lastUpdated: true
commentabled: true
recommended: true
title: 不要再主动设计 Callback 接口
description: 现代 Android 架构指南
date: 2026-11-19 08:35:00
pageClass: blog-page-class
cover: /covers/android.svg
---

项目已经完全协程化，Flow 也用了三年。

有一天，讨论一个持续接收数据的接口时，一位工作十年、已经用了三年 Flow 的同事忽然提议：

> “我们设计一个回调接口吧？”

我愣了三秒。

那一刻我意识到：技术分享不等于设计习惯真的改变了。技术用得久，不代表真的理解了它背后的设计思想；写过很多 Flow，也不等于知道什么时候该用它。

> 现代 Android 开发中，当项目已经全面采用 Kotlin 协程和 Flow，我们为什么还要习惯性地重新设计 Callback 接口？

我的观点很明确：

*对于应用内部的业务接口和数据访问接口，不要再把 `Callback` 当作默认设计方案。一次性操作优先使用 `suspend`，持续数据优先考虑 `Flow` 体系。*

这不是要消灭 Callback，而是要改变我们设计接口时的第一反应。

## 先区分一次性操作和持续数据流 ##

不同的异步操作，适合不同的接口。

如果操作最终返回一个结果，例如加载一条消息、提交订单或查询车辆信息，Kotlin 中通常可以用 `suspend` 函数表达：

```java
interface MessageRepository {
    suspend fun getMessage(id: String): Message
}
```

如果调用方需要持续接收数据变化，例如不断到来的消息、车辆挡位变化或网络状态，则可以考虑用 Flow 表达：

```java
interface MessageRepository {
    fun observeMessages(): Flow<Message>
}
```

简单来说：

- `suspend` 函数表达一次异步操作及其结果。
- `Flow<T>` 表达一个可以被收集的异步数据流。

Android 官方的协程最佳实践也建议，数据层和业务层可以用 `suspend` 函数执行一次性操作，用 `Flow` 通知数据变化。

这里需要明确一点：`Flow` 并不只适用于无限的数据流，有限的数据序列同样可以使用它表达。

我们要做的不是把所有接口都改成 `Flow`，而是根据操作的实际语义选择接口。

## 为什么现代 Android 开发不应该再习惯性地设计 Callback？ ##

在 Android 项目里，我们经常会设计这样的接口：

```java
interface MessageListener {
    fun onMessageReceived(message: Message)
}

interface MessageRepository {
    fun registerListener(listener: MessageListener)
    fun unregisterListener(listener: MessageListener)
}
```

当消息到达时，Repository 调用 `onMessageReceived()` 通知上层处理。

这种设计没有错。Callback 是成熟的设计方式。Android 系统 API、第三方 SDK 和许多底层框架都在使用它。

问题在于：*底层 API 使用 Callback，不代表应用内部也必须继续使用 Callback*。

假设我们的项目已经全面采用 Kotlin 协程，Repository 也已经使用 Flow 向上层提供数据。

此时，如果每次遇到持续数据，我们仍然下意识地设计：

- 一个 Listener 接口；
- 一个注册方法；
- 一个注销方法；
- 一套回调线程处理逻辑；
- 一套监听器生命周期管理逻辑。

那么，我们实际上是在应用内部重新设计一套异步编程模型。

而这些工作，未必是业务调用方真正需要关心的。

对于一个持续变化的数据源，调用方更关心的是：

*我要消费什么数据，以及这些数据代表什么。*

所以，与其设计：

```java
interface MessageRepository {
    fun registerListener(listener: MessageListener)
    fun unregisterListener(listener: MessageListener)
}
```

不如优先考虑：

```java
interface MessageRepository {
    fun observeMessages(): Flow<Message>
}
```

调用方通过收集 `Flow` 接收消息，不必直接依赖 `Listener` 类型和注册方式。

这就是我不建议在现代 Android 应用内部习惯性设计 Callback 的原因。

不是 Callback 不好，而是我们已经有了更适合 Kotlin 异步编程模型的接口选择。

## Callback 和 Flow，真正的区别是什么？ ##

我认为，Callback 和 Flow 一个重要的区别，在于 *Flow 能够自然地融入 Kotlin 协程的结构化并发模型*。

先看一个传统的 Callback 接口：

```java
interface MessageListener {
    fun onMessageReceived(message: Message)
}

interface MessageRepository {
    fun registerListener(listener: MessageListener)
    fun unregisterListener(listener: MessageListener)
}
```

调用方需要注册监听器，接收消息，并在适当的时候注销监听器。

问题在于，监听器的生命周期和调用方的协程生命周期，并没有天然的关联。

例如，页面退出了，收集数据的业务逻辑已经不再需要运行，但底层 Listener 可能仍然注册着。如果没有显式注销，就可能继续接收消息，甚至造成资源泄漏。

当然，Callback 并非无法解决这个问题。我们可以手动管理注册和注销，也可以将监听器绑定到生命周期组件。

但这意味着，我们需要额外建立一套资源管理机制。

再看 Flow：

```java
interface MessageRepository {
    fun observeMessages(): Flow<Message>
}
```

调用方可以这样消费数据：

```java
viewModelScope.launch {
    repository.observeMessages().collect { message ->
        handleMessage(message)
    }
}
```

当 `viewModelScope` 被取消时，收集 Flow 的协程也会被取消。对于遵循协程取消协议的 Flow，上游的数据处理也会随之取消。

如果底层是通过 `callbackFlow` 适配的 Callback，还可以在 `awaitClose` 中注销底层监听器。

```java
fun observeMessages(): Flow<Message> = callbackFlow {
    val listener = object : MessageListener {
        override fun onMessageReceived(message: Message) {
            trySend(message)
        }
    }

    messageSdk.registerListener(listener)

    awaitClose {
        messageSdk.unregisterListener(listener)
    }
}
```

这样，底层仍然使用 Callback，但监听器的清理可以与 Flow 收集的取消关联起来。

这就是 Flow 在现代 Kotlin Android 开发中的重要价值之一：它不仅表达持续数据，还可以让数据的消费、取消和资源清理融入协程的生命周期管理。

真正值得改变的是我们的设计习惯。

当一个项目已经全面采用 Kotlin 协程时，面对持续数据，我们应该优先考虑 Flow，而不是习惯性地再设计一套 Listener、注册方法和注销方法。

*Flow 的价值不只是让接口看起来更现代，而是让持续数据的消费方式与协程的结构化并发模型更自然地结合起来。*

## 以车辆挡位监听为例 ##

以 AAOS 车辆挡位为例。底层的 `CarPropertyManager`（CPM）可以通过 `CarPropertyEventCallback` 通知属性变化。

如果车辆属性的获取属于数据访问职责，就可以由数据层封装 CPM，并向上层提供符合业务需要的接口。

例如：

```java
interface CarRepository {
    fun observeGear(): Flow<Int>
}
```

调用方通过接口消费挡位数据，不必直接依赖 CPM 的回调类型。

底层继续使用 Callback，应用内部则使用 Flow。

这才是我们希望建立的边界。

## 在数据层把 Callback 转换成 Flow ##

Repository 可以使用 `callbackFlow` 将 CPM 的回调适配为 Flow：

```java
class CarRepositoryImpl(
    private val carPropertyManager: CarPropertyManager
) : CarRepository {

    override fun observeGear(): Flow<Int> = callbackFlow {
        val callback =
            object : CarPropertyManager.CarPropertyEventCallback {
                override fun onChangeEvent(
                    value: CarPropertyValue<*>
                ) {
                    if (
                        value.propertyId ==
                        VehiclePropertyIds.GEAR_SELECTION
                    ) {
                        val gear = value.value as? Int
                            ?: return
                        trySend(gear)
                    }
                }

                override fun onErrorEvent(
                    propertyId: Int,
                    areaId: Int
                ) {
                    // 根据接口设计传递错误、记录日志或结束流
                }
            }

        // 按 CPM API 要求注册 callback。

        awaitClose {
            // 注销刚才注册的同一个 callback。
        }
    }
}
```

这段代码省略了具体 CPM 注册参数、初始化检查、线程约束和错误处理。实际实现需要根据使用的 Android API 和项目要求补齐。

`callbackFlow` 适用于把多次触发的回调 API 转成 Flow。

它是冷流：每次开始收集时，构建代码都会执行；收集取消时，`awaitClose` 中的清理逻辑会运行。

## 根据数据语义选择 Flow 类型 ##

`Flow`、`StateFlow` 和 `SharedFlow` 都能传递数据，但语义不同。

### 持续事件 ###

如果每次到来的值都代表一个独立事件，例如不断接收的 IM 消息，可以用 `Flow<Message>`，或在需要广播事件时根据具体需求考虑 `SharedFlow`。

需要提前决定：没有消费者时，事件是否可以丢失？是否需要缓存或重放？

### 当前状态 ###

如果调用方需要知道“现在是什么值”，例如当前挡位或网络连接状态，`StateFlow` 往往更合适。

它始终持有一个当前值，新订阅者可以读取最新状态。

不过，`StateFlow` 会合并相等的连续值。如果每次变化都必须作为独立事件被处理，就不能不加分析地用它替代事件流。

### 一次性操作 ###

如果调用方执行一次操作并等待一个结果，例如根据 ID 加载一条消息，可以用 suspend 函数，而不是为了统一接口把结果包装成流。

选择类型时，应先确定要表达的行为，再选择对应的 API。

不要只因为它们都能传递数据，就把它们当成可以随意替换的类型。

## 统一应用接口 ##

一个应用中可能有多种数据来源：

- IM 消息由第三方 SDK 的 Listener 提供；
- 车辆挡位由 AAOS CPM Callback 提供；
- 网络状态由系统回调提供；
- 数据库查询由 Room Flow 提供。
- 数据层可以把这些来源转换成符合应用需要的接口：

```java
interface MessageRepository {
    fun observeMessages(): Flow<Message>
}

interface CarRepository {
    fun observeGear(): Flow<Int>
}

interface NetworkRepository {
    fun observeNetworkState(): Flow<NetworkState>
}
```

底层的 IM SDK 和 CPM 仍然可以使用 Callback；Room 也可以继续直接提供 Flow，不需要为了统一而额外套上 `callbackFlow`。

应用要统一的是调用方使用数据的契约，而不是底层实现技术。

也就是说，我们不需要强迫所有底层 API 都使用 Flow。

我们需要做的是，在合理的架构边界内，把不同来源的数据转换成适合应用内部消费的形式。

这既保留了底层实现的灵活性，也减少了业务模块对具体异步机制的依赖。

## 核心是改变接口设计的第一反应 ##

在现代 Kotlin Android 应用中，我更倾向于采用这样的默认选择：

> 一次性异步操作优先用 `suspend` 表达；持续数据变化优先用 Flow 体系表达；底层 Callback 则在适配层按需转换。

这个选择只是起点。

我们还需要根据数据是状态还是事件、消费者如何共享数据、采集何时开始和结束，来设计具体接口和资源管理方式。

对于一个只服务于局部场景的简单回调，没有必要为了形式统一强行改造。

对于持续变化且需要被多个上层调用方消费的数据，则可以优先考虑在数据层提供 Flow 接口。

我真正反对的，是在一个已经全面采用 Kotlin 协程的项目里，每当遇到异步需求，就下意识地再设计一个 Callback 接口。

因为接口不仅决定调用方怎么调用，还决定了团队需要维护什么样的异步编程模型。

如果项目已经有了统一的协程模型，就应该尽量让应用内部的接口与它保持一致，而不是不断引入新的抽象，增加不必要的复杂度。
