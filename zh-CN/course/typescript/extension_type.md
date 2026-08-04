---
lastUpdated: true
commentabled: false
recommended: false
sidebar: true
tags: ["TypeScript"]
title: TypeScript拓展
description: TypeScript拓展
poster: /images/cmono-Siesta.png
date: 2023-08-28
---

## 拓展 ##

TypeScript中常用的一些语法以及概念。

### 泛型 ###

泛型`Generics`是指在定义函数、接口或类的时候，不预先指定具体的类型，而在使用的时候再指定类型的一种特性。举一个简单的例子，如果需要实现一个生成数组的函数，这个数组会填充默认值，这个数组填充的类型不需要事先指定，而可以在使用的时候指定。当然在这里使用`new Array`组合`fill`函数是一个效果。

```typescript

function createArray<T>(value: T, length: number): T[] {
  const result: T[] = [];
    for (let i = 0; i < length; i++) {
        result[i] = value;
    }
    return result;
}

console.log(createArray<number>(1, 3)); // 不显式地指定`number`也可以自动推断

```

我们也可以约束T的类型只能为`number`与`string`。

```typescript

const createArray = <T extends number|string>(value: T, length: number): T[] => {
  const result: T[] = [];
    for (let i = 0; i < length; i++) {
        result[i] = value;
    }
    return result;
}

console.log(createArray<number>(1, 3));
// console.log(createArray(true, 3)); // Argument of type 'boolean' is not assignable to parameter of type 'string | number'.(2345)

```

多个类型也可以相互约束，例如上边的`Pick`，在这里的`K`必须是`T`中`key`的子集。

```typescript
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

在传递泛型的时候可以为T指定默认值，使用范型编写`class`即泛型类也是完全支持的。

```typescript
class Example<T = number> {
    public value: T;
    public add: (x: T, y: T) => T;
    constructor(value: T, add: (x: T, y: T) => T){
      this.value = value;
      this.add = add;
    }
}

let example = new Example<number>(1, (x, y) => x + y);
console.log(example.value); // 1
console.log(example.add(1, 2)); // 3

```

### 断言 ###

类型断言`Type Assertion`可以用来手动指定一个值的类型，由于`<Type>value`的语法容易与`TSX`冲突，所以通常都是使用`value as Type`的语法。通常当`TypeScript`不确定一个联合类型的变量到底是哪个类型的时候，我们只能访问此联合类型的所有类型中共有的属性或方法。

```typescript
interface Cat {
    name: string;
    run(): void;
}
interface Fish {
    name: string;
    swim(): void;
}

function getName(animal: Cat | Fish) {
    return animal.name;
}
```

而有时候，我们确实需要在还不确定类型的时候就访问其中一个类型特有的属性或方法。

```typescript
interface Cat {
    name: string;
    run(): void;
}
interface Fish {
    name: string;
    swim(): void;
}

function isFish(animal: Cat | Fish) {
    if (typeof animal.swim === "function") { // Property 'swim' does not exist on type 'Cat | Fish'. Property 'swim' does not exist on type 'Cat'.(2339)
        return true;
    }
    return false;
}
```

上面的例子中，获取`animal.swim`的时候会报错，此时可以使用类型断言，将`animal`断言成`Fish`。当然这里只是举一个例子说明断言的使用，因为滥用断言是不提倡的，类型断言只能够欺骗`TypeScript`编译器，而无法避免运行时的错误，滥用类型断言可能会导致运行时错误。

```typescript
interface Cat {
    name: string;
    run(): void;
}
interface Fish {
    name: string;
    swim(): void;
}

function isFish(animal: Cat | Fish) {
    if (typeof (animal as Fish).swim === "function") {
        return true;
    }
    return false;
}
```

单个断言即`value as Type`是有一定条件的，当S类型是T类型的子集，或者T类型是S类型的子集时，S能被成功断言成T。这是为了在进行类型断言时提供额外的安全性，完全毫无根据的断言是危险的，如果你想这么做，你可以使用any。

如果认为某个值`value`必定是某种类型`Type`，而单个断言无法满足要求，可以使用双重断言，即`value as unknown as Type`，使用`value as any as Type`也是同样的效果，但是若使用双重断言，则可以打破要使得`A`能够被断言为`B`，只需要`A`兼容`B`或`B`兼容`A`即可的限制，将任何一个类型断言为任何另一个类型。通常来说除非迫不得已，不要使用双重断言。

此外类型断言之所以不被称为类型转换，是因为类型转换通常意味着某种运行时的支持，而类型断言只会影响`TypeScript`编译时的类型，类型断言语句在编译结果中会被删除，也就是说类型断言纯粹是一个编译时语法，同时其也是一种为编译器提供关于如何分析代码的方法。

与类型断言相关的还有一个!的表达式，其在`TypeScript 2.7`被加入，其称为`definite assignment assertion`显式赋值断言，显式赋值断言允许你在实例属性和变量声明之后加一个感叹号!，来告诉`TypeScript`这个变量确实已被赋值，即使`TypeScript`不能分析出这个结果。

```typescript
let x: number;
let y!: number;
console.log(x + x); // Variable 'x' is used before being assigned.(2454)
console.log(y + y); // ok
```

既然说到了!，那么也可以说一下`?`，在`interface`中`?`和`undefined`并不是等效的，在下面的例子中，在`b`未将`?`声明的情况下，其在`interface`下是`required`，`TypeScript`认为其是必须指定的`key`即使其值只能为`undefined`。

```typescript
interface Example{
  a?: number;
  b: undefined;
}

const example1: Example = {}; // Property 'b' is missing in type '{}' but required in type 'Example'.(2741)
const example2: Example = { b: undefined }; // ok
```

### infer ###

`infer`是在`extends`条件语句中待推断的类型变量，也可以认为其是一个占位符，用以在使用时推断。例如上边的`ReturnType`就是通过`infer`进行推断的，首先是范型约束了一个函数类型，然后在后边进行`infer`占位后进行推断。

```typescript
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

有一些应用，`tuple`转`union`，如`[string, number, symbol] -> string | number | symbol`。

```typescript
type ElementOf<T> = T extends Array<infer E> ? E : never;

type TTuple = [string, number, symbol];

type ToUnion = ElementOf<TTuple>; // string | number | symbol
```

还有一个比较离谱的实现。

```typescript
type TTuple = [string, number, symbol];
type Res = TTuple[number]; // string | number | symbol

// https://stackoverflow.com/questions/44480644/string-union-to-string-array/45486495#45486495
```

还比如获取函数参数的第一个参数类型。

```typescript
type fn = (a: number, b: string, ddd: boolean) => void;

type FirstParameter<T> = T extends (args1: infer R, ...rest: any[]) => any ? R : never;

type firstArg = FirstParameter<fn>;  // number
```

### 函数重载 ###

`TypeScript`允许声明函数重载，即允许一个函数接受不同数量或类型的参数时，作出不同的处理。当然，最终声明即从函数内部看到的真正声明与所有重载兼容是很重要的。这是因为这是函数体需要考虑的函数调用的真实性质。

```typescript
function reverse(x: number): number;
function reverse(x: string): string;
function reverse(x: number | string): number | string | void {
    if (typeof x === "number") {
        return Number(x.toString().split("").reverse().join(""));
    } else if (typeof x === "string") {
        return x.split("").reverse().join("");
    }
}
```

还有一个比较实用的简单例子，在`ios`上的`Date`对象是不接受形如`2022-04-05 20:00:00`的字符串去解析的，当在`safari`的控制台执行时，会出现一些异常行为。这个字符串的解析在谷歌浏览器或者安卓上就没有问题，所以需要做一下兼容处理。

```typescript
// safari
const date = new Date("2022-04-05 20:00:00");
console.log(date.getDay()); // NaN

// chrome
const date = new Date("2022-04-05 20:00:00");
console.log(date.getDay()); // 2
```

所以需要对时间日期对象做一下简单的兼容，但是做兼容时又需要保证TS的声明，这时就可以使用函数重载等方式处理。

```typescript
function safeDate(): Date;
function safeDate(date: Date): Date;
function safeDate(timestamp: number): Date;
function safeDate(dateTimeStr: string): Date;
function safeDate(
    year: number,
    month: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number
): Date;
function safeDate(
    p1?: Date | number | string,
    p2?: number,
    p3?: number,
    p4?: number,
    p5?: number,
    p6?: number,
    p7?: number
): Date | never {
    if (p1 === void 0) {
        // 无参构建
        return new Date();
    } else if (p1 instanceof Date || (typeof p1 === "number" && p2 === void 0)) {
        // 第一个参数为`Date`或者`Number`且无第二个参数
        return new Date(p1);
    } else if (typeof p1 === "number" && typeof p2 === "number") {
        // 第一和第二个参数都为`Number`
        return new Date(p1, p2, p3 || 1, p4 || 0, p5 || 0, p6 || 0, p7 || 0);
    } else if (typeof p1 === "string") {
        // 第一个参数为`String`
        return new Date(p1.replace(/-/g, "/"));
    }
    throw new Error("No suitable parameters");
}

console.log(safeDate("2022-04-05 20:00:00").getDay()); // 2
```

```typescript
type DateParams =
    | []
    | [string]
    | [number, number?, number?, number?, number?, number?, number?]
    | [Date];
const safeDate = <T extends DateParams>(...args: T): Date => {
    const copyParams = args.slice(0);
    if (typeof copyParams[0] === "string") copyParams[0] = copyParams[0].replace(/-/g, "/");
    return new Date(...(args as ConstructorParameters<typeof Date>));
};

console.log(safeDate("2022-04-05 20:00:00").getDay()); // 2
```

### 声明文件 ###

对于全局变量的声明文件主要有以下几种语法：

declare var声明全局变量。
declare function声明全局方法。
declare class声明全局类。
declare enum声明全局枚举类型。
declare namespace声明含有子属性的全局对象。
interface和type声明全局类型。
declare module拓展声明。

我们可以通过`declare`关键字来告诉`TypeScript`，某些变量或者对象已经声明，我们可以选择把这些声明放入`.ts`或者`.d.ts`里。`declare namespace`表示全局变量是一个对象，包含很多子属性。

```typescript
// global.d.ts
declare namespace App {
    interface Utils {
        onload: <T extends unknown[]>(fn: (...args: T) => void, ...args: T) => void;
    }
}

declare interface Window{
  utils: App.Utils
}

// main.ts
window.utils = {
  onload: () => void 0
}
```

对于模块的声明文件主要有以下几种语法：

export导出变量。
export namespace导出含有子属性的对象。
export default ES6默认导出。
export = 导出CommonJs模块。

模块的声明文件与全局变量的声明文件有很大区别，在模块的声明文件中，使用`declare`不再会声明一个全局变量，而只会在当前文件中声明一个局部变量，只有在声明文件中使用`export`导出，然后在使用方`import`导入后，才会应用到这些类型声明，如果想使用模块的声明文件而并没有实际的`export`时，通常会显示标记一个空导出`export {}`。对于模块的声明文件我们更推荐使用 ES6标准的`export default`和`export`。

```typescript
// xxx.ts
export const name: string = "1";

// xxxxxx.ts
import { name } from "xxx.ts";
console.log(name); // 1 // typeof name === "string"
```

如果是需要扩展原有模块的话，需要在类型声明文件中先引用原有模块，再使用`declare module`扩展原有模块。

```typescript
// xxx.d.ts
import * as moment from "moment";

declare module "moment" {
    export function foo(): moment.CalendarKey;
}

// xxx.ts
import * as moment from "moment";
moment.foo();
```

```typescript
import Vue from "vue";

declare module "vue/types/vue" {
    interface Vue {
        copy: (str: string) => void;
    }
}
```

还有一些诸如.vue文件、.css、.scss文件等，需要在全局中进行声明其import时对象的类型。

```typescript
declare module "*.vue" {
    import Vue from "vue/types/vue";
    export default Vue;
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
```

在声明文件中，还可以通过三斜线指令即`///`来导入另一个声明文件，在全局变量的声明文件中，是不允许出现`import`、`export`关键字的，一旦出现了，那么他就会被视为一个模块或`UMD`库，就不再是全局变量的声明文件了，故当我们在书写一个全局变量的声明文件时，如果需要引用另一个库的类型，那么就必须用三斜线指令了。

```typescript
// types/jquery-plugin/index.d.ts
/// <reference types="jquery" />
declare function foo(options: JQuery.AjaxSettings): string;

// src/index.ts
foo({});
```

### 协变与逆变 ###

子类型在编程理论上是一个复杂的话题，而他的复杂之处来自于一对经常会被混淆的现象。简单来说，协变即类型收敛，逆变即类型发散。在这里由下面的例子引起关于这个问题的讨论，在这里我们定义了一个父类型以及一个子类型，而且我们验证了这个子类型在TS中是OK的。

```typescript
type SuperType = (value: number|string) => number|string; // 父类型
type SubType = (value: number|string|boolean) => number; // 子类型 参数逆变 返回值协变

const subFn: SubType = (value: number|string|boolean) => 1;
const superFn: SuperType = subFn; // ok
```

首先我们可以探讨一下子类型，明显`number`是`number|string`的子类型，那么下面这个例子是完全OK的，这同样也是一个协变的过程，由此看来在上边例子的`SubType`确实是`SuperType`的子类型。

```typescript
type SuperType = number|string; // 父类型
type SubType = number; // 子类型

const subValue: SubType = 1;
const superValue: SuperType = subValue; // ok
```

那么此时就回到最上边的例子，这个函数参数`value`的类型就很奇怪，明明是子类型，反而类型的种类更多了，这个其实就是所谓的逆变，其实这就是为了保证类型的收敛是安全的。此时我们的`subFn`实际代表的函数是`SuperType`类型的，当我们实际调用的时候，传递的参数由于是`SuperType`类型的即`number|string`，所以必定是`SubType`类型的子类即`number|string|boolean`，这样也就保证了函数参数的收敛安全，之后当函数执行完成进行返回值时，由于函数实际定义时的返回类型是`number`，那么在返回出去的时候也必定是`number|string`的子类，这样也就保证了函数返回值的收敛安全。我们可以通过这个图示去理解这个函数子类型的问题，类似于以下的调用过程，由此做到类型收敛的安全。

```typescript
父类型参数 -> 子类型参数 -> 执行 -> 子类型返回值 -> 父类型返回值
number|string -> number|string|boolean -> ... -> number -> number|string
```

我们可以进行一个总结: 除了函数参数类型是逆变，都是协变。将一个函数赋给另一个函数变量时，要保证参数类型发散，即比目标类型范围小。目标函数执行时是执行的原函数，传入的参数类型会收敛为原函数参数类型。协变表示类型收敛，即类型范围缩小或不变，逆变反之。本质是为了保证执行时类型收敛是安全的。
另外可以看一下 这篇文章 对于协变与逆变的描述。
开始文章之前我们先约定如下的标记，`A ≼ B`意味着`A`是`B`的子类型;`A → B`指的是以`A`为参数类型，以`B`为返回值类型的函数类型;`x : A`意味着`x`的类型为`A`。
假设我有如下三种类型：`Greyhound ≼ Dog ≼ Animal`。

`Greyhound`灰狗是`Dog`狗的子类型，而`Dog`则是`Animal`动物的子类型，由于子类型通常是可传递的，因此我们也称`Greyhound`是`Animal`的子类型，问题: 以下哪种类型是`Dog → Dog`的子类型呢。

Greyhound → Greyhound。
Greyhound → Animal。
Animal → Animal。
Animal → Greyhound。

让我们来思考一下如何解答这个问题，首先我们假设`f`是一个以`Dog → Dog`为参数的函数，它的返回值并不重要，为了具体描述问题，我们假设函数结构体是这样的`f :(Dog → Dog ) → String`，现在我想给函数f传入某个函数g来调用，我们来瞧瞧当g为以上四种类型时，会发生什么情况。

1.我们假设g : Greyhound → Greyhound，f(g)的类型是否安全？

不安全，因为在f内调用它的参数(g)函数时，使用的参数可能是一个不同于灰狗但又是狗的子类型，例如GermanShepherd牧羊犬。

2.我们假设g : Greyhound → Animal，f(g)的类型是否安全？

不安全。理由同1。

3.我们假设g : Animal → Animal，f(g)的类型是否安全？

不安全。因为f有可能在调用完参数之后，让返回值也就是Animal动物狗叫，并非所有动物都会狗叫。

4.我们假设g : Animal → Greyhound，f(g)的类型是否安全？

是的，它的类型是安全的，首先f可能会以任何狗的品种来作为参数调用，而所有的狗都是动物，其次，它可能会假设结果是一条狗，而所有的灰狗都是狗。
如上所述，我们得出结论(Animal → Greyhound) ≼ (Dog → Dog)返回值类型很容易理解，灰狗是狗的子类型，但参数类型则是相反的，动物是狗的父类。用合适的术语来描述这个奇怪的表现，可以说我们允许一个函数类型中，返回值类型是协变的，而参数类型是逆变的。返回值类型是协变的，意思是A ≼ B就意味着(T → A ) ≼ ( T → B )，参数类型是逆变的，意思是A ≼ B就意味着(B → T ) ≼ ( A → T )即A和B的位置颠倒过来了。一个有趣的现象是在TypeScript中，参数类型是双向协变的，也就是说既是协变又是逆变的，而这并不安全，但是现在你可以在TypeScript 2.6版本中通过--strictFunctionTypes或--strict标记来修复这个问题。
