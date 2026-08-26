---
lastUpdated: true
commentabled: true
recommended: true
title: Kotlin 集合与序列
description: listOf 就完了？Sequence 懒加载才是大数据的救星
date: 2026-08-26 13:45:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

做 Android 开发这么多年，我见过太多人在集合处理上踩坑。明明数据结构很简单，却写得又臭又长，遍历-filter-map 一套下来手机直接卡死。

今天这篇文章，把集合和序列一次性讲透，让你的代码既简洁又高效。

## Kotlin 集合体系：先搞清这两个大类 ##

Kotlin 的集合分两大类，这个一定要搞清楚：

### 不可变集合：只读不写，线程安全 ###

```kotlin
// List：有序、可重复
val list = listOf("Android", "Kotlin", "Java")

// Set：无序、不可重复
val set = setOf("A", "B", "A")  // 结果：[A, B]，自动去重

// Map：键值对
val map = mapOf("name" to "张三", "age" to 25)
```

### 可变集合：可以增删改 ###

```java
// MutableList：可变列表
val mutableList = mutableListOf("Android", "Kotlin")
mutableList.add("Java")  // ✅ 可以添加
mutableList[0] = "Flutter"  // ✅ 可以修改

// MutableSet 和 MutableMap 同理
val mutableMap = mutableMapOf("name" to "张三")
mutableMap["age"] = 25  // 添加键值对
```

实战建议：优先用不可变集合 `listOf`，只有需要修改时才用 `mutableListOf`。这样代码更安全，意图更清晰。

## 常用集合函数：链式调用才是精髓 ##

Kotlin 给集合加了大量扩展函数，链式调用起来那叫一个爽：

```kotlin
val users = listOf(
    User("张三", 25, "北京"),
    User("李四", 30, "上海"),
    User("王五", 25, "北京"),
    User("赵六", 28, "深圳")
)

// 过滤 + 转换 + 分组，链式调用
val result = users
    .filter { it.age > 25 }  // 过滤年龄大于25的
    .sortedBy { it.name }    // 按名字排序
    .groupBy { it.city }     // 按城市分组

// 输出：{上海=[李四], 深圳=[赵六]}
```

## 常用函数速查 ##

| 函数 | 作用 | 示例 |
| :--- | :--- | :--- |
| `map` | 转换每个元素 | `list.map { it * 2 }` |
| `filter` | 过滤元素 | `list.filter { it > 3 }` |
| `flatMap` | 先转换再扁平化 | `list.flatMap { it.children }` |
| `reduce` | 聚合为单个值 | `list.reduce { acc, n -> acc + n }` |
| `groupBy` | 按条件分组 | `list.groupBy { it.category }` |
| `sortedBy` | 排序 | `list.sortedBy { it.age }` |
| `take` | 取前n个 | `list.take(5)` |
| `distinct` | 去重 | `list.distinct()` |

## Sequence：Iterable 的性能杀手 ##

这是今天的主角，很多人根本不知道 Sequence 的存在，导致代码在大数据量时卡成 PPT。

### 普通集合的致命问题：中间集合 ###

```java
// 你写的代码
(1..1000000)
    .filter { it % 2 == 0 }  // 第一步：生成50万个元素的集合
    .map { it * 2 }          // 第二步：再生成50万个元素的集合
    .take(10)                 // 第三步：再生成10个元素的集合
    .toList()
```

问题在哪：每一步都创建新的中间集合，100万数据要遍历3次，内存占用爆炸！

### Sequence 的解决方案：惰性执行 ###

```kotlin
// 加上 asSequence()
(1..1000000)
    .asSequence()
    .filter { it % 2 == 0 }  // 不执行，只记录
    .map { it * 2 }          // 不执行，只记录
    .take(10)                // 不执行，只记录
    .toList()                // 🔥 这里才开始执行！
```

原理：Sequence 是惰性的，中间操作不执行、不创建集合，只有碰到终止操作（如 `toList()`、`forEach()`）才一次性执行到底。而且是纵向执行——处理完一个元素再去处理下一个，找到10个就立刻停止，不会傻傻遍历全部100万数据。

### 性能对比实测 ###

```kotlin
fun main() {
    val count = 1_000_000

    // Iterable：耗时 20~60ms
    val r1 = (1..count).filter { it % 2 == 0 }.map { it * 2 }.take(10).toList()

    // Sequence：耗时 0~1ms
    val r2 = (1..count).asSequence().filter { it % 2 == 0 }.map { it * 2 }.take(10).toList()

    // 性能差距：几十倍到上百倍！
}
```

## 什么时候用 Sequence？记住三条规则 ##

- 数据量 > 1000 条 → 用 Sequence
- 链式操作 ≥ 2 步 → 用 Sequence
- 使用 take/limit 只取前几个 → 必须用 Sequence

反过来说：小数据量、单步操作，用普通集合就行，Sequence 有额外的创建开销。

```kotlin
// 小数据量：普通集合即可
val smallList = listOf(1, 2, 3, 4, 5)
val result = smallList.filter { it > 2 }  // 不用 asSequence()

// 大数据量 + 多步操作：必须用 Sequence
val bigList = dao.getAllUsers()  // 假设有10万条
val result = bigList
    .asSequence()
    .filter { it.isActive }
    .map { it.name }
    .take(10)
    .toList()
```

## Pair 和 Triple：临时返回多个值 ##

有时候函数需要返回两个或三个值，以前得新建一个类，现在直接用内置的：

```kotlin
// Pair：两个值
fun getUserInfo(): Pair<String, Int> {
    return Pair("张三", 25)
}

// 解构获取
val (name, age) = getUserInfo()

// 更简洁的写法
fun getUser() = "李四" to 30

// Triple：三个值
data class Result(val success: Boolean, val data: String?, val error: String?)
```

### 实战场景：网络请求结果解析 ###

```java
sealed class ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class Error(val message: String) : ApiResult<Nothing>()
    object Loading : ApiResult<Nothing>()
}
```

## 集合性能避坑指南 ##

### 坑1：循环中创建集合 ###

```java
// ❌ 错误：每次循环都创建新集合
for (item in list) {
    val filtered = list.filter { it.id == item.id }
}

// ✅ 正确：先转成 Map，O(1) 查找
val map = list.associateBy { it.id }
for (item in list) {
    val filtered = map[item.id]
}
```

### 坑2：频繁判断元素是否存在 ###

```kotlin
// ❌ 错误：O(n) 查找，数据量大时很慢
if (list.contains(item)) { ... }

// ✅ 正确：Set 的 contains 是 O(1)
val set = list.toSet()
if (set.contains(item)) { ... }
```

### 坑3：预分配容量 ###

```kotlin
// ❌ 错误：默认容量10，添加1000个元素会扩容多次
val list = mutableListOf<String>()

// ✅ 正确：预分配容量
val list = ArrayList<String>(1000)
```

## Android 开发实战场景 ##

### 场景1：Room 数据库查询结果处理 ###

```kotlin
@Query("SELECT * FROM users")
suspend fun getAllUsers(): List<User>

// ViewModel 中处理
viewModelScope.launch {
    val users = userDao.getAllUsers()
        .asSequence()
        .filter { !it.isDeleted }
        .sortedByDescending { it.lastLoginTime }
        .take(20)
        .toList()

    _users.value = users
}
```

### 场景2：多层嵌套列表扁平化 ###

```kotlin
val categories = listOf(
    Category("科技", listOf("AI", "5G", "芯片")),
    Category("娱乐", listOf("电影", "音乐", "游戏"))
)

// 用 flatMap 获取所有标签
val allTags = categories.flatMap { it.tags }
// 结果：[AI, 5G, 芯片, 电影, 音乐, 游戏]
```

### 场景3：数据分组展示 ###

```kotlin
val newsList = newsDao.getAllNews()

// 按类型分组
val groupedNews = newsList.groupBy { it.category }

// 遍历输出
groupedNews.forEach { (category, news) ->
    println("$category: ${news.size} 条")
}
```
