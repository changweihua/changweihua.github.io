<template>
  <div class="palette_container" ref="palette">
    <div v-if="categories && categories.length > 0"
      class="w-full grid grid-cols-1 gap-4 px-1 md:px-8 py-8 md:grid-cols-3">
      <div class="palette-card linkcard flex flex-col justify-center" @mouseenter="handleMouseEnter($event.target,i)" @mouseleave="handleMouseLeave" :style="{opacity:hoverIndex===-1?1:i===hoverIndex?1:0.6,transition:'0.5s'}" v-for="(category, i) in categories">
        <a :href="category.link">
          <p class="description">{{ category.title }}<br><span>{{ category.description }}</span></p>
          <div class="logo">
            <img class="rounded-sm"  crossorigin="anonymous" width="70px" height="70px" :src="`${category.cover || '/logo.png'}`" :alt="category.coverAlt" />
          </div>
        </a>
      </div>
    </div>
    <a-empty v-else></a-empty>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, ref } from 'vue';
import ColorThief from 'colorthief';

const palette = useTemplateRef<HTMLDivElement>('palette')

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
const hoverIndex = ref(-1)
//鼠标移入函数
const handleMouseEnter = async (img, i) => {
  hoverIndex.value = i
  //通过colorThief.getPalette(img,3) 获取图片中的三种颜色
  //getPalette()函数接受两个参数 第一个参数是目标图片，第二个参数是要获取颜色的数量，该函数返回的是一个二维数组 二维数组的每一个元素是 rgb格式的颜色
  const colors = await colorThief.getPalette(img.querySelector('img'), 3)
  console.log(colors)
  //遍历二维数组 将颜色处理成我们想要的rgb格式
  const nColors = colors.map((c) => `rgba(${c[0]},${c[1]},${c[2]},0.5)`)
  //通过操作dom修改页面的背景颜色，将背景颜色设置为向右的三色渐变背景
  const card = document.querySelectorAll('.palette-card')[i]
  if(card){
    card.style.setProperty('background', `linear-gradient(to right, ${nColors[0]}, ${nColors[1]},${nColors[2]})`);
  }
}

//离开图片时将页面背景颜色重置为白色
const handleMouseLeave = () => {
  const card = document.querySelectorAll('.palette-card')[hoverIndex.value]
  if (card) {
    card.style.setProperty('background', 'var(--vp-c-bg-soft)');
    hoverIndex.value = -1
  }
}

</script>

<style lang="less">
.waving-border {
  transition: ease-in-out 0.3s;
  background: linear-gradient(0, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px) no-repeat,
    linear-gradient(-90deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px) no-repeat,
    linear-gradient(-180deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px) no-repeat,
    linear-gradient(-270deg, var(--vp-c-brand) 2px, var(--vp-c-brand) 2px) no-repeat;
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

.palette_container{
  border-radius: 10px;
}
</style>
