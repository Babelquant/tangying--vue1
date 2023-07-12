import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'

Vue.use(Vuex)

// https://webpack.js.org/guides/dependency-management/#requirecontext
const modulesFiles = require.context('./modules', true, /\.js$/)

// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = modulesFiles.keys().reduce((modules, modulePath) => {
  // set './app.js' => 'app'
  const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = modulesFiles(modulePath)
  modules[moduleName] = value.default
  return modules
}, {})

const store = new Vuex.Store({
  modules,
  getters,
  state: {
    asinGroupList: [], // 这里定义一个空数组作为 GroupPane 组件的 list 变量
    currYear: null
  },
  mutations: {
    setAsinGroupList(state, list) {
      // state.asinGroupList = list.map(item => {
      //   if (item.variation_rate === null) {
      //     return { ...item, variation_rate: 1 }
      //   } else {
      //     return item
      //   }
      // })
      state.asinGroupList = list
    },
    setCurrentYear(state, v) {
      state.currYear = v
    }
  }
})

export default store
