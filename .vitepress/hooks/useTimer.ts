import { ref, onUnmounted } from 'vue';

// 定义定时器选项接口
interface TimerOptions {
  immediate?: boolean; // 是否立即执行
  immediateCallback?: boolean; // 是否立即执行回调
  errorHandler?: (e: Error) => void; // 错误处理函数
}

// 定义返回值接口
interface TimerControls {
  clear: () => void; // 清除定时器
  pause: () => void; // 暂停定时器
  resume: () => void; // 恢复定时器
}

// 定义定时器状态接口
interface TimerStatus {
  isRunning: boolean;
  isPaused: boolean;
  count: number;
}

export function useTimeoutFn<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 0,
  options: TimerOptions = {},
  ...args: Parameters<T>
): TimerControls {
  let timerId: number | null = null;
  let stopped = false;

  const {
    immediate = false,
    immediateCallback = false,
    errorHandler = console.error,
  } = options;

  const status = ref<TimerStatus>({
    isRunning: false,
    isPaused: false,
    count: 0
  });

  const doTimeout = (): void => {
    try {
      status.value.isRunning = true;
      status.value.isPaused = false;

      timerId = window.setTimeout(() => {
        if (stopped) return;
        status.value.count++;
        callback(...args);
      }, delay);
    } catch (e) {
      errorHandler(e as Error);
    }
  };

  if (immediate && immediateCallback) {
    try {
      callback(...args);
    } catch (e) {
      errorHandler(e as Error);
    }
  }

  if (immediate) {
    doTimeout();
  }

  const clear = (): void => {
    if (timerId) {
      window.clearTimeout(timerId);
      timerId = null;
    }
    status.value.isRunning = false;
    status.value.isPaused = false;
    status.value.count = 0;
  };

  const pause = (): void => {
    stopped = true;
    status.value.isPaused = true;
    clear();
  };

  const resume = (): void => {
    if (!status.value.isPaused) return;
    stopped = false;
    doTimeout();
  };

  onUnmounted(() => {
    clear();
  });

  return {
    clear,
    pause,
    resume,
  };
}

export function useIntervalFn<T extends (...args: any[]) => any>(
  callback: T,
  interval: number = 1000,
  options: TimerOptions = {},
  ...args: Parameters<T>
): TimerControls {
  let timerId: number | null = null;
  let stopped = false;

  const {
    immediate = false,
    immediateCallback = false,
    errorHandler = console.error,
  } = options;

  const status = ref<TimerStatus>({
    isRunning: false,
    isPaused: false,
    count: 0
  });

  const doInterval = (): void => {
    try {
      status.value.isRunning = true;
      status.value.isPaused = false;

      timerId = window.setInterval(() => {
        if (stopped) return;
        status.value.count++;
        callback(...args);
      }, interval);
    } catch (e) {
      errorHandler(e as Error);
    }
  };

  if (immediate && immediateCallback) {
    try {
      callback(...args);
    } catch (e) {
      errorHandler(e as Error);
    }
  }

  if (immediate) {
    doInterval();
  }

  const clear = (): void => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
    status.value.isRunning = false;
    status.value.isPaused = false;
    status.value.count = 0;
  };

  const pause = (): void => {
    stopped = true;
    status.value.isPaused = true;
    clear();
  };

  const resume = (): void => {
    if (!status.value.isPaused) return;
    stopped = false;
    doInterval();
  };

  onUnmounted(() => {
    clear();
  });

  return {
    clear,
    pause,
    resume,
  };
}
