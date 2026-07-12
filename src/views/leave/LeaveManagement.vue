<template>
  <div>
    <el-card shadow="never" style="margin-bottom:12px">
      <el-form :model="searchForm" inline size="small">
        <el-form-item label="单据编号"><el-input v-model="searchForm.leaveNo" placeholder="请输入" clearable /></el-form-item>
        <el-form-item><el-button type="primary" @click="search">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <div style="margin-bottom:12px"><el-button type="primary" size="small" @click="$router.push('/leaveDetail')">+ 发起请假申请</el-button></div>
      <el-tabs v-model="statusTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="" /><el-tab-pane label="请假中" name="1" /><el-tab-pane label="超时未归" name="3" /><el-tab-pane label="已返回" name="2" />
      </el-tabs>
      <el-table style="width:100%" :data="tableData" size="small" border stripe>
        <el-table-column type="index" width="50" label="#" />
        <el-table-column prop="leaveNo" label="单据编号" width="170" />
        <el-table-column prop="leaveStartTime" label="请假开始" width="140" />
        <el-table-column prop="expectedReturnTime" label="预计返回" width="140" />
        <el-table-column prop="actualReturnTime" label="实际返回" width="140"><template #default="{row}">{{ row.actualReturnTime||'--' }}</template></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{row}"><el-tag :type="row.status===2?'success':row.status===3?'danger':'warning'" size="small">{{ row.status===1?'请假中':row.status===2?'已返回':'超时未归' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{row}">
            <el-button type="primary" link size="small" @click="viewLeave(row)">查看</el-button>
            <el-button type="success" link size="small" :disabled="row.status===2" @click="openReturnDialog(row)">返回</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="pageNum" :page-size="pageSize" @current-change="loadData" style="margin-top:12px;justify-content:center" />
    </el-card>
    <el-dialog v-model="returnDialogVisible" title="填写返回时间" width="450px">
      <el-form :model="returnForm" label-width="120px" size="small">
        <el-form-item label="实际返回时间"><el-date-picker v-model="returnForm.actualReturnTime" type="datetime" placeholder="请选择" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="returnForm.remark" maxlength="50" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="returnDialogVisible=false">取消</el-button><el-button type="primary" @click="submitReturn">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
const API = ''
const searchForm = ref({ leaveNo:'' })
const statusTab = ref('')
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const returnDialogVisible = ref(false)
const returnForm = ref({ id:'', actualReturnTime:'', remark:'' })
function loadData(){
  const params={pageNum:pageNum.value,pageSize:pageSize.value,...searchForm.value}
  if(statusTab.value)params.status=parseInt(statusTab.value)
  axios.post(API+'/leave/page',params).then(res=>{if(res.data.code===200){tableData.value=res.data.data.records;total.value=res.data.data.total}})
}
function search(){pageNum.value=1;loadData()}
function resetSearch(){searchForm.value={leaveNo:''};search()}
function handleTabChange(){pageNum.value=1;loadData()}
function viewLeave(row){ElMessage.info('请假单：'+row.leaveNo)}
function openReturnDialog(row){returnForm.value={id:row.id,actualReturnTime:'',remark:''};returnDialogVisible.value=true}
function submitReturn(){if(!returnForm.value.actualReturnTime){ElMessage.warning('请选择实际返回时间');return};axios.post(API+'/leave/returnBack',returnForm.value).then(res=>{if(res.data.code===200){ElMessage.success('操作成功');returnDialogVisible.value=false;loadData()}})}
onMounted(()=>{loadData()})
</script>
