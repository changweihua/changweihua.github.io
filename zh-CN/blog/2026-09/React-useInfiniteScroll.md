---
lastUpdated: true
commentabled: true
recommended: true
title: React useInfiniteScroll Hook
description: 无限滚动轻松实现
date: 2026-09-21 08:45:00
pageClass: blog-page-class
cover: /covers/react.svg
---

每个信息流、每个聊天记录、每个搜索结果页面最终都会问同一个问题：用户滚到底部时怎么加载更多？ 朴素的答案——一个 `scroll` 监听器、一些关于 `scrollHeight` 和 `clientHeight` 的算术、一个防止重复请求的布尔值——大约 30 行代码，而每一行都是陷阱。你忘了清理监听器。你比较了错误的尺寸。你在 mount 时触发了回调，那时候根本没有内容可以滚动。你硬编码了"底部"，然后产品要求做一个向上加载历史记录的聊天界面。你没做节流，于是用户把滚动位置停在阈值附近时回调每秒触发 60 次。

`@reactuses/core` 的 `useInfiniteScroll` 用一次调用替代了所有这些：把它指向一个可滚动元素，给它一个加载更多函数，剩下的它全包了——到达检测、方向、距离阈值、滚动位置保持和清理。这篇文章会走读真实实现、关键选项，以及信息流、聊天和水平轮播的实战模式。TypeScript 优先。

## 最简用法：滚到底部加载更多 ##

```tsx
import { useRef, useState } from 'react';
import { useInfiniteScroll } from '@reactuses/core';

function Feed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<string[]>(() =>
    Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`)
  );

  useInfiniteScroll(containerRef, async () => {
    const newItems = await fetchMoreItems(items.length);
    setItems(prev => [...prev, ...newItems]);
  });

  return (
    <div ref={containerRef} style={{ height: 400, overflow: 'auto' }}>
      {items.map(item => (
        <div key={item} style={{ padding: 16, borderBottom: '1px solid #eee' }}>
          {item}
        </div>
      ))}
    </div>
  );
}
```

就这么多。滚到底部，`fetchMoreItems` 触发。用户滚走再滚回来之前不会重复触发。SSR 期间不会触发。卸载时自动清理监听器。容器可以是任何可滚动元素。

## 函数签名 ##

```ts
useInfiniteScroll(target, onLoadMore, options?)
```

- `target` — 可滚动 DOM 元素的 ref（`RefObject<Element>`）。
- `onLoadMore` — 用户到达滚动边缘时调用的函数（同步或异步）。它接收来自 useScroll 的完整滚动状态：`[x, y, isScrolling, arrivedState, directions]`。
- `options` — `useScroll` 接受的所有选项，加上三个无限滚动专属字段。

## 关键选项 ##

### `distance` —— 提前触发 ###

```tsx
useInfiniteScroll(containerRef, loadMore, {
  distance: 200, // 距底部 200px 时就触发
});
```

默认值是 `0`——只有滚到绝对边缘才触发回调。设置 `distance` 可以预加载：设为 `200` 时，在还有 `200 px` 内容可滚动的时候就开始请求下一页，这样网速够快的话用户永远看不到加载中。

### `direction` —— 不只是底部 ###

```tsx
useInfiniteScroll(containerRef, loadMore, {
  direction: 'top', // 向上滚动时加载更早的消息
});
```

四个方向：`'bottom'`（默认）、`'top'`、`'left'`、`'right'`。聊天应用要 `'top'`——用户向上滚动加载历史消息。水平轮播要 `'left'` 或 `'right'`。hook 会自动把到达检测连接到正确的边缘。

### `preserveScrollPosition` —— 留在原地 ###

```tsx
useInfiniteScroll(containerRef, loadMore, {
  direction: 'top',
  preserveScrollPosition: true,
});
```

当你在当前视口上方加载内容时（聊天历史、倒序信息流），新内容会把所有东西往下推，用户就丢失了位置。`preserveScrollPosition: true` 解决了这个问题：`onLoadMore` resolve 之后，hook 会把 `scrollTop` 精确偏移新插入内容的高度。用户看到的滚动位置不变，更早的消息出现在上方。

## 底层实现 ##

实现只有 44 行。它做了这些事：

```ts
export const useInfiniteScroll = (target, onLoadMore, options = {}) => {
  const savedLoadMore = useLatest(onLoadMore);
  const direction = options.direction ?? 'bottom';
  const state = useScroll(target, {
    ...options,
    offset: {
      [direction]: options.distance ?? 0,
      ...options.offset,
    },
  });

  const di = state[3][direction]; // arrivedState[direction]

  useUpdateEffect(() => {
    const element = getTargetElement(target);
    const fn = async () => {
      const previous = {
        height: element?.scrollHeight ?? 0,
        width: element?.scrollWidth ?? 0,
      };
      await savedLoadMore.current(state);
      if (options.preserveScrollPosition && element) {
        element.scrollTo({
          top: element.scrollHeight - previous.height,
          left: element.scrollWidth - previous.width,
        });
      }
    };
    fn();
  }, [di, options.preserveScrollPosition, target]);
};
```

三个关键部分让它工作：

- `useScroll` 做了所有重活。 它跟踪 `x`、`y`、`isScrolling`、到达状态（四个边缘各一个布尔值）和滚动方向。`offset` 选项移动到达阈值。

- `useUpdateEffect` 防止了 `mount` 时触发。 普通 `useEffect` 会在 `mount` 时调用 `onLoadMore`。`useUpdateEffect` 跳过首次调用，只在到达布尔值实际变化时才触发。

- `useLatest` 消灭了闭包陈旧。 回调闭包了渲染间会变化的状态，`useLatest` 把它包在 ref 里，调用的始终是最新版本。

## 实战模式 ##

### 分页信息流 ###

```tsx
function PaginatedFeed() {
  const ref = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Item[]>([]);
  const [hasMore, setHasMore] = useState(true);

  useInfiniteScroll(ref, async () => {
    if (!hasMore) return;
    const data = await fetchPage(page);
    setItems(prev => [...prev, ...data.items]);
    setHasMore(data.hasNextPage);
    setPage(prev => prev + 1);
  }, { distance: 300 });

  return (
    <div ref={ref} style={{ height: '100vh', overflow: 'auto' }}>
      {items.map(item => <Card key={item.id} item={item} />)}
      {!hasMore && <p>没有更多了</p>}
    </div>
  );
}
```

### 聊天历史（反向滚动） ###

```tsx
function ChatHistory({ channelId }: { channelId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);

  useInfiniteScroll(ref, async () => {
    const data = await fetchMessages(channelId, cursor);
    setMessages(prev => [...data.messages, ...prev]);
    setCursor(data.nextCursor);
  }, {
    direction: 'top',
    preserveScrollPosition: true,
    distance: 100,
  });

  return (
    <div ref={ref} style={{ height: 500, overflow: 'auto' }}>
      {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
    </div>
  );
}
```

`direction: 'top'` 在用户滚到顶部时触发。`preserveScrollPosition: true` 在旧消息前插之后保持视口停在同一条消息上。这就是 Slack、Discord 和所有聊天 UI 用的模式。

### 水平轮播 ###

```tsx
function HorizontalGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<string[]>([]);

  useInfiniteScroll(ref, async () => {
    const moreImages = await fetchImages(images.length);
    setImages(prev => [...prev, ...moreImages]);
  }, {
    direction: 'right',
    distance: 200,
  });

  return (
    <div ref={ref} style={{ display: 'flex', overflowX: 'auto', gap: 16 }}>
      {images.map(src => <img key={src} src={src} style={{ width: 300 }} />)}
    </div>
  );
}
```

同一个 hook，不同的轴。

## useInfiniteScroll vs. useIntersectionObserver ##

两者都能触发"加载更多"。区别在于它们监视什么：

- `useIntersectionObserver` 监视一个哨兵元素。适用于任何容器包括 window，能优雅处理复杂布局。

- `useInfiniteScroll` 监视特定容器的滚动位置。连接更简单，原生支持四个方向，内置 `preserveScrollPosition`。

> 单容器选 `useInfiniteScroll`。window 级别或复杂嵌套滚动选 `useIntersectionObserver`。

## SSR 安全 ##

`useInfiniteScroll` 在服务端渲染期间不创建任何订阅。`useScroll` 检查 `window` 是否存在。`useUpdateEffect` 跳过首次渲染。在服务端是一个空操作。和 `@reactuses/core` 的每个 `hook` 一样，在构造上就是 SSR 安全的。

## 要点总结 ##

- 一个 `hook` 替代了滚动监听器、计算和清理。
- `distance` 预加载内容，让用户永远不用在底部等待。
- `direction` 处理全部四个边缘 —— 信息流、聊天历史、轮播全覆盖。
- `preserveScrollPosition` 是聊天历史的救星。
- 基于 `useScroll` 构建，免费获得节流、到达状态和方向检测。
- SSR 安全，无需配置。

安装 `@reactuses/core`，把 `useInfiniteScroll` 指向你的列表容器，告别手写滚动算术。
