---
lastUpdated: true
commentabled: true
recommended: true
title: 写个vite插件自动处理系统权限，降低99%重复工作
description: 写个vite插件自动处理系统权限，降低99%重复工作
date: 2025-10-27 13:00:00 
pageClass: blog-page-class
cover: /covers/vue.svg
---

## 前言 ##

好久没有更文章咯，最近做一个中台系统的权限控制功能，由于路由权限和角色权限都简单，但是要做按钮权限有点麻烦，因为太多按钮了。其实我以前也做过这个功能，简单暴力做法就是每个按钮用自定义指令去判断是否有权限显示。但是重复代码也太多太多，并且维护性极差，代码固定难以调整。

所以这次终于忍不住了，决定抽时间做一个vite插件去自动生成对比按钮权限的代码，下面细说实现过程。

## 基本思路 ##

项目构建的时候vite自动帮我全局插入按钮权限的代码，并且跟接口获取存放在pinia仓库的权限列表对比是否有权限展示。
基本思路简单又明确，但需要考虑的细节还是很多的，下面一一列举分析。

### 如何识别生成独一无二的按钮编码 ###

插入的编码选择按规则自动化语义化生成的，规则如下所示。

`权限编码 = 路径+后缀`，这样每个按钮都能独一无二

例如路径是`scr/view/index.vue`的新增按钮，那么编码就是 `scr/view/index_create`

下方表格随便列个常见的后缀规则，这些都是可以自己定义约束的

|  按钮名称   |      权限后缀  |
| :-----------: | :-----------: |
| 新增 | create |
| 编辑 | edit |
| 删除 | delete |
| 查看 | view |
| 导出 | export |

**简单示例**

```typescript
// 相对src路径
const filePath = relative(process.cwd(), id).replace(extname(id), '')
const result = code.split('\n')

// 映射表
const butTextMap: Record<string, string> = {
  '新增': 'create',
  '编辑': 'edit',
  '删除': 'delete',
  '查看': 'view',
  '导出': 'export',
}

//拼接得到编码
const permCode = `${filePath}_${suffix}`
```

### 考虑对比多种UI库的按钮 ###

系统可能使用了原生的 `button`，也可能是 `el-button` 或者其它更多UI库的按钮，这些需要在识别中做针对处理即可，或者只识别 `button` 部分，因为各种库只是添加了前缀，其实都有 `button` 组成。

### 无法规则生成编码的特殊按钮处理 ###

例如除了下列常见规则外，可能还有一些不规则按钮，例如"跳转系统"这种高度个性化按钮

小编选择的解决方案是直接在按钮上输入编码特殊处理，在自动插入时判断是否已经有编码，有就跳过不需要去插入。

|  按钮名称   |      权限后缀  |
| :-----------: | :-----------: |
| 新增 | create |
| 编辑 | edit |
| 删除 | delete |
| 查看 | view |
| 导出 | export |

### vite插入时机的选择 ###

众所周知 `vite` 有很多生命周期钩子，那么我们这个需求应该选择在那个钩子执行呢？

例如 `resolveId`、`load`、`transform`、`handleHotUpdate`、`generateBundle` 等都可以用于介入构建流程，那么那个才适合呢？ 但在实现当前需求时，我选择使用 `transform` 钩子。

因为这个需求要插入内容需要解析组件的模板结构，而 `transform` 钩子能帮我们拿到完整的源码，并且在生产环境开发环境都能生效。

### 具体插入方案选择 ###

在 `vite` 里面我们可以把一切文件都看作字符串，因些插入操作可以用正则去插入，但是.....不建议

这里推荐使用 `walk` 去处理 `AST` 插入内容，我们知道 `vue` 模板编译的时候就是要转 `ast` 抽象语法树的，`ast` 处理安全性更强、稳定性更高，而且能识别节点类型。

例如使用正则的话可以出现如下示例问题

```xml
<!-- <button> --> 
```

这是注释了的代码，但正则只会识别字符串这里就会出现问题，使用 `ast` 则不会，这只是举例其中一个小问题还有很多可能引发的问题。

### 参数传递方案 ###

我们插入权限对比编码后，正常情况是需要从 `vuex` 或者 `pinia` 里获取数据对比权限，这里我选择直接把获取 `vuex` 或者 `pinia` 的代码一起在 `ast` 中插入到页面尽最大可能减少手动写代码。

> 注意：防止出现重复引入情况，插入代码时就当做判断是否存在，存在则跳过插入。

## 代码实现 ##

上面把应该注意的问题都分析并给出了解决方案，下面看看最终版本的可用代码。

```typescript
import type { Plugin } from 'vite';
import { relative, extname } from 'path';
import { parse, walk } from 'vue-eslint-parser';
import { generate } from 'escodegen';

export default function autoPermissionPlugin({ srcDir = 'src' }: { srcDir?: string } = {}): Plugin {
  const filter = (id: string) => /\.vue$/.test(id);

  return {
    name: 'tty-auto-permission',
    transform(code, id) {
      if (!filter(id)) return;

      try {
        const ast = parse(code, {
          ecmaVersion: 2020,
          sourceType: 'module',
          loc: true,
        });

        // 获取相对于 src 的路径
        const filePath = relative(process.cwd(), id).replace(extname(id), '');

        // 按钮文案映射表
        const butTextMap: Record<string, string> = {
          新增: 'create',
          编辑: 'edit',
          删除: 'delete',
          查看: 'view',
          导出: 'export',
        };

        // 查找模板中的按钮并注入权限指令
        const templateAST = ast.templateBody;
        if (templateAST) {
          walk(templateAST, {
            enter(node) {
              if (node.type === 'VElement' && ['button', 'a-button', 'el-button'].includes(node.name)) {
                let suffix: string | undefined = undefined;

                // 从按钮文字推断后缀
                const buttonText = node.children?.find((c) => c.type === 'VText')?.value.trim();
                if (buttonText && butTextMap[buttonText]) {
                  suffix = butTextMap[buttonText];
                }

                // 从 @click 方法名推断
                const clickHandler = node.attributes.find((attr) => attr.key.name === '@click');
                if (clickHandler?.value?.expression?.callee?.name) {
                  const fnName = clickHandler.value.expression.callee.name;
                  if (fnName.startsWith('handle')) {
                    suffix = fnName.charAt(6).toLowerCase() + fnName.slice(7);
                  }
                }

                //如果有后缀
                if (suffix) {
                  const permCode = `${filePath}_${suffix}`;

                  // 是否已有权限判断指令
                  const hasPermissionDirective = node.startTag.attributes.some(
                    (attr) =>
                      attr.type === 'VDirective' &&
                      attr.key.name.name === 'if' &&
                      attr.value?.value?.includes('hasPerm'),
                  );

                  if (hasPermissionDirective) {
                    // 已有权限指令，跳过插入判断
                    return;
                  }

                  // AST 注入权限指令
                  node.startTag.attributes.push({
                    type: 'VDirective',
                    key: {
                      name: { name: 'if' },
                      argument: null,
                      modifiers: [],
                    },
                    value: {
                      type: 'VLiteral',
                      value: `permissionStore.hasPerm('${permCode}')`,
                    },
                  });
                }
              }
            },
          });
        }

        // 是否已导入存储仓储
        const hasImportStore = code.includes(
          "import { butPermissionStore } from '@/stores/butPermission'",
        );
        const warehouseCode = `
            <script setup>
            import { butPermissionStore } from '@/stores/butPermission'
            const permissionStore = butPermissionStore()
            </script>
            `.trim();

        // 如没有 <script> 标签，插入新的 <script setup>
        if (!code.includes('<script')) {
          ast.body.unshift(parse(warehouseCode).body[0]);
        } else {
          // 否则查找第一个 <script> 或 <script setup> 并在其后插入 store 
          walk(ast, {
            enter(node) {
              if (
                node.type === 'VElement' &&
                node.name === 'script' &&
                node.startTag.attributes.some((attr) => attr.key.name === 'setup')
              ) {
                if (!hasImportStore) {
                  // 在 <script setup> 中注入 import 语句
                  const importNode = parse(warehouseCode).body[0];
                  ast.body.splice(ast.body.indexOf(node) + 1, 0, importNode);
                }
                this.skip(); // 跳过后续遍历
              }
            },
          });

          // 如果没找到 <script setup>，则在第一个 <script> 后插入
          if (
            !ast.body.some(
              (n) =>
                n.type === 'VElement' &&
                n.name === 'script' &&
                n.startTag.attributes.some((a) => a.key.name === 'setup'),
            )
          ) {
            for (let i = 0; i < ast.body.length; i++) {
              const node = ast.body[i];
              if (node.type === 'VElement' && node.name === 'script') {
                if (!hasImportStore) {
                  const importNode = parse(warehouseCode).body[0];
                  ast.body.splice(i + 1, 0, importNode);
                }
                break;
              }
            }
          }
        }
        
        const newCode = generate(ast);
        return {
          code: newCode,
          map: null,
        };
      } catch (e) {
        console.error(`权限注入失败: ${id}`, e);
        return { code, map: null };
      }
    },
  };
}
```

**项目中使用插件**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import autoPermissionPlugin from './plugins/autoPermissionPlugin'

export default defineConfig({
  plugins: [
    vue(),
    autoPermissionPlugin(),
  ],
})
```

## 小结 ##

好啦，结合项目需求就实现了可用的 `vite` 权限插件。
