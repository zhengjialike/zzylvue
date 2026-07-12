<template>
  <div>
    <el-card shadow="never" style="margin-bottom:12px">
      <el-form :model="searchForm" inline size="small">
        <el-form-item><el-button type="primary" @click="search">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <el-table style="width:100%" :data="tableData" size="small" border stripe>
        <el-table-column type="index" width="50" label="#" />
        <el-table-column prop="prepaidNo" label="预缴款编号" width="170" />
        <el-table-column prop="amount" label="充值金额" width="110" />
        <el-table-column prop="paymentMethod" label="充值方式" width="90" />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="70"><template #default><el-button type="primary" link size="small" @click="openRechargeDialog">充值</el-button></template></el-table-column>
      </el-table>
      <el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="pageNum" :page-size="pageSize" @current-change="loadData" style="margin-top:12px;justify-content:center" />
    </el-card>
    <el-dialog v-model="rechargeDialogVisible" title="上传充值凭证" width="450px">
      <el-form :model="rechargeForm" label-width="100px" size="small">
        <el-form-item label="老人ID"><el-input v-model="rechargeForm.elderlyId" type="number" /></el-form-item>
        <el-form-item label="充值方式"><el-select v-model="rechargeForm.paymentMethod" placeholder="请选择"><el-option label="微信" value="微信" /><el-option label="支付宝" value="支付宝" /><el-option label="网银" value="网银" /><el-option label="现金" value="现金" /><el-option label="其他" value="其他" /></el-select></el-form-item>
        <el-form-item label="充值金额"><el-input-number v-model="rechargeForm.amount" :precision="2" :min="0" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="rechargeForm.remark" maxlength="50" /></el-form-item>
        <el-form-item label="充值凭证"><el-upload action="http://localhost:8080/upload" :on-success="handleUploadSuccess" :show-file-list="false"><el-button size="small" type="primary">点击上传图片</el-button></el-upload></el-form-item>
      </el-form>
      <template #footer><el-button @click="rechargeDialogVisible=false">取消</el-button><el-button type="primary" @click="submitRecharge">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref,onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
const API=''
const searchForm=ref({})
const tableData=ref([])
const total=ref(0)
const pageNum=ref(1)
const pageSize=ref(10)
const rechargeDialogVisible=ref(false)
const rechargeForm=ref({elderlyId:'',paymentMethod:'',amount:0,paymentVoucher:'',remark:''})
function loadData(){axios.post(API+'/prepaid/page',{pageNum:pageNum.value,pageSize:pageSize.value,...searchForm.value}).then(res=>{if(res.data.code===200){tableData.value=res.data.data.records;total.value=res.data.data.total}})}
function search(){pageNum.value=1;loadData()}
function resetSearch(){searchForm.value={};search()}
function openRechargeDialog(){rechargeForm.value={elderlyId:'',paymentMethod:'',amount:0,paymentVoucher:'',remark:''};rechargeDialogVisible.value=true}
function handleUploadSuccess(res){rechargeForm.value.paymentVoucher=res}
function submitRecharge(){axios.post(API+'/prepaid/recharge',rechargeForm.value).then(res=>{if(res.data.code===200){ElMessage.success('充值成功');rechargeDialogVisible.value=false;loadData()}})}
onMounted(()=>{loadData()})
</script>
