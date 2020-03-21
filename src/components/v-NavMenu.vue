<template>
  <el-menu
    :default-active="currentPageRouter"
    class="el-menu-vertical-demo"
    @open="handleSelect"
    @close="handleSelect"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#25C386"
    router
    @select="handleSelect"
  >
    <el-menu-item index="1">
      <i class="el-icon-setting"></i>
      <span slot="title">入库</span>
    </el-menu-item>
    <el-menu-item index="2">
      <i class="el-icon-setting"></i>
      <span slot="title">库存</span>
    </el-menu-item>
    <el-menu-item index="3">
      <i class="el-icon-setting"></i>
      <span slot="title">出库</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
import globalStore from '../stores/global-stores'
export default {
  computed: {
    currentPageRouter () {
      return globalStore.state.currentPageRouter
    }
  },
  methods: {
    handleSelect (key, keyPath) {
      console.log(key, keyPath)
    }
  }
}
</script>

<style scoped>
</style>
