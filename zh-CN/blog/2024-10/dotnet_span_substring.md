---
lastUpdated: true
commentabled: true
recommended: true
title:  .NET 性能 Span 与 Substring 正确使用方法
description: .NET 性能 Span 与 Substring 正确使用方法
date: 2024-10-14 09:18:00
pageClass: blog-page-class
---

# .NET 性能 Span 与 Substring 正确使用方法 #

## 简介 ##

在任何应用程序中高效地处理字符串都是至关重要的，尤其是在处理大数据集或需要性能敏感操作时。

尽管传统的 Substring 方法多年来一直是 .NET 的常用方法，但 Span提供了一种更高效的方式来管理字符串，避免了不必要的内存分配。

本文将探讨如何利用 Span和 Substring 来优化 .NET 中的字符串操作任务。

## 了解 Span ##

Span是在 .NET Core 2.1 和 C# 7.2 中引入的一种高性能类型，专为在无需复制的情况下处理内存切片的场景而设计。

与数组或列表不同，Span是一种仅限于栈的类型，提供了一种安全且高效的方式来访问和操作任意内存的连续区域。

## Span的关键特性 ##

**内存效率**：Span在创建切片时不分配新内存，比传统方法更节省内存。

**仅限于栈**：Span在超出作用域时自动释放，避免了堆内存分配。

**安全且快速**：Span提供与数组类似的边界检查，确保了安全性，同时保持了高性能，通常可与不安全代码相媲美。

## 在字符串中使用 Span ##

在 .NET 中，字符串可以通过 Span轻松切片，这在解析或处理大型字符串时特别有用。

```c#
string input = "Hello, .NET!";  
ReadOnlySpan<char> span = input.AsSpan();  
ReadOnlySpan<char> slice = span.Slice(7, 4); // ".NET"  
Console.WriteLine(slice.ToString()); // 输出: .NET  
```

## 何时使用 Span? ##

**大型字符串**：当处理大型字符串并需要避免分配时。

**高性能应用**：在游戏开发、实时系统或数据处理等每微秒都至关重要的场景中。

**内存受限环境**：在内存有限的平台上，Span可以帮助减少应用的内存占用。

## 了解 Substring ##

Substring 是提取字符串部分的传统方法，使用简单，并且已经在 .NET 中存在多年。

```c#
string example = "Hello, .NET!";  
string substring = example.Substring(7, 4); // ".NET"  
Console.WriteLine(substring); // 输出: .NET
```

然而，Substring 的一个主要限制是它总是创建一个新字符串，在处理大型或大量字符串时可能效率不高。

## 选择 Span与 Substring ##

当需要一个独立于原始字符串的新字符串时，使用 Substring。

当需要在不分配新内存的情况下对字符串的一部分进行操作时，使用 Span。

## 性能优势 ##

使用 Span而非 Substring 的主要优势之一是性能。Substring 会创建一个新字符串，这涉及到内存分配和复制。

而 Span只是引用原始字符串的一部分，不会进行复制。

以下是一个简单的基准测试示例，使用 BenchmarkDotNet 来比较 Span和 Substring 在提取字符串部分时的性能。

```c#
using BenchmarkDotNet.Attributes;  
namespace SpanVsSubString  
{  
    [MemoryDiagnoser]  
    public class StringManipulationBenchmark  
    {  
        private const string Data = "This is a sample string for demonstrating Span and Substring performance in .NET.";  
  
        [Benchmark]  
        public string UsingSubstring()  
        {  
            return Data.Substring(10, 6);  
        }  
          
        [Benchmark]  
        public ReadOnlySpan<char> UsingSpan()  
        {  
            return Data.AsSpan().Slice(10, 6);  
        }  
          
        [Benchmark]  
        public string SpanToString()  
        {  
            return Data.AsSpan().Slice(10, 6).ToString();  
        }  
    }  
}  
```

### 解释 ###

- **UsingSubstring**：此方法使用 Substring 方法提取字符串的一部分。
- **UsingSpan**：此方法使用 Span创建字符串的切片。
- **SpanToString**：此方法使用 Span，对字符串切片，然后使用 ToString 方法将其转换回字符串。
要运行基准测试，只需执行该程序。BenchmarkDotNet 将处理基准测试的执行并为您提供详细的性能指标。

### BenchmarkDotNet 结果分析 ###

- **UsingSubstring**：分配了内存并且耗时较长，因为它创建了一个新字符串。
- **UsingSpan**：非常快且不分配内存，因为它只是引用了原始字符串的一部分。
- **SpanToString**：将 span 转换回字符串，因此在内存分配方面与 UsingSubstring 的性能相似。

此基准测试展示了在不需要创建新字符串的场景中使用 Span的显著性能优势，突显了它在避免内存分配方面的高效性。

## 总结 ##

Span提供了一种强大的替代 Substring 的方法，使您能够在不进行不必要内存分配的情况下高效地操作字符串。
无论是从事性能关键的应用开发，还是仅仅希望优化代码，理解何时以及如何使用 Span都可以显著提升的 .NET 开发技能。
通过在性能和内存效率至关重要的场景中采用 Span，可以编写更快、更高效的 .NET 应用，充分利用现代硬件的能力。
