<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="2">
      <el-col :xs="24" :sm="24" :lg="24">
        <div class="chart-wrapper">
          <concept-table />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import ConceptTable from './components/ConceptTable'
// import { fetchLimitupTwoList } from '@/api/stock'
// import { parseTime } from '@/utils'

export default {
  components: {
    ConceptTable
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
