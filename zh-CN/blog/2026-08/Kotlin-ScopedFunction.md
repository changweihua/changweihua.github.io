---
lastUpdated: true
commentabled: true
recommended: true
title: Kotlin 作用域函数
description: apply/let/run/also 用错了一个，代码就变味了
date: 2026-08-26 13:30:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

作用域函数是 Kotlin 最常用的高级特性，用好能让代码简洁又清晰，用不好反而降低可读性。这篇文章帮你彻底分清这四个函数。

## 一句话核心区别 ##

作用域函数就两个维度：

| 维度 | 选项 |
| :--- | :--- |
| 内部用什么 | `this`（可省略）vs `it` |
| 返回什么 | 对象本身 vs 最后一行 |

## apply：配置对象 ##

特点：内部用 `this`，返回对象本身。

```kotlin
// 标准用法：new 完对象后，批量配置属性
val person = Person().apply {
    name = "张三"
    age = 25
    address = "北京"
}
```

对比不用 apply：

```kotlin
val person = Person()
person.name = "张三"
person.age = 25
person.address = "北京"
```

Android 开发中的典型场景：

```java
// 配置 View
val textView = TextView(context).apply {
    text = "标题"
    textSize = 16f
    setTextColor(Color.RED)
    gravity = Gravity.CENTER
}

// 配置 Intent
val intent = Intent(context, SecondActivity::class.java).apply {
    putExtra("user_id", userId)
    putExtra("name", name)
}

// 配置 RequestBody
val requestBody = FormBody.Builder().apply {
    add("username", "张三")
    add("password", "123456")
}.build()
```

什么时候用 apply：

- `new` 完对象，需要设置一堆属性
- 返回值必须是这个对象本身

## let：判空处理 ##

特点：内部用 `it`，返回最后一行。

```kotlin
// 标准用法：可空类型的安全处理
val name: String? = "张三"
val length = name?.let { it.length } ?: 0
```

对比不用 let：

```java
val length = if (name != null) name.length else 0
```

链式调用中的判空：

```kotlin
// 对象链式调用，中间可能为 null
user?.getAddress()?.getCity()?.getName()

// 用 let 更清晰
val cityName = user?.getAddress()
    ?.let { it.getCity() }
    ?.let { it.getName() }
    ?: "未知城市"
```

经典场景：let + also（赋值前处理） ：

```kotlin
// 创建一个列表，添加元素，然后使用
val list = mutableListOf<Int>().also {
    it.add(1)
    it.add(2)
    it.add(3)
}
// list 现在是 [1, 2, 3]
```

什么时候用 let：

- 处理可空类型，避免嵌套 `if-null`
- 需要对非空值做转换

## run：执行代码块并返回结果 ##

特点：内部用 `this`，返回最后一行。

```kotlin
// 标准用法：基于对象执行一段逻辑，返回结果
val result = person.run {
    println("处理 $name")
    val adult = age >= 18
    "成年状态：$adult"  // 返回值
}
```

典型场景：`takeIf` 配合 `run`：

```kotlin
// 如果满足条件才处理
val discount = product
    .takeIf { it.price > 100 }
    ?.run { price * 0.8 }
    ?: product.price
```

另一个经典用法：临时作用域：

```kotlin
// 临时作用域执行多个操作
val screenWidth = run {
    val display = windowManager.defaultDisplay
    val metrics = DisplayMetrics()
    display.getMetrics(metrics)
    metrics.widthPixels
}
```

什么时候用 run：

- 需要在对象上执行多个操作，返回最后结果
- 临时作用域执行代码

## also：额外操作 ##

特点：内部用 `it`，返回对象本身。

```kotlin
// 标准用法：执行额外操作，返回原对象
val list = mutableListOf(1, 2, 3).also {
    println("原始列表：$it")
    // 可以在这里打日志、埋点等
}
```

对比 apply：

```kotlin
// apply：配置属性，返回自己
val person = Person().apply {
    name = "张三"  // 配置
}

// also：附加操作，返回自己
val list = mutableListOf(1, 2, 3).also {
    println("创建列表")  // 附加操作
}
```

什么时候用 also：

- 需要在链式调用中插入日志、埋点
- 需要执行不影响主逻辑的附加操作

## 四大函数终极对照表 ##

| 函数 | 内部变量 | 返回值 | 最佳场景 |
| :--- | :--- | :--- | :--- |
| apply | this | 对象本身 | 配置对象属性 |
| let | it | 最后一行 | 判空、转换 |
| run | this | 最后一行 | 执行逻辑、返回结果 |
| also | it | 对象本身 | 附加操作、日志 |

## 记忆口诀 ##

- 配置属性 → apply
- 判空转换 → let
- 执行返回 → run
- 附加日志 → also

## 实战组合拳 ##

### 场景：创建对象、配置、处理、返回 ###

```java
val response = api.getUser(userId)
    .let { it.body() }              // 提取 body
    ?.let {
        UserDto(it.id, it.name, it.age)
    }                               // 转换
    ?: UserDto(0, "默认用户", 0)    // 空值兜底

val userView = UserView(response).also {
    viewGroup.addView(it)           // 添加到视图
    log.d("创建 UserView: $response")
}
```

### 场景：Android 中的完整用法 ###

```kotlin
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. 创建并配置 binding
        binding = ActivityMainBinding.inflate(layoutInflater).also {
            setContentView(it.root)
        }

        // 2. 配置 View
        binding.tvTitle.apply {
            text = "首页"
            setTextColor(Color.BLACK)
        }

        // 3. 处理数据
        viewModel.userData.observe(this) { user ->
            user?.let { updateUI(it) } ?: showError()
        }
    }

    private fun updateUI(user: User) {
        binding.tvName.text = user.name
        binding.tvAge.text = "${user.age}岁"
    }
}
```

## 常见问题 ##

### Q：apply 和 also 都能返回自己，区别在哪？ ###

A：内部变量不同。`apply` 用 `this`（可省略），`also` 用 `it`。当你需要引用对象时用 `also`，只是配置属性时用 `apply`。

### Q：let 和 run 都能返回最后一行，区别在哪？ ###

A：内部变量不同。`let` 用 `it`，`run` 用 `this`。当你需要引用对象时用 `let`，主要做逻辑计算时用 `run`。

### Q：什么时候不用作用域函数？ ###

A：逻辑简单、一目了然的时候。比如：

```kotlin
// 简单赋值，不需要用 apply
val name = user.name

// 简单判空，不需要用 let
val length = name?.length ?: 0
```

## 总结 ##

作用域函数是让代码更简洁的工具，不是必须用的银弹。选择原则：

- 配置对象属性 → `apply`
- 可空类型判空 → `let`
- 执行逻辑返回结果 → `run`
- 附加日志/操作 → `also`
