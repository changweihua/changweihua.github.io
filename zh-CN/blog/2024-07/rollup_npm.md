---
lastUpdated: true
commentabled: true
recommended: true
title: 如何发布自己的NPM包
description: 如何发布自己的NPM包
date: 2024-07-16 15:18:00
pageClass: blog-page-class
---

# 如何发布自己的NPM包 #

## 创建一个项目 ##

新建一个文件夹并打开终端初始化项目

```bash
npm init
```

此时会根据你所填信息自动生成 `package.json` 的配置文件，这里主要包含了项目名称、版本号、作者、许可证等信息，同时可以记录项目的依赖信息以及自定义的脚本生成`package.json`文件

- name 字段指定了项目的名称为 maui-jsbridge。
- version 字段指定了项目的版本号为 1.0.0。
- description 字段提供了项目的简要描述。
- type 字段指定了项目模块的类型为 module，支持CommonJS和ES模块。
- main 字段指定了项目的主入口文件为 dist/index.js。
- module 字段指定了项目的主入口文件为 dist/index.esm.js。
- types 字段指定了项目的类型声明文件为 dist/index.d.ts。
- files 字段指定了项目发布时应包含的文件夹为 dist。
- scripts 字段定义了项目的脚本，用于构建项目。其中 build 脚本命令使用了 rollup -c 来构建项目。
- keywords 字段是项目的关键词列表，用于搜索和分类。
- author 字段指定了项目的作者为 changweihua@outlook.com。
- license 字段指定了项目的许可协议为 ISC。

**package.json**

```json
{
  "name": "maui-jsbridge",
  "version": "1.0.0",
  "description": "这是一个maui-jsbridge工具包",
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "tsc": "tsup --config=tsup.config.miniprogram.ts",
    "prebuild": "rimraf dist",
    "build": "rollup -c rollup.config.ts",
    "start": "rollup -c rollup.config.ts -w"
  },
  "keywords": ["maui-jsbridge"],
  "author": "changweihua@outlook.com",
  "license": "ISC"
}
```

### 安装打包工具 ###

- `Webpack`：是一个非常强大的模块打包器，它能够处理多种类型的模块（包括JavaScript、CSS、图片等），通过加载器（loaders）和插件（plugins）支持各种静态资源的处理和优化。Webpack支持代码拆分、懒加载等高级特性，适用于大型和复杂的项目构建。
- `Rollup`：专注于ES模块的打包工具，以其小巧、高效著称。Rollup擅长将小到中型的代码库打包成高性能的、适合浏览器或Node.js使用的模块。与Webpack相比，Rollup在处理纯ES模块项目时更为轻量级和快速，特别适合库的开发。
- `Parcel`：是一款快速、零配置的Web应用打包工具。Parcel强调开箱即用，自动处理诸如代码转换（如Babel）、样式处理（如PostCSS）、图片优化等任务，无需繁琐的配置。它的目标是提供一个简单而高效的开发体验，特别适合快速原型开发或是对配置要求不高的项目。

常见的打包工具有`webpack`、`rollup`、`parcel`等,这里选择`rollup`，因为`rollup`可以支持`ES`模块和`CommonJS`模块，并且可以支持`TypeScript`，所以安装`rollup`和`typescript`。`tsup`用于打包`TypeScript`代码。

```bash
npm install rollup typescript rimraf tsup -D
```

### 创建包的入口文件 ###

根目录下创建 `src` 文件夹，并在其中创建 `index.ts` 文件，用于编写代码。

```typescript
export class MauiJsBridge {
    static shell?: Window
    static frame?: Window
    static shellHandler?: (event: MessageEvent<IFrameMessage>) => void
    static frameHandler?: (event: MessageEvent<IFrameMessage>) => void

    /**
     * 初始化，必须先执行
     * @param window 
     */

    public static init(window: Window, callack?: (event: MessageEvent<IFrameMessage>) => void): void {
        MauiJsBridge.shell = window
        MauiJsBridge.shellHandler = callack
        callack && MauiJsBridge.shell.addEventListener('message', callack)
    }

    /**
    * 卸载根
    */
    public static dispose(): void {
        if (MauiJsBridge.shellHandler) {
            MauiJsBridge.shell?.removeEventListener('message', MauiJsBridge.shellHandler)
        }
        MauiJsBridge.shell = undefined
    }

    /**
     * 挂载iframe的window
     * @param window 
     */
    public static attach(window: Window, callack?: (event: MessageEvent<IFrameMessage>) => void): void {
        MauiJsBridge.frame = window
        MauiJsBridge.frameHandler = callack

        callack && MauiJsBridge.frame.addEventListener('message', callack)
    }

    /**
    * 卸载iframe的window
    */
    public static detach(): void {
        if (MauiJsBridge.frameHandler) {
            MauiJsBridge.frame?.removeEventListener('message', MauiJsBridge.frameHandler)
        }
        MauiJsBridge.frame = undefined
    }

    /**
     * 
     * @param message 广播消息，用于向iframe传递消息
     * @returns 
     */
    public static broadcastMessage(message: IFrameMessage, targetOrigin = '*'): number {
        if (!MauiJsBridge.frame) {
            alert('pls invoke attach first')
            return 0
        }

        MauiJsBridge.frame.postMessage(
            message,
            targetOrigin
        )
        return 1
    }

    /**
     * 
     * @param message 发送消息至Shell
     * @param targetOrigin 
     * @returns 
     */
    public static postMessage(message: IFrameMessage, targetOrigin = '*'): number {
        if (!MauiJsBridge.frame) {
            alert('pls invoke init first')
            return 0
        }

        MauiJsBridge.frame.postMessage(
            message,
            targetOrigin
        )
        return 1
    }
}

export interface IFrameMessage {
    command: FrameCommands
    params: Record<string, any>
}

export type FrameCommands = 'BROADCAST' | 'CHANGE_TITLE'
```

### 配置rollup ###

执行以下命令，安装rollup相应配置依赖

```bash
npm install rollup-plugin-node-resolve rollup-plugin-commonjs rollup-plugin-json rollup-plugin-sourcemaps rollup-plugin-terser rollup-plugin-typescript2 rimraf tsup -D
```

- `rollup-plugin-node-resolve` 用于解析第三方模块
- `rollup-plugin-commonjs` 用于将CommonJS模块转换为ES模块
- `rollup-plugin-typescript2` 用于TypeScript编译
- `rollup-plugin-json` 用于处理JSON文件
- `rollup-plugin-terser` 用于压缩代码
- `rimraf` 用于删除文件

根目录下创建 rollup.config.js 配置文件

```typescript
import resolve from 'rollup-plugin-node-resolve'  // 用于解析第三方模块
import commonjs from 'rollup-plugin-commonjs'   // 用于将CommonJS模块转换为ES模块
import typescript from 'rollup-plugin-typescript2'  //用于TypeScript编译
import json from 'rollup-plugin-json' // 用于处理JSON文件
import { terser } from 'rollup-plugin-terser' // 用于压缩代码

// const env = process.env.NODE_ENV //

// // 若打包正式环境，压缩代码 
// if (env === 'production') { 
//     config.plugins.push(terser({ 
//         compress: { 
//             pure_getters: true, 
//             unsafe: true, 
//             unsafe_comps: true, 
//             warnings: false 
//         } 
//     })) 
// } 

export default [{
  // 指定输入文件的路径，这里是项目的入口点
  input: `src/index.ts`,
  output: {
    // 指定输出文件的全局变量名，以便在全局范围内引用
    name: 'MauiJsBridge',
    // 指定输出文件的路径和名称
    file: 'dist/index.js',
    // 指定输出文件的格式，这里是UMD格式，可以在浏览器和Node.js环境中使用
    format: 'umd'
  },
  // 使用的插件列表，这里只包含typescript插件，用于编译TypeScript代码
  plugins: [
    json(),
    typescript({ useTsconfigDeclarationDir: true }),
    commonjs(), // 将CommonJS模块转换为ES模块
    resolve(), // 解析第三方模块
    terser()
  ],
}, {
  input: './src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    entryFileNames: '[name].cjs.js',
  },
  plugins: [
    json(),
    typescript({ useTsconfigDeclarationDir: true }),
    commonjs(), // 将CommonJS模块转换为ES模块
    resolve(), // 解析第三方模块
    terser()
  ],
}, {
  input: './src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: '[name].esm.js',
  },
  plugins: [
    json(),
    typescript({ useTsconfigDeclarationDir: true }),
    commonjs(), // 将CommonJS模块转换为ES模块
    resolve(), // 解析第三方模块
    terser()
  ],
}]
```

### 配置 TypeScript ###

根目录下创建 tsconfig.json 配置文件

```json
{
    "compilerOptions": {
        "forceConsistentCasingInFileNames": true,
        "moduleResolution": "Node",
        "target": "es5",
        "module": "ESNext",
        "lib": [
            "es2015",
            "es2016",
            "es2017",
            "dom"
        ],
        "strict": true,
        "declaration": true,
        "allowSyntheticDefaultImports": true,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "declarationDir": "dist/types",
        "outDir": "lib",
        "typeRoots": [
            "node_modules/@types"
        ]
    },
    "include": [
        "src"
    ],
    "exclude": [
        "src/**/__test__/*.test.ts",
    ]
}
```

- `moduleResolution`: 指定模块解析策略，采用Node.js风格
- `compilerOptions`: 译器选项配置，用于指导TypeScript如何编译代码
- `target`: 指定编译器输出的JavaScript版本为ES5。
- `module`: 定模块系统，使用ES2015模块系统
- `esModuleInterop`: 启用ES模块的互操作性。
- `lib`: 指定编译器使用的库，包含ES2015、ES2016、ES2017和DOM。
- `strict`: 启用严格的类型检查。
- `declaration`: 生成类型声明文件（.d.ts 文件）。
- `allowSyntheticDefaultImports` : 启用默认导入的语法。
- `experimentalDecorators` : 启用装饰器语法。
- `emitDecoratorMetadata`: 启用装饰器元数据的编译。
- `declarationDir`: 指定类型声明文件的输出目录为dist/types。
- `outDir`: 指定编译后的JavaScript代码的输出目录为lib。
- `typeRoots`: 指定类型声明文件的根目录，这里是node_modules/@types。
- `include`: 指定要编译的源代码文件，这里是src目录下的所有文件。

### 构建打包 ###

执行`npm run build`此时会在根目录下生成`dist`目录，里面有`index.js`和`types/index.d.ts`两个文件。

### 发布packege包到npm ###

- 首先需要注册一个npm账号，可以去npm官网按照步骤完成注册。
- 登录npm账号，登录前先检查一下npm源，很多人开发是已将把npm 源换成了淘宝镜像或者自己公司内部的，但是发布需要npm本身的源:https://registry.npmjs.org/
- 项目根路径输入 npm login 后按要求填写账号密码，然后输入 npm publish 发布包。

### package后期迭代更新 ###

- 给package添加一个readme文件，顺便测试一下怎么更新包。在文件目录下新建了一个README文件，编辑好内容保存
- 内容改好或者修改代码后不能直接发布，我们需要修改package的version号，修改之前先了解下npm维护package版本的规则x.y.z

```bash
x: 主版本号,通常有重大改变或者达到里程碑才改变;
y: 次要版本号,或二级版本号,在保证主体功能基本不变的情况下,如果适当增加了新功能可以更新此版本号;
z: 尾版本号或者补丁号,一些小范围的修修补补就可以更新补丁号.
npm version patch <=> z++
npm version minor <=> y++ && z=0
npm version major <=> x+= && y=0 && z=0
```

我们当前的版本号是1.0.12，这里只是加了个readme.md文件，那就将这次版本修改为1.0.13，在包的根目录下，命令行运行以下命令

```bash
// 更新一个补丁版本 1.0.13
npm version patch
// 更新到npm
npm publish
```
