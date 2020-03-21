<template>
  <div id="app">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <vNavMenu></vNavMenu>
      </el-aside>
      <el-container>
        <!-- 顶部 -->
        <el-header>
          <vBreadCrumb></vBreadCrumb>
        </el-header>
        <!-- 内容 -->
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import vNavMenu from '@/components/v-NavMenu'
import vBreadCrumb from '@/components/v-BreadCrumb'
export default {
  name: 'App',
  components: {
    vNavMenu,
    vBreadCrumb
  }
}
</script>

<style>
html,
body,
#app {
  padding: 0;
  margin: 0;
  height: 100%;
}
.el-container {
  height: 100%;
  /* 外部间距为 0  */
  margin: 0;
  /* 设置内部填充为 0 ，布局元素之间没有间距 */
  padding: 0;
}

.el-header,
.el-footer {
  display: flex;
  align-items: center;
  background-color: #e9eef3;
  color: #333;
}

.el-aside {
  background-color: #545c64;
  color: #333;
}

.el-main {
  background-color: #fff;
}
</style>
