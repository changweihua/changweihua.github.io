// 定义 Indexable 类型
type Indexable<T> = {
  [key: string]: T;
};

// 定义 GlobalAPI 对象
const GlobalAPI: Indexable<any> = {
  config: {}, // 用于存储环境变量
};

const devConfig: Indexable<any> = {};
for (const key in import.meta.env) {
  if (key.startsWith("VITE_")) {
    devConfig[key] = import.meta.env[key];
  }
}
GlobalAPI.config = devConfig;

export { GlobalAPI };

// import { GlobalAPI } from "@/constants"; // 换成你得暴露地址
// document.title = GlobalAPI?.config?.VITE_SYSTEM_TITLE || "政务知识助手";

