<script setup lang="ts">
import random from "random";
import { onMounted, ref } from "vue";

const siteVisitCount = ref(0);
const userVisitCount = ref(0);

onMounted(function () {
  siteVisitCount.value = random.int(10000, 50000);
  userVisitCount.value = random.int(5000, 10000);
});
</script>

<template>
  <div class="panel">
    <div class="container">
      <section class="grid">
        <span class="text">
          <a-space
            ><span>总访问</span> <DacingNumber :target="siteVisitCount" /><span
              >次</span
            >
          </a-space>
          <!-- <vue3-autocounter ref="siteVisitCounter" :startAmount="1000" :endAmount="siteVisitCount" :duration="3"
            prefix="总访问" suffix="次" separator="," decimalSeparator="." :decimals="0" :autoinit="true" /> -->
          <!-- <span id="busuanzi_value_site_pv" class="font-bold">--</span> 次 -->
        </span>
        <figure>
          <!-- <section class="item-bg"></section>
          <m-icon class="item" icon="svg-spinners:wind-toy" :width="32" :height="32" /> -->
          <DancingLogo />
        </figure>
        <span class="text">
          <a-space
            ><span>总访客</span> <DacingNumber :target="userVisitCount" /><span
              >次</span
            >
          </a-space>
          <!-- <vue3-autocounter ref="userVisitCounter" :startAmount="500" :endAmount="userVisitCount" :duration="3"
            prefix="总访客" suffix="次" separator="," decimalSeparator="." :decimals="0" :autoinit="true" /> -->
          <!-- <span id="busuanzi_value_site_uv" class="font-bold">--</span> 人次 -->
        </span>
      </section>
    </div>
  </div>
</template>

<style lang="less" scoped>
.panel {
  margin-top: 12px;
  margin-bottom: 8px;
}

.item-bg {
  position: absolute;
  background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  border-radius: 50%;
  filter: blur(72px);
  z-index: -1;
  animation: pulse 4s cubic-bezier(0, 0, 0, 0.5) infinite;
}

@keyframes pulse {
  50% {
    transform: scale(1.5);
  }
}

.container {
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  width: 100%;
  min-height: 32px;
  max-width: 1152px;
  margin-left: auto;
  margin-right: auto;
}

.grid {
  font-weight: 500;
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 12px;
  padding-right: 12px;
  justify-items: center;
  align-items: center;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  display: grid;
}

.text {
  * {
    font-family: @app-font-family;
  }
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
