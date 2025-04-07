---
lastUpdated: true
commentabled: true
recommended: true
title: 使用vite-plugin-dts插件生成类型定义文件
description: 使用vite-plugin-dts插件生成类型定义文件
date: 2024-08-28 12:18:00
pageClass: blog-page-class
---

# 使用vite-plugin-dts插件生成类型定义文件 #

> 尝试使用 Vite+Vue3+TypeScript 编写组件库，想着顺便生成类型文件便于引用该库的项目使用，看了一圈，感觉 vite-plugin-dts 插件很不错，故开始了探索之路。

## 发现现象 ##

`build` 后未生成任何 `.d.ts` 文件，反复检查了 `tsconfig.app.json` 文件、`tsconfig.json` 文件、及 `vite.config.ts` 文件，没有任何问题，且配置文件中内容都是脚手架默认生成的配置，插件官网也没有任何需要修改的地方，但是就是无法生成。


:::tabs

== tab tsconfig.app.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "forceConsistentCasingInFileNames": true,
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["packages/**/*.ts", "packages/**/*.tsx", "packages/**/*.vue", "examples/**/*.ts", "examples/**/*.tsx", "examples/**/*.vue"],
  "exclude": ["packages/**/__tests__/*","examples/**/__tests__/*", "node_modules", "dist"]
}
```

== tab tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "forceConsistentCasingInFileNames": true
  },
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

== tab vite.config.ts

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    //这里必须引入vite-plugin-dts插件，否则不会生成d.ts文件
    dts({
      // 这里定义了需要生成d.ts文件的目录，如果有多个目录，可以使用数组
      include: ['./packages/**/*.{vue,ts}']
    })
  ],
  base: '/',
  build: {
    lib: {
      //指定组件编译入口文件
      entry: path.resolve(__dirname, './packages/index.ts'), //指定组件编译入口文件
      // 组件库名称
      name: 'YuppieUI',
      // 文件名称
      fileName: 'yuppie-ui'
    }, //库编译模式配置
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      // external: ['vue', 'swiper', '@vuepic/vue-datepicker', 'qrcode'],
      output: {
        // format: 'es', // 默认es，可选 'amd' 'cjs' 'es' 'iife' 'umd' 'system'
        exports: 'named',
        globals: {
          //在UMD构建模式下为这些外部化的依赖提供一个全局变量
          vue: 'Vue'
          // 'vue-router': 'VueRouter', // 引入vue-router全局变量，否则router.push将无法使用
          // swiper: 'Swiper',
          // '@vuepic/vue-datepicker': 'VueDatePicker',
          // qrcode: 'qrcode'
        }
      }
    },
    /** 设置为 false 可以禁用最小化混淆，或是用来指定使用哪种混淆器。
        默认为 Esbuild，它比 terser 快 20-40 倍，压缩率只差 1%-2%。
        注意，在 lib 模式下使用 'es' 时，build.minify 选项不会缩减空格，因为会移除掉 pure 标注，导致破坏 tree-shaking。
        当设置为 'terser' 时必须先安装 Terser。（yarn add terser -D）
    */
    minify: 'terser', // Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效
    terserOptions: {
      // 在打包代码时移除 console、debugger 和 注释
      compress: {
        /* (default: false) -- Pass true to discard calls to console.* functions.
          If you wish to drop a specific function call such as console.info and/or
          retain side effects from function arguments after dropping the function
          call then use pure_funcs instead
        */
        drop_console: true, // 生产环境时移除console
        drop_debugger: true
      },
      format: {
        comments: false // 删除注释comments
      }
    }
  }
})
```

:::

## 找到症结 ##

翻阅了 Github 中的 `issue`，虽然类似的问题看见不少，但貌似都不是我这种现象，且类似问题出现的版本都比较低，开发者已在新版进行了修复

当我仔细尝试后发现，不管我在 `packages` 目录下新建 `Vue` 文件还是 `TS` 文件都无法生成，此时感觉并不是无法生成类型文件，感觉更像是 `tsconfig` 中的 `include` 作用域并没有生效，这是为什么呢？

后来查看了官方的[使用说明](https://github.com/qmhc/vite-plugin-dts/blob/main/README.zh-CN.md#%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)，[恍然大悟](https://github.com/qmhc/vite-plugin-dts/issues/343#issuecomment-2198111439)。

## 原因探明 ##

因为今年才开始从 vue-cli 转向 vite ，所以我深刻的记得原来的 Vite 项目中是没有 `tsconfig.app.json` 文件的，但是 Vite 打包是没有问题的，那说明它是可以正常加载到该配置文件的

一开始我以为是 Vite 的锅，但一想不对，Vite 这么大的体量不应该出现这个问题，这样岂不是相关插件都会受到相关影响吗

最终我把目标瞄向了 Vue，毕竟是基于 Vite 生成的 Vue 项目模板，那会不会是 Vue 模板生成的问题呢？

在 create-vue 项目的 [issue](https://github.com/vuejs/create-vue/issues/265) 中发现了点线索，根据这里提供的链接跳转到 `tsconfig` 对应的 [issue](https://github.com/vuejs/tsconfig/issues/16) 发现在 `0.3` 版本之后将配置文件进行了拆分。

这就能解释 `tsconfig.app.json` 文件是如何出现的了，基于此基本可以定位是属于该改动导致的插件读取的 `tsconfig` 配置不正确导致无法正常的生成对应的类型文件。

## 解决办法 ##

很难说这个应该是 `create-vue` 的问题还是 `vite-plugin-dts` 插件的问题，但解决办法也是很显然的，只要给当前插件指定正确的 `tsconfig` 配置文件即可，即：

```ts {14-15}
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    //这里必须引入vite-plugin-dts插件，否则不会生成d.ts文件
    dts({
      // 这里定义了需要生成d.ts文件的目录，如果有多个目录，可以使用数组
      include: ['./packages/**/*.{vue,ts}'],
      // 指定 tsconfig 文件
      tsconfigPath: 'tsconfig.app.json',
      // 你希望将所有的类型合并到一个文件中，只需指定 rollupTypes: true
      rollupTypes: false
    })
  ],
  base: '/',
  build: {
    lib: {
      //指定组件编译入口文件
      entry: path.resolve(__dirname, './packages/index.ts'), //指定组件编译入口文件
      // 组件库名称
      name: 'YuppieUI',
      // 文件名称
      fileName: 'yuppie-ui'
    }, //库编译模式配置
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      // external: ['vue', 'swiper', '@vuepic/vue-datepicker', 'qrcode'],
      output: {
        // format: 'es', // 默认es，可选 'amd' 'cjs' 'es' 'iife' 'umd' 'system'
        exports: 'named',
        globals: {
          //在UMD构建模式下为这些外部化的依赖提供一个全局变量
          vue: 'Vue'
          // 'vue-router': 'VueRouter', // 引入vue-router全局变量，否则router.push将无法使用
          // swiper: 'Swiper',
          // '@vuepic/vue-datepicker': 'VueDatePicker',
          // qrcode: 'qrcode'
        }
      }
    },
    /** 设置为 false 可以禁用最小化混淆，或是用来指定使用哪种混淆器。
        默认为 Esbuild，它比 terser 快 20-40 倍，压缩率只差 1%-2%。
        注意，在 lib 模式下使用 'es' 时，build.minify 选项不会缩减空格，因为会移除掉 pure 标注，导致破坏 tree-shaking。
        当设置为 'terser' 时必须先安装 Terser。（yarn add terser -D）
    */
    minify: 'terser', // Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效
    terserOptions: {
      // 在打包代码时移除 console、debugger 和 注释
      compress: {
        /* (default: false) -- Pass true to discard calls to console.* functions.
          If you wish to drop a specific function call such as console.info and/or
          retain side effects from function arguments after dropping the function
          call then use pure_funcs instead
        */
        drop_console: true, // 生产环境时移除console
        drop_debugger: true
      },
      format: {
        comments: false // 删除注释comments
      }
    }
  }
})
```
