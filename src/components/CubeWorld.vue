<template>
  <div id="main" class="w-full h-full"></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import * as echarts from 'echarts'
import 'echarts-gl'
import geoJson from '@/assets/charts/world.json'
import { EChartsType } from 'echarts';

function rodamData() {
  // let longitude = 105.18
  let longitude = Math.random() * 360 - 180
  let longitude2 = Math.random() * 360 - 180
  // let latitude = 37.51
  let latitude = Math.random() * 180 - 90
  let latitude2 = Math.random() * 180 - 90
  return {
    coords: [
      [longitude2, latitude2],
      [longitude, latitude],
    ],
    value: (Math.random() * 3000).toFixed(2),
  }
}

const emit = defineEmits(['clickCountry'])
let baseTexture: EChartsType
onMounted(() => {
  // 初始化echarts实例
  const myChart = echarts.init(document.getElementById('main'))
  echarts.registerMap('world', geoJson)
  let canvas = document.createElement('canvas')
  baseTexture = echarts.init(canvas, null, {
    width: 4096,
    height: 2048,
  })
  baseTexture.setOption({
    backgroundColor: '#1E288BFF', // 地球颜色
    geo: {
      show: true,
      map: `world`,
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      boundingCoords: [
        [-180, 90],
        [180, -90],
      ],
      itemStyle: {
        normal: {
          areaColor: '#8793D4',
          borderColor: '#000',
          borderWidth: 1,
        },
        emphasis: {
          areaColor: '#DADCF5',
          borderWidth: 0,
        },
      },
      regions: [
        {
          name: 'China',
          itemStyle: {
            areaColor: '#aa381e',
          },
        },
        {
          name: 'Russia',
          itemStyle: {
            areaColor: '#12a182',
          },
        },
      ],
    },
  })
  // 点击事件
  baseTexture.on('click', function (params) {
    console.log(params, 'params')
    if (params.componentType === 'geo') {
      // alert(`你点击了 ${params.name}`)
      emit('clickCountry', params.name)
    }
  })
  // 航线数据
  var alirl = [
    // Paris (2.3522, 48.8566) to Beijing (116.4074, 39.9042)
    [
      [2.3522, 48.8566],
      [116.4074, 39.9042],
    ],
    // Washington, D.C. (-77.0369, 38.9072) to Tokyo (139.6917, 35.6895)
    [
      [-77.0369, 38.9072],
      [139.6917, 35.6895],
    ],
    // London (-0.1276, 51.5074) to Canberra (149.131, -35.2809)
    [
      [-0.1276, 51.5074],
      [149.131, -35.2809],
    ],
    // Moscow (37.6173, 55.7558) to Berlin (13.405, 52.52)
    [
      [37.6173, 55.7558],
      [13.405, 52.52],
    ],
    // Ottawa (-75.6972, 45.4215) to Brasilia (-47.9292, -15.7801)
    [
      [-75.6972, 45.4215],
      [-47.9292, -15.7801],
    ],
  ]
  let option = {
    backgroundColor: '#05050F', // 背景颜色
    globe: {
      baseTexture: baseTexture,
      shading: 'color',
      light: {
        ambient: {
          intensity: 0.4,
        },
        main: {
          intensity: 0.4,
        },
      },
      viewControl: {
        targetCoord: [116.2, 39.55], // 当前定位经纬度
        autoRotate: false,
        distance: 210, // 地球缩放大小
      },
    },
    series: [
      {
        //航线的视图效果
        type: 'lines3D',
        coordinateSystem: 'globe',
        effect: {
          show: true,
          trailWidth: 5,
          trailOpacity: 1,
          trailLength: 0.2,
          constantSpeed: 5,
        },
        blendMode: 'lighter',
        lineStyle: {
          color: '#EBE806',
          width: 1,
          opacity: 1,
        },

        data: alirl,
      },
      {
        // 飞线效果
        name: 'lines3D',
        type: 'lines3D',
        coordinateSystem: 'globe',
        effect: {
          show: true,
          // period: 2,
          // trailWidth: 3,
          // trailLength: 0.5,
          // trailOpacity: 1,
          // trailColor: '#0087f4',
        },
        blendMode: 'lighter',
        lineStyle: {
          width: 3,
          // width: 1,
          color: '#0087f4',
          // opacity: 0,
        },
        data: [],
        silent: false,
      },
    ],
  }
  // 载入随机飞线数据
  for (let i = 0; i < 50; i++) {
    // @ts-ignore
    option.series[1].data = option.series[1].data.concat(rodamData())
  }
  myChart.setOption(option, true)
})
</script>
<style lang="less" scoped>
#main {
  min-width: 50vw;
  min-height: 45vh;
}
</style>
