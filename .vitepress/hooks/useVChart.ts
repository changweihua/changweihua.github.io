import VChart, { type ISpec, type ITheme, type IVChart } from "@visactor/vchart";
import { useData } from "vitepress";
import { nextTick, onBeforeUnmount, onMounted, shallowRef, unref, watch, type Ref } from "vue";

const defaultVTheme: ITheme = {
  fontFamily: "'JetBrains Maple Mono', JetBrainsMapleMono, AlibabaPuHuiTi, JetBrainsMono, HYCuJianHeiJ",
  background: 'transparent'
}

const vChartColors = [
  "#6690F2",
  "#70D6A3",
  "#B4E6E2",
  "#63B5FC",
  "#FF8F62",
  "#FFDC83",
  "#BCC5FD",
  "#A29BFE",
  "#63C4C7",
  "#F68484",
];

export {
  defaultVTheme,
  vChartColors
};

export default function useVChart(
  elRef: Ref<HTMLDivElement | undefined>
) {
  let chart: IVChart;
  const chartRef = shallowRef<IVChart>()
  const { isDark } = useData();
  // const cachedSpec = shallowRef<ISpec>();

  function parseSpec() {

    const spec = {
      theme: {
        background: 'transparent'
      },
      type: 'pie',
      data: [
        {
          id: 'id0',
          values: [
            { type: 'China (regional and medium)', value: '13.1' },
            { type: 'China (long haul)', value: '3.9' },
            { type: 'Rest of Asia', value: '55' },
            { type: 'Rest of the world', value: '60' }
          ]
        }
      ],
      outerRadius: 0.65,
      valueField: 'value',
      categoryField: 'type',
      color: ['rgb(233,178,200)', 'rgb(248,218,226)', 'rgb(163,219,218)', 'rgb(210,210,210)'],
      title: {
        visible: true,
        text: 'Plane deliveries to China by region and type (2016–2035, % forecast)',
        subtext:
          'source: https://multimedia.scmp.com/news/china/article/2170344/china-2025-aviation/index.html?src=follow-chapter'
      },
      legends: {
        visible: true,
        orient: 'top'
      },
      label: {
        visible: true
      },
      markPoint: [
        {
          position: {
            x: '50%',
            y: '50%'
          },
          regionRelative: true,
          itemLine: {
            visible: false
          },
          itemContent: {
            type: 'image',
            image: {
              style: {
                dx: -50,
                dy: 50,
                image: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/airplane.png'
              }
            }
          }
        }
      ]
    };

    return spec as ISpec
  }

  // 初始化图表配置
  function initCharts() {
    const el = unref(elRef);
    if (!el || !unref(el)) {
      return;
    }

    chart = new VChart(parseSpec(), {
      dom: elRef.value,
    });
    chartRef.value = chart

    console.log('initCharts', chart)
    chart.setCurrentTheme(isDark.value ? 'legacyDark' : 'legacyLight')
    chart.renderAsync();
  }

  onMounted(() => {
    nextTick(() => {
      initCharts();
    })
  });

  onBeforeUnmount(() => {
    if (chart) {
      chart.release();
    }
  });

  watch(
    () => isDark.value,
    (dark) => {
      console.log('isDark', dark)
      if (chart) {
        // const spec = chart.getSpecInfo()
        // console.log(spec)
        chart.setCurrentTheme(dark ? 'legacyDark' : 'legacyLight')
        chart.renderAsync();
        // chart.updateSpec(extend({}, spec, {
        //   xAxis: { type: 'category', data: json['xAxisData'], axisLabel: { interval: 3 } },
        //   yAxis: { name: 'amount', type: 'value' },
        //   series: series
        // }));
      }
    }, {
    deep: true
  }
  )

  return {
    chart: chartRef
  }
}

