<template>
  <!-- 搜索条件 -->
  <div>
    护理项名称&nbsp;：&nbsp;
    <el-input style="width:20%;margin-right:20px" v-model="condForm.itemname" />
    状态&nbsp;：&nbsp;
    <el-select style="width:20%;margin-right:20px" placeholder="请选择" v-model="condForm.islock">
      <el-option value="启用">启用</el-option>
      <el-option value="禁用">禁用</el-option>
    </el-select>
    <el-button type="primary" @click="loadNursingItemList">搜索</el-button>
  </div>

  <!-- 添加按钮 -->
  <div style="text-align:left;">
    <el-button type="primary" @click="openNursingItemDialog">添加护理项目</el-button>
  </div>

  <!-- 表格 -->
  <el-table :data="nursingItemList" style="width:100%" fit>
    <el-table-column type="index" width="50" />
    <el-table-column prop="itemname" label="名称" />
    <el-table-column prop="price" label="价格" width="100" />
    <el-table-column prop="unit" label="单位" width="100" />
    <el-table-column prop="sort" label="排序" width="100" />
    <el-table-column label="图片">
      <template #default="scope">
        <img :src="scope.row.image" width="35px" height="35px" />
      </template>
    </el-table-column>
    <el-table-column label="状态" width="100">
      <template #default="scope">
        <span v-if="scope.row.islock === '启用'" style="color:dodgerblue;">启用</span>
        <span v-else style="color:crimson;">禁用</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="280">
      <template #default="scope">
        <el-button type="warning" size="small" @click="delNursingItem(scope.row.id)">删除</el-button>
        <el-button type="primary" size="small" @click="showNursingInfo(scope.row)">编辑</el-button>
        <el-button type="success" size="small" @click="updateIsLock(scope.row)">
          {{ scope.row.islock === '启用' ? '禁用' : '启用' }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页 -->
  <el-pagination
    size="small"
    background
    layout="prev, pager, next"
    :total="total"
    :current-page="condForm.pageNum"
    @current-change="doNursingItemPage"
  />

  <!-- 新增/编辑对话框 -->
  <el-dialog
    v-model="nursingItemDialogVisible"
    title="护理项目信息"
    width="40%"
    @close="cleanNursingItemForm"
  >
    <el-form label-width="auto" style="margin-left:5%;margin-right:5%;max-width:600px">
      <el-form-item label="护理项目名称">
        <el-input v-model="nursingItemForm.itemname" />
      </el-form-item>
      <el-form-item label="价格">
        <el-input-number
          v-model="nursingItemForm.price"
          :precision="2"
          :step="0.1"
          :max="10"
        />
      </el-form-item>
      <el-form-item label="单位">
        <el-input v-model="nursingItemForm.unit" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number
          v-model="nursingItemForm.sort"
          :min="1"
          :max="10"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="nursingItemForm.islock">
          <el-radio value="启用">启用</el-radio>
          <el-radio value="禁用">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="照片">
        <el-upload
          class="avatar-uploader"
          action="http://localhost:8080/upload"
          :show-file-list="false"
          name="mf"
          @success="handleNursingPhotoSuccess"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="护理项目描述">
        <el-input v-model="nursingItemForm.description" type="textarea" />
      </el-form-item>
      <el-form-item style="margin-left:40%">
        <el-button type="primary" round @click="saveNursingItem">确认</el-button>
        <el-button type="warning" round @click="cancelDialog">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 对话框状态
const nursingItemDialogVisible = ref(false)

// 表单对象
const nursingItemForm = reactive({
  id: '',
  itemname: '',
  price: '',
  unit: '',
  sort: '',
  islock: '启用',
  image: '',
  description: ''
})

// 当前请求URL（新增/编辑）
let url = ''

// 图片回显
const imageUrl = ref(null)

// 查询条件
const condForm = reactive({
  itemname: '',
  islock: '',
  pageNum: 1,
  pageSize: 10
})

// 列表数据
const nursingItemList = ref([])
const total = ref(0)

// ---------- 加载列表 ----------
function loadNursingItemList() {
  axios.post('/nursingItemPage', condForm)
    .then(response => {
      nursingItemList.value = response.data.nursingItems || []
      total.value = response.data.total || 0
    })
    .catch(error => {
      console.error(error)
    })
}

// ---------- 分页 ----------
function doNursingItemPage(pageNum) {
  condForm.pageNum = pageNum
  loadNursingItemList()
}

// ---------- 新增对话框 ----------
function openNursingItemDialog() {
  url = '/saveNursingItem'   // 注意：原片段为 /saveNursingltme，已修正
  nursingItemDialogVisible.value = true
}

// ---------- 编辑回显 ----------
function showNursingInfo(row) {
  nursingItemForm.id = row.id
  nursingItemForm.itemname = row.itemname
  nursingItemForm.price = row.price
  nursingItemForm.sort = row.sort
  nursingItemForm.unit = row.unit
  nursingItemForm.image = row.image
  nursingItemForm.description = row.description
  nursingItemForm.islock = row.islock
  imageUrl.value = row.image
  url = '/updateNursingItem'
  nursingItemDialogVisible.value = true
}

// ---------- 图片上传成功回调 ----------
function handleNursingPhotoSuccess(path) {
  imageUrl.value = path
  nursingItemForm.image = path
}

// ---------- 保存 ----------
function saveNursingItem() {
  axios.post(url, nursingItemForm)
    .then(response => {
      if (response.data.code === 200) {
        nursingItemDialogVisible.value = false
        cleanNursingItemForm()
        doNursingItemPage(1)
      }
      ElMessage(response.data.msg)
    })
    .catch(error => {
      console.error(error)
    })
}

// ---------- 清空表单 ----------
function cleanNursingItemForm() {
  nursingItemForm.id = ''
  nursingItemForm.itemname = ''
  nursingItemForm.price = ''
  nursingItemForm.sort = ''
  nursingItemForm.unit = ''
  nursingItemForm.image = ''
  nursingItemForm.description = ''
  nursingItemForm.islock = '启用'
  imageUrl.value = null
}

// ---------- 取消对话框 ----------
function cancelDialog() {
  nursingItemDialogVisible.value = false
  cleanNursingItemForm()
}

// ---------- 删除 ----------
function delNursingItem(id) {
  axios.get('/deleteNursingItem?id=' + id)
    .then(response => {
      if (response.data.code === 200) {
        doNursingItemPage(1)
      }
      ElMessage(response.data.msg)
    })
    .catch(error => {
      console.error(error)
    })
}

// ---------- 切换状态 ----------
function updateIsLock(row) {
  const newStatus = row.islock === '启用' ? '禁用' : '启用'
  const params = {
    id: row.id,
    islock: newStatus
  }
  axios.post('/updateNursingItem', params)
    .then(response => {
      if (response.data.code === 200) {
        doNursingItemPage(1)
      }
      ElMessage(response.data.msg)
    })
    .catch(error => {
      console.error(error)
    })
}

// ---------- 生命周期 ----------
onMounted(() => {
  loadNursingItemList()
})
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 80px;
  height: 80px;
  object-fit: cover;
}
.avatar-uploader .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  text-align: center;
  line-height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
}
.avatar-uploader .avatar-uploader-icon:hover {
  border-color: #409eff;
}
</style>
