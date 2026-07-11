<template>
  <!-- 搜索条件 -->
  <div style="margin-bottom: 20px;">
    客户昵称：
    <el-input
      v-model="condForm.nickname"
      placeholder="请输入"
      style="width: 200px; margin-right: 15px;" />

    客户手机号：
    <el-input
      v-model="condForm.phone"
      placeholder="请输入"
      style="width: 200px; margin-right: 15px;" />

    <el-button @click="resetSearch">重置</el-button>
    <el-button type="primary" @click="loadCustomerList">搜索</el-button>
  </div>

  <!-- 表格 -->
  <el-table :data="customerList" style="width: 100%" fit>
    <el-table-column type="index" width="60" label="序号" />
    <el-table-column prop="nickname" label="客户昵称" min-width="120" />
    <el-table-column prop="phone" label="客户手机号" width="130" />
    <el-table-column prop="isSigned" label="是否签约" width="100">
      <template #default="scope">
        <span v-if="scope.row.isSigned === '是'" style="color: dodgerblue;">
          是
        </span>
        <span v-else style="color: crimson;">
          否
        </span>
      </template>
    </el-table-column>
    <el-table-column prop="orderCount" label="服务下单次数（次）" width="150" />
    <el-table-column prop="elderlyNames" label="绑定老人姓名" min-width="200">
      <template #default="scope">
        <span>{{ scope.row.elderlyNames || '—' }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="createTime" label="首次登录时间" width="180" />
  </el-table>

  <!-- 分页 -->
  <el-pagination
    size="small"
    background
    layout="prev, pager, next"
    :total="total"
    :current-page="condForm.pageNum"
    :page-size="condForm.pageSize"
    @current-change="doCustomerPage"
    style="margin-top: 20px;" />
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 查询条件
const condForm = reactive({
  nickname: '',
  phone: '',
  pageNum: 1,
  pageSize: 10
})

// 列表数据
const customerList = ref([])
const total = ref(0)

// ---------- 加载列表 ----------
function loadCustomerList() {
  condForm.pageNum = 1
  axios.post('/customerPage', condForm)
    .then(response => {
      customerList.value = response.data.customers || []
      total.value = response.data.total || 0
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('加载客户列表失败')
    })
}

// ---------- 重置搜索 ----------
function resetSearch() {
  condForm.nickname = ''
  condForm.phone = ''
  loadCustomerList()
}

// ---------- 分页 ----------
function doCustomerPage(pageNum) {
  condForm.pageNum = pageNum
  axios.post('/customerPage', condForm)
    .then(response => {
      customerList.value = response.data.customers || []
      total.value = response.data.total || 0
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('加载数据失败')
    })
}

// ---------- 生命周期 ----------
onMounted(() => {
  loadCustomerList()
})
</script>

<style scoped>
/* 可根据需要添加自定义样式 */
</style>