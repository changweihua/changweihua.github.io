<template id="app">
  <div class="easy-layout-page">
    <!-- 内容 start -->
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="300px"
      height="300px"
    >
      <polygon
        class="g-polygon-wrap"
        points="150 0, 300 75, 300 225, 150 300, 0 225,  0 75, 150 0"
      />
      <polygon
        class="g-polygon-move"
        points="150 0, 300 75, 300 225, 150 300, 0 225,  0 75, 150 0"
      />
      <text x="150" y="150" font-size="20" text-anchor="middle" fill="#6feffa">
        简单的例子
      </text>
      <text x="150" y="180" font-size="14" text-anchor="middle" fill="#6feffa">
        后续有空做看板边框应用
      </text>
    </svg>
    <!-- 内容 end -->
  </div>
</template>

<style scoped>
.logo-container {
  margin: 0px;
  width: 100%;
  height: 100%;
  background-color: #040c17;
  background-image: linear-gradient(rgba(6, 39, 84, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 39, 84, 0.3) 1px, transparent 1px),
    linear-gradient(rgba(6, 39, 84, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 39, 84, 0.1) 1px, transparent 1px);
  background-size: 75px 75px, 75px 75px, 15px 15px, 15px 15px;
  background-position: -1px -1px, -1px -1px, -1px -1px, -1px -1px;
}
.easy-layout-page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 300px;
  height: 100%;
}

svg {
  margin: auto;
  overflow: visible;
  transform: scalex(0.9);
}

.g-polygon-wrap,
.g-polygon-move {
  fill: none;
  stroke: #6feffa;
  stroke-width: 1;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.g-polygon-move {
  transform-origin: center center;
  transform: scale(1.05);
  stroke: linear-gradinet(180deg, #6feffa, transprent);
  stroke-width: 1.5;
  stroke-dasharray: 280, 700;
  stroke-dashoffset: 8;
  animation: move 2.4s infinite linear;
}

</style>

<style>

@keyframes move {
  0% {
    stroke-dashoffset: 8;
  }
  100% {
    stroke-dashoffset: -972;
  }
}
</style>
