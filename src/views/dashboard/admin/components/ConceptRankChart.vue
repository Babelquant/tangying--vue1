<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'

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
      default: '300px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
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
      // console.log("chartdata:",this.chartData)
      this.setOptions(this.chartData)
    },
    setOptions(val) {
      var xData = []
      var yData = []
      const Data = val.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1
        return acc
      }, {})
      var entries = Object.entries(Data)
      entries.sort(function(a, b) {
        return a[1] - b[1]
      })
      var sortedData = Object.fromEntries(entries.slice(-10))
      for (const key in sortedData) {
        yData.push(key)
        xData.push(Data[key])
      }
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {},
        grid: {
          left: '25%',
          right: '4%',
          top: '10%',
          bottom: '10%'
          // containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: yData
        },
        series: [
          {
            // name: '2011',
            type: 'bar',
            data: xData
          }
        ]
      })
    }
  }
}
</script>
