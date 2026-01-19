<template>
  <div class="error-display">
    <div class="error-container">
      <div class="error-icon">❌</div>
      <h3>组件加载失败</h3>
      <p class="error-message">{{ error?.message || "未知错误" }}</p>
      <div class="error-actions">
        <button @click="retry" class="retry-btn">🔄 重试加载</button>
        <button @click="reset" class="reset-btn">🏠 返回首页</button>
      </div>
      <p class="error-hint">如果问题持续存在，请联系技术支持</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Error,
    default: null,
  },
});

const emit = defineEmits(["retry"]);

const retry = () => {
  emit("retry");
};

const reset = () => {
  window.location.href = "/";
};
</script>

<style scoped>
.error-display {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.error-container {
  max-width: 400px;
  padding: 30px;
  background: #fff5f5;
  border: 2px solid #fed7d7;
  border-radius: 8px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-container h3 {
  margin: 0 0 15px 0;
  color: #e53e3e;
}

.error-message {
  color: #718096;
  margin-bottom: 20px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  font-size: 14px;
}

.error-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 15px;
}

.retry-btn,
.reset-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.retry-btn {
  background: #4299e1;
  color: white;
}

.retry-btn:hover {
  background: #3182ce;
}

.reset-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.reset-btn:hover {
  background: #cbd5e0;
}

.error-hint {
  font-size: 12px;
  color: #a0aec0;
  margin: 0;
}
</style>
