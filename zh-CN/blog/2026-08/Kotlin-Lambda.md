---
lastUpdated: true
commentabled: true
recommended: true
title: Kotlin 函数与 Lambda
description: 写惯了 Java，你可能不习惯这些骚操作
date: 2026-08-26 09:35:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

Lambda 是 Kotlin 函数式编程的核心，也是提升代码简洁度的关键。很多人学 Lambda 卡在「语法看不懂」，这篇文章帮你彻底搞懂。

## 函数定义：两种写法 ##

### 表达式体函数（单行返回） ###

```kotlin
// 写法1：等号开头，自动返回结果
fun sum(a: Int, b: Int) = a + b

// 编译器自动推断返回 Int
fun max(a: Int, b: Int) = if (a > b) a else b
```

### 代码块体函数（多行逻辑） ###

```kotlin
// 写法2：大括号，必须手动 return
fun sum(a: Int, b: Int): Int {
    val result = a + b
    return result
}
```

记忆口诀：`=` 开头不用 return，大括号 `{ }` 必须 return

## Lambda 表达式：匿名函数的精髓 ##

### Lambda 是什么 ###

Lambda 就是「没有名字的函数」，可以赋值给变量、传给其他函数、当做返回值。

```kotlin
// 普通函数
fun add(a: Int, b: Int): Int = a + b

// Lambda 表达式（赋值给变量）
val add = { a: Int, b: Int -> a + b }
```

### Lambda 标准语法 ###

```kotlin
{ 参数列表 -> 函数体 }
```

三部分解析：

- `{}`：Lambda 必须用大括号包裹
- `->`：分隔符，左边参数，右边逻辑
- 最后一行自动返回，不用写 return

```kotlin
// 完整写法
val add = { a: Int, b: Int ->
    val sum = a + b
    sum  // 最后一行自动返回
}

// 简化写法
val add = { a: Int, b: Int -> a + b }
```

## 单参数 Lambda：it 关键字 ###

当 Lambda 只有一个参数时，可以省略参数名，直接用 it：

```kotlin
// 完整写法
val double = { x: Int -> x * 2 }

// 简化写法：单参数用 it
val double = { it * 2 }

// 使用
println(double(5))  // 10
```

## 高阶函数：参数或返回值是函数 ##

这是 Lambda 真正发挥价值的地方：

```kotlin
// 定义高阶函数：参数是函数类型
fun executeTwice(action: () -> Unit) {
    action()
    action()
}

// 调用：传入 Lambda
executeTwice {
    println("Hello")  // 输出两遍
}
```

### 函数类型语法 ###

```kotlin
() -> Unit           // 无参、无返回值
(Int) -> String      // 接收 Int，返回 String
(String, Int) -> Boolean  // 接收两个参数，返回 Boolean
```

## 尾随 Lambda：Kotlin 的语法糖 ##

规则：如果函数的最后一个参数是 Lambda，可以把 `{}` 移到括号外面：

```kotlin
// 普通写法
listOf(1, 2, 3).forEach({ x -> println(x) })

// 尾随 Lambda：移到括号外
listOf(1, 2, 3).forEach { x -> println(x) }

// 简化：单参数用 it
listOf(1, 2, 3).forEach { println(it) }
```

Android 开发中的典型场景：

```kotlin
// 点击事件
button.setOnClickListener {
    Toast.makeText(this, "点击了", Toast.LENGTH_SHORT).show()
}

// 网络请求回调
viewModel.loadData { result ->
    updateUI(result)
}
```

## SAM 转换：告别匿名内部类 ##

SAM = Single Abstract Method，单抽象方法接口。

Java 的函数式接口（如 OnClickListener、Runnable）可以用 Lambda 替代：

```kotlin
// Java 写法：匿名内部类
button.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        Toast.makeText(context, "点击", Toast.LENGTH_SHORT).show();
    }
});

// Kotlin + SAM 转换：Lambda 替代
button.setOnClickListener {
    Toast.makeText(context, "点击", Toast.LENGTH_SHORT).show()
}
```

原理：Kotlin 编译器自动把 Lambda 转换成接口实现，两种写法运行效果完全一致。

## return 规则：Lambda 的特殊点 ##

```kotlin
// 普通函数：return 退出函数
fun normal() {
    if (true) return
    println("不会执行")
}

// Lambda：return 退出外层函数（而非 Lambda 本身）
listOf(1, 2, 3).forEach {
    if (it == 2) return  // 退出整个函数，不是 forEach
    println(it)
}

// 正确做法：使用标签 return
listOf(1, 2, 3).forEach {
    if (it == 2) return@forEach  // 只退出当前 Lambda
    println(it)
}
```

## 闭包：Lambda 捕获外部变量 ##

Lambda 可以访问、修改外部变量：

```kotlin
var count = 0

val increase = { count++ }

increase()
increase()
println(count)  // 2
```

注意：这既是特性也是坑点，小心闭包副作用。

## 实战案例：集合操作 ##

Lambda 最常见的应用场景：

```kotlin
data class User(val name: String, val age: Int)

val users = listOf(
    User("张三", 25),
    User("李四", 30),
    User("王五", 20)
)

// map：转换
val names = users.map { it.name }  // ["张三", "李四", "王五"]

// filter：过滤
val adults = users.filter { it.age >= 25 }  // [张三, 李四]

// find：查找第一个
val firstAdult = users.find { it.age >= 25 }  // User("张三", 25)

// reduce：聚合
val sumAges = users.reduce { acc, user -> acc + user.age }  // 75

// sortedBy：排序
val sorted = users.sortedBy { it.age }  // 按年龄排序
```

## 常见错误总结 ##

| 错误写法 | 问题 | 正确写法 |
| :--- | :--- | :--- |
| `{ a, b -> a + b }` 省略类型 | 变量未声明类型时必须写 | `val add = { a: Int, b: Int -> a + b }` |
| 多参数还用 `it` | 只有一个参数时才能用 `it` | `{ a, b -> a + b }` |
| Lambda 内乱写 `return` | 普通 `return` 退出外层函数 | `return@forEach` |

## 总结 ##

Lambda 的核心要点：

- 语法：`{ 参数 -> 逻辑 }`，最后一行自动返回
- 单参数：省略参数名，直接用 `it`
- 尾随 Lambda：Lambda 放最后，可移到括号外
- SAM 转换：替代 Java 匿名内部类
- return 规则：普通 return 退出外层，用标签 `return@xxx`
