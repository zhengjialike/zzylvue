<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 标题区域 -->
      <div class="login-header">
        <h1 class="system-title">中州养老服务预约平台</h1>
      </div>

      <!-- 登录表单 -->
      <el-form  label-width="auto">
        <el-form-item label="预约人姓名">
          <el-input v-model="appointmentForm.appuser"
          :disabled="isDisable"/>
        </el-form-item>
        <el-form-item label="预约人电话">
          <el-input v-model="appointmentForm.phone"
                    :disabled="isDisable"/>
        </el-form-item>
        <el-form-item label="老人姓名">
          <el-input v-model="appointmentForm.olduser"
                    :disabled="isDisable"/>
        </el-form-item>
        <el-form-item  label="预约时间">
          <el-date-picker
              v-model="appointmentForm.apptime"
              type="datetime"
              placeholder="选择时间"
              style="width: 100%"
              :disabled="isDisable"
          />
        </el-form-item>
        <el-form-item style="margin-left:45%;color: red ">
            {{status}}
        </el-form-item>
        <el-form-item style="margin-left: 35%">
          <el-button
              type="primary" @click="saveAppointment"
              :disabled="isSave">
            预约
          </el-button>
          <el-button
              type="warning"
              :disabled="isQx" @click="cancleAppointment">
            取消
          </el-button>
        </el-form-item>
      </el-form>


    </div>
  </div>
</template>

<script setup>

import {onMounted, reactive, ref} from "vue";
import axios, {isCancel} from "axios";
import {ElMessage} from "element-plus";
import {useRoute} from "vue-router/dist/vue-router";
  //声明预约表单信息
  const appointmentForm=reactive({
    appuser:'',
    phone:'',
    olduser:'',
    apptime:''
  });
  //声明预约状态提示消息
  const status=ref(null);
  //声明表单元素的引用
  const isDisable=ref(false);
  //声明按钮的点击状态
  const isSave=ref(false);
  const isQx=ref(false);

//定义函数实现预约顶级
  function saveAppointment(){
    axios.post("/userApp",appointmentForm)
    .then(response=>{
      if(response.data.code==200){
        status.value="状态:待上门";
        //将当前预约信息变为只读
        isDisable.value=true;
      }
      ElMessage(response.data.msg);
    })
    .catch(error=>{
      console.log(error);
    });
  }
  //////////////查看预约信息进行取消///////////////

  //创建路由对象，获得路由参数
  const route = useRoute()

  //定义函数查询id对应的预约信息
  function loadAppointmentInfo(id){
    axios.get("/loadAppInfo?id="+id)
    .then(response=>{
      var obj=response.data;
      if(response.data){

        appointmentForm.appuser=obj.appuser;
        appointmentForm.phone=obj.phone;
        appointmentForm.olduser=obj.olduser;
        appointmentForm.apptime=obj.apptime;
        isDisable.value=true;
        isSave.value=true;
        isQx.value=false;
        status.value="状态:"+response.data.islock;
      }else{
        isSave.value=false;
        isQx.value=true;
      }

    })
    .catch(error=>{
      console.log(error);
    })
  }
  onMounted(function(){
    //声明变量表示预约单id
    let id=route.query.id;
    if(!id){
      id=0; //如果id不存在，去默认值
    }
    loadAppointmentInfo(id);
  })
  //定义函数发生请求取消预约记录
  function cancleAppointment(){

    //声明变量表示预约单id
    let id=route.query.id;
    axios.get("/modifyStatus?id="+id+"&status=已取消")
        .then(response=>{
          var obj=response.data;
          if(response.data.code==200){
            status.value="状态:已取消";
          }
        })
        .catch(error=>{
          console.log(error);
        })
  }
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 420px;
  padding: 50px 40px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.system-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.login-footer .el-link {
  font-size: 15px;
}


</style>
