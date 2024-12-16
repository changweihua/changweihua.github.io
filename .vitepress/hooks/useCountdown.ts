import { ref, unref, onUnmounted } from "vue";

export function useCountdown(duration: number, onCountdownEnd?: () => void) {
    const time = ref(duration);
    const isTiming = ref(false);
    let timer: ReturnType<typeof setInterval> | null;

    const clear = () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    const stop = () => {
        clear();
        isTiming.value = false;
    }

    const reset = () => {
        stop();
        time.value = duration;
    }

    const start = () => {
        if (unref(isTiming) || !!timer) {
            return;
        }
        isTiming.value = true;
        timer = setInterval(() => {
            if (unref(time) <= 0) {
                reset();
                onCountdownEnd && onCountdownEnd()
            } else {
                time.value--;
            }
        }, 1000)
    }

    onUnmounted(() => {
        reset()
    })

    return {time, isTiming, start, stop, reset} as const;
}
