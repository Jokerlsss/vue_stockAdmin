<template>
  <el-breadcrumb separator="/">
    <!-- <el-breadcrumb-item :to="{ path: '/' }">仓库管理</el-breadcrumb-item>
    <el-breadcrumb-item>
      <a href="/">入库</a>
    </el-breadcrumb-item>-->
    <el-breadcrumb-item>仓库管理</el-breadcrumb-item>
    <!-- <el-breadcrumb-item>入库</el-breadcrumb-item> -->
    <el-breadcrumb-item>{{currentPage}}</el-breadcrumb-item>
    <!-- <el-breadcrumb-item>活动详情</el-breadcrumb-item> -->
  </el-breadcrumb>
</template>

<script>
import globalStore from '../stores/global-stores'
export default {
  computed: {
    currentPage () {
      return globalStore.state.currentPage
    }
  }
}
</script>

<style scoped>
</style>
