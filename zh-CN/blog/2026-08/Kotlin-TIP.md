---
lastUpdated: true
commentabled: true
recommended: true
title: Kotlin 常见坑速查
description: object/lateinit/return 那些容易踩的坑
date: 2026-08-26 12:30:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

这篇文章汇总 Kotlin 开发中的高频问题和易错点，方便快速查阅。

## object 关键字的三种用法 ##

| 用法 | 代码 | 用途 |
| :--- | :--- | :--- |
| 匿名内部类 | `object : 接口 {}` | 一次性实现接口 |
| 单例对象 | `object Config {}` | 全局单例 |
| 伴生对象 | `companion object {}` | 替代 static |

```kotlin
// 匿名内部类
button.setOnClickListener(object : View.OnClickListener {
    override fun onClick(v: View?) { }
})

// 单例
object AppConfig {
    var appName = "我的应用"
}

// 伴生对象
class User {
    companion object {
        const val TAG = "User"
        fun create() = User()
    }
}
```

## return 规则 ##

```kotlin
// 普通函数：return 退出函数
fun normal() {
    if (true) return
    println("不会执行")
}

// 表达式体函数：最后一行自动返回
fun add(a: Int, b: Int) = a + b

// Lambda：return 退出外层函数
listOf(1, 2, 3).forEach {
    if (it == 2) return  // 退出整个函数
}

// Lambda：标签 return 只退出 Lambda
listOf(1, 2, 3).forEach {
    if (it == 2) return@forEach
    println(it)
}
```

## 标签循环 ##

```kotlin
// break@outer：跳出指定循环
outer@ for (i in 1..3) {
    for (j in 1..3) {
        if (j == 2) break@outer  // 直接跳出外层循环
    }
}

// continue@outer：跳到外层下一次
outer@ for (i in 1..3) {
    for (j in 1..3) {
        if (j == 2) continue@outer  // 跳到外层下一次
    }
}
```

## lateinit vs lazy ##

| 特性 | lateinit | lazy |
| :--- | :--- | :--- |
| 用途 | 延迟初始化 | 惰性求值 |
| 适用 | var | val |
| 适用类型 | 非基本类型 | 任何类型 |
| 初始化时机 | 使用前手动赋值 | 首次访问时自动初始化 |

```kotlin
// lateinit：需要手动初始化的场景
lateinit var binding: ActivityMainBinding
fun init() { binding = ... }

// lazy：第一次使用时自动初始化
val viewModel: MainViewModel by viewModels()
val adapter: UserAdapter by lazy { UserAdapter() }
```

## const vs val ##

| 特性 | const val | val |
| :--- | :--- | :--- |
| 编译时机 | 编译时确定 | 运行时确定 |
| 位置 | 只能 object/companion | 任何地方 |
| 性能 | 更高 | 稍低 |
| 注解用 | ✅ 可以 | ❌ 不行 |

```kotlin
// const val：编译时常量
object Config {
    const val BASE_URL = "https://api.example.com"
}

// val：运行时确定
val timestamp = System.currentTimeMillis()
```

## 解构声明 ##

```kotlin
// 数据类解构
data class User(val name: String, val age: Int)
val (name, age) = User("张三", 25)

// Map 解构
val map = mapOf("A" to 1, "B" to 2)
for ((key, value) in map) { }

// Pair/ Triple
val (a, b) = Pair(1, 2)
val (x, y, z) = Triple(1, 2, 3)

// Lambda 解构（Kotlin 1.1+）
map.mapValues { (key, value) -> "$key -> $value" }
```

## 继承 vs 实现 ##

```kotlin
// 继承类：加括号（调用父构造）
class Student : Person()

// 实现接口：不加括号（接口没构造）
class Runner : Runnable

// 同时继承 + 实现
class StudentAthlete : Person(), Runnable, Serializable
```

口诀：继承类必须加括号，实现接口不加括号。

## vararg 可变参数 ##

```kotlin
// 定义
fun printAll(vararg items: String) {
    items.forEach { println(it) }
}

// 调用
printAll("A", "B", "C")

// 数组展开
val array = arrayOf("X", "Y", "Z")
printAll(*array)  // 展开操作符
```

## 中缀函数 ##

```kotlin
// 定义：infix 修饰，成员函数或扩展函数，单参数
infix fun Int.add(other: Int) = this + other

// 调用：可以省略点号
val sum = 1 add 2
val sum2 = 1.add(2)  // 等价
```

常用内置中缀函数：to、until、downTo

```kotlin
val pair = "key" to "value"
for (i in 0 until 10) { }
for (i in 10 downTo 0) { }
```

## 内联函数 ##

```kotlin
// inline：减少函数调用开销，复制函数体到调用处
inline fun measureTime(block: () -> Unit) {
    val start = System.currentTimeMillis()
    block()
    println("耗时: ${System.currentTimeMillis() - start}ms")
}
```

注意：内联函数内的 Lambda 不能存储，不能作为变量。

## Kotlin vs Java 常见对照 ##

| Java | Kotlin |
| :--- | :--- |
| `final` | 默认就是这个 |
| `instanceof` | `is` |
| `(Type) obj` | `obj as Type / obj as? Type` |
| `static` | `companion object` |
| `new Object()` | `Object()`（不用 `new`） |
| `if (obj != null)` | `obj?.let { }` |
| 三元运算符 `a ? b : c` | `if (a) b else c` |

## 常见编译错误 ##

| 错误 | 原因 | 解决 |
| :--- | :--- | :--- |
| Val cannot be reassigned | val不能重新赋值 | 改用 `var` |
| Type mismatch | 类型不匹配 | 检查类型转换 |
| Unresolved reference | 引用错误 | 检查 import |
| Nullable type ... | 空安全问题 | 用 `?.` 或 `?.:` |
| Only safe calls allowed | 空的可能 | 用 `?.:` |

## 总结 ##

这份速查表涵盖了 Kotlin 开发中最常见的问题：

- `object` → 三种用法：匿名内部类、单例、伴生对象
- `return` → 大括号必须 return，表达式自动返回，Lambda 用标签
- `lateinit` vs `lazy` → 手动 vs 自动
- `const` vs `val` → 编译时常量 vs 运行时
- 解构 → 自动分解为多个变量
- `vararg` → 可变参数，用 * 展开
