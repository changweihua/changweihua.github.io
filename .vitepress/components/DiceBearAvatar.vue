<template>
  <img
    :src="avatarDataUri"
    :alt="`${seed} 的头像`"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useData } from 'vitepress'
  // 1. 导入 Avatar 和 Style
  import { Avatar, Style } from '@dicebear/core'
  // 2. 导入玻璃风格定义
  import glassDefinition from '@dicebear/styles/lorelei.json' with { type: 'json' }

  import { generateFingerprint } from '../src/sdk/fingerprint-sdk.ts'

  // 定义 Props
  interface Props {
    seed?: string
    size?: number
    // 可扩展其他选项
  }

  const { frontmatter } = useData()

  const props = withDefaults(defineProps<Props>(), {
    seed: 'lance.chang',
    size: 64
  })

  // 使用计算属性生成头像
  const avatarDataUri = computed<string>(() => {
    // 3. 用 Style 包装定义
    const style = new Style(glassDefinition)
    // 4. 传入 style 实例
    // // 生成指纹
    // const result = await generateFingerprint({
    //   canvas: true, // 启用 Canvas 指纹
    //   audio: true, // 启用 Audio 指纹
    //   webgl: true, // 启用 WebGL 指纹 (新增)
    //   fonts: true, // 启用字体检测 (新增)
    //   hardware: true // 启用硬件特征
    // })

    const avatar = new Avatar(style, {
      seed: `${frontmatter['fileHash']}`,
      size: props.size
    })
    return avatar.toDataUri()
  })
</script>
