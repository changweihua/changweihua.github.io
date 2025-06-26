<template>
  <div class="svg-container my-10 z-10">
    <!-- 外层容器 -->
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
      <g ref="gRef" transform="translate(200,200)">
        <!-- 后添加悬停区域（确保在最上层） -->
        <circle class="hover-area" r="160" fill="transparent" />

        <!-- 旋转动画 -->
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          begin="mouseover"
          end="mouseout"
          dur="8s"
          repeatCount="indefinite"
          additive="sum"
        />
      </g>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, useTemplateRef } from "vue";

const gRef = useTemplateRef<SVGGElement>("gRef");

// 配置参数
const config = {
  viewBoxSize: 400, // 对应viewBox尺寸
  radiusRatio: 0.28, // 半径比例（150/400）
  startAngle: -90, // 起始角度（顶部开始）
};

onMounted(function () {
  console.log("HeroImage onMounted", gRef.value);
  if (!gRef.value) {
    return;
  }

  const textGroup = gRef.value;
  const brand = "CMONO.NET Go! ";
  const radius = config.viewBoxSize * config.radiusRatio;
  const texts = brand.split("");

  // 生成文字元素
  texts.forEach((text, i) => {
    const angle = (i * 360) / texts.length + config.startAngle;
    const radian = (angle * Math.PI) / 180;

    // 计算坐标
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);

    // 创建文字元素
    const textEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    textEl.setAttribute("text-anchor", "middle");
    textEl.setAttribute("dominant-baseline", "central");
    textEl.setAttribute(
      "transform",
      `
        translate(${x.toFixed(2)}, ${y.toFixed(2)})
        rotate(${angle + 90})
      `
    );
    textEl.textContent = text;

    textGroup.prepend(textEl);
  });
});
</script>

<style scoped>
.svg-container {
  width: 100%;
  max-width: 180px;
  cursor: pointer;
}

.svg-container::before {
  content: "";
  display: block;
  padding-top: 100%;
}

svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 3em;
  fill: var(--vp-c-brand);
}

text {
  font-size: 16px;
  cursor: pointer;
  fill: var(--vp-c-brand);
  transition: fill 0.3s;
}

text:hover {
  fill: #2196f3;
}
</style>
