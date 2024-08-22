---
lastUpdated: true
commentabled: true
recommended: true
title: markdown-it 插件
description: markdown-it 插件
date: 2024-08-15 11:18:00
pageClass: blog-page-class
---

# markdown-it 插件 #

## markdown-it-inline ##

markdown-it 的作者提供了 markdown-it-inine 用于方便修改 inline tokens 。举个例子，如果我们给所有的链接添加 target="_blank"，正常你需要这样写：

```js
// Remember old renderer, if overridden, or proxy to default renderer
var defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  // If you are sure other plugins can't add `target` - drop check below
  var aIndex = tokens[idx].attrIndex('target');

  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank']); // add new attribute
  } else {
    tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
  }

  // pass token to default renderer.
  return defaultRender(tokens, idx, options, env, self);
};
```

使用 `markdown-it-for-inline` 后：

```js
var iterator = require('markdown-it-for-inline');

var md = require('markdown-it')()
            .use(iterator, 'url_new_win', 'link_open', function (tokens, idx) {
              var aIndex = tokens[idx].attrIndex('target');

              if (aIndex < 0) {
                tokens[idx].attrPush(['target', '_blank']);
              } else {
                tokens[idx].attrs[aIndex][1] = '_blank';
              }
            });
```

如果我们要替换掉某个文字，也可以使用 `markdown-it-for-inline`

```js
var iterator = require('markdown-it-for-inline');

// plugin params are:
//
// - rule name (should be unique)
// - token type to apply
// - function
//
var md = require('markdown-it')()
            .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
              tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
            });
```

## markdown-it-container ##

> Plugin for creating block-level custom containers for markdown-it markdown parser.
> 

markdown-it 的作者同样提供了 [markdown-it-container](https://github.com/markdown-it/markdown-it-container) 用于快速创建块级自定义容器。

有了这个插件，你可以这样使用 markdown 语法

```
::: spoiler click me
*content*
:::
```

注意这其中的 `:::` 是插件定义的语法，它会取出 `:::` 后的字符，在这个例子中是 `warning`，并提供方法自定义渲染结果：

```js
var md = require('markdown-it')();

md.use(require('markdown-it-container'), 'spoiler', {

  validate: function(params) {
    return params.trim().match(/^spoiler\s+(.*)$/);
  },

  render: function (tokens, idx) {
    // 通过 tokens[idx].info.trim() 取出 'click me' 字符串
    var m = tokens[idx].info.trim().match(/^spoiler\s+(.*)$/);

    // 开始标签的 nesting 为 1，结束标签的 nesting 为 -1
    if (tokens[idx].nesting === 1) {
      // 开始标签
      return '<details><summary>' + md.utils.escapeHtml(m[1]) + '</summary>\n';
    } else {
      // 结束标签
      return '</details>\n';
    }
  }
});
```

最终渲染的结果为：

```html5
<details><summary>click me</summary>
<p><em>content</em></p>
</details>
```

markdown-it-container 实现的，其实现源码为：

```js
const container = require('markdown-it-container')

module.exports = md => {
  md
    .use(...createContainer('tip', 'TIP'))
    .use(...createContainer('warning', 'WARNING'))
    .use(...createContainer('danger', 'WARNING'))
		// ...
}

function createContainer (klass, defaultTitle) {
  return [container, klass, {
    render (tokens, idx) {
      const token = tokens[idx]
      const info = token.info.trim().slice(klass.length).trim()
      if (token.nesting === 1) {
        return `<div class="${klass} custom-block"><p class="custom-block-title">${info || defaultTitle}</p>\n`
      } else {
        return `</div>\n`
      }
    }
  }]
}
```
