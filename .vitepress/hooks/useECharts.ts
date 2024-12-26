// hooks/useECharts.ts
import * as echarts from "echarts";
import elementResizeDetectorMaker from 'element-resize-detector'
import { debounce } from 'lodash-es'
import { onActivated, onDeactivated, onMounted, onBeforeUnmount, reactive, shallowRef, useTemplateRef, watch, nextTick } from "vue";

/** @type EChartsOption */
export const defaultOption = {
}

export interface ChartStrategy {
  getOptions: () => echarts.EChartsOption;
} // 定义一个策略接口 , 方便具体策略实现使用

/**
 * 自定义的 Vue 钩子函数，用于管理 ECharts 实例
 * @param containerId 指向包含图表的 DOM 元素
 * @param initOptions strategy 是一个接口，提供获取图表配置的方法
 * @param theme 可选的 theme 参数，用于设置 ECharts 主题
 * @param opts 可选的 opts 参数，用于初始化 ECharts 的配置
 * @returns
 */
export function useECharts(
  containerId: string,
  initOptions: echarts.EChartsOption,
  theme?: string | object | null,
  opts?: echarts.EChartsInitOpts
) {
  const containerRef = useTemplateRef<HTMLDivElement>(containerId)
  // 使用 shallowRef 创建一个响应式引用，用于保存 ECharts 实例
  const chartInstance = shallowRef<echarts.EChartsType | null>(null);

  // 使用 ref 创建一个响应式引用，用于保存图表的配置选项
  const options = reactive<echarts.EChartsOption>(initOptions);

  // 初始化图表实例的函数
  const initChart = () => {
    nextTick(() => {
      // 确保 chartRef 绑定了 DOM 元素且 chartInstance 尚未初始化
      if (containerRef.value && !chartInstance.value) {
        // 初始化 ECharts 实例并赋值给 chartInstance
        chartInstance.value = echarts.init(containerRef.value, theme, opts);
        // 设置图表的初始选项
        chartInstance.value.setOption(options);
      }
    })
  };

  // 更新图表配置选项的函数
  const updateChartOptions = (newOptions: echarts.EChartsOption, oldOptions: echarts.EChartsOption) => {
    if (chartInstance.value) {
      // 使用新的选项更新图表，不合并现有选项并延迟更新以优化性能
      chartInstance.value.setOption(newOptions, {
        notMerge: true,
        lazyUpdate: true,
      });
    }
  };

  const erd = elementResizeDetectorMaker()
  // 处理窗口大小调整的函数，确保图表能够自动调整大小
  const handleResize = debounce(() => {
    chartInstance.value?.resize({
      animation: {
        duration: 300,
        easing: 'cubicInOut'
      }
    })
  }, 100)

  // 销毁图表实例的函数，释放内存并清空引用
  const disposeChart = () => {
    chartInstance.value?.dispose(); // 调用 ECharts 的 dispose 方法销毁实例
    chartInstance.value = null; // 清空 chartInstance 引用，避免内存泄漏
  };

  // 监听 options 的变化，并在其发生改变时更新图表
  // @ts-ignore
  watch(options, updateChartOptions, { deep: true });

  // 组件挂载时初始化图表并添加窗口大小调整的事件监听器
  onMounted(() => {
    initChart(); // 初始化图表
    erd.listenTo(containerRef.value, handleResize)
  });

  // 组件卸载时移除事件监听器并销毁图表实例
  onBeforeUnmount(() => {
    erd.removeListener(containerRef.value, handleResize)
    disposeChart(); // 销毁图表实例
  });

  // 组件激活时重新初始化图表并添加事件监听器
  onActivated(() => {
    if (!chartInstance.value) {
      initChart(); // 如果图表实例不存在，重新初始化
    }
    erd.listenTo(containerRef.value, handleResize)
  });

  // 组件停用时移除事件监听器并销毁图表实例
  onDeactivated(() => {
    erd.removeListener(containerRef.value, handleResize)
    disposeChart(); // 销毁图表实例
  });

  // 下载图表为图片
  const downloadChartImage = (filename = 'chart.png') => {
    if (chartInstance.value) {
      const base64 = chartInstance.value.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#fff'
      });
      const link = document.createElement('a');
      link.href = base64;
      link.download = filename;
      link.click();
    }
  };


  // 返回 chartInstance 和相关的控制方法，供外部组件使用
  return {
    chartInstance, // 返回图表实例的引用
    options, // 返回图表配置选项的引用
    initChart, // 返回初始化图表的方法
    handleResize, // 返回手动触发图表调整大小的方法
    disposeChart, // 返回手动销毁图表实例的方法
    downloadChartImage
  };
}
