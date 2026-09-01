---
lastUpdated: true
commentabled: true
recommended: true
title: Kotlin inline/reified
description: 高阶函数的隐藏开销，你真的懂吗？
date: 2026-08-26 14:10:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

刚学 Kotlin 的时候，我觉得 `inline` 没什么用，不就是加个关键字吗？直到我遇到高阶函数的性能问题，才发现 `inline` 是 Kotlin 优化的大杀器。今天把这个讲清楚。

## 高阶函数的问题：Lambda 的开销 ##

在说 `inline` 之前，先搞明白高阶函数（参数或返回值是函数的函数）有什么问题：

```kotlin
// 高阶函数：参数是另一个函数
fun executeTwice(action: () -> Unit) {
    action()
    action()
}

// 调用
executeTwice {
    println("Hello")
}
```

问题在哪：每次调用都要创建一个 Lambda 对象，频繁调用就会产生大量临时对象，增加 GC 压力。

## inline 的作用：把代码直接抄过来 ##

inline 的本质就是：编译时把函数体直接复制到调用处，避免创建 Lambda 对象。

```kotlin
// 加了 inline
inline fun executeTwice(action: () -> Unit) {
    action()
    action()
}

// 调用处编译后会变成这样（伪代码）：
fun callSite() {
    // action() 的代码直接内联到这里
    println("Hello")
    // action() 的代码再次内联
    println("Hello")
}
```

没有额外对象创建，没有函数调用开销，性能和手写代码一样。

## Android 开发中 inline 的实际应用 ##

### 场景1：扩展函数优化 ###

```kotlin
// 普通写法
fun Context.showToast(message: String) {
    Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
}

// inline 写法（推荐）
inline fun Context.showToast(message: String) {
    Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
}
```

每次调用 `showToast()` 都会创建临时对象？不存在的，代码直接内联，零开销。

### 场景2：条件判断工具函数 ###

```kotlin
inline fun View.visibleIf(condition: Boolean) {
    visibility = if (condition) View.VISIBLE else View.GONE
}

// 使用
binding.tvTitle.visibleIf(!isEmpty)
binding.progressBar.visibleIf(isLoading)
```

每次 `visibleIf` 调用都创建 Lambda 对象？inline 后就是普通的 `if-else` 语句，性能一样。

## reified：泛型具体化 ##

reified 是 inline 的最佳拍档，解决了一个老大难问题：Java/Kotlin 的泛型擦除。

### 泛型擦除是什么 ###

你写 `List<String>`，运行时系统只知道这是个 List，不知道里面装的是 String。类型信息被"擦除"了。

```kotlin
// 编译后，泛型信息丢失
inline fun <T> getTypeName(): String {
    // ❌ 编译报错：无法获取泛型 T 的具体类型
    return T::class.java.name
}
```

### reified 让泛型"具体化" ###

```kotlin
// 加了 reified：运行时也能获取泛型类型
inline fun <reified T> getTypeName(): String {
    return T::class.java.name  // ✅ 正常工作
}

// 使用
val name = getTypeName<String>()  // 输出：java.lang.String
val num = getTypeName<Int>()       // 输出：java.lang.Integer
```

注意：`reified` 必须和 `inline` 一起用！因为只有内联后，编译器才知道具体类型是什么。

## inline + reified 实战三剑客 ##

### 剑客1：Activity 启动 ###

```kotlin
// 定义工具函数
inline fun <reified T : Activity> Context.startActivity(
    noinline block: Intent.() -> Unit = {}
) {
    val intent = Intent(this, T::class.java)
    intent.block()
    startActivity(intent)
}

// 使用：不用写 ::class.java，不用 new Intent
startActivity<DetailActivity>()
startActivity<DetailActivity> {
    putExtra("news_id", newsId)
    putExtra("from", "首页")
}
```

对比传统写法：

```kotlin
// 传统写法
val intent = Intent(this, DetailActivity::class.java)
intent.putExtra("news_id", newsId)
startActivity(intent)
```

代码量直接少一半！

### 剑客2：Gson JSON 解析 ###

```kotlin
// 定义解析函数
inline fun <reified T> Gson.fromJson(json: String): T {
    return fromJson(json, T::class.java)
}

// 使用：不用写 TypeToken
val gson = Gson()
val news = gson.fromJson<News>(jsonString)
val list = gson.fromJson<List<News>>(jsonArrayString)
```

对比传统写法：

```kotlin
// 传统写法：TypeToken 写死人
val type = object : TypeToken<List<News>>() {}.type
val list: List<News> = gson.fromJson(jsonString, type)
```

### 剑客3：类型判断 ###

```kotlin
// 定义类型判断函数
inline fun <reified T> Any?.takeIfIs(): T? {
    return this as? T
}

// 使用
val result: String? = data.takeIfIs<String>()
val user: User? = data.takeIfIs<User>()
```

## noinline：部分参数不内联 ##

有时候高阶函数有多个 Lambda 参数，但只想内联其中一个，另一个需要作为对象传递（比如赋值给变量、延迟调用）：

```kotlin
inline fun execute(
    first: () -> Unit,
    noinline second: () -> Unit  // 这个不会被内联
) {
    first()  // 内联
    val lambda = second  // ✅ 可以赋值给变量
    lambda()  // 正常函数调用
}
```

使用场景：需要把 Lambda 保存起来后续使用时加 noinline。

## crossinline：禁止 return 的 Lambda ##

正常情况下，inline 函数里的 Lambda 可以 return，但有时候这会导致问题：

```kotlin
inline fun runOnUI(block: () -> Unit) {
    Handler(Looper.getMainLooper()).post {
        block()  // 这里的 return 会跳到哪里？
    }
}

// 调用处
runOnUI {
    return  // ❌ 危险：这个 return 会跳出外层函数，不是只退出 Lambda
}
```

用 crossinline 禁止 Lambda 内里的 return：

```kotlin
inline fun runOnUI(crossinline block: () -> Unit) {
    Handler(Looper.getMainLooper()).post {
        block()  // ✅ 这里的 return 只退出 Lambda，不影响外层
    }
}

// 调用处
runOnUI {
    // return 这里只退出 Lambda，安全
    if (!isActive) return
    updateUI()
}
```

## inline 的注意事项 ##

- 不要内联太大的函数：代码膨胀严重
- 不要内联有复杂控制流的函数：如递归、try-catch 嵌套
- 不要内联有大量代码的函数：会增加 APK 包体积
- inline 适合工具函数：短小精悍的那种

## 常见问题解答 ##

*Q：inline 这么好，是不是所有函数都加 inline？*

A：不是。inline 主要优化 Lambda 参数的开销，没有 Lambda 参数的函数加 inline 没意义，反而会增加包体积。

*Q：reified 一定要 inline 吗？*

A：必须一起用。reified 的原理就是利用 inline 时的类型擦除补偿机制。

*Q：inline 会增加包体积吗？*

A：会。如果函数体很大，重复内联会导致代码膨胀。inline 适合小函数，复杂逻辑别加。

