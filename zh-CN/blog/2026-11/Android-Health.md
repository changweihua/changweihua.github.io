---
lastUpdated: true
commentabled: true
recommended: true
title: Android性能优化
description: 启动、内存、卡顿的一站式排查手册
date: 2026-11-05 10:15:00
pageClass: blog-page-class
cover: /covers/android.svg
---

性能优化是 Android 工程师晋升高位的必备能力，但也是*最容易被玄学化*的领域。

我听过太多错误的说法：

- "把 WebView 换成 X5 就快了"——其实你的卡顿和 WebView 关系不大。
- "加 LruCache 内存就够了"——其实 LruCache 救不了真正的内存泄漏。
- "上 Profile GPU Rendering 看到红线就优化"——其实那条红线很多 App 都有，不是性能瓶颈。

这篇文章我会用一种更"有方法论"的方式，带你系统地看 Android 性能优化的三个核心领域：

- *启动*——从图标点击到首屏可交互。
- *内存*——怎样稳定高效。
- *卡顿*——定位真正的元凶。

## 启动优化：三板斧把冷启动砍到 800ms 以内 ##

冷启动是用户对 App 的*第一印象*。我们的目标：

- *普通机型*（中端骁龙 778G）1 秒内展示首屏。
- *低端机型*（骁龙 660）1.5 秒内展示首屏。

如果你的 App 冷启动超过 2 秒，Google Play 会直接给出*启动评分警告*——影响分发。

### 第一板斧：Application 里不要做重活 ###

很多团队在 `Application.onCreate` 里塞了十几个 SDK 初始化：

```java
// 错误示范
override fun onCreate() {
    super.onCreate()
    Bugly.init(this)
    Tink.init(this)
    MMKV.initialize(this)
    ARouter.init(this)
    BlockCanary.install(this)
    Toaster.init(this)
    // ... 还有 8 个
}
```

实测：上面这段代码在低端机上要 600-900ms。

#### 正确做法：延迟初始化 ####

```java
class App : Application() {
    override fun onCreate() {
        super.onCreate()
        // 只初始化必须同步的（如多进程需要的）
        MMKV.initialize(this)

        // 其他全部延迟
        AppStartup.getInstance()
            .addExecutor { executor ->
                executor.submit { Bugly.init(this) }
                executor.submit { Tink.init(this) }
            }
    }
}
```

更激进的策略：用到再初始化。Bugly 等真正发生 crash 时再 init 也来得及。

### 第二板斧：Splash 替身 + 异步 inflate 主页 ###

冷启动时间构成：

- 加载 + 启动 Application
- 启动第一个 Activity（创建 Window、DecorView、setContentView）
- 第一次 measure + layout + draw + 渲染

`setContentView` 如果 inflate 一个复杂 XML（比如 ConstraintLayout 嵌套 8 层），启动时间会陡增。

优化策略：

- 主 Activity 用 Compose——首屏 inflate 的成本低。
- Splash 用 windowBackground 主题：在主题里给 windowBackground 设置一张静态图，省去 inflate 第一个 XML。
- 预加载首屏数据：在 Application 启动时就开始预读首页数据（用 JobIntentService 或协程）。

### 第三板斧：Baseline Profile + R8 ###

Baseline Profile 是 Google 推出的"预编译"机制——通过 ART 的 AOT 编译让关键代码路径跑得更快。

1. 用 Macrobenchmark 录制用户冷启动路径
2. 自动生成 `baseline-prof.txt`
3. 把它放进 APK 的 `assets/` 里
4. 用户首次启动后 ART 自动使用，预热关键代码

实际收益：中低端机型冷启动快 20-40%

`R8` 是 ProGuard 的现代替代。开启后默认会做：

- 类和方法名混淆
- 死代码消除
- 优化字节码

配置建议：

```bash
buildTypes {
    release {
        isMinifyEnabled = true
        isShrinkResources = true
        proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"))
    }
}
```

## 内存优化：5 个真实场景 + 定位工具 ##

内存泄漏不是"OOM 才算"——更多时候是 GC 频繁、页面卡顿、耗电增加。

### 场景 1：Handler / Runnable 引用 Activity ###

```java
// 错误：Handler 持有 Activity，Activity 持有 DecorView
class LeakyActivity : AppCompatActivity() {
    private val handler = Handler()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handler.postDelayed({
            // 用户退出页面，这段代码还会执行
            doSomething()
        }, 60_000)
    }
}
```

修复：用 `WeakReference` 或者 `lifecycleScope`（推荐）。

### 场景 2：匿名内部类持外部引用 ###

```java
button.setOnClickListener(object : View.OnClickListener {
    override fun onClick(v: View) {
        // 这个匿名类隐式持有了外部 Activity
    }
})
```

修复：转成 `lambda` 后在 `Compose` 里没有这个问题。Java 时代常用 `WeakReference`。

### 场景 3：静态集合持有 View ###

```java
object ToastManager {
    private val toasts = mutableListOf<Toast>()
    fun show(text: String, ctx: Context) {
        val toast = Toast.makeText(ctx, text, Toast.LENGTH_SHORT)
        toasts.add(toast)  // 错误！ctx 被持续持有
        toast.show()
    }
}
```

修复：用 `Application` 替代 `Activity` 上下文（短显示用 `Application` 足够）。

### 场景 4：Bitmap 没回收 ###

```java
// 错误
val bitmap = BitmapFactory.decodeStream(inputStream)
// bitmap 持续被引用
```

修复：

- 用 Glide/Coil 自动管理。
- 自己管理时，在不用的时机 `recycle()`。

### 场景 5：监听器忘记反注册 ###

```java
// 错误
override fun onResume() {
    super.onResume()
    sensorManager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_NORMAL)
    // 忘记在 onPause 反注册
}
```

修复：严格 `onResume` 注册、`onPause` 取消。

### 内存检测工具链 ###

| 工具 | 用途 |
| :--- | :--- |
| LeakCanary | 自动检测 Activity/Fragment 泄漏 |
| Android Studio Memory Profiler | 抓取内存快照、对比 |
| Profile Memory | 实时观察 Heap |
| Perfetto | 系统级跟踪 |
| Android Studio Inspections | 静态代码扫描 |

最实用的组合：`LeakCanary` + `Memory Profiler`。前者发现，后者定位。

## 卡顿：真正的元凶往往是主线程上的"小累积" ##

我经常被问："我们的 App 卡顿，但是查下来主线程并没有耗时操作啊？"

答案：*主线程*上做的事情太多，单个不耗时，但累计起来就超 16ms。

来看一个真实例子：

```java
override fun onBindViewHolder(holder: ViewHolder, position: Int) {
    val item = items[position]
    holder.title.text = item.title
    holder.subtitle.text = item.subtitle
    Glide.with(holder.image).load(item.cover).into(holder.image)
    holder.itemView.setOnClickListener { ... }
}
```

每次 RecyclerView 滚动，单个 bind 不超 5ms。但*快速滚动时*：

- 1 秒内触发 60 次 bind → 300ms 总耗时
- 等于用掉了 18 帧的渲染时间
- 这就是为什么"看起来没问题"的代码，滚动起来卡。

### 卡顿定位四件套 ###

#### Choreographer.FrameCallback ####

```java
Choreographer.getInstance().postFrameCallback { frameTimeNanos ->
    val jitter = SystemClock.elapsedRealtimeNanos() - frameTimeNanos - 16_666_667
    if (jitter > 10_000_000) { // 10ms
        Log.w("Jank", "Frame dropped: ${jitter / 1_000_000}ms")
    }
}
```

#### SysTrace + Perfetto ####

录一段用户操作流程，导出 `.trace` 文件。 重点看：

- 主线程长任务（黄色帧）
- CPU 调度等待（红色阻塞）

#### Strict Mode ####

```java
StrictMode.setThreadPolicy(
    StrictMode.ThreadPolicy.Builder()
        .detectDiskReads().detectDiskWrites().detectNetwork()
        .penaltyLog().build()
)
```

#### Baseline Profile（再次提及） ####

Baseline Profile 对卡顿帮助特别大——它会预热你 App 的关键代码路径，让 JIT 不会在用户使用时卡住。

### 卡顿真正的优化策略 ###

| 等级 | 策略 |
| :--- | :--- |
| L1 | 主线程不再做 IO |
| L2 | 列表 item 用 ViewHolder 复用（RecyclerView/Compose 自动） |
| L3 | 复杂页面的初始化异步化 |
| L4 | 启用 Baseline Profile |
| L5 | Compose 用 `derivedStateOf` 减少重组 |

## 耗电：被遗忘的第三战场 ##

很多团队性能优化只盯着启动和内存，*忽略耗电*——但用户感知最强的是耗电。

### 高耗电的 4 个常见场景 ###

- 后台定位不停止——用户离开后还在持续 GPS。
- WakeLock 拿着不释放——锁屏后 CPU 还在跑。
- 频繁网络请求——Wakeful 心跳包、轮询接口。
- WakefulBroadcastReceiver + 短暂 Service——最容易踩。

### 优化工具 ###

- Battery Historian：Google 官方，分析 wakeup 锁和耗电。
- WorkManager：把所有"不必立即执行的任务"用 WorkManager 统一调度，系统会合并去重。

## 性能优化的方法论总结 ##

性能问题不是"哪里慢就改哪里"——它是*概率游戏*。系统级优化效果 >> 微观优化。

*该做的高 ROI 事情*：

- ✅ 启动时长用 Baseline Profile + 异步化（一次投入，长期受益）
- ✅ 内存用 LeakCanary 自动监控（几乎零成本）
- ✅ 卡顿用 Choreographer 打点定位
- ✅ 耗电统一走 WorkManager

*不该做*：

- ❌ 纠结于某个具体函数的微秒级优化
- ❌ 把 Bitmap 用 LruCache 包到 9 层（治标不治本）
- ❌ 在没数据支撑的情况下猜测瓶颈

## 小结 ##

性能优化有一个前提：*必须测量，不能猜测*。Profile 工具链比技巧更重要。

- 启动：Application 瘦身 + Splash 替身 + Baseline Profile。
- 内存：5 个真实场景 + LeakCanary 自动监控 + Memory Profiler 定位。
- 卡顿：主线程精简 + 列表优化 + Choreographer / Perfetto 工具链。
- 耗电：WorkManager 统一调度 + 监控用 Battery Historian。
