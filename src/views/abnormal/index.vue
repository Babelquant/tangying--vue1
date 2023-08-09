<template>
  <keep-alive>
    <div class="dashboard-editor-container">
      <el-row :gutter="2">
        <el-col :xs="24" :sm="24" :lg="24">
          <div class="chart-wrapper">
            <stock-rank-change :list="data" />
          </div>
        </el-col>
      </el-row>
    </div>
    </keep-alive>
  </template>
  
  <script>
  import StockRankChange from './components/StockRankChange'
  import { fetchAbnormalRank } from '@/api/stock'
  
  export default {
    components: {
      StockRankChange
    },
    data() {
      return {
        data: []
      }
    },
    created() {
      fetchAbnormalRank().then(response => {
        this.data = response.data
      })
    },
    methods: {
      handleFetchAbnormalRankList(t) {
        fetchAbnormalRank().then(response => {
          this.data = response.data
        })
      },
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
  