<template>
  <div style="padding: 20px;">
    <!-- 返回按钮 -->
    <el-button type="primary" @click="goBack">返回</el-button>

    <!-- 设备信息 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span style="font-size: 18px; font-weight: bold;">设备信息</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="设备名称">{{ deviceInfo.deviceName }}</el-descriptions-item>
            <el-descriptions-item label="备注名称">{{ deviceInfo.remarkName }}</el-descriptions-item>
            <el-descriptions-item label="设备状态">
              <el-tag v-if="deviceInfo.status === 1" type="success">在线</el-tag>
              <el-tag v-else type="info">离线</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="12">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="所属产品">{{ deviceInfo.productName }}</el-descriptions-item>
            <el-descriptions-item label="接入位置">{{ deviceInfo.locationName }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>
    </el-card>

    <!-- Tab切换 -->
    <el-tabs v-model="activeTab" style="margin-top: 20px;">
      <!-- 设备详情 -->
      <el-tab-pane label="设备详情" name="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备名称">{{ deviceInfo.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="备注名称">{{ deviceInfo.remarkName }}</el-descriptions-item>
          <el-descriptions-item label="节点类型">{{ getLocationTypeName(deviceInfo.locationType) }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ deviceInfo.createUser }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(deviceInfo.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="激活时间">{{ formatDateTime(deviceInfo.createTime) }}</el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <!-- 物模型数据 -->
      <el-tab-pane label="物模型数据" name="model">
        <!-- 功能模块Tab -->
        <el-tabs v-model="activeModule" type="card">
          <el-tab-pane
            v-for="(module, index) in functionModules"
            :key="index"
            :label="module"
            :name="module"
          >
            <!-- 事件管理表格 -->
            <el-table :data="eventList" style="width: 100%" fit>
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="ruleName" label="报警规则" min-width="150" />
              <el-table-column label="处理状态" width="100">
                <template #default="scope">
                  <el-tag v-if="scope.row.handleStatus === 1" type="success">已处理</el-tag>
                  <el-tag v-else type="warning">待处理</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="handleResult" label="处理结果" min-width="180" show-overflow-tooltip />
              <el-table-column prop="dataValue" label="触发报警时的数值" min-width="150" />
              <el-table-column label="处理时间" min-width="160">
                <template #default="scope">
                  {{ formatDateTime(scope.row.handleTime) }}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// Tab状态
const activeTab = ref('detail')
const activeModule = ref('')

// 设备信息
const deviceInfo = reactive({
  id: '',
  deviceName: '',
  remarkName: '',
  productId: '',
  productName: '',
  locationType: '',
  locationId: '',
  locationName: '',
  status: 0,
  createUser: '',
  createTime: ''
})

// 功能模块列表
const functionModules = ref([])

// 事件列表
const eventList = ref([])

// ---------- 加载设备详情 ----------
function loadDeviceInfo() {
  const deviceId = route.query.id
  if (!deviceId) {
    ElMessage.error('设备ID不能为空')
    return
  }

  // 加载设备基本信息
  axios.get('/getDeviceInfo', { params: { id: deviceId } })
    .then(response => {
      if (response.data.code === 200) {
        Object.assign(deviceInfo, response.data.data)

        // 加载功能模块
        loadFunctionModules(deviceInfo.productId)

        // 加载报警记录
        loadAlertRecords(deviceId)
      } else {
        ElMessage.error(response.data.msg || '加载失败')
      }
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('网络错误')
    })
}

// ---------- 加载功能模块 ----------
function loadFunctionModules(productId) {
  if (!productId) {
    return
  }

  axios.get('/getProductFunctions', { params: { productId } })
    .then(response => {
      if (response.data.code === 200) {
        functionModules.value = response.data.data || []
        if (functionModules.value.length > 0) {
          activeModule.value = functionModules.value[0]
        }
      }
    })
    .catch(error => {
      console.error(error)
    })
}

// ---------- 加载报警记录 ----------
function loadAlertRecords(deviceId) {
  axios.get('/getDeviceAlertRecords', { params: { deviceId } })
    .then(response => {
      if (response.data.code === 200) {
        eventList.value = response.data.data || []
      }
    })
    .catch(error => {
      console.error(error)
    })
}

// ---------- 返回 ----------
function goBack() {
  router.back()
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

// ---------- 生命周期 ----------
onMounted(() => {
  loadDeviceInfo()
})
</script>

<style scoped>
/* 保持简洁，使用Element Plus默认样式 */
</style>