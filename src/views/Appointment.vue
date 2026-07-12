<template>
  <!-- ==================== 页面整体布局 ==================== -->
  <div class="appointment-container">

    <!-- ==================== 搜索区域 ==================== -->
    <!--
      功能说明：提供预约记录的筛选查询功能
      - 预约人姓名：模糊搜索（支持部分匹配）
      - 预约人手机号：精确搜索（必须完全匹配）
      - 预约状态：下拉选择（待上门/已完成/已取消/已过期）
      - 预约时间：日期范围选择器
    -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" label-width="90px">

        <!-- 预约人姓名输入框 -->
        <el-form-item label="预约人姓名">
          <el-input
            v-model="searchForm.visitorName"
            placeholder="请输入预约人姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <!-- 预约人手机输入框 -->
        <el-form-item label="预约手机号">
          <el-input
            v-model="searchForm.visitorPhone"
            placeholder="请输入手机号"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <!-- 预约状态下拉选择框 -->
        <el-form-item label="预约状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <!-- 状态选项：对应后端状态码 0-待上门, 1-已完成, 2-已取消, 3-已过期 -->
            <el-option label="待上门" :value="0" />
            <el-option label="已完成" :value="1" />
            <el-option label="已取消" :value="2" />
            <el-option label="已过期" :value="3" />
          </el-select>
        </el-form-item>

        <!-- 预约时间范围选择器 -->
        <el-form-item label="预约时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 360px"
          />
        </el-form-item>

        <!-- 操作按钮组 -->
        <el-form-item>
          <!-- 重置按钮：清空所有搜索条件 -->
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <!-- 搜索按钮：执行查询操作 -->
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ==================== 标签页区域 ==================== -->
    <!--
      功能说明：按预约类型分类展示数据
      - 全部：显示所有类型的预约记录
      - 参观预约：仅显示参观类型的预约
      - 探访预约：仅显示探访类型的预约
    -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">

      <!-- 全部预约标签页 -->
      <el-tab-pane label="全部" name="all">

        <!-- ==================== 表格区域 ==================== -->
        <!--
          表格功能：展示预约记录列表
          列说明：
          - 序号：自动编号
          - 预约类型：参观预约/探访预约
          - 预约人姓名、手机号：来访者信息
          - 老人姓名：被探访的老人
          - 预约时间：计划来访时间
          - 创建人、创建时间：记录创建信息
          - 预约状态：带颜色标识的状态标签
          - 操作：根据状态显示不同操作按钮
        -->
        <el-table
          :data="tableData"
          stripe
          style="width: 100%"
          fit
          v-loading="loading"
        >
          <!-- 空白占位列 - 用于给表格左侧留出空间 -->
          <el-table-column width="20" />

          <!-- 序号列：自动计算行号 -->
          <el-table-column type="index" label="序号" width="60" align="center" />

          <!-- 预约类型列 -->
          <el-table-column prop="appointmentType" label="预约类型" width="120" align="center" />

          <!-- 预约人姓名列 -->
          <el-table-column prop="visitorName" label="预约人姓名" width="120" align="center" />

          <!-- 预约人手机号列 -->
          <el-table-column prop="visitorPhone" label="预约手机号" width="140" align="center" />

          <!-- 老人姓名列 -->
          <el-table-column prop="elderName" label="老人姓名" width="120" align="center" />

          <!-- 预约时间列 -->
          <el-table-column prop="appointmentTime" label="预约时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.appointmentTime) }}
            </template>
          </el-table-column>

          <!-- 创建人列 -->
          <el-table-column prop="creator" label="创建人" width="100" align="center" />

          <!-- 创建时间列 -->
          <el-table-column prop="createTime" label="创建时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>

          <!-- 预约状态列：使用不同颜色区分状态 -->
          <el-table-column prop="statusText" label="预约状态" width="100" align="center">
            <!-- 自定义模板：根据状态值显示不同颜色的标签 -->
            <template #default="scope">
              <!-- 待上门：橙色警告标签 -->
              <el-tag v-if="scope.row.status === 0" type="warning">待上门</el-tag>
              <!-- 已完成：绿色成功标签 -->
              <el-tag v-else-if="scope.row.status === 1" type="success">已完成</el-tag>
              <!-- 已取消：红色危险标签 -->
              <el-tag v-else-if="scope.row.status === 2" type="danger">已取消</el-tag>
              <!-- 已过期：灰色信息标签 -->
              <el-tag v-else-if="scope.row.status === 3" type="info">已过期</el-tag>
            </template>
          </el-table-column>

          <!-- 操作列：根据状态显示不同的操作按钮 -->
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <!-- 到院按钮：仅当状态为"待上门(0)"时显示且可点击 -->
              <el-button
                v-if="scope.row.status === 0"
                type="primary"
                size="small"
                @click="handleArrival(scope.row)"
              >
                到院
              </el-button>
              <!-- 其他状态：显示禁用状态的按钮 -->
              <el-button
                v-else
                type="primary"
                size="small"
                disabled
              >
                到院
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- ==================== 分页组件 ==================== -->
        <!--
          功能说明：实现数据的分页展示
          属性说明：
          - current-page：当前页码
          - page-sizes：每页显示条数选项
          - page-size：当前每页显示条数
          - total：总记录数
          - layout：分页组件布局
        -->
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          style="margin-top: 20px; justify-content: flex-end"
        />
      </el-tab-pane>

      <!-- 参观预约标签页 -->
      <el-tab-pane label="参观预约" name="visit">
        <!-- 使用 tableData，数据由后端过滤 -->
        <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="appointmentType" label="预约类型" width="120" align="center" />
          <el-table-column prop="visitorName" label="预约人姓名" width="120" align="center" />
          <el-table-column prop="visitorPhone" label="预约手机号" width="140" align="center" />
          <el-table-column prop="elderName" label="老人姓名" width="120" align="center" />
          <el-table-column prop="appointmentTime" label="预约时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.appointmentTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建人" width="100" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="statusText" label="预约状态" width="100" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 0" type="warning">待上门</el-tag>
              <el-tag v-else-if="scope.row.status === 1" type="success">已完成</el-tag>
              <el-tag v-else-if="scope.row.status === 2" type="danger">已取消</el-tag>
              <el-tag v-else-if="scope.row.status === 3" type="info">已过期</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button
                v-if="scope.row.status === 0"
                type="primary"
                size="small"
                @click="handleArrival(scope.row)"
              >
                到院
              </el-button>
              <el-button v-else type="primary" size="small" disabled>到院</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          style="margin-top: 20px; justify-content: flex-end"
        />
      </el-tab-pane>

      <!-- 探访预约标签页 -->
      <el-tab-pane label="探访预约" name="explore">
        <!-- 使用 tableData，数据由后端过滤 -->
        <el-table :data="tableData" stripe style="width: 100%" v-loading="loading">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="appointmentType" label="预约类型" width="120" align="center" />
          <el-table-column prop="visitorName" label="预约人姓名" width="120" align="center" />
          <el-table-column prop="visitorPhone" label="预约手机号" width="140" align="center" />
          <el-table-column prop="elderName" label="老人姓名" width="120" align="center" />
          <el-table-column prop="appointmentTime" label="预约时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.appointmentTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建人" width="100" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="statusText" label="预约状态" width="100" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 0" type="warning">待上门</el-tag>
              <el-tag v-else-if="scope.row.status === 1" type="success">已完成</el-tag>
              <el-tag v-else-if="scope.row.status === 2" type="danger">已取消</el-tag>
              <el-tag v-else-if="scope.row.status === 3" type="info">已过期</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button
                v-if="scope.row.status === 0"
                type="primary"
                size="small"
                @click="handleArrival(scope.row)"
              >
                到院
              </el-button>
              <el-button v-else type="primary" size="small" disabled>到院</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          style="margin-top: 20px; justify-content: flex-end"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- ==================== 到院确认对话框 ==================== -->
    <!--
      功能说明：确认预约人到院时间
      触发条件：点击"到院"按钮
      操作流程：
      1. 弹出对话框
      2. 选择实际到院时间（默认当前时间）
      3. 点击确定后更新预约状态为"已完成"并生成来访记录
    -->
    <el-dialog
      v-model="arrivalDialogVisible"
      title="确认到院时间"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="arrivalForm" label-width="100px">
        <!-- 到院时间选择器 -->
        <el-form-item label="来访时间">
          <el-date-picker
            v-model="arrivalForm.arrivalTime"
            type="datetime"
            placeholder="选择到院时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <!-- 取消按钮：关闭对话框 -->
          <el-button @click="arrivalDialogVisible = false">取消</el-button>
          <!-- 确定按钮：提交到院时间 -->
          <el-button type="primary" @click="confirmArrival">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// ==================== 导入依赖 ====================
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

// ==================== 响应式数据定义 ====================

/**
 * 搜索表单数据对象
 * 用于存储用户输入的搜索条件
 */
const searchForm = reactive({
  visitorName: '',      // 预约人姓名（模糊搜索）
  visitorPhone: '',     // 预约人手机号（精确搜索）
  status: null,         // 预约状态（0-待上门, 1-已完成, 2-已取消, 3-已过期）
})

/**
 * 日期范围选择器绑定变量
 * 格式：[开始时间, 结束时间]
 */
const dateRange = ref([])

/**
 * 当前激活的标签页
 * 可选值：'all'(全部), 'visit'(参观预约), 'explore'(探访预约)
 */
const activeTab = ref('all')

/**
 * 表格加载状态
 * true: 显示加载动画
 * false: 隐藏加载动画
 */
const loading = ref(false)

/**
 * 表格数据数组
 * 存储从后端获取的预约记录列表
 */
const tableData = ref([])

/**
 * 分页配置对象
 */
const pagination = reactive({
  pageNum: 1,           // 当前页码
  pageSize: 10,         // 每页显示条数
  total: 0              // 总记录数
})

/**
 * 到院确认对话框显示状态
 * true: 显示对话框
 * false: 隐藏对话框
 */
const arrivalDialogVisible = ref(false)

/**
 * 到院确认表单数据
 */
const arrivalForm = reactive({
  appointmentId: null,  // 预约记录ID
  arrivalTime: ''       // 实际到院时间
})

// ==================== 方法定义 ====================

/**
 * 加载预约列表数据
 * 功能：向后端发送请求获取预约记录列表
 * 参数：无（使用 searchForm、pagination 和 activeTab 中的数据）
 */
function loadAppointmentList() {
  // 开启加载动画
  loading.value = true

  // 构建请求参数对象
  const params = {
    ...searchForm,                    // 展开搜索条件
    pageNum: pagination.pageNum,      // 当前页码
    pageSize: pagination.pageSize     // 每页条数
  }

  // 根据标签页设置预约类型
  if (activeTab.value === 'visit') {
    params.appointmentType = '参观预约'
  } else if (activeTab.value === 'explore') {
    params.appointmentType = '探访预约'
  }
  // activeTab.value === 'all' 时不传 appointmentType，查询全部

  // 如果选择了日期范围，添加时间参数
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0]   // 开始时间
    params.endTime = dateRange.value[1]     // 结束时间
  }

  console.log('=== 发送预约查询请求 ===')
  console.log('当前标签页:', activeTab.value)
  console.log('请求参数:', params)

  // 发送POST请求到后端接口
  axios.post('/appointment/list', params)
    .then(response => {
      // 请求成功回调
      console.log('响应数据:', response.data)
      if (response.data.code === 200) {
        // 更新表格数据
        tableData.value = response.data.data || []
        // 更新总记录数
        pagination.total = response.data.total || 0
        console.log('更新后的 total:', pagination.total)
      } else {
        // 显示错误提示
        ElMessage.error(response.data.msg || '查询失败')
      }
    })
    .catch(error => {
      // 请求失败回调
      console.error('加载预约列表失败:', error)
      ElMessage.error('网络异常，请稍后重试')
    })
    .finally(() => {
      // 无论成功失败都关闭加载动画
      loading.value = false
    })
}

/**
 * 搜索按钮点击事件处理
 * 功能：根据搜索条件重新加载数据
 */
function handleSearch() {
  // 重置到第一页
  pagination.pageNum = 1
  // 重新加载数据
  loadAppointmentList()
}

/**
 * 重置按钮点击事件处理
 * 功能：清空所有搜索条件并重新加载数据
 */
function handleReset() {
  // 清空搜索表单
  searchForm.visitorName = ''
  searchForm.visitorPhone = ''
  searchForm.status = null
  // 清空日期范围
  dateRange.value = []
  // 重置到第一页
  pagination.pageNum = 1
  // 重新加载数据
  loadAppointmentList()
}

/**
 * 标签页切换事件处理
 * 功能：切换不同的预约类型标签页，并重新加载数据
 * 参数：tabName - 标签页名称（all/visit/explore）
 */
function handleTabChange(tabName) {
  // 重置到第一页
  pagination.pageNum = 1
  // 重新加载数据（会带上新的 appointmentType 参数）
  loadAppointmentList()
  console.log('切换到标签页:', tabName)
}

/**
 * 每页显示条数改变事件处理
 * 功能：用户修改每页显示条数时触发
 * 参数：val - 新的每页显示条数
 */
function handleSizeChange(val) {
  pagination.pageSize = val
  // 重置到第一页
  pagination.pageNum = 1
  // 重新加载数据
  loadAppointmentList()
}

/**
 * 页码改变事件处理
 * 功能：用户翻页时触发
 * 参数：val - 新的页码
 */
function handleCurrentChange(val) {
  pagination.pageNum = val
  // 重新加载数据
  loadAppointmentList()
}

/**
 * 到院按钮点击事件处理
 * 功能：打开到院确认对话框
 * 参数：row - 当前行的预约记录数据
 */
function handleArrival(row) {
  // 填充预约ID
  arrivalForm.appointmentId = row.id

  // 设置默认到院时间为当前本地时间（格式：YYYY-MM-DD HH:mm:ss）
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  arrivalForm.arrivalTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

  // 显示对话框
  arrivalDialogVisible.value = true
}

/**
 * 格式化日期时间字符串
 * 将 ISO 8601 格式（带T）转换为标准格式（空格分隔）
 * 例如：2026-07-10T12:30:09 -> 2026-07-10 12:30:09
 * @param dateTime - 日期时间字符串或对象
 * @returns 格式化后的字符串
 */
function formatDateTime(dateTime) {
  if (!dateTime) return ''

  // 如果是字符串且包含 T，则替换为空格
  if (typeof dateTime === 'string') {
    return dateTime.replace('T', ' ')
  }

  // 如果是对象，尝试转换
  return String(dateTime).replace('T', ' ')
}

/**
 * 确认到院按钮点击事件处理
 * 功能：提交到院时间，更新预约状态并生成来访记录
 */
function confirmArrival() {
  // 验证到院时间是否已选择
  if (!arrivalForm.arrivalTime) {
    ElMessage.warning('请选择到院时间')
    return
  }

  // 显示确认对话框
  ElMessageBox.confirm(
    '确认该预约人已到院？确认后状态将变更为"已完成"',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 用户点击确定后发送请求
    axios.post('/appointment/confirmArrival', arrivalForm)
      .then(response => {
        if (response.data.code === 200) {
          // 显示成功提示
          ElMessage.success('确认到院成功')
          // 关闭对话框
          arrivalDialogVisible.value = false
          // 重新加载列表数据
          loadAppointmentList()
        } else {
          // 显示错误提示
          ElMessage.error(response.data.msg || '确认到院失败')
        }
      })
      .catch(error => {
        console.error('确认到院失败:', error)
        ElMessage.error('网络异常，请稍后重试')
      })
  }).catch(() => {
    // 用户点击取消，不做任何操作
    ElMessage.info('已取消操作')
  })
}

// ==================== 生命周期钩子 ====================

/**
 * 组件挂载完成后执行
 * 功能：初始化加载预约列表数据
 */
onMounted(() => {
  loadAppointmentList()
})
</script>

<style scoped>
/* ==================== 容器样式 ==================== */
.appointment-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 100px);
}

/* ==================== 搜索卡片样式 ==================== */
.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

/* 搜索表单标签样式 */
.search-card :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

/* ==================== 标签页样式 ==================== */
.el-tabs {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 标签页内容区域的内边距 */
.el-tabs__content {
  padding: 20px;
}

/* 表格容器样式 */
.el-table {
  font-size: 14px;
}

/* 表头样式 */
.el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

/* 斑马纹行样式优化 */
.el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #fafafa;
}

/* 鼠标悬停效果 */
.el-table tbody tr:hover > td {
  background-color: #ecf5ff !important;
}

/* 分页样式 */
.el-pagination {
  display: flex;
  justify-content: flex-end;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .appointment-container {
    padding: 10px;
  }

  .search-card :deep(.el-form-item) {
    margin-bottom: 10px;
  }

  .el-tabs__content {
    padding: 10px;
  }
}
</style>