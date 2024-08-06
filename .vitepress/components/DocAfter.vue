<template>
  <div v-if="frontmatter['commentabled']" style="width: 100%; min-height: 300px; margin: 0 auto"
    class="justify-center items-center flex">
    <UtterancesComment />
  </div>
  <div v-if="frontmatter['tags'] && frontmatter['tags'].length > 0" style="width: 200px; height: 100px; margin: 0 auto"
    class="justify-center items-center flex">
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { onMounted } from 'vue'
import UtterancesComment from "@vp/components/UtterancesComment.vue"
import * as roughjs from 'svg2roughjs'
// 获取 frontmatter
const { frontmatter } = useData();

async function makeRough(svg: SVGSVGElement, div: HTMLElement) {
  console.log(svg, div)

  const sketchSvg = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
  const sketchSvgId = `sketch-${svg.id}`
  sketchSvg.setAttribute("id", sketchSvgId);
  svg.parentElement?.appendChild(sketchSvg)

  const svg2roughjs = new roughjs.Svg2Roughjs(sketchSvg)
  svg2roughjs.svg = svg
  svg2roughjs.fontFamily = "AlibabaPuHuiTi"

  await svg2roughjs.sketch(false)
  svg.remove()
  const sketch = sketchSvg;
  if (sketch) {
    const height = sketch.getAttribute('height');
    const width = sketch.getAttribute('width');
    sketch.setAttribute('height', '100%');
    sketch.setAttribute('width', '100%');
    sketch.setAttribute('viewBox', `0 0 ${width} ${height}`);
    sketch.style.maxWidth = '100%';
  }
}

const config = {
  attributes: true,
  childList: true, // 观察直接子节点
  subtree: true, // 及其更低的后代节点
  characterData: true,
  characterDataOldValue: true // 将旧的数据传递给回调
};

// 创建MutationObserver实例
const observer = new MutationObserver(function (mutations, instance) {
  mutations.forEach(async function (mutation) {
    console.log(mutation.target)
    const div = mutation.target as HTMLElement
    if (div && div.classList && div.classList.contains('.mermaid')) {
      const svg = div.querySelector('svg')
      if (!svg) {
        return
      }

      console.log(svg.id)
      // TODO: 此时开始加载第三方脚本
      await makeRough(svg, div)
    }
  });

  observer.disconnect();

});


onMounted(() => {
  if (frontmatter.value['mermaids'] && frontmatter.value['mermaids'] === 1) {
    // observer.observe(targetNode, config);

    // const targetNode = document.getElementById('VPContent')
    // observer.observe(targetNode!, config)
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
