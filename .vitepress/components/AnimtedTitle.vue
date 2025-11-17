<template>
  <div class="title-container flex flex-col justify-center gap-2xl cursor-pointer select-none">
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
      <h3 :tooltip="slogon" class="text-slogon justify-center lg:justify-start">{{ slogon }}</h3>
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
  position: relative;
}
.text-slogon::before {
  content: attr(tooltip);
  color: #000;
  font-weight: bolder;
  position: absolute;
  left: 0;
  z-index: -1;
  filter: blur(1px);
  transform: translateX(8px) translateY(2px) scaleY(0.6) skew(160deg);
  mask: linear-gradient(transparent, #000);
}

.bottomContentItem {
  display: flex;
  background-color: #404040;
  width: 50%;
  height: 240px;
  margin: 30px 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 40px;
  color: #FFFFFF;
  position: relative;
  overflow: hidden;

  .main-title {
    font-size: 3rem;
    font-weight: bolder;
    letter-spacing: 0.2rem;
    opacity: 0;
    transform-origin: center;
    transform: scaleX(0);
    transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.8s ease;
    z-index: 1;
  }

  .sub-title {
    font-size: 1.5rem;
    opacity: 0;
    transform: translateY(20px);
    transition: all 1s cubic-bezier(0.23, 1, 0.32, 1);
    transition-delay: 0.3s;
    z-index: 1;
  }

  &::before {
    content: '';
    position: absolute;
    width: 120%;
    height: 3.125rem;
    background: linear-gradient(45deg, rgba(255, 213, 135, .9215686275), rgba(251, 0, 0, .2392156863));
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: effect-btn-borderflow-rotation 6s linear infinite;
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    top: 1px;
    left: 1px;
    z-index: 0;
    background-color: #404040;
  }
}
</style>
