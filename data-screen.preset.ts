import { Preset } from "unocss";

// data-screen.preset.ts
export const dataScreenPreset: Preset = {
  name: 'data-screen',
  rules: [
    [/^ds-text-(\d+)$/, ([, size]) => ({
      'font-size': `${size}px`,
      'line-height': `${Number(size)*1.2}px`
    })],
    ['ds-gradient-bg', {
      'background': 'linear-gradient(135deg, var(--ds-primary) 0%, #1a237e 100%)'
    }]
  ],
  shortcuts: {
    'ds-card': 'ds-gradient-bg rounded-xl p-6 backdrop-blur-lg'
  }
}
