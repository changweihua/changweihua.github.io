---
lastUpdated: true
commentabled: true
recommended: true
title: C# Params Collections 详解
description: 比 params T[] 更强大的新语法
date: 2025-12-26 10:00:00 
pageClass: blog-page-class
cover: /covers/dotnet.svg
---

## 简介 ##

`Params Collections` 是 `C# 12` 中引入的新特性，它扩展了传统的 `params` 关键字功能，使其不仅支持数组，还能支持各种集合类型。这个特性使得方法能够接受可变数量的参数，并且这些参数可以自动转换为指定的集合类型。

**关键特点**：

- 可变参数：调用者可以传递任意数量的参数（包括零个）。

- 类型安全：`params` 参数是强类型的，编译器确保参数类型匹配。

- 单一 `params` 参数：一个方法只能有一个 `params` 参数，且必须是最后一个参数。

- `C# 12` 扩展：支持非数组集合类型（如 `List`, `Span`），适合高性能或特定场景。

## 核心特性 ##

### 支持任意集合类型 ###

- 可指定 `List`、`Span`、`IReadOnlyCollection` 等作为参数类型

```csharp
public void LogEntries(params List messages) { ... }
```

### 自动集合构造 ###

- 编译器自动将离散参数转换为目标集合类型实例

```csharp
AnalyzeNumbers(10, 20, 30); 
// 等效于：
AnalyzeNumbers(new List { 10, 20, 30 });
```

### 与现有 params 兼容 ###

- 传统 `params T[]` 仍然有效

- 新语法不会破坏已有代码

## 传统 params 关键字 ##

在 `C# 12` 之前，`params` 关键字只能用于数组：

```csharp
// 传统的 params 数组用法
public void ProcessNumbers(params int[] numbers)
{
    foreach (var number in numbers)
    {
        Console.WriteLine(number);
    }
}

// 调用方式
ProcessNumbers(1, 2, 3, 4, 5);
```

## Params Collections 的新特性 ##

`C# 12` 扩展了 `params` 关键字，使其能够用于任何集合类型，只要该类型满足特定条件。

### 基本语法 ###

```csharp
// 使用 params 与集合类型
public void ProcessNumbers(params List numbers)
{
    foreach (var number in numbers)
    {
        Console.WriteLine(number);
    }
}

// 调用方式不变
ProcessNumbers(1, 2, 3, 4, 5);
```

## 支持的条件 ##

要使集合类型能够与 params 关键字一起使用，必须满足以下条件之一：

- 集合类型必须有一个无参数的构造函数

- 集合类型必须有一个 `Add` 方法，用于添加元素

- 集合类型必须实现 `IEnumerable`

### 自定义集合与 params ###

```csharp
// 自定义集合类
public class NumberCollection : IEnumerable
{
    private readonly List _numbers = new();
    
    public void Add(int number) => _numbers.Add(number);
    
    public IEnumerator GetEnumerator() => _numbers.GetEnumerator();
    
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

// 使用自定义集合作为 params 参数
public void ProcessNumbers(params NumberCollection numbers)
{
    foreach (var number in numbers)
    {
        Console.WriteLine(number);
    }
}

// 调用
ProcessNumbers(1, 2, 3, 4, 5);
```

## 实际应用示例 ##

### 与 Span 和 ReadOnlySpan 结合使用 ###

```csharp
// 使用 Span 作为 params 参数
public void ProcessData(params Span data)
{
    for (int i = 0; i < data.Length; i++)
    {
        data[i] *= 2;
    }
}

// 调用
int[] array = [1, 2, 3, 4, 5];
ProcessData(array);
Console.WriteLine(string.Join(&#34;, &#34;, array)); // 输出: 2, 4, 6, 8, 10
```

### 与 Immutable Collections 结合使用 ###

```csharp
using System.Collections.Immutable;

// 使用不可变集合作为 params 参数
public void ProcessItems(params ImmutableArray items)
{
    foreach (var item in items)
    {
        Console.WriteLine(item);
    }
}

// 调用
ProcessItems(&#34;apple&#34;, &#34;banana&#34;, &#34;cherry&#34;);
```

## 高级用法 ##

### 泛型方法与 params 集合 ###

```csharp
// 泛型方法中使用 params 集合
public void ProcessCollection(params List collection)
    where T : notnull
{
    foreach (var item in collection)
    {
        Console.WriteLine(item);
    }
}

// 调用
ProcessCollection(&#34;a&#34;, &#34;b&#34;, &#34;c&#34;); // 字符串列表
ProcessCollection(1, 2, 3);       // 整数列表
```

### 与模式匹配结合使用 ###

```csharp
// 使用模式匹配处理 params 集合
public void HandleValues(params int[] values)
{
    switch (values)
    {
        case [var first, .. var middle, var last]:
            Console.WriteLine($&#34;首: {first}, 尾: {last}, 中间有 {middle.Length} 个元素&#34;);
            break;
        case [var single]:
            Console.WriteLine($&#34;单个值: {single}&#34;);
            break;
        case []:
            Console.WriteLine(&#34;空集合&#34;);
            break;
    }
}

// 调用
HandleValues(1, 2, 3, 4, 5); // 输出: 首: 1, 尾: 5, 中间有 3 个元素
HandleValues(42);            // 输出: 单个值: 42
HandleValues();              // 输出: 空集合
```

### 与接口结合使用 ###

```csharp
// 使用接口作为 params 参数
public void ProcessEnumerables(params IEnumerable[] collections)
{
    foreach (var collection in collections)
    {
        int sum = collection.Sum();
        Console.WriteLine($&#34;集合总和: {sum}&#34;);
    }
}

// 调用
ProcessEnumerables(
    new List { 1, 2, 3 },
    new int[] { 4, 5, 6 },
    new HashSet { 7, 8, 9 }
);
```

### 高性能求和（使用 `Span` ） ###

```csharp
public decimal Average(params Span numbers)
{
    if (numbers.Length == 0) return 0;
    decimal sum = 0;
    foreach (var num in numbers)
    {
        sum += num;
    }
    return sum / numbers.Length;
}

Console.WriteLine(Average(1.5m, 2.5m, 3.5m)); // 输出: 2.5
```

- 使用 `Span` 避免数组分配，提高性能。

- 适合处理大量数值计算。

## 适用场景 ##

- 简化方法调用：允许调用者传递任意数量的参数，减少重载需求。

- 处理集合数据：适合处理列表、数组或序列，例如日志记录、字符串连接、数学计算。

- 高性能场景（`C# 12+`）：使用 `Span` 或 `ReadOnlySpan` 减少堆分配，优化性能。

- 与本机代码交互：`Span` 类型的 `params` 参数适合传递连续内存块。

- 灵活接口设计：为方法提供通用接口，支持不同数量的输入。
