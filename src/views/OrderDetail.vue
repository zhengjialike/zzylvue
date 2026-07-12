<template>
  <div style="padding: 20px;">
    <!-- 返回按钮 -->
    <el-button type="primary" @click="goBack">返回</el-button>

    <!-- 订单进度 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span style="font-size: 18px; font-weight: bold;">订单进度</span>
      </template>
      <el-steps :active="getStepActive(orderInfo.status)" align-center>
        <el-step title="已下单" :description="formatDateTime(orderInfo.createTime)"></el-step>
        <el-step title="已支付" :description="formatDateTime(orderInfo.paidAt)"></el-step>
        <el-step title="已执行"></el-step>
        <el-step title="已完成"></el-step>
      </el-steps>
    </el-card>

    <!-- 订单信息 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span style="font-size: 18px; font-weight: bold;">订单信息</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ orderInfo.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="期望服务时间">{{ formatDateTime(orderInfo.expectedServiceTime) }}</el-descriptions-item>
        <el-descriptions-item label="老人姓名">{{ orderInfo.elderlyName }}</el-descriptions-item>
        <el-descriptions-item label="床位号">{{ orderInfo.bedNumber }}</el-descriptions-item>
        <el-descriptions-item label="护理项目名称">{{ orderInfo.nursingItemName }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">{{ orderInfo.orderAmount }} 元</el-descriptions-item>
        <el-descriptions-item label="下单人">{{ orderInfo.customerName }}</el-descriptions-item>
        <el-descriptions-item label="下单人手机号">{{ orderInfo.customerPhone }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ orderInfo.cancelReason || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 订单信息
const orderInfo = reactive({
  id: '',
  orderNo: '',
  elderlyName: '',
  bedNumber: '',
  nursingItemName: '',
  orderAmount: '',
  expectedServiceTime: '',
  customerName: '',
  customerPhone: '',
  createTime: '',
  paidAt: '',
  status: 0,
  cancelReason: ''
})

// ---------- 加载订单详情 ----------
function loadOrderDetail() {
  const orderId = route.query.id
  if (!orderId) {
    ElMessage.error('订单ID不能为空')
    return
  }

  axios.get('/order/getDetail', { params: { orderId } })
    .then(response => {
      if (response.data.code === 200) {
        Object.assign(orderInfo, response.data.data)
      } else {
        ElMessage.error(response.data.msg || '加载失败')
      }
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('网络错误')
    })
}

// ---------- 返回 ----------
function goBack() {
  router.back()
}

// ---------- 获取步骤激活状态 ----------
function getStepActive(status) {
  if (status >= 3) return 4
  if (status >= 2) return 3
  if (status >= 1 && orderInfo.paidAt) return 2
  return 1
}

// ---------- 格式化时间 ----------
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr || dateTimeStr === '-') return '-'
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
  loadOrderDetail()
})
</script>

<style scoped>
/* 使用Element Plus默认样式 */
</style>