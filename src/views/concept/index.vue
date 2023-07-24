<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="2">
      <el-col :xs="24" :sm="24" :lg="24">
        <div class="chart-wrapper">
          <concept-hot-chart />
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="2">
      <el-col :xs="24" :sm="24" :lg="24">
        <div class="chart-wrapper">
          <keep-alive>
            <concept-table />
          </keep-alive>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import ConceptTable from './components/ConceptTable'
import ConceptHotChart from './components/ConceptHotChart'

export default {
  components: {
    ConceptTable,
    ConceptHotChart
  },
  data() {
    return {
    }
  },
  created() {

  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
