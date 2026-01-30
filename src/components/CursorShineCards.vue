<template>
  <div
    class="cards-container w-full grid grid-cols-1 gap-4 px-1 md:px-8 py-8 md:grid-cols-2 xl:grid-cols-3 "
    ref="cardsRef"
  >
    <div
      v-for="(item, index) in categories"
      v-memo="[item]"
      :class="`animate__animated animate__fadeIn animate__delay-${
        index * 2
      } card rounded-2xl! animate-fade-in animate-duration-500 transform-gpu`"
      :key="index"
      :ref="e => setCardListRef(e as unknown as HTMLElement)"
    >
      <div class="card-content rounded-2xl! md:px-12 lg:px-8 px-6">
        <slot :item="item" :index="index">
          <div class="card-info w-full flex flex-col justify-center">
            <a
              :href="item.link"
              class="card-link flex flex-row gap-5 md:gap-10"
            >
              <p class="description flex flex-col gap-3">
                <span
                  class="title"
                  v-html="
                    DOMPurify.sanitize(`${marked.parseInline(item.title)}`)
                  "
                ></span
                ><span>{{ item.description }}</span>
              </p>
              <div class="logo">
                <img
                  class="rounded-sm object-cover transition-transform duration-500 group-hover:scale-105"
                  crossorigin="anonymous"
                  :src="`${item.cover || '/logo.png'}`"
                  :alt="item.coverAlt"
                />
              </div>
            </a>

            <div class="points_wrapper">
              <i class="point"></i>
              <i class="point"></i>
              <i class="point"></i>
              <i class="point"></i>
              <i class="point"></i>
              <i class="point"></i>
              <i class="point"></i>
              <i class="point"></i>
              <i class="point"></i>
              <i class="point"></i>
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, PropType, ref, useTemplateRef } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

defineOptions({
  name: "CursorShineCards",
});

interface CategoryItem {
  title: string;
  link: string;
  icon: string;
  description?: string;
  cover?: string;
  coverAlt?: string;
}

defineProps({
  data2: {
    type: Array as PropType<Record<string, any>[]>,
    default: [],
  },
  categories: Array<CategoryItem>,
  color: {
    type: String,
    default: "rgba(0,193,106, 1)",
  },
});
const cardsRef = useTemplateRef<HTMLDivElement>('cardsRef');
const cardListRef = ref<Array<HTMLElement>>([]);
const setCardListRef = (e: HTMLElement) => {
  if (e) {
    cardListRef.value.push(e);
  }
};
function initCardMouseEvt() {
  if (cardsRef.value) {
    cardsRef.value.addEventListener("mousemove", handleCardElMouseProperty);
  }
}
onMounted(() => {
  initCardMouseEvt();
});
onUnmounted(() => {
  if (cardsRef.value) {
    cardsRef.value.removeEventListener("mousemove", handleCardElMouseProperty);
  }
});
function handleCardElMouseProperty(e) {
  if (!cardListRef.value.length) return;
  for (const card of cardListRef.value) {
    const rect = card.getBoundingClientRect(),
      x = e.clientX - rect.left,
      y = e.clientY - rect.top;
    card!.style.setProperty("--x", `${x}px`);
    card!.style.setProperty("--y", `${y}px`);
    // card!.style.setProperty("--fl-color", props.color);
    card!.style.setProperty("--fl-color", "var(--vp-c-brand)");
  }
}
</script>
<style>
:root {
  --fl-color: rgba(239, 68, 68, 1);
  --card-bg-color: var(--vp-c-bg-soft);
}
</style>
<style lang="scss" scoped>
.cards-container {
  /* 只用定义 4 个基础品牌色 */
  --brand-primary: oklch(0.55 0.2 265);
  --brand-success: oklch(0.65 0.18 145);
  --brand-error: oklch(0.6 0.25 25);
  --brand-warning: oklch(0.75 0.15 85);
  // font-family: #{vars.$app-font-family};
  //   // display: flex;
  //   // flex-wrap: wrap;
  //   // gap: 8px;
  //   // max-width: 916px;
  //   // width: calc(100% - 20px);
  //   // background-color: var(--card-bg-color);

  /* Primary 色系 - 全部从基色派生 */
  --primary: var(--brand-primary);
  --primary-hover: oklch(from var(--brand-primary) calc(l - 0.1) c h);
  --primary-active: oklch(from var(--brand-primary) calc(l - 0.15) c h);
  --primary-light: oklch(
    from var(--brand-primary) calc(l + 0.2) calc(c * 0.5) h
  );
  --primary-lighter: oklch(
    from var(--brand-primary) calc(l + 0.3) calc(c * 0.3) h
  );
  --primary-alpha-10: oklch(from var(--brand-primary) l c h / 0.1);
  --primary-alpha-20: oklch(from var(--brand-primary) l c h / 0.2);

  /* 其他色系采用相同模式 */
  --success: var(--brand-success);
  --success-hover: oklch(from var(--brand-success) calc(l - 0.1) c h);
  --success-light: oklch(
    from var(--brand-success) calc(l + 0.2) calc(c * 0.5) h
  );

  [data-animate] {
    --stagger: 0;
    --delay: 120ms;
    --start: 0ms;
  }

  @media (prefers-reduced-motion: no-preference) {
    [data-animate] {
      animation: enter 0.6s both;
      animation-delay: calc(var(--stagger) * var(--delay) + var(--start));
    }
  }

  .card {
    --stagger: calc((sibling-index() - 1) * 0.1s);
    transition: opacity 1s var(--ease-3) var(--stagger),
      translate 1s var(--ease-spring-3) var(--stagger);

    /* enter from stage left */
    @starting-style {
      opacity: 0;
      translate: -100px 0;
    }
  }
  .cards-container:hover > .card::after {
    opacity: 1;
  }

  .description {
    word-break: break-all;
    word-wrap: break-word;
  }

  .card {
    cursor: pointer;
    display: flex;
    min-height: 120px;
    height: auto;
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
    isolation: isolate;
    // box-shadow: 0 0 0 0px var(--vp-c-bg-soft), 0 0 0 1px var(--vp-c-bg-soft),
    //   0 0 #0000;

    --card-bg: var(--primary);
    background: var(--vp-c-bg);
    /* 文本亮度比背景高 0.6，确保对比度 */
    color: oklch(from var(--vp-c-bg) calc(l + 0.6) c h);
    box-shadow: 0 4px 6px oklch(from var(--vp-c-bg) l c h / 0.2),
      0 10px 15px oklch(from var(--vp-c-bg) l c h / 0.15);
  }

  .card:hover::before {
    opacity: 1;
  }

  .card::before {
    border-radius: inherit;
    content: "";
    height: calc(100% + 4px);
    position: absolute;
    width: calc(100% + 4px);
    display: block;
    inset: -2px;
    z-index: -1;
    background: radial-gradient(
      500px circle at var(--x) var(--y),
      var(--fl-color),
      transparent 40%
    );
    will-change: background;
  }
  .card-content {
    flex: 1 1 0%;
    overflow: hidden;
    transition-duration: 0.15s;
    background-color: var(--card-bg-color);
    opacity: 1;
    transition-property: background-opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 10px;
    align-items: center;
    display: flex;
    flex-grow: 1;
    justify-content: flex-start;
  }
  .card-content:hover {
    opacity: 0.9;
  }
  .card-content.view-border {
    position: relative;
    z-index: -1;
  }
  i {
    color: rgb(240, 240, 240);
  }

  .card-info {
    position: relative;
    height: 120px;
    // background-color: var(--vp-c-bg-soft);
    border-radius: 8px;
    transition: color 0.5s, background-color 0.5s;

    .title {
      text-wrap: balance;
    }
  }

  /* 链接样式 */
  .card-info a {
    display: flex;
    align-items: center;
  }

  /* 描述链接文字 */
  .card-info .description {
    flex: 1;
    font-weight: 500;
    font-size: 16px;
    line-height: 25px;
    color: var(--vp-c-text-1);
    margin: 0 0 0 16px;
    transition: color 0.5s;
  }

  /* 描述链接文字2 */
  .card-info .description span {
    font-size: 14px;
  }

  /* logo图片 */
  .card-info .logo img {
    width: 80px;
    object-fit: contain;
  }

  .points_wrapper {
    overflow: hidden;
    width: 100%;
    height: 100%;
    pointer-events: none;
    position: absolute;
    z-index: 1;
  }

  .points_wrapper .point {
    bottom: -10px;
    position: absolute;
    animation: floating-points infinite ease-in-out;
    pointer-events: none;
    width: 3px;
    height: 3px;
    background: radial-gradient(
        65.28% 65.28% at 50% 100%,
        rgba(223, 113, 255, 0.8) 0%,
        rgba(223, 113, 255, 0) 100%
      ),
      linear-gradient(0deg, #7a5af8, #7a5af8);
    border-radius: 9999px;
  }

  .points_wrapper .point:nth-child(1) {
    left: 10%;
    opacity: 1;
    animation-duration: 2.35s;
    animation-delay: 0.2s;
  }

  .points_wrapper .point:nth-child(2) {
    left: 30%;
    opacity: 0.7;
    animation-duration: 2.5s;
    animation-delay: 0.5s;
  }

  .points_wrapper .point:nth-child(3) {
    left: 25%;
    opacity: 0.8;
    animation-duration: 2.2s;
    animation-delay: 0.1s;
  }

  .points_wrapper .point:nth-child(4) {
    left: 44%;
    opacity: 0.6;
    animation-duration: 2.05s;
  }

  .points_wrapper .point:nth-child(5) {
    left: 50%;
    opacity: 1;
    animation-duration: 1.9s;
  }

  .points_wrapper .point:nth-child(6) {
    left: 75%;
    opacity: 0.5;
    animation-duration: 1.5s;
    animation-delay: 1.5s;
  }

  .points_wrapper .point:nth-child(7) {
    left: 86%;
    opacity: 0.9;
    animation-duration: 2.2s;
    animation-delay: 0.2s;
  }

  .points_wrapper .point:nth-child(8) {
    left: 58%;
    opacity: 0.8;
    animation-duration: 2.25s;
    animation-delay: 0.2s;
  }

  .points_wrapper .point:nth-child(9) {
    left: 94%;
    opacity: 0.6;
    animation-duration: 2.6s;
    animation-delay: 0.1s;
  }

  .points_wrapper .point:nth-child(10) {
    left: 65%;
    opacity: 1;
    animation-duration: 2.5s;
    animation-delay: 0.2s;
  }
}
</style>
<style>
@keyframes floating-points {
  0% {
    transform: translateY(0);
  }

  85% {
    opacity: 0;
  }

  100% {
    transform: translateY(-55px);
    opacity: 0;
  }
}
</style>
