<template>
  <div class="liquid-bg-container">
    <!-- 3层液态背景层（顺序：底→中→顶） -->
    <div class="liquid-layer"></div>
    <div class="liquid-layer"></div>
    <div class="liquid-layer"></div>
    <div id="PGFT" class="page-footer flex gap-3 flex-row items-center justify-center pb-6 z-10">
      <span v-once>V{{ version }}</span><span> | </span>
      <icon-logos-markdown :width="20" :height="20" />
    </div>
    <VisitsPanel />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchVersion } from "../utils/fetchVersion";
// import NumberFlow, { continuous } from "@number-flow/vue";
import { useRootClick, useCycle } from "./composables";
import {
  AntDesignIcon,
  GitHubIcon,
  GitIcon,
  MarkdownIcon,
  LaTeXIcon,
  ViteIcon,
} from "vue3-simple-icons";
import VisitsPanel from "./VisitsPanel.vue";

const version = ref("N/A");
// import { useData } from "vitepress";
// const { params } = useData();
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

<style lang="scss" scoped>
.page-footer {
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
  width: 100%;
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
  /* 触发硬件加速，避免卡顿 */
  animation:
    liquid-flow linear infinite,
    /* 位置流动动画 */
    liquid-shape ease-in-out infinite alternate;
  /* 形态变化动画 */
}

/* 底层液态层（主色+最慢流动） */
.liquid-layer:nth-child(1) {
  background: var(--liquid-bg-primary);
  top: calc(50% - var(--layer-size)/2 - 100px);
  /* 垂直偏移，避免重叠 */
  left: calc(50% - var(--layer-size)/2 - 150px);
  /* 水平偏移 */
  animation-duration: var(--layer1-duration), 6s;
  /* 位置时长+形态时长 */
  animation-delay: var(--layer1-delay), 0s;
}

/* 中层液态层（次色+中等流动） */
.liquid-layer:nth-child(2) {
  background: var(--liquid-bg-secondary);
  top: calc(50% - var(--layer-size)/2 + 50px);
  left: calc(50% - var(--layer-size)/2 + 100px);
  animation-duration: var(--layer2-duration), 5s;
  animation-delay: var(--layer2-delay), 1s;
}

/* 顶层液态层（浅色+最快流动） */
.liquid-layer:nth-child(3) {
  background: var(--liquid-bg-tertiary);
  top: calc(50% - var(--layer-size)/2 - 50px);
  left: calc(50% - var(--layer-size)/2 + 50px);
  animation-duration: var(--layer3-duration), 4s;
  animation-delay: var(--layer3-delay), 2s;
}
</style>
