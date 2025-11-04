<template>
  <div class="liquid-meta-card">
    <div class="liquid-meta-card-glow"></div>
    <div class="liquid-meta-card-content">
      <slot name="title">
        <h3>{{ title }}</h3>
      </slot>
      <slot>
        hover时卡片将展开，同时呈现液态光泽流动效果。适合展示产品信息、新闻摘要等内容，增强界面交互感。
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  msg?: string | number | boolean;
  lines?: string[];
  title: string;
}
withDefaults(defineProps<Props>(), {
  msg: "hello",
  lines: () => ["one", "two"],
  title: "标题",
});
</script>

<style>
:root {
  --liquid--card-bg: var(--vp-c-bg, #fff);
  /* 卡片背景色 */
  --liquid--card-liquid-color: var(--vp-c-brand-1, #74b9ff);
  /* 液态边框/光泽色 */
  --liquid--card-shadow: 0 4px 12px
    var(--vp-c-brand-soft, rgba(116, 185, 255, 0.2));
  /* 卡片阴影 */
  --liquid--card-shadow-hover: 0 8px 24px
    var(--vp-c-brand-3, rgba(116, 185, 255, 0.3));
  /* hover阴影 */
  --liquid--card-init-width: 100%;
  /* 初始宽度 */
  --liquid--card-init-height: 180px;
  /* 初始高度 */
  --liquid--card-hover-width: 100%;
  /* hover宽度 */
  --liquid--card-hover-height: 520px;
  /* hover高度 */
  --liquid--card-init-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
  /* 初始液态圆角 */
  --liquid--card-hover-radius: 20px;
  /* hover圆角 */
  --liquid--transition-duration: 0.6s;
  /* 过渡时长 */
  --liquid--content-opacity-init: 0.6;
  /* 内容初始透明度 */
  --liquid--content-opacity-hover: 1;
  /* 内容hover透明度 */
}

@media screen and (max-width: 600px) {
  /*当屏幕尺寸小于600px时，应用下面的CSS样式*/
  :root {
    --liquid--card-hover-height: 800px;
  }
}

/* 液态卡片容器 */
.liquid-meta-card {
  position: relative;
  width: var(--liquid--card-init-width);
  height: var(--liquid--card-init-height);
  background: var(--liquid--card-bg);
  border-radius: var(--liquid--card-init-radius);
  border: 2px solid var(--liquid--card-liquid-color);
  padding: 1.5rem;
  transition: width var(--liquid--transition-duration) ease,
    height var(--liquid--transition-duration) ease,
    border-radius var(--liquid--transition-duration) ease,
    box-shadow var(--liquid--transition-duration) ease;
  cursor: pointer;
  overflow: hidden;
}

.liquid-meta-card:hover {
  width: var(--liquid--card-hover-width);
  height: var(--liquid--card-hover-height);
  border-radius: var(--liquid--card-hover-radius);
  box-shadow: var(--liquid--card-shadow-hover);
}

/* 卡片液态光泽层（绝对定位，hover时移动） */
.liquid-meta-card-glow {
  position: absolute;
  top: 0;
  left: -50%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--vp-c-brand-soft, rgba(116, 185, 255, 0.2)),
    var(--vp-c-brand-3, rgba(116, 185, 255, 0))
  );
  animation: glow-flow 3s ease-in-out infinite;
  transition: opacity var(--liquid--transition-duration) ease;
}

.liquid-meta-card:hover .liquid-meta-card-glow {
  opacity: 1;
}

.liquid-meta-card:hover .liquid-meta-card-content {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease-in-out, height 0.5s ease;
  /* animation: 3s cubic-bezier(0.1, 0.1, 0.9, 0.1) infinite bounce; */
}

@media screen and (max-width: 600px) {
  /*当屏幕尺寸小于600px时，应用下面的CSS样式*/
  .liquid-meta-card:hover .liquid-meta-card-content {
    flex-direction: column;
  }
}

/* 光泽流动关键帧 */
@keyframes glow-flow {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(300%);
  }
}

/* 卡片内容 */
.liquid-meta-card-content h3 {
  color: var(--vp-c-text-1, #2d3436);
  margin-bottom: 1rem;
  transition: color var(--liquid--transition-duration) ease;
}

.liquid-meta-card div {
  color: var(--vp-c-text-2, #636e72);
  line-height: 1.5;
  transition: color var(--liquid--transition-duration) ease,
    opacity var(--liquid--transition-duration) ease;
  opacity: var(--liquid--content-opacity-init);
}

.liquid-meta-card:hover .liquid-meta-card p {
  opacity: var(--liquid--content-opacity-hover);
  color: var(--vp-c-text-1, #2d3436);
}

.liquid-meta-card:hover .liquid-meta-card h3 {
  color: var(--liquid--card-liquid-color);
}
</style>
