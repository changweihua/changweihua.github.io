---
lastUpdated: true
commentabled: true
recommended: true
title: 深入解读 onEffectCleanup 和 onWatcherCleanup 函数
description: Vue 3.5 新特性
date: 2025-12-24 11:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 前言 ##

在前端开发的世界中，Vue.js 一直以其响应式系统和组件化架构而闻名。随着 Vue 3.5 的发布，这个流行的框架再次为开发者带来了一系列令人兴奋的新特性。其中，`onEffectCleanup` 和 `onWatcherCleanup` 函数的引入，为管理副作用和清理资源提供了更精细的控制，有了这个函数后你就不需要在组件的beforeUnmount钩子函数去统一清理一些timer了。

本文将深入探讨这两个函数的用途、实现方式以及它们如何帮助我们编写更高效、更清洁的代码。

## 理解副作用和资源清理 ##

在现代前端应用中，副作用（`side effects`）是指那些影响外部状态的操作，如数据获取、订阅或手动更改外部库的状态。资源清理则是指在组件卸载或不再需要时释放这些副作用所占用的资源。Vue 3 通过其响应式系统和生命周期钩子，已经提供了副作用管理和资源清理的基本支持。然而，`onEffectCleanup` 和 `onWatcherCleanup` 函数的引入，进一步增强了这一能力。

## onEffectCleanup 函数 ##

`onEffectCleanup` 函数是 Vue 3.5 中 `reactive`、`ref` 和 `computed` 等响应式 API 的一个新选项。它允许开发者在响应式效果（effect）被清理前执行自定义的清理逻辑。这在处理需要手动释放的资源时非常有用，例如，取消未完成的网络请求或清除定时器。

```javascript
import { watchEffect, ref } from "vue";
import { onEffectCleanup } from "@vue/reactivity";

const flag = ref(true);
watchEffect(() => {
  if (flag.value) {
    const timer = setInterval(() => {
      // 做一些事情
      console.log("do something");
    }, 200);
    onEffectCleanup(() => {
      clearInterval(timer);
    });
  }
});
```

在上面的代码中，我们创建了一个响应式的 `timer` 引用，并使用 `onEffectCleanup` 注册了一个清理函数，该函数会在 `effect` 被清理时清除定时器。

## onWatcherCleanup 函数 ##

与 `onEffectCleanup` 类似，`onWatcherCleanup` 函数用于 `watch` 函数，允许开发者在 `watcher` 被停止时执行清理操作。这在处理复杂的观察者逻辑时特别有用，例如，当你需要在 `watcher` 停止时取消订阅或清理与 `watcher` 相关的资源时。

```javascript
import { watch, ref, onWatcherCleanup } from "vue";

watch(flag, () => {
  const timer = setInterval(() => {
    // 做一些事情
    console.log("do something");
  }, 200);
  onWatcherCleanup(() => {
    console.log("清理定时器");
    clearInterval(timer);
  });
});
```

## 实际应用场景 ##

`onEffectCleanup` 和 `onWatcherCleanup` 的引入，为 Vue 应用的资源管理和内存优化提供了更多的灵活性。例如，在处理复杂的表单或组件时，我们可能需要在组件销毁时清理与表单字段相关的事件监听器或外部订阅。这两个函数使得我们可以在正确的时机执行这些清理操作，避免内存泄漏和其他资源相关问题。

## 结论 ##

Vue 3.5 的 `onEffectCleanup` 和 `onWatcherCleanup` 函数是 Vue 响应式系统的重要补充，它们为开发者提供了更细粒度的控制，以管理副作用和资源清理。这些新特性不仅提高了应用的性能和稳定性，还使得代码更加清晰和易于维护。随着 Vue 生态的不断发展，我们可以期待更多的创新和改进，以支持现代前端开发的需求。

通过深入了解这些新特性，开发者可以更好地利用 Vue 提供的工具，构建高效、可靠和易于维护的前端应用。随着 Vue 3.5 的广泛应用，我们有理由相信，这些新特性将成为构建现代 Web 应用的不可或缺的一部分。
