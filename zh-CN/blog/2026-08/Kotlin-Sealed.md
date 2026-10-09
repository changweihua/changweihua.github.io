---
lastUpdated: true
commentabled: true
recommended: true
title: 密封类比枚举好使在哪？Nothing 到底是个啥？
description: Kotlin 特殊类型篇
date: 2026-08-26 14:15:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

这一篇聊几个 Kotlin 里比较特殊的类型，它们各有各的用途，理解透了能让代码更优雅。

## 密封类：类型安全的「枚举升级版」 ##

### 为什么需要密封类 ###

枚举的局限：每个枚举常量只能有一个实例，无法携带不同数据。

```kotlin
// 枚举：所有实例都是单例，无法携带不同数据
enum class ExpressStatus {
    TO_BE_SHIPPED,
    IN_TRANSIT,  // ❌ 没法表示「在哪」
    SIGNED        // ❌ 没法表示「谁签收」
}
```

密封类的优势：子类可以是 `data class`，携带不同数据。

### 密封类基本用法 ###

```kotlin
sealed class ExpressStatus

// 无数据的单例
object ToBeShipped : ExpressStatus()

// 带数据的数据类
data class InTransit(val location: String) : ExpressStatus()
data class Signed(val receiver: String, val time: String) : ExpressStatus()
```

### 配合 `when` 使用：编译器自动检查 ###

这是密封类最大的价值——穷尽性检查：

```kotlin
fun showStatus(status: ExpressStatus) {
    when (status) {
        ToBeShipped -> println("待发货")
        is InTransit -> println("运输中：${status.location}")
        is Signed -> println("签收人：${status.receiver}")
        // 编译器保证覆盖了所有情况，不用写 else
    }
}
```

关键：如果漏掉任何一个子类，编译器直接报错。

### 实战：网络请求状态（最常用场景） ###

```kotlin
sealed class Result<out T> {
    object Loading : Result<Nothing>()
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String) : Result<Nothing>()
}

// ViewModel 中的用法
sealed class HomeUiState {
    object Loading : HomeUiState()
    data class Success(val banners: List<Banner>) : HomeUiState()
    data class Error(val msg: String) : HomeUiState()
}
```

## 枚举类：有限的选项 ##

### 基本用法 ###

```kotlin
enum class Color {
    RED, GREEN, BLUE
}

// 带属性和方法
enum class Status(val desc: String) {
    SUCCESS("成功"),
    FAILURE("失败"),
    LOADING("加载中");

    fun isSuccess() = this == SUCCESS
}
```

### 枚举的实用方法 ###

```kotlin
// 通过名字获取枚举值
val status = Status.valueOf("SUCCESS")

// 遍历所有枚举值
Status.values().forEach { println(it) }

// Kotlin 简化写法
enumValues<Status>().forEach { }

// 获取枚举名称和序号
status.name    // "SUCCESS"
status.ordinal // 0
```

## Pair 和 Triple：临时数据容器 ##

### Pair：两个数据 ###

```kotlin
// 创建方式
val pair1 = Pair("苹果", 5.5)
val pair2 = "苹果" to 5.5  // 中缀写法，更简洁

// 访问
pair.first   // "苹果"
pair.second  // 5.5

// 解构
val (name, price) = pair
```

### Triple：三个数据 ###

```kotlin
// 创建
val triple = Triple("张三", 25, true)

// 访问
triple.first   // "张三"
triple.second  // 25
triple.third   // true

// 解构
val (name, age, isVip) = triple
```

### 使用场景 ###

```kotlin
// 函数返回多个值
fun getUserInfo(): Pair<String, Int> {
    return "张三" to 25
}

val (name, age) = getUserInfo()
```

### ⚠️ 注意：优先用命名数据类 ###

Pair/Triple 属性名 first/second/third 没有业务含义，代码可读性差：

```kotlin
// ❌ 不推荐：可读性差
fun login(): Triple<String, Long, Boolean> {
    return Triple("token", 1001L, true)
}
val (token, userId, isVip) = login()

// ✅ 推荐：命名数据类
data class LoginResult(
    val token: String,
    val userId: Long,
    val isVip: Boolean
)
fun login(): LoginResult = LoginResult("token", 1001L, true)
val result = login()
```

什么时候用 Pair/Triple：

- 临时、局部使用，不对外暴露
- 数据简单，没有明确业务绑定
- 快速原型开发

## Nothing：永远不返回的类型 ##

### 是什么 ###

Nothing 是 Kotlin 的特殊类型，表示「永远不会有返回值」。

### 典型场景 ###

```kotlin
// 抛异常的函数
fun throwError(): Nothing {
    throw IllegalStateException("错误")
}

// TODO 函数的返回类型
val name: String = TODO("稍后实现")
```

### Nothing 的特点 ###

```kotlin
// 1. 没有实例
// val nothing = Nothing()  ❌ 编译报错

// 2. 是所有类型的子类型
val str: String = TODO()  // 可以，因为 Nothing 是 String 的子类型
val int: Int = TODO()     // 也可以
```

## 内联类：类型别名增强版 ##

```kotlin
// 类型别名：编译后是 String
typealias UserId = String

// 内联类：有类型安全，编译后是 String
@JvmInline
value class UserId(val value: String)
```

内联类的优势：类型安全 + 无性能损耗。

```kotlin
@JvmInline
value class UserId(val value: String)
@JvmInline
value class OrderId(val value: String)

fun getUser(id: UserId) { }
fun getOrder(id: OrderId) { }

// 编译器会检查类型
getUser(UserId("123"))    // ✅
getUser(OrderId("123"))   // ❌ 编译报错，类型不匹配
```

## 常见问题 ##

### Q：密封类和枚举怎么选？ ###

A：

- 选项有限、固定，且不需要携带不同数据 → 枚举
- 选项有限，但不同选项需要携带不同数据 → 密封类
- 需要穷尽性检查 → 密封类

### Q：密封类可以是 data class 吗？ ###

A：可以。密封类的子类可以是 data class，享受数据类的所有特性（equals、hashCode、toString、copy）。

## 总结 ##

| 类型 | 用途 | 特点 |
| :--- | :--- | :--- |
| 密封类 | 表示有限的、固定的几种类型 | 子类可带数据，配合 when 穷尽检查 |
| 枚举 | 表示有限的、固定的几项项 | 所有实例是单例 |
| Pair/Triple | 临时承载 2-3 个数据 | 属性无业务含义，临时场景用 |
| Nothing | 表示永远不返回 | 抛异常、TODO |
| 内联类 | 类型安全的类型别名 | 有类型检查，无性能损耗 |
