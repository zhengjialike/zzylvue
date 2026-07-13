<template>
  <div>
    <el-form :inline="true" :model="query" size="small">
      <el-form-item label="任务编号"><el-input v-model="query.taskNo" placeholder="请输入" clearable /></el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" placeholder="请选择" clearable>
          <el-option label="待执行" :value="0" />
          <el-option label="已执行" :value="1" />
          <el-option label="已取消" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item><el-button type="primary" @click="loadData">搜索</el-button></el-form-item>
    </el-form>

    <el-table :data="tableData" border size="small" style="width:100%">
      <el-table-column type="index" width="50" label="#" />
      <el-table-column prop="taskNo" label="任务编号" width="140" />
      <el-table-column prop="elderlyName" label="老人姓名" width="80" />
      <el-table-column prop="bedNo" label="床位号" width="80" />
      <el-table-column prop="nursingItemName" label="护理项目" width="100" />
      <el-table-column prop="nurseName" label="护理人员" width="80" />
      <el-table-column prop="expectedServiceTime" label="预计时间" width="160" />
      <el-table-column prop="creator" label="创建人" width="80" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="状态" width="80">
        <template #default="{row}">
          <el-tag :type="row.status === 0 ? 'warning' : row.status === 1 ? 'success' : 'info'">
            {{ row.status === 0 ? '待执行' : row.status === 1 ? '已执行' : '已取消' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="executionRecord" label="执行记录" minWidth="140" show-overflow-tooltip />
    </el-table>
    <el-pagination v-model:current-page="pageNum" :page-size="10" :total="total" layout="total, prev, pager, next" @current-change="loadData" style="margin-top:12px;justify-content:flex-end" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const tableData = ref([]);
const pageNum = ref(1);
const total = ref(0);
const query = ref({ taskNo: "", status: null });

function loadData() {
  axios.get("/nursingTaskPage", { params: { pageNum: pageNum.value, pageSize: 10, ...query.value } }).then(res => {
    tableData.value = res.data.list || [];
    total.value = res.data.total || 0;
  });
}

onMounted(loadData);
</script>
