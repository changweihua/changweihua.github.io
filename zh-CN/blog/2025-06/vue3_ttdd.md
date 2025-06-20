---
lastUpdated: true
commentabled: true
recommended: true
title: 如何在 Vue3 中优雅地防止按钮重复点击
description: 如何在 Vue3 中优雅地防止按钮重复点击
date: 2025-06-20 15:35:00 
pageClass: blog-page-class
---

# 如何在 Vue3 中优雅地防止按钮重复点击 #

## 前言 ##

在前端开发中，按钮重复点击问题一直是个让人头疼的问题。在请求未完成时，用户可能因为网络延迟等原因多次点击按钮，导致请求被多次发送。
这不仅浪费了服务器资源，还可能引发业务逻辑错误，尤其是在涉及数据提交或入库操作时。

本文将介绍如何在 Vue3 中优雅地解决这个问题。

## 业务背景 ##

在实际的业务场景中，点击按钮后通常会触发一个网络请求。如果请求尚未完成，用户可能再次点击按钮，从而触发新的请求。

这种情况可能导致接口被多次调用，轻则浪费服务器资源，重则导致业务逻辑错误，比如重复提交表单或重复入库。

传统的解决方案包括使用防抖函数，但这种方法并不能完全解决问题，因为接口响应时间可能超过防抖时间，用户仍然可能在防抖时间后再次点击按钮。

另一种常见的方法是通过在按钮上添加 loading 状态来禁止重复点击，但这种方法需要在每个使用按钮的页面中单独维护 loading 变量，导致代码冗余。

## Vue3 的解决方案 ##

在 Vue3 中，我们可以利用组合式 API 来创建自定义 Hook，从而优雅地解决按钮重复点击问题。

### 创建自定义 Hook ###

首先，我们创建一个自定义 Hook `useAsyncButton`，用于管理按钮的 loading 状态和请求逻辑。

```ts
// useAsyncButton.ts
import { ref, useCallback } from 'vue';

export function useAsyncButton(requestFn, options = {}) {
  const loading = ref(false);

  const run = useCallback(async (...args) => {
    if (loading.value) return;

    try {
      loading.value = true;
      const data = await requestFn(...args);
      options.onSuccess?.(data);
      return data;
    } catch (error) {
      options.onError?.(error);
      throw error;
    } finally {
      loading.value = false;
    }
  }, [loading, requestFn, options]);

  return {
    loading,
    run
  };
}
```

### 在组件中使用 ###

在 Vue3 的组合式 API 中使用这个自定义 Hook。

```vue
<template>
  <button
    @click="handleClick"
    :disabled="loading"
  >
    {{ loading ? '加载中...' : '点击请求' }}
  </button>
</template>

<script>
import { useAsyncButton } from './useAsyncButton';

export default {
  setup() {
    const fetchApi = async () => {
      const response = await fetch('your-api-endpoint');
      return await response.json();
    };

    const { loading, run } = useAsyncButton(fetchApi, {
      onSuccess: (data) => {
        console.log('请求成功：', data);
      },
      onError: (error) => {
        console.error('请求失败：', error);
      }
    });

    const handleClick = () => {
      run();
    };

    return {
      loading,
      handleClick
    };
  }
};
</script>
```

### 带冷却时间的按钮 ###

为了进一步增强功能，我们可以在自定义 Hook 中添加冷却时间（cooldown）功能。这在某些场景下非常有用，比如发送验证码按钮需要等待一定时间才能再次点击。

```ts
// useAsyncButton.ts
import { ref, useCallback } from 'vue';

export function useAsyncButton(requestFn, options = {}) {
  const loading = ref(false);
  const cooldownRemaining = ref(0);
  const timerRef = ref(null);

  const startCooldown = useCallback(() => {
    if (!options.cooldown) return;

    cooldownRemaining.value = options.cooldown / 1000;
    const startTime = Date.now();

    timerRef.value = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.ceil((options.cooldown - elapsed) / 1000);

      if (remaining <= 0) {
        clearInterval(timerRef.value);
        cooldownRemaining.value = 0;
      } else {
        cooldownRemaining.value = remaining;
      }
    }, 1000);
  }, [options.cooldown]);

  const run = useCallback(async (...args) => {
    if (loading.value || cooldownRemaining.value > 0) return;

    try {
      loading.value = true;
      const data = await requestFn(...args);
      options.onSuccess?.(data);
      startCooldown();
      return data;
    } catch (error) {
      options.onError?.(error);
      throw error;
    } finally {
      loading.value = false;
    }
  }, [loading, cooldownRemaining, requestFn, options, startCooldown]);

  return {
    loading,
    cooldownRemaining,
    run,
    disabled: loading || cooldownRemaining.value > 0
  };
}
```

### 使用示例 ###

```vue
<template>
  <button
    @click="handleClick"
    :disabled="disabled"
  >
    {{ loading ? '发送中...' : cooldownRemaining > 0 ? `${cooldownRemaining}秒后重试` : '发送验证码' }}
  </button>
</template>

<script>
import { useAsyncButton } from './useAsyncButton';

export default {
  setup() {
    const sendCode = async () => {
      const response = await fetch('/api/send-code');
      return await response.json();
    };

    const { loading, cooldownRemaining, disabled, run } = useAsyncButton(
      sendCode,
      {
        cooldown: 60000, // 60秒冷却时间
        onSuccess: () => {
          console.log('验证码发送成功');
        },
        onError: (error) => {
          console.error('验证码发送失败', error);
        }
      }
    );

    const handleClick = () => {
      run();
    };

    return {
      loading,
      cooldownRemaining,
      disabled,
      handleClick
    };
  }
};
</script>
```

## 总结 ##

通过使用 Vue3 的组合式 API 创建自定义 Hook，我们能够优雅地解决按钮重复点击问题。这种方式不仅能够统一管理请求状态，还能通过简单的配置实现冷却时间功能，提升用户体验。
