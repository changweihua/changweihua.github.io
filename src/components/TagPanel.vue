<template>
  <div class="box-container">
    <div class="box">
      <h2>html</h2>
    </div>

    <div class="box">
      <h2>⚡</h2>
    </div>
    <div class="box">
      <h2>css</h2>
    </div>
  </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.box-container {
  min-height: 50vh;
  padding: 30px;
  background-color: var(--vp-bg);

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 50px;
}

@property --rotate {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.box {
  position: relative;
  width: 180px;
  height: 180px;

  background: repeating-conic-gradient(from var(--rotate),
      #ff2770 0%,
      #ff2770 5%,
      transparent 5%,
      transparent 40%,
      #ff2770 50%);
  border-radius: 20px;

  filter: drop-shadow(0 15px 50px #000);
  animation: rotating 2s linear infinite;
  animation-play-state: paused;
}

/** 为啥不起作用 */
.box:nth-child(1) {
  filter: drop-shadow(0 15px 50px #000) hue-rotate(225deg);
}

/** 为啥不起作用 */
.box:first-child {
  filter: drop-shadow(0 15px 50px #000) hue-rotate(225deg);
}

/** 这样也没效果 */
.box:nth-child(3) {
  filter: drop-shadow(0 15px 50px #000) hue-rotate(225deg);
}

/** 这样就有作用 */
.box:last-child {
  filter: drop-shadow(0 15px 50px #000) hue-rotate(310deg);
}

.box::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-conic-gradient(from var(--rotate),
      #45f3ff 0%,
      #45f3ff 5%,
      transparent 5%,
      transparent 40%,
      #45f3ff 50%);
  border-radius: 20px;
  animation: rotating 2s linear infinite;
  animation-delay: -0.5s;
  animation-play-state: paused;
}

.box:hover,
.box:hover::before {
  animation-play-state: running;
}

@keyframes rotating {
  0% {
    --rotate: 0deg;
  }

  100% {
    --rotate: 360deg;
  }
}

.box::after {
  content: "";
  position: absolute;
  inset: 6px;
  border: 8px solid #25252b;
  border-radius: 15px;
  background-color: #2d2d39;
}

.box h2 {
  position: absolute;
  inset: 40px;
  z-index: 10;

  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, .2);
  border-radius: 10px;

  color: #fff;
  font-size: 2.5em;
  font-weight: 500;
  text-transform: uppercase;
  box-shadow: inset 0 10px 20px rgba(0, 0, 0, .5);
  border-bottom: 2px solid rgba(255, 255, 255, .1);
}
</style>
