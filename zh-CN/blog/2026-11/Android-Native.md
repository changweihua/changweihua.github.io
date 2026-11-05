---
lastUpdated: true
commentabled: true
recommended: true
title: Android Native 集成
description: JNI、NDK、C++ 与 Kotlin 的协作
date: 2026-11-05 08:35:00
pageClass: blog-page-class
cover: /covers/android.svg
---

Android 主流开发语言是 Kotlin，但很多场景你绕不开 C/C++：

- 图像处理、音视频编解码。
- 加密算法、安全模块。
- 复用已有的 C++ 库（如 OpenCV、FFmpeg、游戏引擎）。
- 对性能极度敏感的计算。

这篇会讲 Android Native 开发的核心：JNI、NDK、CMake，以及 Kotlin 和 C++ 怎么协作。

## 什么时候该用 Native？ ##

不是性能瓶颈就一定要上 Native。Native 代码会带来：

- 包体积增大。
- 构建复杂度增加。
- 崩溃更难定位（栈信息、符号表）。
- 平台差异（ARM64 / x86_64 / ABI）。

*适合用 Native 的场景*：

- 已有 C/C++ 资产需要复用。
- 计算密集且 Kotlin 无法优化到目标性能。
- 需要绕过 JVM 的内存管理。
- 安全敏感逻辑需要隐藏实现。

*不适合的场景*：

- 普通 UI 逻辑。
- 简单的网络请求。
- 能用 Kotlin 协程 + 算法优化解决的问题。

## JNI 基础：Kotlin 调用 C++ ##

### 声明 Native 方法 ###

```java
class NativeLib {

    external fun stringFromJNI(): String
    external fun add(a: Int, b: Int): Int

    companion object {
        init {
            System.loadLibrary("native-lib")
        }
    }
}
```

### 生成头文件 ###

用 `javac -h` 生成 JNI 头文件：

```bash
javac -h jni src/main/java/com/example/NativeLib.kt
```

### C++ 实现 ###

```cpp
// native-lib.cpp
#include <jni.h>
#include <string>

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_NativeLib_stringFromJNI(JNIEnv* env, jobject /* this */) {
    std::string hello = "Hello from C++";
    return env->NewStringUTF(hello.c_str());
}

extern "C" JNIEXPORT jint JNICALL
Java_com_example_NativeLib_add(JNIEnv* env, jobject /* this */, jint a, jint b) {
    return a + b;
}
```

### 方法签名规则 ###

JNI 方法名格式：

```txt
Java_包名_类名_方法名
```

包名里的点换成下划线，下划线换成 `_1`。

例如 `com.example.NativeLib.add` → `Java_com_example_NativeLib_add`。

## NDK 与 CMake 构建 ##

### build.gradle 配置 ###

```txt
android {
    externalNativeBuild {
        cmake {
            path = file("src/main/cpp/CMakeLists.txt")
            version = "3.22.1"
        }
    }

    defaultConfig {
        externalNativeBuild {
            cmake {
                cppFlags += "-std=c++17"
                abiFilters += listOf("arm64-v8a", "x86_64")
            }
        }
    }
}
```

### CMakeLists.txt ###

```txt
cmake_minimum_required(VERSION 3.22.1)
project("native-lib")

add_library(
    native-lib
    SHARED
    native-lib.cpp
)

find_library(
    log-lib
    log
)

target_link_libraries(
    native-lib
    ${log-lib}
)
```

### ABI 选择 ###

| ABI | 设备类型 |
| :--- | :--- |
| `armeabi-v7a` | 32 位 ARM，老设备 |
| `arm64-v8a` | 64 位 ARM，主流 |
| `x86 / x86_64` | 模拟器、少数设备 |

> 建议：只保留 `arm64-v8a` 和 `x86_64`，包体积更小。如果必须支持 32 位，再加 `armeabi-v7a`。

## JNI 引用类型与内存管理 ##

### 局部引用 vs 全局引用 ###

```cpp
jstring local = env->NewStringUTF("local");

// 局部引用在函数返回后自动释放
// 如果需要长期保存，转成全局引用
jstring global = (jstring) env->NewGlobalRef(local);

// 用完必须手动释放
env->DeleteGlobalRef(global);
```

### 不要阻塞 JNI 调用 ###

```cpp
// 错误：长时间运行会阻塞 JVM 线程
JNIEXPORT void JNICALL
Java_com_example_NativeLib_heavyWork(JNIEnv* env, jobject thiz) {
    for (int i = 0; i < 1e9; i++) { ... }
}
```

如果 Native 任务耗时，应该在 C++ 层自己开线程，或者用 Kotlin 协程 + `Dispatchers.Default` 调用。

### 数组传递 ###

```cpp
JNIEXPORT void JNICALL
Java_com_example_NativeLib_processArray(JNIEnv* env, jobject thiz, jintArray arr) {
    jint* elements = env->GetIntArrayElements(arr, nullptr);
    jsize len = env->GetArrayLength(arr);

    for (int i = 0; i < len; i++) {
        elements[i] *= 2;
    }

    env->ReleaseIntArrayElements(arr, elements, 0);
}
```

注意 `Get` 和 `Release` 必须配对，否则内存泄漏。

## Kotlin 与 C++ 协作模式 ##

### 数据模型下沉 ###

不要频繁跨 JNI 边界传复杂对象。正确做法是：

- Kotlin 把输入序列化成 ByteArray 或 FloatArray。
- 一次性传给 Native。
- Native 处理完，返回数组或句柄。

```java
val input = FloatArray(1000)
val output = nativeLib.processAudio(input)
```

### 对象生命周期管理 ###

如果 Native 层持有资源，建议封装成 `Closeable`：

```java
class NativeProcessor : AutoCloseable {
    private var handle: Long = nativeCreate()

    fun process(data: ByteArray): ByteArray = nativeProcess(handle, data)

    override fun close() {
        nativeDestroy(handle)
        handle = 0
    }
}
```

配合 `use { }` 自动释放。

## Native 调试与崩溃定位 ##

### 符号表 ###

发布 Native 库时保留符号表：

```bash
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -g")
```

或者用 `ndk-stack` 还原崩溃栈：

```bash
adb logcat | ndk-stack -sym obj/arm64-v8a/
```

### AddressSanitizer ###

```bash
./gradlew app:assembleDebug -Pandroid.enableAsan=true
```

AddressSanitizer 能检测 Native 层的内存越界、Use-after-free，但会让 App 变慢。

## 性能与包体积权衡 ##

| 策略 | 效果 | 代价 |
| :--- | :--- | :--- |
| 只保留 arm64-v8a | 包体积 -30% | 老设备不兼容 |
| 压缩 so 库 | 包体积 -10~20% | 运行时解压，启动稍慢 |
| 按需下载 so | 包体积极小 | 首次使用需下载 |
| 复用静态库 | 构建简化 | 体积可能增大 |

## 小结 ##

Native 开发是 Android 专家的能力边界之一：

- 只在必要场景引入 C/C++ 。
- JNI 方法签名、局部/全局引用、数组释放要配对。
- 用 CMake 管理构建，合理选择 ABI。
- 跨 JNI 边界传简单数据，避免频繁对象交互。
- 保留符号表，用 `ndk-stack` / `ASan` 定位 Native 崩溃。
