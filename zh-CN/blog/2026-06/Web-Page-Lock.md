---
lastUpdated: true
commentabled: true
recommended: true
title: 多标签页并发请求导致 Token 刷新失败？
description: 只有 15行代码就能解决 !
date: 2026-06-02 11:35:00
pageClass: blog-page-class
cover: /covers/html5.svg
---

不少核心 SaaS 用户在抱怨：你们系统怎么回事？我开着几个标签页在后台对账，突然所有页面全部掉线，提示登录过期，害得我刚录入的数据全没了！

我立刻把负责用户中心模块的小伙子叫过来，一块排查后端日志🫡。

原因极其典型：用户在浏览器里开着 5 个我们的后台标签页，半小时后，Token 过期了。
5 个标签页在同一瞬间检测到了过期，同时向后端发起 `refreshToken` 请求。

而我们的后端为了安全，设计了 *单次刷新令牌即失效（One-Time Use Token）* 的安全机制。

当这 5 个并发请求几乎同时到达服务器时：

!(/images/web-page-lock-1.jpg)[并发请求]

> 请求 A 先到达，后端刷新成功，返回了新的双 Token，并将旧的 Token 拉黑；
> 请求 B、C、D、E 紧随其后，拿着已经被拉黑的旧 Token 去刷新，后端判定为凭证被盗用，直接执行了安全熔断，把该用户名下的所有 Session 全部强制踢下线。

小伙子一脸委屈：老大，这纯粹是网络临界区冲突，前端发请求又没有跨页面同步机制，我怎么控制谁先发，谁后发？🤷‍♂️

大部分中初级开发在面对这个痛点时，脑子里的常规套路是👇：利用 localStorage 配合 storage 监听事件，或者手写一个基于 SharedWorker 的中转广播，在多个 Tab 之间实现一套复杂的同步锁逻辑。

代码动辄写上百行，不仅难以调试，还要处理页面卡死、Localstorage 写入延迟、Worker 线程挂掉等一大堆兼容性地雷。

但在这个圈子混了快十年，我一向提倡的原则是：凡是能用一行原生 API 降维打击的，绝对不要在 JS 业务层去折腾复杂的轮子。

其实，现代浏览器早就为我们内置了一款低调、极其强大、却被 90% 前端忽略的冷门大杀器——Web Locks API（Web 锁 API）。

接下来直接上真家伙，看看它是怎么用最纯粹的原生语法，优雅解决这个多标签页死结的👋。

## 先讲清楚，什么是 Web Locks API？ ##

很多前端知道线程锁、进程锁，但极少有人知道浏览器端也有 页面级互斥锁。

`navigator.locks` 是 W3C 正式通过的标准 API（早在 2022 年就已被所有主流浏览器原生支持）。
它允许同源（Same-Origin）下的多个浏览器上下文（无论是多个 Tab 标签页，还是多个 Web Worker 线程），去异步申请一个互斥的共享资源锁。

在锁被持有期间，其他任何标签页都无法获取同名的锁，必须老老实实排队。只有当持有锁的那个异步函数执行完毕（Resolve 或 Reject），浏览器才会自动释放锁，并把控制权交给下一个排队的 Tab。

## 只有 15 行代码解决多标签页并发刷新 ##

有了它，我们怎么去重构 Token 刷新逻辑？

不需要写任何跨页面通信，不需要写任何 storage 监听。直接看处理流程👇：

!(/images/web-page-lock-2.jpg)[处理流程]

核心伪源码👇:

```typescript
// 纯原生 Web Locks 优雅解决多标签页并发刷新
import { http } from '@/utils/request';

async function getValidToken() {
  const localToken = localStorage.getItem('access_token');
  
  // 检查如果内存/本地的 Token 依然有效，直接返回，不需要抢锁
  if (isTokenValid(localToken)) {
    return localToken;
  }

  // 核心 API：向浏览器申请一个名为 'token_refresh_lock' 的互斥锁
  return navigator.locks.request('token_refresh_lock', async (lock) => {
    // 抢到锁后，第一件事：再次检查最新本地 Token（防止前一个拿到锁的 Tab 已经刷新好了）
    const latestToken = localStorage.getItem('access_token');
    if (isTokenValid(latestToken)) {
      return latestToken; // 如果前一个页面已经刷好了，直接复用，免去多余的网络请求
    }

    try {
      // 只有抢到锁的标签页，才会真正向后端发起刷新请求
      const { accessToken } = await http.post('/auth/refresh', {
        refreshToken: localStorage.getItem('refresh_token')
      });
      
      localStorage.setItem('access_token', accessToken);
      return accessToken;
    } catch (err) {
      // 如果刷新失败（比如: RefreshToken 真的过期了），清除状态并抛出
      handleLogout();
      throw err;
    }
  }); // 异步函数结束，浏览器自动在底层释放锁，排队中的下一个 Tab 拿到锁后直接触发 isTokenValid 退出
}
```

你根本不需要知道别的标签页现在是个什么状态，你只需要把最核心的临界代码用 navigator.locks.request 包起来。

多标签页之间的并发冲突、时序排队，全部交由浏览器内核的 C++ 引擎 在底层调度，既不会阻塞主线程，又绝对安全可靠。

## 也要警惕锁死与超时灾难 ##

如果文章写到这里就结束，那就是纯粹的 API 爽文 了 😁。

在真实的工程环境里，只要涉及多线程/多端锁，就必然面临两个无法逃避的问题：死锁（Deadlock）与意外挂起。

如果持有锁的那个标签页，在执行异步请求时由于网络极其缓慢，卡了整整 30 秒，难道其他 4 个标签页要跟着卡死、拒绝响应用户 30 秒吗？😖
又或者，持有锁的标签页突然发生了崩溃，锁没有被正确释放怎么办？（这个不用担心，浏览器在标签页关闭或崩溃时，会在底层强行安全回收它持有的锁）。

为了防范 网络卡死 导致的所有页面陷入无尽等待，我们必须利用 AbortSignal 给锁加上一个 超时自动断开 的防御机制：

!(/images/web-page-lock-3.jpg)[防御机制]

```typescript
// 带超时控制的 Web 锁
async function acquireLockWithTimeout() {
  // 创建一个 5 秒超时的控制器
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    return await navigator.locks.request(
      'token_refresh_lock', 
      { signal: controller.signal }, // 注入超时信号
      async (lock) => {
        clearTimeout(timeoutId); // 成功拿到锁，清除超时器
        
        if (lock === null) {
          // 如果设置了 ifAvailable: true 且拿不到锁，lock 会返回 null
          throw new Error('当前系统繁忙，锁获取失败');
        }
        
        return await doHeavyTokenRefresh();
      }
    );
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('锁获取超时，强行解除等待状态');
    }
    throw err;
  }
}
```

利用 `controller.signal` 这一行配置，我们就优雅地完成了对锁机制的安全兜底。一旦网络超时，等待队列中的其他页面会瞬间被唤醒并解绑，绝不会造成全站卡死的连带事故。

## 最后 ##

如果再次遇到多页面、多端并发的数据同步问题，别再本能地去 npm 里搜那些笨重的轮子，也别在业务层写一堆难维护的 localStorage 定时器。

学会浏览器原生的底盘能力。用最克制、最优雅的一行 navigator.locks，去彻底终结困扰团队多时的工程死结。

把技术用在刀刃上, 你们觉得呢？😁
