<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import { fetchStockCandlestick } from '@/api/stock'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '1050px'
    },
    height: {
      type: String,
      default: '620px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    code: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    code: {
      handler(val) {
        fetchStockCandlestick({ code: val }).then(res => {
          this.setOptions(res.data)
        })
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      // this.setOptions(this.chartData)
    },
    setOptions(val) {
      const upColor = '#00da3c'
      const downColor = '#ec0000'
      // 分离数据,衍生新数据
      function splitData(rawData) {
        const categoryData = []
        const values = []
        const volumes = []
        for (let i = 0; i < rawData.length; i++) {
          // categoryData.push(formatDate(rawData[i].splice(0, 1)[0]));
          categoryData.push(rawData[i].splice(0, 1)[0]) // splice删除（插入）元素，会改变原数组！从index=0开始删除1个元素，返回值为删除掉的元素所组成的数组
          values.push(rawData[i]) // 原数组删除index=0的元素后的数组
          volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? -1 : 1]) // [index,成交量,涨跌flag]
        }
        return {
          categoryData: categoryData,
          values: values,
          volumes: volumes
        }
      }
      function calculateMA(dayCount, data) {
        var result = []
        for (var i = 0, len = data.values.length; i < len; i++) {
          if (i < dayCount) {
            result.push('-')
            continue
          }
          var sum = 0
          for (var j = 0; j < dayCount; j++) {
            sum += data.values[i - j][1]
          }
          result.push(+(sum / dayCount).toFixed(3))
        }
        return result
      }
      // 深拷贝
      // const candlestickData = JSON.parse(JSON.stringify(val))
      const data = splitData(val)
      this.chart.setOption({
        animation: false,
        legend: {
          bottom: 10,
          left: 'center',
          data: ['日K线', 'MA5', 'MA10', 'MA20', 'MA60']
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          backgroundColor: 'rgba(0,0,0,0.2)',
          textStyle: {
            color: '#000'
          },
          position: function(pos, params, el, elRect, size) {
            const obj = {
              top: 10
            }
            obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30
            return obj
          },
          formatter: function(param) {
            let par
            for (let i = 0; i < param.length; i++) {
              if (param[i].seriesType == 'candlestick') {
                par = param[i]
              }
            }
            if (par.data[8] > 0) {
              return [
                par.name + '<hr size=1 style="margin: 3px 0">',
                '开盘: ' + par.data[1] + '<br/>',
                '收盘: ' + par.data[2] + '<br/>',
                '最高: ' + par.data[3] + '<br/>',
                '最低: ' + par.data[4] + '<br/>',
                '成交量: ' + (par.data[5] / 10000).toFixed(1) + '万手<br/>',
                // '成交额: ' + Math.round(par.data[6]/10000) + '万元<br/>',
                '成交额: ',
                par.data[6] / 10000 > 10000 ? (par.data[6] / 100000000).toFixed(1) + '亿元<br/>' : Math.round(par.data[6] / 10000) + '万元<br/>',
                '涨跌幅: <span style="color:red">+' + par.data[8] + '%</span><br/>',
                '振幅: ' + par.data[7] + '%'
              ].join('')
            } else {
              return [
                par.name + '<hr size=1 style="margin: 3px 0">',
                '开盘: ' + par.data[1] + '<br/>',
                '收盘: ' + par.data[2] + '<br/>',
                '最高: ' + par.data[3] + '<br/>',
                '最低: ' + par.data[4] + '<br/>',
                '成交量: ' + (par.data[5] / 10000).toFixed(1) + '万手<br/>',
                '成交额: ',
                par.data[6] / 10000 > 10000 ? (par.data[6] / 100000000).toFixed(1) + '亿元<br/>' : Math.round(par.data[6] / 10000) + '万元<br/>',
                '涨跌幅: <span style="color:green">' + par.data[8] + '%</span><br/>',
                '振幅: ' + par.data[7] + '%'
              ].join('')
            }
          }
          //   extraCssText: 'width: 170px'
        },
        axisPointer: {
          link: [
            {
              xAxisIndex: 'all'
            }
          ],
          label: {
            backgroundColor: '#777'
          }
        },
        visualMap: {
          show: false,
          seriesIndex: 5,
          dimension: 2,
          pieces: [
            {
              value: 1,
              color: downColor
            },
            {
              value: -1,
              color: upColor
            }
          ]
        },
        grid: [
          {
            left: '2%',
            right: '5%',
            height: '50%'
          },
          {
            left: '2%',
            right: '5%',
            top: '68%',
            height: '16%'
          }
        ],
        xAxis: [
          {
            type: 'category',
            data: data.categoryData,
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
              z: 100
            }
          },
          {
            type: 'category',
            gridIndex: 1,
            data: data.categoryData,
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            min: 'dataMin',
            max: 'dataMax'
          }
        ],
        yAxis: [
          {
            scale: true,
            splitArea: {
              show: true
            }
          },
          {
            scale: true,
            name: '成交量',
            gridIndex: 1,
            splitNumber: 2,
            // axisLabel: { show: false },  //显示y轴刻度
            axisLabel: {
              formatter: function(value, index) {
                return Math.round(value / 10000) + '万'
              }
            },
            max: 'dataMax',
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false }
          }
        ],
        dataZoom: [
          {
            type: 'inside', // 内置型数据区域缩放组件
            xAxisIndex: [0, 1],
            start: 0, // 数据窗口范围的起始百分比。范围是：0 ~ 100。表示 0% ~ 100%。
            end: 100
          },
          {
            show: true,
            xAxisIndex: [0, 1],
            type: 'slider', // 滑动条型数据区域缩放组件
            top: '85%',
            start: 98,
            end: 100
          }
        ],
        series: [
          {
            name: '日K线',
            type: 'candlestick',
            data: data.values,
            itemStyle: {
              color: downColor,
              color0: upColor,
              borderColor: undefined,
              borderColor0: undefined
            }
          },
          {
            name: 'MA5',
            type: 'line',
            data: calculateMA(5, data),
            smooth: true,
            showSymbol: false,
            lineStyle: {
              opacity: 0.5
            }
          },
          {
            name: 'MA10',
            type: 'line',
            data: calculateMA(10, data),
            smooth: true,
            symbol: 'none',
            lineStyle: {
              opacity: 0.5
            }
          },
          {
            name: 'MA20',
            type: 'line',
            data: calculateMA(20, data),
            smooth: true,
            symbol: 'none',
            lineStyle: {
              opacity: 0.5
            }
          },
          {
            name: 'MA60',
            type: 'line',
            data: calculateMA(60, data),
            smooth: true,
            symbol: 'none',
            lineStyle: {
              opacity: 0.5
            }
          },
          {
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: data.volumes
          }
        ]
      })
    }
  }
}
</script>
