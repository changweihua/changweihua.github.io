<template>
  <div class="title-container flex flex-col justify-center gap-4xl">
    <div class="large grid centered square-grid">
      <h2 class="text-xl font-bold text-shadow-xl">{{ name }}</h2>
    </div>
    <div class="flex flex-row">
      <p class="text-xl">{{ slogon }}</p>
    </div>
    <div class="row"></div>
    <div class="text-xl flex flex-row">
      <div class="square" v-for="c in tagline">{{ c }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { animate, text, stagger } from "animejs";
import { onMounted } from "vue";

defineProps({
  name: {
    type: String,
    value: "Animated Title",
  },
  slogon: {
    type: String,
  },
  tagline: {
    type: String,
  },
});

onMounted(() => {
  const { words } = text.split("p", {
    words: { wrap: "clip" },
  });

  animate(words, {
    y: [{ to: ["100%", "0%"] }, { to: "-100%", delay: 750, ease: "in(3)" }],
    duration: 750,
    ease: "out(3)",
    delay: stagger(50),
    loop: true,
  });

  const { chars } = text.split("h2", { words: false, chars: true });

  animate(chars, {
    // Property keyframes
    y: [
      { to: "-2.75rem", ease: "outExpo", duration: 600 },
      { to: 0, ease: "outBounce", duration: 800, delay: 100 },
    ],
    // Property specific parameters
    rotate: {
      from: "-1turn",
      delay: 0,
    },
    delay: stagger(50),
    ease: "inOutCirc",
    loopDelay: 1000,
    loop: true,
  });

  animate(".square", {
    y: stagger(["-2.75rem", "2.75rem"]),
    rotate: { from: stagger("-.125turn") },
    loop: true,
    alternate: true,
  });
});
</script>

<style lang="scss">
.text-xl {
  font-size: 24px !important;
  color: currentColor;
  letter-spacing: 0.6em;
}
</style>
