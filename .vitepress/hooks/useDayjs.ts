// 原生日期工具模块（替代 dayjs）
// 无需安装任何依赖，所有现代浏览器和 Node.js 16+ 均支持

// ============ 配置区 ============
const DEFAULT_TIMEZONE = 'Asia/Shanghai';

// ============ 辅助函数 ============

/**
 * 解析输入为 Date 对象，并校验有效性
 */
function parseDate(input: string | Date | undefined): Date | null {
  if (input === undefined || input === null) return null;

  let date: Date;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    date = new Date(trimmed);
  } else if (input instanceof Date) {
    date = new Date(input); // 复制一份避免外部修改
  } else {
    return null;
  }

  return isNaN(date.getTime()) ? null : date;
}

/**
 * 格式化日期时间（带时区）
 * 返回指定格式的字符串
 */
function formatWithIntl(
  date: Date,
  pattern: 'date' | 'datetime',
  timeZone: string = DEFAULT_TIMEZONE
): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  };

  if (pattern === 'datetime') {
    Object.assign(options, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  // 使用 en-CA 区域保证 YYYY-MM-DD 格式，用 sv-SE 也可以
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  const parts = formatter.formatToParts(date);

  // 从 parts 中提取需要的字段
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));

  if (pattern === 'date') {
    return `${map.year}-${map.month}-${map.day}`;
  } else {
    return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}`;
  }
}

// ============ 对外导出的函数 ============

/**
 * 格式化日期为 YYYY-MM-DD（带时区 Asia/Shanghai）
 * 与原来 dayjs 实现行为一致：输入字符串会被 trim，无效日期返回 null
 */
export function getDate(date: string | Date | undefined): string | null {
  const validDate = parseDate(date);
  if (!validDate) return null;
  return formatWithIntl(validDate, 'date');
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm（带时区 Asia/Shanghai）
 */
export function getDateTime(date: string | Date | undefined): string | null {
  const validDate = parseDate(date);
  if (!validDate) return null;
  return formatWithIntl(validDate, 'datetime');
}

/**
 * 返回相对时间（中文），例如 "3天前"、"2小时后"
 * 使用 Intl.RelativeTimeFormat
 */
export function getFromNow(date: string | Date): string | null {
  const validDate = parseDate(date);
  if (!validDate) return null;

  const now = new Date();
  const diffMs = validDate.getTime() - now.getTime(); // 正数表示未来
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  let unit: Intl.RelativeTimeFormatUnit;
  let value: number;

  if (absSec < 60) {
    unit = 'second';
    value = diffSec;
  } else if (absSec < 3600) {
    unit = 'minute';
    value = Math.round(diffSec / 60);
  } else if (absSec < 86400) {
    unit = 'hour';
    value = Math.round(diffSec / 3600);
  } else if (absSec < 2592000) { // 30天
    unit = 'day';
    value = Math.round(diffSec / 86400);
  } else if (absSec < 31536000) { // 365天
    unit = 'month';
    value = Math.round(diffSec / 2592000);
  } else {
    unit = 'year';
    value = Math.round(diffSec / 31536000);
  }

  // 使用中文区域
  const rtf = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' });
  return rtf.format(value, unit);
}
