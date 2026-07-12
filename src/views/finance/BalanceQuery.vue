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
        <el-table-column prop="prepaidBalance" label="预缴款余额(元)" width="140" />
        <el-table-column prop="depositBalance" label="押金余额(元)" width="140" />
        <el-table-column prop="changeTime" label="变动时间" width="160" />
      </el-table>
      <el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="pageNum" :page-size="pageSize" @current-change="loadData" style="margin-top:12px;justify-content:center" />
    </el-card>
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
function loadData(){axios.post(API+'/elderBalance/page',{pageNum:pageNum.value,pageSize:pageSize.value,...searchForm.value}).then(res=>{if(res.data.code===200){tableData.value=res.data.data.records;total.value=res.data.data.total}})}
function search(){pageNum.value=1;loadData()}
function resetSearch(){searchForm.value={};search()}
onMounted(()=>{loadData()})
</script>
