<template>
  <div class="loading-spinner">
    <div class="spinner-container">
      <div class="spinner"></div>
      <p>组件加载中...</p>
      <div class="progress">
        <div class="progress-bar" :style="progressStyle"></div>
      </div>
      <p class="hint">这通常很快，请耐心等待</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const progress = ref(0);
let progressInterval;

onMounted(() => {
  progressInterval = setInterval(() => {
    progress.value = Math.min(progress.value + Math.random() * 10, 90);
  }, 200);
});

onUnmounted(() => {
  clearInterval(progressInterval);
});

const progressStyle = {
  width: `${progress.value}%`,
};
</script>

<style scoped>
.loading-spinner {
  --color-primary: #2563eb;
  /* 色轮上均匀分布 120 度 */
  --color-secondary: hsl(from var(--color-primary) calc(h + 120) s l);
  --color-tertiary: hsl(from var(--color-primary) calc(h - 120) s l);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;

  .spinner-container {
    max-width: 300px;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--vp-c-brand-1);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .progress {
    width: 100%;
    height: 6px;
    background: #f0f0f0;
    border-radius: 3px;
    margin: 15px 0;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--color-secondary),
      var(--color-tertiary)
    );
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .hint {
    font-size: 12px;
    color: #999;
    margin: 10px 0 0 0;
  }
}
</style>
