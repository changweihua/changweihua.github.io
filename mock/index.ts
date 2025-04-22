import { defineFakeRoute } from 'vite-plugin-fake-server/client'
import fakeRoutes from './fake-routes'

import dataAnalysisMock from "./mock-data";

export default defineFakeRoute(fakeRoutes as any);

// 导出所有的 Mock 数据
export const worker = [...dataAnalysisMock];
