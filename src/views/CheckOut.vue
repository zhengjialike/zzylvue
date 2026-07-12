<template>
  <div>
    <!-- 搜索条件栏 -->
    <div style="text-align: left; margin-bottom: 10px">
      单据编号：<el-input style="width: 15%; margin-right: 15px" v-model="condForm.billNo" placeholder="请输入" />
      老人姓名：<el-input style="width: 15%; margin-right: 15px" v-model="condForm.elderName" placeholder="请输入" />
      身份证号：<el-input style="width: 15%; margin-right: 15px" v-model="condForm.idCard" placeholder="请输入" />
      退住日期：<el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="margin-right: 15px" />
      <el-button type="primary" @click="loadList">搜索</el-button>
      <el-button @click="resetCond">重置</el-button>
    </div>

    <div style="text-align: left; margin-bottom: 10px">
      <el-button type="primary" @click="startApply">发起退住申请</el-button>
    </div>

    <el-table :data="tableData" style="width: 100%" fit>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="billNo" label="单据编号" width="200" />
      <el-table-column prop="elderName" label="老人姓名" width="100" />
      <el-table-column prop="idCard" label="身份证号" width="180" />
      <el-table-column prop="applicant" label="创建人" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column prop="checkOutDate" label="退住日期" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="statusType(scope.row.flowStatus)">{{ scope.row.flowStatus }}</el-tag>
          <div style="font-size: 12px; color: #999">步骤{{ scope.row.currentStep }}/6</div>
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
const condForm = reactive({ billNo: '', elderName: '', idCard: '', startDate: '', endDate: '', pageNum: 1, pageSize: 10 })
const dateRange = ref(null)
const tableData = ref([])
const total = ref(0)

function loadList() {
  if (dateRange.value && dateRange.value.length === 2) {
    condForm.startDate = dateRange.value[0]
    condForm.endDate = dateRange.value[1]
  } else {
    condForm.startDate = ''
    condForm.endDate = ''
  }
  axios.post('/checkOutPage', condForm).then(res => {
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  })
}

function resetCond() {
  condForm.billNo = ''; condForm.elderName = ''; condForm.idCard = ''
  dateRange.value = null; condForm.startDate = ''; condForm.endDate = ''
  condForm.pageNum = 1; loadList()
}

function startApply() {
  router.push('/CheckOutDetail')
}

function viewDetail(row) {
  router.push({ path: '/CheckOutDetail', query: { id: row.id } })
}

function statusType(s) {
  if (s === '已完成') return 'success'
  if (s === '已关闭') return 'info'
  return 'warning'
}

onMounted(() => loadList())
</script>