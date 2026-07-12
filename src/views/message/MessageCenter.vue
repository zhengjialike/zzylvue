<template>
  <div>
    <el-card shadow="never" style="margin-bottom:12px">
      <el-form :model="searchForm" inline size="small">
        <el-form-item label="消息类型"><el-select v-model="searchForm.type" placeholder="请选择" clearable style="width:140px"><el-option label="协同工作" value="协同工作" /><el-option label="报警通知" value="报警通知" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="search">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane :label="'未读 ('+unreadCount+')'" name="0" />
        <el-tab-pane label="已读" name="1" />
      </el-tabs>
      <div style="margin:10px 0;display:flex;gap:8px;flex-wrap:wrap">
        <el-button size="small" @click="markAllRead">全部已读</el-button>
        <el-button size="small" @click="deleteAll">全部删除</el-button>
        <el-button size="small" :disabled="selectedIds.length===0" @click="batchMarkRead">标记为已读</el-button>
        <el-button size="small" :disabled="selectedIds.length===0" @click="batchDelete">批量删除</el-button>
      </div>
      <el-table style="width:100%" :data="tableData" size="small" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="40" />
        <el-table-column prop="msgType" label="类型" width="100"><template #default="{row}"><el-tag :type="row.msgType==='协同工作'?'primary':'warning'" size="small">{{ row.msgType }}</el-tag></template></el-table-column>
        <el-table-column prop="title" label="消息标题" min-width="200" />
        <el-table-column prop="content" label="消息内容" show-overflow-tooltip min-width="200" />
        <el-table-column prop="createTime" label="接收时间" width="160" />
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{row}"><el-button type="primary" link size="small" @click="viewMessage(row)">查看</el-button><el-button type="danger" link size="small" @click="deleteMessage(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="pageNum" :page-size="pageSize" @current-change="loadData" style="margin-top:12px;justify-content:center" />
    </el-card>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
const API = ''
const searchForm = ref({ type:'' })
const activeTab = ref('0')
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const selectedIds = ref([])
const unreadCount = ref(0)
function loadData() {
  const params={pageNum:pageNum.value,pageSize:pageSize.value,isRead:activeTab.value}
  if(searchForm.value.type)params.type=searchForm.value.type
  axios.post(API+'/message/page',params).then(res=>{if(res.data.code===200){tableData.value=res.data.data.records;total.value=res.data.data.total}})
  axios.get(API+'/message/unreadCount').then(res=>{if(res.data.code===200)unreadCount.value=res.data.data})
}
function search(){pageNum.value=1;loadData()}
function resetSearch(){searchForm.value={type:''};search()}
function handleTabChange(){pageNum.value=1;loadData()}
function handleSelectionChange(rows){selectedIds.value=rows.map(r=>r.id)}
function markAllRead(){ElMessageBox.confirm('确认将所有消息标记为已读？','提示',{type:'info'}).then(()=>{axios.post(API+'/message/markAllRead').then(res=>{if(res.data.code===200){ElMessage.success('操作成功');loadData()}})}).catch(()=>{})}
function deleteAll(){ElMessageBox.confirm('确认删除全部消息？','提示',{type:'warning'}).then(()=>{axios.post(API+'/message/deleteAll').then(res=>{if(res.data.code===200){ElMessage.success('已删除');loadData()}})}).catch(()=>{})}
function batchMarkRead(){Promise.all(selectedIds.value.map(id=>axios.post(API+'/message/markRead',{id}))).then(()=>{ElMessage.success('操作成功');loadData()})}
function batchDelete(){ElMessageBox.confirm('确认删除选中的消息？','提示',{type:'warning'}).then(()=>{Promise.all(selectedIds.value.map(id=>axios.post(API+'/message/delete',{id}))).then(()=>{ElMessage.success('已删除');loadData()})}).catch(()=>{})}
function viewMessage(row){axios.post(API+'/message/markRead',{id:row.id});ElMessage.info('消息：'+row.title)}
function deleteMessage(row){ElMessageBox.confirm('确认删除？','提示',{type:'warning'}).then(()=>{axios.post(API+'/message/delete',{id:row.id}).then(res=>{if(res.data.code===200){ElMessage.success('已删除');loadData()}})}).catch(()=>{})}
onMounted(()=>{loadData()})
</script>
