<template>
  <div class="ai-bot">
    <div class="head">
      <div class="face">
        <div class="eyes"></div>
        <div class="mouth"></div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ai-bot {
  --surface: #111;
  --c: white;
  --c2: #9ae3dc;
  --c3: magenta;

  scale: 4.2;
  width: 34px;
  aspect-ratio: 1;
  position: relative;
  display: grid;
  place-items: center;
  animation: move-head 4.2s linear infinite;
}

.ai-bot .head {
  background: linear-gradient(
    var(--c) 80%,
    color-mix(in srgb, var(--c), black 30%),
    var(--c)
  );
  border-radius: 0.375rem;
  position: absolute;
  width: 28px;
  height: 20px;
}

.ai-bot .head:before,
.ai-bot .head:after {
  content: "";
  position: absolute;
  left: -4px;
  top: 6px;
  width: 2px;
  height: 8px;
  background: var(--c, 1);
  border-radius: 2px 0 0 2px;
  scale: 1 1;
}

.ai-bot .head:after {
  right: -4px;
  left: unset;
  border-radius: 0 2px 2px 0;
}

.ai-bot .face {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  inset: 0 3px;
  background: var(--surface);
  translate: 0 0;
  border-radius: 4px;
  padding: 4px 4px 2px 4px;
  gap: 3px;
}

.ai-bot .face:before {
  content: "";
  background: var(--c);
  position: absolute;
  height: 1px;
  width: 10px;
  top: -2px;
  border-radius: 2px 2px 0 0;
  mask: radial-gradient(circle at 50% 100%, transparent 45%, black 45%);
}

.ai-bot .eyes {
  display: flex;
  height: 8px;
  gap: 6px;
  animation: blink 2.4s ease infinite;
}

.ai-bot .eyes:before,
.ai-bot .eyes:after {
  content: "";
  width: 5px;
  height: 8px;
  scale: 1 1;
  filter: drop-shadow(0 0 2px var(--c2));
  background: repeating-linear-gradient(
      to bottom,
      var(--c),
      var(--c) 0.25px,
      transparent 0.25px,
      transparent 0.6px
    ),
    linear-gradient(to bottom, var(--c3), transparent 60%), var(--c2);
  border-radius: 1px;
  translate: 0 0;
}

.ai-bot .eyes:after {
  scale: 1 1;
  translate: 0 0;
}

.ai-bot .mouth {
  width: 10px;
  height: 2px;
  background: var(--c2);
  border-radius: 0 0 1px 1px;
  filter: drop-shadow(0 0 2px var(--c2));
  scale: 1 1;
  animation: mouth 1.2s ease-in infinite;
}

@keyframes blink {
  0%,
  10%,
  100% {
    transform: scaleY(1);
  }

  2% {
    transform: scaleY(0.2);
  }

  8% {
    transform: scaleY(0.1);
  }
}

@keyframes mouth {
  0%,
  30%,
  70%,
  100% {
    transform: scaleY(1) scaleX(1);
  }

  20% {
    transform: scaleY(0.5);
  }

  60% {
    transform: scaleX(0.7);
  }
}

@keyframes move-head {
  0%,
  20%,
  40%,
  100% {
    transform: translateX(0);
  }

  10% {
    transform: translateX(20%);
  }

  30% {
    transform: translateX(-20%);
  }
}

* {
  box-sizing: border-box;
}

body {
  display: grid;
  place-items: center;
  height: 100dvh;
  background: var(--surface);
}
</style>
