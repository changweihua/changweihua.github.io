<template>
  <div class="container" ref="containerRef">
    <ul v-if="items && items.length > 0"
      class="w-full grid grid-cols-1 gap-8 px-1 md:px-8 py-8 md:grid-cols-2 lg:grid-cols-3 card-list">
      <li class="card scroll-trigger animate--slide-in" :class="{ 'in-view': inViewSet.has(item.link) }" data-cascade
        :style="{ '--animation-order': i - 1 }" v-for="(item, i) in items" :key="item.link" :data-link="item.link">
        <article-card :item="item" />
      </li>
    </ul>
    <n-empty v-else></n-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, useTemplateRef, watch } from 'vue'
import { CardListItem } from './ArticleCard.vue'

const props = withDefaults(
  defineProps<{
    items: Array<CardListItem>
  }>(),
  {
    items: () => [],
  }
)

const containerRef = useTemplateRef<HTMLDivElement>('containerRef')
// 存储已进入视口的元素标识（用于控制 visible 类）
const inViewSet = ref<Set<string>>(new Set())

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
function initScrollAnimations(root: HTMLElement) {
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

// onMounted(() => {
//   nextTick(() => {
//     if (containerRef.value) {
//       initScrollAnimations(containerRef.value);
//     }
//   })
// })

// // 页面加载完成后启动
// document.addEventListener('DOMContentLoaded', () => {

// });

let observer: IntersectionObserver | null = null

// 初始化 Intersection Observer
function initObserver() {
  // 断开旧观察
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = entry.target.getAttribute('data-link')
        if (!link) return

        if (entry.isIntersecting) {
          // 进入视口：添加到集合，触发动画类
          inViewSet.value.add(link)
          // 可选：停止观察该元素（如果只需要触发一次）
          // observer?.unobserve(entry.target)
        } else {
          // 离开视口：从集合移除，恢复隐藏（下次进入再次播放动画）
          inViewSet.value.delete(link)
        }
      })
    },
    {
      rootMargin: '0px 0px -50px 0px', // 触发时机：元素进入视口后向下 50px
    }
  )

  // 观察所有卡片
  const cards = document.querySelectorAll('.card')
  cards.forEach((el) => observer?.observe(el))
}

// 监听 items 变化，重新绑定观察
watch(
  () => props.items,
  () => {
    nextTick(() => {
      initObserver()
    })
  },
  { immediate: true, deep: false }
)

onMounted(() => {
  nextTick(() => {
    initObserver()
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-weight: 600;
}

/* 动画类：当卡片进入视口时添加 .in-view */
.card.in-view {
  animation: articleSlideIn var(--duration-extra-long) var(--ease-out-slow) forwards;
  animation-delay: calc(var(--animation-order, 0) * 75ms);
}

@keyframes articleSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.scroll-trigger:not(.scroll-trigger--offscreen).animate--slide-in {
  animation: articleSlideIn 600ms cubic-bezier(0, 0, 0.3, 1) forwards;
  animation-delay: calc(var(--animation-order, 1) * 75ms);
}

@keyframes articleSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 如果用户开启“减少动画”，直接显示（可选） */
@media (prefers-reduced-motion: reduce) {
  .card.in-view {
    opacity: 1;
    transform: translateY(0);
    animation: none;
    /* 禁用动画 */
  }
}

/* 初始隐藏状态（防止 SSR 或加载闪现） */
.scroll-trigger--offscreen {
  /* 保持不可见，但保留空间 */
  opacity: 0.01;
  transform: translateY(2rem);
}
</style>
