// workers/test.ts (worker的文件)
import { loadGifToCanvas } from "lhh-utils";

const state: {
  ctx: OffscreenCanvasRenderingContext2D | null
  offscreen: OffscreenCanvas | null
} = {
  ctx: null,
  offscreen: null
}
addEventListener('message', e => {
  const { data } = e;
  // 这里可以接收到传递进来的消息
  console.log('data: ', data);
  state.offscreen = data.canvas as OffscreenCanvas;
  if (state.offscreen) {
    console.log('加载Gif图片')
    // 获取到canvas的上下文
    state.ctx = state.offscreen.getContext('2d');
    getGifImgList()
  }
})
async function getGifImgList() {
  const imgList = await loadGifToCanvas('/20240123_093354104_iOS.gif', true);
  console.log(imgList)
  // 根据这个数组绘画就行了
}
export default {}
