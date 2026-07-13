<template>
  <!-- 合同管理查询页：合同由入住签约自动创建、退住解除合同自动置为已失效。 -->
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
    <el-table
      :data="tableData"
      class="business-table"
      style="width: 100%"
      table-layout="fixed"
      :header-cell-style="{ textAlign: 'center' }"
      :cell-style="{ textAlign: 'center' }"
    >
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column prop="contractNo" label="合同编号" min-width="120" align="center" show-overflow-tooltip />
      <el-table-column prop="contractName" label="合同名称" min-width="110" align="center" show-overflow-tooltip />
      <el-table-column prop="elderName" label="老人姓名" min-width="75" align="center" show-overflow-tooltip />
      <el-table-column prop="idCard" label="老人身份证号" min-width="135" align="center" show-overflow-tooltip />
      <el-table-column prop="creator" label="创建人" min-width="70" align="center" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" min-width="120" align="center" show-overflow-tooltip />
      <el-table-column label="合同期限" min-width="125" align="center">
        <template #default="scope">
          {{ scope.row.startDate }} ~ {{ scope.row.endDate }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="合同状态" min-width="75" align="center" />
      <el-table-column label="操作" width="80" align="center">
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
        <el-descriptions-item label="入住单号">{{ detail.checkInBillNo || '——' }}</el-descriptions-item>
        <el-descriptions-item label="签约日期">{{ detail.signDate || '——' }}</el-descriptions-item>
        <el-descriptions-item label="丙方姓名" v-if="detail.partyCName">{{ detail.partyCName }}</el-descriptions-item>
        <el-descriptions-item label="丙方联系方式" v-if="detail.partyCPhone">{{ detail.partyCPhone }}</el-descriptions-item>
        <el-descriptions-item label="合同文件">
          <el-link v-if="detail.contractFile" :href="detail.contractFile" target="_blank" type="primary">查看合同</el-link>
          <span v-else>——</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ detail.creator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item v-if="detail.status === '已失效'" label="解除日期">{{ detail.terminateDate || '——' }}</el-descriptions-item>
        <el-descriptions-item v-if="detail.status === '已失效'" label="提交人">{{ detail.terminateSubmitter || '——' }}</el-descriptions-item>
        <el-descriptions-item v-if="detail.status === '已失效'" label="解除协议">
          <el-link v-if="detail.terminateAgreement" :href="detail.terminateAgreement" target="_blank" type="primary">查看解除协议</el-link>
          <span v-else>——</span>
        </el-descriptions-item>
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
// Element Plus 日期范围控件使用数组，后端 DTO 使用两个 LocalDate 字段，因此不能直接复用同一属性。
const dateRange = ref(null)
const tableData = ref([])
const total = ref(0)

// 合同详情不是简单复用列表行：后端还会聚合入住签约资料和退住解除资料。
const detailDialogVisible = ref(false)
const detail = ref({})

function loadList() {
  // 合同期限控件返回日期数组，提交前拆分为后端分页DTO需要的开始和结束日期。
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
  // 将页码恢复到第一页，避免在较大页码上重查后出现空表格。
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
  // 列表只包含合同主表字段；详情接口会额外返回合同文件、丙方信息和已失效合同的解除协议。
  axios.post('/contractDetail', { id: row.id }).then(res => {
    detail.value = res.data || {}
    detailDialogVisible.value = true
  })
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.business-table {
  margin-bottom: 14px;
}

.business-table :deep(.el-table__cell .cell) {
  padding: 0 6px;
}
</style>
