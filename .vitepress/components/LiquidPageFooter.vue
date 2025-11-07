<template>
  <div v-if="!frontmatter.plain" class="liquid-bg-container liquid-page-footer pt-3">
    <!-- 3层液态背景层（顺序：底→中→顶） -->
    <div class="liquid-layer"></div>
    <div class="liquid-layer"></div>
    <div class="liquid-layer"></div>
    <div id="PGFT" class="flex gap-3 flex-row items-center justify-center z-100">
      <span v-once>V{{ version }}</span><span> | </span>
      <icon-logos-markdown :width="20" :height="20" />
    </div>
    <VisitsPanel />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchVersion } from "../utils/fetchVersion";
import { useRootClick, useCycle } from "./composables";
import VisitsPanel from "./VisitsPanel.vue";
import { useData } from 'vitepress'

const { frontmatter } = useData()

const version = ref("N/A");
const { value, next } = useCycle([543, 12000, -3200]);

onMounted(() => {
  useRootClick(next);
  const docsVersionSpan = document.querySelector(
    "footer.VPFooter > .container > p.version-tag"
  );
  if (!docsVersionSpan) {
    fetchVersion().then((v) => {
      version.value = v;
    });
  }
});
</script>
<style>
/* 液态层位置流动关键帧（无规则XY轴移动） */
@keyframes liquid-flow {
  0% {
    transform: translate(0, 0);
  }

  25% {
    transform: translate(40px, -30px);
  }

  50% {
    transform: translate(-20px, 50px);
  }

  75% {
    transform: translate(50px, 20px);
  }

  100% {
    transform: translate(0, 0);
  }
}

/* 液态层形态变化关键帧（不规则圆角） */
@keyframes liquid-shape {
  0% {
    border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
  }

  25% {
    border-radius: 38% 62% 50% 50% / 60% 30% 70% 40%;
  }

  50% {
    border-radius: 55% 45% 35% 65% / 55% 60% 40% 45%;
  }

  75% {
    border-radius: 60% 40% 70% 30% / 40% 55% 45% 60%;
  }

  100% {
    border-radius: 48% 52% 65% 35% / 50% 40% 60% 50%;
  }
}
</style>
<style lang="scss" scoped>
.liquid-page-footer {
  /* 液态背景核心变量 */
  --liquid-bg-primary: var(--vp-c-brand-1, #0984e3);
  /* 主液态色（底层） */
  --liquid-bg-secondary: var(--vp-c-brand-2, #74b9ff);
  /* 次液态色（中层） */
  --liquid-bg-tertiary: var(--vp-c-brand-3, #b2dfff);
  /* 浅液态色（顶层） */
  --bg-opacity: 0.15;
  /* 所有液态层透明度（确保前景可读） */
  --layer-size: min(600px, 100vw);
  /* 液态层基础大小（大于屏幕，确保流动范围） */

  /* 各层动画参数（不同时长/延迟避免同步） */
  --layer1-duration: 18s;
  /* 底层动画时长（最慢） */
  --layer1-delay: 0s;
  --layer2-duration: 14s;
  /* 中层动画时长（中等） */
  --layer2-delay: 2s;
  --layer3-duration: 10s;
  /* 顶层动画时长（最快） */
  --layer3-delay: 4s;

  z-index: var(--vp-z-index-footer);
  background-color: var(--vp-c-bg);

  svg {
    fill: var(--vp-c-text-1);
  }
}

number-flow-vue {
  --number-flow-char-height: 0.85em;
  font-size: 1rem;
  font-weight: 600;
  font-style: italic;
}

.instructions {
  color: gray;
  text-align: center;
  bottom: 0;
  position: absolute;
  padding: 1.5rem;
  font-size: 0.875rem;
  width: 100%;
  left: 0;
}

/* 背景容器（全屏+相对定位，承载液态层） */
.liquid-bg-container {
  height: 100%;
  /* 基础背景色（液态层叠加其上） */
  position: relative;
  overflow: hidden;
  /* 隐藏液态层超出容器的部分 */
  // display: flex;
  // flex-direction: column;
  // justify-content: center;
  // align-items: center;
  // padding: 2rem;
}

/* 液态层通用样式（绝对定位+圆形初始形态） */
.liquid-layer {
  position: absolute;
  width: var(--layer-size);
  height: var(--layer-size);
  border-radius: 50%;
  opacity: var(--bg-opacity);
  filter: blur(40px);
  /* 模糊处理，增强“流动肌理”感 */
  will-change: transform, border-radius;
  overflow: hidden;
  /* 触发硬件加速，避免卡顿 */
  animation: liquid-flow linear infinite,
    /* 位置流动动画 */ liquid-shape ease-in-out infinite alternate;
  /* 形态变化动画 */
}

/* 底层液态层（主色+最慢流动） */
.liquid-layer:nth-child(1) {
  background: var(--liquid-bg-primary) !important;
  top: calc(50% - var(--layer-size) / 2 - 100px);
  /* 垂直偏移，避免重叠 */
  left: calc(50% - var(--layer-size) / 2 - 150px);
  /* 水平偏移 */
  animation-duration: var(--layer1-duration), 6s;
  /* 位置时长+形态时长 */
  animation-delay: var(--layer1-delay), 0s;
}

/* 中层液态层（次色+中等流动） */
.liquid-layer:nth-child(2) {
  background: var(--liquid-bg-secondary) !important;
  top: calc(50% - var(--layer-size) / 2 + 50px);
  left: calc(50% - var(--layer-size) / 2 + 100px);
  animation-duration: var(--layer2-duration), 5s;
  animation-delay: var(--layer2-delay), 1s;
}

/* 顶层液态层（浅色+最快流动） */
.liquid-layer:nth-child(3) {
  background: var(--liquid-bg-tertiary) !important;
  top: calc(50% - var(--layer-size) / 2 - 50px);
  left: calc(50% - var(--layer-size) / 2 + 50px);
  animation-duration: var(--layer3-duration), 4s;
  animation-delay: var(--layer3-delay), 2s;
}
</style>
