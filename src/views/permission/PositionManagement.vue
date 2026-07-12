<template>
  <div class="page-flex">
    <div class="page-left">
      <el-card shadow="never">
        <template #header>部门列表</template>
        <el-input v-model="deptSearch" placeholder="搜索部门" size="small" clearable @input="loadDeptTree" style="margin-bottom:10px" />
        <el-tree ref="deptTreeRef" :data="deptTree" :props="{label:'deptName',children:'children'}" node-key="id" highlight-current @node-click="handleDeptClick" />
      </el-card>
    </div>
    <div class="page-right">
      <el-card shadow="never" style="margin-bottom:12px">
        <el-form :model="searchForm" inline size="small">
          <el-form-item label="职位名称"><el-input v-model="searchForm.positionName" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="状态"><el-select v-model="searchForm.status" placeholder="请选择" clearable style="width:110px"><el-option label="启用" :value="1" /><el-option label="禁用" :value="0" /></el-select></el-form-item>
          <el-form-item><el-button type="primary" @click="search">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
        </el-form>
      </el-card>
      <el-card shadow="never">
        <div style="margin-bottom:12px"><el-button type="primary" size="small" @click="openAddDialog">+ 新增职位</el-button></div>
        <el-table style="width:100%" :data="tableData" size="small" border stripe>
          <el-table-column type="index" width="50" label="#" />
          <el-table-column prop="positionName" label="职位名称" />
          <el-table-column prop="status" label="状态" width="60">
            <template #default="{row}"><el-tag :type="row.status===1?'success':'danger'" size="small">{{ row.status===1?'启用':'禁用' }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="description" label="说明" show-overflow-tooltip />
          <el-table-column label="操作" width="160">
            <template #default="{row}">
              <el-button type="warning" link size="small" @click="toggleStatus(row)">{{ row.status===1?'禁用':'启用' }}</el-button>
              <el-button type="primary" link size="small" @click="editPosition(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="pageNum" :page-size="pageSize" @current-change="loadData" style="margin-top:12px;justify-content:center" />
      </el-card>
    </div>
    <el-dialog v-model="dialogVisible" :title="isEdit?'编辑职位':'新增职位'" width="450px">
      <el-form :model="form" label-width="90px" size="small">
        <el-form-item label="所在部门"><el-input :model-value="selectedDeptName" disabled /></el-form-item>
        <el-form-item label="职位名称"><el-input v-model="form.positionName" maxlength="10" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :value="1">启用</el-radio><el-radio :value="0">禁用</el-radio></el-radio-group></el-form-item>
        <el-form-item label="说明"><el-input v-model="form.description" type="textarea" maxlength="300" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="savePosition">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
const API = ''
const deptSearch = ref('')
const deptTree = ref([])
const selectedDeptId = ref(null)
const selectedDeptName = ref('')
const searchForm = ref({ positionName:'', status:'' })
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({ id:'', positionName:'', deptId:'', status:1, description:'' })
function loadDeptTree(){axios.get(API+'/dept/tree',{params:{deptName:deptSearch.value||undefined}}).then(res=>{if(res.data.code===200)deptTree.value=res.data.data})}
function handleDeptClick(data){selectedDeptId.value=data.id;selectedDeptName.value=data.deptName;search()}
function loadData(){axios.post(API+'/position/page',{pageNum:pageNum.value,pageSize:pageSize.value,...searchForm.value,deptId:selectedDeptId.value}).then(res=>{if(res.data.code===200){tableData.value=res.data.data.records;total.value=res.data.data.total}})}
function search(){pageNum.value=1;loadData()}
function resetSearch(){searchForm.value={positionName:'',status:''};search()}
function openAddDialog(){isEdit.value=false;form.value={id:'',positionName:'',deptId:selectedDeptId.value,status:1,description:''};dialogVisible.value=true}
function editPosition(row){isEdit.value=true;form.value={...row};dialogVisible.value=true}
function savePosition(){form.value.deptId=selectedDeptId.value;const url=isEdit.value?API+'/position/update':API+'/position/add';axios.post(url,form.value).then(res=>{if(res.data.code===200){ElMessage.success(isEdit.value?'修改成功':'新增成功');dialogVisible.value=false;loadData()}else ElMessage.error(res.data.msg)})}
function toggleStatus(row){const ns=row.status===1?0:1;ElMessageBox.confirm(`此操作将${row.status===1?'禁用':'启用'}该职位，是否继续？`,'提示',{type:'warning'}).then(()=>{axios.post(API+'/position/updateStatus',{id:row.id,status:ns}).then(res=>{if(res.data.code===200){ElMessage.success('状态已更新');loadData()}})}).catch(()=>{})}
onMounted(()=>{loadDeptTree();loadData()})
</script>
<style scoped>
.page-flex { display:flex; gap:16px; }
.page-left { width:220px; flex-shrink:0; }
.page-right { flex:1; min-width:0; }
</style>



