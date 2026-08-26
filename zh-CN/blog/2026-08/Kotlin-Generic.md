---
lastUpdated: true
commentabled: true
recommended: true
title: Kotlin 泛型与扩展
description: out/in 搞不懂？扩展函数到底扩展了啥？
date: 2026-08-26 14:00:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

泛型和扩展函数是 Kotlin 进阶的必经之路。这两个特性看似复杂，但只要理解了核心思想，就能灵活运用。

## 泛型基础：类型参数化 ##

### 泛型类 ###

```kotlin
// 定义：类型用 T 占位
class Box<T>(val value: T)

// 使用
val intBox = Box(123)      // 编译器推断为 Box<Int>
val stringBox = Box("abc") // 编译器推断为 Box<String>
val explicitBox = Box<String>("abc") // 显式指定
```

### 泛型函数 ###

```kotlin
// 定义
fun <T> singleton(item: T): List<T> = listOf(item)

// 使用
val list = singleton(123)  // List<Int>
```

### 多类型参数 ###

```kotlin
class PairBox<K, V>(val key: K, val value: V)

val pair = PairBox("age", 25)  // PairBox<String, Int>
```

## 型变：泛型的继承关系 ##

这是理解泛型的难点。先看痛点：

```kotlin
class Box<T>(val value: T)

// 虽然 String 是 Any 的子类
val strBox: Box<String> = Box("abc")
// 但 Box<String> 不是 Box<Any> 的子类！
// val anyBox: Box<Any> = strBox  ❌ 编译报错
```

### 协变：out 关键字（生产者） ###

用 out 标记，只能产出（返回），不能消费（传入）：

```kotlin
// 协变类：T 只能用做返回值，不能用做参数
class FruitBox<out T>(val fruit: T) {
    fun getFruit(): T = fruit  // ✅ T 作为返回值
    // fun setFruit(t: T) {}   // ❌ T 不能作为参数
}

// 现在可以赋值了
val appleBox: FruitBox<String> = FruitBox("苹果")
val fruitBox: FruitBox<Any> = appleBox  // ✅
```

记忆口诀：生产者 out，产出用 out。

### 逆变：in 关键字（消费者） ###

用 in 标记，只能消费（传入），不能产出（返回）：

```kotlin
// 逆变类：T 只能用做参数，不能用做返回值
class TrashBin<in T> {
    fun trash(item: T) = println("扔掉 $item")  // ✅ T 作为参数
    // fun getTrash(): T {}  // ❌ T 不能作为返回值
}

// 现在可以赋值了
val anyBin: TrashBin<Any> = TrashBin()
val strBin: TrashBin<String> = anyBin  // ✅
```

记忆口诀：消费者 in，消耗用 in。

### PECS 原则 ###

> Producer-Extends, Consumer-Super

- 需要产出数据 → `out`（协变）
- 需要消费数据 → `in`（逆变）

## 星号投射：未知类型的安全使用 ##

当不知道具体类型时，用 `*`：

```kotlin
// 协变类
class FruitBox<out T>(val fruit: T) {
    fun getFruit(): T = fruit
}

val box: FruitBox<*> = FruitBox("苹果")
val fruit = box.getFruit()  // fruit 是 Any?
```

*规则*：

| 原类型 | `Box<*>` 等价于 | 读 | 写 |
| :--- | :--- | :--- | :--- |
| `Box<out T>` | `Box<out Any?>` | ✅ | ❌ |
| `Box<in T>` | `Box<in Nothing>` | ❌ | ✅ |
| `Box<T>` | 读 `Any?` / 写 `Nothing` | ✅ | ❌ |

## 扩展函数：给现有类添方法 ##

### 基本语法 ###

```kotlin
// 给 String 添加一个方法
fun String.addExclamation() = this + "!"

// 使用
"Hello".addExclamation()  // "Hello!"
```

### 扩展函数原理 ###

扩展函数*不修改原类*，只是让你能用「点」语法调用。编译器会把它编译成普通静态方法：

```kotlin
// Kotlin 写法
fun String.addExclamation() = this + "!"

// 编译后等价于
fun addExclamation(receiver: String) = receiver + "!"
```

### 扩展属性 ###

```kotlin
// 扩展属性
val String.lastChar: Char
    get() = this[length - 1]

// 使用
"Hello".lastChar  // 'o'
```

## 扩展函数实战 ##

### 给 Context 扩展常用方法 ###

```kotlin
// 扩展函数：toast
fun Context.toast(message: String, duration: Int = Toast.LENGTH_SHORT) {
    Toast.makeText(this, message, duration).show()
}

// 扩展函数：dp 转 px
fun Context.dp2px(dp: Float): Float {
    return dp * resources.displayMetrics.density
}

// 使用
toast("登录成功")
tvTitle.dp2px(16f)
```

### 给 View 扩展 ###

```kotlin
// View 延迟操作
fun View.onClick(action: () -> Unit) {
    setOnClickListener { action() }
}

// 使用
button.onClick {
    toast("点击了")
}

// View 显示/隐藏
var View.visible: Boolean
    get() = visibility == View.VISIBLE
    set(value) {
        visibility = if (value) View.VISIBLE else View.GONE
    }

textView.visible = true
```

### 扩展集合操作 ###

```kotlin
// 安全获取元素
fun <T> List<T>.safeGet(index: Int): T? {
    return if (index in indices) get(index) else null
}

// 使用
val list = listOf("A", "B", "C")
list.safeGet(5)  // null
```

## 扩展的作用域 ##

在其他类内部定义扩展（成员扩展）

```kotlin
class Person(val name: String) {
    // 在 Person 内部给 String 定义扩展
    fun String.sayHello() {
        println("$name 说：$this")
    }

    fun test() {
        "你好".sayHello()  // 只在 Person 内部可用
    }
}

// 在外部无法调用
// "你好".sayHello()  ❌
```

### 扩展接收者 vs 分发接收者 ###

```kotlin
class Person {
    fun Person.extension() {
        // this = 扩展接收者（String）
        // this@Person = 分发接收者（Person）
    }
}
```

## 泛型约束 ##

### 上界约束 ###

```kotlin
// T 必须继承 Comparable<T>
fun <T : Comparable<T>> maxOf(a: T, b: T): T {
    return if (a > b) a else b
}
```

### 多约束 ###

```kotlin
// T 必须同时实现 Serializable 和 Comparable
fun <T> serialize(value: T)
    where T : Serializable, T : Comparable<T> {
    // ...
}
```

## 常见问题 ##

### Q：扩展函数能被 override 吗？ ###

A：不能。扩展函数不是类的真正成员，不能被重写。

### Q：扩展函数和成员方法冲突怎么办？ ###

A：成员方法优先。编译器会优先使用类本身定义的方法。

### Q：什么时候用泛型约束 `T : Bound`？ ###

A：当泛型类型需要调用某些方法时，比如 `T : Comparable<T>` 让你能用 compareTo。

## 总结 ##

| 概念 | 核心要点 |
| :--- | :--- |
| `泛型` | 类型参数化，编译时类型检查 |
| `协变 out` | 生产者，只能产出（返回），不能消费 |
| `逆变 in` | 消费者，只能消费（传入），不能产出 |
| `PECS` | Producer-Extends, Consumer-Super |
| `星号投射` | 不知道具体类型时的安全通配符 |
| `扩展函数` | 给现有类添方法，不修改原类 |
