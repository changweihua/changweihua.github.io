import { watch, ref, type WatchSource } from 'vue'

/**
 * 格式化当前时间为 "YYYY-MM-DD HH:mm:ss"（本地时区）
 * 与 dayjs().format('YYYY-MM-DD HH:mm:ss') 行为一致
 */
function formatNow(): string {
  const now = new Date()
  // 使用 en-CA 区域，其日期格式即为 YYYY-MM-DD
  // 指定 hour12: false 确保 24 小时制
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    // 不指定 timeZone，使用系统本地时区（与原 dayjs 行为一致）
  })
  const parts = formatter.formatToParts(now)
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]))
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`
}

/**
 * 监听 source 的变化，记录最后一次变化的时间
 * @param source - 响应式数据源
 * @returns 返回一个 ref，包含最后一次变化的时间字符串
 */
export function useLastChange(source: WatchSource) {
  const lastChange = ref('')

  watch(source, () => {
    lastChange.value = formatNow()
  })

  return lastChange
}


// import { ref } from 'vue'
// import { useLastChange } from './useLastChange'

// const count = ref(0)
// const lastUpdated = useLastChange(count)

// // 每次修改 count，lastUpdated 都会更新为当前时间字符串
// count.value++ // 触发 watch
// console.log(lastUpdated.value) // "2026-06-22 15:30:45"
