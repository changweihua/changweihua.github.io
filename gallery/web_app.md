---
layout: doc
# 开启推荐
recommended: true
mermaids: 1
---

## 简介 ##

基于 Maui 实现跨平台的 Hybird 应用平台，通过 `iframe` 和 `jsbridge` 的封装，完成子系统的嵌套及系统通信。

## 架构 ##

![Maui Hybird](/images/cmono-image.png){data-zoomable}

<RoughMermaid>

```mermaid
%%{init: {'theme':'forest'}}%%
sequenceDiagram
	participant A as Host
	participant B as WebAPP
	participant C as MAUI
	participant D as Hardware
	participant E as 新生产
	participant F as 工具单

	A->>A:宿主应用启动
	A->>B:宿主内访问
    activate B
	    B-->>B:检测Token

        alt 未登录
            B->>B:监听消息
            A-->>B:发送Token
        end
        opt 已登录
            B-->>B:启动程序
            B->>A:程序启动完成
        end
        B->>E:获取用户信息
	deactivate B
    
    E-->>B:返回用户信息

	%% left or right
	note left of A:整体基于<br>iframe架构
```

</RoughMermaid>


<script lang="ts" setup>
import { Svg2Roughjs } from 'svg2roughjs'
import { onMounted, ref, nextTick } from 'vue'

const targetNode = document.body
const resultRef = ref()

 // 创建MutationObserver实例
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      // console.log('元素类型:', mutation.type);
      // console.log('元素属性:', mutation.attributeName);
      // console.log('元素值:', mutation.newValue);
      if (document.querySelector('#graph-div .mermaid svg')) {
        console.log(document.querySelector('#graph-div .mermaid svg'))
        // TODO: 此时开始加载第三方脚本
        observer.disconnect(); // 销毁监视者
        const svg2roughjs = new Svg2Roughjs('#sketch-div')
        const graphDiv = document.querySelector<SVGSVGElement>('#graph-div');
        svg2roughjs.svg = document.querySelector('#graph-div .mermaid svg')
        svg2roughjs.fontFamily = "AlibabaPuHuiTi"
        svg2roughjs.sketch(true)
        graphDiv.remove()
        const sketch = document.querySelector<HTMLElement>('#sketch-div > svg');
        const height = sketch.getAttribute('height');
        const width = sketch.getAttribute('width');
        sketch.setAttribute('height', '100%');
        sketch.setAttribute('width', '100%');
        sketch.setAttribute('viewBox', `0 0 ${width} ${height}`);
        sketch.style.maxWidth = '100%';
      }
      // if (mutation.type === 'childList') {
      //   // 处理子节点列表的变化
      // } else if (mutation.type === 'attributes') {
      //   // 处理属性的变化
      // } else if (mutation.type === 'characterData') {
      //   // 处理字符数据的变化
      // }
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
  // console.log('onMounted', resultRef.value, document.querySelector('#result .mermaid svg'))
  // nextTick(() => {
  //   const svg2roughjs = new Svg2Roughjs(resultRef.value)
  //   svg2roughjs.svg = document.querySelector('#result .mermaid svg')
  //   svg2roughjs.sketch()
  // })
 
  // observer.observe(targetNode, config);

  // const graphDiv = document.querySelector<SVGSVGElement>('#graph-div');
  //         if (!graphDiv) {
  //           throw new Error('graph-div not found');
  //         }
  //         if (state.rough) {
  //           const svg2roughjs = new Svg2Roughjs('#container');
  //           svg2roughjs.svg = graphDiv;
  //           await svg2roughjs.sketch();
  //           graphDiv.remove();
  //           const sketch = document.querySelector<HTMLElement>('#container > svg');
  //           if (!sketch) {
  //             throw new Error('sketch not found');
  //           }
  //           const height = sketch.getAttribute('height');
  //           const width = sketch.getAttribute('width');
  //           sketch.setAttribute('height', '100%');
  //           sketch.setAttribute('width', '100%');
  //           sketch.setAttribute('viewBox', `0 0 ${width} ${height}`);
  //           sketch.style.maxWidth = '100%';
  //         }
})
</script>
