<template>
  <div class="nav-container">
    <!-- 果冻背景：外层移动，内层形变 -->
    <div class="indicator" ref="indicatorRef">
      <div class="indicator-blob" :style="styleCore"></div>
    </div>

    <!-- 标签项 -->
    <div v-for="(tab, index) in tabs" :key="index" class="icon-item" @click="moveIndicator(index)"
      :ref="el => { if (el) tabRefs[index] = el as HTMLDivElement }">
      <span class="tab-text" :style="styleOuter">
        {{ tab }}
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, nextTick, useTemplateRef } from 'vue';
let resizeObserver;

const props = defineProps({
  modelValue: { type: Number, default: 0 }, // 支持 v-model
  tabs: { type: Array, default: () => [] }, // 源数组
  styleCore: { type: Object, default: () => ({}) }, // 内层果冻样式
  styleOuter: { type: Object, default: () => ({}) }, // 外层标签项样式
});

const emit = defineEmits(['update:modelValue', 'change']);

const indicatorRef = useTemplateRef<HTMLDivElement>('indicatorRef');
const tabRefs = ref<Array<HTMLDivElement>>([]);
const currentIndex = ref(props.modelValue);

// 核心移动逻辑
const moveIndicator = (index, silent = false) => {
  const indicator = indicatorRef.value;
  const targetTab = tabRefs.value[index];

  if (!indicator || !targetTab) return;

  // 计算几何信息
  const containerRect = indicator.parentElement?.getBoundingClientRect();

  if (!containerRect) {
    return
  }
  const tabRect = targetTab.getBoundingClientRect();

  // 计算相对于容器的偏移量
  const translateX = tabRect.left - containerRect.left;
  const width = tabRect.width;
  const height = tabRect.height;

  // 1. 设置外层位移和宽度
  indicator.style.width = `${width}px`;
  indicator.style.height = `${height}px`;
  indicator.style.transform = `translateX(${translateX}px)`;

  // 2. 触发内层果冻动画（关键技巧）
  triggerJellyAnimation(indicator);

  // 3. 更新状态
  if (!silent) {
    emit('change', index); // 只有非静默模式才触发
    emit('update:modelValue', index);
    currentIndex.value = index;
  }
};

// 触发动画的技巧：强制重绘
const triggerJellyAnimation = element => {
  const blob = element.querySelector('.indicator-blob');
  // 移除类 -> 强制回流 -> 添加类，这样才能重复触发动画
  blob.classList.remove('stretching');
  void blob.offsetWidth; // 魔法代码：强制浏览器重绘
  blob.classList.add('stretching');
};

// 防抖
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// 初始化位置
onMounted(() => {
  nextTick(() => {
    if (props.tabs.length > 0) {
      moveIndicator(props.modelValue, true);
    }
  });
  // 监听容器大小变化，自动重新定位
  resizeObserver = new ResizeObserver(
    debounce(() => {
      moveIndicator(currentIndex.value);
    }, 200)
  );
  resizeObserver.observe(indicatorRef.value?.parentElement);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>
<style lang="scss" scoped>
.nav-container {
  position: relative;
  display: flex;
  padding: 8px;
  border-radius: 24px;
  gap: 8px;
}

/* 外层：GPU 加速的平滑位移 */
.indicator {
  position: absolute;
  top: 8px;
  left: 0;
  z-index: 1;
  pointer-events: none;

  /* 关键：使用 cubic-bezier 实现回弹效果（超越原位置再回弹） */
  transition:
    transform 0.5s cubic-bezier(0.68, -0.2, 0.265, 1.2),
    width 0.3s ease;

  will-change: transform, width; // 性能优化：提前告知浏览器
}

/* 内层：果冻形变动画主体 */
.indicator-blob {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 果冻关键帧动画 */
.stretching {
  animation: jelly-anim 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes jelly-anim {
  0% {
    transform: scale(1, 1);
  }

  30% {
    // 开始移动：水平拉伸，垂直压缩（像被扯开的果冻）
    transform: scale(1.25, 0.75);
  }

  50% {
    transform: scale(1.25, 0.75);
  }

  70% {
    // 即将停止：水平压缩，垂直膨胀（回弹挤压）
    transform: scale(0.85, 1.15);
  }

  100% {
    transform: scale(1, 1);
  }
}

/* Tab 项样式 */
.icon-item {
  padding: 12px;
  text-align: center;
  cursor: pointer;
  z-index: 2;
  position: relative;
  // user-select: none;

  .tab-text {
    font-size: 14px;
    font-weight: 600;
    transition: color 0.3s;
  }

  /* 激活状态的文字颜色（如果不使用 mix-blend-mode） */
  &.active .tab-text {
    color: #2c2c2c;
  }
}
</style>
