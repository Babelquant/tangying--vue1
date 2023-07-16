<template>
  <keep-alive>
    <div>
      <el-select
        v-model="search_concepts"
        clearable
        placeholder="概念"
        multiple
        collapse-tags
        filterable
        size="mini"
        style="width: 280px;margin-bottom: 8px;"
      >
        <el-option
          v-for="item in allconcepts"
          :key="item.code"
          :label="item.name"
          :value="item.code"
        />
      </el-select>
      <el-button size="mini" type="primary" icon="el-icon-search" @click="fetchData">
        {{ $t('table.search') }}
      </el-button>

      <el-table
        v-loading="conceptLoading"
        :data="list"
        height="400"
        style="width: 100%"
      >
        <el-table-column :label="$t('table.stockName')" width="80px" align="left">
          <template slot-scope="{row}">
            <span @click="handleNameClick(row)">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.latest')" width="75px" align="left">
          <template slot-scope="{row}">
            <span>{{ row.latest }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="increase" :label="$t('table.increase')" width="75px" align="left">
          <template slot-scope="{row}">
            <span :style="{'color':row.increase>0?'red':'green'}">{{ row.increase }}%</span>
          </template>
        </el-table-column>
        <el-table-column prop="currency_value" :label="$t('table.currency_value')" sortable width="100px" align="left">
          <template slot-scope="{row}">
            <span>{{ row.currency_value }}</span>
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
        <el-table-column prop="rank" :label="$t('table.rank')" sortable width="100px" align="left">
          <template slot-scope="{row}">
            <span>{{ row.rank }}</span>
            <el-popover placement="top-start" width="500" trigger="click" @show="handlePopShow(row.code)" @hide="handlePopHide">
              <div :ref="row.code" v-loading="popLoading" style="width: 480px;height: 300px" />
              <div slot="reference">
                <el-tag size="mini">{{ row.rank_change }}</el-tag>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.zyyw')" show-overflow-tooltip width="100px" align="left">
          <template slot-scope="{row}">
            <span>{{ row.zyyw }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.jyfw')" show-overflow-tooltip width="100px" align="left">
          <template slot-scope="{row}">
            <span>{{ row.jyfw }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :visible.sync="dialogCdstVisible" :title="stockName" width="60%">
        <candlestick-chart :code="code" />
      </el-dialog>
    </div>
  </keep-alive>
</template>

<script>
import echarts from 'echarts'
import CandlestickChart from '@/views/dashboard/admin/components/CandlestickChart'
import { fetchConceptList, fetchConceptStockList, fetchStockHistoryRank } from '@/api/stock'

export default {
  components: {
    CandlestickChart
  },
  data() {
    return {
      popLoading: false,
      conceptLoading: false,
      dialogCdstVisible: false,
      stockName: '',
      code: '',
      allconcepts: [],
      search_concepts: null,
      list: null,
      chart: null
    }
  },
  mounted() {
    this.loadAllConcepts()
  },
  methods: {
    fetchData() {
      this.conceptLoading = true
      fetchConceptStockList({ codes: this.search_concepts.join(',') })
        .then(res => {
          this.list = res.data
          this.conceptLoading = false
        })
    },
    loadAllConcepts() {
      fetchConceptList().then(res => {
        this.allconcepts = res.data
      })
    },
    handlePopShow(code) {
      this.chart = echarts.init(this.$refs[code])
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
    handleNameClick(row) {
      this.stockName = row.name
      this.dialogCdstVisible = true
      this.$set(this, 'code', row.code)
    },
  }
}
</script>
<style lang="scss" scoped>
  .el-tooltip__popper {
    width: 200px;
    height: 100px;
  }
</style>
