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
  <div id="VSTPL" class="visits-panel w-full">
      <section class="grid">
        <!-- Vercount用法 -->
        <div class="total-text text" id="vercount_container_site_pv" style="display: none">
          <div>本站访客数</div>
          <span id="vercount_value_site_pv" class="font-bold">--</span>次
        </div>
        <DancingLogo />
        <div class="user-text text" id="vercount_container_site_uv" style="display: none">
          <div>本站总访问量</div>
          <span id="vercount_value_site_uv" class="font-bold">--</span>人次
        </div>
      </section>
    </div>
</template>

<style lang="scss" scoped>
.panel {
  margin-top: 12px;
  margin-bottom: 8px;
}

.visits-panel {
  z-index: var(--vp-z-index-footer);
  // background-color: var(--vp-c-bg);
  color: var(--vp-c-text-2);
}

.item-bg {
  position: absolute;
  background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  border-radius: 50%;
  filter: blur(72px);
  z-index: -1;
  animation: pulse 4s cubic-bezier(0, 0, 0, 0.5) infinite;
}
.container {
  background-color: var(--vp-c-bg);
  border-radius: 8px;
  width: 100%;
  min-height: 32px;
}

.grid {
  font-weight: 500;
  padding: 12px;
  justify-content: space-evenly;
  align-items: center;
  //grid-template-columns: repeat(3, minmax(0, 1fr));
  //display: grid;
  display: flex;
}

.text {
  font-size: 0.875rem;
  line-height: 1.25rem;

  * {
    font-family: #{vars.$app-font-family};
  }
}

@media (max-width: 640px) {
  .dacing-figure {
    display: none;
  }
}
</style>
<style>
@keyframes pulse {
  50% {
    transform: scale(1.5);
  }
}
</style>
