---
lastUpdated: true
commentabled: true
recommended: true
title: C# 中 Marshal类：非托管代码交互的全能工具
description: C# 中 Marshal类：非托管代码交互的全能工具
date: 2025-05-15 09:03:00
pageClass: blog-page-class
---

# C# 中 Marshal类：非托管代码交互的全能工具 #

## 前言 ##

C#开发中，我们常常会遇到需要与 *Win32 API、COM组件或非托管DLL* 打交道的场景。此时，`System.Runtime.InteropServices.Marshal` 类就像一座桥梁，连接着 *托管代码（C#）* 与 *非托管代码（如C/C++）*，帮助开发者完成底层操作，如内存分配、类型转换、结构体指针互转等。

本文将带你深入了解 `Marshal` 类的核心方法，通过多个实用代码示例，帮助大家快速上手并掌握这一强大的工具类，提升在跨平台、系统级开发中的实战能力。

## 什么是 Marshal 类？ ##

`Marshal` 类是 .NET 提供的一个静态类，位于 `System.Runtime.InteropServices` 命名空间中，主要用于在 *托管环境* 和 *非托管环境* 之间进行数据交换和资源管理。

### 核心功能包括： ###

- 数据类型的转换
- 非托管内存的分配与释放
- 结构体与指针之间的互相转换
- 获取对象大小及字段偏移量
- COM 对象的操作支持

它在调用 Win32 API、与硬件通信、处理性能敏感任务等方面扮演着关键角色。

## 常用方法详解与代码案例 ##

### 内存分配与释放：`AllocHGlobal` 与 `FreeHGlobal` ###

当你需要向非托管代码传递一块原始内存时，可以使用 `AllocHGlobal` 分配内存，并在使用完毕后通过 `FreeHGlobal` 手动释放。

```C#
IntPtr ptr = Marshal.AllocHGlobal(1024); // 分配1024字节内存
try
{
    // 使用ptr进行非托管操作...
}
finally
{
    Marshal.FreeHGlobal(ptr); // 确保释放内存
}
```

> 建议：务必在 finally 块中释放内存，避免内存泄漏。

### 字符串转换：`StringToHGlobalAnsi` 与 `PtrToStringAnsi` ###

非托管代码中的字符串通常为 `ANSI` 或 `Unicode` 格式，而 `C#` 的字符串是 `Unicode` 编码的，因此需要进行转换。

```C#
// 托管字符串转非托管ANSI字符串
string managedStr = "Hello, World!";
IntPtr ansiPtr = Marshal.StringToHGlobalAnsi(managedStr);
try
{
    // 将ansiPtr传递给非托管函数...
}
finally
{
    Marshal.FreeHGlobal(ansiPtr);
}

// 从非托管ANSI字符串转回C#字符串
IntPtr receivedPtr = ...; // 假设从非托管函数获取指针
string result = Marshal.PtrToStringAnsi(receivedPtr);
```

> 注意：确保正确选择 Ansi / Unicode 转换方法，以匹配目标平台的字符编码。

### 结构体与指针互转：`StructureToPtr` 与 `PtrToStructure` ###

当需要与非托管 DLL 交换复杂数据结构时，常需将 C# 结构体转换为指针，或将接收到的指针还原为结构体。

```C#
[StructLayout(LayoutKind.Sequential)]
public struct Point
{
    public int X;
    public int Y;
}

// C#结构体转指针
Point point = new Point { X = 10, Y = 20 };
IntPtr ptr = Marshal.AllocHGlobal(Marshal.SizeOf<Point>());
Marshal.StructureToPtr(point, ptr, false);
try
{
    // 传递ptr到非托管代码...
}
finally
{
    Marshal.FreeHGlobal(ptr);
}

// 指针转回结构体
IntPtr receivedPtr = ...;
Point receivedPoint = Marshal.PtrToStructure<Point>(receivedPtr);
```

> 注意：结构体必须使用 [StructLayout] 明确布局顺序，确保与非托管端一致。

### 获取类型信息：`SizeOf` 与 `OffsetOf` ###

有时我们需要知道某个结构体在非托管内存中的大小，或者某个字段的偏移量。

```C#
int size = Marshal.SizeOf<Point>(); // 返回8（int占4字节，两个字段）
int yOffset = Marshal.OffsetOf<Point>(nameof(Point.Y)); // 返回4
```

这些信息对于手动构建结构体、内存拷贝非常有用。

## 总结 ##

`Marshal` 类是 C# 开发与非托管世界沟通的"瑞士军刀"，其强大的功能涵盖了从内存管理到结构体转换等多个方面。熟练掌握它可以让你更自如地处理以下任务：

- 调用底层 API 实现系统级控制
- 与外部库进行高效数据交换
- 实现高性能数据处理逻辑

当然，它的强大也意味着更高的责任 —— 使用不当可能导致内存泄漏、程序崩溃甚至安全漏洞。

> TIP：在复杂的非托管交互中，建议结合 P/Invoke、StructLayout、SafeHandle 等机制，构建健壮、易维护的交互层。
