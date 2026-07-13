<template>
  <div>
    <el-button type="primary" @click="showAddDialog = true" style="margin-bottom:12px">+ 新增分配</el-button>
    <el-table :data="tableData" border size="small" style="width:100%">
      <el-table-column type="index" width="50" label="#" />
      <el-table-column prop="bedNo" label="床位号" />
      <el-table-column prop="nurseName" label="护理人员" />
      <el-table-column prop="createTime" label="分配时间" />
      <el-table-column label="操作" width="100">
        <template #default="{row}">
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showAddDialog" title="新增护理分配" width="400px" @closed="resetForm">
      <el-form :model="form" label-width="80px">
        <el-form-item label="床位号"><el-input v-model="form.bedId" placeholder="床位ID" /></el-form-item>
        <el-form-item label="护理人员"><el-input v-model="form.nurseId" placeholder="护理人员ID" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const tableData = ref([]);
const showAddDialog = ref(false);
const form = ref({ bedId: "", nurseId: "" });

function loadData() {
  axios.get("/bedNursePage", { params: { pageNum: 1, pageSize: 50 } }).then(res => {
    tableData.value = res.data.list || [];
  });
}

function handleAdd() {
  axios.post("/bedNurse/add", { bedId: Number(form.value.bedId), nurseId: Number(form.value.nurseId) }).then(res => {
    if (res.data.code === 200) {
      showAddDialog.value = false;
      loadData();
    }
  });
}

function handleDelete(row) {
  axios.post("/bedNurse/delete", { id: row.id }).then(res => {
    if (res.data.code === 200) loadData();
  });
}

function resetForm() { form.value = { bedId: "", nurseId: "" }; }

onMounted(loadData);
</script>
