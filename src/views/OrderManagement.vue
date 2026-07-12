<template>
  <div style="padding: 20px;">
    <!-- 搜索区域 -->
    <el-card style="margin-bottom: 20px;">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="老人姓名">
          <el-input v-model="searchForm.elderlyName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="下单人">
          <el-input v-model="searchForm.customerName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Tab切换 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all"></el-tab-pane>
      <el-tab-pane label="待支付" name="0"></el-tab-pane>
      <el-tab-pane label="待执行" name="1"></el-tab-pane>
      <el-tab-pane label="已执行" name="2"></el-tab-pane>
      <el-tab-pane label="已完成" name="3"></el-tab-pane>
      <el-tab-pane label="已退款" name="4"></el-tab-pane>
      <el-tab-pane label="已关闭" name="5"></el-tab-pane>
    </el-tabs>

    <!-- 订单列表 -->
    <el-table :data="orderList" fit style="width: 100%">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="orderNo" label="订单编号" min-width="180" />
      <el-table-column prop="elderlyName" label="老人姓名" width="100" />
      <el-table-column prop="bedNumber" label="床位号" width="80" />
      <el-table-column prop="nursingItemName" label="护理项目名称" min-width="120" />
      <el-table-column prop="orderAmount" label="订单金额（元）" width="120" />
      <el-table-column prop="expectedServiceTime" label="期望服务时间" min-width="160" />
      <el-table-column prop="customerName" label="下单人" width="100" />
      <el-table-column prop="createTime" label="创建时间" min-width="160" />
      <el-table-column label="订单状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.statusText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="交易状态" width="100">
        <template #default="scope">
          <el-tag :type="getTransactionStatusType(scope.row.transactionStatus)">{{ scope.row.transactionStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button
            v-if="canCancel(scope.row.status)"
            link
            type="danger"
            size="small"
            @click="cancelOrder(scope.row)">取消</el-button>
          <el-button
            v-if="canRefund(scope.row)"
            link
            type="warning"
            size="small"
            @click="refundOrder(scope.row)">退款</el-button>
          <el-button link type="primary" size="small" @click="viewOrder(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; justify-content: flex-end;"
      @size-change="loadOrders"
      @current-change="loadOrders"
    />

    <!-- 取消订单对话框 -->
    <el-dialog v-model="cancelVisible" title="取消订单" width="400px">
      <el-form :model="cancelForm" label-width="80px">
        <el-form-item label="取消原因">
          <el-input v-model="cancelForm.reason" type="textarea" :rows="3" placeholder="请输入取消原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCancel">确定</el-button>
      </template>
    </el-dialog>

    <!-- 退款对话框 -->
    <el-dialog v-model="refundVisible" title="申请退款" width="400px">
      <el-form :model="refundForm" label-width="80px">
        <el-form-item label="退款原因">
          <el-input v-model="refundForm.reason" type="textarea" :rows="3" placeholder="请输入退款原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="refundVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRefund">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  elderlyName: '',
  customerName: ''
})

const dateRange = ref([])

// Tab状态
const activeTab = ref('all')

// 分页
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 订单列表
const orderList = ref([])

// 取消订单
const cancelVisible = ref(false)
const cancelForm = reactive({ orderId: null, reason: '' })

// 退款
const refundVisible = ref(false)
const refundForm = reactive({ orderId: null, reason: '' })

// ---------- 加载订单列表 ----------
function loadOrders() {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    orderNo: searchForm.orderNo,
    elderlyName: searchForm.elderlyName,
    customerName: searchForm.customerName,
    status: activeTab.value === 'all' ? null : parseInt(activeTab.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0]
    params.endTime = dateRange.value[1]
  }

  axios.post('/order/pageList', params)
    .then(response => {
      if (response.data.code === 200) {
        orderList.value = response.data.data || []
        total.value = response.data.total || 0
      } else {
        ElMessage.error(response.data.msg || '加载失败')
      }
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('网络错误')
    })
}

// ---------- 搜索 ----------
function handleSearch() {
  pageNum.value = 1
  loadOrders()
}

// ---------- 重置 ----------
function resetSearch() {
  searchForm.orderNo = ''
  searchForm.elderlyName = ''
  searchForm.customerName = ''
  dateRange.value = []
  activeTab.value = 'all'
  pageNum.value = 1
  loadOrders()
}

// ---------- Tab切换 ----------
function handleTabChange() {
  pageNum.value = 1
  loadOrders()
}

// ---------- 取消订单 ----------
function cancelOrder(row) {
  cancelForm.orderId = row.id
  cancelForm.reason = ''
  cancelVisible.value = true
}

function confirmCancel() {
  axios.post('/order/cancel', {
    orderId: cancelForm.orderId,
    reason: cancelForm.reason
  }).then(response => {
    if (response.data.code === 200) {
      ElMessage.success('取消成功')
      cancelVisible.value = false
      loadOrders()
    } else {
      ElMessage.error(response.data.msg || '取消失败')
    }
  }).catch(error => {
    console.error(error)
    ElMessage.error('网络错误')
  })
}

// ---------- 申请退款 ----------
function refundOrder(row) {
  refundForm.orderId = row.id
  refundForm.reason = ''
  refundVisible.value = true
}

function confirmRefund() {
  axios.post('/order/refund', {
    orderId: refundForm.orderId,
    reason: refundForm.reason
  }).then(response => {
    if (response.data.code === 200) {
      ElMessage.success('申请退款成功')
      refundVisible.value = false
      loadOrders()
    } else {
      ElMessage.error(response.data.msg || '申请退款失败')
    }
  }).catch(error => {
    console.error(error)
    ElMessage.error('网络错误')
  })
}

// ---------- 查看订单 ----------
function viewOrder(row) {
  router.push({
    path: '/orderDetail',
    query: { id: row.id }
  })
}

// ---------- 工具函数 ----------
function getStatusType(status) {
  const map = { 0: 'warning', 1: 'info', 2: 'primary', 3: 'success', 4: 'danger', 5: 'info' }
  return map[status] || 'info'
}

function getTransactionStatusType(status) {
  if (status === '已支付') return 'success'
  if (status === '退款成功') return 'warning'
  if (status === '已关闭') return 'info'
  return 'warning'
}

function canCancel(status) {
  return status === 0 || status === 1 // 待支付或待执行可以取消
}

function canRefund(row) {
  return row.transactionStatus === '已支付' && row.status !== 3 // 已支付且未完成可以退款
}

// ---------- 生命周期 ----------
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
/* 使用Element Plus默认样式 */
</style>