<template>
  <div class="marquee-wrapper">
    <div class="item" style="--count: 1"></div>
    <div class="item" style="--count: 2"></div>
    <div class="item" style="--count: 3"></div>
    <div class="item" style="--count: 4"></div>
    <div class="item" style="--count: 5"></div>
    <div class="item" style="--count: 6"></div>
    <div class="item" style="--count: 7"></div>
    <div class="item" style="--count: 8"></div>
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="less" scoped>
.marquee-wrapper {
  --logo-width: 200px;
  --logo-height: 100px;
  --logo-count: 8;
  --duration: 30s;
  width: 90%;
  max-width: 1200px;
  margin-inline: auto;
  position: relative;
  height: var(--logo-height);
  margin-top: 5rem;
  overflow: hidden;
  /* 模糊遮挡效果 */
  mask-image: linear-gradient(to right,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 1) 20%,
      rgba(0, 0, 0, 1) 80%,
      rgba(0, 0, 0, 0));


  .item {
    width: var(--logo-width);
    height: var(--logo-height);
    background-color: red;
    border-radius: 6px;
    position: absolute;
    left: calc(var(--logo-width) * var(--logo-count));
    animation-name: scrollLeft;
    animation-duration: var(--duration);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    /* 动态计算出每个logo的动画延时 */
    animation-delay: calc(var(--duration) / var(--logo-count) * (var(--logo-count) - var(--count)) * -1);
  }
}

@keyframes scrollLeft {
  to {
    left: calc(var(--logo-width) * -1);
  }
}
</style>
