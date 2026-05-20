---
lastUpdated: true
commentabled: true
recommended: true
title:  前端通用的存储方案
description: 前端通用的存储方案
date: 2024-10-28 14:18:00
pageClass: blog-page-class
---

# 前端通用的存储方案 #

随着Web应用的发展，存储用户数据的需求变得越来越重要。现代浏览器提供了多种客户端存储方案，包括 `localStorage`, `sessionStorage`, `Cookies`, 已经被废弃的 `Web SQL`，以及功能强大的 `IndexedDB`。


## localStorage：简单的键值对存储 ##

`localStorage` 是一种允许网站在用户的浏览器中存储数据的技术，它提供了持久化的存储能力，除非用户主动清除浏览器缓存，否则数据不会丢失。`localStorage` 以字符串的形式存储数据，每个域名下大约有5MB的存储空间。

### 基本操作 ###

- 保存数据：`localStorage.setItem('key', 'value')`
- 读取数据：`localStorage.getItem('key')`
- 删除数据：`localStorage.removeItem('key')`
- 清空所有数据：`localStorage.clear()`

### 注意 ###

`localStorage` 的数据是基于域名（即协议 + 域名 + 端口）进行隔离的。这意味着以下几点：

- 相同域名：如果两个页面属于同一个域名，它们可以访问相同的 `localStorage` 数据。
- 不同子域名：如果两个页面属于同一个顶级域名的不同子域名（例如 `a.example.com` 和 `b.example.com`），它们不能直接访问对方的 `localStorage` 数据。不过，可以通过设置文档的 `document.domain` 属性来实现跨子域共享 `localStorage`。
- 不同协议：如果两个页面的协议不同（例如 `http://example.com` 和 `https://example.com`），它们被视为不同的域名，不能共享 `localStorage` 数据。
- 不同端口：如果两个页面的端口不同（例如 `http://example.com:8080` 和 `http://example.com:8081`），它们也被视为不同的域名，不能共享 `localStorage` 数据。

## sessionStorage：会话级别的存储 ##

`sessionStorage` 与 `localStorage` 类似，也是用于存储字符串形式的数据。不同之处在于，`sessionStorage` 存储的数据仅在当前会话期间可用，当浏览器窗口关闭时，数据会被清除。

## Cookies ##

`Cookies`是不受前端掌控的，由后端控制，它是一种在用户浏览器上存储信息的方法，主要用于跟踪用户活动和保持用户登录状态等目的。与 `localStorage` 和 `sessionStorage` 不同，它是由服务器发送给用户的，通常包含在 `HTTP` 响应头中。用户浏览器会将这些 `Cookies` 保存起来，并在后续请求同一服务器时自动将其包含在 `HTTP` 请求头中返回给服务器。

### 特点 ###

- 自动发送：浏览器会自动将相关 `Cookies` 发送到对应的服务器，无需额外编程。
- 大小限制：每个域名下的 `Cookies` 总量有限制，通常是 `4KB` 左右。
- 安全性：可以通过设置 `HttpOnly` 标志来防止 `JavaScript` 访问 `Cookies`，从而减少 `XSS` 攻击的风险。
- 过期时间：可以通过设置 `Expires` 或 `Max-Age` 属性来控制 `Cookie` 的有效期。
- 路径和域：可以设置 `Path` 和 `Domain` 属性来限制 `Cookie` 的适用范围。

## IndexedDB：高级的本地数据库 ##

`IndexedDB` 是是浏览器本地的数据库，支持事务处理、异步操作等特性，支持使用js编写逻辑来创建，适合存储大量结构化数据，并提供搜索功能。与 `localStorage` 和 `sessionStorage` 相比，`IndexedDB` 的存储量更大，没有明确的大小限制，也是永久存储的。

## 总结 ##

- Cookie：容量小(大约4KB)，只能存储字符串类型的数据，发送请求时浏览器会自动携带对应的 Cookie 无法干预此操作。
- IndexDB：容量大(当前可用磁盘空间的50%)，可以存储任意类型的数据，存储又可以分为临时存储(默认)和持久存储，但是老版本浏览器不兼容。
  - 临时存储：默认行为，超过存储容量会采用 LRU 算法自动清空最近最少使用的源。
  - 持久存储：尚在实验阶段，通过 navigator.storage.persist() 请求本地数据存储的权限返回 Promise 对象状态值为布尔值表示开启成功或失败。
  - 全局存储限制：当前可用磁盘空间的 50％。
  - 组存储限制：为全局限制的 20％，但它至少有 10 MB，最大为 2GB。相同 eTLD+1 的域被视为一个组，每个具体的子域或域被视为一个源。
- WebStorage：包含两种类型：localStorage 和 sessionStorage，存储容量(大约5MB)。
  - localStorage：只能存储字符串类型的数据，浏览器兼容性好。
  - sessionStorage：只能存储字符串类型的数据，只在当前会话中有效，页面关闭数据清除。

> eTLD+1域：e表示可用的，TLD 表示顶级域名，TLD+1 表示顶级域名和直接上级的域名。
> 组：所有具有相同 eTLD+1 的域被视为一个组。在这个组中，所有源共享一个存储配额，这个配额是全局存储限制的20%。
> 源：每个具体的子域或域被视为一个源。例如：mozilla.org、www.mozilla.org 和 joe.blogs.mozilla.org 都是不同的源但是他们具有相同的 eTLD+1域 所以共享一个存储配额。

