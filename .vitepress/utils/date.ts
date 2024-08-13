import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from "dayjs/plugin/timezone";
import 'dayjs/locale/zh-cn'

dayjs.tz.setDefault("Asia/Shanghai")
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

export function getDate(date: string | Date | undefined): string | null {
  if (date) {
    const time = dayjs(date instanceof Date ? date : date.trim())
    if (time.isValid()) {
      const currentTime = dayjs(date).utc().local().format('YYYY-MM-DD')
      return currentTime
    }
  }
  return null
}

export function getFromNow(date: string | Date): string | null {
  if (date)
    return dayjs(date).utc().local().fromNow()

  return null
}

export const http2 = function <T extends number>(options: number): Promise<T> {
  console.log(options)
  const res: number = 1
  return Promise.resolve(res as T);
}

export const http3 = <T extends number>(options: number): Promise<T> => {
  console.log(options)
  const res: number = 1
  return Promise.resolve(res as T);
}
