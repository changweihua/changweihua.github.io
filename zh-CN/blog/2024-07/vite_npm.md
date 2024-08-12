---
lastUpdated: true
commentabled: true
recommended: true
title: 如何使用vite开发npm库
description: 如何使用vite开发npm库
date: 2024-07-16 15:18:00
pageClass: blog-page-class
---

# 如何使用vite开发npm库 #

::: tip
如何搭建一个vite项目，并配置为库模式，为es模块化、umd打包出对应语法的两套js库文件。
用typescript开发库时，如何在vite中自动生成声明文件呢。
开发库时package.json中哪些属性必须设置。e.g：只发布哪些文件到npm上，以及不同导入方式，会返回哪个文件给人家。
关于软链接npm link相关的命令，让你在本地提前安装上要发布的库并使用。
也会介绍热更新式的调试模式，提升开发体验！
在npm设置了淘宝镜像的情况下。如何便捷登录和发布npm包到官方源。
:::


## 前置知识-关于库（包）名 ##

任何库的库名都是对应`package.json`里的`name`属性值（与文件名，导出什么模块没关系），安装第三方依赖库时，也是通过它来找到该库，所以如果要发布到`npm`上，`name`值必须是`npm`上没有发布过的。

```bash
# npm info packagename 命令，查找npm上名为packagename的依赖，
# 找到了会返回版本信息，可用它来看看自己要发布的库（包）是否被发布过了
npm info packagename 
```

既然库名和代码没任何关系，那`import xxx from 'packagename`时，是怎么找到对应的模块所在的js文件的呢? 答案在`package.json`里，它的`main、module`属性值保存了不同导入方式，指向哪个js文件的信息。文章后面也会介绍。

下面介绍中用到的`packagename`就是指代`package.json`里的`name`值。

## 搭建vite项目来打包库 ##

假设我们要开发一个叫`vite-maui`的库，初始化项目文件夹时，文件夹目录名也应该和库名一致：

### 创建一个名为vite-maui的项目目录，并初始化npm ###

```bash
mkdir vite-mauie && cd vite-maui && mkdir src && npm init -y
```

然后安装vue、vite为开发依赖，这里假设是开发vue生态的插件：

### 打包库时，不需要把vue打包进来，安装为开发依赖即可 ###

```bash
npm i vue vite -D
```

然后在项目src目录里创建个入口文件，例如index.ts，随便写点东西：

```bash
// vite-maui/src/index.ts
console.log('hellow npm')
```
创建`vite.config.js`，并配置为库模式，可到vite官网查看更多：

```typescript
import { resolve } from 'path'
import { defineConfig } from 'vite'

// vite默认会打包出umd和es模块化两种导出方式的文件，以下配置会打包出两份结果：
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, './src/index.ts'),
      name: 'viteMaui',
      // 构建好的文件名（不包括文件后缀）
      fileName: 'vite-maui',
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下,全局模式下为这些外部化的依赖提供一个全局变量
        globals: {
            viteMaui: 'viteMaui',
        },
      },
    },
  },
})
```
到这里，就可以用vite打包了：

### 为了方便演示，先用npx来执行命令 ###

```bash
npx vite build
```

执行以上命令后，构建结果会输出到dist目录，默认有两个js文件，它们只是使用的导出规范（语法）不同，具体代码功能是一样的。

- vite-maui.umd.js：umd导出方式，兼容amd commenjs等导出的库实现。
- vite-maui.mjs：es模块化导出方式的库实现。

有了这俩文件，就可以覆盖目前主流的多种前端模块化环境了，在不同的环境，导入对应的js文件即可。

## 自动生成dts声明文件 ##

配置好vite.config.js后，就可以构建了。但是如果是使用ts开发库，则需要配置自动生成dts声明文件（不想自己写），有两种方式。如果使用js开发，跳过这一步即可。

### 方式一：自己安装typescript并配置tsconfig.js ###

首先，安装依赖并生成tsconfig.json：

**安装tsc依赖**

```bash
npm i typescript -D
```

**自动生成tsconfig.json**

```bash
npx tsc --init
```

然后，修改生成的tsconfig.json，让tsc命令只生成声明文件，不转译ts文件：

```json
{
    "compilerOptions":{
        // ...其它配置
        "declaration": true, // 自动生成声明文件
        "declarationDir": "dist", // 声明文件输出的目录
        "emitDeclarationOnly": true, // 只输出声明文件，不转译ts文件
    }
}
```
最后，在执行vite构建命令时，同时执行一下tsc来生成声明文件：

```bash
npx vite build && npx tsc
```

### 方式二（推荐）：使用vite插件，执行vite命令时，会一并生成声明文件。如vite-plugin-dts插件 ###

首先，安装vite-plugin-dts依赖：

**下载vite-plugin-dts插件**

```bash
npm i vite-plugin-dts -D
```

然后，在vite中引入该插件，并注册：

该插件会默认先读取根目录tsconfig.json（没有则使用默认的）的部分配置，但入口文件，输出目录会和vite保持一致。

```typescript
// vite.config.js
import dts from 'vite-plugin-dts'
​
export default defineConfig({
  // ...其它配置
  plugins: [dts()],
})
```

最后，直接执行vite构建命令，即可同时生成声明文件：

```bash
npx vite build
```

>
> 注：
> 上面两种方式，生成的声明文件，是和src文件夹里的ts文件一一对应的，如src/index.ts => dist/index.d.ts。
> 
> vite配置的库输出文件名：build.lib.filename、入口文件名、库名三者最好一致，这样声明文件名的头部名字和库名可以对上。否则可能出现声明文件不生效的问题。
> 
> 如果在入口文件里需要导入某个文件夹里的index.ts，务必把路径写全，如：import xx from "tools/index"，如果把index文件名省略，自动生成dts的插件是无法正常找到index文件的。


## 配置package.json指定库信息 ##

上面的步骤中，`vite`的作用有两个：

一、为不同导出规范，打包出对应的`js`文件（模块），如`es`模块化和`umd`。

二、生成对应的`dts`声明文件。

打包结果输出到`dist`目录后，还不能称为一个`npm`库，还缺少库的描述信息，如库名、版本、不同导入方式返回哪个文件等信息。这些信息都需要在`package.json`的对象里定义。

当一个业务项目中（通过`npm`下载）导入一个库时，是导入它提供的`es`模块化的文件还是`umd`的文件呢，这就需要读取`package.json`的`main`和`module`属性来决定。

`main`属性值是`非es`模块化导入时，导入的文件，所以需要指定为构建好的`umd`语法的`js`文件路径。

```bash
// 以下语句会导入main属性值指定的文件
require('packagename')
```

`module`属性值是`es`模块化导入时，导入的文件，指定为构建好的`es`模块化语法的`mjs`文件路径。
`module`是`npm`为了支持`es`模块化，又不影响以往的`amd`、`umd`等模块化语法扩充的属性，是对`main`的一个扩展。`main`继续用来支持旧的模块化，扩充`module`用来支持`es`模块化。

```bash
// 以下语句会导入module属性值指定的文件
import xx from 'packagename'
```

如果有`dts`声明文件（上面步骤生成的，没有则不配置），还需要指定声明文件路径：

- typings：声明文件的路径。

**另外还有三个与发布相关的属性：**

- name：库名，在npm上必须唯一，否则无法发布，别人也是通过该库名来执行下载npm install的。
- files：指定哪些文件要发布到npm上，一般指定为构建输出目录，如dist。另外，根目录的package.json、readme.md无需指定，发布时也会带上。
- version：指定当前库的版本。每次发布都要把版本提高一下，否则无法发布到npm上。

## 发布前调试 ##

正在本地开发的库，在还没发布到`npm`之前，如何安装到真实的项目环境中调试呢？

可以给正在开发的库创建一个软链接，并把软链接放到你全局的`node_modules`目录中。相当于把它变成一个全局依赖。这个过程可以使用`npm link`来实现。

然后你本地的任意项目，都可以通过`npm link packagename`来安装该库。例如有一个`demo`项目，安装了你开发中的库后，`demo`项目就可以实时访问并同步开发中的库的更改了，无需重复创建软链接和重新安装。

### 生成软链接 ###

首先，为已经构建好的库（已经构建好了产物、package.json也配置了），在你的全局node_modules目录中生成一个软链接：

在库目录下，执行：

```bash
# 为该库创建一个本地全局可见的软链接，可以在全局的node_modules目录里找到它。
npm link

# 删除该全局软连接
npm unlink
# 如果想要在任意目录下删除该全局软链接
# PS：不加 -g 则默认只删除pwd目录下的该依赖，不会访问全局的node_modules
npm unlink packagename -g
```

查看全局依赖目录下都安装了哪些依赖，来判断是否在全局成功创建、删除全局软连接：

```bash
# 查看全局node_modules目录中是否有该依赖（软链接的方式存在），ls是list的简写
npm ls -g
# 指定依赖查找深度为浅层，速度会更快一点点
npm ls -g --depth 0

# 如果全局依赖太多，只想看某个库是否安装了
npm ls packagename -g
```

### “下载” ###

然后，在本地的demo项目中，“下载”该库。

demo项目，安装该开发中的库：

```bash
# 安装：这里link相当于install
npm link packagename

# 从demo项目的node_modules目录中删除该库，
# 但库的软链接还是会留在全局的node_modules目录中
npm unlink packagename
```

查看demo项目中，是否成功安装该库：

```bash
npm ls packagename : 可以查看依赖在项目中的被依赖关系及对应的版本。

npm ls packagename
```

## 构建热更新 ##

demo项目通过软链接安装该库后，每当库项目打包好，都可以实时同步更改，无需重复卸载安装该库。我们要做到就是，改一次库的代码就执行一下构建命令，demo项目也会同步最新的库文件。但每次都要手动构建会很麻烦。

可以在执行打包时，监听文件的变化，当文件变化后，立马构建，解放双手：

```bash
# 执行打包后，控制台不会退出，而是监听文件变化，并自动构建
npx vite build --watch
```

> 注意：只能和自动生成dts的第二种方式搭配使用，因为频繁构建会把tsc生成的声明文件删除

## 发布到npm上 ##

通过以上步骤构建好了产物、dts声明文件，并把库信息更新到了package.json里后，测试也没问题了，就可以发布到npm上啦！

这里假设配置了淘宝镜像源，所以每句命令都指定访问目标为npm官方源。否则会报错。如果是使用npm官方源，直接使用npm login等命令即可。

首先，库项目目录下，执行登录命令，然后根据提示输入账号密码即可：

```bash
npm login --registry https://registry.npmjs.org
```

登录成功后，执行发布命令：

```bash
# 如果登录过，每次发版，直接publish即可
npm publish --registry https://registry.npmjs.org

# 撤销发布某个版本：package.json中对应version的版本
npm unpublish --force --registry https://registry.npmjs.org
```

为了方便，可以把这些命令配置到`package.json`的`scripts`中。

注意执行`publish`的命令的属性名，不能是`publish`，因为执行`npm run publish`会执行两次发布

**package.json**

```json
 "scripts": {
    "build": "vite build",
    "build:watch": "vite build --watch",
    "pushnpm": "npm publish --registry https://registry.npmjs.org"
  },
```

第一次发版、后续的版本更新都通过以下命令发布即可，发布成功后会有邮件提示的。

```bash
npm run pushnpm
```

最后，不要忘了给你的库添加一个`readme.md`的文件，向大家介绍你的库怎么用，用你的库会收获哪些快乐等。
