---
lastUpdated: true
commentabled: true
recommended: true
title: Kotlin Flow 才是数据流的正确打开方式
description: LiveData 该退休了
date: 2026-08-26 12:55:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

说实话，我从 LiveData 迁移到 Flow 的过程挺痛苦的。LiveData 用了三年，顺手得很，突然让我换成 Flow，心里一百个不情愿。但真用上之后才发现——回不去了。这篇文章就是我踩完坑之后的总结，帮你少走弯路。

## 先搞清楚：Flow 到底是个啥 ##

一句话：Flow 就是协程里的数据流，能持续、多次给你发送数据。

类比一下：

- `suspend` 函数 → 买一部电影，下载完看一次就结束，只返回一次结果
- Flow → 看直播，主播持续推送画面，你能一直收到新内容，多次、持续发送数据

项目里的例子：

- 用 suspend 函数：请求一次新闻列表，拿到结果就结束
- 用 Flow：监听新闻列表的变化，数据库/接口有新数据就自动推送，UI 自动更新

## 为什么一定要从 LiveData 迁移到 Flow ##

直接说痛点：

- LiveData 和协程配合很别扭：setValue 只能在主线程，postValue 又有丢数据的坑，协程里用起来各种扭捏
- LiveData 操作符少得可怜：就 map、switchMap 那几个，稍微复杂点的数据流处理就捉襟见肘
- LiveData 只能管 UI 状态：Repository 层用 LiveData？不合适，它天生就是给 UI 设计的
- Google 官方都推荐 Flow 了：Jetpack 全家桶全面支持 Flow，这是方向

| 对比维度 | LiveData | Flow |
| :--- | :--- | :--- |
| 底层本质 | 数据持有者+观察者模式 | 协程+数据流 |
| 生命周期感知 | 原生自动支持 | 需手动 `repeatOnLifecycle` |
| 操作符数量 | 极少（`map`、`switchMap`） | 超过100个 |
| 线程切换 | 固定主线程 | `flowOn` 随意切 |
| 异常处理 | 弱，直接崩溃 | `catch` 操作符捕获 |
| 背压支持 | 原生支持 |  |

## 冷流 vs 热流：最核心的概念 ##

这是 Flow 里最容易搞混的，必须先搞懂。

### 冷流（默认的 Flow） ###

你不 collect，它就不干活；你 collect 一次，它就重新执行一次。

类比点外卖：你不点单（不 collect），商家不会做饭（不执行 emit）；你下一次单，做一份饭；再下一次单，再做一份。

```kotlin
val newsFlow = flow {
    println("开始请求新闻")
    emit(ApiResponse.Loading)
    val data = api.getNewsList()
    emit(ApiResponse.Success(data))
}

// 第一次 collect：执行一次，打印"开始请求新闻"
newsFlow.collect { println("第一次收到：$it") }

// 第二次 collect：重新执行，再次打印"开始请求新闻"
newsFlow.collect { println("第二次收到：$it") }
```

### 热流（StateFlow / SharedFlow） ###

不管你订不订阅，它都在发数据；多个订阅者共享同一份数据。

类比看电视：不管你开不开电视，电视台都在播；你打开电视只能收到当前播的内容，收不到之前的。

```kotlin
// 热流：即使还没人 collect，也能存数据
val stateFlow = MutableStateFlow<ApiResponse<List<News>>>(ApiResponse.Loading)

// 先设置数据，此时还没有订阅者
stateFlow.value = ApiResponse.Success(listOf(News("新闻1")))

// 订阅：直接收到最新值
stateFlow.collect { println("收到：$it") }
```

### 一张表记住区别 ###

| 特性 | 冷流 (Flow) | 热流 (StateFlow/SharedFlow) |
| :--- | :--- | :--- |
| 不 collect 时 | 不执行任何代码 | 照常运行 |
| 多次 collect | 每次都重新执行 | 共享同一份数据 |
| 类比 | 点外卖 | 看电视 |
| 用途 | 网络请求、数据库查询 | UI 状态、事件通知 |

## Flow 基础用法 ##

### 创建 Flow（4种方式） ###

```kotlin
// 方式1：flow { } 构建器（最常用，90%场景用它）
fun getNewsFlow(): Flow<ApiResponse<List<News>>> = flow {
    emit(ApiResponse.Loading)
    val data = api.getNewsList()
    emit(ApiResponse.Success(data))
}

// 方式2：flowOf() 快速创建固定数据
val numberFlow = flowOf(1, 2, 3)

// 方式3：asFlow() 集合转 Flow
listOf(News("新闻1"), News("新闻2")).asFlow()

// 方式4：channelFlow 并发发送数据（进阶用）
channelFlow {
    send(1)
    send(2)
}
```

### 收集 Flow ###

```kotlin
class NewsViewModel : ViewModel() {
    fun loadNews() {
        viewModelScope.launch {
            getNewsFlow().collect { state ->
                when (state) {
                    is ApiResponse.Loading -> { /* 显示加载 */ }
                    is ApiResponse.Success -> { /* 显示列表 */ }
                    is ApiResponse.Error -> { /* 提示错误 */ }
                }
            }
        }
    }
}
```

三个注意点：

- collect 是挂起函数，必须在协程里调用
- collect 会阻塞当前协程，后面的代码要等 Flow 结束才执行
- 冷流每次 collect 都会重新执行

## flowOn：线程切换的核心 ##

这是 Flow 最灵活的地方，也是新手最容易迷糊的。

> 一句话记住：flowOn 只切换它「上面」的代码的线程，绝对不影响它「下面」的代码。

```java
fun getNewsFlow(): Flow<ApiResponse<List<News>>> {
    return flow {
        // 【IO 子线程】受 flowOn 影响
        emit(ApiResponse.Loading)
        val data = api.getNewsList()   // 网络请求，在 IO 线程
        emit(ApiResponse.Success(data))

    // flowOn 切换上游到 IO 线程
    }.flowOn(Dispatchers.IO)
     .catch { e ->
         // 【主线程】捕获异常
         emit(ApiResponse.Error(e.message ?: "请求失败"))
     }
}

// ViewModel 中 collect —— 【主线程】
viewModelScope.launch {
    getNewsFlow().collect { state ->
        // 这里在主线程，可以直接更新 UI
        updateUI(state)
    }
}
```

和 LiveData 的对比：LiveData 观察者回调永远在主线程，写法简单但不灵活。Flow 的 flowOn 可以让你精确控制哪段代码跑在哪个线程，比 LiveData 的 setValue/postValue 靠谱多了。

## Flow 操作符实战 ##

Flow 有上百个操作符，这里只讲最常用的。

### 转换操作符 ###

```java
// map：转换数据
userFlow.map { user -> user.name }

// filter：过滤
userFlow.filter { it.age > 18 }

// take：取前 N 个
numberFlow.take(3)

// debounce：防抖（搜索场景必备）
searchQuery.debounce(300)

// distinctUntilChanged：去重，连续相同值只发一次
stateFlow.distinctUntilChanged()

// flatMapLatest：切换最新数据源（替代 switchMap）
categoryFlow.flatMapLatest { category ->
    repository.getNewsByCategory(category)
}
```

## 异常处理 ##

```kotlin
fun getNewsFlow(): Flow<ApiResponse<List<News>>> = flow {
    emit(ApiResponse.Success(api.getNewsList()))
}.catch { e ->
    // 捕获上游所有异常，不会让 App 崩溃
    emit(ApiResponse.Error(e.message ?: "未知错误"))
}.onCompletion {
    // Flow 结束时回调（无论成功还是异常）
    hideLoading()
}
```

对比 LiveData：LiveData 没有内建的异常处理机制，异常直接抛出去可能崩 App。Flow 的 catch 操作符让你优雅地处理错误。

## StateFlow vs SharedFlow ##

### StateFlow：替代 LiveData 的 UI 状态管理 ###

StateFlow 是热流，始终持有最新值，新订阅者立即收到当前状态——行为和 LiveData 非常像。

```kotlin
class NewsViewModel : ViewModel() {
    // 私有：可变
    private val _uiState = MutableStateFlow<ApiResponse<List<News>>>(ApiResponse.Loading)
    // 公开：只读
    val uiState: StateFlow<ApiResponse<List<News>>> = _uiState.asStateFlow()

    fun loadNews() {
        viewModelScope.launch {
            val result = api.getNewsList()
            _uiState.value = ApiResponse.Success(result)
        }
    }
}
```

和 LiveData 的写法几乎一模一样，只是 MutableLiveData 换成了 MutableStateFlow，LiveData 换成了 StateFlow。

### SharedFlow：一次性事件的正确姿势 ###

SharedFlow 专门用来发一次性事件（Toast、页面跳转等），这是 LiveData 搞不好的场景。

```kotlin
class NewsViewModel : ViewModel() {
    // replay = 0：新订阅者收不到之前的事件
    private val _eventFlow = MutableSharedFlow<String>(replay = 0)
    val eventFlow: SharedFlow<String> = _eventFlow.asSharedFlow()

    fun collectNews(news: News) {
        viewModelScope.launch {
            val result = dao.collectNews(news)
            if (result) {
                _eventFlow.emit("收藏成功")
            }
        }
    }
}
```

### 什么时候用哪个 ###

| 场景 | 用什么 | 为什么 |
| :--- | :--- | :--- |
| UI 状态（列表数据、加载状态） | StateFlow | 始终有值，新订阅者收到最新状态 |
| 一次性事件（Toast、导航） | SharedFlow | replay=0，不会重复消费 |
| 网络请求/数据库查询 | 冷流 Flow | 按需执行，不浪费资源 |

踩坑提醒：千万别用 StateFlow 发 Toast 事件！页面旋转重建时，StateFlow 会把最新值再推一次，Toast 就会重复弹。用 SharedFlow + replay=0 才对。

## UI 层怎么收集 Flow ##

这是从 LiveData 迁移过来最大的变化——Flow 原生不感知 Android 生命周期，必须手动绑定。

## 写法对比 ##

```java
// LiveData：自动感知生命周期，一行搞定
viewModel.users.observe(this) { users ->
    updateUI(users)
}

// Flow：必须用 repeatOnLifecycle 绑定生命周期
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.uiState.collect { state ->
            updateUI(state)
        }
    }
}
```

为什么必须用 repeatOnLifecycle：

- 页面 STARTED → 开始收集
- 页面 STOPPED → 停止收集（省资源）
- 页面 DESTROYED → 取消协程（防泄漏）

效果和 LiveData 完全一致，只是写法多几行。但这个"多几行"换来了更强大的数据流处理能力，值得。

## 全流程实战：Flow 处理网络请求 ##

从 Repository 到 ViewModel 到 UI，一套完整的 Flow 网络请求方案。

### Repository 层 ###

```kotlin
class NewsRepository @Inject constructor(
    private val api: NewsApi,
    private val dao: NewsDao
) {
    fun loadNewsFlow(category: String, page: Int): Flow<ApiResponse<List<News>>> {
        return flow {
            emit(ApiResponse.Loading)

            // 先读缓存，快速显示
            val cacheList = dao.getNewsByCategory(category)
            if (cacheList.isNotEmpty()) {
                emit(ApiResponse.Success(cacheList))
            }

            // 再请求网络
            val netList = api.getNewsList(category, page, 20)
            dao.insertNewsList(netList)
            emit(ApiResponse.Success(netList))

        }.flowOn(Dispatchers.IO)  // 耗时操作全在 IO 线程
         .catch { e ->
             emit(ApiResponse.Error(e.message ?: "网络请求失败"))
         }
    }
}
```

### ViewModel 层 ###

```kotlin
@HiltViewModel
class NewsViewModel @Inject constructor(
    private val repository: NewsRepository
) : ViewModel() {
    // UI 状态用 StateFlow
    private val _uiState = MutableStateFlow<ApiResponse<List<News>>>(ApiResponse.Loading)
    val uiState: StateFlow<ApiResponse<List<News>>> = _uiState.asStateFlow()

    // 一次性事件用 SharedFlow
    private val _eventFlow = MutableSharedFlow<String>()
    val eventFlow: SharedFlow<String> = _eventFlow.asSharedFlow()

    fun loadNews(category: String = "推荐") {
        viewModelScope.launch {
            repository.loadNewsFlow(category, 1).collect { state ->
                _uiState.value = state
            }
        }
    }

    fun collectNews(news: News) {
        viewModelScope.launch {
            repository.toggleCollect(news)
            _eventFlow.emit("收藏成功")
        }
    }
}
```

### UI 层 ###

```kotlin
@AndroidEntryPoint
class NewsFragment : Fragment() {
    private val viewModel: NewsViewModel by viewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // 观察 UI 状态
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    when (state) {
                        is ApiResponse.Loading -> showLoading()
                        is ApiResponse.Success -> showList(state.data)
                        is ApiResponse.Error -> showError(state.message)
                    }
                }
            }
        }

        // 观察一次性事件
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.eventFlow.collect { message ->
                    showToast(message)
                }
            }
        }
    }
}
```

## 新手必踩的 5 个坑 ##

### 坑1：忘记加 flowOn，主线程网络请求直接 ANR ###

```java
// ❌ 错误：flow 里的网络请求没有 flowOn
flow { emit(api.getNewsList()) }  // 主线程执行网络请求，ANR！

// ✅ 正确：加 flowOn
flow { emit(api.getNewsList()) }.flowOn(Dispatchers.IO)
```

### 坑2：同一个 launch 里写两个 collect，第二个永远执行不到 ###

```java
// ❌ 错误：collect 是挂起函数，会阻塞
viewModelScope.launch {
    flow1.collect { }   // 阻塞在这里
    flow2.collect { }   // 永远执行不到
}

// ✅ 正确：每个 collect 单独开协程
viewModelScope.launch {
    launch { flow1.collect { } }
    launch { flow2.collect { } }
}
```

### 坑3：用 StateFlow 发一次性事件，页面旋转重复弹 Toast ###

```java
// ❌ 错误
private val _toast = MutableStateFlow("")  // 页面重建会重新收到
// ✅ 正确
private val _toast = MutableSharedFlow<String>(replay = 0)  // 只消费一次
```

### 坑4：在 GlobalScope 里收集 Flow，页面销毁后还在跑 ###

```java
// ❌ 错误
GlobalScope.launch { flow.collect { } }  // 内存泄漏
// ✅ 正确
viewModelScope.launch { flow.collect { } }  // 页面销毁自动取消
```

### 坑5：冷流每次 collect 都重复请求网络 ###

```kotlin
// ❌ 问题：按钮点击多次 = 请求多次
button.setOnClickListener {
    lifecycleScope.launch { newsFlow.collect { } }  // 每次都重新执行
}

// ✅ 方案：用 shareIn 把冷流转成热流，多订阅者共享
val sharedNewsFlow = newsFlow.shareIn(
    viewModelScope,
    SharingStarted.WhileSubscribed(5000),
    replay = 1
)
```

## 总结 ##

| 概念 | 一句话 |
| :--- | :--- |
| Flow 冷流 | 你不 collect 它就不干活，每次 collect 重新执行 |
| StateFlow 热流 | 替代 LiveData 管 UI 状态，始终有值 |
| SharedFlow 热流 | 发一次性事件，replay=0 不重复消费 |
| flowOn | 只切上游线程，下游不管 |
| catch | 捕获上游异常，不会崩 App |
| repeatOnLifecycle | 给 Flow 加上和 LiveData 一样的生命周期安全 |

迁移建议：新项目直接上 Flow，老项目 Repository 层先迁 Flow，ViewModel 层的 LiveData 可以逐步替换成 StateFlow，不用一次性全改。
