<template>
  <div class="bed-management">
    <!-- 顶部操作区 -->
    <div class="header-section">
      <!-- 楼层Tab -->
      <el-tabs v-model="activeFloorId" @tab-change="handleFloorChange" class="floor-tabs">
        <el-tab-pane
          v-for="floor in floorList"
          :key="floor.id"
          :label="floor.floorName"
          :name="floor.id">
          <template #label>
            <span>{{ floor.floorName }}</span>
            <el-icon
              v-if="activeFloorId === floor.id"
              style="margin-left: 5px; cursor: pointer;"
              @click.stop="openEditFloorDialog(floor)">
              <Edit />
            </el-icon>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="openAddFloorDialog">新增楼层</el-button>
        <el-button type="primary" @click="openAddRoomDialog">新增房间</el-button>
      </div>
    </div>

    <!-- 状态图例 -->
    <div class="legend-section">
      <div class="legend-item">
        <img :src="BED_STATUS.empty" alt="空闲" class="legend-icon" />
        <span>空闲</span>
      </div>
      <div class="legend-item">
        <img :src="BED_STATUS.full" alt="已入住" class="legend-icon" />
        <span>已入住</span>
      </div>
      <div class="legend-item">
        <img :src="BED_STATUS.free" alt="请假中" class="legend-icon" />
        <span>请假中</span>
      </div>
    </div>

    <!-- 房间列表 -->
    <div class="room-container">
      <div v-if="currentRoomList.length === 0" class="empty-tip">
        当前楼层暂无房间
      </div>

      <div v-else class="room-grid">
        <div v-for="room in currentRoomList" :key="room.id" class="room-card">
          <!-- 房间头部 -->
          <div class="room-header">
            <div class="room-info">
              <div class="room-number">房间号：{{ room.roomNumber }}</div>
              <div class="room-type">房间类型：{{ getRoomTypeName(room.roomTypeId) }}</div>
            </div>
            <div class="room-actions">
              <el-button
                type="danger"
                link
                size="small"
                :disabled="hasBeds(room.id)"
                @click="deleteRoom(room.id)">删除</el-button>
              <el-button
                type="primary"
                link
                size="small"
                @click="openEditRoomDialog(room)">编辑</el-button>
              <el-button
                type="info"
                link
                size="small"
                disabled
                @click="viewRoomDetail(room)">查看</el-button>
              <el-button
                type="primary"
                size="small"
                @click="openAddBedDialog(room.id)">新增床位</el-button>
            </div>
          </div>

          <!-- 床位网格 -->
          <div class="bed-grid">
            <div v-if="getRoomBeds(room.id).length === 0" class="no-bed-tip">
              当前房间没有安排床位
            </div>

            <div v-else v-for="bed in getRoomBeds(room.id)" :key="bed.id" class="bed-item">
              <div class="bed-content" :class="{ 'occupied': bed.elderlyId }">
                <img
                  :src="getBedIcon(bed.status)"
                  alt="床位"
                  class="bed-icon" />
                <div class="bed-info">
                  <div class="bed-number">床位号：{{ bed.bedNumber }}</div>
                  <div class="bed-status">
                    {{ bed.elderlyId ? `老人姓名：${getElderlyName(bed.elderlyId)}` : getStatusText(bed.status) }}
                  </div>
                </div>
                <div class="bed-actions" v-if="bed.elderlyId">
                  <el-icon @click="deleteBed(bed.id)" class="action-icon"><Delete /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 弹窗区域 ==================== -->

    <!-- 新增楼层对话框 -->
    <el-dialog v-model="addFloorVisible" title="新增楼层" width="400px">
      <el-form :model="floorForm" label-width="80px">
        <el-form-item label="楼层名称" required>
          <el-input v-model="floorForm.floorName" placeholder="请输入" maxlength="5" show-word-limit />
        </el-form-item>
        <el-form-item label="排序" required>
          <el-input-number v-model="floorForm.sort" :min="1" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addFloorVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFloor">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑楼层对话框 -->
    <el-dialog v-model="editFloorVisible" title="编辑楼层" width="400px">
      <el-form :model="floorForm" label-width="80px">
        <el-form-item label="楼层名称" required>
          <el-input v-model="floorForm.floorName" placeholder="请输入" maxlength="5" show-word-limit />
        </el-form-item>
        <el-form-item label="排序" required>
          <el-input-number v-model="floorForm.sort" :min="1" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editFloorVisible = false">取消</el-button>
        <el-button type="danger" @click="deleteFloor">删除</el-button>
        <el-button type="primary" @click="updateFloor">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增房间对话框 -->
    <el-dialog v-model="addRoomVisible" title="新增房间" width="400px">
      <el-form :model="roomForm" label-width="80px">
        <el-form-item label="房间号" required>
          <el-input v-model="roomForm.roomNumber" placeholder="请输入" maxlength="5" show-word-limit />
        </el-form-item>
        <el-form-item label="房间类型" required>
          <el-select v-model="roomForm.roomTypeId" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="type in roomTypeList"
              :key="type.id"
              :label="type.typeName"
              :value="type.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" required>
          <el-input-number v-model="roomForm.sort" :min="1" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addRoomVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRoom">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑房间对话框 -->
    <el-dialog v-model="editRoomVisible" title="编辑房间" width="400px">
      <el-form :model="roomForm" label-width="80px">
        <el-form-item label="房间号" required>
          <el-input v-model="roomForm.roomNumber" placeholder="请输入" maxlength="5" show-word-limit />
        </el-form-item>
        <el-form-item label="房间类型" required>
          <el-select v-model="roomForm.roomTypeId" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="type in roomTypeList"
              :key="type.id"
              :label="type.typeName"
              :value="type.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" required>
          <el-input-number v-model="roomForm.sort" :min="1" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editRoomVisible = false">取消</el-button>
        <el-button type="primary" @click="updateRoom">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增床位对话框 -->
    <el-dialog v-model="addBedVisible" title="新增床位" width="400px">
      <el-form :model="bedForm" label-width="80px">
        <el-form-item label="床位号" required>
          <el-input v-model="bedForm.bedNumber" placeholder="请输入" maxlength="10" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addBedVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBed">确定</el-button>
      </template>
    </el-dialog>

    <!-- 房间详情对话框 -->
    <el-dialog v-model="roomDetailVisible" title="房间详情" width="700px">
      <div class="room-detail-content">
        <div class="detail-header">
          <div>房间号：{{ currentRoom?.roomNumber }}</div>
          <div>房间类型：{{ getRoomTypeName(currentRoom?.roomTypeId) }}</div>
          <div>总床位数：{{ getRoomBeds(currentRoom?.id).length }}</div>
          <div>入住床位数：{{ getOccupiedBeds(currentRoom?.id) }}</div>
          <div>入住率：{{ calculateOccupancyRate(currentRoom?.id) }}</div>
        </div>

        <el-table :data="getRoomBedsWithElderly(currentRoom?.id)" style="width: 100%; margin-top: 20px;">
          <el-table-column prop="bedNumber" label="床位号" width="100" />
          <el-table-column label="老人姓名" width="120">
            <template #default="scope">
              {{ scope.row.elderlyId ? getElderlyName(scope.row.elderlyId) : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="护理等级" width="120">
            <template #default="scope">
              <span>-</span>
            </template>
          </el-table-column>
          <el-table-column label="入住期间" min-width="200">
            <template #default="scope">
              <span>-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="roomDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'

// ==================== 常量定义 ====================
const BED_STATUS = {
  empty: 'https://zzyl-oss-zj.oss-cn-beijing.aliyuncs.com/root_posture/empty.png',   // 空闲
  full: 'https://zzyl-oss-zj.oss-cn-beijing.aliyuncs.com/root_posture/full.png',     // 已入住
  free: 'https://zzyl-oss-zj.oss-cn-beijing.aliyuncs.com/root_posture/free.png'      // 请假中
}

const STATUS_TEXT = {
  0: '空闲',
  1: '已入住',
  2: '请假中'
}

// ==================== 数据定义 ====================
const activeFloorId = ref(null)           // 当前选中的楼层ID
const floorList = ref([])                 // 楼层列表
const roomList = ref([])                  // 房间列表
const bedMap = ref({})                    // 床位映射 {roomId: [beds]}
const roomTypeList = ref([])              // 房型列表
const elderlyMap = ref({})                // 老人映射 {elderlyId: name}

// 表单数据
const floorForm = reactive({
  id: null,
  floorName: '',
  sort: 1
})

const roomForm = reactive({
  id: null,
  roomNumber: '',
  roomTypeId: null,
  floorId: null,
  sort: 1
})

const bedForm = reactive({
  id: null,
  bedNumber: '',
  roomId: null,
  elderlyId: null,
  status: 0
})

// 弹窗可见性
const addFloorVisible = ref(false)
const editFloorVisible = ref(false)
const addRoomVisible = ref(false)
const editRoomVisible = ref(false)
const addBedVisible = ref(false)
const roomDetailVisible = ref(false)

// 当前操作的房间
const currentRoom = ref(null)
const currentRoomIdForBed = ref(null)

// ==================== 计算属性 ====================
const currentRoomList = computed(() => {
  if (!activeFloorId.value) return []
  return roomList.value.filter(room => room.floorId === activeFloorId.value)
})

// ==================== 生命周期 ====================
onMounted(() => {
  loadAllData()
})

// ==================== 数据加载函数 ====================
async function loadAllData() {
  await Promise.all([
    loadFloors(),
    loadRoomTypes()
  ])

  if (floorList.value.length > 0) {
    activeFloorId.value = floorList.value[0].id
    await loadRooms(activeFloorId.value)
  }
}

async function loadFloors() {
  try {
    const res = await axios.get('/floorList')
    if (res.data.code === 200) {
      floorList.value = res.data.data || []
    }
  } catch (error) {
    ElMessage.error('加载楼层失败')
  }
}

async function loadRooms(floorId) {
  try {
    const res = await axios.get('/roomList', { params: { floorId } })

    if (res.data.code === 200) {
      roomList.value = res.data.data || []

      // 清空之前的床位数据
      bedMap.value = {}

      // 加载每个房间的床位
      for (const room of roomList.value) {
        await loadBeds(room.id)
      }

    } else {
      ElMessage.error(res.data.msg || '加载房间失败')
    }
  } catch (error) {
    ElMessage.error('加载房间失败: ' + error.message)
  }
}

async function loadBeds(roomId) {
    const res = await axios.get('/bedList', { params: { roomId } })

    if (res.data.code === 200) {
      const beds = res.data.data || []
      bedMap.value[roomId] = beds

      // 收集所有有老人的床位的elderlyId
      const elderlyIds = beds
        .filter(bed => bed.elderlyId)
        .map(bed => bed.elderlyId)

      // 去重
      const uniqueElderlyIds = [...new Set(elderlyIds)]


      // 批量加载老人信息
      if (uniqueElderlyIds.length > 0) {
        await loadElderlyNames(uniqueElderlyIds)
      }
    }
  }

function getRoomBeds(roomId) {
  const beds = bedMap.value[roomId] || []
  return beds
}

function getRoomTypeName(roomTypeId) {
  if (!roomTypeId) return '-'

  const type = roomTypeList.value.find(t => t.id === roomTypeId)
  return type ? type.typeName : '-'
}

async function loadRoomTypes() {
  try {
    const res = await axios.post('/roomTypePage', { pageNum: 1, pageSize: 100 })

    if (res.data.code === 200 || res.data.roomTypes) {
      roomTypeList.value = res.data.roomTypes || []
    } else {
      ElMessage.error(res.data.msg || '加载房型失败')
    }
  } catch (error) {
    ElMessage.error('加载房型失败')
  }
}

// ==================== 工具函数 ====================

function getBedIcon(status) {
  if (status === 0) return BED_STATUS.empty
  if (status === 1) return BED_STATUS.full
  if (status === 2) return BED_STATUS.free
  return BED_STATUS.empty
}

function getStatusText(status) {
  return STATUS_TEXT[status] || '空闲'
}

function hasBeds(roomId) {
  const beds = getRoomBeds(roomId)
  return beds && beds.length > 0
}

function getElderlyName(elderlyId, elderlyName) {
  // 优先使用后端返回的elderlyName
  if (elderlyName) {
    return elderlyName
  }

  // 如果没有，尝试从缓存中查找
  if (elderlyId && elderlyMap.value[elderlyId]) {
    return elderlyMap.value[elderlyId]
  }

  return '-'
}

// 新增：批量加载老人信息
async function loadElderlyNames(elderlyIds) {
  if (!elderlyIds || elderlyIds.length === 0) return

    const res = await axios.post('/elderlyListByIds', elderlyIds)
    if (res.data.code === 200) {
      const elderlyList = res.data.data || []
      elderlyList.forEach(elderly => {
        elderlyMap.value[elderly.id] = elderly.realName
      })
    }
}

function getOccupiedBeds(roomId) {
  const beds = getRoomBeds(roomId)
  return beds.filter(bed => bed.elderlyId).length
}

function calculateOccupancyRate(roomId) {
  const beds = getRoomBeds(roomId)
  if (beds.length === 0) return '0%'
  const occupied = getOccupiedBeds(roomId)
  return `${Math.round((occupied / beds.length) * 100)}%`
}

function getRoomBedsWithElderly(roomId) {
  return getRoomBeds(roomId).map(bed => ({
    ...bed,
    elderlyName: bed.elderlyId ? getElderlyName(bed.elderlyId) : '-'
  }))
}

// ==================== 事件处理函数 ====================
async function handleFloorChange(floorId) {
  await loadRooms(floorId)
}

// ==================== 楼层操作 ====================
function openAddFloorDialog() {
  floorForm.id = null
  floorForm.floorName = ''
  floorForm.sort = 1
  addFloorVisible.value = true
}

async function saveFloor() {
  if (!floorForm.floorName) {
    ElMessage.warning('请输入楼层名称')
    return
  }

  try {
    const res = await axios.post('/saveFloor', floorForm)
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      addFloorVisible.value = false
      await loadFloors()
      // 如果是第一个楼层，自动选中
      if (floorList.value.length === 1) {
        activeFloorId.value = floorList.value[0].id
        await loadRooms(activeFloorId.value)
      }
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (error) {
    ElMessage.error('保存楼层失败')
  }
}

function openEditFloorDialog(floor) {
  floorForm.id = floor.id
  floorForm.floorName = floor.floorName
  floorForm.sort = floor.sort
  editFloorVisible.value = true
}

async function updateFloor() {
  if (!floorForm.floorName) {
    ElMessage.warning('请输入楼层名称')
    return
  }

  try {
    const res = await axios.post('/updateFloor', floorForm)
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      editFloorVisible.value = false
      await loadFloors()
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (error) {
    ElMessage.error('更新楼层失败')
  }
}

async function deleteFloor() {
  try {
    await ElMessageBox.confirm('确定要删除该楼层吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await axios.post('/deleteFloor', { id: floorForm.id })
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      editFloorVisible.value = false
      await loadFloors()
      // 如果删除的是当前楼层，切换到第一个楼层
      if (activeFloorId.value === floorForm.id && floorList.value.length > 0) {
        activeFloorId.value = floorList.value[0].id
        await loadRooms(activeFloorId.value)
      }
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除楼层失败')
    }
  }
}

// ==================== 房间操作 ====================
function openAddRoomDialog() {
  if (!activeFloorId.value) {
    ElMessage.warning('请先选择楼层')
    return
  }

  roomForm.id = null
  roomForm.roomNumber = ''
  roomForm.roomTypeId = null
  roomForm.floorId = activeFloorId.value
  roomForm.sort = 1
  addRoomVisible.value = true
}

async function saveRoom() {
  if (!roomForm.roomNumber) {
    ElMessage.warning('请输入房间号')
    return
  }
  if (!roomForm.roomTypeId) {
    ElMessage.warning('请选择房间类型')
    return
  }

  try {
    const res = await axios.post('/saveRoom', roomForm)
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      addRoomVisible.value = false
      await loadRooms(activeFloorId.value)
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (error) {
    ElMessage.error('保存房间失败')
  }
}

function openEditRoomDialog(room) {
  roomForm.id = room.id
  roomForm.roomNumber = room.roomNumber
  roomForm.roomTypeId = room.roomTypeId
  roomForm.floorId = room.floorId
  roomForm.sort = room.sort
  editRoomVisible.value = true
}

async function updateRoom() {
  if (!roomForm.roomNumber) {
    ElMessage.warning('请输入房间号')
    return
  }
  if (!roomForm.roomTypeId) {
    ElMessage.warning('请选择房间类型')
    return
  }

  try {
    const res = await axios.post('/updateRoom', roomForm)
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      editRoomVisible.value = false
      await loadRooms(activeFloorId.value)
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (error) {
    ElMessage.error('更新房间失败')
  }
}

async function deleteRoom(roomId) {
  try {
    await ElMessageBox.confirm('确定要删除该房间吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await axios.post('/deleteRoom', { id: roomId })
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      await loadRooms(activeFloorId.value)
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除房间失败')
    }
  }
}

function viewRoomDetail(room) {
  currentRoom.value = room
  roomDetailVisible.value = true
}

// ==================== 床位操作 ====================
function openAddBedDialog(roomId) {
  bedForm.id = null
  bedForm.bedNumber = ''
  bedForm.roomId = roomId
  bedForm.elderlyId = null
  bedForm.status = 0
  currentRoomIdForBed.value = roomId
  addBedVisible.value = true
}

async function saveBed() {
  if (!bedForm.bedNumber) {
    ElMessage.warning('请输入床位号')
    return
  }

  try {
    const res = await axios.post('/saveBed', bedForm)
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      addBedVisible.value = false
      await loadBeds(currentRoomIdForBed.value)
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (error) {
    ElMessage.error('保存床位失败')
  }
}

async function deleteBed(bedId) {
  try {
    await ElMessageBox.confirm('确定要删除该床位吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await axios.post('/deleteBed', { id: bedId })
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      // 重新加载所有房间的床位
      for (const room of roomList.value) {
        await loadBeds(room.id)
      }
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除床位失败')
    }
  }
}
</script>

<style scoped>
.bed-management {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 100px);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.floor-tabs {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.legend-section {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  padding: 10px 20px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-icon {
  width: 24px;
  height: 24px;
}

.room-container {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 50px;
  font-size: 16px;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.room-card {
  background: #f9f9f9;
  border-radius: 4px;
  padding: 15px;
  border: 1px solid #e0e0e0;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.room-info {
  flex: 1;
}

.room-number {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.room-type {
  font-size: 13px;
  color: #666;
}

.room-actions {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.bed-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.no-bed-tip {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 13px;
  grid-column: span 2;
}

.bed-item {
  background: white;
  border-radius: 4px;
  padding: 10px;
  border: 1px solid #e0e0e0;
}

.bed-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bed-content.occupied {
  background-color: #f0f9ff;
}

.bed-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.bed-info {
  flex: 1;
}

.bed-number {
  font-size: 13px;
  color: #333;
  margin-bottom: 3px;
}

.bed-status {
  font-size: 12px;
  color: #666;
}

.bed-actions {
  display: flex;
  gap: 5px;
}

.action-icon {
  cursor: pointer;
  color: #f56c6c;
  font-size: 16px;
}

.action-icon:hover {
  color: #ff0000;
}

.room-detail-content {
  padding: 10px;
}

.detail-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  font-size: 14px;
  color: #666;
}
</style>
