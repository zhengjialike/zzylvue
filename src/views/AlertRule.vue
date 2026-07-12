<template>
  <!-- 搜索条件 -->
  <div>
    报警规则名称&nbsp;：&nbsp;
    <el-input style="width:20%;margin-right:20px" v-model="condForm.ruleName" placeholder="请输入" />
    所属产品&nbsp;：&nbsp;
    <el-select style="width:20%;margin-right:20px" placeholder="请选择" v-model="condForm.productId">
      <el-option
        v-for="item in productList"
        :key="item.id"
        :label="item.productName"
        :value="item.id"
      />
    </el-select>
    功能名称&nbsp;：&nbsp;
    <el-input style="width:20%;margin-right:20px" v-model="condForm.functionName" placeholder="请输入" />
    <el-button type="primary" @click="loadAlertRuleList">搜索</el-button>
    <el-button @click="resetCondForm">重置</el-button>
  </div>

  <!-- 添加按钮 -->
  <div style="text-align:left;margin-top:15px;">
    <el-button type="primary" @click="openAlertRuleDialog">新增报警规则</el-button>
  </div>

  <!-- 表格 -->
  <el-table :data="alertRuleList" style="width:100%" fit>
    <el-table-column type="index" width="60" label="序号" />
    <el-table-column prop="ruleName" label="报警规则名称" min-width="150" />
    <el-table-column prop="productName" label="所属产品" min-width="120" />
    <el-table-column prop="functionName" label="功能名称" min-width="120" />
    <el-table-column prop="deviceName" label="关联设备" min-width="120" />
    <el-table-column label="报警规则条件" min-width="200">
      <template #default="scope">
        {{ formatCondition(scope.row) }}
      </template>
    </el-table-column>
    <el-table-column label="报警生效时段" min-width="180">
      <template #default="scope">
        {{ formatTimeRange(scope.row.effectiveStart, scope.row.effectiveEnd) }}
      </template>
    </el-table-column>
    <el-table-column prop="createUser" label="创建人" min-width="100" />
    <el-table-column prop="createTime" label="创建时间" min-width="160" />
    <el-table-column label="状态" width="100">
      <template #default="scope">
        <span v-if="scope.row.status === 1" style="color:dodgerblue;">启用</span>
        <span v-else style="color:crimson;">禁用</span>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="320" fixed="right">
      <template #default="scope">
        <el-button type="success" size="small" @click="toggleStatus(scope.row)">
          {{ scope.row.status === 1 ? '禁用' : '启用' }}
        </el-button>
        <el-button type="warning" size="small" @click="delAlertRule(scope.row.id)">删除</el-button>
        <el-button type="primary" size="small" @click="showAlertRuleInfo(scope.row)">编辑</el-button>
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
    @current-change="doAlertRulePage"
    style="margin-top:15px;"
  />

  <!-- 新增/编辑对话框 -->
  <el-dialog
    v-model="alertRuleDialogVisible"
    :title="dialogTitle"
    width="45%"
    @close="cleanAlertRuleForm"
  >
    <el-form label-width="auto" style="margin-left:5%;margin-right:5%;max-width:700px">
      <!-- 报警规则部分 -->
      <div style="font-weight:bold;font-size:16px;margin-bottom:15px;">报警规则</div>

      <el-form-item label="*所属产品">
        <el-select v-model="alertRuleForm.productId" placeholder="请选择产品" @change="onProductChange">
          <el-option
            v-for="item in productList"
            :key="item.id"
            :label="item.productName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="*功能名称">
        <el-select v-model="alertRuleForm.functionName" placeholder="请选择功能" :disabled="!alertRuleForm.productId">
          <el-option
            v-for="item in functionNamesList"
            :key="item.functionName"
            :label="item.functionName"
            :value="item.functionName"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="*关联设备">
        <el-select v-model="alertRuleForm.deviceId" placeholder="请选择设备" :disabled="!alertRuleForm.productId">
          <el-option
            v-for="item in deviceList"
            :key="item.deviceId"
            :label="item.deviceName"
            :value="item.deviceId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="*报警规则名称">
        <el-input v-model="alertRuleForm.ruleName" maxlength="20" show-word-limit placeholder="请输入" />
      </el-form-item>

      <el-form-item label="*运算符">
        <el-select v-model="alertRuleForm.operator" placeholder="请选择">
          <el-option label=">" value=">" />
          <el-option label="<" value="<" />
          <el-option label="=" value="=" />
          <el-option label="!=" value="!=" />
          <el-option label=">=" value=">=" />
          <el-option label="<=" value="<=" />
        </el-select>
      </el-form-item>

      <el-form-item label="*阈值">
        <el-input-number
          v-model="alertRuleForm.threshold"
          :precision="2"
          :step="0.1"
          :min="0"
          style="width:100%;"
        />
      </el-form-item>

      <el-form-item label="*持续周期">
        <el-select v-model="alertRuleForm.durationPeriod" placeholder="请选择">
          <el-option label="1" :value="1" />
          <el-option label="3" :value="3" />
          <el-option label="5" :value="5" />
          <el-option label="10" :value="10" />
        </el-select>
      </el-form-item>

      <el-form-item label="*数据聚合周期">
        <el-select v-model="alertRuleForm.dataAggregationPeriod" placeholder="请选择">
          <el-option label="1分钟" :value="1" />
          <el-option label="5分钟" :value="5" />
        </el-select>
      </el-form-item>

      <!-- 通知方式部分 -->
      <div style="font-weight:bold;font-size:16px;margin-top:20px;margin-bottom:15px;">通知方式</div>

      <el-form-item label="*报警生效时段">
        <el-time-picker
          v-model="timeRange"
          is-range
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="HH:mm:ss"
          value-format="HH:mm:ss"
          style="width:100%;"
        />
      </el-form-item>

      <el-form-item label="*报警沉默周期">
        <el-select v-model="alertRuleForm.silentMinutes" placeholder="请选择">
          <el-option label="5分钟" :value="5" />
          <el-option label="10分钟" :value="10" />
          <el-option label="15分钟" :value="15" />
          <el-option label="30分钟" :value="30" />
          <el-option label="60分钟" :value="60" />
          <el-option label="3小时" :value="180" />
          <el-option label="6小时" :value="360" />
          <el-option label="12小时" :value="720" />
          <el-option label="24小时" :value="1440" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-radio-group v-model="alertRuleForm.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item style="margin-left:30%;margin-top:20px;">
        <el-button type="primary" round @click="saveAlertRule">提交</el-button>
        <el-button type="info" round @click="cancelDialog">返回</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, ref, onErrorCaptured } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

// 捕获并忽略 ResizeObserver 错误
onErrorCaptured((err) => {
  if (err.message && err.message.includes('ResizeObserver')) {
    return false // 阻止错误继续传播
  }
})

// 对话框状态
const alertRuleDialogVisible = ref(false)
const dialogTitle = ref('新增报警规则')

// 表单对象
const alertRuleForm = reactive({
  id: '',
  ruleName: '',
  productId: '',
  functionName: '',
  deviceId: '',
  operator: '',
  threshold: 0,
  durationPeriod: 3,
  dataAggregationPeriod: '',
  effectiveStart: '',
  effectiveEnd: '',
  silentMinutes: 30,
  status: 1
})

// 时间范围选择器
const timeRange = ref([])

// 下拉选项
const productList = ref([])
const functionNamesList = ref([])
const deviceList = ref([])

// 当前请求URL（新增/编辑）
let url = ''

// 查询条件
const condForm = reactive({
  ruleName: '',
  productId: '',
  functionName: '',
  pageNum: 1,
  pageSize: 10
})

// 列表数据
const alertRuleList = ref([])
const total = ref(0)

// ---------- 加载列表 ----------
function loadAlertRuleList() {
  axios.post('/alertRule/alertRulePage', condForm)
    .then(response => {
      if (response.data.code === 200) {
        alertRuleList.value = response.data.alertRules || []
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
function doAlertRulePage(pageNum) {
  condForm.pageNum = pageNum
  loadAlertRuleList()
}

// ---------- 重置查询条件 ----------
function resetCondForm() {
  condForm.ruleName = ''
  condForm.productId = ''
  condForm.functionName = ''
  condForm.pageNum = 1
  loadAlertRuleList()
}

// ---------- 加载产品列表 ----------
function loadProductList() {
  axios.get('/alertRule/getAllProducts')
    .then(response => {
      if (response.data.code === 200) {
        productList.value = response.data.products || []
      }
    })
    .catch(error => {
      console.error(error)
    })
}

// ---------- 产品变化时加载功能名称和设备 ----------
function onProductChange(productId) {
  if (!productId) {
    functionNamesList.value = []
    deviceList.value = []
    alertRuleForm.functionName = ''
    alertRuleForm.deviceId = ''
    return
  }

  // 加载功能名称列表（从产品表的functions字段解析）
  axios.get('/alertRule/getFunctionNames', { params: { productId } })
    .then(response => {
      if (response.data.code === 200) {
        functionNamesList.value = response.data.functionNames || []
      }
    })
    .catch(error => {
      console.error(error)
    })

  // 加载设备列表（包含"全部设备"选项）
  axios.get('/alertRule/getAssociatedDevices', { params: { productId } })
    .then(response => {
      if (response.data.code === 200) {
        deviceList.value = response.data.devices || []
        // 默认选中全部设备（值为0）
        if (deviceList.value.length > 0 && deviceList.value[0].deviceId === '0') {
          alertRuleForm.deviceId = '0'
        }
      }
    })
    .catch(error => {
      console.error(error)
    })
}

// ---------- 新增对话框 ----------
function openAlertRuleDialog() {
  dialogTitle.value = '新增报警规则'
  url = '/alertRule/saveAlertRule'
  alertRuleDialogVisible.value = true
}

// ---------- 编辑回显 ----------
function showAlertRuleInfo(row) {
  dialogTitle.value = '编辑报警规则'
  alertRuleForm.id = row.id
  alertRuleForm.ruleName = row.ruleName
  alertRuleForm.productId = row.productId
  alertRuleForm.functionName = row.functionName
  alertRuleForm.deviceId = row.deviceId
  alertRuleForm.operator = row.operator
  alertRuleForm.threshold = row.threshold
  alertRuleForm.durationPeriod = row.durationPeriod
  alertRuleForm.dataAggregationPeriod = row.dataAggregationPeriod || ''
  alertRuleForm.effectiveStart = row.effectiveStart
  alertRuleForm.effectiveEnd = row.effectiveEnd
  alertRuleForm.silentMinutes = row.silentMinutes
  alertRuleForm.status = row.status

  // 设置时间范围
  if (row.effectiveStart && row.effectiveEnd) {
    timeRange.value = [row.effectiveStart, row.effectiveEnd]
  }

  // 加载对应的产品和功能名称、设备列表
  onProductChange(row.productId)

  url = '/alertRule/updateAlertRule'
  alertRuleDialogVisible.value = true
}

// ---------- 保存 ----------
function saveAlertRule() {
  // 验证必填字段
  if (!alertRuleForm.productId) {
    ElMessage.warning('请选择所属产品')
    return
  }
  if (!alertRuleForm.functionName) {
    ElMessage.warning('请选择功能名称')
    return
  }
  if (!alertRuleForm.deviceId) {
    ElMessage.warning('请选择关联设备')
    return
  }
  if (!alertRuleForm.ruleName) {
    ElMessage.warning('请输入报警规则名称')
    return
  }
  if (!alertRuleForm.operator) {
    ElMessage.warning('请选择运算符')
    return
  }
  if (alertRuleForm.threshold === null || alertRuleForm.threshold === undefined) {
    ElMessage.warning('请输入阈值')
    return
  }
  if (!alertRuleForm.durationPeriod) {
    ElMessage.warning('请选择持续周期')
    return
  }
  if (!timeRange.value || timeRange.value.length !== 2) {
    ElMessage.warning('请选择报警生效时段')
    return
  }
  if (!alertRuleForm.silentMinutes) {
    ElMessage.warning('请选择报警沉默周期')
    return
  }

  // 设置时间范围
  alertRuleForm.effectiveStart = timeRange.value[0]
  alertRuleForm.effectiveEnd = timeRange.value[1]

  axios.post(url, alertRuleForm)
    .then(response => {
      if (response.data.code === 200) {
        alertRuleDialogVisible.value = false
        cleanAlertRuleForm()
        doAlertRulePage(1)
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

// ---------- 清空表单 ----------
function cleanAlertRuleForm() {
  alertRuleForm.id = ''
  alertRuleForm.ruleName = ''
  alertRuleForm.productId = ''
  alertRuleForm.functionName = ''
  alertRuleForm.deviceId = ''
  alertRuleForm.operator = ''
  alertRuleForm.threshold = 0
  alertRuleForm.durationPeriod = 3
  alertRuleForm.dataAggregationPeriod = ''
  alertRuleForm.effectiveStart = ''
  alertRuleForm.effectiveEnd = ''
  alertRuleForm.silentMinutes = 30
  alertRuleForm.status = 1
  timeRange.value = []
  functionNamesList.value = []
  deviceList.value = []
}

// ---------- 取消对话框 ----------
function cancelDialog() {
  alertRuleDialogVisible.value = false
  cleanAlertRuleForm()
}

// ---------- 删除 ----------
function delAlertRule(id) {
  ElMessageBox.confirm('确定要删除该报警规则吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    axios.post('/alertRule/deleteAlertRule', { id })
      .then(response => {
        if (response.data.code === 200) {
          doAlertRulePage(1)
          ElMessage.success(response.data.msg)
        } else {
          ElMessage.error(response.data.msg)
        }
      })
      .catch(error => {
        console.error(error)
        ElMessage.error('网络错误')
      })
  }).catch(() => {
    // 用户取消
  })
}

// ---------- 切换状态 ----------
function toggleStatus(row) {
  const newStatus = row.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '启用' : '禁用'

  axios.post('/alertRule/toggleAlertRuleStatus', {
    id: row.id,
    status: newStatus
  })
    .then(response => {
      if (response.data.code === 200) {
        doAlertRulePage(1)
        ElMessage.success(statusText + '成功')
      } else {
        ElMessage.error(response.data.msg)
      }
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('网络错误')
    })
}

// ---------- 格式化报警条件 ----------
function formatCondition(row) {
  if (!row.operator || row.threshold === null) {
    return '-'
  }
  return `ThingModelPropertyDeviceValue${row.operator}${row.threshold}持续触发${row.durationPeriod}个周期是发生报警`
}

// ---------- 格式化时间范围 ----------
function formatTimeRange(start, end) {
  if (!start || !end) {
    return '-'
  }
  return `${formatTime(start)}-${formatTime(end)}`
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  // 如果是Date对象或时间戳
  if (typeof timeStr === 'object' || typeof timeStr === 'number') {
    const date = new Date(timeStr)
    return date.toTimeString().split(' ')[0]
  }
  // 如果是字符串
  return timeStr
}

// ---------- 生命周期 ----------
onMounted(() => {
  loadProductList()
  loadAlertRuleList()
})
</script>

<style scoped>
/* 保持简洁，使用Element Plus默认样式 */
</style>