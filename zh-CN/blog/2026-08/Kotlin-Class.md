---
lastUpdated: true
commentabled: true
recommended: true
title: Kotlin 类与对象
description: open 不是白写的，构造函数也没你想的那么简单
date: 2026-08-26 14:30:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

面向对象是 Kotlin 最重要的特性之一，但它的规则和 Java 有很大区别。这篇文章帮你理清类、构造函数、继承、接口的核心知识点。

## 类定义：不用 new ##

```kotlin
class Person {
    var name = "张三"
    fun sayHello() = println("你好，我是 $name")
}

// 创建对象：不用 new
val person = Person()
person.name = "李四"
person.sayHello()
```

## 构造函数：Kotlin 的精髓 ##

### 主构造函数（最常用） ###

```kotlin
// 写在类名后面
class Person(val name: String, var age: Int) {
    // 类体
}

// 使用
val person = Person("张三", 25)
println(person.name)  // 张三
println(person.age)   // 25
```

关键点：主构造函数的参数加 val/var，自动成为类的属性。

### init 代码块 ###

主构造函数不能写逻辑，用 `init`：

```kotlin
class Person(name: String, age: Int) {
    val name = name
    var age = age

    init {
        println("初始化：name=$name, age=$age")
    }
}
```

### 次构造函数 ###

```kotlin
class Person(val name: String) {
    var age = 0

    // 次构造函数：必须调用主构造
    constructor(name: String, age: Int) : this(name) {
        this.age = age
        println("次构造执行")
    }
}

// 使用
val p1 = Person("张三")       // 调用主构造
val p2 = Person("李四", 25)   // 调用次构造
```

*实战建议*：能用主构造函数 + 默认参数解决的，绝不用次构造函数。

```kotlin
// 最佳实践：用默认参数替代次构造函数
class Person(
    val name: String,
    var age: Int = 0  // 默认参数
)

// 调用灵活
Person("张三")      // age 默认 0
Person("李四", 25)  // 指定 age
```

## getter 和 setter：属性访问器 ##

Kotlin 的属性自动生成 getter/setter，但你可以自定义：

```kotlin
class Person {
    var name = "张三"
        // 自定义 getter
        get() = field.uppercase()
        // 自定义 setter
        set(value) {
            field = value.trim()
        }

    // 只读属性：只有 getter
    val birthYear: Int
        get() = 2024 - age

    var age = 0
        set(value) {
            if (value < 0) field = 0
            else field = value
        }
}
```

field 是什么：幕后字段，代表属性真正存储的值。在 getter/setter 中必须用 field，不能用属性名（会死循环）。

## open 关键字：继承的核心 ##

这是 Kotlin 和 Java 最大的区别：

```kotlin
// Java：类默认可以继承
// Kotlin：类默认是 final，禁止继承！

// 想被继承？必须加 open！
open class Person(val name: String) {
    open fun sayHello() = println("你好")
}

// 继承：子类加括号调用父构造
class Student(name: String, val grade: Int) : Person(name) {
    // 重写方法：必须加 override
    override fun sayHello() {
        super.sayHello()
        println("我是学生，班级：$grade")
    }
}
```

规则总结：

| 场景 | Java | Kotlin |
| :--- | :--- | :--- |
| 类是否可继承 | 默认可以 | 默认 final，需加 open |
| 方法是否可重写 | 默认可以 | 默认 final，需加 open |
| 抽象方法 | 需 abstract | 默认 open，无需重复加 |

## 继承与接口：统一用冒号 ##

```kotlin
// 继承类：加括号（调用父构造）
class Student : Person()

// 实现接口：不加括号（接口没构造）
class Runner : Runnable

// 同时继承 + 实现
class StudentAthlete : Person(), Runnable, Serializable
```

口诀：继承类必须加括号，实现接口不加括号。

## 接口：规则更灵活 ##

```kotlin
interface Person {
    // 抽象属性
    val name: String

    // 抽象方法
    fun work()

    // 默认实现：可选重写
    fun rest() = println("休息中...")
}

// 实现接口
class Teacher(override val name: String) : Person {
    override fun work() = println("教书")
}
```

接口 vs 抽象类：

| 特性 | 接口 | 抽象类 |
| :--- | :--- | :--- |
| 构造 | 无 | 有 |
| 属性 | 默认抽象，不能初始化 | 可以有具体属性 |
| 多实现 | ✅ 可以 | ❌ 不行 |
| 继承 | 接口可以继承接口 | 只能单继承 |


## object：单例和匿名对象 ##

### 单例对象 ###

```kotlin
object AppConfig {
    var appName = "我的应用"
    fun init() = println("初始化")
}

// 使用：直接类名调用
AppConfig.init()
AppConfig.appName = "新名字"
```

### 匿名内部类 ###

```kotlin
button.setOnClickListener(object : View.OnClickListener {
    override fun onClick(v: View?) {
        // 处理点击
    }
})

// 简化：SAM 转换
button.setOnClickListener { /* 处理点击 */ }
```

### 伴生对象：替代 static ###

```kotlin
class User {
    val name: String

    // 伴生对象：相当于 Java 的 static
    companion object {
        const val TAG = "User"
        fun create() = User("默认用户")
    }

    constructor(name: String) {
        this.name = name
    }
}

// 使用
val user = User.create()
Log.d(User.TAG, "创建用户")
```

## 数据类：快速定义 POJO ##

```kotlin
data class User(
    val id: Long,
    val name: String,
    val age: Int = 0
)

// 自动生成：
// - equals/hashCode
// - toString()
// - copy()
// - componentN() 函数（解构）

// 使用
val user1 = User(1, "张三", 25)
val user2 = user1.copy(name = "李四")  // 只改 name
val (id, name, _) = user1  // 解构
```

## 内部类：持有外部引用 ##

```kotlin
class Outer {
    private val outerVar = 1

    // 嵌套类：不持有外部引用
    class Nested {
        fun test() = 2  // 不能访问 outerVar
    }

    // 内部类：持有外部引用（加 inner）
    inner class Inner {
        fun test() = outerVar  // 可以访问
    }
}
```

## 常见问题 ##

Q：为什么 Kotlin 类默认是 final？

A：遵循《Effective Java》的最佳实践——「要么为继承而设计，要么禁止继承」。默认 final 避免脆弱基类问题，提升代码安全性。

Q：override 的方法可以继续被重写吗？

A：可以。Kotlin 的 override 方法默认是 open 的。如果想禁止重写，加 final override。

## 总结 ##

| 特性 | 关键点 |
| :--- | :--- |
| 构造函数 | 主构造 + init，次构造必须调用主构造，优先用默认参数 |
| getter/setter | 自动生成，可用 field 自定义 |
| open | 类/方法默认 final，想被继承必须加 open |
| 继承实现 | 统一用冒号，继承类加括号，接口不加 |
| object | 单例对象、匿名对象、伴生对象 |
| 数据类 | 自动生成常用方法，copy、解构 |
