---
lastUpdated: true
commentabled: true
recommended: true
title: 箭头函数和普通函数的区别！
description: 箭头函数和普通函数的区别！
date: 2025-09-28 10:30:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

在 JavaScript 开发中，`this` 的指向问题一直是困扰开发者的一大难题。尤其是在面试中，面试官常常会问到箭头函数和普通函数的区别，尤其是它们在 `this` 指向上的差异。本文将深入剖析箭头函数和普通函数在 `this` 指向上的不同，帮助你更好地理解和掌握这一知识点。

## 普通函数中的 `this` 指向 ##

在 JavaScript 中，普通函数的 `this` 指向是动态的，取决于函数的调用方式。以下是一些常见的调用方式及其对应的 `this` 指向：

### 全局调用 ###

当函数作为全局函数调用时，`this` 指向全局对象 `window`（在浏览器环境中）。

```ts
console.log(this); // window
function fn() {
    console.log(this); // window
}
fn();
```

### 作为对象方法调用 ###

当函数作为对象的方法调用时，`this` 指向该对象。

```javascript
const obj = {
    sayHi: function() {
        console.log(this); // obj
    }
};
obj.sayHi();
```

### 作为构造函数调用 ###

当函数作为构造函数调用时，`this` 指向新创建的实例对象。

```javascript
function Person(name) {
    this.name = name;
}
const person = new Person('Alice');
console.log(person.name); // Alice
```

### 使用 `call`、`apply` 或 `bind` 调用 ###

`call`、`apply` 和 `bind` 方法可以显式地指定函数的 `this` 指向。

```javascript
function greet() {
    console.log(`Hello, ${this.name}`);
}
const obj = { name: 'Alice' };
greet.call(obj); // Hello, Alice
```

### 事件回调中的 `this` ###

在事件回调中，`this` 指向触发事件的 DOM 元素。

```javascript
document.querySelector('button').onclick = function() {
    console.log(this); // button
};
```

## 箭头函数中的 `this` 指向 ##

箭头函数是 ES6 引入的一种新的函数语法，它没有自己的 `this`，而是继承自外层作用域的 `this`。这意味着箭头函数的 this 指向在定义时就已经确定，不会随着调用方式的改变而改变。

### 箭头函数的 `this` 继承自外层作用域 ###

```javascript
const obj = {
    sayHi: () => {
        console.log(this); // window
    }
};
obj.sayHi();
```

在上面的例子中，sayHi 是一个箭头函数，它的 `this` 继承自外层作用域，即全局对象 `window`。

### 箭头函数在事件回调中的 `this` ###

```javascript
document.querySelector('button').onclick = () => {
    console.log(this); // window
};
```

在事件回调中，箭头函数的 `this` 仍然继承自外层作用域，而不是触发事件的 DOM 元素。

### 箭头函数在定时器中的 `this` ###

```javascript
setTimeout(() => {
    console.log(this); // window
}, 1000);
```

在定时器中，箭头函数的 `this` 也继承自外层作用域。

### 箭头函数在严格模式下的 `this` ###

箭头函数在严格模式下仍然没有自己的 `this`，而是继承自外层作用域。

```javascript
'use strict';
const obj = {
    sayHi: () => {
        console.log(this); // window
    }
};
obj.sayHi();
```

## 箭头函数与普通函数的区别 ##

### `this` 指向 ###

- **普通函数**：`this` 指向是动态的，取决于函数的调用方式。
- **箭头函数**：没有自己的 `this`，继承自外层作用域。

### 语法 ###

- **普通函数**：使用 `function` 关键字定义。
- **箭头函数**：使用 `=>` 定义，语法更简洁。

### 适用场景 ###

- **普通函数**：适用于需要动态 `this` 指向的场景，如对象方法、构造函数等。
- **箭头函数**：适用于不需要动态 `this` 指向的场景，如事件回调、定时器回调等。

## 面试官最想听到的答案 ##

在面试中，当面试官问到箭头函数和普通函数的区别时，你应该从以下几个方面回答：

- `this` 指向：普通函数的 `this` 指向是动态的，而箭头函数的 `this` 指向在定义时就已经确定。
- 语法：箭头函数的语法更简洁，没有自己的 `this`，继承自外层作用域。
- 适用场景：普通函数适用于需要动态 `this` 指向的场景，箭头函数适用于不需要动态 `this` 指向的场景。

## 总结 ##

箭头函数和普通函数在 `this` 指向上的差异是 JavaScript 开发中一个重要的知识点。普通函数的 `this` 指向是动态的，而箭头函数的 this 指向在定义时就已经确定。在实际开发中，我们需要根据具体的场景选择合适的函数类型。

> **核心**：箭头函数解决了函数的二义性。
