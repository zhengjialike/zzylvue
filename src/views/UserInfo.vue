<template>
  <el-form :model="form" label-width="auto" style="max-width: 600px">
    <el-form-item>
      <el-icon :size="20" color="red">
        <Edit />
      </el-icon>
      个人信息
    </el-form-item>

    <el-form-item label="姓名">
      <el-input v-model="userInfo.uname" />
    </el-form-item>

    <el-form-item label="邮箱">
      {{ userInfo.email }}
    </el-form-item>

    <el-form-item label="部门">
      {{ userInfo.department }}
    </el-form-item>

    <el-form-item label="职位">
      {{ userInfo.job }}
    </el-form-item>

    <el-form-item label="角色">
      {{ userInfo.role }}
    </el-form-item>

    <el-form-item label="手机">
      <el-input v-model="userInfo.phone" />
    </el-form-item>

    <el-form-item label="性别">
      <el-radio-group v-model="userInfo.sex">
        <el-radio value="男">男</el-radio>
        <el-radio value="女">女</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="头像">
      <!-- action 为后端上传接口地址，name 需与后端参数名一致（mf） -->
      <el-upload
        class="avatar-uploader"
        action="http://localhost:8080/upload"
        :show-file-list="false"
        name="mf"
        :on-success="handleAvatarSuccess"
      >
        <img v-if="imageUrl" :src="imageUrl" class="avatar" />
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
      </el-upload>
    </el-form-item>

    <el-form-item style="margin-left: 40%">
      <el-button type="primary" round @click="saveUserInfo">确认</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import axios from "axios";
import { Edit, Plus } from '@element-plus/icons-vue';
import { ElMessage } from "element-plus";

// 声明用户信息表单对象（字段与后端 UserLineDto 对应）
const userInfo = reactive({
  id: '',          // 用于更新时定位记录
  uname: '',       // 对应后端 realname
  email: '',
  department: '',
  job: '',
  role: '',
  phone: '',
  sex: '',
  image: ''        // 头像URL
});

// 声明响应式数据保存头像上传后的路径（用于预览）
const imageUrl = ref(null);

// 定义函数加载当前用户信息
function loadShowInfo() {
  axios.get("/showInfo")
    .then(response => {
      const obj = response.data;
      userInfo.id = obj.id;
      userInfo.uname = obj.realname;      // 后端返回字段为 realname，映射到 uname
      userInfo.email = obj.email;
      userInfo.department = obj.department;
      userInfo.job = obj.job;
      userInfo.role = obj.role;
      userInfo.phone = obj.phone;
      userInfo.sex = obj.sex;
      imageUrl.value = obj.image;         // 若后端返回头像字段
    })
    .catch(error => {
      console.log(error);
    });
}

// 页面加载调用函数
onMounted(() => {
  loadShowInfo();
});

// 头像上传成功回调，value 为后端返回的文件访问路径
function handleAvatarSuccess(value) {
  console.log(value);
  imageUrl.value = value;          // 更新预览
  userInfo.image = value;          // 保存到 userInfo，用于提交更新
}

// 定义函数发送用户信息更新请求
function saveUserInfo() {
  axios.post("/updateUser", userInfo)
    .then(response => {
      ElMessage(response.data.msg);
    })
    .catch(error => {
      console.log(error);
      ElMessage.error("更新失败，请检查网络或稍后重试");
    });
}
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 158px;
  height: 158px;
  text-align: center;
}
</style>