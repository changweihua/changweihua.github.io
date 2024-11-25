<template>
  <div class="box">
    <div class="number" ref="number">
      <div class="left" ref="left"></div>
      <div class="separator" ref="separator">,</div>
      <div class="right" ref="right">0</div>
    </div>
  </div>

  <svg class="svgFilter" xmlns="http://www.w3.org/2000/svg" version="1.1">
    <defs>
      <filter id="blurFilter">
        <feGaussianBlur
          id="blurFilterItem"
          in="SourceGraphic"
          stdDeviation="13,0"
        />
      </filter>
    </defs>
  </svg>
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef, nextTick, withDefaults } from "vue";

const numberRef = useTemplateRef<HTMLDivElement>("number");
const leftRef = useTemplateRef<HTMLDivElement>("left");
const rightRef = useTemplateRef<HTMLDivElement>("right");
const separatorRef = useTemplateRef<HTMLDivElement>("separator");

// 使用 withDefaults 来为 props 设置默认值
const props = withDefaults(defineProps<{
  message?: string;
  target?: number;
}>(), {
  message: 'Hello, DacingNumber!',
  target: 1000000
});

let current = 0;
const step = 42;
let thousends: number[] = []

const start = () => {
  rightRef.value.classList.add("animate");
  update();
};

const updateValues = () => {
  const [first, ...rest] = current.toLocaleString("en-US").split(",").reverse();
  thousends = rest.reverse();

  const thousendsString = thousends.join("");
  if (+leftRef.value.innerText != thousendsString) {
    leftRef.value.classList.add("animate");
  } else {
    leftRef.value.classList.remove("animate");
  }
  leftRef.value.innerText = thousendsString;
  rightRef.value.innerText = first;
};

const update = () => {
  if (props.target - current > 0) {
    current += step;
  } else {
    current -= step;
  }
  if (current >= 1000) {
    separatorRef.value.classList.add("show");
  } else {
    separatorRef.value.classList.remove("show");
  }
  updateValues();
  if (Math.abs(props.target - current) > step) {
    requestAnimationFrame(update);
  } else {
    requestAnimationFrame(() => {
      current = props.target;
      updateValues();
      leftRef.value.classList.remove("animate");
      rightRef.value.classList.remove("animate");
    });
  }
};

onMounted(() => {
  nextTick(function () {
    requestAnimationFrame(start);
  });
});
</script>

<style lang="less" scoped>
.number {
  display: flex;
  align-items: center;
  font-size: 1rem;
  justify-content: flex-end;

  .animate {
    filter: url("#blurFilter");
  }

  .left,
  .right {
    text-align: right;
  }

  .right {
    padding-right: 0;
  }

  .separator {
    margin: 0 3px;
    opacity: 0;
    transition: opacity 0.1s ease;

    &.show {
      opacity: 1;
    }
  }
}

.svgFilter {
  display: block;
  width: 0;
  height: 0;
}

.box {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.container {
  display: grid;
  place-items: center;
  background: #ffc107;
  font-style: italic;
  font-weight: bold;
}

:root {
  --labs-sys-color-on-background: black;
}
</style>
