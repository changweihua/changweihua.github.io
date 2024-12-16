---
lastUpdated: true
commentabled: true
recommended: true
title: React 如何获取组件对应的 DOM 元素
description: React 如何获取组件对应的 DOM 元素
date: 2024-12-16 10:18:00
pageClass: blog-page-class
---

# React 如何获取组件对应的 DOM 元素 #

`React` 是一个强大的 JavaScript 库，用于构建用户界面。在 React 中，组件是构建 UI 的基本单位，而组件的渲染最终会产生相应的 DOM 元素。有时，开发者需要获取组件对应的 DOM 元素以便进行直接操作，比如添加事件监听、获取元素的尺寸、滚动位置等。在本文中，我们将深入探讨在 React 中获取组件对应的 DOM 元素的多种方法，包括使用 refs、回调 refs、以及如何处理函数组件中的 DOM 元素。

## 理解 React 中的 DOM ##

在 React 中，组件的渲染结果是一个虚拟 DOM（Virtual DOM），这是 React 提高性能的关键所在。当组件的状态或属性改变时，React 会创建一个新的虚拟 DOM，并与之前的虚拟 DOM 进行比较，然后将发生变化的部分更新到实际的 DOM 中。

尽管 React 鼓励使用其声明式 API 来构建 UI，但在某些情况下，直接操作 DOM 是必要的。这时，我们需要获取组件对应的实际 DOM 元素。

## 使用 Refs ##

React 提供了一种方法来引用组件对应的 DOM 元素，这就是 refs。Refs 是一种方式，让我们能够直接访问 DOM 元素或类组件的实例。以下是如何使用 refs 的详细说明。

### 创建 Ref ###

在类组件中，使用 `React.createRef()` 来创建一个 ref。

```react
import React, { Component } from 'react';
 
class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef(); // 创建一个 ref
  }
 
  componentDidMount() {
    // 访问 DOM 元素
    console.log(this.myRef.current); // 输出对应的 DOM 元素
  }
 
  render() {
    return <div ref={this.myRef}>Hello, World!</div>; // 将 ref 赋给 DOM 元素
  }
}
 
export default MyComponent;
```

在上面的示例中，myRef 被创建并赋给了组件中的 div 元素。随后在 componentDidMount 生命周期方法中，我们可以通过 this.myRef.current 访问到对应的 DOM 元素。

### 函数组件中的 Refs ###

在函数组件中，可以使用 `useRef` 钩子来创建 refs。useRef 允许我们在函数组件中保持对 DOM 元素的引用。

```react
import React, { useRef, useEffect } from 'react';
 
const MyComponent = () => {
  const myRef = useRef(null); // 创建一个 ref
 
  useEffect(() => {
    console.log(myRef.current); // 输出对应的 DOM 元素
  }, []);
 
  return <div ref={myRef}>Hello, World!</div>; // 将 ref 赋给 DOM 元素
};
 
export default MyComponent;
```

在这里，myRef 是用 useRef 创建的，myRef.current 在 useEffect 钩子中能够访问到真实的 DOM 元素。

## 回调 Refs ##

除了使用 createRef 和 useRef，React 还允许使用回调 refs。这种方法在需要使用动态 refs 的情况下非常有用。

### 使用回调 Refs ###

回调 refs 是一个函数，该函数接收 DOM 元素作为参数，并可以在组件的生命周期中动态更新。

```react
import React, { Component } from 'react';
 
class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.myRef = null; // 初始化 ref
  }
 
  setRef = (element) => {
    this.myRef = element; // 将 DOM 元素赋值给 myRef
  };
 
  componentDidMount() {
    console.log(this.myRef); // 输出对应的 DOM 元素
  }
 
  render() {
    return <div ref={this.setRef}>Hello, World!</div>; // 使用回调 ref
  }
}
 
export default MyComponent;
```

在这个例子中，setRef 函数被用作回调，当 DOM 元素被创建时，setRef 会被调用，并将元素赋值给 this.myRef。

### 函数组件中的回调 Refs ###

在函数组件中，同样可以使用回调 refs。如下所示：

```react
import React, { useEffect } from 'react';
 
const MyComponent = () => {
  let myRef = null; // 初始化 ref
 
  const setRef = (element) => {
    myRef = element; // 将 DOM 元素赋值给 myRef
  };
 
  useEffect(() => {
    console.log(myRef); // 输出对应的 DOM 元素
  }, []);
 
  return <div ref={setRef}>Hello, World!</div>; // 使用回调 ref
};
 
export default MyComponent;
```

在这个例子中，setRef 被用作回调，当 div 被渲染时，myRef 将持有对应的 DOM 元素引用。

## 获取多个 DOM 元素 ##

在某些情况下，可能需要获取多个 DOM 元素。例如，当渲染列表时，使用 refs 可以单独访问每个元素。

### 使用数组的 refs ###

在类组件中，可以将 refs 存储为数组：

```react
import React, { Component } from 'react';
 
class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.itemsRef = []; // 初始化一个空数组
  }
 
  addRef = (element) => {
    if (element && !this.itemsRef.includes(element)) {
      this.itemsRef.push(element); // 将 DOM 元素添加到数组中
    }
  };
 
  componentDidMount() {
    console.log(this.itemsRef); // 输出所有对应的 DOM 元素
  }
 
  render() {
    return (
      <div>
        {['Item 1', 'Item 2', 'Item 3'].map((item, index) => (
          <div key={index} ref={this.addRef}>
            {item}
          </div>
        ))}
      </div>
    );
  }
}
 
export default MyComponent;
```

在这个示例中，itemsRef 数组存储了所有渲染的 div 元素。

### 使用 useRef 和 Map ###

在函数组件中，使用 useRef 和 Map 可以实现相同的效果：

```react
import React, { useRef, useEffect } from 'react';
 
const MyComponent = () => {
  const itemsRef = useRef(new Map()); // 创建一个 Map
 
  const setRef = (element, index) => {
    if (element) {
      itemsRef.current.set(index, element); // 将 DOM 元素存入 Map
    }
  };
 
  useEffect(() => {
    console.log(itemsRef.current); // 输出所有对应的 DOM 元素
  }, []);
 
  return (
    <div>
      {['Item 1', 'Item 2', 'Item 3'].map((item, index) => (
        <div key={index} ref={(el) => setRef(el, index)}>
          {item}
        </div>
      ))}
    </div>
  );
};
 
export default MyComponent;
```

在这里，itemsRef 是一个 Map，能够存储每个 DOM 元素的索引映射。

## 直接操作 DOM 元素的注意事项 ##

虽然在 React 中可以直接访问和操作 DOM 元素，但应该尽量避免这样做。React 是一个声明式库，直接操作 DOM 可能会导致与 React 的状态管理产生冲突。

### 保持组件的声明性 ###

在 React 中，通常应该通过状态和属性来控制 UI，而不是直接操作 DOM。当需要更改组件的外观或行为时，应更新与之相关的状态或属性。

### 使用 refs 的场合 ###

在某些情况下，使用 refs 是合适的，比如：

- 需要与第三方库集成。
- 需要直接控制焦点、文本选择或媒体播放。
- 需要在动画中使用底层 DOM API。

### 避免不必要的重渲染 ###

当使用 refs 操作 DOM 时，确保避免不必要的重渲染。如果你在 render() 方法中直接修改 DOM，而不是通过 React 的状态更新，可能会导致 React 的虚拟 DOM 与实际 DOM 之间的不同步。

## 实际应用示例 ##

下面是一个更加完整的示例，演示如何在真实应用中使用 refs 来获取 DOM 元素。

### 创建一个简单的输入框组件 ###

我们将创建一个输入框组件，其中包含一个按钮，单击按钮时，输入框将获得焦点。

```vue
import React, { useRef } from 'react';
 
const InputComponent = () => {
  const inputRef = useRef(null); // 创建一个 ref
 
  const focusInput = () => {
    inputRef.current.focus(); // 使输入框获得焦点
  };
 
  return (
    <div>
      <input ref={inputRef} type="text" placeholder="输入一些文本..." />
      <button onClick={focusInput}>聚焦输入框</button>
    </div>
  );
};
 
export default InputComponent;
```

在这个示例中，当用户单击“聚焦输入框”按钮时，输入框会获得焦点。这是通过 refs 实现的，inputRef.current.focus() 直接调用了 DOM 的 focus() 方法。

## 总结 ##

在 React 中，获取组件对应的 DOM 元素是一个非常重要的技能，尤其是在需要直接操作 DOM 时。使用 refs 是访问 DOM 的标准方式，无论是在类组件中还是函数组件中，refs 都能够让开发者轻松地获取和操作 DOM 元素。
