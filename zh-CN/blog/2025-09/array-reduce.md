---
lastUpdated: true
commentabled: true
recommended: true
title: 🚀99% 的前端把 reduce 用成了「高级 for 循环」
description: 这 20 个骚操作让你一次看懂真正的「函数式折叠」
date: 2025-09-28 11:30:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

> 如果你只会 `arr.reduce((a,b)=>a+b,0)`，那等于把瑞士军刀当锤子用。
> 
> 今天给你 20 个「折叠」技巧，覆盖 90% 业务场景，附带 3 个 reduceRight 逆向黑科技，收藏即赚到。


**先给你 5 秒，回答一个问题**

下面两行代码，哪一行会触发 二次遍历？

```js
const sum = arr.reduce((a, b) => a + b, 0);
const max = Math.max(...arr);
```

答案：`Math.max(...arr)` 会先展开数组再遍历一次，而 `reduce` 只走一次。

**性能差一倍，数据量越大越明显。**

下面给出「完整可运行 + 逐行注释」的 20 个 `reduce` 技巧，其中 3 个刻意用 `reduceRight` 实现，让你一眼看懂「正向折叠」与「逆向折叠」的差异。

所有代码均可在浏览器控制台直接粘贴运行。

## 累加 / 累乘（热身） ##

```js
const sum   = [1,2,3,4].reduce((a,v)=>a+v, 0);      // 10
const prod  = [1,2,3,4].reduce((a,v)=>a*v, 1);      // 24
```

## 数组扁平化（仅一级） ##

```js
const flat = [[1,2],[3,4],[5]].reduce((a,v)=>a.concat(v), []);
// [1,2,3,4,5]
```

## 对象分组（万能模板） ##

```js
const list = [
  {name:'a',type:'x'},
  {name:'b',type:'y'},
  {name:'c',type:'x'}
];
const group = list.reduce((g,i)=>{
  (g[i.type] ||= []).push(i);   // 逻辑空赋值，Node14+
  return g;
}, {});
// {x:[{name:'a',type:'x'}, …], y:[…]}
```

## 去重（原始值） ##

```js
const uniq = [3,5,3,7,5,9].reduce((s, v) => {
  // 仅当数组中不存在当前元素时，才添加到原数组
  if (!s.includes(v)) s.push(v);
  return s; // 始终返回原累加器数组
}, []);
// 结果：[3,5,7,9]

//或者
const uniq = [...new Set([3,5,3,7,5,9])];
// 结果：[3,5,7,9]
```

## 去重（对象，按 id） ##

```js
const data = [{id:1,v:'a'},{id:2,v:'b'},{id:1,v:'c'}];
const uniqObj = [...data.reduce((m, o) => 
  m.has(o.id) ? m : m.set(o.id, o), new Map()).values()]; 
// [{id:1,v:'a'},{id:2,v:'b'}]  Map 保序
```

## 频率统计（单词计数） ##

```js
const words = ['a','b','a','c','b','a'];
const freq = words.reduce((m,w)=>(m[w]=(m[w]||0)+1, m), {});
// {a:3, b:2, c:1}
```

## 最大 / 最小值 ##

```js
const max = [7,9,4,2].reduce((m,v)=>v>m?v:m, -Infinity); // 9
const min = [7,9,4,2].reduce((m,v)=>v<m?v:m,  Infinity); // 2
```

## 异步顺序执行（串行 Promise） ##

```js
const delay = ms => () => new Promise(r=>setTimeout(r,ms));
const tasks = [delay(300), delay(200), delay(100)];
tasks.reduce((p,fn)=>p.then(fn), Promise.resolve())
     .then(()=>console.log('全部按顺序完成'));
```

## 函数式管道（pipe） ##

```js
const pipe = (...fns) => x => fns.reduce((v,fn)=>fn(v), x);
const add = n=>n+2;
const mul = n=>n*3;
pipe(add,mul)(5); // (5+2)*3 -> 21
```

## 反向管道（compose）—— reduceRight ##

```js
const compose = (...fns) => x => fns.reduceRight((v,fn)=>fn(v), x);
compose(add,mul)(5); // 先 mul 再 add -> 5*3+2 -> 17
```

> 重点：`reduceRight` 从右往左折叠，与 `pipe` 方向相反。

## 对象拍平（dot 路径） ##

```js
const flatten = (obj, pre='') =>
  Object.keys(obj).reduce((a,k)=>{
    const kk = pre ? `${pre}.${k}` : k;
    return typeof obj[k]==='object' && obj[k]!==null
      ? {...a, ...flatten(obj[k], kk)}
      : {...a, [kk]: obj[k]};
  }, {});

flatten({a:{b:{c:1}}, d:2});
// {"a.b.c":1, "d":2}
```

## 对象展开（逆运算）——接上回 ##

```js
const unflatten = dot =>
  Object.keys(dot).reduce((o, path)=>{
    path.split('.').reduce((node, key, i, arr)=>{
      if (i === arr.length-1) {          // 最后一级，赋值
        node[key] = dot[path];
      } else {                           // 中间级，确保对象存在
        node[key] = node[key] || {};
      }
      return node[key];
    }, o);
    return o;
  }, {});

// 演示
unflatten({"a.b.c":1, "d":2});
// {a:{b:{c:1}}, d:2}
```

## 树 → 列表（DFS 一行） ##

```js
const flatTree = tree =>
  tree.reduce((list, node)=>
    list.concat(node, node.children ? flatTree(node.children) : []), []);

// 演示
const tree = [
  {id:1, children:[
      {id:2, children:[{id:3}]},
      {id:4}
  ]}
];
flatTree(tree);  
// [{id:1}, {id:2}, {id:3}, {id:4}]
```

## 列表 → 树（O(n²) 够用版） ##

```js
const toTree = list =>
  list.reduce((root, node)=>{
    const parent = list.find(x=>x.id===node.pid);
    parent
      ? (parent.children ||= []).push(node)
      : root.push(node);
    return root;
  }, []);

// 演示
const flat = [{id:1,pid:null},{id:2,pid:1},{id:3,pid:2}];
toTree(flat);
// [{id:1,children:[{id:2,children:[{id:3}]}]}]
```

## 深度扁平（无限级嵌套） ##

```js
const deepFlat = arr =>
  arr.reduce((a,v)=>Array.isArray(v)?a.concat(deepFlat(v)):a.concat(v), []);

deepFlat([1,[2,[3,[4]]]]); // [1,2,3,4]
```

## 并发池（手写 Promise 池） ##

```js
// 并发上限 limit
const asyncPool = async (arr, limit, fn) => {
  const pool = [];                 // 存放正在执行的 Promise
  return arr.reduce((p, item, i)=>{
    const task = Promise.resolve().then(()=>fn(item));
    pool.push(task);
    // 当池子满了，等最快的一个结束
    if (pool.length >= limit) {
      p = p.then(()=>Promise.race(pool));
    }
    // 任务完成后把自己从池子里删掉
    task.then(()=>pool.splice(pool.indexOf(task),1));
    return p;
  }, Promise.resolve()).then(()=>Promise.all(pool));
};

// 演示：并发 3 个，延迟 1s
const urls = Array.from({length:10},(_,i)=>i);
asyncPool(urls, 3, async i=>{ await new Promise(r=>setTimeout(r,1000)); console.log('done',i); });
```

## 滑动平均（股票 K 线） ##

```js
const sma = (arr, n) =>
  arr.reduce((out, v, i, src)=>{
    if (i < n-1) return out;                       // 数据不足
    const sum = src.slice(i-n+1, i+1).reduce((s,x)=>s+x,0);
    return [...out, sum/n];
  }, []);

sma([1,2,3,4,5,6], 3); // [2,3,4,5]
```

## 交叉表（pivot 透视表） ##

```js
// 数据：销售记录
const sales = [
  {region:'East', product:'A', amount:10},
  {region:'East', product:'B', amount:20},
  {region:'West', product:'A', amount:30},
  {region:'West', product:'B', amount:40}
];

const pivot = sales.reduce((t, {region,product,amount})=>{
  t[region] = t[region] || {};
  t[region][product] = (t[region][product]||0) + amount;
  return t;
}, {});

// {
//   East: {A:10, B:20},
//   West: {A:30, B:40}
// }
```

## 数组 → URL 查询串 ##

```js
const toQuery = obj =>
  Object.entries(obj)
        .reduce((str,[k,v],i)=>str+(i?'&':'')+`${k}=${encodeURIComponent(v)}`,'');

toQuery({name:'前端',age:18}); // "name=%E5%89%8D%E7%AB%AF&age=18"
```

## 逆向构造嵌套路径（reduceRight 版） ##

场景：把 `['a','b','c']` 变成 `{a:{b:{c:'value'}}}`，从右往左折叠。

```js
const nestPath = (keys, value) =>
  keys.reduceRight((acc, key)=>({[key]: acc}), value);

nestPath(['a','b','c'], 123);
// {a:{b:{c:123}}}
```

> 用 `reduceRight` 保证最右边节点最先被包裹，避免额外递归。

## 3 个 reduceRight 独家技巧（ bonus ） ##

| 场景        |      核心代码    | 
| :-----------: | :-----------: |
| 反向管道（compose） | `fns.reduceRight((v,fn)=>fn(v), x)` |
| 从右往左查找第一个满足条件的索引 | `arr.reduceRight((idx,v,i)=>v===target?i:idx, -1)` |
| 逆向构造嵌套对象 | `keys.reduceRight((acc,k)=>({[k]:acc}), value)` |

## 实战演练：把 20 技巧串成需求 ##

需求：后端返回扁平菜单，需要

1. 按 `parentId` 转成树
2. 给每个节点加 `deep` 深度字段
3. 深度 `>2` 的节点统一放到「更多」分组
4. 输出 JSON + URL 查询串两种格式

```js
// 1. 扁平数据
const list = [
  {id:1, name:'首页', parentId:null},
  {id:2, name:'产品', parentId:null},
  {id:3, name:'手机', parentId:2},
  {id:4, name:'耳机', parentId:3},
  {id:5, name:'配件', parentId:3}
];

// 2. 转树 + 深度
const markDeep = (node, depth=0)=>{
  node.deep = depth;
  (node.children||[]).forEach(c=>markDeep(c, depth+1));
  return node;
};
const tree = toTree(list).map(markDeep);   // 复用技巧 #14

// 3. 深度 >2 丢进「更多」
const more = tree.reduce((a,n)=>{
  const deepNodes = flatTree([n])           // 复用技巧 #13
    .filter(node=>node.deep>2);
  if(deepNodes.length) a.push(...deepNodes);
  return a;
}, []);

// 4. 输出
const json = JSON.stringify({tree,more});
const query = toQuery({data:json});        // 复用技巧 #19
console.log(json);
console.log(query);
```

## 小结 & 心法 ##

- reduce 不是循环，是「折叠」：把「集合」降维成「单一值」——可以是数字、对象、Promise、函数，甚至另一棵树。
- reduceRight 的价值：凡是「从右往左才有意义」的场景（compose、逆向嵌套、反向查找），用它一行搞定。
- 性能口诀：
  - 一次遍历能做完，绝不用两次；
  - 需要索引时用 `reduce` 自带的 `i` 参数，别事后 `indexOf`；
  - 大数据 + 高并发，记得用「并发池」技巧，避免 `Promise.all` 一把梭。
