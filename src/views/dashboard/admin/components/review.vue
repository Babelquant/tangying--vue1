<template>
  <div class="flex flex-center">
    <!-- 左图 -->
    <div class="left-charts flex column">
      <div class="flex" style="height:300px;">
        <div id="concept-rank" class="flex-row-half" />
        <div id="industry-rank" class="flex-row-half" />
        <div v-show="showIndustryDetail" ref="industryTable" class="industry-tooltip">
          <el-table
            :data="limitupIndustryTableData"
            size="mini"
            style="width: 100%"
          >
            <el-table-column
              prop="名称"
              label="股票名称"
              width="70"
            />
            <el-table-column
              prop="最新价"
              label="最新价"
              width="60"
            />
            <el-table-column
              prop="流通市值"
              label="流通盘"
              width="60"
            />
            <el-table-column
              prop="封板资金"
              label="封单金额"
              width="70"
            />
            <el-table-column
              prop="首次封板时间"
              label="首封时间"
              width="70"
            />
            <el-table-column
              prop="连板数"
              label="连板数"
              width="60"
            />
          </el-table>
        </div>
      </div>
      <div id="limitupStatistic" style="height:450px;padding-top: 50px;" />
    </div>
    <!-- 右图 -->
    <div class="right-charts flex column">
      <div class="flex" style="height:300px;">
        <!-- 涨停池 -->
        <div class="flex column" style="width: 570px;">
          <el-table
            :data="limituptableData.filter(data => !limituptable_search || data.High_days.toLowerCase().includes(limituptable_search.toLowerCase()))"
            height="278"
            style="width: 100%"
            @row-click="lookCandlestick"
          >
            <el-table-column
              prop="Name"
              label="股票名称"
              width="80"
            />
            <el-table-column
              prop="Latest"
              label="涨停价"
              width="75"
            />
            <el-table-column
              prop="Currency_value"
              label="流通盘"
              :formatter="valueSuffix"
              width="75"
            />
            <!-- <el-table-column
                        prop="_Reason_type"
                        label="涨停原因"
                        width="130">
                        </el-table-column> -->
            <!-- <el-table-column
                        prop="Limitup_type"
                        label="涨停形态"
                        width="80">
                        </el-table-column> -->
            <el-table-column
              prop="High_days"
              label="几天几板"
              width="80"
            />
            <!-- <el-table-column
                        prop="Change_rate"
                        label="换手率"
                        width="70">
                        </el-table-column> -->
            <el-table-column
              width="250"
            >
              <template slot="header" slot-scope="scope">
                <el-input
                  v-model="limituptable_search"
                  size="mini"
                  placeholder="几天几板"
                />
              </template>
              <template slot-scope="scope">
                <span>{{ scope.row._Reason_type }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="flex column" style="width: 420px;">
          <div class="flex" style="height: 40%;">
            <div class="flex:1" style="padding: 5px;">
              <el-card
                :body-style="{padding: '5px'}"
                style="width: 220px;height: 100%;"
              >
                <div style="height: 20px;" class="text-center">涨停板</div>
                <div class="flex" style="height: 65px;">
                  <div class="text-center flex-row-half limitup-num-font" :style="{'color':todayLimitupNum>yesterdayLimitupNum?'red':'green'}">{{ todayLimitupNum }}</div>
                  <div class="text-center flex-row-half limitup-num-font">{{ yesterdayLimitupNum }}</div>
                </div>
                <div class="flex" style="height: 20px;">
                  <div class="text-center flex-row-half">今日</div>
                  <div class="text-center flex-row-half">昨日</div>
                </div>
              </el-card>
            </div>

            <div class="flex column">
              <!-- 股票搜索框 -->
              <el-autocomplete
                v-model="search_stock"
                style="margin-left: auto;"
                class="inline-input"
                :fetch-suggestions="stockQuerySearch"
                placeholder="输入股票名/k线图查询"
                size="mini"
                :clearable="true"
                :maxlength="8"
                :trigger-on-focus="false"
                @select="stockSelect"
              />
              <div style="padding-top: 15px;">
                <!-- 上证指数 -->
                <el-card
                  :body-style="{padding: '5px'}"
                >
                  <!-- v-if用于条件判断,判断Dom元素是否显示 -->
                  <div v-if="shangzheng_index != null" class="flex" :style="indexColor(shangzheng_index.涨跌额)">
                    <div class="shangzheng-index-font" style="width: 70%;line-height: 60px;">{{ shangzheng_index.最新价.toFixed(2) }}</div>
                    <div class="flex column" style="width: 30%">
                      <div style="height: 50%;line-height: 30px;">{{ shangzheng_index.涨跌额 }}</div>
                      <div style="height: 50%;line-height: 30px;">{{ shangzheng_index.涨跌幅.toFixed(2) }}%</div>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </div>

          <div class="flex:1" />

          <!-- 股票k线图弹框 -->
          <div id="candlestick" style="display: none;width: 1050px; height:650px">
            <div v-if="stock_info != null" style="width: 1050px; height:30px">
              <p class="stock-info-annotation">公司亮点：{{ stock_info.lightspot }}</p>
              <p class="stock-info-annotation">主营业务：{{ stock_info.major }}</p>
            </div>
            <div id="candlestickMain" style="width: 1050px; height:620px" />
          </div>
        </div>
      </div>

      <div style="height:30px;padding-top: 50px;">
        <!-- 概念选框 -->
        <span>
          <el-select
            v-model="search_concepts"
            clearable
            placeholder="概念"
            multiple
            collapse-tags
            filterable
            size="mini"
          >
            <el-option
              v-for="item in allconcepts"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </span>
        <!-- 选股按钮 -->
        <span style="margin-left:8px">
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="searchConcepts"
          >选股</el-button>
        </span>
        <!-- 概念贴合开关 -->
        <el-switch
          v-model="isMatch"
          style="margin-left:20px"
          inactive-text="贴合概念"
        />
      </div>
      <!-- 概念列表 -->
      <div style="height:420px;">
        <el-table
          v-loading="concept_loading"
          :data="conceptstretagytableData"
          :row-class-name="conceptTableRowClassName"
          :default-sort="{prop: 'concept_num', order: 'descending'}"
          height="400"
          style="width: 100%"
          @row-click="lookCandlestick"
        >
          <el-table-column
            prop="Name"
            label="股票名称"
            width="85"
          />
          <el-table-column
            prop="Latest"
            label="最新价"
            width="70"
          />
          <el-table-column
            prop="Currency_value"
            label="流通盘"
            :formatter="valueSuffix"
            width="80"
          />
          <el-table-column
            prop="Change_percent"
            label="涨跌幅"
            :formatter="upDownStyle"
            width="70"
          />
          <el-table-column
            prop="All_rank"
            label="市场排名"
            sortable
            width="100"
          />
          <el-table-column
            prop="Ind_rank"
            label="行业排名"
            sortable
            width="100"
          />
          <el-table-column
            prop="Concept"
            label="概念叠加"
            width="150"
          />
          <el-table-column
            prop="Related_concept"
            label="贴合概念"
            width="280"
          />
          <el-table-column
            fixed="right"
            label="操作"
            width="60"
          >
            <template slot-scope="scope">
              <el-popover
                placement="left"
                width="160"
              >
                <el-form ref="buyForm" :model="buyForm" size="small">
                  <el-form-item label="价格:">
                    <el-col :span="2"><el-button>-</el-button></el-col>
                    <el-col :span="6">
                      <el-input v-model="buyForm.price" placeholder="scope.row.Latest" />
                    </el-col>
                    <el-col :span="2"><el-button>+</el-button></el-col>
                  </el-form-item>
                  <el-form-item label="数量:">
                    <el-col :span="2"><el-button>-</el-button></el-col>
                    <el-col :span="6">
                      <el-input v-model="buyForm.mount" placeholder="100" />
                    </el-col>
                    <el-col :span="2"><el-button>+</el-button></el-col>
                  </el-form-item>
                  <el-form-item size="mini">
                    <el-button>取消</el-button>
                    <el-button type="primary" @click="buySubmit(scope.row)">确定</el-button>
                  </el-form-item>
                </el-form>
                <el-button
                  slot="reference"
                  type="text"
                  size="small"
                  @click.stop
                >买入</el-button>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
        <el-dialog
          title="收货地址"
          :visible.sync="dialogBuyFormVisible"
          width="100px"
        >
          <el-form :model="buyForm">
            <el-form-item label="活动名称" label-width="50px">
              <el-input v-model="buyForm.name" autocomplete="off" />
            </el-form-item>
            <el-form-item label="活动区域" label-width="80px">
              <el-select v-model="buyForm.price" placeholder="请选择活动区域">
                <el-option label="区域一" value="shanghai" />
                <el-option label="区域二" value="beijing" />
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogBuyFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="dialogBuyFormVisible = false">确 定</el-button>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
var candlestickChart // 全局变量

export default {
  data() {
    return {
      industryRankChart: null,
      limitupStatisticChart: null,
      limituptableData: [],
      limitupIndustryTableData: [],
      conceptstretagytableData: [],
      sharpfallstretagytableData: [],
      allsecurities: [],
      allconcepts: [],
      industryStretagyData: [],
      search_stock: '',
      limituptable_search: '',
      search_concepts: null,
      concept_loading: false,
      sharpfall_loading: false,
      todayLimitupNum: 0,
      yesterdayLimitupNum: 0,
      shangzheng_index: null,
      timer1: null,
      stock_info: null,
      dialogBuyFormVisible: false,
      showIndustryDetail: false,
      isMatch: true,
      buyForm: {
        name: '',
        price: 0,
        mount: 0
      }
    }
  },
  computed: {
    indexColor() {
      return (value) => {
        if (value < 0) {
          return { 'color': 'green' }
        } else {
          return { 'color': 'red' }
        }
      }
    }
  },
  beforeDestroy() {
    // window.clearInterval(this.timer);
    clearTimeout(this.timer1)
  },
  // created钩子里的data变量不用v-if判断,因为是在dom之前初始化的
  created() {
    this.fullData()
    // this.shangzIndex();
  },
  mounted() {
    this.initConceptRankChart()
    this.initIndustryRankChart()
    this.setIndustryRankChart()
    this.initLimitupStatisticChart()
    this.setLimitupStatisticChart()
    this.loadAllSecurities()
    this.updateLimituptableData()

    this.shangzIndex() // 上证指数
    this.setIndustryRankChart() // 涨停行业排行
    this.setLimitupStatisticChart()// 涨停强度分析
    this.updateLimituptableData() // 涨停池详情
  },
  methods: {
    fullData() {
      // this.axios.get('/tangying/api/v1/data/limitup_stocks/').then( res => {
      //     this.limituptableData = res.data
      // });
      this.axios.get('/tangying/api/v1/data/pre_limitup_count/').then(res => {
        this.yesterdayLimitupNum = res.data
      })
    },
    updateLimituptableData() {
      this.axios.get('/tangying/api/v1/data/limitup_stocks/').then(res => {
        this.limituptableData.length = 0
        this.limituptableData = res.data
      })
    },
    shangzIndex() {
      this.axios.get('/tangying/api/v1/data/sz_index/').then(res => {
        // console.log('ret:',res.data[0])
        this.shangzheng_index = res.data[0]
      })
    },
    stockQuerySearch(queryString, cb) {
      var securities = this.allsecurities
      var results = queryString ? securities.filter(this.createFilter(queryString)) : securities
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter(queryString) {
      return (obj) => {
        return (obj.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    loadAllSecurities() {
      this.axios.get('/tangying/api/v1/data/all_securities/').then(res => {
        // all_securities = res.data;
        this.allsecurities = res.data
      })
      this.axios.get('/tangying/api/v1/data/all_concepts/').then(res => {
        this.allconcepts = res.data
      })
    },
    lookCandlestick(row) {
      const item = { code: row.Code, value: row.Name, latest: row.Latest }
      this.stockSelect(item)
    },
    upDownStyle(column) {
      // console.log(column.Change_percent,typeof(column.Change_percent));
      const per = column.Change_percent
      if (per < 0) {
        return <span style='color: green'>{per}%</span>
      } else {
        return <span style='color: red'>{per}%</span>
      }
    },
    valueSuffix(column) {
      return <span>{column.Currency_value}亿</span>
    },
    buySubmit(row) {
      console.log(this.buyForm, row.Code)
      // let item = {code: row.Code,name: row.Name,latest: row.Latest};
    },
    conceptTableRowClassName({ row, rowIndex }) {
      if (row.All_rank < 100 && row.Ind_rank < 10) {
        return 'good-row'
      }
      return ''
    },
    // 股票k线图弹框
    async stockSelect(item) {
      // console.log('select:',item.value);
      let head
      let res

      if (!item.hasOwnProperty('latest')) {
        res = await this.axios.get('/tangying/api/v1/data/latest_price/' + item.code + '/')
        item['latest'] = res.data[0].收盘
      }
      // 获取股票详情
      // axios实现同步请求
      res = await this.axios.get('/tangying/api/v1/data/stock_info/' + item.code + '/')
      const stock_info = res.data
      this.stock_info = stock_info
      this.$nextTick(() => { // Can't get dom width or height报错解决方法
        this.setCandlestickChart(item.code)
      })
      // let rank_cha = stock_info.rankChange;
      // let change = rank_cha>0?'<i class="el-icon-top" style="font-size:smaller;color:red">'+rank_cha+'</i>':'<i class="el-icon-bottom" style="font-size:smaller;color:green">'+Math.abs(rank_cha)+'</i>';
      head = [
        '<span style="font-size:larger;margin-right:10px;">' + item.value + '</span>',
        '<span style="font-family:Fantasy;font-size:larger;margin-right:15px;">' + item.latest + '</span>',
        '<span style="font-size:smaller;margin-right:5px;">市场排名：' + stock_info.all_rank + '</span>',
        '<span style="font-size:smaller;margin-right:15px;">行业排名：' + stock_info.industry_rank + '</span>',
        '<span style="font-size:smaller;margin-right:15px;">行业：' + stock_info.industry + '</span>'
        // '<p style="font-size:smaller;">公司亮点：'+stock_info.lightspot+'</p>',
        // '<p style="font-size:smaller;">主营业务：'+stock_info.major+'</p>',
        // change
      ].join('')
    },
    searchConcepts() {
      // console.log('get concept:',this.search_concepts);
      let concepts = this.search_concepts
      let is_match = 1
      this.concept_loading = true
      // this.$set(this.loading,'concept',true)
      if (concepts.length != 0) {
        concepts = concepts.join(',')
        if (this.isMatch != true) {
          is_match = 0
        }
        this.axios.get('/tangying/api/v1/data/concept_strategy/' + concepts + '/' + is_match + '/').then(res => {
          this.conceptstretagytableData = res.data
          // this.$set(this.loading,'concept',false)
          this.concept_loading = false
        })
      }
    },
    searchSharpfall() {
      this.sharpfall_loading = true
      this.axios.get('/tangying/api/v1/data/sharpfall_strategy/').then(res => {
        this.sharpfallstretagytableData = res.data
        this.sharpfall_loading = false
      })
    },
    formatterDate(date) {
      if (!date) {
        return ''
      }
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      if (month < 10) {
        month = '0' + month
      }
      if (day < 10) {
        day = '0' + day
      }
      var nowDate = year + '-' + month + '-' + day
      return nowDate
    },
    initConceptRankChart() {
      var chartDom = document.getElementById('concept-rank')
      var ConceptChart = echarts.init(chartDom)
      var option

      const updateFrequency = 5000
      const dimension = 1 // 哪一列作为横轴维度

      this.axios.get('/tangying/api/v1/data/concept_statistic/').then(res => {
        const data = res.data
        const dates = []
        for (let i = 0; i < data.length; ++i) { // 抽取data中所有第3column的数据
          if (dates.length === 0 || dates[dates.length - 1] !== data[i][3]) { // 去重
            dates.push(data[i][3])
          }
        }
        const date_set = [...new Set(dates)]
        // console.log('dates:',date_set)
        const startIndex = 1 // 保证data中的3号column有1个不同的值
        const startDate = date_set[startIndex]
        option = {
          grid: {
            top: 10,
            bottom: 5,
            left: 80,
            right: 20
          },
          xAxis: {
            max: 'dataMax',
            show: false,
            axisLabel: {
              formatter: function(n) { // n为类目值
                return Math.round(n) + ''
              }
            }
          },
          // 将字段date为startDate的data数据过滤出来
          dataset: { // 通过date的变化来收集某1个year的所有数据
            source: data.slice(1).filter(function(d) { // slice(1)从索引为1的地方开始抽取数据，如果end被省略，则slice会一直提取到原数组末尾
              return d[3] === startDate
            })
          },
          yAxis: {
            type: 'category',
            inverse: true,
            max: 9,
            axisLabel: {
              show: true,
              fontSize: 12,
              fontFamily: 'Microsoft YaHei',
              formatter: '{value}',
              rich: {
                flag: {
                  fontSize: 25,
                  padding: 5
                }
              }
            },
            animationDuration: 500,
            animationDurationUpdate: 500 // 数据更新动画的时长。
          },
          series: [
            {
              realtimeSort: true,
              seriesLayoutBy: 'column', // 调整维度的方向 此处表示1列为1个维度（默认）
              type: 'bar',
              itemStyle: { // 图形样式
                // color: function (param) { //柱条颜色
                //   return countryColors[param.value[3]] || '#5470c6'; //根据国家选颜色
                // }
                color: '#5470c6'
              },
              encode: { // 表示哪个维度映射到哪 数据集中1列表示1个维度
                x: dimension,
                y: 0
              },
              z: 1,
              zlevel: 1,
              label: {
                show: true,
                precision: 1,
                position: 'right',
                valueAnimation: true,
                fontFamily: 'monospace'
              }
            }
          ],
          // Disable init animation.
          animationDuration: 0,
          animationDurationUpdate: updateFrequency,
          animationEasing: 'linear', // 初始动画的缓动效果
          animationEasingUpdate: 'linear', // 数据更新动画的缓动效果
          graphic: {
            elements: [
              {
                type: 'text',
                right: 16,
                bottom: 5,
                style: { // z轴样式
                  text: startDate, // z轴文本
                  font: 'bolder 20px monospace',
                  fill: 'rgba(100, 100, 100, 0.75)'
                },
                z: 100
              }
            ]
          }
        }
        // console.log(option);
        ConceptChart.setOption(option)
        for (let i = startIndex; i < date_set.length - 1; ++i) {
          (function(i) {
            setTimeout(function() {
              updateDate(date_set[i + 1])
            }, (i - startIndex) * updateFrequency)
          })(i)
        }
        function updateDate(date) {
          const source = data.slice(1).filter(function(d) {
            return d[3] === date
          })
          option.series[0].data = source
          option.graphic.elements[0].style.text = date
          ConceptChart.setOption(option)
        }
      })
    },
    initIndustryRankChart() {
      const industryDom = document.getElementById('industry-rank')
      this.industryRankChart = echarts.init(industryDom)
    },
    setIndustryRankChart() {
      function splitData(rawData) {
        let categoryData = []
        let values = []
        let count = 0
        const predictIndustry = []
        // for (let k in rawData) {
        //     console.log(k,rawData[k].length);
        //     categoryData.push(k);
        //     values.push({'value':rawData[k].length,'stocks':rawData[k]});
        // }
        categoryData = Object.keys(rawData).sort(function(pre, next) { return rawData[pre].length - rawData[next].length }) // 升序
        categoryData.forEach((item) => {
          const num = rawData[item].length
          values.push({ 'value': num, 'stocks': rawData[item] })
          const stocks = rawData[item].filter(function(value) {
            return value['连板数'] == 2 || value['首次封板时间'] == '09:25'
          })
          if (stocks.length > 0) {
            const names = []
            stocks.forEach((item) => {
              names.push(item.名称)
            })
            predictIndustry.push({ 'Industry': item, 'Stocks': names.join(' ') })
          }
          count += num
        })
        const industry_count = categoryData.length
        if (industry_count > 20) {
          categoryData = categoryData.slice(industry_count - 20)
          values = values.slice(industry_count - 20)
        }
        return {
          categoryData: categoryData,
          values: values,
          count: count,
          predictIndustry: predictIndustry
        }
      }
      var option
      var data
      var _this = this

      this.axios.get('/tangying/api/v1/data/limitup_industry/').then(res => {
        // console.log('res.data:',res.data);
        data = splitData(res.data)
        _this.todayLimitupNum = data.count
        _this.industryStretagyData.length = 0// 清空原来数组数据
        // document.getElementById("predict").innerHTML="";
        _this.industryStretagyData = data.predictIndustry
        option = {
          tooltip: {
            trigger: 'axis',
            // enterable: 'true',
            formatter: function(params) {
              // console.log('params:',params);
              _this.limitupIndustryTableData = params[0].data['stocks']
              _this.showIndustryDetail = true
              return _this.$refs.industryTable
            },
            // textStyle: {
            //     fontSize: 7
            // },
            position: function(point) {
              // 固定在顶部
              return [point[0], '10%']
            },
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {},
          // grid: {
          //     left: '3%',
          //     right: '4%',
          //     bottom: '3%',
          //     containLabel: true
          // },
          grid: {
            top: 10,
            bottom: 5,
            left: 70,
            right: 20
          },
          xAxis: {
            type: 'value',
            show: false,
            boundaryGap: [0, 0.01]
          },
          yAxis: {
            type: 'category',
            axisLabel: {
              interval: 0
            },
            data: data.categoryData
          },
          series: [
            {
              type: 'bar',
              barMaxWidth: 15,
              label: {
                show: true,
                position: 'right'
              },
              data: data.values
            }
          ]
        }
        this.industryRankChart.setOption(option)
      }).catch(function(error) {
        console.log('error:', error)
      })
    },
    initLimitupStatisticChart() {
      const chartDom = document.getElementById('limitupStatistic')
      this.limitupStatisticChart = echarts.init(chartDom)
    },
    setLimitupStatisticChart() {
      var option
      var data_set = []

      this.axios.get('/tangying/api/v1/data/limitup_statistic/').then(res => {
        const data = res.data
        const dates = []
        for (let i = 1; i < data.length; ++i) { // 抽取data中所有下标为2的数据
          dates.push(data[i][2])
        }
        const date_set = [...new Set(dates)]
        // console.log('dates:',date_set);
        if (date_set.length == 0) {
          return
        }
        // 格式化数据集 [日期 首板数 2天2板数 3天3板数 首板票 2天2板票 3天3板票 1进2淘汰票 2进3淘汰票 1进2成功率 2进3成功率]
        for (let i = 0; i < date_set.length; ++i) {
          let filter_stocks

          filter_stocks = data.slice(1).filter(function(d) { return d[2] === date_set[i] && d[0] == '首板' })
          const stocks_1 = filter_stocks.length > 0 ? filter_stocks[0][1].split(',') : []
          filter_stocks = data.slice(1).filter(function(d) { return d[2] === date_set[i] && d[0] == '2天2板' })
          const stocks_2 = filter_stocks.length > 0 ? filter_stocks[0][1].split(',') : []
          filter_stocks = data.slice(1).filter(function(d) { return d[2] === date_set[i] && d[0] == '3天3板' })
          const stocks_3 = filter_stocks.length > 0 ? filter_stocks[0][1].split(',') : []
          data_set.push([
            date_set[i],
            stocks_1.length,
            stocks_2.length,
            stocks_3.length,
            stocks_1,
            stocks_2,
            stocks_3
          ])
        }
        // 筛选淘汰票
        data_set[0].push([], [])
        for (let i = 1; i < data_set.length; ++i) {
          data_set[i].push(data_set[i - 1][4].filter(item => { return !data_set[i][5].includes(item) }))
          data_set[i].push(data_set[i - 1][5].filter(item => { return !data_set[i][6].includes(item) }))
        }
        // 计算成功率
        data_set[0].push(NaN, NaN)
        for (let i = 1; i < data_set.length; ++i) {
          data_set[i].push((data_set[i][2] / data_set[i - 1][1] * 100).toFixed(1))
          data_set[i].push((data_set[i][3] / data_set[i - 1][2] * 100).toFixed(1))
        }
        // console.log('data_set:',data_set)

        // function splitArray(arr, len){
        //     let index = 0;
        //     let new_arr = [];
        //     while(index < arr.length){
        //         new_arr.push(arr.slice(index, index+=len));
        //     }
        //     return new_arr;
        // };
        option = {
          dataset: {
            source: data_set
          },
          tooltip: {
            trigger: 'axis',
            enterable: 'true', // 鼠标可移入提示框
            position: function(point, params, dom, rect, size) {
              // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
              var obj = { top: 20 }
              obj[['left', 'right'][+(point[0] < size.viewSize[0] / 2)]] = 15
              return obj
            },
            formatter: function(params) { // series.encode.tooltip无法实现显示股票名称
              // console.log('params:',params);
              const data_1_2 = params[0]
              const data_2_3 = params[1]
              return data_1_2.marker + data_1_2.seriesName + '&nbsp&nbsp&nbsp&nbsp 成功率：' + data_1_2.value[9] + '%<br/><span class="font-bold">晋级' + data_1_2.value[2] + '支：</span>' + data_1_2.value[5].join(' ') + '<br/><span class="font-bold">淘汰' + data_1_2.value[7].length + '支：</span>' + data_1_2.value[7].join(' ') + '<br/><br/>' + data_2_3.marker + data_2_3.seriesName + '&nbsp&nbsp&nbsp&nbsp 成功率:' + data_2_3.value[10] + '%<br/><span class="font-bold">晋级' + data_2_3.value[3] + '支：</span>' + data_2_3.value[6].join(' ') + '<br/><span class="font-bold">淘汰' + data_2_3.value[8].length + '支：</span>' + data_2_3.value[8].join(' ') + '<br/>'
            },
            textStyle: {
              fontSize: 10
            },
            extraCssText: 'max-width:380px; white-space:pre-wrap',
            axisPointer: {
              type: 'cross',
              crossStyle: {
                color: '#999'
              }
            }
          },
          toolbox: {
            feature: {
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ['line', 'bar'] },
              restore: { show: true },
              saveAsImage: { show: true }
            }
          },
          legend: { // 图例的数据数组。数组项通常为一个字符串，每一项代表一个系列的 name
            data: ['1进2', '2进3', '1进2成功率', '2进3成功率']
            // data: ['日期', '首板', '1进2', '2进3', '1进2成功率', '2进3成功率']
          },
          xAxis: [
            {
              type: 'category',
              // data: date_set,
              axisPointer: {
                type: 'shadow'
              },
              axisLabel: {
                rotate: -45 // 刻度标签倾斜
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
              yAxisIndex: 1,
              encode: {
                x: 0,
                y: 9,
                tooltip: 9
              }
            },
            {
              name: '2进3成功率',
              type: 'line',
              yAxisIndex: 1,
              encode: {
                x: 0,
                y: 10,
                tooltip: 10
              }
            }
          ]
        }
        this.limitupStatisticChart.setOption(option)
      })
    },
    setCandlestickChart(stock_code) {
      var chartDom = document.getElementById('candlestickMain')

      if (candlestickChart == null || candlestickChart == '') {
        candlestickChart = echarts.init(chartDom)
      } else {
        candlestickChart.clear()
      }
      var option
      const upColor = '#00da3c'
      const downColor = '#ec0000'
      // 分离数据,衍生新数据
      function splitData(rawData) {
        // console.log("type:",typeof(rawData))
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
      var data
      this.axios.get('/tangying/api/v1/data/candlestick/' + stock_code + '/').then(res => {
        data = splitData(res.data)

        option = {
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
              left: '5%',
              right: '5%',
              height: '50%'
            },
            {
              left: '5%',
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
        }
        candlestickChart.setOption(option)
      })
    }
  }
}
</script>

<style lang="less">
    // * {
    //     border: 1px solid black;
    // }
   .left-charts {
        width: 820px;
        height: 100%;
        background-color: white;
    }
   .right-charts {
        width: 1000px;
        padding-left: 50px;
        height: 100%;
        background-color: white;
    }

    .flex {
        display: flex;
        /* flex-direction: row; */
    }

    .column {
        flex-direction: column;
    }

    .column-rev {
      flex-direction: column-reverse;
    }

    .row-rev {
      flex-direction: row-reverse;
    }

    .flex-row-half {
        width: 50%;
    }

    .flex-center {
        justify-content: center;
    }

    .text-center {
        text-align: center;
    }

    .font-bold {
        font-weight: bold
    }

    .el-table__body-wrapper::-webkit-scrollbar {
	    width: 0;
    }

    .limitup-num-font {
        font-family: "Fira Mono";
        font-size: 30px;
        line-height: 65px;
        // font-weight: bold;
    }

    .shangzheng-index-font {
        font-family: "Fantasy ";
        font-size: 30px;
    }

    .el-table .good-row {
        background: rgba(251, 3, 3, 0.1);
    }

    .stock-info-annotation {
        margin-left: 20px;
        margin-top: 5px;
    }

    .industry-tooltip {
        width: 380px;
    }
</style>
