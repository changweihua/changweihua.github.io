<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { nextTick, provide, useSlots } from 'vue'
// import DocAfter from "../components/DocAfter.vue";
// import AnimationTitle from "../components/AnimationTitle.vue";
// import Recommend from "../components/Recommend.vue";
// import NotFound from "../components/NotFound.vue";
// import PageFooter from "../components/PageFooter.vue";

const { isDark } = useData()
const slots = Object.keys(useSlots())
const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

provide('toggle-appearance', async ({ clientX: x, clientY: y }: MouseEvent) => {

  console.log(`切换至 ${isDark.value}`);

  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
    }
  )
})

// v-slot:default="slotProps"
</script>

<template>
  <DefaultTheme.Layout>
    <template v-for="(slotKey, slotIndex) in slots" :key="slotIndex" v-slot:[slotKey]>
      <slot :name="slotKey"></slot>
    </template>
    <!-- <template #doc-after>
      <DocAfter />
    </template>
<template #doc-bottom>
      <Recommend />
    </template>
<template #not-found>
      <NotFound />
    </template>
<template #layout-bottom>
      <PageFooter />
    </template>
<template #home-hero-info>
      <AnimationTitle name="CMONO.NET" text="知识汪洋只此一瓢" tagline="伪前端+伪后端+伪需求=真全栈" />
    </template>
<template #home-hero-image>
      <div
        style="position: relative;width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;">
        <img src="/cwh.svg" class="VPImage image-src">
      </div>
    </template> -->
  </DefaultTheme.Layout>
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>
