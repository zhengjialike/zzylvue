<template>
  <div class="smart-bed-monitor">
    <!-- 楼层Tab -->
    <el-tabs v-model="activeFloorId" @tab-change="handleFloorChange" class="floor-tabs">
      <el-tab-pane
        v-for="floor in floorList"
        :key="floor.id"
        :label="floor.floorName"
        :name="floor.id">
        <template #label>
          <span>{{ floor.floorName }}</span>
          <el-badge v-if="floor.hasAlert" is-dot type="danger" style="margin-left: 5px;" />
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 房间列表 -->
    <div class="room-container">
      <div v-for="room in currentRoomList" :key="room.id" class="room-card">
        <!-- 房间头部 -->
        <div class="room-header">
          <div class="room-info">
            <span class="room-number">房间号：{{ room.roomNumber }}</span>
            <el-tooltip placement="top">
              <template #content>
                <div v-for="device in room.devices" :key="device.id">
                  {{ device.productName }} - {{ device.deviceName }}
                </div>
              </template>
              <el-icon><Monitor /></el-icon>
            </el-tooltip>
          </div>
          <div class="room-status">
            <span>房门状态：开启</span>
            <span>温度：26°C</span>
            <span>湿度：40%</span>
            <span :class="room.hasAlert ? 'status-alert' : 'status-normal'">
              报警状态：{{ room.hasAlert ? '异常' : '正常' }}
            </span>
          </div>
        </div>

        <!-- 床位网格 -->
        <div class="bed-grid">
          <div v-for="bed in getRoomBeds(room.id)" :key="bed.id"
               class="bed-card"
               :class="{ 'bed-alert': bed.hasAlert }">

            <!-- 床位信息 -->
            <div class="bed-header">
              <span>床位号：{{ bed.bedNumber }}</span>
              <div class="bed-icons">
                <el-tooltip v-for="device in bed.devices" :key="device.id" placement="top">
                  <template #content>
                    {{ device.productName }} - {{ device.deviceName }}
                  </template>
                  <el-icon><Monitor /></el-icon>
                </el-tooltip>
              </div>
            </div>

            <!-- 老人信息 -->
            <div class="elderly-info">
              <span>老人姓名：{{ bed.elderlyName }}</span>
            </div>

            <!-- 未绑定老人提示 -->
            <div v-if="bed.elderlyName === '-'" class="no-elderly-tip">
              当前床位没有安排老人
            </div>

            <!-- 设备功能显示 -->
            <div v-else class="device-functions">
              <div v-for="device in bed.devices" :key="device.id" class="function-item">
                <div v-for="func in device.functions" :key="func" class="function-row">
                  <span class="function-name">{{ func }}：</span>
                  <span :class="getFunctionAlertStatus(bed.alertInfo, func)">
                    {{ getFunctionValue(bed.alertInfo, func) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Monitor } from '@element-plus/icons-vue'

// 当前选中的楼层
const activeFloorId = ref(null)

// 数据列表
const floorList = ref([])
const roomList = ref([])
const bedMap = ref({})

// 当前楼层的房间列表
const currentRoomList = computed(() => {
  if (!activeFloorId.value) return []
  return roomList.value.filter(room => room.floorId === activeFloorId.value)
})

// ---------- 加载楼层列表 ----------
function loadFloors() {
  axios.get('/smartBed/getFloorsWithDevices')
    .then(response => {
      if (response.data.code === 200) {
        floorList.value = response.data.data || []
        if (floorList.value.length > 0) {
          activeFloorId.value = floorList.value[0].id
          loadRooms(activeFloorId.value)
        }
      } else {
        ElMessage.error(response.data.msg || '加载失败')
      }
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('网络错误')
    })
}

// ---------- 加载房间列表 ----------
function loadRooms(floorId) {
  axios.get('/smartBed/getRoomsWithDevices', { params: { floorId } })
    .then(response => {
      if (response.data.code === 200) {
        roomList.value = response.data.data || []

        // 加载每个房间的床位
        roomList.value.forEach(room => {
          loadBeds(room.id)
        })
      } else {
        ElMessage.error(response.data.msg || '加载失败')
      }
    })
    .catch(error => {
      console.error(error)
      ElMessage.error('网络错误')
    })
}

// ---------- 加载床位列表 ----------
function loadBeds(roomId) {
  axios.get('/smartBed/getBedsWithDevices', { params: { roomId } })
    .then(response => {
      if (response.data.code === 200) {
        bedMap.value[roomId] = response.data.data || []
      }
    })
    .catch(error => {
      console.error(error)
    })
}

// ---------- 获取房间床位 ----------
function getRoomBeds(roomId) {
  return bedMap.value[roomId] || []
}

// ---------- 获取房间所属楼层ID（从后端返回的数据中获取）----------
function getRoomFloorId(roomId) {
  const room = roomList.value.find(r => r.id === roomId)
  return room ? room.floorId : null
}

// ---------- 楼层切换 ----------
function handleFloorChange(floorId) {
  loadRooms(floorId)
}

// ---------- 获取功能报警状态 ----------
function getFunctionAlertStatus(alertInfo, functionName) {
  if (!alertInfo || alertInfo.length === 0) {
    return 'status-normal'
  }

  // 查找该功能的未处理报警
  const unresolvedAlert = alertInfo.find(alert =>
    alert.functionName === functionName && !alert.isResolved
  )

  return unresolvedAlert ? 'status-alert' : 'status-normal'
}

// ---------- 获取功能值 ----------
function getFunctionValue(alertInfo, functionName) {
  if (!alertInfo || alertInfo.length === 0) {
    return '正常'
  }

  // 查找该功能的未处理报警
  const unresolvedAlert = alertInfo.find(alert =>
    alert.functionName === functionName && !alert.isResolved
  )

  if (unresolvedAlert) {
    return unresolvedAlert.dataValue
  }

  return '正常'
}

// ---------- 生命周期 ----------
onMounted(() => {
  loadFloors()
})
</script>

<style scoped>
.smart-bed-monitor {
  padding: 20px;
}

.floor-tabs {
  margin-bottom: 20px;
}

.room-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.room-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  background: #fff;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.room-number {
  font-size: 16px;
  font-weight: bold;
}

.room-status {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.status-normal {
  color: #67c23a;
}

.status-alert {
  color: #f56c6c;
  font-weight: bold;
}

.bed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.bed-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  background: #f5f7fa;
}

.bed-alert {
  background: #fef0f0;
  border-color: #f56c6c;
}

.bed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.bed-icons {
  display: flex;
  gap: 5px;
}

.elderly-info {
  margin-bottom: 10px;
  font-size: 14px;
}

.no-elderly-tip {
  color: #909399;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

.device-functions {
  margin-top: 10px;
}

.function-item {
  margin-bottom: 8px;
}

.function-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 4px;
}

.function-name {
  color: #606266;
}
</style>