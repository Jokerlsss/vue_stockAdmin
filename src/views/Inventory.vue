<template>
  <div class="container">
    <!-- // TODO: 导出数据按钮 -->
    <div class="oprateArea">
      <div class="searchText">
        <p>产品名称：</p>
      </div>
      <!-- // TODO: 可增加输入建议（Element） -->
      <div class="searchInput">
        <el-input v-model="inputProductName" placeholder="搜索产品名称" clearable></el-input>
      </div>
      <div class="searchText">
        <p>产品规格：</p>
      </div>
      <div class="searchInput">
        <el-input v-model="inputProductSize" placeholder="搜索产品规格" clearable></el-input>
      </div>
      <div class="searchBtn">
        <el-button class="greenBtn" icon="el-icon-search">查找</el-button>
        <el-button class="reset" @click="resetSearchInput">重置</el-button>
      </div>
    </div>
    <!-- 库存信息 -->
    <vxe-table
      border
      row-key
      highlight-hover-row
      highlight-current-row
      ref="xTable"
      :data="tableInventoryData"
      @cell-dblclick="cellDBLClickEvent"
      align="center"
      stripe
    >
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column field="productName" title="产品名称" sortable type="html"></vxe-table-column>
      <vxe-table-column field="productSize" title="产品规格" sortable type="html"></vxe-table-column>
      <vxe-table-column field="amount" title="数量" show-overflow type="html"></vxe-table-column>

      <template v-slot:empty>
        <span style="color: #9898a0;">
          <p>没有更多数据了！</p>
        </span>
      </template>
    </vxe-table>
    <!-- 分页 -->
    <!--// TODO: 分页数据获取-->
    <vxe-pager
      :current-page="tablePage.currentPage"
      :page-size="tablePage.pageSize"
      :total="tablePage.totalResult"
      :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
      @page-change="handlePageChange"
    ></vxe-pager>
  </div>
</template>

<script>
// import XEUtils from 'xe-utils'
import globalStore from '../stores/global-stores'
export default {
  data () {
    return {
      inputProductName: '',
      inputProductSize: '',
      submitLoading: false,
      tableInventoryData: [],
      tableProductData: [],
      tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      selectRow: null,
      showEdit: false,
      sexList: [
        { label: '女', value: '0' },
        { label: '男', value: '1' }
      ],
      formData: {
        productName: null,
        productSize: null,
        amount: null
      },
      formRules: {
        productName: [
          { required: true, message: '请输入名称' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符' }
        ],
        productSize: [
          { required: true, message: '请输入日期' }
        ]
      }
    }
  },
  // 全表搜索
  // ? 如果使用了分页之后，搜索出来的结果是一页的还是多页的？

  mounted () {
    // TODO: 数据接口挂载到此钩子函数下
    this.mockTableInventoryData()
    this.cutBreadTitle()
  },
  methods: {
    cutBreadTitle () {
      console.log(globalStore.state.currentPage)
      globalStore.commit('cutPage', 2)
    },
    resetSearchInput () {
      this.inputProductName = ''
      this.inputProductSize = ''
    },
    mockTableInventoryData () {
      var Mock = require('mockjs')
      var Random = Mock.Random
      this.tableInventoryData = Mock.mock({
        // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
        //   productName,productSize，amount
        'list|1-10': [{
          // 属性 id 是一个自增数，起始值为 1，每次增 1
          'productName|+1': 1,
          'productSize': Random.date('yyyy-MM-dd'),
          'amount|+3': 1
        }]
      }).list

      // 输出结果
      // console.log(JSON.stringify(this.tableInventoryData, null, 4))
    },
    mockTableProductData () {
      var Mock = require('mockjs')
      this.tableProductData = Mock.mock({
        'list|1-5': [{
          'productName|+1': 'name' + 1,
          'productSize|+2': 1,
          'amount|+3': 1
        }]
      }).list
    },
    visibleMethod ({ data }) {
      return data.flag1 === 'Y'
    },
    cellDBLClickEvent ({ row }) {
      this.editEvent(row)
    },
    insertStockIn () {
      this.formData = {
        productName: '',
        productSize: '',
        amount: ''
      }
      this.tableProductData = {
        productName: '',
        productSize: '',
        amount: ''
      }
      this.selectRow = null
      this.showEdit = true
    },
    // TODO:在打开编辑时，带着 id 的参数访问后端，取得 tableProductData 数据
    editEvent (row) {
      this.mockTableProductData()
      this.formData = {
        productName: row.productName,
        productSize: row.productSize,
        amount: row.amount
      }
      this.selectRow = row
      this.showEdit = true
    },
    removeEvent (row) {
      this.$XModal.confirm('您确定要删除该数据?').then(type => {
        if (type === 'confirm') {
          this.$refs.xTable.remove(row)
        }
      })
    },
    // TODO: 在新增后，分成两个 post 请求去保存
    submitEvent () {
      this.submitLoading = true
      setTimeout(() => {
        this.submitLoading = false
        this.showEdit = false
        if (this.selectRow) {
          this.$XModal.message({ message: '保存成功', status: 'success' })
          Object.assign(this.selectRow, this.formData)
        } else {
          this.$XModal.message({ message: '新增成功', status: 'success' })
          this.$refs.xTable.insert(this.formData)
        }
      }, 500)
    },
    async insertRow (row) {
      let { row: newRow } = await this.$refs.xTable.insertAt(row)
      await this.$refs.xTable.setActiveCell(newRow, 'sex')
    }
  }
}
</script>

<style scoped>
/* 搜索区域 */
.oprateArea {
  width: 100%;
  height: 40px;
  display: flex;
  margin-bottom: 20px;
}
.searchText {
  height: 100%;
  width: auto;
  display: flex;
  align-items: center;
}
.searchInput {
  padding-right: 30px;
  height: 100%;
  width: 20%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.searchBtn {
  height: 100%;
  width: 20%;
  display: flex;
  align-items: center;
}

.greenBtn {
  background-color: #25c386;
  color: #fff;
  /* font-size: 16px; */
}
.dangerBtn {
  background-color: #ff3300;
  color: #fff;
}
.greenBtn:hover {
  opacity: 0.7;
}
</style>
