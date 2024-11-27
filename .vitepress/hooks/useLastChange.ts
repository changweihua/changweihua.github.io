import { watch, ref, type WatchSource } from 'vue'
import dayjs from 'dayjs'

export function useLastChange(source: WatchSource) {
  const lastChange = ref('')

  watch(source, () => {
    lastChange.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
  })

  return lastChange
}
