<template>
  <div class="root-container" v-element-size="handleResize">
    <!-- 轮播图容器 -->
    <div class="carousel-container" ref="carouselContainer">
      <!-- 轮播图片区域 -->
      <div class="carousel" ref="carousel">
        <!-- 轮播图片 -->
        <div
          :class="currentSlide === index ? 'slide active' : 'slide'"
          :data-index="index"
          style="opacity: 0"
          v-for="(imaage, index) in carouselConfig.images"
          :key="imaage.src"
        >
          <img :src="imaage.src" :alt="imaage.alt" />
        </div>
      </div>

      <!-- 导航按钮 -->
      <button class="nav-btn prev" @click="handlePrev">
        <span>‹</span>
      </button>
      <button class="nav-btn next" @click="handleNext">
        <span>›</span>
      </button>

      <!-- 指示器 -->
      <div class="indicators" ref="indicators">
        <!-- 指示器点 -->
        <button
          :class="currentSlide === index ? 'dot active' : 'dot'"
          :data-index="index"
          v-for="(_img, index) in carouselConfig.images"
          :key="`dot-${index}`"
          @click="goToSlide(index)"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, onBeforeUnmount, ref } from "vue";
import { vElementSize } from "@vueuse/components";

const carouselConfig = {
  images: [
    {
      title: "Windows",
      alt: "开发平台",
      src: "/images/macwallpaper.jpg",
    },
    {
      title: "数智机器人",
      alt: "扬州泰州国际机场数智人",
      src: "/images/robot_welcome.png",
    },
    {
      title: "手持终端",
      alt: "无锡硕放机场手持终端",
      src: "/images/cmono-微信图片_20240816150009.png",
    },
    {
      title: "智慧出行小程序",
      alt: "扬州泰州国际机场智慧出行小程序",
      src: "/images/cmono-微信图片_20230718132006.jpg",
    },
    {
      title: "GitOps",
      alt: "自动化运维平台",
      src: "/images/cmono-93a13ef7ec982bab46d5792fb65c09c.png",
    },
    {
      title: "智慧机场运行平台",
      alt: "智慧机场运行平台",
      src: "/images/digital_airport.png",
    },
    {
      title: "AI",
      alt: "AI LLMS",
      src: "/images/ai_sse.gif",
    },
  ],
  fragmentConfig: {
    rows: 10, // 碎片行数
    cols: 15, // 碎片列数
    maxDisplacement: 400, // 碎片最大位移距离
    maxRotation: 180, // 碎片最大旋转角度
    minScale: 0.3, // 碎片最小缩放比例
  },
  autoplay: true, // 是否自动播放
  autoplaySpeed: 5000, // 自动播放速度(毫秒)
  transitionDuration: 2000, // 过渡动画持续时间(毫秒)
};

// DOM元素
const carouselContainer = useTemplateRef<HTMLDivElement>("carousel");
const indicators = useTemplateRef<HTMLDivElement>("indicators");

// 状态变量
const currentSlide = ref(0);
let autoplayInterval = 0;
let isPlaying = carouselConfig.autoplay;
let autoplaySpeed = carouselConfig.autoplaySpeed;
let isTransitioning = false; // 过渡状态锁

// 绑定事件
function handlePrev() {
  if (!isTransitioning) goToPrevSlide();
}

function handleNext() {
  if (!isTransitioning) goToNextSlide();
}

// 初始化轮播图
function initCarousel() {
  if (carouselContainer.value && indicators.value) {
    // 设置自动播放
    if (isPlaying) {
      startAutoplay();
    }
  }
}

// 切换到指定轮播图
function goToSlide(index: number) {
  if (index === currentSlide.value || isTransitioning) return;

  isTransitioning = true; // 锁定过渡状态

  const slides = carouselContainer.value!.querySelectorAll(".slide");
  const currentSlideEl = slides[currentSlide.value];
  const newSlideEl = slides[index];

  // 碎片化当前轮播图
  fragmentImage(currentSlideEl.querySelector("img"), () => {
    // 隐藏当前轮播图，显示新轮播图
    currentSlideEl.classList.remove("active");
    newSlideEl.classList.add("active");
    currentSlide.value = index;

    // 重置自动播放计时器
    if (isPlaying) {
      resetAutoplay();
    }

    // 解除锁定
    isTransitioning = false;
  });
  setTimeout(() => {
    (currentSlideEl as HTMLElement).style.opacity = "0";
    (newSlideEl as HTMLElement).style.opacity = "1";
    currentSlide.value = index;
    // 更新指示器
    carouselContainer.value!.querySelectorAll(".dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }, 0);
}

// 切换到上一张
function goToPrevSlide() {
  const newIndex =
    (currentSlide.value - 1 + carouselConfig.images.length) %
    carouselConfig.images.length;
  goToSlide(newIndex);
}

// 切换到下一张
function goToNextSlide() {
  const newIndex = (currentSlide.value + 1) % carouselConfig.images.length;
  goToSlide(newIndex);
}

// 图片碎片化函数
function fragmentImage(
  img: HTMLImageElement | null,
  callback: { (): void; (): void }
) {
  if (!img || !img.complete) {
    if (callback) callback();
    return;
  }

  // 移除之前的碎片
  const existingFragments =
    carouselContainer.value!.querySelectorAll(".fragment");
  existingFragments.forEach((frag) => frag.remove());

  // 获取图片尺寸和容器尺寸
  const imgWidth = img!.naturalWidth;
  const imgHeight = img!.naturalHeight;
  const containerWidth = carouselContainer.value!.clientWidth;
  const containerHeight = carouselContainer.value!.clientHeight;

  // 计算容器和图片的宽高比
  const containerRatio = containerWidth / containerHeight;
  const imgRatio = imgWidth / imgHeight;

  // 计算实际显示的图片尺寸（考虑object-cover的影响）
  let displayWidth, displayHeight;
  if (imgRatio > containerRatio) {
    // 图片比容器宽，高度填满容器，宽度超出
    displayHeight = containerHeight;
    displayWidth = displayHeight * imgRatio;
  } else {
    // 图片比容器高，宽度填满容器，高度超出
    displayWidth = containerWidth;
    displayHeight = displayWidth / imgRatio;
  }

  // 计算图片在容器中的偏移（居中显示）
  const offsetX = (displayWidth - containerWidth) / 2;
  const offsetY = (displayHeight - containerHeight) / 2;

  // 设置碎片参数
  const { rows, cols, maxDisplacement, maxRotation, minScale } =
    carouselConfig.fragmentConfig;
  const fragmentWidth = displayWidth / cols;
  const fragmentHeight = displayHeight / rows;

  // 创建碎片
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const fragment = document.createElement("div");
      fragment.className = "fragment";

      // 设置碎片的位置和大小
      fragment.style.left = `${j * fragmentWidth - offsetX}px`;
      fragment.style.top = `${i * fragmentHeight - offsetY}px`;
      fragment.style.width = `${fragmentWidth}px`;
      fragment.style.height = `${fragmentHeight}px`;

      // 使用背景图定位来显示原图的相应部分
      fragment.style.backgroundImage = `url(${img.src})`;
      fragment.style.backgroundSize = `${displayWidth}px ${displayHeight}px`;
      fragment.style.backgroundPosition = `-${j * fragmentWidth}px -${
        i * fragmentHeight
      }px`;

      // 设置初始样式
      fragment.style.opacity = "1";
      fragment.style.transform = "translate(0, 0) rotate(0) scale(1)";

      // 添加到容器
      carouselContainer.value!.appendChild(fragment);

      // 延迟触发动画
      setTimeout(() => {
        // 计算随机位移、旋转和不透明度
        const randomX = (Math.random() - 0.5) * maxDisplacement;
        const randomY = (Math.random() - 0.5) * maxDisplacement;
        const randomRotation = (Math.random() - 0.5) * maxRotation;
        const randomScale = minScale + Math.random() * (1 - minScale);

        fragment.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotation}deg) scale(${randomScale})`;
        fragment.style.opacity = "0";
      }, (i * cols + j) * 10);
    }
  }

  // 动画结束后移除碎片并执行回调
  const totalDuration = carouselConfig.transitionDuration + rows * cols * 10;
  setTimeout(() => {
    if (carouselContainer.value) {
      const fragments = carouselContainer.value!.querySelectorAll(".fragment");
      fragments.forEach((frag) => frag.remove());
      if (callback) callback();
    }
  }, totalDuration);
}

// 开始自动播放
function startAutoplay() {
  autoplayInterval = window.setInterval(() => {
    if (!isTransitioning) goToNextSlide();
  }, autoplaySpeed);
}

// 停止自动播放
function stopAutoplay() {
  clearInterval(autoplayInterval);
}

// 重置自动播放计时器
function resetAutoplay() {
  if (isPlaying) {
    clearInterval(autoplayInterval);
    startAutoplay();
  }
}

// 响应式处理
function handleResize() {
  // 可添加调整碎片大小的逻辑
}

onMounted(() => {
  // 初始化
  initCarousel();
});

onBeforeUnmount(() => {
  stopAutoplay();
});
</script>

<style scoped>
.root-container {
  --primary: #4c6ef5;
  --secondary: #339af0;
  --dark: #1a1a2e;
  --light: #f8f9fa;
  --image-width: 100%;
  --image-height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  overflow: hidden;
  width: var(--image-width);
  height: var(--image-height);
  min-height: 40vh;

  /* 轮播图容器 */
  .carousel-container {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3);
  }

  /* 轮播图片区域 */
  .carousel {
    position: relative;
    width: 100%;
    height: 100%;
    aspect-ratio: 16/9;
  }

  /* 轮播图 */
  .slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 300ms;
  }

  .slide.active {
    opacity: 1;
  }

  .slide img {
    width: 100%;
    height: 100%;
    object-fit: fill;
  }

  /* 导航按钮 */
  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
    border-radius: 50%;
    color: white;
    transition: all 300ms;
    cursor: pointer;
    border: none;
    outline: none;
    z-index: 10;
    font-size: 2rem;
  }

  .nav-btn:hover {
    background: rgba(76, 110, 245, 0.8);
    transform: translateY(-50%) scale(1.1);
  }

  .nav-btn.prev {
    left: 1rem;
  }

  .nav-btn.next {
    right: 1rem;
  }

  /* 指示器 */
  .indicators {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    z-index: 10;
  }

  .dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8);
    transition: all 300ms;
    cursor: pointer;
    border: none;
    outline: none;
  }

  .dot.active {
    width: 2rem;
    border-radius: 0.375rem;
    background: #4c6ef5;
  }
}

/* 碎片 */
:global(.fragment) {
  position: absolute;
  pointer-events: none;
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
}
</style>
