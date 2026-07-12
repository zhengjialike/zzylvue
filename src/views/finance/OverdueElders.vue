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
        <el-table-column prop="prepaidBalance" label="欠款金额(元)" width="120" />
        <el-table-column prop="bedNo" label="床位号" width="120" />
        <el-table-column label="操作" width="80"><template #default="{row}"><el-button type="primary" link size="small" @click="viewOverdueBills(row)">查看</el-button></template></el-table-column>
      </el-table>
      <el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="pageNum" :page-size="pageSize" @current-change="loadData" style="margin-top:12px;justify-content:center" />
    </el-card>
    <el-dialog v-model="overdueDialogVisible" title="查看欠费账单" width="650px">
      <el-table style="width:100%" :data="overdueBills" size="small" border stripe>
        <el-table-column type="index" width="50" label="#" />
        <el-table-column prop="billNo" label="账单编号" width="170" />
        <el-table-column prop="billMonth" label="月份" width="80" />
        <el-table-column prop="payableAmount" label="应付金额(元)" width="110" />
        <el-table-column prop="payDeadline" label="支付截止时间" width="150" />
      </el-table>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref,onMounted } from 'vue'
import axios from 'axios'
const API=''
const searchForm=ref({})
const tableData=ref([])
const total=ref(0)
const pageNum=ref(1)
const pageSize=ref(10)
const overdueDialogVisible=ref(false)
const overdueBills=ref([])
function loadData(){axios.post(API+'/elderBalance/page',{pageNum:pageNum.value,pageSize:pageSize.value,...searchForm.value}).then(res=>{if(res.data.code===200){tableData.value=res.data.data.records;total.value=res.data.data.total}})}
function search(){pageNum.value=1;loadData()}
function resetSearch(){searchForm.value={};search()}
function viewOverdueBills(row){axios.post(API+'/bill/page',{pageNum:1,pageSize:100,elderlyId:row.elderlyId,status:1}).then(res=>{if(res.data.code===200){overdueBills.value=res.data.data.records;overdueDialogVisible.value=true}})}
onMounted(()=>{loadData()})
</script>
