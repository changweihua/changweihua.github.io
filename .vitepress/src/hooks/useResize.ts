import { App } from "vue";

function useResize(
  el: HTMLElement,
  callback: (cr: DOMRectReadOnly, resize: ResizeObserver) => void
) {
  let resize: ResizeObserver;
  resize = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const cr = entry.contentRect;
      callback(cr, resize);
    }
  });
  resize.observe(el);
}

const install = (app: App) => {
  app.directive("resize", {
    mounted(el, binding) {
      useResize(el, binding.value);
    },
  });
};

useResize.install = install;

export default useResize;
