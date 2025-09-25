---
lastUpdated: true
commentabled: true
recommended: true
title: 🚀前端必学！告别样式冲突
description: Shadow DOM 终极指南
date: 2025-09-25 15:00:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

## 什么是影子DOM? ##

**影子DOM**是 Web Components 标准套件中的一项关键技术。它允许你将一个**隐藏的、独立的 DOM 树**附加到一个常规的 DOM 元素上。

你可以把它想象成一个“DOM 中的 DOM”，但它具有**封装**特性,外部的样式或者js无法影响到其内部:

- 主文档树
  - 我们平时用 `document.getElementById` 等 API 直接操作的就是主 DOM 树
- 影子树
  - 影子 DOM 内部的节点是独立于主文档的，它们不会被主文档的 JavaScript 或 CSS 所影响，反之亦然,影子dom里面的内容也无法影响到外面。

### 创建影子 DOM ###
​
可以通过 `Element.attachShadow()` 方法来创建一个影子DOM

```js
    <script>
      const dom = document.querySelector('.container')
      const shadowRoot = dom.attachShadow({ mode: 'open' })
      shadowRoot.innerHTML = `
        <style>
            .shadow-box {
                margin-top:50%;
                width: 100%;
                height: 50%;
                background-color: rgba(0, 128, 255, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
            }
        </style>
        <div class="shadow-box">
            <p>这是影子DOM内容</p>  
        </div>
        
        `
    </script>
```

可以看到在 `.container` 下面多出了一个 `shadow-root` ,这个就是我们的影子DOM

### 影子DOM的特性 ###

这里我在外面设置一个样式

但是里面的 `shadow-box` 的样式表完全没有继承到上面的样式,这就是影子DOM样式隔离性

我用js去获取 `.shadow-box` 也是获取不到这个 `dom` 的,外部的js也是没有办法直接获取到它的

### 获取影子DOM ###

如果想要获取到影子DOM,并且修改内部的内容或者样式,就需要通过 `shadowRoot` 这个对象

> 注意:前提是创建影子dom的时候模式要设置为 `open`

```ts
const shadowRoot = dom.attachShadow({ mode: 'open' })
```

像上面的这个例子,我就通过有影子dom的父容器里面的 `shadowrRoot` 对象访到了前面创建的影子dom

如果你创建影子dom的时候用的是 `closed` 模式,那么外部的js就获取不到shadowrRoot对象

## 影子DOM的作用 ##

> 影子DOM最重要的特性就是隔离性

- **🛡️ 内部样式不会"泄漏"**：在Shadow DOM里写的 `p { color: red; }` 只会影响组件内部的段落，完全不用担心会影响到页面其他地方
- **🚫 外部样式无法"入侵"**：全局样式、UI框架、甚至 `!important` 都无法穿透进来干扰你的组件（除了少数继承属性）
- **🎯 告别命名冲突**：再也不需要BEM、CSS Modules那些复杂的命名约定，直接用最简单的选择器就行

**如果设置了closed模式,那么**:

- 🔒 外部JavaScript无法直接通过 `document.querySelector` 窥探或操作你的组件内部
- 🛡️ 第三方脚本再也无法意外破坏你的精心布局
- 💪 组件真正实现了"高内聚"，内部细节被完美隐藏

## 应用场景 ##

得益于影子DOM的高度隔离性,它非常适合在做组件库或者微前端架构的时候使用,这样可以保证你的样式隔离,不会被奇奇怪怪的全局样式污染.

举个🌰

```ts
class MyButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        button {
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          background: #007bff;
          color: white;
          cursor: pointer;
        }
        button:hover {
          background: #0056b3;
        }
      </style>
      <button><slot></slot></button>
    `;
  }
}
customElements.define('my-button', MyButton);
```

像这样在封装组件的时候,可以像这样通过 `影子dom` 去创建.

或者在微前端中用 `影子DOM` 去包裹子应用

```ts
// 主应用加载微前端
function loadMicroApp(container, appUrl) {
  const shadowContainer = container.attachShadow({mode: 'open'});
  // 加载微前端内容到 shadowContainer
}
```

这样就可以避免样式冲突引发一些奇奇怪怪的问题

还有一种就是接入第三方组件的时候,也可以用这个影子dom去包裹,让他的样式不会影响到外面

## 修改影子DOM样式的几种方式 ##

当然最重要的时候,我们要如何修改影子DOM的样式,有以下几种方式

### CSS变量 ###

由于 `shadow dom` 是可以读取到我们外部设置的 `css 变量`,所以可以使用和修改变量的方式,来改写样式,就像下面这样

```css
/* 在主文档中定义主题变量 */
:root {
  --primary-color: #007bff;
  --component-bg: #ffffff;
  --component-padding: 1rem;
}
```

```js
      const dom = document.querySelector('.container')
      const shadowRoot = dom.attachShadow({ mode: 'closed' })
      shadowRoot.innerHTML = `
        <style>
            .shadow-box {
                margin-top:50%;
                width: 100%;
                height: 50%;
                background-color: var(--primary-color);
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
            }
        </style>
        <div class="shadow-box">
            <p>这是影子DOM内容</p>
        </div>
      `
```

影子DOM内部可以访问到外部的css变量

### ::part() 伪元素 ###

`::part` CSS 伪元素表示在阴影树中任何匹配 `part` 属性的元素。

只要给影子DOM设置 `part` 属性,就可以通过这个伪元素去修改它的样式

```css
.container::part(shadow-box) {
    background: red;
  }
```

```js
      shadowRoot.innerHTML = `
        <style>
            .shadow-box {
                margin-top:50%;
                width: 100%;
                height: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
            }
        </style>
        <div class="shadow-box" part="shadow-box">
            <p>这是影子DOM内容</p>
        </div>

        `
```

### 通过js处理 ###

> 这种方式不是很推荐,因为破坏了Shadow DOM的设计初衷，导致组件脆弱难维护

​前面说过如果创建影子dom的模式是 `open`,那么我们就可以通过 `shadowRoot` 去获取里面的DOM,能获取到里面的dom,修改样式就很容易了

### 通过内部修改 ###

> 这部分我觉得作用不是那么的大,了解就好.

**:host**

用于设置 *宿主元素*（即组件本身）的默认样式或状态样式。

```html
<!-- 在 Shadow DOM 的 <style> 标签内 -->
<style>
  /* 设置组件自身的默认样式 */
  :host {
    display: block; /* 最重要！自定义元素默认是inline */
    margin: 0.5rem;
    padding: 1rem;
    border: 1px solid #ccc;
  }

  /* 当组件有 'active' 属性时 */
  :host([active]) {
    border-color: blue;
    background-color: aliceblue;
  }

  /* 当组件有 'disabled' 属性时 */
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
  }
</style>
```

场景：定义组件容器的基础样式，或根据属性（如 `disabled`, `size="large"`）改变整体外观。

**:host-context()**

用于根据组件所在的外部祖先元素来应用样式。

```html
<style>
  /* 当我的某个祖先元素有 .dark-theme 类时 */
  :host-context(.dark-theme) .card {
    background-color: #333;
    color: white;
  }

  /* 当我在一个侧边栏内时 */
  :host-context(app-sidebar) {
    margin: 0;
    border-left: none;
  }
</style>
```

场景：让组件自动适配外部主题（如深色模式）或特定布局容器。

**::slotted()**

用于修饰通过 `<slot>` 插槽投射进来的用户提供的 Light DOM 内容。注意，只能改变它的字体、颜色等样式，不能改变布局（如 display, margin）。

```html
<style>
  /* 为所有插槽元素添加基础样式 */
  ::slotted(*) {
    margin-bottom: 0.5rem;
  }

  /* 特别修饰插槽中的 h3 标签 */
  ::slotted(h3) {
    color: var(--primary-color, blue);
    border-bottom: 2px solid currentColor;
  }

  /* 修饰带有 .highlight 类的插槽元素 */
  ::slotted(.highlight) {
    background-color: yellow;
    padding: 0.25rem;
  }
</style>
```
场景：对用户传入的内容进行基础的样式装饰，保持与组件风格的统一。

## 总结 ##

总而言之，Shadow DOM 绝非一个遥远而晦涩的概念，而是现代前端开发中解决**“隔离”与“封装”**两大核心痛点的利器。它通过创建独立的 DOM 树，带来了真正的样式和 DOM 隔离，让你能够：

- **自信地编写组件**：无需再担心选择器命名冲突，可以使用最简单直观的CSS。
- **构建可靠的应用**：无论是微前端架构还是引入第三方库，Shadow DOM 都是一道可靠的屏障，确保各个部分互不干扰。
- **提供灵活的API**：通过 CSS 变量和 `::part()` 等方式，对外提供可控、安全的样式定制接口，而不是暴露脆弱的内部实现。

掌握 Shadow DOM，意味着你掌握了构建高内聚、低耦合、易于维护的现代化 Web 应用的关键技能。它将帮助你从被动地解决样式冲突，转向主动地设计封装良好的组件体系。

> 导读：Web组件不只是自定义元素那么简单。Shadow DOM、HTML模板和自定义元素各有其作用。在本文中，Russell Beswick将展示Shadow DOM在整体架构中的定位，解释其重要性、适用场景以及有效应用方法。

人们常将 `Web组件` 与 `框架组件` 做对比，但大多数示例实际上仅针对自定义元素——而这只是Web组件的一部分。我们很容易忽略一个事实：Web组件其实是一组可单独使用的Web平台API集合，包括：

- 自定义元素（Custom Elements）
- HTML模板（HTML Templates）
- Shadow DOM

也就是说，我们可以创建不依赖 *Shadow DOM* 或 *HTML模板* 的 *自定义元素*，但将这些特性结合使用，能增强组件的稳定性、可复用性、可维护性和安全性。它们是同一功能集的组成部分，既可单独使用，也可组合应用。

话虽如此，我想重点谈谈Shadow DOM及其定位。通过使用 *Shadow DOM*，我们可以在Web应用的各个部分之间划定清晰边界——将相关HTML和CSS封装在 *DocumentFragment* 中，实现组件隔离、防止冲突，并保持关注点的清晰分离。

如何利用这种封装特性，涉及到权衡取舍和多种实现方式。本文将深入探讨这些细节，而在后续文章中，我们将深入讲解如何处理封装样式。

## 为什么会有Shadow DOM？ ##

大多数现代Web应用都由来自不同提供商的各种库和组件组合而成。在传统（或“light”）DOM中，样式和脚本很容易“泄露”或相互冲突。使用框架，你可以信任所有代码能无缝协作，但仍需努力确保所有元素都有唯一ID，而且CSS规则要做作用域限制。这往往会导致代码过于冗长，增加应用加载时间，降低可维护性。

```html
<!-- div嵌套地狱 -->
<div id="my-custom-app-framework-landingpage-header" class="my-custom-app-framework-foo">
  <div><div><div><div><div><div>等等……</div></div></div></div></div></div>
</div>
```

Shadow DOM的出现就是为了解决这些问题——它提供了一种隔离组件的方式。`<video>` 和 `<details>` 元素就是很好的例子，这些原生HTML元素内部默认都使用了 Shadow DOM，避免全局样式或脚本的干扰。正是这种驱动原生浏览器组件的“隐藏能力”，让Web组件与框架组件能真正区分开来。

## 可承载阴影根的元素 ##

大多数情况下，阴影根（shadow root）与自定义元素关联，但它们也可以用在任何HTML `UnknownElement`，许多标准元素也支持阴影根，包括：

- `<aside>`
- `<blockquote>`
- `<body>`
- `<div>`
- `<footer>`
- `<h1>至<h6>`
- `<header>`
- `<main>`
- `<nav>`
- `<p>`
- `<section>`
- `<span>`

每个元素只能有一个阴影根。有些元素（如 `<input>` 和 `<select>` ）已有内置的阴影根，且无法通过脚本访问。你可以在开发者工具（Developer Tools）中启用“*显示用户代理Shadow DOM（ Show User Agent Shadow DOM）* ”设置来查看它们（默认是关闭的）。

## 创建阴影根 ##

要利用Shadow DOM的优势，首先需要在元素上创建阴影根。这可以通过命令式或声明式方式实现。

### 命令式创建 ###

使用JavaScript创建阴影根时，可调用元素的 `attachShadow({ mode })` 方法。`mode` 参数可以是 `open`（允许通过 `element.shadowRoot` 访问）或 `closed`（对外部脚本隐藏阴影根）。

```js
const host = document.createElement('div');
const shadow = host.attachShadow({ mode: 'open' });
shadow.innerHTML = '<p>来自Shadow DOM的问候！</p>';
document.body.appendChild(host);
```

在这个示例中，我们创建了一个 `open` 模式的阴影根。这意味着元素内容可从外部访问，我们可以像查询其他DOM节点一样查询它：

```js
host.shadowRoot.querySelector('p'); // 查询<p>元素
```

如果想完全阻止外部脚本访问内部结构，可将模式设为 `closed`。此时元素的 `shadowRoot` 属性会返回 `null`，但我们仍能通过创建阴影根时的 `shadow` 引用来访问它：

```js
shadow.querySelector('p');
```

这是一项关键的安全特性。通过 `closed` 模式的阴影根，我们可以确保恶意攻击者无法从组件中提取用户隐私数据。例如，一个显示银行信息的组件可能包含用户账号——若使用 `open` 模式，页面上的任何脚本都能深入组件并解析内容；而在 `closed` 模式下，只有用户通过手动复制或检查元素才能执行此类操作。

我建议使用Shadow DOM时采用*封闭优先（closed-first approach）* 原则：养成使用 `closed` 模式的习惯，仅在调试时或确实遇到无法避免的实际限制时，才使用 `open`模式。

> 遵循这种方式，你会发现真正需要 `open` 模式的场景其实很少。

### 声明式创建 ###

我们不必依赖JavaScript来使用Shadow DOM，也可以通过声明式方式注册阴影根。在任何支持的元素内嵌套带有 `shadowrootmode` 属性的 `<template>`，浏览器会自动为该元素升级并创建阴影根。即使禁用JavaScript，这种方式也能生效。

```html
<my-widget>
  <template shadowrootmode="closed">
    <p>声明式Shadow DOM内容</p>
  </template>
</my-widget>
```

模式同样可以是 `open` 或 `closed`。使用 `open` 模式前需考虑安全影响，但要注意：除非与已注册的自定义元素结合使用，否则无法通过脚本访问 `closed`模式的内容。

若结合自定义元素，可使用 `ElementInternals` 访问自动附加的阴影根：

```js
class MyWidget extends HTMLElement {
  #internals;
  #shadowRoot;
  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#shadowRoot = this.#internals.shadowRoot;
  }
  connectedCallback() {
    const p = this.#shadowRoot.querySelector('p')
    console.log(p.textContent); // 正常工作
  }
};
customElements.define('my-widget', MyWidget);
export { MyWidget };
```

## Shadow DOM配置 ##

除了 `mode`，`Element.attachShadow()` 还支持另外三个配置选项。

### 选项1：`clonable:true` ###

直到最近，如果一个标准元素已附加阴影根，当你使用 `Node.cloneNode(true)` 或 `document.importNode(node,true)` 克隆它时，只能得到宿主元素的浅拷贝，而不包含阴影根内容。我们刚才看到的示例实际上会返回一个空的 `<div>`。但对于内部构建阴影根的自定义元素，是没有这个问题。

但对于声明式Shadow DOM，这意味着每个元素都需要自己的模板，无法复用。有了这个新增特性，我们可以在需要时选择性地克隆组件：

```html
<div id="original">
  <template shadowrootmode="closed" shadowrootclonable>
    <p>这是一个测试</p>
  </template>
</div>
<script>
  const original = document.getElementById('original');
  const copy = original.cloneNode(true); 
  copy.id = 'copy';
  document.body.append(copy); // 包含阴影根内容
</script>
```

### 选项2：`serializable:true` ###

启用此选项后，可保存元素阴影根内内容的字符串表示。调用宿主元素的 `Element.getHTML()` 会返回Shadow DOM当前状态的模板副本，包括所有嵌套的 `shadowrootserializable` 实例。这可用于将阴影根副本注入另一个宿主，或缓存供以后使用。

在Chrome中，即使是封闭的阴影根也支持此功能，因此使用时需注意避免意外泄露用户数据。更安全的方案是使用 `closed` 模式的外层容器隔离内部内容，同时保持内部为 `open` 模式：

```html
<wrapper-element></wrapper-element>
<script>
  class WrapperElement extends HTMLElement {
    #shadow;
    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode:'closed' });
      this.#shadow.setHTMLUnsafe(`
        <nested-element>
          <template shadowrootmode="open" shadowrootserializable>
            <div id="test">
              <template shadowrootmode="open" shadowrootserializable>
                <p>深层Shadow DOM内容</p>
              </template>
            </div>
          </template>
        </nested-element>
      `);
      this.cloneContent();
    }
    cloneContent() {
      const nested = this.#shadow.querySelector('nested-element');
      const snapshot = nested.getHTML({ serializableShadowRoots: true });
      const temp = document.createElement('div');
      temp.setHTMLUnsafe(`<another-element>${snapshot}</another-element>`);
      const copy = temp.querySelector('another-element');
      copy.shadowRoot.querySelector('#test').shadowRoot.querySelector('p').textContent = '修改后的内容！';
      this.#shadow.append(copy);
    }
  }
  customElements.define('wrapper-element', WrapperElement);
  const wrapper = document.querySelector('wrapper-element');
  const test = wrapper.getHTML({ serializableShadowRoots: true });
  console.log(test); // 因封闭阴影根，返回空字符串
</script>
```

注意这里使用了 `setHTMLUnsafe()` ——因为内容包含 `<template>` 元素，注入此类可信内容时必须调用此方法。若使用 `innerHTML` 插入模板，无法触发阴影根的自动初始化。

### 选项3：`delegatesFocus:true` ###

此选项本质上让宿主元素像内部内容的 `<label>` 一样工作。启用后，点击宿主元素的任意位置或调用其 `.focus()`方法，光标会移动到阴影根中第一个可聚焦的元素上。同时，宿主元素会应用 `:focus`伪类，这在创建需参与表单交互的组件时特别有用。

```html
<custom-input>
  <template shadowrootmode="closed" shadowrootdelegatesfocus>
    <fieldset>
      <legend>自定义输入框</legend>
      <p>点击此元素任意位置聚焦输入框</p>
      <input type="text" placeholder="输入一些内容...">
    </fieldset>
  </template>
</custom-input>
```

这个示例仅展示了焦点委托。封装特性有一个特殊点：表单提交不会自动关联，这意味着输入框的值默认不会包含在表单提交数据中。表单验证和状态也无法传出Shadow DOM。无障碍访问也存在类似的关联问题——阴影根边界可能干扰ARIA属性。这些表单特有的问题可通过 `ElementInternals` 解决，这也让我们思考：是否可以依赖light DOM表单替代？

## 插槽内容 ##

到目前为止，我们只讨论了完全封装的组件。Shadow DOM的一个关键特性是使用插槽（slots）有选择地向组件内部结构注入内容。每个阴影根可以有一个默认（未命名）的 `<slot>`，其他插槽必须命名。命名插槽允许我们为组件的特定部分提供内容，同时为用户未提供内容的插槽设置后备内容：

```html
<my-widget>
  <template shadowrootmode="closed">
    <h2><slot name="title"><span>后备标题</span></slot></h2>
    <slot name="description"><p>占位描述文本。</p></slot>
    <ol><slot></slot></ol>
  </template>
  <span slot="title">插槽标题</span>
  <p slot="description">使用插槽填充组件部分内容的示例。</p>
  <li>Foo</li>
  <li>Bar</li>
  <li>Baz</li>
</my-widget>
```

默认插槽也支持默认内容（fallback content），任何零散的文本节点都会填充它。因此，只有折叠宿主元素标记中的所有空白，默认内容才能生效：

```html
<my-widget><template shadowrootmode="closed">
  <slot><span>后备内容</span></slot>
</template></my-widget>
```

当插槽的 `assignedNodes()` 添加或移除时，`<slot>` 元素会触发 `slotchange` 事件。这些事件不包含对插槽或节点的引用，因此需要在事件处理程序中传入这些信息：

```js
class SlottedWidget extends HTMLElement {
  #internals;
  #shadow;
  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#shadow = this.#internals.shadowRoot;
    this.configureSlots();
  }
  configureSlots() {
    const slots = this.#shadow.querySelectorAll('slot');
    console.log({ slots });
    slots.forEach(slot => {
      slot.addEventListener('slotchange', () => {
        console.log({
          changedSlot: slot.name || '默认',
          assignedNodes: slot.assignedNodes()
        });
      });
    });
  }
}
customElements.define('slotted-widget', SlottedWidget);
```

多个元素可分配给同一个插槽，既可通过 `slot` 属性声明式实现，也可通过脚本实现：

```js
const widget = document.querySelector('slotted-widget');
const added = document.createElement('p');
added.textContent = '通过命名插槽添加的第二段文本。';
added.slot = 'description';
widget.append(added);
```

注意，此示例中的 `<p>` 元素被添加到宿主元素中。插槽内容实际上属于“light DOM”，而非Shadow DOM。

与前文示例不同，这些元素可直接通过 `document` 对象查询：

```js
const widgetTitle = document.querySelector('my-widget [slot=title]');
widgetTitle.textContent = '不同的标题';
```

如果想在类定义内部访问这些元素，可使用 `this.children` 或 `this.querySelector`。只有 `<slot>` 元素本身可通过Shadow DOM查询，其内容不行。

## 从陌生到精通 ##

现在你已经了解了为什么要使用Shadow DOM、何时应将其纳入开发工作，以及如何开始使用它。

但你的Web组件之旅不应止步于此。
