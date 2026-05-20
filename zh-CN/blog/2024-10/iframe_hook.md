---
lastUpdated: true
commentabled: true
recommended: true
title:  Vue3嵌套页面与 iframe 页面通信
description: Vue3嵌套页面与 iframe 页面通信
date: 2024-10-18 9:18:00
pageClass: blog-page-class
---

# Vue3嵌套页面与 iframe 页面通信 #

## 概述 ##

本文介绍了如何使用 `useNestedIframe` 和 `useIframePage` 这两个 Vue 3 Hooks，来实现嵌套页面与 iframe 页面之间的通信和缓存管理。`useNestedIframe` 用于嵌套页面，管理与 iframe 的通信，`useIframePage` 则用于 iframe 页面，接收父页面发送的消息并管理缓存。

## 使用场景 ##

父页面与 iframe 通信：父页面需要发送消息给 iframe，并接收其反馈。
缓存数据的管理：在 iframe 内部需要缓存数据并在页面之间切换时恢复这些数据。

## `useNestedIframe` 使用说明 ##

`useNestedIframe` Hook 主要用于嵌套页面，负责管理与 iframe 的通信、监听 iframe 消息、发送初始化信息以及清除缓存数据。

### 参数说明 ###

- iframeRef：iframe 的引用，用于定位 iframe 实例。
- iframeSrc：iframe 的源地址，默认为空字符串。
- config：配置对象，包含以下属性：
  - parentId：父页面标识符。
  - enableCache：是否启用缓存。
- onReceiveMessage：回调函数，处理从 iframe 收到的消息。

### 返回值 ###

- sendMessageToIframe：向 iframe 发送消息的函数。
- isIframeLoaded：指示 iframe 是否加载完成的布尔值。
- clearCacheData：清除 iframe 缓存数据的函数。

### 示例代码 ###

```vue
import { useNestedIframe } from '@/hooks/useIframe';
import { ref } from 'vue';

const iframeRef = ref(null);
const iframeSrc = ref('https://example.com/iframe');

const { sendMessageToIframe, clearCacheData, isIframeLoaded } = useNestedIframe({
    iframeRef,
    iframeSrc,
    config: { parentId: 'tianyi', enableCache: true },
    onReceiveMessage: (event) => {
        console.log('父页面收到来自 iframe 的消息：', event.data);
        // 处理收到的消息
    },
});

// 示例：向 iframe 发送消息
sendMessageToIframe({ type: 'custom', content: 'Hello, iframe!' });

// 示例：清除缓存数据
clearCacheData();

```

## `useIframePage` 使用说明 ##

`useIframePage` Hook 主要用于 iframe 页面，负责接收父页面发送的消息、管理缓存数据并与父页面通信。

### 参数说明 ###

- onReceiveMessage：收到父页面消息时的回调函数。
- cacheData：需要缓存的数据，默认为空对象。

### 返回值 ###

- sendMessageToParent：向父页面发送消息的函数。

### 示例代码 ###

```vue
import { useIframePage } from '@/hooks/useIframe';
import { ref } from 'vue';

const cacheData = ref({ key: 'initialValue' });

const { sendMessageToParent } = useIframePage({
    onReceiveMessage: (data) => {
        console.log(`父级页面传入的数据:${data}`);
    },
    cacheData,
});

// 示例：向父页面发送消息
sendMessageToParent({ type: 'ready' });

```

## 功能描述 ##

### 消息通信 ###

`useNestedIframe` 和 `useIframePage` 通过 `window.postMessage` 实现消息通信。父页面可以使用 `sendMessageToIframe` 发送消息给 iframe，iframe 可以使用 `sendMessageToParent` 向父页面发送消息。

### iframe 加载管理 ###

`useNestedIframe` 提供了 `isIframeLoaded` 属性，可以用于监听 iframe 加载的状态。

### 缓存数据管理 ###

`useIframePage` 提供了缓存管理功能，当 `config.enableCache` 为 `true` 时，`cacheData` 会被保存到 `localStorage`，并在重新加载时恢复。

### 安全性 ###

两个 Hook 都通过 `allowedOrigins` 对消息来源进行校验，以保证只接收来自可信来源的消息。

## 注意事项 ##

- 允许的来源校验：allowedOrigins 用于限定消息的来源，确保通信安全。
- 缓存启用：确保在需要持久化数据时启用缓存功能，以减少数据丢失风险。
- iframe 加载状态：在向 iframe 发送消息之前，应确认其加载完成。

## 适用场景 ##

- 父页面需要控制嵌套 iframe 的行为，例如设置参数或清空缓存。
- iframe 页面需要与父页面同步状态，或在重新加载时恢复数据。

## 完整代码 ##

```vue
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';

/**
 * 嵌套页面使用的 hook，负责管理与 iframe 的通信和缓存
 *
 * @param {Object} options 配置项
 * @param {Object} options.iframeRef iframe 的引用，默认为 null
 * @param {String} options.iframeSrc iframe 的源地址，默认为空字符串
 * @param {Object} options.config 缓存配置，包括父页面标识符和缓存启用标志
 * @returns {Object} 返回一个对象，包含以下属性：
 *  - sendMessageToIframe: 向 iframe 发送消息的函数
 */
export function useNestedIframe({ iframeRef = null, iframeSrc = ref(''), config = { parentId: '', enableCache: false }, } = {}, onReceiveMessage) {
    const targetOrigin = ref('');
    // 设置允许的来源
    const allowedOrigins = computed(() => [targetOrigin.value]);
    const isIframeLoaded = ref(false);

    // 计算 targetOrigin，当 iframeSrc 变化时更新
    watch(iframeSrc, (newSrc) => {
        try {
            const url = new URL(newSrc);
            targetOrigin.value = url.origin;
        } catch (error) {
            console.warn('Invalid iframeSrc:', newSrc);
            targetOrigin.value = '';
        }
    }, { immediate: true });

    // 向 iframe 发送消息
    const sendMessageToIframe = (message) => {
        if (iframeRef?.value?.contentWindow) {
            const messageWithConfig = {
                ...message,
                config
            };
            iframeRef.value.contentWindow.postMessage(messageWithConfig, targetOrigin.value);
        } else {
            console.warn('iframeRef 未定义或 iframe 尚未加载');
        }
    };

    // 处理收到的消息
    const handleMessage = (event) => {
        const { origin, data } = event;
        const isAllowedOrigin = !allowedOrigins.value.length || allowedOrigins.value.includes(origin);
        console.log(allowedOrigins.value, origin, 'isAllowedOriginisAllowedOrigin')
        if (!isAllowedOrigin) {
            console.warn(`收到来自未授权源 ${origin} 的消息，已忽略`);
            return;
        }
        console.log(`收到ifram消息：${data}`)

        if (data.type === 'ready') {
            console.log('收到 iframe ready 消息，发送初始化配置');
            sendMessageToIframe({ type: 'init' });
        }

        onReceiveMessage?.(event);
    };

    // 清除缓存数据
    const clearCacheData = () => {
        sendMessageToIframe({ type: 'clear-cache' });
    };

    // 处理 iframe 加载完成事件
    const handleIframeLoad = () => {
        isIframeLoaded.value = true;
        console.log('iframe 页面已加载');
    };

    // 监听消息事件
    onMounted(() => {
        window.addEventListener('message', handleMessage);
        if (iframeRef?.value) {
            iframeRef.value.addEventListener('load', handleIframeLoad);
        }
    });

    // 组件卸载时移除事件监听
    onUnmounted(() => {
        window.removeEventListener('message', handleMessage);
        if (iframeRef?.value) {
            iframeRef.value.removeEventListener('load', handleIframeLoad);
        }
    });

    return {
        sendMessageToIframe,
        isIframeLoaded,
        clearCacheData
    };
}

/**
 * iframe 页面使用的 hook，负责接收父页面发送的消息和管理缓存
 *
 * @param {Object} options 配置项
 * @param {Function} options.onReceiveMessage 收到消息时的回调函数，默认为 null
 * @returns {Object} 返回一个对象，包含以下属性：
 *  - sendMessageToParent: 向父页面发送消息的函数
 */
export function useIframePage({ onReceiveMessage = null, cacheData = ref({}) } = {}) {
    const config = ref({ parentId: '', enableCache: false });
    const cacheKey = computed(() => `${config.value.parentId}-iframeData`);
    const targetOrigin = ref('');
    // 设置允许的来源
    const allowedOrigins = computed(() => [targetOrigin.value]);
    // 向父窗口发送消息
    const sendMessageToParent = (message) => {
        console.log(allowedOrigins.value)
        if (window.parent) {
            window.parent.postMessage(message, targetOrigin.value); // 发送到父页面
        } else {
            console.warn('没有父窗口可发送消息');
        }
    };

    // 监听 cacheData 的变化并保存到本地
    watch(cacheData, (newData) => {
        if (config.value.enableCache) {
            try {
                localStorage.setItem(cacheKey.value, JSON.stringify(newData));
                console.log('缓存数据已更新');
            } catch (error) {
                console.warn('无法保存缓存数据:', error);
            }
        }
    }, { deep: true });

    // 从缓存中恢复数据
    const restoreCachedData = () => {
        if (config.value.enableCache) {
            const cachedData = localStorage.getItem(cacheKey.value);
            if (cachedData) {
                try {
                    cacheData.value = JSON.parse(cachedData);
                    console.log('缓存数据已恢复');
                } catch (error) {
                    console.warn('缓存数据解析失败:', error);
                }
            }
        }
    };

    // 清除缓存数据
    const clearCacheData = () => {
        localStorage.removeItem(cacheKey.value);
        console.log('缓存数据已清除');
    };

    // 处理收到的消息
    const handleMessage = (event) => {
        const { origin, data } = event;
        const isAllowedOrigin = !allowedOrigins.value.length || allowedOrigins.value.includes(origin);
        console.log(allowedOrigins.value, origin, 'isAllowedOriginisAllowedOrigin')
        if (!isAllowedOrigin) {
            console.warn(`收到来自未授权源 ${origin} 的消息，已忽略`);
            return;
        }
        console.log(`收到父级${config.value.parentId}消息：${data}`)
        if (data.config) {
            config.value = data.config;
        }

        if (data.type === 'init') {
            console.log('收到初始化消息，恢复缓存数据');
            restoreCachedData();
        }

        if (data.type === 'clear-cache') {
            console.log('收到清除缓存消息');
            clearCacheData();
        }

        onReceiveMessage?.(event);
    };
    const setTargetOrigin = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const originFromParams = urlParams.get('parentOrigin');
        if (originFromParams) {
            targetOrigin.value = decodeURIComponent(originFromParams);
            return
        }
        // 尝试从 document.referrer 获取
        try {
            const referrerUrl = new URL(document.referrer);
            targetOrigin.value = referrerUrl.origin;

        } catch (error) {
            console.warn('无法获取父页面的 origin');
            return '*'; // 或者根据需求设置默认值
        }
    };

    // 监听消息事件
    onMounted(() => {
        window.addEventListener('message', handleMessage);
        setTargetOrigin()
        sendMessageToParent({ type: 'ready' });
    });

    // 组件卸载时移除事件监听
    onUnmounted(() => {
        window.removeEventListener('message', handleMessage);
    });

    return {
        sendMessageToParent,
    };
}
```
