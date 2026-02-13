/**
 * Device Fingerprint ID Generator SDK (TypeScript)
 *
 * A privacy-focused, permission-less device fingerprinting library.
 * Generates a stable, high-entropy device identifier using browser signals.
 *
 * @version 1.1.0
 */

// ----------------------------------------------------------------------
// Type Definitions
// ----------------------------------------------------------------------

interface HardwareTraits {
  concurrency: number | 'unknown'
  memory: number | 'unknown'
  platform: string
  language: string
  colorDepth: number
  pixelDepth: number
  timezoneOffset: number
}

interface CanvasSignalResult {
  error: string | null
  hash: string | null
  dataUrl: string | null
}

interface HardwareSignalResult {
  traits: HardwareTraits
  toString: () => string
}

interface FingerprintComponents {
  canvas?: string | null
  audio?: string
  webgl?: string
  fonts?: string
  hardware?: HardwareSignalResult
  [key: string]: any
}

interface FingerprintOptions {
  canvas?: boolean
  audio?: boolean
  webgl?: boolean
  fonts?: boolean
  hardware?: boolean
}

interface FingerprintResult {
  deviceId: string
  entropyScore: number
  generationTimeMs: number
  components: FingerprintComponents
  details: {
    canvasDataUrl?: string | null
    canvasError?: string
    webgl?: string
    fonts?: string[]
    hardware?: HardwareTraits
    [key: string]: any
  }
  _debug_featureString?: string
}

interface NavigatorExtended {
  deviceMemory?: number
  hardwareConcurrency?: number
}

// ----------------------------------------------------------------------
// Hashing Utility (MurmurHash3 32-bit) - 常量全部使用 const
// ----------------------------------------------------------------------

function murmurhash3_32_gc(key: string, seed: number): number {
  const remainder = key.length & 3
  const bytes = key.length - remainder
  const c1 = 0xCC9E2D51
  const c2 = 0x1B873593

  let h1 = seed
  let i = 0

  while (i < bytes) {
    let k1
      = (key.charCodeAt(i) & 0xFF)
        | ((key.charCodeAt(++i) & 0xFF) << 8)
        | ((key.charCodeAt(++i) & 0xFF) << 16)
        | ((key.charCodeAt(++i) & 0xFF) << 24)
    ++i

    k1 = (((k1 & 0xFFFF) * c1) + ((((k1 >>> 16) * c1) & 0xFFFF) << 16)) & 0xFFFFFFFF
    k1 = (k1 << 15) | (k1 >>> 17)
    k1 = (((k1 & 0xFFFF) * c2) + ((((k1 >>> 16) * c2) & 0xFFFF) << 16)) & 0xFFFFFFFF

    h1 ^= k1
    h1 = (h1 << 13) | (h1 >>> 19)
    const h1b = (((h1 & 0xFFFF) * 5) + ((((h1 >>> 16) * 5) & 0xFFFF) << 16)) & 0xFFFFFFFF
    h1 = ((h1b & 0xFFFF) + 0x6B64 + ((((h1b >>> 16) + 0xE654) & 0xFFFF) << 16))
  }

  let k1 = 0
  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xFF) << 16
      break
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xFF) << 8
      break
    case 1:
      k1 ^= key.charCodeAt(i) & 0xFF
      k1 = (((k1 & 0xFFFF) * c1) + ((((k1 >>> 16) * c1) & 0xFFFF) << 16)) & 0xFFFFFFFF
      k1 = (k1 << 15) | (k1 >>> 17)
      k1 = (((k1 & 0xFFFF) * c2) + ((((k1 >>> 16) * c2) & 0xFFFF) << 16)) & 0xFFFFFFFF
      h1 ^= k1
  }

  h1 ^= key.length
  h1 ^= h1 >>> 16
  h1 = (((h1 & 0xFFFF) * 0x85EBCA6B) + ((((h1 >>> 16) * 0x85EBCA6B) & 0xFFFF) << 16)) & 0xFFFFFFFF
  h1 ^= h1 >>> 13
  h1 = (((h1 & 0xFFFF) * 0xC2B2AE35) + ((((h1 >>> 16) * 0xC2B2AE35) & 0xFFFF) << 16)) & 0xFFFFFFFF
  h1 ^= h1 >>> 16

  return h1 >>> 0
}

function getHash64(key: string, seed: number = 1337): string {
  const h1 = murmurhash3_32_gc(key, seed)
  const h2 = murmurhash3_32_gc(key, seed + 0x5F3759DF)
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')
}

// ----------------------------------------------------------------------
// Signal 1: Canvas Fingerprinting
// ----------------------------------------------------------------------

function getCanvasSignal(): CanvasSignalResult {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return { error: 'ERROR_NO_CONTEXT', hash: null, dataUrl: null }
    }

    canvas.width = 240
    canvas.height = 80

    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'rgb(255,0,255)'
    ctx.beginPath()
    ctx.arc(50, 40, 20, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = 'rgb(0,255,255)'
    ctx.beginPath()
    ctx.arc(100, 40, 20, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = 'rgb(255,255,0)'
    ctx.beginPath()
    ctx.arc(75, 60, 20, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = 'rgb(255,0,255)'
    ctx.beginPath()
    ctx.arc(180, 40, 30, 0, Math.PI * 2, true)
    ctx.arc(180, 40, 15, 0, Math.PI * 2, true)
    ctx.fill('evenodd')

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    let sampleData = ''
    const step = Math.max(4, Math.floor(pixels.length / 500))

    for (let i = 0; i < pixels.length; i += step) {
      sampleData += String.fromCharCode(pixels[i], pixels[i + 1], pixels[i + 2])
    }

    const fingerHash = getHash64(sampleData)

    return {
      error: null,
      hash: fingerHash,
      dataUrl: canvas.toDataURL(),
    }
  }
  catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    return { error: `ERROR_CANVAS: ${error}`, hash: null, dataUrl: null }
  }
}

// ----------------------------------------------------------------------
// Signal 2: Audio Fingerprinting - 常量全部 const
// ----------------------------------------------------------------------

async function getAudioSignal(): Promise<string> {
  try {
    const AudioContextConstructor = (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext
    if (!AudioContextConstructor) {
      return 'ERROR_NOT_SUPPORTED'
    }

    const context = new AudioContextConstructor(1, 4096, 44100) as OfflineAudioContext
    const oscillator = context.createOscillator()
    oscillator.type = 'triangle'
    oscillator.frequency.value = 10000

    const compressor = context.createDynamicsCompressor()
    compressor.threshold.value = -50
    compressor.knee.value = 40
    compressor.ratio.value = 12
    compressor.attack.value = 0
    compressor.release.value = 0.25

    oscillator.connect(compressor)
    compressor.connect(context.destination)
    oscillator.start(0)

    const buffer = await context.startRendering()
    const data = buffer.getChannelData(0)

    let signal = 0
    for (let i = 0; i < data.length; i += 10) {
      signal += Math.abs(data[i])
    }

    return signal.toFixed(1)
  }
  catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    return `ERROR_AUDIO: ${error}`
  }
}

// ----------------------------------------------------------------------
// Signal 3: WebGL Fingerprinting - ✅ 类型断言修复
// ----------------------------------------------------------------------

function getWebGLSignal(): string {
  try {
    const canvas = document.createElement('canvas')

    // 显式断言为 WebGLRenderingContext，解决联合类型问题
    let gl: WebGLRenderingContext | null = canvas.getContext('webgl') as WebGLRenderingContext | null
    if (!gl) {
      gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
    }
    if (!gl) {
      return 'ERROR_NO_WEBGL'
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    const params: Record<string, string> = {
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      version: gl.getParameter(gl.VERSION),
      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unavailable',
      maxTextureSize: String(gl.getParameter(gl.MAX_TEXTURE_SIZE)),
      maxVertexAttribs: String(gl.getParameter(gl.MAX_VERTEX_ATTRIBS)),
      maxViewportDims: (gl.getParameter(gl.MAX_VIEWPORT_DIMS) as number[]).join('x'),
    }

    return Object.values(params).join('|')
  }
  catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    return `ERROR_WEBGL: ${error}`
  }
}

// ----------------------------------------------------------------------
// Signal 4: Font Detection - 常量全部 const
// ----------------------------------------------------------------------

function getFontSignal(): string {
  try {
    const baseFonts = ['monospace', 'sans-serif', 'serif'] as const
    const testFonts = [
      'Arial',
      'Verdana',
      'Times New Roman',
      'Courier New',
      'Georgia',
      'Palatino',
      'Garamond',
      'Comic Sans MS',
      'Trebuchet MS',
      'Arial Black',
      'Impact',
      'Tahoma',
      'Helvetica',
      'Calibri',
      'Consolas',
      'Microsoft YaHei',
      'SimSun',
      'SimHei',
      'PingFang SC',
      'Hiragino Sans',
    ] as const

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return 'ERROR_NO_CONTEXT'
    }

    const testString = 'mmmmmmmmmmlli'
    const textSize = '72px'

    const baseMeasurements: Record<string, number> = {}
    for (const baseFont of baseFonts) {
      ctx.font = `${textSize} ${baseFont}`
      baseMeasurements[baseFont] = ctx.measureText(testString).width
    }

    const availableFonts: string[] = []
    for (const font of testFonts) {
      let detected = false
      for (const baseFont of baseFonts) {
        ctx.font = `${textSize} '${font}', ${baseFont}`
        const measurement = ctx.measureText(testString).width
        if (measurement !== baseMeasurements[baseFont]) {
          detected = true
        }
      }
      if (detected) {
        availableFonts.push(font)
      }
    }

    return availableFonts.sort().join('|') || 'none'
  }
  catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    return `ERROR_FONT: ${error}`
  }
}

// ----------------------------------------------------------------------
// Signal 5: Hardware & Screen - 常量全部 const
// ----------------------------------------------------------------------

function getHardwareSignal(): HardwareSignalResult {
  const n = navigator as Navigator & NavigatorExtended
  const s = screen

  let timezoneOffset: number
  try {
    const now = new Date()
    const jan = new Date(now.getFullYear(), 0, 1)
    const jul = new Date(now.getFullYear(), 6, 1)
    timezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset())
  }
  catch {
    timezoneOffset = new Date().getTimezoneOffset()
  }

  const traits: HardwareTraits = {
    concurrency: n.hardwareConcurrency ?? 'unknown',
    memory: n.deviceMemory ?? 'unknown',
    platform: n.platform || 'unknown',
    language: n.language || 'unknown',
    colorDepth: s.colorDepth,
    pixelDepth: s.pixelDepth,
    timezoneOffset,
  }

  return {
    traits,
    toString(): string {
      return [
        traits.concurrency,
        traits.memory,
        traits.platform,
        traits.language,
        traits.colorDepth,
        traits.pixelDepth,
        traits.timezoneOffset,
      ].join('|')
    },
  }
}

// ----------------------------------------------------------------------
// Normalization
// ----------------------------------------------------------------------

function normalizeSignals(components: FingerprintComponents): string {
  const keys = Object.keys(components).sort()
  return keys
    .map((key) => {
      const val = components[key]
      if (val && typeof val.toString === 'function' && typeof val !== 'string') {
        return `${key}:${val.toString()}`
      }
      return `${key}:${val}`
    })
    .join(';;')
}

// ----------------------------------------------------------------------
// Main Generator - 常量全部 const
// ----------------------------------------------------------------------

export async function generateFingerprint(options: FingerprintOptions = {}): Promise<FingerprintResult> {
  const config: Required<FingerprintOptions> = {
    canvas: true,
    audio: true,
    webgl: true,
    fonts: true,
    hardware: true,
    ...options,
  }

  if (typeof window === 'undefined') {
    return {
      deviceId: 'ERROR_SSR',
      entropyScore: 0,
      generationTimeMs: 0,
      components: {},
      details: {},
    }
  }

  const components: FingerprintComponents = {}
  const detailedInfo: FingerprintResult['details'] = {}
  const startTime = performance.now()

  // 同步信号
  if (config.canvas) {
    const res = getCanvasSignal()
    components.canvas = res.hash ?? res.error
    if (res.dataUrl)
      detailedInfo.canvasDataUrl = res.dataUrl
    if (res.error)
      detailedInfo.canvasError = res.error
  }

  if (config.webgl) {
    const res = getWebGLSignal()
    components.webgl = res
    if (!res.startsWith('ERROR_')) {
      detailedInfo.webgl = res
    }
  }

  if (config.fonts) {
    const res = getFontSignal()
    components.fonts = res
    if (!res.startsWith('ERROR_')) {
      detailedInfo.fonts = res.split('|')
    }
  }

  if (config.hardware) {
    const res = getHardwareSignal()
    components.hardware = res
    detailedInfo.hardware = res.traits
  }

  // 异步信号
  const tasks: Promise<void>[] = []
  if (config.audio) {
    tasks.push(
      getAudioSignal().then((res) => {
        components.audio = res
      }),
    )
  }

  await Promise.all(tasks)

  const featureString = normalizeSignals(components)
  const deviceId = getHash64(featureString)

  let entropyScore = 0
  if (config.canvas && components.canvas && !String(components.canvas).startsWith('ERROR_'))
    entropyScore += 10
  if (config.audio && components.audio && components.audio !== 'ERROR_NOT_SUPPORTED' && !String(components.audio).startsWith('ERROR_'))
    entropyScore += 5
  if (config.webgl && components.webgl && !String(components.webgl).startsWith('ERROR_'))
    entropyScore += 8
  if (config.fonts && components.fonts && !String(components.fonts).startsWith('ERROR_'))
    entropyScore += 10
  if (config.hardware)
    entropyScore += 5

  const endTime = performance.now()

  return {
    deviceId,
    entropyScore,
    generationTimeMs: Math.round(endTime - startTime),
    components,
    details: detailedInfo,
    _debug_featureString: featureString,
  }
}
