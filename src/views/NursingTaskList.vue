<template>
  <div class="nursing-task-list">
    <!-- 搜索条件 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="老人姓名">
        <el-input v-model="searchForm.elderlyName" placeholder="请输入" clearable></el-input>
      </el-form-item>
      <el-form-item label="护理员姓名">
        <el-select v-model="searchForm.nurseName" placeholder="请选择" clearable>
          <el-option
            v-for="nurse in nurseList"
            :key="nurse.id"
            :label="nurse.realname"
            :value="nurse.realname"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="护理项目">
        <el-select v-model="searchForm.nursingItemName" placeholder="请选择" clearable>
          <el-option
            v-for="item in nursingItemList"
            :key="item.id"
            :label="item.itemname"
            :value="item.itemname"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="期望服务时间">
        <el-date-picker
          v-model="searchForm.timeRange"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button @click="resetSearch">重置</el-button>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="success" @click="handleGenerateTasks" :loading="generating">生成任务</el-button>
      </el-form-item>
    </el-form>

    <!-- Tab标签页 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="待执行" name="0"></el-tab-pane>
      <el-tab-pane label="已执行" name="1"></el-tab-pane>
      <el-tab-pane label="已取消" name="2"></el-tab-pane>
    </el-tabs>

    <!-- 任务列表 -->
    <el-table :data="taskList" style="width: 100%" v-loading="loading">
      <el-table-column type="index" label="序号" width="60"></el-table-column>
      <el-table-column prop="elderlyName" label="老人姓名" width="100"></el-table-column>
      <el-table-column prop="bedNumber" label="床位号" width="80"></el-table-column>
      <el-table-column prop="itemName" label="护理项目名称" width="120"></el-table-column>
      <el-table-column prop="itemType" label="项目类型" width="120"></el-table-column>
      <el-table-column prop="nurseName" label="护理员姓名" width="100"></el-table-column>
      <el-table-column prop="expectedServiceTime" label="期望服务时间" width="180"></el-table-column>

      <!-- 执行人和时间（仅已执行显示） -->
      <el-table-column v-if="activeTab === '1'" prop="executorName" label="执行人" width="100"></el-table-column>
      <el-table-column v-if="activeTab === '1'" prop="executionTime" label="执行时间" width="180"></el-table-column>

      <!-- 取消人和时间（仅已取消显示） -->
      <el-table-column v-if="activeTab === '2'" prop="cancelerName" label="取消人" width="100"></el-table-column>
      <el-table-column v-if="activeTab === '2'" prop="cancelTime" label="取消时间" width="180"></el-table-column>

      <el-table-column prop="taskNo" label="关联单据" width="200"></el-table-column>

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="text" size="small" @click="viewTask(scope.row.id)">查看</el-button>

          <!-- 待执行状态显示取消和执行按钮 -->
          <template v-if="activeTab === '0'">
            <el-button type="text" size="small" @click="cancelTask(scope.row.id)">取消</el-button>
            <el-button type="text" size="small" @click="executeTask(scope.row.id)">执行</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px;"
    >
    </el-pagination>

    <!-- 执行任务对话框 -->
    <el-dialog v-model="executeDialogVisible" title="新增执行记录" width="500px">
      <el-form :model="executeForm" label-width="100px">
        <el-form-item label="执行时间" required>
          <el-date-picker
            v-model="executeForm.executionTime"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="执行图片">
          <el-upload
            action="http://localhost:8080/upload"
            name="mf"
            list-type="picture-card"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="执行记录" required>
          <el-input
            v-model="executeForm.executionRecord"
            type="textarea"
            :rows="4"
            placeholder="请输入"
            maxlength="100"
            show-word-limit
          >
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="executeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExecute">确定</el-button>
      </template>
    </el-dialog>

    <!-- 取消任务对话框 -->
    <el-dialog v-model="cancelDialogVisible" title="填写取消原因" width="500px">
      <el-form :model="cancelForm" label-width="100px">
        <el-form-item label="取消原因" required>
          <el-input
            v-model="cancelForm.cancelReason"
            type="textarea"
            :rows="4"
            placeholder="请输入"
            maxlength="100"
            show-word-limit
          >
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="cancelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCancel">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchForm = reactive({
  elderlyName: '',
  nurseName: '',
  nursingItemName: '',
  timeRange: []
});

const activeTab = ref('0');
const taskList = ref([]);
const loading = ref(false);
const generating = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

const nurseList = ref([]);
const nursingItemList = ref([]);

const executeDialogVisible = ref(false);
const cancelDialogVisible = ref(false);
const currentTaskId = ref(null);

const executeForm = reactive({
  executionTime: '',
  executionImage: '',
  executionRecord: ''
});

const cancelForm = reactive({
  cancelReason: ''
});

const currentUser = ref(null);

// 加载任务列表
function loadTaskList() {
  loading.value = true;

  let params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    status: parseInt(activeTab.value)
  };

  if (searchForm.elderlyName) {
    params.elderlyName = searchForm.elderlyName;
  }
  if (searchForm.nurseName) {
    params.nurseName = searchForm.nurseName;
  }
  if (searchForm.nursingItemName) {
    params.nursingItemName = searchForm.nursingItemName;
  }
  if (searchForm.timeRange && searchForm.timeRange.length === 2) {
    params.startTime = searchForm.timeRange[0];
    params.endTime = searchForm.timeRange[1];
  }

  axios.post('/nursingTask/pageList', params)
    .then(response => {
      if (response.data.code === 200) {
        taskList.value = response.data.tasks || [];
        total.value = response.data.total || 0;
      }
    })
    .catch(error => {
      ElMessage.error('加载失败');
    })
    .finally(() => {
      loading.value = false;
    });
}

// 搜索
function handleSearch() {
  pageNum.value = 1;
  loadTaskList();
}

// 重置
function resetSearch() {
  searchForm.elderlyName = '';
  searchForm.nurseName = '';
  searchForm.nursingItemName = '';
  searchForm.timeRange = [];
  pageNum.value = 1;
  loadTaskList();
}

// 切换Tab
function handleTabChange() {
  pageNum.value = 1;
  loadTaskList();
}

// 分页
function handleSizeChange(val) {
  pageSize.value = val;
  loadTaskList();
}

function handleCurrentChange(val) {
  pageNum.value = val;
  loadTaskList();
}

// 查看任务详情
function viewTask(taskId) {
  router.push({ path: '/NursingTaskList/NursingTaskDetail', query: { id: taskId } });
}

// 执行任务
function executeTask(taskId) {
  currentTaskId.value = taskId;
  executeForm.executionTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  executeForm.executionImage = '';
  executeForm.executionRecord = '';
  executeDialogVisible.value = true;
}

// 上传成功
function handleUploadSuccess(response) {
  if (response && typeof response === 'string' && !response.startsWith('error')) {
    executeForm.executionImage = response;
    ElMessage.success('上传成功');
  } else {
    ElMessage.error('上传失败');
  }
}

// 上传前校验
function beforeUpload(file) {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件');
    return false;
  }
  return true;
}

// 确认执行
function confirmExecute() {
  if (!executeForm.executionTime) {
    ElMessage.warning('请选择执行时间');
    return;
  }
  if (!executeForm.executionRecord) {
    ElMessage.warning('请填写执行记录');
    return;
  }

  axios.post('/nursingTask/execute', {
    taskId: currentTaskId.value,
    executionTime: executeForm.executionTime,
    executionImage: executeForm.executionImage,
    executionRecord: executeForm.executionRecord,
    executorId: 2
  })
    .then(response => {
      if (response.data.code === 200) {
        ElMessage.success('执行成功');
        executeDialogVisible.value = false;
        loadTaskList();
      } else {
        ElMessage.error(response.data.msg);
      }
    })
    .catch(error => {
      ElMessage.error('执行失败');
    });
}

// 取消任务
function cancelTask(taskId) {
  currentTaskId.value = taskId;
  cancelForm.cancelReason = '';
  cancelDialogVisible.value = true;
}

// 确认取消
function confirmCancel() {
  if (!cancelForm.cancelReason) {
    ElMessage.warning('请填写取消原因');
    return;
  }

  axios.post('/nursingTask/cancel', {
    taskId: currentTaskId.value,
    cancelReason: cancelForm.cancelReason,
    cancelerId: 2
  })
    .then(response => {
      if (response.data.code === 200) {
        ElMessage.success('取消成功');
        cancelDialogVisible.value = false;
        loadTaskList();
      } else {
        ElMessage.error(response.data.msg);
      }
    })
    .catch(error => {
      ElMessage.error('取消失败');
    });
}

// 加载护理员列表
function loadNurseList() {
  axios.post('/user/nurseList', {
    pageNum: 1,
    pageSize: 100
  }).then(response => {
    if (response.data.code === 200) {
      nurseList.value = response.data.users || [];
    }
  }).catch(error => {
    console.error('加载护理员列表失败:', error);
  });
}

// 加载护理项目列表
function loadNursingItemList() {
  axios.post('/nursingItemPage', {
    pageNum: 1,
    pageSize: 100
  }).then(response => {
    if (response.data.code === 200) {
      nursingItemList.value = response.data.nursingItems;
    }
  });
}

// 加载当前登录用户
function loadCurrentUser() {
  axios.get('/loadInfo').then(response => {
    if (response.data) {
      currentUser.value = response.data;
    }
  });
}

// 生成任务
function handleGenerateTasks() {
  generating.value = true;
  axios.post('/nursingTask/generate')
    .then(response => {
      if (response.data.code === 200) {
        ElMessage.success(response.data.msg);
        loadTaskList();
      } else {
        ElMessage.error(response.data.msg);
      }
    })
    .catch(error => {
      ElMessage.error('生成失败');
    })
    .finally(() => {
      generating.value = false;
    });
}

onMounted(() => {
  loadTaskList();
  loadNurseList();
  loadNursingItemList();
  loadCurrentUser();
});
</script>

<style scoped>
.nursing-task-list {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}
</style>
