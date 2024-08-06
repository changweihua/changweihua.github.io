<script setup lang="ts">
import { nextTick, onMounted } from "vue";
import gsap from "gsap";
import _ from "lodash";

// get other plugins:
// import ScrollTrigger from "gsap/ScrollTrigger";
// import Flip from "gsap/Flip";
// import Draggable from "gsap/Draggable";

// or all tools are exported from the "all" file (excluding members-only plugins):
// import { gsap, ScrollTrigger, Draggable, MotionPathPlugin } from "gsap/all";
// import { Draggable, MotionPathPlugin } from "gsap/all";

// don't forget to register plugins
// gsap.registerPlugin(ScrollTrigger, Draggable, Flip, MotionPathPlugin);

defineProps({
  name: {
    type: String,
    value: "Animation Title",
  },
  text: {
    type: String,
  },
  tagline: {
    type: String,
  },
});

onMounted(() => {
  nextTick(() => {
    _.delay(() => {
      const t = gsap.timeline({});
      // t.to(".char", {
      //   opacity: 1,
      //   delay: 0.1,
      //   duration: 0.5,
      //   y: 0,
      //   ease: "Power4.inOut",
      //   stagger: 0.1,
      //   repeat: -1,
      //   repeatDelay: 2,
      //   yoyo: true,
      // });
    }, 3 * 1000);
  });
});
</script>

<template>
  <div class="border-around">
    <h1 v-if="name" class="name title">
      <span class="clip active-menu ">{{ name }}</span>
    </h1>
    <p v-if="text" class="text contrast">{{ text }}</p>
    <!-- <p v-if="tagline" class="tagline">
    {{ tagline }}
  </p> -->
    <div class="tagline">
      <template v-for="tag in tagline">
        <div class="char">{{ tag }}</div>
      </template>
    </div>
  </div>
</template>

<style lang="less" scoped>
.name {
  background: -webkit-linear-gradient(315deg,
      rgb(210, 86, 53) 10%,
      #647eff 50%,
      rgb(238, 224, 112) 90%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  background-size: 400% 400%;
  animation: gradient 5s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.name,
.text {
  max-width: 392px;
  letter-spacing: -0.4px;
  line-height: 40px;
  font-size: 32px;
  font-weight: 700;
  white-space: pre-wrap;
}

@media (min-width: 640px) {

  .name,
  .text {
    max-width: 576px;
    line-height: 56px;
    font-size: 48px;
  }
}

@media (min-width: 960px) {

  .name,
  .text {
    line-height: 64px;
    font-size: 56px;
  }
}

.tagline {
  padding-top: 8px;
  max-width: 392px;
  line-height: 28px;
  font-size: 18px;
  font-weight: 500;
  white-space: pre-wrap;
  color: var(--vp-c-text-2);
  position: relative;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

@media (min-width: 640px) {
  .tagline {
    padding-top: 12px;
    max-width: 576px;
    line-height: 32px;
    font-size: 20px;
  }
}

@media (min-width: 960px) {
  .tagline {
    line-height: 36px;
    font-size: 24px;
  }
}

.content {
  font-weight: bold;
  font-size: 24px;
  /* font-size: 5rem; */
  position: relative;
  /* color: white; */
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}

.char {
  display: inline-block;
  margin-right: 6px;
  opacity: 0.3;
  transform: translateY(-150px);
  transition: transform 0.3s ease-in-out;
}

.contrast {
  display: inline-block;
  position: relative;
  background: var(--vp-c-white);
  color: var(--vp-c-black);
  padding: 3px 12px;
  border: 1px solid var(--vp-c-black);
  box-sizing: border-box;
  cursor: pointer;
}

.contrast::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background: var(--vp-c-white);
  mix-blend-mode: difference;
  transition: all 1s ease-in-out;
}

.contrast:hover::after {
  width: 100%;
}

.dark {
  .contrast {
    background: var(--vp-c-bg);
    color: var(--vp-c-white);
    border: 1px solid var(--vp-c-white);
  }

  .contrast::after {
    background: var(--vp-c-white);
  }
}

.border-around {
  display: inline-block;
  position: relative;
  padding: 6px;
  border: none;
}

.border-around:hover {
  cursor: pointer;
}

.border-around::before,
.border-around::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 2px solid transparent;
  box-sizing: border-box;
}

.border-around::before {
  top: 0;
  left: 0;
}

.border-around::after {
  bottom: 0;
  right: 0;
}

.border-around:hover::before,
.border-around:hover::after {
  width: 100%;
  height: 100%;
}

.border-around:hover::before {
  border-top: 2px solid blue;
  border-right: 2px solid blue;
  transition: width 0.3s ease-out, height 0.3s ease-out 0.3s;
}

.border-around:hover::after {
  border-bottom: 2px solid blue;
  border-left: 2px solid blue;
  transition: border-color 0s ease-out 0.6s, width 0.3s ease-out 0.6s, height 0.3s ease-out 0.9s;
}
</style>
