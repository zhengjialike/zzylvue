<template>
  <!-- ==================== 页面整体布局 ==================== -->
  <div class="visit-container">

    <!-- ==================== 搜索区域 ==================== -->
    <!--
      功能说明：提供来访记录的筛选查询功能
      - 来访人姓名：模糊搜索
      - 来访人手机号：精确搜索
      - 来访时间：日期范围选择
    -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" label-width="90px">

        <!-- 来访人姓名输入框 -->
        <el-form-item label="来访人姓名">
          <el-input
            v-model="searchForm.visitorName"
            placeholder="请输入来访人姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <!-- 来访人手机号输入框 -->
        <el-form-item label="来访手机号">
          <el-input
            v-model="searchForm.visitorPhone"
            placeholder="请输入手机号"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <!-- 来访时间范围选择器 -->
        <el-form-item label="来访时间">
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
          <!-- 重置按钮 -->
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <!-- 搜索按钮 -->
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ==================== 标签页区域 ==================== -->
    <!--
      功能说明：按来访类型分类展示数据
      - 全部：显示所有类型的来访记录
      - 参观来访：仅显示参观类型的来访
      - 探访来访：仅显示探访类型的来访
    -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">

      <!-- 全部来访标签页 -->
      <el-tab-pane label="全部" name="all">

        <!-- ==================== 工具栏区域 ==================== -->
        <div class="toolbar">
          <!-- 来访登记按钮：打开新增对话框 -->
          <el-button type="primary" @click="openRegisterDialog">
            <el-icon><Plus /></el-icon>
            来访登记
          </el-button>
        </div>

        <!-- ==================== 表格区域 ==================== -->
        <!--
          表格功能：展示来访记录列表
          列说明：
          - 序号：自动编号
          - 来访类型：参观来访/探访来访
          - 来访人姓名、手机号：来访者信息
          - 老人姓名：被探访的老人
          - 来访时间：实际来访时间
          - 来源：预约到院/直接登记
          - 创建人、创建时间：记录创建信息
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

          <!-- 序号列 -->
          <el-table-column type="index" label="序号" width="60" align="center" />

          <!-- 来访类型列 -->
          <el-table-column prop="visitType" label="来访类型" width="120" align="center" />

          <!-- 来访人姓名列 -->
          <el-table-column prop="visitorName" label="来访人姓名" width="120" align="center" />

          <!-- 来访人手机号列 -->
          <el-table-column prop="visitorPhone" label="来访手机号" width="140" align="center" />

          <!-- 老人姓名列 -->
          <el-table-column prop="elderName" label="老人姓名" width="120" align="center" />

          <!-- 来访时间列 -->
          <el-table-column prop="visitTime" label="来访时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.visitTime) }}
            </template>
          </el-table-column>

          <!-- 来源列：区分是预约到院还是直接登记 -->
          <el-table-column prop="sourceText" label="来源" width="120" align="center">
            <template #default="scope">
              <!-- 预约到院：蓝色标签 -->
              <el-tag v-if="scope.row.source === 0" type="primary">预约到院</el-tag>
              <!-- 直接登记：橙色标签 -->
              <el-tag v-else type="warning">直接登记</el-tag>
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

          <!-- 操作列 -->
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button
                v-if="scope.row.source === 0"
                type="primary"
                size="small"
                disabled
              >
                已预约
              </el-button>
              <el-button
                v-else
                type="danger"
                size="small"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- ==================== 分页组件 ==================== -->
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

      <!-- 参观来访标签页 -->
      <el-tab-pane label="参观来访" name="visit">
        <div class="toolbar">
          <el-button type="primary" @click="openRegisterDialog">
            <el-icon><Plus /></el-icon>
            来访登记
          </el-button>
        </div>
        <el-table :data="filteredTableData" stripe style="width: 100%" fit v-loading="loading">
          <!-- 空白占位列 - 用于给表格左侧留出空间 -->
          <el-table-column width="20" />

          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="visitType" label="来访类型" width="120" align="center" />
          <el-table-column prop="visitorName" label="来访人姓名" width="120" align="center" />
          <el-table-column prop="visitorPhone" label="来访手机号" width="140" align="center" />
          <el-table-column prop="elderName" label="老人姓名" width="120" align="center" />
          <el-table-column prop="visitTime" label="来访时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.visitTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="sourceText" label="来源" width="120" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.source === 0" type="primary">预约到院</el-tag>
              <el-tag v-else type="warning">直接登记</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建人" width="100" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createTime) }}
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

      <!-- 探访来访标签页 -->
      <el-tab-pane label="探访来访" name="explore">
        <div class="toolbar">
          <el-button type="primary" @click="openRegisterDialog">
            <el-icon><Plus /></el-icon>
            来访登记
          </el-button>
        </div>
        <el-table :data="filteredTableData" stripe style="width: 100%" fit v-loading="loading">
          <!-- 空白占位列 - 用于给表格左侧留出空间 -->
          <el-table-column width="20" />

          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="visitType" label="来访类型" width="120" align="center" />
          <el-table-column prop="visitorName" label="来访人姓名" width="120" align="center" />
          <el-table-column prop="visitorPhone" label="来访手机号" width="140" align="center" />
          <el-table-column prop="elderName" label="老人姓名" width="120" align="center" />
          <el-table-column prop="visitTime" label="来访时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.visitTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="sourceText" label="来源" width="120" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.source === 0" type="primary">预约到院</el-tag>
              <el-tag v-else type="warning">直接登记</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建人" width="100" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="180" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createTime) }}
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

    <!-- ==================== 来访登记对话框 ==================== -->
    <!--
      功能说明：手动登记未预约的来访者信息
      触发条件：点击"来访登记"按钮
      表单字段：
      - 来访类型：参观来访/探访来访（单选）
      - 来访人姓名：必填，最多10个字符
      - 来访人手机号：必填，11位手机号格式验证
      - 老人姓名：必填，最多10个字符（探访来访时可选择已有老人）
      - 来访时间：必填，默认当前时间
    -->
    <el-dialog
      v-model="registerDialogVisible"
      title="来访登记"
      width="40%"
      :close-on-click-modal="false"
    >
      <!--
        来访登记表单
        使用 el-form 组件进行表单验证和数据绑定
      -->
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="120px"
        style="padding: 0 20px"
      >
        <!-- 来访类型选择 -->
        <el-form-item label="来访类型" prop="visitType">
          <el-radio-group v-model="registerForm.visitType">
            <el-radio value="参观来访">参观来访</el-radio>
            <el-radio value="探访来访">探访来访</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 来访人姓名输入 -->
        <el-form-item label="来访人姓名" prop="visitorName">
          <el-input
            v-model="registerForm.visitorName"
            placeholder="请输入来访人姓名"
            maxlength="10"
            show-word-limit
            clearable
          />
        </el-form-item>

        <!-- 来访人手机号输入 -->
        <el-form-item label="来访手机号" prop="visitorPhone">
          <el-input
            v-model="registerForm.visitorPhone"
            placeholder="请输入11位手机号"
            maxlength="11"
            show-word-limit
            clearable
          />
        </el-form-item>

        <!-- 老人姓名输入/选择 -->
        <el-form-item label="老人姓名" prop="elderName">
          <!--
            如果是探访来访，显示下拉选择框（从后端获取老人列表）
            如果是参观来访，显示普通输入框
          -->
          <el-select
            v-if="registerForm.visitType === '探访来访'"
            v-model="registerForm.elderName"
            placeholder="请选择老人"
            filterable
            allow-create
            default-first-option
            style="width: 100%"
          >
            <el-option
              v-for="elder in elderList"
              :key="elder.id"
              :label="elder.name"
              :value="elder.name"
            />
          </el-select>
          <el-input
            v-else
            v-model="registerForm.elderName"
            placeholder="请输入老人姓名"
            maxlength="10"
            show-word-limit
            clearable
          />
        </el-form-item>

        <!-- 来访时间选择 -->
        <el-form-item label="来访时间" prop="visitTime">
          <el-date-picker
            v-model="registerForm.visitTime"
            type="datetime"
            placeholder="选择来访时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 备注输入 -->
        <el-form-item label="备注">
          <el-input
            v-model="registerForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（选填）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <!-- 取消按钮：关闭对话框并清空表单 -->
          <el-button @click="cancelRegister">取消</el-button>
          <!-- 确定按钮：提交来访登记 -->
          <el-button type="primary" @click="submitRegister">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
// ==================== 导入依赖 ====================
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'

// ==================== 响应式数据定义 ====================

/**
 * 搜索表单数据对象
 * 用于存储用户输入的搜索条件
 */
const searchForm = reactive({
  visitorName: '',      // 来访人姓名（模糊搜索）
  visitorPhone: '',     // 来访人手机号（精确搜索）
})

/**
 * 日期范围选择器绑定变量
 * 格式：[开始时间, 结束时间]
 */
const dateRange = ref([])

/**
 * 当前激活的标签页
 * 可选值：'all'(全部), 'visit'(参观来访), 'explore'(探访来访)
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
 * 存储从后端获取的来访记录列表
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
 * 来访登记对话框显示状态
 * true: 显示对话框
 * false: 隐藏对话框
 */
const registerDialogVisible = ref(false)

/**
 * 来访登记表单引用
 * 用于表单验证
 */
const registerFormRef = ref(null)

/**
 * 来访登记表单数据
 */
const registerForm = reactive({
  visitType: '参观来访',   // 来访类型，默认"参观来访"
  visitorName: '',         // 来访人姓名
  visitorPhone: '',        // 来访人手机号
  elderName: '',           // 老人姓名
  visitTime: '',           // 来访时间
  remark: ''               // 备注
})

/**
 * 老人列表数据
 * 用于探访来访时选择老人
 */
const elderList = ref([])

/**
 * 表单验证规则
 * 定义各个字段的验证逻辑
 */
const registerRules = {
  // 来访类型：必填
  visitType: [
    { required: true, message: '请选择来访类型', trigger: 'change' }
  ],
  // 来访人姓名：必填，最多10个字符
  visitorName: [
    { required: true, message: '请输入来访人姓名', trigger: 'blur' },
    { max: 10, message: '姓名最多10个字符', trigger: 'blur' }
  ],
  // 来访人手机号：必填，11位数字，符合手机号格式
  visitorPhone: [
    { required: true, message: '请输入来访人手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误，请重新输入', trigger: 'blur' },
    { len: 11, message: '手机号必须为11位', trigger: 'blur' }
  ],
  // 老人姓名：必填，最多10个字符
  elderName: [
    { required: true, message: '请输入老人姓名', trigger: 'blur' },
    { max: 10, message: '姓名最多10个字符', trigger: 'blur' }
  ],
  // 来访时间：必填
  visitTime: [
    { required: true, message: '请选择来访时间', trigger: 'change' }
  ]
}

// ==================== 计算属性 ====================

/**
 * 根据当前激活的标签页过滤表格数据
 * 返回：过滤后的来访记录数组
 */
const filteredTableData = computed(() => {
  if (activeTab.value === 'all') {
    // 显示全部数据
    return tableData.value
  } else if (activeTab.value === 'visit') {
    // 只显示参观来访
    return tableData.value.filter(item => item.visitType === '参观来访')
  } else if (activeTab.value === 'explore') {
    // 只显示探访来访
    return tableData.value.filter(item => item.visitType === '探访来访')
  }
  return tableData.value
})

// ==================== 方法定义 ====================

/**
 * 加载来访列表数据
 * 功能：向后端发送请求获取来访记录列表
 * 参数：无（使用 searchForm 和 pagination 中的数据）
 */
function loadVisitList() {
  // 开启加载动画
  loading.value = true

  // 构建请求参数对象
  const params = {
    ...searchForm,                    // 展开搜索条件
    pageNum: pagination.pageNum,      // 当前页码
    pageSize: pagination.pageSize     // 每页条数
  }

  // 如果选择了日期范围，添加时间参数
  if (dateRange.value && dateRange.value.length === 2) {
    params.startTime = dateRange.value[0]   // 开始时间
    params.endTime = dateRange.value[1]     // 结束时间
  }

  // 发送POST请求到后端接口
  axios.post('/visit/list', params)
    .then(response => {
      // 请求成功回调
      if (response.data.code === 200) {
        // 更新表格数据
        tableData.value = response.data.data || []
        // 更新总记录数
        pagination.total = response.data.total || 0
      } else {
        // 显示错误提示
        ElMessage.error(response.data.msg || '查询失败')
      }
    })
    .catch(error => {
      // 请求失败回调
      console.error('加载来访列表失败:', error)
      ElMessage.error('网络异常，请稍后重试')
    })
    .finally(() => {
      // 无论成功失败都关闭加载动画
      loading.value = false
    })
}

/**
 * 加载老人列表
 * 功能：获取所有在住的老人列表，用于探访来访时选择
 */
function loadElderList() {
  axios.get('/elder/list')
    .then(response => {
      if (response.data.code === 200) {
        elderList.value = response.data.data || []
      }
    })
    .catch(error => {
      console.error('加载老人列表失败:', error)
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
  loadVisitList()
}

/**
 * 重置按钮点击事件处理
 * 功能：清空所有搜索条件并重新加载数据
 */
function handleReset() {
  // 清空搜索表单
  searchForm.visitorName = ''
  searchForm.visitorPhone = ''
  // 清空日期范围
  dateRange.value = []
  // 重置到第一页
  pagination.pageNum = 1
  // 重新加载数据
  loadVisitList()
}

/**
 * 标签页切换事件处理
 * 功能：切换不同的来访类型标签页
 * 参数：tabName - 标签页名称（all/visit/explore）
 */
function handleTabChange(tabName) {
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
  loadVisitList()
}

/**
 * 页码改变事件处理
 * 功能：用户翻页时触发
 * 参数：val - 新的页码
 */
function handleCurrentChange(val) {
  pagination.pageNum = val
  // 重新加载数据
  loadVisitList()
}

/**
 * 打开来访登记对话框
 * 功能：初始化表单并显示对话框
 */
function openRegisterDialog() {
  // 设置默认来访时间为当前时间
  registerForm.visitTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
  // 显示对话框
  registerDialogVisible.value = true
}

/**
 * 提交来访登记
 * 功能：验证表单并提交到来访登记接口
 */
function submitRegister() {
  // 触发表单验证
  registerFormRef.value.validate((valid) => {
    if (valid) {
      // 验证通过，发送请求
      axios.post('/visit/register', registerForm)
        .then(response => {
          if (response.data.code === 200) {
            // 显示成功提示
            ElMessage.success('来访登记成功')
            // 关闭对话框
            registerDialogVisible.value = false
            // 清空表单
            resetRegisterForm()
            // 重新加载列表数据
            loadVisitList()
          } else {
            // 显示错误提示
            ElMessage.error(response.data.msg || '登记失败')
          }
        })
        .catch(error => {
          console.error('来访登记失败:', error)
          ElMessage.error('网络异常，请稍后重试')
        })
    } else {
      // 验证失败，提示用户
      ElMessage.warning('请检查表单填写是否正确')
      return false
    }
  })
}

/**
 * 取消来访登记
 * 功能：关闭对话框并清空表单
 */
function cancelRegister() {
  registerDialogVisible.value = false
  resetRegisterForm()
}

/**
 * 删除来访记录
 * 功能：删除指定的来访记录
 * @param row - 要删除的来访记录
 */
function handleDelete(row) {
  ElMessageBox.confirm(
    '确定要删除这条来访记录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    axios.delete(`/visit/${row.id}`)
      .then(response => {
        if (response.data.code === 200) {
          ElMessage.success('删除成功')
          loadVisitList()
        } else {
          ElMessage.error(response.data.msg || '删除失败')
        }
      })
      .catch(error => {
        console.error('删除来访记录失败:', error)
        ElMessage.error('网络异常，请稍后重试')
      })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
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
 * 重置来访登记表单
 * 功能：清空表单所有字段并恢复默认值
 */
function resetRegisterForm() {
  registerForm.visitType = '参观来访'
  registerForm.visitorName = ''
  registerForm.visitorPhone = ''
  registerForm.elderName = ''
  registerForm.visitTime = ''
  registerForm.remark = ''

  // 清除表单验证状态
  if (registerFormRef.value) {
    registerFormRef.value.clearValidate()
  }
}

// ==================== 生命周期钩子 ====================

/**
 * 组件挂载完成后执行
 * 功能：初始化加载来访列表数据和老人列表
 */
onMounted(() => {
  loadVisitList()
  loadElderList()
})
</script>

<style scoped>
/* ==================== 容器样式 ==================== */
.visit-container {
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

/* 工具栏样式 */
.toolbar {
  margin-bottom: 15px;
  text-align: left;
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
  .visit-container {
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

