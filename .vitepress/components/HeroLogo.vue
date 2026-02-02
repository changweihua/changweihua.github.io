<template>
  <div
    class="z-10"
  >
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style="position: absolute; transform: scale(1)"
    >
      <path
        id="pathCurrent"
        d="M21.23 77.79A44 44 0 0 1 41.68 10.87"
        fill="none"
      ></path>
      <text font-size="3" letter-spacing="2">
        <textPath href="#pathCurrent">CMONO.NET</textPath>
      </text></svg
    ><svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      style="margin: 5px 0 0 16px"
    >
      <path
        id="path2009"
        d="M58.32 10.87A40 40 0 0 1 83.16 27.63"
        fill="none"
        stroke="var(--vp-c-brand-3)"
        stroke-width="16"
        stroke-linecap="round"
      ></path>
      <path
        id="path2013"
        d="M89.39 43.05A40 40 0 0 1 35.02 87.09"
        fill="none"
        stroke="var(--vp-c-brand-2)"
        stroke-width="16"
        stroke-dasharray="0"
        stroke-dashoffset="-2"
        stroke-linecap="round"
      ></path>
      <path
        id="path2025"
        d="M21.23 77.79A40 40 0 0 1 41.68 10.87"
        fill="none"
        stroke="var(--vp-c-brand-1)"
        stroke-width="16"
        stroke-linecap="round"
      ></path>
      <path
        id="pathFinish"
        d="M41.68 10.87a40 40 0 1 0 16.91 0.06"
        fill="none"
        stroke="var(--vp-c-brand-3)"
        stroke-width="4"
        stroke-linecap="round"
      ></path>
      <defs>
        <filter x="0" y="0" width="1" height="1" id="bg2009">
          <feFlood flood-color="var(--vp-c-brand-3)" result="bg2009"></feFlood>
          <feMerge>
            <feMergeNode in="bg2009"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
        <filter x="0" y="0" width="1" height="1" id="bg2013">
          <feFlood flood-color="var(--vp-c-brand-2)" result="bg2013"></feFlood>
          <feMerge>
            <feMergeNode in="bg2013"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
      </defs>
      <clipPath id="clip2009">
        <polygon points="50,4 81,10 72,25 56,8"></polygon>
      </clipPath>
      <text
        filter="url(#bg2009)"
        font-size="2"
        x="0"
        fill="var(--vp-c-brand)"
        transform="translate(-3, 2)"
        stroke="var(--vp-c-brand-3)"
        stroke-width="2"
        paint-order="stroke"
        clip-path="url(#clip2009)"
      >
        <textPath href="#path2009">2009</textPath>
      </text>
      <text
        filter="url(#bg2013)"
        font-size="2.2"
        x="0"
        fill="var(--vp-c-brand)"
        transform="translate(-3, 0)"
        stroke="var(--vp-c-brand-2)"
        stroke-width="2"
        paint-order="stroke"
      >
        <textPath href="#path2013">2013</textPath>
      </text>
      <text font-size="3" x="0" fill="white" transform="translate(3, 0)">
        <textPath href="#path2025">2025</textPath>
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
// import "hover-tilt/web-component";
// import 'hover-tilt'; // defines the custom element
// import 'hover-tilt/vue'; // pulls in GlobalComponents typings (type-only)

/* angle: 数值，逆时针旋转的角度 */
const pathTogether = function (angle: number) {
  const r = 40;
  // 总角度
  const totalAngle = 360;

  // x y 是圆弧的点坐标
  let x = 0;
  let y = 0;

  // 坐标计算
  if (angle < totalAngle / 4) {
    // 顺时针坐标计算
    x = 50 - r * Math.sin((2 * Math.PI * angle) / totalAngle);
    y = 50 - r * Math.cos((2 * Math.PI * angle) / totalAngle);
  } else if (angle < totalAngle / 2) {
    // 逆时针坐标计算
    x = 50 - r * Math.cos((2 * Math.PI * angle) / totalAngle - 0.5 * Math.PI);
    y = 50 + r * Math.sin((2 * Math.PI * angle) / totalAngle - 0.5 * Math.PI);
  } else if (angle < (totalAngle * 3) / 4) {
    // 顺时针坐标计算
    x = 50 + r * Math.sin((2 * Math.PI * angle) / totalAngle - Math.PI);
    y = 50 + r * Math.cos((2 * Math.PI * angle) / totalAngle - Math.PI);
  } else {
    // 逆时针坐标计算
    x = 50 + r * Math.cos((2 * Math.PI * angle) / totalAngle - 1.5 * Math.PI);
    y = 50 - r * Math.sin((2 * Math.PI * angle) / totalAngle - 1.5 * Math.PI);
  }

  // @ts-ignore
  return [x.toFixed(2) * 1, y.toFixed(2) * 1].join(" ");
};
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

#pathFinish {
  stroke-dashoffset: 400;
  stroke-dasharray: 400;
  animation: 2s dash both infinite;
}

</style>
