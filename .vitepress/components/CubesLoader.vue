<template>
  <div class="cube-group">
    <div class="cube" style="--i: 1"></div>
    <div class="cube" style="--i: 2"></div>
    <div class="cube" style="--i: 3"></div>
    <div class="cube" style="--i: 4"></div>
    <div class="cube" style="--i: 5"></div>
    <div class="cube" style="--i: 6"></div>
    <div class="cube" style="--i: 7"></div>
    <div class="cube" style="--i: 8"></div>
    <div class="cube" style="--i: 9"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "标题",
});
</script>
<style>

@keyframes up-down {
   50% {
     transform: translateZ(calc(var(--size)));
   }
 }
</style>
<style scoped>
 .cube-group {
   --size: 50px;
   padding: calc(var(--size));
   width: calc(var(--size) * 3);
   height: calc(var(--size) * 3);
   display: grid;
   transform-style: preserve-3d;
   transform: rotateX(45deg) rotateZ(45deg);
   grid-template-columns: var(--size) var(--size) var(--size);
   grid-template-rows: var(--size) var(--size) var(--size);
 }
 .cube {
   transform-style: preserve-3d;
   background-color: #049dbc;
   width: var(--size);
   height: var(--size);
   animation: up-down 1s infinite calc(var(--i) / 3 * -0.2s);
   box-shadow:  calc(var(--size) * 3) calc(var(--size) * 3) calc(var(--size) /2) rgba(145, 143, 143, 0.497)
 }
 .cube::before {
   transform-origin: left top;
   content: '';
   width: var(--size);
   height: var(--size);
   display: block;
   background-color: #057d95;
   transform: translateX(var(--size)) rotateY(90deg);
 }
 .cube::after {
   transform-origin: 0 0;
   content: '';
   width: var(--size);
   height: var(--size);
   display: block;
   background-color: #056e83;
   transform: rotateX(-90deg);
 }
</style>
