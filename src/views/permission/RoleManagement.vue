<template>
  <div class="page-flex">
    <div class="page-left">
      <el-card shadow="never">
        <template #header>角色列表</template>
        <div style="margin-bottom:10px"><el-button type="primary" size="small" @click="openAddRoleDialog">+ 新增角色</el-button></div>
        <el-input v-model="roleSearch" placeholder="搜索角色名称" size="small" clearable @input="loadRoles" style="margin-bottom:10px" />
        <el-table style="width:100%" :data="roleList" highlight-current-row @row-click="selectRole" size="small">
          <el-table-column prop="roleName" label="角色名称" />
          <el-table-column prop="status" label="状态" width="60">
            <template #default="{row}"><el-tag :type="row.status===1?'success':'danger'" size="small">{{ row.status===1?'启用':'禁用' }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="95">
            <template #default="{row}">
              <el-button type="primary" link size="small" @click.stop="openEditRoleDialog(row)">编辑</el-button>
              <el-button type="warning" link size="small" @click.stop="toggleRoleStatus(row)">{{ row.status===1?'禁用':'启用' }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <div class="page-right">
      <el-card shadow="never" v-if="selectedRole">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="菜单权限" name="menu">
            <div style="margin-bottom:12px">
              <el-button v-if="!editing" type="primary" size="small" @click="startEdit">编辑权限</el-button>
              <template v-else><el-button type="primary" size="small" @click="saveMenuPerms">保存</el-button><el-button size="small" @click="cancelEdit">取消</el-button></template>
            </div>
            <el-tree ref="menuTreeRef" :data="menuTree" :props="{label:'menuName',children:'children'}" node-key="id" show-checkbox :default-checked-keys="checkedMenus" :disabled="!editing" />
          </el-tab-pane>
          <el-tab-pane label="数据权限" name="data">
            <el-radio-group v-model="dataScope" style="display:flex;flex-direction:column;gap:8px">
              <el-radio value="ALL">全部</el-radio><el-radio value="SUB">本级及子级</el-radio><el-radio value="THIS">本级</el-radio><el-radio value="PERSONAL">个人</el-radio><el-radio value="CUSTOM">自定义</el-radio>
            </el-radio-group>
            <el-tree v-if="dataScope==='CUSTOM'" ref="deptTreeRef" :data="deptTree" :props="{label:'deptName',children:'children'}" node-key="id" show-checkbox :default-checked-keys="checkedDepts" style="margin-top:10px" />
            <div style="margin-top:15px"><el-button type="primary" size="small" @click="saveDataScope">保存</el-button><el-button size="small" @click="cancelDataScope">取消</el-button></div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
      <el-empty v-else description="请从左侧选择一个角色" />
    </div>
    <el-dialog v-model="roleDialogVisible" :title="isEditRole?'编辑角色':'新增角色'" width="400px">
      <el-form :model="roleForm" label-width="90px" size="small">
        <el-form-item label="角色名称"><el-input v-model="roleForm.roleName" maxlength="10" /></el-form-item>
        <el-form-item label="角色状态"><el-radio-group v-model="roleForm.status"><el-radio :value="1">启用</el-radio><el-radio :value="0">禁用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="roleDialogVisible=false">取消</el-button><el-button type="primary" @click="saveRole">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
const API = ''
const roleSearch = ref('')
const roleList = ref([])
const selectedRole = ref(null)
const activeTab = ref('menu')
const menuTree = ref([])
const menuTreeRef = ref(null)
const deptTree = ref([])
const deptTreeRef = ref(null)
const checkedMenus = ref([])
const checkedDepts = ref([])
const editing = ref(false)
const dataScope = ref('PERSONAL')
const roleDialogVisible = ref(false)
const isEditRole = ref(false)
const roleForm = ref({ id:'', roleName:'', status:1 })
function loadRoles() { axios.get(API+'/role/list',{params:{roleName:roleSearch.value||undefined}}).then(res=>{if(res.data.code===200){roleList.value=res.data.data;if(!selectedRole.value&&roleList.value.length>0){selectedRole.value=roleList.value[0];loadMenuPerms();loadDataScopeInfo()}}}) }
watch(selectedRole,(val)=>{if(val){loadMenuPerms();loadDataScopeInfo()}})
function selectRole(row){selectedRole.value=row}
function loadMenuTree(){axios.get(API+'/menu/tree').then(res=>{if(res.data.code===200)menuTree.value=res.data.data})}
function loadDeptTree(){axios.get(API+'/dept/tree').then(res=>{if(res.data.code===200)deptTree.value=res.data.data})}
function loadMenuPerms(){if(!selectedRole.value)return;axios.get(API+'/role/menuIds/'+selectedRole.value.id).then(res=>{if(res.data.code===200)checkedMenus.value=res.data.data||[]})}
function loadDataScopeInfo(){if(!selectedRole.value)return;axios.get(API+'/role/dataScope/'+selectedRole.value.id).then(res=>{if(res.data.code===200){dataScope.value=res.data.data.dataScope||'PERSONAL';if(res.data.data.deptIds)checkedDepts.value=res.data.data.deptIds.split(',').map(Number)}})}
function startEdit(){editing.value=true}
function cancelEdit(){editing.value=false;loadMenuPerms()}
function saveMenuPerms(){axios.post(API+'/role/saveMenuPerms',{roleId:selectedRole.value.id,menuIds:menuTreeRef.value?.getCheckedKeys()||[]}).then(res=>{if(res.data.code===200){ElMessage.success('保存成功');editing.value=false}})}
function saveDataScope(){axios.post(API+'/role/saveDataScope',{roleId:selectedRole.value.id,dataScope:dataScope.value,deptIds:dataScope.value==='CUSTOM'?(deptTreeRef.value?.getCheckedKeys()||[]).join(','):''}).then(res=>{if(res.data.code===200)ElMessage.success('保存成功')})}
function cancelDataScope(){loadDataScopeInfo()}
function openAddRoleDialog(){isEditRole.value=false;roleForm.value={id:'',roleName:'',status:1};roleDialogVisible.value=true}
function openEditRoleDialog(row){isEditRole.value=true;roleForm.value={...row};roleDialogVisible.value=true}
function saveRole(){const url=isEditRole.value?API+'/role/update':API+'/role/add';axios.post(url,roleForm.value).then(res=>{if(res.data.code===200){ElMessage.success(isEditRole.value?'修改成功':'新增成功');roleDialogVisible.value=false;loadRoles()}})}
function toggleRoleStatus(row){const ns=row.status===1?0:1;ElMessageBox.confirm(`此操作将${row.status===1?'禁用':'启用'}该角色，是否继续？`,'提示',{type:'warning'}).then(()=>{axios.post(API+'/role/updateStatus',{id:row.id,status:ns}).then(res=>{if(res.data.code===200){ElMessage.success('状态已更新');loadRoles()}else ElMessage.error(res.data.msg)})}).catch(()=>{})}
onMounted(()=>{loadRoles();loadMenuTree();loadDeptTree()})
</script>
<style scoped>
.page-flex { display:flex; gap:16px; }
.page-left { width:250px; flex-shrink:0; }
.page-right { flex:1; min-width:0; }
</style>




