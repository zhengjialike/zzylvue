<template>
  <div style="padding: 20px;">
    <!-- 搜索区域 -->
    <el-card style="margin-bottom: 20px;">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="退款编号">
          <el-input v-model="searchForm.refundNo" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="申请人">
          <el-input v-model="searchForm.applicantName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="申请时间">
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
      <el-tab-pane label="退款处理中" name="0"></el-tab-pane>
      <el-tab-pane label="退款成功" name="1"></el-tab-pane>
      <el-tab-pane label="退款失败" name="2"></el-tab-pane>
    </el-tabs>

    <!-- 退款列表 -->
    <el-table :data="refundList" fit style="width: 100%">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="refundNo" label="退款编号" min-width="180" />
      <el-table-column prop="orderNo" label="订单编号" min-width="180" />
      <el-table-column prop="refundAmount" label="退款金额（元）" width="120" />
      <el-table-column prop="applicantName" label="申请人" width="100" />
      <el-table-column prop="applyTime" label="申请时间" min-width="160" />
      <el-table-column prop="refundTime" label="退款时间" min-width="160" />
      <el-table-column label="订单状态" width="100">
        <template #default="scope">
          <el-tag :type="getOrderStatusType(scope.row.orderStatus)">{{ scope.row.orderStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="退款状态" width="120">
        <template #default="scope">
          <el-tag :type="getRefundStatusType(scope.row.refundStatus)">{{ scope.row.refundStatusText }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.refundStatus === 0"
            link
            type="success"
            size="small"
            @click="approveRefund(scope.row)">允许退款</el-button>
          <el-button link type="primary" size="small" @click="viewRefund(scope.row)">查看</el-button>
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
      @size-change="loadRefunds"
      @current-change="loadRefunds"
    />

    <!-- 查看退款记录对话框 -->
    <el-dialog v-model="detailVisible" title="查看退款记录" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="退款编号">{{ refundDetail.refundNo }}</el-descriptions-item>
        <el-descriptions-item label="订单编号">{{ refundDetail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ refundDetail.orderStatus }}</el-descriptions-item>
        <el-descriptions-item label="退款状态">
          <el-tag :type="getRefundStatusType(refundDetail.refundStatus)">{{ refundDetail.refundStatusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请人">{{ refundDetail.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ refundDetail.applyTime }}</el-descriptions-item>
        <el-descriptions-item label="退款原因">{{ refundDetail.refundReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="退款渠道">{{ refundDetail.refundChannel }}</el-descriptions-item>
        <el-descriptions-item label="退款方式">{{ refundDetail.refundMethod }}</el-descriptions-item>
        <el-descriptions-item v-if="refundDetail.refundTime !== '-'" label="退款时间">{{ refundDetail.refundTime }}</el-descriptions-item>
        <el-descriptions-item v-if="refundDetail.refundAmount" label="退款金额">{{ refundDetail.refundAmount }} 元</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  refundNo: '',
  orderNo: '',
  applicantName: ''
})

const dateRange = ref([])

// Tab状态
const activeTab = ref('all')

// 分页
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 退款列表
const refundList = ref([])

// 查看详情
const detailVisible = ref(false)
const refundDetail = reactive({})

// ---------- 加载退款列表 ----------
function loadRefunds() {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    refundNo: searchForm.refundNo,
    orderNo: searchForm.orderNo,
    applicantName: searchForm.applicantName,
    status: activeTab.value === 'all' ? null : parseInt(activeTab.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0]
    params.endTime = dateRange.value[1]
  }

  axios.post('/refund/pageList', params)
    .then(response => {
      if (response.data.code === 200) {
        refundList.value = response.data.data || []
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
  loadRefunds()
}

// ---------- 重置 ----------
function resetSearch() {
  searchForm.refundNo = ''
  searchForm.orderNo = ''
  searchForm.applicantName = ''
  dateRange.value = []
  activeTab.value = 'all'
  pageNum.value = 1
  loadRefunds()
}

// ---------- Tab切换 ----------
function handleTabChange() {
  pageNum.value = 1
  loadRefunds()
}

// ---------- 查看退款详情 ----------
function viewRefund(row) {
  axios.get('/refund/getDetail', { params: { refundId: row.id } })
    .then(response => {
      if (response.data.code === 200) {
        Object.assign(refundDetail, response.data.data)
        detailVisible.value = true
      } else {
        ElMessage.error(response.data.msg || '加载失败')
      }
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('网络错误')
    })
}

// ---------- 允许退款 ----------
function approveRefund(row) {
  ElMessageBox.confirm('确认对该订单执行退款操作？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    axios.post('/refund/approve', { refundId: row.id })
      .then(response => {
        if (response.data.code === 200) {
          ElMessage.success('退款成功')
          loadRefunds()
        } else {
          ElMessage.error(response.data.msg || '操作失败')
        }
      })
      .catch(error => {
        console.error(error)
        ElMessage.error('网络错误')
      })
  }).catch(() => {})
}

// ---------- 工具函数 ----------
function getOrderStatusType(status) {
  const map = { '待支付': 'warning', '待执行': 'info', '已执行': 'primary', '已完成': 'success', '已退款': 'warning', '已关闭': 'info' }
  return map[status] || 'info'
}

function getRefundStatusType(status) {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

// ---------- 生命周期 ----------
onMounted(() => {
  loadRefunds()
})
</script>

<style scoped>
/* 使用Element Plus默认样式 */
</style>