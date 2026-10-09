import { ref, watch, onUnmounted, type Ref } from "vue";

export function useElementVisibility(
  targetRef: Ref<HTMLElement | null>,
  scrollContainerRef: Ref<HTMLElement | Window | null> = ref(window),
  threshold: number | number[] = 0
): Ref<boolean> {
  const isVisible = ref(false);
  let observer: IntersectionObserver | null = null;

  const createObserver = () => {
    const target = targetRef.value;
    const container = scrollContainerRef.value;

    if (!target || !container) return;

    // 创建 Intersection Observer 实例
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible.value = entry.isIntersecting;
        });
      },
      {
        root: container instanceof Window ? null : container,
        threshold,
      }
    );

    observer.observe(target);
  };

  const destroyObserver = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  // 监听目标元素和容器变化
  watch(
    [targetRef, scrollContainerRef],
    () => {
      destroyObserver();
      createObserver();
    },
    { immediate: true }
  );

  // 组件卸载时清理
  onUnmounted(() => {
    destroyObserver();
  });

  return isVisible;
}

// import { ref, watch, onUnmounted, type Ref } from 'vue';

// // 滚动容器类型
// type ScrollContainer = HTMLElement | Window;

// /**
//  * 监听元素是否在可视区内的 Hook
//  * @param targetRef - 目标元素的 Ref（DOM 元素）
//  * @param scrollContainerRef - 滚动容器的 Ref（默认 window，可指定其他DOM元素）
//  * @param throttleDelay - 节流延迟时间（默认 100ms，最小 0ms）
//  * @returns 元素是否可见的响应式状态
//  */
// export function useElementVisibility(
//   targetRef: Ref<HTMLElement | null>,
//   scrollContainerRef: Ref<ScrollContainer | null> = ref(window),
//   throttleDelay: number = 100
// ): Ref<boolean> {

//   const isVisible = ref(false);
//   // 存储当前绑定事件的容器（用于卸载时清理）
//   let currentContainer: ScrollContainer | null = null;

//   const getContainerInfo = (container: ScrollContainer) => {
//     if (container instanceof Window) {
//       return {
//         height: window.innerHeight,
//         scrollTop: window.scrollY,
//         rect: new DOMRectReadOnly(0, 0, window.innerWidth, window.innerHeight)
//       };
//     }
//     return {
//       height: container.clientHeight,
//       scrollTop: container.scrollTop,
//       rect: container.getBoundingClientRect()
//     };
//   };

//   // 优化后的节流函数：保证最后一次滚动可以执行
//   const throttle = (fn: (...rest: any) => void, time = 500) => {
//     let timer: NodeJS.Timeout | null = null;
//     let lastArgs: any[] | null = null;

//     return (...rest: any) => {
//       lastArgs = rest;

//       if (!timer) {
//         fn(...rest);
//         timer = setTimeout(() => {
//           if (lastArgs) fn(...lastArgs);
//           timer = null;
//           lastArgs = null;
//         }, time);
//       }
//     };
//   };

//   const checkVisibility = () => {
//     const target = targetRef.value;
//     const container = scrollContainerRef.value;

//     if (!target || !container) {
//       isVisible.value = false;
//       return;
//     }

//     // 获取容器和目标元素信息
//     const { height: containerHeight, rect: containerRect } = getContainerInfo(container);
//     const targetRect = target.getBoundingClientRect();

//     // 计算相对位置（目标元素相对于容器的坐标）
//     const targetTopRelative = targetRect.top - containerRect.top;
//     const targetBottomRelative = targetTopRelative + targetRect.height;

//     // 可见性判断（只要有部分在容器内即视为可见）
//     isVisible.value = targetBottomRelative > 0 && targetTopRelative < containerHeight;
//   };

//   const throttledCheck = throttle(checkVisibility, throttleDelay);

//   // 抽离事件绑定/解绑逻辑
//   const setupListeners = (container: ScrollContainer) => {
//     if (container instanceof Window) {
//       window.addEventListener('scroll', throttledCheck);
//       window.addEventListener('resize', throttledCheck);
//     } else {
//       container.addEventListener('scroll', throttledCheck);
//       window.addEventListener('resize', throttledCheck);
//     }
//     currentContainer = container;
//   };

//   const cleanupListeners = (container: ScrollContainer) => {
//     if (container instanceof Window) {
//       window.removeEventListener('scroll', throttledCheck);
//       window.removeEventListener('resize', throttledCheck);
//     } else {
//       container.removeEventListener('scroll', throttledCheck);
//       window.removeEventListener('resize', throttledCheck);
//     }
//   };

//   // 监听滚动容器变化（滚动容器有可能从父组件取（异步获取）需要watch更新）
//   watch(
//     scrollContainerRef,
//     (newContainer, oldContainer) => {
//       // 解绑旧容器事件
//       if (oldContainer) cleanupListeners(oldContainer);
//       // 绑定新容器事件（并立即检查一次）
//       if (newContainer) {
//         setupListeners(newContainer);
//         checkVisibility();
//       }
//     },
//     { immediate: true }
//   );

//   // 组件卸载时清理所有事件
//   onUnmounted(() => {
//     if (currentContainer) {
//       cleanupListeners(currentContainer);
//       currentContainer = null;
//     }
//   });

//   return isVisible;
// }
