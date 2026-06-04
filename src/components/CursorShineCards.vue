<template>
  <div
    class="cards-container w-full grid grid-cols-1 gap-4 px-1 md:px-8 py-8 md:grid-cols-2 xl:grid-cols-3"
    ref="cardsRef"
  >
    <div
      v-for="(item, index) in categories"
      :key="index"
      v-memo="[item]"
      :class="`animate__animated animate__fadeIn animate__delay-${index * 2} card rounded-2xl! animate-fade-in animate-duration-500 transform-gpu`"
      :ref="(e) => setCardListRef(e as unknown as HTMLElement)"
    >
      <div
        class="card-content rounded-2xl! md:px-12 lg:px-8 px-6"
        :data-file-hash="`${item.hash}`"
      >
        <slot :item="item" :index="index">
          <div class="card-info w-full flex flex-col justify-center">
            <a
              :href="item.link"
              v-hero="{ id: item.hash || useId() }"
              class="card-link flex flex-row gap-5 md:gap-10"
            >
              <p class="description flex flex-col gap-3">
                <span
                  class="title"
                  v-html="DOMPurify.sanitize(marked.parseInline(item.title) as string)"
                ></span>
                <span>{{ item.description }}</span>
              </p>
              <div class="logo">
                <!-- SVG 直接渲染 -->
                <img
                  v-if="isSVG(item.cover)"
                  class="rounded-sm object-cover transition-transform duration-500 group-hover:scale-105 svg-stroke svg-stroke-animation"
                  crossorigin="anonymous"
                  :src="item.cover || '/logo.png'"
                  :alt="item.coverAlt"
                />
                <!-- 非 SVG：响应式 picture -->
                <figure
                  v-else
                  class="rounded-sm object-cover transition-transform duration-500 group-hover:scale-105"
                >
                  <picture class="vp-picture">
                    <!-- 格式降级：AVIF → WebP → JXL → 原始格式 -->
                    <source
                      :srcset="buildSrcset(item.cover, 'avif')"
                      type="image/avif"
                      sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <source
                      :srcset="buildSrcset(item.cover, 'webp')"
                      type="image/webp"
                      sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <source
                      :srcset="buildSrcset(item.cover, 'jxl')"
                      type="image/jxl"
                      sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <!-- 兜底 <img>，同样带上原始格式的 srcset -->
                    <img
                      class="rounded-sm object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      :src="item.cover"
                      :srcset="buildSrcset(item.cover, getOriginalExt(item.cover))"
                      sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      :alt="item.coverAlt"
                    />
                  </picture>
                </figure>
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
import { onMounted, onUnmounted, ref, useTemplateRef, useId } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

defineOptions({
  name: 'CursorShineCards',
})

interface CategoryItem {
  title: string
  link: string
  hash: string
  icon: string
  description?: string
  cover?: string
  coverAlt?: string
}

defineProps({
  data2: {
    type: Array as PropType<Record<string, any>[]>,
    default: [],
  },
  categories: {
    type: Array as PropType<CategoryItem[]>,
    default: () => [],
  },
  color: {
    type: String,
    default: 'rgba(0,193,106, 1)',
  },
})

const cardsRef = useTemplateRef<HTMLDivElement>('cardsRef')
const cardListRef = ref<Array<HTMLElement>>([])
const setCardListRef = (e: HTMLElement) => {
  if (e) {
    cardListRef.value.push(e)
  }
}

// ==================== 响应式图片常量与工具 ====================
// 注意：以下宽度列表必须与图片转换脚本中的保持一致
const WIDTHS = [400, 800, 1200, 1600]

/**
 * 获取文件的基础路径（不含扩展名）
 * 如 '/images/photo.jpg' -> '/images/photo'
 */
function getBasePath(filePath: string): string {
  if (!filePath) return ''
  const lastDot = filePath.lastIndexOf('.')
  return lastDot > 0 ? filePath.substring(0, lastDot) : filePath
}

/**
 * 获取原始图片的扩展名（不含点号）
 * 如 'photo.jpg' -> 'jpg'
 */
function getOriginalExt(filePath: string): string {
  if (!filePath) return 'jpg'
  const ext = filePath.split('.').pop()
  return ext || 'jpg'
}

/**
 * 构建 srcset 属性值
 * @param filePath 原始图片路径，如 '/images/photo.jpg'
 * @param ext 目标格式扩展名，如 'webp'（不含点号）
 * @returns 如 '/images/photo-400w.webp 400w, /images/photo-800w.webp 800w, ...'
 */
function buildSrcset(filePath: string, ext: string): string {
  const base = getBasePath(filePath)
  return WIDTHS.map(w => `${base}-${w}w.${ext} ${w}w`).join(', ')
}

// ==================== 原有逻辑 ====================
function initCardMouseEvt() {
  cardsRef.value?.addEventListener('mousemove', handleCardElMouseProperty)
}

function isSVG(url: string | undefined): boolean {
  if (!url) return false
  return url.toLowerCase().endsWith('.svg') || url.includes('.svg?') || url.includes('data:image/svg+xml')
}

function handleCardElMouseProperty(e: MouseEvent) {
  if (!cardListRef.value.length) return
  for (const card of cardListRef.value) {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--x', `${x}px`)
    card.style.setProperty('--y', `${y}px`)
    card.style.setProperty('--fl-color', 'var(--vp-c-brand)')
  }
}

onMounted(() => {
  initCardMouseEvt()
})

onUnmounted(() => {
  cardsRef.value?.removeEventListener('mousemove', handleCardElMouseProperty)
})
</script>

<style>
:root {
  --fl-color: rgba(239, 68, 68, 1);
  --card-bg-color: var(--vp-c-bg-soft);
}
</style>

<style lang="scss" scoped>
.cards-container {
  --brand-primary: oklch(0.55 0.2 265);
  --brand-success: oklch(0.65 0.18 145);
  --brand-error: oklch(0.6 0.25 25);
  --brand-warning: oklch(0.75 0.15 85);

  --primary: var(--brand-primary);
  --primary-hover: oklch(from var(--brand-primary) calc(l - 0.1) c h);
  --primary-active: oklch(from var(--brand-primary) calc(l - 0.15) c h);
  --primary-light: oklch(from var(--brand-primary) calc(l + 0.2) calc(c * 0.5) h);
  --primary-lighter: oklch(from var(--brand-primary) calc(l + 0.3) calc(c * 0.3) h);
  --primary-alpha-10: oklch(from var(--brand-primary) l c h / 0.1);
  --primary-alpha-20: oklch(from var(--brand-primary) l c h / 0.2);

  --success: var(--brand-success);
  --success-hover: oklch(from var(--brand-success) calc(l - 0.1) c h);
  --success-light: oklch(from var(--brand-success) calc(l + 0.2) calc(c * 0.5) h);

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
    transition:
      opacity 1s var(--ease-3) var(--stagger),
      translate 1s var(--ease-spring-3) var(--stagger);

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
    --card-bg: var(--primary);
    background: var(--vp-c-bg);
    color: oklch(from var(--vp-c-bg) calc(l + 0.6) c h);
    box-shadow:
      0 4px 6px oklch(from var(--vp-c-bg) l c h / 0.2),
      0 10px 15px oklch(from var(--vp-c-bg) l c h / 0.15);
  }

  .card:hover::before {
    opacity: 1;
  }

  .card::before {
    border-radius: inherit;
    content: '';
    height: calc(100% + 4px);
    position: absolute;
    width: calc(100% + 4px);
    display: block;
    inset: -2px;
    z-index: -1;
    background: radial-gradient(500px circle at var(--x) var(--y), var(--fl-color), transparent 40%);
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

  .card-content::before {
    content: 'Hash: ' attr(data-file-hash);
    position: absolute;
    top: 0;
    right: 0;
    background: rgba(0, 150, 255, 0.1);
    color: #0969da;
    padding: 2px 6px;
    font-size: 11px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    border-radius: 3px;
    z-index: 10;
    transition: opacity 0.2s;
  }

  .card-content:hover::before {
    opacity: 1;
  }

  i {
    color: rgb(240, 240, 240);
  }

  .card-info {
    position: relative;
    height: 120px;
    border-radius: 8px;
    transition:
      color 0.5s,
      background-color 0.5s;
  }

  .card-link {
    display: flex;
    align-items: center;
  }

  .card-info .description {
    flex: 1;
    font-weight: 500;
    font-size: 16px;
    line-height: 25px;
    color: var(--vp-c-text-1);
    margin: 0 0 0 16px;
    transition: color 0.5s;
  }

  .card-info .description span {
    font-size: 14px;
  }

  .logo img,
  .logo figure {
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

  .point {
    bottom: -10px;
    position: absolute;
    animation: floating-points infinite ease-in-out;
    pointer-events: none;
    width: 3px;
    height: 3px;
    background:
      radial-gradient(65.28% 65.28% at 50% 100%, rgba(223, 113, 255, 0.8) 0%, rgba(223, 113, 255, 0) 100%),
      linear-gradient(0deg, #7a5af8, #7a5af8);
    border-radius: 9999px;
  }

  .point:nth-child(1) { left: 10%; opacity: 1; animation-duration: 2.35s; animation-delay: 0.2s; }
  .point:nth-child(2) { left: 30%; opacity: 0.7; animation-duration: 2.5s; animation-delay: 0.5s; }
  .point:nth-child(3) { left: 25%; opacity: 0.8; animation-duration: 2.2s; animation-delay: 0.1s; }
  .point:nth-child(4) { left: 44%; opacity: 0.6; animation-duration: 2.05s; }
  .point:nth-child(5) { left: 50%; opacity: 1; animation-duration: 1.9s; }
  .point:nth-child(6) { left: 75%; opacity: 0.5; animation-duration: 1.5s; animation-delay: 1.5s; }
  .point:nth-child(7) { left: 86%; opacity: 0.9; animation-duration: 2.2s; animation-delay: 0.2s; }
  .point:nth-child(8) { left: 58%; opacity: 0.8; animation-duration: 2.25s; animation-delay: 0.2s; }
  .point:nth-child(9) { left: 94%; opacity: 0.6; animation-duration: 2.6s; animation-delay: 0.1s; }
  .point:nth-child(10) { left: 65%; opacity: 1; animation-duration: 2.5s; animation-delay: 0.2s; }

  /* SVG 效果 */
  .svg-stroke-animation.is-svg::before {
    content: '';
    position: absolute;
    top: -2px; left: -2px; right: -2px; bottom: -2px;
    background: conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff, #ff0000);
    border-radius: 0.25rem;
    z-index: -1;
    animation: rotate-border 3s linear infinite;
    filter: blur(4px);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .svg-stroke-animation.is-svg:hover::before {
    opacity: 0.8;
  }

  @keyframes rotate-border {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .svg-stroke-animation.is-svg {
    filter: drop-shadow(0 0 1px rgba(52, 152, 219, 0.3));
    transition: filter 0.5s;
  }

  .svg-stroke-animation.is-svg:hover {
    filter: drop-shadow(0 0 2px rgba(231, 76, 60, 0.8))
            drop-shadow(0 0 3px rgba(52, 152, 219, 0.8))
            drop-shadow(0 0 4px rgba(46, 204, 113, 0.8));
  }

  .svg-image {
    position: relative;
    animation: svg-pulse 2s ease-in-out infinite;
  }

  .svg-image::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border-radius: 0.125rem;
    box-shadow: 0 0 0 0px rgba(52,152,219,0), 0 0 0 0px rgba(231,76,60,0), 0 0 0 0px rgba(46,204,113,0);
    animation: svg-stroke 3s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes svg-stroke {
    0%, 100% { box-shadow: 0 0 0 0px rgba(52,152,219,0), 0 0 0 0px rgba(231,76,60,0), 0 0 0 0px rgba(46,204,113,0); }
    33% { box-shadow: 0 0 0 2px rgba(52,152,219,0.5), 0 0 0 4px rgba(231,76,60,0.3), 0 0 0 6px rgba(46,204,113,0.1); }
    66% { box-shadow: 0 0 0 2px rgba(231,76,60,0.5), 0 0 0 4px rgba(46,204,113,0.3), 0 0 0 6px rgba(52,152,219,0.1); }
  }

  @keyframes svg-pulse {
    0%, 100% { filter: brightness(1) saturate(1); }
    50% { filter: brightness(1.1) saturate(1.2); }
  }
}

/* 额外未 scoped 的样式（SVG 描边动画） */
.svg-stroke {
  position: relative;
  animation: svg-stroke-animation 2s ease-in-out infinite;
  filter: drop-shadow(0 0 1px currentColor);
}

.svg-stroke:hover {
  animation: svg-stroke-animation 1s ease-in-out infinite;
}

@keyframes svg-stroke-animation {
  0%, 100% { filter: drop-shadow(0 0 1px var(--color-1, oklch(0.82 0.08 285))) drop-shadow(0 0 2px var(--color-2, oklch(0.85 0.08 300))); }
  33% { filter: drop-shadow(0 0 2px var(--color-4, oklch(0.85 0.1 350))) drop-shadow(0 0 3px var(--color-3, oklch(0.86 0.09 340))); }
  66% { filter: drop-shadow(0 0 2px var(--color-8, oklch(0.85 0.07 240))) drop-shadow(0 0 3px var(--color-7, oklch(0.88 0.05 220))); }
}
</style>
