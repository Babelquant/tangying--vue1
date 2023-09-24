<template>
  <keep-alive>
    <div class="dashboard-editor-container">
      <!-- <el-row :gutter="2">
        <el-col :xs="24" :sm="24" :lg="24">
          <div class="chart-wrapper">
            <stock-rank-change :list="data" />
          </div>
        </el-col>
      </el-row> -->
      <el-row>
        <el-col :xs="24" :sm="24" :lg="7">
          <el-button type="primary" size="mini" icon="el-icon-arrow-left" @click="changeLimupDate(-1)">前一天</el-button>
          <el-date-picker
            v-model="search_date"
            type="date"
            size="mini"
            placeholder="选择涨停时间"
          />
          <el-button type="primary" size="mini" icon="el-icon-arrow-right" @click="changeLimupDate(1)">后一天</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="2">
        <el-col :xs="24" :sm="24" :lg="24">
          <div class="chart-wrapper">
            <bid-price-table :tableData="list" />
          </div>
        </el-col>
      </el-row>
    </div>
    </keep-alive>
  </template>
  
  <script>
  import StockRankChange from './components/StockRankChange'
  import BidPriceTable from './components/BidPriceTable'
  import { fetchAbnormalRank, fetchAbnormalBidprice } from '@/api/stock'
  import { parseTime } from '@/utils'
  
  export default {
    components: {
      StockRankChange,
      BidPriceTable
    },
    data() {
      return {
        data: [],
        list: [],
        search_date: new Date()
      }
    },
    watch: {
      search_date: {
        handler(val) {
          fetchAbnormalBidprice({ date: parseTime(val, '{y}-{m}-{d}') })
          .then(res => {
            this.list = res.data
          })
        }
      }
    },
    created() {
      this.fetchBidPriceData()
    },
    methods: {
      handleFetchAbnormalRankList(t) {
        fetchAbnormalRank().then(response => {
          this.data = response.data
        })
      },
      fetchBidPriceData() {
        this.loading = true
        fetchAbnormalBidprice({ date: parseTime(this.search_date, '{y}-{m}-{d}') })
        .then(res => {
          this.list = res.data
          this.loading = false
        })
      },
      changeLimupDate(day) {
        const newDate = new Date(this.search_date.getTime())
        newDate.setDate(newDate.getDate() + day)
        this.search_date = newDate
      }
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
  