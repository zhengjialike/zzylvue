<template>
  <el-card shadow="never">
    <h5 style="margin:0 0 20px 0">心理咨询记录</h5>
    <el-table :data="tableData" border stripe size="small" style="width:100%">
      <el-table-column prop="id" label="序号" width="60" />
      <el-table-column prop="oldid" label="老人ID" width="80" />
      <el-table-column prop="inputmsg" label="心理描述" min-width="250" show-overflow-tooltip />
      <el-table-column prop="airesult" label="AI 回复" min-width="350" show-overflow-tooltip />
      <el-table-column prop="aitype" label="类型" width="100">
        <template #default="{row}"><el-tag type="success" size="small">{{ row.aitype }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="createtime" label="咨询时间" width="170" />
    </el-table>
    <el-pagination background layout="total,prev,pager,next" :total="total" v-model:current-page="pageNum" :page-size="pageSize" @current-change="loadData" style="margin-top:12px;justify-content:center" />
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

function loadData() {
  axios.post('/psyRecord/page', { pageNum: pageNum.value, pageSize: pageSize.value }).then(res => {
    tableData.value = res.data.records
    total.value = res.data.total
  })
}

onMounted(loadData)
</script>
