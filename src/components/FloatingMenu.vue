<template>
  <div class="floating-menu">
    <svg width="0" height="0">
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
    <input type="checkbox" id="share" />
    <div class="target">
      <label class="share" for="share">分享</label>
      <span class="icon-share-weibo"
        ><img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC9UlEQVRYR92WgVEUUQyG/1SgVCBUoFQgVqBWIFSgVuBZgViBUAFQgVCBRwVCBUIFcb6dZCf77h17zJzDjJnZudvdty9//vxJnumJzZ7Yv/4/AO7+XNIHSfxiN5KuzWzZY3vrDLj7J0nfOs4AsjCz0/ruXwDYlXRcGMDf6+L0xMyO8n7rAHo0uzugDiV9ifcjiI0BxCYfJb2K61LS115uGx1A/YWZ3bk7IH4EiDdmdjkLIBzz0UEvr2a21z7v6OBOEg6X7n4SIl2a2f6DANz9XSBORfcY3m9ZCNALSVAPY88kAQKw7PU7NtpbC8DdERKUz9kO9OYi6G/voxQBcWRmJ+5OWl4MrKwRTdI05/xC0s9IDymqTJ2HQ3LP/7ehmYW7ox8qYxXAIyKfA8f7z2Z2XBzmfZ+BRqWbOJhbQ5UQMepHT/xWDeyMKQjh/GpoTAf3kqAR5NCXliUJ/eS0tZ5AAUBbvjSzwwog81I3uYr2WZ12o46KQbgVCJVAuaGVrg0AOtQTMX2bDUcLlnBwa2awsWKlzus71r7vNa0EUKPH+UFdHNHRRqE8rTtcIqBUfQUx9IFaory0iCobA88GpeaXGwhzMlwCAA2o7pnbTfZOAAiIWsbuzWys5Q64YQ3pkcTYzXwT2SQlpdlUFoaqqA9goM7vKzMbe767szgnGHOcyIYOJumspGQlMndH6S8bkcwy0ALIXCIg/iPYXn7btMHin45GV5hKESIQevVNnW4l/8PoDAC9Nj3ZuGEucZxS9y2oBFDTMAyMcEYkOPbIO1UwyWH29yJa1tDQqqGb3bYCBhGWDzOycXYHCDakKuqxahRjUzHoB23UobRS1hMR1pumiRDp90Tt7gDJiYfiz8s7xIlYW4rppIfrmtaEgcIETmADtcMGouPiaD2UWhy5UDigGDLtaek2OumQyofsoQNJTi+c9AZNu+916AVmZmdHfjx7JoyIoZgLy2ip8zwJMXDGU9Fc1Gs18JgPt7V2Iwa25ay3z5MD+AvEbGYRoqDXHQAAAABJRU5ErkJggg=="
      /></span>
      <span class="icon-share-wechat"
        ><img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACoElEQVRYR8WX4XEUMQyFnyoAKuBSAbkKgAqACshVQFIBoQKSCkgqIFcBXAWhA5IKuFQg5tuxb4zPXq/3bgb9XVl6epaevKb/bNbK7+7PJb2T9EbSIvPfSvopaWNmv1qxSt+rANydhJ9D4imxHyRdSlqbGcAm2R6AUPH3jsR5IpJ/MDOYado/ANz9VNIPSdB+qF2Z2UUryA5AJfmTpDtJAHtVCYbPjaT3kl5mPjdmthoDMQAItP8uVL6MzeXuAKEZUyP5It65u0P768xnZWYALFoEUAouM0sZosFoytTofpp1MHcv+dATJ7XGNHdntKi+ZG9jM1Wq48zAUmDxvjCq+Fyb2XkpAQCuJH0auSdoBWSuAfEIFaIBYz4PZnZSA1C6t7G+mftt109pABiggmdzo3ac211nDsA7gtRc47jCJooYlRA94WpoVHRhT64PZeAR+WXMgo4wgiSLQtbcFQCY2wNrSWch4deRJo2sUf0XM2PkdwYAxoMAPXYriXPfggL2nAUA4jRcEwCgi3ub2oixcnYGEo2NyTHXRFLYijlgg6bcRiUsKVipKhKRFP+PiQPb7y4U8yc7+IJE7g4AGIs2iFMqtbCQL5McxHWohupTG/S+EwDnlymAKc24DHefVk+g2O2wkysmhUF5Oh0R/G0KoKkHLCd3J1htNfc0I76bOQCaQHtQxCbMN+ImPDKIxbgNFQcGjindTxEA90NjMd97khma65TVXHmY9BSd+q7TFxEVNl+zhXGam5xzq+Z/QR49sEEjtka2BezRzBbdAIgaFg9jO1U9S2AG8ZoFIIDgFcxjcy6IwwAEEEwPIPKXcIt+vrMZL2czkGYIv3FxNee9EZdR/L9grPE5HoBCoyLJWzNDhvfM3bk+xvo4DEzhu+bzF2tWF6oPbpt7AAAAAElFTkSuQmCC"
      /></span>
      <span class="icon-share-qq"
        ><img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB+0lEQVRYR8WX4VECMRCF36tArUCpQKxAqECpQK1ArEA7UCoQOsAKhArEDrADrWCdd5PcAHe5XCCnO8Mvstkvm82+PSLBzOwYwBWAawBnAPrOfQVAvwXJWcKWYNvFZqagrwAE0WRrAA8k5232bgVgZlMAN2023FgzJjmJ+UQBzOwJwGNso8D/ysRLk28jgJkNALzvGVxu3wAuSOpaai0GsABweQCAXGckb5MBzEwV/nFgcO9+QlLZqFgwA2Y2BvCcCeCOpAo5CSBH+n3ACUkd6N8AliRV0EkAlin92mZNstcaIHMBNhZibRGamZrHfcYMaKvaphQCyFmA/hxvJKUnW1YBcOlX94uJTmqC1A1HJKWapW0BdBjcB6y05l0A0Z2nHi1xvWaGofcpAcxM/Vp6/xdWdsZNAN3R6V9Ed5NTkYUCoKN3HztLTzLtAQ4ZOmKBQv8XfcEDdPHuY2BFX6gD+OqwFn4AHDmyQqB2ATRSKxtdvYaRG+k14G5lQNNP3w8NZtbFiygl2Q076gerkBbkHMeUcaV+sNuGy2dYVy2ZR7IhSV1txUIZyN0VpQF6dpW5MKSGuabh3RMXzSeohnt0xaWT7bYCpo+UsBx7spbfgp8qLAeg+43pSO1k3PRdoM1VC3oR/oRqUjrBfPM+3We71spH6z2MILV+GirCX0O+wiEpSANxAAAAAElFTkSuQmCC"
      /></span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.floating-menu {
  position: fixed;
  right: 100px;
  bottom: 180px;

  svg {
    position: absolute;
  }

  .target {
    height: 120px;
    max-width: 200px;
    filter: url("#goo");
    text-align: center;
    position: relative;
  }

  .share {
    display: block;
    width: 64px;
    line-height: 64px;
    background-color: #cd0000;
    color: #fff;
    border-radius: 50%;
    margin: auto;
    position: relative;
    z-index: 1;
  }

  [type="checkbox"] {
    position: absolute;
    clip: rect(0 0 0 0);
  }

  [class*="icon-share-"] {
    position: absolute;
    width: 48px;
    height: 48px;
    background-color: #cd0000;
    border-radius: 50%;
    transition: transform 0.5s;
    top: 8px;
    left: 0;
    right: 0;
    margin: auto;
    -ms-transform: scale(0.5);
    transform: scale(0.5);
  }

  [class*="icon-share-"] > img {
    display: block;
    width: 20px;
    height: 20px;
    margin: 14px auto;
  }

  :checked + .target .icon-share-weibo {
    -ms-transform: scale(1) translate(-70px, 60px);
    transform: scale(1) translate(-70px, 60px);
  }

  :checked + .target .icon-share-wechat {
    -ms-transform: scale(1) translate(0, 75px);
    transform: scale(1) translate(0, 75px);
  }

  :checked + .target .icon-share-qq {
    -ms-transform: scale(1) translate(70px, 60px);
    transform: scale(1) translate(70px, 60px);
  }

  :checked + .target .share {
    animation: jello 1s;
  }

  @keyframes jello {
    from,
    11.1%,
    to {
      transform: none;
    }
    22.2% {
      transform: skewX(-12.5deg) skewY(-12.5deg);
    }
    33.3% {
      transform: skewX(6.25deg) skewY(6.25deg);
    }
    44.4% {
      transform: skewX(-3.125deg) skewY(-3.125deg);
    }
    55.5% {
      transform: skewX(1.5625deg) skewY(1.5625deg);
    }
    66.6% {
      transform: skewX(-0.78125deg) skewY(-0.78125deg);
    }
    77.7% {
      transform: skewX(0.390625deg) skewY(0.390625deg);
    }
    88.8% {
      transform: skewX(-0.1953125deg) skewY(-0.1953125deg);
    }
  }
}
</style>
