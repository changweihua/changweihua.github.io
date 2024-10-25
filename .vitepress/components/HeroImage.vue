<template>
  <Suspense timeout="3000" :onPending="handleMainContentPending" :onResolve="handleMainContentResolve">
    <template #default>
      <Suspense :onPending="handleComponentAPending" :onResolve="handleComponentAResolve">
        <template #default>
          <WithSuspense :time="3000">
            <div class="hero-image-container">
              <svg class="text-ring" width="100%" height="100%" viewBox="-256 -256 1536 1536">
                <defs>
                  <path id="circle" d=" M .5,512 a 512,512 0 1,1 1024,0 512,512 0 1,1 -1024,0 " />
                </defs>
                <text width="100%" lengthAdjust="spacingAndGlyphs" font-stretch="expanded">
                  <textPath alignment-baseline="baseline" textLength="3216" xlink:href="#circle" class="text">
                    𝓒𝓜𝓞𝓝𝓞.𝓝𝓔𝓣&nbsp;
                  </textPath>
                </text>
              </svg>
            </div>
          </WithSuspense>
        </template>
        <template #fallback>
          <div><CubicLoading /></div>
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
