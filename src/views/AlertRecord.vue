<template>
  <!-- 搜索条件 -->
  <div>
    设备名称&nbsp;：&nbsp;
    <el-input style="width:20%;margin-right:20px" v-model="condForm.deviceName" placeholder="请输入" />
    报警时间&nbsp;：&nbsp;
    <el-date-picker
      style="width:35%;margin-right:20px"
      v-model="dateRange"
      type="daterange"
      range-separator="-"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      value-format="YYYY-MM-DD"
    />
    <el-button type="primary" @click="loadAlertRecordList">搜索</el-button>
    <el-button @click="resetCondForm">重置</el-button>
  </div>

  <!-- Tab切换 -->
  <el-tabs v-model="activeTab" @tab-change="handleTabChange" style="margin-top:15px;">
    <el-tab-pane label="全部" name="all"></el-tab-pane>
    <el-tab-pane label="待处理" name="pending"></el-tab-pane>
    <el-tab-pane label="已处理" name="handled"></el-tab-pane>
  </el-tabs>

  <!-- 表格 -->
  <el-table :data="alertRecordList" style="width:100%" fit>
    <el-table-column type="index" width="60" label="序号" />
    <el-table-column prop="deviceName" label="设备名称" min-width="120" />
    <el-table-column prop="remarkName" label="备注名称" min-width="120" />
    <el-table-column prop="productName" label="所属产品" min-width="180" />
    <el-table-column prop="functionName" label="功能名称" min-width="100" />
    <el-table-column prop="locationName" label="接入位置" min-width="100" />
    <el-table-column prop="dataValue" label="数据值" min-width="120" />
    <el-table-column label="报警时间" min-width="160">
      <template #default="scope">
        {{ formatDateTime(scope.row.alertTime) }}
      </template>
    </el-table-column>
    <el-table-column prop="handleResult" label="处理结果" min-width="180" show-overflow-tooltip />
    <el-table-column prop="handler" label="处理人" min-width="100" />
    <el-table-column label="处理时间" min-width="160">
      <template #default="scope">
        {{ formatDateTime(scope.row.handleTime) }}
      </template>
    </el-table-column>
    <el-table-column label="状态" width="100">
      <template #default="scope">
        <span v-if="scope.row.handleStatus === 1" style="color:dodgerblue;">已处理</span>
        <span v-else style="color:crimson;">待处理</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="100" fixed="right">
      <template #default="scope">
        <el-button
          v-if="scope.row.handleStatus === 0"
          type="primary"
          size="small"
          @click="openHandleDialog(scope.row)"
        >
          处理
        </el-button>
        <span v-else style="color:#999;">处理</span>
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
    @current-change="doAlertRecordPage"
    style="margin-top:15px;"
  />

  <!-- 处理对话框 -->
  <el-dialog
    v-model="handleDialogVisible"
    title="填写处理结果"
    width="40%"
    @close="cleanHandleForm"
  >
    <el-form label-width="auto" style="margin-left:5%;margin-right:5%;max-width:500px">
      <el-form-item label="*处理时间">
        <el-date-picker
          v-model="handleForm.handleTime"
          type="datetime"
          placeholder="请选择处理时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width:100%;"
        />
      </el-form-item>
      <el-form-item label="*处理结果">
        <el-input
          v-model="handleForm.handleResult"
          type="textarea"
          :rows="4"
          maxlength="100"
          show-word-limit
          placeholder="请输入处理结果"
        />
      </el-form-item>
      <el-form-item style="margin-left:30%;margin-top:20px;">
        <el-button type="primary" round @click="submitHandle">确定</el-button>
        <el-button type="info" round @click="cancelHandle">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// Tab激活状态
const activeTab = ref('all')

// 日期范围选择器
const dateRange = ref([])

// 处理对话框状态
const handleDialogVisible = ref(false)

// 处理表单
const handleForm = reactive({
  id: '',
  handleTime: '',
  handleResult: ''
})

// 查询条件
const condForm = reactive({
  deviceName: '',
  alertStartTime: '',
  alertEndTime: '',
  handleStatus: null,
  pageNum: 1,
  pageSize: 10
})

// 列表数据
const alertRecordList = ref([])
const total = ref(0)

// ---------- 加载列表 ----------
function loadAlertRecordList() {
  // 设置日期范围
  if (dateRange.value && dateRange.value.length === 2) {
    condForm.alertStartTime = dateRange.value[0] + ' 00:00:00'
    condForm.alertEndTime = dateRange.value[1] + ' 23:59:59'
  } else {
    condForm.alertStartTime = ''
    condForm.alertEndTime = ''
  }

  axios.post('/alertRecord/alertRecordPage', condForm)
    .then(response => {
      if (response.data.code === 200) {
        alertRecordList.value = response.data.alertRecords || []
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

// ---------- 分页 ----------
function doAlertRecordPage(pageNum) {
  condForm.pageNum = pageNum
  loadAlertRecordList()
}

// ---------- 重置查询条件 ----------
function resetCondForm() {
  condForm.deviceName = ''
  condForm.alertStartTime = ''
  condForm.alertEndTime = ''
  condForm.handleStatus = null
  condForm.pageNum = 1
  dateRange.value = []
  activeTab.value = 'all'
  loadAlertRecordList()
}

// ---------- Tab切换 ----------
function handleTabChange(tabName) {
  condForm.pageNum = 1
  if (tabName === 'all') {
    condForm.handleStatus = null
  } else if (tabName === 'pending') {
    condForm.handleStatus = 0
  } else if (tabName === 'handled') {
    condForm.handleStatus = 1
  }
  loadAlertRecordList()
}

// ---------- 打开处理对话框 ----------
function openHandleDialog(row) {
  handleForm.id = row.id
  // 默认处理时间为当前时间
  const now = new Date()
  handleForm.handleTime = formatDate(now)
  handleForm.handleResult = ''
  handleDialogVisible.value = true
}

// ---------- 提交处理 ----------
function submitHandle() {
  // 验证必填字段
  if (!handleForm.handleTime) {
    ElMessage.warning('请选择处理时间')
    return
  }
  if (!handleForm.handleResult || !handleForm.handleResult.trim()) {
    ElMessage.warning('请输入处理结果')
    return
  }

  axios.post('/alertRecord/handleAlertRecord', null, {
    params: {
      id: handleForm.id,
      handleResult: handleForm.handleResult
    }
  })
    .then(response => {
      if (response.data.code === 200) {
        handleDialogVisible.value = false
        cleanHandleForm()
        loadAlertRecordList()
        ElMessage.success(response.data.msg)
      } else {
        ElMessage.error(response.data.msg)
      }
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('网络错误')
    })
}

// ---------- 清空处理表单 ----------
function cleanHandleForm() {
  handleForm.id = ''
  handleForm.handleTime = ''
  handleForm.handleResult = ''
}

// ---------- 取消处理 ----------
function cancelHandle() {
  handleDialogVisible.value = false
  cleanHandleForm()
}

// ---------- 生命周期 ----------
onMounted(() => {
  loadAlertRecordList()
})

// ---------- 格式化日期时间 ----------
function formatDateTime(dateTime) {
  if (!dateTime) return '-'

  // 如果是Date对象或时间戳
  if (typeof dateTime === 'object' || typeof dateTime === 'number') {
    const date = new Date(dateTime)
    return formatDate(date)
  }

  // 如果是字符串（ISO 8601格式）
  try {
    const date = new Date(dateTime)
    return formatDate(date)
  } catch (e) {
    return dateTime
  }
}

function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}
</script>

<style scoped>
/* 保持简洁，使用Element Plus默认样式 */
</style>