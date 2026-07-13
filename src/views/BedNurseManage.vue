<template>
  <div class="bed-nurse-manage">
    <!-- 楼层选择 -->
    <el-tabs v-model="activeFloor" @tab-click="handleFloorChange">
      <el-tab-pane
        v-for="floor in floorList"
        :key="floor.id"
        :label="floor.floorName"
        :name="String(floor.id)"
      ></el-tab-pane>
    </el-tabs>

    <!-- 房间列表 - 添加 :key 强制重新渲染 -->
    <div class="room-list" :key="'floor-' + activeFloor + '-' + refreshKey">
      <template v-for="room in roomList" :key="room.id">
        <div v-if="room.beds && room.beds.some(b => b.elderlyName)" class="room-item">
          <div class="room-header">
            <span class="room-number">房间号：{{ room.roomNumber }}</span>
            <el-button type="primary" size="small" @click="batchSetNurses(room.id)">
              批量设置护理员
            </el-button>
          </div>

          <div class="bed-grid">
            <template v-for="bed in room.beds" :key="bed.id">
              <div v-if="bed.elderlyName" class="bed-item">
                <div class="bed-info">
                  <div class="bed-number">床位号：{{ bed.bedNumber }}</div>
                  <el-button type="text" size="small" @click="setNurse(bed.id)">
                    设置护理员
                  </el-button>
                </div>
                <div class="elderly-info">
                  <span>老人姓名：{{ bed.elderlyName }}</span>
                </div>
                <div class="nurse-info">
                  <span>护理员姓名：</span>
                  <el-tag
                    v-for="nurse in bed.nurses"
                    :key="nurse.id"
                    size="small"
                    style="margin-right: 5px;"
                  >
                    {{ nurse.realname }}
                  </el-tag>
                  <span v-if="!bed.nurses || bed.nurses.length === 0" style="color: #999;">
                    当前床位没有安排护理员
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- 如果没有房间，显示提示 -->
      <div v-if="roomList.length === 0 && !loading" class="empty-tip">
        该楼层暂无房间
      </div>
    </div>

    <!-- 设置护理员对话框 -->
    <el-dialog
      v-model="nurseDialogVisible"
      title="设置护理员"
      width="400px"
    >
      <el-form :model="nurseForm" label-width="100px">
        <el-form-item label="护理员姓名" required>
          <el-select
            v-model="nurseForm.nurseIds"
            multiple
            placeholder="请选择"
            style="width: 100%"
            collapse-tags
            max-collapse-tags="4"
          >
            <el-option
              v-for="nurse in allNurses"
              :key="nurse.id"
              :label="nurse.realname"
              :value="nurse.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="nurseDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSetNurses">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const activeFloor = ref('1');
const roomList = ref([]);
const allNurses = ref([]);
const nurseDialogVisible = ref(false);
const currentBedId = ref(null);
const currentRoomId = ref(null);
const loading = ref(false);
const refreshKey = ref(0);
const floorList = ref([]);
let requestCounter = 0;

const nurseForm = reactive({
  nurseIds: []
});

// 加载楼层列表
function loadFloors() {
  axios.get('/floor/list').then(response => {
    if (response.data.code === 200) {
      floorList.value = response.data.floors || [];
      if (floorList.value.length > 0) {
        activeFloor.value = String(floorList.value[0].id);
        // 楼层加载完成后再加载房间数据
        loadRoomData();
      }
    }
  }).catch(error => {
    console.error('加载楼层列表失败:', error);
  });
}

// 加载房间和床位数据
function loadRoomData() {
  requestCounter++;
  const currentRequest = requestCounter;

  console.log('========== 开始加载楼层:', activeFloor.value, '请求ID:', currentRequest, '==========');
  loading.value = true;
  refreshKey.value++;

  roomList.value = [];

  const currentFloor = floorList.value.find(f => String(f.id) === activeFloor.value);
  const floorName = currentFloor ? currentFloor.floorName : activeFloor.value;

  console.log('请求楼层名称:', floorName);

  axios.get('/bed/listByFloor?floor=' + encodeURIComponent(floorName))
    .then(response => {
      if (currentRequest !== requestCounter) {
        console.log('请求已过期，忽略响应 (请求ID:', currentRequest, '当前:', requestCounter, ')');
        return;
      }

      console.log('后端返回数据:', response.data);
      if (response.data.code === 200) {
        const rooms = response.data.rooms || [];
        console.log('获取到的房间数量:', rooms.length);

        roomList.value = [...rooms];

        const promises = [];
        roomList.value.forEach((room, roomIndex) => {
          console.log(`处理房间 ${roomIndex + 1}:`, room.roomNumber, '床位数量:', room.beds ? room.beds.length : 0);

          if (room.beds && room.beds.length > 0) {
            room.beds.forEach((bed, bedIndex) => {
              console.log(`  处理床位 ${bedIndex + 1}:`, bed.bedNumber);
              const promise = loadBedNurses(bed.id, bed);
              promises.push(promise);
            });
          }
        });

        Promise.all(promises).then(() => {
          if (currentRequest !== requestCounter) return;
          console.log('========== 所有数据加载完成 ==========');
          loading.value = false;
        }).catch(err => {
          if (currentRequest !== requestCounter) return;
          console.error('加载护理员数据失败:', err);
          loading.value = false;
        });
      } else {
        ElMessage.error(response.data.msg || '加载失败');
        loading.value = false;
      }
    })
    .catch(error => {
      if (currentRequest !== requestCounter) return;
      console.error('加载房间数据失败:', error);
      ElMessage.error('加载房间数据失败');
      loading.value = false;
    });
}

// 加载床位的护理员
function loadBedNurses(bedId, bed) {
  return axios.get('/bedNurse/list?bedId=' + bedId)
    .then(response => {
      if (response.data.code === 200) {
        const nurseIds = response.data.nurseIds || [];
        console.log('  床位', bedId, '的护理员IDs:', nurseIds);

        if (nurseIds && nurseIds.length > 0) {
          return Promise.all(nurseIds.map(id =>
            axios.get('/user/detail?id=' + id)
          )).then(responses => {
            bed.nurses = responses.map(r => r.data.user);
            console.log('  床位', bedId, '的护理员详情:', bed.nurses.map(n => n.realName));
          });
        } else {
          bed.nurses = [];
          console.log('  床位', bedId, '没有护理员');
        }
      }
    })
    .catch(error => {
      console.error('  加载床位', bedId, '的护理员失败:', error);
      bed.nurses = [];
    });
}

// 加载所有护理员列表
function loadAllNurses() {
  axios.post('/user/nurseList', {
    pageNum: 1,
    pageSize: 100
  }).then(response => {
    if (response.data.code === 200) {
      allNurses.value = response.data.users || [];
      console.log('所有护理员:', allNurses.value.map(n => n.realname));
    }
  }).catch(error => {
    console.error('加载护理员列表失败:', error);
  });
}

// 切换楼层
function handleFloorChange() {
  console.log('========== 切换楼层到:', activeFloor.value, '==========');
  loadRoomData();
}

// 设置单个床位护理员
function setNurse(bedId) {
  currentBedId.value = bedId;
  currentRoomId.value = null;

  axios.get('/bedNurse/list?bedId=' + bedId)
    .then(response => {
      if (response.data.code === 200) {
        nurseForm.nurseIds = response.data.nurseIds || [];
      }
    });

  nurseDialogVisible.value = true;
}

// 批量设置房间护理员
function batchSetNurses(roomId) {
  currentRoomId.value = roomId;
  currentBedId.value = null;
  nurseForm.nurseIds = [];
  nurseDialogVisible.value = true;
}

// 确认设置护理员
function confirmSetNurses() {
  if (!nurseForm.nurseIds || nurseForm.nurseIds.length === 0) {
    ElMessage.warning('请选择护理员');
    return;
  }

  if (nurseForm.nurseIds.length > 4) {
    ElMessage.warning('最多只能选择4个护理员');
    return;
  }

  if (currentBedId.value) {
    axios.post('/bedNurse/set?bedId=' + currentBedId.value, nurseForm.nurseIds)
      .then(response => {
        if (response.data.code === 200) {
          ElMessage.success('设置成功');
          nurseDialogVisible.value = false;
          loadRoomData();
        } else {
          ElMessage.error(response.data.msg);
        }
      })
      .catch(error => {
        ElMessage.error('设置失败');
      });
  } else if (currentRoomId.value) {
    axios.post('/bedNurse/batchSet?roomId=' + currentRoomId.value, nurseForm.nurseIds)
      .then(response => {
        if (response.data.code === 200) {
          ElMessage.success('批量设置成功');
          nurseDialogVisible.value = false;
          loadRoomData();
        } else {
          ElMessage.error(response.data.msg);
        }
      })
      .catch(error => {
        ElMessage.error('批量设置失败');
      });
  }
}

onMounted(() => {
  loadFloors();
  loadAllNurses();
});
</script>

<style scoped>
.bed-nurse-manage {
  padding: 20px;
}

.room-list {
  margin-top: 20px;
}

.empty-tip {
  text-align: center;
  padding: 50px;
  color: #999;
  font-size: 16px;
}

.room-item {
  border: 1px solid #e0e0e0;
  padding: 15px;
  margin-bottom: 20px;
  background: #fff;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.room-number {
  font-size: 16px;
  font-weight: bold;
}

.bed-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.bed-item {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
}

.bed-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.bed-number {
  font-weight: bold;
}

.elderly-info {
  margin-bottom: 8px;
}

.nurse-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
</style>
