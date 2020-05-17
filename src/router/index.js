import Vue from 'vue'
import Router from 'vue-router'
// import vBreadCrumb from '@/components/v-BreadCrumb'
import ProjectManage from '@/views/ProjectManage'
import Login from '@/views/Login'

Vue.use(Router)

// TODO: 在刷新页面后，页面仍停留在原本打开的路由路径上
export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/1',
      name: 'ProjectManage',
      component: ProjectManage
    }
  ]
})
