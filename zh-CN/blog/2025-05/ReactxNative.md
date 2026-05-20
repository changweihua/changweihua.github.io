---
lastUpdated: true
commentabled: true
recommended: true
title: React Native 与 原生模块通信的核心机制与原理
description: React Native 与 原生模块通信的核心机制与原理
date: 2025-05-28 11:30:00 
pageClass: blog-page-class
---

# React Native 与 原生模块通信的核心机制与原理 #

React Native 提供了一个跨平台的开发框架，允许开发者使用 JavaScript 编写应用逻辑，同时调用原生端的功能（如摄像头、文件系统等）。原生模块通信是 React Native 核心的一部分，它使得 JavaScript 代码与 Android、iOS 原生端能够进行无缝交互。这个通信过程依赖于以下几种机制：

- `Bridge`（桥接机制）
- `Turbo Modules`（新架构）
- `JavaScript Interface`（JSI）
- `异步和同步通信机制`

## 一.传统架构：Bridge（桥接机制) ##

### Bridge 的概念 ###

`Bridge` 是 `React Native` 最初的通信机制，负责将 JavaScript 与原生端代码连接起来。`JavaScript` 和 `原生代码` 之间的交互是通过 `异步消息队列` 实现的。Bridge 主要由两个线程组成：

- **JavaScript 线程**：负责处理业务逻辑、UI 渲染和用户交互。
- **原生端线程**：负责处理原生的 UI 操作和底层功能（例如摄像头、位置服务等）。

### 数据传输过程 ###

- **JS 调用原生方法**：`JavaScript` 通过 `NativeModules` 访问原生模块。每当 JS 调用原生模块时，数据会被序列化（`JSON`）并通过 `Bridge` 发送到原生端。
- **序列化与反序列化**：JS 中的数据需要通过 `序列化` 转换为 `JSON` 格式，以便通过桥接机制传递给原生端。原生端接收到数据后，需要 `反序列化` 才能进行操作。
- **原生端执行方法**：原生模块执行对应的功能（例如调用摄像头、读取文件等）。执行结果（包括成功信息或错误信息）会被传回给 JavaScript 端。
- **返回结果**：结果通过 `Bridge` 返回给 `JavaScript`，通常是通过异步回调（如 `Promise` ）的方式返回。

### Bridge 的限制 ###

- **性能瓶颈**：由于需要 `序列化和反序列化` 大量数据，Bridge 机制在 `数据量大` 或 `调用频繁` 时可能会造成性能瓶颈。
- **异步通信**：原生端与 JavaScript 之间的通信是 `异步` 的，这意味着调用的返回结果可能会有 `延迟`，影响响应速度。

## 二.Turbo Modules：提升性能的新架构 ##

Turbo Modules 是 React Native 引入的新模块系统，旨在解决传统 Bridge 机制中的性能瓶颈，特别是在调用频繁的场景下。

### Turbo Modules 与 Bridge 的区别 ###

- **无桥接通信**：`Turbo Modules` 使用 `JavaScript Interface（JSI）` ，不再依赖传统的桥接机制。JSI 允许 JavaScript `直接` 通过 `内存引用` 访问原生模块，无需进行序列化和反序列化操作，从而大幅减少性能开销。
- **按需加载**：Turbo Modules 支持按需加载，只有在需要时才加载相关模块，避免了不必要的资源消耗。

### Turbo Modules 的核心优势 ###

- **高效的数据传输**：通过 `JSI`，`JavaScript` 与原生端的交互不再依赖 `JSON` 格式的序列化，避免了性能损失。
- **同步和异步调用**：`Turbo Modules` 支持同步和异步调用，开发者可以根据需求选择最适合的方式进行通信。
- **减少延迟**：减少了原生方法调用的延迟，提高了应用响应速度。

### Turbo Modules 的工作流程 ###

- JavaScript 线程通过 `JSI` 直接调用原生模块的 `C++` 实现，无需经过 `Bridge`。
- 通过 `JSI`，数据可以在 `JavaScript` 和 `原生端` 之间直接传递，减少了序列化和反序列化的开销。
- 原生端执行方法后，结果会通过 `JSI` 返回给 `JavaScript`，支持同步或异步返回。

## 三. JavaScript Interface（JSI） ##

`JSI` 是 `Turbo Modules 的核心`，它是一种跨语言的接口，允许 JavaScript 直接与原生代码（C++）交互。

### JSI 的作用 ###

- **直接内存访问**：`JSI` 提供了一个机制，让 `JavaScript` 代码可以直接通过内存访问原生端的 `C++` 对象，而不需要进行 `JSON 序列化`。这样，数据传输的开销被大幅减少。
- **高效的调用**：`JSI` 实现了 `JavaScript` 与原生代码的高效通信，使得 `JavaScript` 可以调用原生端的函数，并且不受性能限制。

### JSI 的底层实现 ###

- `JSI` 是通过 `C++` 实现的，`C++` 代码为 `JavaScript` 提供了一个运行时接口（类似于 `JNI` 在 `Android` 中的作用），使得 `JavaScript` 可以直接访问原生端对象。
- 通过 `JSI`，`JavaScript` 不再需要通过桥接来传递数据，而是通过 `直接操作内存中的数据结构`，极大地提升了性能。

## 四. 异步与同步通信机制 ##

React Native 的原生模块通信支持两种主要的通信方式：`异步` 和 `同步`。

### 异步通信 ###

- 在传统的 `Bridge` 和 `Turbo Modules` 中，通信大多数是异步的。JavaScript 会通过 `Promise` 或回调函数等待原生端的响应。
- 异步通信适用于 `UI` 更新等不需要立即响应的场景，因为它不会阻塞主线程。

### 同步通信 ###

• `Turbo Modules` 支持同步调用，`JavaScript` 可以在调用时同步等待原生端返回结果。
• 同步通信适用于一些需要 `即时返回结果` 的操作，如获取设备信息、设置配置等。
