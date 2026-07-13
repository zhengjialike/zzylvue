<template>
  <!-- 添加按钮 -->
  <div style="text-align: left; margin-bottom: 15px;">
    <el-button type="primary" @click="openRoomTypeDialog">新增房型</el-button>
  </div>

  <!-- 表格 -->
  <el-table :data="roomTypeList" style="width: 100%" fit>
    <el-table-column type="index" width="60" label="序号" />
    <el-table-column label="房间图片" width="100">
      <template #default="scope">
        <img :src="scope.row.image" width="60px" height="60px" style="object-fit: cover;" />
      </template>
    </el-table-column>
    <el-table-column prop="typeName" label="房间类型" min-width="120" />
    <el-table-column prop="price" label="床位费用（元/月）" width="150" />
    <el-table-column prop="createUser" label="创建人" width="100" />
    <el-table-column prop="description" label="房型介绍" min-width="200" show-overflow-tooltip />
    <el-table-column prop="createTime" label="创建时间" width="180">
      <template #default="scope">
        {{ formatDateTime(scope.row.createTime) }}
      </template>
    </el-table-column>
    <el-table-column label="状态" width="100">
      <template #default="scope">
        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
          {{ scope.row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="220" fixed="right">
      <template #default="scope">
        <el-button
          type="warning"
          size="small"
          @click="delRoomType(scope.row.id)"
          :disabled="hasRooms(scope.row)">删除</el-button>
        <el-button type="primary" size="small" @click="showRoomTypeInfo(scope.row)">编辑</el-button>
        <el-button
          :type="scope.row.status === 1 ? 'info' : 'success'"
          size="small"
          @click="toggleStatus(scope.row)">
          {{ scope.row.status === 1 ? '禁用' : '启用' }}
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
    :current-page="pageNum"
    @current-change="doRoomTypePage"
    style="margin-top: 20px;" />

  <!-- 新增/编辑对话框 -->
  <el-dialog
    v-model="roomTypeDialogVisible"
    :title="dialogTitle"
    width="45%"
    @close="cleanRoomTypeForm">

    <el-form
      :model="roomTypeForm"
      label-width="100px"
      style="max-width: 500px; margin: 0 auto;">

      <el-form-item label="房型类型" required>
        <el-input
          v-model="roomTypeForm.typeName"
          placeholder="请输入"
          maxlength="10"
          show-word-limit />
      </el-form-item>

      <el-form-item label="床位费用" required>
        <el-input-number
          v-model="roomTypeForm.price"
          :min="0"
          :precision="2"
          :step="100"
          controls-position="right"
          style="width: 100%;" />
      </el-form-item>

      <el-form-item label="状态" required>
        <el-radio-group v-model="roomTypeForm.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="房型图片" required>
        <el-upload
          class="avatar-uploader"
          action="http://localhost:8080/upload"
          :show-file-list="false"
          name="mf"
          accept="image/png,image/jpeg,image/jpg"
          :before-upload="beforeUpload"
          @success="handleImageSuccess">
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div style="color: #999; font-size: 12px; margin-top: 5px;">
          图片大小不超过2M，仅支持PNG、JPG、JPEG格式
        </div>
      </el-form-item>

      <el-form-item label="房型介绍" required>
        <el-input
          v-model="roomTypeForm.description"
          type="textarea"
          :rows="3"
          placeholder="请输入"
          maxlength="50"
          show-word-limit />
      </el-form-item>

      <el-form-item style="text-align: center; margin-top: 30px;">
        <el-button type="primary" @click="saveRoomType">确定</el-button>
        <el-button @click="cancelDialog">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 对话框状态
const roomTypeDialogVisible = ref(false)
const dialogTitle = ref('')

// 当前用户
const currentUser = ref(null)

// 表单对象
const roomTypeForm = reactive({
  id: '',
  typeName: '',
  price: 0,
  status: 1,
  image: '',
  description: '',
  createUser: ''
})

// 当前请求URL（新增/编辑）
let url = ''

// 图片回显
const imageUrl = ref(null)

// 列表数据
const roomTypeList = ref([])
const total = ref(0)
const pageNum = ref(1)

// ---------- 加载列表 ----------
function loadRoomTypeList() {
  axios.post('/roomTypePage', {
    pageNum: pageNum.value,
    pageSize: 10
  })
    .then(response => {
      roomTypeList.value = response.data.roomTypes || []
      total.value = response.data.total || 0
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('加载房型列表失败')
    })
}

// ---------- 分页 ----------
function doRoomTypePage(page) {
  pageNum.value = page
  loadRoomTypeList()
}

// ---------- 新增对话框 ----------
function openRoomTypeDialog() {
  dialogTitle.value = '新增房型'
  url = '/saveRoomType'
  roomTypeDialogVisible.value = true
}

// ---------- 编辑回显 ----------
function showRoomTypeInfo(row) {
  dialogTitle.value = '编辑房型'
  roomTypeForm.id = row.id
  roomTypeForm.typeName = row.typeName
  roomTypeForm.price = row.price
  roomTypeForm.status = row.status
  roomTypeForm.image = row.image
  roomTypeForm.description = row.description
  roomTypeForm.createUser = row.createUser
  imageUrl.value = row.image
  url = '/updateRoomType'
  roomTypeDialogVisible.value = true
}

// ---------- 图片上传前校验 ----------
function beforeUpload(file) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!')
    return false
  }
  return true
}

// ---------- 图片上传成功回调 ----------
function handleImageSuccess(path) {
  imageUrl.value = path
  roomTypeForm.image = path
}

// ---------- 检查是否有房间 ----------
function hasRooms(row) {
  let result = false
  axios.get('/checkRoomTypeHasRooms?id=' + row.id).then(response => {
    if (response.data.code === 200) {
      result = response.data.hasRooms
      row._hasRooms = result
    }
  })
  return row._hasRooms || false
}

// ---------- 加载当前用户 ----------
function loadCurrentUser() {
  axios.get('/loadInfo').then(response => {
    if (response.data) {
      currentUser.value = response.data
      roomTypeForm.createUser = response.data.uname || ''
    }
  })
}

// ---------- 保存 ----------
function saveRoomType() {
  // 表单验证
  if (!roomTypeForm.typeName) {
    ElMessage.warning('请输入房型类型')
    return
  }
  if (!roomTypeForm.price || roomTypeForm.price <= 0) {
    ElMessage.warning('请输入有效的床位费用')
    return
  }
  if (!roomTypeForm.image) {
    ElMessage.warning('请上传房型图片')
    return
  }
  if (!roomTypeForm.description) {
    ElMessage.warning('请输入房型介绍')
    return
  }

  if (currentUser.value) {
    roomTypeForm.createUser = currentUser.value.uname || ''
  }

  axios.post(url, roomTypeForm)
    .then(response => {
      if (response.data.code === 200) {
        roomTypeDialogVisible.value = false
        cleanRoomTypeForm()
        loadRoomTypeList()
        ElMessage.success(response.data.msg)
      } else {
        ElMessage.error(response.data.msg)
      }
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('操作失败')
    })
}

// ---------- 清空表单 ----------
function cleanRoomTypeForm() {
  roomTypeForm.id = ''
  roomTypeForm.typeName = ''
  roomTypeForm.price = 0
  roomTypeForm.status = 1
  roomTypeForm.image = ''
  roomTypeForm.description = ''
  roomTypeForm.createUser = ''
  imageUrl.value = null
}

// ---------- 取消对话框 ----------
function cancelDialog() {
  roomTypeDialogVisible.value = false
  cleanRoomTypeForm()
}

// ---------- 删除 ----------
function delRoomType(id) {
  ElMessageBox.confirm('确定要删除该房型吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    axios.post('/deleteRoomType', { id })
      .then(response => {
        if (response.data.code === 200) {
          loadRoomTypeList()
          ElMessage.success(response.data.msg)
        } else {
          ElMessage.error(response.data.msg)
        }
      })
      .catch(error => {
        console.error(error)
        ElMessage.error('删除失败')
      })
  }).catch(() => {
    // 用户取消
  })
}

// ---------- 切换状态 ----------
function toggleStatus(row) {
  const newStatus = row.status === 1 ? 0 : 1
  axios.post('/toggleRoomTypeStatus', {
    id: row.id,
    status: newStatus
  })
    .then(response => {
      if (response.data.code === 200) {
        loadRoomTypeList()
        ElMessage.success(response.data.msg)
      } else {
        ElMessage.error(response.data.msg)
      }
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('更新状态失败')
    })
}

// ---------- 格式化日期时间 ----------
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '-'

  // 处理 ISO 8601 格式：2026-07-11T07:59:29.000+00:00
  // 转换为：2026-07-11 15:59:29
  try {
    const date = new Date(dateTimeStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (e) {
    return dateTimeStr
  }
}

// ---------- 生命周期 ----------
onMounted(() => {
  loadRoomTypeList()
  loadCurrentUser()
})
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}

.avatar-uploader .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
}

.avatar-uploader .avatar-uploader-icon:hover {
  border-color: #409eff;
}
</style>