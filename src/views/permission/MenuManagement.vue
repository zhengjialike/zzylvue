<template>
  <div class="page-flex">
    <div class="page-left">
      <el-card shadow="never">
        <template #header><span>菜单结构</span><el-button type="primary" size="small" style="margin-left:10px" @click="openAddMenuDialog">+ 菜单配置</el-button></template>
        <el-table style="width:100%" :data="menuTree" row-key="id" default-expand-all size="small" highlight-current-row @row-click="selectMenu">
          <el-table-column prop="menuName" label="菜单名称" />
          <el-table-column prop="visible" label="可见" width="60">
            <template #default="{row}"><el-tag :type="row.visible===1?'success':'info'" size="small">{{ row.visible===1?'是':'否' }}</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{row}">
              <el-button type="primary" link size="small" @click.stop="openEditMenuDialog(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <div class="page-right">
      <el-card shadow="never">
        <template #header><span>子菜单配置</span><el-button type="primary" size="small" style="margin-left:10px" @click="openAddButtonDialog">+ 新增子菜单</el-button></template>
        <el-table style="width:100%" :data="buttonList" size="small" border stripe>
          <el-table-column prop="mname" label="子菜单名称" />
          <el-table-column prop="path" label="路由" />
          <el-table-column label="操作" width="120">
            <template #default="{row}">
              <el-button type="primary" link size="small" @click="openEditButtonDialog(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!selectedMenu" description="请从左侧选择一个菜单" />
      </el-card>
    </div>
    <el-dialog v-model="menuDialogVisible" :title="isEditMenu?'编辑菜单':'菜单配置'" width="450px">
      <el-form :model="menuForm" label-width="90px" size="small">
        <el-form-item label="上级菜单"><el-cascader v-model="menuForm.parentId" :options="menuTreeOptions" :props="{label:'menuName',value:'id',children:'children',checkStrictly:true}" clearable /></el-form-item>
        <el-form-item label="菜单名称"><el-input v-model="menuForm.menuName" maxlength="10" /></el-form-item>
        <el-form-item label="菜单路由"><el-input v-model="menuForm.path" maxlength="50" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="menuForm.sort" :min="0" controls-position="right" /></el-form-item>
        <el-form-item label="可见"><el-radio-group v-model="menuForm.visible"><el-radio :value="1">可见</el-radio><el-radio :value="0">隐藏</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="menuDialogVisible=false">取消</el-button><el-button type="primary" @click="saveMenu">确定</el-button></template>
    </el-dialog>
    <el-dialog v-model="buttonDialogVisible" :title="isEditButton?'编辑子菜单':'新增子菜单'" width="400px">
      <el-form :model="buttonForm" label-width="90px" size="small">
        <el-form-item label="名称"><el-input v-model="buttonForm.menuName" maxlength="10" /></el-form-item>
        <el-form-item label="路由"><el-input v-model="buttonForm.path" maxlength="50" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="buttonForm.sort" :min="0" controls-position="right" /></el-form-item>
        <el-form-item label="可见"><el-radio-group v-model="buttonForm.visible"><el-radio :value="1">可见</el-radio><el-radio :value="0">隐藏</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="buttonDialogVisible=false">取消</el-button><el-button type="primary" @click="saveButton">确定</el-button></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
const API = ''
const menuTree = ref([])
const selectedMenu = ref(null)
const buttonList = ref([])
const menuDialogVisible = ref(false)
const isEditMenu = ref(false)
const menuForm = ref({ id:'', menuName:'', parentId:null, path:'', sort:0, visible:1 })
const buttonDialogVisible = ref(false)
const isEditButton = ref(false)
const buttonForm = ref({ id:'', menuName:'', path:'', sort:0, visible:1 })
const menuTreeOptions = computed(()=>[{id:0,menuName:'顶级菜单',children:menuTree.value}])
function loadMenuTree(){axios.get(API+'/menu/tree').then(res=>{if(res.data.code===200)menuTree.value=res.data.data})}
function selectMenu(row){selectedMenu.value=row;axios.get(API+'/menu/buttons/'+row.id).then(res=>{if(res.data.code===200)buttonList.value=res.data.data})}
function openAddMenuDialog(){isEditMenu.value=false;menuForm.value={id:'',menuName:'',parentId:null,path:'',sort:0,visible:1};menuDialogVisible.value=true}
function openEditMenuDialog(row){isEditMenu.value=true;menuForm.value={id:row.id,menuName:row.menuName,parentId:row.parentId,path:row.path,sort:row.sort,visible:row.visible};menuDialogVisible.value=true}
function saveMenu(){const url=isEditMenu.value?API+'/menu/update':API+'/menu/add';const data={menuName:menuForm.value.menuName,parentId:menuForm.value.parentId||0,path:menuForm.value.path,sort:menuForm.value.sort,visible:menuForm.value.visible};if(isEditMenu.value)data.id=menuForm.value.id;axios.post(url,data).then(res=>{if(res.data.code===200){ElMessage.success(isEditMenu.value?'修改成功':'新增成功');menuDialogVisible.value=false;loadMenuTree()}})}
function openAddButtonDialog(){isEditButton.value=false;buttonForm.value={id:'',menuName:'',path:'',sort:0,visible:1};buttonDialogVisible.value=true}
function openEditButtonDialog(row){isEditButton.value=true;buttonForm.value={id:row.id,menuName:row.mname,path:row.path,sort:row.sort,visible:row.visible};buttonDialogVisible.value=true}
function saveButton(){const url=isEditButton.value?API+'/menu/updateButton':API+'/menu/addButton';const data={menuName:buttonForm.value.menuName,parentId:selectedMenu.value?.id,path:buttonForm.value.path,sort:buttonForm.value.sort,visible:buttonForm.value.visible};if(isEditButton.value)data.id=buttonForm.value.id;axios.post(url,data).then(res=>{if(res.data.code===200){ElMessage.success(isEditButton.value?'修改成功':'新增成功');buttonDialogVisible.value=false;if(selectedMenu.value)selectMenu(selectedMenu.value)}})}
onMounted(()=>{loadMenuTree()})
</script>
<style scoped>
.page-flex { display:flex; gap:16px; }
.page-left { width:330px; flex-shrink:0; }
.page-right { flex:1; min-width:0; }
</style>
