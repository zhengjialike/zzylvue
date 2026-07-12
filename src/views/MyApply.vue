<template>
  <div>
    <!-- 搜索条件栏 -->
    <div style="text-align: left; margin-bottom: 10px">
      单据编号&nbsp;：
      <el-input style="width: 15%; margin-right: 15px" v-model="condForm.billNo" placeholder="请输入" />
      单据类别&nbsp;：
      <el-select style="width: 15%; margin-right: 15px" v-model="condForm.billType" placeholder="请选择">
        <el-option label="入住" value="入住" />
        <el-option label="退住" value="退住" />
      </el-select>
      申请时间&nbsp;：
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        value-format="YYYY-MM-DD"
        style="margin-right: 15px"
      />
      <el-button type="primary" @click="loadList">搜索</el-button>
      <el-button @click="resetCond">重置</el-button>
    </div>

    <!-- 原型按流程状态提供快捷筛选；空字符串表示全部。 -->
    <el-tabs v-model="condForm.flowStatus" @tab-change="handleStatusChange" style="margin-bottom: 10px">
      <el-tab-pane label="全部" name="" />
      <el-tab-pane label="申请中" name="申请中" />
      <el-tab-pane label="已完成" name="已完成" />
      <el-tab-pane label="已关闭" name="已关闭" />
    </el-tabs>

    <!-- 操作按钮 -->
    <div style="text-align: left; margin-bottom: 10px">
      <el-button type="primary" @click="openCategoryDialog">发起申请</el-button>
    </div>

    <!-- 列表 -->
    <el-table :data="tableData" style="width: 100%" fit>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="billNo" label="单据编号" width="200" />
      <el-table-column prop="billTitle" label="单据标题" width="180" />
      <el-table-column prop="billType" label="单据类别" width="100" />
      <el-table-column prop="applicant" label="申请人" width="100" />
      <el-table-column prop="applyTime" label="申请时间" width="170" />
      <el-table-column label="完成时间" width="170">
        <template #default="scope">{{ scope.row.finishTime || '——' }}</template>
      </el-table-column>
      <el-table-column prop="flowStatus" label="流程状态" width="100" />
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewDetail(scope.row)">查看</el-button>
          <el-button
            type="warning"
            size="small"
            :disabled="!scope.row.canRevoke"
            @click="revoke(scope.row)"
          >撤销</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      size="small"
      background
      layout="prev, pager, next"
      :total="total"
      v-model:current-page="condForm.pageNum"
      @current-change="loadList"
    />

    <!-- 选择申请单据类别对话框 -->
    <el-dialog v-model="categoryDialogVisible" title="选择申请单据类别" width="30%">
      <el-form label-width="100px">
        <el-form-item label="* 单据类别：">
          <el-radio-group v-model="selectedCategory">
            <el-radio value="入住">入住</el-radio>
            <el-radio value="退住">退住</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item style="margin-left: 40%">
          <el-button round @click="categoryDialogVisible = false">取消</el-button>
          <el-button type="primary" round @click="confirmCategory">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const condForm = reactive({
  billNo: '',
  billType: '',
  flowStatus: '',
  startDate: '',
  endDate: '',
  pageNum: 1,
  pageSize: 10
})
const dateRange = ref(null)
const tableData = ref([])
const total = ref(0)

const categoryDialogVisible = ref(false)
const selectedCategory = ref('入住')

function loadList() {
  if (dateRange.value && dateRange.value.length === 2) {
    condForm.startDate = dateRange.value[0]
    condForm.endDate = dateRange.value[1]
  } else {
    condForm.startDate = ''
    condForm.endDate = ''
  }
  axios.post('/myApplyPage', condForm).then(res => {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  })
}

function resetCond() {
  condForm.billNo = ''
  condForm.billType = ''
  condForm.flowStatus = ''
  dateRange.value = null
  condForm.startDate = ''
  condForm.endDate = ''
  condForm.pageNum = 1
  loadList()
}

function handleStatusChange() {
  condForm.pageNum = 1
  loadList()
}

function openCategoryDialog() {
  selectedCategory.value = '入住'
  categoryDialogVisible.value = true
}

function confirmCategory() {
  categoryDialogVisible.value = false
  if (selectedCategory.value === '入住') {
    router.push('/CheckInDetail')
  } else {
    router.push('/CheckOutDetail')
  }
}

function viewDetail(row) {
  if (row.billType === '入住') {
    router.push({ path: '/CheckInDetail', query: { id: row.id } })
  } else {
    router.push({ path: '/CheckOutDetail', query: { id: row.id } })
  }
}

async function revoke(row) {
  try {
    await ElMessageBox.confirm('此操作将撤销已提交信息，是否继续？', '确认撤销', { type: 'warning' })
  } catch (_) {
    return
  }

  const url = row.billType === '入住' ? '/revokeCheckIn' : '/revokeCheckOut'
  try {
    const res = await axios.post(url, { id: row.id })
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg || '撤销成功')
      loadList()
    } else {
      ElMessage.error(res.data.msg || '撤销失败')
    }
  } catch (error) {
    const message = error.response?.status === 401
      ? '登录状态已失效，请重新登录后再撤销'
      : (error.response?.data?.message || '撤销失败，请检查后端服务后重试')
    ElMessage.error(message)
  }
}

onMounted(() => {
  loadList()
})
</script>
