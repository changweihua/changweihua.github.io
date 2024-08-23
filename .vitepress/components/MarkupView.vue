<template>
  <div class="markup-card" ref="markupCardRef">
    <svg class="w-full h-full min-block" ref="svgRef" />
    <div class="mt-1" ref="toolbarRef"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Transformer } from 'markmap-lib';
import { Markmap, loadCSS, loadJS } from 'markmap-view';
import { Toolbar } from 'markmap-toolbar';
import ResizeObserver from 'resize-observer-polyfill';
import { useScreenfullEffect } from '@vp/utils/useScreenfullEffect'
import { delay } from 'lodash-es'
import screenfull from 'screenfull';

const { handleFullscreenElement, isFullElementTag } = useScreenfullEffect()

const props = defineProps({
  id: String,
  code: String,
})

/**
 * @param {mm} markmap.create() 创建的 markmap 实例
 * @param {wrapper} renderToolbar 要渲染到的html元素
*/
const renderToolbar = (mm: Markmap, wrapper: HTMLElement) => {
  while (wrapper?.firstChild) wrapper.firstChild.remove();
  if (mm && wrapper) {
    const toolbar = new Toolbar();
    toolbar.setBrand(false); // 隐藏 toolbar 中 markmap 的logo和url
    toolbar.attach(mm);
    //toolbar.setItems([]); // 重新设置默认的功能模块

    // Register custom buttons
    toolbar.register({
      id: 'fullscreen',
      title: 'Click to fullscreen',
      content: '全屏',
      onClick: () => {
        handleFullscreenElement(markupCardRef.value!)
      },
    });
    toolbar.setItems(['zoomIn', 'zoomOut', 'fit', 'fullscreen']);

    wrapper.append(toolbar.render());
  }
};

const transformer = new Transformer();

const svgRef = ref<SVGSVGElement>()
const toolbarRef = ref<HTMLDivElement>()
const markupCardRef = ref<HTMLDivElement>()
const markmapRef = ref<Markmap>()

/*
// 1. transform Markdown
const { root, features } = transformer.transform(markdownData);

// 2. get assets
// either get assets required by used features
const { styles, scripts } = transformer.getUsedAssets(features);

// or get all possible assets that could be used later
const { styles, scripts } = transformer.getAssets();
 */
const update = () => {
  const { root } = transformer.transform(decodeURIComponent(props.code!));
  markmapRef.value?.setData(root);
  markmapRef.value?.fit();

  renderToolbar(markmapRef.value!, toolbarRef.value!);
}

let resizeObserver: ResizeObserver;

onMounted(() => {
  // 初始化markmap思维导图
  markmapRef.value = Markmap.create(svgRef.value!);

  // 更新思维导图渲染
  update();

  //监听screenfull属性的变化来改变图标
  screenfull.on('change', () => {
    delay(function () {
      markmapRef.value?.fit();

      renderToolbar(markmapRef.value!, toolbarRef.value!);
    }, 100)
  })

  // 针对f11全屏无法监听问题
  // window.addEventListener('keydown', KeyDown, true)

  // 创建 ResizeObserver 实例
  resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      console.log(`Size: ${width}px x ${height}px`);
    }
  });

  // 观察 resizeMe 元素
  resizeObserver.observe(markupCardRef.value!);
})

// 组件卸载前
onBeforeUnmount(() => {
  screenfull.off('change', () => { })
  resizeObserver?.disconnect()
})

</script>
