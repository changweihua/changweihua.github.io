<script setup lang="ts">
import { computed, useAttrs, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import mediumZoom, { type Zoom, type ZoomOptions } from 'medium-zoom'

interface Props {
  options?: ZoomOptions
  widths?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  widths: () => [400, 800, 1200, 1600]
})

const attrs = useAttrs()

let zoom: Zoom | null = null
function getZoom() {
  if (!zoom) zoom = mediumZoom(props.options)
  return zoom
}

function attachZoom(ref: Element | ComponentPublicInstance | null) {
  const img = ref as HTMLImageElement | null
  const zoom = getZoom()
  if (img) zoom.attach(img)
  else zoom.detach()
}

watch(
  () => props.options,
  (options) => getZoom().update(options || {})
)

// ✅ 显式类型提取（也可在模板中直接用 as string）
const src = computed(() => attrs.src as string | undefined)
const alt = computed(() => attrs.alt as string | undefined)
const sizes = computed(() => (attrs.sizes as string | undefined) || '100vw')

function buildSrcset(baseName: string, format: string, widths: number[]): string {
  return widths.map(w => `/images/${baseName}-${w}w.${format} ${w}w`).join(', ')
}

const baseName = computed(() => {
  if (!src.value) return ''
  const fileName = src.value.split(/[\\/]/).pop() || ''
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex === -1 ? fileName : fileName.substring(0, dotIndex)
})

// 原始格式扩展名
const originalExt = computed(() => {
  if (!src.value) return 'jpg'
  return src.value.split('.').pop() || 'jpg'
})
</script>

<template>
  <figure class="vp-image medium-zoom-image" data-zoomable>
    <picture class="vp-picture">
      <source
        :ref="attachZoom"
        :srcset="baseName ? buildSrcset(baseName, 'jxl', props.widths) : undefined"
        type="image/jxl"
      />
      <source
        :ref="attachZoom"
        :srcset="baseName ? buildSrcset(baseName, 'webp', props.widths) : undefined"
        type="image/webp"
      />
      <source
        :ref="attachZoom"
        :srcset="baseName ? buildSrcset(baseName, 'avif', props.widths) : undefined"
        type="image/avif"
      />
      <img
        :ref="attachZoom"
        :src="src"
        :alt="alt"
        :srcset="baseName ? buildSrcset(baseName, originalExt, props.widths) : undefined"
        :sizes="sizes"
        class="vp-img medium-zoom-image"
        loading="lazy"
        decoding="async"
        data-zoomable
      />
    </picture>
  </figure>
</template>
