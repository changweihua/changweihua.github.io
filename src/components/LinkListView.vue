<template>
  <div class="palette_container" ref="palette">
    <div
      v-if="categories && categories.length > 0"
      class="w-full grid grid-cols-1 gap-4 px-1 md:px-8 py-8 md:grid-cols-2 lg:grid-cols-3"
    >
      <div
        class="palette-card linkcard flex flex-col justify-center"
        @mouseenter="handleMouseEnter($event.target, i)"
        @mouseleave="handleMouseLeave"
        :style="{
          opacity: hoverIndex === -1 ? 1 : i === hoverIndex ? 1 : 0.6,
          transition: '0.5s',
        }"
        v-for="(category, i) in categories"
      >
        <a :href="category.link">
          <p class="description">
            {{ category.title }}<br /><span>{{ category.description }}</span>
          </p>
          <div class="logo">
            <img
              class="rounded-sm"
              crossorigin="anonymous"
              width="70px"
              height="70px"
              :src="`${category.cover || '/logo.png'}`"
              :alt="category.coverAlt"
            />
          </div>
        </a>

        <div class="points_wrapper">
          <i class="point"></i>
          <i class="point"></i>
          <i class="point"></i>
          <i class="point"></i>
          <i class="point"></i>
          <i class="point"></i>
          <i class="point"></i>
          <i class="point"></i>
          <i class="point"></i>
          <i class="point"></i>
        </div>
      </div>
    </div>
    <a-empty v-else></a-empty>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, ref } from "vue";
import ColorThief from "colorthief";

// // 示例：解析 CSV 字符串
// const csvString = `name,age,city\nAlice,25,New York\nBob,30,Los Angeles`;
// parseCSVFile(csvString).then(parsedData => {
//   console.log(parsedData);
// }).catch(error => {
//   console.error('Error parsing CSV:', error);
// });

const palette = useTemplateRef<HTMLDivElement>("palette");

const colorThief = new ColorThief();

interface CategoryItem {
  title: string;
  link: string;
  icon: string;
  description?: string;
  cover?: string;
  coverAlt?: string;
}

defineProps({
  categories: Array<CategoryItem>,
});

//创建响应式变量，用来区分图片的移入和移出的状态
const hoverIndex = ref(-1);
//鼠标移入函数
const handleMouseEnter = async (img, i) => {
  hoverIndex.value = i;
  //通过colorThief.getPalette(img,3) 获取图片中的三种颜色
  //getPalette()函数接受两个参数 第一个参数是目标图片，第二个参数是要获取颜色的数量，该函数返回的是一个二维数组 二维数组的每一个元素是 rgb格式的颜色
  const colors = await colorThief.getPalette(img.querySelector("img"), 3);
  console.log(colors);
  //遍历二维数组 将颜色处理成我们想要的rgb格式
  const nColors = colors.map((c) => `rgba(${c[0]},${c[1]},${c[2]},0.5)`);
  //通过操作dom修改页面的背景颜色，将背景颜色设置为向右的三色渐变背景
  const card = document.querySelectorAll<HTMLDivElement>(".palette-card")[i];
  if (card) {
    card.style.setProperty(
      "background",
      `linear-gradient(to right, ${nColors[0]}, ${nColors[1]},${nColors[2]})`
    );
  }
};

//离开图片时将页面背景颜色重置为白色
const handleMouseLeave = () => {
  const card = document.querySelectorAll<HTMLDivElement>(".palette-card")[hoverIndex.value];
  if (card) {
    card.style.setProperty("background", "var(--vp-c-bg-soft)");
    hoverIndex.value = -1;
  }
};
</script>

<style scoped>
.waving-border {
  transition: ease-in-out 0.3s;
  background: linear-gradient(0, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px)
      no-repeat,
    linear-gradient(-90deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px)
      no-repeat,
    linear-gradient(-180deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px)
      no-repeat,
    linear-gradient(-270deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px)
      no-repeat;
  background-size: 0 2px, 2px 0, 0 2px, 2px 0;
  background-position: left top, right top, right bottom, left bottom;
}

.waving-border:hover {
  background-size: 100% 2px, 2px 100%, 100% 2px, 2px 100%;
}

.description {
  word-break: break-all;
  word-wrap: break-word;
}

.linkcard {
  position: relative;
}


/* 卡片背景 */
.linkcard {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 8px 16px 8px 8px;
  transition:
    color 0.5s,
    background-color 0.5s;
}

/* 卡片鼠标悬停 */
.linkcard:hover {
  background-color: var(--vp-c-yellow-soft);
}

/* 链接样式 */
.linkcard a {
  display: flex;
  align-items: center;
}

/* 描述链接文字 */
.linkcard .description {
  flex: 1;
  font-weight: 500;
  font-size: 16px;
  line-height: 25px;
  color: var(--vp-c-text-1);
  margin: 0 0 0 16px;
  transition: color 0.5s;
}

/* 描述链接文字2 */
.linkcard .description span {
  font-size: 14px;
}

/* logo图片 */
.linkcard .logo img {
  width: 80px;
  object-fit: contain;
}

.palette_container {
  border-radius: 10px;
}

.points_wrapper {
  overflow: hidden;
  width: 100%;
  height: 100%;
  pointer-events: none;
  position: absolute;
  z-index: 1;
}

.points_wrapper .point {
  bottom: -10px;
  position: absolute;
  animation: floating-points infinite ease-in-out;
  pointer-events: none;
  width: 3px;
  height: 3px;
  background: radial-gradient(
      65.28% 65.28% at 50% 100%,
      rgba(223, 113, 255, 0.8) 0%,
      rgba(223, 113, 255, 0) 100%
    ),
    linear-gradient(0deg, #7a5af8, #7a5af8);
  border-radius: 9999px;
}

@keyframes floating-points {
  0% {
    transform: translateY(0);
  }

  85% {
    opacity: 0;
  }

  100% {
    transform: translateY(-55px);
    opacity: 0;
  }
}

.points_wrapper .point:nth-child(1) {
  left: 10%;
  opacity: 1;
  animation-duration: 2.35s;
  animation-delay: 0.2s;
}

.points_wrapper .point:nth-child(2) {
  left: 30%;
  opacity: 0.7;
  animation-duration: 2.5s;
  animation-delay: 0.5s;
}

.points_wrapper .point:nth-child(3) {
  left: 25%;
  opacity: 0.8;
  animation-duration: 2.2s;
  animation-delay: 0.1s;
}

.points_wrapper .point:nth-child(4) {
  left: 44%;
  opacity: 0.6;
  animation-duration: 2.05s;
}

.points_wrapper .point:nth-child(5) {
  left: 50%;
  opacity: 1;
  animation-duration: 1.9s;
}

.points_wrapper .point:nth-child(6) {
  left: 75%;
  opacity: 0.5;
  animation-duration: 1.5s;
  animation-delay: 1.5s;
}

.points_wrapper .point:nth-child(7) {
  left: 86%;
  opacity: 0.9;
  animation-duration: 2.2s;
  animation-delay: 0.2s;
}

.points_wrapper .point:nth-child(8) {
  left: 58%;
  opacity: 0.8;
  animation-duration: 2.25s;
  animation-delay: 0.2s;
}

.points_wrapper .point:nth-child(9) {
  left: 94%;
  opacity: 0.6;
  animation-duration: 2.6s;
  animation-delay: 0.1s;
}

.points_wrapper .point:nth-child(10) {
  left: 65%;
  opacity: 1;
  animation-duration: 2.5s;
  animation-delay: 0.2s;
}
</style>
