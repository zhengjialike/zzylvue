<template>
  <!-- 入住管理列表页：负责查询、分页、发起申请和进入五步流程详情。 -->
  <div>
    <!-- 搜索条件栏 -->
    <div style="text-align: left; margin-bottom: 10px">
      单据编号：<el-input style="width: 15%; margin-right: 15px" v-model="condForm.billNo" placeholder="请输入" />
      老人姓名：<el-input style="width: 15%; margin-right: 15px" v-model="condForm.elderName" placeholder="请输入" />
      身份证号：<el-input style="width: 15%; margin-right: 15px" v-model="condForm.idCard" placeholder="请输入" />
      入住日期：<el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="margin-right: 15px" />
      <el-button type="primary" @click="loadList">搜索</el-button>
      <el-button @click="resetCond">重置</el-button>
    </div>

    <div style="text-align: left; margin-bottom: 10px">
      <el-button type="primary" @click="startApply">发起入住申请</el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" fit>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="billNo" label="单据编号" width="200" />
      <el-table-column prop="elderName" label="老人姓名" width="100" />
      <el-table-column prop="idCard" label="身份证号" width="180" />
      <el-table-column prop="bedNo" label="入住床位" width="100" />
      <el-table-column prop="applicant" label="创建人" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column prop="checkInDate" label="入住日期" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="statusType(scope.row.flowStatus)">{{ scope.row.flowStatus }}</el-tag>
          <div style="font-size: 12px; color: #999">步骤{{ scope.row.currentStep }}/5</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewDetail(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination size="small" background layout="prev, pager, next" :total="total" v-model:current-page="condForm.pageNum" @current-change="loadList" />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
// 列表查询参数与后端 CheckInPageDto 一一对应；日期选择器的数组在 loadList 中拆成起止日期。
const condForm = reactive({ billNo: '', elderName: '', idCard: '', startDate: '', endDate: '', pageNum: 1, pageSize: 10 })
const dateRange = ref(null)
// tableData 保存当前页记录，total 保存符合条件的总记录数，供 Element Plus 分页组件使用。
const tableData = ref([])
const total = ref(0)

function loadList() {
  // 将页面查询条件提交给后端/checkInPage，并使用返回的list和total刷新表格及分页。
  if (dateRange.value && dateRange.value.length === 2) {
    condForm.startDate = dateRange.value[0]
    condForm.endDate = dateRange.value[1]
  } else {
    condForm.startDate = ''
    condForm.endDate = ''
  }
  axios.post('/checkInPage', condForm).then(res => {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  })
}

function resetCond() {
  // 重置时同时清空展示用 dateRange 和真正提交给后端的 startDate/endDate，避免旧日期残留。
  condForm.billNo = ''; condForm.elderName = ''; condForm.idCard = ''
  dateRange.value = null; condForm.startDate = ''; condForm.endDate = ''
  condForm.pageNum = 1; loadList()
}

function startApply() {
  // 不携带ID表示创建新入住申请，详情页会从第1步开始。
  router.push('/CheckInDetail')
}

function viewDetail(row) {
  // 携带入住单主键进入详情页，由详情接口恢复currentStep和历史数据。
  router.push({ path: '/CheckInDetail', query: { id: row.id } })
}

function statusType(s) {
  // 颜色仅用于视觉提示，真正能否继续办理仍由详情页和后端 flowStatus/currentStep 判断。
  if (s === '已完成') return 'success'
  if (s === '已关闭') return 'info'
  return 'warning'
}

onMounted(() => loadList())
</script>
