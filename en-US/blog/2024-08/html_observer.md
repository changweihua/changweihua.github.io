---
lastUpdated: true
commentabled: true
recommended: true
title: MutationObserver与IntersectionObserver
description: MutationObserver与IntersectionObserver
date: 2024-08-06 10:18:00
pageClass: blog-page-class
---

# MutationObserver与IntersectionObserver #

## MutationObserver ##

> [!TIP]
> 出现原因：当我们需要监听元素发生变化时，不借助使元素发生变化的业务动作的情况下，使用无污染方式监听非常困难，为了解决这个问题，MutationObserver诞生！

### 概述 ###

可以用来监听DOM的任何变化，比如子元素、属性和文本内容的变化。

- 概念上，它很接近事件，可以理解为DOM发生变动就会触发Mutation Observer 事件。
- 和事件有本质不同：
  - 事件是同步触发（DOM的变动立刻会触发相应的事件）
  - Mutation Observer 则是异步触发（DOM发生变化并不会马上触发，而是等到当前所有DOM操作都结束才触发），执行时机类似微任务。
- 设计目的：为了应对DOM变动频繁的特点。
  eg：如果不这么做，当文档中连续插入1000个`<p>`元素，就会连续触发1000个插入事件并执行每个事件的回调函数，这很有可能会造成浏览器的卡顿。
  而Mutation Observer完全不同，只在1000个段落都插入结束后才会触发，而且只触发一次。

**小结**

- Mutation Observer等待所有脚本任务完成后，才会触发。（微任务）
- 它把所有DOM变动记录封装成一个数组进行处理，而不是单独处理每个DOM变动。
- 它既可以观察DOM的所有类型变动，也可以指定只观察某一类型的变动。

### 构造函数 ###

`MutationObserver()` 创建并返回一个新的MutationObserver，会在指定的DOM发生变化时被调用。

```typescript
const observer = new MutationObserver((mutations, observer) => {
  mutations.forEach((mutation) => {
    console.log(mutation);
  });
});
```

> 通过new MutationObserver来创建一个实例，需传入一个回调函数作为参数，回调函数的第一个参数是所有的DOM变动记录数组，第二个参数是监听实例。

### 方法 ###

- disconnect()：阻止MutationObserver 实例继续接收的通知，直到再次调用其observe() 方法，该观察者对象包含的回调函数都不会再被调用。
- observe()：配置MutationObserver 在DOM更改匹配给定选项时，通过其回调函数开始接收通知。
- takeRecords()：从MutationObserver的通知队列中删除所有待处理的通知，并将它们返回到MutationRecord对象的新Array中。

```typescript
 // 选择需要观察变动的节点
const targetNode = document.getElementById('some-id');

// 观察器的配置（需要观察什么变动）
const config = { attributes: true, childList: true, subtree: true };

// 当观察到变动时执行的回调函数
const callback = function(mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for(let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            console.log('A child node has been added or removed.');
        }
        else if (mutation.type === 'attributes') {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
        }
    }
};

// 创建一个观察器实例并传入回调函数
const observer = new MutationObserver(callback);

// 以上述配置开始观察目标节点
observer.observe(targetNode, config);

// 之后，可停止观察
observer.disconnect();
```

### MutationRecoard ###

|      属性       |                                            含义                                             |
| :-------------: | :-----------------------------------------------------------------------------------------: |
|      type       |                   观察的变动类型（attribute、characterData或者childList）                   |
|     target      |                                      发生变动的DOM节点                                      |
|   addedNodes    |                                        新增的DOM节点                                        |
|  removedNodes   |                                        删除的DOM节点                                        |
| previousSibling |                             前一个同级节点，如果没有则返回null                              |
|   nextSibling   |                             下一个同级节点，如果没有则返回null                              |
|  attributeName  |              发生变动的属性。如果设置了attributeFilter，则只返回预先指定的属性              |
|    oldValue     | 变动前的值。这个属性只对attribute和characterData变动有效，如果发生childList变动，则返回null |


<!-- | 电脑&#124;平板 | $1600 |
| _手机_         | $12   |
| __导管__       | $1    | -->


### MutationObserver Config ###

|         属性          |                             含义                             |
| :-------------------: | :----------------------------------------------------------: |
|       childList       |             子节点的变动（指新增，删除或者更改）             |
|      attributes       |                          属性的变动                          |
|     characterData     |                   节点内容或节点文本的变动                   |
|        subtree        |     布尔值，表示是否将该观察器应用于该节点的所有后代节点     |
|   attributeOldValue   | 布尔值，表示观察attributes变动时，是否需要记录变动前的属性值 |
| characterDataOldValue | 布尔值，表示观察characterData变动时，是否需要记录变动前的值  |
|    attributeFilter    |     数组，表示需要观察的特定属性（比如[‘class’,‘src’]）      |

## IntersectionObserver ##

**产生原因**

以往我们实现图片懒加载往往是通过监听存放图片的滚动容器的滚动事件或者整个页面的滚动事件，在滚动事件触发的时候调用图片元素的getBoundingClientRect() 函数来进行可见行比对。这种方式是在事件触发的时候同步进行，如果运算量过大极有可能会导致主线程阻塞。延伸开来，我们急迫地需要一个高性能的元素可见性变化解决方案，所以IntersectionObserver 诞生了。

**MDN中对IntersectionObserver的描述**

IntersectionObserver 接口提供了一种异步观察目标元素与其祖先元素或顶级文档视口（viewport）交叉状态的方法。其祖先元素或视口被称为根（root)。

> [!IMPORTANT]
> 当一个IntersectionObserver 对象被创建时，其被配置为监听根中一段给定比例的可见区域。一旦IntersectionObserver 被创建，则无法更改其配置，所以一个给定的观察者对象只能用来监听可见区域。一旦IntersectionObserver 被创建，则无法更改其配置，所以一个给定的观察者对象只能用来监听可见区域的特定变化值；然而，你可以在同一个观察者对象中配置监听多个目标元素。

### 概述 ###

- 此API可以观察目标元素与视口或指定根元素产生的交叉区的变化，因此此API也叫做“交叉观察器”。
- 和MutationObserver 一样都是异步的，不随着目标元素的滚动同步触发。IntersectionObserver的实现，应该采用requestdleCallback() 的方式，即只有线程空闲下来，才会执行观察器。这意味着，这个观察器优先级非常低，只在其他任务执行完，浏览器有了空闲才会执行。

### 构造函数 ###

IntersectionObserver()

创建一个新的IntersectionObserver对象，当其监听到目标元素的可见部分（的比例），超过了一个或多个阈值时，会执行指定的回调函数。

```typescript
const io = new IntersectionObserver(callback,option);
```

构造函数接收**两个参数**：

- 可见变化时的回调函数
- 配置对象（可选）

**返回值**：是一个观察器实例。实例的observe方法可以指定观察哪个DOM节点。

```typescript
// 开始观察
io.observe(document.getElementbyId('example'));
// 停止观察
io.unobserve(element);
// 关闭观察器
io.disconnect();
```

> observe的参数是一个DOM节点对象。如果要观察多个节点，就要多次调用这个方法。

```typescript
io.observe(elementA);
io.observe(elementB);
```

### 监听回调 ###

目标元素的可见性变化时，就会调用观察器的回调函数callback。
callback 默认情况下会触发两次：一次是目标元素刚刚进入视口时（开始可见），另一次是完全离开视口时（开始不可见）。

```typescript
const io = new IntersectionObserver((entries) => {
  console.log(entries);
});
```

> 上面代码中，callback 函数的参数（entries）是一个数组，每个成员都是一个IntersectionObserverEntry 对象。比如，如果同时有两个被观察的对象的可见性发生变化，entries 数组就会有两个成员。

### 回调信息 ###

entries 对象中每个条目IntersectionObserverEntry 对象提供目标元素的信息，一共有六个属性。

```typescript
{
  time: 3893.92,    // 可见性发生变化的时间，是一个高精度时间戳，单位为毫秒。
  rootBounds: {      // 根元素的矩形区域的信息，同 getBoundingClientRect() 方法的返回值，如果没有元素（即直接相对于视口滚动），则返回null。  
    bottom: 920,
    height: 1024,
    left: 0,
    right: 1024,
    top: 0,
    width: 920
  },
  boundingClientRect: {   // 目标元素的矩形区域的信息，同getBoundingClientRect() 方法的返回值。
     // 同上
  },
  intersectionRect: {    // 目标元素与视口（或根元素）的交叉区域的信息，同getBoundingClientRect() 方法的返回值。
    // 同上
  },
  intersectionRatio: 0.54,   // 目标元素的可见比例，即intersectionRect 占boundingClientRect的比例，完全可见时为1，完全不可见时小于等于0。
  target: Element,    // 被观察的目标元素，是一个DOM节点对象
}
```

### 实例属性 ###

- IntersectionObserver.root
  测试交叉时，用作边界盒的元素或文档。如果构造函数未传入root或其值为null，则默认使用顶级文档的视口。
- IntersectionObserver.rootMargin
  计算交叉时添加到根边界盒的矩形偏移量。可以有效的缩小或扩大根的判定范围从而满足计算需要。此属性返回的值可能与调用构造函数时指定的值不同，因此可能需要更改该值，以匹配内容要求。所有的偏移量均可用像素（px）或百分比（%）来表达，默认值为“0px 0px 0px 0px”。
- IntersectionObserver.thresholds
  一个包含阈值的列表，按升序排列，列表中的每个阈值都是监听对象的交叉区域与边界区域的比率。当监听对象的任何阈值被越过时，都会生成一个通知。如果构造器未传入值，则默认值为0。


### 实例方法 ###

- IntersectionObserver.disconnect() 使对象停止监听目标。
- IntersectionObserver.observe() 使IntersectionObserver 开始监听一个目标元素。
- IntersectionObserver.unobserve() 使IntersectionObserver 停止监听特定目标元素。

```typescript
const intersectionObserver = new IntersectionObserver((entries) => {
  // 如果 intersectionRatio 为 0，则目标在视野外，
  // 我们不需要做任何事情。
  if (entries[0].intersectionRatio <= 0) return;
  loadItems(10);
  console.log('Loaded new items');
});
// 开始监听
intersectionObserver.observe(document.querySelector('.scrollerFooter'));
```
