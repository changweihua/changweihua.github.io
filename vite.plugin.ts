import { createHash } from "crypto"

// import WaterMark from "l-watermark";

export default function autoVersionPlugin() {
  return {
    name: 'auto-version',
    async transformIndexHtml(html: string) {
      const hash = createHash('md5').update(html).digest('hex')

      // window.document.querySelectorAll('.vp-doc img').forEach((element) => {
      //   console.log(element)
      //   // 右下角添加文字水印
      //   WaterMark.page({
      //     containerEl: element.parentElement!,
      //     text: '@ GitHub - Changweihua',
      //     color: 'rgba(255, 0, 0, 1)',
      //     fontSize: 20,
      //     cSpace: 20,
      //     vSpace: 10,
      //   })
      // })

      return html.replace(/(src|href)="(.*?)"/g, `$1="$2?v=${hash}"`)
    },
  }
}
