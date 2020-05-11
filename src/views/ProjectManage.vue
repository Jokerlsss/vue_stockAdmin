<template>
  <div class="container">
    <!-- // TODO: 导出数据按钮 -->
    <div class="oprateArea">
      <el-button @click="insertStockIn()" class="greenBtn">新增</el-button>
    </div>
    <!-- 资产项目信息汇总 -->
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
      <!-- // TODO: 新增的项目排在最前面 -->
      <vxe-table-column type="seq" width="60"></vxe-table-column>
      <vxe-table-column field="productName" title="产品名称" type="html"></vxe-table-column>
      <vxe-table-column field="productCode" title="产品代码" type="html"></vxe-table-column>
      <vxe-table-column field="riskType" title="风险类型" type="html"></vxe-table-column>
      <vxe-table-column field="publisher" title="发布公司" type="html"></vxe-table-column>
      <vxe-table-column field="dateOfEstablishment" title="发布日期" type="html"></vxe-table-column>
      <vxe-table-column field="productType" title="产品类型" show-overflow type="html"></vxe-table-column>
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
    <vxe-pager
      :current-page="tablePage.currentPage"
      :page-size="tablePage.pageSize"
      :total="tablePage.totalResult"
      :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
      @page-change="handlePageChange"
    ></vxe-pager>
    <!-- 编辑 & 新增 弹窗 -->
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
        <vxe-form-item
          title="产品名称"
          field="productName"
          span="23"
          :item-render="{name: '$input', props: {placeholder: '请输入名称'}}"
        ></vxe-form-item>
        <!-- // TODO: 产品代码设置为只能输入数字，包括表结构 -->
        <vxe-form-item
          title="产品代码"
          field="productCode"
          span="7"
          :item-render="{name: '$input', props: {}}"
        ></vxe-form-item>
        <!-- 股票、基金、定期、黄金 -->
        <vxe-form-item
          title="产品类型"
          field="productType"
          span="8"
          :item-render="{name: '$select', props:{placeholder:'请选择产品类型'},options:[{value:'股票',label:'股票'},{value:'基金',label:'基金'},{value:'黄金',label:'黄金'}]}"
        ></vxe-form-item>
        <vxe-form-item
          title="风险类型"
          field="riskType"
          span="8"
          :item-render="{name: '$select', props: {placeholder: '请选择风险类型'},options:[{value:'低风险',label:'低风险'},{value:'中低风险',label:'中低风险'},{value:'中风险',label:'中风险'},{value:'中高风险',label:'中高风险'}]}"
        ></vxe-form-item>
        <vxe-form-item
          title="发行公司"
          field="publisher"
          span="12"
          :item-render="{name: '$input', props: {placeholder: '请输入发行公司名称'}}"
        ></vxe-form-item>
        <!-- // TODO:日期默认录入当天 -->
        <vxe-form-item
          title="发行日期"
          field="dateOfEstablishment"
          span="11"
          :item-render="{name: '$input',props: {type: 'text',placeholder: '请选择日期',readonly:'true',disabled}}"
        ></vxe-form-item>
      </vxe-form>
      <!-- // TODO: 增加productCode但不显示，用于传递给后端 -->
      <!-- 详细信息：基金 -->
      <vxe-form
        :data="fundData"
        :rules="fundRules"
        title-align="right"
        title-width="100"
        @submit="submitEvent"
        v-if="isFund"
      >
        <!-- // TODO: 在选择完类型之后出现详细信息的输入框 -->
        <vxe-form-item
          title="基金详细信息"
          span="24"
          title-align="left"
          title-width="200px"
          :title-prefix="{icon: 'fa fa-address-card-o'}"
        ></vxe-form-item>
        <vxe-form-item
          title="基金类型"
          field="fundType"
          span="12"
          :item-render="{name: '$select', props: {placeholder: '请选择基金类型'},options:[{value:'混合型',label:'混合型'},{value:'股票型',label:'股票型'},{value:'债券型',label:'债券型'},{value:'QDII',label:'QDII'}]}"
        ></vxe-form-item>
        <vxe-form-item
          title="基金经理"
          field="fundManager"
          span="11"
          :item-render="{name: '$input', props: {placeholder: '请输入经理名称'}}"
        ></vxe-form-item>
        <!-- // TODO: 数字 + 单位 输入框 -->
        <vxe-form-item
          title="资产规模"
          field="assetSize"
          span="12"
          :item-render="{name: '$input', props: {placeholder: '请输入规模，如：2亿'}}"
        ></vxe-form-item>
        <vxe-form-item
          title="发行价格"
          field="issuePrice"
          span="11"
          :item-render="{name: '$input', props: {type:'number',placeholder: '发行价格或净值'}}"
        ></vxe-form-item>
      </vxe-form>
      <!-- 详细信息：股票 -->
      <vxe-form
        :data="stockData"
        :rules="stockRules"
        title-align="right"
        title-width="100"
        @submit="submitEvent"
        v-if="isStock"
      >
        <vxe-form-item
          title="股票详细信息"
          span="24"
          title-align="left"
          title-width="200px"
          :title-prefix="{icon: 'fa fa-address-card-o'}"
        ></vxe-form-item>
        <vxe-form-item
          title="发行价格"
          field="issuePrice"
          span="11"
          :item-render="{name: '$input', props: {type:'number',placeholder: '发行价格或净值'}}"
        ></vxe-form-item>
      </vxe-form>
      <!-- 详细信息：定期
      <vxe-form
        :data="regularData"
        :rules="formRules"
        title-align="right"
        title-width="100"
        @submit="submitEvent"
        v-if="isRegular"
      >
        <vxe-form-item
          title="定期详细信息"
          span="24"
          title-align="left"
          title-width="200px"
          :title-prefix="{icon: 'fa fa-address-card-o'}"
        ></vxe-form-item>
        <vxe-form-item
          title="存款时长"
          field="depositDuration"
          span="12"
          :item-render="{name: '$input', props: {type:'number',placeholder: '请输入时长，如：180'}}"
        ></vxe-form-item>天
        <vxe-form-item
          title="利率"
          field="interestRate"
          span="11"
          :item-render="{name: '$input', props: {type:'number',placeholder: '请输入利率，如：1.2'}}"
        ></vxe-form-item>%
      </vxe-form>-->

      <!-- 详细信息：黄金 -->
      <vxe-form
        :data="goldData"
        :rules="goldRules"
        title-align="right"
        title-width="100"
        @submit="submitEvent"
        v-if="isGold"
      >
        <vxe-form-item
          title="黄金详细信息"
          span="24"
          title-align="left"
          title-width="200px"
          :title-prefix="{icon: 'fa fa-address-card-o'}"
        ></vxe-form-item>
        <vxe-form-item
          title="发行价格"
          field="issuePrice"
          span="11"
          :item-render="{name: '$input', props: {type:'number',placeholder: '发行价格或净值'}}"
        ></vxe-form-item>
      </vxe-form>
      <!-- 存放按钮的区域 -->
      <vxe-form>
        <vxe-form-item align="center" span="24">
          <el-button type="primary" @click="submitEvent">提交</el-button>
          <el-button>取消</el-button>
        </vxe-form-item>
      </vxe-form>
    </vxe-modal>
  </div>
</template>

<script>
// import XEUtils from 'xe-utils'
import globalStore from '../stores/global-stores'
export default {
  computed: {
    isGold () {
      if (this.formData.productType === '黄金') {
        return true
      } else {
        return false
      }
    },
    isFund () {
      if (this.formData.productType === '基金') {
        return true
      } else {
        return false
      }
    },
    isStock () {
      if (this.formData.productType === '股票') {
        return true
      } else {
        return false
      }
    },
    isRegular () {
      if (this.formData.productType === '定期') {
        return true
      } else {
        return false
      }
    },
    insertDetailInfoURL () {
      if (this.isGold) {
        let url = 'http://127.0.0.1:9090/gold/insert'
        return url
      } else if (this.isFund) {
        let url = 'http://127.0.0.1:9090/fund/insert'
        return url
      } else if (this.isStock) {
        let url = 'http://127.0.0.1:9090/stock/insert'
        return url
      } else if (this.isRegular) {
        let url = 'http://127.0.0.1:9090/regular/insert'
        return url
      }
    },
    // 判断详细信息是什么类型
    insertDetailInfo () {
      if (this.isGold) {
        let data = this.goldData
        return data
      } else if (this.isFund) {
        let data = this.fundData
        return data
      } else if (this.isStock) {
        let data = this.stockData
        return data
      } else if (this.isRegular) {
        let data = this.regularData
        return data
      }
    }
  },
  data () {
    return {
      // 发行日期：当天
      // publishDate: new Date().getTime(),

      submitLoading: false,
      tableBaseData: [],
      tableProductData: [],
      tablePage: {
        currentPage: 1,
        pageSize: 5,
        totalResult: 0
      },
      // 基金详细信息数组
      fundData: {
        productCode: null,
        fundType: null,
        fundManager: null,
        assetSize: null,
        issuePrice: null
      },
      // 黄金详细信息
      goldData: {
        issuePrice: null
      },
      // 定期详细信息
      regularData: {
        depositDuration: null,
        interestRate: null
      },
      // 股票详细信息
      stockData: {
        issuePrice: null
      },

      selectRow: null,
      showEdit: false,
      formData: {
        productCode: null,
        productName: null,
        riskType: null,
        publisher: null,
        dateOfEstablishment: null,
        productType: null
      },

      // 制定输入规则

      // formRules: {
      //   productType: [
      //     { required: true, message: '请输入名称' },
      //     { min: 3, max: 5, message: '长度在 3 到 5 个字符' }
      //   ],
      //   stockInDate: [
      //     { required: true, message: '请输入日期' }
      //   ]
      // }
      formRules: {
        productName: [
          { require: true, message: '请输入产品名称' }
        ],
        productCode: [
          { require: true, message: '请输入产品代码' }
        ],
        productType: [
          { require: true, message: '请选择产品类型' }
        ],
        riskType: [
          { require: true, message: '请选择风险类型' }
        ],
        publisher: [
          { require: true, message: '请输入发行公司' }
        ],
        dateOfEstablishment: [
          { require: true, message: '请输入发行日期' }
        ]
      },
      fundRules: {
        fundType: [
          { require: true, message: '请选择基金类型' }
        ],
        fundManager: [
          { require: true, message: '请输入基金经理' }
        ],
        assetSize: [
          { require: true, message: '请输入资产规模' }
        ],
        issuePrice: [
          { require: true, message: '请输入发行价格' }
        ]
      },
      stockRules: {
        issuePrice: [
          { require: true, message: '请输入发行价格' }
        ]
      },
      goldRules: {
        issuePrice: [
          { require: true, message: '请输入发行价格' }
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
    // 时间戳转换为标准格式时间
    timestampToTime (timestamp) {
      // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
      var date = new Date(timestamp)
      var Y = date.getFullYear() + '-'
      // 0 代表 1月份，因此要加 1
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      var D = date.getDate() + ' '
      return Y + M + D
    },
    // 增加项目详细信息
    insertProductDetailInfo () {
      // 将项目代码添加到详细信息数组中
      var productCode = this.formData.productCode
      this.$set(this.insertDetailInfo, 'productCode', productCode)
      this.$http({
        method: 'post',
        url: this.insertDetailInfoURL,
        data: this.insertDetailInfo,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((res) => {
        console.log('post:', res)
      }).catch(function (err) {
        console.log('err:', err)
      })
    },
    updateFinancialProduct () {
      this.$http({
        method: 'post',
        url: `http://127.0.0.1:9090/financialProduct/updateByWrapper`,
        data: this.formData,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((res) => {
        console.log('post:', res)
      }).catch(function (err) {
        console.log('err:', err)
      })
    },
    // 查看数据库中是否有重复
    isExist () {
      console.log('this.formData.productCode', this.formData.productCode)
      console.log('this.formData.productName', this.formData.productName)
      this.$http({
        method: 'get',
        url: `http://127.0.0.1:9090/financialProduct/isExist`,
        params: {
          productCode: this.formData.productCode,
          productName: this.formData.productName
        }
      }).then((res) => {
        // res:false => 重复
        console.log('isExistres', res)
        if (res.data) {
          // 当基础信息可以成功新增时，则同时也新增收益信息
          // 先新增带有 issuePrice 的详细信息，再新增主体信息以便更新收益信息
          this.insertProductDetailInfo()
          this.insertFinancialProduct()
          this.$XModal.message({ message: '新增成功', status: 'success' })
          this.showEdit = false
        } else {
          this.$XModal.message({ message: '数据库中已有该项目，请重试', status: 'fail' })
        }
      })
    },
    // 新增数据
    insertFinancialProduct () {
      this.$http({
        method: 'post',
        url: `http://127.0.0.1:9090/financialProduct/insert`,
        data: this.formData,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((res) => {
        console.log('postInsert:', res)
      }).catch(function (err) {
        console.log('err:', err)
      })
    },
    // 改变页面
    handlePageChange ({ currentPage, pageSize }) {
      this.tablePage.currentPage = currentPage
      this.tablePage.pageSize = pageSize
      this.getTableBaseData()
    },
    // 获取数据
    getTableBaseData () {
      this.$http({
        method: 'get',
        url: `http://localhost:9090/financialProduct/listPage`,
        params: {
          current: this.tablePage.currentPage,
          size: this.tablePage.pageSize
        }
      }).then((res) => {
        this.tableBaseData = res.data.records
        console.log('this.tableBaseData', this.tableBaseData)
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
    // 行点击事件
    cellDBLClickEvent ({ row }) {
      // TODO: 点击时发起请求查询详细信息
      this.editEvent(row)
    },
    insertStockIn () {
      // 表格基础信息
      this.formData = {
        productCode: '',
        productName: '',
        riskType: '',
        publisher: '',
        dateOfEstablishment: this.timestampToTime(new Date().getTime()),
        productType: ''
      }
      // 基金详细信息
      this.fundData = {
        productCode: '',
        fundType: '',
        fundManager: '',
        assetSize: '',
        issuePrice: ''
      }
      // 黄金详细信息
      this.goldData = {
        issuePrice: ''
      }
      // 定期详细信息
      this.regularData = {
        depositDuration: '',
        interestRate: ''
      }
      // 股票详细信息
      this.stockData = {
        issuePrice: ''
      }
      this.selectRow = null
      this.showEdit = true
    },
    // TODO:在打开编辑时，带着 id 的参数访问后端，取得 tableProductData 数据
    editEvent (row) {
      this.mockTableProductData()
      this.formData = {
        productCode: row.productCode,
        productName: row.productName,
        riskType: row.riskType,
        publisher: row.publisher,
        dateOfEstablishment: row.dateOfEstablishment,
        productType: row.productType
      }
      // 基金详细信息
      // TODO： 详细信息绑定上表单中
      this.fundData = {
        productCode: row.productCode,
        fundType: row.fundType,
        fundManager: row.fundManager,
        assetSize: row.assetSize,
        issuePrice: row.issuePrice
      }
      // 黄金详细信息
      this.goldData = {
        issuePrice: row.issuePrice
      }
      // 定期详细信息
      this.regularData = {
        depositDuration: row.depositDuration,
        interestRate: row.interestRate
      }
      // 股票详细信息
      this.stockData = {
        issuePrice: row.issuePrice
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
    // 份额数字校验
    numberCheck (param) {
      // 校验规则：非零的正整数
      var reg = /^[1-9]\d*$/
      if (!reg.test(param)) {
        return false
      } else {
        return true
      }
    },
    // 判空校验
    isNull () {
      console.log('productCode', this.formData.productCode)
      console.log('productName', this.formData.productName)
      if (this.formData.productType === null) {
        return false
      } else if (this.formData.productName === null || this.formData.productCode === null || this.formData.riskType === null || this.formData.publisher === null || this.formData.productName === null || this.formData.dateOfEstablishment === null) {
        return false
      } else {
        if (this.formData.productType === '股票') {
          if (this.stockData.issuePrice === null) {
            return false
          } else {
            // 数字校验
            if (this.numberCheck(this.stockData.issuePrice) && this.numberCheck(this.formData.productCode)) {
              return true
            } else {
              return false
            }
          }
        } else if (this.formData.productType === '基金') {
          if (this.fundData.issuePrice === null || this.fundData.fundManager === null || this.fundData.assetSize === null) {
            return false
          } else {
            if (this.numberCheck(this.fundData.issuePrice) && this.numberCheck(this.formData.productCode)) {
              return true
            } else {
              return false
            }
          }
        } else if (this.formData.productType === '黄金') {
          if (this.goldData.issuePrice === null) {
            return false
          } else {
            if (this.numberCheck(this.goldData.issuePrice) && this.numberCheck(this.formData.productCode)) {
              return true
            } else {
              return false
            }
          }
        }
      }
    },
    submitEvent () {
      const isNull = this.isNull()
      const isWorkday = this.isWorkday()
      if (isNull) {
        if (isWorkday) {
          // 工作日才能新增
          this.submitLoading = true
          setTimeout(() => {
            this.submitLoading = false
            if (this.selectRow) {
              this.$XModal.message({ message: '保存成功', status: 'success' })
              this.updateFinancialProduct()
              this.getTableBaseData()
            } else {
              this.isExist()
              // TODO: 在新增后有时候不会刷新当前页面
              this.getTableBaseData()
            }
          }, 500)
        } else {
          this.$XModal.message({ message: '周末不能新增', status: 'fail' })
        }
      } else {
        this.$XModal.message({ message: '信息不完整或格式有误', status: 'fail' })
      }
    },
    async insertRow (row) {
      let { row: newRow } = await this.$refs.xTable.insertAt(row)
      await this.$refs.xTable.setActiveCell(newRow, 'sex')
    },
    // 工作日校验
    isWorkday () {
      var nowDate = new Date()
      if (nowDate.getDay() === 0 || nowDate.getDay() === 6) {
        return false
      } else {
        return true
      }
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
