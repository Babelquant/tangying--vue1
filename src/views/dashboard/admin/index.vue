<template>
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
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 14}" :lg="{span: 14}" :xl="{span: 14}" style="padding-right:8px;margin-bottom:30px;">
        <concept-table />
      </el-col>
      <el-col :xs="{span: 24}" :sm="{span: 12}" :md="{span: 10}" :lg="{span: 10}" :xl="{span: 10}" style="margin-bottom:30px;">
        <continue-board-chart />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LimitupStockTable from './components/LimitupStockTable'
import ConceptTable from './components/ConceptTable'
import ConceptRankChart from './components/ConceptRankChart'
import ContinueBoardChart from './components/ContinueBoardChart'

export default {
  name: 'DashboardAdmin',
  components: {
    LimitupStockTable,
    ConceptTable,
    ConceptRankChart,
    ContinueBoardChart
  },
  data() {
    return {
      conceptRankChartData: [],
      limit_up_date: new Date()
    }
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
