<template>
</template>

<script setup lang="ts">
import { gsap } from "gsap";

// 创建一个基本时间轴
const tl = gsap.timeline();

// 创建无限循环的时间轴
const loopingTl = gsap.timeline({
  repeat: -1,         // 无限循环
  repeatDelay: 1,     // 每次循环间隔1秒
  yoyo: true          // 往返播放（正向→反向→正向...）
});

// // 方法1：按顺序添加（自动衔接）
// tl.to(element1, { x: 100, duration: 1 })
//   .to(element2, { y: 50, duration: 0.5 })
//   .to(element3, { opacity: 0, duration: 0.8 });

// // 方法2：指定绝对时间点（从时间轴开始的秒数）
// tl.to(element1, { x: 100, duration: 1 }, 0)       // 0秒开始
//   .to(element2, { y: 50, duration: 0.5 }, 0.5)   // 0.5秒开始（与第一个动画会有重叠，因为第一个动画执行要1秒，但是这个在0.5秒时就开始了）
//   .to(element3, { opacity: 0, duration: 0.8 }, 1); // 1秒开始


</script>
