<template>
  <div style="max-width:820px;margin:0 auto">
    <el-steps :active="1" align-center style="margin-bottom:30px">
      <el-step title="申请请假" /><el-step title="申请审批" /><el-step title="请假审批" />
    </el-steps>
    <el-card shadow="never"><template #header><strong>申请信息</strong></template>
      <el-form :model="form" label-width="110px" size="small">
        <el-form-item label="老人ID"><el-input v-model="form.elderlyId" type="number" placeholder="请输入老人ID" /></el-form-item>
        <el-form-item label="护理等级"><el-input v-model="form.caregiverLevel" placeholder="请输入" /></el-form-item>
        <el-form-item label="护理员"><el-input v-model="form.caregiver" placeholder="请输入" /></el-form-item>
        <el-form-item label="请假原因"><el-input v-model="form.leaveReason" type="textarea" maxlength="200" /></el-form-item>
        <el-form-item label="陪同人"><el-radio-group v-model="form.companionType"><el-radio value="家属">家属</el-radio><el-radio value="护理人员">护理人员</el-radio><el-radio value="其他">其他</el-radio><el-radio value="无">无</el-radio></el-radio-group></el-form-item>
        <template v-if="form.companionType && form.companionType !== '无'">
          <el-form-item label="陪同人姓名"><el-input v-model="form.companionName" maxlength="10" /></el-form-item>
          <el-form-item label="联系方式"><el-input v-model="form.companionPhone" maxlength="11" /></el-form-item>
        </template>
        <el-form-item label="请假周期"><el-date-picker v-model="leaveDateRange" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="预计返回" value-format="YYYY-MM-DD HH:mm:ss" @change="calcLeaveDays" /></el-form-item>
        <el-form-item label="请假天数"><el-input :model-value="leaveDays+' 天'" disabled /></el-form-item>
      </el-form>
      <div style="text-align:center;margin-top:24px"><el-button type="primary" size="large" @click="submitLeave">提交申请</el-button><el-button size="large" @click="$router.back()" style="margin-left:12px">返回</el-button></div>
    </el-card>
  </div>
</template>
<script setup>
import { ref,reactive } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
const router=useRouter()
const API=''
const form=reactive({elderlyId:'',caregiverLevel:'',caregiver:'',leaveReason:'',companionType:'家属',companionName:'',companionPhone:''})
const leaveDateRange=ref(null)
const leaveDays=ref(0)
function calcLeaveDays(){
  if(!leaveDateRange.value){leaveDays.value=0;return}
  const s=new Date(leaveDateRange.value[0]),e=new Date(leaveDateRange.value[1]),h=(e-s)/(1000*60*60);let d=h/24
  if(d<0.5)d=0.5;else if(d<1)d=1;else d=Math.round(d*10)/10
  leaveDays.value=d;form.leaveStartTime=leaveDateRange.value[0];form.expectedReturnTime=leaveDateRange.value[1]
}
function submitLeave(){if(!form.elderlyId){ElMessage.warning('请输入老人ID');return};axios.post(API+'/leave/add',{...form,elderlyId:parseInt(form.elderlyId),leaveDays:leaveDays.value}).then(res=>{if(res.data.code===200){ElMessage.success('请假申请已提交');router.push('/leaveManagement')}else ElMessage.error(res.data.msg)})}
</script>
