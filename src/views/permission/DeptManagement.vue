<template>
  <div>
    <el-card shadow="never" style="margin-bottom:12px">
      <el-form :model="searchForm" inline size="small">
        <el-form-item label="部门名称"><el-input v-model="searchForm.deptName" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="状态"><el-select v-model="searchForm.status" placeholder="请选择" clearable style="width:110px"><el-option label="启用" :value="1" /><el-option label="禁用" :value="0" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="search">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <div style="margin-bottom:12px"><el-button type="primary" size="small" @click="openAddDialog">+ 新增部门</el-button></div>
      <el-table style="width:100%" :data="deptTree" row-key="id" default-expand-all size="small" border stripe>
        <el-table-column prop="deptName" label="部门名称" />
        <el-table-column prop="sort" label="排序" width="60" />
        <el-table-column prop="leader" label="负责人" width="100" />
        <el-table-column prop="status" label="状态" width="60">
          <template #default="{row}"><el-tag :type="row.status===1?'success':'danger'" size="small">{{ row.status===1?'启用':'禁用' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{row}">
            <el-button type="warning" link size="small" @click="toggleStatus(row)">{{ row.status===1?'禁用':'启用' }}</el-button>
            <el-button type="primary" link size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button type="success" link size="small" @click="openAddSubDialog(row)">新增子部门</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="isEdit?'编辑部门':'新增部门'" width="450px">
      <el-form :model="form" label-width="90px" size="small">
        <el-form-item label="上级部门"><el-cascader v-model="form.parentId" :options="deptOptions" :props="{label:'deptName',value:'id',children:'children',checkStrictly:true}" clearable /></el-form-item>
        <el-form-item label="部门名称"><el-input v-model="form.deptName" maxlength="10" /></el-form-item>
        <el-form-item label="负责人"><el-input v-model="form.leader" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" controls-position="right" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :value="1">启用</el-radio><el-radio :value="0">禁用</el-radio></el-radio-group></el-form-item>
        <el-form-item label="说明"><el-input v-model="form.description" type="textarea" maxlength="300" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="saveDept">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
const API = ''
const searchForm = ref({ deptName:'', status:'' })
const deptTree = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({ id:'', deptName:'', parentId:null, leader:'', sort:0, status:1, description:'' })
const deptOptions = computed(()=>[{id:0,deptName:'顶级部门',children:deptTree.value}])
function loadData(){axios.get(API+'/dept/tree',{params:{deptName:searchForm.value.deptName||undefined,status:searchForm.value.status||undefined}}).then(res=>{if(res.data.code===200)deptTree.value=res.data.data})}
function search(){loadData()}
function resetSearch(){searchForm.value={deptName:'',status:''};loadData()}
function openAddDialog(){isEdit.value=false;form.value={id:'',deptName:'',parentId:null,leader:'',sort:0,status:1,description:''};dialogVisible.value=true}
function openEditDialog(row){isEdit.value=true;form.value={...row};dialogVisible.value=true}
function openAddSubDialog(row){isEdit.value=false;form.value={id:'',deptName:'',parentId:row.id,leader:'',sort:0,status:1,description:''};dialogVisible.value=true}
function saveDept(){const url=isEdit.value?API+'/dept/update':API+'/dept/add';axios.post(url,form.value).then(res=>{if(res.data.code===200){ElMessage.success(isEdit.value?'修改成功':'新增成功');dialogVisible.value=false;loadData()}else ElMessage.error(res.data.msg)})}
function toggleStatus(row){const ns=row.status===1?0:1;ElMessageBox.confirm(`此操作将${row.status===1?'禁用':'启用'}该部门，是否继续？`,'提示',{type:'warning'}).then(()=>{axios.post(API+'/dept/updateStatus',{id:row.id,status:ns}).then(res=>{if(res.data.code===200){ElMessage.success('状态已更新');loadData()}})}).catch(()=>{})}
onMounted(()=>{loadData()})
</script>




