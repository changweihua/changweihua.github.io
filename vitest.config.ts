/// <reference types="vitest" />
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

export default defineConfig({
  test: {
    environment: 'jsdom',
    execArgv: [
      '--localstorage-file',
      path.resolve(os.tmpdir(), `vitest-${process.pid}.localstorage`),
    ],
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
