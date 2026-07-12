<template>
  <!-- 搜索条件 -->
  <div style="margin-bottom: 20px;">
    所属产品&nbsp;：&nbsp;
    <el-select style="width: 20%; margin-right: 20px" v-model="condForm.productId" placeholder="请选择">
      <el-option v-for="product in productList" :key="product.id" :label="product.productName" :value="product.id" />
    </el-select>
    <el-button type="primary" @click="loadDeviceList">搜索</el-button>
  </div>

  <!-- 添加按钮 -->
  <div style="text-align: left; margin-bottom: 15px;">
    <el-button type="primary" @click="openDeviceDialog">新增设备</el-button>
  </div>

   <!-- 表格 -->
    <el-table :data="deviceList" style="width: 100%" fit header-align="center" align="center">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="deviceName" label="设备名称" width="150" show-overflow-tooltip />
      <el-table-column prop="remarkName" label="备注名称" width="150" show-overflow-tooltip />
      <el-table-column prop="productName" label="所属产品" width="120" />
      <el-table-column prop="locationName" label="接入位置" width="120" />
      <el-table-column label="节点类型" width="100">
        <template #default="scope">
          {{ getLocationTypeName(scope.row.locationType) }}
        </template>
      </el-table-column>
      <el-table-column prop="createUser" label="创建人" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-button type="danger" size="small" link @click="delDevice(scope.row.id)">删除</el-button>
          <el-button type="primary" size="small" link @click="showDeviceInfo(scope.row)">编辑</el-button>
          <el-button type="success" size="small" link @click="viewDevice(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

  <!-- 分页 -->
  <el-pagination
    style="margin-top: 20px;"
    size="small"
    background
    layout="prev, pager, next"
    :total="total"
    :current-page="condForm.pageNum"
    @current-change="doDevicePage"
  />

  <!-- 新增/编辑对话框 -->
  <el-dialog
    v-model="deviceDialogVisible"
    :title="isEdit ? '编辑设备' : '新增设备'"
    width="45%"
    @close="cleanDeviceForm"
  >
    <el-form :model="deviceForm" label-width="100px" style="max-width: 500px; margin: 0 auto;">
      <el-form-item label="设备名称" required>
        <el-input v-model="deviceForm.deviceName" placeholder="请输入" maxlength="15" show-word-limit />
      </el-form-item>
      <el-form-item label="备注名称" required>
        <el-input v-model="deviceForm.remarkName" placeholder="请输入" maxlength="15" show-word-limit />
      </el-form-item>
      <el-form-item label="所属产品" required>
        <el-select v-model="deviceForm.productId" placeholder="请选择" style="width: 100%">
          <el-option v-for="product in productList" :key="product.id" :label="product.productName" :value="product.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="接入类别" required>
        <el-radio-group v-model="deviceForm.locationType">
          <el-radio :value="3">老人</el-radio>
          <el-radio :value="1">房间</el-radio>
          <el-radio :value="2">床位</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="接入位置" required>
        <el-cascader
          v-if="deviceForm.locationType === 1 || deviceForm.locationType === 2"
          v-model="selectedLocation"
          :options="locationOptions"
          :props="{ checkStrictly: true }"
          placeholder="请选择"
          style="width: 100%"
          @change="handleLocationChange"
        />
        <el-select v-else-if="deviceForm.locationType === 3" v-model="deviceForm.locationId" placeholder="请选择老人" style="width: 100%">
          <el-option v-for="elderly in elderlyList" :key="elderly.id" :label="elderly.realName" :value="elderly.id" />
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 30%;">
        <el-button type="primary" round @click="saveDevice">确定</el-button>
        <el-button type="warning" round @click="cancelDialog">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 对话框状态
const deviceDialogVisible = ref(false)
const isEdit = ref(false)

// 表单对象
const deviceForm = reactive({
  id: null,
  deviceName: '',
  remarkName: '',
  productId: null,
  locationType: 3, // 默认老人
  locationId: null,
  status: 0
})

// 当前请求URL
let url = ''

// 查询条件
const condForm = reactive({
  productId: null,
  pageNum: 1,
  pageSize: 10
})

// 列表数据
const deviceList = ref([])
const total = ref(0)

// 位置选项（楼层->房间->床位）
const selectedLocation = ref([])
const locationOptions = ref([])
const elderlyList = ref([])
const productList = ref([])

// ---------- 加载列表 ----------
function loadDeviceList() {
  axios.post('/devicePage', condForm)
    .then(response => {
      if (response.data.code === 200) {
        deviceList.value = response.data.devices || []
        total.value = response.data.total || 0
      } else {
        ElMessage.error(response.data.msg || '加载失败')
      }
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('加载设备列表失败')
    })
}

// ---------- 分页 ----------
function doDevicePage(pageNum) {
  condForm.pageNum = pageNum
  loadDeviceList()
}

// ---------- 新增对话框 ----------
async function openDeviceDialog() {
  isEdit.value = false
  url = '/saveDevice'
  await loadLocationData()
  await loadElderlyList()
  deviceDialogVisible.value = true
}

// ---------- 编辑回显 ----------
async function showDeviceInfo(row) {
  isEdit.value = true
  deviceForm.id = row.id
  deviceForm.deviceName = row.deviceName
  deviceForm.remarkName = row.remarkName
  deviceForm.productId = row.productId
  deviceForm.locationType = row.locationType
  deviceForm.locationId = row.locationId
  deviceForm.status = row.status

  url = '/updateDevice'

  await loadLocationData()
  await loadElderlyList()
  await loadProductList()

  // 如果是房间或床位，设置级联选择器的值
  if (row.locationType === 1 || row.locationType === 2) {
    // TODO: 需要根据locationId反推级联路径
    selectedLocation.value = []
  }

  deviceDialogVisible.value = true
}

// ---------- 保存 ----------
function saveDevice() {
  // 验证必填字段
  if (!deviceForm.deviceName) {
    ElMessage.warning('请输入设备名称')
    return
  }
  if (!deviceForm.remarkName) {
    ElMessage.warning('请输入备注名称')
    return
  }
  if (!deviceForm.productId) {
    ElMessage.warning('请选择所属产品')
    return
  }
  if (!deviceForm.locationType) {
    ElMessage.warning('请选择接入类别')
    return
  }
  if (!deviceForm.locationId) {
    ElMessage.warning('请选择接入位置')
    return
  }

  axios.post(url, deviceForm)
    .then(response => {
      if (response.data.code === 200) {
        deviceDialogVisible.value = false
        cleanDeviceForm()
        doDevicePage(1)
      }
      ElMessage(response.data.msg)
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('操作失败')
    })
}

// ---------- 清空表单 ----------
function cleanDeviceForm() {
  deviceForm.id = null
  deviceForm.deviceName = ''
  deviceForm.remarkName = ''
  deviceForm.productId = null
  deviceForm.locationType = 3
  deviceForm.locationId = null
  deviceForm.status = 0
  selectedLocation.value = []
}

// ---------- 取消对话框 ----------
function cancelDialog() {
  deviceDialogVisible.value = false
  cleanDeviceForm()
}

// ---------- 删除 ----------
function delDevice(id) {
  ElMessageBox.confirm('确定要删除该设备吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    axios.post('/deleteDevice', { id })
      .then(response => {
        if (response.data.code === 200) {
          doDevicePage(1)
        }
        ElMessage(response.data.msg)
      })
      .catch(error => {
        console.error(error)
        ElMessage.error('删除失败')
      })
  }).catch(() => {})
}

// ---------- 查看 ----------
function viewDevice(row) {
  // TODO: 跳转到设备详情页
  ElMessage.info('查看功能待开发')
}

// ---------- 工具函数 ----------
function getLocationTypeName(type) {
  const map = { 1: '房间', 2: '床位', 3: '设备' }
  return map[type] || '-'
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '-'
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

// ---------- 加载位置数据 ----------
async function loadLocationData() {
  try {
    // 加载楼层
    const floorRes = await axios.get('/floorList')
    if (floorRes.data.code === 200) {
      const floors = floorRes.data.data || []
      locationOptions.value = await Promise.all(floors.map(async floor => {
        // 加载房间
        const roomRes = await axios.get('/roomList', { params: { floorId: floor.id } })
        const rooms = roomRes.data.data || []

        return {
          value: floor.id,
          label: floor.floorName,
          children: rooms.map(room => ({
            value: room.id,
            label: room.roomNumber + '房间',
            children: [] // TODO: 加载床位
          }))
        }
      }))
    }
  } catch (error) {
    console.error('加载位置数据失败', error)
  }
}

// ---------- 加载老人列表 ----------
async function loadElderlyList() {
  try {
    const res = await axios.post('/elderlyPage', { pageNum: 1, pageSize: 100 })
    if (res.data.code === 200) {
      elderlyList.value = res.data.elderlies || []
    }
  } catch (error) {
    console.error('加载老人列表失败', error)
  }
}

// ---------- 加载产品列表 ----------
async function loadProductList() {
  try {
    const res = await axios.get('/productList')
    if (res.data.code === 200) {
      productList.value = res.data.data || []
    }
  } catch (error) {
    console.error('加载产品列表失败', error)
  }
}

// ---------- 处理位置变化 ----------
function handleLocationChange(value) {
  if (value && value.length > 0) {
    deviceForm.locationId = value[value.length - 1]
  }
}

// ---------- 生命周期 ----------
onMounted(() => {
  loadProductList()  // 先加载产品列表
  loadDeviceList()
})
</script>

<style scoped>
.el-table th {
  text-align: center !important;
}

.el-table td {
  text-align: center !important;
  white-space: nowrap;
}

/* 确保表头和内容对齐 */
.el-table .cell {
  padding-left: 0 !important;
  padding-right: 0 !important;
}
</style>