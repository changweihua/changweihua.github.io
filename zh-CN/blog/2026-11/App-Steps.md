---
lastUpdated: true
commentabled: true
recommended: true
title: App 架构演进
description: MVC → MVP → MVVM → MVI，一篇看懂
date: 2026-11-05 09:35:00
pageClass: blog-page-class
cover: /covers/android.svg
---

很多工程师对架构有一种误解：以为它只是"换名字"——把 `Controller` 叫 ViewModel，把 `View` 叫 Composable……确实只是命名游戏，但更核心的是责任边界和测试能力。

今天我们用一个 TODO App 作为例子，从远古的 MVC 一直走到现代的 MVI，看清楚每一步为什么要演进，*以及各自真实的缺陷在哪里*。

## MVC：最朴素的时代 ##

### 一个 TODO 页面的 MVC ###

- Model：`Todo` 数据类 + `TodoDatabase`（SQLiteOpenHelper）
- View：`activity_main.xml`
- Controller：`MainActivity`

```java
class MainActivity : AppCompatActivity() {
    private lateinit var db: TodoDatabase

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        db = TodoDatabase(this)

        btnAdd.setOnClickListener {
            val text = etInput.text.toString()
            db.insert(Todo(text))
            refreshList()
        }
    }

    private fun refreshList() {
        val todos = db.all()
        // 直接操作 View
        listView.adapter = ArrayAdapter(this, ..., todos)
    }
}
```

### 真实问题 ###

- *Activity 啥都干*——业务逻辑、View 操作、数据库——膨胀到 1000+ 行。
- *没法测试*——想测业务逻辑？必须启动设备。
- *无法横向拆分*——想多人协作开发，无从下手。

### 为什么"Android 官方 MVC"是失败的 ###

Google 早期的 MVC 文档里把 Activity 同时算 View 和 Controller，结果*Controller 名存实亡*，Activity 成了大杂烩。这是 Android 架构争议的根源。

## MVP：把 View 和 Controller 拆开 ##

### 演化动机 ###

测试不了，那就把逻辑从 Activity 里抽出来。

```java
// View 接口
interface MainView {
    fun showTodos(todos: List<Todo>)
    fun showEmpty()
}

// Presenter
class MainPresenter(private val view: MainView, private val repo: TodoRepo) {
    fun load() {
        val todos = repo.getAll()
        if (todos.isEmpty()) view.showEmpty() else view.showTodos(todos)
    }

    fun addTodo(text: String) {
        repo.insert(Todo(text))
        load()
    }
}

// Activity 实现 View
class MainActivity : AppCompatActivity(), MainView {
    private lateinit var presenter: MainPresenter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        presenter = MainPresenter(this, TodoRepo())
        presenter.load()
        btnAdd.setOnClickListener { presenter.addTodo(etInput.text.toString()) }
    }

    override fun showTodos(todos: List<Todo>) { /* 渲染列表 */ }
    override fun showEmpty() { /* 显示空态 */ }
}
```

### 解决了什么 ###

- ✅ 可以测 Presenter 了——mock 一个 View 就行。
- ✅ Activity 变薄。

### 没解决什么 ###

- ❌ Presenter 还是手工通知 View——容易漏。
- ❌ 每个 View 接口都要手动声明，文件数翻倍。
- ❌ 状态管理混乱——转屏后 Presenter 可能丢失正在进行的回调。

## MVVM：让数据自动驱动 UI ##

### 演化动机 ###

MVP 的本质问题：*View 要主动问 Presenter 拿数据*。如果数据能"自动"流到 View，世界就简单了。

MVVM 引入两个核心概念：

- ViewModel 暴露 `StateFlow` / `LiveData` ——可观察的数据流。
- View 通过 `collect()` 订阅——UI 自动响应数据变化。

```java
// ViewModel
class TodoViewModel(private val repo: TodoRepo) : ViewModel() {
    private val _todos = MutableStateFlow<List<Todo>>(emptyList())
    val todos: StateFlow<List<Todo>> = _todos

    fun addTodo(text: String) {
        viewModelScope.launch {
            repo.insert(Todo(text))
            _todos.value = repo.getAll()
        }
    }

    init {
        viewModelScope.launch { _todos.value = repo.getAll() }
    }
}

// Activity（用 Compose）
@Composable
fun TodoScreen(viewModel: TodoViewModel = viewModel()) {
    val todos by viewModel.todos.collectAsState()
    TodoContent(todos = todos, onAdd = viewModel::addTodo)
}
```

### 解决了什么 ###

- ✅ 数据驱动 UI，不再依赖手工同步。
- ✅ 配置变更安全——ViewModel 与 Activity 生命周期解耦。
- ✅ 测试简单——直接测 ViewModel 暴露的 StateFlow。

### 没解决什么 ###

- ❌ 没有明确的"事件"概念——UI 触发的动作只能调 ViewModel 方法，意图传递不显式。
- ❌ 复杂页面里，StateFlow 越来越多时，状态管理变得混乱。

## MVI：让"用户意图"也成数据流 ##

### 演化动机 ###

MVVM 没解决：*用户的操作（点击、滑动、输入）和数据状态往往是耦合的*——MVI 把它们统一抽象。

MVI 的三要素：

- Model/State：`UiState`——单一不可变状态。
- View：渲染 State，触发 Intent。
- Intent：用户的意图（如 `AddTodo("买菜")`、`Refresh`）。

```java
// 单一状态
data class TodoUiState(
    val todos: List<Todo> = emptyList(),
    val input: String = "",
    val isLoading: Boolean = false,
    val error: String? = null
)

// 意图
sealed interface TodoIntent {
    data class UpdateInput(val text: String) : TodoIntent
    data class AddTodo(val text: String) : TodoIntent
    object Refresh : TodoIntent
}

// 单事件
sealed interface TodoEffect {
    data class ShowToast(val msg: String) : TodoEffect
}

// ViewModel
class TodoViewModel : ViewModel() {
    private val _state = MutableStateFlow(TodoUiState())
    val state: StateFlow<TodoUiState> = _state

    private val _effects = Channel<TodoEffect>(Channel.BUFFERED)
    val effects = _effects.receiveAsFlow()

    fun onIntent(intent: TodoIntent) {
        when (intent) {
            is TodoIntent.UpdateInput -> _state.update { it.copy(input = intent.text) }
            is TodoIntent.AddTodo -> addTodo(intent.text)
            TodoIntent.Refresh -> refresh()
        }
    }

    private fun addTodo(text: String) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            runCatching { repo.insert(Todo(text)) }
                .onSuccess {
                    _state.update { it.copy(input = "", isLoading = false, todos = repo.getAll()) }
                    _effects.send(TodoEffect.ShowToast("已添加"))
                }
                .onFailure { e ->
                    _state.update { it.copy(isLoading = false, error = e.message) }
                }
        }
    }
}
```

### 解决了什么 ###

- ✅ 状态集中——任何时刻 UI 都由单一 State 决定。
- ✅ 意图显式——所有用户操作都通过 Intent，方便审计。
- ✅ 副作用隔离——发一次性事件（Toast、跳转）用 Effect，State 只存"持续状态"。

### 代价 ###

- ❌ 每个屏幕都要设计 State/Intent/Effect 三件套，前期投入大。
- ❌ 小页面用 MVI 是过度设计。

## 真实选型建议 ##

我给团队的选型准则：



我的团队在 2025 年初切到了 *MVI + Compose + 协程* 这个组合，一年后看：

- 状态 bug 减少了 40% 。
- 新人接手项目速度加快——看 State 数据类就能理解整个页面。
- 复杂度没有显著上升——Intent/Effect 在小页面里也就 10 行。

## 一个真实的"中等页面"完整 MVI 样板 ##

为了让今天的文章不只停留在概念，我留一个完整的 MVI 骨架，把 Compose + 协程 + State 一次串起来。下一篇文章里我们会用这个骨架作为性能优化的载体。

```java
@Composable
fun TodoScreen(
    viewModel: TodoViewModel = viewModel(),
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() }
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    // 一次性事件
    LaunchedEffect(Unit) {
        viewModel.effects.collect { effect ->
            when (effect) {
                is TodoEffect.ShowToast -> snackbarHostState.showSnackbar(effect.msg)
            }
        }
    }

    // 渲染
    Scaffold(snackbarHost = { SnackbarHost(snackbarHostState) }) { padding ->
        Column(Modifier.padding(padding)) {
            TextField(
                value = state.input,
                onValueChange = { viewModel.onIntent(TodoIntent.UpdateInput(it)) }
            )
            Button(onClick = { viewModel.onIntent(TodoIntent.AddTodo(state.input)) }) {
                Text("添加")
            }
            if (state.isLoading) CircularProgressIndicator()
            state.error?.let { Text(it, color = Color.Red) }
            LazyColumn {
                items(state.todos, key = { it.id }) { todo ->
                    Text(todo.text)
                }
            }
        }
    }
}
```

## 小结 ##

架构不是目的，可维护性才是。

- MVC：*不要*写新项目再用，但你能一眼看出它的失败在哪。
- MVP：*适合*老项目渐进改造，但成本高。
- MVVM：*当前主流*，推荐大多数新页面使用。
- MVI：*复杂页面的银弹*，小页面慎用。
