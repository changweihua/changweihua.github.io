import { ref, onMounted, onUnmounted, computed, watch } from "vue";

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
export function useNestedIframe(
  {
    iframeRef = null,
    iframeSrc = ref(""),
    config = { parentId: "", enableCache: false },
  } = {},
  onReceiveMessage
) {
  const targetOrigin = ref("");
  // 设置允许的来源
  const allowedOrigins = computed(() => [targetOrigin.value]);
  const isIframeLoaded = ref(false);

  // 计算 targetOrigin，当 iframeSrc 变化时更新
  watch(
    iframeSrc,
    (newSrc) => {
      try {
        const url = new URL(newSrc);
        targetOrigin.value = url.origin;
      } catch (error) {
        console.warn("Invalid iframeSrc:", newSrc);
        targetOrigin.value = "";
      }
    },
    { immediate: true }
  );

  // 向 iframe 发送消息
  const sendMessageToIframe = (message) => {
    if (iframeRef?.value?.contentWindow) {
      const messageWithConfig = {
        ...message,
        config,
      };
      iframeRef.value.contentWindow.postMessage(
        messageWithConfig,
        targetOrigin.value
      );
    } else {
      console.warn("iframeRef 未定义或 iframe 尚未加载");
    }
  };

  // 处理收到的消息
  const handleMessage = (event) => {
    const { origin, data } = event;
    const isAllowedOrigin =
      !allowedOrigins.value.length || allowedOrigins.value.includes(origin);
    console.log(allowedOrigins.value, origin, "isAllowedOriginisAllowedOrigin");
    if (!isAllowedOrigin) {
      console.warn(`收到来自未授权源 ${origin} 的消息，已忽略`);
      return;
    }
    console.log(`收到ifram消息：${data}`);

    if (data.type === "ready") {
      console.log("收到 iframe ready 消息，发送初始化配置");
      sendMessageToIframe({ type: "init" });
    }

    onReceiveMessage?.(event);
  };

  // 清除缓存数据
  const clearCacheData = () => {
    sendMessageToIframe({ type: "clear-cache" });
  };

  // 处理 iframe 加载完成事件
  const handleIframeLoad = () => {
    isIframeLoaded.value = true;
    console.log("iframe 页面已加载");
  };

  // 监听消息事件
  onMounted(() => {
    window.addEventListener("message", handleMessage);
    if (iframeRef?.value) {
      iframeRef.value.addEventListener("load", handleIframeLoad);
    }
  });

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener("message", handleMessage);
    if (iframeRef?.value) {
      iframeRef.value.removeEventListener("load", handleIframeLoad);
    }
  });

  return {
    sendMessageToIframe,
    isIframeLoaded,
    clearCacheData,
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
export function useIframePage({
  onReceiveMessage = null,
  cacheData = ref({}),
} = {}) {
  const config = ref({ parentId: "", enableCache: false });
  const cacheKey = computed(() => `${config.value.parentId}-iframeData`);
  const targetOrigin = ref("");
  // 设置允许的来源
  const allowedOrigins = computed(() => [targetOrigin.value]);
  // 向父窗口发送消息
  const sendMessageToParent = (message) => {
    console.log(allowedOrigins.value);
    if (window.parent) {
      window.parent.postMessage(message, targetOrigin.value); // 发送到父页面
    } else {
      console.warn("没有父窗口可发送消息");
    }
  };

  // 监听 cacheData 的变化并保存到本地
  watch(
    cacheData,
    (newData) => {
      if (config.value.enableCache) {
        try {
          localStorage.setItem(cacheKey.value, JSON.stringify(newData));
          console.log("缓存数据已更新");
        } catch (error) {
          console.warn("无法保存缓存数据:", error);
        }
      }
    },
    { deep: true }
  );

  // 从缓存中恢复数据
  const restoreCachedData = () => {
    if (config.value.enableCache) {
      const cachedData = localStorage.getItem(cacheKey.value);
      if (cachedData) {
        try {
          cacheData.value = JSON.parse(cachedData);
          console.log("缓存数据已恢复");
        } catch (error) {
          console.warn("缓存数据解析失败:", error);
        }
      }
    }
  };

  // 清除缓存数据
  const clearCacheData = () => {
    localStorage.removeItem(cacheKey.value);
    console.log("缓存数据已清除");
  };

  // 处理收到的消息
  const handleMessage = (event) => {
    const { origin, data } = event;
    const isAllowedOrigin =
      !allowedOrigins.value.length || allowedOrigins.value.includes(origin);
    console.log(allowedOrigins.value, origin, "isAllowedOriginisAllowedOrigin");
    if (!isAllowedOrigin) {
      console.warn(`收到来自未授权源 ${origin} 的消息，已忽略`);
      return;
    }
    console.log(`收到父级${config.value.parentId}消息：${data}`);
    if (data.config) {
      config.value = data.config;
    }

    if (data.type === "init") {
      console.log("收到初始化消息，恢复缓存数据");
      restoreCachedData();
    }

    if (data.type === "clear-cache") {
      console.log("收到清除缓存消息");
      clearCacheData();
    }

    onReceiveMessage?.(event);
  };
  const setTargetOrigin = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const originFromParams = urlParams.get("parentOrigin");
    if (originFromParams) {
      targetOrigin.value = decodeURIComponent(originFromParams);
      return;
    }
    // 尝试从 document.referrer 获取
    try {
      const referrerUrl = new URL(document.referrer);
      targetOrigin.value = referrerUrl.origin;
    } catch (error) {
      console.warn("无法获取父页面的 origin");
      return "*"; // 或者根据需求设置默认值
    }
  };

  // 监听消息事件
  onMounted(() => {
    window.addEventListener("message", handleMessage);
    setTargetOrigin();
    sendMessageToParent({ type: "ready" });
  });

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener("message", handleMessage);
  });

  return {
    sendMessageToParent,
  };
}
