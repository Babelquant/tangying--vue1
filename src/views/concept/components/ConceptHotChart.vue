<template>
    <div :class="className" :style="{height:height,width:width}" />
  </template>
  
  <script>
  import * as echarts from 'echarts'
  require('echarts/theme/macarons') // echarts theme
  // import resize from './mixins/resize'
  import { fetchConceptHot } from '@/api/stock'
  
  export default {
    // mixins: [resize],
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
        fetchConceptHot().then(res => {
          this.setOptions(res.data)
        })
      },
      setOptions(_rawData) {
        const datasetWithFilters = []
        const seriesList = []
        const concepts = Array.from(new Set(_rawData.slice(1).map(item => item[1])))
        echarts.util.each(concepts, function (concept) {
          var datasetId = '_' + concept
          // var d = new Date()
          // var start_time = _this.formatterDate(d) + "T09:20"
          // var end_time = _this.formatterDate(d) + "T16:00"
  
          datasetWithFilters.push({
            id: datasetId,
            fromDatasetId: 'dataset_raw',
            //数据集转换器
            transform: {
              type: 'filter', //转换方式
              config: {//转换条件
                and: [
                  // { dimension: 'Time', gte: start_time,parser: 'time' }, //维度:Year 操作符：gte(>=)  比较对象：1950 详细参考文档
                  // { dimension: 'Time', lte: end_time,parser: 'time' },
                  { dimension: 'Concept', '=': concept } //维度：Country 关系操作符：=  比较对象：country
                ]
              }
            }
          });
          seriesList.push({
            type: 'line',
            datasetId: datasetId,
            showSymbol: false, //只在主轴为类目轴时有效,随主轴标签间隔隐藏策略(选中一条线其他线变暗)
            name: concept,  //系列名称，用于tooltip的显示
            endLabel: {  //折线图尾部文字
              show: true,
              formatter: function (params) {   //回调：尾部文字样式
                return params.value[1] + ': ' + params.value[2];
              }
            },
            labelLayout: {  //标签重叠时是否挪动标签位置，防重叠
              // moveOverlap: 'shiftY'  //垂直位移
              hideOverlap: true
            },
            emphasis: {  //在高亮图形时，是否淡出其它数据的图形
              focus: 'series'  //淡出
            },
            encode: {  //可以定义 data 的哪个维度被编码成什么
              x: 'Date',  //表示维度Time映射到x轴
              y: 'LimitUpNum',  //表示维度Popularity映射到y轴
              label: ['Concept', 'LimitUpNum'],  //表示维度Country、Income的键、 值会在tooltip中显示
              itemName: 'Date',  //表示维度Time为数据项名称
              tooltip: ['LimitUpNum']
            }
          })
        });
        this.chart.setOption({
          // 动画时长
          animationDuration: 2000,
          dataset: [
            {
              id: 'dataset_raw',
              source: _rawData
            },
            ...datasetWithFilters
          ],
          // title: {
          //   text: '概念走势',
          //   left: "center"
          // },
          tooltip: { //多系列提示框浮层排列顺序
            order: 'valueDesc', //根据数据值, 降序排列
            trigger: 'axis',  
            textStyle: {
              fontSize: 6
            },
            position: function (point) {
              // 固定在顶部
              return [point[0], '5%'];
            },
          },
          xAxis: {
            type: 'time', //时间轴类型
            nameLocation: 'end', //坐标轴名称显示位置
            axisLabel: {
              formatter: '{yyyy}-{M}-{d}'
            }
          },
          yAxis: {
            // name: '强度'
          },
          grid: {
            left: '2%',
            right: '8%',
            top: '2%',
            bottom: '10%'
          },
          series: seriesList
        })
      }
    }
  }
  </script>
  