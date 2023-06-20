/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/App.vue',
    './src/**/*.js',
    './src/**/*.vue',
    './.vitepress/theme/*.vue',
    './.vitepress/theme/*.js'
  ],
  // purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  
  theme: {
    extend: {},
  },
  plugins: [],
  // important: true,
  prefix: "tw"
}

