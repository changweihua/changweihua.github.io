---
lastUpdated: true
commentabled: true
recommended: true
title: 通过共享 Promise 解决前端重复请求
description: 通过共享 Promise 解决前端重复请求
date: 2025-09-30 11:00:00 
pageClass: blog-page-class
cover: /covers/html5.svg
---

在处理前端重复请求问题时，通过共享 Promise 实现请求合并和结果复用是常见的高效解决方案。以下为详细实现思路和代码示例：

## 一、问题场景分析 ##

当出现以下情况时，可能导致重复请求：

- 用户频繁点击触发按钮事件
- 组件快速重复挂载/更新
- 输入框实时搜索请求（如防抖失效）
- 多个独立组件同时加载相同数据

## 二、核心实现思路 ##

- **‌创建请求缓存池**‌‌：存储正在进行的请求
- **‌请求唯一标识**‌‌：通过参数生成请求唯一键
- **‌Promise 复用**‌‌：相同请求返回缓存中的 Promise
- **‌缓存清理机制**‌‌：请求完成后自动清理缓存

## 三、完整实现方案 ##

### 基础版实现（ES6+） ###

```javascript
// 请求缓存池
const requestCache = new Map();

function generateRequestKey(config) {
  return `${config.method}-${config.url}-${JSON.stringify(config.params)}`;
}

async function sharedRequest(config) {
  const requestKey = generateRequestKey(config);
  
  // 存在进行中的相同请求
  if (requestCache.has(requestKey)) {
    return requestCache.get(requestKey);
  }

  // 创建新请求并缓存
  const requestPromise = axios(config)
    .then(response => {
      requestCache.delete(requestKey); // 成功清除缓存
      return response;
    })
    .catch(error => {
      requestCache.delete(requestKey); // 失败也清除缓存
      throw error;
    });

  requestCache.set(requestKey, requestPromise);
  return requestPromise;
}
```

### 高级功能增强版 ###

```javascript
class RequestPool {
  constructor() {
    this.pool = new Map();
    this.defaultTTL = 5000; // 默认缓存5秒
  }

  getKey(config) {
    const { method, url, params, data } = config;
    return `${method}-${url}-${JSON.stringify(params)}-${JSON.stringify(data)}`;
  }

  async request(config) {
    const key = this.getKey(config);
    const now = Date.now();

    // 存在未过期的缓存
    if (this.pool.has(key)) {
      const { expire, promise } = this.pool.get(key);
      if (expire > now) return promise;
    }

    // 创建新请求
    const promise = axios(config).finally(() => {
      // 自动清理或保留缓存
      if (!config.keepAlive) {
        this.pool.delete(key);
      }
    });

    // 缓存带有效期
    this.pool.set(key, {
      promise,
      expire: Date.now() + (config.cacheTTL || this.defaultTTL)
    });

    return promise;
  }

  // 手动清除缓存
  clearCache(key) {
    this.pool.delete(key);
  }
}

// 使用示例
const apiPool = new RequestPool();

function fetchUserData(userId) {
  return apiPool.request({
    method: 'GET',
    url: '/api/user',
    params: { id: userId },
    cacheTTL: 10000 // 自定义缓存时间
  });
}
```

## 四、关键点解析 ##

### 请求唯一标识设计 ###

- ‌组合关键参数‌：method + url + 序列化后的params/data

- ‌序列化优化‌：

```javascript
function stableStringify(obj) {
  const keys = Object.keys(obj).sort();
  return JSON.stringify(keys.map(k => ({ [k]: obj[k] })));
}
```

### 缓存清理策略 ###

|  策略类型   |      实现方式 |    适用场景 |
| :-----------: | :-----------: | :-----------: |
| 即时清理 | 请求完成后立即删除 | 常规数据请求 |
| TTL 过期 | 检查expire字段 | 需要短期缓存的数据 |
| 手动清理 | 提供clearCache方法 | 明确知道数据变更时 |
| LRU 算法 | 维护使用记录+最大数量限制 | 高频请求且内存敏感场景 |

### 错误处理要点 ###

```javascript
.catch(error => {
  // 特殊错误处理：网络错误可保留短暂缓存
  if (error.isNetworkError) {
    setTimeout(() => this.pool.delete(key), 1000);
  }
  throw error;
});
```

## 五、适用场景对比 ##

|  方案   |      优点 |    缺点 |    最佳使用场景 |
| :-----------: | :-----------: | :-----------: | :-----------: |
| 基础版 | 实现简单、内存占用少 | 缺乏高级控制 | 简单页面、少量API |
| 类封装版 | 功能完善、扩展性强 | 实现复杂度较高 | 中大型项目、复杂场景 |
| 第三方库（swr） | 开箱即用、功能丰富 | 需要学习新API | 需要快速实现的复杂缓存需求 |

## 六、延伸优化方向 ##

### ‌请求竞速处理 ###

```js
let abortController;

function smartRequest() {
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();
  
  return fetch(url, { signal: abortController.signal });
}
```

### ‌本地缓存融合 ###

```js
const response = await request();
if (response.ok) {
  localStorage.setItem(cacheKey, {
    data: response.data,
    expire: Date.now() + 3600000
  });
}
```

### ‌可视化监控 ###

```javascript
// 在RequestPool类中添加
getCacheStatus() {
  return Array.from(this.pool.entries()).map(([key, item]) => ({
    key,
    expireIn: item.expire - Date.now(),
    status: item.promise.isPending ? 'pending' : 'settled'
  }));
}
```

通过这种实现方式，可以有效解决以下问题：

- 减少 50%-90% 的重复网络请求
- 避免组件重复渲染造成的性能损耗
- 保证多个组件间的数据一致性
- 降低服务端并发压力

实际项目中可根据具体需求选择基础版或增强版实现，建议配合 TypeScript 进行类型约束以保证代码健壮性。
