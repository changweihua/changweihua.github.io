import screenfull from 'screenfull'
import { ref }  from 'vue'

// 封装：整个页面、元素切换全屏
export const useScreenfullEffect = () => {
  const isFullScreenTag = ref(false)
  const isFullElementTag = ref(false)
  // 检测当前页面是否全屏，如果是全屏就退出，否则就全屏
  const handleFullScreen = () => {
    if (screenfull.isEnabled) {
      if (screenfull.isFullscreen) {
        screenfull.toggle()
        isFullScreenTag.value = false
        // screenfull.exit()
      } else {
        // 进入全屏
        screenfull.toggle()
        isFullScreenTag.value = true
        // screenfull.request()
      }
    } else {
      alert('提示：不支持切换全屏。')
    }
  }
  // 点击当前元素进入全屏，一般为图片
  const handleFullscreenElement = (element) => {
    if (screenfull.isEnabled) {
      if (screenfull.isFullscreen) {
        screenfull.toggle(element)
        isFullElementTag.value = false
      } else {
        // 进入全屏
        screenfull.toggle(element)
        isFullElementTag.value = true
      }
    } else {
      alert('提示：不支持切换全屏。')
    }
  }
  return { isFullScreenTag,isFullElementTag, handleFullScreen, handleFullscreenElement }
}
