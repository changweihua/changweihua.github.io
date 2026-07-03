class RequestPool {
  private pool;
  private defaultTTL;

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
    const promise = fetch(config).finally(() => {
      // 自动清理或保留缓存
      if (!config.keepAlive) {
        this.pool.delete(key);
      }
    });

    // 缓存带有效期
    this.pool.set(key, {
      promise,
      expire: Date.now() + (config.cacheTTL || this.defaultTTL),
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
    method: "GET",
    url: "/api/user",
    params: { id: userId },
    cacheTTL: 10000, // 自定义缓存时间
  });
}
