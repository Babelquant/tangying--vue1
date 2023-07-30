<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import * as echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '190px'
    },
    height: {
      type: String,
      default: '75px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      chart: null
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
      this.setOptions(this.data)
    },
    setOptions(val) {
      this.chart.setOption({
        xAxis: {
          data: [],
          show: false
        },
        yAxis: {
          show: false
        },
        series: [
          {
            type: 'line',
            data: [-0.2344, -0.2344, -0.5208, -0.599, -0.2604, -0.5469, -0.4167, 0.2083, 0.1042, 0.1823, 1.1458, 0.8333, 2.1615, 3.6458, 4.0365, 4.1406, 5.0521, 7.2396, 8.5417, 9.375, 8.2813, 7.8125, 7.6563, 7.6823, 8.724, 9.7656, 10.0, 10.0, 10.0, 9.7656, 10.0, 9.6615, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0]
          }
        ]
      })
    }
  }
}
</script>
