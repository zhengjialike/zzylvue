<template>
  <div>
    <!-- 搜索条件栏 -->
    <div style="text-align: left; margin-bottom: 10px">
      合同编号&nbsp;：
      <el-input style="width: 15%; margin-right: 15px" v-model="condForm.contractNo" placeholder="请输入" />
      老人姓名&nbsp;：
      <el-input style="width: 15%; margin-right: 15px" v-model="condForm.elderName" placeholder="请输入" />
      合同状态&nbsp;：
      <el-select style="width: 15%; margin-right: 15px" v-model="condForm.status" placeholder="请选择">
        <el-option label="未生效" value="未生效" />
        <el-option label="生效中" value="生效中" />
        <el-option label="已过期" value="已过期" />
        <el-option label="已失效" value="已失效" />
      </el-select>
      合同期限&nbsp;：
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

    <!-- 列表 -->
    <el-table :data="tableData" style="width: 100%" fit>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="contractNo" label="合同编号" width="200" />
      <el-table-column prop="contractName" label="合同名称" width="180" />
      <el-table-column prop="elderName" label="老人姓名" width="100" />
      <el-table-column prop="idCard" label="老人身份证号" width="180" />
      <el-table-column prop="creator" label="创建人" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="合同期限" width="220">
        <template #default="scope">
          {{ scope.row.startDate }} ~ {{ scope.row.endDate }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="合同状态" width="100" />
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewDetail(scope.row)">查看</el-button>
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="合同详情" width="45%">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="合同编号">{{ detail.contractNo }}</el-descriptions-item>
        <el-descriptions-item label="合同名称">{{ detail.contractName }}</el-descriptions-item>
        <el-descriptions-item label="老人姓名">{{ detail.elderName }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ detail.idCard }}</el-descriptions-item>
        <el-descriptions-item label="合同期限">{{ detail.startDate }} ~ {{ detail.endDate }}</el-descriptions-item>
        <el-descriptions-item label="合同状态">{{ detail.status }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ detail.creator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="失效时间">{{ detail.invalidTime }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detail.remark }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'

const condForm = reactive({
  contractNo: '',
  elderName: '',
  status: '',
  startDate: '',
  endDate: '',
  pageNum: 1,
  pageSize: 10
})
const dateRange = ref(null)
const tableData = ref([])
const total = ref(0)

const detailDialogVisible = ref(false)
const detail = ref({})

function loadList() {
  if (dateRange.value && dateRange.value.length === 2) {
    condForm.startDate = dateRange.value[0]
    condForm.endDate = dateRange.value[1]
  } else {
    condForm.startDate = ''
    condForm.endDate = ''
  }
  axios.post('/contractPage', condForm).then(res => {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  })
}

function resetCond() {
  condForm.contractNo = ''
  condForm.elderName = ''
  condForm.status = ''
  dateRange.value = null
  condForm.startDate = ''
  condForm.endDate = ''
  condForm.pageNum = 1
  loadList()
}

function viewDetail(row) {
  axios.post('/contractDetail', { id: row.id }).then(res => {
    detail.value = res.data || {}
    detailDialogVisible.value = true
  })
}

onMounted(() => {
  loadList()
})
</script>