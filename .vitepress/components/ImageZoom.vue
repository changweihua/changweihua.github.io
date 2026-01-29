<script setup lang="ts">
  import { watch, type ComponentPublicInstance, useAttrs } from 'vue'
  import mediumZoom, { type Zoom, type ZoomOptions } from 'medium-zoom'

  interface Props {
    options?: ZoomOptions
  }

  const props = defineProps<Props>()

  // withDefaults(defineProps<Props>(), {
  //   options: () => ({}),
  // });

  let zoom: Zoom | null = null

  function getZoom() {
    if (zoom === null) {
      zoom = mediumZoom(props.options)
    }
    return zoom
  }

  function attachZoom(ref: Element | ComponentPublicInstance | null) {
    const image = ref as HTMLImageElement | null
    const zoom = getZoom()

    if (image) {
      zoom.attach(image)
    } else {
      zoom.detach()
    }
  }

  watch(
    () => props.options,
    (options) => {
      const zoom = getZoom()
      zoom.update(options || {})
    }
  )

  const attrs = useAttrs() // 获取所有透传的属性

  function getFileNameWithoutExtension(filePath: string) {
    const fileName = filePath.split(/[\\/]/).pop() || ''
    const lastDotIndex = fileName.lastIndexOf('.')

    if (lastDotIndex === -1) return fileName
    return fileName.substring(0, lastDotIndex)
  }
</script>

<template>
  <figure
    class="vp-image medium-zoom-image"
    data-zoomable
  >
    <picture class="vp-picture">
      <!-- source 标签只配置资源选择相关属性 -->
      <source
        :ref="attachZoom"
        :srcset="`/images/${getFileNameWithoutExtension(attrs['src'] as string)}.webp`"
        type="image/webp"
      />
      <source
        :ref="attachZoom"
        :srcset="`/images/${getFileNameWithoutExtension(attrs['src'] as string)}.avif`"
        type="image/avif"
      />

      <!-- img 标签配置所有加载和性能相关属性 -->
      <img
        :ref="attachZoom"
        :src="`${attrs['src']}`"
        :alt="`${attrs['alt']}`"
        data-zoomable
        class="vp-img medium-zoom-image"
        loading="lazy"
        decoding="async"
      />
    </picture>
  </figure>
</template>
