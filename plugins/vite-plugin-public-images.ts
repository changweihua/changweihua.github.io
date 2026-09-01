// vite-plugin-public-images.js
import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

export default function publicImagesPlugin() {
  return {
    name: 'vite-plugin-public-images',
    buildStart() {
      // 读取 public/images 目录下的所有图片
      const imageDir = path.resolve(process.cwd(), 'public/images')

      if (fs.existsSync(imageDir)) {
        const imageFiles = glob.sync('**/*.{png,jpg,jpeg,gif,svg}', {
          cwd: imageDir,
          absolute: false,
        })

        // 将图片列表写入一个 JSON 文件
        const outputPath = path.resolve(process.cwd(), 'public/image-list.json')
        fs.writeFileSync(outputPath, JSON.stringify(imageFiles, null, 2))

        console.log(`✅ 生成图片列表: ${imageFiles.length} 张图片`)
      }
    },
  }
}
