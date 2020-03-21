<template>
  <div class="container">
    <!-- // TODO: 导出数据按钮 -->
    <div class="oprateArea">
      <el-button @click="insertStockIn()" class="greenBtn">新增</el-button>
    </div>
    <!-- 入库单信息汇总 -->
    <vxe-table
      border
      row-key
      highlight-hover-row
      highlight-current-row
      ref="xTable"
      :data="tableBaseData"
      @cell-dblclick="cellDBLClickEvent"
      align="center"
      stripe
    >
      <!--//? 如果入库单可以修改，假设我入库后，进行出库，出库之后修改入库日期到出库时间之后，该怎么算？-->

      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column field="stockInNum" title="入库单号" sortable type="html"></vxe-table-column>
      <vxe-table-column field="stockInDate" title="入库日期" sortable type="html"></vxe-table-column>
      <vxe-table-column field="remark" title="备注" show-overflow type="html"></vxe-table-column>
      <vxe-table-column title="操作" width="100" show-overflow>
        <template v-slot="{ row }">
          <el-button type="text" icon="el-icon-edit" @click="editEvent(row)" style="color:#25c386"></el-button>
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="removeEvent(row)"
            style="color:#FF6600;"
          ></el-button>
        </template>
      </vxe-table-column>
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
    <!-- 编辑 & 新增 弹窗 -->
    <!-- // TODO: 当子表格新增空行时，不予保存-->
    <vxe-modal
      v-model="showEdit"
      :title="selectRow ? '编辑' : '新增'"
      width="800"
      :loading="submitLoading"
      resize
      destroy-on-close
      mask-closable
    >
      <vxe-form
        :data="formData"
        :rules="formRules"
        title-align="right"
        title-width="100"
        @submit="submitEvent"
      >
        <!-- 填写入库单-入库基本信息 -->
        <vxe-form-item
          title="基本信息"
          span="24"
          title-align="left"
          title-width="200px"
          :title-prefix="{icon: 'fa fa-address-card-o'}"
        ></vxe-form-item>
        <!-- // TODO:入库单号使用时间戳+当天流水号（后端） -->
        <vxe-form-item
          title="入库单号"
          field="stockInNum"
          span="12"
          :item-render="{name: '$input', props: {placeholder: '请输入名称'}}"
        ></vxe-form-item>
        <vxe-form-item
          title="入库日期"
          field="stockInDate"
          span="11"
          :item-render="{name: '$input', props: {type: 'date', placeholder: '请选择日期',readonly:'true'}}"
        ></vxe-form-item>
        <vxe-form-item
          title="备注"
          field="remark"
          span="23"
          :item-render="{name: 'textarea', attrs: {placeholder: '请输入备注'}}"
        ></vxe-form-item>
        <!-- 填写入库单-入库产品详情信息 -->
        <vxe-form-item
          title="入库产品信息"
          span="24"
          title-align="left"
          title-width="200px"
          :title-prefix="{message: '请填写必填项', icon: 'fa fa-info-circle'}"
        ></vxe-form-item>
        <vxe-toolbar>
          <template v-slot:buttons>
            <el-button icon="el-icon-plus" @click="insertRow()" class="greenBtn"></el-button>
            <!-- <el-button @click="insertRow(-1)">在最后行插入</el-button> -->
            <el-button
              @click="$refs.xTable.removeCheckboxRow()"
              icon="el-icon-delete"
              class="dangerBtn"
            ></el-button>
          </template>
        </vxe-toolbar>
        <!-- // TODO: 新增空值不能提交 -->
        <vxe-table
          border
          show-overflow
          ref="xTable"
          class="my_table_insert"
          max-height="200"
          :data="tableProductData"
          :edit-config="{trigger: 'click', mode: 'cell', icon: 'fa fa-pencil'}"
        >
          // TODO: 输入校验
          <vxe-table-column type="checkbox" width="60"></vxe-table-column>
          <vxe-table-column type="seq" width="60"></vxe-table-column>
          <vxe-table-column field="productName" title="产品名称" :edit-render="{name: 'input'}"></vxe-table-column>
          <vxe-table-column field="productSize" title="产品规格" :edit-render="{name: 'input'}"></vxe-table-column>
          <vxe-table-column
            field="amount"
            title="数量"
            :edit-render="{name: 'input',attrs: { type:'number'}}"
          ></vxe-table-column>
        </vxe-table>
        <vxe-form-item
          align="center"
          span="24"
          :item-render="{ name: '$buttons', children: [{ props: { type: 'submit', content: '提交', status: 'primary' } }, { props: { type: 'reset', content: '重置' } }] }"
        ></vxe-form-item>
      </vxe-form>
    </vxe-modal>
  </div>
</template>

<script>
// import XEUtils from 'xe-utils'
import globalStore from '../stores/global-stores'
export default {
  data () {
    return {
      submitLoading: false,
      tableBaseData: [],
      tableProductData: [],
      tablePage: {
        currentPage: 1,
        pageSize: 5,
        totalResult: 0
      },
      selectRow: null,
      showEdit: false,
      formData: {
        stockInNum: null,
        stockInDate: null,
        remark: null
      },
      formRules: {
        stockInNum: [
          { required: true, message: '请输入名称' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符' }
        ],
        stockInDate: [
          { required: true, message: '请输入日期' }
        ]
      }
    }
  },
  // 全表搜索
  // ? 如果使用了分页之后，搜索出来的结果是一页的还是多页的？

  mounted () {
    // TODO: 数据接口挂载到此钩子函数下
    // this.mockTableBaseData()
    this.cutBreadTitle()
    this.getTableBaseData()
  },
  methods: {
    handlePageChange ({ currentPage, pageSize }) {
      this.tablePage.currentPage = currentPage
      this.tablePage.pageSize = pageSize
      this.getTableBaseData()
    },
    getTableBaseData () {
      this.$http({
        method: 'get',
        url: `http://localhost:9090/StockIn/page`,
        params: {
          current: this.tablePage.currentPage,
          size: this.tablePage.pageSize
        }
      }).then((res) => {
        console.log('getRes:', res)
        this.tableBaseData = res.data.records
        console.log(this.tableBaseData)
        this.tablePage.totalResult = res.data.total
      }).catch(function (err) {
        console.log('err:', err)
      })
    },
    // 切换面包屑名称显示
    cutBreadTitle () {
      console.log(globalStore.state.currentPage)
      globalStore.commit('cutPage', 1)
    },
    mockTableBaseData () {
      var Mock = require('mockjs')
      var Random = Mock.Random
      this.tableBaseData = Mock.mock({
        // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
        //   stockInNum,stockInDate，remark
        'list|1-10': [{
          // 属性 id 是一个自增数，起始值为 1，每次增 1
          'stockInNum|+1': 1,
          'stockInDate': Random.date('yyyy-MM-dd'),
          'remark|+3': 1
        }]
      }).list

      // 输出结果
      // console.log(JSON.stringify(this.tableBaseData, null, 4))
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
        stockInNum: '',
        stockInDate: '',
        remark: ''
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
        stockInNum: row.stockInNum,
        stockInDate: row.stockInDate,
        remark: row.remark
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
.oprateArea {
  width: 100%;
  height: auto;
  display: flex;
  margin-bottom: 20px;
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
