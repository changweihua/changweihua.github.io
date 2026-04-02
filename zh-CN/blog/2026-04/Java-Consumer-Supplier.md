---
lastUpdated: true
commentabled: true
recommended: true
title: Java 中的 Consumer 与 Supplier 接口
description: Java 中的 Consumer 与 Supplier 接口
date: 2026-04-02 08:34:00 
pageClass: blog-page-class
cover: /covers/java.svg
---

## 异同分析 ##

Consumer 和 Supplier 是 Java 8 引入的两个重要函数式接口，位于 `java.util.function` 包中，用于支持函数式编程范式。

### 相同点 ###

- 都是函数式接口（只有一个抽象方法）
- 都位于 `java.util.function` 包中
- 都用于 Lambda 表达式和方法引用
- 都在 Stream API 和 Optional 类中广泛使用

### 不同点 ###

|  特性   |      Consumer |    Supplier  |
| :-----------: | :-----------: | :-----------: |
| 方法签名 | `void accept(T t)` | `T get()` |
| 参数 | 接受一个输入参数 | 无输入参数 |
| 返回值 | 无返回值 | 返回一个值 |
| 主要用途 | 消费数据 | 提供数据 |
| 类比 | 方法中的参数 | 方法中的返回值 |

## 详细分析与使用场景 ##

### Consumer 接口 ###

Consumer 表示接受单个输入参数但不返回结果的操作。

```java
import java.util.function.Consumer;
import java.util.Arrays;
import java.util.List;

public class ConsumerExample {
    public static void main(String[] args) {
        // 基本用法
        Consumer<String> printConsumer = s -> System.out.println(s);
        printConsumer.accept("Hello Consumer!");
        
        // 方法引用方式
        Consumer<String> methodRefConsumer = System.out::println;
        methodRefConsumer.accept("Hello Method Reference!");
        
        // 集合遍历中的应用
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
        names.forEach(printConsumer);
        
        // andThen 方法组合多个 Consumer
        Consumer<String> upperCaseConsumer = s -> System.out.println(s.toUpperCase());
        Consumer<String> decoratedConsumer = s -> System.out.println("*** " + s + " ***");
        
        Consumer<String> combinedConsumer = upperCaseConsumer.andThen(decoratedConsumer);
        combinedConsumer.accept("functional interface");
        
        // 在 Optional 中的使用
        java.util.Optional<String> optional = java.util.Optional.of("Present");
        optional.ifPresent(combinedConsumer);
    }
}
```

Consumer 的使用场景：

- 遍历集合元素并执行操作
- 处理数据并产生副作用（如打印、保存到数据库）
- 在 Optional 中处理可能存在的值
- 组合多个操作形成处理链

### Supplier 接口 ###

Supplier 表示一个供应商，不需要传入参数但返回一个值。

```java
import java.util.function.Supplier;
import java.util.List;
import java.util.Random;
import java.util.stream.Stream;

public class SupplierExample {
    public static void main(String[] args) {
        // 基本用法
        Supplier<String> stringSupplier = () -> "Hello from Supplier!";
        System.out.println(stringSupplier.get());
        
        // 方法引用方式
        Supplier<Double> randomSupplier = Math::random;
        System.out.println("Random number: " + randomSupplier.get());
        
        // 对象工厂
        Supplier<List<String>> listSupplier = () -> java.util.Arrays.asList("A", "B", "C");
        System.out.println("List from supplier: " + listSupplier.get());
        
        // 延迟计算/初始化
        Supplier<ExpensiveObject> expensiveObjectSupplier = () -> {
            System.out.println("Creating expensive object...");
            return new ExpensiveObject();
        };
        
        System.out.println("Supplier created but no object yet...");
        // 只有在调用 get() 时才会创建对象
        ExpensiveObject obj = expensiveObjectSupplier.get();
        
        // 在 Stream 中生成无限流
        Supplier<Integer> randomIntSupplier = () -> new Random().nextInt(100);
        Stream.generate(randomIntSupplier)
              .limit(5)
              .forEach(System.out::println);
              
        // 在 Optional 中作为备选值
        java.util.Optional<String> emptyOptional = java.util.Optional.empty();
        String value = emptyOptional.orElseGet(() -> "Default from supplier");
        System.out.println("Value from empty optional: " + value);
    }
    
    static class ExpensiveObject {
        ExpensiveObject() {
            // 模拟耗时操作
            try { Thread.sleep(1000); } catch (InterruptedException e) {}
        }
    }
}
```

Supplier 的使用场景：

- 延迟初始化或延迟计算
- 提供配置或默认值
- 生成测试数据或模拟对象
- 在 Optional 中提供备选值
- 创建对象工厂
- 实现惰性求值模式

## 实际应用示例 ##

下面是一个结合使用 Consumer 和 Supplier 的示例：

```java
import java.util.function.Consumer;
import java.util.function.Supplier;
import java.util.logging.Logger;

public class CombinedExample {
    private static final Logger logger = Logger.getLogger(CombinedExample.class.getName());
    
    public static void main(String[] args) {
        // 创建一个数据处理器，结合了 Supplier 和 Consumer
        processData(
            () -> { // Supplier - 提供数据
                // 模拟从数据库或API获取数据
                return new String[] {"Data1", "Data2", "Data3"};
            },
            data -> { // Consumer - 处理数据
                for (String item : data) {
                    System.out.println("Processing: " + item);
                }
            },
            error -> { // Consumer - 错误处理
                logger.severe("Error occurred: " + error.getMessage());
            }
        );
    }
    
    public static <T> void processData(Supplier<T> dataSupplier, 
                                      Consumer<T> dataProcessor, 
                                      Consumer<Exception> errorHandler) {
        try {
            T data = dataSupplier.get(); // 从Supplier获取数据
            dataProcessor.accept(data);  // 用Consumer处理数据
        } catch (Exception e) {
            errorHandler.accept(e);      // 用Consumer处理错误
        }
    }
}
```

## 总结 ##

- Consumer 用于表示接受输入并执行操作但不返回结果的函数，常见于需要处理数据并产生副作用的场景
- Supplier 用于表示无需输入但返回结果的函数，常见于延迟计算、提供数据和工厂模式场景
- 两者都是函数式编程中的重要构建块，可以组合使用创建灵活的数据处理管道
- 在 Stream API、Optional 和现代 Java 框架中广泛应用

理解这两个接口的差异和适用场景有助于编写更简洁、更表达力的 Java 代码，特别是在使用 Stream API 和函数式编程范式时。
