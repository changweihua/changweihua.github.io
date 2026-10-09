<template>
  <div v-html="avatarSvg" />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  // 注意：导入路径为 @imdevesh/multiavatar/esm
  import multiavatar from '@imdevesh/multiavatar/esm'

  interface Props {
    /** 用于生成确定性头像的种子字符串 */
    seed?: string
    /** 是否移除圆形背景（环境部分） */
    sansEnv?: boolean
    /** 强制指定初始版本 */
    ver?: { part: string; theme: 'A' | 'B' | 'C' }
    /** 性别过滤：'male' | 'female' */
    gender?: 'male' | 'female'
  }

  const props = withDefaults(defineProps<Props>(), {
    seed: 'Felix',
    sansEnv: false,
    ver: undefined,
    gender: undefined
  })

  /**
   * 生成 SVG 字符串
   * multiavatar 函数签名：(string, sansEnv?, ver?, options?)
   * 参考：https://www.npmjs.com/package/@imdevesh/multiavatar[reference:0]
   */
  const avatarSvg = computed<string>(() => {
    // 构建 options 对象
    const options: Record<string, string> = {}
    if (props.gender) {
      options.gender = props.gender
    }

    // 调用 multiavatar 生成 SVG
    return multiavatar(props.seed, props.sansEnv, props.ver, Object.keys(options).length > 0 ? options : undefined)
  })
</script>
