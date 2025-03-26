// import Cookies from "js-cookie";
// import { ElLoading } from "element-plus";

// const versionKey = "version-id";

// export function getVersionId() {
//   return Cookies.get(versionKey) ? Number(Cookies.get(versionKey)) : 0;
// }

// export function setVersionId(version: number) {
//   return Cookies.set(versionKey, String(version));
// }

// export function removeVersionId(version: number) {
//   Cookies.remove(versionKey);
// }

// export function handleVersion() {
//   if (process.env.NODE_ENV !== "development") {
//     window.getVersion = (version: number) => {
//       if (
//         !getVersionId() ||
//         (getVersionId() * 1 && version * 1 !== getVersionId() * 1)
//       ) {
//         ElLoading.service(); // 启动全屏ElLoading
//         location.reload(); // 刷新页面
//       }
//       setVersionId(version); // 保存 以便下次使用判断
//     };
//   }
// }

// export function insertVersionFile() {
//   if (process.env.NODE_ENV !== "development") {
//     const scriptCollection = document.getElementsByTagName("script");
//     // 判断是否已经有version.js 文件，如果有，先删掉资源引入
//     // const scriptAry =[...scriptCollection] // ie不支持这种写法（HTMLCollection 不是数组）
//     const scriptAry = Array.from(scriptCollection);
//     scriptAry.some((v) => {
//       const flag = v.src.indexOf("version.js") !== -1;
//       if (flag) {
//         v.parentNode?.removeChild(v);
//       }
//       return flag;
//     });

//     const versionScript = document.createElement("script");
//     versionScript.src =
//       import.meta.env.VITE_BASE_PATH + "version.js?v=" + new Date().getTime();
//     //document.getElementsByTagName('script')表示返回当前页面中所有 <script> 元素的集合
//     const s = document.getElementsByTagName("script")[0];
//     s.parentNode?.insertBefore(versionScript, s);
//   }
// }
// handleVersion();
