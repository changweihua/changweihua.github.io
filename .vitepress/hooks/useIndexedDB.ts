import { isPlainObject } from "lodash-es";
import { ref } from "vue";

// 定义一个数据项接口，包含 id 和 data 两个属性
interface DataItem {
  id: string;
  data: any;
}

/**
 * 使用 IndexedDB 的自定义 hook
 *
 * @param {string} dbName - 数据库名称
 * @param {string} storeName - 对象仓库名称
 * @returns {Object} - 包含操作 IndexedDB 方法的对象
 */
export default function useIndexedDB(dbName: string, storeName: string) {
  // 使用 Vue 的 ref 创建一个响应式引用，用于存储数据库实例
  const db = ref<IDBDatabase | null>(null);
  /**
   * 异步打开 IndexedDB 数据库
   *
   * @param {string} dbName - 数据库名称
   * @param {string} storeName - 对象仓库名称
   * @returns {Promise<IDBDatabase>} - 当数据库打开成功时解析为数据库实例的 Promise
   */
  async function openDB(
    dbName: string,
    storeName: string
  ): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onerror = () => reject("Failed to open database");
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(storeName, { keyPath: "id" });
      };
    });
  }
  /**
   * 根据指定的模式获取 IndexedDB 中的对象仓库
   *
   * @param {IDBTransactionMode} mode - 事务模式，默认为 'readonly'
   * @returns {IDBObjectStore} - 返回对应的对象仓库
   */
  function getStore(mode: IDBTransactionMode = "readonly"): IDBObjectStore {
    const tx = db.value!.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }
  /**
   * 将数据项保存到 IndexedDB 中
   *
   * @param {DataItem} data - 要保存的数据项
   * @returns {Promise<string>} - 当数据保存成功时解析为保存结果的 Promise
   */
  async function putDb(data: DataItem): Promise<string> {
    if (!db.value) {
      db.value = await openDB(dbName, storeName);
    }
    const store = getStore("readwrite");

    // const { promise, resolve, reject } = Promise.withResolvers()

    // const [promise, resolve, reject] = Promise.withResolvers();

    // setTimeout(() => resolve('Resolved after 2 seconds'), 2000);

    // promise.then(value => console.log(value));

    return new Promise((resolve, reject) => {
      const request: any = store.put(data);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => reject("Failed to put data");
    });
  }
  /**
   * 从 IndexedDB 中获取指定 ID 的数据项
   *
   * @param {string} id - 要获取的数据项的 ID
   * @returns {Promise<DataItem | undefined>} - 当数据获取成功时解析为数据项的 Promise，未找到时返回 undefined
   */
  async function getDb(id: string): Promise<DataItem | undefined> {
    if (!db.value) {
      db.value = await openDB(dbName, storeName);
    }
    const store = getStore();
    return new Promise((resolve, reject) => {
      const request: any = store.get(id);
      request.onsuccess = () => {
        if (request.result && isPlainObject(request.result)) {
          request.result = JSON.parse(request.result);
        }
        resolve(request.result as DataItem | undefined);
      };
      request.onerror = () => reject("Failed to get data");
    });
  }
  /**
   * 从 IndexedDB 中删除指定 ID 的数据项
   *
   * @param {string} id - 要删除的数据项的 ID
   * @returns {Promise<string>} - 当数据删除成功时解析为删除结果的 Promise
   */
  async function removeDb(id: string): Promise<string> {
    if (!db.value) {
      db.value = await openDB(dbName, storeName);
    }
    const store = getStore("readwrite");
    return new Promise((resolve, reject) => {
      const request: any = store.delete(id);
      request.onsuccess = () => resolve(request.result as string);
      request.onerror = () => reject("Failed to delete data");
    });
  }
  // 返回包含操作数据库方法的对象
  return { putDb, getDb, removeDb };
}
