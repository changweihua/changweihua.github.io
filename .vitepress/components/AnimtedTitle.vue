<template>
  <div class="title-container flex flex-col justify-center gap-2xl">
    <div>
      <h2 class="text-name font-bold text-shadow-xl">{{ name }}</h2>
    </div>
    <!-- <div class="flex flex-col group transition-all duration-300
           hover:(scale-105 shadow-lg p-3)
           focus:(outline-none ring-2 ring-blue-500)
           disabled:(opacity-50 cursor-not-allowed)">
      <p class="text-slogon justify-center  lg:justify-start">{{ slogon }}</p>
    </div> -->
    <!-- <div
      class="flex flex-col group transition-all duration-300 hover:(ring-2) focus:(outline-none ring-2 ring-blue-500) disabled:(opacity-50 cursor-not-allowed)"
    >
      <p class="text-slogon justify-center lg:justify-start">{{ slogon }}</p>
    </div> -->
    <div class="flex flex-col group transition-all duration-300 disabled:(opacity-50 cursor-not-allowed)">
      <p class="text-slogon justify-center lg:justify-start">{{ slogon }}</p>
    </div>
    <div class="hidden md:flex text-tagline justify-center lg:justify-start text-center flex-row">
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
  const { words } = text.splitText("p", {
    words: { wrap: "clip" },
  });

  animate(words, {
    y: [{ to: ["50%", "0%"] }, { to: "-50%", delay: 750, ease: "in(3)" }],
    duration: 750,
    ease: "out(3)",
    delay: stagger(50),
    loop: true,
  });

  const { chars } = text.splitText("h2", { words: false, chars: true });

  animate(chars, {
    // Property keyframes
    y: [
      { to: "-1.25rem", ease: "outExpo", duration: 600 },
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
    y: stagger(["-1.75rem", "1.75rem"]),
    rotate: { from: stagger("-.125turn") },
    loop: true,
    alternate: true,
  });
});
</script>

<style lang="scss">
.text-tagline {
  font-size: 18px !important;
  color: currentColor;
  letter-spacing: 5px;
}
.text-name {
  font-size: 28px !important;
  font-weight: bold;
  color: currentColor;
  letter-spacing: 5px;
}
.text-slogon {
  font-size: 22px !important;
  font-weight: bold;
  color: currentColor;
  letter-spacing: 5px;
}
</style>
