import echartsJson from './echarts.json'

export interface TooltipFormatterParamsModel {
  componentType: string
  // 系列类型
  seriesType: string
  // 系列在传入的 option.series 中的 index
  seriesIndex: number
  // 系列名称
  seriesName: string
  // 数据名，类目名
  name: string
  // 数据在传入的 data 数组中的 index
  dataIndex: number
  // 传入的原始数据项
  data: Record<string, any>
  // 传入的数据值。在多数系列下它和 data 相同。在一些系列下是 data 中的分量（如 map、radar 中）
  value: number | Array<Record<string, any>> | Record<string, any>
  // 坐标轴 encode 映射信息，
  // key 为坐标轴（如 'x' 'y' 'radius' 'angle' 等）
  // value 必然为数组，不会为 null/undefied，表示 dimension index 。
  // 其内容如：
  // {
  //     x: [2] // dimension index 为 2 的数据映射到 x 轴
  //     y: [0] // dimension index 为 0 的数据映射到 y 轴
  // }
  encode: Record<string, any>
  // 维度名列表
  dimensionNames: Array<string>
  // 数据的维度 index，如 0 或 1 或 2 ...
  // 仅在雷达图中使用。
  dimensionIndex: number
  // 数据图形的颜色
  color: string

  // 饼图的百分比
  percent: number
}

export interface EChartsTooltipFormatterParamsModel {
  componentType: string
  dataIndex: number
  name: string
  data: { [x: string]: number | string }
  seriesName: string
  seriesIndex: number
  color: string
}

export interface EChartsMapTooltipFormatterParamsModel
  extends EChartsTooltipFormatterParamsModel {
  data: {
    fromName: string
    toName: string
    count: string
  }
}

export interface EChartsPieDataModel {
  name: string
  value: number
}

export const echartsTopOption = {
  animationEasing: 'ElasticOut',
  color: echartsJson.colorPalette,
  title: {
    show: false,
    textStyle: {
      fontSize: 16,
      fontFamily: 'CallingCode-Regular'
    },
    left: 5,
    top: 5
  },
  legend: {
    top: '5px',
    right: '20px',
    itemHeight: 10,
    align: 'left',
    textStyle: {
      fontSize: 12,
      lineHeight: 12,
      fontFamily: 'CallingCode-Regular',
      height: 12
    },
    icon: 'path://M856 437.568l-128 0c-5.056 0-9.536 1.792-14.336 2.88C722.432 334.336 625.28 256 509.056 256 392.96 256 295.808 334.272 264.576 440.32c-4.608-1.024-8.96-2.752-13.824-2.752L128 437.568c-35.392 0-64 28.608-64 64s28.608 64 64 64l122.752 0c2.752 0 5.12-1.216 7.744-1.536C282.624 680.256 385.728 768 509.056 768c123.392 0 226.624-87.808 250.752-204.096C762.624 564.288 765.056 565.568 768 565.568l128 0c35.328 0 64-28.608 64-64S931.328 437.568 896 437.568zM509.056 704C403.2 704 317.12 617.856 317.12 512S403.2 320 509.056 320c105.856 0 192.064 86.144 192.064 192S614.912 704 509.056 704z',
    formatter: function (name: string) {
      return name
    }
  },
  tooltip: {
    trigger: 'axis',
    extraCssText: 'box-shadow: 0 0 7px rgba(0, 0, 0, 0.6);',
    axisPointer: {
      // 坐标轴指示器，坐标轴触发有效
      type: 'line' // 默认为直线，可选为：'line' | 'shadow'
    },
    backgroundColor: 'rgba(255,255,255,1)',
    formatter: function (params: any) {
      let stl = ''

      params.forEach(function (serie: any, index: number) {
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
  },
  grid: {
    left: '10px',
    right: '45px',
    bottom: '3%',
    top: '50px',
    containLabel: true
  },
  yAxis: [
    {
      type: 'category',
      axisTick: {
        show: false
      },
      axisLine: {
        //y轴
        show: false
      },
      axisLabel: {
        // interval: 0,
        fontFamily: 'CallingCode-Regular'
      },
      inverse: true
    }
  ],
  xAxis: [
    {
      type: 'value',
      axisTick: {
        show: false
      },
      axisLine: {
        //y轴
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        fontFamily: 'CallingCode-Regular'
      }
    }
  ],
  series: [
    {
      label: {
        fontFamily: 'CallingCode-Regular'
      }
    }
  ]
}

export const echartsPieOption = {
  animationEasing: 'ElasticOut',
  color: echartsJson.colorPalette,
  avoidLabelOverlap: false,
  title: {
    show: true,
    textStyle: {
      fontSize: 16,
      fontFamily: 'CallingCode-Regular'
    },
    left: 5,
    top: 5
  },
  legend: {
    show: false,
    top: '5px',
    right: '20px',
    orient: 'vertical',
    itemHeight: 10,
    align: 'left',
    textStyle: {
      fontSize: 12,
      lineHeight: 12,
      fontFamily: 'CallingCode-Regular',
      height: 12
    },
    icon: 'path://M856 437.568l-128 0c-5.056 0-9.536 1.792-14.336 2.88C722.432 334.336 625.28 256 509.056 256 392.96 256 295.808 334.272 264.576 440.32c-4.608-1.024-8.96-2.752-13.824-2.752L128 437.568c-35.392 0-64 28.608-64 64s28.608 64 64 64l122.752 0c2.752 0 5.12-1.216 7.744-1.536C282.624 680.256 385.728 768 509.056 768c123.392 0 226.624-87.808 250.752-204.096C762.624 564.288 765.056 565.568 768 565.568l128 0c35.328 0 64-28.608 64-64S931.328 437.568 896 437.568zM509.056 704C403.2 704 317.12 617.856 317.12 512S403.2 320 509.056 320c105.856 0 192.064 86.144 192.064 192S614.912 704 509.056 704z',
    formatter: function (name: string) {
      return name
    }
  },
  tooltip: {
    trigger: 'item',
    extraCssText: 'box-shadow: 0 0 7px rgba(0, 0, 0, 0.6);padding:5px 10px;',
    axisPointer: {
      // 坐标轴指示器，坐标轴触发有效
      type: 'line' // 默认为直线，可选为：'line' | 'shadow'
    },
    textStyle: {
      color: '#999'
    },
    backgroundColor: 'rgba(255,255,255,1)',
    // formatter: '{a} <br/>{b}: {c} ({d}%)'
    formatter: function (params: any) {
      let stl = ''
      if (params.componentType === 'series') {
        const color =
          echartsJson.colorPalette[
            params.dataIndex % echartsJson.colorPalette.length
          ]
        let value = (params.value || '0' || 'N/A').toString()
        const bits = 8
        const identifier = '_'
        value = identifier.repeat(bits) + value
        const val = value.slice(-bits)
        stl +=
          '<br /><div style="display:inline-block;width:10px;height:10px;border-radius:5px;background:' +
          color +
          ';"></div>&ensp;' +
          params.name +
          ':&ensp;' +
          val.replace(/[_]/g, '&ensp;')
      }

      const name = params.seriesName
      return stl
        ? '<div style="background:#fff;padding:5px 10px;color:#999;border-radius:5px;">' +
            name +
            stl +
            '</div>'
        : ''
    }
  },
  grid: {
    left: '10px',
    right: '10px',
    bottom: '25px',
    top: '25px',
    containLabel: true
  },
  series: []
}

export const echartsMapOption = {
  animationEasing: 'ElasticOut',
  color: echartsJson.colorPalette,
  avoidLabelOverlap: true,
  title: {
    show: true,
    textStyle: {
      fontSize: 16,
      fontFamily: 'CallingCode-Regular'
    },
    left: 5,
    top: 5
  },
  tooltip: {
    trigger: 'item',
    extraCssText: 'box-shadow: 0 0 7px rgba(0, 0, 0, 0.6);padding:5px 10px;',
    axisPointer: {
      // 坐标轴指示器，坐标轴触发有效
      type: 'line' // 默认为直线，可选为：'line' | 'shadow'
    },
    textStyle: {
      color: '#999'
    },
    showEffectOn: 'emphasis',
    rippleEffect: { brushType: 'stroke' },
    backgroundColor: 'rgba(255,255,255,1)',
    // formatter: '{a} <br/>{b}: {c} ({d}%)'
    formatter: function (params: any) {
      let stl = ''
      if (params.componentType === 'series') {
        const color =
          echartsJson.colorPalette[
            params.seriesIndex % echartsJson.colorPalette.length
          ]
        let value = (params.data.value[2] || '0' || 'N/A').toString()
        const bits = 8
        const identifier = '_'
        value = identifier.repeat(bits) + value
        const val = value.slice(-bits)
        stl +=
          '<br /><div style="display:inline-block;width:10px;height:10px;border-radius:5px;background:' +
          color +
          ';"></div>&ensp;' +
          params.name +
          ':&ensp;' +
          val.replace(/[_]/g, '&ensp;')
      }

      const name = params.seriesName
      return stl
        ? '<div style="background:#fff;padding:5px 10px;color:#999;border-radius:5px;">' +
            name +
            stl +
            '</div>'
        : ''
    }
  }
}

export const planePath =
  'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z'

export const easingFuncs = {
  linear: function (k: number) {
    return k
  },
  quadraticIn: function (k: number) {
    return k * k
  },
  quadraticOut: function (k: number) {
    return k * (2 - k)
  },
  quadraticInOut: function (k: number) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k
    }
    return -0.5 * (--k * (k - 2) - 1)
  },
  cubicIn: function (k: number) {
    return k * k * k
  },
  cubicOut: function (k: number) {
    return --k * k * k + 1
  },
  cubicInOut: function (k: number) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k
    }
    return 0.5 * ((k -= 2) * k * k + 2)
  },
  quarticIn: function (k: number) {
    return k * k * k * k
  },
  quarticOut: function (k: number) {
    return 1 - --k * k * k * k
  },
  quarticInOut: function (k: number) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k * k
    }
    return -0.5 * ((k -= 2) * k * k * k - 2)
  },
  quinticIn: function (k: number) {
    return k * k * k * k * k
  },
  quinticOut: function (k: number) {
    return --k * k * k * k * k + 1
  },
  quinticInOut: function (k: number) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k * k * k
    }
    return 0.5 * ((k -= 2) * k * k * k * k + 2)
  },
  sinusoidalIn: function (k: number) {
    return 1 - Math.cos((k * Math.PI) / 2)
  },
  sinusoidalOut: function (k: number) {
    return Math.sin((k * Math.PI) / 2)
  },
  sinusoidalInOut: function (k: number) {
    return 0.5 * (1 - Math.cos(Math.PI * k))
  },
  exponentialIn: function (k: number) {
    return k === 0 ? 0 : Math.pow(1024, k - 1)
  },
  exponentialOut: function (k: number) {
    return k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
  },
  exponentialInOut: function (k: number) {
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if ((k *= 2) < 1) {
      return 0.5 * Math.pow(1024, k - 1)
    }
    return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2)
  },
  circularIn: function (k: number) {
    return 1 - Math.sqrt(1 - k * k)
  },
  circularOut: function (k: number) {
    return Math.sqrt(1 - --k * k)
  },
  circularInOut: function (k: number) {
    if ((k *= 2) < 1) {
      return -0.5 * (Math.sqrt(1 - k * k) - 1)
    }
    return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1)
  },
  elasticIn: function (k: number) {
    let s = 0.0
    let a = 0.1
    const p = 0.4
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if (!a || a < 1) {
      a = 1
      s = p / 4
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI)
    }
    return -(
      a *
      Math.pow(2, 10 * (k -= 1)) *
      Math.sin(((k - s) * (2 * Math.PI)) / p)
    )
  },
  elasticOut: function (k: number) {
    let s = 0.0
    let a = 0.1
    const p = 0.4
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if (!a || a < 1) {
      a = 1
      s = p / 4
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI)
    }
    return (
      a * Math.pow(2, -10 * k) * Math.sin(((k - s) * (2 * Math.PI)) / p) + 1
    )
  },
  elasticInOut: function (k: number) {
    let s = 0.0
    let a = 0.1
    const p = 0.4
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if (!a || a < 1) {
      a = 1
      s = p / 4
    } else {
      s = (p * Math.asin(1 / a)) / (2 * Math.PI)
    }
    if ((k *= 2) < 1) {
      return (
        -0.5 *
        (a *
          Math.pow(2, 10 * (k -= 1)) *
          Math.sin(((k - s) * (2 * Math.PI)) / p))
      )
    }
    return (
      a *
        Math.pow(2, -10 * (k -= 1)) *
        Math.sin(((k - s) * (2 * Math.PI)) / p) *
        0.5 +
      1
    )
  },

  // 在某一动画开始沿指示的路径进行动画处理前稍稍收回该动画的移动
  backIn: function (k: number) {
    const s = 1.70158
    return k * k * ((s + 1) * k - s)
  },
  backOut: function (k: number) {
    const s = 1.70158
    return --k * k * ((s + 1) * k + s) + 1
  },
  backInOut: function (k: number) {
    const s = 1.70158 * 1.525
    if ((k *= 2) < 1) {
      return 0.5 * (k * k * ((s + 1) * k - s))
    }
    return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2)
  },

  // 创建弹跳效果
  bounceIn: function (k: number) {
    return 1 - easingFuncs.bounceOut(1 - k)
  },
  bounceOut: function (k: number) {
    if (k < 1 / 2.75) {
      return 7.5625 * k * k
    } else if (k < 2 / 2.75) {
      return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75
    } else if (k < 2.5 / 2.75) {
      return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375
    } else {
      return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375
    }
  },
  bounceInOut: function (k: number) {
    if (k < 0.5) {
      return easingFuncs.bounceIn(k * 2) * 0.5
    }
    return easingFuncs.bounceOut(k * 2 - 1) * 0.5 + 0.5
  }
}
