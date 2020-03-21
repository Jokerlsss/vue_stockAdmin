<template>
  <div class="container">
    <!-- // TODO: 导出数据按钮 -->
    <div class="oprateArea">
      <el-button @click="insertStockIn()" class="greenBtn">新增</el-button>
    </div>
    <!-- 出库单汇总 -->
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
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column field="stockInNum" title="出库单号" sortable type="html"></vxe-table-column>
      <vxe-table-column field="stockInDate" title="出库日期" sortable type="html"></vxe-table-column>
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
        <!-- 出库单填写-出库基本信息 -->
        <vxe-form-item
          title="基本信息"
          span="24"
          title-align="left"
          title-width="200px"
          :title-prefix="{icon: 'fa fa-address-card-o'}"
        ></vxe-form-item>
        <!-- // TODO:出库单号使用时间戳+当天流水号（后端） -->
        <vxe-form-item
          title="出库单号"
          field="stockInNum"
          span="12"
          :item-render="{name: '$input', props: {placeholder: '请输入名称'}}"
        ></vxe-form-item>
        <vxe-form-item
          title="出库日期"
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
        <!-- 出库单填写-出库产品详情信息 -->
        <vxe-form-item
          title="出库产品信息"
          span="24"
          title-align="left"
          title-width="200px"
          :title-prefix="{message: '请填写必填项', icon: 'fa fa-info-circle'}"
        ></vxe-form-item>
        <vxe-toolbar>
          <template v-slot:buttons>
            <el-button icon="el-icon-plus" class="greenBtn" @click="choseInventory">选择库存</el-button>
            <el-button
              @click="$refs.xTable.removeCheckboxRow()"
              icon="el-icon-delete"
              class="dangerBtn"
            ></el-button>
          </template>
        </vxe-toolbar>
        <!-- // TODO: 新增空值不能提交 -->

        <el-table :data="selectData" style="width: 100%;" stripe>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="productName" label="产品名称" align="center"></el-table-column>
          <el-table-column prop="productSize" label="产品规格" align="center"></el-table-column>
          <el-table-column prop="amount" label="数量" align="center">
            <template slot-scope="scope">
              <!-- 弹出文字提示 -->
              <!-- //TODO:在关闭窗口后需要清空已选择的数据 -->
              <el-tooltip
                class="item"
                effect="dark"
                :content="'最多出库 '+scope.row.maxAmount+' 件'"
                placement="top-start"
              >
                <el-input-number
                  v-model="scope.row.amount"
                  @input="amountInputEvent"
                  :max="scope.row.maxAmount"
                  :min="1"
                  @focus="amountFocusEvent"
                  @blur="amountBlurEvent"
                  @change="amountChangeEvent"
                ></el-input-number>
                <!-- <vxe-input :value="scope.row.amount" :max="scope.row.amount" min="1" type="number"></vxe-input> -->
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <vxe-form-item
          align="center"
          span="24"
          :item-render="{ name: '$buttons', children: [{ props: { type: 'submit', content: '提交', status: 'primary' } }, { props: { type: 'reset', content: '重置' } }] }"
        ></vxe-form-item>
      </vxe-form>
    </vxe-modal>
    <!-- // TODO:启用range范围选中 -->
    <vxe-modal
      v-model="showInventory"
      width="800"
      title="选择库存"
      :loading="submitLoading"
      resize
      destroy-on-close
      mask-closable
    >
      <!-- 填写出库单-打开 选择库存 界面 -->
      <ChoseInventory
        :selectDataId="selectDataId"
        @getSelectData="getListData"
        @closeInventory="closeInventory"
      ></ChoseInventory>
    </vxe-modal>
  </div>
</template>

<script>
// import XEUtils from 'xe-utils'
import globalStore from '../stores/global-stores'
import ChoseInventory from '@/views/ChoseInventory'
export default {
  components: {
    ChoseInventory
  },
  data () {
    return {
      // 接收来自库存选择的产品
      selectData: [],
      selectDataId: [],
      maxAmount: '',
      inputValue: '',

      submitLoading: false,
      tableBaseData: [],
      tableProductData: [],
      tablePage: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      selectRow: null,
      showEdit: false,
      showInventory: false,

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
    this.mockTableBaseData()
    this.cutBreadTitle()
  },
  methods: {
    // // 将选择出来的数据作为全局数据存储
    // // 设置输入数值不能大于库存
    // // 选择库存之后应该为 push 到最后一行数据，而非覆盖
    // TODO: 不能选择一样的东西
    // ? 1.可否使用缓存，存放已勾选过的数据，选过来后直接覆盖原数组
    // ! 1.但是这样就有一个问题：在我修改完数量之后，再继续选库存的话，数量就会被重置
    // ? 2.可否当数组取过来时，多加一个存放row_id的数组，用该数组传到子组件中，去比对就可以减少循环的次数
    // ? 2.若有重复就不给勾选
    // ? 3.将rowid传进去，禁用掉对应rowid 的checkbox
    // TODO: reserve-selection 可以保持在数据更新后，选中项不变（用于查库存时可以边查边选）
    // TODO: 删除出库产品
    getListData (list) {
      this.selectDataId = []
      for (var i = 0; i < list.length; i++) {
        // 将当前库存值，作为可选的最大出库数量，用新的属性字段存进数组中
        this.$set(list[i], 'maxAmount', list[i].amount)
        // this.selectData.push(list[i])
        // TODO：后台需要增加“产品ID”，保持自增即可
        this.selectDataId.push(list[i]._XID)
      }
      this.selectData = list
      console.log('selectDataId:', this.selectDataId)
    },
    cutBreadTitle () {
      globalStore.commit('cutPage', 3)
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
    choseInventory () {
      this.showInventory = true
    },
    closeInventory () {
      this.showInventory = false
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
