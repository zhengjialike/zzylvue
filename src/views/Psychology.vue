<template>
  <h5>AI心理咨询助手</h5>
  <el-form  label-width="auto" style="width:50%;margin-left: 25%">
    <el-form-item label="老人姓名">
      <el-select  placeholder="请选择老人信息..." v-model="psyForm.oldid">
        <el-option v-for="item in inRecordList"
                   :label="item.oldname"
                   :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="心理描述">
      <el-input type="textarea" v-model="psyForm.inputmsg"/>
    </el-form-item>
    <el-form-item style="margin-left: 40%">
      <el-button type="primary" @click="getPsychologyResult">获取帮助</el-button>
    </el-form-item>
  </el-form>
  <!-- 定义对话框显示AI模型返回的结果 -->
  <el-dialog
      v-model="psyDialogVisible"
      title="心理助手返回结果"
      width="60%">

      {{psyResult}}
    <hr/>
    <el-form-item style="margin-left: 40%">
        <el-button type="primary" round @click="savePsyResult">保存</el-button>
        <el-button type="warning" round @click="closePsyDialog">取消</el-button>

    </el-form-item>
  </el-dialog>
</template>

<script setup>

  import axios from "axios";
  import {onMounted, reactive, ref} from "vue";
  import {ElMessage} from "element-plus";
  //状态为入住的老人列表
  const inRecordList=ref([]);
  //定义函数加载老人信息
  function loadInOldManList(){
    axios.get("/queryInList")
    .then(response=>{
      if(response.data.code === 200){
        inRecordList.value = response.data.data || [];
      }
    })
    .catch(error=>{
      console.log(error);
    })
  }
  //加载调用函数
  onMounted(function(){
    loadInOldManList();
  })
  //声明提交数据表单对象
  const psyForm=reactive({
    oldid:'',
    inputmsg:''
  });
  //声明变量保存AI大模型响应结果
  const psyResult=ref(null);
  //声明显示心理助手返回结果的对话框状态
  const psyDialogVisible=ref(false);
  //定义异步函数发生请求，获得ai模型返回的结果
  const getPsychologyResult = async ()=>{
    if(!psyForm.inputmsg){
      ElMessage("请输入老师当前心理的详细描述......");
      return null;
    }
    const response=await  axios.post("/getPsychology",psyForm
        ,{timeout:20000});
    //获得响应结果
    var result=response.data;
    //将result赋值给响应式数据，对对话框进行渲染
    psyResult.value=result;
    psyForm.airesult=result; //将ai结果放入表单对象
    psyDialogVisible.value=true;
  }
  //定义对话框取消按钮回调函数
  function closePsyDialog(){
    psyDialogVisible.value=false;
  }
  //定义对话框保存按钮回调函数
  function savePsyResult(){

    axios.post("/savePsy",psyForm)
    .then(response=>{
      if(response.data.code==200){
        //关闭对话框
        psyDialogVisible.value=false;
        psyForm.oldid="";
        psyForm.inputmsg="";
        psyForm.airesult="";
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