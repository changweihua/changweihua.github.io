---
lastUpdated: true
commentabled: true
recommended: true
title: Kotlin 协程
description: 别再写回调地狱了，用协程让异步代码像同步一样爽
date: 2026-08-26 13:05:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

协程是 Kotlin 异步编程的核心，也是现在 Android 开发必学的技能。这篇文章帮你从零搞懂协程的核心概念和实战用法。

## 协程是什么 ##

协程是一种「轻量级线程」，让异步代码看起来像同步代码。

对比传统异步方案：

```kotlin
// Java 回调地狱
api.getUser(object : Callback {
    override fun onSuccess(user: User) {
        api.getOrders(user.id, object : Callback {
            override fun onSuccess(orders: List<Order>) {
                api.getProducts(orders, object : Callback {
                    override fun onSuccess(products: List<Product>) {
                        // 终于拿到了
                    }
                })
            }
        })
    }
})

// Kotlin 协程：像写同步代码一样
suspend fun loadData() {
    val user = api.getUser()
    val orders = api.getOrders(user.id)
    val products = api.getProducts(orders)
    // 搞定！
}
```

## 核心概念 ##

### 挂起函数 ###

suspend 修饰的函数可以「暂停」执行，不阻塞线程：

```kotlin
// 挂起函数
suspend fun fetchUser(): User {
    delay(1000)  // 模拟网络请求，暂停1秒
    return User("张三", 25)
}

// 调用
suspend fun loadData() {
    val user = fetchUser()  // 这里会暂停，但不会卡住线程
    println(user.name)      // 1秒后继续执行
}
```

注意：suspend 函数只能在协程或其他挂起函数中调用。

### CoroutineScope：协程作用域 ###

协程必须在作用域中启动，作用域决定协程的生命周期：

```kotlin
// Android 中常用的作用域
viewModelScope.launch { }     // ViewModel 销毁时取消
lifecycleScope.launch { }    // Activity/Fragment 销毁时取消
```

## 协程启动方式 ##

### launch：fire-and-forget ###

```java
// 最常用：不阻塞，异步执行，不需要返回值
viewModelScope.launch {
    val data = api.fetchData()
    _uiState.value = data
}
```

返回值：Job，可以用来取消协程。

```kotlin
val job = viewModelScope.launch {
    // 协程逻辑
}

// 取消协程
job.cancel()
job.join()  // 等待取消完成
```

async：返回结果

```kotlin
// 需要返回值时用 async
viewModelScope.launch {
    val user = async { api.fetchUser() }
    val orders = async { api.fetchOrders() }

    // await() 获取结果
    println(user.await().name)
    println(orders.await())
}
```

runBlocking：测试用

```kotlin
fun main() = runBlocking {
    // 阻塞当前线程
    val result = async { fetchData() }
    println(result.await())
}
```

警告：不要在 Android 主线程使用 `runBlocking`，会导致 ANR。

## 并行请求：async 的价值 ##

### 串行 vs 并行 ###

```kotlin
// ❌ 串行：总耗时 = 1000 + 800 + 600 = 2400ms
viewModelScope.launch {
    val user = api.fetchUser()     // 1000ms
    val orders = api.fetchOrders() // 800ms
    val banners = api.fetchBanners() // 600ms
}

// ✅ 并行：总耗时 ≈ 1000ms（最慢那个）
viewModelScope.launch {
    val userDeferred = async { api.fetchUser() }
    val ordersDeferred = async { api.fetchOrders() }
    val bannersDeferred = async { api.fetchBanners() }

    val user = userDeferred.await()
    val orders = ordersDeferred.await()
    val banners = bannersDeferred.await()
}
```

### awaitAll：批量等待 ###

```kotlin
viewModelScope.launch {
    val (user, orders, banners) = awaitAll(
        async { api.fetchUser() },
        async { api.fetchOrders() },
        async { api.fetchBanners() }
    )
}
```

## 结构化并发 ##

协程的「结构化并发」特性保证：

- 子协程异常会导致父协程取消
- 父协程取消会自动取消所有子协程
- 页面销毁时自动清理所有协程

```kotlin
viewModelScope.launch {  // 父协程
    val user = async { api.fetchUser() }
    val orders = async { api.fetchOrders() }

    // 如果 fetchOrders 抛异常，fetchUser 也会被取消
}
```

## 异常处理 ##

### try-catch ###

```kotlin
viewModelScope.launch {
    try {
        val data = api.fetchData()
        _uiState.value = UiState.Success(data)
    } catch (e: Exception) {
        _uiState.value = UiState.Error(e.message ?: "未知错误")
    }
}
```

### CoroutineExceptionHandler ###

```kotlin
val handler = CoroutineExceptionHandler { _, exception ->
    Log.e("Coroutine", "未捕获异常", exception)
}

viewModelScope.launch(handler) {
    // 协程代码
}
```

## Dispatchers：线程切换 ##

```kotlin
viewModelScope.launch {
    // 默认在主线程

    withContext(Dispatchers.IO) {
        // 切换到 IO 线程执行耗时操作
        val data = api.fetchData()
    }

    // 自动切回主线程，继续执行
    _uiState.value = data
}
```

常用 Dispatchers：

| Dispatcher | 用途 |
| :--- | :--- |
| Main | 主线程，更新 UI |
| IO | IO 操作，网络、数据库 |
| Default | CPU 密集型计算 |

## 实战模板 ##

### 网络请求标准模板 ###

```kotlin
class HomeViewModel : ViewModel() {

    sealed class UiState {
        object Loading : UiState()
        data class Success(val data: List<String>) : UiState()
        data class Error(val msg: String) : UiState()
    }

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun loadData() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading

            try {
                val data = withContext(Dispatchers.IO) {
                    api.fetchData()
                }
                _uiState.value = UiState.Success(data)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "加载失败")
            }
        }
    }
}
```

### 并行请求模板 ###

```kotlin
fun loadHomePage() {
    viewModelScope.launch {
        try {
            val (user, orders, banners) = awaitAll(
                async(Dispatchers.IO) { api.fetchUser() },
                async(Dispatchers.IO) { api.fetchOrders() },
                async(Dispatchers.IO) { api.fetchBanners() }
            )

            _uiState.value = UiState.Success(user, orders, banners)
        } catch (e: Exception) {
            _uiState.value = UiState.Error(e.message ?: "加载失败")
        }
    }
}
```

## 常见问题 ##

### Q：launch 和 async 怎么选？ ###

A：

- 不需要返回值 → `launch`
- 需要返回值，或要并行执行 → `async`

### Q：协程会内存泄漏吗？ ###

A：使用 `viewModelScope` 或 `lifecycleScope` 不会，它们会在页面销毁时自动取消。不要用 `GlobalScope`。

### Q：协程和 RxJava 怎么选？ ###

A：新项目推荐协程，语法更简洁，生命周期管理更安全。老项目如果 RxJava 用得顺手，继续用也没问题。

## 总结 ##

| 概念 | 说明 |
| :--- | :--- |
| suspend | 挂起函数，可在不阻塞线程的情况下暂停 |
| launch | 启动协程，不返回结果 |
| async | 启动协程，返回 Deferred，可获取结果 |
| await() | 等待并获取 async 的结果 |
| awaitAll() | 等待多个 async 完成 |
| Dispatchers.IO | IO 线程，耗时操作 |
| Dispatchers.Main | 主线程，UI 操作 |
