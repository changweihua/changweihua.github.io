<template>
  <div
    :id="`md-${hash}`"
    :data-file-hash="`${hash}`"
    :data-file-path="`${filePath}`"
    v-hero="{ id: `md-${hash}` }"
    :class="`markdown-content hero-folder-${folder}`"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
  interface Props {
    hash?: string
    filePath?: string
    folder?: 'blog' | 'manual' | 'gallery'
  }

  const props = withDefaults(defineProps<Props>(), {
    hash: '',
    filePath: '',
    folder: 'blog',
  })
</script>

<style scoped>
  .hero-simple {
    position: relative;
    padding-left: 16px;
  }

  .hero-simple::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 2px;
  }

  /* 包裹容器的基本样式 */
  .markdown-content {
    position: relative;
  }

  /* 开发模式下显示 hash */
  .markdown-content::before {
    content: 'Hash: ' attr(data-file-hash);
    position: absolute;
    top: 0;
    right: 0;
    background: rgba(0, 150, 255, 0.1);
    color: var(--vp-c-text-1);
    padding: 2px 6px;
    font-size: 11px;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    border-radius: 3px;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.2s;
  }

  @media screen and (min-width: 600px) {
    /*当屏幕尺寸大于600px时，应用下面的CSS样式*/
    .markdown-content:hover::before {
      opacity: 1;
    }
  }

  /* 为不同的文件夹添加不同的边框颜色 */
  /*
.markdown-content[data-file-path*="/blog/"] {
  border-left: 3px solid #3fb950;
}

.markdown-content[data-file-path*="/manual/"] {
  border-left: 3px solid #1f6feb;
}

.markdown-content[data-file-path*="/gallery/"] {
  border-left: 3px solid #a371f7;
}*/

  /* 打印时隐藏装饰 */
  @media print {
    .markdown-content::before {
      display: none;
    }

    .markdown-content {
      border-left: none !important;
    }
  }

  /*
.hero-folder-blog::before {
  background: linear-gradient(180deg, #3fb950, #2ea043);
}

.hero-folder-manual::before {
  background: linear-gradient(180deg, #1f6feb, #0969da);
}

.hero-folder-gallery::before {
  background: linear-gradient(180deg, #a371f7, #8957e5);
}*/
</style>
