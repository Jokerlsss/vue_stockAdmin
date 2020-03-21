import Vue from 'vue'
import Router from 'vue-router'
// import vBreadCrumb from '@/components/v-BreadCrumb'
import ProjectManage from '@/views/ProjectManage'
import Inventory from '@/views/Inventory'
import StockOut from '@/views/StockOut'

Vue.use(Router)

// TODO: 在刷新页面后，页面仍停留在原本打开的路由路径上
export default new Router({
  routes: [
    {
      path: '/',
      name: 'ProjectManage',
      component: ProjectManage
    },
    {
      path: '/1',
      name: 'ProjectManage',
      component: ProjectManage
    },
    {
      path: '/2',
      name: 'Inventory',
      component: Inventory
    },
    {
      path: '/3',
      name: 'StockOut',
      component: StockOut
    }
  ]
})
