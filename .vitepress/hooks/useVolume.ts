// useVolume.ts
// 提示：在检测麦克风之前，需要获取麦克风权限，并且获取到你正在使用的麦克风
import { ref } from 'vue'

/**
 * 实时获取麦克风音量
 * 此方法是通过后去音频数据来计算出音量,并非系统实际音量
 * @param _audioContext 如果传入AudioContext,则使用它,否则新建一个音频来获取音量大小
 * @returns
 */
export const useVolume = () => {
  const audioContext = ref<AudioContext | null>()
  const analyser = ref<AnalyserNode | null>(null)
  const isStart = ref<boolean>(false)
  // 音量[0, 100]
  const volume = ref<number>(0)

  /**
   * 开启音量检测
   * @param _source 数据源
   * @param _audioContext audio上下文 (用于在录音的过程中同时去检测,这样就不需要再次创建多一个audio上下文)
   * @param deviceId 麦克风设备ID,用于指定检测那个麦克风的音量
   */
  const startVolumeCheck = async (
    _source?: MediaStreamAudioSourceNode | null,
    _audioContext?: AudioContext | null,
    deviceId?: string | null,
  ) => {
    if (!audioContext.value) {
      if (_audioContext) {
        audioContext.value = _audioContext
      } else {
        audioContext.value = new AudioContext()
      }
    }

    isStart.value = true
    const mediaOptions = deviceId
      ? { audio: { deviceId: deviceId } }
      : { audio: true }
    let source = _source
    if (!source) {
      const stream = await navigator.mediaDevices.getUserMedia(mediaOptions)
      source = audioContext.value.createMediaStreamSource(stream)
    }

    analyser.value = audioContext.value.createAnalyser()
    analyser.value!.fftSize = 32
    source.connect(analyser.value!)

    // 创建数据缓冲区
    const bufferLength = analyser.value!.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    // 定义更新音量的函数
    function updateVolume() {
      analyser.value!.getByteFrequencyData(dataArray)

      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      volume.value = Math.floor((sum / bufferLength / 255) * 100)

      if (isStart.value) {
        requestAnimationFrame(updateVolume)
      } else {
        volume.value = 0
      }
    }

    // 开始更新音量
    updateVolume()
  }

  // 暂停检测
  const stopVolumeCheck = () => {
    isStart.value = false
    analyser.value?.disconnect()
  }

  return {
    startVolumeCheck,
    stopVolumeCheck,
    volume,
    isStart,
  }
}
