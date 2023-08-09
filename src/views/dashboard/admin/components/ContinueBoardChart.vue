<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import * as echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import { fetchLimitUpList } from '@/api/stock'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '420px'
    },
    autoResize: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    // this.$nextTick(() => {
      this.initChart()
    // })
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
      this.setOptions()
      setInterval(() => {
        this.setOptions();
      }, 1000*60*5);
    },
    setOptions() {
      fetchLimitUpList({high_days: ["首板","2天2板","3天3板"]}).then(res => {
        var dataSet = []
        const uniqueDates = [...new Set(res.data.map(item => item.date))]
        const sortedDates = uniqueDates.sort((a, b) => new Date(a) - new Date(b))

        // 格式化数据集 [日期 首板数 2天2板数 3天3板数 首板票 2天2板票 3天3板票 1进2淘汰票 2进3淘汰票 1进2成功率 2进3成功率]
        for (let i = 0; i < sortedDates.length; ++i) {
          const filter_date = sortedDates[i]
          const stocks_1 = res.data.slice(0).reduce((acc, item) => {
            if (item.date === filter_date && item.high_days === '首板' && item.is_open === 0) {
              return acc + 1
            }
            return acc
          }, 0)
          const stocks_2 = res.data.slice(0).reduce((acc, item) => {
            if (item.date === filter_date && item.high_days === '2天2板' && item.is_open === 0) {
              return acc + 1
            }
            return acc
          }, 0)
          const stocks_3 = res.data.slice(0).reduce((acc, item) => {
            if (item.date === filter_date && item.high_days === '3天3板' && item.is_open === 0) {
              return acc + 1
            }
            return acc
          }, 0)
          dataSet.push([
            sortedDates[i],
            stocks_1,
            stocks_2,
            stocks_3
          ])
        }
        dataSet[0].push(null, null)
        for (let i = 1; i < dataSet.length; ++i) {
          // 淘汰票
          dataSet[i].push(
            // 成功率
            parseInt(dataSet[i][2] / dataSet[i - 1][1] * 100),
            parseInt(dataSet[i][3] / dataSet[i - 1][2] * 100)
          )
        }
        if(this.chart) {
          this.chart.setOption({
            dataset: {
              source: dataSet
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
              // formatter: function(params) {
              //   data = params[0]['data']
              // }
            },
            legend: { data: ['1进2', '2进3', '1进2成功率', '2进3成功率'] },
            grid: {
              left: '5%',
              right: '10%',
              top: '20%',
              bottom: '15%'
              // containLabel: true
            },
            dataZoom: [
              {
                type: 'inside'
              }
            ],
            xAxis: [
              {
                // boundaryGap: [0, 0.01],
                type: 'category',
                axisPointer: {
                  type: 'shadow'
                },
                axisLabel: {
                  rotate: -45
                }
              }
            ],
            yAxis: [
              {
                type: 'value',
                name: '涨停数',
                min: 0,
                max: function(value) {
                  return value.max
                },
                interval: 20,
                axisLabel: {
                  formatter: '{value}'
                }
              },
              {
                type: 'value',
                name: '成功率',
                min: 0,
                max: 100,
                interval: 20,
                axisLabel: {
                  formatter: '{value}%'
                }
              }
            ],
            series: [
              {
                name: '1进2',
                type: 'bar',
                barMaxWidth: 15,
                encode: {
                  x: 0,
                  y: 2,
                  tooltip: 2
                }
              },
              {
                name: '2进3',
                type: 'bar',
                barMaxWidth: 15,
                encode: {
                  x: 0,
                  y: 3,
                  tooltip: 3
                }
              },
              {
                name: '1进2成功率',
                type: 'line',
                smooth: false,
                yAxisIndex: 1,
                tooltip: {
                  valueFormatter: (value) => value + '%'
                },
                encode: {
                  x: 0,
                  y: 4,
                  tooltip: 9
                }
              },
              {
                name: '2进3成功率',
                type: 'line',
                smooth: false,
                yAxisIndex: 1,
                tooltip: {
                  valueFormatter: (value) => value + '%'
                },
                encode: {
                  x: 0,
                  y: 5,
                  tooltip: 10
                }
              }
            ]
          })
        }
      })
    }
  }
}
</script>
