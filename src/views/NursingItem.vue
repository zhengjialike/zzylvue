<template>
  <div>
    <!-- 搜索条件栏 -->
    <div style="text-align: left; margin-bottom: 10px">
      护理项名称&nbsp;：&nbsp;
      <el-input
        style="width:20%; margin-right: 20px"
        v-model="condForm.itemname"
        placeholder="请输入名称"
      />
      状态&nbsp;：&nbsp;
      <el-select
        style="width:20%; margin-right: 20px"
        v-model="condForm.islock"
        placeholder="请选择状态"
      >
        <el-option value="启用">启用</el-option>
        <el-option value="禁用">禁用</el-option>
      </el-select>
      <el-button type="primary" @click="loadNursingItemList">搜索</el-button>
    </div>

    <!-- 添加按钮 -->
    <div style="text-align: left; margin-bottom: 10px">
      <el-button type="primary" @click="openNursingItemDialog">添加护理项目</el-button>
    </div>

    <!-- 表格列表 -->
    <el-table
      :data="nursingItemList"
      style="width: 100%"
      fit
    >
      <el-table-column type="index" width="50" />
      <el-table-column prop="itemname" label="名称" />
      <el-table-column prop="price" label="价格" width="100" />
      <el-table-column prop="unit" label="单位" width="100" />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column label="图片" width="80">
        <template #default="scope">
          <img :src="scope.row.image" width="35px" height="35px" />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="scope">
          <span>{{ scope.row.islock }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button type="primary" size="small" @click="editItem(scope.row)">编辑</el-button>
          <el-button type="success" size="small" @click="toggleLock(scope.row)">
            {{ scope.row.islock === '启用' ? '禁用' : '启用' }}
          </el-button>
          <el-button type="warning" size="small" @click="deleteItem(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      size="small"
      background
      layout="prev, pager, next"
      :total="total"
      v-model:current-page="condForm.pageNum"
      @current-change="doNursingItemPage"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="nursingItemDialogVisible"
      title="护理项目信息"
      width="40%"
    >
      <el-form
        label-width="auto"
        style="margin-left:5%; margin-right:5%; max-width: 600px"
      >
        <el-form-item label="护理项目名称">
          <el-input v-model="nursingItemForm.itemname" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number
            v-model="nursingItemForm.price"
            :precision="2"
            :step="0.1"
            :max="10"
          />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="nursingItemForm.unit" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="nursingItemForm.sort"
            :min="1"
            :max="10"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="nursingItemForm.islock">
            <el-radio value="启用">启用</el-radio>
            <el-radio value="禁用">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="照片">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8080/upload"
            :show-file-list="false"
            name="mf"
            :on-success="handleNursingPhotoSuccess"
          >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="护理项目描述">
          <el-input v-model="nursingItemForm.description" type="textarea" />
        </el-form-item>
        <el-form-item style="margin-left: 40%">
          <el-button type="primary" round @click="saveNursingItem">确认</el-button>
          <el-button type="warning" round @click="cancelDialog">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { Plus } from '@element-plus/icons-vue';

// ---- 搜索条件 ----
const condForm = reactive({
  itemname: '',
  islock: '',
  pageNum: 1,
  pageSize: 10
});

// ---- 列表数据 ----
const nursingItemList = ref([]);
const total = ref(0);

// ---- 对话框 ----
const nursingItemDialogVisible = ref(false);

// ---- 表单数据 ----
const nursingItemForm = reactive({
  id: '',
  itemname: '',
  price: null,
  unit: '',
  sort: null,
  islock: '启用',
  image: '',
  description: ''
});

// ---- 图片预览 ----
const imageUrl = ref(null);

// ---- 打开对话框 ----
function openNursingItemDialog() {
  nursingItemDialogVisible.value = true;
}

// ---- 图片上传成功 ----
function handleNursingPhotoSuccess(path) {
  imageUrl.value = path;
  nursingItemForm.image = path;
}

// ---- 保存 ----
function saveNursingItem() {
  axios.post("/saveNursingItem", nursingItemForm)
    .then(response => {
      if (response.data.code === 200) {
        ElMessage.success(response.data.msg);
        nursingItemDialogVisible.value = false;
        cleanNursingItemForm();
        loadNursingItemList(); // 刷新列表
      } else {
        ElMessage.error(response.data.msg);
      }
    })
    .catch(error => {
      console.log(error);
      ElMessage.error("请求失败");
    });
}

// ---- 清空表单 ----
function cleanNursingItemForm() {
  nursingItemForm.id = '';
  nursingItemForm.itemname = '';
  nursingItemForm.price = null;
  nursingItemForm.unit = '';
  nursingItemForm.sort = null;
  nursingItemForm.islock = '启用';
  nursingItemForm.image = '';
  nursingItemForm.description = '';
  imageUrl.value = null;
}

// ---- 取消 ----
function cancelDialog() {
  nursingItemDialogVisible.value = false;
  cleanNursingItemForm();
}

// ---- 加载列表 ----
function loadNursingItemList() {
  axios.post("/queryNursingItemList", condForm)
    .then(response => {
      const data = response.data;
      nursingItemList.value = data.nursingItems || [];
      total.value = data.total || 0;
    })
    .catch(error => {
      console.log(error);
      ElMessage.error("加载列表失败");
    });
}

// ---- 分页切换 ----
function doNursingItemPage(page) {
  condForm.pageNum = page;
  loadNursingItemList();
}

// ---- 编辑（预留） ----
function editItem(row) {
  // 将行数据复制到表单，打开对话框
  Object.assign(nursingItemForm, row);
  imageUrl.value = row.image;
  nursingItemDialogVisible.value = true;
}

// ---- 切换状态（预留） ----
function toggleLock(row) {
  const newLock = row.islock === '启用' ? '禁用' : '启用';
  axios.post("/updateNursingItemStatus", { id: row.id, islock: newLock })
    .then(response => {
      if (response.data.code === 200) {
        ElMessage.success("状态已更新");
        loadNursingItemList();
      } else {
        ElMessage.error(response.data.msg);
      }
    })
    .catch(error => console.log(error));
}

// ---- 删除（预留） ----
function deleteItem(id) {
  ElMessageBox.confirm('确认删除？', '提示', { type: 'warning' })
    .then(() => {
      axios.post("/deleteNursingItem", { id })
        .then(response => {
          if (response.data.code === 200) {
            ElMessage.success("删除成功");
            loadNursingItemList();
          } else {
            ElMessage.error(response.data.msg);
          }
        })
        .catch(error => console.log(error));
    })
    .catch(() => {});
}

// ---- 页面加载 ----
onMounted(() => {
  loadNursingItemList();
});
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 158px;
  height: 158px;
  text-align: center;
}
</style>