// workers/test.ts (worker的文件)
import { loadGifToCanvas } from "lhh-utils";

const state: {
  ctx: OffscreenCanvasRenderingContext2D | null
  offscreen: OffscreenCanvas | null
  dpr: number
} = {
  ctx: null,
  offscreen: null,
  dpr: 1
}
addEventListener('message', e => {
  const { data } = e;
  // 这里可以接收到传递进来的消息
  console.log('data: ', data);
  if (e.data['init']) {
    state.offscreen = data.canvas as OffscreenCanvas;
    state.dpr = data.dpr
    console.log('state.offscreen', state.offscreen)
    if (state.offscreen) {
      console.log('加载Gif图片')
      // 获取到canvas的上下文
      state.ctx = state.offscreen.getContext('2d', { willReadFrequently: true });
      let { width: cssWidth, height: cssHeight } = state.offscreen
      state.offscreen.width = state.dpr * cssWidth
      state.offscreen.height = state.dpr * cssHeight
      state.ctx?.scale(state.dpr, state.dpr)
      getGifImgList()
    }
  } else if (e.data.msg == 'draw') {
    getGifImgList()
  }
})
async function getGifImgList() {
  const imgList = await loadGifToCanvas('/pikaqiu.gif', true);
  // 根据这个数组绘画就行了
  const drawimg1 = drawGif(imgList);
  (function go() {
    state.ctx?.clearRect(0, 0, state.offscreen!.width, state.offscreen!.height);
    drawimg1()
    requestAnimationFrame(go)
  })()
}

function drawGif(list) {
  let index = 0;
  const len = list.length * 4;
  return () => {
    if (state.ctx) {
      state.ctx.drawImage(list[Math.floor(index / 4)].img, 0, 0, state.offscreen!.width, state.offscreen!.height);
      index++;
      if (index >= len) {
        index = 0;
      }
    }
  }
}

export default {}
