<template>
    <div>
      <el-table
        :data="list"
        height="600"
        style="width: 100%"
      >
        <el-table-column :label="$t('table.stockName')" width="90px" align="left">
          <template slot-scope="{row}">
            <span @click="handleNameClick(row)">{{ row.name }}</span>
            <!-- <el-tag v-if="row.is_again_limit" size="small">回封</el-tag> -->
          </template>
        </el-table-column>
        <el-table-column prop="latest" :label="$t('table.latest')" sortable width="88px" align="left">
          <template slot-scope="{row}">
            <span>{{ row.latest }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="currency_value" :label="$t('table.currency_value')" sortable width="100px" align="left">
          <template slot-scope="{row}">
            <span>{{ (row.currency_value/Math.pow(10,8)).toFixed(0) }}亿</span>
          </template>
        </el-table-column>
        <el-table-column prop="increase" :label="$t('table.increase')" width="80px" align="left">
          <template slot-scope="{row}">
            <span :style="{'color':row.increase>0?'red':'green'}">{{ row.increase }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="rank" :label="$t('table.rank')" sortable width="100px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.rank }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rank_change" :label="$t('table.rank_change')" sortable width="100px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.rank_change }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sixty_days_increase" :label="$t('table.sixty_days_increase')" sortable width="108px" align="left">
          <template slot-scope="{row}">
            <span :style="{'color':row.sixty_days_increase>0?'red':'green'}">{{ row.sixty_days_increase }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="year_increase" :label="$t('table.year_increase')" sortable width="90px" align="left">
          <template slot-scope="{row}">
            <span :style="{'color':row.year_increase>0?'red':'green'}">{{ (row.year_increase).toFixed(0) }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="排名" width="50px" align="center">
          <template slot-scope="{row}">
            <el-popover placement="top-start" width="500" trigger="click" @show="handlePopShow(row.code)" @hide="handlePopHide">
              <div :ref="row.code" v-loading="popLoading" style="width: 480px;height: 300px" />
              <el-button slot="reference" type="text" icon="el-icon-s-data" />
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog :visible.sync="dialogCdstVisible" width="60%">
        <template slot="title">
          <span>{{ stockName }}</span>
          <span class="candlestick-title">{{ zyyw }}</span>
        </template>
        <candlestick-chart :code="code" />
      </el-dialog>
    </div>
  </template>
  
  <script>
  import * as echarts from 'echarts'
  import CandlestickChart from '@/views/dashboard/admin/components/CandlestickChart'
  
  import { fetchStockHistoryRank, fetchStockZy } from '@/api/stock'
  
  export default {
    components: {
      CandlestickChart
    },
    props: {
      list: {
        type: Array
      }
    },
    data() {
      return {
        chart: null,
        timer: null,
        code: '',
        stockName: '',
        zyyw: '',
        popLoading: false,
        dialogCdstVisible: false,
        tooltipOptions: {
          effect: 'dark',
          placement: 'top-end'
        }
      }
    },
    methods: {
      handleNameClick(row) {
        this.stockName = row.name
        fetchStockZy({code: row.code}).then(res => {
          this.zyyw = res.data
          this.dialogCdstVisible = true
        })
        this.$set(this, 'code', row.code)
      },
      handlePopShow(code) {
        this.$nextTick(() => {
          this.chart = echarts.init(this.$refs[code])
        })
        this.popLoading = true
        fetchStockHistoryRank({ code: code }).then(res => {
          this.chart.setOption({
            tooltip: {
              trigger: 'axis'
            },
            grid: {
              left: '2px',
              top: '5%',
              right: '2px',
              bottom: '2px',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: res.data['date']
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                type: 'line',
                step: 'start',
                data: res.data['rank']
              }
            ]
          })
          this.popLoading = false
        })
      },
      handlePopHide() {
        if (!this.chart) {
          return
        }
        this.chart.dispose()
        this.chart = null
      }
    }
  }
  </script>
  <style>
    .tooltip-container {
      width: 300px;
    }
    .el-table .warning-row {
      background: #67C23A;
    }
    .candlestick-title {
      margin-left: 20px;
      font-size: 5px;
    }
  </style>
  