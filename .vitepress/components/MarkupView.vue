<template>
  <div class="markup-card" ref="markupCardRef">
    <svg class="w-full h-full min-block" ref="svgRef" />
    <div class="mt-1 markup-toolbar" ref="toolbarRef"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, onBeforeUnmount, h } from 'vue';
import { Transformer } from 'markmap-lib';
import { Markmap, loadCSS, loadJS } from 'markmap-view';
import { Toolbar } from 'markmap-toolbar';
import ResizeObserver from 'resize-observer-polyfill';
import { useScreenfullEffect } from '@vp/utils/useScreenfullEffect'
import { delay } from 'lodash-es'
import screenfull from 'screenfull';
import "markmap-toolbar/dist/style.css";

const { handleFullscreenElement, isFullElementTag } = useScreenfullEffect()

const props = defineProps({
  id: String,
  code: String,
})

const svgNS = 'http://www.w3.org/2000/svg';
function createTag(tag, objAttr) {
  var oTag = document.createElementNS(svgNS, tag);
  for (var attr in objAttr) {
    oTag.setAttribute(attr, objAttr[attr]);
  }
  return oTag;
}

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

    const svg1 = createElement('svg', {
      width: '20',
      height: '20',
      viewBox: "0 0 32 32"
    })

    var oSvg = createTag('svg', {
      'xmlns': svgNS, 'width': '20px', 'height': '20px',
      viewBox: "0 0 24 24"
    });

    oSvg.append(createTag('path', { fill: 'none', 'stroke-linecap': "round", 'stroke-linejoin': "round", 'stroke-width': "2", 'stroke': 'currentColor', 'd': 'M9 7h-.6C7.07 7 6 8.07 6 9.4v6.2C6 16.93 7.07 18 8.4 18h6.2c1.33 0 2.4-1.07 2.4-2.4V15m-7-1l8-8m0 0h-4m4 0v4' }))

    // Register custom buttons
    toolbar.register({
      id: 'fullscreen',
      title: 'Click to fullscreen',
      content: oSvg,
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

const createElement = (tagName: string, options?: any, father?: any) => {
  var svgTags = ['svg', 'g', 'path', 'filter', 'animate', 'marker', 'line', 'polyline', 'rect', 'circle', 'ellipse', 'polygon'];
  let newElement;
  if (svgTags.indexOf(tagName) >= 0) {
    newElement = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  } else {
    newElement = document.createElement(tagName);
  }
  if (options) {
    if (options.css) {
      newElement.style.cssText = options.css;
    }
    if (options.props) {
      for (var key in options.props) {
        newElement.setAttribute(key, options.props[key])
      }
    }
  }
  if (father) {
    father.appendChild(newElement);
  }
  return newElement;
}



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

<style lang="less" scoped>
.markup-card {
  background-color: initial;

  .markup-toolbar * {
    color: rgb(161 161 170 / var(--un-text-opacity));
  }
}
</style>
