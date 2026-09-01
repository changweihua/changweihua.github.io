---
lastUpdated: true
commentabled: true
recommended: true
title: Coil：Kotlin 时代的图片加载库
description: Glide 该换了
date: 2026-08-26 12:00:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---

如果你现在还在用 Glide 加载图片，我建议你有空了解一下 Coil。

不是 Glide 不好，而是 Coil 更适合 Kotlin 项目。这不是技术选型上的「喜新厌旧」，而是真的香——代码写起来更简洁，依赖更轻量，和协程配合起来天衣无缝。

今天这篇，就来聊聊 Coil 的用法，顺便解释一下为什么说它是 Kotlin 项目的「原装配件」。

## 为什么选 Coil 而不是 Glide？ ##

先说结论：如果你用 Kotlin 开发 Android，选 Coil；如果你还在用 Java，Glide 依然是稳的选择。

具体来说，Coil 有这么几个优势：

### Kotlin-First 设计 ###

Coil 从出生就是为了 Kotlin 量身打造的。你看它的名字——Coroutine Image Loader，协程图片加载器，天生就是 Kotlin 的一部分。

```kotlin
// Coil 的写法 - Kotlin 味十足
imageView.load(url) {
    crossfade(true)
    transformations(CircleCropTransformation())
}
```

对比 Glide 那种带注解、Module 配置的老派写法，Coil 用 DSL 风格的配置块，Kotlin 开发者写起来非常顺手。

### 协程驱动，性能更优 ###

Coil 基于 Kotlin 协程处理异步任务，在并发场景下表现更稳。测试数据显示，Coil 在图片加载速度上比 Glide 和 Picasso 都快那么一点点。

当然，有人会说 Glide 的双层缓存（原始图 + 处理后图）让二次加载更快。确实，但 Coil 凭借更轻量的架构和协程取消机制，在大多数场景下完全不虚。

### 体积更小 ###

Glide 依赖大概 4-5 个库，而 Coil 核心包非常轻量。如果你对包大小敏感，Coil 更适合你。

```txt
Glide: ~500KB (含依赖)
Coil: ~300KB (核心库)
```

### Compose 原生支持 ###

这点很重要。Google 官方 Jetpack Compose 文档里，推荐的图片加载方案就是 Coil。对于 Compose 项目，Coil 就是「官方指定用裤」。

```kotlin
// Compose 中加载图片，一行代码
AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = "图片描述"
)
```

Glide 也有 Compose 库，但体验上总是差点意思。

## 基本用法 ##

先把依赖加上

```gradle
// build.gradle.kts
dependencies {
    // 核心库
    implementation("io.coil-kt:coil:3.0.4")

    // Compose 支持
    implementation("io.coil-kt:coil-compose:3.0.4")

    // GIF 支持
    implementation("io.coil-kt:coil-gif:3.0.4")

    // SVG 支持
    implementation("io.coil-kt:coil-svg:3.0.4")
}
```

### 最简单的加载 ###

```kotlin
// 一行代码搞定
imageView.load("https://example.com/avatar.jpg")

// 或者带配置
imageView.load("https://example.com/avatar.jpg") {
    crossfade(true)  // 淡入动画
    crossfade(300)   // 动画时长 300ms
}
```

### 使用 ImageRequest 精细控制 ###

当你想复用配置或者需要更复杂的逻辑时，用 ImageRequest：

```java
val request = ImageRequest.Builder(context)
    .data("https://example.com/avatar.jpg")
    .target(imageView)
    .crossfade(true)
    .placeholder(R.drawable.placeholder)      // 加载中显示
    .error(R.drawable.error_image)            // 加载失败显示
    .fallback(R.drawable.default_avatar)       // url 为 null 时显示
    .size(300, 300)                           // 指定图片尺寸
    .memoryCachePolicy(CachePolicy.ENABLED)   // 内存缓存策略
    .diskCachePolicy(CachePolicy.ENABLED)     // 磁盘缓存策略
    .build()

// 执行请求
context.imageLoader.enqueue(request)
```

小贴士：placeholder、error、fallback 三者的区别：

- placeholder：加载中显示
- error：加载失败（网络错误、404 等）显示
- fallback：当传入的 url 为 null 时显示


### 加载本地资源 ###

```java
// drawable
imageView.load(R.drawable.avatar)

// File
imageView.load(File("/path/to/image.jpg"))

// Uri
imageView.load(Uri.parse("content://..."))
```

### 监听加载状态 ###

```java
val request = ImageRequest.Builder(context)
    .data("https://example.com/image.jpg")
    .target(
        onStart = { /* 开始加载 */ },
        onSuccess = { drawable ->
            // 加载成功
            imageView.setImageDrawable(drawable)
        },
        onError = { errorDrawable ->
            // 加载失败
            imageView.setImageDrawable(errorDrawable)
        }
    )
    .build()

context.imageLoader.enqueue(request)
```

## Transformations：图片变换 ##

Coil 内置了几个常用的图片变换，用起来非常方便。

### 圆形裁剪（CircleCrop） ###

```java
imageView.load("https://example.com/avatar.jpg") {
    transformations(CircleCropTransformation())
}
```

### 圆角矩形 ###

```java
// 四个角统一圆角
imageView.load("https://example.com/cover.jpg") {
    transformations(RoundedCornersTransformation(16f))
}

// 单独控制每个角
imageView.load("https://example.com/cover.jpg") {
    transformations(
        RoundedCornersTransformation(
            topLeft = 16f,
            topRight = 16f,
            bottomLeft = 0f,
            bottomRight = 0f  // 比如卡片顶部圆角
        )
    )
}
```

Compose 小技巧：在 Compose 中，如果只是显示层面要圆角，直接用 `Modifier.clip()` 更高效，没必要走 Transformation：

```kotlin
AsyncImage(
    model = "https://example.com/cover.jpg",
    modifier = Modifier.clip(RoundedCornerShape(16.dp)),
    contentDescription = null
)
```

### 高斯模糊 ###

```java
// 需要额外依赖
// implementation("io.coil-kt:coil-base:3.0.4")

imageView.load("https://example.com/bg.jpg") {
    transformations(BlurTransformation(context, radius = 10f, sampling = 5f))
}
```

参数说明：

- radius：模糊半径，越大越模糊
- sampling：采样率，越大计算越快但效果略差

### 灰度图 ###

```java
imageView.load("https://example.com/photo.jpg") {
    transformations(GrayscaleTransformation())
}
```

### 组合使用 ###

多个 Transformation 可以一起用：

```java
imageView.load("https://example.com/avatar.jpg") {
    transformations(
        CircleCropTransformation(),
        BlurTransformation(context, radius = 2f)  // 先模糊再裁圆
    )
}
```

## 自定义 Transformation ##

有时候内置的 Transformation 满足不了需求，得自己写。

比如产品提了个需求：给图片加个颜色叠加效果（类似 CSS 的 `background-blend-mode: multiply`）。

### 实现步骤 ###

- 创建一个类实现 `Transformation` 接口
- 重写 `key()` 方法返回缓存 key
- 重写 `transform()` 方法实现变换逻辑

```kotlin
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Paint
import coil.size.Size
import coil.transform.Transformation

class ColorOverlayTransformation(
    private val color: Int,          // 叠加颜色
    private val alpha: Float = 0.3f  // 透明度
) : Transformation {

    // 缓存 key，必须唯一
    override val cacheKey: String
        get() = "color_overlay_${color}_${alpha}"

    // 执行变换
    override suspend fun transform(
        input: Bitmap,               // 原始图片
        size: Size                   // 目标尺寸
    ): Bitmap {
        // 创建一个可变的输出 bitmap
        val output = input.copy(Bitmap.Config.ARGB_8888, true)

        // 绘制颜色叠加
        val canvas = Canvas(output)
        val paint = Paint().apply {
            colorFilter = ColorMatrixColorFilter(
                ColorMatrix().apply {
                    setScale(
                        android.graphics.Color.red(color) / 255f,
                        android.graphics.Color.green(color) / 255f,
                        android.graphics.Color.blue(color) / 255f,
                        alpha
                    )
                }
            )
        }

        canvas.drawBitmap(input, 0f, 0f, paint)

        return output
    }
}
```

### 使用自定义 Transformation ###

```java
imageView.load("https://example.com/photo.jpg") {
    transformations(
        ColorOverlayTransformation(
            color = android.graphics.Color.parseColor("#FF5722"),
            alpha = 0.4f
        )
    )
}
```

### 注意事项 ###

- 性能问题：Transformation 在主线程执行（虽然底层有协程调度），如果变换复杂，要考虑异步处理或缓存。
- 内存问题：创建新的 Bitmap 会占用额外内存，大图处理时注意 OOM 风险。
- 缓存 key：key 必须唯一且稳定，否则会导致缓存混乱。

## 缓存策略 ##

Coil 的缓存分两层：内存缓存 + 磁盘缓存，理解这个很重要。

### 默认行为 ###

Coil 默认的缓存策略已经很合理了：

- 内存缓存：LRU 策略，最大使用 25% 可用内存
- 磁盘缓存：最大 100MB

### 自定义缓存配置 ###

在 Application 中配置全局 ImageLoader：

```kotlin
class MyApp : Application(), SingletonImageLoader.Factory {

    override fun newImageLoader(context: Context): ImageLoader {
        return ImageLoader.Builder(context)
            // 默认开启淡入
            .crossfade(true)

            // 内存缓存配置
            .memoryCache {
                MemoryCache.Builder()
                    .maxSizePercent(context, 0.25)  // 使用 25% 可用内存
                    .build()
            }

            // 磁盘缓存配置
            .diskCache {
                DiskCache.Builder()
                    .directory(context.cacheDir.resolve("image_cache"))
                    .maxSizeBytes(100 * 1024 * 1024)  // 100MB
                    .build()
            }

            // 日志（调试时开启）
            .logger(DebugLogger())

            .build()
    }
}
```

别忘了在 `AndroidManifest.xml` 中注册：

```xml
<application
    android:name=".MyApp"
    ... >
</application>
```

### 单次请求的缓存控制 ###

有时候需要针对特定请求调整缓存策略：

```java
val request = ImageRequest.Builder(context)
    .data("https://example.com/avatar.jpg")
    .memoryCachePolicy(CachePolicy.DISABLED)   // 禁用内存缓存
    .diskCachePolicy(CachePolicy.ENABLED)       // 启用磁盘缓存
    .networkCachePolicy(CachePolicy.ENABLED)   // 启用网络请求
    .build()
```

CachePolicy 可选值：

- ENABLED：启用缓存（默认）
- DISABLED：禁用缓存
- READ_ONLY：只读缓存
- WRITE_ONLY：只写缓存

### 低内存时的自动清理 ###

Coil 会自动响应系统内存回调，在低内存时清理内存缓存。但如果你想更激进一点：

```java
ImageLoader.Builder(context)
    // 应用退到后台时，限制内存缓存大小
    .memoryCacheMaxSizePercentWhileInBackground(0.1)  // 降为 10%
    .build()
```

## Compose 中使用 Coil ##

终于说到重头戏了。Compose 下的 Coil 使用体验非常丝滑。

### AsyncImage 基础用法 ###

```kotlin
import coil.compose.AsyncImage

@Composable
fun ProfileAvatar() {
    AsyncImage(
        model = "https://example.com/avatar.jpg",
        contentDescription = "用户头像",
        modifier = Modifier.size(80.dp)
    )
}
```

### 带占位图和错误处理 ###

```kotlin
@Composable
fun ArticleCover() {
    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data("https://example.com/cover.jpg")
            .crossfade(true)
            .build(),
        placeholder = painterResource(R.drawable.placeholder),
        error = painterResource(R.drawable.error),
        contentDescription = "文章封面",
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(16f / 9f)
    )
}
```

### 裁剪和缩放 ###

```kotlin
@Composable
fun UserAvatar() {
    AsyncImage(
        model = "https://example.com/user.jpg",
        contentDescription = "用户头像",
        contentScale = ContentScale.Crop,  // 裁剪填充
        modifier = Modifier
            .size(60.dp)
            .clip(CircleShape)  // Compose 裁剪，更高效
    )
}
```

ContentScale 选项：

- Fit：适应容器，可能有留白
- Crop：裁剪填充
- FillBounds：拉伸填充（会变形）
- Inside：缩小适应，不裁剪不拉伸

### SubcomposeAsyncImage：精细控制状态 ###

当你需要更细致地控制加载状态时，用 SubcomposeAsyncImage：

```java
@Composable
fun AdvancedImage() {
    SubcomposeAsyncImage(
        model = "https://example.com/photo.jpg",
        contentDescription = "照片",
        modifier = Modifier.fillMaxWidth()
    ) {
        val state by painter.state.collectAsState()

        when (state) {
            is AsyncImagePainter.State.Loading -> {
                // 加载中 - 显示进度条
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            is AsyncImagePainter.State.Success -> {
                // 加载成功 - 直接显示图片
                SubcomposeAsyncImageContent()
            }
            is AsyncImagePainter.State.Error -> {
                // 加载失败 - 显示错误提示
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.BrokenImage,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.error
                        )
                        Text(
                            text = "图片加载失败",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
            }
            is AsyncImagePainter.State.Empty -> {
                // 空的 - 什么也不显示
            }
        }
    }
}
```

> 性能提示：SubcomposeAsyncImage 比 AsyncImage 灵活，但性能稍差。对于列表中的图片，用 AsyncImage 就行；只在少数需要精细控制的场景用 SubcomposeAsyncImage。

### 监听状态变化 ###

更简单的方式，用 onState 回调：

```kotlin
@Composable
fun ImageWithState() {
    AsyncImage(
        model = "https://example.com/image.jpg",
        contentDescription = "图片",
        onState = { state ->
            when (state) {
                is AsyncImagePainter.State.Loading -> {
                    // 加载中
                }
                is AsyncImagePainter.State.Success -> {
                    // 加载成功
                }
                is AsyncImagePainter.State.Error -> {
                    // 加载失败
                }
                else -> {}
            }
        }
    )
}
```

## 列表中的图片加载：RecyclerView + Coil 最佳实践 ##

RecyclerView 是图片加载的主战场，这部分讲讲实战中怎么用 Coil。

### ViewHolder 中使用 ###

```kotlin
class ImageAdapter(
    private val imageUrls: List<String>
) : RecyclerView.Adapter<ImageAdapter.ImageViewHolder>() {

    class ImageViewHolder(
        private val binding: ItemImageBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(url: String) {
            binding.imageView.load(url) {
                crossfade(true)
                placeholder(R.drawable.placeholder)
                error(R.drawable.error)
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ImageViewHolder {
        val binding = ItemImageBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ImageViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ImageViewHolder, position: Int) {
        holder.bind(imageUrls[position])
    }

    override fun getItemCount() = imageUrls.size
}
```

### 复用与取消 ###

Coil 自动处理 ViewHolder 复用，不会加载到错误的 Item 上。但有一点要注意：

```kotlin
fun bind(url: String) {
    // Coil 会自动取消之前的请求
    // 但如果你想更明确地管理，可以这样做：
    binding.imageView.load(url) {
        // 请求标识，用于取消
        parameter("item_id", url.hashCode())
    }
}
```

### 缩略图优化 ###

列表中的图片通常不需要原图尺寸，用 `size()` 限制一下：

```kotlin
fun bind(url: String) {
    val request = ImageRequest.Builder(binding.root.context)
        .data(url)
        .target(binding.imageView)
        .size(200, 200)  // 限制尺寸，Coil 会 downsample
        .crossfade(true)
        .build()

    binding.root.context.imageLoader.enqueue(request)
}
```

这样 Coil 会下载/解码适合这个尺寸的图片，节省流量和内存。

### 预加载优化 ###

如果列表数据可预测，可以预加载即将显示的图片：

```kotlin
class ImageAdapter(
    private val prefetcher: Prefetcher  // Coil 预加载器
) {
    // 在 onViewAttachedToWindow 时开始预加载
    override fun onViewAttachedToWindow(holder: ImageViewHolder) {
        val position = holder.bindingAdapterPosition
        if (position != RecyclerView.NO_POSITION) {
            prefetcher.prefetch(imageUrls[position])
        }
    }

    // 配置预加载器
    companion object {
        fun createPrefetcher(context: Context, adapter: ImageAdapter): Prefetcher {
            return context.imageLoader.newPrefetchExecutor()
        }
    }
}
```

### Coil 与 ViewHolder 复用兼容性 ###

Coil 原生支持 ViewHolder 复用场景，它会在 View 被回收时自动取消请求。但如果你用的是自定义的取消逻辑，确保调用了 imageLoader.cancel(request)。

## 常见坑 ##

最后说几个实际项目中容易踩的坑。

### 缓存 key 冲突 ###

同一个图片 URL，但不同的 ImageRequest 配置（比如不同的尺寸、不同的 Transformation），会生成不同的缓存 key。Coil 默认按 (URL + transformations) 生成 key。

但有一种情况会出问题：URL 变了，但实际指向同一张图。

```java
// 这些会被当作不同的图片
.load("https://example.com/image.jpg?v=1")
.load("https://example.com/image.jpg?v=2")
```

解决方案：自定义 cacheKey

```java
ImageRequest.Builder(context)
    .data("https://example.com/image.jpg?v=1")
    .memoryCacheKey("https://example.com/image.jpg")  // 统一 key
    .build()
```

### SVG 支持 ###

Coil 默认不支持 SVG，需要额外引入 coil-svg：

```kotlin
implementation("io.coil-kt:coil-svg:3.0.4")
```

然后注册 SVG decoder：

```java
ImageLoader.Builder(context)
    .components {
        add(SvgDecoder.Factory())
    }
    .build()
```

使用：

```java
imageView.load("https://example.com/icon.svg") {
    // SVG 默认尺寸是 0，需要手动设置
    size(48, 48)
}
```

### 大图加载 OOM ###

加载高清原图时动不动 OOM，是新手常遇到的问题。

解决方案：

```java
ImageRequest.Builder(context)
    .data("https://example.com/huge_image.jpg")
    // 限制解码尺寸为目标 View 的 2 倍就够了
    .size(OriginalSize)
    // 或者明确限制最大尺寸
    .size(1080, 1920)
    // 允许 RGB_565 格式（内存减半，但色彩质量下降）
    .allowRgb565(true)
    .build()
```

另外，记得在 AndroidManifest.xml 中为大图 Activity 设置：

```xml
<activity
    android:largeHeap="true"
    ... />
```

但这不是银弹，主要还是靠前面的尺寸限制。

### 生命周期管理 ###

Coil 默认会自动感知 Activity/Fragment 生命周期，在页面销毁时取消请求。

但如果你在 ViewModel 或单例中持有 ImageView 引用，可能导致内存泄漏：

```kotlin
// 错误示例
class MyViewModel {
    val imageView: ImageView? = null  // 不要这样做！

    fun loadImage() {
        imageView?.load(url)
    }
}
```

正确做法：

```java
// 方案1：使用 View 的生命周期
imageView.load(url) {
    lifecycle(lifecycleOwner)
}

// 方案2：Compose 中交给系统管理
// AsyncImage 天生支持 Composable 生命周期，无需额外处理
```

### Glide 迁移到 Coil ###

如果你之前用的是 Glide，想迁移到 Coil，有个注意事项：

图片 URL 变化但 View 没更新。Glide 默认会检查 URL 是否变化，Coil 默认不会。

```java
// Glide 行为
Glide.with(context).load(url).into(imageView)
// URL 变化会自动重新加载

// Coil 默认行为
imageView.load(url)
// URL 变化不会自动刷新

// Coil 解决方案：加个 unique key
imageView.load(url) {
    // 强制每次都当作新请求
    memoryCachePolicy(CachePolicy.DISABLED)
}
```

## 总结 ##

Coil 作为 Kotlin 时代的图片加载库，在以下几个方面确实比 Glide 更适合 Kotlin 项目：

| 特性 | Coil | Glide |
| :--- | :--- | :--- |
| Kotlin 友好度 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 包大小 | ~300KB | ~500KB |
| Compose 支持 | 原生 | 第三方 |
| 协程支持 | 原生 | 有限 |
| 学习曲线 | 低 | 中 |
