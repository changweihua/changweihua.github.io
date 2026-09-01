---
lastUpdated: true
commentabled: true
recommended: true
title: 从 Java 转 Kotlin
description: 这些基础语法你得先搞明白
date: 2026-08-26 10:55:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

说真的，我见过太多人学 Kotlin 从「变量声明」这一步就开始踩坑。

今天这篇文章，就是帮你把最基础、但最容易混淆的概念一次性讲清楚。

## 变量声明：var 和 val 的选择 ##

Kotlin 的变量声明就两个关键字，但坑最多：

```kotlin
// val：只读，不可修改，等价 Java 的 final
val name = "张三"
// name = "李四"  // ❌ 编译报错

// var：可变，可以多次赋值
var age = 25
age = 26  // ✅ 没问题
```

实战建议：默认用 val，只有需要修改的地方才用 var。这样做有两个好处：

- 代码意图更清晰，一眼看出哪些数据会变
- 编译器帮你做不可变性检查，减少 bug

```kotlin
// 业务场景中的典型用法
data class User(val name: String, var age: Int)
// name 不可变（用户姓名一般不会改）
// age 可变（年龄会变）
```

## 空安全：Kotlin 的杀手锏 ##

这是 Kotlin 和 Java 最大的区别，也是我最推荐的功能。

```kotlin
// 普通类型：不能赋值 null
var name: String = "张三"
// name = null  // ❌ 编译报错

// 可空类型：类型后面加 ?，才能赋值 null
var nickname: String? = null  // ✅ 没问题
nickname = "小张"
nickname = null
```

安全调用三件套：

```kotlin
var name: String? = "张三"

// 1. 安全调用 ?. ：为 null 直接返回 null，不报错
val len = name?.length  // len 是 Int? 类型

// 2. 空合并 ?: ：为 null 时使用默认值
val len = name?.length ?: 0  // 为 null 返回 0

// 3. 强行调用 !!. ：相信我这里一定不为 null
val len = name!!.length  // 为 null 直接崩溃，不推荐
```

实战中的典型用法：

```kotlin
// Android 开发中的典型场景
val bundle = intent.extras
val userId = bundle?.getString("user_id") ?: "0"
val age = bundle?.getInt("age") ?: 0
```

## 类型推断：编译器比你更聪明 ##

Kotlin 编译器会根据右边的值自动推断类型，你不需要手动声明：

```kotlin
// 编译器自动推断为 Int
val num = 100

// 编译器自动推断为 String
val name = "张三"

// 显式声明类型（有时候是必要的）
val num: Int = 100
val list: List<String> = arrayListOf()
```

什么时候必须显式声明类型：

```kotlin
// 1. 变量声明时没有初始化
lateinit var binding: ActivityMainBinding

// 2. 泛型相关
val map: Map<String, Int> = mapOf()

// 3. 函数返回类型（复杂类型建议声明）
fun parseJson(json: String): User? { ... }
```

## 字符串模板：告别拼接地狱 ##

```kotlin
val name = "张三"
val age = 25

// 简单变量嵌入
val info = "姓名：$name，年龄：$age"
println(info)  // 姓名：张三，年龄：25

// 表达式嵌入
val info2 = "明年年龄：${age + 1}"
val info3 = "名字长度：${name.length}"
```

多行字符串（做日志、JSON 格式化时特别有用）：

```kotlin
val json = """
    {
        "name": "$name",
        "age": $age
    }
""".trimIndent()
```

## 条件控制：if 和 when ##

### if 表达式（Kotlin 的 if 是有返回值的） ###

```java
// Java 写法
int max;
if (a > b) {
    max = a;
} else {
    max = b;
}

// Kotlin 简化写法
val max = if (a > b) a else b
```

### when 表达式（Kotlin 的超级 switch） ###

```kotlin
val grade = 85
val result = when {
    grade >= 90 -> "A"
    grade >= 80 -> "B"
    grade >= 60 -> "C"
    else -> "D"
}
```

when 的强大用法：

```kotlin
// 带条件判断
when (x) {
    in 1..10 -> print("1到10之间")
    !in 20..30 -> print("不在20到30之间")
    is String -> print("是字符串")
}

// 替代 if-else 链
when {
    x > 0 -> print("正数")
    x < 0 -> print("负数")
    else -> print("零")
}
```

## 循环：for 和 Range ##

### Range（Kotlin 特有的区间表达） ###

```kotlin
// 闭区间：包含起始和结束
for (i in 1..5) print(i)  // 1 2 3 4 5

// 左闭右开：不包含结束
for (i in 1 until 5) print(i)  // 1 2 3 4

// 倒序
for (i in 5 downTo 1) print(i)  // 5 4 3 2 1

// 步长
for (i in 1..10 step 2) print(i)  // 1 3 5 7 9
```

### 遍历集合 ###

```kotlin
val list = listOf("A", "B", "C")

// 普通遍历
for (item in list) {
    println(item)
}

// 带索引遍历
for ((index, item) in list.withIndex()) {
    println("$index: $item")
}

// 遍历 Map
val map = mapOf("A" to 1, "B" to 2)
for ((key, value) in map) {
    println("$key -> $value")
}
```

## 空安全与智能转换 ##

### is 关键字（等价 Java 的 instanceof） ###

```kotlin
fun printLength(obj: Any) {
    // 使用 is 判断类型
    if (obj is String) {
        // Kotlin 自动转换，无需强制类型转换
        println("字符串长度：${obj.length}")
    } else if (obj is Int) {
        println("整数值：${obj}")
    }
}
```

智能转换的原理：Kotlin 编译器会跟踪 is 检查，在确认类型的作用域内自动转换。

## 解构声明：一次性拆出多个变量 ##

解构声明是 Kotlin 的语法糖，可以把一个对象的多个属性一次性拆解给多个变量：

```kotlin
data class User(val name: String, val age: Int, val city: String)

val user = User("张三", 25, "北京")

// 解构：一次性拆出三个变量
val (name, age, city) = user
println("$name, $age, $city")  // 张三, 25, 北京

// 忽略不需要的属性
val (name, _, city) = user  // age 被忽略

// Map 遍历解构（最常用）
val map = mapOf("name" to "张三", "age" to "25")
map.forEach { (key, value) ->
    println("$key: $value")
}
```

底层原理：编译器会把解构转换为对 `componentN()` 函数的调用，data class 会自动生成这些函数。

## 编译期 vs 运行期空安全 ##

Kotlin 的空安全分为两个阶段：

### 编译期空安全（主要） ###

```kotlin
var name: String = "张三"
// name = null  // ❌ 编译直接报错，从源头杜绝空指针

var nickname: String? = null  // 可空类型
// nickname.length  // ❌ 编译报错，不能直接调用
nickname?.length  // ✅ 安全调用
```

### 运行期空安全（兜底） ###

有些场景编译器管不了，只能运行期处理：

```kotlin
// 1. 非空断言 !!：编译通过，运行才爆
var name: String? = null
name!!.length  // 编译能过，运行抛异常

// 2. lateinit：编译不检查，运行才爆
lateinit var binding: ActivityMainBinding
binding.tvTitle.text = "标题"  // 如果没初始化，运行抛异常

// 3. Java 互操作：平台类型 T!
val text = javaMethod()  // 返回类型是 String!，编译器不校验
text.length  // 运行可能崩
```

记住：编译期空安全是主力，运行期空安全是兜底。能用编译期检查解决的，绝不要留给运行期。

## 注释：支持嵌套 ##

```kotlin
// 单行注释

/*
 * 多行注释
 */

/*
 * Kotlin 支持嵌套注释，Java 不支持
 * /* 这里还可以写注释 */
 */
```

## 总结 ##

Kotlin 基础语法就这些核心点：

| 特性 | 核心用法 |
| :--- | :--- |
| val vs var | 默认 val，可变才用 var |
| 空安全 | ? 声明、`?.` 调用、`?:` 默认值 |
| 类型推断 | 编译器自动推断，复杂类型显式声明 |
| 字符串模板 | `$变量` 嵌入、`${表达式}` 复杂场景 |
| when | 超级 switch，支持条件和区间 |
| Range | ...、until、downTo、step |
