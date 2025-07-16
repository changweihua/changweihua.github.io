/// <reference types="vitest" />
/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    // includeSource: ["src/**tests/*.{js,ts}"],
    coverage: {
      enabled: true,
      reporter: ["html"],
    },
  },
});

// import { defineConfig, mergeConfig } from "vitest/config";
// import viteConfig from "./vite.config.ts";

// export default mergeConfig(
//   viteConfig,
//   defineConfig({
//     test: {
//       includeSource: ["src/**/*.{js,ts}"],
//       coverage: {
//         enabled: true,
//         reporter: ["html"],
//       },
//     },
//   }),
// );
