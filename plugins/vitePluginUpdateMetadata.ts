import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import crypto from 'crypto'

export function updateMetadata(): Plugin {
  return {
    name: 'vite-plugin-update-metadata', // 插件名称
    apply: 'build', // 仅在构建时应用
    version: '1.0.0', // 插件版本

    // 在打包完成后执行
    buildStart() {
      // 获取 metadata.json 文件路径
      const metadataPath = path.resolve(process.cwd(), 'public/metadata.json')

      //  检查 Metadata.json 是否存在
      if (!fs.existsSync(metadataPath)) {
        // 不存在则创建一个空的 metadata.json 文件
        fs.writeFileSync(metadataPath, JSON.stringify({}, null, 2), 'utf-8')
      }

      // 读取并解析 JSON 文件
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))

      // 更新 buildTime 字段为当前时间
      metadata.buildTime = new Date().toLocaleString()

      // 更新 uid 字段
      metadata.uid = crypto.randomUUID()

      // 将更新后的 JSON 写回文件
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8')

      console.table(metadata)
      console.log('metadata.json 数据已经更新完成！\r\n')
    },
  }
}
