<template>
  <div class="task-detail">
    <!-- 基本信息 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="老人姓名">{{ taskDetail.elderlyName }}</el-descriptions-item>
        <el-descriptions-item label="护理等级">{{ taskDetail.nursingLevel }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ taskDetail.gender === 1 ? '男' : taskDetail.gender === 2 ? '女' : '未知' }}</el-descriptions-item>
        <el-descriptions-item label="年龄">{{ taskDetail.age || '' }}</el-descriptions-item>
        <el-descriptions-item label="床位号">{{ taskDetail.bedNumber }}</el-descriptions-item>
        <el-descriptions-item label="护理员姓名">{{ taskDetail.nurseNames || taskDetail.nurseName || '未安排' }}</el-descriptions-item>
        <el-descriptions-item label="" :span="2">
          <el-image
            v-if="taskDetail.elderlyPhoto"
            :src="taskDetail.elderlyPhoto"
            style="width: 100px; height: 100px;"
            fit="cover"
          >
          </el-image>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 护理项目 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>护理项目</span>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="护理项目名称">{{ taskDetail.itemName }}</el-descriptions-item>
        <el-descriptions-item label="关联单据">{{ taskDetail.taskNo }}</el-descriptions-item>
        <el-descriptions-item label="执行状态">
          <el-tag :type="getStatusType(taskDetail.status)">
            {{ getStatusText(taskDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="项目类型">{{ taskDetail.itemType }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ taskDetail.creator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ taskDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="期望服务时间">{{ taskDetail.expectedServiceTime }}</el-descriptions-item>
        <el-descriptions-item label="备注信息">{{ taskDetail.remark }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 执行记录（仅已执行显示） -->
    <el-card v-if="taskDetail.status === 1" class="info-card">
      <template #header>
        <div class="card-header">
          <span>执行记录</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="执行人">{{ taskDetail.executorName }}</el-descriptions-item>
        <el-descriptions-item label="执行时间">{{ taskDetail.executionTime }}</el-descriptions-item>
        <el-descriptions-item label="执行图片">
          <el-image
            v-if="taskDetail.executionImage"
            :src="taskDetail.executionImage"
            style="width: 100px; height: 100px;"
            fit="cover"
          >
          </el-image>
        </el-descriptions-item>
        <el-descriptions-item label="执行记录">{{ taskDetail.executionRecord }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 取消记录（仅已取消显示） -->
    <el-card v-if="taskDetail.status === 2" class="info-card">
      <template #header>
        <div class="card-header">
          <span>取消记录</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="取消人">{{ taskDetail.cancelerName }}</el-descriptions-item>
        <el-descriptions-item label="取消时间">{{ taskDetail.cancelTime }}</el-descriptions-item>
        <el-descriptions-item label="取消原因">{{ taskDetail.cancelReason }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 返回按钮 -->
    <div class="footer">
      <el-button @click="goBack">返回</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const taskDetail = ref({});

const elderlyAge = computed(() => {
  if (!taskDetail.value.birthday) return '';
  const birth = new Date(taskDetail.value.birthday);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
});

// 加载任务详情
function loadTaskDetail() {
  const taskId = route.query.id;

  axios.get('/nursingTask/detail?taskId=' + taskId)
    .then(response => {
      if (response.data.code === 200) {
        taskDetail.value = response.data.task;
      }
    })
    .catch(error => {
      ElMessage.error('加载失败');
    });
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    0: '待执行',
    1: '已执行',
    2: '已取消'
  };
  return statusMap[status] || '未知';
}

// 获取状态类型
function getStatusType(status) {
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'info'
  };
  return typeMap[status] || '';
}

// 返回
function goBack() {
  router.back();
}

onMounted(() => {
  loadTaskDetail();
});
</script>

<style scoped>
.task-detail {
  padding: 20px;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
}

.footer {
  text-align: center;
  margin-top: 20px;
}
</style>
