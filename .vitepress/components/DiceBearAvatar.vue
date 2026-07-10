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
    const avatar = new Avatar(style, {
      seed: props.seed || `${frontmatter['fileHash']}`,
      size: props.size
    })
    return avatar.toDataUri()
  })
</script>
