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
      <el-card shadow="never">
        <el-form :model="searchForm" inline size="small">
          <el-form-item label="姓名"><el-input v-model="searchForm.name" placeholder="请输入" clearable /></el-form-item>
          <el-form-item label="状态"><el-select v-model="searchForm.status" placeholder="请选择" clearable style="width:110px"><el-option label="启用" :value="1" /><el-option label="禁用" :value="0" /></el-select></el-form-item>
          <el-form-item><el-button type="primary" @click="search">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
        </el-form>
      </el-card>
      <el-card shadow="never" style="margin-top:12px">
        <div style="margin-bottom:10px"><el-button type="primary" size="small" @click="openAddDialog">+ 新增用户</el-button></div>
        <el-table style="width:100%" :data="tableData" border stripe size="small">
          <el-table-column type="index" width="50" label="#" />
          <el-table-column prop="realname" label="姓名" width="90" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="phone" label="手机" width="120" />
          <el-table-column prop="sex" label="性别" width="55" />
          <el-table-column label="状态" width="70">
            <template #default="{row}"><el-tag :type="row.islock===0?'success':'danger'" size="small">{{ row.islock===0?'启用':'禁用' }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="290" fixed="right">
            <template #default="{row}">
              <el-button type="primary" link size="small" @click="editUser(row)">编辑</el-button>
              <el-button type="success" link size="small" @click="toggleStatus(row)">{{ row.islock===0?'禁用':'启用' }}</el-button>
              <el-button type="danger" link size="small" :disabled="row.islock===0" @click="deleteUser(row)">删除</el-button>
              <el-button type="info" link size="small" @click="resetPwd(row)">重置密码</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="pageNum" :page-size="pageSize" @current-change="loadData" style="margin-top:12px;justify-content:center" />
      </el-card>
    </div>
    <el-dialog v-model="dialogVisible" :title="isEdit?'编辑用户':'新增用户'" width="520px">
      <el-form :model="form" label-width="100px" size="small">
        <el-form-item label="姓名"><el-input v-model="form.realname" maxlength="10" /></el-form-item>
        <el-form-item label="所在部门"><el-input :model-value="selectedDeptName" disabled /></el-form-item>
        <el-form-item label="绑定角色"><el-select v-model="form.roleIds" multiple><el-option v-for="r in roleList" :key="r.id" :label="r.roleName" :value="r.id" /></el-select></el-form-item>
        <el-form-item label="手机"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="form.email" maxlength="30" /></el-form-item>
        <el-form-item label="所属职位"><el-select v-model="form.positionId"><el-option v-for="p in positionList" :key="p.id" :label="p.positionName" :value="p.id" /></el-select></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.islock"><el-radio :value="0">启用</el-radio><el-radio :value="1">禁用</el-radio></el-radio-group></el-form-item>
        <el-form-item label="性别"><el-radio-group v-model="form.sex"><el-radio value="男">男</el-radio><el-radio value="女">女</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="saveUser">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
const API = ''
const deptSearch = ref('')
const deptTree = ref([])
const deptTreeRef = ref(null)
const selectedDeptId = ref(null)
const selectedDeptName = ref('')
const searchForm = reactive({ name: '', status: '' })
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = reactive({ id:'', realname:'', email:'', phone:'', sex:'男', deptId:'', positionId:'', islock:0, roleIds:[] })
const roleList = ref([])
const positionList = ref([])
function loadDeptTree() { axios.get(API+'/dept/tree',{params:{deptName:deptSearch.value||undefined}}).then(res=>{if(res.data.code===200)deptTree.value=res.data.data}) }
function handleDeptClick(data) { selectedDeptId.value=data.id; selectedDeptName.value=data.deptName; search() }
function loadData() { axios.post(API+'/user/page',{pageNum:pageNum.value,pageSize:pageSize.value,...searchForm,deptId:selectedDeptId.value}).then(res=>{if(res.data.code===200){tableData.value=res.data.data.records;total.value=res.data.data.total}}) }
function search() { pageNum.value=1; loadData() }
function resetSearch() { searchForm.name=''; searchForm.status=''; search() }
function loadRoles() { axios.get(API+'/role/list').then(res=>{if(res.data.code===200)roleList.value=res.data.data}) }
function loadPositions() { axios.post(API+'/position/page',{pageNum:1,pageSize:999}).then(res=>{if(res.data.code===200)positionList.value=res.data.data.records}) }
function openAddDialog() { isEdit.value=false; Object.assign(form,{id:'',realname:'',email:'',phone:'',sex:'男',positionId:'',islock:0,roleIds:[]}); dialogVisible.value=true }
function editUser(row) { isEdit.value=true; Object.assign(form,row); form.deptId=selectedDeptId.value; axios.get(API+'/user/roleIds/'+row.id).then(res=>{if(res.data.code===200)form.roleIds=res.data.data||[]}); dialogVisible.value=true }
function saveUser() { form.deptId=selectedDeptId.value; const url=isEdit.value?API+'/user/update':API+'/user/add'; axios.post(url,form).then(res=>{if(res.data.code===200){ElMessage.success(isEdit.value?'修改成功':'新增成功');dialogVisible.value=false;loadData()}else ElMessage.error(res.data.msg)}) }
function deleteUser(row) { ElMessageBox.confirm('确认删除？','提示',{type:'warning'}).then(()=>{axios.post(API+'/user/updateStatus',{id:row.id,status:1}).then(res=>{if(res.data.code===200){ElMessage.success('已删除');loadData()}})}).catch(()=>{}) }
function toggleStatus(row) { const ns=row.islock===0?1:0; ElMessageBox.confirm(`此操作将${row.islock===0?'禁用':'启用'}该用户，是否继续？`,row.islock===0?'确认禁用':'确认启用',{type:'warning',confirmButtonText:'确定'+(row.islock===0?'禁用':'启用')}).then(()=>{axios.post(API+'/user/updateStatus',{id:row.id,status:ns}).then(res=>{if(res.data.code===200){ElMessage.success('状态已更新');loadData()}})}).catch(()=>{}) }
function resetPwd(row) { ElMessageBox.confirm('此操作将重置该用户密码，是否继续？','确认重置',{type:'warning',confirmButtonText:'确定重置'}).then(()=>{axios.post(API+'/user/resetPassword',{id:row.id}).then(res=>{if(res.data.code===200)ElMessage.success('密码已重置')})}).catch(()=>{}) }
onMounted(()=>{loadDeptTree();loadData();loadRoles();loadPositions()})
</script>
<style scoped>
.page-flex { display:flex; gap:16px; }
.page-left { width:220px; flex-shrink:0; }
.page-right { flex:1; min-width:0; }
</style>
