console.log('mermaid')
const { Svg2Roughjs, OutputType } = svg2roughjs

function insertElement(tagName, options, father) {
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


async function makeRough(svg, div) {
  console.log(svg, div)

  const sketchSvg = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
  const sketchSvgId = `sketch-${svg.id}`
  sketchSvg.setAttribute("id", sketchSvgId);
  svg.parentElement?.appendChild(sketchSvg)

  const svg2roughjs = new Svg2Roughjs(sketchSvg)
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

// const mermaids = document.querySelectorAll('.mermaid')

// mermaids.forEach((m) => {
//   const observer = new MutationObserver(function (mutations, instance) {
//     mutations.forEach(async function (mutation) {
//       const div = mutation.target
//       if (div && div.classList && div.classList.contains('rough-mermaid')) {
//         const svg = div.querySelector('svg')
//         if (!svg) {
//           return
//         }

//         console.log(svg.id)
//         // TODO: 此时开始加载第三方脚本
//         observer.disconnect();

//         await makeRough(svg, div)
//       }
//     });
//   });
//   observer.observe(m, config)
// })

const targetNode = document.getElementById('VPContent')

// 创建MutationObserver实例
const observer = new MutationObserver(function (mutations, instance) {
  mutations.forEach(async function (mutation) {
    const div = mutation.target
    if (div && div.classList && div.classList.contains('rough-mermaid')) {
      const svg = div.querySelector('svg')
      if (!svg) {
        return
      }

      console.log(svg.id)
      // TODO: 此时开始加载第三方脚本
      observer.disconnect();

      await makeRough(svg, div)
    }
  });
});

observer.observe(targetNode, config)
// const svgConverter = new Svg2Roughjs('#output-div', OutputType.SVG, { roughness: 5 })
// svgConverter.svg = document.getElementById('input-svg')
// svgConverter.sketch()
// const targetNode = document.body
// // 配置MutationObserver实例
// const config = {
//   attributes: true,
//   childList: true, // 观察直接子节点
//   subtree: true, // 及其更低的后代节点
//   characterData: true,
//   characterDataOldValue: true // 将旧的数据传递给回调
// };
// observer.observe(targetNode, config);
