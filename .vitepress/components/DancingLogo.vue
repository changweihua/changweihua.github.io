<template>
  <div class="dancing-container hidden md:visible">
    <svg
      id="svg"
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      width="240"
      height="60"
    >
      <defs>
        <pattern
          id="grid"
          x="0"
          y="0"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0,0H6V6" style="stroke: #f1f1f1; fill: none"></path>
        </pattern>
      </defs>
      <!-- <rect fill="url(#grid)" width="200" height="60"></rect> -->
      <text ref="dancingText" x="30" y="38" class="dacing-text">
        {{ brand }}
      </text>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, useTemplateRef, nextTick, onUnmounted } from "vue";

//x = [20,20,20,...]
//y = s*sin(w*x+t);
const brand = "𝓒𝓜𝓞𝓝𝓞.𝓝𝓔𝓣";
const texts = brand.split("");
var n = brand.length;
var x: number[] = [];
var y: number[] = [];
var i = n;
var s = 10;
var w = 0.02;
var t = 0;

const dancingText = useTemplateRef<SVGTSpanElement>("dancingText");

//横向间隔20
while (i--) {
  x.push(5);
  // const sinText = document.querySelector('#svg')
  // var tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  // tspan.textContent = texts[n - i - 1];
  // sinText?.appendChild(tspan);
  // var h = Math.round(360 / 26 * i);//将颜色均分显示
  // tspan.setAttribute('fill', 'hsl(' + h + ',100%,50%)');
}

//纵向按照sin()函数变化
function arrange(t) {
  y = [];
  var ly = 0,
    cy;
  for (i = 0; i < n; ++i) {
    cy = -s * Math.sin(w * i * 20 + t);
    y.push(cy - ly);
    ly = cy;
  }
}
//将数组转换成字符串并设置为dx,dy值
function render() {
  dancingText.value?.setAttribute("dx", x.join(" "));
  dancingText.value?.setAttribute("dy", y.join(" "));
}

//动态改变t的值
function frame() {
  t += 0.02;
  arrange(t);
  render();
  rafId = window.requestAnimationFrame(frame); //动画效果：递归调用frame方法
}

let rafId: number | null = null;

onMounted(function () {
  nextTick(function () {
    frame();
  });
});

onUnmounted(() => {
  if (rafId) {
    window.cancelAnimationFrame(rafId);
  }
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dancing-container {
  display: grid;
  place-content: center;

  svg {
    fill: var(--vp-c-text-1);
  }

  .dacing-text {
    font-size: 20px;
    color: var(--vp-c-text-1);
  }
}
</style>
