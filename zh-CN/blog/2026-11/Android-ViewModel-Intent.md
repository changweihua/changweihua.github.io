---
lastUpdated: true
commentabled: true
recommended: true
title: Android ViewModel 接收 Intent 参数
description: Android ViewModel 接收 Intent 参数
date: 2026-11-26 08:35:00
pageClass: blog-page-class
cover: /covers/android.svg
---

通常我们会将页面中的参数通过 ViewModel 来管理，上一页面 Intent 传过来的数据，应直接存入 ViewModel 中，防止 Activity 和 ViewModel 各存一份。

## Factory（经典方式) ##

```java
// MainActivity.kt
fun jump() {
   val intent = Intent(this, SecondActivity::class.java)
   intent.putExtra("userId", "tomcat")
   startActivity(intent)
}
```

```java
// SecondActivity.kt
class SecondActivity : AppCompatActivity() {
    private val viewModel: SecondViewModel by viewModels {
        val userId = intent.getStringExtra("userId") ?: ""
        SecondViewModel.SecondViewModelFactory(userId)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)
        val textView: TextView = findViewById(R.id.tv_res)
        textView.text = viewModel.userId
    }
}

class SecondViewModel(
    val userId: String,
) : ViewModel() {

    init {
        Log.d("Debug", "userId: " + userId)
    }

    class SecondViewModelFactory(
        private val userId: String
    ) : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(SecondViewModel::class.java)) {
                return SecondViewModel(userId) as T
            }
            return super.create(modelClass)
        }
    }
}
```

Lifecycle 2.5+, AndroidX 更推荐使用 `viewModelFactory {}` 创建 viewModel Factory,

```java
    private val viewModel: SecondViewModel by viewModels {
        val userId = intent.getStringExtra("userId") ?: ""
//        SecondViewModel.SecondViewModelFactory(userId)
        viewModelFactory {
            initializer {
                SecondViewModel(userId)
            }
        }
    }
```

## SavedStateHandle（官方推荐） ##

如果参数来自导航或 Intent，可以使用 SavedStateHandle：参数还能在进程被系统回收后恢复

```java
// SecondActivity.kt
class SecondActivity : AppCompatActivity() {
    val viewModel: SecondViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)
        val textView: TextView = findViewById(R.id.tv_res)
        textView.text = viewModel.userId
    }
}

class SecondViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    val userId = savedStateHandle["userId"] as? String
}
```

SavedStateHandle 为什么能拿到 Intent 中的数据？

对于使用 `by viewModels()` 创建的 ComponentActivity，默认的 ViewModel 工厂会把 Intent 的 `extras`（首次创建时）作为 `SavedStateHandle` 的默认值，因此可以直接通过相同的 key 获取。

## ViewModel 除了 Intent 参数，还有 Repository、UseCase 等依赖 ##

不能再使用默认的 `by viewModels()` 了。因为默认 Factory 只知道怎么创建 SavedStateHandle，但是不知道 usecase, repository 从哪里来。 因此必须自己实现 Factory。

```java
class SecondActivity : AppCompatActivity() {
    private val viewModel: SecondViewModel by viewModels {
        viewModelFactory {
            initializer {
                SecondViewModel(
                    getUserIdUseCase = GetUserIdUseCase(),
                    savedStateHandle = createSavedStateHandle(),
                )
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)
        val textView2: TextView = findViewById(R.id.tv_res)
        textView2.text =  "${viewModel.userId} - ${viewModel.userName}"
    }
}

class SecondViewModel(
    private val getUserIdUseCase: GetUserIdUseCase,
    savedStateHandle: SavedStateHandle
) : ViewModel() {
    val userId = savedStateHandle["userId"] as? String
    val userName = getUserIdUseCase()
}

class GetUserIdUseCase {
    operator fun invoke(): String {
        return "UseCase data"
    }
}
```

## Koin 注入 ##

```java
// App.kt
class App : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            modules(AppModule)
        }
    }
}

val AppModule = module {
    factoryOf<GetUserIdUseCase>(::GetUserIdUseCase)
    viewModel { params ->
        SecondViewModel(getUserIdUseCase = get(), savedStateHandle = get(), greet = params[0], greet2 = params[1])
    }
}
```

```java
// SecondActivity.kt
class SecondActivity : AppCompatActivity() {
    /**
     *  viewModel(): Koin 提供的 ComponentActivity 的 扩展函数
     */
    private val viewModel: SecondViewModel by viewModel {
        parametersOf("hello", "English")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)
        val textView: TextView = findViewById(R.id.tv_res)
        textView.text = "${viewModel.userId} - ${viewModel.userName} - ${viewModel.greet} - ${viewModel.language}"
    }
}

class SecondViewModel(
    private val getUserIdUseCase: GetUserIdUseCase,
    private val savedStateHandle: SavedStateHandle,
    val greet: String,
    val language: String
) : ViewModel() {

    init {
        Log.d("Debug", "greet: ${greet}")
    }

    val userId = savedStateHandle["userId"] as? String
    val userName = getUserIdUseCase()
}
```

Koin 对于同类型参数，是按照构造器顺序消费 `parametersOf()` 中的值, 即:

```java
parametersOf(
    "hello",
    "English"
)
```

对应

```txt
greet  = "hello"
language = "English"
```

如果写反了：

```java
parametersOf(
    "English",
    "hello"
)
```

那么就是：

```txt
greet  = "English"
language = "hello"
```

Koin 不知道哪个 String 是 greet，哪个是 language，只能按顺序匹配, 可读性一般。 可以考虑将参数封装成一个数据类, 如下:

```java
// SecondActivity.kt
class SecondActivity : AppCompatActivity() {
    /**
     *  viewModel(): Koin 提供的 ComponentActivity 的 扩展函数
     */
    private val viewModel: SecondViewModel by viewModel {
        parametersOf(Args(greet = "hello", language = "English"))
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)
        val textView: TextView = findViewById(R.id.tv_res)
        textView.text = "${viewModel.userId} - ${viewModel.userName} - ${viewModel.args.language} - ${viewModel.args.greet}"
    }
}

class SecondViewModel(
    private val getUserIdUseCase: GetUserIdUseCase,
    private val savedStateHandle: SavedStateHandle,
     val args: Args,
//    val greet: String,
//    val language: String
) : ViewModel() {

    init {
        Log.d("Debug", "greet: ${args.greet}")
    }

    val userId = savedStateHandle["userId"] as? String
    val userName = getUserIdUseCase()
}

data class Args(
    val greet: String,
    val language: String
)
```
