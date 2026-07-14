import { inBrowser } from "vitepress";

export function useCodeGroups() {
  if (inBrowser) {
    window.addEventListener("click", (e) => {
      const el = e.target as HTMLInputElement;

      if (el.matches(".vp-code-group input")) {
        const group = el.parentElement?.parentElement;
        const i = Array.from(group?.querySelectorAll("input") || []).indexOf(
          el
        );

        // tabname/filename
        const tabname = el.nextElementSibling?.textContent;

        // language
        const block = group?.querySelectorAll(
          'div[class*="language-"]:not(.language-id)'
        )?.[i];
        const classList = Array.from(block?.classList || []);
        const language = classList.find((v) => v.startsWith("language-"));

        Array.prototype.forEach.call(
          document?.querySelectorAll(".vp-code-group"),
          (group, gidx) => {
            // ------------ tabname/filename ---------------------
            Array.from(group.querySelectorAll("input")).forEach(
              (fel: any, fidx) => {
                if (fel?.nextElementSibling?.textContent === tabname) {
                  if (fel !== el) fel.click();
                }
              }
            );
            // ------------ tabname/filename ---------------------

            // ------------ language ---------------------
            const current = group?.querySelector(
              'div[class*="language-"].active'
            );
            Array.from(
              group?.querySelectorAll(
                'div[class*="language-"]:not(.language-id)'
              )
            ).forEach((next: any, nidx) => {
              // language
              if (next?.classList.contains(language)) {
                if (current && next && current !== next) {
                  current.classList.remove("active");
                  next.classList.add("active");
                }
                const fel = group.querySelectorAll("input")[nidx];
                if (fel !== el) fel.click();
              }
            });
            // ------------ language ---------------------
          }
        );
      }
    });
  }
}
