import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'web-ext',
    environmentOptions: {
      'web-ext': {
        path: './dist',
        compiler: 'npm run build',
        autoLaunch: true,
        targetUrl: 'https://www.example.com',
        playwright: {
          userDataDir: './.playwright',
          devtools: true,
          slowMo: 100,
        },
      },
    },
  },
})
