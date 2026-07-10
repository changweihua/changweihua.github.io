---
lastUpdated: true
commentabled: true
recommended: true
title: Java 8-25 各个版本新特性总结
description: Java 8-25 各个版本新特性总结
date: 2026-03-16 14:34:00 
pageClass: blog-page-class
cover: /covers/java.svg
---

## Java 8 ##

### ‌Lambda 表达式 ###

Lambda 表达式允许你以一种更简洁的方式表示函数式接口的实例。它能够使代码更加简洁和易读。

```java
// 示例
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.forEach(name -> System.out.println(name));
```

### 函数式接口 ###

函数式接口是只包含一个抽象方法的接口，可以使用 `@FunctionalInterface` 注解来标识。

```java
@FunctionalInterface
interface MyFunctionalInterface {
    void execute();
}
```

### 方法引用 ###

方法引用是一种更简洁地表示 lambda 表达式的方法。可以使用类名或对象名来引用方法。

```java
// 示例
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
names.forEach(System.out::println);
```

### ‌Stream API ###

Stream API 提供了一种高效处理集合的方式，通过流式操作可以进行过滤、映射、排序等操作。

```java
// 示例
List<String> filteredNames = names.stream()
                                   .filter(name -> name.startsWith("A"))
                                   .collect(Collectors.toList());
```

### ‌Optional 类 ###

Optional 类用于防止空指针异常，它可以包含值或不包含值。

```java
// 示例
Optional<String> optionalName = Optional.ofNullable(null);
optionalName.ifPresent(System.out::println); // 不会输出任何内容
```

### ‌默认方法 ###

接口可以包含默认实现的方法，这样子类可以选择重写或者直接使用。

```java
interface MyInterface {
    default void defaultMethod() {
        System.out.println("Hello from default method");
    }
}
```

### ‌新日期时间 API ###

Java 8 引入了新的日期时间 API 来替代旧的 java.util.Date 和 java.util.Calendar 类，提供更好的可读性和可用性。

```java
// 示例
LocalDate today = LocalDate.now();
System.out.println(today);
```

### 重复注解 ###

Java 8 支持在同一位置上使用相同类型的注解多次。

```java
@MyAnnotation
@MyAnnotation
public class MyClass {
}
```

## Java 11 ##

### ‌局部变量类型推断 ###

引入 `var` 关键字，编译器自动推断局部变量类型，简化代码书写。

```java
var list = new ArrayList<String>();  // 类型自动推断为 ArrayList<String>
var name = "Java";                  // 类型自动推断为 String
```

- 语法‌：var 只能用于局部变量，编译器根据初始化值推断类型。
- ‌优势‌：减少样板代码，但需注意类型明确性。
- ‌限制‌：不能用于方法参数、返回值或类成员变量。

### ‌字符串方法增强 ###

Java 11 增加了一些新的字符串方法，改善了字符串操作的便利性。

- String.isBlank(): 判断字符串是否为空或仅包含空白字符。
- String.lines(): 将字符串按行分割并返回流。
- String.repeat(int count): 重复字符串指定次数。

```java
String str = "   ";
System.out.println(str.isBlank()); // true

String multiLine = "Hello\nWorld";
multiLine.lines().forEach(System.out::println); // 输出每一行

String repeated = "abc".repeat(3); // "abcabcabc"
```

### ‌新 HTTP Client API ###

Java 11 引入了新的 HTTP 客户端 API，支持 HTTP/2，能够以非阻塞方式发送请求和接收响应。

```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://api.example.com"))
        .build();

client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
      .thenApply(HttpResponse::body)
      .thenAccept(System.out::println);
```

### 文件和目录的增强 ###

Files 类中增加了 readString() 和 writeString() 方法，使得读取和写入文件更加方便。

```java
Path path = Paths.get("example.txt");
Files.writeString(path, "Hello, World!"); // 写入文件
String content = Files.readString(path); // 读取文件
```

### 弃用和删除不再使用的功能 ###

Java 11 删除了一些过时的API和功能，例如：

- 移除 javax.xml.bind（JAXB）模块
- 移除 java.activation 模块

### ‌ZGC 垃圾收集器 ###

Java 11 引入了实验性的 ZGC（零停顿垃圾回收器），旨在处理大内存应用程序，以提供更低的停顿时间。
可伸缩、低延迟垃圾收集器，停顿时间≤10ms，适用于大堆内存场景。

```java
java -XX:+UseZGC MyApp  // 启用 ZGC
```

- ‌核心特性‌：并发处理、堆内存压缩，停顿时间≤10ms（实际≤1.68ms）。
- ‌适用场景‌：高吞吐量、低延迟应用（如金融系统）。ZGC 适用于大堆内存场景，但需 Linux/x64 平台。

### 运行时常量池 ###

Java 11 优化了常量池的实现，以减少内存占用并提高性能。

### 增强的 JEP ###

Java 11 包括多个 JEP，如：

- JEP 318: Epsilon (无操作) 垃圾回收器
- JEP 321: HTTP Client
- JEP 352: Non-Volatile Mapped Byte Buffers
- 无操作垃圾收集器，适用于嵌入式系统。

```java
java -XX:+UseEpsilonGC MyApp  // 启用 Epsilon
```

Java Flight Recorder（JFR），集成到 JVM，提供性能分析工具。

```java
java -XX:+FlightRecorder MyApp  // 启用 JFR
```

## Java 17 ##

### ‌密封类（Sealed Classes） ###

通过 sealed 关键字限制类的继承范围，增强封装性。

密封类允许开发者控制哪些类可以扩展或实现某个类或接口。通过这种方式，可以定义一个受限的继承层次结构。

```java
sealed class Shape permits Circle, Square {}

final class Circle extends Shape {}
final class Square extends Shape {}
```

### ‌模式匹配（Pattern Matching for instanceof） ###

Java 17 引入了对 `instanceof` 的模式匹配，简化了类型检查和强制转换的过程。

```java
Object obj = "Hello, World!";
if (obj instanceof String s) {
    System.out.println(s.toUpperCase()); // 直接使用 s，不需要再次强制转换
}
```

### 文本块（Text Blocks） ###

虽然在 Java 13 和 Java 14 中引入了文本块，Java 17 将其正式标准化。文本块使得多行字符串的书写变得更加简单和可读。

```java 体验AI代码助手 代码解读复制代码String json = """
    {
        "name": "Alice",
        "age": 30
    }
    """;
```

### ‌增强的随机数生成 API ###

Java 17 引入了一组全新的随机数生成器 API，提供更好的性能和灵活性，支持多种随机数生成策略。

```java
RandomGenerator generator = RandomGenerator.of("L128X256MixRandom");
int randomInt = generator.nextInt(100); // 生成 0 到 99 之间的随机整数
```

### JEP 411: java.nio.file.Path 的方法增强 ###

新增的 Path 方法可以方便地从文件系统路径中获取文件名、父目录等信息。

```java
Path path = Paths.get("/usr/local/bin/java");
System.out.println(path.getFileName()); // 输出 "java"
```

### JEP 382: 新的 switch 表达式模式匹配 ###

Java 17 对 switch 表达式进行了改进，简化了代码逻辑，使得处理多种情况更加直观。

```java
String dayType = switch (day) {
    case MONDAY, FRIDAY -> "Working Day";
    case SATURDAY, SUNDAY -> "Weekend";
    default -> "Unknown";
};
```

### 外部函数和内存访问 API（JEP 412） ###

Java 17 提供了一种新的 API，用于与外部代码库进行交互，能够更容易、更安全地访问本地代码。

### 移除旧的和不再使用的特性 ###

Java 17 移除了多个较旧和不再使用的特性，例如移除了 Applet API 和其他过时的组件，以减少平台的复杂性。

### 性能优化和安全性增强 ###

Java 17 在性能和安全性方面进行了许多底层优化，以提高整体运行效率和安全性。

## Java 21 ##

### ‌增强的模式匹配（Pattern Matching for switch） ###

Java 21 引入了对 switch 表达式的模式匹配，允许使用更灵活的条件来处理不同类型的对象。这使得可以在 switch 中简化类型检查和转换逻辑。

```java
// 多值匹配
String unit = "cm";
String str = switch (unit) {
    case "cm", "m" -> "厘米";
    case "mm" -> "毫米";
    case "km" -> "千米";
    default -> "错误";
};
```

```java 体验AI代码助手 代码解读复制代码
Object obj = "Hello, World!";
String result = switch (obj) {
    case String s -> s.toUpperCase();
    case Integer i -> "Integer: " + i;
    default -> "Unknown type";
};
```

### 记录类（Record Classes）增强 ###

Java 21 对记录类进行了增强，允许在记录类中定义额外的方法、静态方法和实现接口。这使得记录类的功能更加丰富。

```java
record Person(String name, int age) {
    public String info() {
        return name + " is " + age + " years old.";
    }
}
```

### ‌虚拟线程（Virtual Threads） ###

虚拟线程是 Java 21 的重要新特性，旨在显著简化并发编程，使得开发者能够轻松构建高并发应用程序。虚拟线程不再依赖于操作系统线程，而是通过 JVM 管理，从而减小了资源开销。

通过 M:N 调度模型（JVM 管理轻量级线程，映射到少量 OS 线程）实现高并发，单线程内存占用仅 400 字节（传统线程需 1MB+），支持百万级并发任务。

```java
// 创建虚拟线程
Thread.startVirtualThread(() -> {
    System.out.println("轻量级线程: " + Thread.currentThread());
});

// 虚拟线程池（生产推荐）
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 1_000_000).forEach(i -> 
        executor.submit(() -> processTask(i))
    );
}

Thread.ofVirtual().start(() -> {
    // 执行任务
});
```

### 外部记忆 API（Foreign Function & Memory API） ###

这是一个实验性 API，提供了一种安全且高效地访问本地代码和内存的方式。它使得与 C 和其他语言编码交互变得更加容易和安全。

```java
MemorySegment segment = MemorySegment.allocateNative(100);
segment.set(0, 42); // 设置数据
```

### 增强的 JEP（JDK Enhancement Proposals） ###

Java 21 包含若干个重要的 JEP，例如：

- JEP 420: 列表类（List） — 提供了更方便的操作。
- JEP 421: Scoped Values — 一种新的 API，用于传递线程本地值。

### JEP 431: String 方法的增强 ###

Java 21 为 String 类增加了几个新方法，比如 `String.stripIndent()` 和 `String.translateEscapes()`，这些方法使字符串处理更加灵活。

```java
String text = """
    Hello,
        World!
    """.stripIndent(); // 可以去除缩进
```

### ‌Switch 表达式的增强 ###

在 switch 表达式中，可以使用 yield 关键字返回结果，从而提高可读性。

```java
int number = 3;
String description = switch (number) {
    case 1 -> "One";
    case 2 -> "Two";
    case 3 -> "Three";
    default -> yield "Unknown Number";
};
```

### 性能优化和安全性增强 ###

Java 21 在底层实现上进行了多个性能优化和安全性增强，以提高运行时效率和减少潜在的安全漏洞。

## Java 25 ##

### 实例main方法 ###

JEP 512 基于 Java 21 引入的简化启动器机制，允许开发者无需类声明即可编写快速脚本或演示程序。这些紧凑源文件特别适合教学、脚本编写和快速原型开发，既降低了新手的入门门槛，也缩短了学习曲线。

不再需要 `public static void main(String[] args)` 的“仪式性”代码。现在，入门可以如此简单：

```java
class HelloWorld {
    void main() { // 注意：没有static，没有public
        System.out.println("你好，Java 25!");
    }
}
```

新手写第一个程序时，不用再被static、String[] args这些复杂概念吓到，学习曲线更平滑。

### 灵活构造函数体 ###

灵活构造函数体（JEP 513）允许多个构造函数委托至公共初始化体，实现方式如下：

```java
class Person {
    final int age;

    Person(int age) {
        this.age = age;
    }
}

class Employee extends Person {
    final String name;

    Employee(String name, int age) {
        if (age < 18 || age > 67)
            throw new IllegalArgumentException("Age must be between 18 and 67");
        super(age); // Java 25 中 super() 不再必须作为构造函数的第一条语句
        this.name = name;
    }

    public static void main(String[] args) {
        var emp = new Employee("Alice", 35);
        System.out.println("Person age set: " + emp.age);
    }
}
```

在 JEP 513 之前，Java 构造函数必须将 `super(...)` 或 `this(...)` 作为第一条语句，这常导致校验逻辑或初始化代码重复，或被迫提取到静态辅助方法中。JEP 513 允许在构造函数调用前执行代码，使参数校验和共享初始化逻辑能集中处理，既提升了代码可读性和快速失败能力，又保证了对象完整性，同时不违反 Java 的构造规则。

灵活构造函数体允许在调用父类构造器（`super()`）之前执行一些逻辑，比如参数校验。

```java
class PositiveInteger {
    int value;
    PositiveInteger(int val) {
        if (val <= 0) throw new IllegalArgumentException("必须为正数");
        super(); // 现在这行可以写在后面了
        this.value = val;
    }
}
```
以前构造函数的写法很死板，必须先调用 `super()`，现在可以更自由地安排初始化逻辑的顺序，让代码更合理。

### 原始类型模式匹配 ###

在 `instanceof` 和 `switch` 中直接匹配int、double等基本类型。

```java
Object obj = 42;
if (obj instanceof int i) { // 直接匹配int类型
    System.out.println("这是一个整数: " + i);
}
```

处理未知类型的对象时，对于基本类型也能像对象一样进行优雅的类型判断和提取，代码更统一、安全。

### 作用域值 ###

JEP 506 提供了轻量级、不可变且线程安全的 ThreadLocal 替代方案，专为与虚拟线程协同工作而设计：

```java
package com.example.test.util;

import java.lang.ScopedValue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ScopedUserExample {

    static final ScopedValue<String> USER = ScopedValue.newInstance();

    void main() {
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            executor.submit(() -> ScopedValue.where(USER, "Alice").run(() -> {
                System.out.println("Thread: " + Thread.currentThread());
                System.out.println("User: " + USER.get());
            }));

            executor.submit(() -> ScopedValue.where(USER, "Bob").run(() -> {
                System.out.println("Thread: " + Thread.currentThread());
                System.out.println("User: " + USER.get());
            }));

            // 添加延迟确保输出在 main 退出前显示
            Thread.sleep(200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

作用域值（Scoped Values）通过安全、高性能且不可变的方式在调用链间传递上下文，尤其适合虚拟线程和结构化并发场景。相比 ThreadLocal，它避免了内存泄漏和同步开销，提供了更高效的替代方案。

> 注：使用作用域值与虚拟线程时，访问作用域值的逻辑必须封装在 `ScopedValue.where(...).run(...)` 作用域内。仅将任务提交至 executor 作用域并不足够，任务本身必须在作用域（Scope）内创建才能保留绑定值。

作用域值用于在线程（特别是虚拟线程）内高效、安全地传递数据，旨在替代老旧的ThreadLocal。

```java
final static ScopedValue<String> USER = ScopedValue.newInstance();

// 在某个作用域内绑定值
ScopedValue.where(USER, "张三").run(() -> {
    System.out.println(USER.get()); // 输出：张三
    // 在这里启动的虚拟线程也会自动继承这个值
});
```

虚拟线程的“轻量”也要求数据共享方式必须高效。作用域值就像是为虚拟线程量身定制的“任务传声筒”，比传统方式更快、更不易出错。

### 结构化并发 ###

JEP 505 通过将相关线程视为具有明确生命周期的单一工作单元来简化并发编程。第五预览版改用`StructuredTaskScope.open()`静态工厂方法替代构造函数和独立策略方法，使自定义合并与错误处理行为的定义更一致灵活。以下是新语法示例：

```java
import java.util.concurrent.StructuredTaskScope;

public class StructuredExample {
    static String fetchUser() {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Alice";
    }

    static String fetchOrder() {
        try {
            Thread.sleep(150);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Order#42";
    }

    public static void main(String[] args) throws Exception {
        try (var scope = StructuredTaskScope.<String>open()) {
            var userTask = scope.fork(() -> fetchUser());
            var orderTask = scope.fork(() -> fetchOrder());

            scope.join();

            System.out.println(userTask.get() + " - " + orderTask.get());
        }
    }
}
```

结构化并发帮助管理逻辑关联的多个并发任务，确保子线程作为整体完成或取消，从而提升多线程应用的可靠性和可读性。

### 稳定值 ###

稳定值（Stable Value）API（JEP 502）将 Optional 式语义扩展至上下文稳定的不可变值：

```java
import java.lang.StableValue;

public class StableExample {
    public static void main(String[] args) {
        // 创建未设置的 StableValue
        var greeting = StableValue.<String>of();

        String message = greeting.orElseSet(() -> "Hello from StableValue!");
        System.out.println(message);
    }
}
```

稳定值提供了一套 API，用于跨线程或计算过程安全共享不可变的上下文稳定值。该特性适用于缓存、惰性求值或稳定作用域内的一致性读取等场景，并能与结构化并发良好集成。

### PEM 编码 ###

JEP 470 通过标准 API 新增了对 PEM 格式加密密钥及证书的读写支持，简化后的操作如下：

```java
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class PEMExample {
    public static void main(String[] args) {
      String pem = """
        -----BEGIN PUBLIC KEY-----
        MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgjDohS0RHP395oJxciVaeks9N
        KNY5m9V1IkBBwYsMGyxskrW5sapgi9qlGSYOma9kkko1xlBs17qG8TTg38faxgGJ
        sLT2BAmdVFwuWdRtzq6ONn2YPHYj5s5pqx6vU5baz58/STQXNIhn21QoPjXgQCnj
        Pp0OxnacWeRSnAIOmQIDAQAB
        -----END PUBLIC KEY-----
        """;

        try {
            String base64 = pem.replaceAll("-----.*-----", "").replaceAll("\s", "");
            byte[] keyBytes = Base64.getDecoder().decode(base64);

            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            KeyFactory factory = KeyFactory.getInstance("RSA");
            PublicKey key = factory.generatePublic(spec);

            System.out.println("Loaded key: " + key.getAlgorithm());
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            e.printStackTrace();
        }
    }
}
```

现在可直接通过 Java Security API 处理 PEM 编码对象（如 X.509 证书和 RSA 密钥），无需第三方库或手动转换。该特性增强了与基于 OpenSSL 系统的互操作性，并简化了安全通信流程。

### 向量 API ###

JEP 508 提供的 API 能将向量计算可靠地编译为最优化的向量硬件指令：

```java
import jdk.incubator.vector.*;

public class VectorExample {
    public static void main(String[] args) {
        float[] left = {1f, 2f, 3f, 4f};
        float[] right = {5f, 6f, 7f, 8f};

        FloatVector a = FloatVector.fromArray(FloatVector.SPECIES_128, left, 0);
        FloatVector b = FloatVector.fromArray(FloatVector.SPECIES_128, right, 0);
        FloatVector c = a.add(b);

        float[] result = new float[FloatVector.SPECIES_128.length()];
        c.intoArray(result, 0);

        System.out.println("Vector result: " + java.util.Arrays.toString(result));
    }
}
```

需启用参数：`--enable-preview --add-modules jdk.incubator.vector`。

向量 API 支持在现代 CPU 上高效执行数据并行计算，通过利用 SIMD 指令使 Java 代码达到媲美手工调优原生代码的性能，目前仍处于孵化演进阶段。

向量 API 允许你编写能充分利用 CPU SIMD 指令的代码，大幅提升科学计算、AI 模型推理等场景的性能。

```java
// 将两个浮点数数组进行向量化加法（伪代码风格，实际使用需创建VectorSpecies）
float[] a = {1.0f, 2.0f, 3.0f, 4.0f};
float[] b = {5.0f, 6.0f, 7.0f, 8.0f};
float[] c = new float[4];

var species = FloatVector.SPECIES_256;
for (int i = 0; i < a.length; i += species.length()) {
    var va = FloatVector.fromArray(species, a, i);
    var vb = FloatVector.fromArray(species, b, i);
    var vc = va.add(vb);
    vc.intoArray(c, i);
}
// 结果c为：[6.0, 8.0, 10.0, 12.0]，且CPU是并行计算的
```

以前 Java 做大量数据计算时有点“笨拙”，一次只能算一个数。向量 API 让它能“一心多用”，让 CPU 一次性处理一大块数据，特别适合图像处理、机器学习这些领域。

### 密钥派生函数 API ###

Java 25 为基于密码的密钥派生函数（如 PBKDF2 和 scrypt）引入了标准 API：

```java
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class KeyDerivationExample {
    public static void main(String[] args) throws Exception {
        char[] password = "hunter2".toCharArray();
        byte[] salt = "somesalt".getBytes();
        PBEKeySpec spec = new PBEKeySpec(password, salt, 65536, 256);

        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        SecretKey key = factory.generateSecret(spec);

        System.out.println("Derived key format: " + key.getFormat());
    }
}
```

JEP 510 标准化了从用户密码派生加密密钥的常用加密原语访问方式，既降低了对第三方库的依赖，又提供了开箱即用的安全实现。

提供了生成加密密钥的标准方法。

```java
// 使用HKDF算法从主密钥派生子密钥
SecretKey masterKey = ... // 主密钥
KDF kdf = KDF.of("HKDF-SHA256");
SecretKey derivedKey = kdf.deriveKey(masterKey, "会话密钥".getBytes(), 32);
```

加密开发更规范了。用一个根密钥安全地生成多个子密钥，就像用一把主钥匙配出几把不同用途的房门钥匙，是构建现代安全系统的基础。

### 模块化导入声明 ###

JEP 511 引入了模块导入声明功能，允许通过 `import` 语句声明模块依赖关系，从而提升模块化代码的可读性。该提案支持在 Java 文件顶部通过 `import module` 语句声明模块依赖（类似传统导包语法），这一改进既增强了代码清晰度，也使开发工具能更精准推断依赖关系。

```java
package com.example.test.util;

//import java.util.Date;
import module java.base;

public class Java25 {
    void main() {
        Date d = new Date();
        System.out.println("Resolved Date: " + d);
    }
}
```

需注意避免引用歧义。比如下面代码 `import` 就引入歧义了，因为两个模块都包含了 Date 类：

```java
import module java.base;      // 导出包含 java.util.Date 的 java.util 模块
import module java.sql;       // 导出包含 java.sql.Date 的 java.sql 模块

public class Main {
    void main() {
        Date d = new Date();
        System.out.println("Resolved Date: " + d);
    }
}
```

此时解决方案是显式导入需要使用的具体类：

```java
import module java.base;
import module java.sql;

import java.util.Date;

public class Main {
    void main() {
        Date d = new Date();
        System.out.println("Resolved Date: " + d);
    }
}
```

该变更还支持从星号导入切换为模块级导入：

```java
import javax.xml.*; 
import javax.xml.parsers.*; 
import javax.xml.stream.*;
```

这些导入语句可合并为：

```java
import module java.xml;
```

尽管不建议滥用星号导入和模块导入，但该特性确实使导入和依赖定义更加简洁精炼。

### JVM 与底层：更省内存，更快启动 ###

#### 移除 32 位 x86 移植版本（JEP 503 - 最终版） ####

JEP 503 移除了 OpenJDK 对传统 32 位 x86 架构的支持，该提案消除了对逐渐失去相关性的平台的维护成本，而 64 位 x86 和 ARM64 移植版本仍获完整支持。

#### JFR CPU 时间分析（JEP 509 - 实验性功能） ####

JEP 509 为 Java Flight Recorder（JFR）新增基于 CPU 时间的分析支持，该特性可记录并分析特定方法或线程消耗的 CPU 时间，从而提升性能诊断能力（尤其适用于多线程和 I/O 密集型场景）。通过 JDK.CPULoad 及相关 JFR 事件实现自定义记录：

```java
java
  -XX:StartFlightRecording=filename=cpu-time.jfr,duration=10s,settings=profile
  --enable-preview
  MyApp
```

随后通过 JDK Mission Control 或 VisualVM 分析 CPU time.JFR 文件，即可观测各方法和线程的 CPU 使用情况。

#### AOT 编译命令行易用性改进（JEP 514 - 最终版） ####

AOT 编译命令行易用性改进（JEP 514）通过优化 jaotc 和基于 GraalVM 的 AOT 工具链命令选项提升启动性能，使静态部署和原生镜像场景能更便捷地获得更优的启动速度。

#### AOT 方法性能分析（JEP 515 - 最终版） ####

JEP 515 支持在 AOT 编译期间进行方法级性能分析以优化决策，通过将方法使用频率纳入编译策略提升 AOT 编译 Java 程序的性能，同时帮助 AOT 引擎更智能地制定内联和优化策略。

#### JFR 协作式采样（JEP 518 - 实验性功能） ####

JEP 518 允许应用程序向 Java Flight Recorder 建议安全采样点。协同采样通过将采样与应用程序定义的安全点对齐来降低开销，在最大限度减少对性能敏感代码干扰的同时提高准确性。

#### 紧凑对象头（JEP 519 - 预览版） ####

JEP 519 在 64 位架构上减小了对象头大小。该变更通过在对象头中对同步和标识数据采用紧凑布局，从而缩减了 Java 对象的内存占用。这一改进尤其有利于大型堆和微服务环境。

显著减少了64位系统上每个对象的内存开销。假设你的应用有数百万个小型对象（如订单项、DTO），这个优化可能直接带来10%以上的堆内存节省，并因更好的缓存利用率而提升速度。

#### JFR 方法计时与追踪（JEP 520 - 实验性） ####

JEP 520 通过详细的逐方法计时和调用追踪信息增强了 JFR 。我们开发者能更精细地查看哪些方法消耗最多时间，从而实现更深入的分析和更好的瓶颈识别。

#### 分代式 Shenandoah（JEP 521 - 最终版） ####

JEP 521 为 Shenandoah 垃圾收集器增加了分代支持。分代式 GC 通过将年轻代收集与长期存活对象分开优化，从而提升了吞吐量并改善了暂停时间表现。该特性使 Shenandoah 在效率方面与 G1 和 ZGC 等收集器看齐。

低暂停时间的GC现在对年轻代和老年代采用不同优化策略，在保持“停顿时间短”优点的同时，提升了整体吞吐量和内存效率。对于需要高响应性的服务（如交易系统）是不错的选择。

### 开发者须知 ###

Java 25 中的许多特性仍处于预览或孵化阶段。要编译和运行使用这些特性的代码，必须启用它们。

- `--enable-preview`：所有预览特性必须启用，否则会出现编译错误。
- `--add-modules <name>`：孵化模块必须添加，例如我们之前使用的 `jdk.incubator.vector`。
- `--release 25`：编译时建议指定，以针对 Java 25 平台。

> 注意：预览版和孵化器 API 可能在后续版本中变更或移除。我们应避免在生产环境使用这些特性，或持续关注官方 JDK 文档和发行说明以获取错误修复和问题预警。基于此，使用这些特性时需要：

```bash
# 编译时需要执行：
javac --enable-preview --release 25 --add-modules jdk.incubator.vector MyClass.java

# 运行时需要执行：
java --enable-preview --add-modules jdk.incubator.vector MyApp
```

这种方式可以提示 Java 虚拟机 (JVM) 在编译期和运行时允许使用这些特性。
