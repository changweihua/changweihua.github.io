<template>
  <div v-if="frontmatter['commentabled']" style="width: 100%; min-height: 300px; margin: 0 auto"
    class="justify-center items-center flex">
    <!-- <lottie-panel :animation-data="party"></lottie-panel> -->
    <UtterancesComment />
  </div>
  <div v-if="frontmatter['tags'] && frontmatter['tags'].length > 0" style="width: 200px; height: 100px; margin: 0 auto"
    class="justify-center items-center flex">
    <!-- <Tag v-for="tag in frontmatter['tags']" :key="tag">{{ tag }}</Tag> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Svg2Roughjs } from 'svg2roughjs'
import { useData } from 'vitepress'
import { delay } from 'lodash-es'
import UtterancesComment from "@vp/components/UtterancesComment.vue"

// 获取 frontmatter
const { frontmatter } = useData();

const targetNode = document.body
const mermaids = new Set()

function makeRough(svg: SVGSVGElement, div: HTMLElement) {
  const sketchContainer = document.createElement('div')
  sketchContainer.setAttribute("type", "text");
  const sketchContainerId = `sketch-div-${svg.id}`
  sketchContainer.setAttribute("id", sketchContainerId);
  div.appendChild(sketchContainer)
  const svg2roughjs = new Svg2Roughjs(`#${sketchContainerId}`)
  // const graphDiv = document.querySelector<SVGSVGElement>('#graph-div');
  svg2roughjs.svg = svg!
  svg2roughjs.fontFamily = "AlibabaPuHuiTi"
  svg2roughjs.sketch(true)
  svg?.remove()
  const sketch = document.querySelector<HTMLElement>(`#${sketchContainerId} > svg`);
  if (sketch) {
    const height = sketch.getAttribute('height');
    const width = sketch.getAttribute('width');
    sketch.setAttribute('height', '100%');
    sketch.setAttribute('width', '100%');
    sketch.setAttribute('viewBox', `0 0 ${width} ${height}`);
    sketch.style.maxWidth = '100%';
  }
}

// 创建MutationObserver实例
const observer = new MutationObserver(function (mutations, instance) {
  console.log(instance)
  mutations.forEach(function (mutation) {
    console.log(mutation.target)
    const div = mutation.target as HTMLElement
    if (div && div.classList && div.classList.contains('rough-mermaid')) {
      const svg = div.firstChild as SVGSVGElement
      console.log(div)
      if (!svg) {
        return
      }

      console.log(svg.id)
      // TODO: 此时开始加载第三方脚本
      if (!mermaids.has(svg.id)) {
        mermaids.add(svg.id)
      }

      if (mermaids.size === frontmatter.value['mermaids']) {
        observer.disconnect(); // 销毁监视者
      }

      makeRough(svg, div)
    }
  });
});
// 配置MutationObserver实例
const config = {
  attributes: true,
  childList: true, // 观察直接子节点
  subtree: true, // 及其更低的后代节点
  characterData: true,
  characterDataOldValue: true // 将旧的数据传递给回调
};

onMounted(() => {
  console.log(frontmatter.value['mermaids'])
  if (frontmatter.value['mermaids'] && frontmatter.value['mermaids'] === 1) {
    // observer.observe(targetNode, config);
  }
  // delay(function () {
  //   document.querySelectorAll('.graph-div').forEach((div => {
  //     console.log(div)
  //     // observer.observe(m, config);
  //     const svg = div.firstChild as SVGSVGElement
  //     makeRough(svg, div as HTMLElement)
  //   }))
  // }, 1800)
})

</script>

<style lang="less">
lottie-panel {
  width: 200px;
  height: 100px;
}
</style>
