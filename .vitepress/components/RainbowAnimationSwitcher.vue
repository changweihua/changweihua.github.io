<script lang="ts" setup>
import { useLocalStorage, useMediaQuery } from "@vueuse/core";
import { inBrowser } from "vitepress";
import { computed, watch } from "vue";
import RainbowSwitcher from "./RainbowSwitcher.vue";
import { Icon } from "@iconify/vue";

defineProps<{ text?: string; screenMenu?: boolean }>();

const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)").value;

const animated = useLocalStorage(
  "animate-rainbow",
  inBrowser ? !reduceMotion : true
);

function toggleRainbow() {
  animated.value = !animated.value;
}

// 在这里对动画做处理
watch(
  animated,
  (anim) => {
    document.documentElement.classList.remove("rainbow");
    if (anim) {
      document.documentElement.classList.add("rainbow");
    }
  },
  { immediate: inBrowser, flush: "post" }
);

const switchTitle = computed(() => {
  return animated.value
    ? "禁用动画"
    : "启用动画";
});
</script>

<template>
  <ClientOnly>
    <div class="group w-full" :class="{ mobile: screenMenu }">
      <div class="NavScreenRainbowAnimation">
        <p class="text mr-3">
          {{ text ?? "Rainbow Animation" }}
        </p>
        <RainbowSwitcher :title="switchTitle" class="RainbowAnimationSwitcher"
          :aria-checked="animated ? 'true' : 'false'" @click="toggleRainbow">
          <icon-solar-star-rainbow-bold v-if="animated" />
          <icon-solar-star-rainbow-linear v-else />
          <!-- <i class="solar:star-rainbow-bold animated flex self-center" v-if="animated" />
          <Icon icon="bxl:tiktok"  class="solar:star-rainbow-linear non-animated flex self-center" v-else /> -->
        </RainbowSwitcher>
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
.group {
  /* border-top: 1px solid var(--vp-c-divider); */
  /* padding-top: 10px; */
  margin-top: 1rem !important;
  width: 100%;
}

.NavScreenRainbowAnimation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  padding: 12px;
  background-color: var(--vp-c-bg-elv);
}

.text {
  line-height: 24px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.animated {
  opacity: 1;
}

.non-animated {
  opacity: 0;
}

.RainbowAnimationSwitcher[aria-checked="false"] .non-animated {
  opacity: 1;
}

.RainbowAnimationSwitcher[aria-checked="true"] .animated {
  opacity: 1;
}
</style>
