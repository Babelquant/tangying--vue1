<template>
  <div>
    <el-table
      v-if="list"
      :data="list.filter(d => !high_days_search || d.high_days.toLowerCase().includes(high_days_search.toLowerCase()))"
      height="300"
      style="width: 100%"
      :tooltip-options="tooltipOptions"
      :row-class-name="tableRowClassName"
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
      <el-table-column :label="$t('table.limit_up_type')" width="90px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.limit_up_type }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.high_days')" width="100px" align="left">
        <template slot="header" slot-scope="scope">
          <el-input
            v-model="high_days_search"
            size="mini"
            placeholder="几天几板"
          />
        </template>
        <template slot-scope="{row}">
          <span>{{ row.high_days }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="order_amount" :label="$t('table.order_amount')" sortable width="90px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.order_amount>Math.pow(10,8)?(row.order_amount/Math.pow(10,8)).toFixed(1)+'亿':(row.order_amount/10000).toFixed(0)+'万' }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column :label="$t('table.is_again_limit')" width="100px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.is_again_limit }}</span>
        </template>
      </el-table-column> -->
      <el-table-column prop="first_limit_up_time" :label="$t('table.first_limit_up_time')" sortable width="100px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.first_limit_up_time | parseTime('{h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.last_limit_up_time')" width="90px" align="left">
        <template slot-scope="{row}">
          <span>{{ row.last_limit_up_time | parseTime('{h}:{i}:{s}') }}</span>
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
      <el-table-column :label="$t('table.reason_type')" align="left">
        <template slot-scope="{row}">
          <span>{{ row.reason_type }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialogCdstVisible" :title="stockName" width="60%">
      <candlestick-chart :code="code" />
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import CandlestickChart from './CandlestickChart'

import { fetchLimitUpList, fetchStockHistoryRank } from '@/api/stock'
import { parseTime } from '@/utils'

export default {
  components: {
    CandlestickChart
  },
  props: {
    limit_up_date: {
      type: Date
    }
  },
  data() {
    return {
      list: null,
      chart: null,
      high_days_search: '',
      code: '',
      stockName: '',
      popLoading: false,
      dialogCdstVisible: false,
      tooltipOptions: {
        effect: 'dark',
        placement: 'top-end'
        // enterable: true,
        // offset: {
        //   x: 100,
        //   y: 10
        // }
      }
    }
  },
  watch: {
    limit_up_date: {
      handler(val) {
        fetchLimitUpList({ date: parseTime(val, '{y}-{m}-{d}') }).then(response => {
          this.list = response.data
          const data = this.processLimitUpData(this.list)
          this.$emit('handleSetLimitUpData', data)
        })
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      fetchLimitUpList({ date: parseTime(this.limit_up_date, '{y}-{m}-{d}') }).then(response => {
        this.list = response.data
        const data = this.processLimitUpData(this.list)
        this.$emit('handleSetLimitUpData', data)
      })
    },
    processLimitUpData(arr) {
      const concept_data = arr.map(item => item.reason_type).join('+').split('+')
      const total_count = arr.reduce((acc, obj) => {
        if (obj.is_open === 0) {
          return acc + 1
        } else {
          return acc
        }
      }, 0)
      const first_count = arr.reduce((acc, obj) => {
        if (obj.is_open === 0 && obj.high_days === '首板') {
          return acc + 1
        } else {
          return acc
        }
      }, 0)
      const two_count = arr.reduce((acc, obj) => {
        if (obj.is_open === 0 && obj.high_days === '2天2板') {
          return acc + 1
        } else {
          return acc
        }
      }, 0)
      const three_count = arr.reduce((acc, obj) => {
        if (obj.is_open === 0 && obj.high_days === '3天3板') {
          return acc + 1
        } else {
          return acc
        }
      }, 0)
      return {
        conceptData: concept_data,
        totalCount: total_count,
        firstCount: first_count,
        twoCount: two_count,
        threeCount: three_count
      }
    },
    handleNameClick(row) {
      this.stockName = row.name
      this.dialogCdstVisible = true
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
    },
    tableRowClassName({row}) {
      if (row.is_open === 1) {
        return 'warning-row'
      }
      return ''
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
</style>
