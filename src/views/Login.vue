<template>
  <!-- <el-container> -->
  <!-- <el-header>Header</el-header> -->
  <!-- <el-main> -->
  <div class="container">
    <div class="inputDiv">
      <p>登&nbsp;录</p>
      <el-input placeholder="请输入用户名" v-model="managerName" clearable class="input"></el-input>
      <el-input placeholder="请输入密码" v-model="managerPassword" show-password class="input"></el-input>
      <el-button type="primary" class="loginBtn" @click="commitEvent">确定</el-button>
    </div>
  </div>
  <!-- </el-main> -->
  <!-- </el-container> -->
</template>

<script>
export default {
  methods: {
    toIndex () {
      this.$router.push('/1')
    },
    isNull () {
      // TODO 当输入空格时也判断为空
      if (this.managerName === '' || this.managerPassword === '') {
        return false
      } else {
        return true
      }
    },
    commitEvent () {
      const isNull = this.isNull()
      if (isNull) {
        this.login()
      } else {
        this.$message({
          message: '信息未填完整',
          type: 'warning'
        })
      }
    },
    login () {
      // todo 改成管理员的账号
      this.$http({
        method: 'get',
        url: `http://127.0.0.1:9090/manager/login`,
        params: {
          managerName: this.managerName,
          managerPassword: this.managerPassword
        }
      }).then((res) => {
        // 0:无该账户  1:登录成功  2:密码错误
        if (res.data === 0) {
          this.$message.error('没有该用户名，请重试')
        } else if (res.data === 1) {
          this.$message({
            message: '登录成功',
            type: 'success'
          })
          this.toIndex()
        } else if (res.data === 2) {
          this.$message.error('密码输入错误，请重试')
        }
        console.log(res)
      }).catch(function (err) {
        console.log('err:', err)
      })
    }
  },
  data () {
    return {
      managerName: '',
      managerPassword: ''
    }
  }
}
</script>

<style scoped>
.container {
  font-family: PingFang SC;
  height: auto;
  margin-top: 100px;
  display: flex;
  justify-content: center;
}
.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  line-height: 300px;
}

/** 输入框div */
.inputDiv {
  width: 40%;
  height: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  text-align: center;
}
.inputDiv > p {
  width: 100%;
  font-family: PingFang SC;
  font-weight: bold;
  font-size: 40px;
}
.input {
  width: 70%;
  margin-top: 20px;
}
.loginBtn {
  height: 40px;
  width: 40%;
  margin-top: 20px;
}
</style>
