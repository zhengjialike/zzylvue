<template>
  <el-form label-width="auto" style="width:50%;margin-left: 25%;margin-top: 10%">
    <el-form-item label="原始密码">
      <div class="input-wrapper">
        <el-input type="password" v-model="pwdForm.oldpwd" />
        <span style="color: red" class="required-mark">*</span>
      </div>
    </el-form-item>

    <el-form-item label="新密码">
      <div class="input-wrapper">
        <el-input type="password" v-model="pwdForm.newpwd" />
        <span style="color: red" class="required-mark">*</span>
      </div>
    </el-form-item>

    <el-form-item label="确认密码">
      <div class="input-wrapper">
        <el-input type="password" v-model="pwdForm.newpwd2" />
        <span style="color: red" class="required-mark">*</span>
      </div>
    </el-form-item>

    <el-form-item style="margin-left: 30%">
      <el-button type="primary" round @click="updateUserPwd">确认</el-button>
      <el-button type="success" round @click="cleanPwdForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import axios from "axios";

// 密码表单对象
const pwdForm = reactive({
  oldpwd: '',
  newpwd: '',
  newpwd2: ''
});

// 提交密码更新请求
function updateUserPwd() {
  // 验证两次新密码是否一致
  if (pwdForm.newpwd !== pwdForm.newpwd2) {
    ElMessage.error("新密码两次输入不一致......");
    return;
  }

  axios.post("/updatePwd", pwdForm)
    .then(response => {
      const data = response.data;
      ElMessage(data.msg);
      if (data.code === 200) {
        // 更新成功，清空表单
        cleanPwdForm();
      }
    })
    .catch(error => {
      console.log(error);
      ElMessage.error("请求失败，请检查网络");
    });
}

// 清空表单
function cleanPwdForm() {
  pwdForm.oldpwd = "";
  pwdForm.newpwd = "";
  pwdForm.newpwd2 = "";
}
</script>

<style scoped>
.input-wrapper {
  display: flex;
  align-items: center;  /* 使星号和输入框垂直居中 */
  width: 80%;
}
.required-mark {
  margin-left: 5px;    /* 调整星号与输入框的间距 */
}
</style>