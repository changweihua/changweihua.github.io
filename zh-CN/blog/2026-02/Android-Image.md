---
lastUpdated: true
commentabled: true
recommended: true
title: HEIF 与 AVIF 如何让 Android 存储减半
description: HEIF 与 AVIF 如何让 Android 存储减半
date: 2026-02-27 08:00:00 
pageClass: blog-page-class
cover: /covers/android.svg
---

在 Android 开发的性能优化清单中，“图片压缩”始终是绕不开的核心。长期以来，我们习惯于在 JPEG 的质量和体积之间走钢丝。然而，随着 *HEIF* 和 *AVIF* 等现代格式的成熟，这场平衡游戏正在发生质变：我们可以在不损失画质的前提下，将文件体积缩小 50% 甚至更多。

## 一、 为什么 JPEG 该“退休”了？ ##

JPEG 诞生于 1992 年。在那个拨号上网的时代，它是伟大的发明。但在 30 年后的今天，它的压缩算法在面对高动态范围（HDR）和高分辨率图像时显得力不从心：

- 压缩效率低：相同画质下，体积远大于现代格式。
- 不支持透明度：为了透明效果，我们不得不转而使用体积臃肿的 PNG。
- 边缘伪影：在高压缩比下，物体边缘会出现明显的“噪声”。

## 二、 现代图像格式的双子星 ##

### HEIF (High Efficiency Image File Format) ###

基于 HEVC (H.265) 视频编码技术。

- 优势：在相同画质下，体积仅为 JPEG 的 50% 。它支持 10 位色深、透明通道和序列帧（类似于高画质的 GIF）。
- Android 支持：Android 8.0+ (API 26) 开始支持阅读，Android 9.0+ 支持写入。
- 硬件加速：许多现代 Android 芯片（如高通骁龙）内置了 HEVC 硬解码，速度极快。

### AVIF (AV1 Image File Format) ###

基于开源的 AV1 视频编码，由 Google、Netflix 等巨头推动。

- 优势：它是目前的“压缩之王”。在极低带宽下，AVIF 的细节保留能力甚至超过了 WebP 和 HEIF。它是开源且免版税的。
- Android 支持：Android 12+ (API 31) 已原生支持。

## 三、 核心收益：不仅仅是省空间 ##

通过迁移到 HEIF/AVIF，你的 App 将获得以下直接收益：

- APK 瘦身：内置资源图直接减半，降低用户的下载门槛和留存流失。
- 带宽成本降低：对于云存储和 CDN 服务商来说，流量支出将大幅缩减。
- 加载速度提升：更小的文件意味着更快的 I/O 和更短的网络传输耗时，UI 渲染更丝滑。
- 更好的视觉质量：支持高位深，解决图像在渐变区域的“断层”现象。

## 四、 如何在 Android 中落地？ ##

### 检查兼容性 ###

虽然现代格式强大，但仍需处理版本差异。建议在服务端进行逻辑判断：

- Android 12+ ：优先推 AVIF。
- Android 8.0 - 11：优先推 HEIF。
- 老旧版本：降级使用 WebP 或优化过的 JPEG。

### 使用 HeifWriter ###

对于需要本地保存图片的场景，Android 提供了 HeifWriter：

```kotlin
// 使用 HeifWriter 将 Bitmap 保存为 HEIF
val heifWriter = HeifWriter.Builder(
    outputStream, width, height, HeifWriter.INPUT_MODE_BITMAP
).build()
heifWriter.start()
heifWriter.addBitmap(myBitmap)
heifWriter.stop()
```

### 转换工具 ###

你可以利用 `libavif` 或 `ImageMagick` 在 CI/CD 流程中自动转换资源图。例如使用 avifenc：

```bash
avifenc --jobs 4 input.jpg output.avif
```

### Coil：Kotlin 优先的优雅集成 ###

Coil 作为现代 Android 开发的首选图片库，其插件化设计非常简洁。由于官方在 Coil 3.0+ 中通过 KMP 增强了格式支持，这里我们以目前最主流的集成方式为例。

#### 添加依赖 ####

你需要引入专门处理 AVIF 的解码库（通常基于 libavif）：

```kotlin
dependencies {
    // 使用社区广泛认可的 AVIF 解码插件
    implementation("com.github.awxkee:avif-coder-coil:1.5.0")
}
```

#### 配置 ImageLoader ####

在 Application 类或全局配置中注册 AvifDecoder：

```kotlin
val imageLoader = ImageLoader.Builder(context)
    .components {
        // 将 AVIF 解码器加入组件池
        add(AvifDecoder.Factory())
    }
    .build()
```

### Glide：老牌劲旅的模块化扩展 ###

Glide 的集成稍微复杂一点，需要通过 AppGlideModule 来手动注册解码组件。

#### 添加依赖 ####

目前最稳定的方案是使用 glide-avif 库：

```kotlin
dependencies {
    implementation("com.github.zjupure:glide-avif:1.0.1")
    annotationProcessor("github.com.bumptech.glide:compiler:4.15.1")
}
```

#### 注册组件 ####

创建一个 AppGlideModule，并在 registerComponents 中注入解码器。这样 Glide 就能在读取输入流时识别并处理 AVIF 格式。

```kotlin
@GlideModule
class MyAppGlideModule : AppGlideModule() {
    override fun registerComponents(context: Context, glide: Glide, registry: Registry) {
        // 注册 AVIF 解码器，让其处理 InputStream 和 ByteBuffer
        registry.prepend(InputStream::class.java, Bitmap::class.java, AvifStreamBitmapDecoder(glide.bitmapPool))
        registry.prepend(ByteBuffer::class.java, Bitmap::class.java, AvifByteBufferBitmapDecoder(glide.bitmapPool))
    }
}
```

## 五、 未来展望 ##

虽然编码时间（Encoding Time）目前是现代格式的软肋，但对于绝大多数“一次上传、千万次下载”的 App 场景来说，这点计算成本微不足道。

随着 Android 15 和 16 对硬件解码的进一步普及，JPEG 终将走向边缘。作为开发者，现在开始尝试 HEIF/AVIF，不仅是为了减少 50% 的存储空间，更是为了给用户提供一个更轻快、更清晰的视觉体验。
