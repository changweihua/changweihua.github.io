---
lastUpdated: true
commentabled: true
recommended: true
title: Antd 树表格 defaultExpandAllRows 踩坑
description: Antd 树表格 defaultExpandAllRows 踩坑
date: 2025-07-15 15:05:00 
pageClass: blog-page-class
cover: /covers/antd.svg
---

> 当使用Ant Design Vue(Antdv)的树形表格并设置 `defaultExpandAllRows` 属性后，重新加载数据不会默认展开节点。原因是defaultExpandAllRows仅在初次渲染时生效。解决方案包括在数据未加载时不渲染表格，或者通过改变表格key值强制重新渲染。然而，如果情况复杂，如涉及排序，可以手动设置expandedRowKeys属性，并监听expand事件来控制展开和收起。在获取数据后，提取有children的父节点放入expandedRowKeys数组，并在expand事件中更新该数组，以实现始终保持父节点展开的效果。

## 问题背景 ##

在使用 antdv 中树形表格时，设置了默认展开所有节点属性：`:defaultExpandAllRows="true"`。

但是在重新获取新的数据后（即经历了 `tableData` 置空再赋值），却没有再默认展开节点。

## 原因解析 ##

`defaultExpandAllRows` 这个属性仅仅是用来设置默认值的，只在第一次渲染的时候起作用，当我们获取了数据之后再重新加载时，这时已经是第N次渲染了，所以它并没有默认展开。

## 解决方案 ##

### 方案一 ###

数据没有加载之前不渲染。

```vue
// 增加 v-if
<a-table
  v-if="tableData.length"
  :defaultExpandAllRows="true"
  :columns="columns"
  :row-key="(record, index) => record.id"
  :data-source="tableData"
>
```

### 方案二 ###

给Table设置一个key，获取数据之后改变这个key值，借助了key改变自动变成新的component可以解决这个问题。

```vue
// 增加 key
<a-table
  :key="tableKey"
  :defaultExpandAllRows="true"
  :columns="columns"
  :row-key="(record, index) => record.id"
  :data-source="tableData"
>
```

以上两种方案可解决大多数情况（仅仅是重新渲染数据），而我遇到的却更复杂些（涉及排序等），所以上面两种不适用，可以适用下方方案三。

### 方案三 ###

获取到数据后,把有children的父节点提取出来放在一个数组里,赋值给expandedRowKeys属性,这样就实现所有父节点展开的效果了。
但是设置了expandedRowKeys属性后，点击展开收起就会失效，还需要监听expand事件手动控制展开收起

设置了expandedKeys后，Tree组件就变为受控组件了。此刻所有展开收起都要手动控制。所以还需要监听expand事件手动控制展开收起

```vue
// 增加 expandedKeys 和监听 expand
<a-table
  :expandedRowKeys="expandedRowKeys"
  :defaultExpandAllRows="true"
  :columns="columns"
  :row-key="(record, index) => record.id"
  :data-source="tableData"
  @expand="onTableExpand"
>


let expandedRowKeys = ref<string[]>([]);

const getExpandedRowKeys = (list) => {
    list.forEach((item) => {
      if (item.children && item.children.length) {
        // 将所有children的父节点取出
        expandedRowKeys.value.push(item.id);
        getExpandedRowKeys(item.children);
      }
    });
  };

const onTableExpand = (expanded, record) => {
    if (expanded) {
      expandedRowKeys.value.push(record.id);
    } else {
      expandedRowKeys.value.splice(expandedRowKeys.value.indexOf(record.id), 1);
    }
  };
```
