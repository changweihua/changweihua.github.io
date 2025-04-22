import { MockMethod } from "vite-plugin-mock";

// 定义模拟的请求处理程序
const dataAnalysisData: MockMethod[] = [
  {
    url: "/api/data", // 接口地址
    method: "get", // 请求方式
    response: () => {
      // 模拟数据
      return {
        status_code: 0,
        status_msg: "success",
        data: {
          // 模拟的数据
        },
      };
    },
  },
];

export default dataAnalysisData;
