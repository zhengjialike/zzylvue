<template>
  <div>
    <el-card shadow="never" style="margin-bottom:12px">
      <el-form :model="searchForm" inline size="small">
        <el-form-item label="账单编号"><el-input v-model="searchForm.billNo" placeholder="请输入" clearable /></el-form-item>
        <el-form-item><el-button type="primary" @click="search">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <div style="margin-bottom:12px"><el-button type="primary" size="small" @click="openGenerateDialog">+ 生成月度账单</el-button></div>
      <el-tabs v-model="statusTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="" /><el-tab-pane label="待支付" name="1" /><el-tab-pane label="已支付" name="2" /><el-tab-pane label="已关闭" name="3" />
      </el-tabs>
      <el-table style="width:100%" :data="tableData" size="small" border stripe>
        <el-table-column type="index" width="50" label="#" />
        <el-table-column prop="billNo" label="账单编号" />
        <el-table-column prop="billAmount" label="账单金额" width="100" />
        <el-table-column label="状态" width="80">
          <template #default="{row}"><el-tag :type="row.status===2?'success':row.status===3?'info':'warning'" size="small">{{ row.status===1?'待支付':row.status===2?'已支付':'已关闭' }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="billMonth" label="月份" width="70" />
        <el-table-column prop="payableAmount" label="应付金额" width="100" />
        <el-table-column prop="payDeadline" label="支付截止" width="140" />
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{row}">
            <el-button type="primary" link size="small" @click="viewBill(row)">查看</el-button>
            <el-button type="success" link size="small" :disabled="row.status!==1" @click="openPayDialog(row)">支付</el-button>
            <el-button type="danger" link size="small" :disabled="row.status!==1" @click="openCancelDialog(row)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="pageNum" :page-size="pageSize" @current-change="loadData" style="margin-top:12px;justify-content:center" />
    </el-card>
    <el-dialog v-model="generateDialogVisible" title="生成月度账单" width="400px">
      <el-form :model="generateForm" label-width="100px" size="small">
        <el-form-item label="老人ID"><el-input v-model="generateForm.elderlyId" type="number" /></el-form-item>
        <el-form-item label="账单月份"><el-date-picker v-model="generateForm.billMonth" type="month" placeholder="请选择" value-format="YYYY-MM" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="generateDialogVisible=false">取消</el-button><el-button type="primary" @click="generateBill">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="payDialogVisible" title="上传支付凭证" width="450px">
      <el-form :model="payForm" label-width="100px" size="small">
        <el-form-item label="支付方式"><el-select v-model="payForm.paymentMethod" placeholder="请选择"><el-option label="微信" value="微信" /><el-option label="支付宝" value="支付宝" /><el-option label="网银" value="网银" /><el-option label="现金" value="现金" /><el-option label="其他" value="其他" /></el-select></el-form-item>
        <el-form-item label="支付备注"><el-input v-model="payForm.paymentRemark" maxlength="50" /></el-form-item>
        <el-form-item label="支付凭证"><el-upload action="http://localhost:8080/upload" :on-success="handleUploadSuccess" :show-file-list="false"><el-button size="small" type="primary">点击上传图片</el-button></el-upload></el-form-item>
      </el-form>
      <template #footer><el-button @click="payDialogVisible=false">取消</el-button><el-button type="primary" @click="submitPay">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="cancelDialogVisible" title="填写取消原因" width="400px">
      <el-input v-model="cancelReason" type="textarea" maxlength="100" placeholder="请输入取消原因" rows="4" />
      <template #footer><el-button @click="cancelDialogVisible=false">取消</el-button><el-button type="primary" @click="submitCancel">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref,onMounted } from 'vue'
import axios from 'axios'
import { ElMessage,ElMessageBox } from 'element-plus'
const API=''
const searchForm=ref({billNo:''})
const statusTab=ref('')
const tableData=ref([])
const total=ref(0)
const pageNum=ref(1)
const pageSize=ref(10)
const generateDialogVisible=ref(false)
const generateForm=ref({elderlyId:'',billMonth:''})
const payDialogVisible=ref(false)
const payForm=ref({id:'',paymentMethod:'',paymentVoucher:'',paymentRemark:''})
const cancelDialogVisible=ref(false)
const cancelId=ref(null)
const cancelReason=ref('')
function loadData(){
  const p={pageNum:pageNum.value,pageSize:pageSize.value,...searchForm.value}
  if(statusTab.value)p.status=parseInt(statusTab.value)
  axios.post(API+'/bill/page',p).then(res=>{if(res.data.code===200){tableData.value=res.data.data.records;total.value=res.data.data.total}})
}
function search(){pageNum.value=1;loadData()}
function resetSearch(){searchForm.value={billNo:''};search()}
function handleTabChange(){pageNum.value=1;loadData()}
function openGenerateDialog(){generateDialogVisible.value=true}
function generateBill(){axios.post(API+'/bill/generateMonthly',{elderlyId:parseInt(generateForm.value.elderlyId),billMonth:generateForm.value.billMonth}).then(res=>{if(res.data.code===200){ElMessage.success('生成成功');generateDialogVisible.value=false;loadData()}else ElMessage.error(res.data.msg)})}
function viewBill(row){ElMessage.info('账单详情：'+row.billNo)}
function openPayDialog(row){payForm.value={id:row.id,paymentMethod:'',paymentVoucher:'',paymentRemark:''};payDialogVisible.value=true}
function handleUploadSuccess(res){payForm.value.paymentVoucher=res}
function submitPay(){axios.post(API+'/bill/pay',payForm.value).then(res=>{if(res.data.code===200){ElMessage.success('支付成功');payDialogVisible.value=false;loadData()}})}
function openCancelDialog(row){cancelId.value=row.id;cancelReason.value='';cancelDialogVisible.value=true}
function submitCancel(){if(!cancelReason.value){ElMessage.warning('请输入取消原因');return};axios.post(API+'/bill/cancel',{id:cancelId.value,cancelReason:cancelReason.value}).then(res=>{if(res.data.code===200){ElMessage.success('已取消');cancelDialogVisible.value=false;loadData()}})}
onMounted(()=>{loadData()})
</script>
