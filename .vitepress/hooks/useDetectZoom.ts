import { ref, Ref, onMounted, onUnmounted } from 'vue';

interface ZoomDetectorReturn {
  /** 当前缩放比例（百分比） */
  zoom: Ref<number>;
}

const ZOOM_KEYS = new Set(['+', '-', '=', '_']);
const ZOOM_KEY_CODES = new Set([61, 107, 173, 109, 187, 189]);

export function useDetectZoom(): ZoomDetectorReturn {
  const zoom = ref(100);

  const detectZoom = (): number => {
    if (typeof window === 'undefined') return 100;

    let ratio = 100;
    try {
      if (window.visualViewport?.scale) {
        ratio = window.visualViewport.scale * 100;
      } else if (window.devicePixelRatio) {
        ratio = window.devicePixelRatio * 100;
      } else if (window.outerWidth && window.innerWidth) {
        ratio = (window.outerWidth / window.innerWidth) * 100;
      }
    } catch (e) {
      console.warn('Zoom detection error:', e);
    }

    const rounded = Math.round(ratio);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Current zoom level:', `${rounded}%`);
    }
    return rounded;
  };

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) e.preventDefault();
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (ZOOM_KEYS.has(e.key) || ZOOM_KEY_CODES.has(e.which))) {
      e.preventDefault();
    }
  };

  const updateZoom = () => (zoom.value = detectZoom());
  const debouncedUpdate = debounce(updateZoom, 100);

  onMounted(() => {
    if (typeof window === 'undefined') return;

    updateZoom();

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', debouncedUpdate);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', debouncedUpdate);
    }
  });

  onUnmounted(() => {
    if (typeof window === 'undefined') return;

    window.removeEventListener('wheel', handleWheel);
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', debouncedUpdate);

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', debouncedUpdate);
    }
  });

  return { zoom };
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// import { useDetectZoom } from '@/utils/useDetectZoom';

// // 当前缩放
// const { zoom } = useDetectZoom();
