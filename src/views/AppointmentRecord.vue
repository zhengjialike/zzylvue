<template>
  <el-form :inline="true"  label-width="auto"
           style="width: 90%;margin-left:5%">
    <el-form-item label="预约人姓名" style="width: 45%">
      <el-input v-model="condAppForm.appuser"/>
    </el-form-item>
    <el-form-item label="预约人姓名电话" style="width: 45%">
      <el-input  v-model="condAppForm.phone"/>
    </el-form-item>
    <br/>
    <el-form-item label="预约状态" style="width: 45%">
      <el-input  v-model="condAppForm.islock"/>
    </el-form-item>
    <el-form-item label="预约时间" style="width: 45%">

          <el-date-picker
              v-model="condAppForm.time"
              type="datetimerange"
              start-placeholder="Start date"
              end-placeholder="End date"
              format="YYYY-MM-DD HH:mm:ss"
              date-format="YYYY/MM/DD ddd"
              time-format="A hh:mm:ss"
          />

    </el-form-item>
    <br/>
    <el-form-item>
      <el-button type="primary" @click="loadAppointmentList(1)">搜索</el-button>
      <el-button type="warning" @click="loadNursingItemList">重置</el-button>

    </el-form-item>
  </el-form>

  <el-table
      :data="appointmentList"
      style="width: 100%" :fit="true">
    <el-table-column type="index" width="50" />
    <el-table-column prop="appuser" label="预约人姓名" width="120"/>
    <el-table-column prop="phone" label="预约人电话"/>
    <el-table-column prop="olduser" label="老人姓名" width="120"/>
    <el-table-column prop="apptime" label="预约时间" />
    <el-table-column prop="createuser" label="服务人" />
    <el-table-column prop="createtime" label="创建时间"/>
    <el-table-column prop="islock" label="状态"   width="100"/>


    <el-table-column label="操作">
      <template #default="scope">
        <el-button type="success"
                   :disabled="scope.row.islock=='已到院' ||
                   scope.row.islock=='已取消'?true:false"
                   size="small" @click="updateVisittime(scope.row.id)">
          到院
        </el-button>
      </template>
    </el-table-column>



  </el-table>
  <!--   分页组件 -->
  <el-pagination
      size="small"
      background
      layout="prev, pager, next"
      :total="total" @change="doNusringItemPage"/>

  <el-dialog
      v-model="visitDialogVisible"
      title="到院时间确认"
      width="60%">

    <el-form-item label="确认到院时间" style="margin-left: 30%">
      <el-date-picker
          v-model="visitForm.visittime"
          type="datetime"
          placeholder="请选择"
      />
    </el-form-item>
    <el-form-item style="margin-left: 40%">
      <template #default="scope">
        <el-button type="primary" round @click="saveVisitTime">确认</el-button>
        <el-button type="warning" round @click="closeVisitDialog">取消</el-button>
      </template>
    </el-form-item>

  </el-dialog>
</template>

<script setup>

import {onMounted, reactive, ref} from "vue";
import axios from "axios";
import {ElMessage} from "element-plus";
  //声明查询表单数据
  const condAppForm=reactive({
    appuser:'',
    phone:'',
    islock:'',
    time:'',
    starttime:'',
    endtime:'',
    pageNum:1,
    pageSize:10
  });
  //声明页面集合和总记录数
  const appointmentList=ref([]);
  const total=ref(0)
  //定义搜索按钮回调函数
  function loadAppointmentList(pageNum){
    condAppForm.pageNum=pageNum;
    condAppForm.starttime=condAppForm.time[0];
    condAppForm.endtime=condAppForm.time[1];

    console.log(condAppForm);
    axios.post("/appPageList",condAppForm)
    .then(response=>{
      appointmentList.value=response.data.appointments;
      total.value=response.data.total;
    })
  }
  //页面挂载调用加载数据
  onMounted(function(){
    loadAppointmentList(1);
  })

  const visitForm=reactive({
    id:'',
    visittime:''
  });
  //声明到访对话框状态
  const visitDialogVisible=ref(false);
  //打开到访时间确认对话框
  function updateVisittime(id){
    visitForm.id=id;
    visitDialogVisible.value=true;
    console.log(visitDialogVisible.value);
  }
  //定义函数发生实现到访时间记录
  function saveVisitTime(){
    axios.post("/updateVisittime",visitForm)
    .then(response=>{
      if(response.data.code==200){
        //刷新列表
        loadAppointmentList(1);
        //关闭对话框
        visitDialogVisible.value=false;
      }
      ElMessage(response.data.msg);
    })
    .catch(error=>{
      console.log(error);
    })
  }
</script>

<style scoped>

</style>