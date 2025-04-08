<template>
  <div
    class="reader-content flex items-center justify-center"
    @click="onReadText"
  >
    <slot></slot>
    <span class="cursor-pointer read-text-icon">
      <PlayCircleOutlined />
    </span>
  </div>
</template>

<script setup lang="ts">
import { message } from "ant-design-vue";
function isSpeechSynthesisSupported() {
  return (
    "speechSynthesis" in window &&
    typeof window.speechSynthesis.speak === "function"
  );
}
const findParentElement = (el, className) => {
  while (!el?.classList.contains(className)) {
    el = el?.parentElement;
  }
  return el;
};
const onReadText = (e) => {
  const target = e.target;
  console.log("target", target);
  if (!target) {
    return;
  }
  if (["svg", "path", "ant-icon"].includes(target.tagName.toLowerCase())) {
    const element = findParentElement(target, "reader-content");
    const text = element.innerText;
    console.log("text", text);
    if (!text) return;

    if (!isSpeechSynthesisSupported()) {
      return message.info("当前环境不支持阅读文本功能!");
    }
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text;

    // 设置语言为中文
    utterance.lang = "zh-CN";
    // utterance.rate = 0.4; // 设置语速，范围是0.1到10
    // utterance.pitch = 2; // 设置音调，范围是0到2

    window.speechSynthesis.speak(utterance);
  }
};
</script>

<style lang="less" scoped>
.reader-content {
  display: inline-block;
  margin: 0 !important;
  :deep(.anticon) {
    font-size: 14px;
    margin: 0 !important;

    svg {
      margin: 0 !important;
    }
  }
}
.read-text-icon:hover {
  color: #2396ef;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
