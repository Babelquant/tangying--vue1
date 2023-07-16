<template>
  <keep-alive>
    <div class="dashboard-editor-container">
      <!-- <panel-group @handleSetLineChartData="handleSetLineChartData" />

      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <line-chart :chart-data="lineChartData" />
      </el-row> -->
      <el-button type="primary" size="mini" icon="el-icon-arrow-left" @click="changeLimupDate(-1)">前一天</el-button>
      <el-date-picker
        v-model="limit_up_date"
        type="date"
        size="small"
        placeholder="选择涨停时间"
        style="margin-bottom: 8px;"
      />
      <el-button type="primary" size="mini" icon="el-icon-arrow-right" @click="changeLimupDate(1)">后一天</el-button>
      <el-row :gutter="2">
        <el-col :xs="24" :sm="24" :lg="18">
          <div class="chart-wrapper">
            <limitup-stock-table :limit_up_date="limit_up_date" @handleSetConceptRankChartData="handleSetConceptRankChartData" />
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :lg="6">
          <div class="chart-wrapper">
            <concept-rank-chart :chart-data="conceptRankChartData" />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="2">
        <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 14}" :lg="{span: 18}" :xl="{span: 18}" style="padding-right:8px;margin-bottom:30px;">
          <!-- <concept-table /> -->
          <limitup-yeastoday-table :table_data="limitup" />
        </el-col>
        <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 10}" :lg="{span: 6}" :xl="{span: 6}" style="margin-bottom:30px;">
          <continue-board-chart />
        </el-col>
      </el-row>
      <p>1进2</p>
      <el-row :gutter="2">
        <el-col :xs="24" :sm="24" :lg="20">
          <div class="chart-wrapper">
            <limitup-analize-table :table_data="limitup2" />
          </div>
        </el-col>
      </el-row>
      <p>2进3</p>
      <el-row :gutter="2">
        <el-col :xs="24" :sm="24" :lg="20">
          <div class="chart-wrapper">
            <limitup-analize-table :table_data="limitup3" :height="300" />
          </div>
        </el-col>
      </el-row>
    </div>
  </keep-alive>
</template>

<script>
import LimitupStockTable from './components/LimitupStockTable'
import ConceptRankChart from './components/ConceptRankChart'
import ContinueBoardChart from './components/ContinueBoardChart'
import LimitupAnalizeTable from './components/LimitupAnalizeTable.vue'
import LimitupYeastodayTable from './components/LimitupYeastodayTable.vue'
import { fetchLimitupTwoList } from '@/api/stock'
import { parseTime } from '@/utils'

export default {
  name: 'DashboardAdmin',
  components: {
    LimitupStockTable,
    LimitupAnalizeTable,
    LimitupYeastodayTable,
    ConceptRankChart,
    ContinueBoardChart
  },
  data() {
    return {
      limitup: [],
      limitup2: [],
      limitup3: [],
      conceptRankChartData: [],
      limit_up_date: new Date()
    }
  },
  watch: {
    limit_up_date: {
      handler(val) {
        fetchLimitupTwoList({ date: parseTime(val, '{y}-{m}-{d}') }).then(response => {
          this.limitup = response.data.yeastoday_data
          this.limitup2 = response.data.today_data2
          this.limitup3 = response.data.today_data3
        })
      }
    }
  },
  created() {
    fetchLimitupTwoList({ date: parseTime(this.limit_up_date, '{y}-{m}-{d}') }).then(response => {
      this.limitup = response.data.yeastoday_data
      this.limitup2 = response.data.today_data2
      this.limitup3 = response.data.today_data3
    })
  },
  methods: {
    handleSetConceptRankChartData(data) {
      this.conceptRankChartData = data
    },
    changeLimupDate(day) {
      // 这种直接修改对象属性的方式，并不会触发 Vue 的响应式更新机制，因此limitup-stock-table组件无法感知到limit_up_date的变化,
      // 可以使用 Vue 提供的this.$set()方法来更新limit_up_date的值，这样就能触发 Vue 的响应式更新机制，让limitup-stock-table组件能够监听到变化
      // this.limit_up_date.setDate(this.limit_up_date.getDate() + day)
      const newDate = new Date(this.limit_up_date.getTime())
      newDate.setDate(newDate.getDate() + day)
      this.$set(this, 'limit_up_date', newDate)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 16px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
