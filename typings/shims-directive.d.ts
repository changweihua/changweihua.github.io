import vThrottle from '@vp/directives/v-throttle'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    vThrottle: vThrottle
  }
}
