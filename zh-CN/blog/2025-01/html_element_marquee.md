---
lastUpdated: true
commentabled: true
recommended: true
title: 无限无缝循环自滚动列表的实现
description: 无限无缝循环自滚动列表的实现
date: 2025-01-07 10:08:00
pageClass: blog-page-class
---

# 无限无缝循环自滚动列表的实现 #

## 方案 ##

- 不管一共有多少数据，每一时刻实际渲染的数据量应该是固定的，我这里用了两屏的数据
- 这里的滚动没有用滚动条，用的是top的偏移量来实现，因为我这里的需求只需要自己滚动，不用手动滚动，用滚动条的话，相同的原理，应该也可以实现，但是还要把滚动条隐藏了，麻烦。
- 由于实际的渲染量一定，所以当top的偏移量等于一屏数据的高度的时候，应该把top的值重置为零，同时要把已经消失在视野的那一屏数据删除，这样的配合下，top的改变就不会引起页面的闪动，因为此时的位置下top就是等于零。
- 在上面删除了已经看不见的一屏数据的时候，就一定要在下面添加上新的一屏数据，这样，就能保证页面上始终有且只有两屏数据，也能确保滚动的这个效果。
- 最后一屏结束的时候，要从队首拿数据补上，实现无缝衔接，循环滚动。

## 优化项 ##

- 给页面中元素添加子元素的时候，没有直接添加，而是用的createDocumentFragment，能减少元素的插入次数
- 这里的滚动走的不是setTimeout,而是用的requestAnimationFrame

## 示例 ##

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .rollList_content {
        background-color: black;
        height: 300px;
        width: 200px;
        overflow-y: hidden;
        position: relative;
      }
      .vabsolute_content {
        width: 100%;
        position: absolute;
        top: 0;
      }
      .roll_line {
        display: flex;
        padding: 0px 10px;
        box-sizing: border-box;
        width: 100%;
        height: 30px;
        color: #fff;
        align-items: center;
        justify-content: space-between;
      }
      .right {
        padding-right: 20px;
        width: 20px;
        height: 20px;
      }
    </style>
  </head>
  <body>
    <div id="list" class="rollList_content">
      <div id="vlist" class="vabsolute_content">
        <div class="fragment_content"></div>
        <div class="fragment_content"></div>
      </div>
    </div>
  </body>
  <script>
    const list = document.querySelector('#list')
    const vlist = document.querySelector('#vlist')
    let containerHeight = 0
    let perCount = 0
    const lineHight = 30
    const renderData = [
      { color: 'red', name: '小明' },
      { color: 'red', name: '小明' },
      { color: 'red', name: '小明' },
      { color: 'red', name: '小明' },
      { color: 'red', name: '小明' },
      { color: 'red', name: '小明' },
      { color: 'red', name: '小明' },
      { color: 'red', name: '小明' },
      { color: 'red', name: '小明' },
      { color: 'red', name: '小明' },
      { color: 'pink', name: '小红' },
      { color: 'pink', name: '小红' },
      { color: 'pink', name: '小红' },
      { color: 'pink', name: '小红' },
      { color: 'pink', name: '小红' },
      { color: 'pink', name: '小红' },
      { color: 'pink', name: '小红' },
      { color: 'pink', name: '小红' },
      { color: 'pink', name: '小红' },
      { color: 'pink', name: '小红' },
      { color: 'yellow', name: '小黄' },
      { color: 'yellow', name: '小黄' },
      { color: 'yellow', name: '小黄' },
      { color: 'yellow', name: '小黄' },
      { color: 'yellow', name: '小黄' },
      { color: 'yellow', name: '小黄' },
      { color: 'yellow', name: '小黄' },
      { color: 'yellow', name: '小黄' },
      { color: 'yellow', name: '小黄' },
      { color: 'yellow', name: '小黄' },
    ]
    let startIndex = 0
    const fillEle = (ele, startIndex) => {
      const fragment = document.createDocumentFragment()
      let currentIndex = startIndex
      for (let i = 0; i < perCount; i++) {
        const curData = renderData[currentIndex]
        // newline
        const newLine = document.createElement('div')
        newLine.className = 'roll_line'
        // left_text
        const left_text = document.createElement('div')
        left_text.className = 'text'
        left_text.innerText = curData.name
        // right_div
        const right = document.createElement('div')
        right.style.background = curData.color
        right.className = 'right'
        // append
        newLine.appendChild(left_text)
        newLine.appendChild(right)
        fragment.appendChild(newLine)
        if (currentIndex === renderData.length - 1) {
          currentIndex = 0
        } else {
          currentIndex++
        }
      }
      ele.appendChild(fragment)
    }
    const setStartIndex = (startIndex) => {
      if (startIndex + perCount >= renderData.length) {
        return perCount - (renderData.length - startIndex)
      } else {
        return perCount + startIndex
      }
    }

    const loop = (isInit = false) => {
      if (!renderData) return
      if (startIndex === 0 && isInit === true) {
        let firstFragment = vlist.firstElementChild
        fillEle(firstFragment, startIndex)
        startIndex = setStartIndex(startIndex)
        const secondChildNode = vlist.lastElementChild
        fillEle(secondChildNode, startIndex)
        startIndex = setStartIndex(startIndex)
      } else {
        let currentTop = parseInt(vlist.style?.top, 10) || 0
        if (Math.abs(currentTop) >= lineHight * perCount) {
          vlist.removeChild(vlist.firstElementChild)
          vlist.style.top = 0
          const newFragment = document.createElement('div')
          newFragment.className = 'fragment_content'
          fillEle(newFragment, startIndex)
          startIndex = setStartIndex(startIndex)
          vlist.appendChild(newFragment)
        } else {
          vlist.style.top = `${currentTop - 1}px`
        }
      }
      animationFrameId = window.requestAnimationFrame(loop)
    }

    const init = () => {
      if (!list) return
      containerHeight = list.offsetHeight
      perCount = ~~(containerHeight / lineHight)
      loop(true)
    }

    init()
  </script>
</html>
```
