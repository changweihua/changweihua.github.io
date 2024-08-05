console.log('mermaid')
// const targetNode = document.body
// // 创建MutationObserver实例
// const observer = new MutationObserver(function (mutations) {
//   mutations.forEach(function (mutation) {
//     // console.log('元素类型:', mutation.type);
//     // console.log('元素属性:', mutation.attributeName);
//     // console.log('元素值:', mutation.newValue);
//     if (document.querySelector('#graph-div .mermaid svg')) {
//       console.log(document.querySelector('#graph-div .mermaid svg'))
//       // TODO: 此时开始加载第三方脚本
//       observer.disconnect(); // 销毁监视者
//       const svg2roughjs = new Svg2Roughjs('#sketch-div', OutputType.SVG, {
//         fontFamily: "AlibabaPuHuiTi"
//       })
//       const graphDiv = document.querySelector < SVGSVGElement > ('#graph-div');
//       svg2roughjs.svg = document.querySelector('#graph-div .mermaid svg')
//       svg2roughjs.fontFamily = "AlibabaPuHuiTi"
//       svg2roughjs.sketch(true)
//       graphDiv.remove()
//       const sketch = document.querySelector < HTMLElement > ('#sketch-div > svg');
//       const height = sketch.getAttribute('height');
//       const width = sketch.getAttribute('width');
//       sketch.setAttribute('height', '100%');
//       sketch.setAttribute('width', '100%');
//       sketch.setAttribute('viewBox', `0 0 ${width} ${height}`);
//       sketch.style.maxWidth = '100%';
//     }
//     // if (mutation.type === 'childList') {
//     //   // 处理子节点列表的变化
//     // } else if (mutation.type === 'attributes') {
//     //   // 处理属性的变化
//     // } else if (mutation.type === 'characterData') {
//     //   // 处理字符数据的变化
//     // }
//   });
// });
// // 配置MutationObserver实例
// const config = {
//   attributes: true,
//   childList: true, // 观察直接子节点
//   subtree: true, // 及其更低的后代节点
//   characterData: true,
//   characterDataOldValue: true // 将旧的数据传递给回调
// };
// observer.observe(targetNode, config);
