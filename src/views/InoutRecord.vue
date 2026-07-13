<template>
  <!--  添加对话框组件，实现护理项目的新增  -->
  <el-dialog
      v-model="visitDialogVisible"
      title="来访信息登记"
      width="40%">

    <el-form  label-width="auto"
              style="margin-left:5%;margin-right:5%;max-width: 600px">
      <el-form-item label="来访类型">
        <el-radio-group v-model="visitForm.visittype"
          @change="doRadioChangeHandler">
          <el-radio value="参观来访">参观来访</el-radio>
          <el-radio value="探访来访">探访来访</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="来访人姓名">
        <el-input v-model="visitForm.visitname"/>
      </el-form-item>
      <el-form-item label="来访人电话">
        <el-input v-model="visitForm.phone"/>
      </el-form-item>
      <el-form-item label="老人姓名">
        <el-input v-model="visitForm.oldname" v-if="isShow"/>
        <el-select v-model="visitForm.oldname"  v-else
                   placeholder="请选择" >
          <el-option v-for="item in inRecordList" :label="item.oldname"
                     :value="item.oldname" />

        </el-select>
      </el-form-item>
      <el-form-item label="来访时间">
        <el-date-picker
            v-model="visitForm.visittime"
            type="datetime"
            placeholder="请选择" style="width: 100%" />
      </el-form-item>


      <el-form-item style="margin-left: 40%">
        <el-button type="primary" round @click="saveVisitRecord">确认</el-button>
        <el-button type="warning" round @click="cleanVisitForm">取消</el-button>
      </el-form-item>
    </el-form>

  </el-dialog>
  <div style="text-align: left">
    <el-button type="primary"
               @click="openVisitDialog">来访登记</el-button>
  </div>
</template>

<script setup>

import {reactive, ref} from "vue";
import axios from "axios";
import {ElMessage} from "element-plus";
  //声明对话框状态
  const visitDialogVisible=ref(false);
  //声明来访登记表单对象
  const visitForm=reactive({
    id:'',
    visittype:'参观来访',
    phone:'',
    oldname:'',
    visitname:'',
    visittime:''
  });
  //声明老人姓名的获取控制
  const isShow=ref(true);
  //声明集合保存已入住老人的集合
  const inRecordList=ref([]);
  //声明函数打开来访登记对话框
  function openVisitDialog(){
    visitDialogVisible.value=true;
  }
  //定义单选按钮组得到回调函数,param绑定选中的radis的value值
  function doRadioChangeHandler(param){
    //console.log(param);
    if(param=="参观来访"){
      isShow.value=true;
    }else{
      isShow.value=false;
      //发送异步请求查询已入住老人姓名
      axios.get("/queryInList")
      .then(response=>{
        inRecordList.value=response.data;
      })
      .catch(error=>{
        console.log(error);
      })
    }
  }
  //声明函数提交来访登记的请求
  function saveVisitRecord(){
    axios.post("/saveVisitRecord",visitForm)
    .then(response=>{
      if(response.data.code==200){
        //关闭对话框
        visitDialogVisible.value=false;
        //清空表单
        cleanVisitForm();
        //刷新列表
      }
      ElMessage(response.data.msg);
    })
    .catch(error=>{
      console.log(error);
    });
  }
  //定义函数清空form表单对象
  function cleanVisitForm(){
    visitForm.id='';
    visitForm.visittype='参观来访';
    visitForm.phone='';
    visitForm.oldname='';
    visitForm.visitname='';
    visitForm.visittime='';
  }
</script>

<style scoped>

</style>