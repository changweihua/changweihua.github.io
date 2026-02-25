<template>
  <div
    class="container"
  >
    <ul
      v-if="items && items.length > 0"
      class="w-full grid grid-cols-1 gap-4 px-1 md:px-8 py-8 md:grid-cols-2 lg:grid-cols-3 card-list"
    >
      <li
        class="card scroll-trigger animate--slide-in" data-cascade :style="{ '--animation-order': i - 1 }"
        v-for="(item, i) in items"
        :key="item.link"
      >
        <article-card :item="item" />
      </li>
    </ul>
    <n-empty v-else></n-empty>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
  import { CardListItem } from './ArticleCard.vue'

  withDefaults(
    defineProps<{
      items: Array<CardListItem>
    }>(),
    {
      items: () => [],
    }
)

  // 配置类名常量
const TRIGGER_CLASS = 'scroll-trigger';
const OFFSCREEN_CLASS = 'scroll-trigger--offscreen';

// Intersection Observer 回调
function onIntersection(entries, observer) {
  entries.forEach((entry, index) => {
    const el = entry.target;

    if (entry.isIntersecting) {
      // 进入视口：移除 offscreen 类，允许动画播放
      el.classList.remove(OFFSCREEN_CLASS);

      // 如果是级联元素，动态设置动画顺序（兼容动态插入）
      if (el.hasAttribute('data-cascade')) {
        el.style.setProperty('--animation-order', index + 1);
      }

      // 只触发一次
      observer.unobserve(el);
    } else {
      // 离开视口：加上 offscreen 类（可选，用于反复进出场景）
      el.classList.add(OFFSCREEN_CLASS);
    }
  });
}

// 初始化滚动动画监听
function initScrollAnimations(root = document) {
  const triggers = root.querySelectorAll(`.${TRIGGER_CLASS}`);
  if (!triggers.length) return;

  // 推迟 50px 触发，确保用户看到动画
  const observer = new IntersectionObserver(onIntersection, {
    rootMargin: '0px 0px -50px 0px'
  });

  triggers.forEach(el => {
    // 初始状态设为 offscreen，防止页面加载时闪现
    el.classList.add(OFFSCREEN_CLASS);
    observer.observe(el);
  });
}

onMounted(() => {
  nextTick(() => {
    initScrollAnimations();
  })
})

// // 页面加载完成后启动
// document.addEventListener('DOMContentLoaded', () => {

// });
</script>

<style lang="scss" scoped>
  :root {
    --duration-extra-long: 600ms;
    --ease-out-slow: cubic-bezier(0, 0, 0.3, 1);
}
.container {
  margin: 0 auto;
  padding: 2rem;
}

.card-list {
  list-style: none;
  padding: 0;
}

.card {
  border-radius: 12px;
  padding: 2rem 1rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  /* 初始状态：透明 + 下移（由 JS 控制是否播放动画） */
  // opacity: 0.01;
  // transform: translateY(2rem);
}

/* 动画仅在 prefers-reduced-motion: no-preference 时启用 */
@media (prefers-reduced-motion: no-preference) {
  .scroll-trigger:not(.scroll-trigger--offscreen).animate--slide-in {
    animation: slideIn 600ms cubic-bezier(0, 0, 0.3, 1) forwards;
    animation-delay: calc(var(--animation-order, 1) * 75ms);
  }

  @keyframes slideIn {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* 初始隐藏状态（防止 SSR 或加载闪现） */
.scroll-trigger--offscreen {
  /* 保持不可见，但保留空间 */
  opacity: 0.01;
  transform: translateY(2rem);
}
</style>
