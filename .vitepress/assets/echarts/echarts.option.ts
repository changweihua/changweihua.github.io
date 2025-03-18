import * as echarts from 'echarts'

import echartsJson from './echarts.json'
import { easingFuncs } from './echarts.type'

export const legendOption = {
  textStyle: {
    fontSize: 12,
    lineHeight: 12,
    height: 12,
    color: '#fff'
  }
}

export const visualMapOption = {
  type: 'piecewise',
  textStyle: {
    color: '#fff'
  }
}

export const axisOption = {
  splitLine: {
    show: false
  },
  axisTick: {
    show: false,
    alignWithLabel: true
  },
  axisLine: {
    show: false,
    lineStyle: {
      color: '#fff'
    }
  },
  axisLabel: {
    color: 'rgb(255,255,255)',
    formatter: '{value}',
    interval: 0,
    fontSize: 12
  },
  splitArea: {
    show: false,
    areaStyle: {
      color: ['rgba(250,250,250,0.0)', 'rgba(250,250,250,0.05)']
    }
  }
}

export const tooltipOption: echarts.TooltipComponentOption = {
  trigger: 'axis',
  confine: true,
  extraCssText: 'box-shadow: 0 0 7px rgba(0, 0, 0, 0.6);',
  axisPointer: {
    type: 'line'
  },
  backgroundColor: 'rgba(255,255,255,1)',
  formatter(params: any) {
    let stl = ''

    params.forEach((serie: any, index: number) => {
      if (serie.componentType === 'series') {
        const color =
          echartsJson.colorPalette[index % echartsJson.colorPalette.length]
        let value = (serie.value || '0' || 'N/A').toString()
        const bits = 8
        const identifier = '_'
        value = identifier.repeat(bits) + value
        const val = value.slice(-bits)
        stl +=
          '<br /><div style="display:inline-block;width:10px;height:10px;border-radius:5px;background:' +
          color +
          ';"></div>&ensp;' +
          serie.seriesName +
          ':&ensp;' +
          val.replace(/[_]/g, '&ensp;')
      }
    })
    const name = params[0] ? params[0].name : params.seriesName
    return stl
      ? '<div style="background:#fff;padding:5px 10px;color:#999;border-radius:5px;">' +
      name +
      stl +
      '</div>'
      : ''
  }
}

export const titleOption = {
  textStyle: {
    color: '#fff',
    fontSize: 12
  }
}

export const themeOption = {
  animationEasing: easingFuncs.exponentialInOut,
  backgroundColor: 'transparent',
  color: echartsJson.colorPalette,
  avoidLabelOverlap: true,
  title: titleOption,
  textStyle: {
    fontFamily: 'AlibabaPuHuiTi, JetBrainsMono, HYCuJianHeiJ',
    fontSize: 12
  }
}

export const toolBoxOption = {
  tooltip: {
    show: true // 必须引入 tooltip 组件
  },
  toolbox: {
    show: true,
    showTitle: false, // 隐藏默认文字，否则两者位置会重叠
    feature: {
      saveAsImage: {
        show: true,
        title: '保存为图片'
      },
    },
    tooltip: { // 和 option.tooltip 的配置项相同
      show: true,
      formatter: function (param: any) {
        return '<div>' + param.title + '</div>'; // 自定义的 DOM 结构
      },
      backgroundColor: '#999',
      textStyle: {
        fontSize: 12,
      },
      extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);' // 自定义的 CSS 样式
    }
  }
}

export const slientOption = {}

export enum paletteName {
  //复古
  CLASSIC = 'CLASSIC',
  //新特性
  EXPERIENCE = 'EXPERIENCE',
  //渐变
  GRADIENT = 'GRADIENT',
  //清新
  FRESH = 'FRESH',
  //商务
  BUSINESS = 'BUSINESS',
  //明亮
  BRIGHT = 'BRIGHT',
  //淡雅
  ELEGANT = 'ELEGANT',
  //冷色
  COOL = 'COOL',
  //暖色
  WARM = 'WARM',
  //科技
  TECHNOLOGY = 'TECHNOLOGY',
  //多彩
  COLORFUL = 'COLORFUL',
  //简洁
  SUCCINCT = 'SUCCINCT'
}

export const colorPalettes: Record<string, Array<string>> = {
  CLASSIC: [
    '#0780cf',
    '#765005',
    '#fa6d1d',
    '#0e2c82',
    '#b6b51f',
    '#da1f18',
    '#701866',
    '#f47a75',
    '#009db2',
    '#024b51',
    '#0780cf',
    '#765005'
  ],
  EXPERIENCE: [
    '#63b2ee',
    '#76da91',
    '#f8cb7f',
    '#f89588',
    '#7cd6cf',
    '#9192ab',
    '#7898e1',
    '#efa666',
    '#eddd86',
    '#9987ce',
    '#63b2ee',
    '#76da91'
  ],
  GRADIENT: [
    '#71ae46',
    '#96b744',
    '#c4cc38',
    '#ebe12a',
    '#eab026',
    '#e3852b',
    '#d85d2a',
    '#ce2626',
    '#ac2026',
    '#71ae46',
    '#96b744',
    '#c4cc38'
  ],
  FRESH: [
    '#00a8e1',
    '#99cc00',
    '#e30039',
    '#fcd300',
    '#800080',
    '#00994e',
    '#ff6600',
    '#808000',
    '#db00c2',
    '#008080',
    '#0000ff',
    '#c8cc00'
  ],
  BUSINESS: [
    '#194f97',
    '#555555',
    '#bd6b08',
    '#00686b',
    '#c82d31',
    '#625ba1',
    '#898989',
    '#9c9800',
    '#007f54',
    '#a195c5',
    '#103667',
    '#f19272'
  ],
  BRIGHT: [
    '#0e72cc',
    '#6ca30f',
    '#f59311',
    '#fa4343',
    '#16afcc',
    '#85c021',
    '#d12a6a',
    '#0e72cc',
    '#6ca30f',
    '#f59311',
    '#fa4343',
    '#16afcc'
  ],
  ELEGANT: [
    '#95a2ff',
    '#fa8080',
    '#ffc076',
    '#fae768',
    '#87e885',
    '#3cb9fc',
    '#73abf5',
    '#cb9bff',
    '#434348',
    '#90ed7d',
    '#f7a35c',
    '#8085e9'
  ],
  COOL: [
    '#bf19ff',
    '#854cff',
    '#5f45ff',
    '#02cdff',
    '#0090ff',
    '#314976',
    '#f9e264',
    '#f47a75',
    '#009db2',
    '#024b51',
    '#0780cf',
    '#765005'
  ],
  WARM: [
    '#9489fa',
    '#f06464',
    '#f7af59',
    '#f0da49',
    '#71c16f',
    '#2aaaef',
    '#5690dd',
    '#bd88f5',
    '#009db2',
    '#024b51',
    '#0780cf',
    '#765005'
  ],
  TECHNOLOGY: [
    '#05f8d6',
    '#0082fc',
    '#fdd845',
    '#22ed7c',
    '#09b0d3',
    '#1d27c9',
    '#f9e264',
    '#f47a75',
    '#009db2',
    '#024b51',
    '#0780cf',
    '#765005'
  ],
  COLORFUL: [
    '#ef4464',
    '#fad259',
    '#d22e8d',
    '#03dee0',
    '#d05c7c',
    '#bb60b2',
    '#433e7c',
    '#f47a75',
    '#009db2',
    '#024b51',
    '#0780cf',
    '#765005'
  ],
  SUCCINCT: [
    '#929fff',
    '#9de0ff',
    '#ffa897',
    '#af87fe',
    '#7dc3fe',
    '#bb60b2',
    '#433e7c',
    '#f47a75',
    '#009db2',
    '#024b51',
    '#0780cf',
    '#765005'
  ]
}

export const baseThemeOption = {
  animationEasing: "ElasticOut",
  backgroundColor: "transparent",
  color: colorPalettes["ELEGANT"],
  avoidLabelOverlap: true,
  textStyle: {
    fontFamily: "JetBrainsMapleMono",
  },
};

export interface EChartsInstance {
  name: string
  ins: echarts.ECharts
  defaultOption?: echarts.EChartsOption
}

export const defaultLoadingOptions = {
  text: "loading",
  // color: import.meta.env.VITE_APP_PRIMARY_COLOR,
  textColor: "#000",
  maskColor: "rgba(255, 255, 255, 0.8)",
  zlevel: 0,
  // 字体大小。从 `v4.8.0` 开始支持。
  fontSize: 14,
  // 是否显示旋转动画（spinner）。从 `v4.8.0` 开始支持。
  showSpinner: true,
  // 旋转动画（spinner）的半径。从 `v4.8.0` 开始支持。
  spinnerRadius: 20,
  // 旋转动画（spinner）的线宽。从 `v4.8.0` 开始支持。
  lineWidth: 5,
  // 字体粗细。从 `v5.0.1` 开始支持。
  fontWeight: "normal",
  // 字体风格。从 `v5.0.1` 开始支持。
  fontStyle: "normal",
  // 字体系列。从 `v5.0.1` 开始支持。
  fontFamily: "JetBrainsMapleMono",
};
