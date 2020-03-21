import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
/* eslint-disable */
export default new Vuex.Store({
    // 项目筛选按钮状态
    state: {
        currentPage: '入库单汇总',
        currentPageRouter: ''
    },
    mutations: {
        // 项目页面-切换成列表形式
        cutPage: (state, page) => {
            var stockIn = 1
            var inventory = 2
            var stockOut = 3
            if (page === stockIn) {
                state.currentPage = '入库单汇总'
            } else if (page === inventory) {
                state.currentPage = '库存'
            } else if (page === stockOut) {
                state.currentPage = '出库单汇总'
            }
            // 记录刷新前的缓存路由地址
            state.currentPageRouter = page
        }
    }
})
