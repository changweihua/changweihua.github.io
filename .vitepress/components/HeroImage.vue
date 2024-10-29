<template>
  <Suspense timeout="3000" :onPending="handleMainContentPending" :onResolve="handleMainContentResolve">
    <template #default>
      <Suspense :onPending="handleComponentAPending" :onResolve="handleComponentAResolve">
        <template #default>
          <WithSuspense :time="3000">
            <div class="hero-image-container">
              <svg class="text-ring" width="100%" height="100%" viewBox="-256 -256 1536 1536">
                <defs>
                  <!-- 网格 -->
                  <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path fill="none" stroke="#f1f1f1" d="M 0 0 H 20 V 20" />
                  </pattern>
                  <path id="circle" d="M .5,512 a 512,512 0 1,1 1024,0 512,512 0 1,1 -1024,0" />
                  <animateMotion xlink:href="#myText" dur="5s" repeatCount="indefinite" rotate="auto"
                    path="M .5,512 a 512,512 0 1,1 1024,0 512,512 0 1,1 -1024,0">
                  </animateMotion>
                </defs>
                <!-- 绘制网格 -->
                <rect width="1000" height="1000" fill="url(#grid)" />
                <!-- id="myText" -->
                <text width="100%" style="letter-spacing:3;" lengthAdjust="spacingAndGlyphs" font-stretch="expanded">
                  <textPath alignment-baseline="baseline" startOffset="0" textLength="3000" xlink:href="#circle"
                    class="text">
                    <tspan font-size="30px">𝓒𝓜𝓞𝓝𝓞.𝓝𝓔𝓣</tspan>
                    <animate attributeName="fill" from="blue" to="red" dur="3s" repeatCount="indefinite"></animate>
                    <animate attributeName="fill-opacity" from="0.01" to="0.99" dur="3s" repeatCount="indefinite">
                    </animate>
                    <!-- <animate attributeName="startOffset" from="0" to="3150" dur="6s" repeatCount="indefinite">
                    </animate> -->
                  </textPath>
                </text>
              </svg>
            </div>
          </WithSuspense>
        </template>
        <template #fallback>
          <div>
            <CubicLoading />
          </div>
        </template>
      </Suspense>
    </template>
    <template #fallback>
      <div>
        <CubicLoading />
      </div>
    </template>
  </Suspense>
</template>

<script lang="ts" setup>
import CubicLoading from "./CubicLoading.vue";
import WithSuspense from "./WithSuspense.vue";

const handleMainContentPending = () => {
  console.log("开始加载主内容...");
};
const handleMainContentResolve = () => {
  console.log("主内容加载完成！");
};
const handleComponentAPending = () => {
  console.log("加载组件 A...");
};
const handleComponentAResolve = () => {
  console.log("组件 A 加载完成！");
};
</script>

<style lang="less" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.hero-image-container {
  width: 260px;
  height: 260px;
  display: grid;
  place-content: center;
}

text {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 4rem;
}
</style>
