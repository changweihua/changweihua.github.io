---
lastUpdated: true
commentabled: true
recommended: true
title: Java 与 Kotlin 混合开发避坑指南
description: 30 个真实案例实录
date: 2026-08-27 10:30:00
pageClass: blog-page-class
cover: /covers/kotlin.svg
---


接手一个运行了五六年、数十万行代码的超大型 Android 项目，代码库从纯 Java 慢慢变成了 Java 和 Kotlin 混编。两种语言互相调用时，以下的一些场景或坑在这里记录下，如果你恰好也碰到，可以和我一样少掉点头发。

## 坑 1：Java 调用 Kotlin 顶层函数时类名多出 `Kt` ##

*问题描述*：

Kotlin 的顶层函数会被编译器放到一个自动生成的类中，默认以文件名加 `Kt` 后缀。Java 调用时很不美观，且文件重命名后类名也会变，维护困难。

### 错误写法 ###

```kotlin
// FileName.kt
package com.example.util

fun isEmail(s: String?): Boolean {
    return s?.contains("@") ?: false
}
```

```java
// Java 调用方
import com.example.util.FileNameKt;

public class RegisterActivity extends Activity {
    private boolean validate(String email) {
        // 必须带 Kt 后缀，如果文件名改了，这里也得改
        return FileNameKt.isEmail(email);
    }
}
```

### 正确写法 ###

```kotlin
// FileName.kt
package com.example.util

// 明确指定生成的 Java 类名
@file:JvmName("StringUtils")

fun isEmail(s: String?): Boolean {
    return s?.contains("@") ?: false
}
```

```java
// Java 调用方
import com.example.util.StringUtils;

public class RegisterActivity extends Activity {
    private boolean validate(String email) {
        // 干净整洁，没有 Kt 后缀
        return StringUtils.isEmail(email);
    }
}
```

*踩坑原因*：

Kotlin 编译器默认以 `文件名 + Kt` 生成类名。`@file:JvmName` 可以覆盖这个默认行为，必须放在文件顶部（`package` 之后，任何代码之前）。

*建议*：

任何会给 Java 调用的顶层函数，建议在文件顶部统一加上 `@file:JvmName("清晰的类名")`，避免 Kt 地狱。

## 坑 2：伴生对象方法需要 @JvmStatic 才能变静态调用 ##

*问题描述*：

Kotlin 里伴生对象的方法，Java 必须通过 `Companion` 实例访问，写起来很啰嗦。

### 错误写法 ###

```kotlin
// UserConfig.kt
class UserConfig {
    companion object {
        const val PREF_NAME = "user_prefs"

        fun getCurrentUserId(): String {
            return "user_${System.currentTimeMillis()}"
        }
    }
}
```

```java
// Java 调用方
public class UserManager {

    // 非常难受，还要多写一层 Companion
    public String loadUserId() {
        return UserConfig.Companion.getCurrentUserId();
    }
}
```

### 正确写法 ###

```kotlin
// UserConfig.kt
class UserConfig {
    companion object {
        const val PREF_NAME = "user_prefs"

        // 加上 @JvmStatic，Java 就能直接当静态方法调用
        @JvmStatic
        fun getCurrentUserId(): String {
            return "user_${System.currentTimeMillis()}"
        }
    }
}
```

```java
// Java 调用方
public class UserManager {

    // 干净利落的静态调用
    public String loadUserId() {
        return UserConfig.getCurrentUserId();
    }
}
```

*踩坑原因*：

Kotlin 的伴生对象本质是一个单例类，Companion 是这个单例的实例引用。Java 无法直接调用伴生对象的方法，必须通过实例引用。

## 坑 3：伴生对象属性 Java 访问多一层 Companion ##

*问题描述*：

伴生对象里的 `val` 属性，Java 调用时会生成 `getXXX()` 方法，需要先拿到 `Companion` 实例才能访问。

### 错误写法 ###

```kotlin
// ApiConfig.kt
class ApiConfig {
    companion object {
        val BASE_URL = "https://api.example.com"
        val TIMEOUT_SECONDS = 30
    }
}
```

```java
// Java 调用方
public class ApiServiceFactory {

    public void printConfig() {
        // 每次都要写 Companion，而且 getBASE_URL 看起来很奇怪
        String url = ApiConfig.Companion.getBASE_URL();
        int timeout = ApiConfig.Companion.getTIMEOUT_SECONDS();
        Log.d("TAG", "URL: " + url + ", timeout: " + timeout);
    }
}
```

### 正确写法 ###

```kotlin
// ApiConfig.kt
class ApiConfig {
    companion object {
        // 方案一：用 @JvmField 暴露为真正的静态字段（非 const）
        @JvmField
        val BASE_URL = "https://api.example.com"

        // 方案二：用 const val（必须是原生类型或 String，且初始化表达式是常量）
        const val TIMEOUT_SECONDS = 30
    }
}
```


```java
// Java 调用方
public class ApiServiceFactory {

    public void printConfig() {
        // 像访问静态字段一样直接访问
        String url = ApiConfig.BASE_URL;
        int timeout = ApiConfig.TIMEOUT_SECONDS;
        Log.d("TAG", "URL: " + url + ", timeout: " + timeout);
    }
}
```

*踩坑原因*：

Kotlin 的 `val` 默认会生成 `getter` 方法，Java 需要通过 `getter` 访问。`@JvmField` 告诉编译器直接暴露为 Java 字段，跳过 `getter`。`const val` 则会被编译器内联为静态常量。

## 坑 4：默认参数 Java 无法享用，必须传所有参数 ##

*问题描述*：

Kotlin 的默认参数在 Java 中完全不可见，Java 调用时必须显式传入所有参数，否则编译失败。

### 错误写法 ###

```kotlin
// NetworkClient.kt
class NetworkClient {

    // 定义了默认参数，Kotlin 调用很方便
    fun fetchData(url: String, retryCount: Int = 3, timeout: Long = 5000): String {
        return "data from $url"
    }
}
```


```java
// Java 调用方 — 必须传所有参数，很啰嗦
public class DataRepository {

    public String load() {
        NetworkClient client = new NetworkClient();
        // 即使不想改 retryCount 和 timeout，也必须传
        return client.fetchData("https://api.example.com", 3, 5000);
    }
}
```

### 正确写法 ###

```kotlin
// NetworkClient.kt
class NetworkClient {

    // 加上 @JvmOverloads，编译器会自动生成重载方法
    @JvmOverloads
    fun fetchData(url: String, retryCount: Int = 3, timeout: Long = 5000): String {
        return "data from $url"
    }
}
```

```java
// Java 调用方 — 可以只传必需的
public class DataRepository {

    public String load() {
        NetworkClient client = new NetworkClient();
        // 只传 url，其他用默认值
        return client.fetchData("https://api.example.com");
    }

    public String loadWithCustomTimeout() {
        NetworkClient client = new NetworkClient();
        // 也可以任意覆盖
        return client.fetchData("https://api.example.com", 5, 10000);
    }
}
```

*踩坑原因*：

Kotlin 的默认参数是通过静态方法重载实现的，但编译器只在 Kotlin 代码中生成重载，Java 看不到。`@JvmOverloads` 强制编译器为 Java 生成所有可能的参数组合。

## 坑 5：object 单例 Java 必须 `.INSTANCE` ##

*问题描述*：

Kotlin 的 object 声明会生成一个单例类，但 Java 访问时需要通过静态字段 INSTANCE 获取实例。

### 错误写法 ###

```kotlin
// AnalyticsManager.kt
object AnalyticsManager {
    fun trackEvent(eventName: String, params: Map<String, Any>? = null) {
        println("Event: $eventName")
    }

    fun init(appId: String) {
        println("Analytics initialized with $appId")
    }
}
```

```java
// Java 调用方
public class MainApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        // 必须写 .INSTANCE，看起来像在访问一个奇怪的静态字段
        AnalyticsManager.INSTANCE.init("APP_12345");
        AnalyticsManager.INSTANCE.trackEvent("app_open");
    }
}
```

### 正确写法 ###

```kotlin
// AnalyticsManager.kt
object AnalyticsManager {

    // 在需要给 Java 调用的方法上加上 @JvmStatic
    @JvmStatic
    fun init(appId: String) {
        println("Analytics initialized with $appId")
    }

    @JvmStatic
    fun trackEvent(eventName: String, params: Map<String, Any>? = null) {
        println("Event: $eventName")
    }
}
```

```java
// Java 调用方
public class MainApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        // 直接当静态方法调用，更自然
        AnalyticsManager.init("APP_12345");
        AnalyticsManager.trackEvent("app_open");
    }
}
```

*踩坑原因*：

`object` 声明确实生成了一个单例类和静态的 `INSTANCE` 字段。加上 `@JvmStatic` 后，编译器会在类上再生成一个静态方法，让 Java 可以直接调用。

## 坑 6：`lateinit var` 的 getter/setter Java 调用异常 ##

*问题描述*：

Kotlin 的 `lateinit var` 在 Java 中访问时，由于 Kotlin 编译器生成的 getter 和 setter 可见性处理方式特殊，容易拿到空引用或 `IllegalAccessError`。

### 错误写法 ###

```kotlin
// MainActivity.kt
class MainActivity : AppCompatActivity() {
    // lateinit 属性，Kotlin 内部直接用
    lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        binding.tvTitle.text = "Hello"
    }
}
```

```java
// Java 调用方 — 试图从外部访问
public class TestHelper {

    public void test(MainActivity activity) {
        // 这里可能报错：binding 在 Java 中看不到，或者可见性是包级私有
        // activity.getBinding().tvTitle.setText("Hacked");
    }
}
```

### 正确写法 ###

```kotlin
// MainActivity.kt
class MainActivity : AppCompatActivity() {

    // 如果 Java 需要访问，必须显式暴露 getter
    private lateinit var _binding: ActivityMainBinding

    // 给 Java 用的公共 getter
    fun getBinding(): ActivityMainBinding {
        return _binding
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        _binding = ActivityMainBinding.inflate(layoutInflater)
        _binding.tvTitle.text = "Hello"
    }
}
```

```java
// Java 调用方
public class TestHelper {

    public void test(MainActivity activity) {
        // 通过明确的 public getter 访问
        ActivityMainBinding binding = activity.getBinding();
        binding.tvTitle.setText("Hacked from Java");
    }
}
```

*踩坑原因*：

`lateinit` 编译器只为属性生成 package-private 的 getter/setter，Java 跨包访问不可见。不要依赖 `lateinit` 给 Java 暴露字段，手写 getter 最安全。

## 坑 7：Kotlin 属性以 `is` 开头，Java 方法名混乱 ##

*问题描述*：

Kotlin 中 Boolean 属性如果以 `is` 开头，会自动生成 `isXxx()` 的 getter。但在 Java 中，属性名和 getter 的对应关系变得不直观，setter 甚至会去掉 `is` 前缀。

## 错误写法 ##

```kotlin
// User.kt
data class User(
    var isActive: Boolean = false,
    var isVerified: Boolean = false
)
```

```java
// Java 调用方
User user = new User();
// getter 是 isActive()，但 setter 是 setActive() — 注意 is 前缀消失了
user.isActive(true);      // 调用 getter（编译错误，无参方法不能传参）
user.setActive(false);    // setter 没有 is 前缀
user.isVerified(false);   // 源码里写了 false，但实际调用的是 getter，没有参数会报错！
```

### 正确写法 ###

```kotlin
// User.kt
data class User(
    // 方案一：属性名不要用 is 开头，改用形容词
    var active: Boolean = false,
    var verified: Boolean = false
)

// 或者保留原始命名，但强制映射 getter 名称
data class User(
    @get:JvmName("isActive")
    var isActive: Boolean = false,

    @get:JvmName("isVerified")
    var isVerified: Boolean = false
)
```

```java
// Java 调用方 — 方案一：属性用形容词命名
User user = new User();
user.setActive(true);
user.isActive();          // 直接调用无参 getter
user.setVerified(true);
user.isVerified();

// Java 调用方 — 方案二：JvmName 映射后
User user = new User();
user.isActive();          // getter 明确叫 isActive()
user.setActive(true);     // setter 仍然是 setActive，没有 is 前缀
```

*踩坑原因*：

遵循 JavaBean 规范，Boolean 属性的 getter 应该以 is 开头，但 setter 必须用 setXxx（去掉 is）。Kotlin 的属性名如果带 is，会导致 getter/setter 命名不对称，Java 侧容易搞混。

## 坑 8：`@JvmField` 暴露字段绕过了 getter/setter ##

*问题描述*：

`@JvmField` 直接把 Kotlin 属性暴露为 Java 字段，跳过了 getter/setter。优点是简单，缺点是破坏了封装，后续 Kotlin 侧无法添加逻辑而不影响 Java。

### 错误写法 ###

```kotlin
// Session.kt
class Session {
    // 直接用 @JvmField 暴露给 Java
    @JvmField
    var userId: String? = null

    @JvmField
    var token: String? = null
}
```


```java
// Java 调用方
Session session = new Session();
// 直接操作字段，没有任何控制逻辑
session.userId = "hacked_user_id";
session.token = "hacked_token";
```

## 正确写法 ##

```kotlin
// Session.kt
class Session {
    // 私有字段，外部无法直接访问
    private var _userId: String? = null
    private var _token: String? = null

    // 通过 getter/setter 暴露，后续可以加校验、埋点、日志
    var userId: String?
        get() = _userId
        set(value) {
            // 后续想加校验直接在这里改，Java 侧不用动
            _userId = value?.ifEmpty { null }
        }

    var token: String?
        get() = _token
        set(value) {
            _token = value?.ifEmpty { null }
        }
}
```

```java
// Java 调用方
Session session = new Session();
// 通过 getter/setter 访问，未来 Kotlin 侧改造不会影响 Java
session.setUserId("user_123");
session.setToken("token_abc");
```

*踩坑原因*：

`@JvmField` 暴露的是原始字段，Java 直接读写，跳过了 Kotlin 属性的所有自定义逻辑。一旦 Kotlin 侧改成计算属性或加逻辑，Java 侧编译后的字节码仍然直接操作字段，会产生行为不一致。

## 坑 9：Kotlin 非空参数 Java 传 `null` 直接炸 ##

*问题描述*：

Kotlin 的非空类型（String 而不是 String?）在 Java 中没有编译期检查，Java 代码可以传入 null，运行时 Kotlin 的 null 检测会直接抛 `IllegalArgumentException`。

### 错误写法 ###

```kotlin
// UserService.kt
class UserService {

    // Kotlin 定义的非空参数
    fun createUser(name: String, email: String): User {
        return User(name, email)
    }
}
```

```java
// Java 调用方 — 没有任何告警，直接传 null
public class UserManager {

    public void register() {
        UserService service = new UserService();
        // 编译通过，但运行时报错
        // IllegalArgumentException: Parameter specified as non-null is null
        User user = service.createUser(null, null);
    }
}
```

### 正确写法 ###

```kotlin
// UserService.kt
class UserService {

    // 从 @NonNull 注解，Java 侧 IDE 会告警
    fun createUser(
        @NonNull name: String,
        @NonNull email: String
    ): User {
        return User(name, email)
    }
}
```

```java
// Java 调用方 — IDE 会标红提醒
public class UserManager {

    public void register() {
        UserService service = new UserService();
        // IDE 告警：null 不兼容 @NonNull
        User user = service.createUser("John", null);
    }
}
```

*踩坑原因*：

Kotlin 的非空类型只在 Kotlin 编译期有效，编译成字节码后只留下方法签名，没有运行时强制检查（除非特殊配置）。Java 天然允许传 null，两者之间的契约必须靠注解建立。

## 坑 10：Java 返回值没标注可空，Kotlin 收到平台类型 `String!` ##

*问题描述*：
Java 方法没有加 `@Nullable`，Kotlin 侧会把它当作平台类型（`String!`）。如果 Kotlin 代码直接当非空使用，一旦 Java 返回 `null` 就会 NPE。

### 错误写法 ###

```java
// User.java（老 Java 代码）
public class User {
    private String nickname;

    public String getNickname() {
        // 可能返回 null，但没有标注
        return nickname;  // 这里可能为 null
    }
}
```

```kotlin
// Kotlin 调用方 — 平台类型直接当非空用
fun formatUser(user: User): String {
    // nickname 是 String!（平台类型），IDE 可能不告警
    // 一旦 getNickname() 返回 null → NPE
    return "User: ${user.nickname.uppercase()}"
}
```

### 正确写法 ###

```java
// User.java — 必须标注可空性
public class User {
    private String nickname;

    // 明确标注可能返回 null
    @Nullable
    public String getNickname() {
        return nickname;
    }
}
```

```kotlin
// Kotlin 调用方
fun formatUser(user: User): String {
    // 明确按可空处理，或者断言非空
    val nickname = user.nickname ?: "Guest"
    return "User: ${nickname.uppercase()}"
}

// 或者如果业务上确定非空
fun formatUserStrict(user: User): String {
    // 用 !! 显式断言，出问题也知道在哪里
    return "User: ${user.nickname!!.uppercase()}"
}
```

*踩坑原因*：

平台类型是 Kotlin 专为兼容 Java 设计的“折叠类型”，编译器不会强制检查，但运行时会原样传递 `null`。老项目接入 Kotlin 时，第一步就是给所有 Java 方法补 `@Nullable` / `@NonNull` 注解。

## 坑 11：Kotlin 扩展函数在 Java 里看起来像静态工具类 ##

*问题描述*：

Kotlin 扩展函数被编译成带接收者参数的静态方法，Java 调用时第一个参数就是接收者，可读性极差。

### 错误写法 ###

```kotlin
// StringExt.kt
package com.example.util

// Kotlin 中非常自然的扩展函数
fun String.isValidEmail(): Boolean {
    return this.contains("@") && this.length > 5
}

fun String.trimAndLower(): String {
    return this.trim().lowercase()
}
```

```java
// Java 调用方 — 非常疑惑
public class RegisterActivity extends Activity {

    public boolean check(String email) {
        // 扩展函数在 Java 眼里就是个普通静态方法，第一个参数是接收者
        return StringExtKt.isValidEmail(email);
    }

    public String format(String input) {
        // 链式调用在 Java 里变成嵌套，可读性极差
        return StringExtKt.trimAndLower(input);
    }
}
```

### 正确写法 ###

```kotlin
// StringUtils.kt
package com.example.util

import java.util.regex.Pattern

// 给 Java 用的工具类，不用扩展函数
object StringUtils {

    @JvmStatic
    fun isValidEmail(email: String?): Boolean {
        if (email == null) return false
        val pattern = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")
        return pattern.matcher(email).matches()
    }

    @JvmStatic
    fun trimAndLower(input: String?): String {
        return input?.trim()?.lowercase() ?: ""
    }
}
```

```java
// Java 调用方
public class RegisterActivity extends Activity {

    public boolean check(String email) {
        // 标准的静态工具类调用，清晰明确
        return StringUtils.isValidEmail(email);
    }

    public String format(String input) {
        return StringUtils.trimAndLower(input);
    }
}
```

*踩坑原因*：

扩展函数的本质是“静态方法 + 第一个参数是接收者”。Java 无法理解 Extension 这种语法糖，只会看到奇怪的静态方法调用。

## 坑 12：Java 无法直接调用 Kotlin 高阶函数 ##

*问题描述*：

Kotlin 的高阶函数（函数类型参数）在 Java 中对应 `Function0`、`Function1` 等接口，Java 调用时必须 `new` 一个匿名类，非常啰嗦。

### 错误写法 ###

```kotlin
// TaskRunner.kt
class TaskRunner {

    // Kotlin 中很优雅的高阶函数
    fun runAsync(block: () -> Unit) {
        Thread {
            block()
        }.start()
    }
}
```

```java
// Java 调用方
public class MainActivity extends Activity {

    public void startTask() {
        TaskRunner runner = new TaskRunner();

        // Java 7 及以下：必须 new Function0，非常啰嗦
        runner.runAsync(new Function0<Unit>() {
            @Override
            public Unit invoke() {
                // do something
                return Unit.INSTANCE;
            }
        });
    }
}
```

### 正确写法 ###

```kotlin
// TaskRunner.kt
class TaskRunner {

    // 方案一：对外提供 Java 友好的 SAM 接口
    fun interface Task {
        fun execute()
    }

    fun runAsync(task: Task) {
        Thread {
            task.execute()
        }.start()
    }

    // 方案二：如果 Java 调用多，直接用 Java 标准接口
    fun runAsync(task: Runnable) {
        Thread {
            task.run()
        }.start()
    }

    // 方案三：返回 CompletableFuture（Java 8+）
    fun runWithResult(block: () -> String): CompletableFuture<String> {
        val future = CompletableFuture<String>()
        Thread {
            try {
                future.complete(block())
            } catch (e: Exception) {
                future.completeExceptionally(e)
            }
        }.start()
        return future
    }
}
```

```java
// Java 调用方
public class MainActivity extends Activity {

    public void startTask() {
        TaskRunner runner = new TaskRunner();

        // 使用 Runnable，Java 原生支持
        runner.runAsync(new Runnable() {
            @Override
            public void run() {
                // do something
            }
        });

        // Java 8 lambda 也可以直接写
        runner.runAsync(() -> {
            // do something
        });
    }
}
```

*踩坑原因*：

Kotlin 的 `() -> Unit` 编译后是 `Function0<Unit>`，虽然也是函数式接口，但在 Java 8 之前没有 Lambda 支持，使用成本极高。对外 API 慎用 Kotlin 原生函数类型。

## 坑 13：Kotlin 调用 Java 的属性 getter/setter 混淆 ##

*问题描述*：
Java 类同时有 `title` 字段和 `getTitle()`、`setTitle()` 方法时，Kotlin 的属性解析会产生歧义。如果字段和 getter 并存，Kotlin 会优先选择访问属性，但某些情况下可能直接操作字段而绕过 getter。

### 错误写法 ###

```java
// User.java（老代码）
public class User {
    // 既有公开字段
    public String title;

    // 又有 getter/setter
    public String getTitle() {
        return title != null ? title : "default";
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
```

```kotlin
// Kotlin 调用方 — 以为是调用 getter，实际可能访问字段
fun updateUser(user: User) {
    // Kotlin 按 JavaBean 规范解析为属性
    // 但如果字段和 getter 同时存在，行为不一致
    user.title = "New Title"        // 直接写字段，绕过了 getter 里的校验逻辑
    val current = user.title        // 可能直接读字段，而不是 getter
}
```

### 正确写法 ###

```java
// User.java（修复后） — 移除公开字段，只保留 getter/setter
public class User {
    // 私有字段，必须通过 getter/setter 访问
    private String title;

    public String getTitle() {
        return title != null ? title : "default";
    }

    public void setTitle(String title) {
        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("title cannot be empty");
        }
        this.title = title;
    }
}
```


```kotlin
// Kotlin 调用方
fun updateUser(user: User) {
    // 现在明确走 getter/setter
    user.title = "New Title"        // 调用 setter，有校验
    val current = user.title        // 调用 getter，有默认值逻辑
}
```

*踩坑原因*：

JavaBean 规范要求字段私有，通过 getter/setter 访问。如果字段 public，Kotlin 的属性解析会优先绑定字段，导致 getter 中的业务逻辑被绕过。

## 坑 14：SAM 转换在 Java 接口有多默认方法时失效 ##

*问题描述*：

Java 8 引入了 `default` 方法，当接口既有抽象方法又有 `default` 方法时，Kotlin 无法再用 Lambda 做 SAM 转换，必须写匿名对象。

### 错误写法 ###

```java
// ApiClient.java
public interface ApiClient {

    void onSuccess(String result);

    void onError(Exception e);

    // 增加了一个默认方法，本意是提供便利
    default void onTimeout() {
        onError(new TimeoutException("Request timeout"));
    }
}
```

```kotlin
// Kotlin 调用方 — 以为还能用 lambda
val client = ApiClient { result ->
    println("success: $result")
}
// 编译错误！接口现在不是 SAM 了（有两个抽象方法 onSuccess 和 onError）
```

### 正确写法 ###

```java
// ApiClient.java
public interface ApiClient {

    void onSuccess(String result);

    void onError(Exception e);
}

// 默认方法移到单独的接口
public interface TimeoutApiClient extends ApiClient {
    default void onTimeout() {
        onError(new TimeoutException("Request timeout"));
    }
}
```

```kotlin
// Kotlin 调用方
// 方案一：使用 object（SAM 转换前的方式）
val client = object : ApiClient {
    override fun onSuccess(result: String) {
        println("success: $result")
    }

    override fun onError(e: Exception) {
        println("error: $e")
    }
}

// 方案二：只有一个抽象方法时，lambda 正常
val timeoutClient = object : TimeoutApiClient {
    override fun onSuccess(result: String) {
        println("success: $result")
    }

    override fun onError(e: Exception) {
        println("error: $e")
    }
}
```

*踩坑原因*：
SAM（Single Abstract Method）转换要求接口中只有一个抽象方法。default 方法不算抽象方法，但如果接口中有多个抽象方法，Kotlin 就无法用 Lambda。

## 坑 15：Kotlin 忽略受检异常，Java 一脸懵逼 ##

*问题描述*：

Kotlin 没有受检异常（checked exception）的概念，Java 的 `throws` 声明在 Kotlin 中被忽略。如果 Kotlin 方法内部抛出的异常没有处理，调用方（无论是 Java 还是 Kotlin）都可能在运行时崩溃。

### 错误写法 ###

```kotlin
// FileHelper.kt
class FileHelper {

    // Kotlin 随便抛 IOException，编译器不报错
    fun readFile(path: String): String {
        val file = File(path)
        return file.readText()  // 可能抛 IOException
    }
}
```

```java
// Java 调用方
public class ConfigLoader {

    public String loadConfig() {
        FileHelper helper = new FileHelper();
        // Java 编译器以为这个方法只抛 RuntimeException
        // 但如果文件不存在，直接 FileNotFoundException 崩溃
        return helper.readFile("/config/settings.json");
    }
}
```

### 正确写法 ###

```kotlin
// FileHelper.kt
class FileHelper {

    // 加 @Throws 注解，Java 编译器能看到异常声明
    @Throws(IOException::class)
    fun readFile(path: String): String {
        val file = File(path)
        return file.readText()
    }

    // 或者内部 catch 掉，转为 Kotlin 风格结果
    fun readFileSafe(path: String): Result<String> {
        return try {
            Result.success(File(path).readText())
        } catch (e: IOException) {
            Result.failure(e)
        }
    }
}
```

```java
// Java 调用方
public class ConfigLoader {

    // 必须处理 IOException，编译器会强制要求
    public String loadConfig() throws IOException {
        FileHelper helper = new FileHelper();
        return helper.readFile("/config/settings.json");
    }
}
```

*踩坑原因*：

Kotlin 编译器会擦除 `throws` 声明（除非用 `@Throws` 显式标注）。当 Kotlin 方法被 Java 调用时，Java 编译器看不到异常信息，无法强制 `catch` 或 `throws`。

## 坑 16：Java 调用 Kotlin `suspend` 函数直接报错 ##

*问题描述*：

`suspend` 是 Kotlin 协程的关键字，编译后函数签名会多一个 `Continuation` 参数。Java 无法直接调用，必须通过桥接层。

### 错误写法 ###

```kotlin
// UserRepository.kt
class UserRepository {

    suspend fun fetchUser(id: String): User {
        delay(1000)  // 模拟网络请求
        return User(id, "User $id")
    }
}
```

```java
// Java 调用方
public class MainActivity extends Activity {

    public void loadUser() {
        UserRepository repo = new UserRepository();
        // 编译错误！Java 不认识 suspend 函数
        User user = repo.fetchUser("123");
    }
}
```

### 正确写法 ###

```kotlin
// UserRepository.kt
class UserRepository {

    // 内部用协程
    suspend fun fetchUser(id: String): User {
        delay(1000)
        return User(id, "User $id")
    }

    // 给 Java 用的桥接方法，返回 CompletableFuture
    fun fetchUserAsync(id: String): CompletableFuture<User> {
        return CoroutineScope(Dispatchers.IO).async {
            fetchUser(id)
        }.asCompletableFuture()
    }

    // 或者返回回调
    fun fetchUser(id: String, callback: Callback) {
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val user = fetchUser(id)
                callback.onSuccess(user)
            } catch (e: Exception) {
                callback.onError(e)
            }
        }
    }

    interface Callback {
        fun onSuccess(user: User)
        fun onError(e: Exception)
    }
}
```

```java
// Java 调用方
public class MainActivity extends Activity {

    public void loadUser() {
        UserRepository repo = new UserRepository();

        // 方案一：CompletableFuture（Java 8+）
        repo.fetchUserAsync("123")
            .thenAccept(user -> {
                // 处理结果
            })
            .exceptionally(e -> {
                // 处理异常
                return null;
            });

        // 方案二：回调
        repo.fetchUser("123", new UserRepository.Callback() {
            @Override
            public void onSuccess(User user) {
                // 处理成功
            }

            @Override
            public void onError(Exception e) {
                // 处理失败
            }
        });
    }
}
```

*踩坑原因*：

`suspend` 函数编译后会多出一个 `Continuation` 参数，这是 Kotlin 协程的 ABI，Java 无法理解。公共 API 绝不直接暴露 suspend 函数，必须用 `CompletableFuture` 或回调桥接。

## 坑 17：LiveData 在混合项目中观察者传参类型不匹配 ##

*问题描述*：

LiveData 的 `observe` 方法在 Kotlin 中有 Lambda 版本和接口版本，Java 只能用接口版本。如果 Kotlin 代码混用 Lambda 和接口，泛型推断可能出错。

### 错误写法 ###

```kotlin
// UserViewModel.kt
class UserViewModel : ViewModel() {
    private val _user = MutableLiveData<User>()
    val user: LiveData<User> = _user

    fun loadUser() {
        _user.value = User("1", "John")
    }
}
```

```java
// Java 观察者 — 容易写错泛型
public class UserFragment extends Fragment {

    public void observeUser(UserViewModel vm) {
        // 如果写成 Observer<Object>，运行时会收到类型转换异常
        vm.getUser().observe(this, new Observer<User>() {
            @Override
            public void onChanged(User user) {
                // 如果这里写错了类型，编译不报错，运行时炸
            }
        });
    }
}
```

### 正确写法 ###

```kotlin
// UserViewModel.kt
class UserViewModel : ViewModel() {
    // 明确泛型类型，不要用 raw type
    private val _user = MutableLiveData<User?>()
    val user: LiveData<User?> = _user

    fun loadUser() {
        _user.value = User("1", "John")
    }
}
```

```java
// Java 观察者 — 严格类型匹配
public class UserFragment extends Fragment {

    public void observeUser(UserViewModel vm) {
        // 使用 LiveData 的标准 Observer 接口
        vm.getUser().observe(getViewLifecycleOwner(), new Observer<User>() {
            @Override
            public void onChanged(User user) {
                if (user != null) {
                    // 安全处理
                    showUser(user);
                }
            }
        });
    }
}
```

*踩坑原因*：

LiveData 的 `observe` 方法在 Kotlin 中重载了 Lambda 版本，但 Java 没有 Lambda（旧版本），只能使用 Observer<T> 接口。泛型擦除后，如果两边类型不一致，只有运行时才会暴露问题。

## 坑 18：StateFlow 暴露给 Java 变成一次性读取 ##

*问题描述*：

Kotlin 的 `StateFlow` 在 Java 中只能当成普通属性读取 `getValue()`，无法响应式订阅，Java 侧拿不到数据流变化。

### 错误写法 ###

```kotlin
// CounterViewModel.kt
class CounterViewModel : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count.asStateFlow()

    fun increment() {
        _count.value++
    }
}
```

```java
// Java 观察者 — StateFlow 是冷流，Java 没法 collect
public class CounterFragment extends Fragment {

    public void observeCount(CounterViewModel vm) {
        // Java 只能读一次当前值，无法订阅变化
        int current = vm.getCount().getValue();  // 只会拿到一次，后续变化收不到
        Log.d("TAG", "init count: " + current);
    }
}
```

### 正确写法 ###

```kotlin
// CounterViewModel.kt
class CounterViewModel : ViewModel() {

    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count.asStateFlow()

    // 桥接方案一：用 LiveData（Java 友好）
    private val _countLiveData = MutableLiveData<Int>()
    val countLiveData: LiveData<Int> = _countLiveData

    init {
        // StateFlow -> LiveData
        viewModelScope.launch {
            count.collect {
                _countLiveData.value = it
            }
        }
    }

    // 桥接方案二：提供回调接口
    fun interface CountListener {
        fun onCountChanged(newCount: Int)
    }

    private var listener: CountListener? = null

    fun setCountListener(listener: CountListener) {
        this.listener = listener
        viewModelScope.launch {
            count.collect {
                listener.onCountChanged(it)
            }
        }
    }

    fun increment() {
        _count.value++
    }
}
```

```java
// Java 观察者 — 使用 LiveData
public class CounterFragment extends Fragment {

    public void observeCount(CounterViewModel vm) {
        // 方案一：用 LiveData 桥接，Java 直接 observe
        vm.getCountLiveData().observe(getViewLifecycleOwner(), new Observer<Integer>() {
            @Override
            public void onChanged(Integer newCount) {
                Log.d("TAG", "count changed: " + newCount);
            }
        });

        // 方案二：用回调接口（适合非 LifecycleOwner 场景）
        vm.setCountListener(new CounterViewModel.CountListener() {
            @Override
            public void onCountChanged(int newCount) {
                Log.d("TAG", "count callback: " + newCount);
            }
        });
    }
}
```

*踩坑原因*：

`StateFlow` 是 Kotlin 协程的响应式原语，Java 无法 `collect`。不要在公共 API 层直接暴露 StateFlow / SharedFlow，必须桥接为 Java 能理解的形式。

## 坑 19：Kotlin 密封类在 Java 里只能 `instanceof` 检查 ##

*问题描述*：

Kotlin 密封类（sealed class）在 Kotlin 中享受编译器穷举检查，但在 Java 眼里就是普通抽象类，所有子类都是普通类，没有穷举保护。跨模块时如果密封类增加子类，Java 代码不会收到任何提醒。

### 错误写法 ###

```kotlin
// Result.kt
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
    object Loading : Result<Nothing>()
}
```

```java
// Java 调用方 — 没有穷举保护
public class Repository {

    public void handle(Result<?> result) {
        if (result instanceof Result.Success) {
            // 处理成功
        } else if (result instanceof Result.Error) {
            // 处理错误
        }
        // 忘了处理 Result.Loading 分支，Java 编译器不会提醒！
        // 后来有人新增了一个子类，Java 代码也不会编译失败
    }
}
```

### 正确写法 ###

```kotlin
// Result.kt
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
    object Loading : Result<Nothing>()

    // 提供一个给 Java 用的 visit 方法，强制 Java 必须处理所有分支
    fun <R> accept(visitor: ResultVisitor<R>): R {
        return when (this) {
            is Success -> visitor.onSuccess(data)
            is Error -> visitor.onError(exception)
            is Loading -> visitor.onLoading()
        }
    }
}

// 访客接口，Java 必须实现所有方法
interface ResultVisitor<R> {
    fun onSuccess(data: Any): R
    fun onError(exception: Exception): R
    fun onLoading(): R
}
```

```java
// Java 调用方 — 使用访客模式
public class Repository {

    public void handle(Result<?> result) {
        // 必须实现所有分支，否则编译不通过
        String msg = result.accept(new ResultVisitor<String>() {
            @Override
            public String onSuccess(Object data) {
                return "Success: " + data;
            }

            @Override
            public String onError(Exception exception) {
                return "Error: " + exception.getMessage();
            }

            @Override
            public String onLoading() {
                return "Loading...";
            }
        });
        Log.d("TAG", msg);
    }
}
```

*踩坑原因*：

密封类在编译后就是普通抽象类，Kotlin 编译器承诺的穷举检查对 Java 无效。如果密封类给 Java 用，必须提供额外的契约（如 `accept` / `match` 方法）强制 Java 穷举。

## 坑 20：Kotlin 类默认 final，Java 继承不了 ##

*问题描述*：

Kotlin 的类和方法默认是 `final` 的。Java 代码尝试 `extends` 或 `override` 时，编译直接失败。

### 错误写法 ###

```kotlin
// BaseViewModel.kt
class BaseViewModel : ViewModel() {
    // 方法默认也是 final
    fun loadData() {
        println("loading")
    }
}
```

```java
// Java 子类 — 编译错误！
public class MainViewModel extends BaseViewModel {

    // 报错：This class is not open
    @Override
    public void loadData() {
        // do something
    }
}
```

### 正确写法 ###

```kotlin
// BaseViewModel.kt
// 如果 Java 需要继承，类必须 open
open class BaseViewModel : ViewModel() {

    // 方法也必须 open
    open fun loadData() {
        println("loading")
    }

    // 不允许重写的方法明确标 final 或不标记 open
    fun finalMethod() {
        println("cannot override")
    }
}
```

```java
// Java 子类 — 可以继承了
public class MainViewModel extends BaseViewModel {

    @Override
    public void loadData() {
        // do something
    }
}
```

*踩坑原因*：

Kotlin 默认 `final` 是为了让编译器能做更激进的优化（如内联）。但 Java 没有这种默认，所有非 `final` 类都可继承。混编项目中，所有计划给 Java 继承的基类必须显式 `open`。

## 坑 21：val 属性在 Java 子类中覆盖会出问题 ##

*问题描述*：

Kotlin 父类的 `open val` 属性，在 Java 子类中通过 `getName()` 覆盖时，不会自动生成 backing field，如果实现返回常量或调用 getter 本身，容易引发死循环或逻辑错误。

### 错误写法 ###

```kotlin
// BaseActivity.kt
open class BaseActivity : AppCompatActivity() {
    // open val 属性，Kotlin 中这是纯计算属性（纯 getter，无 field）
    open val screenName: String
        get() = "Unknown"
}
```

```java
// Java 子类
public class MainActivity extends BaseActivity {

    private String myName = "MainActivity";

    // Java 重写 getter，但 Kotlin 中访问 screenName 时调用的是这里
    @Override
    public String getScreenName() {
        // 如果这里写成 return getScreenName() → 死循环！
        return getScreenName();  // 无限递归！
    }
}
```

### 正确写法 ###

```kotlin
// BaseActivity.kt
open class BaseActivity : AppCompatActivity() {
    // 如果 Java 子类需要覆盖，用 open var 明确 backing field
    open var screenName: String = "Unknown"
}
```

```java
// Java 子类
public class MainActivity extends BaseActivity {

    // 直接覆盖字段值
    @Override
    public String getScreenName() {
        // 如果背后有 field，这里返回字段值
        return "MainActivity";
    }
}
```

*踩坑原因*：

`open val` 在 Kotlin 中可能是纯计算属性（没有 backing field）。Java 子类覆盖 getter 时，如果误调用 super.getScreenName() 或自身，会导致死循环。

## 坑 22：泛型通配符 `? extends` 变成 `out` 后混合传递出错 ##

*问题描述*：

Java 的 `List<? extends View>` 在 Kotlin 中翻译为 `List<out View>`，两者在字节码层面虽然相同，但在 Kotlin 和 Java 互相传递时，泛型检查容易产生误导。

### 错误写法 ###

```java
// ViewGroupHelper.java
public class ViewGroupHelper {

    // Java 方法接收 ? extends View
    public void addViews(List<? extends View> views) {
        for (View view : views) {
            // 添加视图逻辑
        }
    }
}
```

```kotlin
// Kotlin 调用方 — 以为能传入 List<Button>
val buttons: List<Button> = listOf(Button(context))
val helper = ViewGroupHelper()
// 编译报错：Type mismatch
// inferred type is List<Button> but List<? extends View> was expected
helper.addViews(buttons)
```

### 正确写法 ###

```java
// ViewGroupHelper.java — 方案一：改用具体类型
public class ViewGroupHelper {

    // 直接用 List<View>，调用方需要做类型转换
    public void addViews(List<View> views) {
        for (View view : views) {
            // add view
        }
    }
}
```

```kotlin
// Kotlin 调用方
val buttons: List<Button> = listOf(Button(context))
val helper = ViewGroupHelper()

// 转成 MutableList<View> 传入（因为 Button 是 View 的子类）
val views: MutableList<View> = ArrayList(buttons)
helper.addViews(views)
```

```java
// ViewGroupHelper.java — 方案二：用 Consumer 模式
public class ViewGroupHelper {

    public void addView(View view) {
        // 单个添加，更灵活
    }
}
```

```kotlin
// Kotlin 调用方
val buttons: List<Button> = listOf(Button(context))
val helper = ViewGroupHelper()
buttons.forEach { helper.addView(it) }
```

*踩坑原因*：

`? extends` 是 Java 泛型的协变点，Kotlin 中用 `out` 表示。但 Kotlin 的类型系统对 `out` 的推断更严格，在互操作时容易产生类型推断困难。在语言边界处尽量用具体类型减少麻烦。

## 坑 23：`@JvmSynthetic` 隐藏方法，Java 找不到 ##

*问题描述*：

Kotlin 的 `@JvmSynthetic` 注解会让方法在 Java 中不可见，只保留给 Kotlin 使用。如果不小心给 Java 需要的方法加了，同事会直接找不到方法。

### 错误写法 ###

```kotlin
// UserExtensions.kt
class UserExtensions {

    companion object {
        // 想给 Kotlin 用，不想让 Java 看到
        @JvmSynthetic
        fun isAdult(user: User): Boolean {
            return user.age >= 18
        }

        // 但这个方法是给 Java 的，误加了 @JvmSynthetic
        @JvmSynthetic  // ← 误加！
        fun formatName(user: User): String {
            return "${user.firstName} ${user.lastName}"
        }
    }
}
```

```java
// Java 调用方 — 找不到方法
public class ProfileActivity extends Activity {
    public void render(User user) {
        // 编译错误：cannot find symbol method formatName(User)
        String name = UserExtensions.formatName(user);
    }
}
```

### 正确写法 ###

```kotlin
// UserExtensions.kt
class UserExtensions {

    companion object {
        // 只给 Kotlin 用的方法
        @JvmSynthetic
        fun isAdult(user: User): Boolean {
            return user.age >= 18
        }

        // 给 Java 用的方法，去掉 @JvmSynthetic
        fun formatName(user: User): String {
            return "${user.firstName} ${user.lastName}"
        }
    }
}
```

```java
// Java 调用方
public class ProfileActivity extends Activity {
    public void render(User user) {
        // 方法可见，调用成功
        String name = UserExtensions.formatName(user);
    }
}
```

*踩坑原因*：

`@JvmSynthetic` 会直接从 Java 的类文件中删除该方法。适合缩减方法数（Android 65535 限制），但公共 API 层的任何方法都不要加这个注解。

## 坑 24：Kotlin 内部类和 Java 内部类的差异 ##

*问题描述*：

Kotlin 的 `inner class` 持有外部类引用，但默认嵌套类（没有 inner）是静态的，不带外部引用。Java 的嵌套类默认都持有外部引用。这种语义差异在序列化和 Handler 场景容易踩坑。

### 错误写法 ###

```kotlin
// MainActivity.kt
class MainActivity : AppCompatActivity() {

    // 默认是静态嵌套类，不持有 MainActivity 引用
    class StaticAdapter : RecyclerView.Adapter<StaticAdapter.VH>() {

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
            // 这里无法访问 MainActivity 的实例成员
            // val textColor = textColorResource  // 编译错误
            return VH(...)
        }

        override fun onBindViewHolder(holder: VH, position: Int) {
            // 绑定逻辑
        }

        override fun getItemCount(): Int = 0
    }
}
```

```java
// Java 调用方
public class LeakTest {

    public void test() {
        MainActivity activity = new MainActivity();
        // 这里的 adapter 实际上是静态类，Java 看来是 MainActivity.StaticAdapter
        MainActivity.StaticAdapter adapter = new MainActivity.StaticAdapter();
    }
}
```

### 正确写法 ###

```kotlin
// MainActivity.kt
class MainActivity : AppCompatActivity() {

    // 如果需要访问外部 Activity 实例，必须加 inner
    inner class ContextAdapter : RecyclerView.Adapter<ContextAdapter.VH>() {

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
            // 可以访问外部 Activity 的成员
            val textColor = Resources.getSystem().getColor(android.R.color.black)
            return VH(...)
        }

        override fun onBindViewHolder(holder: VH, position: Int) {
            // 可以访问 this@MainActivity
            val context = this@MainActivity
        }

        override fun getItemCount(): Int = 0
    }
}
```

```java
// Java 调用方
public class LeakTest {

    public void test(MainActivity activity) {
        // inner class 持有外部引用，Java 看到的是
        // MainActivity.ContextAdapter adapter = activity.new ContextAdapter();
        MainActivity.ContextAdapter adapter = activity.new ContextAdapter();
    }
}
```

*踩坑原因*：

Kotlin 和 Java 对内部类的默认语义完全相反：Kotlin 默认静态（NestedClass），Java 默认内部（持有外部引用）。这种差异在序列化（`Parcelable` / `Serializable`）和 `Handler` 内存泄漏场景非常容易踩坑。

## 坑 25：伴生对象实现接口，Java 只看到空壳 ##

*问题描述*：

Kotlin 允许伴生对象实现接口，但 Java 中伴生对象的类型是 OuterClass.Companion，无法直接当作该接口使用，导致 Java 端无法回调。

### 错误写法 ###

```kotlin
// UserComparator.kt
class UserComparator {

    companion object : Comparator<User> {
        override fun compare(o1: User?, o2: User?): Int {
            return o1?.id?.compareTo(o2?.id ?: 0) ?: 0
        }
    }
}
```

```java
// Java 调用方
public class UserSorter {

    public void sort(List<User> users) {
        // Java 无法把 Companion 直接当 Comparator 用
        // Collections.sort(users, UserComparator.Companion); // 编译失败

        // 只能通过静态方法间接调用
        UserComparator.getComparator().compare(users.get(0), users.get(1));
    }
}
```

### 正确写法 ###

```kotlin
// UserComparator.kt
class UserComparator {

    companion object {
        // 在伴生对象里暴露一个静态的 Comparator 实例
        @JvmStatic
        val comparator: Comparator<User> = Comparator { o1, o2 ->
            o1.id.compareTo(o2.id)
        }
    }
}
```

```java
// Java 调用方
public class UserSorter {

    public void sort(List<User> users) {
        // 直接拿到 Comparator 实例
        Collections.sort(users, UserComparator.comparator);

        // 或者用 List.sort
        users.sort(UserComparator.comparator);
    }
}
```

*更简洁的方案*：

```kotlin
// UserComparator.kt
// 直接定义 object 单例实现接口
object UserComparator : Comparator<User> {
    override fun compare(o1: User?, o2: User?): Int {
        return o1?.id?.compareTo(o2?.id ?: 0) ?: 0
    }
}
```

```java
// Java 调用方
public class UserSorter {
    public void sort(List<User> users) {
        // UserComparator 实现了 Comparator，Java 可以直接用
        Collections.sort(users, UserComparator);
    }
}
```

*踩坑原因*：

伴生对象实现接口后，在 Java 中它的类型仍然是 `OuterClass.Companion`，而不是那个接口。Java 的类型系统无法自动转换这种关系。

## 坑 26：Kotlin 数据类的 `copy()` 在 Java 里看不到 ##

*问题描述*：

数据类自动生成的 `copy()` 方法是 Kotlin 独享，Java 中不会生成同名方法。Java 要实现“复制并修改部分字段”，只能手动构造新对象。

### 错误写法 ###

```kotlin
// Order.kt
data class Order(
    val id: String,
    val amount: Double,
    val status: String,
    val createTime: Long
)
```

```java
// Java 调用方 — 想 copy 一个订单并修改状态
public class OrderService {

    public Order updateStatus(Order original, String newStatus) {
        // Java 看不到 copy() 方法！
        // 只能手动 new 一个，把所有字段都传一遍
        return new Order(
            original.getId(),
            original.getAmount(),
            newStatus,
            original.getCreateTime()
        );
    }
}
```

### 正确写法 ###

```kotlin
// Order.kt
data class Order(
    val id: String,
    val amount: Double,
    val status: String,
    val createTime: Long
) {
    // 给 Java 用的 Builder 或复制方法
    fun toBuilder(): Builder {
        return Builder(this)
    }

    class Builder private constructor() {
        private var id: String = ""
        private var amount: Double = 0.0
        private var status: String = ""
        private var createTime: Long = 0L

        constructor(order: Order) : this() {
            this.id = order.id
            this.amount = order.amount
            this.status = order.status
            this.createTime = order.createTime
        }

        fun id(id: String) = apply { this.id = id }
        fun amount(amount: Double) = apply { this.amount = amount }
        fun status(status: String) = apply { this.status = status }
        fun createTime(createTime: Long) = apply { this.createTime = createTime }
        fun build() = Order(id, amount, status, createTime)
    }
}
```

```java
// Java 调用方
public class OrderService {

    public Order updateStatus(Order original, String newStatus) {
        // 用 Builder，只需修改需要的字段
        return original.toBuilder()
            .status(newStatus)
            .build();
    }
}
```

*踩坑原因*：

`copy()` 是 Kotlin 数据类特有的语法糖，编译后生成的是一个重载构造方法，但 Java 中无法直接调用。对于 Java 友好的数据类，推荐手写 `Builder` 或 `toBuilder()`。

## 坑 27：ProGuard 混淆吞掉 `@JvmStatic` 等注解 ##

*问题描述*：

ProGuard 或 R8 混淆时，如果不保留注解，`@JvmStatic` 生成的静态方法可能被误删或重命名，导致 Java 侧 `NoSuchMethodError`。

### 错误写法 ###

```ini
# proguard-rules.pro — 没有保留注解
-dontshrink
-dontoptimize
# 其他规则...
```

运行后，release 包中：

```java
// Java 调用
Config.getAppName();  // NoSuchMethodError！
```

### 正确写法 ###

```proguard
# proguard-rules.pro

# 保留所有注解（必须！）
-keepattributes *Annotation*

# 如果有自定义注解，指定保留
-keep @interface com.example.** { *; }

# 保留有 @JvmStatic 方法的类（如果类被混淆了，静态方法名也会变）
-keepclassmembers class com.example.** {
    @androidx.annotation.Keep *;
}

# 或者保留整个工具类
-keep class com.example.util.** {
    *;
}
```

```bash
# 验证混淆结果
# 反编译 APK，确认静态方法名和注解还在
```

*踩坑原因*：

`@JvmStatic` 的静态方法是 Java 侧调用的入口，如果类名或方法名被混淆，Java 侧就会找不到。`-keepattributes` *Annotation* 是混编项目的必备配置。

## 坑 28：Java 调用 Kotlin 顶层 val 常量内联问题 ##

*问题描述*：

Kotlin 的 `const val` 在 Java 中会被直接内联（编译时替换为字面量），后续若修改常量值，Java 端不重新编译就不会更新。

### 错误写法 ###

```kotlin
// AppConfig.kt
package com.example.config

object AppConfig {
    const val MAX_RETRY = 3
    const val API_VERSION = "v2"
}
```

```java
// Java 调用方
public class ApiClient {

    public void connect() {
        // MAX_RETRY 和 API_VERSION 被内联到 Java 字节码中
        for (int i = 0; i < 3; i++) {  // 硬编码了 3
            callApi("v2");  // 硬编码了 v2
        }
    }
}
```

```kotlin
// AppConfig.kt — 后来有人改了值
object AppConfig {
    const val MAX_RETRY = 5  // 改成 5
    const val API_VERSION = "v3"  // 改成 v3
}
```

```java
// Java 调用方 — 没有强制重新编译的话，仍然是 3 和 v2！
public class ApiClient {

    public void connect() {
        // 运行结果仍然用旧值，因为 Java 端已经内联了
        for (int i = 0; i < 3; i++) {  // 还是 3！
            callApi("v2");  // 还是 v2！
        }
    }
}
```

### 正确写法 ###

```kotlin
// AppConfig.kt
package com.example.config

object AppConfig {
    // 用 @JvmField 暴露为静态字段，不会被内联
    @JvmField
    val MAX_RETRY = 3

    @JvmField
    val API_VERSION = "v2"
}
```

```java
// Java 调用方
public class ApiClient {

    public void connect() {
        // 通过字段访问，始终读取最新值
        for (int i = 0; i < AppConfig.MAX_RETRY; i++) {
            callApi(AppConfig.API_VERSION);
        }
    }
}
```

*踩坑原因*：

`const val` 是编译期常量，Java 编译时直接替换为字面量。`@JvmField val` 是运行时常量，通过字段访问，始终读取内存中的最新值。

## 坑 29：Kotlin 集合的只读接口与 Java 的互操作 ##

*问题描述*：

Kotlin 的 `List` / `Set` / `Map` 是只读接口，Java 拿到后如果强转成 `ArrayList` / `HashSet` 修改，可能导致不可预料的共享修改或 `UnsupportedOperationException`。

### 错误写法 ###

```kotlin
// UserRepository.kt
class UserRepository {

    // 返回只读 List
    fun getAllUsers(): List<User> {
        val users = mutableListOf<User>()
        users.add(User("1", "Alice"))
        users.add(User("2", "Bob"))
        return users
    }
}
```

```java
// Java 调用方 — 强转成 ArrayList 修改
public class UserService {

    public void addUser(UserRepository repo, User newUser) {
        List<User> users = repo.getAllUsers();
        // Java 拿到了 List 接口，但实际底层可能是不可变列表
        // 强转成 ArrayList 尝试修改
        ((ArrayList<User>) users).add(newUser);  // 可能抛 UnsupportedOperationException！
    }
}
```

### 正确写法 ###

```kotlin
// UserRepository.kt
class UserRepository {

    // 方案一：返回 MutableList 明确告诉 Java 可以修改
    fun getAllUsers(): MutableList<User> {
        return mutableListOf(
            User("1", "Alice"),
            User("2", "Bob")
        )
    }

    // 方案二：返回不可变列表的副本
    fun getUsersSnapshot(): List<User> {
        return ArrayList(getAllUsers())  // 返回副本
    }
}
```

```java
// Java 调用方
public class UserService {

    // 方案一：收到明确的 MutableList，可以安全修改
    public void addUser(UserRepository repo, User newUser) {
        MutableList<User> users = repo.getAllUsers();
        users.add(newUser);  // 安全
    }

    // 方案二：收到不可变副本，如果要修改需要自己新建
    public void addUserSafe(UserRepository repo, User newUser) {
        List<User> users = repo.getUsersSnapshot();
        // 不能直接修改，需要新建 ArrayList
        List<User> newList = new ArrayList<>(users);
        newList.add(newUser);
    }
}
```

*踩坑原因*：

Kotlin 的只读集合接口只是没有 `add`/`remove` 方法，但底层实现可能是可变列表。一旦 Java 拿到引用并强转修改，会影响原数据。跨模块时，Java 侧永远不要假设集合的可变性。

## 坑 30：Kotlin `Nothing` 类型在 Java 的体现 ##

*问题描述*：

Kotlin 中返回 `Nothing` 的函数（如 `TODO()`、`throw` 表达式）在 Java 中签名返回 Void，但实际上会抛异常。Java 调用后以为返回了值，可能写出逻辑错误。

### 错误写法 ###

```kotlin
// Feature.kt
class Feature {

    // Kotlin 中返回 Nothing，表示永远不返回
    fun notImplemented(): Nothing {
        throw NotImplementedError("Not implemented yet")
    }
}
```

```java
// Java 调用方 — 以为返回了 Void，可以接收结果
public class MainActivity extends Activity {

    public void test() {
        Feature feature = new Feature();

        // Java 看到返回 Void，以为可以接收 null
        Void result = feature.notImplemented();

        // 但实际上这行永远不会执行，直接抛异常
        Log.d("TAG", "result: " + result);  // 永远走不到这里
    }
}
```

### 正确写法 ###

```kotlin
// Feature.kt
class Feature {

    // 方案一：明确返回 null，Java 侧收到 null
    fun notImplemented(): String? {
        throw NotImplementedError("Not implemented yet")
    }

    // 方案二：如果确实要返回 Nothing，注释中强制说明
    /**
     * 此方法永远不会正常返回，总是抛异常
     * @throws NotImplementedError  always
     */
    fun mustThrow(): Nothing {
        throw NotImplementedError("Not implemented yet")
    }
}
```

```java
// Java 调用方
public class MainActivity extends Activity {

    public void test() {
        Feature feature = new Feature();

        // 方案一：收到 null 或异常
        String result = feature.notImplemented();

        // 方案二：知道会抛异常，主动 catch 或不再往下执行
        try {
            feature.mustThrow();
        } catch (NotImplementedError e) {
            // 处理异常
        }
    }
}
```

*踩坑原因*：

`Nothing` 是 Kotlin 的底层类型，表示“永不返回”。
